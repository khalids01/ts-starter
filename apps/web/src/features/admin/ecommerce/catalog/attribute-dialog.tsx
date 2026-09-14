import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { SaveButton, SelectField, TextField } from "../ui";
import type { AttributeDraft } from "./drafts";
import { attributeTypeOptions } from "./options";
import type { Category } from "../types";

export function AttributeDialog(props: {
  draft: AttributeDraft | null;
  loading: boolean;
  onChange: (draft: AttributeDraft | null) => void;
  onSubmit: (draft: AttributeDraft) => void;
  categories: Category[];
}) {
  const draft = props.draft;

  return (
    <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && props.onChange(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{draft?.id ? "Edit attribute" : "Create attribute"}</DialogTitle>
        </DialogHeader>
        {draft ? (
          <div className="space-y-3">
            <TextField label="Name" placeholder="e.g. Color" value={draft.name} onChange={(name) => props.onChange({ ...draft, name })} />
            <TextField label="Slug" placeholder="auto-generated from name" value={draft.slug} onChange={(slug) => props.onChange({ ...draft, slug })} />
            <SelectField
              label="Type"
              value={draft.type}
              onChange={(type) => props.onChange({ ...draft, type: type as AttributeDraft["type"] })}
              options={attributeTypeOptions}
            />
            <TextField
              label="Sort order"
              placeholder="0"
              value={draft.sortOrder}
              onChange={(sortOrder) => props.onChange({ ...draft, sortOrder })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={draft.filterable}
                  onCheckedChange={(filterable) => props.onChange({ ...draft, filterable })}
                />
                Filterable
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={draft.variantDefining}
                  onCheckedChange={(variantDefining) => props.onChange({ ...draft, variantDefining })}
                />
                Variant defining
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Direct categories</p>
              <p className="text-xs text-muted-foreground">Selected categories get a product field by default. Configure details in the category template.</p>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                {props.categories.map((category) => {
                  const checked = draft.categoryIds.includes(category.id);
                  return <label key={category.id} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={checked} onCheckedChange={(value) => props.onChange({ ...draft, categoryIds: value ? [...draft.categoryIds, category.id] : draft.categoryIds.filter((id) => id !== category.id) })} />
                    {category.name}
                  </label>;
                })}
                {props.categories.length === 0 ? <p className="text-sm text-muted-foreground">No categories available.</p> : null}
              </div>
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
