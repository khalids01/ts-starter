import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { TutorialMedia } from "../../../../../../tutorial/shared/content";
import { isValidTutorialMedia } from "../../../../../../tutorial/shared/content";

export function TutorialVideo({ media, title }: { media: TutorialMedia; title: string }) {
  const [failed, setFailed] = useState(false);
  if (!isValidTutorialMedia(media)) return null;
  if (media.provider === "youtube") {
    const watchUrl = `https://www.youtube.com/watch?v=${media.videoId}`;
    return <section className="space-y-2" aria-label="Tutorial video">
      {!failed && <iframe
        className="aspect-video min-h-[200px] w-full rounded-xl border-0 bg-black"
        src={`https://www.youtube-nocookie.com/embed/${media.videoId}?playsinline=1&rel=0`}
        title={`${title} — video`} width="800" height="450" loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen onError={() => setFailed(true)}
      />}
      {failed && <p role="status" className="text-sm text-muted-foreground">The embedded player could not load. Watch on YouTube or follow the guide below.</p>}
      <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">Watch on YouTube<ExternalLink className="size-3.5" aria-hidden="true" /></a>
    </section>;
  }
  return <section aria-label="Tutorial video">{failed ? <p role="status" className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">The video could not load. You can still follow the guide below.</p> : <video className="aspect-[8/5] w-full rounded-xl bg-black" controls playsInline preload="none" crossOrigin="anonymous" poster={media.posterUrl} onError={() => setFailed(true)} aria-label={title}>
    <source src={media.videoUrl} type="video/mp4" />
    <track kind="captions" src={media.captionsUrl} srcLang="en" label="English" default />
    Your browser does not support video playback. Read the guide below.
  </video>}</section>;
}
