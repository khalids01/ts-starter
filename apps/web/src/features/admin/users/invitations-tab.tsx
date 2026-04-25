import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvitationsListResponse } from "./types";

type InvitationFilters = {
  search: string;
  status: "all" | "accepted" | "pending";
  dateFrom: string;
  dateTo: string;
  page: number;
};

export function InvitationsTab(props: {
  filters: InvitationFilters;
  setFilter: <K extends keyof InvitationFilters>(
    key: K,
    value: InvitationFilters[K],
  ) => void;
  isLoading: boolean;
  data: InvitationsListResponse | undefined;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-sm">
          <label htmlFor="invitation-search" className="mb-1 block text-sm">
            Search by email
          </label>
          <Input
            id="invitation-search"
            placeholder="invitee@example.com"
            value={props.filters.search}
            onChange={(event) => {
              props.setFilter("search", event.target.value);
              props.setFilter("page", 1);
            }}
          />
        </div>

        <div className="w-[180px]">
          <label htmlFor="invitation-status" className="mb-1 block text-sm">
            Status
          </label>
          <Select
            value={props.filters.status}
            onValueChange={(value) => {
              props.setFilter("status", (value as InvitationFilters["status"]) || "all");
              props.setFilter("page", 1);
            }}
          >
            <SelectTrigger id="invitation-status">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="date-from" className="mb-1 block text-sm">
            Expires from
          </label>
          <Input
            id="date-from"
            type="date"
            value={props.filters.dateFrom}
            onChange={(event) => {
              props.setFilter("dateFrom", event.target.value);
              props.setFilter("page", 1);
            }}
          />
        </div>

        <div>
          <label htmlFor="date-to" className="mb-1 block text-sm">
            Expires to
          </label>
          <Input
            id="date-to"
            type="date"
            value={props.filters.dateTo}
            onChange={(event) => {
              props.setFilter("dateTo", event.target.value);
              props.setFilter("page", 1);
            }}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Total Invitations</TableHead>
              <TableHead>Last Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Accepted User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading invitations...
                </TableCell>
              </TableRow>
            ) : props.data?.items.length ? (
              props.data.items.map((item) => (
                <TableRow key={item.email}>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.invitationCount}</TableCell>
                  <TableCell>
                    {item.lastExpiresAt ? new Date(item.lastExpiresAt).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell>
                    {item.status === "accepted" ? (
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        Accepted
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.acceptedUserName || "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No invitations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          disabled={props.filters.page <= 1}
          onClick={() => props.setFilter("page", Math.max(1, props.filters.page - 1))}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {props.data?.page ?? props.filters.page} of {props.data?.pages ?? 1}
        </span>
        <Button
          variant="outline"
          disabled={props.filters.page >= (props.data?.pages ?? 1)}
          onClick={() =>
            props.setFilter(
              "page",
              Math.min(props.data?.pages ?? props.filters.page, props.filters.page + 1),
            )
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
}
