"use client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { BillDialog } from "@/components/bills/BillDialog";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { PageTitle } from "@/components/ui/PageTitle";
import { Pagination } from "@/components/ui/Pagination";
import { useApi, useDebounced } from "@/hooks/useApi";
import { useUrlQ } from "@/hooks/useUrlQ";
import { useAuth } from "@/lib/auth-context";
import { fmtDateTime, rupees } from "@/lib/format";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { invoiceService } from "@/services/invoice.service";
import type { MessageKey } from "@/messages/en";
import type { Invoice } from "@/types";

const PAGE_SIZE = 20;
const MODE_LABEL: Record<Invoice["paymentMode"], MessageKey> = { CASH: "pay.cash", UPI: "pay.upi", UDHAR: "pay.udhar", PARTIAL: "pay.partial" };

function CancelDialog({ invoice, onClose, onDone }: { invoice: Invoice; onClose: () => void; onDone: () => void }) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try { await invoiceService.cancel(invoice.id, reason.trim()); onDone(); onClose(); }
    catch (err) { setError(getErrorMessage(err)); setLoading(false); }
  }
  return (
    <Modal title={`${t("bill.cancel")}: ${invoice.invoiceNo}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-stone-700">{rupees(invoice.total)} · {t("bill.cancelHint")}</p>
        <Field label={t("bill.cancelReason")} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
        {error && <ErrorNote message={error} />}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>{t("bill.keep")}</Button>
          <Button type="submit" variant="danger" disabled={loading || reason.trim().length < 3}>{loading ? t("common.wait") : t("bill.cancel")}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function BillsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [cancelling, setCancelling] = useState<Invoice | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const dq = useDebounced(q);
  const urlQ = useUrlQ();
  useEffect(() => { setQ(urlQ); setPage(1); }, [urlQ]); // upar ke search se aaye to box bhar do
  const { data, error, loading, reload } = useApi(() => invoiceService.list({ q: dq, status, page, pageSize: PAGE_SIZE }), [dq, status, page]);

  return (
    <>
      <PageTitle title={t("bill.title")} sub={t("bill.sub")} />
      <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="space-y-3 border-b border-stone-100 p-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-stone-500" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t("bill.search")} className="h-12 w-full rounded-xl border border-stone-200 pl-10 pr-3 text-base" />
          </label>
          <div className="flex gap-2">
            {[["", t("filter.all")], ["COMPLETED", t("status.in")], ["CANCELLED", t("bill.cancelled")]].map(([v, label]) => (
              <button key={v} onClick={() => { setStatus(v); setPage(1); }} aria-pressed={status === v}
                className={`h-10 rounded-full px-4 text-sm font-medium ${status === v ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>{label}</button>
            ))}
          </div>
        </div>
        {error && <div className="p-4"><ErrorNote message={error} /></div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-base">
            <thead className="text-sm text-stone-600">
              <tr className="border-b border-stone-100">
                {(["bill.no", "bill.date", "bill.customer", "bill.mode", "bill.total"] as const).map((k) => <th key={k} className="px-4 py-3 font-medium">{t(k)}</th>)}<th className="w-52" />
              </tr>
            </thead>
            <tbody>
              {data?.items.map((b) => {
                const cancelled = b.status === "CANCELLED";
                return (
                  <tr key={b.id} className="border-b border-stone-50 last:border-0">
                    <td className="px-4 py-3.5 font-medium">{b.invoiceNo}</td>
                    <td className="px-4 py-3.5 text-stone-600">{fmtDateTime(b.createdAt)}</td>
                    <td className="px-4 py-3.5">{b.farmerName || t("pos.walkin")}</td>
                    <td className="px-4 py-3.5">{t(MODE_LABEL[b.paymentMode])}{!cancelled && b.credit > 0 && <span className="block text-sm text-red-700">{t("bill.credit")}: {rupees(b.credit)}</span>}</td>
                    <td className={`px-4 py-3.5 font-semibold ${cancelled ? "text-stone-500 line-through" : ""}`}>{rupees(b.total)}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <button onClick={() => setViewing(b.id)} className="mr-4 font-medium text-emerald-700 underline-offset-2 hover:underline">{t("bill.view")}</button>
                      {cancelled ? <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">{t("bill.cancelled")}</span>
                        : user.role === "OWNER" && <button onClick={() => setCancelling(b)} className="font-medium text-red-700 underline-offset-2 hover:underline">{t("bill.cancel")}</button>}
                    </td>
                  </tr>
                );
              })}
              {!loading && data?.items.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-stone-600">{t("bill.empty")}</td></tr>}
              {loading && <tr><td colSpan={6} className="px-4 py-12 text-center text-stone-600">{t("common.wait")}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <Pagination page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onChange={setPage} />
      {viewing && <BillDialog invoiceId={viewing} onClose={() => setViewing(null)} />}
      {cancelling && <CancelDialog invoice={cancelling} onClose={() => setCancelling(null)} onDone={reload} />}
    </>
  );
}
