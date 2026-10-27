# Branch • Goblin-Lore.Character

_Gemini · 24 messages · exported Oct 27, 2026_

### You

where should the .fountain format file be saved

### Gemini

In the Generative Production Pipeline, `.fountain` files represent the human-readable creative and review layer (Axis B / The Voice Rail). Depending on the current stage of the production lifecycle, the `.fountain` file belongs in specific directories and systems:

### 1. Active Authoring & Staging (Drafting Phase)

During active drafting and interactive writing, the `.fountain` file lives in:

- **The Simulation Working Directory:** Saved inside **`02.simulation/002.worker-sower/drafts/`** (or `worker-sower-conductor/drafts/` during active assembly cycles).
- **The Writer's Desk UI (Cluster `05.delivery`):** Managed via the editor interface in `src/pages/director/writer.astro` (or `apps/dashboard/src/components/director/FountainEditorIsland.tsx`), where drafts can be authored at $T = 0.75$ or edited via a local `$EDITOR` process.

### 2. Locked Master Episode Repositories (Post-Conformance)

Once an episode has been rendered, conformed, and verified against the typed Abstract Syntax Tree (`dialogue_ast.json`):

- **Committed Episode Branch:** The locked `.fountain` screenplay is committed directly to the episode repository branch inside **`05.delivery/goblin-episodes/`** (alongside its corresponding `dialogue_ast.json`, `state_delta.json`, and C2PA `render_manifest` sidecars).
- **Immutable Archival Storage:** Sealed with the active Merkle state hash ($H_{\text{root}}$) and toolchain commit SHAs into **3-2-1 WORM** (Write Once, Read Many) archival storage.

### 3. Knowledge Base Archival (Living Series Bible)

Once locked, the `.fountain` text closes the loop with the canon database:

- **NotebookLM Series Bible:** The Conductor formats the locked `.fountain` script into a markdown dossier and uses the Gemini API (`@google/genai`) to push it into the **NotebookLM Series Bible** workspace (under `[CONSTITUTIONAL]` or `[HISTORICAL]` tags, e.g., `CANON DELIVERABLE: EP01_SC01`).

### You

[The Simulation Working Directory: Saved inside 02.simulation/002.worker-sower/drafts/ (or worker-sower-conductor/drafts/ during active assembly cycles).] do you mean the [worker-sower-engine]

### Gemini

**Yes, exactly.** **`02.simulation/002.worker-sower`** is the cluster repository directory for **`worker-sower-engine`**.

Across the architecture and repository manifests, the designations connect as follows:

### 1. The Directory Alias: `002.worker-sower` is `worker-sower-engine`

In the studio's monorepo cluster convention (`02.simulation/`), repositories carry numerical prefixes:

- **`02.simulation/002.worker-sower/`** is the checked-out workspace on disk for **`worker-sower-engine`** (also formally designated as `camp-candor/002.worker-sower` and aliased as `series-sower-engine`).
- Its internal directory **`worker-sower-engine/drafts/`** (or `002.worker-sower/drafts/`) is the authoring and parsing workspace where showrunner screenplay drafts and `.fountain` files originate.

### 2. Why Both Were Mentioned: The Architectural Split

The parenthetical note `(or worker-sower-conductor/drafts/ during active assembly cycles)` reflects the operational handoff between the two sibling repositories:

- **Upstream / Narrative Drafting (`worker-sower-engine/drafts/`):** Where the human showrunner or drafting agents work with `.fountain` files and scene outlines before running Stage 4/5 extraction to compile the typed `dialogue_ast.json`.
- **Downstream / Local Assembly (`worker-sower-conductor/drafts/`):** Once execution begins on Rig 1, the conductor workspace (`02.simulation/worker-sower-conductor/drafts/`) serves as the ephemeral assembly directory that receives the active scene contract and generates the derived `exposure_sheet.json` and quantized timing assets.

### You

why are they not saved in [000.lore]

### Gemini

In the studio architecture, **`.fountain` files are strictly barred from `000.lore` (`000.goblin-lore` / Cluster `01.canon`)** to preserve the foundational separation of concerns across the pipeline.

The system enforces this boundary for several architectural reasons:

### 1. Zero Scene and Script Awareness (The Legislative Boundary)

- **The Mandate of `000.goblin-lore`:** It functions exclusively as an **offline legislative compiler** for static, universal world facts—governing characters, grievances, locations, possessions, and macro-axioms.
- **No Script Awareness:** Per Section 1.1 and Rule 13 of `AGENTS.md`, the lore repository **knows nothing about scenes, scripts, screenplays, dialogue, or writer drafting**. Mixing screenplay prose into `000.goblin-lore` violates repository boundaries and causes severe domain contamination.

### 2. The Separation of Meaning vs. Representation (Axis A vs. Axis B)

The pipeline draws a hard ontological dividing line between world law and narrative presentation:

- **Axis A (Semantic Truth & World Law):** Governed by `01.canon/000.goblin-lore`. It defines what is physically, anatomically, and socially possible at compile time ($T_0 = \$0.00$).
- **Axis B (Representation & Prose):** Lives downstream in `02.simulation` (drafting) and `05.delivery` (conformed episodes). Screenplay prose (`.fountain`) is treated as a human-readable presentation layer and creative review byproduct. Downstream media synthesis engines (TTS, ComfyUI, Remotion) never parse raw `.fountain` files; they execute against the typed machine contract (`dialogue_ast.json`).

### 3. The Prohibition on Reverse Flow (Zero Unilateral Axis B Writes)

- If an LLM or writer invents a new piece of lore, backstory, or physical trait inside a `.fountain` script, that text is **mathematically prohibited from flowing upstream into `000.goblin-lore`**.
- Extracted details with high salience ($S \ge 0.70$) are routed into temporary staging queues in Cloudflare D1 (`unratified_details`) and require an explicit human showrunner promotion event before they can ever become canonical markdown dossiers. Placing `.fountain` files in `000.goblin-lore` would break this firewall.

### 4. Canonical Independence & The Refined Deletion Principle ($T_0 = \$0.00$)

- Injected scenes and narrative drama mutate only dynamic simulation runtime states (in D1/SQLite). The static Markdown dossiers in `000.goblin-lore` must remain untouched.
- Under the **Refined Deletion Principle**, if all simulation engines, generative models, ComfyUI checkpoints, and D1 databases were completely deleted, the storyworld must remain 100% reconstructible to its clean baseline directly from the Git history of `01.canon` without leaving unrecorded canonical debris.

### 5. Compiler Purity and the Zero-Drift Tripwire

- The compiler (`compile.ts`) evaluates entity dossiers across a strict 3-pass gauntlet (validating scalar bounds, running foreign-key integrity sweeps, checking DAG acyclicity, and sealing the result with a Merkle root hash, $H_{\text{root}}$).
- Continuous Integration enforces a strict tripwire: `git diff --exit-code compiled/`.
- If `.fountain` files lived in `000.goblin-lore`, every minor dialogue tweak, typographical fix, or draft iteration would invalidate the compiler's Merkle hash ($H_{\text{root}}$) and trigger false **Uncompiled Canon Drift** build halts across the entire studio fleet.

### 6. Read-Only Local Filesystem Binding

- Downstream execution daemons (`worker-sower-engine` and `worker-sower-conductor`) bind to `000.goblin-lore` via **read-only filesystem imports**.
- Downstream workers are structurally incapable of writing to the lore repository path; their file-writing permissions are strictly confined to their own designated workspace directories (such as `02.simulation/002.worker-sower/drafts/` or `05.delivery/goblin-episodes/`).

### You

how does the [worker-sower-engine] use content found in [worker-sower-engine/drafts/]

### Gemini

Within the architecture, **`worker-sower-engine/drafts/`** serves as the quarantined local disk workspace for narrative authoring, scene drafting, and structural parsing.

The engine uses content in `drafts/` across several discrete stages of the simulation lifecycle:

### 1. The Draft Quarantine & Authoring Invariant

- **Local Disk Quarantine:** Rather than streaming raw Markdown or `.fountain` text over HTTP to external dashboards or cloud workers, all text generation, manual editing, and extraction operate locally on disk inside `worker-sower-engine/drafts/` to eliminate network latency, file locking collisions, and merge race conditions.
- **Showrunner Workspace:** Human writers and the terminal UI (spawned via `$EDITOR` or the Writer’s Desk) save and iterate on raw screenplay prose and Markdown outlines directly in this folder.
- **Writer's Eject Button (`@lifecycle: locked`):** If a draft in `drafts/` contains the `@lifecycle: locked` header flag, the engine treats the file as an immutable manual override, preventing automated generation cycles from overwriting it.

### 2. Prompt Momentum in the Attention Sandwich

- **Cadence Anchoring:** When the engine assists in drafting or generating subsequent scenes, it reads a sliding **800–1,200 word manuscript buffer** from files in `worker-sower-engine/drafts/`.
- **Context Ingestion:** This buffer is injected into **Zone 2 (Middle 70% / Passive Momentum)** of the attention prompt, anchoring tone, character voice, and narrative pacing while preventing U-shaped context dilution.

### 3. The Extract-Then-Verify Ingress Pattern ($T = 0.0$)

The engine rejects single-pass JSON generation in favor of the **Extract-Then-Verify Dual-Artifact Pattern**, parsing draft prose through `src/parsers/`:

- **Secondary Extraction Pass:** The engine feeds the locked draft text through a deterministic inference pass at $T = 0.0$ (clamped by GBNF grammars) or rule-based parser.
- **Structural Field Mapping:** `extract()` parses the draft into structured fields, extracting speaker cues, intensity ceilings, Dwight Swain Motivation-Reaction Units (MRUs), emotion tags, camera intent, parentheticals, and discrete motor actions.
- **Foreign-Key Registry Validation:** It cross-references extracted wiki-links (`[[slug]]`), character IDs, and location headers against compiled canon JSON artifacts (`bible-state.json`, `characters.json`, `locations.json`) to guarantee relational integrity.

### 4. Verification Gates and Somatic Invariants ($T_0 = \$0.00$)

Before allowing a draft's content to proceed downstream, the engine executes zero-cost pre-flight audits:

- **Verbatim Parity Assertion:** The engine runs `assertVerbatimParity(fountainProse, ast)` and `normalizePunctuation()` to verify character-for-character equality between the spoken lines in `drafts/` and the compiled AST, halting immediately if prose and machine contracts diverge.
- **Somatic Panopticon Gauntlet:** The engine cross-checks all motor verbs extracted from the draft against `getCharacterSomaticMask()` using an $O(1)$ set-intersection check to ensure no character performs physically impossible actions (e.g., using an arm flagged as paralyzed in the runtime ledger).

### 5. Compiling Downstream Contracts (`dialogue_ast.json`) & Ledger Mutation

- **Relational Ledger Mutation:** Candidate `SceneFrontmatter` and conflict outcomes extracted from the draft are applied to the engine's dynamic relational ledger (updating resentment counters, Paranoia Clocks, and string debts).
- **Machine Rail Handoff:** Once verified, the engine compiles the draft into the immutable intermediate representation: **`dialogue_ast.json`**. Stamped with the current state Merkle root hash ($H_{\text{root}}$), this AST is placed into `drafts/` (or handed to `worker-sower-conductor/drafts/`) as the sole machine contract that drives speech synthesis, temporal quantization, and video rendering.

### You

so can an author hand draft a [.fountain] file and put it inside [worker-sower-engine/drafts/]

### Gemini

**Yes, absolutely.** Hand-drafting native `.fountain` screenplay files and saving them directly into **`worker-sower-engine/drafts/`** is a primary supported ingress workflow of **Stage 1 (Permissive Capture & Extract-Then-Verify Ingress)**.

The architecture specifically accounts for this human-in-the-loop authoring pattern through the following mechanisms:

### 1. The Authoring Workflow in `drafts/`

- **Local Workspace Ingress:** Writers can use any external text editor (spawned via `$EDITOR`, `$VISUAL`, or `code --wait`), the Writer's Desk UI, or simply drop a raw `.fountain` file directly into `worker-sower-engine/drafts/`.
- **The Writer's Eject Button (`@lifecycle: locked`):** To ensure that automated stochastic models ($T = 0.75$) or background drafting passes do not overwrite manual work, the author can stamp the **`@lifecycle: locked`** pragma in the screenplay header. This marks the draft as an immutable manual override.
- **Zero Compute Idle ($T_0 = \$0.00$):** While the human author writes and iterates in `drafts/`, the pipeline remains completely idle, incurring $\$0.00$ in neural vocoder or GPU rendering costs.

### 2. What the Engine Does with the Hand-Drafted File

Once the file is saved in `worker-sower-engine/drafts/`, the engine processes it through the pipeline's validation and compilation gates:

- **Secondary Extraction Pass ($T = 0.0$):** The engine feeds the draft prose into a deterministic inference pass clamped by GBNF grammars (or rule-based parsers) to extract character cues, Dwight Swain Motivation-Reaction Units (MRUs), camera intent, and discrete motor actions into **`dialogue_ast.json`**.
- **The Verbatim Parity Gate (`assertVerbatimParity`):** The engine executes a strict character-for-character comparison between the author's spoken dialogue in the `.fountain` file and the compiled AST's `dialogue_text`. If an automated extraction attempts to alter, drop, or hallucinate words, compilation halts immediately at $T_0$ ($0.00) to protect authorial intent.
- **Somatic & Epistemic Panopticon:** The engine audits the hand-drafted action lines and dialogue against the compiled world state (`bible-state.json`), verifying that no character performs physically impossible actions according to their somatic mask (e.g., using an arm marked as amputated) or speaks unearned secrets.

### 3. Downstream Handoff

- Once the hand-drafted `.fountain` script successfully compiles and passes parity assertion, the resulting **`dialogue_ast.json`** serves as the immutable machine contract.
- The AST is stamped with the active Merkle root hash ($H_{\text{root}}$) and handed off to **`worker-sower-conductor`** for audio synthesis, temporal quantization, and final video assembly.

### You

would [goblin-spatial] have anything to do with these [hand drafted [.fountain] files]

### Gemini

**Yes, but strictly indirectly.**

Under the pipeline’s architecture, **`goblin-spatial` never touches, reads, or parses raw `.fountain` text directly**. `goblin-spatial` is a pure, stateless mathematical engine (Axis A) with zero knowledge of screenplay syntax, literary prose, or character dialogue.

However, `goblin-spatial` acts as the **physical causality gatekeeper** for hand-drafted `.fountain` files through a mediated bridge (**Stage 3: Spatial Oracle Mediated Coupling**). It interacts with the screenplay across three distinct phases:

### 1. Pre-Drafting Constraints: Setting the Physical Stage

Before the author writes a single scene header or action line, the spatial world state dictates the valid physical container:

- **The Spatial Stage Header:** The engine establishes the starting constraints based on the hex lattice: room boundaries, dynamic door states (e.g., `HATCH: LOCKED`), ambient lighting levels, and exact starting actor coordinates $(q, r)$.
- **Ignorance by Omission (Epistemic Firewall):** `goblin-spatial` evaluates line-of-sight (LoS) raycasts and acoustic wavefront decay across walls and bulkheads. If an event in an adjacent room was dampened below the ambient noise floor, the characters in the current scene physically cannot know about it. If an author’s draft attempts to reference unearned secrets that the characters could not have seen or heard, downstream checks will fail.

### 2. Live Authoring Telemetry: Real-Time Redlining (The Writer’s Desk)

If the author drafts the `.fountain` script within the studio interface (`src/pages/director/writer.astro`), `goblin-spatial` acts as a real-time background physical linter:

- **Interactive AST Streaming:** As the author types action lines, the client-side parser extracts candidate motor actions and streams them through the synchronous `SpatialPort` interface into the spatial kernel.
- **Visual Invariant Redlining:** If the author describes a physically impossible action, `goblin-spatial` catches the geometric violation and draws **red squiggly underlines** directly beneath the offending `.fountain` lines:
  - *Portal Violation:* Typing *"Wart steps through the sealed pressure hatch"* triggers `[SPATIAL BREACH]: Portal 'hatch_valve_04' is currently SHUT`.
  - *Line-of-Sight Violation:* Typing *"Bog points across three bulkheads to Spleen"* triggers `[SENSORY BREACH]: LoS raycast severed by bulkheads 02, 03`.
  - While redlined, the author is blocked from approving the draft to staging.

