import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Eye, History, MoreHorizontal, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Permissions, Roles } from "@rbac";
import { queryKeys } from "@/constants/query-keys";
import { sessionHasPermission } from "@/features/user/lib/session-permissions";
import { useSession } from "@/providers/session-provider";
import { client } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/core/user-avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssignableRole } from "@/features/admin/roles/types";

type AdminUserDetails = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  banned: boolean;
  banReason: string | null;
  archived: boolean;
  onboardingComplete: boolean;
  plan: string | null;
  subscriptionStatus: string | null;
  authenticationMethods: string[];
  role: { slug: string; name: string };
  invitations: Array<{ id: string; email: string; status: string; expiresAt: string | Date; role: { slug: string; name: string } }>;
};

type UserSession = {
  id: string;
  expiresAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent?: boolean;
};

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className={mono ? "break-all font-mono text-xs" : "break-words"}>{value}</dd></div>;
}

function formatUserDate(value: string | Date) {
  return new Date(value).toLocaleString();
}

function getDeviceLabel(userAgent: string | null) {
  if (!userAgent) {
    return "Unknown device";
  }

  const os = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Mac OS")
      ? "macOS"
      : userAgent.includes("Android")
        ? "Android"
        : userAgent.includes("iPhone") || userAgent.includes("iPad")
          ? "iOS"
          : userAgent.includes("Linux")
            ? "Linux"
            : "Unknown OS";
  const browser = userAgent.includes("Edg/")
    ? "Edge"
    : userAgent.includes("Chrome/")
      ? "Chrome"
      : userAgent.includes("Firefox/")
        ? "Firefox"
        : userAgent.includes("Safari/")
          ? "Safari"
          : "Browser";

  return `${browser} on ${os}`;
}

