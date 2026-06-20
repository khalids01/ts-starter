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

export type AdminImagePagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type AdminImageListResponse = {
  images: AdminImage[];
  pagination: AdminImagePagination;
};

export type AdminImageUploadResponse = {
  success: boolean;
  images: AdminImage[];
  errors?: string[];
};

export type ImagesViewMode = "grid" | "list";

export type ImageFiltersState = {
  page: number;
  limit: number;
  search: string;
  contentType: string;
  sortBy: "createdAt" | "updatedAt" | "name" | "size" | "type";
  sortOrder: "asc" | "desc";
};
