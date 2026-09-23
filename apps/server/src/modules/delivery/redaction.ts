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
