import { sortOptions } from "./constants";
import type { DynamicFilterState,  } from "./types";

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

