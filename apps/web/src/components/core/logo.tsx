import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { brandConfig } from "@config";

export function Logo(props: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", props.className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-emerald-600 text-sm font-bold text-white">
        {brandConfig.logoUrl ? (
          <img
            src={brandConfig.logoUrl}
            alt=""
            className="size-9 object-contain"
          />
        ) : (
          <img src={brandConfig.iconUrl} alt="" className="size-9" />
        )}
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
