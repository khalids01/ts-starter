-- CreateEnum
CREATE TYPE "CourierCredentialSource" AS ENUM ('server_environment', 'encrypted_database');

-- AlterTable
ALTER TABLE "shipping_rate" ADD COLUMN     "destinationRules" JSONB,
ADD COLUMN     "maximumOrderAmount" DECIMAL(12,2),
ADD COLUMN     "minimumOrderAmount" DECIMAL(12,2),
ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'standard';

-- CreateTable
CREATE TABLE "courier_provider" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "capabilities" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_connection" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "environment" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "credentialSource" "CourierCredentialSource" NOT NULL,
    "credentialCiphertext" BYTEA,
    "credentialNonce" BYTEA,
    "credentialAuthTag" BYTEA,
    "credentialKeyVersion" INTEGER,
    "healthState" TEXT NOT NULL DEFAULT 'unchecked',
    "webhookIdentifier" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_service" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_service_method" (
    "serviceId" TEXT NOT NULL,
    "shippingRateId" TEXT NOT NULL,

    CONSTRAINT "courier_service_method_pkey" PRIMARY KEY ("serviceId","shippingRateId")
);

-- CreateTable
CREATE TABLE "courier_routing_rule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "priority" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "conditions" JSONB NOT NULL,
    "connectionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_routing_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_dispatch" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "routingSnapshot" JSONB NOT NULL,
    "overrideReason" TEXT,
    "confirmedByUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courier_dispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_consignment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "invoice" TEXT NOT NULL,
    "externalId" TEXT,
    "trackingCode" TEXT,
    "trackingUrl" TEXT,
    "state" TEXT NOT NULL DEFAULT 'pending_submission',
    "providerState" TEXT,
    "codAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "requestSnapshot" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "submittedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_consignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_operation" (
    "id" TEXT NOT NULL,
    "consignmentId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'pending',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseUntil" TIMESTAMP(3),
    "lastErrorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_event" (
    "id" TEXT NOT NULL,
    "consignmentId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "providerState" TEXT,
    "normalizedState" TEXT,
    "payload" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courier_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_return" (
    "id" TEXT NOT NULL,
    "consignmentId" TEXT NOT NULL,
    "externalId" TEXT,
    "state" TEXT NOT NULL DEFAULT 'requested',
    "providerState" TEXT,
    "reason" TEXT,
    "requestedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_return_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_settlement" (
    "id" TEXT NOT NULL,
    "consignmentId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_exception" (
    "id" TEXT NOT NULL,
    "consignmentId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'open',
    "details" JSONB,
    "resolvedByUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_exception_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courier_provider_code_key" ON "courier_provider"("code");

-- CreateIndex
CREATE UNIQUE INDEX "courier_connection_publicId_key" ON "courier_connection"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "courier_connection_webhookIdentifier_key" ON "courier_connection"("webhookIdentifier");

-- CreateIndex
CREATE INDEX "courier_connection_providerId_enabled_priority_idx" ON "courier_connection"("providerId", "enabled", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "courier_service_connectionId_code_key" ON "courier_service"("connectionId", "code");

-- CreateIndex
CREATE INDEX "courier_routing_rule_enabled_priority_idx" ON "courier_routing_rule"("enabled", "priority");

-- CreateIndex
CREATE INDEX "courier_dispatch_orderId_createdAt_idx" ON "courier_dispatch"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "courier_consignment_dispatchId_key" ON "courier_consignment"("dispatchId");

-- CreateIndex
CREATE INDEX "courier_consignment_orderId_active_idx" ON "courier_consignment"("orderId", "active");

-- CreateIndex
CREATE INDEX "courier_consignment_state_updatedAt_idx" ON "courier_consignment"("state", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "courier_consignment_connectionId_invoice_key" ON "courier_consignment"("connectionId", "invoice");

-- CreateIndex
CREATE UNIQUE INDEX "courier_consignment_connectionId_externalId_key" ON "courier_consignment"("connectionId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "courier_operation_identity_key" ON "courier_operation"("identity");

-- CreateIndex
CREATE INDEX "courier_operation_state_nextAttemptAt_idx" ON "courier_operation"("state", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "courier_event_consignmentId_createdAt_idx" ON "courier_event"("consignmentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "courier_event_consignmentId_source_eventKey_key" ON "courier_event"("consignmentId", "source", "eventKey");

-- CreateIndex
CREATE INDEX "courier_return_consignmentId_createdAt_idx" ON "courier_return"("consignmentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "courier_settlement_consignmentId_externalId_key" ON "courier_settlement"("consignmentId", "externalId");

-- CreateIndex
CREATE INDEX "courier_exception_state_createdAt_idx" ON "courier_exception"("state", "createdAt");

-- CreateIndex
CREATE INDEX "courier_exception_consignmentId_state_idx" ON "courier_exception"("consignmentId", "state");

-- AddForeignKey
ALTER TABLE "courier_connection" ADD CONSTRAINT "courier_connection_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "courier_provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_service" ADD CONSTRAINT "courier_service_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "courier_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_service_method" ADD CONSTRAINT "courier_service_method_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "courier_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_service_method" ADD CONSTRAINT "courier_service_method_shippingRateId_fkey" FOREIGN KEY ("shippingRateId") REFERENCES "shipping_rate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_routing_rule" ADD CONSTRAINT "courier_routing_rule_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "courier_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_routing_rule" ADD CONSTRAINT "courier_routing_rule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "courier_service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_dispatch" ADD CONSTRAINT "courier_dispatch_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_dispatch" ADD CONSTRAINT "courier_dispatch_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "courier_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_dispatch" ADD CONSTRAINT "courier_dispatch_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "courier_service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_consignment" ADD CONSTRAINT "courier_consignment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_consignment" ADD CONSTRAINT "courier_consignment_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "courier_dispatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_consignment" ADD CONSTRAINT "courier_consignment_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "courier_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_consignment" ADD CONSTRAINT "courier_consignment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "courier_service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_operation" ADD CONSTRAINT "courier_operation_consignmentId_fkey" FOREIGN KEY ("consignmentId") REFERENCES "courier_consignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_event" ADD CONSTRAINT "courier_event_consignmentId_fkey" FOREIGN KEY ("consignmentId") REFERENCES "courier_consignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_return" ADD CONSTRAINT "courier_return_consignmentId_fkey" FOREIGN KEY ("consignmentId") REFERENCES "courier_consignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_settlement" ADD CONSTRAINT "courier_settlement_consignmentId_fkey" FOREIGN KEY ("consignmentId") REFERENCES "courier_consignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_exception" ADD CONSTRAINT "courier_exception_consignmentId_fkey" FOREIGN KEY ("consignmentId") REFERENCES "courier_consignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
