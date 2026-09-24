import prisma from "@db/server";
import { activityService } from "../activity/activity.service";
import { rankCourierRoutes, type CourierRouteRequest } from "../../delivery/routing";
import type {
  ConfirmCourierRouteInput,
  CreateCourierRoutingRuleInput,
  CreateCourierServiceInput,
  UpdateCourierRoutingRuleInput,
  UpdateCourierServiceInput,
} from "./delivery.dto";
import { AdminDeliveryServiceError } from "./delivery.service";

type Dependencies = Readonly<{
  db: any;
  activity: Pick<typeof activityService, "record">;
}>;

function jsonObject(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, any>
    : {};
}

function iso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function mapService(row: any) {
  return {
    id: row.id,
    connectionId: row.connectionId,
    connectionName: row.connection?.displayName,
    providerName: row.connection?.provider?.displayName,
    code: row.code,
    displayName: row.displayName,
    enabled: row.enabled,
    shippingMethods: (row.methods ?? []).map((method: any) => ({
      id: method.shippingRate.id,
      code: method.shippingRate.code,
      label: method.shippingRate.label,
    })),
    updatedAt: iso(row.updatedAt),
  };
}

function mapRule(row: any) {
  return {
    id: row.id,
    name: row.name,
    version: row.version,
    priority: row.priority,
    enabled: row.enabled,
    conditions: row.conditions,
    connectionId: row.connectionId,
    connectionName: row.connection?.displayName,
    serviceId: row.serviceId,
    serviceName: row.service?.displayName,
    updatedAt: iso(row.updatedAt),
  };
}

export function calculateCourierCod(order: any) {
  const total = Number(order.totalAmount);
  const refunded = (order.refunds ?? []).reduce(
    (sum: number, refund: any) => sum + Number(refund.amount),
    0,
  );
  if (!Number.isFinite(total) || !Number.isFinite(refunded) || total < 0 || refunded < 0 || refunded > total) {
    throw new AdminDeliveryServiceError("Order payment amounts are inconsistent", 409);
  }
  if (order.currency !== "BDT") {
    throw new AdminDeliveryServiceError("Courier dispatch currently requires BDT", 409);
  }
  if (order.paymentStatus === "paid" || order.paymentStatus === "refunded") return 0;
  if (order.paymentMethod !== "cash_on_delivery") {
    throw new AdminDeliveryServiceError("Unpaid non-COD orders cannot be dispatched", 409);
  }
  return Math.max(0, total - refunded);
}

function addressLine(address: any) {
  return [address.line1, address.line2, address.city, address.state, address.postalCode, address.country]
    .filter(Boolean)
    .join(", ");
}

export class CourierRoutingDispatchService {
  constructor(private readonly dependencies: Dependencies) {}

  async listServices() {
    const rows = await this.dependencies.db.courierService.findMany({
      include: {
        connection: { include: { provider: true } },
        methods: { include: { shippingRate: true } },
      },
      orderBy: [{ connection: { priority: "asc" } }, { displayName: "asc" }],
    });
    return rows.map(mapService);
  }

  async createService(input: CreateCourierServiceInput, actorUserId?: string) {
    const connection = await this.dependencies.db.courierConnection.findUnique({ where: { id: input.connectionId } });
    if (!connection) throw new AdminDeliveryServiceError("Courier connection not found", 404);
    const count = await this.dependencies.db.shippingRate.count({ where: { id: { in: [...new Set(input.shippingRateIds)] } } });
    if (count !== new Set(input.shippingRateIds).size) throw new AdminDeliveryServiceError("One or more delivery methods do not exist", 404);
    const row = await this.dependencies.db.courierService.create({
      data: {
        connectionId: input.connectionId,
        code: input.code,
        displayName: input.displayName.trim(),
        enabled: false,
        methods: { create: [...new Set(input.shippingRateIds)].map((shippingRateId) => ({ shippingRateId })) },
      },
      include: { connection: { include: { provider: true } }, methods: { include: { shippingRate: true } } },
    });
    await this.audit("courier.service.created", actorUserId, `Created courier service ${row.displayName}`, { serviceId: row.id });
    return mapService(row);
  }

  async updateService(id: string, input: UpdateCourierServiceInput, actorUserId?: string) {
    const existing = await this.dependencies.db.courierService.findUnique({ where: { id } });
    if (!existing) throw new AdminDeliveryServiceError("Courier service not found", 404);
    const ids = input.shippingRateIds ? [...new Set(input.shippingRateIds)] : undefined;
    if (ids) {
      const count = await this.dependencies.db.shippingRate.count({ where: { id: { in: ids } } });
      if (count !== ids.length) throw new AdminDeliveryServiceError("One or more delivery methods do not exist", 404);
    }
    const row = await this.dependencies.db.$transaction(async (tx: any) => {
      if (ids) {
        await tx.courierServiceMethod.deleteMany({ where: { serviceId: id } });
        await tx.courierServiceMethod.createMany({ data: ids.map((shippingRateId) => ({ serviceId: id, shippingRateId })) });
      }
      return tx.courierService.update({
        where: { id },
        data: {
          ...(input.displayName === undefined ? {} : { displayName: input.displayName.trim() }),
          ...(input.enabled === undefined ? {} : { enabled: input.enabled }),
        },
        include: { connection: { include: { provider: true } }, methods: { include: { shippingRate: true } } },
      });
    });
    await this.audit("courier.service.updated", actorUserId, `Updated courier service ${row.displayName}`, { serviceId: id });
    return mapService(row);
  }

