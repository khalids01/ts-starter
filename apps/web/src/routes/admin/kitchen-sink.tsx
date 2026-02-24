import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import BasicsTab from "@/components/admin/kitchen-sink/basics-tab";
import FormsAdvancedTab from "@/components/admin/kitchen-sink/forms-advanced-tab";
import FeedbackTab from "@/components/admin/kitchen-sink/feedback-tab";
import OverlaysTab from "@/components/admin/kitchen-sink/overlays-tab";
import DataDisplayTab from "@/components/admin/kitchen-sink/data-display-tab";
import ComplexTab from "@/components/admin/kitchen-sink/complex-tab";

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
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="basics">Basic Form Elements</TabsTrigger>
          <TabsTrigger value="forms">Advanced Forms</TabsTrigger>
          <TabsTrigger value="feedback">Feedback & Alerts</TabsTrigger>
          <TabsTrigger value="overlays">Overlays & Dialogs</TabsTrigger>
          <TabsTrigger value="data">Data Display</TabsTrigger>
          <TabsTrigger value="complex">Complex Data</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-8 min-h-[400px]">
          <BasicsTab />
        </TabsContent>

        <TabsContent value="forms" className="space-y-8 min-h-[400px]">
          <FormsAdvancedTab />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-8 min-h-[400px]">
          <FeedbackTab />
        </TabsContent>

        <TabsContent value="overlays" className="space-y-8 min-h-[400px]">
          <OverlaysTab />
        </TabsContent>

        <TabsContent value="data" className="space-y-8 min-h-[400px]">
          <DataDisplayTab />
        </TabsContent>

        <TabsContent value="complex" className="space-y-8 min-h-[400px]">
          <ComplexTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
