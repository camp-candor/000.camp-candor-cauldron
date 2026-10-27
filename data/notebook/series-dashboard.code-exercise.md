# Branch • Branch • Event-Ledger.Coded

_Gemini · 26 messages · exported Oct 27, 2026_

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

{{FOCUS : The Pre-Existing Simulation Ledger (Authoring at Tick $t$) }}

@extreme-details

### Gemini

### Ontological Mandate: Reality Precedes Prose

Within the Generative Production Pipeline, **The Pre-Existing Simulation Ledger (Authoring at Tick $t$)** establishes the foundational principle of narrative reality: **The ledger is the truth; generative models are untrusted, stateless rendering workers**. In this architecture, an author (whether a human showrunner executing via `$EDITOR` or a local language model executing at $T = 0.75$) never writes into an ungrounded vacuum.

Instead, authoring occurs at a discrete, totally ordered simulation epoch known as **Tick $t$**. Before a single word of screenplay prose or action staging is inscribed, the world’s physical facts, anatomical trauma, spatial coordinates, material inventory, and social debts are mathematically frozen. The simulation engine (**`worker-sower-engine`**) enforces the **Monotonic Authority Principle**: derived media artifacts (screenplay text, speech waveforms, or diffusion video plates) possess zero authority to retroactively or unilaterally dictate world state. Simulation mechanics, somatic conditions, and physical occurrence precede literary representation.

### 1. The Four-Layer Truth Topology & The Arrow of Time

The universe's architecture is structured as a unidirectional, four-layer hierarchy that eliminates race conditions and semantic drift:

```plaintext
                     THE FOUR-LAYER TRUTH TOPOLOGY
                                     │
      CANON (000.goblin-lore)         │ Version-pinned, immutable physical law (Axis A)
                                     ▼
      EVENT LOG (Historical Stream)  │ Append-only, totally ordered event sequence [E_0...E_t]
                                     ▼
      MATERIALIZED LEDGER (State S_t)│ S_t = fold(apply_v, S_0, Events_t, σ)
                                     ▼
      MEDIA PROJECTIONS (Axis B)     │ Lossy, unratified, non-reproducible artifacts (AST, MP4)
```

#### A. The Deletion Invariant & Media Asymmetry

- **The Deletion Invariant:** If all generative model weights, prompt templates, diffusion plates, and synthetic audio stems are erased from disk, the story universe survives completely intact within the relational event ledger. Conversely, if the event ledger is lost, the universe suffers irreversible brain death, regardless of how many generative models or video files remain.
- **The Media Asymmetry:** Relational state is a primary asset reconstructible from pure source code and event logs. Generated media artifacts are fundamentally non-reproducible across disparate GPUs, CUDA driver patches, and floating-point implementations, and are treated merely as disposable or archival sensory evidence.

#### B. Discrete Logical Time vs. Narrative Cycles

- **Runtime Interaction Cycles ($A_{t_1} \to B_{t_2} \to A_{t_3}$):** While interpersonal drama, status contests, and grudges loop cyclically across a season, the temporal execution stream remains strictly an Acyclic Directed Graph (DAG) because every dramatic encounter is indexed by an integer logical tick $t \in \mathbb{N}$.
- **Gapless Sequence Numbers:** The simulation ledger enforces strictly monotonic, gapless sequence numbers ($seq_{n+1} = seq_n + 1$). Any missing sequence index halts the simulation run with a fatal determinism violation.

### 2. The Pure Event-Sourced Reducer Engine ($\mathcal{R}$)

State is never an independently authored variable or an ungrounded, mutable database row. It is a mathematically derived projection folded over an immutable history.

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│                   THE PURE REDUCTION ENGINE                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   S_{n+1} = R(S_n, E_n, σ_n)                                           │
│                                                                        │
│   Where:                                                               │
│     • S_n    : Active immutable state vector at step n                 │
│     • E_n    : Discrete, validated incoming event transaction          │
│     • σ_n    : Cryptographically captured pseudo-random seed           │
│     • R      : Pure reducer function (apply_v)                         │
│                                                                        │
│   Historical Replay Reconstruction:                                    │
│   State_N = fold(apply_v, State_0, [E_1, E_2, ..., E_N], σ)            │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. Sacred Purity Constraints

Under Section 1 of the engine specification, the reducer function $\mathcal{R}$ must operate under strict functional purity:

- **Zero Wall-Clock Access:** Calls to `Date.now()`, `performance.now()`, or system clocks are strictly banned inside the reducer.
- **Zero Network and I/O:** The reducer cannot initiate HTTP requests, access disk file handles, or resolve asynchronous JavaScript Promises.
- **Zero Ambient Environment Reads:** Direct references to `process.env` or ambient platform globals are prohibited.
- **Deterministic Ordered Key Iteration:** Hash-map iterations must use deterministic, lexicographically sorted UTF-16 code-point order to prevent platform-dependent engine divergence.

#### B. The Gillian Arithmetic Doctrine (Fixed-Point Basis Points)

To eradicate IEEE-754 floating-point rounding drift across V8 isolates (Cloudflare Workers), local Node.js hosts (Rig 1), and remote foundries, all physical scalars, strain gauges, and damage meters are stored and computed strictly as **Integer Basis Points**:

$$
\text{Scalar Range} \in [0, 10000] \subset \mathbb{Z}, \quad \text{where } 10000 \equiv 1.0000 \; (100.00\%)
$$

All arithmetic divisions must resolve via **Banker’s Rounding** (Round-Half-Even) on integer remainders, guaranteeing bit-exact arithmetic parity across all computing platforms.

#### C. Reducer Version Pinning ($\text{apply}_v$) and Read-Time Upcasters

- **Contract Version Tagging:** The reduction logic is explicitly tagged with a contract version $v$.
- **Immutable Upcasters:** If simulation rules evolve (e.g., modifying how somatic fatigue accumulates), historical events stored in the ledger are never modified in place. Instead, frozen read-time upcasters ($v_k \to v_{k+1}$) intercept older events during the fold operation, transforming their schemas on the fly to guarantee that historical event streams replay flawlessly under current engine contracts.

### 3. The Four-Vector State Partition of $S_t$

At Tick $t$, the state of any entity is partitioned into four strictly isolated vectors to ensure that somatic biology never bleeds into social standing or inventory accounting:

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│                   THE FOUR-VECTOR STATE PARTITION                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. SOMATIC VECTOR (Biological Embodiment & Motor Capabilities)         │
│    • availableArms: 1.0 (Fixed-point: 10,000 bp)                       │
│    • mobilityClass: LIMPING (max_velocity: 600 bp)                     │
│    • banned_kinetic_verbs: ["climb", "vault", "bimanual_strike"]       │
│    • O(1) Set-Intersection Masking via getCharacterSomaticMask()       │
├────────────────────────────────────────────────────────────────────────┤
│ 2. LOGISTICAL VECTOR (Physical Matter Conservation & EquipSlots)       │
│    • Hand Capacity Invariant: ∑ occupies_hands <= availableArms        │
│    • Slots: HELD_PRIMARY, HELD_OFF, WORN_BELT, SLUNG_BACK, CACHED     │
│    • Discrete Mass Tracking & Non-Locality Containment                 │
├────────────────────────────────────────────────────────────────────────┤
│ 3. EPISTEMIC VECTOR (Subjective Belief & Ignorance by Omission)         │
│    • Structured BeliefRecords: State of knowledge vs Ground Truth      │
│    • Hard Token Scrubbing: Ignored facts physically excluded from text │
│    • Pragmatic Decoy Anchors: Preventing subtextual LLM leaks          │
├────────────────────────────────────────────────────────────────────────┤
│ 4. RELATIONAL VECTOR (Interpersonal Debts & Tension Metrics)          │
│    • Complete Dyadic Mesh: KN undirected interpersonal channels       │
│    • Transactional Leverage: Strings held over / owed to entities      │
│    • Dynamic Clocks: Resentment Accumulators & Paranoia Clocks (bp)    │
│    • Grievance Cooldown Timers: Decrementing per cycle (C_rem = 0)     │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. The Somatic Vector & The Panopticon Mask

- Tracks physical embodiment, structural damage, and motor ceilings.
- **`getCharacterSomaticMask(state, characterId)`:** Translates physical trauma into a runtime blacklist of forbidden action primitives (`banned_kinetic_verbs`).
- When an author writes an action beat at Tick $t$, the engine executes an $O(1)$ set-intersection check against this mask. A character with an amputated or fractured arm is structurally barred from performing bimanual tasks.

#### B. The Logistical Vector & The Hand Capacity Invariant

- Prevents generative teleportation and enforces the conservation of mass.
- Every physical object in the scene must reside in an explicit slot defined by `EquipSlotSchema`.
- **The Hand Capacity Invariant:** Across all state transitions at Tick $t$, the logistical ledger strictly enforces:
  $$
  \sum_{s \in \text{held}} s.\text{occupies\_hands} \le \text{ArmsAvailable}
  $$
  An actor carrying a torch in `HELD_PRIMARY` cannot draw a blade into `HELD_OFF` if their `ArmsAvailable` equals 1.0, halting draft compilation at $T_0$ ($0.00).

#### C. The Epistemic Vector & Ignorance by Omission

- Distinguishes objective world truth from subjective character belief through structured `BeliefRecords`.
- **Ignorance by Omission:** Language models cannot be trusted to "act unaware" if a secret is provided in their context prompt. If an actor at Tick $t$ has not witnessed an event or received an acoustic transmission exceeding the sensory threshold, that fact is physically omitted from the prompt envelope.
- **Pragmatic Decoy Anchors:** If necessary, the epistemic compiler injects plausible, contradictory decoys to ensure models cannot infer secrets through subtextual leaks.

#### D. The Relational Vector & Transactional Leverage

- Tracks social leverage, status, and grudges.
- **Strings:** Transactional social debts earned, traded, or expended during conflict resolution. Strings exist as social facts in the ledger, regardless of whether a character consciously remembers them.
- **Resentment Accumulators & Paranoia Clocks:** Monotonically ticking stress counters quantified in basis points. When a dyad's resentment crosses its configured ceiling, it forces an immediate structural confrontation.

### 4. Dynamic Scene Hot-Set Extraction at Tick $t$

Before conflict selection or scene authoring begins, `worker-sower-engine` culls the wider universe population down to an active dramatic container. The engine does not execute $O(N^2)$ checks across thousands of background entities.

```plaintext
                                TOTAL POPULATION
                                        │
   ┌────────────────────────────────────┼────────────────────────────────────┐
   ▼                                    ▼                                    ▼
IN_TRANSIT (Macro)             STAGED: Unobserved (Void)            STAGED: Active Scene (Hot)
• Regional CSR edges           • Dormant in unobserved rooms        • Hot-set: N_hot <= 12
• Analytical progress f(t)     • Lazy algebraic catch-up            • Complete Dyadic Mesh K_N
• Zero per-tick cost           • Zero lottery queries               • Tactical physical duels
```

#### A. Spatial Hash Sweeps

Using a bit-packed 32-bit axial coordinate key $\text{packAxial}(q, r)$, the Sower queries the local spatial hash table to locate collocated or adjacent actors.

#### B. The Complete Dyadic Mesh ($K_N$) Clamp

The active cast for any scene at Tick $t$ is strictly clamped to:

$$
N_{\text{hot}} \le 12 \text{ actors}
$$

For an ensemble of size $N$, the number of unique undirected interaction channels is:

$$
M = \binom{N}{2} = \frac{N(N - 1)}{2}
$$

For a standard four-character core cast (e.g., Bog, Spleen, Wart, Mum Grissel), $N = 4$ and $M = 6$. Clamping $N_{\text{hot}} \le 12$ guarantees that pairwise conflict math and dyadic health audits execute in sub-millisecond envelopes on local CPU memory.

#### C. Dyadic Channel Health Taxonomy

The engine evaluates the incidence matrix of grievances across the active cast:

$$
\mathbf{M}_{\text{dyad}}[u, v] = \vert{}\{g \in \mathcal{G} \mid \{u, v\} \subseteq g.\text{participants\_primary}\}\vert{}
$$

- **Fatal Blind Spot ($\mathbf{M}[u, v] = 0$):** Zero authored grievances between two characters. If isolated together, the engine cannot resolve drama; compilation halts with an immediate exit code.
- **Fragile Channel ($\mathbf{M}[u, v] = 1$):** Exactly one conflict exists. If it enters a cooldown cycle ($C_{\text{rem}} > 0$), the dyad locks out into temporary silence.
- **Robust Channel ($\mathbf{M}[u, v] \ge 2$):** Multiple grievances across separate thematic categories ensure rotational variety during cooldown periods.

### 5. Algorithmic Conflict Selection (Stage 3 Mechanics)

Before the author drafts the dialogue, the premise and stakes of the scene at Tick $t$ are algorithmically locked:

