import { client } from "@/lib/client";

const api = client;

async function unwrap<T>(request: Promise<{ data?: T; error?: any }>, fallback: string) {
  const { data, error } = await request;
  if (error) {
    throw new Error(String(error.value?.message || error.message || fallback));
  }
  return data as T;
}

export const shopApi = {
  products: (query?: Record<string, unknown>) =>
    unwrap(api.shop.products.get({ query }), "Failed to load products"),
  product: (slug: string) =>
    unwrap(api.shop.products({ slug }).get(), "Failed to load product"),
  cart: () => unwrap(api.shop.cart.get(), "Failed to load cart"),
  addCartItem: (body: { variantId: string; quantity: number }) =>
    unwrap(api.shop.cart.items.post(body), "Failed to add item"),
  updateCartItem: (id: string, body: { quantity: number }) =>
    unwrap(api.shop.cart.items({ id }).patch(body), "Failed to update item"),
  removeCartItem: (id: string) =>
    unwrap(api.shop.cart.items({ id }).delete(), "Failed to remove item"),
  checkout: (body: Record<string, unknown>) =>
    unwrap(api.shop.checkout.post(body), "Failed to place order"),
};
