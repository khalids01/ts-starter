import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePickerField } from "../image-picker-fields";
import { Field, TextField } from "../ui";
import { highlightDraft, type HighlightDraft } from "./drafts";

export function HighlightsEditor(props: {
  highlights: HighlightDraft[];
  onChange: (highlights: HighlightDraft[]) => void;
}) {
  const updateHighlight = (index: number, patch: Partial<HighlightDraft>) => {
    props.onChange(
      props.highlights.map((highlight, currentIndex) =>
        currentIndex === index ? { ...highlight, ...patch } : highlight,
      ),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            props.onChange([
              ...props.highlights,
              highlightDraft({ sortOrder: props.highlights.length }),
            ])
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Highlight
        </Button>
      </div>
      {props.highlights.length === 0 ? (
        <p className="rounded-md border p-4 text-sm text-muted-foreground">
          No highlights yet.
        </p>
      ) : null}
      {props.highlights.map((highlight, index) => (
        <div key={index} className="grid gap-3 rounded-md border p-4 md:grid-cols-2">
          <TextField
            label="Title"
            value={highlight.title}
            onChange={(title) => updateHighlight(index, { title })}
          />
          <TextField
            label="Sort order"
            type="number"
            value={highlight.sortOrder}
            onChange={(sortOrder) => updateHighlight(index, { sortOrder })}
          />
          <TextField
            label="Icon URL"
            value={highlight.iconUrl}
            onChange={(iconUrl) => updateHighlight(index, { iconUrl })}
          />
          <ImagePickerField
            label="Image"
            value={highlight.imageUrl}
            onChange={(imageUrl) => updateHighlight(index, { imageUrl })}
          />
          <div className="md:col-span-2">
            <Field label="Description">
              <Textarea
                value={highlight.description}
                onChange={(event) =>
                  updateHighlight(index, { description: event.target.value })
                }
              />
            </Field>
          </div>
          <div className="flex justify-end md:col-span-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                props.onChange(
                  props.highlights.filter((_, currentIndex) => currentIndex !== index),
                )
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
