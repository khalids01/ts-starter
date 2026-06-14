import { EcommerceHeader } from "../ui";
import { CategoryManagementSection } from "./category-management-section";

export function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <EcommerceHeader
        title="Categories"
        description="Manage catalog categories, hierarchy, brand policy, and category templates."
      />
      <CategoryManagementSection />
    </div>
  );
}
