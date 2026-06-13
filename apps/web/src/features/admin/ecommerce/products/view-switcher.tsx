import { LayoutGrid, List } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import type { ProductViewMode } from "./view-store";

export function ProductsViewSwitcher(props: {
  value: ProductViewMode;
  onChange: (value: ProductViewMode) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={props.value}
      onValueChange={(value) => {
        if (value === "grid" || value === "list") {
          props.onChange(value);
        }
      }}
      variant="outline"
      size="sm"
      className="shrink-0"
    >
      <ToggleGroupItem value="grid" aria-label="Grid view" title="Grid view">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view" title="List view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
