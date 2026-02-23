import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyContent,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FolderOpen,
  Settings,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

        <TabsContent value="basics" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buttons */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Primary actions and variants.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button disabled>Disabled</Button>
                <Button variant="default">
                  <Settings className="mr-2 h-4 w-4" /> With Icon
                </Button>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Status indicators and tags.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </CardContent>
            </Card>

            {/* Form Inputs */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Inputs & Toggles</CardTitle>
                <CardDescription>
                  Text inputs, checkboxes, and switches.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="name@example.com"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" />
                  <Label htmlFor="airplane-mode">Airplane Mode</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Alerts */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>
                  System messages and alerts for users.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Your changes have been saved successfully to the database.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Something went wrong while trying to connect to the server.
                    Please try again later.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Skeletons */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Loading Skeletons</CardTitle>
                <CardDescription>
                  Placeholder states displayed while data is fetching from the
                  server.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-[125px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[80%]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="complex" className="space-y-8">
          {/* Empty States */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Empty States</CardTitle>
              <CardDescription>
                Used when a list, table, or screen has no data to display.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg bg-background p-4 flex items-center justify-center min-h-[300px]">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FolderOpen className="h-4 w-4" />
                    </EmptyMedia>
                    <EmptyTitle>No projects found</EmptyTitle>
                    <EmptyDescription>
                      Get started by creating your first project here.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="default" className="mt-4">
                      Create Project
                    </Button>
                  </EmptyContent>
                </Empty>
              </div>

              <div className="border border-dashed rounded-lg bg-muted/20 p-4 flex items-center justify-center min-h-[300px]">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia>
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl">
                        👻
                      </div>
                    </EmptyMedia>
                    <EmptyTitle>It's quiet in here...</EmptyTitle>
                    <EmptyDescription>
                      You have no active notifications or alerts.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline" className="mt-4">
                      Refresh Page
                    </Button>
                  </EmptyContent>
                </Empty>
              </div>
            </CardContent>
          </Card>

          {/* Data Tables */}
          <Card className="shadow-sm overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle>Data Tables</CardTitle>
              <CardDescription>
                Rendered via the table component with full styling for tabular
                data.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="rounded-md border h-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Invoice</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">INV001</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Paid</Badge>
                      </TableCell>
                      <TableCell>Credit Card</TableCell>
                      <TableCell className="text-right font-medium">
                        $250.00
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV002</TableCell>
                      <TableCell>
                        <Badge variant="outline">Pending</Badge>
                      </TableCell>
                      <TableCell>PayPal</TableCell>
                      <TableCell className="text-right font-medium">
                        $150.00
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV003</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Unpaid</Badge>
                      </TableCell>
                      <TableCell>Bank Transfer</TableCell>
                      <TableCell className="text-right font-medium">
                        $350.00
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
