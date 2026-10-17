import { http, unwrap } from "@/lib/http";
import type { Invoice, Paged, PayMode, SalesSummary } from "@/types";
import { ENDPOINTS as E } from "./endpoints";

export interface CreateBillInput {
  clientId: string;
  farmerId?: string;
  items: { productId: string; qty: number }[];
  discountPaise: number;
  paymentMode: PayMode;
  paidPaise?: number;
}
const clean = (p: object) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== "" && v !== undefined));

export const invoiceService = {
  create: (body: CreateBillInput) => unwrap<Invoice>(http.post(E.invoices.base, body)),
  list: (params: { q?: string; status?: string; page?: number; pageSize?: number } = {}) =>
    unwrap<Paged<Invoice>>(http.get(E.invoices.base, { params: clean(params) })),
  get: (id: string) => unwrap<Invoice>(http.get(E.invoices.byId(id))),
  cancel: (id: string, reason: string) => unwrap<Invoice>(http.post(E.invoices.cancel(id), { reason })),
  summary: () => unwrap<SalesSummary>(http.get(E.invoices.summary)),
};
