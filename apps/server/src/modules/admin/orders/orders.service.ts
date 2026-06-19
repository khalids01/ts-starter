import prisma, { type Prisma } from "@db/server";
import type {
  ListOrdersQuery,
  UpdateOrderInput,
  UpdateOrderStatusesInput,
} from "./orders.dto";

export class AdminOrdersServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

type OrdersActor = {
  userId?: string;
};

function normalizePagination(page?: number, limit?: number) {
  const normalizedLimit = Math.min(Math.max(limit ?? 20, 1), 100);
  return {
    limit: normalizedLimit,
    requestedPage: Math.max(page ?? 1, 1),
  };
}

function paginationResult<T>({
  items,
  total,
  requestedPage,
  limit,
}: {
  items: T[];
  total: number;
  requestedPage: number;
  limit: number;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    total,
    pages,
    page: Math.min(requestedPage, pages),
    limit,
  };
}

function toIso(value: Date | string | null | undefined) {
  if (!value) {
    return value ?? null;
  }
  return value instanceof Date ? value.toISOString() : value;
}

function decimalToString(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }
  return String(value);
}

function parseDate(value: string | undefined, field: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AdminOrdersServiceError(`${field} must be a valid date`);
  }
  return date;
}

function nullableTrimmed(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizedEmail(value: string | null | undefined) {
  return nullableTrimmed(value)?.toLowerCase() ?? null;
}

function stockKey(variantId: string, locationId: string, batchId?: string | null) {
  return `${variantId}:${locationId}:${batchId ?? "no_batch"}`;
}

function orderInclude() {
  return {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    },
    lineItems: {
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            coverImageUrl: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            name: true,
            imageUrls: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    },
    addresses: {
      orderBy: { type: "desc" },
    },
    statusEvents: {
      include: {
        actorUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    },
  } satisfies Prisma.OrderInclude;
}

function mapUser(row: any) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
  };
}

