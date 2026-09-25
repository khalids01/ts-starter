export type NormalizedCourierState =
  | "submitted"
  | "in_transit"
  | "delivery_pending_approval"
  | "delivered"
  | "cancel_pending_approval"
  | "cancelled"
  | "exception";

export type CourierStateDecision = Readonly<{
  normalizedState: NormalizedCourierState;
  orderDeliveryStatus?: "preparing" | "shipped" | "out_for_delivery" | "delivered" | "failed";
  exceptionKind?: string;
}>;

export function normalizeCourierState(providerState: string): CourierStateDecision {
  switch (providerState.trim().toLowerCase()) {
    case "in_review":
      return { normalizedState: "submitted", orderDeliveryStatus: "preparing" };
    case "pending":
      return { normalizedState: "in_transit", orderDeliveryStatus: "out_for_delivery" };
    case "delivered_approval_pending":
      return { normalizedState: "delivery_pending_approval" };
    case "delivered":
      return { normalizedState: "delivered", orderDeliveryStatus: "delivered" };
    case "cancelled_approval_pending":
      return { normalizedState: "cancel_pending_approval" };
    case "cancelled":
      return { normalizedState: "cancelled" };
    case "hold":
      return { normalizedState: "exception", exceptionKind: "provider_hold" };
    case "exceptional":
      return { normalizedState: "exception", exceptionKind: "provider_exceptional" };
    case "partial_delivered_approval_pending":
    case "partial_delivered":
      return { normalizedState: "exception", exceptionKind: "partial_delivery" };
    case "partial_delivered_return_proccessing":
    case "partial_delivered_return_rider_assigned":
      return { normalizedState: "exception", exceptionKind: "partial_return_in_progress" };
    case "partial_delivered_return_received":
      return { normalizedState: "exception", exceptionKind: "partial_return_reconciliation_required" };
    case "cancelled_return_proccessing":
    case "cancelled_return_rider_assigned":
      return { normalizedState: "exception", exceptionKind: "return_in_progress" };
    case "cancelled_return_received":
      return { normalizedState: "exception", exceptionKind: "return_reconciliation_required" };
    case "unknown_approval_pending":
    case "unknown":
    default:
      return { normalizedState: "exception", exceptionKind: "unknown_provider_state" };
  }
}
