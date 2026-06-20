import type { AdminImage } from "./types";

export function formatFileSize(bytes?: number | null) {
  if (!bytes) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${Math.round((bytes / 1024 ** index) * 10) / 10} ${units[index]}`;
}

export function formatImageDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
}

export function imageDimensions(image: AdminImage) {
  if (!image.width || !image.height) {
    return "-";
  }

  return `${image.width} x ${image.height}`;
}

export function imageTypeLabel(contentType?: string | null) {
  if (!contentType) {
    return "File";
  }

  return contentType.split("/")[1]?.toUpperCase() ?? contentType;
}

export function imageTags(image: AdminImage): string[] {
  return Array.isArray(image.tags)
    ? image.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}
