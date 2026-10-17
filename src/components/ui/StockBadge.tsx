"use client";
import { AlertTriangle, CheckCircle2, CircleSlash, Clock, Hourglass } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { StockStatus } from "@/lib/stock";

// Rang ke saath icon aur text bhi hai, taaki sirf rang par nirbhar na rahe
const MAP = {
  IN_STOCK: { key: "status.in", cls: "bg-emerald-50 text-emerald-800 ring-emerald-600/25", Icon: CheckCircle2 },
  LOW: { key: "status.low", cls: "bg-amber-50 text-amber-800 ring-amber-600/25", Icon: AlertTriangle },
  OUT: { key: "status.out", cls: "bg-stone-100 text-stone-700 ring-stone-500/25", Icon: CircleSlash },
  EXPIRING: { key: "status.expiring", cls: "bg-orange-50 text-orange-800 ring-orange-600/25", Icon: Hourglass },
  EXPIRED: { key: "status.expired", cls: "bg-red-50 text-red-800 ring-red-600/25", Icon: Clock },
} as const;

export function StockBadge({ status }: { status: StockStatus }) {
  const { t } = useI18n();
  const { key, cls, Icon } = MAP[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${cls}`}>
      <Icon className="size-4" aria-hidden /> {t(key)}
    </span>
  );
}
