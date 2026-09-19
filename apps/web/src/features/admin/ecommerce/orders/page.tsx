import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import { ReviewBar, type ReviewBarItem } from "@/components/core/review-bar";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { Order, PageResult } from "../types";
import { EcommerceHeader, ecommercePermissions, readError } from "../ui";
import { OrderFilters, type OrderFiltersState } from "./filters";
import { OrdersTable } from "./orders-table";
import {
  draftHasConflict,
  readOrderStatusDrafts,
  updateOrderStatusDraft,
  writeOrderStatusDrafts,
  type EditableOrderStatus,
  type EditableStatusValue,
  type OrderStatusDraft,
} from "./status-drafts";
import {
  deliveryStatusMeta,
  orderStatusMeta,
  paymentStatusMeta,
} from "./status";

const statusLabels = {
  orderStatus: "Order",
  paymentStatus: "Payment",
  deliveryStatus: "Delivery",
} as const;

export function AdminOrdersPage() {
  const { session } = useSession();
  const { canManageOrders } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<OrderStatusDraft[]>([]);
  const [draftsLoaded, setDraftsLoaded] = useState(false);
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
        orderStatus:
          filters.orderStatus === "all" ? undefined : filters.orderStatus,
        paymentStatus:
          filters.paymentStatus === "all" ? undefined : filters.paymentStatus,
        deliveryStatus:
          filters.deliveryStatus === "all" ? undefined : filters.deliveryStatus,
        inventoryStatus:
          filters.inventoryStatus === "all"
            ? undefined
            : filters.inventoryStatus,
        paymentMethod:
          filters.paymentMethod === "all" ? undefined : filters.paymentMethod,
        placedFrom: filters.placedFrom || undefined,
        placedTo: filters.placedTo || undefined,
      }) as Promise<PageResult<Order>>,
  });
  useEffect(() => {
    setDrafts(readOrderStatusDrafts());
    setDraftsLoaded(true);
  }, []);
  useEffect(() => {
    if (draftsLoaded) writeOrderStatusDrafts(drafts);
  }, [drafts, draftsLoaded]);

  const updateDrafts = useMutation({
    mutationFn: () =>
      Promise.all(
        drafts.map((draft) =>
          ecommerceApi.orders.updateStatuses(draft.orderId, {
            ...draft.changes,
            note: "Updated from the admin order list.",
          }),
        ),
      ),
    onSuccess: () => {
      toast.success(
        `Updated ${drafts.length} ${drafts.length === 1 ? "order" : "orders"}`,
      );
      setDrafts([]);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.ecommerce.orders.all(),
      });
    },
    onError: (error) =>
      toast.error(readError(error, "Failed to update order statuses")),
  });
  const releaseExpired = useMutation({
    mutationFn: () => ecommerceApi.orders.releaseExpiredReservations(),
    onSuccess: (result: any) => {
      toast.success(
        `Released ${result.releasedReservations ?? 0} expired reservations`,
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.ecommerce.orders.all(),
      });
    },
    onError: (error) =>
      toast.error(readError(error, "Failed to release expired reservations")),
  });

  const ordersById = new Map(
    (query.data?.items ?? []).map((order) => [order.id, order]),
  );
  const reviewItems = useMemo(
    () =>
      drafts.flatMap((draft) => {
        const order = ordersById.get(draft.orderId);
        const warning = draftHasConflict(draft, order);
        return Object.entries(draft.changes).map(([field, value]) => {
          const key = field as EditableOrderStatus;
          const meta =
            key === "orderStatus"
              ? orderStatusMeta
              : key === "paymentStatus"
                ? paymentStatusMeta
                : deliveryStatusMeta;
          return {
            id: `${draft.orderId}:${key}`,
            title: `${statusLabels[key]} status for ${draft.customerName}`,
            description: `${meta[draft.original[key] as keyof typeof meta]?.label ?? draft.original[key]} → ${meta[value as keyof typeof meta]?.label ?? value}`,
            warning,
          } satisfies ReviewBarItem;
        });
      }),
    [drafts, query.data?.items],
  );

  const removeReviewItem = (id: string) => {
    const [orderId, field] = id.split(":") as [string, EditableOrderStatus];
    setDrafts((current) =>
      current.flatMap((draft) => {
        if (draft.orderId !== orderId) return [draft];
        const changes = { ...draft.changes };
        delete changes[field];
        return Object.keys(changes).length > 0 ? [{ ...draft, changes }] : [];
      }),
    );
  };

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
        canManage={canManageOrders}
        drafts={drafts}
        onStatusChange={(order, field, value) =>
          setDrafts((current) =>
            updateOrderStatusDraft(current, order, field, value),
          )
        }
      />
      <ReviewBar
        items={reviewItems}
        updating={updateDrafts.isPending}
        updateLabel="Update orders"
        onRemove={removeReviewItem}
        onCancel={() => setDrafts([])}
        onUpdate={() => updateDrafts.mutate()}
      />
    </div>
  );
}