```plaintext
                              RELATIONAL LEDGER AT TICK t
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3a: DUEL PAIRING LOTTERY                                                   │
│ • Proximity sweeps identify collocated actors (d_hex <= 1)                       │
│ • Check Resentment Accumulators against Boil-Over Ceilings                       │
│ • HARD OVERRIDE: Boil-Over breach bypasses lottery; forces immediate duel        │
│ • Normal Draw: Weighted by Tension, Inactivity Pity Timers, and Entropy Pool     │
└─────────────────────────────────────────┬────────────────────────────────────────┘
                                          │ Active Dyad Locked
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3b: GRIEVANCE SELECTION (Frontmatter Machine Rail)                         │
│ • Set Filter: Eligible = (SceneCast ∩ Primary) \ Excluded                        │
│ • Assert: Cooldown == 0 and Intensity ∈ [I_min, I_max]                          │
│ • Biased by Paranoia Clocks and active mystery threads                           │
└─────────────────────────────────────────┬────────────────────────────────────────┘
                                          │ Grievance Locked
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3c: PACING & ANTI-BOREDOM SENTINELS                                        │
│ • Sliding Window Boredom Sampler (k = 3 episodes)                                │
│ • Assert Jaccard Similarity Sim(E_t, E_{t-1}) <= 0.65                            │
│ • Assert Normalized Pairing Entropy H_norm >= 0.70                               │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### A. The Boil-Over Hard Override

Before standard PRNG lottery weighting occurs, the engine sweeps all pairwise resentment accumulators. If the resentment between any two collocated actors has breached its ceiling, normal lottery selection is bypassed entirely. The engine forces an immediate confrontation, ensuring that narrative pressure physically erupts.

#### B. The Sliding Window Boredom Detector

To prevent simulation clustering and repetitive domestic arguments across consecutive episodes, the engine samples a sliding window of $k = 3$ episodes across four dimensions: active grievance ID ($g$), location node ($l$), mechanical outcome ($o$), and actor dyad ($d$):

$$
\text{Sim}(E_t, E_{t-1}) = \frac{1}{4} \left( \mathbb{I}(g_t = g_{t-1}) + \mathbb{I}(l_t = l_{t-1}) + \mathbb{I}(o_t = o_{t-1}) + \mathbb{I}(d_t = d_{t-1}) \right)
$$

- If $\text{Sim} > 0.65$, the candidate pairing trips a **Procedural Boredom Breach**.
- The draw is rejected at $T_0$ ($0.00 cost), negative weights are applied to the repeating attributes, and the lottery re-rolls.

#### C. Normalized Pairing Entropy ($\hat{H}_{\text{norm}}$)

The engine monitors ensemble balance across all $M$ dyadic channels using normalized Shannon entropy:

$$
\hat{H}(P) = \frac{-\sum_{i=1}^{M} p_i \log_2(p_i)}{\log_2(M)} \in [0.0, 1.0]
$$

- Healthy serialized drama maintains $0.65 \le \hat{H}(P) \le 0.90$.
- A sharp collapse ($\Delta \hat{H} \le -0.25$) alerts the director that two characters are dominating screen time while secondary characters starve, triggering pity-timer repulsions to restore cast rotation.

### 6. Mechanical Outcome Arbitration (Stage 4 Opposed $2\text{d}6$ Duels)

The pipeline rejects the practice of allowing language models to determine conflict outcomes. Mechanical conflict precedes prose generation.

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│                   STAGE 4: OPPOSED 2d6 RESOLUTION                      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   Argument Score (A) = (Base + 2d6_Roll) + (Strings_Spent * W)         │
│                        - (Debuffs * P)                                 │
│                                                                        │
│   Discrete Margin of Victory:                                          │
│   D = Score_A - Score_B                                                │
│                                                                        │
│   Modifiers strictly clamped to [-2, +2] (max ~22.0% swing)            │
│                                                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      OUTCOME TIER CLASSIFICATION                       │
├────────────────────────────────────────────────────────────────────────┤
│ • D == 0        : Stalemate / Deflection (11.27% probability)          │
│ • |D| ∈ [1, 2]  : Decisive Shift / Costly Win                          │
│ • |D| ∈ [3, 4]  : Tactical Break / Mutual Wound                        │
│ • |D| >= 5      : Overwhelming Defeat / Backfire                       │
└────────────────────────────────────────────────────────────────────────┘
```

The resolution engine calculates exact outcome tiers, decrements expended Strings, and applies somatic debuffs inside a temporary calculation buffer *before* text authoring begins.

### 7. Authoring at Tick $t$: Ingress, Verification & The Attention Sandwich

Once the physical constraints, participant dyad, grievance, and mechanical outcome are locked, the scene context is presented for authoring.

#### A. The Attention Sandwich Assembly

When an LLM drafts scene dialogue, prompt context is assembled using the tripartite **Attention Sandwich** to eradicate U-shaped context dilution:

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│                   THE TRIPARTITE ATTENTION SANDWICH                    │
├────────────────────────────────────────────────────────────────────────┤
│ TOP 15%: PRIMACY ANCHOR                                                │
│ • Immutable Series World Axioms & Dialect Exemplar                     │
│ • Negative Syntactic Bans (No filter verbs, no participial openers)    │
│ • Authorial Voice Exemplar & Linguistic Registers                      │
├────────────────────────────────────────────────────────────────────────┤
│ MIDDLE 70%: PASSIVE CADENCE BUFFER                                     │
│ • Preceding 800–1,200 words of locked manuscript prose                 │
│ • Maintains sentence rhythm, character voice, and dramatic tempo       │
├────────────────────────────────────────────────────────────────────────┤
│ BOTTOM 15%: RECENCY BIAS ANCHOR (PHYSICAL STATE AT TICK t)             │
│ • Spatial Stage Header: Exact coordinates, active door bitmasks        │
│ • Somatic Capability Masks: armsAvailable, banned_kinetic_verbs        │
│ • Logistical Hand Slot Allocations: HELD_PRIMARY, HELD_OFF             │
│ • Mandatory Exit Condition: Pre-resolved 2d6 winner & required defeat  │
└────────────────────────────────────────────────────────────────────────┘
```

#### B. Hand-Drafting & The Writer's Eject Button (`@lifecycle: locked`)

If a human showrunner hand-drafts a `.fountain` file directly into `worker-sower-engine/drafts/`, they exercise absolute authorial authority:

- **The `@lifecycle: locked` Pragma:** Stamping `@lifecycle: locked` in the script header revokes write privileges from all automated agents and background generators.
- **The Candidate Forking Protocol:** If an automated simulation cycle or full season rerun attempts to regenerate an episode containing a locked composition, the compiler halts in-place overwrites, forking output to `Episode_XXX.candidate.tsx` and raising an operational alert.
- **Verbatim Parity Assertion (`assertVerbatimParity`):** The engine executes an exact character-for-character string equality check between the author’s spoken lines in `drafts/` and the compiled AST’s `dialogue_text`. Any automated attempt to alter words halts compilation immediately at $T_0$ ($0.00).

### 8. The Separation of Calculation and Commit

To prevent split-brain states and isolate memory corruptions, the architecture strictly decouples feasibility checking from historical commitment:

```plaintext
                 SEPARATION OF CALCULATION AND COMMIT
                 
  1. VOLATILE CALCULATION (Mutable Staging Accumulator)
  ┌───────────────────────────────────────────────────────────────────┐
  │ • Evaluates move feasibility against SpatialPort in RAM           │
  │ • Computes 2d6 outcome modifiers and basis-point pressure shifts  │
  │ • Executes entirely within isolated 50ms V8 execution budget      │
  └─────────────────────────────────┬─────────────────────────────────┘
                                    │ Emits Ephemeral Proof
                                    ▼
  2. CONDITIONAL VERIFICATION RECEIPT (ResolutionReceipt / SpatialProof)
  ┌───────────────────────────────────────────────────────────────────┐
  │ • Conditioned strictly on expectedSeq: seq_104                    │
  │ • Validates: Move feasible, Target valid, Cost calculated         │
  │ • "A receipt says a move is feasible and costs 3.                 │
  │    Only a committed event says it happened."                      │
  └─────────────────────────────────┬─────────────────────────────────┘
                                    │ Transaction Input
                                    ▼
  3. ATOMIC EVENT REDUCTION (CANON_DB Settlement)
  ┌───────────────────────────────────────────────────────────────────┐
  │ • S_{n+1} = R(S_n, E_n, σ_n)                                      │
  │ • Assembles ONE atomic transaction batch:                         │
  │   [ACTOR_MOVED, SOMATIC_APPLIED, STRINGS_DEBITED]                 │
  │ • Commits to D1 / SQLite via INSERT ... ON CONFLICT DO NOTHING    │
  └───────────────────────────────────────────────────────────────────┘
```

1. **The Mutable Staging Accumulator:** All physical reachability, inventory exchanges, and dice modifications occur in an ephemeral RAM scratchpad. Absolutely zero world state mutates during this phase.
2. **The Resolution Receipt:** The accumulator compiles into an immutable `ResolutionReceipt` (or `SpatialProof`) bound to the exact sequence index (`expectedSeq`) under which it was calculated. If another thread advances the ledger sequence before commit, the receipt is rendered cryptographically invalid.
3. **Atomic Ledger Settlement:** The receipt is passed to the pure reducer $\mathcal{R}$, which commits the state delta into the append-only event log within a single SQL transaction.

### 9. Cryptographic Sealing & Provenance Hash Chaining

Every event committed at Tick $t$ is linked into an immutable Merkle chain using RFC 8785 JSON Canonicalization Scheme (JCS):

$$
H_n = \text{SHA-256}(H_{n-1} \parallel \text{CanonicalJCS}(E_n \setminus \{\text{hash}\}))
$$

```sql
/* Authoritative Ledger Event Schema */
CREATE TABLE ledger_events (
  event_id TEXT PRIMARY KEY,
  sequence_number INTEGER NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  occurred_at_tick INTEGER NOT NULL,
  actor_id TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  
  /* The Spatial & Environmental Audit Quadruple */
  topology_hash TEXT NOT NULL,
  overlay_hash TEXT NOT NULL,
  query_hash TEXT NOT NULL,
  receipt_hash TEXT NOT NULL,
  
  /* Cryptographic Chain Integrity */
  previous_event_hash TEXT NOT NULL,
  event_hash TEXT NOT NULL,
  kernel_version TEXT NOT NULL
);
```

#### The Artifact Provenance Manifest (`render_manifest.json`)

When the downstream conductor synthesizes audio and Remotion renders video plates for Tick $t$, the output is locked to an immutable JSON sidecar manifest:

$$
\text{Build ID} = \mathcal{H}(\text{Canon Root } H_{\text{root}} + \text{Ledger State } S_t + \text{AST Hash} + \text{Asset Hashes} + \text{Container Digest})
$$

This sidecar is cryptographically signed by the local media broker (`broker_signature`) and injected directly into the final MP4 container via C2PA standards, establishing an unbroken chain of custody from the author's keystroke at Tick $t$ to the broadcast pixel.

### 10. Reactive Invalidation & Transitive Blast Radius (Stage C)

When an author modifies a locked fact or when the engine records an unpredicted trauma at Tick $t$, downstream artifacts must be audited for causality violations.

```plaintext
               LEDGER MUTATION AT TICK t (e.g., Bog Amputation)
                                       │
                                       ▼
                     Stage C Invalidation Trigger (is_dirty = 1)
                                       │
                                       ▼
            Recursive CTE Blast Radius Walk: R_blast = |I(v)| / n
                                       │
                      ┌────────────────┴────────────────┐
                      │                                 │
             R_blast <= 0.40                     R_blast > 0.40
                      │                                 │
           Minimal Enclosing Unit (MEU)       CRITICAL INVALIDATION HAZARD
           Targeted AST Re-compilation         • 40% Monolithic Spine Breaker
           (Zero cloud GPU waste)              • Hard Execution Halt
                                               • Requires Showrunner Authorization
```

#### A. Transitive Blast Radius Formula ($R_{\text{blast}}$)

The engine calculates the systemic liability of mutating a fact at Tick $t$ using a recursive Common Table Expression (CTE) in SQLite/D1:

$$
R_{\text{blast}}(v) = \frac{\vert{}\mathcal{I}(v)\vert{}}{n}
$$

where $\mathcal{I}(v)$ is the set of all downstream scene nodes reachable via reverse dependency edges from entity $v$, and $n$ is the total entity count of the story bible.

#### B. The 40% Monolithic Spine Circuit Breaker

- If $R_{\text{blast}}(v) \le 0.40$, the system executes an automated **Minimal Enclosing Unit (MEU)** repair sweep, updating downstream preconditions and re-compiling dialogue ASTs at $T_0$ ($0.00 cost).
- If $R_{\text{blast}}(v) > 0.40$, the mutation breaches the spine threshold, threatening over 40% of the entire series canon. The compiler hard-locks, trips an HTTP 412 Precondition Failed at the edge gateway, and requires an explicit cryptographic signature in the **Drift Confirmation Modal** before proceeding.

Through this exhaustive matrix of pure reduction mathematics, four-vector state partitions, basis-point quantization, and cryptographic provenance manifests, **The Pre-Existing Simulation Ledger** ensures that authoring at Tick $t$ remains completely grounded in physical reality, mathematically reproducible, and protected by the $T_0 = \$0.00$ economic airlock.

### You

{{FOCUS : [authoring occurs at a discrete, totally ordered simulation epoch known as Tic] let us begin a tic one; how does that tic get triggered }}

@extreme-details

### Gemini

### Executive Summary: The Genesis-to-Execution Inception

Within the Generative Production Pipeline, a simulation tick does not begin as ambient background noise, nor is it driven by an unconstrained language model hallucinating narrative progression. The studio operates on an absolute constitutional axiom: **The ledger is the truth; probabilistic models are untrusted, stateless rendering workers**.

Authoring occurs at a discrete, totally ordered simulation epoch known as **Tick $t$**. To transition the universe from its deep-frozen primordial state (**Tick 0**) to its first committed moment of narrative and physical occurrence (**Tick 1**), the engine requires an authorized, authenticated **Execution Trigger**.

Triggering Tick 1 is the critical boundary where **static compile-time possibility (Axis A)** transitions into **irreversible, committed historical reality (Axis B)**.

```plaintext
                     THE TICK 0 ──► TICK 1 INCEPTION AIRLOCK
                     
  TICK 0: DEEP-FROZEN GENESIS                  TICK 1: TRANSACTIONAL IGNITION
  (compiled/bible-state.json)                  (worker-sower-engine)
