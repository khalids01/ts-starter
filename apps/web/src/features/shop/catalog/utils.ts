import { sortOptions } from "./constants";
import type { DynamicFilterState } from "./types";

export function parseDynamicFilters(value: string | undefined): DynamicFilterState {
  if (!value?.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(value) as DynamicFilterState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function encodeDynamicFilters(value: DynamicFilterState) {
  const cleaned = Object.fromEntries(
    Object.entries(value).filter(([, filter]) => hasDynamicFilterValue(filter)),
  );
  return Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned) : "";
}

export function hasDynamicFilterValue(value: DynamicFilterState[string]) {
  return Boolean(
    value.valueIds?.length ||
      value.min ||
      value.max ||
      typeof value.boolean === "boolean",
  );
}

export function parseIdList(value: string | undefined) {
  return [
    ...new Set(
      (value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function encodeIdList(value: string[]) {
  return [...new Set(value)].filter(Boolean).join(",");
}

export function sortLabel(value: string) {
  return sortOptions.find((option) => option.value === value)?.label ?? "Newest";
}

export function optionalNumeric(value: string | undefined) {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function percentBetween(value: number, min: number, max: number) {
  if (max <= min) {
    return 0;
  }
  return clampNumber(((value - min) / (max - min)) * 100, 0, 100);
}

export function formatShortMoney(value: number, currency?: string) {
  if (!currency) {
    return String(Math.round(value));
  }
  const rounded = Math.round(value);
  if (Math.abs(rounded) >= 1000) {
    return `${currency} ${new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(rounded)}`;
  }
  return `${currency} ${rounded}`;
}
