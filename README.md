# Napuch AI CRM

A personal sales pipeline CRM for tracking Napuch AI's business leads. Single-user,
manual data entry, built to run on its own — not part of any other project.

## Tech stack

- **Next.js 16** (App Router, React 19, TypeScript strict)
- **Tailwind CSS v4** for styling
- **Prisma 7** + **libSQL/Turso** (via `@prisma/adapter-libsql/web`, the HTTP-based
  client) for data — this is what lets the app run on Cloudflare Workers, which has
  no filesystem
- **Cloudflare Workers** (via `@opennextjs/cloudflare`) for hosting

## Getting started

The app always talks to libSQL over HTTP, so it needs a real libSQL endpoint even
locally — there's no local-file SQLite mode. Cheapest option, no cloud account:

```bash
npm install -g @tursodatabase/cli   # or: curl -sSfL https://get.tur.so/install.sh | bash
turso dev                            # starts a local libSQL-compatible server
```

Then, in another terminal:

```bash
npm install
cp .env.example .env
# .env: DATABASE_URL="http://127.0.0.1:8080", DATABASE_AUTH_TOKEN=""
npx prisma migrate dev
npm run db:seed   # optional — a handful of example leads so the app isn't empty
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To use a real hosted
[Turso](https://turso.tech) database instead of `turso dev`, set `DATABASE_URL`
to its `libsql://...` URL and `DATABASE_AUTH_TOKEN` to a token from
`turso db tokens create`.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (plain Next.js) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:seed` | Seed the database with example leads |
| `npx prisma studio` | Browse/edit the database in a GUI |
| `npx prisma migrate dev` | Apply schema changes during development |
| `npm run preview` | Build for Cloudflare and run it locally via Wrangler |
| `npm run deploy` | Build for Cloudflare and deploy to Workers |
| `npm run cf-typegen` | Regenerate `cloudflare-env.d.ts` after changing `wrangler.jsonc` |

## Data model & architecture

- `prisma/schema.prisma` — `Lead` and `Activity` models. SQLite has no native
  enum type, so status/channel/activity-type are plain strings; the allowed
  values and their labels live in `src/lib/constants.ts` and are validated
  in the data-access layer before anything is written.
- `src/lib/leads.ts` — the **only** place that talks to the database
  (`createLead`, `updateLead`, `addActivity`, `getLeads`, `getDashboardStats`,
  etc.). The UI never calls Prisma directly.
- `src/app/actions/leads.ts` — thin Server Action wrappers around
  `lib/leads.ts` that parse form data and handle redirects.
- `src/lib/db.ts` — the Prisma client. It's created lazily, reading
  `DATABASE_URL`/`DATABASE_AUTH_TOKEN` from the Cloudflare Workers runtime
  context when deployed there, or from `process.env` for plain Node. It's
  lazy on purpose: Next.js can evaluate this module during `next build`
  (e.g. tracing a Server Action referenced from a static page), and eagerly
  reading env at that point would capture the *build machine's* environment
  instead of the deployed request's.

This split is deliberate: a future automated integration (a WhatsApp
webhook, a website contact-form handler) can call `createLead()` from a
route handler exactly the way a form does today, with no changes to the
data layer or the UI.

## Deploying to Cloudflare Workers

The app is set up with [OpenNext for Cloudflare](https://opennext.js.org/cloudflare),
which adapts the Next.js build into a Cloudflare Worker (`wrangler.jsonc`,
`open-next.config.ts`). No incremental/ISR cache is configured — every page here
renders dynamically per-request from Prisma, so there's nothing for a cache to help
with; see [caching](https://opennext.js.org/cloudflare/caching) if that changes later.

1. **Database.** Create a [Turso](https://turso.tech) database (free tier):
   ```bash
   turso db create napuch-ai-crm
   turso db show napuch-ai-crm --url          # → DATABASE_URL
   turso db tokens create napuch-ai-crm        # → DATABASE_AUTH_TOKEN
   ```
   Apply the schema to it once:
   ```bash
   DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." npx prisma migrate deploy
   ```
2. **Cloudflare auth.** Either run `npx wrangler login` (opens a browser), or set
   `CLOUDFLARE_API_TOKEN` (and `CLOUDFLARE_ACCOUNT_ID` if your account has more than
   one) as environment variables — needed for any `wrangler`/`opennextjs-cloudflare`
   command below.
3. **Secrets.** Set the two DB vars as Worker secrets (not plaintext — they aren't
   in `wrangler.jsonc`):
   ```bash
   npx wrangler secret put DATABASE_URL
   npx wrangler secret put DATABASE_AUTH_TOKEN
   ```
4. **Deploy:**
   ```bash
   npm run deploy
   ```
   This runs `opennextjs-cloudflare build` (Next.js build + adapts it for
   Workers) then `opennextjs-cloudflare deploy` (`wrangler deploy`).

To try it locally against Wrangler's simulated Workers runtime first, set
`DATABASE_URL`/`DATABASE_AUTH_TOKEN` in `.dev.vars` (see `.dev.vars.example`,
already gitignored) and run `npm run preview` instead.

### Deploying via the Cloudflare dashboard (no CLI/token needed)

Steps 1 (Turso) and 3 (secrets) above still apply — a git-connected deploy still
needs a real database and the secrets set somewhere. For the build/deploy itself:

1. **dash.cloudflare.com → Workers & Pages → Create → Connect to Git** → pick
   this repo (`napuch-ai-crm`) and the `main` branch.
2. Build settings:
   - **Build command:** `npm run build:worker`
   - **Deploy command:** leave the default (`npx wrangler deploy`) — Cloudflare
     runs this itself after the build; don't use `npm run deploy` here, it would
     try to deploy a second time.
   - **Root directory:** `/` (default)
3. Under the Worker's **Settings → Variables and Secrets**, add `DATABASE_URL`
   and `DATABASE_AUTH_TOKEN` as **secrets** (not plaintext vars).
4. Save — Cloudflare builds and deploys now, and again on every push to `main`.

Since this is a single-user internal tool with no login screen, consider putting
it behind [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)
so it isn't publicly reachable.

### Why the web/HTTP libSQL client

`@prisma/adapter-libsql`'s default (Node-native) client won't bundle for Workers —
Cloudflare has no real filesystem or raw TCP sockets. The app instead always uses
`@prisma/adapter-libsql/web`, the HTTP-based client, which works identically from
plain Node too. One consequence worth knowing if you touch `next.config.ts`:
`@libsql/client`'s web build statically imports its WebSocket transport
(`@libsql/hrana-client` → `@libsql/isomorphic-ws`), and Next's build-time file
tracer resolves that package under Node's export conditions — so it leaves the
`workerd`-specific file out of the traced output, even though the app only ever
uses plain HTTPS. `outputFileTracingIncludes` in `next.config.ts` forces it back in;
if a future `@libsql/client` upgrade changes that package's file layout, that's the
first place to look if a Workers build starts failing with a "Could not resolve"
esbuild error for `@libsql/isomorphic-ws`.
