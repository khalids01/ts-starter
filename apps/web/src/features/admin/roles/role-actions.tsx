import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { useSession } from "@/providers/session-provider";
import { DeleteRoleDialog } from "./delete-role-dialog";
import { EditRolePermissionsDialog } from "./edit-role-permissions-dialog";
import { canDeleteCustomRole, canEditRolePermissions } from "./role-access";
import type { AdminRoleSummary } from "./types";

export function RoleActions({ role }: { role: AdminRoleSummary }) {
  const { session } = useSession();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const showEdit = canEditRolePermissions(session, role);
  const showDelete = canDeleteCustomRole(session, role);

  if (!showEdit && !showDelete) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(triggerProps) => (
            <Button variant="ghost" className="h-8 w-8 p-0" {...triggerProps}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        />
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {showEdit ? (
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit permissions
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
          {showDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete role
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditRolePermissionsDialog
        role={role}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteRoleDialog
        role={role}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
