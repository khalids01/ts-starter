import prisma, { type Prisma } from "@db/server";
import type { CheckoutInput, OrderLookupQuery } from "../dto/order.dto";
import { checkoutVariantInclude, orderInclude } from "../lib/includes";
import {
  decimalToNumber,
  decimalToString,
  money,
  nullableTrimmed,
} from "../lib/format";
import { ShopServiceError } from "../lib/errors";
import {
  availableQuantityFromStocks,
  isVariantSellable,
} from "../lib/product-mappers";
import { mapOrder, mapShippingRate } from "../lib/order-mappers";

const RESERVATION_TTL_MINUTES = 30;

function normalizedEmail(value: string | null | undefined) {
  return nullableTrimmed(value)?.toLowerCase() ?? null;
}

function normalizedCheckoutKey(userId: string | null | undefined, idempotencyKey: string | null | undefined) {
  const normalizedUserId = nullableTrimmed(userId);
  const normalizedKey = nullableTrimmed(idempotencyKey);
  return normalizedUserId && normalizedKey ? `${normalizedUserId}:${normalizedKey}` : null;
}

function reservationExpiresAt() {
  return new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000);
}

function checkoutLineFromItem(item: any) {
  if (!isVariantSellable(item.variant)) {
    throw new ShopServiceError(
      `${item.variant?.product?.name ?? "Product"} is no longer available`,
      409,
    );
  }

  const unitPrice = decimalToNumber(item.variant.price);
  if (unitPrice <= 0) {
    throw new ShopServiceError("Product price is not available", 409);
  }

  const availableQuantity = availableQuantityFromStocks(item.variant.inventoryStocks);
  if (availableQuantity < item.quantity) {
    throw new ShopServiceError(
      `Not enough stock for ${item.variant.product.name}`,
      409,
    );
  }

  const subtotal = unitPrice * item.quantity;
  return {
    variantId: item.variantId,
    productId: item.variant.productId,
    productName: item.variant.product.name,
    variantName: item.variant.name,
    sku: item.variant.sku,
    imageUrl: item.variant.imageUrls?.[0] ?? item.variant.product.coverImageUrl ?? null,
    attributesSnapshot: item.variant.attributesSnapshot ?? null,
    quantity: item.quantity,
    unitPrice,
    subtotal,
    total: subtotal,
    currency: item.variant.currency,
  };
}

async function reserveLineStock(tx: Prisma.TransactionClient, input: {
  orderId: string;
  line: ReturnType<typeof checkoutLineFromItem>;
  expiresAt: Date;
  userId?: string;
}) {
  const stocks = await tx.inventoryStock.findMany({
    where: {
      variantId: input.line.variantId,
      location: { isActive: true },
    },
    orderBy: [{ updatedAt: "asc" }],
  });
  let remaining = input.line.quantity;
  for (const stock of stocks) {
    const available = stock.quantityOnHand - stock.quantityReserved;
    if (available <= 0) {
      continue;
    }

    const quantity = Math.min(available, remaining);
    await tx.inventoryStock.update({
      where: { id: stock.id },
      data: { quantityReserved: { increment: quantity } },
    });
    await tx.stockReservation.create({
      data: {
        variantId: stock.variantId,
        locationId: stock.locationId,
        batchId: stock.batchId,
        quantity,
        status: "active",
        expiresAt: input.expiresAt,
        referenceType: "order",
        referenceId: input.orderId,
      },
    });
    await tx.inventoryMovement.create({
      data: {
        variantId: stock.variantId,
        locationId: stock.locationId,
        batchId: stock.batchId,
        type: "sale_reserve",
        delta: 0,
        reason: "Order stock reserved",
        referenceType: "order",
        referenceId: input.orderId,
        actorUserId: input.userId ?? null,
      },
    });

    remaining -= quantity;
    if (remaining === 0) {
      break;
    }
  }

  if (remaining > 0) {
    throw new ShopServiceError(
      `Not enough stock for ${input.line.productName}`,
      409,
    );
  }
}

function normalizeAddress(input: CheckoutInput["shippingAddress"], fallback: {
  name: string;
  email: string;
  phone: string | null;
}) {
  return {
    fullName: nullableTrimmed(input.fullName) ?? fallback.name,
    email: normalizedEmail(input.email) ?? fallback.email,
    phone: nullableTrimmed(input.phone) ?? fallback.phone,
    line1: input.line1.trim(),
    line2: nullableTrimmed(input.line2),
    city: nullableTrimmed(input.city),
    state: nullableTrimmed(input.state),
    postalCode: nullableTrimmed(input.postalCode),
    country: nullableTrimmed(input.country) ?? "Bangladesh",
    notes: nullableTrimmed(input.notes),
  };
}

function shippingAmountForRate(rate: any, subtotal: number) {
  const freeOverAmount = decimalToNumber(rate.freeOverAmount);
  if (freeOverAmount > 0 && subtotal >= freeOverAmount) {
    return 0;
  }
  return decimalToNumber(rate.amount);
}

function normalizedCheckoutItems(items: CheckoutInput["items"]) {
  const quantitiesByVariantId = new Map<string, number>();
  for (const item of items ?? []) {
    const variantId = nullableTrimmed(item.variantId);
    const quantity = Number(item.quantity);
    if (!variantId || !Number.isInteger(quantity) || quantity < 1) {
      throw new ShopServiceError("Checkout items are invalid");
    }
    quantitiesByVariantId.set(
      variantId,
      (quantitiesByVariantId.get(variantId) ?? 0) + quantity,
    );
  }

  const normalized = [...quantitiesByVariantId.entries()].map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));
  if (normalized.length === 0) {
    throw new ShopServiceError("Checkout items are required");
  }
  return normalized;
}