export function UserActions({ user }: { user: any }) {
  const { session } = useSession();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleSlug, setRoleSlug] = useState<string>(user.role.slug);
  const queryClient = useQueryClient();

  const { data: details, isLoading: detailsLoading, isError: detailsError } = useQuery({
    queryKey: queryKeys.admin.users.detail(user.id),
    queryFn: async () => {
      const { data, error } = await client.admin.users({ id: user.id }).get();
      if (error) throw new Error(error.value ? JSON.stringify(error.value) : "Could not load user details");
      return data as AdminUserDetails;
    },
    enabled: detailsOpen,
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: queryKeys.admin.users.sessions(user.id),
    queryFn: async () => {
      const { data, error } = await client.admin.users({ id: user.id }).sessions.get();
      if (error) {
        throw new Error(error.value ? JSON.stringify(error.value) : "Unknown error");
      }
      return data as UserSession[];
    },
    enabled: sessionsOpen,
  });

  const { data: assignableRoles, isLoading: rolesLoading } = useQuery({
    queryKey: queryKeys.admin.roles.assignable(),
    queryFn: async () => {
      const { data, error } = await client.admin.roles.assignable.get();
      if (error) {
        throw new Error("Failed to load assignable roles");
      }
      return data as AssignableRole[];
    },
    enabled: roleOpen,
  });

  const changeRoleMutation = useMutation({
    mutationFn: async (nextRoleSlug: string) => {
      const { data, error } = await client.admin.users({ id: user.id }).patch({
        roleSlug: nextRoleSlug,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      setRoleOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        String(error?.value?.message || error?.message || "Failed to update role"),
      );
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await client.admin
        .users({ id: user.id })
        .sessions({ sessionId })
        .delete();
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Session revoked");
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.sessions(user.id),
      });
    },
    onError: (error: any) => {
      toast.error(
        String(error?.value?.message || error?.message || "Failed to revoke session"),
      );
    },
  });

  const revokeAllSessionsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await client.admin.users({ id: user.id }).sessions.delete();
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("All sessions revoked");
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.sessions(user.id),
      });
    },
    onError: (error: any) => {
      toast.error(
        String(error?.value?.message || error?.message || "Failed to revoke sessions"),
      );
    },
  });

  const canManageOwnerAccounts = sessionHasPermission(
    session?.permissions ?? [],
    Permissions.AdminUsersGrantAdmin,
  );
  const canViewSessions = user.role.slug !== Roles.PlatformOwner || canManageOwnerAccounts;
  const canChangeRole = user.role.slug !== Roles.PlatformOwner;
  const canUseDestructiveActions = user.role.slug !== Roles.PlatformOwner;
  const hasRevocableSessions = sessions?.some((session) => !session.isCurrent);

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
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
{canViewSessions ? (
              <DropdownMenuItem onClick={() => setSessionsOpen(true)}>
                <History className="mr-2 h-4 w-4" />
                View Sessions
              </DropdownMenuItem>
            ) : null}
            {canChangeRole ? (
              <DropdownMenuItem
                onClick={() => {
                  setRoleSlug(user.role.slug);
                  setRoleOpen(true);
                }}
              >
                <Shield className="mr-2 h-4 w-4" />
                Change Role
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
          {canUseDestructiveActions ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Ban className="mr-2 h-4 w-4" />
                {user.banned ? "Unban User" : "Ban User"}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
            <DialogDescription>
              Read-only account information. Owner accounts can be viewed here but retain their protected actions.
            </DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading user details...</div>
          ) : detailsError || !details ? (
            <div className="py-10 text-center text-sm text-destructive">Could not load user details.</div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <UserAvatar className="size-16" fallbackClassName="text-lg" image={details.image} name={details.name} />
                <div className="min-w-0">
                  <p className="font-medium">{details.name}</p>
                  <p className="break-all text-sm text-muted-foreground">{details.email}</p>
                </div>
              </div>
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <Detail label="User ID" value={details.id} mono />
                <Detail label="Role" value={details.role.name + " (" + details.role.slug + ")"} />
                <Detail label="Email verified" value={details.emailVerified ? "Yes" : "No"} />
                <Detail label="Status" value={details.banned ? "Banned" : details.archived ? "Archived" : "Active"} />
                <Detail label="Onboarding" value={details.onboardingComplete ? "Complete" : "Not complete"} />
                <Detail label="Plan" value={details.plan ?? "None"} />
                <Detail label="Subscription" value={details.subscriptionStatus ?? "None"} />
                <Detail label="Authentication" value={details.authenticationMethods.length ? details.authenticationMethods.join(", ") : "Not recorded"} />
                <Detail label="Created" value={formatUserDate(details.createdAt)} />
                <Detail label="Last updated" value={formatUserDate(details.updatedAt)} />
                {details.banReason ? <Detail label="Ban reason" value={details.banReason} /> : null}
              </dl>
              <div className="space-y-1">
                <p className="text-sm font-medium">Avatar URL</p>
                {details.image ? (
                  <a className="block break-all rounded-md border bg-muted/40 p-2 font-mono text-xs text-primary underline-offset-4 hover:underline" href={details.image} target="_blank" rel="noreferrer">{details.image}</a>
                ) : (
                  <p className="rounded-md border bg-muted/40 p-2 text-sm text-muted-foreground">No avatar URL is stored for this user.</p>
                )}
              </div>
              {details.invitations.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Invitations</p>
                  {details.invitations.map((invitation) => (
                    <div key={invitation.id} className="rounded-md border p-2 text-xs text-muted-foreground">
                      {invitation.email} · {invitation.role.name} · {invitation.status} · expires {formatUserDate(invitation.expiresAt)}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={sessionsOpen} onOpenChange={setSessionsOpen}>
        <DialogContent className="max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>User Sessions - {user.name}</DialogTitle>
            <DialogDescription>Active devices and sessions for this user.</DialogDescription>
          </DialogHeader>
          <div className="min-w-0 py-4">
            {sessionsLoading ? (
              <div className="flex justify-center py-8">Loading sessions...</div>
            ) : sessions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No sessions found.</div>
            ) : (
              <div className="max-h-[60vh] space-y-4 overflow-y-auto overflow-x-hidden">
                {sessions?.map((session) => (
                  <div key={session.id} className="min-w-0 rounded-lg border p-3 text-sm">
                    <div className="flex min-w-0 items-start justify-between gap-2 font-medium">
                      <div className="min-w-0">
                        <span className="min-w-0 truncate">
                          {getDeviceLabel(session.userAgent)}
                          {session.isCurrent ? (
                            <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              Current
                            </span>
                          ) : null}
                        </span>
                        <div className="mt-1 text-xs text-muted-foreground">
                          IP: {session.ipAddress || "Unknown"} - Signed in{" "}
                          {new Date(session.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {!session.isCurrent ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive"
                          disabled={revokeSessionMutation.isPending}
                          onClick={() => revokeSessionMutation.mutate(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Revoke session</span>
                        </Button>
                      ) : null}
                    </div>
                    <div className="mt-1 min-w-0 break-all text-xs text-muted-foreground">
                      OS: {session.userAgent || "Unknown"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={
                revokeAllSessionsMutation.isPending || !hasRevocableSessions
              }
              onClick={() => revokeAllSessionsMutation.mutate()}
            >
              {revokeAllSessionsMutation.isPending
                ? "Revoking..."
                : "Revoke all sessions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role - {user.name}</DialogTitle>
            <DialogDescription>
              Assign a role to this user. Owner roles cannot be assigned here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <label htmlFor="user-role">Role</label>
            {rolesLoading ? (
              <div className="text-sm text-muted-foreground">Loading roles...</div>
            ) : (
              <Select
                value={roleSlug}
                onValueChange={(value) => setRoleSlug(value || user.role.slug)}
              >
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles?.map((role) => (
                    <SelectItem key={role.id} value={role.slug}>
                      {role.name} ({role.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button
              disabled={
                changeRoleMutation.isPending ||
                rolesLoading ||
                roleSlug === user.role.slug
              }
              onClick={() => changeRoleMutation.mutate(roleSlug)}
            >
              Save role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
