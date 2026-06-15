import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { ecommerceApi } from "../apiCall";
import type { Order, PageResult } from "../types";
import { EcommerceHeader } from "../ui";
import { OrderFilters, type OrderFiltersState } from "./filters";
import { OrdersTable } from "./orders-table";

export function AdminOrdersPage() {
  const [filters, setFilters] = useState<OrderFiltersState>({
    search: "",
    orderStatus: "all",
    paymentStatus: "all",
    deliveryStatus: "all",
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
        placedFrom: filters.placedFrom || undefined,
        placedTo: filters.placedTo || undefined,
      }) as Promise<PageResult<Order>>,
  });

  return (
    <div className="space-y-6">
      <EcommerceHeader
        title="Orders"
        description="Review customer orders, payment state, delivery progress, and operational history."
      />
      <OrderFilters filters={filters} onChange={setFilters} />
      <OrdersTable
        orders={query.data?.items ?? []}
        loading={query.isLoading}
      />
    </div>
  );
}
