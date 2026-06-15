import prisma, { type Prisma } from "@db/server";
import type {
  ListOrdersQuery,
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
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    userId: row.userId,
    user: mapUser(row.user),
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    billingAddress: row.billingAddress,
    shippingAddress: row.shippingAddress,
    subtotalAmount: decimalToString(row.subtotalAmount),
    discountAmount: decimalToString(row.discountAmount),
    taxAmount: decimalToString(row.taxAmount),
    shippingAmount: decimalToString(row.shippingAmount),
    totalAmount: decimalToString(row.totalAmount),
    currency: row.currency,
    orderStatus: row.orderStatus,
    paymentStatus: row.paymentStatus,
    deliveryStatus: row.deliveryStatus,
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
};
