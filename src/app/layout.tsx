import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "emaCompanionship - Serwis dla Delegatów ds. Akompaniamentów",
  description: "Emmanuel Community - Serwis dla Delegatów ds. Akompaniamentów",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
