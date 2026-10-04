import { createServerFn } from "@tanstack/react-start";
import { client } from "@/lib/client";
import type {
  PublicStoreSettings,
  ShopShippingRate,
} from "@/features/shop/types";
export const getContactSettings = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await client.shop.settings.get();
    if (error || !data)
      throw new Error("Contact information is temporarily unavailable");
    return data as PublicStoreSettings;
  },
);
export const getDeliveryRates = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await client.shop["shipping-rates"].get({
      query: {},
    });
    if (error || !data)
      throw new Error("Delivery information is temporarily unavailable");
    return data as ShopShippingRate[];
  },
);