  async listRules() {
    const rows = await this.dependencies.db.courierRoutingRule.findMany({
      include: { connection: true, service: true },
      orderBy: [{ priority: "asc" }, { name: "asc" }],
    });
    return rows.map(mapRule);
  }

  async createRule(input: CreateCourierRoutingRuleInput, actorUserId?: string) {
    await this.validateRuleTarget(input.connectionId, input.serviceId);
    const row = await this.dependencies.db.courierRoutingRule.create({
      data: { ...input, name: input.name.trim(), enabled: false },
      include: { connection: true, service: true },
    });
    await this.audit("courier.routing_rule.created", actorUserId, `Created courier routing rule ${row.name}`, { ruleId: row.id });
    return mapRule(row);
  }

  async updateRule(id: string, input: UpdateCourierRoutingRuleInput, actorUserId?: string) {
    const existing = await this.dependencies.db.courierRoutingRule.findUnique({ where: { id } });
    if (!existing) throw new AdminDeliveryServiceError("Courier routing rule not found", 404);
    const connectionId = input.connectionId ?? existing.connectionId;
    const serviceId = input.serviceId ?? existing.serviceId;
    await this.validateRuleTarget(connectionId, serviceId);
    const changesConditions = input.conditions !== undefined || input.connectionId !== undefined || input.serviceId !== undefined;
    const row = await this.dependencies.db.courierRoutingRule.update({
      where: { id },
      data: {
        ...input,
        ...(input.name === undefined ? {} : { name: input.name.trim() }),
        ...(changesConditions ? { version: { increment: 1 } } : {}),
      },
      include: { connection: true, service: true },
    });
    await this.audit("courier.routing_rule.updated", actorUserId, `Updated courier routing rule ${row.name}`, { ruleId: row.id, version: row.version });
    return mapRule(row);
  }

