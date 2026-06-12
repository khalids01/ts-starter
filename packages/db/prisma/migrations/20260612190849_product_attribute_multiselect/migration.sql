-- CreateTable
CREATE TABLE "product_attribute_assignment_value" (
    "assignmentId" TEXT NOT NULL,
    "attributeValueId" TEXT NOT NULL,

    CONSTRAINT "product_attribute_assignment_value_pkey" PRIMARY KEY ("assignmentId","attributeValueId")
);

-- CreateIndex
CREATE INDEX "product_attribute_assignment_value_attributeValueId_idx" ON "product_attribute_assignment_value"("attributeValueId");

-- AddForeignKey
ALTER TABLE "product_attribute_assignment_value" ADD CONSTRAINT "product_attribute_assignment_value_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "product_attribute_assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_assignment_value" ADD CONSTRAINT "product_attribute_assignment_value_attributeValueId_fkey" FOREIGN KEY ("attributeValueId") REFERENCES "product_attribute_value"("id") ON DELETE CASCADE ON UPDATE CASCADE;
