import { orderMoney, moneyStatus, minorUnitsString } from "../../ecommerce/orders/payment-accounting";
import { invalidatePaymentDispatches } from "../../ecommerce/orders/payment-dispatch";
import type {
  CancelOrderInput,
  RecordOrderRefundInput,
} from "./orders.dto";
import {
  AdminOrdersServiceError,
  releaseReservations,
  restockCommittedReservations,
  withOrderTransaction,
} from "./orders.service";
import { orderNeedsPhysicalRecovery, stopUnsubmittedDispatches } from "./order-custody";
import { restockReceivedOrder } from "./order-recovery.service";

type OrdersActor = {
  userId?: string;
  canRestock?: boolean;
};

function requiredTrimmed(value: string, field: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new AdminOrdersServiceError(`${field} is required`);
  }
  return trimmed;
}

function nullableTrimmed(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function refundAmount(value: string) {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new AdminOrdersServiceError(
      "Refund amount must be a positive amount with at most two decimal places",
    );
  }

  const parts = normalized.split(".");
  const whole = parts[0]!;
  const fraction = parts[1] ?? "";
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  if (cents <= 0n) {
    throw new AdminOrdersServiceError("Refund amount must be greater than zero");
  }
  return { value: `${whole}.${fraction.padEnd(2, "0")}`, cents };
}

export const orderOperationsService = {
  async cancelOrder(id: string, input: CancelOrderInput, actor: OrdersActor) {
    const reason = requiredTrimmed(input.reason, "Cancellation reason");
    const note = nullableTrimmed(input.note);

    return withOrderTransaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id }, include: { payments: true, refunds: true } });
      if (!current) {
        throw new AdminOrdersServiceError("Order not found", 404);
      }
      if (current.orderStatus === "cancelled") {
        throw new AdminOrdersServiceError("Order is already cancelled", 409);
      }
      if (current.deliveryStatus === "delivered" || current.deliveredAt) {
        throw new AdminOrdersServiceError("A delivered order cannot be cancelled", 409);
      }

      const courier = await stopUnsubmittedDispatches(tx, id, actor.userId);
      const physicalRecoveryRequired = await orderNeedsPhysicalRecovery(tx, current, courier.recoveryRequired);
      const expiredInventory = current.inventoryStatus === "committed" && Boolean(await tx.stockReservation.findFirst({
        where: { referenceType: "order", referenceId: id, status: "committed", batch: { expiryDate: { lte: new Date() } } },
      }));
      const recoveryRequired = physicalRecoveryRequired || expiredInventory || (current.inventoryStatus === "committed" && !actor.canRestock);

      let inventorySideEffect = "none";
      let affectedReservations = 0;
      if (current.inventoryStatus === "reserved" && !physicalRecoveryRequired) {
        affectedReservations = await releaseReservations(tx, {
          orderId: id,
          actorUserId: actor.userId,
          reason: `Order cancelled: ${reason}`,
        });
        inventorySideEffect = affectedReservations > 0 ? "released" : "none";
      } else if (current.inventoryStatus === "committed" && !recoveryRequired) {
        affectedReservations = await restockCommittedReservations(tx, {
          orderId: id,
          actorUserId: actor.userId,
          reason: `Order cancelled: ${reason}`,
        });
        inventorySideEffect = affectedReservations > 0 ? "restocked" : "none";
      }

      await tx.order.update({
        where: { id },
        data: { orderStatus: "cancelled" },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          type: "order",
          previousValue: current.orderStatus,
          newValue: "cancelled",
          note: note ?? reason,
          actorUserId: actor.userId ?? null,
          metadata: {
            action: "order_cancelled",
            reason,
            previousInventoryStatus: current.inventoryStatus,
            inventorySideEffect,
            affectedReservations,
            recoveryRequired,
            expiredInventory,
          },
        },
      });

      return { orderId: id, orderStatus: "cancelled", inventorySideEffect, recoveryRequired };
    });
  },

  async recordRefund(
    id: string,
    input: RecordOrderRefundInput,
    actor: OrdersActor,
  ) {
    if (!actor.userId) throw new AdminOrdersServiceError("Authenticated refund actor is required", 403);
    const amount = refundAmount(input.amount);
    const reason = requiredTrimmed(input.reason, "Refund reason");
    const note = nullableTrimmed(input.note);
    const restockInventory = input.restockInventory ?? false;

    if (restockInventory && !actor.canRestock) throw new AdminOrdersServiceError("Inventory management and fulfillment permissions are required to restock", 403);
    return withOrderTransaction(
      async (tx) => {
        const current = await tx.order.findUnique({ where: { id }, include: { payments: true, refunds: true } });
        if (!current) {
          throw new AdminOrdersServiceError("Order not found", 404);
        }
        if (!["paid", "partially_paid", "partially_refunded", "refunded"].includes(current.paymentStatus)) {
          throw new AdminOrdersServiceError(
            "Refunds can only be recorded for paid or partially refunded orders",
            409,
          );
        }

        const money = orderMoney(current);
        const nextRefunded = money.refunded + amount.cents;
        if (nextRefunded > money.received) {
          throw new AdminOrdersServiceError(`Refund exceeds remaining received money of ${minorUnitsString(money.netReceived)} ${current.currency}`, 409);
        }

        let affectedReservations = 0;
        if (restockInventory) {
          if (current.inventoryStatus !== "committed") {
            throw new AdminOrdersServiceError(
              current.inventoryStatus === "restocked"
                ? "Order inventory has already been restocked"
                : "Only committed order inventory can be restocked",
              409,
            );
          }
          if (!actor.userId) throw new AdminOrdersServiceError("An authenticated restock actor is required", 403);
          const recovery = await restockReceivedOrder(tx, id, actor.userId, `Manual refund (whole-order recovery): ${reason}`);
          affectedReservations = recovery.affectedReservations;
          if (affectedReservations === 0) {
            throw new AdminOrdersServiceError(
              "No committed inventory was available to restock",
              409,
            );
          }
        }

        const refund = await tx.orderRefund.create({
          data: {
            orderId: id,
            amount: amount.value,
            currency: current.currency,
            reason,
            note,
            restockInventory,
            actorUserId: actor.userId ?? null,
          },
        });
        const paymentStatus = moneyStatus({ ...money, refunded: nextRefunded, netReceived: money.received - nextRefunded });

        await tx.order.update({
          where: { id },
          data: { paymentStatus },
        });
        await tx.orderStatusEvent.create({
          data: {
            orderId: id,
            type: "payment",
            previousValue: current.paymentStatus,
            newValue: paymentStatus,
            note: note ?? reason,
            actorUserId: actor.userId ?? null,
            metadata: {
              action: "manual_refund_recorded",
              refundId: refund.id,
              reason,
              amount: amount.value,
              currency: current.currency,
              restockInventory,
              affectedReservations,
            },
          },
        });

        await invalidatePaymentDispatches(tx, id, actor.userId);
        return {
          id: refund.id,
          orderId: id,
          amount: amount.value,
          currency: current.currency,
          paymentStatus,
          totalRefunded: minorUnitsString(nextRefunded),
          restockInventory,
        };
      },
    );
  },
};
