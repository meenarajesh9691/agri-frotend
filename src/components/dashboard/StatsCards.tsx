"use client";
import { AlertTriangle, Boxes, IndianRupee, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { useApi } from "@/hooks/useApi";
import { rupees } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { invoiceService } from "@/services/invoice.service";
import { stockService } from "@/services/stock.service";

export function StatsCards() {
  const { t } = useI18n();
  const stock = useApi(() => stockService.summary(), []);
  const sales = useApi(() => invoiceService.summary(), []);
  const s = sales.data, st = stock.data;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label={t("stat.sales")} value={s ? rupees(s.month.total) : "-"} hint={s ? t("stat.salesHint", { n: s.month.count }) : undefined} icon={TrendingUp} tone="emerald" />
      <StatCard label={t("stat.today")} value={s ? rupees(s.today.total) : "-"} hint={s ? t("stat.todayHint", { n: s.today.count }) : undefined} icon={IndianRupee} tone="sky" />
      <StatCard label={t("stat.low")} value={st ? String(st.lowStock + st.outOfStock) : "-"} hint={t("stat.lowHint")} icon={AlertTriangle} tone="amber" />
      <StatCard label={t("stat.products")} value={st ? String(st.totalProducts) : "-"} hint={t("stat.productsHint")} icon={Boxes} tone="violet" />
    </div>
  );
}
