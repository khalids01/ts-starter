export function formatMoney(value?: string | number | null, currency = "BDT") {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) {
    return `${currency} ${value ?? "0"}`;
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function productImage(product: { coverImageUrl?: string | null; variants?: Array<{ imageUrls?: string[] }> }) {
  return product.coverImageUrl || product.variants?.find((variant) => variant.imageUrls?.[0])?.imageUrls?.[0] || null;
}
