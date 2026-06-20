import { Copy, Eye, ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminImage } from "./types";
import {
  copyText,
  formatFileSize,
  formatImageDate,
  imageDimensions,
  imageTags,
  imageTypeLabel,
} from "./utils";

export function ImagesTable(props: {
  images: AdminImage[];
  canManage: boolean;
  onPreview: (image: AdminImage) => void;
  onDelete: (image: AdminImage) => void;
}) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Dimensions</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.images.map((image) => (
            <ImageRow key={image.id} {...props} image={image} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ImageRow(props: {
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
    <TableRow>
      <TableCell>
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-muted-foreground"
            onClick={() => props.onPreview(props.image)}
          >
            {props.image.previewUrl ? (
              <img
                src={props.image.previewUrl}
                alt={props.image.originalName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </button>
          <div className="min-w-0">
            <div className="max-w-[260px] truncate font-medium">
              {props.image.originalName}
            </div>
            <div className="max-w-[260px] truncate text-xs text-muted-foreground">
              {props.image.filename}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>{imageDimensions(props.image)}</TableCell>
      <TableCell>{formatFileSize(props.image.sizeBytes)}</TableCell>
      <TableCell>
        <Badge variant="secondary">{imageTypeLabel(props.image.contentType)}</Badge>
      </TableCell>
      <TableCell>
        {tags.length ? (
          <div className="flex max-w-[220px] flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 ? <Badge variant="secondary">+{tags.length - 2}</Badge> : null}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>{formatImageDate(props.image.createdAt)}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
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
      </TableCell>
    </TableRow>
  );
}
