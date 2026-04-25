import { Fragment, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { InfoRow } from "./info-row";
import { RelativeTime } from "./relative-time";
import { displayUserName } from "./visitors-helpers";
import type { VisitorItem, VisitorsListResponse } from "./types";

export function VisitorsActivityList(props: {
  data: VisitorsListResponse | undefined;
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <CardTitle>Visitor Activity</CardTitle>
        <CardDescription>Compact list with expandable details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DesktopTable
          data={props.data}
          loading={props.loading}
          expandedRow={expandedRow}
          onToggleRow={(visitorId) => {
            setExpandedRow((current) => (current === visitorId ? null : visitorId));
          }}
        />

        <MobileAccordion data={props.data} loading={props.loading} />

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            disabled={(props.data?.page ?? props.currentPage) <= 1}
            onClick={() => props.onPageChange(Math.max(1, props.currentPage - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {props.data?.page ?? props.currentPage} of {props.data?.pages ?? 1}
          </span>
          <Button
            variant="outline"
            disabled={(props.data?.page ?? props.currentPage) >= (props.data?.pages ?? 1)}
            onClick={() => {
              const next = Math.min(
                props.currentPage + 1,
                props.data?.pages ?? props.currentPage + 1,
              );
              props.onPageChange(next);
            }}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DesktopTable(props: {
  data: VisitorsListResponse | undefined;
  loading: boolean;
  expandedRow: string | null;
  onToggleRow: (visitorId: string) => void;
}) {
  return (
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
            {props.loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading visitors...
                </TableCell>
              </TableRow>
            ) : (props.data?.items.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No visitors found for these filters.
                </TableCell>
              </TableRow>
            ) : (
              props.data?.items.map((item) => {
                const isOpen = props.expandedRow === item.visitorId;

                return (
                  <Fragment key={item.visitorId}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => props.onToggleRow(item.visitorId)}
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
                          <ExpandedDetails item={item} />
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
  );
}

function MobileAccordion(props: {
  data: VisitorsListResponse | undefined;
  loading: boolean;
}) {
  return (
    <div className="md:hidden">
      {props.loading ? (
        <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
          Loading visitors...
        </div>
      ) : (props.data?.items.length ?? 0) === 0 ? (
        <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
          No visitors found for these filters.
        </div>
      ) : (
        <Accordion className="rounded-md border">
          {props.data?.items.map((item) => (
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
                  <ExpandedDetails item={item} showEmail />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

function ExpandedDetails(props: { item: VisitorItem; showEmail?: boolean }) {
  return (
    <div className="grid gap-2 rounded-md border bg-muted/20 p-3 text-sm md:grid-cols-2">
      <InfoRow label="Visitor ID" value={props.item.visitorId} mono />
      <InfoRow label="First seen" value={<RelativeTime value={props.item.firstSeenAt} />} />
      <InfoRow label="Last path" value={props.item.lastPath || "/"} />
      <InfoRow label="Country" value={props.item.country ?? "unknown"} />
      {props.showEmail && props.item.userEmail ? (
        <InfoRow label="Email" value={props.item.userEmail} />
      ) : null}
      <div className="flex flex-wrap gap-2 md:col-span-2">
        {props.item.isBot ? (
          <Badge variant="destructive">Bot</Badge>
        ) : (
          <Badge variant="outline">Human</Badge>
        )}
        {props.item.isLoggedIn ? <Badge>Logged In</Badge> : null}
      </div>
    </div>
  );
}
