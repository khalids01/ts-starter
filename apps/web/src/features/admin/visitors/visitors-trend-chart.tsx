import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { formatChartTick } from "./visitors-helpers";
import type { VisitorsOverviewResponse } from "./types";

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

export function VisitorsTrendChart(props: {
  series: VisitorsOverviewResponse["series"] | undefined;
}) {
  const chartData = props.series ?? [];
  const shouldShowDots = chartData.length <= 1;

  return (
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
  );
}
