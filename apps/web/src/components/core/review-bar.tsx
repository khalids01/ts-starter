import { useState } from "react";
import { ChevronDown, ChevronUp, ClipboardCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ReviewBarItem = {
  id: string;
  title: string;
  description: string;
  warning?: string;
};

export function ReviewBar(props: {
  items: ReviewBarItem[];
  updateLabel?: string;
  updating?: boolean;
  onRemove: (id: string) => void;
  onCancel: () => void;
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (props.items.length === 0) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-50 mx-auto w-auto max-w-2xl sm:bottom-5">
      <div className="overflow-hidden rounded-xl border bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/90">
        {expanded ? (
          <div className="max-h-[min(55vh,28rem)] overflow-y-auto border-b p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">Review changes</p>
                <p className="text-xs text-muted-foreground">
                  Nothing is saved until you update.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setExpanded(false)}
              >
                <ChevronDown />
                <span className="sr-only">Collapse review</span>
              </Button>
            </div>
            <div className="grid gap-2">
              {props.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                    {item.warning ? (
                      <p className="mt-1 text-xs font-medium text-destructive">
                        {item.warning}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => props.onRemove(item.id)}
                  >
                    <X />
                    <span className="sr-only">Remove change</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
            onClick={() => setExpanded((value) => !value)}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ClipboardCheck className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">
                {props.items.length} pending{" "}
                {props.items.length === 1 ? "change" : "changes"}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {props.items.length === 1
                  ? props.items[0]?.description
                  : "Review before updating"}
              </span>
            </span>
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronUp className="size-4" />
            )}
          </button>
          <div className={cn("flex gap-2", expanded ? "sm:flex" : "flex")}>
            <Button
              variant="ghost"
              className="flex-1 sm:flex-none"
              onClick={props.onCancel}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              disabled={
                props.updating || props.items.some((item) => item.warning)
              }
              onClick={props.onUpdate}
            >
              {props.updating ? "Updating..." : (props.updateLabel ?? "Update")}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
