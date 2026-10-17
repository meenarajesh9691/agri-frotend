"use client";
import { Banknote, BookOpen, CheckCircle2, Coins, Info, Smartphone } from "lucide-react";
import { FarmerPicker } from "@/components/billing/FarmerPicker";
import { rupees } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import type { MessageKey } from "@/messages/en";
import type { Farmer, PayMode } from "@/types";

// Har tareeke ke neeche chhota sa matlab likha hai, taaki Credit aur Part payment mein confusion na ho
const MODES = [
  { value: "CASH", label: "pay.cash", sub: "pay.cashSub", hint: "pay.hintFull", icon: Banknote },
  { value: "UPI", label: "pay.upi", sub: "pay.upiSub", hint: "pay.hintFull", icon: Smartphone },
  { value: "UDHAR", label: "pay.udhar", sub: "pay.udharSub", hint: "pay.hintCredit", icon: BookOpen },
  { value: "PARTIAL", label: "pay.partial", sub: "pay.partialSub", hint: "pay.hintPartial", icon: Coins },
] as const satisfies readonly { value: PayMode; label: MessageKey; sub: MessageKey; hint: MessageKey; icon: unknown }[];

interface Props {
  totals: { items: number; subtotal: number; tax: number; discount: number; total: number };
  mode: PayMode; onMode: (m: PayMode) => void;
  farmer: Farmer | null; onFarmer: (f: Farmer | null) => void;
  discount: string; onDiscount: (v: string) => void;
  paid: string; onPaid: (v: string) => void;
  problem: string | null; disabled: boolean; saving: boolean; onSave: () => void;
}

const Row = ({ k, v, strong }: { k: string; v: string; strong?: boolean }) => (
  <div className={`flex justify-between text-base ${strong ? "font-semibold" : ""}`}><span className={strong ? "" : "text-stone-600"}>{k}</span><span>{v}</span></div>
);

export function TotalCard({ totals, mode, onMode, farmer, onFarmer, discount, onDiscount, paid, onPaid, problem, disabled, saving, onSave }: Props) {
  const { t } = useI18n();
  const current = MODES.find((m) => m.value === mode)!;
  const onCredit = mode === "UDHAR" || mode === "PARTIAL";
  const paidPaise = Math.round((Number(paid) || 0) * 100);
  const partialValid = mode === "PARTIAL" && paidPaise > 0 && paidPaise < totals.total;

  return (
    <aside className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <FarmerPicker value={farmer} onChange={onFarmer} required={onCredit} />

      <fieldset>
        <legend className="mb-1.5 text-base font-medium">{t("pos.payment")}</legend>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map(({ value, label, sub, icon: Icon }) => (
            <button key={value} type="button" onClick={() => onMode(value)} aria-pressed={mode === value}
              className={`flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2 ${mode === value ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-stone-200 text-stone-700 hover:bg-stone-50"}`}>
              <span className="flex items-center gap-2 text-base font-semibold"><Icon className="size-5" /> {t(label)}</span>
              <span className="text-center text-xs leading-tight text-stone-600">{t(sub)}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 flex items-start gap-2 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700">
          <Info className="mt-0.5 size-4 shrink-0 text-stone-500" aria-hidden /> {t(current.hint)}
        </p>
      </fieldset>

      {mode === "PARTIAL" && (
        <label className="flex items-center justify-between gap-3 text-base">
          <span className="font-medium">{t("pos.paid")}</span>
          <input inputMode="decimal" value={paid} onChange={(e) => onPaid(e.target.value)} autoFocus className="h-11 w-28 rounded-lg border border-emerald-500 px-3 text-right" />
        </label>
      )}
      <label className="flex items-center justify-between gap-3 text-base">
        <span className="font-medium">{t("pos.discount")}</span>
        <input inputMode="decimal" value={discount} onChange={(e) => onDiscount(e.target.value)} placeholder="0" className="h-11 w-28 rounded-lg border border-stone-300 px-3 text-right" />
      </label>

      <div className="space-y-2 border-t border-dashed border-stone-200 pt-4">
        <Row k={t("pos.items", { n: totals.items })} v={rupees(totals.subtotal)} />
        <Row k={t("pos.gst")} v={rupees(totals.tax)} />
        {totals.discount > 0 && <Row k={t("pos.discountRow")} v={`- ${rupees(totals.discount)}`} />}
        <div className="flex items-end justify-between pt-2">
          <span className="text-base font-medium">{t("pos.total")}</span>
          <span className="text-3xl font-bold tracking-tight text-emerald-700">{rupees(totals.total)}</span>
        </div>
        {/* Bill ke paise kahan gaye: abhi mile aur khate mein */}
        {mode === "UDHAR" && totals.total > 0 && <Row k={t("pos.toKhata")} v={rupees(totals.total)} strong />}
        {partialValid && (
          <>
            <Row k={t("pos.receivedNow")} v={rupees(paidPaise)} />
            <Row k={t("pos.toKhata")} v={rupees(totals.total - paidPaise)} strong />
          </>
        )}
      </div>

      {problem && <p role="alert" className="text-sm font-medium text-amber-700">{problem}</p>}
      <button onClick={onSave} disabled={disabled}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-lg font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300">
        <CheckCircle2 className="size-6" /> {saving ? t("common.wait") : t("pos.save")} <kbd className="rounded bg-white/20 px-1.5 text-xs">F2</kbd>
      </button>
    </aside>
  );
}
