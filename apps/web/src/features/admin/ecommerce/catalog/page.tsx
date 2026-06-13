import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { Category, PageResult, ProductAttribute, ProductBrand } from "../types";
import { EcommerceHeader, ecommercePermissions, readError } from "../ui";
import { AttributeDialog } from "./attribute-dialog";
import { AttributesTable } from "./attributes-table";
import { BrandDialog } from "./brand-dialog";
import { BrandsTable } from "./brands-table";
import { CategoriesTable } from "./categories-table";
import { CategoryDialog } from "./category-dialog";
import {
  attributeDraft,
  brandDraft,
  categoryDraft,
  type AttributeDraft,
  type BrandDraft,
  type CategoryDraft,
} from "./drafts";
import { TemplateSheet } from "./template-sheet";

export function AdminCatalogPage() {
  const { session } = useSession();
  const { canManageCatalog } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const [categoryDialog, setCategoryDialog] = useState<CategoryDraft | null>(null);
  const [attributeDialog, setAttributeDialog] = useState<AttributeDraft | null>(null);
  const [brandDialog, setBrandDialog] = useState<BrandDraft | null>(null);
  const [templateCategoryId, setTemplateCategoryId] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.categories({ limit: 100 }),
    queryFn: () => ecommerceApi.catalog.categories({ limit: 100 }) as Promise<PageResult<Category>>,
  });
  const attributesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.attributes({ limit: 100 }),
    queryFn: () => ecommerceApi.catalog.attributes({ limit: 100 }) as Promise<PageResult<ProductAttribute>>,
  });
  const brandsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.brands({ limit: 100 }),
    queryFn: () => ecommerceApi.catalog.brands({ limit: 100 }) as Promise<PageResult<ProductBrand>>,
  });

  const categories = categoriesQuery.data?.items ?? [];
  const attributes = attributesQuery.data?.items ?? [];
  const brands = brandsQuery.data?.items ?? [];

  const invalidateCatalog = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.catalog.all() });
  };

  const saveCategory = useMutation({
    mutationFn: async (draft: CategoryDraft) => {
      const body = {
        name: draft.name,
        slug: draft.slug || undefined,
        description: draft.description || null,
        parentId: draft.parentId === "none" ? null : draft.parentId,
        brandPolicy: draft.brandPolicy,
        showStoreBrand: draft.showStoreBrand,
        isActive: draft.isActive,
        isFeatured: draft.isFeatured,
        sortOrder: Number(draft.sortOrder || 0),
      };

      return draft.id
        ? ecommerceApi.catalog.updateCategory(draft.id, body)
        : ecommerceApi.catalog.createCategory(body);
    },
    onSuccess: () => {
      toast.success("Category saved");
      setCategoryDialog(null);
      invalidateCatalog();
    },
    onError: (error) => toast.error(readError(error, "Failed to save category")),
  });

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

  const disableCategory = useMutation({
    mutationFn: (id: string) => ecommerceApi.catalog.disableCategory(id),
    onSuccess: () => {
      toast.success("Category disabled");
      invalidateCatalog();
    },
  });
  const disableBrand = useMutation({
    mutationFn: (id: string) => ecommerceApi.catalog.disableBrand(id),
    onSuccess: () => {
      toast.success("Brand disabled");
      invalidateCatalog();
    },
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
          <div className="flex justify-end">
            {canManageCatalog ? (
              <Button onClick={() => setCategoryDialog(categoryDraft())}>
                <Plus className="mr-2 h-4 w-4" />
                Category
              </Button>
            ) : null}
          </div>
          <CategoriesTable
            categories={categories}
            loading={categoriesQuery.isLoading}
            canManage={canManageCatalog}
            onEdit={(category) => setCategoryDialog(categoryDraft(category))}
            onDisable={(id) => disableCategory.mutate(id)}
            onOpenTemplate={setTemplateCategoryId}
          />
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
        </TabsContent>
      </Tabs>

      <CategoryDialog
        draft={categoryDialog}
        categories={categories}
        loading={saveCategory.isPending}
        onChange={setCategoryDialog}
        onSubmit={(draft) => saveCategory.mutate(draft)}
      />
      <AttributeDialog
        draft={attributeDialog}
        loading={saveAttribute.isPending}
        onChange={setAttributeDialog}
        onSubmit={(draft) => saveAttribute.mutate(draft)}
      />
      <BrandDialog
        draft={brandDialog}
        loading={saveBrand.isPending}
        onChange={setBrandDialog}
        onSubmit={(draft) => saveBrand.mutate(draft)}
      />
      <TemplateSheet
        categoryId={templateCategoryId}
        attributes={attributes}
        canManage={canManageCatalog}
        onOpenChange={(open) => {
          if (!open) {
            setTemplateCategoryId(null);
          }
        }}
      />
    </div>
  );
}
