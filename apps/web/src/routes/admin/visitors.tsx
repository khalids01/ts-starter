import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useEffect, useState, Fragment, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNowStrict } from "date-fns";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

type VisitorItem = {
  visitorId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastSeenInRange: string;
  visitsCount: number;
  lastPath: string;
  isLoggedIn: boolean;
  userName: string | null;
  userEmail: string | null;
  deviceType: string | null;
  country: string | null;
  isBot: boolean;
};

type VisitorsListResponse = {
  items: VisitorItem[];
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

function displayUserName(item: VisitorItem) {
  if (item.userName) {
    return item.userName;
  }

  if (item.userEmail) {
    return item.userEmail;
  }

  return "Anonymous";
}

function formatChartTick(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return format(parsed, "MMM d");
}

function AdminVisitorsPage() {
  const defaults = useMemo(getDefaultDateRange, []);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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

  const chartData = overview?.series ?? [];
  const shouldShowDots = chartData.length <= 1;

  return (
    <div className="w-full min-w-0 space-y-6 overflow-x-hidden">
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
      </header>

      <Card className="w-full min-w-0">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Date range, traffic segment, and visitor type.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
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

          <div className="min-w-0">
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

          <div className="min-w-0">
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

          <div className="min-w-0">
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Active now"
          value={overview?.cards.activeNow}
          loading={overviewLoading}
          description="Within last 5 minutes"
        />
        <MetricCard
          title="Total visits"
          value={overview?.cards.totalVisits}
          loading={overviewLoading}
          description="Selected range"
        />
        <MetricCard
          title="Unique visitors"
          value={overview?.cards.uniqueVisitors}
          loading={overviewLoading}
          description="Distinct IDs"
        />
        <MetricCard
          title="New visitors"
          value={overview?.cards.newVisitors}
          loading={overviewLoading}
          description="First seen in range"
        />
        <MetricCard
          title="Returning visitors"
          value={overview?.cards.returningVisitors}
          loading={overviewLoading}
          description="Seen before range"
        />
        <MetricCard
          title="Bot visits"
          value={overview?.cards.botVisits}
          loading={overviewLoading}
          description="Bot-like sessions"
        />
      </section>

      <Card className="w-full min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Visitors Trend</CardTitle>
          <CardDescription>Daily pattern for selected filters.</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <ChartContainer
            config={chartConfig}
            className="h-[320px] min-h-[320px] min-w-0 w-full overflow-hidden"
          >
            <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatChartTick}
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
                dot={shouldShowDots}
              />
              <Line
                dataKey="uniqueVisitors"
                type="monotone"
                stroke="var(--color-uniqueVisitors)"
                strokeWidth={2}
                dot={shouldShowDots}
              />
              <Line
                dataKey="newVisitors"
                type="monotone"
                stroke="var(--color-newVisitors)"
                strokeWidth={2}
                dot={shouldShowDots}
              />
              <Line
                dataKey="returningVisitors"
                type="monotone"
                stroke="var(--color-returningVisitors)"
                strokeWidth={2}
                dot={shouldShowDots}
              />
              <Line
                dataKey="botVisits"
                type="monotone"
                stroke="var(--color-botVisits)"
                strokeWidth={2}
                dot={shouldShowDots}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="w-full min-w-0">
        <CardHeader>
          <CardTitle>Visitor Activity</CardTitle>
          <CardDescription>
            Compact list with expandable details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="hidden md:block">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Loading visitors...
                      </TableCell>
                    </TableRow>
                  ) : (listData?.items.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No visitors found for these filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    listData?.items.map((item) => {
                      const isOpen = expandedRow === item.visitorId;

                      return (
                        <Fragment key={item.visitorId}>
                          <TableRow
                            className="cursor-pointer"
                            onClick={() => {
                              setExpandedRow((current) =>
                                current === item.visitorId ? null : item.visitorId,
                              );
                            }}
                          >
                            <TableCell>
                              <RelativeTime value={item.lastSeenInRange} />
                            </TableCell>
                            <TableCell>{item.visitsCount}</TableCell>
                            <TableCell>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{displayUserName(item)}</p>
                                {item.userEmail ? (
                                  <p className="truncate text-xs text-muted-foreground">
                                    {item.userEmail}
                                  </p>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell>{item.deviceType ?? "unknown"}</TableCell>
                          </TableRow>

                          {isOpen ? (
                            <TableRow>
                              <TableCell colSpan={4}>
                                <div className="grid gap-2 rounded-md border bg-muted/20 p-3 text-sm md:grid-cols-2">
                                  <Info label="Visitor ID" value={item.visitorId} mono />
                                  <Info
                                    label="First seen"
                                    value={<RelativeTime value={item.firstSeenAt} />}
                                  />
                                  <Info label="Last path" value={item.lastPath || "/"} />
                                  <Info label="Country" value={item.country ?? "unknown"} />
                                  <div className="flex flex-wrap gap-2 md:col-span-2">
                                    {item.isBot ? (
                                      <Badge variant="destructive">Bot</Badge>
                                    ) : (
                                      <Badge variant="outline">Human</Badge>
                                    )}
                                    {item.isLoggedIn ? <Badge>Logged In</Badge> : null}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="md:hidden">
            {listLoading ? (
              <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
                Loading visitors...
              </div>
            ) : (listData?.items.length ?? 0) === 0 ? (
              <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
                No visitors found for these filters.
              </div>
            ) : (
              <Accordion className="rounded-md border">
                {listData?.items.map((item) => (
                  <AccordionItem key={item.visitorId} value={item.visitorId} className="px-3">
                    <AccordionTrigger className="py-3 text-sm no-underline hover:no-underline">
                      <div className="grid w-full min-w-0 grid-cols-2 gap-2 pr-3 text-left">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Last seen</p>
                          <p className="truncate font-medium">
                            <RelativeTime value={item.lastSeenInRange} />
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">User</p>
                          <p className="truncate font-medium">{displayUserName(item)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Visits</p>
                          <p className="font-medium">{item.visitsCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Device</p>
                          <p className="font-medium">{item.deviceType ?? "unknown"}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-2 pb-3 text-sm">
                        <Info label="Visitor ID" value={item.visitorId} mono />
                        <Info
                          label="First seen"
                          value={<RelativeTime value={item.firstSeenAt} />}
                        />
                        <Info label="Last path" value={item.lastPath || "/"} />
                        <Info label="Country" value={item.country ?? "unknown"} />
                        {item.userEmail ? <Info label="Email" value={item.userEmail} /> : null}
                        <div className="mt-1 flex flex-wrap gap-2">
                          {item.isBot ? (
                            <Badge variant="destructive">Bot</Badge>
                          ) : (
                            <Badge variant="outline">Human</Badge>
                          )}
                          {item.isLoggedIn ? <Badge>Logged In</Badge> : null}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
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
                const next = Math.min(
                  filters.page + 1,
                  listData?.pages ?? filters.page + 1,
                );
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

function RelativeTime({ value }: { value: string }) {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);

    const intervalId = window.setInterval(() => {
      setTick((current) => current + 1);
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  if (!mounted) {
    return <span className="text-muted-foreground">--</span>;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return <span className="text-muted-foreground">--</span>;
  }

  // `tick` intentionally forces periodic rerender for live relative text.
  void tick;

  return <>{formatDistanceToNowStrict(date, { addSuffix: true })}</>;
}

function Info(props: {
  label: string;
  value: string | ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{props.label}</p>
      <p className={`truncate ${props.mono ? "font-mono text-xs" : ""}`}>{props.value}</p>
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
    <Card className="w-full min-w-0">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {props.loading ? (
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        ) : (
          <div className="text-2xl font-bold">{props.value ?? 0}</div>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{props.description}</p>
      </CardContent>
    </Card>
  );
}
