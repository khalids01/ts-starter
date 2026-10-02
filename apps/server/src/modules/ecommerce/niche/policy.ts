export class NichePolicyError extends Error {
  constructor(
    message: string,
    readonly status = 409,
  ) {
    super(message);
  }
}
export type CategoryPolicy = {
  fulfillmentKind:
    "standard" | "packaged_food" | "fresh_food" | "gadget" | "clothing";
  serialTracking: "none" | "serial" | "imei" | "serial_and_imei";
  warrantyDays: number;
};
export function categoryPolicy(input: Partial<CategoryPolicy>): CategoryPolicy {
  const policy = {
    fulfillmentKind: input.fulfillmentKind ?? "standard",
    serialTracking: input.serialTracking ?? "none",
    warrantyDays: input.warrantyDays ?? 0,
  };
  if (
    !Number.isInteger(policy.warrantyDays) ||
    policy.warrantyDays < 0 ||
    policy.warrantyDays > 3650
  )
    throw new NichePolicyError("Warranty days must be between 0 and 3650", 400);
  if (
    policy.fulfillmentKind !== "gadget" &&
    (policy.warrantyDays > 0 || policy.serialTracking !== "none")
  )
    throw new NichePolicyError(
      "Serial tracking and warranty apply only to gadget categories",
      400,
    );
  if (policy.warrantyDays > 0 && policy.serialTracking === "none")
    throw new NichePolicyError(
      "Warranty requires individual unit tracking",
      400,
    );
  return policy;
}
export function unitIdentifiers(
  mode: string,
  serial?: string | null,
  imei?: string | null,
) {
  const normalizedSerial = serial?.trim().toUpperCase() || null;
  const normalizedImei = imei?.trim() || null;
  if (normalizedSerial && !/^[A-Z0-9._/-]{1,128}$/.test(normalizedSerial))
    throw new NichePolicyError(
      "Serial must use letters, numbers, dot, slash, underscore or hyphen",
      400,
    );
  if (normalizedImei && !/^\d{15}$/.test(normalizedImei))
    throw new NichePolicyError("IMEI must contain 15 digits", 400);
  if (["serial", "serial_and_imei"].includes(mode) && !normalizedSerial)
    throw new NichePolicyError("Serial is required", 400);
  if (["imei", "serial_and_imei"].includes(mode) && !normalizedImei)
    throw new NichePolicyError("IMEI is required", 400);
  if (mode === "none" || (!normalizedSerial && !normalizedImei))
    throw new NichePolicyError("This category does not use unit tracking", 400);
  return { serial: normalizedSerial, imei: normalizedImei };
}
export function warrantyDeadline(deliveredAt: Date, days: number) {
  return new Date(deliveredAt.getTime() + days * 86_400_000);
}
