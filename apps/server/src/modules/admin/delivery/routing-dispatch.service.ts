import { markOrderUnits } from "../../ecommerce/niche/gadgets";
import { canRetryUnsubmittedHold, canReconcileBooking } from "../../delivery/dispatch-policy";
import { orderHasUnsafeCommittedStock } from "../../ecommerce/inventory/stock-policy";
import { assertNicheShipmentReady } from "../../ecommerce/niche/fulfillment";
import { NichePolicyError } from "../../ecommerce/niche/policy";
import { randomUUID } from "node:crypto";
import { assertShipmentClaim, ShipmentClaimConflict } from "../../delivery/shipment-claim";
import { shipmentNeedsRecovery, manualShipmentNeedsRecovery } from "../../ecommerce/orders/recovery-policy";
import { courierCod } from "../../ecommerce/orders/payment-accounting";
import { courierRequestSnapshot, assertReviewedCourierRequest } from "../../delivery/dispatch-snapshot";
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
    archivedAt: row.archivedAt ? iso(row.archivedAt) : null,
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
    archivedAt: row.archivedAt ? iso(row.archivedAt) : null,
    conditions: row.conditions,
    connectionId: row.connectionId,
    connectionName: row.connection?.displayName,
    providerName: row.connection?.provider?.displayName,
    serviceId: row.serviceId,
    serviceName: row.service?.displayName,
    updatedAt: iso(row.updatedAt),
  };
}

export function calculateCourierCod(order: any) {
  try { return Number(courierCod(order)); }
  catch (error) { throw new AdminDeliveryServiceError((error as Error).message, 409); }
}

function addressLine(address: any) {
  return [address.line1, address.line2, address.city, address.state, address.postalCode, address.country]
    .filter(Boolean)
    .join(", ");
}

export class CourierRoutingDispatchService {
  constructor(private readonly dependencies: Dependencies) {}

  async listServices(archived = false) {
    const rows = await this.dependencies.db.courierService.findMany({
      where: { archivedAt: archived ? { not: null } : null },
      include: {
        connection: { include: { provider: true } },
        methods: { include: { shippingRate: true } },
      },
      orderBy: [{ connection: { priority: "asc" } }, { displayName: "asc" }],
    });
    return rows.map(mapService);
  }

  async createService(input: CreateCourierServiceInput, actorUserId?: string) {
    const connection = await this.dependencies.db.courierConnection.findFirst({ where: { id: input.connectionId, archivedAt: null } });
    if (!connection) throw new AdminDeliveryServiceError("Current courier connection not found", 404);
    const count = await this.dependencies.db.shippingRate.count({ where: { id: { in: [...new Set(input.shippingRateIds)] }, archivedAt: null } });
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
    if (existing.archivedAt) throw new AdminDeliveryServiceError("Archived delivery options cannot be edited", 409, "RESOURCE_ARCHIVED");
    const ids = input.shippingRateIds ? [...new Set(input.shippingRateIds)] : undefined;
    if (ids) {
      const count = await this.dependencies.db.shippingRate.count({ where: { id: { in: ids }, archivedAt: null } });
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

  async listRules(archived = false) {
    const rows = await this.dependencies.db.courierRoutingRule.findMany({
      where: { archivedAt: archived ? { not: null } : null },
      include: { connection: { include: { provider: true } }, service: true },
      orderBy: [{ priority: "asc" }, { name: "asc" }],
    });
    return rows.map(mapRule);
  }

  async createRule(input: CreateCourierRoutingRuleInput, actorUserId?: string) {
    await this.validateRuleTarget(input.connectionId, input.serviceId);
    const row = await this.dependencies.db.courierRoutingRule.create({
      data: { ...input, name: input.name.trim(), enabled: false },
      include: { connection: { include: { provider: true } }, service: true },
    });
    await this.audit("courier.routing_rule.created", actorUserId, `Created courier routing rule ${row.name}`, { ruleId: row.id });
    return mapRule(row);
  }

  async updateRule(id: string, input: UpdateCourierRoutingRuleInput, actorUserId?: string) {
    const existing = await this.dependencies.db.courierRoutingRule.findUnique({ where: { id } });
    if (!existing) throw new AdminDeliveryServiceError("Courier routing rule not found", 404);
    if (existing.archivedAt) throw new AdminDeliveryServiceError("Archived assignment rules cannot be edited", 409, "RESOURCE_ARCHIVED");
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
      include: { connection: { include: { provider: true } }, service: true },
    });
    await this.audit("courier.routing_rule.updated", actorUserId, `Updated courier routing rule ${row.name}`, { ruleId: row.id, version: row.version });
    return mapRule(row);
  }

