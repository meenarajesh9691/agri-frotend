"use client";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { PrintSettings } from "@/components/settings/PrintSettings";
import { ChangePassword } from "@/components/settings/ChangePassword";
import { StaffManager } from "@/components/settings/StaffManager";
import { PageTitle } from "@/components/ui/PageTitle";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";

export default function SettingsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  return (
    <>
      <PageTitle title={t("nav.settings")} />
      <div className="max-w-4xl space-y-6">
        {user.role === "OWNER" && <BillingSettings />}
        {user.role === "OWNER" && <PrintSettings />}
        {user.role === "OWNER" && <StaffManager />}
        <ChangePassword />
      </div>
    </>
  );
}