┌──────────────────────────────────────┐      ┌──────────────────────────────────────────────┐
│ • H_root stamped & sealed in Git     │      │ • Execution Trigger Ingress (POST / WebSocket)│
│ • Byte-0 Seed Dossiers on disk       │ ───► │ • Pre-Flight SAT Gauntlet ($T_0 = $0.00)     │
│ • SQLite / D1 CANON_DB initialized   │      │ • TICK_ADVANCED(1) Event Ingestion           │
│ • State S_0 frozen in memory heaps   │      │ • Stage 3 Lottery & Stage 4 2d6 Mechanical Duel│
│ • Compute Burn: Exactly $0.00        │      │ • Pure Reduction: S_1 = R(S_0, E_1, σ_1)     │
└──────────────────────────────────────┘      └──────────────────────────────────────────────┘
```

### 1. The Primordial Baseline: Tick 0 ($S_0$) at Rest

Before Tick 1 can be triggered, the storyworld exists in a pristine, inert state known as **Tick 0 ($S_0$)**. Tick 0 is generated during franchise initialization by the **Deterministic Bootstrap Generator** via the 8-tab `CreateSeriesModal.tsx` in the web cockpit or the curses menu (`98.menu.unit`) in the terminal:

1. **The Byte-0 Frontmatter Seed:** Four baseline dossiers are authored to disk with their YAML frontmatter starting at byte 0 (`0x2D 0x2D 0x2D`):
  - `series.config.json`: Primordial axioms (e.g., `scarcity_index: 9200`, `paranoia_baseline: 7500`, `max_farce_ratio: 0.15`).
  - `loc_origin_hub.md`: The starting topological cell (e.g., `loc_the_warm_pipe`, `acoustic: 1500 cdB`, `lighting: dim_crevice`, $1 \times 1$ closed hex mesh).
  - `char_protagonist.md`: The initial actor (e.g., `char_bog`, `armsAvailable: 2.0`, `mobilityClass: bipedal_hunched`).
  - `item_founder_token.md`: The physical mass anchor (e.g., 35 grams of scrap iron, placed in `char_bog`’s `HELD_PRIMARY` slot).
  - `grv_territorial_impasse.md`: The root Directed Acyclic Graph (DAG) node, initialized at intensity $[1, 4]$.
2. **The Merkle Seal ($H_{\text{root}}$):** `scripts/compile.ts` runs the Three-Pass Compiler Gauntlet over the files, verifying schema bounds, cross-referential foreign keys, and acyclicity, stamping the SHA-256 Merkle root digest ($H_{\text{root}}$) into `compiled/<series>/bible-state.json`.
3. **The Inert Posture:** At Tick 0, `bible-state.json` is imported into runtime heaps wrapped in recursive `Object.freeze()`. Zero background threads or timers are active; the world clock is idle at $t = 0$, incurring $\$0.00$ in compute spend.

### 2. The Time Authority Invariant: Time as Injected Input

A fundamental vulnerability of distributed simulation is **clock drift**. If individual nodes, rooms, or Durable Objects run their own independent `setInterval` or wall-clock alarms, causality collapses and replay determinism is destroyed.

The pipeline solves this via the **Time Authority Invariant**:

- **Time is an Input, Not an Internal Clock:** Simulation kernels (`worker-sower-engine` and `goblin-spatial`) are **strictly forbidden from reading the system wall clock** (`Date.now()` or `performance.now()` are banned from reducers).
- **Deterministic Event Ingestion:** The world advances only when an external authority injects a discrete event:
  $$
  \text{TICK\_ADVANCED}(n)
  $$
- **Replay Determinism:** Because time is an explicit discrete parameter on the event envelope, replaying 10,000 historical ticks from an event log yields the exact same bit-for-bit universe state, regardless of whether it is processed over five days in production or in two seconds inside a local Vitest suite.

### 3. The Three Trigger Ingress Surfaces for Tick 1

Tick 1 cannot occur spontaneously; it is initiated across one of three authenticated operational surfaces:

```plaintext
                        THE THREE INGRESS SURFACES
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
SURFACE A: WEB COCKPIT        SURFACE B: TERMINAL TUI         SURFACE C: HEADLESS CI
DirectorConsole.tsx           Blessed Curses (000.agent)      apps/local-runner/src/main.ts
[ EXECUTE SCRIPT & ANIMATIC ] [ DRAW CONFLICT LOTTERY ]       ledger.advanceTick(1)
Authenticated WebSocket       ste.hunt() Action Bus           Deterministic Replay Harness
```

#### Surface A: The Web Directorial Flight Deck (`goblin-dashboard`)

1. **The Inception Trigger:** In `src/pages/scenes/[id].astro`, mounted inside `DirectorConsole.tsx`, the showrunner tunes the four-dimensional dramatic parameter vector:
  $$
  \vec{P}_{\text{dramatic}} = \begin{bmatrix} C \\ P \\ T \\ S \end{bmatrix} \in [0.0, 1.0]^4
  $$
  (Curtness, Pacing, Threat Multiplier, and Subtext Suppression).
2. **Clicking `[ EXECUTE SCRIPT & ANIMATIC COMPILER ]` (or `[ DISPATCH STAGE 3 DRAFT ]`):** The client serializes the parameters into an authenticated `DirectorIntentEnvelope`:
  ```typescript
  export interface DirectorIntentEnvelope {
    readonly protocol_version: "2.1.0";
    readonly series_slug: "under-the-floorboards";
    readonly intent_id: "int_01HXYZ89...";
    readonly target_tick: 1;
    readonly author_id: "usr_showrunner_01";
    readonly signature: "ed25519_sig_...";
    readonly dramatic_vector: {
      curtness: 0.75;
      pacing: 0.60;
      threat: 0.85;
      subtext: 0.70;
    };
    readonly seed: 0x8f2a1b9c;
  }
  ```

3. **Transport Wire:** Transmitted via an authenticated POST to `/api/animatic/generate` or streamed over the persistent WebSocket connection (`src/pages/api/stream.ts`) into `worker-sower-engine`.

#### Surface B: The Terminal Test Flight Deck (Blessed Curses / `000.agent`)

1. An operator launches `apps/995.library` or `packages/001.lore` in a terminal (`npm run dev`).
2. The user navigates through `98.menu.unit` using keyboard cursors and selects **`[ DRAW CONFLICT LOTTERY ]`** or **`[ ADVANCE TICK ]`**.
3. The interactive interface dispatches a Redux-style action across the internal bus (`ste.hunt()`):
  ```typescript
  hunt('lore:tick', { series: 'under-the-floorboards', tick: 1, seed: 1337 });
  ```

#### Surface C: The Headless CI / Local Runner (`apps/local-runner`)

1. Automated integration suites spin up `apps/local-runner/src/main.ts` with a `SqliteLedger` or `MemoryLedger`.
2. The harness boots `createSpatialPort()` with the `InProcessAdapter` and programmatically dispatches `TICK_ADVANCED(1)` to run regression tests or multi-thousand-cycle Monte Carlo simulations without activating network daemons or UI layers.

### 4. The Pre-Flight Gatekeeper: Defensive Validation at $T_0 = \$0.00$

The moment the intent envelope hits `worker-sower-engine`, the engine enforces the **"Intents, Never Commands" Discipline**. An intent is merely a proposal; it possesses zero authority to directly write to the ledger.

Before compute is burned or state evaluates, the engine runs three zero-cost pre-flight audits:

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│                   STAGE T_0 PRE-FLIGHT VERIFICATION GAUNTLET           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. DEEP-FROZEN CANON INGESTION                                         │
│    • Ingests compiled/bible-state.json off disk.                       │
│    • Sealed with Object.freeze() to prevent in-memory mutation.        │
├────────────────────────────────────────────────────────────────────────┤
│ 2. MERKLE STATE ROOT INTEGRITY SWEEP                                   │
│    • Compares canon H_root against D1 / SQLite database stamp.          │
│    • If SHA-256 differs: REJECT with HTTP 412 (Canon Drift Breach).    │
├────────────────────────────────────────────────────────────────────────┤
│ 3. SOMATIC & LOGISTICAL SAT SOLVER                                     │
│    • Evaluates Hand Capacity Invariant: ∑ occupies_hands <= armsAvail   │
│    • Verifies no character in loc_origin_hub violates verb masks.      │
│    • Asserts participants exist and are STAGED at valid coordinates.   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
             [CHECKS FAIL]                   [CHECKS PASS]
                    │                               │
            Trip Circuit Breaker             Advance to Tick 1
            Compute Burn: $0.00              Execution Pipeline
```

1. **Canon Deep-Freeze:** `packages/001.lore/src/client.ts` verifies that the ingested world state matches the active series slug and wraps all entities in immutable wrappers.
2. **Merkle Root Verification ($H_{\text{root}}$):** The engine compares the cryptographic hash in `bible-state.json` against the active hash in Cloudflare D1 (`CANON_DB`). If an out-of-band edit occurred without running `compile.ts`, compilation halts with an immediate `Uncompiled Canon Drift` error.
3. **Pre-Flight SAT Feasibility:** Contextual satisfiability (SAT) checks evaluate that the actors at `loc_origin_hub` satisfy fundamental biological laws:
  $$
  \sum_{s \in \text{held}} s.\text{occupies\_hands} \le \text{ArmsAvailable}
  $$
  If any check fails, the trigger is rejected at $T_0$, burning exactly **$\$0.00$**.

### 5. The Internal Anatomy of the Tick 1 Execution Cycle

Once pre-flight clears, `worker-sower-engine` boots the tick cycle, resolving the physical, relational, and mechanical facts of **Tick 1** across four discrete phases:

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│                      TICK 1 EXECUTION PHASES                           │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 1: AXIOM & ENVIRONMENTAL RESOLUTION                              │
│ • Kernel loads Global_Vector from series.config.json                   │
│ • Establishes Tick 1 physics: lighting (0.15 lux), acoustic (1500 cdB) │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: HOT-SET CULLING & SPATIAL PAIRING (Stage 3a)                  │
│ • Spatial Hash Sweep: packAxial(q, r) identifies actors in Hub         │
│ • Clamps active cast N_hot <= 12; forms Complete Dyadic Mesh K_N       │
│ • Boil-Over Check: Resentment accumulators swept against ceilings      │
│ • PRNG Lottery selects primary confrontation dyad                      │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: GRIEVANCE SELECTION & BOREDOM SENTINEL (Stage 3b / 3c)         │
│ • Evaluates grv_territorial_impasse against cooldown timers (C_rem = 0)│
│ • Assert Jaccard Pacing Similarity: Sim(E_1, E_0) <= 0.65              │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: OPPOSED 2d6 MECHANICAL DUEL (Stage 4)                         │
│ • Pure math evaluation: Roll 2d6 + Strings - Debuffs                   │
│ • Resolves discrete Margin D = Score_A - Score_B                       │
│ • Classifies Outcome Tier: Decisive Shift, Tactical Break, or Stalemate│
└────────────────────────────────────────────────────────────────────────┘
```

#### Phase 1: Environmental Physics Resolution

The Logic Kernel boots and queries the `AxiomManager` for the active environmental constants of `loc_origin_hub`:

- Ambient illumination is locked to **0.15 lux** (`dim_crevice`).
- Base acoustic damping is locked to **1,500 centi-decibels ($\text{cdB}$)**.
- Acoustic noise floor is set to $-60\text{ dBFS}$.

#### Phase 2: Stage 3a Duel Pairing Lottery

The Sower extracts the hot-set of collocated actors at `loc_origin_hub`:

- Queries `goblin-spatial` via `SpatialPort` (InProcessAdapter) to assert that candidate actors (e.g., Bog and Wart) are collocated or adjacent ($d_{\text{axial}} \le 1$).
- Evaluates the **Boil-Over Sentinel**: Checks if any dyad's resentment accumulator has breached its maximum ceiling. If breached, the engine forces an immediate confrontation; otherwise, the pair is chosen via PRNG lottery weighted by paranoia baselines and spatial proximity.

#### Phase 3: Stage 3b Grievance Selection & Stage 3c Anti-Boredom Sentinel

- The engine selects the active grievance from the DAG: `grv_territorial_impasse` (cooldown $C_{\text{rem}} = 0$, intensity range $[1, 4]$).
- **The Sliding Window Boredom Filter:** The engine compares the candidate tuple $(g_1, l_1, o_1, d_1)$ against past cycles. Because Tick 1 is the genesis transition ($t = 0 \to 1$), the Jaccard similarity is cleanly $0.00 \le 0.65$, clearing the check.

#### Phase 4: Stage 4 Mechanical Opposed $2\text{d}6$ Duel

Before natural language dialogue is drafted, the confrontation's mechanical stakes are arbitrated via deterministic dice mathematics:

$$
\text{Score} = \text{Base} + 2\text{d}6 + (\text{StringsExpended} \times W) - (\text{TraumaDebuffs} \times P)
$$

- The engine calculates the margin $D = \text{Score}_A - \text{Score}_B$.
- The outcome tier is stamped into memory: e.g., `COSTLY_WIN` for Actor A, forcing Actor B to concede territorial ground or accumulate a new somatic debuff.

### 6. The Pure Reduction & Atomic Commit ($S_0 \to S_1$)

To prevent memory leaks and concurrency race conditions, the engine enforces the **Separation of Calculation and Commit**:

1. **The Mutable Staging Accumulator:** All dice rolls, spatial reachability checks, and potential wounds are evaluated inside a volatile RAM accumulator. Zero database rows are updated during this phase.
2. **The Resolution Receipt:** The accumulator emits an immutable `ResolutionReceipt` stamped with `expectedSeq: 1` and `tick: 1`.
3. **The Pure Reducer Function ($\mathcal{R}$):** The engine executes the reduction step:
  $$
  S_1 = \mathcal{R}(S_0, E_1, \sigma_1)
  $$
4. **The Atomic Transaction Batch:** The engine commits the state delta into SQLite / Cloudflare D1 (`CANON_DB`) within a single, atomic SQL transaction:

```sql
BEGIN TRANSACTION;

