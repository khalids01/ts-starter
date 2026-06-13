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
import type { InventorySupplier } from "../types";
import { EmptyTableRow, StatusBadge } from "../ui";

export function SupplierTable(props: {
  suppliers: InventorySupplier[];
  loading: boolean;
  canManage: boolean;
  onEdit: (supplier: InventorySupplier) => void;
  onDisable: (id: string) => void;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Batches</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.loading ? (
            <EmptyTableRow colSpan={5}>Loading suppliers...</EmptyTableRow>
          ) : props.suppliers.length === 0 ? (
            <EmptyTableRow colSpan={5}>No suppliers found.</EmptyTableRow>
          ) : (
            props.suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.email || supplier.phone || supplier.contactName || "—"}</TableCell>
                <TableCell>{supplier.batchCount ?? 0}</TableCell>
                <TableCell><StatusBadge active={supplier.isActive} /></TableCell>
                <TableCell className="text-right">
                  {props.canManage ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => props.onEdit(supplier)}>Edit</Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => props.onDisable(supplier.id)}>
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
