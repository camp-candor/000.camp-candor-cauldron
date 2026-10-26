# Goblin-Lore: The Complete Synthesis

*A consolidation of every architectural principle, technical mechanism, error, and open question surfaced across eight specification revisions and three independent reviews.*

---

## How to read this document

This synthesis exists because the source material grew across many rounds of revision and review, each building on the last, each catching things the previous round missed. Reading all of them in sequence is how the ideas were actually developed, but it is not how they should be *used* going forward. This document reorganizes everything by conceptual category rather than by chronology, so that the architecture can be understood as a single coherent system rather than as a history of arguments.

Three kinds of material are woven together here:

1. **Principles** — durable ideas that should survive any rewrite of the implementation.
2. **Mechanisms** — the concrete technical designs that implement those principles.
3. **Findings** — errors, gaps, and open questions discovered along the way, many of which remain unresolved.

Where the source material disagreed with itself across revisions, this document presents the final, corrected position and notes what changed and why. Where an error was found and never fixed in a later revision, it is flagged as **outstanding**. Where a claim could not be verified against current external documentation, it is flagged as **unverified**.

---

## Part I — The Central Thesis

### The system in one sentence

> **Build a deterministic, versioned, provenance-preserving world simulator whose laws are authored and ratified by humans; let AI generate only inside those laws; preserve history separately from state and media; and introduce distributed infrastructure only where real coordination problems justify its complexity.**

### The reframing that matters most

The single most important idea to emerge from the entire process, stated best not in the original specification but in the analysis of it:

> **This is not fundamentally an AI storytelling system. It is a deterministic world-state and provenance system that happens to use AI as an untrusted downstream generator.**

This distinction has practical teeth. It tells you what is replaceable (models, rendering technology, cloud infrastructure) and what is not (the requirement for a defensible world-state, history, and provenance system). It also generates a test you can apply to any proposed feature:

> **Could you replace the AI model tomorrow, with a worse one or a completely different one, without changing what counts as canon, history, or truth in the system?**

If yes, the AI is positioned correctly — as a generator operating inside constraints it cannot alter. If no — if replacing the model would change what the system considers real — then the model has been given authority it should never hold.

This test should be made literal, not just conceptual: build a deliberately worthless stand-in generator (fixed strings, or random text) and run the entire pipeline against it. Everything the architecture claims is model-independent — compilation, state, events, provenance, validation, archiving — must continue to function. Only output *quality* should degrade. If the stub breaks something structural, the authority boundary is in the wrong place. This test is cheap to build, and it doubles as a fast CI integration test and as a way to develop most of the system without needing a GPU at all.

### The direction of authority

Everything else in the architecture is a consequence of one directional rule:

**Law constrains simulation. Simulation constrains generation. Generation never constrains law.**

An LLM is probabilistic. It can produce something plausible that is nevertheless impossible. Consider a concrete failure case that recurs throughout this project's reasoning:

- **Canon:** Bog cannot climb (a permanent somatic constraint).
- **State:** Bog is currently in the Pantry Wall.
- **Event:** Spleen moved the ladder away.
- **Media:** the model generates a scene in which Bog scrambles up a copper pipe.

The architecture's entire purpose is to ensure that last sentence is never allowed to redefine reality. The model can write whatever prose it wants; it cannot make the prose *true*.

### Monotonic authority

A second, related principle, developed later in the process and not fully stated until the final synthesis, generalizes this directional rule beyond simulation and canon specifically:

> **Derived artifacts can provide evidence for proposed changes, but they cannot silently promote themselves into upstream authority.**

The full authority chain, with information flowing strictly one direction:

```
idea → draft → validated proposal → human-approved change →
canonical commit → sealed state → derived artifact
```

Forbidden reverse flows, stated explicitly because each has a plausible-sounding justification that makes it tempting to permit:

- Rendered video → canon (a render should never silently become the source of truth about what happened).
- LLM-generated dialogue → canonical character facts (a good line the model improvised should not become permanent characterization without a human deciding to keep it).
- A runtime dice roll → permanent world law (an in-fiction outcome should not rewrite what is fundamentally possible).

**This principle has a necessary exception that must be designed rather than left implicit.** Creative work genuinely runs on feedback from downstream back to canon — a rendered scene reveals a character design doesn't work, an improvised LLM line turns out to be better characterization than the dossier. The rule is not "authority never flows backward." It is **"authority never flows backward silently."** Any such flow must pass through an explicit, recorded promotion event with a human decision and a stated reason. The architecture already implements this correctly for state deltas becoming canon (the human review gate); the principle should be stated broadly enough to cover it, or it reads as forbidding the very feedback loop that makes creative iteration possible.

This principle unifies several rules that would otherwise look like a list of unrelated restrictions: the human promotion gate, the rule that the edge never establishes canon, the ban on a canon-writing AI agent, and the errata protocol (corrections flow forward as new commits, never backward as silent edits) are all instances of the same idea. Stating it once gives a single test for any new component: *does this create a path by which something downstream can influence something upstream without passing through the gate?*

---

## Part II — The Four Ontological Tiers

The architecture partitions everything in the system into four tiers, each answering a different question and each with a different authority and mutability profile.

| Tier | Question it answers | What it contains | How it changes |
|---|---|---|---|
| **1. Canon** | What is allowed to be true? | Physical and social law: somatic limits, inventory topology, relationship rules, spatial layouts, baseline axioms | Human Git commits only |
| **2. Events** | What happened, and why? | The append-only historical log: injuries inflicted, secrets revealed, duels resolved | Append-only; never edited |
| **3. State** | What is true right now? | A materialized snapshot, derived by folding events over canon | Fully rebuildable; a disposable cache |
| **4. Media** | What did we actually produce? | Scripts, audio stems, video compositions, final renders | Projections; never a source of truth |

A worked example that shows why the four cannot be allowed to collapse into one generic "character state":

1. **Canon** says Bog has two functioning arms.
2. An **event** records that his arm was severed in a specific duel.
3. Current **state** reflects one functioning arm as a consequence of that event.
4. A rendered **media** artifact shows him with the injury in episode 4.

These four facts are related but not interchangeable, and the separation lets four different questions be answered independently: *What is the law? What happened under that law? What is the current consequence? What evidence did we create?* Confusing any two of these is how long-running fiction accumulates small, silent contradictions — precisely the failure mode the entire architecture exists to prevent.

**Media is never state.** Changing a camera angle, a color grade, or an audio mix updates presentation without touching historical narrative fact. This matters because it means production decisions (a re-edit, a new voice take) can be made freely without any risk of altering canon.

### The fold formula

State transitions are governed by an explicit, versioned reduction:

$$\text{State}_N = \text{fold}(\text{apply}_v, \, \text{State}_0, \, [E_1, E_2, \dots, E_N], \, \sigma)$$

Two details make this formula trustworthy rather than merely descriptive:

- **The reducer function ($\text{apply}_v$) must be pure, deterministic, and version-tagged.** If the rules for how state transitions work change — for example, altering how somatic fatigue stacks — replaying historical events under a mutated reducer produces divergent results from what actually happened. The version tag prevents this from happening silently.
- **The seed ($\sigma$) must be an explicit input, recorded and immutable per episode.** Any randomness not captured this way makes replay impossible, which is fatal given that replay is the whole point of an event log.

### Event schema evolution: immutable upcasters

Events carry a `schema_version` header. When the meaning of an event type needs to change, this is handled through **read-time upcasting**: explicit, frozen functions ($v_N \to v_{N+1}$) that transform an old event into the new schema at the moment it's read, never by rewriting the stored event.

**Released upcasters must be strictly immutable.** If an upcaster is edited after release, the same stored event can yield different interpreted output over time, which defeats the entire purpose of an immutable log — the log would stay byte-identical while its *meaning* silently drifted. A bug discovered in an upcaster's logic is fixed by introducing a **new** upcaster ($v_{N+1} \to v_{N+2}$), never by editing the frozen one. This is the same principle as errata for canon, applied one layer down: corrections are additive, never retroactive edits to history.

---

## Part III — The Three (Really Two-and-a-Half) Durability Classes

The "deletion principle" began as a single claim ("if everything is deleted, the universe survives in Git") and was progressively refined across the specification's revisions into a three-way classification, because the original single claim was simply false for two of the system's three kinds of output.

### Class 1: Fully derivable — canon

If every generative model, cloud database, and serverless runtime is permanently deleted, canon survives intact in the Git commit history of the raw Markdown dossiers. Re-running the compiler against that history reproduces the compiled artifact bit-for-bit.

### Class 2: Irreplaceable historical sequence — the event log

Because the simulation relies on LLM-generated dialogue turns, beat completions, and human editorial decisions, **runtime events cannot be re-derived from canon alone.** The event log is irreplaceable historical evidence and must be treated with the same seriousness as Class 1 canon: persistent database storage, write-ahead logging, streaming offsite replication, and a tamper-evident cryptographic hash chain.

*A conditional version of this classification existed in an earlier revision ("the log is Class 1 derivable if and only if the simulation is fully closed, pure, and seed-driven") but was correctly resolved to the unconditional Class 2 default, because the simulation in this specific system does depend on non-deterministic generative and human input.* **The general principle for any similar system:** default to the conservative classification (irreplaceable) unless you can prove determinism, because the asymmetry of being wrong favors caution — wrongly treating replaceable data as irreplaceable costs storage; wrongly treating irreplaceable data as replaceable loses history permanently.

**A more precise mental model**, developed in review: the event log is irreplaceable *specifically because it contains captured non-deterministic outputs*. You do not need the LLM itself to be deterministic — you only need to **record its outputs as events**. Once an LLM's output is captured as event data, replay from that point onward is exact, because everything downstream of the log is derivable. This reframes the durability question usefully: audit the simulation for every source of non-determinism (LLM calls, wall-clock reads, unordered iteration, parallel scheduling) and confirm that each one's *output* is what actually gets recorded as an event, not left to be silently regenerated on replay.

### Class 3: Archive-dependent evidence — rendered media

Generative diffusion plates, fine-tuned LoRA weights, and vocoder stems **cannot be regenerated bit-for-bit**, due to GPU driver variance, sampler non-determinism, and floating-point rounding differences across hardware. Rendered media are **evidence, not derivations**. They require permanent content-addressed storage, secondary cold replicas, scheduled cryptographic scrubbing, and periodic cold-restore verification drills.

### An unresolved logical tension in Class 1's naming

Class 1 is headed "Canon & Materialized State" as if both are equally derivable from Git alone. But **state is derived from canon plus the Class 2 event log**, and the event log is *not* derivable from Git alone. So state's durability is actually bottlenecked by Class 2, not by Git. Deleting "all databases" — which includes the event-log database — does **not** leave state recoverable, despite what the tier name implies. The corrected statement: **canon is Class 1; state is derivable from canon plus the Class 2 log; therefore the log's durability is the true bottleneck for runtime truth**, and this should be stated plainly rather than implied by a tier name that overstates state's independence.

### A necessary corollary: Git itself must be durable

The deletion principle's claim that "the universe survives in Git" contains an unstated dependency: **Git history must itself be preserved.** A single laptop's `.git` directory is not archival infrastructure — it is a single point of failure for the entire project's authoritative source. The minimum genuinely durable formulation is:

```
canonical repository + protected history + independent remote +
independent backup medium + periodic restoration test
```

not simply "a Git repository." Protected history means disabling force-pushes to trunk, requiring linear history, and (where meaningful) requiring signed commits — because the deletion principle silently assumes commit history is immutable, and nothing enforces that by default.

