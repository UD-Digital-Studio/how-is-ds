import type { Metadata } from "next";
import "./globals.css";
import { getLocale } from "@/lib/i18n";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { TranslationLayer } from "@/components/translation-layer";
import { AppNavigation } from "@/components/app-navigation";
import { ModalForms } from "@/components/modal-forms";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "How's DS — Project follow-up",
  description: "A clear view of every project, milestone and client report.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const session = await getSession();
  let navigation: { role: string; projectCount: number } | null = null;
  if (session) {
    const access = await db.query(`select case when bool_or(role='OWNER') then 'OWNER'
      when bool_or(role='MANAGER') then 'MANAGER' else 'CLIENT' end role,
      count(distinct project_id)::int project_count from project_members where user_id=$1`, [session.userId]);
    if (access.rows[0]?.project_count) {
      navigation = { role: access.rows[0].role, projectCount: access.rows[0].project_count };
    }
  }
  return (
    <html lang={locale}>
      <body><TranslationLayer locale={locale}/>
        {session && navigation ? <AppNavigation name={session.name} role={navigation.role} projectCount={navigation.projectCount} locale={locale}/> : <div className="global-locale"><LocaleSwitcher locale={locale}/></div>}
        <div className={session && navigation ? "authenticated-content" : ""}>{children}</div>
        {session && navigation && <ModalForms/>}
      </body>
    </html>
  );
}
