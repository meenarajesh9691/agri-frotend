"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Field, SelectField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { CATEGORIES, GST_RATES } from "@/lib/catalog";
import { isoToDMY, parseDateInput, todayISO } from "@/lib/dates";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { productService } from "@/services/product.service";
import { stockService } from "@/services/stock.service";
import type { Category, NewProductPrefill, ScanStock, ShopProduct } from "@/types";

const toRupees = (paise?: number) => (paise ? String(paise / 100) : "");

interface Props {
  product?: ShopProduct; // badalna ho to
  barcode?: string; // naya product, jo code scan hua
  prefill?: NewProductPrefill["product"]; // catalog / barcode se bhari jaankari
  stock?: ScanStock; // barcode se padhi batch aur expiry
  source?: "master" | "barcode" | "found";
  onClose: () => void;
  onDone: () => void;
}

export function ProductForm({ product, barcode, prefill, stock, source, onClose, onDone }: Props) {
  const { t } = useI18n();
  const [v, setV] = useState({
    brandName: product?.brandName ?? prefill?.brandName ?? "",
    technicalName: product?.technicalName ?? prefill?.technicalName ?? "",
    company: product?.company ?? prefill?.company ?? "",
    category: (product?.category ?? prefill?.category ?? "PESTICIDE") as Category,
    packSize: product?.packSize ?? prefill?.packSize ?? "",
    hsn: product?.hsn ?? prefill?.hsn ?? "",
    gstPercent: String(product?.gstPercent ?? prefill?.gstPercent ?? 18),
    mrp: product ? toRupees(product.mrp) : (prefill?.mrp ?? ""),
    salePrice: product ? toRupees(product.salePrice) : (prefill?.salePrice ?? ""),
    barcode: product?.barcode ?? prefill?.barcode ?? barcode ?? "", // prefill ka barcode pehle: scan hui poori GS1 string nahi
    minQty: String(product?.minQty ?? prefill?.minQty ?? 0),
  });
  // Stock ka hissa: barcode se batch/expiry mili ho to pehle se chalu
  const [addStock, setAddStock] = useState(!!stock);
  const [st, setSt] = useState({
    batchNo: stock?.batchNo ?? "",
    expiry: stock?.expiry ? isoToDMY(stock.expiry) : "",
    qty: "1",
    cost: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const savedId = useRef<string | null>(null); // product save ho chuka ho to stock fail hone par dobara save nahi karte

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((s) => ({ ...s, [k]: e.target.value }));
  const setStock = (k: keyof typeof st) => (e: React.ChangeEvent<HTMLInputElement>) => setSt((s) => ({ ...s, [k]: e.target.value }));
  const f = (k: keyof typeof v, label: string, extra = {}) => <Field label={label} value={v[k]} onChange={set(k)} {...extra} />;

  const notice =
    source === "master" ? t("prod.autoMaster")
    : source === "barcode" ? t("prod.autoBarcode")
    : source === "found" ? t("prod.foundStock")
    : barcode && !product ? t("prod.newBarcode", { code: barcode })
    : "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const mrp = Math.round(Number(v.mrp) * 100);
    const salePrice = Math.round(Number(v.salePrice || v.mrp) * 100); // rate khaali ho to MRP
    if (!v.brandName.trim() || !v.packSize.trim()) return setError(`${t("f.brand")}, ${t("f.pack")}`);
    if (!(mrp > 0)) return setError(`${t("f.mrp")}?`);
    if (salePrice > mrp) return setError("Bikri ka rate MRP se zyada nahi ho sakta");

    let expiryDate: string | undefined;
    if (addStock) {
      const exp = parseDateInput(st.expiry, "end");
      if (!st.batchNo.trim() || !(Number(st.qty) > 0)) return setError(t("prod.badStock"));
      if (exp === null) return setError(t("prod.badDate"));
      if (!exp && v.category !== "FERTILIZER") return setError(t("prod.needExpiry"));
      expiryDate = exp || undefined;
    }

    setLoading(true); setError("");
    let stage: "product" | "stock" = "product";
    try {
      if (!savedId.current) {
        const body = {
          brandName: v.brandName.trim(), technicalName: v.technicalName.trim(), company: v.company.trim(), category: v.category,
          packSize: v.packSize.trim(), hsn: v.hsn.trim(), gstPercent: Number(v.gstPercent), mrp, salePrice,
          barcode: v.barcode.trim(), minQty: Math.max(0, Math.floor(Number(v.minQty) || 0)),
        };
        const saved = await (product ? productService.update(product.id, body) : productService.create(body));
        savedId.current = saved.id;
        onDone();
      }
      if (addStock) {
        stage = "stock";
        await stockService.createPurchase({
          supplier: "Opening stock",
          date: todayISO(),
          items: [{
            productId: savedId.current, batchNo: st.batchNo.trim(), expiryDate,
            qty: Number(st.qty), purchasePrice: Math.round((Number(st.cost) || 0) * 100),
          }],
        });
        onDone();
      }
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(stage === "stock" ? t("prod.stockSaveFailed", { msg }) : msg);
      setLoading(false);
    }
  }

  return (
    <Modal title={product ? t("prod.edit") : t("prod.add")} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {notice && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {f("brandName", t("f.brand"), { autoFocus: !prefill })}
          {f("technicalName", t("f.salt"))}
          {f("company", t("f.company"))}
          <SelectField label={t("f.category")} value={v.category} onChange={set("category")}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{t(c.label)}</option>)}
          </SelectField>
          {f("packSize", t("f.pack"), { placeholder: "100ml, 50kg" })}
          {f("barcode", t("f.barcode"), { inputMode: "numeric" })}
          {f("mrp", t("f.mrp"), { inputMode: "decimal" })}
          <Field label={t("f.sale")} value={v.salePrice} onChange={set("salePrice")} inputMode="decimal" placeholder={v.mrp} />
          <SelectField label={t("f.gst")} value={v.gstPercent} onChange={set("gstPercent")}>
            {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
          </SelectField>
          {f("hsn", t("f.hsn"), { inputMode: "numeric" })}
          {f("minQty", t("f.minQty"), { inputMode: "numeric" })}
        </div>

        <fieldset className="space-y-3 rounded-2xl border border-stone-200 p-4">
          <label className="flex cursor-pointer items-center gap-3 font-medium">
            <input type="checkbox" className="size-5 accent-emerald-600" checked={addStock} onChange={(e) => setAddStock(e.target.checked)} /> {t("prod.addStock")}
          </label>
          {addStock && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("rcv.batchNo")} value={st.batchNo} onChange={setStock("batchNo")} />
              <Field label={t("rcv.exp")} value={st.expiry} onChange={setStock("expiry")} placeholder="MM/YYYY" />
              <Field label={t("rcv.qty")} value={st.qty} onChange={setStock("qty")} inputMode="decimal" />
              <Field label={t("rcv.cost")} value={st.cost} onChange={setStock("cost")} inputMode="decimal" />
            </div>
          )}
        </fieldset>

        {error && <ErrorNote message={error} />}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="submit" disabled={loading}>{loading ? t("common.wait") : t("common.save")}</Button>
        </div>
      </form>
    </Modal>
  );
}
