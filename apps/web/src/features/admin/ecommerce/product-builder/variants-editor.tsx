import type { ReactNode } from "react";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CategoryAttribute } from "../types";
import { Field, SelectField, TextField } from "../ui";
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

  const setDefaultVariant = (index: number, isDefault: boolean) => {
    props.onChange(
      props.variants.map((variant, currentIndex) => ({
        ...variant,
        isDefault: currentIndex === index ? isDefault : false,
      })),
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

      {props.variants.length === 0 ? (
        <div className="grid gap-3 rounded-md border p-4 text-sm">
          <p className="text-muted-foreground">No variants yet.</p>
          <div>
            <Button type="button" variant="outline" onClick={addVariant}>
              <Plus className="mr-2 h-4 w-4" />
              Add variant
            </Button>
          </div>
        </div>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={props.variants.length === 1 ? ["variant-0"] : []}
          className="gap-3"
        >
          {props.variants.map((variant, index) => (
            <VariantAccordionItem
              key={variant.id ?? index}
              value={`variant-${index}`}
              index={index}
              variant={variant}
              fields={props.fields}
              onUpdate={(patch) => updateVariant(index, patch)}
              onSetDefault={(isDefault) => setDefaultVariant(index, isDefault)}
              onRemove={() =>
                props.onChange(
                  props.variants.filter((_, currentIndex) => currentIndex !== index),
                )
              }
            />
          ))}
        </Accordion>
      )}
    </div>
  );
}

