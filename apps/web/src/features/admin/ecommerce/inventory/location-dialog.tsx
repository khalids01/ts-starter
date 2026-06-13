import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Field, SaveButton, TextField } from "../ui";
import type { LocationDraft } from "./drafts";

export function LocationDialog(props: {
  draft: LocationDraft | null;
  loading: boolean;
  onChange: (draft: LocationDraft | null) => void;
  onSubmit: (draft: LocationDraft) => void;
}) {
  const draft = props.draft;

  return (
    <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && props.onChange(null)}>
      <DialogContent>
        <DialogHeader><DialogTitle>{draft?.id ? "Edit location" : "Create location"}</DialogTitle></DialogHeader>
        {draft ? (
          <div className="space-y-3">
            <TextField label="Name" value={draft.name} onChange={(name) => props.onChange({ ...draft, name })} />
            <TextField label="Code" value={draft.code} onChange={(code) => props.onChange({ ...draft, code })} />
            <Field label="Address">
              <Textarea value={draft.address} onChange={(event) => props.onChange({ ...draft, address: event.target.value })} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={draft.isActive} onCheckedChange={(isActive) => props.onChange({ ...draft, isActive })} />
              Active
            </label>
          </div>
        ) : null}
        <DialogFooter>
          <SaveButton loading={props.loading} disabled={!draft?.name || !draft?.code} onClick={() => draft && props.onSubmit(draft)}>Save</SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
