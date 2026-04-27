import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryKeys } from "@/constants/query-keys";
import { useObject } from "@/hooks/use-object";
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";

type WebhookStatus = "processing" | "processed" | "failed";
type StatusFilter = "all" | WebhookStatus;

type WebhookEventItem = {
  id: string;
  provider: string;
  eventId: string;
  eventType: string;
  status: WebhookStatus;
  attemptCount: number;
  errorMessage: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type WebhookEventsResponse = {
  items: WebhookEventItem[];
  total: number;
  pages: number;
  page: number;
  limit: number;
};

const statusVariant: Record<
  WebhookStatus,
  "default" | "secondary" | "destructive"
> = {
  processing: "default",
  processed: "secondary",
  failed: "destructive",
};

export function AdminWebhooksPage() {
  const { object: filters, setObjectValue } = useObject({
    status: "all" as StatusFilter,
    eventType: "",
    page: 1,
    limit: 20,
  });

  const queryParams = useMemo(
    () => ({
      page: filters.page,
      limit: filters.limit,
      status: filters.status,
      eventType: filters.eventType.trim(),
    }),
    [filters.eventType, filters.limit, filters.page, filters.status],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: queryKeys.admin.webhooks.list(queryParams),
    queryFn: async () => {
      const { data, error } = await client.admin.webhooks.get({
        query: {
          page: filters.page,
          limit: filters.limit,
          status: filters.status === "all" ? undefined : filters.status,
          eventType: filters.eventType.trim() || undefined,
        },
      });

      if (error) {
        throw new Error("Failed to load webhook events");
      }

      return data as WebhookEventsResponse;
    },
  });

  return (
    <div className="w-full min-w-0 space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Webhooks
          </h1>
          <p className="text-sm text-muted-foreground">
            Polar webhook delivery processing, retries, and failures.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={filters.eventType}
            placeholder="Filter event type"
            className="w-full sm:w-[240px]"
            onChange={(event) => {
              setObjectValue("eventType", event.target.value);
              setObjectValue("page", 1);
            }}
          />
          <Select
            value={filters.status}
            onValueChange={(value) => {
              setObjectValue("status", value as StatusFilter);
              setObjectValue("page", 1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="gap-2"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Webhook Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              Loading webhook events...
            </div>
          ) : data?.items.length ? (
            <div className="divide-y">
              {data.items.map((item) => (
                <WebhookRow key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No webhook events found for these filters.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          disabled={(data?.page ?? filters.page) <= 1}
          onClick={() => setObjectValue("page", Math.max(1, filters.page - 1))}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {data?.page ?? filters.page} of {data?.pages ?? 1}
        </span>
        <Button
          variant="outline"
          disabled={(data?.page ?? filters.page) >= (data?.pages ?? 1)}
          onClick={() =>
            setObjectValue(
              "page",
              Math.min(data?.pages ?? filters.page, filters.page + 1),
            )
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function WebhookRow({ item }: { item: WebhookEventItem }) {
  return (
    <div className="grid gap-3 px-6 py-4 lg:grid-cols-[1fr_auto] lg:items-start">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
          <Badge variant="outline">{item.provider}</Badge>
          <Badge variant="outline">{item.eventType}</Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="break-all text-sm font-medium">{item.eventId}</div>
        {item.errorMessage ? (
          <div className="break-words text-sm text-destructive">
            {item.errorMessage}
          </div>
        ) : null}
      </div>
      <dl className="grid min-w-0 gap-1 text-xs text-muted-foreground lg:min-w-[240px]">
        <InfoRow label="Attempts" value={String(item.attemptCount)} />
        <InfoRow label="Created" value={formatDate(item.createdAt)} />
        <InfoRow label="Updated" value={formatDate(item.updatedAt)} />
        <InfoRow
          label="Processed"
          value={item.processedAt ? formatDate(item.processedAt) : "Not yet"}
        />
      </dl>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 gap-2 lg:justify-end">
      <dt className="shrink-0 font-medium">{label}:</dt>
      <dd className="min-w-0 truncate">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

