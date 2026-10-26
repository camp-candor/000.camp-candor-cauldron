`goblin-viewport` serves as the **deterministic video compositing engine and presentation layer** for the episodic generation pipeline. Built around **Remotion** (React-based programmatic video rendering), it acts as a digital optical printer that translates upstream narrative state, locked audio stems, and visual plates into final broadcast MP4 deliverables.

---

### 1. Role in the Production Pipeline

In the system topology, `goblin-viewport` represents the **representational counterpart** to `worker-sower-engine` (the upstream epistemological simulation engine on Rig 1):

* **Meaning vs. Representation:** The Sower decides *meaning* (narrative conflict, emotion states, somatic damage) while remaining completely visual-agnostic. `goblin-viewport` decides *representation* (mapping an emotion like `humiliated` to specific sprite textures, coordinates, and optical effects).


* **Upstream Ingestion:** It sits at the final handoff, ingesting:


1. A quantized timing manifest and scene AST from `worker-sower-engine`.


2. TTS `.wav` stems synthesized by `audio-microservice` and locked to integer frame counts at 24 fps via `ffprobe`.


3. Sprites, backgrounds, and `manifest.json` contracts from `goblin-assets-visual` (or keyed greenscreen diffusion plates synthesized by ComfyUI).





---

### 2. The Architectural Shift: Scaffolding over Long-Lived App

Rather than remaining a single, long-lived rendering app that repeatedly ingests mutable `scene.json` payloads at runtime (which causes historical renders to break whenever React components are updated), the project transitioned to **`goblin-viewport-template`**:

* **Source-Baking Pattern:** A generator script (`generate-episode-repo.ts`) consumes the narrative AST and stamps out an isolated, self-contained directory inside `goblin-episodes/` per episode.


* **Hardcoded Source Code:** Start/end frames, audio offsets, camera cues, and mouth visemes are baked directly into a dedicated, committed TypeScript composition (e.g., `Episode_040.tsx`) rather than resolved dynamically.


* **Strict Reproducibility:** Paired with an immutable `render_manifest.json` freezing the exact Git commit SHAs of all dependencies (`goblin-bible`, `goblin-assets-visual`, `worker-sower-engine`), any episode can be re-rendered years later with bit-identical fidelity.



---

### 3. Core Compositing Responsibilities

Within Remotion, `goblin-viewport` executes several programmatic rendering passes:

* **Cutout Puppetry (`GoblinPuppet.tsx`):** Swaps character emotion base sprites and overlays frame-synchronized mouth visemes (`closed`, `small`, `medium`, `wide`) derived from dialogue audio energy profiles.


* **Greenscreen Chroma Keying:** When compositing diffusion character plates rendered against `#00FF00`, it applies an algorithmic chroma-key filter (`colorKey` with despill and edge smoothing) to layer characters cleanly over hand-painted background mattes without diffusion background warping.


* **Mathematical Camera Systems:** Executes non-warping camera transforms via linear interpolation (`interpolate`), including subtle push-ins (e.g., scaling 1.0 to 1.05 over 120 frames), horizontal pans, and high-frequency coordinate noise for screen shakes.


* **Acoustic Ducking:** Synchronizes dialogue, punctual spot foley (`FoleyTrack.tsx`), and continuous background beds, calculating an automated sidechain ducking curve that suppresses background music and room tone by **-14 dB** during speech.



---

### 4. Manifest Contracts & Asset Management

* **`manifest.json` as Contract:** `goblin-viewport` never guesses filenames or dynamic layouts. It consumes versioned manifests from `goblin-assets-visual` specifying anatomical anchor points (`anchor_point` for foot ground pivots), camera offsets (`crash_zoom_target` for facial framing), per-character motion scalars (`talk_bounce_amplitude`), and explicit null fallbacks.


* **Asset Pruning (`collect-episode-assets.ts`):** To avoid project bloat and honor the per-episode storage ceiling (< 100MB to 150MB), a pre-render collector parses the scene AST and copies only the specific sprites, visemes, and backgrounds used in that episode, cutting asset footprint by ~90%.


* **Sync Harness (`sync-assets.ts`):** Clones pinned tags (such as `latest-stable` or semver releases like `v1.4.0`) directly into `public/assets/visual/`, avoiding the overhead and pitfalls of Git submodules.



---

### 5. Execution Profile & Architectural Boundary

* **Pure CPU/RAM Workload:** Because it relies on `@remotion/renderer` driving headless Chromium, it runs entirely on **Rig 1** (the CPU orchestration host) and uses zero GPU compute or VRAM.


* **Crash Prevention:** It uses software rendering (`gl: 'swangle'`) and off-thread media decoding (`<OffthreadVideo/>`) with locked concurrency to avoid headless Linux OpenGL memory leaks.


* **Component Drift Fixes:** To prevent old episodes from silently drifting when shared components change, the pipeline requires episodes to either vendor their render primitives, pin to an immutable npm package (e.g., `@studio/viewport@1.4.2`), or lock an exact submodule commit.

Yes, they represent **two different stages of the video compositing architecture**—a shift from a mutable, long-lived rendering app to an immutable metaprogramming generator.

The breakdown of their differences, how they relate, and why the pivot was made:

---

### 1. The Core Conceptual Difference

| Dimension | `goblin-viewport` (The Legacy Concept) | `goblin-viewport-template` (The Current Architecture) |
| --- | --- | --- |
| **Architectural Model** | **A single, long-lived application**.

 | **A metaprogram / scaffolding template**.

 |
| **Execution Pattern** | Ingested mutable external payloads (e.g., `scene.json`) dynamically at runtime to render videos.

 | A generator script (`generate-episode-repo.ts`) uses the template to **stamp out an independent, committed folder/repo per episode**.

 |
| **Timeline Definition** | Parsed dynamic sidecar JSON files on the fly during rendering.

 | **Source-Baking:** locked frames, audio paths, and mouth visemes are baked into static TypeScript source code (e.g., `Episode_040.tsx`).

 |
| **Output Lifecycle** | Ephemeral renders inside one shared, constantly changing working directory.

 | Produces isolated, permanent directories inside `goblin-episodes/` accompanied by a frozen `render_manifest.json`.

 |

---

### 2. Why the Shift Happened: The Historical Corruption Trap

In the original `goblin-viewport` model, running an episode meant feeding `scene_012.json` into the root Remotion app.

However, as the show evolved:

* When shared visual primitives (like `GoblinPuppet.tsx` or camera spring easing curves) were refactored for Episode 40, attempting to re-render Episode 12 against that same codebase caused **silent visual regressions**.


* Mouth visemes detached from character faces, camera zooms misaligned, and timing rubber-banded because the rendering engine had changed out from under the old JSON payload.



**`goblin-viewport-template` solved this** by turning the viewport from a *runtime player* into a *code-generation stamp*. When an episode is produced:

1. The template's generator reads upstream timing and scene ASTs.


2. It generates a self-contained, versioned TypeScript composition (`Episode_XXX.tsx`).


3. It locks the commit SHAs of all dependencies (`goblin-bible`, `goblin-assets-visual`, `worker-sower-engine`) in a `render_manifest.json`.



---

### 3. How the Pipeline Uses Them Today

In current repository topologies, you often see `goblin-viewport` used casually as the **general system role** (the "downstream optical printer/Remotion engine" in pipeline diagrams), while `goblin-viewport-template` is the **actual underlying codebase and blueprint**:

* **`goblin-viewport-template` holds the canonical scaffolding:** It owns `src/Root.tsx`, generic compositing components like `GoblinPuppet.tsx` and `FoleyTrack.tsx`, and the asset synchronization harness (`scripts/sync-assets.ts`).


* **The generator stamps the deliverable:** It takes those primitives and creates the concrete episode implementation inside `goblin-episodes/` (e.g., `goblin-episodes/ep040/`).



The **`goblin-viewport-template`** is the template engine that stamps out isolated code, whereas the older **`goblin-viewport`** pattern was the monolithic, long-lived player that repeatedly rendered changing JSON over mutable code.

Yes, exactly.

Moving forward, the active repository to maintain and develop is **`goblin-viewport-template`** (the generator/scaffolding engine), while the legacy **`goblin-viewport`** (as a long-lived, monolithic rendering target) is retired.

---

### How the Repositories Divide Moving Forward

* **`goblin-viewport-template` (What you build/maintain):**
This repository holds the canonical boilerplate, shared React presentation components (e.g., `GoblinPuppet.tsx`, `AmbientTrack.tsx`), the asset-harvesting tools (`scripts/sync-assets.ts`, `collect-episode-assets.ts`), and the metaprogram generator script (`generator/generate-episode-repo.ts`). It is a **template and compiler**, never an episode runtime.


* **`goblin-episodes/` (What the template stamps out):**
The generator reads the compiled dialogue/timing AST from `worker-sower-engine` and stamps out dedicated, self-contained directories or repositories (e.g., `goblin-episodes/episode-040/`). Each episode contains its own baked `Episode_040.tsx` (with frame counts and coordinates hardcoded as literals), its local dialogue audio stems, harvested sprites, and an immutable `render_manifest.json`.


* **`goblin-viewport` (Legacy / Concept):**
This was the original single-app pattern that ingested dynamic `scene.json` files at render time. It is discarded to eliminate the "historical corruption trap," where updating a shared component for Episode 40 would silently break or misalign the visuals of Episode 12.



(Note: In high-level architecture maps, pipeline diagrams may still casually use the functional label "viewport" or "Remotion viewport" to denote the compositing stage, but on disk and in Git, the foundational codebase is `goblin-viewport-template`.)

Yes, exactly. In the pipeline architecture, that is one of the primary integration points for **`repo-bot`**.

When `generate-episode-repo.ts` executes the **source-baking pattern** to stamp out dedicated directories or repositories (e.g., `goblin-episodes/episode-040/`), treating that handoff as an interaction with `repo-bot` keeps the pipeline deterministic, isolated, and auditable.

---

### How the Interaction Works

```text
               UPSTREAM STAGE LOCK
  [ worker-sower-engine ] + [ audio-microservice (ffprobe) ]
                         │
                         ▼
        ┌───────────────────────────────────┐
        │  repo-bot (Cloudflare Worker)     │
        └─────────────────┬─────────────────┘
                          │ Triggers metaprogram with pinned refs
                          ▼
        ┌───────────────────────────────────┐
        │     goblin-viewport-template      │
        │  (generator/generate-episode-repo)│
        └─────────────────┬─────────────────┘
                          │
                          │ Stamps & Bakes: Episode_040.tsx + render_manifest.json
                          ▼
        ┌───────────────────────────────────┐
        │         goblin-episodes/          │
        │     (episode-040 workspace)       │
        └─────────────────┬─────────────────┘
                          │
                          ▼ Pull Request / Commit Notification
        ┌───────────────────────────────────┐
        │  repo-bot PR Audit & Locking      │
        │  • Asserts sealed file checksums  │
        │  • Locks versions.json snapshot   │
        └───────────────────────────────────┘

```

---

### Why Involving `repo-bot` Here Adds Structural Value

1. **Triggering the Metaprogram Out-of-Band**
Rather than having the local media rendering scripts directly manipulating Git remotes or running elevated credentials, `repo-bot` acts as the coordinator. When upstream Child Graphs lock the dialogue `.wav` stems and timing manifests, `repo-bot` initiates the stamping process via the GitHub API or a repository dispatch event.


2. **Automating PR Provisioning & Workspace Setup**
If an episode is configured as a dedicated repository or a segregated branch inside `goblin-episodes`, `repo-bot` handles the mechanics: cutting the branch, running the generator, and opening an automated Pull Request (e.g., `feat/render-ep040`).


3. **Enforcing the Sealed File Contract (`@locked` vs. `@generated`)**
When the generator writes `Episode_040.tsx`, it embeds a SHA-256 header checksum (`// @checksum: ...`). `repo-bot`'s PR scope auditor inspects incoming changes to ensure machine generation does not overwrite a director's hand-tuned easing curves or manual `@locked` interventions.


4. **Locking the Meta-Repo Snapshot (`versions.json`)**
Once the episode folder is stamped, `repo-bot` queries the exact commit SHAs of `goblin-bible`, `goblin-assets-visual`, `goblin-viewport-template`, and `worker-sower-engine`. It writes the frozen release manifest (`releases/episode-040.json`) into `goblin-project`, ensuring bit-identical reproducibility years later.


5. **Blast-Radius Containment**
Live rendering runtimes and headless Chromium compositors run untrusted, arbitrary scripts and model outputs. By making `repo-bot` the gatekeeper that commits and manages the episode repos from the Cloudflare edge, you avoid storing elevated GitHub App credentials or PATs inside the media execution environment.

The complete handoff chain running from the narrative simulation core in **`worker-sower-engine`** to the code-generation template in **`goblin-viewport-template`** follows a strict separation between **meaning** (narrative truth) and **representation** (programmatic rendering).

---

### Step 1: Upstream State & Simulation (Core Sower)

1. **Canon Law Ingestion:** `worker-sower-engine` performs a read-only filesystem read of compiled world truth (`characters.json`, `grievances.json`, `locations.json`) from `goblin-lore` (`000.goblin-lore`).


2. **Relational Ledger Evaluation:** The simulation checks mutable states (actor hex coordinates, paranoia clocks, resentment accumulations, somatic trauma) stored in the dynamic relational ledger (SQLite/PostgreSQL).


3. **Stage 3 Selection:** Proximity sweeps and PRNG lotteries evaluate active grievance cooldowns and tension scores to select the acting pair and active conflict.


4. **Stage 4 Mechanical Gauntlet:** The engine computes argument resolution mathematically (2d6 duel math against Spite and Cunning margins) and atomically mutates the ledger.


5. **AST Compilation:** The simulation core emits an abstract narrative deliverable—`dialogue_ast.json` (dialogue lines, speaker identifiers, emotional subtext tags, and motor action arrays)—free of any video or rendering dependencies.



---

### Step 2: Conductor Orchestration (`produceEpisode.ts`)

The orchestrator harness inside `worker-sower-engine/src/pipeline/produceEpisode.ts` captures `dialogue_ast.json` and bridges external services without polluting the simulation core:

1. **Acoustic Synthesis:** Dispatches dialogue text via HTTP POST to the local TTS microservice (port 8000) to synthesize uncompressed speech `.wav` stems.


2. **Temporal Clock Quantization (`ffprobe`):** Runs an automated `ffprobe` inspection on each generated `.wav` to measure millisecond durations and compute the non-negotiable integer frame count at 24 fps:



$$\text{target\_frames} = \left\lceil \left(\frac{\text{duration\_ms}}{1000}\right) \times 24 \right\rceil$$


3. **Exposure Sheet Assembly:** Locks frame budgets and audio stem offsets, combining them with ambient bed markers and Foley cue triggers into an `exposure_sheet.json` / timing manifest.



---

### Step 3: Visual Sourcing & Asset Extraction

1. **Asset Path Resolution:**
* **2D Cutout Workflow:** Reads the immutable `manifest.json` contract for each character from `goblin-assets-visual`, extracting sprite baselines, condition variants (e.g., `bog_humiliated.png`), anatomical ground pivots (`anchor_point`), facial targets (`crash_zoom_target`), and mouth viseme bounding boxes.


* **Greenscreen Diffusion Workflow (Optional/Hybrid):** Constructs a `SpokeExecutionPayload` containing prompts, seeds, and the exact `target_frames` budget, dispatching it to `edge-director` / `media-broker` on Rig 2 to sample `#00FF00` character plates and sync back through Cloudflare R2.




2. **Trace & Provenance Capture:** Packages the active Git commit SHAs of `goblin-lore` / `goblin-bible`, `goblin-assets-visual`, and `worker-sower-engine`, along with the episode ID and canvas specs (e.g., 1280×720 at 24 fps).



---

### Step 4: Metaprogram Invocation (`goblin-viewport-template`)

`worker-sower-engine` (or `repo-bot` listening to an orchestration dispatch) invokes the generator script inside `goblin-viewport-template`:

```text
worker-sower-engine (Conductor)
       │ (Payload: dialogue AST, ffprobe timings, asset manifests, commit SHAs)
       ▼
goblin-viewport-template/generator/generate-episode-repo.ts

```

1. **Target Directory Scaffolding:** `generate-episode-repo.ts` clones or copies template presentation primitives (such as `GoblinPuppet.tsx`, `AmbientTrack.tsx`, and `remotion.config.ts`) into a dedicated, isolated workspace inside `goblin-episodes/` (e.g., `goblin-episodes/episode-040/`).


2. **Selective Asset Pruning (`collect-episode-assets.ts`):** Parses the episode's AST to harvest only the specific background mattes, condition sprites, and viseme textures referenced in that script, copying them locally to enforce the < 100MB per-episode storage ceiling.


3. **Source-Baking Transformation:** Rather than passing dynamic JSON to be parsed at render time, the generator compiles the data into a static, hardcoded TypeScript composition—**`Episode_040.tsx`**:


* Dialogue window frame boundaries (`from={0} durationInFrames={75}`) are hardcoded directly into `<Sequence>` tags.


* Audio file references and ducking cues (`-14 dB` attenuation during speech) are written as concrete literals.


* Sprite offsets, camera zooms (`interpolate(frame, ...)`), and mouth-viseme placements are burned directly into JSX properties.




4. **Provenance Sealing:** Writes `render_manifest.json` into the episode root, recording the cycle ID, generation timestamp, asset lists, and exact commit hashes across all participating repositories.



---

### Step 5: Headless Execution & Delivery

1. **Pre-flight Linting (`!MissingAssets`):** An automated audit validates that all baked sprite paths, audio waveforms, and viseme files exist on disk in the new episode workspace.


2. **Deterministic Optical Printing:** The conductor triggers the Remotion CLI inside the stamped directory:
```bash
npx remotion render Episode_040 out.mp4 --gl=swangle --concurrency=1

```


Executing on Rig 1's CPU/RAM using software OpenGL and off-thread media decoding prevents VRAM collisions or browser memory leaks.


3. **Git Freeze:** The rendered broadcast MP4 and the baked `Episode_040.tsx` composition are committed to `goblin-episodes`, creating a permanent, bit-identical historical artifact that never drifts when shared components change.

The complete handoff chain running from the narrative simulation core in **`worker-sower-engine`** to the code-generation template in **`goblin-viewport-template`** follows a strict separation between **meaning** (narrative truth) and **representation** (programmatic rendering).

---

### Step 1: Upstream State & Simulation (Core Sower)

1. **Canon Law Ingestion:** `worker-sower-engine` performs a read-only filesystem read of compiled world truth (`characters.json`, `grievances.json`, `locations.json`) from `goblin-lore` (`000.goblin-lore`).


2. **Relational Ledger Evaluation:** The simulation checks mutable states (actor hex coordinates, paranoia clocks, resentment accumulations, somatic trauma) stored in the dynamic relational ledger (SQLite/PostgreSQL).


3. **Stage 3 Selection:** Proximity sweeps and PRNG lotteries evaluate active grievance cooldowns and tension scores to select the acting pair and active conflict.


4. **Stage 4 Mechanical Gauntlet:** The engine computes argument resolution mathematically (2d6 duel math against Spite and Cunning margins) and atomically mutates the ledger.


5. **AST Compilation:** The simulation core emits an abstract narrative deliverable—`dialogue_ast.json` (dialogue lines, speaker identifiers, emotional subtext tags, and motor action arrays)—free of any video or rendering dependencies.



---

### Step 2: Conductor Orchestration (`produceEpisode.ts`)

The orchestrator harness inside `worker-sower-engine/src/pipeline/produceEpisode.ts` captures `dialogue_ast.json` and bridges external services without polluting the simulation core:

1. **Acoustic Synthesis:** Dispatches dialogue text via HTTP POST to the local TTS microservice (port 8000) to synthesize uncompressed speech `.wav` stems.


2. **Temporal Clock Quantization (`ffprobe`):** Runs an automated `ffprobe` inspection on each generated `.wav` to measure millisecond durations and compute the non-negotiable integer frame count at 24 fps:



$$\text{target\_frames} = \left\lceil \left(\frac{\text{duration\_ms}}{1000}\right) \times 24 \right\rceil$$


3. **Exposure Sheet Assembly:** Locks frame budgets and audio stem offsets, combining them with ambient bed markers and Foley cue triggers into an `exposure_sheet.json` / timing manifest.



---

### Step 3: Visual Sourcing & Asset Extraction

1. **Asset Path Resolution:**
* **2D Cutout Workflow:** Reads the immutable `manifest.json` contract for each character from `goblin-assets-visual`, extracting sprite baselines, condition variants (e.g., `bog_humiliated.png`), anatomical ground pivots (`anchor_point`), facial targets (`crash_zoom_target`), and mouth viseme bounding boxes.


* **Greenscreen Diffusion Workflow (Optional/Hybrid):** Constructs a `SpokeExecutionPayload` containing prompts, seeds, and the exact `target_frames` budget, dispatching it to `edge-director` / `media-broker` on Rig 2 to sample `#00FF00` character plates and sync back through Cloudflare R2.




2. **Trace & Provenance Capture:** Packages the active Git commit SHAs of `goblin-lore` / `goblin-bible`, `goblin-assets-visual`, and `worker-sower-engine`, along with the episode ID and canvas specs (e.g., 1280×720 at 24 fps).



---

### Step 4: Metaprogram Invocation (`goblin-viewport-template`)

`worker-sower-engine` (or `repo-bot` listening to an orchestration dispatch) invokes the generator script inside `goblin-viewport-template`:

```text
worker-sower-engine (Conductor)
       │ (Payload: dialogue AST, ffprobe timings, asset manifests, commit SHAs)
       ▼
goblin-viewport-template/generator/generate-episode-repo.ts

```

1. **Target Directory Scaffolding:** `generate-episode-repo.ts` clones or copies template presentation primitives (such as `GoblinPuppet.tsx`, `AmbientTrack.tsx`, and `remotion.config.ts`) into a dedicated, isolated workspace inside `goblin-episodes/` (e.g., `goblin-episodes/episode-040/`).


2. **Selective Asset Pruning (`collect-episode-assets.ts`):** Parses the episode's AST to harvest only the specific background mattes, condition sprites, and viseme textures referenced in that script, copying them locally to enforce the < 100MB per-episode storage ceiling.


3. **Source-Baking Transformation:** Rather than passing dynamic JSON to be parsed at render time, the generator compiles the data into a static, hardcoded TypeScript composition—**`Episode_040.tsx`**:


* Dialogue window frame boundaries (`from={0} durationInFrames={75}`) are hardcoded directly into `<Sequence>` tags.


* Audio file references and ducking cues (`-14 dB` attenuation during speech) are written as concrete literals.


* Sprite offsets, camera zooms (`interpolate(frame, ...)`), and mouth-viseme placements are burned directly into JSX properties.




4. **Provenance Sealing:** Writes `render_manifest.json` into the episode root, recording the cycle ID, generation timestamp, asset lists, and exact commit hashes across all participating repositories.



---

### Step 5: Headless Execution & Delivery

1. **Pre-flight Linting (`!MissingAssets`):** An automated audit validates that all baked sprite paths, audio waveforms, and viseme files exist on disk in the new episode workspace.


2. **Deterministic Optical Printing:** The conductor triggers the Remotion CLI inside the stamped directory:
```bash
npx remotion render Episode_040 out.mp4 --gl=swangle --concurrency=1

```


Executing on Rig 1's CPU/RAM using software OpenGL and off-thread media decoding prevents VRAM collisions or browser memory leaks.


3. **Git Freeze:** The rendered broadcast MP4 and the baked `Episode_040.tsx` composition are committed to `goblin-episodes`, creating a permanent, bit-identical historical artifact that never drifts when shared components change.### 1. Static Canon Ingestion vs. Mutable Relational State

The engine enforces a strict boundary between immutable compile-time law and dynamic runtime variables. The Sower operates on the principle that **canon law is read-only**, while the **relational ledger is stateful and transactional**:

```text
┌──────────────────────────────────────────────────────────┐
│  000.goblin-lore (@snailicid3/consumer-npm)              │
│  • Immutable Schemas: characters.json, grievances.json   │
│  • Byte-identical compiled/bible-state.json (read-only)  │
└────────────────────────────┬─────────────────────────────┘
                             │ Direct local filesystem read
                             ▼
┌──────────────────────────────────────────────────────────┐
│  DYNAMIC RELATIONAL LEDGER (worker-sower-engine)         │
│  • Host: Local SQLite / PostgreSQL (zero cloud latency)  │
│  • Somatic Vectors: physical trauma, condition decay     │
│  • Spatial Hex Coordinates: actor colocation/distance    │
│  • Epistemic Vectors: secrets known, debts (Strings)     │
│  • Unified Pressure Meters: Resentment, Paranoia Clocks  │
└──────────────────────────────────────────────────────────┘

```

* **Immutable Canon Law (`000.goblin-lore`):** Ingested via local disk imports (`@snailicid3/consumer-npm`). The Sower never writes back to this repository. If a Zod schema assertion or a foreign-key slug fails validation at boot, the engine halts immediately.


* **Dynamic Relational Ledger:** Tracks the mutable state that cannot live in the static corpus:


* *Spatial Vectors:* Current hex grid positions and physical adjacency.


* *Somatic Vectors:* Physical status (e.g., `exhausted`, `brachial_plexus_severed`, `humiliated`) and inventory allocations.


* *Relational & Epistemic Vectors:* Directional debts (leverage Strings held/owed) and secrets known.


* *Unified Pressure Meters:* Decoupled meters (Somatic Fatigue, Physical Pain, Refusal Strain, Paranoia Clocks) operating under defined threshold ceilings and decay rates.





---

### 2. Stage 3: Conflict & Grievance Selection Engine

Rather than relying on unconstrained language models to invent drama, the engine algorithmically selects the scene's participants and premise:

```text
                                  RELATIONAL LEDGER
                     (Spatial Grid, Tension Counters, Cooldowns)
                                          │
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3a: DUEL PAIRING LOTTERY                                                   │
│ • Proximity sweeps identify collocated/adjacent actors                           │
│ • Relational tension, resentment accumulators, and ensemble balance weight pool  │
│ • Hard Override: Resentment ceiling breach forces a "Boil Over" duel             │
└─────────────────────────────────────────┬────────────────────────────────────────┘
                                          │ Active Pair Selected
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3b: GRIEVANCE SELECTION (Frontmatter Machine Rail)                         │
│ • Set Filter: Eligible = (SceneCast ∩ Primary) \ Excluded                        │
│ • Evaluates intensity envelope [min, max] against current cycle tension          │
│ • Filters active cooldown_cycles and biases toward active Paranoia Clocks        │
└─────────────────────────────────────────┬────────────────────────────────────────┘
                                          │ Grievance Locked
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3c: LEVERAGE EXPENDITURE HEURISTIC                                         │
│ • Simulates win probability; participant expends Strings if win odds dip low     │
└──────────────────────────────────────────────────────────────────────────────────┘

```

* **Pre-Selection Override (The Boil Over):** Before standard lottery weighting runs, the engine checks whether any pair's resentment accumulator has crossed its threshold ceiling. If breached, normal selection is bypassed, and a confrontation between that pair is immediately forced.


* **Pairing Lottery (Stage 3a):** Filters actors based on physical proximity (same or adjacent hex coordinates), scoring them against relational tension, recent interaction cycles, and ensemble balance counters.


* **Grievance Resolution (Stage 3b):** Matches the chosen pair against candidate grievances from `grievances.json` via the Machine Rail:



$$\text{Eligible} = (\text{SceneCast} \cap \text{Primary}) \setminus \text{Excluded} \quad \text{where} \quad \text{Intensity} \in [\text{Min}, \text{Max}] \land \text{Cooldown} = 0$$




Selection weights increase if the grievance matches the category of an active Paranoia Clock or unresolved narrative thread.



---

### 3. Stage 4: Mechanical Duel Resolution

Conflict outcomes are determined mathematically using deterministic dice mechanics:

$$\text{Argument Score } (A) = (\text{Base} + \text{Roll}) + (\text{Strings Spent} \times W) - (\text{Debuffs} \times P)$$

* **Base:** Character attribute (Spite, Cunning, or Charm) ranging from 1 to 5.


* **Roll:** Simulated $2\text{d}6$ roll. Tight modifiers preserve dramatic variance around the bell curve (where 7 occurs 16.7% of the time, and 2 or 12 occur only 2.78%).


* **$W$ (String Weight):** Constant determining genre tone (e.g., $W=3$ creates structured blackmail leverage; lower values create chaotic reversals).


* **$P$ (Penalty Weight):** Negative condition debuffs (typically $-2$ per active condition).



#### The Outcome Taxonomy Classifier

The resulting margin and leverage state map the encounter into one of five structural shapes:

| Outcome Type | Mechanical Trigger | Ledger Mutation & Narrative Directives |
| --- | --- | --- |
| **Clean Win**<br> | Margin $\ge 4$, zero Strings spent.

 | Loser gains 1 condition (e.g., `humiliated`); winner receives clean validation.

 |
| **Costly Win**<br> | Narrow margin, OR winner spent $\ge 2$ Strings.

 | Winner and loser both gain a condition; a third-party witness gains a String on the winner.

 |
| **Mutual Wound**<br> | Near-tie (margin of 1–2 points).

 | Both participants gain conditions; active Paranoia Clock receives a small tick.

 |
| **Backfire**<br> | Winner spent a String tied to an over-escalated, stale grievance.

 | Social result flips: nominal winner loses the String, gains `humiliated`, and nominal loser gains status.

 |
| **True Tie**<br> | Exact score equality.

 | Both gain conditions; Paranoia Clock increments by a full segment.

 |

(Note: If a character's composure/HP hits 0 or a character with the `goes_silent` trait fails a Mutual Wound, the engine fires a **Withdrawal**, halving grievance cooldowns and applying the `cowardice` condition.)

---

### 4. Stage 5: Semantic Drafting & Invariant Linters ($T_0$)

With the mathematical winner, loser, and state mutations locked atomically ($S_n \to S_{n+1}$), the Sower generates the actual scene text without allowing narrative hallucination:

```text
┌────────────────────────────────────────────────────────┐
│ PROMPT COMPILATION & CONTEXT SANITIZATION             │
│ • Injects Voice Rail subtext (Surface Argument vs.     │
│   The Underneath)                                      │
│ • Ignorance by Omission: sanitizes secrets characters  │
│   do not epistemically know                            │
│ • Refusal Vectors & Swain MRU causality constraints    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ LOCAL INFERENCE (Qwen 2.5 on Rig 1 CPU/RAM)            │
│ • Constrained by GBNF Grammar / JSON mode              │
│ • Demuxer splits output:                               │
│   1. Human-readable screenplay: scene.fountain         │
│   2. Structured machine contract: dialogue_ast.json    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ PANOPTICON INVARIANT GAUNTLET (T_0)                    │
│ • O(1) Set-Intersection:                               │
│   extracted_motor_actions ∩ banned_kinetic_verbs       │
│ • Verb-Lemma Scan reconciles claims against prose      │
│ • Fail: Immediate bounded retry / patch loop           │
│ • Pass: Release to Conductor (produceEpisode.ts)       │
└────────────────────────────────────────────────────────┘

```

1. **Context Sanitization:** Follows "Ignorance by Omission". If an actor does not hold an epistemic secret ID, all references to that secret are stripped from their context to prevent attention-head leakage.


2. **Dual-Artifact Generation:** Generates the human-readable `.fountain` prose while simultaneously extracting discrete `extracted_motor_actions` into `dialogue_ast.json`.


3. **The Panopticon Gauntlet ($T_0$):** Executes an $O(1)$ set-intersection check against the actor's active somatic restrictions (e.g., verifying a character with `brachial_plexus_severed` does not attempt two-handed actions). A secondary verb-lemma sweep confirms the prose does not contradict the declared enum tokens.


4. **Handoff:** Only after the AST is verified does the pure simulation emit the sealed manifest to the conductor harness (`src/pipeline/produceEpisode.ts`) for acoustic synthesis and downstream code generation.Within `worker-sower-engine`, **`src/pipeline/produceEpisode.ts`** functions as the master orchestration harness (the **Conductor**) on Rig 1.

While the *Core Sower* simulation handles abstract narrative truth (duel math, ledger state, and dialogue AST extraction), the Conductor acts as the bridge that crosses into physical, time-based media. It converts continuous sound into a locked temporal grid, manages hardware memory, coordinates remote GPU spokes, and compiles the concrete exposure sheet.

---

### 1. Ingestion & Dialogue Extraction

The conductor ingests the validated `dialogue_ast.json` produced by the upstream simulation core. This schema isolates spoken lines, speaker identities, emotional tags, and motor action arrays:

```typescript
// src/types/narrative.ts
export const DialogueLineSchema = z.object({
  speaker: z.string(),
  text: z.string(),
  emotion: z.string(),
  tonePacing: z.number().default(1.0)
});

export const SceneASTSchema = z.object({
  sceneId: z.string(),
  episodeId: z.string(),
  lines: z.array(DialogueLineSchema)
});

```

---

### 2. Acoustic Synthesis (Child Graph B / TTS Microservice)

The conductor treats **audio as the non-negotiable master clock**. Generative video diffusion models have no innate sense of biological cadence or speech timing; therefore, speech must exist on disk before video timelines can be calculated.

1. **VRAM Flushing:** If local GPU resources were previously used for drafting passes, the conductor issues an HTTP call to the local ComfyUI instance (`POST [http://127.0.0.1:8188/free](http://127.0.0.1:8188/free)`) to clear models from VRAM in ~300 ms, leaving headroom for vocal synthesis.


2. **Speech Generation:** The conductor iterates through the dialogue lines, issuing HTTP POST requests to the local TTS microservice (e.g., CosyVoice/Parler-TTS on `[http://127.0.0.1:8000/generate](http://127.0.0.1:8000/generate)`):


```json
{
  "character": "ELIAS",
  "text": "The relay is dead. We move now.",
  "emotion": "tense_jaw",
  "dsp_modifiers": { "pause_frequency_multiplier": 1.4 }
}

```




3. **Storage & Verification:** The uncompressed `.wav` stems are saved locally to disk (`public/audio/dialogue/`). The conductor enforces an acoustic loudness check (e.g., True-Peak $\le -1.0\text{ dBTP}$, integrated loudness targeting $-16\text{ LUFS}$) before proceeding.

---

### 3. Temporal Quantization & The Discrete Frame Math (`ffprobe`)

Because audio duration is continuous (measured in milliseconds) while video timelines are discrete (quantized to 24 fps), continuous sound must be quantized into integral frame boundaries:

#### Standard 24 fps Quantization Formula

The conductor invokes `ffprobe` as an asynchronous child process to read the exact sample length of each `.wav` buffer:

```bash
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 dialogue_sh001.wav

```

Using the millisecond duration, the 24 fps base target frame count is calculated:


$$\text{target\_frames} = \left\lceil \left(\frac{\text{duration\_ms}}{1000}\right) \times 24 \right\rceil$$

#### The $4n+1$ Diffusion Lattice Constraint

If the shot requires generative character diffusion (such as Wan 2.1 or 2.2 running on Rig 2), arbitrary frame counts will crash the model's 3D causal VAE layers. The conductor enforces a **round-up-and-trim protocol** against the model's native frame rate (e.g., 16 fps):

1. Calculate native model frames:

$$N = \left\lceil \left(\frac{\text{duration\_ms}}{1000}\right) \times 16 \right\rceil$$



2. Align to the nearest valid VAE boundary ($4n + 1$):

$$\text{diffusion\_frames} = 4 \times \left\lceil \frac{N - 1}{4} \right\rceil + 1$$



3. **Example Verification:**
* For a **3,120 ms** audio stem:

$$N = \lceil 3.120 \times 16 \rceil = 50\text{ frames}$$


$$\text{diffusion\_frames} = 4 \times \left\lceil \frac{50 - 1}{4} \right\rceil + 1 = 4(13) + 1 = \mathbf{53\text{ frames}}$$


* At 16 fps, 53 frames equals $3.3125\text{ s}$.


* The excess 3 frames are trimmed from the tail (which conveniently discards diffusion boundary degradation).


* The conformed 50 frames are retimed/interpolated (or cleanly doubled if animating "on twos" at 12 fps) to fit the locked **75-frame master delivery budget** at 24 fps ($\lceil 3.120 \times 24 \rceil = 75$).





```typescript
// src/services/audioTiming.ts
export async function quantizeAudioStem(wavPath: string, modelNativeFps = 16, deliveryFps = 24) {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", wavPath
  ]);
  const durationSec = parseFloat(stdout.trim());
  const durationMs = Math.round(durationSec * 1000);

  const rawNativeFrames = Math.ceil(durationSec * modelNativeFps);
  const n = Math.ceil((rawNativeFrames - 1) / 4);
  const diffusionFrames = 4 * n + 1; // Satisfies 4n+1 boundary
  const deliveryTargetFrames = Math.ceil(durationSec * deliveryFps);

  return { durationMs, diffusionFrames, deliveryTargetFrames };
}

```

---

### 4. Acoustic Geometry & Pacing Assembly

The conductor compiles the scene's multi-track acoustic blueprint:

```text
Track 1: Spoken Dialogue Stems (Fixed Clocks via ffprobe)
         [--------- Shot 01 ---------]          [--------- Shot 02 ---------]
Track 2: Foley Transients (Mulberry32 PRNG Seeded)
                [*valve_scrape*]                       [*boot_squelch*]
Track 3: Continuous Ambient Sound Bed (Multi-Window Min Reduction)
────┐                                 ┌──────┐                             ┌────
    │                                 │      │                             │
    └─────────────────────────────────┘      └─────────────────────────────┘
      ^ Attack (6f)    Release (12f) ^        ^ Attack (6f)   Release (12f)^

```

* **Absolute Integer Anchoring (Anti-Drift):** Audio stems are never concatenated sequentially end-to-end. Because `Math.ceil` introduces up to $41.7\text{ ms}$ (1 frame) of tail silence per shot, concatenating stems would cause cumulative drift against background music. The conductor assigns each audio stem an **absolute starting frame index** based on accumulated timeline budgets:



$$\text{fromFrame}_{k} = \sum_{i=1}^{k-1} \text{total\_shot\_frames}_i$$



* **Dwight Swain MRU Pacing Cues:** When the AST registers a cognitive shock (`VISCERAL_STING`), the conductor injects an authored pre-roll buffer (e.g., 8–24 frames of silence or held reaction) *before* the dialogue start frame.


* **Deterministic Foley Seeding:** Spot Foley cues (e.g., match strikes, mud squelches) are resolved using a seeded **Mulberry32 PRNG**:

$$\text{Seed} = \text{MurmurHash3}(\text{sceneId} + \text{":"} + \text{shotId} + \text{":"} + \text{sampleKey})$$



If a sample matches the variant drawn in the previous shot, an anti-clustering salt (`:retry`) is appended to enforce variety without non-deterministic drift across browser workers.


* **Automated Ducking Envelope:** Creates the control points for background audio beds: calculating a 6-frame quadratic attack down to **$-14\text{ dB}$** during speech windows, and a 12-frame release back to baseline volume.



---

### 5. Remote GPU Dispatch or Local Asset Binding

Depending on the scene configuration, `produceEpisode.ts` routes the visual assets through one of two channels:

#### A. 2D Cutout Sprite Mode

The conductor bypasses GPU diffusion entirely. It verifies character tags against `manifest.json` from `goblin-assets-visual`, harvesting anchor points (`crash_zoom_target`, `anchor_point`) and mapping the dialogue's audio envelope to mouth viseme tokens (`closed`, `small`, `medium`, `wide`).

#### B. Greenscreen Diffusion Plate Mode (Via Cloudflare DO & Rig 2)

The conductor connects via WebSocket to the Edge Gateway (`series-edge-orchestrator` / `edge-director`):

1. Packages the frame count, seed, prompts, and LoRAs into a `SpokeExecutionPayload`.


2. The Cloudflare Durable Object (`ShotCoordinatorDO`) places the job on a single-threaded FIFO queue and issues a 30-second heartbeat lease to Rig 2 (`media-broker`).


3. Headless ComfyUI on Rig 2 executes the Wan DAG, renders the `#00FF00` plate, uploads it to Cloudflare R2 under its SHA-256 hash, and emits a `SHOT_READY` event back down the WebSocket.



---

### 6. The Handoff: Output Contracts

Once all stems are generated, measured, and assets verified, `produceEpisode.ts` emits two primary artifacts that feed directly into `goblin-viewport-template`:

#### 1. The Timing Manifest (`exposure_sheet.json`)

```json
{
  "scene_id": "ep01_sc03",
  "fps": 24,
  "total_frames": 365,
  "shots": [
    {
      "shot_id": "ep01_sc03_sh001",
      "speaker": "ELIAS",
      "audio_stem_path": "public/audio/dialogue/ep01_sc03_sh001.wav",
      "audio_duration_ms": 3120,
      "pre_roll_frames": 8,
      "audio_frames": 75,
      "post_roll_frames": 16,
      "start_frame": 0,
      "duration_in_frames": 99,
      "ducking_db": -14.0,
      "viseme_cues": [
        { "frame": 8, "shape": "small" },
        { "frame": 12, "shape": "medium" }
      ]
    }
  ]
}

```

#### 2. Generator Invocation (`generate-episode-repo.ts`)

The conductor calls the template engine inside `goblin-viewport-template`:

```bash
tsx ../goblin-viewport-template/generator/generate-episode-repo.ts \
  --manifest ./outputs/ep01_sc03/exposure_sheet.json \
  --ast ./outputs/ep01_sc03/dialogue_ast.json \
  --out ../goblin-episodes/ep01_sc03

```

This triggers the **source-baking pattern**, compiling the timing offsets, ducking curves, and audio paths directly into literal TypeScript JSX constants (`Episode_040.tsx`) and stamping the immutable `render_manifest.json`.**Step 3: Visual Sourcing & Asset Extraction** is the deterministic architectural boundary that resolves the upstream narrative script into physical image data. It translates the semantic tags in `dialogue_ast.json` (actor identity, emotional disposition, spatial framing) into grounded, machine-computable visual layers without introducing runtime guesswork or dynamic rendering failure.

Depending on whether a scene runs as a lightweight 2D puppet cutout or a high-end diffusion plate, visual sourcing follows two explicit execution paths governed by strict contracts and provenance verification.

---

### 1. The 2D Cutout Pipeline & The Manifest Contract

For standard episodic scenes, visual sourcing reads immutable asset definitions directly from the committed state of `goblin-assets-visual`. The compositing engine never guesses filenames, globs directories, or queries loose assets; it queries **`manifest.json` as a typed API**.

#### Anatomy of the Manifest Contract

Every character directory (`goblin-assets-visual/characters/{character_id}/manifest.json`) exposes spatial invariants and motion constants that eliminate layout drift across changing screen resolutions:

* **Ground Contact Pivots (`anchor_point`):** Precise coordinate pairs (e.g., `{ "x": 512, "y": 980 }`) defining the character’s foot placement. This anchors the character to the floor plane of the background matte and prevents sliding during camera push-ins or pans.


* **Camera Focus Targets (`camera_anchor_points.crash_zoom_target`):** Explicit coordinate targets (e.g., `{ "x": 412, "y": 198 }`) centered on the facial centroid or eye line. This instructs programmatic camera directives (such as Remotion's `interpolate`) where to center close-ups, ensuring short and tall characters are framed correctly without manual keyframing.


* **Mouth Viseme Envelopes (`mouth_bounding_box`):** Coordinate rects (e.g., `{ "x": 380, "y": 240, "width": 64, "height": 32 }`) specifying the placement window for the dynamic mouth visemes (`closed`, `small`, `medium`, `wide`).


* **Motion Physics Overrides (`animation_hints`):** Dynamic parameters (such as `talk_bounce_amplitude: 8` vs. `20` and `idle_shiver_amplitude: 14`) that allow generic presentation components (`GoblinPuppet.tsx`) to express different physical weights and temperaments for distinct actors.



```
┌──────────────────────────────────────────────────────────┐
│ goblin-assets-visual/characters/bog/manifest.json        │
├──────────────────────────────────────────────────────────┤
│ • anchor_point:           { x: 512, y: 980 } (Ground)    │
│ • crash_zoom_target:      { x: 412, y: 198 } (Eyes/Nose) │
│ • mouth_bounding_box:     [380, 240, 64, 32] (Visemes)   │
│ • talk_bounce_amplitude:  8 px                           │
│ • idle_shiver_amplitude: 14 px                           │
└──────────────────────────────────────────────────────────┘

```

#### The Explicit Null Protocol and Fallback Chains

Assets in production often have missing emotion passes. The extraction system uses an **Explicit Null Pattern** to prevent rendering crashes:

1. **The Contract:** Un-illustrated states are committed explicitly as `null` (e.g., `"terrified": null`) rather than omitted from the JSON schema. This signals to the extractor that the omission is a known production gap rather than a parsing bug.


2. **Draft Resolution:** During animatic drafts and internal rendering runs, if an emotion variant is marked `null` or un-illustrated, the extractor falls back to `base_states.idle.file` and inherits the base anchor coordinates while emitting a non-fatal compiler warning.


3. **The Fail-Loud Release Gate:** Broadcast merges reject incomplete assets:



$$\forall \text{shot} \in \text{Episode}, \quad \text{referenced\_variant}(\text{shot}) \neq \text{null}$$



An episode cannot merge to `main` or clear final mastering if a shot references a null variant, unless an authorized waiver is committed to the release ledger.



---

### 2. Autonomous Coordinate Extraction (Jules & CV Gauntlets)

The coordinates in `manifest.json` are not estimated manually. When candidate sprites are committed to the asset repository (`take_XX.png`), `repo-bot` dispatches the **Jules Coding Agent** into a sandboxed VM to execute an automated optical trace loop:

```text
[ take_03.png Committed ] ──► [ repo-bot Dispatches Jules VM ]
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │       JULES OPTICAL TRACE PASS        │
                       │                                       │
                       │  1. Ingests take_03.png & bible spec  │
                       │  2. Emits <visual_scan_trace>:        │
                       │     • Identifies eye/chin line coords │
                       │     • Traces foot contact bounds      │
                       │     • Isolates mouth perimeter box    │
                       └───────────────────┬───────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │     DETERMINISTIC CV SANITY CHECKS    │
                       │                                       │
                       │  • Bounds Check: 0 <= x,y <= Canvas   │
                       │  • Alpha Check: Contact Point alpha>0 │
                       │  • Viseme Aspect Ratio: 1.2 <= W/H<= 3│
                       └───────────────────┬───────────────────┘
                                           │ Pass (Exit Code 0)
                                           ▼
                       [ Atomic Patch: characters/{id}/manifest.json ]

```

1. **Multi-Modal Inspection Trace:** Jules scans the candidate sprite and emits a mandatory `<visual_scan_trace>` identifying the lowest opaque pixel cluster for foot contact, facial socket centroids for camera zooming, and mouth bounds.


2. **Deterministic Geometric Assertions:** Before updating the manifest, a pre-flight test (`scripts/validate-manifest-geometry.ts`) enforces strict mathematical boundaries:


* *Canvas Bounds:* Asserts all coordinate pairs lie strictly within the canvas dimension ($0 \le x \le W$, $0 \le y \le H$).


* *Non-Empty Alpha Gate:* Samples the sprite's alpha channel at the computed `anchor_point` to verify opacity $> 0$, preventing ground pivots from floating in empty space.


* *Viseme Bounding Ratio:* Asserts the mouth bounding box satisfies $1.2 \le \frac{\text{width}}{\text{height}} \le 3.0$, preventing facial detection from capturing the whole jaw, neck, or chest.




3. **The Rejection Ledger (`approved.json`):** When candidate takes are evaluated, rejected assets are never silently discarded. Jules documents failed candidates under a typed taxonomy (`SEMANTIC_FAILURE`, `DISTINCTNESS_COLLISION`, `CROSS_CHARACTER_BLEED`, or `PHYSICAL_DEFECT`), preserving negative contrast data that prevents the pipeline from re-generating identical defects.



---

### 3. The Serverless Greenscreen Diffusion Extraction Path

When scenes demand dynamic, cinematic motion passes rather than static 2D cutouts, Step 3 pivots to serverless video generation via the **Greenscreen VFX Paradigm**:

```
                       NARRATIVE & TIMING INPUT
              [ dialogue_ast.json ] + [ ffprobe frames ]
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│ CHILD GRAPH C: SERVERLESS RUNNER (RunPod RTX 4090 / Rig 2)       │
│ • Zero-Egress Transfer: s5cmd pulls weights from Cloudflare R2   │
│ • Pure Isolation: Diffusion runs against #00FF00 green void      │
│ • Frame Budget: Locked strictly to integer speech duration       │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│ IN-ENGINE OPTICAL SEPARATION                                     │
│ • Neural Matting (BiRefNet / RVM) extracts 8-bit alpha           │
│ • Emits WebM VP9 (with alpha) or ProRes 4444                     │
│ • Bypasses browser-side colorKey CPU degradation                 │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│ ARCHIVAL PROVENANCE & CONTENT ADDRESSING                         │
│ • SHA-256 Content-Addressed upload to Cloudflare R2              │
│ • Guard active against empty-hash (e3b0c442...b855) constant      │
│ • W3C UUIDv7 trace context burned into object metadata           │
└──────────────────────────────────────────────────────────────────┘

```

* **Isolating Character Complexity:** The diffusion model is never tasked with generating character, motion, and background simultaneously, which causes spatial warping and background morphing. It is prompted to generate the character isolated on a flat `#00FF00` neon green background.


* **Neural Matting Over Browser Keying:** Simple browser-side chroma keyers struggle with motion blur and sub-pixel edge fringes. The extraction worker executes an automated neural matting pass (**BiRefNet** or **Robust Video Matting - RVM**) directly inside ComfyUI, rendering an uncompressed ProRes 4444 or 8-bit alpha WebM VP9 alongside the raw greenscreen master.


* **Content-Addressed Stamping:** Rendered plates are hashed via SHA-256 and uploaded to Cloudflare R2. The pipeline enforces an **empty-hash tripwire** to block zero-byte corrupted uploads (`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`) and runs an `ffprobe` header decode check before committing the object key.



---

### 4. Asset Pruning & Invariant Pre-Flight Checks

Before handoff to `goblin-viewport-template`, the conductor executes two final visual integrity checks:

* **Asset Pruning (`collect-episode-assets.ts`):** Full character asset libraries can exceed tens of gigabytes. To enforce the per-episode repository size ceiling (< 100MB to 150MB), the visual extractor walks `dialogue_ast.json`, identifies the exact subset of sprites, visemes, and background plates required for the episode's runtime, and copies only those files into the episode's staging tree.


* **Tree-Hash Staleness Verification:** The extractor reads the source-tree hashes recorded in `compiled/bible-state.json` and compares them against the Git tree SHAs of `/characters/` and `/grievances/`. If the tree hashes diverge, the visual state is marked stale, and extraction halts until `npm run compile` is run to sync the visual assets with current canon law.



Once all required plates, sprites, and background mattes are staged and content-hashed, the visual extractor writes their local relative paths and SHA-256 digests into the episode manifest, clearing the path for the code generator to bake `Episode_XXX.tsx`.### 1. The Operational Model: The Generator Metaprogram

The transition from the upstream simulation in `worker-sower-engine` to the presentation layer in `goblin-viewport-template` represents a pivot from **narrative meaning** to **compile-time code generation**.

Instead of treating the viewport as a runtime player that loads dynamic JSON sidecars—which breaks legacy renders whenever shared React components evolve—the system runs a code-generation metaprogram (`generator/generate-episode-repo.ts`). This script reads the upstream contracts and stamps out an isolated, self-contained workspace inside `goblin-episodes/` (e.g., `goblin-episodes/ep040/`).

```text
               UPSTREAM NARRATIVE & ACOUSTIC CONTRACTS
      [ dialogue_ast.json ] + [ exposure_sheet.json (ffprobe) ] + [ manifest.json ]
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│       METAPROGRAM GENERATOR (generator/generate-episode-repo.ts)            │
│                                                                             │
│ 1. Ingests exposure_sheet.json, character manifest.json, and style_rules    │
│ 2. Harvests & copies required assets (<100MB ceiling via asset pruner)      │
│ 3. Compiles concrete Episode_XXX.tsx with unquoted literal numeric props    │
│ 4. Scopes camera interpolation via Sequence-relative subcomponents          │
│ 5. Computes body SHA-256 and stamps header: // @lifecycle & // @checksum    │
│ 6. Writes immutable provenance lockfile: render_manifest.json               │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STAMPED WORKSPACE (goblin-episodes/ep040/)                │
│                                                                             │
│ ├── Episode_040.tsx              <-- Baked, self-contained TSX component    │
│ ├── render_manifest.json          <-- Host environment & dependency lockfile │
│ ├── components/ (Vendored)        <-- GoblinPuppet.tsx, AmbientTrack.tsx    │
│ └── assets/                       <-- Harvested sprites, visemes, and audio  │
└─────────────────────────────────────────────────────────────────────────────┘

```

---

### 2. Upstream Contract Ingestion & Parsing

The generator takes three strict inputs before emitting a single line of code:

1. **Screenplay & Dialogue AST (`dialogue_ast.json`):** Emitted by `worker-sower-engine`, declaring lines, speaker IDs, emotional condition tags (e.g., `humiliated`, `defensive`), and Swain MRU reaction cues (`VISCERAL_STING`).


2. **Quantized Timing Manifest (`exposure_sheet.json`):** Derived from `ffprobe` sweeps of uncompressed speech `.wav` stems synthesized by `audio-microservice`. Durations are locked into integer frames at 24 fps:



$$\text{target\_frames} = \left\lceil \left(\frac{\text{duration\_ms}}{1000}\right) \times 24 \right\rceil$$



3. **Visual Asset Contracts (`manifest.json`):** Read from `goblin-assets-visual`, containing explicit coordinate pairs for ground contacts (`anchor_point`), facial targets (`camera_anchor_points.crash_zoom_target`), mouth viseme envelopes (`mouth_bounding_box`), and puppet physics scalars (`talk_bounce_amplitude`).



---

### 3. The Source-Baking Compilation Process

Rather than resolving state dynamically, the compiler emits a static React source file (`Episode_XXX.tsx`) where all timeline boundaries and spatial coordinates exist as **hardcoded JSX literals**:

#### Literal Value Printing (Type Safety & Drift Elimination)

* **Unquoted Numeric Literals:** Frame boundaries and ducking values are printed as pure numbers (e.g., `<Sequence durationInFrames="{75}" from="{0}">`), never as parsed string values (`durationInFrames="{75}"`), which avoids type-casting errors inside Remotion.


* **Timeline Accumulation:** Stems are never chained end-to-end dynamically. Each dialogue sequence is pinned to an absolute, pre-calculated integer frame offset:



$$\text{fromFrame}_{k} = \sum_{i=1}^{k-1} \text{total\_shot\_frames}_i$$




Because each audio stem starts exactly at $f / 24\text{ seconds}$, speech onset is sample-accurate relative to visual cuts, while tail padding absorbs any sub-frame slack ($< 41.7\text{ ms}$) without timeline drift.



#### Sequence-Relative Hook Scoping

Calling `useCurrentFrame()` at the composition root causes subsequent shots to evaluate camera curves against global scene time, breaking multi-shot sequences. The metaprogram avoids this by generating isolated shot sub-components for each cut, guaranteeing that `useCurrentFrame()` evaluates locally from frame `0` within every `<Sequence>`.

#### Directorial Camera Choreography & Normalized Transforms

The generator computes camera trajectories using the character's local coordinate space and external style rules (`style_rules.json`):

* **Swain MRU Translation:** If an AST node declares an emotional sting (`VISCERAL_STING`), the generator burns an explicit pre-speech reaction hold (e.g., 18 frames) directly into the timeline before mounting the audio.


* **Origin Normalization Math:** To ensure crash zooms track facial targets accurately without screen distortion across different canvas resolutions, local puppet coordinates ($1024 \times 1024$) are normalized to canvas space ($1920 \times 1080$) at bake time:



$$\text{originX}_{\text{global}} = \frac{\text{puppet.x} + (\text{anchor.x} \times s)}{\text{canvas.width}} \times 100\%$$



$$\text{originY}_{\text{global}} = \frac{\text{puppet.y} + (\text{anchor.y} \times s)}{\text{canvas.height}} \times 100\%$$




The generator injects these values directly into the camera wrapper's `transformOrigin` style.



---

### 4. Component Boundary Isolation & Vendoring

To eliminate the **Shared-Component Import Leak**—where modifying a root component like `GoblinPuppet.tsx` six months later would retroactively mutate a finished episode—the metaprogram establishes a permanent code boundary.

During invocation, `generate-episode-repo.ts` executes one of three boundary isolation strategies:

1. **Component Vendoring (Standard):** The generator copies the exact versions of `GoblinPuppet.tsx`, `AmbientTrack.tsx`, and `FoleyTrack.tsx` directly into the stamped episode directory (e.g., `goblin-episodes/ep040/components/`). Relative imports point locally within the episode directory rather than reaching out to mutable sibling paths.


2. **Immutable Package Resolution:** Configures the stamped episode's `package.json` to depend on an immutable, pinned npm package release (e.g., `"@studio/viewport": "1.4.2"`).


3. **Submodule Locking:** Binds the episode repository to a fixed 40-character Git commit SHA of the presentation components.



---

### 5. Asset Pruning & Invariant Pre-Flight

Before source files are finalized, the template executes resource sanitization to satisfy the per-episode repository ceiling (< 100MB):

* **Asset Pruner (`collect-episode-assets.ts`):** Walks the scene's AST, extracts only the referenced condition sprites (e.g., `bog_humiliated_take03.png`), mouth visemes, and environment mattes, and copies those specific 10–20 files into `goblin-episodes/ep040/assets/`. This achieves a ~90% storage reduction compared to cloning the full character sprite atlas.


* **Linter Guard (`!MissingAssets`):** An automated pre-render sweep audits the compiled TSX against disk. If any referenced asset, background plate, or audio stem is missing, compilation aborts with exit code 1 before headless Chromium initializes.


* **Empty-Hash Guard:** Flags and rejects any media asset whose SHA-256 digest matches the zero-byte constant (`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`), catching upstream upload truncations.



---

### 6. The Sealed-File Lifecycle & Collision Protocol

To support the showrunner's **"Eject Button"** (the ability for a director to open `Episode_040.tsx` and manually tweak camera curves, SVG filters, or timing) without risk of having work overwritten by upstream script regenerations, the metaprogram uses a cryptographic state machine:

```tsx
// @lifecycle: generated | patched | locked
// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde...
// @patch_history: ["QA-EP040-SH01-ZOOM_ALIGN"]

```

1. **Checksum Stamping:** Upon compilation, `generate-episode-repo.ts` computes the SHA-256 hash of the normalized JSX payload and burns it into the file header. Normalization is enforced via `.gitattributes` (`* text=auto eol=lf`) to eliminate cross-platform line-ending discrepancies.


2. **Modification Audit:** When a regeneration event is triggered, the generator reads the existing file:


* If `// @lifecycle: locked` is present, regeneration aborts immediately.


* If `SHA-256(current_body) !== header_checksum`, the generator detects that a human has edited the file. Instead of clobbering the file, it emits `Episode_040.candidate.tsx` and halts with an exit error.




3. **Control Plane Governance (`repo-bot`):** The edge auditor enforces merge authorities based on lifecycle tiers:


* `@lifecycle: generated`: Fully machine-authored; may merge automatically via CI when lint and type checks pass.


* `@lifecycle: patched`: Agent-authored bug repairs (e.g., from Jules QA); permissible only if an AST diff proves modifications were strictly confined to the targeted sequence props.


* `@lifecycle: locked`: Human-edited; requires authorized human review to merge.





---

### 7. Provenance Manifest Sealing (`render_manifest.json`)

To turn the render from an ephemeral event into a verifiable historical release, the generator outputs `render_manifest.json` directly beside the baked `.tsx` file:

```json
{
  "episode_id": "EP040",
  "schema_version": "2.1.0",
  "generated_at": "2026-09-18T22:14:00Z",
  "target_source_file": "Episode_040.tsx",
  "source_file_sha256": "7bd4e10a2f9c4b1e8f90123456789abcde...",
  "upstream_provenance": {
    "worker_sower_engine_commit": "7bd4e10",
    "goblin_bible_commit": "9c3e401",
    "goblin_assets_visual_tag": "v1.4.0",
    "viewport_template_commit": "4f8a120",
    "style_rules_version": "v1.4.0"
  },
  "acoustic_assets": {
    "bog_sh01_3120ms.wav": "sha256:4a8c9e2b10a...",
    "spleen_sh02_3375ms.wav": "sha256:9c1d8e3f4a..."
  },
  "visual_sprites_used": {
    "bog_humiliated_take03.png": "sha256:7f83b1657ff1...",
    "spleen_defensive_take01.png": "sha256:a3b4c5d6e7f8..."
  },
  "runtime_environment": {
    "render_container_digest": "ghcr.io/studio/render-node@sha256:7b4a...",
    "node_version": "v20.12.0",
    "remotion_version": "4.0.140",
    "chromium_milestone": "122.0.6261.94",
    "ffmpeg_build": "6.1.1-static",
    "font_checksums": {
      "Inter-Bold.ttf": "sha256:12c8a..."
    }
  }
}

```

By recording the upstream code commits, asset hashes, and complete headless Chromium/FFmpeg rasterization environment in this lockfile, the metaprogram preserves the production intent as permanent, diffable, and executable software.### 1. Pre-Flight Asset & Semantic Verification (`!MissingAssets`)

Headless Chromium is an expensive and brittle execution environment; rendering must never be triggered if dependencies are broken or missing. Before initializing `@remotion/renderer`, the conductor runs an automated pre-flight linting pass:

```text
                  EPISODE WORKSPACE STAGED
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│        PRE-FLIGHT AUDIT HARNESS (!MissingAssets)         │
│                                                         │
│  1. AST Disk Parity: Asserts all referenced sprites,    │
│     visemes, and audio stems exist on local scratch     │
│  2. Empty-Hash Trap: Rejects zero-byte sha256_e3b0c44...│
│  3. Alpha Edge Contour: Outer 3px mean green spill < 12 │
│  4. Fail-Loud Gate: Null variants abort unless signed   │
│     waiver is committed                                 │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼ (Exit Code 0)
┌─────────────────────────────────────────────────────────┐
│              HEADLESS CHROMIUM RENDERING               │
│        npx remotion render Episode_040.tsx ...          │
└─────────────────────────────────────────────────────────┘

```

* **Disk Parity Audit (`!MissingAssets`):** The engine parses the hardcoded references in `Episode_XXX.tsx` and checks them against the local pruned assets directory. If an emotion sprite (e.g., `bog_humiliated.png`) or a dialogue `.wav` stem is missing from disk, the build terminates immediately with exit code 1, preventing late-stage failures mid-render.


* **The Empty-Hash Trap:** Every media file is checked against its SHA-256 digest. If any binary matches the well-known empty-string SHA-256 constant (`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`), the render aborts to catch truncated asset transfers or failed downloads.


* **Alpha Spill Check:** For hybrid shots compositing diffusion plates rendered against `#00FF00`, an automated pixel scan evaluates the outer 3-pixel boundary of the matte silhouette. If the mean green-channel intensity exceeds threshold limits (e.g., green channel $\ge 12$), the plate is rejected for excessive color spill before it reaches the compositor.


* **The Fail-Loud Gate for Missing Art:** If an asset variant is explicitly marked as `null` in the manifest, the draft animatic may fall back to `base_states.idle`. However, for final broadcast mastering, the compiler enforces:



$$\forall \text{shot} \in \text{Episode}, \quad \text{referenced\_variant}(\text{shot}) \neq \text{null}$$



Any un-illustrated asset variant halts production unless an authorized waiver is committed to the release ledger.



---

### 2. The Optical Printing Pass (Headless Remotion Execution)

Once the pre-flight checks clear, the conductor launches the rendering pass on **Rig 1** (or a dedicated CPU worker container). Because this stage is I/O- and CPU-bound, it executes under strictly constrained parameters to eliminate memory thrashing and headless Linux Chromium leaks:

```bash
npx remotion render \
  src/episodes/Episode_040.tsx \
  outputs/ep040/master.mp4 \
  --gl=swangle \
  --concurrency=1 \
  --offthreadvideo \
  --image-format=png \
  --pixel-format=yuv420p

```

#### Core Execution Constraints

* **Software OpenGL (`--gl=swangle`):** Disables desktop GPU hardware ANGLE acceleration in favor of software rasterization. This runs cleanly in system RAM and avoids headless GPU driver memory leaks.


* **Concurrency Lock (`--concurrency=1`):** Limits headless Chromium to a single worker. While parallel rendering speeds up output on multi-instance setups (like Remotion Lambda), local workstation rendering locks concurrency to prevent browser processes from competing for system RAM and causing Out-Of-Memory (OOM) crashes.


* **Off-Thread Media Decoding (`<OffthreadVideo/>`):** Video decoding is handed off to isolated background FFmpeg processes rather than relying on Chromium's internal HTML5 `<video>` decoders. This prevents browser DOM memory growth during long composition timelines.


* **Multi-Layer Optical Compositing:** During frame capture, Remotion layers the optical elements in a strict hierarchy:


1. *Layer 1:* Static hand-painted background matte.


2. *Layer 2:* Practical environmental atmospheric loops (e.g., rain, drifting fog).


3. *Layer 3:* Programmatic cutout puppet (`GoblinPuppet.tsx`) or keyed `#00FF00` diffusion plate with despill filters applied.


4. *Layer 4:* Programmatic camera transforms (pans, push-ins, and high-frequency coordinate noise for screen shakes).





---

### 3. Audio Conformance & Normalization

Audio assembly does not rely on simple concatenation. The timeline executes programmed ducking envelopes and conformed loudness gates:

```text
Track 1: Spoken Dialogue Stems (Locked Absolute Integer Frames via ffprobe)
         [--------- Shot 01 ---------]          [--------- Shot 02 ---------]
Track 2: Foley Transients (Mulberry32 PRNG Seeded)
                [*valve_scrape*]                       [*boot_squelch*]
Track 3: Continuous Ambient Bed (Sidechain Ducked)
────┐                                 ┌──────┐                             ┌────
    │                                 │      │                             │
    └─────────────────────────────────┘      └─────────────────────────────┘
      ^ Attack (6f)    Release (12f) ^        ^ Attack (6f)   Release (12f)^

```

* **Absolute Integer Anchoring:** Audio stems are mapped to absolute frame indices ($\text{fromFrame}_k = \sum \text{total\_shot\_frames}_i$) to eliminate sub-frame drift ($< 41.7\text{ ms}$) across cuts.


* **Sidechain Ducking:** During speech sequences, background music beds and room tone are attenuated by **$-14\text{ dB}$** with a 6-frame attack and a 12-frame release, preserving dialogue intelligibility.


* **Master Audio Normalization (`loudnorm`):** The conformed audio passes through an automated FFmpeg filter pass to enforce distribution standards:


* *Integrated Loudness:* Conformed to **$-16\text{ LUFS}$** ($\pm 1.0\text{ LUFS}$) for web distribution, or **$-24\text{ LUFS}$** for standard broadcast delivery.


* *True-Peak Ceiling:* Enforces an absolute peak limit between **$-1.0\text{ dBTP}$** and **$-2.0\text{ dBTP}$** to prevent inter-sample clipping.


* *Noise Floor Target:* Dialogue stems are certified to maintain a noise floor below **$-60\text{ dB}$** before timeline insertion, preventing elevated room hiss when ducking envelopes recover.





---

### 4. Deterministic Offline Mastering & Color Conformance

To avoid running heavy 3D LUT lookups, halation blurs, and procedural noise directly inside browser CSS (which duplicates DOM trees and can trigger cross-browser visual variances), complex finishing runs through an offline FFmpeg filtergraph pass on the rendered ProRes/MP4 master:

* **Highlight Bloom (Halation):** Extracts image highlights using an upper-luminance threshold, blurs them, tints them red-orange, and blends them back additively over the keyed composite.


* **Uncorrelated Procedural Film Grain:** Applies procedural film grain seeded per frame index ($t$), ensuring grain structures stay dynamic rather than sliding across static backgrounds.


* **Unified 3D LUT Application:** Applies a global 16-bit `.cube` LUT (`lut3d`) to harmonize character plates, practical fog layers, and matte paintings into a consistent color grade.



---

### 5. Multi-Tier Visual QA & The Diagnostic Router

Before marking the episode complete, the output runs through an automated evaluation funnel:

```text
                       [ Rendered Master MP4 ]
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 1: DETERMINISTIC SIGNAL GATES (ffprobe & Sharp)                   │
│ • Frame-Budget Match: Total rendered frames == target_frames           │
│ • Alpha Edge Purity: 99th-percentile green spill < 12 inside 3px edge  │
│ • Loudness Normalization: Integrated -16 LUFS (±1.0), True-Peak ≤ -1dB │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ Pass (Exit 0)
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 2: GEOMETRIC INTEGRITY GATES (Computer Vision / Pixel Math)       │
│ • Composition Safe-Zone: Facial centroid inside declared safe-box      │
│ • Viseme Anchor Drift: Distance between mouth anchor & viseme < 4px    │
│ • Silhouette Redaction: Pure black silhouette passes identity test     │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ Fail (Anomaly Detected)
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 3: DIAGNOSTIC REMEDIATION TICKET (Jules Coding Agent Handoff)     │
│ • Classifies root cause: CODE_ERROR (JSX prop) vs ASSET_ERROR (atlas)  │
│ • If JSX defect: Jules patches Episode_XXX.tsx and re-renders locally   │
│ • If Asset defect: Routes ticket back to art production                │
└────────────────────────────────────────────────────────────────────────┘

```

* **Tier 1 (Deterministic Signal Gates):** Evaluates physical file properties. It checks that the frame count matches the exact `exposure_sheet.json` budget and verifies audio loudness compliance.


* **Tier 2 (Geometric Integrity):** Uses direct pixel mathematics to verify visual staging. It calculates the delta between the mouth anchor and viseme centers ($\vert{}\text{mouth\_center} - \text{viseme\_center}\vert{} < 4\text{px}$) and verifies that character silhouettes remain distinct under a solid-black blackout pass.


* **Tier 3 (Diagnostic Patching & Jules Agent Loop):** If a defect is caught, the system determines the root cause before attempting fixes:


* *Code Error:* If the rendered position diverges from the sprite atlas coordinates, the code is incorrect. The Jules coding agent updates the JSX prop in `Episode_XXX.tsx` and re-runs a short test render.


* *Asset Error:* If the JSX prop matches the sprite atlas, the manifest is incorrect, routing the ticket back to visual asset production.





---

### 6. Archival Ingestion & Delivery Protocol

Once certified, the deliverable moves to ingestion and state closure:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ EPISODE CERTIFICATION & RELEASE MANIFEST                               │
│ • Emits render_manifest.json (freezing Git SHAs, container digests)    │
│ • Burns C2PA provenance metadata into master container                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PACKAGING & DISTRIBUTION INGESTION                                     │
│ • MovieLabs Media Manifest Core (MMC) XML/JSON schema compilation      │
│ • Zero-Egress Storage: Content-addressed upload to Cloudflare R2       │
│ • Aspera / Platform delivery to streaming endpoints                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEDGER RECONCILIATION & NOTIFY                                         │
│ • D1 State Mutation: Logs character injuries, fuel spent, trauma delta │
│ • Dependency Invalidation: Flags downstream scenes (is_dirty = 1)      │
│ • Notebook Retro-Injection: Final script & hashes uploaded to Notebook │
└────────────────────────────────────────────────────────────────────────┘

```

1. **Packaging & Ingestion Standards:** The master MP4, uncompressed M&E stems, subtitle files (.VTT/.SCC), and language variants are packaged into a **MovieLabs Media Manifest Core (MMC)** directory structure. Filenames and paths are verified locally against the distribution intake schema before transfer (via Aspera or automated API).


2. **Provenance Burning (C2PA):** The master container receives a C2PA cryptographic signature embedding the `render_manifest.json`. This permanently documents the model checkpoints, upstream Git commit hashes, and human sign-off records.


3. **Content-Addressed Archival:** Deliverables are uploaded to Cloudflare R2 using content-addressed keys derived from their SHA-256 hash (`plates/sha256_{hash}.mp4`). Identical files cannot overwrite existing valid assets, and empty-string uploads are blocked.


4. **State Ledger Reconciliation:** The conductor executes an atomic transaction against the narrative database (Cloudflare D1 / SQLite), recording permanent state mutations (wounds sustained, fuel spent, leverage tokens consumed). This transaction triggers dependency cascades, marking downstream scenes pinned to old world hashes as dirty (`is_dirty = 1`).


5. **Notebook Retro-Injection:** The finalized screenplay text, frame timings, and state hashes are written back into the long-term knowledge base, preserving continuity for subsequent episodes.

The architectural blueprint across `worker-sower-engine`, `goblin-viewport-template`, and `repo-bot` is mathematically closed, meaning further specification design has reached steep diminishing returns.

At this juncture, the only meaningful additions are the three operational traps and friction points that will not appear on paper, but will surface immediately upon touching real hardware:

---

### 1. The Upstream Fuel Deficit (The Creative Bottleneck)

The pipeline's technical infrastructure—relational ledgers, AST validation, duration quantization, and Remotion source-baking—is fully designed, but it currently lacks fuel.

* **The Structural Tell:** Production systems naturally over-index on downstream tooling (GPU queues, Docker hydration, chroma-key shaders) because infrastructure is straightforward to specify, while reducing narrative generation to a single hand-waved input ("the creative team drafts the script").


* **The Necessary Fuel:** An LLM cannot generate authentic subtext in a vacuum; without constraints, it defaults to the melodramatic, sentimental median of its training corpus. The immediate creative priority before scaling is hand-authoring **40 to 60 concrete grievances** into the canon store, each explicitly pairing an external **Surface Complaint** with an unadmitted **Underneath** and tied to recurring physical props.



---

### 2. The Physical Rendering Hazards (Edge Boil & Temporal Judder)

Compositing diffusion-generated video plates introduces two optical challenges that pure code generation cannot anticipate:

* **The Illusion of the Clean Alpha:** Keying `#00FF00` character diffusion plates inside Remotion works cleanly in theory, but stochastic video models inevitably produce sub-pixel noise and edge boiling on high-contrast silhouettes. Keying alone will leave distracting edge crawl against static hand-painted backgrounds; a production pipeline requires a **dedicated temporal deflicker node applied strictly to the isolated alpha matte** before it hits the compositor.


* **Frame-Rate Cadence (The "Twos" Aesthetic):** If a diffusion checkpoint operates natively at 16 fps, translating to a 24 fps delivery timeline can cause uneven frame holds and motion judder. If the generative model supports 12 fps, generating at 12 fps cleanly doubles to 24 fps ("animating on twos"), saving roughly 50% of your GPU compute while establishing a traditional animation aesthetic.



---

### 3. The Execution Mandate: Stop Building Infrastructure

Multiple rounds of architectural refinement have made the system internally coherent, but coherence on paper is not proof of execution.

* **The Avoidance Trap:** Expanding data models, creating additional repository templates, and planning complex multi-tenant queues are common forms of engineering procrastination.


* **The Immediate Next Step (Gate 2: The Thin Vertical Slice):** Halt infrastructure development. The non-negotiable next step is to execute one complete, minimal run:


1. Author one physical dialogue line.


2. Synthesize the `.wav` stem via the audio microservice and lock the exact frame count using `ffprobe`.


3. Stamp `Episode_001.tsx` via `goblin-viewport-template`.


4. Render the single 3-second shot into a master MP4.





The physical friction encountered in rendering that single 3-second clip will invalidate more false assumptions than another hundred pages of system design.

Would you prefer to define the exact test parameters for this initial 3-second vertical slice, or begin drafting the foundational grievance corpus for the characters?

The Generative Production Pipeline enforces a strict architectural boundary between narrative meaning and visual representation, utilizing a deterministic, multi-rig architecture to produce reproducible animated episodes.

### The Sower & Narrative Simulation (`worker-sower-engine`)

* Executing exclusively on Rig 1, the Sower operates as the central pipeline conductor and narrative state machine.


* It ingests static, immutable canon via read-only boundaries while tracking dynamic variables (hex coordinates, paranoia clocks, physical trauma) in a persistent relational SQLite or PostgreSQL ledger.


* The engine resolves character conflicts mathematically via PRNG-weighted lotteries and 2d6 mechanics, outputting a pure dialogue Abstract Syntax Tree (AST) that contains zero video rendering dependencies.



### Acoustic Quantization (The Master Clock)

* Audio serves as the non-negotiable physical clock for all downstream generation and compositing.


* After a local TTS microservice synthesizes dialogue stems, `ffprobe` measures the waveform to calculate an exact, locked integer frame budget at 24 fps ($\text{target\_frames} = \left\lceil \left(\frac{\text{duration\_ms}}{1000}\right) \times 24 \right\rceil$).


* Remotion prioritizes these fixed stems on the timeline, automatically calculating sidechain ducking curves that attenuate continuous ambient sound beds by $-14\text{ dB}$ during active speech windows.



### Source-Baking & Compositing (`goblin-viewport-template`)

* To prevent historical code drift, the viewport abandons runtime JSON parsing in favor of a code-generation metaprogram (`generate-episode-repo.ts`).


* The generator consumes the AST and timing manifests to stamp out a dedicated repository per episode, baking timeline offsets and camera cues directly into a static TypeScript component (`Episode_XXX.tsx`).


* The viewport strictly consumes immutable `manifest.json` contracts from the visual asset repository, utilizing an automated agent (Jules) to extract exact mathematical pixel coordinates for ground pivots and crash zoom targets.



### Distributed Execution & Provenance Sealing

* Rig 1 handles all CPU orchestration and deterministic timeline stitching, dispatching heavy video diffusion tasks to headless ComfyUI daemons on Rig 2 (or serverless GPUs) conforming to a strict $4n+1$ frame lattice.


* Every stamped episode emits a frozen `render_manifest.json` locking the Git commit SHAs of all dependencies, ensuring bit-identical reproducibility years later.


* The final MP4 receives a cryptographic C2PA metadata injection, sealing the pipeline's human-authored origin and deterministic execution parameters into the master asset.



Which specific stage of this pipeline—the narrative ledger construction, the audio timing quantization, or the viewport source-baking—would you like to begin implementing first?


---

The system is fundamentally an **event-sourced, deterministic media compiler**, not an AI video generator. It compiles an upstream narrative state into locked temporal plans, translates those plans into immutable, executable rendering code, and seals the output as an auditable historical artifact. Stochastic generative models (LLMs, diffusion models, speech synthesizers) are stripped of narrative, spatial, and temporal authority; they serve strictly as untrusted, headless execution workers bounded by deterministic contracts.

---

### 1. The Core Architecture: Six-Layer Compilation Pipeline

The pipeline operates across six distinct, unidirectional layers where each boundary is governed by immutable schemas, content hashes, and strict invariant validation:

```text
┌────────────────────────────────────────────────────────┐
│ 1. IMMUTABLE CANON & MUTABLE RELATIONAL LEDGER         │
│    • Static Lore (000.goblin-lore): Read-only law      │
│    • Dynamic Ledger: Somatic, Logistical, Epistemic    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. NARRATIVE SIMULATION ENGINE (The Sower)             │
│    • Evaluates Grievance Frontmatter & 2d6 Duel Math   │
│    • Injects Negative Constraints (Ignorance by Omission)│
│    • Emits Canonical Machine IR: dialogue_ast.json     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. TEMPORAL & ACOUSTIC COMPILATION                     │
│    • TTS Synthesis (.wav) + ffprobe Quantization       │
│    • Master Video Clock (24 fps) & Audio Precision Clock│
│    • Absolute Integer Anchoring: start_k = Σ duration_i │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 4. VISUAL ASSET COMPILATION                            │
│    • Manifest Contracts: anchor_point, crash_zoom_target│
│    • Explicit Null Protocol (draft fallback vs fail-loud)│
│    • Backend Adapter Lattice (Wan 4n+1, 12 fps on twos)│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 5. EPISODE SOURCE-BAKING (goblin-viewport-template)    │
│    • Metaprogram Stamping: generator/generate-episode   │
│    • Bakes Literal TSX: Episode_XXX.tsx                │
│    • Cryptographic Lifecycle: @generated | @locked    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 6. DETERMINISTIC RENDER & MULTI-TIER QA                │
│    • Tier 1: Deterministic Signal Gates (ffprobe, LUFS) │
│    • Tier 2: Geometric Invariants (Viseme drift, Alpha) │
│    • Tier 3: Diagnostic Remediation & Build Sealing    │
└────────────────────────────────────────────────────────┘

```

---

### 2. Validated Architectural Invariants

* **Separation of Meaning from Representation:** `worker-sower-engine` decides *what happens* (e.g., `bog_humiliated = true`), while downstream presentation layers decide *how it appears* (e.g., mapping to `bog_humiliated_take03.png`, foot ground pivots, and camera push-ins). The narrative simulation remains completely visual-agnostic, allowing the visual stack to be swapped (2D cutouts, greenscreen diffusion, 3D engines) without altering narrative logic.


* **Canon Law vs. Mutable State:** Static canon (`000.goblin-lore`) is immutable, schema-validated, and read-only at boot. Mutable variables (spatial hex coordinates, physical trauma, resentment accumulators, secrets known) are tracked in a persistent, transactional relational ledger.


* **Simulation Precedes Language:** The Sower operates as a state-transition machine. Conflict selection, leverage expenditures, and 2d6 duel mechanics determine winners, losers, and condition mutations *before* an LLM drafts surface prose. The LLM generates expressive dialogue under hard negative constraints; it never decides plot reality.


* **The AST as Canonical Contract:** The screenplay (`.fountain`) is merely a human-readable projection. The machine contract is `dialogue_ast.json`, which drives all downstream operations: acoustic synthesis, timing manifests, camera choreography, asset extraction, and QA expectations.


* **Dual Clocks & Absolute Anchoring:** Video picture is governed by a discrete 24 fps frame clock, while acoustic truth is preserved in the continuous sample/millisecond domain. Audio stems are measured via `ffprobe` to quantize integer frame durations:



$$\text{target\_frames} = \left\lceil \left(\frac{\text{duration\_ms}}{1000}\right) \times 24 \right\rceil$$




Every shot is pinned to an absolute start frame ($\text{start}_k = \sum_{i<k} \text{duration}_i$), eliminating cumulative concatenation drift.


* **Lattice Isolation via Backend Adapters:** Hardware constraints—such as Wan's $4n+1$ temporal latent structure—are isolated inside specific backend adapters rather than contaminating the universal architecture. The conductor maps the master timeline into the backend's legal frame domain, padding and trimming excess frames at the tail.


* **Source-Baking over Runtime Interpreters:** To prevent the historical corruption trap (where updating shared React components silently breaks past episodes), a generator metaprogram stamps out dedicated, self-contained directories inside `goblin-episodes/`. Timings, audio offsets, and camera coordinates are baked directly into immutable JSX source code (`Episode_XXX.tsx`).


* **Build Identity over Git SHAs:** True reproducibility requires a complete build identity tuple:

$$\text{Episode Build ID} = \mathcal{H}(\text{Canon} + \text{Ledger State} + \text{AST} + \text{Assets} + \text{Container Digest} + \text{Toolchains})$$




Bit-identical reproduction is treated as an empirical hypothesis to be verified across system reboots, rather than assumed.


* **Typed Asset Contracts & Explicit Nulls:** Visual directories expose typed API contracts (`manifest.json`) specifying ground pivots (`anchor_point`), facial targets (`crash_zoom_target`), and mouth viseme envelopes. Missing variants are committed as explicit `null`, enabling idle fallbacks during drafts while acting as a hard, fail-loud gate for broadcast merges.


* **Authority Boundaries & The Sealed-File Lifecycle:** Render runtimes are isolated from deployment privileges. The generator embeds SHA-256 checksums into file headers with explicit lifecycle markers (`@generated`, `@patched`, `@locked`), preventing automated tools from clobbering manual director adjustments.


* **Economic QA Hierarchy:** Testing progresses from inexpensive deterministic checks (file presence, non-empty hashes, audio loudness) to geometric checks (alpha spill, viseme drift $< 4\text{px}$), reserving agent-driven diagnostics or human intervention strictly for verified anomalies.



---

### 3. High-Leverage Strategic Additions

#### Addition 1: The Compiler Intermediate Representation (IR) Optimization Pass

Treat `dialogue_ast.json` and `exposure_sheet.json` as Compiler Intermediate Representation (IR). Before emitting `Episode_XXX.tsx`, run deterministic compiler optimization passes:

* *Dead-Asset Elimination:* Statically analyze the AST to harvest and bundle only referenced sprite variants, visemes, and backgrounds, enforcing the sub-100MB episode limit.


* *Static Layer Pre-Compositing:* Identify contiguous shot ranges sharing the same background matte and atmospheric loops. Pre-render or flatten those layers into a single static cache plate, eliminating redundant multi-layer DOM compositing during headless Chromium execution.



#### Addition 2: The Grievance Graph as an Event-Sourced Delta Log

Formalize narrative progression as an **Event Sourcing Architecture**. Rather than mutating relational tables in-place, every episode commits an immutable Delta Log ($\Delta_e$):

```json
{
  "episode_id": "EP040",
  "events": [
    { "type": "DUEL_RESOLVED", "winner": "SPLINE", "loser": "BOG", "margin": 4 },
    { "type": "CONDITION_ADDED", "character": "BOG", "condition": "humiliated" },
    { "type": "PRESSURE_METER_INCREMENT", "meter": "paranoia", "target": "CAMP", "delta": 1 },
    { "type": "STRING_EXPENDED", "owner": "SPLINE", "target": "BOG", "string_id": "stolen_brass" }
  ]
}

```


World state at any point in history ($S_N$) can be deterministically reconstructed from Genesis ($S_0$) by replaying event logs:


$$S_N = S_0 + \sum_{i=1}^{N} \Delta_i$$


This enables branch experimentation, "what-if" narrative forks, and instant rollbacks without database corruption.

#### Addition 3: Bidirectional Semantic Fencing (Token-Attribution Verifier)

To prevent self-reported AST drift (where an LLM outputs `["LIMP"]` in the action enum but describes the character jumping in prose), implement an automated **Token-Attribution Verifier** at $T_0$:

1. Run a lightweight, deterministic dependency-parse on the screenplay prose to extract all subject-verb pairs.


2. Enforce a bidirectional assertion: every kinetic verb associated with an actor must correspond to an authorized token in the AST enum array.


3. If an unmapped or prohibited verb lemma appears in affirmative context, the build aborts before audio synthesis or GPU tokens are consumed.



#### Addition 4: MRU Timing Compilation (Visual Saccade Alignment)

Translate Dwight Swain’s Motivation-Reaction Units (Stimulus $\to$ Reflex $\to$ Calculation $\to$ Speech) directly into timeline geometry:

* When an AST node flags an emotional shock (`VISCERAL_STING`), the exposure sheet compiler automatically allocates a discrete `reaction_preroll_frames` window (e.g., 12–18 frames) *before* speech onset.


* During this window, the compiler directs camera push-ins, eyeline darting, or pupil dilation overlays, ensuring animation rhythm reflects psychological causality rather than jumping straight into dialogue.



#### Addition 5: Empirical Reproducibility Benchmark

Formalize "bit-identical reproduction" as a measurable hypothesis. Deploy an automated CI conformance test:

1. Render `Episode_Test` in Container $A$; compute $\text{SHA-256}(Master_A)$.


2. Tear down the container, purge caches, rebuild on a clean host, and render `Episode_Test` as $Master_B$.


3. Assert bit-identity ($\text{SHA-256}_A == \text{SHA-256}_B$). If floating-point antialiasing across Chromium versions introduces sub-pixel discrepancies, enforce a strict perceptual baseline ($\Delta E < 0.1$ or SSIM $> 0.9999$) and document it as the formal tolerance threshold.



---

### 4. The Execution Protocol (The 3-Second Tracer Bullet)

Further architectural documentation yields diminishing returns. The non-negotiable next step is executing the **Gate 2 Tracer Bullet** to test all interfaces against physical hardware:

```text
[ 1. Seed & Invariant Constraint ]
              │
              ▼
[ 2. Dialogue AST Line (3.12s) ]
              │
              ▼
[ 3. Local TTS Synthesis (.wav) ] ──► ffprobe: 3120ms → Locked to 75 Frames
              │
              ▼
[ 4. Metaprogram Stamping ]      ──► generate-episode-repo.ts → Episode_001.tsx
              │
              ▼
[ 5. Headless Remotion Render ]   ──► Rig 1 (gl: swangle, concurrency: 1)
              │
              ▼
[ 6. Artifact Verification ]     ──► Master MP4 + render_manifest.json

```

Executing this single 3-second render will reveal the true friction points of the pipeline—audio sync alignment, asset path normalization, and compositor performance—more effectively than further system specification.

Would you prefer to configure the exact inputs for this 3-second Tracer Bullet slice, or begin drafting the foundational grievance corpus required to fuel the Sower?

---

### 1. The Unified Ontological Law: Truth, State, Computation, and Representation

The system is an **event-sourced, deterministic media compiler**, not an AI video generator. Generative models (LLMs, diffusion networks, audio synthesizers) possess zero narrative, spatial, or temporal authority. They are headless, untrusted execution components executing bounded tasks within deterministic software fences.

The fundamental governing law of the architecture is:

$$\text{Probabilistic systems propose and execute; deterministic systems decide what is allowed to be true.}$$

The ontology splits into four non-interchangeable tiers:

```text
       CANON (Immutable Axioms & Physical Constraints)
          │
          │ constrains
          ▼
       STATE (Materialized Snapshot: Somatic, Logistical, Epistemic)
          │
          │ transformed by
          ▼
       EVENT (Transactional Mutation: Typed Delta + Explicit Seed)
          │
          │ reduced via Pure Function
          ▼
     NEW STATE (Next Materialized Working View)
          │
          │ projected down unidirectional compiler pipelines
          ▼
   MEDIA PROJECTIONS (Screenplays, Exposure Sheets, TSX, Rendered Video)

```

* **Media is Never State:** Screenplays (`.fountain`), exposure sheets, Remotion compositions (`Episode_XXX.tsx`), and rendered MP4s are transient or compiled **projections of truth**, never truth itself. Modifying a media projection (e.g., re-recording a line or adjusting camera easing) mutates an editorial view; it does not retroactively alter the underlying narrative event or the historical world state.


* **The Deletion Principle Boundary:** If all generative neural networks are deleted, the universe remains logically and referentially consistent inside the relational ledger with respect to its declared constraints. However, **generated media assets are archive-dependent**. Because non-deterministic CUDA floating-point variances and latent sampling prevent bit-identical regeneration of diffusion plates from seeds alone, the physical archive (content-addressed object storage) must be preserved, version-pinned, and scrubbed alongside the code.



---

### 2. The Two-Dimensional Compilation Model

The compiler operates across two orthogonal axes, separating what happens from how it is preserved:

```text
               AXIS A: SEMANTIC TRANSFORMATION (Meaning)
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ WORLD STATE │ ──► │ NARRATIVE IR │ ──► │ TEMPORAL IR  │ ──► │  VISUAL IR   │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                   │                    │                    │
       ▼                   ▼                    ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  REDUCER &  │ ──► │  SOURCE CODE │ ──► │ HEADLESS RUN │ ──► │   VERIFIED   │
│  EVENT LOG  │     │ (TSX Baking) │     │  (Chromium)  │     │   ARTIFACT   │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
               AXIS B: ARTIFACT HARDENING (Representation)

```

This Cartesian separation establishes an exact debugging taxonomy for any failure in the studio:

| Failure Mode | Axis & Domain | Root Diagnostic Boundary |
| --- | --- | --- |
| Character references an unrevealed secret | Axis A (Semantic) | Epistemic context extraction leak (`Context_{char}`)

 |
| Character uses an amputated limb | Axis A (Semantic) | Somatic invariant violation against banned kinetic verbs

 |
| Dialogue begins 2 frames out of sync with mouth | Axis A (Temporal) | Quantization offset rounding error between audio timebase and frame clock

 |
| Viseme detaches from character chin line | Axis A (Visual) | Manifest anchor mismatch (`mouth_bounding_box` vs canvas transform)

 |
| Node/Chromium segfault or text reflow | Axis B (Hardening) | Container divergence or unpinned font asset substitution

 |
| Identical build inputs yield divergent binary hash | Axis B (Hardening) | Container packaging timestamps or non-deterministic MP4 muxing

 |
| Re-render of legacy episode alters visuals | Axis B (Hardening) | Historical corruption trap (unpinned shared viewport dependency)

 |

#### The Pure Reducer & Seed Lineage

Historical truth is preserved in an immutable, append-only Event Log. The state transition is governed by a pure reducer function:

$$S_{n+1} = \mathcal{R}(S_n, E_n, \sigma_n)$$

where $S_n$ is the current state, $E_n$ is the ordered event, and $\sigma_n$ is the explicitly logged random seed.

* The reducer is mathematically pure: zero wall-clock access (`Date.now()`), zero network calls, zero ambient OS environment variables, and zero reliance on non-deterministic hash map iteration.


* Any historical state $S_N$ is fully reconstructible from Genesis ($S_0$) by replaying the ordered event log:

$$S_N = \mathcal{R}(\dots \mathcal{R}(\mathcal{R}(S_0, E_1, \sigma_1), E_2, \sigma_2) \dots, E_N, \sigma_N)$$

#### Dual Randomness

Randomness is bifurcated based on whether it mutates state:

1. **Narrative Randomness:** Conflict selection, dice duel mechanics, and leverage expenditure. This alters the relational ledger and must be bit-for-bit replayable via hierarchical seeds:


$$\text{Seed}_{\text{shot}} = \text{HMAC-SHA256}(\text{Seed}_{\text{episode}}, \text{scene\_id} + \text{":"} + \text{shot\_id})$$



2. **Representational Randomness:** Diffusion latent initialization, procedural audio noise, and camera jitter. This affects only the visual or acoustic projection. It is recorded in the provenance manifest, but changing it does not alter world state.



---

### 3. Intermediate Representations & The Multi-Resolution Bridge

#### The Canonical Machine IR (`dialogue_ast.json`)

The human-readable screenplay (`.fountain`) is an ephemeral view. The canonical contract driving the media compiler is `dialogue_ast.json`. Downstream systems (audio synthesis, timing manifests, sprite harvesting, camera choreography, QA linters) ingest only the AST.

```json
{
  "$schema": "https://specs.studio.internal/schemas/v3/dialogue_ast.json",
  "schema_version": "3.2.0",
  "compiler_version": "2.4.1",
  "episode_id": "EP040",
  "scene_id": "ep040_sc03",
  "state_snapshot_hash": "sha256:7f83b165...",
  "lines": [
    {
      "line_id": "line_001",
      "speaker": "BOG",
      "dialogue_text": "The relay is dead. Don't touch the brass siphon.",
      "subtext": "Bog cannot admit he broke the valve while attempting to flee.",
      "conditions": ["humiliated", "brachial_plexus_severed"],
      "motor_actions": ["RETREAT", "POINT_SINGLE_HAND"],
      "reaction_cue": "VISCERAL_STING",
      "pacing_scalar": 1.0
    }
  ]
}

```

* **Immutable Schema Policy:** Historical schemas are never modified in place. If `dialogue_ast` evolves, historical episodes retain their original schema (e.g., `v1.0.0`) alongside explicit, tested forward-migration functions ($\text{AST}_{v1} \xrightarrow{\mu_{1\to 2}} \text{AST}_{v2}$).



#### Multi-Resolution Time Bridge

Continuous sound cannot be forced into video frames prematurely without losing acoustic phase precision. The compiler defines two synchronized temporal planes:

```text
AUDIO DOMAIN (Timebase Clock): 48,000 integer samples/second (Sample-Accurate Truth)
  │
  ├─ Phoneme / Viseme Onsets (e.g., Sample Offset: 26,742)
  ├─ Transient Foley Hits (Seeded PRNG)
  └─ Continuous Dynamic Ducking Envelopes (-14 dB Speech Window)
  │
  ▼ Projection: Sample Index S = Frame * (48000 / 24) = Frame * 2000
VIDEO DOMAIN (Master Video Clock): 24 integer frames/second (Discrete Cut Boundary)

```

* **`ffprobe` as an Observer:** `ffprobe` is a measurement instrument, not the clock authority. The synthesized uncompressed `.wav` buffer is the temporal truth. `ffprobe` measures its duration to let the compiler derive the integer frame budget:


$$\text{target\_frames} = \left\lceil \left(\frac{\text{duration\_ms}}{1000}\right) \times 24 \right\rceil$$



* **Absolute Integer Anchoring:** Audio stems are pinned to absolute timeline coordinates, preventing rounding errors from accumulating across hundreds of shots:


$$\text{fromFrame}_k = \sum_{i=1}^{k-1} \text{shot\_duration}_i$$



* **Backend Adapter Isolation:** Model-specific hardware constraints (such as Wan's $4n+1$ causal VAE lattice or 16 fps native sampling) are encapsulated inside backend adapters. The universal timeline remains clean; the adapter pads, generates, trims, and retimes to satisfy model constraints before delivering frames to the master 24 fps timeline.



---

### 4. Narrative Build System: Dependency DAG, Blast Radius, & Source-Baking

#### Continuity as Cache Invalidation

Narrative continuity is managed as a Directed Acyclic Graph (DAG) dependency problem:

* **Nodes:** Canonical Facts ($F$), Characters ($C$), and Scenes ($S$).


* **Edges:** Explicit dependencies declared in metadata (`depends_on: ["fact_bog_arm_amputated"]`).


* **Dependency Fingerprinting:** Scenes record the cryptographic hash of every fact consumed:


$$\text{SceneHash} = \mathcal{H}(\text{AST} + \sum \mathcal{H}(\text{Dependency}_i) + \text{Assets} + \text{CompilerVersion})$$



When an upstream fact mutates, a topological sweep marks all downstream dependent scenes dirty (`is_dirty = 1`), halting deployment until those scenes are re-compiled or re-certified.

#### Source-Baking Compilation (`goblin-viewport-template`)

Rather than relying on a long-lived player that parses JSON at runtime, a metaprogram (`generate-episode-repo.ts`) compiles the AST and exposure sheet into a committed, self-contained TypeScript component: **`Episode_XXX.tsx`**.

* Numeric sequence durations, audio volume curves, and camera coordinates are burned directly into JSX literals.


* Shared presentation components (`GoblinPuppet.tsx`, `AmbientTrack.tsx`) are either pinned to an immutable package release (`@studio/viewport@1.4.2`), locked to an exact Git commit SHA, or vendored locally into `episodes/ep040/components/`.



```text
┌─────────────────────────────────────────────────────────────┐
│                    Episode_040.tsx                          │
│                                                             │
│ // @lifecycle: generated                                    │
│ // @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde...         │
│                                                             │
│ export const Episode_040: React.FC = () => {                │
│   return (                                                  │
│     <AbsoluteFill style={{ backgroundColor: '#000' }}>       │
│       <Sequence from={0} durationInFrames={75}>             │
│         <Shot01CameraWrapper originX="48.2%" originY="21.4%">│
│           <GoblinPuppet                                     │
│             character="BOG"                                 │
│             emotion="humiliated"                            │
│             anchorPoint={{ x: 512, y: 980 }}                │
│           />                                                │
│           <Audio                                            │
│             src={staticFile("audio/dialogue/sh01.wav")}      │
│             volume={1.0}                                    │
│           />                                                │
│         </Shot01CameraWrapper>                              │
│       </Sequence>                                           │
│     </AbsoluteFill>                                         │
│   );                                                        │
│ };                                                          │
└─────────────────────────────────────────────────────────────┘

```

#### The Cryptographic Sealed-File Lifecycle

Human intervention is treated as an auditable state transition, not an exceptional defect:

1. **`@lifecycle: generated`:** Stamped by the generator with a SHA-256 body checksum in the header. Fully automated CI merge authority.


2. **`@lifecycle: patched`:** Modified by automated diagnostic repair agents (e.g., Jules CV alignment). Permissible only if an AST diff proves modifications were strictly bounded to specific JSX properties.


3. **`@lifecycle: locked`:** Manually adjusted by a human director. If the generator runs again, it detects the checksum mismatch or `@locked` tag, emits `Episode_040.candidate.tsx`, and refuses to overwrite the director's changes.


4. **Human Overrides as Events:** Any manual edit emits a `DIRECTOR_OVERRIDE` event into the historical log, capturing the author, property delta, and narrative justification.



---

### 5. High-Fidelity Mezzanines, Provenance Graphs, & Progressive QA

#### Preservation Hierarchy

The delivery MP4 is a lossy distribution derivative, not the archival master. Preservation splits into three distinct tiers:

```text
┌────────────────────────────────────────────────────────┐
│ 1. SOURCE & IR ARCHIVE                                 │
│    • dialogue_ast.json, event log, manifests, TSX      │
├────────────────────────────────────────────────────────┤
│ 2. HIGH-FIDELITY MEZZANINE MASTER                      │
│    • Apple ProRes 4444 (with 8-bit/16-bit Alpha)       │
│    • Discrete 24-bit 48 kHz Dialogue, Music, Foley M&E │
├────────────────────────────────────────────────────────┤
│ 3. DELIVERY DERIVATIVES (Distribution Profiles)        │
│    • Web Stream: -16 LUFS (±1.0), H.264 / AAC          │
│    • Broadcast US (ATSC A/85): -24 LUFS, True-Peak -2dB│
│    • Broadcast Europe (EBU R128): -23 LUFS             │
└────────────────────────────────────────────────────────┘

```

#### The Provenance Graph Root (`render_manifest.json`)

The episode identity is not an arbitrary string; it is the root of a Directed Acyclic Graph connecting inputs, toolchains, and environment hashes:

```json
{
  "build_id": "sha256:4f8a1209bc...",
  "episode_id": "EP040",
  "schema_version": "3.0.0",
  "parents": {
    "dialogue_ast_hash": "sha256:12c8a...",
    "exposure_sheet_hash": "sha256:9c3e4...",
    "source_file_hash": "sha256:7bd4e...",
    "canon_tree_sha": "git:9c3e401",
    "assets_visual_tree_sha": "git:v1.4.0",
    "viewport_template_sha": "git:4f8a120"
  },
  "runtime_environment": {
    "container_digest": "ghcr.io/studio/render-node@sha256:7b4a...",
    "node_version": "v20.12.0",
    "remotion_version": "4.0.140",
    "chromium_milestone": "122.0.6261.94",
    "ffmpeg_build": "6.1.1-static",
    "font_manifest": {
      "Cinzel-Bold.ttf": "sha256:5a6b7c..."
    }
  },
  "reproducibility_audit": {
    "protocol": "visual_conformance_v2",
    "double_render_status": "BIT_IDENTICAL",
    "measured_ssim": 1.0,
    "delta_e_max": 0.0
  }
}

```

#### The Reproducibility Ladder

Reproducibility is an empirical spectrum verified via testing, not an assumption:

* **Level 0 (Intent):** Same narrative premise.


* **Level 1 (AST):** Identical validated machine contracts.


* **Level 2 (Timing):** Identical frame budgets and audio sample alignments.


* **Level 3 (Decoded Media):** Raw decoded pixel buffers and PCM audio streams pass visual/acoustic conformance ($\text{SSIM} > 0.9999$, $\Delta E < 0.1$).


* **Level 4 (Encoded Streams):** Compressed H.264/HEVC/ProRes bitstreams match identically.


* **Level 5 (Container Bytes):** Container bytes are bit-identical ($\text{SHA-256}_A == \text{SHA-256}_B$) across clean container rebuilds.



#### Progressive Confidence QA

Testing progresses from cheapest deterministic invariants to expensive perceptual sweeps:

```text
[ CONFIDENCE 0: Structural ] ──► JSON Schema valid, required files exist on scratch,
                                 zero-byte empty-hash guard (e3b0c442...)[cite: 1, 3]
              │ Pass
              ▼
[ CONFIDENCE 1: Physical ]   ──► ffprobe frame duration matches exposure sheet,
                                 audio stems comply with noise floor < -60 dBFS[cite: 1, 6]
              │ Pass
              ▼
[ CONFIDENCE 2: Geometric ]  ──► Mouth-to-viseme drift < 4px, contact anchor touches
                                 matte floor plane, green-channel edge spill < 12[cite: 1, 6]
              │ Pass
              ▼
[ CONFIDENCE 3: Semantic ]   ──► Dual-Field Action verifier matches prose lemmas,
                                 epistemic boundary confirmed via graph reachability[cite: 1, 2]
              │ Pass
              ▼
[ CONFIDENCE 4: Editorial ]  ──► Signed Human Director Review recorded via GitHub Review API[cite: 1, 2]

```

---

### 6. Architectural Additions to the Compiler

#### Addition 1: The Chaos Reducer Fuzzing Suite

To enforce that the narrative state transition reducer $\mathcal{R}(S, E, \sigma)$ remains pure, implement a property-based test harness (similar to QuickCheck or fast-check) executed in CI:

1. **Permuted Insertion Testing:** Feed 1,000 valid historical events into the reducer in randomized chunk batches while maintaining causal order; assert that the final state $S_N$ is bit-identical across all executions.


2. **Environment Contamination Probes:** Run the reducer within an instrumented sandbox that intercepts and throws fatal assertions on any access to `process.env`, `Date.now()`, `Math.random()`, or network socket creation.



#### Addition 2: The Two-Pass Adversarial Semantic Fence

A self-reported AST (where the same LLM outputs both prose and motor action tokens) can lie (e.g., outputting `["LIMP"]` in the enum while describing the character jumping in prose). The compiler implements an automated two-pass validation boundary:

* **Pass 1 (Drafting):** Constrained GBNF grammar forces the LLM to emit the screenplay scene.


* **Pass 2 (Reverse Extraction):** An independent, deterministic model (or fine-tuned local extractor running at temperature 0) reads *only* the emitted prose, extracts kinetic verbs and physical interactions, and maps them to canonical action enums.


* **Discrepancy Assertion:** The compiler calculates the set delta between the Drafted AST and Extracted AST:



$$\Delta_{\text{actions}} = \text{Actions}_{\text{extracted}} \setminus \text{Actions}_{\text{declared}}$$

If $\Delta_{\text{actions}}$ intersects with the character's `banned_kinetic_verbs`, compilation aborts before audio synthesis or visual rendering begins.

#### Addition 3: Content-Addressed Scene Artifact Graph (CASAG)

Adopt the build-caching philosophy of Bazel or Nix for multimedia production:

* Every intermediate media artifact is content-addressed under its input derivation hash:
$$\text{Key} = \text{SHA-256}(\text{StemAudioBytes} + \text{VisemeConfig} + \text{CharacterAtlasSHA})$$


* If an episode's script is modified in Shot 12, Shots 1 through 11 reuse cached, neural-matted character plates and speech `.wav` stems directly from Cloudflare R2. Headless Chromium skips frame rendering for unmodified `<Sequence>` blocks, assembling the final edit in seconds rather than re-rendering the entire timeline.



#### Addition 4: Graph-Theoretic Epistemic Reachability Engine

Replace manual context filtering with formal graph-reachability queries on the world state ledger:

* Define knowledge as directional edges ($C_{\text{actor}} \xrightarrow{\text{knows}} \text{Fact}_k$) carrying metadata (origin event ID, timestamp, secrecy classification).


* The context builder computes the reachable subgraph for the active scene participants:


$$\text{Context}_{\text{actor}} = \text{SubgraphReachability}(C_{\text{actor}}, \text{WorldGraph})$$


* Any fact outside this reachability envelope is omitted from the prompt prompt-assembly stage, providing structural information security without relying on prompt engineering.



#### Addition 5: Unified Offline Post-Processing Pipeline

To avoid cross-browser CSS/SVG visual discrepancies and duplicate DOM memory allocations during headless rendering, all optical post-processing is decoupled from Remotion and executed as an offline FFmpeg filtergraph on the master plate stack:

* **Highlight Halation:** High-luminance extraction blended additively with red-orange chromatic diffusion.


* **Per-Frame Procedural Film Grain:** True uncorrelated grain generated per frame index $t$ via seed arithmetic.


* **Unified 3D LUT Application:** 16-bit `.cube` color grading conforming disparate plates (matte background, 2D puppet, greenscreen diffusion) into a cohesive color space.



---

### 7. The Gate 2 Tracer Bullet Execution Protocol

Theoretical design has yielded all available architectural insights. The immediate, non-negotiable next step is executing the **Gate 2 Tracer Bullet**.

#### Objective

Prove that one single, minimal narrative event can travel through the entire compiler toolchain on physical hardware and emerge as an auditable, reproducible, broadcast-ready MP4 deliverable.

```text
[ 1. Seed & Invariant State ]
              │
              ▼
[ 2. Dialogue AST Line (3.12s) ]
              │
              ▼
[ 3. Local TTS Synthesis (.wav) ] ──► ffprobe: 3120ms → Locked to 75 Frames at 24fps
              │
              ▼
[ 4. Metaprogram Stamping ]      ──► generate-episode-repo.ts → Episode_001.tsx
              │
              ▼
[ 5. Headless Remotion Render ]   ──► Rig 1 (gl: swangle, concurrency: 1)
              │
              ▼
[ 6. Artifact Verification ]     ──► Master MP4 + render_manifest.json

```

#### The 8-Point Acceptance Checklist

```bash
# Minimal Acceptance Verification Checklist
[ ] 1. Canon Law and Relational Ledger state resolve deterministically.
[ ] 2. Dialogue AST validates against JSON Schema (schema_version: 3.2.0).
[ ] 3. Speech WAV synthesized locally and measured via ffprobe (e.g., 3,120 ms -> 75 frames).
[ ] 4. Visual manifest contracts ingested (anchor_point, mouth_bounding_box).
[ ] 5. generate-episode-repo.ts stamps Episode_001.tsx with numeric literal JSX props.
[ ] 6. Headless Remotion compiles master MP4 on CPU via software rasterization (--gl=swangle).
[ ] 7. Render manifest emitted with complete dependency commit SHAs and container digests.
[ ] 8. Clean Double-Render Assert: SHA-256(Render_A) == SHA-256(Render_B).

```

Executing this 3-second render tests every software seam, path assumption, audio-video bridge, and container dependency against physical reality, transforming the architectural specification into an operational production studio.

The Generative Production Pipeline operates as an event-sourced, deterministic media compiler where generative models possess zero narrative, spatial, or temporal authority. The foundational Deletion Principle dictates that if all generative models are destroyed, the universe must remain logically consistent with respect to its declared constraints within a relational ledger.

* **Model-Independent Truth:** Canon entities, typed state vectors (somatic, logistical, epistemic), and dependency graphs live exclusively in the ledger.


* **Archive-Dependent Artifacts:** Rendered diffusion plates and audio stems cannot be reproduced bit-for-bit from seeds and must be preserved in content-addressed cold storage.


* **Ignorance by Omission:** Epistemic boundaries are enforced by physically stripping forbidden facts from the context window before prompt assembly, rather than instructing an LLM to forget.



## Semantic Translation and Artifact Hardening

The architecture separates what happens from how it is preserved across two orthogonal axes.

* **The Dual-Field AST:** Parsing free prose is fundamentally flawed. LLMs are constrained to output a discrete enum array of motor actions alongside prose.


* **Independent Verification:** A deterministic linter executes a negation-aware, set-intersection check against a character's physical constraints. Contradictions trigger bounded retries rather than relying on an LLM to audit itself.


* **Causal Provenance:** Every artifact maintains a bidirectional graph, allowing the system to calculate the exact blast radius of mutated upstream facts via cache invalidation.


* **Human Intervention as State:** Director overrides are recorded as first-class, auditable events within the ledger, preserving the boundary between automation and human taste.



## Temporal and Visual Determinism

Time is locked before pixels are computed, treating scriptwriting as a compilation target.

* **Acoustic Master Clock:** Audio duration is measured in milliseconds via `ffprobe`, quantized from a model's native frame rate to a strict $4n+1$ latent reality, and finally retimed to a 24 fps master delivery budget.


* **Absolute Timeline Anchoring:** Stems are mapped to absolute frame indices rather than concatenated, eliminating cumulative drift across hundreds of cuts.


* **Greenscreen Separation:** Diffusion models render characters against `#00FF00`, offloading spatial reality to deterministic compositing via source-baked, human-readable TSX files.


* **Pressure Engine:** Permitted high-friction actions increment a strain meter, injecting mandatory dramatic constraints into subsequent shots and transforming the ledger into an active plot generator.



## The Empirical Execution Mandate

The system strips away engineering fiction—such as speculative 23-pod clusters, Merkle trees, and two-phase commit protocols—in favor of a risk-calibrated gauntlet. Design iteration must halt to execute the Gate 2 Tracer Bullet: forcing a single narrative constraint through audio synthesis, a video plate, and a local composite to physically validate the seams of the transmedia compiler.

The architecture has reached clarity: it is not a video renderer or a prompt-orchestration engine, but an **event-sourced deterministic media compiler governed by strict authority boundaries**. Generative models (LLMs, diffusion networks, acoustic synthesizers) are untrusted execution workers with zero authority over world state, physical possibility, spatial positioning, or master timing.

---

### Part 1: The Five Load-Bearing Pillars

#### 1. Authority: The Ledger Governs, Models Propose

* **The Core Rule:** Generated content consumes state; it never silently creates or mutates state. If a generated script depicts an outcome not authorized by the state machine, it is not a stylistic flaw—it is a fatal compilation error.


* **Two-Way Enforcement:**
* *Restrictive Authority (The Floor):* The ledger forbids impossible actions (e.g., an actor with an amputated arm cannot perform bimanual tasks). This is enforced via compile-time negative context extraction and $O(\min(\vert{}A\vert{}, \vert{}B\vert{}))$ set intersection against banned verb lemmas and required limb capabilities.


* *Generative Authority (The Mandate):* The ledger mandates required outcomes (e.g., if duel mechanics dictate Bog loses and forfeits the siphon, the scene *must* contain that concession). This requires validating that the AST beat sequence terminates with the mandated state transition event before the scene is approved.





#### 2. Space as the Engine of Causality

* **Physical Proximity over Authorial Selection:** Without spatial coordinates, character pairing relies on unconstrained LLM heuristics that default to repetitive, high-probability pairings. A coordinate grid forces the engine to ask *who can physically encounter whom*.


* **Decoupled Change Rates and Authorities:**
* *The Map (Immutable Canon):* The topological graph and terrain rules change only during deliberate world-building revisions (owned by Canon Law).


* *Spatial Math (Pure Library):* Distance and pathfinding calculations are pure, stateless functions with zero side effects (owned by Code).


* *Coordinates (Relational Ledger):* Actor hex locations mutate dynamically across execution cycles (owned by Ledger State).





#### 3. Simulation Precedes Language

* **The Closed Problem Mandate:** Narrative stakes, conflict mechanics, and resolution vectors are determined *before* an LLM receives a prompt. The language model is never asked "who wins?"; it is asked "given this mechanical winner, this loser, this leverage expenditure, and these physical constraints, generate the dramatic surface dialogue".


* **Tuning the Constraint Envelope:** Over-specifying every micro-action produces stiff, robotic dialogue; under-specifying allows model hallucination. The ledger dictates the scene's bounding box (participants, initial tension, required dramatic turns, mandatory exit conditions), leaving the high-dimensional lexical realization to the LLM.



#### 4. Temporal Compilation: Audio as Clock, Coordinates as Invariants

* **Duration as Observation, Frames as Derivation:** Audio is synthesized first. An uncompressed `.wav` buffer is measured via `ffprobe` to capture raw millisecond duration ($D_{\text{ms}}$). Discrete video frame counts are derived explicitly:



$$\text{target\_frames} = \left\lceil \frac{D_{\text{ms}}}{1000} \times \text{delivery\_fps} \right\rceil$$



* **Absolute Coordinate Anchoring:** Timeline positions are absolute integer coordinates, not dynamic floating-point sums evaluated at render time:



$$\text{start}_k = \sum_{i=1}^{k-1} \text{duration}_i$$




Every shot boundary is locked at compile time, preventing sub-frame rounding drift across long compositions.



#### 5. Media Projections Never Mutate State

* **Unidirectional Pipeline:** Information flows strictly from World State $\to$ Narrative AST $\to$ Temporal Plan $\to$ Baked Source $\to$ Media Derivative. No downstream media layer (Remotion TSX, FFmpeg filtergraphs, MP4 masters) may feed back into the narrative ledger without an explicit, auditable transaction.


* **The Human Edit Boundary:**
* *Representation Edits:* Adjusting camera easing curves, visual crop parameters, or color grading LUTs remains local to the presentation source (`Episode_XXX.tsx`).


* *Meaning Edits:* Altering dialogue lines, changing emotional subtext, or modifying action beats must be routed back through the AST and re-compiled downstream, updating the state log.





---

### Part 2: Critical Corrections and Sharpened Invariants

#### 1. The 2d6 Mechanics and the Leverage Multiplier Trap

The sum of two independent six-sided dice ($2\text{d}6$) forms a triangular distribution ranging from 2 to 12, with 7 occurring at a probability of $16.67\%$, while 2 and 12 occur at only $2.78\%$ each. The difference between two opposed $2\text{d}6$ rolls creates a zero-centered symmetric distribution spanning $[-10, 10]$:

```text
Δ Roll Margin:   0      ±1      ±2      ±3      ±4      ±5     ≥ ±6
Probability:   16.7%   27.8%   22.2%   16.7%   11.1%    5.6%    0.0%
Cum. Outcome:  [  Tie  ] [ Mutual Wound ] [Costly Win] [  Clean Win  ]

```

* **The Problem:** Margins of 0, 1, or 2 account for roughly $66.7\%$ of all unmodified encounters, skewing the narrative toward constant Mutual Wounds and Costly Wins.


* **The Leverage Swing:** If an argument score is computed as:

$$\text{Score} = (\text{Base} + \text{Roll}) + (\text{Strings} \times W) - (\text{Debuffs} \times P)$$




With $W = 3$, expending a single String shifts the margin by $+3$, which swings win probability by 30–40 percentage points near the distribution center. Leverage will dominate baseline attributes unless Strings are tightly rationed or $W$ is scaled down (e.g., $W = 1.5$ or capped at a $+2$ maximum contribution).



#### 2. Simulation Attractors and Pairing Entropy

A dynamic social simulation naturally falls into three degenerative mathematical traps:

1. **Positive Feedback Loops (Runaway Winners):** High-status characters win duels, acquire leverage, and continuously suppress lower-status characters. *Cure:* Diminishing returns on leverage and escalating social scrutiny/vulnerability on dominant figures.


2. **Absorbing States (Death Spirals):** A character accumulates debilitating somatic or social conditions (e.g., `humiliated`, `exhausted`) from which they have no mechanical path to recover. *Cure:* Mandatory condition decay rates, rest cycles, and sanctuary hexes.


3. **Sticky Pairings (The Gravity Well):** Two adjacent characters with high mutual resentment repeatedly trigger pairing lotteries, locking out the rest of the ensemble. *Cure:* Escalating cooldown cycles and spatial repulsion vectors following confrontations.



To monitor simulation health automatically, compute **Pairing Entropy** across a sliding window of $N$ cycles:

$$H(P) = -\sum_{i=1}^{M} p_i \log_2(p_i)$$

Where $p_i$ is the empirical encounter probability of character pair $i$ over the window. If $H(P)$ drops below a pre-registered floor, the simulator flags an attractor lock and forces anti-clustering lotteries.

#### 3. Epistemic Horizons: The Multi-Speaker Prompt Dilemma

Enforcing "ignorance by omission" (scrubbing secrets from context) is straightforward in single-agent environments, but creates an architectural dilemma in multi-speaker dialogue scenes:

* *The Unified Context Risk:* If a single LLM prompt contains Character A (who knows the murder secret) and Character B (who does not), Character B's attention heads will attend to Character A's private context, causing conversational leaks.


* *The Dual-Prompt Tax:* Generating dialogue turn-by-turn with isolated epistemic context windows guarantees zero leaks, but increases API latency and degrades natural conversational cadence.


* *The Operational Resolution:* Implement **Epistemic Role Fencing** within a unified generation call. The system prompt injects private knowledge cards explicitly scoped to specific character IDs, followed by an automated post-generation **Leak Sentry** that scans Character B's emitted dialogue spans for lexical tokens or lemmas associated with Character A's unrevealed knowledge graph.



#### 4. Dual-Field Validation: Action Enums vs. Free Prose

A self-reported action enum in the AST (e.g., `extracted_motor_actions: ["LIMP"]`) verifies only the model's *claim*, not the prose itself. The model can claim compliance while writing forbidden physical actions in text.

* The pipeline requires three complementary checks:
1. *Grammar-Constrained AST:* Enforces that emitted action enums belong to the character's allowable capability set.


2. *Independent Extraction Pass:* A deterministic (temperature 0) model reads the emitted prose and extracts motor actions independently.


3. *Negation-Aware Lemma Scan:* A dependency parser scans the prose for banned lemmas, parsing modals and negation trees (e.g., "he could not grasp" passes, while "he grasped" fails).





#### 5. Generator Snapshot Rigor

In a source-baking architecture, `generate-episode-repo.ts` is a single point of failure: an unspotted compiler bug will replicate across every subsequent episode build.

* *Golden File Testing:* The generator must be bounded by automated snapshot regression tests.


* *Differential Review:* PRs modifying `generate-episode-repo.ts` must include an automated diff of the TSX emitted across a canonical test scene, ensuring compiler adjustments do not cause unintended layout drift.



---

### Part 3: High-Leverage Operational Additions

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. SPATIOTEMPORAL HIERARCHY SCHEMA                          │
│    World Cycle (Tick) ──► Episode ──► Scene ──► Beat ──► Shot│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. EPISTEMIC BELIEF-PROVENANCE DATA MODEL                   │
│    { holder, proposition, confidence, source_event, type }  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. THE MULTIMODAL BOREDOM DETECTOR                          │
│    Jaccard Similarity across Openings, Grievances, Locs     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. CANON ERRATA & RE-ANCHORING PROTOCOL                     │
│    Immutable Errata Log + DAG Dependency Invalidation       │
└─────────────────────────────────────────────────────────────┘

```

#### Addition 1: Spatiotemporal Hierarchy (Cycle vs. Episode vs. Scene)

Ambiguity between simulation time and media time causes race conditions in cooldown clocks. The pipeline enforces this four-tier temporal mapping:

| Level | Unit Name | Governing Clock | Typical Duration | State Mutations Permitted |
| --- | --- | --- | --- | --- |
| **L1** | **Simulation Cycle** | Discrete World Tick | 1 Chronological Day | Hex movement, hunger decay, passive tension

 |
| **L2** | **Episode** | Broadcast Container | 1–3 Scenes (2–5 min) | Grievance cooldown decrement, public status updates

 |
| **L3** | **Scene** | Spatial Encounter | Single Room / Hex Adjacency | Duel resolution, trauma injection, secret revelation

 |
| **L4** | **Beat / Shot** | Exposure Sheet / Audio | 1–5 Seconds (Integer Frames) | Somatic fatigue increment, viseme shifts, camera cues

 |

#### Addition 2: Epistemic Belief-Provenance Data Model

Drama depends on characters acting on incomplete or mistaken beliefs. Belief is decoupled from objective truth in the state schema:

```typescript
// src/types/epistemic.ts
export interface BeliefRecord {
  belief_id: string;
  holder_id: string;
  proposition_slug: string;        // e.g., "stole_the_siphon"
  target_id: string;               // e.g., "spleen"
  perceived_truth_value: boolean;  // true = believes it happened
  confidence: number;              // 0.0 to 1.0
  source_type: "DIRECT_OBSERVATION" | "TESTIMONY" | "INFERENCE" | "RUMOR";
  source_event_id: string;         // Pointer to Event Log
  resists_correction: boolean;     // Character psychological trait
}

```

This structure enables dramatic reveals: when Bog discovers that Spleen did not steal the siphon, the engine updates the belief record via an explicit event (`BELIEF_CORRECTED`), calculating social fallout from the discrepancy.

#### Addition 3: The Multimodal Boredom Detector

Beyond pairing entropy, detect narrative stagnation across a sliding window of the last $N$ scenes by calculating the mean Jaccard distance across scene properties:

$$J_{\text{scene}}(A, B) = \frac{\vert{}A \cap B\vert{}}{\vert{}A \cup B\vert{}}$$

The detector samples:

1. Active grievance slug.


2. Physical hex location ID.


3. Mechanical outcome taxonomy (`Clean Win`, `Costly Win`, `Mutual Wound`, `Backfire`, `Tie`).


4. Opening dialogue syntactic structure (e.g., question vs. imperative vs. observation).



If the composite similarity metric across the window exceeds $0.65$, the Sower rejects the selected scene and re-runs the lottery with heavy negative weights applied to the repeating attributes.

#### Addition 4: Canon Errata and Historical Re-Anchoring Protocol

When an author discovers a fundamental world error (e.g., Bog's old injury was his left leg, not his right arm), already-rendered episodes must not be silently corrupted:

1. **Canon Errata Log:** Canon changes are committed as an append-only transaction (`canon_errata_v1.2.json`), never by modifying historical records in place.


2. **Snapshot Invariance:** Rendered episodes retain their pinned `canon_version` (e.g., `v1.1.0`) in their `render_manifest.json`.


3. **Re-anchoring Decision Gate:** The DAG engine marks all downstream scenes referencing that fact as dirty. The director chooses between:


* *Freezing History:* Retaining the old episodes as legacy artifacts.


* *Remastering:* Re-running the build pipeline downstream from the mutation, outputting a new, explicitly tagged build (`EP012_remaster_v2.mp4`).





#### Addition 5: Mechanical Stylometric Voice Fixture

To stop multi-character LLM dialogue from converging on generic, polite prose, each character dossier defines an automated stylometric fixture:

```json
{
  "character_id": "bog",
  "stylometric_bounds": {
    "mean_sentence_length": [6.2, 11.5],
    "max_sentence_length": 18,
    "subordinating_conjunction_rate": [0.01, 0.04],
    "mandatory_lexical_tics": ["aye", "scraps", "siphon"],
    "banned_latinate_lemmas": ["testament", "tapestry", "palpable", "furthermore"]
  }
}

```

Before a scene clears the narrative compiler, an automated parser checks the character's dialogue lines against these bounds. Any text crossing the lexical or syntactical threshold is rejected at zero GPU cost.

---

### Part 4: The 10-Phase Gated Execution Matrix

To avoid the cycle of continuous re-architecture, project progression is bound to concrete, falsifiable decision gates. Advancement to the next phase requires satisfying binary verification criteria:

| Phase | Subsystem | Concrete Deliverable | Non-Negotiable Exit Gate |
| --- | --- | --- | --- |
| **1** | **World Model** | JSON Schemas + SQLite Relational Ledger | Valid world loads; deliberate schema violation throws fatal exit 1.

 |
| **2** | **Spatial Engine** | Stateless Hex Math Library (`npm test`) | Invariant tests pass; renders debug SVG of active positions.

 |
| **3** | **Simulation** | Headless Sower Simulator (No Video) | 1,000-cycle batch completes; pairing entropy $H(P) \ge 2.2$; zero crashes.

 |
| **4** | **Grievance Corpus** | $\sim 10$ Authored Grievance Markdown Files | Hand-feeding 1 grievance into an LLM produces a viable 4-beat scene.

 |
| **5** | **Scene Spec** | Compiler IR (`dialogue_ast.json`) | Complete machine contract emitted without human intervention.

 |
| **6** | **Expression** | Local LLM Generator + Linters | Injected somatic contradiction and epistemic leak are both blocked.

 |
| **7** | **Editorial Gate** | CLI / PR Review Interface | Director can review, accept, or reject a scene spec in $\le 60$ seconds.

 |
| **8** | **Acoustic Clock** | Local TTS + `ffprobe` Quantizer | Synthesis finishes; measured duration yields identical frame budget on retry.

 |
| **9** | **Render Plane** | `goblin-viewport-template` (Remotion) | Compiles and renders one 3-second cut to MP4 with verified lip-sync.

 |
| **10** | **Archive & QA** | Storage Staging + Provenance Lockfile | Render passes Tier 1 signal gates; clean re-render matches binary hash.

 |

(Note: Phases 3 and 4 run as an iterative development loop: the simulation cannot be evaluated without real grievances, and grievances cannot be balanced without simulation run statistics.)

---

### Part 5: The Gate 2 Tracer Bullet

Further refinement of architecture documentation has reached a point of diminishing returns. The non-negotiable next operational step is executing the **Gate 2 Tracer Bullet** to physically validate pipeline boundaries on local hardware:

```text
[ 1. Authored Grievance & Ledger State ]
                    │
                    ▼
[ 2. Dialogue AST Line (3.12s) ]
                    │
                    ▼
[ 3. Local TTS Synthesis (.wav) ] ──► ffprobe: 3120ms → Locked to 75 Frames at 24fps
                    │
                    ▼
[ 4. Metaprogram Stamping ]      ──► generate-episode-repo.ts → Episode_001.tsx
                    │
                    ▼
[ 5. Headless Remotion Render ]   ──► Rig 1 (gl: swangle, concurrency: 1)
                    │
                    ▼
[ 6. Artifact Verification ]     ──► Master MP4 + render_manifest.json

```

```bash
# Minimal Acceptance Checklist for the Tracer Bullet
[ ] 1. One line of dialogue generated from a pinned grievance AST
[ ] 2. Audio synthesized locally and duration verified via ffprobe
[ ] 3. Integer frame budget locked at 24 fps (3,120 ms -> 75 frames)
[ ] 4. goblin-viewport-template bakes Episode_001.tsx with numeric literal JSX props
[ ] 5. Remotion renders master MP4 via software rasterization (--gl=swangle)
[ ] 6. Clean double-render assertion: SHA-256(Render_A) == SHA-256(Render_B)

```

Executing this single 3-second render will reveal the real points of friction—audio-video sync, asset path normalization, and compositor performance—more effectively than further systems design.

### 1. The Validated Pillars & Mathematical Corrections

The system remains an **event-sourced deterministic media compiler governed by strict authority boundaries**. Generative models (LLMs, diffusion networks, acoustic synthesizers) act purely as untrusted, headless execution workers bounded by compile-time contracts.

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. AUTHORITY: Ledger governs, generation proposes           │
│    • Restrictive: ledger forbids impossible actions         │
│    • Generative: ledger mandates required outcomes          │
├─────────────────────────────────────────────────────────────┤
│ 2. CAUSALITY: Space determines encounter eligibility        │
│    • Canon owns the map; Code owns math; Ledger owns coords │
├─────────────────────────────────────────────────────────────┤
│ 3. SIMULATION PRECEDES LANGUAGE                             │
│    • Ledger sets bounding box; LLM realizes dialogue        │
├─────────────────────────────────────────────────────────────┤
│ 4. TIME: Audio is the clock, frame budgets are coordinates  │
│    • ffprobe duration_ms measured once; frames derived      │
├─────────────────────────────────────────────────────────────┤
│ 5. UNIDIRECTIONAL FLOW: Media never creates state           │
│    • Meaning edits route upstream; visual edits stay local  │
└─────────────────────────────────────────────────────────────┘

```

#### Opposed $2\text{d}6$ Margin Distribution

The difference between two independent $2\text{d}6$ rolls ($D = X_1 - X_2$) across all 1,296 possible combinations forms a zero-centered symmetric distribution spanning $[-10, 10]$:

$$\text{Margin } 0: \frac{146}{1296} \approx 11.27\%$$

$$\text{Margin } \pm 1: \frac{280}{1296} \approx 21.60\% \quad (140 \text{ per side})$$

$$\text{Margin } \pm 2: \frac{250}{1296} \approx 19.29\% \quad (125 \text{ per side})$$

* **Core Takeaway:** Margins of $0$ to $2$ account for **$52.16\%$** of encounters (676 combinations), not $66.7\%$.
* **Tails Are Real:** Margins of $\vert{}D\vert{} \ge 5$ occur across 252 combinations (**$19.44\%$**), and $\vert{}D\vert{} \ge 6$ accounts for 140 combinations (**$10.80\%$**). Clean Wins ($\text{margin} \ge 4$) occur naturally in roughly $28.7\%$ of unmodified encounters.
* **Leverage Dynamics:** In a system where base attributes range from 1 to 5, an argument score of $(\text{Base} + \text{Roll}) + (\text{Strings} \times W) - (\text{Debuffs} \times P)$ with $W = 3$ allows a single String to swing the net margin by $+3$. On a triangular distribution centered at 0, moving the mean by $+3$ shifts the win probability from $50\%$ to over $82\%$. Unless Strings are scarce or $W$ is scaled (e.g., $W = 1.5$ or capped at a maximum contribution of $+2$), leverage will overpower baseline character attributes.


* **Algorithmic Notation:** Decorative Big-O complexity claims (such as $O(\min(\vert{}A\vert{}, \vert{}B\vert{}))$ vs $O(1)$) are irrelevant when validating sets containing 10–20 verbs. Correctness over tiny in-memory hash sets is what matters.



---

### 2. The Spatiotemporal Hierarchy & The Separation of Concerns

Lumping narrative beats and visual shots together breaks the boundary between meaning and representation. A narrative beat can span multiple visual shots (e.g., cutting to a listener during an accusation), while a single continuous shot can contain multiple narrative beats.

| Level | Unit Name | Governing Layer | Primary Clock | Allowed State Mutations |
| --- | --- | --- | --- | --- |
| **L1** | **Simulation Cycle** | World Engine | Discrete World Tick | Hex movement, passive condition decay, hunger/supplies

 |
| **L2** | **Episode** | Broadcast Container | Pacing / Schedule | Public status updates, major grievance cooldown decrement

 |
| **L3** | **Scene** | Encounter Space | Spatial Adjacency | Duel resolution, trauma injection, secret revelations

 |
| **L4** | **Beat** | Narrative AST | Swain MRU Order | Somatic fatigue increment, refusal strain, local tension

 |
| **L5** | **Shot** | Exposure Sheet | Master Frame Clock (24 fps) | Audio stem trigger, camera push-in, viseme cueing

 |
| **L6** | **Frame** | Optical Compositor | 1/24 s Rasterization | Pixel transforms, chroma despill, motion interpolation

 |

* **Beats Belong to Narrative:** Beats declare intent, action requirements, and spoken dialogue strings in `dialogue_ast.json`.


* **Shots Belong to Presentation:** Shots declare camera angles, cuts, and audio stem mappings in `exposure_sheet.json`.


* **Audio Timebase Integrity:** Store both the measured `duration_ms` from `ffprobe` (the empirical observation) and the derived integer frame budget (the presentation coordinate). Once approved, audio stems are treated as immutable, content-addressed archives. They are never re-synthesized at render time, preventing subtle sample duration jitter from breaking the locked exposure sheet.



---

### 3. Epistemic Modeling & Multi-Speaker Verification

Drama requires characters to act on false, incomplete, or secondhand beliefs. Belief is decoupled from objective truth in the state schema:

```typescript
export interface BeliefRecord {
  belief_id: string;
  holder_id: string;
  subject_id: string;              // e.g., "spleen"
  predicate: string;               // e.g., "stole"
  object_id: string;               // e.g., "the_siphon"
  subjective_probability: number;  // 0.0 (certain false) to 1.0 (certain true)
  source_type: "DIRECT_OBSERVATION" | "TESTIMONY" | "INFERENCE" | "RUMOR";
  source_event_id: string;         // Pointer to Event Log
  resists_correction: boolean;     // Trait: rejects contradictory evidence
}

```

#### Rumor Propagation & Decay

Beliefs must not saturate the cast instantly:

* With each hops of `TESTIMONY` or `RUMOR`, degrade `subjective_probability` by a decay factor (e.g., $0.8\times$ per hop).
* Maintain source pointers so reveal scenes ("Who told you that?") can trace the chain of transmission back to the originating event.



#### The Multi-Speaker Prompt Dilemma

Enforcing "ignorance by omission" encounters practical trade-offs in multi-speaker dialogue:

* **The Leak Sentry's Vulnerability:** Post-generation lexical regex/lemma scans catch only direct token leaks. They miss implied or paraphrased disclosures (e.g., Character A referencing "the thing you hid in the culvert" without ever saying the forbidden word "siphon").


* **Tiered Generation Architecture:**
* *Low-Stakes Scenes:* Unified generation call with explicit, role-scoped context blocks, followed by automated lexical sentry checks.


* *High-Stakes Secrets:* Isolated, turn-by-turn generation calls where speaking characters literally receive zero tokens concerning the hidden fact in their context windows.





#### The Three-Layer Action Validation Stack

To prevent self-reporting traps where an LLM declares compliance in its action enum while contradicting it in prose:

1. **Grammar-Bound Action Enum:** Constrains decoding via GBNF to valid capability tokens available to that character in their current somatic state.


2. **Negation-Aware Dependency Scan:** A deterministic parser sweeps the prose for banned action lemmas, parsing modals and negation dependencies (e.g., "failed to grip" or "could not run" pass; "he ran" fails).


3. **Semantic Extraction Model (Backstop):** A separate, low-temperature semantic parser extracts depicted physical actions from prose.


* *Discrepancy Policy:* A disagreement between the declared enum and extracted actions flags the scene for retry or human review only if the disputed action consumes a *constrained physical capability* (such as a paralyzed limb or occupied hands). Disagreements over non-constrained ambient actions (e.g., `["GLANCE"]` vs `["STARE"]`) are ignored as stylistic noise.





---

### 4. Dynamic Simulation Metrics & Voice Profiling

#### Normalized Pairing Entropy

To monitor whether character collisions are stagnating, compute pairing entropy normalized against cast size:

$$H_{\text{norm}}(P) = \frac{-\sum_{i=1}^{M} p_i \log_2(p_i)}{\log_2(M)}$$

where $M = \frac{K(K-1)}{2}$ is the number of possible unordered pairs for a cast of $K$ characters.

* $H_{\text{norm}}(P) \in [0.0, 1.0]$.
* A healthy serialized narrative requires uneven pairing (rivalries and alliances), so $H_{\text{norm}}$ should fluctuate between 0.65 and 0.85.
* Do not enforce a rigid floor; trigger anti-clustering repulsion vectors only when $H_{\text{norm}}$ experiences a sharp collapse ($\Delta H_{\text{norm}} \le -0.25$ across a rolling window).



#### Metric-Appropriate Boredom Detection

* **Categorical Properties (Location, Outcome, Grievance):** Use exact-match fraction across a sliding window of $N$ scenes:

$$\text{MatchRate} = \frac{\sum_{i=1}^{N-1} \mathbb{I}(X_i = X_N)}{N-1}$$


* **Set-Valued Properties (Present Cast, Active Props):** Use Jaccard similarity:

$$J(A, B) = \frac{\vert{}A \cap B\vert{}}{\vert{}A \cup B\vert{}}$$


* **Evaluation Discipline:** Any automated anti-repetition mechanism changes the simulation distribution; therefore, baseline simulation health (Phase 3) must be measured with the boredom detector *active*.

#### Calibrated Stylometric Voice Fixtures

* **Derived, Not Guessed:** Establish stylistic bounds (sentence length variance, function word distribution, subordination rate) by computing statistics on hand-authored character dialogue exemplars, applying a $\pm 25\%$ tolerance envelope.
* **Frequency over Mandates:** Verbal tics and colloquialisms must be evaluated as target frequencies across an entire scene or episode (e.g., 1–3 occurrences per 100 words), never as mandatory per-line requirements. Mandatory per-line tics turn dialogue into self-parody.

---

### 5. High-Leverage Operational Additions

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. IDEMPOTENT & RESUMABLE PIPELINE STAGES                   │
│    • Staged disk writes: write to .tmp, atomic rename       │
│    • Resumption: stages check for existing valid artifacts  │
├─────────────────────────────────────────────────────────────┤
│ 2. ONE-SCREEN HUMAN REVIEW VIEW                             │
│    • Plain-text: Participants, Grievance, Beats, Exit State │
│    • Evaluated in <= 60 seconds without viewing raw JSON    │
├─────────────────────────────────────────────────────────────┤
│ 3. STRUCTURED REJECTION LOGGING                             │
│    • Categorized feedback (FLAT, CONTRADICTION, OOC, PACING)│
│    • Converts editorial judgment into prompt tuning data    │
├─────────────────────────────────────────────────────────────┤
│ 4. CANON ERRATA & RETROACTIVE VERSIONING                    │
│    • Immutable errata logs; episodes pin canon_version      │
│    • Director chooses: freeze legacy or tag EP_remaster_v2  │
└─────────────────────────────────────────────────────────────┘

```

#### Addition 1: Idempotent and Resumable Pipeline Stages

Media generation on physical hardware experiences frequent partial failures (e.g., TTS network timeouts on line 7 of 12, headless browser memory pressure):

* Every pipeline stage must write to temporary scratch files (`.tmp`) and commit via atomic filesystem rename.


* Stages check for the existence and hash validity of upstream assets before computing; if TTS crashes mid-scene, a restarted run resumes from the missing stem rather than regenerating earlier stems.



#### Addition 2: The One-Screen Scene Review Interface

A human director cannot review raw `dialogue_ast.json` in under 60 seconds. The review view compiles into a clean, text-only operational brief:

```text
SCENE: ep040_sc03 (Swamp Relay / Day)
CAST: BOG vs SPLEEN
GRIEVANCE: The Good Silver Spoon (Resource Hoarding, Stage 2)
SUBTEXT: Bog feels uncredited; Spleen refuses to acknowledge dependence.
MECHANICAL OUTCOME: Costly Win for Spleen (Margin: +2, 1 String Spent)
EXIT STATE: Bog gains [humiliated]; Spleen gains [exhausted]; Wart gains 1 String on Spleen.

BEAT PREVIEW:
  1. [SPLEEN] Demands Bog account for missing brass fittings.
  2. [BOG] Deflects, bringing up who carried the rations during the dry cycle.
  3. [SPLEEN] Pulls the silver spoon, claiming Bog would have left it in the mud.
  4. [BOG] Goes silent, surrendering the siphon wrench [MANDATED EXIT BEAT].

[ APPROVE ]   [ REJECT & LOG REASON ]   [ EDIT CONSTRAINTS ]

```

#### Addition 3: Structured Rejection Logging

When a scene is rejected, the director selects from a closed taxonomy:

* `FLAT_DIALOGUE`: Characters sound generic; lacks conflict texture.


* `UNEARNED_RELEASE`: Subtext was stated directly in prose.


* `SOMATIC_DRIFT`: Physical impossibility slipped past validators.


* `VOICE_BLEED`: Character sounded like another cast member.


* `PACING_STALL`: Scene repeated a recent conflict shape without escalation.

### 1. The Epistemological Inversion: Truth vs. Rendering

The system is fundamentally an **event-sourced, deterministic media compiler**, not an AI video generator. Generative models—large language models, diffusion networks, and speech synthesis engines—possess zero narrative, spatial, or temporal authority. They are untrusted, headless execution workers operating inside strict software fences.

```text
       CANON (Immutable Axioms, Physiological Rules, Geographical Invariants)
          │
          │ constrains
          ▼
       STATE (Materialized Snapshot: Somatic, Logistical, Epistemic Vectors)
          │
          │ transformed by
          ▼
       EVENT (Transactional Mutation: Typed Delta + Explicit Seed Lineage)
          │
          │ reduced via Pure Deterministic Function
          ▼
     NEW STATE (Next Materialized Working View)
          │
          │ projected down unidirectional compiler pipelines
          ▼
   MEDIA PROJECTIONS (Screenplays, Exposure Sheets, Remotion TSX, Video Masters)

```

#### The Governing Axiom

$$\text{Probabilistic systems propose and execute; deterministic systems decide what is allowed to be true.}$$

#### The Deletion Principle

If all generative neural networks are deleted, the universe remains logically and referentially consistent inside the relational ledger with respect to its declared constraints. The state of characters, wounds, debts, inventories, and locations survives.

However, **generated media assets are archive-dependent**. Because non-deterministic GPU kernel execution, floating-point rounding, and latent sampling prevent bit-identical regeneration of diffusion plates from seeds alone, the physical archive (content-addressed object storage) must be preserved, version-pinned, and scrubbed alongside the code.

#### Media is Never State

Downstream media artifacts—screenplays (`.fountain`), exposure sheets, Remotion compositions (`Episode_XXX.tsx`), and rendered MP4 files—are transient or compiled **projections of truth**, never truth itself.

* A camera adjustment is an editorial choice, not a narrative shift.


* Re-recording an audio stem to adjust pacing does not alter the historical state transition.


* Re-grading a scene in post-production does not change the canonical physical event.



Information flows in one direction: $\text{World} \to \text{Plan} \to \text{Expression} \to \text{Timing} \to \text{Presentation} \to \text{Archive}$. Any editorial intervention that changes *meaning* must route upstream to the ledger to be re-compiled downstream. Any intervention that changes only *representation* (framing, camera easing, color grading) remains local to presentation source files.

#### The Two-Dimensional Compilation Architecture

The compiler separates what happens from how it is preserved across two orthogonal axes:

```text
               AXIS A: SEMANTIC TRANSFORMATION (Meaning)
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ WORLD STATE │ ──► │ NARRATIVE IR │ ──► │ TEMPORAL IR  │ ──► │  VISUAL IR   │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                   │                    │                    │
       ▼                   ▼                    ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  REDUCER &  │ ──► │  SOURCE CODE │ ──► │ HEADLESS RUN │ ──► │   VERIFIED   │
│  EVENT LOG  │     │ (TSX Baking) │     │  (Chromium)  │     │   ARTIFACT   │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
               AXIS B: ARTIFACT HARDENING (Representation)

```

This separation establishes an unambiguous diagnostic taxonomy for failures:

| Failure Mode | Axis & Domain | Diagnostic Root |
| --- | --- | --- |
| Character references an unrevealed secret | Axis A (Semantic) | Epistemic extraction leak in context builder (`Context_{char}`)

 |
| Character uses an amputated limb | Axis A (Semantic) | Somatic invariant violation against capability matrix

 |
| Dialogue begins 2 frames out of sync | Axis A (Temporal) | Quantization offset rounding error between audio timebase and frame clock

 |
| Viseme detaches from character chin line | Axis A (Visual) | Manifest anchor mismatch (`mouth_bounding_box` vs canvas scale)

 |
| Headless renderer segfaults or text reflows | Axis B (Hardening) | Container divergence or unpinned font asset substitution

 |
| Identical inputs yield divergent file hashes | Axis B (Hardening) | Muxing timestamps or container serialization non-determinism

 |
| Re-render of legacy episode alters visuals | Axis B (Hardening) | Historical corruption trap (unpinned shared component dependency)

 |

#### Authority Matrices & Boundaries

Every decision point is assigned to a single authoritative owner:

| Decision Domain | Authoritative Entity | Governing Mechanism |
| --- | --- | --- |
| Canonical Anatomy & Physics | Canon Corpus | Immutable Zod schemas, read-only disk boundaries

 |
| Current Physical & Epistemic State | Relational Ledger | SQLite / D1 transactional tables

 |
| Encounter & Outcome Selection | Narrative Simulation Core | Pure deterministic 2d6 duel mechanics & lotteries

 |
| Dialogue Realization & Style | Language Model | Constrained decoding, negative context masks

 |
| Master Timeline Duration | Audio Synthesis Engine | Measured waveform duration (`ffprobe`)

 |
| Frame Layout & Visual Coordinates | Asset Manifests | Typed coordinate contracts (`manifest.json`)

 |
| Presentation Choreography | Episode Compiler | Source-baked TypeScript React composition (`Episode_XXX.tsx`)

 |
| Master Release Acceptance | Verification Harness | Progressive multi-tier QA and human director review

 |

---

### 2. The Ontological Substrate: Canon, State, Events, and Pure Reducers

The system isolates immutable compile-time laws from mutable runtime states. Canon law is versioned and read-only; mutable state is transactional and reconstructible.

```text
┌────────────────────────────────────────────────────────┐
│ 000.goblin-lore (@snailicid3/consumer-npm)             │
│ • Immutable Schemas: characters.json, grievances.json  │
│ • Static compiled/bible-state.json (read-only)         │
└───────────────────────────┬────────────────────────────┘
                            │ Read-only ingestion
                            ▼
┌────────────────────────────────────────────────────────┐
│ DYNAMIC RELATIONAL LEDGER (SQLite / PostgreSQL / D1)   │
│ • Somatic Vectors: physical trauma, capability sets    │
│ • Logistical Vectors: item ownership, hand occupancy   │
│ • Epistemic Vectors: secrets known, directional debts  │
│ • Spatial Vectors: hex coordinates, topological graphs │
│ • Unified Pressure Meters: fatigue, strain, paranoia   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ PURE EVENT REDUCER: S_{n+1} = R(S_n, E_n, σ_n)         │
│ • Zero network access, zero wall-clock time            │
│ • Deterministic ordered iteration                      │
└────────────────────────────────────────────────────────┘

```

#### The Pure Reducer Function

Historical truth is preserved in an append-only Event Log. State mutation is governed strictly by a pure reducer function:

$$S_{n+1} = \mathcal{R}(S_n, E_n, \sigma_n)$$

where $S_n$ is the active state, $E_n$ is the ordered event, and $\sigma_n$ is the explicit, logged random seed.

* **Purity Constraints:** The reducer function $\mathcal{R}$ must never reference `Date.now()`, system environment variables, network sockets, or non-deterministic key iterations over hash maps.


* **Reconstructibility:** Given the initial genesis state $S_0$ and the ordered event stream $E_1, E_2, \dots, E_N$ with their respective seeds $\sigma_1, \dots, \sigma_N$, the current state $S_N$ is deterministically reproducible:

$$S_N = \mathcal{R}(\dots \mathcal{R}(\mathcal{R}(S_0, E_1, \sigma_1), E_2, \sigma_2) \dots, E_N, \sigma_N)$$

The relational database functions as a materialized view for fast queries; the event log is the authoritative history.

#### Dual Randomness Classification

Randomness is bifurcated based on whether it alters narrative truth:

1. **Narrative Randomness:** Conflict lotteries, dice duel rolls, leverage expenditure heuristics, and pathfinding decisions. This alters the relational ledger and must be bit-for-bit replayable via hierarchical seeds:


$$\text{Seed}_{\text{shot}} = \text{HMAC-SHA256}(\text{Seed}_{\text{episode}}, \text{scene\_id} + \text{":"} + \text{shot\_id})$$



2. **Representational Randomness:** Diffusion latent sampling, audio noise variation, procedural camera jitter, and background particle drifts. This affects sensory presentation only. It is recorded in the release manifest, but changing it does not alter world state.



$$\text{Narrative Identity} \neq \text{Representation Identity}$$

Two distinct video renders with different diffusion seeds can represent the same canonical historical event.

---

### 3. The Mechanical Simulation Core: Duel Math, Space, and Attractors

#### Spatial Simulation as Narrative Causality

Space is not an animation convenience; it is a causal gating mechanism. Unconstrained LLM story selection defaults to repetitive, high-probability pairings. A coordinate grid forces the engine to evaluate physical eligibility:

* **Canon** defines the topological map (swamps, culverts, relays, barriers) and terrain properties.


* **Code** provides pure mathematical libraries:

$$\text{distance}(a, b), \quad \text{neighbors}(p), \quad \text{line\_of\_sight}(a, b, \text{map})$$



The spatial library stores no state.


* **Ledger** holds active character coordinates $(q, r, s)$ on a cubic hex grid.



Spatial coordinates answer non-negotiable narrative prerequisites: Who can encounter whom? Who can witness an event? Who can arrive as a reinforcement? Who is physically isolated?

#### The Opposed $2\text{d}6$ Duel Mechanics

Encounters resolve using two opposing six-sided dice ($2\text{d}6$). The difference between two independent $2\text{d}6$ sums ($D = X_1 - X_2$) across all 1,296 combinations forms a discrete, zero-centered symmetric distribution spanning $[-10, 10]$:

$$\text{Margin } 0: \frac{146}{1296} \approx 11.27\%$$

$$\text{Margin } \pm 1: \frac{280}{1296} \approx 21.60\% \quad (140 \text{ per side})$$

$$\text{Margin } \pm 2: \frac{250}{1296} \approx 19.29\% \quad (125 \text{ per side})$$

$$\text{Margin } \pm 3: \frac{208}{1296} \approx 16.05\% \quad (104 \text{ per side})$$

$$\text{Margin } \pm 4: \frac{160}{1296} \approx 12.35\% \quad (80 \text{ per side})$$

$$\text{Margin } \pm 5: \frac{112}{1296} \approx 8.64\% \quad (56 \text{ per side})$$

$$\text{Margin } \pm 6: \frac{70}{1296} \approx 5.40\% \quad (35 \text{ per side})$$

$$\text{Margin } \pm 7: \frac{40}{1296} \approx 3.09\% \quad (20 \text{ per side})$$

$$\text{Margin } \pm 8: \frac{20}{1296} \approx 1.54\% \quad (10 \text{ per side})$$

$$\text{Margin } \pm 9: \frac{8}{1296} \approx 0.62\% \quad (4 \text{ per side})$$

$$\text{Margin } \pm 10: \frac{2}{1296} \approx 0.15\% \quad (1 \text{ per side})$$

```text
Δ Roll Margin:      0        ±1        ±2        ±3        ±4        ±5       ≥ ±6
Probability:      11.3%     21.6%     19.3%     16.1%     12.4%      8.6%     10.8%
Outcome Type:   [  Tie  ] [  Mutual Wound  ] [Costly Win] [     Clean Win      ]

```

* **Ties and Mutual Wounds ($\vert{}D\vert{} \le 2$):** Account for **$52.16\%$** of unmodified encounters (676 combinations).


* **Clean Wins ($\vert{}D\vert{} \ge 4$):** Account for **$31.79\%$** of encounters (412 combinations; $15.90\%$ per side).


* **Extreme Tails ($\vert{}D\vert{} \ge 6$):** Account for **$10.80\%$** of encounters (140 combinations).



#### The Leverage Weighting Trap

The argument score is computed as:

$$\text{Score} = (\text{Base} + \text{Roll}) + (\text{Strings} \times W) - (\text{Debuffs} \times P)$$

If character base attributes range from 1 to 5 and the leverage weight is $W = 3$, spending a single String shifts the net margin by $+3$.
On the discrete difference distribution, a $+3$ shift moves win probability from $50.0\%$ to:

$$P(D + 3 > 0) = P(D \ge -2) = \frac{1058}{1296} \approx 81.64\%$$

A single String swings win probability by over 31 percentage points. Unconstrained leverage overpowers baseline attributes.

* **Design Rule:** Leverage weight must be calibrated ($W \le 1.5$) or capped at a maximum contribution of $+2$ per encounter to preserve the influence of core character stats.



#### Simulation Attractors and Degeneracy Metrics

Unchecked dynamic simulations fall into three failure states:

1. **Positive Feedback Loops (Runaway Dominance):** High-status characters win, capture Strings, and permanently dominate lower-status characters. *Remedy:* Diminishing returns on leverage and escalating social scrutiny on dominant characters.


2. **Absorbing States (Death Spirals):** Characters accumulate persistent injuries or debuffs with no path to recovery. *Remedy:* Mandatory condition decay rates, rest cycles, and sanctuary zones.


3. **Sticky Pairings (The Gravity Well):** Two collocated characters with high resentment continuously trigger the pairing lottery, starving the rest of the cast. *Remedy:* Post-duel spatial repulsion and escalating cooldown cycles.



#### Pairing Entropy

Simulation health is tracked across a sliding window of $N$ cycles using normalized pairing entropy:

$$H_{\text{norm}}(P) = \frac{-\sum_{i=1}^{M} p_i \log_2(p_i)}{\log_2(M)}$$

where $M = \frac{K(K-1)}{2}$ is the number of possible unordered pairs for a cast of $K$ characters, and $p_i$ is the empirical encounter frequency of pair $i$.

* $H_{\text{norm}}(P) \in [0.0, 1.0]$.
* Serialized drama requires structured rivalries rather than uniform randomness, meaning $H_{\text{norm}}$ should fluctuate between **0.65 and 0.85**.
* An automated alert fires only upon sharp collapse: $\Delta H_{\text{norm}} \le -0.25$ across a rolling window.



#### Metric-Appropriate Boredom Detection

To prevent narrative repetition, scenes are evaluated against recent history using appropriate statistical metrics:

* **Categorical Properties (Location, Outcome, Grievance):** Exact-match rate across a sliding window:

$$\text{MatchRate} = \frac{\sum_{i=1}^{N-1} \mathbb{I}(X_i = X_N)}{N-1}$$


* **Set-Valued Properties (Active Cast, Referenced Props):** Jaccard similarity:

$$J(A, B) = \frac{\vert{}A \cap B\vert{}}{\vert{}A \cup B\vert{}}$$



Anti-repetition re-weighting alters the simulation distribution; therefore, baseline simulation health must be measured with the boredom detector active.

---

### 4. The Epistemic Engine & Multi-Speaker Verification

Drama relies on asymmetry: what is objectively true, what characters believe, and what they are hiding.

```text
┌────────────────────────────────────────────────────────┐
│ OBJECTIVE GROUND TRUTH (The Ledger)                    │
│ "Spleen moved the silver siphon to the culvert."       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ SUBJECTIVE BELIEF GRAPH (BeliefRecord)                 │
│ Holder: Bog                                            │
│ Subject: Snerk | Predicate: stole | Object: siphon     │
│ Probability: 0.85 | Source: RUMOR (via Wart)           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ EPISTEMIC CONTEXT PROJECTION (Ignorance by Omission)   │
│ Context_Bog excludes ground truth.                     │
│ Context_Bog includes subjective belief.                │
└────────────────────────────────────────────────────────┘

```

#### Decoupling Truth from Belief

Belief is modeled explicitly in the relational schema:

```typescript
export interface BeliefRecord {
  belief_id: string;
  holder_id: string;
  subject_id: string;              // e.g., "snerk"
  predicate: string;               // e.g., "stole"
  object_id: string;               // e.g., "the_siphon"
  subjective_probability: number;  // 0.0 (certain false) to 1.0 (certain true)
  source_type: "DIRECT_OBSERVATION" | "TESTIMONY" | "INFERENCE" | "RUMOR";
  source_event_id: string;         // Pointer to Event Log
  parent_belief_id: string | null; // Causal transmission pointer
  hop_count: number;               // Distance from origin event
  resists_correction: boolean;     // Psychological trait
}

```

* **Rumor Propagation & Confidence Decay:** When a belief transfers via `TESTIMONY` or `RUMOR`, `hop_count` increments and `subjective_probability` degrades by an authored attenuation factor (e.g., $0.8\times$ per hop).
* **Auditability:** When a reveal scene occurs ("Who told you that?"), the provenance pointer (`source_event_id`, `parent_belief_id`) reconstructs the transmission chain back to the originating event.



#### The Multi-Speaker Prompting Trade-off

Enforcing "ignorance by omission" encounters an architectural dilemma in multi-speaker dialogue:

1. **The Shared-Context Leak:** If a single LLM prompt contains Character A (who knows a secret) and Character B (who does not), Character B's attention heads can attend to Character A's private context, leaking the secret.


2. **The Dual-Call Latency Penalty:** Generating dialogue line-by-line with isolated context windows guarantees zero leakage, but triples inference costs and degrades conversational cadence.



The resolution is **Tiered Epistemic Fencing**:

* *Ordinary Encounters:* Single generation call with role-scoped context blocks, protected by an automated post-generation **Leak Sentry** scanning dialogue for unauthorized lemmas.


* *High-Stakes Dramatic Secrets:* Sequential, isolated turn generation where the uninitiated character's context window contains zero tokens referencing the secret.



#### The Three-Layer Action Validation Stack

Models can self-report compliance in an action enum while violating it in prose. Validation is decoupled into three independent checks:

```text
[ Emitted Dialogue AST ] 
       │
       ├─► 1. GBNF Grammar: Enforces emitted tokens belong to character's capability set
       │
       ├─► 2. Dependency Scan: Negation-aware parser flags banned action lemmas in prose
       │
       └─► 3. Semantic Parser (Temp 0): Extracts physical actions independently

```

* **Negation-Aware Parsing:** A naive keyword scan for "grip" will falsely reject the line: *"He could not grip the rope with his dead arm."* The dependency parser inspects modal verbs and negation modifiers, allowing valid depictions of somatic limitations.


* **Discrepancy Policy:** If the model-declared enum and the independent extraction pass disagree, a blocking pipeline error fires *only* if the action demands a restricted physical capability (such as a paralyzed limb or full hands). Discrepancies over unconstrained ambient actions (e.g., `["GLANCE"]` vs `["STARE"]`) pass as stylistic variance.



---

### 5. The Compiler Pipeline & Intermediate Representations (IR)

To prevent the language model from quietly redefining world state, the compiler establishes a formal **Scene Plan / IR** prior to dialogue generation.

```text
CANON & LEDGER STATE
        │
        ▼
SIMULATION ENGINE (Duel Math & Lotteries)
        │
        ▼
SCENE PLAN / IR (Mechanical Meaning: Participants, Spatially Legal Actions, Exit State)
        │
        ▼
LANGUAGE MODEL (Constrained Realization Engine)
        │
        ▼
DIALOGUE AST (Conversational Expression & Beats)
        │
        ▼
TEMPORAL COMPILER (Audio Synthesis & Duration Quantization)
        │
        ▼
EXPOSURE SHEET (Presentation Timing & Camera Cues)
        │
        ▼
SOURCE-BAKED TSX (Executable Remotion Composition)
        │
        ▼
HEADLESS COMPOSITOR (Deterministic Rasterization)

```

#### The Spatiotemporal Hierarchy

The architecture splits meaning from presentation across a six-tier hierarchy:

| Level | Unit Name | Governing Plane | Primary Clock | Allowed State Mutations |
| --- | --- | --- | --- | --- |
| **L1** | **Simulation Cycle** | World Simulation | Discrete World Tick | Hex movement, passive condition decay, hunger/supplies

 |
| **L2** | **Episode** | Broadcast Container | Pacing / Schedule | Public status changes, grievance cooldown decrements

 |
| **L3** | **Scene** | Encounter Space | Spatial Adjacency | Duel resolution, trauma injection, secret revelations

 |
| **L4** | **Beat** | Narrative AST | Swain MRU Order | Somatic fatigue increment, refusal strain, local tension

 |
| **L5** | **Shot** | Exposure Sheet | Master Video (24 fps) | Audio stem trigger, camera push-in, viseme cueing

 |
| **L6** | **Frame** | Optical Compositor | 1/24 s Rasterization | Pixel transforms, chroma despill, motion interpolation

 |

* **Beats Belong to Narrative:** A beat is a semantic unit of dramatic change (e.g., an accusation, an evasion, a concession).


* **Shots Belong to Presentation:** A shot is an optical unit (a camera setup, a continuous plate, an audio stem).


* One beat can cut across three visual shots (speaker $\to$ listener reaction $\to$ insert shot of a weapon). Conversely, one long tracking shot can contain multiple beats. Conflating beats and shots breaks the separation of meaning and representation.



#### The Scene Plan Schema

The Scene Plan represents the mechanical meaning of the encounter before prose is written:

```typescript
export interface ScenePlan {
  episode_id: string;
  scene_id: string;
  cycle_index: number;
  participants: string[];
  location_id: string;
  grievance_id: string;
  
  // Epistemic Fencing
  known_facts: Record<string, string[]>;
  forbidden_facts: Record<string, string[]>;
  
  // Somatic Capabilities
  capabilities_available: Record<string, CapabilityProfile>;
  
  // Mandatory Trajectory
  mandated_terminal_event: {
    winner_id: string;
    loser_id: string;
    concession_action: string;
    state_mutations: StateMutation[];
  };
  
  required_props: string[];
  seed: number;
}

```

#### Swain’s Motivation-Reaction Units (MRUs) as Timeline Geometry

Dwight Swain’s structural fiction pattern—**Stimulus $\to$ Reflex $\to$ Calculation $\to$ Action/Speech**—is mapped directly into camera choreography and exposure sheets:

* LLMs naturally invert causality (e.g., *"He spoke as the door slammed"*). The compiler enforces chronological ordering in the AST.
* In animation, internal processing cannot rely on text. A `VISCERAL_STING` in the AST allocates a **12-to-24 frame reaction pre-roll** (pupil dilation, eye saccade, camera push-in) *before* the dialogue audio stem begins, grounding animation in psychological causality.



---

### 6. Temporal Compilation & The Multi-Resolution Audio Clock

Video models do not understand biological cadence or acoustic rhythm. Audio is the non-negotiable master clock.

```text
AUDIO TIMEBASE DOMAIN: 48,000 integer samples/second (Sample-Accurate Truth)
  │
  ├─ Measured Waveform Duration: e.g., 3,120 ms (149,760 samples)
  ├─ Phoneme / Viseme Onsets (e.g., Sample Offset: 26,742)
  └─ Sidechain Ducking Envelope (-14 dB Speech Window)
  │
  ▼ Projection: Sample Index S = Frame * (48000 / 24) = Frame * 2000
MASTER VIDEO CLOCK: 24 integer frames/second (Discrete Cut Boundaries)
  │
  ├─ Calculated Target Frames: ceil(3.120 * 24) = 75 frames
  └─ Absolute Timeline Anchor: fromFrame_k = Σ duration_i

```

#### Audio as Observation, Frame Count as Derivation

1. Dialogue text is synthesized into uncompressed speech `.wav` stems.


2. `ffprobe` inspects the buffer to measure raw millisecond duration ($D_{\text{ms}}$).


3. Discrete delivery frames are derived explicitly:

$$\text{target\_frames} = \left\lceil \left(\frac{D_{\text{ms}}}{1000}\right) \times 24 \right\rceil$$



4. The derived frame budget and the measured millisecond duration are recorded as separate fields. The audio stem is immutable; it is never re-synthesized at render time.



#### Absolute Timeline Anchoring

Audio stems and shots are anchored to absolute integer frame coordinates:

$$\text{fromFrame}_k = \sum_{i=1}^{k-1} \text{shot\_duration}_i$$

This eliminates sub-frame floating-point rounding errors from accumulating across hundreds of shots.

#### Backend Temporal Adapters

Model-specific temporal constraints are isolated inside backend adapters rather than contaminating the universal timeline:

* **The Wan $4n+1$ Latent Lattice:** Wan video diffusion requires frame counts conforming to $4n+1$ at its native rate (e.g., 16 fps) due to 3D causal VAE downsampling.


* **The Adapter Conversion:** For a 3,120 ms audio stem, the adapter calculates native frames ($N = \lceil 3.120 \times 16 \rceil = 50$), rounds up to the nearest valid VAE boundary ($4(13) + 1 = 53\text{ frames}$), renders the 53-frame plate, trims the excess 3 frames from the tail, and retimes to fit the locked **75-frame delivery budget** at 24 fps.


* Master timeline logic remains clean; model quirks stay inside the adapter.



---

### 7. Presentation Compilation: Source-Baking & The Sealed-File Lifecycle

To eliminate the **historical corruption trap**—where modifying shared React components causes past episodes to suffer visual regressions—the system uses **source-baking**. The viewport is not a long-lived app parsing dynamic JSON sidecars; it is a code-generation compiler (`generator/generate-episode-repo.ts`) that bakes self-contained, versioned TypeScript source code inside `goblin-episodes/`.

```typescript
// goblin-episodes/ep040/Episode_040.tsx
// @lifecycle: generated
// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde...

export const Episode_040: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={0} durationInFrames={75}>
        <Shot01CameraWrapper originX="48.2%" originY="21.4%">
          <GoblinPuppet
            character="BOG"
            emotion="humiliated"
            anchorPoint={{ x: 512, y: 980 }}
          />
          <Audio
            src={staticFile("audio/dialogue/ep040_sh01.wav")}
            volume={1.0}
          />
        </Shot01CameraWrapper>
      </Sequence>
    </AbsoluteFill>
  );
};

```

#### Source-Baking Invariants

* **Numeric Literal Inlining:** Frame durations, volume curves, and anchor coordinates are printed as raw numbers (`durationInFrames={75}`), never as parsed runtime strings.


* **Sequence-Relative Scoping:** Sub-components scope `useCurrentFrame()` locally from frame 0 within each `<Sequence>`, preventing timeline coupling across scene transitions.


* **Component Boundary Isolation:** Presentation components (`GoblinPuppet.tsx`, `AmbientTrack.tsx`) are either vendored locally inside `ep040/components/` or pinned to an immutable package release (`@studio/viewport@1.4.2`).



#### The Cryptographic Sealed-File Lifecycle

Human artistic intervention is treated as an auditable state transition, not an exceptional defect:

```text
       [ generator/generate-episode-repo.ts ]
                         │
                         ▼
             // @lifecycle: generated
             // @checksum: SHA-256(Body)
                         │
      ┌──────────────────┴──────────────────┐
      │                                     │
      ▼ (Automated QA Agent)                ▼ (Human Director)
// @lifecycle: patched                // @lifecycle: locked
Emits AST property diff               Emits DIRECTOR_OVERRIDE event
CI verifies diff scope                Generator refuses to overwrite

```

1. **`@lifecycle: generated`:** Stamped by the compiler with a SHA-256 body checksum in the header. CI merges clean builds automatically.


2. **`@lifecycle: patched`:** Modified by automated repair agents (e.g., Jules CV alignment). Permissible only if an AST diff confirms modifications are restricted to targeted JSX properties.


3. **`@lifecycle: locked`:** Manually adjusted by a human director. If the compiler re-runs upstream, it detects the header, halts, and emits `Episode_040.candidate.tsx`, refusing to clobber human work.


4. **Overrides as Events:** Manual director tweaks emit an explicit `DIRECTOR_OVERRIDE` event into the historical log, preserving provenance.



#### Canon Errata and Re-Anchoring

When fundamental canon errors are discovered, historical episodes are not silently rewritten:

* Canon updates append to an errata log (`canon_errata_v1.2.json`), bumping `canon_version`.


* Past episodes remain pinned to their creation version (e.g., `v1.1.0`).


* Remastering an old episode creates a distinct artifact (`EP012_remaster_v2.mp4`), preserving the broadcast original alongside the revision.



---

### 8. Build Verification, Progressive QA, and Provenance DAGs

Testing economics dictate: **Fail as close as possible to the cheapest point of detection**.

```text
[ CONFIDENCE 0: Structural ] ──► JSON Schema valid, files present, non-empty hash check
              │ Pass
              ▼
[ CONFIDENCE 1: Physical ]   ──► ffprobe frame budgets match, audio noise floor < -60 dBFS
              │ Pass
              ▼
[ CONFIDENCE 2: Geometric ]  ──► Viseme drift < 4px, contact anchor touches matte floor
              │ Pass
              ▼
[ CONFIDENCE 3: Semantic ]   ──► Capability-resource bounds pass, epistemic firewall intact
              │ Pass
              ▼
[ CONFIDENCE 4: Editorial ]  ──► Signed human director approval via GitHub Review API

```

#### The Five Levels of Reproducibility

Reproducibility is an empirical spectrum verified across clean environments:

* **Level 1 (Intent):** Identical scene plan, constraints, and random seed lineage.


* **Level 2 (AST):** Identical machine contracts and dialogue tokens.


* **Level 3 (Timing):** Identical frame budgets and audio sample alignments.


* **Level 4 (Decoded Media):** Raw decoded pixel matrices and PCM audio streams pass visual and acoustic conformance ($\Delta E < 0.1$, $\text{SSIM} > 0.9999$).


* **Level 5 (Container Bytes):** Master container bitstreams match identically ($\text{SHA-256}_A == \text{SHA-256}_B$). Level 5 is an environment-specific target; Level 4 proves media equivalence.



#### The Three Preservation Tiers

The final delivery MP4 is a lossy distribution derivative. The studio maintains three distinct preservation levels:

```text
┌────────────────────────────────────────────────────────┐
│ 1. SOURCE & IR ARCHIVE                                 │
│    • dialogue_ast.json, event log, manifests, TSX      │
├────────────────────────────────────────────────────────┤
│ 2. HIGH-FIDELITY MEZZANINE MASTER                      │
│    • Apple ProRes 4444 (with 8-bit/16-bit Alpha)       │
│    • Discrete 24-bit 48 kHz Dialogue, Music, Foley M&E │
├────────────────────────────────────────────────────────┤
│ 3. DELIVERY DERIVATIVES (Distribution Profiles)        │
│    • Web Stream: -16 LUFS (±1.0), H.264 / AAC          │
│    • Broadcast US (ATSC A/85): -24 LUFS, True-Peak -2dB│
│    • Broadcast Europe (EBU R128): -23 LUFS             │
└────────────────────────────────────────────────────────┘

```

Preserving discrete M&E audio stems enables alternate language dubs, accessibility mixes, and future loudness re-mastering without touching picture.

#### The Universal Provenance Graph (`render_manifest.json`)

Every artifact acts as a node in a Directed Acyclic Graph:

```json
{
  "build_id": "sha256:4f8a1209bc...",
  "episode_id": "EP040",
  "schema_version": "3.2.0",
  "parents": {
    "scene_plan_hash": "sha256:8b4e2...",
    "dialogue_ast_hash": "sha256:12c8a...",
    "exposure_sheet_hash": "sha256:9c3e4...",
    "source_file_hash": "sha256:7bd4e...",
    "canon_commit": "git:9c3e401",
    "assets_visual_tag": "git:v1.4.0",
    "viewport_template_commit": "git:4f8a120"
  },
  "runtime_environment": {
    "container_digest": "ghcr.io/studio/render-node@sha256:7b4a...",
    "node_version": "v20.12.0",
    "remotion_version": "4.0.140",
    "chromium_milestone": "122.0.6261.94",
    "ffmpeg_build": "6.1.1-static",
    "font_manifest": {
      "Cinzel-Bold.ttf": "sha256:5a6b7c..."
    }
  }
}

```

This bidirectional graph answers two foundational queries:

1. **Backward (Audit):** *Why does this frame exist?* $\to$ Shot $\to$ Exposure Sheet $\to$ Audio Stem $\to$ AST Beat $\to$ Scene Plan $\to$ State Transition $\to$ Canon Constraint.


2. **Forward (Blast Radius):** *If Fact #42 changes, what breaks?* $\to$ Topological dependency sweep identifies every invalidated downstream scene.



#### Failure Classification

Failures are sorted into three distinct response paths:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. DETERMINISTIC FAILURE (Schema error, invalid coordinate, banned verb)│
│    • Action: HALT. Do not retry. Fix upstream code or canon constraint. │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. STOCHASTIC QUALITY FAILURE (Flat dialogue, unearned subtext release) │
│    • Action: Bounded auto-retry (max 2) with negative directive.        │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. INFRASTRUCTURE FAILURE (Process timeout, GPU OOM, connection drop)   │
│    • Action: Atomic resume from last valid content-addressed artifact.  │
└─────────────────────────────────────────────────────────────────────────┘

```

---

### 9. The Upstream Taste Engine: Grievance Corpus & Pressure Engine

A database maintains consistency, but consistency alone is not entertainment. LLMs regress toward bland, generic compromise unless constrained by human-authored friction.

#### The Grievance Corpus

The fuel of the narrative engine is an authored library of **40 to 60 structural grievances**. Each grievance decouples external dialogue from internal subtext:

* **The Surface Complaint:** What characters bicker about (e.g., *"Who stole the silver siphon wrench"*).
* **The Underneath:** The real emotional friction (e.g., *"Bog feels uncredited for camp survival and fears abandonment"*).
* **Anchored Physical Props:** Conflicts link to tangible objects (the wrench, a torn seal) to maintain cross-episode continuity.



```text
┌────────────────────────────────────────────────────────┐
│ GRIEVANCE DEFINITION (Immutable Canon in Git)          │
│ • Surface: Stolen Silver Siphon Wrench                 │
│ • Underneath: Bog feels disposable; Spleen refuses debt│
│ • Prop: prop_brass_siphon_01                           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ RUNTIME GRIEVANCE STATE (Mutable Ledger in SQLite)     │
│ • status: ACTIVE | cooldown_cycles: 2 | stage: 2       │
│ • last_confrontation_episode: "EP038"                  │
└────────────────────────────────────────────────────────┘

```

Authored grievance definitions live as immutable versioned files in Git; runtime status (cooldowns, escalation stages) lives in the SQLite ledger.

#### The Unified Pressure Meter Engine

Binary rules (can/cannot) create static characters. The engine unifies somatic fatigue, refusal strain, and paranoia into a single **Pressure Meter** architecture:

$$\text{Meter}_{t+1} = \max(0, \text{Meter}_t - \text{DecayRate}) + \sum \text{FrictionEvents}$$

```text
[ Refusal Vector: "Bog will not ask for help" ]
                      │
                      ▼
[ High-Friction Action: Bog drags sled with injured arm ]
                      │
                      ▼
[ Somatic Pain Meter: +3 ] ──► [ Injects "winded/clutching arm" into next shot ]
                      │
                      ▼
[ Refusal Strain Meter: +2 ] ──► Exceeds Threshold (Capacity = 5)
                      │
                      ▼
[ POST-BREAK STATE CLIMAX ] ──► Bog demands assistance; Refusal broken

```

1. **Decoupled Meters:** Fatigue and refusal strain share logic (values, decay rates, threshold triggers), but remain separate meters unless explicitly linked by canon rules.


2. **Post-Break States:** When a character's refusal meter breaches its capacity ceiling, the refusal breaks. This is logged as a permanent state transition, updating character capabilities and driving long-term dramatic development.



---

### 10. Operational Reality: Gated Execution & The 3-Second Tracer Bullet

Theoretical system design has reached diminishing returns. The architecture is ready for physical validation.

#### The 10-Phase Gated Matrix

Progress is bound to binary, falsifiable exit gates:

| Phase | Subsystem | Concrete Deliverable | Non-Negotiable Exit Gate |
| --- | --- | --- | --- |
| **1** | **World Model** | Schemas + SQLite Ledger | Valid world loads; deliberate schema violation throws fatal exit 1.

 |
| **2** | **Spatial Engine** | Stateless Hex Math Library | Distance/pathing tests pass; renders debug SVG of active positions.

 |
| **3** | **Simulation** | Headless Sower Simulator | 1,000-cycle batch completes; normalized entropy $H_{\text{norm}} \ge 0.65$; zero crashes.

 |
| **4** | **Grievance Corpus** | $\sim 10$ Authored Grievance Files | Hand-feeding 1 grievance into an LLM produces a viable 4-beat scene.

 |
| **5** | **Scene Spec** | Compiler IR (`dialogue_ast.json`) | Machine contract emitted automatically from simulation state.

 |
| **6** | **Expression** | Local LLM Generator + Linters | Injected somatic contradiction and epistemic leak are both blocked.

 |
| **7** | **Editorial Gate** | CLI / PR Review Interface | Director reviews and accepts/rejects a scene in $\le 60$ seconds.

 |
| **8** | **Acoustic Clock** | Local TTS + `ffprobe` Quantizer | Synthesis finishes; measured duration yields identical frame budget on retry.

 |
| **9** | **Render Plane** | `goblin-viewport-template` (Remotion) | Compiles and renders one 3-second cut to MP4 with verified lip-sync.

 |
| **10** | **Archive & QA** | Storage Staging + Provenance Lockfile | **Pass:** Decoded frame hashes and audio PCM match exactly.<br>

<br>**Stretch:** Final MP4 container bytes match.

 |

#### The One-Screen Review Interface

To maintain editorial control without parsing raw AST JSON, the director reviews an operational brief:

```text
================================================================================
SCENE: ep040_sc03 (Swamp Relay / Day)
CAST: BOG vs SPLEEN
GRIEVANCE: The Good Silver Spoon (Resource Hoarding, Stage 2)
SUBTEXT: Bog feels uncredited; Spleen refuses to acknowledge dependence.
MECHANICAL OUTCOME: Costly Win for Spleen (Margin: +2, 1 String Spent)
EXIT STATE: Bog gains [humiliated]; Spleen gains [exhausted]; Wart gains 1 String.

BEAT PREVIEW:
  1. [SPLEEN] Accuses Bog of misplacing brass fittings near the sump.
  2. [BOG] Deflects, bringing up who hauled rations through the dry cycle.
  3. [SPLEEN] Displays the silver spoon; claims Bog would have lost it in mud.
  4. [BOG] Surrenders the siphon wrench; retreats to hut [MANDATED EXIT BEAT].

[ 1: APPROVE ]   [ 2: REJECT & LOG REASON ]   [ 3: EDIT CONSTRAINTS ]
================================================================================

```

When rejecting a scene, the director logs a structured error tag (`FLAT_DIALOGUE`, `UNEARNED_RELEASE`, `SOMATIC_DRIFT`, `VOICE_BLEED`, `PACING_STALL`) into `eval/rejections.jsonl`, establishing a calibrated regression corpus to tune system prompts and linters.

#### The Gate 2 Tracer Bullet

The immediate operational milestone is executing the **Gate 2 Tracer Bullet**:

```text
[ 1. Seed & Ledger State ]
            │
            ▼
[ 2. Dialogue AST Line (3.12s) ]
            │
            ▼
[ 3. Local TTS Synthesis (.wav) ] ──► ffprobe: 3120ms → Locked to 75 Frames at 24fps
            │
            ▼
[ 4. Metaprogram Stamping ]      ──► generate-episode-repo.ts → Episode_001.tsx
            │
            ▼
[ 5. Headless Remotion Render ]   ──► Rig 1 (gl: swangle, concurrency: 1)
            │
            ▼
[ 6. Artifact Verification ]     ──► Master MP4 + render_manifest.json

```

```bash
# Minimal Tracer Bullet Acceptance Checklist
[ ] 1. Sower resolves 1 authored grievance with 2 actors from fixed seed.
[ ] 2. Scene Plan compiles into a 1-line Dialogue AST.
[ ] 3. Speech .wav synthesizes locally; ffprobe records duration_ms.
[ ] 4. Target frames calculate once at 24 fps (3,120 ms -> 75 frames).
[ ] 5. goblin-viewport-template stamps Episode_001.tsx with numeric literals.
[ ] 6. Headless Remotion renders master MP4 via software rasterization.
[ ] 7. Render manifest records dependency commit SHAs and container digests.
[ ] 8. Re-render assertion: Decoded frame buffers and PCM audio match.

```

Executing this single 3-second render tests every software boundary, path assumption, audio-video bridge, and container dependency against physical reality, moving the architecture from design into a running, deterministic media compiler.

The rejection reason and the rejected scene are written to `eval/rejections.jsonl`, establishing an empirical evaluation corpus to calibrate system prompts and linter rules.

---

### 6. The Phase Matrix & Tracer Bullet Execution

The Phase Matrix defines concrete, falsifiable exit gates. Double-render verification decouples media equivalence from packaging bytes:

| Phase | Deliverable | Concrete Binary Exit Gate |
| --- | --- | --- |
| **1** | **World Model** | Schemas + SQLite Ledger |
| **2** | **Spatial Engine** | Stateless Hex Math Library |
| **3** | **Simulation** | Headless Sower Simulator |
| **4** | **Grievance Corpus** | $\sim 10$ Authored Grievance Files |
| **5** | **Scene Spec** | Compiler IR (`dialogue_ast.json`) |
| **6** | **Expression** | Local LLM Generator + Linters |
| **7** | **Editorial Gate** | CLI / PR Review Interface |
| **8** | **Acoustic Clock** | Local TTS + `ffprobe` Quantizer |
| **9** | **Render Plane** | `goblin-viewport-template` (Remotion) |
| **10** | **Archive & QA** | Storage Staging + Provenance Lockfile |

```bash
# Minimal 3-Second Tracer Bullet Checklist
[ ] 1. Enumerate opposed 2d6 combinations via script; verify margin distribution.
[ ] 2. Pass one authored grievance and locked ledger state into the Sower.
[ ] 3. Generate a 4-beat dialogue AST with typed action enums.
[ ] 4. Synthesize 1 line of speech WAV locally; ffprobe measures duration_ms.
[ ] 5. Calculate integer delivery frames at 24 fps once; pin to absolute timeline.
[ ] 6. Stamp Episode_001.tsx via goblin-viewport-template with literal JSX props.
[ ] 7. Remotion renders master MP4 via software rasterization (--gl=swangle).
[ ] 8. Render a second time: assert decoded frame buffers and PCM audio are identical.

```

Executing this minimal slice tests every software seam, path assumption, audio-video bridge, and container dependency against physical reality, moving the project from paper design to an operational media compiler.

Yes. I read the entire pasted document and separated what I think is genuinely valuable from the large amount of implementation detail, repetition, and architecture that is still hypothetical.

The most important conclusion is that the document is really describing **a deterministic media compiler**, not merely a video renderer.

The core idea is:

> **Narrative state becomes a validated semantic program; that program becomes a locked temporal plan; that plan becomes baked rendering code; the resulting episode becomes a versioned historical artifact.**

That is the architectural idea worth preserving.

The document repeatedly makes this separation explicit: the Sower owns *meaning* while the viewport owns *representation*. 

## The distilled architecture

I would reduce the whole system to six layers:

```text
IMMUTABLE CANON
      +
MUTABLE WORLD STATE
      │
      ▼
NARRATIVE SIMULATION
      │
      │  validated dialogue AST
      ▼
TEMPORAL / AUDIO COMPILATION
      │
      │  locked frame plan
      ▼
VISUAL COMPILATION
      │
      │  assets + coordinates + camera instructions
      ▼
EPISODE SOURCE-BAKING
      │
      │  immutable TSX + manifests
      ▼
DETERMINISTIC RENDER + QA
      │
      ▼
ARCHIVED MASTER
```

That is much more important than the individual technologies.

Remotion, FFmpeg, ComfyUI, Cloudflare, GitHub, Jules, R2, etc. are replaceable implementation mechanisms. The **contracts between stages** are the real architecture.

---

# 1. The single most important principle: meaning must be separated from representation

This is by far the strongest idea in the document.

`worker-sower-engine` should not know what a character looks like.

It should know:

> Bog is humiliated.

It should not know:

> Therefore load `bog_humiliated_take03.png`, move the sprite 18 pixels left, zoom toward `(412,198)`, and display the `wide` mouth.

That second layer belongs downstream.

The document calls this the distinction between **meaning and representation**. 

This boundary is enormously valuable because it means you can change the visual technology without rewriting the narrative engine.

For example:

```text
                    SAME NARRATIVE EVENT

                 "Bog becomes humiliated"
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
       2D sprites     diffusion plate    future renderer
          │               │                │
          ▼               ▼                ▼
      representation  representation   representation
```

The narrative event remains identical.

This creates a very powerful property:

### The story becomes renderer-independent.

You could someday replace:

* Remotion with another compositor
* 2D puppets with 3D characters
* Wan with another video model
* local TTS with another speech system
* Cloudflare with another orchestration layer

without changing the underlying narrative state model.

That is the part I would protect aggressively.

---

# 2. The second major idea: canon and state are fundamentally different things

Another very good distinction is between **immutable canon** and **mutable relational state**.

The document has the Sower reading static canon such as characters, grievances and locations while maintaining changing information such as position, trauma, resentment, paranoia and interpersonal leverage in a separate ledger. 

That is conceptually much cleaner than putting everything into one giant database.

Think of it like this:

```text
CANON
"What is true about the world?"

        +
        
STATE
"What is true about the world right now?"

        =
        
EPISODE CONTEXT
"What can happen now?"
```

This distinction gives you a natural versioning model.

A character's canonical physiology shouldn't silently change because an episode happened.

But the character becoming injured **should** change.

Likewise:

```text
Canon:
Bog has an old shoulder injury.

State:
Bog's shoulder is currently aggravated.

Episode:
Bog attempts to use the injured shoulder.

Rule:
The action is constrained.
```

That is much more powerful than simply asking an LLM to "remember" the character's condition.

---

# 3. The Sower should be treated as a state-transition machine

This is the next major conceptual improvement.

The Sower isn't primarily a writer.

It is closer to a **simulation engine that happens to emit prose**.

The sequence in the document is roughly:

```text
world state
    ↓
eligible actors
    ↓
conflict selection
    ↓
grievance selection
    ↓
mechanical resolution
    ↓
ledger mutation
    ↓
semantic drafting
    ↓
validated dialogue AST
```

The mechanical result is determined before the prose is generated. 

That is a very important design decision.

It prevents the language model from becoming the ultimate authority over reality.

Instead:

```text
SIMULATION
      ↓
"This character lost."
      ↓
LANGUAGE MODEL
      ↓
"How does the loss manifest dramatically?"
```

rather than:

```text
LANGUAGE MODEL
      ↓
"I think this character probably wins."
```

That distinction enormously reduces continuity drift.

---

# 4. The most valuable use of the LLM is *after* the world has been constrained

The document's Stage 5 is especially interesting.

The LLM receives:

* established character state
* epistemic limitations
* emotional state
* mechanical outcome
* constraints
* motor restrictions
* narrative context

and produces:

1. human-readable screenplay prose
2. structured machine-readable AST

The invariant checker then tests whether the prose contradicts the structured state. 

That is much better than attempting to solve consistency entirely through prompting.

The deeper principle is:

> **Use language models for high-dimensional expression, but use deterministic software for facts that must not change.**

This principle extends far beyond this particular project.

For example:

```text
LLM:
dialogue
subtext
phrasing
metaphors
reaction wording
dramatic texture

CODE:
injury
location
inventory
secrets
relationships
winner
loser
timeline
asset identity
frame count
```

That division of labor is one of the strongest aspects of the architecture.

---

# 5. The AST is more important than the screenplay

This may be easy to overlook.

The `.fountain` screenplay is the human-facing artifact.

But the **dialogue AST is the true machine contract**.

That means the pipeline does not need to understand arbitrary prose later.

It receives something closer to:

```json
{
  "speaker": "BOG",
  "emotion": "humiliated",
  "text": "...",
  "actions": [...],
  "subtext": "...",
  "constraints": [...]
}
```

That is what should drive everything downstream.

I would go further than the document does:

### Make the AST the canonical episode specification.

Everything downstream should derive from it.

For example:

```text
dialogue_ast
    ├── audio generation
    ├── frame timing
    ├── viseme generation
    ├── character selection
    ├── camera suggestions
    ├── asset collection
    ├── QA expectations
    └── provenance
```

Then the screenplay becomes a **human-readable projection of the AST**, rather than the other way around.

That greatly reduces ambiguity.

---

# 6. Audio really is the right place to establish the temporal clock—but with one important correction

The document makes audio the "non-negotiable master clock." It measures the synthesized WAV with `ffprobe`, converts the duration into integer video frames, and then builds the exposure sheet. 

That overall approach is sound.

`ffprobe` is specifically designed to inspect multimedia streams and expose machine-readable information about them. ([FFmpeg][1])

At 24 fps:

$$
1\text{ frame}=\frac1{24}\text{ second}=41.6667\text{ ms}
$$

So the basic quantization:

$$
F=\lceil D\times24\rceil
$$

is perfectly reasonable.

But I would change one phrase in the original architecture:

### It is frame-accurate, not sample-accurate.

If audio begins at frame 72, it begins at:

$$
72/24=3.0s
$$

That is an exact **video-frame boundary**, not an exact audio-sample boundary.

The distinction becomes important if you eventually need:

* word-level lip sync
* phoneme synchronization
* musical beat alignment
* sound-design synchronization
* sub-frame editorial timing

For ordinary dialogue compositing, frame-level anchoring is probably sufficient.

For extremely precise synchronization, preserve the original audio sample timestamps as an additional layer.

So I would define two clocks:

```text
MASTER MEDIA CLOCK
    └── integer video frames

AUDIO PRECISION CLOCK
    └── audio sample / timestamp domain
```

The frame clock controls the picture.

The sample/timestamp clock preserves acoustic truth.

---

# 7. Absolute frame anchoring is more important than the specific 24 fps number

The document makes a particularly good observation about concatenation.

If you repeatedly round individual shot durations upward, each shot can acquire up to approximately one frame of padding.

At 24 fps that's about 41.7 ms.

Individually that's insignificant.

Across hundreds of shots, however, sequentially concatenating those rounded durations can cause systematic drift.

The solution in the document—assigning every shot an absolute start frame—is exactly the right conceptual solution. 

The rule is effectively:

$$
start_k=\sum_{i<k}duration_i
$$

This is much safer than:

```text
shot 1 ends
     ↓
append shot 2
     ↓
append shot 3
     ↓
append shot 4
```

because absolute coordinates eliminate accumulated uncertainty.

This is another recurring principle of the entire system:

> **Do not accumulate uncertainty when you can precompute an absolute coordinate.**

The same idea appears in:

* frame numbers
* sprite coordinates
* camera targets
* asset hashes
* Git SHAs
* episode IDs
* database transitions

That's actually one of the hidden unifying ideas of the entire architecture.

---

# 8. The 4n+1 diffusion rule is real—but it belongs to the model contract, not the universal architecture

This particular part of the document is technically grounded.

Wan's official implementation specifies that generated frame counts should be `4n+1`; the same constraint appears in both Wan 2.1 and Wan 2.2 code. ([GitHub][2])

So the document is correct to treat the constraint as a requirement when using those Wan pipelines.

But there is an architectural refinement I'd make:

Don't make the architecture say:

> Video generation requires 4n+1.

Make it say:

> **Each visual-generation backend declares its own temporal lattice, and the conductor converts the master timeline into that backend's legal frame domain.**

Then:

```text
Master timeline
       │
       ▼
Backend adapter
       │
       ├── Wan → 4n+1
       ├── Model B → constraint X
       ├── Model C → arbitrary
       └── future model → constraint Y
```

This keeps Wan's implementation detail from leaking into the core system.

---

# 9. The most important architectural decision in the viewport is not Remotion—it is source baking

The transition from a long-lived JSON-driven renderer to per-episode generated source code is probably the most consequential engineering choice in the entire document.

The document's stated problem is:

```text
Episode 12
    ↓
shared renderer v1

six months pass

shared renderer v7
    ↓
Episode 12 rendered again
    ↓
different result
```

That is the "historical corruption trap."

The proposed solution:

```text
Episode 12
    ↓
compile
    ↓
Episode_012.tsx
    ↓
freeze
```

means that the episode becomes a **historical software artifact**, not merely a set of inputs.

The source-baking idea and its motivation are clearly laid out in the document.  

I think this is exactly the right abstraction.

Remotion itself is expressly designed around programmatic video and code as a source of truth, so it fits naturally underneath this strategy. ([Remotion][3])

---

# 10. But "Git SHA = reproducibility" is not enough

This is where I would substantially strengthen the original design.

A Git commit identifies source code.

It does **not necessarily identify the complete execution environment**.

The later portions of your document actually move toward the correct solution by recording things such as:

* container digest
* Node version
* Remotion version
* Chromium version
* FFmpeg build
* font checksums
* asset checksums

That is much stronger than simply recording repository commits.

The real reproducibility tuple should be closer to:

```text
CANON HASH
+
WORLD STATE SNAPSHOT
+
AST HASH
+
AUDIO HASHES
+
VISUAL ASSET HASHES
+
GENERATOR SOURCE HASH
+
DEPENDENCY LOCKFILE
+
CONTAINER DIGEST
+
OS / RUNTIME VERSION
+
CHROMIUM VERSION
+
FFMPEG VERSION
+
FONT HASHES
+
MODEL CHECKPOINT HASHES
+
MODEL CONFIG
+
RANDOM SEEDS
+
RENDER PARAMETERS
```

Then:

$$
EpisodeID=
H(\text{all immutable inputs and environment})
$$

That gives you something much stronger than "we remember which Git commits were used."

It gives you an **episode build identity**.

---

# 11. "Bit-identical reproduction" should be considered a hypothesis until experimentally demonstrated

This is one of the places where the document speaks more confidently than I would.

Freezing source code and dependencies is necessary.

It is not automatically sufficient.

You should actually perform:

```text
RENDER A
SHA256 → X

RENDER B
SHA256 → Y

assert(X == Y)
```

under the supposedly identical environment.

Do this repeatedly.

And test it after:

* reboot
* container recreation
* machine migration
* archive restoration
* dependency restoration

If the hashes remain identical, you have empirical evidence.

Until then I would call the property:

> **reproducibility-oriented and environment-locked**

rather than:

> **guaranteed bit-identical rendering**

This distinction matters because the entire system is built around determinism.

You don't want "deterministic" to become an assumption simply because every file has a checksum.

---

# 12. The manifest contract is an excellent idea

The visual `manifest.json` is another piece I would retain.

Instead of:

```text
find Bog's image
```

the renderer receives:

```text
character = bog
ground_anchor = (...)
face_target = (...)
mouth_box = (...)
animation_parameters = (...)
```

That turns visual assets into a typed interface.

This is analogous to an API.

The visual asset repository becomes:

> **a database of physical invariants.**

The document specifically identifies ground anchors, facial targets, mouth boxes, and animation parameters as contractual data. 

That's very useful because image files themselves do not contain enough semantic information to reliably drive a compositor.

---

# 13. Explicit `null` is much better than silent missing data

This is subtle and very good.

Suppose:

```json
"terrified": null
```

That is much better than:

```json
{}
```

because the former says:

> We know the asset does not exist.

The latter says:

> We don't know what's going on.

Those are fundamentally different states.

The document then establishes:

```text
draft:
null → idle fallback

final:
null → release failure
```

That is exactly how a robust production system should behave. 

It gives you graceful failure in experimentation and strict failure at release.

I would generalize this pattern throughout the system:

```text
UNKNOWN
MISSING
INTENTIONALLY ABSENT
UNRESOLVED
OVERRIDDEN
VALID
INVALID
```

Don't collapse them into a single "missing" state.

---

# 14. The asset system should validate semantics, not merely file existence

The document already moves in this direction with coordinate bounds, alpha checks, viseme geometry, and rejection taxonomies. 

That is important.

A build can succeed while still being visually wrong.

For example:

```text
bog_humiliated.png exists
SHA-256 matches
PNG parses correctly
```

but:

```text
his feet float 30 pixels above the floor
```

That's a valid file but an invalid asset.

So QA needs at least three levels:

```text
FILE VALIDITY
    ↓
GEOMETRIC VALIDITY
    ↓
SEMANTIC VALIDITY
```

For example:

**File validity**

* exists
* nonzero
* hash matches
* decodes

**Geometric validity**

* coordinates in bounds
* alpha present
* mouth box plausible
* feet touch the expected plane

**Semantic validity**

* character identity correct
* condition corresponds to canonical state
* forbidden body movements aren't implied
* visual state agrees with narrative state

The third level is where this becomes genuinely interesting.

---

# 15. The visual generator should never infer character facts

The visual layer should receive:

```text
emotion = humiliated
condition = injured
location = swamp
camera_target = face
```

It should not decide:

```text
perhaps he looks angry instead
```

That's a narrative decision.

This is another reason the AST and manifest architecture is valuable.

The renderer should be almost stupid.

Ideally:

> **The smarter the renderer becomes, the more dangerous the architecture becomes.**

The renderer's job is to execute decisions, not invent them.

---

# 16. The `repo-bot` idea is really about authority boundaries

The document presents `repo-bot` as a coordinator around generation, pull requests, checksums, and version sealing. 

The deeper value isn't "use a Cloudflare Worker."

It's:

> **Separate execution from authority.**

A rendering process should not possess broad GitHub privileges merely because it needs to render a video.

That's a very good security principle.

Think:

```text
GPU / render process
       │
       │ untrusted computation
       ▼
render result
       │
       ▼
controlled authority boundary
       │
       ▼
Git / release repository
```

This is basically the media equivalent of a CI/CD trust boundary.

I would retain that even if `repo-bot` itself eventually disappears.

---

# 17. The sealed-file lifecycle is one of the best additions in the document

The distinction:

```text
generated
patched
locked
```

is excellent because it recognizes a reality that pure automation systems often ignore:

> A finished creative artifact will eventually need human intervention.

The mistake would be to treat manual intervention as an exceptional failure.

Instead, it becomes a first-class state.

The checksum mechanism then detects:

```text
generator thinks file is unchanged
        vs.
file actually changed
```

rather than silently overwriting the director's work.

This is a very strong human/automation boundary.

The principle is:

> **Automation may create; automation may diagnose; automation must not silently destroy human decisions.**

That deserves to survive even if the precise implementation changes.

---

# 18. The QA pipeline should become a hierarchy of progressively expensive tests

The document's three-tier visual QA system is conceptually excellent:

```text
Tier 1
cheap deterministic tests

       ↓

Tier 2
geometric / pixel tests

       ↓

Tier 3
diagnostic agent / human workflow
```

That is exactly the right economics.

Never send a $50 GPU job through a complicated visual workflow only to discover:

```text
file missing
```

at the end.

Instead:

```text
schema check
  ↓
file check
  ↓
hash check
  ↓
geometry check
  ↓
short render
  ↓
full render
  ↓
perceptual QA
```

The document's existing pre-flight and multi-tier QA material points in this direction. 

---

# 19. One thing I would change: do not make exact numerical thresholds look universal

Examples include:

* `-14 dB` ducking
* 4 px mouth-anchor tolerance
* specific green-channel thresholds
* particular loudness targets
* 6-frame attack
* 12-frame release

These are useful **production parameters**.

They are not universal truths.

They should live in something like:

```json
{
  "audio": {
    "ducking_db": -14,
    "attack_frames": 6,
    "release_frames": 12
  },

  "visual": {
    "max_viseme_error_px": 4
  }
}
```

and be versioned.

That turns:

> "the system does -14 dB"

into:

> "episode profile v3 specifies -14 dB."

That distinction makes the architecture much more durable.

---

# 20. The loudness section particularly needs to distinguish delivery profiles

The document mentions both approximately −16 LUFS and −24 LUFS.

That's not inherently contradictory because different distribution contexts use different targets.

The current ATSC A/85 guidance, approved July 8, 2026, is specifically concerned with television and streaming loudness practices, while historical EBU practice commonly uses −23 LUFS. ([ATSC : NextGen TV][4])

So don't bake:

```text
MASTER_LOUDNESS = -16
```

into the renderer.

Use:

```text
delivery_profile = WEB
delivery_profile = BROADCAST_US
delivery_profile = BROADCAST_EBU
delivery_profile = ARCHIVAL_MASTER
```

Each profile specifies its own:

* integrated loudness
* true peak
* channel layout
* sample rate
* codec
* container
* subtitle requirements

The renderer should produce a controlled master; the **delivery layer** should determine distribution-specific conformance.

---

# 21. C2PA is valuable, but the document slightly overstates what it proves

This is important.

C2PA is genuinely useful for provenance. Its specification describes digitally signed provenance assertions bound to the asset. ([C2PA][5])

But this statement from the document:

> "sealing the pipeline's human-authored origin"

is stronger than what C2PA itself guarantees.

C2PA can establish:

> this asset contains a signed provenance assertion associated with these creation/editing events.

It does **not inherently prove that the content was genuinely authored by a human**.

So I'd use wording like:

> "The final master carries cryptographically verifiable provenance assertions describing its creation, inputs, processing steps, and authorized sign-offs."

That is both stronger technically and more defensible.

---

# 22. MovieLabs Media Manifest is a delivery-layer concern, not a creative-engine concern

The document is correct that MovieLabs has media-manifest specifications for media delivery. The current MovieLabs Media Manifest is version 2.25, released December 4, 2025, and is explicitly concerned with media delivery and metadata. ([MovieLabs][6])

But architecturally I'd keep it downstream:

```text
creative pipeline
      ↓
master
      ↓
QC
      ↓
delivery packaging
      ↓
MovieLabs / platform-specific manifests
```

Don't allow delivery metadata standards to contaminate the narrative/rendering model.

---

# 23. The "creative bottleneck" diagnosis is probably the most strategically important paragraph

Near the end, the document suddenly stops talking about technology and says, essentially:

> the machine is becoming better specified than the material being fed into it.

That's a very important observation.

The document argues that the system needs a substantial corpus of concrete grievances, each linking:

```text
surface complaint
      +
underlying unspoken grievance
      +
recurring physical context
```

The exact recommendation of "40–60" grievances is a useful starting target, but I wouldn't treat that number as scientifically established.

The deeper insight is this:

### The creative system needs a sufficiently rich latent world model.

Otherwise the generative component has enormous freedom and little structure.

Then the output tends toward generic patterns.

The better solution isn't necessarily:

> "make the LLM smarter."

It is:

> **give the LLM a richer constrained world to express.**

That is a substantially more interesting idea.

---

# 24. I would formalize the grievance as a reusable generative primitive

The document points toward something potentially more powerful than ordinary character backstory.

A grievance could be represented as:

```json
{
  "surface_complaint": "...",
  "underneath": "...",
  "trigger": "...",
  "historical_origin": "...",
  "associated_prop": "...",
  "forbidden_admission": "...",
  "preferred_escalations": [...],
  "cooldown": "...",
  "eligible_characters": [...]
}
```

Then the simulation doesn't have to invent conflict from scratch.

It selects from **dramatically productive structures**.

That gives you something like:

```text
WORLD STATE
     ↓
GRIEVANCE
     ↓
CURRENT TRIGGER
     ↓
MECHANICAL OUTCOME
     ↓
SURFACE ARGUMENT
     ↓
UNDERLYING EMOTIONAL PRESSURE
```

This is much closer to a generative dramaturgy engine than simply an LLM writing scenes.

---

# 25. The real creative asset may eventually be the grievance graph

This is an addition I would make to the architecture.

You already have relationships, debts, secrets, injuries and grievances.

Represent them as a graph:

```text
           ┌─────────┐
           │   BOG   │
           └────┬────┘
                │ resentment
                ▼
           ┌─────────┐
           │ SPLINE  │
           └────┬────┘
                │ secret
                ▼
           ┌─────────┐
           │  MOSS   │
           └─────────┘
```

But edges can have types:

```text
resentment
debt
fear
blackmail
loyalty
betrayal
physical dependency
knowledge
unresolved grievance
```

Then an episode is essentially a **graph transition**.

That is a much more scalable representation of serialized narrative continuity.

---

# 26. The strongest concept underneath everything is actually "event sourcing"

I would explicitly recognize this.

The system is very close to an event-sourced architecture:

```text
Initial canon
     +
state
     +
episode event
     ↓
new state
```

For example:

```text
Episode 003

Bog loses duel
↓
Bog receives humiliation
↓
Paranoia +1
↓
String transferred
↓
relationship tension +2
↓
future eligibility changes
```

Instead of simply storing:

```text
Bog.paranoia = 7
```

you can preserve:

```text
Episode 003:
paranoia +1 because of X

Episode 004:
paranoia +2 because of Y

Episode 006:
paranoia -1 because of Z
```

Then the state becomes reconstructible.

That is incredibly valuable for a system whose central promise is historical continuity.

---

# 27. The episode artifact should be thought of as a "sealed build"

I'd give every episode a conceptual identity:

```text
EPISODE BUILD
```

not simply:

```text
video file
```

It should contain:

```text
episode/
├── narrative/
│   ├── dialogue_ast.json
│   └── screenplay.fountain
│
├── audio/
│   └── *.wav
│
├── visual/
│   └── assets
│
├── rendering/
│   └── Episode_XXX.tsx
│
├── manifests/
│   ├── exposure_sheet.json
│   └── render_manifest.json
│
├── qa/
│   ├── signal_report.json
│   └── visual_report.json
│
└── master/
    └── episode.mp4
```

This is much better than thinking of the MP4 as the primary artifact.

The MP4 becomes the **compiled output of the episode build**.

---

# 28. The most valuable new invariant: every stage should be able to answer "why?"

I would add an explicit provenance chain:

```text
Why did this frame exist?

→ camera instruction
→ shot definition
→ AST node
→ narrative event
→ mechanical outcome
→ state transition
→ canon / ledger input
```

Likewise:

```text
Why is this image being used?

→ asset reference
→ manifest
→ character state
→ AST condition
→ narrative state
```

And:

```text
Why does this audio begin here?

→ exposure sheet
→ dialogue AST
→ shot timing
→ exact source WAV
```

That makes the system **auditable**, not merely reproducible.

Those are different qualities.

Reproducibility asks:

> Can I recreate it?

Auditability asks:

> Can I explain why it was created?

You want both.

---

# 29. The final architecture I would preserve

If I stripped the document down to its most valuable core, I would express it like this:

```text
                ┌────────────────────┐
                │   IMMUTABLE CANON  │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │   WORLD STATE      │
                │  relational ledger │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │  NARRATIVE SOWER   │
                │ rules + simulation │
                └─────────┬──────────┘
                          │
                    dialogue_ast
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
      AUDIO COMPILER             VISUAL COMPILER
             │                         │
       locked frames             asset contracts
             │                         │
             └────────────┬────────────┘
                          ▼
                ┌────────────────────┐
                │ EPISODE GENERATOR  │
                │   source-baking     │
                └─────────┬──────────┘
                          │
                    Episode.tsx
                          │
                          ▼
                ┌────────────────────┐
                │ DETERMINISTIC      │
                │ REMOTION RENDER    │
                └─────────┬──────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │      QA      │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │    MASTER    │
                  │ + provenance │
                  └──────────────┘
```

And underneath every box:

```text
HASH
VERSION
SCHEMA
PROVENANCE
VALIDATION
```

That is the real system.

---

# What I would remove or demote

A lot of the original material is useful implementation thinking, but it currently receives almost the same rhetorical weight as the central architecture.

I would demote these to implementation appendices:

* exact Cloudflare topology
* individual HTTP ports
* particular filenames
* exact Remotion component names
* the specific Jules workflow
* exact PR branch naming
* particular GPU hardware
* individual shader/filter implementation
* exact numerical thresholds
* specific model names
* precise repository layout
* detailed commands
* individual storage providers

None of those are unimportant.

They just aren't the **invariants**.

The architecture should survive all of them changing.

---

# What I think the document is actually trying to build

At the highest level, this isn't really an "AI video generator."

It is closer to:

> **a version-controlled narrative operating system that compiles world state into media.**

That distinction matters enormously.

An ordinary AI video system asks:

```text
prompt → video
```

Your architecture is closer to:

```text
canon
   +
state
   +
rules
   +
conflict
   +
language
   +
audio
   +
visual contracts
   +
timing
   +
rendering
   +
provenance
      ↓
historical media artifact
```

That is a much more ambitious and much more interesting engineering problem.

And the architecture has one particularly strong philosophical property:

> **The AI is not the authority over reality. The state machine is.**

The AI produces language and potentially imagery, but deterministic contracts decide what is allowed to be true.

That is probably the single sentence I would put at the top of the entire specification.

---

# The immediate practical priority

The final section of the document gives the correct engineering warning: a beautifully specified architecture has little value until it survives a real end-to-end run. The document proposes a three-second vertical slice—from one dialogue line, through WAV generation and frame quantization, through episode source generation, to an actual MP4. 

I would make that test even more rigorous.

The first successful slice should prove **five things simultaneously**:

```text
1. Narrative AST is valid.
2. Audio duration becomes correct frame timing.
3. Generated TSX is reproducible.
4. Rendering actually works on the target machine.
5. The resulting artifact can be re-rendered and verified.
```

Then render the exact same episode twice and compare:

```text
source hash
asset hashes
audio hashes
frame count
render metadata
final SHA-256
```

That single experiment would tell you more about the architecture's real maturity than another hundred pages of design.

### My deepest addition

I would make **provenance and state reconstruction** a first-class objective alongside rendering.

The ultimate test should be:

> Take a finished episode from several years ago, restore its sealed inputs, and ask the system to explain exactly why every important narrative, temporal, visual, and rendering decision occurred—and then reproduce the artifact.

That is a much more powerful definition of "deterministic" than merely producing the same MP4.

I can also create an image explaining this entire architecture as a single visual systems diagram.

[1]: https://ffmpeg.org/ffprobe.html?utm_source=chatgpt.com "ffprobe Documentation"
[2]: https://github.com/Wan-Video/Wan2.1/blob/main/wan/image2video.py?utm_source=chatgpt.com "Wan2.1/wan/image2video.py at main · Wan-Video/Wan2.1 · GitHub"
[3]: https://www.remotion.dev/?utm_source=chatgpt.com "Remotion | Make videos programmatically"
[4]: https://www.atsc.org/atsc-documents/a85-techniques-for-establishing-and-maintaining-audio-loudness-for-digital-television/?utm_source=chatgpt.com "A/85, Techniques for Establishing and Maintaining Audio Loudness for Digital Television - ATSC : NextGen TV"
[5]: https://c2pa.org/principles/?utm_source=chatgpt.com "C2PA - Guiding Principles"
[6]: https://movielabs.com/md/manifest/?utm_source=chatgpt.com "Media Manifest—MovieLabs"


The new file is much tighter than the earlier material. It has converged on a clearer thesis: **this is best understood as an event-sourced, deterministic media compiler whose generative models are subordinate execution components, not authors of reality.** 

Below is how I would distill it further—keeping the strongest ideas, separating architectural truths from implementation choices, identifying places where the document is technically too strong or underspecified, and adding the ideas that I think would make the system substantially more robust.

---

# 1. The central idea is correct—and should become the system's governing principle

The most valuable sentence in the document is essentially this:

> **The system is a media compiler, not an AI video generator.**

That distinction is not merely branding.

An ordinary generative-video architecture looks approximately like:

```text
prompt
   ↓
LLM
   ↓
image/video model
   ↓
video
```

Your architecture is fundamentally different:

```text
canon
   +
current world state
   ↓
deterministic simulation
   ↓
validated narrative IR
   ↓
temporal compilation
   ↓
visual compilation
   ↓
generated rendering program
   ↓
renderer
   ↓
validated artifact
```

The difference is **where authority resides**.

In your design, the AI models are not supposed to determine:

* what happened,
* who won,
* what a character knows,
* whether an injury exists,
* where an actor is,
* how long a shot lasts,
* which asset represents a canonical state,
* or what the historical episode actually was.

Those things are determined elsewhere.

The models are effectively doing:

> "Here is the constrained problem. Produce a candidate execution."

That is an extremely important architectural boundary.

The file makes this explicit in the separation between the Sower's narrative decisions and the downstream representation layer. 

## The deeper principle

I would actually elevate this to the following law:

> **Probabilistic systems may propose or execute; deterministic systems decide what is allowed to be true.**

That is probably the single most reusable idea in the entire project.

It applies to:

* LLM prose generation
* diffusion
* TTS
* image analysis
* visual remediation
* asset selection
* camera synthesis

and it gives you a coherent philosophy for everything that follows.

---

# 2. The six layers are good, but there are actually two dimensions hiding inside them

The document gives six layers:

1. canon/state
2. narrative simulation
3. temporal/audio compilation
4. visual asset compilation
5. episode source-baking
6. rendering and QA 

That is a useful operational decomposition.

But conceptually there are **two different axes** here.

### Axis A: semantic transformation

```text
WORLD
  ↓
NARRATIVE
  ↓
TIMING
  ↓
VISUAL PLAN
```

### Axis B: artifact hardening

```text
PLAN
  ↓
SOURCE
  ↓
RENDER
  ↓
VERIFIED ARTIFACT
```

This distinction is useful because it tells you where different classes of bugs belong.

A bad grievance selection is a **semantic bug**.

A wrong frame count is a **temporal compilation bug**.

A wrong character anchor is a **visual compilation bug**.

A missing font is an **execution environment bug**.

A corrupted MP4 is an **artifact/delivery bug**.

Without that classification, everything eventually becomes "the video is wrong."

With it, you can ask:

> **Which compiler boundary introduced the divergence?**

That is a much more powerful debugging model.

---

# 3. Canon versus state is one of the strongest structural decisions

The distinction between immutable canon and mutable relational state is excellent. The document describes static lore as read-only law and things such as spatial position, trauma, resentment and knowledge as changing state. 

This is much better than a giant mutable "world database."

Conceptually:

```text
CANON
"What is inherently true?"

        +

STATE
"What is currently true?"

        ↓

EPISODE CONTEXT
"What can happen now?"
```

That distinction creates a powerful property:

### An event can change the world without rewriting the world's underlying laws.

For example:

```text
Canon:
Bog has a vulnerable shoulder.

Event:
Bog's shoulder is injured again.

State:
shoulder_status = aggravated

Later event:
Bog recovers.

State:
shoulder_status = baseline
```

Nothing about canon changed.

This is exactly the kind of separation that makes long-running serialized worlds manageable.

---

# 4. I would make the distinction even sharper: Canon, State, Event, Projection

The document currently gives you:

```text
Canon + Ledger
```

I think the strongest final model is:

```text
        CANON
          │
          ▼
     STATE SNAPSHOT
          │
          ▼
       EVENTS
          │
          ▼
   UPDATED STATE
          │
          ▼
      NARRATIVE IR
          │
          ▼
     MEDIA PROJECTIONS
```

This matters because **an event is not the same thing as state**.

For example:

```json
{
  "type": "CONDITION_ADDED",
  "character": "BOG",
  "condition": "humiliated"
}
```

is an event.

Whereas:

```json
{
  "character": "BOG",
  "conditions": ["humiliated"]
}
```

is state.

You need both.

State is efficient for current computation.

Events are what make history reconstructible.

---

# 5. The proposed event-sourcing model is excellent—but its equation is too simplistic

The file writes:

$$
S_N = S_0 + \sum_{i=1}^{N}\Delta_i
$$

as the intuitive event-sourcing model. 

As a conceptual illustration, that's fine.

As an actual implementation model, however, it is incomplete.

State transitions are generally ordered transformations:

$$
S_{n+1}=F(S_n,\Delta_n)
$$

and therefore:

$$
S_N=
F(
F(
F(S_0,\Delta_1),
\Delta_2
),
\dots,
\Delta_N
)
$$

Order matters.

For example:

```text
add injury
heal injury
add injury
```

is not equivalent to:

```text
heal injury
add injury
add injury
```

The real invariant should therefore be:

> **Given the same genesis state, the same ordered event stream, and the same deterministic reducers, the same state must be reconstructed.**

That is stronger and more precise than treating events as merely additive deltas.

---

# 6. The event log should become the historical truth

This is one place where I would push the architecture farther.

I would establish three distinct artifacts:

```text
1. EVENT LOG
   Historical truth

2. MATERIALIZED STATE
   Efficient working representation

3. EPISODE PROJECTION
   The specific story/media manifestation
```

Like this:

```text
             EVENT LOG
                 │
          ┌──────┴──────┐
          ▼             ▼
   MATERIALIZED     AUDIT /
      STATE         HISTORY
          │
          ▼
    NARRATIVE IR
          │
          ▼
     MEDIA BUILD
```

The relational database can remain.

Event sourcing does **not** require you to abandon SQL.

A very practical architecture is:

```text
immutable event log
        ↓
transactional reducer
        ↓
materialized relational tables
```

That gives you both historical integrity and computational convenience.

---

# 7. "Simulation precedes language" is perhaps the most important AI-design principle here

The file states that conflict selection and mechanical resolution happen before the LLM drafts prose. 

That is excellent.

It means the model isn't asked:

> "Who wins?"

It is asked:

> "Here is who won. Now express the consequences dramatically while obeying these constraints."

That is a huge difference.

The architecture thereby turns the LLM from:

```text
authoritative simulator
```

into:

```text
constrained language realization engine
```

That is much safer for continuity.

---

# 8. The machine-readable AST should unquestionably be the canonical intermediate representation

The document is particularly strong here.

It states that the screenplay is only a human-readable projection and that `dialogue_ast.json` is the actual machine contract. 

I would make this even more explicit:

> **Never allow downstream systems to infer important state from screenplay prose when the AST can state it directly.**

For example:

Bad:

```text
"Bog staggers toward the door."
```

and then later trying to infer:

```text
movement = LIMP
```

Better:

```json
{
  "speaker": "BOG",
  "action": {
    "type": "LIMP",
    "direction": "DOOR"
  }
}
```

with prose generated from that structure.

That means the screenplay becomes a **view** of the canonical representation.

This is analogous to a compiler emitting:

```text
AST → source/debug representation
```

rather than trying to reconstruct the AST from source text later.

---

# 9. The AST should probably become versioned and schema-migratable

This is an important addition that is missing from the document.

Once the AST becomes the canonical contract, it will evolve.

Eventually you will have:

```text
dialogue_ast v1
dialogue_ast v2
dialogue_ast v3
```

You therefore need:

```text
schema_version
```

and explicit migration rules.

For example:

```json
{
  "schema_version": 4,
  "scene_id": "...",
  "lines": [...]
}
```

A five-year-old episode should not merely depend on the latest parser.

It should either:

1. retain the original AST forever, or
2. retain a canonical archived version plus a tested migration chain.

Otherwise the "historical corruption trap" can return one level higher.

You may successfully freeze `Episode_040.tsx` while accidentally losing the ability to understand its original narrative representation.

---

# 10. Dual clocks are exactly the right mental model

The file introduces:

* a 24 fps video frame clock
* a continuous/sample-level acoustic clock 

That is a very good refinement.

The important nuance is:

### Frame accuracy is not the same as sample accuracy.

At 24 fps:

$$
\frac{1}{24}=41.6667\text{ ms}
$$

So video can only represent discrete frame boundaries.

Audio, however, has much finer resolution.

Therefore I would preserve:

```text
VIDEO CLOCK
integer frames

AUDIO CLOCK
integer samples / exact timestamps
```

and then define a deterministic conversion between them.

That allows you later to support:

* word-level sync
* phoneme-level sync
* musical timing
* Foley alignment
* sub-frame editorial intent

without redesigning the whole timing architecture.

---

# 11. Absolute anchoring is more important than 24 fps

The document's equation:

$$
start_k=\sum_{i<k}duration_i
$$

is conceptually excellent. 

The key principle is not "use 24 fps."

It is:

> **Represent important temporal positions as absolute coordinates rather than repeatedly concatenating independently rounded durations.**

This principle applies everywhere.

You want:

```text
shot 17 starts at frame 842
```

not:

```text
shot 17 starts when the previous 16 clips happen to finish
```

The same philosophy appears in the rest of the system:

* absolute asset identity
* exact commit identity
* fixed coordinates
* immutable event IDs
* explicit frame positions
* content hashes

The architecture has a hidden mathematical philosophy:

> **Replace implicit accumulated state with explicit coordinates whenever possible.**

That's worth making explicit in the specification.

---

# 12. Backend temporal constraints should remain adapters

The file correctly isolates Wan's `4n+1` constraint in a backend adapter rather than treating it as a universal rule. 

That is exactly right.

The universal architecture should say:

```text
MASTER TIMELINE
      ↓
BACKEND ADAPTER
      ↓
BACKEND-SPECIFIC TIMELINE
```

rather than:

```text
Master timeline = Wan timeline
```

The latter would make the architecture hostage to one model.

Tomorrow it could be:

```text
Wan
Hunyuan
another video model
real-time renderer
3D animation system
```

and each gets its own temporal adapter.

---

# 13. Source baking is a very strong answer to historical drift

The document's solution to mutable renderer drift is one of its strongest engineering decisions. 

The basic problem is:

```text
Episode 12
   ↓
Renderer v1
```

Six months later:

```text
Episode 12
   ↓
Renderer v7
```

and suddenly the same inputs no longer render the same historical episode.

Source baking changes the relationship:

```text
Episode 12
   ↓
Compiler
   ↓
Episode_012.tsx
   ↓
freeze
```

Now the episode isn't merely data.

It is an **executable historical specification**.

That is a powerful idea.

---

# 14. But source baking has a significant cost

This deserves more attention than the document gives it.

Source baking creates duplication.

If 500 episodes each vendor:

```text
GoblinPuppet.tsx
AmbientTrack.tsx
FoleyTrack.tsx
```

you've potentially created:

```text
500 snapshots of shared implementation
```

That's intentional, but expensive.

Therefore I'd formally define three levels:

### Level 1 — immutable package

```text
@viewport/1.4.2
```

### Level 2 — locked commit

```text
abc123...
```

### Level 3 — fully vendored source

```text
episode/components/...
```

Use the least expensive isolation mechanism that satisfies the reproducibility requirement.

This preserves the historical boundary without automatically copying everything forever.

---

# 15. Build identity is a much stronger idea than Git identity

The document improves on the earlier architecture by saying that reproducibility requires a complete build identity tuple rather than merely Git SHAs. 

That is exactly right.

A serious build identity should encompass at least:

```text
CANON
STATE SNAPSHOT
EVENT LOG VERSION
AST
TIMING MANIFEST
ASSET HASHES
AUDIO HASHES
MODEL CHECKPOINTS
MODEL CONFIG
RANDOM SEEDS
GENERATOR SOURCE
DEPENDENCY LOCKFILE
CONTAINER IMAGE
FFmpeg
Chromium
Node
OS/runtime characteristics
fonts
render configuration
```

Then the episode identity is essentially:

$$
BuildID=H(I_1,I_2,\ldots,I_n)
$$

where every \(I_i\) is an immutable input or environment component.

That's a much more defensible definition of reproducibility.

---

# 16. The document is right to treat bit-identical rendering as an empirical hypothesis

This is an important intellectual correction.

It says, in effect:

> Don't assume that freezing source and versions automatically proves identical output. Test it. 

That is exactly the right attitude.

You should literally run:

```text
Container A
   ↓
render
   ↓
SHA-A


Container B
   ↓
render
   ↓
SHA-B
```

then:

$$
SHA_A=SHA_B?
$$

But I would take it one step further.

There are really three reproducibility questions:

### 1. Semantic reproducibility

Did the same narrative state produce the same AST?

### 2. Render reproducibility

Did the same inputs generate the same frames/audio?

### 3. Packaging reproducibility

Did those identical media streams become the exact same MP4 bytes?

Those are different experiments.

A system could pass the first two and fail the third because of:

* metadata timestamps
* container ordering
* encoder settings
* muxing behavior
* embedded metadata
* nondeterministic compression

So test all three independently.

---

# 17. I would archive a lossless master before the delivery MP4

This is an architectural addition I consider important.

The final MP4 is a **delivery artifact**.

It should not necessarily be the ultimate preservation artifact.

A stronger hierarchy is:

```text
SOURCE / IR
    ↓
LOSSLESS MEDIA MASTER
    ↓
DELIVERY ENCODE
    ↓
PLATFORM / BROADCAST DERIVATIVES
```

Why?

Because years later you may discover:

* better encoding
* new platform requirements
* HDR delivery
* alternate audio layouts
* subtitle corrections
* new packaging requirements

If the only preserved artifact is a lossy delivery MP4, you have permanently thrown away information.

The archival master should therefore be treated separately from the delivery derivative.

---

# 18. The explicit-null protocol is excellent

The file calls out the difference between a deliberately missing visual variant and an accidentally missing file. 

That distinction is much more important than it first appears.

These states are not equivalent:

```text
null
```

```text
missing property
```

```text
broken path
```

```text
asset exists but fails validation
```

A mature pipeline should distinguish them.

I would formalize the asset lifecycle more broadly:

```text
UNKNOWN
EXPECTED
MISSING
INTENTIONALLY_ABSENT
INVALID
VALID
WAIVED
LOCKED
SUPERSEDED
```

That makes automated release logic dramatically safer.

---

# 19. The visual manifest is effectively an API

The `manifest.json` concept is strong because image files by themselves don't provide enough semantic information.

The manifest can define:

```text
physical ground point
facial target
mouth box
motion scalars
condition variants
fallback semantics
```

so the renderer receives **structured physical facts** rather than trying to infer them from pixels. 

That means:

> `manifest.json` is not metadata.

It is better thought of as:

> **the public API of the visual asset.**

Once viewed that way, it deserves:

* schema validation
* semantic versioning
* backward compatibility rules
* migrations
* contract tests

---

# 20. The token-attribution verifier is a good idea, but it should not be trusted by itself

The proposed verifier tries to compare prose verbs against authorized AST action tokens. 

That's valuable.

But natural language has nasty edge cases.

Consider:

> "He wanted to jump."

versus:

> "He jumped."

Or:

> "He did not jump."

Or:

> "He looked as though he were about to jump."

Or:

> "The word 'jump' appeared in the note."

A naive dependency parse can misclassify these.

So I'd make the architecture:

```text
AST
 ↓
semantic constraints
 ↓
prose
 ↓
linguistic verifier
 ↓
deterministic state verifier
```

and treat the linguistic parser as a **high-value detector**, not as the ultimate source of truth.

The safest approach is to constrain prose generation such that machine-relevant actions are explicitly represented, then use the prose verifier as defense in depth.

---

# 21. Negative constraints are more powerful than they initially appear

The document emphasizes "ignorance by omission." 

This is excellent.

A common generative-system mistake is to provide the model with everything and tell it:

> "Don't mention what this character doesn't know."

That isn't reliable.

A better architectural principle is:

> **Do not give the model information it is forbidden to know.**

That is an information-flow control.

Instead of:

```text
ALL WORLD KNOWLEDGE
        ↓
LLM
        ↓
"please behave"
```

you want:

```text
CHARACTER-KNOWN SUBGRAPH
        ↓
LLM
```

This is much stronger.

It is similar to capability security:

> The model cannot leak a secret it never received.

Not perfectly—because inference can still occur—but dramatically safer.

---

# 22. The grievance graph is potentially more important than the grievance list

The document's event-sourced grievance graph is a very good direction. 

I'd take it one level further.

Don't think only in terms of:

```text
grievance = item
```

Think:

```text
grievance = structured relationship
```

For example:

```text
BOG
 │
 ├── resentment → SPLINE
 │
 ├── debt → MOSS
 │
 ├── secret-known → ELIAS
 │
 ├── humiliation → CAMP
 │
 └── fear → THE MARSH
```

And each edge can carry:

```text
strength
age
last_trigger
cooldown
origin_event
visibility
who knows
what it can trigger
what resolves it
```

Now the world becomes a **dynamic social graph**, rather than a collection of independent character records.

That may be the deepest route toward sustained serialized narrative.

---

# 23. The grievance should probably have three layers

I would add this structure:

```text
SURFACE
"What the character says is wrong."

UNDERLYING
"What is actually emotionally at stake."

FORBIDDEN TRUTH
"What the character cannot admit."
```

For example:

```text
Surface:
"You stole my boots."

Underlying:
"You have repeatedly treated me as disposable."

Forbidden truth:
"I depend on you more than I want you to know."
```

The language model then has a well-defined dramatic space.

This is considerably better than simply asking for "subtext."

---

# 24. MRU compilation into timeline geometry is one of the most interesting ideas

The document proposes translating Motivation-Reaction Units into actual frame structure:

```text
stimulus
   ↓
reflex
   ↓
calculation
   ↓
speech
```

with an explicit reaction pre-roll before dialogue. 

This is much more interesting than simply putting dialogue at frame 0.

It means the narrative engine can encode:

> Something emotionally meaningful happened **before** the line.

That can then become:

```text
18 frames reaction
        ↓
eye movement
        ↓
camera push
        ↓
speech
```

Now psychological causality becomes something the compositor can represent physically.

That is a genuinely valuable bridge between narrative theory and computer graphics.

---

# 25. I would extend this into an explicit "causal timeline"

Rather than thinking only in terms of:

```text
speech starts at frame 75
```

think:

```text
CAUSE EVENT
frame 52
   ↓
REFLEX
frames 53–57
   ↓
PROCESSING
frames 58–69
   ↓
DECISION
frames 70–73
   ↓
SPEECH
frame 74
```

This makes pacing a consequence of narrative causality rather than simply audio duration.

That could become one of the defining characteristics of the system.

---

# 26. The QA hierarchy is exactly the right economic strategy

The document calls this an "economic QA hierarchy." 

That is very good.

You don't want:

```text
expensive GPU render
        ↓
discover nonexistent WAV
```

Instead:

```text
schema check
   ↓
file existence
   ↓
hash validation
   ↓
geometry validation
   ↓
audio validation
   ↓
small render
   ↓
full render
   ↓
perceptual inspection
```

The general rule is:

> **Fail as close as possible to the cheapest point where the failure can be detected.**

This should become a formal design invariant.

---

# 27. "Three tiers" should really become "progressive confidence"

I would slightly reframe the QA architecture.

Rather than:

```text
Tier 1
Tier 2
Tier 3
```

think:

```text
CONFIDENCE 0 — structurally valid
CONFIDENCE 1 — physically valid
CONFIDENCE 2 — visually valid
CONFIDENCE 3 — semantically valid
CONFIDENCE 4 — editorially approved
```

This makes the system easier to extend.

A file might be structurally valid but visually wrong.

A render might be visually correct but narratively wrong.

A scene might pass machine checks and still require director approval.

Those are distinct kinds of truth.

---

# 28. The proposed perceptual thresholds need more care

The file suggests something like:

$$
\Delta E < 0.1
$$

or

$$
SSIM > 0.9999
$$

if exact bit identity fails. 

The intent is good, but these are not universal equivalence criteria.

The meaningful threshold depends on:

* color space
* frame resolution
* encoder
* whether comparison is pixel-to-pixel
* what parts of the image are static
* how temporal motion is treated
* whether audio is included
* how frame samples are selected

And SSIM and ΔE measure different things.

So I would establish:

```text
exact render identity
        OR
predefined perceptual equivalence protocol
```

where the protocol itself is versioned.

For example:

```text
comparison_profile = visual_conformance_v2
```

rather than treating a single numerical threshold as a universal truth.

---

# 29. There should be a distinction between "deterministic" and "reproducible"

These terms are often conflated.

### Deterministic

Same inputs → same computation.

### Reproducible

Another environment can recreate the same result.

### Auditable

You can explain why the result exists.

### Verifiable

An independent process can confirm the result.

### Recoverable

You can reconstruct the state that produced it.

The architecture is trying to achieve all five.

I would explicitly name them.

That would make the specification much more intellectually precise.

---

# 30. The pipeline should preserve provenance at every boundary, not just at the end

I would add a simple invariant:

```text
Every artifact must identify its parents.
```

For example:

```text
Episode.tsx
  ← exposure_sheet hash
  ← AST hash
  ← asset-manifest hash
  ← generator build ID

exposure_sheet
  ← audio hashes
  ← AST hash

audio
  ← TTS model hash
  ← text
  ← voice configuration

asset
  ← source image hash
  ← manifest hash
```

This gives you a **provenance DAG**.

Then any artifact can answer:

> What produced me?

and:

> What did I produce?

That is incredibly valuable when debugging an old episode.

---

# 31. I would make content-addressing universal

The document uses SHA-256 for various artifacts.

I'd extend the concept.

Instead of:

```text
episode040_final.mp4
```

also identify it as:

```text
sha256:<digest>
```

Likewise:

```text
AST
audio
image
manifest
container
model checkpoint
render configuration
```

Then you can make a build graph like:

```text
             AST abc123
                │
       ┌────────┴─────────┐
       ▼                  ▼
   Audio 9988         Asset 7ab2
       │                  │
       └────────┬─────────┘
                ▼
          Build 41fe
                │
                ▼
          Master 909a
```

Now the system becomes content-addressed rather than name-addressed.

That dramatically reduces ambiguity.

---

# 32. The 3-second tracer bullet is absolutely the correct next step

The document's final conclusion is probably exactly right:

> Stop designing and run a tiny end-to-end slice. 

That is where the architecture becomes real.

A 3-second vertical slice exercises:

```text
state
 ↓
AST
 ↓
TTS
 ↓
frame quantization
 ↓
generator
 ↓
Remotion
 ↓
MP4
 ↓
manifest
```

That single experiment will expose problems that prose architecture cannot predict.

For example:

* path assumptions
* missing packages
* audio duration discrepancies
* renderer behavior
* font differences
* Chromium issues
* codec problems
* asset normalization
* sequence timing
* file permissions
* headless browser memory behavior

This is why I agree with the statement that another hundred pages of design would probably produce less information than one real render. 

---

# 33. But I would make the tracer bullet prove more than "the MP4 exists"

The minimal acceptance criteria should be something like:

```text
[ ] Canon revision identified
[ ] State snapshot identified
[ ] Event log revision identified
[ ] AST validates
[ ] AST hash recorded
[ ] WAV produced
[ ] WAV hash recorded
[ ] Duration independently measured
[ ] Frame budget computed
[ ] Episode source generated
[ ] Generator build ID recorded
[ ] Required assets validated
[ ] Render completes
[ ] Render metadata recorded
[ ] Master hash recorded
[ ] Second clean render compared
[ ] Provenance graph can be reconstructed
```

At that point you have not merely demonstrated:

> "we made a video."

You've demonstrated:

> **"we have the beginnings of a reproducible compiler."**

That's a much more meaningful milestone.

---

# 34. The greatest missing concept: schema evolution

This is the principal architectural idea I would add.

You are freezing artifacts, but the *schemas themselves* will change.

Eventually:

```text
canon schema v1
canon schema v2

AST v1
AST v2

manifest v1
manifest v2

event schema v1
event schema v2
```

Therefore the system needs an explicit compatibility policy.

For every persisted contract:

```text
schema_version
producer_version
consumer_version
migration
```

And preferably:

> **Old artifacts remain interpretable even after the live system evolves.**

That is the real defense against historical corruption.

Otherwise you may freeze the data but lose the program capable of interpreting it.

---

# 35. Another major addition: the reducer must be deterministic

If you're adopting event sourcing, the reducer is now one of the most sacred pieces of code in the system.

Given:

```text
state
+
event
```

it must produce exactly:

```text
next state
```

No random numbers.

No network calls.

No system clock.

No ambient environment.

No hidden dependency on unordered object iteration.

No nondeterministic database queries.

Ideally:

```text
reduce(state, event) → state'
```

is a pure function.

Then you can exhaustively test it.

That gives you a clean foundation for:

* replay
* rollback
* branching
* what-if simulation
* historical debugging

---

# 36. Randomness itself needs to become an explicit contract

The architecture contains lotteries and generative systems.

Therefore "deterministic" does **not** mean "no randomness."

It means:

> **randomness is seeded, scoped, recorded and replayable.**

For example:

```text
world_seed
episode_seed
scene_seed
shot_seed
sample_seed
```

Rather than:

```text
Math.random()
```

you want:

```text
random = PRNG(seed = hash(event_id + subsystem))
```

Then a historical event can be replayed exactly.

This is particularly important for:

* conflict selection
* Foley selection
* model sampling
* visual generation
* procedural camera motion

Every stochastic operation needs an explicit seed lineage.

---

# 37. The real immutable unit may be an episode build, not an episode file

I think this is the ultimate conceptual refinement.

An "episode" isn't:

```text
Episode040.mp4
```

It is:

```text
Episode Build 040
```

containing:

```text
world-state snapshot
event sequence
AST
timing
assets
code
environment
render configuration
QA evidence
master
delivery derivatives
```

The MP4 is just one output of that build.

That definition is much more resilient.

---

# 38. The complete conceptual model I would now use

I would summarize the entire architecture like this:

```text
                    WORLD
          ┌───────────────────────┐
          │ Immutable Canon       │
          │ Mutable Current State │
          └──────────┬────────────┘
                     │
                     ▼
              EVENT-DRIVEN SOWER
                     │
             deterministic reducer
                     │
                     ▼
               NARRATIVE IR
              dialogue_ast.json
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
     AUDIO COMPILER        VISUAL COMPILER
          │                     │
      exact timing         asset contracts
          │                     │
          └──────────┬──────────┘
                     ▼
                MEDIA IR
                     │
                     ▼
            SOURCE-BAKED CODE
                     │
                     ▼
             HEADLESS RENDER
                     │
                     ▼
               QA / PROOF
                     │
                     ▼
             SEALED BUILD
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
      MASTER       PROVENANCE    STATE/EVENT
      MEDIA         GRAPH        HISTORY
```

That, in my view, is the architecture hiding inside the document.

---

# 39. The deepest insight

The most important thing this system is creating is **not video**.

It is **a trustworthy chain between world state and media representation**.

That chain looks like:

$$
Canon
\rightarrow
State
\rightarrow
Events
\rightarrow
Narrative
\rightarrow
Timing
\rightarrow
Visuals
\rightarrow
Render
$$

And each arrow has a contract.

That is the real breakthrough.

The valuable property isn't simply that AI can generate a scene.

AI can already generate scenes.

The valuable property is:

> **You can determine exactly why this scene occurred, what world-state transition caused it, what information the characters were allowed to know, why this dialogue was produced, why the shot starts on this frame, why this asset was selected, what software generated it, and whether the historical artifact can be reconstructed later.**

That is a qualitatively different system.

---

# My final ranking of the ideas by architectural importance

Not as a "best/worst" ranking, but in terms of what I would treat as **non-negotiable architectural invariants**:

### 1. Deterministic authority over narrative truth

The LLM/diffusion/TTS layers must not become the source of world-state truth. 

### 2. Immutable canon separated from mutable state

This makes continuity manageable and replay possible. 

### 3. Event-sourced history

State should be reconstructible from an ordered historical event stream. 

### 4. Canonical machine IR

`dialogue_ast.json` should be the machine truth, with prose treated as a projection. 

### 5. Explicit temporal compilation

Maintain a frame clock and an acoustic clock, and anchor shots absolutely. 

### 6. Backend isolation

Model-specific constraints belong in adapters, not in the architecture itself. 

### 7. Source-baked historical builds

Finished episodes need to become immutable executable artifacts. 

### 8. Complete build identity

Git SHAs alone aren't enough. 

### 9. Progressive QA

Catch cheap failures before expensive computation. 

### 10. Provenance and explainability

Every artifact should be able to answer **"what produced me?"** and **"why does this exist?"**

That last principle is the major addition I would make to the document.

---

## And the practical conclusion

At this point, I would **stop expanding the architecture document**.

The document itself reaches the right conclusion: the next meaningful test is the 3-second tracer bullet. 

The goal of that test should not merely be:

> "produce a video."

It should be:

> **"prove that one complete narrative event can travel through the entire compiler while retaining identity, causality, timing, provenance, and reproducibility."**

Once that works, you have validated the architecture at the level that matters.

The next substantial design artifact I would create from this material is a **formal "invariants and contracts" specification**: one compact document defining, for every boundary, the inputs, outputs, schemas, hashes, failure conditions, authority, and reproducibility guarantees. That would turn this excellent conceptual architecture into something that can actually govern implementation.
Yes. This third file is the clearest version so far. It has moved beyond describing components and is now describing a **theory of how the entire production system should preserve truth, causality, time, and history**.

My main conclusion is that the architecture is fundamentally sound, but it becomes much stronger when you distinguish four things that the document sometimes blends together:

**truth**, **state**, **computation**, and **media representation**.

The file's most important statement is that this should be understood as an **event-sourced deterministic media compiler rather than an AI video generator**. Generative models are deliberately denied narrative, spatial, and temporal authority; deterministic contracts decide what is true and the generative systems execute constrained tasks. 

That idea should remain the foundation of everything.

---

# 1. The deepest architecture is actually simpler than the implementation makes it look

The document gives a two-dimensional architecture:

```text
                SEMANTIC TRANSFORMATION

WORLD STATE → NARRATIVE IR → TEMPORAL IR → VISUAL IR
     │              │              │             │
     ▼              ▼              ▼             ▼
 EVENTS         SOURCE CODE    HEADLESS RUN   VERIFIED ARTIFACT

                ARTIFACT HARDENING
```

The two axes are explicitly described as **semantic transformation** and **artifact hardening**. 

I think this is one of the most valuable conceptual refinements in the entire document.

The reason is that most production systems collapse two very different questions:

> **What should happen?**

and:

> **How do we preserve exactly what happened?**

Those are not the same problem.

The first is a compiler problem.

The second is a preservation and provenance problem.

So the system should be thought of as:

$$
\text{World Truth}
\rightarrow
\text{Media Meaning}
\rightarrow
\text{Executable Representation}
\rightarrow
\text{Historical Artifact}
$$

And every arrow has a different class of failure.

That gives you a very powerful debugging taxonomy:

| Failure                                   | Fundamental class     |
| ----------------------------------------- | --------------------- |
| Wrong character wins                      | semantic              |
| Character knows a forbidden secret        | epistemic/semantic    |
| Dialogue begins on wrong frame            | temporal              |
| Mouth is positioned incorrectly           | visual                |
| Missing font changes rendering            | execution/environment |
| Identical build produces different MP4    | reproducibility       |
| Old episode changes after software update | historical integrity  |

The document already recognizes this distinction. 

I would make it a formal engineering doctrine.

---

# 2. I would refine the ontology one more time

The document now has four tiers:

1. immutable canon
2. dynamic state
3. ordered event log
4. media projections 

This is excellent.

But I would explicitly name the relationship among them:

```text
CANON
  │
  │ constrains
  ▼
STATE
  │
  │ transformed by
  ▼
EVENT
  │
  │ reduced into
  ▼
NEW STATE
  │
  │ projected into
  ▼
MEDIA
```

This gives you an especially important property:

### Media is not state.

The MP4 is not the truth.

The screenplay is not the truth.

The exposure sheet is not the truth.

The rendered TSX is not the truth.

They are **projections of truth**.

That distinction could save the project from some extremely difficult future problems.

Suppose someone edits the soundtrack of an old episode.

They have changed a projection.

They haven't necessarily changed:

* the original narrative event
* the world state
* the original AST
* the historical build

That makes correction and restoration much cleaner.

---

# 3. Event sourcing is probably the single most important architectural addition

The previous version discussed event sourcing.

This version makes it much more explicit:

$$
S_{n+1}=\mathcal{F}(S_n,\Delta_n,\sigma_n)
$$

where the event and its explicit seed participate in the transition. 

That is a much better formulation than simply thinking of a state table as the ultimate history.

The distinction is:

```text
CURRENT STATE
    =
what is true now

EVENT LOG
    =
why it became true
```

This is enormously valuable for a serialized narrative system.

Suppose:

```text
BOG
paranoia = 7
```

That number is almost useless historically.

You really want:

```text
Episode 12:
witnessed betrayal
paranoia +2

Episode 13:
learned false information
paranoia +1

Episode 15:
confrontation resolved
paranoia -1

Episode 17:
new betrayal
paranoia +3
```

Now the system has causality rather than merely state.

---

# 4. I would go further: the event log should become the historical source of truth

I'd architect the database like this:

```text
              IMMUTABLE EVENT LOG
                       │
                       ▼
                PURE REDUCER
                       │
                       ▼
              MATERIALIZED STATE
                       │
                       ▼
                NARRATIVE COMPILER
```

The relational tables can remain.

You don't need to choose between SQL and event sourcing.

The database can maintain a fast materialized state while the event log preserves the actual sequence of mutations.

Then the crucial test becomes:

> Can I destroy the materialized state and recreate it entirely from the event history?

If the answer is yes, you've gained a major property:

**state reconstruction.**

That enables:

* historical audits
* rollback
* branching timelines
* alternative simulations
* debugging
* "what if this event never happened?"
* reconstruction of exactly what the Sower knew at a given point

The file already identifies branching, rollback and historical reconstruction as consequences of event sourcing. 

I'd make that a central invariant rather than an optional benefit.

---

# 5. The reducer has become one of the most sacred components in the system

The document correctly says the reducer should be pure and free of wall-clock time, network access, ambient OS state, and nondeterministic iteration. 

That is absolutely the correct direction.

I would formalize the desired property as:

$$
R(S,E,\sigma)=S'
$$

and insist that:

```text
same S
+
same E
+
same seed
+
same reducer version
=
same S'
```

That means the reducer itself becomes almost mathematical.

I would specifically prohibit it from depending on:

```text
Date.now()
network response
filesystem order
environment variables
locale
machine hostname
uncontrolled random()
floating external service
```

There is an important nuance, however:

### Deterministic iteration is not the same as unordered iteration.

JavaScript `Set` and `Map` have defined iteration semantics, for example, but if insertion order originates from a nondeterministic source, the result can still differ.

So the real rule is:

> **No computation may depend on an ordering whose derivation isn't itself deterministic and recorded.**

That is more precise.

---

# 6. Seed lineage is excellent—but a seed alone does not guarantee deterministic generative output

This is an important nuance I would add.

The file proposes a seed tree using HMAC-SHA256:

$$
Seed_{shot}
=
HMAC\text{-}SHA256(
Seed_{episode},
scene\_id:shot\_id
)
$$



That's a very good design.

It gives you hierarchical randomness:

```text
Episode seed
   ├── Scene A seed
   │      ├── Shot A1
   │      ├── Shot A2
   │      └── Shot A3
   │
   └── Scene B seed
          ├── Shot B1
          └── Shot B2
```

But:

### Same seed ≠ guaranteed same GPU output.

A diffusion model can be seeded identically while different runtime conditions, kernels, precision modes, hardware, or nondeterministic GPU operations still produce different results.

So your true reproducibility tuple must include things such as:

```text
seed
model weights
model config
runtime
GPU architecture
precision
kernel implementation
sampling algorithm
library versions
```

This becomes especially important once you claim "bit-for-bit."

For deterministic software like the event reducer, the seed can be enough.

For stochastic GPU inference, the seed is only **one component of reproducibility**.

---

# 7. The most interesting consequence is that you now have two kinds of randomness

This distinction is worth making explicit.

### Narrative randomness

Examples:

* pairing lottery
* grievance selection
* dice rolls
* leverage decisions

This randomness affects **world state**.

It must therefore be replayable exactly.

### Representational randomness

Examples:

* diffusion sampling
* Foley sample selection
* procedural motion variation
* visual texture generation

This randomness affects **representation**.

It still must be recorded, but it can potentially be regenerated without changing the underlying narrative state.

That distinction allows you to say:

```text
Narrative identity ≠ visual realization identity
```

For example, two valid visual generations might depict the same narrative event without representing two different historical events.

That's a subtle but extremely useful distinction.

---

# 8. "Simulation precedes language" remains one of the strongest ideas

The document says the Sower resolves actions, duels and leverage before an LLM is asked to produce dialogue. 

I think this is absolutely correct.

The model should never be asked:

> "What happens?"

It should instead be asked:

> "Given what happened, how would this character express it?"

That's a fundamental difference.

You can represent it as:

```text
DETERMINISTIC WORLD
      ↓
"What is true?"
      ↓
NARRATIVE CONTRACT
      ↓
"What is allowed to be said?"
      ↓
LLM
      ↓
"How should it be expressed?"
```

This is much safer than using prompt engineering as the primary continuity system.

---

# 9. Ignorance by omission is better than instruction-based secrecy

The document says that information a character doesn't know is removed from the model's context. 

That is a particularly strong idea.

Compare:

```text
ALL WORLD KNOWLEDGE
        ↓
LLM
        ↓
"Don't reveal secret X."
```

with:

```text
CHARACTER'S EPISTEMIC SUBGRAPH
        ↓
LLM
```

The second is substantially stronger.

You are no longer merely asking the model to **behave as though it doesn't know**.

You are reducing the information it can access.

That is basically an information-flow security principle.

It doesn't eliminate every possible inference attack, but it is far superior to relying on instructions alone.

---

# 10. The AST has now become the true center of the entire compiler

The file says:

> Prose is a human-facing byproduct. The AST is the canonical machine contract. 

I agree completely.

This is perhaps the single biggest simplification available to the project.

The architecture should be:

```text
WORLD STATE
   ↓
NARRATIVE COMPILER
   ↓
DIALOGUE AST
   ↓
┌───────────────┬───────────────┬───────────────┐
AUDIO           TIMING          VISUAL          QA
compiler        compiler        compiler        compiler
```

No downstream subsystem should need to understand arbitrary screenplay prose.

That creates a clean compiler boundary.

---

# 11. I would define the AST as an Intermediate Representation in the formal compiler sense

The document already calls it "canonical machine IR."

I'd take that seriously.

That means it should eventually have:

```text
AST schema
schema version
semantic version
migration system
validation
canonical serialization
hash
producer version
```

So an AST isn't just:

```json
{
  "lines": [...]
}
```

It becomes:

```json
{
  "schema_version": "3.2",
  "compiler_version": "...",
  "episode_id": "...",
  "state_snapshot": "...",
  "seed_root": "...",
  "lines": [...]
}
```

That makes the AST itself an artifact with an identity.

---

# 12. Schema migration is absolutely necessary

The file makes this explicit:

> freezing `Episode_XXX.tsx` does not protect against upstream schema drift. 

This is exactly right.

You could perfectly preserve:

```text
Episode_040.tsx
```

yet later discover that:

```text
dialogue_ast v1
```

can no longer be understood by modern infrastructure.

Therefore each durable contract should have:

```text
schema_version
```

and migration functions:

$$
AST_{v1}
\xrightarrow{\mu_{1\to2}}
AST_{v2}
\xrightarrow{\mu_{2\to3}}
AST_{v3}
$$

This is not merely a software nicety.

It's essential to your historical-integrity objective.

---

# 13. I'd impose a stronger rule: never rewrite historical schemas

A very important addition:

If Episode 40 was created from:

```text
AST v1
```

don't silently "upgrade" the archived original to:

```text
AST v3
```

Instead preserve:

```text
original AST v1
```

and, when necessary:

```text
derived migrated AST v3
```

That means historical artifacts remain historically authentic.

The migration itself becomes another transformation with its own hash and provenance.

That is consistent with the entire philosophy of the system.

---

# 14. The dual-clock concept is right, but the terminology can be made more precise

The file describes:

* 24 fps master video clock
* 48 kHz audio precision clock 

The important mathematical relationship is:

$$
\frac{48000}{24}=2000
$$

so one video frame corresponds exactly to:

$$
2000
$$

audio samples at 48 kHz.

That is an extraordinarily convenient relationship.

So:

$$
SampleIndex=Frame\times2000
$$

is correct.

But I'd describe the audio side as a **sample-index/timebase domain** rather than a "continuous sample clock."

Samples themselves are discrete.

Timestamps may be represented continuously.

That terminology matters because eventually you'll need to distinguish:

```text
sample index
timestamp
duration
frame index
presentation timestamp
```

---

# 15. The multi-resolution bridge is one of the most practically valuable additions

The file correctly points out that 24 fps isn't sufficient for all audio-visual relationships. 

At 24 fps:

$$
1 frame = 41.67 ms
$$

That's fine for:

* cuts
* camera moves
* character poses
* broad mouth shapes

But it can be too coarse for:

* phonemes
* consonant attacks
* transient Foley
* musical percussion
* precise sound effects

So the correct architecture is:

```text
                    AUDIO DOMAIN
               48,000 samples/sec
                       │
                       │ projection
                       ▼
                 VIDEO DOMAIN
                  24 frames/sec
```

The audio system maintains the precise timing.

The compositor samples that information into frame-space.

That is much better than forcing all timing into frames prematurely.

---

# 16. This also changes how lip-sync should be designed

The document says phoneme and viseme timestamps should be stored relative to the audio stem root. 

I think that's exactly right.

Instead of:

```text
viseme = wide at frame 13
```

store:

```text
phoneme marker
sample offset = 26,742
```

Then derive:

```text
frame ≈ sample / 2000
```

for the video layer.

That gives you a much richer source of truth.

Later you can produce:

* 24 fps animation
* 30 fps animation
* 60 fps previews
* alternate editorial cuts

from the same acoustic timing.

This is a much more future-proof representation.

---

# 17. Source baking remains an excellent solution—but it should be viewed as compilation, not copying

The document describes generating a dedicated TSX composition with literal frame and camera values. 

The deeper idea is:

> The episode becomes an executable compiled artifact.

That's much better wording than "the template creates a copy."

Conceptually:

```text
INPUT IR
   ↓
COMPILER
   ↓
Episode_040.tsx
```

The TSX is analogous to compiled output.

This immediately suggests useful compiler practices:

* optimization
* dead-code elimination
* dependency analysis
* static validation
* reproducible builds
* source maps
* provenance
* deterministic compilation

And the file already points toward DAG-based incremental compilation. 

---

# 18. The DAG invalidation proposal is extremely powerful

This may become one of the most important operational improvements as the project grows.

The document proposes:

> if a particular fact changes, determine the exact downstream scenes affected and rebuild only those. 

That's exactly how mature build systems work.

Think:

```text
Character arm injury
        │
        ▼
Scene 17 depends on injury
        │
        ▼
Scene 17 dirty

Scene 18 does not reference injury
        │
        ▼
Scene 18 remains clean
```

That prevents the nightmare scenario:

> "One canon correction requires regenerating the entire series."

---

# 19. But the DAG only works if dependencies are explicit

This is the catch.

If Scene 17 *implicitly* depends on a fact but the dependency graph doesn't know that, invalidation will be incorrect.

Then you get:

```text
fact changed
   ↓
DAG says nothing depends on it
   ↓
scene remains "clean"
   ↓
historical inconsistency
```

So dependency declarations need to be treated as contracts.

Each scene should be able to declare something like:

```text
depends_on:
  - character.bog.condition.shoulder
  - relation.bog.spline.resentment
  - location.swamp.weather
```

Then the build graph becomes auditable.

---

# 20. I would add dependency fingerprints

Rather than only storing:

```text
scene depends on fact X
```

store:

```text
scene consumed fact X at version/hash H
```

Then the compiler can immediately detect:

```text
current fact hash != consumed fact hash
```

and mark the scene dirty.

This gives you much stronger cache validation.

You then have a clean incremental compiler model:

$$
SceneHash=
H(
AST,
Dependencies,
Assets,
Compiler
)
$$

If the hash hasn't changed, don't rebuild.

That's potentially a massive efficiency gain.

---

# 21. The "asymmetric lossless preservation" idea is correct in principle—but the wording needs correction

The file says:

> Master Preserve: ProRes 4444 / WebM Alpha + 24-bit 48kHz stems

and describes this as lossless preservation. 

The architectural point is excellent:

> **Do not make the compressed delivery MP4 your archival master.**

But technically, the wording should be more precise.

Apple identifies ProRes 4444 as a codec designed for high-quality imagery and alpha, but it is not the same thing as mathematically lossless raw video. ([Apple Developer][1])

So I'd call this:

> **high-fidelity archival mezzanine**

rather than simply:

> **lossless master**

And "uncompressed WebM VP9" is not a useful description because VP9 is itself a video codec. The important distinction is between:

* mathematically lossless
* visually lossless/high-fidelity
* compressed delivery

That terminology should be corrected.

---

# 22. The preservation architecture should therefore have three levels

I would use:

```text
SOURCE
  ↓
ARCHIVAL MASTER
  ↓
DELIVERY DERIVATIVE
```

Where:

### Source

Includes:

* AST
* event log
* state snapshot
* assets
* manifests
* generation configuration
* source-baked composition

### Archival master

A high-quality media representation preserving:

* picture
* alpha where relevant
* audio stems
* metadata

### Delivery derivative

Platform-specific:

* H.264
* HEVC
* social crop
* broadcast deliverable
* streaming deliverable

This protects the project from future distribution requirements.

---

# 23. The audio master should remain stem-based

This is particularly valuable.

Don't preserve only:

```text
finished_audio.wav
```

Preserve:

```text
dialogue
music
effects
ambience
M&E
```

separately.

Then you can later:

* remix
* revoice
* change loudness
* create international versions
* create accessibility mixes
* replace music
* correct a dialogue line

without regenerating picture.

This is what makes the archive truly useful rather than merely nostalgic.

---

# 24. The "5-point tracer bullet" is exactly the right next step

The document is emphatic that more architecture documentation now has diminishing returns. 

I agree.

The minimum chain is:

```text
Canon / State
      ↓
Sower AST
      ↓
TTS
      ↓
ffprobe timing
      ↓
TSX stamping
      ↓
Remotion
      ↓
MP4
```

That is the right experiment.

But I would make the test slightly more rigorous than the file currently specifies.

---

# 25. The tracer bullet should test three separate kinds of reproducibility

The current checklist includes:

> SHA-256(Render_A) == SHA-256(Render_B) 

That's good, but I would test:

### A. Semantic reproducibility

Same source state → same AST.

```text
AST_A == AST_B
```

### B. Media reproducibility

Same AST and build → same audio/video content.

```text
media_hash_A == media_hash_B
```

### C. Packaging reproducibility

Same streams → identical final container bytes.

```text
mp4_hash_A == mp4_hash_B
```

These are separate problems.

For example, the video encoder could produce the exact same frames while the MP4 differs because of metadata or muxer behavior.

---

# 26. The final MP4 hash isn't necessarily the best first proof

A subtle point:

Suppose two MP4 files have different hashes.

That doesn't immediately tell you whether:

```text
frames differ
```

or:

```text
metadata differs
```

or:

```text
muxing differs
```

So the tracer bullet should compare progressively:

```text
AST
 ↓
audio stream hash
 ↓
decoded frame sequence
 ↓
encoded video stream
 ↓
container
```

That tells you where nondeterminism actually entered.

`ffprobe` is well suited to inspecting stream/container properties in a machine-readable way. ([FFmpeg][2])

---

# 27. I would add a "reproducibility ladder"

Instead of treating reproducibility as simply:

```text
identical
or
not identical
```

use:

```text
Level 0 — same intent
Level 1 — same AST
Level 2 — same timing
Level 3 — same decoded media
Level 4 — same encoded streams
Level 5 — same container bytes
```

Then you can diagnose exactly what the system guarantees.

This matters because exact binary equality might not be achievable across every hardware configuration, while semantic and perceptual equality may still be excellent.

---

# 28. "Zero narrative authority" needs one qualification

The document states that generative models have zero narrative, spatial and temporal authority. 

Architecturally, that is the right goal.

But practically, a model can still introduce unauthorized facts unless its output is checked.

For example, an LLM could produce:

> "Bog grabs the rifle."

even though the AST contains no rifle and Bog's condition prohibits that action.

So the system needs:

```text
CONTRACT
   ↓
MODEL OUTPUT
   ↓
VERIFIER
   ↓
ACCEPT / REJECT
```

rather than:

```text
CONTRACT
   ↓
MODEL OUTPUT
   ↓
trust
```

This is why the token-attribution verification idea is important.

The stronger formulation is:

> **The generative model has no *recognized authority*. Any unauthorized deviation is treated as a compile failure.**

That's much more defensible.

---

# 29. The verifier should be defense-in-depth rather than one magical semantic checker

The token-attribution proposal is useful, but natural language is too ambiguous to rely on one parser.

I would use several independent checks:

```text
AST
 ↓
schema validator
 ↓
state constraint validator
 ↓
lexical / dependency analysis
 ↓
rule-based semantic checks
 ↓
optional model-based critic
```

The important thing is that the final authority remains deterministic rules.

A secondary AI critic can find suspicious things.

It should not be the judge of truth.

---

# 30. The system should distinguish "invalid" from "uncertain"

This is another useful addition.

Suppose the visual verifier detects:

> possible misplaced foot anchor.

That is different from:

> foot anchor definitely outside canvas.

So QA statuses should include:

```text
PASS
FAIL
WARN
UNKNOWN
REQUIRES_REVIEW
WAIVED
```

That creates an intelligent workflow without pretending automated inspection is perfect.

---

# 31. The architecture is beginning to resemble a reproducible build system more than a media system

This is perhaps the biggest conceptual discovery in the file.

Once you have:

* immutable inputs
* versioned schemas
* deterministic reducers
* event logs
* dependency DAGs
* content hashes
* compiler IR
* generated source
* artifact manifests
* reproducibility tests

the system starts looking a lot like:

```text
Bazel / Nix / compiler / CI system
```

with **narrative state and media as the domain-specific payload**.

That realization is valuable because you don't have to reinvent every build-system concept.

You need a **domain-specific compiler sitting on top of mature build principles**.

---

# 32. One further improvement: use reproducible-build principles for the entire episode

The build should ideally behave like:

$$
Output = Build(Source,Inputs,Environment)
$$

not:

$$
Output = Build(Source,Whatever\_the\_machine\_currently\_contains)
$$

Therefore the environment itself should be declarative.

Capture:

```text
Node version
package lockfile
Chromium version
FFmpeg version
OS/container digest
fonts
GPU/runtime mode
model weights
model configuration
environment variables
render flags
locale/timezone
```

Especially:

### Fix locale and timezone.

This is a surprisingly common source of nondeterminism.

Dates, string formatting, decimal formatting, sorting, and text rendering can change with environment.

---

# 33. Font files deserve special status

The document mentions font substitution as an artifact-hardening failure. 

I would go further:

> **Fonts are executable rendering dependencies.**

A missing or substituted font can alter:

* text width
* wrapping
* glyph metrics
* subtitles
* captions
* overlays
* even layout calculations

Therefore font files should be:

* versioned
* hashed
* packaged
* validated before render

rather than treated like optional desktop environment resources.

---

# 34. The dependency DAG should include the environment

The proposed DAG is currently described largely around story facts and scene ASTs. 

I'd expand it:

```text
Canon fact
State fact
Event
AST
Asset
Audio
Font
Compiler
Renderer
Container
Model
```

Then the final artifact becomes a node whose dependency graph ultimately reaches every relevant input.

That gives you a complete answer to:

> "Why is this file different?"

You find the first ancestor whose hash changed.

---

# 35. Every artifact should have a parentage record

This may be the most important addition I would make.

Every durable artifact should record:

```text
artifact_id
artifact_type
schema_version
producer_version
parent_artifact_ids
content_hash
creation_seed
build_id
```

Then you can walk the graph backward.

For example:

```text
master.mp4
    ↓
render build
    ↓
Episode_040.tsx
    ↓
exposure_sheet
    ↓
dialogue_ast
    ↓
event sequence
    ↓
world state
    ↓
canon
```

That is **causal provenance**.

It is much better than a single giant `render_manifest.json`.

---

# 36. The build manifest should therefore be a graph, not merely a list

A flat manifest says:

```json
{
  "assets": [...],
  "commits": [...]
}
```

A provenance graph says:

```text
MASTER
 ├── VIDEO
 │    ├── TSX
 │    ├── VISUAL IR
 │    └── ASSETS
 │
 ├── AUDIO
 │    ├── DIALOGUE
 │    ├── MUSIC
 │    └── FOLEY
 │
 └── BUILD ENVIRONMENT
      ├── CHROMIUM
      ├── NODE
      ├── FFMPEG
      └── FONTS
```

That supports much stronger auditing.

---

# 37. One of the most useful concepts here is "blast radius"

The DAG proposal lets you answer:

> **What breaks if this fact changes?**

That is an exceptionally powerful capability for a serialized AI production system.

Imagine discovering:

> "This character's canonical injury was wrong."

Without dependency analysis:

```text
Possibly hundreds of episodes need inspection.
```

With dependency analysis:

```text
Fact X
 ↓
Scenes 17, 23, 41
 ↓
Shots 17.3, 23.2, 41.8
 ↓
Assets A, B
 ↓
renders R1, R2
```

Now you have an exact blast radius.

That turns continuity correction from a crisis into a build operation.

---

# 38. There should also be a "blast radius explanation"

I'd add a CLI concept such as:

```text
why-dirty character.bog.shoulder
```

and the system should return:

```text
BOG.SHOULDER changed
  ↓
Character state changed
  ↓
Scene 040/003 depends on shoulder state
  ↓
Shot 040/003/02 references BOG
  ↓
dialogue AST invalidated
  ↓
audio invalidated
  ↓
visual plan invalidated
  ↓
Episode_040 requires rebuild
```

That would be an extraordinary debugging tool.

---

# 39. The grievance graph is more powerful than simply having a database of grievances

The document's event-sourced narrative model naturally suggests a dynamic relationship graph.

I'd represent relationships as typed edges:

```text
BOG ──resentment──> SPLINE
BOG ──debt────────> MOSS
ELIAS ──secret─────> BOG
CAMP ──fear───────> BOG
```

Each edge could have:

```text
strength
origin event
last triggered
cooldown
visibility
known by
expiration
```

Now the story engine isn't simply asking:

> "What grievance exists?"

It can ask:

> "Which relationship is under enough pressure that this state makes this scene possible?"

That's considerably richer.

---

# 40. I would make "epistemic state" first-class

The file already treats epistemic horizons as part of world state. 

I think that deserves special importance.

There are really three kinds of state:

```text
PHYSICAL STATE
Where bodies are and what condition they're in.

RELATIONAL STATE
Who owes what to whom.

EPISTEMIC STATE
Who knows what about whom.
```

The third is especially important for narrative.

Two characters can occupy exactly the same physical world while having completely different accessible realities.

That is where much of dramatic tension comes from.

---

# 41. The system therefore has something like an "epistemic firewall"

A character's model context should be constructed from:

```text
World Truth
      ↓
What Character Knows
      ↓
What Character May Infer
      ↓
Prompt Context
```

Never:

```text
World Truth
      ↓
Prompt Context
```

That is a very strong architecture.

I would formalize:

$$
Context_{character}
=
Projection(WorldState, KnowledgeState, PerceptionRules)
$$

Then "ignorance by omission" becomes a deterministic compiler operation, rather than a writing instruction.

---

# 42. The system should preserve "why the model was allowed to know something"

That sounds subtle, but it becomes important later.

If the character suddenly knows:

> Spline stole the brass object.

the provenance system should be able to say:

```text
Character learned secret
because Event #483 occurred
in Episode 27
at Scene 4
```

Then epistemic state itself becomes auditable.

That is substantially better than simply storing:

```text
bog.knows["stolen_brass"] = true
```

without explaining when or why it changed.

---

# 43. The final artifact should therefore have three histories

This architecture is converging on three parallel historical ledgers:

### World history

What happened?

### Epistemic history

Who learned what?

### Media history

How was what happened represented?

Those are related but not identical.

That distinction is worth making explicit.

---

# 44. I would treat media representation as a projection, not a mutation of state

This is another subtle but important boundary.

Rendering should not do:

```text
render character
 ↓
character becomes physically injured
```

Instead:

```text
world state
 ↓
rendering reads state
 ↓
visual representation
```

Rendering must be read-only with respect to narrative truth.

Otherwise the media layer can contaminate the simulation layer.

That is one reason the unidirectional architecture is so valuable.

---

# 45. The final architectural law should be one-way data flow

I would codify:

```text
CANON
  ↓
STATE
  ↓
EVENTS
  ↓
NARRATIVE IR
  ↓
TEMPORAL IR
  ↓
VISUAL IR
  ↓
SOURCE
  ↓
RENDER
  ↓
ARTIFACT
```

and strongly resist reverse dependencies such as:

```text
render → state
visual model → canon
LLM prose → canonical facts
delivery metadata → narrative state
```

The fewer backward arrows you have, the more understandable the system becomes.

---

# 46. The source-baked episode is essentially a "sealed executable explanation"

This is the deeper meaning of `Episode_XXX.tsx`.

It is not merely code used to make the episode.

It is an executable description of:

> **how the episode was intended to be represented.**

That's why freezing it is so useful.

The episode source itself becomes part of the archive.

---

# 47. The `@generated / @patched / @locked` lifecycle is therefore a very good human-computer contract

The file identifies those lifecycle states and checksum protection. 

That recognizes something important:

Automation and human creativity are not mutually exclusive.

You need a mechanism for:

```text
automation creates
human edits
automation validates
human locks
```

rather than pretending everything can remain purely automatic.

I would make the transitions explicit:

```text
@generated
    ↓
@patched
    ↓
@reviewed
    ↓
@locked
```

with every transition recorded.

---

# 48. Human intervention itself should become an auditable event

This is a major addition.

Suppose a director changes:

```text
camera zoom from 1.04 → 1.08
```

That shouldn't merely alter the file.

It should create an event:

```json
{
  "type": "DIRECTOR_OVERRIDE",
  "target": "shot_040_003",
  "property": "camera.scale",
  "from": 1.04,
  "to": 1.08,
  "actor": "...",
  "reason": "emotional emphasis"
}
```

Now even manual intervention has provenance.

That means:

> human judgment becomes part of the event-sourced system rather than an opaque exception.

This is an important conceptual completion.

---

# 49. The tracer bullet should therefore test manual intervention too

The first 3-second build could eventually test:

```text
generate
 ↓
render
 ↓
manual adjustment
 ↓
mark @patched
 ↓
checksum
 ↓
rerender
 ↓
verify patch survived
```

That would validate the whole human/automation boundary.

---

# 50. The most important thing to verify physically is not performance—it is contract integrity

The file correctly says the tracer bullet will expose:

* audio synchronization
* asset paths
* compositor performance 

I would add:

* schema validation
* seed replay
* source-baking determinism
* environment capture
* provenance chain
* double-render behavior

Performance is useful.

But the fundamental question is:

> **Does the architecture actually preserve its promises across a complete real build?**

---

# 51. The minimum tracer-bullet should therefore prove eight things

I'd make the acceptance criteria:

```text
1. Canon/state resolves deterministically.

2. Event replay reproduces the same state.

3. AST validates against a versioned schema.

4. Audio timing produces exactly the expected frame budget.

5. Source baking produces the expected TSX.

6. The renderer produces valid media.

7. A clean second build reproduces the result.

8. Every artifact can be traced back to its inputs.
```

That is a much better definition of "first success" than merely getting an MP4.

---

# 52. One technical correction: `ffprobe` is an observer, not the timing authority

The file appropriately uses `ffprobe` for measuring media properties. `ffprobe` is explicitly designed to inspect multimedia streams and emit machine-readable format and stream information. ([FFmpeg][3])

But conceptually:

```text
TTS generated the audio.
ffprobe measured it.
compiler decided how to quantize it.
```

That distinction is useful.

`ffprobe` should not become a mysterious "clock."

The audio file is the source of timing truth.

`ffprobe` is the trusted measurement instrument.

---

# 53. Another subtle point: 24 fps is a policy, not a law of nature

The architecture treats 24 fps as the master video clock.

That's perfectly reasonable.

But I'd represent it as:

```text
delivery_profile.master_fps = 24
```

rather than making 24 fps an immutable fundamental law.

Then the architecture remains compatible with:

* 23.976
* 25
* 29.97
* 30
* 48
* 60

without changing the underlying semantic model.

The underlying invariant should be:

> **a discrete integer presentation timeline**

not:

> **24 fps forever**.

---

# 54. The same principle applies to resolution

Likewise:

```text
1280×720
1920×1080
1080×1920
3840×2160
```

are rendering profiles.

Character coordinates should ideally exist in a normalized or local coordinate space and be transformed at compile time.

That is consistent with the earlier `anchor_point` / camera-anchor concept.

The visual semantic contract should not be unnecessarily coupled to one final canvas.

---

# 55. I would separate semantic coordinates from presentation coordinates

For example:

```text
SEMANTIC:
"face center"
"ground contact"
"character local origin"

PRESENTATION:
1920×1080 coordinate
1080×1920 coordinate
camera crop
zoom
```

Then the manifest can say:

```text
face_target = local coordinate
```

and the compiler translates that to the final composition.

That makes the asset system much more reusable.

---

# 56. The most powerful concept now emerging is "provenance as a graph"

The architecture contains:

```text
event log
AST
timing
assets
source code
render
manifest
```

The logical next step is to connect them.

For every artifact:

```text
artifact
  ├── produced_by
  ├── derived_from
  ├── validated_by
  ├── supersedes
  └── modified_by
```

Then the entire episode becomes a provenance graph.

You can ask:

> Why is this shot 74 frames long?

and trace:

```text
shot
→ exposure sheet
→ WAV
→ TTS configuration
→ AST line
→ event
→ world state
```

That is vastly more valuable than simply knowing what version of the renderer was used.

---

# 57. The build ID should therefore be a graph root, not just a hash

The file proposes a build identity through hashes and toolchains.

I would make the concept:

```text
EPISODE BUILD ID
        │
        ├── source graph
        ├── dependency graph
        ├── environment
        ├── stochastic seeds
        ├── QA results
        └── outputs
```

The hash identifies the build.

The graph explains the build.

You need both.

---

# 58. The archive should preserve the failed attempts too

This is a subtler idea.

Your document already values rejection ledgers elsewhere in the architecture.

The same principle should apply to builds.

If:

```text
render attempt 1 → fail
render attempt 2 → patch
render attempt 3 → pass
```

don't necessarily destroy attempts 1 and 2.

Record:

```text
attempt
reason
input hash
failure
patch
result
```

This creates a development history that can reveal systemic problems.

You don't need to archive enormous failed media assets forever, but the **failure metadata** can be extremely valuable.

---

# 59. The project should distinguish "historical truth" from "current preferred rendering"

This will become very important.

Suppose an old episode was rendered with:

```text
camera easing v1
```

and five years later you determine:

```text
camera easing v5
```

is aesthetically superior.

You must be able to maintain:

```text
HISTORICAL BUILD
```

and:

```text
CURRENT REMASTER
```

as separate entities.

Otherwise a "cleanup" becomes historical alteration.

So:

```text
Episode 040 original
Episode 040 remaster
```

must not be treated as the same build.

---

# 60. That leads to a useful distinction: replay versus remaster

### Replay

> Produce exactly what the historical build produced.

### Remaster

> Produce a deliberately different representation using altered presentation rules.

Both are valid.

But they must have different identities.

This protects the very historical integrity the source architecture is trying to establish.

---

# 61. The architecture can now support controlled alternate realities

Because you have:

* event logs
* deterministic reducers
* seed lineage
* dependency graphs

you can create a branch:

```text
MAIN
  │
  ├── Episode 20
  ├── Episode 21
  └── Episode 22

WHAT-IF BRANCH
  │
  ├── Episode 20
  └── alternate Episode 21
```

Then compare resulting state trajectories.

That is potentially a major creative tool.

You don't have to generate alternate videos to use it.

You can simulate:

> "What if this character had spent the String?"

and observe the downstream narrative consequences.

---

# 62. The system is becoming a narrative simulator with a media compiler attached

This is perhaps the most profound reinterpretation.

At first glance, the project appears to be:

> an AI video production pipeline.

But the architecture is increasingly:

> **a deterministic social/narrative simulation whose current state can be projected into media.**

That is much more powerful.

The renderer is one output channel.

You could theoretically generate:

```text
episode screenplay
audio drama
animation
game state
interactive narrative
episode summary
character timeline
continuity graph
```

from the same underlying event/state system.

That means the narrative engine should be protected from being accidentally designed around video-specific assumptions.

---

# 63. The most valuable abstraction is therefore not "video"

It's:

> **world-state projection.**

The same state can produce:

```text
screenplay
audio
visual scene
interactive scene
analytics
continuity report
```

That gives the architecture long-term flexibility.

---

# 64. The one thing I would strongly resist is letting media requirements flow backward into the Sower

For example:

Bad:

```text
video model requires 53 frames
      ↓
story changes timing to fit model
```

Better:

```text
story determines duration
      ↓
audio determines master timing
      ↓
backend adapter conforms model to timing
```

The media machinery should adapt to narrative truth.

Not the reverse.

This is exactly why the backend adapter principle is so valuable.

---

# 65. Same with assets

Bad:

```text
only available image is "angry"
      ↓
make character angry
```

Better:

```text
character is humiliated
      ↓
asset system finds valid representation
      ↓
if none exists → fail / fallback according to policy
```

The available asset should not rewrite the state.

That is a key integrity rule.

---

# 66. Same with TTS

Bad:

```text
TTS sounds bad
      ↓
change dialogue
```

Better:

```text
canonical dialogue
      ↓
TTS attempt
      ↓
quality failure
      ↓
regenerate / switch TTS configuration
```

The media executor adapts.

The semantic contract stays stable.

---

# 67. This suggests a general rule for every downstream worker

Every worker should satisfy:

$$
InputContract
\rightarrow
CandidateOutput
\rightarrow
Validator
\rightarrow
AcceptedArtifact
$$

Never:

$$
InputContract
\rightarrow
UntrustedOutput
\rightarrow
Truth
$$

That's the heart of the entire system.

---

# 68. The best final wording for the architecture, in my view, is this

I would summarize the complete system as:

> **An event-sourced narrative state machine compiled through deterministic intermediate representations into reproducible media builds.**

And the AI components are:

> **probabilistic execution engines operating behind deterministic contracts.**

That's more precise than "AI video generator," and more revealing.

---

# 69. What I would now regard as the genuine non-negotiable invariants

After combining everything in this third document, I think the architecture ultimately rests on these principles:

**World truth is deterministic.**

Canon, state and historical events are not authored by generative models.

**History is reconstructible.**

Current state can be regenerated from ordered events.

**Randomness is explicit.**

Every stochastic decision has a recorded seed lineage.

**The reducer is pure.**

No hidden clocks, network calls or ambient environment.

**The AST is canonical.**

Prose is a projection.

**Information access is constrained.**

Characters receive only appropriate epistemic context.

**Time has multiple resolutions.**

Audio remains sample/timebase precise; video becomes integer-frame based.

**Media backends are adapters.**

Model-specific constraints never become world-level rules.

**Episodes are compiled artifacts.**

They aren't merely runtime interpretations of mutable data.

**Schemas evolve explicitly.**

Old data remains readable or is deterministically migrated.

**Dependencies are explicit.**

A changed fact creates a calculable blast radius.

**Provenance is graph-shaped.**

Every artifact can identify its parents.

**Rendering is read-only with respect to narrative truth.**

The visual system cannot silently mutate the world.

**Archival masters are separate from delivery derivatives.**

The MP4 is not the ultimate historical record.

**Human intervention is itself recorded.**

Manual creative decisions become auditable events.

**Reproducibility is measured.**

It is an empirical property, not an assumption.

Those are the actual architecture.

Everything else—Remotion, Chromium, FFmpeg, Cloudflare, specific GPUs, specific diffusion models—is replaceable implementation.

---

# 70. And the most important next experiment

I agree with the file that specification has now reached diminishing returns. 

The next experiment should be the three-second tracer bullet.

But I would define its purpose more precisely:

> **Prove that one event can travel from world state through the entire compiler and emerge as a reproducible, explainable media artifact.**

The ideal test is:

```text
Canon
 ↓
State snapshot
 ↓
Event
 ↓
Pure reducer
 ↓
Dialogue AST
 ↓
TTS WAV
 ↓
Sample/frame timing
 ↓
Visual contract
 ↓
Generated TSX
 ↓
Render
 ↓
QA
 ↓
Archived master
```

Then do it a second time from a clean environment.

You want to be able to answer **yes** to all of these:

```text
Did the same event produce the same state?

Did the same state produce the same AST?

Did the same AST produce the same timing?

Did the same inputs produce the same source?

Did the same build produce the same media?

Can every output be traced back to its inputs?

Can the result be replayed after the working environment is destroyed?
```

That is the real proof.

Not "the renderer worked."

Not "the MP4 exists."

Not "the AI generated something convincing."

The proof is:

> **the system preserved identity and causality across the complete transformation.**

That is what makes this architecture genuinely interesting.

And one technical point from the source deserves to be corrected in the specification before implementation: describe ProRes 4444 as a **high-fidelity archival mezzanine**, not simply a mathematically "lossless" format; Apple identifies it as a distinct ProRes 4444 codec with alpha support, but "lossless" should be reserved for a clearly defined preservation format and tested claim. ([Apple Developer][1])

[1]: https://developer.apple.com/documentation/avfoundation/avvideocodectype/prores4444?utm_source=chatgpt.com "proRes4444 | Apple Developer Documentation"
[2]: https://ffmpeg.org/ffprobe.html?utm_source=chatgpt.com "ffprobe Documentation"
[3]: https://www.ffmpeg.org/ffprobe-all.html?utm_source=chatgpt.com "ffprobe Documentation"
Yes. This version has reached the point where the architecture can be expressed much more cleanly than the raw specification. There is a lot of useful material in it, but the real value is concentrated in a relatively small number of principles.

My strongest reading is this:

> **The system should be a deterministic, event-sourced world model that is compiled into media, with probabilistic models acting only as constrained workers and with every durable transformation carrying enough identity and provenance to be replayed, audited, or deliberately superseded.**

The most important thing is not Remotion, TTS, diffusion, FFmpeg, Cloudflare, or even the particular 24-fps choice. Those are implementation mechanisms. The durable architecture is the separation of **truth → state → events → computation → representation → preservation**.

---

# 1. The fundamental law is the right one

The strongest statement in the document is:

> **“Probabilistic systems propose and execute; deterministic systems decide what is allowed to be true.”**

That captures almost the entire architecture.

The file defines the system as an event-sourced deterministic media compiler rather than an AI video generator, and deliberately gives LLMs, diffusion systems, and audio synthesizers no authoritative role in narrative, spatial, or temporal truth. 

That distinction should govern every future design decision.

A clean implementation looks like:

```text id="a7s5c1"
DETERMINISTIC WORLD
        │
        │ "What is true?"
        ▼
DETERMINISTIC COMPILER
        │
        │ "What representation is permitted?"
        ▼
PROBABILISTIC WORKER
        │
        │ "Produce a candidate execution."
        ▼
DETERMINISTIC VALIDATOR
        │
        ├── reject
        └── accept
```

The dangerous architecture is:

```text id="y48j9g"
WORLD
  ↓
LLM
  ↓
whatever the LLM says becomes true
```

Your architecture explicitly rejects that.

That is not merely a stylistic preference. It is what makes continuity, replay, debugging, and historical preservation possible.

---

# 2. The four ontological tiers are the real backbone

The document's separation into:

1. **Canon**
2. **State**
3. **Event**
4. **Media projections**

is excellent. 

I would make that the permanent conceptual model:

```text id="r3i6g4"
CANON
  │
  │ constrains
  ▼
STATE
  │
  │ changed by
  ▼
EVENTS
  │
  │ reduced by
  ▼
NEW STATE
  │
  │ projected into
  ▼
MEDIA
```

Each is fundamentally different.

### Canon

What is legally/physically/ontologically true about the world.

Examples:

* character physiology
* established locations
* canonical relationships
* immutable rules
* physical constraints

### State

What is true **now**.

Examples:

* current position
* current injury
* current resentment
* current secrets known
* current inventory

### Event

What caused the state to change.

Examples:

* duel resolved
* secret learned
* injury inflicted
* object transferred
* relationship changed

### Media

How that truth was represented at a particular moment.

Examples:

* screenplay
* audio
* exposure sheet
* TSX
* rendered master
* delivery MP4

That last distinction is extraordinarily important.

---

# 3. “Media is never state” is one of the most important invariants

The document explicitly says that screenplays, exposure sheets, Remotion compositions, and rendered videos are projections of truth rather than truth itself. 

I would make this a hard rule:

> **No downstream media artifact may silently mutate upstream world truth.**

So:

```text id="5y9n3f"
camera adjustment
      ≠
story change
```

and:

```text id="2q8vnu"
new audio recording
      ≠
new narrative event
```

and:

```text id="38t3de"
remastered color grade
      ≠
new historical world state
```

This gives you an enormously useful separation between **historical reality** and **editorial representation**.

It also means you can have multiple legitimate representations of the same event:

```text id="6x4hke"
EVENT 184
   ├── original edit
   ├── director's cut
   ├── remaster
   ├── alternate-language dub
   └── promotional clip
```

without pretending these are different world histories.

---

# 4. But I would refine the “deletion principle”

The document says, in effect, that if neural networks disappear, the universe remains logically consistent, but generated media assets need the archive because diffusion cannot simply be recreated from seeds. 

The underlying insight is excellent:

> **Narrative truth must not depend on the continued existence of a particular AI model.**

That should absolutely be a requirement.

I would formulate it as:

### The logical world must be model-independent.

You should be able to delete:

* LLM A
* diffusion model B
* TTS model C

and still reconstruct:

* canon
* state
* events
* AST
* timing intent
* visual contracts
* provenance

even if you can no longer regenerate the exact neural media.

That is an important distinction:

```text id="et6x8k"
WORLD RECONSTRUCTION
must survive model extinction.

MEDIA REGENERATION
may depend on archived models/checkpoints/assets.
```

That is a very strong archival principle.

---

# 5. The two-axis model is more important than the six-stage model

The six pipeline stages are operationally useful.

But the two axes are conceptually stronger:

```text id="2i0bx8"
AXIS A
semantic transformation

WORLD
 → narrative
 → temporal
 → visual


AXIS B
artifact hardening

event/reducer
 → source
 → execution
 → verified artifact
```

The document uses this distinction to create a diagnostic taxonomy. 

I think this is one of the most useful additions you've arrived at.

Why?

Because it gives every error a **home**.

For example:

```text id="b4z6bg"
wrong character knowledge
        ↓
semantic compiler

wrong timing
        ↓
temporal compiler

wrong facial anchor
        ↓
visual compiler

missing font
        ↓
execution environment

same inputs, different binary
        ↓
reproducibility / packaging
```

That avoids the disastrous debugging habit of calling every failure "a rendering problem."

---

# 6. I would add one more axis: authority

There is another dimension hiding underneath everything:

```text id="rmz6wc"
WHO IS ALLOWED TO DECIDE THIS?
```

For example:

| Decision               | Authority                           |
| ---------------------- | ----------------------------------- |
| Canonical anatomy      | Canon                               |
| Current injury         | State/Event system                  |
| Winner of conflict     | Sower/reducer                       |
| Character knowledge    | Epistemic state                     |
| Shot duration          | Timing compiler                     |
| Asset identity         | Visual manifest                     |
| Camera realization     | Presentation compiler               |
| Generated image pixels | Diffusion worker                    |
| Final acceptance       | Deterministic QA + authorized human |

That makes authority explicit.

A good architecture shouldn't merely say what each component **does**.

It should say what each component **is allowed to decide**.

---

# 7. The event-sourced reducer is the true historical engine

The formula:

$$
S_{n+1}=\mathcal{R}(S_n,E_n,\sigma_n)
$$

is the heart of the world model. 

The key property isn't really the equation itself.

It is:

> **Given the same starting state, event, seed, and reducer implementation, the resulting next state must be identical.**

That creates replayability.

And with the ordered event stream, you get:

$$
S_N=
\mathcal{R}(
\cdots
\mathcal{R}(
\mathcal{R}(S_0,E_1,\sigma_1),
E_2,\sigma_2),
\ldots,
E_N,\sigma_N)
$$

as the historical reconstruction mechanism. 

That is much more important than having a nice database schema.

The database is just the efficient working view.

The **ordered event history is the explanation of how the world became what it is**.

---

# 8. State and events should not be confused

This distinction deserves special emphasis.

Bad historical representation:

```text id="gp06y5"
Bog:
  paranoia = 7
```

Better:

```text id="n2mps6"
EP12:
  witnessed betrayal
  paranoia +2

EP13:
  discovered false information
  paranoia +1

EP15:
  confrontation resolved
  paranoia -1

EP19:
  new betrayal
  paranoia +3
```

Current state tells you **what**.

Events tell you **why**.

That makes the system explainable.

---

# 9. I would make the event log the authoritative history and the relational database a materialized view

This is an important implementation refinement.

You don't need to abandon SQLite/PostgreSQL.

Use:

```text id="5e1f7e"
IMMUTABLE EVENT LOG
        ↓
PURE REDUCER
        ↓
MATERIALIZED RELATIONAL STATE
```

The relational state exists for speed.

The event stream exists for history.

Then you gain the ability to:

* rebuild the state database
* audit historical transitions
* create branches
* perform what-if simulations
* identify why a character changed
* recover after database corruption

That is one of the strongest consequences of the design.

---

# 10. The reducer should be almost mathematically boring

The document says the reducer must not access:

* `Date.now()`
* network
* ambient environment
* nondeterministic hash-map ordering. 

Correct.

The more boring the reducer is, the better.

Ideally:

```text id="9u5c4p"
reduce(state, event, seed)
```

has no side effects.

No network.

No file reads.

No random global state.

No hidden state.

No external service calls.

No clock.

No "current model."

This is one part of the system where purity should be treated almost as a sacred constraint.

---

# 11. Seed lineage is good—but randomness must be classified correctly

The split between **narrative randomness** and **representational randomness** is excellent. 

### Narrative randomness

Changes what the world *is*.

Examples:

* conflict selection
* dice
* leverage expenditure
* probabilistic state transitions

This absolutely needs deterministic replay.

### Representational randomness

Changes how an established event is depicted.

Examples:

* diffusion latent
* camera noise
* procedural Foley selection
* visual texture

This should be recorded, but changing it should not alter the canonical narrative state.

That creates an extremely useful distinction:

$$
NarrativeIdentity \neq RepresentationIdentity
$$

You could therefore have:

```text id="lsd4f7"
Same event
    │
    ├── Visual Build A
    ├── Visual Build B
    └── Visual Remaster
```

without claiming that three different events happened.

---

# 12. One nuance: a seed alone does not guarantee generative reproducibility

The architecture correctly says representational randomness should be recorded.

But don't equate:

```text id="8pztci"
same seed
```

with:

```text id="1hcx2r"
same output
```

for arbitrary GPU generative workloads.

The seed is only one ingredient.

For a reproducible neural media build you may also need:

* model checkpoint
* model configuration
* sampler
* runtime version
* precision mode
* relevant libraries
* GPU/runtime characteristics
* preprocessing
* postprocessing

So the correct idea is:

> **Seed lineage establishes stochastic identity; the complete environment establishes reproducibility.**

That distinction is important.

---

# 13. The canonical AST is probably the most important individual artifact

The document correctly declares `dialogue_ast.json` to be the machine contract and the screenplay to be a human-facing projection. 

I strongly agree.

Once you do this, the downstream architecture becomes wonderfully clean:

```text id="wtxg6r"
                  DIALOGUE AST
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      AUDIO          TIMING         VISUAL
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                       QA
```

The critical principle is:

> **Downstream systems should not have to reverse-engineer machine state from screenplay prose.**

Prose can be expressive and ambiguous.

The AST should be explicit.

---

# 14. I would treat the AST almost exactly like compiler IR

The schema needs:

* explicit version
* canonical serialization
* validation
* migration
* hash
* producer version
* dependency hashes

The document already includes `schema_version`, `compiler_version`, and a `state_snapshot_hash`. That is the right direction.

The historical-schema policy is particularly important: old schemas should not be rewritten in place, and migrations should be explicit and testable. 

That should be non-negotiable.

---

# 15. The historical AST should never be silently upgraded

Suppose Episode 40 originally used:

```text id="w33pyd"
dialogue_ast v3.2.0
```

Years later the current system expects:

```text id="kvp5xq"
dialogue_ast v5
```

Do not simply rewrite the old archive.

Keep:

```text id="5wlzvw"
Original AST v3.2.0
```

and optionally produce:

```text id="8czz9m"
Derived AST v5
```

with the migration itself recorded.

The migration is a transformation, and therefore deserves provenance.

---

# 16. The audio/video time bridge is a particularly strong refinement

The document's relationship:

$$
48000/24=2000
$$

means that one 24-fps frame corresponds exactly to 2,000 samples at 48 kHz. 

That is extremely convenient.

It lets you preserve:

```text id="x1ju3o"
audio truth
   ↓
sample coordinates
   ↓
projection into frames
```

instead of prematurely throwing away acoustic precision.

So a phoneme could exist at:

```text id="f4k0cc"
sample 26742
```

while the video renderer maps it into an appropriate frame.

That architecture can support much more precise lip synchronization than a frame-only system.

---

# 17. `ffprobe` should remain an observer

The document explicitly makes this distinction, which is correct:

> the WAV is the temporal source of truth; `ffprobe` measures it. 

That is a subtle but important architectural distinction.

You don't want:

```text id="r1f0jp"
ffprobe defines reality
```

You want:

```text id="6kjj1x"
audio bytes
   ↓
measurement
   ↓
compiler decision
```

The measuring tool could someday be replaced.

The underlying audio remains the authoritative artifact.

---

# 18. Absolute timeline anchoring is one of the best anti-drift mechanisms

The formula:

$$
fromFrame_k=
\sum_{i=1}^{k-1}duration_i
$$

is a very good idea. 

The important idea isn't "24 fps."

It's:

> **Do not let independently rounded durations become the hidden source of accumulated timing drift.**

Every shot gets an explicit coordinate.

That same architectural philosophy appears everywhere else:

* content hashes rather than names
* explicit schema versions
* explicit state snapshots
* explicit seeds
* explicit dependency fingerprints
* explicit camera coordinates

It is all an attempt to eliminate implicit state.

That's a major architectural theme worth naming:

> **Make every consequential dependency explicit.**

---

# 19. Backend adapters are the right place for model-specific constraints

The document correctly isolates Wan's `4n+1` temporal lattice inside a backend adapter. 

That is exactly where it belongs.

The universal compiler should know:

```text id="w9a5me"
desired duration
desired frame timing
desired visual result
```

The model adapter knows:

```text id="f4zq52"
native frame rate
valid latent sizes
padding rules
sampling constraints
```

Then:

```text id="0euzdw"
MASTER TIMELINE
     ↓
BACKEND ADAPTER
     ↓
MODEL-SPECIFIC EXECUTION
     ↓
CONFORMED RESULT
```

This lets you change models without redesigning the story engine.

---

# 20. The DAG concept is likely to become critical once the system is large

The document treats continuity as a dependency graph and proposes dirty propagation when a fact changes. 

This is exactly right.

Imagine:

```text id="qybx87"
BOG.arm_state
      │
      ├── Scene 03
      ├── Scene 07
      └── Scene 19
```

A change to that fact shouldn't invalidate every episode.

It should invalidate exactly the descendants.

That turns continuity management into **incremental compilation**.

---

# 21. Dependency fingerprints make the DAG much more reliable

The file proposes a scene hash involving:

$$
H(AST+\sum H(Dependency_i)+Assets+CompilerVersion)
$$

That is the right general direction.

The important property is:

> A scene should record what exact versions of its dependencies it consumed.

Then a scene isn't simply:

```text id="g6s1hz"
depends_on: arm_injury
```

It is:

```text id="j9c4ld"
arm_injury → hash ABC123
```

When current state becomes:

```text id="b5j87s"
arm_injury → hash DEF456
```

you immediately know the cached result is stale.

That is extremely similar to a mature incremental build system.

---

# 22. The source-baking decision remains one of the strongest ideas

The document's `Episode_XXX.tsx` model is excellent because it turns an ephemeral runtime interpretation into an executable historical artifact. 

The crucial distinction is:

```text id="7ghf9s"
OLD MODEL:
Episode + current renderer
     ↓
video
```

versus:

```text id="db02ap"
NEW MODEL:
Episode
  ↓
compiler
  ↓
frozen Episode.tsx
  ↓
renderer
  ↓
historical video
```

The second greatly reduces historical drift.

---

# 23. The generator is best understood as a compiler

I would stop calling it merely a template generator.

Its conceptual role is:

> **IR-to-source compiler.**

It receives:

* narrative IR
* timing IR
* visual contracts
* dependencies

and emits executable presentation source.

That makes compiler concepts naturally applicable:

* optimization
* dependency analysis
* static validation
* caching
* source maps
* deterministic builds
* provenance
* compiler versioning

This is one of the places where the architecture can borrow a great deal from existing software-build theory.

---

# 24. Human edits becoming events is an unusually strong idea

The lifecycle:

```text id="z0b5e9"
@generated
   ↓
@patched
   ↓
@locked
```

is good. The document then improves it by making a manual override itself a historical event. 

That is exactly right.

Instead of:

```text id="f5j6j6"
someone changed camera scale
```

you get:

```json id="9j3w6x"
{
  "type": "DIRECTOR_OVERRIDE",
  "target": "shot_040_003",
  "property": "camera.scale",
  "from": 1.04,
  "to": 1.08,
  "reason": "emotional emphasis"
}
```

That means **human judgment itself becomes provenance**.

This is much more mature than treating manual intervention as an exception that exists outside the system.

---

# 25. I would make all human intervention explicit, not only camera changes

The same system should be able to record:

* dialogue adjustment
* camera adjustment
* timing override
* asset replacement
* crop adjustment
* color correction
* editorial deletion
* audio replacement

Each should become an event with:

```text id="p4t8a6"
actor
time
target
old value
new value
reason
authorization
```

Then the distinction between automation and human judgment remains visible forever.

---

# 26. The archive hierarchy is right, but I would be precise about the word "lossless"

The document correctly says that the delivery MP4 should not be the archival master. 

That's an important rule.

I'd simply distinguish:

```text id="j5gu9d"
SOURCE / IR
      ↓
HIGH-FIDELITY MEZZANINE
      ↓
LOSSY DELIVERY
```

Rather than treating every high-quality mezzanine as mathematically lossless.

The architectural principle is:

> **Preserve enough information that future delivery formats can be generated without starting from a lossy distribution copy.**

That is the thing that matters.

---

# 27. The stem architecture is especially valuable

Preserving:

* dialogue
* music
* Foley
* M&E

separately gives you much more future flexibility than preserving one finished audio mix.

You can later produce:

* alternate mixes
* international versions
* accessibility versions
* corrected dialogue
* different loudness targets

without regenerating the picture.

That's a major archival advantage.

---

# 28. The provenance graph is more valuable than a flat manifest

The proposed `render_manifest.json` is good, but the deeper idea is the graph beneath it.

A final artifact should be able to answer:

> What created me?

For example:

```text id="p6t3f0"
MASTER VIDEO
    ↓
Episode_040.tsx
    ↓
Exposure Sheet
    ↓
Dialogue AST
    ↓
Event 982
    ↓
State Snapshot
    ↓
Canon + Prior Events
```

And:

> What did I create?

You should be able to travel forward as well.

That makes the system auditable in both directions.

---

# 29. I would make provenance bidirectional

For every artifact:

```text id="u7v5sl"
parents
children
producer
validator
build ID
hash
```

Then you can ask:

### Backward

> Why does this artifact exist?

### Forward

> What would be affected if this artifact changes?

Those are two of the most valuable queries in a production system.

The DAG architecture supports both.

---

# 30. The reproducibility ladder is excellent

The document distinguishes:

* intent
* AST
* timing
* decoded media
* encoded streams
* container bytes 

That is much better than saying simply:

> "the render is reproducible."

Because reproducibility actually exists at multiple levels.

I would preserve this concept.

---

# 31. But I would distinguish "exact identity" from "perceptual equivalence"

This is an important nuance.

Two renders could differ in binary representation while producing identical decoded imagery.

Or they could have slightly different pixels that humans cannot distinguish.

So:

```text id="qv0n1k"
BIT IDENTITY
```

and:

```text id="2m9gqf"
MEDIA EQUIVALENCE
```

are different claims.

The document's SSIM and ΔE thresholds are useful as **conformance-profile examples**, but I would not make them universal truths.

Define a versioned profile:

```text
visual_conformance_v2
```

and let that profile specify:

* comparison space
* frame sampling
* perceptual threshold
* audio tolerance
* alpha tolerance

Then the threshold itself becomes part of the build contract.

---

# 32. Container identity deserves its own test

The document correctly observes that two semantically identical builds may produce different container bytes because of packaging details.

That is an important distinction.

For example:

```text id="3ydy3m"
same frames
+
same audio
=
different MP4 bytes
```

may happen because of:

* metadata
* muxing
* timestamp fields
* container ordering
* encoder implementation

Therefore the reproducibility ladder is much better than a single final SHA test.

---

# 33. The content-addressed artifact graph is a potentially huge performance win

The proposal to make intermediate artifacts content-addressed is excellent. 

Instead of:

```text id="sdpb6r"
render Episode 40 from scratch
```

you get:

```text id="t6m8pn"
Shot 1 cache HIT
Shot 2 cache HIT
Shot 3 cache MISS
Shot 4 cache HIT
...
```

Then a change in Shot 12 does not force recomputation of Shots 1–11.

That changes the production economics dramatically.

---

# 34. There is one important requirement for caching: the derivation key must include everything that matters

This is the obvious weakness to guard against.

If a cache key contains only:

```text id="f8c9z6"
audio hash
+ asset hash
```

but omits:

* compositor version
* camera parameters
* color profile
* renderer configuration
* shader version
* font
* timing
* model configuration

you can return a stale or incorrect cache hit.

So the principle should be:

$$
ArtifactKey =
H(all\ relevant\ semantic,\ presentation,\ environment\ inputs)
$$

That is the real rule.

---

# 35. The epistemic graph is another genuinely powerful idea

The document proposes treating knowledge as directional graph edges and constructing the model context from reachable facts. 

This is excellent.

Instead of saying:

> "Prompt the model not to know X."

you establish:

```text id="3m8b5e"
Character
   │
   ├── knows → Fact A
   ├── knows → Fact B
   └── knows → Fact C
```

and construct context from those edges.

So:

$$
Context_{actor}
=
Reachability(actor,WorldGraph)
$$

becomes a deterministic information-flow operation.

That is substantially more robust than prompt engineering.

---

# 36. But "knows" and "can infer" should probably be separate relations

This is one of the additions I would make.

A character may:

```text id="58yhl0"
explicitly know X
```

without:

```text id="x8kb2w"
being able to infer Y from X
```

Likewise, someone might not have been explicitly told something but could reasonably infer it from observable facts.

So the epistemic system could eventually distinguish:

```text
directly_knows
observed
heard_from
believes
suspects
can_infer
misbelieves
forbidden_to_know
```

That would dramatically increase narrative sophistication.

---

# 37. The semantic fence is good, but its most important principle is independent verification

The source points out a real weakness:

> if the same LLM produces both the prose and the claimed action AST, it can generate mutually inconsistent claims. 

Correct.

The strongest general principle is:

> **Never verify a model's claim solely using another representation emitted by the same model.**

You want an independent path:

```text id="0k2h9u"
LLM output
    ↓
independent extractor
    ↓
canonical rule checker
```

The output is not allowed to certify itself.

---

# 38. But the independent extractor does not have to be another AI

The document suggests an independent deterministic or temperature-zero model. The deeper requirement is independence.

For simple constraints, deterministic parsing and rule systems are preferable.

For harder linguistic questions, a second model can be useful as a detector.

But final authority should remain with deterministic constraints.

So:

```text id="j3u6bq"
Model A
   ↓
candidate prose

Parser / Model B
   ↓
possible violations

Deterministic rule engine
   ↓
final verdict
```

That is safer than model-vs-model arbitration.

---

# 39. The QA ladder is an excellent economic model

The progression:

```text id="q9uwjs"
Structural
 ↓
Physical
 ↓
Geometric
 ↓
Semantic
 ↓
Editorial
```

is one of the most sensible parts of the architecture.

Why?

Because cheap failures should stop expensive work.

You don't want:

```text id="t6acn2"
GPU render
 → 12 minutes
 → visual analysis
 → discover missing audio
```

You want:

```text id="7twl4p"
schema
 → files
 → hashes
 → timing
 → geometry
 → semantics
 → render
 → editorial
```

The principle is:

> **Detect every failure at the earliest stage at which it can be detected reliably.**

That's worth stating as an explicit invariant.

---

# 40. I would separate validation from conformance

Another useful refinement:

### Validation

Does the artifact satisfy the contract?

### Conformance

Does the artifact meet the required production profile?

For example:

```text WAV exists
```

is validation.

```text WAV conforms to loudness profile X
```

is conformance.

Likewise:

```text PNG contains valid alpha
```

versus:

```text PNG meets broadcast visual profile Y
```

That distinction makes the QA architecture easier to evolve.

---

# 41. The final “Gate 2 tracer bullet” is now clearly the right next move

The file correctly concludes that theoretical architecture has diminishing returns and the complete pipeline needs to be physically tested. 

I strongly agree.

The tracer bullet is valuable because it tests the **seams**, not the components.

The hard problems are rarely:

> "Can Remotion render a video?"

or:

> "Can TTS generate WAV?"

The hard problems are:

```text id="7g2mrv"
AST → timing
timing → source
source → asset paths
asset paths → renderer
renderer → container
container → verification
verification → provenance
```

Interfaces are where architecture usually breaks.

---

# 42. I would strengthen the tracer bullet considerably

The eight-point checklist is good. 

I would require the test to prove these additional properties:

```text id="fz7n6t"
[ ] Event log replay produces identical state.
[ ] Same event stream produces same AST.
[ ] AST hash is stable.
[ ] Timing hash is stable.
[ ] All asset hashes are recorded.
[ ] Source-baked TSX hash is stable.
[ ] Rendered decoded frames match.
[ ] Audio PCM matches.
[ ] Container output is either byte-identical or
    passes the documented conformance profile.
[ ] Entire provenance graph is reconstructible.
```

Then the test proves much more than "we got an MP4."

---

# 43. I would also test destructive replay

The most revealing version of the tracer bullet would be:

```text id="x8b9qk"
BUILD
 ↓
record everything
 ↓
delete working directory
 ↓
delete materialized state
 ↓
reconstruct from archive
 ↓
rebuild
 ↓
compare
```

That tests whether your claim of reproducibility is real.

A system isn't truly archival merely because it can rerender while the original working environment still exists.

---

# 44. The tracer bullet should test model absence as well

Given the deletion principle, perform a conceptual test:

```text id="x1csuy"
delete/disable neural generation
        ↓
can the world model still be reconstructed?
```

You should be able to recover:

* canon
* events
* state
* AST
* timing intent
* manifests
* build metadata

even if you cannot regenerate the neural visual plate.

That is a very strong architectural test.

---

# 45. The true archival object is therefore not the MP4

This is perhaps the most important conclusion of the entire architecture.

The actual historical object should be something like:

```text id="5t0y9d"
EPISODE BUILD
│
├── Canon reference
├── Event history
├── State snapshot
├── AST
├── Timing IR
├── Visual IR
├── Assets
├── Source
├── Environment
├── Seeds
├── QA evidence
├── Human interventions
└── Media masters
```

The MP4 is one descendant of that object.

That is a far better definition of an "episode archive."

---

# 46. This also gives you a powerful distinction between replay and remaster

Suppose five years later you improve the camera system.

You should be able to produce:

```text id="i5n9a7"
EP040 ORIGINAL
```

and:

```text id="h8i4rc"
EP040 REMASTER
```

without destroying the first.

The original answers:

> What did we actually produce then?

The remaster answers:

> What would we produce today under deliberately changed presentation rules?

Those are different historical objects.

The event history remains the same.

The representation changes.

That is exactly what your “media is never state” principle enables.

---

# 47. The system is becoming more like a narrative operating system than a video generator

That's the broader conclusion I draw from this version.

You have:

```text id="fgy6ry"
canon
state
events
knowledge
relationships
reducer
compiler IR
dependency graph
timing
asset contracts
rendering
provenance
```

Video is only one projection.

The same world state could potentially produce:

```text screenplay
audio drama
animated episode
interactive scene
game state
continuity database
character history
alternate timeline
remaster
```

That means the narrative layer should remain as media-agnostic as possible.

This is one of the most strategically important things to protect.

---

# 48. The single most important rule for future architecture reviews

Whenever a new component is proposed, ask four questions:

### 1. What truth does this component consume?

### 2. What truth is it allowed to change?

### 3. What artifact does it produce?

### 4. How can another system verify that artifact?

For example:

```text id="a3z2p8"
Diffusion worker

Consumes:
visual prompt + seed + model + frame budget

May change:
visual pixels only

Produces:
content-addressed video plate

Verified by:
hash + decode check + geometric/visual QA
```

That simple framework can prevent architectural drift.

---

# 49. The most important invariants I would now freeze

After stripping away the implementation details, I would establish these as the permanent laws:

**1. Canon is immutable.**

**2. State is materialized, but history lives in events.**

**3. Events are ordered, typed, and replayable.**

**4. Reducers are pure and deterministic.**

**5. Randomness is explicit and seeded.**

**6. Narrative randomness and representation randomness are separate.**

**7. Characters receive only the epistemic information they are allowed to possess.**

**8. The AST is the canonical machine contract.**

**9. Prose is a projection, not a source of truth.**

**10. Time exists at both audio and video resolutions.**

**11. Important timeline positions are absolute, not accumulated implicitly.**

**12. Model-specific constraints live in adapters.**

**13. Media is downstream and cannot mutate world truth.**

**14. Every important dependency has an explicit version/hash.**

**15. Historical schemas are preserved rather than rewritten.**

**16. Episodes are compiled artifacts rather than runtime interpretations of mutable code.**

**17. Human overrides are first-class, auditable events.**

**18. The archive contains source, provenance, and high-fidelity media—not merely a delivery MP4.**

**19. QA gets progressively more expensive only as confidence increases.**

**20. Reproducibility is tested, not assumed.**

That is essentially the constitution of the system.

---

# 50. The most valuable additional concept I would add: causality

There is one word I think should be added explicitly to the architecture:

> **Causality.**

You already have:

* canon
* state
* events
* provenance
* dependency graphs

Together they allow you to establish not just what happened, but **why**.

For example:

```text id="5m0v7r"
Why is Bog limping?

→ condition event
→ caused by duel
→ caused by grievance
→ caused by relationship tension
→ caused by prior event
→ ultimately grounded in canon constraints
```

Likewise:

```text id="3g5v8f"
Why does this camera zoom occur?

→ AST reaction cue
→ generated visual instruction
→ derived from narrative event
```

And:

```text id="1kcz37"
Why is this asset being used?

→ visual manifest
→ AST condition
→ character state
```

That's much more valuable than ordinary provenance.

It is **causal provenance**.

---

# 51. The ultimate property to aim for

I would define success as:

$$
\boxed{
\text{Same immutable causes}
\Rightarrow
\text{same authorized meaning}
\Rightarrow
\text{reconstructible representation}
}
$$

And when a representation deliberately changes:

$$
\boxed{
\text{same causes}
+
\text{new presentation policy}
\Rightarrow
\text{new identified media projection}
}
$$

That lets you preserve history without freezing the entire creative system forever.

---

# Final synthesis

The most important thing in this specification is **not** the rendering technology.

It is the creation of a boundary between:

```text id="20f3a5"
WHAT IS TRUE
```

and

```text id="0fxzw1"
HOW WE CHOOSE TO REPRESENT IT
```

Everything else follows.

The world is maintained through:

```text id="p6k5aq"
Canon
→ State
→ Events
→ Pure Reducer
→ Reconstructed State
```

Narrative is compiled through:

```text id="dvq8sn"
State
→ Narrative AST
→ Temporal IR
→ Visual IR
```

Media is hardened through:

```text id="1c2vdb"
IR
→ Source
→ Render
→ QA
→ Archive
```

And provenance ties the entire structure together:

```text id="sp9qzj"
WHY DID THIS EXIST?
        ↑
       hash
        ↑
      parent
        ↑
      parent
        ↑
   causal history
```

The most important philosophical consequence is this:

> **The AI is not the author of reality. It is a constrained participant in a larger deterministic system.**

The most important engineering consequence is:

> **The episode is not the MP4. The episode is the complete, versioned build graph from world state through media artifact.**

And the most important operational consequence is:

> **The next useful step is no longer more architecture prose. It is the Gate 2 tracer bullet that proves the contracts survive contact with real hardware.** The source itself identifies that as the point where theoretical refinement should give way to physical validation. 

The strongest version of that test would not merely ask whether a 3-second MP4 renders. It would ask whether the complete chain—**event → state → AST → timing → visual plan → source → render → QA → provenance → archive → clean replay**—survives destruction of the working environment and can still explain *why every important decision exists*. That is the real proof that this has become a deterministic media compiler rather than merely an elaborate AI rendering pipeline.
The most valuable part of this material is not really the question of whether to create a `goblin-hexmap` repository. The deeper and more important discovery is that **space should become one of the deterministic causes of narrative**, while remaining completely separate from visual presentation.

I would preserve the following architecture and discard most of the surrounding elaboration.

# 1. The core idea: space is part of the simulation, not part of the renderer

The strongest insight is:

> **A character should not merely be assigned a location for bookkeeping; physical location should constrain what can happen.**

That gives the simulation something an LLM is particularly bad at providing on its own: **external causality**.

Instead of:

```text
Who argues next?
→ LLM chooses an interesting pair.
```

you get:

```text
Who is physically able to encounter whom?
→ spatial state

Who is emotionally primed for conflict?
→ relational state

Which grievance is available?
→ grievance state

Who actually wins?
→ deterministic duel
```

So the eventual scene isn't simply invented.

It emerges from the intersection of:

$$
\text{Physical Proximity}
+
\text{Relational Pressure}
+
\text{Grievance Eligibility}
+
\text{Mechanical Resolution}
$$

That is considerably stronger than merely telling an LLM to "make something dramatic."

---

# 2. The hex map's real value is constraint, not geography

You don't need a beautifully detailed map for this to work.

The map is valuable because it answers deterministic questions such as:

```text
Can A reach B?
Who is nearby?
Who could witness this?
Who can plausibly arrive before the next cycle?
Which locations are available?
Which grievances can occur here?
Where did everyone actually stand?
```

That makes spatial state part of the causal machinery.

A particularly important consequence is:

> **The map prevents narrative convenience from becoming the hidden author.**

Without a spatial constraint, the system can repeatedly manufacture the most interesting pairing.

With spatial constraint:

```text
Bog is here.
Spline is three hexes away.
Moss is adjacent.
```

there is an actual reason one encounter can happen and another cannot.

That makes the story feel as though it emerges from a world rather than from a sequence of authorial selections.

---

# 3. The strongest architecture has three separate owners of spatial information

This is the distinction I would make absolutely explicit:

```text
GOBLIN-LORE
    owns what the map IS

SPATIAL LIBRARY
    owns how spatial mathematics WORKS

RELATIONAL LEDGER
    owns who is WHERE
```

Those are three different things.

## `goblin-lore`: map definition

This is canon.

It can contain things like:

```text
hex 17 = camp
hex 18 = latrine
hex 23 = valve room
terrain[23] = cramped
location_id[23] = valve_room
```

That's world law.

## Spatial module: geometry

This should be pure mathematics:

```text
distance(a,b)
neighbors(hex)
range(center,n)
ring(center,n)
path(start,end)
line_of_sight(a,b)
```

It should know nothing about:

* LLMs
* TTS
* Remotion
* episode production
* the relational database

## Relational ledger: current state

The ledger owns:

```text
Bog → hex 17
Spline → hex 18
Moss → hex 18
```

and historical movement events.

That gives you a crucial invariant:

> **The spatial library never becomes a second source of world truth.**

This is more important than whether it is in one repository or ten.

---

# 4. I strongly agree with keeping the spatial library stateless

The pasted material identifies the critical choice between a stateless geometry library and a stateful spatial service.

The stateless version is the one I would keep.

Conceptually:

```text
position data
    +
map definition
    ↓
spatial function
    ↓
result
```

rather than:

```text
spatial service
    ↓
owns positions
```

Why?

Because the second arrangement creates two authorities:

```text
ledger says Bog is at A
spatial service says Bog is at B
```

Now you have exactly the class of architectural failure the rest of the system is trying to eliminate.

So I would make the spatial module almost mathematical:

$$
distance(map,a,b)
$$

$$
neighbors(map,a)
$$

$$
witnesses(map,positions,a,r)
$$

It consumes state.

It doesn't own state.

---

# 5. The map should influence the story in several specific ways

The most useful applications are not dozens of complicated mechanics. There are a handful of high-value spatial queries.

## Proximity

Who can encounter whom?

```text
candidate_pairs =
actors_within_radius(r)
```

This should probably be one of the primary Stage 3 filters.

## Witnesses

Who could have observed the event?

But there is an important nuance:

> **Proximity should establish opportunity, not automatically establish knowledge.**

Someone being two hexes away doesn't necessarily mean they saw or heard something.

So I'd separate:

```text
physically_near
        ↓
perceptually_exposed
        ↓
observed_event
        ↓
knows_fact
```

This is important.

The spatial map supplies the first condition.

An explicit deterministic perception rule supplies the next.

That avoids an overly simplistic:

```text
within 2 hexes → magically knows everything
```

---

# 6. The spatial system should feed the epistemic system, not replace it

This is one of the most useful connections in the whole architecture.

Imagine:

```text
Bog attacks Spline in hex 23.

Moss is in hex 24.
```

The system can compute:

```text
Moss was spatially eligible to witness the event.
```

Then additional rules can determine:

```text
line of sight?
noise level?
obstruction?
lighting?
distance?
character's sensory condition?
```

Only after those checks does the system generate:

```text
OBSERVED_EVENT
```

which then mutates epistemic state:

```text
Moss KNOWS(Fact_X)
```

This means your epistemic graph can remain deterministic and auditable.

The causal chain becomes:

```text
EVENT
 ↓
LOCATION
 ↓
SPATIAL RELATION
 ↓
PERCEPTION
 ↓
KNOWLEDGE
```

That is much more powerful than simply attaching a `knows` flag to a character.

---

# 7. Witnesses are potentially one of the best uses of the map

The material correctly identifies witnesses as a spatial consequence.

This deserves emphasis because it can make the narrative considerably more interesting.

Suppose a duel happens.

The outcome system says:

```text
winner = Spline
loser = Bog
```

The map says:

```text
Moss was adjacent.
Elias was six hexes away.
```

Now:

```text
Moss may have witnessed it.
Elias did not.
```

That creates information asymmetry automatically.

And that information asymmetry can later create:

* rumors
* accusations
* blackmail
* mistaken beliefs
* alliances
* coverups

The spatial model therefore becomes a **knowledge-generation mechanism**.

That is much more valuable than merely using it to decide walking distance.

---

# 8. Props should be spatial entities, not just inventory fields

Another excellent consequence is the treatment of physical objects.

An important object should have its own state:

```text
object_id
location
holder
condition
history
```

For example:

```text
BRASS_SIPHON
    owner: Bog
    location: valve_room
    condition: damaged
```

Then an event occurs:

```text
STRING_EXPENDED
OBJECT_TRANSFERRED
OBJECT_DAMAGED
OBJECT_HIDDEN
```

and the object moves through the same event system as everything else.

This creates very useful causal chains:

```text
object stolen
 ↓
object moved
 ↓
new character possesses object
 ↓
someone observes possession
 ↓
belief changes
 ↓
grievance becomes eligible
 ↓
confrontation occurs
```

That kind of chain is exactly what a simulation-based narrative architecture is good at producing.

---

# 9. Location should have semantic meaning, not merely coordinates

A hex coordinate alone isn't sufficient.

You want:

```text
coordinate
+
location_id
+
terrain
+
semantic tags
```

For example:

```text
hex: 23
location_id: valve_room
terrain: cramped
tags:
  - industrial
  - private
  - loud
```

Now grievances can specify:

```text
requires_location = valve_room
```

or:

```text
terrain_modifier = cramped
```

without the narrative engine needing to know anything about screen pixels.

This preserves the meaning/representation boundary.

---

# 10. This is where the hex map integrates beautifully with the rest of the architecture

The correct flow is:

```text
CANON
  ↓
MAP DEFINITION
  ↓
STATE
  ↓
POSITIONS
  ↓
SPATIAL QUERIES
  ↓
NARRATIVE EVENT
  ↓
LOCATION ID
  ↓
MEDIA COMPILER
  ↓
BACKGROUND MATTE
```

Notice what is **not** present:

```text
hex coordinate → screen coordinate
```

The Sower should not say:

> Put Bog at x=742, y=412.

It should say:

> Bog is at `valve_room`.

Then the visual system decides what `valve_room` looks like.

That's exactly the separation between meaning and representation you established earlier.

---

# 11. Hexes are useful when you actually need emergent spatial behavior

The argument for hexes is basically sound.

A hex grid gives six uniformly adjacent neighbors, and cube-coordinate distance can be computed cleanly:

$$
d(a,b)=\max(|\Delta q|,|\Delta r|,|\Delta s|)
$$

with:

$$
q+r+s=0
$$

That is useful when the simulation actually cares about:

* movement
* ranges
* neighborhoods
* witnesses
* clustering
* pursuit
* escape
* pathfinding
* territorial behavior

However, there is an important architectural caution.

### You may not actually need a hex grid.

If the world eventually consists of:

```text
camp
latrine
shed
valve room
bog
relay
```

with explicit connections between them, then this:

```text
Camp ── Shed ── Valve Room
  │
Bog ──────────── Relay
```

may be enough.

A weighted location graph can provide:

```text
distance
neighbors
movement cost
reachability
witness radius
```

without requiring a large tiled map.

So the correct abstraction is actually:

> **spatial graph with a replaceable geometry implementation.**

The implementation can be hexagonal today.

The higher-level simulation should depend on:

```text
distance()
neighbors()
occupants()
reachable()
witnesses()
path()
```

not on the word "hex" appearing throughout the Sower.

That is the best hedge against future redesign.

---

# 12. The movement phase deserves to be a first-class simulation phase

This is one of the most useful additions in the material.

Don't simply update coordinates as incidental side effects.

Think in terms of:

```text
Cycle N
   ↓
Movement phase
   ↓
Spatial state
   ↓
Pairing selection
   ↓
Grievance selection
   ↓
Duel
   ↓
State mutation
```

That gives space its proper place in causality.

And movement should itself be deterministic.

For example:

```text
humiliated → retreat tendency
paranoid → avoid specific actor
urgent debt → approach target
injured → avoid difficult terrain
curious → investigate nearby object
```

Movement therefore becomes a projection of **state and motivation**.

It isn't merely:

```text
randomly choose neighboring hex
```

because random walking will eventually create predictable clustering or meaningless movement.

---

# 13. Movement needs constraints, goals, and a deterministic tie-breaker

I'd model movement approximately as:

```text
eligible destinations
      ↓
hard constraints
      ↓
utility score
      ↓
seeded tie-break
      ↓
chosen destination
```

For example:

```text
cannot enter flooded hex
must move toward target
avoid enemy if paranoia > threshold
prefer isolated location if humiliated
```

Then, if several destinations are equally valid:

```text
seeded PRNG
```

selects among them.

That gives you deterministic but non-rigid movement.

---

# 14. Beware of spatial attractors

The pasted analysis rightly identifies clustering as a risk.

A deterministic simulation can become boring for reasons that have nothing to do with the LLM.

You can accidentally create:

```text
everyone moves toward everyone
        ↓
everyone clusters
        ↓
same 2–3 characters interact constantly
        ↓
story degenerates
```

or the opposite:

```text
everyone avoids everyone
        ↓
no confrontations
        ↓
story dies
```

So the movement system needs aggregate simulation tests.

Run hundreds or thousands of simulated cycles and inspect:

* average distance between characters
* number of unique pairings
* location utilization
* occupancy distribution
* repeat confrontation frequency
* time spent isolated
* witness frequency

This is far more useful than manually watching the first few episodes.

---

# 15. The map should therefore be tested statistically, not just geometrically

Traditional hex-grid tests prove:

```text
distance(A,B) == distance(B,A)
```

That's necessary.

But not sufficient.

You also need emergent tests:

```text
over 500 simulated episodes:

pair diversity > threshold
no location > X% occupancy
no character involved in > Y% of confrontations
average travel distance within expected range
witness rate within expected range
```

These aren't mathematical truths.

They're **design-health metrics**.

That distinction matters.

The geometry tests prove correctness.

The simulation metrics prove that the rules produce a healthy world.

---

# 16. The most important repository decision is actually "module now, repository later"

I agree strongly with the material's recommendation.

Don't create another repository merely because the architecture looks modular.

Do this now:

```text
worker-sower-engine/
    src/
        spatial/
            coords.ts
            distance.ts
            neighbors.ts
            pathfind.ts
            visibility.ts
```

with a strict rule:

> The spatial module imports nothing from the rest of the Sower's application layer.

That is enough separation for now.

---

# 17. The repository split should happen only when there is an independent reason

Good triggers are:

### A second consumer

For example:

```text
Sower
+
map debugger
```

both need the library.

Now a package boundary has real value.

### Stable API

After several real episodes, you know whether:

```text
distance()
neighbors()
witnesses()
```

are actually the right abstraction.

Before that, you're guessing.

### Independent release/versioning

If old episodes need:

```text
spatial-engine 1.2
```

while current episodes need:

```text
spatial-engine 2.0
```

then a separate versioned package becomes valuable.

### Independent operational needs

Separate CI, release cadence, permissions, or deployment.

Until those appear, another repository is mostly overhead.

---

# 18. The crucial rule if you eventually split the repository

Do **not** move the spatial state into it.

The clean eventual structure is:

```text
goblin-lore
    ↓
map definition

goblin-spatial
    ↓
pure geometry

worker-sower-engine
    ↓
current positions + movement decisions
```

That gives you:

> **canon owns what the map means; spatial owns how geometry works; Sower owns what characters do.**

That is a very strong architectural division.

---

# 19. I would actually avoid the name `goblin-hexmap`

At least internally, I'd consider something like:

```text
goblin-spatial
```

rather than:

```text
goblin-hexmap
```

because "hexmap" freezes an implementation decision into the public concept.

Today:

```text
goblin-spatial
    uses hex coordinates
```

Tomorrow you could decide:

```text
goblin-spatial
    uses a graph
```

without changing the conceptual meaning of the package.

The consumers should care about spatial operations, not the underlying representation.

---

# 20. The visual debugger is worth building early

This is one thing I strongly agree with from the material.

A tiny map visualizer can be disproportionately valuable.

Imagine:

```text
Cycle 114
────────────────────────────

      BOG ●
          ╲
           ╲
     MOSS ●─● SPLINE

                  ● ELIAS

Recent movement:
Bog:    12 → 13 → 14 → 19
Moss:    8 → 13 → 18
Spline: 18 → 19
```

Now you can immediately see:

* clustering
* dead zones
* impossible movement
* unreachable locations
* repetitive pairings
* witness opportunities
* pathfinding mistakes

This is much easier to reason about visually than through database logs.

And because it is a visualization of semantic state, it can remain entirely separate from the eventual Remotion presentation system.

---

# 21. One of the most important additions: movement itself should generate events

Instead of silently updating:

```text
Bog.position = 17
```

produce:

```json
{
  "type": "ACTOR_MOVED",
  "actor": "BOG",
  "from": 14,
  "to": 17,
  "reason": "RETREAT_FROM_HUMILIATION",
  "seed": "..."
}
```

Then the movement becomes part of world history.

That gives you:

```text
who was there?
```

and:

```text
why were they there?
```

and:

```text
could they have witnessed this?
```

all from the same event history.

That's a major improvement.

---

# 22. Movement history is especially valuable for mysteries and delayed consequences

Suppose three episodes later you need to know:

> Who could plausibly have seen the brass siphon being stolen?

You don't want to reconstruct this from today's map.

You need the historical event stream:

```text
time T
Bog → hex 23
Moss → hex 24
Spline → hex 10
object → hex 23
```

Then the system can reconstruct the precise spatial configuration.

This is another reason the event-sourced representation fits the spatial layer so well.

---

# 23. The same applies to objects

Record:

```text
OBJECT_MOVED
OBJECT_TAKEN
OBJECT_DROPPED
OBJECT_HIDDEN
OBJECT_DAMAGED
```

and the map becomes a causal substrate for props.

That can produce much richer serialized continuity than simply giving each episode a fresh "scene prop."

---

# 24. The strongest version of the spatial architecture is therefore this

```text id="zj8i4j"
                 CANON
                   │
             map definition
                   │
                   ▼
          ┌─────────────────┐
          │ SPATIAL ENGINE  │
          │ pure geometry   │
          └───────┬─────────┘
                  │
                  │ queries
                  ▼
          WORLD / LEDGER STATE
          actors, objects,
          positions, conditions
                  │
                  ▼
          MOVEMENT PHASE
                  │
                  ▼
          SPATIAL STATE
                  │
                  ▼
          CONFLICT SELECTION
                  │
                  ▼
             EVENTS
                  │
                  ▼
            NEW STATE
                  │
                  ▼
           NARRATIVE AST
```

This is much more important than where the files physically live.

---

# 25. What I would *not* build yet

The surrounding material contains several ideas that are intellectually interesting but premature.

I would not yet build:

* a separate spatial microservice
* a distributed map service
* a second database for spatial state
* sophisticated 3D pathfinding
* complicated line-of-sight geometry
* terrain simulation with dozens of types
* a separate spatial repository merely for architectural purity
* elaborate visualization infrastructure

Start with:

```text
coordinates
distance
neighbors
movement
occupancy
witness radius
location IDs
movement events
```

Everything else should earn its existence.

---

# 26. The one thing I would add immediately is a spatial contract

Before writing much code, define a tiny contract such as:

```text id="2e3hqo"
distance(a,b)
neighbors(a)
withinRadius(a,r)
occupants(state,cell)
reachable(state,actor,destination)
witnessCandidates(state,event,r)
locationId(cell)
```

The important thing is not the exact function names.

It is that the Sower should talk to spatial geometry through **stable semantic operations**.

If later the implementation changes from:

```text
hex grid
```

to:

```text
location graph
```

the Sower doesn't care.

---

# 27. The highest-value tests are therefore very small

For the geometry:

```text
distance(A,A) = 0
distance(A,B) = distance(B,A)
neighbor counts are correct
range generation is correct
paths are valid
```

For state:

```text
movement updates ledger correctly
movement events replay identically
```

For narrative:

```text
only eligible characters are paired
only reachable witnesses qualify
location-bound grievances require correct location
```

For determinism:

```text
same state + same seed = same movement
```

Those give you a very strong foundation with surprisingly little code.

---

# 28. The deeper conclusion

The most important thing the hex-map discussion reveals is that **the world itself can become a generator of narrative pressure**.

That's the real opportunity.

Instead of:

```text
LLM invents event
```

you get:

```text
WORLD STATE
    ↓
physical constraints
    ↓
available encounters
    ↓
social pressure
    ↓
mechanical conflict
    ↓
new consequences
```

The LLM then gives those consequences language.

That's much closer to an actual simulation of a fictional society.

---

# 29. My distilled architecture

If I stripped everything in the pasted material down to what I would actually put in the design document, it would be this:

```text
CANON
  └── defines map, characters, rules, locations, objects

LEDGER
  └── owns mutable positions, conditions, relationships, knowledge

EVENT LOG
  └── records every consequential state transition

SPATIAL MODULE
  └── pure geometry over map + state
      ├── distance
      ├── neighbors
      ├── path
      ├── occupancy
      └── witness candidates

SOWER
  └── movement → pairing → grievance → mechanical outcome

NARRATIVE AST
  └── canonical machine representation

MEDIA COMPILERS
  ├── audio
  ├── temporal
  └── visual

VIEWPORT
  └── representation only

QA
  └── deterministic checks → semantic checks → human review

ARCHIVE
  └── event history + state + AST + assets + source + masters
```

And the central invariant would be:

> **Canon defines the world; the ledger records its current state; events explain how the state changed; the spatial engine computes physical relationships without owning state; the Sower converts those relationships into narrative events; and everything downstream is merely a projection of those facts.**

---

# 30. My answer on the repository question

I would make the decision very simple:

**Create the spatial module now. Do not create the separate repository yet.**

Put the geometry in a self-contained module inside `worker-sower-engine`.

Keep:

```text
map definition → canon
positions → ledger
geometry → spatial module
```

Make the spatial module pure and independently testable.

Then extract it to something like `goblin-spatial` only when there is an actual reason:

* another consumer appears,
* its API stabilizes through real episodes,
* independent versioning becomes valuable,
* or its development lifecycle genuinely becomes independent.

That is the least risky path because it gets you the architectural boundary immediately without prematurely freezing an interface you haven't validated.

And there is one particularly important reason **not** to split it too early:

> **You don't yet know what the spatial abstraction really needs to be.**

After several real simulations, you may discover that "hex map" was exactly right. You may discover that a graph is enough. Or you may discover that the correct abstraction is a graph implemented by a hex grid.

The interface should survive that discovery.

So the thing worth designing now isn't `goblin-hexmap`.

It is:

> **a deterministic spatial abstraction whose current implementation happens to be a hex grid.**

That is the architectural piece I would preserve.
Yes. If I strip away the repetition, speculative infrastructure, and premature studio-scale machinery, I think the material contains a **much smaller set of genuinely important architectural ideas**. Those ideas are strong enough to form the foundation of the project.

What follows is my consolidated version. I am deliberately **not trying to preserve every proposal in the pasted material**. I am trying to identify the principles that are likely to remain valuable even after the project changes substantially.

I’ll also distinguish between:

* **Core truths** — principles I think are fundamentally sound.
* **Useful implementation decisions** — good choices, but not universal truths.
* **Design hypotheses** — things worth testing rather than believing.
* **Things I would deliberately not build yet.**

---

# The central idea

The project should be understood as a **deterministic world simulator with generative production attached to it**, rather than as an AI system that happens to make episodes.

That distinction is extraordinarily important.

The AI should not be responsible for determining what *actually happened*.

Instead:

```text
              WORLD
                │
        ┌───────▼────────┐
        │  CANON / RULES │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │     LEDGER     │
        │  world state   │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │   SIMULATION   │
        │ what happens   │
        └───────┬────────┘
                │
                │  facts
                ▼
        ┌─────────────────┐
        │  GENERATIVE AI  │
        │ how it is said  │
        └────────┬────────┘
                 │
                 ▼
       AUDIO / VISUAL MEDIA
                 │
                 ▼
              EPISODE
```

That is the deepest architectural insight in the entire material.

The distinction is:

> **The simulation determines reality. The generative systems determine presentation.**

Everything else should be evaluated against that principle.

---

# 1. Make the ledger the authority

This is the first thing I would preserve.

The system needs one authoritative representation of the fictional world's mutable state.

For example:

```text
Character
    location
    health
    wounds
    emotional conditions
    relationships
    grudges
    debts
    secrets known
    secrets not known
    cooldowns
    possessions

World
    cycle
    locations
    objects
    environmental state
    unresolved events

History
    events
    movements
    injuries
    discoveries
    exchanges
    confrontations
```

The important thing isn't the particular fields.

The important thing is **authority**.

If the ledger says:

```json
{
  "character": "Bog",
  "location": "marsh",
  "injuries": ["left_arm_injured"]
}
```

then an LLM isn't allowed to write:

> Bog casually raises his perfectly healthy left arm.

That isn't a stylistic disagreement.

It is a **pipeline error**.

The draft should fail.

That distinction is crucial because otherwise the ledger is merely documentation. It isn't actually governing anything.

### The rule I would adopt

> **Generated content may consume state. It may never silently redefine state.**

An LLM can propose:

```text
"Bog grabs the siphon."
```

But the system should determine whether Bog can actually grab the siphon.

An LLM can say:

```text
"Nobody saw me."
```

But the simulation determines who was actually within witnessing range.

An LLM can write:

```text
"You betrayed me yesterday."
```

But the ledger determines whether such an event occurred.

This gives you a very powerful separation:

### Simulation answers:

**What happened?**

### AI answers:

**How would these characters express what happened?**

That is an unusually good division of labor.

---

# 2. Keep the spatial/hex system — but understand what it really does

The hex map is more important than it initially appears.

It isn't fundamentally a graphics feature.

It is a **causality mechanism**.

Without spatial constraints, an AI-driven story engine tends toward:

> "Who would be interesting to put together?"

With spatial constraints:

> "Who can actually encounter whom?"

That difference is enormous.

A character can't be everywhere.

A character can't witness something from across the map.

A character can't steal an object from someone who isn't nearby.

A character who storms away can't immediately participate in another scene on the other side of the world.

Space therefore becomes a source of **narrative pressure**.

---

## The most important spatial abstraction

I would keep three concepts separate:

### 1. Map

The immutable structure of the world.

```text
hex → terrain
hex → location_id
hex → properties
hex → neighbors
```

### 2. Spatial mathematics

The reusable machinery:

```text
distance()
neighbors()
ring()
range()
path()
visibility()
```

### 3. Spatial state

The mutable facts:

```text
Bog → (4,-2, -2)
Snerk → (5,-3,-2)
siphon → (4,-2,-2)
```

These should not be conflated.

The clean architecture is:

```text
CANON
  │
  └── map definition

SPATIAL LIBRARY
  │
  └── pure geometry

LEDGER
  │
  └── current positions

SIMULATION
  │
  └── uses spatial functions
```

I strongly agree with the material's conclusion that the spatial library should initially be **stateless**.

Don't create a "map service" that owns the characters' positions.

That would create another authority.

Instead:

```typescript
distance(positionA, positionB)
```

not:

```typescript
mapService.getCharacterDistance("Bog", "Snerk")
```

The former makes it obvious that the ledger owns truth.

---

# 3. The hex map should produce consequences, not merely coordinates

This is a subtle but important distinction.

A bad implementation would have:

```text
Bog = hex 17
Snerk = hex 18
```

and little else.

A useful spatial system lets location influence simulation.

For example:

```text
distance
occupancy
visibility
terrain
movement cost
location semantics
witness radius
object proximity
```

Then the map can participate in:

### Encounter selection

```text
possible opponents =
    characters within interaction range
```

### Witness selection

```text
witnesses =
    characters with line-of-sight
    within relevant radius
```

### Knowledge propagation

```text
character sees event
        ↓
character learns fact
```

### Movement

```text
character motivation
        +
world geography
        ↓
destination
```

### Grievance activation

```text
grievance requires:
    correct actors
    correct object
    correct location
    correct historical condition
```

This makes the world increasingly causal.

---

# 4. Don't confuse the hex map with the visual composition

This is one of the most important boundaries in the entire architecture.

Suppose:

```text
Bog = hex (4,-2,-2)
```

That does **not** mean:

```text
Bog's screen X = 400
Bog's screen Y = 200
```

The simulation's space and the viewer's space are different coordinate systems.

The simulation might say:

```text
location_id = "siphon_room"
```

The visual system decides:

```text
camera framing
character placement
scale
eyeline
background
entrance direction
```

This is the same deeper principle:

> **Semantic space should not dictate visual composition unless there is a specific reason to make it do so.**

Otherwise the simulation becomes entangled with the renderer.

---

# 5. Simulation before language is the second foundational principle

This is probably the most valuable practical idea after the ledger.

Don't ask an LLM:

> "Write a scene where two goblins have an argument."

Ask the deterministic system:

```text
Who is present?
Where are they?
Why can they interact?
What grievance is active?
What does each character know?
What does each character want?
What are the stakes?
What outcome occurs?
What changes afterward?
```

Then give those facts to the language model.

The LLM receives something much closer to:

```json
{
  "participants": ["Bog", "Snerk"],
  "location": "siphon_room",
  "grievance": "missing_brass_siphon",
  "bog_believes": ["snerk_stole_siphon"],
  "snerk_believes": ["bog_blames_him"],
  "outcome": "COSTLY_WIN",
  "winner": "Bog",
  "injury": "Bog bruised",
  "new_knowledge": [],
  "required_actions": [
    "Bog confronts Snerk",
    "Snerk denies accusation",
    "Bog obtains siphon"
  ]
}
```

Now the LLM has a constrained creative problem:

> Make this scene entertaining.

That's much easier than:

> Invent the reality of the universe and then describe it.

---

# 6. Keep the outcome taxonomy

The idea of having outcomes beyond simple win/lose is particularly useful.

Something like:

```text
CLEAN_WIN
COSTLY_WIN
MUTUAL_WOUND
BACKFIRE
TRUE_TIE
```

is useful because it creates a **scene grammar**.

A simple system:

```text
A beats B
```

quickly becomes repetitive.

But:

```text
A wins but gets injured
A wins but loses something
B wins accidentally
both are damaged
nobody gets what they wanted
the attack produces an unexpected consequence
```

creates dramatically different states.

The important insight is that an encounter should produce **state transitions**, not merely winners.

For example:

```text
BEFORE

Bog:
    healthy
    angry at Snerk

Snerk:
    healthy
    indifferent

AFTER

Bog:
    injured
    satisfied
    owes a debt

Snerk:
    humiliated
    resentful
    knows Bog suspects him
```

The next episode is therefore partially determined by the previous one.

That is where continuity becomes interesting.

---

# 7. 2d6 is useful, but don't mistake it for the important part

The material is right that 2d6 gives a bell-shaped distribution:

```text
2  → 1/36
3  → 2/36
4  → 3/36
5  → 4/36
6  → 5/36
7  → 6/36
8  → 5/36
9  → 4/36
10 → 3/36
11 → 2/36
12 → 1/36
```

But the specific choice of 2d6 is not sacred.

The important property is:

> **The simulation must have a controlled probability distribution rather than allowing the LLM to decide outcomes ad hoc.**

2d6 is a perfectly reasonable implementation.

But you should eventually tune the entire probability model empirically.

That means the real tool isn't:

```text
2d6
```

It is:

```text
simulate 10,000 encounters
→ inspect distribution
→ adjust rules
→ simulate again
```

This is why the headless simulator is so important.

---

# 8. Build the simulator before building the media pipeline

This may be the single biggest practical recommendation.

You should be able to run something conceptually like:

```bash
simulate --episodes 1000
```

and get:

```text
Episodes:                 1000

Encounters:               4821
Unique pairings:           37
Average encounters/episode: 4.82

Clean wins:                31%
Costly wins:               24%
Mutual wounds:             18%
Backfires:                 17%
True ties:                 10%

Most frequent pairing:
    Bog / Snerk:            14%

Characters with >3 injuries:
    2

Average resentment:
    0.41

Maximum resentment:
    0.91

Locations never visited:
    1

Grievances never selected:
    3
```

This is vastly more useful during early development than rendering video.

Because you can discover:

* runaway characters
* repeated pairings
* unused characters
* useless grievances
* impossible locations
* excessive injuries
* excessive recovery
* stagnant relationships
* knowledge spreading too quickly
* characters becoming permanently trapped
* probabilities producing boring outcomes

before spending any money or time on TTS or rendering.

---

# 9. Watch for simulation attractors

This is one of the most important additions to the architecture.

Any persistent simulation tends to develop **attractors**.

For example:

```text
Bog gets humiliated
 ↓
Bog becomes resentful
 ↓
Bog targets Snerk
 ↓
Snerk retaliates
 ↓
Bog gets injured
 ↓
Bog becomes more resentful
 ↓
Bog targets Snerk again
```

Now you've accidentally built:

> The Bog/Snerk Grudge Machine.

Another possibility:

```text
character becomes injured
→ loses fights
→ becomes more injured
→ loses more fights
```

That's a death spiral.

Or:

```text
character gains social power
→ wins more
→ gains more power
→ wins more
```

That's a runaway winner.

The system therefore needs **recovery mechanics and negative feedback**.

Not because some abstract game-design principle says so, but because otherwise a long-running world tends to collapse into a small number of stable patterns.

Useful metrics include:

```text
pair diversity
character participation
location utilization
grievance utilization
condition distribution
injury duration
resentment distribution
knowledge concentration
object movement
```

You want to measure these rather than merely hoping the simulation feels healthy.

---

# 10. The biggest product risk isn't rendering

This is perhaps the most important conclusion I would add.

The architecture spends enormous attention on:

* rendering
* containers
* provenance
* reproducibility
* source baking
* cloud workers
* media packaging
* diffusion
* QA

Those are engineering problems.

But the audience doesn't care how elegant the pipeline is.

The audience cares whether:

> **the episode is interesting.**

The simulation can be perfectly deterministic and produce absolutely terrible entertainment.

You therefore need to test two separate systems:

### System A — world integrity

Does the world behave correctly?

### System B — dramatic/comedic quality

Is what happens actually worth watching?

Those are different evaluation problems.

---

# 11. Grievances are probably more important than the elaborate simulation formulas

I would put much more design effort into the **grievance library** than the original material seems to.

A grievance isn't simply:

```text
"Bog is angry at Snerk."
```

It should contain something like:

```text
surface_complaint:
    Snerk took the brass siphon.

underlying_conflict:
    Bog believes Snerk doesn't respect him.

historical_trigger:
    Snerk previously borrowed equipment without asking.

object:
    brass_siphon

location:
    siphon_room

participants:
    Bog
    Snerk

required_knowledge:
    Bog knows siphon disappeared.
    Bog suspects Snerk.

forbidden_knowledge:
    Bog does not know Snerk secretly returned it.

possible_escalations:
    accusation
    denial
    theft accusation
    physical confrontation

possible_outcomes:
    apology
    fight
    object recovered
    false accusation
    new debt
```

Now the grievance is **dramatic machinery**.

The LLM doesn't invent the machinery.

It operates it.

---

# 12. Preserve the distinction between surface conflict and underlying conflict

This is another particularly valuable idea.

A good dramatic scene often has:

```text
SURFACE:
"You took my siphon."

UNDERNEATH:
"You don't respect me."

```

The danger is that an LLM will frequently turn:

> "You don't respect me."

into actual dialogue.

That destroys the subtext.

So I would explicitly model:

```text
surface_fact
hidden_motive
character_belief
character_goal
```

and instruct the generator:

> The hidden motive is a constraint on behavior, not dialogue.

Then test it.

Generate five versions.

Ask:

> Can a human infer the hidden motive without the character stating it?

That's a much more meaningful creative evaluation than measuring token-level quality.

---

# 13. Knowledge should be treated as a first-class state

This deserves more emphasis than it received.

There are actually several different kinds of knowledge:

```text
FACT
WHO_KNOWS_FACT
WHO_BELIEVES_FACT
WHO_SUSPECTS_FACT
WHO_IS_WRONG_ABOUT_FACT
```

These are not equivalent.

For example:

```text
Reality:
    Snerk stole the siphon.

Bog:
    believes Snerk stole it.

Snerk:
    knows he stole it.

Mog:
    thinks Bog stole it.

Zog:
    saw Snerk near the room but doesn't know what happened.
```

This is dramatically fertile.

And it is exactly where LLM prompting becomes dangerous.

If you give the model:

```text
Snerk stole the siphon.
```

and then say:

> "Snerk doesn't know that Bog knows."

you are asking the model to ignore information you just gave it.

The better architecture is:

```text
Bog's prompt:
    include Bog's knowledge

Snerk's prompt:
    include Snerk's knowledge

Mog's prompt:
    include Mog's knowledge
```

**Don't give a character information and then ask them to forget it.**

Omission is much stronger than instruction.

---

# 14. Separate "reality" from "belief"

I would actually go one step further than the pasted material.

The ledger shouldn't merely have:

```text
knowledge
```

It should distinguish:

```text
world truth
character knowledge
character belief
character suspicion
```

Because this enables one of the richest forms of persistent storytelling:

> **The world can be objectively one way while the characters believe it is another way.**

That creates dramatic irony without requiring the LLM to manufacture it.

---

# 15. Randomness needs two categories

The pasted material's distinction here is excellent and should be preserved.

There should be:

### Narrative randomness

Affects reality.

Examples:

```text
which grievance activates
which characters encounter
dice outcome
movement
event selection
```

This must be:

* seeded
* logged
* reproducible

### Representational randomness

Affects presentation.

Examples:

```text
diffusion noise
visual variation
voice rendering variation
animation microvariation
```

This should **not alter the world's truth**.

That's an extremely useful boundary.

You don't want:

```text
different diffusion seed
      ↓
different visual result
      ↓
different inferred character action
      ↓
different story
```

The direction must remain:

```text
WORLD
 ↓
SCRIPT
 ↓
MEDIA
```

not:

```text
MEDIA
 ↓
WORLD
```

---

# 16. Audio really should be the timing authority

This is one of the technically strongest ideas in the material.

Don't start by deciding:

```text
Shot 1 = 47 frames
Shot 2 = 62 frames
Shot 3 = 39 frames
```

and then squeeze the speech into it.

Instead:

```text
script
 ↓
TTS
 ↓
actual audio duration
 ↓
frame allocation
 ↓
visual timeline
```

At 24 fps:

```text
frames = ceil(duration_seconds × 24)
```

But I would improve the architecture slightly.

Don't merely store:

```json
{
  "duration": 2.17
}
```

Store enough timing information to reconstruct the timeline:

```json
{
  "audio_file": "bog_001.wav",
  "duration_ms": 2170,
  "start_frame": 480,
  "end_frame": 533
}
```

Then make every subsequent stage consume those values.

---

# 17. Absolute timing is more important than chained timing

This is a subtle engineering point that is absolutely worth preserving.

Don't calculate:

```text
shot 1 ends
→ shot 2 starts

shot 2 ends
→ shot 3 starts

shot 3 ends
→ shot 4 starts
```

Instead calculate:

```text
shot 1 start = 0
shot 2 start = predetermined cumulative frame
shot 3 start = predetermined cumulative frame
shot 4 start = predetermined cumulative frame
```

Then a small rounding difference in one shot doesn't progressively move everything later.

That is the correct mental model:

> **Timeline positions are coordinates, not consequences of repeatedly accumulating floating-point durations.**

---

# 18. The timing manifest should become a major contract

I would make this one of the canonical artifacts.

Something like:

```text
timing.json

episode_fps
total_frames

shots[]
    shot_id
    audio_file
    start_frame
    duration_frames
    actor_ids
    location_id
    dialogue_ids
```

Then the renderer doesn't need to understand narrative logic.

It simply receives:

> At frame 480, show this thing, at this location, while this audio plays.

That's clean.

---

# 19. Treat asset manifests as APIs

The material is right here.

A visual asset shouldn't merely be:

```text
bog.png
```

It should have a contract.

For example:

```json
{
  "character_id": "bog",
  "anchor_point": [0.47, 0.81],
  "mouth_bounding_box": [0.42, 0.51, 0.12, 0.08],
  "poses": {
    "idle": "...",
    "angry": "...",
    "terrified": null
  }
}
```

The important concept is **explicit absence**.

This:

```json
"terrified": null
```

means:

> We know this asset is missing.

Whereas:

```json
{}
```

could mean:

> Someone forgot to specify it.

Those are radically different debugging situations.

---

# 20. Schema versioning is almost free — do it immediately

I strongly agree with this recommendation.

Every major artifact should carry something like:

```json
{
  "schema_version": "1.0"
}
```

For example:

```text
canon
ledger
simulation_result
dialogue_ast
timing_manifest
visual_manifest
render_manifest
```

You don't need a sophisticated migration framework yet.

Just establish the habit.

It gives you a future answer to:

> "What did this file mean?"

---

# 21. Dialogue should become structured data before becoming prose

This is another place where the architecture can be strengthened.

Don't let the LLM's first output be arbitrary script text.

Instead, make the intermediate representation something like:

```json
{
  "scene_id": "S03",
  "participants": ["Bog", "Snerk"],
  "beats": [
    {
      "actor": "Bog",
      "action": "ACCUSATION",
      "dialogue": "Where's my siphon?"
    },
    {
      "actor": "Snerk",
      "action": "DENIAL",
      "dialogue": "Why would I want your stupid siphon?"
    }
  ]
}
```

Now the prose is attached to **known actions**.

This gives you a valuable validation layer.

You can check:

```text
Did the required accusation happen?
Did the required denial happen?
Did somebody perform an impossible action?
Did the scene end with the predetermined outcome?
```

This is much easier than trying to infer everything from finished prose.

---

# 22. The AST is more important than the prose

I would therefore define the pipeline as:

```text
SIMULATION
    ↓
SCENE SPEC
    ↓
DIALOGUE AST
    ↓
PROSE
    ↓
AUDIO
```

rather than:

```text
SIMULATION
    ↓
LLM paragraph
    ↓
hope
```

The AST is the bridge between deterministic reality and creative language.

That may become one of the most important artifacts in the entire system.

---

# 23. Human review should happen before expensive media

This is a very important operational improvement.

A human shouldn't first encounter an episode after:

```text
TTS
render
compositing
encoding
```

Instead:

```text
simulation
 ↓
scene specification
 ↓
dialogue AST
 ↓
human review
 ↓
TTS
 ↓
render
```

The reviewer should be able to answer in perhaps 30–60 seconds:

* Is this funny?
* Is the conflict understandable?
* Does the character sound right?
* Is the outcome satisfying?
* Is anything nonsensical?
* Does the scene feel repetitive?

If not, throw it away **before** spending production resources.

---

# 24. The tracer bullet is the most important next milestone

I agree strongly with the material's repeated insistence on this.

But I would make it even more specific.

The first milestone should not be:

> "Build the episode pipeline."

It should be:

> **Produce one complete, extremely short scene through every boundary.**

Something like:

```text
ONE CHARACTER
TWO CHARACTERS
ONE GRIEVANCE
ONE LOCATION
ONE AUDIO LINE
ONE SIMPLE BACKGROUND
ONE SIMPLE ANIMATION
ONE RENDER
```

Maybe 3–10 seconds.

The purpose isn't artistic quality.

The purpose is proving:

```text
ledger
 ↓
simulation
 ↓
scene spec
 ↓
dialogue
 ↓
TTS
 ↓
timing
 ↓
visual contract
 ↓
TSX
 ↓
render
 ↓
video
```

If that works, you have an actual system.

Everything before that is architecture.

---

# 25. Define success and failure for the tracer bullet

I would explicitly write down:

### Must pass

```text
simulation produces valid scene
dialogue conforms to scene
audio renders
duration measured correctly
timeline generated
visuals load
render completes
audio/video synchronize
final video is watchable
```

### Should pass

```text
asset validation
schema validation
continuity validation
knowledge validation
action validation
```

### Nice to have

```text
byte-identical second render
fully hermetic reproduction
container digest verification
advanced provenance
```

This prevents a very common engineering failure:

> spending days solving a reproducibility problem before proving that the thing can make a scene.

---

# 26. Reproducibility should mean preservation first, regeneration second

I would revise the original philosophy here.

There are actually two different goals.

### Preservation

Can we guarantee that the finished episode remains available?

The answer should be:

> **Archive the finished media and the inputs.**

### Regeneration

Can we recreate the episode?

The answer should be:

> **Pin the relevant environment and preserve the artifacts necessary to rerender it.**

Don't make regeneration your only preservation mechanism.

A final MP4 should not depend upon future software being perfectly reproducible.

---

# 27. Think in terms of a reproducibility ladder

The material's idea here is very good.

You can have:

```text
Level 1
same intent

Level 2
same structured scene

Level 3
same timing / decoded media within tolerance

Level 4
same encoded stream

Level 5
byte-identical container
```

The higher levels become increasingly difficult and increasingly vulnerable to irrelevant environmental details.

For an early system, I would care most about:

```text
same canonical state
same simulation result
same dialogue structure
same timing
same archived assets
same perceptual output
```

That's much more valuable than obsessing over identical MP4 bytes.

---

# 28. Archive generated assets as artifacts, not recipes

This is especially important for diffusion.

Don't assume:

```text
seed + prompt
```

is sufficient to recreate a visual years later.

Instead:

```text
generated plate
+
prompt
+
model/version metadata
+
generation parameters
```

should all be preserved.

The actual image is the authoritative artifact.

Same philosophy applies to:

* TTS audio
* generated textures
* rendered plates
* intermediate assets

If it is expensive or uncertain to regenerate, **archive it**.

---

# 29. Source-baking is valuable, but understand why

I agree with the material's conclusion that source-baking is useful.

But its strongest reason isn't mystical reproducibility.

It's **historical isolation**.

Imagine:

```text
Episode 001
Episode 002
Episode 003
```

all use:

```text
GoblinPuppet.tsx
```

Then you improve:

```text
GoblinPuppet.tsx
```

Suddenly all three episodes change.

That is terrible for an archived episodic project.

Instead:

```text
Episode 001/
    GoblinPuppet.tsx

Episode 002/
    GoblinPuppet.tsx

Episode 003/
    GoblinPuppet.tsx
```

Now old episodes are frozen.

That is a very understandable property:

> **New production can improve without rewriting history.**

I think that is the strongest justification for source-baking.

---

# 30. But don't let source-baking become an excuse for chaos

There's a corresponding danger.

If every episode contains arbitrary hand-edited code, you eventually lose your architecture.

So I would distinguish:

### Generator-owned

```text
episode generation
standard components
runtime contracts
timing infrastructure
```

### Episode-owned

```text
scene data
assets
specific composition
approved overrides
```

### Human edits

These should be deliberate and visible.

Ideally:

```text
generated source
+
explicit episode patch
```

rather than mysterious edits that nobody knows about.

---

# 31. QA should be layered from cheap to expensive

This is another principle worth retaining.

Think:

```text
LEVEL 1
Does the file exist?

LEVEL 2
Does the JSON validate?

LEVEL 3
Does the WAV actually contain audio?

LEVEL 4
Does duration match?

LEVEL 5
Are frame ranges valid?

LEVEL 6
Are assets geometrically correct?

LEVEL 7
Does the scene obey semantic constraints?

LEVEL 8
Does a human think it is good?
```

Don't spend an expensive model call detecting that a file is zero bytes.

Don't ask a human to discover a schema error.

Don't render an entire episode before discovering a missing asset.

The cheapest deterministic checks should happen first.

---

# 32. Don't over-engineer the QA with another LLM

The material makes an important point that deserves strengthening.

An LLM checking another LLM isn't magically deterministic.

If your rule is:

> Character X must not physically attack Y in this scene.

then a structured action check is much better:

```text
action ∈ allowed_actions
```

or:

```text
verb_lemma ∉ banned_actions
```

A simple deterministic validator can catch a huge percentage of structural violations.

Use AI where interpretation is genuinely required.

Use ordinary code wherever the rule can be expressed as ordinary code.

---

# 33. The same principle applies everywhere

This becomes a general architectural rule:

> **If a requirement can be expressed as a deterministic invariant, don't ask an LLM to enforce it.**

Examples:

### Bad

> "Please make sure Bog doesn't know the secret."

### Better

Don't put the secret in Bog's context.

### Bad

> "Please don't have characters teleport."

### Better

Check the movement/location state.

### Bad

> "Please make the scene last approximately four seconds."

### Better

Measure the generated audio.

### Bad

> "Please remember that Bog is injured."

### Better

Inject the injury from the ledger.

This is the architecture becoming increasingly rigorous.

---

# 34. Separate semantic truth from representation

This is perhaps the deepest recurring pattern across the whole design.

You have:

```text
MEANING
```

and:

```text
REPRESENTATION
```

Meaning:

```text
Bog is injured.
Bog is angry.
Bog is in the siphon room.
Snerk stole the siphon.
```

Representation:

```text
Bog.png
angry_pose.svg
siphon_room.png
voice.wav
camera position
animation
```

The first layer should survive changes to the second.

That means you should eventually be able to say:

> Make the same episode using a completely different visual style.

And the underlying:

```text
world
simulation
dialogue
timing
```

doesn't need to change.

That's a powerful architecture.

---

# 35. Don't allow the visual system to become a second simulation

This is a subtle failure mode worth guarding against.

Suppose Remotion says:

> "Because Bog is standing here visually, therefore Bog is in this location."

That's backwards.

The ledger says:

```text
Bog is here.
```

The renderer depicts it.

Similarly:

```text
Animation shows Bog falling.
```

doesn't mean:

```text
Bog is injured.
```

The simulation should already have determined the injury.

The media is an **output**, not evidence.

This gives you a very clean rule:

> **Media describes the state; media does not create the state.**

---

# 36. The project needs explicit stage contracts

I would formalize this more strongly than the pasted material does.

Each stage should have:

```text
INPUT
OUTPUT
INVARIANTS
FAILURE CONDITIONS
```

For example:

## Simulation

**Input**

```text
canon
ledger
seed
rules
```

**Output**

```text
simulation_result.json
```

**Invariant**

```text
all state transitions are legal
```

---

## Dialogue

**Input**

```text
scene specification
character knowledge
character voice constraints
```

**Output**

```text
dialogue_ast.json
```

**Invariant**

```text
dialogue does not contradict scene facts
```

---

## TTS

**Input**

```text
approved dialogue
```

**Output**

```text
wav
```

**Invariant**

```text
audio corresponds to approved dialogue
```

---

## Render

**Input**

```text
timing
visual manifests
audio
scene data
```

**Output**

```text
mp4
```

**Invariant**

```text
render contains the approved scene
```

This makes debugging dramatically easier.

When something goes wrong, ask:

> **Which contract was violated?**

rather than:

> "Why is the AI acting weird?"

---

# 37. Log every important transformation

I would preserve another idea from the material:

```text
input
→ transformation
→ output
```

For important generated artifacts, record:

```text
timestamp
version
model
parameters
seed
input hash
output hash
status
```

Especially for LLM calls.

You want to eventually answer:

> Why did this scene change?

Was it:

```text
different simulation?
different prompt?
different model?
different TTS?
different asset?
different renderer?
```

Without provenance, that becomes archaeology.

---

# 38. But don't build a giant provenance system yet

This is where I would resist the material's tendency toward overengineering.

You probably don't need:

```text
Merkle DAG
content-addressed build graph
distributed orchestration
cryptographic provenance chain
C2PA
two-phase commit
distributed workers
```

at the beginning.

A directory containing:

```text
episode.json
simulation.json
dialogue_ast.json
timing.json
manifest.json
audio/
assets/
render/
metadata.json
```

plus Git may give you most of the practical benefit initially.

The principle is valuable.

The elaborate infrastructure is not yet justified.

---

# 39. The minimal viable architecture is surprisingly small

If I were reducing the whole project to its essential system, I'd build only this:

```text
                ┌──────────────┐
                │    CANON     │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │    LEDGER    │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │  HEX/SPATIAL │
                │   SIMULATOR  │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ SCENE / AST  │
                └──────┬───────┘
                       │
                 HUMAN REVIEW
                       │
                       ▼
                ┌──────────────┐
                │     TTS      │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │    TIMING    │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │    RENDER    │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │      QA      │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │    ARCHIVE   │
                └──────────────┘
```

That is enough to prove almost every important architectural assumption.

---

# 40. I would make the first visual system deliberately boring

This is important.

Don't start with:

```text
diffusion
video generation
matting
complex camera systems
3D
motion synthesis
```

Start with:

```text
PNG characters
simple backgrounds
simple transforms
simple mouth shapes
simple cuts
```

Why?

Because the question isn't:

> Can we make beautiful AI video?

The first question is:

> Can the deterministic world produce a coherent episode and can the presentation layer faithfully depict it?

The 2D cutout system isolates that question.

Once that works, you can replace:

```text
cutout rendering
```

with:

```text
diffusion-generated plates
```

without changing the fundamental world architecture.

That is excellent separation of concerns.

---

# 41. Lip sync should be treated as presentation, not truth

The material correctly identifies lip sync as a potential pain point.

I'd add one architectural principle:

> **The mouth animation should never determine the dialogue timing.**

The order should be:

```text
approved dialogue
 ↓
audio
 ↓
audio timing
 ↓
viseme extraction
 ↓
mouth animation
```

not:

```text
mouth animation
 ↓
guess speech timing
```

Amplitude-based mouth movement may be perfectly adequate for the first visual prototype.

If it isn't, upgrade the representation later.

The important thing is that it remains downstream.

---

# 42. The system needs a distinction between "draft" and "broadcast"

This is a very useful concept from the pasted material.

For example:

### Draft mode

Missing:

```text
terrified_pose
```

might produce:

```text
fallback to idle
```

so that the pipeline can continue while developing.

### Broadcast mode

The same missing asset should cause:

```text
FAIL
```

This is a very good general pattern:

```text
development permissive
production strict
```

You don't want development to become painful.

But you also don't want production quietly papering over missing assets.

---

# 43. There should be a "simulation-only" mode

I would make this a first-class command.

Something like:

```bash
simulate --episodes 100
```

and:

```bash
simulate --episode 12 --verbose
```

No TTS.

No rendering.

No GPU.

No external services if possible.

This will probably become one of your most-used tools.

It allows you to work on the hardest part of the system — **world behavior** — at essentially zero media cost.

---

# 44. The simulator should produce human-readable explanations

Don't only output machine JSON.

Produce something like:

```text
CYCLE 14

Bog moved from siphon_room → camp.

Reason:
    high resentment toward Snerk
    sought proximity to target

Snerk was already at camp.

Encounter triggered.

Grievance:
    brass siphon disappearance

Bog knowledge:
    siphon missing
    suspects Snerk

Snerk knowledge:
    stole siphon
    doesn't know Bog saw him

Outcome:
    COSTLY_WIN

Winner:
    Bog

Consequences:
    Bog gains injury
    Snerk gains resentment
    Mog witnesses encounter
    Mog learns Bog suspects Snerk
```

This is invaluable for debugging.

If you can't explain why the simulation selected an event, you probably don't understand the simulation well enough yet.

---

# 45. Every consequential event should have a reason

This is another principle I'd add.

A good simulator shouldn't merely say:

```text
fight happened
```

It should be possible to inspect:

```text
Why did this happen?
```

For example:

```text
PAIR_SCORE
+ proximity
+ unresolved grievance
+ resentment
+ recent interaction
- cooldown
- health penalty
```

You don't necessarily need a complicated mathematical explanation system.

But you should be able to trace causality.

That creates a valuable property:

> **The world is explainable.**

If the simulation produces something absurd, you can discover which rule caused it.

---

# 46. Every state mutation should have a cause

This follows naturally.

Instead of:

```json
"resentment": 0.7
```

prefer a history that lets you understand:

```text
resentment increased
because:
    witnessed humiliation
    unresolved debt
    lost confrontation
```

You don't necessarily need full event sourcing.

A simple event record can accomplish much of this:

```json
{
  "event": "COSTLY_WIN",
  "actor": "Bog",
  "target": "Snerk",
  "effects": [
    "bog_injured",
    "snerk_resentment+0.2"
  ]
}
```

That gives you an audit trail without building a giant event-sourcing architecture.

---

# 47. I would favor a relational/simple ledger initially

This is one place where I'd be deliberately conservative.

The theoretical elegance of:

```text
pure reducer
event sourcing
replay from genesis
```

is attractive.

But initially you can probably get most of what you need from:

```text
current_state tables
+
event_log
```

For example:

```text
characters
locations
relationships
conditions
knowledge
objects
events
movements
```

Then:

```text
events
```

provide history.

You can always move toward a stronger event-sourced architecture if the actual project demonstrates that it needs it.

---

# 48. The architecture should be allowed to evolve

This is important because some of the original material appears to suffer from "architecture fossilization."

Don't decide today:

> "This is the final spatial engine."

Instead decide:

> "This is the smallest clean interface that lets us learn."

That means interfaces should be:

```text
small
pure
testable
easy to replace
```

rather than:

```text
complete
general
future-proof
enterprise-ready
```

Future-proofing is often just speculation wearing a suit.

---

# 49. The hex engine should be a module now, not necessarily a repository

I agree strongly with this conclusion.

Start:

```text
sower-engine/
    spatial/
        coords.ts
        distance.ts
        neighbors.ts
        pathfinding.ts
        visibility.ts
```

with the rule:

> spatial code imports nothing from the Sower.

Then later, if another project actually needs it:

```text
goblin-spatial
```

can be extracted.

That gives you a very useful property:

> **Future extraction is possible without premature distribution.**

That's the right kind of modularity.

---

# 50. The project needs two kinds of tests

I would explicitly divide testing into:

## Mechanical tests

```text
distance(A,B) == distance(B,A)
neighbors have correct count
movement doesn't cross impassable terrain
invalid coordinates rejected
ledger mutations obey schema
frame calculations are correct
```

These should be extremely deterministic.

## World-behavior tests

```text
injured characters recover
characters don't fight endlessly
secrets propagate correctly
grievances eventually resolve
characters don't teleport
dead/disabled characters don't participate
objects don't duplicate
```

These are more like simulations.

You need both.

---

# 51. Test invariants, not just examples

For example, don't only test:

```text
Bog moves from A to B.
```

Also test:

```text
distance(A,B) >= 0

distance(A,B) == distance(B,A)

distance(A,A) == 0

neighbor(A) contains B
    ↔
neighbor(B) contains A

q + r + s == 0
```

For the world:

```text
every actor has exactly one position

every object has at most one owner

every knowledge fact has a provenance

every scene participant exists

every scene location exists
```

These invariants are where deterministic architecture becomes extremely powerful.

---

# 52. Don't optimize prematurely

The original material has many ideas involving:

* distributed workers
* Cloudflare
* durable objects
* multiple pods
* CAS
* complex orchestration

I'd ignore almost all of them initially.

The question is:

> How long does it actually take to produce one episode?

If it's:

```text
10 seconds
```

you have no scaling problem.

If it's:

```text
6 hours
```

then profile where the time goes.

If it's:

```text
200 hours
```

then optimize.

Performance architecture should be derived from measurements.

---

# 53. Likewise, don't build distributor infrastructure before having a distributor

This sounds obvious, but it is an important lesson from the material.

Things such as:

```text
C2PA
MovieLabs packaging
Aspera
broadcast-specific delivery
studio-grade provenance
```

may all be legitimate technologies.

But they solve problems that arise from particular production environments.

They don't help answer:

> Are the goblins funny?

Until there is an actual delivery requirement, they should remain notes rather than infrastructure.

---

# 54. The most important metrics aren't technical

I would add an eventual episode evaluation dashboard.

For example:

```text
WORLD HEALTH
────────────────
pair diversity
character participation
grievance diversity
location diversity
condition distribution
knowledge spread

PRODUCTION HEALTH
─────────────────
render failures
audio failures
missing assets
schema failures
timing errors

CREATIVE HEALTH
────────────────
human rating
scene clarity
character distinctiveness
comedic payoff
repetition
dialogue quality
```

The last category is crucial.

You need some mechanism for learning whether the system is actually becoming better.

---

# 55. Build an evaluation corpus as you go

Every reviewed scene can become training/evaluation material.

Store:

```text
simulation state
scene specification
LLM prompt
LLM output
lint results
human acceptance
human notes
final audio
final video
```

Eventually you'll have:

```text
good examples
bad examples
rejected examples
failure categories
```

That becomes extraordinarily valuable.

You won't merely be building a production system.

You'll be building a **dataset describing what good output looks like for this specific world**.

---

# 56. The most important human role is probably editorial, not technical

Once the machinery works, the highest-value human intervention is likely to be:

```text
What should happen?
Why is it interesting?
Does it feel like these characters?
Is this funny?
Is this surprising?
```

The computer is extremely good at:

```text
consistency
state
geometry
timing
validation
bookkeeping
```

The human is still much more useful for:

```text
taste
tone
judgment
comedic timing
meaning
```

The architecture should exploit that division rather than trying to eliminate the human entirely.

---

# 57. One thing I would add: an explicit "episode seed"

Every episode should have a single top-level seed.

For example:

```text
episode_seed = 481927
```

Then derive sub-seeds:

```text
movement_seed
pairing_seed
grievance_seed
combat_seed
visual_seed
```

This prevents unrelated random operations from changing each other.

For example, adding a new random choice in the visual system shouldn't change who wins the fight.

That gives you a very useful property:

> **Representation changes don't perturb narrative randomness.**

This is an extension of the randomness separation principle.

---

# 58. Another important addition: don't let randomness consume randomness globally

A common mistake is:

```text
rng.next()
rng.next()
rng.next()
```

everywhere.

Then adding one random operation near the beginning changes every subsequent result.

Instead conceptually derive randomness by namespace:

```text
seed(
    episode_seed,
    "movement",
    cycle,
    character_id
)
```

and:

```text
seed(
    episode_seed,
    "combat",
    encounter_id
)
```

Then modifying the visual generator doesn't unexpectedly change the story.

This is a surprisingly important reproducibility improvement.

---

# 59. Another addition: every episode should have a causal summary

At the end of an episode, generate a machine-readable and human-readable summary:

```text
EPISODE 007

Initial state:
    ...

Major events:
    ...

State mutations:
    ...

New knowledge:
    ...

Relationships changed:
    ...

Objects moved:
    ...

Unresolved conflicts:
    ...

Final positions:
    ...

Outstanding grievances:
    ...
```

That gives you a bridge between episodes.

It also makes debugging continuity much easier.

---

# 60. I would explicitly distinguish "canon" from "history"

This deserves its own conceptual boundary.

### Canon

What is permanently true about the world.

```text
Bog is a goblin.
Siphon room exists.
Camp has three entrances.
```

### State

What is true now.

```text
Bog is injured.
Siphon is missing.
Snerk is in camp.
```

### History

What happened.

```text
Snerk stole siphon on cycle 14.
Bog discovered disappearance on cycle 15.
```

Those three things should not be collapsed.

That distinction will become increasingly important as the series grows.

---

# 61. And distinguish "history" from "memory"

This is another subtle but powerful distinction.

History says:

```text
Snerk stole the siphon.
```

Memory says:

```text
Bog knows Snerk stole the siphon.
```

These are not the same.

You can therefore have:

```text
WORLD HISTORY
        │
        ├── Bog's memory
        ├── Snerk's memory
        ├── Mog's memory
        └── Zog's memory
```

That gives you a principled foundation for dramatic irony.

---

# 62. The whole architecture can be summarized as five layers

After stripping away almost everything else, I think the project really consists of:

## Layer 1 — World

```text
canon
map
characters
objects
rules
```

## Layer 2 — State

```text
ledger
knowledge
relationships
positions
conditions
history
```

## Layer 3 — Causality

```text
movement
encounters
grievances
resolution
state transitions
```

## Layer 4 — Expression

```text
dialogue
voice
animation
visuals
music
```

## Layer 5 — Preservation

```text
artifacts
schemas
versions
metadata
final media
```

That is the architecture I'd keep in my head.

Everything else is implementation detail.

---

# 63. The most important invariants

If I had to reduce the entire project to a short list of rules, they would be these:

### Invariant 1

**The ledger is authoritative.**

### Invariant 2

**The simulation determines events before language generation.**

### Invariant 3

**The renderer cannot change world state.**

### Invariant 4

**Characters only receive information they are supposed to possess.**

### Invariant 5

**Narrative randomness is seeded and isolated.**

### Invariant 6

**Audio determines visual timing.**

### Invariant 7

**Every major stage produces an inspectable artifact.**

### Invariant 8

**Old episodes cannot silently change because new code was released.**

### Invariant 9

**Deterministic rules are enforced by deterministic code whenever possible.**

### Invariant 10

**The system must be able to explain why a consequential event occurred.**

### Invariant 11

**The simulation must be testable without producing media.**

### Invariant 12

**The finished media is archived independently of the ability to regenerate it.**

Those twelve rules are more valuable than dozens of pages of infrastructure design.

---

# 64. What I would actually build first

If this were my project, I would resist almost everything except the following sequence.

### Phase 1 — World model

Build:

```text
canon schema
character schema
object schema
location/hex schema
ledger
```

No AI.

No video.

No cloud.

---

### Phase 2 — Spatial engine

Build:

```text
coordinates
distance
neighbors
movement
occupancy
witness queries
```

with tests.

Keep it stateless.

---

### Phase 3 — Simulation

Build:

```text
movement
pair selection
grievance selection
outcome resolution
state mutation
event log
```

Then:

```bash
simulate --episodes 1000
```

until the world behaves interestingly.

---

### Phase 4 — Grievances

Hand-author perhaps 10 excellent ones.

Not 100 mediocre ones.

Use them to discover what the system actually needs.

---

### Phase 5 — Scene specification

Produce:

```text
scene.json
```

containing everything that has already been decided.

---

### Phase 6 — LLM expression

Generate:

```text
dialogue_ast.json
```

Then validate it.

Only after validation should prose become production input.

---

### Phase 7 — Human editorial gate

Read it.

Reject bad scenes.

Fix the system when the same kind of bad scene keeps occurring.

---

### Phase 8 — TTS

Generate actual audio.

Measure it.

Make audio the timing authority.

---

### Phase 9 — Simple visual renderer

Use:

```text
PNG
simple transforms
simple backgrounds
simple mouth shapes
```

and make one short scene.

---

### Phase 10 — QA and archive

Validate everything.

Archive:

```text
world state
simulation result
scene spec
dialogue
audio
visual assets
timing
render source
final MP4
metadata
```

At that point you have something real.

---

# 65. What I would explicitly NOT build yet

I would put these on a "later, only if justified" list:

```text
distributed orchestration
Cloudflare control plane
Durable Objects
agent-driven repo modification
event-sourcing framework
Merkle artifact graph
Bazel/Nix-like build system
C2PA
MovieLabs packaging
Aspera
studio distribution tooling
multi-pod rendering
complex provenance infrastructure
advanced diffusion pipeline
sophisticated matting
property-based simulation fuzzing
multiple repositories for every component
```

Not because these technologies are bad.

Because **they don't answer the highest-risk questions yet.**

The highest-risk questions are:

1. Does the simulation behave?
2. Does continuity survive?
3. Are the characters distinct?
4. Are the grievances interesting?
5. Does the generated dialogue sound good?
6. Can a short scene reliably make it through the pipeline?
7. Can the system produce another scene without breaking the first?

Those questions should consume your attention first.

---

# 66. The deepest architectural insight

I think there is an even deeper idea hiding underneath all of this.

You're not really building:

> **an AI video generator.**

You're building something closer to:

> **a persistent fictional world whose observable history can be rendered into episodes.**

That changes how you think about the project.

The fundamental object isn't the video.

It is the **world state and its history**.

The episode is one projection of that history.

```text
                 WORLD HISTORY
                      │
          ┌───────────┼───────────┐
          │           │           │
       Episode 1   Episode 2   Episode 3
          │           │           │
       rendering   rendering   rendering
```

And potentially later:

```text
                     WORLD
                       │
          ┌────────────┼─────────────┐
          │            │             │
       animation     comic        audio
          │            │             │
       episode      episode       drama
```

That is why keeping **meaning separate from representation** is so valuable.

The same underlying world could theoretically be rendered in radically different ways.

---

# 67. The final distilled architecture

If I had to put the entire useful portion of the pasted material onto one page, it would be this:

```text
                         CANON
                           │
             immutable world definitions
                           │
                           ▼
                     WORLD LEDGER
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
   characters           objects             map
   conditions           history             terrain
   knowledge            debts               locations
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                     SIMULATION
                           │
             deterministic + seeded
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
    movement           encounter           grievance
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                    STATE TRANSITION
                           │
                           ▼
                     SCENE SPEC
                           │
                           ▼
                    DIALOGUE AST
                           │
                     deterministic
                      validation
                           │
                     HUMAN REVIEW
                           │
                           ▼
                          TTS
                           │
                           ▼
                    MEASURE AUDIO
                           │
                           ▼
                     TIMING MANIFEST
                           │
                           ▼
                    VISUAL MANIFEST
                           │
                           ▼
                       RENDERER
                           │
                           ▼
                          QA
                           │
                           ▼
                        ARCHIVE
```

And surrounding all of it:

```text
              ┌─────────────────────────┐
              │  VERSIONED ARTIFACTS    │
              │  LOGGED TRANSFORMATIONS │
              │  SEEDED RANDOMNESS      │
              │  SCHEMA VALIDATION      │
              └─────────────────────────┘
```

---

# The handful of ideas I would protect at all costs

If the project eventually becomes much more sophisticated, I would still protect these:

**1. Reality belongs to the deterministic world model.**

**2. The ledger is the authority.**

**3. Space creates causality.**

**4. Simulation happens before language generation.**

**5. Knowledge and belief are properties of individual characters, not merely of the world.**

**6. LLMs express predetermined situations; they don't secretly decide the world's facts.**

**7. Audio establishes timing; visuals follow it.**

**8. Semantic state and visual representation remain separate.**

**9. Old episodes are immutable historical artifacts.**

**10. Every important transformation leaves an inspectable artifact.**

**11. Cheap deterministic validation happens before expensive processing.**

**12. The simulator can run without media.**

**13. Human editorial judgment happens before expensive production.**

**14. Generated media is archived rather than trusted to be perfectly regenerable.**

**15. The first proof of the architecture is a tiny end-to-end scene, not a sophisticated infrastructure diagram.**

And perhaps most importantly:

> **Do not allow the sophistication of the production machinery to become a substitute for discovering whether the fictional world itself is interesting.**

The hex map, ledger, simulation, grievances, knowledge model, and deterministic state transitions are not valuable because they make the architecture impressive. They're valuable because they give the fictional universe **memory, causality, constraints, and consequences**.

The LLM then gets to do something it is actually good at: **turning those consequences into language with personality.**

That is, in my view, the core idea worth carrying forward from the entire body of material.
Yes. The architecture I see here is much more coherent than a collection of individual scripts. It is essentially a **deterministic narrative-and-media compiler** in which generative models are subordinate workers, while the ledger, simulation, contracts, and timing system define what is actually allowed to exist.

There are also a few mathematical and architectural points I would correct before freezing the design.

## 1. The fundamental idea

The deepest rule is:

> **Simulation determines what happens. The language model determines how it is said. The renderer determines how it is seen and heard.**

Those three responsibilities should not be allowed to collapse into one another.

The system therefore has five major authority boundaries.

| Concern                                   | Authority                 |
| ----------------------------------------- | ------------------------- |
| Canonical facts and mutable world state   | Canon / Ledger            |
| What can physically or narratively happen | Deterministic simulation  |
| How an already-defined event is expressed | LLM                       |
| How speech becomes timed media            | TTS + measured audio      |
| How meaning becomes pictures              | Renderer / exposure sheet |

The important part is not merely documenting those boundaries. The software needs to **enforce them**.

A useful practical test is:

> If an LLM generates a scene that contradicts the ledger, can the pipeline reject it without a human having to notice the contradiction?

If the answer is no, the ledger is not actually authoritative. It is merely advisory.

---

# 2. I would make one architectural concept even more explicit: this is a compiler

The architecture becomes considerably easier to reason about if you think of it as a compiler pipeline:

```text
CANON
  ↓
LEDGER STATE
  ↓
SIMULATION
  ↓
SCENE PLAN / IR
  ↓
DIALOGUE AST
  ↓
AUDIO
  ↓
EXPOSURE SHEET
  ↓
RENDER
  ↓
QA / ARCHIVE
```

Each stage should consume typed inputs and produce a discrete artifact.

That gives you a very powerful debugging rule:

> **When something is wrong, determine which artifact first became wrong.**

For example:

**Wrong character knows secret**

```text
Canon            correct
Ledger           correct
Knowledge state  correct
Scene Plan       WRONG
Dialogue AST     derived wrong
Audio            irrelevant
Render           irrelevant
```

That is dramatically easier to debug than a giant generation pipeline where everything is generated together.

---

# 3. There is one missing layer I would add: the Scene Plan / IR

Your `dialogue_ast.json` is close to this, but I would distinguish a **mechanical scene plan** from the eventual prose.

Something like:

```ts
interface ScenePlan {
  episode_id: string;
  scene_id: string;

  participants: string[];
  location_id: string;

  grievance_id: string;
  objective_by_actor: Record<string, string>;

  known_facts: Record<string, string[]>;
  forbidden_facts: Record<string, string[]>;

  allowed_actions: Record<string, ActionEnum[]>;

  mandated_beats: BeatRequirement[];
  prohibited_beats: BeatRequirement[];

  outcome: Outcome;
  margin: number;

  state_mutations: StateMutation[];
  witness_updates: KnowledgeMutation[];

  required_props: string[];
  required_assets: string[];

  seed: number;
}
```

Then:

```text
Simulation
    ↓
ScenePlan
    ↓
LLM
    ↓
DialogueAST
```

The distinction matters enormously.

The **Scene Plan says what the scene means mechanically**.

The **Dialogue AST says how that meaning is expressed conversationally**.

That prevents the language model from quietly redefining the simulation.

---

# 4. The spatial model is conceptually excellent

The separation:

> **Canon owns the map. Code owns geometry. Ledger owns coordinates.**

is exactly the kind of boundary I would preserve.

More explicitly:

### Canon

Defines:

```text
swamp
culvert
relay
hut
ridge
etc.
```

and their semantic relationships.

### Spatial library

Defines mathematical operations:

```text
neighbors()
distance()
ring()
within_range()
line_of_sight()
path()
```

### Ledger

Defines:

```text
Bog = (q,r,s)
Spleen = (q,r,s)
Wart = (q,r,s)
```

The spatial module should not secretly become another state store.

That means it should ideally be a **pure function library**:

```ts
neighbors(position)
distance(a, b)
visible(a, b, world)
```

rather than:

```ts
world.moveCharacter(...)
world.revealCharacter(...)
```

The former keeps the source of truth obvious.

---

# 5. The spatial system is also a narrative causality engine

This is more important than the actual hex mathematics.

Spatial simulation gives you a natural answer to questions such as:

* Who could encounter whom?
* Who could plausibly witness an event?
* Who could arrive later?
* Which locations become socially important?
* Which characters repeatedly cross paths?
* Which secrets have a realistic route of transmission?

Therefore the map isn't just an animation convenience.

It is part of the **causal machinery of the story**.

That is one of the strongest aspects of the architecture.

---

# 6. Your 2d6 distribution is mostly correct — but I would correct two statements

The difference between two independent 2d6 rolls is indeed distributed over:

$$
-10 \ldots +10
$$

with 1,296 equally likely ordered underlying combinations.

Your central values are correct:

| Margin | Combinations |
| -----: | -----------: |
|      0 |          146 |
|     ±1 |     140 each |
|     ±2 |     125 each |
|     ±3 |     104 each |
|     ±4 |      80 each |
|     ±5 |      56 each |
|     ±6 |      35 each |
|     ±7 |      20 each |
|     ±8 |      10 each |
|     ±9 |       4 each |
|    ±10 |       1 each |

Thus:

$$
P(|D|\le2)=\frac{676}{1296}=52.16\%
$$

That part is right.

Likewise:

$$
P(|D|\ge5)=\frac{252}{1296}=19.44\%
$$

and

$$
P(|D|\ge6)=\frac{140}{1296}=10.80\%.
$$

### But the distribution is not literally triangular

It is better described as a **symmetric discrete difference distribution produced by two 2d6 sums**.

Calling it triangular is a useful intuition, but not mathematically exact.

### More importantly, the “clean win” figure needs correction

For a positive margin of at least +4:

$$
P(D\ge4)=
\frac{80+56+35+20+10+4+1}{1296}
=
\frac{206}{1296}
\approx15.90\%.
$$

For either side:

$$
P(|D|\ge4)=31.79\%.
$$

So **28.7% is not the correct value** for either interpretation.

That should be corrected in the architecture document.

---

# 7. The +3 leverage claim also needs a tiny correction

A +3 shift produces:

$$
P(D+3>0)=P(D>-3)
$$

which means:

$$
P(D\ge-2)
$$

and therefore:

$$
\frac{1058}{1296}\approx81.64\%.
$$

So it is **about 81.6%**, rather than strictly over 82%.

The architectural conclusion is still correct:

> A +3 deterministic modifier is enormous relative to the natural spread of the contest.

That is the important insight.

A character attribute system ranging from 1–5 can become almost irrelevant if Strings/debuffs routinely produce ±3 or larger changes.

I would therefore treat modifier magnitude as a **calibration problem**, not something to settle theoretically.

Run 10,000 or 100,000 simulated encounters and inspect:

```text
win probability by attribute difference
win probability by string count
outcome distribution
frequency of extreme margins
frequency of ties
```

The simulation should tell you whether the mechanics produce the dramatic distribution you actually want.

---

# 8. I would preserve your “simulation before language” rule almost absolutely

This is probably the single most valuable design decision.

The LLM should not decide:

> “Spleen beats Bog.”

It should receive:

```text
Spleen won.
Costly win.
Margin +2.
One String consumed.
Bog becomes humiliated.
Spleen becomes exhausted.
Bog must surrender the wrench.
```

and then find dramatically interesting language through which that state becomes visible.

Otherwise the language model becomes an undocumented second simulation engine.

That is extremely dangerous because the prose begins determining world state accidentally.

---

# 9. Your six-level hierarchy is valuable

I understand the hierarchy as:

```text
L1  Simulation Cycle
    ↓
L2  Episode
    ↓
L3  Scene
    ↓
L4  Beat
    ↓
L5  Shot
    ↓
L6  Frame
```

The crucial conceptual separation is:

> **Narrative units are semantic; shots are representational.**

A beat does not equal a shot.

For example:

```text
Beat:
Spleen accuses Bog of taking the silver spoon.

Shot 1:
Spleen speaks.

Shot 2:
Cut to Bog.

Shot 3:
Insert shot of spoon.

Shot 4:
Bog looks away.
```

The single narrative beat can therefore generate four presentation units.

Conversely, a continuous camera shot could contain multiple beats.

That is exactly why narrative AST and exposure sheet should be different artifacts.

---

# 10. Audio really should be the clock

This is another particularly strong architectural decision.

The renderer should not guess speech duration.

Instead:

```text
text
 ↓
TTS
 ↓
WAV
 ↓
ffprobe
 ↓
actual duration_ms
 ↓
frame calculation
 ↓
exposure timeline
```

At 24 fps:

$$
F=\left\lceil\frac{duration_{ms}}{1000}\times24\right\rceil.
$$

Then anchor everything against **absolute frame positions**, rather than repeatedly adding rounded durations.

This prevents cumulative timing drift.

I would also make one distinction explicit:

### Audio duration is an observation.

### Frame count is a derived presentation coordinate.

Those should remain separate fields:

```json
{
  "duration_ms": 1874,
  "frame_budget": 45
}
```

That is a very good example of separating reality from representation.

---

# 11. Freeze the audio before rendering

Your proposal that approved stems become immutable is important.

Once:

```text
dialogue
→ TTS
→ WAV
→ measured duration
```

has happened, don't silently regenerate the WAV during rendering.

Otherwise you can get:

```text
same text
different synthesis
different duration
different frame budget
different cut timing
```

and suddenly your exposure sheet isn't actually locked.

The better model is:

```text
TTS stage = produces artifact
Render stage = consumes artifact
```

not:

```text
Render stage = secretly calls TTS
```

---

# 12. Your epistemic architecture is ambitious but potentially extremely powerful

The distinction between:

```text
objective world state
```

and

```text
character belief
```

is essential for this kind of drama.

A character can believe:

```text
Bog stole the siphon
```

while the ledger says:

```text
Spleen actually moved the siphon
```

Those must be independently representable.

Your `BeliefRecord` gives you that capability.

I would, however, make one conceptual adjustment:

## Don't make belief probability equivalent to truth probability.

A character's:

```text
subjective_probability = 0.8
```

does not necessarily mean the proposition is objectively 80% likely.

It means something closer to:

> “Given this character's information and mental model, this proposition has confidence 0.8.”

That distinction becomes valuable later.

---

# 13. Rumor propagation should probably be deterministic, not “AI-ish”

Your idea of source pointers and propagation chains is excellent:

```text
Event
 ↓
Witness
 ↓
Testimony
 ↓
Rumor
 ↓
Character C
```

That means the system can later answer:

> “Why does Wart believe that?”

with an actual provenance chain rather than an invented explanation.

I would store something like:

```text
belief_id
holder
proposition
source_event
parent_belief
transmission_method
hop_count
confidence
```

Then a reveal scene can reconstruct the chain.

This is a place where deterministic bookkeeping adds enormous dramatic value.

---

# 14. I would not build a giant epistemic engine yet

This is one of the areas where the architecture could easily become overengineered.

For an early system, a table answering:

```ts
knows(character, fact)
```

is probably enough.

Build the richer belief graph only when you have a scene that actually requires:

```text
A heard from B
who inferred it from C
who saw X
but misunderstood Y.
```

The conceptual model is worth keeping.

The maximal machinery can wait.

---

# 15. The multi-speaker secret problem is correctly identified

The fundamental rule remains:

> **Never give a character information they are supposed not to know.**

That is stronger than:

> “Here is the secret; please don't mention it.”

Removing forbidden information from the prompt is vastly safer.

Your distinction between ordinary and high-value secrets is sensible:

### Ordinary scene

One generation call:

```text
role-scoped context
+
knowledge filter
+
lexical checks
```

### Critical secret

Generate sequentially:

```text
Speaker A
 ↓
update conversational state
 ↓
Speaker B receives only what B legitimately knows
 ↓
Speaker B
```

The tradeoff is cost and latency versus epistemic safety.

That's a worthwhile trade.

---

# 16. The action-validation stack is one of the most interesting additions

You have three layers:

```text
1. Structured action enum
2. Deterministic prose scan
3. Semantic extraction backstop
```

That is much better than asking the LLM to certify itself.

The key insight is:

> **The model cannot be both the defendant and the judge.**

If the model emits:

```json
{
  "action": "CANNOT_RUN"
}
```

but prose says:

> “He sprinted across the mud.”

the pipeline needs an external validation mechanism.

I especially like your proposal not to reject every semantic disagreement.

`GLANCE` versus `STARE` isn't generally worth a pipeline failure.

But:

```text
PARALYZED_ARM
```

versus:

```text
HE GRABBED THE ROPE
```

is mechanically meaningful.

That suggests a broader principle:

> **Validation severity should correspond to the consequence of the violated constraint.**

---

# 17. The entropy metric is useful as a diagnostic, not as a definition of healthy storytelling

The normalized entropy formulation is mathematically reasonable:

$$
H_{norm}
=
\frac{-\sum p_i\log_2p_i}{\log_2M}.
$$

But I would be careful about one assertion:

> “A healthy serialized narrative requires entropy between 0.65 and 0.85.”

That is a **design hypothesis**, not a mathematical fact.

The same applies to:

```text
0.65
0.85
ΔH = -0.25
```

Those are tuning parameters.

They should initially be treated as telemetry:

```text
pairing entropy
pair repetition
grievance repetition
location repetition
outcome repetition
```

Then inspect real episodes and determine which distributions correlate with stories you actually like.

The architecture should not silently turn those numbers into laws of narrative.

---

# 18. The same principle applies to boredom detection

Your metric selection is good:

### Categorical

Exact-match frequency.

### Set-valued

Jaccard similarity.

### Numerical

Use distances or distribution statistics.

That is much better than applying one universal similarity metric to everything.

And your point that the anti-repetition mechanism itself changes the simulation distribution is crucial.

You should always measure:

```text
baseline simulation
```

and

```text
simulation with anti-repetition
```

separately.

Otherwise you don't know whether the detector is identifying a problem or creating one.

---

# 19. Voice profiling should be corpus-derived

The instruction:

> derive stylistic bounds from actual authored dialogue rather than guessing them

is correct.

The ±25% envelope is not a universal truth, however. It is another tuning parameter.

More importantly, I would not reduce voice to statistics alone.

A character can have statistically correct sentence lengths and still sound completely wrong.

So use two levels:

```text
Mechanical voice checks
    sentence length
    function-word tendencies
    vocabulary
    tic frequency
    punctuation patterns

Human evaluation
    attitude
    worldview
    subtext
    rhythm
    comedic timing
    emotional asymmetry
```

The first prevents obvious drift.

The second determines whether the character is actually alive.

---

# 20. Idempotency is much more important than it initially appears

This is not just an infrastructure nicety.

Without idempotency, you get:

```text
TTS line 1
TTS line 2
TTS line 3
TTS line 4
TTS line 5
CRASH
```

Restarting shouldn't mean:

```text
redo 1–5
```

It should mean:

```text
verify 1–5
generate 6
```

The atomic:

```text
write temporary
verify
rename
```

pattern is exactly right.

I would extend that concept to every artifact:

```text
generation
validation
commit
```

An artifact doesn't become visible to downstream stages until it has successfully passed validation.

---

# 21. Add an explicit distinction between deterministic and nondeterministic failure

This would be one of my highest-priority additions.

Every failure should belong to one of three broad classes:

### Deterministic failure

Examples:

```text
schema invalid
missing required field
impossible state
unknown character
illegal action
missing asset
bad coordinate
invalid timeline
```

**Do not retry.**

Fix the upstream problem.

### Stochastic quality failure

Examples:

```text
flat dialogue
bad joke
weak voice
awkward phrasing
poor TTS pronunciation
```

Retry may be appropriate.

### Infrastructure failure

Examples:

```text
process crash
GPU failure
network timeout
browser crash
disk error
```

Retry/resume is appropriate.

That prevents a catastrophic anti-pattern:

> “Keep regenerating until something passes.”

That can conceal deterministic bugs indefinitely.

---

# 22. I would add immutable provenance to every major artifact

Without immediately building a full content-addressable storage system, put basic provenance everywhere.

Something like:

```json
{
  "schema_version": "1.2",
  "episode_id": "ep040",
  "scene_id": "ep040_sc03",

  "generator_version": "sower-0.8.4",

  "input_hashes": {
    "canon": "...",
    "ledger": "...",
    "scene_plan": "..."
  },

  "seed": 184729,
  "created_at": "...",
  "artifact_sha256": "..."
}
```

The important fields are:

```text
schema version
input identity
generator version
seed
output identity
```

That provides enormous debugging value before you ever need sophisticated CAS infrastructure.

---

# 23. Separate authoritative state from derived state

I would formalize this as a rule:

## Authoritative

```text
Canon
Ledger
Committed episode state
Simulation result
```

## Derived

```text
spatial queries
exposure sheets
dialogue AST
prompts
knowledge-filtered context
viseme timing
render files
QA reports
```

Derived artifacts should always be reproducible from authoritative inputs.

That means:

> **A derived artifact should never silently become a new source of truth.**

This one rule prevents a remarkable number of future synchronization problems.

---

# 24. Add transaction boundaries

There should be a hard transactional boundary around simulation.

Conceptually:

```text
START SIMULATION TRANSACTION

read ledger
select encounter
resolve outcome
calculate mutations
validate mutations
commit mutations

END TRANSACTION
```

Only after that:

```text
generate dialogue
generate audio
render
```

And crucially:

> A failed render must not roll back the story.

Conversely:

> A render must never modify world state.

That gives you clean failure recovery.

You can rerender an episode ten times without changing the underlying story.

---

# 25. Add a small invariant suite

This would give you extremely high value very cheaply.

Examples:

### Spatial

```text
q + r + s == 0
every actor has exactly one valid location
all locations are valid
```

### World state

```text
dead actor cannot initiate action
occupied hand cannot simultaneously hold two objects
unconscious actor cannot speak
```

### Epistemic

```text
witness knowledge must have a valid source
character cannot know future event
knowledge must have a valid provenance chain
```

### Narrative

```text
all scene participants exist
all mandated beats exist
all required state mutations are represented
```

### Presentation

```text
frame ranges are valid
frame ranges are within episode
required assets exist
audio references resolve
```

These tests are cheap and catch conceptual errors long before expensive media generation.

---

# 26. Add fixed-seed golden tests

I would prioritize these over sophisticated property-based testing initially.

For example:

```text
seed = 1001
ledger = fixture_A
expected encounter = Bog vs Spleen
expected outcome = Costly Win
expected mutation = Bog.humiliated
```

Then every major architecture change runs that case.

If you later change simulation code and the expected scene suddenly changes, the test tells you exactly where behavioral drift entered.

A handful of carefully chosen fixtures can be extraordinarily valuable.

---

# 27. Your archival model should be episode-centric

I would make each completed episode a checkpoint.

Conceptually:

```text
Episode 040

Starting Canon Hash
Starting Ledger Hash

        ↓

Scene Plans

        ↓

Dialogue ASTs

        ↓

Audio Artifacts

        ↓

Exposure Sheet

        ↓

Render

        ↓

QA

        ↓

Ending Ledger Snapshot
```

That gives you a historical record without immediately requiring full event sourcing.

---

# 28. One naming issue deserves attention: “event-sourced”

Your opening calls this an **event-sourced deterministic media compiler**.

That is appropriate only if the event log is genuinely capable of reconstructing authoritative state.

If the actual implementation is:

```text
SQLite current-state tables
+
audit log
```

then I would call it something like:

> **deterministic media compiler with an authoritative ledger and append-only audit history**

until replay-from-events is actually implemented and tested.

That's not merely semantics.

Calling something event-sourced creates expectations about:

```text
replay
ordering
event immutability
schema evolution
state reconstruction
```

You don't need all that complexity on day one.

---

# 29. Canon versioning and errata are worth keeping

This solves a real long-term problem.

Suppose Episode 12 established:

```text
Spleen hates silver objects.
```

Episode 80 discovers that this was a mistake.

You need to distinguish:

```text
historical truth at the time Episode 12 was produced
```

from:

```text
current canonical interpretation.
```

Your proposed:

```text
canon_version
errata log
episode pinning
optional remaster
```

is a good solution.

I would explicitly make the rule:

> **Old episodes never silently change because canon changed.**

A remastered episode is a new artifact.

---

# 30. The one-screen review interface may become the most valuable human-facing tool

I strongly agree with this.

A director shouldn't have to mentally parse:

```json
dialogue_ast.json
```

to determine whether a scene works.

They should see:

```text
WHO
WHY
WHAT THEY WANT
WHAT THEY KNOW
WHAT HAPPENS
WHAT CHANGES
WHAT MUST BE SAID
WHAT MUST NOT BE SAID
```

in perhaps 30–60 seconds.

And importantly, the interface should let the human edit **constraints**, rather than directly editing generated prose whenever possible.

That preserves the architecture:

```text
Human changes meaning constraint
        ↓
regenerate expression
```

rather than:

```text
Human patches generated output
        ↓
system no longer knows why it says that
```

---

# 31. Structured rejection data is effectively your future training/evaluation corpus

This part is easy to underestimate.

A record such as:

```text
VOICE_BLEED
FLAT_DIALOGUE
UNEARNED_RELEASE
SOMATIC_DRIFT
PACING_STALL
```

turns vague artistic dissatisfaction into structured evidence.

Over time you can ask:

```text
Which model produces least VOICE_BLEED?
Which prompt revision reduces UNEARNED_RELEASE?
Which grievance types cause FLAT_DIALOGUE?
Which character pairs cause repeated PACING_STALL?
```

That becomes an empirical development loop rather than endless prompt tweaking based on memory.

I would also record the **accepted scene alongside the rejected one**, not just the rejection.

That creates paired evaluation examples.

---

# 32. I would add a distinction between narrative randomness and representational randomness

This is subtle but important.

Suppose the simulation chooses:

```text
seed 8172
→ Bog encounters Spleen
→ Costly Win
```

That randomness is **story-authoritative**.

Now suppose diffusion chooses:

```text
plate variation 3
```

That randomness is **representational**.

Changing the second should not change the first.

Therefore derive independent child seeds:

```text
episode_seed
    ├── simulation_seed
    ├── scene_seed
    ├── dialogue_seed
    ├── asset_seed
    └── render_variation_seed
```

Then:

> Changing the image-generation seed does not alter the story.

That gives you a very clean reproducibility boundary.

---

# 33. I would add a finalization boundary

You have implicitly described one, but I would make it explicit.

### Draft mode

Can tolerate:

```text
default assets
fallback poses
temporary audio
warnings
incomplete metadata
```

### Final/Broadcast mode

Requires:

```text
all required assets
all schemas valid
all deterministic invariants satisfied
all mandatory beats satisfied
audio locked
timeline locked
QA passed
provenance complete
no unresolved deterministic errors
```

This gives the project room to be creative during development without weakening the final gate.

---

# 34. Your renderer should never be able to change story meaning

This is the “meaning versus representation” wall I would put directly into the architecture document.

### Meaning layer

```text
character
location
grievance
belief
action
outcome
state
dialogue intent
```

### Representation layer

```text
sprite
screen position
camera
zoom
mouth shape
viseme
lighting
background
frame
pixel
```

A controlled adapter maps:

```text
meaning → representation
```

but representation never maps backward into meaning.

For example:

> “The camera zoomed in.”

must never imply:

> “Therefore the character became angrier.”

The semantic state needs to already contain the anger/tension information if that is narratively true.

---

# 35. Your Phase Matrix is good, but I would slightly change the philosophy of the gates

The gates should prove **functionality**, not theoretical perfection.

For the tracer bullet, the winning condition is not:

```text
perfect reproducibility
perfect art
complete epistemic modeling
```

It is:

```text
one scene can travel through the entire pipeline
without manually breaking the contracts.
```

That means:

```text
ledger
→ simulation
→ scene plan
→ dialogue
→ TTS
→ measured duration
→ frames
→ Remotion
→ final media
→ QA
```

actually needs to work on real hardware.

That is the moment the architecture ceases to be hypothetical.

---

# 36. I would change one thing about the “double render identical” gate

It is an excellent **experiment**, but I would not make byte identity the initial definition of success.

There are several distinct levels:

### Level 1 — intent

Same:

```text
scene plan
dialogue
timing
```

### Level 2 — decoded media

Same:

```text
PCM
decoded frames
```

within an explicitly defined tolerance.

### Level 3 — encoded stream

Same codec output bytes.

### Level 4 — container

Exactly identical MP4 bytes.

The farther down the stack you go, the more external software versions, codecs, muxing metadata, GPU behavior, and environment become relevant.

So I would initially make:

> **same decoded video/audio**

the meaningful reproducibility experiment.

Byte-identical MP4 can be an additional environment-specific target.

---

# 37. I would make the tracer bullet even smaller

Your proposed three-second test is excellent.

But I'd define it as:

```text
ONE CHARACTER
ONE OTHER CHARACTER
ONE GRIEVANCE
ONE OUTCOME
ONE SPOKEN LINE
ONE SHOT
ONE AUDIO FILE
```

and make it traverse everything.

The key question is:

> **Can the complete machine produce one finished unit?**

Once that works, scaling from one scene to 40 scenes is an engineering problem.

Before that, scaling only multiplies uncertainty.

---

# 38. The biggest danger is still not technical

The system could become magnificent infrastructure around mediocre stories.

That is the primary product risk.

The simulator can produce:

```text
perfectly valid encounters
```

without producing:

```text
funny encounters
```

The schema can be perfect while the dialogue is dead.

The map can be elegant while every character still sounds identical.

The renderer can produce beautiful 24-fps media containing scenes nobody cares about.

That is why the authored grievance corpus is disproportionately important.

I would continue the earlier principle:

> **Write the first ~10 grievances by hand before attempting to automate grievance invention.**

For each one, capture:

```text
surface complaint
hidden grievance
relationship history
desired escalation
props
possible misunderstandings
possible outcomes
```

That gives the simulation a genuine dramatic vocabulary instead of merely a mechanical one.

---

# 39. What I would classify as “architecture” versus “tuning”

This distinction is important because your document mixes both.

## Freeze these as architecture

```text
Ledger is authoritative.
Generation is subordinate.
Simulation precedes language.
Meaning precedes representation.
Audio establishes measured timing.
Media never mutates world state.
Canon/map/state/math have separate ownership.
Derived artifacts are reproducible from authoritative inputs.
Deterministic errors fail rather than being hidden by regeneration.
```

Those are architectural principles.

## Keep these as experiments

```text
2d6
String weight = 3
String cap = 2
rumor decay = 0.8
entropy healthy range = 0.65–0.85
entropy collapse threshold = -0.25
voice tolerance = ±25%
24 fps
24 vs 30 fps
specific pacing thresholds
specific anti-repetition coefficients
```

Those are parameters.

The system should make changing them easy.

---

# 40. My condensed version of the entire architecture

If I had to reduce everything you have described to one diagram, I would use this:

```text
                    CANON
                      │
                      ▼
              AUTHORITATIVE LEDGER
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
         SPATIAL MATH     KNOWLEDGE STATE
             │                 │
             └────────┬────────┘
                      ▼
                 SIMULATION
                      │
                      ▼
                SCENE PLAN / IR
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
   KNOWLEDGE FILTER        CONSTRAINT CHECKS
          │                       │
          └───────────┬───────────┘
                      ▼
               DIALOGUE AST
                      │
                HUMAN GATE
                      │
                      ▼
                    TTS
                      │
               measured duration
                      │
                      ▼
              EXPOSURE SHEET
                      │
                      ▼
                  REMOTION
                      │
                      ▼
                 MEDIA QA
                      │
                      ▼
                  ARCHIVE
```

And the governing direction is always:

```text
TRUTH
  ↓
MEANING
  ↓
EXPRESSION
  ↓
TIMING
  ↓
REPRESENTATION
```

Never the reverse.

---

# 41. The additions I consider most worthy

Of everything I'd add, I would prioritize these seven:

**1. Explicit Scene Plan / IR**
This is the missing bridge between simulation and prose.

**2. Authoritative vs derived state classification**
This prevents hidden secondary sources of truth.

**3. Provenance metadata on every artifact**
Schema version + input hashes + generator version + seed.

**4. Deterministic/stochastic/infrastructure failure taxonomy**
This prevents dangerous “retry until it passes” behavior.

**5. Golden fixed-seed simulations**
A small regression suite for world-state behavior.

**6. Explicit transaction boundaries**
Simulation commits state; media stages cannot modify it.

**7. Finalization boundary**
Drafts may tolerate fallbacks; final media may not.

Those seven additions make the architecture considerably more rigorous without pushing it into unnecessary studio-scale infrastructure.

---

## My overall reading

The strongest idea here is not the hex grid, the 2d6 system, the LLM, Remotion, TTS, or even event logging individually.

It is the **authority hierarchy**:

> **The machine decides what is true.
> Simulation decides what happens.
> The language model decides how characters express it.
> The audio file establishes actual time.
> The renderer decides how that meaning is presented.
> QA verifies that no downstream layer contradicted an upstream one.**

That gives you something much more valuable than a collection of generative scripts: a system in which **creative flexibility exists inside a deterministic causal skeleton**.

And the next practical milestone remains extremely concrete: get one tiny scene through **ledger → simulation → scene plan → dialogue → TTS → measured frames → Remotion → QA**, because that experiment will reveal which of these architectural assumptions survive contact with the actual implementation.
I'm going to separate signal from noise, because the pasted material is a long, self-reinforcing chain of AI-generated architecture documents. Much of it is sound, some of it is speculation dressed as fact, and a few claims are wrong or unverifiable. One caveat up front: I only know what's in the paste. I can't see your repos, so I can't verify that any of this exists on disk. Treat everything below as design analysis, not a status report.

---

## Part 1: What is genuinely valuable and true

### 1. The central insight: probabilistic systems propose, deterministic systems decide

This is the load-bearing idea, and it holds up. LLMs, diffusion models, and TTS are treated as untrusted workers. Truth lives in a ledger. This is the right instinct for a long-running episodic show, because the failure mode of generative pipelines is continuity rot: a character loses an arm in episode 12 and uses it in episode 15 because nobody enforced the fact.

The nuance is that this only works if the deterministic layer is actually *authoritative*, not decorative. The test is simple: if an LLM produces prose that contradicts the ledger, does the pipeline reject it, or does a human notice later? Only the first counts.

### 2. Simulation before language

Deciding *who fights, over what, and who wins* mathematically (2d6 duel resolution, grievance selection, condition mutation) and only then asking an LLM to write the surface dialogue is the strongest design decision in the whole set. It solves the problem LLMs are worst at, which is sustained causality, by moving it out of the LLM. The LLM gets a much easier job: make this predetermined outcome sound alive.

Nuances worth keeping:
- **2d6 is a fine choice** for a bell-curve of outcomes (7 most common at 1/6, extremes at 1/36 each, which matches the paste's 16.7% and 2.78%).
- **The outcome taxonomy** (Clean Win, Costly Win, Mutual Wound, Backfire, True Tie) is good because it makes the *shape* of a scene a first-class variable instead of always "someone wins."
- **Real risk:** with formulas this rich, tuning weights (W, P, cooldowns, resentment ceilings) will dominate your time. You will not know the right values until you've simulated dozens of episodes. Build a headless "simulate 200 episodes and print statistics" harness early.

### 3. Audio as the master clock

Correct and practical. Speech has irregular duration; video is quantized. Synthesize first, measure, then build the timeline around the audio. The formula is right:

`target_frames = ceil(duration_ms / 1000 × 24)`

Two nuances the paste gets right and one it glosses over:
- **Absolute frame anchoring** (each stem starts at a precomputed cumulative frame index rather than being chained) is correct and prevents drift. Worth noting that `ceil` per shot means up to ~41.7 ms of tail silence per shot, which is fine and inaudible, but it's the reason you must anchor absolutely.
- **What's glossed over:** `ffprobe` on a WAV reports duration from the header. That's accurate for PCM WAV but check that your TTS output has no leading/trailing silence you'd want trimmed *before* measuring. Silence trimming changes your frame budget.

### 4. Source-baking to solve the shared-component drift problem

This is a genuine, real problem, and the paste's diagnosis is accurate: if episode 12 is a JSON payload interpreted by a shared React codebase, changing `GoblinPuppet.tsx` silently changes episode 12. Freezing the implementation per episode fixes it.

But there's a nuance the paste under-weights: **vendoring is the simplest of the three options and probably the only one you need.** Copying the components into each episode directory is boring, obviously correct, and needs no package registry or submodules. The immutable-npm-package and submodule alternatives add operational overhead for a problem vendoring already solves. The cost of vendoring is disk duplication and no automatic bugfix propagation, and the second one is arguably a feature: old episodes *shouldn't* change.

Also worth stating plainly: source-baking is a reasonable design, but "generate TSX from data" versus "render from data with a version-pinned player" are roughly equivalent in reproducibility if you pin the player version. Baking is more transparent (you can read the file) and easier for a human to hand-edit. That's the real advantage, not reproducibility per se.

### 5. Typed asset contracts with explicit nulls

`manifest.json` as an API, with `anchor_point`, `crash_zoom_target`, `mouth_bounding_box`, and per-character motion scalars, is good practice. The explicit-null pattern (`"terrified": null` means "known gap," absence means "bug") is a clean, cheap idea. The two-tier policy, fall back to idle in drafts but fail loudly for broadcast, is exactly right.

### 6. Cheapest checks first

The QA ordering (schema/file existence, then ffprobe frame counts and loudness, then geometry, then semantic, then human) is sound engineering economics. The zero-byte-file guard (SHA-256 of empty input is `e3b0c442...b855`) is a real, well-known constant and a legitimately cheap catch for truncated transfers.

### 7. Ignorance by omission

Stripping facts a character doesn't know from the prompt, rather than telling the LLM to "pretend you don't know," is correct. LLMs leak information they've been told, even when instructed not to use it. Removal is the only reliable fence. Keep this.

### 8. The most important true statement in the whole paste

The repeated closing message is right and I'd elevate it above everything else: **stop designing and run one 3-second slice end to end.** The paste itself notes that it kept avoiding this by producing more architecture. That is the real state of the project, and the honest read is that the design is far ahead of the evidence.

---

## Part 2: What's wrong, overstated, or unverifiable

### 1. "Bit-identical reproduction years later" is not a safe promise

This claim appears repeatedly, and it's the most overstated one. Pinning Git SHAs does not give you bit-identical output. Problems:

- **Chromium + software GL** can vary across versions, fonts, and CPU instruction sets. Antialiasing differences are real.
- **FFmpeg/x264 encoding** is deterministic for a given build and settings *only* if threading is controlled. Multithreaded x264 can produce different bitstreams unless you fix thread settings.
- **MP4 muxing** embeds timestamps and encoder strings unless stripped.
- **Fonts** are a classic source of silent drift.
- **Diffusion outputs** can't be regenerated from seeds reliably across GPU/driver/CUDA versions. The paste acknowledges this later, correctly: generated plates are *archived artifacts*, not reproducible outputs.

The honest, defensible claim is: **re-rendering from the archived inputs inside a pinned container should produce a perceptually identical result, and possibly a byte-identical one, which you verify empirically.** The paste's "Reproducibility Ladder" (intent, AST, timing, decoded media, encoded stream, container bytes) is actually a good, honest framing. Use the ladder and aim for Level 3 (decoded pixels/PCM within tolerance) rather than promising Level 5.

Practical point: archive the final rendered MP4 and the diffusion plates themselves. Don't rely on re-rendering as your preservation strategy.

### 2. Stacked, unvalidated numeric specifics

A lot of precise numbers appear with an authority they haven't earned:
- `-14 dB` ducking, 6-frame attack, 12-frame release: plausible starting values, but they are *tuning parameters*, not facts. You'll adjust them by ear.
- `-16 LUFS` for web, `-24 LUFS` for US broadcast (ATSC A/85), `-23 LUFS` for EBU R128: these are real published targets, but the paste mixes web and broadcast targets in one pipeline. Pick your actual delivery target. If you're publishing to YouTube-type platforms, -14 LUFS integrated is more typical than -16. Verify against the platform you actually ship to.
- "Green spill mean < 12," "viseme drift < 4px," "aspect ratio 1.2 to 3.0": invented thresholds. Reasonable to start with, but calibrate against real assets.
- `--concurrency=1` and `gl=swangle`: these are sensible defensive settings, but the paste treats them as required for avoiding "headless Linux OpenGL memory leaks." Real advice, but use the flags that actually work on your machine; `swangle` is a valid Remotion option, and concurrency should be tuned by measuring, not assumed.

### 3. Some things are described as existing when they are aspirational

The paste blends built things and designed things without labeling them. Treat these as **designs until proven**: the Jules VM coordinate-extraction loop, `repo-bot` as a Cloudflare Worker orchestrating stamping, C2PA signing, MovieLabs MMC packaging with Aspera delivery, Notebook retro-injection, and the Durable Object shot coordinator. Several of these (MMC/Aspera especially) are studio-scale delivery machinery with no relevance until you have a distributor asking for them. A solo or small show publishing to the web does not need Aspera or MMC.

### 4. Over-engineering flagged in the paste itself

The later documents literally admit that earlier ideas ("23-pod clusters, Merkle trees, two-phase commit") were engineering fiction. Apply the same skepticism to what remains. Items I'd defer or drop until a real need appears:

- **Event-sourced ledger with a pure reducer and replay from genesis.** Elegant, and genuinely valuable *later* for branching/what-if. But it doubles your implementation surface up front. A plain relational ledger with a transaction log table gets you 90% of the benefit.
- **Content-addressed scene artifact graph (Bazel/Nix-style).** Powerful, but you have zero episodes. Caching matters when re-rendering is slow and frequent; you don't know that yet.
- **Property-based fuzzing of the reducer.** Only meaningful after the reducer exists.
- **Two-pass adversarial semantic verification** with a second model extracting verbs: sensible in principle, but a second LLM at temperature 0 is still an LLM. A verb-lemma check against the banned list is the cheap 80% solution.
- **Graph-theoretic epistemic reachability.** A simple `knows(character, fact)` table filtered at prompt assembly is functionally identical at your scale.

### 5. Ambiguity in the "goblin-viewport vs. template" narrative

The paste explains this at great length for a simple fact: the repo you maintain is the template/generator; per-episode output lives in `goblin-episodes/`. It also notes "viewport" survives as a casual label. There's no substance disagreement there, just a lot of words. I'd add one caution: **if the generator is the only thing that writes episode TSX, then a bug in the generator affects every future episode, while old episodes stay frozen.** That's the desired property, but it means the generator needs its own tests, and its output should be diffed in code review the first few times.

### 6. Mixed-up 4n+1 / frame-rate reasoning

The Wan-style 4n+1 frame constraint is real for models with that temporal VAE structure, and the formula shown is correct. But confirm the actual native fps and constraints for whatever model version you use before hardcoding 16 fps; these change between releases. The "animate on twos" idea is legitimately good: generating at 12 fps and doubling to 24 fps is both cheaper and a recognizable animation aesthetic, if your model can be driven at that rate.

---

## Part 3: The distilled architecture (my restatement)

```text
CANON (read-only lore, schema-validated)
   │
LEDGER (mutable: positions, wounds, secrets, debts, pressure meters)
   │   ← transactional; every change is an auditable row
SIMULATION (select pair → select grievance → duel math → mutate ledger)
   │
DRAFT (LLM writes prose under constraints; emits dialogue_ast.json)
   │   ← lint: banned verbs, epistemic leaks, action-enum vs prose
AUDIO (TTS → measure → integer frame budget → absolute start frames)
   │
VISUAL CONTRACTS (manifest.json: anchors, visemes, nulls)
   │
GENERATE (stamp Episode_XXX.tsx + render_manifest.json, vendored components)
   │
RENDER (Remotion, CPU, pinned container)
   │
QA (schema → signal → geometry → semantic → human)
   │
ARCHIVE (final MP4 + inputs + plates; content-addressed)
```

Three properties define whether this is good:
1. **Truth flows one way**, downward. Media never mutates state.
2. **Every stage boundary is a typed artifact you can inspect on disk.**
3. **Randomness is split**: narrative randomness is seeded and logged; representational randomness is logged but doesn't affect truth.

---

## Part 4: What I'd add that the paste doesn't say

### 1. The biggest unaddressed risk is comedic and dramatic quality, not infrastructure
The paste touches this once ("upstream fuel deficit") and then moves on. It's the actual product risk. A perfectly deterministic pipeline can still produce boring episodes. Simulation gives you *structure*; it doesn't give you *voice* or *funny*. Hand-write the first 10 to 20 grievances with real specificity (the paste suggests 40 to 60, which is a good eventual target) and read the LLM output aloud. If the dialogue is flat, no amount of compositing rescues it.

A concrete test: write the surface complaint and the "underneath" for one grievance, generate five variants, and see whether the underneath comes through as subtext or gets stated outright. LLMs tend to state the subtext. Your linter should probably reject lines that explicitly name the hidden motive.

### 2. Define "done" for the tracer bullet in a way that can fail
The paste's 8-point checklist is good, but item 8 (double-render bit-identity) may fail for reasons unrelated to your code (encoder threading, timestamps). Split it: **pass = the render completes and audio/video sync is correct on inspection**; **stretch = SHA match**. Otherwise you may read a muxing artifact as an architecture failure.

Also, pick the visual path *once* for the slice. Do the 2D cutout path first. It has no GPU dependency, no matting, no chroma-key spill problem, and it exercises the parts you've actually specified in detail (manifest contracts, visemes, source-baking, audio timing). Diffusion plates are a second, independent project.

### 3. Lip-sync is the hidden hard problem in the cutout path
The paste mentions "viseme cues derived from audio energy," and treats four mouth shapes (closed/small/medium/wide) as sufficient. That works for a stylized goblin show and is a legitimate aesthetic (South Park-style cutout puppetry does the same), but amplitude-based mouth flapping looks mechanical unless you smooth it. Practical suggestions: threshold with hysteresis so the mouth doesn't chatter, hold each shape a minimum number of frames (2 to 3), and consider forced alignment (Rhubarb Lip Sync is a real, widely used tool for this) if amplitude looks bad. Decide early because it changes the timing manifest.

### 4. Version everything, but only what will actually change
Add schema versions to `dialogue_ast.json`, `exposure_sheet.json`, and `manifest.json` from day one. It costs nothing now and saves painful migrations later. The paste is right about this and I'd emphasize it's the cheapest durable win in the whole design.

### 5. A "simulate without media" mode
Build a mode that runs Stages 3 to 5 for N episodes and emits only ledger state and a text summary, skipping TTS and rendering. It lets you tune weights, catch runaway states (everyone `humiliated`, paranoia clocks pegged), and check that grievance variety holds. This is where most of your narrative debugging will happen, and it's fast and free.

### 6. Guard against ledger degeneracy
Systems like this tend to drift into attractors: one character accumulates every condition, resentment meters saturate, and the same pair fights every episode. You need decay rates, recovery mechanics, and an ensemble-balance term that actually bites. The paste mentions these but treats them as settled; they're the most likely place the simulation feels dead after 10 episodes.

### 7. Log everything about LLM calls
For every draft attempt store the prompt, seed, model version, output, and lint result. When quality is inconsistent you'll need to know whether it was the prompt, the constraints, or the model. This also gives you a free evaluation dataset.

### 8. Human-in-the-loop placement
The paste has a sophisticated "sealed file lifecycle" for hand-edits to TSX. Good, but the higher-leverage human checkpoint is earlier and cheaper: **review the dialogue AST before spending TTS and render time.** A human reading a script for 60 seconds saves minutes of compute and catches the problems (flat writing, tonal misses) that no automated gate can.

### 9. Scope discipline for a small team
The full document describes a studio-scale system: multiple rigs, a Cloudflare control plane, an agent that patches code, provenance signing, distributor packaging. For an early project, a defensible minimal core is: ledger + simulation + LLM draft + linter + TTS + frame math + Remotion cutout render + a manifest file. Everything else is a later layer that should be added when a specific pain justifies it.

---

## Part 5: Recommended order of work

1. **Hand-write 10 grievances** with surface complaint, underneath, and props. Test LLM drafts against them.
2. **Build the simulation harness** (no media). Run 100 simulated episodes and inspect distributions.
3. **Tracer bullet, cutout path only:** one line, TTS, ffprobe, frame count, stamped TSX, Remotion render. Verify by watching it.
4. **Add the linter** (banned-verb and epistemic checks) once you have real LLM output to lint against.
5. **Add manifest validation** and the explicit-null draft/broadcast gate.
6. **Only then** consider diffusion plates, matting, offline post-processing, and reproducibility conformance tests.
7. **Defer** event sourcing, CASAG, agent-driven QA, C2PA, and distribution packaging until a concrete need appears.

---

## Bottom line

The paste's core is strong: simulation before language, audio as master clock, source-baked per-episode compositions, typed asset contracts, and cheapest-checks-first QA. Its weaknesses are overclaiming reproducibility, blurring designed and built components, and drifting into studio-scale machinery the project doesn't need yet. And its own best advice is right: the design is ahead of the evidence, so the next unit of progress is a 3-second clip, not a fourth architecture document.

If you tell me which stage you want to start with, I can help draft the tracer-bullet spec, the grievance schema, or the simulation harness.Yes, the hex map belongs in this section, and it deserves more than a passing mention. The paste lists "spatial vectors" and "hex coordinates" in the ledger and uses proximity sweeps in Stage 3a, but it never explains why space is doing so much narrative work. I'll expand that first, then answer the repo question, where I think the answer is "yes, eventually, but not yet, and here is the precise trigger."

---

## Part 1: Why a hex map is a narrative engine and not just a position table

### 1. Space is the cheapest source of causality you have

Most generative-drama systems fail at the same point: nothing *forces* characters together, apart, or into particular scenes. An LLM asked "who should argue next?" picks whoever is narratively convenient, and you get the same pairs repeating.

A spatial model replaces that with a physical rule: **you can only fight someone you can reach.** That single constraint gives you:

- **Scene selection with a reason.** Stage 3a's pairing lottery filters to colocated or adjacent actors. The pair is chosen by circumstance instead of authorial whim, which is exactly the "simulation before language" principle applied to *who is in the room*.
- **Natural pacing.** If Bog storms off after a Backfire, he is now several hexes away. He can't be in the next confrontation unless someone moves. Cooldown becomes physical, not just a counter.
- **Witnesses for free.** The Costly Win outcome in your taxonomy gives "a third-party witness" a String on the winner. Who counts as a witness? Anyone within N hexes. Without a map, witness selection is arbitrary; with one, it's a query.
- **Secrets that travel.** Epistemic state gets much richer when knowledge spreads through proximity. A secret told in a hex with three listeners is now known by three characters. Your "ignorance by omission" fence has something concrete to enforce.
- **Props and locations become mechanical.** The paste mentions grievances tied to "recurring physical props." A prop sitting in a specific hex is a location-bound trigger: the stolen brass siphon is *there*, so the argument happens *there*.

### 2. Why hexes specifically, not squares

This is a real, well-founded choice, not an aesthetic one:

- **Uniform adjacency.** A hex has exactly six neighbors, all at the same distance. Square grids have the diagonal problem: are corner neighbors adjacent? Distance rules get ambiguous (Manhattan vs Chebyshev vs Euclidean). Hexes don't have that problem.
- **Clean distance metric.** With cube coordinates `(q, r, s)` where `q + r + s = 0`, distance is `max(|Δq|, |Δr|, |Δs|)`. That is cheap, exact, and has no special cases.
- **Isotropic movement and range.** "Within 2 hexes" is a fair circle-ish region in every direction, which matters when you use range for witness selection and gossip.
- **Good fit for abstract locations.** Your world has named places (camp, bog, relay) more than a continuous landscape. A hex graph lets you treat regions as tiles with terrain and travel cost.

One nuance to decide early: **do you need a true hex grid, or a location graph?** If your world is really about ~15 named places (camp, latrine, siphon room), a plain graph of locations with edge weights might be simpler than tiling. Hexes earn their keep if you want emergent adjacency, wandering, line-of-sight, or a visual map you can look at. If characters mostly teleport between named rooms, a graph is enough. The good news is the same interface can serve both: `distance(a, b)`, `neighbors(x)`, `occupants(x)`.

### 3. What the map should actually track

The paste says "actor hex coordinates" and stops there. A useful spatial model has several layers:

**Actor position.** Who is where, in cube or axial coordinates.

**Movement rules.** Speed per cycle, terrain cost, and whether characters *choose* a destination or are pushed by events. The interesting design question is what motivates movement. Good answers come from the ledger: a `humiliated` character retreats toward an isolated hex; a character with a high paranoia clock avoids the hex containing the person they suspect; a character seeking to spend a String moves toward the String's target.

**Terrain and place semantics.** Each hex has a type (open camp, cramped shed, boggy ground) that can modify outcomes: cramped spaces raise tension; open ground allows witnesses; a specific location can carry a `location_id` that unlocks certain grievances (a grievance about the valve only fires in the valve's hex or adjacent).

**Objects and props.** Items with positions, owners, and states. The brass siphon has a hex, a current holder, and a history. This is where a lot of your comedy will come from, because physical objects that move and get stolen create causal chains.

**Occupancy and visibility.** Who can see whom. Line of sight can be simple ("same or adjacent hex") or richer, but it must be deterministic, because it feeds the epistemic layer: *seeing* an event is how you come to know a secret.

**History.** Not just where everyone is now, but where they were, for "who was near the crime" queries. An append-only movement log costs almost nothing and pays off enormously for mystery-style grievances.

### 4. How the map plugs into each simulation stage

This is the nuance the paste leaves implicit:

```text
Stage 0  Movement phase   → actors move (deterministic, seeded)
Stage 3a Pairing lottery  → candidates = colocated ∪ adjacent
Stage 3b Grievance filter → location-bound grievances only if hex matches
Stage 4  Duel resolution  → terrain/witness modifiers on the roll
Stage 4  Ledger mutation  → witnesses (within radius) gain knowledge / Strings
Stage 5  Prompt assembly  → scene location + who is present, for cast and setting
Stage 6  Exposure sheet   → background matte chosen by hex/location tag
```

The last line is worth noticing: **the hex is also a bridge to the visual layer.** The Sower is meant to stay visual-agnostic, so it emits a `location_id` (semantic), and the viewport maps that to a background matte (representation). The hex stays on the meaning side of the wall. That is consistent with your meaning-versus-representation rule, and it means you could re-skin the world without touching the map logic.

### 5. Risks specific to the spatial layer

- **Determinism.** Movement must use the same seeded randomness as everything else. If actors wander using an unseeded RNG, replays diverge. Tie movement seeds into the episode seed hierarchy.
- **Runaway clustering.** Without repulsion, all characters drift together (or all apart). Add movement goals that push toward variety, or the pairing lottery degenerates.
- **Overspecification.** It's tempting to add elevation, weather, and pathfinding. Don't, until a grievance demands it.
- **Map-narrative mismatch.** If the map says two characters are 6 hexes apart but the script has them in the same room, you get a continuity bug. The scene-location contract has to be enforced, not advisory.

---

## Part 2: Should the hex map live in its own repo?

### The short answer

**A separate module: yes, immediately. A separate repository: not yet, but with a clear, testable trigger for when to split.**

Those are two different decisions, and conflating them is the usual mistake.

### 1. Separate module vs separate repo

A **module boundary** is a code-organization decision: clean interface, no reaching into internals. It costs nothing and you should do it now.

A **repo boundary** is an operational decision: independent versioning, release, CI, and access control. It has real ongoing cost: publishing, version pinning, cross-repo change coordination, and the classic problem where a bug fix needs three PRs in three places.

### 2. The genuine benefits of extracting it

There are real reasons a spatial engine is a *good* candidate for its own repo, better than most components:

- **It has a natural, narrow interface.** `place(actor, hex)`, `move(actor, path)`, `distance(a, b)`, `neighbors(hex)`, `occupants(hex)`, `witnesses(hex, radius)`, `positionsAt(cycle)`. That is a small, stable API, which is the best predictor that an extraction will hold.
- **It is pure and testable.** Hex math is deterministic geometry with no I/O. It can carry an exhaustive unit test suite (distance symmetry, ring/spiral generation, pathfinding correctness) that runs in milliseconds.
- **It's genuinely reusable.** A second project, a map visualizer, or a debugging UI can import it without dragging in the whole Sower. This is the strongest argument: reuse beyond the current consumer.
- **It enforces the meaning/representation wall.** A separate package that knows nothing about LLMs, TTS, or Remotion makes it structurally impossible to leak rendering concerns into spatial logic.
- **It supports independent visualization.** A small map viewer (even a static SVG generator) is very useful for debugging the simulation, and it can live beside the engine without depending on the Sower.
- **It allows different versions to be pinned per episode.** If you later change movement rules, an old episode's `render_manifest.json` can reference the exact spatial-engine version that produced its positions. That aligns with your reproducibility goals.

### 3. The genuine costs

- **Version-skew friction.** Every time you discover the Sower needs a new spatial query, you now change two repos and coordinate a release.
- **You don't know the interface yet.** This is the decisive one. You have zero episodes simulated. The spatial API you'd freeze today is a guess, and extracting an interface before you've used it tends to freeze the *wrong* seams. You'd be publishing a v1 whose shape will change after the first week of real use.
- **More repos to maintain.** Your topology already has `worker-sower-engine`, `goblin-lore`, `goblin-assets-visual`, `goblin-viewport-template`, `goblin-episodes`, `repo-bot`, `audio-microservice`, `goblin-project`, and more. Every added repo is CI, docs, and dependency surface.
- **State ownership ambiguity.** Is the *map* a stateless library (geometry only) or does it *own* the mutable positions? If it owns state, it competes with the ledger for authority, which violates your "one ledger is truth" principle. This is the most important design point below.

### 4. The critical design decision: stateless library vs stateful service

This determines whether a separate repo even makes sense.

**Option A: Stateless geometry library.** The package provides hex math, pathfinding, ranges, and shape queries. It holds *no* world state. Positions live in the ledger; the library operates on data passed in.

- Pros: pure functions, trivial testing, no authority conflict, perfectly deterministic.
- Cons: the ledger must store positions, and callers pass them in.

**Option B: Stateful spatial service.** The package owns positions and movement history.

- Pros: single place for spatial invariants.
- Cons: now you have two sources of truth (ledger and map), and reconciling them is exactly the category of bug your architecture exists to prevent.

**My recommendation is Option A.** Extract the *geometry*, keep the *state* in the ledger. That gives you the reuse and testability benefits with none of the authority conflict. The ledger remains the only mutable truth, and the spatial library is a pure function over ledger data.

### 5. A concrete recommendation with a trigger

**Now:** put the spatial code in `worker-sower-engine/src/spatial/` as a strict module. Rules:

- It exports a narrow, documented interface.
- It imports nothing from the rest of the Sower (no ledger, no LLM, no pipeline).
- It takes plain data in and returns plain data out.
- It has its own test file that runs without any other dependency.
- Positions live in the ledger, not in the module.

This gets you every benefit of separation (testability, wall enforcement) and defers every cost (versioning, coordination).

**Split into its own repo when any of these becomes true:**

1. A second consumer needs it (a map viewer, a lore tool, a different project).
2. The interface has been stable for several episodes with no signature changes.
3. You want per-episode version pinning of the spatial rules and can't get it any other way.
4. Compile/test time for the Sower becomes painful and the spatial suite is a meaningful part of it.

If none of those are true, the repo is overhead.

A practical bonus: because you're enforcing "imports nothing from the Sower," the eventual extraction becomes a mechanical `git subtree split`, not a refactor. You'll have done the hard part already.

### 6. If you do split, how I'd structure it

A name like `goblin-hexmap` or `goblin-spatial` works, and I'd shape it as:

```text
goblin-spatial/
├── src/
│   ├── coords.ts        # cube/axial types, conversions
│   ├── distance.ts      # distance, ring, spiral, range
│   ├── pathfind.ts      # A* with terrain costs
│   ├── visibility.ts    # line-of-sight, witnesses
│   ├── terrain.ts       # terrain types, movement cost tables
│   └── index.ts         # the only public surface
├── schemas/
│   ├── hexmap.schema.json     # the map definition (tiles, terrain, location_ids)
│   └── position.schema.json
├── maps/
│   └── camp.hexmap.json       # versioned map data (this is canon-adjacent)
├── tools/
│   └── render-map-svg.ts      # debug visualizer
└── test/
```

Two ideas worth noting:

- **The map *definition* is data, not code, and it's canon-adjacent.** Which hex is the latrine, where the siphon room sits, terrain types: that's world law. It arguably belongs in `goblin-lore` (immutable canon) rather than the spatial engine. The clean split is: **lore owns the map data; the spatial library owns the math; the ledger owns who's standing where.** Three different things, three different homes.
- **A debug SVG renderer is disproportionately valuable.** Being able to look at the map at cycle N with characters, props, and recent movement trails will surface simulation bugs (clustering, dead zones, unreachable rooms) faster than any log.

### 7. One more consideration: what the hex layer implies for the visual stack

Because hex position is semantic, you might be tempted to let it drive the *screen* layout in Remotion (put characters at screen positions proportional to hex distance). Resist that for now. Screen composition is a representation concern with its own rules (framing, eyelines, camera). Keep the mapping as a one-way projection: hex → `location_id` → background matte, with staging decided in the viewport. Otherwise the wall between meaning and representation erodes from the spatial side.

---

## Part 3: What I'd add to the earlier "Simulation before language" section

To fold this back into the section you asked me to expand, the corrected description would read:

> **Simulation before language.** Deciding *who is where, who collides with whom, over what, and who wins* is done by deterministic, seeded simulation over a spatial world and a mutable ledger. Characters occupy hexes on a canon-defined map; a movement phase repositions them under seeded, motivation-driven rules; pairing is restricted to actors within reach; witnesses and knowledge propagate by proximity; and duel outcomes mutate the ledger. Only then does an LLM write surface prose, under hard constraints, for a scene whose participants, location, stakes, and outcome are already fixed. Space supplies causality that language models cannot reliably sustain on their own.

## Bottom line

The hex map is arguably the most underrated part of the design: it turns "who fights next" from an authorial choice into a consequence of the world. Making it a strict, isolated module now gives you nearly all the benefit of a separate repo. Extract it into its own repo only when a second consumer or a stable interface justifies the coordination cost, and when you do, extract the *geometry* as a stateless library and leave positions in the ledger and map data in the lore.

If it would help, I can sketch the spatial module's TypeScript interface, define the hexmap JSON schema, or lay out the movement-phase rules and how they'd hook into the ledger.This new document is a strong consolidation, and it converges with the earlier material and my two previous answers on the core. That convergence is itself informative. But it's also long, repetitive in places (several sections restate the same principle in different clothes), and a few of its claims are subtly wrong or under-examined. I'll work through it in layers: what's most valuable, where I'd correct or sharpen it, and what I'd add that it misses.

Same caveat as before: I can only see the pasted text, not your repos. Everything here is design analysis, and the document itself is a design document, not evidence that anything works.

---

## Part 1: The ideas that are genuinely load-bearing

The document lists 67 sections and ends with 15 "protect at all costs" ideas. Most of the 67 are elaborations. I'd group the durable content into five ideas, in order of importance.

### 1. Authority: the ledger decides, generation consumes

The strongest sentence in the document is: *"Generated content may consume state. It may never silently redefine state."*

The word **silently** is doing precise work. Generation is allowed to *propose* (an LLM can suggest Bog grabs the siphon), but the proposal must pass through a deterministic gate that decides whether it's legal. What's forbidden is a proposal becoming fact by appearing in prose.

The nuance most people miss: this only has teeth if a violation produces a *failure*, not a warning. The document says this well ("It is a pipeline error. The draft should fail."). A ledger that only documents state is a wiki; a ledger that rejects drafts is a governor. The practical test is: **write one deliberate violation (a limb-injured character using that limb) and confirm the pipeline actually rejects it.** If nothing rejects it, you don't have authority yet.

There's a subtler layer the document gestures at but doesn't fully spell out: authority has two directions.

- **Restrictive authority** (the ledger forbids things): the injured arm can't be used.
- **Generative authority** (the ledger *requires* things): if the simulation says Bog wins and takes the siphon, the scene must contain that outcome.

Both matter, and the second is harder to enforce. Preventing contradictions is easy to lint; verifying that a required outcome actually occurred in the dialogue requires the structured beat representation the document describes later (sections 21 and 22). That's the real reason the AST is important: it converts "did the scene happen as decided?" from a fuzzy prose question into a set-membership check.

### 2. Space is a causality mechanism

The document's reframing is right and worth restating in its sharpest form: without space, story selection asks *"who would be interesting together?"*, an authorial question the LLM answers badly and repetitively. With space it asks *"who can actually encounter whom?"*, a physical question with a determinate answer.

The document's three-way separation (map as canon, spatial math as pure library, positions as ledger state) is correct and matches what I recommended. Two elaborations on why it's correct:

- **Three different change rates.** The map changes almost never (world law). The math changes only when you find a bug. Positions change every cycle. Things with wildly different change rates should not share a home, or the fast-changing thing forces churn on the slow ones.
- **Three different authorities.** Lore owns the map. Code owns the math. The ledger owns positions. Because each fact has exactly one owner, there's no reconciliation problem, which is the class of bug this whole architecture exists to prevent.

The document's example (`distance(positionA, positionB)` versus `mapService.getCharacterDistance("Bog", "Snerk")`) is a good illustration of a principle worth naming: **pure functions over passed-in data make the source of truth visible at the call site.** The second form hides where the positions come from.

### 3. Simulation before language

The document's central practical claim: give the LLM a fully-decided situation and ask it to make that situation entertaining, rather than asking it to invent reality and describe it. The example scene spec (participants, location, grievance, what each character believes, predetermined outcome, required actions) is exactly the right shape.

The nuance: **constraining the LLM this much changes what you should expect from it.** It becomes a *stylist under specification*, not an author. That's a feature, but it has a cost the document under-discusses: highly constrained generation can become stilted, because every constraint you add narrows the space of natural-sounding lines. You'll need to tune how much you specify. Over-specifying ("required_actions" that dictate every beat) produces scripted-sounding dialogue; under-specifying lets the model drift. The right amount is discovered empirically by reading output, not by design.

### 4. Time: audio is the clock, positions are coordinates

The document is right on both sub-points and I'd endorse them as stated:

- **Audio determines visual timing** (synthesize first, measure, allocate frames).
- **Absolute anchoring** ("timeline positions are coordinates, not consequences of repeatedly accumulating durations").

One correction to the document's own framing: it says *"Don't calculate: shot 1 ends → shot 2 starts."* Slightly misleading. You *do* compute the cumulative frame positions from durations; the point is that you compute them **once, up front, as integers, and store them**, rather than deriving each shot's start from a running floating-point sum at render time. Integer frame arithmetic doesn't drift; float accumulation can. The distinction is "computed once as integers" versus "re-derived through a chain."

One more thing to lock in that the document mentions only as "store the audio file, duration, start frame, end frame": store **both** the measured `duration_ms` and the derived frame counts. Duration is the observation; frames are the derivation. If you ever change fps, you re-derive frames from the durations rather than losing information.

### 5. Media never creates state

Section 35 ("Media describes the state; media does not create the state") is the fourth wall of the architecture and the one most likely to be violated accidentally. The subtle failure it describes: an animation of Bog falling being *read* as evidence Bog is injured. The general rule is that information flows one way, world → script → media, and any stage that could feed back upstream needs an explicit, audited path.

The place this will actually bite you is **human edits at the media stage.** A director tweaks a line in the final TSX ("make Bog say something angrier"). If the ledger records Bog as calm and now the video shows anger, you have a divergence. The sealed-file lifecycle from earlier material addresses this; the simple version is: **any human edit that changes meaning must be routed back through the AST/scene spec and re-derived downstream, and any edit that changes only representation (easing curves, framing) is allowed to stay local.** That distinction (meaning-changing versus representation-changing edits) is the decision rule, and it's not stated anywhere in the document.

---

## Part 2: Places where I'd correct or sharpen the document

### 1. "2d6 is not the important part" is right, but the section understates a real design danger

The document correctly says the specific dice don't matter and that you should tune empirically. What it misses is that **a bell curve has a specific dramatic consequence you should decide deliberately.** With 2d6, the center dominates: the most common results cluster near the middle, so *most encounters will have small margins.* That interacts directly with the outcome taxonomy (Mutual Wound at margin 1 to 2, Clean Win at margin ≥ 4). Roughly, with equal-strength opponents the distribution of the *difference* of two 2d6 rolls is a triangular-ish distribution centered on zero, which means Mutual Wound and Costly Win will be very common and Clean Wins comparatively rare. Whether that's what you want is a creative decision, and the simulator will show it, but you should predict it before the first run so you notice when reality disagrees.

Separately, the paste lists the argument score as `(Base + Roll) + (Strings × W) − (Debuffs × P)`. With Base up to 5 and W=3, a single String can swing a result by 3 points, which is huge relative to a 2d6 bell curve's spread. Leverage will *dominate* outcomes unless W is small or Strings are scarce. This is the kind of thing the 10,000-encounter run will surface immediately, and it's a good example of why the simulator comes before the media pipeline.

### 2. The "attractors" section is the most valuable new idea, and it deserves more rigor

The document introduces simulation attractors (grudge machines, death spirals, runaway winners) and says you need negative feedback. That's correct and important. I'd sharpen it in two ways.

**Name the three structural types**, because each needs a different remedy:

- **Positive feedback loops** (winner gets stronger, loser gets weaker): cure with *diminishing returns* or *catch-up mechanics*.
- **Absorbing states** (a character reaches a condition they can't leave, e.g. permanent injury): cure with *guaranteed recovery paths or decay*.
- **Sticky pairings** (the same two characters keep colliding because proximity and resentment reinforce each other): cure with *cooldowns that scale* and *repulsion terms* in movement.

**Measure, don't hope.** The document lists metrics (pair diversity, participation, grievance utilization). I'd add one that's especially diagnostic: **entropy of the pairing distribution over a sliding window of episodes.** A healthy world has pairing entropy that fluctuates; a degenerate one collapses toward zero. It's one number, cheap to compute, and it catches the most common failure early.

### 3. The knowledge/belief distinction is excellent, but the document skips a hard problem

Section 13 to 14 distinguish truth, knowledge, belief, and suspicion. That's the right taxonomy and it's the richest source of drama in the design. What the document doesn't address is **how false beliefs get created and corrected**, which is where the actual implementation difficulty lives.

Concretely, you need rules for:

- **Belief formation:** does Bog believe Snerk stole the siphon because he saw something, was told, or inferred? Each has a different confidence and different fragility.
- **Belief update:** when contradicting evidence arrives, does the belief flip, weaken, or persist? Real people (and good comic characters) often *don't* update, so "resists correction" can be a character trait.
- **Testimony and unreliable narrators:** if Mog *tells* Bog something false, Bog's belief should carry provenance ("told by Mog"), so later you can have Bog discover Mog lied.

A minimal viable representation that supports all of this: each belief is a record `{holder, proposition, confidence, source_event, source_type}`. That gives you dramatic irony *and* an audit trail for why a character believes something. Without provenance, you can't generate "how did Bog find out?" reveals, which are the payoff scenes.

A caution about the prompt-assembly strategy the document endorses ("give each character only their own knowledge"): it's correct, but **a single scene involves multiple characters speaking, and one LLM call often writes both sides.** If you give a single call both characters' private knowledge, you've re-created the leak problem. The options are (a) generate each character's lines in separate calls with separate contexts and merge them, which is robust but loses the natural back-and-forth, or (b) give one call a carefully constructed scene context where each character's private knowledge is clearly bounded and tested for leakage. The document treats "omission is stronger than instruction" as settled, but for multi-speaker scenes it's a genuine architectural tradeoff you should decide consciously. Option (a) is safer for high-stakes secrets; option (b) is fine for low-stakes ones.

### 4. "Dialogue AST" versus "prose": the document is right but blurs a distinction

Sections 21 and 22 argue for structured beats (`actor`, `action`, `dialogue`) as the primary artifact. Correct. But the document treats the AST as if it removes the need to check prose, and it doesn't fully. The AST tells you *what beat was intended*; the `dialogue` field is still free text that can smuggle in violations (a line of dialogue that reveals a secret the character shouldn't know, or references an injured limb). So you need **both**: structural checks on the beat sequence (did required beats occur, in order?) and lexical/semantic checks on the dialogue strings (leaks, banned references).

The good news is the AST makes the second kind of check *easier*, because you're checking short isolated strings against a known speaker's knowledge, not a sprawling paragraph.

### 5. Reproducibility section: the document softens the earlier overclaim correctly, but I'd go one step further

The document's revision ("preservation first, regeneration second; archive the MP4 and the inputs") is the right correction to the earlier "bit-identical years later" overclaim, and I strongly endorse it. Two additions:

- **The archive is the primary preservation strategy, so the archive itself needs a preservation plan.** Content-addressed storage in R2 is fine, but storage buckets get deleted, accounts lapse, and vendors change terms. The realistic minimum is a second copy somewhere you control and a periodic integrity check (re-hash a sample of stored objects). This is unglamorous and far more likely to save you than any provenance graph.
- **Preserve the *rendering-relevant* environment, not just the code.** For a Remotion project the silent killers are fonts and the Chromium version. Committing the exact font files into each episode directory (which fits your vendoring approach) eliminates the most common source of "the old episode looks slightly different now."

### 6. Overlooked risk in "source-baking": generator bugs are multiplicative

The document endorses source-baking for historical isolation, correctly. It doesn't mention the flip side: **the generator is now the single point where a bug propagates to every future episode.** Old episodes are safe (they're frozen); new ones all inherit whatever the generator gets wrong. That argues for treating `generate-episode-repo.ts` with more rigor than any single episode's output: snapshot tests (generate a known scene, diff the produced TSX against a committed golden file), and a rule that generator changes are reviewed as diffs of *generated output*, not just diffs of generator code. Reviewing the output diff is what actually reveals unintended behavior changes.

### 7. The minimal architecture diagram omits the feedback loop that matters most

The document's final diagrams are strictly forward-flowing. But the simulation only becomes good through a **tuning loop**: simulate → inspect statistics and read samples → adjust rules or grievances → simulate again. And the creative quality depends on a second loop: human review → record why a scene was rejected → change prompts or constraints. Neither loop appears in the pipeline diagrams. They should, because they're where most of your actual time will be spent. A pipeline that runs one direction is a *production* system; the two feedback loops are what make it a *development* system, and you'll be in development mode for a long time.

---

## Part 3: Things I'd add that the document doesn't say

### 1. Decide what an "episode" is relative to a simulation "cycle"

The document uses both terms fluidly but never defines the mapping. Is one episode one cycle? Several cycles? One scene? This is a foundational decision that affects everything downstream: how much world change happens per episode, how movement and pairing are scheduled, how long the average episode runs, and how you pace continuity. A reasonable starting model is **one episode = one dramatic scene (one encounter) plus optional short connective beats**, with several ledger cycles of quiet movement between encounters. But whichever you choose, write it down, because "cycle," "scene," "episode," and "shot" each sit at a different level, and confusing them causes real bugs (e.g., applying a cooldown per episode when you meant per cycle).

### 2. A "canon change" protocol

The document treats canon as immutable, and for one episode's runtime it is. But over months of production you *will* discover canon errors (a map inconsistency, a character trait that doesn't work). The architecture needs an answer to: **what happens to already-rendered episodes when canon is corrected?** The clean answer, consistent with everything else: canon is versioned, episodes record the canon version they were made against, and a canon fix creates a new version without touching old episodes. Whether the ledger's *history* is retroactively affected is a creative decision (does the corrected fact change what "actually happened" in episode 5?), and you should make it explicitly rather than discover it in a bug report.

### 3. Character voice as a testable artifact, not just a prompt

The document says character distinctiveness is a creative-health metric but gives no way to measure it. A cheap, effective approach: for each character, maintain a small **voice fixture** (a dozen example lines with tags for diction, sentence length, verbal tics, and forbidden phrases). Then a test can check generated lines against measurable properties, such as average sentence length, presence of signature tics, and absence of another character's tics. It's not aesthetic judgment, but it catches the single most common LLM failure in multi-character writing: **all characters converging on one generic voice.** A blind test is even better: strip speaker labels from generated lines and see whether you (or a classifier) can tell who's talking.

### 4. Cost and latency budget for the LLM loop

The document notes local inference on CPU (Qwen on Rig 1 CPU/RAM) in its source material. That's a serious constraint: CPU inference of a reasonably capable model is slow, and your design includes bounded retry loops, a possible second extraction pass, and per-character generation. Multiply those together and a single scene may take many minutes to hours. **Measure tokens-per-second on your actual hardware before finalizing the multi-pass validation design,** because the elegant multi-call architecture can become impractical if each call is slow. This is exactly the sort of physical constraint the tracer bullet exists to reveal, and it may push you toward fewer, larger calls with stronger deterministic post-checks.

### 5. What "fun to watch" needs that a simulation can't supply

A world that's causally coherent is necessary but not sufficient. Comedy and drama depend on **timing, escalation, surprise, and payoff**, none of which fall out of ledger consistency. Two structural additions worth considering in the scene spec:

- **A "beat shape" template** (setup → escalation → reversal → button) that the simulation outcome selects from. The outcome taxonomy (Backfire, Mutual Wound, etc.) already implies different shapes; making them explicit gives the LLM a comic structure to fill.
- **A callback register**: a small store of prior memorable lines or objects the writer can deliberately reference later. Running gags and callbacks are what make episodic comedy feel like a *world*, and they require memory of *expression*, not just memory of state. The ledger tracks what happened; you also want a lightweight index of what was *funny* so it can be reused.

### 5b. The one metric I'd build before any dashboard

A single **"boredom detector"**: over the last N generated scenes, measure repetition in grievance, pairing, location, outcome type, and opening line structure. If several of these are simultaneously repeating, the world is stagnating regardless of how healthy the individual metrics look. It's simple, cheap, and directly targets the failure the audience will actually notice.

### 6. A note on the two repos question, now that this document restates it

This document repeats the "module now, repo later" recommendation for the spatial engine, which matches mine. One clarification on the trigger conditions worth adding: the *most reliable* signal that extraction is warranted is **not** "the interface feels stable" (which is a feeling) but **"I have written a second, independent consumer and it needed no changes to the interface."** If a debug map-renderer can consume the library unchanged, the interface is genuinely general. If you keep having to widen it to suit the renderer, it isn't ready.

---

## Part 4: A corrected and tightened statement of the invariants

The document's final list has 15 items. Some are principles, some are practices, and a few overlap. Here's how I'd reorganize them so the *kind* of statement is clear.

**Authority rules** (who owns what):
1. The ledger is the single source of mutable truth.
2. Canon is read-only and versioned; corrections create new versions.
3. Media never creates or changes state; meaning-changing edits route back upstream.

**Causality rules** (how things happen):
4. Simulation decides events before any language is generated.
5. Space determines who can encounter whom.
6. Every consequential event and state change has a recorded cause.

**Information rules** (who knows what):
7. Characters receive only the information they possess; omission over instruction.
8. Knowledge, belief, and truth are separate, and beliefs carry provenance.

**Time and determinism rules:**
9. Audio is the timing authority; frame positions are computed once as integers.
10. Narrative randomness is seeded, namespaced by purpose, and logged; representational randomness never feeds back into state.

**Engineering rules:**
11. Deterministic requirements are enforced by deterministic code, not by asking an LLM.
12. Cheap checks run before expensive ones; drafts are permissive, broadcast is strict.
13. Every stage emits an inspectable, versioned artifact.
14. Old episodes are immutable; finished media is archived independently of regenerability.

**Process rules:**
15. The simulator runs without media, and human editorial review happens before expensive production.
16. **(Added)** Two feedback loops, simulation tuning and creative review, are first-class parts of the system.

I added the sixteenth because its absence from the document is the most consequential structural omission.

---

## Part 5: A revised order of work with decision gates

The document's ten-phase plan is sound. I'd make it more actionable by attaching a *gate* to each phase, meaning a concrete, checkable condition that must be true before moving on. Without gates, phases blur and the project drifts into the "keep designing" trap the material itself warns about.

| Phase | Deliverable | Gate to advance |
|---|---|---|
| 1. World model | Schemas + ledger | One hand-authored world loads and validates; a deliberate schema violation is rejected |
| 2. Spatial | Stateless hex library + tests | All invariant tests pass; a debug SVG shows the map and positions |
| 3. Simulation | Headless simulator | 1,000-episode run completes; pairing entropy and outcome distribution reviewed by you and judged non-degenerate |
| 4. Grievances | ~10 authored grievances | Each grievance has surface, underneath, props, location; at least one produces a good scene when hand-fed to an LLM |
| 5. Scene spec | `scene.json` | Spec contains everything needed to write the scene without further decisions |
| 6. Expression | Dialogue AST + validators | Deliberate leak and deliberate contradiction are both caught; a clean scene passes |
| 7. Human gate | Review workflow | You can accept or reject a scene in about a minute and record why |
| 8. Audio | TTS + timing | Measured durations produce integer frames; two runs yield the same manifest |
| 9. Render | Cutout renderer | One watchable 3 to 10 second scene with correct sync |
| 10. Archive/QA | Validation + archive | Full artifact set stored; a fresh checkout can find and replay it |

Two notes on the gates. First, **phases 3 and 4 will iterate against each other**: you can't judge whether the simulation is interesting without real grievances, and you can't tune grievances without seeing how often they fire. Plan for that loop rather than treating them as strictly sequential. Second, the gate for phase 3 deliberately relies on *your judgment* of the statistics, not an automated threshold, because "non-degenerate" isn't something you can specify in advance.

---

## Bottom line

The document's core, deterministic world authority, space as causality, simulation before language, audio as clock, media as output-only, is right and I'd protect it. Its most valuable new contribution is the attractor analysis and the "simulator first" discipline. Its weaknesses are the ones I flagged: it under-specifies how beliefs form and change, glosses the multi-speaker leakage tradeoff, omits the tuning feedback loops, and doesn't define the relationship between cycle, scene, and episode. And, as with the earlier material, its best advice is also its most repeated: the design is well ahead of the evidence, and the next unit of progress is a working simulator and one short scene, not more architecture.

If you'd like to go deeper on one piece, the highest-leverage next artifacts would be the belief-provenance data model (since it underpins the payoff scenes), the pairing-entropy and boredom-detector metrics for the simulator, or a concrete definition of the cycle/scene/episode hierarchy.This document is the consolidation of my previous answer, fed back through the same generator, with additions. That matters for how you read it. Where it restates my earlier points it is mostly faithful. Where it adds material, some additions are excellent, and several contain errors that would cause real damage if implemented as written. I'll go through it the same way as before: what's load-bearing, what needs correction (including a few outright mistakes), and what's still missing.

Same caveat: I can only see pasted text, not your repos.

---

## Part 1: What in this document is genuinely valuable

### 1. The five pillars survive

Authority (ledger governs), space as causality, simulation before language, audio as clock with integer-anchored timeline, and media never mutating state. These have now appeared in four consecutive documents with increasing agreement, and they hold up. The document's additions to them are worth keeping:

- **Two-way enforcement of authority** (restrictive: forbid impossible actions; generative: mandate required outcomes) is a clean way to state something that was implicit before. The generative half is the harder one: verifying that the AST beat sequence *terminates in the mandated state transition* is a structural check, and it only works if beats are typed and the outcome is an explicit terminal event, not something you infer from prose.
- **"Tuning the constraint envelope"** captures the real creative tension in simulation-before-language: too specified gives stiff dialogue, too loose gives drift. The ledger sets the bounding box (participants, tension, required turns, exit conditions), and the LLM fills the interior. That framing is right and it's an empirical tuning problem, not a design decision you can make on paper.

### 2. The spatiotemporal hierarchy (Cycle, Episode, Scene, Beat/Shot)

This answers the omission I flagged last time (the document previously used cycle, scene, and episode interchangeably), and having the table is a real improvement. The underlying idea is correct: each level has its own clock and its own set of permitted state mutations, and bugs come from applying a mutation at the wrong level (a cooldown decremented per scene when you meant per cycle).

Two refinements to the table itself:

- **"Beat" and "Shot" are not the same thing.** A beat is a narrative unit (an accusation, a denial). A shot is a visual/audio unit (one continuous camera setup, one audio stem). One beat can span multiple shots (cutting between speakers during a long accusation), and one shot can cover several beats. The table lumps them at L4, and that will cause trouble the moment you want a reaction cut. Keep them as separate levels: **Scene → Beat (narrative) → Shot (presentation) → Frame.** Beats belong to the AST; shots belong to the exposure sheet. That preserves the meaning/representation wall.
- **The "1 chronological day per cycle" and "1 to 3 scenes per episode" numbers are placeholders.** They're reasonable starting values, but nothing derives them. The relationship between cycles and episodes is a *creative pacing decision* (how much unseen time passes between encounters), not a technical constant. Decide it, write it down, and expect to change it.

### 3. The belief-provenance data model

The `BeliefRecord` interface is the best new artifact in the document. Belief with a source type (direct observation, testimony, inference, rumor), a confidence, a pointer to the originating event, and a `resists_correction` trait is exactly what you need for reveal scenes ("how did Bog find out?"). Keep this design.

Nuances the document doesn't cover:

- **`perceived_truth_value: boolean` plus `confidence` is redundant and slightly confused.** A belief that something *didn't* happen with confidence 0.9 and a belief that it *did* with confidence 0.1 are close to the same state. Pick one representation: a single probability that the proposition is true, from the holder's perspective. Booleans plus confidence invite inconsistent pairs (`true` with confidence 0.1).
- **`target_id` singular is too narrow.** Some propositions involve multiple entities ("Snerk gave Mog the siphon"). Either model propositions as structured tuples (subject, predicate, object) or accept that this field is a convenience for the simple accusation case and will need generalizing.
- **Belief *decay* and *spread* need rules.** Rumors propagate, and confidence should degrade with each hop. Without decay rules, secrets saturate the whole cast within a few cycles, which is one of the attractors you should watch for.

### 4. The stylometric voice fixture

Automated checks that a character's lines stay inside measurable stylistic bounds is a good, cheap idea, and it directly targets the most common multi-character LLM failure (everyone converging on one generic voice). Keep it, with the caveats in Part 2 below.

### 5. The canon errata protocol

Append-only errata, episodes pinned to a `canon_version`, and an explicit director decision between freezing history and remastering. This is the right answer to "what happens when you discover a canon mistake?" and it's consistent with the immutable-episode principle. One nuance the document skips: **remastering must not silently change what already aired.** The document handles this correctly by tagging the remaster as a new build, but be explicit that the *original* stays available and addressable, or you lose the historical record you built the whole system to protect.

### 6. The gated phase table

Attaching binary exit gates to each phase is a real improvement. The one flagged problem is in how a few of the gates are specified (Part 2, item 9).

---

## Part 2: Errors and overreach to correct

These matter most, so I'll be specific.

### 1. The 2d6 margin table is wrong

This is a factual error stated with a table. The document gives, for the difference of two 2d6 rolls: 0 → 16.7%, ±1 → 27.8%, ±2 → 22.2%, ±3 → 16.7%, ±4 → 11.1%, ±5 → 5.6%. Let me check against the actual distribution.

The difference of two independent 2d6 sums ranges from -10 to +10. Each 2d6 has 36 outcomes, so 1,296 combinations total. The count for a margin of exactly *d* is the sum over sums *s* of `ways(s) × ways(s − d)`, where `ways` follows 1,2,3,4,5,6,5,4,3,2,1 for sums 2 through 12.

- Margin 0: 1²+2²+3²+4²+5²+6²+5²+4²+3²+2²+1² = 1+4+9+16+25+36+25+16+9+4+1 = **146**, so 146/1296 = **11.27%**.
- Margin ±1 (one side): 1·2+2·3+3·4+4·5+5·6+6·5+5·4+4·3+3·2+2·1 = 2+6+12+20+30+30+20+12+6+2 = **140**, so 140/1296 = 10.80% per side, **21.6%** for ±1.
- Margin ±2 (one side): 1·3+2·4+3·5+4·6+5·5+6·4+5·3+4·2+3·1 = 3+8+15+24+25+24+15+8+3 = **125**, so 9.64% per side, **19.3%** for ±2.

So the true figures are roughly **11.3% for 0, 21.6% for ±1, 19.3% for ±2**. That gives margins of 0 to 2 a combined probability of about **52.2%**, not the 66.7% the document claims. The document's table also claims 0.0% for margins of 6 or more, which is plainly false: margins up to ±10 are possible and ±6 or greater has real probability (about 15% combined). And its own listed probabilities sum to well over 100% when you count each ± twice.

The qualitative conclusion (many encounters have small margins, so Mutual Wound and Costly Win will be common) is still right, just less extreme than stated. The lesson is the one already flagged: **don't trust distribution tables in a design document, including mine; compute them.** A twenty-line script enumerating all 1,296 outcomes gives the exact answer and should be the first thing in your simulation harness.

### 2. The leverage claim ("30 to 40 percentage points") is also unverified

The document says a `+3` swing from one String "swings win probability by 30 to 40 percentage points near the distribution center." Given the corrected distribution above, a +3 shift moves the winning probability substantially, but the exact number depends on the baseline. Rather than trust either figure, compute win probability as a function of net modifier. The direction of the point (leverage dominates unless W is small or Strings are scarce) is sound. The magnitudes should come from calculation, not assertion. And "cap the contribution at +2" is a reasonable design lever, but note that capping a resource's effect changes how players (or the AI) should value it, so it interacts with the leverage-expenditure heuristic in Stage 3c.

### 3. The complexity claim about set intersection is wrong-ish

The document states the banned-verb check runs in `O(min(|A|, |B|))`. Set intersection with a hash set is O(min(|A|,|B|)) in the standard analysis, so that specific claim is fine. The larger issue is the framing: earlier documents called it "O(1)," and this one corrects that, but neither matters. These sets have a dozen elements. The performance of this check is irrelevant; its *correctness* is what matters. Treat algorithmic-complexity notation here as decoration, not information.

### 4. Pairing entropy: the gate "H(P) ≥ 2.2" is arbitrary and probably wrong for your cast size

The entropy formula is correct: `H = −Σ pᵢ log₂ pᵢ`. But the exit gate specifies a threshold of 2.2 bits with no derivation. Entropy is bounded by log₂(M), where M is the number of possible pairs. For a cast of 6 characters there are 15 unordered pairs, so the maximum is log₂(15) ≈ 3.9 bits. For 4 characters there are 6 pairs, maximum log₂(6) ≈ 2.58 bits, so 2.2 would demand near-uniform pairing, which is neither necessary nor desirable, since you *want* some pairings to be more frequent than others (rivalries are the point). A fixed threshold ignores cast size and ignores the fact that structured, uneven pairing is good drama.

Better: **normalize** by dividing by log₂(M) (giving a value between 0 and 1), and treat the threshold as something you set by looking at what a healthy-feeling run looks like, then guard against *collapse* (a sharp drop) rather than demanding a specific absolute value. The document's "pre-registered floor" idea is right; the specific number isn't derived.

### 5. The Boredom Detector's math is misapplied

The document computes Jaccard similarity `|A∩B| / |A∪B|` across scene properties, and calls the result a "Jaccard distance." Two errors:

- **Jaccard similarity and Jaccard distance are different.** Distance is `1 − similarity`. The text uses the two interchangeably.
- **Jaccard applies to sets, but most of the listed properties are categorical single values**, not sets. A scene has *one* grievance slug, *one* location, *one* outcome type. For single categorical values, "Jaccard" degenerates to a simple match/no-match, so you'd just count the fraction of matching attributes. Jaccard becomes meaningful only if you compare *sets*, for example the set of props involved or the set of characters present.

Also, the operative threshold ("exceeds 0.65, reject the scene and re-run the lottery with heavy negative weights") is a hardcoded number applied to a metric whose behavior you haven't observed. It's a reasonable *mechanism* (automatic anti-repetition pressure), but the 0.65 is a guess to be tuned from real data, and the "Opening dialogue syntactic structure" property assumes you can cheaply classify openings into a small set of types, which is itself a nontrivial classifier.

One more design concern: **a detector that automatically rejects and re-rolls scenes changes the distribution the simulation produces.** That's fine if intended, but it means your simulator statistics (Phase 3) must be measured *with* the detector active, or you'll tune to one behavior and ship another.

### 6. The multi-speaker "Leak Sentry" rests on a claim that's stated too confidently

The document says that in a unified prompt, "Character B's attention heads will attend to Character A's private context, causing conversational leaks." As a general tendency, leakage is a real, well-observed phenomenon. But the mechanistic phrasing ("attention heads will attend") is overconfident. What's actually true is behavioral: models often let information present in context influence characters who shouldn't know it. The fix doesn't depend on the mechanism, so the claim isn't needed.

More importantly, the proposed remedy, **a post-generation Leak Sentry that scans for lexical tokens or lemmas associated with the unrevealed knowledge**, has a fundamental limit. Lexical scanning catches *verbatim* leaks. It misses *paraphrased* or *implied* leaks, which are the more common and more damaging kind. If the secret is "Snerk stole the siphon," a leak might read "Nobody else would have had access to that thing you keep sneezing near," which contains none of the tagged tokens. So the Leak Sentry is a useful *first line*, but treat it as catching the easy cases, and keep the safer strategy available for high-stakes secrets: **for any secret whose leak would break the scene's premise, generate that character's lines in an isolated call.** The document presents role fencing plus sentry as "the resolution." It's a good default and a bad guarantee.

### 7. "Independent extraction pass by a temperature-0 model" is not independent or deterministic

The document lists "a deterministic (temperature 0) model reads the emitted prose and extracts motor actions." Two problems. Temperature 0 makes sampling greedy, but a language model is still not a rule-based parser, and GPU/CPU floating-point differences can still yield different outputs across runs or hardware. Also, if the extractor is the *same model family* as the generator, its errors are correlated with the generator's errors, so it isn't independent in the way the word suggests. The negation-aware lemma scan is the genuinely deterministic component. I'd rank the three checks as: **(1) grammar-constrained enum (cheap, strong), (2) dependency-parse lemma scan with negation handling (deterministic, moderate), (3) model-based extraction (a semantic backstop that will disagree with the others sometimes, and needs a defined policy for what happens when it does).**

One thing the document says here that is correct and valuable: a self-reported enum verifies only the *claim*. Keep that.

### 8. The stylometric fixture bounds are illustrative, not derived

The example (mean sentence length 6.2 to 11.5, subordinating-conjunction rate 0.01 to 0.04, mandatory tics `"aye"`, `"scraps"`, `"siphon"`) is a plausible shape, but two design cautions:

- **"Mandatory lexical tics" as a hard requirement will produce caricature.** If every Bog line must contain "aye," "scraps," or "siphon," the dialogue will sound like a parody of itself and will force nonsensical insertions. Tics should be *probabilistic frequencies over many lines*, not per-line requirements. Check that the tic *appears at roughly the intended rate across a scene or a season*, not in every line.
- **The banned-word list ("testament," "tapestry," "palpable," "furthermore") is a good instinct.** Those are recognizable LLM-isms. But a blacklist plays whack-a-mole: models substitute other stock phrases. It's better as one signal among several than as a hard gate.
- **Numeric bounds should be derived from your hand-written exemplars, not guessed.** Write ten real Bog lines, compute the statistics, then set bounds with a margin. Setting bounds first is backwards.

### 9. Several gates in the phase table are ill-specified or contradict earlier advice

- **Phase 3 gate ("pairing entropy ≥ 2.2; zero crashes")** has the entropy problem described in item 4.
- **Phase 5 gate ("machine contract emitted without human intervention")** conflicts with phase 7, where a human reviews scene specs. "Without human intervention" should mean "the generation step doesn't require manual editing," not "no human is ever involved." Clarify.
- **Phase 10 gate ("clean re-render matches binary hash")** re-introduces the byte-identical requirement that the previous documents (and I) agreed to downgrade to a stretch goal. The tracer-bullet checklist does the same: item 6 is `SHA-256(Render_A) == SHA-256(Render_B)`, placed in the *must-pass* list. If the double-render hash differs because of muxer timestamps or encoder threading, you'd read a container artifact as a pipeline failure. Split it: **pass = both renders complete and are visually and audibly equivalent (compare decoded frame hashes and PCM samples); stretch = container hashes match.**

### 10. "Event-sourced deterministic media compiler" is the same over-framing as before

The opening sentence brands the architecture as event-sourced. But the *practical* recommendation, made in the previous round and repeated implicitly here, was a plain current-state ledger plus an append-only event log, deferring true event sourcing (pure reducer, replay from genesis) until needed. The document's rhetoric and its actual advice disagree. Be clear which you are building. If you keep a current-state ledger *and* an event log, that's fine and sensible, but it isn't event sourcing unless the log is the *authority* and the state is derived from it. Decide which is authoritative, because keeping both as independent truths creates the very two-source-of-truth problem the architecture forbids.

---

## Part 3: What the document still misses

### 1. Nothing here contains evidence

This is the meta-problem. Four consecutive documents have refined an architecture, and each one ends with the same instruction: run the tracer bullet. Each refinement round has also introduced *new unverified numbers* (entropy thresholds, Jaccard cutoffs, margin tables) and even new *errors* (the 2d6 table). Design rounds with no feedback from running code don't converge on truth; they converge on internal consistency, which is a different thing. The 2d6 table is a perfect example: it looks authoritative, it's wrong, and no design discussion would ever catch it. Running code would have caught it in seconds.

So the most useful thing I can add is procedural: **treat every numeric threshold in these documents as a hypothesis to be measured, not a specification.** Where a number appears, ask what experiment would set it.

### 2. Test the deterministic parts first, and start with what's cheap

Several claims in this document can be verified in an afternoon with no LLM at all:

- Enumerate all 1,296 2d6-pair outcomes and print the true margin distribution.
- Compute win probability as a function of net modifier.
- Compute pairing entropy for synthetic uniform and skewed pairing distributions to see what values are even reachable for your cast size.
- Simulate 1,000 cycles of movement alone (no dialogue) and check for clustering.

That's phases 2 and 3 in miniature, and it will settle disputes that no amount of design prose can.

### 3. The event log needs a decision about granularity

The document repeatedly says "every state mutation should have a cause," but never says how fine-grained events are. Too coarse ("DUEL_RESOLVED") and you lose the ability to explain individual changes; too fine (one event per field change) and the log becomes unreadable. A workable middle: **one event per *decision* (a duel, a movement, a disclosure), each carrying a list of resulting effects.** That matches the earlier example (`COSTLY_WIN` with effects), and it keeps the log human-readable while still supporting "why did resentment change?"

### 4. The audio path has more moving parts than the document admits

The "audio is the clock" principle is right, but a few practical issues never come up:

- **TTS output varies between runs** unless seeded, so "the same script gives the same durations" is not automatically true. A different synthesis run of the same line can differ by tens of milliseconds, changing frame counts. Once approved, audio should be treated as an *archived artifact* (consistent with the archive-first stance), not regenerated on demand. Otherwise your locked timeline silently shifts.
- **Trim leading and trailing silence deliberately** before measuring, since silence padding inflates the frame budget.
- **Pre-roll and post-roll frames** (mentioned in the exposure sheet earlier) are creative decisions layered on the measured duration. Keep measured duration and creative padding in separate fields so you can change padding without re-measuring.

### 5. Human review needs a concrete interface, not just a gate

Phase 7's gate is "director can review, accept, or reject a scene spec in ≤ 60 seconds." That's achievable only if the review artifact is *short and readable*: the outcome, the two or three key lines, the location, and why the scene was selected, rendered as one screen of plain text. If you show a reviewer raw AST JSON, sixty seconds is fantasy. Design the review view first; it also doubles as your debugging output for the simulation ("explain why this scene was selected").

### 6. Record *why* a scene was rejected, in a structured way

The document's "evaluation corpus" idea from the previous round was good, and this document drops it. Each rejection should carry a small, structured reason (flat dialogue, unclear stakes, repetitive, out of voice, contradiction). Over time that turns your editorial judgment into data you can use to tune prompts and constraints, and it tells you which validator to build next.

### 7. Failure handling and idempotence

The pipeline design describes the happy path. It doesn't say what happens when TTS fails on line 7 of 12, or when the LLM retry loop exhausts its budget. Two properties are worth designing in early: **idempotent stages** (re-running a stage with the same inputs produces the same outputs or cleanly replaces them) and **resumability** (a failed run can continue from the last good artifact, not restart). These matter far more in practice than provenance graphs, because you will hit partial failures constantly on real hardware.

---

## Part 4: A corrected working summary

If I compress this document to what I'd actually carry forward:

**Keep as-is:**
1. Ledger authority with two-way enforcement (forbid impossible, mandate required).
2. Space as causality; map/math/positions owned separately.
3. Simulation before language; tune the constraint envelope empirically.
4. Audio as timing authority; integer frame positions computed once.
5. Media never mutates state; meaning edits route back, representation edits stay local.
6. The belief-provenance model (simplified to a single probability per belief).
7. The errata/versioning protocol for canon.
8. Gated phases.

**Keep but fix:**
- Hierarchy table: separate Beat (narrative) from Shot (presentation).
- Entropy metric: normalize by log₂(pairs); guard against collapse, not a fixed floor.
- Boredom detector: use match-fraction for categorical attributes, Jaccard only for set-valued ones; tune the threshold from data; measure simulator statistics with the detector on.
- Leak handling: role fencing plus sentry for low-stakes secrets, isolated generation for high-stakes ones.
- Validation stack: enum constraint first, dependency-parse lemma scan second, model extraction as a backstop with a defined disagreement policy.
- Voice fixtures: derive bounds from real exemplars; tics as frequencies, not per-line mandates.
- Tracer bullet: byte-identical hash is a stretch goal, not a pass condition.

**Recompute rather than trust:**
- The 2d6 margin distribution (I corrected it above: about 11.3% at margin 0, 21.6% at ±1, 19.3% at ±2, and roughly 15% at |margin| ≥ 6).
- Leverage's effect on win probability.
- Any threshold that appears without a derivation.

**Add:**
- Idempotent, resumable stages.
- Archived (not regenerated) TTS audio after approval.
- A structured rejection-reason log.
- A one-screen review view.
- A written definition of the cycle/episode/scene/beat/shot hierarchy, with beat and shot separate.

---

## Bottom line

The document's core architecture is sound and increasingly well-stated. Its main weakness is the one it shares with the previous rounds: it keeps *adding specificity without adding evidence*, and the specificity is where the errors live. The 2d6 table is the clearest example. The next real progress will not come from another consolidation pass; it will come from a script that enumerates the dice outcomes, a headless simulator that shows you the actual entropy and pairing behavior, and one short rendered scene.

If you want to go further, the highest-value concrete deliverables I can draft are: the dice-distribution and win-probability script, the belief-provenance schema with decay and spread rules, or the one-screen scene review format.