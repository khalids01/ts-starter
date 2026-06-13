import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { SaveButton, SelectField, TextField } from "../ui";
import type { AttributeDraft } from "./drafts";
import { attributeTypeOptions } from "./options";

export function AttributeDialog(props: {
  draft: AttributeDraft | null;
  loading: boolean;
  onChange: (draft: AttributeDraft | null) => void;
  onSubmit: (draft: AttributeDraft) => void;
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
            <TextField label="Name" value={draft.name} onChange={(name) => props.onChange({ ...draft, name })} />
            <TextField label="Slug" value={draft.slug} onChange={(slug) => props.onChange({ ...draft, slug })} />
            <SelectField
              label="Type"
              value={draft.type}
              onChange={(type) => props.onChange({ ...draft, type: type as AttributeDraft["type"] })}
              options={attributeTypeOptions}
            />
            <TextField
              label="Sort order"
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
