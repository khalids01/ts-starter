import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, Pencil, Plus, Power, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/constants/query-keys";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { DiscountCode } from "../types";
import { EcommerceHeader, ecommercePermissions, readError } from "../ui";

type Draft = {
  id?: string;
  code: string;
  description: string;
  type: "percentage" | "fixed_amount";
  value: string;
  currency: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  minimumOrderAmount: string;
  totalUsageLimit: string;
  perCustomerUsageLimit: string;
};

function dateInput(value?: string | null) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

function draftFrom(discount?: DiscountCode): Draft {
  return {
    id: discount?.id,
    code: discount?.code ?? "",
    description: discount?.description ?? "",
    type: discount?.type ?? "percentage",
    value: discount?.value ?? "10.00",
    currency: discount?.currency ?? "BDT",
    isActive: discount?.isActive ?? true,
    startsAt: dateInput(discount?.startsAt),
    endsAt: dateInput(discount?.endsAt),
    minimumOrderAmount: discount?.minimumOrderAmount ?? "",
    totalUsageLimit: discount?.totalUsageLimit?.toString() ?? "",
    perCustomerUsageLimit: discount?.perCustomerUsageLimit?.toString() ?? "",
  };
}

export function AdminDiscountsPage() {
  const { session } = useSession();
  const { canManageDiscounts } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const query = useQuery({
    queryKey: queryKeys.admin.ecommerce.discounts.list(),
    queryFn: () => ecommerceApi.discounts.list() as Promise<DiscountCode[]>,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.discounts.all() });
  const save = useMutation({
    mutationFn: (value: Draft) => {
      const body = {
        code: value.code,
        description: value.description || null,
        type: value.type,
        value: value.value,
        currency: value.type === "fixed_amount" ? value.currency : null,
        isActive: value.isActive,
        startsAt: value.startsAt ? new Date(value.startsAt).toISOString() : null,
        endsAt: value.endsAt ? new Date(value.endsAt).toISOString() : null,
        minimumOrderAmount: value.minimumOrderAmount || null,
        totalUsageLimit: value.totalUsageLimit ? Number(value.totalUsageLimit) : null,
        perCustomerUsageLimit: value.perCustomerUsageLimit ? Number(value.perCustomerUsageLimit) : null,
      };
      return value.id
        ? ecommerceApi.discounts.update(value.id, body)
        : ecommerceApi.discounts.create(body);
    },
    onSuccess: () => { toast.success("Discount saved"); setDraft(null); void refresh(); },
    onError: (error) => toast.error(readError(error, "Failed to save discount")),
  });
  const toggle = useMutation({
    mutationFn: (discount: DiscountCode) =>
      ecommerceApi.discounts.update(discount.id, { isActive: !discount.isActive }),
    onSuccess: () => { toast.success("Discount status updated"); void refresh(); },
    onError: (error) => toast.error(readError(error, "Failed to update discount")),
  });

  return (
    <div className="space-y-6">
      <EcommerceHeader
        title="Discounts"
        description="Manage the single discount code customers can apply during checkout."
        action={canManageDiscounts ? <Button onClick={() => setDraft(draftFrom())}><Plus className="size-4" />Discount code</Button> : null}
      />
      {query.isLoading ? <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">Loading discounts...</div> : null}
      {!query.isLoading && !query.data?.length ? <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">No discount codes yet.</div> : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {query.data?.map((discount) => (
          <article key={discount.id} className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-semibold">{discount.code}</h2><p className="text-sm text-muted-foreground">{discount.description || "No description"}</p></div>
              <Badge variant={discount.isActive ? "default" : "secondary"}>{discount.isActive ? "Active" : "Inactive"}</Badge>
            </div>
            <div className="text-sm">
              <p className="font-medium">{discount.type === "percentage" ? `${discount.value}% off` : `${discount.value} ${discount.currency} off`}</p>
              <p className="text-muted-foreground">Used {discount.usageCount}{discount.totalUsageLimit ? ` of ${discount.totalUsageLimit}` : " times"}</p>
              <p className="text-muted-foreground">Per customer: {discount.perCustomerUsageLimit ?? "Unlimited"}</p>
            </div>
            {canManageDiscounts ? <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setDraft(draftFrom(discount))}><Pencil className="size-4" />Edit</Button>
              <Button size="sm" variant="ghost" disabled={toggle.isPending} onClick={() => toggle.mutate(discount)}><Power className="size-4" />{discount.isActive ? "Disable" : "Enable"}</Button>
            </div> : null}
          </article>
        ))}
      </div>
      <DiscountDialog draft={draft} loading={save.isPending} onChange={setDraft} onSave={(value) => save.mutate(value)} />
    </div>
  );
}

