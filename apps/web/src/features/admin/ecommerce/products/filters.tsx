import { Input } from "@/components/ui/input";
import type { Category, ProductBrand } from "../types";
import { Field, SelectField } from "../ui";
import { statusOptions } from "./options";

export type ProductFiltersState = {
  search: string;
  status: string;
  categoryId: string;
  brandId: string;
};

export function ProductFilters(props: {
  filters: ProductFiltersState;
  categories: Category[];
  brands: ProductBrand[];
  onChange: (filters: ProductFiltersState) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_180px_220px_220px]">
      <Field label="Search">
        <Input
          placeholder="Search products or SKUs"
          value={props.filters.search}
          onChange={(event) => props.onChange({ ...props.filters, search: event.target.value })}
        />
      </Field>
      <SelectField
        label="Status"
        value={props.filters.status}
        onChange={(status) => props.onChange({ ...props.filters, status })}
        options={statusOptions}
      />
      <SelectField
        label="Category"
        value={props.filters.categoryId}
        onChange={(categoryId) => props.onChange({ ...props.filters, categoryId })}
        options={[
          { value: "all", label: "All categories" },
          ...props.categories.map((category) => ({ value: category.id, label: category.name })),
        ]}
      />
      <SelectField
        label="Brand"
        value={props.filters.brandId}
        onChange={(brandId) => props.onChange({ ...props.filters, brandId })}
        options={[
          { value: "all", label: "All brands" },
          ...props.brands.map((brand) => ({ value: brand.id, label: brand.name })),
        ]}
      />
    </div>
  );
}
