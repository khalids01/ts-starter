import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, ChevronsUpDown, Heart, PackageCheck, Search, ShoppingCart, SlidersHorizontal, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Img } from "@/components/core/img";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { shopApi } from "./api";
import type { PageResult, ShopCart, ShopFilterAttribute, ShopFilters, ShopProduct, ShopVariant } from "./types";
import { formatMoney, productImage } from "./utils";
import { useCartSheetStore } from "./cart-sheet-store";
import {
  PublicShopFooter,
  PublicShopShell,
} from "./public-shop-shell";
import {
  savedProductFromProduct,
  useSavedItemsStore,
} from "./saved-items-store";
import { useDebounce } from "@/hooks/use-debounce";

type DynamicFilterState = Record<
  string,
  { valueIds?: string[]; min?: string; max?: string; boolean?: boolean }
>;

type ShopSearchState = {
  search: string;
  categoryId: string;
  categoryIds: string;
  brandId: string;
  brandIds: string;
  minPrice: string;
  maxPrice: string;
  inStock: string;
  availability: string;
  sort: string;
  filters: string;
};

type FilterDraftState = Pick<
  ShopSearchState,
  "categoryIds" | "brandIds" | "minPrice" | "maxPrice" | "availability" | "filters"
>;

const defaultFilterDraft: FilterDraftState = {
  categoryIds: "",
  brandIds: "",
  minPrice: "",
  maxPrice: "",
  availability: "all",
  filters: "",
};

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
  { value: "oldest", label: "Oldest" },
];

