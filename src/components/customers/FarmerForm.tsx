"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { getErrorMessage } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { farmerService } from "@/services/farmer.service";
import type { Farmer } from "@/types";

export function FarmerForm({ farmer, onClose, onSaved }: { farmer?: Farmer; onClose: () => void; onSaved: (f: Farmer) => void }) {
  const { t } = useI18n();
  const [name, setName] = useState(farmer?.name ?? "");
  const [mobile, setMobile] = useState(farmer?.mobile ?? "");
  const [village, setVillage] = useState(farmer?.village ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const body = { name: name.trim(), mobile: mobile.trim(), village: village.trim() };
      const saved = farmer ? { ...farmer, ...(await farmerService.update(farmer.id, body)) } : await farmerService.create(body);
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <Modal title={farmer ? t("cust.edit") : t("cust.add")} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("cust.name")} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <Field label={t("cust.mobile")} value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="numeric" maxLength={10} />
        <Field label={t("cust.village")} value={village} onChange={(e) => setVillage(e.target.value)} />
        {error && <ErrorNote message={error} />}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="submit" disabled={loading || !name.trim() || mobile.length !== 10}>{loading ? t("common.wait") : t("common.save")}</Button>
        </div>
      </form>
    </Modal>
  );
}
