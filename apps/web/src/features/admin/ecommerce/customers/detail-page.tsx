import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/constants/query-keys";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { EcommerceCustomer } from "../types";
import { ecommercePermissions, formatDate, readError } from "../ui";
import { formatMoney } from "../orders/orders-table";

type CustomerForm = { name: string; email: string; phone: string; adminNote: string };

export function AdminCustomerDetailPage({ customerId }: { customerId: string }) {
  const { session } = useSession();
  const { canManageCustomers } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const form = useForm<CustomerForm>({ mode: "onChange" });
  const query = useQuery({ queryKey: queryKeys.admin.ecommerce.customers.detail(customerId), queryFn: () => ecommerceApi.customers.detail(customerId) as Promise<EcommerceCustomer> });
  useEffect(() => { if (query.data) form.reset({ name: query.data.name, email: query.data.email, phone: query.data.phone ?? "", adminNote: query.data.adminNote ?? "" }); }, [form, query.data]);
  const save = useMutation({
    mutationFn: (values: CustomerForm) => ecommerceApi.customers.update(customerId, { ...values, phone: values.phone || null, adminNote: values.adminNote || null }),
    onSuccess: () => { toast.success("Customer updated"); void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.customers.all() }); },
    onError: (error) => toast.error(readError(error, "Failed to update customer")),
  });
  if (query.isLoading) return <p className="text-sm text-muted-foreground">Loading customer...</p>;
  if (!query.data) return <p className="text-sm text-destructive">Customer not found.</p>;
  const customer = query.data;
  return <div className="space-y-6">
    <div><Link to="/admin/customers" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-2 -ml-3")}><ArrowLeft className="size-4" />Customers</Link><h1 className="text-2xl font-semibold tracking-tight">{customer.name}</h1><p className="text-sm text-muted-foreground">{customer.orderCount} orders · {formatMoney(customer.totalCompletedSpend, customer.completedSpendCurrency)} completed spend</p></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.7fr)]">
      <div className="space-y-6">
        <Card><CardHeader><CardTitle>Order history</CardTitle><CardDescription>Newest orders first.</CardDescription></CardHeader><CardContent className="space-y-3">{customer.orders?.map((order) => <Link key={order.id} to="/admin/orders/$orderId" params={{ orderId: order.id }} className="flex flex-col gap-2 rounded-md border p-3 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{order.orderNumber}</p><p className="text-xs text-muted-foreground">{formatDate(order.placedAt)} · {order.orderStatus} · {order.paymentStatus}</p></div><p className="font-medium">{formatMoney(order.totalAmount, order.currency)}</p></Link>)}{!customer.orders?.length ? <p className="text-sm text-muted-foreground">No linked orders yet. Historical orders require the approved backfill.</p> : null}</CardContent></Card>
        <Card><CardHeader><CardTitle>Latest addresses</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{customer.latestAddresses?.map((address) => <div key={address.id} className="rounded-md border p-3 text-sm"><p className="mb-2 font-medium capitalize">{address.type}</p><p>{address.fullName}</p><p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p><p>{[address.city, address.state, address.postalCode, address.country].filter(Boolean).join(", ")}</p></div>)}{!customer.latestAddresses?.length ? <p className="text-sm text-muted-foreground">No linked addresses yet.</p> : null}</CardContent></Card>
      </div>
      <form className="space-y-4" onSubmit={form.handleSubmit((values) => save.mutate(values))}><Card><CardHeader><CardTitle>Customer details</CardTitle><CardDescription>Corrections affect the profile, not historical order snapshots.</CardDescription></CardHeader><CardContent className="space-y-4"><Field label="Name"><Input disabled={!canManageCustomers} {...form.register("name", { required: true })} /></Field><Field label="Email"><Input type="email" disabled={!canManageCustomers} {...form.register("email", { required: true })} /></Field><Field label="Phone"><Input disabled={!canManageCustomers} {...form.register("phone")} /></Field><Field label="Internal admin note"><Textarea rows={6} disabled={!canManageCustomers} {...form.register("adminNote")} /></Field>{canManageCustomers ? <Button type="submit" disabled={save.isPending || !form.formState.isDirty}>{save.isPending ? "Saving..." : "Save customer"}</Button> : null}</CardContent></Card></form>
    </div>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>; }
