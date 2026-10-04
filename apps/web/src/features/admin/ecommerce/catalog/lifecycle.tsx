import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { env } from "@env/public";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { queryKeys } from "@/constants/query-keys";

type Kind = "category" | "brand" | "attribute" | "product";
type Action = "archive" | "restore" | "delete";
type Item = {
  id: string;
  name: string;
  slug: string;
  archivedAt: string | null;
};
async function lifecycleRequest<T>(path: string, method = "GET"): Promise<T> {
  const response = await fetch(
    `${env.VITE_SERVER_URL}/admin/catalog/lifecycle/${path}`,
    { method, credentials: "include" },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Catalog operation failed");
  return data;
}
export function CatalogLifecycleAction({
  kind,
  id,
  name,
  action = "archive",
  onComplete,
  renderTrigger,
}: {
  kind: Kind;
  id: string;
  name: string;
  action?: Action;
  onComplete?: () => void;
  renderTrigger?: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      lifecycleRequest<{ message: string }>(
        `${kind}/${encodeURIComponent(id)}/${action}`,
        "POST",
      ),
    onSuccess: (data) => {
      toast.success(data.message);
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["catalog-lifecycle"] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.ecommerce.catalog.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.ecommerce.products.all(),
      });
      onComplete?.();
    },
  });
  const label =
    action === "archive"
      ? "Archive"
      : action === "restore"
        ? "Restore"
        : "Delete";
  const Icon =
    action === "archive" ? Archive : action === "restore" ? RotateCcw : Trash2;
  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => {
          mutation.reset();
          setOpen(true);
        })
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={action === "delete" ? "text-destructive" : ""}
          aria-label={`${label} ${name}`}
          onClick={() => {
            mutation.reset();
            setOpen(true);
          }}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      )}
      <AlertDialog
        open={open}
        onOpenChange={(value) => {
          if (!mutation.isPending) setOpen(value);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {label} {name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "delete"
                ? "Permanently remove this archived item. This cannot be undone. References and history may prevent deletion."
                : action === "archive"
                  ? "Move this item to Archived. Its settings are preserved for restoration. Dependencies may prevent archiving."
                  : "Move this item back to Current with its previous settings. Required categories and brands must be restored first."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {mutation.isError ? (
            <p role="alert" className="text-sm text-destructive">
              {mutation.error.message}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={mutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                mutation.mutate();
              }}
            >
              {mutation.isPending ? "Working…" : label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
export function CatalogLifecycleView({
  kind,
  canManage,
  children,
}: {
  kind: Kind;
  canManage: boolean;
  children: ReactNode;
}) {
  const [tab, setTab] = useState("current");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["catalog-lifecycle", kind, page],
    enabled: tab === "archived",
    queryFn: () =>
      lifecycleRequest<{ items: Item[]; total: number; pages: number }>(
        `${kind}?page=${page}&limit=20`,
      ),
  });
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        setTab(value);
        setPage(1);
      }}
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="current">Current</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>
      <TabsContent value="current">{children}</TabsContent>
      <TabsContent value="archived">
        {query.isPending ? (
          <p role="status">Loading archived items…</p>
        ) : query.isError ? (
          <div role="alert">
            <p>{query.error.message}</p>
            <Button variant="outline" onClick={() => void query.refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {!query.data.items.length ? (
              <p className="rounded-xl border p-6 text-muted-foreground">
                No archived items on this page.
              </p>
            ) : (
              query.data.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                >
                  <div className="min-w-0">
                    <p className="break-words font-medium">{item.name}</p>
                    <p className="break-all text-xs text-muted-foreground">
                      {item.slug}
                    </p>
                  </div>
                  {canManage ? (
                    <div className="flex gap-2">
                      <CatalogLifecycleAction
                        kind={kind}
                        id={item.id}
                        name={item.name}
                        action="restore"
                      />
                      <CatalogLifecycleAction
                        kind={kind}
                        id={item.id}
                        name={item.name}
                        action="delete"
                        onComplete={() => setPage(1)}
                      />
                    </div>
                  ) : null}
                </div>
              ))
            )}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {query.data.pages}
              </span>
              <Button
                variant="outline"
                disabled={page >= query.data.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
