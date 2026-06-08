import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { client } from "@/lib/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminRoleDetail, AdminRoleSummary, AssignableRole } from "./types";

type DeleteRoleDialogProps = {
  role: AdminRoleSummary | AdminRoleDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
};

export function DeleteRoleDialog({
  role,
  open,
  onOpenChange,
  onDeleted,
}: DeleteRoleDialogProps) {
  const queryClient = useQueryClient();
  const [reassignToRoleId, setReassignToRoleId] = useState("");

  const needsReassign = role ? role.userCount > 0 : false;

  const { data: assignableRoles, isLoading: rolesLoading } = useQuery({
    queryKey: queryKeys.admin.roles.assignable(),
    queryFn: async () => {
      const { data, error } = await client.admin.roles.assignable.get();
      if (error) {
        throw new Error("Failed to load assignable roles");
      }
      return data as AssignableRole[];
    },
    enabled: open && needsReassign,
  });

  const targetRoles = assignableRoles?.filter((item) => item.id !== role?.id) ?? [];

  useEffect(() => {
    if (!open) {
      setReassignToRoleId("");
    }
  }, [open]);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!role) {
        throw new Error("Role is required");
      }

      const { data, error } = await client.admin.roles({ id: role.id }).delete(
        needsReassign ? { reassignToRoleId } : {},
      );

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Role deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.roles.all() });
      onOpenChange(false);
      onDeleted?.();
    },
    onError: (error: any) => {
      toast.error(
        String(error?.value?.message || error?.message || "Failed to delete role"),
      );
    },
  });

  if (!role) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-base sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Delete role — {role.name}</DialogTitle>
          {needsReassign ? (
            <DialogDescription className="text-base">
              This role is assigned to {role.userCount}{" "}
              {role.userCount === 1 ? "user" : "users"}. Move them to another role
              before deleting.
            </DialogDescription>
          ) : (
            <DialogDescription className="text-base">
              This will permanently delete the custom role{" "}
              <span className="font-mono">{role.slug}</span>. This action cannot be
              undone.
            </DialogDescription>
          )}
        </DialogHeader>

        {needsReassign ? (
          <div className="grid gap-2 py-2">
            <label htmlFor="reassign-role" className="text-base font-medium">
              Move users to
            </label>
            {rolesLoading ? (
              <p className="text-base text-muted-foreground">Loading roles...</p>
            ) : (
              <Select
                value={reassignToRoleId}
                onValueChange={(value) => setReassignToRoleId(value ?? "")}
              >
                <SelectTrigger id="reassign-role" className="w-full text-base">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {targetRoles.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={
              deleteMutation.isPending ||
              (needsReassign && (!reassignToRoleId || rolesLoading))
            }
            onClick={() => deleteMutation.mutate()}
          >
            {needsReassign ? "Move users and delete" : "Delete role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
