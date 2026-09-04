import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/client";
import { SocialAuthButtons } from "./social-auth-buttons";

type SignInFormProps = {
  error?: string;
  errorDescription?: string;
  verified?: boolean;
};

function getOAuthErrorMessage(error?: string, description?: string) {
  if (error === "signup_disabled") {
    return "No account exists for this social login. Create an account first, then sign in.";
  }
  if (error === "account_not_linked" || error === "unable_to_link_account") {
    return "This email already belongs to an account. Sign in with its existing method, then connect this provider from Account settings.";
  }
  if (error === "email_not_found" || error === "email_doesn't_match") {
    return "The provider did not return the same verified email as your account. Sign in another way, then connect it from Account settings.";
  }
  if (error === "access_denied") {
    return "Social sign-in was cancelled or denied.";
  }
  return error ? description || "Social sign-in could not be completed. Please try again." : null;
}

const methodLabels: Record<string, string> = {
  github: "GitHub",
  google: "Google",
  discord: "Discord",
  "magic-link": "Magic Link",
};

export default function SignInForm({ error, errorDescription, verified }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordPending, setIsPasswordPending] = useState(false);
  const [isMagicPending, setIsMagicPending] = useState(false);
  const oauthErrorMessage = getOAuthErrorMessage(error, errorDescription);

  const handlePasswordSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsPasswordPending(true);
    const normalizedEmail = email.trim().toLowerCase();
    const { error: signInError } = await authClient.signIn.email({
      email: normalizedEmail,
      password,
      callbackURL: "/dashboard",
    });

    if (!signInError) {
      window.location.assign("/dashboard");
      return;
    }

    const { data } = await client.auth["check-email"].post({ email: normalizedEmail });
    const methods = data?.authenticationMethods ?? [];
    if (data?.exists && !methods.includes("credential") && !methods.includes("password")) {
      const labels = methods.map((method) => methodLabels[method] ?? method).join(", ");
      toast.error(
        `This account uses ${labels || "OAuth or Magic Link"}. Use that method, or reset your password to add password login.`,
      );
    } else {
      toast.error(signInError.message || "Could not sign in with password");
    }
    setIsPasswordPending(false);
  };

  const handleMagicLink = async () => {
    setIsMagicPending(true);
    const { error: magicError } = await client.auth["magic-link"].login.post({
      email: email.trim().toLowerCase(),
    });
    setIsMagicPending(false);
    if (magicError) {
      toast.error((magicError.value as { message?: string })?.message || "Failed to send magic link");
      return;
    }
    toast.success("Magic link sent. Check your email.");
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Welcome Back</h1>
      {verified ? <div role="status" className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-950">Email verified. You can sign in now.</div> : null}
      {oauthErrorMessage ? <div role="alert" className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">{oauthErrorMessage}</div> : null}
      <form onSubmit={handlePasswordSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800">Forgot password?</Link>
          </div>
          <Input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full" disabled={isPasswordPending}>{isPasswordPending ? "Signing in..." : "Sign in with password"}</Button>
      </form>
      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" /><span>or</span><div className="h-px flex-1 bg-border" /></div>
      <Button type="button" variant="outline" className="mb-3 w-full" disabled={!email || isMagicPending} onClick={handleMagicLink}>{isMagicPending ? "Sending..." : "Email me a magic link"}</Button>
      <SocialAuthButtons mode="sign-in" />
      <div className="mt-4 text-center"><Link to="/signup" className="text-sm text-indigo-600 hover:text-indigo-800">Need an account? Sign Up</Link></div>
    </div>
  );
}
