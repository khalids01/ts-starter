import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  id: string;
  label: string;
  count?: number;
};

export function MultiSelect(props: {
  placeholder: string;
  emptyLabel: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}) {
  const selected = props.options.filter((option) => props.value.includes(option.id));
  const selectedIds = new Set(props.value);

  const toggle = (id: string) => {
    props.onChange(
      selectedIds.has(id)
        ? props.value.filter((item) => item !== id)
        : [...new Set([...props.value, id])],
    );
  };

  return (
    <div className={props.className}>
      <Popover>
        <PopoverTrigger render={<Button type="button" variant="outline" className="h-auto min-h-11 w-full justify-between gap-2 px-3 py-2 text-left" />}>
          <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {selected.length > 0 ? (
              selected.slice(0, 3).map((option) => (
                <span
                  key={option.id}
                  className="inline-flex max-w-full items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium"
                >
                  <span className="truncate">{option.label}</span>
                  <button
                    type="button"
                    className="rounded-sm text-muted-foreground hover:cursor-pointer hover:text-foreground"
                    aria-label={`Remove ${option.label}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      props.onChange(props.value.filter((id) => id !== option.id));
                    }}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="py-1 text-sm font-normal text-muted-foreground">{props.placeholder}</span>
            )}
            {selected.length > 3 ? (
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                +{selected.length - 3}
              </span>
            ) : null}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--anchor-width) gap-1 p-1.5 text-sm">
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full justify-start gap-2 px-2 py-2 text-left"
            onClick={() => props.onChange([])}
          >
            <Check className={cn("size-4", props.value.length === 0 ? "opacity-100" : "opacity-0")} />
            <span>{props.emptyLabel}</span>
          </Button>
          {props.options.map((option) => {
            const isSelected = selectedIds.has(option.id);
            return (
              <Button
                key={option.id}
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start gap-2 px-2 py-2 text-left"
                onClick={() => toggle(option.id)}
              >
                <Check className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")} />
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {typeof option.count === "number" ? (
                  <span className="text-xs text-muted-foreground">{option.count}</span>
                ) : null}
              </Button>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}
