import { http, unwrap } from "@/lib/http";
import type { ImportResult, MasterItem, MasterProductInfo, Paged, ShopProduct } from "@/types";
import { ENDPOINTS as E } from "./endpoints";

export interface ListParams { q?: string; category?: string; page?: number; pageSize?: number }
export type ProductInput = Omit<ShopProduct, "id" | "masterId">;

const clean = (p: ListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== "" && v !== undefined));

export const productService = {
  list: (params: ListParams = {}) => unwrap<Paged<ShopProduct>>(http.get(E.products.base, { params: clean(params) })),
  // Ek code ya kai roop (GTIN-14 aur EAN-13): koi bhi match ho jaye. Nahi mila to 404.
  scan: (code: string | string[]) => unwrap<ShopProduct>(http.get(E.products.scan, { params: { code: [code].flat().join(",") } })),
  // Admin ke master catalog mein barcode dhundhna. Nahi mila to 404.
  checkMasterCatalog: (code: string | string[]) =>
    unwrap<MasterProductInfo>(http.get(`${E.masterProducts}/scan`, { params: { code: [code].flat().join(",") } })),
  create: (body: ProductInput) => unwrap<ShopProduct>(http.post(E.products.base, body)),
  update: (id: string, body: ProductInput) => unwrap<ShopProduct>(http.put(E.products.byId(id), body)),
  remove: (id: string) => unwrap<null>(http.delete(E.products.byId(id))),
  catalog: (params: ListParams = {}) => unwrap<Paged<MasterItem>>(http.get(E.masterProducts, { params: clean(params) })),
  importMaster: (ids: string[]) => unwrap<ImportResult>(http.post(E.products.importMaster, { ids })),
};
