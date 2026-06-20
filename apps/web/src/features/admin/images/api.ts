import { env } from "@env/client";
import { client } from "@/lib/client";
import type {
  AdminImage,
  AdminImageListResponse,
  AdminImageUploadResponse,
  ImageFiltersState,
} from "./types";

const api = client;

async function unwrap<T>(request: Promise<{ data?: T; error?: any }>, fallback: string) {
  const { data, error } = await request;
  if (error) {
    throw new Error(String(error.value?.message || error.message || fallback));
  }
  return data as T;
}

function queryFromFilters(filters: ImageFiltersState) {
  return {
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    contentType: filters.contentType === "all" ? undefined : filters.contentType,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };
}

export const adminImagesApi = {
  list: (filters: ImageFiltersState) =>
    unwrap<AdminImageListResponse>(
      api.admin.images.get({ query: queryFromFilters(filters) }),
      "Failed to load images",
    ),
  detail: (id: string) =>
    unwrap<AdminImage>(
      api.admin.images({ id }).get(),
      "Failed to load image",
    ),
  delete: (id: string) =>
    unwrap(api.admin.images({ id }).delete(), "Failed to delete image"),
  upload: async (files: File[], tags: string) => {
    const formData = new FormData();
    const parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    formData.append(
      "files",
      JSON.stringify(
        files.map((_, index) => ({
          file: `file_${index}`,
          tags: parsedTags.length ? parsedTags : undefined,
        })),
      ),
    );

    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    const response = await fetch(`${env.VITE_SERVER_URL}/admin/images/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(String(payload.error || payload.message || "Failed to upload images"));
    }

    return payload as AdminImageUploadResponse;
  },
};
