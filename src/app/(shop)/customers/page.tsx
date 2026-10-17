"use client";
import { Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { FarmerForm } from "@/components/customers/FarmerForm";
import { LedgerDialog } from "@/components/customers/LedgerDialog";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { PageTitle } from "@/components/ui/PageTitle";
import { Pagination } from "@/components/ui/Pagination";
import { useApi, useDebounced } from "@/hooks/useApi";
import { useUrlQ } from "@/hooks/useUrlQ";
import { rupees } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { farmerService } from "@/services/farmer.service";
import type { Farmer } from "@/types";

const PAGE_SIZE = 20;

export default function CustomersPage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [owing, setOwing] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ farmer?: Farmer } | null>(null);
  const [ledger, setLedger] = useState<Farmer | null>(null);
  const dq = useDebounced(q);
  const urlQ = useUrlQ();
  useEffect(() => { setQ(urlQ); setPage(1); }, [urlQ]); // upar ke search se aaye to box bhar do
  const { data, error, loading, reload } = useApi(() => farmerService.list({ q: dq, owing, page, pageSize: PAGE_SIZE }), [dq, owing, page]);

  return (
    <>
      <PageTitle title={t("nav.customers")} sub={t("cust.sub")} action={<Button onClick={() => setForm({})}><UserPlus className="size-5" /> {t("cust.add")}</Button>} />

      <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-5">
        <p className="text-sm text-stone-700">{t("cust.totalDue")}</p>
        <p className="text-3xl font-bold text-red-700">{data ? rupees(data.summary.totalDuePaise) : "-"}</p>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-stone-100 p-4">
          <label className="relative min-w-60 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-stone-500" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t("cust.search")} className="h-12 w-full rounded-xl border border-stone-200 pl-10 pr-3 text-base" />
          </label>
          <label className="flex cursor-pointer items-center gap-2 font-medium">
            <input type="checkbox" className="size-5 accent-emerald-600" checked={owing} onChange={(e) => { setOwing(e.target.checked); setPage(1); }} /> {t("cust.onlyDue")}
          </label>
        </div>
        {error && <div className="p-4"><ErrorNote message={error} /></div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-base">
            <thead className="text-sm text-stone-600">
              <tr className="border-b border-stone-100">
                {(["cust.name", "cust.mobile", "cust.village", "cust.due"] as const).map((k) => <th key={k} className="px-4 py-3 font-medium">{t(k)}</th>)}<th className="w-48" />
              </tr>
            </thead>
            <tbody>
              {data?.items.map((f) => (
                <tr key={f.id} className="border-b border-stone-50 last:border-0 hover:bg-emerald-50/40">
                  <td className="px-4 py-3.5 font-medium">{f.name}</td>
                  <td className="px-4 py-3.5">{f.mobile}</td>
                  <td className="px-4 py-3.5 text-stone-600">{f.village || "-"}</td>
                  <td className={`px-4 py-3.5 font-semibold ${f.balancePaise > 0 ? "text-red-700" : f.balancePaise < 0 ? "text-emerald-700" : "text-stone-600"}`}>
                    {rupees(Math.abs(f.balancePaise))}{f.balancePaise < 0 && <span className="ml-2 text-sm font-medium">{t("cust.advance")}</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    <button onClick={() => setLedger(f)} className="mr-4 font-medium text-emerald-700 underline-offset-2 hover:underline">{t("cust.ledger")}</button>
                    <button onClick={() => setForm({ farmer: f })} className="font-medium text-stone-700 underline-offset-2 hover:underline">{t("common.edit")}</button>
                  </td>
                </tr>
              ))}
              {!loading && data?.items.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-stone-600">{t("cust.empty")}</td></tr>}
              {loading && <tr><td colSpan={5} className="px-4 py-12 text-center text-stone-600">{t("common.wait")}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <Pagination page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onChange={setPage} />

      {form && <FarmerForm farmer={form.farmer} onClose={() => setForm(null)} onSaved={() => { setForm(null); reload(); }} />}
      {ledger && <LedgerDialog farmer={ledger} onClose={() => setLedger(null)} onChanged={reload} />}
    </>
  );
}
