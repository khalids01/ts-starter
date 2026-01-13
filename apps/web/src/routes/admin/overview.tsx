import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export const Route = createFileRoute("/admin/overview")({
  component: OverviewPage,
});

function OverviewPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const { data, error } = await client.admin.metadata.overview.get();
      if (error)
        throw new Error(
          error.value ? JSON.stringify(error.value) : "Unknown error"
        );
      return data as { totalUsers: number };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse bg-muted rounded" />
            ) : (
              <div className="text-2xl font-bold">
                {overview?.totalUsers ?? 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Across the whole platform
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
