"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Modal } from "@/components/ui/Modal";
import { useApi } from "@/hooks/useApi";
import { daysFromNow } from "@/lib/dates";
import { fmtDate, rupees } from "@/lib/format";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { stockService } from "@/services/stock.service";
import type { MessageKey } from "@/messages/en";
import type { AdjustReason, Batch, StockRow } from "@/types";

const REASONS: { value: AdjustReason; label: MessageKey }[] = [
  { value: "CORRECTION", label: "reason.correction" },
  { value: "DAMAGED", label: "reason.damaged" },
  { value: "RETURN", label: "reason.return" },
];

function BatchRow({ batch, isOwner, onChanged }: { batch: Batch; isOwner: boolean; onChanged: () => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<AdjustReason>("CORRECTION");
  const [change, setChange] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const expired = batch.expiryDate ? daysFromNow(batch.expiryDate) < 0 : false;
  const soon = batch.expiryDate ? daysFromNow(batch.expiryDate) <= 30 : false;

  async function run(fn: () => Promise<unknown>) {
    setError("");
    try { await fn(); setOpen(false); setChange(""); setNote(""); onChanged(); } catch (e) { setError(getErrorMessage(e)); }
  }
  const writeOff = () => window.confirm(t("bt.confirmWriteoff", { qty: batch.qtyRemaining, batch: batch.batchNo })) &&
    run(() => stockService.writeOff(batch.id, expired ? "EXPIRED" : "DAMAGED"));
  const adjust = () => {
    const n = Number(change);
    if (!n) return setError(t("bt.change"));
    // kharab maal sirf ghatta hai
    return run(() => stockService.adjust({ batchId: batch.id, qtyChange: reason === "DAMAGED" ? -Math.abs(n) : n, reason, note: note.trim() }));
  };

  return (
    <li className="space-y-3 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">{t("col.batch")} {batch.batchNo}</p>
          <p className={`text-sm ${expired ? "font-medium text-red-700" : soon ? "font-medium text-orange-700" : "text-stone-600"}`}>
            {t("col.expiry")}: {batch.expiryDate ? fmtDate(batch.expiryDate) : "-"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{batch.qtyRemaining} <span className="text-sm font-normal text-stone-600">{t("bt.remaining")}</span></p>
          {isOwner && batch.purchasePrice !== undefined && <p className="text-sm text-stone-600">{t("bt.cost")} {rupees(batch.purchasePrice)}</p>}
        </div>
      </div>
      {isOwner && (
        <div className="flex gap-2">
          <Button variant="secondary" className="h-10 px-4" onClick={() => setOpen((o) => !o)}>{t("bt.adjust")}</Button>
          <Button variant="danger" className="h-10 px-4" onClick={writeOff}>{t("bt.writeoff")}</Button>
        </div>
      )}
      {open && (
        <div className="grid gap-3 rounded-xl bg-stone-50 p-3 sm:grid-cols-[1fr_1fr_2fr_auto]">
          <select value={reason} onChange={(e) => setReason(e.target.value as AdjustReason)} aria-label={t("bt.reason")} className="h-11 rounded-lg border border-stone-300 bg-white px-3">
            {REASONS.map((r) => <option key={r.value} value={r.value}>{t(r.label)}</option>)}
          </select>
          <input value={change} onChange={(e) => setChange(e.target.value)} inputMode="decimal" placeholder={t("bt.change")} className="h-11 rounded-lg border border-stone-300 px-3" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("bt.note")} className="h-11 rounded-lg border border-stone-300 px-3" />
          <Button className="h-11" onClick={adjust}>{t("common.save")}</Button>
        </div>
      )}
      {error && <ErrorNote message={error} />}
    </li>
  );
}

export function BatchesDialog({ row, isOwner, onClose, onChanged }: { row: StockRow; isOwner: boolean; onClose: () => void; onChanged: () => void }) {
  const { t } = useI18n();
  const { data, error, loading, reload } = useApi(() => stockService.batches(row.product.id), [row.product.id]);
  const changed = () => { reload(); onChanged(); };

  return (
    <Modal title={t("bt.title", { name: `${row.product.brandName} ${row.product.packSize}` })} onClose={onClose}>
      {error && <ErrorNote message={error} />}
      <ul className="divide-y divide-stone-100">
        {data?.map((b) => <BatchRow key={b.id} batch={b} isOwner={isOwner} onChanged={changed} />)}
        {!loading && data?.length === 0 && <li className="py-8 text-center text-stone-600">{t("bt.empty")}</li>}
        {loading && <li className="py-8 text-center text-stone-600">{t("common.wait")}</li>}
      </ul>
    </Modal>
  );
}
