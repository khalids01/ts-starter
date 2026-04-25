export function VisitorsHeader() {
  return (
    <header className="flex min-w-0 flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Visitors</h1>
        <p className="text-sm text-muted-foreground">
          Live traffic quality, visitor behavior, and attribution context.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Admin routes are excluded from tracking.
        </p>
      </div>
    </header>
  );
}
