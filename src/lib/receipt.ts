import type { InvoiceLine, Invoice, PayMode } from "@/types";
import type { MessageKey } from "@/messages/en";

export const MODE_KEY: Record<PayMode, MessageKey> = { CASH: "pay.cash", UPI: "pay.upi", UDHAR: "pay.udhar", PARTIAL: "pay.partial" };

// Ek product kai batch se gaya ho to bill par ek hi line dikhe (grahak ko batch se matlab nahi)
export function mergeLines(items: InvoiceLine[]): InvoiceLine[] {
  const map = new Map<string, InvoiceLine>();
  for (const l of items) {
    const key = `${l.name}|${l.pack}|${l.rate}|${l.gstPercent}`;
    const cur = map.get(key);
    map.set(key, cur ? { ...cur, qty: Math.round((cur.qty + l.qty) * 1000) / 1000, amount: cur.amount + l.amount } : { ...l });
  }
  return [...map.values()];
}

export const billLines = (inv: Invoice) => mergeLines(inv.items ?? []);
