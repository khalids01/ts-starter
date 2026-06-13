import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InventoryStock } from "../types";
import { EmptyTableRow, formatDate } from "../ui";

export function StockTable(props: { stocks: InventoryStock[]; loading: boolean }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>On hand</TableHead>
            <TableHead>Reserved</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Reorder</TableHead>
            <TableHead>Expiry</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.loading ? (
            <EmptyTableRow colSpan={9}>Loading stock...</EmptyTableRow>
          ) : props.stocks.length === 0 ? (
            <EmptyTableRow colSpan={9}>No stock rows found.</EmptyTableRow>
          ) : (
            props.stocks.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell>{stock.variant?.product?.name ?? "—"}</TableCell>
                <TableCell>{stock.variant?.sku ?? "—"}</TableCell>
                <TableCell>{stock.location?.name ?? "—"}</TableCell>
                <TableCell>{stock.batch?.batchNumber ?? "—"}</TableCell>
                <TableCell>{stock.quantityOnHand}</TableCell>
                <TableCell>{stock.quantityReserved}</TableCell>
                <TableCell>{stock.availableQuantity}</TableCell>
                <TableCell>{stock.reorderLevel ?? "—"}</TableCell>
                <TableCell>{formatDate(stock.batch?.expiryDate)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
