"use client";
import { Eye, EyeOff, Sprout } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { LangToggle } from "@/components/ui/LangToggle";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { user } = await authService.login({ mobileNumber: mobile.trim(), password });
      router.replace(user.role === "OWNER" ? "/dashboard" : "/billing"); // staff seedha billing par
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-emerald-700 p-12 text-white lg:flex">
        <span className="flex items-center gap-3 text-xl font-semibold"><Sprout className="size-8" /> Agri Shop</span>
        <p className="max-w-md text-3xl font-semibold leading-snug">{t("login.tagline")}</p>
        <span />
      </section>
      <section className="relative grid place-items-center p-4">
        <div className="absolute right-4 top-4"><LangToggle /></div>
        <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border border-stone-200 bg-white p-8 shadow-xl shadow-emerald-900/5">
          <div>
            <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-emerald-600 text-white lg:hidden"><Sprout className="size-6" /></span>
            <h1 className="text-2xl font-semibold tracking-tight">{t("login.title")}</h1>
            <p className="mt-1 text-stone-600">{t("login.sub")}</p>
          </div>
          {error && <ErrorNote message={error} />}
          <Field2 label={t("login.mobile")}>
            <input value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="numeric" maxLength={10} autoComplete="username" autoFocus
              className="h-14 w-full rounded-xl border border-stone-300 px-4 text-lg" />
          </Field2>
          <Field2 label={t("login.password")}>
            <span className="relative block">
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} autoComplete="current-password"
                className="h-14 w-full rounded-xl border border-stone-300 px-4 pr-14 text-lg" />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? t("login.hide") : t("login.show")}
                className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-stone-600 hover:bg-stone-100">
                {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </span>
          </Field2>
          <Button type="submit" disabled={loading || !mobile || !password} className="h-14 w-full text-lg">
            {loading ? t("common.wait") : t("login.submit")}
          </Button>
          <p className="text-center text-sm text-stone-600">{t("login.help")}</p>
        </form>
      </section>
    </main>
  );
}

const Field2 = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block"><span className="mb-1.5 block text-base font-medium">{label}</span>{children}</label>
);
