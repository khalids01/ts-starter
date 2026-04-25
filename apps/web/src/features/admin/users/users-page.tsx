import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { client } from "@/lib/client";
import { useObject } from "@/hooks/use-object";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InviteDialog } from "./invite-dialog";
import { UsersListTab } from "./users-list-tab";
import { InvitationsTab } from "./invitations-tab";
import type { InvitationsListResponse, UsersListResponse } from "./types";

export function UsersPage() {
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
      if (error) {
        throw new Error(error.value?.message as string);
      }
      return data as UsersListResponse;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: any }) => {
      const { data, error } = await client.admin.users.invite.post({
        email,
        role,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.invitations.all() });
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
            invitationFilters.status === "all" ? undefined : invitationFilters.status,
          dateFrom: invitationFilters.dateFrom || undefined,
          dateTo: invitationFilters.dateTo || undefined,
        },
      });
      if (error) {
        throw new Error(String((error.value as any)?.message || "Failed to load invitations"));
      }
      return data as InvitationsListResponse;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
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

        <TabsContent value="users">
          <UsersListTab
            search={search}
            onSearchChange={setSearch}
            users={data?.users ?? []}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="invites">
          <InvitationsTab
            filters={invitationFilters}
            setFilter={setInvitationFilter}
            isLoading={isInvitationLoading}
            data={invitationData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
