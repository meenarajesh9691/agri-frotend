"use client";
import { useReducer } from "react";
import type { CartLine } from "@/lib/billing";
import type { StockRow } from "@/types";

type Action = { type: "add"; row: StockRow } | { type: "qty"; id: string; qty: number } | { type: "remove"; id: string } | { type: "clear" };

function reducer(lines: CartLine[], a: Action): CartLine[] {
  switch (a.type) {
    case "add": {
      const found = lines.find((l) => l.row.product.id === a.row.product.id);
      return found ? lines.map((l) => (l === found ? { ...l, qty: l.qty + 1 } : l)) : [...lines, { row: a.row, qty: 1 }]; // dobara scan = quantity +1
    }
    case "qty": return lines.map((l) => (l.row.product.id === a.id ? { ...l, qty: Math.max(1, a.qty) } : l));
    case "remove": return lines.filter((l) => l.row.product.id !== a.id);
    case "clear": return [];
  }
}

export function useCart() {
  const [lines, dispatch] = useReducer(reducer, []);
  return {
    lines,
    add: (row: StockRow) => dispatch({ type: "add", row }),
    setQty: (id: string, qty: number) => dispatch({ type: "qty", id, qty }),
    remove: (id: string) => dispatch({ type: "remove", id }),
    clear: () => dispatch({ type: "clear" }),
  };
}
