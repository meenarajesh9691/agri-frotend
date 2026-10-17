"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { OwnerOnly } from "@/components/auth/OwnerOnly";
import { ReceiveForm } from "@/components/inventory/ReceiveForm";
import { PageTitle } from "@/components/ui/PageTitle";
import { useI18n } from "@/lib/i18n";

export default function ReceivePage() {
  const { t } = useI18n();
  return (
    <OwnerOnly>
      <Link href="/inventory" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700"><ArrowLeft className="size-4" /> {t("inv.title")}</Link>
      <PageTitle title={t("rcv.title")} sub={t("rcv.sub")} />
      <ReceiveForm />
    </OwnerOnly>
  );
}
