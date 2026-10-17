"use client";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";

// Plan ke haal ke hisaab se upar ki patti: peeli = chetawani, lal = bill band ya band hone wala
export function SubscriptionBanner() {
  const { subscription: s } = useAuth();
  const { t } = useI18n();

  let message = "";
  let tone = "bg-amber-100 text-amber-900";
  if (s.status === "ACTIVE" && s.daysLeft <= 7) message = s.daysLeft <= 0 ? t("sub.today") : t("sub.soon", { n: s.daysLeft });
  if (s.status === "GRACE") { message = t("sub.grace", { n: s.graceDaysLeft }); tone = "bg-red-100 text-red-900"; }
  if (s.status === "EXPIRED") { message = t("sub.expired"); tone = "bg-red-100 text-red-900"; }
  if (s.status === "SUSPENDED") { message = t("sub.suspended"); tone = "bg-red-100 text-red-900"; }
  if (!message) return null;

  return (
    <div role="status" className={`flex items-start gap-3 px-4 py-3 text-base font-medium md:px-6 ${tone}`}>
      <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden /> {message}
    </div>
  );
}
