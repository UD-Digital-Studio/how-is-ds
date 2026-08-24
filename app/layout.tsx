import type { Metadata } from "next";
import "./globals.css";
import { getLocale } from "@/lib/i18n";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { TranslationLayer } from "@/components/translation-layer";

export const metadata: Metadata = {
  title: "How's DS — Project follow-up",
  description: "A clear view of every project, milestone and client report.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale=await getLocale();
  return (
    <html lang={locale}>
      <body><TranslationLayer locale={locale}/><div className="global-locale"><LocaleSwitcher locale={locale}/></div>{children}</body>
    </html>
  );
}
