import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { VisitorsOverviewResponse } from "./types";

export function VisitorsMetrics(props: {
  overview: VisitorsOverviewResponse | undefined;
  loading: boolean;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        title="Active now"
        value={props.overview?.cards.activeNow}
        loading={props.loading}
        description="Within last 5 minutes"
      />
      <MetricCard
        title="Total visits"
        value={props.overview?.cards.totalVisits}
        loading={props.loading}
        description="Selected range"
      />
      <MetricCard
        title="Unique visitors"
        value={props.overview?.cards.uniqueVisitors}
        loading={props.loading}
        description="Distinct IDs"
      />
      <MetricCard
        title="New visitors"
        value={props.overview?.cards.newVisitors}
        loading={props.loading}
        description="First seen in range"
      />
      <MetricCard
        title="Returning visitors"
        value={props.overview?.cards.returningVisitors}
        loading={props.loading}
        description="Seen before range"
      />
      <MetricCard
        title="Bot visits"
        value={props.overview?.cards.botVisits}
        loading={props.loading}
        description="Bot-like sessions"
      />
    </section>
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
