"use client";
import { useState } from "react";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { settingsService } from "@/services/settings.service";

export function BillingSettings() {
  const { t } = useI18n();
  const { shop, refresh } = useAuth();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function toggle(value: boolean) {
    setSaving(true); setError("");
    try { await settingsService.update({ blockOversell: value }); await refresh(); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setSaving(false); }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">{t("set.billing")}</h2>
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" className="mt-1 size-5 accent-emerald-600" checked={!!shop.blockOversell} disabled={saving} onChange={(e) => toggle(e.target.checked)} />
        <span><span className="block font-medium">{t("set.oversell")}</span><span className="text-sm text-stone-600">{t("set.oversellHint")}</span></span>
      </label>
      {error && <div className="mt-3"><ErrorNote message={error} /></div>}
    </section>
  );
}
