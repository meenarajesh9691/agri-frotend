"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Field } from "@/components/ui/Field";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { authService } from "@/services/auth.service";

export function ChangePassword() {
  const { t } = useI18n();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setDone(false);
    try {
      await authService.changePassword({ currentPassword: current, newPassword: next });
      setDone(true); setCurrent(""); setNext("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{t("pw.title")}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("pw.current")} type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        <Field label={t("pw.new")} type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
      </div>
      {error && <ErrorNote message={error} />}
      {done && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{t("pw.done")}</p>}
      <Button type="submit" disabled={loading || !current || !next}>{t("staff.save")}</Button>
    </form>
  );
}
