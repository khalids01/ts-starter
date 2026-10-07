import { useEffect, useState } from "react";
import { env } from "@env/public";
import { Button } from "@/components/ui/button";

type Status = { enabled: boolean; connection: null | { channelId: string; channelTitle: string; connectedAt: string } };
async function request<T>(route: string, method = "GET"): Promise<T> {
  const response = await fetch(new URL(`/integrations/youtube/${route}`, env.VITE_SERVER_URL), { method, credentials: "include" });
  if (!response.ok) throw new Error("Could not complete the YouTube request. Check the server configuration and try again.");
  return response.json() as Promise<T>;
}
export function YoutubeConnection() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    request<Status>("status").then(value => { if (active) setStatus(value); }).catch(() => { if (active) setError("Could not load YouTube connection."); });
    if (new URLSearchParams(window.location.search).get("youtube") === "error") setError("Google authorization was cancelled or failed. Check the selected channel, consent permissions, and redirect URI, then try again.");
    return () => { active = false; };
  }, []);
  async function act(connect: boolean) {
    setBusy(true); setError("");
    try {
      if (connect) {
        const result = await request<{ authorizationUrl: string }>("connect", "POST");
        const url = new URL(result.authorizationUrl);
        if (url.origin !== "https://accounts.google.com") throw new Error("Unexpected authorization destination");
        window.location.assign(url.href);
      } else {
        await request("disconnect", "POST");
        setStatus(await request<Status>("status"));
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "YouTube request failed."); }
    finally { setBusy(false); }
  }
  return <section className="space-y-3 rounded-lg border p-5" aria-label="YouTube connection">
    <h2 className="font-semibold">Tutorial video channel</h2>
    <p className="text-sm text-muted-foreground">{status?.connection ? `Connected to ${status.connection.channelTitle} (${status.connection.channelId}).` : "Connect the YouTube channel that will host your tutorial videos."}</p>
    {status && !status.enabled && <p className="text-sm text-muted-foreground">YouTube integration is disabled on this server.</p>}
    <Button variant="outline" disabled={busy || !status?.enabled} onClick={() => void act(!status?.connection)}>{busy ? "Please wait…" : status?.connection ? "Disconnect channel" : "Connect YouTube"}</Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}
