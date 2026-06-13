import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Archive,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
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
import type { Product } from "../types";
import { EmptyTableRow, StatusBadge, formatDate } from "../ui";
import type { ProductViewMode } from "./view-store";

type ProductsViewProps = {
  products: Product[];
  loading: boolean;
  canManage: boolean;
  viewMode: ProductViewMode;
  onValidate: (id: string) => void;
  onArchive: (id: string) => void;
};

type ProductActionsProps = {
  product: Product;
  canManage: boolean;
  onValidate: (id: string) => void;
  onArchive: (id: string) => void;
};

export function ProductsTable(props: ProductsViewProps) {
  if (props.viewMode === "grid") {
    return <ProductsGrid {...props} />;
  }

  return <ProductsList {...props} />;
}

function ProductsList(props: ProductsViewProps) {
  return (
    <>
      <div className="hidden rounded-md border md:block">
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
                    <ProductTitle product={product} />
                  </TableCell>
                  <TableCell>{product.category?.name ?? "-"}</TableCell>
                  <TableCell>
                    <ProductBrandValue product={product} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={product.status} />
                  </TableCell>
                  <TableCell>{getVariantCount(product)}</TableCell>
                  <TableCell>{getSpecsCount(product)}</TableCell>
                  <TableCell>{formatDate(product.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <ProductActionsMenu
                      product={product}
                      canManage={props.canManage}
                      onValidate={props.onValidate}
                      onArchive={props.onArchive}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {props.loading ? (
          <ProductsStateCard>Loading products...</ProductsStateCard>
        ) : props.products.length === 0 ? (
          <ProductsStateCard>No products found.</ProductsStateCard>
        ) : (
          props.products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              canManage={props.canManage}
              onValidate={props.onValidate}
              onArchive={props.onArchive}
            />
          ))
        )}
      </div>
    </>
  );
}

function ProductsGrid(props: ProductsViewProps) {
  if (props.loading) {
    return <ProductsStateCard>Loading products...</ProductsStateCard>;
  }

  if (props.products.length === 0) {
    return <ProductsStateCard>No products found.</ProductsStateCard>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {props.products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          canManage={props.canManage}
          onValidate={props.onValidate}
          onArchive={props.onArchive}
        />
      ))}
    </div>
  );
}

function ProductCard(props: ProductActionsProps) {
  return (
    <article className="grid min-w-0 gap-4 rounded-md border bg-card p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <ProductTitle product={props.product} />
        </div>
        <ProductActionsMenu {...props} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={props.product.status} />
        {props.product.isFeatured ? (
          <Badge variant="secondary">Featured</Badge>
        ) : null}
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <InfoBlock label="Category" value={props.product.category?.name ?? "-"} />
        <InfoBlock label="Brand" value={<ProductBrandValue product={props.product} />} />
        <InfoBlock label="Variants" value={getVariantCount(props.product)} />
        <InfoBlock label="Specs" value={getSpecsCount(props.product)} />
      </div>

      <div className="border-t pt-3 text-xs text-muted-foreground">
        Updated {formatDate(props.product.updatedAt)}
      </div>
    </article>
  );
}

function ProductListItem(props: ProductActionsProps) {
  return (
    <article className="rounded-md border bg-card p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <ProductTitle product={props.product} />
        </div>
        <ProductActionsMenu {...props} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={props.product.status} />
        {props.product.isFeatured ? (
          <Badge variant="secondary">Featured</Badge>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <InfoBlock label="Category" value={props.product.category?.name ?? "-"} />
        <InfoBlock label="Brand" value={<ProductBrandValue product={props.product} />} />
        <InfoBlock label="Variants" value={getVariantCount(props.product)} />
        <InfoBlock label="Updated" value={formatDate(props.product.updatedAt)} />
      </div>
    </article>
  );
}

function ProductActionsMenu(props: ProductActionsProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(triggerProps) => (
          <Button variant="ghost" className="h-8 w-8 p-0" {...triggerProps}>
            <span className="sr-only">Open product actions</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      />
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              void navigate({
                to: "/admin/products/$productId",
                params: { productId: props.product.id },
              })
            }
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          {props.canManage ? (
            <DropdownMenuItem onClick={() => props.onValidate(props.product.id)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Validate
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        {props.canManage ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => props.onArchive(props.product.id)}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProductTitle(props: { product: Product }) {
  return (
    <>
      <div className="truncate font-medium">{props.product.name}</div>
      <div className="truncate text-xs text-muted-foreground">
        {props.product.slug}
      </div>
    </>
  );
}

function ProductBrandValue(props: { product: Product }) {
  if (props.product.brand?.name) {
    return props.product.brand.name;
  }

  if (props.product.category?.brandPolicy === "default_store") {
    return <Badge variant="secondary">Store brand</Badge>;
  }

  return "-";
}

function InfoBlock(props: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{props.label}</div>
      <div className="truncate font-medium">{props.value}</div>
    </div>
  );
}

function ProductsStateCard(props: { children: ReactNode }) {
  return (
    <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}

function getVariantCount(product: Product) {
  return product.counts?.variants ?? product.variants?.length ?? 0;
}

function getSpecsCount(product: Product) {
  return product.counts?.attributeAssignments ?? product.attributeAssignments?.length ?? 0;
}
