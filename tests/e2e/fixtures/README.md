# E2E fixtures

Step 8.1 keeps shared identities in `tests/users-config.ts`. Deterministic
catalog, inventory, and checkout fixtures begin only in their approved Step 8
substeps and must import the E2E environment guard before any write.