export function ShopPage() {
  const routeSearch = useSearch({ from: "/shop" });
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(routeSearch.search);
  const debouncedSearch = useDebounce(searchInput.trim(), 450);
  const appliedFilterDraft = useMemo<FilterDraftState>(
    () => ({
      categoryIds: routeSearch.categoryIds,
      brandIds: routeSearch.brandIds,
      minPrice: routeSearch.minPrice,
      maxPrice: routeSearch.maxPrice,
      availability: routeSearch.availability,
      filters: routeSearch.filters,
    }),
    [
      routeSearch.availability,
      routeSearch.brandIds,
      routeSearch.categoryIds,
      routeSearch.filters,
      routeSearch.maxPrice,
      routeSearch.minPrice,
    ],
  );
  const [draftFilters, setDraftFilters] = useState<FilterDraftState>(appliedFilterDraft);
  const categoryIds = useMemo(() => parseIdList(routeSearch.categoryIds), [routeSearch.categoryIds]);
  const brandIds = useMemo(() => parseIdList(routeSearch.brandIds), [routeSearch.brandIds]);
  const dynamicFilters = useMemo(
    () => parseDynamicFilters(draftFilters.filters),
    [draftFilters.filters],
  );

  useEffect(() => {
    setSearchInput(routeSearch.search);
  }, [routeSearch.search]);

  useEffect(() => {
    setDraftFilters(appliedFilterDraft);
  }, [appliedFilterDraft]);

  const filtersQueryParams = { categoryIds: routeSearch.categoryIds || undefined };
  const filtersQuery = useQuery({
    queryKey: queryKeys.shop.filters(filtersQueryParams),
    queryFn: () => shopApi.filters(filtersQueryParams) as Promise<ShopFilters>,
  });
  const filters = filtersQuery.data;

  const productsQueryParams = {
    limit: 100,
    search: routeSearch.search || undefined,
    categoryIds: routeSearch.categoryIds || undefined,
    brandIds: routeSearch.brandIds || undefined,
    minPrice: routeSearch.minPrice ? Number(routeSearch.minPrice) : undefined,
    maxPrice: routeSearch.maxPrice ? Number(routeSearch.maxPrice) : undefined,
    availability: routeSearch.availability === "all" ? undefined : routeSearch.availability,
    sort: routeSearch.sort || "newest",
    filters: routeSearch.filters || undefined,
  };
  const productsQuery = useQuery({
    queryKey: queryKeys.shop.products(productsQueryParams),
    queryFn: () =>
      shopApi.products(productsQueryParams) as Promise<PageResult<ShopProduct>>,
  });

  const products = productsQuery.data?.items ?? [];
  const categories = filters?.categories ?? [];
  const selectedCategory = categoryIds.length === 1
    ? categories.find((category) => category.id === categoryIds[0])
    : null;

  const updateFilters = (next: Partial<ShopSearchState>) => {
    void navigate({
      to: "/shop",
      search: {
        search: next.search ?? routeSearch.search,
        categoryId: "all",
        categoryIds: next.categoryIds ?? routeSearch.categoryIds,
        brandId: "all",
        brandIds: next.brandIds ?? routeSearch.brandIds,
        minPrice: next.minPrice ?? routeSearch.minPrice,
        maxPrice: next.maxPrice ?? routeSearch.maxPrice,
        inStock: "all",
        availability: next.availability ?? routeSearch.availability,
        sort: next.sort ?? routeSearch.sort,
        filters: next.filters ?? routeSearch.filters,
      },
    });
  };

  const resetFilters = () => {
    setDraftFilters(defaultFilterDraft);
    void navigate({
      to: "/shop",
      search: {
        search: "",
        categoryId: "all",
        categoryIds: "",
        brandId: "all",
        brandIds: "",
        minPrice: "",
        maxPrice: "",
        inStock: "all",
        availability: "all",
        sort: "newest",
        filters: "",
      },
    });
  };

  const applyDraftFilters = () => {
    updateFilters(draftFilters);
  };

  const updateDraftFilters = (next: Partial<FilterDraftState>) => {
    setDraftFilters((current) => ({ ...current, ...next }));
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  useEffect(() => {
    if (debouncedSearch !== routeSearch.search) {
      updateFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, routeSearch.search]);

  return (
    <PublicShopShell footer={<PublicShopFooter categories={categories} />}>
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6">
        <section className="grid gap-2">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <Badge variant="secondary" className="mb-3 w-fit">
                Catalog
              </Badge>
              <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">
                {selectedCategory ? selectedCategory.name : "Products"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Browse products by category, brand, price, availability, and category-defined properties.
              </p>
            </div>
            <Link to="/track-order" className={buttonVariants({ variant: "outline" })}>
              Track an order
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-5 lg:h-[calc(100vh-13rem)] lg:min-h-[560px] lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
              <FilterPanel
                filters={filters}
                draftFilters={draftFilters}
                appliedFilters={appliedFilterDraft}
                dynamicFilters={dynamicFilters}
                updateFilters={updateDraftFilters}
                applyFilters={applyDraftFilters}
                resetFilters={resetFilters}
                loading={filtersQuery.isLoading}
              />
            </div>
          </aside>

          <div className="grid min-w-0 gap-4 lg:min-h-0 lg:grid-rows-[auto_1fr]">
            <section className="sticky top-20 z-20 rounded-md border bg-card p-3 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <form onSubmit={submitSearch} className="flex min-w-0 flex-1 gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={searchInput}
                      placeholder="Search products"
                      onChange={(event) => setSearchInput(event.target.value)}
                    />
                  </div>
                  <Button type="submit" size="icon">
                    <Search className="size-4" />
                    <span className="sr-only">Search</span>
                  </Button>
                </form>

                <div className="flex gap-2">
                  <Sheet>
                    <SheetTrigger render={<Button type="button" variant="outline" className="lg:hidden" />}>
                      <SlidersHorizontal className="size-4" />
                      Filters
                    </SheetTrigger>
                    <SheetContent side="left" className="overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                        <SheetDescription>Refine the current product list.</SheetDescription>
                      </SheetHeader>
                      <div className="px-4 pb-6">
                        <FilterPanel
                          filters={filters}
                          draftFilters={draftFilters}
                          appliedFilters={appliedFilterDraft}
                          dynamicFilters={dynamicFilters}
                          updateFilters={updateDraftFilters}
                          applyFilters={applyDraftFilters}
                          resetFilters={resetFilters}
                          loading={filtersQuery.isLoading}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select value={routeSearch.sort} onValueChange={(value) => updateFilters({ sort: value ?? "newest" })}>
                    <SelectTrigger className="w-[160px]">
                      <span className="flex flex-1 text-left">
                        {sortLabel(routeSearch.sort)}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-sm text-muted-foreground">
                <span>
                  {productsQuery.isLoading
                    ? "Loading products..."
                    : `${productsQuery.data?.total ?? products.length} products found`}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
                  Reset filters
                </Button>
              </div>
            </section>

            <div className="min-h-0 lg:overflow-y-auto lg:pr-2">
              {productsQuery.isLoading ? (
                <StateCard>Loading products...</StateCard>
              ) : products.length === 0 ? (
                <StateCard>
                  <p>No products found.</p>
                  <Button type="button" className="mt-4" onClick={resetFilters}>
                    Reset filters
                  </Button>
                </StateCard>
              ) : (
                <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <StoreProductCard key={product.id} product={product} />
                  ))}
                </section>
              )}
            </div>
          </div>
        </section>
      </main>
    </PublicShopShell>
  );
}

