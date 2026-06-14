import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { PageResult, ProductBrand } from "../types";
import { ecommercePermissions, readError } from "../ui";
import { BrandDialog } from "./brand-dialog";
import { BrandsTable } from "./brands-table";
import { brandDraft, type BrandDraft } from "./drafts";

export function BrandManagementSection() {
  const { session } = useSession();
  const { canManageCatalog } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const [brandDialog, setBrandDialog] = useState<BrandDraft | null>(null);

  const brandsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.brands({ limit: 100 }),
    queryFn: () => ecommerceApi.catalog.brands({ limit: 100 }) as Promise<PageResult<ProductBrand>>,
  });

  const brands = brandsQuery.data?.items ?? [];

  const invalidateCatalog = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.catalog.all() });
  };

  const saveBrand = useMutation({
    mutationFn: async (draft: BrandDraft) => {
      const body = {
        name: draft.name,
        slug: draft.slug || undefined,
        description: draft.description || null,
        logoUrl: draft.logoUrl || null,
        websiteUrl: draft.websiteUrl || null,
        isActive: draft.isActive,
        isFeatured: draft.isFeatured,
      };

      return draft.id
        ? ecommerceApi.catalog.updateBrand(draft.id, body)
        : ecommerceApi.catalog.createBrand(body);
    },
    onSuccess: () => {
      toast.success("Brand saved");
      setBrandDialog(null);
      invalidateCatalog();
    },
    onError: (error) => toast.error(readError(error, "Failed to save brand")),
  });

  const disableBrand = useMutation({
    mutationFn: (id: string) => ecommerceApi.catalog.disableBrand(id),
    onSuccess: () => {
      toast.success("Brand disabled");
      invalidateCatalog();
    },
    onError: (error) => toast.error(readError(error, "Failed to disable brand")),
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canManageCatalog ? (
          <Button onClick={() => setBrandDialog(brandDraft())}>
            <Plus className="mr-2 h-4 w-4" />
            Brand
          </Button>
        ) : null}
      </div>
      <BrandsTable
        brands={brands}
        loading={brandsQuery.isLoading}
        canManage={canManageCatalog}
        onEdit={(brand) => setBrandDialog(brandDraft(brand))}
        onDisable={(id) => disableBrand.mutate(id)}
      />
      <BrandDialog
        draft={brandDialog}
        loading={saveBrand.isPending}
        onChange={setBrandDialog}
        onSubmit={(draft) => saveBrand.mutate(draft)}
      />
    </div>
  );
}
