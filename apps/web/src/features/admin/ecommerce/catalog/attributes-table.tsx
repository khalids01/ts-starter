import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ecommerceApi } from "../apiCall";
import type { ProductAttribute, ProductAttributeValue } from "../types";
import { EmptyTableRow, readError, SaveButton, TextField } from "../ui";

export function AttributesTable(props: {
  attributes: ProductAttribute[];
  loading: boolean;
  canManage: boolean;
  onEdit: (attribute: ProductAttribute) => void;
  onSaved: () => void;
}) {
  const [valueDraft, setValueDraft] = useState<Record<string, { value: string; label: string }>>({});
  const [editingValue, setEditingValue] = useState<{ attributeId: string; value: ProductAttributeValue; valueText: string; labelText: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "attribute"; attribute: ProductAttribute } | { kind: "value"; value: ProductAttributeValue } | null>(null);
  const addValue = useMutation({
    mutationFn: ({ attributeId, value, label }: { attributeId: string; value: string; label: string }) =>
      ecommerceApi.catalog.upsertAttributeValue(attributeId, { value, label }),
    onSuccess: () => {
      toast.success("Value saved");
      props.onSaved();
    },
    onError: (error) => toast.error(readError(error, "Failed to save value")),
  });
  const updateValue = useMutation({
    mutationFn: ({ id, value, label }: { id: string; value: string; label: string }) => ecommerceApi.catalog.updateAttributeValue(id, { value, label }),
    onSuccess: () => { toast.success("Value updated"); setEditingValue(null); props.onSaved(); },
    onError: (error) => toast.error(readError(error, "Failed to update value")),
  });
  const deleteItem = useMutation({
    mutationFn: (target: NonNullable<typeof deleteTarget>) => target.kind === "attribute"
      ? ecommerceApi.catalog.deleteAttribute(target.attribute.id)
      : ecommerceApi.catalog.deleteAttributeValue(target.value.id),
    onSuccess: () => { toast.success("Deleted"); setDeleteTarget(null); props.onSaved(); },
    onError: (error) => toast.error(readError(error, "Cannot delete this item")),
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
                      {(attribute.values ?? []).map((value) => (
                        <Badge key={value.id} variant="outline" className="gap-1 pr-1">
                          {value.label}
                          {props.canManage ? <>
                            <Button variant="ghost" size="icon-xs" className="h-5 w-5" aria-label={`Edit ${value.label}`} onClick={() => setEditingValue({ attributeId: attribute.id, value, valueText: value.value, labelText: value.label })}><Pencil className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon-xs" className="h-5 w-5 text-destructive" aria-label={`Delete ${value.label}`} onClick={() => setDeleteTarget({ kind: "value", value })}><Trash2 className="h-3 w-3" /></Button>
                          </> : null}
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
                    {props.canManage ? <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" onClick={() => props.onEdit(attribute)}>Edit</Button>
                      <Button variant="ghost" size="icon-sm" className="text-destructive" aria-label={`Delete ${attribute.name}`} onClick={() => setDeleteTarget({ kind: "attribute", attribute })}><Trash2 className="h-4 w-4" /></Button>
                    </div> : null}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <Dialog open={Boolean(editingValue)} onOpenChange={(open) => !open && setEditingValue(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit attribute value</DialogTitle></DialogHeader>
          {editingValue ? <div className="space-y-3">
            <TextField label="Value" placeholder="e.g. red" value={editingValue.valueText} onChange={(valueText) => setEditingValue({ ...editingValue, valueText })} />
            <TextField label="Label" placeholder="e.g. Red" value={editingValue.labelText} onChange={(labelText) => setEditingValue({ ...editingValue, labelText })} />
          </div> : null}
          <DialogFooter><SaveButton loading={updateValue.isPending} disabled={!editingValue?.valueText || !editingValue?.labelText} onClick={() => editingValue && updateValue.mutate({ id: editingValue.value.id, value: editingValue.valueText, label: editingValue.labelText })}>Save</SaveButton></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete {deleteTarget?.kind === "attribute" ? "attribute" : "value"}?</AlertDialogTitle><AlertDialogDescription>This cannot be undone. Deletion is blocked when catalog data already uses it.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={deleteItem.isPending}>Cancel</AlertDialogCancel><AlertDialogAction disabled={deleteItem.isPending} onClick={(event) => { event.preventDefault(); if (deleteTarget) deleteItem.mutate(deleteTarget); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
