import prisma from "@db/server";
import type { ListCustomersQuery, UpdateCustomerInput } from "./customers.dto";
import { normalizeCustomerEmail } from "@/modules/ecommerce/customers/customer-identity.service";

export class AdminCustomersServiceError extends Error {
  constructor(message: string, public readonly status = 400) { super(message); }
}

const qualifyingPayments = ["paid", "partially_refunded", "refunded"] as const;

function iso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

export function orderSpend(order: any) {
  if (order.orderStatus !== "completed" || !qualifyingPayments.includes(order.paymentStatus)) return 0;
  const refunded = (order.refunds ?? []).reduce((sum: number, refund: any) => sum + Number(refund.amount), 0);
  return Math.max(0, Number(order.totalAmount) - refunded);
}

export function completedSpendByCurrency(orders: any[]) {
  const totals = new Map<string, number>();
  for (const order of orders) {
    const amount = orderSpend(order);
    if (amount <= 0) continue;
    totals.set(order.currency, (totals.get(order.currency) ?? 0) + amount);
  }
  return [...totals.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([currency, amount]) => ({ currency, amount: amount.toFixed(2) }));
}

function summary(customer: any) {
  const completedSpend = completedSpendByCurrency(customer.orders ?? []);
  const singleCurrencySpend = completedSpend.length === 1 ? completedSpend[0] : null;
  return {
    id: customer.id,
    userId: customer.userId,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    adminNote: customer.adminNote,
    orderCount: customer._count?.orders ?? customer.orders?.length ?? 0,
    completedSpend,
    totalCompletedSpend: singleCurrencySpend?.amount ?? null,
    completedSpendCurrency: singleCurrencySpend?.currency ?? null,
    createdAt: iso(customer.createdAt),
    updatedAt: iso(customer.updatedAt),
  };
}

const spendOrders = {
  where: { orderStatus: "completed" as const, paymentStatus: { in: [...qualifyingPayments] } },
  select: { orderStatus: true, paymentStatus: true, totalAmount: true, currency: true, refunds: { select: { amount: true } } },
};

export const adminCustomersService = {
  async list(query: ListCustomersQuery = {}) {
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
    const requestedPage = Math.max(query.page ?? 1, 1);
    const search = query.search?.trim();
    const where = search ? { OR: [
      { name: { contains: search, mode: "insensitive" as const } },
      { email: { contains: search, mode: "insensitive" as const } },
      { normalizedEmail: { contains: search.toLowerCase() } },
      { phone: { contains: search, mode: "insensitive" as const } },
    ] } : {};
    const total = await prisma.ecommerceCustomer.count({ where });
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const rows = await prisma.ecommerceCustomer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { orders: true } }, orders: spendOrders },
    });
    return { items: rows.map(summary), total, pages, page, limit };
  },

  async detail(id: string) {
    const row = await prisma.ecommerceCustomer.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        _count: { select: { orders: true } },
        orders: {
          orderBy: { placedAt: "desc" },
          include: { refunds: { select: { amount: true } }, addresses: { orderBy: { updatedAt: "desc" } } },
        },
      },
    });
    if (!row) throw new AdminCustomersServiceError("Customer not found", 404);
    const base = summary(row);
    const latestAddresses = new Map<string, any>();
    for (const order of row.orders) {
      for (const address of order.addresses) {
        if (!latestAddresses.has(address.type)) latestAddresses.set(address.type, address);
      }
    }
    return {
      ...base,
      user: row.user,
      latestAddresses: [...latestAddresses.values()].map((address) => ({ ...address, createdAt: iso(address.createdAt), updatedAt: iso(address.updatedAt) })),
      orders: row.orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: String(order.totalAmount),
        currency: order.currency,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus,
        placedAt: iso(order.placedAt),
      })),
    };
  },

  async update(id: string, input: UpdateCustomerInput) {
    const existing = await prisma.ecommerceCustomer.findUnique({ where: { id } });
    if (!existing) throw new AdminCustomersServiceError("Customer not found", 404);
    const email = input.email?.trim();
    try {
      await prisma.ecommerceCustomer.update({
        where: { id },
        data: {
          ...(input.name === undefined ? {} : { name: input.name.trim() }),
          ...(email === undefined ? {} : { email, normalizedEmail: normalizeCustomerEmail(email) }),
          ...(input.phone === undefined ? {} : { phone: input.phone?.trim() || null }),
          ...(input.adminNote === undefined ? {} : { adminNote: input.adminNote?.trim() || null }),
        },
      });
    } catch (error: any) {
      if (error?.code === "P2002") throw new AdminCustomersServiceError("A customer with this email already exists", 409);
      throw error;
    }
    return this.detail(id);
  },
};
