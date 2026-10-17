"use client";
import { FileText, Search, Tags, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDebounced } from "@/hooks/useApi";
import { rupees } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { farmerService } from "@/services/farmer.service";
import { invoiceService } from "@/services/invoice.service";
import { productService } from "@/services/product.service";
import type { Farmer, Invoice, ShopProduct } from "@/types";

interface Results { products: ShopProduct[]; farmers: Farmer[]; bills: Invoice[] }

/** Upar ka search: product, kisaan aur bill, teeno ek saath dhundhta hai. Chunne par us page par le jaata hai. */
export function GlobalSearch() {
  const { t } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState<Results | null>(null);
  const dq = useDebounced(q, 300);
  const box = useRef<HTMLDivElement>(null);
  const enc = encodeURIComponent;

  useEffect(() => {
    if (dq.trim().length < 2) { setRes(null); return; }
    let alive = true;
    Promise.all([
      productService.list({ q: dq, pageSize: 4 }).then((r) => r.items).catch(() => []),
      farmerService.list({ q: dq, pageSize: 4 }).then((r) => r.items).catch(() => []),
      invoiceService.list({ q: dq, pageSize: 4 }).then((r) => r.items).catch(() => []),
    ]).then(([products, farmers, bills]) => alive && setRes({ products, farmers, bills }));
    return () => { alive = false; };
  }, [dq]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function go(href: string) {
    setOpen(false); setQ(""); setRes(null);
    router.push(href);
  }
  // Enter: pehle jo mile uske page par, kuch nahi mila to products mein dhundho
  function onEnter() {
    const term = q.trim();
    if (!term) return;
    if (res?.products[0]) return go(`/products?q=${enc(term)}`);
    if (res?.farmers[0]) return go(`/customers?q=${enc(term)}`);
    if (res?.bills[0]) return go(`/bills?q=${enc(term)}`);
    go(`/products?q=${enc(term)}`);
  }

  const empty = res && !res.products.length && !res.farmers.length && !res.bills.length;
  const Group = ({ icon: Icon, title, children }: { icon: typeof Tags; title: string; children: React.ReactNode }) => (
    <li>
      <p className="flex items-center gap-2 bg-stone-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-stone-600"><Icon className="size-4" /> {title}</p>
      <ul>{children}</ul>
    </li>
  );
  const Item = ({ onClick, main, sub, right }: { onClick: () => void; main: string; sub?: string; right?: string }) => (
    <li>
      <button onClick={onClick} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-emerald-50">
        <span className="min-w-0"><span className="block truncate font-medium">{main}</span>{sub && <span className="block truncate text-sm text-stone-600">{sub}</span>}</span>
        {right && <span className="shrink-0 text-sm font-semibold">{right}</span>}
      </button>
    </li>
  );

  return (
    <div ref={box} className="relative max-w-md flex-1">
      <label className="relative block">
        <span className="sr-only">{t("header.search")}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-stone-500" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter") onEnter(); if (e.key === "Escape") setOpen(false); }}
          placeholder={t("header.search")} aria-expanded={open && !!res}
          className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-3 text-base placeholder:text-stone-500 focus:bg-white" />
      </label>

      {open && res && (
        <ul className="absolute left-0 right-0 z-30 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-xl">
          {res.products.length > 0 && (
            <Group icon={Tags} title={t("nav.products")}>
              {res.products.map((p) => <Item key={p.id} onClick={() => go(`/products?q=${enc(p.brandName)}`)} main={`${p.brandName} ${p.packSize}`} sub={p.technicalName} right={rupees(p.salePrice)} />)}
            </Group>
          )}
          {res.farmers.length > 0 && (
            <Group icon={Users} title={t("nav.customers")}>
              {res.farmers.map((f) => <Item key={f.id} onClick={() => go(`/customers?q=${enc(f.name)}`)} main={f.name} sub={f.mobile} right={f.balancePaise > 0 ? rupees(f.balancePaise) : undefined} />)}
            </Group>
          )}
          {res.bills.length > 0 && (
            <Group icon={FileText} title={t("nav.bills")}>
              {res.bills.map((b) => <Item key={b.id} onClick={() => go(`/bills?q=${enc(b.invoiceNo)}`)} main={b.invoiceNo} sub={b.farmerName || t("pos.walkin")} right={rupees(b.total)} />)}
            </Group>
          )}
          {empty && <li className="px-4 py-6 text-center text-stone-600">{t("header.noResults")}</li>}
        </ul>
      )}
    </div>
  );
}
