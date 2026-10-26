# Goblin Pipeline — Consolidated Design Synthesis

**What this is:** a single reference document that merges everything valuable from the design material and analysis exchanged in this conversation: the pasted architecture documents (`goblin-viewport`, `goblin-viewport-template`, `worker-sower-engine`, `repo-bot`, the conductor/render/QA layers, the "unified ontology" documents, and two later consolidations), plus the critique, corrections, and additions made along the way (including the hex-map/spatial-engine discussion).

**What this is not:** a status report. Nothing here has been verified against your actual repositories or hardware. Everything is design analysis. Where the source material asserted something as fact that I believe is wrong, overstated, or unverifiable, this document says so explicitly and records it in the corrections log (Section 22).

---

## 0. How to read this document

### 0.1 Epistemic tags

Every substantive claim carries one of these tags, because the single biggest weakness of the source material was that it blended principles, guesses, and inventions in one confident voice.

| Tag | Meaning |
|---|---|
| **[CORE]** | A principle I believe is fundamentally sound and would keep even if the project changes substantially. |
| **[DECISION]** | A good implementation choice, not a universal truth. Reasonable people could choose differently. |
| **[HYPOTHESIS]** | A plausible idea or numeric value that must be tested/measured before being trusted. |
| **[DEFER]** | A real technology or idea that doesn't answer the project's current highest-risk questions. Revisit on a stated trigger. |
| **[VERIFY]** | An external factual claim (tool flag, model behavior, standard) that should be checked against current documentation before use. |
| **[CORRECTED]** | A claim in the source material that was wrong or overstated, with the corrected version given. |

### 0.2 Source limits

- The source documents read like a chain of AI-generated architecture write-ups that repeatedly restate and reinforce each other. Agreement across them is evidence of *internal consistency*, not of *truth*.
- Several documents describe designed-but-unbuilt components (the Jules coordinate-extraction agent, `repo-bot` as a Cloudflare Worker, C2PA signing, MovieLabs packaging, Aspera delivery) as if they existed. They are treated here as **designs**, not facts.
- Every numeric threshold (dB values, pixel tolerances, entropy floors, similarity cutoffs) is a **[HYPOTHESIS]** unless it is a mathematical identity or a published standard.

---

## 1. Executive summary

### 1.1 What the system is

The project is best understood as a **deterministic world simulator with generative production attached to it**, not as an AI video generator and not as a prompt-orchestration engine.

A persistent fictional world (goblin characters, a hex-mapped environment, grievances, injuries, secrets, debts) is simulated by ordinary deterministic, seeded code. That simulation decides *what happens*. Generative models (an LLM for dialogue, a TTS model for voice, optionally a diffusion model for imagery) then decide *how it is expressed*. A code-generation step turns the result into an episode-specific Remotion (React) composition, which is rendered on CPU to video and archived.

### 1.2 The governing law **[CORE]**

> **Probabilistic systems propose and execute; deterministic systems decide what is allowed to be true.**

Generative models are untrusted workers with **zero authority** over world state, physical possibility, spatial position, or master timing.

### 1.3 The five load-bearing pillars **[CORE]**

1. **Authority:** the ledger governs; models propose. Generated content may *consume* state; it may never *silently create or change* state.
2. **Space as causality:** a hex map turns "who fights next" from an authorial choice into a physical consequence of where characters are.
3. **Simulation before language:** outcomes are decided mathematically first; the LLM makes a predetermined situation entertaining. It does not invent reality.
4. **Audio as the clock:** speech is synthesized and measured first; integer frame positions are derived from measured durations and computed once.
5. **Media never mutates state:** information flows one way (world → script → media). Rendered output is a projection of truth, never truth.

### 1.4 The sixteen invariants **[CORE]**

*Authority rules*
1. The ledger is the single source of mutable truth.
2. Canon is read-only and versioned; corrections create new versions.
3. Media never creates or changes state; meaning-changing edits route back upstream.

*Causality rules*
4. Simulation decides events before any language is generated.
5. Space determines who can encounter whom.
6. Every consequential event and state change has a recorded cause.

*Information rules*
7. Characters receive only the information they possess (omission over instruction).
8. Truth, knowledge, and belief are separate; beliefs carry provenance.

*Time and determinism rules*
9. Audio is the timing authority; frame positions are computed once, as integers.
10. Narrative randomness is seeded, namespaced by purpose, and logged; representational randomness never feeds back into state.

*Engineering rules*
11. Deterministic requirements are enforced by deterministic code, not by asking an LLM.
12. Cheap checks run before expensive ones; drafts are permissive, broadcast is strict.
13. Every stage emits an inspectable, versioned artifact.
14. Old episodes are immutable; finished media is archived independently of regenerability.

*Process rules*
15. The simulator runs without media; human editorial review happens before expensive production.
16. Two feedback loops — simulation tuning and creative review — are first-class parts of the system, not afterthoughts.

### 1.5 Honest status

The design is **far ahead of the evidence**. Four rounds of refinement each added specificity without adding a single measurement, and the later rounds introduced new errors (Section 22). The next unit of progress is **not another architecture document.** It is:

1. a headless simulator that produces statistics, and
2. one short scene rendered end-to-end (the "tracer bullet").

### 1.6 The three biggest risks

1. **Creative quality.** A perfectly deterministic pipeline can produce boring or unfunny episodes. The audience does not care about the machinery. This is the largest *product* risk and the least addressed in the source material.
2. **Unvalidated specifics and over-engineering.** Precise-looking numbers and studio-scale infrastructure that solve problems the project does not yet have.
3. **LLM cost/latency on CPU.** Local inference on CPU (the source describes Qwen 2.5 on Rig 1) is slow; multi-pass validation designs may be impractical until measured.

---

## 2. System topology

### 2.1 Components (as described in the source material)

| Component | Role | Status |
|---|---|---|
| `000.goblin-lore` (also referenced as `goblin-lore` / `goblin-bible`) | Immutable canon: `characters.json`, `grievances.json`, `locations.json`, compiled `bible-state.json`. Read-only to the engine. | Described |
| `worker-sower-engine` | The narrative simulation ("the Sower") plus the conductor harness (`src/pipeline/produceEpisode.ts`). Runs on Rig 1. | Described |
| Relational ledger | Mutable world state (SQLite/PostgreSQL locally). | Described |
| `audio-microservice` | Local TTS service (source mentions port 8000; CosyVoice/Parler-TTS as examples). | Described |
| `goblin-assets-visual` | Sprites, backgrounds, per-character `manifest.json` contracts. | Described |
| `goblin-viewport-template` | The Remotion scaffolding and the generator (`generator/generate-episode-repo.ts`) that stamps per-episode source. | Described |
| `goblin-episodes/` | Stamped, self-contained per-episode directories/repos, each with baked `Episode_XXX.tsx` and `render_manifest.json`. | Described |
| `repo-bot` | Cloudflare Worker acting as a control-plane coordinator (dispatching generator runs, PR audits, versions snapshots). | Design only **[DEFER]** |
| `goblin-project` | Meta-repo holding release snapshots (`releases/episode-NNN.json`). | Described |
| Rig 1 | CPU/RAM host: simulation, local LLM, TTS orchestration, Remotion render. Zero GPU use for rendering. | Described |
| Rig 2 | GPU host for optional diffusion (headless ComfyUI via `edge-director` / `media-broker`). | Optional / later |

### 2.2 `goblin-viewport` vs `goblin-viewport-template`

These are two stages of one idea, not two active products.

- **`goblin-viewport` (legacy concept):** one long-lived Remotion app that ingested a mutable `scene.json` at render time. Problem: when a shared component (e.g., `GoblinPuppet.tsx`) was updated for Episode 40, re-rendering Episode 12 silently changed it. This is the **historical corruption trap**.
- **`goblin-viewport-template` (current):** a template *and compiler*. It is never an episode runtime. A generator reads the timing manifest and dialogue AST and **stamps out an isolated per-episode workspace** with the timeline literals baked directly into TypeScript.

"Viewport" survives only as a casual label for the compositing stage in diagrams. On disk and in Git, the maintained codebase is `goblin-viewport-template`.

### 2.3 End-to-end data flow

```text
CANON (read-only lore, schema-validated)
   │
LEDGER (mutable: positions, wounds, secrets, debts, pressure meters, beliefs)
   │
SIMULATION (movement → pair → grievance → duel → ledger mutation)
   │
SCENE SPEC (everything already decided)
   │
DIALOGUE AST (beats, typed) ──► deterministic validators ──► HUMAN REVIEW
   │
TTS (.wav) ──► measure ──► integer frame budget ──► timing manifest
   │
VISUAL CONTRACTS (manifest.json: anchors, visemes, nulls)
   │
GENERATOR (stamp Episode_XXX.tsx + render_manifest.json, vendored components)
   │
RENDER (Remotion, CPU, pinned environment)
   │
QA (schema → signal → geometry → semantic → human)
   │
ARCHIVE (final MP4 + inputs + plates, integrity-checked)
```

Surrounding all of it: versioned artifacts, logged transformations, seeded randomness, schema validation. **And two feedback loops** (Section 6.10 and Section 14.7) that the forward-flow diagram omits but that consume most real development time.

### 2.4 Key artifacts

| Artifact | Producer | Consumer | Nature |
|---|---|---|---|
| `dialogue_ast.json` | Sower (post-LLM, validated) | Conductor, generator, QA | Canonical machine contract. The `.fountain` screenplay is only a human-readable projection. |
| `exposure_sheet.json` (timing manifest) | Conductor (after TTS + measurement) | Generator, renderer | Frame budgets, absolute start frames, audio paths, cues. |
| `manifest.json` (per character) | Asset repo | Generator, renderer | Typed visual contract: anchors, visemes, motion scalars, explicit nulls. |
| `Episode_XXX.tsx` | Generator | Remotion | Baked, literal composition. |
| `render_manifest.json` | Generator | Archive | Provenance: upstream commits, asset hashes, environment. |

---

## 3. Ontology: what kinds of thing exist

The source's most durable conceptual contribution is a strict separation of **truth, state, history, memory, and media**. Collapsing any two of these is the root of most continuity bugs.

### 3.1 The tiers **[CORE]**

```text
CANON   (immutable axioms: "Bog is a goblin", "the siphon room exists")
   │ constrains
STATE   (mutable snapshot: "Bog is injured", "the siphon is missing")
   │ transformed by
EVENT   (typed, caused, seeded mutation: "Snerk stole the siphon on cycle 14")
   │ produces
NEW STATE
   │ projected (one-way) into
MEDIA   (screenplay, exposure sheet, TSX, MP4)
```

Two further distinctions:

- **History vs memory.** History says *Snerk stole the siphon.* Memory says *Bog believes/knows Snerk stole it.* Each character has their own memory of world history, which is what makes dramatic irony structural rather than prompted.
- **Truth vs belief.** The world can be objectively one way while characters believe it is another. This is the richest source of drama and must never be left to the LLM to fabricate.

### 3.2 Meaning vs representation **[CORE]**

- **Meaning** (decided by the Sower): *Bog is humiliated; Bog is in the siphon room; Snerk stole the siphon.*
- **Representation** (decided by the viewport): *`bog_humiliated_take03.png`, this camera push-in, that background matte.*

The simulation is visual-agnostic. This means the visual stack can be replaced (2D cutouts → diffusion plates → a different art style → even a comic or audio drama) without altering the world, simulation, dialogue, or timing.

### 3.3 Media is never state **[CORE]**

Screenplays, exposure sheets, TSX files, and rendered MP4s are **projections of truth**. Editing a projection changes an editorial view; it does not retroactively change what happened. The corollary that catches people: an *animation* showing Bog falling does not mean Bog is injured. The simulation must already have decided that.

### 3.4 The Deletion Principle (and its boundary) **[CORE]**

If every generative model were deleted, the world should remain logically and referentially consistent inside the ledger. But **generated media is archive-dependent**: diffusion outputs and TTS audio generally cannot be regenerated bit-for-bit from seeds alone (GPU/driver/library variance). Therefore rendered plates and approved audio must be preserved as artifacts, not treated as recipes (Section 15).

### 3.5 Two orthogonal axes, and a debugging taxonomy **[DECISION]**

