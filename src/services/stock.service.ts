import { http, unwrap } from "@/lib/http";
import type { AdjustReason, Batch, ExpiryAlerts, Paged, StockRow, StockSummary } from "@/types";
import { ENDPOINTS as E } from "./endpoints";

export interface StockListParams { q?: string; status?: string; page?: number; pageSize?: number }
export interface PurchaseInput {
  supplier: string;
  billNo?: string;
  date?: string;
  items: { productId: string; batchNo: string; mfgDate?: string; expiryDate?: string; qty: number; purchasePrice: number }[];
}

const clean = (p: object) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== "" && v !== undefined));

export const stockService = {
  list: (params: StockListParams = {}) => unwrap<Paged<StockRow>>(http.get(E.stock.base, { params: clean(params) })),
  summary: () => unwrap<StockSummary>(http.get(E.stock.summary)),
  alerts: () => unwrap<ExpiryAlerts>(http.get(E.stock.alerts)),
  batches: (productId: string) => unwrap<Batch[]>(http.get(E.stock.batches(productId))),
  adjust: (body: { batchId: string; qtyChange: number; reason: AdjustReason; note?: string }) =>
    unwrap<{ qtyRemaining: number }>(http.post(E.stock.adjust, body)),
  writeOff: (batchId: string, reason: "EXPIRED" | "DAMAGED" = "EXPIRED") =>
    unwrap<{ removed: number }>(http.post(E.stock.writeOff(batchId), { reason })),
  createPurchase: (body: PurchaseInput) => unwrap<{ id: string; totalPaise: number; itemCount: number }>(http.post(E.purchases, body)),
};
