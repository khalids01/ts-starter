import { Settings2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Category } from "../types";
import { EmptyTableRow, StatusBadge } from "../ui";

export function CategoriesTable(props: {
  categories: Category[];
  loading: boolean;
  canManage: boolean;
  onEdit: (category: Category) => void;
  onDisable: (id: string) => void;
  onOpenTemplate: (id: string) => void;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Fields</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.loading ? (
            <EmptyTableRow colSpan={6}>Loading categories...</EmptyTableRow>
          ) : props.categories.length === 0 ? (
            <EmptyTableRow colSpan={6}>No categories found.</EmptyTableRow>
          ) : (
            props.categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{category.slug}</div>
                </TableCell>
                <TableCell>{category.parent?.name ?? "—"}</TableCell>
                <TableCell>{category.brandPolicy}</TableCell>
                <TableCell>{category.counts?.attributes ?? 0}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <StatusBadge active={category.isActive} />
                    {category.isFeatured ? <Badge variant="secondary">Featured</Badge> : null}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      title="Template"
                      onClick={() => props.onOpenTemplate(category.id)}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    {props.canManage ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => props.onEdit(category)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Disable"
                          onClick={() => props.onDisable(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
