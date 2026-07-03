import { Elysia } from "elysia";
import { authGuard } from "@/guards/auth.guard";
import {
  ListShopFiltersQueryDto,
  ListShopProductsQueryDto,
  SlugParamDto,
} from "./dto/product.dto";
import {
  CheckoutDto,
  OrderLookupQueryDto,
  OrderNumberParamDto,
} from "./dto/order.dto";
import { ShopServiceError } from "./lib/errors";
import { categoryService } from "./services/category.service";
import { productService } from "./services/product.service";
import { orderService } from "./services/order.service";

function handleShopError(error: unknown, set: { status?: number | string }) {
  if (error instanceof ShopServiceError) {
    set.status = error.status;
    return { message: error.message, status: error.status };
  }

  const message = error instanceof Error ? error.message : "Shop operation failed";
  set.status = 400;
  return { message, status: 400 };
}

function requireUserId(userId: string | undefined) {
  if (!userId) {
    throw new ShopServiceError("Authentication required", 401);
  }
  return userId;
}

export const shopController = new Elysia({
  prefix: "/shop",
  detail: {
    tags: ["Shop"],
  },
})
  .use(authGuard)
  .get(
    "/categories",
    () => categoryService.listCategories(),
    {
      detail: { summary: "List active storefront categories" },
    },
  )
  .get(
    "/shipping-rates",
    () => orderService.listShippingRates(),
    {
      detail: { summary: "List active storefront shipping rates" },
    },
  )
  .get(
    "/filters",
    ({ query }) => productService.listFilters(query),
    {
      query: ListShopFiltersQueryDto,
      detail: { summary: "List public storefront filters" },
    },
  )
  .get(
    "/products",
    ({ query }) => productService.listProducts(query),
    {
      query: ListShopProductsQueryDto,
      detail: { summary: "List storefront products" },
    },
  )
  .get(
    "/products/:slug",
    async ({ params: { slug }, set }) => {
      try {
        return await productService.getProduct(slug);
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
    "/orders",
    async ({ userId, set }) => {
      try {
        const result = await orderService.listCustomerOrders(requireUserId(userId));
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
    async ({ userId, params: { orderNumber }, query, set }) => {
      try {
        return await orderService.getCustomerOrder(
          requireUserId(userId),
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
    async ({ userId, body, set }) => {
      try {
        const result = await orderService.checkout(requireUserId(userId), body);
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
      detail: { summary: "Create order from checkout items" },
    },
  );
