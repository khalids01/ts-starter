import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { buttonVariants, Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type {
  Category,
  CategoryTemplate,
  PageResult,
  Product,
  ProductBrand,
} from "../types";
import {
  EcommerceHeader,
  Field,
  SaveButton,
  SelectField,
  TextField,
  ecommercePermissions,
  readError,
} from "../ui";
import { ImagePickerField } from "../image-picker-fields";
import { BrandField } from "./brand-field";
import { DynamicFields } from "./dynamic-fields";
import { highlightDraft, steps, variantDraft, type AttributeDraft, type HighlightDraft, type Step, type VariantDraft } from "./drafts";
import { HighlightsEditor } from "./highlights-editor";
import { Panel } from "./panel";
import { VariantsEditor } from "./variants-editor";

export function AdminProductBuilderPage(props: { productId?: string }) {
  const mode = props.productId ? "edit" : "new";
  const navigate = useNavigate();
  const { session } = useSession();
  const { canManageProducts } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState<Step>("Category");
  const [categoryId, setCategoryId] = useState("");
  const [basics, setBasics] = useState({
    name: "",
    slug: "",
    description: "",
    descriptionHtml: "",
    brandId: "none",
    coverImageUrl: "",
    searchKeywords: "",
    badgeLabel: "",
    seoTitle: "",
    seoDescription: "",
    isFeatured: false,
    isTrending: false,
  });
  const [attributes, setAttributes] = useState<AttributeDraft>({});
  const [highlights, setHighlights] = useState<HighlightDraft[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);

  const categoriesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.categories({ limit: 100 }),
    queryFn: () => ecommerceApi.catalog.categories({ limit: 100 }) as Promise<PageResult<Category>>,
  });
  const brandsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.brands({ limit: 100, active: true }),
    queryFn: () => ecommerceApi.catalog.brands({ limit: 100, active: true }) as Promise<PageResult<ProductBrand>>,
  });
  const productQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.products.detail(props.productId ?? ""),
    enabled: Boolean(props.productId),
    queryFn: () => ecommerceApi.products.detail(props.productId!) as Promise<Product>,
  });

  const product = productQuery.data;
  const effectiveCategoryId = categoryId || product?.categoryId || "";
  const templateQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.template(effectiveCategoryId),
    enabled: Boolean(effectiveCategoryId),
    queryFn: () => ecommerceApi.catalog.template(effectiveCategoryId) as Promise<CategoryTemplate>,
  });
  const template = templateQuery.data;
  const categories = categoriesQuery.data?.items ?? [];
  const brands = brandsQuery.data?.items ?? [];

  useEffect(() => {
    if (!product) {
      return;
    }
    setCategoryId(product.categoryId);
    setBasics({
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      descriptionHtml: product.descriptionHtml ?? "",
      brandId: product.brandId ?? "none",
      coverImageUrl: product.coverImageUrl ?? "",
      searchKeywords: (product.searchKeywords ?? []).join(", "),
      badgeLabel: product.badgeLabel ?? "",
      seoTitle: product.seoTitle ?? "",
      seoDescription: product.seoDescription ?? "",
      isFeatured: product.isFeatured,
      isTrending: product.isTrending,
    });
    const nextAttributes: AttributeDraft = {};
    for (const assignment of product.attributeAssignments ?? []) {
      nextAttributes[assignment.attributeId] = {
        attributeValueId: assignment.attributeValueId ?? "none",
        attributeValueIds: assignment.values?.map((value) => value.id) ?? [],
        rawText: assignment.rawText ?? "",
        rawNumber: assignment.rawNumber ?? "",
        rawBoolean: assignment.rawBoolean ?? false,
        rawDate: assignment.rawDate?.slice(0, 10) ?? "",
        displayValue: assignment.displayValue ?? "",
      };
    }
    setAttributes(nextAttributes);
    setHighlights((product.highlights ?? []).map(highlightDraft));
    setVariants((product.variants ?? []).map(variantDraft));
  }, [product]);

  const invalidateProduct = (id?: string) => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.products.all() });
    if (id) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.products.detail(id) });
    }
  };

  const saveBasics = useMutation({
    mutationFn: async () => {
      if (!effectiveCategoryId) {
        throw new Error("Select a category first");
      }
      const body = {
        categoryId: effectiveCategoryId,
        name: basics.name,
        slug: basics.slug || undefined,
        description: basics.description || null,
        descriptionHtml: basics.descriptionHtml || null,
        brandId: basics.brandId === "none" ? null : basics.brandId,
        coverImageUrl: basics.coverImageUrl || null,
        searchKeywords: basics.searchKeywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean),
        badgeLabel: basics.badgeLabel || null,
        seoTitle: basics.seoTitle || null,
        seoDescription: basics.seoDescription || null,
        isFeatured: basics.isFeatured,
        isTrending: basics.isTrending,
      };
      return product?.id
        ? ecommerceApi.products.update(product.id, body)
        : ecommerceApi.products.create(body);
    },
    onSuccess: (saved: any) => {
      toast.success("Product basics saved");
      invalidateProduct(saved.id);
      if (mode === "new") {
        void navigate({
          to: "/admin/products/$productId",
          params: { productId: saved.id },
        });
      }
    },
    onError: (error) => toast.error(readError(error, "Failed to save product")),
  });

  const saveAttributes = useMutation({
    mutationFn: async () => {
      if (!product?.id) {
        throw new Error("Save basics first");
      }
      return ecommerceApi.products.saveAttributes(
        product.id,
        (template?.fields.product ?? []).map((field) => {
          const value = attributes[field.attributeId] ?? {};
          return {
            attributeId: field.attributeId,
            attributeValueId:
              field.inputType === "select" || field.inputType === "color"
                ? value.attributeValueId === "none"
                  ? null
                  : value.attributeValueId
                : undefined,
            attributeValueIds:
              field.inputType === "multiselect" ? value.attributeValueIds ?? [] : undefined,
            rawText: ["text", "textarea"].includes(field.inputType) ? value.rawText || null : undefined,
            rawNumber: field.inputType === "number" ? value.rawNumber || null : undefined,
            rawBoolean: field.inputType === "boolean" ? Boolean(value.rawBoolean) : undefined,
            rawDate: field.inputType === "date" ? value.rawDate || null : undefined,
            displayValue: value.displayValue || null,
          };
        }),
      );
    },
    onSuccess: () => {
      toast.success("Specs saved");
      invalidateProduct(product?.id);
    },
    onError: (error) => toast.error(readError(error, "Failed to save specs")),
  });

  const saveVariants = useMutation({
    mutationFn: async () => {
      if (!product?.id) {
        throw new Error("Save basics first");
      }
      return ecommerceApi.products.saveVariants(
        product.id,
        variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku || undefined,
          barcode: variant.barcode || null,
          name: variant.name || undefined,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice || null,
          costPrice: variant.costPrice || null,
          currency: variant.currency || "BDT",
          isDefault: variant.isDefault,
          isActive: variant.isActive,
          imageUrls: variant.imageUrls.map((url) => url.trim()).filter(Boolean),
          weightValue: variant.weightValue || null,
          weightUnit: variant.weightUnit === "none" ? null : variant.weightUnit,
          attributeValueIds: variant.attributeValueIds,
        })),
      );
    },
    onSuccess: () => {
      toast.success("Variants saved");
      invalidateProduct(product?.id);
    },
    onError: (error) => toast.error(readError(error, "Failed to save variants")),
  });

  const saveHighlights = useMutation({
    mutationFn: async () => {
      if (!product?.id) {
        throw new Error("Save basics first");
      }
      return ecommerceApi.products.saveHighlights(
        product.id,
        highlights
          .filter((highlight) => highlight.title.trim())
          .map((highlight, index) => ({
            title: highlight.title,
            description: highlight.description || null,
            iconUrl: highlight.iconUrl || null,
            imageUrl: highlight.imageUrl || null,
            sortOrder: Number(highlight.sortOrder || index),
          })),
      );
    },
    onSuccess: () => {
      toast.success("Highlights saved");
      invalidateProduct(product?.id);
    },
    onError: (error) => toast.error(readError(error, "Failed to save highlights")),
  });

  const validate = useMutation({
    mutationFn: async () => {
      if (!product?.id) {
        throw new Error("Save basics first");
      }
      return ecommerceApi.products.validate(product.id);
    },
    onSuccess: (result: any) => {
      if (result.ok) {
        toast.success("Product is ready");
      } else {
        toast.error(result.issues?.[0]?.message ?? "Product has validation issues");
      }
    },
  });

  const activate = useMutation({
    mutationFn: async () => {
      if (!product?.id) {
        throw new Error("Save basics first");
      }
      return ecommerceApi.products.update(product.id, { status: "active" });
    },
    onSuccess: () => {
      toast.success("Product activated");
      invalidateProduct(product?.id);
    },
    onError: (error) => toast.error(readError(error, "Failed to activate product")),
  });

  const canSaveProduct = canManageProducts && Boolean(effectiveCategoryId);

  return (
    <div className="space-y-6">
      <EcommerceHeader
        title={mode === "new" ? "New product" : basics.name || "Edit product"}
        description="Use the category template to fill product specs, variants, and readiness checks."
        action={
          <Link
            to="/admin/products"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Products
          </Link>
        }
      />

      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((step, index) => (
          <Button
            key={step}
            type="button"
            variant={activeStep === step ? "default" : "outline"}
            className="justify-start"
            onClick={() => setActiveStep(step)}
          >
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs">
              {index + 1}
            </span>
            {step}
          </Button>
        ))}
      </div>

      {activeStep === "Category" ? (
        <Panel title="Category">
          <SelectField
            label="Category"
            value={effectiveCategoryId || "none"}
            disabled={Boolean(product?.id && ((product.variants?.length ?? 0) > 0 || (product.attributeAssignments?.length ?? 0) > 0))}
            onChange={(value) => setCategoryId(value === "none" ? "" : value)}
            options={[
              { value: "none", label: "Select category" },
              ...categories.map((category) => ({ value: category.id, label: category.name })),
            ]}
          />
          {template ? (
            <div className="rounded-md border p-3 text-sm">
              Brand policy: <span className="font-medium">{template.brand.policy}</span>
              <span className="ml-3 text-muted-foreground">
                Product fields: {template.fields.product.length}, variant fields: {template.fields.variant.length}, batch fields: {template.fields.batch.length}
              </span>
            </div>
          ) : null}
        </Panel>
      ) : null}

      {activeStep === "Basics" ? (
        <Panel title="Basics">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Name" value={basics.name} onChange={(name) => setBasics((current) => ({ ...current, name }))} />
            <TextField label="Slug" value={basics.slug} onChange={(slug) => setBasics((current) => ({ ...current, slug }))} />
            <BrandField
              template={template}
              brands={brands}
              value={basics.brandId}
              onChange={(brandId) => setBasics((current) => ({ ...current, brandId }))}
            />
            <ImagePickerField
              label="Cover image"
              value={basics.coverImageUrl}
              onChange={(coverImageUrl) => setBasics((current) => ({ ...current, coverImageUrl }))}
            />
            <TextField label="Badge label" value={basics.badgeLabel} onChange={(badgeLabel) => setBasics((current) => ({ ...current, badgeLabel }))} />
            <label className="flex items-end gap-2 text-sm">
              <Switch
                checked={basics.isFeatured}
                onCheckedChange={(isFeatured) => setBasics((current) => ({ ...current, isFeatured }))}
              />
              Featured
            </label>
            <label className="flex items-end gap-2 text-sm">
              <Switch
                checked={basics.isTrending}
                onCheckedChange={(isTrending) => setBasics((current) => ({ ...current, isTrending }))}
              />
              Trending
            </label>
            <Field label="Description">
              <Textarea value={basics.description} onChange={(event) => setBasics((current) => ({ ...current, description: event.target.value }))} />
            </Field>
            <Field label="Description HTML">
              <Textarea value={basics.descriptionHtml} onChange={(event) => setBasics((current) => ({ ...current, descriptionHtml: event.target.value }))} />
            </Field>
            <Field label="Search keywords">
              <Textarea value={basics.searchKeywords} onChange={(event) => setBasics((current) => ({ ...current, searchKeywords: event.target.value }))} />
            </Field>
            <TextField label="SEO title" value={basics.seoTitle} onChange={(seoTitle) => setBasics((current) => ({ ...current, seoTitle }))} />
            <TextField label="SEO description" value={basics.seoDescription} onChange={(seoDescription) => setBasics((current) => ({ ...current, seoDescription }))} />
          </div>
          <SaveButton loading={saveBasics.isPending} disabled={!canSaveProduct || !basics.name} onClick={() => saveBasics.mutate()}>
            Save basics
          </SaveButton>
        </Panel>
      ) : null}

      {activeStep === "Specs" ? (
        <Panel title="Specs">
          {template?.fields.product.length ? (
            <DynamicFields
              fields={template.fields.product}
              values={attributes}
              onChange={setAttributes}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No product fields configured for this category.</p>
          )}
          <SaveButton loading={saveAttributes.isPending} disabled={!canManageProducts || !product?.id} onClick={() => saveAttributes.mutate()}>
            Save specs
          </SaveButton>
        </Panel>
      ) : null}

      {activeStep === "Highlights" ? (
        <Panel title="Highlights">
          <HighlightsEditor highlights={highlights} onChange={setHighlights} />
          <SaveButton loading={saveHighlights.isPending} disabled={!canManageProducts || !product?.id} onClick={() => saveHighlights.mutate()}>
            Save highlights
          </SaveButton>
        </Panel>
      ) : null}

      {activeStep === "Variants" ? (
        <Panel title="Variants">
          <VariantsEditor
            fields={template?.fields.variant ?? []}
            variants={variants}
            onChange={setVariants}
          />
          <SaveButton loading={saveVariants.isPending} disabled={!canManageProducts || !product?.id || variants.length === 0} onClick={() => saveVariants.mutate()}>
            Save variants
          </SaveButton>
        </Panel>
      ) : null}

      {activeStep === "Inventory" ? (
        <Panel title="Inventory">
          <p className="text-sm text-muted-foreground">
            Receive and adjust stock from the inventory page after variants are saved.
          </p>
          <Link
            to="/admin/inventory"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Open inventory
          </Link>
        </Panel>
      ) : null}

      {activeStep === "Validate" ? (
        <Panel title="Validate">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={!product?.id || validate.isPending} onClick={() => validate.mutate()}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Validate
            </Button>
            <SaveButton loading={activate.isPending} disabled={!canManageProducts || !product?.id} onClick={() => activate.mutate()}>
              Activate product
            </SaveButton>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