-- 1. Advance the logical world clock
INSERT INTO simulation_ticks (tick_number, occurred_at_iso, state_hash)
VALUES (1, '2026-10-21T16:28:00.000Z', '7f8a9c...');

-- 2. Commit the primary narrative event
INSERT INTO ledger_events (
  event_id, sequence_number, event_type, occurred_at_tick, actor_id, payload_json,
  topology_hash, overlay_hash, query_hash, receipt_hash, previous_event_hash, event_hash, kernel_version
) VALUES (
  'evt_01HXYZ99...', 1, 'GRIEVANCE_CONFRONTATION_RESOLVED', 1, 'char_bog',
  '{"grievance_id":"grv_territorial_impasse","outcome":"COSTLY_WIN","winner":"char_bog","loser":"char_wart"}',
  'top_hash_00', 'ovl_hash_00', 'qry_hash_01', 'rcpt_hash_01', '00000000000000000000000000000000', 'e3b0c44298...', '1.0.0'
);

-- 3. Apply the somatic and relational mutations
UPDATE actor_states 
SET strain_basis_points = strain_basis_points + 450,
    held_primary_item_id = 'item_founder_token'
WHERE actor_id = 'char_bog';

UPDATE dyad_relations
SET resentment_basis_points = resentment_basis_points + 800,
    cooldown_remaining_ticks = 3
WHERE dyad_id = 'dyad_bog_wart';

COMMIT;
```

5. **Merkle Hash Chaining:** The event is cryptographically linked to the genesis block:
  $$
  H_1 = \text{SHA-256}(H_0 \parallel \text{CanonicalJCS}(E_1))
  $$
  and an atomic `state_delta.json` sidecar is emitted to disk.

### 7. Unlocking Authoring at Tick 1

With the atomic commit finalized, **Tick 1 is live, fully grounded, and legally sovereign**. The simulation engine now presents this committed state ($S_1$) to the authoring interface:

#### Path A: Hand-Drafted Screenplay Ingress (`.fountain`)

If a human showrunner is authoring the scene, the engine creates or scaffolds the active draft file inside **`02.simulation/002.worker-sower/drafts/`** (or mounts it inside the Writer's Desk at `src/pages/director/writer.astro`), prepending the verified **Spatial Stage Header** for Tick 1:

```code
/* === SPATIAL STAGE HEADER (TICK 1) ===
   LOCATION: loc_origin_hub (The Warm Pipe)
   COORDINATES: Bog (10, 2, -12) Facing: 1 | Wart (11, 2, -13) Facing: 4
   DYNAMIC PORTALS: hatch_valve_04 [LOCKED]
   CAPACITY: 2/2 Goblins (Saturated)
   LIGHTING: 0.15 lux | ACOUSTIC FLOOR: 1,500 cdB
   ACTIVE CONFLICT: grv_territorial_impasse
   PRE-RESOLVED MECHANICAL OUTCOME: COSTLY_WIN (Bog over Wart)
   MANDATED EXIT CONDITION: Wart drops physical claim to scraper; Bog accumulates +450 bp strain
   ===================================== */

INT. THE WARM PIPE - TICK 1

Bog's knuckles whiten against the cold scrap iron. He doesn't yield an inch of the dry grating.

BOG
Step back off the seam, Wart. It's marked.
```

If the author stamps **`@lifecycle: locked`** in the header, automated drafting passes are fenced out, and the author's hand-crafted dialogue is protected by the `assertVerbatimParity` gate.

#### Path B: Automated LLM Semantic Expansion ($T = 0.75$)

If the scene dialogue is dispatched to a local drafting worker (e.g., Qwen 2.5 14B running on Rig 1 CPU), the context is assembled using the **Tripartite Attention Sandwich**:

- **Top 15% (Primacy Anchor):** Dialect rules, character voice exemplars, and negative syntactic bans (no filter verbs, no modern therapy talk).
- **Middle 70% (Passive Cadence Buffer):** Sliding window of preceding narrative prose.
- **Bottom 15% (Recency Bias Dominance):** The active **Tick 1 State Header**—forcing the language model to write dialogue that reflects Bog's costly victory, Wart's forced concession, and the physical constraints of the locked iron hatch.

### Summary

Tick 1 is triggered when an authenticated intent envelope passes the zero-cost Stage $T_0$ pre-flight verification gauntlet, boots the environmental kernel, executes the Stage 3 lottery and Stage 4 mechanical duel, and atomically commits the state transition $S_0 \to S_1$ into the event-sourced ledger. Only after this physical and social reality is sealed does authoring begin.

### You

{{FOCUS : i am trying to figure out if all of this structure resolves around the tick. how long in time do these ticks take place; six seconds, six minutes, six hours, how much time in the game world is being simulated; are the game worlds completely deterministic; where you can run it from tick one multiple times and the same things will happen each time; can you start at a tick forward in time and then run the simulation backwards; is scale 15 from the h3 uber library even needed; what would be the minimum scale required; is the tick the most fundamental unit of this project; i imagine you just this things run like some kind of wind up machine; you would start it off with some kind of menu item action and it runs tick by tick and specific tick the how system would pause and here is where the fountain format screenplay would be written. and then the machine tells you how many ticks the screen play takes up; and then let it continue to go forward; maybe even change the state of the world afterward due to the events which occur in the screenplay; and then just let the ticks continue to run and all of the characters do there thing until the author decides to stop and create a new screenplay }}

@extreme-details

### Gemini

### Executive Architectural Assessment

Your intuition captures the core spirit of the system: **the storyworld is designed as an event-sourced, clockwork state machine**. However, to build an engine that operates reliably across years of serialized narrative without timeline bugs, drift, or prohibitive compute costs, the pipeline introduces formal mathematical boundaries and temporal stratifications.

Below is the exhaustive, granular breakdown of every question you raised.

### 1. Is the Tick the Most Fundamental Unit of the Project?

**Architecturally, no: the Event is the sovereign unit of reality; the Tick is its temporal coordinate.**

While the clock advances by ticks, the universe is built on an **append-only event ledger**. State is never stored as an ungrounded variable; it is folded over an event sequence:

$$
\text{State}_N = \text{fold}(\text{apply}, \, \text{State}_0, \, [E_1, E_2, \dots, E_N], \, \sigma)
$$

If a tick advances and *nothing happens* in an unobserved sector, no physical event is recorded for that sector. The system is **event-sourced and sparse**, preventing thousands of empty loops from consuming CPU cycles.

#### The Six-Level Spatiotemporal Hierarchy

To prevent timing bugs, narrative time is strictly decoupled from presentation time across six explicit layers:

```plaintext
┌───────┬──────────────────────┬──────────────────────┬────────────────────────────────────────────────────────┐
│ LEVEL │ UNIT NAME            │ GOVERNING PLANE      │ PRIMARY CLOCK & PERMITTED STATE MUTATIONS              │
├───────┼──────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│  L1   │ Simulation Cycle     │ World Simulation     │ Discrete World Tick (1 Day / Macro movement & decay)   │
│  L2   │ Episode              │ Broadcast Container  │ Pacing & Schedule (Public statuses, grievance cooldown)│
│  L3   │ Scene                │ Encounter Space      │ Spatial Adjacency (Duel resolution, trauma injection)  │
│  L4   │ Beat (Narrative)     │ Narrative AST        │ Swain MRU Order (Somatic strain, refusal threshold)    │
│  L5   │ Shot (Presentation)  │ Exposure Sheet       │ 24 fps Master Clock (Audio stem, camera move, visemes) │
│  L6   │ Frame                │ Optical Compositor   │ 1/24s Rasterization (Affine transforms, chroma key)    │
└───────┴──────────────────────┴──────────────────────┴────────────────────────────────────────────────────────┘
```

- **L1 (World Tick):** Resolves macro time (supply attrition, healing, weather shifts, long-distance road transit).
- **L3–L4 (Tactical Encounter / Narrative Beats):** Resolves interpersonal drama (who confronts whom, who wins the $2\text{d}6$ duel, which physical injuries occur).
- **L5–L6 (Audio / Video Presentation):** Resolves physical media time (governed by audio sample rates and 24.0 fps video frames).

### 2. How Long Does a Tick Take in Simulated Time?

The duration of a tick depends strictly on the **scale of observation (Scale Handoff State Machine)**:

```plaintext
       MACRO REGIONAL SCALE (L1)                    TACTICAL STAGE SCALE (L3/L4)
┌──────────────────────────────────────┐      ┌──────────────────────────────────────┐
│ Scale: IN_TRANSIT                    │      │ Scale: STAGED                        │
│ Clock: Discrete World Tick (e.g. 1d) │ ───► │ Clock: SimTime Centiseconds (1 cs)   │
│ Movement: Analytical Progress P(t)   │      │ Execution: 1-Second Dramatic Beats   │
│ Cost: 0 per-tick iteration           │      │ Cost: High-precision spatial checks  │
└──────────────────────────────────────┘      └──────────────────────────────────────┘
```

#### A. Macro / Overworld Ticks (Level 1: The Simulation Cycle)

- **Default Unit:** **One Chronological Day** (or fixed multi-hour blocks).
- **Purpose:** Passive resource consumption, rot/rust accumulation, weather shifts, and regional travel.
- **Zero-Tick Analytical Travel:** When a character travels across a highway or waterway, the engine **does not tick every minute or mile**. The actor enters the state `IN_TRANSIT`. Their position is an analytical, continuous function of time evaluated on demand:
  $$
  P(t) = \frac{t - T_{\text{depart}}}{\text{EdgeCost}}
  $$
  They cost **0 CPU** while moving across hundreds of miles.

#### B. Tactical / Scene Ticks (Level 3 & Level 4: The Encounter Grid)

- **The Master Timeline Axis:** Simulation time in active tactical spaces is tracked as **an integer count of centiseconds ($1\text{ cs} = 0.01\text{ seconds}$)** since the series epoch.
- **The Dramatic Beat:** Within a tactical scene, actors act in discrete narrative beats typically lasting **1 to 5 seconds**.
- **The Presentation Clocks (Audio & Video):**
  - **Audio Timebase:** Continuous acoustic truth running at **48,000 samples/sec**.
  - **Master Video Clock:** Exactly **24.0 integer frames/sec** ($\approx 41.67\text{ ms}$ per frame).
  - **The Constant Projection Factor:**
    $$
    \frac{48{,}000\text{ samples/sec}}{24\text{ frames/sec}} = 2{,}000\text{ audio samples per video frame}
    $$

### 3. Are the Game Worlds Completely Deterministic?

**Yes, 100% bit-identical and referentially deterministic.**

If you run the simulation from Tick 1 ten thousand times with the same seed, **the exact same sequence of events, injuries, dialogue cues, and dice rolls will occur every single time**.

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│                   PILLARS OF REFERENTIAL DETERMINISM                   │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Zero Wall-Clock Access                                              │
│    • Date.now() and performance.now() are banned from all reducers.    │
│    • Time is strictly an injected input: TICK_ADVANCED(n).             │
├────────────────────────────────────────────────────────────────────────┤
│ 2. The Gillian Arithmetic Doctrine                                     │
│    • Floating-point numbers are prohibited in state calculations.      │
│    • All tension, health, and meters use Integer Basis Points (bp):    │
│      10,000 bp == 100.00% capacity.                                    │
│    • Division uses Banker's Rounding (Round-Half-Even) on remainders.  │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Explicit Seed Lineages                                              │
│    • Unseeded Math.random() is banned.                                 │
│    • PRNG Seed = HMAC-SHA256(event_id + subsystem_id, world_seed).     │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Deterministic Key Sorting                                           │
│    • All JSON serialization uses RFC 8785 (Canonical JCS).             │
│    • Map keys and actor sets iterate strictly in UTF-16 code-unit order.│
└────────────────────────────────────────────────────────────────────────┘
```

### 4. Can You Start at a Future Tick and Run the Simulation Backwards?

**Physically and mathematically: NO. Architecturally via event-sourcing: YES.**

#### Why the Physics Cannot Run Backwards (Thermodynamic Irreversibility)

The engine models narrative as an entropic, high-friction system governed by the **Law of Irreversibility**:

- **Information Destruction:** When an actor sustains an injury, an item breaks, or an opposed $2\text{d}6$ duel resolves, mathematical entropy is generated. Multiple distinct precursor states collapse into a single resulting state. A state reducer $\mathcal{R}(S_n, E_n)$ is non-injective and cannot be mathematically inverted.
- **One-Way Cryptographic Hashing:** The Merkle ledger links events via SHA-256 digests ($H_n = \text{SHA-256}(H_{n-1} \parallel E_n)$). Hashes cannot be unwound backward in time.

#### How the System "Steps Backward" (The Flashback Protocol)

Because the universe is **event-sourced**, you achieve "rewinding" by **replaying forward from the nearest historical checkpoint**:

- If you are at Tick 500 and want to inspect Tick 100, the system does not run a reverse physics calculation.
- It fetches the **State Snapshot at Tick 100** ($S_{100}$) from storage (or folds events $E_1 \dots E_{100}$ starting from Genesis $S_0$).
- This allows instant historical inspection, "Flashback Scenes," or alternate timeline branching without violating physical irreversibility.