### 3. Post-Drafting Invariant Linting ($T_0 = \$0.00$)

When a hand-drafted `.fountain` file is saved to `worker-sower-engine/drafts/`, `worker-sower-engine` runs the **Secondary Extraction Pass** to turn prose into `dialogue_ast.json`:

1. **The Scrubbed Boundary Contract:** The engine's Query Serializer strips away all dialogue strings, names, and dramatic subtext. It translates the script's action descriptions into pure numeric origin/destination cells, door occlusion bitmasks (`SpatialOverlaySnapshot`), and scalar movement budgets (`movementBudgetCostUnits`).
2. **Deterministic Geometric Verification:** `goblin-spatial` runs integer supercover raycasts and reachability searches over the axial lattice to verify:
  - **Collocation / Touch Reach:** Interpersonal actions (e.g., handing an object, grappling, whispering) assert $d_{\text{hex}} \le 1$.
  - **Somatic Traversal Caps:** An actor cannot move more hex cells than permitted by their physical injury budget.
3. **Fail-Closed Gate ($T_0 = \$0.00$):** If the hand-drafted `.fountain` action lines describe physically impossible movements or line-of-sight feats, compilation halts immediately with a clear error receipt. This guarantees that script blocking errors are caught at zero API/GPU cost before expensive speech synthesis or 3D/video rendering can ever be triggered.

### 4. Acoustic Foley & Audio Stamping

If the author drafts lines where characters speak or cause noise from an adjacent room or behind an obstacle, `goblin-spatial` calculates the exact acoustic transmission loss in centi-decibels ($\text{cdB}$). It stamps the derived `acousticDampingFactor` into the conformed AST so downstream audio synthesizers automatically apply proportional high-frequency roll-off and muffled gain attenuation to the scene's audio stems.

### You

{{FOCUS : Pre-Drafting Constraints: Setting the Physical Stage }}

@extreme-details

### Gemini

### Executive Summary & Ontological Mandate

In the Generative Production Pipeline, **Setting the Physical Stage** is an uncompromising compile-time gatekeeper that precedes the writing of a single line of screenplay prose, dialogue block, or action line. The pipeline strictly enforces the **Separation of Meaning (Axis A) from Representation (Axis B)**. Physical reality is not left to probabilistic LLM inference, conversational guesswork, or ungrounded authorial whim.

Without deterministic physical constraints established *prior* to drafting, generative models and writers succumb to catastrophic failure modes: hallucinating spatial shortcuts, phasing characters through locked bulkheads, permitting whispered secrets to bleed through solid masonry, and scripting physically impossible tasks (such as an amputee character wielding a two-handed weapon).

The pipeline adheres to the **Fail-Fast Economic Hierarchy**: all spatial, somatic, and informational defects must fail at **Stage 0 ($T_0$)**, where financial and computational cost is exactly **$\$0.00$**. Allowing ungrounded blocking or physical paradoxes to escape into downstream neural speech synthesis (TTS), diffusion plate generation, or headless Chromium/Remotion rendering incurs direct API billing, GPU timeouts, and invalidation cascades.

```plaintext
               THE PRE-DRAFTING PHYSICAL COMPILATION PIPELINE
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 0: PHYSICAL FEASIBILITY & SENSORY ORACLE (goblin-spatial)       │
│ • Integer Axial Lattice (hexgeom) • Supercover Line-of-Sight (LoS)     │
│ • Dijkstra Acoustic Wavefronts (cdB) • Door Mutexes & Capacity Bounds  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Emits Cryptographic Spatial Receipts
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE A: PRE-EXISTING SIMULATION LEDGER (worker-sower-engine)          │
│ • Materialized State Sn at Tick t: Staged Positions, Somatic Masks    │
│ • EquipSlot Hierarchies • Epistemic Belief Vectors & Grievance Clocks  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Compiles Scene Brief / Context
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE B: THE SPATIAL STAGE HEADER & SCENEPLAN IR                       │
│ • Hard Physical Bounds (Room ID, Lighting, Capacity, Dynamic Portals)  │
│ • Mandatory Terminal Transitions • Ignorance by Omission Fencing       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Injected into Prompt / Desk
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE C: THE WRITING PASS (Human Showrunner or LLM at T = 0.75)        │
│ • Drafted inside worker-sower-engine/drafts/ or writer.astro           │
│ • Anchored by the Attention Sandwich (Bottom 15% Physical Anchor)      │
│ • Live PixiJS HexMapView Redlining & Pre-Flight SAT Capability Gate    │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Immutable Canonical Law ($\mathcal{L}_{\text{canon}}$) vs. Elastic Intra-Scene Staging ($B_{\text{scene}}$)

To allow dramatic flexibility without violating the **Cartesian Firewall** (preventing presentation prose from illegally mutating canonical world law), the pre-drafting engine draws a strict mathematical boundary between two state spaces:

$$
\mathcal{S}_{\text{world}} = \mathcal{L}_{\text{canon}} \cup \mathcal{S}_{\text{elastic}}
$$

#### A. Immutable Canonical Law ($\mathcal{L}_{\text{canon}}$ — Zero Variance)

These parameters are statically locked in the canonical database (`01.canon` / `000.goblin-lore`) and the append-only ledger; they cannot be bent, negotiated, or hallucinated away by an author or prompt:

1. **Permanent Somatic Topology:** A character with an amputated arm (`limbs.left_arm = AMPUTATED`) has an invariant capability ceiling (`availableArms = 1.0`); they can never perform a bimanual motor action.
2. **Epistemic Isolation:** Characters under `TOTAL_IGNORANCE` of an off-screen event are strictly barred from referencing it.
3. **Logistical Mass & Non-Locality:** Canonical possessions held by an actor three rooms away cannot spontaneously manifest in the active scene.

#### B. Elastic Intra-Scene Staging ($B_{\text{scene}}$ / $\mathcal{S}_{\text{elastic}}$ — The Solver's Search Space)

Everything pertaining to how an actor utilizes their immediate environment, body, and micro-blocking within the assigned room is treated as elastic and abductively solvable:

- **Micro-Topological Coordinates:** Fine-grained axial coordinates $(q, r, s)$ within the bounds of the assigned room.
- **6-Way Facing Vectors:** Discrete orientations ($0 \dots 5$) indicating direct gaze, peripheral awareness, or an exposed back.
- **Equip-Slot State Transitions:** Shifting owned items between `HELD_PRIMARY`, `HELD_OFF`, `WORN_BELT`, `CACHED_POCKET`, or the local hex floor via `EquipSlotSchema`.
- **Somatic Ergonomic Substitutions:** Bimanual-to-unimanual compensations (e.g., clamping an item between knees, teeth, or against a pipe flange to compensate for `availableArms: 1.0`), accumulating basis-point strain in the Unified Pressure Meter.
- **Ephemeral Detritus Reification:** Instantiating low-mass, non-canonical clutter (scrap wire, grease rags, cotter pins) that sits below the canonical salience threshold ($S < 0.70$).

### 2. The Pre-Existing Simulation Ledger (Authoring at Tick $t$)

When an author hand-drafts a `.fountain` file or calls a drafting model, they do not invent a vacuum; they step into an ongoing, stateful simulation. The universe is maintained via an append-only event log evaluated by a pure mathematical reducer:

$$
S_{n+1} = \mathcal{R}(S_n, E_n, \sigma_n)
$$

where $S_n$ is the current materialized state, $E_n$ is the deterministic narrative event, and $\sigma_n$ is the logged pseudorandom seed. Before authoring begins, the simulation ledger (`worker-sower-engine`) exposes four locked state vectors:

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│               MATERIALIZED LEDGER STATE VECTORS AT TICK t              │
├────────────────────────────────────────────────────────────────────────┤
│ 1. SPATIAL VECTOR                                                      │
│    • Site & Room ID: loc_warm_pipe                                     │
│    • Placement State: STAGED at axial (q, r) = (10, 2)                 │
│    • Dynamic Occluder State: hatch_valve_04 = LOCKED                   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. SOMATIC CAPABILITY VECTOR                                           │
│    • arms_available: 1.0                                               │
│    • mobility_class: LIMPING (max_velocity: 0.6 m/s)                   │
│    • banned_kinetic_verbs: ["sprint", "vault", "bimanual_lift"]        │
├────────────────────────────────────────────────────────────────────────┤
│ 3. LOGISTICAL VECTOR (EquipSlotSchema)                                 │
│    • HELD_PRIMARY: item_iron_knife (mass: 120g, occupies_hands: 1)     │
│    • HELD_OFF: EMPTY                                                   │
│    • Available Hand Capacity: 0 (Hand Capacity Invariant saturated)    │
├────────────────────────────────────────────────────────────────────────┤
│ 4. EPISTEMIC VECTOR (Information Asymmetry)                            │
│    • Known Propositions: { fact_culvert_leak: TRUE }                   │
│    • Forbidden Propositions: { fact_theft_conspiracy: UNKNOWN }        │
└────────────────────────────────────────────────────────────────────────┘
```

The author is constrained by the **Ensemble Eligibility Sweep**: `worker-sower-engine` runs an axial proximity sweep ($d_{\text{axial}} \le 1$) and room-occupancy query to determine which characters are physically co-present and eligible to encounter each other.

### 3. Stage 0 Physical Oracle (`goblin-spatial`) & The Axial Coordinate Lattice

`goblin-spatial` is a pure, stateless mathematical kernel operating on Rig 1 (CPU/RAM). It knows nothing of character dialogue, literary themes, or emotional subtext; it evaluates physical possibility over an exact integer coordinate lattice.

#### A. The Exact Integer Tactical Lattice (`hexgeom`)

To eliminate IEEE-754 floating-point platform divergence between Node.js V8 runtimes, browser WebAssembly, and remote servers, tactical interiors operate on an exact integer grid:

- **Planar Invariant:** Coordinates are defined as integer axial triples $(q, r, s)$ where:
  $$
  q + r + s = 0
  $$
- **Pointy-Top Affine Transformation:** With circumradius $s = 2$, Cartesian centroids are computed as $x = \sqrt{3}(2q + r)$ and $y = 3r$. By applying an affine stretch factor of $1/\sqrt{3}$, the irrational square root is eliminated entirely, preserving collinearity, convexity, and line intersections.
- **Doubled Coordinate Scaling ($2\times$):** Multiplying all axes by 2 ensures that cell centroids, edge midpoints, and polygon vertices all land cleanly on integer coordinates:
  $$
  \text{Centroid}(q, r) = (4q + 2r, 6r)
  $$
  $$
  \text{Vertices} = (cx, cy \pm 4), \; (cx \pm 2, cy \pm 2)
  $$
  $$
  \text{Edge Midpoints} = (cx \pm 1, cy \pm 3), \; (cx \pm 2, cy)
  $$
- **Topological Axial Distance Metric:** Euclidean distance is forbidden on the tactical grid; distance is calculated strictly as:
  $$
  d_{\text{axial}}(a, b) = \max(\vert{}q_a - q_b\vert{}, \vert{}r_a - r_b\vert{}, \vert{}s_a - s_b\vert{})
  $$

#### B. Continuous Metric Space Projection

When 3D spatial staging or video compositing occurs downstream, the integer hex lattice maps into metric Cartesian space ($1.0\text{ unit} \equiv 1.0\text{ meter}$) via the site's canonical cell pitch ($L_{\text{pitch}}$ in integer millimeters):

$$
X_{\text{stage}} = \left(\frac{L_{\text{pitch}}}{1000}\right) \cdot \sqrt{3} \cdot \left(q + \frac{r}{2}\right), \quad Z_{\text{stage}} = \left(\frac{L_{\text{pitch}}}{1000}\right) \cdot \frac{3}{2} \cdot r
$$

Vertical registration is locked to the floor collision plane via the **Ground Contact Invariant**:

$$
Y_{\text{contact}} \equiv Y_{\text{ground}}
$$

where the world translation matrix evaluates against the model's declared sole contact point ($\vec{A}_{\text{ground}}$) to prevent the "Floating Puppet Anomaly" and "Terrain Clipping Defect":

$$
\vec{T}_{\text{world}} = \vec{P}_{\text{stage}} - s \cdot (\mathbf{R} \cdot \vec{A}_{\text{ground}})
$$

### 4. The Sanitizing Epistemic Firewall (`SpatialPort` & Scrubbed Payloads)

`goblin-spatial` communicates with `worker-sower-engine` strictly through a **Hexagonal Port & Adapter Architecture** (`SpatialPort`). Under Section 1.1 of `AGENTS.md`, `goblin-spatial` is forbidden from importing database schemas, Markdown text, or screenplay ASTs.

```plaintext
                 THE SANITIZING EPISTEMIC FIREWALL
  worker-sower-engine                            goblin-spatial (Stage 0)
┌───────────────────────┐                      ┌──────────────────────────┐
│ Entity: char_bog      │                      │ Origin: (10, 2)          │
│ Health: Fractured Leg │ ──[Sanitization]──►  │ Dest:   (11, 2)          │
│ Inventory: Iron Knife │   Strips identity,   │ Budget: 400 Cost Units   │
│ Trait: Cowardice      │   drama, & trauma    │ Overlay: Door_A = CLOSED │
└───────────────────────┘                      └─────────────┬────────────┘
                                                             │
                                                             ▼
                                                    [Pure Integer Math]
                                                             │
                                                             ▼
                                               ┌──────────────────────────┐
                                               │ Plain Data Receipt:      │
                                               │ • feasible: true         │
                                               │ • cost: 100              │
                                               │ • query_hash: 7f83...    │
                                               │ • receipt_hash: cb83...  │
                                               └──────────────────────────┘
```

#### Sanitization Rules:

1. **Narrative & Identity Stripping:** All character names, faction tags, and dialogue lines are purged. The spatial kernel only receives anonymous origin/destination coordinate structs.
2. **Somatic Budget Translation:** Physical trauma is mapped into an integer traversal budget (`movementBudgetCostUnits: 400`).
3. **Ephemeral Overlay Snapshot:** Dynamic door/portal states are passed as a content-addressed bitmask (`SpatialOverlaySnapshot`, e.g., `{"hatch_valve_04": false}` for shut). The spatial kernel merges this overlay with the static `TopologyManifest` in memory and discards it immediately upon returning the receipt.
4. **Bounded Search Envelopes:** All searches carry hard iteration ceilings (`maxCellsExpanded: 512`) to eliminate isolate hangs.

### 5. Spatial Catalysts as Inciting Dramatic Beats

Rather than relying on unconstrained language models to invent scene beginnings, the pre-drafting spatial topology provides the **inciting dramatic catalysts**:

#### A. Overcrowding Violations (`ROOM_CAPACITY_EXCEEDED`)

Tactical locations enforce strict volume ceilings (typically $\le 2$ adult goblins per hex cell centroid, or $1$ per narrow crawlway).

- When movement paths route excess bodies into a cramped cell like *The Warm Pipe* (`loc_warm_pipe`, `maxAdultGoblins: 2`), the spatial engine triggers an overcrowding violation.
- **The Eviction Authority Split:**
  - **Simulation Policy (`worker-sower-engine`):** Decides *who* gets displaced using a deterministic rule: the latest arrival to the cell, tie-broken by lowest somatic stability score, and resolved finally by lexicographical actor ID.
  - **Spatial Geometry (`goblin-spatial`):** Decides *where* they go via `resolveDisplacement`.
- **Topologically Sound Displacement:** Instead of sampling geometric Euclidean rings (which risk placing characters on the other side of an impassable concrete bulkhead), the spatial engine runs a budget-bounded Dijkstra flood-fill outward along traversable paths to find the nearest connected cell with remaining capacity.
- **Dramatic Beat Generation:** In the script, this is not a dry alert—it translates directly into the opening action beat: *the weaker character being physically shoved or crowded out through the splinter gap*.

```typescript
// Deterministic Eviction Selection Policy in worker-sower-engine
export function selectEvictionCandidate(occupants: ActorState[]): ActorState {
  return occupants.slice().sort((a, b) => {
    // 1. Latest arrival first
    if (a.arrivalTick !== b.arrivalTick) return b.arrivalTick - a.arrivalTick;
    // 2. Lowest somatic stability score
    if (a.somaticStability !== b.somaticStability) return a.somaticStability - b.somaticStability;
    // 3. Deterministic lexicographical string tie-break
    return a.id.localeCompare(b.id);
  })[0];
}
```

