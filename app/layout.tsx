import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getLocale } from "@/lib/i18n";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { TranslationLayer } from "@/components/translation-layer";
import { AppNavigation } from "@/components/app-navigation";
import { ModalForms } from "@/components/modal-forms";
import { InstallPrompt } from "@/components/install-prompt";
import { getSession } from "@/lib/auth";
import { canOwnProjects } from "@/lib/access";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "How's DS — Project follow-up",
  description: "A clear view of every project, milestone and client report.",
  icons: {
    icon: [{ url: "/favicon.webp", type: "image/webp" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    shortcut: "/favicon.webp",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "How's DS" },
};

export const viewport: Viewport = {
  themeColor: "#00aebb",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const session = await getSession();
  let navigation: { role: string; projects: { id: string; name: string }[] } | null = null;
  if (session) {
    const access = await db.query(`select pm.role,p.id,p.name from project_members pm
      join projects p on p.id=pm.project_id where pm.user_id=$1 order by p.name`, [session.userId]);
    if (access.rowCount) {
      const roles = access.rows.map((item) => item.role);
      const role = roles.includes("OWNER") ? "OWNER" : roles.includes("PRODUCT_OWNER") ? "PRODUCT_OWNER" : roles.includes("MANAGER") ? "MANAGER" : "CLIENT";
      navigation = { role, projects: access.rows.map((item) => ({ id: item.id, name: item.name })) };
    } else {
      navigation = { role: (await canOwnProjects(session.userId)) ? "OWNER" : "CLIENT", projects: [] };
    }
  }
  return (
    <html lang={locale}>
      <body><TranslationLayer locale={locale}/>
        {session && navigation ? <AppNavigation name={session.name} role={navigation.role} projects={navigation.projects} locale={locale}/> : <div className="global-locale"><LocaleSwitcher locale={locale}/></div>}
        <div className={session && navigation ? "authenticated-content" : ""}>{children}</div>
        {session && navigation && <ModalForms/>}
        <InstallPrompt/>
      </body>
    </html>
  );
}
