"use client";
import { Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { lineAmount, type CartLine } from "@/lib/billing";
import { rupees } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

const btn = "grid size-11 place-items-center rounded-lg border border-stone-300 hover:bg-stone-100";

export function CartTable({ lines, blockOversell, onQty, onRemove }: {
  lines: CartLine[]; blockOversell: boolean; onQty: (id: string, qty: number) => void; onRemove: (id: string) => void;
}) {
  const { t } = useI18n();
  if (lines.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border-2 border-dashed border-stone-300 bg-white py-20 text-center text-stone-600">
        <ShoppingBasket className="mb-3 size-12 text-stone-400" />
        <p className="text-lg font-medium">{t("pos.emptyTitle")}</p>
        <p>{t("pos.emptySub")}</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
      <table className="w-full min-w-[36rem] text-left text-base">
        <thead className="text-sm text-stone-600">
          <tr className="border-b border-stone-100">
            <th className="px-4 py-3 font-medium">{t("col.product")}</th><th className="px-4 py-3 font-medium">{t("col.rate")}</th>
            <th className="px-4 py-3 text-center font-medium">{t("pos.qty")}</th><th className="px-4 py-3 text-right font-medium">{t("pos.amount")}</th><th className="w-14" />
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => {
            const p = l.row.product;
            const short = l.qty > l.row.sellableQty;
            return (
              <tr key={p.id} className="border-b border-stone-50 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{p.brandName} <span className="text-stone-600">{p.packSize}</span></p>
                  <p className="text-sm text-stone-600">GST {p.gstPercent}%</p>
                  {short && <p className={`text-sm font-medium ${blockOversell ? "text-red-700" : "text-amber-700"}`}>{t("pos.stockOnly", { n: l.row.sellableQty })}</p>}
                </td>
                <td className="px-4 py-3">{rupees(p.salePrice)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button className={btn} aria-label={t("pos.dec")} onClick={() => onQty(p.id, l.qty - 1)}><Minus className="size-4" /></button>
                    <span className="w-9 text-center text-lg font-semibold">{l.qty}</span>
                    <button className={btn} aria-label={t("pos.inc")} onClick={() => onQty(p.id, l.qty + 1)}><Plus className="size-4" /></button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-lg font-semibold">{rupees(lineAmount(l))}</td>
                <td className="px-2"><button aria-label={t("pos.remove")} onClick={() => onRemove(p.id)} className="grid size-11 place-items-center rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-700"><Trash2 className="size-5" /></button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