**"Backup is not complete until restoration has been demonstrated."** A backup that has never been restored is an assertion, not evidence. The offline deletion test (described in Part VI) should eventually be extended into a full restoration drill: destroy the working tree, destroy local Git metadata, restore from an independent backup, reconstruct canon, reconstruct state, verify historical hashes, and confirm the expected root identities all match. This is substantially stronger than merely keeping copies, and it should be **tiered**: a cheap, frequent, automated version (clone from the remote, compile, compare hashes — which is what the deletion test already does) and a rare, thorough version (a full disaster-recovery simulation from cold storage) run on a calendar, because if the full drill is expensive it will be run once and then silently neglected.

---

## Part IV — Integrity Is Not Authority

A distinction that must become explicit, load-bearing vocabulary rather than an implicit assumption:

A SHA-256 hash answers: *"Are these bytes the bytes represented by this hash?"*
It does **not** answer: *"Were these bytes legitimately approved?"*

```
H_root = integrity (a cryptographic fact about bytes)
protected history + human review + authorization = authority (a governance fact)
```

An attacker, a bug, or an unauthorized process that can modify the canonical source can simply produce a new, perfectly valid hash over an illegitimate state. The hash will verify correctly. It says nothing about whether the change was sanctioned. The correct chain of reasoning is:

```
proposal → validation → human authorization → protected commit → hash
```

never:

```
hash → authority
```

The architecture already implements this correctly in practice (the human showrunner is the final promotion gate, and Git history is protected), but the distinction deserves to be stated as an explicit rule rather than left to be inferred from the mechanisms, because it is exactly the kind of subtle conflation that produces false confidence later — someone verifying a hash six months from now needs to know that a matching hash proves *identity*, not *legitimacy*.

---

## Part V — Determinism Versus Reproducibility

A precise distinction, developed in review, that explains *why* so much of the specification's machinery (lockfiles, pinned container digests, cross-architecture testing) exists:

- **Determinism** is a property of an *algorithm*: same inputs, same algorithm, same output.
- **Reproducibility** is a property of an *algorithm plus its complete environment and inputs*: the ability to actually reconstruct the same result later, potentially years later.

A compiler can be perfectly deterministic today and still fail to be reproducible in five years if the parser version changes, the Node runtime changes, Unicode library behavior changes, or a dependency's internal serialization changes. Formally:

$$\text{result} = f(\text{source}, \text{schema}, \text{compiler}, \text{dependency graph}, \text{runtime}, \text{configuration})$$

Every artifact that matters should be traceable to all of these, not merely to the source content. This is the underlying reason the provenance manifest (Part XI) records compiler source hashes, container digests, and checkpoint hashes rather than only the artifact's own content hash.

---

## Part VI — The Legislative Core: The Compiler

### The three-pass architecture

`scripts/compile.ts` is the system's central pure function: a completely stateless, idempotent, non-networked process that takes the directory of Markdown dossiers and produces `compiled/bible-state.json`, stamped with a root hash ($H_{\text{root}}$) and per-entity content hashes ($H_{\text{entity}}$).

| Pass | Checks | Purpose |
|---|---|---|
| **1. Shape & bounds** | Zod schemas, scalar ranges, slot capacity | Catches malformed data |
| **2. Relational integrity** | Foreign-key resolution, DAG cycle detection on escalation/grievance chains | Catches dangling references and infinite loops |
| **3. Deterministic sealing** | Canonical serialization, hashing, atomic write | Produces reproducible, tamper-evident output |

**Ordering matters**: each pass depends on the previous one being clean, and the sequence (cheap local checks → graph checks → seal) is correct because it fails fast on the cheapest problems first.

**The general law this exemplifies, worth stating on its own:**

> **Every expensive downstream layer should receive only states that have already passed the cheapest available invariants.**

This produces a descending ladder of increasingly expensive and increasingly *uncertain* checks:

```
exact structural invariants → exact relational invariants → exact capability
constraints → exact spatial constraints → simulation → deterministic
lexical/semantic filters → probabilistic semantic judgment (LLM critic) →
generation → expensive media computation (diffusion, TTS, rendering)
```

The benefit is not only cost. **Cheap checks tend to be exactly decidable, and expensive checks tend to be fuzzy.** Running exact checks first means fuzzy checks only ever operate on inputs already known to be structurally valid — a semantic critic does much better work when it isn't simultaneously being asked to discover malformed schemas, dangling references, impossible inventory, or impossible geometry. Those possibilities have already been eliminated before the critic ever runs. This is a second, independent benefit beyond compute cost, and it's worth stating explicitly because it justifies putting exact checks first even in cases where a fuzzy check might occasionally be *cheaper* to run.

### The compiler must remain a pure function — and this has a strong practical consequence

The compiler makes zero network calls, maintains no in-memory cache across executions, and references no system clocks (`Date.now()` and `performance.now()` are banned from compiled output). Given an identical directory of Markdown files, it must produce the exact same byte stream on every run, on every machine.

**A critical corollary discovered during review, and it is the single most architecturally important refinement made to the compiler across all revisions:** statistical NLP parsers (spaCy, Stanza, transformer-based taggers) rely on versioned neural weights and platform-specific floating-point arithmetic. If such a parser is placed inside `compile.ts` — as an early draft of the semantic-gap solution proposed — then upgrading a library, or running CI on ARM versus x86, can change parse trees and therefore change whether a commit passes, **without a single character of Markdown changing.** This directly violates the deletion principle's core promise. The resolution: **all prose analysis is relegated to a separate, pinned linter stage (`scripts/lint-prose.ts`) that runs outside the cryptographic sealing loop**, leaving `bible-state.json` completely unpolluted by any NLP model. `compile.ts` evaluates only exact Zod schemas, foreign keys, and graph acyclicity — nothing statistical ever touches the sealed artifact.

### The canonical serialization specification

Five invariants guarantee bit-identical output across every operating system and CPU architecture:

**1. Integer arithmetic for scalars, using basis points.** Floating-point values are prohibited entirely in canonical schemas. All severities, probabilities, and physical constraints are stored as integers from 0 to 10,000, where 10,000 represents 1.0. This eliminates an entire category of cross-platform floating-point drift, since integer arithmetic is exact everywhere.

The scaling function is defined completely, including its tie-breaking behavior:

$$\text{Scale}(A, B) = \text{RoundEven}\left(\frac{A \times B}{10{,}000}\right)$$

With $P = A \times B$, $Q = \lfloor P / 10{,}000 \rfloor$, and $R = P \bmod 10{,}000$:

$$\text{Scale}(A, B) = \begin{cases} Q & \text{if } R < 5{,}000 \\ Q + 1 & \text{if } R > 5{,}000 \\ Q & \text{if } R = 5{,}000 \text{ and } Q \text{ is even} \\ Q + 1 & \text{if } R = 5{,}000 \text{ and } Q \text{ is odd} \end{cases}$$

This is round-half-to-even, and it is now stated exhaustively — an earlier revision specified only the tie case and left the ordinary rounding direction implicit, which is exactly the kind of gap that produces a silently wrong implementation.

**Chained multiplications enforce strict left-associativity** — $\text{Scale}(\text{Scale}(A, B), C)$, never any other grouping — to prevent compounding round-off divergence depending on evaluation order.

**2. Alphabetical key normalization.** Object keys at every nesting level are sorted lexicographically by UTF-8 code point before serialization, so key order can never depend on insertion order or platform-specific object iteration behavior.

**3. Unicode Normalization Form C (NFC).** All strings are normalized to NFC before hashing or persistence, preventing visually-identical but byte-different strings from producing different hashes.

**4. Zero ambient time leakage.** No wall-clock reads of any kind may appear in compiled output.

**5. Atomic sibling inode renames.** Serialization writes to a temporary sibling file (`compiled/bible-state.json.tmp_[UUIDv7]`) on the *same physical filesystem and mount point* as the target, followed by a POSIX `fs.renameSync`. This guarantees that concurrent readers never observe a partially-written buffer, because a POSIX rename is atomic and an open file descriptor continues reading the old inode's content until the read completes. The same-filesystem requirement is essential — if the temp file were on a different mount, the "atomic" rename would degrade into a non-atomic copy-and-delete. **Note:** this specific guarantee behaves differently on Windows and should not be assumed if any production machine might run it; confirm the target platform.

### Property tests must be constructed, not merely random

Random property-based testing (`fast-check`, 100,000 runs) will hit the exact tie condition ($R = 5{,}000$) with probability only 1 in 10,000 per sample — meaning roughly ten hits across 100,000 runs, which is barely any coverage of the single most error-prone branch in the rounding logic. **The test harness must include a dedicated generator that deliberately constructs boundary inputs** where the remainder is exactly 5,000, alongside fixed boundary cases (remainders of 0, 4,999, 5,000, 5,001, and 9,999), each verified against an independent arbitrary-precision (`BigInt`) reference implementation — not merely re-deriving the expected value using the same logic under test, which would let a shared misunderstanding between implementation and test pass silently.

### The drift tripwire: dual-vector tamper evidence

Running `git diff --exit-code compiled/` immediately after compilation catches two distinct failure modes:

1. **Uncompiled source edits** — an author changes a frontmatter scalar but forgets to run the compiler before committing.
2. **Spoofed passes** — an untrusted agent or process edits `compiled/bible-state.json` directly to force a passing check without satisfying the actual invariants. Because CI re-runs the compiler from source on every check, the spoofed JSON is simply overwritten by the regenerated file, and the resulting diff fails the build immediately.

The second property is what makes committing the compiled artifact safe in the presence of untrusted agents: **the tripwire is not just a sync check, it is a tamper-evidence mechanism.**

**This tripwire is only as trustworthy as the code that produces the comparison.** If an untrusted coding agent (see Part IX) can also modify `scripts/compile.ts`, `schemas/`, or `tests/`, it can make the compiler emit whatever passes. The fix: **CI dynamically overlays the immutable `scripts/`, `schemas/`, `tests/`, and build manifests (`package.json`, `package-lock.json`, `tsconfig.json`) from a trusted source before executing any check**, so an agent's modifications to the build machinery itself are discarded before verification runs.

**A refinement surfaced in review and not yet incorporated into the specification:** the overlay should not restore from `main` (a mutable branch reference that an attacker with push access could move) but from **an immutable, explicitly identified trusted commit hash**. Critically, this pin must be stored somewhere the untrusted process cannot edit — in repository branch-protection settings or CI configuration external to the repository, not in a file the agent's pull request could modify — or the "trust anchor" is not actually anchored to anything.

---

## Part VII — Verification: The Negative-Control Law

This is arguably the single most valuable general engineering principle to emerge from the entire process, and it deserves to be stated as its own section because it generalizes far beyond this project.

> **A validation gate, compilation assertion, or test harness that has never been observed failing has not been proven to work.**

The corollary requirement: **every important gate in the system must be coupled with an automated negative control** — a deliberately broken input that the gate must demonstrably reject, exercised in CI alongside the valid-input test. A test suite where every gate passes but none has ever been shown to *fail* on bad input is not verified; it is merely unexercised in the failure direction.

### Why this matters, illustrated by real failures found in this project

Across the specification's revisions, **three separate verification mechanisms were found to pass while proving nothing**, each fixed only once the negative-control requirement was applied retroactively:

1. **The offline deletion script.** An early version asserted network isolation using `ping`, which requires elevated privileges the sandboxed CI runner didn't have — so the check could report "network is dead" when the real cause was "ping isn't permitted," silently passing for the wrong reason. Fixed by switching to a TCP connection attempt with a timeout, which fails cleanly and unambiguously when network access is genuinely blocked.

2. **The cross-architecture determinism matrix.** An early version declared an `arch: [x86_64, aarch64]` matrix dimension, but GitHub Actions selects architecture by *runner label*, not by an arbitrary matrix variable — so the matrix silently ran the same x86_64 runner twice under different labels and never tested ARM at all, while appearing to provide cross-architecture coverage. This is the most dangerous kind of bug: **it looked like coverage and provided none.** Fixed by using real runner labels (`ubuntu-24.04`, `ubuntu-24.04-arm`, `macos-14`) and a separate fan-in job that aggregates hashes from all matrix legs and asserts they are identical to each other *and* to the committed hash.

