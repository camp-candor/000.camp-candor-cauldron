# goblin-spatial: Consolidated Architecture Synthesis

**Status:** working architecture reference, synthesized from a long design conversation
**Snapshot date:** 2026-09-23
**Scope:** `goblin-spatial` and the boundaries it shares with `goblin-lore`, `worker-sower-engine`, the edge runtime (Cloudflare), and downstream generative workers.

---

## 0. How to read this document

### 0.1 What this is

This document consolidates a long sequence of design discussions into one reference. Those discussions moved through several positions, reversed some of them, and contained a number of errors that were found and fixed along the way. The purpose here is to record **where the design ended up, why, and what remains unresolved**, and to keep the reasoning behind rejected ideas so they are not re-proposed by accident.

It is deliberately long. The design has many interacting constraints, and most of the value is in the interactions.

### 0.2 Status labels

Every non-trivial claim carries one of these labels, so you can tell how much weight it bears.

| Label | Meaning |
|---|---|
| **SETTLED** | Reached by argument, repeated across iterations, and not contradicted. Build on it. |
| **RECOMMENDED** | The best-supported option, but a real alternative exists and it depends on a decision that is yours to make. |
| **OPEN** | Not decided. Listed in §24 with what it blocks. |
| **VERIFIED (code)** | Confirmed by executing code during the discussion. |
| **VERIFIED (docs)** | Confirmed against Cloudflare's own documentation on the snapshot date. Platform behavior changes; re-verify before depending on it. |
| **UNVERIFIED** | Asserted somewhere in the discussion but not confirmed. Do not build on it without checking. |
| **DEFERRED** | A real option with a stated trigger and cost, deliberately not built yet. |

### 0.3 Provenance and honesty notes

- The source material was a sequence of AI-assisted design documents. They contained confident statements that later proved wrong. Section 23 catalogues every error that was found, including errors in code that appeared to pass its own tests.
- Where this document says **VERIFIED (code)**, the code was actually run. The corrected reference fragments in Appendix A pass their tests.
- Where it says **VERIFIED (docs)**, the claim was checked against Cloudflare's documentation. That is stronger than repeating a figure from a document, but it is still a reading of documentation, not a measurement of your workload.
- Nothing in this document has been load-tested. Every performance statement is a hypothesis until measured in a tracer bullet (§19).

---

## 1. Executive summary

`goblin-spatial` is the **physical-possibility engine** of a narrative simulation. It answers questions such as *can A reach B, can A see B, can A hear B, what does the path cost, who could have witnessed this*. It never answers *what happened*, *what someone noticed*, or *what it meant*.

The design that survived the discussion, in one paragraph:

> A **pure, deterministic, integer-only kernel** computes possibility and sensory evidence from a versioned topology, an immutable overlay snapshot, and a query. `worker-sower-engine` supplies capacity (a scalar budget derived from somatic state) and computes consequences. The kernel's receipt and Sower's consequences are combined into **one atomic batch of events**, appended to a **single authoritative event log per transactional domain**, conditioned on an expected sequence number. Everything else (position indexes, occupancy, door state, beliefs, hot in-memory indexes inside Durable Objects) is a **projection**: rebuildable from the log, allowed to lag, never allowed to commit. Time enters only as recorded tick events. Users, scripts and LLMs all submit **intents** through the same deterministic validation path. Large geography is handled by **analytical transit** (position as a function of time between causally meaningful discontinuities), and tactical space is computed only where actors are present.

The single most important corrections the discussion produced:

1. **"Stateless" was too strong a description of the whole subsystem, but the right instinct was to keep the kernel pure.** The subsystem is a pure kernel plus stateful hosts.
2. **Stateful hosts must not be the authority for world truth.** The event log is. This was the largest reversal in the conversation and it matters most under the multi-user, always-on requirement.
3. **The "bridge" is an interface, not a network service.** A network hop on the hot path bought nothing.
4. **Sharding machinery (CellDO) was imported from a different workload and is deferred**, with a stated trigger and an honest cost.
5. **Several pieces of "verified" code were wrong**, including a piecewise-transit function that passed its own single test while giving a wrong answer for two changes (1567 versus the correct 1300).

What is still unbuilt, and therefore where the design's real risk lives: **the integer supercover line-of-sight algorithm and its brute-force oracle**, the event schema and reducer, the crossing protocol, and every performance number.

---

## 2. Purpose and core thesis

### 2.1 What the system is for

The larger project is a generative production pipeline in which a deterministic simulation produces a canonical world, and generative models (language, image, speech) act only as **untrusted rendering workers**. `goblin-spatial` exists so that no generative model ever invents physical reality. If geometry says a character could not hear a gunshot, that fact is withheld from the character's context; the language model cannot leak what it was never given.

### 2.2 The foundational rule

> **Probabilistic models execute constrained tasks; deterministic systems decide what is allowed to be true.**

Everything else in the architecture is a corollary. The clearest form of the resulting causal chain is:

```text
Topology → physical state → physical possibility → event → percept → belief → expression
   canon       ledger          spatial kernel       ledger   spatial   ledger      LLM
```

At every arrow, ask *which component is allowed to produce the next fact*, and confirm that no probabilistic component produces a fact upstream of a deterministic one. This is the falsifiable test of the whole design.

### 2.3 Possibility versus occurrence

**SETTLED.** This is the single most important distinction in the design.

| The spatial engine answers (possibility) | The ledger decides (occurrence) |
|---|---|
| Can A reach B? Along what path, at what cost? | Did A actually move? |
| Could A see B? | Did A look? Did A notice? |
| Could sound from X reach A above the noise floor? | Did A hear it? Did A understand? |
| Can two entities occupy the same cell? | Who *did* occupy it, given the deterministic tiebreak? |
| Who *could* have witnessed the event? | Who *did* witness it? |

A spatial result is a statement of what is physically permitted. It becomes a fact of the world only when committed as an event.

### 2.4 Ignorance by omission

**SETTLED.** Language models cannot be reliably instructed to ignore facts that are present in their context. The design therefore never asks a model to ignore anything. Information a character could not have obtained is **structurally absent** from that character's prompt envelope. The mechanism is:

1. The spatial kernel determines sensory opportunity (an optical ray that clears the geometry, an acoustic wavefront that stays above the ambient floor).
2. It emits **percept candidates**: channel, integer quality, bearing.
3. The ledger applies somatic filters (deafness, blindness, injury) and, only if the evidence survives, writes a belief record.
4. The downstream model receives only belief records for that character.

If no path cleared the geometry, no belief exists, so the event is absent from the context and cannot be leaked. This solves omniscience drift **structurally rather than instructionally**.

---

## 3. Root axioms (the constitution)

These are the rules the rest of the document derives from. They are ordered by importance. If a proposed change violates one, the change needs an explicit, written exception.

1. **One transactional domain owns each commit.** A projection may be stale. It may never be authoritative. (Refined from an earlier, weaker "one owner per fact.")
2. **Kernel calls have no side effects.** The kernel is a pure function. Calculation precedes commit, so there is nothing to roll back.
3. **A receipt is a conditional proof, not a fact.** It is valid only against the log sequence it names. Only a committed event says something happened.
4. **A move and its consequences commit together**, in one append, or not at all.
5. **Derived state must be provably rebuildable**, and rebuild time is a tested quantity, not an assumption.
6. **Time and randomness are inputs, never reads.** No wall clock, no unseeded randomness inside logic. Randomness, where the simulation needs it, lives in Sower and is derived from recorded seeds.
7. **A kernel change is a decision, not a deployment.** The golden-receipt suite decides whether a new version is compatible or starts a new epoch.
8. **The character-facing interface cannot express ground truth.** Enforce this in types, not in prompts.
9. **Crossings between sites are decided once, in one place**, and applied idempotently everywhere else.
10. **Untrusted proposals enter through one path.** Humans, scripts and LLMs submit intents that pass through identical deterministic validation. No privileged route exists for any of them.
11. **Anything deferred is documented with its trigger and its real cost.**

