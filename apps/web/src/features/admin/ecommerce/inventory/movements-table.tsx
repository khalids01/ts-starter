import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InventoryMovement } from "../types";
import { EmptyTableRow, formatDate } from "../ui";

export function MovementsTable(props: { movements: InventoryMovement[]; loading: boolean }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Delta</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.loading ? (
            <EmptyTableRow colSpan={6}>Loading movements...</EmptyTableRow>
          ) : props.movements.length === 0 ? (
            <EmptyTableRow colSpan={6}>No movements found.</EmptyTableRow>
          ) : (
            props.movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>{formatDate(movement.createdAt)}</TableCell>
                <TableCell>{movement.type}</TableCell>
                <TableCell>{movement.variant?.sku ?? "—"}</TableCell>
                <TableCell>{movement.location?.name ?? "—"}</TableCell>
                <TableCell>{movement.delta}</TableCell>
                <TableCell>{movement.reason ?? "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
