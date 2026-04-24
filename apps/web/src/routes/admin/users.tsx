import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { client } from "@/lib/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, UserPlus, Shield, Ban, History } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useObject } from "@/hooks/use-object";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

type InvitationListItem = {
  email: string;
  invitationCount: number;
  lastExpiresAt: string | null;
  status: "accepted" | "pending";
  acceptedUserName: string | null;
};

function UsersPage() {
  const [search, setSearch] = useState("");
  const {
    object: invitationFilters,
    setObjectValue: setInvitationFilter,
  } = useObject({
    search: "",
    status: "all" as "all" | "accepted" | "pending",
    dateFrom: "",
    dateTo: "",
    page: 1,
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.users.list(search),
    queryFn: async () => {
      const { data, error } = await client.admin.users.get({
        query: { search: search || undefined },
      });
      if (error) throw new Error(error.value?.message as string);
      return data as { users: any[]; total: number; pages: number };
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: any }) => {
      const { data, error } = await client.admin.users.invite.post({
        email,
        role,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.invitations.all(),
      });
    },
    onError: (error: any) => {
      const message =
        String(error?.value?.message || "") ||
        String(error?.message || "") ||
        "Failed to send invitation";
      toast.error(message);
    },
  });

  const { data: invitationData, isLoading: isInvitationLoading } = useQuery({
    queryKey: queryKeys.admin.invitations.list({
      search: invitationFilters.search,
      status: invitationFilters.status,
      dateFrom: invitationFilters.dateFrom,
      dateTo: invitationFilters.dateTo,
      page: invitationFilters.page,
    }),
    queryFn: async () => {
      const { data, error } = await client.admin.invitations.get({
        query: {
          page: invitationFilters.page,
          limit: 10,
          search: invitationFilters.search || undefined,
          status:
            invitationFilters.status === "all"
              ? undefined
              : invitationFilters.status,
          dateFrom: invitationFilters.dateFrom || undefined,
          dateTo: invitationFilters.dateTo || undefined,
        },
      });
      if (error) {
        throw new Error(
          String((error.value as any)?.message || "Failed to load invitations"),
        );
      }
      return data as {
        items: InvitationListItem[];
        total: number;
        pages: number;
        page: number;
        limit: number;
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          User Management
        </h1>
        <InviteDialog
          onInvite={(email, role) => inviteMutation.mutate({ email, role })}
          isLoading={inviteMutation.isPending}
        />
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center">
            <Input
              placeholder="Filter users..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data?.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "ADMIN" || user.role === "OWNER"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.banned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <UserActions user={user} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full max-w-sm">
              <label htmlFor="invitation-search" className="mb-1 block text-sm">
                Search by email
              </label>
              <Input
                id="invitation-search"
                placeholder="invitee@example.com"
                value={invitationFilters.search}
                onChange={(event) => {
                  setInvitationFilter("search", event.target.value);
                  setInvitationFilter("page", 1);
                }}
              />
            </div>

            <div className="w-[180px]">
              <label htmlFor="invitation-status" className="mb-1 block text-sm">
                Status
              </label>
              <Select
                value={invitationFilters.status}
                onValueChange={(value) => {
                  setInvitationFilter(
                    "status",
                    (value as "all" | "accepted" | "pending") || "all",
                  );
                  setInvitationFilter("page", 1);
                }}
              >
                <SelectTrigger id="invitation-status">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="date-from" className="mb-1 block text-sm">
                Expires from
              </label>
              <Input
                id="date-from"
                type="date"
                value={invitationFilters.dateFrom}
                onChange={(event) => {
                  setInvitationFilter("dateFrom", event.target.value);
                  setInvitationFilter("page", 1);
                }}
              />
            </div>

            <div>
              <label htmlFor="date-to" className="mb-1 block text-sm">
                Expires to
              </label>
              <Input
                id="date-to"
                type="date"
                value={invitationFilters.dateTo}
                onChange={(event) => {
                  setInvitationFilter("dateTo", event.target.value);
                  setInvitationFilter("page", 1);
                }}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Invitations</TableHead>
                  <TableHead>Last Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Accepted User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isInvitationLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading invitations...
                    </TableCell>
                  </TableRow>
                ) : invitationData?.items.length ? (
                  invitationData.items.map((item) => (
                    <TableRow key={item.email}>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{item.invitationCount}</TableCell>
                      <TableCell>
                        {item.lastExpiresAt
                          ? new Date(item.lastExpiresAt).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.status === "accepted" ? (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            Accepted
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>{item.acceptedUserName || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No invitations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              disabled={invitationFilters.page <= 1}
              onClick={() =>
                setInvitationFilter(
                  "page",
                  Math.max(1, invitationFilters.page - 1),
                )
              }
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {invitationData?.page ?? invitationFilters.page} of{" "}
              {invitationData?.pages ?? 1}
            </span>
            <Button
              variant="outline"
              disabled={invitationFilters.page >= (invitationData?.pages ?? 1)}
              onClick={() =>
                setInvitationFilter(
                  "page",
                  Math.min(
                    invitationData?.pages ?? invitationFilters.page,
                    invitationFilters.page + 1,
                  ),
                )
              }
            >
              Next
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InviteDialog({
  onInvite,
  isLoading,
}: {
  onInvite: (email: string, role: string) => void;
  isLoading: boolean;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation email to a new user.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="role">Role</label>
            <Select
              value={role}
              onValueChange={(val) => setRole(val || "USER")}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isLoading || !email}
            onClick={() => {
              onInvite(email, role);
              setOpen(false);
              setEmail("");
            }}
          >
            {isLoading ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserActions({ user }: { user: any }) {
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: queryKeys.admin.users.sessions(user.id),
    queryFn: async () => {
      const { data, error } = await client.admin
        .users({ id: user.id })
        .sessions.get();
      if (error)
        throw new Error(
          error.value ? JSON.stringify(error.value) : "Unknown error",
        );
      return data as any[];
    },
    enabled: sessionsOpen,
  });

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
            <DropdownMenuItem onClick={() => setSessionsOpen(true)}>
              <History className="mr-2 h-4 w-4" />
              View Sessions
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="mr-2 h-4 w-4" />
              Change Role
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <Ban className="mr-2 h-4 w-4" />
            {user.banned ? "Unban User" : "Ban User"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={sessionsOpen} onOpenChange={setSessionsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Sessions - {user.name}</DialogTitle>
            <DialogDescription>
              All active and past sessions for this user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {sessionsLoading ? (
              <div className="flex justify-center py-8">
                Loading sessions...
              </div>
            ) : sessions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No sessions found.
              </div>
            ) : (
              <div className="space-y-4">
                {sessions?.map((session: any) => (
                  <div
                    key={session.id}
                    className="flex flex-col p-3 border rounded-lg text-sm"
                  >
                    <div className="flex justify-between font-medium">
                      <span>IP: {session.ipAddress || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      OS: {session.userAgent || "Unknown"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
