import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Archive,
  CheckCircle2,
  Eye,
  ImageIcon,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { queryKeys } from "@/constants/query-keys";
import { Img } from "@/components/core/img";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ecommerceApi } from "../apiCall";
import type { Product, ProductAttributeAssignment } from "../types";
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
    <article className="min-w-0 overflow-hidden rounded-md border bg-card">
      <ProductImage product={props.product} />

      <div className="grid gap-4 p-4">
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
          {props.product.isTrending ? (
            <Badge variant="secondary">Trending</Badge>
          ) : null}
          {props.product.badgeLabel ? (
            <Badge variant="outline">{props.product.badgeLabel}</Badge>
          ) : null}
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <InfoBlock label="Category" value={props.product.category?.name ?? "-"} />
          <InfoBlock label="Brand" value={<ProductBrandValue product={props.product} />} />
          <InfoBlock label="Variants" value={getVariantCount(props.product)} />
          <InfoBlock label="Specs" value={getSpecsCount(props.product)} />
        </div>

        <VariantNames product={props.product} />

        <div className="border-t pt-3 text-xs text-muted-foreground">
          Updated {formatDate(props.product.updatedAt)}
        </div>
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
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
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
            <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
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

      <ProductDetailsDialog
        product={props.product}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
}

function ProductDetailsDialog(props: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const productQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.products.detail(props.product.id),
    enabled: props.open,
    queryFn: () => ecommerceApi.products.detail(props.product.id) as Promise<Product>,
  });
  const product = productQuery.data ?? props.product;
  const variants = product.variants ?? [];

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.slug}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <ProductHero product={product} loading={productQuery.isLoading} />

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoBlock label="Status" value={<StatusBadge status={product.status} />} />
            <InfoBlock label="Category" value={product.category?.name ?? "-"} />
            <InfoBlock label="Brand" value={<ProductBrandValue product={product} />} />
            <InfoBlock label="Updated" value={formatDate(product.updatedAt)} />
          </section>

          <section className="grid gap-3 rounded-md border p-4">
            <h3 className="text-sm font-medium">Product Details</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBlock label="Product ID" value={product.id} />
              <InfoBlock label="Featured" value={product.isFeatured ? "Yes" : "No"} />
              <InfoBlock label="Trending" value={product.isTrending ? "Yes" : "No"} />
              <InfoBlock label="Badge" value={product.badgeLabel ?? "-"} />
              <InfoBlock label="SEO title" value={product.seoTitle ?? "-"} />
              <InfoBlock label="SEO description" value={product.seoDescription ?? "-"} />
            </div>
            {product.description ? (
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">Description</div>
                <p className="mt-1 whitespace-pre-wrap">{product.description}</p>
              </div>
            ) : null}
            {product.searchKeywords?.length ? (
              <BadgeList label="Search keywords" values={product.searchKeywords} />
            ) : null}
          </section>

          <section className="grid gap-3 rounded-md border p-4">
            <h3 className="text-sm font-medium">Specs</h3>
            {product.attributeAssignments?.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {product.attributeAssignments.map((assignment) => (
                  <InfoBlock
                    key={assignment.id}
                    label={assignment.attribute?.name ?? assignment.attributeId}
                    value={formatAssignmentValue(assignment)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specs saved.</p>
            )}
          </section>

          <section className="grid gap-3 rounded-md border p-4">
            <h3 className="text-sm font-medium">Highlights</h3>
            {product.highlights?.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {product.highlights.map((highlight) => (
                  <div key={highlight.id ?? highlight.title} className="rounded-md border p-3">
                    <div className="font-medium">{highlight.title}</div>
                    {highlight.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {highlight.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No highlights saved.</p>
            )}
          </section>

          <section className="grid gap-3 rounded-md border p-4">
            <h3 className="text-sm font-medium">Variants</h3>
            {productQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading variants...</p>
            ) : variants.length ? (
              <VariantTabs variants={variants} />
            ) : (
              <p className="text-sm text-muted-foreground">No variants saved.</p>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProductHero(props: { product: Product; loading: boolean }) {
  return (
    <section className="overflow-hidden rounded-md border">
      <ProductImage product={props.product} className="aspect-[16/7]" />
      <div className="grid gap-2 p-4">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={props.product.status} />
          {props.product.isFeatured ? <Badge variant="secondary">Featured</Badge> : null}
          {props.product.isTrending ? <Badge variant="secondary">Trending</Badge> : null}
          {props.product.badgeLabel ? (
            <Badge variant="outline">{props.product.badgeLabel}</Badge>
          ) : null}
        </div>
        {props.loading ? (
          <p className="text-sm text-muted-foreground">Loading full product details...</p>
        ) : null}
      </div>
    </section>
  );
}

function VariantTabs(props: { variants: NonNullable<Product["variants"]> }) {
  return (
    <Tabs defaultValue={props.variants[0]?.id}>
      <TabsList className="max-w-full justify-start overflow-x-auto">
        {props.variants.map((variant) => (
          <TabsTrigger key={variant.id} value={variant.id} className="shrink-0">
            {variant.name || variant.sku}
          </TabsTrigger>
        ))}
      </TabsList>
      {props.variants.map((variant) => (
        <TabsContent key={variant.id} value={variant.id}>
          <div className="grid gap-4 pt-2 lg:grid-cols-[220px_1fr]">
            <VariantImage variant={variant} />
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {variant.isDefault ? <Badge>Default</Badge> : null}
                <Badge variant={variant.isActive ? "secondary" : "outline"}>
                  {variant.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoBlock label="Name" value={variant.name || "-"} />
                <InfoBlock label="SKU" value={variant.sku || "-"} />
                <InfoBlock label="Barcode" value={variant.barcode ?? "-"} />
                <InfoBlock label="Price" value={formatMoney(variant.price, variant.currency)} />
                <InfoBlock
                  label="Compare at"
                  value={formatMoney(variant.compareAtPrice, variant.currency)}
                />
                <InfoBlock
                  label="Cost"
                  value={formatMoney(variant.costPrice, variant.currency)}
                />
                <InfoBlock
                  label="Weight"
                  value={
                    variant.weightValue
                      ? `${variant.weightValue} ${variant.weightUnit ?? ""}`.trim()
                      : "-"
                  }
                />
              </div>
              {variant.attributeValues?.length ? (
                <div className="grid gap-2">
                  <div className="text-xs text-muted-foreground">Attributes</div>
                  <div className="flex flex-wrap gap-2">
                    {variant.attributeValues.map((value) => (
                      <Badge key={value.id} variant="outline">
                        {value.attribute?.name ? `${value.attribute.name}: ` : ""}
                        {value.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

function ProductImage(props: { product: Product; className?: string }) {
  const src = getProductImage(props.product);

  if (!src) {
    return <ImagePlaceholder className={props.className ?? "aspect-[4/3]"} />;
  }

  return (
    <div className={props.className ?? "aspect-[4/3]"}>
      <Img
        src={src}
        alt={props.product.name}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function VariantImage(props: { variant: NonNullable<Product["variants"]>[number] }) {
  const src = props.variant.imageUrls?.find(Boolean);

  if (!src) {
    return <ImagePlaceholder className="aspect-square rounded-md" />;
  }

  return (
    <div className="aspect-square overflow-hidden rounded-md border">
      <Img
        src={src}
        alt={props.variant.name || props.variant.sku}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function ImagePlaceholder(props: { className: string }) {
  return (
    <div className={`${props.className} grid place-items-center bg-muted text-muted-foreground`}>
      <div className="grid justify-items-center gap-2 text-xs">
        <ImageIcon className="h-8 w-8" />
        <span>No image</span>
      </div>
    </div>
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

function VariantNames(props: { product: Product }) {
  const variants = props.product.variants ?? [];

  if (variants.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No variants
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="text-xs text-muted-foreground">Variant names</div>
      <div className="flex flex-wrap gap-2">
        {variants.slice(0, 5).map((variant) => (
          <Badge key={variant.id} variant="outline">
            {variant.name || variant.sku}
          </Badge>
        ))}
        {variants.length > 5 ? (
          <Badge variant="secondary">+{variants.length - 5}</Badge>
        ) : null}
      </div>
    </div>
  );
}

function BadgeList(props: { label: string; values: string[] }) {
  return (
    <div className="grid gap-2">
      <div className="text-xs text-muted-foreground">{props.label}</div>
      <div className="flex flex-wrap gap-2">
        {props.values.map((value) => (
          <Badge key={value} variant="outline">
            {value}
          </Badge>
        ))}
      </div>
    </div>
  );
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

function getProductImage(product: Product) {
  return (
    product.coverImageUrl ||
    product.variants?.flatMap((variant) => variant.imageUrls ?? []).find(Boolean) ||
    product.highlights?.map((highlight) => highlight.imageUrl).find(Boolean) ||
    null
  );
}

function formatMoney(value: string | null | undefined, currency: string) {
  return value ? `${value} ${currency}` : "-";
}

function formatAssignmentValue(assignment: ProductAttributeAssignment) {
  if (assignment.displayValue) {
    return assignment.displayValue;
  }
  if (assignment.attributeValue?.label) {
    return assignment.attributeValue.label;
  }
  if (assignment.values?.length) {
    return assignment.values.map((value) => value.label).join(", ");
  }
  if (assignment.rawText) {
    return assignment.rawText;
  }
  if (assignment.rawNumber) {
    return assignment.rawNumber;
  }
  if (assignment.rawDate) {
    return formatDate(assignment.rawDate);
  }
  if (typeof assignment.rawBoolean === "boolean") {
    return assignment.rawBoolean ? "Yes" : "No";
  }
  return "-";
}
