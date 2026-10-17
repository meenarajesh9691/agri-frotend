import type { MessageKey } from "@/messages/en";

export type PaperSize = "THERMAL_58" | "THERMAL_80" | "A4" | "A5";

export const PAPERS: { value: PaperSize; label: MessageKey; widthMm: number; compact: boolean; pageCss: string }[] = [
  { value: "THERMAL_58", label: "paper.t58", widthMm: 58, compact: true, pageCss: "@page{size:58mm auto;margin:0}" },
  { value: "THERMAL_80", label: "paper.t80", widthMm: 80, compact: true, pageCss: "@page{size:80mm auto;margin:0}" },
  { value: "A5", label: "paper.a5", widthMm: 148, compact: false, pageCss: "@page{size:A5;margin:8mm}" },
  { value: "A4", label: "paper.a4", widthMm: 210, compact: false, pageCss: "@page{size:A4;margin:10mm}" },
];
export const paperOf = (v?: string) => PAPERS.find((p) => p.value === v) ?? PAPERS[1];

/**
 * Sirf bill ko alag chhupe hue page (iframe) mein daalkar print karta hai, taaki baaki screen print na ho.
 * Page ka size kagaz ke hisaab se (thermal 58/80mm, A5, A4). Isse "PDF mein save" bhi ho jaata hai.
 */
export function printElement(el: HTMLElement, paper: PaperSize) {
  const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map((n) => n.outerHTML).join("");
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  iframe.srcdoc =
    `<!doctype html><html><head><meta charset="utf-8">${styles}<style>${paperOf(paper).pageCss}` +
    `html,body{margin:0;background:#fff}#bill-root{width:100%!important;box-shadow:none!important;border:0!important}</style></head>` +
    `<body>${el.outerHTML}</body></html>`;
  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return;
    win.onafterprint = () => iframe.remove();
    win.focus();
    win.print();
    setTimeout(() => iframe.remove(), 120_000); // print dialog band na ho to bhi safai
  };
  document.body.appendChild(iframe);
}
