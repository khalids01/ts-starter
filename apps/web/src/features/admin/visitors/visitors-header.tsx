import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VisitorsHeaderProps = {
  isRefreshing: boolean;
  onRefresh: () => void;
};

export function VisitorsHeader(props: VisitorsHeaderProps) {
  return (
    <header className="flex min-w-0 flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Visitors</h1>
        <p className="text-sm text-muted-foreground">
          Live traffic quality, visitor behavior, and attribution context.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Admin routes are excluded from tracking.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={props.onRefresh}
        disabled={props.isRefreshing}
      >
        <RefreshCw
          className={cn("h-4 w-4", props.isRefreshing && "animate-spin")}
        />
        Refresh
      </Button>
    </header>
  );
}
