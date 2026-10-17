"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

// Staff ko ye screen nahi dikhti, seedha billing par bhej dete hain. (Asli rok backend par bhi hai.)
export function OwnerOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const isOwner = user.role === "OWNER";
  useEffect(() => { if (!isOwner) router.replace("/billing"); }, [isOwner, router]);
  return isOwner ? <>{children}</> : null;
}
