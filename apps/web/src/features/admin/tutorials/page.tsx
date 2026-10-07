import { useMemo, useState } from "react";
import { BookOpen, PlayCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSession } from "@/providers/session-provider";
import { availableTutorials, hasPublishedVideo, type Tutorial } from "./registry";
import { YoutubeConnection } from "./youtube-connection";
import { TutorialDialog } from "./tutorial-dialog";

export function AdminTutorialsPage() {
  const { session } = useSession();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<Tutorial | null>(null);
  const available = useMemo(() => availableTutorials(session), [session]);
  const categories = ["All", ...new Set(available.map(item => item.category))];
  const matches = available.filter(item => (category === "All" || item.category === category) && `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-semibold tracking-tight">Guide</h1><p className="mt-1 text-sm text-muted-foreground">Learn one admin task at a time. Find a guide here or use the help button on a page.</p></div>
    {session?.primaryRoleSlug === "platform.owner" && <YoutubeConnection />}
    <div className="max-w-xl space-y-2"><Label htmlFor="tutorial-search">Search tutorials</Label><div className="relative"><Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input id="tutorial-search" className="pl-9" placeholder="Search products, stock, orders…" value={search} onChange={event => setSearch(event.target.value)} /></div></div>
    <div className="flex flex-wrap gap-2" aria-label="Tutorial categories">{categories.map(item => <Button key={item} type="button" size="sm" variant={category === item ? "default" : "outline"} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</Button>)}</div>
    <p className="text-sm text-muted-foreground" aria-live="polite">{matches.length} {matches.length === 1 ? "tutorial" : "tutorials"}</p>
    {matches.length === 0 ? <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">No tutorials match. Try another search or category.</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{matches.map(item => <article key={item.id} className="flex flex-col rounded-lg border bg-card p-5">
      <p className="text-xs font-medium text-muted-foreground">{item.category}</p><h2 className="mt-2 font-semibold">{item.title}</h2><p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      <p className="mt-4 text-xs text-muted-foreground">{hasPublishedVideo(item) ? `Video · ${Math.ceil(item.media!.durationSec / 60)} min` : "Written guide · video coming soon"}</p>
      <Button type="button" variant="outline" className="mt-3 w-fit" onClick={() => setSelected(item)}>{hasPublishedVideo(item) ? <PlayCircle className="size-4" /> : <BookOpen className="size-4" />}{hasPublishedVideo(item) ? "Watch tutorial" : "Read guide"}</Button>
    </article>)}</div>}
    <TutorialDialog open={selected !== null} onOpenChange={open => !open && setSelected(null)} topics={selected ? [selected] : []} />
  </div>;
}
