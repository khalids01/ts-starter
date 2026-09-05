import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/client";
import {
  LastUsedBadge,
  useLastAuthMethod,
  usePublicAuthSettings,
} from "./auth-methods";
import { SocialAuthButtons } from "./social-auth-buttons";

type SignInFormProps = {
  error?: string;
  errorDescription?: string;
  verified?: boolean;
};

const emailSchema = z.email("Enter a valid email address");

function getOAuthErrorMessage(error?: string, description?: string) {
  if (error === "signup_disabled")
    return "No account exists for this social login. Create an account first, then sign in.";
  if (error === "account_not_linked" || error === "unable_to_link_account")
    return "This email already belongs to an account. Sign in with its existing method, then connect this provider from Account settings.";
  if (error === "email_not_found" || error === "email_doesn't_match")
    return "The provider did not return the same verified email as your account. Sign in another way, then connect it from Account settings.";
  if (error === "access_denied")
    return "Social sign-in was cancelled or denied.";
  return error
    ? description || "Social sign-in could not be completed. Please try again."
    : null;
}

const methodLabels: Record<string, string> = {
  github: "GitHub",
  google: "Google",
  discord: "Discord",
  "magic-link": "Magic Link",
};

export default function SignInForm({
  error,
  errorDescription,
  verified,
}: SignInFormProps) {
  const { settings, error: settingsError } = usePublicAuthSettings();
  const { lastAuthMethod, rememberAuthMethod } = useLastAuthMethod();
  const [passwordEmail, setPasswordEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [isPasswordPending, setIsPasswordPending] = useState(false);
  const [isMagicPending, setIsMagicPending] = useState(false);
  const [activeMethod, setActiveMethod] = useState<"password" | "magic-link">("password");
  const oauthErrorMessage = getOAuthErrorMessage(error, errorDescription);

  useEffect(() => {
    if (!settings) return;
    if (lastAuthMethod === "magic-link" && settings.magicLinkSignInEnabled) {
      setActiveMethod("magic-link");
    } else if (!settings.passwordSignInEnabled && settings.magicLinkSignInEnabled) {
      setActiveMethod("magic-link");
    }
  }, [lastAuthMethod, settings]);

  const handlePasswordSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedEmail = emailSchema.safeParse(
      passwordEmail.trim().toLowerCase(),
    );
    if (!parsedEmail.success)
      return toast.error(parsedEmail.error.issues[0]?.message);
    if (!password) return toast.error("Enter your password");

    setIsPasswordPending(true);
    const { data: signInData, error: signInError } =
      await authClient.signIn.email({
        email: parsedEmail.data,
        password,
        callbackURL: "/dashboard",
    });
    if (!signInError) {
      rememberAuthMethod("password");
      if (
        signInData &&
        "twoFactorRedirect" in signInData &&
        signInData.twoFactorRedirect === true
      ) {
        return;
      }
      window.location.assign("/dashboard");
      return;
    }

    const { data } = await client.auth["check-email"].post({
      email: parsedEmail.data,
    });
    const methods = data?.authenticationMethods ?? [];
    if (
      data?.exists &&
      !methods.includes("credential") &&
      !methods.includes("password")
    ) {
      const labels = methods
        .map((method) => methodLabels[method] ?? method)
        .join(", ");
      toast.error(
        `This account uses ${labels || "OAuth or Magic Link"}. Sign in that way, then add a password from Account settings.`,
      );
    } else {
      toast.error(signInError.message || "Could not sign in with password");
    }
    setIsPasswordPending(false);
  };

  const handleMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedEmail = emailSchema.safeParse(magicEmail.trim().toLowerCase());
    if (!parsedEmail.success)
      return toast.error(parsedEmail.error.issues[0]?.message);

    setIsMagicPending(true);
    const { error: magicError } = await client.auth["magic-link"].login.post({
      email: parsedEmail.data,
      callbackURL: `${window.location.origin}/auth-complete?method=magic-link`,
    });
    setIsMagicPending(false);
    if (magicError)
      return toast.error(
        (magicError.value as { message?: string })?.message ||
          "Failed to send magic link",
      );
    toast.success("Magic link sent. Check your email.");
  };

  if (!settings) {
    return (
      <div className="mx-auto mt-10 w-full max-w-md p-6 text-center text-sm text-muted-foreground">
        {settingsError || "Loading authentication methods..."}
      </div>
    );
  }

  const hasSocialMethod =
    settings.githubSignInEnabled ||
    settings.googleSignInEnabled ||
    settings.discordSignInEnabled;

  return (
    <div className="mx-auto mt-10 w-full max-w-md space-y-6 p-6">
      <h1 className="text-center text-3xl font-bold">Welcome Back</h1>
      {verified ? (
        <div
          role="status"
          className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-950"
        >
          Email verified. You can sign in now.
        </div>
      ) : null}
      {oauthErrorMessage ? (
        <div
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          {oauthErrorMessage}
        </div>
      ) : null}

      {settings.passwordSignInEnabled && settings.magicLinkSignInEnabled ? (
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/70 p-1">
          <button type="button" onClick={() => setActiveMethod("password")} className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${activeMethod === "password" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Password<LastUsedBadge visible={lastAuthMethod === "password"} /></button>
          <button type="button" onClick={() => setActiveMethod("magic-link")} className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${activeMethod === "magic-link" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Magic Link<LastUsedBadge visible={lastAuthMethod === "magic-link"} /></button>
        </div>
      ) : null}

      {settings.passwordSignInEnabled && activeMethod === "password" ? (
        <section className="space-y-5">
          <div><h2 className="text-lg font-semibold">Sign in with password</h2><p className="text-sm text-muted-foreground">Use the password attached to your account.</p></div>
          <form onSubmit={handlePasswordSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password-email">Email</Label>
              <Input
                id="password-email"
                type="email"
                required
                placeholder="you@example.com"
                value={passwordEmail}
                onChange={(event) => setPasswordEmail(event.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isPasswordPending}
            >
              {isPasswordPending ? "Signing in..." : "Sign in with password"}
            </Button>
          </form>
        </section>
      ) : null}

      {settings.magicLinkSignInEnabled && activeMethod === "magic-link" ? (
        <section className="space-y-5">
          <div><h2 className="text-lg font-semibold">Sign in with Magic Link</h2><p className="text-sm text-muted-foreground">We will send a one-time sign-in link to your inbox.</p></div>
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="magic-email">Email</Label>
              <Input
                id="magic-email"
                type="email"
                required
                placeholder="you@example.com"
                value={magicEmail}
                onChange={(event) => setMagicEmail(event.target.value)}
                autoComplete="email"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={isMagicPending}
            >
              {isMagicPending ? "Sending..." : "Email me a magic link"}
            </Button>
          </form>
        </section>
      ) : null}

      {hasSocialMethod ? <><div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground"><div className="h-px flex-1 bg-border" /><span>Or continue with</span><div className="h-px flex-1 bg-border" /></div><SocialAuthButtons mode="sign-in" settings={settings} lastAuthMethod={lastAuthMethod} /></> : null}
      {!settings.passwordSignInEnabled &&
      !settings.magicLinkSignInEnabled &&
      !hasSocialMethod ? (
        <p className="text-center text-sm text-muted-foreground">
          Sign-in is currently unavailable.
        </p>
      ) : null}
      <div className="text-center">
        <Link
          to="/signup"
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Need an account? Sign Up
        </Link>
      </div>
    </div>
  );
}
