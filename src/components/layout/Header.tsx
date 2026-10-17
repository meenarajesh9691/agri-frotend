"use client";
import { Bell, LogOut } from "lucide-react";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { LangToggle } from "@/components/ui/LangToggle";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";

const initials = (name: string) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export function Header() {
  const { t } = useI18n();
  const { user, shop, logout } = useAuth();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-stone-200 bg-white/90 px-4 backdrop-blur md:gap-4 md:px-6">
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <LangToggle />
        <button aria-label={t("header.notifications")} className="relative hidden size-11 place-items-center rounded-xl border border-stone-200 hover:bg-stone-50 sm:grid">
          <Bell className="size-5 text-stone-700" />
        </button>
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-emerald-100 font-semibold text-emerald-800">{initials(user.name)}</span>
          <div className="hidden leading-tight lg:block">
            <p className="text-sm font-medium">{user.name} <span className="text-stone-600">· {t(user.role === "OWNER" ? "role.owner" : "role.staff")}</span></p>
            <p className="text-xs text-stone-600">{shop.name}</p>
          </div>
        </div>
        <button onClick={logout} aria-label={t("nav.logout")} title={t("nav.logout")} className="grid size-11 place-items-center rounded-xl border border-stone-200 text-stone-700 hover:bg-red-50 hover:text-red-700">
          <LogOut className="size-5" />
        </button>
      </div>
    </header>
  );
}
