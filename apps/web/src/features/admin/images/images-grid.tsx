import { Copy, Eye, ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Img } from "@/components/core/img";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminImage } from "./types";
import {
  copyText,
  formatFileSize,
  imageDimensions,
  imageTags,
} from "./utils";

export function ImagesGrid(props: {
  images: AdminImage[];
  canManage: boolean;
  onPreview: (image: AdminImage) => void;
  onDelete: (image: AdminImage) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {props.images.map((image) => (
        <ImageCard key={image.id} {...props} image={image} />
      ))}
    </div>
  );
}

function ImageCard(props: {
  image: AdminImage;
  canManage: boolean;
  onPreview: (image: AdminImage) => void;
  onDelete: (image: AdminImage) => void;
}) {
  const tags = imageTags(props.image);

  const copyUrl = async () => {
    try {
      await copyText(props.image.publicUrl);
      toast.success("Image URL copied");
    } catch {
      toast.error("Could not copy image URL");
    }
  };

  return (
    <article className="group min-w-0 overflow-hidden rounded-md border bg-card">
      <button
        type="button"
        className="relative block aspect-square w-full bg-muted text-left"
        onClick={() => props.onPreview(props.image)}
      >
        {props.image.previewUrl ? (
          <Img
            src={props.image.previewUrl}
            placeholderSrc={props.image.placeholderUrl}
            alt={props.image.originalName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-0 hidden items-center justify-center gap-2 bg-black/50 group-hover:flex">
          <span className="inline-flex h-9 items-center gap-2 rounded-md bg-background px-3 text-sm font-medium">
            <Eye className="h-4 w-4" />
            Preview
          </span>
        </div>
      </button>

      <div className="grid gap-3 p-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{props.image.originalName}</div>
          <div className="truncate text-xs text-muted-foreground">{props.image.filename}</div>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{imageDimensions(props.image)}</span>
          <span>{formatFileSize(props.image.sizeBytes)}</span>
        </div>

        {tags.length ? (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 ? <Badge variant="secondary">+{tags.length - 3}</Badge> : null}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-1 border-t pt-2">
          <Button type="button" variant="ghost" size="icon-sm" title="Copy URL" onClick={copyUrl}>
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy URL</span>
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" title="Preview" onClick={() => props.onPreview(props.image)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">Preview</span>
          </Button>
          {props.canManage ? (
            <Button type="button" variant="ghost" size="icon-sm" title="Delete" onClick={() => props.onDelete(props.image)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