A companion rule that follows from 2 and 6: **the kernel package must compile and run with no network, no clock, no filesystem, no database and no platform types.** If a kernel test needs any of those, the boundary has been violated.

---

## 4. Layers, vocabulary, and what owns what

### 4.1 The layers

The discussion's early framing was "pure function versus stateful actor." That was a false dichotomy. They are different layers of one system. Four concepts must be kept distinct:

| Layer | Answers | Nature |
|---|---|---|
| **Canon** (`goblin-lore`) | What exists and what the topology *means* | Immutable, compiled offline, versioned and hashed |
| **Spatial kernel** (`spatial-core`) | What is physically possible | Pure, deterministic, integer-only |
| **Event log** | What actually happened | Append-only, the sole authority for mutable world state |
| **Projection / cache** | What is true *right now*, for fast computation | Derived, rebuildable, disposable |

The sentence to carry forward: **the current state of the world is a projection of historical events; it does not need to be independently authored by every runtime component that happens to cache it.**

### 4.2 Vocabulary

Precise words prevent the "authority" ambiguity that caused most of the drift.

| Term | Meaning |
|---|---|
| **Kernel** | The pure mathematical engine. No I/O, no clock, no platform. |
| **Host** | A runtime shell (a Durable Object, a Node process) that loads the kernel, holds hot indexes, serializes requests, and serves connections. Hosts contain no decision logic. |
| **Projection** | Current state derived from the event log (positions, occupancy, door states, beliefs). |
| **Event log** | The canonical record. The only source of truth for mutable state. |
| **Port** | A typed interface (`SpatialPort`, `LedgerPort`) that decouples callers from implementations. |
| **Adapter** | A concrete implementation of a port (in-process, SQLite, Durable Object storage, remote). |
| **Bridge** | Loosely, the typed boundary between Sower and spatial. It is the port plus a scrubbing rule, **not** necessarily a network service. |
| **Receipt** | A deterministic statement of what the kernel calculated, bound to the inputs that produced it. Proof of calculation, not record of occurrence. |
| **Overlay snapshot** | An immutable, versioned bundle of dynamic physical modifiers (open hatches, flooded edges, fog). |
| **Intent** | A proposed action submitted by a user, script or LLM. It is a request, never a fact. |

Reserve the word **"authority"** for the event log. A Durable Object is a host or an actor, not an authority.

### 4.3 The three-way separation of concerns

**SETTLED.** Each fact has exactly one owner.

| Concern | Owner | Holds |
|---|---|---|
| **Canon law** | `goblin-lore` | Room bounds, terrain classes, material damping, portal links, geographic anchors. Compiled offline into a versioned, hashed manifest. |
| **Physical possibility** | `goblin-spatial` (`spatial-core`) | Nothing mutable. Computes reachability, visibility, propagation, cost. |
| **What happened, and to whom** | `worker-sower-engine` + the event log | Actor positions (as a projection), door states, somatic profiles, beliefs, the append-only event log, PRNG seeds. |
| **Expression** | Downstream generative workers | Nothing authoritative. They render from belief records. |

### 4.4 Capacity, feasibility, consequence

**SETTLED.** This is the cleanest decomposition of the somatic handshake and it eliminates the earlier "two-phase commit" worry.

- **Sower owns capacity.** It reads somatic state (broken leg, exhaustion, empty tank) and reduces it to an integer scalar such as `maxCost = 4`.
- **Spatial owns feasibility.** Given that scalar as plain data, it says whether the destination is reachable, along what path, at what cost.
- **Sower owns consequence.** It deducts fatigue, records history, updates beliefs.

Spatial never learns *why* the budget is 4. A bug in injury logic cannot corrupt the lattice, and the same kernel serves humans, vehicles, animals, cameras and projectiles without embedding the meaning of any of them.

---

## 5. Who owns position (the central decision)

This was the hardest question in the discussion, and the one where the design changed most.

### 5.1 The tempting design, and why it fails

The intermediate proposal made a `StageDO` the authority for live position, with Sower keeping only movement *history*. Its ownership table looked tidy:

| Fact | Proposed owner |
|---|---|
| Live tactical position | StageDO |
| Historical movement | Sower |

The argument was that these are "not competing," because one is current operational state and the other a historical record. **That argument is wrong.** Current position is the *fold* of the movement history. If two components are authoritative for the same causal chain, they can disagree whenever an event is committed in one place and not the other.

The failure is concrete. Under "spatial commits, then Sower commits consequences," a crash between the two steps leaves a character who has **moved without paying**. Version numbers can *detect* that disagreement, but they cannot decide who is right. Under the multi-user, always-on requirement this is a live production event, not a theoretical one.

### 5.2 The design that replaces it

**RECOMMENDED (and the position the discussion converged on).**

> **The event log owns the fact. Hosts own a fast projection of the fact.**

```text
                    AUTHORITATIVE EVENT LOG
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
   position projection   somatic projection   epistemic projection
           │
           ▼
      StageDO (host)
      hot in-memory index, disposable
           │
           ▼
   spatial-core queries (pure)
```

A `StageDO` can still hold `Map<ActorId, CellId>` and answer adjacency, occupancy and contention queries in microseconds. What it may not say is *"I have decided what happened."* If the DO's state is lost, the system does not ask what the DO believed. It replays the log and rebuilds the DO.

### 5.3 The test that separates the two designs

> *If a StageDO's storage is wiped and it restarts, what is the world's state?*

- In the "DO owns position" design, the answer depends on whether Sower's history is complete enough to reconstruct positions. That was never established.
- In the log-authority design, the answer is **"identical to before, after replay from the last snapshot,"** and it is a **testable claim**. This is the recovery test in §20.

### 5.4 The atomicity boundary

The most valuable refinement, and the one most likely to be misunderstood:

> An atomic transaction **inside one Durable Object's storage** does not give an atomic transaction **spanning an unrelated Sower database and a Durable Object.**

Three configurations follow, and they are not equivalent.

| Configuration | Atomicity you actually have | Verdict |
|---|---|---|
| Log lives in the site's DO storage; Sower logic runs in or against that DO | One transaction covers the move and its consequences | Sound |
| Log lives in a separate Sower database; the DO holds a projection | The append is atomic in Sower's database. The DO projection updates *afterward*, so it can lag but can never be wrong, only stale | Sound |
| Log in Sower's database **and** authoritative state in the DO | Two stores must change together; needs a distributed commit protocol | **The trap** |

The rule is therefore not merely "use one store." It is: **exactly one transactional domain owns each commit. A projection may lag; it may not commit.** The test is that no code path writes to two authoritative places in one logical step.

### 5.5 The movement protocol

**RECOMMENDED.** Calculation happens before commit, so no world state changes until the single append.

```text
1. Sower computes capacity (a scalar) from somatic state.
2. Sower asks the port: "is this move feasible within budget B?"
3. The kernel returns a receipt.            ← pure; NOTHING has changed yet
4. Sower assembles ONE batch:
      ACTOR_MOVED      { from, to, path, cost, proof: receipt hashes }
      SOMATIC_APPLIED  { fatigue delta, budget spent }
5. The batch is appended atomically, conditioned on expectedSeq.
6. Projections update from the log.
7. The host's hot index reflects the committed state.
```

Why this shape works:

- The kernel is a **calculator and validator**, never a transaction coordinator.
- A crash before step 5 leaves no partial state. Nothing was mutated.
- The `expectedSeq` check on the append gives the stale-view protection that a separate "revision negotiation" protocol was trying to provide. If the log advanced since the receipt was computed, the append is rejected and the calculation is redone.
- The impossible intermediate state, "moved but did not pay," cannot exist because both events are in one batch.

### 5.6 A receipt has a shelf life

A receipt is valid only against the log sequence at which its inputs were read. Two receipts can each be internally correct while describing different moments. Therefore **the log sequence number must be inside the receipt.** This is what makes replay unambiguous, and it collapses the earlier `authorityRevision` and log sequence into one number.

### 5.7 Receipt versus event

