import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Segment, VisitorType, VisitorsFilters } from "./types";

export function VisitorsFiltersCard(props: {
  filters: VisitorsFilters;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSegmentChange: (value: Segment) => void;
  onTypeChange: (value: VisitorType) => void;
}) {
  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Date range, traffic segment, and visitor type.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <label htmlFor="visitors-date-from" className="mb-1 block text-sm">
            Date from
          </label>
          <Input
            id="visitors-date-from"
            type="date"
            value={props.filters.dateFrom}
            onChange={(event) => props.onDateFromChange(event.target.value)}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="visitors-date-to" className="mb-1 block text-sm">
            Date to
          </label>
          <Input
            id="visitors-date-to"
            type="date"
            value={props.filters.dateTo}
            onChange={(event) => props.onDateToChange(event.target.value)}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="visitors-segment" className="mb-1 block text-sm">
            Segment
          </label>
          <Select
            value={props.filters.segment}
            onValueChange={(value) => props.onSegmentChange(value as Segment)}
          >
            <SelectTrigger id="visitors-segment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="humans">Humans</SelectItem>
              <SelectItem value="bots">Bots</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0">
          <label htmlFor="visitors-type" className="mb-1 block text-sm">
            Visitor type
          </label>
          <Select
            value={props.filters.type}
            onValueChange={(value) => props.onTypeChange(value as VisitorType)}
          >
            <SelectTrigger id="visitors-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="returning">Returning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
