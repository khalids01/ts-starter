import { Link } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";

import { client } from "@/lib/client";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpForm() {
  const [isGitHubSubmitting, setIsGitHubSubmitting] = useState(false);

  const signUpWithGitHub = async () => {
    setIsGitHubSubmitting(true);

    const { data, error } = await authClient.signIn.social({
      provider: "github",
      callbackURL: window.location.origin,
      disableRedirect: true,
    });

    if (error) {
      toast.error(error.message ?? "Failed to continue with GitHub");
      setIsGitHubSubmitting(false);
      return;
    }

    if (!data?.url) {
      toast.error("GitHub sign-in could not be started. Please try again.");
      setIsGitHubSubmitting(false);
      return;
    }

    window.location.assign(data.url);
  };

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
      <Button
        type="button"
        className="relative h-11 w-full bg-[#24292f] text-white shadow-sm hover:bg-[#1f2328] focus-visible:ring-[#0969da]"
        onClick={signUpWithGitHub}
        disabled={isGitHubSubmitting}
      >
        {isGitHubSubmitting ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <svg
            aria-hidden="true"
            className="absolute left-4 size-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.9c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.35 4.8-4.58 5.06.36.32.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.59.69.49A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
          </svg>
        )}
        {isGitHubSubmitting ? "Opening GitHub…" : "Continue with GitHub"}
      </Button>
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
