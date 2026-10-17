import type { StockRow } from "@/types";

export interface CartLine { row: StockRow; qty: number }

export const lineAmount = (l: CartLine) => Math.round(l.qty * l.row.product.salePrice);

// Server wala hi formula: rate GST shamil, discount par tax usi anupaat mein kam. Asli total server batata hai.
export function calcTotals(lines: CartLine[], discount: number) {
  const gross = lines.reduce((s, l) => s + lineAmount(l), 0);
  const off = Math.min(Math.max(discount, 0), gross);
  const total = gross - off;
  const taxFull = lines.reduce((s, l) => {
    const a = lineAmount(l);
    return s + Math.round(a - a / (1 + l.row.product.gstPercent / 100));
  }, 0);
  const tax = gross === 0 ? 0 : Math.round((taxFull * total) / gross);
  return { items: lines.reduce((s, l) => s + l.qty, 0), subtotal: total - tax, tax, discount: off, total };
}
