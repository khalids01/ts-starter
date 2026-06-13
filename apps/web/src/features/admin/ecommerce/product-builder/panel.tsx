import type { ReactNode } from "react";

export function Panel(props: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-md border p-4">
      <h2 className="text-base font-medium">{props.title}</h2>
      {props.children}
    </section>
  );
}
