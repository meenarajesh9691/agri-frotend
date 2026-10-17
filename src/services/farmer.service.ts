import { http, unwrap } from "@/lib/http";
import type { Farmer, LedgerItem, Paged } from "@/types";
import { ENDPOINTS as E } from "./endpoints";

export interface FarmerInput { name: string; mobile: string; village?: string }
const clean = (p: object) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== "" && v !== undefined));

export const farmerService = {
  list: (params: { q?: string; owing?: boolean; page?: number; pageSize?: number } = {}) =>
    unwrap<Paged<Farmer> & { summary: { totalDuePaise: number } }>(http.get(E.farmers.base, { params: clean({ ...params, owing: params.owing ? "true" : undefined }) })),
  create: (body: FarmerInput) => unwrap<Farmer>(http.post(E.farmers.base, body)),
  update: (id: string, body: FarmerInput) => unwrap<Farmer>(http.put(E.farmers.byId(id), body)),
  ledger: (id: string, page = 1) =>
    unwrap<Paged<LedgerItem> & { farmer: Farmer; balancePaise: number }>(http.get(E.farmers.ledger(id), { params: { page, pageSize: 20 } })),
  refund: (id: string, amountPaise: number) => unwrap<{ balancePaise: number }>(http.post(E.farmers.refund(id), { amountPaise })),
  receivePayment: (id: string, body: { amountPaise: number; mode: "CASH" | "UPI"; note?: string }) =>
    unwrap<{ balancePaise: number }>(http.post(E.farmers.payments(id), body)),
};
