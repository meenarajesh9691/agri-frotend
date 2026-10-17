const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Packet par jaisa likha hota hai waisa likhne dein: "MM/YYYY", "MM/YY" ya "DD/MM/YYYY".
 * Wapas "YYYY-MM-DD". Khaali ho to "", galat ho to null.
 * MM/YYYY mein expiry (end) ke liye mahine ka aakhri din, banane (start) ke liye pehla din.
 */
export function parseDateInput(text: string, mode: "start" | "end"): string | null {
  const s = text.trim().replace(/[-.]/g, "/");
  if (!s) return "";

  let day: number | undefined, month: number, year: number;
  let m = s.match(/^(\d{1,2})\/(\d{4}|\d{2})$/);
  if (m) {
    month = Number(m[1]);
    year = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2]);
  } else if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) {
    day = Number(m[1]); month = Number(m[2]); year = Number(m[3]);
  } else return null;

  if (month < 1 || month > 12 || year < 2000 || year > 2100) return null;
  const last = daysInMonth(year, month);
  if (day === undefined) day = mode === "end" ? last : 1;
  if (day < 1 || day > last) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Aaj se kitne din baad (peeche ho to minus), calendar din ke hisaab se */
export function daysFromNow(iso: string): number {
  const d = new Date(iso);
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const n = new Date();
  return Math.round((a - Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())) / 86_400_000);
}

export const todayISO = () => {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
};

/** 2027-12-31 -> 31/12/2027 (form ke expiry box mein poori tareekh dikhe, mahina nahi) */
export const isoToDMY = (iso: string) => iso.split("-").reverse().join("/");
