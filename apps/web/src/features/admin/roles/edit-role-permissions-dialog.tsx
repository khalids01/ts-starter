import { useEffect, useMemo, useState } from "react";
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
import { useSession } from "@/providers/session-provider";
import { PermissionEditor } from "./permission-editor";
import { canEditRolePermissions } from "./role-access";
import type { AdminRoleSummary, PermissionCatalogEntry } from "./types";

type EditRolePermissionsDialogProps = {
  role: AdminRoleSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditRolePermissionsDialog({
  role,
  open,
  onOpenChange,
}: EditRolePermissionsDialogProps) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const canEdit = role ? canEditRolePermissions(session, role) : false;

  const { data: roleDetail, isLoading: roleLoading } = useQuery({
    queryKey: role ? queryKeys.admin.roles.detail(role.id) : [],
    queryFn: async () => {
      if (!role) {
        throw new Error("Role is required");
      }

      const { data, error } = await client.admin.roles({ id: role.id }).get();
      if (error) {
        throw new Error("Failed to load role");
      }

      return data as { permissions: string[] };
    },
    enabled: open && Boolean(role),
  });

  const { data: catalog, isLoading: catalogLoading } = useQuery({
    queryKey: queryKeys.admin.roles.permissions(),
    queryFn: async () => {
      const { data, error } = await client.admin.roles.permissions.get();
      if (error) {
        throw new Error("Failed to load permissions");
      }

      return data as PermissionCatalogEntry[];
    },
    enabled: open,
  });

  useEffect(() => {
    if (roleDetail) {
      setSelected(new Set(roleDetail.permissions));
    }
  }, [roleDetail]);

  useEffect(() => {
    if (!open) {
      setSelected(new Set());
    }
  }, [open]);

  const hasChanges = useMemo(() => {
    if (!roleDetail) {
      return false;
    }

    if (roleDetail.permissions.length !== selected.size) {
      return true;
    }

    return roleDetail.permissions.some((permission) => !selected.has(permission));
  }, [roleDetail, selected]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!role) {
        throw new Error("Role is required");
      }

      const { data, error } = await client.admin.roles({ id: role.id }).permissions.put({
        permissions: [...selected],
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Role permissions updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.roles.all() });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        String(error?.value?.message || error?.message || "Failed to update permissions"),
      );
    },
  });

  const isLoading = roleLoading || catalogLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto text-base sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Edit permissions — {role?.name}
          </DialogTitle>
          <DialogDescription className="text-base">
            Assign permissions from the catalog. New permissions must be added in code.
          </DialogDescription>
        </DialogHeader>

        {role?.isProtected ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-base">
            This is a protected role. Its permissions cannot be edited here.
          </div>
        ) : role && session?.primaryRoleId === role.id ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-base">
            You cannot modify the role currently assigned to your account.
          </div>
        ) : isLoading || !catalog ? (
          <p className="py-8 text-center text-base text-muted-foreground">
            Loading permissions...
          </p>
        ) : (
          <PermissionEditor
            catalog={catalog}
            selected={selected}
            size="lg"
            disabled={!canEdit || saveMutation.isPending}
            onToggle={(permission, checked) => {
              setSelected((current) => {
                const next = new Set(current);
                if (checked) {
                  next.add(permission);
                } else {
                  next.delete(permission);
                }
                return next;
              });
            }}
          />
        )}

        <DialogFooter>
          <Button
            disabled={!canEdit || !hasChanges || saveMutation.isPending || isLoading}
            onClick={() => saveMutation.mutate()}
          >
            Update permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