#### B. Portal Collisions & Stalls

If two actors attempt to cross a single narrow portal on the exact same simulation tick, deterministic HMAC collision resolution determines who wins the right-of-way:

$$
\text{Priority} = \text{HMAC-SHA256}(\text{Tick} \mathbin{\Vert} \text{ActorID}, \, \text{Seed})
$$

The losing actor is logged with an explicit `STALL` event, which the script compiler manifests as a tense physical doorway standoff.

#### C. Door Mutex Locks as Scene Barriers

If an iron hatch is flipped to `[LOCKED]` in the dynamic overlay bitmask, the topological edge between those two rooms is severed. The pre-drafting engine forbids characters from entering or seeing through that portal, automatically transforming a face-to-face altercation into a barrier scene played across an impenetrable iron bulkhead.

#### D. 6-Way Facing Vectors & Pacing

Actor facings ($0 \dots 5$) define optical cones. An actor with their back turned (Facing Difference = 3) cannot see an approaching threat, pre-populating the scene brief with sneak-approach beats or sudden ambush conditions.

### 6. Sensory Horizon Sweep, Epistemic Gating & Acoustic Wavefronts

The spatial world state dictates not only where characters stand, but **what they are physically permitted to know and hear**.

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│                        SENSORY HORIZON SWEEP                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. OPTICAL LINE-OF-SIGHT (Supercover Bresenham Raycast)                │
│    • Resolves visual clarity scalar: Q_visual ∈ [0, 1000]              │
│    • Blocked by opaque hex voids and closed dynamic doors              │
├────────────────────────────────────────────────────────────────────────┤
│ 2. ACOUSTIC WAVEFRONT DECAY (Dijkstra Breadth-First Propagation)       │
│    • Calculates structural attenuation in centi-decibels (cdB)         │
│    • Wall loss clamped between 500 cdB (5 dB) and 10,000 cdB (100 dB)  │
│    • Evaluates audibility against ambient noise floor (Floor: -60 dBFS)│
├────────────────────────────────────────────────────────────────────────┤
│ 3. TEMPORAL CONTACT OPPORTUNITY GRAPH (d_axial <= 1)                   │
│    • Secret propagation requires verified physical co-presence         │
│    • Rumor fidelity decays by 0.8x per topological hop                 │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. Ignorance by Omission (Epistemic Firewall)

LLMs suffer from "omniscience drift"—leaking secrets when prompted with "act like you don't know this". The pipeline solves this architecturally:

- If an event occurred in an adjoining corridor, `goblin-spatial` traces acoustic decay. If the transmission drops below the room's ambient noise floor, the character's `EpistemicVector` receives no `BeliefRecord`.
- **Hard Token Exclusion:** The secret is physically scrubbed from the prompt payload. What characters do not know does not exist in their universe.
- An author attempting to reference unearned secrets in a draft triggers an immediate `[EPISTEMIC BREACH]` during post-draft AST verification.

#### B. Acoustic Privacy (`acousticPrivacyCdB`)

Before characters speak, the engine calculates vocal leakage across partition boundaries:

- **Known Listener Behind Thin Wall ($1{,}200\text{ cdB}$):** The engine elevates the **Subtext Suppression ($S \ge 0.70$)** vector, forcing dialogue into clipped monosyllables, coded language, or stage-whispers.
- **Unsuspected Listener:** The engine stages an **Eavesdropping Scene**: the primary actors converse freely in Room A while an off-screen auditory percept is registered in Room B, generating dramatic irony.
- **Acoustic Stamping:** Downstream speech synthesis inherits the separating partition's `acousticDampingFactor` directly from the AST, allowing automated low-pass roll-off and $-14\text{ dB}$ sidechain ducking in the master audio mix.

### 7. The Spatial Stage Header & `ScenePlan` Schema

Before writing begins, the simulation compiles all physical, logistical, and epistemic preconditions into two complementary interfaces:

#### A. The Human/LLM Stage Header (`.fountain`)

When a file is created inside `worker-sower-engine/drafts/` or opened in the Writer's Desk, the editor scaffolds the file with the concrete **Spatial Stage Header**:

```code
/* === SPATIAL STAGE HEADER ===
   LOCATION: loc_the_warm_pipe
   COORDINATES: Bog (10, 2, -12) Facing: 1 | Wart (11, 2, -13) Facing: 4
   DYNAMIC PORTALS: hatch_valve_04 [LOCKED]
   CAPACITY: Saturated (2/2 Adult Goblins)
   LIGHTING: Faint Seepage (0.15 lux)
   ACOUSTIC NOISE FLOOR: 45 cdB (Steam Hiss)
   PARTITION DAMPING: 1,500 cdB to loc_attic_stair
   SOMATIC RESTRICTIONS:
     - char_wart: armsAvailable = 1.0; banned = ["sprint", "bimanual"]
     - char_bog: mobilityClass = LIMPING
   EQUIPMENT SLOTS:
     - char_bog: HELD_PRIMARY = item_iron_knife
     - char_wart: HELD_PRIMARY = EMPTY
   EPISTEMIC FENCING:
     - FORBIDDEN TO BOG: fact_stolen_tallow_candle
   ============================= */

INT. THE WARM PIPE - NIGHT
```

#### B. The Machine Contract (`ScenePlan` Schema)

Under the hood, `worker-sower-engine` generates the formal `ScenePlan` intermediate representation (IR) that enforces mechanical bounds:

```typescript
export interface ScenePlan {
  readonly schema_version: "1.0.0";
  readonly episode_id: string;
  readonly scene_id: string;
  readonly seed: number;
  
  // Spatial & Ensemble Context
  readonly location_id: string;
  readonly participants: readonly string[];
  readonly bystanders: readonly string[];
  
  // Dramatic Constraints
  readonly grievance_slug: string;
  readonly active_subtext: string;
  readonly surface_argument: string;
  readonly forbidden_admissions: Record<string, readonly string[]>;
  
  // Pre-Resolved Mechanical Outcome (Opposed 2d6 Resolution)
  readonly mechanical_outcome: "CLEAN_WIN" | "COSTLY_WIN" | "MUTUAL_WOUND" | "BACKFIRE" | "TIE";
  readonly winner_id: string | null;
  readonly loser_id: string | null;
  readonly margin: number;
  readonly strings_expended: Record<string, number>;
  
  // Mandatory Boundary Transitions
  readonly mandated_exit_conditions: {
    readonly terminal_concession_by: string;
    readonly condition_injected: Record<string, string>; // e.g., { "bog": "humiliated" }
    readonly item_transferred?: { readonly item_id: string; readonly from: string; readonly to: string };
  };
  
  // Physical & Somatic Capability Mask
  readonly capabilities: Record<string, {
    readonly arms_available: number;
    readonly mobility_class: "NORMAL" | "LIMPING" | "IMMOBILE";
    readonly can_speak: boolean;
  }>;
}
```

### 8. Prompt Context Assembly: The Attention Sandwich Architecture

When the drafting pass utilizes a local language model (e.g., Qwen 2.5 14B running on CPU/vLLM), raw prompt concatenation causes **U-Shaped Context Dilution**, where models forget physical rules buried in the middle of long prompts. The pre-drafting engine mitigates this by formatting context into the **Attention Sandwich**:

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│               THE TRIPARTITE ATTENTION SANDWICH (100%)                 │
├────────────────────────────────────────────────────────────────────────┤
│ TOP 15%: STATIC GROUNDING & PRIMACY ANCHOR                             │
│ • Immutable Series World Axioms (Zero modern slop, survival friction)  │
│ • Authorial Voice Exemplar (Silas Vance / Bog dialect prose)           │
│ • Negative Syntactic Bans (No filter verbs, no participial openers)    │
├────────────────────────────────────────────────────────────────────────┤
│ MIDDLE 70%: PASSIVE CADENCE BUFFER                                     │
│ • Preceding 800–1,200 words of locked manuscript prose                 │
│ • Maintains sentence rhythm, voice cadence, and dramatic momentum      │
├────────────────────────────────────────────────────────────────────────┤
│ BOTTOM 15%: DYNAMIC SCENE ANCHOR (RECENCY BIAS DOMINANCE)              │
│ • Active Spatial Stage Header (Room, coordinates, door occluders)      │
│ • Somatic Capability Masks (arms_available: 1.0, banned verbs)         │
│ • Equipment Slot Declarations (Hand Capacity allocations)              │
│ • Concrete Micro-Beat Physical Exit Condition (e.g., "Bog drops knife")│
└────────────────────────────────────────────────────────────────────────┘
```

By placing the **Spatial Stage Header and the Physical Termination Trigger** at the absolute bottom 15% of the payload, the engine exploits recency bias to ensure that physical constraints directly dictate text generation.

### 9. Live Directorial Telemetry, Real-Time Redlining & Pre-Flight SAT Solvers

#### A. The Pre-Flight SAT Feasibility Solver ($T_0 = \$0.00$)

Before an author writes or tokens are consumed, the engine evaluates blocking goals against character capability vectors using a Propositional Satisfiability (SAT) solver or integer program:

$$
\text{Satisfiable} = \text{SAT}(\text{RequiredActions} \land \text{HandCapacity} \land \text{SomaticMask} \land \text{SpatialLattice})
$$

- If a scene requires an actor to hold a torch, draw a blade, and turn a valve handle within a single beat, the solver evaluates:
  $$
  \sum \text{occupies\_hands} \le \text{available\_arms}
  $$
  For an actor with `armsAvailable: 1.0`, $1 + 1 + 1 = 3 > 1$, which is physically unsatisfiable.
- The task halts at $T_0$ ($0.00 cost) with a conflict explanation detailing the exact physical contradiction before drafting begins.

#### B. The 4D Dramatic Parameter Console ($\vec{P}_{\text{dramatic}}$)

The showrunner tunes physical and dramatic tension in `DirectorConsole.tsx` across four continuous dimensions prior to dispatch:

$$
\vec{P}_{\text{dramatic}} = \begin{bmatrix} C \\ P \\ T \\ S \end{bmatrix} \in [0.0, 1.0]^4 \subset \mathbb{R}^4
$$

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│             THE 4D DRAMATIC PARAMETER CONSOLE (DirectorConsole.tsx)    │
├────────────────────────────────────────────────────────────────────────┤
│   Curtness (C)             Pacing (P)            Threat (T)     Subtext (S)│
│  [────●────] 0.75         [─────●───] 0.60      [───────●─] 0.85 [──────●──] 0.70
├────────────────────────────────────────────────────────────────────────┤
│ OPERATIONAL PRE-FLIGHT COMPILATION IMPACT:                             │
│ • Lexical Word Budget Ceiling : Max 10.0 words / dialogue block        │
│ • Swain MRU Action-to-Dialogue: 1.50 kinetic actions per spoken line   │
│ • Mechanical Duel Trigger     : 77.2% probability floor (2d6 check)    │
│ • Attenuation Heuristic       : ACTIVE (Core grievance tokens masked)  │
└────────────────────────────────────────────────────────────────────────┘
```

- **Dialogue Curtness ($C$):** Enforces an affine upper bound on sentence length:
  $$
  W_{\max} = \max(2, \, \lfloor 24.0 - 18.0 \times C \rfloor)
  $$
  At $C = 0.75$, dialogue is capped at $\le 10$ words per block, forcing monosyllabic exchanges.
- **Dramatic Pacing ($P$):** Modulates the ratio of Swain Motivation-Reaction Unit (MRU) physical actions to spoken dialogue:
  $$
  \rho_{A/D} = \frac{P}{1.0 - P + \epsilon}
  $$

#### C. Live Authoring Redlines in the Writer's Desk (`writer.astro`)

When hand-drafting in `src/pages/director/writer.astro`, the client-side parser extracts candidate actions and streams them through `SpatialPort` to `goblin-spatial`:

- **Portal Occlusion:** Typing *"Bog walks into the corridor"* while `hatch_valve_04` is `[LOCKED]` renders an immediate red squiggly underline with the hover warning: `[SPATIAL BREACH]: Portal 'hatch_valve_04' is currently SHUT`.
- **Collocation / Touch Reach Breach:** Typing *"Bog hands the wrench to Wart"* when $d_{\text{axial}}(\text{Bog}, \text{Wart}) = 4$ generates: `[KINEMATIC BREACH]: Touch interaction requires d_hex <= 1 (Current: 4)`.
- The author is blocked from promoting the draft to staging until all physical breaches are cleared.

### 10. Reactive Staleness Triggers & Cryptographic Sealing (Stage B & Stage C)

Every physical constraint compiled prior to drafting is bound to an immutable audit record. When a state-changing spatial event is committed, it records the **Spatial Audit Quadruple**:

```sql
CREATE TABLE ledger_events (
  event_id TEXT PRIMARY KEY,
  sequence_number INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at_tick INTEGER NOT NULL,
  actor_id TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  /* The Spatial Audit Quadruple */
  topology_hash TEXT NOT NULL,
  overlay_hash TEXT NOT NULL,
  query_hash TEXT NOT NULL,
  receipt_hash TEXT NOT NULL,
  kernel_version TEXT NOT NULL
);
```

#### Stage C Invalidation Loop (`is_dirty = 1`)

Downstream scenes in Stage B declare explicit cryptographic dependencies: `depends_on: [spatial_receipt_hash]`.

```plaintext
               DYNAMIC OVERLAY MUTATION (e.g., Door Slams Shut)
                                       │
                                       ▼
                     Stage C: Invalidation Trigger (is_dirty = 1)
                                       │
                                       ▼
            Re-run Stage 0 / goblin-spatial Verification on Downstream Scenes
                                       │
                      ┌────────────────┴────────────────┐
                      │                                 │
           RECEIPT HASH IDENTICAL              RECEIPT HASH DIVERGES
                      │                                 │
             Clear is_dirty Flag               Cascading Invalidation
             (No Render Re-runs)         • Mark Scene as "STALE_GEOMETRY"
                                         • Prune Invalidated Dialogue AST
                                         • Re-enter Stage 3 Conflict Lottery
```

1. If an upstream event mutates the dynamic overlay (e.g., an iron hatch slams shut during Scene 2), Stage C flags all subsequent scenes dependent on that topological receipt as `is_dirty = 1`.
2. The orchestrator re-queries `goblin-spatial` synchronously with the new `SpatialOverlaySnapshot`.
3. If the newly calculated `receipt_hash` matches the existing hash, the dirty flag is cleared without wasting compute.
4. If the receipt diverges (e.g., a planned movement or visual sightline is now physically severed), downstream dialogue ASTs and unrendered media plates are pruned, forcing the scene back into the pre-drafting Stage 0 container.

Through this exhaustive lattice of axial coordinates, somatic capability masks, acoustic propagation models, and cryptographic receipts, **Setting the Physical Stage** ensures that before creative prose begins, the physical reality of the storyworld is completely grounded, verified, and mathematically closed at zero compute cost ($T_0 = \$0.00$).

### You

{{FOCUS: How does the Event Ledger relate to this Creative Discovery section }}

@extreme-details

### Gemini

### Executive Architectural Thesis: The Cartography of the Seam

In the Generative Production Pipeline, the relationship between the **Event Ledger** (the deterministic engine of historical truth) and the **Creative Discovery Section** (the exploratory playground of divergence and capture shown in the interface cards) is governed by the **Sovereign Artifact Seam**.

