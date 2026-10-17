"use client";
import { ScanBarcode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebounced } from "@/hooks/useApi";
import { productService } from "@/services/product.service";
import type { ShopProduct } from "@/types";

/** Naam likho ya barcode scan karo (Enter). Chuna hua product onPick se milta hai. */
export function ProductPicker({ onPick, placeholder }: { onPick: (p: ShopProduct) => void; placeholder: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ShopProduct[]>([]);
  const dq = useDebounced(q, 250);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dq.trim()) { setResults([]); return; }
    let alive = true;
    productService.list({ q: dq, pageSize: 6 }).then((r) => alive && setResults(r.items)).catch(() => alive && setResults([]));
    return () => { alive = false; };
  }, [dq]);

  function pick(p: ShopProduct) {
    onPick(p);
    setQ(""); setResults([]);
    ref.current?.focus();
  }
  async function onEnter() {
    const code = q.trim();
    if (!code) return;
    const scanned = /^\d{6,}$/.test(code) ? await productService.scan(code).catch(() => null) : null; // scanner fast type karta hai
    const hit = scanned ?? results[0];
    if (hit) pick(hit);
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-2xl border-2 border-emerald-600/30 bg-white p-2 shadow-sm focus-within:border-emerald-600">
        <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ScanBarcode className="size-6" /></span>
        <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onEnter()}
          placeholder={placeholder} className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-stone-500" />
      </div>
      {results.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
          {results.map((p) => (
            <li key={p.id}>
              <button onClick={() => pick(p)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-emerald-50">
                <span><span className="font-medium">{p.brandName}</span> <span className="text-stone-600">{p.packSize}</span>
                  <span className="block text-sm text-stone-600">{[p.technicalName, p.company].filter(Boolean).join(" · ")}</span></span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
