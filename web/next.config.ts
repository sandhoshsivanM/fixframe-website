import type { NextConfig } from "next";

// GitHub Pages serves this project from a subpath —
// https://<user>.github.io/<repo>/ — and can only serve static files.
//
// Both behaviours are gated on an environment variable rather than baked in,
// so `npm run dev` and a normal server deployment (Vercel) are unchanged.
// The Pages workflow sets NEXT_PUBLIC_BASE_PATH and PAGES=1.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const isPages = process.env.PAGES === "1";

const nextConfig: NextConfig = {
  ...(isPages
    ? {
        output: "export" as const,
        // Pages has no rewrite layer, so /work must resolve to a real
        // /work/index.html rather than relying on a server to find it.
        trailingSlash: true,
        basePath,
      }
    : {}),
};

export default nextConfig;
