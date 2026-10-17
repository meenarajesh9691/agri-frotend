export interface ApiResponse<T> { success: boolean; message: string; data: T }

export interface User {
  id: string;
  name: string;
  phone: string;
  role: "OWNER" | "STAFF";
  isActive: boolean;
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  address?: string;
  gstin?: string;
  pesticideLicenseNo?: string;
  seedLicenseNo?: string;
  fertilizerLicenseNo?: string;
  blockOversell?: boolean;
  paperSize?: "THERMAL_58" | "THERMAL_80" | "A4" | "A5";
  billHeader?: string;
  billFooter?: string;
}

export interface Subscription {
  status: "ACTIVE" | "GRACE" | "EXPIRED" | "SUSPENDED";
  endDate: string;
  daysLeft: number;
  graceEndsAt: string;
  graceDaysLeft: number;
  canBill: boolean; // naya bill ban sakta hai?
  serverTime: string;
}

export interface Me { user: User; shop: Shop; subscription: Subscription }

export type Category = "FERTILIZER" | "SEED" | "PESTICIDE";

export interface Paged<T> { items: T[]; total: number; page: number; pageSize: number }

/** Dukaan ka asli product (API se). Paise integer mein. Stock agle step mein judega. */
export interface ShopProduct {
  id: string;
  masterId?: string;
  brandName: string;
  technicalName?: string;
  company?: string;
  category: Category;
  packSize: string;
  hsn?: string;
  gstPercent: number;
  mrp: number;
  salePrice: number;
  barcode?: string;
  minQty: number;
}

export interface MasterItem extends Omit<ShopProduct, "salePrice" | "minQty" | "masterId"> { imported: boolean }
export interface ImportResult { added: number; skipped: number; failed: number }

import type { StockStatus } from "@/lib/stock";

export interface StockRow {
  product: ShopProduct;
  sellableQty: number;
  expiredQty: number;
  expiringQty: number;
  nearestExpiry: string | null;
  status: StockStatus;
}

export interface Batch {
  id: string;
  product: string | { id: string; brandName: string; packSize: string };
  batchNo: string;
  mfgDate: string | null;
  expiryDate: string | null;
  purchasePrice?: number; // staff ko nahi aata
  qtyReceived: number;
  qtyRemaining: number;
}

export interface StockSummary { totalProducts: number; lowStock: number; outOfStock: number; expiringSoon: number; expired: number }
export interface ExpiryAlerts { expired: Batch[]; soon: Batch[]; later: Batch[]; counts: { expired: number; soon: number; later: number } }
export type AdjustReason = "DAMAGED" | "EXPIRED" | "RETURN" | "CORRECTION";

export interface Farmer { id: string; name: string; mobile: string; village?: string; balancePaise: number }
export interface LedgerItem {
  id: string;
  type: "SALE_CREDIT" | "PAYMENT" | "ADJUSTMENT";
  amountPaise: number; // udhaar +, jama -
  mode?: "CASH" | "UPI";
  note?: string;
  date: string;
}
export type PayMode = "CASH" | "UPI" | "UDHAR" | "PARTIAL";
export interface InvoiceLine { name: string; pack: string; qty: number; rate: number; gstPercent: number; amount: number; batch: string | null }
export interface Invoice {
  id: string;
  invoiceNo: string;
  farmerName?: string;
  farmerMobile?: string;
  items?: InvoiceLine[];
  subtotal: number; tax: number; discount: number; total: number; paid: number; credit: number;
  paymentMode: PayMode;
  status: "COMPLETED" | "CANCELLED";
  cancelReason?: string;
  createdAt: string;
}
export interface SalesSummary { today: { total: number; count: number; credit: number }; month: { total: number; count: number } }

export type MasterProductInfo = Omit<MasterItem, "imported">;

/** Batch aur expiry jo bottle ke barcode se padhi gayi (expiry: YYYY-MM-DD) */
export interface ScanStock { batchNo?: string; expiry?: string }

/** Naya product form bharne ke liye: catalog ki jaankari + barcode se mili batch/expiry. Paise wale fields rupees (string) mein. */
export interface NewProductPrefill {
  source: "master" | "barcode"; // catalog se mila, ya sirf barcode se
  product?: Partial<Record<"brandName" | "technicalName" | "company" | "packSize" | "hsn" | "gstPercent" | "mrp" | "salePrice" | "barcode" | "minQty", string>> & { category?: Category };
  stock?: ScanStock;
}
