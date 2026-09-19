import prisma, { type Prisma } from "@db/server";
import type {
  CreateDiscountInput,
  ListDiscountsQuery,
  UpdateDiscountInput,
} from "./discounts.dto";

export class DiscountServiceError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
  }
}

type DiscountClient = Pick<
  Prisma.TransactionClient,
  "discountCode" | "discountRedemption"
>;

function normalizeCode(code: string) {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
  if (!normalized || !/^[A-Z0-9_-]+$/.test(normalized)) {
    throw new DiscountServiceError(
      "Code can contain only letters, numbers, hyphens, and underscores",
    );
  }
  return normalized;
}

function nullableTrimmed(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function normalizeCurrency(value: string | null | undefined) {
  return nullableTrimmed(value)?.toUpperCase() ?? null;
}

function parseDate(value: string | null | undefined, field: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new DiscountServiceError(`${field} must be a valid date`);
  }
  return date;
}

function decimalString(value: string | number, field: string, allowZero = false) {
  const normalized = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new DiscountServiceError(`${field} must have at most two decimal places`);
  }
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || (allowZero ? amount < 0 : amount <= 0)) {
    throw new DiscountServiceError(`${field} must be ${allowZero ? "zero or greater" : "greater than zero"}`);
  }
  return amount.toFixed(2);
}

function nullableDecimal(value: string | number | null | undefined, field: string) {
  return value === null || value === undefined || value === ""
    ? null
    : decimalString(value, field, true);
}

function cents(value: unknown) {
  const normalized = Number(String(value));
  if (!Number.isFinite(normalized) || normalized < 0) {
    throw new DiscountServiceError("Money value is invalid");
  }
  return Math.round(normalized * 100);
}

function mapDiscount(row: any) {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    type: row.type,
    value: String(row.value),
    currency: row.currency,
    isActive: row.isActive,
    startsAt: row.startsAt?.toISOString?.() ?? row.startsAt,
    endsAt: row.endsAt?.toISOString?.() ?? row.endsAt,
    minimumOrderAmount:
      row.minimumOrderAmount === null ? null : String(row.minimumOrderAmount),
    totalUsageLimit: row.totalUsageLimit,
    perCustomerUsageLimit: row.perCustomerUsageLimit,
    usageCount: row.usageCount,
    createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt,
  };
}

function normalizedInput(input: CreateDiscountInput | UpdateDiscountInput) {
  const type = input.type;
  const currency = normalizeCurrency(input.currency);
  if (type === "fixed_amount" && !currency) {
    throw new DiscountServiceError("Currency is required for fixed discounts");
  }
  if (type === "percentage" && input.value !== undefined && Number(input.value) > 100) {
    throw new DiscountServiceError("Percentage discount cannot exceed 100");
  }
  const startsAt = parseDate(input.startsAt, "Start date");
  const endsAt = parseDate(input.endsAt, "End date");
  if (startsAt && endsAt && endsAt <= startsAt) {
    throw new DiscountServiceError("End date must be after the start date");
  }
  return {
    ...(input.code === undefined ? {} : { code: normalizeCode(input.code) }),
    ...(input.description === undefined
      ? {}
      : { description: nullableTrimmed(input.description) }),
    ...(type === undefined ? {} : { type }),
    ...(input.value === undefined
      ? {}
      : { value: decimalString(input.value, "Discount value") }),
    ...(input.currency === undefined
      ? {}
      : { currency: type === "percentage" ? null : currency }),
    ...(input.isActive === undefined ? {} : { isActive: input.isActive }),
    ...(input.startsAt === undefined ? {} : { startsAt }),
    ...(input.endsAt === undefined ? {} : { endsAt }),
    ...(input.minimumOrderAmount === undefined
      ? {}
      : {
          minimumOrderAmount: nullableDecimal(
            input.minimumOrderAmount,
            "Minimum order amount",
          ),
        }),
    ...(input.totalUsageLimit === undefined
      ? {}
      : { totalUsageLimit: input.totalUsageLimit }),
    ...(input.perCustomerUsageLimit === undefined
      ? {}
      : { perCustomerUsageLimit: input.perCustomerUsageLimit }),
  };
}

