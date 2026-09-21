import prisma from "@db/server";
import type { UpdateStoreSettingsInput } from "./store-settings.dto";

export const STORE_SETTINGS_ID = "default";

export const DEFAULT_STORE_SETTINGS = {
  id: STORE_SETTINGS_ID,
  storeName: "Store",
  supportEmail: null,
  supportPhone: null,
  defaultCurrency: "BDT",
  orderNumberPrefix: "ORD",
  reservationDurationMinutes: 30,
  checkoutEnabled: true,
  checkoutNotice: null,
} as const;

export class StoreSettingsServiceError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
  }
}

type StoreSettings = Omit<typeof DEFAULT_STORE_SETTINGS, "storeName" | "supportEmail" | "supportPhone" | "defaultCurrency" | "orderNumberPrefix" | "reservationDurationMinutes" | "checkoutEnabled" | "checkoutNotice"> & {
  storeName: string;
  supportEmail: string | null;
  supportPhone: string | null;
  defaultCurrency: string;
  orderNumberPrefix: string;
  reservationDurationMinutes: number;
  checkoutEnabled: boolean;
  checkoutNotice: string | null;
};

let cachedSettings: StoreSettings | null = null;

function nullableText(value: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function validateStoreSettings(input: UpdateStoreSettingsInput): StoreSettings {
  const storeName = input.storeName.trim();
  const defaultCurrency = input.defaultCurrency.trim().toUpperCase();
  const orderNumberPrefix = input.orderNumberPrefix.trim().toUpperCase();
  if (!storeName) throw new StoreSettingsServiceError("Store name is required");
  if (!/^[A-Z]{3}$/.test(defaultCurrency)) {
    throw new StoreSettingsServiceError("Currency must be a three-letter ISO code");
  }
  if (!/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(orderNumberPrefix)) {
    throw new StoreSettingsServiceError("Order prefix may contain uppercase letters, numbers, and single hyphens");
  }
  if (!Number.isInteger(input.reservationDurationMinutes) || input.reservationDurationMinutes < 1 || input.reservationDurationMinutes > 1440) {
    throw new StoreSettingsServiceError("Reservation duration must be between 1 and 1440 minutes");
  }
  return {
    id: STORE_SETTINGS_ID,
    storeName,
    supportEmail: nullableText(input.supportEmail),
    supportPhone: nullableText(input.supportPhone),
    defaultCurrency,
    orderNumberPrefix,
    reservationDurationMinutes: input.reservationDurationMinutes,
    checkoutEnabled: input.checkoutEnabled,
    checkoutNotice: nullableText(input.checkoutNotice),
  };
}

function mapSettings(row: any): StoreSettings {
  return {
    id: STORE_SETTINGS_ID,
    storeName: row.storeName,
    supportEmail: row.supportEmail,
    supportPhone: row.supportPhone,
    defaultCurrency: row.defaultCurrency,
    orderNumberPrefix: row.orderNumberPrefix,
    reservationDurationMinutes: row.reservationDurationMinutes,
    checkoutEnabled: row.checkoutEnabled,
    checkoutNotice: row.checkoutNotice,
  };
}

export const storeSettingsService = {
  async get() {
    if (cachedSettings) return cachedSettings;
    const row = await prisma.storeSettings.findUnique({ where: { id: STORE_SETTINGS_ID } });
    cachedSettings = row ? mapSettings(row) : { ...DEFAULT_STORE_SETTINGS };
    return cachedSettings;
  },

  async update(input: UpdateStoreSettingsInput) {
    const settings = validateStoreSettings(input);
    const row = await prisma.storeSettings.upsert({
      where: { id: STORE_SETTINGS_ID },
      create: settings,
      update: settings,
    });
    cachedSettings = mapSettings(row);
    return cachedSettings;
  },

  publicSettings(settings: StoreSettings) {
    return {
      storeName: settings.storeName,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      defaultCurrency: settings.defaultCurrency,
      checkoutEnabled: settings.checkoutEnabled,
      checkoutNotice: settings.checkoutNotice,
    };
  },

  clearCache() {
    cachedSettings = null;
  },
};
