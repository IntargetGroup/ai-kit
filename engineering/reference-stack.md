# Reference stack

**Checked: 2026-11-05.** This page records choices and the reasons for them. Version numbers belong to the project that installs them: run `npm view <pkg> version` at install time and pin the current release. A major version appears below only when the choice depends on it. Node status: [Node.js release schedule](https://github.com/nodejs/Release/blob/main/schedule.json).

This is the default for new TypeScript web and AI products. It is not a mandate. When you deviate for a reason, write an ADR ([repo-harness.md](repo-harness.md#decisions)).

## Runtime and framework

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js, Active LTS | 26 for new work (LTS since 2026-10-28). Move existing services off 24 before its end of life (2028-04-30). Pin local and CI to the same LTS major. |
| Package manager | pnpm | In current pnpm, `minimumReleaseAge` defaults to 1440 minutes: a version must be a day old before pnpm installs it. Keep that supply-chain guard on. |
| Framework | Next.js, App Router | `middleware.ts` is deprecated and renamed to `proxy.ts` since 16.0 (codemod: `npx @next/codemod@canary middleware-to-proxy .`). Proxy defaults to the Node.js runtime ([docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)). |
| UI runtime | React | The React Compiler is **opt-in**: install `babel-plugin-react-compiler` and set `reactCompiler: true` in `next.config.ts` (stable top-level option since Next.js 16.0, [docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler)). |

## Language and quality

| Layer | Choice | Notes |
|---|---|---|
| Language | TypeScript, `strict` | TypeScript 7 is the native (Go) port, released 2026-06-18; 6.0 is the last JavaScript-based line ([blog](https://devblogs.microsoft.com/typescript/)). Before you move a repo to 7, check that your lint, test and framework tooling supports it. Stay on 6.0 until it does. |
| Lint | ESLint 10+, flat config | **ESLint 9 reached end of life on 2026-08-06** ([endoflife.date](https://endoflife.date/eslint)). Migrate. `eslint-config-next` tracks the Next.js version. |
| Validation | Zod | Parse untrusted input once at each boundary; derive static types from the same schema (`z.infer`). |
| Validation, hot paths | ArkType | When parse speed matters. Same rule: one schema, types derived from it. |
| Tests | Vitest | Requires Node `^22.12`, `^24` or `>=26`. Static-markup tests do not prove interaction; test interaction in a real browser (Playwright). |
| CI | GitHub Actions | Run typecheck, lint, tests and the docs/agent-context checks on every PR. |

## UI

| Layer | Choice | Notes |
|---|---|---|
| Styling | Tailwind CSS 4 | CSS-first configuration (`@import "tailwindcss"`, `@theme`); no `tailwind.config.js` for new projects. |
| Primitives | Radix + shadcn/ui, or React Aria Components | Own the components in the repo; brand them. React Aria when accessibility behaviour is the hard part. |
| Motion | Motion | Package `motion`, import from `motion/react` ([docs](https://motion.dev/docs/react)). Animate on interaction; avoid continuously repainting animations. |
| Icons | lucide-react | |

## State and forms

| Layer | Choice | Notes |
|---|---|---|
| Server state | TanStack Query | The one cache for server data. |
| Transient UI state | Zustand | Only UI state that is not server truth. Never hold the same truth in both stores. |
| Forms | react-hook-form + `@hookform/resolvers` | Standard Schema resolvers take Zod or ArkType schemas directly. |
| Tables | TanStack Table | Version 9 changed the API. Coming from 8, read the migration notes first. |

## AI layer

| Layer | Choice | Notes |
|---|---|---|
| Model SDK | Vercel AI SDK (`ai`) 7 | Provider-agnostic. Node 22+ and ESM only. v7 renamed core options; the names and the loop pattern are in [tool-orchestration.md §5](tool-orchestration.md#5-vercel-ai-sdk-v7), the full list in the [migration guide](https://ai-sdk.dev/docs/migration-guides/migration-guide-7-0). Migrate deprecated aliases (`system`, `onFinish`, `needsApproval`) while the diff is small. |
| Providers | `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google` | One provider package per vendor. |
| UI hooks | `@ai-sdk/react` | `useChat` over typed message parts. |
| MCP client | `@ai-sdk/mcp` | `createMCPClient` with HTTP transport for remote servers; close the client when done. |
| Telemetry | `@ai-sdk/otel` | OpenTelemetry moved out of core in v7. |

Set `stopWhen` explicitly on every agent loop. Do not rely on a default.

Model choice: keep model ids in one config module, never scattered string literals. Pick per task from current provider docs; ids age faster than this file. Loop and tool design: [tool-orchestration.md](tool-orchestration.md).

### Which agent SDK

| SDK | Pick it for |
|---|---|
| Vercel AI SDK | web apps, streaming UIs, provider-agnostic products; the default |
| Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) | long-running agents built on Claude Code's harness: tools, permissions, hooks, subagents |
| Google ADK | products that live in the Google Cloud ecosystem |

## Data

| Layer | Choice | Notes |
|---|---|---|
| Database | Supabase Postgres | Postgres plus Auth, Storage, Realtime. |
| Client | `@supabase/supabase-js`, `@supabase/ssr` | `@supabase/server` ("server-side utilities for Supabase") is worth evaluating for new server code; no urgency. |
| ORM | Drizzle | Keep the ORM inside repository modules. Domain code never imports it. |
| Migrations | hand-authored SQL, committed | Write and review every migration. Never let the ORM generate and forget. Every schema change goes through a migration. |

**Row Level Security.** RLS is the authorization layer for every request that reaches Postgres through the Data API with a user token. Enable RLS on every table in an exposed schema: "A table in an exposed schema without RLS is readable and writable by any role with a grant on it" ([Supabase docs](https://supabase.com/docs/guides/database/postgres/row-level-security)). A secret key (or the legacy `service_role` key) bypasses RLS when the request carries no user token, and direct Postgres connections run as whatever role they log in as. Server code on those paths must enforce authorization itself. Decide per app which path carries authorization, write it in an ADR, and test both the allowed and the denied case.

## Background work

| Layer | Choice | Notes |
|---|---|---|
| Durable workflows | Inngest | Slow or retriable work runs as durable, event-driven functions with retries and a per-tenant concurrency key. Use the repo's existing runner if it has one. |

## Auth

Use a managed provider (Supabase Auth, Clerk) or Better Auth when you self-host. Check authorization in every route handler and Server Function, not only in `proxy.ts`: a matcher change can silently remove proxy coverage ([Next.js docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#execution-order)).

## Hosting and observability

| Layer | Choice | Notes |
|---|---|---|
| Web | Vercel | Preview deployment per PR. |
| Long-running services | Google Cloud Run | For work that does not fit a serverless function. Name one deployment target per repo. |
| Telemetry | OpenTelemetry | `@vercel/otel` for Next.js; register it only for the runtimes that support it. Structured logs with a request id; never log secrets or prompts with personal data. |

To refresh this file, have Claude read the release notes of each choice above and update the notes and the date in one PR. Change a choice only with an ADR.
