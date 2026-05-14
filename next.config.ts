import type { NextConfig } from "next";

const rawBase = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim().replace(/\/$/, "");
const basePath =
  !rawBase ? undefined : rawBase.startsWith("/") ? rawBase : `/${rawBase}`;

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  /** Despliegue Node (IIS ARR, servicio Windows, contenedor): carpeta `.next/standalone`. */
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
