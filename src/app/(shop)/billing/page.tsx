"use client";
import { CheckCircle2, MessageCircle, Printer } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BillDialog } from "@/components/bills/BillDialog";
import { CartTable } from "@/components/billing/CartTable";
import { ProductSearch } from "@/components/billing/ProductSearch";
import { TotalCard } from "@/components/billing/TotalCard";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { PageTitle } from "@/components/ui/PageTitle";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/lib/auth-context";
import { calcTotals } from "@/lib/billing";
import { rupees } from "@/lib/format";
import { getErrorMessage } from "@/lib/http";
import { whatsappUrl } from "@/lib/whatsapp";
import { useI18n } from "@/lib/i18n";
import { invoiceService } from "@/services/invoice.service";
import type { Farmer, Invoice, PayMode } from "@/types";

const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function BillingPage() {
  const { t } = useI18n();
  const { subscription, shop } = useAuth();
  const blockOversell = !!shop.blockOversell;
  const cart = useCart();
  const [mode, setMode] = useState<PayMode>("CASH");
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [discount, setDiscount] = useState("");
  const [paid, setPaid] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Invoice | null>(null);
  const [printing, setPrinting] = useState<{ id: string; auto: boolean } | null>(null);
  // Ek bill ki ek pehchaan. Save fail ho aur dobara dabayein to server same bill pehchan leta hai, double nahi banta.
  const clientId = useRef(newId());

  const totals = calcTotals(cart.lines, Math.round((Number(discount) || 0) * 100));
  const paidPaise = Math.round((Number(paid) || 0) * 100);
  const onCredit = mode === "UDHAR" || mode === "PARTIAL";
  const overStock = blockOversell && cart.lines.some((l) => l.qty > l.row.sellableQty);

  // Aadhi payment: rakam 0 se zyada aur bill se kam. Khaali ho to darane ki jagah sirf samjhate hain (hint), save band rehta hai.
  const partialOk = mode !== "PARTIAL" || (paidPaise > 0 && paidPaise < totals.total);
  let problem: string | null = null;
  if (onCredit && !farmer) problem = t("pos.needCustomer");
  else if (mode === "PARTIAL" && paid.trim() !== "" && !partialOk) problem = t("pos.partialCheck");
  else if (overStock) problem = t("pos.overStock");
  const canSave = subscription.canBill && cart.lines.length > 0 && totals.total > 0 && partialOk && !problem && !saving;

  const reset = useCallback(() => {
    cart.clear(); setFarmer(null); setDiscount(""); setPaid(""); setMode("CASH"); setError("");
    clientId.current = newId();
  }, [cart]);

  async function save() {
    if (!canSave) return;
    setSaving(true); setError("");
    try {
      const invoice = await invoiceService.create({
        clientId: clientId.current,
        farmerId: farmer?.id,
        items: cart.lines.map((l) => ({ productId: l.row.product.id, qty: l.qty })),
        discountPaise: totals.discount,
        paymentMode: mode,
        paidPaise: mode === "PARTIAL" ? paidPaise : undefined,
      });
      setDone(invoice);
      reset();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  // F2 = bill save, F4 = naya bill
  const latest = useRef({ save, reset });
  useEffect(() => { latest.current = { save, reset }; });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F2") { e.preventDefault(); latest.current.save(); }
      if (e.key === "F4") { e.preventDefault(); latest.current.reset(); setDone(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <PageTitle title={t("pos.title")} sub={t("pos.sub")} />
      {!subscription.canBill && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 font-medium text-red-800">{t("pos.blocked")}</p>}
      {error && <div className="mb-4"><ErrorNote message={error} /></div>}
      {done && (
        <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 font-medium text-emerald-800">
          <span className="flex items-center gap-2"><CheckCircle2 className="size-5 shrink-0" /> {t("pos.created", { no: done.invoiceNo, amount: rupees(done.total) })}</span>
          <span className="flex gap-2">
            <Button className="h-11" onClick={() => setPrinting({ id: done.id, auto: true })}><Printer className="size-5" /> {t("bill.printNow")}</Button>
            <Button variant="secondary" className="h-11" onClick={() => window.open(whatsappUrl(done, shop, t), "_blank", "noopener")}><MessageCircle className="size-5" /> {t("bill.whatsapp")}</Button>
          </span>
        </div>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_23rem]">
        <div className="space-y-4">
          <ProductSearch onAdd={(row) => { setDone(null); cart.add(row); }} />
          <CartTable lines={cart.lines} blockOversell={blockOversell} onQty={cart.setQty} onRemove={cart.remove} />
        </div>
        <TotalCard totals={totals} mode={mode} onMode={setMode} farmer={farmer} onFarmer={setFarmer}
          discount={discount} onDiscount={setDiscount} paid={paid} onPaid={setPaid}
          problem={problem} disabled={!canSave} saving={saving} onSave={save} />
      </div>
      {printing && <BillDialog invoiceId={printing.id} autoPrint={printing.auto} onClose={() => setPrinting(null)} />}
    </>
  );
}