Failures split into **Axis A (semantic: meaning, timing, visual mapping)** and **Axis B (hardening: reproducibility, environment)**. This gives a clean triage table:

| Failure | Axis | Root boundary |
|---|---|---|
| Character references an unrevealed secret | A (semantic) | Epistemic context extraction leak |
| Character uses an injured/amputated limb | A (semantic) | Somatic invariant violation |
| Dialogue starts N frames off from mouth movement | A (temporal) | Quantization/offset error between audio and frame clock |
| Viseme detached from the chin line | A (visual) | Manifest anchor mismatch or canvas transform error |
| Chromium crash or text reflow | B (hardening) | Container divergence or unpinned font |
| Identical inputs, different output bytes | B (hardening) | Non-deterministic muxing/encoding, timestamps |
| Re-rendered old episode looks different | B (hardening) | Historical corruption trap (unpinned shared component) |

The practical value: when something breaks, ask **"which contract was violated?"** rather than "why is the AI weird?"

---

## 4. The ledger and authority

### 4.1 What the ledger holds **[DECISION]**

The exact fields are less important than the fact that there is one authority. Typical contents:

- **Characters:** location, health/composure, wounds and conditions, emotional conditions, relationships, grudges/resentment, debts, secrets known, cooldowns, possessions.
- **World:** current cycle, locations, objects, environmental state, unresolved events.
- **History:** events, movements, injuries, discoveries, exchanges, confrontations.
- **Pressure meters:** somatic fatigue, physical pain, refusal strain, paranoia clocks, resentment accumulators, each with ceilings and decay rates.
- **Strings:** directional leverage tokens (who holds leverage over whom).

### 4.2 Authority has two directions **[CORE]**

- **Restrictive authority (the floor):** the ledger forbids impossible actions. An actor with a severed arm cannot perform two-handed actions. A character cannot witness an event from across the map.
- **Generative authority (the mandate):** the ledger *requires* outcomes. If duel resolution says Bog loses and forfeits the siphon, the scene **must** contain that concession.

Restrictive authority is easy to lint. Generative authority is harder: it requires the dialogue to be represented as **typed beats** so you can assert that the beat sequence *terminates in the mandated state-transition event*. This is the deepest reason the AST exists.

### 4.3 The teeth test **[CORE]**

The critical word in "models may never *silently* redefine state" is **silently**. Models may *propose*; a deterministic gate decides. And the rule only means something if a violation causes a **failure**, not a warning. A ledger that merely documents state is a wiki; a ledger that rejects drafts is a governor.

Practical test: write one deliberate violation (an injured-limb character using that limb) and confirm the pipeline actually rejects it. If nothing rejects it, authority doesn't exist yet.

### 4.4 Canon vs ledger vs history **[CORE]**

- **Canon:** permanently true (world law). Ingested read-only at boot. If schema validation or a foreign-key slug fails at boot, the engine halts.
- **Ledger (state):** true now.
- **History (event log):** what happened, with causes.

### 4.5 Current-state ledger plus event log, not full event sourcing yet **[DECISION]**

The source material brands the architecture "event-sourced" and describes a pure reducer `S_{n+1} = R(S_n, E_n, σ_n)` with replay from genesis. That is elegant and eventually valuable (branching "what-if" timelines, instant rollback), but it roughly doubles implementation surface up front.

The practical recommendation, and the version consistent with everything else:

- Keep **current-state tables** *and* an **append-only event log**.
- Decide which is authoritative. If the log is the authority and state is derived, you are event sourcing. If state is authoritative and the log is an audit trail, you are not, and that is fine. **What you must not do is keep both as independent truths** — that recreates the two-sources-of-truth problem the architecture exists to prevent.
- Move to a true pure-reducer design only if a concrete need (branching timelines, replay debugging) appears.

### 4.6 Event granularity **[DECISION]**

Too coarse (`DUEL_RESOLVED`) loses "why did resentment change?" Too fine (one event per field) is unreadable. Working rule: **one event per *decision*** (a duel, a movement, a disclosure), each carrying a list of resulting effects:

```json
{
  "event": "COSTLY_WIN",
  "cycle": 14,
  "actor": "bog",
  "target": "snerk",
  "cause": { "pair_score": 7.4, "grievance": "missing_brass_siphon", "location": "siphon_room" },
  "effects": [
    { "type": "CONDITION_ADDED", "character": "bog", "condition": "bruised" },
    { "type": "RESENTMENT_DELTA", "holder": "snerk", "target": "bog", "delta": 0.2 },
    { "type": "KNOWLEDGE_GAINED", "holder": "mog", "fact": "bog_suspects_snerk", "source": "DIRECT_OBSERVATION" }
  ]
}
```

### 4.7 Every consequential event is explainable **[CORE]**

If you cannot answer "why did the simulation select this?", you don't yet understand it. Emit human-readable explanations (Section 6.9) alongside machine JSON. Explainability is also the fastest way to find rules that produce absurd results.

### 4.8 Invariants worth testing directly **[DECISION]**

- Every actor has exactly one position.
- Every object has at most one owner and one location.
- Every knowledge/belief record has provenance.
- Every scene participant and location exists.
- Actors marked disabled/dead do not participate.
- Objects are never duplicated.
- Conditions decay/recover per their rules.

---

## 5. Space: the hex map as a causality engine

### 5.1 Why space matters more than it first appears **[CORE]**

Without space, story selection asks *"who would be interesting together?"* — an authorial question LLMs answer badly and repetitively (the same pairs, the same drama). With space, it asks *"who can actually encounter whom?"* — a physical question with a determinate answer.

Consequences of having a spatial model:

- **Scene selection with a reason:** the pairing lottery filters to colocated or adjacent actors.
- **Natural pacing:** after a Backfire, the loser storms off several hexes away and physically cannot be in the next confrontation unless movement brings them back. Cooldowns become physical, not just counters.
- **Witnesses for free:** the Costly Win outcome gives "a third-party witness" a String. Who is a witness? Anyone within N hexes with visibility. Without a map that choice is arbitrary.
- **Secrets that travel:** knowledge spreads through proximity. A secret spoken in a hex with three listeners is now known by three characters. "Ignorance by omission" now has something concrete to enforce.
- **Props and locations become mechanical:** a grievance tied to the brass siphon fires where the siphon is. Objects that move, get stolen, and change hands create causal chains — a large source of comedy.

### 5.2 Why hexes **[DECISION]**

- **Uniform adjacency:** exactly six neighbors, all equidistant. Square grids have the diagonal ambiguity (Manhattan vs Chebyshev vs Euclidean).
- **Clean distance metric:** in cube coordinates `(q, r, s)` with `q + r + s = 0`, distance is `max(|Δq|, |Δr|, |Δs|)` (equivalently `(|Δq|+|Δr|+|Δs|)/2`). No special cases.
- **Isotropic range:** "within 2 hexes" is a fair, circle-ish region in every direction — important for witness and gossip radius.
- **Six neighbor offsets (cube):** `(+1,−1,0) (+1,0,−1) (0,+1,−1) (−1,+1,0) (−1,0,+1) (0,−1,+1)`.

**Nuance — do you need a hex grid or a location graph?** If the world is really ~15 named places and characters mostly move between rooms, a plain weighted graph of locations may be simpler. Hexes earn their keep if you want emergent adjacency, wandering, line-of-sight, or a visual map you can inspect. The same interface can serve either: `distance(a,b)`, `neighbors(x)`, `occupants(x)`.

### 5.3 The three-way ownership split **[CORE]**