```plaintext
               THE SOVEREIGN SEAM: DISCOVERY VS. THE LEDGER
               
  PHASE 0: CREATIVE DISCOVERY                       THE EVENT LEDGER
  (Divergence, Permissive Intake, Disposability)    (Determinism, Strict Schemas, Occurrence)
┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐
│ • Step 0: Multi-Model Exploration Harness    │  │ • Tier 2 of Universal 4-Tier Hierarchy       │
│ • Tier 1: Zero-Validation Slack Sinks        │  │ • Immutable Append-Only Historical Stream    │
│ • Tier 2: Staging Obsidian Vault             │  │ • State Materializer: Sn = fold(R, S0, [E]) │
│ • Tier 3: HDBSCAN Thematic Clusters          │  │ • Somatic & Epistemic Capabilities          │
│ • Disposability Axiom: $T_0 = $0.00 Compute  │  │ • Strict Zod Contracts (.strict())           │
└──────────────────────┬───────────────────────┘  └──────────────────────▲───────────────────────┘
                       │                                                 │
                       │             THE SOVEREIGN ARTIFACT SEAM         │
                       │         (Only 3 Authorized Crossing Primitives) │
                       └────────────────────────────┬────────────────────┘
                                                    │
                                ┌───────────────────┴───────────────────┐
                                │ 1. Pre-Authored Grievance DAG Nodes   │
                                │ 2. Strongly Typed Refusal Vectors     │
                                │ 3. Somatic & Logistical Capability    │
                                └───────────────────────────────────────┘
                                                    │
                                                    ▼
                                     [ HUMAN RATIFICATION GATE ]
                                        (SceneReviewGate.tsx)
                                                    │
                                                    ▼
                                      LEDGER EVENT TRANSACTION:
                                      GRIEVANCE_REGISTERED / CANON_SEALED
```

The system resolves the fundamental vulnerability of automated storytelling: **treating phenomenological token predictors as ontological state engines**. Language models cannot be trusted to maintain world state, track character injuries, or respect physical laws. Therefore:

- **The Event Ledger Governs:** It is the single source of truth for physical occurrence, material possessions, bodily conditions, and epistemic secrets ($S_n = \text{fold}(\mathcal{R}, S_0, [E_1 \dots E_n])$).
- **Creative Discovery Explores:** It operates strictly in a quarantined, pre-computational sandbox ($T_0 = \$0.00$) where models, writers, and artists can generate unconstrained, non-canonical, and disposable ideas without breaking production continuity.

### 1. The Core Inversion: "Zero Legislative Authority" vs. "Sole Authority of Occurrence"

The relationship between the Event Ledger and Creative Discovery hinges on the **Category Mismatch** callout panel:

| Architectural Attribute | Creative Discovery (Phase 0 / Step 0) | The Event Ledger (`worker-sower-engine` / D1) |
| --- | --- | --- |
| **Ontological Domain** | **Representation & Ideation (Axis B)** | **Meaning & World Truth (Axis A)** |
| **Legislative Authority** | **Zero Legislative Authority** (card bullet 3) | **Sole Authority of Occurrence** |
| **Schema Strictness** | **Syntax-Free Perimeter** (Zero Zod, Zero AST) | **Strict Typing** (`z.object().strict()`, exact schemas) |
| **Compute Cost Profile** | **$0.00 GPU Compute** (`DISCOVERY_DISPOSABLE`) | Gatekeeper against multi-thousand-dollar GPU loops |
| **Mutability & Lifecycle** | Permissive, fluid, disposable waste | Immutable, append-only, cryptographically hashed |

As explicitly noted in the **Tier 1** card, raw creative inputs have **Zero Legislative Authority**: they are structurally incapable of mutating database tables, advancing the simulation story clock, altering character inventories, or dispatching GPU renders.

If an intake drop in `#creative` or a high-temperature LLM scratchpad invents a scene where *"Bog's left arm is severed by an iron gear,"* **the Event Ledger ignores it completely**. Until that event traverses the formal promotion pipeline, Bog's somatic state vector in the ledger remains intact with two functioning arms (`availableArms: 2.0`).

### 2. Upstream Grounding: How the Ledger Feeds Step 0 (The Scoped Context Retrieval)

When the **Step 0: Gatelatent Exploration Harness** executes its **Multi-Model Scatter-Gather Fan-Out** across four distinct architectures (Claude 3.5 Sonnet, Qwen 2.5 32B, Llama 3.3 70B, and DeepSeek V3 at $T = 0.85$), it does not launch into an arbitrary void. It uses the Event Ledger to construct its initial conditions:

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│                   THE THREE-TIER CONTEXT RETRIEVAL                     │
├────────────────────────────────────────────────────────────────────────┤
│ 1. CANONICAL BIBLE STATE (H_root)                                      │
│    • Invariants, world tone, and genre constraints (~250 tokens)       │
├────────────────────────────────────────────────────────────────────────┤
│ 2. MATERIALIZED LEDGER STATE AT TICK t                                 │
│    • Somatic Mask: Limbs available, mobility class, energy reserves    │
│    • EquipSlotSchema: Items held in primary/off hands, worn on belts   │
│    • Epistemic Vector: What the characters factually know vs. suspect  │
├────────────────────────────────────────────────────────────────────────┤
│ 3. ENSEMBLE PAIR HISTORY                                               │
│    • Active Grievance Clocks and accumulated String debts (~400 tokens)│
│    • Dyadic Channel Starvation check: empty intersections (∅)          │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Context Extraction:** The exploration harness queries the ledger’s materialized read-cache ($S_n$) to determine exact physical realities: who is in the room, what objects are held, and what injuries are active.
2. **Unforced Collision Staging:** Step 0 places characters into an *unforced, low-stakes situation* without rigid plot prerequisites to observe where their personalities clash naturally.
3. **Preventing "The Beige Plague":** Standard LLMs collapse into polite, conflict-averse sycophancy when prompted naively. By anchoring the prompt with the ledger's true unresolved grievances and running four heterogeneous model families at high temperature ($T = 0.85$), the system exposes authentic psychological resistance.

### 3. The Downstream Crossing: Backward-Chaining Rule Induction & The Sovereign Seam

The core architectural innovation shown in the callout cards is **Backward-Chaining Rule Induction**. Traditional naive systems allow LLM-generated prose to become canon directly, which causes **Accidental Canon via Model Mimicry** and breaks the ledger's mathematical reproducibility.

The diagram cards mandate that **raw exploratory text is treated as 100% disposable waste (`synthetic_tier: "DISCOVERY_DISPOSABLE"`) and discarded**.

```plaintext
               THE BACKWARD-CHAINING CROSSING LIFECYCLE
               
  1. MULTI-MODEL DIVERGENCE (Step 0)
     Four high-temperature takes generated in DivergenceTriagePanel.tsx
                                │
                                ▼
  2. HUMAN SHOWRUNNER RECOGNITION
     Director spots a moment of genuine resistance: "Wart refuses to look Bog in the eye"
                                │
                                ▼
  3. BACKWARD-CHAINING EXTRACTION (Raw Prose Discarded)
     Extracts the underlying rule: "Wart has an Eye Contact Refusal Vector when accused"
                                │
                                ▼
  4. FORMALIZATION INTO AN AUTHORIZED CROSSING PRIMITIVE
     Compiles into one of the Three Strongly Typed Primitives
                                │
                                ▼
  5. EVENT LEDGER COMMITMENT (SceneReviewGate.tsx)
     Appends an immutable transaction into the production ledger (01.canon)
     Reseals universe with new Merkle Root Hash: H_root
```

#### The Three Authorized Crossing Primitives

Only three strongly typed primitives are authorized to cross the Sovereign Seam and enter the production database:

1. **Pre-Authored Grievance Springs (DAG Nodes):**
  - *Creative Discovery Origin:* Synthesized during Tier 3/4 via `!PitchGrievance <Entity_A> vs <Entity_B> <Premise>`.
  - *Ledger Commitment:* Appended to the ledger as an edge in the interpersonal Directed Acyclic Graph (DAG) with explicit intensity envelopes ($I_{\min}, I_{\max}$), cooldown tick durations, and Argument Score outcome deltas.
2. **Character Refusal Vectors:**
  - *Creative Discovery Origin:* Discovered when a character in an exploratory take stubbornly refuses to perform an action.
  - *Ledger Commitment:* Injected into the character’s permanent behavioral definition as a strongly typed negative constraint (e.g., `banned_kinetic_verbs: ["sprint"]`, or social refusal triggers).
3. **Bounded Somatic & Logistical Capability Masks:**
  - *Creative Discovery Origin:* Emerges from physical props or spatial blocking tested on scrap paper or in Gemini Notebooks.
  - *Ledger Commitment:* Committed to the ledger as an `EquipSlotSchema` constraint (preventing characters from holding more than their anatomical limit) or an anatomical mask (`available_arms: 1`).

### 4. Detailed Tier-by-Tier Ledger Interaction

#### Tier 1: Low-Friction Ingestion (Zero-Validation Drop Sinks)

- **The Ergonomic Mandate:** In an event-sourced pipeline, requiring writers to specify valid YAML frontmatter, Zod schemas, and foreign keys at the moment of inspiration causes **Premature Cognitive Calcification** (the mind freezes under procedural bureaucracy).
- **Relation to Ledger:** Tier 1 has a complete **airlock** separating it from the ledger. Drops into `#research-wallpaper` or `#creative` bypass all database drivers entirely, ensuring that brainstorming generates zero unratified ledger noise.

#### Tier 2: Normalized Persistence (Staging Obsidian Vault & Soft Linker)

- **The "Body is King" Envelope:** Webhook `POST /api/staging/ingest` captures drops into `vault/ingest/YYYY/MM/*.md` with Byte-0 machine YAML frontmatter (`status: "raw"`).
- **The Soft Linker vs. Ledger Foreign Keys:** In the production Event Ledger, every entity mention (`actor_id: "char_bog"`) is an absolute foreign key validated against `characters.json`. In Tier 2, the **Heuristic Soft Linker** tags probable mentions (e.g., `[[char_bog]]`) via lemma co-occurrence *without* enforcing foreign-key integrity. This allows writers to brainstorm prototype characters (e.g., `[[char_uncle_tallow]]`) that do not yet exist in the Event Ledger without triggering build errors.

#### Tier 3: Scheduled Thematic Clustering (HDBSCAN & !ResearchDigest)

- **Resolving the "Dumpster Vault":** If unconstrained notes accumulate in flat folders, they degenerate into a dead archive where valuable motifs sit unread ("The Dumpster Vault Hazard").
- **Resonance & Entropy Auditing against the Ledger:** When HDBSCAN clusters multi-modal vectors ($V_{\text{joint}} = \alpha V_{\text{text}} \oplus \beta V_{\text{vis}}$) on weekly cron or via `!ResearchDigest`, the engine audits the clusters against established ledger canon:
  1. *Cliché & Monoculture Detection:* It checks cluster motifs against past episode ledger events to prevent writers from repeatedly cycling through the same arguments.
  2. *Epistemic Mystery Disjointness:* It verifies clusters against the deliberately unresolved secrets ledger (`unresolved.json`) to confirm that accidental research notes do not inadvertently leak core world mysteries.

#### Tier 4: The Formal Proposal Gate (!PitchGrievance & Sovereign Seam)

- **The Compilation Bridge:** Converts a qualitative research cluster into executable simulation mechanics.
- **Human Ratification Gate:** Routes proposals to `SceneReviewGate.tsx`. When the showrunner clicks **[ RATIFY ]**, the system executes a formal atomic transaction:
  ```typescript
  // Formal promotion from Creative Discovery into the Sovereign Event Ledger
  await ledger.appendEvent({
    event_type: "GRIEVANCE_REGISTERED",
    actor_id: "usr_showrunner_01",
    timestamp: Date.now(),
    payload: {
      grievance_slug: "grv_fuel_siphon_theft",
      entity_a: "char_bog",
      entity_b: "char_wart",
      intensity_bounds: [1, 3],
      cooldown_ticks: 120,
      spawns_on_max_escalation: "grv_open_culvert_violence"
    },
    state_root_hash: currentMerkleRoot
  });
  ```
  Only at this exact moment does the creative discovery work become a permanent, binding fact within the storyworld.

### 5. Architectural Summary: The Economic and Structural Purpose

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│                   THE GENERATIVE ECONOMIC FUNNEL                       │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 0: CREATIVE DISCOVERY                                            │
│ • Permissive capture, divergent models, rapid paper prototyping       │
│ • Economic Cost: $0.00 GPU Compute (Zero Rendering)                   │
├───────────────────────────────────┬────────────────────────────────────┤
│                                   │ Filtered via Sovereign Seam        │
│                                   ▼                                    │
│ THE EVENT LEDGER (worker-sower)                                        │
│ • Hardened relational facts, somatic masks, physical preconditions    │
│ • Economic Cost: Milliseconds of CPU / In-Memory Reducers              │
├───────────────────────────────────┬────────────────────────────────────┤
│                                   │ Enforces Validation Preconditions  │
│                                   ▼                                    │
│ PHASES 1–7: PRODUCTION COMPILATION                                     │
│ • Neural TTS, ComfyUI latent diffusion, Remotion optical compositing  │
│ • Economic Cost: Heavy GPU & API spend ($$$)                           │
└────────────────────────────────────────────────────────────────────────┘
```

The Creative Discovery section and the Event Ledger are two halves of a balanced system:

1. **Without Creative Discovery, the Event Ledger causes Premature Cognitive Calcification:** The studio degenerates into a sterile bureaucratic database where nobody can write dialogue without satisfying fifteen strict relational schemas first.
2. **Without the Event Ledger, Creative Discovery causes The Chapter 3 Collapse:** Exploratory brainstorming and ungrounded LLM generation flood the project with hallucinations, broken limb logic, forgotten secrets, and fatal continuity drift.

By placing **Creative Discovery** directly above the **Minimal Validated Core** and binding them across the **Sovereign Artifact Seam**, the platform ensures that writers and models are free to play, explore, and discard at **$\$0.00$ cost**—while guaranteeing that whatever enters the **Event Ledger** is permanent, physically grounded, and mathematically reproducible for all future episodes.

### You

{{FOCUS : Creative Discovery }}

@project-categories-00

### Gemini

In software project management, **Creative Discovery (Phase 0 / Step 0)** decomposes into non-overlapping **[Epics]**, **[Features]**, and **[Tasks]** mapped across the studio's Git repositories. Every unit title below adheres to strict atomic decomposition (zero compound titles, zero redundant sub-items).

### Git Repository Mapping Summary

| Git Repository | Cluster / Domain | Primary Creative Discovery Responsibility |
| --- | --- | --- |
| **`camp-candor/000.repo-bot`** | `00.governance` | Webhook ingestion bridges, Obsidian staging vault persistence, ChatOps triggers (`!ResearchDigest`, `!PitchGrievance`). |
| **`astro-kahn-it-com/001.goblin-lore`** (`000.goblin-lore`) | `01.canon` | Canonical schema validation, Grievance DAG nodes, Character Refusal Vectors, Somatic Capability Masks, Merkle root ($H_{\text{root}}$) compilation. |
| **`camp-candor/002.worker-sower`** (`worker-sower-engine`) | `02.simulation` | Three-tier context retrieval, 4-way model inference fan-out, pre-flight SAT capability checks, salience scoring, D1 staging quarantine. |
| **`goblin-dashboard`** (`camp-candor-cauldron`) | `05.delivery` | React islands (`DivergenceTriagePanel.tsx`, `SceneReviewGate.tsx`), Astro pages (`discovery.astro`, `harvest.astro`). |
| **`camp-candor/995.library`** | `apps/995.library` | Local Blessed TUI ideation intake, zero-cost terminal telemetry. |

### [EPIC 1] Multi-Model Divergence Exploration Harness

- **Target Git Repositories:** `camp-candor/002.worker-sower`, `goblin-dashboard`
- **Scope:** Operationalizes Step 0 (`goblin-divergence-triage`) to eliminate "The Beige Plague" by testing unforced character collisions across heterogeneous neural architectures at $T_0 = \$0.00$ GPU compute cost.

#### [Feature 1.1] Scoped Context Envelope Assembly

- **Target Git Repository:** `camp-candor/002.worker-sower`
  - **[Task 1.1.1] Canonical Bible State Snapshot Loader:** Reads the immutable world axioms (~250 tokens) sealed under the active Merkle root ($H_{\text{root}}$).
  - **[Task 1.1.2] Materialized Ledger Vector Fetcher:** Queries current character somatic masks, active equipment slots, and epistemic horizon boundaries from the simulation state.
  - **[Task 1.1.3] Unforced Premise Prompt Builder:** Packages two or more characters into a low-stakes scenario without external plot requirements.

#### [Feature 1.2] Heterogeneous Model Inference Dispatcher

- **Target Git Repository:** `camp-candor/002.worker-sower`
  - **[Task 1.2.1] Psychological Subtext Model Runner:** Dispatches Take A to Claude 3.5 Sonnet at $T = 0.85$ to probe internal evasion.
  - **[Task 1.2.2] Tactile Blocking Model Runner:** Dispatches Take B to Qwen 2.5 32B at $T = 0.85$ to emphasize environmental labor.
  - **[Task 1.2.3] Adversarial Goal Inversion Runner:** Dispatches Take C to Llama 3.3 70B at $T = 0.90$ to force unexpected concessions.
  - **[Task 1.2.4] High-Entropy Reasoning Runner:** Dispatches Take D to DeepSeek V3 (or Local 8B GGUF at $T = 0.70$) for staccato dialogue exchanges capped at 8 words per turn.

#### [Feature 1.3] Divergence Triage Cockpit Interface

- **Target Git Repository:** `goblin-dashboard` (`src/pages/director/discovery.astro`)
  - **[Task 1.3.1] Four-Column Take Comparison View:** Renders the parallel model outputs inside `DivergenceTriagePanel.tsx` with pre-calculated frame budgets.
  - **[Task 1.3.2] Barren Seed Rejection Control:** Implements the `[REJECT ALL / SEED IS BARREN]` button that logs `INERT_FRICTION` telemetry after three consecutive passes.
  - **[Task 1.3.3] Disposable Scratchpad Cleaner:** Purges unselected exploratory text marked with `synthetic_tier: "DISCOVERY_DISPOSABLE"` upon take selection.

#### [Feature 1.4] Backward-Chaining Rule Extractor

- **Target Git Repository:** `camp-candor/002.worker-sower`
  - **[Task 1.4.1] Negative Refusal Schema Parser:** Extracts character resistance from the winning take into the structured `ENTITY -> TRIGGER -> MANDATORY_REFUSAL -> UNAVOIDABLE_COST` format.
  - **[Task 1.4.2] Raw Exploratory Prose Shredder:** Discards the temporary conversational transcript immediately after rule extraction to prevent accidental canon drift.

### [EPIC 2] Unconstrained Creative Intake Pipeline

- **Target Git Repositories:** `camp-candor/000.repo-bot`, `camp-candor/995.library`
- **Scope:** Captures raw multi-modal inspiration across Tier 1 drop sinks and normalizes files into the Tier 2 staging vault without triggering premature cognitive calcification.

#### [Feature 2.1] Zero-Validation Drop Sink Listeners

- **Target Git Repositories:** `camp-candor/000.repo-bot`, `camp-candor/995.library`
  - **[Task 2.1.1] Multi-Channel Slack Webhook Collector:** Listens to `#research-wallpaper`, `#research-color`, `#creative`, and `#writing` for unformatted text or media drops.
  - **[Task 2.1.2] Blessed Terminal Ideation Buffer:** Captures local plaintext notes inside `apps/995.library` with zero network dependencies.
  - **[Task 2.1.3] Legislative Airlock Enforcer:** Blocks Tier 1 intake payloads from accessing SQLite tables, story clocks, or GPU queues.

