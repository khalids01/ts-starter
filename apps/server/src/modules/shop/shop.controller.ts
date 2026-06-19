import { Elysia } from "elysia";
import { authGuard } from "@/guards/auth.guard";
import {
  AddCartItemDto,
  CheckoutDto,
  IdParamDto,
  ListShopProductsQueryDto,
  OrderNumberParamDto,
  OrderLookupQueryDto,
  SlugParamDto,
  UpdateCartItemDto,
} from "./shop.dto";
import { shopService, ShopServiceError } from "./shop.service";

const CART_COOKIE_KEY = "cart_token";
const CART_COOKIE_TTL_SECONDS = 30 * 24 * 60 * 60;

function parseCookies(cookieHeader: string | null) {
  const values = new Map<string, string>();
  if (!cookieHeader) {
    return values;
  }

  for (const chunk of cookieHeader.split(";")) {
    const [rawKey, ...rest] = chunk.split("=");
    const key = rawKey?.trim();
    if (!key || rest.length === 0) {
      continue;
    }
    values.set(key, decodeURIComponent(rest.join("=").trim()));
  }

  return values;
}

function isCrossSiteRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    return originUrl.hostname !== requestUrl.hostname;
  } catch {
    return false;
  }
}

function buildCartCookie(token: string, request: Request) {
  const isSecure = request.url.startsWith("https://");
  const sameSite = isCrossSiteRequest(request) ? "None" : "Lax";
  const parts = [
    `${CART_COOKIE_KEY}=${encodeURIComponent(token)}`,
    `Max-Age=${CART_COOKIE_TTL_SECONDS}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${sameSite}`,
  ];

  if (isSecure || sameSite === "None") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function cartActor(request: Request, userId?: string) {
  const cookies = parseCookies(request.headers.get("cookie"));
  return {
    userId,
    cartToken: cookies.get(CART_COOKIE_KEY),
  };
}

function setCartCookieIfNeeded(input: {
  request: Request;
  set: { headers: Record<string, string | number> };
  result: { context?: { cartToken: string | null; shouldSetCookie: boolean } };
}) {
  const token = input.result.context?.cartToken;
  if (token && input.result.context?.shouldSetCookie) {
    input.set.headers["set-cookie"] = buildCartCookie(token, input.request);
  }
}

function handleShopError(error: unknown, set: { status?: number | string }) {
  if (error instanceof ShopServiceError) {
    set.status = error.status;
    return { message: error.message, status: error.status };
  }

  const message = error instanceof Error ? error.message : "Shop operation failed";
  set.status = 400;
  return { message, status: 400 };
}

export const shopController = new Elysia({
  prefix: "/shop",
  detail: {
    tags: ["Shop"],
  },
})
  .use(authGuard)
  .get(
    "/shipping-rates",
    () => shopService.listShippingRates(),
    {
      detail: { summary: "List active storefront shipping rates" },
    },
  )
  .get(
    "/products",
    ({ query }) => shopService.listProducts(query),
    {
      query: ListShopProductsQueryDto,
      detail: { summary: "List storefront products" },
    },
  )
  .get(
    "/products/:slug",
    async ({ params: { slug }, set }) => {
      try {
        return await shopService.getProduct(slug);
      } catch (error) {
        return handleShopError(error, set);
      }
    },
    {
      params: SlugParamDto,
      detail: { summary: "Get storefront product" },
    },
  )
  .get(
    "/cart",
    async ({ request, userId, set }) => {
      try {
        const result = await shopService.getCart(cartActor(request, userId));
        setCartCookieIfNeeded({ request, set, result });
        return result.cart;
      } catch (error) {
        return handleShopError(error, set);
      }
    },
    {
      detail: { summary: "Get cart" },
    },
  )
  .post(
    "/cart/items",
    async ({ request, userId, body, set }) => {
      try {
        const result = await shopService.addCartItem(
          cartActor(request, userId),
          body,
        );
        setCartCookieIfNeeded({ request, set, result });
        return result.cart;
      } catch (error) {
        return handleShopError(error, set);
      }
    },
    {
      body: AddCartItemDto,
      detail: { summary: "Add cart item" },
    },
  )
  .patch(
    "/cart/items/:id",
    async ({ request, userId, params: { id }, body, set }) => {
      try {
        const result = await shopService.updateCartItem(
          cartActor(request, userId),
          id,
          body,
        );
        setCartCookieIfNeeded({ request, set, result });
        return result.cart;
      } catch (error) {
        return handleShopError(error, set);
      }
    },
    {
      params: IdParamDto,
      body: UpdateCartItemDto,
      detail: { summary: "Update cart item" },
    },
  )
  .delete(
    "/cart/items/:id",
    async ({ request, userId, params: { id }, set }) => {
      try {
        const result = await shopService.removeCartItem(
          cartActor(request, userId),
          id,
        );
        setCartCookieIfNeeded({ request, set, result });
        return result.cart;
      } catch (error) {
        return handleShopError(error, set);
      }
    },
    {
      params: IdParamDto,
      detail: { summary: "Remove cart item" },
    },
  )
  .get(
    "/orders",
    async ({ request, userId, set }) => {
      try {
        const result = await shopService.listCustomerOrders(
          cartActor(request, userId),
        );
        return result;
      } catch (error) {
        return handleShopError(error, set);
      }
    },
    {
      detail: { summary: "List current customer orders" },
    },
  )
  .get(
    "/orders/:orderNumber",
    async ({ request, userId, params: { orderNumber }, query, set }) => {
      try {
        return await shopService.getCustomerOrder(
          cartActor(request, userId),
          orderNumber,
          query,
        );
      } catch (error) {
        return handleShopError(error, set);
      }
    },
    {
      params: OrderNumberParamDto,
      query: OrderLookupQueryDto,
      detail: { summary: "Get customer order by number" },
    },
  )
  .post(
    "/checkout",
    async ({ request, userId, body, set }) => {
      try {
        const result = await shopService.checkout(cartActor(request, userId), body);
        setCartCookieIfNeeded({ request, set, result });
        return {
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          totalAmount: result.totalAmount,
          currency: result.currency,
        };
      } catch (error) {
        return handleShopError(error, set);
      }
    },
    {
      body: CheckoutDto,
      detail: { summary: "Create order from cart" },
    },
  );
