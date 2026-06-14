import { MoreHorizontal, Pencil, Settings2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
                  <CategoryActionsMenu
                    category={category}
                    canManage={props.canManage}
                    onEdit={props.onEdit}
                    onDisable={props.onDisable}
                    onOpenTemplate={props.onOpenTemplate}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function CategoryActionsMenu(props: {
  category: Category;
  canManage: boolean;
  onEdit: (category: Category) => void;
  onDisable: (id: string) => void;
  onOpenTemplate: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(triggerProps) => (
          <Button variant="ghost" className="h-8 w-8 p-0" {...triggerProps}>
            <span className="sr-only">Open category actions</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      />
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => props.onOpenTemplate(props.category.id)}>
            <Settings2 className="mr-2 h-4 w-4" />
            Template
          </DropdownMenuItem>
          {props.canManage ? (
            <DropdownMenuItem onClick={() => props.onEdit(props.category)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        {props.canManage ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => props.onDisable(props.category.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Disable
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
