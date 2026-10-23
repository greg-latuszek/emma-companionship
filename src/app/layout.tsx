import type { Metadata, Viewport } from "next";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { currentLocale, currentTranslator } from "@/i18n/current-locale";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { messagesFor } from "@/i18n/messages";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const translate = await currentTranslator();
  return {
    title: translate("app.title"),
    description: translate("app.description"),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await currentLocale();

  return (
    <html lang={locale}>
      <body className="h-full antialiased">
        <LocaleProvider locale={locale} messages={messagesFor(locale)}>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
