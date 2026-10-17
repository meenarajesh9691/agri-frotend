/** Saare API paths ek jagah */
export const ENDPOINTS = {
  auth: { login: "/auth/login", me: "/auth/me", changePassword: "/auth/change-password" },
  products: {
    base: "/products",
    byId: (id: string) => `/products/${id}`,
    scan: "/products/scan",
    importMaster: "/products/import-master",
  },
  masterProducts: "/master-products",
  stock: {
    base: "/stock",
    summary: "/stock/summary",
    alerts: "/stock/expiry-alerts",
    adjust: "/stock/adjust",
    batches: (productId: string) => `/stock/products/${productId}/batches`,
    writeOff: (batchId: string) => `/stock/batches/${batchId}/write-off`,
  },
  purchases: "/purchases",
  invoices: { base: "/invoices", byId: (id: string) => `/invoices/${id}`, cancel: (id: string) => `/invoices/${id}/cancel`, summary: "/invoices/summary" },
  farmers: { base: "/farmers", byId: (id: string) => `/farmers/${id}`, ledger: (id: string) => `/farmers/${id}/ledger`, payments: (id: string) => `/farmers/${id}/payments`, refund: (id: string) => `/farmers/${id}/refund` },
  settings: "/shop/settings",
  users: { base: "/users", byId: (id: string) => `/users/${id}` },
} as const;
