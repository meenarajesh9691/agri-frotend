import { fmtDateFull, rupees } from "@/lib/format";
import { billLines } from "@/lib/receipt";
import type { useI18n } from "@/lib/i18n";
import type { Invoice, Shop } from "@/types";

type T = ReturnType<typeof useI18n>["t"];

/** Bill ka seedha text. wa.me link bina kisi API ke, free chalta hai. */
export function whatsappText(inv: Invoice, shop: Shop, t: T) {
  const lines = billLines(inv).map((l) => `${l.name} ${l.pack}  ${l.qty} x ${rupees(l.rate)} = ${rupees(l.amount)}`);
  return [
    `*${shop.name}*`,
    `${t("rc.billNo")}: ${inv.invoiceNo}  |  ${fmtDateFull(inv.createdAt)}`,
    "------------------",
    ...lines,
    "------------------",
    `*${t("pos.total")}: ${rupees(inv.total)}*`,
    inv.paid > 0 ? `${t("rc.paid")}: ${rupees(inv.paid)}` : "",
    inv.credit > 0 ? `${t("rc.credit")}: ${rupees(inv.credit)}` : "",
    "",
    t("rc.thanks"),
  ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
}

/** Kisaan ka mobile ho to seedha uska chat khulta hai, nahi to WhatsApp khud poochta hai */
export function whatsappUrl(inv: Invoice, shop: Shop, t: T) {
  const to = /^\d{10}$/.test(inv.farmerMobile ?? "") ? `91${inv.farmerMobile}` : "";
  return `https://wa.me/${to}?text=${encodeURIComponent(whatsappText(inv, shop, t))}`;
}
