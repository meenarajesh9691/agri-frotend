"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { SubscriptionBanner } from "./SubscriptionBanner";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [manual, setManual] = useState<boolean | null>(null);
  // Billing par sidebar apne aap chhota (cart ko zyada jagah), baaki jagah bada. Button se badal sakte hain.
  const collapsed = manual ?? pathname.startsWith("/billing");

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setManual(!collapsed)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <SubscriptionBanner />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
