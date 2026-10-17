"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Field, SelectField } from "@/components/ui/Field";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { PAPERS, paperOf } from "@/lib/print";
import { settingsService } from "@/services/settings.service";

export function PrintSettings() {
  const { t } = useI18n();
  const { shop, refresh } = useAuth();
  const [paperSize, setPaperSize] = useState(paperOf(shop.paperSize).value);
  const [billHeader, setHeader] = useState(shop.billHeader ?? "");
  const [billFooter, setFooter] = useState(shop.billFooter ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try { await settingsService.update({ paperSize, billHeader: billHeader.trim(), billFooter: billFooter.trim() }); await refresh(); setSaved(true); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{t("set.print")}</h2>
      <SelectField label={t("set.paperDefault")} value={paperSize} onChange={(e) => setPaperSize(e.target.value as typeof paperSize)}>
        {PAPERS.map((p) => <option key={p.value} value={p.value}>{t(p.label)}</option>)}
      </SelectField>
      <Field label={t("set.header")} value={billHeader} onChange={(e) => setHeader(e.target.value)} maxLength={100} />
      <Field label={t("set.footer")} value={billFooter} onChange={(e) => setFooter(e.target.value)} maxLength={200} />
      <p className="text-sm text-stone-600">{t("set.detailsNote")}</p>
      {error && <ErrorNote message={error} />}
      {saved && <p role="status" className="text-sm font-medium text-emerald-700">{t("set.saved")}</p>}
      <Button type="submit" disabled={saving}>{saving ? t("common.wait") : t("common.save")}</Button>
    </form>
  );
}
