import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/client";
import Loader from "@/components/loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/rate-limits")({
  component: AdminRateLimitsPage,
});

const GROUPS = [
  {
    key: "public",
    title: "Public API",
    description: "Anonymous requests like setup checks and unauthenticated endpoints.",
  },
  {
    key: "auth",
    title: "Auth API",
    description: "Login, signup, email checks, and Better Auth endpoints.",
  },
  {
    key: "protected",
    title: "Protected API",
    description: "Signed-in non-admin traffic such as user actions and account features.",
  },
  {
    key: "admin",
    title: "Admin API",
    description: "Dashboard and admin-only endpoints.",
  },
  {
    key: "special",
    title: "Special Endpoints",
    description: "Webhooks and websocket-related traffic with separate operational needs.",
  },
] as const;

type GroupKey = (typeof GROUPS)[number]["key"];

type RateLimitConfig = {
  enabled: boolean;
  groups: Record<
    GroupKey,
    {
      enabled: boolean;
      windowSeconds: number;
      maxRequests: number;
    }
  >;
};

type RateLimitOverview = {
  config: RateLimitConfig;
  stats: Record<
    GroupKey,
    {
      blockedLastHour: number;
      blockedToday: number;
    }
  >;
  updatedAt: string;
};

function AdminRateLimitsPage() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<RateLimitConfig | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-rate-limit"],
    queryFn: async () => {
      const response = await client.admin["rate-limit"].get();
      if (response.error) {
        throw new Error("Failed to load rate limit settings");
      }

      return response.data as RateLimitOverview;
    },
  });

  useEffect(() => {
    if (data) {
      setDraft(data.config);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (payload: RateLimitConfig) => {
      const response = await client.admin["rate-limit"].patch(payload);
      if (response.error) {
        throw new Error("Failed to update rate limit settings");
      }

      return response.data as RateLimitOverview;
    },
    onSuccess: (nextData) => {
      toast.success("Rate limit settings updated");
      queryClient.setQueryData(["admin-rate-limit"], nextData);
      setDraft(nextData.config);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading || !draft || !data) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Limits</h1>
          <p className="text-muted-foreground">
            Control API throttling rules and review recent block counts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={draft.enabled ? "default" : "secondary"}>
            {draft.enabled ? "Enabled" : "Disabled"}
          </Badge>
          <Button
            onClick={() => updateMutation.mutate(draft)}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

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
          <Switch
            checked={draft.enabled}
            onCheckedChange={(checked) =>
              setDraft((current) =>
                current
                  ? {
                    ...current,
                    enabled: checked,
                  }
                  : current,
              )
            }
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {GROUPS.map((group) => (
          <Card key={group.key}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{group.title}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </div>
                <Switch
                  checked={draft.groups[group.key].enabled}
                  onCheckedChange={(checked) =>
                    setDraft((current) =>
                      current
                        ? {
                          ...current,
                          groups: {
                            ...current.groups,
                            [group.key]: {
                              ...current.groups[group.key],
                              enabled: checked,
                            },
                          },
                        }
                        : current,
                    )
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${group.key}-window`}>Window Seconds</Label>
                  <Input
                    id={`${group.key}-window`}
                    type="number"
                    min={1}
                    value={draft.groups[group.key].windowSeconds}
                    onChange={(event) => {
                      const value = Number.parseInt(event.target.value, 10) || 1;
                      setDraft((current) =>
                        current
                          ? {
                            ...current,
                            groups: {
                              ...current.groups,
                              [group.key]: {
                                ...current.groups[group.key],
                                windowSeconds: value,
                              },
                            },
                          }
                          : current,
                      );
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${group.key}-max`}>Max Requests</Label>
                  <Input
                    id={`${group.key}-max`}
                    type="number"
                    min={1}
                    value={draft.groups[group.key].maxRequests}
                    onChange={(event) => {
                      const value = Number.parseInt(event.target.value, 10) || 1;
                      setDraft((current) =>
                        current
                          ? {
                            ...current,
                            groups: {
                              ...current.groups,
                              [group.key]: {
                                ...current.groups[group.key],
                                maxRequests: value,
                              },
                            },
                          }
                          : current,
                      );
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Blocked Last Hour</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {data.stats[group.key].blockedLastHour}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Blocked Today</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {data.stats[group.key].blockedToday}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Last updated: {new Date(data.updatedAt).toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
