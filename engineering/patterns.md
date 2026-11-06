# Production patterns

Patterns that earned their place in shipped AI and web products. Each one is here because skipping it caused a specific, recurring failure. Lift them into a new build as defaults. The index pairs each anti-pattern with its **tell**, the cheapest sign that you are already in it. Each entry gives the pattern, why it pays off, a sketch, and when to skip it.

Sketches are pseudo-code or TypeScript against the [reference stack](reference-stack.md); map them onto your own libraries. Agent-loop and tool design live in [tool-orchestration.md](tool-orchestration.md); this page covers the code around them. Patterns 16–24 activate when real users arrive; 25–29 map what changes on the way from MVP to enterprise.

## Anti-pattern index

| Anti-pattern | Tell | Fix |
|---|---|---|
| ORM calls scattered across the codebase | an ORM or table import in a route handler, component or job | [1](#1-repository-boundary) |
| Validation sprinkled through business logic | the same field checked in three places, or not at all on one path | [2](#2-boundary-parsing) |
| Types, validators and model output formats authored separately | a field added to the type but not to the validator or the model's schema | [3](#3-one-schema-many-projections) |
| ORM-generated, unread migrations | a "drop column" in a diff that was meant to be a rename | [4](#4-hand-authored-migrations) |
| Check-then-act approval in application code | a double-click or a retry executes an action twice | [5](#5-human-approval-in-one-transaction) |
| Two caches for the same server data | code that keeps two copies of a record in sync | [6](#6-one-server-state-cache) |
| Lifecycles as boolean flags | `isRunning && !isDone && hasError` | [7](#7-lifecycles-as-explicit-state-machines) |
| Slow work in the request path; agent as a bare `while` loop | nobody can say what the agent already tried or why it stopped | [8](#8-durable-background-work) |
| Vendor SDK calls everywhere, no record of what the model saw | a bad output you cannot reproduce | [9](#9-provider-wrapper-with-an-io-ledger) |
| Every tool and every result loaded into context | context grows every turn regardless of the task | [10](#10-retrieve-dont-load) |
| Authorization in one layer only | one matcher change or one service-role query exposes data | [11](#11-layered-authorization) |
| Instrumentation that assumes one runtime | an edge build breaks after adding tracing | [12](#12-runtime-aware-telemetry) |
| Docs and agent instructions nobody checks | the spec and the code disagree, and an agent follows the spec | [13](#13-knowledge-layer-checked-in-ci) |
| An LLM judge score reported as fact | a metric in a decision with no human-labelled baseline | [14](#14-calibrated-judges) |
| Shipping on an end-of-life runtime or major | an EOL date in the past and no migration plan | [15](#15-upgrade-before-end-of-life) |
| Writes that leave no record of who changed what | an incident review that ends with "nobody knows who changed this row" | [16](#16-one-audit-log-for-every-write) |
| Uncorrelated logs per layer | an incident rebuilt by matching timestamps across log streams | [17](#17-one-request-id-end-to-end) |
| Errors swallowed or reported as success | `catch { return { ok: true } }`, or a 200 for a failed operation | [18](#18-fail-closed-with-one-error-taxonomy) |
| Erasure by deleting rows from history | an erasure request that needs a script to rewrite the audit log | [19](#19-erasure-by-tombstone-and-crypto-shred) |
| Secrets read ad hoc from mixed stores | `process.env.X` in domain code, or one environment's secrets in two stores | [20](#20-secrets-one-store-per-environment) |
| Core schema changed for one tenant | a shared column that only one tenant uses | [21](#21-core-schema-tenant-extensions) |
| Deploy scripts for several targets by accident | one script assumes one cloud, the next script another | [22](#22-one-named-deployment-target) |
| A feature merged with "docs later" | a merged feature with no test for its acceptance condition | [23](#23-every-feature-ships-four-artefacts) |
| A wide change made blind | a rename that breaks a caller nobody listed | [24](#24-impact-analysis-before-a-wide-change) |
| MVP shortcuts kept past their stage | an in-memory store behind two replicas | [25](#25-stage-map-and-assumptions-to-challenge) |
| Seams retrofitted under pressure | domain code that imports a driver or vendor SDK, or reads an env var | [26](#26-seams-to-keep-open-from-day-one) |
| Compliance answered from memory | a security questionnaire answered with no link to code | [27](#27-compliance-posture-as-a-living-table) |
| Backups nobody restored | no restore drill in the last quarter | [28](#28-backups-and-restore-drills) |
| Scaling by guess | "add servers" before anyone profiled the slow path | [29](#29-scaling-knobs) |

## Data and boundaries

### 1. Repository boundary

**What.** Every ORM call lives inside a repository module behind an interface. Route handlers, services and jobs depend on the interface. The repository is the only code that knows a table exists.

**Why.** When the ORM leaks, you cannot fake the data layer in a test, swap a slow query for raw SQL, or change the schema without grepping the app. Tenant scoping, caching and tracing get one home instead of one copy per call site.

```ts
export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}
// db/schema.ts holds tables; repositories/*.ts are the only ORM consumers.
export const loadProfile = (users: UserRepository, id: UserId) => users.findById(id);
```

**Skip when** a throwaway script or a one-table prototype has no tests and no second data path. Introduce the interface with the second query against the same table.

### 2. Boundary parsing

**What.** Parse untrusted input once, at the edge, with a schema: HTTP bodies, query parameters, webhooks, tool arguments, third-party responses, and model output. After parsing, data carries a trusted type and is never re-validated.

**Why.** Validation scattered through business logic is incomplete and redundant at once, and the type system cannot tell checked from unchecked paths. A malformed payload should fail at the door with a clear error.

```ts
const Body = z.object({ email: z.email(), age: z.number().int() });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json(z.treeifyError(parsed.error), { status: 400 });
  return Response.json(await register(parsed.data)); // typed and trusted from here on
}
```

The model is an untrusted boundary too. Parse its JSON before you act on it, and treat text it read from the web or a document as data, never as instructions.

**Skip when** the value never crossed a trust boundary: objects your own process built.

### 3. One schema, many projections

**What.** Write one schema per domain shape and derive the rest: the static type, the runtime validator, the structured-output constraint for the model, and explicit projections for each boundary (API response, database row, model input).

**Why.** Separately authored types, validators and output formats drift: the model returns a shape the validator rejects. One schema propagates a change everywhere at once, and "what the model may return" is the same object as "what the code expects".

```ts
const Invoice = z.object({ total: z.number(), currency: z.enum(['EUR', 'USD']) });
type Invoice = z.infer<typeof Invoice>;                                   // static type
Invoice.parse(payload);                                                   // runtime validation
await generateText({ model, prompt, output: Output.object({ schema: Invoice }) }); // model contract
const InvoiceResponse = Invoice.pick({ total: true });                    // boundary projection
```

**Skip when** a shape exists only at compile time and never meets a runtime boundary or a model.

### 4. Hand-authored migrations

**What.** Write every migration as SQL by hand, commit it, and review it like code. The ORM's tooling may suggest a diff; the migration that ships is human-authored. Every schema change goes through a migration.

**Why.** Auto-generated diffs miss intent: a rename looks like drop-plus-add and silently loses data. Unread migrations let the schema in your head, in the history and in the database drift apart.

**Before you apply** a migration that recreates an existing function, view or policy, compare its body with the live definition. A stale local copy silently reverts someone else's fix.

**Make drift visible and reversible.**
- Ship a breaking change as expand, migrate, contract, so old and new code both run during a rolling deploy.
- The health check reports the migration head the code requires. When the database is behind it, the instance reports unhealthy and the platform drains it instead of serving with the wrong schema.
- Each migration PR names its rollback ([spec template](knowledge-management-spec.md#71-spec)). "Re-run with -1" is not a plan.

**Never skip it** for a database other people depend on.

### 5. Human approval in one transaction

**What.** Gate an approved action behind one database function that checks the approval state and performs the write in the same transaction.

**Why.** Check-then-act in application code has a race window: two clicks, a retry or a concurrent worker can execute twice, or execute something just rejected. One transaction makes "approved once, executed once" a property the database enforces.

```sql
create function approve_and_execute(p_action_id uuid) returns void
language plpgsql as $$
begin
  update pending_action
     set status = 'executed', approved_by = app_user_id(), executed_at = now()
   where id = p_action_id
     and status = 'pending'                      -- the guard: only one caller wins
     and app_can_approve(app_user_id(), p_action_id); -- placeholders for your authz
  if not found then
    raise exception 'action % is not pending or not approvable', p_action_id;
  end if;
  insert into ledger (action_id /* , ... */) values (p_action_id /* , ... */); -- gated write
end $$;
```

Derive the approver from the session, never from a parameter. Grant `execute` only to the roles that may call it.

**Skip when** the action is idempotent and reversible, or concurrency is impossible (one operator, one action at a time).

## State and work

### 6. One server-state cache

**What.** One server-state cache (TanStack Query) is the only source of fetched data in the client. One transient store (Zustand) holds UI-only state: open panels, drafts, selection. Server data invalidates through the query cache; UI state never pretends to be server data.

**Why.** The same record in a query cache and in a context provider or fetch wrapper drifts after a mutation. What the user sees then depends on which copy a component read.

**Skip when** the app has no server state worth caching.

### 7. Lifecycles as explicit state machines

**What.** Model a persistent lifecycle (a job, an agent run, an approval, an import) as one `status` column with named states and allowed transitions. Make each transition a guarded update (`where status = $from`).

**Why.** Booleans multiply into impossible combinations (`isRunning` and `isDone` both true) and every reader re-derives the state differently. A discriminated union plus a guarded transition makes illegal states unrepresentable in code and in the database.

```ts
type Run =
  | { status: 'queued' }
  | { status: 'running'; attempt: number; startedAt: Date }
  | { status: 'awaiting_approval'; actionId: ActionId }
  | { status: 'succeeded'; resultId: ResultId }
  | { status: 'failed'; error: string; retryable: boolean };
// UPDATE runs SET status = 'running' ... WHERE id = $1 AND status = 'queued'
```

**Skip when** the object has no lifecycle.

### 8. Durable background work

**What.** Move slow, retriable or fan-out work out of the request path into durable, event-driven functions (the repo's existing runner; Inngest in the reference stack). One function per concern. Concurrency keyed per tenant. Bounded retries. Each step's result recorded, so a crash resumes from the last completed step. An agent loop runs the same way: steps recorded, a real termination condition tied to state, resumable.

**Why.** Inline slow work ties up request capacity, couples user latency to a third party, and is lost if the request dies. A bare `while` loop around a model call repeats failed actions, cannot resume, and stops on a whim.

```ts
// Request path: record intent, emit, return.
await emit('invoice.received', { id: eventId, tenantId, invoiceId });

// Worker (pseudo-code; map onto your runner's API):
on('invoice.received', { concurrency: { key: 'tenantId', limit: 5 }, retries: 3 }, async ({ event, step }) => {
  const parsed = await step.run('parse', () => parseInvoice(event.invoiceId));
  await step.run('book', () => book(parsed, { idempotencyKey: event.id }));
});
```

Every side effect takes an idempotency key, because retries will happen. Keep a ledger of what ran, so a fast path that fails has a repair path.

**Idempotent HTTP writes.** Side-effecting endpoints accept an `Idempotency-Key` header:
- New key: insert `(route, key, body hash)` under a unique constraint *before* the effect runs; store the response when it completes. A duplicate that arrives in flight hits the constraint and gets a conflict, not a second run.
- Seen key, same body hash: return the stored response verbatim. Do not run the effect again.
- Seen key, different body: 409 ([18](#18-fail-closed-with-one-error-taxonomy)). Keys expire after a set window, such as 24 hours.

Name one backing store in an ADR. An in-memory map breaks with the second replica; a database table is the default; a durable workflow engine owns it when the write starts a multi-step workflow with compensations. Never run two side by side.

**Skip when** the work is fast, must finish before the user can proceed, and has no retry value.

## AI layer

### 9. Provider wrapper with an I/O ledger

**What.** Put every model or external provider behind a thin adapter that exposes your interface and records each request and response.

**Why.** Vendor SDKs change shape, providers get swapped, models get retired: the adapter contains the blast radius to one file. The record gives replay (re-run without the live API), audit (what exactly did the model see) and debugging (reproduce a bad output from stored bytes).

```ts
export interface Completion { complete(req: CompletionRequest): Promise<CompletionResult> }

export const vendorCompletion = (ledger: Ledger): Completion => ({
  async complete(req) {
    const raw = await vendor.call(toVendor(req));
    await ledger.put({ provider: 'vendor', request: redact(req), response: redact(raw) });
    return fromVendor(raw); // your shape, not theirs
  },
});
```

Keep the record minimal: redact personal data and secrets before it is written, encrypt what stays sensitive, and set a retention period. Keep model ids in one config module.

**Skip when** the integration is one-off and you will never replay or swap it. Drop the adapter before you drop the record.

### 10. Retrieve, don't load

**What.** Keep large documents and intermediate tool results out of the model's context. Store them, give the model a handle or a summary, and expose a tool that fetches only the part a step needs. Expose fewer, higher-level tools.

**Why.** Everything in context costs tokens on every turn, slows each call, and degrades reasoning and tool selection ([tool-orchestration.md §9.2](tool-orchestration.md#92-more-context-degrades-performance)).

```ts
// The model sees: "docId: 7, sections: [intro, pricing, terms]".
const tools = { getSection: tool({ inputSchema: SectionRef, execute: ({ docId, section }) => store.read(docId, section) }) };
```

Retrieval is authorised (the caller may read it), bounded (a limit on results), and carries provenance (source and date), so the answer can cite it and admit gaps.

**Skip when** the input is small and needed on every turn.

## Security and operations

### 11. Layered authorization

**What.** Enforce access in more than one layer. Datastore isolation (Postgres RLS on every exposed table) keeps tenants apart even when application code is wrong. Business authorization ("a manager approves below their limit, never their own request") lives in application code or reviewed database functions where it can be read and tested. Check identity again in each handler, not only at the edge.

**Why.** Authorization in one place fails open the moment that place is bypassed: a route the proxy matcher misses, a query with a key that bypasses RLS. Rich business rules crammed into row policies become unreadable and untested.

```ts
export async function approve(req: Request, actionId: ActionId) {
  const user = await requireUser(req);          // identity, not just "has a cookie"
  const action = await actions.get(actionId, user.tenantId);
  assertCanApprove(user, action);               // business rule, unit-tested
  // ...
}
```

Decide per app which path carries which rule, record it in an ADR, and test the allowed and the denied case. The Supabase specifics are in [reference-stack.md](reference-stack.md#data).

**Skip when** the endpoint is public, read-only and holds nothing sensitive.

### 12. Runtime-aware telemetry

**What.** Register tracing per runtime, and turn on the spans that explain behaviour: model calls, tool calls, background steps. Correlate logs with a request id. Never log secrets, or prompts that contain personal data.

**Why.** Instrumentation that assumes one runtime breaks builds or inflates cold starts where it does not fit. Next.js calls `register()` in every runtime ([instrumentation guide](https://nextjs.org/docs/app/guides/instrumentation)).

```ts
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') await import('./instrumentation-node'); // OTel SDK + AI SDK telemetry
  if (process.env.NEXT_RUNTIME === 'edge') await import('./instrumentation-edge');
}
```

**Three signals, on by default.** *Traces* wrap every outbound call and business operation; with no exporter configured the tracer is a no-op and never crashes the app. *Metrics* cover request rate and duration by route and status, errors by class ([18](#18-fail-closed-with-one-error-taxonomy)), backlog depth per worker and saturation per pool (database connections, rate-limit buckets). *Logs* are one JSON object per line to stdout, each with `request_id` ([17](#17-one-request-id-end-to-end)), `actor`, `route` and level. Dashboards and alerts live as code in the repo; each alert links its runbook entry.

**Skip when** the code is local and throwaway. The guard costs nothing; keep it.

### 13. Knowledge layer checked in CI

**What.** Specs, decisions (ADRs), `AGENTS.md` and other agent-facing text live in the repo, and CI fails when they rot: links resolve, size budgets hold, required copies stay identical, a contract change ships with its spec.

**Why.** Unchecked documentation rots, and rotten docs mislead people and agents alike. A merge gate makes "the docs match reality" a property, not an intention. Check what is mechanical; leave judgement to review.

**Skip when** there is no second reader, human or agent.

### 14. Calibrated judges

**What.** Treat an LLM judge's output as untrusted model output: parse it into a fixed schema, calibrate it against a human-labelled sample before you trust its trend, report it as an estimate with its error, and keep a person on anything consequential. Use a different model to judge than to generate.

**Why.** A judge has position, verbosity and self-preference biases, drifts between model versions, and can be gamed by the system it grades. A judge score quoted as a hard metric hides all of that ([tool-orchestration.md §9.3](tool-orchestration.md#93-build-your-own-evals)).

**Skip when** the outcome is programmatically checkable. Then check it programmatically.

### 15. Upgrade before end of life

**What.** Track the end-of-life dates of your runtime and tooling majors and migrate before the date, in small steps, on your schedule. [reference-stack.md](reference-stack.md) records the EOL and migration notes for each choice.

**Why.** An EOL major stops receiving security fixes. Waiting turns a routine upgrade into a forced jump across several majors at the worst moment.

**Never skip it** for anything deployed.

## Production readiness

### 16. One audit log for every write

**What.** Every mutation of persistent state (a row, an object-store put, a queue publish) writes one event to one append-only `audit_log`, in the same transaction as the write where the store allows it. Fields: a time-ordered `id` (UUIDv7, ULID); `ts`; `actor` (a user id, `agent:<name>` or `system`); `request_id` ([17](#17-one-request-id-end-to-end)); `tenant_id` ([26](#26-seams-to-keep-open-from-day-one)); `op` (`insert`, `update`, `delete` or a domain verb such as `approve` or `tombstone`); `entity_ref` (`<store>:<primary key>`); a field-level `diff`; the `schema_version` the write used.

**Why.** After an incident, a dispute or an audit, "who changed this, when, and on whose request" needs an answer. The provider ledger ([9](#9-provider-wrapper-with-an-io-ledger)) records what the model saw; the audit log records what the system changed.

```sql
-- The repository sets the context inside the write's transaction; a trigger on each audited table reads it.
select set_config('app.request_id', $1, true), set_config('app.actor', $2, true);
revoke update, delete on audit_log from app_role; -- append-only for the application
```

- A new write path without an audit event is a review blocker. Only an admin or migration role drops old partitions. Retention follows the strictest rule you answer to (law or contract); partition by time and archive cold partitions.
- Erasure keeps the row and shreds the personal data in `diff` ([19](#19-erasure-by-tombstone-and-crypto-shred)). The fact of the action stays; the content goes.

**Skip when** nothing persists, or the store is a cache rebuilt from an audited source.

### 17. One request id end to end

**What.** One `request_id` follows a request through every layer: inbound header, middleware, log context, outbound calls, persistent writes, and every job or agent run it triggers.

- Middleware takes the inbound id or mints a UUIDv7, and echoes it in the response so users quote it in bug reports. The inbound id is untrusted input ([2](#2-boundary-parsing)): accept it only in the expected format.
- Bind it with the runtime's async context (`AsyncLocalStorage` in Node, `contextvars` in Python, `context.Context` in Go), never a global. The logger, provider wrappers and repositories read it from there.
- Provider wrappers send it as a header on outbound calls. Writes put it in `audit_log`, where it is never null. With OpenTelemetry, also log the trace id: the W3C `traceparent` header carries the trace across services. A job or agent run inherits the id of the event that triggered it. A scheduled run mints its own and records it as the root.

**Why.** Without it, an incident is rebuilt by hand, matching timestamps across log streams. With it, one search per layer returns the whole story.

**Never skip it** for a deployed service. It costs one middleware.

### 18. Fail closed with one error taxonomy

**What.** One error type for the whole app, mapped to status codes in one place. Handlers throw it; one error boundary renders `{ error: { code, message, requestId, details? } }`.

```ts
const STATUS = {
  validation: 400, unauthenticated: 401, forbidden: 403, not_found: 404, rate_limited: 429,
  conflict: 409 /* key reuse, unique violation */, domain: 422 /* a business invariant broke */,
  upstream: 502 /* a provider failed */, unavailable: 503 /* circuit open, maintenance */,
} as const;
export class AppError extends Error {
  constructor(readonly code: keyof typeof STATUS, message: string, readonly details?: unknown) { super(message); }
}
```

- No `catch` turns a failure into success; a success status means the business operation succeeded. A broken invariant, a failed validator or a write against a stale schema is a `domain` error, never log-and-continue.
- An unknown error is a 500 with a generic message; the detail goes to the log with the request id, never to the client. Fail closed: when a permission check, a policy lookup or a required setting cannot be evaluated, deny.

**Why.** A swallowed error becomes silent data loss and a support ticket weeks later. One taxonomy gives clients stable codes, metrics an error class to count ([12](#12-runtime-aware-telemetry)), and alerts a key.

**Skip when** the code is a script that can crash loudly.

### 19. Erasure by tombstone and crypto-shred

**What.** Encrypt each subject's personal data with a per-subject data-encryption key (DEK), wrapped by a key-encryption key in a managed key service. To erase a subject, delete the DEK and write a `tombstone` event to the audit log.

**Why.** Privacy law (GDPR Art. 17 and similar regimes) requires erasure on request, but audit logs, event stores and backups must not be rewritten. Without its key, every copy of the ciphertext is unreadable, backups included; rows, foreign keys and the audit trail stay intact. Deleting rows breaks append-only stores and leaves copies in backups. Confirm with whoever owns privacy compliance that this meets your obligations.

- The application or the repository encrypts; the database never sees a DEK in clear. Redact personal data before it reaches logs and the provider ledger, so they hold nothing to erase.
- Model erasure as a state machine ([7](#7-lifecycles-as-explicit-state-machines)), `requested → keys_deleted → projections_rebuilt → confirmed`, with the legal deadline on it (one month under GDPR, extendable in some cases).
- Read models, search indexes, caches and vector stores rebuild without tombstoned subjects or filter them out. List every copy in the compliance table ([27](#27-compliance-posture-as-a-living-table)).

**Skip when** you process no personal data. Write that in the compliance table: explicit beats omitted.

### 20. Secrets: one store per environment

**What.** Local development reads `.env`. Each deployed environment reads from one managed secret store, named in an ADR. Code reads secrets through one config module, parsed once at startup; domain code never touches `process.env`.

```ts
const Env = z.object({ DATABASE_URL: z.url(), PAYMENTS_API_KEY: z.string().min(1) });
export const env = Env.parse(process.env); // one read; a missing required secret stops the boot
```

- Separate values per stage: a development key never reaches production; a production key never reaches a laptop or a preview deployment. Prefer workload identity federation (OIDC) over long-lived keys for CI and service-to-service calls.
- Two stores in one environment (some values in platform variables, some in a vault) is a smell: a rotation misses one copy. Consolidate. The logger, the trace exporter and the prompt builder ([9](#9-provider-wrapper-with-an-io-ledger)) redact before data leaves the process.
- A runbook entry per secret names its owner, rotation cadence and blast radius. Repo hygiene (scanners, `.env.example`, keeping agents away from values, leak response) is in [knowledge-management-spec.md §11](knowledge-management-spec.md#11-local-only-files-l1-and-secrets).

**Never skip it** for anything deployed.

### 21. Core schema, tenant extensions

**What.** When one product serves tenants or verticals with different needs, keep the shared core and each extension in separate, labelled files: `migrations/core/` plus `migrations/ext/<vertical>/`, a core API type plus an extension type. Version the core with semver; a breaking change bumps the major. Never change the core for one tenant: a missing field goes into that tenant's extension, or into the core as a feature every tenant gets.

**Why.** A core column added for one tenant becomes every tenant's migration, policy and API surface. Kept apart, a check diffs the core against each extension and produces a migration plan per tenant.

**Skip when** the product is single-tenant and will stay so. Record that in an ADR; do not build packaging for an audience of one.

### 22. One named deployment target

**What.** Each service commits to one deployment target. Every script, container file, infrastructure module, IAM policy and secrets document is written against it. The runbook and an ADR name it with its regions and data-residency limits, for example "containers on a managed serverless platform, one EU region". Production container files and infrastructure code encode those limits (base image, architecture, region). Least-privilege IAM policies live in the repo as code. The deploy job runs only from protected branches into labelled environments, with a required approval for production.

**Why.** Scripts that assume different clouds wreck deploy day: the one you need under pressure targets the platform you left. Multi-cloud by accident happens first, then breaks.

**Skip when** you need real portability. Then pay for it on purpose in an ADR (for example containers on Kubernetes with one config path), not by drift.

### 23. Every feature ships four artefacts

**What.** A feature PR is complete only with (1) **the definition of done:** a spec for tier 2 work, the plan in the PR description for tier 1 ([ceremony by task size](knowledge-management-spec.md#2-ceremony-by-task-size)); (2) **the plan steps,** ticked; (3) **a test** that proves the acceptance condition, at the lowest layer that can; (4) **the docs it changes:** an ADR for a lasting decision, the runbook for what now runs differently, `.env.example` for a new variable, the compliance table ([27](#27-compliance-posture-as-a-living-table)) for a new control. Reviewers reject a missing artefact; "document later" means never.

**Why.** The artefacts skipped at merge are the ones nobody writes afterwards. An untested feature regresses silently; an unrecorded decision is reversed by the next reader.

**Skip when** the change is trivial (typo, dependency patch, comment). The author says so with a `chore:` or `docs:` type in the title.

### 24. Impact analysis before a wide change

**What.** Before you change a symbol, count its callers. With 0–1, go ahead. With 2 or more, list the call sites (language server, `git grep`, a code graph) and write the risk level in the PR description. For high risk, the plan names the blast radius and the rollback before the first edit. A public API, a migration, a cross-service contract, auth and any persistent write are high risk whatever the caller count.

**Why.** The caller nobody listed breaks in production, and a rollback written during the incident is a guess. The procedure is in [knowledge-management-spec.md §8.2](knowledge-management-spec.md#82-before-editing-a-widely-used-symbol).

**Skip when** the symbol is private with at most one caller.

## Scaling path

The patterns above are cheap at MVP scale and load-bearing at enterprise scale. This part names the hand-offs, so you re-evaluate a shortcut at the boundary, not after the incident.

### 25. Stage map and assumptions to challenge

| Stage | What is true | The next stage needs |
|---|---|---|
| MVP | one tenant, one region, one environment, in-process jobs, test data | separate environments, durable jobs, a managed secret store, a managed database with point-in-time restore |
| First clients (1–3 tenants) | real data, per-tenant config, telemetry on, compliance evidence started | tenant-aware auth, per-tenant quotas, the core/extension split ([21](#21-core-schema-tenant-extensions)) |
| Mid-market (10–30 tenants) | isolation at schema and row level, a durable workflow engine, infrastructure as code | attestations (SOC 2, ISO/IEC 27001), dedicated deployments for the largest tenants |
| Enterprise | enterprise SSO, customer-managed keys, private-network ingress, region of choice | separate read and write paths, sharding, horizontal workers |

Each shortcut below is right at its stage and a liability at the next: replace it before the boundary. Review both tables when the stage changes and when a new kind of tenant signs.

| Assumption | Breaks when | Replace with |
|---|---|---|
| In-memory idempotency or session store | a second replica runs | a shared durable store ([8](#8-durable-background-work)) |
| Synchronous handler | a step crosses about 2 s at p95 | a durable queue, before users feel it |
| Database in one container | you need your first point-in-time restore | a managed database with backups and PITR, before real data lands |
| Tracing is optional | real users report bugs | a real telemetry backend on the first day of onboarding |
| One environment | a tenant arrives with a different compliance posture | dev, staging and prod in separate cloud accounts or projects |
| Shared database, no isolation contract | two tenants need schema forks or isolation guarantees | RLS plus per-tenant keys, or a database per tenant |
| Rate limits are optional | an agent bug floods the backend | per-tenant quotas |
| Background work in process | work runs for minutes or must survive a restart | workers on a durable scheduler |
| OIDC-only sign-in | the first enterprise security review | SAML 2.0, SCIM provisioning, enforced MFA |
| Customer-managed keys are a differentiator | enterprise procurement | customer-managed keys on database, object store and secret store |
| Best-effort backups | a contract names recovery targets | tested targets, such as RTO ≤ 1 h and RPO ≤ 15 min ([28](#28-backups-and-restore-drills)) |
| One API process for reads and writes | read and write load scale differently | separate read-mostly and write paths |

### 26. Seams to keep open from day one

**What.** Build these seams at MVP, each as an interface with one default implementation. A seam is an interface and one file, not a plugin system: build no second implementation until you need it. Record each in an ADR when you add it.

| Seam | Default at MVP | Later |
|---|---|---|
| Tenant context | `tenant_id = 'default'` on every query, audit event and trace | real tenants, RLS keyed on it |
| Job runner ([8](#8-durable-background-work)) | in process | a durable workflow engine or queue |
| Stores ([1](#1-repository-boundary)) | repositories over a local database | managed, replicated or sharded: a config change |
| Secrets ([20](#20-secrets-one-store-per-environment)) | `.env` | a managed store per environment |
| External providers ([9](#9-provider-wrapper-with-an-io-ledger)) | a wrapper that owns retries, redaction and tracing | a new vendor in one file |
| Auth principal | one `Principal` object, even from a single bearer key | OIDC or SAML in the auth layer, no grep-and-replace |
| Feature flags | an env-backed evaluator | a flag service |

**Why.** Adding a tenant id to every table, query and log line after launch is a multi-month migration; the seam costs one file on day one.

**Skip when** the code will not outlive the prototype.

### 27. Compliance posture as a living table

**What.** Once the product touches personal or regulated data, keep one table in the repo (`docs/compliance.md`): one row per framework that may apply. Update it when a control lands or a customer asks. Evidence points at code, migrations, configuration or commits, never at chats or tickets. An N/A row carries a one-line reason: explicit beats omitted.

| Framework | Applies when | Status | Evidence |
|---|---|---|---|
| GDPR | personal data of people in the EU | Partial: erasure by crypto-shred, encryption at rest | `src/privacy/`, migration `0042` |
| EU AI Act | the system is high-risk or has transparency duties (check the current application dates) | Assessment pending | — |
| DORA | EU financial entities, and their ICT suppliers by contract | N/A: no financial-sector customers | — |
| SOC 2, ISO/IEC 27001 | enterprise or regulated customers ask for an attestation | Not started | — |
| HIPAA | US health data | N/A: no health data | — |

**Why.** A questionnaire answered from memory overclaims, and the gap surfaces in the customer's audit. The table turns each questionnaire into a lookup and shows gaps before a customer does.

**Skip when** the product holds no personal or regulated data. One line in the README says so.

### 28. Backups and restore drills

**What.** Ask: "Which single command, run by a person or an agent, loses data we cannot restore?" Block each answer with a hook or a permission rule ([README.md §2](README.md#2-guidance-versus-enforcement)), or make it recoverable. Then:
- Configure backups in infrastructure code, not in a console. Write RTO and RPO in the runbook as numbers that the last drill met.
- Run a scheduled restore drill at least every quarter: restore into a scratch environment, assert the health check and a few key queries.
- Walk through the top three failure modes of this product (for example a provider outage, primary-store corruption, a leaked credential, a region outage) and write the response to each.

**Why.** A backup nobody restored is a hypothesis. A drill finds the missing permission, the expired key or the nine-hour restore before an incident does.

**Skip when** the data can be recreated from its sources at no cost.

### 29. Scaling knobs

**What.** Keep a table in the runbook: for each symptom, the knobs in order from cheapest to most invasive. Specialise this starter to your real stores and providers:

| Symptom | First knob | Second knob | Third knob |
|---|---|---|---|
| Hot-path p95 latency rises | query plan and index (profile first) | read replica or cache | read model or materialised view |
| Model or provider cost overruns | hit rate of the existing cache | a cheaper model tier for low-stakes paths | a response cache |
| Async backlog grows | worker concurrency | batch size and chunking | a durable queue with backpressure |
| A noisy tenant slows others | per-tenant quota | a dedicated connection pool | dedicated infrastructure per tier |
| Primary store under memory or CPU pressure | configuration (pool, workers, memory) | scale up | shard or archive cold data |
| Agent-loop cost grows | calls inside the prompt-cache lifetime | batch into scheduled runs | a scheduled job instead of a loop |

**Why.** Under pressure, people turn the first knob they think of, usually "more servers". The table makes "profile first, cheapest knob next" the default.

**Never skip it** past launch. Write the first version before it.
