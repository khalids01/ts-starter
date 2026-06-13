import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { ecommerceApi } from "../apiCall";
import type {
  CategoryTemplate,
  InventoryLocation,
  InventorySupplier,
  PageResult,
  Product,
} from "../types";
import { SaveButton, SelectField, TextField, readError } from "../ui";

export function ReceiveStockForm(props: {
  suppliers: InventorySupplier[];
  locations: InventoryLocation[];
  canManage: boolean;
  onSaved: () => void;
}) {
  const [productId, setProductId] = useState("none");
  const [form, setForm] = useState({
    variantId: "none",
    locationId: "none",
    supplierId: "none",
    quantity: "1",
    batchNumber: "",
    expiryDate: "",
    unitCost: "",
    reorderLevel: "",
  });
  const [batchAttributes, setBatchAttributes] = useState<Record<string, any>>({});
  const productsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.products.list({ limit: 100, status: "active" }),
    queryFn: () => ecommerceApi.products.list({ limit: 100 }) as Promise<PageResult<Product>>,
  });
  const productQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.products.detail(productId),
    enabled: productId !== "none",
    queryFn: () => ecommerceApi.products.detail(productId) as Promise<Product>,
  });
  const templateQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.template(productQuery.data?.categoryId ?? ""),
    enabled: Boolean(productQuery.data?.categoryId),
    queryFn: () => ecommerceApi.catalog.template(productQuery.data!.categoryId) as Promise<CategoryTemplate>,
  });
  const products = productsQuery.data?.items ?? [];
  const product = productQuery.data;
  const variants = product?.variants ?? [];

  const receive = useMutation({
    mutationFn: () =>
      ecommerceApi.inventory.receive({
        variantId: form.variantId,
        locationId: form.locationId,
        quantity: Number(form.quantity),
        supplierId: form.supplierId === "none" ? null : form.supplierId,
        batchNumber: form.batchNumber || null,
        expiryDate: form.expiryDate || null,
        unitCost: form.unitCost || null,
        reorderLevel: form.reorderLevel ? Number(form.reorderLevel) : null,
        batchAttributes: (templateQuery.data?.fields.batch ?? []).map((field) => {
          const value = batchAttributes[field.attributeId] ?? {};
          return {
            attributeId: field.attributeId,
            attributeValueId: value.attributeValueId === "none" ? null : value.attributeValueId,
            rawText: value.rawText || null,
            rawNumber: value.rawNumber || null,
            rawBoolean: value.rawBoolean ?? null,
            rawDate: value.rawDate || null,
            displayValue: value.displayValue || null,
          };
        }),
      }),
    onSuccess: () => {
      toast.success("Stock received");
      props.onSaved();
    },
    onError: (error) => toast.error(readError(error, "Failed to receive stock")),
  });

  return (
    <section className="space-y-4 rounded-md border p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField
          label="Product"
          value={productId}
          onChange={(value) => {
            setProductId(value);
            setForm((current) => ({ ...current, variantId: "none" }));
          }}
          options={[
            { value: "none", label: "Select product" },
            ...products.map((item) => ({ value: item.id, label: item.name })),
          ]}
        />
        <SelectField
          label="SKU"
          value={form.variantId}
          onChange={(variantId) => setForm((current) => ({ ...current, variantId }))}
          options={[
            { value: "none", label: "Select SKU" },
            ...variants.map((variant) => ({ value: variant.id, label: `${variant.sku} · ${variant.name}` })),
          ]}
        />
        <SelectField
          label="Location"
          value={form.locationId}
          onChange={(locationId) => setForm((current) => ({ ...current, locationId }))}
          options={[
            { value: "none", label: "Select location" },
            ...props.locations.map((location) => ({ value: location.id, label: location.name })),
          ]}
        />
        <TextField label="Quantity" type="number" value={form.quantity} onChange={(quantity) => setForm((current) => ({ ...current, quantity }))} />
        <SelectField
          label="Supplier"
          value={form.supplierId}
          onChange={(supplierId) => setForm((current) => ({ ...current, supplierId }))}
          options={[
            { value: "none", label: "No supplier" },
            ...props.suppliers.map((supplier) => ({ value: supplier.id, label: supplier.name })),
          ]}
        />
        <TextField label="Batch number" value={form.batchNumber} onChange={(batchNumber) => setForm((current) => ({ ...current, batchNumber }))} />
        <TextField label="Expiry" type="date" value={form.expiryDate} onChange={(expiryDate) => setForm((current) => ({ ...current, expiryDate }))} />
        <TextField label="Unit cost" type="number" value={form.unitCost} onChange={(unitCost) => setForm((current) => ({ ...current, unitCost }))} />
        <TextField label="Reorder level" type="number" value={form.reorderLevel} onChange={(reorderLevel) => setForm((current) => ({ ...current, reorderLevel }))} />
      </div>
      {templateQuery.data?.fields.batch.length ? (
        <div className="grid gap-4 border-t pt-4 md:grid-cols-2">
          {templateQuery.data.fields.batch.map((field) => {
            const value = batchAttributes[field.attributeId] ?? {};
            if (field.inputType === "select" || field.inputType === "color") {
              return (
                <SelectField
                  key={field.id}
                  label={`${field.attribute.name}${field.required ? " *" : ""}`}
                  value={value.attributeValueId ?? "none"}
                  onChange={(attributeValueId) =>
                    setBatchAttributes((current) => ({
                      ...current,
                      [field.attributeId]: { ...value, attributeValueId },
                    }))
                  }
                  options={[
                    { value: "none", label: "Not set" },
                    ...(field.attribute.values ?? []).map((item) => ({ value: item.id, label: item.label })),
                  ]}
                />
              );
            }
            return (
              <TextField
                key={field.id}
                label={`${field.attribute.name}${field.required ? " *" : ""}`}
                type={field.inputType === "number" ? "number" : field.inputType === "date" ? "date" : "text"}
                value={field.inputType === "date" ? value.rawDate ?? "" : field.inputType === "number" ? value.rawNumber ?? "" : value.rawText ?? ""}
                onChange={(nextValue) =>
                  setBatchAttributes((current) => ({
                    ...current,
                    [field.attributeId]:
                      field.inputType === "date"
                        ? { ...value, rawDate: nextValue }
                        : field.inputType === "number"
                          ? { ...value, rawNumber: nextValue }
                          : { ...value, rawText: nextValue },
                  }))
                }
              />
            );
          })}
        </div>
      ) : null}
      <SaveButton
        loading={receive.isPending}
        disabled={!props.canManage || form.variantId === "none" || form.locationId === "none"}
        onClick={() => receive.mutate()}
      >
        Receive stock
      </SaveButton>
    </section>
  );
}
