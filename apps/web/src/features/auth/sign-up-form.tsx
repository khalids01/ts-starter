import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";

import { client } from "@/lib/client";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialAuthButtons } from "./social-auth-buttons";

type SignUpFormProps = {
  oauthError?: string;
};

export default function SignUpForm({ oauthError }: SignUpFormProps) {
  const oauthErrorMessage =
    oauthError === "social_error"
      ? "Social sign-up could not be completed. Please try again."
      : null;

  useEffect(() => {
    if (oauthError === "account_exists") {
      void authClient.signOut();
    }
  }, [oauthError]);

  if (oauthError === "account_exists") {
    return (
      <div className="mx-auto mt-10 w-full max-w-md p-6 text-center">
        <h1 className="text-3xl font-bold">Account already exists</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This social account is already registered. Please sign in instead.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  const magicLinkForm = useForm({
    defaultValues: {
      email: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      const { error } = await client.auth["magic-link"].signup.post({
        email: value.email,
        name: value.name,
      });

      if (error) {
        // @ts-ignore
        const message = error.value?.message || "Failed to send magic link";
        toast.error(message);
        return;
      }

      toast.success("Magic link sent! Check your email to confirm.");
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
      }),
    },
  });

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>
      {oauthErrorMessage ? (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-950"
        >
          {oauthErrorMessage}
        </div>
      ) : null}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          magicLinkForm.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <magicLinkForm.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="magic-signup-name">Name</Label>
                <Input
                  id="magic-signup-name"
                  name={field.name}
                  placeholder="Your name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500 text-sm">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </magicLinkForm.Field>
        </div>

        <div>
          <magicLinkForm.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="magic-signup-email">Email</Label>
                <Input
                  id="magic-signup-email"
                  name={field.name}
                  type="email"
                  placeholder="you@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500 text-sm">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </magicLinkForm.Field>
        </div>

        <magicLinkForm.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Sending..." : "Send Magic Link"}
            </Button>
          )}
        </magicLinkForm.Subscribe>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        <span>or</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <SocialAuthButtons mode="sign-up" />
      <div className="mt-4 text-center">
        <Link
          to="/login"
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
}