function mapLineItem(row: any) {
  return {
    id: row.id,
    orderId: row.orderId,
    productId: row.productId,
    product: row.product ?? null,
    variantId: row.variantId,
    variant: row.variant ?? null,
    productName: row.productName,
    variantName: row.variantName,
    sku: row.sku,
    imageUrl: row.imageUrl,
    attributesSnapshot: row.attributesSnapshot ?? null,
    quantity: row.quantity,
    unitPrice: decimalToString(row.unitPrice),
    discountAmount: decimalToString(row.discountAmount),
    taxAmount: decimalToString(row.taxAmount),
    subtotalAmount: decimalToString(row.subtotalAmount),
    totalAmount: decimalToString(row.totalAmount),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapAddress(row: any) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    orderId: row.orderId,
    type: row.type,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    postalCode: row.postalCode,
    country: row.country,
    notes: row.notes,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapStatusEvent(row: any) {
  return {
    id: row.id,
    orderId: row.orderId,
    type: row.type,
    previousValue: row.previousValue,
    newValue: row.newValue,
    note: row.note,
    metadata: row.metadata,
    actorUserId: row.actorUserId,
    actorUser: mapUser(row.actorUser),
    createdAt: toIso(row.createdAt),
  };
}

function mapOrder(row: any, options: { detail?: boolean } = {}) {
  const addresses = (row.addresses ?? []).map(mapAddress);
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    userId: row.userId,
    user: mapUser(row.user),
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    addresses,
    billingAddress: addresses.find((address: any) => address.type === "billing") ?? null,
    shippingAddress: addresses.find((address: any) => address.type === "shipping") ?? null,
    subtotalAmount: decimalToString(row.subtotalAmount),
    discountAmount: decimalToString(row.discountAmount),
    taxAmount: decimalToString(row.taxAmount),
    shippingAmount: decimalToString(row.shippingAmount),
    totalAmount: decimalToString(row.totalAmount),
    currency: row.currency,
    paymentMethod: row.paymentMethod,
    orderStatus: row.orderStatus,
    paymentStatus: row.paymentStatus,
    deliveryStatus: row.deliveryStatus,
    inventoryStatus: row.inventoryStatus,
    stockReservedUntil: toIso(row.stockReservedUntil),
    stockCommittedAt: toIso(row.stockCommittedAt),
    stockReleasedAt: toIso(row.stockReleasedAt),
    shippingRateId: row.shippingRateId,
    shippingMethodCode: row.shippingMethodCode,
    shippingMethodLabel: row.shippingMethodLabel,
    customerNotes: row.customerNotes,
    adminNotes: row.adminNotes,
    placedAt: toIso(row.placedAt),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    lineItemCount: row._count?.lineItems ?? row.lineItems?.length ?? 0,
    lineItems: options.detail ? (row.lineItems ?? []).map(mapLineItem) : undefined,
    statusEvents: options.detail
      ? (row.statusEvents ?? []).map(mapStatusEvent)
      : undefined,
  };
}

function buildOrderWhere(query: ListOrdersQuery) {
  const where: Prisma.OrderWhereInput = {};
  const search = nullableTrimmed(query.search);
  const customer = nullableTrimmed(query.customer);
  const placedFrom = parseDate(query.placedFrom, "Placed from");
  const placedTo = parseDate(query.placedTo, "Placed to");

  if (query.orderStatus) {
    where.orderStatus = query.orderStatus;
  }
  if (query.paymentStatus) {
    where.paymentStatus = query.paymentStatus;
  }
  if (query.deliveryStatus) {
    where.deliveryStatus = query.deliveryStatus;
  }
  if (query.inventoryStatus) {
    where.inventoryStatus = query.inventoryStatus;
  }
  if (query.paymentMethod) {
    where.paymentMethod = query.paymentMethod;
  }
  if (query.shippingRateId) {
    where.shippingRateId = query.shippingRateId;
  }
  if (query.userId) {
    where.userId = query.userId;
  }
  if (placedFrom || placedTo) {
    where.placedAt = {
      ...(placedFrom ? { gte: placedFrom } : {}),
      ...(placedTo ? { lte: placedTo } : {}),
    };
  }
  if (customer) {
    where.OR = [
      { customerName: { contains: customer, mode: "insensitive" } },
      { customerEmail: { contains: customer, mode: "insensitive" } },
      { customerPhone: { contains: customer, mode: "insensitive" } },
    ];
  }
  if (search) {
    const searchConditions: Prisma.OrderWhereInput[] = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search, mode: "insensitive" } },
      {
        lineItems: {
          some: {
            OR: [
              { productName: { contains: search, mode: "insensitive" } },
              { variantName: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      },
    ];

    where.AND = [
      ...(where.AND
        ? Array.isArray(where.AND)
          ? where.AND
          : [where.AND]
        : []),
      { OR: searchConditions },
    ];
  }

  return where;
}

async function getOrderReservations(
  tx: Prisma.TransactionClient,
  orderId: string,
  status: "active" | "committed",
) {
  return tx.stockReservation.findMany({
    where: {
      referenceType: "order",
      referenceId: orderId,
      status,
    },
    orderBy: { createdAt: "asc" },
  });
}

async function releaseReservations(
  tx: Prisma.TransactionClient,
  input: {
    orderId: string;
    actorUserId?: string;
    reason: string;
    expired?: boolean;
  },
) {
  const reservations = await getOrderReservations(tx, input.orderId, "active");
  const nextStatus = input.expired ? "expired" : "released";

  for (const reservation of reservations) {
    await tx.inventoryStock.update({
      where: {
        stockKey: stockKey(
          reservation.variantId,
          reservation.locationId,
          reservation.batchId,
        ),
      },
      data: {
        quantityReserved: { decrement: reservation.quantity },
      },
    });
    await tx.stockReservation.update({
      where: { id: reservation.id },
      data: { status: nextStatus },
    });
    await tx.inventoryMovement.create({
      data: {
        variantId: reservation.variantId,
        locationId: reservation.locationId,
        batchId: reservation.batchId,
        type: "reservation_release",
        delta: 0,
        reason: input.reason,
        referenceType: "order",
        referenceId: input.orderId,
        actorUserId: input.actorUserId ?? null,
      },
    });
  }

  if (reservations.length > 0) {
    await tx.order.update({
      where: { id: input.orderId },
      data: {
        inventoryStatus: "released",
        stockReleasedAt: new Date(),
      },
    });
  }

  return reservations.length;
}

async function commitReservations(
  tx: Prisma.TransactionClient,
  input: { orderId: string; actorUserId?: string },
) {
  const reservations = await getOrderReservations(tx, input.orderId, "active");
  for (const reservation of reservations) {
    await tx.inventoryStock.update({
      where: {
        stockKey: stockKey(
          reservation.variantId,
          reservation.locationId,
          reservation.batchId,
        ),
      },
      data: {
        quantityOnHand: { decrement: reservation.quantity },
        quantityReserved: { decrement: reservation.quantity },
      },
    });
    await tx.stockReservation.update({
      where: { id: reservation.id },
      data: { status: "committed" },
    });
    await tx.inventoryMovement.create({
      data: {
        variantId: reservation.variantId,
        locationId: reservation.locationId,
        batchId: reservation.batchId,
        type: "sale_commit",
        delta: -reservation.quantity,
        reason: "Order stock committed",
        referenceType: "order",
        referenceId: input.orderId,
        actorUserId: input.actorUserId ?? null,
      },
    });
  }

  if (reservations.length > 0) {
    await tx.order.update({
      where: { id: input.orderId },
      data: {
        inventoryStatus: "committed",
        stockCommittedAt: new Date(),
      },
    });
  }

  return reservations.length;
}

async function restockCommittedReservations(
  tx: Prisma.TransactionClient,
  input: { orderId: string; actorUserId?: string; reason: string },
) {
  const reservations = await getOrderReservations(tx, input.orderId, "committed");
  for (const reservation of reservations) {
    await tx.inventoryStock.update({
      where: {
        stockKey: stockKey(
          reservation.variantId,
          reservation.locationId,
          reservation.batchId,
        ),
      },
      data: {
        quantityOnHand: { increment: reservation.quantity },
      },
    });
    await tx.inventoryMovement.create({
      data: {
        variantId: reservation.variantId,
        locationId: reservation.locationId,
        batchId: reservation.batchId,
        type: "return",
        delta: reservation.quantity,
        reason: input.reason,
        referenceType: "order",
        referenceId: input.orderId,
        actorUserId: input.actorUserId ?? null,
      },
    });
  }

  if (reservations.length > 0) {
    await tx.order.update({
      where: { id: input.orderId },
      data: {
        inventoryStatus: "restocked",
        stockReleasedAt: new Date(),
      },
    });
  }

  return reservations.length;
}

async function applyInventorySideEffects(
  tx: Prisma.TransactionClient,
  input: {
    order: any;
    nextOrderStatus?: string;
    nextDeliveryStatus?: string;
    actorUserId?: string;
  },
) {
  if (
    input.nextOrderStatus === "confirmed" &&
    input.order.inventoryStatus === "reserved"
  ) {
    return commitReservations(tx, {
      orderId: input.order.id,
      actorUserId: input.actorUserId,
    });
  }

  if (
    input.nextOrderStatus === "cancelled" &&
    input.order.inventoryStatus === "reserved"
  ) {
    return releaseReservations(tx, {
      orderId: input.order.id,
      actorUserId: input.actorUserId,
      reason: "Order cancelled before stock commit",
    });
  }

  if (
    (input.nextOrderStatus === "cancelled" ||
      input.nextDeliveryStatus === "returned") &&
    input.order.inventoryStatus === "committed"
  ) {
    return restockCommittedReservations(tx, {
      orderId: input.order.id,
      actorUserId: input.actorUserId,
      reason:
        input.nextDeliveryStatus === "returned"
          ? "Order returned"
          : "Committed order cancelled",
    });
  }

  return 0;
}

function normalizeAddressInput(address: NonNullable<UpdateOrderInput["addresses"]>[number]) {
  return {
    type: address.type,
    fullName: address.fullName.trim(),
    email: normalizedEmail(address.email),
    phone: nullableTrimmed(address.phone),
    line1: address.line1.trim(),
    line2: nullableTrimmed(address.line2),
    city: nullableTrimmed(address.city),
    state: nullableTrimmed(address.state),
    postalCode: nullableTrimmed(address.postalCode),
    country: nullableTrimmed(address.country),
    notes: nullableTrimmed(address.notes),
  };
}

export const adminOrdersService = {
  async listOrders(query: ListOrdersQuery) {
    const { limit, requestedPage } = normalizePagination(query.page, query.limit);
    const where = buildOrderWhere(query);
    const total = await prisma.order.count({ where });
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);

    const items = await prisma.order.findMany({
      where,
      include: {
        user: orderInclude().user,
        _count: { select: { lineItems: true } },
      },
      orderBy: [{ placedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginationResult({
      items: items.map((item) => mapOrder(item)),
      total,
      requestedPage,
      limit,
    });
  },

  async getOrder(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: orderInclude(),
    });

    if (!order) {
      throw new AdminOrdersServiceError("Order not found", 404);
    }

    return mapOrder(order, { detail: true });
  },

  async updateOrderStatuses(
    id: string,
    input: UpdateOrderStatusesInput,
    actor: OrdersActor,
  ) {
    const note = nullableTrimmed(input.note);
    if (
      input.orderStatus === undefined &&
      input.paymentStatus === undefined &&
      input.deliveryStatus === undefined
    ) {
      throw new AdminOrdersServiceError("At least one status is required");
    }

    return prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id } });
      if (!current) {
        throw new AdminOrdersServiceError("Order not found", 404);
      }

      const events: Prisma.OrderStatusEventCreateManyInput[] = [];
      const data: Prisma.OrderUpdateInput = {};

      if (
        input.orderStatus !== undefined &&
        input.orderStatus !== current.orderStatus
      ) {
        data.orderStatus = input.orderStatus;
        events.push({
          orderId: id,
          type: "order",
          previousValue: current.orderStatus,
          newValue: input.orderStatus,
          note,
          actorUserId: actor.userId ?? null,
        });
      }

      if (
        input.paymentStatus !== undefined &&
        input.paymentStatus !== current.paymentStatus
      ) {
        data.paymentStatus = input.paymentStatus;
        events.push({
          orderId: id,
          type: "payment",
          previousValue: current.paymentStatus,
          newValue: input.paymentStatus,
          note,
          actorUserId: actor.userId ?? null,
        });
      }

      if (
        input.deliveryStatus !== undefined &&
        input.deliveryStatus !== current.deliveryStatus
      ) {
        data.deliveryStatus = input.deliveryStatus;
        events.push({
          orderId: id,
          type: "delivery",
          previousValue: current.deliveryStatus,
          newValue: input.deliveryStatus,
          note,
          actorUserId: actor.userId ?? null,
        });
      }

      if (events.length === 0) {
        return mapOrder(current);
      }

      await applyInventorySideEffects(tx, {
        order: current,
        nextOrderStatus: input.orderStatus,
        nextDeliveryStatus: input.deliveryStatus,
        actorUserId: actor.userId,
      });

      await tx.order.update({
        where: { id },
        data,
      });
      await tx.orderStatusEvent.createMany({ data: events });
      const updated = await tx.order.findUniqueOrThrow({
        where: { id },
        include: orderInclude(),
      });

      return mapOrder(updated, { detail: true });
    });
  },

  async updateOrder(id: string, input: UpdateOrderInput) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id } });
      if (!existing) {
        throw new AdminOrdersServiceError("Order not found", 404);
      }

      const data: Prisma.OrderUpdateInput = {};
      if (input.customerName !== undefined) {
        data.customerName = input.customerName.trim();
      }
      if (input.customerEmail !== undefined) {
        data.customerEmail = normalizedEmail(input.customerEmail) ?? existing.customerEmail;
      }
      if (input.customerPhone !== undefined) {
        data.customerPhone = nullableTrimmed(input.customerPhone);
      }
      if (input.customerNotes !== undefined) {
        data.customerNotes = nullableTrimmed(input.customerNotes);
      }
      if (input.adminNotes !== undefined) {
        data.adminNotes = nullableTrimmed(input.adminNotes);
      }

      if (Object.keys(data).length > 0) {
        await tx.order.update({ where: { id }, data });
      }

      for (const address of input.addresses ?? []) {
        const normalized = normalizeAddressInput(address);
        await tx.orderAddress.upsert({
          where: {
            orderId_type: {
              orderId: id,
              type: normalized.type,
            },
          },
          create: {
            orderId: id,
            ...normalized,
          },
          update: normalized,
        });
      }

      const updated = await tx.order.findUniqueOrThrow({
        where: { id },
        include: orderInclude(),
      });
      return mapOrder(updated, { detail: true });
    });
  },

  async releaseExpiredReservations(actor: OrdersActor) {
    return prisma.$transaction(async (tx) => {
      const reservations = await tx.stockReservation.findMany({
        where: {
          referenceType: "order",
          status: "active",
          expiresAt: { lte: new Date() },
          referenceId: { not: null },
        },
        orderBy: { expiresAt: "asc" },
      });

      const orderIds = new Set<string>();
      for (const reservation of reservations) {
        if (!reservation.referenceId) {
          continue;
        }
        orderIds.add(reservation.referenceId);
        await tx.inventoryStock.update({
          where: {
            stockKey: stockKey(
              reservation.variantId,
              reservation.locationId,
              reservation.batchId,
            ),
          },
          data: {
            quantityReserved: { decrement: reservation.quantity },
          },
        });
        await tx.stockReservation.update({
          where: { id: reservation.id },
          data: { status: "expired" },
        });
        await tx.inventoryMovement.create({
          data: {
            variantId: reservation.variantId,
            locationId: reservation.locationId,
            batchId: reservation.batchId,
            type: "reservation_release",
            delta: 0,
            reason: "Order reservation expired",
            referenceType: "order",
            referenceId: reservation.referenceId,
            actorUserId: actor.userId ?? null,
          },
        });
      }

      if (orderIds.size > 0) {
        await tx.order.updateMany({
          where: {
            id: { in: [...orderIds] },
            inventoryStatus: "reserved",
          },
          data: {
            inventoryStatus: "released",
            stockReleasedAt: new Date(),
          },
        });
      }

      return {
        releasedReservations: reservations.length,
        affectedOrders: orderIds.size,
      };
    });
  },
};