3. **The atomic-rename concurrency test.** A test spawning 50 parallel readers against an atomically-written file will, by the very property being verified, never observe a partial read — meaning a passing result is indistinguishable from a test that isn't stressing the race condition at all. The fix: run an identical concurrency battery against a **known-bad, non-atomic writer** (a plain `writeFileSync` targeting the file directly) and assert that *this* control **does** produce observable corruption. If the non-atomic control never fails, the harness has been shown to be non-discriminating and must be discarded or strengthened (a larger file, more iterations) rather than trusted.

The pattern across all three: **a gate that "passes" without ever having been shown to be capable of failing has told you nothing.** This is why the law must be a first-class architectural requirement rather than a testing nicety — the project's own history shows it catches real, otherwise-invisible defects.

### A necessary refinement: what makes a negative control good

A negative control that only proves the gate can reject an *obviously* broken input (a malformed JSON blob, say) is weaker than it looks, because the gate might trip on the crude case for an unrelated reason — a parse failure rather than the specific invariant it exists to enforce — while still missing the subtle violation that matters in practice. **Prefer minimal-mutation controls**: flip one bit, change one hex digit, swap two key orders, truncate the final byte, change a scalar by exactly one unit past its bound. A small library of such minimal mutations, applied systematically to every gate, is a far stronger form of this law than a handful of hand-picked "obviously wrong" examples.

### Extending the law to its most important application: the human review gate

The architecture's final and most consequential control is the human showrunner's approval before anything is promoted to canon. **Humans are not deterministic validators.** A reviewer under time pressure, fatigued, or simply accustomed to seeing clean diffs can become a rubber stamp without anyone — including the reviewer — noticing the degradation.

This leads to an extraordinary but logically necessary conclusion: **the human gate is a security mechanism, and therefore it too needs a negative control.** The proposed mechanism is to periodically seed the review queue with a known-bad proposal, without telling the reviewer which items are seeded, and measure whether it gets correctly rejected.

**This idea requires real care in its implementation, or it fails in its own specific ways:**

