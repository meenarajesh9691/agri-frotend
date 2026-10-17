"use client";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import type { Me } from "@/types";

interface AuthCtx extends Me {
  refresh: () => Promise<void>;
  logout: () => void;
}
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  const refresh = useCallback(async () => {
    try {
      setMe(await authService.me());
    } catch {
      router.replace("/login"); // 401 par http interceptor pehle hi bhej deta hai
    }
  }, [router]);

  useEffect(() => {
    refresh();
    // Tab par wapas aane par dobara: admin ne plan badhaya ho to banner turant hat jaaye
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  const logout = useCallback(() => {
    authService.logout();
    router.replace("/login");
  }, [router]);

  if (!me) return <div className="grid min-h-screen place-items-center text-stone-600">...</div>;
  return <Ctx.Provider value={{ ...me, refresh, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth ko AuthProvider ke andar use karein");
  return ctx;
}