  async recommend(orderId: string) {
    const { order, request } = await this.orderRequest(orderId);
    const [connections, services, rules] = await Promise.all([
      this.dependencies.db.courierConnection.findMany({ where: { archivedAt: null } }),
      this.dependencies.db.courierService.findMany({ where: { archivedAt: null }, include: { methods: { where: { shippingRate: { archivedAt: null } } } } }),
      this.dependencies.db.courierRoutingRule.findMany({ where: { archivedAt: null } }),
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
      reviewedRequest: courierRequestSnapshot(order),
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

    const snapshot = {
      schemaVersion: 2,
      reviewedRequest: { ...recommendation.reviewedRequest, invoice: `${recommendation.reviewedRequest.invoice.slice(0, 83)}_${randomUUID().replaceAll("-", "").slice(0, 16)}` },
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
    const dispatch = await this.shipmentTransaction(async (tx: any) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { addresses: true, refunds: true, payments: true, recovery: true, statusEvents: { where: { type: "delivery" }, select: { newValue: true } } } });
      if (!order || !["confirmed", "processing"].includes(order.orderStatus) || order.inventoryStatus !== "committed" || order.recovery
        || !["unfulfilled", "preparing", "ready_to_ship"].includes(order.deliveryStatus) || order.shippedAt || order.deliveredAt) {
        throw new AdminDeliveryServiceError("Only unshipped, confirmed orders with committed inventory can acquire a shipment", 409);
      }
      try { if ((await assertNicheShipmentReady(tx, orderId)).freshFood) throw new NichePolicyError("Fresh food requires local delivery, not a general parcel service"); } catch (e) { throw new AdminDeliveryServiceError((e as Error).message, 409); }
      try { assertReviewedCourierRequest(order, recommendation.reviewedRequest); }
      catch (error) { throw new AdminDeliveryServiceError((error as Error).message, 409); }
      const active = await tx.courierDispatch.findFirst({ where: { orderId, status: { notIn: ["cancelled", "completed"] } } });
      const history = await tx.courierConsignment.findMany({ where: { orderId }, include: { operations: true } });
      if (active || history.some(shipmentNeedsRecovery) || manualShipmentNeedsRecovery({ ...order, statusEvents: order.statusEvents ?? [] })) throw new AdminDeliveryServiceError("Reconcile existing or uncertain shipments before confirming another route", 409);
      const created = await tx.courierDispatch.create({
        data: { orderId, connectionId: input.connectionId, serviceId: input.serviceId, routingSnapshot: snapshot, overrideReason: input.overrideReason?.trim(), confirmedByUserId: actorUserId, status: "confirmed" },
      });
      await tx.courierShipmentClaim.create({ data: { orderId, dispatchId: created.id } });
      await tx.orderStatusEvent.create({ data: {
        orderId, type: "delivery", newValue: "shipment_claim_acquired", actorUserId,
        note: "Courier route confirmed", metadata: { action: "shipment_claim_acquired", dispatchId: created.id, connectionId: input.connectionId, serviceId: input.serviceId, invoice: snapshot.reviewedRequest.invoice },
      } });
      return created;
    });
    await this.audit(isOverride ? "courier.dispatch.route_overridden" : "courier.dispatch.route_confirmed", actorUserId, `Confirmed courier route for ${recommendation.orderNumber}`, { dispatchId: dispatch.id, orderId, connectionId: input.connectionId, serviceId: input.serviceId });
    return { ...dispatch, routingSnapshot: snapshot };
  }

