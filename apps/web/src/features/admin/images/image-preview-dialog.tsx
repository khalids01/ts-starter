import { Copy, ExternalLink, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminImage } from "./types";
import {
  copyText,
  formatFileSize,
  formatImageDate,
  imageDimensions,
  imageTags,
  imageTypeLabel,
} from "./utils";

export function ImagePreviewDialog(props: {
  image: AdminImage | null;
  onOpenChange: (open: boolean) => void;
}) {
  const image = props.image;

  const copyUrl = async () => {
    if (!image) {
      return;
    }

    try {
      await copyText(image.publicUrl);
      toast.success("Image URL copied");
    } catch {
      toast.error("Could not copy image URL");
    }
  };

  return (
    <Dialog open={Boolean(image)} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{image?.originalName ?? "Image preview"}</DialogTitle>
          <DialogDescription>
            Preview, copy, or open the public Serve URL.
          </DialogDescription>
        </DialogHeader>

        {image ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid min-h-[360px] place-items-center overflow-hidden rounded-md border bg-muted">
              {image.previewUrl ? (
                <img
                  src={image.previewUrl}
                  alt={image.originalName}
                  className="max-h-[70vh] w-full object-contain"
                />
              ) : (
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              )}
            </div>

            <aside className="grid content-start gap-4">
              <div className="grid gap-3 rounded-md border p-4 text-sm">
                <Meta label="Filename" value={image.filename} />
                <Meta label="Dimensions" value={imageDimensions(image)} />
                <Meta label="Size" value={formatFileSize(image.sizeBytes)} />
                <Meta label="Type" value={image.contentType} />
                <Meta label="Created" value={formatImageDate(image.createdAt)} />
                {image.applicationName ? (
                  <Meta label="Application" value={image.applicationName} />
                ) : null}
              </div>

              {imageTags(image).length ? (
                <div className="flex flex-wrap gap-1">
                  {imageTags(image).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-2">
                <Button type="button" onClick={copyUrl}>
                  <Copy className="h-4 w-4" />
                  Copy URL
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(image.publicUrl, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open public file
                </Button>
              </div>
            </aside>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Meta(props: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{props.label}</div>
      <div className="truncate font-medium">
        {props.label === "Type" ? imageTypeLabel(props.value) : props.value}
      </div>
    </div>
  );
}
