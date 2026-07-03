import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import type { ShopSearchState } from "./types";

export type FilterFormValues = Pick<
  ShopSearchState,
  | "categoryIds"
  | "brandIds"
  | "minPrice"
  | "maxPrice"
  | "availability"
  | "filters"
>;

export const defaultFilterFormValues: FilterFormValues = {
  categoryIds: "",
  brandIds: "",
  minPrice: "",
  maxPrice: "",
  availability: "all",
  filters: "",
};

export const {
  fieldContext: filterFieldContext,
  formContext: filterFormContext,
  useFieldContext: useFilterFieldContext,
  useFormContext: useBaseFilterFormContext,
} = createFormHookContexts();

export const {
  useAppForm: useFilterAppForm,
  withForm: withFilterForm,
  withFieldGroup: withFilterFieldGroup,
} = createFormHook({
  fieldComponents: {},
  fieldContext: filterFieldContext,
  formComponents: {},
  formContext: filterFormContext,
});

export function useFilterForm() {
  const form = useBaseFilterFormContext();
  const values = useStore(form.store, (state) => state.values);

  return Object.assign(form, { values });
}
