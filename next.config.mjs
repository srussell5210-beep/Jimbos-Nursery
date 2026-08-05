/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // Without this, file tracing pulls .netlify (including the previous
    // deploy's function zip) into .next/standalone, so each deploy's bundle
    // embeds the last one and compounds.
    outputFileTracingExcludes: {
      "*": [".netlify/**"],
    },
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