#### [Feature 2.2] Content-Addressed Media Mirroring Service

- **Target Git Repository:** `camp-candor/000.repo-bot`
  - **[Task 2.2.1] Staging Ingestion Endpoint:** Exposes `POST /api/staging/ingest` to receive binary uploads from chat channels.
  - **[Task 2.2.2] SHA-256 Binary Deduplicator:** Hashes incoming field photos, motion clips (`.mp4`), or voice memos into `vault/media/YYYY/MM/*.*` to prevent CDN link rot.
  - **[Task 2.2.3] Zero-Byte Payload Trap:** Rejects corrupted media files smaller than 1024 bytes or lacking valid magic byte headers.

#### [Feature 2.3] Staging Vault Note Formatter

- **Target Git Repository:** `camp-candor/000.repo-bot`
  - **[Task 2.3.1] Byte-Zero Frontmatter Stamper:** Generates dual-rail Markdown files in `vault/ingest/YYYY/MM/*.md` opening at Byte 0 with `status: "raw"` metadata.
  - **[Task 2.3.2] Unconstrained Markdown Body Preserver:** Writes the creator's raw text beneath the YAML fence without syntax linting.

#### [Feature 2.4] Heuristic Entity Soft Linker

- **Target Git Repository:** `camp-candor/000.repo-bot`
  - **[Task 2.4.1] Lemma Co-Occurrence Scanner:** Scans staging notes to inject wiki-style entity tags (such as `[[char_bog]]`).
  - **[Task 2.4.2] Foreign-Key Exemption Bypass:** Allows links to unregistered prototype entities to persist in staging notes without throwing compilation errors.

### [EPIC 3] Automated Thematic Clustering Engine

- **Target Git Repositories:** `camp-candor/000.repo-bot`, `camp-candor/002.worker-sower`
- **Scope:** Prevents the "Dumpster Vault Hazard" in Tier 3 by projecting multi-modal drops into a shared latent space, clustering motifs via HDBSCAN, and auditing clusters against canonical history.

#### [Feature 3.1] Multi-Modal Joint Embedding Projector

- **Target Git Repository:** `camp-candor/002.worker-sower`
  - **[Task 3.1.1] Textual Vector Encoder:** Encodes staging note prose into 1,536-dimensional embeddings using `text-embedding-3-small`.
  - **[Task 3.1.2] Visual Feature Vector Encoder:** Extracts 768-dimensional visual vectors from staged images using DINOv2 or SigLIP.
  - **[Task 3.1.3] Latent Space Vector Fusion:** Concatenates scaled text vectors ($\alpha V_{\text{text}}$) with visual vectors ($\beta V_{\text{vis}}$) into unified joint representations ($V_{\text{joint}}$).

#### [Feature 3.2] Density-Based Motif Synthesizer

- **Target Git Repository:** `camp-candor/000.repo-bot`
  - **[Task 3.2.1] HDBSCAN Clustering Solver:** Groups dense regions of joint embeddings into unified thematic clusters while discarding isolated noise.
  - **[Task 3.2.2] Weekly Cron Synthesis Scheduler:** Triggers automated batch clustering over the staging vault on a weekly schedule.
  - **[Task 3.2.3] On-Demand Digest Command Handler:** Executes targeted thematic clustering when an operator invokes `!ResearchDigest <topic>`.

#### [Feature 3.3] Canonical Resonance Auditor

- **Target Git Repository:** `camp-candor/002.worker-sower`
  - **[Task 3.3.1] Thematic Repetition Detector:** Compares candidate clusters against historical episode embeddings to flag unconscious writer clichés.
  - **[Task 3.3.2] Mystery Clue Disjointness Verifier:** Checks cluster concepts against `unresolved.json` ($\text{Props}_{\text{harvest}} \cap \mathcal{P}_{\text{clues}} = \emptyset$) to block accidental spoilers of core plot mysteries.

### [EPIC 4] Sovereign Seam Promotion Gate

- **Target Git Repositories:** `camp-candor/000.repo-bot`, `camp-candor/002.worker-sower`, `goblin-dashboard`, `astro-kahn-it-com/001.goblin-lore`
- **Scope:** Graduates Tier 4 proposals across the Sovereign Artifact Seam via pre-flight verification gates, human showrunner ratification, and deterministic canon compilation.

#### [Feature 4.1] Grievance Pitch Compiler

- **Target Git Repositories:** `camp-candor/000.repo-bot`, `camp-candor/002.worker-sower`
  - **[Task 4.1.1] Pitch Command Parser:** Processes `!PitchGrievance <Entity_A> vs <Entity_B> <Premise>` invocations from the research pipeline.
  - **[Task 4.1.2] Dual-Rail Grievance Generator:** Formats Byte-0 YAML simulation parameters (intensity bounds, cooldowns, `spawns_on_max_escalation` DAG edges) above the Markdown subtext body ("The Underneath").
  - **[Task 4.1.3] Simulation Delta Estimator:** Computes concrete Argument Score deltas alongside String expenditures for the proposed conflict.

#### [Feature 4.2] Pre-Flight Invariant Verification Gate

- **Target Git Repository:** `camp-candor/002.worker-sower`
  - **[Task 4.2.1] Somatic Capability SAT Checker:** Verifies proposed character loadouts (`EquipSlotSchema`) against anatomical limits (`available_arms: 1`) at $T_0 = \$0.00$.
  - **[Task 4.2.2] Retroactive Scene Blast-Radius Scanner:** Runs a headless query against locked scenes to preview which downstream scripts become dirty (`is_dirty = 1`) if the rule is ratified.
  - **[Task 4.2.3] Diagnostic Three-Strike Circuit Breaker:** Annotates syntax errors in-place for two failed saves before rolling back the scratchpad on Strike 3 (`STAGING_HUMAN_GATE_BREAKER_TRIPPED`).

#### [Feature 4.3] Unratified Detail Harvest Pipeline

- **Target Git Repositories:** `camp-candor/002.worker-sower`, `goblin-dashboard`
  - **[Task 4.3.1] Emergent Prop Salience Scorer:** Calculates $S = (0.4 \cdot \text{Recurrence}) + (0.6 \cdot \text{Dramatic\_Salience})$, discarding items with $S < 0.70$ and routing items with $S \ge 0.70$ into `unratified_details`.
  - **[Task 4.3.2] Cross-Modal Lore Retro-Injector:** Queries the NotebookLM series vault via Gemini API to match quarantined items against historical notes.
  - **[Task 4.3.3] Harvest Triage Console View:** Mounts `src/pages/telemetry/harvest.astro` with the four action levers (`[R] RATIFY`, `[I] IGNORE`, `[P] PURGE`, `[E] EDIT`).

#### [Feature 4.4] Showrunner Ratification Airlock

- **Target Git Repositories:** `goblin-dashboard`, `astro-kahn-it-com/001.goblin-lore`
  - **[Task 4.4.1] Scene Review Gate Interface:** Renders candidate Crossing Primitives inside `SceneReviewGate.tsx` for human sign-off.
  - **[Task 4.4.2] Canonical Dossier Writer:** Commits ratified Grievance Springs, Refusal Vectors, or Capability Masks as Markdown files into `001.goblin-lore` (`possessions/<id>.md`, `characters/<id>.md`).
  - **[Task 4.4.3] Three-Pass Universe Resealer:** Executes `scripts/compile.ts` to validate cross-references, update `bible-state.json`, and mint a new cryptographic Merkle root ($H_{\text{root}}$).

### You

{{FOCUS : how do you create characters, locations, law, and logistics using [Creative Discovery] and get them into [000.goblin-lore] }}

@extreme-details

### Gemini

### Executive Architectural Thesis: The Decoupled Bridge & The Sovereign Seam

In the Generative Production Pipeline, you never author canonical entities—**Characters**, **Locations**, **Law (World Axioms & Grievances)**, or **Logistics (Possessions & Equipment)**—by typing raw schemas in a cold vacuum, nor do you allow an unconstrained LLM to generate world files directly into `000.goblin-lore` (`01.canon`).

Doing the former causes **Premature Cognitive Calcification** (forcing a writer to calculate basis-point severity bounds and DAG foreign keys at the exact moment of artistic inspiration, which freezes creative instinct). Doing the latter causes **Latent Ontological Poisoning** and **The Accidental Canon Trap** (where hallucinated backstory, impossible room geometry, or unmodeled props silently corrupt the relational ledger and burn downstream GPU compute).

Instead, the architecture enforces the **Decoupled Bridge Pattern** across the **Impassable Sovereign Seam**. Creative Discovery (`Phase 0` / `Step 0`) is used to capture messy inspiration, provoke unforced psychological collisions, and harvest emergent props at **$T_0 = \$0.00$ GPU compute cost**. Once a truth is discovered, the raw exploratory prose is shredded as disposable waste (`synthetic_tier: "DISCOVERY_DISPOSABLE"`), and only structured, schema-validated primitives are promoted across the seam into the Dual-Rail Markdown dossiers of `000.goblin-lore`.

```plaintext
               THE END-TO-END CANON GENESIS & PROMOTION PIPELINE
               
  PHASE 0: CREATIVE DISCOVERY (Axis B / $0.00 Sandbox)
  ┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
  │ CHARACTERS       │ LOCATIONS        │ WORLD LAW &      │ LOGISTICS &      │
  │ Step 0 Fan-Out   │ #research-* Sinks│ GRIEVANCES       │ POSSESSIONS      │
  │ Unforced Friction│ Soft-Linked Notes│ !PitchGrievance  │ Harvest Queue    │
  │ & Refusal Mining │ & HDBSCAN Motifs │ & Genesis Airlock│ (S >= 0.70)      │
  └────────┬─────────┴────────┬─────────┴────────┬─────────┴────────┬─────────┘
           │                  │                  │                  │
           ▼                  ▼                  ▼                  ▼
  ══════════════════════ [ THE SOVEREIGN ARTIFACT SEAM ] ══════════════════════
  (Raw Exploratory Prose Shredded • Only Typed Primitives & Dossiers May Cross)
                                       │
                                       ▼
  PRE-COMMIT VERIFICATION GAUNTLET (T_0 = $0.00)
  • Gate 1: Stylometric & Anti-Autophagy (MAD) Linter (TTR & Curtness check)
  • Gate 2: Staging Canary (Headless D1/SQLite Blast-Radius Query)
  • Gate 3: Token-Attribution Polarity Verifier (Prose vs. Somatic Mask)
  • Gate 4: Human Showrunner Ratification (SceneReviewGate / harvest.astro)
                                       │
                                       ▼
  000.goblin-lore (01.canon Offline Legislative Repository)
  ├── series/<slug>/characters/<id>.md     (Byte-0 YAML + Voice Rail Prose)
  ├── series/<slug>/locations/<id>.md      (Axial Hex Bounds + Acoustic Loss)
  ├── series/<slug>/grievances/<id>.md     (DAG Edges + "The Underneath")
  └── series/<slug>/possessions/<id>.md    (Mass Grams + EquipSlotSchema)
                                       │
                                       ▼
  THREE-PASS DETERMINISTIC COMPILER (npx tsx scripts/compile.ts)
  • Pass 1: Zod Strict Schema & Integer Basis-Point Validation (0..10,000)
  • Pass 2: Foreign-Key Matrix Sweep, DAG Acyclicity & Clue-Lemma Disjointness
  • Pass 3: Combinatorial Somatic SAT Solver, RFC 8785 JCS & H_root Seal
                                       │
                                       ▼
                compiled/<seriesSlug>/bible-state.json (H_root)
```

### 1. Creating CHARACTERS (`000.goblin-lore/characters/*.md`)

In this architecture, characters are not authored top-down via static personality adjectives (e.g., *"Bog is grumpy and greedy"*). True character depth is defined negatively: **a character is defined by what they categorically refuse to do under pressure**.

#### Step 1A: Prototype Incubation in the Soft Linker (Tier 1 & Tier 2)

1. **Unconstrained Drop:** A writer drops a fragment of dialogue, a character sketch, or a voice memo into `#creative` or `#writing`.
2. **Soft-Linked Staging:** `000.repo-bot` ingests the drop via `POST /api/staging/ingest` into `vault/ingest/YYYY/MM/*.md` with `status: "raw"`.
3. **Foreign-Key Exemption:** The **Heuristic Soft Linker** tags the prototype entity (e.g., `[[char_spleen]]` or `[[char_bog]]`) without triggering foreign-key compiler failures. This allows a new character to accumulate thematic density across dozens of notes before they officially exist in `000.goblin-lore`.

#### Step 1B: Unforced Collision in the Step 0 Exploration Harness

To discover who the character actually is, the showrunner launches `DivergenceTriagePanel.tsx` (`src/pages/director/discovery.astro`):

1. **The Low-Stakes Premise:** The character is placed in a room with another cast member under a mundane, unforced premise (e.g., *"Wart needs Bog to hold the lantern; Bog demands grease tallies"*).
2. **4-Way Scatter-Gather Fan-Out:** The harness dispatches the identical context envelope across four distinct model architectures (Claude 3.5 Sonnet, Qwen 2.5 32B, Llama 3.3 70B, DeepSeek V3) at $T = 0.85$ to break "The Beige Plague" (LLM sycophancy).
3. **Backward-Chaining Rule Induction:** The human showrunner reads all four parallel takes and spots an unpredicted moment of psychological truth (e.g., in Take B, Bog refuses to speak while being looked directly in the eye, or Wart refuses help with a one-handed task).
4. **Targeted Compression:** Only *after* the showrunner selects the winning take does the system extract 3 candidate **Refusal Vectors** formatted as:
  $$
  \text{TRIGGER} \longrightarrow \text{MANDATORY REFUSAL} \longrightarrow \text{UNAVOIDABLE COST}
  $$
  **Crucial Invariant:** The raw exploratory dialogue from all four takes is immediately purged as $\$0.00$ disposable waste.

