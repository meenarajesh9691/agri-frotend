"use client";
import { ArrowLeft, CheckCircle2, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { OwnerOnly } from "@/components/auth/OwnerOnly";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { PageTitle } from "@/components/ui/PageTitle";
import { Pagination } from "@/components/ui/Pagination";
import { useApi, useDebounced } from "@/hooks/useApi";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/catalog";
import { rupees } from "@/lib/format";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { productService } from "@/services/product.service";

const PAGE_SIZE = 50;

export default function ImportPage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set()); // pages ke beech bhi chuna hua yaad rehta hai
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const dq = useDebounced(q);
  const { data, error, loading, reload } = useApi(() => productService.catalog({ q: dq, category, page, pageSize: PAGE_SIZE }), [dq, category, page]);

  const selectable = data?.items.filter((i) => !i.imported) ?? [];
  const allOnPage = selectable.length > 0 && selectable.every((i) => selected.has(i.id));

  function toggle(id: string) {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function togglePage() {
    setSelected((s) => { const n = new Set(s); selectable.forEach((i) => (allOnPage ? n.delete(i.id) : n.add(i.id))); return n; });
  }

  async function save() {
    setSaving(true); setSaveError(""); setMessage("");
    try {
      const r = await productService.importMaster([...selected]);
      setMessage([t("imp.done", { added: r.added, skipped: r.skipped }), r.failed ? t("imp.failed", { n: r.failed }) : ""].filter(Boolean).join(". "));
      setSelected(new Set());
      reload();
    } catch (e) {
      setSaveError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <OwnerOnly>
      <Link href="/products" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700"><ArrowLeft className="size-4" /> {t("imp.back")}</Link>
      <PageTitle title={t("imp.title")} sub={t("imp.sub")} />

      {message && <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-medium text-emerald-800"><CheckCircle2 className="size-5" /> {message}</p>}
      {(error || saveError) && <div className="mb-4"><ErrorNote message={(error ?? saveError)!} /></div>}

      <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="space-y-3 border-b border-stone-100 p-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-stone-500" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t("inv.search")} className="h-12 w-full rounded-xl border border-stone-200 pl-10 pr-3 text-base" />
          </label>
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[{ value: "", label: t("filter.all") }, ...CATEGORIES.map((c) => ({ value: c.value, label: t(c.label) }))].map((c) => (
                <button key={c.value} onClick={() => { setCategory(c.value); setPage(1); }} aria-pressed={category === c.value}
                  className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium ${category === c.value ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>{c.label}</button>
              ))}
            </div>
            <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="size-5 accent-emerald-600" checked={allOnPage} onChange={togglePage} disabled={selectable.length === 0} /> {t("imp.selectPage")}
            </label>
          </div>
        </div>

        <ul className="divide-y divide-stone-100">
          {data?.items.map((i) => (
            <li key={i.id}>
              <label className={`flex items-center gap-4 px-4 py-3.5 ${i.imported ? "opacity-60" : "cursor-pointer hover:bg-emerald-50/40"}`}>
                <input type="checkbox" className="size-5 shrink-0 accent-emerald-600" disabled={i.imported} checked={i.imported || selected.has(i.id)} onChange={() => toggle(i.id)} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{i.brandName} <span className="text-stone-600">{i.packSize}</span></span>
                  <span className="block truncate text-sm text-stone-600">{[i.technicalName, i.company, t(CATEGORY_LABEL[i.category])].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="text-right">
                  <span className="block font-medium">{rupees(i.mrp)}</span>
                  {i.imported && <span className="text-xs font-medium text-emerald-700">{t("imp.added")}</span>}
                </span>
              </label>
            </li>
          ))}
          {!loading && data?.items.length === 0 && <li className="px-4 py-12 text-center text-stone-600">{t("imp.empty")}</li>}
          {loading && <li className="px-4 py-12 text-center text-stone-600">{t("common.wait")}</li>}
        </ul>
      </section>
      <Pagination page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onChange={setPage} />

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-30 flex justify-center px-4 md:bottom-6 md:left-64">
          <Button onClick={save} disabled={saving} className="h-14 px-8 text-lg shadow-xl">{saving ? t("common.wait") : t("imp.button", { n: selected.size })}</Button>
        </div>
      )}
    </OwnerOnly>
  );
}
