"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/lib/auth-context";
import { fmtDateTime, rupees } from "@/lib/format";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { farmerService } from "@/services/farmer.service";
import type { MessageKey } from "@/messages/en";
import type { Farmer, LedgerItem } from "@/types";

const TYPE_LABEL: Record<LedgerItem["type"], MessageKey> = { SALE_CREDIT: "cust.sale", PAYMENT: "cust.payment", ADJUSTMENT: "cust.adjust" };

export function LedgerDialog({ farmer, onClose, onChanged }: { farmer: Farmer; onClose: () => void; onChanged: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi(() => farmerService.ledger(farmer.id, page), [farmer.id, page]);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"CASH" | "UPI">("CASH");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const balance = data?.balancePaise ?? farmer.balancePaise;

  async function refund() {
    if (!window.confirm(t("cust.refundConfirm", { amount: rupees(-balance) }))) return;
    setFormError("");
    try { await farmerService.refund(farmer.id, -balance); reload(); onChanged(); } catch (err) { setFormError(getErrorMessage(err)); }
  }

  async function receive(e: React.FormEvent) {
    e.preventDefault();
    const paise = Math.round(Number(amount) * 100);
    if (!(paise > 0)) return setFormError(t("cust.amount"));
    setSaving(true); setFormError("");
    try {
      await farmerService.receivePayment(farmer.id, { amountPaise: paise, mode, note: note.trim() });
      setAmount(""); setNote(""); setPage(1);
      reload(); onChanged();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`${farmer.name} · ${t("cust.ledger")}`} onClose={onClose}>
      <div className={`mb-4 rounded-2xl p-4 ${balance > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
        <p className="text-sm text-stone-700">{balance < 0 ? t("cust.advance") : t("cust.balance")}</p>
        <p className={`text-3xl font-bold ${balance > 0 ? "text-red-700" : "text-emerald-700"}`}>{rupees(Math.abs(balance))}</p>
        {balance < 0 && (
          <div className="mt-2 space-y-3">
            <p className="text-sm text-stone-700">{t("cust.advanceHint")}</p>
            {user.role === "OWNER" && <Button variant="secondary" onClick={refund}>{t("cust.refund")}</Button>}
          </div>
        )}
      </div>

      <form onSubmit={receive} className="mb-5 space-y-3 rounded-2xl border border-stone-200 p-4">
        <p className="font-medium">{t("cust.receive")}</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder={t("cust.amount")} className="h-12 rounded-xl border border-stone-300 px-4 text-base" />
          <div className="flex rounded-xl border border-stone-300 p-0.5">
            {(["CASH", "UPI"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m}
                className={`h-11 min-w-20 rounded-lg px-3 font-medium ${mode === m ? "bg-emerald-600 text-white" : "text-stone-700"}`}>{t(m === "CASH" ? "pay.cash" : "pay.upi")}</button>
            ))}
          </div>
        </div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("bt.note")} className="h-11 w-full rounded-xl border border-stone-300 px-4" />
        {formError && <ErrorNote message={formError} />}
        <Button type="submit" disabled={saving || !amount} className="w-full">{saving ? t("common.wait") : t("cust.receive")}</Button>
      </form>

      {error && <ErrorNote message={error} />}
      <ul className="divide-y divide-stone-100">
        {data?.items.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium">{t(TYPE_LABEL[e.type])}{e.mode && <span className="ml-2 text-sm font-normal text-stone-600">{e.mode}</span>}</p>
              <p className="text-sm text-stone-600">{fmtDateTime(e.date)}{e.note ? ` · ${e.note}` : ""}</p>
            </div>
            <span className={`text-lg font-semibold ${e.amountPaise > 0 ? "text-red-700" : "text-emerald-700"}`}>{e.amountPaise > 0 ? "+" : "-"}{rupees(Math.abs(e.amountPaise))}</span>
          </li>
        ))}
        {!loading && data?.items.length === 0 && <li className="py-6 text-center text-stone-600">{t("cust.noEntries")}</li>}
      </ul>
      <Pagination page={page} pageSize={20} total={data?.total ?? 0} onChange={setPage} />
    </Modal>
  );
}