#### Step 1C: Scaffolding into `000.goblin-lore` (`goblin-lore add character`)

To move the character across the Sovereign Seam into `000.goblin-lore/series/<slug>/characters/<id>.md`, the author runs the interactive CLI wizard (`goblin-lore add character` / `goblin-lore new character`) which constructs the **Four Entity State Vectors** in Byte-0 YAML frontmatter alongside the Voice Rail Markdown body:

- **1. The Somatic Vector (Capability-Resource Mechanics):**
  - Sets integer basis-point capabilities (`arms_available: 10000` for $1.0$ arm, or `20000` for $2.0$ arms).
  - Sets `locomotion_baseline` (e.g., `NEUROPATHY_SHUFFLE`, `FLUID_ASYMMETRIC_LIMP`, `BIPEDAL_HUNCHED`).
  - Compiles the negative motor mask: `banned_kinetic_verbs: ["sprint", "vault", "leap", "bimanual_lift"]`.
- **2. The Logistical Vector:**
  - Initializes empty equipment slots (`worn_inner`, `worn_outer`, `held_primary`, `held_offhand`, `slung`, `cached`) and base carrying mass limits in grams.
- **3. The Epistemic Vector:**
  - Defines initial `strings_held_over` (social leverage) and `attenuation_tokens` (words the character is psychologically barred from speaking aloud).
- **4. The Character Refusal Vectors & Voice Rail:**
  - Commits the extracted Step 0 **Refusal Vectors**, the **Surface Want vs. Actual Want** (the highest-value field in character authoring), and theverbatim Step 0 discovery excerpt as cryptographic provenance.

#### Step 1D: The Token-Attribution Polarity Gate

When the character dossier is saved, `000.goblin-lore` runs the **Token-Attribution Verifier** (`scripts/lint-prose.ts`) over the Markdown biography body:

- It parses subject-verb pairs `(Actor, VerbLemma)` with a negation-aware polarity filter.
- Writing *"Spleen could not sprint"* passes (negated). Writing *"Spleen sprinted across the joists"* while `sprint` is in `banned_kinetic_verbs` triggers a `FATAL_BREACH` ($T_0 = \$0.00$) and re-opens the editor at the offending line.

### 2. Creating LOCATIONS (`000.goblin-lore/locations/*.md`)

Locations in `000.goblin-lore` are not passive background paintings; they are **tactical physical containers** that govern line-of-sight, acoustic decay, and overcrowding friction via `goblin-spatial`.

#### Step 2A: Multi-Modal Drop Sinks & HDBSCAN Clustering (Tier 1 $\to$ Tier 3)

1. **Sensory Intake:** Contributors drop field photos of rusted culverts, color swatches, architectural sketches, and ambient audio clips into `#research-wallpaper` and `#research-color`.
2. **Content-Addressed Mirroring:** `POST /api/staging/ingest` hashes the binaries via SHA-256 into `vault/media/YYYY/MM/*.*` and creates Markdown wrappers in `vault/ingest/YYYY/MM/*.md`.
3. **Joint Latent Clustering:** On a weekly schedule or via `!ResearchDigest <topic>`, Tier 3 encodes the text notes (`text-embedding-3-small`, 1,536-d) and visual drops (`DINOv2` / `SigLIP`, 768-d) into a shared joint vector space:
  $$
  V_{\text{joint}} = \alpha \cdot V_{\text{text}} \oplus \beta \cdot V_{\text{vis}}
  $$
  **HDBSCAN** groups dense spatial/atmospheric motifs into a unified location concept while **Resonance & Entropy Auditing** verifies the cluster doesn't duplicate existing rooms.

#### Step 2B: Aesthetic Prototyping in the R&D Airlock (`ComfyStudio.tsx`)

Before locking a location into `000.goblin-lore`, technical directors use the **Standalone Prototype Island** (`src/components/ComfyStudio.tsx` on `src/pages/index.astro`). This decoupled workbench allows artists to test lighting levels, LoRA triggers, and matte textures directly against Rig 2 ComfyUI without touching D1 databases or tripping narrative linters.

#### Step 2C: Formalizing the Spatial Dossier (`goblin-lore add location`)

Once the spatial cluster is validated, the architect runs `goblin-lore add location` to create `000.goblin-lore/series/<slug>/locations/<loc_id>.md`:

1. **Machine Rail (Topological & Acoustic Constants):**
  - **Axial Hex Bounds (`hexgeom`):** Defines the room's integer axial coordinates $(q, r, s)$ where $q + r + s = 0$, and the cell pitch $L_{\text{pitch}}$ in millimeters.
  - **Staging Capacity Ceiling:** Sets `max_adult_goblins` per cell/room (e.g., `2` for *The Warm Pipe*). Exceeding this at runtime triggers `goblin-spatial`'s Dijkstra flood-fill displacement (`ROOM_CAPACITY_EXCEEDED`).
  - **Dynamic Portal & Occluder Registry:** Declares all doors, hatches, and valves (`hatch_valve_04`) that can be toggled in the runtime `SpatialOverlaySnapshot` bitmask.
  - **Acoustic & Optical Registers:** Declares ambient noise floor in centi-decibels (e.g., `45 cdB` steam hiss), partition transmission loss (`acoustic_damping_cdb: 1500` to adjacent rooms), and base illuminance in integer log-lux.
2. **Voice Rail (Diegetic Sensory Prose):**
  - The sensory description used for prompt grounding (filtered by the **Filter Word Ban** so all descriptions are direct sensory occurrences).
3. **Post-Write Map Diagnostics:**
  - Closing the file triggers `scripts/compile.ts`, which runs a graph connectivity sweep and immediately flags an **Isolation Gap** if the new location node has zero valid portal/edge connections to the rest of the world map.

### 3. Creating LAW (`000.goblin-lore/world/*.md`, `unresolved.json`, & `grievances/*.md`)

In `000.goblin-lore`, "Law" encompasses three distinct legislative tiers: **Constitutional World Axioms**, **Epistemic Mystery Law**, and **Interpersonal Causal Law (Grievance Springs)**.

#### Tier A: Constitutional World Law (The Franchise Genesis Wizard)

Foundational universe laws cannot be improvised via chat prompts. When initializing a series via **`+ INITIALIZE FIRST SERIES`** (`CreateSeriesModal.tsx` at `/series/new`), the showrunner defines the **Universal Narrative 4-Tuple** $\langle \mathcal{S}, \mathcal{A}, \mathcal{I}, \mathcal{R}_m \rangle$:

- Commits `series.config.json`, `world/economy.md`, `world/magic.md`, and the single most important sentence in the bible: **The Central Irony** (the core thematic thesis against which all outputs are judged).
- Locks invariant physical laws ($\mathcal{I}$): mass conservation, hand-saturation SAT rules, farce ratio clamps, and linguistic bans (zero modern corporate jargon or therapy-speak).

#### Tier B: Epistemic Law & Mystery Governance (`unresolved.json`)

When Creative Discovery surfaces an overarching world mystery (e.g., *The Cause of the Great Winter Famine*), it is codified into the **Unresolved Canon Registry**:

1. **Per-Character Epistemic Horizons:** Maps every character to a strict enum (`TOTAL_IGNORANCE`, `RUMOR_ONLY`, `FALSE_BELIEF`, `PARTIAL_FACT`, `WITHHELD`, `FACTUAL_WITNESS`).
2. **Distorted Belief Strings:** Authors the exact subjective rumor or false conviction injected into a character's prompt.
3. **The Clue-Lemma Disjointness Theorem:** Compiler Pass 2 mathematically verifies that the set of permitted physical clue tokens ($P_{\text{clues}}$) and the union of forbidden trigger lemmas ($T$) are strictly disjoint:
  $$
  P_{\text{clues}} \cap \left( \bigcup_{t \in T} t \right) = \emptyset
  $$
  If a writer accidentally uses a forbidden conclusion word inside a permitted clue list, `compile.ts` halts the build at $T_0 = \$0.00$.

#### Tier C: Interpersonal Causal Law (`!PitchGrievance` $\to$ `grievances/*.md`)

To give the simulation engine real dramatic fuel, the studio authors **40–60 Dual-Rail Grievance Springs** across the cast:

1. **Tier 4 Graduation (`!PitchGrievance`):** When a Tier 3 research cluster shows high conflict potential, an operator runs: `!PitchGrievance <Entity_A> vs <Entity_B> <Core Premise>`.
2. **Mechanic Synthesis:** `000.repo-bot` and `worker-sower-engine` compile the pitch into one of the **Three Authorized Crossing Primitives**: a **Pre-Authored Grievance Spring (DAG Node)**.
3. **Dual-Rail Dossier Structure (`000.goblin-lore/grievances/<slug>.md`):**
  - **Byte-0 Machine Rail:** Participant IDs, integer basis-point intensity bounds ($I_{\min}, I_{\max}$), cycle cooldown counters, Argument Score deltas, String costs, and the `spawns_on_max_escalation` pointer (forming a Directed Acyclic Graph of escalating conflict).
  - **Voice Rail Markdown Body:** Defines the **Surface Argument** (what they claim to argue about) versus **The Underneath** (the unspoken existential wound driving the fight).

### 4. Creating LOGISTICS (`000.goblin-lore/possessions/*.md`)

In `000.goblin-lore`, every tracked item, tool, weapon, or piece of scrap is governed by strict physical conservation: it must have an explicit mass in grams, an `EquipSlotSchema` hand/body requirement, and either an active character owner or a static spatial location node. Logistics enter `000.goblin-lore` via two pathways:

#### Pathway A: Emergent Hallucination Harvesting (`harvest.astro`)

During Phase 0 screenplay drafting or downstream Wan 2.2 / Flux diffusion passes, models inevitably improvise unscripted incidental props (e.g., *"a dented brass siphon on the pipe"* or *"a chipped green enamel cup"*). To prevent **Accidental Canon via Model Mimicry** without falling into **The Radical Omission Trap** (making the world feel barren), the pipeline routes unindexed objects through the **Three-Tier Unratified Detail Ledger**:

```plaintext
  UNSCRIPTED PROP DETECTED ("dented brass siphon")
  (Extracted via spaCy/Stanza Dependency AST or Grounding DINO BBoxes)
                                │
                                ▼
  COMPOSITE SALIENCE SCORER: S = (0.4 · Recurrence) + (0.6 · Drama)
                                │
              ┌─────────────────┴─────────────────┐
              ▼ S < 0.70                          ▼ S >= 0.70
  [ TIER 1: EPHEMERAL NOISE ]         [ TIER 2: QUARANTINE HARVEST QUEUE ]
  • Immediately purged                • Written to unratified_details.jsonl
  • Scrubbed from next prompt         • Banned from 2d6 duels & SAT checks
                                      • Surfaced in telemetry/harvest.astro
                                                  │
                                                  ▼
                                      [ CROSS-MODAL NOTEBOOKLM RETRO-INJECTION ]
                                      • Queries NotebookLM vault & !ResearchDigest
                                      • Pre-populates mass, custody, & EquipSlot
                                                  │
                                                  ▼ Showrunner clicks [RATIFY]
                                      [ TIER 3: FORMAL CANONICAL REIFICATION ]
                                      • Commits 01.canon/possessions/item_*.md
                                      • Runs 3-Pass Compiler & advances H_root
```

1. **Detection & Salience Scoring:** NLP dependency parsers (`spaCy`/`Stanza`) and Computer Vision (`Grounding DINO`) isolate the unindexed noun chunk and calculate its Composite Salience Score:
  $$
  S = (0.4 \cdot \text{Recurrence}) + (0.6 \cdot \text{Drama})
  $$
2. **Tier 1 (Ephemeral Noise, $S < 0.70$):** Purged immediately and scrubbed from future prompts so models cannot mimic it.
3. **Tier 2 (The Quarantine Harvest Queue, $S \ge 0.70$):** Quarantined in Cloudflare D1 (`unratified_details.jsonl`) and surfaced in `src/pages/telemetry/harvest.astro`. It is strictly barred from affecting 2d6 duels or hand-capacity SAT checks while quarantined.
4. **Mystery Clue Disjointness Check:** The harvester verifies that the emergent prop does not collide with reserved plot clues ($\text{Props}_{\text{harvest}} \cap \mathcal{P}_{\text{clues}} = \emptyset$).
5. **NotebookLM Retro-Injection:** The **Retro-Injection Cognitive Synthesizer** queries the NotebookLM series research vault via the Gemini API to see if the prop connects to dormant Tier 3 `!ResearchDigest` notes, pre-populating its YAML dossier fields (`mass_grams`, `equip_slot`, `occupies_hands`, initial `custody`).
6. **Tier 3 (One-Click Ratification):** When the showrunner clicks **`[R] RATIFY DETAIL`** in `harvest.astro`, the system writes `000.goblin-lore/series/<slug>/possessions/item_brass_siphon.md` and triggers a 3-pass recompilation.

#### Pathway B: Abductive Backpropagation (Solving "Chekhov's Straightjacket")

Sometimes a writer drafts an electric line of dialogue or action beat (e.g., *"Bog slams the heavy pipe wrench onto the table"*), only for the $T_0$ linter to flag that Bog is not carrying a wrench.

- Rather than forcing the linter to destroy great writing, the **Abductive Solver** calculates the minimum upstream state delta ($\Delta S_{n-k}$) required earlier in the episode or in the canonical loadout (`possessions/*.md`) to make Bog legally possess the wrench without violating the **Hand Capacity Invariant** ($\sum \text{occupies\_hands} \le \text{available\_arms}$).
- It presents this pre-calculated possession/loadout patch to the showrunner as a single ratification option.

### 5. Crossing the Sovereign Seam: The 4 Pre-Commit Governance Gates

Under the **Monotonic Authority Principle**, nothing from Creative Discovery is permitted to flow upward into `000.goblin-lore` silently. Before a new or modified Character, Location, Law, or Possession dossier is committed to Git, it must clear four deterministic gates in `SceneReviewGate.tsx`:

1. **Gate 1: The Stylometric & Anti-Autophagy (MAD) Guardrail:**
  - Evaluates candidate prose and Refusal Vectors against the series' Type-Token Ratio (TTR), syntactic compression score, and lexical curtness baseline. If an LLM proposal exhibits generic melodrama or corporate symmetry, it is rejected before promotion.
2. **Gate 2: The Continuity Desynchronization Circuit Breaker:**
  - Verifies that the $H_{\text{root}}$ snapshot hash embedded in the discovery proposal matches the active HEAD hash of `000.goblin-lore`. If another author edited canon in the meantime, the UI triggers a Continuity Desynchronization Lock until the proposal is re-evaluated against the newest state.
3. **Gate 3: The Staging Canary (Pre-Merge Blast Radius Preview):**
  - Executes a headless graph query against `CANON_DB` (`scene_fact_dependencies`) in an ephemeral `.tmp` scratchpad.
  - Displays the **Stratified Casualty List** showing exactly which locked historical scenes (`ACTIVE_DRAFT`, `LOCKED_ANIMATIC`, `LOCKED_MASTER`) will be flagged `is_dirty = 1` if this new rule, location change, or character constraint is committed.
4. **Gate 4: The Showrunner Ratification Handshake (`[1] ACCEPT & MARK DIRTY`):**
  - When the showrunner approves the decision brief in `SceneReviewGate.tsx`, the system advances the staging note in `vault/ingest/` from `status: "raw"` to `status: "graduated"` and writes the canonical `.md` file into `000.goblin-lore`.

### 6. Sealing into `000.goblin-lore`: The 3-Pass Compiler & Cryptographic Reliquary

Once the `.md` dossier resides in `000.goblin-lore/series/<seriesSlug>/`, the repository executes its offline legislative compilation sequence (`npx tsx scripts/compile.ts`):

