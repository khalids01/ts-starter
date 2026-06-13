import type { ProductStatus } from "../types";

export const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export type ProductListFilters = typeof statusOptions[number]["value"];

export function isProductStatus(value: string): value is ProductStatus {
  return value === "draft" || value === "active" || value === "archived";
}
