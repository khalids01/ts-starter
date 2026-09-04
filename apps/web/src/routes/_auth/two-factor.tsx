import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/two-factor")({ component: TwoFactorPage });

function TwoFactorPage() {
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const sendCode = async () => {
    const { error } = await authClient.twoFactor.sendOtp();
    if (error) toast.error(error.message || "Could not send verification code");
    else toast.success("Verification code sent to your email.");
  };
  useEffect(() => { void sendCode(); }, []);
  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    const { error } = await authClient.twoFactor.verifyOtp({ code: code.trim(), trustDevice: false });
    setPending(false);
    if (error) return toast.error(error.message || "Invalid verification code");
    window.location.assign("/dashboard");
  };
  return <div className="mx-auto mt-20 w-full max-w-md p-6"><h1 className="text-3xl font-bold">Two-factor verification</h1><p className="mt-2 text-sm text-muted-foreground">Enter the six-digit code sent to your email.</p><form onSubmit={verify} className="mt-6 space-y-4"><div className="space-y-2"><Label htmlFor="two-factor-code">Verification code</Label><Input id="two-factor-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} /></div><Button className="w-full" disabled={pending || code.length !== 6}>{pending ? "Verifying..." : "Verify"}</Button><Button type="button" variant="ghost" className="w-full" onClick={sendCode}>Send another code</Button></form></div>;
}
