// "use client";
// import { ScanBarcode } from "lucide-react";
// import { useState } from "react";
// import { getErrorMessage, isNotFound } from "@/lib/http";
// import { useI18n } from "@/lib/i18n";
// import { resolveScan } from "@/lib/scanFlow";
// import { productService } from "@/services/product.service";
// import type { NewProductPrefill, ScanStock, ShopProduct } from "@/types";

// /**
//  * Scanner barcode type karke Enter dabata hai. Plain barcode aur GS1 (DataMatrix/QR) dono chalte hain.
//  *  - dukaan mein product mila  -> onFound(product, barcode se mili batch/expiry)
//  *  - nahi mila                 -> onNew(original code, prefill): catalog + barcode ki jaankari se bhara hua form
//  */
// export function BarcodeBox({ onFound, onNew }: {
//   onFound: (product: ShopProduct, stock?: ScanStock) => void;
//   onNew: (originalCode: string, prefill?: NewProductPrefill) => void;
// }) {
//   const { t } = useI18n();
//   const [code, setCode] = useState("");
//   const [error, setError] = useState("");
//   const [busy, setBusy] = useState(false);

//   async function lookup() {
//     const original = code.trim();
//     if (!original || busy) return;
//     setError(""); setBusy(true);
//     try {
//       const result = await resolveScan(original, {
//         scan: productService.scan,
//         checkMasterCatalog: productService.checkMasterCatalog,
//         isNotFound,
//       });
//       if (result.kind === "found") onFound(result.product, result.stock);
//       else onNew(result.code, result.prefill);
//       setCode("");
//     } catch (e) {
//       setError(getErrorMessage(e));
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <div className="mb-4">
//       <div className="flex items-center gap-3 rounded-2xl border-2 border-emerald-600/30 bg-white p-2 shadow-sm focus-within:border-emerald-600">
//         <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ScanBarcode className="size-6" /></span>
//         <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()} disabled={busy}
//           placeholder={t("prod.scan")} className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-stone-500" />
//       </div>
//       {busy && <p className="mt-2 text-sm text-stone-600">{t("prod.scanning")}</p>}
//       {error && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{error}</p>}
//     </div>
//   );
// }




"use client";
import { ScanBarcode, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { getErrorMessage, isNotFound } from "@/lib/http";
import { useI18n } from "@/lib/i18n";
import { resolveScan } from "@/lib/scanFlow";
import { productService } from "@/services/product.service";
import type { NewProductPrefill, ScanStock, ShopProduct } from "@/types";

export function BarcodeBox({ onFound, onNew }: {
  onFound: (product: ShopProduct, stock?: ScanStock) => void;
  onNew: (originalCode: string, prefill?: NewProductPrefill) => void;
}) {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // Camera chalane ka state wapas add kiya

  // lookup ko thoda update kiya taaki camera scan karte hi direct code pass kar sake
  async function lookup(searchCode?: string) {
    const original = (searchCode !== undefined ? searchCode : code).trim();
    if (!original || busy) return;
    setError(""); setBusy(true);
    
    try {
      // Claude ka naya GS1 logic jo apne aap Master Catalog check karega
      const result = await resolveScan(original, {
        scan: productService.scan,
        checkMasterCatalog: productService.checkMasterCatalog,
        isNotFound,
      });
      
      if (result.kind === "found") onFound(result.product, result.stock);
      else onNew(result.code, result.prefill);
      
      setCode("");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  // Camera ka high-speed auto-focus setup
  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 30, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        videoConstraints: {
          facingMode: "environment",
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          advanced: [{ focusMode: "continuous" }]
        }
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        setIsScanning(false);
        setCode(decodedText);
        lookup(decodedText); // Camera se scan hote hi GS1 logic trigger hoga
      },
      (errorMessage) => {
        // Minor errors ignore karein
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [isScanning]);

  return (
    <div className="mb-4">
      {/* Camera ka UI wapas laya gaya */}
      {isScanning && (
        <div className="relative mb-4 overflow-hidden rounded-2xl border-2 border-emerald-600 bg-black p-2 shadow-lg animate-in fade-in duration-200">
          <button
            onClick={() => setIsScanning(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors shadow-md"
            title="Camera Band Karein"
          >
            <X className="size-5" />
          </button>
          <div id="reader" className="w-full bg-white rounded-xl overflow-hidden min-h-[300px]"></div>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl border-2 border-emerald-600/30 bg-white p-2 shadow-sm focus-within:border-emerald-600 transition-colors">
        {/* Span ko wapas Button banaya taaki click ho sake */}
        <button 
          onClick={() => setIsScanning(true)}
          disabled={busy}
          className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          title="Camera Se Scan Karein"
        >
          <ScanBarcode className="size-6" />
        </button>
        
        <input 
          value={code} 
          onChange={(e) => setCode(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && lookup()} 
          disabled={busy}
          placeholder={t("prod.scan") || "Barcode scan ya type karein"} 
          className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-stone-500" 
        />
      </div>
      
      {busy && <p className="mt-2 text-sm text-stone-600">{t("prod.scanning") || "Checking data..."}</p>}
      {error && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}