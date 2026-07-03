import { categoryService } from "./services/category.service";
import { productService } from "./services/product.service";
import { orderService } from "./services/order.service";

export { ShopServiceError } from "./lib/errors";
export { categoryService } from "./services/category.service";
export { productService } from "./services/product.service";
export { orderService } from "./services/order.service";

export const shopService = {
  ...categoryService,
  ...productService,
  ...orderService,
};
