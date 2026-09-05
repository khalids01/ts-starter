import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { usePublicAuthSettings } from "@/features/auth/auth-methods";

export const Route = createFileRoute("/_auth/forgot-password")({ component: ForgotPasswordPage });

function ForgotPasswordPage() {
  const { settings, error: settingsError } = usePublicAuthSettings();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    const { error } = await authClient.requestPasswordReset({ email: email.trim().toLowerCase(), redirectTo: "/reset-password" });
    setPending(false);
    if (error) {
      toast.error(error.message || "Could not send password reset email");
      return;
    }
    toast.success("If an account exists for that email, a reset link has been sent.");
  };
  if (!settings) return <div className="p-10 text-center text-sm text-muted-foreground">{settingsError || "Loading authentication settings..."}</div>;
  if (!settings.passwordSignInEnabled) return <div className="mx-auto mt-20 max-w-md p-6 text-center"><h1 className="text-2xl font-bold">Password sign-in is disabled</h1><Link to="/login" className="mt-6 inline-block text-sm text-indigo-600">Back to sign in</Link></div>;

  return <div className="mx-auto mt-20 w-full max-w-md p-6"><h1 className="text-3xl font-bold">Reset password</h1><p className="mt-2 text-sm text-muted-foreground">Password reset is available only if you previously created a password during signup or from Account settings.</p><form onSubmit={handleSubmit} className="mt-6 space-y-4"><div className="space-y-2"><Label htmlFor="reset-email">Email</Label><Input id="reset-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div><Button className="w-full" disabled={pending}>{pending ? "Sending..." : "Send reset link"}</Button></form><div className="mt-4 text-center"><Link to="/login" className="text-sm text-indigo-600">Back to sign in</Link></div></div>;
}