  async queue(dispatchId: string, actorUserId: string) {
    let orderNumber = "";
    let newlyQueued = false;
    const result = await this.shipmentTransaction(async (tx: any) => {
      const dispatch = await tx.courierDispatch.findUnique({ where: { id: dispatchId }, include: { consignment: true } });
      if (!dispatch) throw new AdminDeliveryServiceError("Courier dispatch not found", 404);
      await assertShipmentClaim(tx, dispatch.orderId, dispatchId);
      if (dispatch.consignment) return dispatch.consignment;
      if (dispatch.status !== "confirmed") throw new AdminDeliveryServiceError("Courier dispatch is not awaiting submission", 409);
      try { if ((await assertNicheShipmentReady(tx, dispatch.orderId)).freshFood) throw new NichePolicyError("Fresh food requires local delivery"); } catch (e) { throw new AdminDeliveryServiceError((e as Error).message, 409); }
      const currentOrder = await tx.order.findUnique({ where: { id: dispatch.orderId }, include: { recovery: true, payments: true, refunds: true, addresses: true } });
      if (!currentOrder || !["confirmed", "processing"].includes(currentOrder.orderStatus) || currentOrder.inventoryStatus !== "committed" || currentOrder.recovery
        || !["unfulfilled", "preparing", "ready_to_ship"].includes(currentOrder.deliveryStatus) || currentOrder.shippedAt || currentOrder.deliveredAt) {
        throw new AdminDeliveryServiceError("Order was cancelled, shipped or recovered; reload before dispatch", 409);
      }
      let requestSnapshot;
      try { requestSnapshot = assertReviewedCourierRequest(currentOrder, jsonObject(dispatch.routingSnapshot).reviewedRequest); }
      catch (error) { throw new AdminDeliveryServiceError((error as Error).message, 409); }
      const queued = await tx.courierDispatch.updateMany({ where: { id: dispatchId, status: "confirmed" }, data: { status: "queued" } });
      if (queued.count !== 1) throw new AdminDeliveryServiceError("Dispatch changed; reload before queueing", 409);
      const consignment = await tx.courierConsignment.create({
        data: { orderId: dispatch.orderId, dispatchId, connectionId: dispatch.connectionId, serviceId: dispatch.serviceId, invoice: requestSnapshot.invoice, codAmount: requestSnapshot.codAmount, currency: currentOrder.currency, requestSnapshot },
      });
      await tx.courierOperation.create({ data: { consignmentId: consignment.id, kind: "create", identity: `create:${dispatchId}` } });
      orderNumber = currentOrder.orderNumber;
      newlyQueued = true;
      return consignment;
    });
    if (newlyQueued) await this.audit("courier.dispatch.queued", actorUserId, `Queued courier dispatch for ${orderNumber}`, { dispatchId, consignmentId: result.id, operationIdentity: `create:${dispatchId}` });
    return result;
  }

  async reconcileBooking(consignmentId: string, input: { invoice: string; externalId: string; trackingCode?: string | null; providerState: string; note: string }, actorUserId: string) {
    const externalId = input.externalId.trim(), note = input.note.trim(), providerState = input.providerState.trim();
    if (!externalId || !note || !providerState) throw new AdminDeliveryServiceError("Merchant booking identity, status and evidence are required", 400);
    return this.shipmentTransaction(async (tx: any) => {
      const c = await tx.courierConsignment.findUnique({ where: { id: consignmentId }, include: { operations: true, order: { include: { recovery: true } } } });
      if (!c || input.invoice.trim() !== c.invoice) throw new AdminDeliveryServiceError("Evidence invoice must match the original booking attempt", 409);
      const operation = c.operations.length === 1 ? c.operations[0] : null;
      if (c.externalId === externalId && operation?.state === "completed") return { success: true, duplicate: true };
      if (!operation || !canReconcileBooking(operation, c)) throw new AdminDeliveryServiceError("Only an unleased uncertain booking can be reconciled from merchant evidence", 409);
      if (c.order.inventoryStatus !== "committed") throw new AdminDeliveryServiceError("Review inventory custody before accepting this booking identity", 409);
      await assertShipmentClaim(tx, c.orderId, c.dispatchId);
      const previousReason = operation.lastErrorCode;
      const changed = await tx.courierOperation.updateMany({ where: { id: operation.id, state: "manual_review", leaseUntil: null, attemptCount: operation.attemptCount, lastErrorCode: previousReason }, data: { state: "completed", leaseToken: null, leaseUntil: null, lastErrorCode: null } });
      if (changed.count !== 1) throw new AdminDeliveryServiceError("Booking changed; reload before reconciliation", 409);
      const trackingCode = input.trackingCode?.trim() || null;
      await tx.courierConsignment.update({ where: { id: consignmentId }, data: { externalId, trackingCode, providerState, state: "submitted", submittedAt: new Date() } });
      await tx.courierDispatch.update({ where: { id: c.dispatchId }, data: { status: "submitted" } });
      await tx.courierException.updateMany({ where: { consignmentId, kind: previousReason, state: "open" }, data: { state: "resolved", resolvedByUserId: actorUserId, resolvedAt: new Date() } });
      // Preserve cancellation/recovery and money exceptions. Identity evidence is not delivery, collection or physical receipt.
      if (!c.order.recovery) await markOrderUnits(tx, c.orderId, "shipped");
      await tx.orderStatusEvent.create({ data: { orderId: c.orderId, type: "delivery", previousValue: c.order.deliveryStatus, newValue: c.order.deliveryStatus, actorUserId, note, metadata: { action: "courier_booking_identity_reconciled", consignmentId, externalId, operationIdentity: operation.identity, previousReason } } });
      return { success: true, duplicate: false };
    });
  }

