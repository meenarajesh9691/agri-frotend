"use client";
import { PackagePlus, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BarcodeBox } from "@/components/products/BarcodeBox";
import { ProductForm } from "@/components/products/ProductForm";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { PageTitle } from "@/components/ui/PageTitle";
import { Pagination } from "@/components/ui/Pagination";
import { useApi, useDebounced } from "@/hooks/useApi";
import { useUrlQ } from "@/hooks/useUrlQ";
import { useAuth } from "@/lib/auth-context";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/catalog";
import { rupees } from "@/lib/format";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { productService } from "@/services/product.service";
import type { NewProductPrefill, ScanStock, ShopProduct } from "@/types";

const PAGE_SIZE = 20;
type Editing = {
  product?: ShopProduct; barcode?: string; prefill?: NewProductPrefill["product"]; stock?: ScanStock;
  source?: "master" | "barcode" | "found"; // form ke upar kaun sa sandesh dikhe
} | null;

export default function ProductsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const isOwner = user.role === "OWNER";
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Editing>(null);
  const [actionError, setActionError] = useState("");
  const dq = useDebounced(q);
  const urlQ = useUrlQ();
  useEffect(() => { setQ(urlQ); setPage(1); }, [urlQ]); // upar ke search se aaye to box bhar do
  const { data, error, loading, reload } = useApi(() => productService.list({ q: dq, category, page, pageSize: PAGE_SIZE }), [dq, category, page]);

  async function remove(p: ShopProduct) {
    if (!window.confirm(t("prod.confirmRemove", { name: `${p.brandName} ${p.packSize}` }))) return;
    try { await productService.remove(p.id); reload(); } catch (e) { setActionError(getErrorMessage(e)); }
  }

  return (
    <>
      <PageTitle title={t("prod.title")} sub={t("prod.sub")}
        action={isOwner && (
          <div className="flex flex-wrap gap-2">
            <Link href="/products/import" className="inline-flex h-12 items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 font-semibold hover:bg-stone-50"><PackagePlus className="size-5" /> {t("prod.import")}</Link>
            <Button onClick={() => setEditing({})}><Plus className="size-5" /> {t("prod.add")}</Button>
          </div>
        )} />

      {isOwner && (
        <BarcodeBox
          onFound={(product, stock) => setEditing({ product, stock, source: stock ? "found" : undefined })}
          onNew={(barcode, p) => setEditing({ barcode, prefill: p?.product, stock: p?.stock, source: p?.source })}
        />
      )}

      <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="space-y-3 border-b border-stone-100 p-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-stone-500" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t("inv.search")} className="h-12 w-full rounded-xl border border-stone-200 pl-10 pr-3 text-base" />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[{ value: "", label: t("filter.all") }, ...CATEGORIES.map((c) => ({ value: c.value, label: t(c.label) }))].map((c) => (
              <button key={c.value} onClick={() => { setCategory(c.value); setPage(1); }} aria-pressed={category === c.value}
                className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium ${category === c.value ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>{c.label}</button>
            ))}
          </div>
        </div>

        {(error || actionError) && <div className="p-4"><ErrorNote message={(error ?? actionError)!} /></div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-base">
            <thead className="text-sm text-stone-600">
              <tr className="border-b border-stone-100">
                {["col.product", "col.pack", "col.gst", "col.mrp", "col.sale", "col.barcode"].map((k) => <th key={k} className="px-4 py-3 font-medium">{t(k as "col.product")}</th>)}
                {isOwner && <th className="w-40" />}
              </tr>
            </thead>
            <tbody>
              {data?.items.map((p) => (
                <tr key={p.id} className="border-b border-stone-50 last:border-0 hover:bg-emerald-50/40">
                  <td className="px-4 py-3.5">
                    <p className="font-medium">{p.brandName}</p>
                    <p className="text-sm text-stone-600">{[p.technicalName, p.company, t(CATEGORY_LABEL[p.category])].filter(Boolean).join(" · ")}</p>
                  </td>
                  <td className="px-4 py-3.5">{p.packSize}</td>
                  <td className="px-4 py-3.5">{p.gstPercent}%</td>
                  <td className="px-4 py-3.5 text-stone-600">{rupees(p.mrp)}</td>
                  <td className="px-4 py-3.5 font-semibold">{rupees(p.salePrice)}</td>
                  <td className="px-4 py-3.5 text-stone-600">{p.barcode || "-"}</td>
                  {isOwner && (
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <button className="mr-4 font-medium text-emerald-700 underline-offset-2 hover:underline" onClick={() => setEditing({ product: p })}>{t("common.edit")}</button>
                      <button className="font-medium text-red-700 underline-offset-2 hover:underline" onClick={() => remove(p)}>{t("common.remove")}</button>
                    </td>
                  )}
                </tr>
              ))}
              {!loading && data?.items.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-stone-600">{t("prod.empty")}</td></tr>}
              {loading && <tr><td colSpan={7} className="px-4 py-12 text-center text-stone-600">{t("common.wait")}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <Pagination page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onChange={setPage} />

      {editing && (
        <ProductForm product={editing.product} barcode={editing.barcode} prefill={editing.prefill} stock={editing.stock}
          source={editing.source} onClose={() => setEditing(null)} onDone={reload} />
      )}
    </>
  );
}
