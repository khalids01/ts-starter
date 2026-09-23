export type CourierRouteRequest = Readonly<{
  shippingMethodId: string;
  country: string;
  city?: string | null;
  zone?: string | null;
  postalCode?: string | null;
  paymentKind: "cod" | "prepaid";
  outstandingCodAmount: number;
  weightGrams?: number | null;
}>;

export type CourierRouteRule = Readonly<{
  id: string;
  version: number;
  priority: number;
  enabled: boolean;
  connectionId: string;
  serviceId: string;
  shippingMethodIds?: readonly string[];
  countries?: readonly string[];
  cities?: readonly string[];
  zones?: readonly string[];
  postalCodes?: readonly string[];
  paymentKinds?: readonly ("cod" | "prepaid")[];
  minimumCodAmount?: number;
  maximumCodAmount?: number;
  maximumWeightGrams?: number;
}>;

export type CourierRouteService = Readonly<{
  id: string;
  connectionId: string;
  enabled: boolean;
  shippingMethodIds: readonly string[];
}>;

export type CourierRouteConnection = Readonly<{
  id: string;
  displayName: string;
  enabled: boolean;
  health: "healthy" | "unchecked" | "degraded" | "auth_failed";
  priority: number;
}>;

export type CourierRouteCandidate = Readonly<{
  connectionId: string;
  serviceId: string;
  ruleId: string;
  ruleVersion: number;
  reason: string;
}>;

export type CourierRouteResult = Readonly<{
  candidates: readonly CourierRouteCandidate[];
  warnings: readonly string[];
  evaluatedRules: readonly { id: string; version: number }[];
}>;

function normalized(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase("en-US") ?? "";
}

function matches(allowed: readonly string[] | undefined, actual: string | null | undefined) {
  return !allowed || allowed.some((value) => normalized(value) === normalized(actual));
}

function validMoney(value: number) {
  return Number.isFinite(value) && value >= 0;
}

export function rankCourierRoutes(input: {
  request: CourierRouteRequest;
  rules: readonly CourierRouteRule[];
  connections: readonly CourierRouteConnection[];
  services: readonly CourierRouteService[];
}): CourierRouteResult {
  const { request } = input;
  if (!request.shippingMethodId || !request.country || !validMoney(request.outstandingCodAmount) ||
      (request.paymentKind === "prepaid" && request.outstandingCodAmount !== 0) ||
      (request.paymentKind === "cod" && request.outstandingCodAmount === 0) ||
      (request.weightGrams != null && (!Number.isFinite(request.weightGrams) || request.weightGrams < 0))) {
    return { candidates: [], warnings: ["Order delivery or payment data is inconsistent"], evaluatedRules: [] };
  }

  const connections = new Map(input.connections.map((connection) => [connection.id, connection]));
  const services = new Map(input.services.map((service) => [service.id, service]));
  const warnings: string[] = [];
  const candidates: CourierRouteCandidate[] = [];
  const sortedRules = [...input.rules].filter((rule) => rule.enabled).sort((a, b) =>
    a.priority - b.priority || a.id.localeCompare(b.id),
  );

  for (const rule of sortedRules) {
    const connection = connections.get(rule.connectionId);
    const service = services.get(rule.serviceId);
    const label = connection?.displayName ?? rule.connectionId;
    if (!connection?.enabled || connection.health !== "healthy" || !service?.enabled || service.connectionId !== rule.connectionId) {
      warnings.push(`${label}: connection or service is unavailable`);
      continue;
    }
    if (!service.shippingMethodIds.includes(request.shippingMethodId) ||
        (rule.shippingMethodIds && !rule.shippingMethodIds.includes(request.shippingMethodId)) ||
        !matches(rule.countries, request.country) || !matches(rule.cities, request.city) ||
        !matches(rule.zones, request.zone) || !matches(rule.postalCodes, request.postalCode) ||
        (rule.paymentKinds && !rule.paymentKinds.includes(request.paymentKind)) ||
        (rule.minimumCodAmount != null && request.outstandingCodAmount < rule.minimumCodAmount) ||
        (rule.maximumCodAmount != null && request.outstandingCodAmount > rule.maximumCodAmount) ||
        (rule.maximumWeightGrams != null && (request.weightGrams == null || request.weightGrams > rule.maximumWeightGrams))) {
      warnings.push(`${label}: routing conditions did not match`);
      continue;
    }
    candidates.push({ connectionId: connection.id, serviceId: service.id, ruleId: rule.id,
      ruleVersion: rule.version, reason: `Rule ${rule.id} matched ${label}` });
  }

  candidates.sort((a, b) => {
    const leftRule = sortedRules.find((rule) => rule.id === a.ruleId)!;
    const rightRule = sortedRules.find((rule) => rule.id === b.ruleId)!;
    const left = connections.get(a.connectionId)!;
    const right = connections.get(b.connectionId)!;
    return leftRule.priority - rightRule.priority || left.priority - right.priority ||
      a.connectionId.localeCompare(b.connectionId) || a.serviceId.localeCompare(b.serviceId);
  });
  if (candidates.length === 0) warnings.push("No eligible delivery service is available");
  return {
    candidates,
    warnings,
    evaluatedRules: sortedRules.map(({ id, version }) => ({ id, version })),
  };
}
