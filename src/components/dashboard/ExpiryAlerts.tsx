"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { useApi } from "@/hooks/useApi";
import { daysFromNow } from "@/lib/dates";
import { fmtDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { stockService } from "@/services/stock.service";
import type { MessageKey } from "@/messages/en";
import type { Batch } from "@/types";

type Group = "expired" | "soon" | "later";
// Lal = expire ho chuka, peela = 30 din mein, neela = 31 se 60 din
const GROUPS: { key: Group; label: MessageKey; card: string; count: string }[] = [
  { key: "expired", label: "al.expired", card: "border-red-200 bg-red-50", count: "text-red-700" },
  { key: "soon", label: "al.soon", card: "border-amber-200 bg-amber-50", count: "text-amber-700" },
  { key: "later", label: "al.later", card: "border-sky-200 bg-sky-50", count: "text-sky-700" },
];

export function ExpiryAlerts() {
  const { t } = useI18n();
  const { data, error, reload } = useApi(() => stockService.alerts(), []);
  const [open, setOpen] = useState<Group | null>(null);
  const [actionError, setActionError] = useState("");

  async function writeOff(b: Batch) {
    if (!window.confirm(t("bt.confirmWriteoff", { qty: b.qtyRemaining, batch: b.batchNo }))) return;
    try { await stockService.writeOff(b.id, "EXPIRED"); reload(); } catch (e) { setActionError(getErrorMessage(e)); }
  }
  const name = (b: Batch) => (typeof b.product === "string" ? "" : `${b.product.brandName} ${b.product.packSize}`);

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">{t("al.title")}</h2>
      <p className="mb-3 text-sm text-stone-600">{t("al.hint")}</p>
      {(error || actionError) && <ErrorNote message={(error ?? actionError)!} />}

      <div className="grid gap-3 sm:grid-cols-3">
        {GROUPS.map((g) => (
          <button key={g.key} onClick={() => setOpen(open === g.key ? null : g.key)} aria-pressed={open === g.key}
            className={`rounded-2xl border p-5 text-left transition-shadow ${g.card} ${open === g.key ? "ring-2 ring-stone-900/20" : "hover:shadow-md"}`}>
            <p className={`text-3xl font-bold ${g.count}`}>{data ? data.counts[g.key] : "-"}</p>
            <p className="font-medium">{t(g.label)}</p>
          </button>
        ))}
      </div>

      {open && data && (
        <ul className="mt-4 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white shadow-sm">
          {data[open].map((b) => {
            const d = daysFromNow(b.expiryDate!);
            return (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                <div>
                  <p className="font-medium">{name(b)}</p>
                  <p className="text-sm text-stone-600">{t("col.batch")} {b.batchNo} · {fmtDate(b.expiryDate!)} · {d < 0 ? t("al.daysAgo", { n: -d }) : t("al.daysLeft", { n: d })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">{b.qtyRemaining}</span>
                  {open === "expired" && <Button variant="danger" className="h-10 px-4" onClick={() => writeOff(b)}>{t("bt.writeoff")}</Button>}
                </div>
              </li>
            );
          })}
          {data[open].length === 0 && <li className="px-4 py-8 text-center text-stone-600">{t("al.none")}</li>}
        </ul>
      )}
    </section>
  );
}
