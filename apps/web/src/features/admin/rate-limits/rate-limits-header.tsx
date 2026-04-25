import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function RateLimitsHeader(props: {
  enabled: boolean;
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rate Limits</h1>
        <p className="text-muted-foreground">
          Control API throttling rules and review recent block counts.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={props.enabled ? "default" : "secondary"}>
          {props.enabled ? "Enabled" : "Disabled"}
        </Badge>
        <Button onClick={props.onSave} disabled={props.isSaving}>
          {props.isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
