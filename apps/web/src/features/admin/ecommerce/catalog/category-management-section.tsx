import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { Category, PageResult, ProductAttribute } from "../types";
import { ecommercePermissions, readError } from "../ui";
import { CategoriesTable } from "./categories-table";
import { CategoryDialog } from "./category-dialog";
import { categoryDraft, type CategoryDraft } from "./drafts";
import { TemplateSheet } from "./template-sheet";

export function CategoryManagementSection() {
  const { session } = useSession();
  const { canManageCatalog } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const [categoryDialog, setCategoryDialog] = useState<CategoryDraft | null>(null);
  const [templateCategoryId, setTemplateCategoryId] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.categories({ limit: 100 }),
    queryFn: () => ecommerceApi.catalog.categories({ limit: 100 }) as Promise<PageResult<Category>>,
  });
  const attributesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.attributes({ limit: 100 }),
    queryFn: () => ecommerceApi.catalog.attributes({ limit: 100 }) as Promise<PageResult<ProductAttribute>>,
  });

  const categories = categoriesQuery.data?.items ?? [];
  const attributes = attributesQuery.data?.items ?? [];

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

  const disableCategory = useMutation({
    mutationFn: (id: string) => ecommerceApi.catalog.disableCategory(id),
    onSuccess: () => {
      toast.success("Category disabled");
      invalidateCatalog();
    },
    onError: (error) => toast.error(readError(error, "Failed to disable category")),
  });

  return (
    <div className="space-y-3">
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
      <CategoryDialog
        draft={categoryDialog}
        categories={categories}
        loading={saveCategory.isPending}
        onChange={setCategoryDialog}
        onSubmit={(draft) => saveCategory.mutate(draft)}
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