### 5. Is Scale 15 from Uber's H3 Library Needed? What is the Minimum Scale?

**No, H3 Resolution 15 is NOT needed—in fact, using H3 for tactical indoor staging is an acknowledged architectural anti-pattern.**

The studio resolved the spatial indexing debate by implementing a **hybrid spatial architecture**:

```plaintext
                           THE HYBRID SPATIAL SPLIT
                                       │
     ┌─────────────────────────────────┴─────────────────────────────────┐
     ▼                                                                   ▼
REGIONAL / GEOGRAPHIC OVERWORLD                               TACTICAL INTERIOR ROOMS
• Technology: Uber H3 Discrete Global Grid                    • Technology: Pure Flat Axial Lattice (hexgeom)
• Resolution: Res 5 to Res 8                                  • Coordinate: Integer Triples (q, r, s)
  - Res 5 (~8.5 km edge): Regional awareness                  • Metric: Doubled integer coordinates (4q+2r, 6r)
  - Res 7 (~1.2 km edge): Neighborhood navigation             • Zero H3 dependency; zero pentagonal warp
  - Res 8 (~460 m edge): Facility footprint                   • Exact Supercover Raycasts & 6-Way Facing
```

#### Why H3 Resolution 15 Was Rejected for Rooms:

1. **Pentagon & Projection Distortions:** H3 projects an icosahedron onto a sphere. At micro resolutions (Res 14–15), cell edges warp, compass facings drift, and pentagonal cell anomalies break straight-line raycasting.
2. **Computational Overhead:** Encoding sub-meter tactical positions ($0.5\text{ m}$) into 64-bit H3 string hashes forces continuous mathematical conversions between WGS84 geodesics and local Cartesian coordinates.
3. **The True Minimum Scale for H3:**
  - **Minimum Regional Scale:** **Resolution 8** (edge length $\approx 460\text{ meters}$) or **Resolution 9** ($\approx 174\text{ meters}$) is the finest granularity needed from H3. It is used strictly for regional spatial joins ("Which actors are within 10 miles of this explosion?").
  - **Inside Buildings / Scenes:** The engine transitions via an atomic **Portal Node** into a **pure, flat integer axial lattice $(q, r, s)$** via `goblin-spatial`. A room is treated as a uniform, planar coordinate plane where integer arithmetic guarantees bit-exact line-of-sight and touch reachability.

### 6. The "Wind-Up Clockwork Machine" Mental Model: How It Actually Works

Your vision of starting the machine from a menu, letting it run tick-by-tick, pausing to write the `.fountain` screenplay, having the machine calculate consumed ticks, and resuming forward is **extremely close to the real architecture, with one critical distinction: Simulation Mechanics Precede Prose.**

In the actual pipeline, you do not pause the simulation to write a screenplay that invents what happened; **the simulation determines what physically happened first, and then the screenplay is written to dramatize that specific outcome.**

```plaintext
                         THE WIND-UP CLOCKWORK LOOP
                                     │
                                     ▼
 1. WIND-UP RUN (Autonomous Ticking)
    • Scheduled ticks advance: TICK_ADVANCED(n)[cite: 8, 31].
    • Background entities travel analytically along road edges (0 CPU)[cite: 7, 19].
    • Dormant rooms in "The Void" sleep (0 CPU)[cite: 7, 38].
    • Tension accumulators & Paranoia Clocks increment in basis points[cite: 6, 20].
                                     │
                                     ▼
 2. THE DRAMATIC HALT (The Boil-Over Trigger)
    • Proximity sweep detects collocated actors in an active room[cite: 8, 24].
    • Boil-Over Check: Resentment crosses ceiling OR showrunner triggers scene[cite: 8, 24].
    • THE CLOCK BRAKE ENGAGES: Autonomous world ticking halts[cite: 8, 37].
                                     │
                                     ▼
 3. MECHANICAL STAKES RESOLUTION (Stage 4 Opposed 2d6 Duel)
    • Before any writing begins, the engine resolves the mechanical conflict.
    • 2d6 Opposed Roll + Strings - Somatic Debuffs[cite: 18, 20].
    • Result: e.g., COSTLY_WIN for Bog; Wart concedes ground, Bog drops wrench[cite: 18, 20].
    • Emits typed intermediate contract: ScenePlan IR.
                                     │
                                     ▼
 4. AUTHORING PAUSE: THE FOUNTAIN SCREENPLAY INGRESS
    • System opens worker-sower-engine/drafts/ (or Writer's Desk in writer.astro).
    • Injects Spatial Stage Header (coordinates, locked portals, lighting, somatic bans)[cite: 15, 18].
    • Human Showrunner (or LLM at T = 0.75) drafts the scene dialogue and action[cite: 1, 14, 19].
    • Rule: Dialogue must honor the pre-resolved mechanical outcome and somatic masks[cite: 18, 20].
                                     │
                                     ▼
 5. TIME MEASUREMENT & QUANTIZATION BRIDGE
    • Audio Microservice synthesizes speech stems (TTS)[cite: 12, 14, 18].
    • ffprobe measures exact waveform duration down to the millisecond.
    • Master Clock compiles total duration into video frames and simulation intervals:
      target_frames = ceil(ms / 1000 * 24)[cite: 12, 18, 28].
    • The machine calculates: "This scene occupied exactly 114 seconds (2,736 video frames)[cite: 18, 28]."
                                     │
                                     ▼
 6. ATOMIC STATE SETTLEMENT (Sn -> Sn+1)
    • Engine commits state_delta.json to SQLite / Cloudflare D1[cite: 20, 24, 35]:
      - Bog: +450 bp fatigue, knife equipped to HELD_PRIMARY[cite: 24, 28].
      - Wart: territorial grievance cooldown set to 3 cycles[cite: 15, 18, 24].
      - Room portal: hatch_valve_04 flipped to LOCKED[cite: 15, 24].
    • Cryptographic seal: H_{n+1} = SHA-256(H_n || EventData)[cite: 8, 18, 23].
                                     │
                                     ▼
 7. RELEASE THE BRAKE (Resume Ticking)
    • Simulation clock advances past the elapsed scene interval[cite: 5, 8].
    • Unobserved dormant sites apply algebraic catch-up (f(Delta_Ticks))[cite: 3, 7, 8].
    • World returns to autonomous clockwork ticking until the next dramatic boil-over[cite: 7, 8, 24].
```

### Summary of the Workflow Experience

1. **The Machine Ticks:** You start the world. Entities travel, resources decay, and grudges quietly simmer in memory at zero GPU cost.
2. **The Machine Pauses:** When physical proximity and interpersonal tension boil over, the simulation trips its brake.
3. **The Contract Is Established:** The engine determines *who won* and *what physical costs were paid* via mechanical tabletop dice rules[cite: 18, 20].
4. **You Write the Screenplay:** You open the `.fountain` file inside `worker-sower-engine/drafts/`[cite: 1, 14, 19]. The environment, character injuries, and exit constraints are already defined for you. You write the dialogue[cite: 14, 18].
5. **The Machine Quantizes Time:** Synthetic speech generates audio; the engine measures the audio waveforms to calculate the exact number of seconds, frames, and tactical ticks the scene consumed[cite: 12, 18, 28].
6. **The Universe Mutates & Continues:** The narrative consequences are atomically locked into the event ledger, the brake is released, and the world resumes ticking forward across the timeline.

### You

where is the Event Ledger located

when you say [You start the world. Entities travel, resources decay, and grudges ] this all happens in [worker-sower-engine]

where does this happen [The Machine Quantizes Time: Synthetic speech generates audio; the engine measures the audio waveforms to calculate the exact number of seconds, frames, and tactical ticks the scene consumed[cite: 12, 18, 28].]

### Gemini

Here is the granular, architectural breakdown of where the ledger lives, which engine processes world simulation, and where time quantization takes place across the pipeline.

### 1. Where is the Event Ledger Located?

The **Event Ledger** exists at two distinct levels: its **codebase schema/reducer implementation** and its **physical storage backing**.

#### A. Codebase Location (In the Repository)

The schemas, Zod validation envelopes, and pure reducer logic are defined inside **`worker-sower-engine`** (Cluster `02.simulation/002.worker-sower`):

- **Event Envelopes & Schemas:** `src/core/ledger/schema.ts` and `packages/001.engine/src/ledger/events.ts` (defining `ACTOR_MOVED`, `SOMATIC_TRAUMA_APPLIED`, `GRIEVANCE_ESCALATED`, `PARANOIA_CLOCK_TICKED`, `SIMULATION_TICK_COMMITTED`).
- **The Pure Reducer Function ($\mathcal{R}$):** `src/core/ledger/reducer.ts` (executes $S_{n+1} = \mathcal{R}(S_n, E_n, \sigma_n)$ with zero wall-clock dependencies).

#### B. Physical Storage Backing (The Runtime Databases)

Depending on whether the pipeline is running in the cloud or locally on developer hardware, the ledger resides in:

1. **Edge / Production Deployment:**
  - **Hot Relational Database:** Hosted in **Cloudflare D1 (`CANON_DB`)**. It stores the materialized working view across tables like `entities_live`, `strings_ledger`, `grievance_status`, `paranoia_clocks`, and `ledger_events`.
  - **In-Memory Actor Leases:** Managed in RAM via **Cloudflare Durable Objects** (`SowerSessionDO`, `SiteDO`, `ZoneDO`).
  - **Cold WORM Archival:** Older events and state snapshots drain from D1 into **Cloudflare R2** and an orphan Git branch (`refs/heads/audit-log`) for immutable Write-Once-Read-Many (WORM) auditability.
2. **Local Workstation / Solo Development (Rig 1):**
  - **Local Relational Database:** A local **SQLite** (or PostgreSQL) file on disk (e.g., accessed via `apps/local-runner` using `SqliteLedger`).
  - **Canonical Flat Logs:** Serialized as **canonical JSONL / `.ndjson` files** (`events.ndjson`), allowing full replay verification directly inside local test suites (`apps/local-runner/src/main.ts`).

### 2. Does "Entities travel, resources decay, grudges simmer..." all happen in `worker-sower-engine`?

**Yes, absolutely.** **`worker-sower-engine` is the sovereign narrative state authority, epistemological state machine, and relational engine**.

However, it executes these tasks through a strict **division of authority between Possibility and Occurrence**:

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│               worker-sower-engine (Sovereign Ledger)                   │
│  • Owns vehicle fuel tallies, tire condition, and somatic fatigue      │
│  • Evaluates the Thermodynamic Flow Equation (basis-point decay)       │
│  • Manages Resentment accumulators & Paranoia Clocks                   │
│  • Resolves 2d6 duels, grievance lotteries, and social debts (Strings) │
│  • Commits state changes (Sn -> Sn+1) to SQLite / Cloudflare D1        │
└───────────────┬────────────────────────────────────────▲───────────────┘
                │ 1. Plain Query: findPath(start, goal)  │ 3. Plain Receipt:
                │    Passes terrain condition masks      │    Path array + CostUnits
                ▼                                        │
