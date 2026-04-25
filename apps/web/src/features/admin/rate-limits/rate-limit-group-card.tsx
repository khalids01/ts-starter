import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { GroupKey } from "./constants";
import type { RateLimitConfig, RateLimitOverview } from "./types";

export function RateLimitGroupCard(props: {
  group: {
    key: GroupKey;
    title: string;
    description: string;
  };
  config: RateLimitConfig;
  stats: RateLimitOverview["stats"];
  onGroupEnabledChange: (group: GroupKey, enabled: boolean) => void;
  onWindowChange: (group: GroupKey, windowSeconds: number) => void;
  onMaxRequestsChange: (group: GroupKey, maxRequests: number) => void;
}) {
  const groupConfig = props.config.groups[props.group.key];
  const groupStats = props.stats[props.group.key];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{props.group.title}</CardTitle>
            <CardDescription>{props.group.description}</CardDescription>
          </div>
          <Switch
            checked={groupConfig.enabled}
            onCheckedChange={(checked) => props.onGroupEnabledChange(props.group.key, checked)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${props.group.key}-window`}>Window Seconds</Label>
            <Input
              id={`${props.group.key}-window`}
              type="number"
              min={1}
              value={groupConfig.windowSeconds}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10) || 1;
                props.onWindowChange(props.group.key, value);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${props.group.key}-max`}>Max Requests</Label>
            <Input
              id={`${props.group.key}-max`}
              type="number"
              min={1}
              value={groupConfig.maxRequests}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10) || 1;
                props.onMaxRequestsChange(props.group.key, value);
              }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">Blocked Last Hour</div>
            <div className="mt-1 text-2xl font-semibold">{groupStats.blockedLastHour}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">Blocked Today</div>
            <div className="mt-1 text-2xl font-semibold">{groupStats.blockedToday}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
