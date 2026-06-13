import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductBrand } from "../types";
import { EmptyTableRow, StatusBadge } from "../ui";

export function BrandsTable(props: {
  brands: ProductBrand[];
  loading: boolean;
  canManage: boolean;
  onEdit: (brand: ProductBrand) => void;
  onDisable: (id: string) => void;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.loading ? (
            <EmptyTableRow colSpan={5}>Loading brands...</EmptyTableRow>
          ) : props.brands.length === 0 ? (
            <EmptyTableRow colSpan={5}>No brands found.</EmptyTableRow>
          ) : (
            props.brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell>{brand.slug}</TableCell>
                <TableCell>{brand.productCount ?? 0}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <StatusBadge active={brand.isActive} />
                    {brand.isFeatured ? <Badge variant="secondary">Featured</Badge> : null}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {props.canManage ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => props.onEdit(brand)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Disable"
                        onClick={() => props.onDisable(brand.id)}
                      >
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
