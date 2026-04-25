import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function GlobalSwitchCard(props: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Switch</CardTitle>
        <CardDescription>
          Disable this only when you need to temporarily bypass all rate limits.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <div className="font-medium">Enable rate limiting for the whole API</div>
          <p className="text-sm text-muted-foreground">
            When disabled, all groups are bypassed even if their local toggles remain on.
          </p>
        </div>
        <Switch checked={props.enabled} onCheckedChange={props.onChange} />
      </CardContent>
    </Card>
  );
}
