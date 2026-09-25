import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { queryKeys } from "@/constants/query-keys";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { CourierConnection, CourierProvider } from "../types";
import { EcommerceHeader, ecommercePermissions, formatDate, readError } from "../ui";
import {
  connectionDraft,
  CourierConnectionDialog,
  type CourierConnectionDraft,
} from "./connection-dialog";
import { RoutingManagement } from "./routing-management";
import { hasAdminPermission } from "../ui";
import { Permissions } from "@rbac";

function healthVariant(state: CourierConnection["healthState"]) {
  if (state === "healthy") return "default" as const;
  if (state === "auth_failed" || state === "degraded") return "destructive" as const;
  return "secondary" as const;
}

export function AdminDeliveryPage() {
  const { session } = useSession();
  const { canManageDelivery } = ecommercePermissions(session);
  const canDispatchDelivery = hasAdminPermission(session, Permissions.AdminDeliveryDispatch);
  const canManageReturns = hasAdminPermission(session, Permissions.AdminDeliveryReturns);
  const canReconcileDelivery = hasAdminPermission(session, Permissions.AdminDeliveryReconcile);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<CourierConnectionDraft | null>(null);
  const providersQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.providers(),
    queryFn: () => ecommerceApi.delivery.providers() as Promise<CourierProvider[]>,
  });
  const connectionsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.connections(),
    queryFn: () => ecommerceApi.delivery.connections() as Promise<CourierConnection[]>,
  });
  const refresh = () =>
    void queryClient.invalidateQueries({
      queryKey: queryKeys.admin.ecommerce.delivery.all(),
    });
  const save = useMutation({
    mutationFn: (value: CourierConnectionDraft) => {
      const credentials =
        value.credentialSource === "encrypted_database" && value.apiKey.trim()
          ? {
              apiKey: value.apiKey,
              secretKey: value.secretKey,
              baseUrl: value.baseUrl,
              ...(value.webhookToken.trim()
                ? { webhookToken: value.webhookToken }
                : {}),
            }
          : undefined;
      if (value.id) {
        return ecommerceApi.delivery.updateConnection(value.id, {
          displayName: value.displayName,
          environment: value.environment,
          priority: Number(value.priority || 0),
          ...(credentials ? { credentials } : {}),
        });
      }
      return ecommerceApi.delivery.createConnection({
        providerCode: value.providerCode,
        displayName: value.displayName,
        environment: value.environment,
        credentialSource: value.credentialSource,
        priority: Number(value.priority || 0),
        ...(credentials ? { credentials } : {}),
      });
    },
    onSuccess: () => {
      toast.success("Courier connection saved");
      setDraft(null);
      refresh();
    },
    onError: (error) => toast.error(readError(error, "Failed to save connection")),
  });
  const test = useMutation({
    mutationFn: (id: string) => ecommerceApi.delivery.testConnection(id),
    onSuccess: (connection: any) => {
      toast.success(
        connection.healthState === "healthy"
          ? "Connection is healthy"
          : `Connection check returned ${connection.healthState}`,
      );
      refresh();
    },
    onError: (error) => toast.error(readError(error, "Connection check failed")),
  });
  const toggle = useMutation({
    mutationFn: (connection: CourierConnection) =>
      connection.enabled
        ? ecommerceApi.delivery.disableConnection(connection.id)
        : ecommerceApi.delivery.enableConnection(connection.id),
    onSuccess: (connection: any) => {
      toast.success(connection.enabled ? "Connection enabled" : "Connection disabled");
      refresh();
    },
    onError: (error) => toast.error(readError(error, "Failed to update connection")),
  });

  const providers = providersQuery.data ?? [];
  const connections = connectionsQuery.data ?? [];
  const queriesFailed = providersQuery.isError || connectionsQuery.isError;
  const addConnection = () => {
    const provider = providers[0];
    if (provider) setDraft(connectionDraft(provider));
  };
  return (
    <div className="space-y-6">
      <EcommerceHeader
        title="Couriers"
        description="Manage courier service connections. Connections remain disabled until their credentials pass a health check."
        action={
          canManageDelivery && providers.length > 0 ? (
            <Button onClick={addConnection}>
              <Plus className="mr-2 size-4" /> Add connection
            </Button>
          ) : null
        }
      />

      {queriesFailed ? (
        <Card>
          <CardHeader>
            <CardTitle>Could not load courier management</CardTitle>
            <CardDescription>
              {readError(
                providersQuery.error ?? connectionsQuery.error,
                "The courier providers or connections request failed.",
              )}
            </CardDescription>
            <CardAction>
              <Button variant="outline" onClick={refresh}>
                <RefreshCw className="mr-2 size-4" /> Retry
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      ) : providersQuery.isLoading || connectionsQuery.isLoading ? (
        <Card><CardContent>Loading courier connections…</CardContent></Card>
      ) : providers.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No courier providers configured</CardTitle>
            <CardDescription>
              Provider metadata is missing. Run the database courier-provider seed before creating a connection.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : connections.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No courier connections</CardTitle>
            <CardDescription>
              Add a courier account connection to start configuring delivery options and routing.
            </CardDescription>
          </CardHeader>
          {!canManageDelivery ? (
            <CardContent className="text-muted-foreground text-sm">
              This account has read-only courier access. An owner must grant the Courier Settings permission before it can create or change connections.
            </CardContent>
          ) : null}
        </Card>
      ) : (
        <section className="space-y-3">
          <div>
            <h2 className="font-semibold">Courier account connections</h2>
            <p className="text-muted-foreground text-sm">Each connection represents one merchant account and its credentials for a courier provider.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {connection.displayName}
                  <Badge variant={connection.enabled ? "default" : "secondary"}>
                    {connection.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {connection.provider.displayName} · {connection.environment} · {connection.credentialSource === "server_environment" ? "server environment" : "encrypted credentials"}
                </CardDescription>
                <CardAction>
                  <Badge variant={healthVariant(connection.healthState)}>
                    {connection.healthState.replaceAll("_", " ")}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-muted-foreground text-xs">
                  Priority {connection.priority} · Updated {formatDate(connection.updatedAt)}
                </div>
                {canManageDelivery ? (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDraft(connectionDraft(undefined, connection))}>
                      <Settings2 className="mr-2 size-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" disabled={test.isPending} onClick={() => test.mutate(connection.id)}>
                      <RefreshCw className="mr-2 size-4" /> Test
                    </Button>
                    <Button
                      variant={connection.enabled ? "destructive" : "default"}
                      size="sm"
                      disabled={toggle.isPending}
                      onClick={() => toggle.mutate(connection)}
                    >
                      {connection.enabled ? "Disable" : "Enable"}
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
            ))}
          </div>
        </section>
      )}

      <CourierConnectionDialog
        draft={draft}
        providers={providers}
        loading={save.isPending}
        onChange={setDraft}
        onSubmit={(value) => save.mutate(value)}
      />
      <RoutingManagement
        connections={connections}
        canManage={canManageDelivery}
        canDispatch={canDispatchDelivery}
        canManageReturns={canManageReturns}
        canReconcile={canReconcileDelivery}
      />
    </div>
  );
}
