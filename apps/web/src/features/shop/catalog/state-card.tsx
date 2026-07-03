import type { ReactNode } from "react";

export function StateCard(props: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}
