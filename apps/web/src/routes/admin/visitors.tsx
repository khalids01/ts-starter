import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { client } from "@/lib/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
import { useObject } from "@/hooks/use-object";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/visitors")({
  component: AdminVisitorsPage,
});

type Segment = "humans" | "bots" | "all";
type VisitorType = "all" | "new" | "returning";

type VisitorsOverviewResponse = {
  filters: {
    dateFrom: string;
    dateTo: string;
    segment: Segment;
    type: VisitorType;
  };
  cards: {
    activeNow: number;
    totalVisits: number;
    uniqueVisitors: number;
    newVisitors: number;
    returningVisitors: number;
    botVisits: number;
  };
  series: Array<{
    date: string;
    visits: number;
    uniqueVisitors: number;
    newVisitors: number;
    returningVisitors: number;
    botVisits: number;
  }>;
};

type VisitorsListResponse = {
  items: Array<{
    visitorId: string;
    firstSeenAt: string;
    lastSeenAt: string;
    lastSeenInRange: string;
    visitsCount: number;
    lastPath: string;
    isLoggedIn: boolean;
    deviceType: string | null;
    country: string | null;
    isBot: boolean;
  }>;
  total: number;
  pages: number;
  page: number;
  limit: number;
};

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 29);

  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}

function AdminVisitorsPage() {
  const defaults = useMemo(getDefaultDateRange, []);

  const { object: filters, setObjectValue } = useObject({
    dateFrom: defaults.dateFrom,
    dateTo: defaults.dateTo,
    segment: "humans" as Segment,
    type: "all" as VisitorType,
    page: 1,
    limit: 20,
  });

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: queryKeys.admin.visitors.overview({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      segment: filters.segment,
      type: filters.type,
    }),
    queryFn: async () => {
      const { data, error } = await client.admin.visitors.overview.get({
        query: {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          segment: filters.segment,
          type: filters.type,
        },
      });

      if (error) {
        throw new Error("Failed to load visitors overview");
      }

      return data as VisitorsOverviewResponse;
    },
    refetchInterval: 15_000,
  });

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: queryKeys.admin.visitors.list({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      segment: filters.segment,
      type: filters.type,
      page: filters.page,
      limit: filters.limit,
    }),
    queryFn: async () => {
      const { data, error } = await client.admin.visitors.list.get({
        query: {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          segment: filters.segment,
          type: filters.type,
          page: filters.page,
          limit: filters.limit,
        },
      });

      if (error) {
        throw new Error("Failed to load visitors list");
      }

      return data as VisitorsListResponse;
    },
    refetchInterval: 15_000,
  });

  const chartConfig = {
    visits: { label: "Visits", color: "hsl(var(--chart-1))" },
    uniqueVisitors: {
      label: "Unique",
      color: "hsl(var(--chart-2))",
    },
    newVisitors: { label: "New", color: "hsl(var(--chart-3))" },
    returningVisitors: {
      label: "Returning",
      color: "hsl(var(--chart-4))",
    },
    botVisits: { label: "Bots", color: "hsl(var(--chart-5))" },
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visitors</h1>
          <p className="text-muted-foreground">
            Track active traffic, visitor sessions, and bot activity.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Segment your analytics by date range, traffic type, and visitor age.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <div>
            <label htmlFor="visitors-date-from" className="mb-1 block text-sm">
              Date from
            </label>
            <Input
              id="visitors-date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(event) => {
                setObjectValue("dateFrom", event.target.value);
                setObjectValue("page", 1);
              }}
            />
          </div>

          <div>
            <label htmlFor="visitors-date-to" className="mb-1 block text-sm">
              Date to
            </label>
            <Input
              id="visitors-date-to"
              type="date"
              value={filters.dateTo}
              onChange={(event) => {
                setObjectValue("dateTo", event.target.value);
                setObjectValue("page", 1);
              }}
            />
          </div>

          <div className="w-[180px]">
            <label htmlFor="visitors-segment" className="mb-1 block text-sm">
              Segment
            </label>
            <Select
              value={filters.segment}
              onValueChange={(value) => {
                setObjectValue("segment", value as Segment);
                setObjectValue("page", 1);
              }}
            >
              <SelectTrigger id="visitors-segment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="humans">Humans</SelectItem>
                <SelectItem value="bots">Bots</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[180px]">
            <label htmlFor="visitors-type" className="mb-1 block text-sm">
              Visitor type
            </label>
            <Select
              value={filters.type}
              onValueChange={(value) => {
                setObjectValue("type", value as VisitorType);
                setObjectValue("page", 1);
              }}
            >
              <SelectTrigger id="visitors-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="returning">Returning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Active Now"
          value={overview?.cards.activeNow}
          loading={overviewLoading}
          description="Last 5 minutes"
        />
        <MetricCard
          title="Total Visits"
          value={overview?.cards.totalVisits}
          loading={overviewLoading}
          description="Within selected date range"
        />
        <MetricCard
          title="Unique Visitors"
          value={overview?.cards.uniqueVisitors}
          loading={overviewLoading}
          description="Distinct visitor IDs"
        />
        <MetricCard
          title="New Visitors"
          value={overview?.cards.newVisitors}
          loading={overviewLoading}
          description="First seen in range"
        />
        <MetricCard
          title="Returning Visitors"
          value={overview?.cards.returningVisitors}
          loading={overviewLoading}
          description="Seen before selected range"
        />
        <MetricCard
          title="Bot Visits"
          value={overview?.cards.botVisits}
          loading={overviewLoading}
          description="Counted from sessions"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitors Trend</CardTitle>
          <CardDescription>Daily metrics for selected filters.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <LineChart data={overview?.series ?? []} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="visits"
                type="monotone"
                stroke="var(--color-visits)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="uniqueVisitors"
                type="monotone"
                stroke="var(--color-uniqueVisitors)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="newVisitors"
                type="monotone"
                stroke="var(--color-newVisitors)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="returningVisitors"
                type="monotone"
                stroke="var(--color-returningVisitors)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="botVisits"
                type="monotone"
                stroke="var(--color-botVisits)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visitors List</CardTitle>
          <CardDescription>
            Paginated visitor identities with latest activity context.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>First Seen</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Last Path</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Loading visitors...
                    </TableCell>
                  </TableRow>
                ) : (listData?.items.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No visitors found for these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  listData?.items.map((item) => (
                    <TableRow key={item.visitorId}>
                      <TableCell className="font-mono text-xs">
                        {item.visitorId.slice(0, 12)}...
                      </TableCell>
                      <TableCell>{new Date(item.firstSeenAt).toLocaleString()}</TableCell>
                      <TableCell>{new Date(item.lastSeenInRange).toLocaleString()}</TableCell>
                      <TableCell>{item.visitsCount}</TableCell>
                      <TableCell className="max-w-[220px] truncate">{item.lastPath}</TableCell>
                      <TableCell>{item.deviceType ?? "unknown"}</TableCell>
                      <TableCell>{item.country ?? "unknown"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {item.isBot ? (
                            <Badge variant="destructive">Bot</Badge>
                          ) : (
                            <Badge variant="outline">Human</Badge>
                          )}
                          {item.isLoggedIn && <Badge>Logged In</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              disabled={(listData?.page ?? filters.page) <= 1}
              onClick={() => setObjectValue("page", Math.max(1, filters.page - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {listData?.page ?? filters.page} of {listData?.pages ?? 1}
            </span>
            <Button
              variant="outline"
              disabled={(listData?.page ?? filters.page) >= (listData?.pages ?? 1)}
              onClick={() => {
                const next = Math.min(filters.page + 1, listData?.pages ?? filters.page + 1);
                setObjectValue("page", next);
              }}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard(props: {
  title: string;
  value: number | undefined;
  description: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {props.loading ? (
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        ) : (
          <div className="text-2xl font-bold">{props.value ?? 0}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{props.description}</p>
      </CardContent>
    </Card>
  );
}
