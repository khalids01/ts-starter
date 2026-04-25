import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { queryKeys } from "@/constants/query-keys";
import { client } from "@/lib/client";
import { GROUPS, type GroupKey } from "./constants";
import type { RateLimitConfig, RateLimitOverview } from "./types";
import { RateLimitsHeader } from "./rate-limits-header";
import { GlobalSwitchCard } from "./global-switch-card";
import { RateLimitGroupCard } from "./rate-limit-group-card";
import { ChangeMetadataCard } from "./change-metadata-card";

export function AdminRateLimitsPage() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<RateLimitConfig | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.rateLimit(),
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
      queryClient.setQueryData(queryKeys.admin.rateLimit(), nextData);
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
      <RateLimitsHeader
        enabled={draft.enabled}
        isSaving={updateMutation.isPending}
        onSave={() => updateMutation.mutate(draft)}
      />

      <GlobalSwitchCard
        enabled={draft.enabled}
        onChange={(enabled) => setDraft((current) => (current ? { ...current, enabled } : current))}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {GROUPS.map((group) => (
          <RateLimitGroupCard
            key={group.key}
            group={group}
            config={draft}
            stats={data.stats}
            onGroupEnabledChange={(groupKey, enabled) => {
              setDraft((current) => updateGroup(current, groupKey, { enabled }));
            }}
            onWindowChange={(groupKey, windowSeconds) => {
              setDraft((current) => updateGroup(current, groupKey, { windowSeconds }));
            }}
            onMaxRequestsChange={(groupKey, maxRequests) => {
              setDraft((current) => updateGroup(current, groupKey, { maxRequests }));
            }}
          />
        ))}
      </div>

      <ChangeMetadataCard updatedAt={data.updatedAt} />
    </div>
  );
}

function updateGroup(
  current: RateLimitConfig | null,
  groupKey: GroupKey,
  patch: Partial<RateLimitConfig["groups"][GroupKey]>,
) {
  if (!current) {
    return current;
  }

  return {
    ...current,
    groups: {
      ...current.groups,
      [groupKey]: {
        ...current.groups[groupKey],
        ...patch,
      },
    },
  };
}
