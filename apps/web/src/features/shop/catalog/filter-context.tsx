import { createContext, useContext, type ReactNode } from "react";
import {
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
  type UseFormReturn,
} from "react-hook-form";
import type { ShopFilters } from "../types";
import { defaultFilterDraft } from "./constants";
import type { DynamicFilterState, FilterDraftState } from "./types";
import { parseDynamicFilters } from "./utils";

type FilterMetaContextValue = {
  filters?: ShopFilters;
  applyFilters: () => void;
  resetFilters: () => void;
};

type FilterFormContextValue = UseFormReturn<FilterDraftState> &
  FilterMetaContextValue & {
    values: FilterDraftState;
    dynamicFilters: DynamicFilterState;
    updateFilters: (next: Partial<FilterDraftState>) => void;
  };

const FilterMetaContext = createContext<FilterMetaContextValue | null>(null);

export function FilterFormProvider(props: {
  children: ReactNode;
  filters?: ShopFilters;
  values: FilterDraftState;
  onApply: (values: FilterDraftState) => void;
  onReset: () => void;
}) {
  const form = useForm<FilterDraftState>({
    values: props.values,
  });

  const applyFilters = form.handleSubmit((values) => {
    props.onApply(values);
  });

  const resetFilters = () => {
    form.reset(defaultFilterDraft);
    props.onReset();
  };

  return (
    <FormProvider {...form}>
      <FilterMetaContext.Provider
        value={{
          filters: props.filters,
          applyFilters,
          resetFilters,
        }}
      >
        {props.children}
      </FilterMetaContext.Provider>
    </FormProvider>
  );
}

export function useFilterForm(): FilterFormContextValue {
  const form = useFormContext<FilterDraftState>();
  const meta = useContext(FilterMetaContext);
  if (!meta) {
    throw new Error("useFilterForm must be used inside FilterFormProvider");
  }

  const watchedValues = useWatch({ control: form.control }) as FilterDraftState;
  const values = { ...defaultFilterDraft, ...watchedValues };

  const updateFilters = (next: Partial<FilterDraftState>) => {
    for (const [key, value] of Object.entries(next)) {
      form.setValue(key as keyof FilterDraftState, value ?? "", {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

  return {
    ...form,
    ...meta,
    values,
    dynamicFilters: parseDynamicFilters(values.filters),
    updateFilters,
  };
}
