import { useQuery } from "@tanstack/react-query";
import { Permissions } from "@rbac";
import { queryKeys } from "@/constants/query-keys";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { CourierConnection } from "../types";
import { EcommerceHeader, ecommercePermissions, hasAdminPermission } from "../ui";
import { RoutingManagement, type CourierManagementSection } from "./routing-management";

const pageCopy: Record<CourierManagementSection, { title: string; description: string }> = {
  services: { title: "Delivery options", description: "Map courier accounts and service levels to the shipping methods customers select at checkout." },
  rules: { title: "Assignment rules", description: "Control which courier connection and delivery option should handle each order." },
  dispatches: { title: "Shipments", description: "Queue courier submissions and record parcel handoff progress." },
  returns: { title: "Courier returns", description: "Review and track parcels being returned through a courier." },
  settlements: { title: "COD payouts", description: "Record and reconcile cash-on-delivery payments received from couriers." },
};

export function CourierOperationsPage({ section }: { section: CourierManagementSection }) {
  const { session } = useSession();
  const { canManageDelivery } = ecommercePermissions(session);
  const connectionsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.connections(),
    queryFn: () => ecommerceApi.delivery.connections() as Promise<CourierConnection[]>,
  });
  const copy = pageCopy[section];

  return (
    <div className="space-y-6">
      <EcommerceHeader title={copy.title} description={copy.description} />
      <RoutingManagement
        section={section}
        connections={connectionsQuery.data ?? []}
        canManage={canManageDelivery}
        canDispatch={hasAdminPermission(session, Permissions.AdminDeliveryDispatch)}
        canManageReturns={hasAdminPermission(session, Permissions.AdminDeliveryReturns)}
        canReconcile={hasAdminPermission(session, Permissions.AdminDeliveryReconcile)}
      />
    </div>
  );
}