```plaintext
               THE 3-PASS OFFLINE COMPILER (scripts/compile.ts)
               
  [ PASS 1: SYNTACTIC & SCALAR BOUNDS ]
  • Enforces Byte-0 YAML frontmatter & closed .strict() Zod schemas
  • Validates integer basis-point scalars (0..10,000; RoundEven math)
  • Rejects IEEE-754 floats and ambient wall-clock timestamps (Date.now)
                                │
                                ▼
  [ PASS 2: RELATIONAL GRAPH & TOPOLOGICAL INTEGRITY ]
  • Foreign-Key Matrix sweep across characters, locations, grievances, items
  • Tarjan's / Kahn's algorithm confirms Grievance DAG acyclicity (zero loops)
  • Enforces Clue-Lemma Disjointness Theorem & Map Isolation checks
                                │
                                ▼
  [ PASS 3: COMBINATORIAL SAT SOLVER & CRYPTOGRAPHIC SEAL ]
  • Evaluates Somatic vs. Logistical Hand-Capacity SAT at T_0 = $0.00
  • Applies Unicode NFC normalization & lexicographical UTF-8 key sorting
  • Serializes via RFC 8785 (JCS) to .tmp_[UUIDv7] -> atomic fs.renameSync
  • Mints new 64-char SHA-256 Merkle Root (H_root) in bible-state.json
```

1. **Dual-Emission Persistence:** The compiler writes both the active `compiled/<seriesSlug>/bible-state.json` HEAD artifact and a Windows-safe timestamped WORM snapshot (`bible-state_YYYY-MM-DDTHH-mm-ssZ.json`).
2. **Stratified NotebookLM Sync:** To prevent the **Multi-Draft Conflation Trap**, the Upstream Retro-Injection Worker updates the entity's canonical dossier inside **NotebookLM** *in place* under `[CONSTITUTIONAL]` tags, keeping semantic retrieval aligned with the new $H_{\text{root}}$.
3. **The Zero-Drift CI Tripwire:** Continuous Integration runs `goblin-lore check`, culminating in `git diff --exit-code compiled/`. If a Markdown file was added or modified without compiling the corresponding `bible-state.json`, the build halts with Exit Code 1.
4. **The Forward-Recovery Saga (`Expand -> Migrate -> Contract`):** If the newly discovered law or entity introduces a new schema field, `000.goblin-lore` merges first under a strictly additive **Phase 1 (Expand)** commit so downstream consumers (`worker-sower-engine`, `goblin-viewport-template`) never suffer breaking runtime crashes during migration.

### You

{{FOCUS : Creating CHARACTERS }}

@project-categories-00

### Gemini

In software project management, **Creating Characters** decomposes into non-overlapping **[Epics]**, **[Features]**, and **[Tasks]** mapped across the studio's Git repositories. Every unit title below adheres to strict atomic decomposition (zero compound titles, zero redundant sub-items).

### Git Repository Mapping Summary

| Git Repository | Cluster / Domain | Primary Character Creation Responsibility |
| --- | --- | --- |
| **`camp-candor/000.repo-bot`** | `00.governance` | Prototype character soft-linking in staging notes, candidate sprite triage (`palette_enforce.py`), monotonic PR diff guards. |
| **`astro-kahn-it-com/001.goblin-lore`** (`000.goblin-lore` / `packages/001.lore`) | `01.canon` | Dual-Rail character Markdown dossiers (`characters/*.md`), Four-Vector Zod schemas, CLI character scaffolding wizard, token-attribution polarity linter, somatic mask compiler. |
| **`camp-candor/002.worker-sower`** (`worker-sower-engine`) | `02.simulation` | Step 0 multi-model character collision fan-out, Refusal Vector backward-chaining extractor, epistemic prompt builder (`buildCharacterEpistemicPrompt`). |
| **`goblin-lora-training`** | `03.foundry` | Identity baseline LoRA training (`character` class), permanent invariant caption omission, four-vector reference dataset tagging. |
| **`goblin-assets-visual`** (`[series]-assets-visual`) | `04.assets` | 2D puppet rig contracts (`manifest.json`), Preston Blair phoneme visemes, Four-Dimensional Emotion Bank staging (`approved.json`). |
| **`[series]-assets-3d`** | `04.assets` | Runtime glTF armatures (`model.glb`), somatic trauma mesh variants (`variants/`), 3D candidate quarantine (`triage_bank/approved_3d.json`). |
| **`goblin-dashboard`** (`camp-candor-cauldron`) | `05.delivery` | Divergence triage UI (`DivergenceTriagePanel.tsx`), Character Dossier inspection drawers, Franchise Genesis seed protagonist wizard (`CreateSeriesModal.tsx`). |

### [EPIC 1] Exploratory Character Discovery Pipeline

- **Target Git Repositories:** `camp-candor/000.repo-bot`, `camp-candor/002.worker-sower`, `goblin-dashboard`
- **Scope:** Incubates unformed character prototypes in the staging vault and discovers authentic psychological resistance through Step 0 multi-model collisions at $T_0 = \$0.00$ compute cost.

#### [Feature 1.1] Prototype Character Staging Incubation

- **Target Git Repository:** `camp-candor/000.repo-bot`
  - **[Task 1.1.1] Unconstrained Character Sketch Ingestion:** Captures raw dialogue quips or voice memos from `#creative` into `vault/ingest/YYYY/MM/*.md` with `status: "raw"`.
  - **[Task 1.1.2] Unregistered Character Soft Tagging:** Applies wiki-links (such as `[[char_spleen]]`) via lemma co-occurrence while bypassing foreign-key compiler failures.

#### [Feature 1.2] Unforced Character Collision Harness

- **Target Git Repositories:** `camp-candor/002.worker-sower`, `goblin-dashboard`
  - **[Task 1.2.1] Low-Stakes Premise Envelope Builder:** Packages two cast members into a mundane domestic scenario with zero plot prerequisites.
  - **[Task 1.2.2] Four-Architecture Scatter Fan-Out:** Dispatches the character premise concurrently across Claude 3.5 Sonnet, Qwen 2.5 32B, Llama 3.3 70B, and DeepSeek V3 at $T = 0.85$.
  - **[Task 1.2.3] Parallel Take Inspection View:** Renders the four divergent character performances inside `DivergenceTriagePanel.tsx` (`src/pages/director/discovery.astro`) for showrunner selection.

#### [Feature 1.3] Backward-Chaining Refusal Induction

- **Target Git Repository:** `camp-candor/002.worker-sower`
  - **[Task 1.3.1] Character Refusal Vector Extractor:** Compresses character defiance from the selected take into the `TRIGGER -> MANDATORY REFUSAL -> UNAVOIDABLE COST` schema.
  - **[Task 1.3.2] Ensemble Interaction Rule Extractor:** Isolates relational rules governing how a specific character pair redirects conflict sideways when together.
  - **[Task 1.3.3] Exploratory Transcript Shredder:** Purges the temporary multi-model dialogue takes as disposable waste immediately following rule extraction.

### [EPIC 2] Dual-Rail Character Dossier Authoring

- **Target Git Repositories:** `astro-kahn-it-com/001.goblin-lore`, `goblin-dashboard`
- **Scope:** Scaffolds canonical character Markdown files (`series/<slug>/characters/<id>.md`) separated into the Byte-0 YAML Machine Rail and the Markdown Voice Rail.

#### [Feature 2.1] Interactive Character Scaffolding Wizard

- **Target Git Repositories:** `astro-kahn-it-com/001.goblin-lore`, `goblin-dashboard`
  - **[Task 2.1.1] Seed Protagonist Genesis Generator:** Emits `char_protagonist.md` during universe initialization inside `CreateSeriesModal.tsx` (`01.series.unit`).
  - **[Task 2.1.2] CLI Character Dossier Generator:** Scaffolds compliant `char_<slug>.md` files via `goblin-lore add character` (`SCAFFOLD_CHARACTER`).
  - **[Task 2.1.3] Prototype Archetype Inheritance Resolver:** Links background actors to shared species templates (`SomaticArchetypeSchema` in `packages/001.lore/schemas/archetype.ts`) so individual files store only trauma deltas.
  - **[Task 2.1.4] Character Deprecation Mover:** Relocates departing characters to `series/<slug>/characters/_retired/<entity>.md` via `lore retire` to preserve historical event pointers.

#### [Feature 2.2] Somatic Capability Vector Configuration

- **Target Git Repository:** `astro-kahn-it-com/001.goblin-lore` (`packages/001.lore/schemas/somatic.ts`)
  - **[Task 2.2.1] Locomotion Baseline Selector:** Assigns the character's gait from `LocomotionBaselineEnum` (`bipedal_hunched`, `limping`, `sessile`, `quadruped_crawl`).
  - **[Task 2.2.2] Compound Trauma Limb Clamper:** Calculates `availableArms` by subtracting severe conditions (`severed_left_arm`, `braxial_plexus_severed`) from $2.0$ with a floor at $0.0$.
  - **[Task 2.2.3] Negative Kinetic Verb Mask Compiler:** Populates `banned_kinetic_verbs` (such as `sprint`, `vault`, `bimanual_lift`) from declared motor limitations.
  - **[Task 2.2.4] Sensory Acuity Debuff Configurator:** Sets optical state (`NORMAL`, `MONOCULAR`, `BLIND`), blind-cone angles, and auditory threshold debuffs in basis points.
  - **[Task 2.2.5] Vocal DSP Modifier Mapper:** Defines `pitch_semitones`, `speed_multiplier`, and `pause_frequency_multiplier` for speech synthesis.

#### [Feature 2.3] Logistical Equipment Vector Configuration

- **Target Git Repository:** `astro-kahn-it-com/001.goblin-lore`
  - **[Task 2.3.1] Four-Tier Equip Slot Allocator:** Partitions character inventory into `worn`, `held`, `carried`, and `cached` arrays under `CharacterLogisticalVectorSchema`.
  - **[Task 2.3.2] Hand Saturation Pre-Flight Solver:** Verifies at authoring time that items in `held` slots satisfy $\sum R_{\text{hands}} \le \text{ArmsAvailable}$.

#### [Feature 2.4] Epistemic Horizon Vector Configuration

- **Target Git Repository:** `astro-kahn-it-com/001.goblin-lore`
  - **[Task 2.4.1] Conversational Escalation Ceiling Setter:** Bounds the character's social breaking point to an integer between 1 and 5.
  - **[Task 2.4.2] Directional Leverage String Indexer:** Populates `strings_held_over` by querying valid character IDs on disk.
  - **[Task 2.4.3] Subtext Attenuation Token Blocker:** Defines words the character is psychologically forbidden from speaking aloud.
  - **[Task 2.4.4] Subjective Belief Record Schema:** Tracks character-held propositions (`BeliefRecord`) with `source_type` (`DIRECT_OBSERVATION`, `RUMOR`) and `resists_correction` flags.

#### [Feature 2.5] Voice Rail Subtext Authoring

- **Target Git Repository:** `astro-kahn-it-com/001.goblin-lore`
  - **[Task 2.5.1] Dual-Objective Want Differentiator:** Authors the `Wants (surface)` block against the unadmitted `Wants (actual)` block to drive scene subtext.
  - **[Task 2.5.2] Comedic Register Instruction Tagging:** Assigns structured generation tags (`deadpan`, `self_serious`, `oblivious`) to prevent generic model tone regression.
  - **[Task 2.5.3] Risk Profile Schema Integration:** Configures `RiskProfile` (`disposition`, `trigger_condition`, `failure_behavior`, `shares_pose_with`) inside character frontmatter.
  - **[Task 2.5.4] Showrunner Progression Task Lock:** Populates `pending_showrunner_task` (such as `"class_shift_150"`) to halt automated progression until a scripted episode exists.

### [EPIC 3] Character Compile-Time Verification Gauntlet

- **Target Git Repositories:** `astro-kahn-it-com/001.goblin-lore`, `camp-candor/002.worker-sower`
- **Scope:** Enforces physical, linguistic, and epistemic invariants on character dossiers at $T_0 = \$0.00$ before sealing `bible-state.json`.

#### [Feature 3.1] Prose Polarity Linting Gate

- **Target Git Repository:** `astro-kahn-it-com/001.goblin-lore` (`scripts/lint-prose.ts`, `scripts/lint-voice.ts`)
  - **[Task 3.1.1] Negation-Aware Verb Attribution Scanner:** Parses `(Actor, VerbLemma)` pairs in the Markdown body to block affirmative uses of `banned_kinetic_verbs`.
  - **[Task 3.1.2] Behavioral Invariance Unit Test Runner:** Executes character-specific psychological assertions (such as verifying zero spoken dialogue lines for a mute character).

#### [Feature 3.2] Somatic Mask Projection Service

- **Target GitRepositories:** `astro-kahn-it-com/001.goblin-lore`, `camp-candor/002.worker-sower`
  - **[Task 3.2.1] Deep-Frozen Somatic Mask Roll-Up:** Implements `getCharacterSomaticMask()` with recursive `deepFreeze()` to expose immutable actor limits to downstream engines.
  - **[Task 3.2.2] Unknown Character Fail-Closed Guard:** Throws an immediate `[LORE CLIENT] Unknown character ID` exception when an unindexed actor slug is queried.
  - **[Task 3.2.3] Epistemic Prompt Context Isolation:** Implements `buildCharacterEpistemicPrompt()` to omit unknown facts and wrap rumors in `[UNVERIFIED HEARSAY]` directives.

### [EPIC 4] Character Visual Identity Foundry

- **Target Git Repositories:** `goblin-lora-training`, `goblin-assets-visual`, `[series]-assets-3d`, `camp-candor/000.repo-bot`, `goblin-dashboard`
- **Scope:** Translates the canonical character dossier (Axis A) into palette-locked LoRA weights, 2D sprite emotion banks, and 3D glTF armatures (Axis B).

#### [Feature 4.1] Character Identity LoRA Training

- **Target Git Repository:** `goblin-lora-training`
  - **[Task 4.1.1] Four-Vector Reference Image Tagging:** Categorizes training plates across `Camera Angle`, `Framing Scale`, `Somatic Posture`, and `Emotional State`.
  - **[Task 4.1.2] Permanent Biological Invariant Caption Stripper:** Omits core bone structure, skin tone, and ear notches from training captions so they bake directly into the trigger token (such as `bog_goblin`).
  - **[Task 4.1.3] Mutable Context Exhaustive Captioner:** Captions wearables, held props, and lighting conditions to keep costumes swappable at inference time.

#### [Feature 4.2] Two-Dimensional Character Emotion Bank

- **Target Git Repositories:** `goblin-assets-visual`, `camp-candor/000.repo-bot`
  - **[Task 4.2.1] Four-Dimensional Emotion Matrix Specification:** Defines each character condition (`humiliated`, `smug`, `terrified`) with physical staging, prompt fragments, and negative distinctness boundaries.
  - **[Task 4.2.2] Preston Blair Viseme Set Creation:** Populates `characters/<id>/mouths/` with `mouth_closed.png`, `mouth_small.png`, `mouth_medium.png`, and `mouth_wide.png` aligned to $1024 \times 1024$ coordinates.
  - **[Task 4.2.3] Master Palette Gamut Gate:** Runs `palette_check.py` (`palette_enforce.py`) and alpha-edge green-spill sweeps across candidate sprite takes in `emotion_bank/`.
  - **[Task 4.2.4] Silhouette Blackout Redaction Test:** Generates `take_XX_silhouette.png` binary masks to verify that character identity and pose pass the Paul Rudish Blackout Test.
  - **[Task 4.2.5] Rejection Taxonomy Audit Logger:** Records discarded takes in `approved.json` under `SEMANTIC_FAILURE`, `DISTINCTNESS_COLLISION`, `CROSS_CHARACTER_BLEED`, or `PHYSICAL_DEFECT`.

#### [Feature 4.3] Three-Dimensional Character Puppet Subsystem

- **Target Git Repository:** `[series]-assets-3d` (`characters/<character_id>/`)
  - **[Task 4.3.1] Runtime glTF Armature Packaging:** Exports the rigged character mesh (`<= 5,000` triangles, `<= 4` draw calls) to `model.glb` with channel-packed Power-of-Two PBR textures.
  - **[Task 4.3.2] Somatic Trauma Mesh Variant Authoring:** Creates discrete geometry overrides in `variants/<condition_id>.glb` (such as `severed_left_arm.glb` or `bog_humiliated.glb`).
  - **[Task 4.3.3] Armature Socket SAT Verifier:** Runs `scripts/lint-3d-topology.ts` to ensure `manifest.json` disables hand attachment sockets (`socket_hand_l`) when `getCharacterSomaticMask()` reports an amputated limb.
  - **[Task 4.3.4] Zero-Byte LFS Poison Sentinel:** Verifies that promoted `.glb` and `.png` files exceed $1,024\text{ bytes}$ and do not match the empty-string SHA-256 digest before recording `approved_3d.json`.