┌────────────────────────────────────────────────────────┴───────────────┐
│                 goblin-spatial (Stateless Pure Math Engine)            │
│  • Regional routing over Compressed Sparse Row (CSR) graph             │
│  • Evaluates edge traversal duration: T_travel = Length / (Speed * μ)  │
│  • Evaluates geometric contact opportunity & line-of-sight             │
│  • ZERO knowledge of fuel, character health, drama, or dice rolls      │
└────────────────────────────────────────────────────────────────────────┘
```

- **How Travel Happens:** `worker-sower-engine` asks `goblin-spatial` via `SpatialPort`: *"Is this path reachable, and what is its traversal duration?"* `goblin-spatial` evaluates the raw topological geometry over its Compressed Sparse Row (CSR) graph and returns a plain `PathReceipt`. `worker-sower-engine` then decides **Occurrence**: it checks whether the actor has enough fuel/stamina, deducts the movement budget, triggers any travel ambushes, and appends the `ACTOR_MOVED` event to the ledger.
  - *Macro Scale:* Actors moving across regional roads are tagged `IN_TRANSIT`. Their progress is solved analytically with BigInt math ($P(t) = \Delta t / D_{\text{edge}}$), consuming **0 per-tick iteration CPU**.
- **How Resources and Trauma Decay:** `worker-sower-engine` evaluates the **Thermodynamic Flow Equation** on every cycle:
  $$
  \text{Meter}_{t+1} = \max\left(\text{baselineBp}, \, \text{Meter}_t - \text{DecayRatePerCycleBp}\right) + \sum_{k} \text{FrictionEvent}_k
  $$
  Somatic fatigue, healing rates, fuel consumption, and tool wear are calculated as integer basis points ($0\text{–}10{,}000\text{ bp}$).
- **How Grudges Simmer:** `worker-sower-engine` increments **Resentment Accumulators** and ticks **Paranoia Clocks** across every dyad in the active relational ledger (`strings_ledger`, `grievance_status`). When resentment breaches its ceiling, the Sower's **Boil-Over Sentinel** trips, halting autonomous background movement and forcing a dramatic confrontation scene.

### 3. Where Does Temporal Quantization Happen?

Temporal quantization—where synthetic speech generates audio and the engine measures waveforms to compute exact seconds, frames, and tactical ticks—happens inside **`worker-sower-conductor` on Rig 1** (orchestrated by **`src/pipeline/produceEpisode.ts`**).

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│                        UPSTREAM: worker-sower-engine                   │
│ • Pure, lightweight V8 Isolate (≤128 MB RAM, zero POSIX access)        │
│ • Visual-, Audio-, and Frame-Agnostic                                  │
│ • Emits: drafts/dialogue_ast.json (Spoken lines, emotions, motor verbs) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ AST Hand-off
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 RIG 1: worker-sower-conductor (produceEpisode.ts)       │
│ • Host: Local CPU/RAM Workstation running Full POSIX Node.js           │
│ • Hardware: 64 GB RAM, 0 MB GPU VRAM (Isolated from CUDA thrashing)   │
├────────────────────────────────────────────────────────────────────────┤
│ 1. ACOUSTIC SYNTHESIS                                                  │
│    • Conductor issues HTTP POST to local Python TTS microservice:      │
│      POST http://127.0.0.1:8000/generate                               │
│    • TTS emits uncompressed 48 kHz PCM mono/stereo .wav stems to disk  │
│                                                                        │
│ 2. PHYSICAL WAVEFORM PROBING (ffprobe)                                 │
│    • Conductor spawns a native OS child process:                       │
│      ffprobe -v error -show_entries format=duration -of default=...    │
│    • Measures empirical, continuous millisecond truth (duration_ms)    │
│                                                                        │
│ 3. DISCRETE INTEGER 24 FPS QUANTIZATION                                │
│    • Conductor locks continuous audio time to discrete video frames:   │
│      target_frames = ceil((duration_ms / 1000) * 24)                   │
│    • Clamps to 3D Causal VAE lattice stride: targetFrames = 4*ceil(N/4)+1│
│                                                                        │
│ 4. TIMING MANIFEST GENERATION (exposure_sheet.json)                    │
│    • Writes locked frame counts, ducking parameters (-14 dB), and      │
│      Foley/viseme offsets into exposure_sheet.json                     │
│    • Hands this manifest downstream to goblin-viewport-template        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Why Doesn't the Core Sower Engine Do This?

- **Runtime Isolation:** The core simulation (`worker-sower-engine`) runs in an edge V8 isolate environment (like Cloudflare Workers/Durable Objects) with $\le 128\text{ MB}$ RAM. It is **strictly prohibited from spawning Linux OS binaries** (`child_process.spawn` is banned).
- **Domain Boundary:** The core engine is strictly **visual-agnostic and temporal-agnostic**; it deals only with *meaning* (who spoke what line with what emotion), not physical milliseconds or video frames.
- **The Master Clock Governor:** `worker-sower-conductor` runs in a **full POSIX Node.js LTS environment on Rig 1**. It acts as the physical bridge: it calls the local TTS daemon (port 8000), spawns `ffprobe`, computes the 24 fps integer frames, and emits the **`exposure_sheet.json`** timing manifest that locks time for both the simulation ticks and downstream Remotion rendering.

### You

so the [Event Ledger] is a big deal ; is it foundational;

[Domain Boundary: The core engine is strictly visual-agnostic and temporal-agnostic; it deals only with meaning (who spoke what line with what emotion), not physical milliseconds or video frames.] should the [worker-sower-engine] understand how long a line or an action will take so that it realistically know what tick the action and dialogue falls under

### Gemini

### Part I: Is the Event Ledger a "Big Deal"? Is it Foundational?

Yes. The Event Ledger is the single most foundational, load-bearing pillar of the entire architecture.

Without it, the entire system collapses into what the architecture calls **"The Chapter 3 Collapse"**—the inevitable failure mode of naive AI generation where context windows degrade, characters forget broken limbs or amputations, secrets leak into public dialogue, and long-term continuity disintegrates into ungrounded hallucination.

The Event Ledger is foundational for four critical reasons:

#### 1. Inversion of Authority ("The Ledger Governs, Generation Proposes")

In standard AI workflows, people ask an LLM to generate a story, and whatever tokens the model outputs become the world's reality. In this pipeline, **that authority is inverted**:

- Generative models (LLMs, neural TTS, image/video diffusion) are permanently stripped of ontological, spatial, and temporal authority. They are treated as **untrusted, headless rendering workers**.
- The **Ledger is the sole authority of truth**. It dictates what characters physically exist, what injuries they have, what objects they hold, and what information they are permitted to know.
- A model never decides who wins an argument or steals an item; the deterministic engine resolves the mechanics, commits the fact to the ledger, and commands the model: *"This has already happened. Dramatize the consequence while obeying these physical constraints"*.

#### 2. The $T_0 = \$0.00$ Economic Firewall

Catching an authorial or continuity contradiction at compile time ($T_0$) in local database memory costs exactly **$\$0.00$**.

- If a script depicts an amputee character lifting a heavy iron hatch with two hands, the ledger's somatic capability mask rejects the action immediately.
- If that error escaped into production, neural text-to-speech vocoders would burn API seconds, serverless GPU farms would burn kilowatts generating diffusion video plates, and Remotion would composite a broken episode that has to be discarded. The ledger acts as an economic shield.

#### 3. Mathematical Replayability via Pure Event Sourcing

State is never an arbitrary, directly editable row in a database. It is derived deterministically by folding an append-only sequence of immutable events over primordial canon:

$$
\text{State}_N = \text{fold}(\text{apply}, \, \text{State}_0, \, [E_1, E_2, \dots, E_N], \, \sigma)
$$

Because every PRNG seed ($\sigma$), tabletop dice duel, and non-deterministic model output is captured directly on the event envelope, you can rebuild the exact state of the universe at any historical point.

#### 4. The Deletion Invariant

If all video models, Remotion code, ComfyUI checkpoints, and prompt files are deleted from disk, **the universe survives completely intact** inside the event log. Conversely, if you lose the event log, the storyworld suffers irreversible brain death, regardless of how many gigabytes of rendered MP4s remain.

### Part II: The Temporal Paradox — Does `worker-sower-engine` Understand Duration?

This brings us to the core of your second question:

> *If the core engine is strictly visual-agnostic and temporal-agnostic (dealing only with meaning, not physical milliseconds or video frames), should `worker-sower-engine` understand how long an action or line will take so that it realistically knows what tick the action and dialogue falls under?*

The answer is yes, but across two distinct, stratified layers of time: Logical/Causal Time (Axis A) versus Empirical Physical Time (Axis B).

```plaintext
                  THE TWO PLANES OF TEMPORAL TRUTH
                  
  AXIS A: LOGICAL & CAUSAL TIME             AXIS B: PHYSICAL & EMPIRICAL TIME
  (worker-sower-engine)                      (worker-sower-conductor)
┌──────────────────────────────────────┐   ┌──────────────────────────────────────┐
│ • Causal order: Stimulus ──► Speech   │   │ • Physical sound: Continuous 48 kHz  │
│ • Unit: Discrete Beats & Centiseconds│   │ • Measured: ffprobe duration_ms      │
│ • State Locks: actor.busyUntil       │   │ • Derived: 24 fps integer frames     │
│ • Motion: Integer Traversal Costs    │   │ • Spatial Stride: 4n+1 latent steps  │
│ • Vocabulary: Lexical Word Caps      │   │ • Audio Stem Immutability on Disk    │
└──────────────────┬───────────────────┘   └──────────────────▲───────────────────┘
                   │                                          │
                   │ Emits dialogue_ast.json                  │ Measures Audio
                   └──────────────────► [ TTS ] ──────────────┘
```

If `worker-sower-engine` attempted to measure raw audio waveforms or count video frames directly, it would break its boundary contract, bloat into a heavy multimedia application, and become dependent on specific GPUs or audio models.

Instead, the system resolves realistic timing through four specific mechanisms:

### 1. Causal Pacing via Dwight Swain Motivation-Reaction Units (MRUs)

In natural human interaction, characters do not speak simultaneously with external stimuli. LLMs often make this mistake (e.g., *"Silas answers as the bomb explodes"*).

The engine enforces realistic temporal pacing by structuring dialogue into **Dwight Swain Motivation-Reaction Units (MRUs)**:

$$
\text{Stimulus (Cause)} \longrightarrow \text{Reflex (Shock)} \longrightarrow \text{Calculation (Thought)} \longrightarrow \text{Action / Speech}
$$

- When an explosion, accusation, or door slam occurs, the Sower encodes this causal chain into the **Dialogue AST (`dialogue_ast.json`)**.
- It stamps an emotional reflex cue (e.g., `reaction_cue: "VISCERAL_STING"`).
- The downstream compiler automatically injects an authored **12-to-24 frame visual pre-roll buffer** (a held physical reaction, an eye saccade, or a camera push-in) *before* the character begins speaking.
- Pacing is therefore driven by **psychological and physical causality**, not by arbitrary dead air.

### 2. Action Durations & Concurrency Locks (`busyUntil`)

For physical actions (moving between rooms, prying an iron hatch, reloading a weapon, or bandaging a wound), the Sower does not operate in zero-second teleportation. It uses **Logical Centiseconds ($1\text{ cs} = 0.01\text{ s}$)** and explicit concurrency locks:

- **The `busyUntil` Lock:** Every actor in the ledger carries a `busyUntil: Timestamp` property.
- When Bog begins prying a bulkhead open, the engine calculates the physical traversal or effort cost (e.g., `costUnits: 300 cs` / 3 seconds) based on somatic capability and spatial resistance.
- **Physical Mutex:** Bog is locked in the state of execution. He is physically barred from initiating another motor action until the clock reaches `busyUntil`.
- If Wart attempts to speak to Bog during this window, the Sower knows Wart's dialogue occurs *while* Bog is occupied, or that Wart must wait for Bog's action to finish.

### 3. Lexical Word Budgets & Preliminary Frame Estimators

To prevent dialogue from ballooning uncontrollably and breaking scene timing, the Sower uses compile-time linguistic budgeting:

- **Directorial Curtness ($C$):** The showrunner tunes the Curtness scalar ($C \in [0.0, 1.0]$) in `DirectorConsole.tsx`.
- The engine calculates a strict affine word-count ceiling for generated or hand-drafted lines:
  $$
  W_{\max} = \max(2, \, \lfloor 24.0 - 18.0 \times C \rfloor)
  $$
  At $C = 0.75$, no character can speak more than 10 words in a single dialogue beat.
- **Preliminary Frame Budgeting (Lightweight Acoustic Estimator):** Before calling external TTS systems, the Sower's AST compiler runs an in-memory heuristic estimator based on syllable counts, phoneme complexity, and punctuation pauses. This gives the engine an immediate approximation of whether the scene fits within the episode's overall temporal container.

### 4. How the Loop Closes: Audio as the Architect of Physical Time

The ultimate quantization of time is not guessed by the narrative engine; **it is measured empirically from synthesized sound**.

```plaintext
               THE MASTER PHYSICAL CLOCK PIPELINE
               
   worker-sower-engine emits: drafts/dialogue_ast.json
   ["Bog: Step back off the seam, Wart. It's marked."]
                            │
                            ▼
   worker-sower-conductor triggers local TTS (Port 8000)
   Emits: audio/dialogue/ep01_sc01_line01_bog.wav
                            │
                            ▼
   ffprobe measures continuous acoustic truth:
   duration_ms = 2,418 ms (Empirical Observation)
                            │
                            ▼
   Conductor derives discrete 24 fps master presentation grid:
   target_frames = ceil(2418 / 1000 * 24) = 59 frames
                            │
                            ▼
   Locks into exposure_sheet.json & records to Event Envelope
```

1. **Observation vs. Derivation:** The continuous millisecond duration (`2418 ms`) is the physical *observation*. The integer frame count (`59 frames`) is the presentation *derivation*. Both are recorded.
2. **Recording Non-Deterministic Side Effects as Events:** Because neural TTS synthesis can have slight duration variance across runs, **the measured duration must be recorded directly into the ledger's event envelope or scene checkpoint**. On historical replay, the system does not re-synthesize or re-measure; it reads the recorded duration, preserving byte-exact temporal determinism.
3. **Advancing the World Clock Post-Scene:** Once the entire scene's audio stems and MRU visual pauses are quantized (e.g., total duration: 84 seconds / 2,016 frames), **that measured duration is passed back to advance the master simulation tick**.
  - The logical world clock advances by that exact elapsed interval.
  - Unobserved sites sleeping in "The Void" apply their algebraic catch-up based on the elapsed time.
  - The universe resumes ticking forward from the exact moment the scene concluded.

### The Governing Direction of Reality

The system strictly enforces the **Unidirectional Flow Invariant**: media requirements are never permitted to flow backward to dictate narrative truth.

$$
\text{TRUTH} \longrightarrow \text{MEANING} \longrightarrow \text{EXPRESSION} \longrightarrow \text{TIMING} \longrightarrow \text{REPRESENTATION}
$$

- **Bad Architecture:** A video diffusion model natively requires 53 frames $\to$ The story engine rewrites the script or changes character speech speed to fit the model.
- **The Correct Architecture:** The ledger determines what physically happened $\to$ The screenplay expresses it $\to$ Audio synthesis measures real physical time $\to$ The exposure sheet locks the frame coordinate $\to$ Downstream renderers conform their latents and cuts to match narrative reality.

### You

{{FOCUS : how would you go about using [Series-Dashboard] to work with the Event Ledger and Facts Ledger using code; what code should exist in [Series-Dashboard] }}

@extreme-details-00

### Gemini

### Ontological Boundary & Architectural Law

Before designing the code for **`Series-Dashboard`** (also referenced as `apps/dashboard` or `goblin-dashboard`), we must establish the system's foundational law:

> **The Constitutional Rule of Dashboard Authority:** The `Series-Dashboard` possesses **Read-Only Canon Authority** and **Zero Direct Semantic Write Authority** over both the **Event Ledger** and the **Facts Ledger**. React components and Astro API routes running inside the dashboard are strictly prohibited from mutating ledger rows directly, appending unvalidated event records, or modifying canonical lore files on disk.

```plaintext
               THE SOVEREIGN UNIDIRECTIONAL CONTROL PLANE
               
  SERIES-DASHBOARD (apps/dashboard)
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 1. Telemetry Hydration Plane (Read-Only)                              │
  │    • SSE / WebSocket listener: /api/stream.ts                          │
  │    • Ingests Live Working State (EntitiesLive, Strings, Paranoia)      │
  │    • Ingests Facts Centrality & Invalidation Blast Radius (why-dirty)  │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 2. Directorial Intent Dispatch Plane (Write as Intent)                 │
  │    • Dispatches DirectorIntentEnvelope to Edge / Rig 1                 │
  │    • Issues Human-Gated Reconciliation Commands (REWRITE / STILL_GOOD) │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │ Authenticated HTTP / RPC
                                      ▼
  SOVEREIGN CORE SERVERS (worker-sower-engine / 000.goblin-lore)
  ┌────────────────────────────────────────────────────────────────────────┐
  │ • Validates Intent against Zod Invariants & Somatic SAT ($T0 = $0.00) │
  │ • Executes 4-Vector Mutation / Pure Event Reducer                     │
  │ • Commits atomically to CANON_DB (SQLite / D1) via LedgerPort          │
  └────────────────────────────────────────────────────────────────────────┘
