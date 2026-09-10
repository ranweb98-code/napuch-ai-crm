// open-next.config.ts created for the Cloudflare Workers deployment.
//
// No incremental cache is configured: every page in this app is rendered
// dynamically per-request from Prisma/Turso (dashboard, leads list, and
// lead detail all opt out of static caching), so there's no ISR/fetch
// cache to back with an R2 bucket. Add one later (see
// https://opennext.js.org/cloudflare/caching) if that changes.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
