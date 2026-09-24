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
    case "partial_delivered_approval_pending":
    case "partial_delivered":
      return { normalizedState: "exception", exceptionKind: "partial_delivery" };
    case "unknown_approval_pending":
    case "unknown":
    default:
      return { normalizedState: "exception", exceptionKind: "unknown_provider_state" };
  }
}
