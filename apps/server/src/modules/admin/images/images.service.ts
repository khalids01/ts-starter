import { env } from "@env/server";
import type { ListImagesQuery } from "./images.dto";

export type AdminImageVariant = {
  id?: string;
  label?: string;
  filename?: string;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number;
  url?: string;
  publicUrl?: string;
};

export type AdminImage = {
  id: string;
  filename: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  hash?: string;
  url?: string;
  publicUrl: string;
  previewUrl: string;
  placeholderUrl?: string | null;
  tags?: unknown;
  applicationId?: string;
  applicationName?: string;
  linkedApplications?: Array<{ id: string; name: string; slug: string }>;
  variants: AdminImageVariant[];
  createdAt: string;
  updatedAt: string;
};

export type AdminImagesListResponse = {
  images: AdminImage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type AdminImagesUploadResponse = {
  success: boolean;
  images: AdminImage[];
  errors?: string[];
};

export class AdminImagesServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type ServeImage = Record<string, any> & {
  id?: string;
  filename?: string;
  originalName?: string;
  contentType?: string;
  sizeBytes?: number;
  width?: number | null;
  height?: number | null;
  url?: string;
  variants?: Array<Record<string, any>>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function stripTrailingApi(value: string) {
  return value.replace(/\/api\/?$/, "");
}

export function getServeApiRoot(baseUrl: string) {
  const clean = trimTrailingSlash(baseUrl);
  return clean.endsWith("/api") ? clean : `${clean}/api`;
}

export function getServePublicRoot(publicUrl: string, fallbackUrl: string) {
  return stripTrailingApi(trimTrailingSlash(publicUrl || fallbackUrl));
}

function requiredConfig() {
  if (!env.FILE_SERVER_URL || !env.FILE_SERVER_API_KEY) {
    throw new AdminImagesServiceError(
      "File server is not configured. Set FILE_SERVER_URL and FILE_SERVER_API_KEY.",
      500,
    );
  }

  return {
    apiRoot: getServeApiRoot(env.FILE_SERVER_URL),
    publicRoot: getServePublicRoot(
      env.FILE_SERVER_PUBLIC_URL ?? env.FILE_SERVER_URL,
      env.FILE_SERVER_URL,
    ),
    apiKey: env.FILE_SERVER_API_KEY,
  };
}

export function toPublicServeUrl(pathOrUrl: unknown, publicRoot: string) {
  if (typeof pathOrUrl !== "string" || pathOrUrl.length === 0) {
    return "";
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${trimTrailingSlash(publicRoot)}${path}`;
}

function stringifyDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return new Date().toISOString();
}

function preferredVariant(image: ServeImage) {
  return image.variants?.find((variant) => variant.label === "webp");
}

function placeholderVariant(image: ServeImage) {
  return image.variants?.find((variant) =>
    typeof variant.label === "string" && variant.label.includes("placeholder"),
  );
}

export function normalizeServeImage(
  image: ServeImage,
  publicRoot: string,
): AdminImage {
  const variants = (image.variants ?? []).map((variant) => ({
    ...variant,
    publicUrl: variant.url
      ? toPublicServeUrl(variant.url, publicRoot)
      : undefined,
  }));
  const webp = preferredVariant(image);
  const placeholder = placeholderVariant(image);
  const publicUrl = toPublicServeUrl(image.url, publicRoot);
  const previewUrl = webp?.url
    ? toPublicServeUrl(webp.url, publicRoot)
    : publicUrl;

  return {
    ...(image as any),
    id: String(image.id ?? image.filename ?? ""),
    filename: String(image.filename ?? ""),
    originalName: String(image.originalName ?? image.filename ?? "Untitled"),
    contentType: String(image.contentType ?? "application/octet-stream"),
    sizeBytes: Number(image.sizeBytes ?? 0),
    width: image.width ?? null,
    height: image.height ?? null,
    publicUrl,
    previewUrl,
    placeholderUrl: placeholder?.url
      ? toPublicServeUrl(placeholder.url, publicRoot)
      : null,
    variants,
    createdAt: stringifyDate(image.createdAt),
    updatedAt: stringifyDate(image.updatedAt),
  };
}

function authHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "x-api-key": apiKey,
  };
}

async function parseJsonResponse(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
}

function upstreamMessage(payload: any, fallback: string) {
  return String(payload?.error ?? payload?.message ?? fallback);
}

function buildUploadHeaders(requestHeaders: Headers, apiKey: string) {
  const headers = new Headers(requestHeaders);
  headers.set("Authorization", `Bearer ${apiKey}`);
  headers.set("x-api-key", apiKey);
  headers.set("Accept", "application/json");
  headers.delete("host");
  headers.delete("content-length");
  return headers;
}

export const adminImagesService = {
  async list(query: ListImagesQuery): Promise<AdminImagesListResponse> {
    const { apiRoot, publicRoot, apiKey } = requiredConfig();
    const url = new URL(`${apiRoot}/images`);

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      method: "GET",
      headers: authHeaders(apiKey),
    });
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new AdminImagesServiceError(
        upstreamMessage(payload, "Failed to list images"),
        response.status,
      );
    }

    return {
      images: (payload.images ?? []).map((image: ServeImage) =>
        normalizeServeImage(image, publicRoot),
      ),
      pagination: payload.pagination ?? {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  },

  async get(id: string): Promise<AdminImage> {
    const { apiRoot, publicRoot, apiKey } = requiredConfig();
    const response = await fetch(`${apiRoot}/images/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: authHeaders(apiKey),
    });
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new AdminImagesServiceError(
        upstreamMessage(payload, "Failed to fetch image"),
        response.status,
      );
    }

    return normalizeServeImage(payload, publicRoot);
  },

  async delete(id: string) {
    const { apiRoot, apiKey } = requiredConfig();
    const response = await fetch(`${apiRoot}/images/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: authHeaders(apiKey),
    });
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new AdminImagesServiceError(
        upstreamMessage(payload, "Failed to delete image"),
        response.status,
      );
    }

    return payload;
  },

  async upload(request: Request): Promise<{
    status: number;
    payload: AdminImagesUploadResponse | Record<string, unknown>;
  }> {
    const { apiRoot, publicRoot, apiKey } = requiredConfig();
    const response = await fetch(`${apiRoot}/upload`, {
      method: "POST",
      headers: buildUploadHeaders(request.headers, apiKey),
      body: request.body,
    } as RequestInit);
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      return { status: response.status, payload };
    }

    const rawImages = Array.isArray(payload.images)
      ? payload.images
      : payload.image
        ? [payload.image]
        : [];

    return {
      status: response.status,
      payload: {
        success: Boolean(payload.success ?? true),
        images: rawImages.map((image: ServeImage) =>
          normalizeServeImage(image, publicRoot),
        ),
        errors: payload.errors,
      },
    };
  },
};
