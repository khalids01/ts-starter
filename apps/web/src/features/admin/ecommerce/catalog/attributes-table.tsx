import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ecommerceApi } from "../apiCall";
import type { ProductAttribute } from "../types";
import { EmptyTableRow, readError } from "../ui";

export function AttributesTable(props: {
  attributes: ProductAttribute[];
  loading: boolean;
  canManage: boolean;
  onEdit: (attribute: ProductAttribute) => void;
  onSaved: () => void;
}) {
  const [valueDraft, setValueDraft] = useState<Record<string, { value: string; label: string }>>({});
  const addValue = useMutation({
    mutationFn: ({ attributeId, value, label }: { attributeId: string; value: string; label: string }) =>
      ecommerceApi.catalog.upsertAttributeValue(attributeId, { value, label }),
    onSuccess: () => {
      toast.success("Value saved");
      props.onSaved();
    },
    onError: (error) => toast.error(readError(error, "Failed to save value")),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Flags</TableHead>
            <TableHead>Values</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.loading ? (
            <EmptyTableRow colSpan={5}>Loading attributes...</EmptyTableRow>
          ) : props.attributes.length === 0 ? (
            <EmptyTableRow colSpan={5}>No attributes found.</EmptyTableRow>
          ) : (
            props.attributes.map((attribute) => {
              const draft = valueDraft[attribute.id] ?? { value: "", label: "" };

              return (
                <TableRow key={attribute.id}>
                  <TableCell>
                    <div className="font-medium">{attribute.name}</div>
                    <div className="text-xs text-muted-foreground">{attribute.slug}</div>
                  </TableCell>
                  <TableCell>{attribute.type}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {attribute.filterable ? <Badge variant="secondary">Filter</Badge> : null}
                      {attribute.variantDefining ? <Badge variant="secondary">Variant</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[260px]">
                    <div className="mb-2 flex flex-wrap gap-1">
                      {(attribute.values ?? []).slice(0, 6).map((value) => (
                        <Badge key={value.id} variant="outline">
                          {value.label}
                        </Badge>
                      ))}
                    </div>
                    {props.canManage ? (
                      <div className="flex gap-2">
                        <Input
                          className="h-8"
                          placeholder="value"
                          value={draft.value}
                          onChange={(event) =>
                            setValueDraft((current) => ({
                              ...current,
                              [attribute.id]: { ...draft, value: event.target.value },
                            }))
                          }
                        />
                        <Input
                          className="h-8"
                          placeholder="label"
                          value={draft.label}
                          onChange={(event) =>
                            setValueDraft((current) => ({
                              ...current,
                              [attribute.id]: { ...draft, label: event.target.value },
                            }))
                          }
                        />
                        <Button
                          size="sm"
                          disabled={!draft.value || !draft.label || addValue.isPending}
                          onClick={() =>
                            addValue.mutate({
                              attributeId: attribute.id,
                              value: draft.value,
                              label: draft.label,
                            })
                          }
                        >
                          Add
                        </Button>
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    {props.canManage ? (
                      <Button variant="outline" size="sm" onClick={() => props.onEdit(attribute)}>
                        Edit
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
