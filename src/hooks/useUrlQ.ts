"use client";
import { useSearchParams } from "next/navigation";

/** Upar ke search se aaya ?q=... (jaise /products?q=Coragen). Page ka apna search box isse bhar jaata hai. */
export const useUrlQ = () => useSearchParams().get("q") ?? "";
