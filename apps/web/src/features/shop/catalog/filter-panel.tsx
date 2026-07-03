import { createContext, useContext, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import type { ShopFilterAttribute, ShopFilters } from "../types";
import { formatMoney } from "../utils";
import type { DynamicFilterState } from "./types";
import {
  encodeDynamicFilters,
  encodeIdList,
  hasDynamicFilterValue,
  parseIdList,
} from "./utils";
import { useFilterForm } from "./filter-context";
import { useStore } from "@tanstack/react-form";


export function FilterPanel(
) {
 const form  = useFilterForm();
 const isDirty = useStore(form.store, (state) => state.isDirty);


  return (
    <form onSubmit={form.handleSubmit}>
      <div className="grid gap-3">
        <CategoryFilter />
        <PriceRangeFilter />
        <AvailabilityFilter />
        <BrandFilter />
        <AttributeFilters />

        <div className="sticky bottom-0 grid grid-cols-2 gap-2 border-t bg-background/95 py-3 backdrop-blur">
          <Button type="button" variant="outline" onClick={()=>form.reset()}>
            Reset
          </Button>
          <Button
            type="submit"
            disabled={!isDirty}
          >
            Apply filters
          </Button>
        </div>
      </div>
    </form>
  );
}

function CategoryFilter() {
  const { filters, draftFilters, updateFilters } = useFilterForm();
  const categoryIds = useMemo(
    () => parseIdList(draftFilters.categoryIds),
    [draftFilters.categoryIds],
  );

  return (
    <div className="rounded-md border bg-card">
      <FilterHeader title="Categories" />
      <MultiSelect
        className="p-3"
        placeholder="Pick categories"
        emptyLabel="All categories"
        options={(filters?.categories ?? []).map((category) => ({
          id: category.id,
          label: category.name,
          count: category.productCount ?? 0,
        }))}
        value={categoryIds}
        onChange={(next) =>
          updateFilters({ categoryIds: encodeIdList(next), filters: "" })
        }
      />
    </div>
  );
}

function PriceRangeFilter() {
  const { filters, draftFilters, updateFilters,  } = useFilterForm();

  return (
    <div className="rounded-md border bg-card">
      <FilterHeader title="Price range" />
      <div className="grid gap-3 p-3">
        <Slider

          step={1}
          value={[]}
          onValueChange={(value) => {
            const [nextMin, nextMax] = Array.isArray(value)
              ? value
              : [currentMin, currentMax];
            updateRange(Number(nextMin), Number(nextMax));
          }}
          className="py-3"
        />

        <div className="grid grid-cols-2 gap-2">
          <Input

            placeholder="Min"
            type="number"
            value={String(Math.round(currentMin))}
            onChange={(event) => updateInput("min", event.target.value)}
          />
          <Input
            placeholder="Max"
            type="number"
            value={String(Math.round(currentMax))}
            onChange={(event) => updateInput("max", event.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Available {formatMoney(String(minAvailable), priceRange?.currency)} -{" "}
          {formatMoney(String(maxAvailable), priceRange?.currency)}
        </p>
      </div>
    </div>
  );
}



function AvailabilityFilter() {
  const { filters, draftFilters, updateFilters } = useFilterForm();
  const counts = filters?.availability;

  return (
    <div className="rounded-md border bg-card">
      <FilterHeader title="Availability" />
      <RadioGroup
        value={draftFilters.availability}
        onValueChange={(availability) => updateFilters({ availability })}
        className="gap-1 p-3"
      >
        <RadioRow value="all" label="All" />
        <RadioRow
          value="in-stock"
          label={`In stock${counts ? ` (${counts.inStock})` : ""}`}
        />
        <RadioRow
          value="out-of-stock"
          label={`Out of stock${counts ? ` (${counts.outOfStock})` : ""}`}
        />
      </RadioGroup>
    </div>
  );
}

function BrandFilter() {
  const { filters, draftFilters, updateFilters } = useFilterForm();
  const brandIds = useMemo(
    () => parseIdList(draftFilters.brandIds),
    [draftFilters.brandIds],
  );

  return (
    <div className="rounded-md border bg-card">
      <FilterHeader title="Brands" />
      <MultiSelect
        className="p-3"
        placeholder="Pick brands"
        emptyLabel="All brands"
        options={(filters?.brands ?? []).map((brand) => ({
          id: brand.id,
          label: brand.name,
          count: brand.productCount,
        }))}
        value={brandIds}
        onChange={(next) => updateFilters({ brandIds: encodeIdList(next) })}
      />
    </div>
  );
}

function AttributeFilters() {
  const { filters } = useFilterForm();

  return (
    <>
      {(filters?.attributes ?? []).map((attribute) => (
        <AttributeFilter key={attribute.id} attribute={attribute} />
      ))}
    </>
  );
}

function RadioRow(props: { value: string; label: string }) {
  return (
    <Label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-sm font-normal">
      <RadioGroupItem value={props.value} />
      <span>{props.label}</span>
    </Label>
  );
}

function AttributeFilter(props: { attribute: ShopFilterAttribute }) {
  const { dynamicFilters, updateFilters } = useFilterForm();
  const value = dynamicFilters[props.attribute.attributeId] ?? {};

  const updateAttributeFilter = (next: DynamicFilterState[string]) => {
    const nextFilters = {
      ...dynamicFilters,
      [props.attribute.attributeId]: next,
    };
    if (!hasDynamicFilterValue(next)) {
      delete nextFilters[props.attribute.attributeId];
    }
    updateFilters({ filters: encodeDynamicFilters(nextFilters) });
  };

  if (
    props.attribute.inputType === "boolean" ||
    props.attribute.type === "boolean"
  ) {
    return (
      <div className="rounded-md border bg-card">
        <FilterHeader title={props.attribute.name} />
        <div className="grid gap-2 p-3">
          <CheckboxRow
            checked={value.boolean === true}
            label={`Yes${props.attribute.booleanCounts ? ` (${props.attribute.booleanCounts.true})` : ""}`}
            onChange={(checked) =>
              updateAttributeFilter(checked ? { boolean: true } : {})
            }
          />
        </div>
      </div>
    );
  }

  if (
    props.attribute.inputType === "number" ||
    props.attribute.type === "number"
  ) {
    return (
      <div className="rounded-md border bg-card">
        <FilterHeader title={props.attribute.name} />
        <div className="grid gap-3 p-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              inputMode="decimal"
              placeholder="Min"
              value={value.min ?? ""}
              onChange={(event) =>
                updateAttributeFilter({ ...value, min: event.target.value })
              }
            />
            <Input
              inputMode="decimal"
              placeholder="Max"
              value={value.max ?? ""}
              onChange={(event) =>
                updateAttributeFilter({ ...value, max: event.target.value })
              }
            />
          </div>
          {props.attribute.unit ? (
            <p className="text-xs text-muted-foreground">
              Unit: {props.attribute.unit}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <FilterHeader title={props.attribute.name} />
      <div className="grid gap-2 p-3">
        {props.attribute.values.map((attributeValue) => {
          const selected = value.valueIds?.includes(attributeValue.id) ?? false;
          return (
            <CheckboxRow
              key={attributeValue.id}
              checked={selected}
              label={`${attributeValue.label} (${attributeValue.productCount})`}
              swatch={
                props.attribute.inputType === "color"
                  ? attributeValue.value
                  : undefined
              }
              onChange={(checked) => {
                const current = value.valueIds ?? [];
                const next = checked
                  ? [...new Set([...current, attributeValue.id])]
                  : current.filter((id) => id !== attributeValue.id);
                updateAttributeFilter({ ...value, valueIds: next });
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function FilterHeader(props: { title: string }) {
  return (
    <div className="border-b px-4 py-3">
      <h2 className="font-medium">{props.title}</h2>
    </div>
  );
}

function CheckboxRow(props: {
  checked: boolean;
  label: string;
  count?: number;
  swatch?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-sm font-normal">
      <Checkbox
        checked={props.checked}
        onCheckedChange={(checked) => props.onChange(Boolean(checked))}
      />
      {props.swatch ? (
        <span
          className="size-4 rounded-sm border"
          style={{ backgroundColor: props.swatch }}
        />
      ) : null}
      <span className="min-w-0 truncate">{props.label}</span>
      {typeof props.count === "number" ? (
        <span className="ml-auto text-xs text-muted-foreground">
          {props.count}
        </span>
      ) : null}
    </Label>
  );
}
