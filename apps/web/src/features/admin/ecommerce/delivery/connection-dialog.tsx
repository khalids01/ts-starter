import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SaveButton, TextField } from "../ui";
import type { CourierConnection, CourierProvider } from "../types";

export type CourierConnectionDraft = {
  id?: string;
  displayName: string;
  providerCode: string;
  environment: "production" | "sandbox";
  credentialSource: "server_environment" | "encrypted_database";
  priority: string;
  apiKey: string;
  secretKey: string;
  webhookToken: string;
  baseUrl: string;
};

export function connectionDraft(
  provider: CourierProvider | undefined,
  connection?: CourierConnection,
): CourierConnectionDraft {
  return {
    id: connection?.id,
    displayName: connection?.displayName ?? "",
    providerCode: connection?.provider.code ?? provider?.code ?? "",
    environment: connection?.environment ?? "production",
    credentialSource:
      connection?.credentialSource ?? "server_environment",
    priority: String(connection?.priority ?? 0),
    apiKey: "",
    secretKey: "",
    webhookToken: "",
    baseUrl: "https://portal.packzy.com/api/v1",
  };
}

export function CourierConnectionDialog(props: {
  draft: CourierConnectionDraft | null;
  providers: CourierProvider[];
  loading: boolean;
  onChange: (draft: CourierConnectionDraft | null) => void;
  onSubmit: (draft: CourierConnectionDraft) => void;
}) {
  const draft = props.draft;
  const provider = props.providers.find(
    ({ code }) => code === draft?.providerCode,
  );
  const replacingCredentials = Boolean(
    draft?.apiKey || draft?.secretKey || draft?.webhookToken || draft?.baseUrl !== "https://portal.packzy.com/api/v1",
  );
  const needsCredentials =
    draft?.credentialSource === "encrypted_database" &&
    (!draft.id || replacingCredentials);
  const valid = Boolean(
    draft?.displayName.trim() &&
      draft.providerCode &&
      (!needsCredentials ||
        (draft.apiKey.trim() &&
          draft.secretKey.trim() &&
          draft.baseUrl.trim())) &&
      (draft.credentialSource !== "server_environment" ||
        provider?.environmentConfigurationAvailable),
  );

  return (
    <Dialog
      open={Boolean(draft)}
      onOpenChange={(open) => !open && props.onChange(null)}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {draft?.id ? "Edit courier connection" : "Add courier connection"}
          </DialogTitle>
          <DialogDescription>
            Credentials are accepted only when saving and are never returned by the server.
          </DialogDescription>
        </DialogHeader>
        {draft ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Connection name"
              value={draft.displayName}
              onChange={(displayName) => props.onChange({ ...draft, displayName })}
            />
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Courier provider</span>
              <select
                className="border-input bg-background h-10 rounded-md border px-3"
                value={draft.providerCode}
                disabled={Boolean(draft.id)}
                onChange={(event) =>
                  props.onChange({ ...draft, providerCode: event.target.value })
                }
              >
                {props.providers.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Configuration source</span>
              <select
                className="border-input bg-background h-10 rounded-md border px-3"
                value={draft.credentialSource}
                disabled={Boolean(draft.id)}
                onChange={(event) =>
                  props.onChange({
                    ...draft,
                    credentialSource: event.target.value as CourierConnectionDraft["credentialSource"],
                  })
                }
              >
                <option
                  value="server_environment"
                  disabled={!provider?.environmentConfigurationAvailable}
                >
                  Server environment
                </option>
                <option value="encrypted_database">New encrypted credentials</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Environment</span>
              <select
                className="border-input bg-background h-10 rounded-md border px-3"
                value={draft.environment}
                onChange={(event) =>
                  props.onChange({
                    ...draft,
                    environment: event.target.value as CourierConnectionDraft["environment"],
                  })
                }
              >
                <option value="production">Production</option>
                <option value="sandbox">Sandbox</option>
              </select>
            </label>
            <TextField
              label="Priority"
              type="number"
              value={draft.priority}
              onChange={(priority) => props.onChange({ ...draft, priority })}
            />
            {draft.credentialSource === "encrypted_database" ? (
              <>
                <TextField
                  label={draft.id ? "Replacement API key" : "API key"}
                  type="password"
                  value={draft.apiKey}
                  onChange={(apiKey) => props.onChange({ ...draft, apiKey })}
                  placeholder={draft.id ? "Leave blank to keep current key" : undefined}
                />
                <TextField
                  label={draft.id ? "Replacement secret key" : "Secret key"}
                  type="password"
                  value={draft.secretKey}
                  onChange={(secretKey) => props.onChange({ ...draft, secretKey })}
                  placeholder={draft.id ? "Leave blank to keep current key" : undefined}
                />
                <div className="sm:col-span-2">
                  <TextField
                    label="Base URL"
                    value={draft.baseUrl}
                    onChange={(baseUrl) => props.onChange({ ...draft, baseUrl })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <TextField
                    label={draft.id ? "Replacement webhook token" : "Webhook token (optional until configured)"}
                    type="password"
                    value={draft.webhookToken}
                    onChange={(webhookToken) => props.onChange({ ...draft, webhookToken })}
                    placeholder={draft.id ? "Leave blank to keep the current token" : undefined}
                  />
                </div>
              </>
            ) : null}
          </div>
        ) : null}
        <DialogFooter>
          <SaveButton
            loading={props.loading}
            disabled={!valid}
            onClick={() => draft && props.onSubmit(draft)}
          >
            Save connection
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
