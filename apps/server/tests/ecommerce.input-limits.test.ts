import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { CheckoutDto } from "../src/modules/shop/dto/order.dto";
import {
  CreateProductDto,
  ReplaceProductHighlightsDto,
  ReplaceProductVariantsDto,
} from "../src/modules/admin/products/products.dto";
import { CreateCategoryDto } from "../src/modules/admin/catalog/catalog.dto";

async function validate(schema: unknown, body: unknown) {
  const app = new Elysia().post("/", () => ({ ok: true }), { body: schema as never });
  return app.handle(new Request("http://localhost/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }));
}

const checkout = {
  items: [{ variantId: "variant-1", quantity: 1 }],
  customerName: "Nusrat Jahan",
  customerEmail: "user@northstar.example.test",
  shippingAddress: { line1: "1 Test Road" },
  idempotencyKey: "checkout-safe-1",
};

describe("ecommerce request limits", () => {
  it("accepts a bounded checkout and rejects excessive item arrays", async () => {
    expect((await validate(CheckoutDto, checkout)).status).toBe(200);
    expect((await validate(CheckoutDto, {
      ...checkout,
      items: Array.from({ length: 101 }, (_, index) => ({ variantId: `v-${index}`, quantity: 1 })),
    })).status).toBe(422);
  });

  it("rejects overlong public strings and excessive quantities", async () => {
    expect((await validate(CheckoutDto, { ...checkout, customerName: "x".repeat(121) })).status).toBe(422);
    expect((await validate(CheckoutDto, { ...checkout, items: [{ variantId: "v-1", quantity: 10_001 }] })).status).toBe(422);
    expect((await validate(CheckoutDto, { ...checkout, idempotencyKey: "short" })).status).toBe(422);
  });

  it("caps product variants, highlights, and media arrays", async () => {
    const variants = Array.from({ length: 101 }, (_, index) => ({ name: `Variant ${index}`, price: "10.00" }));
    expect((await validate(ReplaceProductVariantsDto, { variants })).status).toBe(422);

    const highlights = Array.from({ length: 21 }, (_, index) => ({ title: `Highlight ${index}` }));
    expect((await validate(ReplaceProductHighlightsDto, { highlights })).status).toBe(422);

    expect((await validate(ReplaceProductVariantsDto, {
      variants: [{ price: "10.00", imageUrls: Array.from({ length: 21 }, () => "https://example.test/image.jpg") }],
    })).status).toBe(422);
  });

  it("rejects dangerous protocols in externally rendered URLs", async () => {
    expect((await validate(CreateProductDto, {
      categoryId: "category-1",
      name: "Unsafe image",
      coverImageUrl: "javascript:alert(1)",
    })).status).toBe(422);
    expect((await validate(CreateCategoryDto, {
      name: "Unsafe category",
      imageUrl: "data:text/html,<script>alert(1)</script>",
    })).status).toBe(422);
    expect((await validate(CreateProductDto, {
      categoryId: "category-1",
      name: "Safe image",
      coverImageUrl: "https://cdn.example.test/image.webp",
    })).status).toBe(200);
  });
});
