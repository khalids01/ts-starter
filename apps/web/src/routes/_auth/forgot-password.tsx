import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/forgot-password")({ component: ForgotPasswordPage });

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    await authClient.requestPasswordReset({ email: email.trim().toLowerCase(), redirectTo: "/reset-password" });
    setPending(false);
    toast.success("If an account exists for that email, a reset link has been sent.");
  };
  return <div className="mx-auto mt-20 w-full max-w-md p-6"><h1 className="text-3xl font-bold">Reset password</h1><p className="mt-2 text-sm text-muted-foreground">We will email you a secure password reset link.</p><form onSubmit={handleSubmit} className="mt-6 space-y-4"><div className="space-y-2"><Label htmlFor="reset-email">Email</Label><Input id="reset-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div><Button className="w-full" disabled={pending}>{pending ? "Sending..." : "Send reset link"}</Button></form><div className="mt-4 text-center"><Link to="/login" className="text-sm text-indigo-600">Back to sign in</Link></div></div>;
}
