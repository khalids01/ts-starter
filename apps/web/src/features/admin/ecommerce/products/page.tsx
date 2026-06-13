import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { Category, PageResult, Product, ProductBrand } from "../types";
import { EcommerceHeader, ecommercePermissions, readError } from "../ui";
import { ProductFilters, type ProductFiltersState } from "./filters";
import { ProductsTable } from "./products-table";
import { useProductViewStore } from "./view-store";
import { ProductsViewSwitcher } from "./view-switcher";

export function AdminProductsPage() {
  const { session } = useSession();
  const { canManageProducts } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const viewMode = useProductViewStore((state) => state.viewMode);
  const setViewMode = useProductViewStore((state) => state.setViewMode);
  const [filters, setFilters] = useState<ProductFiltersState>({
    search: "",
    status: "all",
    categoryId: "all",
    brandId: "all",
  });

  const productsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.products.list(filters),
    queryFn: () =>
      ecommerceApi.products.list({
        limit: 50,
        search: filters.search || undefined,
        status: filters.status === "all" ? undefined : filters.status,
        categoryId: filters.categoryId === "all" ? undefined : filters.categoryId,
        brandId: filters.brandId === "all" ? undefined : filters.brandId,
      }) as Promise<PageResult<Product>>,
  });
  const categoriesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.categories({ limit: 100 }),
    queryFn: () => ecommerceApi.catalog.categories({ limit: 100 }) as Promise<PageResult<Category>>,
  });
  const brandsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.brands({ limit: 100 }),
    queryFn: () => ecommerceApi.catalog.brands({ limit: 100 }) as Promise<PageResult<ProductBrand>>,
  });

  const archive = useMutation({
    mutationFn: (id: string) => ecommerceApi.products.archive(id),
    onSuccess: () => {
      toast.success("Product archived");
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.products.all() });
    },
    onError: (error) => toast.error(readError(error, "Failed to archive product")),
  });
  const validate = useMutation({
    mutationFn: (id: string) => ecommerceApi.products.validate(id),
    onSuccess: (result: any) => {
      if (result.ok) {
        toast.success("Product is ready to activate");
      } else {
        toast.error(result.issues?.[0]?.message ?? "Product has validation issues");
      }
    },
  });

  return (
    <div className="space-y-6">
      <EcommerceHeader
        title="Products"
        description="Create product drafts, manage specs, and build sellable variants."
        action={
          canManageProducts ? (
            <Link to="/admin/products/new" className={buttonVariants()}>
              <Plus className="mr-2 h-4 w-4" />
              Product
            </Link>
          ) : null
        }
      />

      <div className="grid gap-3">
        <ProductFilters
          filters={filters}
          categories={categoriesQuery.data?.items ?? []}
          brands={brandsQuery.data?.items ?? []}
          onChange={setFilters}
        />
        <div className="flex items-center justify-end">
          <ProductsViewSwitcher value={viewMode} onChange={setViewMode} />
        </div>
      </div>

      <ProductsTable
        products={productsQuery.data?.items ?? []}
        loading={productsQuery.isLoading}
        canManage={canManageProducts}
        viewMode={viewMode}
        onValidate={(id) => validate.mutate(id)}
        onArchive={(id) => archive.mutate(id)}
      />
    </div>
  );
}
