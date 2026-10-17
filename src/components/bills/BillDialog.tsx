"use client";
import { MessageCircle, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BillReceipt } from "@/components/bills/BillReceipt";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Modal } from "@/components/ui/Modal";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { PAPERS, paperOf, printElement, type PaperSize } from "@/lib/print";
import { whatsappUrl } from "@/lib/whatsapp";
import { invoiceService } from "@/services/invoice.service";

export function BillDialog({ invoiceId, autoPrint, onClose }: { invoiceId: string; autoPrint?: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const { shop } = useAuth();
  const { data: invoice, error } = useApi(() => invoiceService.get(invoiceId), [invoiceId]);
  const [paper, setPaper] = useState<PaperSize>(paperOf(shop.paperSize).value);
  const receipt = useRef<HTMLDivElement>(null);
  const autoDone = useRef(false);
  const print = () => receipt.current && printElement(receipt.current, paper);

  // Bill banate hi "Print" dabaya ho to khulte hi print dialog
  useEffect(() => {
    if (autoPrint && invoice && !autoDone.current) {
      autoDone.current = true;
      const id = setTimeout(print, 300);
      return () => clearTimeout(id);
    }
  });

  return (
    <Modal title={invoice ? invoice.invoiceNo : t("bill.view")} onClose={onClose} wide={paper === "A4" || paper === "A5"}>
      {error && <ErrorNote message={error} />}
      {!invoice && !error && <p className="py-8 text-center text-stone-600">{t("common.wait")}</p>}
      {invoice && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm font-medium">{t("bill.paper")}
              <select value={paper} onChange={(e) => setPaper(e.target.value as PaperSize)} className="mt-1 block h-12 rounded-xl border border-stone-300 bg-white px-3 text-base font-normal">
                {PAPERS.map((p) => <option key={p.value} value={p.value}>{t(p.label)}</option>)}
              </select>
            </label>
            <Button onClick={print}><Printer className="size-5" /> {t("bill.printNow")}</Button>
            <Button variant="secondary" onClick={() => window.open(whatsappUrl(invoice, shop, t), "_blank", "noopener")}>
              <MessageCircle className="size-5" /> {t("bill.whatsapp")}
            </Button>
          </div>
          {!/^\d{10}$/.test(invoice.farmerMobile ?? "") && <p className="text-sm text-stone-600">{t("bill.noMobile")}</p>}
          <div className="max-h-[60vh] overflow-auto rounded-2xl bg-stone-100 p-4">
            <BillReceipt ref={receipt} invoice={invoice} shop={shop} paper={paper} />
          </div>
        </div>
      )}
    </Modal>
  );
}
