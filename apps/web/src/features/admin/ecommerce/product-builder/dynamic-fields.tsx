import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import type { CategoryAttribute } from "../types";
import { Field, SelectField, TextField } from "../ui";
import type { AttributeDraft } from "./drafts";

export function DynamicFields(props: {
  fields: CategoryAttribute[];
  values: AttributeDraft;
  onChange: (values: AttributeDraft) => void;
}) {
  const setValue = (attributeId: string, patch: Record<string, unknown>) => {
    props.onChange({
      ...props.values,
      [attributeId]: {
        ...(props.values[attributeId] ?? {}),
        ...patch,
      },
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {props.fields.map((field) => {
        const current = props.values[field.attributeId] ?? {};
        const label = `${field.attribute.name}${field.required ? " *" : ""}`;
        if (field.inputType === "select" || field.inputType === "color") {
          return (
            <SelectField
              key={field.id}
              label={label}
              value={current.attributeValueId ?? "none"}
              onChange={(attributeValueId) => setValue(field.attributeId, { attributeValueId })}
              options={[
                { value: "none", label: "Not set" },
                ...(field.attribute.values ?? []).map((value) => ({ value: value.id, label: value.label })),
              ]}
            />
          );
        }
        if (field.inputType === "boolean") {
          return (
            <label key={field.id} className="flex items-center gap-2 text-sm">
              <Switch
                checked={Boolean(current.rawBoolean)}
                onCheckedChange={(rawBoolean) => setValue(field.attributeId, { rawBoolean })}
              />
              {label}
            </label>
          );
        }
        if (field.inputType === "multiselect") {
          return (
            <Field key={field.id} label={label}>
              <div className="grid gap-2">
                {(field.attribute.values ?? []).map((value) => {
                  const selected = (current.attributeValueIds ?? []).includes(value.id);
                  return (
                    <label key={value.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={(checked) => {
                          const previous = current.attributeValueIds ?? [];
                          setValue(field.attributeId, {
                            attributeValueIds: checked
                              ? [...previous, value.id]
                              : previous.filter((id: string) => id !== value.id),
                          });
                        }}
                      />
                      {value.label}
                    </label>
                  );
                })}
              </div>
            </Field>
          );
        }
        return (
          <TextField
            key={field.id}
            label={label}
            type={field.inputType === "number" ? "number" : field.inputType === "date" ? "date" : "text"}
            value={
              field.inputType === "number"
                ? current.rawNumber ?? ""
                : field.inputType === "date"
                  ? current.rawDate ?? ""
                  : current.rawText ?? ""
            }
            onChange={(value) =>
              setValue(
                field.attributeId,
                field.inputType === "number"
                  ? { rawNumber: value }
                  : field.inputType === "date"
                    ? { rawDate: value }
                    : { rawText: value },
              )
            }
          />
        );
      })}
    </div>
  );
}