async function checkoutLinesFromInput(items: CheckoutInput["items"]) {
  const normalizedItems = normalizedCheckoutItems(items);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: normalizedItems.map((item) => item.variantId) } },
    include: checkoutVariantInclude(),
  });
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));

  return normalizedItems.map((item) => {
    const variant = variantsById.get(item.variantId);
    if (!variant) {
      throw new ShopServiceError("Product variant is not available", 404);
    }
    return checkoutLineFromItem({ ...item, variant });
  });
}

export const orderService = {
  async listShippingRates() {
    const rates = await prisma.shippingRate.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    });
    return rates.map(mapShippingRate);
  },

  async checkout(userId: string, input: CheckoutInput) {
    const checkoutKey = normalizedCheckoutKey(userId, input.idempotencyKey);
    if (checkoutKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { checkoutKey },
      });
      if (existingOrder) {
        return {
          orderId: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          totalAmount: decimalToString(existingOrder.totalAmount) ?? "0.00",
          currency: existingOrder.currency,
          userId,
        };
      }
    }

    const lines = await checkoutLinesFromInput(input.items);
    const currencies = new Set(lines.map((line) => line.currency));
    if (currencies.size > 1) {
      throw new ShopServiceError("Checkout items contain multiple currencies");
    }

    const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
    const shippingRate = await prisma.shippingRate.findFirst({
      where: input.shippingRateId
        ? { id: input.shippingRateId, isActive: true }
        : input.shippingRateCode
          ? { code: input.shippingRateCode, isActive: true }
          : { isDefault: true, isActive: true },
      orderBy: [{ sortOrder: "asc" }],
    });
    if (!shippingRate) {
      throw new ShopServiceError("Shipping method is not available", 409);
    }
    const shippingAmount = shippingAmountForRate(shippingRate, subtotal);
    const total = subtotal + shippingAmount;
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const expiresAt = reservationExpiresAt();
    const customerName = input.customerName.trim();
    const customerEmail = input.customerEmail.trim().toLowerCase();
    const customerPhone = nullableTrimmed(input.customerPhone);
    const addressFallback = {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
    };
    const shippingAddress = normalizeAddress(input.shippingAddress, addressFallback);
    const billingAddress = normalizeAddress(
      input.billingAddress ?? input.shippingAddress,
      addressFallback,
    );

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          checkoutKey,
          userId,
          customerName,
          customerEmail,
          customerPhone,
          subtotalAmount: subtotal.toFixed(2),
          discountAmount: "0.00",
          taxAmount: "0.00",
          shippingAmount: money(shippingAmount),
          totalAmount: total.toFixed(2),
          currency: lines[0]?.currency ?? "BDT",
          paymentMethod: input.paymentMethod ?? "cash_on_delivery",
          orderStatus: "pending",
          paymentStatus: "unpaid",
          deliveryStatus: "unfulfilled",
          inventoryStatus: "reserved",
          stockReservedUntil: expiresAt,
          shippingRateId: shippingRate.id,
          shippingMethodCode: shippingRate.code,
          shippingMethodLabel: shippingRate.label,
          customerNotes: input.customerNotes?.trim() || null,
          addresses: {
            create: [
              { type: "shipping", ...shippingAddress },
              { type: "billing", ...billingAddress },
            ],
          },
          lineItems: {
            create: lines.map((line) => ({
              productId: line.productId,
              variantId: line.variantId,
              productName: line.productName,
              variantName: line.variantName,
              sku: line.sku,
              imageUrl: line.imageUrl,
              attributesSnapshot: line.attributesSnapshot,
              quantity: line.quantity,
              unitPrice: line.unitPrice.toFixed(2),
              discountAmount: "0.00",
              taxAmount: "0.00",
              subtotalAmount: line.subtotal.toFixed(2),
              totalAmount: line.total.toFixed(2),
            })),
          },
          statusEvents: {
            create: [
              {
                type: "order",
                previousValue: null,
                newValue: "pending",
                note: "Order placed from checkout",
                actorUserId: userId,
              },
            ],
          },
        },
      });

      for (const line of lines) {
        await reserveLineStock(tx, {
          orderId: created.id,
          line,
          expiresAt,
          userId,
        });
      }

      return created;
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: total.toFixed(2),
      currency: lines[0]?.currency ?? "BDT",
      userId,
    };
  },

  async listCustomerOrders(userId: string) {
    const items = await prisma.order.findMany({
      where: { userId: userId },
      include: orderInclude(),
      orderBy: [{ placedAt: "desc" }, { createdAt: "desc" }],
      take: 20,
    });

    return {
      items: items.map(mapOrder),
      total: items.length,
      pages: 1,
      page: 1,
      limit: 20,
    };
  },

  async getCustomerOrder(
    userId: string,
    orderNumber: string,
    query: OrderLookupQuery = {},
  ) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: orderInclude(),
    });
    if (!order) {
      throw new ShopServiceError("Order not found", 404);
    }

    const email = normalizedEmail(query.email);
    const phone = nullableTrimmed(query.phone);
    const canRead =
      (userId && order.userId === userId) ||
      (email && order.customerEmail.toLowerCase() === email) ||
      (phone && order.customerPhone === phone);

    if (!canRead) {
      throw new ShopServiceError("Order not found", 404);
    }

    return mapOrder(order);
  },
};
