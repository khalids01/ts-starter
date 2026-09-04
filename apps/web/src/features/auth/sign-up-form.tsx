import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/client";
import { SocialAuthButtons } from "./social-auth-buttons";

export default function SignUpForm({ error, errorDescription }: { error?: string; errorDescription?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordPending, setIsPasswordPending] = useState(false);
  const [isMagicPending, setIsMagicPending] = useState(false);

  const handlePasswordSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    setIsPasswordPending(true);
    const { error: signupError } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      callbackURL: "/login?verified=true",
    });
    setIsPasswordPending(false);
    if (signupError) return toast.error(signupError.message || "Could not create account");
    toast.success("Account created. Check your email to verify it.");
  };

  const handleMagicSignup = async () => {
    if (name.trim().length < 2 || !email.trim()) return toast.error("Enter your name and email first");
    setIsMagicPending(true);
    const { error: magicError } = await client.auth["magic-link"].signup.post({ name: name.trim(), email: email.trim().toLowerCase() });
    setIsMagicPending(false);
    if (magicError) return toast.error((magicError.value as { message?: string })?.message || "Failed to send magic link");
    toast.success("Magic link sent. Check your email to confirm.");
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>
      {error ? <div role="alert" className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">{errorDescription || "Social sign-up could not be completed. If this email already has an account, sign in first and connect the provider from Account settings."}</div> : null}
      <form onSubmit={handlePasswordSignup} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" required minLength={2} value={name} onChange={(event) => setName(event.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="signup-email">Email</Label><Input id="signup-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div>
        <div className="space-y-2"><Label htmlFor="signup-password">Password</Label><Input id="signup-password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" required autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div>
        <Button type="submit" className="w-full" disabled={isPasswordPending}>{isPasswordPending ? "Creating account..." : "Create account with password"}</Button>
      </form>
      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" /><span>or</span><div className="h-px flex-1 bg-border" /></div>
      <Button type="button" variant="outline" className="mb-3 w-full" disabled={isMagicPending} onClick={handleMagicSignup}>{isMagicPending ? "Sending..." : "Sign up with a magic link"}</Button>
      <SocialAuthButtons mode="sign-up" />
      <div className="mt-4 text-center"><Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-800">Already have an account? Sign In</Link></div>
    </div>
  );
}
