import type {
  DeliveryStatus,
  Order,
  OrderStatus,
  PaymentStatus,
} from "../types";

export const ORDER_STATUS_DRAFTS_KEY = "admin:ecommerce:order-status-drafts:v1";

export type EditableOrderStatus =
  "orderStatus" | "paymentStatus" | "deliveryStatus";
export type OrderStatusValues = Pick<Order, EditableOrderStatus>;

export type OrderStatusDraft = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  original: OrderStatusValues;
  changes: Partial<OrderStatusValues>;
};

export type EditableStatusValue = OrderStatus | PaymentStatus | DeliveryStatus;

export function readOrderStatusDrafts(): OrderStatusDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(
      window.localStorage.getItem(ORDER_STATUS_DRAFTS_KEY) ?? "[]",
    );
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeOrderStatusDrafts(drafts: OrderStatusDraft[]) {
  if (typeof window === "undefined") return;
  if (drafts.length === 0) {
    window.localStorage.removeItem(ORDER_STATUS_DRAFTS_KEY);
    return;
  }
  window.localStorage.setItem(ORDER_STATUS_DRAFTS_KEY, JSON.stringify(drafts));
}

export function updateOrderStatusDraft(
  drafts: OrderStatusDraft[],
  order: Order,
  field: EditableOrderStatus,
  value: EditableStatusValue,
) {
  const existing = drafts.find((draft) => draft.orderId === order.id);
  const draft: OrderStatusDraft = existing ?? {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    original: {
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
    },
    changes: {},
  };
  const changes = { ...draft.changes, [field]: value };
  if (value === draft.original[field]) delete changes[field];
  const next = drafts.filter((item) => item.orderId !== order.id);
  return Object.keys(changes).length > 0
    ? [...next, { ...draft, changes }]
    : next;
}

export function draftHasConflict(draft: OrderStatusDraft, order?: Order) {
  if (!order) return "Order is not in the current result set.";
  const stale = Object.keys(draft.changes).some((field) => {
    const key = field as EditableOrderStatus;
    return (
      order[key] !== draft.original[key] && order[key] !== draft.changes[key]
    );
  });
  return stale
    ? "Server data changed after this draft was created. Remove and review it again."
    : undefined;
}
