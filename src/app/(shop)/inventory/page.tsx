"use client";
import { PackagePlus } from "lucide-react";
import Link from "next/link";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { PageTitle } from "@/components/ui/PageTitle";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";

export default function InventoryPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  return (
    <>
      <PageTitle title={t("inv.title")} sub={t("inv.sub")}
        action={user.role === "OWNER" && (
          <Link href="/inventory/receive" className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-600 px-5 font-semibold text-white shadow-sm hover:bg-emerald-700">
            <PackagePlus className="size-5" /> {t("inv.receive")}
          </Link>
        )} />
      <InventoryTable />
    </>
  );
}
