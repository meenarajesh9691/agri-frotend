"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { en, type MessageKey } from "@/messages/en";
import { hi } from "@/messages/hi";

export type Lang = "hi" | "en";
const DICT: Record<Lang, Record<MessageKey, string>> = { hi, en };

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}
const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hi");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "hi" || saved === "en") setLangState(saved);
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = useCallback((l: Lang) => { setLangState(l); localStorage.setItem("lang", l); }, []);
  const t = useCallback<I18n["t"]>(
    (key, vars) => DICT[lang][key].replace(/\{(\w+)\}/g, (_, k) => String(vars?.[k] ?? "")),
    [lang],
  );
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n ko I18nProvider ke andar use karein");
  return ctx;
}
