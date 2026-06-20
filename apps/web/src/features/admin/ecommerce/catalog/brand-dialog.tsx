import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImagePickerField } from "../image-picker-fields";
import { Field, SaveButton, TextField } from "../ui";
import type { BrandDraft } from "./drafts";

export function BrandDialog(props: {
  draft: BrandDraft | null;
  loading: boolean;
  onChange: (draft: BrandDraft | null) => void;
  onSubmit: (draft: BrandDraft) => void;
}) {
  const draft = props.draft;

  return (
    <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && props.onChange(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{draft?.id ? "Edit brand" : "Create brand"}</DialogTitle>
        </DialogHeader>
        {draft ? (
          <div className="space-y-3">
            <TextField label="Name" value={draft.name} onChange={(name) => props.onChange({ ...draft, name })} />
            <TextField label="Slug" value={draft.slug} onChange={(slug) => props.onChange({ ...draft, slug })} />
            <ImagePickerField
              label="Logo image"
              value={draft.logoUrl}
              onChange={(logoUrl) => props.onChange({ ...draft, logoUrl })}
            />
            <TextField label="Website URL" value={draft.websiteUrl} onChange={(websiteUrl) => props.onChange({ ...draft, websiteUrl })} />
            <Field label="Description">
              <Textarea
                value={draft.description}
                onChange={(event) => props.onChange({ ...draft, description: event.target.value })}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={draft.isActive} onCheckedChange={(isActive) => props.onChange({ ...draft, isActive })} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={draft.isFeatured} onCheckedChange={(isFeatured) => props.onChange({ ...draft, isFeatured })} />
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
