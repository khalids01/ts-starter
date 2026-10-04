import { brandConfig } from "@config/brand";
import {  useNavigate, useSearch } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {  Search, SlidersHorizontal } from "lucide-react";
import { Button, } from "@/components/ui/button";
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
import {
  FilterFormProvider,
  FilterPanel,
  sortLabel,
  sortOptions,
  StateCard,
  StoreProductCard,
  type FilterDraftState,
  type ShopSearchState,
} from "./catalog";
import { PublicShopShell } from "./public-shop-shell";

import { PublicShopFooter } from "@/components/public-footer";
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

export type ShopInitialData = {
  products: PageResult<ShopProduct>;
  filters: ShopFilters;
};

export function ShopPage(props: { initialData: ShopInitialData }) {

  const rawSearch = useSearch({ from: "/_public/shop" }) as ShopRouteSearch;
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
    initialData: Object.keys(cleanShopSearch(routeSearch)).length === 0 ? props.initialData.products : undefined,
  });

  const products = productsQuery.data?.items ?? [];

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
    <PublicShopShell footer={<PublicShopFooter />}>
      <FilterFormProvider
        filters={props.initialData.filters}
        values={appliedFilterDraft}
        onApply={updateFilters}
        onReset={resetFilters}
      >
        <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 md:px-6 md:py-12">
          <header className="border-b pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{brandConfig.name} / Shop</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">{brandConfig.homepage.collectionTitle}</h1>
            <p className="mt-3 max-w-xl leading-7 text-muted-foreground">{brandConfig.homepage.collectionDescription}</p>
          </header>
          <section className="grid items-start gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="hidden lg:sticky lg:top-28 lg:block">
                <FilterPanel />
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
                      aria-label="Search products"
                      className="h-12 rounded-full bg-background pl-9"
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
                    <SelectTrigger className="min-h-11 w-[160px] rounded-full bg-background">
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

              <p aria-live="polite" className="text-sm text-muted-foreground">{productsQuery.isFetching ? "Updating products…" : `${products.length} of ${productsQuery.data?.total ?? 0} products`}{routeSearch.search ? ` for “${routeSearch.search}”` : ""}</p>
              <div className="min-h-0">
                {productsQuery.isLoading ? (
                  <StateCard>Loading products...</StateCard>
                ) : productsQuery.isError ? (
                  <StateCard><p className="font-medium text-foreground">We couldn’t load your products.</p><p className="mt-2">Please try again in a moment.</p><Button variant="outline" className="mt-4" onClick={() => void productsQuery.refetch()}>Try again</Button></StateCard>
                ) : products.length === 0 ? (
                  <StateCard>
                    <p>No products found.</p>
                    <Button type="button" className="mt-4" onClick={resetFilters}>
                      Reset filters
                    </Button>
                  </StateCard>
                ) : (
                  <section className="grid items-start gap-3 grid-cols-1 min-[380px]:grid-cols-2 md:gap-5 xl:grid-cols-3">
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
