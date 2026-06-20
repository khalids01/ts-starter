import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, LayoutGrid, List, RefreshCcw, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSession } from "@/providers/session-provider";
import { ecommercePermissions, EcommerceHeader, readError } from "../ecommerce/ui";
import { adminImagesApi } from "./api";
import { ImagesGrid } from "./images-grid";
import { ImagesTable } from "./images-table";
import { ImagePreviewDialog } from "./image-preview-dialog";
import { ImageUploadDialog } from "./image-upload-dialog";
import type { AdminImage, ImageFiltersState, ImagesViewMode } from "./types";
import { cn } from "@/lib/utils";

const initialFilters: ImageFiltersState = {
  page: 1,
  limit: 20,
  search: "",
  contentType: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export function AdminImagesPage() {
  const { session } = useSession();
  const { canManageImages } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ImageFiltersState>(initialFilters);
  const [viewMode, setViewMode] = useState<ImagesViewMode>("grid");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<AdminImage | null>(null);
  const [deleteImage, setDeleteImage] = useState<AdminImage | null>(null);

  const imagesQuery = useQuery({
    queryKey: queryKeys.admin.images.list(filters),
    queryFn: () => adminImagesApi.list(filters),
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
    onError: (error) => toast.error(readError(error, "Failed to upload images")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminImagesApi.delete(id),
    onSuccess: () => {
      toast.success("Image deleted");
      setDeleteImage(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.images.all() });
    },
    onError: (error) => toast.error(readError(error, "Failed to delete image")),
  });

  const images = imagesQuery.data?.images ?? [];
  const pagination = imagesQuery.data?.pagination;
  const shownRange = useMemo(() => {
    if (!pagination?.total) {
      return "0 images";
    }

    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    return `${start}-${end} of ${pagination.total} images`;
  }, [pagination]);

  const updateFilters = (patch: Partial<ImageFiltersState>) => {
    setFilters((current) => ({ ...current, ...patch }));
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

  const totalPages = pagination?.pages ?? 0;
  const currentPage = pagination?.page ?? filters.page;

  return (
    <div className="grid gap-6">
      <EcommerceHeader
        title="Images"
        description="Manage Serve-hosted ecommerce media and copy public URLs for product content."
        action={
          canManageImages ? (
            <Button type="button" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" />
              Upload images
            </Button>
          ) : null
        }
      />

      <section className="grid gap-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_190px_auto]">
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
            onValueChange={(contentType) => {
              if (contentType) {
                updateFilters({ contentType, page: 1 });
              }
            }}
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

          <div className="flex items-center justify-between gap-2 lg:justify-end">
            <ViewSwitcher value={viewMode} onChange={setViewMode} />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              title="Refresh"
              onClick={() => imagesQuery.refetch()}
            >
              <RefreshCcw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>{shownRange}</span>
          {imagesQuery.isFetching ? <Badge variant="secondary">Syncing</Badge> : null}
        </div>
      </section>

      {imagesQuery.isLoading ? (
        <StatePanel>Loading images...</StatePanel>
      ) : imagesQuery.isError ? (
        <StatePanel>
          <div className="grid justify-items-center gap-3">
            <span>Failed to load images.</span>
            <Button type="button" variant="outline" onClick={() => imagesQuery.refetch()}>
              Retry
            </Button>
          </div>
        </StatePanel>
      ) : images.length === 0 ? (
        <Empty className="min-h-80 rounded-md border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon className="h-4 w-4" />
            </EmptyMedia>
            <EmptyTitle>No images found</EmptyTitle>
            <EmptyDescription>
              Upload images or adjust the current filters.
            </EmptyDescription>
          </EmptyHeader>
          {canManageImages ? (
            <Button type="button" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" />
              Upload images
            </Button>
          ) : null}
        </Empty>
      ) : viewMode === "grid" ? (
        <ImagesGrid
          images={images}
          canManage={canManageImages}
          onPreview={setPreviewImage}
          onDelete={setDeleteImage}
        />
      ) : (
        <ImagesTable
          images={images}
          canManage={canManageImages}
          onPreview={setPreviewImage}
          onDelete={setDeleteImage}
        />
      )}

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

      <ImageUploadDialog
        open={uploadOpen}
        uploading={uploadMutation.isPending}
        onOpenChange={setUploadOpen}
        onUpload={async (files, tags) => {
          await uploadMutation.mutateAsync({ files, tags });
        }}
      />

      <ImagePreviewDialog
        image={previewImage}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewImage(null);
          }
        }}
      />

      <AlertDialog open={Boolean(deleteImage)} onOpenChange={(open) => !open && setDeleteImage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the file record in Serve. If the file is linked to other applications, those links can be removed too.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteImage && deleteMutation.mutate(deleteImage.id)}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ViewSwitcher(props: {
  value: ImagesViewMode;
  onChange: (value: ImagesViewMode) => void;
}) {
  return (
    <div className="inline-flex rounded-md border p-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="Grid view"
        aria-pressed={props.value === "grid"}
        className={cn(props.value === "grid" && "bg-muted")}
        onClick={() => props.onChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="List view"
        aria-pressed={props.value === "list"}
        className={cn(props.value === "list" && "bg-muted")}
        onClick={() => props.onChange("list")}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  );
}

function StatePanel(props: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-80 place-items-center rounded-md border p-6 text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}