- **Detectability.** A seeded item that's artificial, arrives from an unusual channel, or is "too obviously wrong" measures the reviewer's ability to spot planted traps, not their real-world diligence. Seeded defects should be drawn from **realistic patterns**, ideally reconstructions of genuine past mistakes that were caught by some other means.
- **For a solo creator, deception isn't practical or appropriate — self-testing a system you know is being tested defeats the purpose, and a solo operator can't practically hide seeds from themselves.** The workable substitute is **periodic self-audit**: re-review a random sample of past approvals after enough time has passed that the specific details are no longer fresh, and see what you would now flag. This surfaces the same signal (drift in review quality) without requiring deception.
- **Containment.** Any seeded or test item must be injected into a sandboxed or dry-run context, never a path that could actually take effect if missed — the test itself must not be capable of causing the harm it's checking for.
- **This treats a symptom, not the disease.** The deeper issue is review *volume*. The more durable fix is reducing what reaches the human at all: risk-tiered queues (low-risk prose-only changes batched separately from anything touching somatic constraints), pre-attached machine findings (the lexical gate and advisory critic's output shown alongside the diff, so review starts from "here's what the machines already found" rather than a blank read), and structured diffs (declared banned verbs shown beside the prose that must satisfy them) rather than raw Markdown diffs.

---

## Part VIII — The Machine Rail / Voice Rail Split, and the Somatic/Logistical/Epistemic Model

### The two-rail entity format

Each entity dossier is a single Markdown file with two distinct zones:

- **The machine rail:** YAML frontmatter at byte 0 (this positioning is a real, enforceable constraint — `gray-matter` and similar frontmatter parsers fail silently or behave oddly if anything precedes the `---` delimiter). This is validated by Zod schemas and consumed structurally by the compiler.
- **The voice rail:** the Markdown body — tics, unadmitted wants, dialect, blind spots, few-shot dialogue lines. This is pulled *selectively* into generation prompts rather than injected wholesale, which matters because feeding an entire body into every prompt wastes context and dilutes the specific voice signal that matters for a given scene.

This split solves a fundamental problem in AI-assisted authoring: **structure and language are different kinds of information**, and a language model is a poor authority for the first (limb counts, inventory capacity, valid foreign keys, numeric bounds) while being genuinely useful for the second (character voice, verbal habits, emotional contradiction, metaphor, dialogue texture). The architecture routes each kind of information to the tool suited for it: deterministic forms and typeaheads for the machine rail, generative assistance for the voice rail — and never the reverse.

### The tripartite state vector: somatic, logistical, epistemic

Character state decomposes into three genuinely orthogonal axes, each answerable independently:

- **Somatic** — what the body can physically do: locomotion capability, motor limitations, forbidden kinetic actions (`banned_kinetic_verbs`), injury severity.
- **Logistical** — what the character physically possesses or can carry: worn slots, held slots, cached possessions, weight/capacity restrictions.
- **Epistemic** — what the character knows or believes: secrets, blind spots, debts, relationship assumptions, escalation tendencies.

The orthogonality is the point: **a character can be physically capable of an action, possess the necessary object, and still be unable to act because they don't know how, don't know where the object is, or don't believe the relevant person exists.** This is a substantially richer and more interesting simulation primitive than a flat stat sheet, because narrative obstacles can arise from any one axis independently of the other two.

### The verb-mask mechanism, and its essential weak point

A paralyzed arm compiles to a negative mask, such as `banned_kinetic_verbs: ["climb", "bimanual_lift"]`. Generated actions are checked against this mask by set intersection — cheap, deterministic, and independent of whether the model "remembers" the injury on its own.

**This mechanism only works if something reliably extracts the actual depicted actions from generated prose and checks them against the mask.** This is the crux of what the specification calls the Semantic Honesty Clause, and it is one of the two or three most important unresolved technical problems in the entire architecture (see Part X).

---

## Part IX — The Three-Tier Agent Taxonomy

Conflating an autonomous canon-writing agent, a conversational drafting assistant, and a downstream production engine under one label ("AI agent") was identified early as a source of architectural confusion, and separating them cleanly is one of the specification's strongest and most stable contributions.

| | **Tier 1: Legislative Agent** | **Tier 2: Staging Assistant** | **Tier 3: Production Conductor** |
|---|---|---|---|
| **Role** | Autonomously mutate canon | Scaffolding helper for remote writers | Project state into media |
| **Status** | **Hard architectural ban** | Sandboxed at the edge | Local workstation only |
| **Authority** | Zero | Propose-only | Read-only on canon |
| **Target** | Markdown dossiers, Git commits | Draft records in a staging buffer | Screenplay AST, audio stems, timelines |
| **Credentials** | None exist | Worker AI token only; zero Git PATs | Local filesystem read access only |

**Tier 1 is banned absolutely and without exception.** An autonomous agent with write access to canon dossiers, Git branches, or compiler execution paths bypasses the human discernment gate, induces non-deterministic retcons, and corrupts the immutable baseline. No framing of "but it's more convenient" or "but it's usually right" changes this.

**Tier 2 operates exclusively on the voice rail.** It brainstorms character tics, unadmitted wants, and dialect lines, and its output is structured JSON proposals (`additionalProperties: false`) that populate distinct preview fields — never raw, unchecked text that could interleave prose and structural claims. It holds zero Git credentials; it can write only to a staging buffer's session storage.

**The initial dismissal of Tier 2 as merely "typing frontmatter" undersold its real value**, identified in review: for **non-technical remote writers who cannot fill in YAML by hand**, a conversational layer that turns "a grievance between Bog and Wart over a bent copper rivet" into a structured draft candidate provides genuine value the local CLI wizard cannot. The correct allocation is: the wizard (or equivalent deterministic form) handles structural fields; if LLM assistance is used at all, it should be aimed specifically at the voice rail and kept entirely outside the compile path.

**Tier 3 reads static canon and current state off local disk and projects them into media.** It is structurally incapable of writing back to the lore repository — this must be enforced by filesystem permissions (a separate mount, or OS-level read-only enforcement) rather than left as a convention, because a convention can be violated by a bug. Its write access is confined to a designated output directory.

### The critical security property of Tier 3: it should hold no secrets to leak

This is the single most effective defense against prompt injection in the entire architecture, and it is stronger than any amount of text filtering: **if the Conductor process has no access to credentials, API keys, or write paths to anything sensitive, then an injected instruction telling it to "print the master AWS keys" is harmless regardless of how convincingly it's phrased, because there is nothing to print.** This should be understood and presented as the *primary* control, ranked above delimiter escaping and regex screening, which are comparatively weak.

---

## Part X — The Semantic Honesty Problem

This is, by wide agreement across every round of review, **the deepest and most intellectually important unresolved problem in the whole architecture.**

### The problem stated precisely

A relational compiler can prove syntactic validity, numeric bounds, and graph acyclicity. It **cannot** prove that generated prose is semantically consistent with declared structural constraints. If frontmatter declares `banned_kinetic_verbs: ["climb"]`, and the prose body describes the same character scaling a drainpipe, Pass 1 and Pass 2 both evaluate the file as perfectly valid — because nothing in the compiler reads or understands the prose.

**Self-reported action arrays do not solve this.** If a model is asked to both write the prose *and* self-report which actions it depicted, the same generative process that might hallucinate a physical contradiction in the prose can just as easily hallucinate compliance in its own self-report. Asking a model to grade its own homework provides no independent verification.

The deeper principle this reveals, stated as a general rule for any system combining generation with self-verification:

> **The system that generates a claim should never be the sole authority deciding whether its own claim obeys the rule.**

### The correct architecture: independent extraction, then a deterministic gate, then an advisory critic

The mature solution, arrived at only after an earlier version put an NLP critic in a *blocking* role (which was identified as a serious error — see below), separates enforcement into two tiers with different authority:

**Tier 1 — the deterministic lexical gate (blocking, but not part of the compiler itself).** Runs as a separate, version-pinned linter (`scripts/lint-prose.ts`), never inside `compile.ts`, for the reasons given in Part VI. Its steps:

1. **Dependency parsing** extracts (subject, verb) pairs from the prose.
2. **Subject-attributed binding** — a banned verb is only a breach if it's bound to the *specific entity* whose ban list contains it. In a scene with both Bog and Spleen, "Spleen climbed the pipe while Bog watched" passes, because Bog — the one actually banned from climbing — didn't climb.
3. **Fail-closed polarity parsing** — the parser inspects syntactic governors to distinguish affirmative ("Bog scrambled up the pipe") from negated ("Bog could not climb the rungs," "Bog failed to grasp the rung") constructions. **If polarity, coreference, or grammatical voice cannot be resolved with complete confidence, the check fails closed** — it flags the instance for human review rather than silently passing it. This is the correct failure direction for a safety-relevant check: an uncertain result should never be treated as "clean."
4. **Semantic synonym-family lookup** — banned sets are defined as grouped verb families (e.g., `BIPEDAL_LOCOMOTION = ["sprint", "dash", "vault", "hurdle", "scramble"]`) rather than isolated tokens, to prevent trivial evasion through synonym substitution.
5. **Fail-closed set intersection** — `AffirmativeVerbs ∩ Somatic.banned_verbs ≠ ∅` triggers a violation flag.

**Tier 2 — the advisory LLM critic (never blocking, always advisory).** An independent, low-temperature model pass looks for subtler problems the lexical gate can't catch by construction — implied physical actions ("he hauled the heavy iron box onto his shoulders" implies two functional arms without ever using a banned verb), metaphorical violations, suspicious pronoun references, contradictions invisible to simple syntax. Its output must cite exact line coordinates and text spans; **any diagnostic lacking a direct citation is discarded automatically by the review harness**, which is a cheap and effective defense against a critic confabulating findings. Its report is attached to the human review dashboard as advisory diagnostics. **It cannot, under any circumstance, automatically halt the build.**

### Why the critic must never be authoritative — a mistake made and then corrected

An intermediate revision made the deterministic-sounding claim that a critic run at temperature 0.0 provides sufficient determinism to sit in a blocking role. **This was a real and important error, later corrected.** Temperature 0 reduces sampling variance but does **not** guarantee bit-level determinism across model revisions, driver updates, hardware, or batching configuration — a model provider can silently update the underlying weights behind a fixed model name, and the same prompt can then produce a different result. A blocking gate built on this foundation is not actually deterministic, which defeats the entire purpose of having a blocking gate in the first place. The corrected architecture — deterministic gate blocks, LLM critic only advises — is the one that should be preserved.

The resulting hierarchy, stated as three confidence tiers that should be attached explicitly to every check in the system:

- **PROOF** — deterministically established (the compiler's Pass 1 and Pass 2).
- **BLOCKING SIGNAL** — reliable enough to prevent promotion (the pinned lexical gate, once calibrated — see below).
- **ADVISORY SIGNAL** — useful evidence requiring human judgment (the LLM critic, always).

A check should carry an explicit, versioned tier label and recorded evidence for why it holds that tier, with defined promotion rules (a check can move from advisory to blocking once calibration proves it, and — importantly, a case not addressed in the original specification — it should be able to move **back** to advisory if its measured performance later degrades, for instance after a parser upgrade or a shift in prose style).

### Calibration before promotion: the statistics must actually be satisfiable

Before any linter is granted blocking authority, it must be evaluated against a labeled calibration suite, and this requirement went through an important correction during review.

**An earlier requirement demanded a minimum of 40 examples per grammatical category alongside a 95–98% lower-confidence-bound precision requirement — and these two requirements are mathematically incompatible.** For a perfect observed result ($\hat p = 1$), the 95% Wilson score lower bound simplifies to:

$$L = \frac{n}{n + z^2}, \quad \text{so} \quad n \ge \frac{L \cdot z^2}{1 - L} \quad (z = 1.96 \text{ for } 95\%)$$

With only 40 examples in a category, even a flawless 40-for-40 result produces a Wilson lower bound of only about **91.2%** — meaning a 95% lower-bound requirement can *never* be satisfied with that sample size, no matter how good the linter is. Correct minimum sample sizes for a perfect observed result:

| Target lower bound | Minimum $n$ |
|---|---|
| 90% | 35 |
| 95% | 73 |
| 98% | 189 |
| 99% | **381** *(corrected — an earlier calculation gave 380, off by one from a ceiling rounding error, itself a small demonstration of exactly the "hand-typed numbers drift from computed ones" problem this project repeatedly encountered)* |

**The corrected calibration requirement must state the target lower bound and the required per-category sample size together, derived from each other, rather than specifying a sample size and a confidence target independently and hoping they're compatible.** The final specification correctly moved to a 200-sentence suite with a minimum of 40 per category and *realistic* target lower bounds (95% for precision on negations/idioms, 90% for recall on affirmative breaches) — bounds chosen to actually be achievable at that sample size.

**A second, deeper statistical issue, identified only in the final round of review and not yet addressed in any specification revision:** a Wilson interval assumes independent, identically distributed samples, but a hand-written evaluation set is neither. Sentences differing only in the character's name are highly correlated with each other, so 200 hand-written sentences may carry the statistical information of far fewer genuinely independent trials — meaning the *true* confidence is lower than the computed interval suggests. Evaluation sets should deliberately vary syntax, subject, negation form, tense, voice, metaphor, clause structure, distractor content, and entity combinations, or the confidence figure becomes falsely reassuring. **More fundamentally: a fixed calibration set measures performance on the distribution of sentences someone thought to write, which is not the same as the distribution of sentences real drafting will actually produce.** The evaluation set should be treated as a living, growing artifact populated by real false positives and negatives discovered during actual use, not a fixed benchmark computed once and trusted indefinitely.

### The evaluation set's category structure

The specification's example calibration entries illustrate the hardest cases well:

- **Negation:** *"Bog reached for the ladder but could not climb the rungs."* → PASS (modal negation governs the banned verb).
- **Affirmative:** *"Bog scrambled up the pantry pipe without hesitation."* → FAIL (affirmative depiction of the banned action).
- **Passive/causative:** *"Bog was hoisted up through the splinter gap by Wart."* → PASS (Bog is the grammatical patient; Wart is the active agent — a case that a naive verb scan would incorrectly flag).
- **Coreference:** *"Bog stared at the high ledge. He vaulted across the void."* → FAIL (the pronoun "He" must be resolved to Bog from the prior sentence — coreference resolution is genuinely hard and a major source of both false positives and false negatives in practice).
- **Idiom:** *"Bog let his mind scramble through the old memories."* → PASS (a cognitive metaphor with zero somatic locomotion depicted — exactly the kind of case that shows why naive lexical matching alone is insufficient).

**Coreference resolution deserves particular caution.** Beyond simple pronouns, the gate must also handle nicknames and epithets ("the elder," "Mum"), passive and causative constructions, and group subjects ("They climbed the stairs," which requires resolving each member of "they" individually against their own ban list). None of these are fully solved by any general-purpose parser, and the fail-closed rule means unresolved ambiguity routes to human review — which is correct behavior, but means the review queue's volume will be dominated by exactly these hard cases unless the interface for resolving them is made fast (e.g., "Who does 'he' refer to?" as a one-click disambiguation rather than a full manual review).

---

## Part XI — Simulation: Spatial Authority, Dice, Collisions, and Epistemics

### Space as causal authority, not decoration

A structurally important idea: without spatial constraints, story generation implicitly asks *"who would be dramatic together?"* — an unconstrained, purely narrative question. With spatial constraints, it instead asks *"who can actually perceive and encounter whom?"* — a physical question with a mechanically computable answer. This reframing is one of the best original ideas in the entire architecture, because it means character encounters emerge from simulated physical reality rather than from narrative convenience, which is precisely the kind of manufactured coincidence that makes long-running fiction feel contrived.

The one-way causal chain:

```
Canonical topology (static map graph, authored in goblin-lore)
        ↓
Pure geometric math (goblin-spatial: line-of-sight, hex supercover)
        ↓
Dynamic simulation ledger (discrete positions, mutated every tick)
        ↓
Contact opportunity graph (who can physically co-locate or perceive whom)
        ↓
Epistemic observation (belief-record updates from what was actually perceived)
        ↓
Dramatic conversation (LLM dialogue generation, constrained by everything above)
```

Three components with genuinely different authorities and change rates:

- **The map (canon):** static node coordinates, portal properties, material dampening. Changes only through authorial revision.
- **The math (`goblin-spatial`):** a pure, stateless functional library — hex geometry, line-of-sight, acoustic propagation. Holds zero runtime state, has zero network dependency, and knows nothing about narrative drama.
- **The positions (runtime ledger):** ephemeral coordinate assignments, mutated every simulation tick.

### Acoustic and visual propagation must be modeled separately, and correctly

A door can be visually opaque while permitting sound to pass — allowing a character in an adjacent crawlspace to overhear an argument without observing the physical action, which mechanically generates a specific and useful epistemic state (knows-by-hearsay, not knows-by-witness) purely from the simulation, without any narrative scripting.

**The unit representation matters and was a genuine error in an earlier revision.** An intermediate version modeled acoustic loss as if decibel values could simply be subtracted from a linear intensity quantity, which is only mathematically valid if the stored quantity is *itself* already a logarithmic level. The corrected model:

- Attenuation is stored in **centi-decibels** (100 cdB = 1.0 dB), a logarithmic unit.
- Multi-hop attenuation composes by **exact integer addition** — e.g., a 3,200 cdB portal followed by a 1,500 cdB portal yields exactly 4,700 cdB total loss — which is the specific advantage of choosing a logarithmic representation: composition across barriers requires no multiplication and therefore introduces no rounding error at all, unlike the basis-point (linear, multiplicative) representation used elsewhere in the system.
- Audibility is gated by both an absolute hearing threshold and a signal-to-noise-ratio-above-ambient condition, which correctly allows for a scene where a sound is technically present but masked by background noise.

**An unaddressed physical simplification, noted in review and not yet incorporated:** this model captures barrier attenuation but not distance falloff — sound naturally attenuates with distance even with no barriers present (roughly 6 dB per doubling of distance for a point source in open space). Two characters at very different distances from a speaker in the same open room would currently be modeled as hearing identically. Whether this matters is a judgment call dependent on the scale of the spaces being modeled, but it should be a **stated, deliberate simplification** rather than an silent omission.

### 2d6 conflict resolution

Duels and conflicts are resolved via the difference of two independent 2d6 rolls. The distribution is a bell curve (near-average outcomes are far more common than extremes), which is a deliberate and good design property: it makes character stats meaningfully influence outcomes while keeping the game world statistically consistent rather than wildly swingy. *Per your earlier instruction, the specific numeric distribution table has been intentionally omitted from this synthesis.*

### Deterministic, unbiased collision resolution

When two agents attempt to occupy the same cell or traverse the same portal within a single simulation tick, the winner must be chosen deterministically (for reproducibility) **without creating a permanent structural bias**. An early design broke ties by "highest Cunning wins, then lowest entity ID" — which was identified as a real design flaw: it silently grants whichever character has the highest Cunning stat a **permanent, unconditional advantage in every contested collision, forever**, which shapes the story's underlying power dynamics as an unintended side effect of a tiebreaker rather than as a deliberate narrative choice.

The corrected design uses a seeded, deterministic lottery:

```
Priority(A, t) = Truncate32(HMAC-SHA256(episode_seed, A.id ‖ t))
```

with an unambiguous, delimiter-safe binary encoding of the entity ID and tick (a naive string concatenation like `A.id + t.toString()` creates real ambiguity — `("char_bog1", 2)` and `("char_bog", 12)` can collide into the identical string `"char_bog12"` — so the encoding must use an explicit delimiter, such as a NUL byte, between fields). The exact truncation method (big-endian unsigned 32-bit) must be specified precisely, because a different choice produces a different — and, once episodes have been played and recorded, permanently different — outcome for every replayed collision in every episode ever simulated. A final tiebreak (lowest entity ID) handles the astronomically rare case of an exact 32-bit collision.

**Losing a collision is a first-class simulation outcome, not an error condition.** The losing agent emits an explicit `STALL` event into the event log rather than throwing an exception or silently retrying — this is a small design choice with a real narrative payoff, since a character's plans failing due to a lost race for a doorway becomes usable dramatic material rather than an invisible internal failure.

### Ignorance by omission, and its critical hole: the shared transcript

The architecture correctly recognizes that an LLM becomes dangerously omniscient if its prompt simply contains all available world information — a model given a secret in its context will, under normal generative pressure, tend to let that secret leak into dialogue, because attention mechanisms naturally favor stating salient information.

The proposed solution is meaningfully stronger than the naive one:

> Not: *"Tell the model not to reveal secrets it knows."*
> But: *"Do not give the character's generation context information the character does not actually possess."*

This converts epistemology from a fragile prompt-writing convention into a **systems property** — a character with `TOTAL_IGNORANCE` of a topic simply never has that topic's content assembled into their context at all, so there is nothing for the model to leak, regardless of how the prompt is phrased.

**A critical hole in this design, identified only in a late round of review, and arguably the single best overlooked point in the entire process:** filtering each character's *individual* prompt context is not sufficient by itself. Consider: Bog knows a secret, Wart does not. Bog's line is generated with the secret legitimately present in *his* context — that part is correct and by design. But once generated, **that line enters the shared scene transcript**, and if Wart's subsequent turn is generated using that same transcript as context, Wart's model now has access to the secret Wart's character was never supposed to know, purely through **transcript leakage** rather than through any failure of Bog's own filtering.

The fix requires treating epistemic containment as a property of the **conversation state itself**, not merely of each character's individual prompt assembly:

> **A proposition may enter a character's observable transcript only if that proposition is independently verified to be observable to that specific character** — regardless of how or why it entered the scene through another character's generated output.

This reframes the generation pipeline from a flat structure —

```
all generated dialogue → everyone's context
```

— into a properly filtered one:

```
world event → character A's observation → character A's context →
character A's generated action → an observation-transformation step →
character B's permitted (filtered) perception of that action
```

**Practical consequence:** the scene transcript that gets assembled for each character's *next* turn must itself be built through the epistemic filter, not simply be "everything said so far." This is a real implementation requirement, not yet built, and it is arguably more important to get right than the lexical gate, because a leak here undermines the deliberately-unresolved-canon mechanism (Part XII) even when every other part of the system works exactly as designed.

Omission is also **not absolute security against inference** — a character can in principle infer a secret from another statement, an observed event, a physical clue, or a repeated pattern, none of which is prevented by omission alone. The stronger formulation: **the context assembler enforces an allowlist of propositions a character may know, while simulation separately controls what new evidence can enter that character's knowledge state going forward.** This is a genuinely harder problem than simple omission and remains, appropriately, an area for ongoing design rather than a solved mechanism.

---

## Part XII — Deliberately Unresolved Canon

An under-appreciated but genuinely valuable mechanism: a typed registry of narrative questions that must **not** be answered by the system, protecting against a specific and consistent LLM failure mode — models are strongly biased toward narrative closure, and given an open mystery embedded anywhere in their context, they will tend to resolve it, simply because resolution is a more statistically typical continuation than sustained ambiguity.

### The typed schema

```typescript
UnresolvedCanonSchema = {
  topic_id: string,                    // e.g. "mystery_the_famine"
  forbidden_propositions: [{
    statement: string,                 // human-readable, for reviewers
    trigger_lemma_sets: [string[]],    // REQUIRES CO-OCCURRENCE, not single words
  }],
  permitted_clue_tokens: string[],
  epistemic_horizons: {
    [character_id]: "TOTAL_IGNORANCE" | "RUMOR_ONLY" | "FALSE_BELIEF" | "PARTIAL_FACT"
  },
  human_promotion_condition: string,   // when a human may finally resolve this
}
```

The `epistemic_horizons` field is a genuine improvement over a flat known/unknown binary — it captures the *texture* of a character's relationship to a mystery, which directly enables richer scenes (a character operating on a false belief is dramatically different from one in total ignorance, and both differ from one who's heard an unreliable rumor).

### A real false-positive problem, found and fixed during review

An early design proposed flagging any dossier prose containing a single forbidden lemma (e.g., "famine") during compilation. **This was identified as a serious flaw**: scanning for a bare word conflates the *word itself appearing* with *the specific proposition being asserted*. If "the famine" is central to a character's backstory — which it likely is, if it's dramatically important enough to be a protected mystery — then nearly every dossier that mentions the character at all would trip the check, either forcing the mystery to be scrubbed from all characterization (defeating its dramatic purpose) or forcing the check to be so narrow it misses real resolutions.

**The corrected design requires co-occurrence of multiple lemmas within a bounded window** (e.g., "famine" *and* "caused" *and* "began" all appearing within a 20-word span) to constitute a flaggable trigger, and — equally important — **the check was moved out of the compiler's blocking Pass 2 and into the advisory lint stage**, consistent with the general principle that heuristic, non-exact judgments do not belong in the pure compile path. The check now routes matches to human review rather than hard-failing the build, because co-occurrence matching is fundamentally a heuristic and will have both false positives and false negatives regardless of how carefully tuned.

### Enforcement across three points

1. **Lint-time (advisory, not blocking):** `lint-prose.ts` scans dossier prose for co-occurring trigger-lemma sets and routes matches to human review.
2. **Context assembly (the real defense, mechanical rather than heuristic):** characters marked `TOTAL_IGNORANCE` have every mention of the topic omitted from their generation context entirely — an LLM cannot disclose a fact it was never given, which is categorically more reliable than asking it not to disclose a fact it has.
3. **Post-generation advisory scanning:** generated dialogue is scanned for the same trigger-lemma sets as a final backstop.

---

## Part XIII — The Pardon Ledger

A necessary pressure-release valve for a system whose whole purpose is strict invariant enforcement. Without an explicit exception mechanism, a strict system tends toward one of two failure modes: either exceptions get made by simply disabling the compiler (making them invisible, unaudited technical debt), or the system becomes too rigid to accommodate legitimate deliberate storytelling choices, and people route around it.

### The design

```
Rule (normally enforced)
  → an explicit, scoped exception is requested
  → bound to an exact (episode_id, scene_id, shot_id, entity_id) tuple
  → authorized by a specific human
  → recorded with a stated reason
  → expires automatically on shot completion (never a standing exemption)
```

### Relational enforcement — a real flaw found and fixed

An early version let a pardon record self-declare `is_pardonable_constraint: true` as a field on the pardon itself, which meant an author could simply assert pardonability for a hard, non-negotiable constraint (such as using a severed limb) — the schema checked only that the pardon *claimed* to be for a pardonable rule, not that the referenced rule actually *was* one.

**The corrected design makes pardonability a property of the rule, not the pardon**, enforced relationally:

```typescript
RuleSchema = {
  id: string,
  description: string,
  pardonable: boolean,     // REQUIRED, no default — see below
  severity_class: "FORMAT" | "STYLE" | "ONTOLOGY" | "PHYSICAL_SOMATIC",
  owning_entity_types: string[],
}

PardonRecordSchema = {
  id: string,
  target: { episode_id, scene_id, shot_id, entity_id },
  rule_id: string,          // resolved against RuleSchema at compile time
  authorizer_id: string,
  reason: string,           // minimum length enforced
  granted_against_canon_hash: string,  // the H_root context, not a future commit SHA
}
```

Pass 2 resolves `rule_id` against `RuleSchema` and produces a **fatal compilation error** if the referenced rule's `pardonable` field is not `true`. Hard physical/somatic constraints are declared non-pardonable at the ontology level and simply cannot be bypassed through this mechanism, no matter who requests it or why — a character using a severed arm to lift an object cannot be pardoned, full stop; the only legitimate path to that outcome is authoring an explicit, reviewed, miraculous event directly into canon.

**On the `pardonable` field's default value — a subtle point:** an earlier draft defaulted the field to `false` (fail-closed), which is the safe direction. Further reflection suggests an even stronger design: **make the field required with no default at all.** A safe default silently protects against an omission, but it also hides the fact that nobody explicitly decided. Given how much the whole mechanism depends on the hard/soft distinction being deliberate, forcing every rule's author to state pardonability explicitly creates an audit trail showing someone actually considered the question for every rule, rather than merely benefiting from a safe fallback.

### An unaddressed abuse vector

A system with an exception mechanism will, if the mechanism is convenient, see the exception path become the path of least resistance for anything that's merely *annoying* rather than genuinely a deliberate creative choice. Controls worth adding, not yet specified: **rate-limiting and auditing** pardon frequency (a rising pardon rate on a particular rule signals the rule itself may be miscalibrated, which is useful information), requiring a substantive stated reason (already present via a minimum length, though length alone doesn't guarantee substance), making pardons **visible in downstream provenance** (a rendered artifact produced under a pardon should carry that fact, so later analysis can distinguish "compliant by rule" from "compliant by exemption"), and deciding in advance how the ledger's "never delete" append-only philosophy interacts with a legal takedown request, which is a case where immutability and a real external obligation could conflict — better decided as policy now than improvised during an incident.

