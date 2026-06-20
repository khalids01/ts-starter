import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ImageIcon, RefreshCcw, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { adminImagesApi } from "./api";
import { ImageUploadDialog } from "./image-upload-dialog";
import type { AdminImage, ImageFiltersState } from "./types";
import { formatFileSize, imageDimensions, imageTags } from "./utils";

const initialFilters: ImageFiltersState = {
  page: 1,
  limit: 20,
  search: "",
  contentType: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export function AdminImagePickerDialog(props: {
  open: boolean;
  mode: "single" | "multiple";
  value: string | string[];
  title?: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string | string[]) => void;
}) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ImageFiltersState>(initialFilters);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [draftSelection, setDraftSelection] = useState<string[]>(() =>
    Array.isArray(props.value) ? props.value : props.value ? [props.value] : [],
  );

  const imagesQuery = useQuery({
    queryKey: queryKeys.admin.images.list(filters),
    queryFn: () => adminImagesApi.list(filters),
    enabled: props.open,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ files, tags }: { files: File[]; tags: string }) =>
      adminImagesApi.upload(files, tags),
    onSuccess: (result) => {
      const count = result.images.length;
      toast.success(`${count} image${count === 1 ? "" : "s"} uploaded`);
      if (result.errors?.length) {
        toast.warning(`${result.errors.length} upload issue${result.errors.length === 1 ? "" : "s"} reported`);
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.images.all() });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to upload images";
      toast.error(message);
    },
  });

  const selected = useMemo(() => new Set(draftSelection), [draftSelection]);
  const images = imagesQuery.data?.images ?? [];
  const pagination = imagesQuery.data?.pagination;
  const currentPage = pagination?.page ?? filters.page;
  const totalPages = pagination?.pages ?? 0;
  const selectedCount = draftSelection.filter(Boolean).length;

  const updateFilters = (patch: Partial<ImageFiltersState>) => {
    setFilters((current) => ({ ...current, ...patch }));
  };

  const syncSelectionFromValue = () => {
    setDraftSelection(
      Array.isArray(props.value) ? props.value : props.value ? [props.value] : [],
    );
  };

  const changeSort = (value: string | null) => {
    if (!value) {
      return;
    }

    const [sortBy, sortOrder] = value.split(":") as [
      ImageFiltersState["sortBy"],
      ImageFiltersState["sortOrder"],
    ];
    updateFilters({ sortBy, sortOrder, page: 1 });
  };

  const toggleImage = (image: AdminImage) => {
    const url = image.publicUrl;
    if (props.mode === "single") {
      setDraftSelection([url]);
      return;
    }

    setDraftSelection((current) =>
      current.includes(url)
        ? current.filter((entry) => entry !== url)
        : [...current, url],
    );
  };

  const commitSelection = () => {
    props.onSelect(props.mode === "single" ? draftSelection[0] ?? "" : draftSelection);
    props.onOpenChange(false);
  };

  return (
    <>
      <Dialog
        open={props.open}
        onOpenChange={(open) => {
          props.onOpenChange(open);
          if (open) {
            syncSelectionFromValue();
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-hidden sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>{props.title ?? "Choose image"}</DialogTitle>
            <DialogDescription>
              {props.description ?? "Select from Serve images or upload new files."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 gap-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_160px_180px_auto_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.search}
                  placeholder="Search images"
                  className="pl-9"
                  onChange={(event) => updateFilters({ search: event.target.value, page: 1 })}
                />
              </div>

              <Select
                value={filters.contentType}
                onValueChange={(contentType) => contentType && updateFilters({ contentType, page: 1 })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="image/jpeg">JPEG</SelectItem>
                  <SelectItem value="image/png">PNG</SelectItem>
                  <SelectItem value="image/webp">WebP</SelectItem>
                  <SelectItem value="image/svg+xml">SVG</SelectItem>
                </SelectContent>
              </Select>

              <Select value={`${filters.sortBy}:${filters.sortOrder}`} onValueChange={changeSort}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt:desc">Newest first</SelectItem>
                  <SelectItem value="createdAt:asc">Oldest first</SelectItem>
                  <SelectItem value="name:asc">Name A-Z</SelectItem>
                  <SelectItem value="name:desc">Name Z-A</SelectItem>
                  <SelectItem value="size:desc">Largest first</SelectItem>
                  <SelectItem value="size:asc">Smallest first</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                title="Refresh"
                onClick={() => imagesQuery.refetch()}
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>

              <Button type="button" onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>
                {pagination?.total
                  ? `${(currentPage - 1) * (pagination?.limit ?? filters.limit) + 1}-${Math.min(currentPage * (pagination?.limit ?? filters.limit), pagination.total)} of ${pagination.total} images`
                  : "0 images"}
              </span>
              <span>{selectedCount} selected</span>
            </div>

            <div className="min-h-[360px] overflow-y-auto rounded-md border p-3">
              {imagesQuery.isLoading ? (
                <PickerState>Loading images...</PickerState>
              ) : imagesQuery.isError ? (
                <PickerState>
                  <div className="grid justify-items-center gap-3">
                    <span>Failed to load images.</span>
                    <Button type="button" variant="outline" onClick={() => imagesQuery.refetch()}>
                      Retry
                    </Button>
                  </div>
                </PickerState>
              ) : images.length === 0 ? (
                <Empty className="min-h-80">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ImageIcon className="h-4 w-4" />
                    </EmptyMedia>
                    <EmptyTitle>No images found</EmptyTitle>
                    <EmptyDescription>
                      Upload images or adjust the current filters.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {images.map((image) => (
                    <PickerImageCard
                      key={image.id}
                      image={image}
                      selected={selected.has(image.publicUrl)}
                      onToggle={() => toggleImage(image)}
                    />
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 ? (
              <nav className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || imagesQuery.isFetching}
                  onClick={() => updateFilters({ page: currentPage - 1 })}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages || imagesQuery.isFetching}
                  onClick={() => updateFilters({ page: currentPage + 1 })}
                >
                  Next
                </Button>
              </nav>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={commitSelection}>
              Use {props.mode === "single" ? "image" : "selected images"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageUploadDialog
        open={uploadOpen}
        uploading={uploadMutation.isPending}
        onOpenChange={setUploadOpen}
        onUpload={async (files, tags) => {
          await uploadMutation.mutateAsync({ files, tags });
        }}
      />
    </>
  );
}

function PickerImageCard(props: {
  image: AdminImage;
  selected: boolean;
  onToggle: () => void;
}) {
  const tags = imageTags(props.image);

  return (
    <button
      type="button"
      className={cn(
        "group min-w-0 overflow-hidden rounded-md border bg-card text-left transition-colors hover:border-primary",
        props.selected && "border-primary ring-2 ring-primary/20",
      )}
      onClick={props.onToggle}
    >
      <div className="relative aspect-square bg-muted">
        {props.image.previewUrl ? (
          <img
            src={props.image.previewUrl}
            alt={props.image.originalName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        {props.selected ? (
          <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" />
          </span>
        ) : null}
      </div>

      <div className="grid gap-2 p-3">
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
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 ? <Badge variant="secondary">+{tags.length - 2}</Badge> : null}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function PickerState(props: { children: ReactNode }) {
  return (
    <div className="grid min-h-80 place-items-center text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}
