"use client";
import { Search, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FarmerForm } from "@/components/customers/FarmerForm";
import { useDebounced } from "@/hooks/useApi";
import { rupees } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { farmerService } from "@/services/farmer.service";
import type { Farmer } from "@/types";

export function FarmerPicker({ value, onChange, required }: { value: Farmer | null; onChange: (f: Farmer | null) => void; required: boolean }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Farmer[]>([]);
  const [adding, setAdding] = useState(false);
  const dq = useDebounced(q, 250);

  useEffect(() => {
    if (!dq.trim()) { setResults([]); return; }
    let alive = true;
    farmerService.list({ q: dq, pageSize: 5 }).then((r) => alive && setResults(r.items)).catch(() => alive && setResults([]));
    return () => { alive = false; };
  }, [dq]);

  const pick = (f: Farmer | null) => { onChange(f); setQ(""); setResults([]); };

  return (
    <div>
      <span className="mb-1.5 block text-base font-medium">{required ? t("pos.customer") : t("pos.farmerOptional")}</span>
      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{value.name}</p>
            <p className="text-sm text-stone-700">{value.mobile}{value.balancePaise > 0 && <span className="ml-2 font-medium text-red-700">{t("cust.due")}: {rupees(value.balancePaise)}</span>}</p>
          </div>
          <button onClick={() => pick(null)} aria-label={t("pos.change")} className="grid size-10 shrink-0 place-items-center rounded-lg hover:bg-emerald-100"><X className="size-5" /></button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-stone-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("pos.chooseFarmer")}
            className={`h-12 w-full rounded-xl border pl-10 pr-3 text-base ${required ? "border-amber-400" : "border-stone-300"}`} />
          {(results.length > 0 || q.trim()) && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
              {results.map((f) => (
                <li key={f.id}>
                  <button onClick={() => pick(f)} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-emerald-50">
                    <span><span className="font-medium">{f.name}</span> <span className="text-sm text-stone-600">{f.mobile}</span></span>
                    {f.balancePaise > 0 && <span className="text-sm font-medium text-red-700">{rupees(f.balancePaise)}</span>}
                  </button>
                </li>
              ))}
              <li><button onClick={() => setAdding(true)} className="flex w-full items-center gap-2 px-4 py-3 text-left font-medium text-emerald-700 hover:bg-emerald-50"><UserPlus className="size-5" /> {t("pos.newFarmer")}</button></li>
            </ul>
          )}
          {!q.trim() && (
            <button onClick={() => setAdding(true)} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"><UserPlus className="size-4" /> {t("pos.newFarmer")}</button>
          )}
        </div>
      )}
      {adding && <FarmerForm onClose={() => setAdding(false)} onSaved={(f) => { pick(f); setAdding(false); }} />}
    </div>
  );
}