  async recommend(orderId: string) {
    const { order, request } = await this.orderRequest(orderId);
    const [connections, services, rules] = await Promise.all([
      this.dependencies.db.courierConnection.findMany(),
      this.dependencies.db.courierService.findMany({ include: { methods: true } }),
      this.dependencies.db.courierRoutingRule.findMany(),
    ]);
    const result = rankCourierRoutes({
      request,
      connections: connections.map((row: any) => ({ id: row.id, displayName: row.displayName, enabled: row.enabled, health: row.healthState, priority: row.priority })),
      services: services.map((row: any) => ({ id: row.id, connectionId: row.connectionId, enabled: row.enabled, shippingMethodIds: row.methods.map((method: any) => method.shippingRateId) })),
      rules: rules.map((row: any) => ({ id: row.id, version: row.version, priority: row.priority, enabled: row.enabled, connectionId: row.connectionId, serviceId: row.serviceId, ...jsonObject(row.conditions) })),
    });
    const shipping = order.addresses.find((item: any) => item.type === "shipping");
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      request,
      payloadPreview: {
        invoice: order.orderNumber.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 100),
        recipientName: shipping?.fullName ?? order.customerName,
        recipientPhone: shipping?.phone ?? order.customerPhone,
        recipientAddress: shipping ? addressLine(shipping) : null,
        codAmount: request.outstandingCodAmount.toFixed(2),
        currency: order.currency,
      },
      ...result,
    };
  }

  async confirm(orderId: string, input: ConfirmCourierRouteInput, actorUserId: string) {
    const recommendation = await this.recommend(orderId);
    const selected = recommendation.candidates.find((candidate) => candidate.connectionId === input.connectionId && candidate.serviceId === input.serviceId);
    const recommended = recommendation.candidates[0];
    if (!selected) throw new AdminDeliveryServiceError("The selected courier route is not currently eligible", 409);
    const isOverride = Boolean(recommended && (recommended.connectionId !== selected.connectionId || recommended.serviceId !== selected.serviceId));
    if (isOverride && !input.overrideReason?.trim()) throw new AdminDeliveryServiceError("An override reason is required", 400);
    const active = await this.dependencies.db.courierDispatch.findFirst({ where: { orderId, status: { in: ["confirmed", "queued", "processing", "submitted"] } } });
    if (active) throw new AdminDeliveryServiceError("This order already has an active courier dispatch", 409);
    const snapshot = {
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      request: recommendation.request,
      evaluatedRules: recommendation.evaluatedRules,
      candidates: recommendation.candidates,
      warnings: recommendation.warnings,
      recommended: recommended ?? null,
      selected,
      overrideReason: input.overrideReason?.trim() ?? null,
      confirmedByUserId: actorUserId,
    };
    const dispatch = await this.dependencies.db.courierDispatch.create({
      data: { orderId, connectionId: input.connectionId, serviceId: input.serviceId, routingSnapshot: snapshot, overrideReason: input.overrideReason?.trim(), confirmedByUserId: actorUserId, status: "confirmed" },
    });
    await this.audit(isOverride ? "courier.dispatch.route_overridden" : "courier.dispatch.route_confirmed", actorUserId, `Confirmed courier route for ${recommendation.orderNumber}`, { dispatchId: dispatch.id, orderId, connectionId: input.connectionId, serviceId: input.serviceId });
    return { ...dispatch, routingSnapshot: snapshot };
  }

  async queue(dispatchId: string, actorUserId: string) {
    const dispatch = await this.dependencies.db.courierDispatch.findUnique({
      where: { id: dispatchId },
      include: { order: { include: { addresses: true, refunds: true } }, connection: true, service: true, consignment: true },
    });
    if (!dispatch) throw new AdminDeliveryServiceError("Courier dispatch not found", 404);
    if (dispatch.consignment) return dispatch.consignment;
    if (dispatch.status !== "confirmed") throw new AdminDeliveryServiceError("Courier dispatch is not awaiting submission", 409);
    const order = dispatch.order;
    if (!["confirmed", "processing"].includes(order.orderStatus) || order.inventoryStatus !== "committed") {
      throw new AdminDeliveryServiceError("Order must be confirmed with committed inventory before dispatch", 409);
    }
    const shipping = order.addresses.find((item: any) => item.type === "shipping");
    if (!shipping) throw new AdminDeliveryServiceError("Shipping address is missing", 409);
    const codAmount = calculateCourierCod(order);
    const invoice = order.orderNumber.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 100);
    const requestSnapshot = {
      schemaVersion: 1,
      invoice,
      recipientName: shipping.fullName,
      recipientPhone: shipping.phone ?? order.customerPhone,
      recipientAddress: addressLine(shipping),
      codAmount: codAmount.toFixed(2),
      currency: order.currency,
      note: order.customerNotes?.slice(0, 480) || undefined,
    };
    const result = await this.dependencies.db.$transaction(async (tx: any) => {
      const consignment = await tx.courierConsignment.create({
        data: { orderId: order.id, dispatchId, connectionId: dispatch.connectionId, serviceId: dispatch.serviceId, invoice, codAmount: codAmount.toFixed(2), currency: order.currency, requestSnapshot },
      });
      await tx.courierOperation.create({ data: { consignmentId: consignment.id, kind: "create", identity: `create:${dispatchId}` } });
      await tx.courierDispatch.update({ where: { id: dispatchId }, data: { status: "queued" } });
      return consignment;
    });
    await this.audit("courier.dispatch.queued", actorUserId, `Queued courier dispatch for ${order.orderNumber}`, { dispatchId, consignmentId: result.id, operationIdentity: `create:${dispatchId}` });
    return result;
  }

  async listDispatches() {
    return this.dependencies.db.courierDispatch.findMany({
      include: { order: { select: { orderNumber: true } }, connection: { select: { displayName: true } }, service: { select: { displayName: true } }, consignment: { include: { operations: { orderBy: { createdAt: "desc" }, take: 1 } } } },
      orderBy: { createdAt: "desc" }, take: 100,
    });
  }

  private async orderRequest(orderId: string): Promise<{ order: any; request: CourierRouteRequest }> {
    const order = await this.dependencies.db.order.findUnique({ where: { id: orderId }, include: { addresses: true, refunds: true } });
    if (!order) throw new AdminDeliveryServiceError("Order not found", 404);
    if (!order.shippingRateId) throw new AdminDeliveryServiceError("Order has no delivery method", 409);
    const shipping = order.addresses.find((item: any) => item.type === "shipping");
    if (!shipping?.country) throw new AdminDeliveryServiceError("Order shipping country is missing", 409);
    const cod = calculateCourierCod(order);
    return { order, request: { shippingMethodId: order.shippingRateId, country: shipping.country, city: shipping.city, zone: shipping.state, postalCode: shipping.postalCode, paymentKind: cod > 0 ? "cod" : "prepaid", outstandingCodAmount: cod } };
  }

  private async validateRuleTarget(connectionId: string, serviceId: string) {
    const service = await this.dependencies.db.courierService.findUnique({ where: { id: serviceId } });
    if (!service || service.connectionId !== connectionId) throw new AdminDeliveryServiceError("Courier service does not belong to the selected connection", 409);
  }

  private audit(type: string, actorUserId: string | undefined, message: string, metadata: Record<string, unknown>) {
    return this.dependencies.activity.record({ type, actorUserId, message, metadata: metadata as any });
  }
}

export const courierRoutingDispatchService = new CourierRoutingDispatchService({ db: prisma, activity: activityService });
