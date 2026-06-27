import type { NextConfig } from "next";

// Env-driven base path: unset → app runs at "/" in local dev; CI sets it to the
// repo name ("/andco-takehome") so the static export resolves under GitHub Pages.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export", // emits ./out (Turbopack is the default build engine in Next 16)
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true }, // the default optimizer is unsupported under output: 'export'
  trailingSlash: true, // per-route index.html → clean subpath resolution on Pages
};

export default nextConfig;
