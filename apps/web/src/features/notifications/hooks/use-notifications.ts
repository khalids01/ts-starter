import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  url: string | null;
  createdAt: string | Date;
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await client.notifications.get();
      if (error) {
        throw new Error(
          (error.value as any)?.error || "Failed to fetch notifications",
        );
      }
      return Array.isArray(data) ? (data as unknown as AppNotification[]) : [];
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await client.notifications({ id }).read.post();
      if (error) {
        throw new Error(
          (error.value as any)?.error || "Failed to mark notification as read",
        );
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await client.notifications["read-all"].post();
      if (error) {
        throw new Error(
          (error.value as any)?.error ||
            "Failed to mark all notifications as read",
        );
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
