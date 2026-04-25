import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ban, History, MoreHorizontal, Shield } from "lucide-react";
import { queryKeys } from "@/constants/query-keys";
import { client } from "@/lib/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

export function UserActions({ user }: { user: any }) {
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: queryKeys.admin.users.sessions(user.id),
    queryFn: async () => {
      const { data, error } = await client.admin.users({ id: user.id }).sessions.get();
      if (error) {
        throw new Error(error.value ? JSON.stringify(error.value) : "Unknown error");
      }
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
            <DialogDescription>All active and past sessions for this user.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {sessionsLoading ? (
              <div className="flex justify-center py-8">Loading sessions...</div>
            ) : sessions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No sessions found.</div>
            ) : (
              <div className="space-y-4">
                {sessions?.map((session: any) => (
                  <div key={session.id} className="flex flex-col rounded-lg border p-3 text-sm">
                    <div className="flex justify-between font-medium">
                      <span>IP: {session.ipAddress || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
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
