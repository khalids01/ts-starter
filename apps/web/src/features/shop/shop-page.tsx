import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { queryKeys } from "@/constants/query-keys";
import { useDebounce } from "@/hooks/use-debounce";
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";
import {
  defaultFilterDraft,
  FilterFormProvider,
  FilterPanel,
  sortLabel,
  sortOptions,
  StateCard,
  StoreProductCard,
  type FilterDraftState,
  type ShopSearchState,
} from "./catalog";
import { PublicShopFooter, PublicShopShell } from "./public-shop-shell";
import type { PageResult, ShopFilters, ShopProduct } from "./types";

type ShopRouteSearch = Partial<ShopSearchState> & {
  categoryId?: string;
  brandId?: string;
};

const defaultShopSearch: ShopSearchState = {
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
};

export function ShopPage() {
  const rawSearch = useSearch({ from: "/shop" }) as ShopRouteSearch;
  const navigate = useNavigate();
  const routeSearch = normalizeShopSearch(rawSearch);
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

  const filtersQueryParams = {
    categoryIds: routeSearch.categoryIds || undefined,
  };
  const filtersQuery = useQuery({
    queryKey: queryKeys.shop.filters(filtersQueryParams),
    queryFn: async () => {
      const { data, error } = await client.shop.filters.get({
        query: filtersQueryParams,
      });
      if (error) {
        throw new Error(
          String(error.value?.message || error.message || "Failed to load filters"),
        );
      }
      return data as ShopFilters;
    },
  });
  const filters = filtersQuery.data;

  const productsQueryParams = {
    limit: 100,
    search: routeSearch.search || undefined,
    categoryIds: routeSearch.categoryIds || undefined,
    brandIds: routeSearch.brandIds || undefined,
    minPrice: routeSearch.minPrice ? Number(routeSearch.minPrice) : undefined,
    maxPrice: routeSearch.maxPrice ? Number(routeSearch.maxPrice) : undefined,
    availability:
      routeSearch.availability === "all" ? undefined : routeSearch.availability,
    sort: routeSearch.sort || "newest",
    filters: routeSearch.filters || undefined,
  };
  const productsQuery = useQuery({
    queryKey: queryKeys.shop.products(productsQueryParams),
    queryFn: async () => {
      const { data, error } = await client.shop.products.get({
        query: productsQueryParams,
      });
      if (error) {
        throw new Error(
          String(error.value?.message || error.message || "Failed to load products"),
        );
      }
      return data as PageResult<ShopProduct>;
    },
  });

  const products = productsQuery.data?.items ?? [];
  const categories = filters?.categories ?? [];

  const updateFilters = (next: Partial<ShopSearchState>) => {
    const nextSearch = normalizeShopSearch({ ...routeSearch, ...next });
    void navigate({
      to: "/shop",
      search: cleanShopSearch(nextSearch) as never,
    });
  };

  const resetFilters = () => {
    setSearchInput("");
    void navigate({
      to: "/shop",
      search: {} as never,
    });
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  useEffect(() => {
    setSearchInput(routeSearch.search);
  }, [routeSearch.search]);

  useEffect(() => {
    if (debouncedSearch !== routeSearch.search) {
      updateFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, routeSearch.search]);

  return (
    <PublicShopShell footer={<PublicShopFooter categories={categories} />}>
      <FilterFormProvider
        filters={filters}
        values={appliedFilterDraft}
        onApply={updateFilters}
        onReset={resetFilters}
      >
        <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6">
          <section className="grid gap-2">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <Link
                to="/track-order"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "hidden md:inline-flex",
                )}
              >
                Track an order
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>

          <section className="grid gap-5 lg:h-[calc(100dvh-13rem)] lg:min-h-[560px] lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <div className="max-h-[calc(100vh-7rem)] pr-1">
                <FilterPanel />
              </div>
            </aside>

            <div className="grid min-w-0 gap-4 lg:min-h-0 lg:grid-rows-[auto_1fr]">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <form
                  onSubmit={submitSearch}
                  className="flex min-w-0 flex-1 gap-2"
                >
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-10 bg-accent pl-9"
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
                    <SheetTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="lg:hidden"
                        />
                      }
                    >
                      <SlidersHorizontal className="size-4" />
                      Filters
                    </SheetTrigger>
                    <SheetContent side="left" className="overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                        <SheetDescription>
                          Refine the current product list.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="px-4 pb-6">
                        <FilterPanel />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select
                    value={routeSearch.sort}
                    onValueChange={(value) =>
                      updateFilters({ sort: value ?? "newest" })
                    }
                  >
                    <SelectTrigger className="w-[160px] bg-accent">
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
      </FilterFormProvider>
    </PublicShopShell>
  );
}

function normalizeShopSearch(search: ShopRouteSearch): ShopSearchState {
  const categoryIds =
    search.categoryIds ||
    (search.categoryId && search.categoryId !== "all" ? search.categoryId : "");
  const brandIds =
    search.brandIds ||
    (search.brandId && search.brandId !== "all" ? search.brandId : "");

  return {
    ...defaultShopSearch,
    ...search,
    categoryIds,
    brandIds,
    availability:
      search.availability === "in-stock" || search.availability === "out-of-stock"
        ? search.availability
        : "all",
    sort: search.sort || "newest",
  };
}

function cleanShopSearch(search: ShopSearchState) {
  return Object.fromEntries(
    Object.entries(search).filter(([key, value]) => {
      if (key === "categoryId" || key === "brandId" || key === "inStock") {
        return false;
      }
      return value && value !== defaultShopSearch[key as keyof ShopSearchState];
    }),
  );
}
