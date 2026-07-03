import type { FilterDraftState } from "./types";

export const defaultFilterDraft: FilterDraftState = {
  categoryIds: "",
  brandIds: "",
  minPrice: "",
  maxPrice: "",
  availability: "all",
  filters: "",
};

export const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
  { value: "oldest", label: "Oldest" },
];
