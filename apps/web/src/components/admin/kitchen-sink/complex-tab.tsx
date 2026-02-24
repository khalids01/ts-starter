import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FolderOpen } from "lucide-react";

export default function ComplexTab() {
  return (
    <div className="space-y-8">
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
            Rendered via the table component with full styling for tabular data.
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

      {/* Accordions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Accordions</CardTitle>
          <CardDescription>
            Vertically stacked interactive headings that reveal more details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion defaultValue={["item-1"]}>
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it animated?</AccordionTrigger>
              <AccordionContent>
                Yes. It's animated by default, but you can disable it if you
                prefer.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Can I use it on multiple elements?
              </AccordionTrigger>
              <AccordionContent>
                Absolutely. You can place as many accordions on a page as you
                want.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