function DiscountDialog(props: { draft: Draft | null; loading: boolean; onChange: (value: Draft | null) => void; onSave: (value: Draft) => void }) {
  const form = useForm<Draft>({ mode: "onChange", defaultValues: draftFrom() });
  const type = form.watch("type");

  useEffect(() => {
    if (props.draft) form.reset(props.draft);
  }, [props.draft, form]);

  return <Dialog open={Boolean(props.draft)} onOpenChange={(open) => !open && props.onChange(null)}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>{props.draft?.id ? "Edit discount" : "Create discount"}</DialogTitle><DialogDescription>Checkout validates dates, currency, minimum spend, and usage limits on the server.</DialogDescription></DialogHeader>
      {props.draft ? <form id="discount-form" className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(props.onSave)}>
        <FormInput label="Code" placeholder="WELCOME10" error={form.formState.errors.code?.message} inputProps={form.register("code", { required: "Code is required" })} />
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Controller control={form.control} name="type" render={({ field }) => (
            <Select value={field.value} onValueChange={(value) => field.onChange(value as Draft["type"])}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select discount type" /></SelectTrigger>
              <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed_amount">Fixed amount</SelectItem></SelectContent>
            </Select>
          )} />
        </div>
        <FormInput label={type === "percentage" ? "Percentage" : "Amount"} type="number" error={form.formState.errors.value?.message} inputProps={form.register("value", { required: "Value is required", validate: (value) => Number(value) > 0 || "Value must be greater than zero" })} />
        {type === "fixed_amount" ? <FormInput label="Currency" error={form.formState.errors.currency?.message} inputProps={form.register("currency", { required: "Currency is required", minLength: { value: 3, message: "Use a 3-letter currency" }, maxLength: { value: 3, message: "Use a 3-letter currency" } })} /> : null}
        <FormInput label="Minimum order amount" type="number" placeholder="Optional" inputProps={form.register("minimumOrderAmount")} />
        <FormInput label="Total usage limit" type="number" placeholder="Unlimited" inputProps={form.register("totalUsageLimit")} />
        <FormInput label="Per-customer limit" type="number" placeholder="Unlimited" inputProps={form.register("perCustomerUsageLimit")} />
        <Controller control={form.control} name="startsAt" render={({ field }) => <DatePickerField label="Starts on" value={field.value} onChange={field.onChange} />} />
        <Controller control={form.control} name="endsAt" render={({ field }) => <DatePickerField label="Ends on" value={field.value} onChange={field.onChange} />} />
        <div className="space-y-1.5 sm:col-span-2"><Label>Description</Label><Textarea {...form.register("description")} /></div>
        <Controller control={form.control} name="isActive" render={({ field }) => <label className="flex items-center gap-3 sm:col-span-2"><Switch checked={field.value} onCheckedChange={field.onChange} /><span className="text-sm">Active</span></label>} />
      </form> : null}
      <DialogFooter><Button type="submit" form="discount-form" disabled={!form.formState.isValid || props.loading}>{props.loading ? "Saving..." : "Save discount"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}

function FormInput(props: { label: string; type?: string; placeholder?: string; error?: string; inputProps: ComponentProps<typeof Input> }) {
  return <div className="space-y-1.5"><Label>{props.label}</Label><Input {...props.inputProps} type={props.type} placeholder={props.placeholder} />{props.error ? <p className="text-xs text-destructive">{props.error}</p> : null}</div>;
}

function DatePickerField(props: { label: string; value: string; onChange: (value: string) => void }) {
  const selected = props.value ? new Date(props.value) : undefined;
  return <div className="space-y-1.5">
    <Label>{props.label}</Label>
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger render={<Button type="button" variant="outline" className="min-w-0 flex-1 justify-start font-normal" />}>
          <CalendarIcon className="size-4" />{selected ? format(selected, "PPP") : "Select date"}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar mode="single" selected={selected} onSelect={(date) => props.onChange(date?.toISOString() ?? "")} />
        </PopoverContent>
      </Popover>
      {selected ? <Button type="button" size="icon" variant="ghost" aria-label={`Clear ${props.label}`} onClick={() => props.onChange("")}><X className="size-4" /></Button> : null}
    </div>
  </div>;
}