  async retryUnsubmittedHold(consignmentId: string, note: string, actorUserId: string) {
    if (!note.trim()) throw new AdminDeliveryServiceError("Review evidence is required", 400);
    return this.shipmentTransaction(async (tx: any) => {
      const c = await tx.courierConsignment.findUnique({ where: { id: consignmentId }, include: { operations: true, connection: true, service: true, order: { include: { addresses: true, payments: true, refunds: true, recovery: true } } } });
      const operation = c?.operations.length === 1 ? c.operations[0] : null;
      if (!c || !operation || !canRetryUnsubmittedHold(operation, c)) throw new AdminDeliveryServiceError("Uncertain or previously submitted bookings require reconciliation; retry is unavailable", 409);
      const previousReason = operation.lastErrorCode;
      const now = new Date();
      if (!c.connection.enabled || c.connection.archivedAt || c.connection.healthState !== "healthy" || c.connection.cooldownUntil > now || !c.service.enabled || c.service.archivedAt || c.service.connectionId !== c.connectionId) throw new AdminDeliveryServiceError("Restore the connection and service before retrying", 409);
      if (!["confirmed", "processing"].includes(c.order.orderStatus) || c.order.inventoryStatus !== "committed" || c.order.recovery || c.order.shippedAt || c.order.deliveredAt) throw new AdminDeliveryServiceError("Order is no longer eligible for shipment", 409);
      await assertShipmentClaim(tx, c.orderId, c.dispatchId);
      try { assertReviewedCourierRequest(c.order, c.requestSnapshot); if ((await assertNicheShipmentReady(tx, c.orderId)).freshFood) throw new NichePolicyError("Fresh food requires local delivery"); }
      catch (e) { throw new AdminDeliveryServiceError((e as Error).message, 409); }
      if (await orderHasUnsafeCommittedStock(tx, c.orderId)) throw new AdminDeliveryServiceError("Committed stock remains unavailable", 409);
      if (await tx.courierException.findFirst({ where: { consignmentId, state: "open", kind: { not: operation.lastErrorCode } } })) throw new AdminDeliveryServiceError("Resolve other exceptions before retrying", 409);
      const changed = await tx.courierOperation.updateMany({ where: { id: operation.id, state: "manual_review", attemptCount: 1, leaseUntil: null, lastErrorCode: operation.lastErrorCode }, data: { state: "pending", attemptCount: 0, leaseToken: null, leaseUntil: null, lastErrorCode: null, nextAttemptAt: now } });
      if (changed.count !== 1) throw new AdminDeliveryServiceError("Dispatch changed; reload", 409);
      await tx.courierException.updateMany({ where: { consignmentId, state: "open", kind: previousReason }, data: { state: "resolved", resolvedByUserId: actorUserId, resolvedAt: now } });
      await tx.courierConsignment.update({ where: { id: consignmentId }, data: { state: "pending_submission" } });
      await tx.courierDispatch.update({ where: { id: c.dispatchId }, data: { status: "queued" } });
      await tx.orderStatusEvent.create({ data: { orderId: c.orderId, type: "delivery", previousValue: c.order.deliveryStatus, newValue: c.order.deliveryStatus, actorUserId, note: note.trim(), metadata: { action: "unsubmitted_dispatch_hold_retried", consignmentId, operationIdentity: operation.identity, previousReason } } });
      return { success: true };
    });
  }

