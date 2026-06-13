import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductViewMode } from "./view-store";

export function ProductsViewSwitcher(props: {
  value: ProductViewMode;
  onChange: (value: ProductViewMode) => void;
}) {
  return (
    <div className="inline-flex shrink-0 rounded-md border p-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-pressed={props.value === "grid"}
        title="Grid view"
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
        aria-pressed={props.value === "list"}
        title="List view"
        className={cn(props.value === "list" && "bg-muted")}
        onClick={() => props.onChange("list")}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  );
}
