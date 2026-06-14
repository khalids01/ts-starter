import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { PageResult, ProductAttribute } from "../types";
import { EcommerceHeader, ecommercePermissions, readError } from "../ui";
import { AttributeDialog } from "./attribute-dialog";
import { AttributesTable } from "./attributes-table";
import { BrandManagementSection } from "./brand-management-section";
import { CategoryManagementSection } from "./category-management-section";
import {
  attributeDraft,
  type AttributeDraft,
} from "./drafts";

export function AdminCatalogPage() {
  const { session } = useSession();
  const { canManageCatalog } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const [attributeDialog, setAttributeDialog] = useState<AttributeDraft | null>(null);

  const attributesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.attributes({ limit: 100 }),
    queryFn: () => ecommerceApi.catalog.attributes({ limit: 100 }) as Promise<PageResult<ProductAttribute>>,
  });

  const attributes = attributesQuery.data?.items ?? [];

  const invalidateCatalog = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.catalog.all() });
  };

  const saveAttribute = useMutation({
    mutationFn: async (draft: AttributeDraft) => {
      const body = {
        name: draft.name,
        slug: draft.slug || undefined,
        type: draft.type,
        filterable: draft.filterable,
        variantDefining: draft.variantDefining,
        sortOrder: Number(draft.sortOrder || 0),
      };

      return draft.id
        ? ecommerceApi.catalog.updateAttribute(draft.id, body)
        : ecommerceApi.catalog.createAttribute(body);
    },
    onSuccess: () => {
      toast.success("Attribute saved");
      setAttributeDialog(null);
      invalidateCatalog();
    },
    onError: (error) => toast.error(readError(error, "Failed to save attribute")),
  });

  return (
    <div className="space-y-6">
      <EcommerceHeader
        title="Catalog"
        description="Manage categories, product fields, and product brands."
      />

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-3">
          <CategoryManagementSection />
        </TabsContent>

        <TabsContent value="attributes" className="space-y-3">
          <div className="flex justify-end">
            {canManageCatalog ? (
              <Button onClick={() => setAttributeDialog(attributeDraft())}>
                <Plus className="mr-2 h-4 w-4" />
                Attribute
              </Button>
            ) : null}
          </div>
          <AttributesTable
            attributes={attributes}
            loading={attributesQuery.isLoading}
            canManage={canManageCatalog}
            onEdit={(attribute) => setAttributeDialog(attributeDraft(attribute))}
            onSaved={invalidateCatalog}
          />
        </TabsContent>

        <TabsContent value="brands" className="space-y-3">
          <BrandManagementSection />
        </TabsContent>
      </Tabs>

      <AttributeDialog
        draft={attributeDialog}
        loading={saveAttribute.isPending}
        onChange={setAttributeDialog}
        onSubmit={(draft) => saveAttribute.mutate(draft)}
      />
    </div>
  );
}
