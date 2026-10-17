import type { MessageKey } from "@/messages/en";
import type { Category } from "@/types";

export const CATEGORIES: { value: Category; label: MessageKey }[] = [
  { value: "PESTICIDE", label: "cat.pesticide" },
  { value: "FERTILIZER", label: "cat.fertilizer" },
  { value: "SEED", label: "cat.seed" },
];
export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label])) as Record<Category, MessageKey>;
export const GST_RATES = [0, 5, 12, 18, 28];
