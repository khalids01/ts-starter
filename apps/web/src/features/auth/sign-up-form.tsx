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

const emailSchema = z.email("Enter a valid email address");
const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters");

export default function SignUpForm({ error, errorDescription }: { error?: string; errorDescription?: string }) {
  const { settings, error: settingsError } = usePublicAuthSettings();
  const { lastAuthMethod, rememberAuthMethod } = useLastAuthMethod();
  const [passwordName, setPasswordName] = useState("");
  const [passwordEmail, setPasswordEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [magicName, setMagicName] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [isPasswordPending, setIsPasswordPending] = useState(false);
  const [isMagicPending, setIsMagicPending] = useState(false);
  const [activeMethod, setActiveMethod] = useState<"password" | "magic-link">("password");

  useEffect(() => {
    if (!settings) return;
    if (lastAuthMethod === "magic-link" && settings.magicLinkSignUpEnabled) {
      setActiveMethod("magic-link");
    } else if (!settings.passwordSignUpEnabled && settings.magicLinkSignUpEnabled) {
      setActiveMethod("magic-link");
    }
  }, [lastAuthMethod, settings]);

  const handlePasswordSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedName = nameSchema.safeParse(passwordName);
    const parsedEmail = emailSchema.safeParse(passwordEmail.trim().toLowerCase());
    if (!parsedName.success) return toast.error(parsedName.error.issues[0]?.message);
    if (!parsedEmail.success) return toast.error(parsedEmail.error.issues[0]?.message);
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    setIsPasswordPending(true);
    const { error: signupError } = await authClient.signUp.email({
      name: parsedName.data,
      email: parsedEmail.data,
      password,
      callbackURL: "/login?verified=true",
    });
    setIsPasswordPending(false);
    if (signupError) {
      const { data } = await client.auth["check-email"].post({ email: parsedEmail.data });
      const methods = data?.authenticationMethods ?? [];
      if (data?.exists && !methods.includes("credential") && !methods.includes("password")) {
        return toast.error("This account uses OAuth or Magic Link. Sign in with that method, then add a password from Account settings.");
      }
      return toast.error(signupError.message || "Could not create account");
    }
    rememberAuthMethod("password");
    toast.success("Account created. Check your email to verify it.");
  };

  const handleMagicSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedName = nameSchema.safeParse(magicName);
    const parsedEmail = emailSchema.safeParse(magicEmail.trim().toLowerCase());
    if (!parsedName.success) return toast.error(parsedName.error.issues[0]?.message);
    if (!parsedEmail.success) return toast.error(parsedEmail.error.issues[0]?.message);

    setIsMagicPending(true);
    const { error: magicError } = await client.auth["magic-link"].signup.post({
      name: parsedName.data,
      email: parsedEmail.data,
      callbackURL: `${window.location.origin}/auth-complete?method=magic-link`,
    });
    setIsMagicPending(false);
    if (magicError) return toast.error((magicError.value as { message?: string })?.message || "Failed to send magic link");
    toast.success("Magic link sent. Check your email to confirm.");
  };

  if (!settings) {
    return <div className="mx-auto mt-10 w-full max-w-md p-6 text-center text-sm text-muted-foreground">{settingsError || "Loading authentication methods..."}</div>;
  }

  const hasSocialMethod = settings.githubSignUpEnabled || settings.googleSignUpEnabled || settings.discordSignUpEnabled;

  return (
    <div className="mx-auto mt-10 w-full max-w-md space-y-6 p-6">
      <h1 className="text-center text-3xl font-bold">Create Account</h1>
      {error ? <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">{errorDescription || "Social sign-up could not be completed. If this email already has an account, sign in first and connect the provider from Account settings."}</div> : null}

      {settings.passwordSignUpEnabled && settings.magicLinkSignUpEnabled ? (
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/70 p-1">
          <button type="button" onClick={() => setActiveMethod("password")} className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${activeMethod === "password" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Password<LastUsedBadge visible={lastAuthMethod === "password"} /></button>
          <button type="button" onClick={() => setActiveMethod("magic-link")} className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${activeMethod === "magic-link" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Magic Link<LastUsedBadge visible={lastAuthMethod === "magic-link"} /></button>
        </div>
      ) : null}

      {settings.passwordSignUpEnabled && activeMethod === "password" ? (
        <section className="space-y-5">
          <div><h2 className="text-lg font-semibold">Create with password</h2><p className="text-sm text-muted-foreground">Create a verified account with a reusable password.</p></div>
          <form onSubmit={handlePasswordSignup} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="password-name">Name</Label><Input id="password-name" required minLength={2} placeholder="Your name" value={passwordName} onChange={(event) => setPasswordName(event.target.value)} autoComplete="name" /></div>
            <div className="space-y-2"><Label htmlFor="password-signup-email">Email</Label><Input id="password-signup-email" type="email" required placeholder="you@example.com" value={passwordEmail} onChange={(event) => setPasswordEmail(event.target.value)} autoComplete="email" /></div>
            <div className="space-y-2"><Label htmlFor="signup-password">Password</Label><Input id="signup-password" type="password" required minLength={8} maxLength={128} placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /></div>
            <div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" required placeholder="Repeat your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" /></div>
            <Button type="submit" className="w-full" disabled={isPasswordPending}>{isPasswordPending ? "Creating account..." : "Create account with password"}</Button>
          </form>
        </section>
      ) : null}

      {settings.magicLinkSignUpEnabled && activeMethod === "magic-link" ? (
        <section className="space-y-5">
          <div><h2 className="text-lg font-semibold">Create with Magic Link</h2><p className="text-sm text-muted-foreground">No password needed. We will email you a one-time link.</p></div>
          <form onSubmit={handleMagicSignup} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="magic-name">Name</Label><Input id="magic-name" required minLength={2} placeholder="Your name" value={magicName} onChange={(event) => setMagicName(event.target.value)} autoComplete="name" /></div>
            <div className="space-y-2"><Label htmlFor="magic-signup-email">Email</Label><Input id="magic-signup-email" type="email" required placeholder="you@example.com" value={magicEmail} onChange={(event) => setMagicEmail(event.target.value)} autoComplete="email" /></div>
            <Button type="submit" variant="outline" className="w-full" disabled={isMagicPending}>{isMagicPending ? "Sending..." : "Sign up with a magic link"}</Button>
          </form>
        </section>
      ) : null}

      {hasSocialMethod ? <><div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground"><div className="h-px flex-1 bg-border" /><span>Or continue with</span><div className="h-px flex-1 bg-border" /></div><SocialAuthButtons mode="sign-up" settings={settings} lastAuthMethod={lastAuthMethod} /></> : null}
      {!settings.passwordSignUpEnabled && !settings.magicLinkSignUpEnabled && !hasSocialMethod ? <p className="text-center text-sm text-muted-foreground">Sign-up is currently unavailable.</p> : null}
      <div className="text-center"><Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-800">Already have an account? Sign In</Link></div>
    </div>
  );
}
