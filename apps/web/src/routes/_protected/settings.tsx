import { useTheme } from "next-themes";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/client";
import { queryKeys } from "@/constants/query-keys";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/_protected/settings")({
  component: SettingsPage,
});

type SessionDevice = {
  id: string;
  expiresAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
};

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

function formatDate(value: string | Date) {
  return new Date(value).toLocaleString();
}

function SettingsPage() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const { data: devices, isLoading: devicesLoading, isError: devicesError } = useQuery({
    queryKey: queryKeys.session.devices(),
    queryFn: async () => {
      const { data, error } = await client.session.devices.get();
      if (error) {
        throw new Error("Failed to load devices");
      }
      return data as SessionDevice[];
    },
  });

  const logoutOtherDevices = useMutation({
    mutationFn: async () => {
      const { error } = await client.session.devices.others.delete();
      if (error) {
        throw new Error("Failed to log out other devices");
      }
    },
    onSuccess: async () => {
      toast.success("Other devices logged out");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.session.devices(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const logoutDevice = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await client.session.devices({ sessionId }).delete();
      if (error) {
        throw new Error("Failed to log out device");
      }
    },
    onSuccess: async () => {
      toast.success("Device logged out");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.session.devices(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you absolutely sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      try {
        await authClient.deleteUser({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/";
            },
          },
        });
      } catch (error: any) {
        toast.error("Failed to delete account");
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your devices and account safety settings.
        </p>
      </div>

      <Card><CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Choose how the store looks on this device.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-3">{["light", "dark", "system"].map((value) => <Button key={value} variant={theme === value ? "default" : "outline"} aria-pressed={theme === value} className="capitalize" onClick={() => setTheme(value)}>{value}</Button>)}</CardContent></Card>
      <Card><CardHeader><CardTitle>Sign-in & security</CardTitle><CardDescription>Manage your password, connected accounts and two-factor authentication from your profile.</CardDescription></CardHeader><CardContent><Link to="/account" className="underline underline-offset-4">Open profile security</Link></CardContent></Card>
      <Card>
        <CardHeader>
          <CardTitle>Logged-in Devices</CardTitle>
          <CardDescription>See where your account is active.</CardDescription>
        </CardHeader>
        <CardContent>
          {devicesLoading ? (
            <div className="py-6 text-sm text-muted-foreground">
              Loading devices...
            </div>
          ) : devicesError ? <p role="alert" className="text-sm text-destructive">Could not load your devices. Please reload and try again.</p> : devices?.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">
              No active devices found.
            </div>
          ) : (
            <div className="space-y-3">
              {devices?.map((device) => (
                <div key={device.id} className="rounded-lg border p-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">
                        {getDeviceLabel(device.userAgent)}
                        {device.isCurrent ? (
                          <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            Current
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        IP: {device.ipAddress || "Unknown"} - Signed in{" "}
                        {formatDate(device.createdAt)}
                      </div>
                      <div className="mt-1 break-all text-xs text-muted-foreground">
                        {device.userAgent || "Unknown user agent"}
                      </div>
                    </div>
                    {!device.isCurrent ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        disabled={logoutDevice.isPending}
                        onClick={() => logoutDevice.mutate(device.id)}
                      >
                        {logoutDevice.isPending ? "Logging out..." : "Log out"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            disabled={
              logoutOtherDevices.isPending ||
              !devices?.some((device) => !device.isCurrent)
            }
            onClick={() => logoutOtherDevices.mutate()}
          >
            {logoutOtherDevices.isPending
              ? "Logging out..."
              : "Log out other devices"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your sign-in account. Review this action before continuing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
