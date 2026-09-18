import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SaveButton, TextField } from "../ui";
import type { ShippingRateDraft } from "./drafts";

export function ShippingRateDialog(props: {
  draft: ShippingRateDraft | null;
  loading: boolean;
  onChange: (draft: ShippingRateDraft | null) => void;
  onSubmit: (draft: ShippingRateDraft) => void;
}) {
  const draft = props.draft;
  const valid = Boolean(draft?.label.trim() && draft?.code.trim() && draft?.currency.length === 3);

  return (
    <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && props.onChange(null)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{draft?.id ? "Edit shipping rate" : "Create shipping rate"}</DialogTitle>
          <DialogDescription>
            Configure the checkout label, price, currency, and optional free-shipping threshold.
          </DialogDescription>
        </DialogHeader>
        {draft ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" value={draft.label} onChange={(label) => props.onChange({ ...draft, label })} />
            <TextField label="Code" value={draft.code} onChange={(code) => props.onChange({ ...draft, code })} placeholder="standard-delivery" />
            <TextField label="Amount" type="number" value={draft.amount} onChange={(amount) => props.onChange({ ...draft, amount })} />
            <TextField label="Currency" value={draft.currency} onChange={(currency) => props.onChange({ ...draft, currency: currency.toUpperCase().slice(0, 3) })} placeholder="BDT" />
            <TextField label="Free over amount" type="number" value={draft.freeOverAmount} onChange={(freeOverAmount) => props.onChange({ ...draft, freeOverAmount })} placeholder="Optional" />
            <TextField label="Sort order" type="number" value={draft.sortOrder} onChange={(sortOrder) => props.onChange({ ...draft, sortOrder })} />
          </div>
        ) : null}
        <DialogFooter>
          <SaveButton loading={props.loading} disabled={!valid} onClick={() => draft && props.onSubmit(draft)}>
            Save rate
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
