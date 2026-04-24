import { client } from "@/lib/client";

export async function getOwnerSetupStatus() {
  const { data, error } = await client.owner["setup-status"].get();

  if (error) {
    throw new Error(
      String((error.value as any)?.error ?? "Failed to check owner status"),
    );
  }

  return data;
}
