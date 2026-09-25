import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type Props = {
  connections: CourierConnection[];
  canManage: boolean;
  canDispatch: boolean;
  canManageReturns: boolean;
  canReconcile: boolean;
};

export function RoutingManagement({
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
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [operationForm, setOperationForm] = useState({
    consignmentId: "",
    reason: "",
    externalId: "",
    amount: "",
    currency: "BDT",
    note: "",
  });
  const [serviceForm, setServiceForm] = useState({
    connectionId: "",
    code: "home_delivery",
    displayName: "Home delivery",
    shippingRateIds: [] as string[],
  });
  const [ruleForm, setRuleForm] = useState({
    name: "",
    priority: "100",
    connectionId: "",
    serviceId: "",
  });
  const servicesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.services(),
    queryFn: () =>
      ecommerceApi.delivery.services() as Promise<CourierService[]>,
  });
  const rulesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.rules(),
    queryFn: () =>
      ecommerceApi.delivery.rules() as Promise<CourierRoutingRule[]>,
  });
  const dispatchesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.dispatches(),
    queryFn: () => ecommerceApi.delivery.dispatches() as Promise<any[]>,
  });
  const returnsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.returns(),
    queryFn: () => ecommerceApi.delivery.returns() as Promise<CourierReturn[]>,
  });
  const settlementsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.settlements(),
    queryFn: () =>
      ecommerceApi.delivery.settlements() as Promise<CourierSettlement[]>,
  });
  const ratesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.shipping.rates(),
    queryFn: () => ecommerceApi.shipping.rates() as Promise<ShippingRate[]>,
  });
  const refresh = () =>
    void queryClient.invalidateQueries({
      queryKey: queryKeys.admin.ecommerce.delivery.all(),
    });
  const createService = useMutation({
    mutationFn: () => ecommerceApi.delivery.createService(serviceForm),
    onSuccess: () => {
      toast.success("Delivery option created");
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
  const createRule = useMutation({
    mutationFn: () =>
      ecommerceApi.delivery.createRule({
        ...ruleForm,
        priority: Number(ruleForm.priority),
        conditions: {},
      }),
    onSuccess: () => {
      toast.success("Assignment rule created");
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>How courier management works</CardTitle>
          <CardDescription>
            A connection is your merchant account with a provider such as Steadfast. A delivery option maps that account to a checkout shipping method. Assignment rules choose an option for each order; shipments, returns, and COD payouts then track the operational work.
          </CardDescription>
        </CardHeader>
      </Card>
    <Tabs defaultValue="services" className="space-y-3">
      <TabsList className="h-auto max-w-full flex-wrap justify-start overflow-visible">
        <TabsTrigger value="services">Delivery options</TabsTrigger>
        <TabsTrigger value="rules">Assignment rules</TabsTrigger>
        <TabsTrigger value="dispatches">Shipments</TabsTrigger>
        <TabsTrigger value="returns">Returns</TabsTrigger>
        <TabsTrigger value="settlements">COD payouts</TabsTrigger>
      </TabsList>
      <TabsContent value="services" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Delivery options</h2>
            <p className="text-muted-foreground text-sm">
              Connect a courier account and service level to one or more shipping methods shown at checkout.
            </p>
          </div>
          {canManage ? (
            <Button
              size="sm"
              disabled={!eligibleConnections.length || !rates.length}
              onClick={() => {
                const connectionId = eligibleConnections[0]?.id ?? "";
                setServiceForm((value) => ({ ...value, connectionId }));
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
              No delivery options configured. Add one after a courier connection is enabled and healthy.
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
                <CardContent>
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
                </CardContent>
              ) : null}
            </Card>
          ))
        )}
      </TabsContent>
      <TabsContent value="rules" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Assignment rules</h2>
            <p className="text-muted-foreground text-sm">
              Decide which provider, connection, and delivery option should handle an order. Lower priority numbers run first.
            </p>
          </div>
          {canManage ? (
            <Button
              size="sm"
              disabled={!services.length}
              onClick={() => {
                const service = services[0];
                setRuleForm((value) => ({
                  ...value,
                  connectionId: service?.connectionId ?? "",
                  serviceId: service?.id ?? "",
                }));
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
              No assignment rules configured.
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
                <CardContent>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateRule.mutate({ id: rule.id, enabled: !rule.enabled })
                    }
                  >
                    {rule.enabled ? "Disable" : "Enable"}
                  </Button>
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
            <DialogTitle>Add delivery option</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <SelectField
              label="Connection"
              value={serviceForm.connectionId}
              onChange={(connectionId) => setServiceForm({ ...serviceForm, connectionId })}
              options={eligibleConnections.map((item) => ({ value: item.id, label: `${item.provider.displayName} · ${item.displayName}` }))}
            />
            <Field label="Service code">
              <Input
                value={serviceForm.code}
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
              <div className="grid gap-2">
                {rates.map((rate) => (
                  <label key={rate.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={serviceForm.shippingRateIds.includes(rate.id)}
                      onCheckedChange={(checked) =>
                        setServiceForm({
                          ...serviceForm,
                          shippingRateIds: checked
                            ? [...serviceForm.shippingRateIds, rate.id]
                            : serviceForm.shippingRateIds.filter(
                                (id) => id !== rate.id
                              ),
                        })
                      }
                    />
                    {rate.label}
                  </label>
                ))}
              </div>
            </Field>
          </div>
          <DialogFooter>
            <Button
              disabled={
                !serviceForm.connectionId ||
                !serviceForm.shippingRateIds.length ||
                createService.isPending
              }
              onClick={() => createService.mutate()}
            >
              Save delivery option
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={ruleOpen} onOpenChange={setRuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add assignment rule</DialogTitle>
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
            <Field label="Priority">
              <Input
                type="number"
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
                createRule.isPending
              }
              onClick={() => createRule.mutate()}
            >
              Save assignment rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record courier return request</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Provider submission remains manual until the protected Steadfast
            return contract is verified.
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
    </div>
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
