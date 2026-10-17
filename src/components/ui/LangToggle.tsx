"use client";
import { useI18n, type Lang } from "@/lib/i18n";

const LANGS: { value: Lang; label: string }[] = [{ value: "hi", label: "हिं" }, { value: "en", label: "EN" }];

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div role="group" aria-label="Language" className="flex rounded-xl border border-stone-200 bg-white p-0.5">
      {LANGS.map((l) => (
        <button key={l.value} onClick={() => setLang(l.value)} aria-pressed={lang === l.value}
          className={`h-9 min-w-11 rounded-lg px-2 text-sm font-semibold ${lang === l.value ? "bg-emerald-600 text-white" : "text-stone-600 hover:bg-stone-100"}`}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
