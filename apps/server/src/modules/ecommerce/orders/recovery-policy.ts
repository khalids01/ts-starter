export type ShipmentEvidence = Readonly<{
  state: string;
  externalId: string | null;
  submittedAt: Date | null;
  operations: readonly Readonly<{ kind: string; state: string; attemptCount: number }>[];
}>;

/** Missing or contradictory evidence must never put goods back into saleable stock. */
export function shipmentNeedsRecovery(shipment: ShipmentEvidence) {
  if (shipment.externalId || shipment.submittedAt) return true;
  if (!["pending_submission", "cancelled_before_submission"].includes(shipment.state)) return true;
  const creates = shipment.operations.filter((operation) => operation.kind === "create");
  return creates.length !== 1 || creates.some((operation) =>
    operation.attemptCount !== 0 || !["pending", "cancelled"].includes(operation.state),
  );
}

export function manualShipmentNeedsRecovery(order: Readonly<{
  shippedAt: Date | null;
  deliveredAt: Date | null;
  deliveryStatus: string;
  statusEvents: readonly Readonly<{ newValue: string }>[];
}>) {
  return Boolean(order.shippedAt || order.deliveredAt)
    || !["unfulfilled", "preparing", "ready_to_ship"].includes(order.deliveryStatus)
    || order.statusEvents.some((event) =>
      ["shipped", "out_for_delivery", "delivered", "returned", "failed"].includes(event.newValue),
    );
}