---

## Part XIV — Event Sourcing, Integrity, and Durability of the Log

### The hash-chained event envelope

Because the event log is Class 2 (irreplaceable), it needs integrity guarantees comparable to what Git provides for canon:

```
Hash_N = SHA256( Canonicalize(FULL EVENT ENVELOPE, excluding event_hash itself) ‖ Hash_{N-1} )
```

**An important correction developed during review, not yet incorporated into the specification:** an earlier design hashed only the event's `data` payload together with the previous hash, omitting `event_type`, `sequence_id`, `schema_version`, and `metadata` from the hashed content. This is a real integrity gap — it would allow an attacker with database access to change an event's *type* (say, from `INJURY_INFLICTED` to `HEALED`) without breaking the hash chain, as long as the `data` payload itself stayed unchanged, even though the event's type is exactly what determines how the reducer interprets that data. **The full envelope, excluding only the hash field itself, must be what gets hashed.**

**The `metadata` field deserves a specific and non-obvious rule.** It is correctly excluded from the *state reducer's* evaluation — free-text prose or commentary attached to an event should never be able to influence what the reducer computes, which is what prevents an injected instruction hidden in prose from altering canonical state. But metadata should **not** be excluded from the *hash*. It may be the only record of what an LLM actually generated at the time, and excluding it from the integrity chain would let that record be silently altered without detection, even though the reducer correctly never reads it.

A defined genesis value is required for the very first event, since it has no predecessor to hash against — this must be a fixed, documented constant, or verification of the first event in any stream is ambiguous.

### Practical serialization traps

- **`sequence_id` should not be typed as a raw `bigint`** if events are exported to JSON or NDJSON — `JSON.stringify` throws on BigInt values by default. Represent it as a string, or use a plain number (safe up to $2^{53}-1$, vastly more than any plausible event count).
- **Event payloads should not be typed as an unconstrained `Record<string, unknown>`.** This defeats the purpose of a typed event system — an event with a valid `event_type` and a malformed payload would pass envelope-level validation and then either crash or, worse, silently corrupt the reducer's output. Each `event_type` should map to its own specific payload schema, validated as a discriminated union at append time, giving the event log the same compile-time-style guarantee the canon compiler gives Markdown dossiers.

### Anchoring the log in Git, and why frequency matters

At defined intervals (originally specified as end-of-episode), the current head hash of the event log is recorded in a signed Git commit, rooting the dynamic database's history in the same immutable ledger that protects canon.

**A subtlety about the exposure window, identified in review:** anchoring only at episode boundaries means everything *between* anchors is protected by the hash chain's internal consistency but lacks an *external* witness — an attacker who fully controls the database could, in principle, rewrite the entire unanchored tail and recompute every hash consistently, and nothing would detect this until the next anchor point exposed the discrepancy. Two mitigations: **anchor more frequently** (at each scene lock, or on a fixed schedule, shrinking the vulnerable window), and **anchor externally as well as locally** — a signed commit made on the same workstation that also runs the database is a witness controlled by the same party, so if that workstation is compromised, both can potentially be rewritten together. Pushing the checkpoint hash to a remote Git host, or a dedicated timestamping service, provides a witness the workstation alone cannot silently rewrite.

### Storage and replication

- **Continuous WAL streaming** to warm object storage with point-in-time recovery, not periodic snapshotting — the log's Class 2 status demands continuous protection.
- **Scheduled plaintext export** to newline-delimited JSON, committed to an archival branch, ensuring history is never trapped exclusively inside a proprietary database engine — the same "drain to plain text" philosophy already applied to the edge staging buffer's drafts.

---

## Part XV — Frame Cadence and Production Timing Mathematics

### The 4n+1 constraint

Generative video diffusion architectures (the specification names Wan 2.1 specifically) impose a structural constraint on frame count, tied to temporal downsampling in the model's architecture:

$$\text{Frames}_{\text{native}} = 4n + 1 \quad (n \in \mathbb{N})$$

**This is verified as a real constraint of the specific named model** — the official Wan2.1 implementation does require generated frame counts in this form, and its official examples export at 16 fps. **However, this is a property of a specific checkpoint and implementation, not a universal law of generative video**, and it should be scoped explicitly as such in the specification, since a future or different checkpoint could use an entirely different temporal architecture.