```

The dashboard operates on the **"Intents, Never Commands" Discipline**. When an author interacts with a UI widget—clicking *"Pin Grievance"*, *"Reconcile Scene"*, or dragging a dramatic tension slider—the dashboard serializes a cryptographically signed **Intent Envelope** and dispatches it over HTTP/WebSocket to `worker-sower-engine` or `ShotCoordinatorDO`. The engine verifies feasibility at $T_0 = \$0.00$, computes the atomic state transition, appends to the **Event Ledger**, updates the **Facts Ledger**, and broadcasts the resulting telemetry back to the dashboard via Server-Sent Events (SSE).

### I. Repository Structure for `Series-Dashboard`

To interact cleanly with both ledgers without violating boundary contracts, `apps/dashboard` must maintain the following file tree layout:

```plaintext
apps/dashboard/
├── src/
│   ├── env.d.ts
│   ├── types/
│   │   ├── ledger.ts               # Read-only types & telemetry contracts
│   │   └── intent.ts               # Director intent schemas & payloads
│   ├── services/
│   │   ├── ledgerClient.ts         # Dual-backend HTTP / RPC client (Rig 1 / D1)
│   │   └── factsClient.ts          # Facts Ledger & Invalidation query client
│   ├── pages/
│   │   ├── api/
│   │   │   ├── stream.ts           # Edge SSE relay for real-time telemetry
│   │   │   ├── intent.ts           # Proxy route for director action dispatch
│   │   │   └── reconcile.ts        # Facts reconciliation ingress endpoint
│   │   ├── director/
│   │   │   └── tuning.astro        # Directorial control deck
│   │   └── telemetry/
│   │       ├── events.astro        # Event log stream & replay viewer
│   │       └── facts.astro         # Fact dependency DAG & blast-radius HUD
│   └── components/
│       ├── backstage/
│       │   └── ScopeSwitchboard.astro  # Multi-series shard selector
│       ├── telemetry/
│       │   ├── EventLogStreamTable.tsx # Virtualized reactive event viewer
│       │   ├── FactCentralityMatrix.tsx# Invalidation risk HUD (vin_degree >= 15)
│       │   └── SceneStalenessAudit.tsx # "Why-Dirty" recursive trace inspector
│       └── director/
│           ├── DirectorConsole.tsx     # 4D Dramatic Parameter Console (C, P, T, S)
│           └── SceneReviewModal.tsx    # "Still Good" vs "Rewrite Rebase" modal
```

### II. Core Data Types & Contract Schemas

These definitions mirror the core engine contracts using strict TypeScript types, ensuring the dashboard can parse ledger streams safely.

#### 1. Ledger Contracts (`src/types/ledger.ts`)

```typescript
// apps/dashboard/src/types/ledger.ts

export type LocomotionTier = 'BIPEDAL_NIMBLE' | 'BIPEDAL_HUNCHED' | 'BIPEDAL_LIMPING' | 'IMMOBILE';
export type FactScope = 'CHARACTER' | 'LOCATION' | 'LOGISTIC' | 'LAW';
export type AuthorityLevel = 'AXIOM' | 'CANON' | 'EVENT';
export type FactStanding = 'ACTIVE_ENDORSED' | 'CHALLENGED_FLAGGED' | 'DEPRECATED_ARCHIVED';

export interface SpatialAuditQuadruple {
  readonly topologyHash: string;
  readonly overlayHash: string;
  readonly queryHash: string;
  readonly receiptHash: string;
  readonly kernelVersion: string;
}

export interface TelemetryEventRecord {
  readonly sequenceId: number;
  readonly eventId: string;
  readonly streamId: string;
  readonly tick: number;
  readonly eventType: string;
  readonly schemaVersion: number;
  readonly actorId: string | null;
  readonly targetId: string | null;
  readonly seed: string;
  readonly payload: Record<string, unknown>;
  readonly proof: SpatialAuditQuadruple | null;
  readonly prevEventHash: string;
  readonly eventHash: string;
  readonly timestampMs: number;
}

export interface FactNodeRecord {
  readonly id: string;
  readonly claimText: string;
  readonly scope: FactScope;
  readonly authorityLevel: AuthorityLevel;
  readonly standing: FactStanding;
  readonly version: number;
  readonly contentHash: string;
  readonly author: string;
  readonly inDegreeCentrality: number; // Downstream dependent scene count
  readonly lastReconsideredAtMs: number;
}

export interface DirtySceneTrace {
  readonly sceneId: string;
  readonly episodeNum: number;
  readonly sceneNum: number;
  readonly dirtyReason: string;
  readonly factId: string;
  readonly factScope: FactScope;
  readonly pinnedVersion: number;
  readonly currentVersion: number;
}

export interface LedgerWorkingState {
  readonly seriesSlug: string;
  readonly tick: number;
  readonly lastSequenceNumber: number;
  readonly stateHash: string;
  readonly entities: Record<string, unknown>;
  readonly strings: Record<string, unknown>;
  readonly grievances: Record<string, unknown>;
  readonly clocks: Record<string, unknown>;
}
```

#### 2. Intent Envelopes (`src/types/intent.ts`)

```typescript
// apps/dashboard/src/types/intent.ts

export type DramaticPacingMode = 'DRAMATIC_IRONY' | 'SUSPENSE' | 'SURPRISE' | 'MYSTERY';

export interface DramaticVector {
  readonly curtness: number;    // C ∈ [0.0, 1.0] -> Word-count ceiling
  readonly pacing: number;      // P ∈ [0.0, 1.0] -> Action/Dialogue ratio
  readonly threat: number;      // T ∈ [0.0, 1.0] -> 2d6 Duel trigger probability
  readonly subtext: number;     // S ∈ [0.0, 1.0] -> Subtext suppression
}

export interface DirectorIntentEnvelope {
  readonly protocolVersion: '2.1.0';
  readonly seriesSlug: string;
  readonly intentId: string;
  readonly targetTick: number;
  readonly authorId: string;
  readonly signature: string;
  readonly dramaticVector: DramaticVector;
  readonly pacingMode: DramaticPacingMode;
  readonly pinnedGrievanceId?: string;
  readonly seed: number;
}

export interface ReconcileFactIntent {
  readonly seriesSlug: string;
  readonly sceneId: string;
  readonly factId: string;
  readonly mode: 'REWRITE_REBASE' | 'STILL_GOOD_REPIN';
  readonly updatedProseText?: string;
  readonly authorId: string;
}
```

### III. The Client Services Layer

The dashboard implements dedicated client services that adapt dynamically between **Local Station Mode (Rig 1)** and **Cloudflare Edge Mode (Distributed Anycast)**.

#### 1. Event Ledger Ingress Client (`src/services/ledgerClient.ts`)

```typescript
// apps/dashboard/src/services/ledgerClient.ts
import type { TelemetryEventRecord, LedgerWorkingState } from '../types/ledger';
import type { DirectorIntentEnvelope } from '../types/intent';

export class LedgerClient {
  private readonly baseUrl: string;

  constructor(customUrl?: string) {
    this.baseUrl = customUrl || (import.meta.env.PUBLIC_SIM_CORE_URL ?? 'http://127.0.0.1:3000');
  }

  /**
   * Fetches the materialized working view of the world at the active tick.
   */
  public async getWorkingState(seriesSlug: string): Promise<LedgerWorkingState> {
    const res = await fetch(`${this.baseUrl}/api/v1/ledger/${seriesSlug}/state`);
    if (!res.ok) {
      throw new Error(`[LEDGER_CLIENT_ERROR] Failed to fetch working state: ${res.statusText}`);
    }
    return (await res.json()) as LedgerWorkingState;
  }

  /**
   * Reads the ordered append-only event stream starting from a monotonic sequence ID.
   */
  public async streamEvents(seriesSlug: string, fromSeq = 0, limit = 100): Promise<TelemetryEventRecord[]> {
    const res = await fetch(`${this.baseUrl}/api/v1/ledger/${seriesSlug}/events?fromSeq=${fromSeq}&limit=${limit}`);
    if (!res.ok) {
      throw new Error(`[LEDGER_CLIENT_ERROR] Failed to stream events: ${res.statusText}`);
    }
    const data = await res.json();
    return data.events as TelemetryEventRecord[];
  }

  /**
   * Dispatches a director intent proposal to the simulation engine.
   * Does NOT write to the ledger directly; requests execution by worker-sower-engine.
   */
  public async dispatchDirectorIntent(intent: DirectorIntentEnvelope): Promise<{ accepted: boolean; stateHash: string }> {
    const res = await fetch(`${this.baseUrl}/api/v1/simulation/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intent),
    });

    if (res.status === 412) {
      throw new Error('[DIRECTOR_DISPATCH_BREACH] Upstream Canon Drift or Invariant SAT failure');
    }

    if (!res.ok) {
      throw new Error(`[DIRECTOR_DISPATCH_FAILED] Status: ${res.statusText}`);
    }

    return await res.json();
  }
}

export const ledgerClient = new LedgerClient();
```

#### 2. Facts Ledger & Staleness Client (`src/services/factsClient.ts`)

```typescript
// apps/dashboard/src/services/factsClient.ts
import type { FactNodeRecord, DirtySceneTrace } from '../types/ledger';
import type { ReconcileFactIntent } from '../types/intent';

export class FactsClient {
  private readonly baseUrl: string;

  constructor(customUrl?: string) {
    this.baseUrl = customUrl || (import.meta.env.PUBLIC_LORE_API_URL ?? 'http://127.0.0.1:3000');
  }

  /**
   * Fetches active narrative claims with their downstream in-degree centrality metrics.
   */
  public async getFactsCentrality(seriesSlug: string): Promise<FactNodeRecord[]> {
    const res = await fetch(`${this.baseUrl}/api/v1/facts/${seriesSlug}/centrality`);
    if (!res.ok) throw new Error(`[FACTS_CLIENT_ERROR] Failed to query centrality: ${res.statusText}`);
    return (await res.json()) as FactNodeRecord[];
  }

  /**
   * Runs the forward-walking Recursive CTE (why-dirty) across the dependency graph.
   */
  public async getStalenessTraces(seriesSlug: string, factId?: string): Promise<DirtySceneTrace[]> {
    const url = new URL(`${this.baseUrl}/api/v1/facts/${seriesSlug}/why-dirty`);
    if (factId) url.searchParams.set('factId', factId);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`[FACTS_CLIENT_ERROR] Failed to query staleness traces: ${res.statusText}`);
    return (await res.json()) as DirtySceneTrace[];
  }

  /**
   * Submits a human showrunner reconciliation command.
   */
  public async submitReconciliation(intent: ReconcileFactIntent): Promise<{ success: boolean; scenesRemainingDirty: number }> {
    const res = await fetch(`${this.baseUrl}/api/v1/facts/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intent),
    });

    if (!res.ok) throw new Error(`[RECONCILE_FAILED] Server rejected reconciliation: ${res.statusText}`);
    return await res.json();
  }
}

export const factsClient = new FactsClient();
```

### IV. Real-Time Telemetry Streaming: Edge Server-Sent Events (SSE)

The dashboard uses an Astro API route (`src/pages/api/stream.ts`) acting as an edge SSE relay. It multiplexes events emitted by `worker-sower-engine` or `ShotCoordinatorDO` directly into browser-resident React islands.

```typescript
// apps/dashboard/src/pages/api/stream.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const seriesSlug = url.searchParams.get('series') || 'under-the-floorboards';
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // Connect upstream to local WebSocket or Durable Object SSE
      const upstreamWsUrl = `${import.meta.env.SIM_WS_URL ?? 'ws://127.0.0.1:3000'}/stream/${seriesSlug}`;
      let ws: WebSocket | null = null;

      try {
        ws = new WebSocket(upstreamWsUrl);

        ws.onopen = () => {
          sendEvent('SYSTEM_STATUS', { status: 'CONNECTED', seriesSlug, timestamp: Date.now() });
        };

        ws.onmessage = (msg) => {
          try {
            const parsed = JSON.parse(msg.data.toString());
            // Multiplex by domain event class
            if (parsed.type === 'EVENT_APPENDED') {
              sendEvent('EVENT_APPENDED', parsed.envelope);
            } else if (parsed.type === 'FACT_MUTATED') {
              sendEvent('FACT_MUTATED', parsed.delta);
            } else if (parsed.type === 'SCENE_DIRTIED') {
              sendEvent('SCENE_DIRTIED', parsed.trace);
            } else {
              sendEvent('TELEMETRY_TICK', parsed);
            }
          } catch {
            // Ignore non-JSON ping frames
          }
        };

        ws.onerror = (err) => {
          sendEvent('SYSTEM_ERROR', { error: 'Upstream WebSocket disconnected' });
        };
      } catch (err: any) {
        sendEvent('SYSTEM_ERROR', { error: err.message });
      }

      // Keep-alive heartbeat every 15 seconds
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
};
```

### V. User Interface Components (React Islands)

The dashboard mounts lightweight React islands inside Astro shells to render ledger data and capture director intent.

#### 1. Invalidation Risk & Centrality HUD (`FactCentralityMatrix.tsx`)

Displays load-bearing narrative nodes and alerts the showrunner to **High-Risk Monolithic Spines ($k_{\text{in}} \ge 15$)**.

```typescript
// apps/dashboard/src/components/telemetry/FactCentralityMatrix.tsx
import React, { useEffect, useState } from 'react';
import type { FactNodeRecord } from '../../types/ledger';
import { factsClient } from '../../services/factsClient';

