import { useCallback, useRef, useState } from "react";
import { AlertCircle, FileImage, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatFileSize } from "./utils";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function ImageUploadDialog(props: {
  open: boolean;
  uploading: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[], tags: string) => Promise<void>;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const reset = () => {
    setFiles([]);
    setTags("");
    setErrors([]);
    setDragActive(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const addFiles = useCallback((incoming: File[]) => {
    const nextErrors: string[] = [];
    const valid = incoming.filter((file) => {
      if (!file.type.startsWith("image/")) {
        nextErrors.push(`${file.name} is not an image.`);
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        nextErrors.push(`${file.name} is larger than 50 MB.`);
        return false;
      }

      return true;
    });

    setErrors(nextErrors);
    if (valid.length) {
      setFiles((current) => [...current, ...valid]);
    }
  }, []);

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const submit = async () => {
    await props.onUpload(files, tags);
    reset();
    props.onOpenChange(false);
  };

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        props.onOpenChange(open);
        if (!open) {
          reset();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload images</DialogTitle>
          <DialogDescription>
            Add product, banner, catalog, or content images to Serve.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {errors.length ? (
            <div className="grid gap-1 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                Some files were skipped
              </div>
              {errors.map((error) => (
                <div key={error}>{error}</div>
              ))}
            </div>
          ) : null}

          <div
            className={cn(
              "relative grid min-h-44 cursor-pointer place-items-center rounded-md border border-dashed p-6 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "hover:bg-muted/50",
            )}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={onDrop}
          >
            <div className="grid justify-items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="font-medium">Drop images here</div>
              <div className="text-sm text-muted-foreground">
                Or browse from your device. Max 50 MB per image.
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => addFiles(Array.from(event.currentTarget.files ?? []))}
            />
          </div>

          {files.length ? (
            <div className="grid max-h-52 gap-2 overflow-y-auto rounded-md border p-2">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-md bg-muted/50 p-2">
                  <FileImage className="h-5 w-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="image-tags">Tags</Label>
            <Input
              id="image-tags"
              value={tags}
              placeholder="product, banner, home"
              onChange={(event) => setTags(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={props.uploading}
            onClick={() => props.onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!files.length || props.uploading}
            onClick={submit}
          >
            {props.uploading ? "Uploading..." : `Upload ${files.length || ""}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
