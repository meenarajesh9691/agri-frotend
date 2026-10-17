"use client";
import { CheckCircle2, PackageOpen, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProductPicker } from "@/components/products/ProductPicker";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Field } from "@/components/ui/Field";
import { parseDateInput, todayISO } from "@/lib/dates";
import { rupees } from "@/lib/format";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { stockService } from "@/services/stock.service";
import type { ShopProduct } from "@/types";

interface Line { key: number; product: ShopProduct; batchNo: string; mfg: string; exp: string; qty: string; cost: string }
let nextKey = 1;

export function ReceiveForm() {
  const { t } = useI18n();
  const [supplier, setSupplier] = useState("");
  const [billNo, setBillNo] = useState("");
  const [date, setDate] = useState(todayISO());
  const [lines, setLines] = useState<Line[]>([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [saving, setSaving] = useState(false);

  const total = lines.reduce((s, l) => s + Math.round((Number(l.qty) || 0) * (Number(l.cost) || 0) * 100), 0);
  const addLine = (product: ShopProduct) => { setDone(""); setLines((ls) => [...ls, { key: nextKey++, product, batchNo: "", mfg: "", exp: "", qty: "", cost: "" }]); };
  const edit = (key: number, f: keyof Line, v: string) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, [f]: v } : l)));

  async function save() {
    setError("");
    if (supplier.trim().length < 2) return setError(t("rcv.needSupplier"));

    const items = [];
    for (const [i, l] of lines.entries()) {
      const n = i + 1;
      const qty = Number(l.qty), cost = Number(l.cost);
      if (!l.batchNo.trim() || !(qty > 0) || l.cost.trim() === "" || !(cost >= 0)) return setError(t("rcv.needFields", { n }));
      const mfg = parseDateInput(l.mfg, "start"), exp = parseDateInput(l.exp, "end");
      if (mfg === null || exp === null) return setError(t("rcv.badDate", { n }));
      if (!exp && l.product.category !== "FERTILIZER") return setError(t("rcv.needExpiry", { n }));
      items.push({ productId: l.product.id, batchNo: l.batchNo.trim(), mfgDate: mfg || undefined, expiryDate: exp || undefined, qty, purchasePrice: Math.round(cost * 100) });
    }

    setSaving(true);
    try {
      const r = await stockService.createPurchase({ supplier: supplier.trim(), billNo: billNo.trim(), date, items });
      setDone(t("rcv.saved", { n: r.itemCount, amount: rupees(r.totalPaise) }));
      setLines([]); setBillNo("");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  const small = "h-11 w-full rounded-lg border border-stone-300 px-3 text-base";
  return (
    <div className="space-y-5">
      <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-3">
        <Field label={t("rcv.supplier")} value={supplier} onChange={(e) => setSupplier(e.target.value)} />
        <Field label={t("rcv.billNo")} value={billNo} onChange={(e) => setBillNo(e.target.value)} />
        <Field label={t("rcv.date")} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </section>

      <ProductPicker onPick={addLine} placeholder={t("rcv.search")} />

      {lines.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border-2 border-dashed border-stone-300 bg-white py-16 text-center text-stone-600">
          <PackageOpen className="mb-3 size-12 text-stone-400" /> {t("rcv.empty")}
        </div>
      ) : (
        <ul className="space-y-3">
          {lines.map((l) => (
            <li key={l.key} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="font-medium">{l.product.brandName} <span className="text-stone-600">{l.product.packSize}</span>
                  {l.product.category === "FERTILIZER" && <span className="ml-2 text-xs text-stone-600">({t("rcv.expOptional")})</span>}</p>
                <button onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} aria-label={t("common.remove")} className="grid size-10 place-items-center rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-700"><Trash2 className="size-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {([["batchNo", "rcv.batchNo", "text"], ["mfg", "rcv.mfg", "text"], ["exp", "rcv.exp", "text"], ["qty", "rcv.qty", "decimal"], ["cost", "rcv.cost", "decimal"]] as const).map(([f, label, mode]) => (
                  <label key={f} className="block text-sm font-medium">{t(label)}
                    <input value={l[f]} onChange={(e) => edit(l.key, f, e.target.value)} inputMode={mode === "decimal" ? "decimal" : undefined}
                      placeholder={f === "mfg" || f === "exp" ? "MM/YYYY" : ""} className={`${small} mt-1 font-normal`} />
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <ErrorNote message={error} />}
      {done && <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-medium text-emerald-800"><CheckCircle2 className="size-5" /> {done}</p>}

      <div className="sticky bottom-20 flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-lg md:bottom-4">
        <p><span className="text-stone-600">{t("rcv.total")}: </span><span className="text-2xl font-bold text-emerald-700">{rupees(total)}</span></p>
        <Button onClick={save} disabled={saving || lines.length === 0} className="h-12 px-8">{saving ? t("common.wait") : t("rcv.save")}</Button>
      </div>
    </div>
  );
}