### Reconciling native generation rate with delivery rate

Master audio duration is the immutable timing authority — video must never be shorter than its accompanying speech. The delivery frame budget is always a ceiling:

$$\text{Frames}_{\text{delivery}} = \lceil \text{Duration}_{\text{sec}} \times \text{FPS}_{\text{delivery}} \rceil$$

Generating natively at 16 fps and delivering at 24 fps requires an uneven 1.5× pulldown (alternating 2:1 frame holds), which produces visible motion judder. Two clean alternatives avoid this:

**Configuration A — native 12 fps, doubled to 24 ("on twos"):** Every generated frame is duplicated exactly once, producing clean, judder-free — if stylistically 12fps-cadenced — motion. Worked example for a 3.120-second line: delivery budget is $\lceil 3.120 \times 24 \rceil = 75$ frames; native raw requirement is $\lceil 3.120 \times 12 \rceil = 38$ frames, conformed to $4n+1$ as $n = \lceil 37/4 \rceil = 10$, giving 41 native frames; doubled to 82, trimmed to the 75-frame delivery target, discarding 7 frames (0.29s) at the tail as safety margin.

**Configuration B — native 24 fps, direct match:** No cadence resampling needed at all. Same example: $n = \lceil 74/4 \rceil = 19$, giving 77 native frames, trimmed by 2 to match the 75-frame delivery target. **This configuration is only valid if the target checkpoint was actually trained at 24 fps natively** — forcing a model trained at 16 fps to generate at 24 fps risks degrading motion quality, and this should be empirically verified against the actual checkpoint before relying on it, not assumed from the arithmetic alone.

**A wording correction developed in review:** describing 12fps-doubled output as "zero judder" is true only with respect to the *specific* judder caused by an uneven 16→24 pulldown conversion. It should be described as **"zero conversion-rate judder"** — 12 fps motion retains its own characteristic 12fps cadence, which is a legitimate and sometimes desirable aesthetic choice, but it is a different thing from continuous 24fps motion, and conflating the two in documentation risks someone believing Configuration A delivers smoother motion than it actually does.

### The 4n+1 sawtooth waste pattern

Because $4n+1$ is a step function, generation waste follows a periodic sawtooth: a raw requirement of 38 frames forces generation of 41 (wasting 3, since $n$ must round up to 10), while a raw requirement of exactly 37 frames would need only $n=9$, yielding exactly 37 frames with zero waste. A small audit tool scanning planned shot durations before dispatch can identify shots sitting on an inefficient point of the sawtooth and suggest a small pause-trim that shifts the shot to a more efficient $n$, directly reducing GPU compute cost. **This tool's suggestions must be restricted to trimming silence/pauses, never speech itself** — altering spoken performance to hit a frame-count efficiency target would be a clearly wrong trade-off, and any implementation must enforce that constraint structurally, not just by convention.

### An integer-arithmetic requirement that generalizes across all timing code

Frame-count and timeline-offset calculations performed using floating-point durations in seconds are vulnerable to representation error — a value like `74.00000000000001` ceiling-rounding to 75 instead of the intended 74 is a realistic hazard in a system whose entire premise is bit-exactness. **The general rule, applicable everywhere timing math appears in this architecture:** represent all durations as integer milliseconds and all rates as integer frames-per-second, and perform every conversion using integer ceiling or floor division rather than floating-point multiplication. This is the same philosophy already applied to basis-point scalars, extended to the temporal domain, and it should be treated as a blanket policy rather than solved ad hoc in each formula.

**Cumulative timeline placement must be computed from cumulative milliseconds, quantized once** — never by summing individually-rounded per-shot frame counts, which accumulates rounding error linearly with the number of cuts in a scene (a 30-line scene summing per-line ceiling errors could drift by more than a second). The division of labor: **per-shot generation budgets use the ceiling rule** (guaranteeing video never underruns its audio), while **timeline placement of cuts uses cumulative-millisecond quantization** (preventing drift across a scene); excess frames from the per-shot ceiling are trimmed at each shot's tail before the next shot begins. This division should be stated explicitly in the specification, since the two rules can appear to conflict if not clearly scoped to different responsibilities.

---

## Part XVI — Rendering Determinism and Provenance

### Headless rendering determinism

Rendering Remotion compositions inside Docker requires eliminating environmental variance: **software rasterization** (SwiftShader via ANGLE) rather than hardware GPU acceleration, since hardware drivers introduce driver-dependent sub-pixel anti-aliasing variance; **pinned exact versions** of the Chromium build, FFmpeg build, and every font file's hash; and **regression verification** via frame comparison metrics.

**A conceptual clarification developed in review:** if the rendering environment is genuinely fully pinned (exact container digest, exact Chromium build, software rasterization), frames should in principle be **bit-identical**, and the correct verification is an exact hash comparison — with SSIM/LPIPS metrics serving only as a *diagnostic* to characterize a failure, not as the primary pass/fail criterion. Setting a similarity *threshold* (rather than exact equality) as the primary gate implicitly concedes that the environment isn't actually fully deterministic, which may be true in practice, but the specification should be explicit about which regime it's actually operating in, since the correct verification strategy differs between them. If thresholds are used, they must be **derived from actual measurement** (render the same content multiple times across the supported environments, observe the real distribution of divergence, set the threshold with a stated margin) rather than asserted as a round-looking number.

### Empty-hash and truncation guards

A small, cheap, genuinely valuable check: the SHA-256 hash of a zero-byte buffer is a specific known constant (`e3b0c442...`), and any artifact whose computed hash matches this exactly indicates an upstream crash, truncated write, or dropped network pipe — because the hash of *nothing* is still a technically valid-looking hash, which would otherwise pass a naive "does it have a hash" check. Paired with a minimum-byte-length check, this catches a specific and otherwise-invisible failure mode cheaply.

### The provenance manifest

Because Class 3 rendered media cannot be regenerated bit-for-bit, **every promoted artifact must carry an immutable, content-addressed sidecar manifest** recording everything needed to understand — though not necessarily reproduce — how it came to exist: the artifact's own hash, the canon root hash it was produced under, the compiler's source hash, the container digest, the full generation parameter set (checkpoint hash, LoRA hashes, VAE hash, prompt content and its hash, native and delivery frame counts and rates, seeds, sampler, step count), which pardons were in effect, and the Git commit it corresponds to.

**Because rendered media is irreplaceable, this manifest is the *only* mechanism by which a future question — "why does this look the way it does," or "which artifacts are affected by this later canon correction" — can be answered at all**, rather than requiring investigative archaeology.

### Manifest signing requires actual key-custody design, not just the word "signed"

The manifest should be **signed by a broker process's private key**, but simply stating this is insufficient without answering several questions that a later review correctly identified as unaddressed:

- **Where does the private key live**, and specifically, can it be reached by the same process that runs untrusted diffusion code or third-party model checkpoints? If so, a compromised dependency can forge manifests, which defeats the entire point of signing.
- **How is the corresponding public key distributed and pinned** for verification? If the public key sits alongside the manifests it verifies, an attacker who can replace one can replace both. The public key should be committed into the Git ledger, so the one component the whole architecture already trusts absolutely also vouches for the signing identity.
- **What is the key rotation and revocation story?** Manifests should record a `key_id`, and a key registry with validity windows should live in the ledger, so old signatures remain verifiable after a key is rotated.

**Without these three answers, "signed manifest" provides a checksum, not an authenticity guarantee** — the distinction matters because a checksum only proves the file wasn't corrupted in transit, while an authenticity guarantee proves it was actually produced by the trusted process, which is the property actually needed here.

### The manifest may itself carry untrusted content, which has downstream implications

Storing the verbatim prompt (including injected voice-rail content) in the manifest is valuable for provenance, but that voice-rail content may originate from a remote, possibly adversarial contributor. This means **the manifest — a permanent, signed, archived record — can carry untrusted content forward indefinitely.** Anything that later displays or processes manifests must treat this field as untrusted data, since it could carry an injection payload aimed at whatever eventually reads it. There is also a genuine, non-technical question this raises and does not resolve: if a contributor later withdraws consent for their submitted text, an append-only, content-addressed, signed archive makes removal difficult by design. This is a policy decision that should be made deliberately before the first contributor's text enters the archive, not discovered as a problem after the fact.

---

## Part XVII — Errata and Retcon Protocol

The architecture explicitly refuses to overwrite history when a canon error is later discovered — an important philosophical commitment, since the alternative (quietly editing the past) would undermine every provenance guarantee built elsewhere in the system.

```
old canon → old render (already produced, already archived)
     ↓
error discovered
     ↓
canon corrected via a normal Git commit, establishing a new H_root
     ↓
an ErrataRecord is appended (never in-place edited) to lore/errata.json,
referencing the affected artifact hashes and the superseded commit
     ↓
existing rendered media and their manifests remain untouched, byte-identical,
in cold storage — they are never deleted or overwritten
     ↓
any subsequent remaster produces a NEW content-addressed file under the
new commit hash, preserving both the historical record and the correction
```

**A subtle but real inconsistency, identified in review and not yet corrected:** an earlier description of this protocol said manifests get "updated in place" with a `superseded_by_commit` field — but manifests are explicitly content-addressed and described elsewhere as immutable, and an in-place edit necessarily changes the manifest's own hash, which breaks any reference pointing to it by that hash. **The consistent fix is append-only supersession**: leave the original manifest completely untouched, and write a separate, hash-linked supersession record pointing at the original manifest's hash. This preserves the "manifests are immutable" guarantee everywhere else in the system relies on, at the cost of one additional small record type.

**An unaddressed question:** the errata mechanism needs a bound on *why* a supersession is happening, because different reasons imply genuinely different obligations. A canon-error correction and a legal takedown are not the same kind of event — the former is purely additive and the old artifact can and should remain archived, while the latter may create a real external obligation to actually remove content, which directly conflicts with the "never delete, only annotate" philosophy. This tension should be resolved as an explicit, deliberate policy decision (e.g., "legal or safety takedowns are the one case where a tombstone replaces content while the hash record is preserved for integrity purposes") made in advance, not improvised under the pressure of an actual incident.

---

## Part XVIII — The Asymmetric Edge Architecture (Remote, Non-Technical Writers)

### The core principle: inverted authority

For a solo creator or a co-located team, an edge presence for the lore repository is an unjustified addition of complexity — "just use a local branch" wins on every axis. **The edge becomes genuinely justified only under one specific condition: a geographically distributed writers' room containing non-technical contributors who cannot operate Git, a terminal, or a local Node environment.** Confirmed by the person building this system as their actual situation, this shifts the edge from speculative to necessary — but the *shape* it takes matters enormously.

The resolving design principle: **the edge is an untrusted, disposable staging scratchpad and a passive hardware request queue. Local Git remains the sole legislative sovereign, unconditionally.**

### The four invariant rules of the staging buffer

1. **Unidirectional authority.** The local repository never imports, awaits, or depends upon edge state to establish canon. A total Cloudflare outage does not interrupt local authoring, compilation, testing, or rendering in any way.

2. **Dependency-level invalidation, not global.** Invalidating every open remote writer's session whenever *any* unrelated entity changes anywhere in canon is unacceptably disruptive. The compiler computes both a global root hash and per-entity content hashes; a draft binds specifically to the hashes of the entities it actually touches:
$$H_{\text{dep}} = \text{SHA256}\big(\text{Sort}([H_{\text{target}}, H_{\text{fk\_1}}, H_{\text{fk\_2}}, \dots])\big)$$
   **The design deliberately uses direct (1-hop) foreign-key references for this edge-side check, not the full transitive closure** — this was debated across multiple rounds and is the correct resolution: the edge performs a **cheap, advisory, fast early-warning check** on direct dependencies only, while **the local compiler performs the authoritative full multi-hop transitive check during ingestion**, since it already has the complete dependency graph in memory at no extra cost. A refinement worth adopting: **compute the full transitive hash once, at compile time, and ship it to the edge as a precomputed field**, so the edge gets a simple equality comparison with correctness equivalent to a true transitive check, without ever performing graph traversal itself. Whether this refinement is worth the added complexity depends on the actual connectivity density of the canon graph — in a densely interlinked graph, a naive transitive hash could cause nearly everything to invalidate on almost any change, recreating the exact over-invalidation problem the design set out to avoid, so this should be measured empirically against real data before committing to either approach.

