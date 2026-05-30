import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorker } from "@/components/ServiceWorker";
import { ZoomGuard } from "@/components/ZoomGuard";

export const metadata: Metadata = {
  title: "Erident — Cabinet stomatologic",
  description: "Aplicație internă Erident pentru cabinetul stomatologic",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Erident" },
};

export const viewport: Viewport = {
  themeColor: "#005dac",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface antialiased">
        {children}
        <ServiceWorker />
        <ZoomGuard />
      </body>
    </html>
  );
}
