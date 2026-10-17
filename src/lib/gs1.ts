/**
 * Basic GS1 parser for DataMatrix / QR codes on medicine bottles.
 * Reads only what we need: AI 01 (GTIN), AI 17 (expiry), AI 10 (batch). Other known AIs are skipped correctly.
 *
 * Accepted shapes:
 *   (01)08901001234567(17)271231(10)AB123          human readable, with brackets
 *   01089010012345671727123110AB123                raw, batch last
 *   0108901001234567 1727123110AB123 <GS> 21XYZ    raw, GS (char 29) ends a variable field
 *   ]d2 ... / ]Q3 ...                              symbology prefix some scanners add (removed)
 *
 * Limit: a variable field (batch, serial) with no GS after it runs to the end of the string.
 * So the scanner should send GS (FNC1), or the batch must be the last element. If something
 * does not parse cleanly we return null and the caller treats the code as a plain barcode.
 */
export interface Gs1Data {
  gtin: string; // always 14 digits
  expiry?: string; // YYYY-MM-DD
  batch?: string;
}

const GS = "\x1d";
const FIXED: Record<string, number> = { "00": 18, "01": 14, "02": 14, "11": 6, "12": 6, "13": 6, "15": 6, "16": 6, "17": 6, "20": 2 };
const VARIABLE: Record<string, number> = { "10": 20, "21": 20, "22": 20, "30": 8, "37": 8, "240": 30, "241": 30, "242": 6 };

const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const pad = (n: number) => String(n).padStart(2, "0");

/** YYMMDD -> YYYY-MM-DD. Day "00" means the last day of that month (GS1 rule). null if impossible. */
export function parseGs1Date(yymmdd: string): string | null {
  if (!/^\d{6}$/.test(yymmdd)) return null;
  const year = 2000 + Number(yymmdd.slice(0, 2));
  const month = Number(yymmdd.slice(2, 4));
  let day = Number(yymmdd.slice(4, 6));
  if (month < 1 || month > 12) return null;
  const last = daysInMonth(year, month);
  if (day === 0) day = last;
  if (day < 1 || day > last) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

function readBracketed(s: string): Record<string, string> | null {
  if (!s.startsWith("(")) return null;
  const out: Record<string, string> = {};
  for (const m of s.matchAll(/\((\d{2,4})\)([^(]*)/g)) out[m[1]] = m[2].replaceAll(GS, "").trim();
  return Object.keys(out).length ? out : null;
}

function readRaw(s: string): Record<string, string> | null {
  const out: Record<string, string> = {};
  let i = 0;
  while (i < s.length) {
    if (s[i] === GS) { i++; continue; }
    const ai = [2, 3].map((n) => s.slice(i, i + n)).find((a) => a in FIXED || a in VARIABLE);
    if (!ai) return null; // unknown AI: not something we can read safely
    i += ai.length;
    if (ai in FIXED) {
      const value = s.slice(i, i + FIXED[ai]);
      if (value.length !== FIXED[ai] || !/^\d+$/.test(value)) return null;
      out[ai] = value;
      i += FIXED[ai];
    } else {
      let end = s.indexOf(GS, i);
      if (end === -1) end = s.length;
      const value = s.slice(i, end);
      if (!value || value.length > VARIABLE[ai]) return null;
      out[ai] = value;
      i = end;
    }
  }
  return out;
}

/** Returns the parsed data, or null when the text is not a GS1 string with a GTIN. */
export function parseGs1(input: string): Gs1Data | null {
  const s = input.trim().replace(/^\][A-Za-z][0-9A-Za-z]/, ""); // drop ]d2, ]Q3, ]C1 ...
  if (!s) return null;
  const ais = readBracketed(s) ?? readRaw(s);
  if (!ais || !/^\d{14}$/.test(ais["01"] ?? "")) return null;

  return {
    gtin: ais["01"],
    expiry: ais["17"] ? (parseGs1Date(ais["17"]) ?? undefined) : undefined,
    batch: ais["10"] || undefined,
  };
}

/**
 * The same product can be saved as EAN-13 while GS1 carries it as GTIN-14 with leading zeros.
 * So we try the 14-digit form first, then the shorter forms with the padding zeros removed.
 */
export function gtinCandidates(gtin14: string): string[] {
  const list = [gtin14];
  for (const len of [13, 12, 8]) {
    if (gtin14.slice(0, gtin14.length - len).split("").every((c) => c === "0")) list.push(gtin14.slice(-len));
  }
  return [...new Set(list)];
}

/** The barcode to save on a new product: EAN-13 when the GTIN is just a padded EAN-13. */
export const primaryBarcode = (gtin14: string) => (gtin14.startsWith("0") ? gtin14.slice(1) : gtin14);