3. **Version-pinned schema bundles.** The edge Worker never carries independent validation logic — it imports a `schemas.json` bundle tied to the exact commit SHA of the currently-pushed sealed state. If local schemas advance, edge drafting is blocked until the corresponding bundle is pushed alongside the recompiled canon, preventing the specific failure mode where an edge validator accepts a draft the local compiler would reject (a form of false confidence that is worse than no validation at all, because it actively misleads the writer into believing their work is valid).

4. **Anti-slime-mold concurrency, with retention decoupled from the interactive lock.** This went through a real and important refinement:
   - **A short, heartbeat-renewed interactive edit lock** (5-minute expiry, 30-second heartbeat) prevents an abandoned browser tab from locking an entity indefinitely.
   - **A separate, much longer draft retention TTL** (72 hours) preserves the actual uncommitted draft content in storage, independent of whether the interactive lock is currently held.
   - **These must be two genuinely separate timers, not one.** An earlier design conflated them, which would have meant an abandoned tab blocked other writers for up to three days — an unreasonably long lock for what should be an interactive session.
   - **Reconnection protocol:** if a writer's connection drops and later returns, and the lock was never reclaimed by anyone else, they should transparently reacquire it and resume with their local changes intact. If someone else has since claimed and modified the entity, the writer is shown a side-by-side three-way merge interface, never a silent overwrite.
   - **Plaintext drainage without ever holding Git credentials at the edge.** The Worker exposes a read-only `GET /drafts/drain` endpoint; a **local** cron job or CI runner polls this endpoint and performs the actual Git commit with author attribution metadata. This is the mechanism that resolves an apparent contradiction in an earlier design — you cannot simultaneously claim "the edge holds zero Git credentials" and have the edge itself push drafts to a Git branch, since something has to authenticate that push. Moving the push responsibility entirely to the local side resolves this cleanly.

### The local `flock` inversion — a genuinely important distributed-systems correction

An early design had the edge Durable Object holding an exclusive lease on the local GPU, treating the cloud as the authority over local hardware. **This was identified as a real architectural mistake**, because it means a network partition — the Cloudflare tunnel dropping — could leave the local GPU in an ambiguous or contested state despite the hardware being physically present and idle right there on the workstation.

**The corrected design inverts the relationship entirely: the local `media-broker` process permanently holds an unconditional OS-level file lock (`flock`) on the GPU hardware interface. The edge Durable Object never commands or locks the hardware — it acts only as a passive FIFO request queue that the local broker polls when, and only when, its own local lock is free.**

```
Remote DO → logical request queue → local media-broker → OS flock → GPU
```

never:

```
DO → "you own the GPU now" → hope the network holds
```

**If the network fails entirely, the broker seamlessly falls back to reading a local disk-based render queue**, with — critically — **the same code path**, not a separate "fallback mode" that would inevitably rot from disuse. This is the resolution to a subtler failure mode identified during review: if the local broker only *sometimes* enforces its own lock (falling back to a separate code path only when the edge is unreachable), a scenario becomes possible where the edge reassigns a job mid-render because a heartbeat was briefly delayed, while the local broker is still actively rendering the original job — producing two simultaneous claimants on one GPU, precisely the CUDA out-of-memory condition the entire locking mechanism exists to prevent. **Making the local lock permanent and unconditional, with the edge treated only as an optional source of *requests* rather than *commands*, eliminates this failure mode by construction rather than by careful sequencing.**

### Structural fencing against zombie workers

Rather than trying to prevent every stale worker from doing any work at all — which is extremely hard to guarantee in a distributed system — the design instead makes stale work **structurally incapable of being promoted to canonical status**, which is a dramatically easier property to reason about and enforce.

```
1. Worker claims a task from the DO, receiving a lease stamped with epoch N.
2. Worker renders and uploads to an epoch-scoped, content-addressed key:
   staging/renders/${task_id}/epoch_${epoch}_${sha256}.mp4
3. Worker calls POST /tasks/complete with the staging key.
4. The single-threaded DO evaluates the epoch inside one atomic, synchronous
   storage transaction. If the worker's heartbeat lapsed and its lease was
   reassigned (epoch incremented to N+1), the completion is rejected outright.
5. Only successful epoch validation causes the DO to write the staging key
   into the canonical episode manifest — this promotion step and the
   validation must occur as a single atomic operation, or a crash between
   the two leaves an artifact that is neither promoted nor known-orphaned.
6. Unpromoted staged files are reaped automatically by a storage lifecycle
   policy after a defined retention window.
7. The completion RPC must be idempotent — a retry after a network blip or
   a DO restart should return success without re-executing any write, since
   the promotion step is not naturally idempotent on its own.
```

Because Cloudflare R2 and equivalent object stores **do not natively validate a custom epoch token on a raw PUT request**, fencing cannot be enforced by the storage layer itself — it must be enforced entirely at the *promotion boundary*, which is exactly what this design does. A zombie worker whose lease has expired can still physically upload bytes to the staging prefix; it simply can never cause those bytes to be referenced by anything canonical, which is sufficient, because an unreferenced object in a content-addressed store is inert and eventually reaped.

---

## Part XIX — CI/CD Verification Hardening

### The offline deletion test

Verifies that `compiled/bible-state.json` is purely derived from source Markdown, with no hidden network or environmental dependency, run inside a sandboxed namespace:

```bash
unshare --user --map-root-user --net /bin/bash << 'EOF'
  set -euo pipefail
  # Assert network isolation via a TCP connect attempt with a timeout —
  # NOT ping, which requires elevated privileges the sandbox may lack,
  # producing a false "network is dead" result for the wrong reason.
  if timeout 1 bash -c 'exec 3<>/dev/tcp/1.1.1.1/443' 2>/dev/null; then
    echo "FATAL: Network namespace isolation breached." >&2; exit 1
  fi
  rm -rf compiled/
  ./node_modules/.bin/tsx scripts/compile.ts   # local binary — never npx,
                                                 # which would itself attempt
                                                 # a network fetch if the
                                                 # package weren't already
                                                 # installed
  git diff --exit-code HEAD -- compiled/bible-state.json
EOF
```

**An important outstanding correction, identified in review and not yet fixed in any revision seen:** a negative control was added to satisfy the negative-control law, but it corrupts `compiled/bible-state.json` directly and confirms that `git diff` detects the change — which verifies a property of Git itself, something nobody doubted, rather than exercising the actual deletion-test pipeline (delete → recompile → compare). **The correct negative control mutates a *source* Markdown dossier in a way that changes the compiled output, without recompiling or committing the change, and then asserts that running the *entire deletion script* fails** — this is the failure mode the tripwire actually exists to catch, and the existing control does not test it. This should be treated as an outstanding defect requiring correction.

### Cross-architecture determinism verification

```yaml
strategy:
  matrix:
    include:
      - os: ubuntu-24.04       # x86_64 Linux
      - os: ubuntu-24.04-arm   # aarch64 Linux
      - os: macos-14           # Apple Silicon
```

