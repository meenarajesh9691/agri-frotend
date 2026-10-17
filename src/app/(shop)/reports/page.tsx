"use client";
import { OwnerOnly } from "@/components/auth/OwnerOnly";
import { PageTitle } from "@/components/ui/PageTitle";
import { useI18n } from "@/lib/i18n";

export default function Page() {
  const { t } = useI18n();
  return <OwnerOnly><PageTitle title={t("nav.reports")} sub={t("soon.sub")} /></OwnerOnly>;
}
