import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/providers/session-provider";
import { tutorialsForPage } from "./registry";
import { TutorialDialog } from "./tutorial-dialog";

export function PageTutorialButton() {
  const { pathname } = useLocation();
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const topics = tutorialsForPage(pathname, session);
  if (topics.length === 0) return null;
  return <div className="mb-2 flex justify-end" data-tutorial-control>
    <Button type="button" variant="ghost" size="icon-sm" title="Tutorials for this page" aria-label="Open tutorials for this page" onClick={() => setOpen(true)}><CircleHelp className="size-4" /></Button>
    <TutorialDialog key={pathname} open={open} onOpenChange={setOpen} topics={topics} />
  </div>;
}
