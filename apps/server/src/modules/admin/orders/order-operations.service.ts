import prisma from "@db/server";
import type {
  CancelOrderInput,
  RecordOrderRefundInput,
} from "./orders.dto";
import {
  AdminOrdersServiceError,
  releaseReservations,
  restockCommittedReservations,
} from "./orders.service";

type OrdersActor = {
  userId?: string;
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

function moneyToCents(value: unknown) {
  const normalized = String(value);
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new AdminOrdersServiceError("Order money data is invalid", 500);
  }
  const parts = normalized.split(".");
  const whole = parts[0]!;
  const fraction = parts[1] ?? "";
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

function centsToMoney(value: bigint) {
  return `${value / 100n}.${String(value % 100n).padStart(2, "0")}`;
}

export const orderOperationsService = {
  async cancelOrder(id: string, input: CancelOrderInput, actor: OrdersActor) {
    const reason = requiredTrimmed(input.reason, "Cancellation reason");
    const note = nullableTrimmed(input.note);

    return prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id } });
      if (!current) {
        throw new AdminOrdersServiceError("Order not found", 404);
      }
      if (current.orderStatus === "cancelled") {
        throw new AdminOrdersServiceError("Order is already cancelled", 409);
      }
      if (current.deliveryStatus === "delivered" || current.deliveredAt) {
        throw new AdminOrdersServiceError("A delivered order cannot be cancelled", 409);
      }

      let inventorySideEffect = "none";
      let affectedReservations = 0;
      if (current.inventoryStatus === "reserved") {
        affectedReservations = await releaseReservations(tx, {
          orderId: id,
          actorUserId: actor.userId,
          reason: `Order cancelled: ${reason}`,
        });
        inventorySideEffect = affectedReservations > 0 ? "released" : "none";
      } else if (current.inventoryStatus === "committed") {
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
          },
        },
      });

      return { orderId: id, orderStatus: "cancelled", inventorySideEffect };
    });
  },

  async recordRefund(
    id: string,
    input: RecordOrderRefundInput,
    actor: OrdersActor,
  ) {
    const amount = refundAmount(input.amount);
    const reason = requiredTrimmed(input.reason, "Refund reason");
    const note = nullableTrimmed(input.note);
    const restockInventory = input.restockInventory ?? false;

    return prisma.$transaction(
      async (tx) => {
        const current = await tx.order.findUnique({ where: { id } });
        if (!current) {
          throw new AdminOrdersServiceError("Order not found", 404);
        }
        if (!["paid", "partially_refunded"].includes(current.paymentStatus)) {
          throw new AdminOrdersServiceError(
            "Refunds can only be recorded for paid or partially refunded orders",
            409,
          );
        }

        const aggregate = await tx.orderRefund.aggregate({
          where: { orderId: id },
          _sum: { amount: true },
        });
        const alreadyRefunded = moneyToCents(aggregate._sum.amount ?? "0");
        const orderTotal = moneyToCents(current.totalAmount);
        const nextRefunded = alreadyRefunded + amount.cents;
        if (nextRefunded > orderTotal) {
          throw new AdminOrdersServiceError(
            `Refund exceeds the remaining order total of ${centsToMoney(orderTotal - alreadyRefunded)} ${current.currency}`,
            409,
          );
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
          affectedReservations = await restockCommittedReservations(tx, {
            orderId: id,
            actorUserId: actor.userId,
            reason: `Manual refund: ${reason}`,
          });
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
        const paymentStatus = nextRefunded === orderTotal
          ? "refunded"
          : "partially_refunded";

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

        return {
          id: refund.id,
          orderId: id,
          amount: amount.value,
          currency: current.currency,
          paymentStatus,
          totalRefunded: centsToMoney(nextRefunded),
          restockInventory,
        };
      },
      { isolationLevel: "Serializable" },
    );
  },
};
