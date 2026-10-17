import type { ButtonHTMLAttributes } from "react";

const STYLES = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-stone-300",
  secondary: "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 disabled:opacity-50",
  danger: "border border-red-200 bg-red-50 text-red-800 hover:bg-red-100",
} as const;

export function Button({ variant = "primary", className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof STYLES }) {
  return <button {...rest} className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold transition-colors disabled:cursor-not-allowed ${STYLES[variant]} ${className}`} />;
}
