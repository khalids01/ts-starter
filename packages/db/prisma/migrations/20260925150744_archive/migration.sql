-- AlterTable
ALTER TABLE "courier_connection" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "courier_routing_rule" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "courier_service" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "shipping_rate" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "courier_connection_archivedAt_priority_idx" ON "courier_connection"("archivedAt", "priority");

-- CreateIndex
CREATE INDEX "courier_routing_rule_archivedAt_priority_idx" ON "courier_routing_rule"("archivedAt", "priority");

-- CreateIndex
CREATE INDEX "courier_service_archivedAt_connectionId_idx" ON "courier_service"("archivedAt", "connectionId");

-- CreateIndex
CREATE INDEX "shipping_rate_archivedAt_sortOrder_idx" ON "shipping_rate"("archivedAt", "sortOrder");
