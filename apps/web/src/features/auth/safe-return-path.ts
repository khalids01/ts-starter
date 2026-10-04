export function safeReturnPath(
  value: string | undefined,
  fallback = "/dashboard",
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\s\u0000-\u001f]/.test(value)
  )
    return fallback;
  try {
    const url = new URL(value, "https://store.invalid");
    return url.origin === "https://store.invalid"
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
