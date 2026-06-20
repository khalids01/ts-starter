import { useState } from "react";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { Img } from "@/components/core/img";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminImagePickerDialog } from "../images/image-picker-dialog";
import { Field } from "./ui";

export function ImagePickerField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Field label={props.label}>
      <div className={props.className ?? "grid gap-3"}>
        <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-[96px_1fr_auto] sm:items-center">
          <ImagePreview url={props.value} alt={props.label} />
          <Input
            value={props.value}
            placeholder={props.placeholder ?? "Image URL"}
            onChange={(event) => props.onChange(event.target.value)}
          />
          <div className="flex gap-2 sm:flex-col">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
              Choose
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!props.value}
              onClick={() => props.onChange("")}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
      <AdminImagePickerDialog
        open={open}
        mode="single"
        value={props.value}
        title={`Choose ${props.label.toLowerCase()}`}
        onOpenChange={setOpen}
        onSelect={(value) => props.onChange(typeof value === "string" ? value : value[0] ?? "")}
      />
    </Field>
  );
}

export function ImagePickerListField(props: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const update = (index: number, value: string) => {
    props.onChange(
      props.values.map((url, currentIndex) =>
        currentIndex === index ? value : url,
      ),
    );
  };

  return (
    <Field label={props.label}>
      <div className="grid gap-3">
        {props.values.length === 0 ? (
          <div className="rounded-md border p-3">
            <ImagePreview url="" alt={props.label} />
          </div>
        ) : null}
        {props.values.map((url, index) => (
          <div key={index} className="grid gap-3 rounded-md border p-3 md:grid-cols-[96px_1fr_auto] md:items-center">
            <ImagePreview url={url} alt={`${props.label} ${index + 1}`} />
            <Input
              value={url}
              placeholder="Image URL"
              onChange={(event) => update(index, event.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Remove image"
              onClick={() =>
                props.onChange(props.values.filter((_, currentIndex) => currentIndex !== index))
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Choose images
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => props.onChange([...props.values, ""])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add URL
          </Button>
        </div>
      </div>
      <AdminImagePickerDialog
        open={open}
        mode="multiple"
        value={props.values}
        title={`Choose ${props.label.toLowerCase()}`}
        onOpenChange={setOpen}
        onSelect={(value) => props.onChange(Array.isArray(value) ? value : value ? [value] : [])}
      />
    </Field>
  );
}

function ImagePreview(props: { url: string; alt: string }) {
  if (!props.url) {
    return (
      <div className="grid aspect-square w-24 place-items-center rounded-md bg-muted text-muted-foreground">
        <ImageIcon className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="aspect-square w-24 overflow-hidden rounded-md border bg-muted">
      <Img
        src={props.url}
        alt={props.alt}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
