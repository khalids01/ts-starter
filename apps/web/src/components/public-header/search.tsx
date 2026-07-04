import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Search(props: { className?: string; onSubmitDone?: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState<string | undefined>()
  const submit = () => {
    void navigate({
      to: "/shop",
      search: !!q && q.trim()?.length > 2 ? { search:q } : {},
    });
    props.onSubmitDone?.();
  };

  return (
    <form
      className={cn("flex w-full items-center gap-2", props.className)}
    >
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input onChange={(e)=>setQ(e.currentTarget.value)} placeholder="Search products" className="pl-9" />
      </div>
      <Button onClick={submit} type="submit" size="icon">
        <SearchIcon className="size-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
}
