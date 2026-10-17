"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { NAV } from "@/lib/nav";

// Phone par sidebar ki jagah neeche ka menu (angootha aasani se pahunchta hai)
export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user } = useAuth();
  const items = NAV.filter((n) => !n.ownerOnly || user.role === "OWNER"); // staff ko sirf zaroori screens
  return (
    <nav style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }} className="fixed inset-x-0 bottom-0 z-20 grid border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`flex h-16 flex-col items-center justify-center gap-1 px-0.5 text-[11px] font-medium ${active ? "text-emerald-700" : "text-stone-600"}`}>
            <span className={`grid h-7 w-12 place-items-center rounded-full ${active ? "bg-emerald-100" : ""}`}><Icon className="size-5" aria-hidden /></span>
            <span className="w-full truncate text-center">{t(label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
