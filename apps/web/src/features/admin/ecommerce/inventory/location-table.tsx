import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InventoryLocation } from "../types";
import { EmptyTableRow, StatusBadge } from "../ui";

export function LocationTable(props: {
  locations: InventoryLocation[];
  loading: boolean;
  canManage: boolean;
  onEdit: (location: InventoryLocation) => void;
  onDisable: (id: string) => void;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Stock rows</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.loading ? (
            <EmptyTableRow colSpan={5}>Loading locations...</EmptyTableRow>
          ) : props.locations.length === 0 ? (
            <EmptyTableRow colSpan={5}>No locations found.</EmptyTableRow>
          ) : (
            props.locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell>{location.code}</TableCell>
                <TableCell>{location.stockCount ?? 0}</TableCell>
                <TableCell><StatusBadge active={location.isActive} /></TableCell>
                <TableCell className="text-right">
                  {props.canManage ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => props.onEdit(location)}>Edit</Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => props.onDisable(location.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
