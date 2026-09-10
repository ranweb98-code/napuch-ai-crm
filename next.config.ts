import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @libsql/client's web build statically imports its WebSocket transport
  // (@libsql/hrana-client -> @libsql/isomorphic-ws), whose workerd-specific
  // file Next's build-time file tracer resolves under Node conditions and
  // so leaves out of the traced output. Force it in so the Cloudflare
  // Workers esbuild pass (which resolves under workerd conditions) can
  // find it, even though the app only ever uses the plain HTTPS transport.
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/@libsql/isomorphic-ws/web.mjs",
      "./node_modules/@libsql/isomorphic-ws/web.cjs",
    ],
  },
};

export default nextConfig;

// Enables Cloudflare bindings (env vars, etc.) in `next dev`, matching how
// the app runs once deployed to Cloudflare Workers.
import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
