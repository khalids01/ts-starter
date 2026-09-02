import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { client } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

type AuthSettings = {
  githubSignInEnabled: boolean;
  githubSignUpEnabled: boolean;
  magicLinkSignInEnabled: boolean;
  magicLinkSignUpEnabled: boolean;
};

type SettingKey = keyof AuthSettings;

const methods: Array<{ label: string; signIn: SettingKey; signUp: SettingKey }> = [
  { label: "GitHub", signIn: "githubSignInEnabled", signUp: "githubSignUpEnabled" },
  { label: "Magic Link", signIn: "magicLinkSignInEnabled", signUp: "magicLinkSignUpEnabled" },
];

export function AuthSettingsDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: queryKeys.admin.authSettings(),
    enabled: open,
    queryFn: async () => {
      const { data, error } = await client.admin["auth-settings"].get();
      if (error) throw error;
      return data as AuthSettings;
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (next: AuthSettings) => {
      const { data, error } = await client.admin["auth-settings"].patch(next);
      if (error) throw error;
      return data as AuthSettings;
    },
    onSuccess: () => {
      toast.success("Authentication settings saved");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.authSettings() });
    },
    onError: (error: any) => {
      toast.error(String(error?.value?.message || error?.message || "Failed to save authentication settings"));
    },
  });
  const setEnabled = (key: SettingKey, enabled: boolean) => {
    if (settings) updateMutation.mutate({ ...settings, [key]: enabled });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(triggerProps) => (
        <Button variant="outline" size="icon" {...triggerProps}>
          <Settings2 className="size-4" />
          <span className="sr-only">Authentication settings</span>
        </Button>
      )} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Authentication settings</DialogTitle>
          <DialogDescription>Control each method independently for sign-in and sign-up.</DialogDescription>
        </DialogHeader>
        {isLoading || !settings ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading settings...</div>
        ) : (
          <div className="divide-y rounded-lg border">
            {methods.map((method) => (
              <div key={method.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-5 p-4">
                <span className="font-medium">{method.label}</span>
                <label className="flex items-center gap-2 text-sm">
                  Sign in
                  <Switch checked={settings[method.signIn]} disabled={updateMutation.isPending} onCheckedChange={(enabled) => setEnabled(method.signIn, enabled)} />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  Sign up
                  <Switch checked={settings[method.signUp]} disabled={updateMutation.isPending} onCheckedChange={(enabled) => setEnabled(method.signUp, enabled)} />
                </label>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
