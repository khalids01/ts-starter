import type { CategoryTemplate, ProductBrand } from "../types";
import { SelectField } from "../ui";

export function BrandField(props: {
  template?: CategoryTemplate;
  brands: ProductBrand[];
  value: string;
  onChange: (value: string) => void;
}) {
  const policy = props.template?.brand.policy;

  if (policy === "hidden") {
    return <div className="text-sm text-muted-foreground">This category does not show product brands.</div>;
  }
  if (policy === "default_store") {
    return (
      <div className="text-sm text-muted-foreground">
        Store brand: {props.template?.brand.storeBrandName ?? "Configured store"}
      </div>
    );
  }

  return (
    <SelectField
      label={policy === "required" ? "Brand required" : "Brand"}
      value={props.value}
      onChange={props.onChange}
      options={[
        { value: "none", label: "No brand" },
        ...props.brands.map((brand) => ({ value: brand.id, label: brand.name })),
      ]}
    />
  );
}
