export const brandPolicyOptions = [
  { value: "hidden", label: "Hidden" },
  { value: "optional", label: "Optional" },
  { value: "required", label: "Required" },
  { value: "default_store", label: "Default store" },
];

export const attributeTypeOptions = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "color", label: "Color" },
];

export const inputTypeOptions = [
  "text",
  "textarea",
  "number",
  "boolean",
  "select",
  "multiselect",
  "color",
  "date",
].map((value) => ({ value, label: value }));

export const scopeOptions = ["product", "variant", "batch"].map((value) => ({
  value,
  label: value,
}));
