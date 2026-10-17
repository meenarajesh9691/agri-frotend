"use client";
import { ReceiptText } from "lucide-react";
import Link from "next/link";
import { ExpiryAlerts } from "@/components/dashboard/ExpiryAlerts";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { OwnerOnly } from "@/components/auth/OwnerOnly";
import { PageTitle } from "@/components/ui/PageTitle";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";

export default function DashboardPage() {
  const { t } = useI18n();
  const { user, shop } = useAuth();
  return (
    <OwnerOnly>
      <PageTitle
        title={t("dash.greeting", { name: user.name })}
        sub={`${shop.name} · ${t("dash.sub")}`}
        action={
          <Link href="/billing" className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-base font-medium text-white shadow-sm hover:bg-emerald-700">
            <ReceiptText className="size-5" /> {t("dash.newBill")}
          </Link>
        }
      />
      <StatsCards />
      <ExpiryAlerts />
    </OwnerOnly>
  );
}
