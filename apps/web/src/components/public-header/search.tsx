import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Search(props: {
  className?: string;
  onSubmitDone?: () => void;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState<string | undefined>();
  const submit = () => {
    void navigate({
      to: "/shop",
      search: q?.trim() ? { search: q.trim() } : {},
    });
    props.onSubmitDone?.();
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      role="search"
      className={cn("flex w-full items-center gap-2", props.className)}
    >
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search products"
          type="search"
          onChange={(e) => setQ(e.currentTarget.value)}
          placeholder="Search products"
          className="h-11 rounded-full bg-muted/40 pl-9"
        />
      </div>
      <Button
        type="submit"
        size="icon"
        className="size-11 shrink-0 rounded-full"
      >
        <SearchIcon className="size-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
}
