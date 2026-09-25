import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Banknote, Cable, PackageCheck, RotateCcw, Route } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { queryKeys } from "@/constants/query-keys";
import { ecommerceApi } from "../apiCall";
import type { CourierConnection, CourierReturn, CourierRoutingRule, CourierService, CourierSettlement } from "../types";
import { EcommerceHeader } from "../ui";

export function CourierOverviewPage() {
  const connections = useQuery({ queryKey: queryKeys.admin.ecommerce.delivery.connections(), queryFn: () => ecommerceApi.delivery.connections() as Promise<CourierConnection[]> });
  const services = useQuery({ queryKey: queryKeys.admin.ecommerce.delivery.services(), queryFn: () => ecommerceApi.delivery.services() as Promise<CourierService[]> });
  const rules = useQuery({ queryKey: queryKeys.admin.ecommerce.delivery.rules(), queryFn: () => ecommerceApi.delivery.rules() as Promise<CourierRoutingRule[]> });
  const dispatches = useQuery({ queryKey: queryKeys.admin.ecommerce.delivery.dispatches(), queryFn: () => ecommerceApi.delivery.dispatches() as Promise<any[]> });
  const returns = useQuery({ queryKey: queryKeys.admin.ecommerce.delivery.returns(), queryFn: () => ecommerceApi.delivery.returns() as Promise<CourierReturn[]> });
  const settlements = useQuery({ queryKey: queryKeys.admin.ecommerce.delivery.settlements(), queryFn: () => ecommerceApi.delivery.settlements() as Promise<CourierSettlement[]> });
  const unhealthy = (connections.data ?? []).filter((item) => item.healthState !== "healthy").length;

  const cards = [
    { title: "Connections", value: connections.data?.length ?? 0, detail: unhealthy ? `${unhealthy} need attention` : "All connections healthy", icon: Cable, to: "/admin/couriers/connections" },
    { title: "Delivery options", value: services.data?.length ?? 0, detail: `${(services.data ?? []).filter((item) => item.enabled).length} enabled`, icon: PackageCheck, to: "/admin/couriers/delivery-options" },
    { title: "Assignment rules", value: rules.data?.length ?? 0, detail: `${(rules.data ?? []).filter((item) => item.enabled).length} enabled`, icon: Route, to: "/admin/couriers/assignment-rules" },
    { title: "Shipments", value: dispatches.data?.length ?? 0, detail: `${(dispatches.data ?? []).filter((item) => !["delivered", "cancelled"].includes(item.consignment?.state)).length} active`, icon: PackageCheck, to: "/admin/couriers/shipments" },
    { title: "Returns", value: returns.data?.length ?? 0, detail: `${(returns.data ?? []).filter((item) => !["completed", "cancelled"].includes(item.state)).length} open`, icon: RotateCcw, to: "/admin/couriers/returns" },
    { title: "COD payouts", value: settlements.data?.length ?? 0, detail: `${(settlements.data ?? []).filter((item) => item.state === "mismatch").length} mismatches`, icon: Banknote, to: "/admin/couriers/cod-payouts" },
  ] as const;

  return (
    <div className="space-y-6">
      <EcommerceHeader title="Courier overview" description="Monitor courier account health and delivery operations from one place." />
      {unhealthy ? <Card className="border-destructive/40"><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="size-4" />Connection attention required</CardTitle><CardDescription>Test or update unhealthy connections before assigning new shipments.</CardDescription></CardHeader></Card> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => <Link key={item.title} to={item.to}><Card className="h-full transition-colors hover:bg-muted/40"><CardHeader><CardTitle className="flex items-center justify-between text-base">{item.title}<item.icon className="text-muted-foreground size-4" /></CardTitle><CardDescription>{item.detail}</CardDescription></CardHeader><CardContent className="text-3xl font-semibold">{item.value}</CardContent></Card></Link>)}
      </div>
    </div>
  );
}
