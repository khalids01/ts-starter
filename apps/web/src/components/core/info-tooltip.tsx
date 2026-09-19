import { CircleAlert } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function InfoTooltip(props: { children: string; label?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={props.label ?? "About this field"}
          />
        }
      >
        <CircleAlert className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent className="max-w-72 leading-relaxed">
        {props.children}
      </TooltipContent>
    </Tooltip>
  );
}
