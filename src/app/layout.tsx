import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

export const metadata: Metadata = {
  title: "Porra Technip — Mundial 2026",
  description:
    "Cuadro eliminatorio y ranking interno para el Mundial 2026. Registro con email y contraseña.",
  applicationName: "Technip Mundial 2026",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Technip 2026",
  },
  openGraph: {
    title: "Porra Technip — Mundial 2026",
    description:
      "Cuadro oficial vs tus picks: una sola clasificación global.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0070EF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-on-background antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
