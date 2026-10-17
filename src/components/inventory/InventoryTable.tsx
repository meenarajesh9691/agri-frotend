"use client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { BatchesDialog } from "@/components/inventory/BatchesDialog";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Pagination } from "@/components/ui/Pagination";
import { StockBadge } from "@/components/ui/StockBadge";
import { useApi, useDebounced } from "@/hooks/useApi";
import { useUrlQ } from "@/hooks/useUrlQ";
import { useAuth } from "@/lib/auth-context";
import { daysFromNow } from "@/lib/dates";
import { fmtDate, rupees } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import type { StockStatus } from "@/lib/stock";
import { stockService } from "@/services/stock.service";
import type { MessageKey } from "@/messages/en";
import type { StockRow } from "@/types";

type Filter = "" | StockStatus;
const FILTERS: { value: Filter; label: MessageKey }[] = [
  { value: "", label: "filter.all" }, { value: "IN_STOCK", label: "status.in" }, { value: "LOW", label: "status.low" },
  { value: "OUT", label: "status.out" }, { value: "EXPIRING", label: "status.expiring" }, { value: "EXPIRED", label: "status.expired" },
];
const COLS: MessageKey[] = ["col.product", "col.pack", "col.stock", "col.nearest", "col.sale", "col.status"];
const PAGE_SIZE = 20;

export function InventoryTable() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Filter>("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<StockRow | null>(null);
  const dq = useDebounced(q);
  const urlQ = useUrlQ();
  useEffect(() => { setQ(urlQ); setPage(1); }, [urlQ]); // upar ke search se aaye to box bhar do
  const { data, error, loading, reload } = useApi(() => stockService.list({ q: dq, status, page, pageSize: PAGE_SIZE }), [dq, status, page]);

  return (
    <>
      <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="space-y-3 border-b border-stone-100 p-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-stone-500" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t("inv.search")} className="h-12 w-full rounded-xl border border-stone-200 pl-10 pr-3 text-base" />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button key={f.value} onClick={() => { setStatus(f.value); setPage(1); }} aria-pressed={status === f.value}
                className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium ${status === f.value ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>{t(f.label)}</button>
            ))}
          </div>
        </div>
        {error && <div className="p-4"><ErrorNote message={error} /></div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-base">
            <thead className="text-sm text-stone-600">
              <tr className="border-b border-stone-100">{COLS.map((c) => <th key={c} className="px-4 py-3 font-medium">{t(c)}</th>)}<th className="w-28" /></tr>
            </thead>
            <tbody>
              {data?.items.map((r) => {
                const near = r.nearestExpiry ? daysFromNow(r.nearestExpiry) : null;
                return (
                  <tr key={r.product.id} className="border-b border-stone-50 last:border-0 hover:bg-emerald-50/40">
                    <td className="px-4 py-3.5">
                      <p className="font-medium">{r.product.brandName}</p>
                      <p className="text-sm text-stone-600">{[r.product.technicalName, r.product.company].filter(Boolean).join(" · ")}</p>
                    </td>
                    <td className="px-4 py-3.5">{r.product.packSize}</td>
                    <td className="px-4 py-3.5 font-semibold">{r.sellableQty}{r.expiredQty > 0 && <span className="ml-2 text-sm font-medium text-red-700">+{r.expiredQty} exp</span>}</td>
                    <td className={`px-4 py-3.5 ${near !== null && near <= 30 ? "font-medium text-orange-700" : ""}`}>{r.nearestExpiry ? fmtDate(r.nearestExpiry) : "-"}</td>
                    <td className="px-4 py-3.5">{rupees(r.product.salePrice)}</td>
                    <td className="px-4 py-3.5"><StockBadge status={r.status} /></td>
                    <td className="px-4 py-3.5 text-right"><button onClick={() => setOpen(r)} className="font-medium text-emerald-700 underline-offset-2 hover:underline">{t("inv.batches")}</button></td>
                  </tr>
                );
              })}
              {!loading && data?.items.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-stone-600">{t("inv.empty")}</td></tr>}
              {loading && <tr><td colSpan={7} className="px-4 py-12 text-center text-stone-600">{t("common.wait")}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <Pagination page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onChange={setPage} />
      {open && <BatchesDialog row={open} isOwner={user.role === "OWNER"} onClose={() => setOpen(null)} onChanged={reload} />}
    </>
  );
}
