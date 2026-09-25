import { Archive, RotateCcw, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ArchiveView = "current" | "archived";
export type DependencyDetail = { type: string; count: number; action: string };

export function ArchiveViewTabs(props: { value: ArchiveView; onChange: (value: ArchiveView) => void }) {
  return (
    <Tabs value={props.value} onValueChange={(value) => props.onChange(value as ArchiveView)}>
      <TabsList>
        <TabsTrigger value="current">Current</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function ArchiveActions(props: {
  archived: boolean;
  disabled?: boolean;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  return props.archived ? (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={props.disabled} onClick={props.onRestore}>
        <RotateCcw className="mr-2 size-4" /> Recover
      </Button>
      <Button size="sm" variant="destructive" disabled={props.disabled} onClick={props.onDelete}>
        <Trash2 className="mr-2 size-4" /> Delete permanently
      </Button>
    </div>
  ) : (
    <Button size="sm" variant="outline" disabled={props.disabled} onClick={props.onArchive}>
      <Archive className="mr-2 size-4" /> Archive
    </Button>
  );
}

export type ResourceAction = "archive" | "restore" | "delete";

export function ResourceActionDialog(props: {
  action: ResourceAction | null;
  resourceName?: string;
  resourceKind: string;
  pending: boolean;
  error?: unknown;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dependencies = dependencyDetails(props.error);
  const actionLabel = props.action === "delete" ? "Delete permanently" : props.action === "restore" ? "Recover" : "Archive";
  return (
    <AlertDialog open={Boolean(props.action)} onOpenChange={(open) => !open && !props.pending && props.onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{actionLabel} {props.resourceKind}?</AlertDialogTitle>
          <AlertDialogDescription>
            {props.action === "delete"
              ? `${props.resourceName ?? "This item"} will be permanently deleted. This cannot be undone.`
              : props.action === "restore"
                ? `${props.resourceName ?? "This item"} will return to Current and remain disabled until you enable it.`
                : `${props.resourceName ?? "This item"} will move to Archived and be disabled.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {props.error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive">{errorMessage(props.error)}</p>
            {dependencies.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                {dependencies.map((item) => (
                  <li key={item.type}><span className="font-medium text-foreground">{label(item.type)}: {item.count}</span> — {item.action}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={props.pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={props.action === "delete" ? "destructive" : "default"}
            disabled={props.pending}
            onClick={(event) => { event.preventDefault(); props.onConfirm(); }}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The operation could not be completed";
}

function dependencyDetails(error: unknown): DependencyDetail[] {
  const value = (error ?? {}) as { dependencies?: unknown };
  return Array.isArray(value.dependencies) ? value.dependencies as DependencyDetail[] : [];
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}