function VariantAccordionItem(props: {
  value: string;
  index: number;
  variant: VariantDraft;
  fields: CategoryAttribute[];
  onUpdate: (patch: Partial<VariantDraft>) => void;
  onSetDefault: (isDefault: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <AccordionItem value={props.value} className="rounded-md border px-4">
      <AccordionTrigger className="gap-3 py-4 text-sm hover:no-underline">
        <VariantHeader
          index={props.index}
          variant={props.variant}
          onRemove={props.onRemove}
        />
      </AccordionTrigger>
      <AccordionContent className="pb-4 text-sm">
        <div className="grid gap-5">
          <FormSection title="Identity">
            <div className="grid gap-4 md:grid-cols-3">
              <TextField
                label="SKU"
                value={props.variant.sku}
                placeholder="Auto"
                onChange={(sku) => props.onUpdate({ sku })}
              />
              <TextField
                label="Name"
                value={props.variant.name}
                placeholder="Auto"
                onChange={(name) => props.onUpdate({ name })}
              />
              <TextField
                label="Barcode"
                value={props.variant.barcode}
                onChange={(barcode) => props.onUpdate({ barcode })}
              />
            </div>
          </FormSection>

          <FormSection title="Pricing">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <TextField
                label="Price"
                type="number"
                value={props.variant.price}
                onChange={(price) => props.onUpdate({ price })}
              />
              <TextField
                label="Compare at price"
                type="number"
                value={props.variant.compareAtPrice}
                onChange={(compareAtPrice) => props.onUpdate({ compareAtPrice })}
              />
              <TextField
                label="Cost price"
                type="number"
                value={props.variant.costPrice}
                onChange={(costPrice) => props.onUpdate({ costPrice })}
              />
              <TextField
                label="Currency"
                value={props.variant.currency}
                onChange={(currency) => props.onUpdate({ currency })}
              />
            </div>
          </FormSection>

          <FormSection title="Variant options">
            <VariantOptionsFields
              fields={props.fields}
              variant={props.variant}
              onChange={(attributeValueIds) => props.onUpdate({ attributeValueIds })}
            />
          </FormSection>

          <FormSection title="Media">
            <ImageUrlList
              imageUrls={props.variant.imageUrls}
              onChange={(imageUrls) => props.onUpdate({ imageUrls })}
            />
          </FormSection>

          <FormSection title="Shipping and status">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <TextField
                label="Weight"
                type="number"
                value={props.variant.weightValue}
                onChange={(weightValue) => props.onUpdate({ weightValue })}
              />
              <SelectField
                label="Weight unit"
                value={props.variant.weightUnit}
                onChange={(weightUnit) =>
                  props.onUpdate({
                    weightUnit: weightUnit as VariantDraft["weightUnit"],
                  })
                }
                options={[
                  { value: "none", label: "Not set" },
                  { value: "g", label: "g" },
                  { value: "kg", label: "kg" },
                  { value: "lb", label: "lb" },
                  { value: "oz", label: "oz" },
                ]}
              />
              <SwitchField
                label="Default variant"
                description="Only one variant can be marked as default."
                checked={props.variant.isDefault}
                onChange={props.onSetDefault}
              />
              <SwitchField
                label="Active"
                description="Inactive variants stay saved but are not sellable."
                checked={props.variant.isActive}
                onChange={(isActive) => props.onUpdate({ isActive })}
              />
            </div>
          </FormSection>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function VariantHeader(props: {
  index: number;
  variant: VariantDraft;
  onRemove: () => void;
}) {
  const title = props.variant.name || `Variant ${props.index + 1}`;

  return (
    <div className="flex w-full min-w-0 items-start justify-between gap-3">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium">{title}</span>
          {props.variant.isDefault ? <Badge>Default</Badge> : null}
          <Badge variant={props.variant.isActive ? "secondary" : "outline"}>
            {props.variant.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{props.variant.sku || "Auto SKU"}</span>
          {props.variant.price ? <span>{props.variant.price} {props.variant.currency}</span> : null}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="Remove variant"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          props.onRemove();
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function VariantOptionsFields(props: {
  fields: CategoryAttribute[];
  variant: VariantDraft;
  onChange: (attributeValueIds: string[]) => void;
}) {
  if (props.fields.length === 0) {
    return (
      <p className="rounded-md border p-3 text-sm text-muted-foreground">
        No variant options configured for this category.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {props.fields.map((field) => (
        <SelectField
          key={field.id}
          label={`${field.attribute.name}${field.required ? " *" : ""}`}
          value={
            props.variant.attributeValueIds.find((id) =>
              field.attribute.values?.some((value) => value.id === id),
            ) ?? "none"
          }
          onChange={(valueId) => {
            const otherIds = props.variant.attributeValueIds.filter(
              (id) => !field.attribute.values?.some((value) => value.id === id),
            );
            props.onChange(valueId === "none" ? otherIds : [...otherIds, valueId]);
          }}
          options={[
            { value: "none", label: "Not set" },
            ...(field.attribute.values ?? []).map((value) => ({
              value: value.id,
              label: value.label,
            })),
          ]}
        />
      ))}
    </div>
  );
}

function ImageUrlList(props: {
  imageUrls: string[];
  onChange: (imageUrls: string[]) => void;
}) {
  const update = (index: number, value: string) => {
    props.onChange(
      props.imageUrls.map((url, currentIndex) =>
        currentIndex === index ? value : url,
      ),
    );
  };

  return (
    <div className="grid gap-3">
      {props.imageUrls.length === 0 ? (
        <div className="rounded-md border p-3">
          <VariantImagePreview url="" />
        </div>
      ) : null}
      {props.imageUrls.map((url, index) => (
        <div key={index} className="grid gap-3 rounded-md border p-3 md:grid-cols-[96px_1fr_auto] md:items-center">
          <VariantImagePreview url={url} />
          <Input
            value={url}
            placeholder="Image URL"
            onChange={(event) => update(index, event.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Remove image"
            onClick={() =>
              props.onChange(props.imageUrls.filter((_, currentIndex) => currentIndex !== index))
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => props.onChange([...props.imageUrls, ""])}
        >
          <Plus className="mr-2 h-4 w-4" />
          Image
        </Button>
      </div>
    </div>
  );
}

function VariantImagePreview(props: { url: string }) {
  if (!props.url) {
    return (
      <div className="grid aspect-square w-24 place-items-center rounded-md bg-muted text-muted-foreground">
        <ImageIcon className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="aspect-square w-24 overflow-hidden rounded-md border bg-muted">
      <img
        src={props.url}
        alt="Variant"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function FormSection(props: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3 rounded-md border p-4">
      <h3 className="text-sm font-medium">{props.title}</h3>
      {props.children}
    </section>
  );
}

function SwitchField(props: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Field label={props.label} hint={props.description}>
      <div className="flex h-10 items-center">
        <Switch checked={props.checked} onCheckedChange={props.onChange} />
      </div>
    </Field>
  );
}
