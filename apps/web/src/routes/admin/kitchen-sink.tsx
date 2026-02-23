import { createFileRoute } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the tab components!
const BasicsTab = React.lazy(
  () => import("@/components/admin/kitchen-sink/basics-tab"),
);
const FeedbackTab = React.lazy(
  () => import("@/components/admin/kitchen-sink/feedback-tab"),
);
const ComplexTab = React.lazy(
  () => import("@/components/admin/kitchen-sink/complex-tab"),
);

export const Route = createFileRoute("/admin/kitchen-sink")({
  component: KitchenSinkPage,
});

function KitchenSinkPage() {
  return (
    <div className="space-y-12 animate-in fade-in-50 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">UI Kitchen Sink</h1>
        <p className="text-muted-foreground mt-2">
          A comprehensive showcase of all the custom UI components available in
          this project's design system.
        </p>
      </div>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="basics">Basic Form Elements</TabsTrigger>
          <TabsTrigger value="feedback">Feedback & Alerts</TabsTrigger>
          <TabsTrigger value="complex">
            Complex Data (Tables & Empty)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-8 min-h-[400px]">
          <Suspense
            fallback={
              <Skeleton className="h-[400px] w-full rounded-xl bg-muted/50" />
            }
          >
            <BasicsTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-8 min-h-[400px]">
          <Suspense
            fallback={
              <Skeleton className="h-[400px] w-full rounded-xl bg-muted/50" />
            }
          >
            <FeedbackTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="complex" className="space-y-8 min-h-[400px]">
          <Suspense
            fallback={
              <Skeleton className="h-[400px] w-full rounded-xl bg-muted/50" />
            }
          >
            <ComplexTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