**A previous version of this workflow used a matrix variable `arch: [x86_64, aarch64]` that selected nothing** — GitHub Actions determines architecture by *runner label*, not by an arbitrary matrix key, so the earlier version silently ran the same x86_64 runner twice under two different labels and provided **zero actual ARM coverage** while appearing, on casual inspection, to test cross-architecture determinism. This is corrected in the current version by using real, specific runner labels. *(Note: confirm current label availability and exact naming against GitHub's live documentation before relying on them, since these change over time and were not independently verified here.)*

Each matrix leg compiles and asserts its own output matches the committed `HEAD` blob (not merely that all legs match *each other*, which would miss the case where every platform drifts identically from a forgotten recompilation). A separate fan-in job then downloads every leg's hash and asserts they are all identical to one another **and** to the committed hash — both checks are necessary; either alone is insufficient. **This workflow, like the deletion script, still lacks its own negative control** (a deliberate one-byte perturbation on one leg, asserted to cause the fan-in job to fail) — an outstanding gap consistent with the pattern found throughout this project of negative controls being added inconsistently even after the law requiring them was adopted.

### The atomic-rename concurrency test

Fifty parallel reader threads read the compiled artifact in a tight loop while a writer thread repeatedly performs atomic sibling-rename writes; every read must parse as valid JSON with zero partial-buffer errors. **The negative control must run the identical battery against a known-bad non-atomic writer** (a plain `writeFileSync` directly targeting the file) and assert that *this* version **does** produce observable corruption — if it doesn't, the harness has been shown to be non-stressing and must be strengthened (larger file, more iterations, explicit retry-until-observed logic) rather than trusted, since a race condition is probabilistic and a fast filesystem with a small test file may simply never expose it by chance.

### The trusted-overlay principle for autonomous coding agents

An autonomous agent commissioned to fix a bug or failing test cannot be trusted to grade its own work, because it can "fix" a failing test by weakening the assertion, deleting the test, or modifying the compiler or schema the test checks against. The defense: CI **dynamically restores `scripts/`, `schemas/`, `tests/`, and all build configuration files from an immutable, explicitly identified trusted commit** — not from the `main` branch reference, which is mutable and could itself be moved by an attacker with push access — **before** executing any verification. Additional layered defenses for this specific threat: a diff whitelist (the agent's PR may only touch files named in its task specification, checked via the GitHub API, with directory-traversal attempts rejected outright), a **red-before-green precondition** (the task specification must include at least one assertion that provably fails on the base commit and passes only after the agent's change — mathematically eliminating the possibility of a vacuous pass), and **mutation testing** (synthetic bugs are deliberately injected into the code; if the agent's own test suite still passes despite the injected bug, the suite is rejected as non-discriminating).

---

## Part XX — Threat Model and Security Boundaries

### Ranked defenses against prompt injection, in order of actual reliability

| Rank | Defense | What it actually protects against |
|---|---|---|
| **1 (primary)** | **Secretless Conductor** — read-only mount on canon, zero write credentials of any kind | Injection cannot leak or misuse credentials that simply don't exist in the process |
| 2 | **Schema-locked tools** — `additionalProperties: false`, fixed enums | Bounds the *blast radius* of a successful injection to a small, predetermined action space |
| 3 | Structural fencing (epoch-addressed staging, DO-gated promotion) | Zombie or malicious workers cannot promote unauthorized output to canonical status |
| 4 | XML/delimiter data fencing | Contains low-effort, unsophisticated injection attempts as inert text |
| 5 (weakest) | Draft ingress regex screening | Catches only naive, easily-avoided attack patterns; primarily useful as an audit signal |

**This ranking itself is an important corrective**, because an earlier presentation of these defenses listed them as peers rather than in order of actual strength. **Delimiter-based fencing is not a security boundary and must never be described as one** — a model does not reliably respect an instruction to treat delimited text as inert data, and an adversarial string can in principle contain sequences designed to close or subvert the delimiter itself. Delimiters genuinely help as a low-cost hygiene measure and as data/instruction separation, but the properties that actually bound damage are the **absence of anything valuable to steal** (rank 1) and the **restriction of possible actions to a small fixed set** (rank 2). This distinction is not a minor wording nitpick — mistaking a hygiene measure for a security boundary is exactly the kind of error that leads to a false sense of protection.

### An event-log-specific threat not addressed by the general injection defenses above

Because events can be derived from LLM-generated beats or dialogue, and events are the authoritative record of history, **an LLM-authored beat that becomes a permanent event can, in principle, encode an injection payload into the permanent historical record itself** — a fundamentally different and more serious threat than injection into a transient prompt, because the event log is Class 2 irreplaceable. The specification's data/metadata split (structured fields consumed by the reducer, free-text prose fields explicitly excluded from reducer evaluation) is the correct primary defense: even if an injection succeeds in influencing what free text gets stored, it structurally cannot influence what the reducer computes as world state, because the reducer never reads that field.

### A threat category still requiring more attention: key custody

As detailed in Part XVI, manifest and any future signing capability must be isolated from any process that executes untrusted code (LLM inference, diffusion, third-party model checkpoints, arbitrary agent-authored code), with an explicit answer to where keys live, how the corresponding public key is pinned against tampering (ideally in the Git ledger itself), and how rotation and revocation work. This remains one of the least fully specified parts of the architecture relative to how much of the provenance system's trustworthiness depends on it.

---

## Part XXI — Archival Policy

- **3-2-1 backup structure:** three copies total, across at least two distinct media types, with at least one copy stored offsite and with an independent vendor from the primary storage — vendor independence specifically protects against a single company's account termination or systemic failure taking out multiple "copies" that are, in practice, all hosted by the same provider.
- **Retention differentiation:** promoted, canonical artifacts are preserved permanently; unpromoted candidates, rejected takes, and temporary staging keys expire automatically via a lifecycle policy after a defined window — without this distinction, storage cost grows without bound as every rejected generation attempt accumulates forever.
- **Scheduled integrity scrubbing:** periodic re-hashing of archived files against their provenance manifests, to detect bit rot before it's discovered only at the moment of an actual restore attempt, when it's too late to do anything but note the loss.
- **Tiered restoration drills:** a cheap, frequent, automated check (already effectively covered by the deletion test's logic, extended to also verify archived media hashes against manifests) alongside a rare, thorough full-disaster simulation restoring an entire past episode from cold storage into a sandboxed environment and confirming clean playback with verified audio sync — the full drill should also assert that **every artifact hash listed in the episode's manifest matches its actually-stored object**, which is a substantially stronger and more useful criterion than "it plays back."

---

## Part XXII — Verification Discipline: The Generated-Documentation Rule

This principle emerged directly from a real, repeated pattern of errors found across the specification's revisions, and it generalizes into one of the most broadly useful lessons from the entire process:

> **Never hand-type a number, table, or worked example that a script could derive.**

The reasoning is empirical, not merely aesthetic. Across this project's revisions, multiple instances were found of exactly the failure this rule prevents:

- A worked example's final row, computed by subtracting the other rows from a known total, silently absorbed and hid errors that existed in the middle rows — the total checked out precisely *because* the last row was back-filled, which is the tell-tale sign of this specific failure mode.
- A sample-size table for statistical confidence intervals contained a figure off by exactly one, due to a ceiling-rounding slip in a hand-computed value.
- An illustrative tool-output message quoted specific numbers (a millisecond trim amount, a percentage compute saving) that, when independently recomputed from the worked example immediately preceding it, did not match — the example and its own narrative description of itself had quietly diverged.
- A cross-architecture CI matrix appeared, on casual reading, to test three platforms, while actually testing one platform twice under different labels, because a matrix variable was defined but never actually connected to a mechanism that used it.

**The remedy, stated as a concrete practice rather than only a principle:** every quantitative claim, table, or worked example in a specification should either be **generated directly by a committed, executable script** and regenerated as part of CI whenever anything it depends on changes, or **covered by a test that independently recomputes and asserts it matches**. A number that a human typed by hand and that nothing subsequently re-derives is, on the evidence of this project's own history, a number that will eventually be wrong, and the error will tend to be invisible precisely because the number *looks* plausible and the surrounding arithmetic *appears* to check out.

**A companion practice, arrived at independently but pointing at the same underlying discipline:** for every mechanism, write the test that would demonstrate its violation *before* implementing the mechanism itself. This single habit — write the failing test first — would have caught essentially every implementation-level defect found across this project's revisions: the deletion script's misdirected negative control, the event hash chain's omission of `event_type`, the `arch` matrix variable that selected nothing, the ambiguous entity-ID-and-tick concatenation. In every one of these cases, a test written *first*, specifically designed to demonstrate the exact failure mode the mechanism was meant to prevent, would have forced the gap to be visible before the mechanism was declared complete.

---

## Part XXIII — What This Project Actually Needs Next

This is not a technical section, but it is the most important conclusion to emerge from the entire process, and it deserves to be stated as plainly and directly as everything above.

### The pattern across every round of review

Every substantive review of this specification — independently, from different angles, using different methods — arrived at the same terminal recommendation: **stop refining the specification and build the smallest possible working version of the whole pipeline.** This happened not once but repeatedly, and the specification's own findings support it directly: **each successive round of review found progressively fewer conceptual problems and progressively more implementation-level ones.** That specific trajectory — diminishing conceptual findings, increasing implementation-level findings — is itself diagnostic. It is the signature of a design that has become, for practical purposes, specified enough, and for which the only remaining way to learn something new is to actually build it and see what breaks.

**This is worth stating with unusual directness: producing further analysis of the architecture has, at this point, itself become a way of avoiding building it.** Each round of review feels productive, because it does find real things — several genuine, consequential errors were caught this way, including at least one (the negative control that tested the wrong thing) that would have provided false confidence for an extended period if left uncaught. But the *marginal* value of each additional round has been visibly declining, while the amount of the system that actually exists and runs has remained at zero throughout.

### What "thin" should actually mean

Every round of review has recommended a "minimal vertical slice" — one character, one location, one interaction, one generated line, one rendered plate, one provenance manifest, one deliberate violation that must be correctly rejected — but no round has estimated what that slice actually costs to build, and the list is more deceptive than it looks: "one render" implies standing up an entire diffusion pipeline on a GPU; "one generated line" implies the full LLM integration and prompt-assembly machinery; "one manifest" implies signing infrastructure and key custody; "one rejected violation" implies a working validator with real rules behind it. Each item on the list, taken individually, is itself a small system.

**The way to keep the slice genuinely thin is to stub every expensive component first, and replace each one with the real thing only after the full pipeline runs end-to-end with fakes:** a fixed string standing in for the LLM's output, a single solid-color clip standing in for the diffusion renderer, an unsigned placeholder standing in for the eventually-signed manifest. This achieves two things simultaneously — it gets a running, testable pipeline in place within days rather than weeks, and it directly exercises the **replaceability test** described in Part I (everything the architecture claims is model-independent must keep working when the model is replaced by something worthless), which is itself one of the most valuable and previously-unimplemented tests this entire process surfaced. Only after the stubbed pipeline runs cleanly should each stub be replaced, one at a time, with its real implementation — and every surprise encountered during each individual replacement should be written down, because that record is worth more than another specification review.

### Success criteria should be decided in advance, not discovered afterward

A test that cannot in principle produce a surprising result tells you nothing. Before building the slice, it is worth deciding explicitly what outcome would actually change your mind about some part of the design — for instance: *if authoring a single character's full dossier takes more than a defined amount of time, the authoring workflow is too heavy for what it's trying to protect.* Or: *if the epistemic filter cannot be cleanly expressed for a simple two-character scene without accumulating special cases, the underlying epistemic model is wrong and needs rethinking before it's extended to more complex scenes.* Deciding these criteria in advance is what converts the vertical slice from a demonstration that the pipeline can run into an actual experiment capable of teaching something.

### The creative question, conspicuously absent from every round of analysis

Every document produced across this entire process — the original specification and all of its revisions, and every review of it, including this synthesis — has been concerned with correctness, provenance, safety, and determinism. **None of them has asked whether the resulting stories are actually good.** This is the largest unaddressed risk in the project as a whole: it is entirely possible to build a flawless, rigorously provenance-tracked, cryptographically verifiable system that reliably prevents impossible physical actions and faithfully preserves history, wrapped around narrative content that nobody would actually want to read or watch. The deterministic world engine is a means, not an end, and its ultimate value depends entirely on an empirical, creative question that no amount of architectural rigor can answer: **does constraining generation this way produce stories that are more coherent and more compelling than unconstrained generation would, or does the constraint merely produce stilted, over-controlled output?** The vertical slice should be designed to surface evidence on this question directly — for example, through a blind side-by-side comparison of a scene generated under the full constraint system against the same scene generated without it — because if the constrained version isn't demonstrably better as a piece of storytelling, no amount of correctness elsewhere in the system will have been worth its considerable cost.

### A related point: the human is an author, not only a gate

Throughout this architecture, the human's role is consistently framed as reviewer and approver — the final check in a validation pipeline. But the person building this system is also its **author**, whose actual creative work — pacing, tone, surprise, emotional payoff, deliberate irregularity — doesn't fit neatly into a compile-and-review model at all. A system optimized entirely for consistency risks suppressing precisely the irregularities that make fiction feel genuinely alive rather than mechanically correct. The deliberately-unresolved-canon mechanism and the Pardon Ledger are both good gestures in this direction, but it may be worth asking whether the architecture needs a more deliberately designed space for creative rule-breaking — not framed as an exception requiring justification against a default of compliance, but as a legitimate mode of working that the system supports directly, rather than merely tolerates through an approval process.

---

## Appendix: Consolidated List of Outstanding, Unresolved Items

For quick reference, gathered from across every section above — items that were identified as real problems during the review process but had not yet been corrected in the specification as of the most recent revision reviewed:

1. **The deletion script's negative control tests Git's diff behavior, not the deletion pipeline itself.** Needs to mutate a source dossier and assert the *full script* fails.
2. **The cross-architecture CI workflow has no negative control of its own** — no test confirms it would actually catch a genuine cross-platform divergence if one occurred.
3. **The event hash chain omits `event_type` and other envelope fields from the hashed content**, hashing only the `data` payload plus the previous hash — allowing an event's type to be altered without breaking the chain.
4. **`sequence_id` typed as `bigint` will fail to serialize via `JSON.stringify`** if events are exported to NDJSON as specified.
5. **Event payloads are typed as an unconstrained record**, defeating the purpose of a typed event system; each `event_type` needs its own discriminated payload schema.
6. **Manifest signing lacks a specified algorithm, key storage location, public-key pinning mechanism, and rotation/revocation story.**
7. **The Git anchor for the event log occurs only at episode boundaries**, leaving an unwitnessed window between anchors; more frequent and externally-witnessed anchoring would close this.
8. **The errata protocol's "update manifest in place" language contradicts the stated immutability of manifests**; needs to become an append-only supersession record instead.
9. **The shared-transcript epistemic leak is not yet addressed by any concrete mechanism** — filtering must be applied to the assembled scene transcript itself, not only to each character's individual prompt context.
10. **The `4n+1` sawtooth waste-tool's example output numbers do not match its own worked example** when independently recomputed — a live illustration of exactly the problem the Generated-Documentation Rule exists to prevent.
11. **Frame and timeline arithmetic specified using floating-point seconds** rather than integer milliseconds throughout, leaving a real (if narrow) floating-point representation-error hazard.
12. **No golden-file failure suite has yet been confirmed built**, despite being correctly identified as needing to precede the deletion test in build order.
13. **A `RuleSchema` for pardon enforcement is specified but its exact required/default semantics for the `pardonable` field remain to be finalized** — the recommendation is to make it required with no default, rather than defaulting to false.
14. **No reducer test corpus (golden event streams with known expected final states) has been specified**, despite the reducer being one of the two or three most consequential pure functions in the system.
15. **No key-custody design exists yet** for the signing capability the provenance manifest depends on.
16. **The vertical slice has not yet been built.**
