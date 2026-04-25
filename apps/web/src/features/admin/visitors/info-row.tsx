import type { ReactNode } from "react";

export function InfoRow(props: {
  label: string;
  value: string | ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{props.label}</p>
      <p className={`truncate ${props.mono ? "font-mono text-xs" : ""}`}>{props.value}</p>
    </div>
  );
}
