import { createFileRoute, redirect } from "@tanstack/react-router";
import { OwnerSetup } from "@/features/admin/owner/owner-setup";
import { client } from "@/lib/client";

export const Route = createFileRoute("/setup")({
  beforeLoad: async () => {
    const { data } = await client.owner["setup-status"].get();
    // If owner already exists, don't allow access to setup page
    if (!data || data?.hasOwner) {
      throw redirect({ to: "/" });
    }
  },
  component: SetupPage,
});

function SetupPage() {
  return (
    <div className="min-h-screen bg-background">
      <OwnerSetup />
    </div>
  );
}