function FilterPanel(props: {
  filters?: ShopFilters;
  draftFilters: FilterDraftState;
  appliedFilters: FilterDraftState;
  dynamicFilters: DynamicFilterState;
  updateFilters: (next: Partial<FilterDraftState>) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  loading: boolean;
}) {
  const filters = props.filters;
  const categoryIds = useMemo(() => parseIdList(props.draftFilters.categoryIds), [props.draftFilters.categoryIds]);
  const brandIds = useMemo(() => parseIdList(props.draftFilters.brandIds), [props.draftFilters.brandIds]);
  const hasDraftChanges = !filtersEqual(props.draftFilters, props.appliedFilters);

  if (props.loading && !props.filters) {
    return <div className="rounded-md border p-4 text-sm text-muted-foreground">Loading filters...</div>;
  }

  return (
    <div className="grid gap-3">
      <div className="rounded-md border bg-card">
        <FilterHeader title="Categories" />
        <MultiSelectFilter
          placeholder="Pick categories"
          emptyLabel="All categories"
          options={(filters?.categories ?? []).map((category) => ({
            id: category.id,
            label: category.name,
            count: category.productCount ?? 0,
          }))}
          value={categoryIds}
          onChange={(next) => props.updateFilters({ categoryIds: encodeIdList(next), filters: "" })}
        />
      </div>

      <PriceRangeFilter
        priceRange={filters?.priceRange}
        minPrice={props.draftFilters.minPrice}
        maxPrice={props.draftFilters.maxPrice}
        onChange={(value) => props.updateFilters(value)}
      />

      <div className="rounded-md border bg-card">
        <FilterHeader title="Availability" />
        <AvailabilityFilter
          value={props.draftFilters.availability}
          counts={filters?.availability}
          onChange={(availability) => props.updateFilters({ availability })}
        />
      </div>

      <div className="rounded-md border bg-card">
        <FilterHeader title="Brands" />
        <MultiSelectFilter
          placeholder="Pick brands"
          emptyLabel="All brands"
          options={(filters?.brands ?? []).map((brand) => ({
            id: brand.id,
            label: brand.name,
            count: brand.productCount,
          }))}
          value={brandIds}
          onChange={(next) => props.updateFilters({ brandIds: encodeIdList(next) })}
        />
      </div>

      {(filters?.attributes ?? []).map((attribute) => (
        <AttributeFilter
          key={attribute.id}
          attribute={attribute}
          value={props.dynamicFilters[attribute.attributeId] ?? {}}
          onChange={(next) => {
            const nextFilters = { ...props.dynamicFilters, [attribute.attributeId]: next };
            if (!hasDynamicFilterValue(next)) {
              delete nextFilters[attribute.attributeId];
            }
            props.updateFilters({ filters: encodeDynamicFilters(nextFilters) });
          }}
        />
      ))}

      <div className="sticky bottom-0 grid grid-cols-2 gap-2 border-t bg-background/95 py-3 backdrop-blur">
        <Button type="button" variant="outline" onClick={props.resetFilters}>
          Reset
        </Button>
        <Button type="button" onClick={props.applyFilters} disabled={!hasDraftChanges}>
          Apply filters
        </Button>
      </div>
    </div>
  );
}

