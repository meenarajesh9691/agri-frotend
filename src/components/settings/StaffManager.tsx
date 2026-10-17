"use client";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Field } from "@/components/ui/Field";
import { useApi } from "@/hooks/useApi";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { userService } from "@/services/user.service";
import type { User } from "@/types";

function StaffRow({ user, onChanged }: { user: User; onChanged: () => void }) {
  const { t } = useI18n();
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  async function run(body: { isActive?: boolean; newPassword?: string }) {
    setError("");
    try {
      await userService.update(user.id, body);
      setPw(""); setPwOpen(false);
      onChanged();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <li className="space-y-3 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-stone-600">{user.phone}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${user.isActive ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-700"}`}>
            {user.isActive ? t("staff.active") : t("staff.blocked")}
          </span>
          <Button variant="secondary" className="h-10 px-4" onClick={() => setPwOpen((o) => !o)}>{t("staff.newPassword")}</Button>
          <Button variant={user.isActive ? "danger" : "secondary"} className="h-10 px-4" onClick={() => run({ isActive: !user.isActive })}>
            {user.isActive ? t("staff.block") : t("staff.unblock")}
          </Button>
        </div>
      </div>
      {pwOpen && (
        <div className="flex gap-2">
          <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t("staff.newPassword")} className="h-11 flex-1 rounded-xl border border-stone-300 px-4" />
          <Button className="h-11" disabled={pw.length < 6} onClick={() => run({ newPassword: pw })}>{t("staff.save")}</Button>
        </div>
      )}
      {error && <ErrorNote message={error} />}
    </li>
  );
}

export function StaffManager() {
  const { t } = useI18n();
  const { data, error, reload } = useApi(() => userService.list(), []);
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const staff = data?.filter((u) => u.role === "STAFF") ?? [];
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setFormError("");
    try {
      await userService.create({ ...form, name: form.name.trim(), phone: form.phone.trim() });
      setForm({ name: "", phone: "", password: "" });
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{t("staff.title")}</h2>
      <p className="mb-4 text-sm text-stone-600">{t("staff.sub")}</p>

      <form onSubmit={add} className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <Field label={t("staff.name")} value={form.name} onChange={set("name")} />
        <Field label={t("staff.mobile")} value={form.phone} onChange={set("phone")} inputMode="numeric" maxLength={10} />
        <Field label={t("staff.password")} value={form.password} onChange={set("password")} />
        <Button type="submit" disabled={saving || !form.name || !form.phone || form.password.length < 6}><UserPlus className="size-5" /> {t("staff.add")}</Button>
      </form>
      {formError && <div className="mt-3"><ErrorNote message={formError} /></div>}

      {error && <div className="mt-3"><ErrorNote message={error} /></div>}
      <ul className="mt-4 divide-y divide-stone-100">
        {staff.map((u) => <StaffRow key={u.id} user={u} onChanged={reload} />)}
        {data && staff.length === 0 && <li className="py-6 text-center text-stone-600">{t("staff.empty")}</li>}
      </ul>
    </section>
  );
}
