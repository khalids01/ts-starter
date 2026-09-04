import { LoaderCircle } from "lucide-react";
import { useState, type SVGProps } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type SocialProvider = "github" | "google" | "discord";
type AuthMode = "sign-in" | "sign-up";

const providers: Array<{
  id: SocialProvider;
  label: string;
  className: string;
}> = [
  {
    id: "github",
    label: "GitHub",
    className:
      "bg-[#24292f] text-white shadow-sm hover:bg-[#1f2328] focus-visible:ring-[#0969da]",
  },
  {
    id: "google",
    label: "Google",
    className: "bg-white text-[#1f1f1f] shadow-sm hover:bg-[#f8f9fa]",
  },
  {
    id: "discord",
    label: "Discord",
    className:
      "bg-[#5865f2] text-white shadow-sm hover:bg-[#4752c4] focus-visible:ring-[#5865f2]",
  },
];

function ProviderIcon({ provider, ...props }: SVGProps<SVGSVGElement> & { provider: SocialProvider }) {
  if (provider === "google") {
    return (
      <svg viewBox="0 0 24 24" {...props}>
        <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.38l-3.24-2.53c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.47H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.53l3.35-2.61Z" />
        <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.96 5.47l3.35 2.61C7.18 7.71 9.39 5.95 12 5.95Z" />
      </svg>
    );
  }

  if (provider === "discord") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19.54 5.34A16.7 16.7 0 0 0 15.44 4a11.5 11.5 0 0 0-.52 1.06 15.5 15.5 0 0 0-4.82 0A11 11 0 0 0 9.57 4a16.8 16.8 0 0 0-4.11 1.34C2.86 9.18 2.16 12.92 2.51 16.6a16.5 16.5 0 0 0 5.03 2.55c.41-.55.77-1.14 1.08-1.76a10.8 10.8 0 0 1-1.7-.82l.42-.33a11.97 11.97 0 0 0 10.32 0l.43.33c-.55.33-1.12.6-1.71.82.31.62.67 1.21 1.08 1.76a16.5 16.5 0 0 0 5.03-2.55c.42-4.27-.72-7.98-2.95-11.26ZM9.18 14.33c-.98 0-1.79-.9-1.79-2s.79-2 1.79-2 1.8.9 1.78 2c0 1.1-.79 2-1.78 2Zm5.65 0c-.98 0-1.79-.9-1.79-2s.79-2 1.79-2 1.8.9 1.78 2c0 1.1-.78 2-1.78 2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.9c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.35 4.8-4.58 5.06.36.32.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.59.69.49A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export function SocialAuthButtons({ mode }: { mode: AuthMode }) {
  const [submittingProvider, setSubmittingProvider] = useState<SocialProvider | null>(null);
  const isSignUp = mode === "sign-up";

  const continueWith = async (provider: SocialProvider) => {
    setSubmittingProvider(provider);
    const origin = window.location.origin;

    const { data, error } = await authClient.signIn.social({
      provider,
      callbackURL: isSignUp
        ? origin
        : origin,
      ...(isSignUp
        ? {
            newUserCallbackURL: origin,
            requestSignUp: true,
          }
        : {}),
      errorCallbackURL: `${origin}/${isSignUp ? "signup" : "login"}`,
      disableRedirect: true,
    });

    if (error) {
      toast.error(error.message ?? `Failed to continue with ${provider}`);
      setSubmittingProvider(null);
      return;
    }

    if (!data?.url) {
      toast.error("Social sign-in could not be started. Please try again.");
      setSubmittingProvider(null);
      return;
    }

    window.location.assign(data.url);
  };

  return (
    <div className="space-y-3">
      {providers.map((provider) => {
        const isSubmitting = submittingProvider === provider.id;

        return (
          <Button
            key={provider.id}
            type="button"
            className={`relative h-11 w-full ${provider.className}`}
            onClick={() => continueWith(provider.id)}
            disabled={submittingProvider !== null}
          >
            {isSubmitting ? (
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <ProviderIcon
                provider={provider.id}
                className="absolute left-4 size-5"
                aria-hidden="true"
              />
            )}
            {isSubmitting
              ? `Opening ${provider.label}…`
              : `Continue with ${provider.label}`}
          </Button>
        );
      })}
    </div>
  );
}
