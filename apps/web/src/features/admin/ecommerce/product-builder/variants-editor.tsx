import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CategoryAttribute } from "../types";
import { EmptyTableRow, SelectField } from "../ui";
import { variantDraft, type VariantDraft } from "./drafts";

export function VariantsEditor(props: {
  fields: CategoryAttribute[];
  variants: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
}) {
  const updateVariant = (index: number, patch: Partial<VariantDraft>) => {
    props.onChange(
      props.variants.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, ...patch } : variant,
      ),
    );
  };
  const addVariant = () => props.onChange([...props.variants, variantDraft()]);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={addVariant}>
          <Plus className="mr-2 h-4 w-4" />
          Variant
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Remove</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.variants.length === 0 ? (
              <EmptyTableRow colSpan={7}>No variants yet.</EmptyTableRow>
            ) : (
              props.variants.map((variant, index) => (
                <TableRow key={variant.id ?? index}>
                  <TableCell>
                    <Input value={variant.sku} placeholder="auto" onChange={(event) => updateVariant(index, { sku: event.target.value })} />
                  </TableCell>
                  <TableCell>
                    <Input value={variant.name} placeholder="auto" onChange={(event) => updateVariant(index, { name: event.target.value })} />
                  </TableCell>
                  <TableCell>
                    <div className="grid gap-2">
                      <Input value={variant.price} placeholder="Price" onChange={(event) => updateVariant(index, { price: event.target.value })} />
                      <Input value={variant.costPrice} placeholder="Cost" onChange={(event) => updateVariant(index, { costPrice: event.target.value })} />
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[220px]">
                    <div className="grid gap-2">
                      {props.fields.map((field) => (
                        <SelectField
                          key={field.id}
                          label={field.attribute.name}
                          value={
                            variant.attributeValueIds.find((id) =>
                              field.attribute.values?.some((value) => value.id === id),
                            ) ?? "none"
                          }
                          onChange={(valueId) => {
                            const otherIds = variant.attributeValueIds.filter(
                              (id) => !field.attribute.values?.some((value) => value.id === id),
                            );
                            updateVariant(index, {
                              attributeValueIds: valueId === "none" ? otherIds : [...otherIds, valueId],
                            });
                          }}
                          options={[
                            { value: "none", label: "Not set" },
                            ...(field.attribute.values ?? []).map((value) => ({ value: value.id, label: value.label })),
                          ]}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={variant.isDefault}
                      onCheckedChange={(isDefault) => updateVariant(index, { isDefault })}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={variant.isActive}
                      onCheckedChange={(isActive) => updateVariant(index, { isActive })}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => props.onChange(props.variants.filter((_, currentIndex) => currentIndex !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
