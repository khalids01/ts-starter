import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryBrandPolicy, Category } from "../types";
import { ImagePickerField } from "../image-picker-fields";
import { Field, SaveButton, SelectField, TextField } from "../ui";
import type { CategoryDraft } from "./drafts";
import { brandPolicyOptions } from "./options";

export function CategoryDialog(props: {
  draft: CategoryDraft | null;
  categories: Category[];
  loading: boolean;
  onChange: (draft: CategoryDraft | null) => void;
  onSubmit: (draft: CategoryDraft) => void;
}) {
  const draft = props.draft;

  return (
    <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && props.onChange(null)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{draft?.id ? "Edit category" : "Create category"}</DialogTitle>
        </DialogHeader>
        {draft ? (
          <div className="space-y-3">
            <TextField label="Name" value={draft.name} onChange={(name) => props.onChange({ ...draft, name })} />
            <TextField label="Slug" value={draft.slug} onChange={(slug) => props.onChange({ ...draft, slug })} />
            <Field label="Description">
              <Textarea
                value={draft.description}
                onChange={(event) => props.onChange({ ...draft, description: event.target.value })}
              />
            </Field>
            <ImagePickerField
              label="Category image"
              value={draft.imageUrl}
              onChange={(imageUrl) => props.onChange({ ...draft, imageUrl })}
            />
            <SelectField
              label="Parent"
              value={draft.parentId}
              onChange={(parentId) => props.onChange({ ...draft, parentId })}
              options={[
                { value: "none", label: "No parent" },
                ...props.categories
                  .filter((category) => category.id !== draft.id)
                  .map((category) => ({ value: category.id, label: category.name })),
              ]}
            />
            <SelectField
              label="Brand policy"
              value={draft.brandPolicy}
              onChange={(brandPolicy) =>
                props.onChange({ ...draft, brandPolicy: brandPolicy as CategoryBrandPolicy })
              }
              options={brandPolicyOptions}
            />
            <SelectField label="Product handling" value={draft.fulfillmentKind} onChange={value => props.onChange({ ...draft, fulfillmentKind: value as CategoryDraft["fulfillmentKind"], ...(value !== "gadget" ? { serialTracking: "none", warrantyDays: "0" } : {}) })} options={[{ value: "standard", label: "Standard" }, { value: "packaged_food", label: "Packaged food" }, { value: "fresh_food", label: "Fresh / prepared food" }, { value: "gadget", label: "Gadget" }, { value: "clothing", label: "Clothing" }]} />
            <p className="text-muted-foreground text-xs">Set handling on each product category. Parent handling is not inherited. Food and clothing cannot have warranty.</p>
            {draft.fulfillmentKind === "gadget" ? <>
              <SelectField label="Unit tracking" value={draft.serialTracking} onChange={value => props.onChange({ ...draft, serialTracking: value as CategoryDraft["serialTracking"] })} options={[{ value: "none", label: "None" }, { value: "serial", label: "Serial" }, { value: "imei", label: "IMEI" }, { value: "serial_and_imei", label: "Serial and IMEI" }]} />
              <TextField label="Warranty days from delivery (0 disables)" value={draft.warrantyDays} onChange={warrantyDays => props.onChange({ ...draft, warrantyDays })} />
            </> : null}
            <TextField
              label="Sort order"
              value={draft.sortOrder}
              onChange={(sortOrder) => props.onChange({ ...draft, sortOrder })}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={draft.showStoreBrand}
                  onCheckedChange={(showStoreBrand) => props.onChange({ ...draft, showStoreBrand })}
                />
                Store brand
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={draft.isActive}
                  onCheckedChange={(isActive) => props.onChange({ ...draft, isActive })}
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={draft.isFeatured}
                  onCheckedChange={(isFeatured) => props.onChange({ ...draft, isFeatured })}
                />
                Featured
              </label>
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <SaveButton loading={props.loading} disabled={!draft?.name} onClick={() => draft && props.onSubmit(draft)}>
            Save
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
