# repo-bot: A Consolidated Architecture Synthesis

**What this document is.** A single, self-contained synthesis of the `repo-bot` studio control plane and its surrounding pipeline, distilled from a long series of design documents and review rounds. It keeps what is valuable and true, records the corrections that were forced along the way, and states plainly what is still unbuilt, unverified, or overclaimed.

**How to read it.** Every section separates three things that the source material repeatedly blurred:

- **Designed**: the mechanism is specified and reasoned about.
- **Implemented**: code exists and has run.
- **Measured**: a number came from an observation on your own system.

Almost everything below is *designed*. Very little is *implemented*, and nothing is *measured*. Where a number appears (a threshold, a duration, a cost), treat it as a **starting value pending calibration on your own data**, not as a fact.

**Caveat on external behavior.** I reviewed designs and unrun code. Where a claim depends on how Cloudflare (Workers, D1, Durable Objects, R2, Queues), GitHub (Apps, Actions, GHCR, Checks, merge API), Slack, RunPod, Docker, ComfyUI, Remotion, FFmpeg, Typst, `pdftotext`, or Jules behaves, I reasoned from how they work as I understand them. Verify each against current documentation before building on it.

---

## Table of contents

1. [Purpose and the governing ideas](#1-purpose-and-the-governing-ideas)
2. [The Deletion Principle and the two sources of truth](#2-the-deletion-principle-and-the-two-sources-of-truth)
3. [System architecture and trust boundaries](#3-system-architecture-and-trust-boundaries)
4. [Authority partitioning: D1 versus Durable Objects](#4-authority-partitioning-d1-versus-durable-objects)
5. [The task state machine](#5-the-task-state-machine)
6. [Leases, epochs, fencing, timers, and the choke point](#6-leases-epochs-fencing-timers-and-the-choke-point)
7. [The outbox and saga execution](#7-the-outbox-and-saga-execution)
8. [Budget, cost, and the kill switch](#8-budget-cost-and-the-kill-switch)
9. [The agent bridge: specs, scope, and the PR audit](#9-the-agent-bridge-specs-scope-and-the-pr-audit)
10. [Verification: the gauntlet, retries, and circuit breakers](#10-verification-the-gauntlet-retries-and-circuit-breakers)
11. [Merging safely](#11-merging-safely)
12. [Rollback, sagas, and multi-repo changes](#12-rollback-sagas-and-multi-repo-changes)
13. [Security model](#13-security-model)
14. [Data model (DDL) and contracts](#14-data-model-ddl-and-contracts)
15. [Scheduled maintenance and reconciliation](#15-scheduled-maintenance-and-reconciliation)
16. [Narrative content layer](#16-narrative-content-layer)
17. [Media layer: source-baking, camera, audio, compositing, QA](#17-media-layer-source-baking-camera-audio-compositing-qa)
18. [Asset operations: curation, manifests, LoRA governance](#18-asset-operations-curation-manifests-lora-governance)
19. [Infrastructure: containers, graph synthesis, canaries](#19-infrastructure-containers-graph-synthesis-canaries)
20. [Determinism and reproducibility](#20-determinism-and-reproducibility)
21. [Testing strategy](#21-testing-strategy)
22. [Operational runbook and break-glass](#22-operational-runbook-and-break-glass)
23. [Tiering, scope, and what to build first](#23-tiering-scope-and-what-to-build-first)
24. [Findings register: recurring errors and their fixes](#24-findings-register-recurring-errors-and-their-fixes)
25. [Open items, missing artifacts, and honest status](#25-open-items-missing-artifacts-and-honest-status)
26. [Glossary](#26-glossary)

---

## 1. Purpose and the governing ideas

`repo-bot` is an **edge-native control plane** for a multi-repository generative-media studio. It sits between human intent (chat commands, specs, review) and untrusted execution (a coding agent called Jules, GPU render workers, diffusion and language models). It does not create content. It validates, routes, gates, and records.

### 1.1 The ideas that survived every round of review

These are the load-bearing principles. Everything else is mechanism in service of them.

1. **The agent proposes; deterministic code disposes.** A non-deterministic worker (an LLM coding agent, a render node) produces candidates. Deterministic, externally-run code decides what is accepted. The worker never grades its own work, never holds elevated credentials, and never controls the approval.
2. **Structural constraints beat stated policy.** A prompt that says "do not touch these files" eventually fails. A diff check run outside the agent's sandbox that rejects any file not on an allowlist does not. Wherever a rule matters, enforce it in code the agent cannot influence.
3. **Catch it early and cheaply.** Every check is ordered from cheapest and most deterministic to most expensive and least deterministic. A defect caught before any GPU or token is spent costs nothing. Validation, feasibility checks, and schema refinement all run before dispatch.
4. **Fail loudly, never fall back silently.** A silent fallback to a placeholder produces output that looks finished to every automated check and survives until final human review, which is the most expensive place to discover a defect. Missing templates, missing assets, and unreachable services must raise errors, not degrade quietly. (Drafting modes may fall back, but finals must pass a release gate that blocks any recorded gap.)
5. **Isolate credentials from arbitrary code.** Anything that executes untrusted code (community ComfyUI nodes, unpickled checkpoints, coding agents) is assumed able to read its own memory and environment. Elevated secrets live where such code cannot reach.
6. **Time and state have exactly one authority.** For each task, one component owns its state, its clock, and its epoch. Everything else requests transitions and reads projections.
7. **Honest claims.** A design is not "battle-tested," "un-gameable," "atomic," "bit-identical," or "finalized" until measured. Tag every guarantee as designed, implemented, or measured.
8. **Human ownership of creative substance.** Agents perform mechanical work with binary acceptance criteria. What a conflict means, whether a scene is good, and what a lie in an in-world document is remain human decisions.

### 1.2 The meta-lesson

Early drafts conflated *systems synthesis* with *fundamental invention*: elaborate multi-pod organizations, Merkle-tree provenance layers, two-phase-commit Durable Objects, much of it confident-sounding engineering fiction wrapped around a small correct core. Complex infrastructure can be an avoidance mechanism that delays confronting the real bottlenecks (does the pipeline produce watchable output, is the writing good).

The discipline that follows: **every component must trace to a failure that has actually happened or is imminent, and to what that failure costs.** A component that cannot complete the sentence "this prevents *X*, which costs *Y*" is deferred.

Three cheap practices were rescued from the "fiction" and should survive any pruning:

- **Content-addressed archival of generated artifacts** (diffusion output cannot be regenerated bit-for-bit, so the file *is* the artifact).
- **Pinned toolchains and manifests** (recording versions and hashes converts "I hope I can rebuild this" into "I can verify I can").
- **Idempotency on the spend path** (a network retry must not double-bill).

The distributed-lease machinery (fencing epochs, sagas, reconcilers) is justified only when a second worker or collaborator is real. See [Section 23](#23-tiering-scope-and-what-to-build-first).

---

## 2. The Deletion Principle and the two sources of truth

> If every generative model (LLM, diffusion checkpoint, voice model) were permanently deleted, the narrative universe must remain consistent with respect to its declared constraints within the relational ledger.

This gives a complete rule with a boundary:

| | **The narrative ledger** | **The media archive** |
|---|---|---|
| **What** | Canon entities, facts, state vectors, dependency graphs | Rendered plates, keyed alpha video, audio stems |
| **Where** | Relational store (SQLite/D1) with check constraints and foreign keys | Content-addressed object storage (R2) |
| **Nature** | Model-independent truth | Archive-dependent, irreplaceable |
| **Recoverable by regeneration?** | The story is rebuildable from the ledger | **No.** Diffusion output cannot be reproduced bit-for-bit from seeds |
| **Protection** | Constraints, versioning | Backup to a second provider, scheduled scrubbing, restore drills |

### 2.1 Nuances

- **"Consistent" means with respect to declared constraints, not "mathematically sound."** A ledger with few constraints is trivially consistent. Its trustworthiness is exactly the completeness of its encoded rules. The practical work is *growing the constraint set from observed failures*, one incident at a time, not specifying the universe up front.
- **The archive is the source of truth for pixels; the source is the source of truth for intent.** The story is model-independent (ledger). The footage is archive-dependent. This is why the archive needs a backup policy that the ledger does not.
- **Recovery policy.** Append-only content-addressed storage mirrored asynchronously to an independent secondary provider; a **deterministic rolling hash-cursor scrub** that verifies every object within a fixed period (30 days), not random sampling (a 5% weekly random sample with replacement leaves about 36.8% of objects unchecked after a full nominal cycle, the `e^-1` limit); a **monthly cold-restore drill** that rebuilds a historical scene from raw archive bytes in a clean environment and compares frame hashes to the manifest. A backup never restored is a hypothesis.

---

## 3. System architecture and trust boundaries

### 3.1 Components

```
UNTRUSTED INBOUND SURFACES
  GitHub webhooks (HMAC-SHA256)   Slack (HMAC + timestamp)   Media workers / RunPod
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│ repo-bot EDGE CONTROL PLANE (Cloudflare Worker, Hono)                │
│  • signature + replay verification, Zod payload validation           │
│  • ChatOps governance router                                         │
│  • task-spec compiler and agent dispatcher                           │
│  • PR audit engine, quality-result ingestion, SHA-pinned merge       │
│  • saga rollback + reconciler, scheduled maintenance daemons         │
└───────────┬──────────────────────────┬───────────────────────────────┘
            ▼                          ▼
   D1 (ledger, projections,    Durable Objects
   idempotency, telemetry)     GlobalCoordinator (singleton): budget, kill
                               ShotCoordinator (per task): FSM, epoch, timers
            │                          │
            └───────────┬──────────────┘
                        ▼
   R2 (content-addressed artifacts)   Queues (webhook overflow, DLQ)
                        │
                        ▼
DOWNSTREAM SPOKES (all untrusted)
  Jules coding agent (sandboxed VM)   GitHub Actions runners (GHCR builds)
  RunPod serverless GPU               Rig 2 local workstation (ComfyUI :8188)
```

### 3.2 Why the control plane is isolated (ranked)

1. **Credential blast radius (most important).** Runtimes that execute community ComfyUI nodes, Python scripts, or coding agents pull arbitrary code and unpickle models. If a GitHub write token or Cloudflare administrative key lives in that memory space, one compromised node can exfiltrate keys and rewrite the repositories and CI. Running the control plane as a locked Worker keeps elevated credentials out of the render runtime entirely.
2. **Observability independence.** The thing that reports a dead GPU must not run on the GPU. The edge survives worker kernel panics, driver deadlocks, and CUDA out-of-memory lockups, preserves the audit trail, and escalates.
3. **Bidirectional zero trust.** Workers are untrusted *clients*. Anything they post back (status, logs, artifact hashes) is validated with strict schemas, sanitized against command injection, and escaped before entering ledgers or chat. Trust is drawn in both directions: workers hold no control-plane secrets, and worker output is never interpreted as a directive.

The "event-loop starvation" rationale that appeared in early drafts is the weakest of the three and should be dropped; no one would co-locate a git orchestrator with a frame renderer.

### 3.3 Least-privilege GitHub authentication

Use a **GitHub App**, not a classic personal access token.

- Mint short-lived installation tokens (about 60 minutes), scoped per repository, on demand, and **cache them for most of their lifetime** (do not mint per call; that adds latency and burns rate limit). Refresh on 401.
- Never persist tokens in D1 rows or static environment variables.
- Split permissions per repository. `contents: write` is needed only where you create tags, delete refs, or merge (lore and meta repositories). Runtime and viewport repositories can hold `contents: read`, `pull_requests: write`, `checks: write`, `statuses: write`. Deleting a ref, merging a PR, and tagging all require `contents: write`, so a "read-only contents" grant cannot support the rollback saga.
- **Practical friction to budget for:** GitHub provides the App private key as PKCS#1; WebCrypto requires PKCS#8, so a conversion is needed. JWTs need tight clock-skew handling (issue slightly in the past, expire within ten minutes). This hides days of debugging.
- Use "Actions: write" only where workflow dispatch is genuinely required, and grant it narrowly.

### 3.4 Cloudflare Worker constraints to design around

- A Worker has no writable filesystem and no `git` binary. There is no `git ls-remote`; use the GitHub REST or GraphQL API. State lives in D1, Durable Objects, and R2, never in a JSON file in the repo (this retired `digest_state.json`).
- Multi-second network round trips are fine per request, but anything that must wait on CI or an agent must be event-driven (webhooks) or use Queues/Workflows, not a Worker that waits.
- `waitUntil` work is bounded and has no delivery guarantee. Long PR audits should be enqueued, and every handler needs its own retry and dead-letter path.
- Cron Triggers use exact expressions. `* * * * *` runs every minute, not hourly; hourly is `0 * * * *`. Use an explicit `switch` on `event.cron` with no `default` that runs an expensive job by accident.
- `D1.batch([...])` is atomic; separate calls are not. D1 is effectively single-writer, so keep high-frequency writes (heartbeats, per-event status) out of D1.
- Durable Object alarms are approximate, not exact, and a DO has **one alarm slot**.

---

## 4. Authority partitioning: D1 versus Durable Objects

A recurring failure was conflating **edge transport idempotency** with **task execution authority**.

| Concern | Authoritative store | Why |
|---|---|---|
| Webhook delivery uniqueness | **D1** (`INSERT ... ON CONFLICT DO NOTHING`) | Occurs before any task exists; a primary-key conflict is the atomic arbiter |
| Task lifecycle state, epoch, timers, outbox | **`ShotCoordinator` DO** (one per task) | Single-threaded, strongly consistent |
| Daily budget, in-flight reservations, kill switch | **`GlobalCoordinator` DO** (singleton) | Serializes all claimants; removes the check-then-act race |
| Cross-task queries, reporting, reconciler sweeps | **D1 projection** | You cannot efficiently enumerate DOs |

### 4.1 Rules

- **Every gating decision reads the DO, never D1.** Whether an epoch is valid, whether a lease may renew, whether an attempt may merge, whether budget exists: all DO reads. D1 may be used to *locate* the right DO and for reporting, never to *decide* whether an action is permitted.
- **D1 task rows are passive projections** written from the DO's outbox. Disagreement across the boundary is *transient and repairable*, not eliminated. The reconciler detects and repairs drift, using the DO as the source of truth. Claiming the design "eliminates" disagreement is an overclaim.
- **The projection write belongs in the outbox** so a D1 failure retries like any other side effect and cannot leave the DO ahead silently.
- **Cross-DO chatter is a hot spot.** If every heartbeat calls the global singleton, it serializes all workers and a slow singleton expires every lease at once (a correlated failure). Cache system status in each task DO for a few seconds and define the fail-safe explicitly for when the coordinator is unreachable.

### 4.2 Idempotency (edge)

Use a two-phase lifecycle with a handler lease, not claim-and-forget.

```sql
CREATE TABLE idempotency_keys (
  scope TEXT NOT NULL,
  delivery_key TEXT NOT NULL,
  status TEXT CHECK(status IN ('RECEIVED','PROCESSING','COMPLETED','FAILED')) NOT NULL,
  handler_lease_expires_at_ms INTEGER NOT NULL,
  response_payload TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  PRIMARY KEY (scope, delivery_key)
);
```

- **Why not KV.** Cloudflare KV is eventually consistent and has no atomic set-if-absent; two near-simultaneous deliveries can both read "absent." Use D1 or a DO.
- **Why not claim-before-process alone.** If the isolate dies after claiming and before finishing, the event is lost. GitHub does **not** reliably redeliver failed webhooks, so provider retries cannot be relied on for correctness. The reconciler (not the provider) must notice a PR that exists with no processed record.
- **Lease renewal.** A 60-second lease shorter than a slow handler lets the reconciler reclaim a still-running handler, producing concurrent duplicates. Renew the lease while processing, or size it above worst-case duration.
- **Replay-from-start convergence.** A reclaimed row is safe only if the handler converges to the same end state on rerun: check whether the Check Run for this SHA already exists before posting; check whether the PR is already closed before closing it. Don't require every internal step to be idempotent, only that the whole handler converges.
- **Only treat `changes === 0` as a duplicate.** A transient D1 error must propagate so the caller returns 5xx, not be swallowed as "duplicate."
- **`FAILED` needs a defined meaning** (retryable versus dead-letter) and an `attempts` cap.
- **Key work on `(repo, head_sha)` as well** so two deliveries for successive `synchronize` events on the same commit do not audit twice.
- **Retention.** Purge old rows (about 7 days) in the nightly sweeper.

### 4.3 Idempotency (spend path)

Webhook dedupe protects against provider redelivery. A separate mechanism protects against an *agent's* network retry, which is what actually double-bills GPU time.

- Require a caller-supplied `idempotency_key` (UUID) at the root of every mutating dispatch call, and bind it to a **server-computed payload fingerprint**. Same key with a different fingerprint returns 422, not the cached result.
- A key derived deterministically as `UUIDv5(task_id + base_sha)` collapses a retried *dispatch* but also blocks a legitimate *retry attempt* (same task, same base). Include the **attempt number**.
- A `PENDING` entry needs an expiry; on reclaim, **check the downstream system first** (does a job for this key already exist?) before redispatching. Best of all, pass the key downstream as the job identifier so duplicates collapse at the destination.
- At-most-once semantics prevent duplicates by accepting possible loss. For spend, that is often the right cautious choice. For "process a PR-opened event," loss means an unaudited PR, which fails open. Choose per path.
- "Zero duplicate spend" is an absolute the mechanism cannot promise.

---

## 5. The task state machine

The state machine is the single most important artifact. Prose documents must be **derived from** it, not the reverse. Generate any diagram from the transition table so they cannot drift.

### 5.1 States (13)

`PENDING`, `CLAIMED`, `RUNNING`, `VERIFYING`, `SCOPE_PASSED`, `AWAITING_APPROVAL`, `MERGING`, `MERGED` (terminal), `RETRYING`, `ROLLING_BACK`, `ROLLED_BACK`, `DLQ` (terminal), `HALTED`.

### 5.2 Design rules

- **The task's Durable Object owns every state.** Workers, the audit engine, and humans are *actors that request transitions*; none "owns" a state. Assigning ownership of a state to an external actor invites the D1/DO dual-authority bug.
- **`MERGED` is set only from a confirmation event** (`MERGE_SUCCEEDED`) after the merge actually happened, never from the intent to merge. A state that claims an external effect must be driven by the effect's confirmation. This is why `MERGING` exists.
- **Scope-then-quality are states, not flags.** `VERIFYING → SCOPE_PASSED → (QUALITY_PASS) → MERGING | AWAITING_APPROVAL`. A PR cannot merge on scope alone, and a human is never asked to approve code that has not passed quality.
- **Scope-then-quality ordering also protects the runner.** Run cheap structural checks before executing any agent-authored code.
- **Halt is legal from every active state and is non-destructive.** `HALTED` preserves branches for inspection; destructive cleanup belongs only to `ROLLING_BACK`. A halt is resumable.
- **Late and duplicate events on terminal states are a defined no-op**, not an error, so redelivered webhooks do not cause 500s and retry storms. This check precedes worker-epoch fencing.
- **Actors are a closed union, and authorization is by type.** No blanket bypass for a "system" actor. Actor identity is derived by the handler from authenticated context (verified Slack user ID, verified worker epoch, internal audit call), never passed in from a request.

### 5.3 Actors

```ts
type AuthenticatedActor =
  | { type: 'SYSTEM_INTERNAL' }
  | { type: 'REMOTE_WORKER'; workerId: string; epoch: number }
  | { type: 'AUDIT_ENGINE' }
  | { type: 'LEAD_ARCHITECT'; userId: string };
```

Earlier reviews suggested role-specific actor types (beat writer, scene architect, showrunner) so that escalations reach the person who can resolve them; the FSM should gain those as it matures.

### 5.4 Events (28)

`LEASE_CLAIMED`, `WORKER_ACK`, `SUBMIT_VERIFY`, `SCOPE_PASS`, `QUALITY_PASS`, `QUALITY_FAIL_RETRY`, `SECURITY_VIOLATION`, `NEW_HEAD_PUSHED`, `HUMAN_APPROVE`, `HUMAN_REJECT`, `APPROVAL_TIMEOUT`, `WATCHDOG_EXPIRE`, `ABSOLUTE_TIMEOUT`, `VERIFICATION_TIMEOUT`, `MERGE_TIMEOUT`, `ROLLBACK_TIMEOUT`, `KILL_SWITCH_TRIP`, `OPERATOR_CANCEL`, `OPERATOR_RESUME`, `OPERATOR_REQUEUE`, `MERGE_SUCCEEDED`, `MERGE_FAILED_TRANSIENT`, `MERGE_FAILED_PRECONDITION`, `MERGE_FAILED_HEAD_MOVED`, `MERGE_FAILED_CONFLICT`, `ROLLBACK_COMPLETE`, `WORKER_ABORT`, `RECONCILER_EXPIRY`.

(`BUDGET_EXHAUSTED` and a `MERGE_ACTION_DEAD_LETTERED` event were identified as still needed.)

### 5.5 The transition table (essentials)

Rules are data: `{ from, event, to, authorizedActorTypes, guard?, producePatch? }`. `producePatch(ctx, payload)` returns context changes, and both guards and patches receive the event payload so SHAs and reasons can flow from events into context.

| From | Event | To | Notes |
|---|---|---|---|
| PENDING | LEASE_CLAIMED | CLAIMED | Issues a new epoch; system actor |
| CLAIMED | WORKER_ACK | RUNNING | Worker actor; epoch must match |
| CLAIMED | WATCHDOG_EXPIRE / WORKER_ABORT | ROLLING_BACK | Boot timeout (about 60 s) |
| RUNNING | SUBMIT_VERIFY | VERIFYING | Guard: payload has `headSha`; patch sets `candidateHeadSha` |
| RUNNING | WATCHDOG_EXPIRE | RETRYING or ROLLING_BACK | Guarded by `attemptCount < maxAttempts` |
| RUNNING | NEW_HEAD_PUSHED | RUNNING | Self-transition; records latest candidate SHA (pushes during RUNNING are normal) |
| RUNNING / CLAIMED / VERIFYING / SCOPE_PASSED / AWAITING_APPROVAL / MERGING / RETRYING | SECURITY_VIOLATION | ROLLING_BACK | Class set to `SECURITY` from the event, not from a payload string |
| VERIFYING | SCOPE_PASS | SCOPE_PASSED | Guard: `payload.headSha === candidateHeadSha`; patch stores `auditedHeadSha` and `isHighRiskPath` |
| VERIFYING | VERIFICATION_TIMEOUT | ROLLING_BACK | A gauntlet that never reports must have an exit |
| SCOPE_PASSED / AWAITING_APPROVAL | NEW_HEAD_PUSHED | VERIFYING | Clears check flags and audited SHA; voids any pending approval |
| SCOPE_PASSED | QUALITY_PASS | MERGING (low risk) or AWAITING_APPROVAL (high risk) | Guard requires `payload.headSha === auditedHeadSha` (a stale result must not promote the wrong SHA) |
| SCOPE_PASSED | QUALITY_FAIL_RETRY | RETRYING or ROLLING_BACK | Bound by attempts; SHA-matched |
| AWAITING_APPROVAL | HUMAN_APPROVE | MERGING | Guard requires both SHAs **defined** and equal (an `undefined === undefined` pass is a real bug) |
| AWAITING_APPROVAL | HUMAN_REJECT | ROLLING_BACK | Class `HUMAN` |
| AWAITING_APPROVAL | APPROVAL_TIMEOUT | HALTED | Non-destructive: an unavailable reviewer must not destroy reviewable work |
| MERGING | MERGE_SUCCEEDED | MERGED | Only from confirmation |
| MERGING | MERGE_FAILED_HEAD_MOVED | VERIFYING | Clears flags; needs a re-audit trigger |
| MERGING | MERGE_FAILED_PRECONDITION | (wait/recheck) | Checks not yet green is not a conflict; retry with bound, don't reset verification |
| MERGING | MERGE_FAILED_CONFLICT | RETRYING | Requires a rebase; must be attempt-bounded |
| MERGING | MERGE_TIMEOUT | ROLLING_BACK | Merge cannot wedge forever |
| RETRYING | LEASE_CLAIMED | CLAIMED | New epoch, new branch, new attempt, fresh budget reservation |
| ROLLING_BACK | ROLLBACK_COMPLETE | DLQ / RETRYING / ROLLED_BACK | By class and attempts (see below) |
| ROLLING_BACK | ROLLBACK_TIMEOUT | DLQ | A wedged rollback must not park forever |
| ROLLED_BACK | RECONCILER_EXPIRY | DLQ | Also needs its own expiry timer |
| DLQ | OPERATOR_REQUEUE | PENDING | Resets attempts; without this, "manual adjudication" means database surgery |
| any active | KILL_SWITCH_TRIP / OPERATOR_CANCEL | HALTED | |
| HALTED | OPERATOR_RESUME | PENDING | Fresh branch, new attempt |

### 5.6 Rollback classification

`rollbackClass` is set from the **event that fires**, never from a caller-supplied string.

- `SECURITY` (tampering, path escape, ancestry rewrite): **terminal → DLQ**. A tampering agent gets no automatic retry.
- `INFRASTRUCTURE` / `QUALITY` with attempts remaining: **→ RETRYING** (automatic recovery).
- `HUMAN` with attempts remaining: **→ ROLLED_BACK** (waits for a human).
- Attempts exhausted: **→ DLQ**.

The earlier bug: comparing `rollbackReason === 'SECURITY_VIOLATION'` while the reason was overwritten by descriptive payload text ("TAMPERING: .github/...") made real violations look non-security and retryable.

### 5.7 Quality-versus-security distinction

A **security or tampering violation** (protected-file edit, history rewrite, whitelist escape) triggers rollback and escalation. A **quality failure** (lint, test) triggers retry with feedback. Treating every gate failure as grounds for branch deletion throws away recoverable work.

### 5.8 Guard properties to enforce (as tests)

- Exactly one rule matches for every reachable `(state, event, actor, context)`, or the miss is an explicit, documented illegal case.
- Guards read only fields that some earlier patch actually sets.
- Optional fields in guards get explicit presence checks.
- Every non-terminal state has either a system-driven exit (a timer) or is on an explicit allowlist of human-wait states (`HALTED`, `AWAITING_APPROVAL`, `ROLLED_BACK`), each with its own long expiry.

### 5.9 Known open gaps in the machine

- `PENDING` has **no actor**: nothing fires `LEASE_CLAIMED` for a first dispatch or a resume. A dispatcher (or a timer) is required.
- A **worker-boot step** (outbox action delivering epoch, branch, and spec to the worker) is missing; without it the epoch machinery has no consumer.
- `ROLLED_BACK` is reachable only for `HUMAN` class and has no automatic exit besides an unwritten reconciler; give it an expiry timer.
- `HALTED` has no expiry or digest; halted tasks accumulate silently.
- `MERGING` and `ROLLING_BACK` are excluded from halt as "uninterruptible sagas." They are outbox-driven and can take minutes, and `MERGING` is the *most* consequential place to want a kill switch. Either let the merge executor check the kill flag before calling merge and return a `HALT_REQUESTED` outcome, or document that the switch is deaf there for up to two minutes and record the operator response.
- `MERGE_FAILED_CONFLICT → RETRYING` and the `RETRYING → CLAIMED` path must be attempt-bounded; a conflict on trunk is not necessarily the agent's failure and should not silently consume the failure budget without a policy.
- `MERGE_FAILED_HEAD_MOVED → VERIFYING` waits for a push that will not come if the head did not actually move; the machine or handler must trigger the re-audit itself.
- Resume paths increment the attempt counter; an operator halt-and-resume should not consume a *failure* attempt (distinguish "leases issued" from "failures").

---

## 6. Leases, epochs, fencing, timers, and the choke point

### 6.1 Heartbeat-renewed short leases

A fixed 180-second lease revokes legitimate long renders. The correct pairing:

- A **short lease** (30 s) renewed by **heartbeats** (10 s) from an independent worker thread or process, plus
- A **separate absolute cap** (for example 15 minutes) for "alive but stuck."
- The heartbeat loop must not share an event loop with CPU-bound work (hashing multi-gigabyte files, parsing deep ASTs), or it starves and the lease falsely expires.
- The heartbeat response is `CONTINUE | HALT`. The kill switch and budget breaches reach running workers within one heartbeat interval plus the cache TTL (state this as the halt latency). A heartbeat during `CLAIMED` (before ack) must be accepted, or a healthy booting worker is told to abort.
- Prefer worker-initiated **push** (heartbeat) over the bot **polling** worker telemetry: a hung worker sends nothing, so polling detects it only at the next poll, and a Worker has no persistent loop to poll from.

### 6.2 Epochs and fencing

- **Every new lease issues a new epoch** (`LEASE_CLAIMED` from both `PENDING` and `RETRYING`). Store the epoch in **exactly one place**, not both `context.currentEpoch` and a separate storage key, or they can diverge.
- **Selective fencing.** Events that *revoke* the worker (timeout, kill, security, rejection, abort) bump the epoch. Events that *accept* the worker's output (advance, merge) do not, or you fence out the legitimate final promotion.
- **Worker events are epoch-checked in the transition engine**: a `REMOTE_WORKER` actor whose epoch differs from the current epoch is rejected as stale (after the terminal no-op check, so late duplicates on finished tasks are quiet).
- **Fencing is structural, not a storage feature.** R2 does not compare application epoch tokens, and Jules pushes straight to GitHub, not through your edge, so no "gateway" can return 409 on a stale push. The real mechanism: workers upload artifacts to **epoch-scoped, content-addressed keys** (`renders/<task>/epoch_<n>_<sha256>.mp4`), and a completion call to the DO validates the epoch before *promoting* the object. **A stale worker's writes can land but can never be promoted.** This holds only if promotion is the *sole* path to canonical storage and staging objects are lifecycle-expired and garbage-collected.
- Git branch scoping is not a per-token permission. Confine an agent identity to `spec/**` with branch protection or rulesets, and never make it an admin.
- The DO must also tell the worker its epoch; that delivery step is part of the worker-boot outbox action.

### 6.3 Timers: one scheduler per DO

A Durable Object has **one alarm slot**. `deleteAlarm()` cancels *all* timers on the object, so it cannot be used to cancel just the watchdog. Use an internal scheduler:

- A sorted list of typed timers in storage; arm the alarm to the earliest; cancel by **type** (deterministic IDs, one per type, so `schedule` replaces rather than appends); **re-arm after every firing**, including spurious ones, or remaining timers strand silently.
- Timer types: `WATCHDOG`, `BOOT_WATCHDOG`, `ABSOLUTE_CAP`, `APPROVAL_TIMEOUT`, `VERIFICATION_TIMEOUT`, `MERGE_TIMEOUT`, `ROLLBACK_TIMEOUT`, `RETRY_BACKOFF`, `OUTBOX_DRAIN`.
- **Epoch-scope only worker-facing timers.** The outbox drain and approval timeout are *not* epoch-scoped, or they are discarded as stale on an epoch bump and compensating actions never run.
- **Declare which timers are valid per state** (`ACTIVE_STATE_TIMERS`) and cancel all others on every transition. This fixed leaked timers (an absolute cap surviving a rollback, an approval timer firing from `ROLLING_BACK`).
- **Do not re-arm timers or re-enqueue on self-transitions.**
- **Process each due timer, then remove it.** Removing all due timers up front then processing means an exception mid-loop loses the rest. Catch `ILLEGAL_FSM_TRANSITION` from a stale timer as "no longer applies" and continue.
- **Re-derive expected timers from current state on any wake** (self-healing), and have a periodic reconciler find non-terminal tasks with no armed alarm, because state commit and alarm arm are not atomic.
- **Pass the transaction handle into the scheduler** so timer writes participate in the same transaction; `setAlarm` is a separate resource and not covered by it.
- Chaos tests should assert **bounded windows**, not exact times (alarms are approximate).
- A timer list should be bounded and cleaned on terminal states; the timer entry should carry the epoch it was created under, and on firing the handler compares to current and no-ops if stale.

### 6.4 The choke point (`applyTransition`)

All transitions run through one method inside `storage.transaction()`:

1. Read state, context; evaluate the transition (legality, guards, actor, worker epoch).
2. Apply the context patch atomically.
3. Apply selective epoch fencing.
4. If self-transition, persist context and return (no timers, no outbox).
5. Reconcile timers declaratively (cancel invalid, arm entry timers).
6. Enqueue outbox actions (one key per action; see Section 7).
7. Arm an immediate outbox drain.

Constraints on the choke point:

- **Bookkeeping only.** State, epoch, timers, outbox enqueue. External effects go through the outbox, never inline; otherwise the choke point becomes a long request that can fail halfway and you have rebuilt the non-atomic saga you were escaping.
- **Idempotent** on `(task, epoch, reason)`: a repeat is a no-op returning the recorded outcome.
- **No external `await` inside the transaction.** Otherwise a crash can leave the epoch bumped but the outbox unwritten.
- **Name and shape.** It handles *all* transitions, not just "leaving RUNNING"; entering states needs its own entry-action table so each state declares timers armed on entry and cancelled on exit.
- Event-log rows (`task_events`) are a byproduct of every transition, including self-transitions (log them without re-arming timers), so the audit trail is complete.

### 6.5 `context` initialization (the missing entry point)

`fsm_context` must be written at task creation, atomically with the `tasks` row and the **first budget reservation**: `taskId`, `maxAttempts` (initialized from the immutable `tasks` row; do not keep two mutable copies), `attemptCount: 1`, `baseCommitSha`, `branchName`, `targetRepo`, `currentEpoch`, and cleared per-attempt fields. Without this, `applyTransition` throws `CORRUPT_STATE_ERROR` on first call. This create-task path, the dispatcher that fires `LEASE_CLAIMED` from `PENDING`, and the worker-boot step are the **entry point of the entire system** and have remained comments across many revisions.

---

## 7. The outbox and saga execution

### 7.1 Why

A saga executed sequentially inside one Worker request is fragile: if the isolate dies midway, it is left partially rolled back. The compensating actions are **recorded first, in the DO's durable storage, and executed idempotently with retry**, converting "best effort in one request" into "eventually completes."

This is a **compensating saga, not a transaction.** There is no atomicity across GitHub, D1, a filesystem, and a VM. "ACID" and "two-phase commit" are misnomers (2PC requires participants that durably promise they can commit; GitHub gives no such promise). The correct description: **an idempotent compensating saga driven from a durable outbox, with a reconciler ensuring eventual completion.**

### 7.2 Structure

- **One key per action**: `outbox:<lane>:<id>`. This removes the lost-update hazard where a drain that read the array, awaited network calls, then wrote it back would erase actions appended by a concurrent transition.
- **Independent lanes:** `PROJECTION` (D1 mirror and event log), `BUDGET` (settlement/release), `GITHUB` (close PR, delete ref, merge). A failure breaks only its own lane, so a poisoned projection update does not block budget settlement (which would leak the reservation).
- **Per-action `nextAttemptAt`** with backoff; **dead-letter after N attempts** (5), with an alert and an operator command to requeue or discard. A dead-lettered budget settlement leaks a reservation; a dead-lettered compensating action leaves a live branch. The reconciler must catch both.
- **Cancel queued merge actions on entering `ROLLING_BACK`** so a stuck merge cannot block its own rollback in the same lane. Put the action type in the key so the purge is a prefix delete.
- **Re-read each action's key before executing** and skip if it was purged since the snapshot was taken.

### 7.3 Executors return outcomes

Executors do not call back into their own DO. They **return `{ event, payload }`** and the drain applies the transition **locally** (a direct call, not a stub self-call through the RPC boundary, which can deadlock). This also makes executors unit-testable without a Durable Object.

Every action whose success changes the world must feed a **confirmation event** into the machine:

- Merge → `MERGE_SUCCEEDED` / the failure family.
- Compensating actions → `ROLLBACK_COMPLETE`. (Without this every rollback times out into `DLQ`.)
- Budget settlement and projection are pure side effects with no state consequence.

### 7.4 Drain ordering and failure classes

- **Apply the transition first, then delete the action key** (or store the outcome on the action key in the same transaction). Deleting first and crashing before the transition loses the outcome: a *merged* PR then times out into a rollback that deletes work already on trunk. Re-execution after a crash is safe only because the executors are idempotent (see below).
- **Separate two failure classes.** An *executor* failure retries the action. A *transition rejected as illegal or a no-op* (the state already moved on, a normal race) is a stale outcome and is **discarded**, never retried; otherwise a successful merge whose follow-up transition raced gets re-created and dead-lettered.
- **Transient errors should throw** from the executor so the outbox's own backoff retries the same action, keeping retry policy in one place. A separate `MERGE_FAILED_TRANSIENT` event with an FSM counter is redundant and, combined with the self-transition short-circuit, never actually retries. Have a dead-lettered merge action trigger a defined `MERGE_ACTION_DEAD_LETTERED` handling.
- **Run the drain where it will not hold the DO** during multi-second network calls, or keep network work short and time-bounded; a long drain inside an alarm can starve heartbeats and the watchdog.
- Persist the `RETRY_BACKOFF` re-arm if the claim-then-lease sequence fails partway (claim succeeded, transition threw) so a task cannot strand in `RETRYING` holding budget.

### 7.5 Per-action idempotency contracts

| Action | Idempotency |
|---|---|
| Close PR | 404/422 treated as success |
| Delete ref | 404/422 treated as success |
| Merge | Check `pr.merged` first; if merged, emit `MERGE_SUCCEEDED` (not a false failure) |
| Budget settle | Dedupe key `(taskId, attempt)` |
| D1 projection | Upsert on `(task_id, attempt_number)`; deterministic `task_events` ID with `ON CONFLICT DO NOTHING` |

### 7.6 Rollback saga order (revoke first)

1. **Revoke write authority** (bump epoch; mark `ROLLING_BACK`). If the branch were deleted first while an agent still ran, the agent could push and recreate it.
2. **Close the pull request explicitly** (with a sanitized diagnostic).
3. **Delete the remote ref.**
4. **Update D1** (WAL to `ABORTED`, lease to `ROLLED_BACK`, audit entry, in one `batch`).
5. **Alert** with a sanitized diagnostic.

All steps are idempotent; catch only 404/422 as "already done" and rethrow everything else (auth failures and rate limits must retry). Never hard-code the org owner; read it from the lease or config. Mint the installation token once and reuse it. Release budget in an idempotent step the reconciler can rerun.

### 7.7 Retry paths must clean up

`RUNNING → RETRYING` (watchdog) and `SCOPE_PASSED → RETRYING` skip the rollback saga in a naive design and orphan the failed attempt's branch and PR. Either enqueue the cleanup on entering `RETRYING` or route every failed attempt through `ROLLING_BACK`.

---

## 8. Budget, cost, and the kill switch

### 8.1 Reserve-then-reconcile with a singleton

A check-then-act on a spend total is racy when many per-task objects each read a stale total. The `GlobalCoordinator` singleton serializes it:

- **`claimBudget(taskId, attempt, estimate)`**: checks `settled + in_flight_reserved + estimate <= cap` and the master kill flag, then debits `in_flight_reserved`.
- **`settle`/`release`**: on any exit, releases the reservation and records settled spend.

Rules that fixed real leaks:

- **Every exit releases or settles**, including watchdog expiry, halt, retry, and rollback. Releasing only in the rollback path leaks a reservation on every worker crash until the system reports false exhaustion while spending nothing.
- **Pair every claim with exactly one settlement** and test it as an invariant. Every route to `CLAIMED` (first dispatch, retry, and every resume from `HALTED`/`ROLLED_BACK`/`DLQ`) needs a claim.
- **Make claim-then-lease idempotent** on `(taskId, attempt)` and re-armed on failure.
- **Refusal is not a kill switch.** A budget shortfall is `BUDGET_EXHAUSTED` (ideally deferrable to `PENDING` with a `blocked_until`), distinct from a global emergency, so a budget reset can resume tasks and the audit log distinguishes the two.
- The kill switch is checked at **claim time and on every heartbeat renewal**, so in-flight work actually stops. A halt that only blocks new claims is not a kill switch.

### 8.2 Dual-ledger settlement

- **Ledger A (cap):** conservative. A crashed job is charged its full reservation against the daily ceiling, so worst-case billing cannot exceed the cap.
- **Ledger B (telemetry):** best-known actual. Elapsed heartbeat time times tier rate for a crash; provider-reported usage when available.

Keep `cap_charged_usd` distinct from `estimated_actual_usd` and reconcile against the provider's billing periodically so systematic overcharging to the cap is detected. **Choose the cost basis from the cause, not the target state:** a crash is conservative; a clean quality failure is knowable actual; an approval-timeout halt with no compute running is near zero; a kill switch during `RUNNING` is crash-like. A small table keyed on `(fromState, event)` is the correct structure. The settle payload must carry `reservationId`, `attempt`, `elapsedMs`, `computeTier`, and crash-versus-clean.

Crash-loop alert: if the cap trips because of forfeited reservations rather than completed work, post a distinct alert naming the failing task and cause ("8 consecutive worker timeouts on Rig 2 CUDA OOM"), so budget exhaustion is not a mystery. Call the amounts "reserved and charged on failure," not "lost," since actual spend was likely lower.

### 8.3 Cost guardrails

- Per-task and per-scene ceilings, not only per-attempt (an agent that varies its region slightly can make each attempt look fresh).
- A daily cap enforced by the coordinator; a cap value in a config table, not a constant.
- The budget "day" needs a **declared timezone** (UTC midnight surprises an operator elsewhere).
- Reservation cost should be computed from the derived frame allocation, not a flat default.
- Whether Jules exposes a per-session cost cap is unverified; if not, the bot must terminate a session when metered usage or elapsed time crosses a bound, and the metering source must be trustworthy. A schema maximum that allows four times the documented cap invites drift; keep the cap a single source of truth.

### 8.4 Time authority

- Durable Object clock: leases and timers.
- Worker clock: replay windows.
- A single defined timezone: budget rollover.
- D1 and Worker clocks are not guaranteed to agree.

---

## 9. The agent bridge: specs, scope, and the PR audit

### 9.1 The spec as a contract

A task is a **version-controlled markdown file** with machine-parseable frontmatter and a prose intent.

```markdown
---
task_id: "TASK-04.02.01"
target_repo: "@snailicid3/consumer-npm"
base_branch: "main"
budget_cap_usd: 0.50
timeout_seconds: 600
closed_ledger_scope:
  in_scope_paths: ["src/linters/somaticLinter.ts", "tests/linters/somaticLinter.test.ts"]
  forbidden_paths: ["package.json", "package-lock.json", "src/schemas/**", "compiled/**"]
---
# MISSION INTENT
...
# ACCEPTANCE CRITERIA (FALSIFIABLE)
1. `npx vitest run tests/linters/somaticLinter.test.ts` exits 0
...
```

Why this shape is right:

- **Intent separated from boundaries.** Prose says the outcome; frontmatter says the operational envelope. The agent keeps tactical freedom in syntax while its blast radius is enumerable *before* it runs.
- **Falsifiable acceptance.** Every criterion resolves to a binary command and exit code. Subjective criteria ("clean up the code") are banned because a model cannot verify them and will declare success.
- **The spec lives in the repository**, so scope has a reviewable origin and every task has a stable identity. This answers the question of where `file_whitelist` comes from that the TypeScript artifacts left as an unspecified lookup.
- **Verification commands come from a fixed registry** keyed by ID, not free-form shell strings.

### 9.2 Pre-flight spec linter (runs before any spend)

- Schema-validate strictly (`.strict()`, no extra properties).
- Every acceptance criterion maps to an allowlisted command.
- `in_scope_paths` and `forbidden_paths` do not overlap; forbidden includes all protected globs.
- The base commit exists and is an ancestor of the branch tip.
- **Red-before-green:** at least one criterion must **fail on the current base** and pass only after the change, proving it measures something (a criterion that already passes tells you nothing).
- `contract_version` is validated against an allowlist of accepted versions.
- Shape versus semantics: `.strict()` and Zod checks confirm structure; `.refine()` catches semantically impossible payloads (inverted bounding box, frame range beyond clip length). Validation is the floor of the safety system, not the ceiling; a valid payload can still be wrong.
- Reject specs with no binary criterion or no closed ledger with a 400 before dispatching.

### 9.3 Prompt assembly (advisory)

The "attention sandwich" (constraints at top, context in the middle, exit commands at the bottom) and a test-first mandate are reasonable prompting heuristics. **The prompt is advisory; the diff check is authoritative.** The whole safety of the design must not depend on the agent obeying its prompt.

### 9.4 The PR audit engine

Runs on `pull_request` `opened`/`synchronize`. It is a **fail-closed external inspector**: it evaluates the submission entirely outside the agent's VM.

1. **Fork isolation.** Reject PRs whose `head.repo.full_name` differs from the base (a fork branch could spoof the `spec/` prefix).
2. **Ownership from the lease table, not string patterns.** Determine bot ownership from the lease. Do **not** identify an agent by branch-prefix casing or `sender.login.includes('bot')`: that fails open (a lowercase branch never matched an uppercase prefix check, so every bot PR bypassed the audit) and false-positives on humans named "Abbott." Identify the agent by the GitHub App's actual bot account ID. Any PR from an unallowlisted account with no lease is blocked, not ignored.
3. **Lineage.** `compareCommits(base_commit_sha, head)` must be `ahead` (a direct descendant), catching history rewrites. Handle `identical` (empty PR) and `diverged`/`behind` distinctly, and mind truncation on large comparisons.
4. **Full paginated diff.** Fetch every changed file with pagination (`per_page` 100 needs a loop); read `pr.changed_files` as a cheap authoritative count. Reject over a blast-radius ceiling (about 50 files). The listing exposes `previous_filename` and file `status`; inspect **both old and new paths** so a rename out of a protected directory is caught, and check mode/symlink changes via the git tree API.
5. **Allowlist plus protected set.** Only paths on the spec's allowlist may change, and a hard **protected set** can never appear in any whitelist even if a spec mistakenly lists it. The protected set is **anchored**, not substring-matched: `^\.github/`, `(^|/)tests/`, `\.test\.[tj]sx?$`, `(^|/)tsconfig(\.[^/]+)?\.json$`, `^\.?eslint`, `vitest\.config`, lockfiles (`package-lock.json`, `pnpm-lock.yaml`), `package.json`, `.npmrc`, `Dockerfile`, `wrangler.*`, `.gitmodules`, `.gitattributes`, `CODEOWNERS`, `.husky/`, `jest.config.*`, `benchmarks/golden_set/`. A loose `includes('eslint')` both false-positives (`eslintHelpers.ts`) and is evaded by what it doesn't cover. Locked episode files and `tests/escapes/**` and `tests/held_out/**` join the set.
6. **Diff-based, external, not agent-reported.** The agent's summary of what it touched is ignored. Never trust local git checks inside the VM.
7. **Post separate Check Runs.** `repo-bot/scope-check` first, on the exact head SHA. Only if scope, lineage, and paths validate does `repo-bot/quality-gauntlet` start. Always post a **failing** check on violation (a missing required check can read as "pending forever," stalling silently). Naming a diff-shape test a "gauntlet pass" is misleading; scope-check certifies file shape only.
8. **Policy versus quality routing.** Policy violations (tampering, ancestry, protected paths) roll back and escalate. Soft scope errors (one extra file, likely a mistake) can feed back and retry.
9. **Path sensitivity routing** into three classes defined in one table: **forbidden**, **approval-required**, **auto-mergeable**. Do not have two policies for workflow files (block-and-rollback in one place, approval-gated in another).
10. **Order.** Human approval should follow quality, not precede it, so a reviewer is not asked to approve code that may still fail.
11. **Null spec = block.** `.first()` returns null if no `task_specs` row; treat as a blocking condition (fail closed), not a thrown error inside `waitUntil` where it disappears.

### 9.5 Path-sensitivity policy

| Class | Examples | Merge authority |
|---|---|---|
| Low risk | `src/utils/**`, `src/types/**`, derivable `compiled/manifest.json`, generated episodes that pass gates | Auto-merge after scope + quality, SHA-pinned |
| High risk / creative | `characters/*.md`, `grievances/*.md`, `world/*.md`, workflows, manifests that carry approvals, `Dockerfile`, `requirements.txt`, custom-node pins | Human approval (a GitHub review, not a Slack click) |
| Forbidden | Protected set above | Never agent-writable |

**Policy refinement.** "Zero corpus write access" as originally stated was stronger than what was implemented (the bot merges PRs). The honest policy: *the bot itself never authors content; an agent may propose bounded, human-approved edits; a deterministic gate plus (for sensitive paths) a human decides.*

### 9.6 Agent boundaries

- The agent runs in an **ephemeral sandbox with no network egress and no cloud credentials**; dependency install is locked off (verify a frozen lockfile exists; the sandbox, not the spec, must prevent `npm install` with network).
- The agent authors code or AST; it is restricted by the whitelist.
- **Held-out tests.** Because a spec may authorize the agent to write tests, and a vacuous suite passes, acceptance must not depend solely on agent-authored tests. Overlay an immutable directory of held-out tests from `main` at verification time; run **mutation testing** on agent-authored tests (inject deliberate defects; do the agent's tests fail?). Test files, linter configs, and golden baselines are otherwise forbidden agent writes.
- **Scope of work.** Jules is a mechanical script engineer, technical translator, and corpus compiler. Open-ended architectural migrations, custom shaders, and dependency upgrades do not fit the bounded-spec discipline and are human-led with agent assistance. Any request that asks the agent to decide *what* rather than *how* is out of scope.
- **A deterministic build step is not an agent task.** Recompiling `compiled/` is a pure function of source; do it in a deterministic CI job, not via an LLM. Only failure diagnosis (a broken foreign key, a cycle) needs judgment, and that goes to a human.
- Agents never push to trunk, and every change flows through a lease-tracked branch and the audit.

---

## 10. Verification: the gauntlet, retries, and circuit breakers

### 10.1 The ordering principle

Cheapest and most deterministic first; most expensive and least deterministic last. Nothing agent-authored executes until structural checks pass. **Run the gauntlet in an ephemeral, credential-free sandbox** that receives a tarball of the candidate and returns exit codes and logs; it has no secrets, no repository write access, and no outbound network. Running `tsc` or `vitest` on the agent's branch in a credentialed environment executes agent-authored code (and `package.json` scripts) next to secrets, which is exactly the exposure isolation exists to prevent.

### 10.2 Tiers (software and corpus)

| Level | Check | Notes |
|---|---|---|
| 0 | Type check (`tsc --noEmit`); style linters as **advisories** | Style rules (participial chains, crutch density, "slop" word lists) have arbitrary thresholds and easy evasion; demote to warnings, measure false-positive rate, never block on them |
| 1 | Two/three-pass corpus compile (see Section 16) | Shape, relational integrity and DAG acyclicity, deterministic sealing, **drift tripwire** (`git diff --exit-code compiled/`) |
| 2 | Somatic / logistical / epistemic invariants | Hard gates; deterministic and factual |
| 3 | Adversarial critic (independent LLM) | Forced `<analysis_trace>` with line-quoted citations; a verdict with no citations is machine-detectable as invalid. Pin the model version and store trace and verdict. Temperature 0 is more consistent, **not deterministic** across versions/hardware. Treat as an advisory classifier with a measured error rate plus a human sample audit |
| 4 | Dynamic regression (Vitest), cross-repo version check, defect-escape sentry | |

The drift tripwire catches two failures: source edited without recompiling, and the compiled artifact hand-edited to spoof a pass.

### 10.3 The defect escape sentry / regression flywheel

Every defect that escapes review becomes a permanent regression test (`tests/escapes/`), and the cumulative battery runs on every branch. This is the mechanism by which the constraint set grows from observed failures.

### 10.4 Trajectory analysis (corrected policy)

Model the error as a signature vector `<Domain, TargetEntity, RuleID, OffendingTokens>` and compare across attempts. **A category jump is evidence, not proof.** The commonest cause is that fixing error A *unmasked* a hidden error B, which is progress. The retry policy, stated once:

| Trajectory | Signal | Action |
|---|---|---|
| **Oscillation** (A → B → A) | Strong evidence of conflict | Trip breaker immediately; escalate |
| **New class** (single jump) | Weak evidence | Do **not** halt; retry once with both constraints stated together |
| **Same class, error count not decreasing** | Stagnation in a phrasing basin | Inject a targeted negative constraint (amplified), allow the final attempt |
| **Same class, error count decreasing** | Converging | Continue |
| **Always** | | Record the full signature trajectory so the heuristic can be measured |

Also: track whether the *set of failing rules* is shrinking, not just the domain label. Cap total attempts at 3.

**Decide satisfiability directly, before spending anything.** A pre-flight feasibility check over structured constraints answers "is this scene infeasible" for $0.00. Discovering infeasibility by running an agent three times is the expensive way to learn what a solver tells you for free. This requires the scene's required beats in **structured form** (see Section 16); a solver cannot parse free prose.

### 10.5 Diagnostic escalation and role routing

A trip produces a structured dossier: task, classification, trajectory trace, attempt diffs, the **active constraint matrix**, and **constraint provenance** (which scene and commit introduced each rule). Route by class to the human who can fix it fastest:

| Classification | Cause | Route |
|---|---|---|
| `LOCAL_STYLE_FAILURE` | Satisfiable; the agent is in a phrasing basin | Beat writer (30-second manual edit) |
| `CONSTRAINT_CONFLICT` | Upstream constraints make the scene impossible | Scene / story architect |
| `UPSTREAM_STRUCTURAL` | Foundational lore or schema breaks the arc | Showrunner / lead engineer |

### 10.6 Override density as rule health

`D_override(rule) = (Overrides + CircuitBreakerTrips) / TotalTaskInvocations`. A rule constantly overridden or tripped is miscalibrated or obsolete. Log every "Auteur Override" to feed it. Flag above a threshold (for example 0.15) for review.

### 10.7 Shadow mode

Run the audit engine advisory-only against real agent PRs for a couple of weeks before enabling destructive actions.

- Implement as a **mode flag wrapped around every mutating GitHub call**, in code, not just in the plan.
- **`shadow_violations`** records `rule_id`, `rule_version`, the violating span, `hypothetical_action`, and a **human `disposition`** (`TRUE_POSITIVE`, `FALSE_POSITIVE`, `AMBIGUOUS`, `UNREVIEWED`). Without human labels you have a log, not a measurement.
- **Measure both precision and recall.** Shadow mode cannot observe what it fails to catch, so **seed known-bad PRs** (an edit to `vitest.config.ts`, a path traversal, a rename out of a protected tree) and require every planted violation to be caught. Grow the seed set from every real incident.
- A "99% precision over 100 PRs" gate is statistically loose per rule: count reviewed violations *per rule*, require a minimum number of firings, and report a confidence bound. Zero false positives in 50 trials bounds the true rate only near 6% at 95% confidence (rule of three).
- Shadow data measures detection accuracy, not enforcement dynamics (an agent that would adapt after a real rejection). Follow with a short enforcement canary on low-risk paths.

---

## 11. Merging safely

### 11.1 SHA-pinned merge

Merging is an outbox action with a confirmation event. The executor:

1. **Re-fetch the PR.** If already merged with a merge commit, emit `MERGE_SUCCEEDED` (a retry after a crash must not report a false failure).
2. Verify **`head.sha === audited SHA`** (else `MERGE_FAILED_HEAD_MOVED`). `expectedSha` must come from a patch that actually set `auditedHeadSha`; if it is `undefined`, every merge fails as "head moved" and no task can ever merge.
3. Fetch **paginated check runs** and resolve the **latest run per check name** by completion time (`some(c => c.name === X && c.conclusion === 'success')` accepts any historical success even if the latest run failed). Both `repo-bot/scope-check` and `repo-bot/quality-gauntlet` must be green **for that SHA**.
4. Call `pulls.merge` with `sha: expectedSha` so GitHub itself rejects the merge if the head moved (closes the check-to-merge window).
5. Classify errors: 409 conflict, precondition (checks not green), transient (throw for outbox retry), head-moved.

Additional points:

- Configure **branch protection with required status checks** so the bot's merge is the last step of a gated flow, not the only gate; ideally use the combined required-status API or rulesets so GitHub enforces the checks in the merge call itself.
- **Choose the merge method deliberately per repository.** Squash changes the resulting SHA, so any `versions.json` pin depends on the squash commit, not the branch head. A fast-forward requires that trunk has not advanced, which fails as soon as anything else lands.
- The bot's own identity must not be able to bypass protection by accident.
- Approvals bind to `(task_id, head_sha)`: approving a card must not merge a later push.

### 11.2 Quality-result ingestion

A dedicated handler receives `check_run`/`workflow_run` completion and drives `VERIFYING`/`SCOPE_PASSED → MERGING | RETRYING | AWAITING_APPROVAL`. It is the keystone: without it, tasks enter `VERIFYING` and nothing advances them.

- **Route by branch name** (deterministic task ID from the branch), never by a D1 status lookup, which drops results when the projection lags (`if (!attempt) return;` silently strands the task).
- **On a miss, enqueue for retry**, do not drop.
- Claim an idempotency key so a redelivered check-run event does not apply twice.
- Pass `headSha` in the payload so the guard can reject stale results.

### 11.3 Slack approval flow

- **Interactive payloads arrive form-encoded** (`application/x-www-form-urlencoded` with a JSON `payload` field), not raw JSON. `JSON.parse(rawBody)` throws on real traffic.
- **Slash commands** and message-style `!` commands are different: the latter need the Events API with `url_verification` handling.
- **Acknowledge within 3 seconds** (Slack times out). Do the work asynchronously and post to `response_url`. `!QuintetStatus` fans out across all repos and will exceed the window if done synchronously.
- Verify the clicker's Slack user ID against an allowlist **on the interaction callback** (a separate signed request), make approval **one-shot and idempotent** (record consumption in an `approvals` table with `UNIQUE(task_id, head_sha)`), bind the card to `(task_id, head_sha)`.
- Approval **authority is a GitHub PR review under branch protection**, read from the GitHub API; the Slack click is a notification path. An approval recorded as a string field (`supervised_signoff: "art_director"`) in a JSON file the agent can write is decorative.
- The 24-hour timeout needs an owner (a DO timer). Design for an unavailable approver: escalate, or halt non-destructively; do not delete the branch.
- Rate-limit notifications so a bad day does not train the operator to ignore pings.

---

## 12. Rollback, sagas, and multi-repo changes

### 12.1 What rollback really is

See 7.6. Additional cautions from the rollback documents:

- **`git clean -fdx` and `git reset --hard origin/main` are hazardous and mostly unnecessary.** `clean -fdx` deletes every untracked and ignored file (including `node_modules` and `.env`) and destroys unrelated work on a shared checkout. The control plane is a Worker with no checkout, and the agent's VM is discarded. **Never reuse a workspace:** provision a fresh clone per attempt and destroy it afterward, making "sanitation" a non-operation. If a persistent runner exists, scope cleanup to a dedicated per-task directory.
- **The anchor is the pinned commit `S_clean`, not `origin/main`**, which moves.
- **A commit ID is not a SHA-256 hash of state.** Git commit IDs are SHA-1 unless the repository uses the SHA-256 object format. `S_clean` identifies a commit; `H_root` identifies compiled content at that commit. They are different quantities.
- **A filesystem backup of `compiled/bible-state.json` duplicates version control.** Restoring is `git checkout <S_clean> -- compiled/`, or simply not merging. The design smell is any agent mutating canonical state before verification. Agents only change files on their branch; canonical state changes only at merge. Then there is nothing to restore.

### 12.2 Multi-repo work is not a distributed transaction

The source called this "ACID two-phase commit." It is not: after every repository "passes," the merge of repository B can still fail *after* repository A merged, and reversing A means a **revert commit on trunk**, a visible, non-instant operation others may have pulled.

The honest model: **a saga with a forward-recovery preference, made safe by compatibility ordering.**

- **Design each cross-repo change so every prefix of the merge sequence is a valid state** (expand, migrate, contract): an additive upstream change first (new optional field, new export, old path still works); downstream consumers migrate; removal of the old path is a later separate task. With that discipline a failure mid-sequence leaves a working system that is merely ahead of its consumers, and rollback is unnecessary.
- **Model the parent as its own state machine over child task machines**: `PREPARING`, `ALL_VERIFIED`, `MERGING`, `PARTIALLY_MERGED`, `COMPLETED`, `COMPENSATING`, `FAILED`. `PARTIALLY_MERGED` is a first-class state with a defined recovery (proceed forward if possible, else revert in **reverse merge order via revert PRs**, always alert a human). Drive merges from an outbox with confirmation events; the parent's durable record is a DO with children projected.
- **Compensation for a merged change is a revert PR, never a reset** of shared trunk.
- **Lock order and work order are different.** Locks are acquired in a global deterministic (alphanumeric) order to eliminate circular-wait deadlock; dispatch follows the **dependency DAG** (`goblin-config → goblin-bible → worker-sower-engine`). Locks are not actually held across a long agent run.
- The **60-second prepare lease** in the source is far too short for a multi-repo agent run; use heartbeat-renewed leases with an absolute cap sized to the transaction.
- Prefer **DAG-ordered dispatch** (upstream must exist before a downstream consumer links against it).
- The cross-repo health check runs `check-versions.ts` and integration suites against the candidate set.
- **Alarm-driven cleanup** after a partial merge must be idempotent and alert.

---

## 13. Security model

### 13.1 Threat table

| Vector | Manifestation | Defense |
|---|---|---|
| Webhook spoofing | Forged PR or RunPod payloads trigger actions or cost | Provider-specific signature verification; replay window; dedupe |
| Prompt injection via repo content | Lore/PR text/issue bodies carry instructions to the agent | Structural barriers: external diff whitelist, protected paths, status gates, human approval for sensitive paths. **Must hold even if the agent is fully compromised** |
| ChatOps hijack | Spoofed Slack commands trigger `!HardFreeze` / tags | Signature + timestamp; user allowlist; two-step confirm; identity logged |
| Credential theft | Elevated token in an exposed runtime | GitHub App, short-lived tokens, no secrets in agent or render environments |
| Workflow abuse | Dispatchable workflow with production secrets | Restrict who can dispatch; scope credentials to a benchmark-only bucket/endpoint; never expose to PR-triggered runs |
| Template exploit | Malformed JSON crashes ComfyUI or executes code | Local allowlisted templates; strict types |
| Agent test tampering | Editing tests or linters to force green | Immutable test set, held-out tests, mutation testing |

### 13.2 Provider-specific webhook authentication

- **GitHub:** HMAC-SHA256 (`X-Hub-Signature-256`), verified over the **raw body bytes**, constant-time comparison. GitHub does **not** use Ed25519 (a diagram error in early drafts). Read the delivery ID from the `X-GitHub-Delivery` **header**, not the JSON body (`payload.delivery_id` does not exist).
- **Slack:** signature over `v0:{timestamp}:{rawBody}`, prefix `v0=` included in comparison, with a **±5 minute replay window** on the timestamp. Constant-time compare.
- **RunPod:** confirm what authentication mechanism it actually offers; if none, use a secret path token or shared-header plus payload validation.
- **Do not consume the body stream before verification**; read the raw text once, verify, then parse.
- **Dual-secret rotation:** accept the current and a retiring secret for a grace window (about 24 hours) so rotation is not an outage. Provide rotation procedures for the App key, webhook secrets, and the Slack signing secret.

### 13.3 Operator-facing controls

The kill switch, approval endpoint, and ChatOps commands are now the most powerful interfaces in the system.

- Destructive commands (`!HardFreeze`, `!QuintetTag`, `!EmergencyHalt`) require a user-ID allowlist stored in D1, an interactive confirmation with a short expiry, and a logged invoking identity.
- **`!QuintetTag` is not atomic** across repositories. Freeze the intended SHA set first, create tags in order, and on any failure delete those already created and record the outcome (a saga).
- Sanitize anything from agents or workers before it reaches Slack or D1; escape mrkdwn; cap message size; never log raw webhook bodies or tokens.
- Protect against a compromised operator account or a Slack outage at the moment you need to halt (see Section 22).

### 13.4 Signing keys

If C2PA (or any signature) is used, the **signing key and certificate chain live in the control plane**, never in an agent sandbox. C2PA attests origin and edit history but is **not "permanent"** (re-exporting can strip it, and validation depends on the trust list). Keep your own content-addressed manifest authoritative and C2PA supplementary.

### 13.5 Approval and identity as GitHub facts

Approvals for assets and lore come from authenticated PR reviews under branch protection with CODEOWNERS on the relevant paths, read from the GitHub API. The agent cannot write approval metadata. A "cryptographically signed waiver" requires a defined mechanism (who signs, with what key, verified where); if it is an authenticated control-plane record, say that.

### 13.6 Authentication and authorization on dispatch

The dispatch endpoint can spend real money up to the circuit-breaker limit. It needs strong caller authentication (short-lived credentials, not a static secret), per-caller rate limits and spend caps, an audit log of every dispatch with caller identity, and **per-caller scope** (which shots which caller may dispatch). Idempotency stops accidental duplicates; it does nothing against a stolen credential. This has been open for many rounds and is the largest unaddressed gap on the spend path.


---

## 14. Data model (DDL) and contracts

### 14.1 Principles

- **One authoritative DDL with migrations.** Every table and column the code touches must exist in it. Across many revisions, code referenced columns and tables (`head_sha`, `pr_number`, `target_repo`, `failure_reason`, `task_specs`, `system_flags`, `idempotency_keys`, `transaction_audit_log`) that the published schema lacked.
- **Constraints are the ledger's trustworthiness.** Use `CHECK` enums, foreign keys, numeric-range checks (`attempt_number >= 1`, `max_attempts >= 1`, `cap_charged_usd >= 0`), and composite primary keys. Confirm `PRAGMA foreign_keys = ON` in your D1 environment and note that FK checks cost on the hot path.
- **Unit-suffixed timestamps** (`_ms`) so mixed seconds/milliseconds (Slack uses seconds) cannot creep in.
- **Add indexes** for the reconciler's scans (`status, updated_at_ms`; `status, handler_lease_expires_at_ms`), outbox `next_retry_at`, `shadow_violations.human_disposition`, branch name, and head SHA.
- **Version the schema and the contracts.** `contract_version` on every task record, `schema_version` in Durable Object storage with a lazy upgrade on first access (in-flight tasks meet new code during deploys), and a stated rule for mixed versions (drain, migrate, or reject). Include a migration tool and a down-migration policy.
- **Name projection fields for what they are** (`last_projected_epoch`) so nobody mistakes D1 for the authority.
- **Constrain free-text analytics columns** (`shot_class`, `resolution`, `compute_tier`) with `CHECK` enums so stratified analysis does not fragment on typos.

### 14.2 Core tables

| Table | Purpose |
|---|---|
| `idempotency_keys` | Edge transport dedupe; PK `(scope, delivery_key)`; lease columns; retention |
| `tasks` | Immutable spec: `task_id`, `contract_version`, `target_repo`, `scene_id`, `shot_id`, `payload_fingerprint`, `file_whitelist_json`, `forbidden_patterns_json`, `max_attempts`, `current_attempt_number`, `current_status` (denormalized so hot queries do not scan attempts) |
| `task_attempts` | One row **per attempt** (`UNIQUE(task_id, attempt_number)`): branch, `base_commit_sha`, `head_sha`, `pr_number`, `last_projected_epoch`, status, `exit_reason`, diagnostics. A single lease row keyed by task overwrote per-attempt history |
| `task_events` | Append-only audit log of every transition: from, to, event, actor, epoch, diagnostics. Written as a byproduct of the choke point with a **deterministic event ID** and `ON CONFLICT DO NOTHING` |
| `approvals` | One-shot approvals: `UNIQUE(task_id, head_sha)`, decision, decider, timestamps |
| `system_flags` | Mirror of kill switch and config for observability; the DO is authoritative |
| `operational_telemetry` | Stratified cost: `cap_charged_usd`, `estimated_actual_usd`, `contract_version`, `manifest_id` (reference the provenance manifest, do not duplicate model fields), tier, attempt |
| `shadow_violations` | Labeled shadow-mode data (Section 10.7) |
| `grievance_runtime_state` | Runtime narrative state (Section 16) |
| `institution_knowledge_horizons` | Author-knowledge ledger for in-world documents |
| `waivers` (proposed) | Unified waiver ledger: what, which shot, who approved, expiry, reason |
| `repo_audit_state` | Accountability sweeper state (Section 15) |
| `infrastructure_telemetry` | Canary time series |
| `canon_entities` (+ standing columns) | Tri-state canon lifecycle |

`transaction_wal` was defined in early drafts and never driven by code; if a WAL is wanted it must actually be written by the saga (`PREPARED → COMMITTED | ABORTED`), and it needs `candidate_commit_sha` and the lease/epoch. A D1 outbox duplicating the DO's outbox creates two authorities; keep the DO's as authoritative and, at most, a read-only mirror in D1.

### 14.3 The dispatch contract

Clients submit **references and creative bounds**. The **server supplies facts.** This is the general rule: *the agent supplies references, the server supplies facts.*

- Client input: `idempotency_key`, `task_id`, `contract_version`, `scene_id`, `shot_id`, `template_id`, `payload_fingerprint`, and template-specific fields. `.strict()` everywhere (Zod's equivalent of `additionalProperties: false`).
- **Discriminated union on `template_id`**, so each template carries only the fields it uses (a whole-shot text-to-video request should not invent a meaningless bounding box and frame range).
- The server resolves from the **ledger**: `duration_ms`, `native_fps`, plate dimensions, the shot's file whitelist and forbidden patterns. A client-supplied duration lets an agent request any frame count by forging a matching duration. **The lookup fails closed** when the shot is missing, and it rejects a `scene_id`/`shot_id` pair where the shot does not belong to that scene. The provenance of the whitelist must be the shot's declared scope in the ledger (or the spec file), never anything in the request.
- **Frame count is server-derived, not client-validated.** A refine that recomputes the value from the same facts used to produce it is a tautology and can never fail. Either derive it server-side (honest) or accept a client `expected_frames` purely as a cross-check.
- **Bounds are checked against real plate and clip dimensions**: bounding box within canvas, frame range within the derived allocation. Fix the interval convention explicitly (half-open `[start, end)`), name the field accordingly, and test the boundary.
- **The fingerprint** must be computed by the server from a canonicalized request and include **every** template's variant fields (`prompt_override`, `anchor_id`, `driving_audio_stem`); a fingerprint that omits them makes two different requests collide. Canonicalization is a key-sorted recursive JSON serialization in the JCS style; **do not claim RFC 8785 conformance** without checking the published test vectors (number and Unicode edge cases). Publish test vectors so client and server agree.
- Task ID format, branch encoding, and parsing regexes come from **one shared constant** (a case-sensitivity mismatch between lowercased branch names and an uppercase prefix check made every legitimate bot PR bypass the audit).
- Typed errors with codes mapped deterministically to HTTP statuses; security-classified errors write to an audit table. Use `safeParse` and normalize; plain `Error` strings force callers to parse messages.
- Model identity and native fps belong in **per-model configuration** keyed by template, not baked into an enum (drafts alternated between Wan 2.1 and 2.2).
- **Authorization** on who may dispatch which shots is required (see 13.6).

### 14.4 Frame-count mathematics (the corrected rule)

Video diffusion models with 3D causal VAEs often require frame counts on a `4n+1` lattice. **Round up**, never down:

```
N                  = ceil( (duration_ms / 1000) * native_fps )
diffusion_allocation = 4 * ceil( (N - 1) / 4 ) + 1
audio_target_frames  = ceil( (duration_ms / 1000) * delivery_fps )     // delivery_fps = 24
```

Worked example: 3,120 ms at 16 fps native gives `N = ceil(49.92) = 50`, `allocation = 4·ceil(49/4)+1 = 4·13+1 = 53`. Generate 53 frames, **trim to 50** (matching the audio duration), then **resample** to the 24 fps delivery clock: `audio_target_frames = ceil(3.12·24) = 75`. The **flooring** form `4·⌊N/4⌋ + 1` yields 49 for `N = 50` (shorter than the audio) and reappeared in several documents after being corrected; it is a lip-sync defect.

Nuances:

- Keep **`plate_frames` (native, on the lattice)** and **`delivery_frames` (24 fps, from audio)** as two distinct quantities with an explicit **conform step** (trim, then resample) recorded in the manifest so a future re-render uses the same conform. RIFE-style interpolation from 16 to 24 fps hits 75 frames only because the *target* is derived independently from audio duration; do not compute it by multiplying the native count by 1.5 (odd native counts do not divide evenly).
- The conform depends on native fps: 24 to 24 is identity, 12 to 24 is a clean 2:1 duplication, 16 to 24 needs interpolation or a pulldown pattern. Make it a lookup keyed on native fps.
- The `4n+1` rule and the native fps are **properties of the specific model and node you deploy.** Put them in per-model configuration and verify; do not state them as facts about all video diffusion models. Different latent-video nodes may differ.
- Truncating the trimmed tail is justified by **duration alignment**, not by an assertion that the tail is lower quality (that is model-dependent and should be measured).

### 14.5 Contracts elsewhere

The same pattern (server-resolved facts, strict schemas, typed errors, fingerprints) applies to the narrative shot-node AST, sprite manifests, and provenance manifests. Each schema is versioned.

---

## 15. Scheduled maintenance and reconciliation

The `scheduled(event, env, ctx)` handler with explicit cron expressions turns the bot into an autonomous maintenance daemon. **This handler has been dropped from pasted artifacts more than once**; keep the artifacts in a repository with CI so a regression fails a build instead of silently vanishing.

### 15.1 Cadence

| Cron | Job | Objective |
|---|---|---|
| `0 * * * *` | Reconciliation and pin-drift audit | DO vs D1 vs GitHub divergences; reclaim expired idempotency rows |
| `0 0 * * *` | Rolling archive scrub | Deterministic hash cursor over R2 |
| `0 3 * * *` | Garbage collection | Orphaned leases, branches, staging objects; idempotency retention |
| `0 9 * * *` | Accountability sweeper | Commit-dormancy audit |
| `0 4 1 * *` | GPU canary | Monthly provider-drift benchmark |

A reconciler more often than hourly may be warranted; orphaned PRs matter sooner.

### 15.2 The reconciler (needs a written spec before code)

It is the mechanism that makes every "eventually" true. Every sentence of the form "the hourly cron will catch it" is a promise with no code until it is specified. It should:

- Scan non-terminal tasks older than their expected duration.
- Compare **D1, the DO, and GitHub** (open PRs, branches, checks) and repair divergences by firing the *legal corrective event* (which is why `RECONCILER_EXPIRY` needs rules), or alert on anything it cannot repair.
- Known divergences: an orphaned PR whose lease is `ROLLED_BACK`/`DLQ`; a DO holding an active lease that D1 flagged aborted; a failed projection write; dead-lettered outbox actions; reservations older than the maximum task duration; unarmed alarms; rows stuck `PROCESSING` past their lease; PRs on GitHub with no processed record (dropped webhooks).
- Priority and **shared rate limiting**: reconciler traffic is low priority with a hard API budget so a post-outage sweep cannot exhaust GitHub quota and starve live audits. Prefer reading GitHub's `x-ratelimit-remaining` headers over maintaining a drift-prone parallel counter; persist any bucket (DO memory is lost on eviction). Respect secondary rate limits and `Retry-After`.

### 15.3 Garbage collection

- Expired distributed leases: requeue if attempts remain, else DLQ.
- Ephemeral `spec/**` branches older than 48 hours with no open PR and no active lease.
- **R2 staging objects** deleted only if past a grace period **and** an authoritative-manifest check proves **zero canonical manifests reference the hash**. Also reap unpromoted epoch-keyed objects (no DO promotion record).
- Expired signed upload URLs, abandoned proxies.
- Prune the idempotency table.
- Surface dead-lettered items (the DLQ triage: aggregate error trajectories into one diagnostic summary for the lead).
- Dead letters accumulate forever otherwise; nothing alerts.

### 15.4 The accountability sweeper

**The problem:** solo operation risks *invisible dormancy*. Conventional CI reacts only when code is pushed; this monitors silence.

- **State in D1**, not a file committed back into the repo (the earlier GitHub Action had to commit `digest_state.json` into trunk, generating history noise).
- **Relative windows per repository**: a stable config package should not be judged by the clock of a runtime engine. Example windows: engine 48 h, viewport 72 h, bible 96 h, visual assets 120 h, config/project 168 h.
- **Stale multiplier** `M = elapsed / window`. Tiers: Active (< 1), Quiet (1 to 2), Stale (2 to 3), Critical (≥ 3).
- **Escalation rule (corrected):** page on `M ≥ 3.0` alone; use consecutive-flag count only to control **re-notification cadence**, not as an alternate trigger. (The original OR rule pages a mildly quiet repo after three days of flags; the later AND rule is too lazy for a severe gap.)
- **Snooze with expiry and reason**, recorded and visible in the digest, and a `dormant_by_design` flag. "No manual dismiss, only commits reset the counter" is gameable with empty commits and pushes operators to mute the channel; a visible time-bounded exception preserves accountability without inviting gaming. Also measure **substantive** activity (merged PRs, diff size, open-PR and CI status), not just commit recency, and count pushes to any branch as signs of life.
- **Single channel principle:** post activity and silence alerts to the same channel so an empty stretch interrupted by a red block creates visible friction.
- **Compose messages only from facts the bot has** (days since last commit, last commit message and author, open PRs, failing CI). A "confrontation" that asserts *which file* was left half-implemented is fabricated specificity, the kind of false confidence the design rejects. Ask a question; do not assert one.
- "Fraud-proof" and "unyielding" overclaim.
- Optional: on Critical with a broken last build, open a **diagnostic-only** triage task, not an autonomous fix.

### 15.5 Pin drift and lockfile verification

- Read the meta-repo `versions.json` and check via the GitHub API (not `git ls-remote`) that pinned SHAs and tags still resolve and match dependents' heads. Pinning by exact ref (not a moving `main`) is the point.
- A newly approved upstream release may **propose** a bump PR in downstream consumers under a narrow spec, with the tests running before merge. Squash-merge changes SHAs, so pins must reference the resulting commit.

### 15.6 Canon staleness

Three classes: **mechanical compilation drift**, **epistemological calcification**, **omission drift** (see Section 16.8). For mechanical drift:

- **Do not compare commit timestamps.** Squash merges, rebases, and unrelated edits invert or spuriously trigger it, and it has both false positives and negatives.
- **Compare tree hashes.** The compiler records the **commit SHA it compiled and the Git tree SHAs** of the source directories inside `compiled/`. The sweeper reads the current tree SHAs from the GitHub trees API (take the entries for `characters`, `grievances`, `world` from the root tree; mind the `truncated` flag) and tests equality. Exact and timestamp-free.
- On mismatch, dispatch a **deterministic CI job** (`npm run compile`), not an agent, and open a sync PR that flows through the normal path policy. `compiled/` is derivable, so it can auto-merge after the gate.

### 15.7 Infrastructure canary (summary; detail in Section 19.5)

Three-run cold benchmark, a fixed baseline plus trailing window, a confirming rerun before any lock, hard budget limits separated from statistical drift alarms.

---

## 16. Narrative content layer

### 16.1 The grievance corpus

**Core claim:** leaving *what characters fight about* to per-scene improvisation is the largest abdication of authorship. A finite, human-authored, schema-validated library of "loaded objects" that recur, mutate, and resolve gives continuity across episodes, auditability, and authorial control at the right point (the human decides the shape of every conflict once; the model realizes scenes within bounds). Target roughly **40 to 60 entries across 6 to 8 categories**, small enough for a solo author to finish. A corpus you cannot finish authoring is worse than a smaller one you can.

**Dual rails.**

- **Machine rail (frontmatter):** IDs, typed references, primary/can-involve/cannot-involve participants, an intensity envelope `[min, max]`, cooldown, decay, typed spawns, flags. The runtime matches with set operations, no natural-language parsing:
  `Eligible = (SceneCast ∩ Primary) \ Excluded`, subject to `Intensity ∈ [min,max]` and `Cooldown = 0`.
- **Voice rail (markdown body):** surface argument, "the underneath," tone, escalation path, callback phrases. Injected into prompts. The model is told to escalate the *surface* argument while suppressing explicit mention of the *underneath*.

**Corrections that are part of the design now:**

- **Frontmatter must be the first thing in the file.** A heading above the `---` block means `gray-matter` will not recognize it, so the file would not compile. Run sample files through the compiler as fixtures.
- **Strip citation markers** (`[cite: 1]`) leaked from a citation system; lint for them.
- **Typed spawn targets** `{type: grievance | secret, target_id}` with per-type foreign-key checks; untyped ID strings pointing at multiple entity types cause silent dangling references. The compile-time check is "exists in the corpus"; whether a target is *active* is runtime state.
- **Split authored definitions from runtime state.** Definitions are append-only, human-reviewed Git files. Runtime state (status, cooldown counters, escalation stage) lives in `grievance_runtime_state` in D1, keyed `(grievance_id, episode_id)`, updated by a **deterministic rule engine** (`C_{t+1} = max(0, C_t - 1)`) at scene completion, never by an LLM agent writing commits. This avoids commit churn, merge conflicts between concurrent episodes, PRs about state polluting PRs about authoring, and the Deletion Principle boundary violation.
- **Enumerations need defined semantics** (`decay_rate`, `tone`), and every schema field the runtime reads must be documented.
- The declared category count, the category table, and the frontmatter schema (including `tonal_override_eligible`) must agree.

**Enforceable craft gates.**

- **4-Outcome test → `outcome_sketches`.** Require four non-empty sketches (clean win, costly win, mutual wound, backfire) in the schema, lint for presence and distinctness, and check that each contains an explicit **state delta** (who gains or loses what). A machine cannot judge whether a grievance "can sustain four scenes"; it can require that the four authored sketches exist and differ. An embedding-distance floor (for example cosine distance above 0.25) is a *floor* and needs calibration on known-near and known-distinct pairs; it cannot tell four structurally different outcomes from one outcome reworded.
- **Redaction test → stylometric attribution accuracy.** The human blind-attribution exercise cannot run in CI. The mechanical proxy is a **per-character stylometric profile** (sentence-length variance, function-word distribution, monosyllabic ratio, punctuation habits) with a classifier trained on each character's authored lines and **held-out attribution accuracy** as the measure of distinctness. Lexical overlap alone is a weak proxy (two characters can share no distinctive words and sound identical in rhythm). Require a **minimum line count** before the check means anything; report "insufficient data" instead of pass/fail. Keep a periodic human blind-attribution audit.
- **Tonal override pool.** Deliberately shallow entries (`tonal_override_eligible: true`) whose `underneath` is literally "There genuinely isn't one. This is the point." Shallowness must be authored on purpose so the model does not inflate a button dispute into profundity. Lint that the flag and the special contract agree; cap the pool (roughly 10 to 15% of the library) as a warning band, not a hard failure.
- **Coverage report** from the compiler: grievances per category, character pairs with no eligible grievance (N characters have N(N-1)/2 pairs; a corpus concentrated on a few pairs leaves the rest with no material), escalation ceilings by category, spawn-graph depth, orphan grievances that nothing spawns and no scene can select, tonal-override count.
- **Voice check** in the compile output.

### 16.2 The compiler

Three passes:

1. **Shape and scalars** (Zod with strict schemas): intensity bounds, cooldown integers, enums, duplicate IDs are fatal.
2. **Relational integrity and DAG acyclicity**: every participant resolves to a character file; every spawn target resolves; DFS with recursion tracking over spawns to forbid cycles.
3. **Deterministic sealing**: recursively sorted keys, byte-stable JSON, the universal state hash `H_root`, recorded source-tree SHAs. `git diff --exit-code compiled/` is the drift tripwire.

Downstream runtimes consume only compiled state; raw markdown is never ingested at runtime.

### 16.3 The dual-artifact screenplay pattern

Human directors need reviewable prose (Fountain); pipelines need a typed AST. The **corrected pipeline is extract-then-verify**, not single-pass dual output:

1. **Unconstrained screenplay generation** (Fountain) at normal temperature.
2. **Structured extraction** at low temperature with constrained decoding into a shot list matching the schema.
3. **Verbatim parity assertion** before any TTS or render: every spoken line in the Fountain equals the corresponding shot `dialogue_text` after normalization. A count mismatch or text mismatch halts the pipeline.

**Why not single pass.** Forcing a long prose script inside a JSON string degrades prose quality (escaping induces repetitive structure and unnatural rhythm), and it creates the very parity problem the test then guards. Extract-then-verify makes the parity check meaningful.

**Constrained decoding guarantees syntax, not meaning.** A grammar (GBNF) or JSON mode ensures well-formed output. It says nothing about whether `character_id` exists, whether `emotion` is in the allowed set, whether foley cues are in the registry, or whether `dialogue_text` matches the script. Enums encoded in the grammar are valid for those fields only; free-text fields are unconstrained in meaning. Constrained decoding can also degrade quality by forcing low-probability tokens. Schema, enum, foreign-key, and parity checks still run.

**Shot node contract:** `shot_id`, `speaker_id`, `dialogue_text`, `parenthetical`, `emotion_tag`, `foley_cues`, `camera_intent` (framing, motion, focus target), `action_context`, `extracted_motor_actions`. Foley cues resolve against a registry; foley variants are resolved at **generation time** (Section 17.4).

### 16.4 Somatic, logistical, and epistemic invariants

**Three typed state vectors** (somatic, logistical, epistemic) live in the ledger as one medium-agnostic check, then project into text, image, and audio constraints. Because invariants reference *state*, not frames or paragraphs, a physical impossibility (a paralyzed arm doing a two-handed task) is checked once against the ledger and then constrained in each medium.

**The self-reporting trap.** A model producing both the action array and the prose can claim compliance in one while violating it in the other (`["LIMP"]` with "he vaulted the fence").

**Why verb lists fail.** A banned-verb list is a lexical proxy for a physical constraint. It is evaded by synonyms ("bolted," "scrambled"), light verbs ("made a run for it"), and nominalizations ("a sprint across the yard"), and by *implied* constraints ("Silas hoisted the 50-pound drum onto the wagon" passes a verb filter but physically requires two arms). It also false-positives on "a dash of salt," "sprinkler," and the negation trap ("his dead fingers could not grip" accurately depicts an injury).

**The capability-resource model.** Replace surface matching with a resource budget:

- Entities carry **capabilities** (arms available, mobility class, visual acuity, speech capacity).
- Actions carry **requirements** over those capabilities.
- The primary check is `ArmsRequired(action) ≤ ArmsAvailable(entity)`, `MobilityRank(action) ≤ MobilityRank(entity)`, etc.

Refinements:

- **Per-limb capability** (left arm paralyzed, right arm full) is more faithful than an integer count and composes with the logistical vector ("torch in the left hand" and "left arm paralyzed" are the same resource). Actions then require a *set of limb slots* at minimum function levels.
- The **discrepancy gate** between the declared array and independently extracted prose actions should fire only on actions that **consume constrained capabilities**. Disagreement about a "glance" is noise; disagreement about a two-handed lift is a violation. A blanket symmetric-difference halt over-fires.
- **Negation-aware dependency parsing** reduces false positives but does not eliminate misclassification: counterfactuals ("if he could vault the fence"), hypotheticals ("he might have sprinted"), reported speech, negated-then-affirmed sequences ("couldn't run, so he ran anyway"), and figurative language ("his heart sprinted") all defeat simple scoping. A **false negative** is the dangerous direction.
- **The independent extractor is itself a classifier with an error rate.** Two noisy signals disagreeing is strong evidence of a problem; both agreeing is only moderate evidence. Measure the pair on a labeled set with planted violations (including synonymy and negation cases), report precision and recall, and keep a human review sample of *passed* scenes to estimate the false-negative rate.
- The hard set (somatic, logistical, epistemic) is high-precision and lower-recall by construction. The critic tier and human review catch what it misses. Style and pacing (MRU ordering, filter verbs, participial chains, crutch density, sentence-length variance) remain **advisory** with logged overrides, because these are matters of taste with legitimate exceptions.
- `O(1)` set intersection is really `O(min(n, m))`; the point (cheap and deterministic) stands.

**Epistemic checks.** "Ignorance by omission" (the secret is never placed in the entity's context) is more robust than checking outputs afterward and should be the primary defense, with the output check as a backstop for a model *inferring* a secret from other facts. Epistemic entailment ("does this line reveal the secret?") is semantic; a character can reveal a secret without using any of its tokens.

### 16.5 The pre-flight feasibility check

Before dispatching generation or repair, check that the scene's required beats are jointly satisfiable under the active constraint vectors.

- A **single capability comparison** (bimanual pull with one functional arm) needs no SAT: it is `2 > 1`.
- **SAT or a small integer program earns its keep for combinatorial resource conflicts** (only two hands, but the scene requires holding a torch, drawing a weapon, and opening a door within one beat).
- It requires the scene's **blocking as a structured beat list**: who holds what, where each character is, what each knows at each beat. Prose cannot be fed to a solver.
- This is the same structured beat and state-tracking format the seam-continuity check silently requires. Three of the strongest controls (capability check, feasibility check, seam continuity) depend on it, and it is not yet specified.
- The result: report conflicting constraints **with provenance** to the scene architect for zero token cost, instead of discovering infeasibility by running an agent three times.
- Also model constraints so the pre-flight can express them: pair a feasibility check with a **conflict explanation** naming the originating scenes and commits.

### 16.6 Surgical prose repair (Minimal Enclosing Unit)

Regenerating a 3,000-word scene to fix one paragraph introduces drift into adjacent dialogue and staging. Surgical repair shrinks the **blast radius**. It does **not** eliminate nondeterminism: the infill is itself a stochastic generation, only over a smaller window.

**Asymmetric closure.**

- **Backward scan collects constraints, does not expand the span.** Paragraph 2 establishes that Elias holds an empty canvas bucket; that becomes an immutable constraint (`BUCKET_IN_HAND`) while paragraph 2 stays frozen.
- **Forward scan expands the span.** If paragraph 4 depends on the character having reached the valve by sprinting, paragraph 4 is pulled into the edit window.
- `MEU_Span = [k, max j]` where `j ≥ k` and `Refs(u_j) ∩ Mutations(u_k) ≠ ∅`. (The original formulas contradicted their own example by pulling upstream anchors into the span.)
- **`Refs` and `Intro` are undefined until you specify an entity-linking step.** Computing what a paragraph introduces and references is information extraction (coreference, implicit references, pronouns) with its own error rate. Specify the extraction pass with a schema, cache it per paragraph, test it, and **decide contiguity versus transitive closure explicitly.** Contiguity gives tight repairs but misses distant dependents (paragraph 9 references an entity introduced in 3 with 4 to 8 unrelated); transitive closure is correct but may explode. Cap the maximum span (**about 40% of the scene**); beyond it, a "surgical" fix is a rewrite and escalates to a human.
- Prose dependency is fuzzier than code dependency; for code, the type checker or call graph gives real dependencies.

**Infill payload.** Prefix, target, suffix, mandatory invariants, entities that must persist, "emit replacement text only." The agent overwrites only the coordinate range, then reruns the invariants and the compile.

**Seam verification gate (after infill).** The seam is where new text meets the frozen suffix, and where continuity errors appear (a repair that satisfies the invariant locally but subtly changes tone, tense, pronoun reference, or a physical detail the next paragraph assumed).

| Check | Reliability | Handling |
|---|---|---|
| Tense and formatting consistency | Mechanically checkable (part-of-speech pass) | Hard gate |
| Pronoun coreference across the splice | Requires a resolver with error | Flag for review with confidence |
| Physical continuity (positions and held items match what the suffix expects) | Requires structured state tracking | Flag for review; needs the structured beat format |
| Re-run of the verbatim parity test across the concatenated scene | Deterministic | Hard gate |
| Re-run of hard invariants over the *joined* text | Deterministic | Hard gate |

### 16.7 Forensic artifact fiction

**Concept.** Instead of describing events in prose, compile in-world **primary evidence** (autopsies, impound slips, flight logs, deeds, bail forms) from ledger state deltas. Meaning is generated by the **forensic gap**: friction between objective database truth and a falsified in-world document. The generator acts as an in-universe clerk translating state transitions into rigid bureaucratic records, which constrains it to a dry register where hallucination is easy to detect.

**Pipeline.** Canonical state delta → bureaucratic JSON emitter → **typography by a typesetter** (Typst) and **texture by diffusion** → composite and audit.

- **Decoupled typography and texture.** Diffusion never draws letters (the *zero-diffusion-text rule*). A deterministic typesetter draws all text, misaligned typewriter strikes, official seals, and black-bar redactions; diffusion supplies only background material (paper, stains, carbon smear). Seed the per-glyph jitter from the artifact ID so the artifact is reproducible; state which stages are reproducible and which (diffusion textures) are archived.
- **Diegetic invariants** table: logistical (rounds of ammunition on an impound slip versus the ledger), somatic (arm intact in an autopsy of a character with a severed plexus), epistemic (a clerk naming a secret location the world has not revealed), timeline (a 1982 ledger referencing a laser barcode).

**The declared-lie model (resolving a contradiction).** A forensic document is *supposed* to lie, so "must match the ledger" is the wrong test. Use a three-tier truth contract:

1. **Truth layer:** the document's explicit truth field must equal the ledger (`SuppressedTruth ≡ LedgerFacts`).
2. **Declared divergences:** every difference between the official content and the truth must appear in an authored **conspiracy manifest** (`DocumentDivergences ⊆ DeclaredDivergences`). Unregistered divergence is a hallucination and is rejected.
3. **Authored clues:** deliberate errors meant for the audience (an outdated header, an impossible lab date) are registered in the manifest and must be present. Planted contradictions are **authored clues, not improvisation**; uncontrolled, they produce accidental canon breaks or clues no reader can verify.

Supporting data:

- A **conspiracy manifest schema** and authoring workflow (divergence list, clue list, institutional motive) is required and not yet specified.
- **Author-horizon check.** A document author cannot cite what they do not know. Use an `institution_knowledge_horizons` table (`institution_id`, `fact_id`, `learned_at_episode`, `clearance_level`) and check every non-redacted entity against it. Its maintenance is unspecified (who populates rows, per episode by the state-delta process).
- **Redaction geometry.** Redactions are bound to ledger keys flagged classified. **Redact by omission:** never emit the classified text into the typesetting stream; emit a black box sized to the character count. Black bars over live text leave the string recoverable by copy-paste or `pdftotext`. Verify with `pdftotext` (and an image-level check if rasterized) that no redacted token survives. Be consistent about which artifacts are distributed as vector PDFs versus flattened rasters.
- **PDF/X-1a** is a print-exchange standard with constraints (embedded fonts, no transparency, specific color handling). Alpha-blending typography onto a raster plate with a perspective warp flattens to a raster inside a PDF wrapper, at which point "vector typography" no longer survives. Say what the deliverable actually is; verify Typst's PDF/X support before committing.
- Typewritten forms are fixed-pitch and ragged-right, so optimal line breaking is irrelevant to that look; use a monospaced font on a fixed grid.
- **C2PA** manifests (Section 13.4) link the artifact to episode ID, canonical state hash, and authorizing commit.

### 16.8 Canon staleness and the "Still Good" protocol

| Class | Cause | Detection | Consequence |
|---|---|---|---|
| **Mechanical compilation drift** | Source edited, `compile.ts` not run | Tree-hash comparison; recompile-and-diff | Downstream reads stale JSON |
| **Epistemological calcification** | A flawed early fact passes every check forever and accumulates dependents | Blast-radius score | "The Silent Prison": bad facts permanently constrain later writing |
| **Omission drift** | A finished episode's state delta never committed back | Reconciliation against release manifests | Later episodes draft against an obsolete timeline |

**Calcification** is the sharp insight: downward consistency checks confirm scenes match canon; nothing asks whether canon is *good*, and automation removes the natural friction (people re-reading old material) that used to catch bad decisions. Score it: `Audit Priority = DaysSinceReconsideration × log10(DownstreamScenes + 1)`. High-scoring facts surface on the showrunner's dashboard.

**Tri-state standing:** `ACTIVE_ENDORSED`; `FLAGGED_FOR_REVIEW` (the liminal state: **zero cascade propagation**, downstream scenes stay green, an advisory badge appears); `DEPRECATED_ARCHIVED` (triggers an atomic invalidation cascade). Raising doubt is decoupled from acting on it. **"Still Good"** is a 5-second affirmation that resets age (updates `last_reconsidered_at`) without touching the fact hash or dirtying anything, keeping review cheap enough that people will do it.

**Graph telemetry:** a long zero-degree tail (a large fraction of entities with in-degree at most 1) means decorative worldbuilding clutter (compile a pruning queue); hyper-concentration (one prop carrying most dependencies) is a single point of failure. Dependency propagation fires only on *modification*, which is the invalidation blind spot.

**Dirty-dependency invalidation** (continuity as cache invalidation) is sound: when a fact is mutated, downstream scenes whose `pinned_version < max_version` are flagged dirty and downgraded, and dispatch returns 409 before any GPU spend. It needs an explicit **re-pin** action so a writer can decide "this change does not affect that scene," or dirty flags become noise people override. It also needs a stated trigger (webhook or poll), granularity (per-entity or per-scene dependency set), and a policy for in-flight renders when a dependency changes mid-job.


---

## 17. Media layer: source-baking, camera, audio, compositing, QA

**Framing.** Remotion models a timeline as a deterministic React component tree, `f(frame) → JSX`. Treating the timeline as **source code rather than an opaque binary** turns editorial decisions into reviewable diffs and lets a human edit any episode without touching the shared engine.

### 17.1 Source-baking (the "eject button" pattern)

**The failure mode it prevents.** A long-lived generic player that interprets a data file (`scene.json`) at render time couples every historical episode to the current version of every shared component. Change `GoblinPuppet.tsx` for episode 40 and a re-render of episode 12 silently changes: visemes misalign, crash zooms miss faces. The archive *appears* reproducible (you still have the JSON) while the interpreter moved underneath it.

**The mechanism.** A generator (`generate-episode-repo.ts`) performs **compile-time code generation**: it reads the dialogue AST, `ffprobe` audio durations, and asset manifests, quantizes time, accumulates timeline offsets, and emits an immutable committed `Episode_XXX.tsx` with **literal** frame counts, pixel anchors, and volume curves. No `fetch()`, no runtime JSON, no filesystem reads.

**Benefits.**

- **Diffable review.** A staging change is a diff of explicit JSX props, not deciphering a 4,000-line JSON blob.
- **The eject button.** A director opens `Episode_XXX.tsx`, hand-tunes an interpolation curve, splices an SVG filter, or inserts a blink, with no change to shared engine code.
- **Provenance manifest** ties source to inputs.
- **Time quantization once, at generation.** `target_frames = ceil(duration_ms/1000 × 24)` computed from measured durations and printed as a literal. Deriving offsets from **audio duration** is the correct dependency direction (audio has a physical length; video fits it).

**What baking does NOT freeze (critical).** The episode file imports shared components (`GoblinPuppet`, `AmbientTrack`) by **relative path from a sibling repository at whatever commit is checked out**. The timeline is baked; the renderer still drifts. The manifest also omitted the viewport commit and the render environment. Choose one isolation strategy:

| Strategy | Strength | Cost |
|---|---|---|
| **Vendor** the components into each episode at bake time | True self-containment; strongest reproducibility | Fixes to shared components never reach old episodes (may be exactly what you want; re-bake deliberately) |
| **Pin as an immutable, version-pinned package** (`@studio/viewport@1.4.2`) | One copy of code | Must keep every published version installable forever |
| **Pin as an exact submodule commit** | Lightest | Depends on the upstream never being force-pushed or deleted |

For an archive whose purpose is permanence, vendoring is the safest default. Add a CI check that fails if an episode's recorded component version differs from what it resolves against.

**Provenance manifest must record** (beyond upstream commits): the **viewport commit/version**, the **render container digest** (the earlier manifest named the *diffusion* container, not the Remotion render container), the **Chromium build**, **FFmpeg library versions**, **font file hashes**, the **style-rule table version**, parser/extractor versions, and asset hashes. Pixel output depends on the rasterization environment, not just the source.

**Generated-code hazards (each caught in review).**

- **String props:** printing `durationInFrames="{75}"` passes the string `"{75}"`, not a number, and crashes numeric-expecting components. Emit `durationInFrames={75}`.
- **`useCurrentFrame()` scope.** It returns the frame **relative to the nearest enclosing `<Sequence>`**. Calling it once at the episode root and reusing that global frame inside a later sequence produces out-of-range interpolations (shot 2 at frame 81 evaluates as frame 81). Emit a **dedicated per-shot sub-component** so the hook evaluates locally from 0, or subtract the sequence offset explicitly. A lint (no `useCurrentFrame()` at the composition root) should enforce it. This bug passes type checking.
- **Component API mismatch.** The generated call site passed `activeDialogueWindows`/`duckToDb`/`src` while the reference component took `dialogueWindows`/`ambientFile`/`baseVolume`/`duckedVolume`. It would not compile. Give each component (`AmbientTrack`, `GoblinPuppet`, `CameraRig`) **one typed, versioned interface** the generator imports and is compile-checked against.

**Generator lint suite (enforce "no runtime nondeterminism" as build failures).** Numeric JSX props; no `useCurrentFrame()` at the root; no `Math.random`, `Date.now`, `fetch`, or filesystem access; every component import resolves inside the episode directory (vendored) or to a pinned version; every `staticFile` path exists and matches a hashed asset in the manifest; every easing name is from a closed enum. Run on every generated and patched file with `tsc --noEmit`.

**Generator conformance tests.** Snapshot tests: fixed AST + audio + asset manifest emits an exact expected TSX; regenerating an unmodified file is a no-op; regenerating a modified file yields a candidate and leaves the original intact; CRLF, formatter, and agent-patch cases; a file labeled `generated` whose body does not match a fresh deterministic regeneration is **downgraded**.

### 17.2 The sealed-file convention and lifecycle

**Collision protocol.** When regeneration is requested: if the file has `@locked`, refuse; if `@generated`, compare the SHA-256 of the body to the header checksum; a match means safe to overwrite, a mismatch means a human edited it, so emit `Episode_XXX.candidate.tsx` (or a patch) beside it and refuse to clobber. This protects human polish without forbidding regeneration.

**Three lifecycle states** (not a single lock flag), recorded in the header:

```
// @lifecycle: generated | patched | locked
// @checksum: <hash>
// @patch_history: ["QA-EP040-SH03-VISEME_ALIGN"]
```

An agent patch stamps `patched` and appends its ticket ID. The PR audit's rules: `generated` auto-merges after gates; `patched` merges automatically only if an **AST diff confirms changes are confined to the ticket's targeted `<Sequence>` and props**; `locked` is never agent-writable and human edits go through a human PR (approval is a GitHub review, not a Slack click).

**Checksum hazards.**

- **Line endings.** Git checkout converting LF to CRLF changes bytes and makes an unmodified file look edited. Normalize to `\n` (and strip trailing whitespace) before hashing, or set `.gitattributes` (`* text=auto eol=lf`) for the generated directory.
- **Formatter churn.** Prettier/ESLint `--fix` rewrites spacing and quotes and breaks raw-byte checksums. The **simplest robust fix** is to exclude generated files from formatters (`.prettierignore`, ESLint override) and treat any formatter run on a generated file as a lint failure. An **AST hash** is an alternative but needs a canonical serialization that excludes location and comment metadata, a **pinned parser version** recorded in the header (a tooling upgrade otherwise invalidates every checksum), and a decision about comment-only edits (an AST hash ignores comments, so a human who edits only comments is not detected and a later regeneration silently discards them; hash comments separately if they count as edits).
- **`@locked` is honor-system** unless the audit enforces it: add locked episode paths to the protected set for agent tasks.
- **Forgeable header.** If an agent can freely edit a file and stamp it `@lifecycle: generated`, auto-merge trusts a header the agent could forge. The audit must **verify by deterministic regeneration in CI** that a `generated` file's body equals the generator's output for the recorded inputs; a mismatch is an unlabeled patch and requires the patch path's checks. Bound the props each ticket class may change so the AST-diff check is not loose.
- Regeneration versus locked files creates drift with upstream fixes; surface a list of **locked episodes behind upstream changes** or the locked set silently rots.

### 17.3 Camera choreography and pacing

**AST-to-camera bridge.** The shot AST's camera intent, `subtext_intent`, and `vocal_intensity` map to Remotion `interpolate`/`spring` transforms. **A deterministic generator should emit the first pass** so it is reproducible and regenerable; the agent's role is limited to **bounded repair patches** driven by diagnostic tickets, recorded as patches on top of a regenerable base. (Documents that had Jules both authoring and refactoring camera rigs conflated two control flows with different reproducibility.)

**Style Rule Table.** Pacing values ("18-frame hold," "scale 1.0 → 1.03," "3.5 s horizon") are **house-style heuristics, not laws**. Hardcoded in a compiler they produce a mechanical cadence. Move them to a version-controlled `style_rules.json` owned by the showrunner and versioned per episode:

```json
{ "pacing_rules": { "visceral_sting": {
    "pre_speech_hold_frames": {"min":12,"max":24,"default":18},
    "camera_push": {"start_scale":1.0,"end_scale":1.03,"easing":"quadOut"} },
  "diffusion_horizon_seconds": 3.5 } }
```

Use a **closed enum of easing names** mapped explicitly in code; a typo must not reach the generator as an arbitrary string. Record the rule version in the episode manifest so a difference between two bakes can be attributed to the AST or to the rules.

**Motivation-Reaction Units.** Physical reflex precedes conscious thought and speech. A `VISCERAL_STING` gets a 12 to 24 frame unvoiced reaction beat *before* the dialogue stem, with a slow push-in. The numbers are defaults a director can override; applying one uniformly to every emotional beat makes a mechanical rhythm.

**The diffusion horizon.** Long dialogue lines are split into shot-reverse-shot (3.0 to 3.5 s on the speaker, about 2.0 s on a listener reaction with audio continuing underneath, then back). The 3.5 to 5 s figure is a property of specific models at a moment in time; make it a per-model measured `max_stable_frames`.

**Reaction-plate dependency and the fail-loud rule.** Cutting to a listener needs a reaction plate. If absent, the compiler must fail with `MISSING_REACTION_ASSET`, or fall back to an explicit scripted single-shot camera move (a wider crop) **recorded in the same waiver ledger** as null emotion variants so the release gate sees it. Two mechanisms for one condition (gated versus not) is a hole.

**Coordinate spaces (a silent decapitation bug).** A sprite-local anchor (`x:412` in a 1024-wide sprite) cannot be divided by the *scene* width. Compute the transform origin in the coordinate space of the element carrying the transform, or project through the parent's layout: `originX_global = (puppet.x + anchor.x × s) / canvas.width × 100%`, where `s` is the sprite's scale. The earlier formula omitted `s`. State which element carries the transform (the origin percentage is relative to *that* element's box) and add a unit test with a known offset and scale (puppet at (300,100) scaled 0.8 with anchor (412,198) must yield a specific percentage). Adopt **one coordinate convention** (sprite-local, plate-local, or composition-space) with explicit conversion. Note the pipeline mentions canvases of 2048×1152 (matte), 1280×720 (master), 1024×1024 (sprite), and 1920×1080; every conversion must be explicit.

**Other camera nuances.**

- Screen-direction (180-degree rule) detection needs each character's facing direction in the manifest; 2D cutout puppets can simply be mirrored.
- Handheld jitter as a sum of sines is deterministic (depends only on frame index); name the frequency constants and document how `A_jitter` maps from tension.
- Split-screen and letterboxing refactors are legitimate but are creative decisions; expose them as style-rule options.

### 17.4 Audio

**Three-track priority topology:** dialogue stems (high; fixed clocks), spot foley (medium; frame-locked), continuous bed/score (low; attenuated). Beds are described by **measurable properties** (`spectralCentroidHz`, `intensityBand`, `seamlessLoop`, `compatiblePhases`), not subjective mood tags, so they are searchable and assignable by a program. Keep bed energy below the foley transients' band to reduce masking. Music, if used, arrives as separated stems.

**Seeded foley determinism.** Ban `Math.random()` (Remotion renders frame chunks in concurrent isolated browser contexts). Choose variants from a small defined PRNG (Mulberry32) seeded by `sceneId:shotId:sampleKey`, with an **anti-clustering salt** (`:retry`) when a pick repeats the previous beat. **Resolve variants at generation time and write the literal filename into the TSX**, which eliminates render-time randomness entirely; then the PRNG's determinism matters only at generation time, and the justification "render-time concurrency" no longer applies. "The previous beat's variant" must itself be computed deterministically at generation time.

**Ducking as a pure function of frame** (scripted envelope, not a true sidechain compressor, which is the accurate name: "programmatic gain automation keyed to dialogue timing"). Because it ducks for the whole window including pauses inside a line, consider **per-phrase windows** from forced alignment for long lines.

```ts
gain = base * 10^(dB/20)          // -14 dB ≈ 0.1995 → 0.40 base gives ≈ 0.0798
attack  = 6 frames  (~250 ms), Easing.out(Easing.quad)
release = 12 frames (~500 ms), Easing.in(Easing.quad)
```

**The min-envelope reducer (correct implementation).** The buggy loop returned on the **first** matching window. With a line ending at 75 (release to 87) and the next starting at 81 (attack from 75), frame 78 hits the first window's release, sets a partial recovery, and breaks without seeing the second window's attack, so the bed **pumps up** between sentences before ducking again. Evaluate **all** windows and take the **minimum** gain; derive the ducked level from a single dB parameter inside the component (passing `baseVolume` and `duckedVolume` independently makes the depth a coincidence of two numbers). Add a unit test on the short-gap case asserting no upward pump. Pass `easing` in the options object; verify the `Easing.out(Easing.quad)` composition against your Remotion version.

**Stem placement (no drift).** Audio duration is real-valued; video frames are integers, so each shot's tail carries up to one frame (41.7 ms) of slack. The worst case across 80 shots is about 3.3 s and the expected value about half of that, but **there is no accumulated drift at all** if each stem is placed at an **absolute start frame computed from accumulated integer budgets** rather than concatenated. Audio *start* is sample-accurate relative to the cut; only the *end* has slack.

**Crossfades.** Bed changes need overlapping components with complementary envelopes; a single looping `<Audio>` has no crossfade logic. `loop` needs the source duration to loop cleanly.

**Delivery loudness (per channel, measured).** Web/streaming about −16 LUFS (±1) with true peak ≤ −1 dBTP; ATSC A/85 −24 LKFS; EBU R128 −23 LUFS. Major streaming platforms normalize to their own targets (often near −14 LUFS), so verify the platform's current spec. Do not mix **dBFS** (sample peak) with **dBTP** (true peak). Ducking depth does **not** deliver compliance; verify with a headless post-mix analysis (`ffmpeg -af ebur128=framelog=verbose`). A noise-floor requirement ("below −60 dB") needs a reference and measurement method to be checkable.

**Other claims to qualify.** Controlling emotional inflection in synthesized speech ("blocks smug inflection") is model-dependent; state whether it is enforced by selection (allowed style parameters) or verified after the fact. "Bit-for-bit audio" applies to **which sample is selected**, not to encoded bytes after mixing, resampling, dithering, and encoding.

### 17.5 Optical compositing (and the corrections it needed)

**Four-layer hierarchy.** Layer 1 static painted matte (eliminates background swim; camera motion is a mathematical transform, not generative warping). Layer 2 atmosphere and diegetic graphics. Layer 3 keyed actors and cutouts (despill, light wrap, contact shadows). Layer 4 global unification (grade, halation, grain). **Vector typography is composited natively** from design tokens; diffusion never draws text.

**Neural matting upstream.** Do primary edge extraction with a matting model (BiRefNet, RVM) before the asset reaches the compositor and archive an alpha format; browser keying is a fallback. **Archive the raw green plate alongside the derived alpha** so you can re-matte later. Decoding VP9-alpha video has a real CPU cost (lower than per-pixel keying, not zero). **Whether `<OffthreadVideo>` handles transparent video correctly is unverified**; test the exact formats (ProRes 4444 versus VP9 alpha) through the real render path before committing, because an alpha format that does not survive the render path fails late and expensively. "ChromaKeyFilter" is not, to my knowledge, a built-in Remotion component; verify or state it is custom. Standard "average" despill: `G' = min(G, (R+B)/2)`.

**Defects found and their fixes.**

| Defect | Why it is wrong | Fix |
|---|---|---|
| **Halation duplicates the tree** | Re-mounting `{children}` in a blurred screen-blended wrapper renders every `<Video>` and `<Audio>` twice, doubling decode and layering audio out of phase | Derive the highlight pass from a single render |
| **Halation SVG filter inverted** | `feColorMatrix` with three zero rows and alpha = `R+G+B−2.6` outputs **black** with highlight-driven alpha; `feMerge` uses normal blending so it cannot brighten; and an SVG `<filter>` is inert until an element references it | Output the *tinted highlight color* with thresholded alpha, blur it as a named result, add back with `screen` or additive blend, and apply it via `filter: url(#id)`. Prefer an **offline deterministic pass** (FFmpeg or image processing with fixed seeds, filter graph recorded in the manifest) over a live browser SVG filter, since browser filters run in sRGB 8-bit and vary between Chromium builds |
| **Static grain PNG** | A fixed texture is a "dirty window," not uncorrelated grain | Multi-frame grain sequence stepped by frame index, or per-frame procedural noise from a frame-derived seed |
| **Sliding a static tile** | `(frame × 137.5) % 1000` with arbitrary constants is correlated across frames, can drift directionally or repeat, and assumes a 1000-px tile | Tie offsets to tile size with coprime steps, or use a real sequence |
| **Grain loaded via CSS `url(staticFile())`** | Bypasses Remotion's wait-for-load; risk of a first-frame flash | Use Remotion's image component so the render waits |
| **"LUT" is a gradient** | A tinted `linear-gradient` cannot emulate non-linear film response; `lutProfile` was never used | Real 3D LUT via a WebGL shader or offline FFmpeg `lut3d=file=...cube` |
| **Blanket `blur(0.4px)`** | Softens vector text, UI, and backgrounds; sub-pixel blur varies across renderers and pixel ratios | Apply only to diffusion plate layers before overlays mount |
| **Contact shadow fixed 150×30** | Ignores character scale and the camera transform | Tie size and opacity to the puppet's animation state; decide whether the shadow lives inside the camera-transformed container and test |
| **Light wrap described, not implemented** | A multi-pass compositing operation (blurred background masked by the inverted, blurred foreground alpha, added at the edge) far harder in CSS than the prose implies; GPU shader paths add cross-machine variance | Implement in a controlled pass or shader with the variance stated |

Licensing: a scanned commercial film-grain plate is a licensed product; record it. Use of "Kodak 2383" as a *look* versus a licensed profile is a separate question.

### 17.6 Closed-loop visual QA and code patching

**Two-mind separation.** The agent that wrote the component never judges it. A hierarchical fail-fast funnel:

- **Tier 1 (deterministic signals).** Decoded frame-count match (use `ffprobe -count_frames`, not container duration; MP4 muxing can add or drop a frame), alpha-edge purity, loudness.
- **Tier 2 (geometry).** Composition safe zone; viseme alignment.
- **Tier 3 (diagnostic router).** Extract failure coordinates and frame range; no aesthetic rating.

**Kinematically directed sampling.** Uniform sampling misses short defects (a 2-frame viseme pop, a one-frame green flash). Concentrate inspection at local maxima of a frame-to-frame change signal, plus the first frame, the last frame, and phonetic centroids of dialogue beats. The original volatility `V_t = ΔLPIPS + ‖v_RAFT‖` requires GPU-heavy neural passes over every frame pair, contradicting the "cheap" framing, and adds quantities in different units. Use a **cheap proxy** (mean absolute luminance difference, or encoder motion vectors) for selection and reserve neural metrics for flagged windows.

**Debug-mask geometry (the best idea in this section).** Do not run a human-face model on stylized puppets (MediaPipe on a goblin is unreliable, mis-detecting exaggerated chins and mouths). Render a **debug pass** where the viseme layer and mount anchor are drawn as flat solid colors and compute centroids by direct pixel arithmetic: deterministic, sub-pixel, no learned model.

**Scope limit of the debug mask.** It measures where the viseme layer *rendered* versus the mount anchor. It uses the manifest's own coordinates for both, so it **cannot detect an asset defect** (manifest says the mouth is at y=240; the actual sprite pixels put it at y=264). To catch that you need a **second, independent measurement**: template-match or segment the real mouth on the base sprite and compare against the manifest.

**Code bug versus asset defect (routing rule).**

- If the JSX prop deviates from the manifest, **the code is wrong**; the agent may patch the prop.
- If the JSX matches the manifest but the render (compared against the independently measured sprite position) is misaligned, **the manifest is wrong**; route upstream to the art pipeline. Patching the episode by +24 px would hardcode a workaround for a defective asset into one episode while every other episode using that asset stays wrong.

**Diagnostic ticket.** Raw geometry, never adjectives: `failure_class`, `target_file`, `target_component`, `frame_range`, `patch_action {prop, delta}`, plus a classification of the cause. Store method used (measurement source) with each coordinate.

**Surgical AST patching.** Use the TypeScript compiler API or `ts-morph`, never regex. Verify by rendering only the affected window (for example 36 frames) with software GL locally. "Zero cloud GPU" and "under 10 seconds" are targets: bundling and Chromium cold start dominate a 36-frame render; measure. Verify flag names like `--gl=swangle` against your Remotion and Chromium version.

**Circuit breaker.** Three cycles, halting on **oscillation** (A → B → A), not on a single category jump: fixing the mouth may unmask a pre-existing alpha spill or a marginal safe zone. A category jump alone does not prove the *asset* is defective. The rollback primitive for an ephemeral repair branch is to discard the branch (or reset the ephemeral branch to its pre-attempt commit), never to touch trunk; `git checkout -- file` discards working-tree changes to one file, a different operation.

**Regression flywheel (visual).** A resolved defect becomes a permanent test. Distinguish **asset tests** (cheap; assert the character asset's mouth centroid against the manifest; run always) from **episode render tests** (expensive; render frame N and assert geometry; run on flagged episodes). The example `assertMouthCentroidDelta('char_bog','humiliated', <= 4)` is an asset test; it prevents recurrence only if the defect was in the asset.

### 17.7 Path governance for media artifacts

| Path | Class | Rule |
|---|---|---|
| `src/episodes/Episode_*.tsx` (`generated`) | Low risk | Auto-merge after `tsc --noEmit` and the Tier 1/2 gauntlets, **and** verify by deterministic regeneration that the body matches |
| `... (patched)` | Medium | Auto-merge only if AST diff is confined to the ticket's `<Sequence>` and props |
| `... (locked)` | High | Agent write forbidden; human PR with GitHub review |
| `tests/escapes/**`, `tests/held_out/**` | Immutable | Agent write forbidden (hard fail) |
| `src/components/**` (viewport) | Core shared | Human architectural review plus a clean run of the **entire historical episode regression suite** |

Render runs agent-authored code in headless Chromium and must run in an ephemeral, credential-free environment, never in the control plane. Include CPU render minutes, agent tokens, and any VLM call in the per-task budget so the cost of self-healing is visible. Generated and patched episodes need path classes and merge authority in the PR audit.

### 17.8 Scope discipline for the agent in the media layer

Bounded repairs from a numeric ticket are a good fit. **Open-ended tasks** (author a custom shader, port from Lambda to browser rendering, refactor architecture, bump Remotion) are large, high-risk changes that violate the bounded-spec discipline. A Remotion upgrade changes render output and needs the determinism re-measurement before and after (Section 20). Dependency bumps conflict with dependency locking unless an explicit upgrade milestone spec exists.

---

## 18. Asset operations: curation, manifests, LoRA governance

### 18.1 Sprite manifests as a typed visual API

The compositor queries a per-character `manifest.json` instead of branching per character. Per condition variant: `file`, `sha256`, `anchor_point` (ground contact), `camera_anchor_points.crash_zoom_target`, `mouth_bounding_box`, `animation_hints`. Making these **per-variant** is a subtle correct detail: the mouth actually moves between a smug and a humiliated pose, and swapping the sprite must update viseme snapping simultaneously.

- **Ground pivot.** Position relative to a ground horizon: `TranslateX = X_stage − A_x`, `TranslateY = Y_ground − A_y`, so different-height characters stand on the floor.
- **`animation_hints`.** Numeric constants encoding weight and temperament (`talk_bounce_amplitude`, `idle_shiver_amplitude`) avoid the "mechanical metronome" where every character bobs identically. Terrified or neuropathic states can raise `idle_shiver_amplitude`. Deterministic pseudo-random jitter avoids per-frame shiver sprites.
- **Explicit `null` for known art gaps** distinguishes "known production gap" from "forgotten." Keep it.
- **Cheap deterministic post-extraction validation**: coordinates in canvas bounds, the anchor pixel actually **opaque** (not floating in transparent space), mouth-box aspect ratio plausible (about 1.2 to 3.0). These cannot catch a coordinate that is in-bounds, opaque, and simply wrong (a nose instead of a mouth).

### 18.2 Extraction authority: deterministic code over vision models

A vision-language model can *estimate* rough locations but is unreliable at exact pixel coordinates; a **deterministic routine computes them trivially and accurately.**

- **Layered source assets:** export coordinates directly from authoring-layer bounds (Photoshop/Krita layer geometry for the mouth viseme slot and ground baseline). Authoring pipelines preserve exactly the information the pipeline otherwise tries to reconstruct from a flattened image. Where possible **keep layer metadata**.
- **Flattened diffusion plates:** foot contact by scanning the alpha channel from the bottom for the lowest opaque cluster (midpoint of leftmost and rightmost contact); mouth by template matching against the base neutral sprite; facial centroid by segmentation.
- **The VLM is reserved for semantic confirmation** (does the take read as "humiliated" rather than generic "sad"; which region is the mouth), always cross-checked against the deterministic extractor. Store which method produced each coordinate.
- **A forced `<visual_scan_trace>` makes reasoning inspectable; it does not ground the model in pixels.** It can produce confident, plausible, wrong coordinates. Treat it as a record to audit and measure the model's accuracy against labeled examples.

### 18.3 Emotion-bank triage and `approved.json`

Treat facial expressions as **structured, testable, auditable production assets**, not ephemeral prompt rolls, to avoid generic emotional collapse (prompting "humiliated" for two characters regresses to one sad-face mean).

- **Specification rail.** Each condition is defined by physical staging, a prompt fragment, and an explicit **distinctness boundary** (Bog's humiliation reads as *interrupted control*, hands frozen mid-count, not passive sadness; it must not resemble Spleen's loose-limbed shrinking). Triage runs against written bible criteria.
- **Tiers.** Tier 1 deterministic pixel integrity (palette membership against a fixed master palette; edge-alpha purity using a **high percentile or per-pixel spill-excess `G − max(R,B)` over the edge band**, not a mean, since a mean lets localized fringes pass). Tier 2 perceptual deduplication and the silhouette test. Tier 3 multimodal semantic audit (closed categories).
- **`approved.json`** records the approved take and hash, optical anchors, and a **rejection ledger** with `rejection_class` (`SEMANTIC_FAILURE`, `DISTINCTNESS_COLLISION`, `CROSS_CHARACTER_BLEED`, `PHYSICAL_DEFECT`) and reasons. Rejected candidates are never silently deleted; the negative pool prevents regenerating identical flaws.
- **Approval is not a JSON string.** `"supervised_signoff": "art_director"` is decorative: anyone editing the file can write it. Approval is a **GitHub PR review under branch protection**, with the approving user and PR number **read from the GitHub API**. The agent cannot author or modify approval fields (protected). Keep machine-generated rationale (`triaged_by`, free-text reasons) separate from human-authored fields and label it as machine-generated. Generated files take timestamps from the system, not a model.
- **Promotion cascade.** Copy the winning take to `variants/`, update the manifest, seal the hash. Flipping `emotion_visual_mapping.humiliated` from `null` to a path *in lore frontmatter* is an automated edit to a lore file (highest-risk path class). Better: use **pointer indirection**: the bible references a stable emotion ID and the asset repository owns the resolution to a file, so no lore edit is needed when art lands.
- **Release gate on nulls.** During drafts, a null variant falls back to `base_states.idle` with a warning. For finals: `∀ shot ∈ Episode, referenced_variant(shot) ≠ null`, unless a recorded waiver exists. This resolves the tension between graceful drafting and the fail-loud rule. Add reaction-plate fallbacks to the same **waiver ledger**.
- Undefined arguments in generated code (`resolveEmotionSprite(manifest, "humiliated", 0.9)`) are a lint failure waiting to happen.
- A single source of truth for `mouth_bounding_box` (the manifest), referenced everywhere; different coordinates for the same asset in different documents are a defect.

### 18.4 The silhouette (visual redaction) test

Reduce a sprite to a binary mask and ask whether the character is still recognizable from posture and outline alone, a cheap model-independent probe for homogenization. As a **gate** it needs a classifier trained on your cast with reported held-out accuracy (a fresh candidate is out-of-distribution by construction). Classification entropy on a three-class problem is bounded (about 1.10 nats), so an entropy threshold of 0.15 means "the classifier is confident," conflating confidence with true distinctness (a confidently wrong classifier has low entropy). Calibrate.

### 18.5 LoRA dataset curation and gap analysis

**Repository lifecycle:** `raw` (ingestion buffer; every asset needs a **source log** with model seed, base checkpoint version, provenance, licensing) → `curated` (cropped, standardized to the model's training buckets, verified against the palette, bound to caption tokens) → `rejected` (preserved with tags as negative contrast and to prevent re-evaluating known-bad candidates).

**Curation manifest axes:** camera angle, framing scale, somatic pose, emotional state, lighting profile, plus SHA-256 and palette-verified flags.

**The invariance captioning principle.** *Caption what should remain changeable; omit what should bind to the trigger token.* Permanent anatomy (bone structure, scars, skin tone, ear notch) is left **uncaptioned** so the model associates it with the unique trigger (`bog_goblin`); removable wardrobe, held props, background, and lighting are **captioned** so they decouple and can be swapped at inference. An uncaptioned apron becomes part of the character's body and costume changes become impossible. **Caption dropout** (dropping the caption for a small fraction of steps; 5% is a tunable regularizer, not a standard constant) forces the trigger word alone to reconstruct the character. Training resolution buckets follow what the base model was trained at.

**Pre-training coverage gate.** Validate before spending compute: minimum samples per core emotion (the source used 3, later 5) across a minimum number of distinct camera angles/elevations (2 to 3). Post a coverage table on the PR ("Training blocked: missing `terrified`, `exhausted`"). These are floors for a *minimum viable* dataset; adapters trained from three images per condition are fragile. Track outcomes (does adapter quality improve as each threshold is crossed?) and tune from evidence.

**Perceptual deduplication.** A perceptual hash (pHash) is a bit string compared by **Hamming distance**, not cosine similarity. Cosine applies to embedding vectors. Say which representation you use. Keep a content hash for integrity and a perceptual signature for similarity search (a content hash cannot deduplicate visually equivalent assets).

**Anti-autophagy governance.** The concern (training a model on its own unfiltered outputs degrades diversity and detail: model autophagy disorder, MAD) is real and documented. Guardrails: a **human-authored anchor share** in every training set (the 60/40 human/synthetic split is a reasonable **rule of thumb**, not a derived constant, and what actually helps or harms depends on the quality filter, diversity, and drift from the real distribution), human sign-off before promotion into the training set (a GitHub review), preserved negative examples. **Licensing:** every reference needs provenance so future commercialization does not inherit liability.

### 18.6 Golden-set visual regression (POD-06)

**Role split.** POD-07 certifies *artistic* correctness (does the character look right across camera angles); POD-06 certifies *technical reproducibility* (does this exact environment produce variance-bounded output against the golden baseline). Principle: **reproducibility over capability**. An update promising a 20% speedup is rejected if it introduces unmapped latent drift.

**The golden set is an adversarial suite**, not a demo reel: somatic-invariant stress (permanent wounds), lighting extremes, scale extremes (macro to wide), multi-character frames (identity bleed). It **grows** via the **regression flywheel**: every defect that escapes to production has its seed, prompt, and workflow captured, added as a permanent fixture, tagged, and the baseline re-sealed.

**Cascaded funnel.** Tier 1 deterministic pixel gates; Tier 2 embedding-space drift (DINOv2 cosine, LPIPS, ArcFace); Tier 3 a multimodal model invoked **only when Tier 2 moved, and only to classify why**, into a closed category set (`HARMLESS_FLOAT_NOISE`, `LIGHTING_CURVE_SHIFT`, `ANATOMICAL_COLLAPSE`, `CANON_INVARIANT_BREACH`), **never to vote accept or reject.** Averaging deterministic scores with stochastic model judgments produces noisy, non-reproducible thresholds.

**Threshold calibration (none of the numbers is sourced).** DINOv2 ≤ 0.08, LPIPS ≤ 0.12, ArcFace ≤ 0.10, histogram Wasserstein < 0.05, character-centroid distance > 0.35, luminance shift ≤ 4%, silhouette entropy ≤ 0.15 are **starting values pending calibration**:

1. Render the golden set repeatedly under a known-good configuration.
2. Measure each metric's natural run-to-run variation (its **noise floor**).
3. Set the threshold at noise floor plus a stated margin for tolerated change.
4. Store the calibration statistics and date with the threshold.
5. Recalibrate when the base model, GPU class, or container changes.
6. **Prove each metric can discriminate** a known-different pair (two different characters, or a character versus a corrupted version) before trusting it as a gate.

LPIPS and DINOv2 distances are not calibrated to human judgment across content types. **ArcFace and face-mesh models are trained on human faces**; on stylized non-human characters they may fail to detect a face or return near-noise identity distances. Validate that the metric separates your characters at all, or use a general image-embedding model fine-tuned or probed on your own cast.

**Cross-pod escalation.** A proposed dependency, node, or checkpoint update that fails certification **three times consecutively** is declared *not safely certifiable* and quarantined. A governance rule applied to humans, preventing weeks of hyperparameter tweaking to force a broken dependency through.

**Multimodal diagnostic prompt.** Bind the auditor to output a scan trace before the closed-category classification and structured remediation. Treat trace and verdict as auditable, measure accuracy, keep a human sample. An **"anachronism scan"** (zippers, modern plastics) by a model is a recall problem: small or ambiguous details are missed, so absence of a detection is weak evidence; measure recall on planted anachronisms.

### 18.7 The forensic environment registry

Reproducibility means recording the **whole environment**, not just the code. Seal into a manifest (`render_manifest.json`) accompanying every render:

1. Container image **digest**.
2. SHA-256 of every checkpoint and LoRA pulled from R2.
3. The **per-shot seed and parameter registry** (sampler, scheduler, CFG, steps, seed) tied to shot UUIDs.
4. **Hardware and driver metadata** (driver version, CUDA runtime, GPU architecture). Floating-point results differ across drivers and architectures; recording them lets you *explain* a divergence even if you cannot prevent it.
5. The **introspected ComfyUI node schema hash** from `/object_info` at build time.
6. The compiled workflow's hash, compiler version, and node registry version (the compiled `workflow_api.json` is a build artifact to archive alongside the plate it produced).

---

## 19. Infrastructure: containers, graph synthesis, canaries

### 19.1 Zero-local-footprint container CI/CD

Building deep-learning containers locally (Docker Desktop plus WSL 2) consumes 16 to 32 GB of RAM, saturates NVMe, bloats scratch disk with dangling layers, and inherits host-specific state. `repo-bot` offloads builds to GitHub Actions Linux runners via `workflow_dispatch`, and images publish to GHCR. Because a Worker cannot run Docker, GitHub's runners are the remote build factory.

**Layer ordering by decreasing permanence (invariance to volatility).**

| Layer | Contents | Volatility |
|---|---|---|
| 1 | Base CUDA OS | about annual |
| 2 | System daemons (`s5cmd`, Python, git, ffmpeg) | about biannual |
| 3 | Core ML wheels (PyTorch, torchvision, torchaudio; CUDA wheels) | about quarterly |
| 4 | ComfyUI core at a **pinned commit** (`git fetch --depth 1 origin <sha>`) | about monthly |
| 5 | Custom nodes, each at a **pinned commit**; floating `main` clones banned | about biweekly |
| 6 | Application brokers and scripts | about daily |

A change to a script in layer 6 reuses everything below it.

**Practices to keep.** Purge caches in the same layer that creates them. Reference images by **digest** (`@sha256:`), not tag. Keep **weights out of the image** (code and dependencies in the container, tensors in R2, hydrated at boot with `s5cmd`), so a LoRA updates without a rebuild and the image avoids registry size limits.

**Corrections (all verified in review).**

- **Multi-stage build.** `TORCH_CUDA_ARCH_LIST` only matters when *compiling* CUDA extensions, which needs the `devel` image (`nvcc`, GCC, headers), not `runtime`. Use a `builder` stage on `devel` and copy only compiled artifacts into a `runtime` stage. **Copying only `site-packages` is subtle:** extensions may link against libraries present only in `devel`, and build outputs can land outside `site-packages`. The runtime stage must include those runtime dependencies, and the build must run a **smoke import test in the final stage** to catch missing shared objects at build time rather than first render.
- **Full 40-character SHAs** for every pin. Abbreviated hashes (7 to 10 characters) become ambiguous and are a weak pin; also do not reuse one example hash for two different repositories. Enforce with a Dockerfile lint that fails the build on any `git checkout`/`git clone` without a full hash and any `FROM` without a digest.
- **`--index-url`, not `--extra-index-url`,** for PyTorch CUDA wheels (`--extra-index-url` lets the resolver fall back to CPU wheels from PyPI). But `--index-url` **replaces** the default index for that command, so keep the PyTorch install as its own step and resolve other requirements separately. Verify exact wheel names and versions on the index at build time.
- **Registry cache.** A cold ephemeral runner rebuilds from scratch unless Buildx has a cache backend (`cache-from`/`cache-to type=gha,mode=max`). But the **Actions cache has size limits** (on the order of 10 GB per repository) and eviction; a 12 to 18 GB image can exceed it and thrash. A registry-backed cache (`type=registry`) is often better for large ML images; measure which fits. "Layers 1 to 5 hit cache in 35 seconds" is true only with that configured. Also mind **hosted-runner disk space** (tens of GB free): a large build may need a cleanup step or a larger runner.
- **Single-architecture builds.** Do not build arm64 variants of CUDA images you will never run.
- **`libgl1-mesa-glx`** was removed in newer Ubuntu (replaced by `libgl1`); fragile across base bumps.
- **Digest extraction** should use the build action's `digest` output, not a separate registry query. Two tags on one digest is fine, but only the **digest is identity** (a run-number tag is mutable in intent).
- **Image size gate** (about 11 GB) is a fine tripwire but define the measurement (compressed registry size versus uncompressed on-disk size differ substantially).
- **Licensing.** A **public** image *distributes* every included third-party custom node; each has its own license (some restrict redistribution or commercial use). Review before publishing; a private package avoids it at some cost. Public also exposes exact versions and any accidentally baked configuration.
- **Free storage/egress is not a permanent fact.** GHCR pricing and limits for public versus private packages, and any pull rate limits, are set by GitHub's terms and have changed. "Zero storage cap" also contradicts the per-layer and per-image constraints. R2's zero-egress model is real, but R2 still charges for storage and **operations**, and a parallel sync with many part requests generates many operations; include operation counts in the cost model.
- **`s5cmd --concurrency 64 --part-size 50`** and "22 GB in under 15 seconds" imply about 1.5 GB/s sustained; that depends on the link and the store sustaining the request rate. Treat as tuned parameters with measurements; **verify flag names and semantics** (they differ across commands and versions).
- **Image conformance job.** After building, inspect the *image*: installed package set equals the pinned set, import smoke test, no compiler toolchain remains, record size, emit the introspected node registry and its hash as artifacts tied to the digest; fail if any is missing.

### 19.2 Gated deployment (never build-completion → production)

Wiring `workflow_run.completed` straight to a RunPod endpoint PATCH is a hazard. Promotion requires:

1. Successful multi-stage compilation.
2. An ephemeral **smoke canary** verifying model hydration and single-frame inference against the candidate digest.
3. Validation that newly compiled node schemas do not break the typed socket registry.
4. A **golden-set** run against that digest as evidence.
5. An **explicit, logged promotion** in `versions.json`, **rollback-able to the previous digest in one step**.

The build produces a digest; a canary and golden run produce evidence; promotion is a recorded decision.

### 19.3 Dynamic graph synthesis

**Idea.** ComfyUI's API-format `workflow_api.json` is a flat adjacency list of typed nodes with edges as `[source_node_id, output_index]`. Treat it as an AST built programmatically by a typed compiler from the scene manifest, instead of hand-exported templates with hardcoded IDs.

- **Monotonic node-ID registry** removes collisions when splicing subgraphs.
- **Conditional subgraph injection**: a second LoRA and regional masks only for multi-character shots (regional conditioning bounds each character adapter to its half of the frame to prevent identity bleed); ControlNet or pose guidance only when the shot's directives call for it; a masked inpainting subgraph only for repair.
- **The frame count** written into the empty-latent node is computed with the corrected round-up rule (Section 14.4); verify the constraints per node (`EmptyHunyuanLatentVideo` and `EmptyWanLatentVideo` may differ).
- **Compile-time socket type-checking.** ComfyUI's native edge types are coarse (`LATENT`, `IMAGE`, `MODEL`). It cannot detect a **latent-family** mismatch (SDXL 4-channel latent into a Wan 16-channel sampler). The compiler carries an intermediate contract (data type plus latent family) and halts at T0. This depends on **metadata you must attach yourself** (which loader produced this latent), not on anything the graph carries. It confirms shapes and families connect; it does **not** confirm the image is what you wanted (a LoRA applied to the wrong branch, a mask on the wrong latent still type-checks).
- **Generate the node registry from `/object_info` at container build time**, not by hand. Hand-written class names (`WanSampler`, `FluxVAELoader`, `AlphaCleanComposite`, `RegionalConditioningByMask`) may be invented or version-specific. Store it as a versioned artifact tied to the image digest and compile against it; the type checker is then correct by construction for the exact environment, and drift detection becomes "diff the registry between two image digests." Latent channel depths and downsampling factors belong to the model's own configuration, verified per checkpoint.
- **Structural lint before dispatch:** every referenced node ID exists, output type matches input type, acyclic (Kahn's or Tarjan's).
- **Hardware-targeted transpilation:** local 24 GB card (`UnetLoaderGGUF`, `Q4_K_M` quantization, sequential offload, intermediate `/free` steps) versus large cloud GPU (FP16, unrolled batched samplers, no offload). Compile different graph variants from one abstract intent.
- **Schema repair on custom-node drift** (renamed inputs, changed output tuples): diff `/object_info` against the compiler's registry; an agent may **propose** an update to the builder definition under a tight spec, verified by a headless test harness. Treat the builder source as code with standard gates.
- **Surgical inpainting subgraph:** load the parent plate by hash, trim to a padded frame window (a defect at frames 24 to 48 gets frames 18 to 54), synthesize a feathered spatio-temporal mask for the flagged bounding box, denoise clamped to about 0.35 to 0.45 to preserve existing motion, bind the character LoRA, composite back, verify with the Level 0 linter. "Under 15 seconds" is a target.
- A compiled `workflow_api.json` is a **code generator whose output runs on paid GPUs**: treat it like generated episode code (deterministic given inputs, snapshot-tested, linted, recorded in the render manifest).
- Cost and budget: graph compilation, repair graphs, canary runs, and container builds all consume budget and belong in the same reservation and telemetry path.

### 19.4 GPU canaries and provider drift

**Purpose.** Cloud GPU marketplaces change prices, bandwidth, virtualization, and hardware pools without notice. A small recurring cold-start benchmark against fixed thresholds is the right response.

**Four phases per run, each on a fresh un-cached container:**

1. Cold ingress (`s5cmd` from R2), 2. VRAM hydration, 3. pinned-seed 48-frame inference (832×480), 4. network egress and teardown.

**Metric table (starting values, not facts).**

| Metric | Green | Yellow | Red |
|---|---|---|---|
| Cold ingress | ≤ 18 s | 18.1 to 25 s | > 25 s |
| VRAM hydration | ≤ 5 s | 5.1 to 8 s | > 8 s |
| 48-frame inference | ≤ 45 s | 45.1 to 65 s | > 65 s or CUDA OOM |
| Per-shot cost | ≤ $0.060 | $0.061 to 0.080 | > $0.080 |
| CUDA OOMs | 0/3 | n/a | ≥ 1/3 |

**Correlated trend detection.** Ingress and cost are mechanically coupled (billing tracks container duration). A "green" cost within a few percent of its yellow threshold *while* ingress degrades is a warning, not a pass: metrics that share a cause should be read together.

**Statistical and operational corrections.**

- **Three runs cannot distinguish drift from variance on their own.** Compare the canary sample to a **baseline distribution** (for example flag if the canary mean exceeds the baseline mean by *k* standard errors), and define the **aggregation rule** across runs (median? worst-of-three? any-two-of-three?) since it changes the false-alarm rate a great deal. With a 3-run sample the standard error is `σ/√3`, so a "1.5σ shift" is about 2.6 standard errors and a "3σ shift" about 5.2; state which is meant.
- **Keep an immutable reference baseline** plus a trailing window. Overwriting a "calibration card" on every Green lets slow drift reset the reference and never be detected. Store canary results as an **append-only time series**; require explicit human approval to **re-baseline**.
- **Separate hard budget limits (fixed constraints, since a cost ceiling is a business constraint) from statistical drift alarms.** Do not mix a distribution-based ingress rule with fixed cutoffs for the rest without saying why.
- **Require a confirming rerun before any lock**, at a different time and, if the provider allows, a different host or region (an immediate rerun on the same host pool can reproduce a transient noisy neighbor). `cloud_renders_locked = true` from one noisy sample halts production; unless the failure is unambiguous (OOM), confirm. The lock needs an **owner, an expiry alarm, and a documented unlock**.
- **The hourly GPU rate must not be a constant in the workflow** (`RUNPOD_HOURLY_RATE: "0.74"`). Read it from the provider or a versioned config with an effective date, and **fail loudly if it is stale or unavailable**. Show the cost formula and inputs (billed seconds, rate, billing granularity); the phase targets (18+5+45+2 = 70 s) do not obviously reconcile with a $0.06 figure at $0.74/hour (about $0.014 of raw compute), so overhead or granularity is hidden. "Scale to zero, $0.00 idle" depends on the provider's minimum billed duration.
- **Monthly cadence** has a worst-case detection latency of a month. Add a cheap continuous signal: record the actual ingress time and cost of *every* production job and alarm on a rolling median. The canary is then an active probe, not the only signal.
- **Ingress "≥ 1.2 GB/s"** and "22 GB in 18 s" (about 1.22 GB/s) are measurements of the current environment.
- **Canary workflow security.** `workflow_dispatch` can be triggered by anyone with write access: restrict who can dispatch, scope credentials (benchmark-only bucket and endpoint), never expose to PR-triggered runs.
- **Auto-remediation.** An agent tuning `--concurrency 64 → 128` on an ingress failure is a guess (higher concurrency can trigger rate limits or worsen tail latency). Diagnose first (which phase regressed; correlation with region or time of day; provider status): mostly data and a human, not code. If an agent drafts a Dockerfile change, it needs an explicit narrow spec, a whitelist naming those files, and human approval, because a Dockerfile change alters the environment every render runs in. Protected-path rules forbid agent edits to Dockerfiles, workflows, and `requirements.txt` otherwise.
- **Failover.** A Red routes production to Rig 2 (local ComfyUI on :8188) so the creative team is insulated; tie it to the lock state and alert with the failing phase.

---

## 20. Determinism and reproducibility

### 20.1 Layers, stated honestly

| Layer | What is achievable |
|---|---|
| **Timeline** (which frame, which asset, which offset) | Deterministic. Literal, reproducible. Real and valuable |
| **Software identity** (same container digest, same packages) | Achievable and verifiable by digest |
| **Rendered pixels** | Reproducible **to within a measured tolerance**, not bit-identical, unless you tightly control the environment (pinned container, software GL, same CPU architecture, pinned fonts) and even then you must **measure** |
| **Diffusion output** | Software identity does **not** guarantee output identity. GPU kernels can be nondeterministic; results depend on architecture, driver, cuDNN algorithm selection, batch composition, memory layout. The same container on a different GPU can produce different pixels from the same seed |
| **Encoded audio bytes** | Selection is reproducible; bytes after mixing, resampling, dithering, and encoding depend on encoder versions |

**The archive is the source of truth for pixels; the environment record is for explaining and bounding drift.** "Bit-identical," "byte-for-byte," "100% deterministic," and "guarantees re-render years later" are overclaims. The correct posture is "reproducible to within tolerance" or "visually identical," verified empirically.

### 20.2 The determinism measurement harness

Not yet built, repeatedly named as a need:

1. Render each finished episode **twice on one machine and once on another** in the pinned container.
2. Hash frames and compute a perceptual metric.
3. **Define the acceptable tolerance in advance**, before looking at the result (otherwise you rationalize whatever delta you observe).
4. Vary **thread count and parallelism** (Remotion renders frames concurrently) and **cold versus warm caches and font-loading state**, not just machine.
5. Store the measured maxima and means in the manifest.

It also produces the **calibration data for every regression threshold** as a byproduct. Distinguish what actually needs bit-identity: most workflows need *visual* equivalence for review and *archival identity* for the final deliverable. The final rendered MP4 is content-addressed and archived, so re-rendering identically is mainly a convenience and a regression-test tool, not a hard requirement. That lowers the stakes considerably.

### 20.3 Content addressing

Files are stored and referenced by the cryptographic hash of their bytes. Consequences:

- Identity belongs to the specific encoded artifact, not the underlying visual composition. Re-encoding the same frames yields a different hash; that is acceptable for immutability (assets are never re-encoded in place). Deduplicating perceptually identical assets needs a perceptual signature alongside the content hash.
- **The empty-input guard.** The SHA-256 of zero bytes (`e3b0c442...b855`) is a fixed recognizable constant. If it appears in a log or row, an empty file was hashed (a truncated download or failed write). Reject any plate with that hash and assert a minimum byte size before upload. **But this catches only the most extreme truncation.** A truncated file has an ordinary-looking hash. Add: verify size against `Content-Length` or an expected size from the producer; verify the file **decodes** (an image that fails to open; a video whose decoded frame count does not match the request); and record the **expected hash in the dispatch** so the receiver confirms end to end. Only after size, hash, and decodability pass is the artifact promoted into the archive.
- Keep licensing and provenance per asset (model name, model file hash, LoRA hashes, license terms of each, plus fonts, LUTs, grain plates). It costs nearly nothing at generation time and is impossible to reconstruct later.
- For irreplaceable generated assets, route a secondary copy to a different provider or cold local storage; hash-verify on read; scrub on a schedule.

---

## 21. Testing strategy

### 21.1 The state machine

Build the smallest end-to-end path first (one task type, one repository, one worker), with failure tests written **before** the features they exercise. Everything else is an increment on something that runs.

**The properties worth testing (graph and semantic):**

1. **Safety by reachability:** every path from `PENDING` to `MERGED` crosses `SCOPE_PASSED` (remove that node and assert `MERGED` becomes unreachable). Model the guard so high-risk paths must cross `AWAITING_APPROVAL`.
2. **Liveness:** every non-terminal state reaches a terminal state (graph search, guards assumed satisfiable).
3. **Forward reachability:** every state is reachable from `PENDING` (no dead states).
4. **Determinism and guard totality:** for every `(state, event, actor, ctx)` at most (ideally exactly) one rule matches; partition cases across attempt counts, risk classes, SHA moved/unmoved, and rollback classes. The stale-SHA branch must be exercised as a **mismatch** (a payload SHA that differs from the audited SHA must match no rule).
5. **Terminal idempotency:** every event on `MERGED`/`DLQ` is a no-op (except `OPERATOR_REQUEUE` on `DLQ`). Iterate the **full event list**.
6. **Halt coverage:** the kill-switch event is legal from every haltable state; document and test what an operator does when stuck in `MERGING`/`ROLLING_BACK`, and assert those states eventually leave via timeout.
7. **Every state has a timer or is on the human-wait allowlist.**
8. **Every event appears in at least one rule.** Every state is reachable.
9. **Seeded fuzzing** (reproducible PRNG or a property-testing library) varying actor type, attempt count, and risk class against a reference model.
10. **Semantic execution trails** that drive the real transition function with realistic contexts and payloads: the happy path to `MERGED` on low risk; the high-risk path through approval; a watchdog retry (attempt count, branch, epoch change); a stale-SHA `QUALITY_PASS` rejected; a stale-epoch worker rejected; a merge conflict routed to `RETRYING`; `HUMAN_REJECT` landing in `ROLLED_BACK`; `APPROVAL_TIMEOUT` landing in `HALTED`; a security violation terminating in `DLQ` and never `ROLLED_BACK`.

**Graph tests are necessary and not sufficient.** They cannot see guard semantics: a rule can be structurally reachable and semantically never satisfiable. Tests that only check the table's shape are tautologies; a fuzzer that assigns `state` only from a valid return value can never fail. The property tests on the transition table are also blind to everything *around* it.

### 21.2 The Durable Object and executor (the largest gap)

**Every serious defect lived in the choke point, the scheduler, the alarm handler, and the drain, and no test touched them.** Needed:

- An **in-memory storage fake** (get, put, list, delete, transaction, setAlarm, deleteAlarm) or Miniflare/`vitest-pool-workers`, plus a **mocked GitHub client** and a fake global coordinator.
- A **driven `PENDING → MERGED` integration test** that fails until the executor, entry point, dispatcher, and SHA propagation exist.
- **Failure-injection tests:** crash between delete and transition; executor throwing transiently; an illegal-transition race after a successful merge; a retry whose claim succeeded but whose transition failed; a watchdog retry leaving an orphan branch; alarm firing during a long request; redelivered webhooks; out-of-order events; force-push over an audited branch; flipping the kill switch mid-task.
- **Outbox idempotency tests per action type:** run each twice; assert no duplicate effects.
- **Budget invariant test:** exactly one claim and one settlement per attempt across every path.
- Assert **bounded windows** for timers, not exact times.

### 21.3 Other suites

- **Contract tests against recorded webhooks** (a recorded Slack interaction would have caught the form-encoding bug).
- **PR audit tests:** path traversal, rename out of a protected tree, test tampering, protected-file edits, over-limit file counts, fork PRs, unknown authors, null spec. **Seed known-bad PRs** to measure recall.
- **Generator conformance and lint** (Section 17.1).
- **Frame math boundary tests:** raw frames 48, 49, 50, 53.
- **Coordinate-space unit tests** (Section 17.3) and the **ducking short-gap test** (17.4).
- **Corpus fixtures:** sample grievance files must run through the compiler.
- **Classifier measurement sets** (invariant extractor, voice classifier, silhouette classifier, prosody probe, critic): labeled planted violations, historical escapes, clean samples, known-hard cases (negation, hypothetical, synonyms), reporting precision and recall per rule with confidence bounds, and the model/parser versions with every verdict.
- **A claims ledger** referencing the test that earns each "guarantee."

### 21.4 Process

Keep artifacts as **files in version control with CI** that runs the tests on every change. Pasted documents have repeatedly dropped previously fixed items (the scheduled handler twice, heartbeat renewal, break-glass caveats) and let regressions vanish. Generate diagrams from the transition table.

Stop refining prose once reviews converge; build the transition table, DDL, and choke point as tested code, then run in shadow mode.

---

## 22. Operational runbook and break-glass

### 22.1 The kill switch

A master flag (`global_agent_dispatch_locked`) halts agent dispatch, webhook evaluation, and automated merges. Requirements: it is read at claim time **and on every heartbeat**; `HALT` reaches running workers within one heartbeat plus cache TTL (state the latency); a chat command (`!EmergencyHalt`) and an out-of-band path can flip it; it is **tested monthly** (a drill that flips it and confirms dispatch halts and in-flight workers receive `HALT`). An untested kill switch is a hope. Also decide the fail-safe if the global coordinator is unreachable (halt versus continue; alert either way).

### 22.2 Three break-glass paths

| Path | Mechanism | Depends on |
|---|---|---|
| **1. ChatOps** | Slack `/repo-bot halt` → Worker → GlobalCoordinator DO | Slack API **and** the control plane |
| **2. Out-of-band dashboard** | A static Pages UI behind Cloudflare Access; a Worker endpoint verifies the `Cf-Access-Jwt-Assertion` against the team's public keys (do not rely on Access sitting in front of the Pages route, or anyone who discovers the Worker's own URL bypasses it) | The control plane (a Pages site cannot call a DO directly; it reaches one through a Worker that holds the binding) |
| **3. No-code vendor revocation** | Suspend the GitHub App installation; revoke the GPU provider API key | Nothing you built |

**Paths 1 and 2 share fate with the control plane; only Path 3 survives its failure.** "Rotate the RunPod key" is a valid emergency stop and works when everything you built is down. Rehearse Path 3 (the exact menu paths for your account type; App suspension exists on ordinary GitHub, not only Enterprise) and record time-to-halt. Run a quarterly drill.

### 22.3 Operator experience and human loops

- **Approver unavailable.** Options: escalate to a second approver, extend with a reminder, or fail closed non-destructively (halt). Rate-limit notifications. Do not destroy reviewable work because a person was unavailable.
- **An operator digest** lists halted and parked tasks by age, dead-lettered actions, tasks awaiting approval, and reservations held.
- **Expiries** on `HALTED`, `ROLLED_BACK`, and approval waits so no state outlives its usefulness.
- **Failure-mode table** for each dependency (GitHub down, D1 down, global DO unreachable, Slack down, R2 down): what halts, what continues, what alerts. The design specifies only the happy path plus worker death.
- **Observability of the guards themselves.** Every guard is a signal: 409s, dirty flags, breaker trips, stale-webhook drops, empty-hash rejections, dead letters. Count them; a rising `MISMATCHED_JOB_ID` rate or repeated breaker trips on one scene are early warnings. Metrics: audits run, violations by type, rollbacks, alarm expiries, retries per task, approval latency, budget consumed versus reserved.
- **Decision log** (append-only: date, decision, reason, what evidence would reverse it) and a **claims ledger** (designed, implemented, measured). A decision log would have prevented the regression where fixes from earlier rounds were lost from a summary.

---

## 23. Tiering, scope, and what to build first

### 23.1 The scope contradiction and its resolution

The design oscillates between a **solo-operator** setup and a **collaborative distributed** system. Decide which you are building.

**Solo tier (build now).**

- Server-authoritative attempt counting, idempotency on the dispatch call, fail-loud dispatch, content-addressed archive with a backup copy and scrubbing, pinned manifests, a daily budget cap enforced server-side, a **kill switch**, a per-scene spend ceiling, dispatch endpoint authentication, single-writer job queue.
- Even solo, dead-worker detection is needed. A lightweight version (a job record with `last_heartbeat_at` and a cron that expires stale ones, **no epochs**) suffices because with one worker there is no split-brain.
- The solo tier still needs the state machine's core (states, transitions, halt, retry bounds) because those bugs exist without collaborators.

**Collaborator tier (build when real).** Leases, fencing epochs, fair scheduling, per-user budgets, the saga and reconciler, the parent multi-repo state machine.

The most expensive engineering debt to repay is building the second tier's complexity for a first-tier problem.

### 23.2 Recommended build order

1. **The transition table as data, with a `transition()` function and the property tests** (write the tests first and let them fail).
2. **The DDL with migrations**, including every column and table referenced.
3. **The per-DO timer scheduler, then the choke point** (one function for every exit) with per-state entry actions and `contextPatch`.
4. **The outbox with lanes, the executor, transition-before-delete, rollback confirmation.**
5. **The create-task entry point, dispatcher, and worker-boot step.**
6. **The dispatch contract** (discriminated union, server-side lookups, payload fingerprint, idempotency, authorization).
7. **The driven end-to-end and failure-injection tests** with an in-memory storage fake.
8. **PR audit + quality ingestion + SHA-pinned merge**, in **shadow mode** (mode flag, `shadow_violations` with labels, seeded bad PRs) for a couple of weeks.
9. **The reconciler spec and code; scheduled handlers restored.**
10. **The break-glass drill.**
11. Only then the media and asset layers, each as an independent product in its own repository.

Bundling the ComfyUI graph compiler, the forensic generator, and Remotion baking into the governance bot contradicts the isolation argument; they are independent decisions.

### 23.3 Time estimates

Week-level plans are optimistic: GitHub App auth on a Worker (RS256 JWT with a PKCS#8 key, installation-token exchange, caching), Durable Object alarms, and correct HMAC verification each hide a day of debugging. Treat the sequence as right and the durations as minimums.


---

## 24. Findings register: recurring errors and their fixes

These errors recurred across many drafts, often reappearing after being corrected. Treat this register as a checklist against regressions.

### 24.1 Correctness bugs (highest consequence first)

| # | Error | Why it matters | Fix |
|---|---|---|---|
| 1 | **`MERGED` set before the merge executes** | A failed merge leaves a false terminal state about the repository | `MERGING` state; only `MERGE_SUCCEEDED` reaches `MERGED` |
| 2 | **Scope-only merge / approval of unverified code** | A low-risk PR merges on scope alone; a human approves code that may not compile | Scope, quality, then approval as states; `QUALITY_PASS` in the rules |
| 3 | **Guard reads fields nothing sets** (`auditedHeadSha`, `candidateHeadSha`) | No task can ever merge; the approval SHA guard passes vacuously on `undefined === undefined` | Patches take the event payload; guards require defined SHAs |
| 4 | **Stale gate results promote the wrong SHA** | A result for an old head advances a task whose candidate moved | Every gate carries and matches the SHA it audited |
| 5 | **Rollback reason overwritten by payload text** | A real security violation compared to a literal string misclassifies as retryable | Structured `rollbackClass` derived from the event |
| 6 | **Outbox executor is an empty stub / nothing drains** | No merge, rollback, settlement, or projection ever happens; every task times out at `MERGING` | Working drain with lanes, backoff, dead-letter |
| 7 | **Drain deletes the action before applying its outcome** | A crash after a successful merge loses the result; a rollback of already-merged work follows | Apply the transition first, then delete; discard stale outcomes; re-read before execution |
| 8 | **Rollback never confirms** | Every rollback times out into `DLQ` | Compensating executor returns `ROLLBACK_COMPLETE` |
| 9 | **Watchdog kills every task at 30 s** | No heartbeat renewal | `renewLease` re-arms the watchdog and returns `HALT` |
| 10 | **Alarm fires against completed work** | Duplicate requeues and PRs | Timers cancelled per state; alarm handler re-reads state |
| 11 | **Budget reservation leaks** | Released only on rollback; crashes and resumes leak until false exhaustion | Release or settle on every exit; one claim, one settlement |
| 12 | **Retry claim and lease not atomic** | A crash strands a task in `RETRYING` holding budget | Idempotent claim, re-armed on failure |
| 13 | **Fail-open branch ownership** | Lowercase `spec/task-` never matched `spec/TASK-`, so bot PRs bypassed the audit | Ownership from the lease table; one shared ID/branch constant; unknown agent PRs blocked |
| 14 | **Kill switch illegal from most states** | The halt handler throws exactly when needed | Halt legal from every active state |
| 15 | **Kill switch only at claim time** | In-flight work continues after the switch | Check on every heartbeat |
| 16 | **`SECURITY_VIOLATION` / `NEW_HEAD_PUSHED` illegal from `RUNNING`** | Pushes during `RUNNING` are normal; the audit throws | Add legal transitions |
| 17 | **KV get-then-put idempotency** | Eventually consistent, no atomic set-if-absent | D1 primary-key conflict or a DO |
| 18 | **Claim-before-process idempotency loses events** | GitHub does not reliably redeliver | Two-phase status, lease, reconciler |
| 19 | **Epoch handling inconsistent** | `LEASE_CLAIMED` issued none; two stored copies diverge; epoch check preceded the terminal no-op | Issue an epoch on every lease; store once; terminal no-op first |
| 20 | **Worker epoch fencing stated but not enforced** | Zombie workers could ack and submit | Reject stale `REMOTE_WORKER` epochs in the engine |
| 21 | **Fencing claimed at storage** | R2 and Git do not compare tokens | Epoch-scoped keys plus DO-validated promotion |
| 22 | **Actor check let `SYSTEM` bypass authorization** | Any caller could claim to be system | Closed actor union; no blanket bypass; actor from authenticated context |
| 23 | **Timer cancellation misses** | Absolute cap survives rollback; approval timer throws from `ROLLING_BACK`; a single `deleteAlarm` cancels all | Per-DO scheduler; per-state timer sets |
| 24 | **Outbox drain timer discarded on epoch bump** | Compensating actions never run | Do not epoch-scope the drain |
| 25 | **Outbox lost updates** | A drain read-modify-write overwrote concurrent appends | One key per action |
| 26 | **Poisoned outbox action blocks all later actions** | Budget settlement blocked behind a projection failure | Independent lanes, dead-letter |
| 27 | **Transient merge retries never retry** | Self-transition skipped re-enqueue; the only merge action was already removed | Throw from the executor; outbox owns retry policy |
| 28 | **Merge succeeded at GitHub but unrecorded** | Retry reports a false `MERGE_FAILED` | Check `merged` first |
| 29 | **Any historical success accepted for a check** | Latest run may have failed | Latest run per name, paginated |
| 30 | **Halt during `RUNNING` rolls back** | Destroys resumable work | Halt is non-destructive `HALTED` |
| 31 | **`APPROVAL_TIMEOUT` destroys reviewable work** | Unavailable reviewer costs the branch | Non-destructive `HALTED` |
| 32 | **Merge conflict looped through approval** | Approving an unchanged head repeats the conflict | Route to `RETRYING` with flags cleared |
| 33 | **`PRECONDITION` treated as conflict / resets verification** | No event re-runs the audit | Bounded wait-and-recheck |
| 34 | **`ROLLED_BACK` strands** | No automatic exit | Expiry timer; class-based routing |
| 35 | **`DLQ` cannot be resurrected** | Manual adjudication needs database surgery | `OPERATOR_REQUEUE` |
| 36 | **Failed attempts orphan branches and PRs** | Retry edges skipped cleanup | Cleanup on entering `RETRYING` |
| 37 | **Projection payload wrote `'unknown'`** | Lineage columns the audit reads were junk | Carry `branchName`, `baseCommitSha`, `headSha`, `prNumber`; fail loudly if absent |
| 38 | **Quality handler dropped results on projection lag** | Task stuck in `SCOPE_PASSED` | Route by branch name; enqueue on miss |
| 39 | **Slack payloads parsed as raw JSON** | Real interactions are form-encoded | Parse `payload` field |
| 40 | **Slack synchronous fan-out exceeds 3 s** | Command times out | Ack, then `response_url` |
| 41 | **`scheduled()` handler dropped repeatedly** | Reconciler, sweeper, canary never run | Keep artifacts in a repo with CI |
| 42 | **Cron `* * * * *` labeled hourly** | Fires every minute, burns GitHub quota | `0 * * * *`; explicit `switch` |
| 43 | **Frame formula floors** | Truncates audio-synced video | `4·⌈(N−1)/4⌉ + 1` |
| 44 | **Frame-count refine is a tautology** | Validates a value against the formula that produced it | Server-derived; optional client cross-check |
| 45 | **Client-supplied duration/fps** | Forgeable | Server ledger lookup, fail closed |
| 46 | **Fingerprint omits template fields; client-supplied; never compared** | Distinct requests collide | Server-computed over all fields; bound to the idempotency key |
| 47 | **Idempotency key blocks legitimate retries** | `UUIDv5(task + base)` is identical across attempts | Include the attempt number |
| 48 | **Dispatch lacks authentication/authorization** | Any valid caller dispatches any shot | Per-caller scope and limits |
| 49 | **Circuit breaker trusts client-supplied attempt index** | Agent can send `0` forever | Server-authoritative count; per-scene ceiling |
| 50 | **Category jump treated as proof** | Aborts tasks one attempt from success | Tiered trajectory policy; pre-flight feasibility |
| 51 | **Agent authors the tests that judge it** | Vacuous suite passes | Held-out tests, mutation testing, red-before-green |
| 52 | **Gauntlet runs agent code in a credentialed environment** | Exposure isolation exists to prevent | Ephemeral credential-free sandbox |
| 53 | **`git clean -fdx` / `reset --hard origin/main`** | Destroys unrelated work; wrong anchor | Disposable per-attempt workspaces; pinned SHA |
| 54 | **"ACID" / "two-phase commit" / "atomic"** | GitHub cannot promise a later merge succeeds | Compensating saga; compatibility ordering; revert PRs |
| 55 | **Rollback order deletes before revoking** | A live agent recreates the branch | Revoke first |
| 56 | **Substring protected-path denylist** | False positives; evaded by uncovered paths; misses renames, symlinks, lockfiles | Anchored allowlist plus protected set; check `previous_filename`, modes |
| 57 | **Halation duplicates children; SVG filter inverted and inert** | Doubled decode and audio; black glow | Single render; tinted highlight, screen blend, applied filter; offline pass |
| 58 | **`useCurrentFrame()` at composition root** | Wrong interpolation for every shot after the first | Per-shot sub-components; lint |
| 59 | **String JSX numeric props** | Crashes numeric-expecting components | Emit numeric literals |
| 60 | **Ducking first-match `break`** | Audible pumping in short gaps | Min-envelope reducer |
| 61 | **Transform origin ignores coordinate space and scale** | Silently decapitates characters | Element-local origin with scale; unit test |
| 62 | **Static grain overlay / gradient "LUT" / blanket blur** | "Dirty window," wrong grade, softened text | Multi-frame grain; real LUT; blur plates only |
| 63 | **Baked episodes import shared components from a sibling repo** | Renderer still drifts | Vendor, or pin |
| 64 | **Sealed-file checksum brittle** | CRLF, formatters, agent patches break it | Normalize; exclude from formatters; lifecycle states |
| 65 | **Redaction bars over live text** | Recoverable by extraction | Redact by omission; verify with `pdftotext` |
| 66 | **Forensic "must match ledger" contradicts the gap** | Blocks all lies or permits all divergence | Declared-lie model |
| 67 | **Vision model asked for pixel coordinates** | Unreliable; wrong tool | Deterministic extraction; VLM for semantics only |
| 68 | **Approval as a JSON string** | Agent-writable; not authority | GitHub PR review under branch protection |
| 69 | **Dockerfile: `runtime` base with compile-time arch list; abbreviated SHAs; `--extra-index-url`; no cache backend** | Extension builds fail; weak pins; CPU wheel fallback; cold builds | Multi-stage; 40-char SHAs; `--index-url`; registry cache |
| 70 | **Build-complete webhook deploys to production** | Untested images go live | Canary, golden set, logged promotion, rollback |
| 71 | **Canary overwrites its baseline; locks on one sample; hard-coded rate** | Drift absorbed; false lock; wrong cost | Fixed baseline, time series, confirmation rerun, live rate |
| 72 | **Constrained decoding assumed to give valid content** | Parses but is wrong | Schema, enum, FK, parity checks still run |
| 73 | **Authored state and runtime state in one file; deterministic update assigned to an LLM** | Commit churn, merge conflicts, needless nondeterminism | Split; deterministic rule engine |
| 74 | **Corpus sample would not compile** (heading before frontmatter; citation markers; secret as grievance spawn) | Fixtures fail | Corrected samples; typed references |
| 75 | **Timestamp-based drift detection** | Squash and rebase invert it | Tree-hash comparison |
| 76 | **Agents push to trunk / edit lore, Dockerfiles, and workflows** | Violates protected-path and lease rules | Proposals only, through the audit |

### 24.2 Overclaims to retire

Replace each with the property the mechanism actually enforces.

| Claim | Reality |
|---|---|
| "Battle-tested," "hardened," "finalized," "definitive," "empirically validated" | A design, not a result |
| "Formally verified/specified" | Property tests and reachability checks are valuable and are not formal verification; "explicitly specified and graph-tested" |
| "ACID," "atomic," "two-phase commit" | Idempotent compensating saga |
| "Eliminates disagreement" (D1 vs DO) | Makes it transient and repairable |
| "Entirely eliminating duplicates / zero duplicate spend" | Reduces; at-most-once trades duplicates for possible loss |
| "Mathematical proof" of constraint conflict from a category jump | Evidence, often of an unmasked error |
| "Un-gameable," "fraud-proof" | False when the agent authors the tests or empty commits reset the counter |
| "Bit-identical," "byte-for-byte," "100% deterministic" | Reproducible to a measured tolerance |
| "Cryptographic isolation / sign-off / signed waiver" | Branch naming and a commit hash are not cryptography; approval is a GitHub review |
| "Zero cost," "$0.00," "under 15 seconds," "under 10 seconds," "5 ms" | Targets to measure |
| "Impervious to upstream drift" | Detected, pinned against, gated, not prevented |
| "O(1) set intersection" | `O(min(n, m))` |
| "Permanent" C2PA provenance | Strippable; validation depends on the trust list |
| "Broadcast-ready" from ducking | Requires measured loudness per channel |
| "Removes the need for..." | Nondeterminism remains within the smaller repair window |
| "Guarantees stable identity across the entire production run" | Only measurement supports it |
| "Sidechain ducking" | Scripted gain automation |
| "RFC 8785" canonicalization | Key-sorted JSON in the JCS style until verified against vectors |
| "Temperature 0 is deterministic" | More consistent, not deterministic |
| "Forced trace grounds the model in pixels" | Makes reasoning inspectable; can be confidently wrong |
| "Free storage/egress forever" | Pricing and policy facts that change |

### 24.3 Recurring structural lessons

1. **Summaries drop fixes.** Several revisions regressed previously corrected items. Keep artifacts as files in version control with CI, and derive diagrams from the transition table.
2. **Compression drops conditions.** A slogan ("D1 never gates," "DO is sole owner") is right as a principle and wrong as an absolute. Preserve the qualifying conditions.
3. **Declared is not enforced.** Many controls were stated in prose (fencing, kill switch reach, halt from every state, worker epoch, approval authority) and absent in code or enforced by convention across several rules. Enforce in one place.
4. **The test that cannot fail.** A test whose assertion is true by construction (asserting a state variable is in the set of states after assigning it from a function that returns only states) gives false confidence. Prefer tests that would fail against a plausible wrong implementation.
5. **Fail-open defaults hide in "ignore this case" branches.** The first branch of a security check (`return; // allow human PRs`) is where fail-open lives. Determine ownership positively.
6. **Two authorities for one fact.** D1 versus DO; two outboxes; two WALs; `digest_state.json` versus D1; `origin/main` versus `S_clean`; two policies for workflow files. Pick one.
7. **Unsourced numbers.** Every threshold, duration, and cost is a starting value until calibrated.

---

## 25. Open items, missing artifacts, and honest status

### 25.1 Honest status

The transition table is close to correct. The Durable Object, the outbox executor, and everything that connects them are a first draft with functional gaps. No end-to-end path has run. No threshold has been calibrated. Nothing is "finalized."

### 25.2 Critical missing artifacts (the system cannot run without these)

1. **The create-task entry point:** write `tasks`, `fsm_context`, `epoch`, `fsm_state`, and the first reservation atomically.
2. **The dispatcher** that fires `LEASE_CLAIMED` from `PENDING` (first dispatch and resumes), claiming budget first.
3. **The worker-boot step** delivering epoch, branch, and spec to the worker.
4. **The working outbox drain** in one location, with independent lanes, per-action retry timing, transition-before-delete, dead-letter alerting, and the DO methods it calls.
5. **The quality-result ingestion handler and the SHA-pinned merge executor**, wired to the machine with confirmation events.
6. **The rollback executor confirming with `ROLLBACK_COMPLETE`.**
7. **Worker-epoch enforcement and the retry scheduler** (backoff timer with idempotent claim-then-lease and budget refusal as its own event).
8. **The reconciler's written specification and code**, and the restored `scheduled()` handler and cron registrations.
9. **The approval flow:** Slack card, verified interaction handler, `approvals` writer, `approvedHeadSha`, and one-shot consumption.
10. **Dispatch authentication and authorization, idempotent replay with fingerprint binding, typed errors.**
11. **An in-memory storage fake and the driven `PENDING → MERGED` plus failure-injection tests.**

### 25.3 Other missing or under-specified pieces

- Guards for chained conditions; `contextPatch` initialization; `BUDGET_EXHAUSTED` and `MERGE_ACTION_DEAD_LETTERED` events; `MERGE_FAILED_PRECONDITION` policy (wait and recheck, not reset verification).
- Expiry timers for `HALTED` and `ROLLED_BACK`; an operator digest; a safe-point mechanism so the kill switch can interrupt `MERGING` and `ROLLING_BACK`, or a documented gap.
- A per-DO **schema version** and lazy upgrade; a **`contract_version`** rule for mixed versions.
- A **failure-mode table** per dependency.
- Cost-basis selection keyed on `(fromState, event)`; the `operational_telemetry` writer; settlement carrying `reservationId`, `elapsedMs`, tier, crash-versus-clean.
- **Determinism harness**, **calibration procedures** for every threshold, **calibrated distinctness evaluations** (voice, silhouette, prosody) with held-out accuracy and a periodic human audit.
- The **structured beat and state-tracking format** that the capability check, feasibility check, and seam-continuity check all silently require.
- The **conspiracy manifest schema** and its authoring workflow; the **institution knowledge-horizon table's maintenance**.
- A **unified waiver ledger** (null variants, reaction-plate fallbacks, any known gap) and an **episode release checklist as code** (no unwaived nulls; every asset hash matches; every component version pinned; loudness meets the channel spec; determinism measurement recorded; style-rule and parser versions stamped; every approval from the GitHub review API).
- A **single index of manifests** (episode, render, sprite, curation, `versions.json`, waivers) so fields cannot drift apart or duplicate with different values.
- Classifier **version recording** for every verdict (independent action extractor, dependency parser, embedding model, critic).
- Backup **restore drills as scheduled jobs** with owners and alerts.
- Approver-unavailable policy; secret rotation procedures; dual-secret tolerance.
- **Fail-loud rules** as executable checks: no mock templates, no simulated job IDs, the empty-hash guard, end-to-end artifact verification.
- **Persistence** for the GitHub rate-limit bucket (or a policy of reading headers).
- Offline deterministic **halation/grain pass** with recorded filter graph and seeds; a real LUT pass.
- **Per-model configuration** for `4n+1`, native fps, `max_stable_frames`, latent family, and channel depth.
- Tunables should live in a **config table with reasoning and effective dates**: 30 s lease, 10 s heartbeat, 15 min cap, $25 daily cap, 60 s handler lease, 20% limiter threshold, 50-file blast radius, 40% MEU span, 3-cycle breaker, 5-attempt dead letter.

### 25.4 Facts about external systems I could not verify

Verify each before building on it.

- Whether Jules exposes a per-session cost cap, telemetry, or a REST API of the shape assumed.
- RunPod webhook authentication; its billing granularity, minimum billed duration, and scale-to-zero cost.
- GHCR pricing, limits, pull rate limits, and per-layer size limits; GitHub Actions cache capacity and eviction; hosted-runner disk space.
- Remotion specifics: `<OffthreadVideo>` alpha handling; `--gl=swangle` availability and name; whether `ChromaKeyFilter` exists (I believe not as a built-in); the `Easing.out(Easing.quad)` composition in your version; behavior of `useCurrentFrame()` relative to nested `<Sequence>`.
- Chromium build determinism, SVG filter behavior across builds and pixel ratios.
- Typst PDF/X support and font embedding; `pdftotext` behavior on flattened rasters.
- `gray-matter` frontmatter placement requirements; GBNF grammar behavior in your inference runtime.
- ComfyUI node class names and `/object_info` completeness; latent channel depths and downsampling per model and VAE version; whether `4n+1` and native fps hold for the specific node and model.
- GitHub API details: trees API truncation; `compareCommits` truncation; check-run pagination and latest-run semantics; merge `sha` semantics; whether webhook redelivery is available programmatically.
- Cloudflare: D1 foreign-key enforcement default; alarm retry/duplicate semantics; input-gate behavior across `await` inside a Durable Object transaction; `waitUntil` limits; Queue delivery semantics.
- C2PA signing workflow, certificate handling, and trust list.
- `s5cmd` flag names and semantics across versions.
- Face and identity model behavior (ArcFace, MediaPipe) on non-human stylized characters; whether each metric can discriminate your characters.

---

## 26. Glossary

| Term | Meaning |
|---|---|
| **Agent (Jules)** | The sandboxed coding agent that proposes changes; an untrusted worker |
| **Allowlist / protected set** | Paths an agent may change / paths it may never change even if a spec lists them |
| **Anti-autophagy** | Guardrails against training a model on its own unfiltered outputs (MAD) |
| **Archive-dependent** | Artifacts (plates, audio) that cannot be regenerated bit-for-bit and must be archived |
| **AST (two senses)** | Abstract Syntax Tree of code; and the typed shot list emitted by narrative generation |
| **Attention sandwich** | Prompt layout: constraints at top, context in the middle, exit commands at the bottom (advisory) |
| **Blast radius** | The set of files, scenes, or systems a change can affect |
| **Calcification** | A flawed early fact that passes every check and permanently constrains later work |
| **Capability-resource model** | Entities carry capabilities; actions carry requirements; feasibility is a comparison |
| **Choke point** | The single transactional method through which every state transition flows |
| **Closed ledger** | A spec's explicit list of in-scope and forbidden paths |
| **Compensating saga** | A sequence of idempotent undo actions, not a transaction |
| **Content addressing** | Storing and referencing objects by the hash of their bytes |
| **Deletion Principle** | If all models were deleted, the ledger stays consistent; footage is archive-dependent |
| **DLQ** | Dead-letter queue: tasks needing manual adjudication |
| **Dual-artifact** | A human-readable script plus a machine-readable shot list |
| **Dual-field AST** | A declared motor-action array plus prose, cross-checked |
| **Dual-ledger** | Conservative cap accounting versus best-estimate telemetry |
| **Eject button** | Baked, editable source that a human can hand-tune without touching the engine |
| **Epoch** | Monotonic fencing token issued per lease |
| **Fencing** | Ensuring a stale worker's writes can never be promoted |
| **Forensic gap** | Meaning generated by friction between database truth and a falsified document |
| **Golden set** | An adversarial, growing regression suite of rendered cases |
| **Held-out tests** | Immutable tests overlaid at verification that the agent cannot edit or see |
| **HALTED** | Non-destructive stop, resumable |
| **Invariance captioning** | Caption mutable traits; omit permanent anatomy so it binds to the trigger token |
| **MEU** | Minimal Enclosing Unit: the smallest region whose consistency depends on a fix |
| **MRU** | Motivation-Reaction Unit: reflex precedes thought and speech |
| **Machine rail / voice rail** | Frontmatter for matching / prose for prompting |
| **Outbox** | Durable record of intended side effects, executed idempotently with retry |
| **Projection** | A read-only mirror of authoritative state (D1 rows written from the DO) |
| **Red-before-green** | An acceptance criterion must fail on the base and pass only after the change |
| **Redaction test** | Strip identity labels; verify identity is still recoverable from form (voice, silhouette, rhythm) |
| **Reserve-then-reconcile** | Debit an estimate at claim, settle at exit, through a serializing singleton |
| **Sealed file** | A generated file with a checksum and lifecycle marker protecting human edits |
| **Shadow mode** | Advisory-only audit with labeled violations before enforcement |
| **`S_clean`** | The pinned commit SHA anchoring a rollback |
| **Source-baking** | Compiling a timeline to committed source with literal values |
| **Still Good** | A cheap affirmation that resets a fact's age without dirtying anything |
| **Two-mind harness** | The generator never judges its own output |
| **Waiver ledger** | The single record of acknowledged gaps that a release gate reads |
| **Walking skeleton** | The smallest end-to-end path built and tested first |

---

## Closing note

The most valuable outcome of this design work is not any single mechanism but a set of habits: derive prose from executable artifacts, make every rule enforceable in code the untrusted party cannot influence, put every check in order of cost, let every claim carry its status (designed, implemented, measured), and stop refining documents once reviews converge, because the remaining defects can only be found by running the thing.

The path forward is short and concrete: write the transition table and its property tests first, let them fail, then build the choke point, the outbox, and the entry point, drive a task from `PENDING` to `MERGED` under an in-memory fake, and only then run in shadow mode against real pull requests. Everything in the media, narrative, and infrastructure layers is an increment on something that runs.