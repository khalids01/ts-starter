import { useEffect, useMemo, useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onLoad" | "onError"> & {
  src: string;
  placeholderSrc?: string | null;
  showPlaceholder?: boolean;
  showLoadingSpinner?: boolean;
  fallback?: ReactNode;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
  onError?: () => void;
};

const SERVE_IMAGE_PATTERN = /^(.*\/api\/img\/)([^/?#]+?)(?:\.(jpg|jpeg|png|webp|avif|gif|svg))?(?:-placeholder)?([?#].*)?$/i;

export function Img({
  src,
  alt = "",
  placeholderSrc,
  showPlaceholder = true,
  showLoadingSpinner = false,
  fallback,
  objectFit = "cover",
  className,
  width,
  height,
  style,
  loading = "lazy",
  decoding = "async",
  onLoad,
  onError,
  ...props
}: ImgProps) {
  const resolved = useMemo(() => resolveServeImageUrls(src, placeholderSrc), [src, placeholderSrc]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [mainImageOpacity, setMainImageOpacity] = useState(showPlaceholder && resolved.placeholderUrl ? 0 : 1);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setMainImageOpacity(showPlaceholder && resolved.placeholderUrl ? 0 : 1);
  }, [resolved.imageUrl, resolved.placeholderUrl, showPlaceholder]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setTimeout(() => setMainImageOpacity(1), 10);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const fallbackNode = fallback ?? (
    <div
      className={cn("flex h-full w-full items-center justify-center bg-muted text-muted-foreground", className)}
      style={{ width, height, ...style }}
    >
      <ImageIcon className="h-8 w-8" />
    </div>
  );

  if (!src || hasError) {
    return <>{fallbackNode}</>;
  }

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ width, height, ...style }}
    >
      {showPlaceholder && resolved.placeholderUrl ? (
        <img
          src={resolved.placeholderUrl}
          alt={`${alt} placeholder`}
          aria-hidden="true"
          className={cn("absolute inset-0 h-full w-full blur-sm", objectFitClass(objectFit))}
          style={{
            opacity: mainImageOpacity === 1 ? 0 : 1,
            transition: "opacity 300ms ease-in-out",
          }}
        />
      ) : null}

      {showLoadingSpinner && isLoading ? (
        <div className="absolute inset-0 grid place-items-center bg-muted/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : null}

      <img
        {...props}
        src={resolved.imageUrl}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        className={cn("absolute inset-0 h-full w-full", objectFitClass(objectFit))}
        style={{
          opacity: mainImageOpacity,
          transition: "opacity 300ms ease-in-out",
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

function resolveServeImageUrls(src: string, placeholderSrc?: string | null) {
  const match = src.match(SERVE_IMAGE_PATTERN);
  if (!match) {
    return {
      imageUrl: src,
      placeholderUrl: placeholderSrc ?? null,
    };
  }

  const [, prefix, rawName, , suffix = ""] = match;
  const baseName = rawName?.replace(/-placeholder$/i, "");

  return {
    imageUrl: `${prefix}${baseName}.webp${suffix}`,
    placeholderUrl: placeholderSrc ?? `${prefix}${baseName}.webp-placeholder`,
  };
}

function objectFitClass(objectFit: NonNullable<ImgProps["objectFit"]>) {
  switch (objectFit) {
    case "contain":
      return "object-contain";
    case "fill":
      return "object-fill";
    case "none":
      return "object-none";
    case "scale-down":
      return "object-scale-down";
    case "cover":
    default:
      return "object-cover";
  }
}
