import { afterEach, describe, expect, it, mock } from "bun:test";

mock.module("@env/server", () => ({
  env: {
    FILE_SERVER_URL: "https://files.example.com/api",
    FILE_SERVER_PUBLIC_URL: "https://cdn.example.com",
    FILE_SERVER_API_KEY: "sk_live_test",
  },
}));

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("admin images service", () => {
  it("normalizes Serve API and public roots without double api segments", async () => {
    const { getServeApiRoot, getServePublicRoot, toPublicServeUrl } =
      await import("../src/modules/admin/images/images.service");

    expect(getServeApiRoot("https://files.example.com")).toBe(
      "https://files.example.com/api",
    );
    expect(getServeApiRoot("https://files.example.com/api")).toBe(
      "https://files.example.com/api",
    );
    expect(getServePublicRoot("", "https://files.example.com/api")).toBe(
      "https://files.example.com",
    );
    expect(toPublicServeUrl("/api/img/img-1.jpg", "https://files.example.com")).toBe(
      "https://files.example.com/api/img/img-1.jpg",
    );
  });

  it("normalizes image URLs and prefers webp preview variants", async () => {
    const { normalizeServeImage } = await import(
      "../src/modules/admin/images/images.service"
    );

    const image = normalizeServeImage(
      {
        id: "img-1",
        filename: "hash.jpg",
        originalName: "Photo.jpg",
        contentType: "image/jpeg",
        sizeBytes: 1024,
        width: 1200,
        height: 800,
        url: "/api/img/img-1.jpg",
        variants: [
          { label: "webp", url: "/api/img/hash.webp" },
          { label: "placeholder-webp", url: "/api/img/hash.webp-placeholder" },
        ],
        createdAt: "2026-06-20T00:00:00.000Z",
        updatedAt: "2026-06-20T00:00:00.000Z",
      },
      "https://cdn.example.com",
    );

    expect(image.publicUrl).toBe("https://cdn.example.com/api/img/img-1.jpg");
    expect(image.previewUrl).toBe("https://cdn.example.com/api/img/hash.webp");
    expect(image.placeholderUrl).toBe(
      "https://cdn.example.com/api/img/hash.webp-placeholder",
    );
    expect(image.variants[0]?.publicUrl).toBe(
      "https://cdn.example.com/api/img/hash.webp",
    );
  });

  it("adds API key headers and preserves multipart content type for uploads", async () => {
    const fetchMock = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = init?.headers as Headers;
      expect(String(input)).toBe("https://files.example.com/api/upload");
      expect(headers.get("authorization")).toBe("Bearer sk_live_test");
      expect(headers.get("x-api-key")).toBe("sk_live_test");
      expect(headers.get("content-type")).toContain("multipart/form-data");
      expect(headers.get("host")).toBeNull();
      expect(headers.get("content-length")).toBeNull();

      return Response.json({
        success: true,
        image: {
          id: "img-1",
          filename: "hash.jpg",
          originalName: "Photo.jpg",
          contentType: "image/jpeg",
          sizeBytes: 1024,
          url: "/api/img/img-1.jpg",
          variants: [],
          createdAt: "2026-06-20T00:00:00.000Z",
          updatedAt: "2026-06-20T00:00:00.000Z",
        },
      });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { adminImagesService } = await import(
      "../src/modules/admin/images/images.service"
    );
    const request = new Request("http://localhost/admin/images/upload", {
      method: "POST",
      headers: {
        "content-type": "multipart/form-data; boundary=abc",
        host: "localhost",
        "content-length": "123",
      },
      body: "body",
    });

    const result = await adminImagesService.upload(request);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(200);
    expect((result.payload as any).images[0].publicUrl).toBe(
      "https://cdn.example.com/api/img/img-1.jpg",
    );
  });
});
