import { BarChart3, FileText, LayoutDashboard, Package, ReceiptText, Settings, Tags, Users, type LucideIcon } from "lucide-react";
import type { MessageKey } from "@/messages/en";

export const NAV: { href: string; label: MessageKey; icon: LucideIcon; ownerOnly?: boolean }[] = [
  { href: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard, ownerOnly: true },
  { href: "/products", label: "nav.products", icon: Tags },
  { href: "/inventory", label: "nav.inventory", icon: Package },
  { href: "/billing", label: "nav.billing", icon: ReceiptText },
  { href: "/bills", label: "nav.bills", icon: FileText },
  { href: "/customers", label: "nav.customers", icon: Users },
  { href: "/reports", label: "nav.reports", icon: BarChart3, ownerOnly: true },
  { href: "/settings", label: "nav.settings", icon: Settings },
];
