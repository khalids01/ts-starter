import { EcommerceHeader } from "../ui";
import { BrandManagementSection } from "./brand-management-section";

export function AdminBrandsPage() {
  return (
    <div className="space-y-6">
      <EcommerceHeader
        title="Brands"
        description="Manage product brands, logos, featured status, and active availability."
      />
      <BrandManagementSection />
    </div>
  );
}
