import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { withPublicBasePath } from "@/lib/base-path";

const APP_ICON = withPublicBasePath("/logocrop.png");

export const metadata: Metadata = {
  title: "Porra Technip — Mundial 2026",
  description:
    "Cuadro eliminatorio y ranking interno para el Mundial 2026. Registro con email y contraseña.",
  applicationName: "Technip Mundial 2026",
  manifest: withPublicBasePath("/manifest.webmanifest"),
  icons: {
    icon: [{ url: APP_ICON, type: "image/png" }],
    apple: [{ url: APP_ICON, type: "image/png" }],
    shortcut: [APP_ICON],
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
