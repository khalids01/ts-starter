import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ecommerceApi } from "../apiCall";
import type {
  AttributeInputType,
  AttributeScope,
  CategoryTemplate,
  ProductAttribute,
} from "../types";
import { EmptyTableRow, SaveButton, SelectField, TextField, readError } from "../ui";
import { inputTypeOptions, scopeOptions } from "./options";

export function TemplateSheet(props: {
  categoryId: string | null;
  attributes: ProductAttribute[];
  canManage: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState({
    attributeId: "",
    scope: "product" as AttributeScope,
    inputType: "text" as AttributeInputType,
    required: false,
    filterable: false,
    variantDefining: false,
    unit: "",
    groupName: "",
  });
  const templateQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.catalog.template(props.categoryId ?? ""),
    enabled: Boolean(props.categoryId),
    queryFn: () => ecommerceApi.catalog.template(props.categoryId!) as Promise<CategoryTemplate>,
  });
  const template = templateQuery.data;

  const invalidate = () => {
    if (props.categoryId) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.ecommerce.catalog.template(props.categoryId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.ecommerce.catalog.categories({ limit: 100 }),
      });
    }
  };

  const assign = useMutation({
    mutationFn: () =>
      ecommerceApi.catalog.assignCategoryAttribute(props.categoryId!, {
        ...draft,
        unit: draft.unit || null,
        groupName: draft.groupName || null,
      }),
    onSuccess: () => {
      toast.success("Template field saved");
      setDraft((current) => ({ ...current, attributeId: "" }));
      invalidate();
    },
    onError: (error) => toast.error(readError(error, "Failed to assign field")),
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      ecommerceApi.catalog.updateCategoryAttribute(id, body),
    onSuccess: invalidate,
    onError: (error) => toast.error(readError(error, "Failed to update field")),
  });
  const remove = useMutation({
    mutationFn: (id: string) => ecommerceApi.catalog.deleteCategoryAttribute(id),
    onSuccess: () => {
      toast.success("Template field removed");
      invalidate();
    },
  });

  const fields = useMemo(
    () => [
      ...(template?.fields.product ?? []),
      ...(template?.fields.variant ?? []),
      ...(template?.fields.batch ?? []),
    ],
    [template],
  );

  return (
    <Sheet open={Boolean(props.categoryId)} onOpenChange={props.onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>{template?.category.name ?? "Category template"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          {templateQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading template...</p>
          ) : (
            <>
              <div className="rounded-md border p-3 text-sm">
                Brand policy: <span className="font-medium">{template?.brand.policy}</span>
                {template?.brand.showStoreBrand ? (
                  <span className="ml-2 text-muted-foreground">
                    Store brand: {template.brand.storeBrandName}
                  </span>
                ) : null}
              </div>
              {props.canManage ? (
                <div className="grid gap-3 rounded-md border p-3 md:grid-cols-2">
                  <SelectField
                    label="Attribute"
                    value={draft.attributeId}
                    onChange={(attributeId) => setDraft((current) => ({ ...current, attributeId }))}
                    options={props.attributes.map((attribute) => ({
                      value: attribute.id,
                      label: attribute.name,
                    }))}
                    placeholder="Pick an attribute"
                  />
                  <SelectField
                    label="Scope"
                    value={draft.scope}
                    onChange={(scope) => setDraft((current) => ({ ...current, scope: scope as AttributeScope }))}
                    options={scopeOptions}
                  />
                  <SelectField
                    label="Input"
                    value={draft.inputType}
                    onChange={(inputType) =>
                      setDraft((current) => ({ ...current, inputType: inputType as AttributeInputType }))
                    }
                    options={inputTypeOptions}
                  />
                  <TextField
                    label="Unit"
                    value={draft.unit}
                    onChange={(unit) => setDraft((current) => ({ ...current, unit }))}
                  />
                  <TextField
                    label="Group"
                    value={draft.groupName}
                    onChange={(groupName) => setDraft((current) => ({ ...current, groupName }))}
                  />
                  <div className="flex items-end gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={draft.required}
                        onCheckedChange={(value) => setDraft((current) => ({ ...current, required: Boolean(value) }))}
                      />
                      Required
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={draft.filterable}
                        onCheckedChange={(value) => setDraft((current) => ({ ...current, filterable: Boolean(value) }))}
                      />
                      Filter
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={draft.variantDefining}
                        onCheckedChange={(value) =>
                          setDraft((current) => ({ ...current, variantDefining: Boolean(value) }))
                        }
                      />
                      Variant
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <SaveButton
                      loading={assign.isPending}
                      disabled={!draft.attributeId}
                      onClick={() => assign.mutate()}
                    >
                      Assign field
                    </SaveButton>
                  </div>
                </div>
              ) : null}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Input</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Filter</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead className="text-right">Remove</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.length === 0 ? (
                      <EmptyTableRow colSpan={7}>No template fields.</EmptyTableRow>
                    ) : (
                      fields.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <div className="font-medium">{field.attribute.name}</div>
                            <div className="text-xs text-muted-foreground">{field.unit ?? field.groupName ?? "—"}</div>
                          </TableCell>
                          <TableCell>{field.scope}</TableCell>
                          <TableCell>{field.inputType}</TableCell>
                          <TableCell>
                            <Switch
                              size="sm"
                              checked={field.required}
                              disabled={!props.canManage}
                              onCheckedChange={(required) =>
                                update.mutate({ id: field.id, body: { required } })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              size="sm"
                              checked={field.filterable}
                              disabled={!props.canManage}
                              onCheckedChange={(filterable) =>
                                update.mutate({ id: field.id, body: { filterable } })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              size="sm"
                              checked={field.variantDefining}
                              disabled={!props.canManage}
                              onCheckedChange={(variantDefining) =>
                                update.mutate({ id: field.id, body: { variantDefining } })
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {props.canManage ? (
                              <Button variant="ghost" size="icon-sm" onClick={() => remove.mutate(field.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
