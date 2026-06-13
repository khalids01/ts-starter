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
import type { SupplierDraft } from "./drafts";

export function SupplierDialog(props: {
  draft: SupplierDraft | null;
  loading: boolean;
  onChange: (draft: SupplierDraft | null) => void;
  onSubmit: (draft: SupplierDraft) => void;
}) {
  const draft = props.draft;

  return (
    <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && props.onChange(null)}>
      <DialogContent>
        <DialogHeader><DialogTitle>{draft?.id ? "Edit supplier" : "Create supplier"}</DialogTitle></DialogHeader>
        {draft ? (
          <div className="space-y-3">
            <TextField label="Name" value={draft.name} onChange={(name) => props.onChange({ ...draft, name })} />
            <TextField label="Contact" value={draft.contactName} onChange={(contactName) => props.onChange({ ...draft, contactName })} />
            <TextField label="Email" value={draft.email} onChange={(email) => props.onChange({ ...draft, email })} />
            <TextField label="Phone" value={draft.phone} onChange={(phone) => props.onChange({ ...draft, phone })} />
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
          <SaveButton loading={props.loading} disabled={!draft?.name} onClick={() => draft && props.onSubmit(draft)}>Save</SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
