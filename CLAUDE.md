# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The React + TypeScript frontend for a todo app. It talks to the NestJS + Prisma backend in the sibling `../backend` directory; `docs/openapi.yaml` is the contract, though it lags the implementation — see "API quirks" below.

All components are functional with hooks. This was previously a class-component teaching exercise; the `// TASK:` markers, the `.exercise.test.ts` files, and localStorage-only persistence are gone.

## Commands

```bash
npm run dev          # Vite dev server on :5173 (the origin the backend's CORS allows)
npm run build        # production build to dist/ (no typecheck — Vite only transpiles)
npm run preview      # serve the built dist/
npm test             # vitest run (single pass)
npm run test:watch   # vitest watch
npx vitest run src/hooks/useLocalStorage.test.ts   # single file
npx vitest run -t 'reads the stored value'         # single test by name
npx tsc --noEmit                                   # the only typecheck; NOT part of build
```

Running the backend (required for anything past the login screen):

```bash
cd ../backend && npm run start:dev     # :3000, needs the Postgres in its .env
```

The dev server must be on **port 5173** — the backend's CORS allowlist names that exact origin, and Vite silently falls back to 5174 if it is occupied, which breaks auth with opaque CORS errors. `VITE_API_URL` overrides the API origin (default `https://todo-app-backend-app.up.railway.app`).

## Layout

```
src/services/          all API + store code
  baseApi.ts           fetchBaseQuery + refresh-on-401 + getErrorMessage
  store.ts             configureStore, typed useAppDispatch/useAppSelector
  api/<module>/        <module>.api.ts (injectEndpoints) + <module>.types.ts
  slices/              auth.slice.ts
src/components/        presentational; ui/ holds shared primitives
src/features/auth/     AuthForm + useAuth/useSessionBootstrap
src/routes/            pages, guards, router
```

`@/` is aliased to `src/` (in both `vite.config.js` and `tsconfig.json`). Use it for cross-directory imports.

Endpoint modules register themselves on `baseApi` via `injectEndpoints`, so they must be imported for their side effect — `store.ts` does this explicitly. **A new `*.api.ts` file will silently 404 until it is imported there.**

## State

RTK Query owns all server data; React state owns UI-local concerns. There is no separate client cache of todos — don't add one.

- `baseApi.ts` retries once on 401 after `POST /auth/refresh`, guarded by an `isRefreshing` mutex so parallel 401s trigger a single refresh.
- `auth.slice.ts` holds `accessToken` **in memory only**. Never persist it; the session is restored from the httpOnly `refreshToken` cookie.
- `useSessionBootstrap()` (in `RootLayout`) calls `refreshSession()` directly *before* touching a protected route. Calling `/auth/me` first also works — the 401 recovers — but it logs a failed request on every page load, so the token is obtained up front. `isBootstrapping` gates the guards, or a reload flashes the login page.

### The `query` object is load-bearing

`TodosPage` memoizes a `TodoQuery` and passes it to `useGetTodosQuery` **and** to every mutation. It is the RTK Query cache key, so the optimistic `updateQueryData` patches only hit the right entry when the mutation receives the identical object. Adding a query parameter means updating the `useMemo` and the mutation arguments together.

### One request per interaction

The list is fetched **once** per state change. An earlier version issued extra `limit=1` count-only requests to make the footer counter collection-wide; that tripled the request count and was removed. Consequences to preserve:

- On the **Active** view, `meta.total` *is* the number of active tasks across all pages, so the footer shows an exact figure.
- On other views the server sends no per-status breakdown, so the count describes the loaded rows and the label says "on this page".

Do not reintroduce per-status count requests to make that label go away — an accurate cheap count beats an exact expensive one here. If the backend ever returns counts in `meta`, use those instead.

`toggleTodo` invalidates `{type:'Todo', id:'LIST'}` on purpose: the optimistic patch keeps the checkbox instant, while the invalidation moves the row out of a filtered view. `logout` deliberately does **not** invalidate — that would refetch `/todos` while signed out; `useAuth().logout()` calls `resetApiState()` instead.

## API quirks the code works around

Backend behaviors, not bugs to "fix" in the frontend:

- **Delete uses `/delete` suffixes**: `DELETE /todos/{id}/delete`. Plain `DELETE /todos/{id}` is unrouted and 404s.
- **`PATCH /todos/{id}` cannot change `completed`** — only `title`/`priority`. Completion goes through `PATCH /todos/{id}/toggle`.
- **An empty PATCH body 400s** ("No fields to update"), so `useTodoEdit` sends only changed fields.
- **`DELETE /todos/delete/completed` is double-wrapped**: the count is at `data.data.count`.
- **Duplicate titles 409** per user.
- **Validation errors return `message` as an array**, single errors as a string. `getErrorMessage()` normalizes both.
- **A todo owned by another user returns 404, not 403.**
- **`?status=active|completed|all`** filters by completion. This is newer than `docs/openapi.yaml`, which still describes completion filtering as client-side — the spec is stale here.

## UI conventions

Plain CSS, BEM class names, and the custom properties in `src/index.css` (`--color-primary`, `--radius`, `--shadow`, `--color-priority-*`). No CSS framework, no CSS modules; all component styles live in `src/App.css`.

Icons come from **lucide-react** — no text glyphs (`✕`, `▲`, `↑`) in JSX.

Two loading conventions matter, both fixing a jarring earlier version:

- **Skeletons only on first load** (`isLoading && !data`). A background refetch keeps rows mounted and only dims the list (`.todo-list--refreshing`), so it never collapses and re-expands.
- **Row-level spinners for toggle/edit** via `pendingIds`. Delete has none by design: it removes the row optimistically, so the row unmounts immediately — the removal *is* the feedback.

Row action icons (pencil/X) stay visible at rest at `opacity: 0.65`, brightening on hover. Do not make them hover-only: that is undiscoverable and invisible on touch.

Two different controls are labelled "All" (priority filter, status filter). They are disambiguated with `aria-label="All priorities"` and `role="group"` wrappers — keep that when touching either.

## Tests

Only `src/hooks/useLocalStorage.test.ts` remains (5 tests); it now stores the sort preference. The old `useTodos`/`useTodoEdit` suites tested localStorage logic that no longer exists.

Vitest config lives in `vite.config.js` (`happy-dom`, `globals: true`, setup at `src/test/setup.ts`). There are no component or integration tests in-repo — verifying a change end-to-end means running both servers and driving a browser.

## Deployment

`vercel.json` rewrites all paths to `/index.html`, which the client-side router now genuinely needs.
