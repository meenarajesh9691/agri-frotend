import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/lib/auth-context";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell><Suspense>{children}</Suspense></AppShell>
    </AuthProvider>
  );
}
