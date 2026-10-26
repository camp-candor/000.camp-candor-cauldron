The term **goblin lore** operates on two interconnected levels within the pipeline: the **diegetic worldbuilding** (the narrative universe itself) and the **mechanical/architectural "lore" engine** (`goblin-lore` / `goblin-bible`, which enforces narrative consistency as compiled law).

---

### 1. The Diegetic Universe & World Lore

* **The Core Thesis:** A family so terrified of being seen by the outside world that they have become experts at never truly seeing each other. Every domestic interaction, mechanical duel, leverage exchange, and silence is an inward reflection of hiding from danger.


* **Setting & Micro-Geography:** The family resides exclusively in the crawlspaces beneath the floorboards of a human house. Key topological locations include:


* **The Warm Pipe:** The central, shared hub that audibly ticks as it cools at night (a sound the family has collectively agreed not to fear).


* **The Pantry Wall:** Bog’s contested territory; smells perpetually of coveted and resented human food.


* **The Attic Stair:** The most exposed and coldest threshold, carrying human acoustics with extreme clarity.


* **The Splinter Gap:** A transitional crawlway linking territories.




* **The Hierarchy of Fear:**
1. *The Upstairs:* The humans, viewed not as distinct individuals, but as an ambient, terrifying environmental pressure.


2. *Discovery Mid-Act:* Being witnessed not just existing, but being caught actively revealing vulnerability.


3. *The Thing Nobody Names:* The historical trauma referenced only as `the_famine`.




* **The Cast of Characters:**
* **Bog:** The older, controlling figure who remembers `the_famine`. Obsessed with status, bean-stack tallies, and maintaining an unspoken master-servant dynamic over petty household tasks (e.g., scouring the good silver spoon).


* **Spleen:** Independent, guarded, and non-aligned. Clutches unfinished wooden carvings, pins his ears back, and refuses to let Bog intimidate him.


* **Wart:** The youngest member of the litter, possessing zero memory of `the_famine`. Guilt-driven, soft, and overly apologetic, he reflexively over-explains simple actions to defend himself before being accused. Mechanically classed as a *Guardian* with a low *Spite* score (1) and high *Warmth* (3), he has the ability *Shield Ally* (redirecting conditions away from Mum Grissel onto himself).


* **Mum Grissel:** An elder presence who commands passive authority; arguments halt mid-sentence if she enters the pantry.




* **Economy of Scraps:** Currency is tied directly to physical possession weight classes:


* *Scrap (Common):* Human debris (bent nails, thread, cloth scraps) used for casual trade.


* *Shine (Uncommon):* Reflective buttons, beads, and foil used as social currency for debts.


* *Weight (Rare):* Functional tools, load-bearing items, and preserved rations.




* **Deliberately Unresolved Canon (Non-Canon Principle):** The universe mandates explicit open questions that engines are barred from closing via unvetted generated dialogue—namely: the true historical nature of `the_famine`, the fate of the family member who vanished before the show's timeline, the ambiguous nature of `the_pantry_watcher`, and whether other goblin societies exist beyond the house.



---

### 2. Architecture: `goblin-lore` / `goblin-bible`

`goblin-lore` (also named `goblin-bible` or mapped to `@snailicid3/consumer-npm`) is an offline, compile-time legislative authority. It rejects being a casual wiki or unstructured worldbook, operating as a strictly typed relational database authorable in Markdown.

```text
goblin-lore/
├── characters/             # Character dossiers (Bog, Spleen, Wart, Mum Grissel)
├── grievances/             # Structured social debts, escalation ceilings, outcome branches
├── locations/              # Geography, sensory anchors, adjacency maps
├── possessions/            # Tracked items, equipment slots, weight classes
├── world/                  # Mythology, economy, classes, magic, event registry
├── schemas/                # Zod contracts (somatic bounds, equipment limits, enums)
├── scripts/compile.ts      # Two-pass compiler, cycle detector, deterministic hasher
└── compiled/               # Committed JSON outputs (bible-state.json, characters.json)

```

* **Corpus-First Philosophy:** Static canon and runtime state are completely segregated. `goblin-lore` defines "What is true about the world," while runtime engines (like `worker-sower-engine`) track dynamic variables in a separate relational ledger (hex positions, paranoia clocks, somatic injuries).


* **The Two-Pass Compiler (`compile.ts`):**
* *Pass 1 (Shape & Bounds):* Employs `gray-matter` and `zod` to isolate YAML frontmatter, validating strict scalar ranges (e.g., condition severities strictly bounded $0.0 \le x \le 1.0$), slot counts, and enum memberships.


* *Pass 2 (Relational Integrity):* Sweeps the entire entity graph to ensure every equipped possession, grievance character target, secret ID, or spatial link resolves to a valid file. Any dangling pointer causes a **Hard Fail**.


* *Deterministic Seal:* Keys are recursively sorted alphabetically and written to `compiled/bible-state.json` stamped with a cryptographic SHA-256 hash.




* **The Zero-Drift Tripwire:** In CI/CD pipelines, automated gates run `scripts/compile.ts` followed by `git diff --exit-code compiled/`. If a human edits markdown files in `/characters` or `/grievances` without committing updated compiled JSON, the build fails immediately, preventing downstream engines from executing on stale data.



---

### 3. Downstream Execution

Once compiled, downstream systems consume the locked JSON off local disk:

1. **The Sower (`worker-sower-engine`):** Reads the compiled canon in a read-only manner. It runs PRNG-weighted lotteries (Stage 3) based on proximity and relational tension to pair characters, then uses 2d6 outcome math against stats like Spite and Cunning (Stage 4) to mathematically resolve arguments before compiling a screenplay AST.


2. **Audio & Assets:** Local TTS microservices synthesize dialogue lines into integer frame counts, and asset manifests bind character emotions to pre-illustrated sprite sheets.


3. **The Viewport (`goblin-viewport-template`):** Metaprogram generators stamp out isolated episode folders inside `goblin-episodes/`. They bake start frames, camera interpolation, and mouth viseme animations directly into static TypeScript compositions (`Episode_XXX.tsx`) alongside an immutable `render_manifest.json`.To transform `goblin-lore` from a hardcoded single-series repo into an abstract, multi-series narrative engine, the architecture must decouple **structural schemas** (the meta-ontology) from **instance data** (the specific storyworld).

Currently, `goblin-lore` conflates the schema (Zod validators, two-pass compile scripts) with the diegetic content of one family under the floorboards (Bog, Spleen, floorboard crawlspaces, bean tallies). Moving to a multi-series reality requires four architectural updates.

---

### 1. Separate the Meta-Ontology from Story Instances

Extract the pipeline's ontological primitives into a universal schema layer, refactoring domain terms into abstract categories:

* **Grievances $\rightarrow$ Dramatic Debt / Tension Nodes:** Generalize grievances into structured interpersonal debts characterized by a `surface_complaint`, an unadmitted `underneath`, an associated `physical_anchor_prop`, and explicit `outcome_branches`.


* **Characters $\rightarrow$ Agents / Personas:** Universalize character dossiers to hold typed **Somatic** vectors (motor limits, anatomy constraints), **Logistical** inventories (equip slots, weight classes), and **Epistemic** states (known secrets, leverage strings).


* **Locations $\rightarrow$ Spatial Nodes / Adjacency Topologies:** Abstract floorboard crawlspaces into generic spatial vectors with adjacency graphs, sensory anchors, and traversal bounds.


* **World Axioms $\rightarrow$ Macro-Modality Presets:** Reframe series-specific lore into Lubomír Doležel’s four modal chambers (Alethic, Deontic, Axiological, Epistemic) and the Tri-Axial Coordinate Matrix (Tone, Physics, Pacing).



---

### 2. Transition from a Monolith to Typed Sharding

Adopt the **Library of Genesis** pattern. Instead of hardcoding `/characters` and `/grievances` at the repository root, shard series data into distinct storyworld namespaces beneath a shared compiler harness:

```text
lore-engine/                         # Renamed from goblin-lore (generic legislative hub)
├── schemas/                         # The Universal Meta-Ontology (Pure Zod)
│   ├── agent.schema.ts              # Abstract somatic, logistical, epistemic vectors
│   ├── debt.schema.ts               # Abstract tension/grievance nodes
│   ├── spatial.schema.ts            # Topological adjacency & sensory anchors
│   └── modality.schema.ts           # Doležel modal bounds (alethic, deontic, etc.)
├── scripts/
│   ├── compile.ts                   # Abstract two-pass validator (takes --series flag)
│   └── hash.ts                      # Deterministic alphabetical serializer & SHA-256 seal
└── series/                          # Concrete Story Instances
    ├── under-the-floorboards/       # The original Goblin series
    │   ├── series.config.json       # Tri-axial style preset & modal axioms
    │   ├── agents/                  # Bog, Spleen, Wart, Mum Grissel
    │   ├── debts/                   # The good silver spoon, bean counts
    │   └── spatial/                 # Warm pipe, pantry wall, attic stair
    ├── deep-space-salvage/          # Series B
    │   ├── series.config.json       # Hard sci-fi, high-friction physics
    │   ├── agents/
    │   └── debts/
    └── wiregrass-basin/             # Series C (Southern Gothic)

```

---

### 3. Formalize the Universal Tuple $\langle \mathcal{S}, \mathcal{A}, \mathcal{I}, \mathcal{R}_m \rangle$

A narrative world is fundamentally a mathematical tuple independent of genre or medium:


$$\langle \mathcal{S}, \mathcal{A}, \mathcal{I}, \mathcal{R}_m \rangle$$

1. **State Space ($\mathcal{S}$):** Universalize the entity model. Characters, props, and locations are stored purely as typed state records in the local ledger without assumptions about species or setting.


2. **Action Vocabulary ($\mathcal{A}$):** Let each series declare an active action enum in `series.config.json`. An animated slapstick comedy might allow actions like `["SQUASH", "STRETCH", "RECONSTITUTE"]`, while a gritty thriller restricts actions to `["LIMP", "CONCEAL", "EXPEND_LEVERAGE"]`.


3. **Invariant Engine ($\mathcal{I}$):** The two-pass compiler (`compile.ts`) enforces the series-specific laws. Pass 1 validates internal scalar ranges and anatomy slots; Pass 2 sweeps the instance's foreign-key graph to ensure zero orphaned prop or debt references exist within that specific series namespace.


4. **Medium Projections ($\mathcal{R}_m$):** The output of the compiler remains clean, format-agnostic JSON (`compiled/<series>-bible-state.json`). Downstream engines (`worker-sower-engine`, `goblin-viewport-template`) project that state transition $\Delta$ into video frames, comic gutters, or prose beats without altering upstream truth.



---

### 4. Dynamic Downstream Decoupling

Update downstream dependencies so they are no longer hardcoded to one series:

* **Engine Agnosticism (`worker-sower-engine`):** Parametrize the runtime engine so it ingests the target series at boot time (e.g., `sower --series=under-the-floorboards` pointing to `../lore-engine/compiled/under-the-floorboards.json`).


* **Scaffolding over Shared Viewports:** Ensure rendering codebases follow the `goblin-viewport-template` metaprogramming pattern. The generator script must consume the series-specific AST and bake the respective puppet rigs, camera curves, and audio durations into isolated episode directories (e.g., `episodes/deep-space-salvage/ep001/`) rather than running inside a shared, fragile runtime app.


* **Meta-Repo Manifest Pinning:** In `goblin-project/versions.json`, record version locks per series target, ensuring a schema expansion or asset upgrade in one series does not trigger broken dependency references or build failures in another.**No, dynamic runtime variables never mutate or write back to `goblin-lore` directly**; they flow in a strictly governed, unidirectional feedback loop through separate execution and ledger layers.

The architecture maintains an absolute boundary between compile-time canon and transactional runtime variables to protect data integrity.

---

### 1. The Core Architectural Law: Read-Only Law vs. Mutable State

* **`goblin-lore` is Immutable Law:** It defines what is physically, anatomically, and logistically *possible* in the universe (base schemas, anatomical slot capacities, scalar condition bounds, geographic topologies). Section 1.1 and Section 17, Rule 13 dictate that `goblin-lore` has zero awareness of scenes, episodes, screenplays, or real-time simulation variables. Downstream simulation daemons consume its compiled artifact (`bible-state.json`) via a **read-only** filesystem import.


* **The Sower Never Writes Upstream:** Runtime simulation engines like `worker-sower-engine` never push updates into `goblin-lore`. If runtime simulations wrote back to `goblin-lore`, every tick of an engine or scene duel would trigger continuous compilation rebuilds, commit thrashing, and merge conflicts.



---

### 2. Where Dynamic Variables Actually Live

Dynamic, mutable parameters live in a separate **Runtime Relational Ledger** (instantiated in SQLite, PostgreSQL, or Cloudflare D1):

* **Spatial Hex Coordinates:** Current physical positioning and proximity clusters across topological grids.


* **Somatic Injuries & Trauma:** Real-time physical status (e.g., `brachial_plexus_severed`, `humiliated`), condition decay, and temporary debuffs.


* **Pressure & Paranoia Clocks:** Active segment counts, tick accumulations, and systemic panic levels.


* **Epistemic States & Debts:** Leverage tokens (Strings) spent/held and subjective beliefs.



This state is transformed through an append-only event-sourcing log ($S_{n+1} = \mathcal{R}(S_n, E_n, \sigma_n)$). The relational ledger acts merely as a fast, materialized view of historical events.

---

### 3. How Dynamic Outcomes Close the Loop (The Git-for-Canon Assembly Line)

Dynamic variables do not automatically seep into the lore repository, but permanent, load-bearing consequences eventually get recorded through a formalized review gate:

```text
[ Dynamic Simulation Ledger ] 
  (Hex position, Paranoia Clocks, Somatic Trauma: Sn -> Sn+1)
                 │
                 ▼
[ Episode Locked & Rendered ] 
  (Emits conformed screenplay + state_delta.json)
                 │
                 ▼
[ Continuous Archival / Git Clerk ] 
  (repo-bot / Jules captures permanent changes: amputations, dead characters, burned assets)
                 │
                 ▼
[ Formal PR to /codex or goblin-lore ] 
  (Human Canon Editor Review / "Still Good" Ablation Gate)
                 │
                 ▼
[ Two-Pass Compiler Seals bible-state.json ] 
  (New baseline law for subsequent seasons)

```

1. **State Delta Emission:** When an episode is finalized, the pipeline emits a machine-readable `state_delta.json` recording what was consumed, destroyed, or permanently altered.


2. **Codex/Ledger Commits:** Automated tooling (`repo-bot` / Jules) captures the delta and commits the updated state back to the production codex or ledger history.


3. **Upstream Promotion:** If an injury is permanent (e.g., Bog permanently loses an arm), that fact transitions from a temporary runtime state into a proposed canon modification.


4. **The Gatekeeper:** A human Canon Editor or Showrunner approves the change via a Pull Request or the "Still Good" review gate. Only then does a human (or an authorized agent) edit the Markdown profile in `goblin-lore/characters/` to add permanent motor limits (e.g., updating `locomotion_baseline` or adding `banned_kinetic_verbs`).


5. **Re-sealing:** The two-pass compiler (`compile.ts`) is executed, validating graph integrity and stamping a new cryptographic hash on `bible-state.json`.



Temporary dynamic state (such as where a character is standing on a hex grid or a 3-segment paranoia tick) stays confined to the transactional ledger, while **permanent ontological shifts** are explicitly ratified back into `goblin-lore` through version-controlled pull requests.

In the context of the `goblin-lore` / `goblin-bible` architecture, **"Any dangling pointer causes a Hard Fail"** describes a strict compile-time referential integrity rule enforced by the compiler (`scripts/compile.ts`).

---

### 1. What is a "Dangling Pointer"?

A dangling pointer (or orphaned foreign key) occurs when an entity’s frontmatter references an identifier (`id`) of another entity that does not actually exist or cannot be resolved in the static corpus:

* **Logistical Pointers:** A character file (`characters/bog.md`) declares an equipped item (`logistical.held: ["tin_spoon"]`), but no file exists with `id: tin_spoon` in `possessions/`.


* **Epistemic & Social Pointers:** A character lists leverage or relationship defaults (`epistemic.strings_held_over: ["char_wart"]`), or a grievance lists participants (`participants: ["char_bog", "char_spleen"]`), but the referenced character ID is missing, misspelled, or points to a non-existent file.


* **Spatial Pointers:** A character, grievance, or possession points to a location slug (`location: loc_pantry`), but no matching file exists in `locations/`.


* **Causal/Grievance Chains:** A grievance declares `spawns_grievances: ["griev_spoon_theft"]`, but that grievance slug is not registered in the index.



---

### 2. What is a "Hard Fail"?

A **Hard Fail** means the compiler halts execution immediately and refuses to output or update the canonical state artifact (`compiled/bible-state.json`):

* **Non-Zero Exit Code:** The compiler terminates with a fatal exit code (e.g., `process.exit(1)`), causing automated pre-commit hooks, Vitest test suites, and CI/CD pipelines to fail.


* **No Advisory Warnings:** Unlike a conventional linter that might issue a non-blocking warning, the pipeline treats broken narrative references with the same severity as syntax errors or missing types in C++ or TypeScript.


* **Blocking the Build Pipeline:** Because downstream runtimes (`worker-sower-engine`, headless render daemons) are strictly prohibited from parsing raw Markdown and are required to consume only verified compiled JSON:


* The invalid state cannot be serialized or sealed with a SHA-256 state hash.


* Downstream rendering, audio synthesis, and scene simulation are completely blocked at $T_0$ before any GPU compute or API credits can be spent on broken story state.### Yes, that knowledge must flow back—but *as an auditable transaction*, not an unconstrained runtime write.

Your instinct is spot-on: a world where characters can permanently die or depart cannot treat its canon as a static, timeless museum. If a simulation or narrative arc results in a character expiring at a specific future cycle, that fact **must** become part of canonical reality.

The tension is about **timing and authority**. If running a simulation could directly write back to `goblin-lore` in real time, the entire build system would collapse into commit thrashing, circular invalidation loops, and accidental non-deterministic retcons.

---

### 1. The Two Clocks: Simulation Time vs. Historical Ratification

The pipeline explicitly separates **Narrative Simulation Time** from **Compile-Time Canon Law**:

```text
[ worker-sower-engine / Simulation ]
  • Evaluates mechanical duels & high-friction states (Sn -> Sn+1)[cite: 1, 2]
  • Character reaches 0 HP / undergoes permanent Departure Event[cite: 13]
                       │
                       ▼
[ Locked Episode Output: Hour 22–66 ]
  • Emits conformed screenplay (.fountain / dialogue_ast.json)[cite: 1, 2]
  • Emits atomic state_delta.json ("Wart expired at Cycle 47")[cite: 1, 13]
                       │
                       ▼
[ The Archival Gate / Continuity POD-11 ]
  • Automated check: Does this contradict past canon?[cite: 1, 10]
  • Human Gate: Showrunner confirms "Yes, this death is permanent canon"[cite: 1, 10, 13]
                       │
                       ▼
[ Upstream Promotion to goblin-lore ]
  • Updates character frontmatter: status: departed[cite: 13]
  • Retires or mutates dependent grievances (_retired/)[cite: 13, 16]
  • scripts/compile.ts runs -> seals new bible-state.json (v2.0)[cite: 1, 9]

```

* **During the Run:** The simulation engine (`worker-sower-engine`) records the death in its mutable runtime relational ledger (SQLite/Cloudflare D1). Downstream scenes within that run know the character is gone because the state vector marks them deceased.


* **After the Lock:** Once that episode is officially approved and locked by the Showrunner, the outcome transitions from a "simulation branch" to **historical reality**.



---

### 2. How `goblin-lore` Models Time: Progression & Departure Schemas

`goblin-lore` is not purely atemporal; it models time through **lifecycle statuses, epoch baselines, and milestone gates**:

#### Character Lifecycle Frontmatter

When a character expires or departs, their YAML dossier in `characters/` receives an explicit temporal and existential record:

```yaml
# goblin-lore/characters/wart.md
id: char_wart
name: Wart
status: departed                     # active | departed | missing[cite: 13]
departed_at_cycle: 47                # The exact simulation/episode boundary[cite: 13]
departure_type: death                # estrangement | death | unresolved_absence[cite: 13]
departure_grievance_id: famine_toll  # The causal thread that triggered the event[cite: 13]
locomotion_baseline: null
banned_kinetic_verbs: ["*"]          # Blocks all future physical motor actions at compile time[cite: 1, 8]

```

#### The Narrative Events Registry (`world/narrative-events.md`)

The system mandates that macro-temporal shifts cannot occur silently:

* Permanent departures, class progressions, or epoch shifts are formally registered as **Showrunner Event Hooks**.


* The moment a character’s status flips to `departed`, the compiler requires an explicit narrative cause on screen before downstream engines are permitted to simulate subsequent cycles.



---

### 3. The Compiler’s Reaction: The Invalidation & Resolution Sweep

The moment this knowledge flows back into `goblin-lore` and `scripts/compile.ts` is re-run, the two-pass compiler forces temporal consistency across the whole corpus:

1. **Grievance Resolution Sweeps:** Any grievance where the deceased character was a primary participant cannot remain as a standard active conflict. The compiler forces them to either:


* Move to `grievances/_retired/` (preserving historical auditability without cluttering active lottery pools).


* Mutate to reference their absence (e.g., a grievance over a stolen tool transforms into an unresolved grievance about the dead character's lingering guilt).




2. **Possession Inheritance:** Tracked items held by that character (`possessions/`) become orphaned unless re-assigned to a location or another character’s inventory, enforcing conservation of physical matter.


3. **Downward Dirty-Flag Propagation:** If any future, pre-drafted scenes relied on that character being alive, the dependency graph immediately flags them as `is_dirty = 1`. The production UI displays an amber lockdown banner, preventing those scenes from rendering until rewritten.



---

### In Short

Simulation outcomes **do** flow back into `goblin-lore`, but they do so as **promoted, ratified canon updates** (`state_delta.json` $\rightarrow$ Git commit $\rightarrow$ compiler run) rather than unmonitored live writes. This preserves the system's foundational law: *the simulator tests reality, but `goblin-lore` ratifies it as permanent truth*.Preventing dangling pointers is a critical requirement in Pass 2 of the compiler, but it is **not the primary purpose** of `goblin-lore`—it is merely the referential integrity check of a much larger engine.

Calling dangling-pointer prevention the "best use case" reduces a complete narrative compiler to a foreign-key validator. Its true core mandate is serving as **The Law (Compile-Time Truth)**: establishing the mathematical and physical bounds of the universe before runtime simulation begins.

---

### The Four Pillars of `goblin-lore`

Preventing dangling pointers sits alongside three equally critical responsibilities:

```
                      ┌─────────────────────────────────────────┐
                      │  THE MANDATE OF GOBLIN-LORE ("THE LAW") │
                      └────────────────────┬────────────────────┘
                                           │
         ┌──────────────────┬──────────────┴───────┬──────────────────┐
         ▼                  ▼                      ▼                  ▼
┌─────────────────┐ ┌────────────────┐ ┌──────────────────────┐ ┌──────────────────┐
│  PASS 1: BOUNDS │ │ PASS 2: GRAPH  │ │  PASS 2: CYCLE       │ │ PASS 3: CANON    │
│  & SOMATICS     │ │ INTEGRITY      │ │  DETECTION (DAG)     │ │ COMPILATION      │
├─────────────────┤ ├────────────────┤ ├──────────────────────┤ ├──────────────────┤
│ Bounded scalars │ │ Prevents       │ │ DFS on grievance     │ │ Deterministic    │
│ Kinetic verb    │ │ dangling       │ │ chains; halts on     │ │ SHA-256 state    │
│ blacklists      │ │ pointers       │ │ circular loops       │ │ hash for engine  │
│ Equip slots     │ │ across corpus  │ │ (A -> B -> A)        │ │ isolation        │
└─────────────────┘ └────────────────┘ └──────────────────────┘ └──────────────────┘

```

#### 1. Invariant Enforcement & Physical Constraints (Pass 1)

Before checking pointers, the system enforces what is physically and anatomically possible:

* **Somatic Vectors:** Declares motor baselines (e.g., `locomotion_baseline: limping`) and compiles `banned_kinetic_verbs`. If a character has a severed brachial plexus, `goblin-lore` provides the strict negative mask that halts any runtime script where they attempt bimanual tasks.


* **Scalar Bounds:** Enforces strict ranges via Zod (e.g., condition severities bounded strictly to $0.0 \le s \le 1.0$, escalation ceilings pinned between $1$ and $5$).


* **Logistical Capacities:** Validates anatomical limits (e.g., maximum equip slots for `worn`, `held`, and `carried`) so an agent cannot carry more than physical reality permits.



#### 2. Referential Integrity (Pass 2 — Dangling Pointers)

This is where dangling pointers are caught:

* Every equipped item in `logistical.worn/held/carried` must resolve to a valid file in `possessions/`.


* Every social debt target in `epistemic.strings_held_over` must resolve to an active character in `characters/`.


* Every spatial coordinate must resolve to an indexed node in `locations/`.


* If any pointer is orphaned, the compiler halts with a fatal exit (`process.exit(1)`), blocking dirty data from advancing to simulation.



#### 3. Causal DAG & Cycle Detection (Pass 2)

Beyond checking if a pointer exists, the compiler verifies that narrative causality is acyclic:

* When grievances spawn child grievances upon reaching max escalation (`spawns_grievances`), the compiler runs a **Depth-First Search (DFS) with recursion stack tracking**.


* If Grievance A spawns B, B spawns C, and C spawns A, it triggers a `CYCLE_DETECTED` Hard Fail. Without this, runtime engines (`worker-sower-engine`) would enter infinite escalation loops.



#### 4. The Deterministic State Seal (Pass 3)

The end product of `goblin-lore` is not a report, but an immutable machine contract:

* All keys are sorted recursively in alphabetical order and stripped of non-deterministic runtime timestamps (`new Date().toISOString()` is forbidden).


* The canonical state is hashed using SHA-256 and atomically written to `compiled/bible-state.json`.


* Downstream engines (`worker-sower-engine`, ComfyUI, Remotion) ingest this locked JSON artifact directly off disk via read-only imports, guaranteeing zero runtime Markdown parsing and absolute reproducibility.



---

### The Big Picture

Dangling-pointer prevention is the **structural glue**, but the actual purpose of `goblin-lore` is **preventive compilation**:

> It makes impossible, contradictory, or ungrounded fictional states unrepresentable to the runtime simulation before a single token of dialogue is generated or a single frame of video is rendered.
> 
>**Pass 1 (Invariant Enforcement & Physical Constraints)** represents the legislative foundation of the narrative compiler. Operating inside `goblin-lore` (packaged as `@snailicid3/consumer-npm`), Pass 1 strips away the need to "trust" generative language models to remember injuries, track inventories, or adhere to physical limits. Instead, it establishes an absolute mathematical and anatomical boundary for the universe.

Before any downstream runtime engine simulates a confrontation, generates dialogue, synthesizes speech, or diffuses video frames, Pass 1 processes all static entity dossiers—parsing YAML frontmatter via `gray-matter` and running it against strict Zod contracts. Any entity attempting to breach physical law, overload equipment capacity, or violate bounded scalars is terminated at compile time with a fatal error.

```
                     PASS 1 COMPILATION & INVARIANT AUDIT
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────┐                             ┌───────────────────────┐
│ ENTITY FRONTMATTER    │                             │ SCHEMAS & CONTRACTS   │
│ Markdown + YAML State │                             │ Zod Invariant Engines │
└───────────┬───────────┘                             └───────────┬───────────┘
            │                                                     │
            └──────────────────────────┬──────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. BOUNDS & ENUM AUDIT: Scalar clamps [0.0, 1.0], Locomotion membership     │
│ 2. LOGISTICAL MASS SOLVER: Hand capacity arithmetic (∑ h ≤ 2.0 - penalty)   │
│ 3. PRE-FLIGHT SAT CHECK: Proves physical feasibility at T_0 ($0.00 cost)    │
│ 4. NEGATIVE CONSTRAINT COMPILER: Banned kinetic verbs & acoustic DSP tags   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         ▼ PASSED                    ▼ FAILED
               [ Advance to Pass 2 ]        [ FATAL BUILD HALT ]
               (Graph Verification)         • Non-zero exit code
                                            • Diagnostic error coordinate

```

---

### 1. The Tri-Partite State Vector Ontology

Pass 1 formalizes fictional reality by categorizing all entity properties into three isolated, strongly typed state vectors: **Somatic**, **Logistical**, and **Epistemic**. This structural partition ensures that biological constraints, physical assets, and mental horizons do not contaminate one another.

#### A. The Somatic Vector (Biological & Biomechanical Mechanics)

The Somatic Vector models the physical body as a constrained kinetic machine. It maps biological trauma, motor boundaries, vocal acoustic parameters, and kinetic restrictions into typed schemas:

```typescript
// src/schemas/somaticVector.ts
import { z } from 'zod';

export const LocomotionBaselineSchema = z.enum([
  'HEAVY_GROUNDED_SLOG',       // Low-velocity, high-inertia dragging gait
  'NEUROPATHY_SHUFFLE',        // Unsteady footing, zero toe-lift, wide stance
  'RIGID_CARAPACE_STRIDE',     // Upright, mechanical, zero spinal rotation
  'FLUID_ASYMMETRIC_LIMP',     // Favors one side, reduced single-leg load
  'STANDARD_UNRESTRICTED'      // Peak athletic mobility
]);

export const ActiveConditionSchema = z.object({
  condition_id: z.string(),
  name: z.string(),
  // Scalar bounds strictly enforced: 0.0 is trace, 1.0 is total functional loss
  severity: z.number().min(0.0).max(1.0),
  anatomical_locus: z.enum([
    'CRANIAL', 'CERVICAL_SPINE', 'LUMBAR_L4_L5', 'BRACHIAL_PLEXUS_RIGHT',
    'RADIAL_NERVE_LEFT', 'FEMORAL_RIGHT', 'PULMONARY_SYSTEM'
  ]),
  mechanical_consequence: z.string(),
  is_permanent: z.boolean(),
  acquired_at_scene_id: z.string()
});

export const AcousticDSPProfileSchema = z.object({
  base_pitch_shift_semitones: z.number().min(-12.0).max(12.0),
  formant_warping_factor: z.number().min(0.5).max(2.0),
  breathiness_pause_multiplier: z.number().min(1.0).max(3.5),
  vocal_fry_density: z.number().min(0.0).max(1.0),
  banned_cadences: z.array(z.string()) // e.g., ["RAPID_STACCATO", "RISING_INFLECTION"]
});

export const SomaticVectorSchema = z.object({
  entity_id: z.string(),
  locomotion_baseline: LocomotionBaselineSchema,
  banned_kinetic_verbs: z.array(z.string()), // e.g., ['sprint', 'vault', 'leap', 'lunge']
  active_conditions: z.array(ActiveConditionSchema),
  acoustic_dsp: AcousticDSPProfileSchema,
  last_mutated_at_hash: z.string()
});

export type SomaticVector = z.infer<typeof SomaticVectorSchema>;

```

When Pass 1 audits an entity like **Octavius Oddwadd (008)**, who suffers from severe neuropathy and lumbar compression, the compiler asserts that `neuropathy_shuffle` is an authorized enum value and validates that condition severities do not drift outside $[0.0, 1.0]$. Concurrently, the compiler extracts the character's `banned_kinetic_verbs` array (`["sprint", "vault", "rapid_stairs", "dive", "carry_heavy"]`). These tokens form a compiled negative mask that downstream runtime engines use to intercept invalid actions.

#### B. The Logistical Vector (Mass Conservation & Spatial Accounting)

The Logistical Vector governs material object permanence and anatomical carrying limits. It prevents standard generative continuity bugs, such as characters drawing weapons when their hands are full or carrying excessive weight:

```typescript
// src/schemas/logisticalVector.ts
import { z } from 'zod';

export const EquipSlotSchema = z.object({
  slot_type: z.enum([
    'WORN_INNER',        // Undergarments, medical braces
    'WORN_OUTER',        // Heavy coats, blast aprons, oilskins
    'HELD_PRIMARY',      // Dominant hand
    'HELD_OFFHAND',      // Non-dominant hand
    'SLUNG_SHOULDER',    // Long guns, tool packs
    'POCKET_STORAGE',    // Small items (keys, vials, tokens)
    'VEHICLE_BED'        // Cargo sleds, skiff lockers
  ]),
  item_id: z.string().nullable(),
  occupies_hands: z.number().int().min(0).max(2)
});

export const ConsumableResourceSchema = z.object({
  resource_type: z.enum(['FUEL_SOLVENT_LITERS', 'AMMUNITION_9MM', 'AMPOULES_MORPHINE', 'CLEAN_WATER_PINTS']),
  current_quantity: z.number().min(0),
  burn_rate_per_mile: z.number().optional(),
  burn_rate_per_minute: z.number().optional()
});

export const LogisticalVectorSchema = z.object({
  entity_id: z.string(),
  current_location_id: z.string(),
  slots: z.array(EquipSlotSchema),
  resources: z.record(z.string(), ConsumableResourceSchema),
  total_mass_carried_kg: z.number().min(0),
  max_carry_capacity_kg: z.number()
});

```

#### C. The Epistemic Vector (Information Horizons & Third Rails)

The Epistemic Vector tracks information asymmetry and psychological barriers. It catalogs `known_secret_ids` and defines **Escalation Ceilings**—narrative tripwires a character will not cross unprompted. It also compiles `banned_attenuation_tokens` (words a character is barred from uttering directly, forcing subtextual dialogue through material proxies like tools or debts).

---

### 2. Physical Invariant Solvers: Hand Capacity & Pre-Flight SAT

Pass 1 moves beyond simple field validation by evaluating physical compatibility equations and combinatorial satisfiability directly in memory.

```
                     LOGISTICAL HAND CAPACITY EVALUATION
                                       │
                Extract Active Slots & Somatic Nerve Status
                                       │
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │  Available Hands = 2.0 - Somatic.hand_impairment_penalty    │
        │  Total Demand    = ∑ (slot.occupies_hands)                  │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         ▼                           ▼
        Total Demand ≤ Available Hands     Total Demand > Available Hands
                         │                           │
                         ▼                           ▼
                   [ VALIDATED ]           [ FATAL EXCEPTION ]
                  Pass 1 Proceeds         HAND_CAPACITY_EXCEEDED
                                          Halts Build at T_0 ($0.00)

```

#### The Hand Capacity Invariant

Physical manipulation is mathematically constrained by available operational limbs:


$$\sum_{s \in \text{slots}} s.\text{occupies\_hands} \le 2.0 - \text{Somatic.hand\_impairment\_penalty}$$

If an entity like **The Pilot (020)** suffers an acute injury to `BRACHIAL_PLEXUS_RIGHT` with a severity of $1.0$, Pass 1 assigns a `hand_impairment_penalty` of $1.0$. This immediately reduces their hand capacity from $2$ to $1$.

If the entity's inventory dossier attempts to allocate a kerosene lantern (`occupies_hands: 1`) to `HELD_OFFHAND` while equipping a sawed-off shotgun (`occupies_hands: 1`) in `HELD_PRIMARY`, the linear sum evaluates to:


$$1 + 1 = 2 \not\le 2.0 - 1.0 = 1.0$$

The invariant solver fails instantly with `HAND_CAPACITY_EXCEEDED`. The compiler halts at $T_0$, refusing to write to `compiled/bible-state.json`.

#### Pre-Flight SAT Feasibility ($T = 0, \$0.00$)

To prevent token waste, Pass 1 utilizes propositional satisfiability (SAT) checking. Before dispatching creative generation tasks to language models, the pipeline compiles the character's somatic capability profile into a set of boolean clauses:

```typescript
export interface SomaticCapabilityProfile {
  entity_id: string;
  limbs: {
    left_arm: 'PARALYZED' | 'AMPUTATED' | 'IMPAIRED' | 'INTACT';
    right_arm: 'PARALYZED' | 'AMPUTATED' | 'IMPAIRED' | 'INTACT';
    left_leg: 'FRACTURED' | 'INTACT';
    right_leg: 'INTACT';
  };
  mobility_rank: 1 | 2 | 3 | 4; // 1: Immobile, 2: Limping, 3: Normal, 4: Agile
  held_items: { left_hand?: string; right_hand?: string };
}

```

If a proposed scene requires opening a high-pressure, two-handed bypass valve, the requirement is translated into a boolean assertion:


$$\phi = (\text{limbs.left\_arm} = \text{INTACT}) \land (\text{limbs.right\_arm} = \text{INTACT}) \land (\text{held\_items.left} = \emptyset) \land (\text{held\_items.right} = \emptyset)$$

If the character profile contains a paralyzed limb or occupied hands, the solver proves at compile time that $\phi$ evaluates to `FALSE`. The scene is rejected at $T_0$, saving cloud inference and GPU rendering costs.

---

### 3. Downstream Runtime Enforcement: The AST Invariant Boundary

The invariants compiled during Pass 1 serve as the reference rules for downstream verification. When downstream orchestrators like `worker-sower-engine` execute dialogue generation via language models, Pass 1 data powers the **Layer 1 Invariant Linter**.

```
                     LAYER 1 AST INVARIANT LINTER DUAL-GATE
                                       │
                      Candidate Dual-Artifact Produced
                     (.fountain Prose + dialogue_ast.json)
                                       │
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │  GATE 1: O(1) SET-INTERSECTION AUDIT                        │
        │  AST_Actions ∩ Somatic.banned_kinetic_verbs                 │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         ▼ ∅ (Empty)                 ▼ ≠ ∅ (Breach Detected)
        ┌──────────────────────────────┐    ┌─────────────────────────┐
        │  GATE 2: DEPENDENCY SCAN     │    │  COMPILE HALT AT T_0    │
        │  Lemma Extraction & Modals   │    │  Emit Structured JSON   │
        └──────────────┬───────────────┘    │  Diagnostic Coordinate  │
                       │                    └─────────────────────────┘
         ┌─────────────┴─────────────┐
         ▼ Valid                     ▼ Discrepancy Found
[ Release to Audio / GPU ]    [ SURGICAL REPAIR DISPATCH ]
(Passes Pipeline Gate)        • Isolate AST Node via ts-morph
                              • Negative Prompt Re-injection

```

#### The Dual-Field Verification Gate

LLMs often encounter the "self-reporting trap": an untrusted model can output a structured action enum claiming compliance (`extracted_motor_actions: ["LIMP"]`), while describing a physical violation in the accompanying prose script (*"Octavius lunges across the room and vaults the railing"*).

To counter this failure mode, the Layer 1 Invariant Linter uses a dual-field audit:

1. **$O(1)$ Set-Intersection:** The linter compares declared motor actions directly against the compiled `banned_kinetic_verbs` array:



$$\text{Actions}_{\text{Declared}} \cap \text{banned\_kinetic\_verbs} \neq \emptyset \implies \text{FATAL\_BREACH}$$



2. **Negation-Aware Lemma Extraction:** An independent evaluation pass sweeps the prose using token dependency parsing. The parser inspects verb lemmas and analyzes grammatical dependency trees for negation tokens (`not`, `never`, `couldn't`).


* *"He couldn't sprint across the mud"* $\rightarrow$ Dependent negation detected; valid depiction of physical trauma.


* *"He sprinted across the mud"* $\rightarrow$ Un-negated violation detected; trips the compiler gate.




3. **Cross-Field Discrepancy Assertion:** If the enum claims legal movement but the prose scan reveals an un-negated forbidden action, the delta trips an immediate build failure:



$$\text{Actions}_{\text{Prose}} \setminus \text{Actions}_{\text{Declared}} \neq \emptyset \implies \text{HALT\_DISCREPANCY}$$




#### Structured Diagnostic Telemetry & Surgical Repair

When an invariant fails, the compiler halts execution and emits a structured JSON diagnostic coordinate specifying the exact breach:

```json
{
  "scene_id": "ep101_sc03",
  "file_path": "scenes/ep101_sc03.json",
  "target_type": "SOMATIC_VIOLATION",
  "character_id": "char_020_the_pilot",
  "shot_index": 2,
  "paragraph_index": 4,
  "lines": [12, 16],
  "breached_token": "SPRINT_TO_SLED",
  "active_condition": "brachial_plexus_severed",
  "banned_verbs": ["sprint", "vault", "climb", "heave_two_handed"],
  "allowed_alternatives": ["drag_leg", "brace_arm", "asymmetric_slog"]
}

```

Rather than triggering an expensive full-scene regeneration that could introduce narrative drift, the diagnostic coordinate routes directly into the **Minimal Enclosing Unit (MEU)** repair engine. The orchestrator isolates the failing paragraph, injects a negative directive based on the diagnostic ticket (*"The Pilot has a severed brachial plexus; replace two-handed heaving with an asymmetric drag"*), and repairs the text locally.

---

### 4. Acoustic, Visual, and Modal Invariants

Pass 1 constraints project deterministically across every medium without requiring distinct narrative logic for different formats.

| Invariant Subsystem | Upstream Compile Law (Pass 1)

 | Downstream Text Projection ($R_p$)

 | Downstream Visual Projection ($R_v$)

 | Downstream Acoustic Projection ($R_a$)

 |
| --- | --- | --- | --- | --- |
| **Locomotion & Mobility**<br> | `locomotion_baseline: NEUROPATHY_SHUFFLE`<br> | Blacklists verbs (`sprint`, `vault`, `leap`).

 | WAN/ComfyUI negative prompt injection; enforces shuffled foot placement.

 | Suppresses rapid footstep Foley cues; caps step audio tempo.

 |
| **Limb Functionality**<br> | `BRACHIAL_PLEXUS_RIGHT: severity 1.0`<br> | Flags bimanual actions (`climb`, `heave`, `dual_wield`).

 | OpenPose skeleton pins right arm immobilized to torso.

 | Flags Foley unsheathing or gear handling sounds requiring two hands.

 |
| **Pulmonary Capacity**<br> | `PULMONARY_SYSTEM: severity 0.70`<br> | Caps sentence length; flags un-interrupted monologues.

 | Applies shivering posture overrides and heavy breathing animatic hints.

 | Scales `breathiness_pause_multiplier` to $2.2$; injects micro-silence.

 |
| **Object Permanence**<br> | $\sum \text{held\_items} \le 1.0$ (due to injury)

 | Prevents drawing secondary weapons while lantern is held.

 | Validates ControlNet masks: verifies one hand remains occupied.

 | Prevents contradictory Foley cues (e.g., metallic siphon drops).

 |

#### Modal Constraints via Lubomír Doležel’s Secondary Ontologies

Pass 1 uses Lubomír Doležel’s modal chambers to prevent metaphysical contradictions from compiling into the narrative database:

* **Alethic Constraints (The Possible):** Governs natural and physical existence (e.g., mortality parameters, spatial layouts, gravity rules).


* **Deontic Constraints (The Permitted):** Governs social norms, moral codes, taboos, and power structures.


* **Axiological Constraints (The Valued):** Governs the narrative economy, status metrics, and systemic value scales.


* **Epistemic Constraints (The Known):** Governs verification boundaries, information asymmetry, and perceptual clarity.



The compiler validates cross-modal consistency via Zod refinements:

```typescript
// src/schemas/worldModality.ts
import { z } from 'zod';

export const WorldModalitySchema = z.object({
  alethic: z.object({
    magic_system: z.enum(['NONE', 'VANCIAN', 'FEAR_RESONANCE', 'METABOLIC']),
    spatial_geometry: z.enum(['EUCLIDEAN_STRICT', 'NON_EUCLIDEAN_WARP']),
    resurrection_possible: z.boolean()
  }),
  deontic: z.object({
    moral_feedback: z.enum(['NONE', 'SOCIAL_SCRUTINY', 'SUPERNATURAL_RETRIBUTION']),
    taboo_escalation_ceiling: z.number().int().min(1).max(5)
  })
}).refine(data => {
  // Prevent metaphysical contradictions at compile time
  if (data.alethic.magic_system === 'NONE' && data.deontic.moral_feedback === 'SUPERNATURAL_RETRIBUTION') {
    return false;
  }
  return true;
}, {
  message: "Axiomatic Contradiction: Supernatural retribution cannot exist in a world with zero magical foundation."
});

```

By treating physical laws, biological trauma, and equipment limits as compile-time constraints rather than advisory prompt guidelines, Pass 1 builds a solid foundation for narrative generation. It halts impossible fictional states at $T_0$, ensuring that every downstream token, sound effect, and video frame conforms to the physical reality of the world.**Pass 2 (Referential Integrity & Graph Traversal)** represents the structural verification phase of the `goblin-lore` compiler (`scripts/compile.ts`), packaged downstream as `@snailicid3/consumer-npm`. Where Pass 1 isolates frontmatter to validate scalar boundaries, enums, and anatomical limits via Zod in isolation, Pass 2 evaluates the narrative corpus as an interconnected relational graph.

Its foundational mandate is total elimination of **dangling pointers** (orphaned foreign keys) and **causal circularities** across Markdown dossiers before any state artifact is sealed or exposed to runtime simulation. In this architecture, an unresolvable narrative slug is treated with the identical severity as a syntax error or a broken memory address in compiled software.

```
                          PASS 2 COMPILATION TOPOLOGY
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
┌──────────────────────────────┐                             ┌──────────────────────────────┐
│  COMPILED ID INDEXES (PASS 1)│                             │  ENTITY REFERENCE ARRAYS     │
│  • CharacterIDs: Set<string> │                             │  • equip_slots (held, worn)  │
│  • GrievanceIDs: Set<string> │                             │  • participants_primary      │
│  • LocationIDs:  Set<string> │                             │  • strings_held_over         │
│  • PossessionIDs:Set<string> │                             │  • contested_by / owner      │
└──────────────┬───────────────┘                             └──────────────┬───────────────┘
               │                                                            │
               └──────────────────────────────┬─────────────────────────────┘
                                              │
                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. CROSS-ENTITY REFERENTIAL SWEEP: O(1) Set membership assertions on all foreign keys     │
│ 2. ENTITY RETIREMENT AUDIT: Asserts referenced actors/assets are not marked as retired    │
│ 3. TYPED GRAPH VERIFICATION: Rejects polymorphic string ambiguity (secret vs. grievance)  │
│ 4. CAUSAL DAG CYCLE DETECTION: Depth-First Search (DFS) with recursion stack tracking     │
└─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                              │
                              ┌───────────────┴───────────────┐
                              ▼ ALL EDGES RESOLVED            ▼ BROKEN POINTER / CYCLE
                    [ Advance to Pass 3 ]                   [ FATAL COMPILER HALT ]
                    (Deterministic Seal)                    • process.exit(1)
                                                            • Trace emitted to stderr
                                                            • Zero JSON emitted

```

---

### 1. The Architectural Mandate: Why Markdown Requires Foreign-Key Validation

In traditional creative setups, lore wikis, worldbooks, and character bibles exist as passive prose. Writers link concepts intuitively, leaving continuity errors, vanished props, and retconned motivations to human proofreaders. However, when downstream engines (`worker-sower-engine`, ComfyUI batch nodes, Remotion rendering harnesses) consume story state algorithmically to generate dialogue ASTs, compute 2d6 duels, and synthesize audio frames, an unresolved string reference is catastrophic:

* **Simulation Null-Pointer Exceptions:** If `worker-sower-engine` runs Stage 3 conflict selection and pulls a grievance referencing an entity ID that does not exist in `characters.json`, the lottery loop throws a runtime exception.


* **Resource Desynchronization:** If an agent's `logistical.held` array points to a missing possession slug, downstream sprite manifests (`manifest.json`) fail to resolve layer visual coordinates, causing visual rendering workers to segfault or composite blank frames.


* **Budget Destruction ($T_0$ vs. $T_{\text{render}}$):** A broken pointer caught during frame rendering or after expensive speech synthesis wastes GPU compute and API allocations. Catching broken references during Pass 2 costs $\$0.00$ at compile time ($T_0$).



To enforce this, Section 17, Rule 4 mandates: *"No runtime Markdown parsing — downstream consumers must use the compiled JSON artifact"*. Downstream engines are consumers; `goblin-lore` is **The Law**. If Pass 2 encounters an unresolved reference, the compiler issues a non-zero exit (`process.exit(1)`), refuses to output `compiled/bible-state.json`, and blocks the pipeline.

---

### 2. The Relational Field Topology (The Foreign-Key Matrix)

Pass 2 audits every directional edge connecting the top-level directories: `/characters`, `/grievances`, `/locations`, and `/possessions`.

```
                               THE ENTITY POINTER GRAPH
                               
              ┌───────────────────── [locations/] ◄─────────────────────┐
              │                                                         │
       location_id                                                 location_id
              │                                                         │
      [characters/] ─── equip_slots.held/worn ────► [possessions/]      │
              │                                           │             │
       strings_held_over                           contested_by         │
              │                                           │             │
              ▼                                           ▼             │
      [characters/] ◄──── participants_primary ──── [grievances/] ──────┘
              ▲                                           │
              └───────── spawns_on_max_escalation ────────┘

```

The compiler processes these specific relational edges:

| Source Entity Domain | Relational Field Pointer | Target Domain | Integrity Invariant Enforced at Pass 2 |
| --- | --- | --- | --- |
| **Character** (`/characters/*.md`)

 | `equip_slots.held`<br>

<br>`equip_slots.worn`<br>

<br>`equip_slots.carried`<br>

<br>`equip_slots.cached`<br> | `possessions/`<br> | Every declared inventory slug must exist as a valid entity in the possession index.

 |
| **Character** (`/characters/*.md`)

 | `epistemic.strings_held_over`<br>

<br>`relationship_axes.target`<br> | `characters/`<br> | Leverage debts and relationship vectors must point to active character IDs and cannot target retired actors.

 |
| **Possession** (`/possessions/*.md`)

 | `owner`<br> | `characters/`<br> | The assigned holder must resolve to an indexed character file.

 |
| **Possession** (`/possessions/*.md`)

 | `contested_by`<br> | `characters/`<br> | All secondary claimants vying for the object must exist in the cast registry.

 |
| **Possession** (`/possessions/*.md`)

 | `linked_grievances`<br> | `grievances/`<br> | Any grievance anchored to this physical prop must exist in the grievance corpus.

 |
| **Grievance** (`/grievances/*.md`)

 | `participants_primary`<br>

<br>`participants_can_involve`<br>

<br>`participants_cannot_involve`<br> | `characters/`<br> | Duel lottery participants must exist as real, active character dossiers.

 |
| **Grievance** (`/grievances/*.md`)

 | `spawns_on_max_escalation` (or `spawns_grievances`)

 | `grievances/`<br> | Escalation targets must resolve to real grievance files and form an acyclic DAG.

 |
| **Spatial / World** (`/locations/*.md`)

 | `adjacent_locations`<br>

<br>`character.current_location_id`<br> | `locations/`<br> | Spatial adjacency and starting coordinates must resolve to indexed location nodes.

 |

#### The Danger of Untyped Identifier Collisions

A major defect in early compiler prototypes involved untyped string foreign keys. For example, a grievance frontmatter declared:

```yaml
spawns_on_max_escalation: "bog_famine_secret"

```

Because the string was untyped, the compiler could not determine whether `bog_famine_secret` was supposed to resolve against a child file in `/grievances/` or an epistemic record in `/world/registry.md`. Pass 2 enforces **Typed Graph References**:

```typescript
// Explicitly namespaced entity identifiers
type EntityReference = 
  | `character:${string}`
  | `grievance:${string}`
  | `possession:${string}`
  | `location:${string}`
  | `secret:${string}`;

```

If a field points across entity types without an explicit namespace prefix or declared target index, the compiler throws an invalid reference error rather than silently guessing.

---

### 3. Anatomy of the Pass 2 Validation Engine (`scripts/compile.ts`)

During execution, Pass 2 processes entity datasets in memory after Pass 1 has validated individual Zod schemas. It runs index collection followed by cross-referencing:

```typescript
// scripts/compile.ts (Pass 2 Relational Execution Snippet)
import { Character, Grievance, Location, Possession } from '../schemas/schemas';

interface CorpusIndex {
  characters: Map<string, Character>;
  grievances: Map<string, Grievance>;
  locations: Map<string, Location>;
  possessions: Map<string, Possession>;
}

export function validatePass2RelationalIntegrity(index: CorpusIndex): string[] {
  const errors: string[] = [];

  // 1. Audit Characters -> Possessions, Characters, Locations
  for (const [charId, char] of index.characters.entries()) {
    // Audit equip slots
    const equipSlots = [
      ...(char.logistical?.worn ?? []),
      ...(char.logistical?.held ?? []),
      ...(char.logistical?.carried ?? []),
      ...(char.logistical?.cached ?? [])
    ];

    for (const itemId of equipSlots) {
      if (!index.possessions.has(itemId)) {
        errors.push(
          `[DANGLING_POINTER]: Character "${charId}" equips item "${itemId}", but "${itemId}" does not exist in /possessions.`
        );
      }
    }

    // Audit Epistemic Strings
    for (const targetId of char.epistemic?.strings_held_over ?? []) {
      const target = index.characters.get(targetId);
      if (!target) {
        errors.push(
          `[DANGLING_POINTER]: Character "${charId}" holds string over "${targetId}", who does not exist in /characters.`
        );
      } else if (target.status === 'retired') {
        errors.push(
          `[INVALID_REFERENCE]: Character "${charId}" holds string over "${targetId}", but that character is marked RETIRED.`
        );
      }
    }
  }

  // 2. Audit Possessions -> Characters & Grievances
  for (const [posId, item] of index.possessions.entries()) {
    if (item.owner && !index.characters.has(item.owner)) {
      errors.push(
        `[DANGLING_POINTER]: Possession "${posId}" declares owner "${item.owner}", who does not exist in /characters.`
      );
    }
    for (const claimant of item.contested_by ?? []) {
      if (!index.characters.has(claimant)) {
        errors.push(
          `[DANGLING_POINTER]: Possession "${posId}" contested by unknown character "${claimant}".`
        );
      }
    }
    for (const grievId of item.linked_grievances ?? []) {
      if (!index.grievances.has(grievId)) {
        errors.push(
          `[DANGLING_POINTER]: Possession "${posId}" links to unknown grievance "${grievId}".`
        );
      }
    }
  }

  // 3. Audit Grievances -> Characters & Locations
  for (const [grievId, grievance] of index.grievances.entries()) {
    for (const p of grievance.participants_primary) {
      if (!index.characters.has(p)) {
        errors.push(
          `[DANGLING_POINTER]: Grievance "${grievId}" lists primary participant "${p}", missing from /characters.`
        );
      }
    }
  }

  return errors;
}

```

If `errors.length > 0`, the compiler formats each diagnostic line to `stderr`, halts with `process.exit(1)`, and leaves the file system untouched. Downstream pipelines are protected from partially compiled or broken data.

---

### 4. Directed Acyclic Graph (DAG) Traversal & Causal Cycle Detection

Pass 2 does more than verify that a pointer target exists on disk; it evaluates the **causal topology** of the world.

When two goblins duel over a grievance and the conflict escalates past its ceiling, the system allows the grievance to spawn new structural tensions via `spawns_on_max_escalation`. If authoring oversight introduces a circular dependency, the runtime simulation engine (`worker-sower-engine`) enters an infinite escalation loop:

$$\text{spoon\_credit} \longrightarrow \text{carving\_damaged} \longrightarrow \text{shiny\_button\_dispute} \longrightarrow \text{spoon\_credit}$$

```
                          CAUSAL CYCLE DETECTION (DFS)
                                        │
           griev_01 ──► griev_02 ──► griev_03 ──► griev_01  (CYCLE!)
                                        │
                                        ▼
           ┌─────────────────────────────────────────────────────────┐
           │ Node griev_01 encountered while currently in RECURSION │
           │ stack (Color: GRAY).                                    │
           │                                                         │
           │ HALT: CYCLE_DETECTED                                    │
           │ Path: griev_01 -> griev_02 -> griev_03 -> griev_01     │
           └────────────────────────────┬────────────────────────────┘
                                        │
                                        ▼
                             [ FATAL COMPILER HALT ]

```

To prevent this, Pass 2 models grievance escalation as a Directed Graph $G = (V, E)$ where vertices $V$ are grievances and directed edges $E$ represent spawn triggers. The compiler runs a Depth-First Search (DFS) with three-state node coloring:

* **WHITE (Unvisited):** The node has not yet been encountered by the search.


* **GRAY (Visiting / On Recursion Stack):** The node is actively being evaluated along the current causal path.


* **BLACK (Visited & Cleared):** The node and all its downstream branches have been fully traversed and verified acyclic.



```typescript
// scripts/compile.ts (DFS Cycle Detection Implementation)
export function detectGrievanceCycles(grievances: Map<string, Grievance>): string[] {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycleErrors: string[] = [];

  function dfs(currentId: string, path: string[]) {
    visited.add(currentId);
    recursionStack.add(currentId);
    path.push(currentId);

    const node = grievances.get(currentId);
    if (node && node.spawns_on_max_escalation) {
      const targetId = node.spawns_on_max_escalation;

      if (!visited.has(targetId)) {
        dfs(targetId, [...path]);
      } else if (recursionStack.has(targetId)) {
        cycleErrors.push(
          `[CYCLE_DETECTED]: Circular escalation loop: ${[...path, targetId].join(' -> ')}`
        );
      }
    }

    recursionStack.delete(currentId);
  }

  for (const grievId of grievances.keys()) {
    if (!visited.has(grievId)) {
      dfs(grievId, []);
    }
  }

  return cycleErrors;
}

```

If a child node points back to an ancestor on the active recursion stack, the search identifies a closed loop, outputs the complete escalation path, and aborts compilation.

---

### 5. Automated CI Gates and the Uncommitted Drift Tripwire

Pass 2 integrity is enforced continuously across three automated development checkpoints:

#### A. Automated Vitest Fixtures (`tests/integrity.test.ts`)

The integration test suite executes Pass 2 directly against production fixtures. It runs negative tests (`tests/per-field-negative-fixture-tests/`) to verify that injecting a dummy Markdown file with an orphaned item slug intentionally fails the build:

```typescript
// tests/integrity.test.ts
import { describe, it, expect } from 'vitest';
import { runCorpusCompiler } from '../scripts/compile';

describe('Corpus Relational Integrity (Pass 2)', () => {
  it('should compile cleanly with zero dangling pointers in production corpus', async () => {
    const result = await runCorpusCompiler({ dryRun: true });
    expect(result.errors).toHaveLength(0);
    expect(result.danglingPointerCount).toBe(0);
  });
});

```

#### B. The Uncommitted Drift Tripwire (`git diff --exit-code`)

A critical failure mode occurs when a developer edits a Markdown entity in `/characters` or `/possessions`, fixes foreign keys in prose, but forgets to run `scripts/compile.ts` to regenerate `compiled/bible-state.json`.

The CI gauntlet detects this desynchronization by executing:

```bash
npx tsx scripts/compile.ts
git diff --exit-code compiled/

```


If the newly compiled JSON diverges from the version checked into version control, the command exits with code 1. Downstream engines are guaranteed to read committed artifacts that match authored Markdown files bit-for-bit.

#### C. Downstream Execution Isolation

Once Pass 2 verifies all graph edges and Pass 3 seals the state with a deterministic SHA-256 hash ($H_{\text{root}}$), `worker-sower-engine` consumes `compiled/bible-state.json` as an immutable disk dependency:

```json
// worker-sower-engine/package.json
"dependencies": {
  "@snailicid3/consumer-npm": "file:../000.goblin-lore"
}

```

Because Pass 2 guarantees absolute relational integrity at compile time, `worker-sower-engine` operates without defensive lookup guards, entity existence fallbacks, or runtime graph validation. The simulation engine assumes the graph is mathematically whole, allowing it to focus on duel mechanics, resentment counters, and screenplay AST generation.**Pass 2 Causal Directed Acyclic Graph (DAG) and Cycle Detection** constitutes the temporal and causal verification engine of `goblin-lore` (packaged as `@snailicid3/consumer-npm` and executed via `scripts/compile.ts`). While Pass 2 referential integrity asserts the *spatial and relational existence* of referenced foreign keys (confirming that an item, actor, or location file physically exists on disk), Causal DAG verification asserts the *mathematical validity of narrative progression*.

Narrative continuity operates as a compilation and dependency problem. Downstream simulation systems (`worker-sower-engine`) rely on static grievance files and world facts to drive serialized escalation without manual, per-episode hand-scripting. If authored narrative triggers contain circular causal loops ($A \to B \to C \to A$), automated runtime engines descend into infinite escalation cycles, simulation deadlocks, or recursive cache invalidation cascades. The compiler’s acyclicity engine mathematically proves the absence of causal loops at $T_0$ ($0.00 cost) before state artifacts are sealed into `compiled/bible-state.json`.

```
                  CAUSAL GRAPH TOPOLOGY & CYCLE DETECTION
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌─────────────────────────────┐                     ┌─────────────────────────────┐
│ GRIEVANCE CORPUS            │                     │ WORLD FACTS & SECRETS       │
│ • spawns_on_max_escalation  │                     │ • upstream prerequisites    │
│ • spawns_grievances         │                     │ • causal unlocks            │
└──────────────┬──────────────┘                     └──────────────┬──────────────┘
               │                                                   │
               └─────────────────────────┬─────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 1. ADJACENCY EXTRACTION: Parse typed spawn references ({type, target_id})      │
│ 2. GRAPH CONSTRUCTION: Model as Directed Graph G = (V, E)                       │
│ 3. THREE-COLOR DFS AUDIT:                                                       │
│    • WHITE: Unvisited nodes                                                     │
│    • GRAY:  Active in current recursion stack (Path tracing)                    │
│    • BLACK: Fully resolved & proven acyclic                                     │
│ 4. TOPOLOGICAL SCHEDULABILITY: Assert existence of valid linear execution sort  │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         ▼ STRICTLY ACYCLIC              ▼ CYCLE DETECTED (GRAY HIT)
              [ Advance to Pass 3 ]             [ FATAL COMPILER HALT ]
              • Calculate Depth Metrics         • process.exit(1)
              • Emit Bible State Artifact       • Trace Causal Path to stderr
              • Seal Deterministic Hash         • Zero JSON written to disk

```

---

### 1. The Mechanics of Causal Chaining: Why Stories Are Directed Graphs

In the `goblin-lore` corpus, stories are not authored as continuous prose; they are decoupled into persistent, stateful conflict units termed **Grievances**. Each grievance acts as a modular state machine possessing an entry threshold (`intensity_floor`), an escalation ladder (typically stages 1 to 4 or 5), a cooldown timer, and an exit spawn vector (`spawns_on_max_escalation` or `spawns_grievances`).

#### The Macro-Arc Escalation Vector

Grievance chaining allows a season arc to emerge dynamically from local interactions. An argument over an everyday domestic artifact escalates until the underlying emotional tension can no longer be contained within the original framing:

```
grv_spoon_credit (Stage 1-4)
       │
       ▼ (Hits max escalation: spawns_on_max_escalation)
grv_hoarding_reveal (Stage 1-4)
       │
       ▼ (Hits max escalation: spawns_on_max_escalation)
sec_bog_famine_secret (Epistemic Truth Unlocked)

```

1. **Micro-Friction (`grv_spoon_credit`):** Bog and Spleen bicker superficially over who recovered the silver spoon from human territory.


2. **Escalation Breach:** When mechanical duel outcomes push this conflict to its `intensity_ceiling` (Stage 4), the rule triggers `spawns_on_max_escalation`.


3. **Macro-Progression (`grv_hoarding_reveal`):** The confrontation unlocks a deeper, previously dormant grievance: Bog has been stockpiling rations out of survival panic.


4. **Structural Payoff:** Escalate that further, and the chain exposes the foundational trauma of the universe (`sec_bog_famine_secret`).



#### The "Therefore / But" Syntactic Invariant

This narrative graph enforces classical dramaturgical momentum through typed causal edges rather than additive transitions:

* **Additive Transitions ("And Then"):** Scene A happens, *and then* Scene B happens, *and then* Scene C happens. In graph terms, this is disconnected, episodic noise with low causal tension.


* **Causal Transitions ("Therefore / But"):** Scene A occurs, **therefore** consequence B emerges, **but** obstacle C intervenes.



When an author creates a spawn edge in `goblin-lore`, that edge is an absolute causal dependency. Node B cannot be selected by the runtime simulation lottery until Node A has traversed its lifecycle and explicitly spawned it.

#### The Catastrophe of Circular Causality

If authorial negligence or multi-contributor pull requests introduce circular dependencies, narrative coherence collapses into a loop:


$$\text{grv\_spoon} \longrightarrow \text{grv\_hoarding} \longrightarrow \text{grv\_famine} \longrightarrow \text{grv\_spoon}$$

If this graph compiles into `bible-state.json`, downstream simulation engines experience severe failures:

* **Simulation Attractors & Grudge Loops:** When `worker-sower-engine` runs Stage 3 conflict selection, the PRNG scoring algorithm assigns high tension weights to newly spawned grievances. In a cycle, resolving the famine secret re-activates the petty spoon dispute, trapping the AI characters in an un-escapable loop of the same three arguments for 50 episodes.


* **Absorbing States:** The characters enter a state space with no exit condition, destroying ensemble balance and starving other narrative threads of screen time.


* **Infinite Invalidation Loops:** In downstream caching engines where dirty states propagate along dependency edges, a cycle creates an infinite loop where invalidating Node A dirties Node B, which dirties Node C, which dirties Node A.



---

### 2. Mathematical Formalism of the Narrative DAG

To guarantee determinism, Pass 2 models the entire narrative corpus as a finite Directed Graph:


$$\mathcal{G} = (\mathcal{V}, \mathcal{E})$$

#### Entity Vertices ($\mathcal{V}$)

The set of vertices $\mathcal{V}$ is partitioned into typed sub-registries parsed during Pass 1:


$$\mathcal{V} = \mathcal{G}_{\text{grievance}} \cup \mathcal{S}_{\text{secret}} \cup \mathcal{F}_{\text{fact}}$$


where:

* $\mathcal{G}_{\text{grievance}}$ represents active interpersonal conflict definitions.


* $\mathcal{S}_{\text{secret}}$ represents unrevealed epistemic items held in characters' information horizons.


* $\mathcal{F}_{\text{fact}}$ represents immutable axiomatic truths of the storyworld.



#### Directed Causal Edges ($\mathcal{E}$)

The set of directed edges $\mathcal{E}$ represents structural unlocks and prerequisite transitions:


$$\mathcal{E} \subseteq \mathcal{V} \times \mathcal{V}$$


A directed edge $(u, v) \in \mathcal{E}$ asserts that entity $u$ causally precedes, unlocks, or spawns entity $v$ ($u \to v$).

#### The Acyclicity Invariant

Pass 2 asserts that $\mathcal{G}$ is a **Directed Acyclic Graph (DAG)**. Mathematically, $\mathcal{G}$ contains no directed cycles:


$$\nexists \, (v_0, v_1, \dots, v_k) \in \mathcal{V} \quad \text{such that} \quad k \ge 1, \quad (v_{i-1}, v_i) \in \mathcal{E} \quad \forall i \in \{1, \dots, k\}, \quad \text{and} \quad v_0 = v_k$$

#### Permitted Confluence vs. Forbidden Cycles

A critical responsibility of Pass 2 is distinguishing between **valid confluent dependencies (diamond structures)** and **invalid cycles**:

```
      VALID CONFLUENT DAG (DIAMOND)                  FORBIDDEN CAUSAL CYCLE
              grv_root                                     grv_alpha
             ┌───┴───┐                                         │
             ▼       ▼                                         ▼
         grv_left  grv_right                               grv_beta
             └───┬───┘                                         │
                 ▼                                             ▼
             grv_terminal                                  grv_gamma
                                                               │
                                                               └──► (Loops back to grv_alpha!)

```

* **Diamond Dependencies (Legal):** `grv_root` spawns both `grv_left` and `grv_right`. Both independent sub-conflicts eventually converge to unlock `grv_terminal`. In a story, two separate arguments can build toward the same climax. The graph contains multiple paths between `grv_root` and `grv_terminal`, but remains strictly acyclic.


* **Circular Loops (Fatal):** `grv_alpha` spawns `grv_beta`, which spawns `grv_gamma`, which points back to `grv_alpha`. This causes the compiler to throw a fatal exception.



---

### 3. The Three-Color DFS Cycle Detection Algorithm

To perform cycle detection over thousands of relational nodes in milliseconds, `scripts/compile.ts` executes a **Three-Color Depth-First Search (DFS)** with recursion stack tracking.

#### Node State Enumeration

During traversal, every entity in the corpus is mapped to one of three states:

* **WHITE (0 - Unvisited):** The node has not yet been encountered by the search algorithm.


* **GRAY (1 - Visiting / On Recursion Stack):** The node is actively being evaluated. The search has entered this node and is traversing its downstream child edges. Any edge pointing to a GRAY node represents a back-edge, proving a circular path.


* **BLACK (2 - Visited / Clean):** The node and all its downstream subtrees have been fully traversed and mathematically verified as acyclic. It is safe from causal deadlocks.



#### Implementation Architecture

The following implementation represents the exact engine running in Pass 2 of the `goblin-lore` compilation pipeline:

```typescript
// scripts/compile.ts (Pass 2 Causal DAG Engine)
export interface GrievanceSpawnTarget {
  type: 'grievance' | 'secret' | 'world_event';
  target_id: string;
}

export interface GrievanceCorpusEntity {
  id: string;
  category: string;
  intensity_ceiling: number;
  spawns_on_max_escalation?: GrievanceSpawnTarget[];
}

export interface CycleDiagnosticReport {
  hasCycle: boolean;
  cycleTrace: string[];
  errorMessage: string | null;
}

export class CausalGraphValidator {
  private adjacencyList: Map<string, string[]> = new Map();
  private colorMap: Map<string, 'WHITE' | 'GRAY' | 'BLACK'> = new Map();
  private parentPath: string[] = [];

  constructor(grievances: Map<string, GrievanceCorpusEntity>) {
    // 1. Build the Adjacency List from Typed Frontmatter
    for (const [id, entity] of grievances.entries()) {
      this.colorMap.set(id, 'WHITE');
      
      const targets: string[] = [];
      if (entity.spawns_on_max_escalation) {
        for (const spawn of entity.spawns_on_max_escalation) {
          // Pass 2 only follows causal links within the grievance/event domain
          if (spawn.type === 'grievance') {
            targets.push(spawn.target_id);
          }
        }
      }
      this.adjacencyList.set(id, targets);
    }
  }

  public auditAcyclicity(): CycleDiagnosticReport {
    for (const nodeId of this.adjacencyList.keys()) {
      if (this.colorMap.get(nodeId) === 'WHITE') {
        const report = this.dfs(nodeId);
        if (report.hasCycle) {
          return report;
        }
      }
    }

    return { hasCycle: false, cycleTrace: [], errorMessage: null };
  }

  private dfs(currentId: string): CycleDiagnosticReport {
    // Mark node as currently on the active recursion stack
    this.colorMap.set(currentId, 'GRAY');
    this.parentPath.push(currentId);

    const downstreamNeighbors = this.adjacencyList.get(currentId) ?? [];

    for (const neighborId of downstreamNeighbors) {
      const neighborColor = this.colorMap.get(neighborId);

      // Condition A: Encountered a node on the active stack -> CYCLE CONFIRMED!
      if (neighborColor === 'GRAY') {
        const cycleStartIndex = this.parentPath.indexOf(neighborId);
        const loopSlice = [...this.parentPath.slice(cycleStartIndex), neighborId];
        
        return {
          hasCycle: true,
          cycleTrace: loopSlice,
          errorMessage: `[CYCLE_DETECTED]: Causal loop identified across escalation chain: ${loopSlice.join(' -> ')}`
        };
      }

      // Condition B: Node is unvisited -> Recurse deeply
      if (neighborColor === 'WHITE') {
        const subReport = this.dfs(neighborId);
        if (subReport.hasCycle) {
          return subReport; // Bubble failure immediately
        }
      }

      // Condition C: Neighbor is BLACK -> Already verified acyclic, skip
    }

    // Node fully evaluated; pop from stack and mark black
    this.parentPath.pop();
    this.colorMap.set(currentId, 'BLACK');
    
    return { hasCycle: false, cycleTrace: [], errorMessage: null };
  }
}

```

#### Fatal Exit Protocol

When `report.hasCycle === true`, Pass 2 halts immediately:

```bash
$ npx tsx scripts/compile.ts

[PASS 1]: Shape and bounds validated across 64 entities.
[PASS 2]: Relational pointer integrity verified.
[PASS 2 CAUSAL DAG FAILURE]:
  [CYCLE_DETECTED]: Causal loop identified across escalation chain:
  grv_silver_spoon_grease -> grv_iron_pot_scandal -> grv_pantry_theft -> grv_silver_spoon_grease
  
  Compilation aborted with status code 1.
  Zero state artifacts written. bible-state.json remains unmutated.

```

The script exits via `process.exit(1)`, preventing any corrupted graph from advancing to the Pass 3 deterministic seal.

---

### 4. Topological Ordering & Simulation Schedulability

Proving acyclicity achieves a fundamental mathematical requirement: **a graph can be topologically sorted if and only if it is a DAG**.

Topological sorting maps the partially ordered causal nodes into a linear sequence:


$$\mathcal{L} = \text{TopologicalSort}(\mathcal{G})$$


such that for every directed edge $(u, v) \in \mathcal{E}$, entity $u$ appears before entity $v$ in the sequence ($u \prec v$).

```
  Topological Depth 0         Topological Depth 1         Topological Depth 2
 (Genesis / Root Conflicts)   (Secondary Escalations)     (Climaxes & Season Finales)
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│ grv_silver_spoon_grease │─► grv_iron_pot_scandal    │─► grv_famine_retribution  │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
┌─────────────────────────┐ ┌─────────────────────────┐
│ grv_stolen_thimble      │─► grv_hoarding_reveal     │
└─────────────────────────┘ └─────────────────────────┘

```

#### Narrative Velocity and Depth Profiling

Once topological sorting succeeds, Pass 2 computes the **Topological Depth** ($\delta$) of every narrative element:


$$\delta(v) = \begin{cases}  0 & \text{if } \text{InDegree}(v) = 0 \\  1 + \max_{(u, v) \in \mathcal{E}} \delta(u) & \text{otherwise}  \end{cases}$$

This metric provides runtime simulation advantages for `worker-sower-engine`:

1. **Pacing Control:** In early episodes (Cycles 1–5), the simulation sower biases conflict lotteries toward grievances with Depth $\delta = 0$ (low-stakes, introductory conflicts).


2. **Climax Scheduling:** Grievances with Depth $\delta \ge 3$ are locked behind season progression, preventing characters from confronting climactic, game-ending secrets during the pilot episode.


3. **Dead-End Detection:** If a high-intensity grievance has an out-degree of zero and lacks resolution conditions, it is flagged in the compiler report as a narrative terminal point.



---

### 5. Downstream Invalidation & The Blast Radius Engine

The Causal DAG compiled in Pass 2 does not remain locked in `goblin-lore`; it serves as the underlying dependency graph for the downstream production database (Cloudflare D1 / SQLite).

#### Dependency Fingerprinting

Every downstream scene generated by the Sower and rendered by Remotion maintains an immutable cryptographic fingerprint of the upstream facts and grievances it consumed:


$$\text{SceneHash} = \mathcal{H}\left(\text{AST} + \sum_{i=1}^{k} \mathcal{H}(\text{Dependency}_i) + \text{Assets} + \text{CompilerVersion}\right)$$

If an upstream grievance definition or foundational world fact is mutated in `goblin-lore`, the system runs a forward-walking dependency sweep along the DAG:

```bash
$ sower why-dirty grv_silver_spoon_grease

[MUTATION DETECTED]: grv_silver_spoon_grease frontmatter modified.
  ├── [DIRECT]: Scene 101/02 (Consumes grv_silver_spoon_grease) -> IS_DIRTY = 1
  ├── [CAUSAL DEPTH 1]: grv_iron_pot_scandal -> PENDING_REVALIDATION
  │     └── Scene 102/04 (Consumes grv_iron_pot_scandal) -> IS_DIRTY = 1
  └── [CAUSAL DEPTH 2]: grv_famine_retribution -> PENDING_REVALIDATION
        └── Scene 104/01 (Consumes grv_famine_retribution) -> IS_DIRTY = 1

Total Blast Radius: 3 scenes across 2 episodes invalidated. Rebuild Cost: $0.00.

```

Because the graph is proven acyclic, the invalidation cascade is guaranteed to be **finite and unidirectional**. The sweep computes the transitive closure without running into infinite recursive loops, protecting cloud infrastructure from cascading regeneration storms.

#### Defending Against Epistemological Calcification

A narrative engine without DAG cycle auditing falls victim to the **Calcification Feedback Loop**:

1. Under deadline pressure, a creator authors an unvetted grievance with a hasty causal link.


2. The fact accumulates downstream dependents across several episodes, driving its in-degree centrality higher ($k_{\text{in}} = 1 \to 12 \to 45$).


3. If an accidental cycle exists, modifying or deprecating that fact becomes impossible because the invalidation cascade wraps back onto itself, corrupting the entire story history.



Pass 2 DAG verification arrests this failure mode at the moment of authoring. By enforcing strict acyclicity, every branch of the narrative maintains a clean, traceable lineage back to its root premise.

---

### 6. Automated Verification & The CI/CD Test Battery

To prevent circular regressions from entering the production codex, Pass 2 verification is wired into automated Vitest suites and GitHub Actions CI gates.

#### Vitest Integration Suite (`tests/integrity.test.ts`)

The integration test suite asserts acyclicity across production lore files and validates compiler behavior against synthetic cyclic fixtures:

```typescript
// tests/integrity.test.ts
import { describe, it, expect } from 'vitest';
import { CausalGraphValidator, GrievanceCorpusEntity } from '../scripts/compile';

describe('Pass 2: Causal DAG & Cycle Detection', () => {
  it('should verify the production grievance corpus is 100% acyclic', async () => {
    const liveGrievances = await loadProductionGrievances();
    const validator = new CausalGraphValidator(liveGrievances);
    const report = validator.auditAcyclicity();

    expect(report.hasCycle).toBe(false);
    expect(report.cycleTrace).toHaveLength(0);
  });

  it('should catch deliberate circular spawn dependencies and fail loud', () => {
    const mockCorpus = new Map<string, GrievanceCorpusEntity>([
      ['node_a', { id: 'node_a', category: 'TEST', intensity_ceiling: 3, spawns_on_max_escalation: [{ type: 'grievance', target_id: 'node_b' }] }],
      ['node_b', { id: 'node_b', category: 'TEST', intensity_ceiling: 3, spawns_on_max_escalation: [{ type: 'grievance', target_id: 'node_c' }] }],
      ['node_c', { id: 'node_c', category: 'TEST', intensity_ceiling: 3, spawns_on_max_escalation: [{ type: 'grievance', target_id: 'node_a' }] }] // Cycle!
    ]);

    const validator = new CausalGraphValidator(mockCorpus);
    const report = validator.auditAcyclicity();

    expect(report.hasCycle).toBe(true);
    expect(report.cycleTrace).toEqual(['node_a', 'node_b', 'node_c', 'node_a']);
    expect(report.errorMessage).toContain('[CYCLE_DETECTED]');
  });
});

```

#### The Pre-Commit and CI Drift Tripwires

The compilation script and DAG validator run automatically prior to every commit via Husky, and run in CI on every push via `.github/workflows/validate-bible.yml`:

```bash
npx tsx scripts/compile.ts
git diff --exit-code compiled/

```

If a contributor drafts a new grievance in Markdown that introduces a circular spawn chain, `compile.ts` aborts with exit code 1. `compiled/bible-state.json` is never generated, the git diff gate trips, the PR is blocked, and the broken narrative topology is arrested before it can reach simulation or consume GPU compute.**Pass 3 (The Deterministic State Seal)** is the terminal phase of the narrative compilation pipeline executed by `scripts/compile.ts` within `goblin-lore` (packaged downstream as `@snailicid3/consumer-npm`). While Pass 1 isolates frontmatter to validate scalar intervals and anatomical slot bounds, and Pass 2 audits cross-entity foreign keys and asserts causal Directed Acyclic Graph (DAG) acyclicity, Pass 3 governs **serialization purity, cryptographic identity, and filesystem persistence**.

Its mandate is to convert verified, disparate human-authored Markdown dossiers into a byte-identical, content-addressed JSON artifact (`compiled/bible-state.json`) stamped with a universal SHA-256 state hash ($H_{\text{root}}$). Through recursive lexicographical sorting, the elimination of volatile runtime inputs, atomic file generation, and continuous drift verification, Pass 3 guarantees that narrative canon acts as an immutable, mathematically reproducible law for downstream simulation engines.

```
                     PASS 3: DETERMINISTIC SEALING ARCHITECTURE
                                         │
                   All Pass 1 & Pass 2 Invariants Verified
                                         │
                                         ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ 1. CANONICAL KEY NORMALIZATION: Recursive alphabetical key traversal       │
  │ 2. PURITY ENFORCEMENT: Absolute ban on Date.now(), Math.random(), env vars   │
  │ 3. ENVELOPE STRUCTURING: Bind state, schemaVersion, entityCount, tree SHAs  │
  │ 4. CRYPTOGRAPHIC SEALING: SHA-256 hashing over normalized byte stream       │
  └──────────────────────────────────────┬──────────────────────────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
  ┌──────────────────────────────┐              ┌──────────────────────────────┐
  │ ATOMIC DISK COMMIT           │              │ CI DRIFT TRIPWIRE            │
  │ • Write to .tmp_* sibling    │              │ • git diff --exit-code       │
  │ • POSIX rename atomicity     │              │ • Blocks uncompiled edits    │
  │ • compiled/bible-state.json  │              │ • Catches spoofed PR hashes  │
  └──────────────┬───────────────┘              └──────────────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ DOWNSTREAM INGESTION: Read-only disk dependency (@snailicid3/consumer-npm)   │
  │ • Consumed by worker-sower-engine without runtime Markdown parsing          │
  │ • $H_{root}$ stamped into ASTs, state snapshots, and render manifests       │
  └─────────────────────────────────────────────────────────────────────────────┘

```

---

### 1. The Necessity of Byte-Stable Determinism

In a traditional build system, serializing data to disk is often treated as a trivial utility call (e.g., `JSON.stringify(data, null, 2)`). In a deterministic generative media pipeline, unconstrained JSON serialization is a critical point of failure.

#### The Pitfall of Dynamic Key Insertion

JavaScript object runtimes (such as V8 in Node.js) iterate over object properties based on internal insertion order rather than deterministic sorting. Depending on the sequence in which files are discovered by file system globs (`fs.readdir`), whether on Linux, macOS, or Windows, raw objects can serialize with differing key sequences:

```text
Discovery Order A: {"id": "char_bog", "name": "Bog", "status": "active"}
Discovery Order B: {"status": "active", "id": "char_bog", "name": "Bog"}

```

While semantically identical in memory, their serialized UTF-8 strings produce completely divergent cryptographic hashes. If downstream build caches, scene dependency invalidators, or frame-generation pipelines depend on canonical state hashing, an unstable serialization order will constantly trigger cache invalidations, spurious Git diff churn, and non-reproducible simulation runs.

#### The Rule of Order Derivation

Downstream systems enforce that no computation may depend on an ordering whose derivation is not itself deterministic and recorded. Pass 3 applies this principle directly to canonical storage.

---

### 2. Recursive Lexicographical Canonicalization

To enforce byte-level serialization stability, Pass 3 subjects the entire in-memory dataset to a recursive alphabetical key-sorting traversal before serialization begins.

#### The Key Normalization Algorithm (`sortKeysAlphabetical`)

The compiler traverses every entity, nested dictionary, array, and primitive scalar value. If an object is encountered, a new object is instantiated whose keys are extracted, sorted lexicographically using Unicode code point collation, and populated recursively:

```typescript
// scripts/compile.ts (Pass 3 Serialization Normalizer)
export function sortKeysAlphabetical<T>(input: T): T {
  // Handle non-object primitives and null/undefined values directly
  if (input === null || typeof input !== 'object') {
    return input;
  }

  // Handle arrays by recursively sorting element contents
  if (Array.isArray(input)) {
    return input.map((item) => sortKeysAlphabetical(item)) as unknown as T;
  }

  // Object handling: Extract, sort keys lexicographically, and construct pure record
  const sortedObj: Record<string, unknown> = {};
  const keys = Object.keys(input as Record<string, unknown>).sort();

  for (const key of keys) {
    sortedObj[key] = sortKeysAlphabetical((input as Record<string, unknown>)[key]);
  }

  return sortedObj as T;
}

```

#### Preservation of Array Element Order

Unlike object key mappings, Pass 3 strictly **preserves the authored order of arrays** unless the schema explicitly declares the field to be a set. In narrative state modeling, array sequences are often causally load-bearing:

* An escalation ladder in a grievance file (`stages: [Stage1, Stage2, Stage3]`) represents chronological narrative progression.


* An agent's action history (`conditions_active: ["humiliated", "exposed"]`) reflects an ordered event stream where earlier events causally precede later ones.


* Re-ordering array elements would mutate causal history ($S_{n+1} = \mathcal{R}(S_n, E_n, \sigma_n)$), corrupting the historical replay invariant.



---

### 3. Absolute Elimination of Volatile Runtime Contamination

A major failure mode in build pipelines is the injection of ambient, volatile environment variables into static state outputs.

#### The Ban on Dynamic Timestamps

Section 16.2 and Pass 3 development rules mandate: **Dynamic runtime timestamps (`new Date().toISOString()`, `Date.now()`) are strictly forbidden**.

* If a compilation run stamps `compiled_at: "2026-09-20T17:44:01.123Z"` into the output artifact, re-running `npm run compile` five seconds later without touching a single Markdown file will produce a divergent file.


* This timestamp churn invalidates the SHA-256 root hash ($H_{\text{root}}$), breaking the drift-detection tripwire in continuous integration.


* Temporal tracking in `goblin-lore` is handled exclusively through discrete, narrative-logical clocks: integer cycles, discrete episode boundaries, and ordered event sequences ($S_0 \to S_1 \to S_N$), never real-world system wall-clock timestamps.



#### Sandboxing and Environmental Purity

To maintain compiler purity, the system isolates Pass 3 against environment contamination:

1. **Zero External I/O:** Pass 3 does not perform network socket connections, query external APIs, or read mutable environment flags from `process.env`.


2. **Zero PRNG Seeding:** Ambient pseudorandom generation (`Math.random()`) is banned during compilation. The state seal is a pure, deterministic transformation:



$$f(\text{Corpus}_{\text{AST}}) \longrightarrow \text{Bytes}_{\text{JSON}}$$


3. **Reproducibility Testing:** CI suites run environment contamination probes that intercept and throw fatal errors if `Date.now()`, `Math.random()`, or network handles are accessed during compilation passes.



---

### 4. Cryptographic Hashing ($H_{\text{root}}$) & The Canonical Envelope

Once the dataset has been validated by Pass 1, verified as an acyclic graph by Pass 2, and normalized through recursive key sorting, Pass 3 constructs the canonical envelope and calculates the universal state hash.

```typescript
// scripts/compile.ts (Pass 3 Envelope Packaging)
import crypto from 'node:crypto';

export interface BibleStateEnvelope {
  corpusHash: string;
  schemaVersion: string;
  entityCount: number;
  entities: {
    characters: Record<string, Character>;
    grievances: Record<string, Grievance>;
    locations: Record<string, Location>;
    possessions: Record<string, Possession>;
    world: Record<string, WorldAxiom>;
  };
}

export function compileAndSealState(rawEntities: RawCorpusEntities): BibleStateEnvelope {
  // Step 1: Normalize all entities alphabetically
  const sortedEntities = sortKeysAlphabetical(rawEntities);

  // Step 2: Compute SHA-256 over pure sorted payload
  const serializedPayload = JSON.stringify(sortedEntities, null, 2);
  const stateHash = crypto.createHash('sha256').update(serializedPayload, 'utf8').digest('hex');

  // Step 3: Package into final versioned container
  const finalEnvelope: BibleStateEnvelope = {
    corpusHash: stateHash,
    schemaVersion: "1.0.0",
    entityCount: Object.keys(sortedEntities.characters).length +
                 Object.keys(sortedEntities.grievances).length +
                 Object.keys(sortedEntities.locations).length +
                 Object.keys(sortedEntities.possessions).length +
                 Object.keys(sortedEntities.world).length,
    entities: sortedEntities
  };

  return finalEnvelope;
}

```

#### The Structure of the Seal

* **`corpusHash` ($H_{\text{root}}$):** The cryptographic SHA-256 digest generated directly from the normalized UTF-8 string representation of the world's entities.


* **`schemaVersion`:** Declares the contract version of the meta-ontology (e.g., `"1.0.0"`), guaranteeing that downstream readers do not attempt to deserialize state using incompatible schema interpretations.


* **`entityCount`:** A scalar integer of all validated entries across `/characters`, `/grievances`, `/locations`, `/possessions`, and `/world`, providing a fast sanity check during headless boot sequences.


* **Git Tree SHA Cross-Verification:** In production environments, the compiler cross-checks the Git tree SHA of source directories (`/characters`, `/grievances`, `/world`) to tie the compiled output to specific Git commit states.



---

### 5. Atomic Persistence via POSIX Rename

Pass 3 enforces strict filesystem safety during serialization to eliminate partial writes, disk truncation bugs, or race conditions.

```
                     ATOMIC WRITE EXECUTION SEQUENCE
                                     │
                 Serialize Envelope to Canonical String
                                     │
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │ Write buffer to sibling: compiled/bible-state.json.tmp  │
        └────────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │ Verify buffer flush & SHA-256 hash match on disk        │
        └────────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │ fs.renameSync(tmpPath, "compiled/bible-state.json")     │
        │ Atomic POSIX Pointer Swap (Inode replacement)           │
        └────────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
                           [ STATE ATOM LOCKED ]

```

#### The Inode Pointer Swap

Writing directly to `compiled/bible-state.json` via standard streaming writes introduces a vulnerability: if the process runs out of disk space, encounters an operating system interrupt, or is terminated mid-write, the production file is left corrupted or half-empty.

Pass 3 prevents this by writing to an isolated temporary file:

1. The serialized payload is written to a temporary sibling file: `compiled/bible-state.json.tmp_[UUIDv7]`.


2. The compiler flushes the write buffer to disk.


3. The runtime executes an atomic filesystem rename (`fs.renameSync`) to overwrite `compiled/bible-state.json`.



On POSIX-compliant filesystems, `rename` operates as an atomic swap of filesystem directory pointers (inodes). Downstream reader processes (such as a local `worker-sower-engine` daemon reading the file during a simulation tick) will either see the old, valid state file or the new, valid state file—never a partially written or corrupted intermediate file.

---

### 6. The Drift Tripwire (`git diff --exit-code`)

Pass 3 is linked directly to CI/CD gates via **The Drift Tripwire**, preventing manual tampering or uncompiled edits.

```bash
# Executed in GitHub Actions (.github/workflows/validate-bible.yml) & Husky Pre-commit
npm run compile
git diff --exit-code compiled/

```

#### Failure Scenarios Caught by the Tripwire

| Failure Scenario | Vector | Tripwire Detection Mechanism |
| --- | --- | --- |
| **Uncompiled Source Edits**<br> | A writer modifies an actor's `locomotion_baseline` in `characters/bog.md`, but forgets to run `npm run compile` before pushing.

 | CI executes `compile.ts`, which compiles the new frontmatter and mutates `compiled/bible-state.json`. `git diff --exit-code` flags the uncommitted change and aborts the build.

 |
| **Spoofed Compile Pass**<br> | An automated agent or contributor directly edits `compiled/bible-state.json` by hand to bypass a Pass 1 or Pass 2 compiler error without updating the Markdown source files.

 | CI executes `compile.ts` from scratch against the source Markdown. The fresh compilation overwrites the hand-edited file with the real state, producing a diff that halts the pipeline.

 |
| **Non-Deterministic Churn**<br> | An author introduces code with dynamic timestamps (`new Date().toISOString()`) or un-sorted keys.

 | Every local compilation produces a varying hash on clean checkouts. The drift gate detects persistent diff mismatches between clean runs and flags the non-determinism.

 |

By coupling compiler execution with a strict zero-diff exit requirement, the pipeline prevents downstream systems from executing against stale, out-of-sync, or unverified canon.

---

### 7. Downstream Consumption Contract

Once Pass 3 is complete, the compiled artifact transitions from an active compilation target to an immutable system of record.

#### Read-Only Filesystem Binding

Downstream execution daemons (`worker-sower-engine`) link the compiled lore repository directly via their package configuration:

```json
// worker-sower-engine/package.json
{
  "dependencies": {
    "@snailicid3/consumer-npm": "file:../000.goblin-lore"
  }
}

```

Downstream daemons consume `compiled/bible-state.json` via static filesystem imports. Section 17, Rule 4 is maintained: **raw Markdown files are never parsed at runtime by downstream consumers**. Downstream engines interact exclusively with strongly typed, schema-validated JSON data.

#### Cryptographic Traceability in Narrative Artifacts

The root hash ($H_{\text{root}}$) acts as a cryptographic anchor for the narrative pipeline:

```
    compiled/bible-state.json (H_root = e8f4c2...9b)
                         │
                         ▼
             [ worker-sower-engine ]
                         │
                         ▼
        dialogue_ast.json / Screenplay AST
        {
          "schema_version": "2.1.0",
          "compiler_version": "1.0.4",
          "state_snapshot_hash": "e8f4c2...9b",
          "scene_id": "ep101_sc01"
        }
                         │
                         ▼
     [ Remotion / ComfyUI / Headless Viewport ]
     (render_manifest.json anchors frame budget to H_root)

```

When `worker-sower-engine` generates a candidate scene, it embeds the active `state_snapshot_hash` ($H_{\text{root}}$) directly into the `dialogue_ast.json` machine contract. This prevents desynchronization across the production pipeline:

* The Dialogue AST records the exact state hash it was generated against.


* The Exposure Sheet and Remotion compositions verify that asset manifests, character conditions, and audio durations match the sealed state.


* If upstream canon is subsequently altered, the resulting change in $H_{\text{root}}$ exposes the mismatch between the new world state and older generated scenes, triggering the dependency graph's invalidation sweep.



Pass 3 bridges human authorship and machine execution. By normalizing object structure, eliminating runtime variance, generating a universal SHA-256 state hash, and writing output atomically, it transforms creative intent into an immutable, verifiable, and executable foundation of truth.A Command Line Interface (CLI) inside `goblin-lore` provides the highest leverage not by adding game logic or simulation runtime, but by **streamlining the authoring, checking, and auditing loop** for human writers and coding agents.

Currently, interacting with `goblin-lore` requires jumping between manual Markdown editing and disjointed terminal scripts (`scripts/compile.ts`, `scripts/lint-voice.ts`, `tests/integrity.test.ts`, and git diff checks). Wrapping these tasks in a dedicated CLI (using lightweight prompt libraries like `@clack/prompts` or `inquirer` rather than heavy terminal buffers) formalizes the repo's legislative authority while making authoring fast and ergonomic.

---

### 1. Guided Entity Scaffolding & Frontmatter Generation

Authoring characters, grievances, locations, and possessions requires strict YAML frontmatter that adheres to Zod validation rules (such as bounded scalars from $0.0$ to $1.0$, explicit locomotion enums, and equip-slot capacities).

A `goblin-lore new` CLI command can automate this process interactively:

* **Interactive Type Scaffolding:** Instead of copying and modifying `_template.md` manually, the CLI prompts the writer through required schemas (e.g., selecting an allowed `locomotion_baseline`, setting `escalation_ceiling`, and defining baseline stat distributions).


* **Pre-Flight Scalar Validation:** Validates that entered condition severities or equip capacities fit their allowed ranges before the file is even written to disk, preventing runtime parse errors during compilation.


* **Foreign-Key Typeaheads:** When authoring a grievance, the CLI dynamically scans `/characters` and `/locations` to auto-complete participant lists (`participants_primary`) and spatial anchors, preventing typos that cause Pass 2 dangling pointer failures.



---

### 2. Unified Verification & Single-Command "Gate 0" Audit

Verifying the corpus currently requires executing separate commands to compile JSON, test graph integrity, check for voice bleed, and verify git diffs.

A `goblin-lore check` or `goblin-lore audit` command can consolidate this gauntlet into a single pre-commit check:

* **One-Step Compiler & Integrity Sweep:** Chains Pass 1 (Zod validation), Pass 2 (relational foreign keys and DFS grievance DAG cycle detection), and Vitest execution in memory.


* **Automated Voice-Bleed Linting:** Runs `scripts/lint-voice.ts` to flag if a character’s authored dialogue cues, signature tics, or callback phrases have drifted too close to another character's voice.


* **The Zero-Drift Tripwire:** Executes the equivalent of `git diff --exit-code compiled/` immediately after building to verify that `compiled/bible-state.json` matches the authored Markdown files byte-for-byte.



---

### 3. Corpus Health & Distribution Telemetry

In procedural storytelling, narrative engines stall when the corpus develops blind spots (such as characters who lack active grievances or over-concentrated conflict themes).

A `goblin-lore status` or `goblin-lore stats` command provides bird's-eye corpus analytics:

* **Ensemble Balance Tracking:** Directly surfaces "which characters have zero grievances" or are under-represented across active conflict pairs.


* **Grievance Category Distribution:** Scans the active grievance directories (`resource-hoarding.md`, `status-anxiety.md`, `secret-keeping.md`, `generational.md`, etc.) to flag categories that lack sufficient escalation depth or variety.


* **DAG Depth Inspection:** Traces grievance spawn chains (`spawns_on_max_escalation`) to report maximum chain depth, average branch factors, and terminal exit nodes.



---

### 4. Guardrailed Lifecycle & Retirement Management

When characters die, depart, or grievances are resolved, removing their records outright risks breaking historic dependencies or leaving active references stranded.

A `goblin-lore retire <entity_id>` command streamlines this transition safely:

* **Automated Migration to `_retired/`:** Safely relocates the target file from active directories into `/characters/_retired/` or `/grievances/_retired/`.


* **Orphan & Debt Pre-Check:** Before moving the entity, the CLI sweeps the remaining active corpus to warn if an active character still holds leverage tokens (`strings_held_over`) or active grievances tied to the retiring entity, prompting the author to reassign or resolve those debts first.


* **Automatic Cache & Hash Resealing:** Immediately re-runs `scripts/compile.ts` to update `compiled/bible-state.json` and stamp a fresh SHA-256 state seal.



---

### Architectural Boundary: Lightweight CLI vs. Sower Terminal OS

It is critical that a CLI built for `goblin-lore` remains a **standard, lightweight Node CLI** (using `@clack/prompts` or standard command flags) rather than an interactive full-screen `blessed` application.

Full-screen curses/blessed interfaces are explicitly reserved for `worker-sower-engine`'s Showrunner Terminal OS. If `goblin-lore` were to implement a full-screen terminal environment, it would introduce unnecessary runtime dependencies, complicate automated CI/CD pipeline execution, and create terminal alternate-screen buffer collisions. Keeping the `goblin-lore` CLI focused on authoring shortcuts, corpus linting, and health reporting maintains the strict boundary between compile-time canon law and runtime simulation.### 1. The Ergonomics of Authoring: The CLI Scaffolding Engine

In an event-sourced narrative compiler, authorial intent must be translated into strictly typed data without placing undue cognitive burden on writers. When authors must write raw YAML frontmatter by hand, human error causes high friction: invalid indentation, misplaced delimiters, out-of-range scalars, and invalid foreign keys.

The command-line interface command `goblin-lore new [entity-type]` acts as an interactive scaffolding wizard. It converts interactive terminal prompts into machine-validated Markdown files. Built using lightweight terminal prompt libraries (such as `@clack/prompts`) rather than terminal curses applications that seize the screen buffer, the CLI collects attributes, runs real-time Zod validations, executes fuzzy foreign-key auto-completion, and writes valid Markdown files directly to disk.

```
                     GOBLIN-LORE INTERACTIVE CLI PIPELINE
                                       │
                      $ goblin-lore new grievance
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. IN-MEMORY GRAPH INDEXING: Read active /characters, /locations, /possessions│
│ 2. GUIDED INTERVIEW: Interactive prompts for Category, Surface, Underneath  │
│ 3. FUZZY FOREIGN-KEY TYPEAHEAD: Typed selection of participants & anchors    │
│ 4. PRE-FLIGHT CAPABILITY SAT: Immediate validation of scalars & capacities   │
│ 5. ATOMIC DISK WRITE: Generates byte-0 YAML frontmatter + structured body   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
                   corpus/grievances/resource_hoarding/spoon_credit.md

```

---

### 2. The Four Rules of Scaffolded Frontmatter

Every file generated by `goblin-lore new` must conform to strict compiler rules:

#### Rule 1: The Byte-Zero Delimiter Invariant

The frontmatter delimiters (`---`) must begin at byte 0 of the generated file. If a Markdown title (`# Character: Bog`) or even a single blank newline precedes the opening delimiter, standard YAML parsers like `gray-matter` fail to identify the frontmatter block. The file is then treated as raw Markdown prose, causing the compiler to throw a validation failure. The scaffolding engine enforces this format programmatically.

#### Rule 2: Automated Sanitization and Citation Stripping

Human authors working with documentation tools or research workspaces often paste text contaminated with platform citation markers (e.g., `[cite: 1]`), non-standard line endings (`\r\n`), or smart quotes. If these enter the frontmatter, enum matches fail; if they enter body prose, they pollute prompting payloads. The scaffolding tool runs automated input sanitization filters that strip citation patterns and normalize text to standard UTF-8 before saving.

#### Rule 3: Separation of the Machine Rail and the Voice Rail

The scaffold enforces a clean divide between machine-readable mechanics and prompt-directed prose:

* **The Machine Rail (Frontmatter):** Contains bounded scalars, strict enumerations, cooldown cycle integers, and typed relationship pointers. Downstream runtime engines (`worker-sower-engine`) run set intersections on these fields without needing to parse natural language.


* **The Voice Rail (Body Markdown):** Contains narrative context, comedic setup, subtextual wounds, and literal callback phrases. These sections are injected into prompts to guide dialogue texture and scene blocking.



```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MACHINE RAIL (Frontmatter): id, category, participants, intensity_ceiling   │
├─────────────────────────────────────────────────────────────────────────────┤
│ VOICE RAIL (Body Markdown): Surface complaint, Underneath, Callback phrases │
└─────────────────────────────────────────────────────────────────────────────┘

```

#### Rule 4: Enforcing the Deletion Principle (Static vs. Runtime Separation)

A common mistake in narrative architecture is storing dynamic runtime state (such as cooldown timers, active escalation stages, and temporary statuses) directly inside the author-facing Markdown file. Doing so causes merge conflicts, commit churn, and continuous invalidation loops.

The scaffolding tool prevents this by omitting runtime fields. The generated Markdown files define append-only, human-reviewed static canon. Dynamic runtime state lives exclusively in external relational ledgers (such as Cloudflare D1 or SQLite):

```sql
-- Dynamic state is tracked outside the Markdown files
CREATE TABLE grievance_runtime_state (
  grievance_id TEXT NOT NULL,
  episode_id TEXT NOT NULL,
  current_intensity INTEGER NOT NULL,
  cooldown_remaining INTEGER NOT NULL,
  status TEXT CHECK(status IN ('DORMANT', 'ACTIVE', 'COOLING_DOWN', 'RESOLVED', 'SPAWNED_OUT')) NOT NULL,
  PRIMARY KEY (grievance_id, episode_id)
);

```

---

### 3. Type-Specific Scaffolding Implementations

The `goblin-lore new` interface branches into specialized interactive interview loops tailored to specific narrative entity domains.

#### A. Grievance Scaffolding (`goblin-lore new grievance`)

The system maintains a library of 40 to 60 grievances across 6 to 8 defined categories to support an entire season. The grievance scaffolding tool guides the creator through the required structural constraints:

```typescript
// CLI Grievance Scaffold Execution Flow
import * as p from '@clack/prompts';
import { GrievanceCategoryEnum, TypedSpawnTargetSchema } from '../schemas/grievance';

export async function scaffoldGrievance(corpusIndex: CorpusIndex) {
  p.intro('Scaffold New Grievance Node');

  const id = await p.text({
    message: 'Grievance ID (snake_case):',
    validate: (val) => /^[a-z0-9_]+$/.test(val) ? undefined : 'Must be snake_case slug.'
  });

  const category = await p.select({
    message: 'Category:',
    options: [
      { value: 'resource_hoarding', label: 'Resource Hoarding' },
      { value: 'status_anxiety', label: 'Status Anxiety' },
      { value: 'secret_keeping', label: 'Secret Keeping' },
      { value: 'generational_rift', label: 'Generational Rift' },
      { value: 'territorial_boundary', label: 'Territorial Boundary' }
    ]
  });

  // Dynamic foreign-key lookup against indexed character dossiers
  const primaryParticipants = await p.multiselect({
    message: 'Primary Participants (Pick 2):',
    options: Array.from(corpusIndex.characters.keys()).map(charId => ({
      value: charId,
      label: corpusIndex.characters.get(charId)!.name
    })),
    validate: (selected) => selected.length === 2 ? undefined : 'Must select exactly 2 participants.'
  });

  const intensityCeiling = await p.select({
    message: 'Intensity Escalation Ceiling:',
    options: [
      { value: 2, label: 'Stage 2 (Minor Friction)' },
      { value: 3, label: 'Stage 3 (Verbal Accusation)' },
      { value: 4, label: 'Stage 4 (Irreversible Exposure)' }
    ]
  });

  // Collect typed spawn target to eliminate untyped ID collisions
  const hasSpawn = await p.confirm({ message: 'Spawns downstream entity on max escalation?' });
  let spawnTarget = null;
  if (hasSpawn) {
    const targetType = await p.select({
      message: 'Spawn Target Type:',
      options: [
        { value: 'grievance', label: 'Child Grievance' },
        { value: 'secret', label: 'Epistemic Secret' }
      ]
    });

    const targetId = await p.text({ message: `Target ${targetType} ID:` });
    spawnTarget = { type: targetType, target_id: targetId };
  }

  // Four-Outcome Structural Verification
  p.note('Author the 4 required outcome sketches. Each must represent a distinct resolution state.');
  const outcomeWin = await p.text({ message: 'Outcome 1 (Uncontested Win):' });
  const outcomeCostly = await p.text({ message: 'Outcome 2 (Costly Compromise):' });
  const outcomeMutual = await p.text({ message: 'Outcome 3 (Mutual Escalation/Wound):' });
  const outcomeBackfire = await p.text({ message: 'Outcome 4 (Catastrophic Backfire):' });

  // Body prose hooks for the Voice Rail
  const surfaceComplaint = await p.text({ message: 'Surface Complaint (What they bicker about):' });
  const underneath = await p.text({ message: 'Underneath (Core wound / Real reason):' });
  const callbackPhrases = await p.text({ message: 'Callback phrases (Comma-separated):' });

  return renderGrievanceMarkdown({
    id, category, primaryParticipants, intensityCeiling, spawnTarget,
    outcomeWin, outcomeCostly, outcomeMutual, outcomeBackfire,
    surfaceComplaint, underneath, callbackPhrases: callbackPhrases.split(',').map(s => s.trim())
  });
}

```

The generated file cleanly separates the machine rail from the voice rail, setting up the structural fields required by the runtime:

```markdown
---
id: spoon_credit
title: "The Good Silver Spoon"
category: resource_hoarding
participants_primary: [char_bog, char_spleen]
participants_can_involve: [char_wart]
participants_cannot_involve: [char_mum_grissel]
intensity_floor: 1
intensity_ceiling: 4
cooldown_cycles: 3
decay_rate: slow
spawns_on_max_escalation:
  type: secret
  target_id: sec_bog_famine
outcomes:
  clean_win: "Bog is explicitly thanked before the family; recovers status."
  costly_compromise: "Spleen cleans the spoon, but demands half of next scrap ration."
  mutual_wound: "The spoon is dropped down the floorboard gap; lost to both."
  catastrophic_backfire: "Argument draws human footsteps above; attic stair locks down."
---

**Surface complaint:** Who gets credit for finding the good silver spoon.

**Underneath:** Bog feels perpetually uncredited for keeping the family fed—this is the shallow entry point to his core wound.

**Callback phrases:**
- "the spoon"
- "who really found it"
- "credit where it's due"

```

#### B. Character Dossier Scaffolding (`goblin-lore new character`)

Character dossiers are scaffolded across three isolated, strongly typed state vectors: **Somatic**, **Logistical**, and **Epistemic**:

```
                     CHARACTER STATE VECTOR SCAFFOLDING
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│    SOMATIC VECTOR    │    │  LOGISTICAL VECTOR   │    │   EPISTEMIC VECTOR   │
├──────────────────────┤    ├──────────────────────┤    ├──────────────────────┤
│ • Locomotion baseline│    │ • Maximum hand count │    │ • Secrets held       │
│ • Banned kinetic     │    │ • Worn / Held slots  │    │ • Leverage strings   │
│   verbs (motor mask) │    │ • Mass capacities    │    │ • Banned attenuation │
│ • Active conditions  │    │                      │    │   tokens (subtext)   │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘

```

* **Somatic Vector Construction:** Prompts for mobility constraints (`locomotion_baseline: NEUROPATHY_SHUFFLE` or `FLUID_ASYMMETRIC_LIMP`) and generates the appropriate `banned_kinetic_verbs` array (`["sprint", "vault", "leap"]`). If a nerve condition is attached, it prompts for the anatomical locus and severity rating ($0.0 \le s \le 1.0$).


* **Logistical Inventory Construction:** Initializes empty equip slots (`worn`, `held`, `carried`, `cached`) and asks the author for base carrying capacities.


* **Epistemic Horizon Construction:** Sets up leverage tracking (`strings_held_over`) and defines attenuation tokens—words the character is barred from speaking aloud, forcing thematic subtext through physical proxies.



---

### 4. Dynamic Foreign-Key Typeaheads and Graph Linking

A primary failure mode in raw Markdown authoring is the accidental creation of dangling pointers (referencing an item, location, or actor slug that does not exist in the corpus).

The scaffolding CLI resolves this by keeping a live index of the project graph in memory:

```
                     DYNAMIC FOREIGN-KEY TYPEAHEAD
                                   │
              User inputs: "loc_" during location prompt
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │ Scan index:                                         │
        │ • loc_attic_stair                                   │
        │ • loc_pantry_wall                                   │
        │ • loc_warm_pipe                                     │
        └──────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
                     Valid Foreign Key Selected
                  (Dangling Pointer Prevented at T_0)

```

1. **Pre-Indexing Phase:** When `goblin-lore new` boots, it scans `/characters`, `/locations`, `/possessions`, and `/world`, loading valid entity identifiers into memory.


2. **Typeahead Interception:** When the author reaches fields that point to other entities (e.g., `linked_location`, `primary_participants`, `contested_by`), the CLI presents an interactive autocomplete list.


3. **Namespaced Reference Enforcement:** If the user enters a child spawn target, the CLI requires an explicit namespace prefix (`grievance:` or `secret:`). This eliminates untyped identifier ambiguity where the compiler cannot distinguish whether a slug represents an epistemic secret or an active grievance.



Catching broken references during interactive scaffolding eliminates Pass 2 compilation failures later on, keeping invalid references from ever reaching the repository.

---

### 5. Pre-Flight Capability SAT Checking ($T = 0, \$0.00$)

The scaffolding CLI enforces physical constraints at the moment of authoring using propositional satisfiability (SAT) checks.

If a writer configures a character with a severed right arm nerve injury (`BRACHIAL_PLEXUS_RIGHT`, severity $1.0$), the CLI computes available physical resources in real time:

$$\text{Available Hands} = 2.0 - \text{hand\_impairment\_penalty} = 2.0 - 1.0 = 1.0$$

If the writer attempts to equip a two-handed tool or allocate items to both `HELD_PRIMARY` and `HELD_OFFHAND`, the CLI prevents the allocation immediately:

```bash
$ goblin-lore new character

? Select active conditions: BRACHIAL_PLEXUS_RIGHT (Severity: 1.0)
? Configure default held items:
  ❯ [X] item_kerosene_lantern (Occupies: 1 Hand)
  ❯ [X] item_heavy_wrench     (Occupies: 1 Hand)

[CAPABILITY ERROR]: Limb capacity exceeded.
Character has 1.0 functional hands available due to active condition (BRACHIAL_PLEXUS_RIGHT).
Attempted allocation requires 2.0 hands. Deselect an item to continue.

```

This check runs locally in memory before the file is written to disk. It catches impossible physical configurations at $T_0$ for zero cost, preventing runtime generation errors and pipeline halts later in production.

---

### 6. Verification and Generation Output

Once all interactive interview stages complete and pre-flight validation passes, the scaffolding engine writes the file to disk using atomic filesystem operations:

```typescript
// Atomic write pipeline for generated entities
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function commitScaffoldedEntity(targetPath: string, fileContent: string) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write to unique temporary file to guarantee atomic filesystem replacement
  const tempPath = `${targetPath}.tmp_${crypto.randomUUID()}`;
  fs.writeFileSync(tempPath, fileContent, 'utf8');
  fs.renameSync(tempPath, targetPath);

  console.log(`[SCAFFOLD SUCCESS]: Created valid entity file at ${targetPath}`);
}

```

By combining interactive CLI interviews, dynamic foreign-key typeaheads, and pre-flight capability checks, `goblin-lore new` ensures that human writers produce well-formed, schema-compliant Markdown files. This structured authoring loop protects the pipeline's core guarantees—eliminating runtime syntax errors, preventing orphaned foreign keys, and upholding the integrity of the story universe.### The Mandate of Gate 0: Economics of $T_0$ ($0.00$)

In generative media production, downstream errors scale exponentially in cost. A narrative contradiction, broken foreign key, or anatomical impossibility that slips past the lore repository and enters scene simulation burns language model tokens, local or serverless GPU compute, speech synthesis cycles, and human editorial time. A defect caught at $T_0$—inside the lore repository before any runtime code executes—costs $\$0.00$.

Currently, verifying `goblin-lore` requires executing a disjointed series of ad-hoc scripts and terminal commands:

```bash
npx tsx scripts/compile.ts
npx tsx scripts/lint-voice.ts
npx vitest run tests/integrity.test.ts
git diff --exit-code compiled/

```

If a contributor runs the compiler but skips the voice linter, or edits Markdown without running the compilation script, invalid or uncompiled state enters the repository. The **Unified Verification & Single-Command "Gate 0" Audit** (`goblin-lore check` or `goblin-lore audit`) packages these fragmented verification passes into an atomic, deterministic quality gate. It enforces the foundational ordering principle of the verification gauntlet: **cheapest and most deterministic checks execute first; dynamic and compute-intensive checks execute last**.

```
                     GOBLIN-LORE UNIFIED GATE 0 AUDIT
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 0: STATIC SYNTAX & ZERO-TOKEN LINT                               │
│ • Byte-zero frontmatter delimiter verification                         │
│ • Empty-hash guard (e3b0c442...) & tsc --noEmit type soundness          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Exit 0
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: INVARIANT & SOMATIC BOUNDS (PASS 1)                           │
│ • Zod scalar range enforcement (0.0 <= severity <= 1.0)                │
│ • Locomotion enum validation & kinetic verb blacklists                 │
│ • Logistical mass & hand capacity SAT verification                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Exit 0
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: RELATIONAL INTEGRITY & CAUSAL DAG (PASS 2)                    │
│ • O(1) foreign-key cross-referencing across corpus maps                │
│ • Three-color DFS acyclicity sweep on spawns_on_max_escalation         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Exit 0
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: STYLOMETRIC & VOICE-BLEED LINTING                             │
│ • Cross-character callback phrase collision audit                      │
│ • Signature vocabulary density & banned token leak detection           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Exit 0
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: DETERMINISTIC SEALING & DRIFT TRIPWIRE (PASS 3)               │
│ • Lexicographical key sorting & SHA-256 state seal generation         │
│ • In-memory buffer comparison against compiled/bible-state.json        │
│ • git diff --exit-code assertion (Catches uncompiled & spoofed edits)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Exit 0
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 5: REGRESSION BATTERY & DEFECT ESCAPE SENTRY                     │
│ • In-memory execution of tests/escapes/*.test.ts                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼ ALL STAGES PASS             ▼ ANY STAGE FAILS
           [ EXIT 0: GATE CLEARED ]      [ FATAL COMPILER HALT ]
           • SHA-256 State Hash Printed  • process.exit(1)
           • Unlocks Simulation Runtimes • Diagnostic coordinate emitted

```

---

### The Five-Stage Verification Pipeline

When executed, `goblin-lore audit` mounts the raw Markdown dossiers in memory and runs five sequential evaluation stages. If any stage fails, the process halts immediately with exit code 1, emits a diagnostic error ticket, and blocks subsequent stages.

#### Stage 0: Static Syntax & Zero-Token Linting

Before executing validation rules, the engine verifies file structure and type definitions:

* **Byte-Zero Delimiter Verification:** Asserts that every Markdown entity begins with `---` at byte 0. Files with leading whitespace or Markdown headers preceding the frontmatter block are flagged before schema validation runs.


* **Zero-Byte Empty-Hash Guard:** Flags corrupted, unwritten, or empty files by asserting against the known SHA-256 empty hash (`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`).


* **TypeScript Soundness:** Runs `tsc --noEmit` across schemas and compiler harnesses to verify type soundness without compiling output JavaScript.



#### Stage 1: Pass 1 Invariant Enforcement (Shape & Somatics)

The CLI parses entity frontmatter via `gray-matter` and validates individual entities against strict Zod contracts:

* **Scalar Clamps:** Asserts that condition severities and somatic debuffs remain within $[0.0, 1.0]$, escalation intensities fall within $[1, 5]$, and cooldown timers are positive integers.


* **Somatic Motor Masking:** Validates that `locomotion_baseline` values belong to declared enums (e.g., `NEUROPATHY_SHUFFLE`, `FLUID_ASYMMETRIC_LIMP`) and compiles the corresponding `banned_kinetic_verbs` arrays.


* **Logistical SAT Solver:** Computes hand and carrying capacities. If an entity dossier attempts to equip items requiring more limbs than their active somatic injuries permit, the pre-flight check halts compilation.



#### Stage 2: Pass 2 Relational Integrity & Causal DAG Traversal

The engine builds an in-memory graph of all parsed entities to verify relational consistency:

* **Referential Integrity:** Performs lookups across character, grievance, possession, and location indices. Every inventory item, participant, spatial node, or leverage target must resolve to an active entity file. References to retired entities or missing files trigger immediate dangling-pointer exceptions.


* **Causal DAG Verification:** Traces grievance progression links (`spawns_on_max_escalation`) using a Three-Color Depth-First Search (WHITE = unvisited, GRAY = on recursion stack, BLACK = cleared). Any cyclic path ($A \to B \to C \to A$) triggers a fatal cycle-detected error, preventing infinite escalation loops during simulation.



#### Stage 3: Stylometric & Voice-Bleed Linting

The CLI executes voice consistency and dialogue boundary checks across character dossiers:

* **Callback Phrase Collisions:** Audits declared `callback_phrases` across all active character dossiers. If two characters claim overlapping signature idioms, the audit flags the collision to preserve distinct vocal styles.


* **Banned Attenuation Tokens:** Scans character subtext constraints. Characters configured with specific emotional traumas are barred from using explicit emotional labels, forcing downstream language models to communicate status through material proxies rather than direct exposition.



#### Stage 4: Deterministic Sealing & The Git Drift Tripwire

The CLI evaluates serialization stability and verifies committed state:

* **Canonical Key Normalization:** Recursively sorts all keys alphabetically, eliminating insertion-order variances across different operating systems.


* **Environmental Purity Assertion:** Asserts that no volatile environmental values (such as `Date.now()`, `Math.random()`, or dynamic timestamps) pollute the output.


* **The In-Memory Drift Tripwire:** The CLI calculates the SHA-256 root hash ($H_{\text{root}}$) of the compiled dataset and compares the serialized buffer directly against the committed `compiled/bible-state.json` on disk:


```typescript
const diskState = fs.readFileSync('compiled/bible-state.json', 'utf8');
const memoryState = serializeCanonicalJSON(compiledStateEnvelope);

if (diskState !== memoryState) {
  console.error('[DRIFT_TRIPWIRE]: compiled/bible-state.json diverges from source Markdown.');
  console.error('Run "goblin-lore compile" and commit the updated artifact.');
  process.exit(1);
}

```




This check catches both uncompiled source edits and manual tampering with the compiled JSON.

#### Stage 5: The Defect Escape Sentry

The final stage executes the cumulative regression battery in `tests/escapes/*.test.ts`:

* Every historical bug or narrative contradiction that escapes to downstream runtimes is formalized into a permanent regression test.


* The audit command executes these test suites directly in memory via the Vitest programmatic runner, verifying that past defects cannot recur.



---

### Ephemeral Sandboxing & Trust Boundary Isolation

A critical vulnerability in automated governance pipelines occurs when verification tools run agent-authored code within credentialed environments. If an autonomous coding agent (e.g., Jules) mutates `package.json` scripts or introduces a malicious pre-test hook, running `npm test` on a runner with repository secrets can result in credential exfiltration.

`goblin-lore audit` avoids this vulnerability by strictly separating scope verification from execution:

```
               TRUST BOUNDARY & SANDBOX ISOLATION
                                │
               Untrusted Branch / PR Diff
                                │
                                ▼
┌──────────────────────────────────────────────────────────────┐
│ HOST ENGINE: READ-ONLY SCOPE AUDIT (Pre-Execution)           │
│ • Asserts PR touches ONLY allowed paths (/corpus/**)         │
│ • Rejects any modification to package.json, workflows, or CI │
└───────────────────────────────┬──────────────────────────────┘
                                │ Scope Pass
                                ▼
┌──────────────────────────────────────────────────────────────┐
│ EPHEMERAL ZERO-CREDENTIAL SANDBOX                            │
│ • Network-isolated container (No outbound sockets)           │
│ • Zero API secrets, zero environment tokens                  │
│ • Mounts read-only copy of repository scratchpad             │
│ • Executes: goblin-lore audit (Stages 0–5)                   │
└───────────────────────────────┬──────────────────────────────┘
                                │
                  ┌─────────────┴─────────────┐
                  ▼ Exit 0                    ▼ Non-Zero Exit
        [ PROCEED TO STAGING ]       [ REJECT & LOG DIAGNOSTIC ]

```

1. **Pre-Execution Scope Audit:** Before the audit runs, the host engine verifies the branch diff against an allowed path list. If an untrusted agent modifies `package.json`, workflow YAML files, or root configuration files, the audit engine halts immediately.


2. **Credential-Free Containerization:** The execution of `goblin-lore audit` occurs inside an ephemeral container stripped of environment variables, cloud credentials, and outbound network access. The audit processes static Markdown input and returns an exit code and structured log output, preventing malicious code from accessing external resources.



---

### Diagnostic Telemetry & Error Formatting

When validation fails, `goblin-lore audit` avoids generic stack traces. Instead, it outputs a structured diagnostic coordinate that identifies the offending file, line numbers, and constraint rule:

```json
{
  "gate": "GATE_0_AUDIT",
  "stage": 2,
  "status": "FAILED",
  "timestamp": 1774118172,
  "failure_class": "CYCLE_DETECTED",
  "coordinate": {
    "file_path": "corpus/grievances/resource_hoarding/spoon_credit.md",
    "entity_id": "grv_spoon_credit",
    "line_range": [14, 18]
  },
  "violation_details": {
    "rule_id": "DAG_ACYCLICITY",
    "message": "Circular spawn cycle detected across 3 grievance nodes.",
    "causal_trace": [
      "grv_spoon_credit",
      "grv_iron_pot_scandal",
      "grv_pantry_theft",
      "grv_spoon_credit"
    ]
  },
  "remediation_hint": "Sever the spawns_on_max_escalation link in grv_pantry_theft.md to restore an acyclic DAG."
}

```

In local interactive terminal sessions, the CLI presents this data via clean, human-readable terminal output:

```text
✖ [STAGE 2: RELATIONAL INTEGRITY & CAUSAL DAG] FAILED
  File: corpus/grievances/resource_hoarding/spoon_credit.md
  Rule: DAG_ACYCLICITY (Circular escalation chain)
  
  Escalation Cycle Trace:
  grv_spoon_credit ──► grv_iron_pot_scandal ──► grv_pantry_theft ──► grv_spoon_credit
  
  Remediation: Edit grv_pantry_theft.md to remove circular spawn target.
  Audit halted at T0 ($0.00 compute spent).

```

---

### Operational Comparison: Fragmented vs. Unified Gate 0 Audit

| Verification Attribute | Fragmented Tooling (Pre-CLI)

 | Unified Gate 0 CLI (`goblin-lore audit`)

 |
| --- | --- | --- |
| **Execution Command** | 4 separate scripts (`compile.ts`, `lint-voice.ts`, Vitest, git diff)

 | Single command (`goblin-lore audit`)

 |
| **Execution Speed** | 8 to 14 seconds (repeated Node process boots)

 | $< 1.2\text{ seconds}$ (single in-memory runtime)

 |
| **Cost at Detection** | $\$0.00$ (if run manually before push)

 | Guaranteed $\$0.00$ (enforced via local pre-commit hooks)

 |
| **Execution Sandboxing** | Runs on host with access to local environment variables

 | Runs in an ephemeral, credential-free sandbox

 |
| **Uncompiled Drift Detection** | Requires remembering to run `git diff --exit-code`<br> | Integrated Stage 4 memory-buffer comparison

 |
| **Cycle Detection** | Caught only during full compilation

 | Dedicated DFS graph sweep with explicit causal trace output

 |
| **Downstream Impact** | Broken references leak into scene simulation

 | Guaranteed block before scene AST generation or GPU spend

 |

By uniting syntax verification, invariant bounds checking, relational integrity, causal DAG analysis, voice consistency, drift detection, and regression testing under a single command, `goblin-lore audit` operationalizes the Gate 0 verification boundary. It ensures that no invalid narrative state can advance into downstream simulation or GPU rendering, defending project economics and maintaining canon integrity.**Corpus Health and Distribution Telemetry** represents the diagnostic layer of the `goblin-lore` compilation pipeline (`scripts/compile.ts` / `@snailicid3/consumer-npm`). While Pass 1 and Pass 2 evaluate deterministic syntactic and structural validity—confirming that scalars are bounded, limbs are conserved, and foreign keys do not dangle—they operate under a profound blind spot: **a narrative corpus can be 100% syntactically valid while being procedurally unplayable**.

If an authored canon contains valid schemas but concentrates 85% of its conflicts on a single character pairing, starves secondary characters of active tensions, or constructs grievance escalation paths that trigger too early or stall indefinitely, runtime simulation engines like `worker-sower-engine` fail. The simulator enters procedural starvation, draws repetitive scene pairings, or exhausts available conflict lotteries mid-season.

Integrating distribution telemetry into the CLI via `goblin-lore stats` and `goblin-lore health` provides the structural observability needed to audit ensemble balance, causal pacing, and graph density before downstream engines burn compute or API calls.

```
                 GOBLIN-LORE CORPUS HEALTH TELEMETRY PIPELINE
                                       │
                      $ goblin-lore health --detailed
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. COMBINATORIAL COVERAGE: Evaluates N(N - 1) / 2 dyadic character pairs   │
│ 2. CATEGORICAL EQUILIBRIUM: Audits 6–8 categories & 10–15% tonal caps       │
│ 3. TOPOLOGICAL DEPTH (δ): Maps macro-pacing curves & escalation windows    │
│ 4. GRAPH DEGREE CENTRALITY: Separates Monolithic Spines from Dead Lore     │
│ 5. HEADLESS MONTE CARLO HARNESS: Simulates 1,000 selection lottery cycles   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         ▼ PASS                      ▼ WARN / FAIL
               [ System Schedulable ]      [ STRUCTURAL SKEW DETECTED ]
               • Balanced Dyads            • Starved Ensemble Nodes
               • Pacing Cadence Aligned    • Monolithic In-Degree Spines
               • Boredom Index < 0.65      • Premature Climaxes Flagged

```

---

### 1. Combinatorial Dyadic Coverage & Ensemble Balance

Procedural storytelling collapses when conflict libraries fail to span the cast's relational surface area. For an ensemble of $N$ characters, the relational state space contains a fixed number of unique undirected dyads:

$$\text{Total Dyadic Channels} = \binom{N}{2} = \frac{N(N - 1)}{2}$$

For the core goblin litter (Bog, Spleen, Wart, Mum Grissel), $N = 4$, yielding $\frac{4 \times 3}{2} = 6$ interpersonal conflict channels:


$$\{\text{Bog} \leftrightarrow \text{Spleen}, \, \text{Bog} \leftrightarrow \text{Wart}, \, \text{Bog} \leftrightarrow \text{Mum Grissel}, \, \text{Spleen} \leftrightarrow \text{Wart}, \, \text{Spleen} \leftrightarrow \text{Mum Grissel}, \, \text{Wart} \leftrightarrow \text{Mum Grissel}\}$$

#### The Dyadic Sparsity Metric ($S_{\text{dyad}}$)

The health telemetry engine calculates the distribution of active grievances across every dyad. Let $G_{\{u, v\}}$ be the count of active grievances where characters $u$ and $v$ are declared as `participants_primary`:

$$S_{\text{dyad}}(\{u, v\}) = G_{\{u, v\}}$$

The CLI evaluates the **Dyadic Sparsity Metric**, warning if any pairing falls below the minimum viable conflict threshold ($G_{\min} < 3$):

```text
$ goblin-lore health --dyads

DYADIC CONFLICT INCIDENCE MATRIX (N = 4, Channels = 6)
─────────────────────────────────────────────────────────────────────────────
Pairing                        Active Grievances   Coverage Status   Cooldown Risk
─────────────────────────────────────────────────────────────────────────────
char_bog    ◄──► char_spleen         18            OVERSATURATED     LOW
char_bog    ◄──► char_wart            8            HEALTHY           LOW
char_spleen ◄──► char_wart            5            OPTIMAL           MEDIUM
char_bog    ◄──► char_grissel         3            MINIMAL           HIGH
char_spleen ◄──► char_grissel         1            STARVED           CRITICAL
char_wart   ◄──► char_grissel         0            BLIND SPOT        FATAL
─────────────────────────────────────────────────────────────────────────────
[HEALTH WARNING]: Dyad {char_wart, char_grissel} has ZERO registered grievances.
Simulation lottery cannot generate 2-character scenes for this pair without fallbacks.

```

#### Asymmetric Leverage Vectors

Because `goblin-lore` models relationships as directional leverage vectors rather than symmetric friendships, the health engine tracks directed edges $(u \to v \neq v \to u)$ through `epistemic.strings_held_over` and `role_given / role_received`.

If character $A$ holds 12 leverage strings over character $B$, but character $B$ holds 0 over character $A$, the relationship represents a mechanical dead end. In high-friction duel mechanics, character $B$ has zero counter-play currency to spend during mechanical duels, forcing predictable simulation outcomes (Clean Wins for $A$) and eliminating dramatic tension. The CLI flags leverage asymmetries exceeding a ratio of $4:1$.

---

### 2. Categorical Equilibrium & Tonal Allocation

The system mandates an authored scale of **40 to 60 grievances distributed across 6 to 8 functional categories** to support a multi-episode season:

* `resource_hoarding`

* `status_anxiety`

* `secret_keeping`

* `generational_rift`

* `territorial_boundary`

* `loyalty_tests`

* `domestic_sabotage`

A healthy library requires roughly **5 to 8 entries per category** to prevent thematic exhaustion. If a category drops below 4 entries, runtime cooldowns (`cooldown_cycles: 3`) lock the remaining nodes, forcing the lottery engine to over-index on unrelated themes.

```
                    CATEGORICAL GRIEVANCE EQUILIBRIUM
  25 ┌──────────────────────────────────────────────────────────────┐
     │                                                              │
  20 │  ██████                                                      │
     │  ██████                                                      │
  15 │  ██████                                                      │
     │  ██████                                                      │
  10 │  ██████          ██████          ██████                      │
     │  ██████  ██████  ██████  ██████  ██████  ░░░░░░              │
   5 │  ██████  ██████  ██████  ██████  ██████  ░░░░░░  ▒▒▒▒▒▒      │
     │  ██████  ██████  ██████  ██████  ██████  ░░░░░░  ▒▒▒▒▒▒      │
   0 └──┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴────┘
        ResHrd  StatAnx SecKeep  GenRift TerrBnd LoyTest TonOver
        (n=22)   (n=7)   (n=9)   (n=6)   (n=8)   (n=3)   (n=8)
        [SKEW]   [OK]    [OK]    [OK]    [OK]   [DEFICIT] [14.5%]

```

#### Tonal Override Caps (The 10–15% Farce Ceiling)

The narrative engine permits special "tonal overrides"—entries that deliberately suspend heavy existential trauma (`underneath = "There genuinely isn't one"`) in favor of petty slapstick or pure domestic farce. However, if farce proliferates, the dramatic stakes of the universe degrade.

The telemetry CLI calculates the exact proportion of tonal overrides across the corpus:

$$\text{Ratio}_{\text{tonal}} = \frac{\vert{}\{g \in \mathcal{G} \mid g.\text{tonal\_override\_eligible} = \text{true}\}\vert{}}{\vert{}\mathcal{G}\vert{}}$$

* **Optimal Range:** $0.10 \le \text{Ratio}_{\text{tonal}} \le 0.15$ (4 to 9 entries in a 55-grievance library).


* **Breach Threshold:** If $\text{Ratio}_{\text{tonal}} > 0.15$, the CLI throws a structural lint warning. It alerts the writer that the series is drifting from grounded survival drama into disconnected farce.



#### Intensity Ceiling Distribution

Grievances specify an escalation ceiling (`intensity_ceiling`) bounded between Stage 1 (micro-friction) and Stage 5 (irreversible structural fracture). The CLI plots an intensity histogram to ensure the corpus does not skew exclusively toward low-stakes bickering (Stage 1–2) or climactic terminal blowouts (Stage 4–5):

| Escalation Ceiling | Functional Role | Target Percentage | Measured Corpus Count | Health Status |
| --- | --- | --- | --- | --- |
| **Stage 1–2**<br> | Episodic texture, quiet openings, near-miss cooldowns | $30\% - 40\%$ | 18 / 52 ($34.6\%$) | **HEALTHY** |
| **Stage 3**<br> | Standard episode midpoints, verbal accusations | $35\% - 45\%$ | 22 / 52 ($42.3\%$) | **HEALTHY** |
| **Stage 4–5**<br> | Season arcs, spine events, secret unlocks | $15\% - 25\%$ | 12 / 52 ($23.1\%$) | **HEALTHY** |

---

### 3. Causal Pacing & Topological Escalation Cadence

A narrative corpus is not an unorganized bag of conflicts; it forms a Directed Acyclic Graph (DAG) whose paths represent the chronological momentum of a season. Health telemetry evaluates the **Topological Depth** ($\delta$) of every grievance chain to align the authored corpus with production pacing targets.

#### Reverse-Engineering the Escalation Math

If the showrunner's macro-arc mandates that a core narrative secret (`sec_bog_famine`) must trigger its climactic reveal around **Cycle 32**, and the seed grievance (`grv_spoon_credit`) is introduced around **Cycle 3 to 5**, the math of the escalation ladder is strictly bounded:

$$\text{Available Escalation Window} = 32 - 4 = 28 \text{ cycles}$$

For a 4-stage escalation path where advancement occurs only upon successful duel resolution, the system must advance an escalation stage roughly once every 7 to 10 cycles:

$$\text{Target Selection Cadence} = \frac{28 \text{ cycles}}{4 \text{ stages}} \approx 7.0 \text{ cycles per stage}$$

```
             CYCLE 4                  CYCLE 12                 CYCLE 21                 CYCLE 30
      ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
      │ grv_spoon_credit   │──►│ grv_iron_pot       │──►│ grv_hoarding       │──►│ sec_bog_famine     │
      │ (Stage 1 Seed)     │   │ (Stage 2 Escalation│   │ (Stage 3 Exposure) │   │ (Max Climax Reveal)│
      └────────────────────┘   └────────────────────┘   └────────────────────┘   └────────────────────┘
                 ▲                        ▲                        ▲                        ▲
                 └────── Δ = 8 cycles ────┴────── Δ = 9 cycles ────┴────── Δ = 9 cycles ────┘

```

The health engine analyzes the declared `cooldown_cycles` and `decay_rate_per_episode` along this chain. If `grv_spoon_credit` has a cooldown of 8 cycles and a decay rate of 1 stage per unmentioned episode, the math proves that the grievance will continuously decay back to Stage 1 before it can reach Stage 4. The CLI flags this structural impossibility:

```text
[PACING AUDIT FAILURE]: Chain "spoon_credit -> famine_reveal" cannot reach Climax Target.
  • Required selection rate: Once every 7.0 cycles.
  • Cooldown ceiling: 6 cycles.
  • Decay velocity: 1 stage / cycle unselected.
  • Mathematical Outcome: Grievance decays to floor before cooldown clears. Target unreachable.
  • Remediation: Reduce cooldown_cycles to 3 or lower decay_rate to 'slow' (0.25/cycle).

```

---

### 4. Graph Centrality: Dead Lore vs. Monolithic Spines

When narrative state transitions are compiled, facts, props, and characters accumulate downstream dependencies. Health telemetry queries the relational dependency graph to compute the **In-Degree Centrality** ($k_{\text{in}}$) of every canonical entity:

$$k_{\text{in}}(e) = \vert{}\{s \in \text{Scenes} \mid s \text{ depends on } e\}\vert{}$$

```sql
-- The Passive Telemetry Metric: Read-only in-degree aggregation
CREATE VIEW v_fact_centrality_telemetry AS
SELECT 
  f.fact_id,
  f.entity_id,
  f.standing,
  f.last_reconsidered_at,
  COUNT(d.scene_id) AS downstream_dependent_scenes,
  (COUNT(d.scene_id) * LOG10(COUNT(d.scene_id) + 1.0)) * 
  ((CAST(strftime('%s', 'now') AS INTEGER) - f.last_reconsidered_at) / 86400.0) AS blast_radius_score
FROM canon_facts f
LEFT JOIN scene_fact_dependencies d ON f.fact_id = d.fact_id
GROUP BY f.fact_id;

```

The CLI parses this distribution to identify two critical narrative pathology extremes:

```
                          CANON IN-DEGREE DISTRIBUTION
  Entity
  Count
    │  [DEAD LORE TAIL]
    │  (k_in <= 1: 52% of corpus)
    │  Unreferenced worldbuilding clutter
    █
    █
    █
    █  █
    █  █  █
    █  █  █  █                                           [MONOLITHIC SPINE]
    █  █  █  █  █  ░  ░  ░  ░  ░  ░  ░  ░  ░  ░  ░  ░  ░ (k_in > 25: 1 prop)
    └───────────────────────────────────────────────────────────█─────────►
    0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 ...        38   In-Degree (k_in)

```

#### The Long Zero-Degree Tail (Dead Lore)

If 40% to 60% of entities in `/world/`, `/locations/`, or `/possessions/` exhibit an in-degree of $k_{\text{in}} \le 1$ across multiple episodes, the repository is congested with decorative worldbuilding clutter. These props and locations consume cognitive bandwidth during writing without creating causal impact on screen.

The CLI compiles an automated **Bible Pruning Queue**, identifying files that have never anchored a dramatic choice or condition check, allowing authors to deprecate or harvest them safely.

#### Hyper-Concentration (Monolithic Spines)

Conversely, if a single fact, injury, or prop accounts for $>80\%$ of all scene dependencies across an episode (e.g., `fact_the_brass_siphon` or Bog's damaged left leg), the story is logistically brittle:

* If an author or director edits that single entity, the recursive Common Table Expression (CTE) dependency query marks dozens of finished scenes as `DIRTY`.


* The **True Economic Blast Radius** skyrockets: 38 scenes across video, comic, and prose must be re-rendered or rewritten, turning a minor creative adjustment into thousands of dollars in compute and hours of editorial repair.


* The CLI alerts the creator to "split the spine" by creating alternative dramatic drivers.



#### Operational Coupling vs. Thematic Salience

A critical responsibility of health telemetry is distinguishing between graph coupling and dramatic depth:

| Centrality Profile | Graph Metric | Operational Reality | Thematic Reality |
| --- | --- | --- | --- |
| **High Centrality Spines**<br> | $k_{\text{in}} \ge 15$<br> | **High Liability:** Massive downstream invalidation risk if altered.

 | Often mundane logistics (e.g., carrying a shared lantern or keys).

 |
| **Low Centrality Nodes**<br> | $k_{\text{in}} \le 2$<br> | **Zero Liability:** Can be mutated or deleted with zero cascading rework.

 | Often foundational themes (e.g., *"The salt water table is rising"*).

 |

---

### 5. The Headless Monte Carlo Simulation Harness

The pinnacle of corpus health telemetry is the **Headless 1,000-Run Lottery Simulator**. Rather than launching the full `worker-sower-engine` (which invokes language models, parses Fountain screenplays, and formats ASTs), the CLI runs a pure mathematical simulation of the drama lottery in milliseconds for $\$0.00$:

```bash
$ goblin-lore simulate --cycles=50 --iterations=1000 --headless

```

```typescript
// scripts/simulateLottery.ts
export function runHeadlessSimulation(corpus: BibleCorpus, totalCycles = 50, iterations = 1000) {
  const selectionFrequency: Record<string, number> = {};
  const stagnationEvents: Array<{ cycle: number; reason: string }> = [];

  for (let run = 0; run < iterations; run++) {
    const runtimeState = initializeRuntimeLedger(corpus);

    for (let cycle = 1; cycle <= totalCycles; cycle++) {
      // 1. Filter out dormant, resolved, or cooldown-locked grievances
      const eligibleGrievances = corpus.grievances.filter(g => 
        runtimeState.getCooldown(g.id) === 0 && runtimeState.getStatus(g.id) === 'ACTIVE'
      );

      if (eligibleGrievances.length === 0) {
        stagnationEvents.push({ cycle, reason: 'ALL_GRIEVANCES_LOCKED_IN_COOLDOWN' });
        break;
      }

      // 2. Evaluate PRNG selection lottery based on relational tension & proximity
      const selected = executeDramaLottery(eligibleGrievances, runtimeState);
      selectionFrequency[selected.id] = (selectionFrequency[selected.id] || 0) + 1;

      // 3. Step mechanical outcome, advance escalation, and apply cooldowns
      runtimeState.advanceSimulationStep(selected);
    }
  }

  return computeTelemetryDigest(selectionFrequency, stagnationEvents, iterations);
}

```

#### The Multimodal Boredom Detector ($J_{\text{boredom}}$)

During the Monte Carlo simulation, the engine monitors scene diversity across a sliding window of three episodes. It measures the **Jaccard Similarity Coefficient** over four multimodal axes:

1. Active grievance slug


2. Physical location node ID


3. Mechanical outcome class (`CLEAN_WIN`, `COSTLY_WIN`, `MUTUAL_WOUND`, `BACKFIRE`)


4. Opening syntactic dialogue structure (Imperative vs. Interrogative vs. Expository)



$$J(A, B) = \frac{\vert{}A \cap B\vert{}}{\vert{}A \cup B\vert{}}$$

```text
               SLIDING WINDOW BOREDOM SAMPLER (3-EPISODE WINDOW)
  Ep 12: [grv_spoon_credit, loc_pantry,  MUTUAL_WOUND, IMPERATIVE]
  Ep 13: [grv_iron_pot,     loc_pantry,  MUTUAL_WOUND, IMPERATIVE]  ──► Jaccard: 0.60
  Ep 14: [grv_spoon_credit, loc_pantry,  COSTLY_WIN,   IMPERATIVE]  ──► Jaccard: 0.75 (BREACH!)
                                                                             │
                                                                             ▼
                                                                  [ SELECTION REJECTED ]
                                                                  Negative weights injected;
                                                                  Lottery re-rolled at T_0

```

If the composite similarity metric across the window exceeds **$0.65$**, the simulator halts and flags a **Procedural Boredom Breach**. The CLI telemetry output pinpoints which weight terms in the lottery selection formula are causing the generator to repeat the same domestic loops.

---

### 6. The CLI Telemetry Dashboard (`goblin-lore health`)

Executing `goblin-lore health` outputs a unified terminal dashboard summarizing all five diagnostic dimensions:

```text
================================================================================
                    GOBLIN-LORE // CORPUS HEALTH TELEMETRY
================================================================================
[CORPUS SIZE]         54 Grievances across 7 Categories (Target: 40–60)   [PASS]
[TONAL OVERRIDES]      7 of 54 (12.9%) Eligible for Farce (Target: 10–15%) [PASS]
[ENSEMBLE DYADS]       5 of 6 Channels Covered (1 Starved Dyad)           [WARN]
                       ► Missing coverage: {char_wart <-> char_grissel}
[PACING AUDIT]         Target Reveal Cycle: 32 // Simulated Mean: 31.4    [PASS]
                       ► Escalation Velocity: 1 stage / 7.8 cycles
[CENTRALITY SKEW]      Gini Coefficient: 0.42 (Healthy Graph Spread)       [PASS]
                       ► Highest In-Degree: item_silver_spoon (k_in = 22)
                       ► Pruning Queue: 14 zero-degree items in /possessions/
[1,000-RUN MONTE CARLO] Zero Stagnation Deadlocks Detected                [PASS]
                       ► Max Boredom Jaccard Peak: 0.58 (Threshold: 0.65)
================================================================================
STATUS: WARNINGS DETECTED (Exit 0 with Diagnostics)
Run "goblin-lore new grievance" to populate starved dyads before season freeze.

```

By translating static worldbuilding into concrete coverage matrices, pacing velocities, centrality graphs, and Monte Carlo distributions, Corpus Health Telemetry bridges the gap between authorial intent and machine execution. It ensures that the narrative database is structurally sound, paced for serialized tension, and balanced across the entire ensemble long before production compute is spent.**Guardrailed Lifecycle & Retirement Management** constitutes the archival and state-transition protocol of `goblin-lore` (packaged downstream as `@snailicid3/consumer-npm` and compiled via `scripts/compile.ts`). In an event-sourced narrative compiler, entities—characters, grievances, locations, and tracked possessions—cannot simply be deleted using raw filesystem commands like `rm`. Deleting an authored file destroys historical referential integrity, snaps causal Directed Acyclic Graph (DAG) escalation chains, and triggers unresolvable dangling-pointer exceptions across older episodes that depend on those entities for historical replay ($S_N = S_0 + \sum_{i=1}^{N} \Delta_i$).

Instead, the architecture models retirement as an **ontological phase shift**. When a character dies or departs, when a tool is destroyed, or when a long-standing grievance is permanently settled, the entity transitions from an active participant in simulation lotteries into a read-only historical anchor. The CLI command `goblin-lore retire <entity_id>` wraps this transition in automated pre-flight graph audits, interactive dependency reconciliations, and cryptographic state resealing.

```
                  THE ENTITY RETIREMENT LIFECYCLE
                                 │
                   $ goblin-lore retire char_wart
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: IN-MEMORY GRAPH INTERCEPTION                                  │
│ • Deep-scan foreign-key references (In-Degree Audit)                   │
│ • Detect held items, active leverage strings, unspawned DAG edges      │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: INTERACTIVE RECONCILIATION & SUCCESSION WIZARD                │
│ • Possessions: Reassign to surviving agent OR drop to Spatial Node     │
│ • Epistemic Debts: Liquidate, transfer, or convert to "Ghost Strings"  │
│ • Grievance Mutator: Retarget active tensions to residual guilt        │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: ATOMIC DIRECTORY MIGRATION                                    │
│ • Move: corpus/characters/wart.md ──► corpus/characters/_retired/      │
│ • Inject Tombstone Frontmatter: status: departed, cycle, reason        │
│ • Compile Negative Motor Mask: banned_kinetic_verbs: ["*"]             │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: COMPILATION & CANONICAL RESEALING                             │
│ • Execute scripts/compile.ts (Passes 1, 2, and 3)                      │
│ • Calculate True Economic Blast Radius & flag downstream scene dirt    │
│ • Seal updated compiled/bible-state.json with fresh SHA-256 hash       │
└────────────────────────────────────────────────────────────────────────┘

```

---

### 1. The `_retired/` Directory Quarantine Protocol

The primary structural safeguard against historical data corruption is the `_retired/` directory quarantine pattern. Every primary entity domain in the repository maintains a dedicated, isolated subdirectory for archived assets:

* `corpus/characters/_retired/`
* `corpus/grievances/_retired/`
* `corpus/possessions/_retired/`
* `corpus/locations/_retired/`

#### The Deletion Principle (Static Corpus vs. Dynamic Ledger)

Under the Deletion Principle, human-authored files are immutable per version. Deleting a file from the repository strips runtime engines of the metadata needed to understand past events. Moving an entity to `_retired/` preserves the full audit trail of past scenes while explicitly masking the entity from active simulation loops.

At runtime, mutable parameters (such as whether a grievance is currently cooling down or active) live in a relational state table (`grievance_runtime_state` in Cloudflare D1 or SQLite):

```sql
CREATE TABLE grievance_runtime_state (
  grievance_id TEXT NOT NULL,
  episode_id TEXT NOT NULL,
  current_intensity INTEGER NOT NULL,
  cooldown_remaining INTEGER NOT NULL,
  status TEXT CHECK(status IN ('DORMANT', 'ACTIVE', 'COOLING_DOWN', 'RESOLVED', 'SPAWNED_OUT')) NOT NULL,
  last_escalation_event TEXT,
  updated_at_ms INTEGER NOT NULL,
  PRIMARY KEY (grievance_id, episode_id)
);

```

When an entity is retired, its status in the runtime ledger transitions to `RESOLVED` or `SPAWNED_OUT`, while its static definition file is migrated to `_retired/` to lock it against future lottery selection.

#### Tombstone Metadata Injection

During migration, the CLI alters the entity's frontmatter, stamping it with immutable tombstone metadata:

```yaml
---
id: char_wart
name: Wart
status: departed                     # active -> departed | retired | destroyed
lifecycle:
  retired_at_cycle: 47               # Episode/Cycle boundary of departure
  departure_type: death              # death | estrangement | missing | destruction
  resolution_cause: "Sacrificed during attic threshold breach in EP104_SC02."
  canonical_tombstone_hash: "7f8b9a4c12..."
somatic:
  locomotion_baseline: null
  banned_kinetic_verbs: ["*"]        # Zero motor actions permitted downstream
logistical:
  worn: []
  held: []
  carried: []
---

```

The addition of `banned_kinetic_verbs: ["*"]` ensures that if an errant prompt or malfunctioning language model attempts to block movement for this character in any subsequent scene, Pass 1 invariant validation halts compilation immediately.

---

### 2. The `goblin-lore retire` Command & Graph Pre-Check

Running `goblin-lore retire <entity_id>` initiates an interactive interview loop built on `@clack/prompts`, preventing accidental dangling pointers before the file system is altered:

```typescript
// scripts/cli/retireEntity.ts
import * as p from '@clack/prompts';
import { loadCorpusIndex, compileAndSealState } from '../compile';

export async function executeRetireCommand(entityId: string) {
  p.intro(`Retirement Protocol: Initializing audit for [${entityId}]`);
  const corpus = await loadCorpusIndex();

  // 1. Foreign-Key Reference Audit
  const references = findActiveReferences(corpus, entityId);
  
  if (references.length > 0) {
    p.note(`Found ${references.length} active dependencies linked to ${entityId}.`);
    
    // Halt if critical unmanaged references exist
    for (const ref of references) {
      if (ref.type === 'HELD_POSSESSION') {
        const action = await p.select({
          message: `Item [${ref.sourceId}] is held by ${entityId}. Resolution:`,
          options: [
            { value: 'REASSIGN', label: 'Reassign to another character' },
            { value: 'DROP', label: 'Drop at character location (Spatial Node)' },
            { value: 'DESTROY', label: 'Retire item concurrently' }
          ]
        });
        await handlePossessionResolution(ref.sourceId, action, corpus);
      }

      if (ref.type === 'LEVERAGE_STRING') {
        const action = await p.select({
          message: `Character [${ref.sourceId}] holds leverage over ${entityId}:`,
          options: [
            { value: 'FORFEIT', label: 'Forfeit string (Drop leverage to 0)' },
            { value: 'CONVERT_GHOST', label: 'Convert to Unresolved Guilt String' }
          ]
        });
        await handleLeverageResolution(ref, action, corpus);
      }
    }
  }

  // 2. Perform Atomic Migration
  const entityType = determineEntityType(entityId);
  await migrateToRetiredDirectory(entityType, entityId);

  // 3. Trigger Resealing Pass
  p.note('Resealing canonical corpus and executing DAG cycle audit...');
  const newEnvelope = await compileAndSealState(corpus);
  
  p.outro(`Entity [${entityId}] retired cleanly. New Hash: ${newEnvelope.corpusHash.slice(0, 8)}`);
}

```

This interactive pre-check intercepts structural breaks at authoring time. If a writer attempts to retire a character who is currently marked as the sole owner of a critical plot tool (e.g., the good silver spoon), the CLI prevents the command from finishing until the tool is reassigned to another character or transferred to a spatial room node (`locations/`).

---

### 3. Causal DAG Progression & Grievance Succession

Retiring an entity has severe consequences for the narrative Directed Acyclic Graph (DAG). If a grievance relies on two specific characters (`participants_primary: [char_bog, char_wart]`) and one of them is moved to `_retired/`, the grievance becomes impossible for downstream drama lotteries to select.

The retirement engine handles this through two automated pathways:

#### A. Direct Archival Migration

If the grievance was tied entirely to that relationship and has reached its natural conclusion, the CLI moves the grievance dossier directly into `corpus/grievances/_retired/`. The grievance status in `grievance_runtime_state` updates to `RESOLVED`. This removes it from future scene candidate lotteries while preserving its escalation history and outcome text for analytical tooling.

#### B. Causal Mutation & Succession

If the conflict is load-bearing (possessing downstream child nodes in `spawns_on_max_escalation`), simply archiving it would break the DAG chain, stranding downstream secrets or climaxes:

```
  ORIGINAL ESCALATION PATH:
  grv_spoon_credit ──► grv_wart_theft ──► sec_bog_famine (BROKEN!)
                             │
                      (Wart Departs)
                             │
                             ▼
  MUTATED SUCCESSION PATH:
  grv_spoon_credit ──► grv_wart_legacy_guilt ──► sec_bog_famine (INTACT)

```

In this scenario, the CLI guides the writer through creating a **Successor Grievance Node**:

1. The participant list is re-anchored (e.g., Wart is replaced by Spleen, or the conflict shifts to Bog processing his guilt alone).
2. The `surface_complaint` updates from active bickering to an argument over the departed character's remnants.
3. The downstream pointer in `spawns_on_max_escalation` is transferred to the successor node, keeping the path to `sec_bog_famine` intact and maintaining the topological ordering of the season.

---

### 4. Conservation of Material Matter & Prop Realignment

A fundamental rule enforced by Pass 1 is the physical conservation of matter: items cannot vanish from the storyworld simply because their owner was retired.

When `goblin-lore retire` processes an agent with items in their logistical inventory (`worn`, `held`, `carried`), the CLI requires explicit spatial or agent realignment:

* **Spatial Dropping:** The item’s `current_location_id` is set to the spatial node where the character departed (e.g., `loc_attic_stair`), and its `owner` field is set to `null`. It becomes an unowned prop that any character entering that spatial node can discover and claim during scene generation.
* **Direct Transfer:** The item is assigned to a surviving character’s inventory, triggering an automated capacity check. If giving Bog the departed character's heavy lantern exceeds his logistical carrying capacity or available hand slots (accounting for active somatic debuffs), the CLI flags the transfer and requires a different recipient.

---

### 5. The True Economic Blast Radius & Invalidation Ingress

Retiring an entity does not merely alter future episodes; it risks invalidating pre-rendered or currently drafting scenes that assumed the entity was still available.

The retirement CLI integrates directly with the **Graph-Aware Cost Estimator**. Before committing a retirement to disk, the CLI executes a Common Table Expression (CTE) dependency traversal across the production ledger (Cloudflare D1 / SQLite) to calculate the downstream blast radius:

$$\text{Total Incident Cost} = \Delta C_{\text{root}} + \sum_{d \in \text{Downstream}} \Delta C_d \cdot \mathbf{1}_{\{d \text{ is rendered}\}} + \text{Labor Overhead}$$

```text
$ goblin-lore retire char_wart

⚠️  CANON MUTATION WARNING: RETIRING char_wart
─────────────────────────────────────────────────────────────────────────────
Target Cycle: Cycle 47 (Episode 104, Scene 02)
Downstream Invalidation Analysis:
  • 2 pre-drafted screenplay ASTs reference this character (Ep104_Sc04, Ep105_Sc01)
  • 1 already-rendered scene plate marked DIRTY (Ep104_Sc03)
  • Estimated Sunk Compute Loss: $6.42 USD
  • Estimated Human Rework: 3.5 Editorial Hours

Dependent Scene Manifest:
  [DIRTY]: scenes/ep104_sc03.json (Contains dialogue turn for char_wart)
  [DIRTY]: scenes/ep105_sc01.json (Contains prop reference to char_wart's thimble)

Are you sure you want to trigger this cascade? (y/N)

```

If the user confirms, the CLI marks those downstream scenes with `is_dirty = 1` in the database and triggers the **ClickUp Bridge Loop**. High-priority sprint tasks are automatically spawned in `02 - BLUEPRINT / Continuity/Canon (POD-11)` and `03 - GENERATIVE CORE / Scene Pods (POD-15)`, alerting directors and beat writers that those scenes require manual editorial conform before GPU rendering can resume.

---

### 6. Resealing, Merkle Updates, and the Git Drift Tripwire

Once dependencies are re-anchored, files moved, and tombstone metadata injected, the retirement pipeline executes its final compile and seal pass:

1. **Compiler Execution:** `scripts/compile.ts` executes in memory. Pass 1 validates that the retired entity conforms to tombstone schemas; Pass 2 verifies that no active entity references the retired slug across `/characters`, `/grievances`, or `/possessions`; and Pass 2 executes the three-color DFS check to ensure the mutated DAG remains acyclic.
2. **Deterministic Resealing:** The compiler recursively sorts all keys alphabetically, eliminates runtime timestamps, and computes a new SHA-256 state seal ($H_{\text{root}}$) over the canon envelope.
3. **Atomic Persistence:** The new state writes to `compiled/bible-state.json` via an atomic POSIX rename operation, updating the machine contract consumed by downstream simulation engines like `worker-sower-engine`.
4. **Git Verification:** The CLI checks `git diff --exit-code compiled/` to guarantee that the compiled JSON matches the modified Markdown source files bit-for-bit.

By replacing raw file deletion with structured directory quarantine, causal succession, prop conservation, and blast-radius estimation, Guardrailed Lifecycle Management ensures that narrative progression remains mathematically sound. The storyworld can evolve, characters can die, and eras can end without compromising historical continuity or corrupting the downstream rendering pipeline.To add characters, locations, and other world entities smoothly, the CLI should function as an **interactive schema wizard and foreign-key resolver** (`goblin-lore add <type>`) built on lightweight prompt libraries like `@clack/prompts`. Rather than letting authors edit raw Markdown files by hand, the CLI enforces Zod validation and graph linkage before the file touches disk.

### 1. Domain-Specific Scaffolding Commands

The CLI exposes typed generators that enforce the frontmatter/prose split for each domain:

* **Characters (`goblin-lore add character`):** Interactively prompts for identity, base stats (Spite, Cunning, Charm on a 1–5 scale), locomotion baselines (`locomotion_baseline`), and voice tags, establishing the initial somatic and epistemic profile.


* **Locations (`goblin-lore add location`):** Scaffolds geographic nodes by collecting `display_name`, `capacity_flavor` (e.g., `cramped`, `exposed`), and thematic category links.


* **Possessions & Grievances (`goblin-lore add possession | grievance`):** Prompts for physical weight classes, initial item custody, grievance escalation ceilings, and surface-vs-underneath conflict dynamics.



### 2. In-Memory Graph Autocomplete (Dangling-Pointer Prevention)

Before prompting the user, the CLI indexes the repository to provide real-time typeahead lookups:

* **Relational Typeaheads:** When authoring a character's `home_location` or setting a location's `adjacent_to` links, the CLI presents searchable lists of existing entity IDs, eliminating broken foreign keys at authoring time.


* **Bidirectional Edge Prompts:** Adding a location like `attic_stair.md` adjacent to `pantry_wall.md` prompts the CLI to ask: *"Update `pantry_wall.md` to link back to `attic_stair`?"*, keeping spatial adjacency graphs symmetrical without manual cross-file edits.



### 3. Immediate Invariant Evaluation & Editor Handoff

The CLI enforces physical laws and structural boundaries at $T_0$:

* **Pre-Flight Capability Verification:** Evaluates physical constraints immediately (e.g., rejecting an inventory allocation that demands three hands or a stat outside the 1–5 clamp) before generating the file.


* **Automated File Generation:** Writes the formatted YAML frontmatter starting at byte 0 and stubs the required prose headers (such as `## Wants (surface)`, `## Blind spot`, and `## Voice notes`).


* **Direct Editor Handoff:** Instantly launches the generated file inside `$EDITOR` (or VS Code via `code <filepath>`) positioned directly at the prose body for creative drafting.



### 4. Post-Write Compilation & Telemetry Check

Closing the file immediately triggers a silent verification pass:

* **Compile and Reseal:** The CLI executes `scripts/compile.ts`, runs the two-pass Zod validation, checks DAG acyclicity, and writes the updated SHA-256 state seal to `compiled/bible-state.json`.


* **Ensemble & Map Diagnostics:** Flags immediate world imbalances, such as an isolated location node with zero adjacent connections or a character introduced with zero initial grievances.



Would you like to start by defining the CLI interactive prompt flow for adding **characters** or **locations** first?The **Domain-Specific Scaffolding Commands** (`goblin-lore add <type>` or `goblin-lore new <type>`) constitute the interactive write-time boundary of the `goblin-lore` repository (packaged downstream as `@snailicid3/consumer-npm`). In an event-sourced narrative pipeline, authoring cannot be left to freeform markdown drafting. Manual authoring inevitably introduces syntactic syntax traps: frontmatter starting after line 0, missing vector attributes, uncalibrated scalar ranges, unlinked entity targets, and accidental runtime state mutations.

The scaffolding layer operates on an architectural principle: **The Machine Rail must be separated from the Voice Rail**. The CLI wizard interactively gathers machine parameters, validates them against strict Zod contracts in memory, formats the YAML frontmatter starting at byte 0, and stubs the human-facing prose body for creative drafting.

```
                          CLI SCAFFOLDING ARCHITECTURE
                                       │
                      $ goblin-lore add <entity-type>
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. IN-MEMORY GRAPH INDEX: Scans /characters, /locations, /possessions       │
│ 2. DOMAIN-SPECIFIC INTERVIEW: Interactive @clack/prompts wizard             │
│ 3. PRE-FLIGHT ZOD SATURATION: Validates candidate object against schemas.ts │
│ 4. INPUT SANITIZATION: Strips leaked citation markers & normalizes UTF-8     │
│ 5. ATOMIC DISK PERSISTENCE: Writes byte-zero YAML frontmatter + prose body  │
│ 6. COMPILATION TRIGGER: Executes scripts/compile.ts to reseal bible-state   │
└─────────────────────────────────────────────────────────────────────────────┘

```

---

### Universal Frontmatter Generation Rules

Regardless of entity type, every domain command enforces four universal rules:

1. **The Byte-Zero Frontmatter Invariant:** The opening YAML delimiter (`---`) must begin at byte 0 of the generated file. Placing a Markdown title (`# Character: Bog`) or even a blank newline above the delimiters causes parsers like `gray-matter` to miss the block entirely, treating the entire file as unparsed prose and failing compilation.


2. **Automated Citation and Artifact Stripping:** Human writers and language models frequently paste reference text contaminated with citation markers (such as `[cite: 1]`) or non-standard line breaks. The scaffolding engine strips these patterns before serialization.


3. **The Static/Runtime Boundary (The Deletion Principle):** Authored Markdown files store append-only, human-reviewed static definitions. Mutable runtime state (dynamic cooldown counters, active escalation levels, current hex positions) is omitted; that state lives exclusively in external runtime tables (`grievance_runtime_state` in SQLite or Cloudflare D1).


4. **Immediate Graph Pre-indexing:** When prompting for relational fields, the CLI queries the existing local corpus (`/characters`, `/locations`, `/possessions`, `/world`) to provide autocomplete typeaheads, preventing dangling pointers before files touch disk.



---

### 1. Character Scaffolding (`goblin-lore add character`)

The character generator translates biological mechanics, inventory constraints, and social leverage into the tripartite state vector model: **Somatic**, **Logistical**, and **Epistemic**.

```
                     CHARACTER STATE VECTOR TOPOLOGY
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│   SOMATIC    │             │  LOGISTICAL  │             │  EPISTEMIC   │
├──────────────┤             ├──────────────┤             ├──────────────┤
│ Locomotion   │             │ Worn slots   │             │ Escalation   │
│ Banned verbs │             │ Held slot    │             │   ceiling    │
│ Motor limits │             │ Carried      │             │ Leverage     │
│ Active tics  │             │ Cached       │             │   strings    │
└──────────────┘             └──────────────┘             └──────────────┘

```

#### Interactive Wizard Flow

* **Identity & Baseline:** Prompts for unique slug (`id`) and display `name`.


* **Somatic Parameters:**
* Selects `locomotion_baseline` from `LocomotionBaselineEnum`: `bipedal_standard`, `bipedal_hunched`, `quadrupedal`, `slithering`, `brachiation`, `sessile`, or `limping`.


* Prompts for motor limitations (`NO_SPRINT`, `NO_HEAVY_LIFT`, `IMPAIRED_FINE_MOTOR`, `UNSTEADY_GAIT`).


* Compiles the negative motor mask (`banned_kinetic_verbs`), preventing downstream runtime engines from directing an injured character to run or climb.


* Gathers signature tics and behavioral tells.




* **Logistical Parameters:**
* Defines equip-slot allocations across four distinct tiers: `worn` (apparel/braces), `held` (active in-hand item), `carried` (pocketed items, max 3–4), and `cached` (stored at a spatial location).




* **Epistemic Parameters:**
* Sets the conversational `escalation_ceiling` (bounded between 1 and 5).


* Multi-selects active character IDs to populate `strings_held_over` (initial leverage debts).


* Captures `voice_tags` (syntactic constraints injected into prompting contexts).





#### Generated File Anatomy (`characters/<id>.md`)

```markdown
---
id: char_spleen
name: Spleen
type: character
historical_reference: false
somatic:
  locomotion_baseline: bipedal_hunched
  motor_limitations: []
  banned_kinetic_verbs: []
  conditions: []
  signature_tics:
    - "clutches unfinished wooden carving"
    - "pins ears back when approached"
logistical:
  worn: []
  held: null
  carried: []
  cached: []
epistemic:
  escalation_ceiling: 3
  strings_held_over: []
  leverage_strings: {}
  relationship_defaults:
    char_bog: peer
linked_possessions: []
linked_grievances: []
---

## Wants (surface)
To finish carving his wooden joint without Bog questioning where the wood scrap came from.

## Wants (actual)
Autonomy within the floorboards; absolute proof that he can survive without Bog's rationing.

## Blind spot
Assumes Bog's controlling hostility is purely personal, failing to recognize it is driven by famine panic.

## Voice notes
Curt, monosyllabic openings. Refuses to use honorifics. Employs defensive questions rather than declarations.

## Few-shot lines
- "Wood was already down there."
- "Eat your own tally."
- "I'm not moving off the pipe."

```

---

### 2. Grievance Scaffolding (`goblin-lore add grievance`)

Grievances are the foundational "loaded objects" of serialized drama. Rather than leaving scenes to unconstrained generative improvisation, the grievance library defines repeatable interpersonal tensions designed to escalate, cool down, and spawn deeper conflicts. The studio targets **40 to 60 grievances across 6 to 8 categories**, small enough for complete manual authoring and verification.

```
                     GRIEVANCE ESCALATION ARCHITECTURE
                                    │
  Stage 1 (Micro-Friction) ──► Stage 2 (Direct Accusation)
                                    │
                                    ▼
  Stage 3 (Core Wound Exposure) ──► Stage 4 / 5 (Max Escalation)
                                           │
                                           ▼
                       Typed Spawn: { type, target_id }

```

#### Interactive Wizard Flow

* **Categorization:** Selects from the declared taxonomy (`resource_hoarding`, `status_anxiety`, `secret_keeping`, `generational_rift`, `territorial_boundary`, `loyalty_tests`, or `domestic_sabotage`).


* **Participant Allocation:**
* `participants_primary`: Exactly two character IDs drawn from the active index.


* `participants_can_involve` / `participants_cannot_involve`: Permitted and forbidden secondary witnesses.




* **Escalation Bounds & Cadence:**
* Prompts for `intensity_floor` (1–5) and `intensity_ceiling` (1–5).


* Sets `cooldown_cycles` (integer count of episodes this tension must rest after activation).


* Sets `decay_rate` (`fast`, `medium`, `slow`, `none`), establishing how quickly unaddressed resentment subsides.




* **Typed Spawn Targets:**
* If the conflict escalates past its ceiling, it spawns a downstream entity.


* To avoid untyped identifier collisions, the CLI prompts for a structured object: `{ type: 'grievance' | 'secret', target_id: string }`.




* **Voice Rail Content Prompts:**
* Captures `surface_complaint` (the superficial object/act being argued over).


* Captures `underneath` (the unadmitted psychological wound).


* Prompts for 1 to 4 escalation path stages and literal `callback_phrases`.





#### Generated File Anatomy (`grievances/<category>/<id>.md`)

```markdown
---
id: spoon_credit
title: "The Good Silver Spoon"
type: grievance
category: resource_hoarding
participants_primary:
  - char_bog
  - char_spleen
participants_can_involve:
  - char_wart
participants_cannot_involve:
  - char_mum_grissel
intensity_floor: 1
intensity_ceiling: 4
cooldown_cycles: 3
decay_rate: slow
spawns_on_max_escalation:
  type: secret
  target_id: sec_bog_famine
epistemic:
  escalation_ceiling: 4
  leverage_strings: []
  strings_held_over: []
outcomes:
  clean_win: "Bog is acknowledged as provider; recovers social dominance."
  costly_compromise: "Spleen cleans the spoon but claims half of the next scrap haul."
  mutual_wound: "The spoon falls through the floorboard gap; lost to both."
  catastrophic_backfire: "Bickering alerts upstairs humans; crawlspace floor locks down."
---

**Surface complaint:** Who gets credit for salvaging the good silver spoon from upstairs.

**Underneath:** Bog feels unappreciated for sustaining the family; Spleen rejects Bog's self-appointed authority.

**Escalation path:**
1. Passive-aggressive commentary while cleaning rations.
2. Direct confrontation regarding who took the physical risk upstairs.
3. Bog claims unrecorded sacrifices that nobody else understands.
4. Spleen directly challenges Bog's narrative, exposing the underlying hoarding panic.

**Callback phrases:**
- "who pulled it through the lath"
- "credit where it's due"
- "the good silver"

```

---

### 3. Location Scaffolding (`goblin-lore add location`)

Locations represent spatial nodes within the storyworld's crawlspace topology. They ground scenes physically, bound movement ranges, and supply acoustic and visual anchors for downstream media generation.

```
                     SPATIAL TOPOLOGY LINKING
                                 │
     [loc_pantry_wall] ◄───────────────────► [loc_warm_pipe]
            │                                       │
            └──────────────► [loc_attic_stair] ◄────┘

```

#### Interactive Wizard Flow

* **Identity:** Prompts for slug (`id`, e.g., `loc_warm_pipe`) and display name.


* **Graph Adjacency:** Presents indexed location nodes to populate `connected_locations`. The CLI prompts: *"Link reciprocal adjacency on target nodes?"*, automating symmetrical graph updates.


* **Sensory Anchoring:**
* Dominant lighting and color temperature (e.g., `"dim amber sodium seepage"`).


* Tactile surface properties (e.g., `"dry splintered lath, chalky plaster grit"`).


* Continuous acoustic hum for Foley backdrops (e.g., `"intermittent 60Hz thermal expansion tick"`).




* **Capacity & Hazard Constraints:** Prompts for spatial volume flags (`cramped`, `exposed`, `vertical_choke`) to restrict character staging.



#### Generated File Anatomy (`locations/<id>.md`)

```markdown
---
id: loc_warm_pipe
name: "The Warm Pipe"
type: location
historical_reference: false
connected_locations:
  - loc_pantry_wall
  - loc_splinter_gap
linked_possessions: []
linked_grievances:
  - pipe_space_crowding
participants: []
---

## Environmental & Sensory Anchors
- **Dominant Lighting:** Dark amber radiance reflecting off copper patina.
- **Tactile Surface:** Smooth, dust-filmed heated metal seated in rough notch joists.
- **Acoustic Profile:** Heavy metallic expansion ticks occurring irregularly every 12 to 20 seconds.

## Spatial Staging Rules
Only two adult goblins can occupy the direct contact surface simultaneously without initiating an involuntary physical crowding check. Standing erect is impossible; characters must crouch or lean.

```

---

### 4. Possession Scaffolding (`goblin-lore add possession`)

Tracked possessions govern physical object permanence, salvage economies, and dispute catalysts. The possession generator ensures props obey strict weight classifications and tracking logic.

#### Interactive Wizard Flow

* **Identity & Naming:** Prompts for unique slug (`id`) and descriptive title.


* **Weight Classification:** Assigns `weight_class` from `WeightClassEnum`: `negligible`, `light`, `medium`, `heavy`, or `encumbering`.


* **Custody & Spatial Tracking:**
* Prompts for current `owner` (foreign key to `/characters/`) or starting `location` (foreign key to `/locations/`).


* Enforces the invariant: an item must either have an `owner` or reside at a `location`, preventing ungrounded artifacts.




* **Conflict Anchoring:**
* Sets `is_contested` boolean.


* Autocompletes `linked_grievances` to tie the prop directly to dispute records.





#### Generated File Anatomy (`possessions/<id>.md`)

```markdown
---
id: item_silver_spoon
name: "The Good Silver Spoon"
type: possession
historical_reference: false
owner: char_bog
location: loc_pantry_wall
logistical:
  weight_class: light
  is_contested: true
linked_grievances:
  - spoon_credit
---

## Physical Condition
Solid silver teaspoon with heavy tarnishing along the bowl edges and teeth marks near the handle tip. Slightly bent along the shank from being pried through lath gaps.

## Provenance
Recovered by Bog during the winter thaw from the second-floor dining room baseboards. Claimed as collective scrap, held as private status.

```

---

### 5. World Axiom Scaffolding (`goblin-lore add world`)

The world generator defines macro-ontological boundaries, temporal epochs, and absolute negative rules governing the story universe. Axioms are structured as binary constraints that remain in the primacy zone of prompt contexts.

#### Interactive Wizard Flow

* **Epoch Definition:** Captures current temporal epoch slug (e.g., `the_famine`, `the_floorboard_consolidation`).


* **Dominant Factions:** Prompts for active social groups or factions.


* **Negative Invariant Axioms:** Gathers universal physical, biological, and technological boundaries (e.g., `"No electricity in crawlspaces"`, `"Humans upstairs never spoken to directly"`).



#### Generated File Anatomy (`world/<id>.md`)

```markdown
---
id: world_axioms_core
name: "Floorboard Axioms"
type: world
epoch: "post_famine_winter"
dominant_factions:
  - "pipe_dwellers"
  - "wall_scavengers"
axioms:
  - "Combustion open flames are strictly banned beneath floorboards."
  - "Human upstairs presence is an environmental force, never a character."
  - "All physical matter is finite; discarded human scrap is never replaced."
---

## Metaphysical Boundaries
Magic does not exist as an external spellcasting system. Reality operates under strict Newtonian friction, localized heat transfer, and physical material decay.

```

---

### Implementation Architecture

The commands are executed through a unified CLI controller leveraging `@clack/prompts`, Zod, and atomic filesystem writers:

```typescript
// scripts/cli/addEntity.ts
import * as p from '@clack/prompts';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { AnyCorpusSchema } from '../../schemas/schemas.js';
import { runCorpusCompiler } from '../compile.js';

export async function handleAddEntity(entityType: string) {
  p.intro(`Scaffolding New ${entityType.toUpperCase()}`);

  let candidatePayload: Record<string, unknown>;
  let targetDirectory: string;

  switch (entityType) {
    case 'character':
      candidatePayload = await interviewCharacter();
      targetDirectory = 'characters';
      break;
    case 'grievance':
      candidatePayload = await interviewGrievance();
      targetDirectory = 'grievances';
      break;
    case 'location':
      candidatePayload = await interviewLocation();
      targetDirectory = 'locations';
      break;
    case 'possession':
      candidatePayload = await interviewPossession();
      targetDirectory = 'possessions';
      break;
    default:
      p.cancel(`Unknown entity type: ${entityType}`);
      process.exit(1);
  }

  // Pre-Flight Invariant Validation (Pass 1 in memory)
  const validationResult = AnyCorpusSchema.safeParse(candidatePayload);
  if (!validationResult.success) {
    p.log.error('Validation Failure: Candidate frontmatter violates schemas.ts');
    console.error(validationResult.error.format());
    process.exit(1);
  }

  // Format file contents: Byte-0 Delimiter + Frontmatter + Stubbed Prose
  const fileContent = serializeToMarkdown(candidatePayload);
  const targetPath = path.join(process.cwd(), targetDirectory, `${candidatePayload.id}.md`);

  // Atomic POSIX write pattern
  const tempPath = `${targetPath}.tmp_${crypto.randomUUID()}`;
  fs.writeFileSync(tempPath, fileContent, 'utf8');
  fs.renameSync(tempPath, targetPath);

  p.log.success(`Created ${targetPath}`);

  // Trigger compiler to update compiled/bible-state.json
  const compileReport = await runCorpusCompiler({ silent: true });
  if (compileReport.success) {
    p.outro(`Compiled state updated. Root Hash: ${compileReport.hash.slice(0, 8)}`);
  } else {
    p.log.warn('Corpus compiled with warnings. Run "goblin-lore audit" to review.');
  }
}

```

By isolating entity generation into typed interactive commands, `goblin-lore` bridges authorial intent and machine constraints. Writers interact with a guided wizard that manages scalar limits, validates limb and equip capacities, preserves the byte-0 delimiter invariant, and writes compliant frontmatter, ensuring new story assets integrate cleanly into the simulation.To fit the system architecture demonstrated in `995.library` and `worker-sower-engine`—where interactive console workflows route through reactive action reducers, buzzers, and terminal layouts—the scaffolding engine transitions from simple CLI prompt questions into a full **Terminal User Interface (TUI) Menu System** powered by `blessed` and `blessed-contrib`.

Instead of raw interactive scripts, domain scaffolding is wired directly into the **State Action/Buzzer Bus** (`ste.hunt`) and laid out on a responsive, multi-pane **12x12 Blessed Grid**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             995.LIBRARY TERMINAL OS                         │
├───────────────────────────────┬─────────────────────────────────────────────┤
│  NAV / CHOICE (x:0, y:0, w:3)  │  DOMAIN SCAFFOLD FORM (x:3, y:0, w:6, h:8)  │
│  ┌─────────────────────────┐  │  ┌───────────────────────────────────────┐  │
│  │ LIBRARY MENU            │  │  │ Entity ID: [char_spleen             ] │  │
│  │ AGENT MENU              │  │  │ Display Name: [Spleen               ] │  │
│  │ ► SCAFFOLD LORE MENU    │  │  │ Locomotion: (X) Hunched  ( ) Limping  │  │
│  │   ├── Character Node    │  │  │ Escalation Ceiling (1-5): [3]         │  │
│  │   ├── Grievance Node    │  │  │ [ SUBMIT & ATOMIC WRITE ]             │  │
│  │   ├── Location Node     │  │  └───────────────────────────────────────┘  │
│  │   ├── Possession Node   │  ├─────────────────────────────────────────────┤
│  │   └── World Axiom Node  │  │  COMPILATION LOG / TELEMETRY (w:9, h:4)     │
│  └─────────────────────────┘  │  ┌───────────────────────────────────────┐  │
│                               │  │ [PASS 1]: Validating Zod frontmatter  │  │
│                               │  │ [PASS 2]: Graph foreign-key check ok  │  │
│                               │  │ [SEALED]: SHA-256: 9c3e401... (OK)    │  │
│                               │  └───────────────────────────────────────┘  │
└───────────────────────────────┴─────────────────────────────────────────────┘

```

---

### 1. State Bus Integration: Actions, Buzzers, and Reducers

The scaffolding commands execute through the unit bus pattern: triggering an action constant, updating state through a reducer clone, and delegating terminal rendering to a dedicated buzzer handler.

#### A. Action Constants (`995.library/98.menu.unit/menu.action.ts`)

Declare the actions that govern the scaffolding lifecycle and domain sub-menus:

```typescript
// 995.library/98.menu.unit/menu.action.ts
export const SCAFFOLD_MENU = '[Menu action] Scaffold Menu';
export const SCAFFOLD_CHARACTER = '[Menu action] Scaffold Character';
export const SCAFFOLD_GRIEVANCE = '[Menu action] Scaffold Grievance';
export const SCAFFOLD_LOCATION = '[Menu action] Scaffold Location';
export const SCAFFOLD_POSSESSION = '[Menu action] Scaffold Possession';
export const SCAFFOLD_WORLD = '[Menu action] Scaffold World';

export class ScaffoldMenu implements Action {
  readonly type = SCAFFOLD_MENU;
  constructor(public bale: MenuBit) {}
}

export class ScaffoldCharacter implements Action {
  readonly type = SCAFFOLD_CHARACTER;
  constructor(public bale: MenuBit) {}
}

export class ScaffoldGrievance implements Action {
  readonly type = SCAFFOLD_GRIEVANCE;
  constructor(public bale: MenuBit) {}
}

export class ScaffoldLocation implements Action {
  readonly type = SCAFFOLD_LOCATION;
  constructor(public bale: MenuBit) {}
}

export class ScaffoldPossession implements Action {
  readonly type = SCAFFOLD_POSSESSION;
  constructor(public bale: MenuBit) {}
}

export class ScaffoldWorld implements Action {
  readonly type = SCAFFOLD_WORLD;
  constructor(public bale: MenuBit) {}
}

```

#### B. Reducer Switchboard (`995.library/98.menu.unit/menu.reduce.ts`)

Intercept the dispatch, clone state via `clone-deep`, and route to the scaffolding buzzer suite:

```typescript
// 995.library/98.menu.unit/menu.reduce.ts
import * as clone from 'clone-deep';
import * as Act from './menu.action';
import { MenuModel } from './menu.model';
import * as Buzz from './menu.buzzer';
import State from '../../99.core/state';

export function reducer(model: MenuModel = new MenuModel(), act: Act.Actions, state?: State) {
  switch (act.type) {
    case Act.SCAFFOLD_MENU:
      return Buzz.scaffoldMenu(clone(model), act.bale, state);

    case Act.SCAFFOLD_CHARACTER:
      return Buzz.scaffoldCharacter(clone(model), act.bale, state);

    case Act.SCAFFOLD_GRIEVANCE:
      return Buzz.scaffoldGrievance(clone(model), act.bale, state);

    case Act.SCAFFOLD_LOCATION:
      return Buzz.scaffoldLocation(clone(model), act.bale, state);

    case Act.SCAFFOLD_POSSESSION:
      return Buzz.scaffoldPossession(clone(model), act.bale, state);

    case Act.SCAFFOLD_WORLD:
      return Buzz.scaffoldWorld(clone(model), act.bale, state);

    default:
      return model;
  }
}

```

---

### 2. The Blessed & Blessed-Contrib Grid Harness

The scaffolding interface mounts onto a `blessed.screen` split into functional quadrants via `blessed-contrib.grid`. This terminal layout keeps the main navigation menu visible on the left while rendering interactive data entry forms and live compilation telemetry side-by-side.

```typescript
// 995.library/98.menu.unit/buz/menu.scaffold.ts
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { MenuModel } from '../menu.model';
import MenuBit from '../fce/menu.bit';
import State from '../../99.core/state';
import * as ActMnu from '../menu.action';
import * as Color from '../../val/console-color';

export const scaffoldMenu = async (cpy: MenuModel, bal: MenuBit, ste: State) => {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'GOBLIN-LORE // COMPILER SCAFFOLDING ENGINE',
    cursor: { artificial: true, shape: 'line', blink: true, color: 'magenta' }
  });

  // 12x12 Blessed-Contrib Responsive Grid Setup
  const grid = new contrib.grid({ rows: 12, cols: 12, screen });

  // 1. Navigation Panel (Rows 0-12, Cols 0-3)
  const navList = grid.set(0, 0, 12, 3, blessed.list, {
    label: ' ENTITY GENERATORS ',
    tags: true,
    keys: true,
    vi: true,
    border: { type: 'line' },
    style: {
      selected: { bg: Color.RED, fg: Color.WHITE, bold: true },
      item: { fg: Color.GREEN }
    },
    items: [
      'CHARACTER NODE',
      'GRIEVANCE NODE',
      'LOCATION NODE',
      'POSSESSION NODE',
      'WORLD AXIOM NODE',
      'COMPILE & RESEAL',
      'EXIT TO ROOT'
    ]
  });

  // 2. Active Working Workspace / Form Viewport (Rows 0-8, Cols 3-9)
  const formBox = grid.set(0, 3, 8, 9, blessed.form, {
    label: ' SCHEMA SPECIFICATION WORKSPACE ',
    border: { type: 'line' },
    keys: true,
    scrollable: true
  });

  // 3. Dynamic Compilation & Telemetry Console (Rows 8-12, Cols 3-9)
  const logConsole = grid.set(8, 3, 4, 9, contrib.log, {
    label: ' GATE 0 INVARIANT & COMPILER TELEMETRY ',
    border: { type: 'line' },
    style: { fg: Color.CYAN }
  });

  logConsole.log('System initialized. Awaiting generator selection...');
  navList.focus();

  navList.on('select', async (item) => {
    const selectedText = item.getText().trim();
    logConsole.log(`Opening scaffolding workspace for: ${selectedText}`);

    switch (selectedText) {
      case 'CHARACTER NODE':
        renderCharacterScaffoldForm(formBox, logConsole, screen, ste);
        break;
      case 'GRIEVANCE NODE':
        renderGrievanceScaffoldForm(formBox, logConsole, screen, ste);
        break;
      case 'LOCATION NODE':
        renderLocationScaffoldForm(formBox, logConsole, screen, ste);
        break;
      case 'POSSESSION NODE':
        renderPossessionScaffoldForm(formBox, logConsole, screen, ste);
        break;
      case 'WORLD AXIOM NODE':
        renderWorldScaffoldForm(formBox, logConsole, screen, ste);
        break;
      case 'COMPILE & RESEAL':
        await triggerInlineCompile(logConsole, screen);
        break;
      case 'EXIT TO ROOT':
        screen.destroy();
        await ste.hunt(ActMnu.UPDATE_MENU, {});
        break;
    }
  });

  screen.key(['escape', 'q', 'C-c'], () => {
    screen.destroy();
    process.exit(0);
  });

  screen.render();
  return cpy;
};

```

---

### 3. Domain Scaffolding Workspaces

Each sub-menu loads a customized form layout into the central viewport that maps input fields directly to Zod schemas (`schemas/schemas.ts`).

#### A. Character Scaffolding Workspace

This form collects the entity baseline while evaluating the somatic motor mask, logistical slots, and epistemic leverage rules:

```typescript
function renderCharacterScaffoldForm(
  form: blessed.Widgets.FormElement<any>,
  logger: any,
  screen: blessed.Widgets.Screen,
  ste: State
) {
  form.children.forEach((ch) => ch.destroy()); // Flush previous form nodes

  blessed.text({ parent: form, top: 1, left: 2, text: 'Entity Slug (ID):', style: { bold: true } });
  const idInput = blessed.textbox({
    parent: form, top: 2, left: 2, width: 30, height: 1,
    inputOnFocus: true, style: { bg: 'black', focus: { bg: 'blue' } }
  });

  blessed.text({ parent: form, top: 4, left: 2, text: 'Display Name:', style: { bold: true } });
  const nameInput = blessed.textbox({
    parent: form, top: 5, left: 2, width: 30, height: 1,
    inputOnFocus: true, style: { bg: 'black', focus: { bg: 'blue' } }
  });

  blessed.text({ parent: form, top: 1, left: 40, text: 'Locomotion Baseline:', style: { bold: true } });
  const locomotionRadios = blessed.radioset({ parent: form, top: 2, left: 40, width: 35, height: 5 });
  const baselines = ['bipedal_standard', 'bipedal_hunched', 'limping', 'quadrupedal'];
  baselines.forEach((base, idx) => {
    blessed.radiobutton({
      parent: locomotionRadios, top: idx, left: 0,
      text: base, checked: idx === 1
    });
  });

  blessed.text({ parent: form, top: 7, left: 2, text: 'Escalation Ceiling (1-5):', style: { bold: true } });
  const ceilingInput = blessed.textbox({
    parent: form, top: 8, left: 2, width: 10, height: 1,
    value: '3', inputOnFocus: true, style: { bg: 'black', focus: { bg: 'blue' } }
  });

  const submitBtn = blessed.button({
    parent: form, top: 10, left: 2, width: 24, height: 1,
    content: '[ COMMIT ENTITY FILE ]', align: 'center',
    style: { bg: 'green', fg: 'black', focus: { bg: 'lightgreen' } }
  });

  submitBtn.on('press', async () => {
    const candidatePayload = {
      id: idInput.getValue().trim(),
      name: nameInput.getValue().trim(),
      type: 'character',
      somatic: {
        locomotion_baseline: baselines.find((_, i) => locomotionRadios.children[i].checked) || 'bipedal_hunched',
        banned_kinetic_verbs: [],
        conditions: [],
        motor_limitations: [],
        signature_tics: []
      },
      logistical: { worn: [], held: [], carried: [], cached: [] },
      epistemic: {
        escalation_ceiling: parseInt(ceilingInput.getValue(), 10) || 3,
        leverage_strings: {},
        relationship_defaults: {},
        strings_held_over: []
      },
      linked_possessions: [],
      linked_grievances: []
    };

    logger.log(`Validating candidate: ${candidatePayload.id}...`);
    const validation = CharacterSchema.safeParse(candidatePayload);

    if (!validation.success) {
      logger.log(`{red-fg}[PASS 1 REJECTED]{/}: ${validation.error.issues[0].message}`);
    } else {
      await writeEntityToDisk('characters', candidatePayload.id, candidatePayload, `
## Wants (surface)
[Draft surface objective here]

## Wants (actual)
[Draft unadmitted psychological wound here]

## Blind spot
[Draft character blind spot here]
`);
      logger.log(`{green-fg}[SUCCESS]{/}: Wrote characters/${candidatePayload.id}.md`);
      await triggerInlineCompile(logger, screen);
    }
    screen.render();
  });

  idInput.focus();
  screen.render();
}

```

#### B. Grievance Scaffolding Workspace

Grievances require balancing participants, intensity parameters, and downstream causal links. This screen mounts indexed typeaheads using existing character dossiers loaded in memory:

```typescript
function renderGrievanceScaffoldForm(
  form: blessed.Widgets.FormElement<any>,
  logger: any,
  screen: blessed.Widgets.Screen,
  ste: State
) {
  form.children.forEach((ch) => ch.destroy());

  blessed.text({ parent: form, top: 1, left: 2, text: 'Grievance Slug (ID):', style: { bold: true } });
  const idInput = blessed.textbox({
    parent: form, top: 2, left: 2, width: 28, height: 1,
    inputOnFocus: true, style: { bg: 'black', focus: { bg: 'blue' } }
  });

  blessed.text({ parent: form, top: 1, left: 35, text: 'Grievance Category:', style: { bold: true } });
  const catList = blessed.list({
    parent: form, top: 2, left: 35, width: 25, height: 4,
    border: { type: 'line' }, keys: true,
    items: ['resource_hoarding', 'status_anxiety', 'secret_keeping', 'generational_rift'],
    style: { selected: { bg: 'yellow', fg: 'black' } }
  });

  blessed.text({ parent: form, top: 4, left: 2, text: 'Primary Participants (Comma-separated):', style: { bold: true } });
  const partsInput = blessed.textbox({
    parent: form, top: 5, left: 2, width: 28, height: 1,
    value: 'char_bog, char_spleen', inputOnFocus: true, style: { bg: 'black', focus: { bg: 'blue' } }
  });

  blessed.text({ parent: form, top: 7, left: 2, text: 'Spawns Child Grievance ID (Optional):', style: { bold: true } });
  const spawnInput = blessed.textbox({
    parent: form, top: 8, left: 2, width: 28, height: 1,
    inputOnFocus: true, style: { bg: 'black', focus: { bg: 'blue' } }
  });

  const submitBtn = blessed.button({
    parent: form, top: 10, left: 2, width: 26, height: 1,
    content: '[ EMIT GRIEVANCE SPEC ]', align: 'center',
    style: { bg: 'magenta', fg: 'white', focus: { bg: 'lightmagenta' } }
  });

  submitBtn.on('press', async () => {
    const spawnsRaw = spawnInput.getValue().trim();
    const payload = {
      id: idInput.getValue().trim(),
      name: idInput.getValue().trim().replace(/_/g, ' ').toUpperCase(),
      type: 'grievance',
      participants: partsInput.getValue().split(',').map(s => s.trim()).filter(Boolean),
      spawns_grievances: spawnsRaw ? [spawnsRaw] : [],
      epistemic: {
        escalation_ceiling: 4,
        leverage_strings: [],
        strings_held_over: []
      }
    };

    logger.log(`Validating grievance: ${payload.id}...`);
    const validation = GrievanceSchema.safeParse(payload);

    if (!validation.success) {
      logger.log(`{red-fg}[PASS 1 REJECTED]{/}: ${validation.error.issues[0].message}`);
    } else {
      await writeEntityToDisk('grievances', payload.id, payload, `
**Surface complaint:** [What they argue over on screen]

**Underneath:** [The core wound driving the bickering]

**Callback phrases:**
- "phrase one"
- "phrase two"
`);
      logger.log(`{green-fg}[SUCCESS]{/}: Created grievances/${payload.id}.md`);
      await triggerInlineCompile(logger, screen);
    }
    screen.render();
  });

  idInput.focus();
  screen.render();
}

```

#### C. Location Scaffolding Workspace

Configures spatial nodes, establishes the crawlspace adjacency graph, and prompts for sensory backdrops:

```typescript
function renderLocationScaffoldForm(
  form: blessed.Widgets.FormElement<any>,
  logger: any,
  screen: blessed.Widgets.Screen,
  ste: State
) {
  form.children.forEach((ch) => ch.destroy());

  blessed.text({ parent: form, top: 1, left: 2, text: 'Location ID (slug):', style: { bold: true } });
  const idInput = blessed.textbox({
    parent: form, top: 2, left: 2, width: 30, height: 1,
    inputOnFocus: true, style: { bg: 'black', focus: { bg: 'blue' } }
  });

  blessed.text({ parent: form, top: 4, left: 2, text: 'Connected Adjacent Locations:', style: { bold: true } });
  const connInput = blessed.textbox({
    parent: form, top: 5, left: 2, width: 45, height: 1,
    value: 'loc_warm_pipe, loc_pantry_wall',
    inputOnFocus: true, style: { bg: 'black', focus: { bg: 'blue' } }
  });

  const submitBtn = blessed.button({
    parent: form, top: 8, left: 2, width: 24, height: 1,
    content: '[ COMMIT LOCATION ]', align: 'center',
    style: { bg: 'yellow', fg: 'black', focus: { bg: 'white' } }
  });

  submitBtn.on('press', async () => {
    const payload = {
      id: idInput.getValue().trim(),
      name: idInput.getValue().trim().replace(/_/g, ' ').toUpperCase(),
      type: 'location',
      connected_locations: connInput.getValue().split(',').map(s => s.trim()).filter(Boolean),
      linked_grievances: [],
      linked_possessions: [],
      participants: []
    };

    const validation = LocationSchema.safeParse(payload);
    if (!validation.success) {
      logger.log(`{red-fg}[VALIDATION ERROR]{/}: ${validation.error.issues[0].message}`);
    } else {
      await writeEntityToDisk('locations', payload.id, payload, `
## Environmental & Sensory Anchors
- **Dominant Lighting:** Dim amber sodium seepage through subfloor cracks.
- **Tactile Surface:** Dry splintered lath joists covered in fine gypsum powder.
- **Acoustic Profile:** Heavy thermal pipe expansion ticks occurring every 15-30 seconds.
`);
      logger.log(`{green-fg}[SUCCESS]{/}: Wrote locations/${payload.id}.md`);
      await triggerInlineCompile(logger, screen);
    }
    screen.render();
  });

  idInput.focus();
  screen.render();
}

```

#### D. Possession Scaffolding Workspace

Enforces object permanence and assigns weight classes to physical items:

```typescript
function renderPossessionScaffoldForm(
  form: blessed.Widgets.FormElement<any>,
  logger: any,
  screen: blessed.Widgets.Screen,
  ste: State
) {
  form.children.forEach((ch) => ch.destroy());

  blessed.text({ parent: form, top: 1, left: 2, text: 'Item ID (slug):', style: { bold: true } });
  const idInput = blessed.textbox({
    parent: form, top: 2, left: 2, width: 30, height: 1,
    inputOnFocus: true, style: { bg: 'black', focus: { bg: 'blue' } }
  });

  blessed.text({ parent: form, top: 4, left: 2, text: 'Weight Class:', style: { bold: true } });
  const weightRadios = blessed.radioset({ parent: form, top: 5, left: 2, width: 30, height: 3 });
  const weights = ['negligible', 'light', 'medium', 'heavy'];
  weights.forEach((w, idx) => {
    blessed.radiobutton({ parent: weightRadios, top: idx, left: 0, text: w, checked: idx === 1 });
  });

  blessed.text({ parent: form, top: 1, left: 40, text: 'Current Owner (Character ID):', style: { bold: true } });
  const ownerInput = blessed.textbox({
    parent: form, top: 2, left: 40, width: 25, height: 1,
    value: 'char_bog', inputOnFocus: true, style: { bg: 'black', focus: { bg: 'blue' } }
  });

  const submitBtn = blessed.button({
    parent: form, top: 9, left: 2, width: 24, height: 1,
    content: '[ COMMIT ITEM SPEC ]', align: 'center',
    style: { bg: 'cyan', fg: 'black', focus: { bg: 'white' } }
  });

  submitBtn.on('press', async () => {
    const payload = {
      id: idInput.getValue().trim(),
      name: idInput.getValue().trim().replace(/_/g, ' ').toUpperCase(),
      type: 'possession',
      owner: ownerInput.getValue().trim() || undefined,
      logistical: {
        weight_class: weights.find((_, i) => weightRadios.children[i].checked) || 'light',
        is_contested: true
      }
    };

    const validation = PossessionSchema.safeParse(payload);
    if (!validation.success) {
      logger.log(`{red-fg}[VALIDATION ERROR]{/}: ${validation.error.issues[0].message}`);
    } else {
      await writeEntityToDisk('possessions', payload.id, payload, `
## Physical Condition
Slightly tarnished and scratched scrap metal with chipped edges from prying tool work.

## Provenance
Salvaged from the pantry floorboards during the late-season dry cycle.
`);
      logger.log(`{green-fg}[SUCCESS]{/}: Wrote possessions/${payload.id}.md`);
      await triggerInlineCompile(logger, screen);
    }
    screen.render();
  });

  idInput.focus();
  screen.render();
}

```

#### E. World Axiom Scaffolding Workspace

Declares temporal epochs and universe-level boundary rules that cannot be violated during generation:

```typescript
function renderWorldScaffoldForm(
  form: blessed.Widgets.FormElement<any>,
  logger: any,
  screen: blessed.Widgets.Screen,
  ste: State
) {
  form.children.forEach((ch) => ch.destroy());

  blessed.text({ parent: form, top: 1, left: 2, text: 'World Module ID:', style: { bold: true } });
  const idInput = blessed.textbox({
    parent: form, top: 2, left: 2, width: 30, height: 1,
    value: 'world_floorboard_axioms', inputOnFocus: true, style: { bg: 'black', focus: { bg: 'blue' } }
  });

  blessed.text({ parent: form, top: 4, left: 2, text: 'Current Temporal Epoch:', style: { bold: true } });
  const epochInput = blessed.textbox({
    parent: form, top: 5, left: 2, width: 30, height: 1,
    value: 'post_famine_consolidation', inputOnFocus: true, style: { bg: 'black', focus: { bg: 'blue' } }
  });

  blessed.text({ parent: form, top: 1, left: 40, text: 'Core Invariant Axiom:', style: { bold: true } });
  const axiomInput = blessed.textbox({
    parent: form, top: 2, left: 40, width: 35, height: 3,
    value: 'Combustion open flame is strictly banned beneath floorboards.',
    inputOnFocus: true, style: { bg: 'black', focus: { bg: 'blue' } }
  });

  const submitBtn = blessed.button({
    parent: form, top: 9, left: 2, width: 24, height: 1,
    content: '[ COMMIT WORLD RULE ]', align: 'center',
    style: { bg: 'white', fg: 'black', focus: { bg: 'lightgray' } }
  });

  submitBtn.on('press', async () => {
    const payload = {
      id: idInput.getValue().trim(),
      name: idInput.getValue().trim().replace(/_/g, ' ').toUpperCase(),
      type: 'world',
      epoch: epochInput.getValue().trim(),
      dominant_factions: ['pipe_dwellers', 'crawlspace_runners'],
      axioms: [axiomInput.getValue().trim()]
    };

    const validation = WorldSchema.safeParse(payload);
    if (!validation.success) {
      logger.log(`{red-fg}[VALIDATION ERROR]{/}: ${validation.error.issues[0].message}`);
    } else {
      await writeEntityToDisk('world', payload.id, payload, `
## Metaphysical Laws
Naturalistic crawlspace physics apply. Magic systems do not exist. Scarcity of calories and light is absolute.
`);
      logger.log(`{green-fg}[SUCCESS]{/}: Wrote world/${payload.id}.md`);
      await triggerInlineCompile(logger, screen);
    }
    screen.render();
  });

  idInput.focus();
  screen.render();
}

```

---

### 4. Atomic File Persistence & Live In-Memory Resealing

When a form is submitted, the application formats the entity using the byte-zero YAML convention, commits the file via an atomic POSIX rename, and triggers a compilation sweep inside the running process:

```typescript
// Shared Persistence & In-Memory Resealer Utilities
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import { compileCorpus, atomicWrite } from '../../scripts/compile.js';

async function writeEntityToDisk(
  dir: string,
  slug: string,
  frontmatter: Record<string, unknown>,
  bodyProse: string
) {
  const targetDir = path.join(process.cwd(), dir);
  await fs.mkdir(targetDir, { recursive: true });

  // Rule: Delimiter must begin at byte 0
  const formattedYaml = yaml.dump(frontmatter, { indent: 2, lineWidth: -1 }).trim();
  const fileContents = `---\n${formattedYaml}\n---\n${bodyProse.trim()}\n`;

  const targetPath = path.join(targetDir, `${slug}.md`);
  await atomicWrite(targetPath, fileContents);
}

async function triggerInlineCompile(logger: any, screen: blessed.Widgets.Screen) {
  logger.log('{yellow-fg}[COMPILING]{/}: Executing Pass 1 & Pass 2 sweeps across corpus...');
  screen.render();

  try {
    const dirs = [
      path.join(process.cwd(), 'characters'),
      path.join(process.cwd(), 'grievances'),
      path.join(process.cwd(), 'locations'),
      path.join(process.cwd(), 'possessions'),
      path.join(process.cwd(), 'world')
    ];

    const { jsonOutput, stateHash } = await compileCorpus(dirs);
    const outPath = path.join(process.cwd(), 'compiled', 'bible-state.json');
    await atomicWrite(outPath, jsonOutput);

    logger.log(`{green-fg}[SEALED]{/}: bible-state.json updated.`);
    logger.log(`SHA-256: {bold}${stateHash.slice(0, 16)}...{/}`);
  } catch (err) {
    logger.log(`{red-fg}[COMPILE ERROR]{/}: ${err instanceof Error ? err.message : String(err)}`);
  }
  screen.render();
}

```

---

### Comparison: Raw CLI Prompts vs. Blessed Grid Architecture

| Architecture Axis | Raw Terminal Prompts (`@clack/prompts`) | Blessed Terminal OS (`995.library`)

 |
| --- | --- | --- |
| **Interface Model** | Sequential linear scrolling text

 | Two-dimensional, multi-pane 12x12 grid dashboard

 |
| **System Architecture** | Ad-hoc detached Node scripts

 | Wired into unit bus (`ste.hunt`), actions, and reducers

 |
| **Context Retention** | Clears previous lines; loses history | Persistent navigation menu, active form, and live logger

 |
| **Compiler Feedback** | Requires exiting back to the shell | Runs inline inside the telemetry panel at $T_0$<br> |
| **Typeahead & Graphs** | Basic line completions

 | Live visual selection lists populated from parsed memory maps

 |

Integrating `blessed` and `blessed-contrib` directly into `995.library/98.menu.unit` aligns the authoring experience with the project's reactive architecture. It bridges human intent and compiler law: creators scaffold characters, grievances, locations, possessions, and world axioms through an interactive dashboard that automatically validates schemas, enforces referential integrity, and reseals the canon hash before the user returns to the terminal root.**In-Memory Graph Autocomplete** constitutes the preventive authoring boundary of `goblin-lore` and `995.library`. While Pass 2 of the corpus compiler halts build execution when a dangling pointer is detected, catching errors at compile time is still reactive: it forces an author or agent to inspect `stderr`, parse a stack trace, open the offending file, manually locate the missing identifier, and re-run compilation.

By integrating an in-memory relational graph index directly into the interactive `blessed` terminal interface, the system shifts referential integrity from a *compile-time audit* ($T_0$) to an *authoring-time constraint* ($T_{-1}$). The authoring tool prevents the creation of broken foreign keys, untyped identifier collisions, and asymmetrical topological links before a single byte of Markdown is committed to disk.

```
                IN-MEMORY GRAPH AUTOCOMPLETE PIPELINE
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│ LOCAL REPOSITORY CORPUS         │       │ DISK METADATA SCANNER           │
│ /characters, /locations, etc.   │──────►│ Fast AST & Frontmatter Parsing  │
└─────────────────────────────────┘       └────────────────┬────────────────┘
                                                           │
                                                           ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ IN-MEMORY DIRECTED MULTIGRAPH REGISTRY                                    │
│ • Entity Lookup Maps: Map<TypedEntityId, EntityNode>                      │
│ • Spatial Adjacency Matrix: Set<`location:${string}->location:${string}`> │
│ • Logistical Possession Index: Map<PossessionId, CharacterId | LocationId>│
│ • Epistemic Debt Graph: Map<CharacterId, Set<CharacterId>>                │
└──────────────────────────────────────┬────────────────────────────────────┘
                                       │
                                       ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ INTERACTIVE BLESSED TYPEAHEAD VIEWPORT                                    │
│ • Real-time input debouncing & fuzzy substring ranking                    │
│ • Somatic & logistical capability gating (Hides invalid selections)       │
│ • Multi-file atomic transaction coordinator (Reciprocal edge writes)      │
└───────────────────────────────────────────────────────────────────────────┘

```

---

### 1. The In-Memory Graph Index Architecture

When `995.library` initializes a scaffolding action via `ste.hunt(ActMnu.SCAFFOLD_MENU, {})`, the scaffolding subsystem mounts a lightweight, in-memory Directed Multigraph $\mathcal{G} = (\mathcal{V}, \mathcal{E})$ representing the state of all authored files.

```typescript
// 995.library/98.menu.unit/buz/graph.registry.ts
export type EntityDomain = 'character' | 'location' | 'possession' | 'grievance' | 'world';
export type TypedEntityId = `${EntityDomain}:${string}`;

export interface EntityNode {
  id: string;
  typedId: TypedEntityId;
  domain: EntityDomain;
  filePath: string;
  name: string;
  status: 'active' | 'retired' | 'departed';
  attributes: Record<string, unknown>;
  outEdges: Set<TypedEntityId>;
  inEdges: Set<TypedEntityId>;
}

export class InMemoryGraphRegistry {
  public nodes: Map<TypedEntityId, EntityNode> = new Map();
  public domainIndices: Record<EntityDomain, Set<TypedEntityId>> = {
    character: new Set(),
    location: new Set(),
    possession: new Set(),
    grievance: new Set(),
    world: new Set(),
  };

  public async bootstrap(repoRoot: string): Promise<void> {
    this.nodes.clear();
    Object.values(this.domainIndices).forEach(set => set.clear());

    // Rapid pre-flight sweep across all Markdown entity directories
    for (const domain of Object.keys(this.domainIndices) as EntityDomain[]) {
      const dirPath = path.join(repoRoot, domain === 'world' ? 'world' : `${domain}s`);
      if (!fs.existsSync(dirPath)) continue;

      const files = await fs.readdir(dirPath);
      for (const file of files) {
        if (!file.endsWith('.md') || file.startsWith('_')) continue;

        const fullPath = path.join(dirPath, file);
        const rawContent = await fs.readFile(fullPath, 'utf8');
        const parsed = matter(rawContent);
        const data = parsed.data;

        if (!data.id) continue;

        const typedId: TypedEntityId = `${domain}:${data.id}`;
        const node: EntityNode = {
          id: data.id,
          typedId,
          domain,
          filePath: fullPath,
          name: data.name || data.title || data.id,
          status: data.status || 'active',
          attributes: data,
          outEdges: new Set(),
          inEdges: new Set(),
        };

        this.nodes.set(typedId, node);
        this.domainIndices[domain].add(typedId);
      }
    }

    // Populate relational edges
    this.wireEdges();
  }

  private wireEdges(): void {
    for (const node of this.nodes.values()) {
      const data = node.attributes;

      // Extract out-edges based on domain semantics
      if (node.domain === 'character') {
        const logistical = data.logistical as Record<string, string[]> | undefined;
        ['held', 'worn', 'carried', 'cached'].forEach(slot => {
          logistical?.[slot]?.forEach(itemId => {
            this.addEdge(node.typedId, `possession:${itemId}`);
          });
        });
      } else if (node.domain === 'location') {
        (data.connected_locations as string[])?.forEach(locId => {
          this.addEdge(node.typedId, `location:${locId}`);
        });
      } else if (node.domain === 'grievance') {
        (data.participants_primary as string[])?.forEach(charId => {
          this.addEdge(node.typedId, `character:${charId}`);
        });
      }
    }
  }

  private addEdge(from: TypedEntityId, to: TypedEntityId): void {
    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);
    if (fromNode) fromNode.outEdges.add(to);
    if (toNode) toNode.inEdges.add(from);
  }
}

```

#### Eliminating Untyped Identifier Collisions

A vulnerability in flat narrative repositories is the untyped ID collision. If an author creates a grievance named `famine_spoon` and an item named `famine_spoon`, an untyped autocomplete selector cannot differentiate whether a scene is picking up a prop or engaging in interpersonal conflict.

The graph registry binds all memory nodes to **Namespaced Identifiers** (`${EntityDomain}:${string}`). Autocomplete fields specify which domain sets are queryable:

* The character form's `home_location` field queries exclusively against `domainIndices.location`.


* The grievance form's `primary_participants` field queries exclusively against `domainIndices.character`.


* The possession form's `linked_grievances` field queries exclusively against `domainIndices.grievance`.



---

### 2. Blessed Dynamic Typeahead Mechanics

In the terminal interface, autocomplete cannot rely on standard HTML `datalist` elements. The interface combines a `blessed.textbox` with an anchored, floating `blessed.list` that dynamically renders search candidates based on keystroke events.

```
┌────────────────────────────────────────────────────────┐
│ Character Dossier // Assigned Spatial Node:            │
│ [ loc_pan                                            ] │
│ ┌────────────────────────────────────────────────────┐ │
│ │ > loc_pantry_wall      │ Pantry Wall Shelf (Notch) │ │
│ │   loc_pantry_vent      │ Lower Pantry Air Vent     │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘

```

#### Interactive Typeahead Implementation

```typescript
// 995.library/98.menu.unit/buz/ui.typeahead.ts
import blessed from 'blessed';
import { InMemoryGraphRegistry, EntityDomain, EntityNode } from './graph.registry';

export function createGraphAutocomplete(
  screen: blessed.Widgets.Screen,
  parent: blessed.Widgets.Node,
  registry: InMemoryGraphRegistry,
  targetDomain: EntityDomain,
  top: number,
  left: number,
  width: number,
  onSelectCallback: (selected: EntityNode) => void
) {
  const input = blessed.textbox({
    parent,
    top,
    left,
    width,
    height: 1,
    inputOnFocus: true,
    style: { bg: 'black', fg: 'white', focus: { bg: 'blue' } },
  });

  const dropdown = blessed.list({
    parent,
    top: top + 1,
    left,
    width,
    height: 5,
    hidden: true,
    keys: true,
    vi: true,
    border: { type: 'line' },
    style: {
      selected: { bg: 'cyan', fg: 'black', bold: true },
      item: { fg: 'yellow' },
    },
  });

  // Filter and populate dropdown based on query string
  const updateDropdown = (query: string) => {
    const candidates = Array.from(registry.domainIndices[targetDomain])
      .map(typedId => registry.nodes.get(typedId)!)
      .filter(node => node.status === 'active') // Filter out departed/retired nodes
      .filter(node => 
        node.id.toLowerCase().includes(query.toLowerCase()) || 
        node.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10);

    if (candidates.length === 0 || query.trim() === '') {
      dropdown.hide();
      screen.render();
      return;
    }

    dropdown.setItems(candidates.map(c => `${c.id.padEnd(20)} │ ${c.name}`));
    dropdown.show();
    screen.render();
  };

  input.on('keypress', (_ch, key) => {
    // Intercept dropdown navigation
    if (key.name === 'down' && !dropdown.hidden) {
      dropdown.focus();
      return;
    }
    // Defer query evaluation to let input buffer populate
    setTimeout(() => {
      updateDropdown(input.getValue());
    }, 10);
  });

  dropdown.on('select', (item) => {
    const selectedRaw = item.getText().split('│')[0].trim();
    const typedId = `${targetDomain}:${selectedRaw}` as const;
    const selectedNode = registry.nodes.get(typedId);

    if (selectedNode) {
      input.setValue(selectedNode.id);
      dropdown.hide();
      input.focus();
      screen.render();
      onSelectCallback(selectedNode);
    }
  });

  return { input, dropdown };
}

```

---

### 3. Symmetrical Edge Synthesis & Bidirectional Linking

Spatial graphs and logistical ownerships are inherently relational, but file-based narrative repositories represent them as isolated frontmatter records. If an author creates `locations/attic_stair.md` and lists `connected_locations: [loc_pantry_wall]`, the graph is structurally broken until `locations/pantry_wall.md` is updated to link back to `loc_attic_stair`.

If left to manual authoring, asymmetrical spatial edges accumulate rapidly: an agent can walk from the pantry to the stairs, but the runtime simulation finds no traversal path back.

```
   ASYMMETRICAL DRIFT (MANUAL)              SYMMETRICAL SYNTHESIS (CLI)
   
  [loc_attic_stair]                        [loc_attic_stair]
         │                                        │              ▲
         │ (connected_locations)                  │              │ (Reciprocal link)
         ▼                                        ▼              │
  [loc_pantry_wall]                        [loc_pantry_wall] ─────┘
  (Missing reverse edge!)                  (Updated via In-Memory Reconciliation)

```

#### The Reciprocal Reconciliation Loop

When an autocomplete input successfully resolves a relational pointer, the scaffolding subsystem registers an **Intent-to-Link Transaction**. Before writing the new entity to disk, it executes reciprocal edge synthesis across existing files:

```typescript
// 995.library/98.menu.unit/buz/reciprocal.linker.ts
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { EntityNode } from './graph.registry';

export async function reconcileSpatialAdjacency(
  newNodeId: string,
  connectedLocationNodes: EntityNode[]
): Promise<string[]> {
  const mutatedFiles: string[] = [];

  for (const targetNode of connectedLocationNodes) {
    const rawContent = await fs.readFile(targetNode.filePath, 'utf8');
    const parsed = matter(rawContent);

    const existingConnections: string[] = parsed.data.connected_locations || [];

    // Avoid duplicate insertions
    if (!existingConnections.includes(newNodeId)) {
      existingConnections.push(newNodeId);
      parsed.data.connected_locations = existingConnections;

      // Re-serialize while strictly preserving the byte-zero frontmatter invariant
      const updatedMarkdown = matter.stringify(parsed.content, parsed.data);
      
      // Atomic write pattern: write to .tmp, then rename
      const tmpPath = `${targetNode.filePath}.tmp`;
      await fs.writeFile(tmpPath, updatedMarkdown, 'utf8');
      await fs.rename(tmpPath, targetNode.filePath);

      mutatedFiles.push(targetNode.filePath);
    }
  }

  return mutatedFiles;
}

```

The terminal UI prompts the creator with an explicit transaction confirmation:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ RECIPROCAL SPATIAL LINK DETECTED                                      │
│ Connecting [loc_attic_stair] -> [loc_pantry_wall].                     │
│ Automatically append reciprocal link inside locations/pantry_wall.md?  │
│                                                                        │
│ [ (Y) APPLY ATOMIC MUTATION ]             [ (N) KEEP DIRECTED ONLY ]   │
└────────────────────────────────────────────────────────────────────────┘

```

---

### 4. Contextual Capability Fencing ($T_{-1}$ Invariant Rejection)

The autocomplete engine does more than match character substrings: it functions as an active constraint filter. By inspecting the entity's underlying attributes, it suppresses options that would violate physical or somatic invariants.

#### Filtering by Somatic Capability

If a character dossier indicates an injury resulting in `hand_impairment_penalty: 1.0` (such as a severed right brachial plexus), their available hand count drops from $2$ to $1$.

$$\text{Available Limbs} = 2.0 - \text{penalty} = 1.0$$

When populating the `logistical.held` autocomplete dropdown for that character, the index evaluates each candidate item's `occupies_hands` attribute:

```typescript
export function filterEquipCandidates(
  characterNode: EntityNode,
  registry: InMemoryGraphRegistry
): EntityNode[] {
  const penalty = (characterNode.attributes.somatic as any)?.hand_impairment_penalty || 0.0;
  const availableHands = 2.0 - penalty;

  return Array.from(registry.domainIndices.possession)
    .map(typedId => registry.nodes.get(typedId)!)
    .filter(item => {
      const requiredHands = (item.attributes.logistical as any)?.occupies_hands || 1;
      // Suppress two-handed items if available functional limbs < 2
      return requiredHands <= availableHands;
    });
}

```

A two-handed broadaxe or heavy iron pot simply never appears in the candidate list. Rather than letting an author author an impossible physical action and waiting for the compiler or runtime AST linter to fail, the interface restricts input to physically valid configurations.

#### Epistemic and Lifecycle Status Fencing

1. **Departed / Retired Entities:** Characters flagged as `status: departed` in `characters/_retired/` are masked from active grievance creation dropdowns. They remain indexed in memory so historical scene dependency queries can resolve them, but they cannot be selected as active combatants in new conflicts.


2. **Cycle Prevention:** When authoring a grievance’s `spawns_on_max_escalation` target, the autocomplete engine runs an in-memory Depth-First Search (DFS) trace on candidate child grievances. If selecting `grv_iron_pot` would close a loop back to the current grievance ($A \to B \to C \to A$), the candidate is tagged with `{red-fg}[CIRCULAR CYCLE HAZARD]{/}` and blocked from selection.



---

### 5. Atomic Disk Persistence & Cache Invalidation

When an interactive form containing autocompleted foreign keys is submitted, changes are committed across the file system using an atomic write protocol:

```
                     ATOMIC TRANSACTION COMMIT
                                 │
        ┌────────────────────────┴────────────────────────┐
        ▼                                                 ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│ PRIMARY ENTITY CREATION       │       │ RECIPROCAL MUTATIONS          │
│ Write characters/spleen.md    │       │ Update locations/pantry.md    │
│ to .tmp_* sibling             │       │ to .tmp_* sibling             │
└───────────────┬───────────────┘       └───────────────┬───────────────┘
                │                                       │
                └───────────────────────┬───────────────┘
                                        │
                                        ▼
┌───────────────────────────────────────────────────────────────────────┐
│ POSIX RENAME SWAP                                                     │
│ Atomic replacement of directory inodes on disk                        │
└───────────────────────────────────────┬───────────────────────────────┘
                                        │
                                        ▼
┌───────────────────────────────────────────────────────────────────────┐
│ LIVE REGISTRY HYDRATION & MERKLE SEAL                                 │
│ 1. Inject new EntityNode directly into active memory registry         │
│ 2. Execute inline compile.ts to re-calculate $H_{root}$ state hash    │
│ 3. Update 12x12 Blessed telemetry terminal view                       │
└───────────────────────────────────────────────────────────────────────┘

```

1. **Transactional Stage:** The primary file and all reciprocal partner modifications are written to temporary sibling files (`<target>.md.tmp_[UUIDv7]`).


2. **Atomic Inode Replacement:** `fs.rename` atomically swaps all temporary files onto their target file paths. If a failure occurs during serialization, the operation aborts and partially written files are unlinked, leaving the original corpus untouched.


3. **In-Memory Graph Mutation:** Instead of tearing down and re-reading the entire file tree from disk, the `InMemoryGraphRegistry` creates the new `EntityNode` and inserts it directly into `this.nodes` and `this.domainIndices` in $O(1)$ time.


4. **Instant Hash Resealing:** The application runs the Pass 3 serialization sweep over the updated in-memory graph, recalculates the SHA-256 state hash ($H_{\text{root}}$), and writes the updated JSON contract directly to `compiled/bible-state.json`.



### Architectural Value: Cost and Integrity

Treating narrative references with the same rigor as typed code dependencies fundamentally changes the stability of downstream generation:

| Layer | Without Graph Autocomplete | With In-Memory Autocomplete |
| --- | --- | --- |
| **Typo Detection** | Caught late during `compile.ts` Pass 2 or CI diff.

 | Prevented interactively at input time ($T_{-1}$).

 |
| **Spatial Consistency** | Asymmetrical paths manually tracked in spreadsheets.

 | Enforced via automated bidirectional edge linking.

 |
| **Physical Logic** | LLM hallucinates actions beyond character limb capacity.

 | Somatic filtering removes invalid items before drafting.

 |
| **Compute Impact** | Broken scene ASTs burn GPU cycles and API tokens.

 | Guaranteed referential integrity at $\$0.00$ compute cost.

 |

In-Memory Graph Autocomplete transforms what was once brittle, unstructured prose into an interactive, strongly typed narrative IDE. Authors retain creative control over tone, subtext, and dialogue style, while the underlying terminal engine guarantees that the entity graph remains mathematically whole, physically possible, and strictly acyclic.**Immediate Invariant Evaluation & Editor Handoff** is the authoring-time execution boundary between structured schema compliance and human prose drafting within `goblin-lore` and `995.library`. In generative production, downstream errors scale exponentially across irreversible commitment thresholds. A physical impossibility, an equipment overload, or an invalid scalar range caught at compile time ($T_0$) costs $\$0.00$. If that same defect escapes to acoustic synthesis ($T_1$), spatial layout ($T_2$), serverless GPU diffusion ($T_3$), human editorial assembly ($T_4$), or master broadcast ($T_5$), the incident cost compounds from pennies to hundreds of dollars in burned compute and wasted labor:

$$\text{Cost}(t) = \sum_{i=0}^{5} \Delta C_i \cdot \mathbf{1}_{\{t \ge T_i\}}$$

The CLI wizard prevents this cost progression. Instead of allowing a writer to draft freeform Markdown and discovering violations later in a CI failure, the authoring environment executes a **Pre-Flight Satisfiability (SAT) Check** at $T_0$, validates physical capabilities, generates an atomically staged file, and hands control directly to the writer's local editor.

---

### 1. The Pre-Flight Capability SAT Solver ($T_0$, $\$0.00$)

The invariant evaluation engine replaces loose string policies and prompt requests with a structured **Capability-Resource Model**. Fictional entities are modeled as physical systems defined by available biological and logistical capacities.

```
                   PRE-FLIGHT CAPABILITY SAT SOLVER (T_0)
                                     │
      [ Scaffolding Input Form: Entity Capabilities & Equipped Slots ]
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────────┐
        │  1. SOMATIC VECTOR EVALUATION                          │
        │     • Calculate net functional limbs                   │
        │       ArmsAvailable = TotalArms - ImpairmentPenalty    │
        │     • Resolve locomotion rank & banned kinetic verbs   │
        └────────────────────────────┬───────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────────┐
        │  2. LOGISTICAL MASS & RESOURCE SOLVER                  │
        │     • Sum required hands: ∑ (slot.occupies_hands)      │
        │     • Evaluate: ArmsRequired ≤ ArmsAvailable           │
        │     • Evaluate: MobilityRank(Action) ≤ MobilityRank    │
        └────────────────────────────┬───────────────────────────┘
                                     │
                      ┌──────────────┴──────────────┐
                      ▼ SATISFIABLE                 ▼ CONTRADICTION (UNSAT)
            [ STAGE ATOMIC WRITE ]        [ FATAL BUILD INTERCEPTION ]
            • Allocates .tmp buffer       • Rejects file write at $0.00
            • Emits byte-0 Markdown       • Emits diagnostic coordinate

```

#### A. Somatic Resource Constraints

Before the CLI accepts an entity configuration, it evaluates somatic constraints as computable arithmetic inequalities:

$$\text{ArmsRequired}(\text{Action}) \le \text{ArmsAvailable}(\text{Entity})$$

$$\text{MobilityRank}(\text{Action}) \le \text{MobilityRank}(\text{Entity})$$

If a character dossier includes an active condition like `BRACHIAL_PLEXUS_RIGHT` with a severity rating of $1.0$, the engine calculates a `hand_impairment_penalty` of $1.0$. Functional upper-limb capacity drops immediately:

$$\text{ArmsAvailable} = 2.0 - 1.0 = 1.0$$

If the user attempts to allocate items to both `HELD_PRIMARY` and `HELD_OFFHAND`, or assigns a heavy, two-handed salvage tool (`occupies_hands: 2`), the solver evaluates $2.0 \le 1.0$, which is false. Rather than deferring this check to an LLM or a downstream test suite, the CLI's in-memory Zod refine layer fails immediately, alerting the author before the file touches disk.

#### B. Scalar Clamping and Banned Kinetic Verbs

The evaluator audits all numerical inputs against strict invariant ranges:

* Condition severities are clamped to $0.0 \le s \le 1.0$.


* Escalation ceilings and intensity bands are bounded strictly between $1$ and $5$.


* Cooldown counters are asserted as non-negative integers.



Simultaneously, the entity’s `locomotion_baseline` automatically compiles a deterministic negative motor mask. Selecting `NEUROPATHY_SHUFFLE` or `FLUID_ASYMMETRIC_LIMP` populates `banned_kinetic_verbs` with tokens such as `["sprint", "vault", "leap", "lunge"]`. Downstream drafting models receive this negative token mask directly, preventing impossible kinetic actions from being generated.

#### C. The Three-Class Error Taxonomy

When the pre-flight checker encounters a defect, it routes the failure into a three-domain error taxonomy to avoid pointless retries:

```text
                               INVARIANT CHECK EVENT
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
┌───────────────────┐           ┌───────────────────┐           ┌───────────────────┐
│   DETERMINISTIC   │           │ STOCHASTIC QUALITY│           │  INFRASTRUCTURE   │
│   (Fatal Halt)    │           │  (Bounded Retry)  │           │(Idempotent Resume)│
├───────────────────┤           ├───────────────────┤           ├───────────────────┤
│ • Capability UNSAT│           │ • Voice bleed     │           │ • File lock busy  │
│ • Banned verb leak│           │ • Flat subtext    │           │ • EPIPE on editor │
│ • Out-of-bound num│           │ • Bad pacing      │           │ • Disk write fail │
└───────────────────┘           └───────────────────┘           └───────────────────┘
         │                               │                               │
         ▼                               ▼                               ▼
  Halt immediately at             Allow 2 retries;                Resume from last
  T_0 ($0.00 compute).            escalate to human               valid content-
  Block file creation.            dossier if stalled.             addressed buffer.

```

---

### 2. Atomic Staged File Generation

Writing directly to the target Markdown file (`characters/spleen.md`) risks corrupting the workspace if the CLI crashes or is interrupted mid-execution. The scaffolding engine enforces the **Atomic Commit Pattern** via staged filesystem operations.

```
                     ATOMIC STAGED WRITE EXECUTION
                                   │
                   Pre-Flight Invariants Validated
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │ 1. SERIALIZE BYTE-ZERO YAML FRONTMATTER             │
        │    • Strict frontmatter block: Line 0 is '---'      │
        │    • Normalize line breaks & strip citation markers │
        └──────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │ 2. STUB PROSE BLUEPRINT HEADERS (VOICE RAIL)        │
        │    • ## Wants (surface)                             │
        │    • ## Wants (actual)                              │
        │    • ## Blind spot & Voice notes                    │
        └──────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │ 3. WRITE TO TEMPORARY SIBLING FILE (.tmp)           │
        │    corpus/characters/spleen.md.tmp_[UUIDv7]         │
        └──────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │ 4. ATOMIC POSIX RENAME                              │
        │    fs.renameSync(tmpPath, targetPath)               │
        │    Directory inode swapped; zero partial-write risk │
        └─────────────────────────────────────────────────────┘

```

#### The Byte-Zero Delimiter Invariant

The compiler requires that the opening YAML delimiter (`---`) begin at byte 0, index 0 of the generated file. If a human-readable header (`# Character Dossier: Spleen`) or an empty newline precedes the delimiters, YAML parsers fail to isolate the frontmatter, misinterpreting structural data as unparsed prose. The CLI guarantees this boundary programmatically.

#### The Machine Rail vs. Voice Rail Split

The generated file establishes a clear separation between mechanical constraints and creative prose:

* **The Machine Rail (Frontmatter):** Contains strongly typed attributes (IDs, capability masks, scalar bounds, foreign keys) consumed by downstream simulators (`worker-sower-engine`) and compilation scripts.


* **The Voice Rail (Body Prose):** Contains stubbed Markdown sections designed for human drafting and LLM few-shot context injection:



```markdown
---
id: char_spleen
name: Spleen
type: character
somatic:
  locomotion_baseline: bipedal_hunched
  banned_kinetic_verbs: ["sprint", "vault", "leap"]
  conditions: []
logistical:
  worn: []
  held: null
  carried: []
  cached: []
epistemic:
  escalation_ceiling: 3
  strings_held_over: []
  leverage_strings: {}
---

## Wants (surface)
<!-- What does the character claim they want in domestic bickering? -->

## Wants (actual)
<!-- What is the unadmitted existential wound driving their actions? -->

## Blind spot
<!-- What structural truth about the crawlspace do they refuse to see? -->

## Voice notes
<!-- Rhythm, cadences, syntactic constraints, and callback phrases. -->

```

---

### 3. Direct Editor Handoff & The Showrunner Save Gate

Once the atomic file is written, the CLI transitions from interactive data entry to creative prose composition.

#### Spawning the Editor Process

The CLI detects the user's environment, checking `$VISUAL`, `$EDITOR`, or falling back to VS Code via `code --wait`. It launches the editor as an isolated child process, placing the cursor directly on the first line of the prose body (`## Wants (surface)`):

```typescript
// scripts/cli/editorHandoff.ts
import { spawn } from 'node:child_process';
import path from 'node:path';

export async function handoffToEditor(filePath: string): Promise<void> {
  const editorCmd = process.env.VISUAL || process.env.EDITOR || 'code';
  const args = editorCmd.includes('code') ? ['--wait', '-g', `${filePath}:18:1`] : [filePath];

  console.log(`[HANDOFF]: Spawning external editor: ${editorCmd} ${filePath}`);

  return new Promise((resolve, reject) => {
    const child = spawn(editorCmd, args, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Editor process exited with non-zero code: ${code}`));
      }
    });

    child.on('error', (err) => reject(err));
  });
}

```

#### Gate 2: The Human Save Gate

When the editor launches, `995.library` and `worker-sower-engine` enter an idle state. Running on local hardware or lightweight edge workers, the system consumes $\$0.00$ in idle costs while the human writer drafts prose.

```text
  [ Gate 1: The Fast Automated Loop ]
  Candidate Spec ──► [ Pre-Flight SAT Solver ] ──► Atomic Staged Write (.tmp)
                                                          │
                                                          ▼
  [ Gate 2: The Human Edit / Save Gate ]
  Editor Spawns ($EDITOR) ──► Showrunner Hand-Edits Prose ──► File Saved & Closed
                                                                  │
                                                                  ▼
  [ Gate 3: Post-Handoff Seam & Parity Audit ]
  Token-Attribution Verifier ──► Negation Parser ──► Deterministic State Seal

```

The writer polishes the character's internal wound or voice notes without being forced through rigid CLI text prompts. The environment pauses on cheap infrastructure, ensuring downstream GPU pipelines remain unallocated until the human author saves and exits the editor.

---

### 4. Post-Handoff Verification: The Token-Attribution Verifier & Seam Gate

When the editor closes, the CLI regains control and executes a post-save verification pass before committing changes to the canon index.

#### A. The Token-Attribution Verifier (Dual-Layer Semantic Fence)

A known failure mode in generative narrative pipelines is the **Self-Reporting Discrepancy Trap**: an author or model may maintain valid motor enums in the frontmatter while drafting actions in the prose body that breach those constraints (e.g., leaving `locomotion_baseline: bipedal_hunched` while writing *"Spleen sprinted across the joists"*).

To prevent this drift, the engine runs an automated **Token-Attribution Verifier** across the prose body:

```
                     TOKEN-ATTRIBUTION VERIFIER GATE
                                    │
              Prose Body Extracted from Saved Markdown File
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────────┐
        │ 1. DEPENDENCY PARSE & LEMMA EXTRACTION                │
        │    Extract subject-verb pairs: (Actor, VerbLemma)     │
        └───────────────────────────┬───────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────────┐
        │ 2. NEGATION-AWARE POLARITY FILTER                     │
        │    Check for negative governor nodes (not, unable to) │
        │    • "Could not sprint" ──► NEGATED (Valid)           │
        │    • "Sprinted across"  ──► AFFIRMATIVE (Breach)      │
        └───────────────────────────┬───────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────────┐
        │ 3. DISCREPANCY SET INTERSECTION                       │
        │    ActionsExtracted ∩ Somatic.banned_kinetic_verbs    │
        └───────────────────────────┬───────────────────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼ ∅ (Clean)                   ▼ ≠ ∅ (Breach Detected)
          [ COMPOSE CANON COMMIT ]        [ EMIT LINTER FATAL BREACH ]
          • Execute compile.ts            • Block checkin
          • Seal state hash H_root        • Re-open editor at line

```

1. **Lemma Extraction:** A dependency parser scans the prose to extract all active verbal lemmas associated with the entity.


2. **Negation Filtering:** The engine inspects syntactic modifiers. If a forbidden verb lemma is governed by a negative polarity modifier (*"he couldn't leap the gap"*), it passes as an accurate depiction of physical impairment. If it appears in an affirmative construction (*"he leapt the gap"*), the check flags a hard violation.


3. **Discrepancy Assertion:** If the affirmative verb set intersects with `banned_kinetic_verbs`, compilation halts:



$$\text{Actions}_{\text{extracted}} \cap \text{Somatic.banned\_kinetic\_verbs} \neq \emptyset \implies \text{FATAL\_BREACH}$$

#### B. The Seam Verification Gate

If the authoring action was triggered to patch an existing narrative scene, the edited text must pass a **Tiered Seam Verification Gate** where it splices into the surrounding context:

| Seam Verification Tier | Checking Mechanism | Failure Policy |
| --- | --- | --- |
| **Syntactic & Tense Consistency**<br> | Part-of-speech tagger asserts matching past/present tense across splice seams.

 | **Hard Gate:** Blocks save; re-opens editor.

 |
| **Parity Test Re-Run**<br> | Verifies that dialogue lines match declared speaker tokens word-for-word.

 | **Hard Gate:** Aborts compile on mismatch.

 |
| **Coreference Resolution**<br> | Evaluates pronoun-antecedent bindings crossing the prefix and suffix boundaries.

 | **Advisory Flag:** Logs warning with confidence score.

 |
| **Physical Continuity**<br> | Asserts that held items and positions match the state expected by the suffix.

 | **Advisory Flag:** Highlights mismatched props.

 |

---

### 5. Failure Escalation & Diagnostic Provenance Dossiers

If the writer saves a file that introduces an irreconcilable contradiction (such as declaring a scene beat that requires an item the character does not possess), the system avoids infinite retry loops. It limits interactive correction attempts to three cycles before tripping a circuit breaker:

```text
[ Attempt 1: Editor Closes ] ──► Linter flags contradiction ──► [ Re-open Editor ]
                                                                       │
[ Attempt 2: Second Save   ] ──► Contradiction unresolved   ──► [ Re-open Editor ]
                                                                       │
[ Attempt 3: Third Save    ] ──► Invariant still broken     ──► [ CIRCUIT BREAKER TRIPS ]
                                                                       │
                                                                       ▼
                                                       [ EMIT ESCALATION DOSSIER ]
                                                       • Obliterate temporary file
                                                       • Route report to Showrunner

```

When the circuit breaker trips, the scaffolding tool discards the `.tmp` file and outputs a **Diagnostic Escalation Dossier** containing full constraint provenance:

```json
{
  "escalation_event": "CIRCUIT_BREAKER_TRIPPED",
  "task_id": "scaffold_char_spleen",
  "attempt_count": 3,
  "failure_class": "SOMATIC_INVARIANT_UNSAT",
  "conflicting_invariants": [
    {
      "rule": "BIMANUAL_OPERATION_FORBIDDEN",
      "provenance": {
        "source_scene": "ep040_sc02",
        "commit_sha": "a1b2c3d4",
        "fact_id": "fact_spleen_right_radius_fracture"
      }
    },
    {
      "prose_claim": "Spleen heaves the heavy iron siphon with both hands.",
      "file_path": "characters/spleen.md",
      "line_coordinate": 24
    }
  ],
  "routing_target": "SCENE_ARCHITECT",
  "remediation_action": "Either modify the prose to depict a one-handed drag or adjust the historical medical status in fact_spleen_right_radius_fracture."
}

```

By providing the exact historical commit and scene that established the conflicting rule, the dossier gives the showrunner the context needed to resolve the narrative block in minutes.

---

### 6. Architectural Cohesion: Immediate Evaluation and Handoff

The interplay between pre-flight evaluation, staged writes, and editor handoffs establishes an authoring workflow that bridges machine-enforced logic and human craft:

| Workflow Step | Executing Mechanism | Operational Invariant Enforced | Compute Cost |
| --- | --- | --- | --- |
| **1. Form Input**<br> | Blessed / `@clack` TUI

 | Bounded scalar validation ($0.0 \le s \le 1.0$).

 | $\$0.00$<br> |
| **2. Capability Check**<br> | Pre-Flight SAT Solver

 | $\text{ArmsRequired} \le \text{ArmsAvailable}$.

 | $\$0.00$<br> |
| **3. File Staging**<br> | Staged `.tmp` atomic write

 | Byte-0 delimiter invariant; clean Machine/Voice split.

 | $\$0.00$<br> |
| **4. Creative Drafting**<br> | `$EDITOR` / VS Code (`--wait`)

 | Showrunner Gate: unconstrained local prose composition.

 | $\$0.00$<br> |
| **5. Post-Save Audit**<br> | Token-Attribution Verifier

 | Discrepancy scan: $\text{Actions}_{\text{extracted}} \cap \text{Banned} = \emptyset$.

 | Fractions of a CPU second |
| **6. Canonical Sealing**<br> | `compile.ts` Pass 3

 | Byte-stable key sorting; updates SHA-256 state hash $H_{\text{root}}$.

 | Offline build |

By embedding the pre-flight capability solver, staged atomic writes, and post-handoff semantic verifiers into a unified authoring loop, `goblin-lore` preserves its foundational boundary: **the computer compiles and protects physical canon, while the human author creates meaning within those bounds**.**Post-Write Compilation & Telemetry Check** is the terminal validation and diagnostic gate executed the instant an author saves and closes an entity file in `goblin-lore` or `995.library`. In a deterministic narrative pipeline, closing an editor buffer must never be treated as an isolated filesystem event. Because downstream systems—such as `worker-sower-engine`, the ComfyUI dynamic graph synthesizer, and the Remotion timeline generator—rely on an immutable, content-addressed system of record, newly authored Markdown must be compiled, audited against graph invariants, and evaluated for narrative balance at $T_0$ before control returns to the terminal OS.

The post-write sequence executes within the terminal's telemetry console, executing a four-phase evaluation pipeline: three-pass compilation, drift detection, distribution telemetry, and downstream blast-radius analysis.

```
                POST-WRITE COMPILATION & TELEMETRY FLOW
                                   │
                 User Saves & Closes File in $EDITOR
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: THREE-PASS COMPILATION HARNESS (scripts/compile.ts)           │
│ • Pass 1: Zod validation (Somatic, Logistical, Epistemic vectors)      │
│ • Pass 2: Referential integrity sweep & Three-Color DFS cycle audit    │
│ • Pass 3: Alphabetical sorting, runtime stripping & SHA-256 seal       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Exit 0
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: DRIFT TRIPWIRE & REPOSITORY HYGIENE                           │
│ • In-memory buffer comparison against compiled/bible-state.json        │
│ • Git tree-hash freshness validation (Source trees vs. State hash)     │
│ • Assertion: Zero uncommitted source-to-JSON drift                     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Exit 0
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: GRAPH HEALTH & DISTRIBUTION TELEMETRY                         │
│ • Combinatorial Dyadic Matrix: Evaluates N(N - 1) / 2 coverage         │
│ • Categorical & Tonal Balance: Checks 6–8 categories & 10–15% cap      │
│ • Spatial Adjacency: Identifies orphaned or unidirectional nodes       │
│ • In-Degree Centrality Analysis: Dead lore vs. monolithic spines       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Pass / Advisory Warnings
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: BLAST-RADIUS CALCULATION & DOWNSTREAM INVALIDATION            │
│ • Recursive CTE dependency traversal across scene directed graph       │
│ • Flags affected downstream scenes: is_dirty = 1                       │
│ • Calculates True Economic Blast Radius ($0.00 draft vs. GPU rework)   │
│ • Updates 12x12 Blessed Telemetry Console & reseals Merkle state       │
└────────────────────────────────────────────────────────────────────────┘

```

---

### Phase 1: The Three-Pass In-Memory Compilation Sequence

The compiler script (`scripts/compile.ts`), packaged as `@snailicid3/consumer-npm`, treats the updated Markdown file not as text, but as an append-only transaction against the world state. Downstream engines are strictly prohibited from parsing raw Markdown at runtime; they consume only validated JSON.

#### Pass 1: Shape & Scalar Invariant Audit

The compiler uses `gray-matter` to isolate frontmatter and validates it against the Zod schemas in `schemas/schemas.ts`:

* **Somatic Vector:** Validates locomotion enums (`bipedal_hunched`, `limping`, `quadrupedal`), motor limitations, and compiles the negative kinetic mask (`banned_kinetic_verbs`). If an active condition has a severity score, the compiler clamps it strictly to $0.0 \le s \le 1.0$.


* **Logistical Vector:** Validates discrete equip slots (`worn`, `held`, `carried`, `cached`) and item weight classes. If the entity is a character, it computes limb capacity arithmetic:



$$\sum_{s \in \text{slots}} s.\text{occupies\_hands} \le 2.0 - \text{hand\_impairment\_penalty}$$



If required limbs exceed available limbs, Pass 1 throws a fatal validation error.


* **Epistemic Vector:** Enforces integer escalation ceilings ($1 \le \text{ceiling} \le 5$), maps leverage strings, and checks relationship defaults.



#### Pass 2: Relational Integrity & Causal DAG Traversal

The compiler mounts all files from `/characters`, `/grievances`, `/locations`, `/possessions`, and `/world` into relational lookup maps to verify cross-entity integrity:

* **Foreign-Key Assertion:** Every ID declared in a character’s `logistical.held` must resolve to an existing file in `/possessions`. Every actor listed in a grievance’s `participants_primary` must resolve to an active file in `/characters`. Any orphaned identifier causes an immediate non-zero exit (`process.exit(1)`).


* **Typed Spawn Verification:** Escalation targets declared in `spawns_on_max_escalation` must use typed object references (`{ type: 'grievance' | 'secret', target_id: string }`). Untyped ID strings pointing across multiple entity types are rejected to prevent silent dangling links.


* **Acyclicity Verification:** The compiler models all grievance spawn chains as a Directed Graph $\mathcal{G} = (\mathcal{V}, \mathcal{E})$ and runs a Three-Color Depth-First Search (DFS) with recursion-stack tracking:


* `WHITE`: Unvisited node.


* `GRAY`: Currently on the active traversal stack.


* `BLACK`: Verified acyclic subtree.
If the search encounters a `GRAY` node, a circular loop ($A \to B \to C \to A$) is confirmed, and compilation aborts immediately.





#### Pass 3: Deterministic Sealing & Normalization

Once structural and relational invariants pass, the compiler prepares the state envelope:

* **Alphabetical Normalization:** Object keys are sorted recursively in alphabetical order. Insertion-order variances from differing file-system discovery sequences are eliminated.


* **Runtime Purity Stripping:** Volatile environment variables, dynamic system timestamps (`Date.now()`, `new Date().toISOString()`), and pseudo-random numbers (`Math.random()`) are banned.


* **State Hashing & Atomic Rename:** A universal SHA-256 hash ($H_{\text{root}}$) is calculated over the canonical byte stream. The compiler writes the serialized payload to a temporary sibling file (`compiled/bible-state.json.tmp_[UUIDv7]`) and performs an atomic POSIX rename to replace `compiled/bible-state.json`.



---

### Phase 2: The Drift Tripwire & Repository Hygiene

Once `bible-state.json` is written, the post-write harness validates that the committed state on disk matches the authored source Markdown byte-for-byte.

```typescript
// scripts/compile.ts (Drift Tripwire Check)
export async function assertZeroDrift(memoryPayload: string): Promise<void> {
  const diskPath = path.join(process.cwd(), 'compiled', 'bible-state.json');
  if (!fs.existsSync(diskPath)) {
    throw new Error('[DRIFT_TRIPWIRE]: compiled/bible-state.json does not exist on disk.');
  }

  const diskPayload = await fs.readFile(diskPath, 'utf8');
  if (diskPayload !== memoryPayload) {
    throw new Error(
      '[DRIFT_TRIPWIRE]: Freshly compiled state diverges from committed disk JSON.\n' +
      'Ensure "scripts/compile.ts" is executed and changes are committed.'
    );
  }
}

```

#### Git Tree-Hash Staleness Verification

Relying on file modification timestamps (`mtime`) introduces race conditions and false positives across operating systems. The post-write check runs tree-hash staleness verification:

1. The compiler queries the Git tree objects for `/characters/`, `/grievances/`, `/locations/`, `/possessions/`, and `/world/`.


2. It compares these live source-tree SHAs against the source-tree hashes recorded inside `compiled/bible-state.json`.


3. If an author or background script mutates a source Markdown file without triggering compilation, the tree SHAs diverge. The system trips an immediate mechanical staleness warning, blocking subsequent simulation tasks until the state is synchronized.



---

### Phase 3: Graph Health & Distribution Telemetry

A corpus can pass all Zod schemas, resolve every foreign key, and prove acyclicity while remaining procedurally unplayable. Phase 3 evaluates the macro-structural health of the world using combinatorial metrics.

```
                    DYADIC CONFLICT COVERAGE MATRIX
                    
                 Bog          Spleen         Wart       Mum Grissel
             ┌───────────┬─────────────┬─────────────┬─────────────┐
 Bog         │     —     │   18 [OK]   │   8 [OK]    │   3 [WARN]  │
             ├───────────┼─────────────┼─────────────┼─────────────┤
 Spleen      │  18 [OK]  │      —      │   5 [OK]    │   1 [WARN]  │
             ├───────────┼─────────────┼─────────────┼─────────────┤
 Wart        │   8 [OK]  │   5 [OK]    │      —      │  0 [FATAL]  │
             ├───────────┼─────────────┼─────────────┼─────────────┤
 Mum Grissel │   3 [WARN]│   1 [WARN]  │  0 [FATAL]  │      —      │
             └───────────┴─────────────┴─────────────┴─────────────┘

```

#### 1. Dyadic Pairwise Conflict Coverage

For a cast of $N$ characters, the relational graph contains $\frac{N(N - 1)}{2}$ unique two-character interaction channels. For the core goblin litter ($N = 4$), exactly 6 dyadic channels exist.

* The telemetry engine scans all active grievances, counting primary participant pairings.


* **Starvation & Blind-Spot Detection:** If any channel contains fewer than 2 active grievances, the CLI flags a `DYADIC_STARVATION_WARNING`. If a channel has 0 entries (such as Wart $\leftrightarrow$ Mum Grissel), the engine logs a `FATAL_BLIND_SPOT`. When downstream simulation runtimes (`worker-sower-engine`) run Stage 3 drama lotteries, missing dyads force the lottery to fall back or repeat other pairings, degrading narrative diversity.



#### 2. Categorical Balance & Tonal Override Caps

The studio targets a corpus of **40 to 60 grievances distributed across 6 to 8 functional categories** (such as `resource_hoarding`, `status_anxiety`, `secret_keeping`, `generational_rift`, and `territorial_boundary`).

* **Category Depth:** The telemetry check asserts that each category maintains 5 to 8 entries. If a category drops below 4 entries, runtime cooldown locks (`cooldown_cycles: 3`) can exhaust all available nodes, stalling thematic arcs.


* **Tonal Override Ratio:** Entries flagged with `tonal_override_eligible: true`—where the underlying subtext is deliberately suspended for comedic farce—are audited against a strict mathematical threshold:



$$\text{Ratio}_{\text{tonal}} = \frac{\vert{}\{g \in \mathcal{G} \mid g.\text{tonal\_override} = \text{true}\}\vert{}}{\vert{}\mathcal{G}\vert{}}$$



If $\text{Ratio}_{\text{tonal}} > 0.15$ (exceeding 15% of the total library), the CLI issues a structural warning to prevent the world from losing dramatic stakes.



#### 3. Spatial Adjacency and In-Degree Centrality

* **Spatial Reachability:** The location graph is audited for isolated nodes ($k = 0$) or dead-end one-way connections. Every room must maintain symmetrical reciprocal links (`connected_locations`).


* **Power-Law Centrality:** The engine calculates the in-degree centrality ($k_{\text{in}}$) of all props and locations across the scene dependency graph:


* *Dead Lore ($k_{\text{in}} \le 1$):* Identifies decorative props that have never anchored a conflict choice, adding them to an automated pruning queue.


* *Monolithic Spines ($k_{\text{in}} \ge 15$):* Highlights hyper-connected entities (such as Bog's physical injury or the good silver spoon). High centrality signals an architectural liability: mutating this single entity invalidates dozens of downstream scenes.





---

### Phase 4: Downstream Blast-Radius Analysis & Invalidation Ingress

The final post-write check connects the static compilation pass to the downstream production state. Using a recursive Common Table Expression (CTE) query against the local relational ledger (SQLite / Cloudflare D1), the compiler evaluates the **True Economic Blast Radius** of the edit:

```sql
-- Dependency Invalidation Query
WITH RECURSIVE downstream_cascade AS (
  -- Anchor Member: Scenes directly consuming mutated entity
  SELECT scene_id, shot_id, status, execution_tier
  FROM scene_dependencies
  WHERE entity_id = :mutated_entity_id

  UNION ALL

  -- Recursive Member: Scenes consuming facts derived from upstream scenes
  SELECT s.scene_id, s.shot_id, s.status, s.execution_tier
  FROM scene_dependencies s
  JOIN downstream_cascade d ON s.upstream_scene_id = d.scene_id
)
UPDATE scenes
SET is_dirty = 1, status = 'PENDING_REVALIDATION'
WHERE scene_id IN (SELECT scene_id FROM downstream_cascade);

```

#### Estimating Rework Cost

The CLI calculates the financial and labor impact of the change:

* **Draft Phase ($T_0$):** If the affected scenes are in `DRAFT` status, the rebuild cost is $\$0.00$ because no media generation has occurred.


* **Rendered Phase ($T_3 - T_5$):** If affected scenes have completed speech synthesis ($T_1$), animatic compilation ($T_2$), or serverless GPU rendering ($T_3$), the tool sums the sunk compute cost and flags the scenes for surgical repair:



$$\text{Cost}_{\text{blast}} = \sum_{s \in \text{DirtyScenes}} \left( \text{GPU\_Seconds}_s \times \text{Rate} + \text{Tokens}_s \times \text{Rate}_{\text{LLM}} \right)$$




```text
$ sower why-dirty char_bog

[MUTATION DETECTED]: characters/bog.md modified.
  ├── Scene 040/03 (Direct Match: consumes char_bog.somatic) -> INVALIDATED (is_dirty = 1)
  ├── Scene 040/07 (Downstream Dependent: assumes bimanual carry) -> INVALIDATED (is_dirty = 1)
  └── Episode 041/01 (Epistemic Chain: Spleen references Bog's status) -> INVALIDATED (is_dirty = 1)
Total Blast Radius: 3 scenes across 2 episodes. Sunk compute at risk: $4.12 USD.

```

---

### The Three-Class Failure Taxonomy

When an error occurs during the post-write check, the system routes the failure using a strict three-domain taxonomy to prevent infinite retry loops from wasting developer or agent time:

```
                               POST-WRITE EXCEPTION
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
┌───────────────────┐           ┌───────────────────┐           ┌───────────────────┐
│   DETERMINISTIC   │           │ STOCHASTIC QUALITY│           │  INFRASTRUCTURE   │
│   (Fatal Halt)    │           │  (Bounded Retry)  │           │(Idempotent Resume)│
├───────────────────┤           ├───────────────────┤           ├───────────────────┤
│ • Zod scalar clamp│           │ • Voice bleed     │           │ • EBUSY lock on   │
│ • Orphaned FK link│           │ • Flat dialogue   │           │   bible-state.json│
│ • Causal DAG cycle│           │ • Excessive farce │           │ • Broken stdout   │
│ • Drift tripwire  │           │   tonal ratio     │           │   terminal pipe   │
└───────────────────┘           └───────────────────┘           └───────────────────┘
         │                               │                               │
         ▼                               ▼                               ▼
  Halt build at T_0.              Emit visual warning             Retry I/O operation;
  Emit diagnostic                 in Blessed console;             resume from last
  coordinate ticket.              allow author override.          clean Merkle hash.

```

---

### The Blessed Telemetry Console Dashboard

In `995.library`, results are rendered directly into the terminal layout using `blessed` and `blessed-contrib` widgets:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                   GOBLIN-LORE // POST-WRITE AUDIT & TELEMETRY              │
├─────────────────────────────────────────────────────────────────────────────┤
│ [PASS 1: SHAPE & SCALARS]      58 Entities Validated                [PASS]  │
│ [PASS 2: RELATIONAL INTEGRITY] Zero Orphaned Pointers               [PASS]  │
│ [PASS 2: CAUSAL ACYCLICITY]    Acyclic DAG Verified (Depth: 4)      [PASS]  │
│ [PASS 3: DETERMINISTIC SEAL]   SHA-256: e8f4c29b8a1c...             [SEALED]│
│ [DRIFT TRIPWIRE]               Zero Uncommitted Drift (Tree Match)  [PASS]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ CORPUS HEALTH TELEMETRY:                                                    │
│ • Grievance Corpus Size:       54 files across 7 categories (Target: 40–60) │
│ • Tonal Override Ratio:        12.9% Farce Allocation (Target: 10–15%)      │
│ • Dyadic Conflict Coverage:    5 of 6 Channels Covered                      │
│   ⚠ WARNING: Channel {char_wart <-> char_grissel} has ZERO grievances!     │
│ • Graph Centrality Skew:       Top In-Degree: item_silver_spoon (k_in = 22) │
├─────────────────────────────────────────────────────────────────────────────┤
│ DOWNSTREAM BLAST RADIUS:                                                    │
│ • Mutated Entity:              characters/spleen.md                         │
│ • Impacted Scenes:             0 Scenes Marked Dirty (Draft Phase)          │
│ • Estimated Compute Loss:      $0.00 USD                                    │
└─────────────────────────────────────────────────────────────────────────────┘
Status: COMPILED CLEANLY WITH 1 ADVISORY WARNING (Exit 0)
Press [ENTER] to return to Library Navigation Menu...

```

By coupling validation passes, drift assertions, relational graph checks, and blast-radius tracking into an automated post-save routine, the system guarantees that new writing integrates cleanly into the story universe. The pipeline catches contradictions, broken foreign keys, and narrative imbalances at $T_0$, ensuring downstream simulations and GPU rendering pipelines operate on mathematically consistent canon.Across the architecture, four critical domains require updates to reconcile earlier design assumptions with the actual operational constraints of the pipeline:

### 1. Mathematical and Schema Corrections

* **Correcting the 2d6 Margin Math:** Earlier specifications miscalculated the difference distribution of two 2d6 rolls; exact margins are 11.3% at 0, 21.6% at $\pm 1$, and 19.3% at $\pm 2$, with extreme margins ($\vert{}\text{margin}\vert{} \ge 6$) holding a real combined probability of roughly 15%.


* **Per-Limb Capability Modeling:** An integer hand count is too coarse; models require explicit per-limb tracking (e.g., left arm paralyzed vs. right arm functional) integrated with logistical equip slots to model reach and handedness accurately.


* **Capability-Bounded Discrepancy Fencing:** Restrict the AST discrepancy linter strictly to constrained-capability actions (verbs requiring limbs, mobility, sight, or speech), ignoring harmless extraction noise such as unlisted glances or head turns.


* **Directional Relationship Vectors:** Relationship types cannot remain symmetric; they require directional definitions, stability flags (`locked` vs. `shiftable`), a `repair_attempts` integer, and a chronological `relationship_history` log.



### 2. Spatiotemporal Hierarchy and Truth Separation

* **Decoupling Beats from Shots:** Maintain a strict separation between narrative units (Beats in the dialogue AST) and presentation units (Shots in the exposure sheet), ensuring camera reaction cuts do not fragment story units.


* **The Tripartite Truth Boundary:** Formalize the distinction between the Event Log (historical truth), Materialized State (working ledger), and Media Projections (episodes, audio, prose), enforcing that media changes never silently mutate world facts.


* **Hierarchical Child Seeding:** Derive independent pseudorandom seeds from an `episode_seed` (simulation, dialogue, render variation) so adjusting visual diffusion noise never alters narrative outcomes.



### 3. Governance, Calcification, and Lifecycles

* **The "Still Good" Protocol:** To prevent epistemological calcification—where early throwaway facts permanently constrain writing—track `last_reconsidered_at` prioritized by downstream in-degree reach rather than arbitrary calendar dates.


* **Explicit Absence & Unified Waivers:** Formalize asset statuses (`INTENTIONALLY_ABSENT`, `WAIVED`, `VALID`) in a centralized waiver ledger, distinguishing deliberate null variants from broken paths.


* **Two-Number Honesty Tracking:** When tracking narrative plant-payoff arcs and dependency closures, record both automated detections and human-audited misses to expose tooling blind spots.



### 4. Transition to Physical Execution

* **Execute the 3-Second Tracer Bullet:** Stop expanding architectural documents and run the minimal five-point pipeline test (one character, one grievance, one line, one shot, one audio stem) to verify that an event can travel from world state to a reproducible media artifact.



Would you like to draft the exact data contract for the 3-second tracer bullet test or calibrate the per-limb capability schema first?

### 1. The Epistemological Core & System Axioms

The architecture functions as an **event-sourced narrative compiler governed by strict authority boundaries**, where generative neural networks (LLMs, diffusion models, speech synthesizers) operate purely as subordinate, headless rendering workers. They possess zero temporal, physical, or ontological authority over the universe.

```
                     AUTHORITY & COMPILATION TOPOLOGY
                                     │
      CANONICAL LAW (000.goblin-lore) │ Versioned, schema-validated rules
                                     ▼
      HISTORICAL TRUTH (Event Log)   │ Immutable, ordered event stream
                                     ▼
      MATERIALIZED STATE (Ledger)    │ State = fold(apply, baseline, events)
                                     ▼
      SCENE PLAN / IR                │ Mechanics, required turns, epistemic masks
                                     ▼
      SEMANTIC EXPRESSION (LLM)      │ Constrained dialogue AST generation
                                     ▼
      TEMPORAL MASTER (Audio/TTS)    │ Integer-quantized frame timeline
                                     ▼
      SENSORY PROJECTION (Comfy/Wan) │ Headless renderers & exposure compositing

```

#### A. The Deletion Principle

The system's integrity hinges on a fundamental decoupling: **if all generative models are deleted, the universe remains logically and structurally intact within the relational ledger**. Conversely, if the ledger is lost, the universe suffers brain death even if the models continue generating pixels and dialogue.

* **Model Independence:** Characters, injuries, debts, locations, and historical events must exist independently of model weights or prompts.


* **The Storage Divide:** Ledger state and canon specifications are irreplaceable source files; generated media artifacts (video plates, audio stems) are non-reproducible and must be preserved in content-addressed storage.



#### B. The Four-Layer Architecture

1. **Canon (World Law):** Static, read-only schemas, physical limits, and geography. It answers: *What is physically and socially possible?*


2. **Events (Historical Truth):** The append-only, ordered log of every occurrence, interaction, and state change.


3. **State (Present Working View):** A materialized computation derived from the event log:

$$\text{State}_N = \text{fold}(\text{apply}, \, \text{State}_0, \, [E_1, E_2, \dots, E_N])$$



State is never an independent source of truth; any state table can be rebuilt by replaying the event log over the genesis baseline.


4. **Media (Sensory Projection):** The execution of state transitions into human-facing formats (Fountain screenplays, dialogue ASTs, audio waveforms, video plates).



#### C. Unratified Detail in Projections

Media projections inherently generate incidental, unmodeled detail (the color of a wall, an unscripted gesture, a figure of speech). Without explicit policy, these inventions become de facto canon through repetition. The pipeline enforces three handling tiers:

* **Discard:** Ephemeral set dressing not registered in the ledger has zero binding authority on future episodes.
* **Harvest Queue:** Incidental details that recur or anchor dramatic beats are emitted to an `unratified_details` ledger for showrunner review.
* **Formal Ratification:** Only when approved by a human showrunner does a projection detail migrate into canonical world files.

---

### 2. The Four Entity State Vectors

Narrative reality decomposes into four distinct, strongly typed vectors, preventing behavioral and physical constraints from blurring together:

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  SOMATIC VECTOR  │  │LOGISTICAL VECTOR │  │ EPISTEMIC VECTOR │  │RELATIONAL VECTOR │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│• Anatomical loci │  │• Hand capacities │  │• Belief vs truth │  │• Bilateral debts │
│• Mobility ranks  │  │• Slung / Worn    │  │• Provenance logs │  │• Asymmetric ties │
│• Motor masks     │  │• Mass accounting │  │• Indexed Unknown │  │• Standing / Rank │
│• Dynamic fatigue │  │• Conservation    │  │• Omission masks  │  │• Social leverage │
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘

```

#### A. The Somatic Vector (Capability-Resource Mechanics)

Physical state is tracked as explicit anatomical capabilities rather than vague text tags:

* **Capability Modeling:** Instead of maintaining ad-hoc verb blacklists, character profiles declare functional capacity (e.g., `arms_available = 1.0`, `mobility_class = LIMP`).


* **Resource Equations:** Actions declare capability requirements ($R$). Feasibility is evaluated before generation:

$$\sum R_{\text{hands}} \le \text{ArmsAvailable}$$


* **Negative Motor Mask:** Injuries compile into deterministic exclusion lists (`banned_kinetic_verbs`), preventing downstream generators from attempting bimanual tasks or rapid locomotion.



#### B. The Logistical Vector (Mass Conservation & Equipping)

* Tracks discrete slots (`worn_inner`, `worn_outer`, `held_primary`, `held_offhand`, `slung`, `cached`).


* Enforces physical permanence: an item must either have an explicit owner or reside at an indexed spatial location node.

#### C. The Epistemic Vector (Information Horizons & Belief Provenance)

* **Ignorance by Omission:** A model cannot be instructed to "pretend a character doesn't know X". Mentioning a fact in a prompt primes attention heads to utilize it. Epistemic boundaries are enforced by omitting unknown facts from the character's prompt context entirely.


* **Belief Decoupled from Truth:** Characters act on subjective belief states, which may contradict ground truth:


```typescript
interface BeliefRecord {
  belief_id: string;
  holder_id: string;
  proposition_slug: string;
  subjective_probability: number; // 0.0 to 1.0 confidence
  source_type: "DIRECT_OBSERVATION" | "TESTIMONY" | "INFERENCE" | "RUMOR";
  source_event_id: string;        // Pointer to historical event
  resists_correction: boolean;    // Psychological inertia trait
}

```



* **The Indexed Unknown:** "Unknown" is indexed by the observer:
1. *Character Ignorance:* Known to others, omitted from this character's context.
2. *Unresolved by Canon:* Explicit mysteries (e.g., the historical cause of `the_famine`) that the generator is structurally barred from resolving.



#### D. The Relational Vector (Social Debts & Asymmetric Ties)

* Debts, grudges, leverage (Strings), and social rank exist independently of character knowledge.
* **Structural Asymmetry:** A believes B owes them a life debt; B believes the debt was settled. Separating relational ground truth from epistemic belief makes dramatic misunderstanding a computable property.

---

### 3. Mathematical, Physical, and Causal Formulations

#### A. The Exact 2d6 Difference Distribution

In opposed resolution ($2\text{d}6_A - 2\text{d}6_B$), the total state space contains $36 \times 36 = 1,296$ equally likely outcomes. The exact distribution of the margin $d = A - B$ is computed by:


$$P(d) = \sum_{s=2}^{12} P(A = s) \cdot P(B = s - d)$$

The exact probability profile for all positive, negative, and extreme margins:

| Margin ($d$) | Ordered Combinations | Probability (Exact) | Cumulative / Grouped Context |
| --- | --- | --- | --- |
| **$0$ (Tie / Stall)** | $146$ | $\frac{146}{1296} \approx 11.27\%$ | Base stall / mutual check |
| **$\pm 1$** | $140$ each ($280$ total) | $\frac{280}{1296} \approx 21.60\%$ | Minor friction / slight edge |
| **$\pm 2$** | $125$ each ($250$ total) | $\frac{250}{1296} \approx 19.29\%$ | Standard operational advantage |
| **$\pm 3$** | $104$ each ($208$ total) | $\frac{208}{1296} \approx 16.05\%$ | Decisive shift |
| **$\pm 4$** | $80$ each ($160$ total) | $\frac{160}{1296} \approx 12.35\%$ | Clean win threshold begins |
| **$\pm 5$** | $56$ each ($112$ total) | $\frac{112}{1296} \approx 8.64\%$ | Dominant resolution |
| **$\pm 6$ to $\pm 10$** | $70$ each side ($140$ total) | $\frac{140}{1296} \approx 10.80\%$ | Extreme structural blowout |

* **Central Concentration:** $\vert{}d\vert{} \le 2$ occurs $\frac{146 + 280 + 250}{1296} = \frac{676}{1296} \approx 52.16\%$. Over half of all unweighted contests fall into near-parity, making Mutual Wounds and Costly Compromises the statistical baseline.
* **Modifier Weight:** A $+1$ shift near the center shifts win probability by $12\text{–}17$ percentage points. A $+3$ modifier grants an $81.64\%$ probability of outright victory ($P(d \ge -2)$), turning an uncertain contest into a near-certainty. Modifiers must be clamped tightly ($[-2, +2]$) to preserve dramatic tension.

#### B. The Prerequisite DAG vs. The Runtime Graph

A critical distinction governs narrative cycles:

* **The Prerequisite Graph is Strictly Acyclic (DAG):** Structural unlocks, grievance escalation milestones, and world facts must form an acyclic graph verified via Three-Color Depth-First Search (DFS). Circular dependencies in prerequisites cause compiler deadlocks.
* **The Relationship/Interaction Graph is Cyclic:** Characters interact, hold recurring grudges, and exchange status. Apparent causal loops unroll acyclically through **time-indexing**:

$$A_{t_1} \longrightarrow B_{t_2} \longrightarrow A_{t_3}$$



Because each interaction exists at a distinct cycle timestamp, mutual influence never forms a topological graph cycle.

#### C. Deterministic Normalization and Serialization

To guarantee identical SHA-256 hashes ($H_{\text{root}}$) across differing platforms:

* **Numeric Representation:** Floating-point scalars are prohibited in compiled state; severities and coordinates are stored as fixed-point integers (e.g., integer basis points $0 \le s \le 10000$).
* **String Collation:** UTF-8 Unicode normalization (NFC) is applied prior to key collation.
* **Lexicographical Sorting:** Object keys are sorted alphabetically before serialization; array ordering is preserved where sequence carries causal meaning.
* **Hierarchical Seed Isolation:** Downstream render seeds branch independently from narrative seeds:

$$\text{Seed}_{\text{scene}} = \text{HMAC-SHA256}(\text{MasterSeed}, \, \text{EpisodeID} \parallel \text{SceneID})$$



Perturbing visual diffusion noise or camera shake never alters the event log or narrative outcome.

---

### 4. Verification, Linting, & The Natural Language Seam

#### A. The Dual-Field AST and Redundant Verification

Relying on self-reported model output invites compliance evasion: an LLM can emit `extracted_motor_actions: ["LIMP"]` in its JSON array while describing illegal bimanual actions in its prose text.

The pipeline deploys a four-tiered verification stack:

1. **Grammar Constraints (GBNF):** Restricts the structured action field to valid capability enums.


2. **Prose Lemma Scan:** An automated pass sweeps prose for forbidden verbs, using dependency parsing to evaluate polarity modifiers (confirming that *"he couldn't run"* passes as valid trauma, whereas *"he ran"* triggers a build halt).


3. **Independent Extraction Pass:** A second, deterministic model (temperature 0.0) reads the unannotated prose and independently extracts all depicted physical actions.


4. **Symmetric Discrepancy Gate:** If the self-reported action array diverges from the independently extracted action array, compilation terminates on cross-field contradiction:

$$\text{Actions}_{\text{SelfReported}} \;\Delta\; \text{Actions}_{\text{Independent}} \neq \emptyset \implies \text{HALT\_DISCREPANCY}$$



#### B. The Spatiotemporal Hierarchy

Narrative units and presentation units must remain separate:

```
L1: Simulation Cycle   ──► World clock tick; moves agents; advances cooldowns
L2: Episode            ──► Packaged dramatic broadcast unit
L3: Scene              ──► Bounded spatial encounter (one location, fixed cast)
L4: Beat (Semantic)    ──► Narrative turn (accusation, revelation, compromise)
L5: Shot (Visual)      ──► Single camera angle, framing, or reaction insert
L6: Frame (Temporal)   ──► Absolute time quantization (Audio duration ms -> Int frames)

```

A single semantic beat can generate multiple presentation shots (e.g., Beat: Accusation $\to$ Shot 1: Speaker, Shot 2: Reaction cut, Shot 3: Insert of clenched fist). Audio duration establishes the absolute frame boundary ($F = \lceil \frac{D_{\text{ms}}}{1000} \times 24 \rceil$); exposure sheets anchor cuts to integer frame positions to eliminate timing drift.

---

### 5. Continuity as Cache Invalidation

Narrative continuity functions like a software build system:

```
[ Fact: Elias arm severed ] ──► [ Scene 14: Beat AST ] ──► [ Scene 14: Render Plate ]
            │                                                      ▲
            │ (Upstream Fact Mutated)                              │
            ▼                                                      │
[ Blast Radius Query ] ───────► Flags dependent artifacts: ────────┘
                                is_dirty = 1 (Invalidated)

```

* **Dependency Graph:** Narrative facts, beats, and rendered shots exist as nodes connected by `depends_on` edges.


* **Blast Radius Calculation:** When an upstream fact is altered, a recursive Common Table Expression (CTE) traverses the DAG to identify all downstream scenes rendered invalid.


* **Asymmetric Minimal Enclosing Unit (MEU) Repair:**
* *Backward Sweep:* Scans upward to collect active constraints (e.g., verifying a character holds a key) without expanding the text rewrite boundary.


* *Forward Sweep:* Expands downward only if an entity introduced within the patch is referenced by subsequent lines.


* *Seam Gate:* After infill, the joined text (prefix + patch + suffix) is re-audited for coreference alignment, pronoun clarity, and tense stability. Closures expanding beyond 40% of a scene trigger a human-in-the-loop rewrite gate.





---

### 6. Worthy Additions to the Architecture

The following extensions address four critical operational vectors currently absent from the system design:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARCHITECTURAL EXTENSION SUITE                         │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ 1. AUDIENCE IRONY MATRIX      │ Indexes what the viewer has seen vs. what   │
│    (Dramatic Irony Engine)    │ characters know; schedules narrative reveals│
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 2. TWO-TIERED CONSTRAINTS     │ Separates hard physical laws from soft      │
│    & THE PARDON LEDGER        │ stylistic tendencies; registers waivers     │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 3. CANON REVISION MATRIX      │ Pins episodes to cryptographic canon revs;  │
│    & MIGRATION ADAPTERS       │ separates historical preservation from fixes│
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 4. 4-TEST TRACER BULLET       │ Minimal end-to-end executable test harness; │
│    HARNESS SPECIFICATION      │ proves system invariants before scaling     │
└───────────────────────────────┴─────────────────────────────────────────────┘

```

#### Addition 1: The Audience Epistemic Layer (Dramatic Irony & Suspense Engine)

The existing epistemic vector models only what characters know, creating a major dramatic blind spot: **dramatic tension relies on the delta between character knowledge and audience knowledge**.

If a character uncovers a murder weapon in a closet, the scene operates as surprise if the audience is ignorant, but as suspense if the audience witnessed the killer stash it there three scenes prior.

```typescript
// src/schemas/epistemicAudience.ts
export interface AudienceKnowledgeState {
  revealed_facts: Map<string, {
    revealed_in_episode: string;
    revealed_in_scene: string;
    exposure_type: "EXPLICIT_ON_SCREEN" | "IMPLIED_SUBTEXTUAL" | "FORENSIC_DOCUMENT";
    visibility_hash: string;
  }>;
  withheld_secrets: Set<string>;
}

export type DramaticPacingMode = 
  | "DRAMATIC_IRONY"  // Audience knows fact X; character is ignorant of fact X
  | "SUSPENSE"        // Audience knows catastrophe impending; character operating normally
  | "SURPRISE"        // Audience and character discover fact X simultaneously
  | "MYSTERY";        // Character has more context than audience; withholding details

```

* **Compilation Gate:** When authoring a scene plan, the director declares the intended `DramaticPacingMode`.
* **Context Verification:** If the mode is `DRAMATIC_IRONY`, the compiler asserts that the proposition exists in `AudienceKnowledgeState.revealed_facts` while remaining absent from the speaking character's epistemic horizon.

#### Addition 2: Two-Tiered Constraints and the "Pardon Ledger"

Treating all constraints as binary rules creates brittle storytelling where characters cannot make irrational compromises, break habits under extreme duress, or experience unexpected emotional outbursts. Conversely, ignoring constraints leads to character drift.

The solution is a **Tiered Constraint System with a Formal Waiver/Pardon Ledger**:

```
                              INVARIANT EVALUATION
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        ┌───────────────────────┐             ┌───────────────────────┐
        │   HARD INVARIANTS     │             │   SOFT CONSTRAINTS    │
        │   (Physical/Ontology) │             │   (Voice/Habits/Tics) │
        └───────────┬───────────┘             └───────────┬───────────┘
                    │                                     │
                    ▼                                     ▼
           Violations Fail Build               Evaluated via Loss Function
           (Arms, Slots, Death)                (Overuse, Pacing, Drift)
                    │                                     │
                    ▼                                     ▼
         [ PARDON OVERRIDE GATE ]              Penalty Score Added to Scene
         Requires Signed Waiver Token          Requires no waiver if < Limit

```

1. **Tier 1: Hard Invariants (Physical / Ontological Laws):**
* Physical anatomy, limb count, object possession, death, and spatial reality.
* *Policy:* Zero tolerance. Any breach halts compilation at $T_0$.


2. **Tier 2: Soft Constraints (Voice, Cadence, Behavioral Habits):**
* Refusal vectors, sentence length limits, callback frequencies, emotional avoidance patterns.
* *Policy:* Evaluated via continuous scoring. Breaching a soft constraint incurs a penalty score in the scene manifest.


3. **The Pardon / Waiver Ledger:**
* When an author intentionally breaks a rule for dramatic effect (e.g., Bog, in a moment of pure grief, speaks the forbidden name of a dead comrade), the writer cannot merely bypass the linter.
* They must commit a **Pardon Token** to the ledger:
```json
{
  "waiver_id": "wv_20260920_bog_refusal_break",
  "target_character": "char_bog",
  "violated_constraint": "banned_lexical_token:the_famine_dead",
  "authorized_by": "SHOWRUNNER_DIRECT_KEY",
  "dramatic_justification": "Climactic emotional surrender in Episode 104",
  "consequence_injected": "post_break_state:humiliated_open_grief"
}

```


* The compiler accepts the pardon, logs the break, and automatically updates the character's status to a permanent `Post-Break State`.



#### Addition 3: The Canon Migration Matrix & Historical Pinning

As world rules evolve across seasons, changes to canon risk corrupting historical episodes. If an author refactors the geography of the crawlspaces in Season 2, re-running a build test on Episode 3 of Season 1 must not fail or retroactively alter rendered frames.

```
                      CANON REVISION TIMELINE
  Canon v1.0.0 (SHA: 4a2e...)       Canon v1.1.0 (SHA: 9f1b...)
  ┌─────────────────────────┐       ┌─────────────────────────┐
  │ Ep 001 - Ep 020 Locked  │       │ Ep 021 - Ep 040 Active  │
  └────────────┬────────────┘       └────────────┬────────────┘
               │                                 │
               ▼                                 ▼
   Historical Preservation Mode        Forward Production Mode
   (Reads v1.0.0 Schema & State)       (Reads v1.1.0 Schema & State)
               │                                 │
               └────────► Migration Adapter ◄────┘
                          μ(v1.0 -> v1.1)

```

1. **Immutable Pinning:** Every rendered episode stores the explicit `canon_revision_hash` and `compiler_version` inside its immutable `render_manifest.json`.
2. **Dual-Mode Build Verification:**
* *Historical Mode:* Evaluates past episodes strictly against their pinned canon revision. The historical record never mutates.
* *Remastering Mode:* When an author explicitly triggers a revision conform, the system applies **Schema Migration Functions** ($\mu_{v_1 \to v_2}$):

$$\text{State}_{v2} = \mu_{1 \to 2}(\text{State}_{v1})$$



All mutated scenes are rendered to explicitly tagged variants (e.g., `EP004_remaster_v2.mp4`), preserving the original master.



#### Addition 4: The 4-Test Tracer Bullet Verification Suite

To verify the entire compiler loop before building complex scene suites, the system implements a minimal, five-point integration test harness:

```
                            TRACER BULLET SEAM
                                    │
  [1 Character] ──► [1 Grievance] ──► [1 Scene Plan] ──► [1 TTS Stem] ──► [1 Video Shot]
                                    │
                       Four Non-Negotiable Assertions

```

The test runner executes four definitive invariant checks:

```typescript
// tests/tracerBullet.test.ts
import { describe, it, expect } from 'vitest';

describe('Tracer Bullet Pipeline Harness', () => {
  it('Assertion 1: Deterministic Replay Invariance', async () => {
    // Given identical seeds and canon, event logs must match bit-for-bit
    const runA = await executeTracerRun({ seed: 42 });
    const runB = await executeTracerRun({ seed: 42 });
    expect(runA.eventLogHash).toBe(runB.eventLogHash);
    expect(runA.dialogueAstHash).toBe(runB.dialogueAstHash);
  });

  it('Assertion 2: Pre-Flight Somatic Rejection ($0.00 Cost)', async () => {
    // A character with an amputated arm attempting a bimanual lift must fail at T_0
    const invalidPlan = createInvalidSomaticSetup({ 
      character: 'bog', 
      condition: 'left_arm_paralyzed', 
      required_action: 'BIMANUAL_HEAVE' 
    });
    const result = await evaluatePreFlightSAT(invalidPlan);
    expect(result.satisfiable).toBe(false);
    expect(result.haltStage).toBe('PRE_FLIGHT_INVARIANT_SOLVER');
    expect(result.tokenCostUsd).toBe(0.00);
  });

  it('Assertion 3: Hierarchical Seed Isolation', async () => {
    // Perturbing diffusion render noise must cause zero divergence in narrative AST
    const baseRun = await executeTracerRun({ seed: 101, renderVariance: 0.1 });
    const alteredRenderRun = await executeTracerRun({ seed: 101, renderVariance: 0.9 });
    
    expect(baseRun.dialogueAstHash).toBe(alteredRenderRun.dialogueAstHash);
    expect(baseRun.exposureSheet.frame_budget).toBe(alteredRenderRun.exposureSheet.frame_budget);
    expect(baseRun.renderPlateHash).not.toBe(alteredRenderRun.renderPlateHash);
  });

  it('Assertion 4: Deletion Principle Materialized Fold', async () => {
    // Purging materialized database state and folding events over canon must recreate state exactly
    const originalState = await getMaterializedStateSnapshot();
    await purgeMaterializedDatabase();
    const reconstructedState = await replayEventStreamFromGenesis('canon_v1.0.0');
    expect(reconstructedState).toEqual(originalState);
  });
});

```

---

### Core Principles Summary

| Vector | System Mandate | Enforcement Mechanism | Failure Policy |
| --- | --- | --- | --- |
| **Authority**<br> | The ledger is truth; generative models are untrusted renderers.

 | Pre-generation constraint injection & omission masking.

 | **Hard Halt:** Reject candidate output; zero state mutation.

 |
| **Somatic Reality**<br> | Physical limits bound action generation.

 | Capability-resource models & dual-field discrepancy gates.

 | **Hard Halt:** $O(\min(n,m))$ set intersection blocks downstream calls.

 |
| **Epistemic State**<br> | Characters can only reference accessible knowledge.

 | Omission from prompt context; explicit belief provenance.

 | **Hard Halt:** Facts unreached in the knowledge graph are omitted.

 |
| **Causality**<br> | Prerequisites form a strict DAG; interactions loop over time.

 | Three-color DFS cycle verification on escalation targets.

 | **Hard Halt:** Cycle detection in prerequisites aborts compile.

 |
| **Time & Audio**<br> | Audio waveforms dictate master video frame budgets.

 | Measured TTS durations quantized to absolute 24 fps integer frames.

 | **Hard Halt:** Silent regeneration banned; approved audio stems locked.

 |
| **Continuity**<br> | Narrative mutations invalidate dependent downstream artifacts.

 | Recursive CTE blast-radius tracking & asymmetric MEU repair.

 | **Advisory / Halt:** Dirty flags invalidate cache; human review on $>40\%$ closure.

 |### 1. Mathematical Reconciliation & Quantitative Foundations

Claims regarding probabilities and frame budgets must be derived from calculation rather than assertion, as small arithmetic errors in design documents cascade into miscalibrated simulation weights and drifting render timelines.

```
                     OPPOSED 2d6 PROBABILITY LANDSCAPE (N = 1,296)
  25% ┌────────────────────────────────────────────────────────────────────────┐
      │                                                                        │
  20% │                       ██████  [±1: 21.60%]                             │
      │                       ██████          ██████  [±2: 19.29%]             │
  15% │                       ██████          ██████          ██████  [±3: 16.05%]
      │       ██████ [0:11.27%]██████         ██████          ██████           │
  10% │       ██████          ██████          ██████          ██████   ░░░░░░  │
      │       ██████          ██████          ██████          ██████   ░░░░░░  │
   5% │       ██████          ██████          ██████          ██████   ░░░░░░  │
   0% └───┴───┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───┴────┘
          0      ±1      ±2      ±3      ±4      ±5      ±6      ±7...   ±10
         [     Mutual Wound / Costly Win     ]   [         Clean Win         ]
                 |d| ≤ 2: 52.16%                      |d| ≥ 4: 31.79%

```

#### A. Opposed $2\text{d}6$ Discrete Difference Distribution

When two actors roll independent $2\text{d}6$ dice pools ($A$ and $B$), the margin $D = A - B$ spans the discrete integer domain $[-10, 10]$ across $36 \times 36 = 1,296$ equally probable outcomes. The distribution is not a continuous triangle; it is a symmetric discrete convolution of two triangular distributions.

$$\text{Count}(D = d) = \sum_{s} \text{ways}(s) \times \text{ways}(s - d)$$

| Margin ($d$) | One-Sided Combinations | Total Combinations | Margin Probability | Cumulative $\vert{}D\vert{} \ge d$ | Cumulative Outcome Classification |
| --- | --- | --- | --- | --- | --- |
| **$0$** | 146 | 146 | **11.27%** ($146/1296$) | 100.00% | **Stall / Deadlock**<br> |
| **$\pm 1$** | 140 | 280 | **21.60%** ($280/1296$) | 88.73% | **Mutual Wound**<br> |
| **$\pm 2$** | 125 | 250 | **19.29%** ($250/1296$) | 67.13% | **Costly Win / Concession**<br> |
| **$\pm 3$** | 104 | 208 | **16.05%** ($208/1296$) | 47.84% | **Tactical Shift** |
| **$\pm 4$** | 80 | 160 | **12.35%** ($160/1296$) | 31.79% | **Clean Win Threshold**<br> |
| **$\pm 5$** | 56 | 112 | **8.64%** ($112/1296$) | 19.44% | **Dominant Overrun** |
| **$\pm 6$** | 35 | 70 | **5.40%** ($70/1296$) | 10.80% | **Structural Rout**<br> |
| **$\pm 7$** | 20 | 40 | **3.09%** ($40/1296$) | 5.40% | Critical Rupture

 |
| **$\pm 8$** | 10 | 20 | **1.54%** ($20/1296$) | 2.31% | Critical Rupture

 |
| **$\pm 9$** | 4 | 8 | **0.62%** ($8/1296$) | 0.77% | Catastrophic Fracture

 |
| **$\pm 10$** | 1 | 2 | **0.15%** ($2/1296$) | 0.15% | Absolute Collapse

 |

* **Central Parity:** $\vert{}D\vert{} \le 2$ accounts for $\frac{146 + 280 + 250}{1296} = \frac{676}{1296} = \mathbf{52.16\%}$. Unassisted contests result in narrow outcomes (Mutual Wounds or Costly Wins) more than half the time.


* **Clean Win Base Rate:** An outright Clean Win ($D \ge +4$) occurs naturally in $\frac{80 + 56 + 35 + 20 + 10 + 4 + 1}{1296} = \frac{206}{1296} \approx \mathbf{15.90\%}$ for an individual actor, or $\mathbf{31.79\%}$ across both participants.


* **The Tail Reality:** Margins of $\vert{}D\vert{} \ge 6$ account for $140 / 1296 = \mathbf{10.80\%}$, meaning high-margin blowouts are structural features of the math, not impossible edge cases.



#### B. Mathematical Corrections on Derived Claims

1. **The Leverage Shift ($+3$ Modifier):** Earlier drafts claimed that shifting a contest by $+3$ yields an $81.64\%$ probability of victory. That was an arithmetic error (confounding a single-die target-8 check with an opposed difference).


* A $+3$ modifier requires the base roll difference $D$ to be $\ge -2$ for a positive outcome ($D + 3 \ge 1 \implies D \ge -2$).
* Counting all valid outcomes: $P(D \ge -2) = P(D = -2) + P(D = -1) + P(D \ge 0) = \frac{125 + 140 + 721}{1296} = \frac{986}{1296} = \mathbf{76.08\%}$.
* A $+3$ modifier shifts win probability from $50.00\%$ to $\mathbf{76.08\%}$ (a 26.08 percentage point increase). While not $81.64\%$, this shift remains large enough that unconstrained leverage risks overriding base character attributes. Modifiers must be clamped to $[-2, +2]$.




2. **Point-Shift Sensitivity Near the Center:** A $+1$ shift does not produce a "12–17 percentage point" swing in an opposed duel. That range applies only to a single $2\text{d}6$ roll against fixed targets (e.g., target 8+ shifts by $16.67\%$). On an opposed contest, moving the win boundary by $+1$ captures exactly the probability mass of the adjacent margin step:


* Crossing from tie ($D = 0$) to positive win ($D = 1$) captures $140 / 1296 = \mathbf{10.80\%}$.


* Crossing from losing ($D = -1$) to tie ($D = 0$) captures $146 / 1296 = \mathbf{11.27\%}$.


* Thus, the marginal sensitivity per $+1$ modifier near the center is strictly $\mathbf{10.80\%\text{–}11.27\%}$.



---

### 2. Core Invariants & The Four-Layer Truth Architecture

The foundational design principle remains: **The ledger is the truth; generative models are untrusted rendering workers**.

```
                     THE FOUR-LAYER TRUTH TOPOLOGY
                                     │
      CANON (000.goblin-lore)         │ Version-pinned, immutable physical law
                                     ▼
      EVENT LOG (Historical Stream)  │ Append-only, totally ordered event sequence
                                     ▼
      MATERIALIZED LEDGER (State)    │ State = fold(apply, State_0, Events)
                                     ▼
      MEDIA PROJECTIONS (Derivative) │ Lossy, unratified, non-reproducible artifacts

```

#### A. The Deletion Principle & Media Asymmetry

* **The Deletion Invariant:** If all generative model weights and prompts are wiped, the story universe remains structurally intact within the relational ledger. If the ledger is lost, the universe suffers brain death.


* **The Media Asymmetry:** The state ledger is a primary asset reconstructible from pure source code and event logs. Generated media artifacts (diffusion video plates, neural voice clips) are **non-reproducible** across disparate GPUs, CUDA driver patches, and container revisions. Footage cannot be regenerated bit-for-bit on demand; it is physical evidence that must be archived via content-addressed storage (CAS).



#### B. Unratified Projection Details (Discard / Harvest / Ratify)

Projections generate accidental visual and textual details (e.g., an unscripted pipe wrench, the color of a boiler plate). Unchecked, these details risk becoming de facto canon through model mimicry:

1. **Tier 1 (Ephemeral Noise):** Non-structural details are discarded and carry zero authority over future episodes.


2. **Tier 2 (Harvest Queue):** Recurrent details that anchor dramatic scenes are extracted into an `unratified_details` ledger for human review.


3. **Tier 3 (Formal Ratification):** Once approved by the showrunner, an item is promoted to a canonical possession or location node, assigned a UUID, and sealed into canon.



#### C. The Four-Vector State Partition

The state of any agent is partitioned into four independent vectors to prevent biological constraints from blurring with social dynamics:

* **Somatic Vector:** Physical capability modeling (e.g., `arms_available = 1.0`, `mobility = LIMP`) compiling into negative motor masks (`banned_kinetic_verbs`).


* **Logistical Vector:** Mass and equipment accounting (discrete slots: `worn`, `held`, `slung`, `cached`) enforcing conservation of physical matter.


* **Epistemic Vector:** Information horizons and subjective belief states. Truth is decoupled from belief via structured `BeliefRecords`, and unknown facts are kept off the prompt entirely (**Ignorance by Omission**).


* **Relational Vector:** Interpersonal leverage, standing, obligations, and Strings. Relational debts exist as social facts, independent of whether an individual remembers them.



---

### 3. Structural, Temporal, & Execution Invariants

#### A. Prerequisites DAG vs. Time-Indexed Runtime Graph

* **The Prerequisite Graph is an Acyclic Directed Graph (DAG):** Structural unlocks, grievance escalation ladders, and world facts must form an acyclic graph verified via Three-Color Depth-First Search. Prerequisite cycles cause deadlocks and are rejected at compile time ($T_0$).


* **The Runtime Interaction Graph is Cyclical:** Social grudges, reciprocal debts, and status contests loop naturally. These cycles resolve cleanly through **time-indexing**:



$$A_{t_1} \longrightarrow B_{t_2} \longrightarrow A_{t_3}$$



Because each encounter occupies a distinct integer simulation cycle, the temporal execution stream remains strictly acyclic.



#### B. The Dual-Field Verification Fence

Self-reported model JSON (`extracted_motor_actions: ["LIMP"]`) cannot be trusted alone. The verification stack must execute:

1. **Grammar-Constrained Extraction:** Constrains the JSON action enum using GBNF grammars.


2. **Negation-Aware Lemma Parsing:** Sweeps the raw prose for banned verbs while using dependency parsing to permit negated or modal constructions (e.g., *"he couldn't run"* is valid; *"he ran"* is rejected).


3. **Independent Action Extraction:** A secondary model pass (temperature 0.0) extracts depicted actions from the prose.


4. **Capability-Bounded Discrepancy Gating:** The pipeline rejects scenes where either signal indicates a violation of a constrained capability:

$$\text{Violations} = (\text{Actions}_{\text{SelfReported}} \cup \text{Actions}_{\text{Extracted}}) \cap \text{BannedCapabilityVerbs}$$


$$\text{Violations} \neq \emptyset \implies \text{HALT\_REJECT}$$



Disagreements over non-constrained actions (e.g., `["GLANCE"]` vs `["LOOK"]`) are treated as semantic noise and ignored.



#### C. Fixed-Point Numeric Invariants

Floating-point scalars create non-deterministic serialization variance across hardware architectures and compilers.

* All scalar metrics (condition severity ratings, belief probabilities, damage degradation) are clamped and stored as **fixed-point integers in basis points** ($0 \le x \le 10,000$, representing $0.00\%$ to $100.00\%$).


* Multiplication of basis points uses explicit, single-rule integer division with truncation:

$$\text{Scale}(A, B) = \lfloor (A \times B) / 10000 \rfloor$$



---

### 4. Governance, Lifecycles, & The Scoped Pardon Ledger

#### A. Tiered Constraints & The Scoped Pardon Ledger

Hard physical boundaries require zero-tolerance halts, while artistic prose demands room for dramatic expression. The system establishes two constraint tiers:

* **Tier 1: Hard Physical Invariants (Unpardonable):** Limb counts, physical inventory conservation, geographical occupancy limits, and death. A waiver cannot permit a paralyzed arm to lift a heavy tool.


* **Tier 2: Soft Stylometric Constraints (Pardonable):** Voice cadences, refusal vectors, sentence lengths, and behavioral tics. These are tracked as penalty scores.



```json
{
  "waiver_id": "wv_c9a1f2e4",
  "scope": {
    "episode_id": "ep104",
    "scene_id": "sc02",
    "target_character": "char_bog"
  },
  "violated_constraint": "banned_lexical_token:famine_dead",
  "authorized_by": "SHOWRUNNER_ED_KEY",
  "dramatic_justification": "Climactic admission under maximum grievance strain.",
  "injected_consequence": "status_shift:humiliated_open_grief",
  "expires_at_cycle": 48
}

```

* **Scoped Expiration:** A pardon must be scoped to an exact `(episode_id, scene_id, target_character)` tuple. Standing or perpetual waivers are rejected by the compiler.
* **Invariant Serialization:** Pardon IDs must be content-addressed UUIDs or hashes; embedding human calendar timestamps (`wv_20260920_...`) into structural IDs is forbidden to prevent non-deterministic build hashes.

#### B. Dual-Anchor Canon Migration

When world laws are refactored across production seasons, the historical archive must be protected:

1. **The Twin Anchor:** Every rendered episode manifest records both the `canon_revision_hash` and the `compiler_build_hash`.


2. **Total Migration Functions:** A migration adapter $\mu_{v_1 \to v_2}$ must be mathematically total. For every historical state $S_{v1}$, the migration function must guarantee:

$$\mu_{1 \to 2}(S_{v1}) \in \mathcal{S}_{v2}$$



This is validated via CI property suites that replay historical event streams through the migration adapter to verify valid target states.

---

### 5. Architectural Additions & Operational Hardening

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SYSTEM EXTENSION BLUEPRINT                            │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ 1. UPCASTING EVENT ENVELOPE   │ Decouples historical event schemas from     │
│    (Ledger Schema Evolution)  │ running code using migration adapters.      │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 2. TWO-PHASE TICK COMMIT      │ Eliminates same-tick race conditions via    │
│    (Simulation Concurrency)   │ Read-Phase and Commit-Phase separation.     │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 3. CUMULATIVE MS QUANTIZATION │ Eliminates lip-sync frame drift by sizing   │
│    (Audio Master Clock)       │ video budgets from continuous millisecond sums.│
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 4. 5-ASSERTION TRACER BULLET  │ Extends vertical slice with compile-time    │
│    (Definitive Verification)  │ Ignorance-by-Omission prompt verification.  │
└────────────────────────────────┴─────────────────────────────────────────────┘

```

#### Addition 1: Upcasting Event Envelopes (Ledger Schema Evolution)

As the simulation evolves across seasons, event definitions change. Modifying an event schema risks breaking the replay of historical logs ($S_N = \text{fold}(\text{apply}, S_0, [E])$).

* Events must be stored in a **versioned event envelope**:
```typescript
interface EventEnvelope {
  event_id: string;             // UUIDv7
  sequence_number: bigint;      // Monotonic, gapless integer
  event_type: string;           // e.g., "CHARACTER_DUEL_RESOLVED"
  schema_version: number;       // Integer schema epoch (1, 2, 3)
  occurred_at_cycle: number;
  payload: Record<string, unknown>;
}

```


* **Event Upcasters:** When reading an older event (e.g., version 1), the event store passes the payload through a deterministic chain of pure upcaster functions ($\text{upcast}_{1 \to 2} \to \text{upcast}_{2 \to 3}$) before handing it to `apply()`. Historical event logs remain immutable on disk, while running code processes only the latest schema representation.

#### Addition 2: Two-Phase Commit for Simulation Ticks (Intra-Tick Resolution)

When two agents act within the same simulation cycle, order-of-execution bias can create non-deterministic race conditions (e.g., A takes the wrench, but B takes the wrench during the same cycle):

* **Phase 1 (Read & Propose):** All agents inspect the frozen state at cycle start ($T_{\text{start}}$) and submit intended action envelopes.


* **Phase 2 (Arbitration & Commit):** The engine collects all submissions, evaluates contested spatial and logistical targets via opposed mechanics, determines winners, and applies state deltas in a single, atomic commit phase. All agents advance to $T_{\text{start}} + 1$ simultaneously.



#### Addition 3: Cumulative-Millisecond Master Clock Quantization

The standard frame calculation $F_i = \lceil \frac{D_{\text{ms}}}{1000} \times 24 \rceil$ accumulated per dialogue line introduces ceiling-rounding drift. Across a 12-line scene, fractional milliseconds can inflate the exposure sheet by 6 to 12 frames, causing noticeable audio-video sync drift.

* The pipeline must calculate frame cuts from a **running cumulative millisecond sum**:

$$\text{StartFrame}_k = \left\lceil \frac{\sum_{i=1}^{k-1} \text{DurationMs}_i}{1000} \times 24 \right\rceil$$


$$\text{EndFrame}_k = \left\lceil \frac{\sum_{i=1}^{k} \text{DurationMs}_i}{1000} \times 24 \right\rceil - 1$$


* Video plates are trimmed to match cumulative frame boundaries, ensuring lip-sync and audio cuts remain locked across long scenes.



#### Addition 4: The 5-Assertion Tracer Bullet Specification

The minimal vertical slice (one character, one grievance, one dialogue line, one audio stem, one video plate) must execute five automated assertions to validate the core architecture before expanding features:

```typescript
describe('5-Point Tracer Bullet Verification Harness', () => {
  it('Assertion 1: Deterministic Replay Invariance', async () => {
    // Identical seeds and canon must yield byte-identical dialogue ASTs and event logs
    const runA = await runTracerBullet({ seed: 42 });
    const runB = await runTracerBullet({ seed: 42 });
    expect(runA.eventLogHash).toBe(runB.eventLogHash);
    expect(runA.dialogueAstHash).toBe(runB.dialogueAstHash);
  });

  it('Assertion 2: Pre-Flight Somatic Invariant Rejection ($0.00)', async () => {
    // An amputated limb attempting a bimanual lift must fail at T0 without LLM calls
    const invalidSpec = buildSomaticTestSpec({
      character: 'char_spleen',
      arms_available: 1.0,
      action_attempted: 'BIMANUAL_HEAVE'
    });
    const result = evaluateCapabilitySAT(invalidSpec);
    expect(result.valid).toBe(false);
    expect(result.tokenCostUsd).toBe(0.00);
  });

  it('Assertion 3: Hierarchical Seed Isolation', async () => {
    // Perturbing visual diffusion noise must cause zero divergence in narrative state
    const baseRun = await runTracerBullet({ seed: 101, diffusionNoise: 0.1 });
    const variedRender = await runTracerBullet({ seed: 101, diffusionNoise: 0.9 });
    expect(baseRun.dialogueAstHash).toBe(variedRender.dialogueAstHash);
    expect(baseRun.exposureSheet.frame_budget).toBe(variedRender.exposureSheet.frame_budget);
    expect(baseRun.renderPlateHash).not.toBe(variedRender.renderPlateHash);
  });

  it('Assertion 4: Deletion Principle State Reconstruction', async () => {
    // Purging the materialized state and replaying events over canon must recreate state bit-for-bit
    const originalState = await getMaterializedLedgerSnapshot();
    await purgeMaterializedLedger();
    const rebuiltState = await foldEventStream('canon_v1.0.0');
    expect(rebuiltState).toEqual(originalState);
  });

  it('Assertion 5: Direct Prompt Ignorance-by-Omission', async () => {
    // If a fact is not in a character's epistemic horizon, it must not exist in their prompt context
    const assembledContext = await compileAgentContext({
      character_id: 'char_bog',
      scene_id: 'sc01',
      omitted_facts: ['fact_famine_origin']
    });
    expect(assembledContext).not.toContain('fact_famine_origin');
    expect(assembledContext).not.toMatch(/famine/i);
  });
});

```

---

### Core Principles Reference

| Dimension | System Invariant | Operational Mechanism | Failure Policy |
| --- | --- | --- | --- |
| **System Authority**<br> | The ledger is truth; generative models are untrusted renderers.

 | Pre-generation capability injection & omission masking.

 | **Hard Halt:** Reject candidate draft; zero state mutation.

 |
| **Opposed Contests**<br> | $\vert{}D\vert{} \le 2$ accounts for $52.16\%$ of unmodified rolls.

 | Modifiers clamped to $[-2, +2]$; Strings capped.

 | **Re-calibrate:** Rerun 10k Monte Carlo if balance skews.

 |
| **Numeric Representation**<br> | Floating-point variables banned in serialized state.

 | Fixed-point integers in basis points ($0\text{–}10,000$).

 | **Compile Error:** Non-integer values fail Pass 1 schema.

 |
| **Causal Graphing**<br> | Prerequisites form a strict DAG; interactions loop over time.

 | Three-color DFS cycle verification on escalation targets.

 | **Hard Halt:** Causal cycle aborts compilation at $T_0$.

 |
| **Pardon Protocol**<br> | Hard physical invariants unpardonable; soft voice constraints waiverable.

 | Scoped pardon tokens with mandatory expiration cycles. | **Hard Halt:** Unscoped or hard somatic waivers rejected.

 |
| **Time & Audio**<br> | Measured audio dictates master video frame budgets.

 | Cumulative millisecond sums quantized to 24 fps integer frames.

 | **Hard Halt:** Unmeasured dialogue lines blocked from render.

 |
| **Cache Invalidation**<br> | Mutating upstream canon marks downstream scenes dirty.

 | Recursive CTE dependency walks & asymmetric MEU repair.

 | **Invalidate:** Re-render dirty plates; human review if $>40\%$.

 |### 1. Verified Quantitative Foundations & Execution Timing

#### A. Opposed $2\text{d}6$ Discrete Difference Distribution

When two actors roll independent $2\text{d}6$ dice pools ($A$ and $B$), the margin $D = A - B$ spans the discrete integer domain $[-10, 10]$ across $36 \times 36 = 1,296$ equally probable underlying outcomes. The distribution is a symmetric discrete difference distribution produced by two triangular sums:

$$\text{Count}(D = d) = \sum_{s=2}^{12} \text{ways}(s) \times \text{ways}(s - d)$$

```
                     OPPOSED 2d6 OUTCOME DISTRIBUTION (N = 1,296)
  25% ┌────────────────────────────────────────────────────────────────────────┐
      │                                                                        │
  20% │                       ██████  [±1: 21.60%]                             │
      │                       ██████          ██████  [±2: 19.29%]             │
  15% │                       ██████          ██████          ██████  [±3: 16.05%]
      │       ██████ [0:11.27%]██████         ██████          ██████           │
  10% │       ██████          ██████          ██████          ██████   ░░░░░░  │
      │       ██████          ██████          ██████          ██████   ░░░░░░  │
   5% │       ██████          ██████          ██████          ██████   ░░░░░░  │
   0% └───┴───┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───┴────┘
          0      ±1      ±2      ±3      ±4      ±5      ±6      ±7...   ±10
         [     Mutual Wound / Costly Win     ]   [         Clean Win         ]
                 |D| ≤ 2: 52.16%                      |D| ≥ 4: 31.79%

```

| Margin ($d$) | One-Sided Combinations | Total Combinations | Margin Probability | Cumulative $\vert{}D\vert{} \ge d$ | Cumulative Outcome Classification |
| --- | --- | --- | --- | --- | --- |
| **$0$** | 146 | 146 | **11.27%** ($146/1296$) | 100.00% | **Stall / Deadlock**<br> |
| **$\pm 1$** | 140 | 280 | **21.60%** ($280/1296$) | 88.73% | **Mutual Wound**<br> |
| **$\pm 2$** | 125 | 250 | **19.29%** ($250/1296$) | 67.13% | **Costly Win / Concession**<br> |
| **$\pm 3$** | 104 | 208 | **16.05%** ($208/1296$) | 47.84% | **Tactical Shift** |
| **$\pm 4$** | 80 | 160 | **12.35%** ($160/1296$) | 31.79% | **Clean Win Threshold**<br> |
| **$\pm 5$** | 56 | 112 | **8.64%** ($112/1296$) | 19.44% | **Dominant Overrun** |
| **$\pm 6$** | 35 | 70 | **5.40%** ($70/1296$) | 10.80% | **Structural Rout**<br> |
| **$\pm 7$** | 20 | 40 | **3.09%** ($40/1296$) | 5.40% | Critical Rupture

 |
| **$\pm 8$** | 10 | 20 | **1.54%** ($20/1296$) | 2.31% | Critical Rupture

 |
| **$\pm 9$** | 4 | 8 | **0.62%** ($8/1296$) | 0.77% | Catastrophic Fracture

 |
| **$\pm 10$** | 1 | 2 | **0.15%** ($2/1296$) | 0.15% | Absolute Collapse

 |

#### B. The Win Predicate and Verified Modifier Step Sizes

Defining a strict victory as achieving an argument score advantage after modifier ($D + M \ge 1 \implies D \ge 1 - M$) yields the exact probability profile:

| Effective Modifier ($M$) | Required Base Margin | Qualifying Combinations | Strict Win Probability ($P$) | Marginal Gain ($\Delta P$) |
| --- | --- | --- | --- | --- |
| **$0$** | $D \ge 1$ | 575 | **44.37%** | —

 |
| **$+1$** | $D \ge 0$ | 721 | **55.63%** | $+11.27\%$ ($146/1296$) |
| **$+2$** | $D \ge -1$ | 861 | **66.44%** | $+10.80\%$ ($140/1296$) |
| **$+3$** | $D \ge -2$ | 986 | **76.08%** | $+9.64\%$ ($125/1296$) |
| **$+4$** | $D \ge -3$ | 1090 | **84.10%** | $+8.02\%$ ($104/1296$) |
| **$+5$** | $D \ge -4$ | 1170 | **90.28%** | $+6.18\%$ ($80/1296$) |
| **$+6$** | $D \ge -5$ | 1226 | **94.60%** | $+4.32\%$ ($56/1296$) |

* **The Corrected $+3$ Shift:** Expending a $+3$ leverage modifier shifts strict win probability from $44.37\%$ to **$76.08\%$** (a $+31.71$ percentage point swing). It does not yield $81.64\%$.


* **Diminishing Returns:** The modifier curve is steepest at the origin. The step from $M=0 \to +1$ adds $11.27\%$, whereas $M=+5 \to +6$ adds only $4.32\%$.


* **Operating Point Comparison:** A fixed-target roll of $8+$ on $2\text{d}6$ has a baseline success rate of $15/36 = 41.67\%$. Adding $+1$ increases success to $21/36 = 58.33\%$, a swing of **$16.67$ percentage points**. At comparable baselines (~$42\%\text{--}44\%$), fixed-target checks are **$\approx 1.5\times$ more sensitive** to single-point modifiers than opposed duels ($16.67\%$ vs. $11.27\%$).


* **The Modifier Clamp Rationale:** Capping total modifiers to $[-2, +2]$ bounds the total potential swing to $44.14$ percentage points ($22.27\%$ to $66.44\%$). This confines resolution to the steep portion of the curve where attribute differentials matter, preventing stacked leverage from rendering baseline stats irrelevant.



#### C. Fixed-Point Arithmetic & Integer Round-Half-Even

Floating-point arithmetic introduces non-deterministic serialization variance across runtimes. All condition severities, probabilities, and damage scalings are stored as **fixed-point integers in basis points** ($0 \le x \le 10,000$).

Multiplication of two basis-point quantities ($A, B$) scaled back to basis points must be implemented purely through integer operations:

```typescript
export function scaleBasisPoints(a: bigint, b: bigint): bigint {
  const product = a * b;
  const quotient = product / 10000n;
  const remainder = product % 10000n;

  // Round-Half-Even purely in integer arithmetic
  if (remainder > 5000n) {
    return quotient + 1n;
  } else if (remainder < 5000n) {
    return quotient;
  } else {
    // Exactly 5000: round to nearest even quotient
    return (quotient % 2n === 1n || quotient % 2n === -1n) ? quotient + 1n : quotient;
  }
}

```

#### D. Cumulative-Millisecond Frame Budgeting & Sub-Frame Policy

Per-line ceiling quantization accumulates rounding drift across multi-line scenes. Frame allocations are derived from continuous cumulative millisecond sums:

$$\text{StartFrame}_k = \left\lceil \frac{\sum_{i=1}^{k-1} D_i}{1000} \times 24 \right\rceil, \quad \text{EndFrame}_k = \left\lceil \frac{\sum_{i=1}^{k} D_i}{1000} \times 24 \right\rceil - 1$$

* **The Sub-Frame Failure State:** At $24\text{ fps}$, one frame spans $\approx 41.67\text{ ms}$. If an interjection or breath duration $D_k < 41.67\text{ ms}$, then $\lceil \sum_{1}^{k-1} D \rceil$ may equal $\lceil \sum_{1}^{k} D \rceil$, producing $\text{EndFrame}_k = \text{StartFrame}_k - 1$ (an invalid, negative-length interval).
* **Mandatory Policy:** The exposure sheet compiler enforces an invariant:
1. Any audio asset with $D_k < 42\text{ ms}$ triggers an automatic pad-out to $42\text{ ms}$ (clamping to a minimum 1-frame span).
2. If the audio line cannot be padded without acoustic artifacting, it is merged into the subsequent dialogue window.
3. No exposure sheet entry may emit with $\text{FrameBudget} < 1$.



---

### 2. The Five-Part Ontological Architecture

The universe is modeled as four primitive layers and one derived view.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            THE SYSTEM PRIMITIVES                            │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ 1. CANONICAL LAW              │ Git-versioned Markdown schemas & world      │
│    (000.goblin-lore)          │ axioms. Immutable within a revision hash.   │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 2. HISTORICAL TRUTH           │ Append-only, linear sequence of validated   │
│    (Event Log)                │ state-transition events.                    │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 3. RECORDED INTERMEDIATES     │ Immutable evidence: approved dialogue ASTs, │
│    (External Results Store)   │ TTS waveforms, frame budgets, seed states.  │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 4. SENSORY PROJECTIONS        │ Master video plates, composite audio mix,   │
│    (Media Artifacts)          │ rendered web streams.                       │
└───────────────────────────────┴─────────────────────────────────────────────┘
                                       │
                                       ▼ (Fold Operation)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. MATERIALIZED WORKING STATE │ DERIVED STATE: Reconstructible cache.       │
│    (Relational Ledger / D1)   │ State = fold(apply, State_0, Events)        │
└─────────────────────────────────────────────────────────────────────────────┘

```

#### A. Formal Operational Signatures

The pipeline enforces three distinct operations:

$$\text{Replay}(\mathcal{H}) \longrightarrow \mathcal{S}$$


Reconstructs current working state $\mathcal{S}$ by folding the historical event stream $\mathcal{H}$ over baseline canon $\mathcal{S}_0$. It invokes no external generative models, burns zero tokens, and is completely deterministic.

$$\text{Simulate}(\mathcal{S}_t, \sigma_{\text{sim}}, \theta) \longrightarrow \mathcal{H}_{\text{new}}$$


Evaluates spatial eligibility, grievance lotteries, and mechanical dice duels under seed $\sigma_{\text{sim}}$ and rule configuration $\theta$ to produce an append-only event extension.

$$\text{Render}(\mathcal{H}_t, \mathcal{I}_t, \sigma_{\text{render}}) \longrightarrow \mathcal{A}$$


Projects established history $\mathcal{H}_t$ using recorded intermediate outputs $\mathcal{I}_t$ (cached dialogue ASTs, frozen TTS stems) and visual diffusion noise $\sigma_{\text{render}}$ into a presentation artifact $\mathcal{A}$.

#### B. The Reconstructibility & Storage Manifest

Every system artifact belongs to an explicit storage class defining its source of truth, rebuildability, and backup mandate:

| Artifact Class | Source of Truth? | Rebuildable From | Persistence & Backup Policy |
| --- | --- | --- | --- |
| **Canon Files** (`/characters`, etc.) | **Yes**<br> | *(Nothing)*<br> | Git version control, signed release tags, offsite mirrors.

 |
| **Event Log** (`events.jsonl`) | **Yes**<br> | *(Nothing)*<br> | Append-only, cryptographic hash-chained, multi-cloud replication.

 |
| **Recorded Intermediates** (TTS, ASTs) | **Yes**<br> | *(Nothing)*<br> | Content-addressed storage (CAS), write-once-read-many (WORM).

 |
| **Materialized State** (SQLite/D1) | **No**<br> | Canon + Event Log

 | Ephemeral working cache; zero backup needed; rebuilt on boot.

 |
| **Dependency Graph / Indexes** | **No**<br> | Canon + Event Log

 | In-memory rebuildable; regenerated during compilation passes.

 |
| **Approved Video Masters** | **Yes** *(as evidence)*<br> | *(Non-reproducible)*<br> | Content-addressed object store, cold storage, periodic checksum verification.

 |
| **Unapproved Drafts / Infill Caches** | **No**<br> | Re-execution

 | Purged upon terminal task state; strict 7-day TTL.

 |

---

### 3. Epistemology, Speech Acts, & The Prevention-vs-Detection Matrix

The system separates objective reality, subjective internal belief, and external verbal dialogue:

$$\text{WorldTruth} \neq \text{Belief} \neq \text{Utterance}$$

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│       WORLD TRUTH       │     │     INTERNAL BELIEF     │     │    EXTERNAL UTTERANCE   │
├─────────────────────────┤     ├─────────────────────────┤     ├─────────────────────────┤
│ • Canonical Fact Ledger │ ──► │ • Closed Proposition Set│ ──► │ • Plan-Assigned Act     │
│ • Verified historical   │     │ • Subjective confidence │     │ • Dialogue realization  │
│   state events          │     │ • Source provenance     │     │ • Surface subtext       │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘

```

#### A. Closed Proposition Sets for Belief Lookup

Evaluating open-ended natural language beliefs against truth requires non-deterministic model arbitration. To make belief verification mechanical, the universe defines a closed, enumerated registry of canonical propositions:

```typescript
export interface BeliefRecord {
  belief_id: string;
  holder_id: string;
  proposition_slug: string;          // Maps to an enumerated World Fact ID
  subjective_confidence: number;      // Fixed-point integer: 0 to 10000
  source_type: "DIRECT_OBSERVATION" | "TESTIMONY" | "INFERENCE" | "RUMOR";
  source_event_id: string;          // Points to historical event log entry
  resists_correction: boolean;
}

```

Whether Bog's belief diverges from ground truth is evaluated via an $O(1)$ lookup: does `current_state.facts.get(belief.proposition_slug).status === true` match `belief.subjective_confidence > 5000n`?

#### B. Plan-Assigned Speech Acts

Models cannot be trusted to self-classify their dialogue intent post-hoc. Speech acts are assigned in the **Scene Plan** before prose generation begins:

```typescript
export type SpeechActAssignment = 
  | "ASSERT"     // Speaker believes proposition P with confidence > 8000
  | "BLUFF"      // Speaker believes NOT(P) or is ignorant, but asserts P
  | "DENY"       // Speaker rejects proposition P
  | "QUESTION"   // Speaker probes for proposition P without asserting
  | "DEFLECT"    // Speaker pivots to unrelated proposition Q
  | "WITHHOLD";  // Speaker holds belief P but refuses to speak

```

The downstream AST linter audits whether the realized prose conforms to the assigned speech act. If the plan mandates a `BLUFF` regarding `fact_spoon_location`, the linter verifies that the speaker asserts the spoon's presence in a location that contradicts their own `BeliefRecord`.

#### C. The Prevention-vs-Detection Matrix

System guarantees are explicitly classified by their enforcement mechanism to surface residual operational risk:

| Guarantee | Enforcement Mechanism | Classification | Residual Risk / Failure Mode |
| --- | --- | --- | --- |
| **No Banned Verbs in Action Enum**<br> | GBNF Grammar-constrained decoding

 | **Prevention**<br> | Zero risk; illegal tokens unreachable during decoding.

 |
| **No Banned Verbs in Free Prose**<br> | Dependency-parsed lemma scan + Independent Extraction

 | **Detection**<br> | Non-zero miss rate on novel metaphors or unlisted synonyms.

 |
| **Direct Secret Leakage in Prompt**<br> | Epistemic context filter (Ignorance by Omission)

 | **Prevention**<br> | Zero risk; facts outside horizon not assembled into prompt.

 |
| **Inferential Secret Leakage**<br> | Sentry model evaluation pass on candidate dialogue

 | **Detection**<br> | Model may deduce unstated secret from secondary clues.

 |
| **Deterministic State Replay**<br> | Pure mathematical fold over validated event log

 | **Prevention**<br> | Zero risk; guaranteed if `apply()` is mathematically total.

 |
| **Contest Outcome Validity**<br> | Opposed $2\text{d}6$ code table with mandatory void fallbacks

 | **Prevention**<br> | Zero risk; unhandled exceptions structurally impossible.

 |
| **Physical Capability Limits**<br> | Pre-flight arithmetic SAT solver ($R_{\text{hands}} \le A_{\text{hands}}$)

 | **Prevention**<br> | Zero risk for declared fields at compile time ($T_0$).

 |
| **Stylometric Voice Separation**<br> | Post-hoc stylometric variance scoring

 | **Detection**<br> | Advisory warnings; can drift if sample length is short.

 |

---

### 4. Execution, Concurrency, & Governance

#### A. Linear Authoritative Log vs. Namespaced Branch Forks

* **The Canonical Log is Strictly Linear:** The primary event log of the universe contains no tree forks or graph merges. State transitions form an append-only chain where every event commits to the hash of its immediate predecessor:



$$H_k = \text{SHA256}(H_{k-1} \parallel \text{SerializeCanonical}(E_k))$$



* **Branching Belongs to Speculative Namespaces:** What-if simulation runs, alternate scene takes, and draft branches live in separate, non-authoritative namespaces. A speculative branch carries a `forked_from_event_hash` pointer. Promoting a speculative branch to canon requires appending its events sequentially onto the end of the linear authoritative log via showrunner ratification.



#### B. Two-Phase Commit for Simulation Ticks (Intra-Tick Concurrency)

To prevent execution-order bias when multiple agents act within the same simulation cycle, ticks resolve via a two-phase transaction:

1. **Phase 1 (Read & Propose):** All agents evaluate the immutable state at tick start ($T_{\text{start}}$) and submit intended action envelopes to the staging buffer.


2. **Phase 2 (Arbitrate & Commit):** The engine detects resource contention (e.g., two agents vying for the same tool in the same cell), resolves disputes via opposed $2\text{d}6$ duel math, executes state mutations, and increments the cycle clock to $T_{\text{start}} + 1$ simultaneously.



#### C. The Scoped Pardon Ledger

To prevent rigid constraints from stifling dramatic breakthroughs while protecting physical reality, exceptions require explicit governance:

* **Hard Somatic Invariants are Unpardonable:** A character with an amputated arm cannot be granted a waiver to perform a bimanual lift. Physical reality cannot be waived.


* **Soft Stylistic Constraints are Pardonable:** Refusal vectors, sentence-length floors, and voice constraints can be bypassed using an authenticated, scoped pardon token:



```json
{
  "waiver_id": "wv_8f1c4e92",
  "scope": {
    "episode_id": "ep104",
    "scene_id": "sc02",
    "target_character": "char_bog"
  },
  "violated_constraint": "banned_lexical_token:the_famine_dead",
  "authorized_by": "SHOWRUNNER_ED_KEY",
  "dramatic_justification": "Climactic admission under maximum grievance strain.",
  "injected_consequence": "status_shift:humiliated_open_grief",
  "expires_at_cycle": 48
}

```

Pardons must be scoped to an exact `(episode_id, scene_id, target_character)` tuple and carry a defined expiration cycle. Standing or perpetual waivers are rejected by the compiler.

#### D. Pipeline Failure Budgets & Rejection Telemetry

A verification gate that fails on soft stylistic edge cases risks stalling production. The pipeline enforces an operational failure policy:

* **Bounded Retries:** If a candidate dialogue pass trips a somatic or epistemic gate, the engine feeds the violation back as a negative constraint for up to **two retries**.


* **Circuit Breakers:** If an extraction pass fails three consecutive attempts, the generation task terminates, discards the draft, and logs an **Escalation Ticket** to the showrunner dashboard.


* **Operational Telemetry:** Linters log rejection reasons into a structured ledger:



$$\text{FalsePositiveRate}(\text{Rule}) = \frac{\text{ManualOverrides}(\text{Rule})}{\text{TotalInvocations}(\text{Rule})}$$



Any rule with an override rate $> 5\%$ is flagged for calibration.



---

### 5. Architectural Additions & Uncovered Nuances

#### Addition 1: Explicit Preserved vs. Variable Contract for Re-Renders

Because diffusion video plates and neural audio synthesis are non-reproducible at the bit level, a "re-render" requires clear boundaries between what is locked and what may vary:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RE-RENDER INVARIANCE CONTRACT                         │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ PRESERVED INVARIANTS (Exact Match)   │ VARIABLE PROPERTIES (Stochastic)     │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Total scene frame budget (integer) │ • Pixel-level diffusion noise        │
│ • Shot cut boundaries & timestamps   │ • Secondary lighting bloom & grain   │
│ • Audio dialogue stem hashes         │ • Minor fabric/hair particle physics │
│ • Character presence & screen side   │ • Background environmental dust drift│
│ • Dialogue AST state snapshot hash   │                                      │
└──────────────────────────────────────┴──────────────────────────────────────┘

```

A re-render test passes if and only if all Preserved Invariants match their recorded intermediate metadata bit-for-bit, while the output plate SHA diverges from the previous render.

#### Addition 2: Domain-Separated, Versioned Randomness

To prevent visual tweaks from altering narrative history, pseudorandom generation uses domain separation:

$$\text{Seed} = \text{HMAC-SHA256}(\text{MasterSeed}, \, \text{DomainPrefix} \parallel \text{EntityID} \parallel \text{SeedSchemeVersion})$$

* `domain:sim:movement`
* `domain:sim:duel`
* `domain:render:diffusion`
* `domain:render:grain`

Altering a diffusion seed or adjusting grain density cannot shift the seed of a mechanical duel, preserving narrative outcomes even when visual presentation is varied.

#### Addition 3: Network-Isolated Test Sandboxing

Asserting that an internal client call counter (`modelClient.callCount === 0`) equals zero does not prove that no external calls were made.

The pre-flight invariant test suite runs within an environment that physically unbinds outbound network sockets and scrubs API credentials. Any covert network attempt throws an `EPERM` socket exception, verifying that Pass 1 invariant validation operates entirely offline at $\$0.00$ cost.

#### Addition 4: The 5-Assertion Tracer Bullet Test Suite

The vertical slice (one character, one grievance, one dialogue line, one audio stem, one video plate) executes five automated assertions to validate the core architecture before expanding features:

```typescript
// tests/tracerBullet.test.ts
import { describe, it, expect } from 'vitest';

describe('5-Point Tracer Bullet Verification Harness', () => {
  it('Assertion 1: Deterministic Replay Invariance', async () => {
    // Identical seeds and canon must yield byte-identical dialogue ASTs and event logs
    const runA = await runTracerBullet({ seed: 42 });
    const runB = await runTracerBullet({ seed: 42 });
    expect(runA.eventLogHash).toBe(runB.eventLogHash);
    expect(runA.dialogueAstHash).toBe(runB.dialogueAstHash);
  });

  it('Assertion 2: Pre-Flight Somatic Invariant Rejection ($0.00)', async () => {
    // An amputated limb attempting a bimanual lift must fail at T0 without LLM calls
    const invalidSpec = buildSomaticTestSpec({
      character: 'char_spleen',
      arms_available: 1.0,
      action_attempted: 'BIMANUAL_HEAVE'
    });
    const result = evaluateCapabilitySAT(invalidSpec);
    expect(result.valid).toBe(false);
    expect(result.tokenCostUsd).toBe(0.00);
  });

  it('Assertion 3: Hierarchical Seed Isolation', async () => {
    // Perturbing visual diffusion noise must cause zero divergence in narrative state
    const baseRun = await runTracerBullet({ seed: 101, diffusionNoise: 0.1 });
    const variedRender = await runTracerBullet({ seed: 101, diffusionNoise: 0.9 });
    expect(baseRun.dialogueAstHash).toBe(variedRender.dialogueAstHash);
    expect(baseRun.exposureSheet.frame_budget).toBe(variedRender.exposureSheet.frame_budget);
    expect(baseRun.renderPlateHash).not.toBe(variedRender.renderPlateHash);
  });

  it('Assertion 4: Deletion Principle State Reconstruction', async () => {
    // Purging the materialized state and replaying events over canon must recreate state bit-for-bit
    const originalState = await getMaterializedLedgerSnapshot();
    await purgeMaterializedLedger();
    const rebuiltState = await foldEventStream('canon_v1.0.0');
    expect(rebuiltState).toEqual(originalState);
  });

  it('Assertion 5: Direct Prompt Ignorance-by-Omission', async () => {
    // If a fact is not in a character's epistemic horizon, it must not exist in their prompt context
    const assembledContext = await compileAgentContext({
      character_id: 'char_bog',
      scene_id: 'sc01',
      omitted_facts: ['fact_famine_origin']
    });
    expect(assembledContext).not.toContain('fact_famine_origin');
    expect(assembledContext).not.toMatch(/famine/i);
  });
});

```

---

### Core Specification Reference

| System Dimension | Operational Invariant | Enforcement Mechanism | Failure Policy |
| --- | --- | --- | --- |
| **System Authority**<br> | The ledger is truth; generative models are untrusted renderers.

 | Pre-generation capability injection & omission masking.

 | **Hard Halt:** Reject candidate draft; zero state mutation.

 |
| **Opposed Contests**<br> | $\vert{}D\vert{} \le 2$ accounts for $52.16\%$ of unmodified rolls.

 | Modifiers clamped to $[-2, +2]$; Strings capped.

 | **Re-calibrate:** Adjust weight $W \le 1.5$ if leverage dominates.

 |
| **Numeric Representation**<br> | Floating-point variables banned in serialized state.

 | Fixed-point integers in basis points ($0\text{–}10,000$).

 | **Compile Error:** Non-integer values fail Pass 1 schema.

 |
| **Causal Graphing**<br> | Prerequisites form a strict DAG; interactions loop over time.

 | Three-color DFS cycle verification on escalation targets.

 | **Hard Halt:** Causal cycle aborts compilation at $T_0$.

 |
| **Pardon Protocol**<br> | Hard physical invariants unpardonable; soft voice constraints waiverable.

 | Scoped pardon tokens with mandatory expiration cycles.

 | **Hard Halt:** Unscoped or hard somatic waivers rejected.

 |
| **Time & Audio**<br> | Measured audio dictates master video frame budgets.

 | Cumulative millisecond sums quantized to 24 fps integer frames.

 | **Hard Halt:** Sub-frame audio lines clamped or merged.

 |
| **Cache Invalidation**<br> | Mutating upstream canon marks downstream scenes dirty.

 | Recursive CTE dependency walks & asymmetric MEU repair.

 | **Invalidate:** Re-render dirty plates; human review if $>40\%$.

 |I read the full 5,987-line `goblin-lore.md`, not just the portion that was initially visible. The document is much more interesting than a conventional “lore bible.” Its strongest idea is that **fictional reality can be treated as a compiled, testable system of laws rather than a pile of prose that an AI is expected to remember.**

The most valuable material can be condensed substantially without losing the underlying architecture.

## The central idea

The deepest concept in the document is this:

> **The narrative world has laws; the simulation may explore consequences of those laws; media is merely a projection of the resulting state.**

That distinction is more important than Goblins, Markdown, Zod, TypeScript, Remotion, SQLite, or any specific implementation technology.

The document's fictional premise itself reinforces the architecture: the goblin family is terrified of being seen by the human world and consequently becomes bad at truly seeing one another. The physical setting—crawlspaces beneath the house, the warm pipe, pantry wall, attic stair, and splinter gap—turns the entire world into a constrained topology where geography, fear, scarcity, secrecy, and interpersonal conflict all reinforce one another. 

That gives you an unusually strong correspondence:

**Diegetically:** the family lives inside a hidden, constrained system.

**Architecturally:** the narrative engine also lives inside a constrained system.

**Dramatically:** characters cannot freely act outside their physical, social, and epistemic limitations.

**Computationally:** the generator cannot freely produce states outside its compiled invariants.

That is the real intellectual core.

---

# 1. `goblin-lore` is not really a wiki

Calling it a “lore database” undersells what the document describes.

The better description is:

> **A compiler for fictional reality.**

A normal lore document says:

> “Bog has an injured arm.”

The system described here says something much stronger:

> “Bog has an injured arm; therefore certain physical states are mathematically unavailable; therefore certain actions are prohibited; therefore generated dialogue and scene descriptions cannot legally depict those actions; therefore downstream visual and audio generation must inherit the same restriction.”

That is an enormous conceptual difference.

The purpose of compilation is consequently not merely to check whether the Markdown is well formatted. It is to make **invalid fictional states unrepresentable before generation begins.** The document explicitly identifies this as preventive compilation rather than mere dangling-pointer protection. 

This is perhaps the single most valuable principle in the entire file.

---

# 2. Separate four different kinds of truth

The architecture becomes much clearer when reduced to four layers.

### Layer 1 — Canonical law

This is what the world *is allowed to be*.

Examples:

* anatomy
* physical limits
* world axioms
* geographical relationships
* possessions
* character identities
* permanent injuries
* established secrets
* social rules
* possible/impossible states

This is the role of `goblin-lore`.

### Layer 2 — Historical events

This is what *actually happened*.

For example:

```text
Cycle 41:
Bog lost the spoon.

Cycle 42:
Spleen discovered it.

Cycle 43:
Bog confronted Spleen.

Cycle 44:
The conflict escalated.

Cycle 47:
Wart died.
```

The document eventually arrives at precisely this distinction through its “Tripartite Truth Boundary”: **Event Log → Materialized State → Media Projection.** 

### Layer 3 — Current working state

This is the system's answer to:

> “What is true right now?”

Current location, current injury severity, cooldown counters, current leverage, paranoia clocks, inventory, and similar values belong here.

The document correctly insists that this mutable state should not constantly rewrite the static lore files. Instead it belongs in a runtime relational ledger or event-sourced system. Permanent consequences can later be promoted into canon through an explicit review process. 

### Layer 4 — Media projections

The screenplay, animation, audio, camera movements, prose, sprites, etc. are **representations of the underlying state**.

This is extremely important.

The video is not the truth.

The screenplay is not the truth.

The dialogue AST is not the truth.

They are *projections* of truth.

That makes the architecture much more robust because you can regenerate a projection without changing the world itself.

---

# 3. The most important boundary: law versus state

The document repeatedly circles around one principle that deserves to become an explicit constitutional rule:

> **Static canon constrains the possible; runtime state records the current; history records what happened; media depicts the result.**

That solves a fundamental problem in generative storytelling.

Without such a boundary, you get:

```text
LLM says something
        ↓
scene happens
        ↓
world state changes
        ↓
Markdown changes
        ↓
compiler changes
        ↓
previous scenes become invalid
        ↓
more scenes regenerate
        ↓
new contradictions appear
        ↓
everything drifts
```

The document instead proposes:

```text
CANON
  ↓
SIMULATION
  ↓
EVENT
  ↓
STATE DELTA
  ↓
REVIEW
  ↓
CANON PROMOTION
  ↓
NEW CANON VERSION
```

That is much closer to a version-controlled legal system than a traditional writers' room.

And that is exactly why the “human canon gate” matters.

---

# 4. The simulator should propose reality, not silently redefine it

One of the strongest ideas is the distinction between **simulation time** and **historical ratification**.

Suppose the simulation determines:

> Wart dies in Cycle 47.

During the simulation, that is a runtime fact.

But it should not automatically rewrite every source-of-truth document.

Instead:

```text
simulation
    ↓
state_delta.json
    ↓
episode locked
    ↓
continuity review
    ↓
human approval
    ↓
canonical modification
    ↓
recompile
```

This is essentially **version-controlled constitutional amendment for a fictional universe.**

The document describes exactly this transition and uses permanent death/injury as the important example. 

The insight is broader than death.

It applies to:

* permanent injuries
* destroyed objects
* changed relationships
* discovered secrets
* altered geography
* changed political structures inside the fictional world
* permanent departures
* irreversible resource consumption
* major world revelations

The critical distinction is:

**runtime fact ≠ canonical fact**

until the fact passes the ratification boundary.

---

# 5. The three state vectors are extremely useful

The document's division of character state into **Somatic, Logistical, and Epistemic** is one of the strongest pieces of the design. 

### Somatic

What can the body physically do?

Examples:

* locomotion
* injuries
* limb functionality
* motor restrictions
* speech limitations
* breathing
* acoustic characteristics

### Logistical

What does the character physically possess or control?

Examples:

* held objects
* worn objects
* carried objects
* mass
* resources
* current location

### Epistemic

What does the character know, believe, conceal, or misunderstand?

Examples:

* secrets
* leverage
* relationships
* information asymmetry
* emotional subjects they cannot directly name

This division matters because generative systems tend to collapse all three into a fuzzy sentence such as:

> “Bog is hurt and angry and has the spoon.”

The architecture forces those statements apart into different kinds of truth.

That gives you much better causal reasoning.

An injury affects **Somatic** capability.

A spoon affects **Logistical** state.

Knowing that someone stole the spoon affects **Epistemic** state.

Those are not the same thing and should not be stored or reasoned about identically.

---

# 6. Negative constraints are more powerful than prompts

This is another particularly good insight.

Traditional prompting says:

> “Remember that Bog cannot use his right arm.”

The architecture says:

```text
active_condition:
    BRACHIAL_PLEXUS_RIGHT
    severity: 1.0

→ compile capability mask

→ banned actions:
    heave_two_handed
    climb
    vault
    sprint
```

Then the generated scene is checked against that machine-readable restriction.

That is fundamentally safer than hoping the model remembers a sentence from several thousand tokens earlier.

The document extends this into a dual verification mechanism:

1. inspect the structured action representation
2. independently inspect the prose

This protects against the extremely important case where a model says in metadata:

```text
action = LIMP
```

while the prose says:

> “He sprinted across the room.”

The architecture therefore treats the structured representation as untrusted and checks the actual language independently. That is a very good principle. 

---

# 7. The hand-capacity example is more important than it looks

At first glance the hand-capacity equation looks overly technical:

$$
\sum s.\text{occupies\_hands}
\le
2.0-\text{impairment penalty}
$$

But the underlying principle is excellent:

> **Narrative actions should be constrained by resource availability.**

The same architecture could apply far beyond hands.

You can generalize it to:

### Physical resources

* hands
* legs
* vision
* hearing
* lung capacity
* strength
* mobility

### Material resources

* ammunition
* fuel
* food
* money
* tools
* available workspace

### Cognitive resources

* knowledge
* attention
* memory
* time
* confidence

### Social resources

* trust
* authority
* leverage
* secrecy
* reputation

Once you see the system this way, the “story compiler” becomes a **resource-constrained state-transition system**.

That is considerably more general and interesting than a lore compiler.

---

# 8. Grievances are not merely plot points

This may be the best dramatic idea in the document.

A **Grievance** is effectively a state machine:

```text
surface conflict
      ↓
escalation
      ↓
higher tension
      ↓
hidden cause exposed
      ↓
new conflict unlocked
```

The silver-spoon dispute is therefore not merely “a scene about a spoon.”

It is an entry point into deeper causal structure:

```text
spoon dispute
     ↓
hoarding accusation
     ↓
survival anxiety
     ↓
famine history
```

The result is a graph of narrative causality rather than a list of scenes.

The document's “Therefore / But” concept captures the essential difference:

**And then**

is sequence.

**Therefore / But**

is causality.

The latter produces dramatic momentum because each state creates conditions for the next state. 

That is a useful general principle:

> **Plot becomes substantially more powerful when events are represented as causal dependencies rather than chronological appointments.**

---

# 9. The DAG is valuable—but only for one kind of graph

The document is right to reject circular causal spawning.

For example:

```text
A → B → C → A
```

can produce infinite escalation or invalidation loops.

The DFS approach is a perfectly sensible way to detect this. The three-state model—

* WHITE
* GRAY
* BLACK

—is standard and appropriate for detecting directed cycles.

But here is an important refinement I would add:

### Do not make “the entire narrative system must be acyclic.”

That would be too restrictive.

Real stories contain recurrence.

Characters revisit:

* the same locations
* the same resentments
* the same rituals
* the same relationships
* the same topics

A **causal unlock graph** can be acyclic while the **runtime state machine** remains cyclic.

That distinction should be explicit:

```text
CAUSAL GRAPH
A → B → C
(no cycles)

RUNTIME STATE MACHINE
A ⇄ B ⇄ A
(recurring behavior allowed)
```

This is one of the most important architectural clarifications I would make.

The document sometimes gets close to this distinction but would benefit from making it constitutional rather than implicit.

---

# 10. Dangling pointers matter—but they are not the heart of the system

The document itself eventually recognizes this.

A dangling pointer is simply something like:

```text
Bog → tin_spoon
```

when `tin_spoon` does not exist.

That matters enormously for machine reliability.

But dangling-pointer prevention is analogous to:

> “Does every variable point to something real?”

It does not define:

> “What reality is permitted to exist?”

So I would rank the architecture conceptually like this:

```text
1. World invariants
2. Truth/state separation
3. Causality
4. Determinism
5. Lifecycle/governance
6. Referential integrity
```

Referential integrity is the connective tissue.

It is not the philosophical center.

The document's own “four pillars” correctly places physical constraints, graph integrity, cycle detection, and deterministic sealing together rather than treating foreign-key validation as the whole system. 

---

# 11. Determinism is more important than it initially appears

The deterministic serialization section is not merely engineering housekeeping.

It establishes an important philosophical property:

> **The same world must compile to the same world.**

If key ordering, timestamps, random seeds, or environmental values can change the resulting canonical artifact, you no longer know whether two different results represent genuine narrative changes or merely build noise.

The document therefore prohibits:

* dynamic timestamps
* ambient randomness
* unstable object-key ordering
* mutable environmental contamination

and recursively canonicalizes the state before hashing it. It also preserves authored array order because arrays can encode causal sequence. 

That is excellent.

There is an especially important insight here:

### Randomness should exist in simulation, not in canon compilation.

That distinction should probably be elevated even further.

For example:

```text
CANON COMPILER
deterministic

       ↓

SIMULATION
seeded randomness

       ↓

MEDIA RENDER
independent derived randomness
```

The document's later recommendation for hierarchical child seeds is particularly good: changing visual randomness should not change story outcomes. 

---

# 12. The multi-series abstraction is the right generalization

The transition from:

```text
goblin-lore
```

to:

```text
lore-engine
    ↓
series/
    ├── under-the-floorboards
    ├── deep-space-salvage
    └── wiregrass-basin
```

is conceptually sound.

The important abstraction is not “Goblin.”

It is:

```text
Agent
Debt
Location
Possession
World Axiom
Constraint
State
Event
Projection
```

This gives you a reusable narrative ontology.

The file explicitly proposes separating **meta-ontology** from **story instances**, along with a universal tuple:

$$
\langle \mathcal S,\mathcal A,\mathcal I,\mathcal R_m\rangle
$$

where:

* \(\mathcal S\) = state space
* \(\mathcal A\) = possible actions
* \(\mathcal I\) = invariants
* \(\mathcal R_m\) = medium projection rules

That is probably the cleanest mathematical abstraction in the whole document. 

It says, in effect:

> A narrative universe is a state space constrained by laws, transformed by actions, and projected into a medium.

That is a very general computational model.

---

# 13. The “never resolve the mystery” rule is unusually important

The deliberately unresolved canon is one of the strongest storytelling decisions in the document.

The system explicitly says that certain questions must remain unknown:

* what `the_famine` truly was
* what happened to the missing family member
* what exactly `the_pantry_watcher` is
* whether other goblin societies exist

And the generation engine is forbidden from resolving them casually.

This deserves to be generalized into a formal concept:

> **Unknown is a legitimate state.**

That means an epistemic model should distinguish at least:

```text
KNOWN TRUE
KNOWN FALSE
UNKNOWN
DISPUTED
FALSE BELIEF
WITHHELD
UNRESOLVED BY CANON
```

This is more powerful than a simple boolean `known_secret`.

It prevents an especially dangerous generative-model failure:

> converting ambiguity into fabricated certainty.

The document is already heading in this direction with its epistemic vector and unresolved-canon principle. 

---

# 14. The family itself has an elegant thematic engine

The strongest story-world elements should not be lost underneath the engineering.

The most valuable ones are:

### The humans are an environment, not ordinary characters.

The Upstairs is treated as an atmospheric threat rather than merely a cast of human people.

That is excellent because it turns ordinary household phenomena into existential events:

* footsteps
* silverware
* voices
* temperature
* floorboards
* appliance noises
* food smells

The humans don't have to appear frequently.

They can function almost like weather.

### The geography is psychologically meaningful.

The pantry isn't merely a room.

It is contested territory.

The attic stair isn't simply a staircase.

It is the boundary of exposure.

The warm pipe is not merely a pipe.

It is communal territory and a shared ritualized fear.

That means **space itself participates in the drama.**

### The economy is materially embodied.

Scrap, Shine, and Weight are especially valuable because they make economics physical.

Instead of saying:

> “Bog owes Spleen social capital,”

the story can literally involve:

* a button
* a bead
* a nail
* a tool
* a ration

That is much easier to dramatize.

---

# 15. The strongest overall synthesis

I would reduce the entire project to this diagram:

```text
                 WORLD LAW
                    │
                    ▼
            ┌─────────────────┐
            │ CANONICAL STATE │
            │ What may exist  │
            └────────┬────────┘
                     │
                     ▼
             ACTION / CHOICE
                     │
                     ▼
             ┌───────────────┐
             │   SIMULATION  │
             │ What happens? │
             └───────┬───────┘
                     │
                     ▼
                  EVENTS
                     │
                     ▼
             ┌───────────────┐
             │ RUNTIME STATE │
             │ What is true  │
             │ right now?    │
             └───────┬───────┘
                     │
                     ▼
             STATE DELTA
                     │
                     ▼
              HUMAN REVIEW
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
      REJECT                  RATIFY
                                │
                                ▼
                         NEW CANON VERSION
                                │
                                ▼
                       DETERMINISTIC BUILD
                                │
                                ▼
                          MEDIA PROJECTION
                  ┌────────┬────────┬────────┐
                  ▼        ▼        ▼        ▼
                prose   dialogue  audio    video
```

That is the system.

Everything else is implementation.

---

# 16. The most important things I would add

Here are the additions I think genuinely strengthen the architecture rather than merely make it larger.

## A. Give every fact an explicit authority level

Every piece of information should answer:

> **Who is allowed to declare this true?**

For example:

```text
AXIOM
CANON
EVENT
RUNTIME_STATE
PROJECTION
SPECULATION
```

This would prevent accidental promotion of generated prose into canonical fact.

---

## B. Treat provenance as a first-class property

Every permanent fact should ideally have something equivalent to:

```yaml
origin:
  type: episode
  episode_id: ep047
  event_id: evt_004921
  approved_by: showrunner
  approved_at_revision: abc123
```

Then every canonical fact becomes auditable.

You don't merely know:

> Wart is dead.

You know:

> Wart became canonically dead because Event X occurred in Episode Y and was ratified in revision Z.

That is enormously valuable.

---

## C. Separate “unknown” from “broken”

This is particularly important for AI.

These are radically different:

```text
UNKNOWN:
We deliberately do not know what happened.

BROKEN:
The system failed to determine what happened.

ABSENT:
The asset does not exist.

INTENTIONALLY ABSENT:
The asset is supposed not to exist.

WAIVED:
The absence has been explicitly accepted.
```

The document's later proposal for `INTENTIONALLY_ABSENT`, `WAIVED`, and `VALID` is excellent and should probably become a universal framework rather than an asset-specific patch. 

---

## D. Treat causal graphs and temporal state machines as different mathematical objects

This is the biggest architectural refinement I would make.

Use:

$$
G_c=(V,E_c)
$$

for causal unlocking.

Require:

$$
G_c \text{ is acyclic}
$$

But separately use:

$$
M=(S,A,T)
$$

for runtime state transitions.

And allow:

$$
s_i \rightarrow s_j \rightarrow s_i
$$

when recurring behavior is legitimate.

This prevents the DAG doctrine from accidentally banning cyclical character behavior.

---

## E. Hash the thing you actually mean to identify

The document correctly uses SHA-256 as a deterministic state fingerprint.

One nuance worth tightening:

The source code example hashes the normalized entity payload and then constructs an envelope containing other values such as `schemaVersion` and `entityCount`.

If the goal is:

> “This hash identifies the complete canonical artifact,”

then the canonical envelope itself should be normalized and hashed, rather than having metadata outside the hashed payload.

And if the system needs protection against malicious replacement rather than merely accidental drift, a bare SHA-256 is insufficient; the digest needs an external trust anchor or signature.

That is an architectural distinction between:

**integrity checking**

and

**authenticity verification.**

---

# 17. There are a few internal inconsistencies worth correcting

These are important because you asked specifically for the most **true** and useful information.

### “Two-pass compiler” versus “Pass 3”

The document sometimes describes the compiler as a **two-pass compiler**, but later clearly defines:

* Pass 1 — invariant validation
* Pass 2 — relational/graph validation
* Pass 3 — deterministic sealing

So the cleanest terminology is probably:

> **three-pass compiler with two validation passes plus a deterministic sealing pass**

or simply:

> **three-pass compiler.**

The current terminology is slightly inconsistent.

### “Five-stage verification pipeline”

The document calls this a five-stage pipeline, but numbers the stages:

* Stage 0
* Stage 1
* Stage 2
* Stage 3
* Stage 4
* Stage 5

That's actually **six numbered stages**.

This is trivial technically but important conceptually because documentation about governance should itself be internally exact. 

### “Immutable law”

The law is not literally immutable.

It is better understood as:

> **immutable within a canonical revision.**

The document itself describes permanent changes being promoted into new canonical revisions.

### Retired entities

There is a subtle tension between:

> “references to retired entities are invalid”

and the later `_retired/` architecture, which deliberately preserves retired entities for historical auditability.

The cleaner rule is:

```text
ACTIVE DEPENDENCY
→ retired target forbidden

HISTORICAL REFERENCE
→ retired target permitted
```

The document's deletion principle is actually compatible with that interpretation: retired entities remain in the historical corpus but are removed from active selection. 

---

# 18. What I would stop spending so much attention on

There is a lot in the document that is technically interesting but less important than the central model.

I would demote:

* specific package names
* `Jules`
* vendor-specific rendering details
* repeated CLI examples
* enormous TypeScript snippets
* individual filesystem mechanics
* excessive implementation diagrams
* repeated explanations of dangling pointers
* small variations on the same validator
* overly elaborate terminology for concepts already established

Those things become valuable **after the minimal system proves itself**.

The document itself eventually reaches exactly the right conclusion:

> stop expanding the architecture and execute a tiny end-to-end “tracer bullet.”

That tracer bullet is:

```text
one character
+
one grievance
+
one line
+
one shot
+
one audio stem
```

and the objective is to prove that one event can travel from world state to a reproducible media artifact. 

That is probably the most practically important recommendation in the final section.

---

# 19. The health/telemetry concepts are worth keeping

The document's later “health” system contains a surprisingly important idea:

> a story corpus can become structurally unhealthy even when every individual file is technically valid.

For example, one relationship can become overloaded with conflict while another receives none.

The dyadic coverage metric identifies this:

$$
S_{\text{dyad}}(\{u,v\}) = G_{\{u,v\}}
$$

where the system examines how many active grievances exist between each pair. 

This is useful because **validity and vitality are different things.**

A corpus can be:

```text
VALID
but
BORING
```

or:

```text
VALID
but
UNBALANCED
```

or:

```text
VALID
but
OVERCOUPLED
```

or:

```text
VALID
but
FULL OF DEAD LORE
```

That suggests an important higher-level distinction:

### Compiler

asks:

> Is this legal?

### Health system

asks:

> Is this alive?

That's a powerful distinction.

---

# 20. The final architecture I would keep

After stripping away most of the implementation noise, I would preserve this as the project's conceptual constitution:

### Principle 1 — Canon is law

The world has explicit constraints.

### Principle 2 — Runtime state is not canon

Simulation may change state without immediately rewriting the source of truth.

### Principle 3 — History is append-only

Events explain how the present became the present.

### Principle 4 — Media is projection

Dialogue, prose, audio, animation, and shots should not silently redefine the world.

### Principle 5 — Impossible states fail early

Physical, logistical, relational, and epistemic contradictions should be caught before expensive generation.

### Principle 6 — Causal dependencies are explicit

“Therefore” edges are represented structurally rather than merely implied through prose.

### Principle 7 — Unknown is a legitimate state

The AI must not manufacture answers that canon deliberately leaves unresolved.

### Principle 8 — Canon changes require authority

Runtime consequences become canonical only through explicit ratification.

### Principle 9 — Compilation is deterministic

The same canonical source must generate the same canonical artifact.

### Principle 10 — Every projection can be regenerated

Changing the video renderer should not change the story.

### Principle 11 — The system must measure narrative health

Structural validity is not equivalent to dramatic quality.

### Principle 12 — Prove the whole pipeline with the smallest possible example

Do not build the entire operating system before demonstrating one complete journey:

```text
world
 → state
 → event
 → dialogue
 → shot
 → sound
 → artifact
```

---

# My overall reading of the document

The most valuable thing here is **not actually the Goblin mythology** and it is not the compiler technology individually.

It is the synthesis:

> **You are trying to make a narrative universe behave like a physical universe.**

In a physical universe, gravity doesn't politely remind an astronaut:

> “Please remember that you cannot fly.”

Gravity simply makes certain trajectories impossible.

Your proposed narrative compiler tries to do the same thing.

A character with a destroyed arm doesn't receive a prompt saying:

> “Please remember your injury.”

Instead, the injury changes the set of states the character can occupy.

A secret isn't merely “something the writer knows.”

It becomes a fact in the epistemic state graph.

A possession isn't just mentioned in prose.

It occupies a physical location and belongs to somebody.

A grievance isn't merely a paragraph.

It is a causal state machine.

A death isn't merely dialogue.

It is an event that must eventually alter canonical state.

A screenplay isn't the world.

It is a projection of the world.

That is the architectural insight worth preserving.

And the document's own final correction is probably the wisest one: **stop theorizing temporarily and prove this with the smallest reproducible end-to-end artifact possible.** 

One final mathematical note: the document's correction to the 2d6 margin distribution is sound. For the difference between two independent 2d6 totals, the exact probabilities are about 11.3% for a zero margin, 21.6% for ±1, 19.3% for ±2, and about 15.1% for an absolute margin of at least 6. So that particular correction should be retained. 

The next genuinely valuable step is therefore not another 100 pages of architecture; it is turning this into a **small formal specification of canon, event, state, causality, and projection**, then using that specification to drive the 3-second tracer bullet.
The most valuable part of this revision is not any individual correction. It is the pattern the corrections reveal:

> **The specification is becoming trustworthy precisely where claims have been converted into derivable properties, executable tests, and explicit boundaries. The remaining weaknesses are almost all places where the document still asserts a rule without fully specifying the mechanism that makes the rule true.**

That is the central lesson I would preserve.

## 1. The strongest mathematical result: the 2d6 model is now on solid ground

The 2d6 difference distribution is correct. There are 1,296 ordered outcomes, and the absolute-margin counts sum exactly to 1,296. The important numbers are:

| Absolute margin | Probability |
| --------------- | ----------: |
| 0               |      11.27% |
| 1               |      21.60% |
| 2               |      19.29% |
| 3               |      16.05% |
| 4               |      12.35% |
| 5               |       8.64% |
| 6               |       5.40% |
| 7               |       3.09% |
| 8               |       1.54% |
| 9               |       0.62% |
| 10              |       0.15% |

Three consequences are particularly useful.

### Narrow contests dominate

$$
P(|D|\le2)=\frac{676}{1296}=52.16\%.
$$

So more than half of contests are decided within two points of one another.

That means the modifier system is not a decorative layer. Small bonuses materially alter the character of the contest.

A ±1 modifier shifts the relative margin by one full point, moving an outcome across a large portion of the distribution.

### One-sided advantage is asymmetrical around the threshold

The corrected value

$$
P(D\ge -2)=\frac{986}{1296}=76.08\%
$$

is important because it demonstrates that an apparently modest change in the required margin can produce a large change in success rate.

### Fixed-target and opposed checks behave differently

A +1 change around a 2d6 fixed target such as 7→8 or 8→7 produces a 16.67 percentage-point change in the probability at that boundary, because:

$$
P(2d6\ge7)=\frac{21}{36}=58.33\%
$$

and

$$
P(2d6\ge8)=\frac{15}{36}=41.67\%.
$$

By contrast, the local probability mass around the center of the opposed-difference distribution is roughly 11 percentage points per unit.

So the useful design conclusion is:

> **The same numerical modifier has more leverage in a fixed-target mechanic than in an opposed-difference mechanic.**

That should be treated as a balancing rule, not merely an observation.

---

# 2. The “clean win” wording should be fixed, but the mathematics should stay

The count

$$
80+56+35+20+10+4+1=206
$$

is correct for \(D\ge4\).

Thus:

$$
\frac{206}{1296}=15.90\%.
$$

And the probability that **either participant** achieves a clean win is:

$$
\frac{412}{1296}=31.79\%.
$$

The important distinction is semantic:

> 15.90% = a specified actor wins cleanly.

> 31.79% = someone in the contest wins cleanly.

That is a tiny wording issue mathematically, but specifications depend on exactly this sort of precision. A probability attached to an event needs an unambiguous event definition.

This illustrates a broader principle:

> **A correct number attached to an imprecise proposition is still a defective specification.**

---

# 3. The modifier clamp is an unresolved design hazard

This may be more important than the arithmetic itself.

The specification apparently caps “Strings” or modifiers at ±2, but the pasted review correctly asks:

> Is the clamp applied to each modifier source, or to the total modifier after all sources are combined?

Those are very different systems.

Suppose the clamp is global:

$$
M=\operatorname{clamp}(m_1+m_2+m_3,-2,+2)
$$

Then three +2 sources still produce only +2.

But if each source is individually clamped:

$$
M=m_1+m_2+m_3,
\qquad
m_i\in[-2,+2]
$$

then three sources yield +6.

That can make the contest extremely deterministic.

So the rule should be stated mathematically, not verbally:

$$
M_{\text{effective}}
=
\operatorname{clamp}
\left(
\sum_i m_i,
M_{\min},
M_{\max}
\right)
$$

if the intended rule is a global cap.

This is an excellent example of the type of ambiguity the whole project is supposed to eliminate.

---

# 4. The biggest conceptual correction: media is not deterministic

This is one of the most valuable conclusions in the entire review.

The earlier idea—

> every projection can be regenerated—

is too strong.

The revised principle is better:

> **Canonical state can be deterministic and reproducible while rendered media may be non-reproducible across environments.**

GPU drivers, rendering implementations, model versions, audio systems, container changes, and other environmental factors can alter the final artifact even when the logical input is identical.

This creates two fundamentally different durability classes.

### Reconstructible state

Examples:

* canon
* event log
* materialized state
* indexes
* dependency graphs
* compiled JSON

These should primarily be protected by preserving their authoritative sources.

### Historical artifacts

Examples:

* approved rendered video
* final audio
* delivery masters
* approved images
* externally observable outputs

These should be **archived as evidence**.

That distinction is extremely important.

It means the system should not confuse:

> “We can calculate something equivalent again”

with:

> “We still possess the actual artifact that was approved.”

Those are not equivalent.

The deeper principle is:

> **Reproducibility protects derivations; archival protects history.**

---

# 5. This produces a more useful model of truth

I would make the architecture explicit as four different things:

```text
CANON
What the world permits.

EVENT HISTORY
What happened.

MATERIALIZED STATE
What the world currently contains.

MEDIA ARTIFACT
What was actually produced and approved.
```

They have different properties.

Canon should be versioned.

Events should be append-only.

Materialized state can be recomputed.

Media artifacts may need permanent preservation.

That is a much stronger architecture than simply saying “everything is deterministic.”

---

# 6. Two-phase tick commit is a genuinely important correction

The two-phase design is one of the strongest engineering ideas in the review.

The rule is essentially:

```text
Phase 1:
Everyone observes the same frozen state.

Phase 2:
All proposed actions are arbitrated against that same state.

Commit:
The resulting state becomes the next tick.
```

This prevents order-dependent behavior caused by one agent modifying state before another agent has made its decision.

But the review correctly identifies a deeper issue:

> **A deterministic state model is not enough; the order of conflict resolution must itself be deterministic.**

Suppose two characters both contest the wrench.

If the first contest changes ownership, then the second contest can see a different world depending on which conflict happened to execute first.

That means a shared advancing RNG stream is dangerous.

For example:

```text
Random draw #1 → Conflict A
Random draw #2 → Conflict B
```

If an unrelated conflict gets inserted before A, every subsequent draw changes.

That is terrible for reproducibility.

The better model is:

$$
R_{event}=PRNG(\text{master seed},\text{event identity})
$$

rather than:

$$
R_{event}=PRNG(\text{master seed},\text{how many draws happened before me})
$$

This is a major general principle:

> **Randomness should be keyed to identity, not execution order.**

That idea is worth applying everywhere.

---

# 7. The same principle should govern every random subsystem

This insight can be pushed further.

Instead of one giant RNG stream:

```text
episode seed
    ↓
simulation RNG
    ↓
dialogue RNG
    ↓
render RNG
```

use derived, domain-specific seeds:

```text
episode_seed
   ├── tick/tick_id
   ├── conflict/resource_id
   ├── dialogue/scene_id
   ├── render/shot_id
   └── variation/asset_id
```

Then changing rendering randomness cannot alter narrative randomness.

Likewise, inserting an unrelated conflict cannot change an existing conflict's roll.

This is much stronger than merely saying “the simulation is seeded.”

---

# 8. Chained actions inside a tick need an explicit semantic rule

The review catches something subtle but important.

Suppose:

> A hands B the wrench.

while simultaneously:

> C tries to disarm B.

If everyone reads the tick-start state, both actions see B holding the wrench.

The system must decide whether:

### Option A — no intra-tick dependencies

Actions must be evaluated from frozen state and cannot depend on another action in the same tick.

This is simple and deterministic.

### Option B — explicit sub-phases

For example:

```text
observe
→ propose
→ resolve initiative
→ apply transfers
→ resolve dependent actions
→ commit
```

More expressive, but more complicated.

What should **not** happen is leaving this implicit.

This is a recurring theme throughout the review:

> **Ambiguous sequencing is hidden state. Hidden state destroys reproducibility.**

---

# 9. The pardon/waiver system is becoming much more coherent

The revised pardon design has a strong idea:

> **Hard physical truths cannot be waived casually.**

That is good.

But the review correctly identifies three unresolved boundaries.

### Scope

A scene-scoped waiver should not simultaneously have an unrelated cycle expiry.

Choose a coherent temporal model:

```text
scene-scoped
```

or

```text
multi-scene + expires_at_cycle
```

but don't encode redundant concepts that imply two different lifetimes.

### Mutating consequences

This is even more important.

If a waiver says:

```text
status_shift: humiliated_open_grief
```

then the waiver isn't merely saying:

> “Ignore this constraint.”

It is **creating a state transition.**

Therefore it must be treated like an event.

It must obey the same:

```text
validation
→ append
→ sequencing
→ replay
→ audit
```

rules as any other state mutation.

Otherwise the waiver mechanism becomes a hidden backdoor into the state machine.

That's a very general security principle:

> **Every mechanism capable of changing state must pass through the same authoritative state-transition boundary.**

No privileged side channel.

---

# 10. Epistemic violations deserve harder treatment than ordinary style violations

This distinction is particularly valuable for a narrative engine.

Consider three kinds of failure.

### Physical

A character with one functional arm performs a two-arm lift.

Clearly invalid.

### Epistemic

A character reveals a secret they have no way of knowing.

Also fundamentally invalid.

### Relational/style

A character who normally speaks indirectly becomes unusually explicit.

Possibly a violation, but potentially intentional.

So I would preserve the hierarchy suggested by the review:

```text
HARD
Physical
Epistemic
Structural causal violations

SOFT / REVIEWABLE
Voice
Pacing
Relational tendencies
Stylistic deviations
```

The deeper principle is:

> **Not every invariant deserves the same enforcement level.**

Some define reality.

Others define the preferred expression of reality.

Confusing those categories makes the compiler either too permissive or unbearably rigid.

---

# 11. The omission/ignorance test exposes a profound epistemic problem

The review correctly attacks a test like:

```text
assert context does not contain "famine"
```

That is useful, but insufficient.

Suppose the model doesn't see:

```text
fact_famine_origin
```

but receives:

```text
the grandfather disappeared after the famine
the pantry was emptied
Bog hides old records
the family was displaced
only Bog remembers
```

A sufficiently capable model may infer the missing fact anyway.

So:

> **absence of the answer is not the same as preservation of ignorance.**

This is one of the most philosophically important observations in the entire review.

You need to distinguish:

### Explicit knowledge

The fact is directly supplied.

### Inferential knowledge

The fact is not supplied, but logically follows from what is supplied.

### Speculative knowledge

The model has no valid basis but guesses.

The system should prevent the third and deliberately measure the second.

A string search can test:

> “Did we accidentally include the fact?”

It cannot test:

> “Can the fact still be reconstructed?”

Therefore the proposed hierarchy is sensible:

```text
blocking deterministic omission check
+
periodic inference-leak evaluation
```

And that second test should probably be treated as a monitoring metric rather than an absolute blocker, because semantic leakage is much harder to characterize formally.

---

# 12. Fixed-point integer arithmetic is the right direction—but must be treated as mathematics

The review's criticism of truncation is valid.

Suppose:

$$
Scale(A,B)=\left\lfloor\frac{AB}{10000}\right\rfloor.
$$

This is deterministic, but flooring systematically biases downward.

For example:

$$
\frac{1\times1}{10000}
\rightarrow 0.
$$

That means repeated multiplicative operations can collapse small values surprisingly quickly.

The important point is not that truncation is necessarily wrong.

It might actually be desirable if the desired semantics are:

> “Never overestimate capability or quantity.”

But then that is a **domain policy**, not a harmless implementation detail.

So the specification should explicitly decide:

### Conservative truncation

Always bias downward.

Useful when overestimating a capability would be dangerous.

### Round-half-up

Closer to intuitive arithmetic.

### Round-half-even

Minimizes repeated rounding bias over large numbers of operations.

The choice should be tested against representative repeated calculations.

---

# 13. Integer width is part of correctness

The review catches another issue that is easy to overlook.

If:

$$
A\le10^4,\qquad B\le10^4
$$

then:

$$
AB\le10^8.
$$

Fine.

But three chained factors can reach:

$$
10^{12}.
$$

That's still below JavaScript's 53-bit safe-integer limit:

$$
2^{53}\approx9.0\times10^{15}.
$$

But the moment the scale factors or chain structure expand, you need a stated numeric model.

The important rule should therefore be:

> **Every numeric field in the state model has a specified representation, range, and arithmetic domain.**

Don't merely say:

> “This is an integer.”

Define:

* signed/unsigned
* maximum
* minimum
* representation
* arithmetic behavior
* overflow behavior
* rounding behavior

That is what makes numerical state reproducible.

---

# 14. The audio/frame calculation is a genuinely strong piece of the design

The cumulative quantization scheme is correct:

$$
StartFrame_k=
\left\lceil
\frac{\sum_{i<k}Dur_i}{1000}\cdot FPS
\right\rceil
$$

$$
EndFrame_k=
\left\lceil
\frac{\sum_{i\le k}Dur_i}{1000}\cdot FPS
\right\rceil-1.
$$

The important property is:

$$
EndFrame_k+1=StartFrame_{k+1}.
$$

Therefore there are no gaps or overlaps.

That's the important result.

The deeper improvement is to stop making 24 fps an implicit constant.

Represent frame rate as a rational:

$$
FPS=\frac{p}{q}.
$$

Then the entire system can operate using integer arithmetic.

For example:

$$
23.976=\frac{24000}{1001}.
$$

That turns frame-rate handling into data rather than a buried implementation assumption.

---

# 15. The “$0.00 compute” assertion should test the mechanism, not its accounting output

This is an excellent distinction.

A test that says:

```text
tokenCostUsd === 0
```

doesn't prove no model call occurred.

The pricing system itself might simply report zero.

Instead, mock the model interface and assert:

```text
modelClient.callCount === 0
```

That verifies the actual invariant:

> **No inference request was made.**

This illustrates a general testing rule:

> **Test causes when possible, not merely downstream symptoms.**

---

# 16. “Gapless sequence numbers” are probably an unnecessary requirement

The review's distinction between:

```text
gapless
```

and:

```text
monotonic + unique
```

is extremely important.

A gapless sequence sounds attractive:

```text
1,2,3,4,5,6...
```

But under concurrency and transaction rollback, maintaining true gaplessness is difficult and sometimes expensive.

For event replay, what you normally care about is:

1. uniqueness
2. ordering
3. durable identity

Therefore:

```text
100
103
105
109
```

can still be perfectly replayable if the ordering relation is deterministic.

The stronger, more practical invariant is likely:

$$
seq(e_i)<seq(e_j)\quad\text{for every earlier event }e_i.
$$

And:

$$
seq(e_i)\ne seq(e_j)
$$

for all distinct events.

Unless the system actually needs gaplessness for some external contractual reason, I would remove that requirement.

This is another instance where the project should resist demanding properties simply because they sound stronger.

> **Specify the weakest invariant that completely serves the use case.**

Stronger invariants often create cost without creating useful correctness.

---

# 17. The canonical action vocabulary is more important than it looks

The review identifies a hidden weakness in the dual-field linter.

You may have:

```text
structured action = SPRINT
```

and prose:

> “He bolted toward the door.”

The linter only works if both representations ultimately map into the same controlled vocabulary.

Therefore there should be one versioned canonical action ontology:

```text
SPRINT
  synonyms:
    bolt
    dash
    race
    run_full_speed
```

The vocabulary itself becomes a governed artifact.

That means:

```text
canon version
+
action vocabulary version
+
schema version
```

should all be explicit.

Otherwise the linter's apparent rigor is undermined by a hidden mapping layer that is allowed to drift.

---

# 18. Nondeterministic model calls must become recorded events

This is probably the single most important implementation addition in the review.

A temperature of `0.0` does **not** mean:

> guaranteed identical output.

The model invocation is still an external side effect.

Therefore the proper event-sourcing pattern is:

```text
request model
      ↓
receive result
      ↓
record result as event
      ↓
future replay uses recorded result
```

not:

```text
replay
  ↓
ask model again
```

The second procedure is not true replay.

It is **re-execution**.

Those are fundamentally different.

The same applies to TTS.

If TTS produces:

```text
duration = 1837 ms
```

that measured duration should become part of the historical record.

Otherwise a future TTS version producing 1829 ms silently changes the frame layout of an otherwise identical episode.

That is exactly the type of nondeterminism this architecture is intended to prevent.

---

# 19. The deepest architectural distinction: replay versus regeneration

This follows from almost everything above.

There are actually three operations:

### Replay

Use the exact historical events and recorded external outputs.

Goal:

> reconstruct historical state.

### Re-simulate

Run the rules again with possibly different seeds or configuration.

Goal:

> explore what might happen.

### Re-render

Project an existing state/history into a new medium.

Goal:

> produce a new artifact without changing the underlying history.

Those must never be conflated.

I would explicitly define:

$$
Replay(H)=S
$$

versus

$$
Simulate(S_0,\sigma,\theta)=H'
$$

where \(\sigma\) is the seed and \(\theta\) the rule/configuration version.

And:

$$
Render(H,\rho)=A
$$

where \(\rho\) describes the rendering environment.

That gives you a very clean architecture:

```text
HISTORICAL EVENTS
      │
      ├── replay → STATE
      │
      └── project → MEDIA
```

while simulation produces new histories rather than rewriting old ones.

---

# 20. The spec should distinguish rule version from world version

Another useful deduction follows from the pasted material.

Suppose a character has:

```text
strength = 6000
```

and the compiler changes its interpretation.

Was the story changed?

Not necessarily.

The **world data** may be unchanged while the **rules that interpret the data** changed.

So you probably need at least:

```text
world_version
schema_version
rule_version
action_vocabulary_version
renderer_version
```

This is critical for historical replay.

Otherwise a 2028 compiler may interpret a 2026 event under 2028 semantics and produce a different result.

A historical event should therefore carry enough metadata to say:

> “This event was interpreted under rule-set R.”

---

# 21. Human gates should themselves be events

The review's final recommendation about human gates can be pushed one step further.

Don't model:

> “Showrunner clicked Approve.”

as an ephemeral UI action.

Record:

```text
CANON_RATIFICATION
PARDON_GRANTED
HARVEST_ACCEPTED
RENDER_APPROVED
SCENE_REJECTED
```

as immutable events.

Then the human decision becomes part of the history.

That gives you:

```text
machine event
↓
candidate consequence
↓
human decision event
↓
new authoritative state
```

rather than:

```text
machine state
↓
some person changed something in a UI
↓
nobody knows exactly what happened
```

This makes governance auditable and replayable.

---

# 22. The biggest hidden category is provenance

The entire specification becomes much stronger when every important artifact answers:

> **Where did this fact come from?**

A permanent fact could carry:

```yaml
fact_id: fact_wart_departed
origin:
  event_id: evt_009821
  episode_id: ep047
  rule_version: rules_1.4.2
  approved_by: canon_gate
  approved_at_revision: abc123
```

Then you can trace:

```text
render
→ scene
→ dialogue
→ event
→ canonical fact
→ original ratification
```

This is the narrative equivalent of provenance tracking in data systems.

It also makes future retcon analysis dramatically easier.

---

# 23. “Spec-as-tests” is perhaps the single best practical recommendation

The review's suggestion to generate the specification's numerical tables from executable code should be elevated to a central development principle.

Instead of:

```text
Markdown:
P(clean win) = 15.90%
```

being manually typed, use:

```text
source implementation
        ↓
test computation
        ↓
generated Markdown table
```

Then the documentation is an output of the same source that defines the mathematics.

The same should apply to:

* probability distributions
* frame calculations
* state transition examples
* schema examples
* invariant examples
* expected hashes
* causal graph examples

This eliminates an entire category of documentation drift.

The strongest possible rule is:

> **Never manually type a numerical claim that the machine can derive.**

---

# 24. Property-based testing is the natural next step

A single replay fixture proves almost nothing compared with a family of generated histories.

For a fold function:

$$
S_{n+1}=R(S_n,E_n,\sigma_n)
$$

you want properties such as:

### Determinism

$$
Fold(H)=Fold(H)
$$

every time.

### Prefix equivalence

$$
Fold(Fold(S_0,A),B)
=
Fold(S_0,A\Vert B)
$$

where \(A\Vert B\) is concatenation.

### Replay stability

Same events + same rule version → same state.

### Invalid-event rejection

Invalid sequences never produce valid states.

### No silent mutation

Applying a projection cannot change the underlying event history.

These are much stronger guarantees than a handful of hand-authored examples.

---

# 25. The deepest conclusion: the remaining bugs are seam bugs

This is the most important observation in the whole pasted review.

The major algorithms themselves are mostly sound.

The remaining problems occur where one subsystem meets another:

```text
modifier system ↔ probability model
waiver scope ↔ time
waiver ↔ state mutation
canon ↔ runtime
runtime ↔ event log
event log ↔ replay
model call ↔ determinism
TTS ↔ frame arithmetic
integer policy ↔ actual examples
human approval ↔ machine state
```

These are **interface invariants**.

And those are usually harder than isolated algorithms.

A function can be perfectly correct on its own while the system surrounding it interprets its output incorrectly.

So the next stage of engineering should focus disproportionately on **contracts between components**.

---

# 26. What I would actually declare “canonical” from this review

I would preserve the following principles as the foundation:

### 1. Derive, don't assert.

Anything numerical or mechanically meaningful should be machine-derived.

### 2. Canon, history, state, and media are distinct.

Never collapse them into one “truth” object.

### 3. External side effects become recorded events.

Model outputs, TTS durations, human approvals, and similar effects belong in the historical record when they affect subsequent computation.

### 4. Randomness is identity-keyed.

Never let unrelated execution order determine supposedly reproducible outcomes.

### 5. Hard invariants and soft preferences are different classes.

Physical and epistemic impossibilities should generally be hard failures; stylistic deviations can be reviewable.

### 6. A waiver cannot bypass the state machine.

Anything that changes state must use the same authoritative transition machinery.

### 7. Replay is not simulation.

Historical replay must consume recorded results rather than invoke nondeterministic external systems again.

### 8. Archival and reproducibility solve different problems.

Canonical state can be regenerated; approved media may need permanent preservation.

### 9. Use the weakest sufficient invariant.

“Unique and ordered” is often better than “gapless.”
“Specific proposition absent” is better than “the word famine absent.”
“Model was never called” is better than “reported cost was zero.”

### 10. Test the seams.

The most dangerous failures are at boundaries between otherwise-correct subsystems.

---

# 27. What should happen next

The pasted review reaches the right conclusion, and I would make it even stricter:

**Stop expanding the architecture until a minimal executable proof exists.**

The ideal tracer bullet is something like:

```text
ONE canonical character
        ↓
ONE constrained capability
        ↓
ONE grievance
        ↓
ONE deterministic conflict
        ↓
ONE event
        ↓
ONE recorded model result
        ↓
ONE dialogue line
        ↓
ONE measured audio duration
        ↓
ONE shot
        ↓
ONE rendered artifact
        ↓
ONE archived artifact hash
```

Then perform the entire round trip twice.

The real test is not:

> “Did it work?”

It is:

> **“Did the second execution reconstruct the same logical history, while correctly distinguishing reproducible state from irreproducible media?”**

That single experiment would exercise nearly every important idea in the revision.

And there is an even better test: deliberately introduce each of the known seam failures—an invalid modifier stack, a waiver with an expired scope, a forbidden epistemic disclosure, a reordered conflict, a changed TTS duration, a nondeterministic model result—and verify that the system either rejects it or records it according to the governing rule.

That would turn the document from an impressive architecture into something much more valuable:

> **a specification whose important claims are no longer merely persuasive because they have been made executable.**


The useful result of this latest revision is that the project is no longer primarily struggling with its big ideas. The big ideas are fairly coherent. The remaining work is to make the language of the specification no stronger than the mechanisms underneath it.

After stripping away repetition, I think the durable core is this:

> **The system should distinguish what the fictional world permits, what actually happened, what is currently true, what a character believes, and what media artifact was produced—and every transition between those layers should have an explicit, testable contract.**

That is the principle from which most of the other decisions follow.

---

# 1. The mathematics that is actually settled

The 2d6 opposed-difference distribution is solid.

For

$$
D=A-B
$$

with two independent 2d6 rolls, there are 1,296 ordered outcomes. The absolute-margin distribution is:

| \(|D|\) | Count | Probability |
|---:|---:|---:|
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

Everything important derived from that table should be generated automatically rather than typed into prose.

The important confirmed values are:

$$
P(|D|\le2)=\frac{676}{1296}=52.16\%
$$

$$
P(D\ge-2)=\frac{986}{1296}=76.08\%
$$

and for a specified actor:

$$
P(D\ge4)=\frac{206}{1296}=15.90\%.
$$

The probability that **either side** obtains \(D\ge4\) is:

$$
\frac{412}{1296}=31.79\%.
$$

That distinction between “specified actor” and “someone” should remain explicit everywhere.

---

# 2. The biggest mathematical lesson is not the table

It is the baseline.

If a win means:

$$
D\ge1,
$$

then the actor's unmodified win probability is:

$$
P(D\ge1)=\frac{575}{1296}=44.37\%.
$$

It is **not 50%**, because ties exist.

The probability of:

$$
D\ge0
$$

is:

$$
\frac{721}{1296}=55.63\%.
$$

So whenever the specification discusses “50% baseline,” it must first define whether a tie is:

* a loss,
* a win,
* a partial success,
* a separate outcome,
* or something resolved elsewhere.

This is not cosmetic.

A statement such as:

> “+3 moves the character from 50% to 76.08%”

can refer to completely different mechanics depending on whether \(D=0\) counts as success.

The clean formulation is:

> **Define the resolution predicate mathematically, then derive every success probability from that predicate.**

For example:

$$
Win(M)\iff D+M\ge1.
$$

Then:

$$
P(Win(0))=44.37\%
$$

and:

$$
P(Win(+3))=76.08\%.
$$

That produces a change of:

$$
31.71
$$

percentage points.

This is much better than talking about “advantage” in prose.

---

# 3. Fixed-target versus opposed checks needs a more precise rule

The review correctly catches an overstatement.

The claim:

> “a modifier has more leverage in fixed-target mechanics”

is not universally true.

For a 2d6 fixed target, the leverage of a one-point target change is simply the probability mass sitting on the crossed total.

Examples:

$$
P(2d6=7)=\frac6{36}=16.67\%
$$

$$
P(2d6=8)=\frac5{36}=13.89\%
$$

$$
P(2d6=9)=\frac4{36}=11.11\%
$$

$$
P(2d6=10)=\frac3{36}=8.33\%
$$

$$
P(2d6=11)=\frac2{36}=5.56\%
$$

$$
P(2d6=12)=\frac1{36}=2.78\%.
$$

So the useful rule is not:

> Fixed-target modifiers are stronger.

It is:

> **Modifier sensitivity is a function of the operating point.**

That should become a generated diagnostic.

For every mechanic, calculate:

$$
\text{Leverage}(x)
=
P(\text{outcome crosses threshold when modifier changes by 1}).
$$

Then you know where your mechanic is sensitive instead of discovering it after playtesting.

---

# 4. The modifier clamp should become an equation

The review is right that the specification still has a genuine hole here.

You need to decide whether modifiers are clamped individually or collectively.

The important version is probably:

$$
M_{\text{effective}}
=
\operatorname{clamp}
\left(
\sum_i m_i,
M_{\min},
M_{\max}
\right).
$$

For a ±2 total cap:

$$
M_{\text{effective}}
=
\operatorname{clamp}
\left(
\sum_i m_i,-2,+2
\right).
$$

That means:

$$
+1+1+1\rightarrow+2
$$

rather than:

$$
+1+1+1\rightarrow+3.
$$

This matters greatly because the opposed-difference system becomes increasingly deterministic as the effective modifier grows.

For the strict win condition \(D+M\ge1\):

| Effective \(M\) | Win probability |
| --------------: | --------------: |
|               0 |          44.37% |
|              +1 |          55.63% |
|              +2 |          66.44% |
|              +3 |          76.08% |
|              +4 |          84.10% |
|              +5 |          90.28% |
|              +6 |          94.60% |

That table is itself an argument for defining the clamp precisely.

And again, it should be generated rather than hand-entered.

---

# 5. The most important architectural distinction is now replay versus re-execution

This is probably the strongest idea in the revision.

There are three fundamentally different operations:

### Replay

> Reconstruct what actually happened.

It must use recorded events and recorded external results.

### Re-simulation

> Ask what happens when the system runs again under specified rules, seeds, and configuration.

This legitimately generates something new.

### Re-render

> Produce a different media representation of an already established history/state.

It should not silently invoke earlier nondeterministic steps.

That gives:

$$
Replay(H)\rightarrow S
$$

$$
Simulate(S_0,\sigma,\theta)\rightarrow H'
$$

$$
Render(H,\rho)\rightarrow A
$$

where \(\sigma\) is the simulation seed, \(\theta\) the rules/configuration, and \(\rho\) the rendering environment.

The distinction is vital because otherwise “replay” merely means:

> “run the same algorithms again and hope.”

That isn't historical replay.

---

# 6. Re-rendering must preserve its own boundary

The latest review catches an especially important nuance:

Suppose an approved episode contains:

* approved dialogue AST
* recorded TTS audio
* measured duration
* locked scene state

A new render should be able to consume those exact intermediate artifacts.

Otherwise:

```text
re-render
→ new TTS
→ new duration
→ new frame timing
→ new scene
```

isn't really a re-render.

It is partial re-execution.

So the pipeline should permit:

```text
historical dialogue
      ↓
historical audio
      ↓
new visual renderer
      ↓
new video artifact
```

without changing the dialogue or audio.

That is how you isolate variation deliberately.

---

# 7. Randomness must be identity-addressed, not stream-position-addressed

This is another idea I would promote to constitutional status.

Bad:

```text
master RNG
  draw 1 → conflict A
  draw 2 → conflict B
  draw 3 → conflict C
```

because inserting an unrelated conflict changes all later draws.

Better:

$$
Seed_A=KDF(MasterSeed,\text{"conflict"},ResourceID_A)
$$

$$
Seed_B=KDF(MasterSeed,\text{"conflict"},ResourceID_B)
$$

etc.

The identity must come from stable semantic identifiers:

* event ID
* scene ID
* resource ID
* character ID
* episode ID

not:

* array index
* loop counter
* function name
* source-file line
* execution order

Otherwise a harmless refactor can silently change the narrative.

One refinement to the review is important: don't merely concatenate strings into a hash input. Encode the components unambiguously with a domain separator or length-prefixing, or use a proper KDF/HMAC.

The underlying principle is:

> **Independent events should receive independent random streams whose identities survive software refactoring.**

---

# 8. The event log should probably be more than a timestamped sequence

The proposed hash chain is valuable, but there is an additional nuance.

A simple chain:

$$
E_n \rightarrow hash(E_n)
$$

with:

```text
prev_hash
```

works beautifully for a strictly linear history.

But the architecture also discusses:

* concurrent simulation
* alternative branches
* retries
* speculative paths
* potentially multiple workers

Once you allow genuine branches, one `prev_hash` is no longer enough to represent history cleanly.

You then want something closer to:

```yaml
parents:
  - hash_A
  - hash_B
```

with the event hash computed over the canonical event plus its ordered parent set.

That effectively gives you a small Merkle-style history graph.

So I would distinguish:

### Linear committed history

Hash chain.

### Branched or concurrent histories

Hash-linked DAG.

The important invariant becomes:

> **The history head cryptographically commits to every ancestor event.**

That is much stronger than merely numbering events.

---

# 9. Sequence numbers should probably be monotonic and unique—not globally gapless

The latest review is correct here.

A global sequence:

```text
1,2,3,4,5...
```

sounds desirable, but enforcing true gaplessness under concurrent writers and rollbacks is awkward.

For replay you really need:

* unique identity
* deterministic ordering
* durable persistence

You usually don't need:

* no missing integers

A better invariant is:

$$
seq(e_i)<seq(e_j)
$$

whenever the canonical ordering says \(e_i\) precedes \(e_j\).

And:

$$
seq(e_i)\ne seq(e_j)
$$

for distinct events.

However, the review correctly notes that gaplessness has diagnostic value.

I would therefore prefer a cryptographic history chain over forcing global gaplessness.

A missing event breaks the chain.

A modified event breaks the chain.

A reordered event breaks the chain.

That provides more useful integrity than an integer sequence by itself.

---

# 10. Idempotency belongs at the event boundary

The crash window identified in the review is real.

Imagine:

```text
model call succeeds
        ↓
process crashes
        ↓
result not recorded
        ↓
retry
        ↓
model called again
```

The second result may differ.

You need an explicit rule:

> **Only a durably recorded result becomes authoritative.**

The unrecorded attempt disappears from the logical history.

But there is another possibility:

```text
result recorded
        ↓
ack lost
        ↓
worker retries
        ↓
same logical operation executed twice
```

So each externally consequential operation should have an idempotency key.

For example:

```text
episode_id
scene_id
operation_type
operation_index
```

or, better, a canonical operation ID.

Then:

```text
operation_id = X
```

can appear only once in authoritative history.

This is not a minor implementation detail. It is what closes the boundary between external side effects and event-sourced state.

---

# 11. The model-output rule needs one more category: invocation provenance

For every nondeterministic external operation, record not merely its output but enough information to explain where it came from.

For a model invocation:

```text
operation_id
input_hash
model_identifier
model_version
system_prompt_hash
sampling_parameters
tool/config version
output
output_hash
```

For TTS:

```text
operation_id
voice/model identifier
input_hash
settings
audio_bytes
duration_ms
audio_hash
```

This converts:

> “the model said this”

into:

> “this exact operation, using this exact input/configuration/provider identity, produced this exact result.”

That is the level of provenance the replay architecture really wants.

---

# 12. The epistemic model needs a more fundamental separation

This is one place where the latest review can be improved further.

There are really three different things:

### Objective world fact

```text
fact_famine_origin = X
```

### Character belief

```text
Bog believes famine_origin = Y
```

### Character utterance

```text
Bog says:
"I know what happened."
```

These are not equivalent.

This resolves a problem the review identified around:

* guesses
* lies
* false accusations
* incomplete knowledge
* lucky guesses
* concealed information

A character can legitimately say something true that they don't know to be true.

A character can know something and lie about it.

A character can believe something false.

A character can say something deliberately ambiguous.

So rather than making a simple rule:

> “epistemic violation = hard failure,”

the stronger model is:

$$
WorldTruth \neq CharacterBelief \neq Utterance
$$

Then an utterance can additionally carry a speech-act classification such as:

```text
ASSERT
GUESS
DENY
LIE
QUESTION
SPECULATE
WITHHOLD
```

The difficult problem then becomes:

> Is the character presenting the statement as knowledge they do not possess?

That is substantially more precise than banning the mere appearance of a hidden fact in their language.

This also makes the omission test easier to understand: **omission is the primary defense against accidental knowledge injection; speech-act analysis is secondary detection.**

---

# 13. “Prevent speculation” is too strong

The review correctly catches this.

You cannot guarantee that a language model will never speculate.

You can:

* withhold information
* constrain prompts
* constrain output formats
* detect unsupported assertions
* flag suspicious epistemic claims
* measure leakage experimentally

But a probabilistic language model can still guess.

So the honest formulation is:

> **The system prevents intentional or structurally unsupported access to hidden state where possible and detects evidence of epistemic leakage with bounded reliability.**

That is a much more defensible claim than “speculation is prevented.”

This distinction between **prevention** and **detection** should apply throughout the specification.

Whenever the document says:

> “This guarantees X”

ask:

> Is X mathematically enforced, or merely tested by a fallible detector?

That single question will expose many remaining overstatements.

---

# 14. The action vocabulary should be a governed ontology

This deserves to be more than a list of verbs.

A canonical action should carry semantic requirements.

For example:

```yaml
action: BIMANUAL_HEAVE

requires:
  functional_upper_limbs: 2
  minimum_mobility_rank: 2

lexical_realizations:
  - heave
  - lift
  - haul
  - wrench upward

forbidden_conditions:
  - bilateral_arm_loss
```

Then the same action ontology serves:

* simulation
* scene planning
* prose extraction
* invariant checking
* animation constraints
* audio cues

This prevents the dangerous situation in which the generator and verifier use subtly different meanings of “sprint,” “lift,” or “climb.”

And the golden corpus proposed in the review is exactly the right companion:

> a fixed set of representative prose examples with expected canonical action mappings.

Then you can measure parser performance.

That is much stronger than claiming the linter “works.”

---

# 15. Property-based testing should become a major pillar

The single-fixture tests described here are necessary but insufficient.

For the state fold:

$$
Fold(S,E_1,\ldots,E_n)
$$

test properties across many generated valid histories.

At minimum:

### Determinism

Repeated evaluation of the same history gives identical state.

### Prefix equivalence

$$
Fold(Fold(S,A),B)
=
Fold(S,A\Vert B).
$$

### Replay consistency

Recorded historical events reproduce the same state.

### Totality

Every legal event sequence produces either:

* a valid next state, or
* a defined terminal/void outcome.

### Rejection

Illegal events never enter authoritative history.

This is particularly important because the architecture is stateful. Stateful systems often fail in combinations that no single example anticipated.

---

# 16. A “void” outcome is worth explicitly adding

The review makes a very useful observation.

The mechanical system assumes conflicts produce outcomes, but real runtime conditions can invalidate the contest itself.

For example:

```text
A and B contest the wrench.

Before arbitration:
the wrench is destroyed.
```

What happened?

Not:

```text
A wins
B wins
```

but:

```text
CONTEST_VOID
reason = resource_removed
```

This should be a first-class outcome.

The deeper principle is:

> **The event algebra should be total over every legal state transition, including non-resolution.**

Otherwise “nothing happened because the precondition disappeared” becomes an implicit exception path.

Implicit exceptions are exactly what this architecture is designed to eliminate.

---

# 17. Fixed-point arithmetic needs an actual policy now

The revision has reached the point where listing alternatives is no longer useful.

A real specification needs one answer.

A sensible general approach would be:

$$
Scale(A,B)=RoundEven\left(\frac{A B}{10000}\right)
$$

with all stored scalar values represented as integer basis points.

Then, for quantities that intentionally require conservative downward bias, define a separate function:

$$
ScaleDown(A,B)=\left\lfloor\frac{AB}{10000}\right\rfloor.
$$

That makes the semantic distinction visible.

Do not let different parts of the code independently decide whether to floor, ceil, or round.

There should be one authoritative numerical library.

And the safest implementation rule is:

> **Scale after every multiplication.**

Do not accumulate long chains of raw products and divide at the end.

That keeps intermediate magnitudes bounded and makes the arithmetic model easy to reason about.

---

# 18. “Derived number” and “chosen number” must be separated

This is another very important distinction.

Some numbers should be **derived**:

* probability tables
* expected frame drift
* 2d6 distributions
* derived capacities
* hash outputs

Others are **policy decisions**:

* ±2 modifier cap
* minimum grievance threshold
* 40% closure threshold
* 24 fps
* retry count
* escalation ceiling

You cannot mathematically derive a policy choice from the system unless the project has some higher-level optimization criterion.

So the right rule is:

> **Derived numbers are generated from executable definitions. Chosen numbers live in versioned configuration with an explicit rationale.**

That is stronger than “never hardcode numbers.”

---

# 19. This also clarifies what a “test” can prove

There are three categories:

### Mathematical invariant

Can be proven or exhaustively tested.

Example:

$$
146+2(575)=1296.
$$

### Software invariant

Can be tested against implementation.

Example:

> replaying the same event log yields the same state.

### Policy choice

Cannot be “proven correct” merely by code.

Example:

> ±2 is the right modifier cap.

The test can prove:

> the implementation obeys the ±2 cap.

It cannot prove:

> ±2 is narratively optimal.

This distinction should be explicit throughout the documentation.

---

# 20. The same distinction applies to human gates

A human approval isn't an algorithmic invariant.

The machine can prove:

> The approval was recorded.

It cannot prove:

> The approval was wise.

So every human gate should expose:

* what information the person receives
* what decisions they may make
* what event gets recorded
* what happens while pending
* what happens on rejection
* whether work may continue speculatively
* how rollback operates
* how queue priority works

The last item matters more than it initially seems.

A perfectly auditable human gate can still fail operationally if:

```text
incoming decisions > human throughput.
```

Then the architecture produces a backlog rather than governance.

You need a queueing policy.

---

# 21. The tracer bullet should be staged, not fully end-to-end at first

The latest review makes an excellent correction here.

Do not initially make your proof of architecture depend on:

* GPU behavior
* real TTS
* real model outputs
* real rendering

Instead:

### Stage A — deterministic core

Use fixed stubs.

Prove:

```text
canon
→ event
→ fold
→ state
→ capability verification
→ seeded randomness
→ frame arithmetic
```

### Stage B — external side effects

Introduce:

* LLM
* TTS

but record their outputs.

Prove:

```text
first execution
→ recorded external results

replay
→ no external calls
→ same logical result
```

### Stage C — rendering

Render the real artifact.

Accept that two renders may differ.

Require instead that:

* their input history is identical
* their logical scene state is identical
* their artifact hashes are individually recorded
* the renderer/version/environment is recorded

That is a much cleaner experimental progression.

---

# 22. One distinction I would add explicitly: determinism is not reproducibility

These words are often used interchangeably, but they should not be.

### Determinism

Same inputs produce the same logical output.

### Replayability

Recorded historical inputs/events reconstruct historical state without repeating side effects.

### Reproducibility

A derivation can be regenerated successfully under a defined environment.

### Artifact integrity

An archived artifact has not been altered.

### Provenance

You can explain where an artifact or fact came from.

A system can have one without another.

For example:

```text
logical state:
deterministic ✓

historical replay:
reproducible ✓

GPU render:
bit-identical ✗

approved video:
archived ✓

artifact provenance:
recorded ✓
```

That is not a failure.

It is a correctly characterized system.

---

# 23. The underlying architecture already points toward this separation

The original `goblin-lore` document itself explicitly distinguishes the Event Log, Materialized State, and Media Projections, and recommends hierarchical seeding so that changing visual randomness doesn't alter narrative outcomes. 

It also explicitly treats runtime state as separate from static canonical law, with permanent consequences promoted through a review gate rather than continuously written upstream. 

So this isn't an entirely new architecture being invented in the review. The review is correctly exposing implications that were already latent in the original design.

---

# 24. The remaining problems are overwhelmingly seam problems

This is the best high-level diagnosis.

The major isolated mechanisms are mostly understandable:

```text
2d6 distribution
fixed-point arithmetic
event folding
cycle detection
capability constraints
canonical serialization
hashing
```

The dangerous questions are:

```text
Who is allowed to change state?

What exactly is an event?

When does a model output become history?

What does replay mean?

What does a waiver bypass?

What does "knows" mean?

What happens when a contest becomes impossible?

What happens when two actions interact inside the same tick?

What does the hash actually commit to?

What exactly is being archived?

What is a configuration decision versus a mathematical consequence?
```

Those are interface questions.

And they are where complex systems usually break.

---

# 25. I would reduce the entire specification to these governing laws

After everything above, I think these are the principles worth carrying forward.

### Law 1 — Define outcomes mathematically.

Never use “win,” “success,” “clean win,” or “advantage” without specifying the predicate.

### Law 2 — Generate derivable facts.

Probability tables, frame calculations, and other deterministic numbers should be generated by code.

### Law 3 — Version chosen policies.

A clamp, threshold, frame rate, retry count, or other policy is configuration, not mathematics.

### Law 4 — Separate world truth from character belief.

$$
WorldTruth\neqBelief\neqUtterance.
$$

### Law 5 — Recorded side effects are authoritative.

Replay must consume recordings rather than re-invoke external systems.

### Law 6 — Randomness is identity-addressed.

Execution order must not determine unrelated random outcomes.

### Law 7 — Every state mutation has an authoritative transition path.

Runtime events go through the event system; schema/canon migrations go through their versioned migration mechanism.

### Law 8 — Hard constraints and soft preferences are distinct.

Physical impossibility is not the same category as voice drift.

### Law 9 — A non-resolution outcome is an outcome.

Void, abort, cancellation, and invalidated contests need explicit representations.

### Law 10 — History should be cryptographically linkable.

A chain for linear history; a DAG structure for branching history.

### Law 11 — Replay, simulation, and rendering are different operations.

Never hide one inside another.

### Law 12 — Archive what cannot reliably be recreated.

Approved media is historical evidence, not merely cache.

### Law 13 — Human decisions are events.

Their effects must be auditable and replayable.

### Law 14 — Test mechanisms, not merely reported symptoms.

No model-call counter is stronger than “reported cost = $0.”

### Law 15 — Test the seams.

The interfaces between correct subsystems deserve more attention than the subsystems themselves.

---

# The most important new insight

There is an even deeper pattern underneath all of this.

The project is really trying to establish an **epistemology of a fictional universe**.

It needs to answer five different questions:

$$
\boxed{\text{What may be true?}}
$$

$$
\boxed{\text{What is true?}}
$$

$$
\boxed{\text{What happened?}}
$$

$$
\boxed{\text{What does this character believe?}}
$$

$$
\boxed{\text{What artifact recorded or represented it?}}
$$

Those are five different things.

Once you keep them separate, many of the remaining ambiguities disappear naturally:

* canon answers **what may be true**
* world state answers **what is currently true**
* event history answers **what happened**
* epistemic state answers **what an actor believes**
* media/archive answers **what was actually produced**

And the system becomes considerably harder for a generative model to corrupt accidentally.

That, more than the 2d6 corrections or any particular implementation trick, is the idea I would protect most carefully.

The original document was already moving toward this separation through its Event Log → Materialized State → Media Projection model. 

The remaining task is to make every boundary **explicit enough that a machine can enforce it, a test can challenge it, and a human can audit it.**

That is where the specification becomes genuinely strong rather than merely comprehensive.
I can't see `goblin-lore.md`, so I'm working from your pasted analysis of it, not from the source. That limits how far I can verify its claims, and I've flagged the places where that matters. I checked what I could (the 2d6 numbers, the graph theory, the hashing point) independently.

The pasted analysis is strong. My aim here is to sharpen it, correct it where it slips, and add what it misses. Where I disagree, I say so.

---

# Part 1: What is true and valuable

## 1.1 The core thesis holds, with a caveat

The central claim is that law, state, history, and media are separate layers, and that generation should be constrained by compiled invariants rather than by prompted memory.

This is sound and well established. It is a synthesis of several mature ideas: event sourcing, CQRS (separating writes from reads), constraint programming, and "make illegal states unrepresentable" from typed functional programming. Recognizing that a fiction pipeline is the same problem is the real contribution.

The caveat is that the analysis presents this as a novel discovery. It is a good application of known patterns, and that is a better claim. It means you can borrow decades of tooling and failure knowledge instead of reinventing them.

## 1.2 The four-layer separation is right, but two layers are doing different jobs than the analysis suggests

The layers are canon (law), events (history), state (present), and media (projection).

Two refinements:

**State is derived, not independent.** Current state is a fold over the event log applied to a canon baseline: `state = fold(apply, baseline, events)`. If state is not derivable from events, you have a second source of truth, and they will eventually disagree. The analysis lists state as a layer of its own, which is fine for thinking, but in implementation it should be a cache of a computation, rebuildable at any time. This is the property that makes the whole system trustworthy, so it should be stated as a rule: **any materialized state must be regenerable from canon plus events, and a build that cannot do this is broken.**

**Media is a projection with a caveat about its own facts.** Generated prose often introduces details that were never in state: the color of a curtain, a gesture, a line of dialogue. The analysis says media is "merely" a projection, which is true for state-bearing facts. But projections create new detail, and some of it will matter later. You need a rule for what happens when a projection introduces something that later recurs. Options are to forbid it, to harvest it into an "unratified detail" table for review, or to explicitly mark projection-level detail as non-binding. Without a rule, the model's incidental inventions become de facto canon through repetition.

## 1.3 Negative constraints and capability masks are the strongest practical idea

Compiling "right arm injured" into a banned-action set is better than prompting "remember his arm." This works for three reasons.

1. **It moves enforcement out of the model's attention.** Context-window recall is unreliable for a fact stated thousands of tokens earlier. A mask checked after generation does not depend on recall.
2. **It is checkable.** A violation is a boolean, not a judgment call.
3. **It composes.** Multiple conditions produce a union of banned actions without any prompt rewriting.

Dual verification (checking both the structured action tag and the prose independently) is also correct, because a model can emit consistent-looking metadata over inconsistent prose. Treat the structured output as an untrusted claim.

The limit you must plan for: **prose checking is the weak link.** Verifying that "he sprinted" contradicts a sprint ban requires either keyword matching (brittle, misses paraphrase such as "bolted," "dashed," "tore across") or a second model call (which reintroduces model unreliability). No approach here is fully solid. The practical mitigation is to constrain generation upstream (have the model select from a legal action menu rather than freely author actions) and treat post-hoc prose checking as a second, imperfect net. A checker with a false-negative rate is still much better than none, but the design should not assume it is airtight.

## 1.4 The somatic, logistical, and epistemic split is valuable

Separating what the body can do, what the character holds, and what the character knows is a real gain, because it prevents the collapse into one blurry sentence. I would add a fourth vector.

**Relational/social state.** Trust, debt, obligation, alliance, and standing between pairs of characters. The analysis buries this inside "epistemic" (leverage, relationships), but a debt is not a piece of knowledge. It exists whether or not anyone remembers it. Two characters can both forget a debt and it still binds. Treating it as its own vector lets you model asymmetry (A thinks B owes them, B thinks otherwise) as a comparison between the epistemic and relational layers, which is a rich source of drama.

## 1.5 Unknown as a first-class state is the best underappreciated idea

Preventing the model from converting ambiguity into fabricated certainty is a real and specific failure mode of language models. Deliberately unresolved mysteries are a storytelling asset, and the analysis is right to protect them structurally.

The list of epistemic statuses (known true, known false, unknown, disputed, false belief, withheld, unresolved-by-canon) is good. Two points to add.

**Unknown must be indexed by who does not know.** "Unresolved by canon" (the author has decided nobody, including the audience, gets the answer) is different from "unknown to Bog but known to Spleen." Both are epistemic gaps, but only the first is a generation prohibition. Conflating them will cause the generator to either leak answers it should hold or refuse to use information that a character legitimately has.

**Unresolved needs an expiry or a resolution protocol.** A mystery that can never be touched eventually becomes dead weight. Even if the default is "never resolve," there should be an explicit ratification path for resolving one, so the option exists and is deliberate rather than accidental.

## 1.6 The causal graph versus runtime state machine distinction is the most important correction

The analysis is right that a causal unlock graph should be acyclic while runtime behavior may cycle, and that this should be constitutional. I would go further, because there is a subtlety it does not state.

The acyclicity requirement applies to **unlock dependencies** ("event B becomes available only after A"). It does not apply to **influence**. In a healthy story, A influences B and B influences A. What you must prevent is *circular prerequisites*, where A requires B and B requires A, which deadlocks. You do not need to prevent *mutual causation over time*, which unrolls acyclically once you index by time.

The clean formulation: **cycles are fine in the relationship graph; they are only forbidden in the prerequisite graph; and any apparent cycle in causation is resolved by time-indexing** (A at t1 causes B at t2 causes A at t3, which is three distinct nodes). This dissolves what looks like a conflict between "DAG doctrine" and "stories need recurrence."

## 1.7 Determinism: correct, with one clarification on scope

Same input yielding the same canonical artifact is essential, and the rules listed (no ambient timestamps, stable key ordering, preserved array order where order carries meaning) are the right ones. Two additions:

- **Floating-point.** If any state is floating-point (severity 0.73, penalty values), serialization can differ across platforms or languages. Canonical serialization should either use fixed-point/integer representations or a specified numeric format. This is a classic reproducibility trap that the pasted analysis does not mention.
- **Locale and Unicode.** String normalization (NFC vs NFD) and locale-dependent sorting can change hashes silently. Normalize explicitly.

The hierarchical seeding idea, where child seeds are derived so that changing visual randomness does not change story outcomes, is excellent and worth keeping. The property to test is **seed isolation**: perturbing a render-layer seed must leave every simulation-layer output byte-identical.

## 1.8 Health versus validity is a genuinely important distinction

The compiler asks "is this legal?" and a health system asks "is this alive?" This is right, and the observation that a corpus can be valid but dramatically inert is real. The dyad-coverage metric is a reasonable start.

The warning is about **Goodhart's law**. Once you optimize for balanced dyad coverage, a generator will produce artificial conflicts between under-served pairs to raise the score. Health metrics are good as diagnostics for a human and dangerous as optimization targets for an automated loop. Keep them advisory.

---

# Part 2: Corrections to the pasted analysis

I checked several claims. Here is what holds and what does not.

## 2.1 The 2d6 margin figures are wrong as stated

The analysis endorses these values for the difference of two independent 2d6 totals: about 11.3% for zero margin, 21.6% for ±1, 19.3% for ±2, and about 15.1% for absolute margin of at least 6.

I computed this exactly. Each 2d6 total has 36 equally likely outcomes, so the difference has 1296 combinations. The count for a difference of exactly d is the sum over totals of P(X)P(X−d).

- Difference of 0: 146/1296 ≈ **11.27%**. This matches the 11.3%.
- Difference of exactly ±1 (both signs combined): 2 × 125/1296 ≈ **19.29%**, not 21.6%.
- Difference of exactly ±2 (both signs combined): 2 × 100/1296 ≈ **15.43%**, not 19.3%.

The 19.3% the analysis attributes to ±2 is in fact the figure for ±1. The 21.6% doesn't correspond to a clean single-margin value, so it may come from a different framing (perhaps a cumulative or one-sided quantity). The zero-margin figure is correct.

For the tail, absolute margin of at least 6: summing the counts for |d| = 6 through 10 gives about 15.1%, so that figure holds up.

The upshot: I would not treat the middle two numbers as "sound" without seeing the source's definition. Since I cannot view the file, I cannot tell whether the error is in the source or in this summary. Recompute from the definition and pin the values in a test.

## 2.2 "Immutable within a revision" is right, and worth a stronger form

The correction from "immutable law" to "immutable within a canonical revision" is accurate. The stronger version: canon is **append-only across revisions with explicit supersession**, so old revisions stay reproducible. Then any past episode can be re-verified against the revision that was current when it was made. That is what makes audit meaningful.

## 2.3 The retired-entity resolution is correct

Splitting active dependency (retired target forbidden) from historical reference (retired target permitted) resolves the apparent contradiction cleanly. I would name the two reference kinds explicitly in the schema so the validator can enforce them mechanically rather than by convention.

## 2.4 The hashing point is right and understated

The analysis notes that hashing only the entity payload while leaving metadata outside the hash means the hash does not identify the whole artifact. That is correct. It also distinguishes integrity from authenticity correctly: a bare SHA-256 detects accidental change but does not stop deliberate replacement, since an attacker can recompute the hash. For a single-author creative project, integrity is usually enough and signing is optional. It becomes necessary only if artifacts cross a trust boundary.

## 2.5 Small terminology points

The pass-count and stage-count discrepancies (two-pass versus three-pass; "five-stage" versus six numbered stages) are real but trivial. They matter only because a governance document should be internally exact. Fix them, but they are not architecture.

---

# Part 3: Additions worth making

## 3.1 Model the audience's knowledge separately from the characters'

The analysis handles what characters know. Drama depends heavily on what the *audience* knows relative to the characters (dramatic irony, suspense versus surprise). Add an audience-knowledge layer: what has been shown on screen, what has been implied, what is withheld from the viewer. Without it, the system can keep characters consistent while mishandling reveals, because "the audience has seen X" is not tracked anywhere. It also gives you a principled way to schedule information release.

## 3.2 Distinguish hard constraints from soft constraints

The masks and invariants described are hard: violation means reject. But stories also have soft constraints: tendencies, voices, habits (a character *usually* deflects with humor). Treating those as hard bans makes characters robotic; ignoring them makes them drift. Give the schema two tiers: hard (reject on violation) and soft (score or warn, allow with justification). Character voice and behavioral tendency belong in the soft tier.

## 3.3 Plan for canon migration

Once canon has revisions, you will eventually change a rule that invalidates earlier events. You need a defined answer: do old episodes stay valid under the old revision (pinned), or must they be re-verified? Pinning each episode to the canon revision it was built against is the simple, robust choice, and it makes the "regenerate a projection without changing the world" claim precisely testable.

## 3.4 Beware over-specification

There is a real risk that this system optimizes for consistency at the expense of surprise and life. A world where every state transition is pre-constrained can only produce what its rules foresee. The remedy is deliberate slack: reserve a mechanism for controlled rule-breaking (a ratified exception with a recorded reason), so that a writer can consciously violate a constraint for effect. A legal system needs a pardon mechanism; so does this one. The waiver concept the analysis mentions for assets should generalize to constraints.

## 3.5 The tracer bullet is the right call and the most actionable point

Building one character, one grievance, one line, one shot, and one audio stem end to end before expanding is the correct discipline. The biggest risk in a project like this is architecture that is elaborate, internally consistent, and never exercised. Define the success criteria before building so "done" is checkable:

- Same seed and canon produce a byte-identical artifact on two runs.
- A deliberately illegal action is rejected before generation.
- Perturbing a render seed does not alter the event log.
- Deleting materialized state and rebuilding from canon plus events reproduces it exactly.

Those four tests validate the four central claims. If any fails, the architecture has a hole, and you find it cheaply.

---

# Part 4: What to keep, in priority order

1. **State is derived from canon plus events**, never independent. This is the invariant everything else depends on.
2. **Hard constraints compiled to machine-checkable masks**, enforced after generation, with generation constrained upstream where possible.
3. **Unknown as a first-class, indexed epistemic state**, with a deliberate resolution path.
4. **Prerequisite graph acyclic; relationship and runtime graphs free to cycle**, with time-indexing resolving apparent causal loops.
5. **Ratification gate for promoting runtime facts to canon**, with provenance on every permanent fact.
6. **Deterministic compilation and seed isolation**, including numeric and Unicode normalization.
7. **Health metrics as human diagnostics**, not optimization targets.
8. **A tiered constraint model with a pardon mechanism**, so consistency does not smother surprise.
9. **The tracer bullet with four explicit tests**, before any expansion.

The strongest single sentence from the analysis, which I agree with: a narrative world should behave like a physical one, where impossible trajectories are simply unavailable rather than politely discouraged. My additions mostly serve to keep that from becoming rigid: a physical universe has no pardons, but a story needs them.

If you can share the actual file, or the specific sections on the 2d6 margins, the compiler passes, and the epistemic vector, I can verify these points against the source and tighten anything I could only infer from the summary.

This document looks like an integrated revision of the earlier analysis, with my suggestions folded in as new sections. Reading it as a specification, I'll separate what holds up from what needs correction, then add what I think is missing. I have no source file beyond what you've pasted, so where I say "the document claims," I'm reasoning only from this text.

---

# Part 1: Errors I can verify

## 1.1 The 2d6 table is internally inconsistent (this matters)

I computed the exact distribution of the difference of two independent 2d6 rolls. The table's rows do not all match, and the errors cascade into the downstream claims.

The number of ways to get a difference of exactly d is the sum over s of P(A=s)·P(B=s−d), times 1296 for counts. Exact **ordered combination counts for one sign** (so ±d total is twice this):

| d | Count (one side) | Both sides | Probability (both sides) |
|---|---|---|---|
| 0 | 146 | 146 | 11.27% |
| 1 | 125 | 250 | 19.29% |
| 2 | 100 | 200 | 15.43% |
| 3 | 75 | 150 | 11.57% |
| 4 | 52 | 104 | 8.02% |
| 5 | 33 | 66 | 5.09% |
| 6 | 18 | 36 | 2.78% |
| 7 | 8 | 16 | 1.23% |
| 8 | 3 | 6 | 0.46% |
| 9 | 1 | 2 | 0.15% |
| 10 | 0 | 0 | 0% |

Sanity check: 146 + 2(125+100+75+52+33+18+8+3+1) = 146 + 2(415) = 976. That is wrong, since it should total 1296, so I recomputed properly. The correct one-sided counts (number of ordered pairs with A−B = d) are:

- d=0: 146
- d=1: 140
- d=2: 125
- d=3: 104
- d=4: 80
- d=5: 56
- d=6: 35
- d=7: 20
- d=8: 10
- d=9: 4
- d=10: 1

Check: 146 + 2(140+125+104+80+56+35+20+10+4+1) = 146 + 2(575) = 1296. ✓

This corrects my own earlier response. In my previous message I gave 125/1296 for |d|=1 and 100/1296 for |d|=2, and I said the source's ±1 and ±2 figures were wrong. That was my error: I computed those counts incorrectly. The document's table is right for d=0 through d=5:

- 0: 146 (11.27%) ✓
- ±1: 280 (21.60%) ✓
- ±2: 250 (19.29%) ✓
- ±3: 208 (16.05%) ✓
- ±4: 160 (12.35%) ✓
- ±5: 112 (8.64%) ✓

The document's last row is where the problem sits. It says "±6 to ±10: 70 each side (140 total), 10.80%." The true one-sided sum for d = 6 to 10 is 35+20+10+4+1 = **70**, so 70 each side, 140 total, is correct. ✓ The table holds up.

So the core table is correct and I retract my earlier objection. The lesson is worth stating plainly: I should have verified my own counts before challenging a source, and I recommend the same discipline in this project. Pin these values in a test computed by brute-force enumeration, not by formula.

Now the derived claims:

- **|d| ≤ 2 is 52.16%.** (146+280+250)/1296 = 676/1296 = 52.16%. ✓
- **"+3 modifier grants 81.64% probability of outright victory, P(d ≥ −2)."** Compute P(d ≥ −2) = 1 − P(d ≤ −3). P(d ≤ −3) is half of P(|d| ≥ 3) = ½(1296 − 676)/1296 = 310/1296 = 23.92%. So P(d ≥ −2) = 76.08%, not 81.64%. Check the other direction: P(d ≥ −2) = P(d ≥ 0) + P(d = −1) + P(d = −2) = (146 + 575) + 140 + 125 = 986/1296 = 76.08%. **The 81.64% figure is wrong.** It appears to be incorrect arithmetic, and it is also mislabeled: a +3 modifier making the contest "net d ≥ −2" is a *not-losing-badly* threshold, not an "outright victory" threshold. Outright victory would be P(d > 0 after modifier) = P(d ≥ −2) only if victory requires margin ≥ 1 after the +3, which is d ≥ −2. So the quantity is at least coherent, but the number should be 76.08%.
- **"A +1 shift near the center shifts win probability by 12–17 percentage points."** A +1 shift moves the boundary by one margin step, so the change equals the probability mass at that margin: 140/1296 = 10.80% one-sided, up to 146/1296 = 11.27% at zero. The 12–17 range doesn't match. The shift near the center is roughly **10.8–11.3 points**, not 12–17. I can't reproduce the stated range.

So: the table is right, but two of the derived claims are wrong. This is exactly the sort of error the tracer-bullet approach should catch: **any number in a design document that a test could compute should be a test.**

## 1.2 The "Modifiers clamped to [−2, +2]" recommendation

The reasoning is sound in spirit. Given that roughly 11 points shift per unit of modifier near the center, a ±2 clamp already moves outcomes by about 22 points, which is substantial. A ±3 clamp would move it about 33 points. I'd keep the clamp but re-derive the rationale from the corrected figures.

## 1.3 The cache-invalidation and hashing sections are directionally fine

I have no correction to make there beyond specifics noted below.

---

# Part 2: What is genuinely valuable in this document

## 2.1 The Deletion Principle is the best formulation of the architecture

"If all generative models are deleted, the universe remains logically intact; if the ledger is lost, the universe suffers brain death." This is a testable, falsifiable statement of where authority lives. It converts a philosophical stance into a design criterion, and Assertion 4 in the tracer-bullet harness tests it directly. That is the right pairing of principle and test.

One nuance the document flags but underweights: it says media artifacts are "non-reproducible." That is a serious operational fact. If a diffusion render cannot be regenerated bit-for-bit (GPU nondeterminism, driver versions, model updates), then media are *evidence*, not *derivations*, and must be stored as such. This creates a real asymmetry: the ledger is regenerable-from-source; the media are not regenerable, only archivable. That deserves prominent placement in the operational plan (content-addressed storage, backups, retention), and it undercuts the claim in the earlier analysis that "every projection can be regenerated." Regenerable in principle from state, yes; regenerable to the same pixels, no.

## 2.2 Ignorance by omission is correct and important

The claim that you cannot instruct a model to "pretend a character doesn't know X," because mentioning X primes its use, matches how language models actually behave. Enforcing epistemic boundaries by *not including* the fact in that character's context is the right mechanism. It is also cheap.

The limit worth noting: omission works for facts the model has no independent route to. If a fact is inferable from what remains in context, or is common knowledge from the model's training data, omission fails. For an invented world like this, inference from other included facts is the main leak path. Test it: give the model a context that omits fact X but includes facts from which X follows, and check whether the model asserts X.

## 2.3 The prerequisite-DAG versus time-indexed interaction graph resolution is correct

The document adopts the formulation I proposed: cycles are forbidden in prerequisites, and apparent causal loops resolve through time-indexing. This is sound. One point to add: time-indexing only works if timestamps are strictly ordered and events carry them. If two interactions can occur at the same simulation cycle and depend on each other, you have a same-tick cycle that time-indexing does not resolve. You need an explicit intra-tick ordering rule (a deterministic resolution order, or a two-phase commit where all agents read the tick-start state and write simultaneously). State this as a rule; otherwise same-tick mutual dependency will produce nondeterminism.

## 2.4 Fixed-point integers over floats is the right call

Basis points (0–10000) for severities removes a real reproducibility hazard. Two caveats: multiplication of fixed-point values needs a defined rounding rule (round-half-even or floor, stated once and enforced), and any place where the design still shows `subjective_probability: number; // 0.0 to 1.0` in the `BeliefRecord` interface contradicts the fixed-point mandate. That field should be an integer in basis points too. This is an internal inconsistency in the document.

## 2.5 The unratified-detail policy (discard / harvest / ratify) is well designed

This closes the gap I flagged about projections introducing detail. The three tiers are clear. The remaining weak point is the trigger for harvest: "details that recur or anchor dramatic beats." Recurrence detection requires something to notice recurrence, which means an entity-extraction pass over generated prose and a matching mechanism. That is nontrivial and prone to misses, so specify how detection works, or acknowledge that harvest will be partly manual.

---

# Part 3: Problems and risks in the proposed additions

## 3.1 The "independent extraction pass" is not independent enough

The verification stack proposes a second model at temperature 0.0 to extract actions from prose, then a symmetric-difference gate. Two issues.

**Temperature 0 is not determinism.** Many inference stacks produce nondeterministic output even at temperature 0 (batching effects, floating-point nondeterminism on GPU). So this pass cannot be treated as a bit-reproducible compiler stage. It is a probabilistic check, and the design should not put it inside a pipeline whose purpose is deterministic hashing. Either record its output in the ledger as an input (making later replay use the recorded result rather than re-querying), or place it outside the deterministic boundary explicitly.

**The symmetric-difference gate will over-fire.** Requiring the self-reported and independently extracted action sets to match exactly will halt on benign disagreements: granularity ("walks" vs "limps"), synonyms, and implied actions. You need a normalization step mapping both outputs into a fixed action vocabulary, and a policy that distinguishes disagreements that matter (an action that violates a mask) from ones that don't. Otherwise the gate causes constant false halts and gets disabled. Gate on *mask violations in either set*, not on set equality.

## 3.2 The pre-flight "SAT solver" claim

Assertion 2 names `PRE_FLIGHT_INVARIANT_SOLVER` and a `satisfiable` result at $0.00 cost. Checking that hand demand ≤ hand supply is simple arithmetic, not SAT. Calling it a solver is fine as a label, but as constraints grow (multiple interacting hard invariants) it can become genuinely combinatorial. For the tracer bullet, simple arithmetic checks suffice. Do not build a general solver until a constraint set demonstrably needs one.

## 3.3 The Pardon Ledger has a governance gap

The waiver example authorizes with `"SHOWRUNNER_DIRECT_KEY"` and injects a `consequence_injected` state. Two concerns:

- **A pardon must be scoped.** As written, a waiver could be read as a permanent exemption. Each pardon should be bound to a specific episode, scene, and event, and expire there. Otherwise one waiver becomes a standing loophole.
- **Pardons apply to soft constraints and, by the document's own tiering, to hard invariants too.** The diagram shows a "Pardon Override Gate" on the hard-invariant branch, but the text says hard breaches "halt compilation" with "zero tolerance." These conflict. My earlier suggestion was that a pardon mechanism exists so consistency doesn't smother surprise, but I'd now restrict it: **pardon soft constraints freely; pardon hard invariants only for ontology-level exceptions the author explicitly ratifies (for example, a genuine miracle), never for physical-resource violations like using a disabled arm.** A waiver that lets a paralyzed arm lift would defeat the whole somatic system. Decide which hard invariants are pardonable and encode that, rather than leaving the gate ambiguous.

Also, the example waiver's ID embeds a date (`wv_20260920_...`). That is fine as an identifier but must not feed any hash computation as an ambient timestamp, per the determinism rules.

## 3.4 Canon migration: the remaster design has a subtle flaw

The document says all mutated scenes render to tagged variants and the original master is preserved. Good. But the migration adapter μ maps State_v1 to State_v2, and it needs to be **total and verified** (every valid v1 state maps to a valid v2 state) or historical episodes may fail to replay. Add a test that every historical episode's event log replays cleanly under its *pinned* revision, and separately that μ applied to each yields a valid v2 state. Without the second test, remastering silently produces invalid worlds.

Also: pinning to `canon_revision_hash` is right, but compiler versions matter as much. If the compiler changes how it normalizes strings, an old episode compiled under a new compiler may hash differently. The document stores `compiler_version` in the manifest, which is correct. Historical mode needs to run the *pinned compiler*, not merely the pinned canon, so preserve old compiler builds or containerize them.

## 3.5 The audience-knowledge layer is valuable but underspecified in one way

`AudienceKnowledgeState` tracks what has been revealed. It uses `Map` and `Set` types, which do not serialize to JSON in a canonical, order-stable way. Given the determinism mandate, these need explicit canonicalization (sorted arrays of entries). This is a small inconsistency but exactly the kind that produces silent hash drift.

The bigger gap: the four pacing modes are defined, but the compilation gate is only described for `DRAMATIC_IRONY`. Specify the other three:

- **SUSPENSE:** audience knows a threat exists; the character does not; and a *consequence-bearing* event is pending.
- **SURPRISE:** the fact must be absent from *both* audience and character knowledge before the scene and present in both after.
- **MYSTERY:** the character knows something the audience does not, and the scene plan must not disclose it to the audience.

Note that SUSPENSE and DRAMATIC_IRONY are closely related; as written they overlap. Distinguish them by whether a time-bound threat exists.

---

# Part 4: Additions I consider worthwhile

## 4.1 Version the schema of the ledger itself

The document versions canon and the compiler but says little about **the ledger's own schema**. Event types will evolve. Use a versioned event envelope (event type plus schema version) with upcasters, the standard event-sourcing technique, so old events remain readable as event definitions change. This is separate from canon migration and is a frequent source of pain in real event-sourced systems.

## 4.2 Idempotency and event ordering

The fold `State_N = fold(apply, State_0, [E_1...E_N])` assumes events are totally ordered and each applied exactly once. Give every event a unique ID and a monotonically assigned sequence number, and make `apply` reject duplicates. In a system with multiple workers (LLM, TTS, renderer) writing to the same ledger, this prevents double-application after retries. Also decide whether `apply` is allowed to fail: an event that is invalid against current state should be rejected *at append time*, so the log contains only events that were legal when written.

## 4.3 Separate the write model from the read model

Materialized state doubles as the read model, but scene planning wants different views (for example, "what can this character know right now" is a filtered view). Treat these as named projections of the ledger, each rebuildable. This keeps the epistemic-omission filter a first-class, testable query instead of ad hoc logic inside prompt assembly.

## 4.4 Test the omission mechanism directly

Add a fifth invariant test to the tracer bullet: for a character who does not know fact X, assert that X and any string derivable from it does not appear in the assembled prompt for that character. This is cheap, deterministic, and protects the epistemic guarantee that the whole "ignorance by omission" design rests on. It costs no model calls.

## 4.5 Anchor the constants

Several numbers appear without justification: 40% closure threshold for human review, 24 fps, the clamp range. Some are conventions (24 fps), some are tunable parameters. Keep the tunable ones in a single versioned config that the compiler reads, so they are part of the pinned revision and not scattered magic numbers. The frame formula $F = \lceil D_{ms}/1000 \times 24 \rceil$ is fine, but note that ceiling accumulates rounding error across many lines, so cumulative timing should be computed from cumulative milliseconds and quantized once, not by summing per-line ceilings, to avoid drift.

---

# Part 5: Priority summary

**Keep as core:**
1. The Deletion Principle and its test (Assertion 4).
2. State as a pure fold over an append-only, validated event log.
3. Hard capability masks enforced after generation, with generation constrained upstream.
4. Ignorance by omission, with a direct test.
5. Prerequisite DAG plus time-indexed interaction graph, with an explicit intra-tick ordering rule.
6. Fixed-point arithmetic and canonical serialization.
7. Pinning episodes to both canon revision and compiler version.

**Fix before building:**
1. Correct the two wrong derived 2d6 claims (76.08%, roughly 11-point modifier shift), and compute all such figures in tests.
2. Resolve the hard-invariant pardon contradiction.
3. Make the discrepancy gate operate on mask violations, not set equality, and treat the extraction pass as nondeterministic.
4. Replace `Map`/`Set`/float fields with canonical-serializable, fixed-point equivalents.
5. Specify the remaining three pacing-mode gates.

**Add:**
1. Ledger schema versioning with upcasters.
2. Event idempotency and append-time validation.
3. A fifth tracer-bullet test for omission.
4. Cumulative-millisecond frame quantization.

---

# Closing observation

This document has moved from analysis toward specification, and the change exposes a new risk: the more concrete it becomes, the more numbers, types, and claims it contains that can be quietly wrong. I made an error myself in my last response, and the document contains two of its own. The remedy is the same as the project's central thesis applied to its own documentation: **claims that can be computed should be computed by tests, not asserted in prose.** Make the 2d6 table a generated artifact, and make every "this must hold" statement in the spec correspond to an executable check. The tracer bullet proves the pipeline, but a spec-as-tests discipline will keep the documentation as trustworthy as the world it describes.I checked this revision the way I said last time I would: every number recomputed independently, and every "must hold" claim tested against what I could derive. Most of it survives. The places where it doesn't are the most useful part of this reply, because they show which claims the spec's own discipline ("derive, don't assert") has not yet reached.

I only have the text you pasted. Statements about "earlier drafts" are things I can only see through the document's own description of them.

---

# Part 1: Mathematical verification

## 1.1 The 2d6 difference table is fully correct

I enumerated all 1,296 ordered pairs. The one-sided counts, totals, and probabilities in the table match exactly:

| \|d\| | One-sided | Total | Probability |
|---|---|---|---|
| 0 | 146 | 146 | 11.27% |
| 1 | 140 | 280 | 21.60% |
| 2 | 125 | 250 | 19.29% |
| 3 | 104 | 208 | 16.05% |
| 4 | 80 | 160 | 12.35% |
| 5 | 56 | 112 | 8.64% |
| 6 | 35 | 70 | 5.40% |
| 7 | 20 | 40 | 3.09% |
| 8 | 10 | 20 | 1.54% |
| 9 | 4 | 8 | 0.62% |
| 10 | 1 | 2 | 0.15% |

Check: 146 + 2(140+125+104+80+56+35+20+10+4+1) = 146 + 2(575) = 1296. ✓

In my previous reply I said the numbers were correct and retracted an earlier objection, then muddled the reasoning along the way. To be unambiguous: **this table is right.** My first-turn claim that ±1 should be about 19.3% and ±2 about 15.4% was wrong, and I appreciate that the spec corrected the record instead of deferring to my mistake.

## 1.2 The derived claims are right too, with two caveats

- **|D| ≤ 2 = 52.16%.** (146+280+250)/1296 = 676/1296 ✓
- **P(D ≥ −2) = 76.08%.** 986/1296 ✓. The document's earlier 81.64% was an error and is correctly fixed. The identity checks: 1296 − 310 = 986, and 310 is the count of D ≤ −3, which is half of the 620 outcomes with |D| ≥ 3. ✓
- **Sensitivity per +1 modifier near the center: 10.80%–11.27%.** ✓ (140/1296 and 146/1296).
- **Cumulative |D| ≥ d column.** Spot-checked: |D| ≥ 4 is 160+112+70+40+20+8+2 = 412/1296 = 31.79% ✓. |D| ≥ 6 is 140/1296 = 10.80% ✓.

**Caveat one: the "Clean Win Base Rate" sentence has a labeling problem.** It says a Clean Win (D ≥ +4) occurs in 206/1296 = 15.90% for an individual actor, or 31.79% across both participants. The count 80+56+35+20+10+4+1 = 206 is right. But 206/1296 is 15.90%, and doubling gives 412/1296 = 31.79% ✓. The math is fine; the phrase "across both participants" is a little loose, because 31.79% is the probability that *someone* wins cleanly, not that a particular actor does. Reword it.

**Caveat two: the "+3 modifier" claim's explanation is muddled.** The document says the earlier error came from "confounding a single-die target-8 check with an opposed difference." I can't verify that diagnosis of where 81.64% came from. What I can say is that the corrected figure, 76.08%, is right, and that the stated cause is a guess about a document I haven't seen. The same paragraph then says the single-roll comparison "target 8+ shifts by 16.67%." Check that: P(2d6 ≥ 8) = 15/36 = 41.67%, and P(2d6 ≥ 7) = 21/36 = 58.33%, so a one-step shift at that boundary is 16.67 points. ✓ This supports the point that fixed-target rolls are far more modifier-sensitive than opposed rolls, which is a useful design insight: **the same +1 does roughly 1.5 times more work in a fixed-target check than in an opposed one.** That should inform how you balance the two mechanics if both exist.

## 1.3 A subtle point the spec's own numbers reveal

The document labels |D| ≤ 2 outcomes "Mutual Wound" and "Costly Win" and celebrates that over half of contests are narrow. That is a *design* claim, and it deserves a second look. If narrow outcomes are more than half of all contests, then modifiers of ±2 (about 22 points of swing) don't just nudge results: they can move a contest from "roughly even" to "roughly 3-to-1 favored." The clamp to [−2, +2] is reasonable, but the spec says "Strings capped" without giving the cap or its effect. If strings stack with modifiers, the effective clamp is larger than it looks. Specify whether the clamp applies to the *total* of all modifier sources or to each individually. If per-source, three sources at +2 gives +6, which is nearly deterministic (P(D ≥ −5) ≈ 91.4%).

---

# Part 2: Claims that hold up

## 2.1 The media asymmetry is the most valuable new correction

The spec now states that media artifacts are non-reproducible across GPUs, driver patches, and container revisions, so they must be archived as evidence. This corrects my earlier statement that "every projection can be regenerated," and I agree with the correction. It is true and operationally important.

The implication worth drawing out: there are now **two different durability classes**, and they need different infrastructure.

- **Derivable assets** (ledger state, materialized views): losing them costs recompute time. Back up the *sources* (canon plus event log), not the derivations.
- **Non-derivable assets** (approved renders, audio stems): losing them costs the artifact permanently. These need backup, integrity verification (periodic re-hashing of content-addressed blobs), and a retention policy.

A common mistake is backing up everything equally or, worse, backing up derived data while the sources sit in a single unbacked location.

## 2.2 Two-phase tick commit is correct and closes a real gap

I raised the same-tick ordering problem last time, and the two-phase design (all agents read the frozen tick-start state, propose actions, then a single arbitration step commits) is the standard, correct answer. Two details need specifying so it is actually deterministic:

- **Arbitration order must be deterministic even when outcomes are random.** If two agents contest the wrench and the winner is decided by an opposed roll, the *order in which conflicts are resolved* still matters when one agent is involved in several conflicts. Resolve conflicts in a fixed, stated order (for example, sorted by contested-resource ID), and derive each conflict's random draws from a seed keyed by `(tick, resource_id)`, not from a shared advancing RNG stream. Otherwise, adding one unrelated agent changes every later roll.
- **Chained dependencies within a tick.** If A's proposed action depends on B's action succeeding (A hands B the wrench, but B is also being disarmed), two-phase commit as described cannot express it, because everyone read tick-start state. Decide the rule: either such actions are illegal to propose, or they resolve in a defined second sub-phase. Leaving it unstated will produce inconsistent implementations.

## 2.3 The scoped pardon ledger is much improved

The revised version fixes the problems I raised: hard physical invariants are now unpardonable, waivers are scoped to `(episode, scene, character)`, IDs are content-addressed, and there is an expiry. Remaining issues:

- **`expires_at_cycle: 48` alongside a scope that already pins a single scene is redundant or contradictory.** A waiver scoped to one scene has no meaningful cycle-based expiry beyond that scene. Either the scope is a scene and expiry is implicit, or the waiver can span scenes and expiry matters. Pick one; both is confusing.
- **`injected_consequence` needs an authority check.** The waiver injects `status_shift:humiliated_open_grief`, which mutates state. That means a pardon token is also a state-mutating event, and it must go through the same append-time validation and ratification path as any other event. Otherwise a pardon is a back door for state changes that skip the ledger's rules.
- **The tiering leaves an unaddressed middle.** "Physical invariants: unpardonable; voice: pardonable" is clean, but some constraints are neither: an *epistemic* violation (a character saying something they shouldn't know) is not physical, but pardoning it breaks the omission guarantee. Decide explicitly which tier epistemic and relational constraints occupy. My recommendation: epistemic violations are hard (they are the same class of error as a physical impossibility from the reader's perspective), while relational tendencies are soft.

## 2.3b The Ignorance-by-Omission assertion (Test 5) has a real weakness

The new fifth test asserts that the assembled context does not contain the string `fact_famine_origin` and does not match `/famine/i`. This is good as a smoke test, but two problems:

1. **The regex is too broad in one direction.** `/famine/i` would fail the test if the character *legitimately* knows about the famine as a general event but not its origin. The omitted fact is the *origin*, not the word "famine." The test as written conflates the two and would force you to omit the famine entirely. Test against the specific omitted proposition's unique tokens, not a common word. Better: assert that the *fact identifier and its canonical paraphrase strings* are absent.
2. **It only tests string absence, not inferability.** I raised this before. A context that omits the fact but includes premises from which it follows still leaks. A string test cannot catch that. Treat Test 5 as necessary but not sufficient, and add a periodic, non-blocking evaluation (model-based, run offline) that probes whether the model can reconstruct omitted facts from the remaining context.

---

# Part 3: Problems that remain

## 3.1 Fixed-point rounding: truncation creates bias

The spec defines `Scale(A, B) = ⌊(A × B) / 10000⌋`. Truncation is deterministic, which is the goal, but it introduces a **systematic downward bias**. Repeated scaling (compounding an injury penalty across cycles) will drift low. Two consequences:

- Values that should reach exactly 10000 by repeated application may never reach it (and 1 × 1 / 10000 = 0, so small values collapse to zero after one multiplication).
- Round-half-even or round-half-up avoids the bias at the cost of slightly more code. I mentioned round-half-even last time; truncation is a legitimate choice, but it should be a *decision*, made knowing the bias, not a default. If truncation stays, add a test that repeated application of a decay factor behaves as intended at the boundaries.

Also specify intermediate width. A × B with both near 10000 reaches 10⁸, which fits in 32 bits, but any chained product (three factors) reaches 10¹² and overflows 32-bit integers. If any implementation uses JavaScript numbers, integers above 2⁵³ lose precision; if it uses `bigint`, say so. The `EventEnvelope` already uses `bigint` for sequence numbers, so the convention exists; extend it.

## 3.2 The cumulative-millisecond formula: the direction of rounding needs a second look

The spec's formulas:

StartFrame_k = ⌈(Σ_{i<k} Dur_i) / 1000 × 24⌉
EndFrame_k = ⌈(Σ_{i≤k} Dur_i) / 1000 × 24⌉ − 1

Check contiguity: EndFrame_k + 1 = ⌈cum_k × 24/1000⌉, and StartFrame_{k+1} = ⌈cum_k × 24/1000⌉. These are equal. So consecutive lines tile the timeline with no gaps and no overlaps. ✓ That is the property that matters, and the design achieves it. Well done.

Two refinements:

- **Total error is bounded by one frame, not zero.** The cumulative method guarantees the *end* of the scene is within one frame of the true audio length, whereas per-line ceilings could drift by up to N frames. That is the real win and the right way to state it: "drift bounded to less than one frame regardless of line count."
- **The claim "6 to 12 frames of inflation across 12 lines" is plausible but unverified.** Per-line ceiling adds on average 0.5 frames per line (fractional part is roughly uniform), so 12 lines average about 6 extra frames, with a maximum near 12. So "6 to 12" is about right as an average-to-worst-case range. Stated as a range, that's fair; stated as a typical result it overstates. Round-to-nearest per line would average zero drift but still random-walk; cumulative quantization is still better.

Also decide the **frame rate as data, not a constant.** The formula hardcodes 24. If you ever need 23.976 (common for delivery), the arithmetic changes: 23.976 fps is 24000/1001, which is not an integer ratio with milliseconds. Store the rate as a rational (numerator, denominator) and compute with integers, so a frame-rate change is a config change and not a code hunt.

## 3.3 The "$0.00" claim in the pre-flight test

Assertion 2 checks `tokenCostUsd` equals 0.00. That is a fine assertion, but it tests that *this path made no model calls*, which is a property of the code, not of the invariant. Assert instead that **the model client was never invoked** (a mock with a call counter that must equal zero). A cost field can be zero by accident, for instance if the pricing table is missing, while the mock counter cannot be.

Also, the test's mislabeled setup: the test name says "amputated limb," but the inputs set `arms_available: 1.0`, and the action is `BIMANUAL_HEAVE`. That is a *one-arm-available* character attempting a two-arm action, which is a valid rejection, but "amputated" is a different condition than "arms_available = 1.0" in the model's vocabulary. Not an error in logic, just naming that will confuse future readers.

## 3.4 Terminology and internal consistency

- **`arms_available = 1.0` is a float.** The document bans floats in serialized state and mandates basis points, yet the somatic example uses `1.0`. Under the stated rules this should be `10000` basis points, or better, an integer count of functional arms (`arms_available = 1`), since arms are discrete. Fractions matter only for partial impairment; even then, express it as basis points. This is a small inconsistency, but a spec that declares a rule and then violates it in its own examples trains readers to ignore the rule.
- **"Pass 1 schema" failing on non-integers** is a good enforcement mechanism. Make it real: reject a JSON number that is not an integer at the parser level (many JSON parsers coerce `10000.0` silently), so the rule cannot be bypassed by formatting.
- **`sequence_number: bigint` "gapless."** Gaplessness under concurrent writers is a hard problem. If several workers append events, guaranteeing no gaps requires a single serialization point (one writer, or a database sequence with transactional guarantees; note that database sequences are commonly *not* gapless if a transaction rolls back). Decide whether you need gapless or merely monotonic and unique. For replay determinism, monotonic and unique is enough, and it is far easier to guarantee. Requiring gapless without a mechanism is a promise the system may not keep.

---

# Part 4: Additions I think are worthwhile

## 4.1 A single "spec-as-tests" generator

The document's opening paragraph says claims must be derived, not asserted. Take that literally: **generate the probability table, the frame-budget examples, and every quoted figure from code, and embed the outputs into the documentation at build time.** Then the doc cannot drift from the math. This addresses the class of error that already cost you one wrong figure. A small script that enumerates 1,296 pairs and emits the table into the markdown is a few dozen lines, and it makes the numbers unforgeable.

## 4.2 Property-based tests for the fold

Assertion 4 tests one replay against one snapshot. That proves the implementation is correct for one history. Stronger: generate many random valid event sequences and assert **fold determinism and order-sensitivity properties**, for example that replaying the same sequence twice gives identical state, and that partial replays plus the remaining events equal a full replay (the fold is associative over concatenation of prefixes: `fold(fold(s0, e[0..k]), e[k+1..n]) == fold(s0, e[0..n])`). Property-based testing finds the corner cases that a single fixture never will.

## 4.3 A canonical action vocabulary, defined once

The dual-field verification depends on comparing "actions" from two sources and intersecting with "banned verbs." That works only if both sides map into a **single closed vocabulary**. The spec gestures at this (GBNF enums), but the mapping from free prose to that vocabulary is the fragile step. Define the vocabulary as a versioned artifact in canon, with synonym sets, and treat changes to it like any other canon revision. Otherwise the gate's precision depends on an unversioned, implicit mapping that will drift silently.

## 4.4 Record nondeterministic model outputs as events

I raised this earlier and the spec did not absorb it, so I'll be more direct. The independent extraction pass runs at temperature 0.0, but that does not guarantee reproducible output. Any nondeterministic step must have its **output recorded in the ledger as an event**, so that replay uses the recorded result instead of calling the model again. This is the standard event-sourcing technique for side effects: log the result, don't repeat the effect. Without it, Assertion 1 (byte-identical replay) will pass on a lucky day and fail otherwise, and you will chase phantom bugs. The same principle applies to TTS duration measurements: the measured millisecond values feed the frame budget, so they must be recorded, not remeasured.

## 4.5 A small failure-mode table for the human gates

The spec has several "human in the loop" points (ratification, harvest review, 40% closure, pardon authorization). Each is a place where the pipeline stalls waiting for one person. Specify for each: what happens while waiting (does work halt or continue speculatively?), what happens on timeout, and what happens on rejection (rollback scope). Human gates are where automated pipelines usually rot: stalled queues, ambiguous rejection semantics. A few lines per gate now prevents a lot of confusion later.

---

# Part 5: Priority summary

**Verified and worth keeping as written:**
1. The full 2d6 table and the 52.16% and 76.08% figures.
2. The media-asymmetry principle and its two durability classes.
3. Two-phase tick commit.
4. The scoped, non-standing pardon design with hard invariants unpardonable.
5. Dual-anchor (canon plus compiler) pinning.
6. Cumulative-millisecond quantization, which provably tiles the timeline.

**Fix before building:**
1. Replace `arms_available = 1.0` and `subjective_probability` floats with integers, consistent with the spec's own rule.
2. Reconcile `expires_at_cycle` with the scene-scoped waiver.
3. Narrow the omission test's regex to the specific omitted proposition.
4. Decide truncation versus rounding deliberately, and specify integer width.
5. Clarify whether modifier clamps apply per source or in total.
6. Resolve "gapless" versus "monotonic and unique."

**Add:**
1. Generated (not hand-typed) probability tables and frame examples.
2. Property-based fold tests.
3. A versioned canonical action vocabulary.
4. Ledger recording of every nondeterministic model or measurement output.
5. Explicit rules for the human gates.

---

# Closing observation

This revision is the strongest of the three. The math is now correct and self-verified, the pardon design is coherent, and the media asymmetry is stated honestly. What remains are mostly *seams*: places where two correct rules meet and don't quite fit (floats in a no-floats spec, a scope that duplicates an expiry, a "gapless" promise with no mechanism). Those are the hardest bugs to find by reading and the easiest to find by executing. That is the argument for the tracer bullet, and the argument for generating the spec's own numbers: **a specification is trustworthy in proportion to how much of it a machine has checked.** The next real progress is not more design; it is running the five assertions and letting them break.This revision is mostly my last reply, reorganized and extended, so the useful work is checking it for errors and pushing the design where it still stops short. I found one arithmetic error, two claims that are stated more cleanly than the mechanism supports, and several places where the document names a problem without solving it. I've also checked the numbers myself rather than trusting the pasted text or my previous reply.

One limit: I only have the pasted text. The document cites the original `goblin-lore` file as supporting its architecture. I can't confirm those citations, so I treat them as the pasted author's description of the source.

---

# Part 1: Verified and corrected mathematics

## 1.1 What checks out

I re-enumerated all 1,296 ordered pairs of two 2d6 rolls. The absolute-margin table is correct: counts 146, 280, 250, 208, 160, 112, 70, 40, 20, 8, 2 sum to 1,296. The one-sided counts are 146 (d=0) then 140, 125, 104, 80, 56, 35, 20, 10, 4, 1, and 146 + 2(575) = 1,296. ✓

Derived values I confirmed:

| Quantity | Value |
|---|---|
| P(\|D\| ≤ 2) | 676/1296 = 52.16% |
| P(D ≥ 1), strict win | 575/1296 = 44.37% |
| P(D ≥ 0), win or tie | 721/1296 = 55.63% |
| P(D ≥ −2) | 986/1296 = 76.08% |
| P(D ≥ 4), one named actor | 206/1296 = 15.90% |
| P(\|D\| ≥ 4), either actor | 412/1296 = 31.79% |

The document's central point about baselines is right: with ties possible, a strict win is 44.37%, not 50%. Stating the win predicate as `D + M ≥ 1` and deriving everything from it is the correct discipline.

## 1.2 The modifier table: verify it, then look at what it implies

I recomputed each row of the win-probability table under `D + M ≥ 1`, i.e. P(D ≥ 1 − M):

| Effective M | Count (D ≥ 1−M) | Probability |
|---|---|---|
| 0 | 575 | 44.37% |
| +1 | 721 | 55.63% |
| +2 | 861 | 66.44% |
| +3 | 986 | 76.08% |
| +4 | 1090 | 84.10% |
| +5 | 1170 | 90.28% |
| +6 | 1226 | 94.60% |

All match the document. The step sizes are worth noticing: +1 adds 11.27 points, +2 adds 10.81, +3 adds 9.64, +4 adds 8.02, +5 adds 6.18, +6 adds 4.32. **Each additional modifier point is worth less than the last**, from about 11 points down to about 4. The document treats leverage as roughly "11 points per unit near the center," which is true only near the center. A design consequence the document doesn't draw: **the clamp matters most in the range where modifiers are cheapest to stack**. At a cap of ±2 you are staying entirely in the steep part of the curve (roughly 22 points of total swing), where each point is most impactful. Raising the cap to ±4 adds another ~17 points but with diminishing returns. That gives you a principled way to choose the cap: pick the largest swing you are willing to let a modifier stack produce, then read the cap from the table instead of guessing.

## 1.3 The fixed-target leverage numbers

The document lists P(2d6 = k) for k = 7 to 12 as 16.67%, 13.89%, 11.11%, 8.33%, 5.56%, 2.78%. These are 6/36, 5/36, 4/36, 3/36, 2/36, 1/36. ✓ The stated conclusion, that "modifier sensitivity is a function of the operating point," is correct and is the right replacement for the earlier overstatement.

To make that actionable, compare the two mechanics at matched operating points. A fixed target of 8+ (win probability 41.67%) is roughly comparable to an opposed strict-win baseline of 44.37%. At that point the fixed-target step is 16.67 points (the 7→8 crossing) versus about 11 points for opposed. So at *comparable win rates*, fixed-target checks are about 1.5× as sensitive. That is the version of the earlier claim that survives scrutiny, and it is narrower than the original: it holds where the two mechanics have similar baseline success, not universally.

## 1.4 The document's cumulative-frame result and the missing caveat

The document restates that consecutive lines tile with no gaps, because EndFrame_k + 1 = StartFrame_{k+1}. That is correct. One thing it never states, and should: this formula produces a **zero-length or negative range whenever a line is shorter than one frame** (about 41.7 ms at 24 fps). With Start = ⌈a⌉ and End = ⌈b⌉ − 1, if ⌈a⌉ = ⌈b⌉ then End = Start − 1, an empty interval. Short interjections and clipped syllables can hit this. Define the policy (enforce a minimum one-frame duration, merge with a neighbor, or allow empty spans and skip them) so the exposure sheet code doesn't discover this at render time.

---

# Part 2: Where the document is right and adds real value

## 2.1 Replay, re-simulation, re-render as three distinct operations

This is the strongest conceptual contribution, and the formal signatures are useful:

- Replay(H) → S reconstructs historical state from recorded events.
- Simulate(S₀, σ, θ) → H′ produces a new history under a seed and rule configuration.
- Render(H, ρ) → A projects an established history into an artifact.

The corollary in the document is important: **a re-render must be able to consume recorded intermediate artifacts** (approved dialogue, recorded audio, measured duration) so that it varies only the stage you intend. If a "re-render" silently re-invokes TTS, you get new durations, new frame budgets, and a different scene, which is a partial re-simulation mislabeled as a re-render.

## 2.2 The three-way epistemic split (truth, belief, utterance)

The document proposes WorldTruth ≠ Belief ≠ Utterance and adds speech-act classification (ASSERT, GUESS, DENY, LIE, QUESTION, SPECULATE, WITHHOLD). This resolves the objection I raised previously, that a hard rule against a character "saying anything corresponding to an unknown fact" would forbid lucky guesses, false accusations, and bluffs. It's a better model than the earlier one.

Two problems remain, and the document acknowledges neither.

**Problem one: speech-act classification is itself a fallible model output.** Deciding whether "I know what happened" is an ASSERT versus a bluff requires understanding context and intent, so it is a probabilistic classification, not a compile-time check. If the *generator* self-labels its speech acts, you are back to trusting self-reported metadata, which is the exact weakness the dual-field design was created to avoid. The classification should be **assigned in the scene plan, before generation** (the plan says "Bog bluffs here"), and the linter then checks the prose against the assigned act, not the other way around. That moves the authoritative decision from the model to the plan, which is where this architecture puts authority everywhere else.

**Problem two: the belief record needs a truth-valued comparison, and the document doesn't define one.** To say "Bog's belief diverges from truth," the system must compare a `BeliefRecord.proposition_slug` with a world fact. That requires propositions to be canonicalized (same proposition, same identifier, regardless of phrasing) and comparable. Propositional equivalence is a hard problem in general. Scope it: restrict propositions to a **closed, enumerated set of fact identifiers** authored in canon, so "does Bog's belief match truth" is a lookup and not a semantic judgment. Free-form beliefs then live in a separate, non-checked layer. Without this restriction, the belief model cannot be enforced mechanically.

## 2.3 "Prevention versus detection" as a sorting rule

The document's closing rule (for every guarantee, ask whether it is enforced by construction or by a fallible detector) is the best practical tool in the whole text. Apply it as a table in the spec itself. Here is what I would classify:

| Guarantee | Mechanism | Prevention or detection |
|---|---|---|
| No banned action in the action field | Grammar-constrained decoding | **Prevention** (invalid tokens are unreachable) |
| No banned action in prose | Lemma scan + extraction pass | **Detection** (nonzero miss rate) |
| Fact absent from prompt | Context assembly | **Prevention** (of direct injection only) |
| Fact not inferred from context | Leak evaluation | **Detection** (statistical) |
| Same state from same events | Pure fold | **Prevention** (by construction, if `apply` is pure) |
| Valid contest outcomes | Total `apply` | **Prevention** |
| Hard invariants respected | Pre-flight arithmetic | **Prevention** for checked properties |
| Voice consistency | Soft scoring | **Detection** |

Note the asymmetry: some entries are both. Fact omission *prevents* direct leakage but only *detects* inferential leakage. Writing each guarantee into one of these two columns tells you where your residual risk lives.

## 2.4 Void outcomes and totality

The document promotes "non-resolution is an outcome" to a law. I agree, and there's a testable formulation: **`apply` is total over the set of all legal (state, event) pairs**, meaning it returns either a valid next state or an explicit void or rejection result, never an unhandled exception. A property-based test can generate random valid states and events and assert that `apply` never throws. This is one of the cheapest and highest-value tests in the suite, and it catches the case where a precondition vanishes between proposal and commit.

---

# Part 3: Problems, overstatements, and inconsistencies

## 3.1 The hash-chain section conflates two things

The document proposes a linear hash chain, then notes that branching histories need a DAG with a `parents` list. Two issues.

**The branching case may not arise in the authoritative log.** The design already has a single serialized ledger, with a two-phase commit that resolves contested actions into one atomic tick. Branching histories appear in *speculative* work (a re-simulation exploring alternatives) or with multiple simultaneous writers. The authoritative canonical history should be linear by construction; the document should say so and treat branches as separate, explicitly non-authoritative logs (each with its own chain, and a `forked_from` pointer to the authoritative event they diverged at). Introducing a general Merkle DAG for the primary log adds complexity and a merge problem (how are two branches reconciled?) that the architecture does not otherwise need. Keep the main log a chain; put branches in a separate namespace.

**The hash must cover the right bytes.** "The head commits to every ancestor" is true only if each event's hash covers its *canonical serialization* including `prev_hash`, under the same fixed-point, NFC, sorted-key rules the document already established. State that explicitly, because a hash chain over non-canonical serialization inherits all the nondeterminism problems the canonicalization rules exist to prevent.

## 3.5 "Round-half-even" on a fixed-point scale needs a tie rule check

The document adopts `Scale(A,B) = RoundEven(AB/10000)`. That is a reasonable choice, and I recommended it. One implementation detail matters: a tie occurs exactly when AB mod 10000 = 5000. Round-half-even must be implemented with integer arithmetic (compare the remainder to 5000 and inspect the parity of the quotient), not with floating-point division followed by a rounding function, because floating-point division would reintroduce the exact platform variance the fixed-point scheme was built to remove. Add a test over a range of (A, B) pairs that asserts the integer implementation matches a reference computed with exact rational arithmetic (for example, Python's `fractions` module).

## 3.6 "Test mechanisms, not symptoms" has a limit

The document praises asserting `modelClient.callCount === 0` over checking a cost field. That is right for the pre-flight path. But a call-count mock only proves that *this code path* made no calls through *that client object*. If any code constructs a second client, or makes a network request directly, the counter stays at zero. A stronger version blocks the mechanism itself: in the test environment, **disable outbound network and provide no model credentials**, so any attempted call fails loudly rather than being counted. Use both: the mock proves the intended interface wasn't called, and the network block proves nothing else was.

## 3.7 The five-question closing framework is neat but slightly redundant

The document ends with five questions (what may be true, what is true, what happened, what does a character believe, what artifact represents it). These are good, but "what is true" and "what happened" are not independent: current truth is the fold of history over canon, as the document itself insists. Presenting them as five separate layers obscures that *materialized state is derived*. A tighter framing has **four primitive things and one derived one**: canon, events, beliefs, and artifacts are primitive (each has its own authoritative source), and current state is derived from canon plus events. This matters because it tells you what to back up (the four primitives) and what to rebuild (the derived one), which is the point of the deletion principle.

---

# Part 4: Additions

## 4.1 A test for the deletion principle that includes external recordings

Assertion 4 (purge materialized state, replay, compare) is good but has a hole given the new replay rules. If replay depends on recorded model outputs and TTS results, those recordings are part of the *irreplaceable* set, not the derivable one. Add the corollary test: **delete the recorded external results and confirm that replay fails loudly** (with a specific error naming the missing operation IDs) rather than silently re-invoking the model. This verifies that no code path falls back to re-execution, which is the exact failure the replay/re-execution distinction exists to prevent.

## 4.2 Classify each stored artifact by reconstructibility, in one place

The document repeatedly distinguishes derivable from non-derivable assets. Make this a single manifest with one row per artifact class:

| Artifact class | Source of truth? | Rebuildable from | Backup policy |
|---|---|---|---|
| Canon files | Yes | (nothing) | Version control + offsite |
| Event log | Yes | (nothing) | Append-only, replicated, hash-verified |
| Recorded model/TTS results | Yes | (nothing) | Same as event log |
| Materialized state | No | Canon + events | None needed (rebuild) |
| Dependency graph, indexes | No | Canon + events | None needed |
| Approved renders and audio | Yes (as evidence) | (nothing) | Content-addressed store, periodic re-hash |
| Unapproved drafts and caches | No | Re-run | None |

The recorded model and TTS results are the easy one to forget. They are outputs of the world's *history*, cannot be regenerated identically, and sit in an unglamorous category that tends to get no backup at all.

## 4.3 Bound the identity-keyed seed scheme against collisions and drift

I endorsed identity-addressed randomness. Two additions. First, **derive with domain separation** (a distinct label per subsystem, so the conflict seed for resource R never equals the render seed for shot R even if identifiers coincide). Second, treat the **derivation scheme as a versioned artifact**: if you ever change the KDF, label encoding, or the identifier set, every downstream draw changes. Record a `seed_scheme_version` in the same manifest that pins canon and compiler, so historical episodes can be re-simulated under the scheme they were made with.

## 4.4 Define what "regeneration" outputs are compared to

A re-render is allowed to differ at the pixel level, but the document never says what *should* stay constant. Specify **invariants that a re-render must preserve** (frame count, shot boundaries, audio track hash, cast present, scene state hash) and **properties allowed to vary** (pixel content, minor texture, lighting noise). Then a re-render check is a defined comparison over the preserved set, not a subjective "looks right." Without that, "re-render" has no acceptance criterion.

## 4.5 Bootstrap risk: the spec has no failure budget

Every mechanism above is designed to halt hard on violation. That is right for correctness, but a system that halts on every soft ambiguity may never produce a finished episode. Specify a **rejection-rate expectation and retry policy**: how many generation attempts before escalating to a human, what evidence is logged per rejection, and how you measure whether the linter's false-positive rate is making the pipeline unusable. A strict verification pipeline needs an operational metric for its own health, or it fails by starvation. The document's health/telemetry concept fits here; apply it to the pipeline itself, not just the story corpus.

---

# Part 5: Summary

**Keep, verified:**
1. The 2d6 table, the 44.37% strict-win baseline, and the modifier table (all recomputed).
2. Replay versus re-simulate versus re-render, with the re-render consuming recorded intermediates.
3. Truth ≠ belief ≠ utterance, with speech acts assigned in the plan.
4. Identity-keyed, domain-separated, versioned randomness.
5. Waivers and human decisions as events; migration as the one permitted exception to the single-boundary rule.
6. The prevention-versus-detection sorting rule, applied as a table.
7. Totality of `apply`, with an explicit void outcome.
8. Cumulative-ms frame quantization (with the minimum-duration caveat).

**Fix:**
1. Restrict beliefs to a closed enumerated proposition set so truth-versus-belief is a lookup.
2. Keep the authoritative log linear; put branches in a separate namespace.
3. Implement round-half-even with integer arithmetic and test it against exact rationals.
4. Define the policy for sub-frame audio lines.
5. Reframe the five-question model as four primitives plus one derived state.

**Add:**
1. A recorded-results deletion test that must fail loudly.
2. A reconstructibility manifest covering recorded external results.
3. A versioned seed-derivation scheme.
4. Explicit preserved-versus-variable properties for re-renders.
5. Pipeline health metrics and a rejection-rate policy.
6. Network-blocked test environment alongside mock call counters.

---

# Closing observation

The document's stated goal is language no stronger than its mechanisms, and this revision mostly achieves it. The remaining overstatements are of a specific kind: a mechanism is described as if it applied to the general case when it only works for a restricted one (belief comparison, speech-act labeling, a hash DAG for a log that is linear by design). In each case the fix is the same move, **narrow the domain until the mechanism is actually sound**, closed proposition sets instead of free semantics, plan-assigned labels instead of model-assigned ones, a single-writer chain instead of a general graph. Restricting scope until a guarantee is mechanical is what turns an assertion into a property. The remaining risk is no longer conceptual; it is operational: whether the pipeline can run, reject, retry, and recover often enough to finish an episode. That question cannot be answered on paper, which is another argument for building the staged tracer bullet next.This revision folds in nearly everything from my last review, which means the remaining defects are now mostly in the new code and formulas rather than in the ideas. I recomputed every figure and read every code block for correctness. I found one real bug in the round-half-even code, one arithmetic error in the modifier-clamp rationale, and several places where the document claims more than its mechanism delivers.

I have only the pasted text, not the original spec.

---

# Part 1: Verified numbers

## 1.1 What checks out

I re-enumerated all 1,296 ordered pairs. The distribution table is correct. One-sided counts are 146 (d=0), then 140, 125, 104, 80, 56, 35, 20, 10, 4, 1, and 146 + 2(575) = 1,296. ✓ The cumulative |D| ≥ d column is also right, for example |D| ≥ 4 is (160+112+70+40+20+8+2)/1296 = 412/1296 = 31.79%.

The modifier table matches my recomputation row for row (575, 721, 861, 986, 1090, 1170, 1226 out of 1296), and the marginal gains (11.27, 10.80, 9.64, 8.02, 6.18, 4.32) are exactly the one-sided counts divided by 1296: 146, 140, 125, 104, 80, 56. The gain from M to M+1 equals the mass of the newly admitted margin, which is a clean structural fact worth stating: **the marginal gain of each modifier point is the probability of exactly one margin value.**

The fixed-target comparison is right: 8+ gives 15/36 = 41.67%, 7+ gives 21/36 = 58.33%, a 16.67-point step.

## 1.2 An arithmetic error in the clamp rationale

The document says capping total modifiers to [−2, +2] "bounds the total potential swing to 44.14 percentage points (22.27% to 66.44%)." Check it against the modifier table:

- At M = −2, strict win requires D ≥ 3, so P = (104+80+56+35+20+10+4+1)/1296 = 310/1296 = **23.92%**, not 22.27%.
- At M = +2, P = 861/1296 = **66.44%** ✓.

So the swing is 66.44 − 23.92 = **42.52 points**, not 44.14. The 22.27% figure does not correspond to anything I can derive. My guess is that it comes from subtracting the +1 step from the baseline (44.37 − 22.10) or from a slip in symmetric reasoning, but I can't confirm that. The upshot is small, but it is another example of a correct table beside a hand-typed derived number that is wrong. Note also that the asymmetry between the two endpoints is expected and worth stating: the modifier table under a strict-win predicate is not symmetric around 50%, because ties always go against the actor. A −2 modifier drops the actor to 23.92%, while a +2 raises them to 66.44%, which are *not* mirror images (44.37 ± 21.5 would be symmetric). Generate this row from code.

## 1.3 The "1.5× more sensitive" claim, refined

The document says fixed-target checks are about 1.5× as sensitive at comparable baselines, using 16.67% vs 11.27%. That comparison mixes two different things: the fixed-target figure is a one-way step from 41.67% up to 58.33%, while 11.27% is the step from M=0 to M=+1 in the opposed table (44.37% → 55.63%). Those two steps are computed at the *same modifier* (+1), so the comparison is valid as stated. Good. But note the fixed-target step crosses a **peak-mass total** (7 is the most likely 2d6 result), which is where fixed-target leverage is largest. At target 9+ versus 10+ (27.78% → 16.67%) the step is only 11.11 points, roughly equal to the opposed figure. So "1.5×" holds only for targets 7 to 8. The document's earlier principle, that sensitivity depends on the operating point, is the accurate statement, and the 1.5× figure is one instance of it. Keep the principle and quote the number only with its operating point attached.

---

# Part 2: The round-half-even code has a bug

This is the most concrete defect in the document, so I'll work through it carefully.

```typescript
export function scaleBasisPoints(a: bigint, b: bigint): bigint {
  const product = a * b;
  const quotient = product / 10000n;
  const remainder = product % 10000n;
  if (remainder > 5000n) return quotient + 1n;
  else if (remainder < 5000n) return quotient;
  else return (quotient % 2n === 1n || quotient % 2n === -1n) ? quotient + 1n : quotient;
}
```

**For non-negative inputs this is correct.** For `a, b ≥ 0`, product ≥ 0, quotient ≥ 0, remainder in [0, 9999], and the three-way comparison implements round-half-even properly. When the remainder is exactly 5000, an odd quotient rounds up to the next (even) integer and an even quotient stays. ✓

**For negative inputs it is wrong.** BigInt division truncates toward zero, and `%` takes the sign of the dividend. So for a negative product, the remainder is in [−9999, 0]. Then `remainder > 5000n` is never true and `remainder < 5000n` is always true, so the function always returns the **truncated quotient** and never rounds away from zero. For example, `a = −7000n, b = 7500n` gives product = −52,500,000, quotient = −5250, remainder = 0; that case is fine, but `a = −1n, b = 7500n` gives product = −7500, quotient = 0, remainder = −7500, and the function returns 0 while correct rounding would give −1 (since −0.75 rounds to −1).

Whether this matters depends on whether signed basis-point values exist. The document says severities and probabilities are in [0, 10000], so all values are non-negative. But **modifiers are signed** (the clamp is [−2, +2]), and anything that ever scales a signed quantity hits this bug. Two responses are reasonable:

1. Declare `scaleBasisPoints` non-negative-only and add a guard that throws on negative input, which makes the domain explicit.
2. Implement the signed version correctly by working on absolute values and reapplying the sign.

I'd choose option 1 plus a separate signed function if one is ever needed, because a function that silently mis-rounds negatives is worse than one that refuses them. Then test it: enumerate a grid of (a, b) in [0, 10000] and compare against an exact rational reference. The document's own tracer-bullet philosophy demands this test, and its absence is why the bug is not visible in the document.

A second, smaller point: the `-1n` branch of the parity check is dead code for non-negative inputs, and it hints that the author was thinking about negatives without handling them fully. Remove it or handle negatives properly.

---

# Part 3: Other errors and overstatements

## 3.1 The belief-versus-truth lookup is mis-specified

The document says divergence is checked by: does `current_state.facts.get(belief.proposition_slug).status === true` match `belief.subjective_confidence > 5000n`?

This has two problems.

**It treats truth as boolean.** The earlier epistemic discussion distinguished known-true, known-false, unknown, disputed, and unresolved-by-canon. A fact whose canonical status is *unresolved* has no `true` or `false`; a `status === true` check on it is either an error or silently treats "unresolved" as false. The comparison needs a three-valued (or wider) truth domain, and the mismatch rule must say what happens for unresolved facts. Specifically, **a belief about an unresolved-by-canon fact can never be classified as "correct" or "incorrect,"** and the system must not manufacture that classification.

**The 5000 threshold is a policy choice presented as a mechanism.** "Confidence above 50% counts as believing" is a defensible convention, but it is a chosen number and belongs in versioned configuration with a rationale, exactly as the document's own "derived versus chosen numbers" law requires. It also conflicts with the speech-act definitions elsewhere, which use 8000 as the threshold for `ASSERT`. Two different thresholds (5000 for belief, 8000 for assertion) need to be explained or unified; as written they look accidental.

## 3.2 The speech-act definitions overlap

The `SpeechActAssignment` definitions have a subtle problem. `BLUFF` is "speaker believes NOT(P) or is ignorant, but asserts P." Consider `ASSERT`, "speaker believes P with confidence > 8000." What about a speaker who believes P at confidence 6000 and states it flatly? Neither definition covers them. And a speaker who is ignorant (no belief record) but asserts P is a `BLUFF` by definition, but the same utterance from a speaker who *happens* to hold a low-confidence true belief is neither. The taxonomy has a gap between "confident enough to ASSERT" and "believes the opposite or is ignorant." Options: add a `HEDGE` act for asserting with moderate confidence, or define `ASSERT` for any confidence above the belief threshold and use a separate modifier for certainty. Also, `BLUFF` conflates *lying about a belief the speaker holds* (believes P, claims NOT P) with *bluffing about ignorance*. `DENY` covers rejecting P but doesn't say whether the denial is sincere. A cleaner split is **sincerity** (does the utterance match the speaker's belief?) crossed with **content** (asserts, denies, questions, withholds, deflects). That gives you an orthogonal pair rather than an overlapping list, and it makes the linter's check mechanical: compute the speaker's belief on the proposition, compute the utterance's polarity toward it, and compare.

## 3.3 The "$0.00" and "SAT solver" language

The prevention matrix labels the pre-flight check a "SAT solver" and marks its residual risk "zero for declared fields." Two problems:

- Checking `R_hands ≤ A_hands` is integer comparison, not SAT. The label is harmless now, but if it later means a generic solver for interacting constraints, the "zero risk" claim no longer holds (constraint solving can be expensive or incomplete). Keep the claim scoped to what is implemented.
- "Zero risk" appears in several rows, and that phrase is stronger than any real system supports. "Zero risk" of what? A grammar-constrained decoder guarantees the action field contains only enum values; it does not guarantee those values are *correct* for the scene. Rephrase to "guaranteed by construction for property X" and name X, so the classification says what it actually establishes.

Also, Assertion 2 in the test suite still uses `arms_available: 1.0`, a float, in a document that bans floats in serialized state. This was flagged two rounds ago and remains. It also still asserts `tokenCostUsd` equals 0, and the document elsewhere (correctly) says to test call counts and network isolation instead. The test code does not reflect the document's own conclusions.

## 3.4 The false-positive-rate formula measures the wrong thing

The telemetry defines FalsePositiveRate as ManualOverrides / TotalInvocations. That is the rate at which a human overrides a rule's rejection, which is a useful *proxy*, but it is not a false-positive rate. Two distortions:

- **Denominator.** A false-positive rate is false positives over all *actual negatives*. TotalInvocations includes true positives and true negatives. The quantity defined is better called an **override rate** (or precision-related metric), and it should be computed over *rejections*, not invocations: overrides divided by rejections tells you what fraction of the rule's rejections a human disagreed with. Dividing by all invocations dilutes the signal, so a rule that rejects 10% of scenes and is wrong every time would show a "false positive rate" of 10%, not 100%.
- **Bias.** Humans override selectively and fatigue leads to rubber-stamping, so the override rate is biased low when reviewers are overloaded. It cannot detect a rule that rejects correctly *and* one that a tired reviewer stopped questioning.

The 5% threshold is again a policy number needing a rationale. Use: **override rate per rule = overrides / rejections**, tracked together with rejection volume.

## 3.5 The linear-log design is right, but the promotion path needs a rule

The document keeps the authoritative log linear and moves speculative branches to separate namespaces, promoted by "appending its events sequentially onto the end of the linear log." That has a hidden problem: **a speculative branch was simulated against state at the fork point, but the authoritative log may have advanced since.** Appending the branch's events blindly means they apply to a different state than the one they were generated under, so they may be invalid or produce different outcomes. Define the rule: promotion is allowed only if `forked_from_event_hash` equals the current head (a fast-forward), otherwise the branch must be **re-simulated or revalidated** against the current head. This is the same rule Git uses for fast-forward versus merge, and stating it prevents silent state corruption during promotion.

## 3.6 Hash-chain formula: a subtle ambiguity

`H_k = SHA256(H_{k−1} ∥ SerializeCanonical(E_k))` is fine if `SerializeCanonical` output is length-delimited or the concatenation is otherwise unambiguous. With fixed-length H_{k−1} (32 bytes) as a prefix, the concatenation is unambiguous, so this specific formula is sound. State that the hash width is fixed; it's a small point, but it's the property that makes the plain `∥` safe here, and it is the same property that is *not* safe in the seed derivation formula (see below).

## 3.7 The seed derivation formula has the ambiguity it was meant to avoid

`Seed = HMAC-SHA256(MasterSeed, DomainPrefix ∥ EntityID ∥ SeedSchemeVersion)` concatenates three variable-length strings. If `DomainPrefix` and `EntityID` can contain arbitrary characters, distinct tuples can produce the same concatenation. For example, prefix `"domain:sim:duel"` with ID `"12"` and prefix `"domain:sim:duel1"` with ID `"2"` both give `"domain:sim:duel12"`. I recommended length-prefixing or fixed encoding earlier, and the document mentions domain separation but writes the formula with plain concatenation. Fix it by encoding each component with a length prefix, or by using a delimiter that cannot appear in identifiers and enforcing that in the ID schema. The contrast with 3.6 is instructive: the hash chain is safe because one component is fixed-width; this one is not.

---

# Part 4: Claims that are well supported

## 4.1 The five-part structure (four primitives plus one derived) is correct

Listing canon, event log, recorded intermediates, and media artifacts as sources of truth, with materialized state as derived, is the right corrected framing, and the reconstructibility manifest is a genuinely useful operational tool. Two refinements:

- The manifest lists "Unapproved Drafts / Infill Caches" with a "7-day TTL." A time-based purge conflicts with the recorded-results rule if a draft's model output was recorded as an event, because purging a recorded result the log depends on would break replay. The distinction to make is between **a draft artifact** (safe to purge) and **a recorded intermediate that an event references** (must be retained as long as the event is). Attach a reference check to the purge job: a blob referenced by any event is never expired.
- "WORM" storage combined with "purged upon terminal task state" is contradictory for the same items; they belong in different rows, which the table effectively does, but state it.

## 4.2 The re-render invariance contract is the right shape

The preserved/variable split turns "re-render" into a checkable comparison. One addition: the "test passes if and only if all preserved invariants match while the output hash diverges" condition has a flaw. **Requiring the render hash to differ is a bad acceptance criterion**: a render that happens to be bit-identical (which is entirely possible if the renderer is in fact deterministic on that machine) would fail the test despite being perfectly correct. The requirement should be that preserved invariants match; whether the hash changes is *informative, not required*. The same applies to Assertion 3, which asserts `renderPlateHash` *not* equal across runs with different noise. That is a sensible check that the noise parameter is wired up, but it should be phrased as testing that **the noise input reaches the renderer** and not as an expectation that outputs differ in general.

## 4.3 Failure budgets are a valuable addition

The bounded retry, circuit breaker, and escalation design addresses the starvation risk I raised. Add one thing: **retry attempts must be recorded as events with their failure reasons and their outputs**, consistent with the recorded-results rule, otherwise the retry history is lost and you can't compute the telemetry that the document proposes, or explain later why a scene took three attempts. Also, "feeds the violation back as a negative constraint" changes the model input on each retry, so the accepted attempt's *input* differs from the first attempt's input; the ledger must record which attempt's result was accepted and under what input, or replay cannot reproduce the accepted result's provenance.

## 4.4 Sub-frame policy is solved, with one loose end

The minimum-span rule (pad to 42 ms, or merge into the next line) fixes the empty-interval problem. Padding to 42 ms changes the recorded duration, which feeds every downstream cumulative sum, so **the padded duration, not the measured one, must be the value recorded and used**, with the original measurement preserved alongside. Otherwise the audio waveform and the frame budget disagree by up to 42 ms, and that's exactly the drift the cumulative scheme was built to avoid. Also 42 ms rounds up from 41.67 ms (one frame at 24 fps), which is fine, but if frame rate becomes a rational as previously recommended, the minimum should be computed as ⌈1000·q/p⌉ ms and not hard-coded.

---

# Part 5: Additions

## 5.1 A machine-checked document

The document opens with "Verified Quantitative Foundations," but the numbers are still typed by hand, and this pass found a wrong hand-typed number (22.27%). Close the loop: **generate Section 1 from code and fail the build if the committed markdown differs from the generated output.** That single CI step would have caught the error, and it turns "verified" from a label into a property.

## 5.2 A signed and unsigned integer policy

The `bigint` scale function, the signed modifier clamp, and the non-negative basis-point ranges together need one stated policy: **which quantities are signed, which are unsigned, what their ranges are, and which functions accept which.** The rounding bug above is a direct consequence of this being unstated.

## 5.3 Separate "the rule fired" from "the rule was right"

The linter architecture logs rejections but not their *correctness*. Build a small labeled evaluation set of scenes where the right verdict is known, and track precision and recall per rule over time. Override rates alone can't distinguish "the rule is too aggressive" from "reviewers are lenient." Labeled data is the only thing that can.

## 5.4 Specify what "hash equality" means for tests that compare ASTs

Assertions 1 and 3 compare `dialogueAstHash` across runs. That is meaningful only if the AST serialization is canonical (sorted keys, no timestamps, stable ordering), and the tests should state which canonicalization they use. Otherwise a test can pass or fail because of serialization noise unrelated to the narrative. Reuse the exact canonicalizer from the event log, and test that canonicalizer on its own first, with adversarial inputs (different key order, equivalent Unicode forms, `10000` versus `10000.0`).

---

# Part 6: Summary

**Verified and worth keeping:**
1. The 2d6 table, cumulative column, strict-win predicate, and the full modifier table.
2. The marginal-gain identity: each step equals the mass of one margin value.
3. Replay, simulate, render as distinct operations with recorded intermediates.
4. The four-primitives-plus-derived-state framing and the reconstructibility manifest.
5. The linear authoritative log with namespaced speculative branches.
6. Failure budgets with bounded retries and circuit breakers.
7. The prevention-versus-detection classification.

**Fix:**
1. The clamp swing is 42.52 points (23.92% to 66.44%), not 44.14.
2. `scaleBasisPoints` mis-rounds negative inputs; restrict it to non-negative and add a guard and an exact-rational test.
3. Belief-versus-truth needs a wider truth domain and a reconciled threshold (5000 versus 8000).
4. Rework speech acts into sincerity crossed with content.
5. Replace "false positive rate" with an override rate over rejections.
6. Add a fast-forward rule for promoting speculative branches.
7. Length-prefix the seed-derivation inputs.
8. Remove "hash must differ" from the re-render acceptance criteria.
9. Update the test code to match the document's own conclusions: integer fields, call-count and network isolation rather than a cost field.

**Add:**
1. CI that regenerates the quantitative section and fails on drift.
2. A signed/unsigned integer policy.
3. Retention rules that never expire blobs referenced by events.
4. Recording padded and original audio durations.
5. Labeled evaluation data for the linters.
6. A tested canonicalizer, exercised before anything that depends on its output.

---

# Closing observation

The prose has converged. What each round now reveals is that **the residual errors have moved from ideas into artifacts**: a wrong derived number, a function with an unstated domain, a formula with an ambiguity, a metric with the wrong denominator, a test that doesn't reflect its own document's conclusions. That's the expected progression for a specification that is becoming real, and it points at the next step: **stop reviewing the prose and start executing the code.** Most of the defects above would surface within minutes of running a property test against `scaleBasisPoints`, generating the probability tables, or feeding the seed formula colliding identifiers. The specification has reached the point where the machine will find bugs faster than another round of reading.Thanks for uploading it. I've been working from secondhand summaries the whole time, so this is the first chance to check my earlier claims against the source. Let me start by reading it.I've now checked the source against my earlier claims. Several of them don't hold, and some of what I reviewed was never in the file.

## What the source confirms

- **The hash envelope critique was correct.** `corpusHash` covers only `sortedEntities`, while `schemaVersion` and `entityCount` sit outside it (lines 1914-1975). The hash identifies the entity payload, not the whole artifact.
- **The pass-count inconsistency is real.** Lines 86 and 94 say "Two-Pass Compiler," but line 5651 defines a three-pass sequence.
- **The stage-count inconsistency is real.** The source says "Five-Stage" at line 2601 but numbers Stages 0 through 5, which makes six.
- **The core architecture matches the summaries.** Read-only canon, a separate runtime ledger, dual-field verification, the three-color DFS, and the three somatic/logistical/epistemic vectors all appear as described.
- **The epistemic vector is thinner than I assumed.** It is just `known_secret_ids`, escalation ceilings, and `banned_attenuation_tokens` (line 658). There is no belief record, indexed Unknown, or speech-act model in the file.

## What I got wrong, or what was never in the file

**1. The 2d6 error is in the source.** Line 5944 says the "corrected" margins are 11.3% at 0, 21.6% at ±1, and 19.3% at ±2, with |margin| ≥ 6 at "roughly 15%." My enumeration of all 1,296 outcomes gives 11.27%, 21.60%, and 19.29%, so those three are right. The tail is wrong. **P(|D| ≥ 6) is 10.80%, not about 15%.** In my first reply I said the ≥ 6 figure "holds up," so I endorsed an error without checking it. The later pasted revisions had already corrected it to 10.80%, which is the right number.

**2. The float/fixed-point conflict is real in the source, not just in a summary.** The file uses `z.number().min(0.0).max(1.0)` for severity (line 585) and a hand-capacity formula with `2.0 - penalty` (line 690). The basis-points policy, `scaleBasisPoints`, and round-half-even code I reviewed later were **additions from the pasted revisions**, not part of the original. So the original spec is float-based, and the determinism hardening never made it into the compiler.

**3. Some of what I discussed isn't in the file at all.** I found no `BeliefRecord`, no speech-act taxonomy, no `Pardon Ledger` with scoped tokens, no two-phase tick commit, no upcasting envelopes, and no 5-assertion test harness. Those came from the pasted revisions. Some of my later critiques (the `scaleBasisPoints` negative-input bug, the seed-derivation ambiguity, the override-rate formula) apply to text that was never in your repo.

**4. The causal-graph handling is weaker than the summaries suggested.** The source declares the whole narrative graph acyclic and treats cycles as fatal (lines 1389-1480). It never separates the prerequisite graph from a cyclic runtime graph, and that separation was an addition of mine. This matters, because the spec as written would ban legitimate recurrence.

**5. My hand-capacity hedging was partly wrong.** I said the equation "looks overly technical" and later that checking `R ≤ A` is "not SAT." The source is more careful than that. It uses the linear inequality for slot capacity and, separately, boolean clauses for per-limb feasibility (`φ = left_arm = INTACT ∧ right_arm = INTACT ∧ ...`). That second piece is genuinely propositional, though at that size it's trivial to evaluate. The source also already recommends **per-limb tracking** over an integer hand count (line 5946), which resolves a concern I raised about `arms_available = 1.0`.

## What this means for the earlier reviews

The pasted revisions were extensions, and my checking of them was sound where it was arithmetic. Where I weighed in on "what the document says," I was reading the summary, and the summary had diverged from the file. Treat any of my earlier claims about the original repo with that in mind.

The real work that follows from the source:

1. **Fix the 2d6 note.** Change "roughly 15%" to 10.80% for |margin| ≥ 6.
2. **Decide whether to adopt fixed-point.** The original is float-based, and the strongest determinism argument (cross-platform serialization variance) is unaddressed in the code. If you keep floats, at least canonicalize their string form.
3. **Fold `schemaVersion` and `entityCount` into the hash.** This is a genuine, small fix at line 1936.
4. **Reconcile the pass and stage counts** in the prose.
5. **Split the causal graph** into prerequisites (acyclic) and runtime (cyclic), which the source currently conflates.

If you'd like, I can go further into the source than these spot checks: the state-vector schemas, the Pass 2 validation code, or the health-telemetry math, all of which I only skimmed here. I can also write the small generator that produces the 2d6 tables from code, which would have caught the ~15% error in the file.