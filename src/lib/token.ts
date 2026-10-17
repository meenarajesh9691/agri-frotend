// Token cookie mein rehta hai taaki middleware.ts page guard kar sake. Naam admin app se alag hai.
const KEY = "shop_token";
const SEVEN_DAYS = 7 * 24 * 60 * 60;

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${KEY}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}
export function setToken(token: string) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${KEY}=${encodeURIComponent(token)}; path=/; max-age=${SEVEN_DAYS}; SameSite=Strict${secure}`;
}
export function clearToken() {
  document.cookie = `${KEY}=; path=/; max-age=0`;
}
