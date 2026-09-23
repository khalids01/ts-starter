import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const findUniqueMock = mock(async (): Promise<any> => null);
const upsertMock = mock(async (args: any) => args.create);

mock.module("@db/server", () => ({
  default: {
    storeSettings: {
      findUnique: findUniqueMock,
      upsert: upsertMock,
    },
  },
}));

const input = {
  storeName: "Northstar",
  supportEmail: null,
  supportPhone: null,
  defaultCurrency: "BDT",
  orderNumberPrefix: "WEB",
  reservationDurationMinutes: 30,
  checkoutEnabled: true,
  checkoutNotice: null,
};

beforeEach(async () => {
  findUniqueMock.mockResolvedValue(null);
  upsertMock.mockImplementation(async (args: any) => args.create);
  const { storeSettingsService } = await import("../src/modules/ecommerce/store-settings/store-settings.service");
  storeSettingsService.clearCache();
});

afterEach(() => {
  findUniqueMock.mockClear();
  upsertMock.mockClear();
});

describe("store settings service", () => {
  it("returns safe defaults and caches the result", async () => {
    const { DEFAULT_STORE_SETTINGS, storeSettingsService } = await import("../src/modules/ecommerce/store-settings/store-settings.service");
    expect(await storeSettingsService.get()).toEqual(DEFAULT_STORE_SETTINGS);
    expect(await storeSettingsService.get()).toEqual(DEFAULT_STORE_SETTINGS);
    expect(findUniqueMock).toHaveBeenCalledTimes(1);
  });

  it("maps persisted settings and exposes only the public subset", async () => {
    findUniqueMock.mockResolvedValueOnce({ id: "default", ...input, checkoutEnabled: false });
    const { storeSettingsService } = await import("../src/modules/ecommerce/store-settings/store-settings.service");
    const settings = await storeSettingsService.get();
    expect(storeSettingsService.publicSettings(settings)).toEqual({
      storeName: "Northstar",
      supportEmail: null,
      supportPhone: null,
      defaultCurrency: "BDT",
      checkoutEnabled: false,
      checkoutNotice: null,
    });
  });

  it("upserts normalized settings and refreshes the cache", async () => {
    const { storeSettingsService } = await import("../src/modules/ecommerce/store-settings/store-settings.service");
    const result = await storeSettingsService.update({
      ...input,
      storeName: "  Northstar  ",
      supportEmail: " support@example.test ",
      checkoutNotice: "  Welcome  ",
    });
    expect(upsertMock).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "default" },
      create: expect.objectContaining({ storeName: "Northstar", supportEmail: "support@example.test", checkoutNotice: "Welcome" }),
      update: expect.objectContaining({ storeName: "Northstar" }),
    }));
    expect(await storeSettingsService.get()).toEqual(result);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });
});
