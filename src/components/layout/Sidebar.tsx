"use client";
import { ChevronsLeft, ChevronsRight, Sprout } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { NAV } from "@/lib/nav";

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user } = useAuth();
  const items = NAV.filter((n) => !n.ownerOnly || user.role === "OWNER"); // staff ko sirf zaroori screens
  return (
    <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-stone-200 bg-white transition-[width] duration-200 md:flex ${collapsed ? "w-[4.5rem]" : "w-64"}`}>
      <div className="flex h-16 items-center gap-3 border-b border-stone-100 px-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white"><Sprout className="size-5" /></span>
        {!collapsed && <span className="font-semibold">Agri Shop</span>}
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} title={t(label)} aria-current={active ? "page" : undefined}
              className={`flex h-12 items-center gap-3 rounded-xl px-3 text-base font-medium transition-colors ${active ? "bg-emerald-600 text-white shadow-sm" : "text-stone-700 hover:bg-emerald-50 hover:text-emerald-800"}`}>
              <Icon className="size-5 shrink-0" aria-hidden />
              {!collapsed && t(label)}
            </Link>
          );
        })}
      </nav>
      <button onClick={onToggle} aria-label={t("nav.collapse")} className="m-3 flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-stone-600 hover:bg-stone-100">
        {collapsed ? <ChevronsRight className="size-5" /> : <><ChevronsLeft className="size-5" /> {t("nav.collapse")}</>}
      </button>
    </aside>
  );
}
