import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { Order, PageResult } from "../types";
import { EcommerceHeader, ecommercePermissions, readError } from "../ui";
import { OrderFilters, type OrderFiltersState } from "./filters";
import { OrdersTable } from "./orders-table";

export function AdminOrdersPage() {
  const { session } = useSession();
  const { canManageOrders } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<OrderFiltersState>({
    search: "",
    orderStatus: "all",
    paymentStatus: "all",
    deliveryStatus: "all",
    inventoryStatus: "all",
    paymentMethod: "all",
    placedFrom: "",
    placedTo: "",
  });

  const query = useQuery({
    queryKey: queryKeys.admin.ecommerce.orders.list(filters),
    queryFn: () =>
      ecommerceApi.orders.list({
        limit: 50,
        search: filters.search || undefined,
        orderStatus: filters.orderStatus === "all" ? undefined : filters.orderStatus,
        paymentStatus: filters.paymentStatus === "all" ? undefined : filters.paymentStatus,
        deliveryStatus: filters.deliveryStatus === "all" ? undefined : filters.deliveryStatus,
        inventoryStatus: filters.inventoryStatus === "all" ? undefined : filters.inventoryStatus,
        paymentMethod: filters.paymentMethod === "all" ? undefined : filters.paymentMethod,
        placedFrom: filters.placedFrom || undefined,
        placedTo: filters.placedTo || undefined,
      }) as Promise<PageResult<Order>>,
  });
  const releaseExpired = useMutation({
    mutationFn: () => ecommerceApi.orders.releaseExpiredReservations(),
    onSuccess: (result: any) => {
      toast.success(`Released ${result.releasedReservations ?? 0} expired reservations`);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.orders.all() });
    },
    onError: (error) => toast.error(readError(error, "Failed to release expired reservations")),
  });

  return (
    <div className="space-y-6">
      <EcommerceHeader
        title="Orders"
        description="Review customer orders, payment state, delivery progress, and operational history."
        action={
          canManageOrders ? (
            <Button
              variant="outline"
              disabled={releaseExpired.isPending}
              onClick={() => releaseExpired.mutate()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Release expired
            </Button>
          ) : null
        }
      />
      <OrderFilters filters={filters} onChange={setFilters} />
      <OrdersTable
        orders={query.data?.items ?? []}
        loading={query.isLoading}
      />
    </div>
  );
}
