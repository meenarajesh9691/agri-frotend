"use client";
import { forwardRef } from "react";
import { fmtDateFull, rupees } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { paperOf, type PaperSize } from "@/lib/print";
import { MODE_KEY, billLines } from "@/lib/receipt";
import type { Invoice, Shop } from "@/types";

interface Props { invoice: Invoice; shop: Shop; paper: PaperSize }

/** Bill ki shakal. Thermal (58/80mm) chhoti aur seedhi, A4/A5 poora table wala. Preview aur print dono yahi use karte hain. */
export const BillReceipt = forwardRef<HTMLDivElement, Props>(function BillReceipt({ invoice: inv, shop, paper }, ref) {
  const { t } = useI18n();
  const cfg = paperOf(paper);
  const lines = billLines(inv);
  const cancelled = inv.status === "CANCELLED";
  const licenses = [
    shop.pesticideLicenseNo && `${t("rc.licPesticide")}: ${shop.pesticideLicenseNo}`,
    shop.seedLicenseNo && `${t("rc.licSeed")}: ${shop.seedLicenseNo}`,
    shop.fertilizerLicenseNo && `${t("rc.licFert")}: ${shop.fertilizerLicenseNo}`,
  ].filter(Boolean) as string[];

  const Total = ({ k, v, bold }: { k: string; v: string; bold?: boolean }) => (
    <div className={`flex justify-between gap-4 ${bold ? "text-base font-bold" : ""}`}><span>{k}</span><span>{v}</span></div>
  );
  const totals = (
    <div className="space-y-0.5">
      <Total k={t("rc.taxable")} v={rupees(inv.subtotal)} />
      <Total k={t("rc.gst")} v={rupees(inv.tax)} />
      {inv.discount > 0 && <Total k={t("pos.discountRow")} v={`- ${rupees(inv.discount)}`} />}
      <div className="my-1 border-t border-black" />
      <Total k={t("pos.total")} v={rupees(inv.total)} bold />
      <Total k={t("rc.paid")} v={rupees(inv.paid)} />
      {inv.credit > 0 && <Total k={t("rc.credit")} v={rupees(inv.credit)} bold />}
    </div>
  );
  const footer = (
    <div className="mt-3 text-center">
      <p>{shop.billFooter || t("rc.thanks")}</p>
      <p className="text-[0.85em] text-neutral-600">{t("rc.inclGst")}</p>
    </div>
  );

  if (cfg.compact) {
    return (
      <div id="bill-root" ref={ref} style={{ width: `${cfg.widthMm}mm`, fontSize: cfg.widthMm <= 58 ? 11 : 12, lineHeight: 1.35 }}
        className="mx-auto bg-white p-2 text-black shadow-md">
        <div className="text-center">
          <p className="text-base font-bold">{shop.name}</p>
          {shop.billHeader && <p>{shop.billHeader}</p>}
          {shop.address && <p>{shop.address}</p>}
          {shop.phone && <p>{shop.phone}</p>}
          {shop.gstin && <p>{t("rc.gstin")}: {shop.gstin}</p>}
          {licenses.map((l) => <p key={l} className="text-[0.9em]">{l}</p>)}
        </div>
        {cancelled && <p className="my-1 border border-black py-0.5 text-center font-bold">{t("rc.cancelled")}</p>}
        <div className="my-1.5 border-t border-dashed border-black" />
        <p>{t("rc.billNo")}: <b>{inv.invoiceNo}</b></p>
        <p>{fmtDateFull(inv.createdAt)}</p>
        {inv.farmerName && <p>{t("rc.customer")}: {inv.farmerName}{inv.farmerMobile ? ` (${inv.farmerMobile})` : ""}</p>}
        <p>{t("rc.mode")}: {t(MODE_KEY[inv.paymentMode])}</p>
        <div className="my-1.5 border-t border-dashed border-black" />
        {lines.map((l, i) => (
          <div key={i} className="mb-1">
            <p className="font-semibold">{l.name} {l.pack}</p>
            <div className="flex justify-between"><span>{l.qty} x {rupees(l.rate)}</span><span>{rupees(l.amount)}</span></div>
          </div>
        ))}
        <div className="my-1.5 border-t border-dashed border-black" />
        {totals}
        <div className="my-1.5 border-t border-dashed border-black" />
        {footer}
      </div>
    );
  }

  return (
    <div id="bill-root" ref={ref} style={{ width: `${cfg.widthMm}mm`, fontSize: cfg.widthMm <= 148 ? 12 : 13, lineHeight: 1.45 }}
      className="mx-auto bg-white p-6 text-black shadow-md">
      <div className="flex items-start justify-between gap-6 border-b-2 border-black pb-3">
        <div>
          <p className="text-2xl font-bold">{shop.name}</p>
          {shop.billHeader && <p>{shop.billHeader}</p>}
          {shop.address && <p>{shop.address}</p>}
          {shop.phone && <p>{shop.phone}</p>}
          {shop.gstin && <p>{t("rc.gstin")}: {shop.gstin}</p>}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{cancelled ? t("rc.cancelled") : t("pos.title")}</p>
          <p>{t("rc.billNo")}: <b>{inv.invoiceNo}</b></p>
          <p>{fmtDateFull(inv.createdAt)}</p>
          <p>{t("rc.mode")}: {t(MODE_KEY[inv.paymentMode])}</p>
        </div>
      </div>
      {inv.farmerName && (
        <p className="py-2">{t("rc.customer")}: <b>{inv.farmerName}</b>{inv.farmerMobile ? ` · ${inv.farmerMobile}` : ""}</p>
      )}
      <table className="mt-2 w-full border-collapse">
        <thead>
          <tr className="border-y border-black text-left">
            <th className="py-1.5">#</th><th>{t("rc.item")}</th><th className="text-right">{t("pos.qty")}</th>
            <th className="text-right">{t("col.rate")}</th><th className="text-right">GST</th><th className="text-right">{t("pos.amount")}</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i} className="border-b border-neutral-300">
              <td className="py-1.5">{i + 1}</td><td>{l.name} {l.pack}</td><td className="text-right">{l.qty}</td>
              <td className="text-right">{rupees(l.rate)}</td><td className="text-right">{l.gstPercent}%</td><td className="text-right">{rupees(l.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex justify-end"><div className="w-72">{totals}</div></div>
      <div className="mt-6 flex items-end justify-between gap-6 border-t border-neutral-400 pt-3">
        <div className="text-[0.9em]">{licenses.map((l) => <p key={l}>{l}</p>)}</div>
        <p className="text-[0.9em]">{t("rc.signature")}: ____________</p>
      </div>
      {footer}
    </div>
  );
});
