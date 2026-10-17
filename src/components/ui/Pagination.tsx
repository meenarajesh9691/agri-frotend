"use client";
import { useI18n } from "@/lib/i18n";
import { Button } from "./Button";

export function Pagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (p: number) => void }) {
  const { t } = useI18n();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-4 flex items-center justify-end gap-3">
      <Button variant="secondary" className="h-10" disabled={page <= 1} onClick={() => onChange(page - 1)}>{t("common.prev")}</Button>
      <span className="text-sm text-stone-600">{page} / {pages}</span>
      <Button variant="secondary" className="h-10" disabled={page >= pages} onClick={() => onChange(page + 1)}>{t("common.next")}</Button>
    </div>
  );
}
