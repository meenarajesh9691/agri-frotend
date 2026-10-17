import { gtinCandidates, parseGs1, primaryBarcode } from "@/lib/gs1";
import type { MasterProductInfo, NewProductPrefill, ScanStock, ShopProduct } from "@/types";

export interface ScanApi {
  scan: (codes: string[]) => Promise<ShopProduct>; // 404 agar nahi mila
  checkMasterCatalog: (codes: string[]) => Promise<MasterProductInfo>; // 404 agar nahi mila
  isNotFound: (e: unknown) => boolean;
}

export type ScanResult =
  | { kind: "found"; product: ShopProduct; stock?: ScanStock }
  | { kind: "new"; code: string; prefill?: NewProductPrefill };

const fromMaster = (m: MasterProductInfo, barcode: string): NonNullable<NewProductPrefill["product"]> => ({
  brandName: m.brandName,
  technicalName: m.technicalName ?? "",
  company: m.company ?? "",
  category: m.category,
  packSize: m.packSize,
  hsn: m.hsn ?? "",
  gstPercent: String(m.gstPercent),
  mrp: String(m.mrp / 100),
  salePrice: String(m.mrp / 100), // shuru mein rate = MRP, owner kam kar sakta hai
  barcode: m.barcode || barcode,
});

/**
 * Scan hue code ka poora raasta:
 *  1. GS1 string ho to GTIN, batch aur expiry nikalo (nahi to code ko seedha barcode maano)
 *  2. GTIN ke roopon (14-digit, EAN-13...) se dukaan ka apna product dhundho
 *  3. nahi mila to master catalog dhundho
 *  4. catalog ki jaankari + barcode ki batch/expiry jodkar form ke liye prefill do
 * 404 ke alawa koi bhi error (server band, login khatam) upar ja kar user ko dikhta hai.
 */
export async function resolveScan(original: string, api: ScanApi): Promise<ScanResult> {
  const gs1 = parseGs1(original);
  const stock: ScanStock | undefined = gs1 && (gs1.batch || gs1.expiry) ? { batchNo: gs1.batch, expiry: gs1.expiry } : undefined;
  const codes = gs1 ? gtinCandidates(gs1.gtin) : [original];
  const barcode = gs1 ? primaryBarcode(gs1.gtin) : original;

  const orNull = <T,>(p: Promise<T>) => p.catch((e) => { if (api.isNotFound(e)) return null; throw e; });

  const local = await orNull(api.scan(codes));
  if (local) return { kind: "found", product: local, stock };

  const master = await orNull(api.checkMasterCatalog(codes));
  if (master) return { kind: "new", code: original, prefill: { source: "master", product: fromMaster(master, barcode), stock } };

  // Catalog mein bhi nahi: GS1 tha to kam se kam barcode, batch aur expiry bhar do
  return { kind: "new", code: original, prefill: gs1 ? { source: "barcode", product: { barcode }, stock } : undefined };
}
