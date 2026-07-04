import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { brandConfig } from "@config";

export function Logo(props: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", props.className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-emerald-600 text-sm font-bold text-white">
        {brandConfig.textLogo.slice(0, 1)}
      </span>
      <span
        className={cn(
          "truncate text-lg font-semibold",
          props.compact ? "text-base" : "",
        )}
      >
        {brandConfig.textLogo}
      </span>
    </Link>
  );
}

export default Logo;