  async listDispatches() {
    return this.dependencies.db.courierDispatch.findMany({
      include: { order: { select: { orderNumber: true } }, connection: { select: { displayName: true, provider: { select: { displayName: true } } } }, service: { select: { displayName: true } }, consignment: { include: { operations: { orderBy: { createdAt: "desc" }, take: 1 } } } },
      orderBy: { createdAt: "desc" }, take: 100,
    });
  }

  async archiveService(id: string, actorUserId?: string) {
    const existing = await this.getService(id);
    if (existing.archivedAt) throw new AdminDeliveryServiceError("Delivery option is already archived", 409);
    const rules = await this.dependencies.db.courierRoutingRule.count({ where: { serviceId: id, archivedAt: null } });
    if (rules) return this.blocked("service", existing, "archive", [{ type: "assignment_rules", count: rules, action: "Archive or reassign the assignment rules first" }], actorUserId);
    const row = await this.dependencies.db.courierService.update({ where: { id }, data: { archivedAt: new Date(), enabled: false }, include: { connection: { include: { provider: true } }, methods: { include: { shippingRate: true } } } });
    await this.audit("courier.service.archived", actorUserId, `Archived delivery option ${row.displayName}`, { serviceId: id });
    return mapService(row);
  }

  async restoreService(id: string, actorUserId?: string) {
    const existing = await this.getService(id);
    if (!existing.archivedAt) throw new AdminDeliveryServiceError("Delivery option is not archived", 409);
    const connection = await this.dependencies.db.courierConnection.findFirst({ where: { id: existing.connectionId, archivedAt: null } });
    if (!connection) throw new AdminDeliveryServiceError("Restore the courier connection before restoring this delivery option", 409, "PARENT_ARCHIVED");
    const row = await this.dependencies.db.courierService.update({ where: { id }, data: { archivedAt: null, enabled: false }, include: { connection: { include: { provider: true } }, methods: { include: { shippingRate: true } } } });
    await this.audit("courier.service.restored", actorUserId, `Restored delivery option ${row.displayName}`, { serviceId: id });
    return mapService(row);
  }

  async deleteService(id: string, actorUserId?: string) {
    const existing = await this.getService(id);
    if (!existing.archivedAt) throw new AdminDeliveryServiceError("Archive the delivery option before deleting it permanently", 409, "ARCHIVE_REQUIRED");
    const [rules, dispatches, consignments] = await Promise.all([
      this.dependencies.db.courierRoutingRule.count({ where: { serviceId: id } }),
      this.dependencies.db.courierDispatch.count({ where: { serviceId: id } }),
      this.dependencies.db.courierConsignment.count({ where: { serviceId: id } }),
    ]);
    const dependencies = [
      { type: "assignment_rules", count: rules, action: "Delete the archived assignment rules first" },
      { type: "shipments", count: dispatches, action: "Historical shipments must be retained" },
      { type: "consignments", count: consignments, action: "Historical consignments must be retained" },
    ].filter((item) => item.count > 0);
    if (dependencies.length) return this.blocked("service", existing, "delete", dependencies, actorUserId);
    await this.dependencies.db.courierService.delete({ where: { id } });
    await this.audit("courier.service.deleted", actorUserId, `Permanently deleted delivery option ${existing.displayName}`, { serviceId: id });
    return { message: "Delivery option permanently deleted" };
  }

  async archiveRule(id: string, actorUserId?: string) {
    const existing = await this.getRule(id);
    if (existing.archivedAt) throw new AdminDeliveryServiceError("Assignment rule is already archived", 409);
    const row = await this.dependencies.db.courierRoutingRule.update({ where: { id }, data: { archivedAt: new Date(), enabled: false }, include: { connection: { include: { provider: true } }, service: true } });
    await this.audit("courier.routing_rule.archived", actorUserId, `Archived assignment rule ${row.name}`, { ruleId: id });
    return mapRule(row);
  }

