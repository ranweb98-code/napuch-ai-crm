# Napuch AI CRM

A personal sales pipeline CRM for tracking Napuch AI's business leads. Single-user,
manual data entry, built to run on its own — not part of any other project.

## Tech stack

- **Next.js 16** (App Router, React 19, TypeScript strict)
- **Tailwind CSS v4** for styling
- **Prisma 7** + **SQLite** (via the `@prisma/adapter-libsql` driver adapter) for data

## Getting started

```bash
npm install
npm run db:seed   # optional — a handful of example leads so the app isn't empty
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first run creates
`prisma/dev.db`, a local SQLite file — nothing else to configure.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:seed` | Seed the database with example leads |
| `npx prisma studio` | Browse/edit the database in a GUI |
| `npx prisma migrate dev` | Apply schema changes during development |

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

This split is deliberate: a future automated integration (a WhatsApp
webhook, a website contact-form handler) can call `createLead()` from a
route handler exactly the way a form does today, with no changes to the
data layer or the UI.

## Deploying (Vercel)

Vercel's filesystem is ephemeral and read-only in production, so a plain
local SQLite file won't persist there. The app already uses the libSQL
driver adapter, so pointing it at a hosted libSQL database (e.g.
[Turso](https://turso.tech), which has a free tier) is a two-env-var change
— no code changes and no migration to Postgres needed:

1. Create a Turso database and grab its `libsql://...` URL and an auth
   token (`turso db create napuch-ai-crm`, then `turso db tokens create`).
2. In the Vercel project's environment variables, set:
   - `DATABASE_URL` → the `libsql://...` URL
   - `DATABASE_AUTH_TOKEN` → the auth token
3. Apply the schema to that database once, from your machine:
   ```bash
   DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." npx prisma migrate deploy
   ```
4. Deploy. `postinstall` runs `prisma generate` automatically as part of
   the build.

Locally, `.env` keeps using `DATABASE_URL="file:./prisma/dev.db"` with an
empty `DATABASE_AUTH_TOKEN` — see `.env.example`.

Since this is a single-user internal tool with no login screen, consider
turning on Vercel's [deployment protection](https://vercel.com/docs/deployment-protection)
(password or SSO) so it isn't publicly reachable.