| | Receipt | Event |
|---|---|---|
| Says | "Given these inputs, this move is feasible and costs 3." | "The move happened." |
| Produced by | The kernel | The ledger, after a successful append |
| Status | Proof of calculation | Record of occurrence |
| Can be discarded | Yes, if the batch fails to commit | Never |

Code that treats a returned receipt as a fact is a defect.

---

## 6. Geometry: the hybrid two-scale model

**SETTLED.** Space is partitioned across a hard scale boundary so that projection distortion and cost differences never leak between the two regimes.

### 6.1 Tactical scale (interiors, crawlspaces, sites)

- **Pure axial integer hex lattice**, coordinates `(q, r, s = −q − r)`.
- Eliminates floating-point drift, projection distortion and the pentagon singularities of spherical grids.
- A **doubled-coordinate affine transform** lets vertices, edge midpoints and ray intersections be evaluated with **exact integer cross-products**, so results are identical across runtimes.
- Bounded topology: the canonical crawlspace is radius 5 (91 cells, 8,190 ordered pairs).
- The correct hex metric is `max(|Δq|, |Δr|, |Δs|)`. Manhattan distance on axial coordinates is wrong and distorts the hex boundary; an earlier draft used it in a culling step.

**Caution (OPEN):** the discussion repeatedly states that a doubled-coordinate lattice enables exact integer supercover, but the only distance function ever written was plain axial, and the supercover itself was never implemented. The doubling is asserted, not demonstrated.

### 6.2 Regional scale (roads, rail, waterways, state-sized distances)

- **H3 (resolution 5 to 8) is a spatial index only.** It answers *which authority or shard owns this area, which sites are nearby, which graph partition to load*.
- **The transport network is a directed routing graph**, compiled offline into **Compressed Sparse Row** typed arrays (`Uint32Array` for offsets, node indices, integer weights). This loads fast and avoids object-tree heap bloat.
- Routing is A* (ALT-style landmarks are a reasonable optimization) over the CSR graph.
- **H3 is not the road network.** Treating it as one was a recurring conceptual slip.
- H3 uses floating point internally. To keep the determinism guarantee, its outputs must be **quantized at the boundary**, the library version **pinned exactly**, and that version **included in the topology hash**. Otherwise "byte-identical on any platform" is aspirational.

### 6.3 The scale handoff

An actor is either on a tactical lattice or on a regional edge, never both. The type system should enforce it:

```ts
type ActorSpatialState =
  | { scale: 'STAGED';     siteId: SiteId;        cell: CellId }
  | { scale: 'IN_TRANSIT'; edgeId: RegionalEdgeId; departTick: Tick; edgeCost: Duration };
```

This removes the "half in, half out" class of bugs. Crossing between the two is through **portal nodes**, and the crossing is the one operation that spans two spatial jurisdictions (see §16.7).

**Open specification gaps:**

- A single canonical **duration unit** must be defined at the portal. Without it an actor can gain or lose time when crossing scales.
- Fictional footprints straddling an H3 cell boundary, or overlapping a real road, are unspecified.

### 6.4 Fictional-on-real registration

Fictional sites authored in `goblin-lore` bind to real geography by one of four modes:

| Mode | Behavior |
|---|---|
| `ANNOTATE` | Attach fictional metadata to real features |
| `SUBSTITUTE` | Replace real features; suppresses the real interior edges |
| `EXTEND` | Add fictional structure to the real network |
| `REGION` | Define a fictional region over real geography |

A rigid **spherical displacement** (an exact rotation in Earth-centered coordinates) preserves travel times and coastline shapes without pointing at real addresses. The rotation is computed **offline and quantized to integers**, so the runtime performs no trigonometry.

### 6.5 Three distinct distance metrics

Do not conflate them.

| Metric | Unit | Use |
|---|---|---|
| `d_hex` | Integer step count | Tactical adjacency, contact (`d_hex ≤ 1`) |
| `d_geo` | Meters (great-circle) | Regional geography |
| `T_travel` | Integer cost units | Travel duration along a path |

---

## 7. Perception, contact, and displacement

### 7.1 Line of sight