  async restoreRule(id: string, actorUserId?: string) {
    const existing = await this.getRule(id);
    if (!existing.archivedAt) throw new AdminDeliveryServiceError("Assignment rule is not archived", 409);
    await this.validateRuleTarget(existing.connectionId, existing.serviceId);
    const row = await this.dependencies.db.courierRoutingRule.update({ where: { id }, data: { archivedAt: null, enabled: false }, include: { connection: { include: { provider: true } }, service: true } });
    await this.audit("courier.routing_rule.restored", actorUserId, `Restored assignment rule ${row.name}`, { ruleId: id });
    return mapRule(row);
  }

  async deleteRule(id: string, actorUserId?: string) {
    const existing = await this.getRule(id);
    if (!existing.archivedAt) throw new AdminDeliveryServiceError("Archive the assignment rule before deleting it permanently", 409, "ARCHIVE_REQUIRED");
    await this.dependencies.db.courierRoutingRule.delete({ where: { id } });
    await this.audit("courier.routing_rule.deleted", actorUserId, `Permanently deleted assignment rule ${existing.name}`, { ruleId: id });
    return { message: "Assignment rule permanently deleted" };
  }

  private async shipmentTransaction<T>(work: (tx: any) => Promise<T>): Promise<T> {
    try { return await this.dependencies.db.$transaction(work, { isolationLevel: "Serializable" }); }
    catch (error) {
      if (error instanceof ShipmentClaimConflict) throw new AdminDeliveryServiceError(error.message, 409);
      if (typeof error === "object" && error && "code" in error && ["P2002", "P2034"].includes(String(error.code))) {
        throw new AdminDeliveryServiceError("Shipment changed or another route won ownership; reload and retry", 409);
      }
      throw error;
    }
  }

  private async orderRequest(orderId: string): Promise<{ order: any; request: CourierRouteRequest }> {
    const order = await this.dependencies.db.order.findUnique({ where: { id: orderId }, include: { addresses: true, refunds: true, payments: true } });
    if (!order) throw new AdminDeliveryServiceError("Order not found", 404);
    if (!order.shippingRateId) throw new AdminDeliveryServiceError("Order has no delivery method", 409);
    const shipping = order.addresses.find((item: any) => item.type === "shipping");
    if (!shipping?.country) throw new AdminDeliveryServiceError("Order shipping country is missing", 409);
    const cod = calculateCourierCod(order);
    return { order, request: { shippingMethodId: order.shippingRateId, country: shipping.country, city: shipping.city, zone: shipping.state, postalCode: shipping.postalCode, paymentKind: cod > 0 ? "cod" : "prepaid", outstandingCodAmount: cod } };
  }

  private async validateRuleTarget(connectionId: string, serviceId: string) {
    const service = await this.dependencies.db.courierService.findFirst({ where: { id: serviceId, archivedAt: null }, include: { connection: true } });
    if (!service || service.connectionId !== connectionId || service.connection.archivedAt) throw new AdminDeliveryServiceError("Select a current delivery option and courier connection", 409, "PARENT_ARCHIVED");
  }

  private async getService(id: string) {
    const row = await this.dependencies.db.courierService.findUnique({ where: { id } });
    if (!row) throw new AdminDeliveryServiceError("Delivery option not found", 404);
    return row;
  }

  private async getRule(id: string) {
    const row = await this.dependencies.db.courierRoutingRule.findUnique({ where: { id } });
    if (!row) throw new AdminDeliveryServiceError("Assignment rule not found", 404);
    return row;
  }

  private async blocked(kind: string, row: any, operation: string, dependencies: Array<{ type: string; count: number; action: string }>, actorUserId?: string): Promise<never> {
    await this.audit(`courier.${kind}.${operation}_blocked`, actorUserId, `Blocked ${operation} of ${kind} ${row.displayName ?? row.name}`, { id: row.id, dependencies });
    throw new AdminDeliveryServiceError(`Cannot ${operation} ${kind === "service" ? "delivery option" : "assignment rule"} because it is still in use`, 409, "RESOURCE_IN_USE", dependencies);
  }

  private audit(type: string, actorUserId: string | undefined, message: string, metadata: Record<string, unknown>) {
    return this.dependencies.activity.record({ type, actorUserId, message, metadata: metadata as any });
  }
}

export const courierRoutingDispatchService = new CourierRoutingDispatchService({ db: prisma, activity: activityService });
