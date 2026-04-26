import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { client } from "@/lib/client";
import { useObject } from "@/hooks/use-object";
import { VisitorsHeader } from "./visitors-header";
import { VisitorsFiltersCard } from "./visitors-filters";
import { VisitorsMetrics } from "./visitors-metrics";
import { VisitorsTrendChart } from "./visitors-trend-chart";
import { VisitorsActivityList } from "./visitors-activity-list";
import { getDefaultDateRange } from "./visitors-helpers";
import type {
  Segment,
  VisitorType,
  VisitorsListResponse,
  VisitorsOverviewResponse,
} from "./types";

export function AdminVisitorsPage() {
  const defaults = useMemo(getDefaultDateRange, []);

  const { object: filters, setObjectValue } = useObject({
    dateFrom: defaults.dateFrom,
    dateTo: defaults.dateTo,
    segment: "humans" as Segment,
    type: "all" as VisitorType,
    page: 1,
    limit: 20,
  });

  const {
    data: overview,
    isLoading: overviewLoading,
    isFetching: overviewFetching,
    refetch: refetchOverview,
  } = useQuery({
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
  });

  const {
    data: listData,
    isLoading: listLoading,
    isFetching: listFetching,
    refetch: refetchList,
  } = useQuery({
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
  });

  const isRefreshing = overviewFetching || listFetching;

  const refreshVisitors = () => {
    void Promise.all([refetchOverview(), refetchList()]);
  };

  return (
    <div className="w-full min-w-0 space-y-6 overflow-x-hidden">
      <VisitorsHeader
        isRefreshing={isRefreshing}
        onRefresh={refreshVisitors}
      />

      <VisitorsFiltersCard
        filters={filters}
        onDateFromChange={(value) => {
          setObjectValue("dateFrom", value);
          setObjectValue("page", 1);
        }}
        onDateToChange={(value) => {
          setObjectValue("dateTo", value);
          setObjectValue("page", 1);
        }}
        onSegmentChange={(value) => {
          setObjectValue("segment", value);
          setObjectValue("page", 1);
        }}
        onTypeChange={(value) => {
          setObjectValue("type", value);
          setObjectValue("page", 1);
        }}
      />

      <VisitorsMetrics overview={overview} loading={overviewLoading} />

      <VisitorsTrendChart series={overview?.series} />

      <VisitorsActivityList
        data={listData}
        loading={listLoading}
        currentPage={filters.page}
        onPageChange={(page) => setObjectValue("page", page)}
      />
    </div>
  );
}