- A **symmetric, finite-segment supercover** over the tactical lattice, evaluated with exact integer arithmetic.
- **Symmetry is a hard property:** `LoS(a, b) === LoS(b, a)`. A visibility relation that depends on which endpoint you start from breaks epistemic fairness.
- Occluders are static (from canon) plus dynamic (door and hatch states from the overlay).
- **Validation (the design's central promise, still unbuilt):** an exhaustive comparison of the integer supercover against a brute-force oracle over every ordered pair in the radius-5 disk. 91 cells give 91 × 90 = **8,190** pairs, which was checked arithmetically.

The oracle must be written **independently of the fast implementation**, from the geometric definition, using exact rational arithmetic (BigInt fractions) over the continuous segment between cell centers. An oracle that shares the same misconception as the implementation proves nothing. It should be written **first**.

A caveat that is easy to overlook: passing the oracle proves correctness **for that lattice size and those occluder configurations**. It is strong evidence, not a proof, and it does not automatically extend to a larger radius.

### 7.2 Acoustic propagation

- An **attenuated wavefront breadth-first search** from the source.
- Every quantity is integer **centibels (cdB)**: 0 dB = 0 cdB, 120 dB = 12,000 cdB.
- Structural damping and per-cell environmental additions are **subtracted as integer cdB**. Mixing basis-point multipliers with decibels inside one calculation was identified as a source of systematic rounding drift, so acoustics stay entirely in cdB.
- Audibility requires **both**:
  `I_arrival ≥ T_hearing` **and** `I_arrival − N_ambient ≥ SNR_min`.
- The traversal **terminates when the signal falls to the ambient floor**. This is a physics-driven radial cutoff and doubles as the CPU bound.
- Quality is an integer per-mille score (0 to 1000) derived from the margin above the audibility threshold, clamped.

### 7.3 Percept candidates (evidence, not belief)

The kernel emits records containing the **channel** (visual or auditory), an **integer quality score**, and a **bearing** (an axial direction 0 to 5 relative to facing, or null if co-located). It emits no booleans meaning "noticed" and no beliefs. The ledger applies somatic filters and decides whether a belief is written.

### 7.4 Contact graphs and crowding

- The kernel emits **temporal contact opportunities** (`d_hex ≤ 1`) that govern rumor propagation.
- **Crowding eviction** (involuntary displacement when a cell exceeds capacity) uses a **budget-bounded Dijkstra** search outward from the contested cell.
- **Who is evicted first is a policy, and it must be deterministic and explainable.** A total order is required (see §8.4).

### 7.5 Possibility is not occurrence, again

The kernel outputs `can_witness`, `can_intercept`, `can_reach`. The ledger decides whether an interaction *occurred*. Keep this visible in naming.

---

## 8. Determinism discipline

Determinism is the property that makes replay, audit and the oracle test possible. It is easy to violate accidentally. This section records every hazard that was actually found, not merely predicted.

### 8.1 The bounded integer principle

**SETTLED.** Floating point is banned from any authoritative branch. Distances, decibels, costs, capacities and signals are integers. Basis points (0 to 10,000) express multipliers. Rounding is **round-half-even, implemented with exact integer remainders**.

### 8.2 Hazards found and their fixes

| Hazard | What was found | Fix |
|---|---|---|
| **Locale-dependent sorting** | An encounter sort used `localeCompare`, whose result depends on locale and ICU version | Compare strings by UTF-16 code unit: `a < b ? -1 : a > b ? 1 : 0` **VERIFIED (code)** |
| **"Half-even" that wasn't** | Code claimed round-half-even but computed `floor((n + floor(d/2)) / d)`, which is round-half-**up** (5/2 gives 3, not 2) | Implement true half-even; test negatives and exact halves **VERIFIED (code)** |
| **Silent overflow** | Encounter arithmetic multiplied tick counts; at centisecond ticks, 100 simulated years on a one-day edge gives ≈ 2.7 × 10¹⁸ versus a safe limit of ≈ 9 × 10¹⁵ | Use BigInt for intermediate products, or rebase ticks per edge **VERIFIED (code)** |
| **Packing accepts garbage** | `packAxialCell(NaN, 0)` returned 32768; `1.5` silently truncated, because NaN comparisons are false and bounds checks pass | Guard with `Number.isInteger` before the range check **VERIFIED (code)** |
| **Non-deterministic receipts** | A `calculationDurationNs` field inside the receipt varied on every run, breaking byte-identical hashing | Separate the hashed verification envelope from out-of-band telemetry |
| **Hard-coded kernel version** | An adapter declared `kernelVersion = '4.2.0'` independently of the kernel | Derive the version from the kernel itself or guard it with a golden test |
| **Platform crypto in the portable core** | `node:crypto` import contradicted the zero-dependency goal | Use a pure synchronous SHA-256 (`determinism` package) |
| **Iteration order** | `Map`/`Set`/object key order feeding a hash | Sort explicitly before hashing; note that integer-like object keys reorder automatically |
| **Float in geography** | H3 and great-circle distance are floating point | Quantize at the boundary; pin the library |
| **Cross-platform consistency** | Same seed on Rig 1 and on the edge must match | Test the equivalence directly, not just single-machine runs |

### 8.3 Compounded attenuation

Multiplying many basis-point factors decays precision and can exceed 2^53. **Accumulate in BigInt across all hops and round exactly once at the boundary.** Rounding per step drifts systematically low on long acoustic paths.

### 8.4 Tie-breaking: two different domains, two different rules

**RECOMMENDED.** An earlier draft used one rule for everything and the hash-based version made routes depend on who asked. The two domains are ontologically different.

| Domain | Rule (in order) | Why |
|---|---|---|
| **Pathfinding (A\*)** | 1. total cost, 2. heuristic, 3. **packed node ID ascending** | Paths are purely geometric. Two actors computing the same route on the same topology must get the same path. Hashing actor IDs into A\* breaks that symmetry. |
| **Actor cell contention / crowding** | 1. arrival tick, 2. `HMAC-SHA256(seed, actorId ∥ tick)`, 3. **actor ID ascending (code-unit order)** | Contention is an agentic event needing a fair, deterministic lottery. |

The final fallback in each makes the order genuinely **total**. Note that HMAC-SHA256 must be implemented (RFC 2104 over the pure SHA-256) and tested against the RFC 4231 vectors; a plain SHA-256 was supplied in the discussion but not the HMAC construction.

### 8.5 Canonical serialization

Every hashed structure passes through **one** canonical-JSON function that sorts keys by code-unit order at every depth, rejects `NaN`/`Infinity`/`undefined`, rejects non-integers where an integer is expected, and encodes BigInt as a tagged string. This is the function every hash depends on and deserves the most tests. JSON's defaults will otherwise bite: numbers beyond 2^53 lose precision and BigInt throws.

### 8.6 Cryptographic hash

A pure, synchronous SHA-256 was supplied for the portable core. **VERIFIED (code):** it matched `node:crypto` on 511 of 511 cases, including padding boundaries (55, 56, 63, 64, 119, 120 bytes), multi-byte UTF-8 and a random fuzz corpus. It is correct. Keeping a comparison test against `node:crypto` in the **test process only** (never in the portable package) preserves that assurance.

### 8.7 Coordinate packing

Cells pack into an unsigned 32-bit integer using an offset of 32,768, so `q, r ∈ [−32768, 32767]`. **VERIFIED (code):** endpoints round-trip (−32768,−32768 → 0; 32767,32767 → 4,294,967,295). The packed order is **q-major lexicographic**, which is fine as a tiebreak key but is not a spatial ordering; document it. Edge keys pack two cell IDs into a BigInt with the smaller in the high bits so undirected edges are canonical.

---

## 9. The overlay contract

**SETTLED (shape) / OPEN (construction authority).**

### 9.1 What an overlay is

A **full immutable snapshot** of dynamic physical modifiers, not a delta and not access to Sower's internals. An earlier diagram said "per-query delta" while the text said "full snapshot"; the correct reading is snapshot. It contains only physical facts:

```ts
interface DynamicOverlay {
  schemaVersion: number;
  occluderStates: Record<OccluderId, boolean>;          // open / shut
  edgeCostMultipliers: Record<EdgeId, number>;          // basis points; 10000 = 1.0x; 0 = impassable
  cellAcousticDampingAdditionsCdB: Record<CellId, number>;
}
```

### 9.2 Validation (fail closed)

- Reject unknown occluder IDs, edge IDs **and cell IDs**. An earlier draft validated the first two but not cell IDs, so the "fail closed on phantom entities" claim did not hold for damping.
- Reject non-integer or negative multipliers and damping values (`Number.isSafeInteger`).
- A multiplier of **0 means impassable, not free.** This must be explicit; a division by a zero cost or an instantly traversable washed-out road are both wrong.
- Hash the canonical serialization with the pure SHA-256.

### 9.3 Content-addressing

The opening description of the engine calls it "content-addressed" and then never used the property. Use it: the inputs `(topologyHash, overlayHash, queryHash)` identify a computation, enabling memoization and making receipts reproducible.

### 9.4 Who constructs the overlay? (OPEN)

Purity of the kernel does not help if the overlay Sower hands it is assembled non-deterministically. Two replays could build different snapshots from the same ledger. **The rule needed:** overlays must be a deterministic function of ledger state at a named sequence. This is not yet specified.

### 9.5 Environmental state belongs outside spatial

Weather (Markov processes), resource growth, prices, famine and any "why did the river rise" logic belong to Sower. Spatial consumes only the resulting numeric overlay: a flooded edge, a friction multiplier, a visibility damping. It applies those as pure weights and never simulates causes.

---

## 10. Receipts, audit, and failure

### 10.1 Receipt structure

```ts
interface SpatialReceiptHeader {
  schemaVersion: number;
  kernelVersion: string;
  topologyHash: string;
  overlayHash: string;
  queryHash: string;
  sequence: number;          // ← the ledger sequence the inputs were read at
}
```

Every receipt carries a `receiptHash` computed over the **canonicalized result payload**. Path receipts add `ok`, `nodeSequence`, `totalCostUnits` (integer). Sensory receipts add observer, source, channel, quality (0 to 1000), signal cdB, ambient cdB, bearing.

**IDs must be content-derived, never random.** A random `queryId` makes identical simulations produce different receipt hashes. Trace IDs, timestamps, latency and memory readings belong in a separate **non-deterministic telemetry record excluded from all hashes.**

### 10.2 Failure taxonomy (fail closed)

**SETTLED.** Physics and infrastructure failure must never be conflated.

| Class | Meaning | Receipt? | Ledger response |
|---|---|---|---|
| `SUCCESS` | Query completed | Yes | Commit events with proof |
| `PHYSICALLY_IMPOSSIBLE` | The geometry evaluated and forbids it (no path, blocked LoS) | **Yes**, a valid receipt | Commit an intentional outcome such as `ACTION_STALLED_BY_OBSTACLE` |
| `SPATIAL_UNAVAILABLE` | Exception, schema breach, memory failure, timeout | **No receipt** | Halt or retry the tick. **Do not** record a physical fact |

The reason for the split: an earlier draft mapped every failure to `PHYSICAL_OCCLUSION`. A timeout recorded as an occlusion pollutes replay, which reads it as "the wall blocked it" when in truth the query never completed. Transient infrastructure faults must not become permanent narrative facts.

**Fail-closed rule:** if a required spatial check cannot complete, the physical event does not occur. No coordinates change and no somatic points are spent. Distinguish that from the retry policy above: unavailability halts or retries; impossibility commits a recorded refusal.

### 10.3 Audit persistence

No state-altering spatial event (`ACTOR_MOVED`, `OBSERVED_EVENT`, `ACOUSTIC_HEARD`) enters the ledger without its verification envelope: `topology_hash`, `overlay_hash`, `query_hash`, `receipt_hash`, `kernel_version`. Columns must be **nullable for rejected and aborted events** (which by construction may have no successful receipt) with a check constraint requiring them for committed spatial event types. An earlier schema declared them `NOT NULL` for every row, which made `STALL` events unsatisfiable.

**A correction to a claim made along the way:** storing only hashes does **not** allow "replay verification without re-running the kernel." A hash proves integrity only if you hold the original receipt to compare against. Either store the receipt body, or state plainly that replay re-runs the kernel and compares hashes. Both are defensible; the false claim was that hashes alone suffice.

### 10.4 Golden receipts

Committed JSON fixtures containing tactical layouts, obstacle masks and expected receipts. If a refactor shifts a single receipt hash, the build fails and requires an explicit "regenerate goldens" commit with a written reason. This is the protection against silent determinism drift and it is also how a **kernel version change becomes a decision**: reproduce every golden receipt and the change is compatible; fail any and you have a new epoch.

---

## 11. Analytical transit (lazy regional travel)

### 11.1 The idea and its honest cost

An actor on a regional edge is not ticked. Position is a **pure function of time**, so a character can cross a state with **no per-tick cost**. Note the precise claim: there is no *per-tick* cost. There is still bookkeeping (an interval index that must be built and maintained, catch-up on wake), so "zero CPU" overstates it.

### 11.2 Transit is a route, not a line

An earlier formula interpolated linearly between origin and destination. Roads and waterways are not straight lines. A journey is a sequence of edges:

```text
TravelState = { routeId, edgeSequence, departureTime, arrivalTime, speedProfile, overlayVersion }
position(t) = positionAlongRoute( cumulativeDistance(t) )
```

Speeds differ per edge, edges can close, a ferry is a discontinuity, and a vehicle can stop. The linear interpolation was a conceptual shortcut only.

### 11.3 Authoritative discontinuities

**SETTLED.** Analytical transit is valid **only between events that can change the calculation**:

```text
depart → analytical interval → known boundary → re-evaluate → analytical interval → arrival
```

Boundaries include an overlay change (a flood begins), a scheduled event on an edge, a mode change, a stop, and a route change. The system must not blindly jump 100 hours forward if something is scheduled 30 hours in. This generalizes the specific problem of mid-journey cost changes.

### 11.4 Piecewise re-integration (the corrected algorithm)

The naive approach carries a *remaining duration* between changes. **That is wrong**, because the next change then scales a remaining duration as though it were a total. The earlier implementation gave arrival **1567** for a two-change case where the correct answer is **1300**, while passing its own single-change test.

**The invariant:** carry **progress as a fraction of the whole edge**, never a reused remaining duration. For a segment of elapsed time `e` under total cost `C_m`, progress advances by `e / C_m`. The remaining time under the final multiplier is `ceil((1 − p) · C_final)`. Use **exact rationals** (BigInt numerator and denominator) so identical consecutive multipliers compose exactly.

Rules that must be explicit:

- **Multiplier 0 means impassable.** The traveler is stranded at its current fractional progress and an `ACTOR_STRANDED` transition is emitted.
- A change after the projected arrival is ignored.
- A change before the segment start is skipped.
- Multiple changes apply in chronological order, with ties broken by input order.
- Total cost at a multiplier is `roundHalfEven(baseCost · multiplierBps / 10000)`, and a non-positive result is an error.

**VERIFIED (code)** for the corrected version in Appendix A: it reproduces the hand-derived values 1700 (single ×2 change), **1300** (two changes), 1500 (an edge already at 2× returning to 1×), and strands correctly at 30% progress on a washout. It also passes a **split-invariance property** (2,998 randomized cases: inserting an identical duplicate change never alters arrival) and agrees with an **independent tick-by-tick integration** across 3,000 randomized cases within a 3-tick tolerance.

The property test worth keeping permanently: *splitting one environmental change into two equivalent changes must not alter the final arrival time.* It would have caught the original bug immediately.

### 11.5 Encounter detection without ticking

To detect two `IN_TRANSIT` actors crossing without simulating them, treat each as an interval on a graph edge and solve exactly.

Positions on the normalized edge `[0, 1]`:

- Forward actor A: `x_A(t) = (t − eA) / dA`
- Reverse actor B: `x_B(t) = 1 − (t − eB) / dB`

**Head-on** (opposite directions), setting `x_A = x_B`:

```text
t_meet = (dA·dB + eA·dB + eB·dA) / (dA + dB)
```

**Overtake** (same direction), setting `(t − eA)/dA = (t − eB)/dB`:

```text
t_overtake = (eA·dB − eB·dA) / (dB − dA)
```

An encounter is real **iff** the exact rational time lies inside the temporal overlap window `[max(enter), min(exit)]`. **Test the window on the exact rational before rounding**, then round half-even and clamp into the window so rounding cannot leave it.

Errors found in earlier versions, all corrected:

- The first version used the **midpoint of the overlap window**, which is not the meeting time (correct only if both durations are equal).
- The overtake condition was a symmetric nesting test that did not correspond to a pass.
- The double loop was O(n²) despite the document's own stated aversion to pairwise checks.
- The arithmetic overflowed `Number` at realistic tick magnitudes.

The corrected version sorts by entry tick (ties by actor ID in code-unit order) and prunes with a sweep: once a later entry is at or after the current actor's exit, nothing further can overlap it. **VERIFIED (code):** unequal-duration head-on (t = 5), overtake (t = 10), parallel equal-duration (no encounter), large ticks near 2 × 10¹² (exact), and 4,000 randomized cases agreeing with an independent floating-point solve.

Design decisions and limits to record:

- **Equal durations, same direction, same entry tick** means the two travel together and are co-present for the whole overlap. The reference code flags this as a `CO_TRAVEL` type. That is a choice, not a derivation; confirm it is what you want.
- **An encounter exactly at a node** (one actor exits the edge at the instant another enters) is skipped by the strict prune. It is a node-level event and must be handled elsewhere.
- **The interval index must be maintained.** When a cost change alters an actor's exit tick, the ledger must update that actor's interval and re-run detection for the affected edge. That maintenance logic is not yet specified (OPEN).
- The pure kernel exposes `edgeDuration(edgeId, overlayHash)`. The **ledger stores** the resulting intervals. Storing precomputed windows *inside* the kernel contradicted "zero mutable state"; the split is correct.

---

## 12. Dormancy, "the Void", and computational existence

### 12.1 The best single sentence in the discussion

> **Computational existence need not equal physical existence.**

The world is canonically defined everywhere and computationally active only where required. Dormancy is a property of **computation**, never of the world. A dormant road still exists, still has a cost, and still has a well-defined state as a function of time and overlays.

This is what lets state-scale geography and room-scale tactics share one architecture. A Wiregrass-scale world may contain millions of square kilometers, thousands of roads, and tens of thousands of possible sites, while only a handful of buildings, two vehicles and one confrontation are actually active.

### 12.2 Occupancy-gated activation

Instantiate a tactical host only when actors are present in that site. Empty crawlspaces cost nothing. Only one thing must be true: a site's compiled geometry exists as static data whether or not a host is running.

### 12.3 The trap: dormancy must not become "the world paused"

If nothing simulates in an empty room, things that *should* have happened (a door left open, a pipe that burst) silently do not. The fix is **catch-up on wake**: Sower applies an algebraic delta to the environmental overlays over the elapsed interval **before** calling spatial, and the kernel receives the evaluated snapshot as of the entry tick. Example: after 5,000 dormant ticks, structural moisture decay or fuel burn is computed as a closed-form function of elapsed time.

**Dormancy defers simulation; it never cancels consequences.**

### 12.4 Hot, warm, cold

| Loop | Cadence | Where |
|---|---|---|
| **Hot** | Per tick, while a scene is active | The site host |
| **Warm** | Coarse, scheduled | Abstract regional movement and background processes |
| **Cold** | On demand | Analytical integration when a dormant thing is summoned |

The MMO-derived numbers attached to these loops (60 Hz, a 50 ms envelope, a 300-entity threshold) were tuning guesses for a different workload, not facts. Do not inherit them.

---

## 13. Scale: thousands of actors

### 13.1 What changed

The discussion began with a small-cast assumption (2 to 10 actors per scene) and used it to argue against host-level partitioning. The stated requirement is **thousands of actors**, which invalidates that argument. What survives and what does not:

- **Survives:** purity of the kernel, and the ledger as the single authority.
- **Survives with a stronger case:** spatial hashing and interest management.
- **Revised:** a single process holding all positions is no longer enough. Partitioning becomes necessary, and it is an **execution concern, not a kernel concern**: the kernel takes a slice of the world as input and the host decides which slice each isolate handles.

### 13.2 Thousands of actors is not thousands of tactical simulations

| Actor state | Typical share | Cost model |
|---|---|---|
| `IN_TRANSIT` on a regional edge | Most | No per-tick cost; interval index only |
| `STAGED` but unobserved | Many | Coarse; re-evaluated when something touches the site |
| `STAGED` in an active scene | A small hot set per site | Full tactical fidelity |

If the requirement is *thousands simulated with full tactical fidelity in one place*, that is unusual for a narrative simulation and should be confirmed (OPEN).

### 13.3 The O(N²) collapse and its algorithmic fix

The blow-up that motivated sharding is comparing every entity to every other. It is an **algorithm problem with an algorithm fix**:

1. **Spatial hashing.** Key entities by packed cell ID so a neighbor query touches at most 7 buckets (the cell plus its 6 neighbors). Cost scales with **local density**, not total population.
2. **Interest management.** Compute perception only for (emitter, listener) pairs inside the sensory horizon. A shout that decays below the noise floor after 8 cells is never evaluated against a listener 40 cells away. This is the **main CPU win**, not merely a bandwidth trick.
3. **Dirty flags.** Recompute a cell's results only when something in range changed.
4. **Amortization.** Spread expensive sweeps across ticks.
5. **Only then** consider sharding.

The sensory horizon must use the hex metric and be consistent with the site: a 15-cell horizon does not fit a radius-5 lattice, which an earlier draft overlooked.

### 13.4 Work budgets

**RECOMMENDED, and cheap to build in early.** Every traversal takes an explicit budget (`maxExpansions`, `maxPathLength`) and returns a defined `BUDGET_EXHAUSTED` result when it is exceeded. This converts an isolate-timeout failure into a **deterministic, replayable outcome**. Treat any target latencies (a rough 2 ms for LoS, 0.1 ms for local adjacency) as engineering targets to measure, not platform facts.

### 13.5 Partition unit: the site

Work is split across isolates. The question is what must stay together. The operations that need mutual consistency are all **local**:

- **Contention:** two actors claiming one cell in a tick.
- **Perception:** emitter, listeners and occluders in range.
- **Displacement:** occupancy of surrounding cells.
- **Contact:** everyone within `d_hex ≤ 1`.

| Candidate unit | Verdict |
|---|---|
| Per actor | Every query becomes cross-partition |
| Per fixed-size H3 cell | A scene can straddle a boundary; the cell has no relation to where scenes happen |
| Per hex region within a room | A room is already small enough to be one unit |
| **Per site** | **Wins for tactical work** |
| Whole world | The single-isolate design; fails at your scale |

A site wins because tactical space exists only inside authored sites and the only way in or out is a **portal node**. A site is a **closed system with a small set of entrances**. Two actors in different sites cannot contend, cannot perceive each other through geometry, and cannot be adjacent. That is exactly the property a partition unit needs.

**Regional space is different.** It has no rooms. Most regional actors need no partition at all, because transit costs nothing per tick; regional work is routing (stateless) and encounter detection (per edge).

**Where site partitioning breaks:**

1. **A crowded site** (a stadium, a market, a battle) can exceed one isolate. Splitting the *inside* of a site is then legitimate.
2. **Sites that are not closed** (a fairground, a rail yard) behave like regional space. Decide at authoring time whether they are one site or several linked ones.
3. **Portal crossings** are the one cross-partition operation (§16.7).
4. **Observers spanning sites** subscribe to multiple hosts; that is a client-side fan-in.

### 13.6 CellDO: deferred, with its real cost

**DEFERRED.** CellDO was proposed, rejected, re-adopted, then relabeled. The consistent conclusion is that it is a **load-adaptive escape mechanism, not a normal hierarchy level**.

- **Trigger:** profiling shows a single site still exceeds budget after spatial hashing and interest management.
- **Prerequisite:** a proven cross-authority migration protocol.
- **Real cost (understated in the source):** splitting a live site means migrating actors between hosts while requests are in flight, updating routing, suppressing duplicates, and preserving the "exactly one owner" invariant throughout. That is the distributed handoff problem and the hardest one in the design.

Document it as `Status: DEFERRED. Activation: measured overload only.` An architecture diagram that draws it as available implies it costs nothing.

---

## 14. Ports, adapters, and the bridge

### 14.1 The correction

The bridge was originally proposed as a **networked service**: a client SDK, an edge gateway worker, HMAC transport authentication, transport selection and 50 ms timeouts. It was motivated by a preference that Sower not import the kernel directly.

That preference is legitimate, but it was honored at the **network** level when it needed only the **package** level. The cost was async everywhere, a failure surface on a geometry call, and a query path that could stall the simulation tick. Later versions correctly reversed it.

**SETTLED.** The bridge is **a typed interface with interchangeable implementations**. The seam stays; the wire goes away.

```text
worker-sower-engine
   │  calls a plain synchronous function
   ▼
SpatialPort    ← interface in @goblin/spatial-types (no URLs, no timeouts, no Promises)
   ├── InProcessAdapter   (default)  → @goblin/spatial-core directly
   ├── RecordingAdapter   wraps any adapter; logs (queryHash, receiptHash, kernelVersion)
   ├── ReplayAdapter      serves recorded receipts; fails on any unseen query
   └── RemoteAdapter      optional slot; build only if something forces it
```

### 14.2 What the seam still provides

- **Repo decoupling** via a package boundary. Sower depends on the types package and an adapter, never on the kernel directly.
- **The scrubbing rule**, enforced by the query types themselves: only coordinates, IDs, masks and integer budgets can cross. No character names, health or narrative context.
- **The evidence adapter** stays in Sower because it needs Sower's domain types (converting percepts to beliefs).
- **Batch-native calls** (`findPathBatch`, `findWitnessesBatch`) from day one, so a future remote adapter pays serialization once per tick rather than once per actor.
- **Version checks** at the adapter: every receipt carries `kernelVersion` and `schemaVersion`, and the adapter refuses receipts it cannot interpret.

### 14.3 Consequence for failure semantics

With no timeout, `SPATIAL_UNAVAILABLE` means only an exception or a schema breach, not a slow network. It is far rarer than the network-bridge design implied.

### 14.4 The `SpatialPort` surface

```ts
interface SpatialPort {
  readonly kernelVersion: string;
  findPathBatch(topologyHash, overlay, queries): PathReceipt[];
  findWitnessesBatch(topologyHash, overlay, queries): SensoryEvidenceReceipt[];
  resolveDisplacement(topologyHash, overlay, query): DisplacementResult;
}
```

Implementations must source `kernelVersion` from the kernel, not declare it.

### 14.5 A caution on alternative kernel implementations

The port permits a Rust or native kernel. Building a **second kernel implementation** is a major undertaking: it must produce **byte-identical receipts** to the first, which is a much harder equivalence problem than backend parity between storage adapters. Treat any non-TypeScript kernel as a project with its own oracle, not as a swap-in adapter.

### 14.6 LLMs and the port

**SETTLED.** LLMs have **no authority** over spatial truth and **no place in a query path**. They may:

- formulate a question,
- **propose an intent** (through the same intent path as a human),
- read and explain a receipt,
- assist at **authoring time**, proposing layouts that the deterministic topology compiler then accepts or rejects.

They may not evaluate geometry, hold write authority, or resolve a spatial conflict. The rule that reconciles "no LLM" with "LLMs are useful": **LLMs may generate inputs to the compiler and read outputs of queries; they never sit inside a query path.** Routing Dothan to Bainbridge is a closed-form graph search with an exact answer computed in milliseconds at zero cost. Sending it through an inference loop adds seconds of latency and billing and destroys reproducibility.

---

## 15. Where the design drifted, and what it bought

The conversation was strongest when it argued for purity and weakest when it added moving parts to satisfy a preference. This register keeps the reasoning so rejected ideas are not re-proposed by accident.

### 15.1 Drift that returned nothing

| Idea | Why it was proposed | Why it failed |
|---|---|---|
| **Networked `SpatialBridge` service** | A preference not to import the kernel directly | Bought repo decoupling, which a package boundary already gives. Cost async everywhere and a failure surface on geometry. |
| **StageDO as position authority** | Microsecond in-heap lookups | The latency was never a bottleneck at the original scale; cost split-brain, loss of Miniflare-free oracle testing, and a distributed handoff protocol. |
| **CellDO mitosis** | Imported from an MMO notebook | Thresholds (35 ms, 300 entities, 90 MB) were tuning guesses for another workload. Conflated a runtime limit with an algorithm problem. |
| **LLM stage-director inside the edge runtime** | Conversational scaffolding and witness queries | Gains were authoring conveniences, not runtime needs; every cost landed on the simulation path. |
| **Assuming Durable Objects as the host from turn one** | The framing began with "what if it lived in a Worker" | Isolate limits, cold starts and CPU slices exist only if you choose that host; a pure kernel does not care where it runs. |
| **RegionalDO as a stateful directory** | A place to hold macro routing | Its useful jobs (serving CSR shortest paths, resolving a site's DO name) are stateless; its stateful job (who is in transit) belongs in the ledger. |

### 15.2 Drift that looked like waste but bought something real

- **Lazy transit and occupancy gating** survive in pure form; only the DO framing was drift.
- **The scale boundary and the `STAGED | IN_TRANSIT` union** remove a class of bugs.
- **The bridge *contract*** (typed port, scrubbing, evidence adapter) is valuable once it shed its transport.
- **Fail-closed and the audit set** were introduced under the bridge but are independent of it.
- **The piecewise transit and encounter math** filled a genuine gap in the pure design.

### 15.3 Drift that returned negative value

These added an operational convenience *into* the mathematical layer and degraded it: wall-clock timing inside a hashed receipt, `node:crypto` in the portable core, `localeCompare` in a tiebreak, hash-based tiebreaking applied to pathfinding, and treating a system fault as an occlusion.

### 15.4 The pattern

Nearly every wasted addition traces to one of three moves:

1. **Importing a solution before confirming the problem** (MMO sharding, isolate tuning).
2. **Treating a preference as a requirement** ("I'd rather not import it directly").
3. **Letting the host define the design** (once "Cloudflare DO" was assumed, the design began serving the runtime instead of the math).

### 15.5 The test that catches each one

> *Does this make spatial harder to run in a plain Vitest process with no network?*

Every item in 15.1 fails it. Every item in 15.2 passes it.

### 15.6 A gap the opposite way

Effort went into *protecting* a pure function from hosts it never needed, and comparatively little into *proving* the function. **The integer supercover LoS and its brute-force oracle remain unwritten**, and they are where the design's central promise lives. Investment should go into the oracle, not the infrastructure.

---

## 16. Cloudflare deployment

### 16.1 Platform facts, verified against Cloudflare documentation

These were checked on the snapshot date. **Re-verify before depending on any of them.** They change, and figures quoted in the earlier source documents were inconsistent (50 ms, "30 to 100 seconds", "up to 1 GB").

| Claim | Status | Implication |
|---|---|---|
| DO CPU time per invocation (request, WebSocket message, alarm) defaults to **30 seconds**, configurable up to **5 minutes** via `limits.cpu_ms`; each new request or message resets the timer | **VERIFIED (docs)** | The old "50 ms" figure is not a platform law. Design around measured budgets regardless. |
| CPU time counts active processing only, not time waiting on I/O | **VERIFIED (docs)** | Awaiting storage or network does not consume the CPU budget. |
| Each DO is single-threaded; soft limit of about **1,000 requests/second** per object; an overloaded object returns an error to the caller | **VERIFIED (docs)** | **Each site host is a throughput ceiling.** Expensive queries and large JSON serialization lower it. Cap per-site work. |
| Workers memory is about **128 MB** per isolate | **VERIFIED (docs)** (several sources agree) | Bounds the in-memory hot set and manifest. Use typed arrays. |
| Each SQLite-backed DO has private, **transactional, strongly consistent** storage, up to **10 GB** per object (paid plan) | **VERIFIED (docs)** | An atomic multi-write append inside one DO's storage is supported. |
| Synchronous `transactionSync(callback)`: the callback must complete synchronously, must not be async; an exception rolls back | **VERIFIED (docs)** | The atomic append should be written as a synchronous transaction over `storage.sql`. Async `transaction()` exists for other cases. |
| Writes are not awaited by the app; **output gates** hold outgoing responses until writes are confirmed; on write failure the response becomes an error and the object restarts | **VERIFIED (docs)** | You do not need to `await` every write for durability of what a client sees; a failed write can never be observed as success. |
| Multiple writes with no intervening `await` are **coalesced and stored atomically** (all or none) | **VERIFIED (docs)** | A second route to atomic batch append. Prefer the explicit transaction for clarity. |
| In-memory state is **reset when the DO hibernates or is evicted** (idle about 10 seconds with no events); the constructor runs again on wake | **VERIFIED (docs)** | RAM is a cache. Hydrate in the constructor. |
| **Alarms and incoming requests prevent hibernation**; outgoing connections and pending timers also pin the object | **VERIFIED (docs)** | **"Autonomous heartbeat ticks" and "zero idle cost" pull in opposite directions.** An always-on tick loop keeps hosts warm. Choose deliberately. |
| WebSocket Hibernation: clients stay connected while the DO is evicted; `serializeAttachment` persists up to **2,048 bytes** per socket; up to **32,768** sockets per instance | **VERIFIED (docs)** | Bulky per-socket state goes in storage, with the key in the attachment. |
| `PRAGMA user_version` is **not supported** on DO SQLite | **VERIFIED (docs)** | Track schema version in your own table. |
| SQLite-backed DOs offer **point-in-time recovery** for up to 30 days | **VERIFIED (docs)** | A useful backup layer, but it is not a substitute for the event log and snapshots. |
| Storage is billed by size and rows read/written; duration is billed while the object is active or idle-but-unable-to-hibernate | **VERIFIED (docs)** | "$0.00 idle" was oversold. Requests, storage and rehydration cost money. |

**Not verified and still assumed:** actual per-call latency, cold-start time for a loaded manifest, and how many actors a single site host can sustain. Those are measurements, not documentation.

### 16.2 Why Durable Objects fit, and what they are not

A Durable Object gives **one instance per ID, requests processed one at a time in one place**, with attached transactional storage. For a site partition that supplies exactly what is needed: serialized contention resolution without locks, stable addressing (`idFromName(siteId)`), and a natural fit for occupancy-gated activation (an empty site has no running instance).

They are **hosts for the pure kernel and the reducer**, and the natural home for a per-site log **if** you choose the first configuration in §5.4. They are not a reason to change the kernel.

### 16.3 Thin wrapper, drawn precisely

Earlier the claim was "the wrapper adds hosting and never behavior." With the ledger inside the DO, the host also owns **persistence, ordering and concurrency**, which *are* behaviors. The honest boundary splits the DO's contents:

```text
SiteDO
├── Ledger layer (application logic; a PURE reducer)
│    • append events in order      • assign sequence numbers
│    • enforce invariants          • project current state from events
└── Hosting layer (Cloudflare-specific, thin)
     • storage API calls           • WebSocket, alarms, hibernation
     • request routing             • wire (de)serialization
```

The ledger reducer is `(state, event) → state` and **never touches storage directly.** Storage sits beneath it behind `LedgerPort`. Then the rules-bearing logic runs in plain Vitest and only the storage adapter needs Miniflare. **What lives at the edge is a host for two pure libraries, not a stateful application.**

The wrapper's responsibilities, split:

| Wrapper owns (hosting) | Kernel/ledger owns (meaning) |
|---|---|
| Receiving a request; finding the DO | Every geometric result |
| Loading the compiled topology | Validating overlays against the manifest |
| Holding the working set for hot actors | Tie-breaks and contention |
| Persisting snapshots | Receipt construction and hashing |
| WebSockets, hibernation, alarms | All integer math; determinism |
| Serializing across the isolate boundary | Invariants and projections |

If you write a conditional about game meaning inside a DO class, it belongs in the kernel or in Sower.

### 16.4 Recommended layout

```text
monorepo/
├── packages/
│   ├── canon-types/      # zod: topology manifest, sites, portals
│   ├── spatial-types/    # SpatialPort, queries, receipts, overlay schema
│   ├── spatial-core/     # PURE kernel: no Cloudflare, no I/O
│   ├── ledger-types/     # LedgerPort, event schemas, intent schemas
│   ├── ledger-core/      # PURE reducer, invariants, projections
│   ├── sim-core/         # PURE simulation rules (Sower's logic)
│   ├── determinism/      # sha256, hmac, canonical JSON, integer math, ordering
│   ├── contract-tests/   # suites run against every backend
│   └── testkit/          # fixtures, scenario recorder/replayer, oracle
├── adapters/
│   ├── ledger-memory/    ledger-sqlite/    ledger-do/
└── apps/
    ├── local-runner/     # Node: dev, offline, episode production
    └── edge/             # Cloudflare: Worker + DO shells
```

Enforce the boundaries **mechanically** (§20.6). A convention nobody checks will erode.

### 16.5 The per-site host

```ts
export class SiteDO {
  constructor(private ctx: DurableObjectState, private env: Env) {
    ctx.blockConcurrencyWhile(async () => {
      const manifest = await loadManifest(env, siteId);       // hash-verified
      const ledger   = new DoLedgerAdapter(ctx.storage);      // adapters/ledger-do
      const spatial  = createSpatialPort(manifest);           // pure kernel
      this.engine    = createSiteEngine({ ledger, spatial, seed: env.WORLD_SEED });
      this.engine.recover();     // latest snapshot + tail; verify hashes; fail loudly
    });
  }
  async fetch(req: Request) {
    const events = this.engine.handle(decodeWire(await req.arrayBuffer()));
    this.broadcast(events);
    return encodeWire(events);
  }
}
```

Use `blockConcurrencyWhile` for **one-time initialization only**, never per request. The platform's own guidance warns that wrapping every write in it caps throughput. `SiteEngine` is a plain class shared by `local-runner` and the DO. The shell contains no decision logic. A failed `recover()` is an alert, not a silent reset.

### 16.6 Regional routing: a stateless Worker

A compiled CSR graph is **immutable data**, so any isolate can answer any query and it scales horizontally with no coordination.

```ts
let router;
export default {
  async fetch(req, env) {
    router ??= createRegionalRouter(await loadCsrGraph(env));   // hash-verified typed arrays
    const q = await req.json();
    return Response.json(router.findPathBatch(q.topologyHash, q.overlay, q.queries));
  },
};
```

Check the graph's actual in-memory size against the isolate memory ceiling before committing. `RegionalDO` earns a place only if you separately host the regional portion of the ledger at the edge and need single-writer semantics there. That is a hosting decision made for its own reasons, not a spatial requirement.

### 16.7 The crossing protocol

Moving an actor between sites (or into or out of transit) is the **one operation spanning two hosts**, and the place where the "exactly one owner" rule is most at risk.

**RECOMMENDED design:**

1. The actor's **location record is owned by one component**: a `WorldDO`, or a per-actor DO if you prefer not to centralize. It stores `siteId | IN_TRANSIT(edge, departTick)` per actor.
2. A crossing is a request to it: "move actor X from A to B at tick t."
3. It validates (X is in A; B's portal is reachable) and appends **one** authoritative fact, `ACTOR_CROSSING_COMMITTED`, to *its own* stream.
4. Sites apply `ACTOR_LEFT_SITE` and `ACTOR_ENTERED_SITE` as **consequences**, keyed by the crossing ID. Delivery is at-least-once; application is **idempotent**.
5. A site that missed a notification **reconciles on wake** by asking for crossings affecting it since its last known one.

This makes the crossing one decision by one owner, with the rest being propagation of a decided fact. Local mode is the same protocol with in-process calls, so failure recovery is testable locally by dropping notifications.

Compared options:

| Approach | Verdict |
|---|---|
| Coordinator for crossings | Recommended; one extra hop only on rare events |
| Actor-owned location | Also sound; moves the single writer to the actor |
| Saga with compensations | **Rejected.** Reintroduces the two-phase complexity the design worked to avoid |

**Caveat that an earlier synthesis understated:** listing `LEFT_A`, `ENTERED_TRANSIT`, `ENTERED_B` as events with idempotent projection rules solves *what is recorded*, not *which component decides a crossing is allowed and in which transactional domain that decision commits*. If A's and B's logs are separate stores, three events cannot be appended atomically across them. You still need one place that records the crossing decision. If crossings become frequent, shard the coordinator by actor range or region, but only when measured.

**Tests specific to crossings:** an actor is never present in two sites at the same sequence; an actor is never in zero places unless in transit; a crash between the leave and enter steps recovers to a valid state on replay.

### 16.8 Ticks and time

**RECOMMENDED.** Time is an input.

- A scheduler emits `TICK_ADVANCED(n)` events; sites process ticks in order and never read a wall clock. The wall clock only decides *when* to emit the next tick.
- Tick delivery is idempotent (tick number plus site). The reducer's **strictly-increasing** rule turns a duplicate into a rejected no-op instead of corruption.
- Dormant sites receive no ticks. On wake they receive the current tick and apply catch-up (§12.3).
- Record ticks in the world stream so a replay reconstructs the schedule.

**The tension to resolve deliberately:** alarms keep an object warm (verified in §16.1). If you drive ticks with per-site alarms you forfeit hibernation savings. Drive ticks from one scheduler that addresses only *active* sites.

### 16.9 Per-site streams and ordering

A single global sequence counter forces every host to skip events for other sites. Prefer **per-site event streams** (each event carries `siteId`) with a separately defined merge order.

For global replay, promise **per-site determinism with tick-based merging and a deterministic tiebreak** (site ID, then sequence). A single total order across the world would require a global sequencer and become a bottleneck. The tiebreak must be a written rule, not an accident of arrival order.

### 16.10 The wire format

Define it explicitly. JSON defaults will damage a determinism-sensitive system.

- Use canonical JSON for anything hashed, on both sides.
- Encode BigInt as tagged strings; reject unsafe integers at the boundary.
- Version every message (`wireVersion`).
- Validate incoming payloads with the zod schemas in the `*-types` packages **before** they reach the engine, and fail closed.
- Never let the wire layer reorder or "normalize" numbers.
- Round-trip every message type in tests and assert hash equality with the original.

Prefer typed RPC methods for host-to-host calls over hand-rolled `fetch` protocols where the platform supports it.

### 16.11 Snapshots, archival, recovery

Event logs grow without bound.

- Every N events a site writes a snapshot `{siteId, atSeq, stateHash, state}` with the hash over canonical JSON. Loading recomputes and compares; a mismatch falls back to an earlier snapshot or a full replay.
- Old events (before the latest snapshot minus a safety window) move to object storage as hash-named objects; the host keeps only recent ones.
- A periodic **verification job** replays a random site from an archived snapshot and compares with live state. This is the ongoing proof that log and reducer still agree.
- **Rebuild is not free.** The claim "anything derived can be reconstructed" holds only if snapshots are frequent enough that replay stays short. Snapshot cadence is a design parameter with a cost on each side, and the recovery test should measure **time to recover**, not only correctness (§20.5).
- Track your own schema version (no `PRAGMA user_version`). Reducer changes use **immutable upcasters**: a bug in an upcaster is fixed by adding a new sequential upcaster, never by editing the old one, or historical replay silently diverges.

### 16.12 Viewer egress

WebSocket subscription is separate from simulation. A viewer connects to a subscription endpoint that forwards **filtered** events (§18). The simulation never waits on a viewer. Use the hibernation API for server-side sockets and measure what idle actually costs before promising anything. Many small messages can overwhelm a single object even when total volume is small.

---
