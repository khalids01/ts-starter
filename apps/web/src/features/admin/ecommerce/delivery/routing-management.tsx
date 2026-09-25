import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { queryKeys } from "@/constants/query-keys";
import { ecommerceApi } from "../apiCall";
import type {
  CourierConnection,
  CourierReturn,
  CourierRoutingRule,
  CourierService,
  CourierSettlement,
  ShippingRate,
} from "../types";
import { readError, SelectField } from "../ui";
import { formatMoney } from "@/features/shop/utils";
import { ArchiveActions, ArchiveViewTabs, ResourceActionDialog, type ArchiveView, type ResourceAction } from "../archive-controls";

type Props = {
  section: CourierManagementSection;
  connections: CourierConnection[];
  canManage: boolean;
  canDispatch: boolean;
  canManageReturns: boolean;
  canReconcile: boolean;
};

export type CourierManagementSection = "services" | "rules" | "dispatches" | "returns" | "settlements";

export function RoutingManagement({
  section,
  connections,
  canManage,
  canDispatch,
  canManageReturns,
  canReconcile,
}: Props) {
  const queryClient = useQueryClient();
  const [serviceOpen, setServiceOpen] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [pickupOpen, setPickupOpen] = useState(false);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [archiveView, setArchiveView] = useState<ArchiveView>("current");
  const [resourceAction, setResourceAction] = useState<
    | { action: ResourceAction; kind: "service"; item: CourierService }
    | { action: ResourceAction; kind: "rule"; item: CourierRoutingRule }
    | null
  >(null);
  const [operationForm, setOperationForm] = useState({
    consignmentId: "",
    reason: "",
    externalId: "",
    amount: "",
    currency: "BDT",
    note: "",
  });
  const [pickupForm, setPickupForm] = useState({ consignmentId: "", addressId: "", policeStationId: "", address: "", contactNumber: "", estimatedQuantity: "1", note: "" });
  const [serviceForm, setServiceForm] = useState({
    id: "",
    connectionId: "",
    code: "home_delivery",
    displayName: "Home delivery",
    shippingRateIds: [] as string[],
  });
  const [ruleForm, setRuleForm] = useState({
    id: "",
    name: "",
    priority: "100",
    connectionId: "",
    serviceId: "",
    conditions: {} as Record<string, unknown>,
  });
  const servicesQuery = useQuery({
    queryKey: [...queryKeys.admin.ecommerce.delivery.services(), section === "services" ? archiveView : "current"],
    queryFn: () =>
      ecommerceApi.delivery.services({ archived: section === "services" && archiveView === "archived" }) as Promise<CourierService[]>,
    enabled: section === "services" || section === "rules",
  });
  const rulesQuery = useQuery({
    queryKey: [...queryKeys.admin.ecommerce.delivery.rules(), archiveView],
    queryFn: () =>
      ecommerceApi.delivery.rules({ archived: archiveView === "archived" }) as Promise<CourierRoutingRule[]>,
    enabled: section === "rules",
  });
  const dispatchesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.dispatches(),
    queryFn: () => ecommerceApi.delivery.dispatches() as Promise<any[]>,
    enabled: section === "dispatches",
  });
  const returnsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.returns(),
    queryFn: () => ecommerceApi.delivery.returns() as Promise<CourierReturn[]>,
    enabled: section === "returns",
  });
  const settlementsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.settlements(),
    queryFn: () =>
      ecommerceApi.delivery.settlements() as Promise<CourierSettlement[]>,
    enabled: section === "settlements",
  });
  const ratesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.shipping.rates(),
    queryFn: () => ecommerceApi.shipping.rates() as Promise<ShippingRate[]>,
    enabled: section === "services",
  });
  const refresh = () =>
    void queryClient.invalidateQueries({
      queryKey: queryKeys.admin.ecommerce.delivery.all(),
    });
  const saveService = useMutation({
    mutationFn: () => {
      const body = { connectionId: serviceForm.connectionId, code: serviceForm.code, displayName: serviceForm.displayName, shippingRateIds: serviceForm.shippingRateIds };
      return serviceForm.id
        ? ecommerceApi.delivery.updateService(serviceForm.id, { displayName: serviceForm.displayName, shippingRateIds: serviceForm.shippingRateIds })
        : ecommerceApi.delivery.createService(body);
    },
    onSuccess: () => {
      toast.success(serviceForm.id ? "Delivery option updated" : "Delivery option created");
      setServiceOpen(false);
      refresh();
    },
    onError: (error) =>
      toast.error(readError(error, "Failed to create delivery option")),
  });
  const updateService = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      ecommerceApi.delivery.updateService(id, { enabled }),
    onSuccess: refresh,
    onError: (error) =>
      toast.error(readError(error, "Failed to update delivery option")),
  });
  const saveRule = useMutation({
    mutationFn: () => {
      const body = {
        name: ruleForm.name,
        priority: Number(ruleForm.priority),
        connectionId: ruleForm.connectionId,
        serviceId: ruleForm.serviceId,
        conditions: ruleForm.conditions,
      };
      return ruleForm.id ? ecommerceApi.delivery.updateRule(ruleForm.id, body) : ecommerceApi.delivery.createRule(body);
    },
    onSuccess: () => {
      toast.success(ruleForm.id ? "Assignment rule updated" : "Assignment rule created");
      setRuleOpen(false);
      refresh();
    },
    onError: (error) =>
      toast.error(readError(error, "Failed to create assignment rule")),
  });
  const updateRule = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      ecommerceApi.delivery.updateRule(id, { enabled }),
    onSuccess: refresh,
    onError: (error) =>
      toast.error(readError(error, "Failed to update assignment rule")),
  });
  const queue = useMutation({
    mutationFn: (id: string) => ecommerceApi.delivery.queueDispatch(id),
    onSuccess: () => {
      toast.success("Dispatch queued");
      refresh();
    },
    onError: (error) =>
      toast.error(readError(error, "Failed to queue dispatch")),
  });
  const handoff = useMutation({
    mutationFn: ({ id, state }: { id: string; state: string }) =>
      ecommerceApi.delivery.markHandoff(id, { state }),
    onSuccess: () => {
      toast.success("Courier handoff updated");
      refresh();
    },
    onError: (error) =>
      toast.error(readError(error, "Failed to update handoff")),
  });
  const requestPickup = useMutation({
    mutationFn: () => ecommerceApi.delivery.requestPickup(pickupForm.consignmentId, {
      addressId: Number(pickupForm.addressId),
      policeStationId: Number(pickupForm.policeStationId),
      address: pickupForm.address,
      contactNumber: pickupForm.contactNumber,
      ...(pickupForm.estimatedQuantity ? { estimatedQuantity: Number(pickupForm.estimatedQuantity) } : {}),
      ...(pickupForm.note.trim() ? { note: pickupForm.note } : {}),
    }),
    onSuccess: () => { toast.success("Pickup requested from courier"); setPickupOpen(false); refresh(); },
    onError: (error) => toast.error(readError(error, "Failed to request pickup")),
  });
  const createReturn = useMutation({
    mutationFn: () =>
      ecommerceApi.delivery.createReturn({
        consignmentId: operationForm.consignmentId,
        ...(operationForm.reason.trim()
          ? { reason: operationForm.reason }
          : {}),
      }),
    onSuccess: () => {
      toast.success("Return request recorded");
      setReturnOpen(false);
      refresh();
    },
    onError: (error) =>
      toast.error(readError(error, "Failed to record return")),
  });
  const updateReturn = useMutation({
    mutationFn: ({ id, state }: { id: string; state: string }) =>
      ecommerceApi.delivery.updateReturn(id, { state }),
    onSuccess: refresh,
    onError: (error) =>
      toast.error(readError(error, "Failed to update return")),
  });
  const submitReturn = useMutation({
    mutationFn: (id: string) => ecommerceApi.delivery.submitReturn(id),
    onSuccess: () => { toast.success("Return submitted to courier"); refresh(); },
    onError: (error) => toast.error(readError(error, "Failed to submit return")),
  });
  const recordSettlement = useMutation({
    mutationFn: () =>
      ecommerceApi.delivery.recordSettlement({
        consignmentId: operationForm.consignmentId,
        externalId: operationForm.externalId,
        amount: operationForm.amount,
        currency: operationForm.currency,
        ...(operationForm.note.trim() ? { note: operationForm.note } : {}),
      }),
    onSuccess: () => {
      toast.success("Settlement evidence recorded");
      setSettlementOpen(false);
      refresh();
    },
    onError: (error) =>
      toast.error(readError(error, "Failed to record settlement")),
  });
  const lifecycle = useMutation({
    mutationFn: (target: NonNullable<typeof resourceAction>) => {
      if (target.kind === "service") {
        return target.action === "archive" ? ecommerceApi.delivery.archiveService(target.item.id) : target.action === "restore" ? ecommerceApi.delivery.restoreService(target.item.id) : ecommerceApi.delivery.deleteService(target.item.id);
      }
      return target.action === "archive" ? ecommerceApi.delivery.archiveRule(target.item.id) : target.action === "restore" ? ecommerceApi.delivery.restoreRule(target.item.id) : ecommerceApi.delivery.deleteRule(target.item.id);
    },
    onSuccess: (_, target) => {
      toast.success(target.action === "archive" ? `${target.kind === "service" ? "Delivery option" : "Assignment rule"} archived` : target.action === "restore" ? `${target.kind === "service" ? "Delivery option" : "Assignment rule"} recovered` : `${target.kind === "service" ? "Delivery option" : "Assignment rule"} permanently deleted`);
      setResourceAction(null);
      refresh();
    },
    onError: (error) => toast.error(readError(error, "Courier configuration operation failed")),
  });
  const services = servicesQuery.data ?? [];
  const rules = rulesQuery.data ?? [];
  const dispatches = dispatchesQuery.data ?? [];
  const returns = returnsQuery.data ?? [];
  const settlements = settlementsQuery.data ?? [];
  const rates = ratesQuery.data ?? [];
  const eligibleConnections = connections.filter(
    (item) => item.enabled && item.healthState === "healthy"
  );

  return (
    <Tabs value={section} className="space-y-3">
      <TabsContent value="services" className="space-y-3">
        <ArchiveViewTabs value={archiveView} onChange={(value) => { setArchiveView(value); setResourceAction(null); }} />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Delivery options</h2>
            <p className="text-muted-foreground text-sm">
              Connect a courier account and service level to one or more shipping methods shown at checkout.
            </p>
          </div>
          {canManage && archiveView === "current" ? (
            <Button
              size="sm"
              disabled={!eligibleConnections.length}
              onClick={() => {
                const connectionId = eligibleConnections[0]?.id ?? "";
                setServiceForm({ id: "", connectionId, code: "home_delivery", displayName: "Home delivery", shippingRateIds: [] });
                setServiceOpen(true);
              }}
            >
              <Plus className="mr-2 size-4" /> Add delivery option
            </Button>
          ) : null}
        </div>
        {!services.length ? (
          <Card>
            <CardContent className="text-muted-foreground pt-6">
              {archiveView === "archived" ? "No archived delivery options." : "No delivery options configured. Add one after a courier connection is enabled and healthy."}
            </CardContent>
          </Card>
        ) : (
          services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle className="flex gap-2">
                  {service.displayName}
                  <Badge variant={service.enabled ? "default" : "secondary"}>
                    {service.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Provider: {service.providerName} · Connection: {service.connectionName}
                  <br />Checkout methods: {service.shippingMethods.map((item) => item.label).join(", ")}
                </CardDescription>
              </CardHeader>
              {canManage ? (
                <CardContent className="flex flex-wrap gap-2">
                  {!service.archivedAt ? <>
                  <Button size="sm" variant="outline" onClick={() => { setServiceForm({ id: service.id, connectionId: service.connectionId, code: service.code, displayName: service.displayName, shippingRateIds: service.shippingMethods.map((item) => item.id) }); setServiceOpen(true); }}>
                    <Pencil className="mr-2 size-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateService.mutate({
                        id: service.id,
                        enabled: !service.enabled,
                      })
                    }
                  >
                    {service.enabled ? "Disable" : "Enable"}
                  </Button>
                  </> : null}
                  <ArchiveActions archived={Boolean(service.archivedAt)} disabled={lifecycle.isPending} onArchive={() => setResourceAction({ action: "archive", kind: "service", item: service })} onRestore={() => setResourceAction({ action: "restore", kind: "service", item: service })} onDelete={() => setResourceAction({ action: "delete", kind: "service", item: service })} />
                </CardContent>
              ) : null}
            </Card>
          ))
        )}
      </TabsContent>
      <TabsContent value="rules" className="space-y-3">
        <ArchiveViewTabs value={archiveView} onChange={(value) => { setArchiveView(value); setResourceAction(null); }} />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Assignment rules</h2>
            <p className="text-muted-foreground text-sm">
              Decide which provider, connection, and delivery option should handle an order. Lower priority numbers run first.
            </p>
          </div>
          {canManage && archiveView === "current" ? (
            <Button
              size="sm"
              disabled={!services.length}
              onClick={() => {
                const service = services[0];
                setRuleForm({
                  id: "",
                  name: "",
                  priority: "100",
                  connectionId: service?.connectionId ?? "",
                  serviceId: service?.id ?? "",
                  conditions: {},
                });
                setRuleOpen(true);
              }}
            >
              <Plus className="mr-2 size-4" /> Add assignment rule
            </Button>
          ) : null}
        </div>
        {!rules.length ? (
          <Card>
            <CardContent className="text-muted-foreground pt-6">
              {archiveView === "archived" ? "No archived assignment rules." : "No assignment rules configured."}
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <CardTitle className="flex gap-2">
                  {rule.name}
                  <Badge variant={rule.enabled ? "default" : "secondary"}>
                    v{rule.version} · {rule.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Provider: {rule.providerName} · Connection: {rule.connectionName}
                  <br />Delivery option: {rule.serviceName} · Priority {rule.priority}
                </CardDescription>
              </CardHeader>
              {canManage ? (
                <CardContent className="flex flex-wrap gap-2">
                  {!rule.archivedAt ? <>
                  <Button size="sm" variant="outline" onClick={() => { setRuleForm({ id: rule.id, name: rule.name, priority: String(rule.priority), connectionId: rule.connectionId, serviceId: rule.serviceId, conditions: rule.conditions }); setRuleOpen(true); }}>
                    <Pencil className="mr-2 size-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateRule.mutate({ id: rule.id, enabled: !rule.enabled })
                    }
                  >
                    {rule.enabled ? "Disable" : "Enable"}
                  </Button>
                  </> : null}
                  <ArchiveActions archived={Boolean(rule.archivedAt)} disabled={lifecycle.isPending} onArchive={() => setResourceAction({ action: "archive", kind: "rule", item: rule })} onRestore={() => setResourceAction({ action: "restore", kind: "rule", item: rule })} onDelete={() => setResourceAction({ action: "delete", kind: "rule", item: rule })} />
                </CardContent>
              ) : null}
            </Card>
          ))
        )}
      </TabsContent>
      <TabsContent value="dispatches" className="space-y-3">
        <div>
          <h2 className="font-semibold">Shipments</h2>
          <p className="text-muted-foreground text-sm">Orders assigned to a courier. Queueing creates the parcel-submission job; handoff records its physical progress.</p>
        </div>
        {!dispatches.length ? (
          <Card>
            <CardContent className="text-muted-foreground pt-6">
              No shipments assigned yet. Open an order and confirm its courier recommendation first.
            </CardContent>
          </Card>
        ) : (
          dispatches.map((dispatch) => (
            <Card key={dispatch.id}>
              <CardHeader>
                <CardTitle>{dispatch.order.orderNumber}</CardTitle>
                <CardDescription>
                  Provider: {dispatch.connection.provider.displayName} · Connection: {dispatch.connection.displayName}
                  <br />Delivery option: {dispatch.service.displayName} · Status: {dispatch.status.replaceAll("_", " ")}
                </CardDescription>
              </CardHeader>
              {canDispatch || canManageReturns || canReconcile ? (
                <CardContent className="flex flex-wrap gap-2">
                  {canDispatch && dispatch.status === "confirmed" ? (
                    <Button size="sm" onClick={() => queue.mutate(dispatch.id)}>
                      Queue dispatch
                    </Button>
                  ) : null}
                  {canDispatch &&
                  dispatch.consignment &&
                  !["delivered", "cancelled", "exception"].includes(
                    dispatch.consignment.state
                  ) ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handoff.mutate({
                            id: dispatch.consignment.id,
                            state: "handed_to_courier",
                          })
                        }
                      >
                        Mark handed over
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handoff.mutate({
                            id: dispatch.consignment.id,
                            state: "in_transit",
                          })
                        }
                      >
                        Mark in transit
                      </Button>
                    </>
                  ) : null}
                  {canDispatch && dispatch.consignment?.externalId && dispatch.consignment.state !== "pickup_requested_externally" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPickupForm({ consignmentId: dispatch.consignment.id, addressId: "", policeStationId: "", address: "", contactNumber: "", estimatedQuantity: "1", note: "" });
                        setPickupOpen(true);
                      }}
                    >
                      Request pickup
                    </Button>
                  ) : null}
                  {canManageReturns && dispatch.consignment ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setOperationForm({
                          consignmentId: dispatch.consignment.id,
                          reason: "",
                          externalId: "",
                          amount: String(dispatch.consignment.codAmount),
                          currency: dispatch.consignment.currency,
                          note: "",
                        });
                        setReturnOpen(true);
                      }}
                    >
                      Request return
                    </Button>
                  ) : null}
                  {canReconcile && dispatch.consignment ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setOperationForm({
                          consignmentId: dispatch.consignment.id,
                          reason: "",
                          externalId: "",
                          amount: String(dispatch.consignment.codAmount),
                          currency: dispatch.consignment.currency,
                          note: "",
                        });
                        setSettlementOpen(true);
                      }}
                    >
                      Record settlement
                    </Button>
                  ) : null}
                </CardContent>
              ) : null}
            </Card>
          ))
        )}
      </TabsContent>
      <TabsContent value="returns" className="space-y-3">
        <div>
          <h2 className="font-semibold">Courier returns</h2>
          <p className="text-muted-foreground text-sm">
            Return completion creates a reconciliation exception; it never
            refunds or restocks automatically.
          </p>
        </div>
        {!returns.length ? (
          <Card>
            <CardContent className="text-muted-foreground pt-6">
              No courier returns recorded.
            </CardContent>
          </Card>
        ) : (
          returns.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.consignment.order.orderNumber}</CardTitle>
                <CardDescription>
                  Provider: {item.consignment.connection.provider.displayName} · Connection: {item.consignment.connection.displayName}
                  <br />Delivery option: {item.consignment.service.displayName} · Status: {item.state.replaceAll("_", " ")}
                  {item.reason ? ` · ${item.reason}` : ""}
                </CardDescription>
              </CardHeader>
              {canManageReturns &&
              !["completed", "cancelled"].includes(item.state) ? (
                <CardContent className="flex flex-wrap gap-2">
                  {!item.externalId ? (
                    <Button size="sm" disabled={submitReturn.isPending} onClick={() => submitReturn.mutate(item.id)}>
                      Submit to courier
                    </Button>
                  ) : (
                    <Badge variant="secondary">Courier ref: {item.externalId}</Badge>
                  )}
                  {item.state === "pending" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateReturn.mutate({ id: item.id, state: "approved" })
                      }
                    >
                      Approve
                    </Button>
                  ) : null}
                  {["pending", "approved"].includes(item.state) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateReturn.mutate({
                          id: item.id,
                          state: "processing",
                        })
                      }
                    >
                      Mark processing
                    </Button>
                  ) : null}
                  {item.state === "processing" ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateReturn.mutate({ id: item.id, state: "completed" })
                      }
                    >
                      Mark completed
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      updateReturn.mutate({ id: item.id, state: "cancelled" })
                    }
                  >
                    Cancel
                  </Button>
                </CardContent>
              ) : null}
            </Card>
          ))
        )}
      </TabsContent>
      <TabsContent value="settlements" className="space-y-3">
        <div>
          <h2 className="font-semibold">COD payouts</h2>
          <p className="text-muted-foreground text-sm">
            Record money received from a courier. The amount must match the shipment's COD amount before the order payment is reconciled.
          </p>
        </div>
        {!settlements.length ? (
          <Card>
            <CardContent className="text-muted-foreground pt-6">
              No COD payouts recorded.
            </CardContent>
          </Card>
        ) : (
          settlements.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex gap-2">
                  {item.consignment.order.orderNumber}
                  <Badge
                    variant={
                      item.state === "mismatch" ? "destructive" : "default"
                    }
                  >
                    {item.state.replaceAll("_", " ")}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Provider: {item.consignment.connection.provider.displayName} · Connection: {item.consignment.connection.displayName}
                  <br />Delivery option: {item.consignment.service.displayName} · {item.amount} {item.currency} · Reference: {item.externalId}
                </CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </TabsContent>

      <Dialog open={serviceOpen} onOpenChange={setServiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{serviceForm.id ? "Edit" : "Add"} delivery option</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <SelectField
              label="Connection"
              value={serviceForm.connectionId}
              onChange={(connectionId) => setServiceForm({ ...serviceForm, connectionId })}
              options={eligibleConnections.map((item) => ({ value: item.id, label: `${item.provider.displayName} · ${item.displayName}` }))}
              disabled={Boolean(serviceForm.id)}
            />
            <Field label="Service code">
              <Input
                value={serviceForm.code}
                disabled={Boolean(serviceForm.id)}
                onChange={(event) =>
                  setServiceForm({ ...serviceForm, code: event.target.value })
                }
              />
            </Field>
            <Field label="Display name">
              <Input
                value={serviceForm.displayName}
                onChange={(event) =>
                  setServiceForm({
                    ...serviceForm,
                    displayName: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="Delivery methods">
              <MultiSelect
                placeholder="Search and select shipping methods"
                emptyLabel="Clear selection"
                options={rates.map((rate) => ({
                  id: rate.id,
                  label: rate.label,
                  selectedLabel: `${rate.label} · ${rate.code}`,
                  description: `${rate.code} · ${formatMoney(rate.amount, rate.currency)}${rate.isDefault ? " · Default" : ""} · ${rate.isActive ? "Active" : "Inactive"}`,
                  searchText: `${rate.code} ${rate.currency} ${rate.amount}`,
                  disabled: !rate.isActive && !serviceForm.shippingRateIds.includes(rate.id),
                }))}
                value={serviceForm.shippingRateIds}
                onChange={(shippingRateIds) => setServiceForm({ ...serviceForm, shippingRateIds })}
              />
              {!rates.length ? (
                <p className="text-xs text-muted-foreground">Create a current shipping method before configuring a delivery option.</p>
              ) : (
                <p className="text-xs text-muted-foreground">Search by method name or code. Inactive methods cannot be added, but existing mappings can be removed.</p>
              )}
            </Field>
          </div>
          <DialogFooter>
            <Button
              disabled={
                !serviceForm.connectionId ||
                !serviceForm.code.trim() ||
                !serviceForm.displayName.trim() ||
                !serviceForm.shippingRateIds.length ||
                saveService.isPending
              }
              onClick={() => saveService.mutate()}
            >
              Save delivery option
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={ruleOpen} onOpenChange={setRuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ruleForm.id ? "Edit" : "Add"} assignment rule</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Rule name">
              <Input
                value={ruleForm.name}
                onChange={(event) =>
                  setRuleForm({ ...ruleForm, name: event.target.value })
                }
              />
            </Field>
            <Field
              label="Priority"
              hint="Lower numbers run first. Start at 0; negative numbers are not allowed."
            >
              <Input
                type="number"
                min={0}
                max={10_000}
                step={1}
                value={ruleForm.priority}
                onChange={(event) =>
                  setRuleForm({ ...ruleForm, priority: event.target.value })
                }
              />
            </Field>
            <SelectField
              label="Delivery option"
              value={ruleForm.serviceId}
              onChange={(serviceId) => {
                  const service = services.find(
                    (item) => item.id === serviceId
                  );
                  setRuleForm({
                    ...ruleForm,
                    serviceId,
                    connectionId: service?.connectionId ?? "",
                  });
                }}
              options={services.map((item) => ({ value: item.id, label: `${item.providerName} · ${item.connectionName} · ${item.displayName}` }))}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={
                !ruleForm.name.trim() ||
                !ruleForm.serviceId ||
                !Number.isInteger(Number(ruleForm.priority)) ||
                Number(ruleForm.priority) < 0 ||
                Number(ruleForm.priority) > 10_000 ||
                saveRule.isPending
              }
              onClick={() => saveRule.mutate()}
            >
              Save assignment rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ResourceActionDialog
        action={resourceAction?.action ?? null}
        resourceName={resourceAction?.item ? ("displayName" in resourceAction.item ? resourceAction.item.displayName : resourceAction.item.name) : undefined}
        resourceKind={resourceAction?.kind === "rule" ? "assignment rule" : "delivery option"}
        pending={lifecycle.isPending}
        error={lifecycle.error}
        onClose={() => { lifecycle.reset(); setResourceAction(null); }}
        onConfirm={() => resourceAction && lifecycle.mutate(resourceAction)}
      />
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record courier return request</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Record the return for review first. Submit it to the courier from the Returns page after confirming the reason.
          </p>
          <Field label="Reason">
            <Input
              aria-label="Reason"
              value={operationForm.reason}
              onChange={(event) =>
                setOperationForm({
                  ...operationForm,
                  reason: event.target.value,
                })
              }
            />
          </Field>
          <DialogFooter>
            <Button
              disabled={!operationForm.consignmentId || createReturn.isPending}
              onClick={() => createReturn.mutate()}
            >
              Record return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={pickupOpen} onOpenChange={setPickupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request courier pickup</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">This sends a real pickup request to the selected courier connection. Use the address and police-station IDs from your courier merchant account.</p>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pickup address ID"><Input type="number" min={1} value={pickupForm.addressId} onChange={(event) => setPickupForm({ ...pickupForm, addressId: event.target.value })} /></Field>
              <Field label="Police station ID"><Input type="number" min={1} value={pickupForm.policeStationId} onChange={(event) => setPickupForm({ ...pickupForm, policeStationId: event.target.value })} /></Field>
            </div>
            <Field label="Pickup address"><Input value={pickupForm.address} onChange={(event) => setPickupForm({ ...pickupForm, address: event.target.value })} /></Field>
            <Field label="Contact number" hint="11-digit Bangladesh mobile number beginning 013-019."><Input value={pickupForm.contactNumber} onChange={(event) => setPickupForm({ ...pickupForm, contactNumber: event.target.value })} /></Field>
            <Field label="Estimated parcel quantity"><Input type="number" min={1} value={pickupForm.estimatedQuantity} onChange={(event) => setPickupForm({ ...pickupForm, estimatedQuantity: event.target.value })} /></Field>
            <Field label="Pickup note"><Input value={pickupForm.note} onChange={(event) => setPickupForm({ ...pickupForm, note: event.target.value })} /></Field>
          </div>
          <DialogFooter>
            <Button disabled={!pickupForm.consignmentId || Number(pickupForm.addressId) < 1 || Number(pickupForm.policeStationId) < 1 || !pickupForm.address.trim() || !/^01[3-9]\d{8}$/.test(pickupForm.contactNumber) || requestPickup.isPending} onClick={() => requestPickup.mutate()}>
              Send pickup request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={settlementOpen} onOpenChange={setSettlementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record COD settlement evidence</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Payout/reference ID">
              <Input
                aria-label="Payout/reference ID"
                value={operationForm.externalId}
                onChange={(event) =>
                  setOperationForm({
                    ...operationForm,
                    externalId: event.target.value,
                  })
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount">
                <Input
                  aria-label="Amount"
                  value={operationForm.amount}
                  onChange={(event) =>
                    setOperationForm({
                      ...operationForm,
                      amount: event.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Currency">
                <Input
                  aria-label="Currency"
                  value={operationForm.currency}
                  onChange={(event) =>
                    setOperationForm({
                      ...operationForm,
                      currency: event.target.value.toUpperCase(),
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Evidence note">
              <Input
                aria-label="Evidence note"
                value={operationForm.note}
                onChange={(event) =>
                  setOperationForm({
                    ...operationForm,
                    note: event.target.value,
                  })
                }
              />
            </Field>
          </div>
          <DialogFooter>
            <Button
              disabled={
                !operationForm.externalId.trim() ||
                !operationForm.amount ||
                operationForm.currency.length !== 3 ||
                recordSettlement.isPending
              }
              onClick={() => recordSettlement.mutate()}
            >
              Record settlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
