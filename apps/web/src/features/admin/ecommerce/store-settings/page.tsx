import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/constants/query-keys";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { StoreSettings } from "../types";
import { EcommerceHeader, ecommercePermissions, readError } from "../ui";

type FormValues = Omit<StoreSettings, "id">;

export function AdminStoreSettingsPage() {
  const { session } = useSession();
  const { canManageStoreSettings } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({ mode: "onChange" });
  const query = useQuery({
    queryKey: queryKeys.admin.ecommerce.storeSettings.all(),
    queryFn: () => ecommerceApi.storeSettings.get() as Promise<StoreSettings>,
  });

  useEffect(() => {
    if (query.data) form.reset({
      storeName: query.data.storeName,
      supportEmail: query.data.supportEmail ?? "",
      supportPhone: query.data.supportPhone ?? "",
      defaultCurrency: query.data.defaultCurrency,
      orderNumberPrefix: query.data.orderNumberPrefix,
      reservationDurationMinutes: query.data.reservationDurationMinutes,
      checkoutEnabled: query.data.checkoutEnabled,
      checkoutNotice: query.data.checkoutNotice ?? "",
    });
  }, [form, query.data]);

  const save = useMutation({
    mutationFn: (values: FormValues) => ecommerceApi.storeSettings.update({
      ...values,
      supportEmail: values.supportEmail || null,
      supportPhone: values.supportPhone || null,
      checkoutNotice: values.checkoutNotice || null,
      defaultCurrency: values.defaultCurrency.toUpperCase(),
      orderNumberPrefix: values.orderNumberPrefix.toUpperCase(),
    }),
    onSuccess: () => {
      toast.success("Store settings saved");
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.storeSettings.all() });
    },
    onError: (error) => toast.error(readError(error, "Failed to save store settings")),
  });

  if (query.isLoading) return <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">Loading store settings...</div>;
  if (query.isError) return <div className="rounded-md border p-8 text-center text-sm text-destructive">{readError(query.error, "Failed to load store settings")}</div>;

  const disabled = !canManageStoreSettings || save.isPending;
  return <form className="space-y-6" onSubmit={form.handleSubmit((values) => save.mutate(values))}>
    <EcommerceHeader title="Store settings" description="Configure the core values used by checkout and new orders." action={canManageStoreSettings ? <Button type="submit" disabled={!form.formState.isValid || save.isPending}>{save.isPending ? "Saving..." : "Save settings"}</Button> : null} />
    <div className="grid gap-6 xl:grid-cols-2">
      <SettingsCard title="Store details" description="Customer-facing store and support information.">
        <Field label="Store name" error={form.formState.errors.storeName?.message}><Input disabled={disabled} {...form.register("storeName", { required: "Store name is required" })} /></Field>
        <Field label="Support email" error={form.formState.errors.supportEmail?.message}><Input type="email" disabled={disabled} {...form.register("supportEmail", { pattern: { value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" } })} /></Field>
        <Field label="Support phone"><Input disabled={disabled} {...form.register("supportPhone")} /></Field>
      </SettingsCard>
      <SettingsCard title="Orders" description="Defaults applied server-side when a new order is created.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default currency" hint="Three-letter ISO code, for example BDT."><Input maxLength={3} disabled={disabled} className="uppercase" {...form.register("defaultCurrency", { required: true, pattern: /^[A-Za-z]{3}$/ })} /></Field>
          <Field label="Order-number prefix" hint="Letters, numbers, and single hyphens."><Input maxLength={12} disabled={disabled} className="uppercase" {...form.register("orderNumberPrefix", { required: true, pattern: /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/ })} /></Field>
        </div>
        <Field label="Inventory reservation (minutes)" hint="Between 1 minute and 24 hours."><Input type="number" min={1} max={1440} disabled={disabled} {...form.register("reservationDurationMinutes", { valueAsNumber: true, required: true, min: 1, max: 1440 })} /></Field>
      </SettingsCard>
      <SettingsCard title="Checkout" description="Pause order placement without hiding the storefront.">
        <div className="flex items-center justify-between gap-4 rounded-md border p-4"><div><Label>Enable checkout</Label><p className="text-sm text-muted-foreground">Customers can submit new orders.</p></div><Switch disabled={disabled} checked={form.watch("checkoutEnabled") ?? false} onCheckedChange={(checked) => form.setValue("checkoutEnabled", checked, { shouldDirty: true, shouldValidate: true })} /></div>
        <Field label="Checkout notice" hint="Shown on checkout and used as the server rejection message when checkout is disabled."><Textarea rows={4} maxLength={500} disabled={disabled} {...form.register("checkoutNotice")} /></Field>
      </SettingsCard>
    </div>
  </form>;
}

function SettingsCard(props: { title: string; description: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle>{props.title}</CardTitle><CardDescription>{props.description}</CardDescription></CardHeader><CardContent className="space-y-4">{props.children}</CardContent></Card>;
}

function Field(props: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{props.label}</Label>{props.children}{props.error ? <p className="text-xs text-destructive">{props.error}</p> : props.hint ? <p className="text-xs text-muted-foreground">{props.hint}</p> : null}</div>;
}