function PriceRangeFilter(props: {
  priceRange?: ShopFilters["priceRange"];
  minPrice: string;
  maxPrice: string;
  onChange: (value: Pick<ShopSearchState, "minPrice" | "maxPrice">) => void;
}) {
  const minAvailable = props.priceRange?.min ?? 0;
  const maxAvailable = Math.max(props.priceRange?.max ?? 0, minAvailable);
  const sliderMax = maxAvailable > minAvailable ? maxAvailable : minAvailable + 1;
  const currentMin = clampNumber(optionalNumeric(props.minPrice) ?? minAvailable, minAvailable, sliderMax);
  const currentMax = clampNumber(optionalNumeric(props.maxPrice) ?? maxAvailable, currentMin, sliderMax);
  const middleValue = Math.round((currentMin + currentMax) / 2);
  const minPercent = percentBetween(currentMin, minAvailable, sliderMax);
  const maxPercent = percentBetween(currentMax, minAvailable, sliderMax);
  const middlePercent = percentBetween(middleValue, minAvailable, sliderMax);

  const updateRange = (nextMin: number, nextMax: number) => {
    const min = clampNumber(Math.min(nextMin, nextMax), minAvailable, sliderMax);
    const max = clampNumber(Math.max(nextMin, nextMax), min, sliderMax);
    props.onChange({
      minPrice: min <= minAvailable ? "" : String(Math.round(min)),
      maxPrice: max >= maxAvailable ? "" : String(Math.round(max)),
    });
  };

  const updateInput = (side: "min" | "max", value: string) => {
    if (value.trim() === "") {
      props.onChange(side === "min" ? { minPrice: "", maxPrice: props.maxPrice } : { minPrice: props.minPrice, maxPrice: "" });
      return;
    }
    const parsed = optionalNumeric(value);
    if (parsed === undefined) {
      return;
    }
    if (side === "min") {
      updateRange(parsed, currentMax);
    } else {
      updateRange(currentMin, parsed);
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <FilterHeader title="Price range" />
      <div className="grid gap-3 p-3">
        <div className="rounded-md bg-muted/40 px-3 pb-8 pt-8">
          <div className="relative">
            <Slider
              min={minAvailable}
              max={sliderMax}
              step={1}
              value={[currentMin, currentMax]}
              onValueChange={(value) => {
                const [nextMin, nextMax] = Array.isArray(value) ? value : [currentMin, currentMax];
                updateRange(Number(nextMin), Number(nextMax));
              }}
              className="py-3"
            />
            <span
              className="absolute top-[28px] size-1 -translate-x-1/2 rounded-full bg-background ring-1 ring-primary"
              style={{ left: `${middlePercent}%` }}
            />
            <RangeMark
              value={formatShortMoney(currentMin, props.priceRange?.currency)}
              percent={minPercent}
            />
            <RangeMark
              value={formatShortMoney(middleValue, props.priceRange?.currency)}
              percent={middlePercent}
            />
            <RangeMark
              value={formatShortMoney(currentMax, props.priceRange?.currency)}
              percent={maxPercent}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            inputMode="decimal"
            placeholder="Min"
            value={String(Math.round(currentMin))}
            onChange={(event) => updateInput("min", event.target.value)}
          />
          <Input
            inputMode="decimal"
            placeholder="Max"
            value={String(Math.round(currentMax))}
            onChange={(event) => updateInput("max", event.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Available {formatMoney(String(minAvailable), props.priceRange?.currency)} - {formatMoney(String(maxAvailable), props.priceRange?.currency)}
        </p>
      </div>
    </div>
  );
}

function RangeMark(props: { value: string; percent: number }) {
  return (
    <span
      className="absolute top-10 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground"
      style={{ left: `${props.percent}%` }}
    >
      {props.value}
    </span>
  );
}

function MultiSelectFilter(props: {
  placeholder: string;
  emptyLabel: string;
  options: Array<{ id: string; label: string; count?: number }>;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const selected = props.options.filter((option) => props.value.includes(option.id));
  const selectedIds = new Set(props.value);

  const toggle = (id: string) => {
    props.onChange(toggleId(props.value, id, !selectedIds.has(id)));
  };

  return (
    <div className="p-3">
      <Popover>
        <PopoverTrigger render={<Button type="button" variant="outline" className="h-auto min-h-11 w-full justify-between gap-2 px-3 py-2 text-left" />}>
          <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {selected.length > 0 ? (
              selected.slice(0, 3).map((option) => (
                <span
                  key={option.id}
                  className="inline-flex max-w-full items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium"
                >
                  <span className="truncate">{option.label}</span>
                  <span
                    className="rounded-sm text-muted-foreground hover:text-foreground"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      props.onChange(props.value.filter((id) => id !== option.id));
                    }}
                  >
                    <X className="size-3" />
                  </span>
                </span>
              ))
            ) : (
              <span className="py-1 text-sm font-normal text-muted-foreground">{props.placeholder}</span>
            )}
            {selected.length > 3 ? (
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                +{selected.length - 3}
              </span>
            ) : null}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--anchor-width) gap-1 p-1.5 text-sm">
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full justify-start gap-2 px-2 py-2 text-left"
            onClick={() => props.onChange([])}
          >
            <Check className={cn("size-4", props.value.length === 0 ? "opacity-100" : "opacity-0")} />
            <span>{props.emptyLabel}</span>
          </Button>
          {props.options.map((option) => {
            const isSelected = selectedIds.has(option.id);
            return (
              <Button
                key={option.id}
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start gap-2 px-2 py-2 text-left"
                onClick={() => toggle(option.id)}
              >
                <Check className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")} />
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {typeof option.count === "number" ? (
                  <span className="text-xs text-muted-foreground">{option.count}</span>
                ) : null}
              </Button>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function AvailabilityFilter(props: {
  value: string;
  counts?: ShopFilters["availability"];
  onChange: (value: string) => void;
}) {
  return (
    <RadioGroup value={props.value} onValueChange={props.onChange} className="gap-1 p-3">
      <RadioRow value="all" label="All" />
      <RadioRow value="in-stock" label={`In stock${props.counts ? ` (${props.counts.inStock})` : ""}`} />
      <RadioRow value="out-of-stock" label={`Out of stock${props.counts ? ` (${props.counts.outOfStock})` : ""}`} />
    </RadioGroup>
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

function AttributeFilter(props: {
  attribute: ShopFilterAttribute;
  value: DynamicFilterState[string];
  onChange: (value: DynamicFilterState[string]) => void;
}) {
  if (props.attribute.inputType === "boolean" || props.attribute.type === "boolean") {
    return (
      <div className="rounded-md border bg-card">
        <FilterHeader title={props.attribute.name} />
        <div className="grid gap-2 p-3">
          <CheckboxRow
            checked={props.value.boolean === true}
            label={`Yes${props.attribute.booleanCounts ? ` (${props.attribute.booleanCounts.true})` : ""}`}
            onChange={(checked) => props.onChange(checked ? { boolean: true } : {})}
          />
        </div>
      </div>
    );
  }

  if (props.attribute.inputType === "number" || props.attribute.type === "number") {
    return (
      <div className="rounded-md border bg-card">
        <FilterHeader title={props.attribute.name} />
        <div className="grid gap-3 p-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              inputMode="decimal"
              placeholder="Min"
              value={props.value.min ?? ""}
              onChange={(event) => props.onChange({ ...props.value, min: event.target.value })}
            />
            <Input
              inputMode="decimal"
              placeholder="Max"
              value={props.value.max ?? ""}
              onChange={(event) => props.onChange({ ...props.value, max: event.target.value })}
            />
          </div>
          {props.attribute.unit ? (
            <p className="text-xs text-muted-foreground">Unit: {props.attribute.unit}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <FilterHeader title={props.attribute.name} />
      <div className="grid gap-2 p-3">
        {props.attribute.values.map((value) => {
          const selected = props.value.valueIds?.includes(value.id) ?? false;
          return (
            <CheckboxRow
              key={value.id}
              checked={selected}
              label={`${value.label} (${value.productCount})`}
              swatch={props.attribute.inputType === "color" ? value.value : undefined}
              onChange={(checked) => {
                const current = props.value.valueIds ?? [];
                const next = checked
                  ? [...new Set([...current, value.id])]
                  : current.filter((id) => id !== value.id);
                props.onChange({ ...props.value, valueIds: next });
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function StoreProductCard(props: { product: ShopProduct; className?: string }) {
  const imageUrl = productImage(props.product);
  const defaultVariant = props.product.variants[0];
  const toggleSaved = useSavedItemsStore((state) => state.toggle);
  const isSaved = useSavedItemsStore((state) => state.isSaved(props.product.id));
  const specs = productCardSpecs(props.product);

  return (
    <article className={cn("overflow-hidden rounded-md border bg-card", props.className)}>
      <div className="relative">
        <Link to="/shop/products/$slug" params={{ slug: props.product.slug }} className="block">
          <div className="aspect-[4/3] bg-muted">
            {imageUrl ? (
              <Img src={imageUrl} alt="" className="h-full w-full object-contain p-3 transition group-hover:scale-[1.02]" />
            ) : (
              <FallbackProductVisual />
            )}
          </div>
        </Link>
        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          className="absolute right-3 top-3 bg-background/90"
          onClick={() => toggleSaved(savedProductFromProduct(props.product))}
        >
          <Heart className={cn("size-4", isSaved ? "fill-rose-500 text-rose-500" : "")} />
          <span className="sr-only">{isSaved ? "Remove from saved" : "Save product"}</span>
        </Button>
      </div>
      <div className="grid gap-2.5 p-3">
        <div className="flex flex-wrap gap-1.5">
          {props.product.badgeLabel ? <Badge>{props.product.badgeLabel}</Badge> : null}
          {props.product.isTrending ? <Badge variant="secondary">Trending</Badge> : null}
          {props.product.category ? <Badge variant="outline">{props.product.category.name}</Badge> : null}
        </div>
        <div className="min-w-0">
          <Link
            to="/shop/products/$slug"
            params={{ slug: props.product.slug }}
            className="line-clamp-2 font-medium leading-5 hover:underline"
          >
            {props.product.name}
          </Link>
          {specs.length > 0 ? (
            <ul className="mt-2 grid gap-0.5 text-sm text-muted-foreground">
              {specs.slice(0, 3).map((spec) => (
                <li key={`${spec.name}-${spec.value}`} className="line-clamp-1">
                  <span className="font-medium text-foreground/80">{spec.name}:</span> {spec.value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {props.product.description ?? "Product details and available variants are ready to review."}
            </p>
          )}
        </div>
        <Separator />
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-base font-semibold">{formatMoney(defaultVariant?.price, defaultVariant?.currency)}</p>
            {defaultVariant?.compareAtPrice ? (
              <p className="text-xs text-muted-foreground line-through">
                {formatMoney(defaultVariant.compareAtPrice, defaultVariant.currency)}
              </p>
            ) : null}
          </div>
          <Badge variant={defaultVariant?.availableQuantity ? "secondary" : "outline"}>
            {defaultVariant?.availableQuantity ? "In stock" : "Unavailable"}
          </Badge>
        </div>
        <ProductCardActions product={props.product} variant={defaultVariant} />
      </div>
    </article>
  );
}

function ProductCardActions(props: { product: ShopProduct; variant?: ShopVariant }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const openCart = useCartSheetStore((state) => state.openCart);
  const disabled = !props.variant || props.variant.availableQuantity <= 0;
  const addToCart = useMutation({
    mutationFn: () =>
      shopApi.addCartItem({ variantId: props.variant!.id, quantity: 1 }) as Promise<ShopCart>,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.shop.cart() });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Failed to add item"),
  });

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={disabled || addToCart.isPending}
        onClick={() =>
          addToCart.mutate(undefined, {
            onSuccess: () => {
              toast.success("Added to cart");
              openCart();
            },
          })
        }
      >
        <ShoppingCart className="size-4" />
        Cart
      </Button>
      <Button
        type="button"
        disabled={disabled || addToCart.isPending}
        onClick={() =>
          addToCart.mutate(undefined, {
            onSuccess: () => {
              void navigate({ to: "/checkout" });
            },
          })
        }
      >
        <Zap className="size-4" />
        Buy
      </Button>
    </div>
  );
}

function productCardSpecs(product: ShopProduct) {
  if (product.specs?.length) {
    return product.specs;
  }
  return (
    product.variants[0]?.attributeValues?.map((value) => ({
      name: value.attribute?.name ?? "Option",
      value: value.label,
    })) ?? []
  );
}

function FallbackProductVisual() {
  return (
    <div className="grid h-full w-full place-items-center bg-muted">
      <PackageCheck className="size-12 text-muted-foreground" />
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
        <span className="ml-auto text-xs text-muted-foreground">{props.count}</span>
      ) : null}
    </Label>
  );
}

function StateCard(props: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}

function parseDynamicFilters(value: string | undefined): DynamicFilterState {
  if (!value?.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(value) as DynamicFilterState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function encodeDynamicFilters(value: DynamicFilterState) {
  const cleaned = Object.fromEntries(
    Object.entries(value).filter(([, filter]) => hasDynamicFilterValue(filter)),
  );
  return Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned) : "";
}

function hasDynamicFilterValue(value: DynamicFilterState[string]) {
  return Boolean(
    value.valueIds?.length ||
      value.min ||
      value.max ||
      typeof value.boolean === "boolean",
  );
}

function parseIdList(value: string | undefined) {
  return [
    ...new Set(
      (value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function encodeIdList(value: string[]) {
  return [...new Set(value)].filter(Boolean).join(",");
}

function sortLabel(value: string) {
  return sortOptions.find((option) => option.value === value)?.label ?? "Newest";
}

function filtersEqual(left: FilterDraftState, right: FilterDraftState) {
  return (
    left.categoryIds === right.categoryIds &&
    left.brandIds === right.brandIds &&
    left.minPrice === right.minPrice &&
    left.maxPrice === right.maxPrice &&
    left.availability === right.availability &&
    left.filters === right.filters
  );
}

function toggleId(value: string[], id: string, checked: boolean) {
  return checked ? [...new Set([...value, id])] : value.filter((item) => item !== id);
}

function optionalNumeric(value: string | undefined) {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function percentBetween(value: number, min: number, max: number) {
  if (max <= min) {
    return 0;
  }
  return clampNumber(((value - min) / (max - min)) * 100, 0, 100);
}

function formatShortMoney(value: number, currency?: string) {
  if (!currency) {
    return String(Math.round(value));
  }
  const rounded = Math.round(value);
  if (Math.abs(rounded) >= 1000) {
    return `${currency} ${new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(rounded)}`;
  }
  return `${currency} ${rounded}`;
}
