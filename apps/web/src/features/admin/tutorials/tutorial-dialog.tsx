import { useState } from "react";
import { BookOpen, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { hasPublishedVideo, type Tutorial } from "./registry";
import { TutorialVideo } from "./tutorial-video";
import { TutorialFlow } from "./tutorial-flow";

export function TutorialDialog({ open, onOpenChange, topics }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topics: Tutorial[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tutorial = topics.find(topic => topic.id === selectedId) ?? (topics.length === 1 ? topics[0] : undefined);
  return (
    <Dialog open={open} onOpenChange={value => { if (!value) setSelectedId(null); onOpenChange(value); }}>
      <DialogContent className="max-h-[90dvh] overflow-x-hidden overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="pr-8 text-lg">{tutorial?.title ?? "Tutorials for this page"}</DialogTitle>
          <DialogDescription>{tutorial ? "Follow the guide at your own pace." : "Choose the task you want to learn."}</DialogDescription>
        </DialogHeader>
        {open && (tutorial ? (
          <>
            {topics.length > 1 && <Button type="button" variant="ghost" className="w-fit" onClick={() => setSelectedId(null)}>Back to topics</Button>}
            <TutorialContent key={tutorial.id} tutorial={tutorial} />
          </>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {topics.map(topic => <button key={topic.id} type="button" onClick={() => setSelectedId(topic.id)} className="rounded-lg border p-4 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
              <div className="flex items-start gap-3">{hasPublishedVideo(topic) ? <PlayCircle className="mt-0.5 size-5 shrink-0" /> : <BookOpen className="mt-0.5 size-5 shrink-0" />}<div><p className="font-medium">{topic.title}</p><p className="mt-1 text-xs text-muted-foreground">{hasPublishedVideo(topic) ? "Video and guide" : "Guide · video coming soon"}</p></div></div>
            </button>)}
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}
function TutorialContent({ tutorial }: { tutorial: Tutorial }) {
  const published = hasPublishedVideo(tutorial);
  return <div className="space-y-6">
    {published && tutorial.media && <TutorialVideo media={tutorial.media} title={tutorial.title} />}
    {tutorial.diagram && <TutorialFlow diagram={tutorial.diagram} />}
    <section><h2 className="font-medium">Before you start</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{tutorial.prerequisites.map(item => <li key={item}>{item}</li>)}</ul></section>
    <section><h2 className="font-medium">Step by step</h2><ol className="mt-3 list-decimal space-y-4 pl-5 text-sm leading-relaxed">{(tutorial.instructions ?? tutorial.steps).map((step, index) => <li key={index} className="pl-1">{step}</li>)}</ol></section>
  </div>;
}