export async function evaluateDiscount(
  client: DiscountClient,
  input: {
    code: string;
    subtotalAmount: string | number;
    currency: string;
    customerKey?: string;
    now?: Date;
  },
) {
  const code = normalizeCode(input.code);
  const discount = await client.discountCode.findUnique({ where: { code } });
  if (!discount || !discount.isActive) {
    throw new DiscountServiceError("Discount code is not available", 404);
  }
  const now = input.now ?? new Date();
  if (discount.startsAt && discount.startsAt > now) {
    throw new DiscountServiceError("Discount code is not active yet", 409);
  }
  if (discount.endsAt && discount.endsAt < now) {
    throw new DiscountServiceError("Discount code has expired", 409);
  }
  if (
    discount.totalUsageLimit !== null &&
    discount.usageCount >= discount.totalUsageLimit
  ) {
    throw new DiscountServiceError("Discount code usage limit has been reached", 409);
  }

  const subtotalCents = cents(input.subtotalAmount);
  if (
    discount.minimumOrderAmount !== null &&
    subtotalCents < cents(discount.minimumOrderAmount)
  ) {
    throw new DiscountServiceError(
      `Order subtotal must be at least ${discount.minimumOrderAmount} ${input.currency.toUpperCase()}`,
      409,
    );
  }
  if (
    discount.type === "fixed_amount" &&
    discount.currency !== input.currency.trim().toUpperCase()
  ) {
    throw new DiscountServiceError("Discount currency does not match the order", 409);
  }
  if (discount.perCustomerUsageLimit !== null && input.customerKey) {
    const used = await client.discountRedemption.count({
      where: { discountCodeId: discount.id, customerKey: input.customerKey },
    });
    if (used >= discount.perCustomerUsageLimit) {
      throw new DiscountServiceError(
        "You have already used this discount the maximum number of times",
        409,
      );
    }
  }

  const discountCents =
    discount.type === "percentage"
      ? Math.floor((subtotalCents * Math.round(Number(discount.value) * 100)) / 10_000)
      : Math.min(subtotalCents, cents(discount.value));

  return {
    discount,
    amount: (discountCents / 100).toFixed(2),
    subtotalAfterDiscount: ((subtotalCents - discountCents) / 100).toFixed(2),
  };
}

export const discountService = {
  async list(query: ListDiscountsQuery = {}) {
    const rows = await prisma.discountCode.findMany({
      where: {
        ...(query.active === undefined ? {} : { isActive: query.active }),
        ...(query.search?.trim()
          ? {
              OR: [
                { code: { contains: query.search.trim(), mode: "insensitive" as const } },
                { description: { contains: query.search.trim(), mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }],
    });
    return rows.map(mapDiscount);
  },

  async create(input: CreateDiscountInput) {
    const row = await prisma.discountCode.create({ data: normalizedInput(input) as any });
    return mapDiscount(row);
  },

  async update(id: string, input: UpdateDiscountInput) {
    const existing = await prisma.discountCode.findUnique({ where: { id } });
    if (!existing) throw new DiscountServiceError("Discount code not found", 404);
    const merged = { ...existing, ...input } as CreateDiscountInput;
    const validated = normalizedInput(merged);
    const row = await prisma.discountCode.update({
      where: { id },
      data: normalizedInput(input) as any,
    });
    void validated;
    return mapDiscount(row);
  },

  async disable(id: string) {
    return this.update(id, { isActive: false });
  },

  async validate(input: {
    code: string;
    subtotalAmount: string | number;
    currency: string;
    customerKey?: string;
  }) {
    const result = await evaluateDiscount(prisma, input);
    return {
      code: result.discount.code,
      description: result.discount.description,
      type: result.discount.type,
      value: String(result.discount.value),
      amount: result.amount,
      subtotalAfterDiscount: result.subtotalAfterDiscount,
      currency: input.currency.toUpperCase(),
    };
  },
};
