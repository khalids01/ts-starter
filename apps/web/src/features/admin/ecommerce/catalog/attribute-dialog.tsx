import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/multi-select";
import { SaveButton, SelectField, TextField } from "../ui";
import type { AttributeDraft } from "./drafts";
import { attributeTypeOptions } from "./options";
import type { Category } from "../types";
import { Switch } from "@/components/ui/switch";

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
            <div className="grid gap-3">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={draft.filterable}
                  onCheckedChange={(filterable) => props.onChange({ ...draft, filterable })}
                />
                Filterable
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Product categories</p>
              <p className="text-xs text-muted-foreground">Selected categories receive this attribute as a product field by default. Configure variant or batch usage in the category template.</p>
              <MultiSelect
                placeholder="Select categories"
                emptyLabel="No product categories"
                options={props.categories.map((category) => ({ id: category.id, label: category.name }))}
                value={draft.categoryIds}
                onChange={(categoryIds) => props.onChange({ ...draft, categoryIds })}
              />
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
