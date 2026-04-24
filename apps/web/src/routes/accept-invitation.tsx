import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { client } from "@/lib/client";
import { useSession } from "@/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InvitationData = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  inviterName: string;
};

type ApiError = {
  status: number;
  code: string;
  message: string;
};

export const Route = createFileRoute("/accept-invitation")({
  component: AcceptInvitationPage,
  validateSearch: (search) => ({
    id: typeof search.id === "string" ? search.id : "",
  }),
});

function AcceptInvitationPage() {
  const search = Route.useSearch();
  const invitationId = useMemo(() => search.id.trim(), [search.id]);
  const { session } = useSession();
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const invitationQuery = useQuery({
    queryKey: queryKeys.invitations.detail(invitationId),
    enabled: invitationId.length > 0,
    queryFn: async () => {
      const { data, error } = await client.invitations({ id: invitationId }).get();
      if (error) {
        throw {
          status: Number(error.status ?? 500),
          code: String((error.value as any)?.code ?? "UNKNOWN_ERROR"),
          message: String((error.value as any)?.message ?? "Failed to load invitation."),
        } satisfies ApiError;
      }
      return data as InvitationData;
    },
  });

  useEffect(() => {
    if (!emailInput && invitationQuery.data?.email) {
      setEmailInput(invitationQuery.data.email);
    }
  }, [invitationQuery.data?.email, emailInput]);

  const effectiveEmail = emailInput || invitationQuery.data?.email || "";

  const sendMagicLinkMutation = useMutation({
    mutationFn: async () => {
      const email = effectiveEmail.trim();
      if (!email) {
        throw new Error("Please enter an email.");
      }

      const callbackURL = `${window.location.origin}/accept-invitation?id=${encodeURIComponent(invitationId)}`;

      const checkEmailRes = await client.auth["check-email"].post({ email });
      if (checkEmailRes.error) {
        throw new Error(
          String((checkEmailRes.error.value as any)?.message ?? "Could not verify email."),
        );
      }

      const userExists = Boolean((checkEmailRes.data as any)?.exists);
      if (userExists) {
        const { error } = await client.auth["magic-link"].login.post({
          email,
          callbackURL,
        });
        if (error) {
          throw new Error(String((error.value as any)?.message ?? "Failed to send magic link."));
        }
        return;
      }

      const name = nameInput.trim();
      if (!name) {
        throw new Error("Please enter your name.");
      }

      const { error } = await client.auth["magic-link"].signup.post({
        email,
        name,
        callbackURL,
      });
      if (error) {
        throw new Error(String((error.value as any)?.message ?? "Failed to send magic link."));
      }
    },
    onSuccess: () => {
      toast.success("Magic link sent. Open it to continue accepting the invitation.");
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Failed to send magic link.");
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await client
        .invitations({ id: invitationId })
        .accept.post({});
      if (error) {
        throw {
          status: Number(error.status ?? 500),
          code: String((error.value as any)?.code ?? "UNKNOWN_ERROR"),
          message: String((error.value as any)?.message ?? "Failed to accept invitation."),
        } satisfies ApiError;
      }
      return data as { success: true; redirectTo: "/onboarding" | "/dashboard" };
    },
    onSuccess: (data) => {
      window.location.assign(data.redirectTo);
    },
    onError: (error: any) => {
      if (error?.code === "EMAIL_MISMATCH") {
        toast.error("Sign in with the invited email address, then try again.");
        return;
      }
      toast.error(error?.message ?? "Failed to accept invitation.");
    },
  });

  if (!invitationId) {
    return (
      <InvitationPageShell>
        <StatusCard title="Invalid Invitation" description="Invitation id is missing in the URL." />
      </InvitationPageShell>
    );
  }

  if (invitationQuery.isLoading) {
    return (
      <InvitationPageShell>
        <StatusCard title="Loading Invitation" description="Please wait while we verify your invitation." />
      </InvitationPageShell>
    );
  }

  if (invitationQuery.isError) {
    const rawError = invitationQuery.error as unknown;
    const error: ApiError =
      rawError && typeof rawError === "object" && "code" in rawError
        ? (rawError as ApiError)
        : {
          status: 500,
          code: "UNKNOWN_ERROR",
          message: "We could not load this invitation.",
        };
    const { title, description } = getErrorCopy(error);
    return (
      <InvitationPageShell>
        <StatusCard title={title} description={description} />
      </InvitationPageShell>
    );
  }

  const invitation = invitationQuery.data;
  if (!invitation) {
    return (
      <InvitationPageShell>
        <StatusCard
          title="Invitation Unavailable"
          description="We could not load this invitation."
        />
      </InvitationPageShell>
    );
  }

  const isLoggedIn = Boolean(session?.user);

  return (
    <InvitationPageShell>
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Inviter:</span> {invitation.inviterName}
            </p>
            <p>
              <span className="font-medium">Email:</span> {invitation.email}
            </p>
            <p>
              <span className="font-medium">Role:</span> {invitation.role}
            </p>
            <p>
              <span className="font-medium">Expires:</span>{" "}
              {new Date(invitation.expiresAt).toLocaleString()}
            </p>
          </div>

          {!isLoggedIn ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invitation-name">Name</Label>
                <Input
                  id="invitation-name"
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invitation-email">Email</Label>
                <Input
                  id="invitation-email"
                  type="email"
                  value={effectiveEmail}
                  onChange={(event) => setEmailInput(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => sendMagicLinkMutation.mutate()}
                disabled={sendMagicLinkMutation.isPending || !effectiveEmail.trim()}
              >
                {sendMagicLinkMutation.isPending ? "Sending..." : "Send Magic Link"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="font-medium">{session?.user.email}</span>.
              </p>
              <Button
                className="w-full"
                onClick={() => acceptMutation.mutate()}
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending ? "Accepting..." : "Accept Invitation"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </InvitationPageShell>
  );
}

function InvitationPageShell({ children }: { children: React.ReactNode }) {
  return <div className="container mx-auto flex min-h-screen items-center justify-center p-4">{children}</div>;
}

function StatusCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function getErrorCopy(error: ApiError) {
  if (error.code === "INVITATION_NOT_FOUND") {
    return {
      title: "Invitation Not Found",
      description: "This invitation link is invalid or no longer exists.",
    };
  }

  if (error.code === "INVITATION_EXPIRED") {
    return {
      title: "Invitation Expired",
      description: "This invitation has expired. Ask your admin to send a new one.",
    };
  }

  if (error.code === "INVITATION_ALREADY_ACCEPTED") {
    return {
      title: "Invitation Already Accepted",
      description: "This invitation has already been used.",
    };
  }

  return {
    title: "Invitation Unavailable",
    description: error.message || "We could not load this invitation.",
  };
}
