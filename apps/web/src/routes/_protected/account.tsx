import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/providers/session-provider";

export const Route = createFileRoute("/_protected/account")({
  validateSearch: z.object({
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),
  component: AccountPage,
});

type Provider = "github" | "google" | "discord";
const providers: Array<{ id: Provider; label: string }> = [
  { id: "github", label: "GitHub" },
  { id: "google", label: "Google" },
  { id: "discord", label: "Discord" },
];

function AccountPage() {
  const { session, refresh } = useSession();
  const { error, error_description } = Route.useSearch();
  const [name, setName] = useState(session?.user?.name || "");
  const [accounts, setAccounts] = useState<Array<{ id: string; providerId: string }>>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstPassword, setFirstPassword] = useState("");
  const [confirmFirstPassword, setConfirmFirstPassword] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [otp, setOtp] = useState("");
  const [awaitingOtp, setAwaitingOtp] = useState(false);

  const loadAccounts = async () => {
    const { data, error } = await authClient.listAccounts();
    if (error) {
      toast.error(error.message || "Could not load connected accounts");
      return;
    }
    setAccounts((data ?? []).map((account) => ({ id: account.id, providerId: account.providerId })));
  };

  useEffect(() => { void loadAccounts(); }, []);

  const hasPassword = accounts.some((account) => account.providerId === "credential");

  const updateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy("profile");
    const { error } = await authClient.updateUser({ name: name.trim() });
    setBusy(null);
    if (error) return toast.error(error.message || "Failed to update profile");
    await refresh();
    toast.success("Profile updated");
  };

  const connectProvider = async (provider: Provider) => {
    setBusy(provider);
    const origin = window.location.origin;
    const { data, error } = await authClient.linkSocial({
      provider,
      callbackURL: `${origin}/account`,
      errorCallbackURL: `${origin}/account`,
    });
    if (error) {
      setBusy(null);
      return toast.error(error.message || `Could not connect ${provider}`);
    }
    if (data?.url) window.location.assign(data.url);
  };

  const disconnectProvider = async (provider: Provider) => {
    setBusy(provider);
    const { error } = await authClient.unlinkAccount({ providerId: provider });
    setBusy(null);
    if (error) return toast.error(error.message || `Could not disconnect ${provider}`);
    await loadAccounts();
    toast.success(`${providers.find((item) => item.id === provider)?.label} disconnected`);
  };

  const setInitialPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (firstPassword.length < 8) return toast.error("Password must be at least 8 characters");
    if (firstPassword !== confirmFirstPassword) return toast.error("Passwords do not match");
    setBusy("set-password");
    const { error } = await authClient.setPassword({ newPassword: firstPassword });
    setBusy(null);
    if (error) return toast.error(error.message || "Could not set password");
    setFirstPassword("");
    setConfirmFirstPassword("");
    await loadAccounts();
    toast.success("Password login enabled for your account");
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    setBusy("password");
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setBusy(null);
    if (error) return toast.error(error.message || "Could not change password");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password changed and other sessions signed out");
  };

  const sendEnableCode = async () => {
    setBusy("enable-2fa");
    const { error } = await authClient.twoFactor.sendOtp({ trustDevice: false });
    setBusy(null);
    if (error) return toast.error(error.message || "Could not send verification code");
    setAwaitingOtp(true);
    toast.success("Verification code sent to your email");
  };

  const enableTwoFactor = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy("verify-2fa");
    const { error } = await authClient.twoFactor.verifyOtp({ code: otp.trim(), trustDevice: false });
    setBusy(null);
    if (error) return toast.error(error.message || "Invalid verification code");
    setAwaitingOtp(false);
    setOtp("");
    await refresh();
    toast.success("Email two-factor authentication enabled");
  };

  const disableTwoFactor = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy("disable-2fa");
    const { error } = await authClient.twoFactor.disable({ password: disablePassword });
    setBusy(null);
    if (error) return toast.error(error.message || "Could not disable two-factor authentication");
    setDisablePassword("");
    await refresh();
    toast.success("Two-factor authentication disabled");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Account</h1><p className="mt-2 text-muted-foreground">Manage your profile, sign-in methods, password, and security.</p></div>
      {error ? <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-950">{error_description || "The account could not be connected. Make sure the provider uses the same verified email."}</div> : null}

      <Card>
        <CardHeader><CardTitle>Public Profile</CardTitle><CardDescription>This is how others will see you on the site.</CardDescription></CardHeader>
        <CardContent><form id="profile-form" onSubmit={updateProfile} className="space-y-4"><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={session?.user?.email || ""} disabled /></div><div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={(event) => setName(event.target.value)} /></div></form></CardContent>
        <CardFooter><Button type="submit" form="profile-form" disabled={busy === "profile"}>{busy === "profile" ? "Saving..." : "Save changes"}</Button></CardFooter>
      </Card>

      <Card>
        <CardHeader><CardTitle>Connected accounts</CardTitle><CardDescription>Verified providers with the same email can be connected to this account.</CardDescription></CardHeader>
        <CardContent className="divide-y rounded-lg border">
          {providers.map(({ id, label }) => {
            const connected = accounts.some((account) => account.providerId === id);
            return <div key={id} className="flex items-center justify-between py-4 px-4"><div><p className="font-medium">{label}</p><p className="text-sm text-muted-foreground">{connected ? "Connected" : "Not connected"}</p></div><Button type="button" variant={connected ? "outline" : "default"} disabled={busy === id} onClick={() => connected ? disconnectProvider(id) : connectProvider(id)}>{busy === id ? "Working..." : connected ? "Disconnect" : "Connect"}</Button></div>;
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Password</CardTitle><CardDescription>{hasPassword ? "Change your password. Other sessions will be signed out." : "Create a password here to enable password login for this account."}</CardDescription></CardHeader>
        <CardContent>{hasPassword ? <form id="password-form" onSubmit={changePassword} className="space-y-4"><div className="space-y-2"><Label htmlFor="current-password">Current password</Label><Input id="current-password" type="password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="account-new-password">New password</Label><Input id="account-new-password" type="password" minLength={8} maxLength={128} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="account-confirm-password">Confirm new password</Label><Input id="account-confirm-password" type="password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div></form> : <form id="set-password-form" onSubmit={setInitialPassword} className="space-y-4"><div className="space-y-2"><Label htmlFor="first-password">Password</Label><Input id="first-password" type="password" minLength={8} maxLength={128} required value={firstPassword} onChange={(event) => setFirstPassword(event.target.value)} autoComplete="new-password" /></div><div className="space-y-2"><Label htmlFor="confirm-first-password">Confirm password</Label><Input id="confirm-first-password" type="password" required value={confirmFirstPassword} onChange={(event) => setConfirmFirstPassword(event.target.value)} autoComplete="new-password" /></div></form>}</CardContent>
        <CardFooter>{hasPassword ? <Button type="submit" form="password-form" disabled={busy === "password"}>{busy === "password" ? "Changing..." : "Change password"}</Button> : <Button type="submit" form="set-password-form" disabled={busy === "set-password"}>{busy === "set-password" ? "Saving..." : "Set password"}</Button>}</CardFooter>
      </Card>

      <Card>
        <CardHeader><CardTitle>Email two-factor authentication</CardTitle><CardDescription>Require a six-digit code sent to your email after password sign-in.</CardDescription></CardHeader>
        <CardContent>
          {!hasPassword ? <p className="text-sm text-muted-foreground">Add a password before enabling two-factor authentication.</p> : session?.user.twoFactorEnabled ? <form id="disable-2fa-form" onSubmit={disableTwoFactor} className="space-y-2"><Label htmlFor="disable-2fa-password">Confirm your password to disable 2FA</Label><Input id="disable-2fa-password" type="password" required value={disablePassword} onChange={(event) => setDisablePassword(event.target.value)} /></form> : awaitingOtp ? <form id="enable-2fa-form" onSubmit={enableTwoFactor} className="space-y-2"><Label htmlFor="enable-2fa-code">Verification code</Label><Input id="enable-2fa-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} /><Button type="button" variant="ghost" className="px-0" onClick={sendEnableCode}>Send another code</Button></form> : <p className="text-sm text-muted-foreground">2FA is currently disabled.</p>}
        </CardContent>
        {hasPassword ? <CardFooter>{session?.user.twoFactorEnabled ? <Button type="submit" variant="destructive" form="disable-2fa-form" disabled={busy === "disable-2fa"}>{busy === "disable-2fa" ? "Disabling..." : "Disable 2FA"}</Button> : awaitingOtp ? <Button type="submit" form="enable-2fa-form" disabled={busy === "verify-2fa" || otp.length !== 6}>{busy === "verify-2fa" ? "Verifying..." : "Verify and enable"}</Button> : <Button type="button" onClick={sendEnableCode} disabled={busy === "enable-2fa"}>{busy === "enable-2fa" ? "Sending..." : "Enable email 2FA"}</Button>}</CardFooter> : null}
      </Card>
    </div>
  );
}
