import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
                    <BrandActionsMenu
                      brand={brand}
                      onEdit={props.onEdit}
                      onDisable={props.onDisable}
                    />
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

function BrandActionsMenu(props: {
  brand: ProductBrand;
  onEdit: (brand: ProductBrand) => void;
  onDisable: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(triggerProps) => (
          <Button variant="ghost" className="h-8 w-8 p-0" {...triggerProps}>
            <span className="sr-only">Open brand actions</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      />
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => props.onEdit(props.brand)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => props.onDisable(props.brand.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Disable
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
