export function normalizePagination(page?: number, limit?: number) {
  const normalizedLimit = Math.min(Math.max(limit ?? 20, 1), 100);
  return {
    limit: normalizedLimit,
    requestedPage: Math.max(page ?? 1, 1),
  };
}

export function paginationResult<T>({
  items,
  total,
  requestedPage,
  limit,
}: {
  items: T[];
  total: number;
  requestedPage: number;
  limit: number;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    total,
    pages,
    page: Math.min(requestedPage, pages),
    limit,
  };
}

export function toIso(value: Date | string | null | undefined) {
  if (!value) {
    return value ?? null;
  }
  return value instanceof Date ? value.toISOString() : value;
}

export function decimalToString(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }
  return String(value);
}

export function decimalToNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function money(value: number) {
  return value.toFixed(2);
}

export function nullableTrimmed(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