interface Props {
  seriesSlug: string;
}

export const FactCentralityMatrix: React.FC<Props> = ({ seriesSlug }) => {
  const [facts, setFacts] = useState<FactNodeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    factsClient.getFactsCentrality(seriesSlug)
      .then(setFacts)
      .finally(() => setLoading(false));

    // Listen to real-time invalidation cascades
    const evtSource = new EventSource(`/api/stream?series=${seriesSlug}`);
    evtSource.addEventListener('FACT_MUTATED', () => {
      factsClient.getFactsCentrality(seriesSlug).then(setFacts);
    });

    return () => evtSource.close();
  }, [seriesSlug]);

  if (loading) return <div className="p-4 text-xs font-mono text-stone-500">>> Ingesting Facts Dependency Ledger...</div>;

  return (
    <div className="bg-stone-950 border border-stone-800 rounded p-4 font-mono">
      <div className="flex justify-between items-center mb-4 border-b border-stone-800 pb-2">
        <h3 className="text-xs uppercase font-bold text-amber-400 tracking-wider">
          Facts Ledger: Centrality & Invalidation Blast Horizon
        </h3>
        <span className="text-[10px] text-stone-500">v_fact_centrality_telemetry</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-stone-500 border-b border-stone-800">
              <th className="py-2">FACT ID</th>
              <th className="py-2">CLAIM</th>
              <th className="py-2">SCOPE</th>
              <th className="py-2 text-center">VER</th>
              <th className="py-2 text-right">DEPENDENT SCENES (k_in)</th>
              <th className="py-2 text-center">SPINE HAZARD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-900">
            {facts.map((fact) => {
              const isSpineHazard = fact.inDegreeCentrality >= 15;
              return (
                <tr key={fact.id} className="hover:bg-stone-900/40">
                  <td className="py-2 text-stone-300 font-bold">{fact.id}</td>
                  <td className="py-2 text-stone-400 truncate max-w-xs" title={fact.claimText}>{fact.claimText}</td>
                  <td className="py-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-stone-800 text-stone-300">{fact.scope}</span>
                  </td>
                  <td className="py-2 text-center text-amber-500 font-bold">v{fact.version}</td>
                  <td className="py-2 text-right text-stone-200 font-bold">{fact.inDegreeCentrality}</td>
                  <td className="py-2 text-center">
                    {isSpineHazard ? (
                      <span className="px-2 py-0.5 text-[10px] bg-red-950 text-red-400 border border-red-800 font-bold rounded animate-pulse">
                        MONOLITHIC ({fact.inDegreeCentrality})
                      </span>
                    ) : (
                      <span className="text-emerald-500 text-[10px]">[STABLE]</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

#### 2. Forward-Walking Invalidation Trace & Reconciliation Modal (`SceneStalenessAudit.tsx`)

Implements the human-in-the-loop **REVIEW_AND_CLEAR** flow (Operation 5). The showrunner inspects dirty scenes and either submits a rewrite or affirms *"STILL GOOD"* to re-pin dependencies without touching prose.

```typescript
// apps/dashboard/src/components/telemetry/SceneStalenessAudit.tsx
import React, { useEffect, useState } from 'react';
import type { DirtySceneTrace } from '../../types/ledger';
import { factsClient } from '../../services/factsClient';

export const SceneStalenessAudit: React.FC<{ seriesSlug: string; authorId: string }> = ({ seriesSlug, authorId }) => {
  const [traces, setTraces] = useState<DirtySceneTrace[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<DirtySceneTrace | null>(null);
  const [rewriteProse, setRewriteProse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reloadTraces = () => {
    factsClient.getStalenessTraces(seriesSlug).then(setTraces);
  };

  useEffect(() => {
    reloadTraces();
    const evt = new EventSource(`/api/stream?series=${seriesSlug}`);
    evt.addEventListener('SCENE_DIRTIED', () => reloadTraces());
    return () => evt.close();
  }, [seriesSlug]);

  const handleReconcile = async (mode: 'REWRITE_REBASE' | 'STILL_GOOD_REPIN') => {
    if (!selectedTrace) return;
    setSubmitting(true);
    try {
      await factsClient.submitReconciliation({
        seriesSlug,
        sceneId: selectedTrace.sceneId,
        factId: selectedTrace.factId,
        mode,
        updatedProseText: mode === 'REWRITE_REBASE' ? rewriteProse : undefined,
        authorId,
      });
      setSelectedTrace(null);
      setRewriteProse('');
      reloadTraces();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-stone-950 border border-stone-800 rounded p-4 font-mono text-xs">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-red-400 uppercase tracking-wider">
          Dirty Scene Quarantine (why-dirty CTE Walk)
        </h4>
        <span className="text-[10px] text-stone-500">Uncertified Scenes: {traces.length}</span>
      </div>

      {traces.length === 0 ? (
        <div className="p-3 bg-stone-900/40 border border-stone-800 rounded text-emerald-400">
          >> [ALL CLEAN] No downstream scenes hold stale fact versions. Production airlock clear.
        </div>
      ) : (
        <div className="space-y-2">
          {traces.map((trace) => (
            <div key={`${trace.sceneId}-${trace.factId}`} className="p-3 bg-stone-900 border border-stone-800 rounded flex justify-between items-center">
              <div>
                <span className="font-bold text-stone-200">{trace.sceneId}</span> (EP {trace.episodeNum}, SC {trace.sceneNum})
                <p className="text-[11px] text-red-400 mt-1">
                  Breach: Fact [{trace.factId}] advanced from pinned v{trace.pinnedVersion} to active v{trace.currentVersion}
                </p>
              </div>
              <button
                onClick={() => { setSelectedTrace(trace); setRewriteProse(''); }}
                className="px-3 py-1 bg-amber-600/20 text-amber-300 border border-amber-600/40 rounded hover:bg-amber-600/30"
              >
                Reconcile
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedTrace && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-700 rounded p-6 max-w-xl w-full">
            <h3 className="font-bold text-stone-100 text-sm mb-2">Reconcile Scene: {selectedTrace.sceneId}</h3>
            <p className="text-stone-400 text-xs mb-4">
              Fact <code className="text-amber-400">{selectedTrace.factId}</code> mutated. Choose how to re-certify:
            </p>

            <div className="mb-4">
              <label className="block text-stone-400 mb-1">Optional Prose Rewrite (Path A: REWRITE_REBASE):</label>
              <textarea
                value={rewriteProse}
                onChange={(e) => setRewriteProse(e.target.value)}
                placeholder="Leave blank if selecting STILL GOOD..."
                className="w-full bg-stone-950 border border-stone-800 p-2 text-stone-200 rounded text-xs h-24 font-mono"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                disabled={submitting}
                onClick={() => setSelectedTrace(null)}
                className="px-3 py-1.5 text-stone-400 border border-stone-700 rounded"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={() => handleReconcile('STILL_GOOD_REPIN')}
                className="px-3 py-1.5 bg-stone-800 text-emerald-400 border border-emerald-600/40 rounded"
              >
                Affirm "Still Good" (Path B)
              </button>
              <button
                disabled={submitting || !rewriteProse.trim()}
                onClick={() => handleReconcile('REWRITE_REBASE')}
                className="px-3 py-1.5 bg-amber-600 text-black font-bold rounded disabled:opacity-50"
              >
                Commit Rewrite (Path A)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### 3. Real-Time Append-Only Event Log Stream (`EventLogStreamTable.tsx`)

Renders the monotonic sequence of verified historical events and displays their **Spatial Audit Quadruple** proofs.

```typescript
// apps/dashboard/src/components/telemetry/EventLogStreamTable.tsx
import React, { useEffect, useState } from 'react';
import type { TelemetryEventRecord } from '../../types/ledger';
import { ledgerClient } from '../../services/ledgerClient';

export const EventLogStreamTable: React.FC<{ seriesSlug: string }> = ({ seriesSlug }) => {
  const [events, setEvents] = useState<TelemetryEventRecord[]>([]);

  useEffect(() => {
    // Initial Hydration
    ledgerClient.streamEvents(seriesSlug, 0, 50).then(setEvents);

    // Reactive SSE Ingress
    const sse = new EventSource(`/api/stream?series=${seriesSlug}`);
    sse.addEventListener('EVENT_APPENDED', (e: MessageEvent) => {
      const newEvt = JSON.parse(e.data) as TelemetryEventRecord;
      setEvents((prev) => [newEvt, ...prev].slice(0, 100)); // Maintain rolling 100-event buffer
    });

    return () => sse.close();
  }, [seriesSlug]);

  return (
    <div className="bg-stone-950 border border-stone-800 rounded p-4 font-mono text-xs">
      <div className="flex justify-between items-center mb-3 border-b border-stone-800 pb-2">
        <h3 className="font-bold text-amber-400 uppercase tracking-wider">
          Event Ledger: Immutable Event Stream
        </h3>
        <span className="text-[10px] text-stone-500">Total Monotonic Events Cached: {events.length}</span>
      </div>

      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left">
          <thead className="text-stone-500 sticky top-0 bg-stone-950 border-b border-stone-800">
            <tr>
              <th className="py-2">SEQ</th>
              <th className="py-2">TICK</th>
              <th className="py-2">EVENT TYPE</th>
              <th className="py-2">ACTOR</th>
              <th className="py-2">EVENT HASH</th>
              <th className="py-2">SPATIAL PROOF (RECEIPT HASH)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-900">
            {events.map((evt) => (
              <tr key={evt.eventId} className="hover:bg-stone-900/30">
                <td className="py-1.5 font-bold text-amber-500">#{evt.sequenceId}</td>
                <td className="py-1.5 text-stone-400">t={evt.tick}</td>
                <td className="py-1.5 text-stone-200">{evt.eventType}</td>
                <td className="py-1.5 text-stone-400">{evt.actorId ?? 'SYSTEM'}</td>
                <td className="py-1.5 text-stone-500 font-mono text-[10px]">
                  {evt.eventHash ? evt.eventHash.slice(0, 8) + '...' : 'GENESIS'}
                </td>
                <td className="py-1.5 text-[10px]">
                  {evt.proof?.receiptHash ? (
                    <span className="text-emerald-500" title={`Query: ${evt.proof.queryHash}`}>
                      ✓ {evt.proof.receiptHash.slice(0, 8)}...
                    </span>
                  ) : (
                    <span className="text-stone-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

### VI. The Astro Page Container

Finally, `src/pages/telemetry/facts.astro` binds these React islands into an operational view protected by server-side series scoping.

```code
---
// apps/dashboard/src/pages/telemetry/facts.astro
import ScopeSwitchboard from '../../components/backstage/ScopeSwitchboard.astro';
import { FactCentralityMatrix } from '../../components/telemetry/FactCentralityMatrix';
import { SceneStalenessAudit } from '../../components/telemetry/SceneStalenessAudit';
import { EventLogStreamTable } from '../../components/telemetry/EventLogStreamTable';

const seriesSlug = Astro.url.searchParams.get('series') || 'under-the-floorboards';
const availableSeries = ['under-the-floorboards', 'wiregrass-basin', 'deep-space-salvage'];
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Series Dashboard :: Ledger Telemetry & Facts</title>
  </head>
  <body class="bg-black text-stone-200 min-h-screen p-6 font-sans">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Shard Switchboard -->
      <ScopeSwitchboard activeSeriesSlug={seriesSlug} availableSeries={availableSeries} />

      <!-- Top Row: Facts Centrality and Staleness Quarantine -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FactCentralityMatrix client:load seriesSlug={seriesSlug} />
        <SceneStalenessAudit client:load seriesSlug={seriesSlug} authorId="showrunner_01" />
      </div>

      <!-- Bottom Row: Event Stream Table -->
      <EventLogStreamTable client:load seriesSlug={seriesSlug} />
    </div>
  </body>
</html>
```

### Summary of What This Code Achieves

1. **Enforces Architectural Decoupling:** `Series-Dashboard` imports zero backend SQLite or database drivers directly; it acts as a lightweight, reactive telemetry consumer and intent dispatcher.
2. **Real-Time Staleness Auditing:** Directly executes the recursive CTE why-dirty query and displays the **Monolithic Spine Hazard ($k_{\text{in}} \ge 15$)** to prevent catastrophic story collapse.
3. **Preserves the $T_0 = \$0.00$ Invariant:** Director interactions are dispatched as structured intents validated against strict Zod schemas and somatic masks before expensive speech synthesis or GPU rendering can ever be triggered.
