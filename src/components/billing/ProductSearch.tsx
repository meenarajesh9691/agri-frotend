"use client";
import { ScanBarcode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StockBadge } from "@/components/ui/StockBadge";
import { useDebounced } from "@/hooks/useApi";
import { rupees } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { stockService } from "@/services/stock.service";
import type { StockRow } from "@/types";

// Expired maal ka bill nahi banta (server par bhi rok hai). Bikne layak maal na ho aur expired ho to chunna band.
const blocked = (r: StockRow) => r.status === "EXPIRED" && r.sellableQty <= 0;

export function ProductSearch({ onAdd }: { onAdd: (row: StockRow) => void }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<StockRow[]>([]);
  const dq = useDebounced(q, 250);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dq.trim()) { setResults([]); return; }
    let alive = true;
    stockService.list({ q: dq, pageSize: 6 }).then((r) => alive && setResults(r.items)).catch(() => alive && setResults([]));
    return () => { alive = false; };
  }, [dq]);

  function add(r: StockRow) {
    if (blocked(r)) return;
    onAdd(r);
    setQ(""); setResults([]);
    ref.current?.focus();
  }
  // Scanner type karke turant Enter dabata hai, isliye Enter par taaza search karte hain
  async function onEnter() {
    const code = q.trim();
    if (!code) return;
    const fresh = (await stockService.list({ q: code, pageSize: 6 }).catch(() => null))?.items ?? [];
    const hit = fresh.find((r) => r.product.barcode === code) ?? fresh[0];
    if (hit) add(hit);
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-2xl border-2 border-emerald-600/30 bg-white p-2 shadow-sm focus-within:border-emerald-600">
        <span className="grid size-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ScanBarcode className="size-6" /></span>
        <input ref={ref} autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onEnter()}
          placeholder={t("pos.placeholder")} className="h-12 min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-stone-500" />
        <kbd className="mr-2 hidden rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-600 sm:block">Enter</kbd>
      </div>
      {results.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
          {results.map((r) => (
            <li key={r.product.id}>
              <button disabled={blocked(r)} onClick={() => add(r)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60">
                <span>
                  <span className="font-medium">{r.product.brandName} <span className="text-stone-600">{r.product.packSize}</span></span>
                  <span className="block text-sm text-stone-600">{t("pos.available", { n: r.sellableQty })} · {r.product.technicalName}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold">{rupees(r.product.salePrice)}</span>
                  {r.status !== "IN_STOCK" && <StockBadge status={r.status} />}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
