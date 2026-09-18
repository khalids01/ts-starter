import prisma, { type Prisma } from "@db/server";
import type {
  CreateShippingRateInput,
  ListShippingRatesQuery,
  UpdateShippingRateInput,
} from "./shipping.dto";

export class ShippingServiceError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
  }
}

function normalizeCurrency(currency: string) {
  return currency.trim().toUpperCase();
}

function normalizeCode(code: string) {
  const normalized = code.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!normalized) throw new ShippingServiceError("Code cannot be empty");
  return normalized;
}

function money(value: string | number, field: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ShippingServiceError(`${field} must be zero or greater`);
  }
  return parsed.toFixed(2);
}

function nullableMoney(value: string | number | null | undefined, field: string) {
  return value === null || value === undefined || value === "" ? null : money(value, field);
}

function decimal(value: { toString(): string } | string | number | null | undefined) {
  return value === null || value === undefined ? null : value.toString();
}

function mapRate(row: any) {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    amount: decimal(row.amount),
    currency: row.currency,
    freeOverAmount: decimal(row.freeOverAmount),
    isDefault: row.isDefault,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
  };
}

async function clearDefault(tx: Prisma.TransactionClient, currency: string, exceptId?: string) {
  await tx.shippingRate.updateMany({
    where: {
      currency,
      isDefault: true,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    data: { isDefault: false },
  });
}

export const shippingService = {
  async listRates(query: ListShippingRatesQuery = {}) {
    const rates = await prisma.shippingRate.findMany({
      where: {
        ...(query.currency ? { currency: normalizeCurrency(query.currency) } : {}),
        ...(query.active === undefined ? {} : { isActive: query.active }),
      },
      orderBy: [{ currency: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
    });
    return rates.map(mapRate);
  },

  async createRate(input: CreateShippingRateInput) {
    const currency = normalizeCurrency(input.currency);
    const isActive = input.isActive ?? true;

    return prisma.$transaction(async (tx) => {
      const currentDefault = await tx.shippingRate.findFirst({
        where: { currency, isActive: true, isDefault: true },
        select: { id: true },
      });
      const isDefault = isActive && (input.isDefault === true || !currentDefault);
      if (input.isDefault && !isActive) {
        throw new ShippingServiceError("An inactive shipping rate cannot be the default");
      }
      if (isDefault) await clearDefault(tx, currency);

      const rate = await tx.shippingRate.create({
        data: {
          code: normalizeCode(input.code),
          label: input.label.trim(),
          amount: money(input.amount, "Amount"),
          currency,
          freeOverAmount: nullableMoney(input.freeOverAmount, "Free shipping threshold"),
          isDefault,
          isActive,
          sortOrder: input.sortOrder ?? 0,
        },
      });
      return mapRate(rate);
    });
  },

  async updateRate(id: string, input: UpdateShippingRateInput) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.shippingRate.findUnique({ where: { id } });
      if (!existing) throw new ShippingServiceError("Shipping rate not found", 404);

      const currency = input.currency ? normalizeCurrency(input.currency) : existing.currency;
      const isActive = input.isActive ?? existing.isActive;
      const requestedDefault = input.isDefault ?? existing.isDefault;
      if (existing.isDefault && (!isActive || !requestedDefault || currency !== existing.currency)) {
        throw new ShippingServiceError("Choose another active default before changing this default rate", 409);
      }
      if (requestedDefault && !isActive) {
        throw new ShippingServiceError("An inactive shipping rate cannot be the default");
      }
      const otherDefault = await tx.shippingRate.findFirst({
        where: { id: { not: id }, currency, isActive: true, isDefault: true },
        select: { id: true },
      });
      const isDefault = isActive && (requestedDefault || !otherDefault);
      if (isDefault) await clearDefault(tx, currency, id);

      const rate = await tx.shippingRate.update({
        where: { id },
        data: {
          ...(input.code === undefined ? {} : { code: normalizeCode(input.code) }),
          ...(input.label === undefined ? {} : { label: input.label.trim() }),
          ...(input.amount === undefined ? {} : { amount: money(input.amount, "Amount") }),
          ...(input.currency === undefined ? {} : { currency }),
          ...(input.freeOverAmount === undefined ? {} : {
            freeOverAmount: nullableMoney(input.freeOverAmount, "Free shipping threshold"),
          }),
          ...((input.isDefault === undefined && isDefault === existing.isDefault) ? {} : { isDefault }),
          ...(input.isActive === undefined ? {} : { isActive }),
          ...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder }),
        },
      });
      return mapRate(rate);
    });
  },

  async disableRate(id: string) {
    return this.updateRate(id, { isActive: false });
  },
};
