import { useEffect, useState, useCallback, useRef } from "react";
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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const wsRef = useRef<any>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    // Initiate Eden Treaty WebSocket connection
    const ws = client.notifications.ws.subscribe();

    // The message is already a parsed JSON object matching the `response` schema from the server
    ws.subscribe((message: any) => {
      if (Array.isArray(message)) {
        setNotifications(message as unknown as AppNotification[]);
      }
      setIsPending(false);
    });

    wsRef.current = ws;

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  const markAsRead = useCallback((id: string) => {
    if (wsRef.current) {
      setIsPending(true);
      wsRef.current.send({ action: "mark-read", id });
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    if (wsRef.current) {
      setIsPending(true);
      wsRef.current.send({ action: "mark-all-read" });
    }
  }, []);

  const refresh = useCallback(() => {
    if (wsRef.current) {
      setIsPending(true);
      wsRef.current.send({ action: "refresh" });
    }
  }, []);

  return {
    data: notifications,
    markAsRead,
    markAllAsRead,
    refresh,
    isPending,
  };
};
