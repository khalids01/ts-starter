# Taste

## Workflow
- When resuming unfinished work (e.g. handed off mid-task from another agent), do a read-only assessment first: read the progress doc, review the staged changes (`git diff --cached`), then report what's done, what's incomplete, and whether the step can be completed — before making any code changes. Confidence: 0.9
- Signals work-in-progress through git staging: stages partial changes and expects them reviewed via `git diff --cached` rather than relying on chat summaries. Confidence: 0.8
- Drives multi-step features from progress docs (e.g. `docs/ecommerce-todo-progress-v2.md`); check work against the doc's steps and acceptance criteria. Confidence: 0.7
- Follows a command-ownership agreement: the agent may run codegen (e.g. `prisma generate`) and checks (typecheck, focused tests, builds), but DB migrations are fully off-limits — the user explicitly instructed "don't run db migration or create sql", so never run `prisma migrate` and never even create the migration SQL files; the user creates and applies them (RBAC seed runs likewise reserved for the user). Confidence: 0.9

## Communication
- Wants direct, structured verdicts: a clear yes/no on feasibility plus explicit "done" vs "incomplete" breakdowns before proceeding. Confidence: 0.8
