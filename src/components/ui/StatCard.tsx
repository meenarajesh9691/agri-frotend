import type { LucideIcon } from "lucide-react";

const TONES = {
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  sky: "bg-sky-50 text-sky-700",
  violet: "bg-violet-50 text-violet-700",
} as const;

export function StatCard({ label, value, hint, icon: Icon, tone = "emerald" }: {
  label: string; value: string; hint?: string; icon: LucideIcon; tone?: keyof typeof TONES;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${TONES[tone]}`}>
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-stone-600">{label}</p>
        <p className="truncate text-2xl font-semibold tracking-tight">{value}</p>
        {hint && <p className="text-xs text-stone-500">{hint}</p>}
      </div>
    </div>
  );
}
