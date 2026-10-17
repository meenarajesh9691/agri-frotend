import axios, { type AxiosResponse } from "axios";
import { clearToken, getToken } from "@/lib/token";
import type { ApiResponse } from "@/types";

/** Poore app ka ek hi axios instance */
export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token galat / khatam / staff band: seedha login par
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLogin = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLogin && typeof window !== "undefined") {
      clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const unwrap = <T>(request: Promise<AxiosResponse<ApiResponse<T>>>) => request.then((r) => r.data.data);

export const isNotFound = (e: unknown) => axios.isAxiosError(e) && e.response?.status === 404;

export function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(e)) {
    if (e.response?.data?.message) return e.response.data.message;
    if (e.code === "ECONNABORTED") return "Server ne bahut der kar di, dobara try karein";
    if (!e.response) return "Server se connect nahi ho paya. Internet check karein";
  }
  return "Kuch galat ho gaya";
}
