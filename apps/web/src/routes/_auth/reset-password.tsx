import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: z.object({ token: z.string().optional(), error: z.string().optional() }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token, error } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [complete, setComplete] = useState(false);
  const [pending, setPending] = useState(false);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return toast.error("This reset link is invalid or expired");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setPending(true);
    const { error: resetError } = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);
    if (resetError) return toast.error(resetError.message || "Could not reset password");
    setComplete(true);
    toast.success("Password updated. You can sign in now.");
  };
  if (complete) return <div className="mx-auto mt-20 max-w-md p-6 text-center"><h1 className="text-3xl font-bold">Password updated</h1><Link to="/login" className="mt-6 inline-block text-indigo-600">Go to sign in</Link></div>;
  return <div className="mx-auto mt-20 w-full max-w-md p-6"><h1 className="text-3xl font-bold">Choose a new password</h1>{error || !token ? <div role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-950">This reset link is invalid or expired. Request a new one.</div> : null}<form onSubmit={handleSubmit} className="mt-6 space-y-4"><div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="confirm-new-password">Confirm password</Label><Input id="confirm-new-password" type="password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} /></div><Button className="w-full" disabled={pending || !token}>{pending ? "Updating..." : "Update password"}</Button></form></div>;
}
