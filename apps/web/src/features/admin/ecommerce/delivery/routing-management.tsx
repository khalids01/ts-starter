import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryKeys } from "@/constants/query-keys";
import { ecommerceApi } from "../apiCall";
import type { CourierConnection, CourierRoutingRule, CourierService, ShippingRate } from "../types";
import { readError } from "../ui";

type Props = { connections: CourierConnection[]; canManage: boolean; canDispatch: boolean };

export function RoutingManagement({ connections, canManage, canDispatch }: Props) {
  const queryClient = useQueryClient();
  const [serviceOpen, setServiceOpen] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ connectionId: "", code: "home_delivery", displayName: "Home delivery", shippingRateIds: [] as string[] });
  const [ruleForm, setRuleForm] = useState({ name: "", priority: "100", connectionId: "", serviceId: "" });
  const servicesQuery = useQuery({ queryKey: queryKeys.admin.ecommerce.delivery.services(), queryFn: () => ecommerceApi.delivery.services() as Promise<CourierService[]> });
  const rulesQuery = useQuery({ queryKey: queryKeys.admin.ecommerce.delivery.rules(), queryFn: () => ecommerceApi.delivery.rules() as Promise<CourierRoutingRule[]> });
  const dispatchesQuery = useQuery({ queryKey: queryKeys.admin.ecommerce.delivery.dispatches(), queryFn: () => ecommerceApi.delivery.dispatches() as Promise<any[]> });
  const ratesQuery = useQuery({ queryKey: queryKeys.admin.ecommerce.shipping.rates(), queryFn: () => ecommerceApi.shipping.rates() as Promise<ShippingRate[]> });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.delivery.all() });
  const createService = useMutation({
    mutationFn: () => ecommerceApi.delivery.createService(serviceForm),
    onSuccess: () => { toast.success("Courier service created"); setServiceOpen(false); refresh(); },
    onError: (error) => toast.error(readError(error, "Failed to create courier service")),
  });
  const updateService = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => ecommerceApi.delivery.updateService(id, { enabled }),
    onSuccess: refresh,
    onError: (error) => toast.error(readError(error, "Failed to update courier service")),
  });
  const createRule = useMutation({
    mutationFn: () => ecommerceApi.delivery.createRule({ ...ruleForm, priority: Number(ruleForm.priority), conditions: {} }),
    onSuccess: () => { toast.success("Routing rule created"); setRuleOpen(false); refresh(); },
    onError: (error) => toast.error(readError(error, "Failed to create routing rule")),
  });
  const updateRule = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => ecommerceApi.delivery.updateRule(id, { enabled }),
    onSuccess: refresh,
    onError: (error) => toast.error(readError(error, "Failed to update routing rule")),
  });
  const queue = useMutation({
    mutationFn: (id: string) => ecommerceApi.delivery.queueDispatch(id),
    onSuccess: () => { toast.success("Dispatch queued"); refresh(); },
    onError: (error) => toast.error(readError(error, "Failed to queue dispatch")),
  });
  const services = servicesQuery.data ?? [];
  const rules = rulesQuery.data ?? [];
  const dispatches = dispatchesQuery.data ?? [];
  const rates = ratesQuery.data ?? [];
  const eligibleConnections = connections.filter((item) => item.enabled && item.healthState === "healthy");

  return (
    <Tabs defaultValue="services" className="space-y-3">
      <TabsList className="h-auto max-w-full flex-wrap justify-start overflow-visible">
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="rules">Routing rules</TabsTrigger>
        <TabsTrigger value="dispatches">Dispatches</TabsTrigger>
      </TabsList>
      <TabsContent value="services" className="space-y-3">
        <div className="flex items-center justify-between"><div><h2 className="font-semibold">Courier services</h2><p className="text-muted-foreground text-sm">Map provider services to customer-facing shipping methods.</p></div>{canManage ? <Button size="sm" disabled={!eligibleConnections.length || !rates.length} onClick={() => { const connectionId = eligibleConnections[0]?.id ?? ""; setServiceForm((value) => ({ ...value, connectionId })); setServiceOpen(true); }}><Plus className="mr-2 size-4" /> Add service</Button> : null}</div>
        {!services.length ? <Card><CardContent className="text-muted-foreground pt-6">No courier services configured.</CardContent></Card> : services.map((service) => <Card key={service.id}><CardHeader><CardTitle className="flex gap-2">{service.displayName}<Badge variant={service.enabled ? "default" : "secondary"}>{service.enabled ? "Enabled" : "Disabled"}</Badge></CardTitle><CardDescription>{service.providerName} · {service.connectionName} · {service.shippingMethods.map((item) => item.label).join(", ")}</CardDescription></CardHeader>{canManage ? <CardContent><Button size="sm" variant="outline" onClick={() => updateService.mutate({ id: service.id, enabled: !service.enabled })}>{service.enabled ? "Disable" : "Enable"}</Button></CardContent> : null}</Card>)}
      </TabsContent>
      <TabsContent value="rules" className="space-y-3">
        <div className="flex items-center justify-between"><div><h2 className="font-semibold">Routing rules</h2><p className="text-muted-foreground text-sm">Rules are evaluated by priority and frozen into each confirmed dispatch.</p></div>{canManage ? <Button size="sm" disabled={!services.length} onClick={() => { const service = services[0]; setRuleForm((value) => ({ ...value, connectionId: service?.connectionId ?? "", serviceId: service?.id ?? "" })); setRuleOpen(true); }}><Plus className="mr-2 size-4" /> Add rule</Button> : null}</div>
        {!rules.length ? <Card><CardContent className="text-muted-foreground pt-6">No routing rules configured.</CardContent></Card> : rules.map((rule) => <Card key={rule.id}><CardHeader><CardTitle className="flex gap-2">{rule.name}<Badge variant={rule.enabled ? "default" : "secondary"}>v{rule.version} · {rule.enabled ? "Enabled" : "Disabled"}</Badge></CardTitle><CardDescription>Priority {rule.priority} · {rule.connectionName} / {rule.serviceName}</CardDescription></CardHeader>{canManage ? <CardContent><Button size="sm" variant="outline" onClick={() => updateRule.mutate({ id: rule.id, enabled: !rule.enabled })}>{rule.enabled ? "Disable" : "Enable"}</Button></CardContent> : null}</Card>)}
      </TabsContent>
      <TabsContent value="dispatches" className="space-y-3">
        {!dispatches.length ? <Card><CardContent className="text-muted-foreground pt-6">No courier dispatches confirmed yet. Confirm a recommendation from an order.</CardContent></Card> : dispatches.map((dispatch) => <Card key={dispatch.id}><CardHeader><CardTitle>{dispatch.order.orderNumber}</CardTitle><CardDescription>{dispatch.connection.displayName} · {dispatch.service.displayName} · {dispatch.status}</CardDescription></CardHeader>{canDispatch && dispatch.status === "confirmed" ? <CardContent><Button size="sm" onClick={() => queue.mutate(dispatch.id)}>Queue dispatch</Button></CardContent> : null}</Card>)}
      </TabsContent>

      <Dialog open={serviceOpen} onOpenChange={setServiceOpen}><DialogContent><DialogHeader><DialogTitle>Add courier service</DialogTitle></DialogHeader><div className="grid gap-4"><Field label="Connection"><select className="border-input bg-background h-10 rounded-md border px-3" value={serviceForm.connectionId} onChange={(event) => setServiceForm({ ...serviceForm, connectionId: event.target.value })}>{eligibleConnections.map((item) => <option key={item.id} value={item.id}>{item.displayName}</option>)}</select></Field><Field label="Service code"><Input value={serviceForm.code} onChange={(event) => setServiceForm({ ...serviceForm, code: event.target.value })} /></Field><Field label="Display name"><Input value={serviceForm.displayName} onChange={(event) => setServiceForm({ ...serviceForm, displayName: event.target.value })} /></Field><Field label="Delivery methods"><div className="grid gap-2">{rates.map((rate) => <label key={rate.id} className="flex gap-2"><input type="checkbox" checked={serviceForm.shippingRateIds.includes(rate.id)} onChange={(event) => setServiceForm({ ...serviceForm, shippingRateIds: event.target.checked ? [...serviceForm.shippingRateIds, rate.id] : serviceForm.shippingRateIds.filter((id) => id !== rate.id) })} />{rate.label}</label>)}</div></Field></div><DialogFooter><Button disabled={!serviceForm.connectionId || !serviceForm.shippingRateIds.length || createService.isPending} onClick={() => createService.mutate()}>Save service</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={ruleOpen} onOpenChange={setRuleOpen}><DialogContent><DialogHeader><DialogTitle>Add routing rule</DialogTitle></DialogHeader><div className="grid gap-4"><Field label="Rule name"><Input value={ruleForm.name} onChange={(event) => setRuleForm({ ...ruleForm, name: event.target.value })} /></Field><Field label="Priority"><Input type="number" value={ruleForm.priority} onChange={(event) => setRuleForm({ ...ruleForm, priority: event.target.value })} /></Field><Field label="Courier service"><select className="border-input bg-background h-10 rounded-md border px-3" value={ruleForm.serviceId} onChange={(event) => { const service = services.find((item) => item.id === event.target.value); setRuleForm({ ...ruleForm, serviceId: event.target.value, connectionId: service?.connectionId ?? "" }); }}>{services.map((item) => <option key={item.id} value={item.id}>{item.connectionName} / {item.displayName}</option>)}</select></Field></div><DialogFooter><Button disabled={!ruleForm.name.trim() || !ruleForm.serviceId || createRule.isPending} onClick={() => createRule.mutate()}>Save rule</Button></DialogFooter></DialogContent></Dialog>
    </Tabs>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label>{label}</Label>{children}</div>;
}