| Concern | Owner | Change rate |
|---|---|---|
| **Map definition** (tiles, terrain, `location_id`s, props' canonical homes) | **Canon** (`goblin-lore`) | Almost never (world law) |
| **Spatial mathematics** (distance, neighbors, ring, range, pathfinding, visibility) | **Pure library** (code) | Only when you find a bug |
| **Positions** (who/what is where, now and historically) | **Ledger** | Every cycle |

Why this is right: three different change rates and three different authorities means each fact has **exactly one owner**, so there is nothing to reconcile.

Illustrating the principle: prefer `distance(positionA, positionB)` (pure function over passed-in data; the source of truth is visible at the call site) over `mapService.getCharacterDistance("Bog", "Snerk")` (hides where the positions come from and invites a competing authority).

### 5.4 What the spatial layer should track **[DECISION]**

1. **Actor positions** (cube coordinates).
2. **Movement rules:** speed per cycle, terrain cost, and — critically — **what motivates movement.** Good motives come from the ledger: a `humiliated` character retreats toward an isolated hex; a high paranoia clock avoids the suspected person; someone seeking to spend a String moves toward its target.
3. **Terrain and place semantics:** open camp allows witnesses; a cramped shed raises tension; a `location_id` can unlock or gate grievances (the valve grievance only fires in or adjacent to the valve's hex).
4. **Objects and props:** position, holder, state, and history. The brass siphon has a hex, a current holder, and a movement history.
5. **Occupancy and visibility:** deterministic line-of-sight (simplest: same or adjacent hex). Seeing an event is how a character comes to *know* it, so visibility feeds the epistemic layer.
6. **History:** an append-only movement log. Cheap and enormously valuable for "who was near the crime?" grievances.

### 5.5 How space plugs into each simulation stage

```text
Stage 0   Movement phase   → actors move (deterministic, seeded, motive-driven)
Stage 3a  Pairing lottery  → candidates = colocated ∪ adjacent
Stage 3b  Grievance filter → location-bound grievances only if hex/location matches
Stage 4   Duel resolution  → terrain and witness modifiers
Stage 4   Ledger mutation  → witnesses within radius gain knowledge / Strings
Stage 5   Prompt assembly  → scene location and who is present
Stage 6   Exposure sheet   → background matte chosen from location_id
```

### 5.6 Keep the hex on the *meaning* side of the wall **[CORE]**

The Sower emits a semantic `location_id`; the viewport maps that to a background matte. Do **not** let hex position drive *screen* layout (e.g., placing characters at screen X/Y proportional to hex distance). The simulation's space and the viewer's space are different coordinate systems. Camera framing, character placement, scale, eyelines, and entrance direction are representation decisions with their own rules. Otherwise the wall between meaning and representation erodes from the spatial side.

### 5.7 Spatial risks

- **Determinism:** movement must use seeded, namespaced randomness (Section 16). An unseeded wander breaks replay.
- **Runaway clustering** (everyone drifts together) or **dead zones** (unreachable rooms): add repulsion/goal variety and check with a debug map.
- **Over-specification:** elevation, weather, and pathfinding should be added only when a grievance demands them.
- **Map–narrative mismatch:** the scene-location contract must be *enforced*, not advisory — if the map says two characters are six hexes apart, the script cannot place them in one room.

### 5.8 Module now, repository later **[DECISION]**

These are two different decisions and conflating them is the common mistake:

- A **module boundary** is a code-organization choice: clean interface, no reaching into internals. It costs nothing. **Do it now.**
- A **repo boundary** is an operational choice: independent versioning, release, CI, access control, cross-repo change coordination. It has real ongoing cost.

**Recommendation:** put spatial code in `worker-sower-engine/src/spatial/` as a strict module with these rules:

- Exports a narrow, documented interface.
- **Imports nothing from the rest of the Sower** (no ledger, LLM, pipeline).
- Takes plain data in, returns plain data out (**stateless geometry library**).
- Has its own tests runnable in isolation.
- Positions live in the ledger; map data lives in lore.

**Why stateless:** if the library *owned* positions, it would compete with the ledger for authority — the exact two-truths bug the architecture forbids.

**Why not a repo yet:** you have zero simulated episodes. The spatial API you would freeze today is a guess; extracting an interface before using it freezes the wrong seams. Every new spatial query would then cost two-repo coordination.

**Genuine benefits of eventual extraction:** a narrow stable interface; pure and exhaustively testable; reusable by a map viewer or other tools; enforces the meaning/representation wall; supports per-episode version pinning of spatial rules.

**Extract when any of these is true:**
1. A second, *independent* consumer needs it. The most reliable signal: you wrote a debug map-renderer against the library and it needed **no interface changes**.
2. The interface has been stable across several episodes.
3. You need per-episode pinning of spatial rules and can't get it otherwise.
4. Sower test/compile time is painful and the spatial suite is a meaningful part.

Because you enforced "imports nothing from the Sower," eventual extraction becomes a mechanical `git subtree split`, not a refactor.

**Sketch of a future `goblin-spatial` layout** (if extracted):

```text
goblin-spatial/
├── src/
│   ├── coords.ts        # cube/axial types, conversions
│   ├── distance.ts      # distance, ring, spiral, range
│   ├── pathfind.ts      # A* with terrain costs
│   ├── visibility.ts    # line-of-sight, witnesses
│   ├── terrain.ts       # terrain types, movement cost tables
│   └── index.ts         # the only public surface
├── schemas/             # hexmap + position JSON schemas
├── tools/render-map-svg.ts   # debug visualizer
└── test/
```

(The map *data* itself remains canon-adjacent: `maps/camp.hexmap.json` belongs in lore, not in this package.)

### 5.9 A debug map renderer is disproportionately valuable **[DECISION]**

A small SVG generator that shows the map, characters, props, and recent movement trails at cycle N will surface clustering, dead zones, unreachable rooms, and prop-loop bugs faster than any log.

### 5.10 Testing space **[DECISION]**

Test invariants, not just examples:

- `distance(A,B) ≥ 0`; `distance(A,B) == distance(B,A)`; `distance(A,A) == 0`.
- `B ∈ neighbors(A) ⇔ A ∈ neighbors(B)`; every interior hex has 6 neighbors.
- `q + r + s == 0` for every valid coordinate.
- Movement never crosses impassable terrain; invalid coordinates are rejected.

---

## 6. Simulation before language

### 6.1 The principle **[CORE]**

Do not ask an LLM "write a scene where two goblins argue." Ask the deterministic system: *Who is present? Where? Why can they interact? What grievance is active? What does each character know and want? What are the stakes? What outcome occurs? What changes afterward?* Then hand those **decided facts** to the model.

The LLM's job shrinks from "invent reality and describe it" to "make this predetermined situation entertaining." That is a much easier and far more controllable problem. It also moves sustained causality — the thing LLMs are worst at — out of the LLM entirely.

An example of what the model should receive:

```json
{
  "participants": ["bog", "snerk"],
  "location": "siphon_room",
  "grievance": "missing_brass_siphon",
  "beliefs": {
    "bog": ["snerk_stole_siphon (confidence 0.7, source: RUMOR)"],
    "snerk": ["bog_blames_him (confidence 0.9, source: INFERENCE)"]
  },
  "outcome": "COSTLY_WIN",
  "winner": "bog",
  "mandated_state_changes": ["bog gains 'bruised'", "siphon transfers to bog"],
  "required_beats": ["ACCUSATION", "DENIAL", "CONCESSION"]
}
```

### 6.2 The constraint envelope must be tuned empirically **[HYPOTHESIS]**

Over-specifying every micro-action yields stiff, scripted-sounding dialogue; under-specifying lets the model drift. The ledger sets the *bounding box* (participants, initial tension, required dramatic turns, mandatory exit conditions); the LLM fills the interior. The right amount of specification is found by reading output, not by design. Highly constrained generation makes the LLM a *stylist under specification*, not an author, and that costs some naturalness.

### 6.3 Stage-by-stage flow

**Stage 0 — Movement phase.** Actors move under seeded, motive-driven rules (Section 5.4).

**Stage 3a — Duel pairing lottery.**
- Proximity sweeps identify collocated/adjacent actors.
- Relational tension, resentment accumulators, recent-interaction cycles, and ensemble-balance counters weight the candidate pool.
- **Hard override ("Boil Over"):** before normal weighting, if any pair's resentment accumulator crosses its ceiling, normal selection is bypassed and that confrontation is forced.

**Stage 3b — Grievance selection (the "Machine Rail" over frontmatter).**

```text
Eligible = (SceneCast ∩ Primary) \ Excluded
           where  Intensity ∈ [Min, Max]  ∧  Cooldown = 0
```

Weights increase if the grievance matches an active paranoia clock or unresolved narrative thread.

**Stage 3c — Leverage expenditure heuristic.** A participant simulates win probability and expends Strings when odds dip low.

**Stage 4 — Mechanical resolution** (Section 6.4).

**Stage 5 — Semantic drafting and invariant linting** (Section 9).

### 6.4 Duel resolution mathematics

```text
Argument Score A = (Base + Roll) + (StringsSpent × W) − (Debuffs × P)
```

- **Base:** character attribute (Spite, Cunning, or Charm), 1–5.
- **Roll:** 2d6.
- **W (String weight):** genre-tone constant (source example: W = 3 ⇒ structured blackmail leverage; lower ⇒ chaotic reversals).
- **P (penalty weight):** per active negative condition (source: −2 each).

### 6.5 The outcome taxonomy **[CORE]** (as a concept; thresholds are **[HYPOTHESIS]**)

| Outcome | Mechanical trigger | Ledger mutation / narrative directive |
|---|---|---|
| **Clean Win** | Margin ≥ 4, zero Strings spent | Loser gains a condition (e.g., `humiliated`); winner gets clean validation |
| **Costly Win** | Narrow margin, or winner spent ≥ 2 Strings | Both gain a condition; a third-party witness gains a String on the winner |
| **Mutual Wound** | Near-tie (margin 1–2) | Both gain conditions; active paranoia clock gets a small tick |
| **Backfire** | Winner spent a String tied to an over-escalated/stale grievance | Social result flips: nominal winner loses the String and gains `humiliated`; nominal loser gains status |
| **True Tie** | Exact score equality | Both gain conditions; paranoia clock ticks a full segment |
| *Withdrawal* (special) | Composure/HP hits 0, or a `goes_silent` character fails a Mutual Wound | Halve grievance cooldowns; apply `cowardice` |

The value of the taxonomy: an encounter produces **state transitions**, not merely winners. It creates a *scene grammar* so episodes aren't all "A beats B."

**Gaps to resolve:** the taxonomy leaves **margin 3** and "narrow margin" undefined (Clean Win starts at ≥4, Mutual Wound covers 1–2). Decide explicitly. Note also that Backfire and Costly Win depend on **Strings spent**, not margin alone, so classification is a function of (margin, strings, grievance staleness), not margin only.

### 6.6 The dice mathematics, computed **[CORRECTED]**

2d6 has 36 outcomes; the sum 7 occurs 6/36 (16.7%), and 2 or 12 occur 1/36 each (2.78%). The **difference of two opposed 2d6 rolls** ranges from −10 to +10 over 1,296 combinations. The source's margin table was wrong. The exact distribution (equal Base, no modifiers):

| \|margin\| | Combinations (both sides) | Probability |
|---|---|---|
| 0 | 146 | 11.27% |
| 1 | 280 | 21.60% |
| 2 | 250 | 19.29% |
| 3 | 208 | 16.05% |
| 4 | 160 | 12.35% |
| 5 | 112 | 8.64% |
| 6 | 70 | 5.40% |
| 7 | 40 | 3.09% |
| 8 | 20 | 1.54% |
| 9 | 8 | 0.62% |
| 10 | 2 | 0.15% |

Key derived figures:
- **\|margin\| ≤ 2:** 676/1296 = **52.2%** (the source claimed 66.7%).
- **\|margin\| ≥ 6:** 140/1296 = **10.8%** (the source claimed 0%; note that an earlier estimate of "about 15%" in this conversation was also wrong — 10.8% is correct).
- **A specific side winning by ≥ 4:** 206/1296 = 15.9% (either side: 31.8%).
- **Near-tie band (\|margin\| 1–2, "Mutual Wound"):** 530/1296 = **40.9%**.
- **True tie (margin 0):** 11.3%.

**Interpretation:** with equal opponents and no leverage, roughly half of encounters land in 0–2 margins, so Mutual Wound and narrow outcomes will be very common and Clean Wins comparatively uncommon (~32% combined for either side, before accounting for Strings). Whether that is what you want is a creative decision — but predict it before the first run so you notice when reality disagrees.

### 6.7 Leverage effect on win probability, computed **[CORRECTED / verified arithmetic]**

Win probability for side A as a function of net modifier *m* (equal Base; integer modifiers; ties reported separately):

| Net modifier *m* | P(A wins) | P(tie) | P(A loses) | Gain vs m = 0 |
|---|---|---|---|---|
| 0 | 44.4% | 11.3% | 44.4% | — |
| +1 | 55.6% | 10.8% | 33.6% | +11.2 pts |
| +2 | 66.4% | 9.6% | 23.9% | +22.0 pts |
| +3 | 76.1% | 8.0% | 15.9% | +31.7 pts |
| +4 | 84.1% | 6.2% | 9.7% | +39.7 pts |
| +6 | 94.6% | — | — | +50.2 pts |

**Implication:** with **W = 3**, one String is worth about **+32 percentage points** near an even matchup — a very large swing relative to Base (1–5) and the 2d6 spread. Leverage will dominate baseline attributes unless Strings are scarce, W is reduced (e.g., 1.5), or the String contribution is capped (e.g., at +2). Capping changes how Strings should be *valued*, so it interacts with the Stage 3c expenditure heuristic. The source's "30–40 points" claim was roughly right; the point is to *compute* rather than trust — a script is in Appendix B.

Also remember that unequal Base values (1–5) shift the whole distribution, and Debuffs at P = 2 each are a large lever too.

### 6.8 Simulation attractors: the most valuable new idea **[CORE]**

Any persistent simulation develops **attractors**. There are three structural types, each with a different cure:

| Type | Example | Cure |
|---|---|---|
| **Positive feedback loop** (runaway winner) | Winner gains leverage, wins more, gains more | Diminishing returns; catch-up mechanics; escalating scrutiny on dominant figures |
| **Absorbing state** (death spiral) | Injured → loses fights → more injured, with no recovery path | Guaranteed condition decay; rest cycles; sanctuary hexes |
| **Sticky pairing** (gravity well) | Two adjacent, mutually resentful characters keep triggering the lottery | Escalating cooldowns that scale; spatial repulsion after confrontations |

The classic example: *Bog humiliated → resentful → targets Snerk → Snerk retaliates → Bog injured → more resentful → targets Snerk again.* You have built "the Bog/Snerk Grudge Machine."

**Measure, don't hope.** Useful metrics: pair diversity, character participation, location utilization, grievance utilization, condition distribution, injury duration, resentment distribution, knowledge concentration, object movement.

**Pairing entropy [CORRECTED]:** `H(P) = −Σ pᵢ log₂ pᵢ` over the empirical pairing distribution in a sliding window. The formula is right, but the source's gate ("H ≥ 2.2") was arbitrary:

| Cast size | Unordered pairs *M* | Max entropy log₂(M) |
|---|---|---|
| 4 | 6 | 2.58 bits |
| 5 | 10 | 3.32 |
| 6 | 15 | 3.91 |
| 8 | 28 | 4.81 |

For a 4-character cast, 2.2 would demand near-uniform pairing — which you *don't* want, because uneven pairings (rivalries) are the point. **Normalize** by dividing by log₂(M) (giving 0–1), set the healthy band by inspecting what a good-feeling run looks like, and **guard against collapse** (a sharp drop toward zero) rather than demanding a fixed absolute value.

**Feedback design:** decay rates, recovery mechanics, and an ensemble-balance term that actually bites are the most likely place the simulation feels dead after ~10 episodes. They are not "settled" by being listed.

### 6.9 The simulate-only mode **[CORE]**

Make this a first-class command; it will likely be the most-used tool:

```bash
simulate --episodes 1000
simulate --episode 12 --verbose
```

No TTS, no rendering, no GPU. Example summary output:

```text
Episodes: 1000    Encounters: 4821    Unique pairings: 37
Avg encounters/episode: 4.82
Clean wins 31% | Costly 24% | Mutual wound 18% | Backfire 17% | True tie 10%
Most frequent pairing: Bog/Snerk 14%
Characters with >3 injuries: 2 | Avg resentment 0.41 | Max 0.91
Locations never visited: 1 | Grievances never selected: 3
```

And a **verbose explanation** mode:

```text
CYCLE 14
Bog moved siphon_room → camp.
  Reason: high resentment toward Snerk; sought proximity to target.
Snerk already at camp → encounter triggered.
Grievance: brass siphon disappearance
  Bog knows: siphon missing; suspects Snerk
  Snerk knows: stole siphon; does not know Bog saw him
Outcome: COSTLY_WIN, winner Bog
Consequences: Bog gains injury; Snerk gains resentment;
              Mog witnesses; Mog learns Bog suspects Snerk
```

Also emit an **episode causal summary** at the end of each episode (initial state, major events, state mutations, new knowledge, relationships changed, objects moved, unresolved conflicts, final positions, outstanding grievances). It bridges episodes and makes continuity debugging tractable.

### 6.10 The tuning feedback loop **[CORE]**

Simulate → inspect statistics *and read samples* → adjust rules/grievances → simulate again. Phases 3 (simulation) and 4 (grievances) iterate against each other: you can't judge the simulation without real grievances, and you can't balance grievances without run statistics. Plan for the loop rather than treating the phases as strictly sequential.

### 6.11 The boredom detector **[HYPOTHESIS, corrected]**

A cheap, targeted metric: over the last *N* scenes, measure repetition of grievance, pairing, location, outcome type, and opening-line structure. If several repeat simultaneously, the world is stagnating regardless of how healthy individual metrics look.

**Corrections to the source's version:**
- Jaccard *similarity* is `|A∩B| / |A∪B|`; Jaccard *distance* is `1 − similarity`. The source used the terms interchangeably.
- Jaccard applies to **sets**. A scene has *one* grievance slug, *one* location, *one* outcome type — for single categorical values, Jaccard degenerates to match/no-match. Use **fraction of matching attributes** for categorical fields, and Jaccard only for set-valued fields (props involved, characters present).
- The 0.65 rejection threshold is a guess; tune from data.
- "Opening dialogue syntactic structure" needs a cheap classifier (question / imperative / observation) that must itself be built.
- **A detector that rejects and re-rolls scenes changes the distribution the simulation produces.** Measure Phase-3 simulator statistics *with the detector active*, or you will tune to one behavior and ship another.

### 6.12 Ledger tables (first cut) **[DECISION]**

`characters`, `locations`, `relationships`, `conditions`, `knowledge/beliefs`, `objects`, `events`, `movements`. Current-state tables plus event history give an audit trail without a full event-sourcing framework.

---

## 7. Knowledge, belief, and epistemics

### 7.1 Four different things **[CORE]**

| Concept | Meaning |
|---|---|
| **Fact / world truth** | What actually happened |
| **Knows** | Character has reliable information |
| **Believes** | Character holds a proposition to some degree, possibly wrongly |
| **Suspects** | Weaker belief |

Example: reality — Snerk stole the siphon. Bog believes Snerk stole it. Snerk knows. Mog thinks *Bog* stole it. Zog saw Snerk near the room but doesn't know what happened. This is dramatically fertile, and it is exactly where LLM prompting is dangerous.

### 7.2 Ignorance by omission **[CORE]**

Do not give a character information and then instruct them to forget it. **Omission is stronger than instruction.** If a character does not hold a given secret, that secret's ID and all references are stripped from their context before prompt assembly. LLMs leak what they are shown, even when told not to use it.

Formalizing: model knowledge as directional edges (`character —knows→ fact`) with metadata (origin event, timestamp, secrecy class). The context builder computes what is reachable for the scene's participants. At your scale, a simple `knows(character, fact)` table filtered at prompt assembly is functionally identical to a graph-reachability engine and far simpler.

### 7.3 The belief-provenance record **[DECISION, corrected]**

The source's record is the best new artifact in the later documents; keep the design, fix the details.

```typescript
interface BeliefRecord {
  belief_id: string;
  holder_id: string;
  proposition: {                  // structured, not a single target_id
    subject: string;              // e.g. "snerk"
    predicate: string;            // e.g. "stole"
    object?: string;              // e.g. "brass_siphon"
  };
  credence: number;               // 0..1 : holder's probability the proposition is TRUE
  source_type: "DIRECT_OBSERVATION" | "TESTIMONY" | "INFERENCE" | "RUMOR";
  source_event_id: string;        // pointer into the event log
  source_agent_id?: string;       // who told them (for TESTIMONY/RUMOR)
  resists_correction: boolean;    // character trait
  last_updated_cycle: number;
}
```

**Fixes from the source:**
- `perceived_truth_value: boolean` plus `confidence` is redundant and invites inconsistent pairs (`true` at confidence 0.1). Use **one `credence` value**: the holder's probability the proposition is true.
- A single `target_id` is too narrow for propositions involving several entities ("Snerk gave Mog the siphon"). Use a structured (subject, predicate, object) form, or accept the simple form as a convenience that will need generalizing.
- Add `source_agent_id` so a later reveal can say "Mog lied to Bog."

**Rules you still must write:**
- **Belief formation:** what confidence does direct observation vs testimony vs inference vs rumor carry, and how fragile is each?
- **Belief update:** contradicting evidence may flip, weaken, or fail to move a belief. "Resists correction" as a character trait is comic gold.
- **Belief decay and spread:** rumors propagate with confidence degrading per hop. Without decay, secrets saturate the cast within a few cycles — itself an attractor.
- **Correction events:** e.g., `BELIEF_CORRECTED`, which triggers social fallout from the discrepancy.

Provenance is what makes payoff scenes possible: "how did Bog find out?" reveals require a recorded source.

### 7.4 The multi-speaker dilemma **[DECISION]**

Per-character context is easy in a single-agent setup. But one scene often has one LLM call writing *both* speakers. If that call sees Character A's private knowledge, Character B can leak it.

Options:
- **(a) Isolated calls per character** (separate contexts, merged results): robust, but slower and loses natural back-and-forth cadence.
- **(b) One call with role-fenced context** (private knowledge cards scoped to character IDs) **plus a post-generation Leak Sentry** that scans Character B's lines for tokens/lemmas tied to A's unrevealed knowledge.

**Recommendation:** use (b) as the default for low-stakes secrets and (a) for any secret whose leak would break the scene's premise.

**Limits of the Leak Sentry [CORRECTED framing]:** lexical scanning catches *verbatim* leaks only. Paraphrased or implied leaks — the more common and damaging kind — pass through. ("Nobody else would have had access to that thing you keep sneezing near" contains none of the tagged tokens.) The source presented "role fencing + sentry" as *the resolution*; it is a good default and a bad guarantee. Also, the source's mechanistic phrasing ("attention heads will attend to…") is overconfident — the behavior is well observed, the mechanism claim is not needed.

### 7.5 Knowledge is fenced by structure, not prompt engineering **[CORE]**

Every "please remember/forget/avoid" instruction in a prompt is a candidate to be replaced by a structural control: inject the injury from the ledger, omit the secret from context, measure the audio rather than asking for "about four seconds," check location state rather than asking the model not to teleport.

---

## 8. Grievances, drama, and creative quality

### 8.1 The largest product risk is not infrastructure **[CORE]**

The source spends most of its length on rendering, containers, provenance, and reproducibility — engineering problems the audience never sees. The audience cares whether the episode is **interesting and funny**. A perfectly deterministic pipeline can produce terrible entertainment. Two separate systems need evaluation:

- **System A — world integrity:** does the world behave correctly?
- **System B — dramatic/comedic quality:** is what happens worth watching?

Simulation gives *structure*; it does not give *voice* or *funny*.

### 8.2 Grievances are dramatic machinery **[CORE]**

A grievance is not "Bog is angry at Snerk." It should be a rich record that the LLM *operates* rather than *invents*:

```text
surface_complaint      Snerk took the brass siphon.
underlying_conflict    Bog believes Snerk doesn't respect him.
historical_trigger     Snerk previously borrowed equipment without asking.
object                 brass_siphon
location               siphon_room
participants           bog, snerk
required_knowledge     Bog knows siphon disappeared; suspects Snerk.
forbidden_knowledge    Bog does not know Snerk secretly returned it.
possible_escalations   accusation, denial, theft accusation, physical confrontation
possible_outcomes      apology, fight, object recovered, false accusation, new debt
frontmatter rail       intensity [min,max], cooldown_cycles, primary/excluded cast
```

### 8.3 Surface conflict vs underneath **[CORE]**

Good scenes have a surface argument ("You took my siphon") and an unadmitted underneath ("You don't respect me"). LLMs tend to *state* the subtext, destroying it. Treat the hidden motive as a **constraint on behavior, not dialogue.**

Test it: generate five variants and ask *can a human infer the hidden motive without the character stating it?* That is a far more meaningful creative evaluation than token-level metrics. A linter can reject lines that explicitly name the hidden motive.

### 8.4 Author fewer, better grievances first **[DECISION]**

The source suggests 40–60 hand-authored grievances as an eventual target. Start with **~10 excellent ones** with real specificity, and use them to discover what the system needs. The immediate creative test: for one grievance, generate five variants and read them aloud. If the dialogue is flat, no compositing will rescue it.

### 8.5 Beat shapes and callbacks **[HYPOTHESIS]**

- **Beat-shape templates** (setup → escalation → reversal → button) selected by the outcome type. Each outcome (Backfire, Mutual Wound…) already implies a different comic shape; making them explicit gives the LLM a structure to fill.
- **A callback register:** a small index of prior memorable lines/objects/gags the writer can deliberately reuse. Running gags make episodic comedy feel like a *world* and require memory of **expression**, not just memory of state. The ledger tracks what happened; you also want an index of what was *funny*.
- **MRU pacing (Dwight Swain):** stimulus → reaction (feeling, reflex, rational action, speech). When the AST flags a cognitive shock (`VISCERAL_STING`), allocate an authored pre-roll of silence/held reaction (source suggests 8–24 frames) *before* speech onset so animation rhythm reflects psychological causality.

### 8.6 Character voice as a testable artifact **[DECISION, corrected]**

The most common LLM failure in multi-character writing is all characters converging on one generic voice. Cheap countermeasures:

- A **voice fixture** per character: a dozen real example lines tagged for diction, sentence length, verbal tics, and forbidden phrases.
- **Blind test:** strip speaker labels and see whether you (or a classifier) can tell who is talking.
- **Measurable stylometry** (mean/max sentence length, subordinating-conjunction rate, banned stock words).

**Corrections to the source's fixture:**
- **"Mandatory lexical tics" as a per-line requirement produces caricature** and forces nonsensical insertions. Model tics as **frequencies over many lines**, checked across a scene or season, not required in every line.
- **Bounds must be derived from real exemplars, not guessed.** Write ten real Bog lines, compute the statistics, then set bounds with a margin. Setting bounds first is backwards.
- A blacklist of LLM-isms ("testament," "tapestry," "palpable," "furthermore") is a good *signal* but plays whack-a-mole as models substitute other stock phrases. Use it as one signal among several, not a hard gate.

---

## 9. The language layer: dialogue AST, validation, and local inference

### 9.1 Structured beats before prose **[CORE]**

The intermediate representation should be typed beats attached to known actions, not arbitrary script text:

```json
{
  "$schema": ".../dialogue_ast.json",
  "schema_version": "3.2.0",
  "episode_id": "EP040",
  "scene_id": "ep040_sc03",
  "state_snapshot_hash": "sha256:...",
  "lines": [
    {
      "line_id": "line_001",
      "speaker": "bog",
      "dialogue_text": "The relay is dead. Don't touch the brass siphon.",
      "subtext": "Bog cannot admit he broke the valve while fleeing.",
      "conditions": ["humiliated", "brachial_plexus_severed"],
      "motor_actions": ["RETREAT", "POINT_SINGLE_HAND"],
      "reaction_cue": "VISCERAL_STING",
      "pacing_scalar": 1.0
    }
  ]
}
```

This gives you a checkable structure: did the required accusation occur, in order? Did anyone perform an impossible action? Did the scene end with the predetermined outcome?

The **AST is more important than the prose.** Downstream systems (TTS, timing, asset harvesting, camera choreography, QA) consume only the AST. The `.fountain` screenplay is a human-readable projection.

### 9.2 The AST does not remove the need to check prose **[CORRECTED]**

The AST tells you what beat was *intended*; the `dialogue_text` field is still free text that can smuggle in violations (revealing a secret, referencing an injured limb). You need **both**:
- **Structural checks** on the beat sequence (required beats present, terminal mandated event present).
- **Lexical/semantic checks** on each dialogue string.

The AST makes the second easier, because you check short isolated strings against a known speaker's knowledge rather than a sprawling paragraph.

### 9.3 The validation stack **[DECISION, ranked]**

A self-reported enum verifies only the model's **claim**, not the prose. Rank the checks by determinism and strength:

1. **Grammar-constrained enum** (GBNF/JSON mode): emitted action tokens must belong to the character's allowed capability set. Cheap and strong.
2. **Dependency-parse lemma scan with negation handling:** deterministic and moderate — "he could not grasp" passes, "he grasped" fails.
3. **Model-based extraction (a second pass reading only the prose):** a semantic backstop. **Correction:** temperature 0 makes sampling greedy but is not a rule-based parser (floating-point differences can vary across hardware), and if the extractor shares the generator's model family its errors are correlated — so it is not "independent" in the strong sense. Define a **policy for disagreement** with checks 1–2.

Then compute the set delta: `Actions_extracted \ Actions_declared`; if it intersects the character's `banned_kinetic_verbs`, abort **before** audio synthesis or GPU spend.

A note on the source's complexity claims: "O(1)" and "O(min(|A|,|B|))" for set intersection are decoration here — these sets have a dozen elements. Correctness matters; asymptotics don't.

### 9.4 The T₀ invariant gauntlet (the "Panopticon") **[DECISION]**

After drafting, run: set-intersection of extracted motor actions against banned kinetic verbs; a verb-lemma sweep reconciling declared enum tokens against prose; on failure, a **bounded** retry/patch loop; on pass, release to the conductor. Retries must have a hard budget and a defined terminal failure.

### 9.5 Local inference cost is a real constraint **[HYPOTHESIS]**

The source describes local Qwen 2.5 inference on Rig 1 CPU/RAM. CPU inference of a capable model is slow, and the designed pipeline multiplies calls: retries, a second extraction pass, possibly per-character generation. **Measure tokens/second on the actual hardware before finalizing the multi-pass design.** If calls are slow, prefer fewer, larger calls with strong deterministic post-checks. The tracer bullet exists partly to reveal exactly this.

### 9.6 Log every LLM call **[DECISION]**

Store prompt, seed, model/version, output, and lint results for every attempt. When quality is inconsistent you will need to know whether it was the prompt, constraints, or model — and you accumulate a free evaluation dataset.

### 9.7 Human review comes before expensive media **[CORE]**

```text
simulation → scene spec → dialogue AST → HUMAN REVIEW → TTS → render
```

A reviewer should decide in ~60 seconds: Is this funny? Is the conflict understandable? Does the character sound right? Is the outcome satisfying? Is it repetitive? Throw bad scenes away *before* spending TTS/render time.

**The 60-second claim only holds if the review artifact is short and readable** — outcome, two or three key lines, location, and why the scene was selected, on one screen of plain text. Raw AST JSON makes 60 seconds fantasy. Design the review view first; it doubles as the simulation's explanation output. Record a **structured rejection reason** (flat dialogue, unclear stakes, repetitive, out of voice, contradiction) for every rejected scene — this turns editorial judgment into data and tells you which validator to build next.

---

## 10. Time: audio as the master clock

### 10.1 The principle **[CORE]**

Generative video has no innate sense of speech cadence. So speech must exist on disk *before* the timeline is computed:

```text
approved dialogue → TTS (.wav) → measured duration → frame allocation → visual timeline
```

Duration is the **observation**; frames are the **derivation**. Store both, so if fps changes you re-derive frames from durations rather than losing information.

### 10.2 The frame formula, and doing it in integers **[DECISION]**

```text
target_frames = ceil( duration_ms / 1000 × fps )
```

Floating-point can misbehave at boundaries. Compute in integers: with `x = duration_ms × fps` (an integer), `ceil(x / 1000) = floor((x + 999) / 1000)`.

Worked example: 3,120 ms at 24 fps → `3120 × 24 = 74,880` → `floor((74,880 + 999)/1000) = 75` frames.

`ffprobe` is a **measurement instrument, not the clock authority**; the synthesized `.wav` is the temporal truth. Example measurement call:

```bash
ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 dialogue_sh001.wav
```

### 10.3 Absolute anchoring **[CORE]**

Audio stems are never concatenated end-to-end at render time. `ceil` adds up to one frame (~41.7 ms at 24 fps) of tail silence per shot, so chaining would accumulate drift against background beds. Instead, each stem gets an **absolute starting frame**, computed once as integers from the accumulated shot budgets:

```text
fromFrame_k = Σ_{i<k} total_shot_frames_i
```

A clarification of the source's wording: you *do* compute cumulative positions from durations — the point is to compute them **once, up front, as stored integers**, rather than re-deriving each shot's start from a running float sum at render time. Integer frame arithmetic doesn't drift.

### 10.4 The dual-clock model **[DECISION]**

- **Audio domain:** 48,000 samples/second (sample-accurate truth for phoneme onsets, foley hits, ducking envelopes).
- **Video domain:** 24 fps (discrete cut boundary).
- **Projection:** `sample = frame × (48000 / 24) = frame × 2000`.

Continuous sound isn't forced into frames prematurely; the compiler keeps both planes synchronized.

### 10.5 Exposure sheet **[DECISION]**

Keep measured duration and creative padding in **separate fields** so you can change padding without re-measuring:

```json
{
  "scene_id": "ep01_sc03",
  "fps": 24,
  "total_frames": 365,
  "shots": [{
    "shot_id": "ep01_sc03_sh001",
    "speaker": "bog",
    "audio_stem_path": "public/audio/dialogue/ep01_sc03_sh001.wav",
    "audio_duration_ms": 3120,
    "pre_roll_frames": 8,
    "audio_frames": 75,
    "post_roll_frames": 16,
    "start_frame": 0,
    "duration_in_frames": 99,
    "ducking_db": -14.0,
    "viseme_cues": [
      { "frame": 8,  "shape": "small" },
      { "frame": 12, "shape": "medium" }
    ]
  }]
}
```

(`pre_roll + audio + post_roll = 8 + 75 + 16 = 99`.) With this contract the renderer needs no narrative understanding: "at frame N, show this at this location while this audio plays."

### 10.6 Audio practicalities the source under-discusses **[DECISION]**

- **TTS output can vary between runs** unless seeded; the same line can differ by tens of milliseconds and change the frame count. Once approved, **archive the audio as an artifact — do not regenerate it on demand**, or the locked timeline silently shifts.
- **Trim leading/trailing silence deliberately before measuring**; silence padding inflates the frame budget.
- **Loudness/noise gates on stems:** source suggests integrated ≈ −16 LUFS with true-peak ≤ −1.0 dBTP and a noise floor below −60 dB before insertion (**[HYPOTHESIS]** — see 13.3 on picking one delivery target).
- **Ducking:** the source specifies −14 dB with a 6-frame attack and 12-frame release. Plausible starting values; they are **tuning parameters to set by ear**, not facts.
- **Deterministic foley:** seed spot foley with a hash of scene/shot/sample keys (source: Mulberry32 PRNG seeded from MurmurHash3), with an anti-clustering salt if the same variant would repeat back-to-back.

### 10.7 Lip sync is presentation, not truth **[CORE]**

The mouth must never determine dialogue timing:

```text
approved dialogue → audio → audio timing → viseme extraction → mouth animation
```

The source proposes four mouth shapes (`closed`, `small`, `medium`, `wide`) driven by audio energy. That is a legitimate stylized aesthetic (cutout puppetry) but amplitude-driven flapping looks mechanical unless smoothed:

- Threshold with **hysteresis** so the mouth doesn't chatter.
- Enforce a **minimum hold** per shape (2–3 frames).
- Consider **forced alignment** (Rhubarb Lip Sync is a real, widely used tool) if amplitude looks bad.
- Decide early; it changes the timing manifest. Because it's downstream, it can be upgraded later without touching the world.

### 10.8 The Wan-style `4n+1` diffusion lattice **[VERIFY, DEFER]**

If the greenscreen-diffusion path is used, hardware/model constraints (a 3D causal VAE with `4n+1` frame counts, ~16 fps native for Wan 2.1) must be isolated inside a **backend adapter** so they do not contaminate the universal timeline. Verify the actual native fps and frame constraints for your model version — they change between releases.

Round-up-and-trim protocol:

```text
N = ceil(duration_s × native_fps)                 # e.g. 3.12 × 16 → 50
diffusion_frames = 4 × ceil((N − 1)/4) + 1         # 4 × 13 + 1 = 53
```

Trim excess frames from the tail (which conveniently discards diffusion boundary degradation), then retime/interpolate the conformed frames to fit the locked 24 fps budget (50 native frames → 75 delivery frames = 1.5× retime). "Animating on twos" (generate at 12 fps, hold each frame twice) is cleaner and ~50% cheaper, *if* the model supports it.

### 10.9 The temporal hierarchy **[DECISION, corrected]**

The source used *cycle, episode, scene, beat, shot* interchangeably until a table separated them. That table is right in spirit; one fix and one caveat:

| Level | Unit | Clock | State mutations permitted |
|---|---|---|---|
| L1 | **Simulation cycle** (world tick) | Discrete world tick (≈1 in-world day, placeholder) | Movement, hunger/fatigue decay, passive tension, belief decay |
| L2 | **Episode** | Broadcast container (1–3 scenes) | Cooldown decrements, public status updates |
| L3 | **Scene** | Spatial encounter | Duel resolution, injuries, secret revelation |
| L4a | **Beat** (narrative, in the AST) | Dramatic action unit | Fatigue increments tied to actions |
| L4b | **Shot** (presentation, in the exposure sheet) | Audio/frame budget | Viseme shifts, camera cues (no world state) |
| L5 | **Frame** | 24 fps | — |

**Fix:** the source lumped Beat and Shot at one level. They are different: one beat can span several shots (cutting between speakers during a long accusation), and one shot can cover several beats. **Beats belong to the AST; shots belong to the exposure sheet** — preserving the meaning/representation wall.

**Caveat:** "1 chronological day per cycle" and "1–3 scenes per episode" are placeholders. The cycle-to-episode mapping is a *creative pacing decision* (how much unseen time passes between encounters), not a technical constant. A reasonable start: **one episode ≈ one dramatic scene plus short connective beats, with several quiet ledger cycles between encounters.** Whatever you choose, write it down — confusing levels causes real bugs (e.g., a cooldown applied per episode when you meant per cycle).

---

## 11. The visual layer

### 11.1 Asset manifests are APIs **[CORE]**

The compositor never guesses filenames, globs directories, or queries loose assets. It consumes typed `manifest.json` contracts (`goblin-assets-visual/characters/{id}/manifest.json`):

```json
{
  "schema_version": "1.0",
  "character_id": "bog",
  "anchor_point": { "x": 512, "y": 980 },
  "camera_anchor_points": { "crash_zoom_target": { "x": 412, "y": 198 } },
  "mouth_bounding_box": { "x": 380, "y": 240, "width": 64, "height": 32 },
  "animation_hints": { "talk_bounce_amplitude": 8, "idle_shiver_amplitude": 14 },
  "base_states": { "idle": { "file": "bog_idle.png" } },
  "poses": { "humiliated": "bog_humiliated_take03.png", "terrified": null }
}
```

- **`anchor_point`:** ground-contact pivot (feet); prevents sliding during pans/push-ins.
- **`crash_zoom_target`:** facial focus point for camera moves.
- **`mouth_bounding_box`:** placement window for visemes.
- **`animation_hints`:** per-character motion scalars so a generic puppet component expresses different weights/temperaments.
- **Pick one coordinate convention** (pixels in sprite-canvas space vs normalized 0–1) and document it; the source shows both in different places.

### 11.2 The explicit-null protocol **[CORE]**

`"terrified": null` means *"we know this asset is missing."* Omission would be ambiguous (forgotten vs. intentionally absent). Two-tier policy:

- **Draft mode (permissive):** fall back to `base_states.idle`, inherit anchors, emit a non-fatal warning so the pipeline can continue.
- **Broadcast mode (strict):** `∀ shot ∈ Episode: referenced_variant(shot) ≠ null`, otherwise the build fails unless an authorized waiver is committed to a release ledger.

General pattern: **development permissive, production strict.**

### 11.3 Coordinate extraction by an agent (Jules) **[DEFER / design only]**

The described loop: a candidate `take_NN.png` is committed; a coding agent inspects it, emits a `<visual_scan_trace>` (foot contact, facial centroid, mouth bounds), and a deterministic pre-flight (`validate-manifest-geometry.ts`) accepts or rejects before an atomic manifest patch. The **deterministic checks are the valuable part** — an LLM's vision output must never be trusted without them:

- **Bounds:** all coordinates within canvas.
- **Alpha gate:** alpha at `anchor_point` > 0 (pivot not floating in empty space).
- **Viseme aspect ratio:** `1.2 ≤ width/height ≤ 3.0` (**[HYPOTHESIS]** — calibrate on real assets).

Also worth keeping: a **rejection ledger** (`approved.json`) recording failed candidates under a typed taxonomy (`SEMANTIC_FAILURE`, `DISTINCTNESS_COLLISION`, `CROSS_CHARACTER_BLEED`, `PHYSICAL_DEFECT`) so the pipeline doesn't regenerate identical defects.

### 11.4 Start with a deliberately boring visual system **[CORE]**

First prove that the deterministic world produces a coherent episode and that the presentation layer depicts it faithfully. Use:

```text
PNG characters · simple backgrounds · simple transforms · simple mouth shapes · simple cuts
```

Not diffusion, video generation, matting, 3D, or motion synthesis. Later, replacing cutout rendering with diffusion plates changes nothing in the world architecture. **Diffusion is a second, independent project.**

### 11.5 Cutout puppetry and camera math

- **Puppet (`GoblinPuppet.tsx`):** swaps emotion base sprites and overlays frame-synchronized visemes; per-character motion from manifest scalars.
- **Camera:** non-warping transforms via linear interpolation (`interpolate`): push-ins (e.g., scale 1.0→1.05 over 120 frames), pans, high-frequency noise for shakes.
- **Origin normalization for crash zooms:** puppet-local coordinates (e.g., 1024×1024) normalized to canvas space (e.g., 1920×1080) at bake time:

```text
originX_global = (puppet.x + anchor.x × s) / canvas.width  × 100%
originY_global = (puppet.y + anchor.y × s) / canvas.height × 100%
```

injected into the camera wrapper's `transformOrigin`.
- **Layer order:** (1) hand-painted background matte, (2) atmospheric loops, (3) puppet or keyed plate, (4) camera transforms.

### 11.6 Greenscreen diffusion path **[DEFER]**

Diffusion models render characters on flat `#00FF00` to avoid spatial warping and background morphing when the model tries to generate character, motion, and background together. Realities the source glosses:

- **Edge boil / temporal noise:** stochastic video models produce sub-pixel noise on silhouette edges; keying alone leaves crawling edges against static mattes. A production path needs a **temporal deflicker applied to the isolated alpha matte** before compositing.
- **Neural matting over browser keying:** simple keyers struggle with motion blur and fringes. The source proposes running BiRefNet or Robust Video Matting inside ComfyUI to emit ProRes 4444 or VP9-with-alpha WebM.
- **[VERIFY]** the source references a Remotion `colorKey` with despill; to my knowledge Remotion doesn't ship a turnkey chroma-key primitive — plan on a canvas/WebGL/SVG-filter implementation or pre-keying in FFmpeg.
- **Alpha spill gate:** outer 3-px boundary mean green channel < ~12 (**[HYPOTHESIS]**).
- **Content addressing:** SHA-256-keyed storage, with an **empty-hash tripwire** (`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` is the well-known SHA-256 of zero bytes) and an `ffprobe` header-decode check before commit.
- Generated plates are **archive artifacts** (Section 15).

### 11.7 Asset pruning **[DECISION]**

Full character libraries can be tens of gigabytes. A collector (`collect-episode-assets.ts`) walks the AST and copies only referenced sprites, visemes, and backgrounds into the episode's staging tree (~90% reduction), honoring the per-episode ceiling (<100–150 MB). Also consider **dead-asset elimination and static-layer pre-compositing** (flatten contiguous shots sharing a background) — but measure render time first; do not optimize before you know it's slow.

### 11.8 Tree-hash staleness check **[DECISION]**

Compare source-tree hashes recorded in `compiled/bible-state.json` against the Git tree SHAs of `/characters/` and `/grievances/`; if they diverge, mark visual state stale and halt until `npm run compile` resyncs.

---

## 12. Source-baking and the generator

### 12.1 The real justification: historical isolation **[CORE]**

The strongest reason for source-baking isn't mystical reproducibility; it is that **new production can improve without rewriting history.** If Episodes 1–3 all import a shared `GoblinPuppet.tsx` and you improve it, all three change. If each episode carries its own copy, old episodes are frozen.

Honest comparison: "generate TSX from data" vs. "render from data with a version-pinned player" are roughly equivalent in reproducibility if you pin the player. Baking's real advantages are **transparency** (you can read the file) and **easy human hand-editing**.

### 12.2 Vendoring is enough **[DECISION]**

The source lists three isolation strategies: vendor components into the episode directory; depend on an immutable pinned npm package (`@studio/viewport@1.4.2`); or lock a submodule commit. **Vendoring is the simplest and probably the only one needed** — boring, obviously correct, no registry, no submodules. Cost: disk duplication and no automatic bugfix propagation, which is arguably a feature (old episodes *shouldn't* change). **Also vendor the font files into each episode** — fonts are the most common source of "the old episode looks slightly different."

### 12.3 What the generator emits

Inputs: `dialogue_ast.json`, `exposure_sheet.json`, character `manifest.json` files, and style rules. Outputs into `goblin-episodes/epNNN/`: baked `Episode_NNN.tsx`, `render_manifest.json`, vendored `components/`, pruned `assets/`.

Baking rules:
- **Unquoted numeric literals** in JSX (`from={0} durationInFrames={75}`), never parsed strings — avoids type-casting errors.
- **Sequence-relative shot components:** calling `useCurrentFrame()` at the composition root evaluates against global scene time and breaks camera curves for later shots. Generate an isolated sub-component per cut so `useCurrentFrame()` evaluates locally from frame 0 inside each `<Sequence>`.
- Ducking cues, audio paths, sprite offsets, camera zooms, and viseme placement burned in as literals.

### 12.4 The sealed-file lifecycle **[DECISION]**

Supports a director's "eject button" — opening `Episode_040.tsx` and hand-tuning easing, filters, or timing — without regeneration clobbering the work:

```tsx
// @lifecycle: generated | patched | locked
// @checksum: <sha256 of normalized body>
// @patch_history: ["QA-EP040-SH01-ZOOM_ALIGN"]
```

- Body checksum computed over normalized content (enforce with `.gitattributes`: `* text=auto eol=lf`).
- On regeneration: if `locked` → abort. If `SHA-256(current_body) ≠ header_checksum` (a human edited it) → write `Episode_040.candidate.tsx` and halt with an error rather than overwrite.
- Merge authority by tier: `generated` may merge automatically when lint/type checks pass; `patched` (agent-authored repairs) only if an AST diff proves the change was confined to targeted props; `locked` requires human review.
- Any manual edit that changes **meaning** emits a `DIRECTOR_OVERRIDE` event.

### 12.5 The human-edit boundary **[CORE]**

The decision rule the source never states plainly:

- **Representation edits** (easing curves, framing, crop, color LUT) may stay local to the TSX.
- **Meaning edits** (dialogue lines, emotional subtext, action beats) **must route back through the scene spec/AST and re-derive downstream**, updating the state log.

Without this rule, a director softening a line in the final TSX silently diverges the video from the ledger.

### 12.6 The generator is a multiplicative point of failure **[CORRECTED / added]**

Old episodes are safe (frozen), but every *new* episode inherits whatever the generator gets wrong. Treat `generate-episode-repo.ts` with more rigor than any episode output:

- **Golden-file snapshot tests:** generate a known canonical scene and diff the emitted TSX against a committed golden file.
- **Review generator changes as diffs of generated output**, not only diffs of generator code — the output diff is what reveals unintended behavior changes.
- Run the generator's output through type-checking and a smoke render in CI.

### 12.7 `render_manifest.json` **[DECISION]**

Records: episode ID, schema version, generation timestamp, source-file hash, upstream commits (Sower, canon, assets tag, viewport template), acoustic asset hashes, sprite hashes, and runtime environment (container digest, Node/Remotion/Chromium/FFmpeg versions, font checksums). It is the root of the episode's provenance graph. Build identity is the tuple: **canon + ledger state + AST + assets + container digest + toolchains**.

---

## 13. Rendering, audio conformance, and finishing

### 13.1 Rendering **[VERIFY]**

Pure CPU/RAM workload: `@remotion/renderer` driving headless Chromium on Rig 1, zero VRAM. Defensive settings from the source:

```bash
npx remotion render src/episodes/Episode_040.tsx outputs/ep040/master.mp4 \
  --gl=swangle --concurrency=1 --image-format=png --pixel-format=yuv420p
```

- `--gl=swangle` (software OpenGL) and `--concurrency=1` are sensible defensive choices to avoid headless-Linux GL memory problems and OOM; **tune concurrency by measuring**, not assuming.
- **`--offthreadvideo` in the source's command is probably not a real CLI flag** — `<OffthreadVideo/>` is a *component* (off-thread FFmpeg decoding instead of Chromium's `<video>`). **[VERIFY]** against current Remotion docs before scripting.
- Composition ID vs. file path arguments differ across Remotion versions — verify the invocation form.

### 13.2 Ducking envelope **[HYPOTHESIS]**

Sidechain-style ducking of ambient beds/music under speech: 6-frame quadratic attack down to −14 dB, 12-frame release. Tune by ear.

### 13.3 Loudness targets — pick one **[DECISION]**

The source mixes web and broadcast targets. Published references: **−23 LUFS** (EBU R128, Europe), **−24 LUFS** (ATSC A/85, US broadcast), and platform-specific web targets (many streaming platforms normalize around **−14 LUFS**; podcasts often use −16). **Pick your actual delivery target** from the platform you'll ship to, and check against that platform's current guidance **[VERIFY]**. True-peak ceiling of −1.0 to −2.0 dBTP is the conventional safeguard against inter-sample clipping.

### 13.4 Offline finishing **[DEFER]**

To avoid heavy 3D-LUT lookups, halation blurs, and procedural grain inside browser CSS (which duplicates DOM trees and risks cross-browser variance), the source moves finishing to an offline FFmpeg filtergraph: highlight bloom, per-frame-seeded uncorrelated film grain, a unified 16-bit `.cube` LUT to harmonize plates. Reasonable, but only relevant after the basic render works.

---

## 14. Quality assurance

### 14.1 The economics **[CORE]**

Cheapest deterministic checks first; expensive/human checks only for verified anomalies. Never spend an LLM call to discover a zero-byte file; never ask a human to find a schema error; never render an episode before discovering a missing asset.

### 14.2 Progressive-confidence ladder **[DECISION]**

| Level | Checks |
|---|---|
| 0 Structural | JSON schema valid; required files exist; zero-byte/empty-hash guard |
| 1 Physical | `ffprobe` frame count equals the exposure-sheet budget; WAVs contain audio; loudness/noise-floor pass |
| 2 Geometric | Viseme anchor drift small; contact anchor on floor plane; alpha-edge spill under threshold; facial centroid inside safe box |
| 3 Semantic | Beat sequence ends in mandated event; enum vs prose reconciled; epistemic leaks absent |
| 4 Editorial | Signed human director review |

Note the source's example thresholds (viseme drift < 4 px, spill < 12, etc.) are **[HYPOTHESIS]** to be calibrated on real assets.

### 14.3 Pre-flight (`!MissingAssets`) **[DECISION]**

Before launching headless Chromium: assert every referenced sprite/viseme/audio path exists on disk; reject empty-hash binaries; enforce the null-variant gate for broadcast builds; abort with exit code 1 on failure.

### 14.4 Diagnostic router **[DEFER]**

If a defect appears, classify **CODE_ERROR** (the JSX prop diverges from the manifest → patch the TSX) vs **ASSET_ERROR** (JSX matches manifest but the manifest is wrong → route to art). An agent-driven patch loop is optional automation; a human doing this triage is fine early.

### 14.5 Test both worlds **[DECISION]**

- **Mechanical tests:** distance symmetry, neighbor counts, movement legality, schema enforcement, frame arithmetic.
- **World-behavior tests:** injured characters recover; characters don't fight endlessly; secrets propagate correctly; grievances eventually resolve; no teleporting; no duplicated objects.

Property-based fuzzing of a reducer is only meaningful after a reducer exists **[DEFER]**.

### 14.6 The evaluation corpus **[DECISION]**

Every reviewed scene stores: simulation state, scene spec, LLM prompt, output, lint results, human acceptance, notes, final audio/video. Over time this becomes a dataset of what *good* looks like for this specific world.

### 14.7 The creative-review feedback loop **[CORE]**

Human review → record the structured reason → change prompts/constraints/validators → regenerate. Together with the simulation tuning loop (6.10), this is where most real time is spent. The highest-value human role is editorial (what should happen; is it funny; does it sound like these characters), not technical.

### 14.8 Failure handling: idempotence and resumability **[DECISION]**

The source describes only the happy path. On real hardware you will hit partial failures constantly (TTS fails on line 7 of 12; the LLM retry budget exhausts). Design stages to be **idempotent** (re-running with the same inputs reproduces or cleanly replaces outputs) and **resumable** (a failed run continues from the last good artifact). This matters more in practice than provenance graphs.

---

## 15. Reproducibility and preservation

### 15.1 The overclaim to retire **[CORRECTED]**

The source repeatedly promises "bit-identical re-render years later" from pinned Git SHAs. That is not safe:

- **Chromium + software GL** varies across versions, fonts, CPU instruction sets (antialiasing).
- **x264/FFmpeg encoding** is deterministic only for a fixed build and settings, *and* only if threading is controlled.
- **MP4 muxing** embeds timestamps and encoder strings unless stripped.
- **Fonts** are a classic silent drift source.
- **Diffusion** can't be regenerated from seeds across GPU/driver/CUDA changes.

### 15.2 The reproducibility ladder **[CORE]**

| Level | Meaning |
|---|---|
| 0 | Same intent |
| 1 | Identical validated machine contracts (AST) |
| 2 | Identical frame budgets and audio alignment |
| 3 | Decoded pixel buffers and PCM audio within tolerance (e.g., SSIM > 0.9999, ΔE < 0.1) |
| 4 | Identical encoded bitstreams |
| 5 | Byte-identical container |

**Aim for Level 3.** Higher levels become increasingly hostage to irrelevant environmental detail.

### 15.3 Preservation first, regeneration second **[CORE]**

- **Preservation:** archive the finished media *and* the inputs. A final MP4 must not depend on future software being perfectly reproducible.
- **Regeneration:** pin the environment and keep the artifacts needed to re-render. Don't make regeneration your only preservation mechanism.
- Archive generated assets as **artifacts, not recipes** — seed + prompt is not sufficient for diffusion or TTS; keep the actual output plus prompt, model/version metadata, and generation parameters.
- **The archive needs its own plan:** buckets get deleted and accounts lapse. Minimum: a **second copy somewhere you control** and **periodic integrity checks** (re-hash a sample of stored objects). Unglamorous, and far more likely to save you than a provenance graph.

### 15.4 Preservation tiers **[DECISION]**

1. **Source & IR archive:** `dialogue_ast.json`, event log, manifests, TSX.
2. **High-fidelity mezzanine:** e.g., ProRes 4444 (with alpha where relevant) and discrete 24-bit/48 kHz stems.
3. **Delivery derivatives:** web H.264/AAC and any broadcast profiles.

### 15.5 The double-render test, done honestly **[CORRECTED]**

The tracer-bullet checklist in the source puts `SHA-256(Render_A) == SHA-256(Render_B)` in the must-pass list. That may fail for reasons unrelated to your code (muxer timestamps, encoder threading) and be misread as an architecture failure. Split it:

- **Pass:** both renders complete and are **visually and audibly equivalent** (compare decoded-frame hashes and PCM samples).
- **Stretch:** container hashes match.

---

## 16. Randomness and seeds

### 16.1 Two kinds **[CORE]**

- **Narrative randomness** (affects reality): grievance activation, pairing, dice, movement, event selection. Must be **seeded, logged, replayable.**
- **Representational randomness** (affects presentation only): diffusion noise, animation micro-variation, voice variation. Logged in provenance, but **never alters world truth.**

The direction must remain `WORLD → SCRIPT → MEDIA`, never `MEDIA → WORLD`.

### 16.2 Namespaced seed derivation **[CORE]**

Don't call one global `rng.next()` everywhere — adding one random call early would change every later result. Derive per-purpose seeds from a single episode seed:

```text
seed(episode_seed, "movement", cycle, character_id)
seed(episode_seed, "combat",   encounter_id)
seed(episode_seed, "visual",   shot_id)
Seed_shot = HMAC-SHA256(Seed_episode, scene_id + ":" + shot_id)
```

Consequence: changing the visual generator can't change who wins the fight.

---

## 17. Continuity, dependencies, and canon errata

### 17.1 Continuity as cache invalidation **[DECISION]**

Model continuity as a dependency DAG: nodes are facts, characters, scenes; edges are declared dependencies (`depends_on: ["fact_bog_arm_amputated"]`). A scene records a hash of every fact it consumed:

```text
SceneHash = H(AST + Σ H(Dependency_i) + Assets + CompilerVersion)
```

When an upstream fact changes, a topological sweep marks downstream scenes dirty (`is_dirty = 1`). Useful — but build it only when you have enough episodes for the problem to exist **[DEFER]** beyond a simple version pin.

### 17.2 Canon errata protocol **[DECISION]**

You *will* discover canon mistakes. What happens to already-rendered episodes?

1. **Append-only errata log** (`canon_errata_v1.2.json`); never edit historical records in place.
2. **Episodes pin a `canon_version`** in `render_manifest.json`.
3. **A director gate** chooses between *freezing history* (old episodes stay as legacy) and *remastering* (re-run downstream, output a new explicitly tagged build, e.g., `EP012_remaster_v2.mp4`).

Two nuances: the **original must remain available and addressable** after a remaster (or you lose the historical record the system exists to protect), and *whether ledger history is retroactively affected* (does the corrected fact change what "actually happened" in episode 5?) is a **creative decision** to make explicitly, not discover in a bug report.

### 17.3 Schema versioning **[CORE]**

Every major artifact carries `schema_version` from day one (canon, ledger exports, simulation result, dialogue AST, timing manifest, visual manifest, render manifest). It costs nothing and answers "what did this file mean?" later. Historical schemas are never modified in place; keep explicit, tested forward-migration functions if schemas evolve.

---

## 18. The control plane, and what to defer

### 18.1 A principle worth keeping from the control-plane material **[CORE]**

Render runtimes execute untrusted arbitrary code and model outputs. They should **not hold deploy credentials or elevated Git tokens.** Whatever coordinates commits/PRs (whether `repo-bot` or something simpler) should be a separate authority boundary from the media execution environment.

### 18.2 What `repo-bot` was described as doing **[DEFER]**

Triggering the generator with pinned refs; opening PRs (e.g., `feat/render-ep040`); auditing PR scope for sealed-file lifecycle (`@generated`/`@patched`/`@locked`); snapshotting exact commit SHAs into `releases/episode-NNN.json` in `goblin-project`. All plausible — none of it answers the current highest-risk questions.

### 18.3 Deliberately deferred list, with revisit triggers

| Item | Why defer | Revisit when |
|---|---|---|
| Distributed orchestration, Cloudflare Durable Objects, multi-pod rendering | You don't yet know one episode's render time | Profiling shows render/queue time is the bottleneck |
| Full event sourcing (pure reducer, replay from genesis) | Doubles implementation surface | You need branching "what-if" timelines |
| Content-addressed scene artifact graph (Bazel/Nix-style) | Zero episodes; unknown re-render frequency | Re-rendering is slow *and* frequent |
| Two-model adversarial semantic verification | Correlated failures; cheap lemma scan gets ~80% | Lemma scan misses real defects you observe |
| Graph-theoretic epistemic reachability | A filtered `knows` table is equivalent at your scale | Knowledge graph grows complex |
| Property-based reducer fuzzing | No reducer yet | A pure reducer exists |
| C2PA signing, MovieLabs MMC, Aspera delivery | Solve distributor problems you don't have | A distributor requires it |
| Agent-driven repo modification, agent QA patching | Human triage is fine early | Volume of defects justifies automation |
| Diffusion plates, neural matting, offline film-look finishing | A second, independent project | The cutout path works end-to-end |
| Separate repo per component | Coordination cost | Per Section 5.8 triggers |
| Static layer pre-compositing / dead-asset elimination beyond pruning | Premature optimization | Profiling says so |

Performance architecture should be **derived from measurements** — if one episode takes 10 seconds, you have no scaling problem.

---

## 19. The gated roadmap

Every phase carries a **concrete, checkable gate**. Without gates, phases blur and the project drifts into the "keep designing" trap. Gates were revised from the source where they were ill-specified.

| Phase | Deliverable | Gate to advance |
|---|---|---|
| **1. World model** | Schemas + ledger | A hand-authored world loads and validates; a deliberate schema violation is rejected (exit 1) |
| **2. Spatial** | Stateless hex library + tests | Invariant tests pass; a debug SVG shows map and positions |
| **3. Simulation** | Headless simulator | 1,000-cycle run completes with zero crashes; **normalized pairing entropy** and outcome distribution reviewed by you and judged non-degenerate (no fixed absolute threshold) |
| **4. Grievances** | ~10 authored grievances | Each has surface, underneath, props, location; at least one produces a good scene when hand-fed to an LLM |
| **5. Scene spec** | `scene.json` / AST generation | Spec contains everything needed to write the scene with no further *decisions* (generation itself needn't require manual editing; human review still occurs in Phase 7) |
| **6. Expression** | LLM generator + validators | A deliberate leak and a deliberate contradiction are both caught; a clean scene passes |
| **7. Human gate** | Review view + workflow | You can accept or reject a scene in ~1 minute and record a structured reason |
| **8. Audio** | TTS + timing | Measured durations produce integer frames; two runs yield the same manifest (from archived audio) |
| **9. Render** | Cutout renderer | One watchable 3–10 s scene with correct sync (verified by eye/ear) |
| **10. Archive/QA** | Validation + archive | Full artifact set stored with a second copy; a fresh checkout can find and replay it; decoded-frame/PCM equivalence between two renders (byte-identity is a stretch) |

**Sequencing notes.** Phases 3 and 4 iterate together. Phase 3's gate deliberately depends on *your judgment* of the statistics, because "non-degenerate" cannot be specified in advance. Keep the world model unencumbered by AI, video, or cloud in Phases 1–3.

---

## 20. The tracer bullet

### 20.1 Purpose

Prove that one minimal narrative event can travel through every boundary on physical hardware and emerge as a watchable MP4. Its purpose is **not artistic quality**; it is to reveal real friction: audio–video sync, asset path normalization, compositor performance, LLM speed. The physical friction in one 3-second clip will invalidate more false assumptions than another hundred pages of design.

### 20.2 Scope

One or two characters, one grievance, one location, one audio line, one simple background, one simple animation, one render — **using the 2D cutout path only** (no GPU dependency, no matting, no chroma key), which exercises the parts specified in the most detail: manifest contracts, visemes, source-baking, audio timing.

```text
[1] Authored grievance + ledger state
      ▼
[2] Dialogue AST line (~3.12 s)
      ▼
[3] Local TTS (.wav) ─► measure ─► 3,120 ms ─► 75 frames @ 24 fps
      ▼
[4] Generator stamps Episode_001.tsx (+ render_manifest.json)
      ▼
[5] Headless Remotion render (Rig 1, CPU)
      ▼
[6] Verification: master MP4 + manifest
```

### 20.3 Pass / should-pass / stretch **[CORRECTED]**

**Must pass**
- The simulation (or a hand-authored ledger state) produces a valid scene.
- Dialogue conforms to the scene spec.
- Audio renders; duration is measured; integer frame budget is computed correctly.
- Timeline is generated; assets load; render completes.
- Audio and video are synchronized; the final video is **watchable**.

**Should pass**
- Schema validation, asset validation, continuity/knowledge/action validation.
- Two renders are **visually and audibly equivalent** (decoded frames + PCM).

**Stretch / nice-to-have**
- Byte-identical second render (container hashes).
- Container-digest verification and richer provenance.

### 20.4 What to do before any LLM is involved (an afternoon of work)

- Enumerate all 1,296 2d6-difference outcomes and print the true margin distribution (Appendix B).
- Compute win probability as a function of net modifier.
- Compute pairing entropy for uniform vs. skewed synthetic distributions to see what values are even reachable for your cast size.
- Simulate 1,000 cycles of movement alone (no dialogue) and check for clustering.

That is Phases 2–3 in miniature and it settles disputes that design prose cannot.

---

## 21. Decisions to write down now

These are cheap to decide and expensive to leave ambiguous:

1. **The cycle / episode / scene / beat / shot / frame hierarchy** and the cycle-to-episode pacing mapping (Section 10.9).
2. **Which is authoritative: state or event log** (Section 4.5).
3. **Map vs graph:** true hex grid or location graph (Section 5.2).
4. **Coordinate convention** for asset manifests (pixels vs normalized) (Section 11.1).
5. **Delivery loudness target** and platform (Section 13.3).
6. **Outcome-taxonomy thresholds**, including margin 3 and "narrow margin" (Section 6.5).
7. **String weight W, cap, and scarcity** (Section 6.7).
8. **Draft vs broadcast policy** for null variants and waiver mechanism (Section 11.2).
9. **How belief forms, updates, decays, and spreads** (Section 7.3).
10. **Retroactivity of canon errata** on ledger history (Section 17.2).
11. **Multi-speaker generation strategy** per secret sensitivity (Section 7.4).
12. **Approved-audio policy:** archive, never regenerate (Section 10.6).

---

## 22. Corrections log: claims in the source material to distrust

| # | Source claim | Problem | Correction |
|---|---|---|---|
| 1 | "Bit-identical re-render years later" from Git SHAs | Chromium, encoder threading, muxing, fonts, and GPU variance all break it | Aim for Level 3 (decoded-media equivalence); archive the finished media (15.1–15.3) |
| 2 | Margins 0–2 ≈ 66.7%; margins ≥ 6 = 0% (and a table summing over 100%) | Wrong arithmetic | Exact: 0–2 = 52.2%; ≥ 6 = 10.8% (6.6). *An earlier estimate in this conversation, "≈15%", was also wrong.* |
| 3 | One String at W=3 swings win probability "30–40 pts" | Roughly right but unverified | Computed: ≈ +32 pts near an even matchup (6.7) |
| 4 | Pairing entropy gate H ≥ 2.2 | Ignores cast size; demands near-uniform pairing for small casts | Normalize by log₂(pairs); guard against collapse (6.8) |
| 5 | Boredom detector uses "Jaccard distance" on single categorical values, threshold 0.65 | Similarity ≠ distance; Jaccard needs sets; threshold ungrounded; re-rolls alter the simulated distribution | Match-fraction for categoricals; tune from data; measure with detector on (6.11) |
| 6 | Leak Sentry "resolves" the multi-speaker dilemma; "attention heads will attend…" | Lexical scan misses paraphrase; mechanism claim overconfident | Default plus isolated calls for high-stakes secrets (7.4) |
| 7 | "Independent, deterministic temperature-0 extractor" | Not a parser; correlated with generator | Rank it third; define disagreement policy (9.3) |
| 8 | `BeliefRecord` has `perceived_truth_value` + `confidence`; single `target_id` | Redundant, invites inconsistency; too narrow | Single `credence`; structured proposition; add `source_agent_id` (7.3) |
| 9 | Mandatory per-line lexical tics; hand-picked stylometric bounds | Caricature; bounds guessed | Tics as frequencies; derive bounds from real exemplars (8.6) |
| 10 | "Event-sourced deterministic media compiler" | Rhetoric contradicts the pragmatic advice (state + log) | Be explicit about which is authoritative (4.5) |
| 11 | Beat and Shot at the same hierarchy level | One beat can span shots and vice versa | Separate: Beat (AST) vs Shot (exposure sheet) (10.9) |
| 12 | Byte-identical double-render in the *must-pass* list | May fail for muxer/threading reasons | Split into pass (equivalence) and stretch (byte hash) (15.5) |
| 13 | Remotion command includes `--offthreadvideo`; Remotion `colorKey` with despill | `<OffthreadVideo/>` is a component, not a flag; no turnkey chroma key that I know of | **[VERIFY]** against current Remotion docs (11.6, 13.1) |
| 14 | Set-intersection complexity claims (O(1), O(min(|A|,|B|))) | Irrelevant at dozen-element scale | Ignore; correctness matters (9.3) |
| 15 | Phase 5 gate "without human intervention" vs Phase 7 human review | Contradictory wording | Clarify meaning of "intervention" (19) |
| 16 | Mixed −16 / −23 / −24 LUFS targets | Different standards for different destinations | Pick one for your platform (13.3) |
| 17 | Designed components described as existing (Jules loop, repo-bot, C2PA, MMC, Aspera) | Unbuilt | Treated as designs; deferred (18) |
| 18 | The meta-pattern: each round added specificity without evidence | Internal consistency ≠ truth; new errors accreted | Treat every numeric threshold as a hypothesis; run code |

---

## Appendix A — Core formulas

```text
# Frames (integer form)
target_frames = floor((duration_ms × fps + 999) / 1000)        # = ceil(duration_ms × fps / 1000)

# Absolute anchoring
fromFrame_k = Σ_{i<k} total_shot_frames_i
total_shot_frames = pre_roll + audio_frames + post_roll

# Audio ↔ video projection (48 kHz, 24 fps)
sample = frame × 2000

# Diffusion lattice (verify for your model)
N = ceil(duration_s × native_fps)
diffusion_frames = 4 × ceil((N − 1)/4) + 1

# Argument score
A = (Base + Roll) + (StringsSpent × W) − (Debuffs × P)

# Grievance eligibility
Eligible = (SceneCast ∩ Primary) \ Excluded, Intensity ∈ [min,max], Cooldown = 0

# Cube-hex distance
distance = max(|Δq|, |Δr|, |Δs|), with q + r + s = 0

# Pairing entropy (normalize by log2(M))
H = −Σ p_i log2(p_i);   H_norm = H / log2(M)

# Scene identity
SceneHash = H(AST + Σ H(Dependency_i) + Assets + CompilerVersion)
```

## Appendix B — Dice distribution and win-probability script

Run this first; trust it over any table in any document (including this one).

```typescript
// margin-distribution.ts  (run with tsx)
const ways = (s: number) => 6 - Math.abs(s - 7);          // s in 2..12
const total = 36 * 36;

const diff = new Map<number, number>();                    // (A_roll − B_roll) → combinations
for (let a = 2; a <= 12; a++)
  for (let b = 2; b <= 12; b++)
    diff.set(a - b, (diff.get(a - b) ?? 0) + ways(a) * ways(b));

console.log("|margin|  combos  probability");
for (let d = 0; d <= 10; d++) {
  const c = d === 0 ? diff.get(0)! : (diff.get(d)! + diff.get(-d)!);
  console.log(String(d).padStart(4), String(c).padStart(8), ((100 * c) / total).toFixed(2) + "%");
}

// P(A wins / ties / loses) given net modifier m applied to A (equal Base)
function outcome(m: number) {
  let win = 0, tie = 0, lose = 0;
  for (const [d, c] of diff) {
    const net = d + m;
    if (net > 0) win += c; else if (net === 0) tie += c; else lose += c;
  }
  return { win: win / total, tie: tie / total, lose: lose / total };
}
for (const m of [0, 1, 2, 3, 4, 6]) console.log("m =", m, outcome(m));
```

To explore the real design space, extend it to unequal Base (1–5), Debuffs (P = 2 each), capped String contributions, and your actual outcome-classification rules.

## Appendix C — Schema and interface sketches

**Spatial library interface (stateless; plain data in/out)**

```typescript
type Hex = { q: number; r: number; s: number };           // q + r + s === 0
distance(a: Hex, b: Hex): number
neighbors(h: Hex): Hex[]
ring(center: Hex, radius: number): Hex[]
range(center: Hex, radius: number): Hex[]
path(from: Hex, to: Hex, costs: (h: Hex) => number): Hex[] | null
visible(from: Hex, to: Hex, blocked: (h: Hex) => boolean): boolean
witnesses(origin: Hex, radius: number, positions: Map<CharId, Hex>): CharId[]
```

**Scene spec (everything already decided)**

```json
{
  "schema_version": "1.0",
  "scene_id": "ep040_sc03",
  "cycle": 14,
  "location_id": "siphon_room",
  "participants": ["bog", "snerk"],
  "witnesses": ["mog"],
  "grievance": "missing_brass_siphon",
  "beliefs": { "bog": ["..."], "snerk": ["..."] },
  "outcome": { "type": "COSTLY_WIN", "winner": "bog", "loser": "snerk" },
  "mandated_state_changes": [ "..." ],
  "required_beats": ["ACCUSATION", "DENIAL", "CONCESSION"],
  "beat_shape": "escalation_reversal_button",
  "seed": { "episode": 481927, "scene": "hmac-derived" },
  "why_selected": "resentment ceiling breach; adjacency; cooldown = 0"
}
```

**Voice fixture (bounds derived from real exemplars)**

```json
{
  "character_id": "bog",
  "exemplar_lines": ["... ~12 hand-written lines ..."],
  "stylometric_bounds": {
    "mean_sentence_length": [6.2, 11.5],
    "max_sentence_length": 18,
    "tic_frequencies": { "aye": [0.03, 0.10], "scraps": [0.01, 0.05] },
    "banned_lemmas": ["testament", "tapestry", "palpable", "furthermore"]
  }
}
```

## Appendix D — Glossary

- **AST (dialogue_ast.json):** canonical machine contract for a scene; beats plus dialogue and action tokens.
- **Ledger:** authoritative store of mutable world state.
- **Canon / lore:** immutable, versioned world definitions.
- **Sower:** the narrative simulation engine (`worker-sower-engine`).
- **Conductor:** the orchestration harness (`produceEpisode.ts`) bridging simulation and media.
- **Exposure sheet:** timing manifest of shots, frames, audio paths, and cues.
- **Source-baking:** generating per-episode literal TSX rather than interpreting JSON at render time.
- **Vendoring:** copying shared components into each episode so old episodes cannot drift.
- **Historical corruption trap:** old episodes silently changing because a shared component was updated.
- **String:** a directional leverage token one character holds over another.
- **Boil Over:** forced confrontation when a resentment accumulator crosses its ceiling.
- **Attractor:** a degenerate stable pattern in a long-running simulation.
- **MRU (Swain):** Motivation-Reaction Unit; stimulus → reflex → reasoning → speech.
- **Visemes:** mouth shapes synchronized to speech (`closed`, `small`, `medium`, `wide`).
- **Tracer bullet:** the smallest complete end-to-end run that exercises every boundary.

---

## Closing statement

The parts of this design worth protecting at all costs are few and stable:

1. **Reality belongs to the deterministic world model; the ledger is the authority.**
2. **Space creates causality.**
3. **Simulation happens before language; LLMs express predetermined situations and never secretly decide facts.**
4. **Knowledge and belief belong to individual characters and carry provenance.**
5. **Audio establishes timing; visuals follow it.**
6. **Meaning and representation stay separate; media describes state and never creates it.**
7. **Old episodes are immutable; finished media is archived rather than trusted to be perfectly regenerable.**
8. **Cheap deterministic validation precedes expensive processing, and human editorial judgment precedes expensive production.**
9. **The simulator runs without media, and it is tuned by measurement.**

And the caution that outlives every other:

> **Do not let the sophistication of the production machinery become a substitute for discovering whether the fictional world itself is interesting.**

The hex map, ledger, grievances, knowledge model, and state transitions are not valuable because they make the architecture impressive. They are valuable because they give the fictional universe **memory, causality, constraints, and consequences** — and let the LLM do the one thing it is genuinely good at: turning those consequences into language with personality.