#### [Feature 4.4] Dramatis Personae Inspection Cockpit

- **Target Git Repository:** `goblin-dashboard`
  - **[Task 4.4.1] Character Dossier Drawer Component:** Renders the immutable inspection drawer displaying the actor's Vocal Profile, Somatic Injury Blueprint, and Epistemic Bubble.

### You

{{FOCUS : Creating LOCATIONS }}

@project-categories-00

### Gemini

In software project management, **Creating Locations** decomposes into non-overlapping **[Epics]**, **[Features]**, and **[Tasks]** mapped across the studio's Git repositories. Every unit title below adheres to strict atomic decomposition (zero compound titles containing the word "AND", zero redundant sub-items).

### Git Repository Mapping Summary

| Git Repository | Cluster / Domain | Primary Location Creation Responsibility |
| --- | --- | --- |
| **`camp-candor/000.repo-bot`** | `00.governance` | Architectural reference drop ingestion (`#research-wallpaper`, `#research-color`), content-addressed media mirroring, prototype location soft-linking, HDBSCAN spatial clustering (`!ResearchDigest`). |
| **`astro-kahn-it-com/001.goblin-lore`** (`000.goblin-lore` / `packages/001.lore` / `packages/299.lore`) | `01.canon` | Dual-Rail location Markdown dossiers (`locations/*.md`), `world/location-map.md`, `LocationFrontmatter` Zod schemas, portal Isolation Gap checks, `locations.json` compilation, `TopologyManifest` export, terminal scaffolding wizard (`packages/299.lore/01.location.unit`). |
| **`goblin-spatial`** (`astro-kahn-it-com/000.goblin-spatial` / `packages/spatial-core`) | `02.simulation` | Stateless axial hex lattice math (`packages/spatial-core`), Uber H3 regional routing, supercover LoS raycasts, acoustic centibel BFS propagation, Dijkstra crowding displacement. |
| **`camp-candor/002.worker-sower`** (`worker-sower-engine` / `packages/300.engine`) | `02.simulation` | Runtime site registry (`10.location.unit`), dynamic portal overlay bitmasks (`SpatialOverlaySnapshot`), room capacity saturation gating (`VALIDATE_CAPACITY_LOCATION`), axial locomotion checks (`11.movement.unit`), `.fountain` Spatial Stage Header generation. |
| **`goblin-render-pipeline`** | `03.foundry` | Headless ComfyUI environment diffusion graphs, architectural style LoRAs. |
| **`goblin-assets-visual`** (`[series]-assets-visual`) | `04.assets` | 2D location matte plates (`environments/<location_id>/background.png`), foreground occlusion masks (`occlusion_mask.png`), horizon depth manifests (`manifest.json`). |
| **`goblin-assets-3d`** (`[series]-assets-3d`) | `04.assets` | 3D stage colliders (`environments/<location_id>/`), low-poly occlusion hulls, runtime `.glb` room geometry, portal attachment sockets. |
| **`goblin-assets-audio`** (`[series]-assets-audio`) | `04.assets` | Ambient room-tone WAV stems, site-specific environmental Foley SFX libraries. |
| **`goblin-dashboard`** (`camp-candor-cauldron`) | `05.delivery` | Franchise Genesis seed hub location wizard (`CreateSeriesModal.tsx`), zero-canon visual R&D workbench (`ComfyStudio.tsx`), PixiJS HexMapView spatial redlining canvas (`writer.astro`, `spatial.astro`). |

### [EPIC 1] Exploratory Spatial Discovery Pipeline

- **Target Git Repositories:** `camp-candor/000.repo-bot`, `camp-candor/002.worker-sower`, `goblin-dashboard`, `goblin-render-pipeline`
- **Scope:** Captures unstructured architectural inspiration across Tier 1 drop sinks, synthesizes multi-modal spatial motifs in Tier 3, and prototypes environment aesthetics at $T_0 = \$0.00$ canonical risk.

#### [Feature 1.1] Environmental Reference Drop Ingestion

- **Target Git Repository:** `camp-candor/000.repo-bot`
  - **[Task 1.1.1] Wallpaper Channel Webhook Listener:** Captures raw field photos, architectural textures, or structural sketches dropped into `#research-wallpaper`.
  - **[Task 1.1.2] Color Swatch Channel Webhook Listener:** Ingests lighting palettes or atmospheric color studies dropped into `#research-color`.
  - **[Task 1.1.3] Content-Addressed Media Storage Mirror:** Hashes uploaded environment reference binaries via `POST /api/staging/ingest` into `vault/media/YYYY/MM/*.*` using SHA-256 digests.
  - **[Task 1.1.4] Heuristic Prototype Location Soft Tagging:** Injects provisional wiki-links (such as `[[loc_warm_pipe]]`) into `vault/ingest/YYYY/MM/*.md` notes with `status: "raw"` while exempting unregistered location slugs from foreign-key compilation errors.

#### [Feature 1.2] Thematic Spatial Motif Clustering

- **Target Git Repositories:** `camp-candor/000.repo-bot`, `camp-candor/002.worker-sower`
  - **[Task 1.2.1] Textual Description Embedding Encoder:** Encodes spatial staging descriptions into 1,536-dimensional embeddings using `text-embedding-3-small`.
  - **[Task 1.2.2] Visual Plate Feature Vector Extractor:** Extracts 768-dimensional visual vectors from architectural photos using DINOv2 or SigLIP.
  - **[Task 1.2.3] Multi-Modal Joint Latent Space Projector:** Fuses scaled text embeddings ($\alpha V_{\text{text}}$) with visual embeddings ($\beta V_{\text{vis}}$) into a shared multi-modal latent space ($V_{\text{joint}}$).
  - **[Task 1.2.4] HDBSCAN Density-Based Cluster Solver:** Groups dense regions of spatial latent vectors into unified candidate locations via scheduled cron jobs or `!ResearchDigest <topic>`.
  - **[Task 1.2.5] Spatial Motif Redundancy Entropy Auditor:** Compares candidate spatial clusters against established `locations.json` canon to prevent duplicate room concepts across episodes.

#### [Feature 1.3] Zero-Canon Visual Environment Prototyping

- **Target Git Repositories:** `goblin-dashboard`, `goblin-render-pipeline`
  - **[Task 1.3.1] Standalone ComfyStudio Workbench Mounting:** Renders the decoupled R&D airlock (`src/components/ComfyStudio.tsx`) to test room lighting without touching D1 databases.
  - **[Task 1.3.2] Ephemeral Matte Lighting Test Dispatcher:** Dispatches experimental background plate prompts directly to Rig 2 ComfyUI (`goblin-render-pipeline`) prior to canonical ratification.

### [EPIC 2] Canonical Location Dossier Legislature

- **Target Git Repositories:** `astro-kahn-it-com/001.goblin-lore`, `goblin-dashboard`
- **Scope:** Authors version-controlled Dual-Rail Markdown dossiers (`series/<slug>/locations/<loc_id>.md`) and compiles validated spatial topologies into `locations.json` and `bible-state.json` ($H_{\text{root}}$).

#### [Feature 2.1] Location Dossier Scaffolding Tooling

- **Target Git Repositories:** `astro-kahn-it-com/001.goblin-lore`, `goblin-dashboard`
  - **[Task 2.1.1] Genesis Seed Hub Location Generator:** Emits the foundational `locations/loc_origin_hub.md` template via `seedOriginHub.buzz.ts` when a showrunner initializes a universe in `CreateSeriesModal.tsx`.
  - **[Task 2.1.2] Interactive Terminal Location Scaffolding Interview:** Executes `SCAFFOLD_LOCATION_WIZARD` in `packages/299.lore/01.location.unit` (`goblin-lore add location`) to generate compliant `loc_<slug>.md` files.
  - **[Task 2.1.3] Macro Geography Map Dossier Authoring:** Maintains `world/location-map.md` to document macro-scale connectivity across all canonical rooms.
  - **[Task 2.1.4] Retired Location Historical Mover:** Relocates retired rooms to `locations/_retired/` to preserve historical ledger event foreign keys.

#### [Feature 2.2] Spatial Topology Schema Validation

- **Target Git Repository:** `astro-kahn-it-com/001.goblin-lore`
  - **[Task 2.2.1] Location Frontmatter Zod Schema Definition:** Exports `LocationSchema` and `LocationFrontmatter` in `schemas/schemas.ts` enforcing strict typing on portals, noise ceilings, and staging capacities.
  - **[Task 2.2.2] Reciprocal Portal Linkage Integrity Sweeper:** Checks that if Room A connects to Room B, Room B declares the matching reciprocal edge to Room A.
  - **[Task 2.2.3] Topological Graph Isolation Gap Detector:** Verifies that every location node has at least one valid traversal portal connecting it to the macro site graph.
  - **[Task 2.2.4] Byte-Zero Markdown Dossier Atomic Writer:** Writes dual-rail dossiers starting with valid YAML at Byte 0 and performs atomic file swaps (`.tmp` to destination) to avoid partial write corruption.

#### [Feature 2.3] Location Compiler Serialization

- **Target Git Repository:** `astro-kahn-it-com/001.goblin-lore`
  - **[Task 2.3.1] Pass Two Foreign-Key Matrix Validator:** Validates that character `current_location_id` and possession starting locations match real indexed files in `/locations/`.
  - **[Task 2.3.2] Standalone Locations JSON Exporter:** Serializes parsed Markdown dossiers into the optimized `compiled/locations.json` runtime artifact.
  - **[Task 2.3.3] Cryptographic Merkle Root Sealer:** Updates the SHA-256 state hash ($H_{\text{root}}$) inside `compiled/bible-state.json` upon successful location compilation.

### [EPIC 3] Physical Geometry Simulation Engine

- **Target Git Repositories:** `goblin-spatial`, `camp-candor/002.worker-sower`
- **Scope:** Resolves physical possibility, integer hex raycasting, acoustic propagation, and runtime actor placement across discrete tactical sites.

#### [Feature 3.1] Tactical Hex Lattice Mathematical Kernel

- **Target Git Repository:** `goblin-spatial` (`packages/spatial-core`)
  - **[Task 3.1.1] Integer Axial Hex Coordinate Solver:** Implements point-top axial coordinates $(q, r, s)$ maintaining the zero-sum planar invariant $q + r + s = 0$.
  - **[Task 3.1.2] Non-Euclidean Axial Distance Calculator:** Calculates grid distance using $d_{\text{axial}}(a, b) = \max(\vert{}q_a - q_b\vert{}, \vert{}r_a - r_b\vert{}, \vert{}s_a - s_b\vert{})$.
  - **[Task 3.1.3] Metric Stage Continuous Space Projector:** Transforms discrete axial coordinates into metric millimeter coordinates ($X_{\text{stage}}, Z_{\text{stage}}$) based on canonical cell pitch.

#### [Feature 3.2] Sensory Propagation Raycasting Engine

- **Target Git Repository:** `goblin-spatial`
  - **[Task 3.2.1] Integer Supercover Optical Line-of-Sight Tracer:** Evaluates visual clarity scores ($0 \dots 1000$) between grid cells using Bresenham supercover raycasting.
  - **[Task 3.2.2] Breadth-First Acoustic Centibel Damping Calculator:** Propagates audio wavefronts across room partitions using BFS to determine decibel attenuation ($\text{cdB}$).
  - **[Task 3.2.3] Dynamic Portal State Bitmask Occluder:** Applies runtime `SpatialOverlaySnapshot` bitmasks (such as door `LOCKED` states) to block traversal and sensory rays dynamically.

#### [Feature 3.3] Tactical Room Occupancy Governor

- **Target Git Repositories:** `goblin-spatial`, `camp-candor/002.worker-sower`
  - **[Task 3.3.1] Room Capacity Saturation Gatekeeper:** Evaluates `VALIDATE_CAPACITY_LOCATION` in `10.location.unit` and halts transitions when occupancy exceeds `maxOccupancy`.
  - **[Task 3.3.2] Dijkstra Crowding Displacement Path Solver:** Executes bounded Dijkstra flood-fills via `resolveDisplacement` to relocate evicted actors to the nearest uncrowded cell.
  - **[Task 3.3.3] Deterministic Portal Collision Priority Resolver:** Resolves simultaneous portal crossing contentions using deterministic seed-keyed HMAC ordering.

#### [Feature 3.4] Runtime Spatial Unit Projection

- **Target Git Repository:** `camp-candor/002.worker-sower` (`packages/300.engine`)
  - **[Task 3.4.1] Site Registry Unit Implementation:** Builds `10.location.unit` to manage active room records, portal state machines, and occupant rosters.
  - **[Task 3.4.2] Axial Movement Unit Implementation:** Builds `11.movement.unit` to enforce locomotion gating (doubling cost for limping actors, rejecting moves for immobilized actors).
  - **[Task 3.4.3] Local SQLite Spatial Presence Table Migration:** Implements `migrations/0002_physical_state_core.sql` creating `entities_physical` and `spatial_rooms` in local SQLite.

### [EPIC 4] Environmental Media Asset Foundry

- **Target Git Repositories:** `goblin-assets-visual`, `goblin-assets-3d`, `goblin-assets-audio`, `goblin-dashboard`
- **Scope:** Realizes abstract location tokens (Axis A) into 2D matte plates, 3D low-poly colliders, ambient Foley audio stems, and visual telemetry monitors (Axis B).

#### [Feature 4.1] Two-Dimensional Environment Matte Pipeline

- **Target Git Repository:** `goblin-assets-visual` (`environments/<location_id>/`)
  - **[Task 4.1.1] Background Matte Canvas Plate Generator:** Renders full-resolution painted background plates (`background.png`) based on canonical lighting anchors.
  - **[Task 4.1.2] Foreground Occlusion Alpha Mask Processor:** Bakes foreground structural elements into isolated transparency plates (`occlusion_mask.png`) for character sandwiching.
  - **[Task 4.1.3] Horizon Depth Layer Manifest Stamper:** Emits `manifest.json` defining camera parallax depth planes and horizon eyeline vectors.

#### [Feature 4.2] Three-Dimensional Spatial Stage Collider Subsystem

- **Target Git Repository:** `goblin-assets-3d` (`environments/<location_id>/`)
  - **[Task 4.2.1] Low-Poly Collision Hull Mesh Exporter:** Generates low-poly `.glb` geometry matching the axial hex stage layout for camera obstruction and physics.
  - **[Task 4.2.2] Stage Portal Attachment Socket Configurator:** Bakes named attachment locators (`socket_portal_north`) into the room mesh for doorway alignment.
  - **[Task 4.2.3] Zero-Byte LFS Geometry Integrity Verifier:** Audits promoted 3D environment assets to confirm file sizes exceed 1024 bytes and eliminate pointer stubs.

#### [Feature 4.3] Acoustic Environmental Foley Library

- **Target Git Repository:** `goblin-assets-audio` (`environments/<location_id>/`)
  - **[Task 4.3.1] Room-Tone Loop Audio Stem Packager:** Authors seamless, uncompressed WAV ambient room-tone loops matching declared noise floors.
  - **[Task 4.3.2] Thermal Expansion Foley Sound Generator:** Builds procedural audio libraries of irregular metallic expansion pops, creaks, and water drips.
  - **[Task 4.3.3] Downstream Acoustic Damping Mixer Attenuator:** Supplies partition transmission loss curves ($\text{cdB}$) to automated mix duckers and low-pass filters.

#### [Feature 4.4] Directorial Spatial Telemetry Canvas

- **Target Git Repository:** `goblin-dashboard` (`src/pages/director/`)
  - **[Task 4.4.1] PixiJS HexMapView Visual Debugger Mount:** Embeds the interactive 2D hex grid viewport in `writer.astro` and `spatial.astro`.
  - **[Task 4.4.2] Real-Time Script Blocking Breach Redline Decorator:** Displays dynamic red squiggly underlines under screenplay action lines when characters attempt impossible spatial moves.
