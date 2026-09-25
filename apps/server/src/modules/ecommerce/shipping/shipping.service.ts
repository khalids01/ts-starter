import prisma, { type Prisma } from "@db/server";
import { activityService } from "@/modules/admin/activity/activity.service";
import type {
  CreateShippingRateInput,
  ListShippingRatesQuery,
  UpdateShippingRateInput,
} from "./shipping.dto";

export class ShippingServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
    public readonly code?: string,
    public readonly dependencies?: Array<{ type: string; count: number; action: string }>,
  ) {
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
    archivedAt: row.archivedAt ? (row.archivedAt instanceof Date ? row.archivedAt.toISOString() : row.archivedAt) : null,
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
        archivedAt: query.archived ? { not: null } : null,
      },
      orderBy: [{ currency: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
    });
    return rates.map(mapRate);
  },

  async createRate(input: CreateShippingRateInput, actorUserId?: string) {
    const currency = normalizeCurrency(input.currency);
    const isActive = input.isActive ?? true;

    const rate = await prisma.$transaction(async (tx) => {
      const currentDefault = await tx.shippingRate.findFirst({
        where: { currency, isActive: true, isDefault: true },
        select: { id: true },
      });
      const isDefault = isActive && (input.isDefault === true || !currentDefault);
      if (input.isDefault && !isActive) {
        throw new ShippingServiceError("An inactive shipping rate cannot be the default");
      }
      if (isDefault) await clearDefault(tx, currency);

      return tx.shippingRate.create({
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
    });
    await activityService.record({ type: "shipping.rate.created", actorUserId, message: `Created shipping method ${rate.label}`, metadata: { shippingRateId: rate.id } });
    return mapRate(rate);
  },

  async updateRate(id: string, input: UpdateShippingRateInput, actorUserId?: string) {
    const rate = await prisma.$transaction(async (tx) => {
      const existing = await tx.shippingRate.findUnique({ where: { id } });
      if (!existing) throw new ShippingServiceError("Shipping rate not found", 404);
      if (existing.archivedAt) throw new ShippingServiceError("Archived shipping methods cannot be edited", 409, "RESOURCE_ARCHIVED");

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

      return tx.shippingRate.update({
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
    });
    await activityService.record({ type: "shipping.rate.updated", actorUserId, message: `Updated shipping method ${rate.label}`, metadata: { shippingRateId: rate.id } });
    return mapRate(rate);
  },

  async archiveRate(id: string, actorUserId?: string) {
    const existing = await prisma.shippingRate.findUnique({ where: { id } });
    if (!existing) throw new ShippingServiceError("Shipping method not found", 404);
    if (existing.archivedAt) throw new ShippingServiceError("Shipping method is already archived", 409);
    const mappings = await prisma.courierServiceMethod.count({ where: { shippingRateId: id, service: { archivedAt: null } } });
    const dependencies = [
      ...(existing.isDefault ? [{ type: "default_shipping_method", count: 1, action: "Choose another active default shipping method first" }] : []),
      ...(mappings ? [{ type: "delivery_options", count: mappings, action: "Remove this shipping method from current delivery options first" }] : []),
    ];
    if (dependencies.length) {
      await activityService.record({ type: "shipping.rate.archive_blocked", actorUserId, severity: "warning", message: `Blocked archive of shipping method ${existing.label}`, metadata: { shippingRateId: id, dependencies } });
      throw new ShippingServiceError("Cannot archive shipping method because it is still in use", 409, "RESOURCE_IN_USE", dependencies);
    }
    const row = await prisma.shippingRate.update({ where: { id }, data: { archivedAt: new Date(), isActive: false, isDefault: false } });
    await activityService.record({ type: "shipping.rate.archived", actorUserId, message: `Archived shipping method ${row.label}`, metadata: { shippingRateId: id } });
    return mapRate(row);
  },

  async restoreRate(id: string, actorUserId?: string) {
    const existing = await prisma.shippingRate.findUnique({ where: { id } });
    if (!existing) throw new ShippingServiceError("Shipping method not found", 404);
    if (!existing.archivedAt) throw new ShippingServiceError("Shipping method is not archived", 409);
    const row = await prisma.shippingRate.update({ where: { id }, data: { archivedAt: null, isActive: false, isDefault: false } });
    await activityService.record({ type: "shipping.rate.restored", actorUserId, message: `Restored shipping method ${row.label}`, metadata: { shippingRateId: id } });
    return mapRate(row);
  },

  async deleteRate(id: string, actorUserId?: string) {
    const existing = await prisma.shippingRate.findUnique({ where: { id } });
    if (!existing) throw new ShippingServiceError("Shipping method not found", 404);
    if (!existing.archivedAt) throw new ShippingServiceError("Archive the shipping method before deleting it permanently", 409, "ARCHIVE_REQUIRED");
    const [orders, mappings] = await Promise.all([
      prisma.order.count({ where: { shippingRateId: id } }),
      prisma.courierServiceMethod.count({ where: { shippingRateId: id } }),
    ]);
    const dependencies = [
      { type: "orders", count: orders, action: "Historical orders must retain their shipping method" },
      { type: "delivery_options", count: mappings, action: "Remove this shipping method from delivery options first" },
    ].filter((item) => item.count > 0);
    if (dependencies.length) {
      await activityService.record({ type: "shipping.rate.delete_blocked", actorUserId, severity: "warning", message: `Blocked permanent deletion of shipping method ${existing.label}`, metadata: { shippingRateId: id, dependencies } });
      throw new ShippingServiceError("Cannot delete shipping method because it is still in use", 409, "RESOURCE_IN_USE", dependencies);
    }
    await prisma.shippingRate.delete({ where: { id } });
    await activityService.record({ type: "shipping.rate.deleted", actorUserId, message: `Permanently deleted shipping method ${existing.label}`, metadata: { shippingRateId: id } });
    return { message: "Shipping method permanently deleted" };
  },
};
