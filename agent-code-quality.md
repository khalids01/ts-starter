# Agent Code Quality Guidelines

Write simple, modular code like a senior engineer. Prefer clear feature boundaries, typed interfaces, and small files with one main responsibility. Do not put an entire feature into one file or one catch-all directory.

## General Rules

- Separate code by feature and responsibility.
- Keep page, route, controller, and entry files thin. They should compose feature code, not contain all implementation details.
- Use TypeScript types and interfaces for data shapes, component props, API responses, and service inputs.
- Avoid unrelated refactors while implementing a feature.
- Put only secrets and environment-specific values in `.env`.
- Put non-secret defaults, labels, feature constants, and shared values in config or constants files such as `config.ts`, `constants.ts`, or feature-specific constants.
- Use existing project patterns before introducing a new abstraction, dependency, or folder convention.

## API And Data Access

- For internal frontend-to-backend API calls in this monorepo, use the existing fully typed Treaty/Eden client when available.
- For external APIs, create a dedicated `api.ts`, `client.ts`, or provider-specific client file with a reusable configured instance.
- Do not choose `fetch`, `axios`, or another client library on your own for a new external integration. Ask the user if the project does not already have a clear standard.
- Keep API route constants in an `endpoints.ts` file when routes are reused or composed in multiple places.
- Keep TanStack Query keys in `query-keys.ts` when query caching is used.
- In React or TanStack Start apps, use TanStack Query for server-state fetching, caching, invalidation, and mutations.
- Keep local UI state separate from server state.

## Frontend

- Page files should only assemble feature components and route/page-level data wiring.
- Put feature-specific components, helpers, hooks, stores, and API wrappers inside `features/<feature-name>/`.
- Split large features into files by responsibility, for example:
  - `api.ts`
  - `types.ts`
  - `utils.ts`
  - `components.tsx` or smaller component files
  - feature-specific stores or hooks
- If a component, hook, or helper is reused by multiple features, move it to a shared location.
- Put very common app-level components in `components/core`.
- Put base UI primitives such as buttons, inputs, selects, dialogs, and shadcn-style wrappers in `components/ui`.
- Do not build large page sections inline. For example, a home page with header, hero, features, categories, testimonials, and footer should import those pieces from feature/shared components.
- Use Zustand for client-side state management when local state must be shared across components.
- Use `zustand/persist` for localStorage-backed state.
- Use `universal-cookie` for cookie handling. Wrap cookie access in helper functions and hooks, and make helpers usable in both client and TanStack Start server contexts when possible.

## Backend

- Organize backend code by feature under `modules/<feature-name>/`.
- Each feature module should separate responsibilities clearly:
  - `feature.controller.ts` for routes and HTTP concerns
  - `feature.service.ts` for business logic
  - `feature.dto.ts` for request/response validation DTOs
  - `feature.types.ts` or `types.d.ts` for feature-only types when needed
- In Elysia, define DTOs with TypeBox via:

```ts
import { t } from "elysia";
```

- Keep route definitions in controllers. Controllers should validate input, call services, and map errors/status codes.
- Keep database and business rules in services, not controllers.
- Use Prisma for database access through the existing database package/client.
- Do not create ad hoc database connections inside feature code.
- For new features, always consider authentication, authorization, and RBAC.
- If a feature needs new permissions, add them to the RBAC seed/config flow.
- Be explicit about public vs protected resources.
- Use caching where it is clearly beneficial and fits existing project patterns.

## Security And Configuration

- Never commit secrets.
- Do not put business constants in `.env` unless they truly vary by environment.
- Validate all public inputs with DTOs.
- Treat public endpoints, admin endpoints, and customer-owned resources differently.
- Avoid exposing internal/admin-only fields through public APIs.

## Testing

- Add focused backend unit tests for service behavior, validation-sensitive paths, and authorization/RBAC-sensitive logic.
- Add controller tests for public/protected route access and response shape when routes change.
- For frontend changes, run type checks and build checks.
- For UI behavior, smoke test the actual route and important interactions when practical.
- Tests should cover regressions introduced by the change, not unrelated behavior.
