import { Link } from "@tanstack/react-router";
import { Archive, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "../types";
import { EmptyTableRow, StatusBadge, formatDate } from "../ui";

export function ProductsTable(props: {
  products: Product[];
  loading: boolean;
  canManage: boolean;
  onValidate: (id: string) => void;
  onArchive: (id: string) => void;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Variants</TableHead>
            <TableHead>Specs</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.loading ? (
            <EmptyTableRow colSpan={8}>Loading products...</EmptyTableRow>
          ) : props.products.length === 0 ? (
            <EmptyTableRow colSpan={8}>No products found.</EmptyTableRow>
          ) : (
            props.products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{product.slug}</div>
                </TableCell>
                <TableCell>{product.category?.name ?? "—"}</TableCell>
                <TableCell>
                  {product.brand?.name ??
                    (product.category?.brandPolicy === "default_store" ? (
                      <Badge variant="secondary">Store brand</Badge>
                    ) : (
                      "—"
                    ))}
                </TableCell>
                <TableCell><StatusBadge status={product.status} /></TableCell>
                <TableCell>{product.counts?.variants ?? product.variants?.length ?? 0}</TableCell>
                <TableCell>{product.counts?.attributeAssignments ?? product.attributeAssignments?.length ?? 0}</TableCell>
                <TableCell>{formatDate(product.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      to="/admin/products/$productId"
                      params={{ productId: product.id }}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Edit
                    </Link>
                    {props.canManage ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Validate"
                          onClick={() => props.onValidate(product.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Archive"
                          onClick={() => props.onArchive(product.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
