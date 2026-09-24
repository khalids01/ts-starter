const SECRET_KEY_PATTERN =
  /(^|_)(api.?key|secret|token|password|authorization|ciphertext|nonce|auth.?tag)($|_)/i;

export function redactCourierSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactCourierSecrets);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      SECRET_KEY_PATTERN.test(key) ? "[REDACTED]" : redactCourierSecrets(entry),
    ]),
  );
}

const EVENT_PRIVATE_KEY_PATTERN =
  /(^|_)(recipient.?name|customer.?name|phone|mobile|email|address|note)($|_)/i;

export function sanitizeCourierEventPayload(value: unknown): Record<string, unknown> {
  const sanitize = (entry: unknown): unknown => {
    if (Array.isArray(entry)) return entry.map(sanitize);
    if (!entry || typeof entry !== "object") return entry;
    return Object.fromEntries(
      Object.entries(entry).map(([key, item]) => [
        key,
        SECRET_KEY_PATTERN.test(key) || EVENT_PRIVATE_KEY_PATTERN.test(key)
          ? "[REDACTED]"
          : sanitize(item),
      ]),
    );
  };
  const result = sanitize(value);
  return result && typeof result === "object" && !Array.isArray(result)
    ? result as Record<string, unknown>
    : { value: result };
}
