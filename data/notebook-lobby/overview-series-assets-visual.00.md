# **Overview: Series-Assets-Visual .00**

[https://gemini.google.com/app/b902e8efb6ed0c6a](https://gemini.google.com/app/b902e8efb6ed0c6a)

*User prompt: we are starting working on the next repository \[ goblin-assets-visual  \]; can you present me with a complete overview*

Response: **goblin-assets-visual** is the master visual authority and source art repository within **Cluster 04.assets (The Source Art Vault)**. It provides version-controlled, production-approved 2D character cutouts, mouth visemes, emotion banks, and matte environment plates to the downstream compositing pipeline.

Rather than serving as an unindexed bucket of loose graphics, the repository functions as a **strongly typed visual API**. Upstream narrative specifications and downstream compositors (like goblin-viewport-template) interact with goblin-assets-visual through immutable schemas (manifest.json, approved.json), ensuring zero runtime guessing, total asset provenance, and automated layout math.

### **1\. Architectural Boundary & Separation of Concerns**

goblin-assets-visual is strictly isolated from both code execution and generative training material:

> * **Outputs vs. Processes:** It holds only *finished, production-approved renders* and layout metadata consumed by the Remotion compositing layer. The messy, iterative raw materials—such as hundreds of reference images, rejected candidate seeds, RunPod training recipes, and LoRA checkpoints—are isolated in goblin-lora-training (or goblin-render-pipeline).  
> * **Media vs. Narrative Law:** Character injuries, dramatic traits, and lore invariants are legislated upstream in goblin-bible. goblin-assets-visual acts purely as the sensory representation layer.  
> * **Elimination of Runtime Guesswork:** Consuming repositories never glob directories, regex filenames, or perform dynamic image discovery. All graphics are exposed through versioned manifests with pre-calculated pixel coordinates and cryptographic hashes.

### **2\. Directory Topology & Repository Structure**

Assets are managed with Git Large File Storage (Git LFS) for all binary and source graphics formats:

git lfs track "\*.png" "\*.psd" "\*.svg" "\*.ai"

The standard internal directory topology is structured as follows:

goblin-assets-visual/  
├── .gitattributes                    \# Git LFS tracking rules  
├── CHANGELOG.md                      \# Asset iteration history & releases  
├── ASSET\_GUIDE.md                    \# Canvas dimensions, naming rules, export guides  
├── palette/  
│   ├── master\_palette.json           \# Canonical 155-color source of truth  
│   └── palette\_check.py              \# Automated color verification script  
├── shared/  
│   ├── dust\_particle.svg             \# Shared environmental FX particles  
│   └── shadow\_base.png               \# Common ground-contact shadow mattes  
├── ui/  
│   ├── string\_token\_icon.svg         \# HUD and dialogue token elements  
│   ├── speech\_bubble\_frame.svg       \# Vector UI borders  
│   └── camera\_frame\_overlays/        \# Vignettes, cinematic grain, & framing borders  
├── environments/  
│   └── warm\_pipe/  
│       ├── background.png            \# Master environment matte plate  
│       ├── background\_terrified.png  \# Paranoia Clock environment state shifts  
│       └── source/                   \# LFS-tracked working files (PSD/AI)  
└── characters/  
    └── bog/  
        ├── manifest.json             \# Authoritative runtime contract & spatial anchors  
        ├── palette\_lock.json         \# Per-character palette compliance mapping  
        ├── base/  
        │   ├── bog\_idle.png          \# Canonical neutral loop sprite  
        │   └── bog\_talking.png       \# Canonical speaking baseline  
        ├── mouths/                   \# Modular Preston Blair visemes  
        │   ├── mouth\_closed.png  
        │   ├── mouth\_small.png  
        │   ├── mouth\_medium.png  
        │   └── mouth\_wide.png  
        ├── variants/                 \# Promoted condition-specific poses  
        │   ├── bog\_humiliated.png  
        │   └── bog\_smug.png  
        ├── emotion\_bank/             \# Candidate generation & triage staging  
        │   ├── humiliated/  
        │   │   ├── take\_01.png       \# Rejected candidate  
        │   │   ├── take\_02.png       \# Rejected candidate  
        │   │   ├── take\_03.png       \# Winning candidate (promoted to variants/)  
        │   │   └── approved.json     \# Triage rationale, audit logs, & alpha mask  
        │   └── terrified/  
        │       └── approved.json     \# Explicit null lockfile ({ "approved\_take": null })  
        └── source/                   \# Master working files (bog\_master.psd)

### **3\. The Visual Asset Contract (manifest.json)**

The primary integration interface for downstream compositing engines is each character's manifest.json. This contract transforms raster artwork into a machine-computable coordinate system:

{  
  "schema\_version": "2.1.0",  
  "character\_id": "bog",  
  "canvas\_dimensions": { "width": 1024, "height": 1024 },  
  "render\_pipeline": "2d\_cutout",  
  "trained\_from\_lora": "training\_runs/v2/bog\_lora\_v2.safetensors",  
  "base\_states": {  
    "idle": {  
      "file": "base/bog\_idle.png",  
      "sha256": "4a7b9c1d...",  
      "anchor\_point": { "x": 512, "y": 980 }  
    },  
    "talking": {  
      "file": "base/bog\_talking.png",  
      "sha256": "8e3f2a1b...",  
      "anchor\_point": { "x": 512, "y": 980 }  
    }  
  },  
  "condition\_variants": {  
    "humiliated": {  
      "file": "variants/bog\_humiliated.png",  
      "anchor\_point": { "x": 518, "y": 980 },  
      "camera\_anchor\_points": {  
        "crash\_zoom\_target": { "x": 412, "y": 198 },  
        "over\_the\_shoulder\_target": { "x": 480, "y": 320 }  
      },  
      "mouth\_bounding\_box": { "x": 380, "y": 240, "width": 64, "height": 32 },  
      "animation\_hints": {  
        "talk\_bounce\_amplitude": 8,  
        "idle\_shiver\_amplitude": 14  
      }  
    },  
    "terrified": null  
  },  
  "mouth\_shapes": {  
    "closed": "mouths/mouth\_closed.png",  
    "small": "mouths/mouth\_small.png",  
    "medium": "mouths/mouth\_medium.png",  
    "wide": "mouths/mouth\_wide.png"  
  },  
  "animation\_hints": {  
    "talk\_bounce\_amplitude": 12,  
    "idle\_shiver\_amplitude": 2  
  }  
}

#### **Contract Specifications**

> * **Ground Contact Pivots (anchor\_point):** Coordinates marking the character's base foot contact. This locks the puppet rig to the environment plate's floor plane and prevents characters from floating or sliding during camera moves.  
> * **Camera Focus Targets (crash\_zoom\_target):** Centroid offsets focused on the face or eye line. Remotion's camera directives use this coordinate to execute programmatic close-ups without decapitating characters of differing heights.  
> * **Mouth Viseme Envelopes (mouth\_bounding\_box):** Bounding rectangles defining where modular Preston Blair mouth shapes snap over the base pose.  
> * **Dynamic Motion Physics (animation\_hints):** Dynamic weighting parameters (such as talk\_bounce\_amplitude and idle\_shiver\_amplitude) enabling generic components (GoblinPuppet.tsx) to express unique physical weights and temperaments.  
> * **The Explicit Null Protocol:** Missing or un-illustrated emotional variants are never omitted silently; they are declared explicitly as null. During animatic draft builds, the compositor safely falls back to base\_states.idle. For broadcast mastering, any missing variant without an approved production waiver halts the compilation pipeline.  
> * **Model Provenance Tracking (trained\_from\_lora):** Explicitly identifies the checkpoint in goblin-lora-training that produced the artwork, closing the audit loop between model iteration and production art.

### **4\. Emotion Bank Triage & the approved.json Lifecycle**

To avoid **generic emotional collapse** (where generative models produce identical sad-faced or angry expressions across different characters), facial variations are treated as structured, auditable assets.

\[ Batch Diffusion Generates 6 Takes \]  
                 │  
                 ▼  
\[ Triage / Vision Audit via repo-bot / Jules \]  
  1\. Inspect against character somatic conditions in goblin-bible  
  2\. Verify cross-character silhouette distinctness  
  3\. Validate color compliance against master\_palette.json  
                 │  
                 ▼  
\[ Commit approved.json in /emotion\_bank/{emotion}/ \]  
                 │  
                 ▼  
┌─────────────────────────────────────────────────────────────┐  
│                 AUTOMATED PROMOTION CASCADE                 │  
│  1\. Copy winning take \-\> variants/{character}\_{emotion}.png │  
│  2\. Compute SHA-256 binary hash                             │  
│  3\. Extract optical anchors \-\> update manifest.json         │  
│  4\. Update goblin-bible frontmatter to flip null to active  │  
└─────────────────────────────────────────────────────────────┘

#### **The Dual-Ledger Mapping**

> 1. **Upstream Lore Binding:** In goblin-bible/characters/bog.md, frontmatter maps mechanical states directly to the asset repo:  
>    emotion\_visual\_mapping:  
>      humiliated: "characters/bog/emotion\_bank/humiliated/approved.json"  
>      terrified: null

2\. **Downstream Resolution:** The build toolchain verifies that approved.json contains a valid approved\_take. If valid, the corresponding variant file is staged for compositing.

### **5\. Technical Constraints & Quality Gates**

Art committed to goblin-assets-visual must pass strict automated pre-flight checks:

> * **Power-of-Two Dimensions:** Standard puppet textures and plates must adhere to power-of-two dimensions (e.g., 512, 1024, 2048\) or exact target broadcast resolutions (1280×720, 1920×1080).  
> * **Palette Lock Enforcement:** All character art must comply with the 155-color master palette defined in palette/master\_palette.json. The palette\_check.py tool scans incoming PNGs, failing any asset introducing out-of-gamut tones.  
> * **Greenscreen Alpha Spill Thresholds:** For keyed plates generated against neon green (\#00FF00), a pre-flight edge pass scans the outer 3-pixel border of the alpha silhouette. If mean green intensity exceeds threshold limits (≥12), the plate is rejected for excessive color spill before handoff to compositing.

### **6\. Downstream Consumption & Packaging**

To maintain reproducible builds and prevent multi-gigabyte repository bloat, goblin-assets-visual interacts with downstream rendering targets through two specific mechanisms:

| Tool / Mechanism | Operating Location | Operational Role |
| :---- | :---- | :---- |
| **sync-assets.ts** | goblin-viewport-template | Clones or updates pinned release tags (latest-stable for daily builds, or semver tags like v1.4.0 for releases) via shallow clones (--depth 1\) directly into public/assets/visual/, bypassing Git submodule issues. |
| **collect-episode-assets.ts** | Per-Episode Compiler | Walks dialogue\_ast.json, identifies the exact 10–20 sprites, visemes, and backgrounds referenced in that script, and copies only those into goblin-episodes/epXXX/public/assets/. This reduces the asset footprint by \~90% and enforces the **\<100MB to 150MB episode storage ceiling**. |
| **The Zero-Byte Poison Trap** | Asset Harvester & CI | Calculates the SHA-256 hash of every staged file. Any file matching the empty-file signature (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855) immediately halts the pipeline to catch corrupted or truncated network pulls before rendering. |
| **Tree-Hash Staleness Verification** | Build Conductor | Compares tree hashes in compiled/bible-state.json against the Git tree SHAs of /characters/ to block compilation if visual assets fall out of sync with canon law. |

---

*User prompt: how does it handle multiple series or is there one series dedicated to each \[goblin-assests-visual\]*

Response: In the studio architecture, **there is one dedicated visual asset repository per series**; goblin-assets-visual is dedicated strictly to the floorboard goblin story world.

Rather than centralizing all visual assets across different shows into a single omnibus monorepo, each creative universe deploys an isolated, parallel repository stack under the **"Quintet" multi-repository topology**. For example, the Southern Gothic noir setting uses **wiregrass-assets** alongside wiregrass-lore, wiregrass-engine, and wiregrass-viewport, completely isolated from goblin-assets-visual.

### **1\. The "Quintet" Architecture Per Story World**

Every story world runs its own self-contained cluster of five core repositories, coordinated independently by its own meta-repo:

GOBLIN SERIES FLEET                       WIREGRASS SERIES FLEET  
├── goblin-bible / goblin-lore             ├── wiregrass-lore / wiregrass-bible  
├── worker-sower-engine                    ├── wiregrass-engine  
├── goblin-assets-visual                   ├── wiregrass-assets  
├── goblin-viewport-template               ├── wiregrass-viewport  
└── goblin-project (coordination)          └── wiregrass-project (coordination)

In this model, shared infrastructure (such as code formatters, base Zod schemas, and generator harnesses) is abstracted into upstream toolchains (like goblin-config or @studio/lore-compiler), while instance art and narrative data stay quarantined within their respective series repositories.

### **2\. Why Dedicated Visual Repositories Are Required**

Maintaining dedicated asset repositories per series resolves several operational and architectural bottlenecks:

> * **Git LFS Bandwidth & Disk Isolation:** Visual asset repositories store large binary payloads—full Preston Blair mouth-shape visemes, hundreds of emotional takes in /emotion\_bank/, raw PSD/AI files, and high-resolution environmental mattes. Combining multiple universes into one repository would force CI build workers and animators working on one show to clone gigabytes of unneeded visual data belonging to another.  
> * **Palette & Aesthetic Rule Enforcement:** goblin-assets-visual enforces narrative-specific constraints, such as the 155-color master palette (palette/master\_palette.json and palette\_lock.json) tailored to crawlspace goblins. A sci-fi or noir setting operates under completely different lighting, color models, and rendering pipelines (e.g., high-contrast monochrome or industrial solvent tones), making shared palette-checker scripts incompatible.  
> * **Anatomical & Namespace Collisions:** goblin-assets-visual structures its assets around specific character directories (/characters/bog, /characters/spleen) and specific location plates (/environments/warm\_pipe). Isolating repositories prevents character naming conflicts and keeps manifest.json schemas mapped 1:1 to their corresponding character files in goblin-bible.  
> * **Audit-Proof Provenance & Version Pinning:** In the series coordination lockfile (versions.json) and the baked episode build manifests (render\_manifest.json), visual assets are pinned to explicit semantic tags (e.g., goblin-assets-visual: v1.4.0). If assets were merged across series, an art update or tag bump for a character in Series B would trigger artificial version increments and dirty Git histories for Series A.

### **3\. Downstream Coordination Across Series**

When an episode is stamped and rendered, the toolchain resolves visual assets through its dedicated series stack:

> 1. **Targeted Ingestion:** Downstream compositors point to their specific series asset vault (e.g., sync-assets.ts clones goblin-assets-visual for goblin episodes, or wiregrass-assets for Wiregrass episodes).  
> 2. **Selective Asset Pruning:** The harvesting script (collect-episode-assets.ts) crawls the compiled scene AST (dialogue\_ast.json) and cherry-picks only the 10–20 active sprites and plates needed from that series' asset vault into goblin-episodes/epXXX/public/assets/, maintaining the \< 100MB per-episode ceiling.  
> 3. **Immutable Provenance Freeze:** The stamped render\_manifest.json logs the exact commit SHA of that specific universe's visual asset repository, ensuring reproducible builds years later without dependencies on other productions.

---

*User prompt: i want you to explore the aspects of this repository which will exist between all series concerning \[goblin-assets-visual\] ; tell me more about the original boilerplate*

Response: Across every story world in the generative production fleet—whether for the crawlspace goblins (goblin-assets-visual) or the Southern biopunk noir setting (wiregrass-assets)—visual asset repositories are never casual collections of image files. Every \*-assets-visual repository is built from a standardized boilerplate and functions as an immutable, strongly typed visual API serving downstream video compositors.

### **1\. Invariant Principles Shared Across All Series**

Regardless of narrative genre, visual style, or character rosters, all visual asset repositories enforce five universal boundaries:

> * **The Finished Renders vs. Training Boundary:** Visual asset repositories strictly contain production-approved, finished cutouts, mouth visemes, and matte plates. All messy, iterative, high-volume generative raw materials—such as diffusion training runs, thousands of image crops, RunPod serverless handler scripts, and checkpoint .safetensors—are quarantined into dedicated \*-lora-training (or \*-render-pipeline) repositories.  
> * **The Manifest as a Mathematical Contract:** Downstream compositors (like goblin-viewport-template or wiregrass-viewport) never traverse directories or parse filenames dynamically. Graphics are exposed through a standardized manifest.json coordinate API declaring anchor points, mouth envelopes, and camera focus targets.  
> * **Decoupled Lore Invariants:** Visual repositories never define character traits, inventory states, or injuries. The narrative legislature is owned by 001.\*-lore (or \*-bible), while the visual repository acts strictly as the sensory projection layer.  
> * **The Universal Causal Ledger (data/directive/day-XXX/):** Like all fleet repositories, every asset repository maintains an append-only shift history divided into Cloud (\*.jules.md), Local (\*.gravity.md), and Verification (\*.ag-test.md) directives to audit every architectural mutation and asset ingestion.  
> * **Deterministic Version Pinning:** Every asset repository is version-controlled via Git LFS and tagged with immutable semantic versions (e.g., v1.4.0), locked in the series meta-repo (versions.json) and baked into final episode builds (render\_manifest.json).

### **2\. The Original Boilerplate Skeleton**

When scaffolding a new visual asset repository from goblin-repo-template for any new series, the initial repository layout establishes the following baseline file tree:

\<series\>-assets-visual/  
├── .gitattributes                    \# Standard Git LFS binary pointer rules  
├── CHANGELOG.md                      \# Semantic release & asset iteration log  
├── ASSET\_GUIDE.md                    \# Canvas dimensions, naming rules, DPI & layer specs  
├── palette/  
│   ├── master\_palette.json           \# Series color truth (e.g., 155-color crawlspace gamut)  
│   └── palette\_check.py              \# Automated pre-flight gamut verification script  
├── data/  
│   ├── versions.json                  \# Pinned upstream toolchain and fleet lockfile  
│   └── directive/  
│       └── day-000/                   \# Canonical bootstrap & infrastructure seed  
│           ├── 001.bootstrap.jules.md  
│           ├── 002.lfs-wiring.gravity.md  
│           └── 003.palette-gate.ag-test.md  
├── shared/  
│   ├── shadow\_base.png               \# Common ground-contact shadow mattes  
│   └── particles/                    \# Vector/raster environmental dust & atmosphere  
├── ui/  
│   ├── speech\_bubble\_frame.svg       \# Dialogue balloons and UI framing vectors  
│   └── camera\_overlays/              \# Vignettes, film grain, and cinematic mattes  
├── environments/  
│   └── \<default\_location\>/  
│       ├── background.png            \# Master plate conformed to composition resolution  
│       ├── background\_active.png     \# State variant (e.g., high paranoia / alert)  
│       └── source/                   \# LFS-tracked working source files (.psd, .ai)  
└── characters/  
    └── \<archetype\_character\>/  
        ├── manifest.json             \# Strongly typed puppet rig contract  
        ├── palette\_lock.json         \# Character-specific palette compliance map  
        ├── base/  
        │   ├── \<char\>\_idle.png       \# Master neutral pose  
        │   └── \<char\>\_talking.png    \# Base pose for viseme overlay snaps  
        ├── mouths/                   \# Canonical Preston Blair mouth set  
        │   ├── mouth\_closed.png  
        │   ├── mouth\_small.png  
        │   ├── mouth\_medium.png  
        │   └── mouth\_wide.png  
        ├── variants/                 \# Promoted, approved emotional poses  
        ├── emotion\_bank/             \# Multi-take triage staging  
        │   └── \<sample\_emotion\>/  
        │       ├── take\_01.png  
        │       ├── take\_02.png  
        │       └── approved.json     \# Triage rationale, SHA-256 hash, winner selection  
        └── source/                   \# Original layered PSD/AI files

#### **Boilerplate Component Roles**

> * **.gitattributes:** Automatically tracks all binary images, project files, and vector assets (\*.png, \*.psd, \*.ai, \*.svg) via Git LFS, preventing multi-gigabyte bloat in the standard Git object database.  
> * **palette/:** Establishes the authoritative color space for the universe. The automated palette\_check.py script verifies that newly exported character sprites do not introduce stray or out-of-gamut pixels, ensuring aesthetic consistency across disparate diffusion models.  
> * **data/directive/day-000/:** The universal fleet contract for task execution. Day 0 establishes the repo bootstrap, Git LFS configuration, and negative-control test gates before any production art is committed.

### **3\. The Canonical manifest.json Contract**

Across all series, every character directory must provide a schema-validated manifest.json. This file translates raster graphics into machine-computable spatial coordinates consumed by Remotion compositing templates:

{  
  "\$schema": "../../schemas/manifest.schema.json",  
  "schema\_version": "2.1.0",  
  "character\_id": "char\_bog",  
  "render\_pipeline": "2d\_cutout",  
  "trained\_from\_lora": "runs/v2/bog\_v2.safetensors",  
  "canvas\_dimensions": { "width": 1024, "height": 1024 },  
  "base\_states": {  
    "idle": {  
      "file": "base/bog\_idle.png",  
      "sha256": "4a7b9c1d...",  
      "anchor\_point": { "x": 512, "y": 980 }  
    },  
    "talking": {  
      "file": "base/bog\_talking.png",  
      "sha256": "8e3f2a1b...",  
      "anchor\_point": { "x": 512, "y": 980 }  
    }  
  },  
  "condition\_variants": {  
    "humiliated": {  
      "file": "variants/bog\_humiliated.png",  
      "anchor\_point": { "x": 518, "y": 980 },  
      "camera\_anchor\_points": {  
        "crash\_zoom\_target": { "x": 412, "y": 198 },  
        "over\_the\_shoulder\_target": { "x": 480, "y": 320 }  
      },  
      "mouth\_bounding\_box": { "x": 380, "y": 240, "width": 64, "height": 32 },  
      "animation\_hints": {  
        "talk\_bounce\_amplitude": 8,  
        "idle\_shiver\_amplitude": 14  
      }  
    },  
    "terrified": null  
  },  
  "mouth\_shapes": {  
    "closed": "mouths/mouth\_closed.png",  
    "small": "mouths/mouth\_small.png",  
    "medium": "mouths/mouth\_medium.png",  
    "wide": "mouths/mouth\_wide.png"  
  },  
  "animation\_hints": {  
    "talk\_bounce\_amplitude": 12,  
    "idle\_shiver\_amplitude": 2  
  }  
}

#### **Universal Manifest Invariants**

> * **Coordinate Spaces & Anchor Points (anchor\_point):** Fixes the character's ground-contact pivot. The compiler projects this coordinate into the master scene canvas (1920×1080) to pin puppets to the floor plane and prevent floating.  
> * **Camera Zoom Targets (crash\_zoom\_target):** Normalizes the face or eye line of the puppet. Directorial push-ins calculated by Remotion camera wrappers calculate zoom trajectories around this point, preventing accidental decapitation of characters of different heights.  
> * **Preston Blair Mouth Bounding Box (mouth\_bounding\_box):** Defines the sub-pixel envelope where phoneme overlays (closed, small, medium, wide) snap over the base pose.  
> * **The Explicit Null Protocol:** Missing emotional expressions are explicitly declared as null rather than omitted. Compositors automatically fall back to base\_states.idle during animatic drafts, while production release gates catch missing assets without unhandled runtime crashes.

### **4\. Emotion Bank Triage & Promotion Standard (approved.json)**

To prevent generic emotional collapse across generative outputs, all visual repositories share an auditable triage staging directory (/emotion\_bank/):

> 1. **Candidate Generation:** Multiple candidate takes (take\_01.png, take\_02.png, etc.) are deposited into emotion\_bank/\<emotion\>/.  
> 2. **Audit & Approval:** The review pass creates an approved.json declaring the selected take, its SHA-256 hash, and the reasons for rejecting alternative takes.  
> 3. **Promotion Cascade:** The winning take is promoted to variants/\<character\>\_\<emotion\>.png, its coordinates are recorded in manifest.json, and the upstream lore dossier frontmatter flips that emotion from null to active.

### **5\. Standard Downstream Ingestion & Build Guards**

Visual repositories interface with downstream code generators through a pair of universal scripts, guarded by strict tripwires:

> * **sync-assets.ts (Shallow Ingestion):** Pulls or clones pinned release tags (e.g., latest-stable or v1.4.0) via shallow git clones (--depth 1\) directly into the viewport's public/assets/visual/, bypassing Git submodule friction.  
> * **collect-episode-assets.ts (Storage Envelope Enforcement):** Rather than copying the multi-gigabyte master asset library into each episode, this script crawls the compiled dialogue\_ast.json, harvests only the 10–20 active sprites, mouth visemes, and backgrounds referenced in that episode, and stages them locally. This reduces the asset footprint by \~90%, maintaining the mandatory \<100MB episode storage ceiling.  
> * **The Zero-Byte Poison Sentinel:** Harvesters and CI audit suites compute the SHA-256 hash of every staged asset. If any file matches the empty-hash signature:  
>   SHA-256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>   the build terminates immediately with exit code 1, preventing corrupted or truncated network downloads from reaching headless Chromium renderers.

---

*User prompt: ok for here on out lets call this \[series-assets-visual\] so that its a little more dynamic*

Response: Adopting **\[series-assets-visual\]** establishes a series-agnostic standard across the production fleet, treating visual repositories across every story world as strongly typed, content-addressed visual APIs.

### **1\. Architectural Scope & Repository Isolation**

> * **Finished Assets vs. Generative Training:** The repository houses only production-approved character cutouts, Preston Blair mouth visemes, and background plates tracked via Git LFS, isolating raw LoRA checkpoints, reference images, and GPU handler code in \[series-lora-training\].  
> * **Sensory Projection Layer:** The repository acts purely as a read-only sensory projection of upstream narrative law defined in \[series-lore\] or \[series-bible\], preventing downstream media layers from altering canonical world state.

### **2\. The Typed Visual Contract (manifest.json)**

> * **Spatial Invariants:** Converts raw raster graphics into a machine-computable coordinate system, declaring ground-contact pivots (anchor\_point), facial framing targets (crash\_zoom\_target), and viseme bounding boxes (mouth\_bounding\_box).  
> * **Dynamic Motion Physics:** Supplies per-character animation scalars (animation\_hints for bounce and shiver amplitudes) that parameterize generic presentation rigs in \[series-viewport-template\] without bespoke code.  
> * **Explicit Null Protocol:** Declares un-illustrated variants as "variant": null to enable safe draft fallbacks to base\_states.idle while enforcing an automated fail-loud gate before final broadcast mastering.

### **3\. Emotion Triage & The Rejection Ledger**

> * **Mitigating Emotional Collapse:** Evaluates multi-candidate takes (take\_01.png–take\_06.png) in emotion\_bank/ against written character condition specs to prevent diffusion models from defaulting to generic emotional means.  
> * **The Rejection Audit:** Preserves rejected candidates in approved.json alongside structured rejection classes (SEMANTIC\_FAILURE, DISTINCTNESS\_COLLISION, PHYSICAL\_DEFECT) to prevent sampling flawed latent regions in future runs.  
> * **Authenticated Promotion:** Replaces arbitrary author strings with GitHub pull request reviews under branch protection, atomically promoting approved takes to variants/ and sealing their SHA-256 hashes.

### **4\. Downstream Ingestion & Storage Ceilings**

> * **Shallow Tagged Synchronization (sync-assets.ts):** Ingests pinned semver releases (v1.4.0) or stable tags into compositors via shallow Git clones (--depth 1), bypassing Git submodule overhead.  
> * **AST Envelope Pruning (collect-episode-assets.ts):** Parses dialogue\_ast.json prior to rendering to stage only the 10–20 active sprites and plates needed, enforcing the strict \< 100MB to 150MB per-episode storage ceiling.  
> * **Zero-Byte Integrity Trap:** Calculates the SHA-256 digest of every staged binary, aborting compilation immediately if any asset matches the empty-file hash constant (e3b0c442...) to catch truncated network transfers.

Would you like to draft the baseline manifest.schema.json to enforce these spatial anchors and null protocols across all your series asset repositories?

---

*User prompt: {{FOCUS: 1\. Architectural Scope & Repository Isolation}} /extreme-details*

Response: The architectural scope and isolation boundaries of **\[series-assets-visual\]** define it as a deterministic, content-addressed sensory vault within the multi-repository studio fleet. Positioned strictly within **Cluster 04.assets (The Source Art Vault)**, the repository serves as the single source of visual truth for production-approved renders, modular cutouts, Preston Blair mouth visemes, and painted matte plates. It functions as a strongly typed, read-only visual API for downstream compositing engines while remaining rigorously decoupled from narrative state, generative training loops, and compute execution.

### **1\. The Sovereign Ontological Boundary: Meaning (Axis A) vs. Representation (Axis B)**

The studio operates on the fundamental thesis of the **Sovereign Separation of Meaning and Projection**. The universe is split across two orthogonal axes of production:

               THE SOVEREIGN SEPARATION OF MEANING AND PROJECTION  
                 
    AXIS A: SEMANTIC TRUTH & LAW                    AXIS B: UNTRUSTED PROJECTION  
 ┌──────────────────────────────────────┐          ┌─────────────────────────────┐  
 │ 001.\[series\]-lore (Canon Repository) │          │ worker-sower-engine         │  
 │ • Markdown dossiers & Zod schemas    │          │ • Conductor (produceEpisode)│  
 │ • Flat table of narrative facts      │ ───────► │ • LLM dialogue generation   │  
 │ • scripts/compile.ts \-\> bible-state  │          │ • ComfyUI / Wan 2.2 / Flux  │  
 │ • ZERO runtime LLMs in state path    │          │ • Remotion video projection │  
 └──────────────────────────────────────┘          └─────────────────────────────┘

#### **The Deletion Principle Boundary**

The foundation of system integrity is that if all generative neural networks, prompt histories, and checkpoint weights are deleted, the narrative universe remains completely reconstructible, referentially consistent, and logically intact within its relational ledger (CANON\_DB / Cloudflare D1).

However, visual media assets cross the **Archive-Dependent Boundary**:

> * **The Narrative Ledger (Model-Independent Reality):** Canonical world rules, entity dossiers, somatic trauma vectors, spatial coordinates, and paranoia meters live entirely independent of AI generation. This state is mathematically reconstructible via pure state reduction: State*N*​\=fold(apply,State0​,\[*E*1​,*E*2​,…,*EN*​\]).  
> * **The Media Archive (Archive-Dependent Artifacts):** Renders, diffusion plates, and cutouts cannot be deterministically re-synthesized bit-for-bit from mathematical seeds alone due to non-deterministic CUDA kernel execution, GPU driver updates, and floating-point rounding variances across hardware. Generated visual media is therefore treated as irreplaceable historical evidence that must be sealed in content-addressed storage (CAS) rather than dynamically recalculated.

#### **Unidirectional Information Flow & Edit Partitioning**

Information flows strictly one-way through the pipeline: World⟶Plan⟶Expression⟶Timing⟶Presentation⟶Archive. Downstream media projections never mutate narrative state. This establishes an unyielding boundary for human and machine edits:

> * **Representation Edits (Safe & Local):** Adjusting camera easing curves, visual crop margins, framing targets, or color grading lookup tables (LUTs) remains strictly local to the presentation source code (e.g., Episode\_XXX.tsx in \[series-episodes\]) or coordinate manifests in \[series-assets-visual\]. These modifications possess zero narrative authority and cannot mutate canonical facts.  
> * **Meaning Edits (Ledger-Bound):** Any alteration to story reality—such as changing an injury state, altering character inventory, or re-weighting dramatic tension—is forbidden from being injected into the visual asset or compositing layers. Meaning edits must be routed upstream to \[series-lore\] and worker-sower-engine, triggering a formal re-compilation of the Dialogue AST and exposure sheets.

#### **Spatial Engine Decoupling**

To protect this boundary, the upstream geometric and pathfinding engine (\[series\]-spatial) is strictly isolated from presentation details. The spatial engine is structurally forbidden from possessing knowledge of Remotion, pixel coordinates, camera focal lengths, CSS layouts, or viseme timings. It calculates pure axial integer math (*q*,*r*,*s*), topological adjacency, and acoustic occlusion; it does not know what a character sprite looks like or where its bounding box rests on an *XY* raster canvas.

### **2\. Physical & Conceptual Isolation from Generative Training (\[series-lora-training\])**

A fundamental failure mode of generative production pipelines is treating training raw materials and production deliverables as a single undifferentiated file dump. The studio architecture strictly splits these operational concerns into two distinct repositories:

┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐  
│      \[series-lora-training\]            │       │        \[series-assets-visual\]          │  
│   (Cluster 03.foundry: Heavy Compute)  │       │    (Cluster 04.assets: Vault)          │  
├────────────────────────────────────────┤       ├────────────────────────────────────────┤  
│ • Raw concept art & 3D turnaround rips │       │ • Production-approved 2D cutouts       │  
│ • Unfiltered /references/raw/ buffers  │       │ • Canonical idle & talking baselines   │  
│ • Curated multi-res training sets      │       │ • Preston Blair mouth visemes (A-H)    │  
│ • /references/rejected/ failure logs   │  ───► │ • Promoted condition variants          │  
│ • RunPod serverless handlers           │       │ • Master matte environmental plates    │  
│ • Model weights (.safetensors)         │       │ • Strongly typed manifest.json APIs    │  
│ • ComfyUI green-screen API graphs      │       │ • 155-color master\_palette.json        │  
└────────────────────────────────────────┘       └────────────────────────────────────────┘

#### **The Finished Renders vs. Iterative Process Boundary**

> * **\[series-assets-visual\] holds only finished, approved outputs:** It is consumed directly by the viewport compiler (\[series-viewport-template\]) and episode builders (\[series-episodes\]). It must remain lightweight, deterministic, and free of speculative artifacts.  
> * **\[series-lora-training\] (or \[series-render-pipeline\]) holds the process:** It contains the messy, high-volume raw materials: hundreds of uncropped source images, multi-pass training configurations, RunPod serverless handler scripts (handler.py), Docker build recipes, PyTorch training harnesses, and gigabytes of intermediate .safetensors model weights. Downstream compositing workers never touch this repository.

#### **The Tri-Stage Reference State Machine**

Within the training boundary, dataset curation is isolated from the asset vault through a strict state machine:

> 1. **/references/raw/:** The unfiltered ingestion buffer containing concept art exports, artist turnaround sheets, and 3D viewport screengrabs. Every image requires an entry in source\_log.json detailing model seeds, base checkpoint versions, or licensing provenance to ensure clearance.  
> 2. **/references/curated/:** The verified training ground truth, cropped across multi-resolution buckets (512, 768, 1024), verified against the 155-color palette, and bound to structured caption tokens following the **Invariance Captioning Rule** (permanent anatomy bound to trigger tokens, wardrobe/lighting described in captions to allow inference swappability).  
> 3. **/references/rejected/:** Excluded candidates are preserved in rejected\_log.json with explicit failure classifications (SEMANTIC\_FAILURE, DISTINCTNESS\_COLLISION, PHYSICAL\_DEFECT). They are never permanently deleted; they serve as negative reference points to counter Model Autophagy Disorder (MAD) and prevent re-evaluating known-bad latent regions.  
> 4. **Anti-Autophagy Governance:** Datasets must clear a strict 60/40 anchor ratio (minimum 60% human drawings or 3D viewport renders; maximum 40% synthetic diffusion generations) before GPU training compute is scheduled.

\[series-assets-visual\] never sees the raw or rejected references; it receives only the promoted, keyed, and notarized final output frames via Git pull request once artistic certification is stamped.

### **3\. Pod Governance & The Division of Sovereignty**

The contents and lifecycle of \[series-assets-visual\] are governed by strict inter-pod boundaries and operational handoffs across the studio organization:

┌────────────────────────────────────────────────────────────────────────┐  
│                   SEPARATION OF CERTIFICATION GATES                    │  
├────────────────────────────────────────────────────────────────────────┤  
│ POD-07 (Foundation Pod / Asset Forge): Artistic Certification          │  
│ • Owns visual language, palette definitions, and lighting rules        │  
│ • Signs off on character likeness, silhouette, and emotional range     │  
│ • Authority to publish versioned assets to \[series-assets-visual\]       │  
├────────────────────────────────────────────────────────────────────────┤  
│ POD-06 (Data Ops & Model Lifecycle): Technical Reproducibility         │  
│ • Acts as technical firewall for models, nodes, and toolchains         │  
│ • Freezes container digests, PyTorch/CUDA environments, and seeds      │  
│ • Enforces bit-identical or variance-bounded Golden Baseline execution │  
├────────────────────────────────────────────────────────────────────────┤  
│ POD-01 (Legal, Provenance & Clearance): Legal Certification            │  
│ • Audits training data lineage and copyright compliance                │  
│ • Tracks C2PA metadata injection and clearances                        │  
├────────────────────────────────────────────────────────────────────────┤  
│ POD-15 (Scene Pods / Downstream Viewports): Execution Consumers        │  
│ • Strictly forbidden from training local LoRAs or modifying assets     │  
│ • Bound to timecodes, locked manifests, and immutable registry tags    │  
└────────────────────────────────────────────────────────────────────────┘

> * **POD-07 (Foundation Pod / The Asset Forge):** Led by the Style/Art Director, this pod holds sole sign-off authority on whether an asset is visually complete. They establish the visual language (e.g., locking a biopunk-noir aesthetic or crawlspace lighting), enforce the master color palette, and maintain lookbooks. ML/Training Engineers operate the training pipelines under POD-07's direction but cannot unilaterally publish an asset to the production registry.  
> * **POD-06 (Data Ops & Model Lifecycle):** Acts as the studio's technical firewall. While POD-07 validates *artistic intent* ("Does Bog look like Bog across camera angles?"), POD-06 certifies *technical reproducibility* ("Does this asset and environment run deterministically without memory leaks or drift?"). POD-06 freezes Docker images and dependency manifests before an asset is cleared for production release.  
> * **POD-01 (Legal, Provenance & Clearance):** Imposes a hard boundary: no asset trained on unverified or non-permissive third-party material can be committed to \[series-assets-visual\]. POD-01 audits the provenance chain (source\_log.json) and requires C2PA tamper-evident manifests for all published models and master plates.  
> * **POD-15 (Scene Pods) & Downstream Viewports:** Strictly forbidden from creating local asset variants, retraining LoRAs, or tweaking character sprites locally. Scene Pods must consume exclusively the locked, published assets in \[series-assets-visual\] to prevent mid-season visual drift.

### **4\. Technical Architecture, Storage Tiers, & Binary Maintenance**

Because visual art assets consist of high-resolution raster files, layered design documents, and vector definitions, \[series-assets-visual\] implements a hybrid Git LFS and Content-Addressed Storage architecture.

#### **Git LFS Binary Tracking Rules**

To prevent catastrophic object database bloating in standard Git, .gitattributes tracks all binary and source graphics formats through Git LFS:

\*.png filter=lfs diff=lfs merge=lfs \-text  
\*.psd filter=lfs diff=lfs merge=lfs \-text  
\*.ai filter=lfs diff=lfs merge=lfs \-text  
\*.svg filter=lfs diff=lfs merge=lfs \-text  
\*.webp filter=lfs diff=lfs merge=lfs \-text

#### **Dual-Tier Storage Topology (Git LFS vs. Content-Addressed R2)**

The pipeline distinguishes between *authoring repositories* and *unreproducible media archives*:

> 1. **Git LFS (\[series-assets-visual\]):** Maintains the human-navigable, directory-structured asset trees, design manifests, layered master PSDs, and versioned release tags (v1.4.0).  
> 2. **Permanent Content-Addressed Storage (Cloudflare R2):** Stores diffusion-generated plates, rendered intermediate frames, and neural outputs keyed strictly by their SHA-256 binary hash. Because Cloudflare R2 has zero egress fees, serverless rendering nodes can rapidly saturate high-bandwidth connections pulling assets during batch rendering without financial penalty.

#### **3-2-1 Preservation & The Rolling Range Cursor Scrubber**

Because generated visual media is archive-dependent and non-reproducible across driver updates, the physical storage infrastructure enforces strict preservation policies:

> * **3 Copies:** Working NVMe cache on rendering nodes, warm content-addressed object storage in Cloudflare R2, and cold immutable replicas in AWS Glacier or Backblaze B2 with object locking enabled.  
> * **2 Media Types:** High-speed NVMe flash filesystems and remote cloud object stores.  
> * **1 Geographically Isolated Offsite Replica:** Protected by object-lock write-once-read-many (WORM) policies.  
> * **The Rolling Range Cursor Scrubber:** Simple random sampling (e.g., verifying 5% of assets at random with replacement) is mathematically flawed—due to the *e*−1 limit, it leaves approximately 36.8% of assets unchecked over a 20-week cycle. Instead, a background scrubber uses a deterministic, hash-ordered cursor that sweeps through 100% of archived objects every 30 days, re-computing SHA-256 digests against their provenance manifests to eliminate silent bit rot.  
> * **Quarterly Cold-Restore Drills:** On the 15th of every month, an automated test runner restores an entire past episode from raw R2 bytes into an isolated environment, compiles the Remotion composition, and confirms that output frame hashes match the original broadcast manifest.

### **5\. Downstream Ingestion Boundaries & Storage Ceilings**

\[series-assets-visual\] interacts with downstream rendering targets (\[series-viewport-template\] and \[series-episodes\]) through strict procedural controls designed to protect bandwidth and execution stability:

#### **The AST Asset Harvester (collect-episode-assets.ts)**

A full series visual library contains hundreds of character emotional variations, layered source PSDs, and high-resolution background plates, easily exceeding tens of gigabytes. Stamping an entire library into an individual episode repository would break CI/CD pipelines.

During the compilation of an episode, scripts/collect-episode-assets.ts executes an AST dependency crawl against dialogue\_ast.json:

// scripts/collect-episode-assets.ts AST dependency harvest logic  
function collectRequiredAssets(episodeScene: CompiledScene): AssetReference\[\] {  
  const required \= new Set\<string\>();

  for (const round of episodeScene.rounds) {  
    if (round.speaker) {  
      const manifest \= loadCharacterManifest(round.speaker);  
      // Resolves exact emotion variant declared in dialogue AST  
      const spriteFile \= resolveSprite(manifest, round.emotion, round.facing);  
      required.add(spriteFile);

      // Resolves only mouth visemes referenced in phoneme cue stream  
      for (const cue of round.mouthCues) {  
        required.add(manifest.mouth\_shapes\[cue.value\]);  
      }  
    }  
  }

  // Harvests only the specific background matte plate declared in the scene  
  required.add(loadLocationManifest(episodeScene.location).background);

  return Array.from(required).map((file) \=\> ({  
    file,  
    sourceRepo: "\[series\]-assets-visual",  
    sourceCommit: getCurrentCommit("\[series\]-assets-visual"),  
  }));  
}

> * **Storage Envelope Enforcement:** By cherry-picking only the 10–20 active sprites, Preston Blair visemes, and matte plates required for that specific script, the asset footprint is reduced by \~90%.  
> * **The Performance Ceiling:** The pipeline enforces a strict rule: total asset directory size per episode workspace must be \<100MB (with a hard non-negotiable ceiling of 150MB). Any regression of this quota fails the build immediately, preventing accidental ingestion of unpruned emotion banks.

#### **The Zero-Byte Poison Trap**

During the harvesting and staging phase, harvesters compute the SHA-256 hash of every staged file. If any staged file matches the empty-string SHA-256 digest:

SHA-256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

the compiler immediately halts execution with exit code 1\. This hard gate catches truncated network pulls or unhydrated Git LFS pointer files before they can reach headless Chromium renderers, preventing silent render crashes.

#### **Tree-Hash Staleness Verification**

Before handoff to compositing, the conductor reads the Git tree hashes recorded in compiled/bible-state.json and compares them against the Git tree SHAs of the /characters/ directory in \[series-assets-visual\]. If the hashes diverge, the visual state is flagged as stale, halting compilation until npm run compile synchronizes visual assets with current canon law.

### **6\. The Universal Causal Ledger (data/directive/day-XXX/)**

In alignment with fleet-wide engineering standards across all repositories (000.repo-bot, 001.\[series\]-lore, 002.worker-sower, \[series-viewport-template\]), \[series-assets-visual\] maintains its internal architectural history within a root-level data/directive/ directory.

\[series\]-assets-visual/data/directive/day-XXX/  
├── \<seq\>.\<name\>.jules.md     ──► Cloud-Native Ingestions (Google Jules Agent / CI)  
├── \<seq\>.\<name\>.gravity.md   ──► Local-Space Ingestions (Antigravity IDE / Workstations)  
└── \<seq\>.\<name\>.ag-test.md   ──► Adversarial Verification Gates (Negative-Control Tests)

> * **Immutable Historical Causality:** Directives inside day-XXX are never treated as a dynamic backlog or to-do list. They serve as an immutable, append-only architectural event ledger recording state mutations, asset ingestion rationales, and interface freezes.  
> * **The Precedent Precedence Rule:** If a higher-numbered day directive (e.g., day-004) refactors an anchor coordinate schema or palette specification introduced in an earlier day (e.g., day-001), the higher-numbered day represents the authoritative law of the repository.  
> * **Universal Flattener Parsing:** Autonomous agents and review tools inspect the data/directive/ tree in descending order, building a contextual timeline of architectural decisions before performing pull request reviews or asset merges.

### **7\. Forensic Provenance & Errata Isolation**

Every promoted asset in \[series-assets-visual\] is designed to bind into the Directed Acyclic Graph (DAG) that roots the terminal episode lockfile (render\_manifest.json):

Build ID=H(Canon Root+Dialogue AST+Exposure Sheet+Asset Hashes+Container Digest+Toolchains)  
{  
  "build\_id": "sha256:4f8a1209bc87e5d23456789abcdef0123456789abcdef0123456789abcdef01",  
  "episode\_id": "EP040",  
  "schema\_version": "3.0.0",  
  "parents": {  
    "canon\_tree\_sha": "git:9c3e401",  
    "assets\_visual\_tree\_sha": "git:v1.4.0",  
    "viewport\_template\_sha": "git:4f8a120",  
    "dialogue\_ast\_hash": "sha256:12c8a994ef7b8c9d0e1f..."  
  },  
  "visual\_sprites\_used": {  
    "bog\_humiliated.png": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",  
    "spleen\_defensive.png": "sha256:a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4"  
  }  
}

#### **The Errata & Retcon Protocol**

When an error or visual inconsistency is discovered in an asset that has already been rendered into published episodes:

> 1. **Immutability of Historical Media:** Existing media files, sprite releases, and manifest sidecars are **never deleted or overwritten in place**. Updating assets in place destroys content addressing and invalidates cryptographic verification across the fleet archive.  
> 2. **Canon Errata Records:** Upstream canon dossiers in \[series\]-lore are corrected via Git commit, generating a new canonical root hash (*H*root​), and an ErrataRecord is appended to lore/errata.json.  
> 3. **Forward Blast Radius Traversal:** The build orchestrator runs a DAG sweep, identifying every downstream scene dependent on the altered asset and flagging it as dirty (is\_dirty \= 1).  
> 4. **The Showrunner Re-Anchoring Gate:** The showrunner decides whether to freeze legacy history (leaving the existing broadcast episode preserved in cold storage) or authorize a remaster. If remastered, a distinct asset tag and content-addressed render (e.g., EP040\_remaster\_v2.mp4) are generated under the revised commit hash, preserving both the historical record and the revised release.  
> 5. **C2PA Cryptographic Injection:** Provenance manifests are injected directly into final media containers as C2PA tamper-evident metadata, establishing an unbroken, legally defensible chain of custody from original concept art approval in \[series-assets-visual\] down to broadcast pixels.

---

*User prompt: {{FOCUS: 2\. The Typed Visual Contract (manifest.json)}} /extreme-details*

Response: In \[series-assets-visual\], **manifest.json** is not passive metadata; it is the **strongly typed, version-controlled public API** and database of physical invariants for 2D character assets. Downstream compositing engines (such as Remotion in \[series-viewport-template\]) never perform dynamic filesystem discovery, glob directories, or guess image filenames at runtime. Instead, they consume manifest.json as an immutable mathematical contract that maps raw raster pixels into a deterministic coordinate system.

### **1\. The Authoritative Schema Specification**

Every character directory within \[series-assets-visual\]/characters/{character\_id}/ must expose an authoritative manifest.json validated against manifest.schema.json:

{  
  "\$schema": "https://studio.internal/schemas/sprite\_manifest.v2.json",  
  "schema\_version": "2.1.0",  
  "character\_id": "char\_bog",  
  "render\_pipeline": "2d\_cutout",  
  "trained\_from\_lora": "training\_runs/v2/bog\_lora\_v2.safetensors",  
  "canvas\_dimensions": { "width": 1024, "height": 1024 },  
  "base\_states": {  
    "idle": {  
      "file": "base/bog\_idle.png",  
      "sha256": "4a7b9c1d8e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b",  
      "anchor\_point": { "x": 512, "y": 980 }  
    },  
    "talking": {  
      "file": "base/bog\_talking.png",  
      "sha256": "8e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b4a7b9c1d",  
      "anchor\_point": { "x": 512, "y": 980 }  
    }  
  },  
  "condition\_variants": {  
    "humiliated": {  
      "file": "variants/bog\_humiliated.png",  
      "anchor\_point": { "x": 518, "y": 980 },  
      "camera\_anchor\_points": {  
        "crash\_zoom\_target": { "x": 412, "y": 198 },  
        "over\_the\_shoulder\_target": { "x": 480, "y": 320 }  
      },  
      "mouth\_bounding\_box": {  
        "x": 380,  
        "y": 240,  
        "width": 64,  
        "height": 32  
      },  
      "animation\_hints": {  
        "talk\_bounce\_amplitude": 8,  
        "idle\_shiver\_amplitude": 14  
      }  
    },  
    "smug": {  
      "file": "variants/bog\_smug.png",  
      "anchor\_point": { "x": 512, "y": 980 },  
      "camera\_anchor\_points": {  
        "crash\_zoom\_target": { "x": 530, "y": 185 }  
      },  
      "mouth\_bounding\_box": {  
        "x": 490,  
        "y": 225,  
        "width": 58,  
        "height": 28  
      },  
      "animation\_hints": {  
        "talk\_bounce\_amplitude": 4,  
        "idle\_shiver\_amplitude": 0  
      }  
    },  
    "terrified": null  
  },  
  "mouth\_shapes": {  
    "closed": "mouths/mouth\_closed.png",  
    "small": "mouths/mouth\_small.png",  
    "medium": "mouths/mouth\_medium.png",  
    "wide": "mouths/mouth\_wide.png"  
  },  
  "animation\_hints": {  
    "talk\_bounce\_amplitude": 12,  
    "idle\_shiver\_amplitude": 2  
  }  
}

#### **Field-by-Field Architectural Responsibilities**

> * **canvas\_dimensions:** Establishes the authoritative coordinate bounding space (authoring standard is 1024×1024 pixels). Every spatial vector inside the manifest is defined relative to this internal resolution.  
> * **render\_pipeline & trained\_from\_lora:** Documents model provenance, binding the visual assets to the exact checkpoint in \[series-lora-training\] that synthesized the character bases.  
> * **base\_states:** The minimum viable character baseline required for animatic compilation (idle and talking).  
> * **condition\_variants:** Emotional and somatic states defined upstream in the series bible (e.g., humiliated, smug). In multi-directional rigs, variants can expand across a directional axis (N, NE, SE, S, SW, NW).  
> * **mouth\_shapes:** Canonical Preston Blair phoneme visemes (closed, small, medium, wide or the extended A–H set) snapped over speech frames.

### **2\. Spatial Invariants & Coordinate Mathematics**

Rendering engines require explicit geometric bounds to calculate transforms dynamically without hardcoded offsets in React/Remotion JSX components.

                  COORDINATE PROJECTION TRANSFORMATION  
                    
  Sprite Canvas (1024 x 1024\)                 Master Canvas (1920 x 1080\)  
┌─────────────────────────────┐             ┌─────────────────────────────────────┐  
│ (0,0)                       │             │ (0,0)                               │  
│                             │             │                                     │  
│      • crash\_zoom\_target    │             │         Stage Translation           │  
│        (x: 412, y: 198\)     │             │         (puppet.x, puppet.y)        │  
│                             │    Scale    │                ▼                    │  
│                             │ ──────────► │               ┌──────────┐          │  
│                             │   Factor    │               │  Puppet  │          │  
│                             │    (s)      │               │  • Target│          │  
│      • anchor\_point         │             │               └──────────┘          │  
│        (x: 512, y: 980\)     │             │ ─────────────────────────────────── │  
└─────────────────────────────┘             │ Floor Plane (Y\_ground)              │  
                                            └─────────────────────────────────────┘

#### **A. Ground Contact Pivot (anchor\_point)**

> * **Geometric Function:** Defines the coordinate pair (*Ax*​,*Ay*​) marking the lowest central baseline of foot contact.  
> * **Stage Horizon Alignment:** To lock the puppet rig to the background environment floor plane (*Y*ground​) and prevent sliding or floating during camera tracking, the compositor calculates the stage translation:  
>   TranslateX=*X*stage​−*Ax*​,TranslateY=*Y*ground​−*Ay*​  
> * **Dynamic Shadow Rigging:** The contact shadow engine anchors directly to this coordinate. Remotion renders an elliptical radial gradient positioned at (*X*anchor​,*Y*anchor​):  
>   \<div  
>     style={{  
>       position: "absolute",  
>       left: anchorPoint.x \- 75,  
>       top: anchorPoint.y \- 15,  
>       width: 150,  
>       height: 30,  
>       borderRadius: "50%",  
>       background: "radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 75%)",  
>       transform: \`scale(\${interpolate(frame, \[0, 60\], \[1.0, 1.04\], { extrapolateRight: "clamp" })})\`,  
>       mixBlendMode: "multiply",  
>     }}  
>   /\>

When speech recoil occurs, the shadow dynamically contracts in scale and drops in opacity (0.65→0.40), imparting physical weight.

#### **B. Camera Facial Centroid (camera\_anchor\_points.crash\_zoom\_target)**

> * **Geometric Function:** Defines the coordinate target centered on the facial centroid, bridge of the nose, or eye line.  
> * **Local Transform Inversion:** For close-ups within local sprite containers, coordinates invert directly into CSS percentages:  
>   OriginXlocal​\=(canvas.widthcrash\_zoom\_target.x​)×100%=(1024412​)×100%=40.23%  
>   OriginYlocal​\=(canvas.heightcrash\_zoom\_target.y​)×100%=(1024198​)×100%=19.33%  
> * **Global Master Canvas Inversion (Decapitation Prevention):** Naively applying local percentages to a 1920×1080 scene container causes crash zooms to center on empty space or decapitate characters. The timeline compiler projects the local coordinate through stage position and active scale factor (*s*):  
>   OriginXglobal​\=(canvas.widthpuppet.x+(crash\_zoom\_target.x×*s*)​)×100%  
>   OriginYglobal​\=(canvas.heightpuppet.y+(crash\_zoom\_target.y×*s*)​)×100%  
> * **Multi-Character Invariance:** Tall characters (e.g., Wart) and hunched characters (e.g., Spleen) share identical Remotion camera directives; the engine dynamically queries each character's crash\_zoom\_target, centering dramatic pushes without hardcoded branches.

#### **C. Modular Mouth Viseme Envelopes (mouth\_bounding\_box)**

> * **Geometric Function:** Defines the sub-pixel bounding box \[*x*,*y*,*w*,*h*\] locating the mouth slit on the underlying expression sprite.  
> * **Decoupled Lip-Sync:** Snaps Preston Blair visemes (mouth\_closed.png, mouth\_small.png, etc.) over static emotional poses frame-by-frame based on audio cues, eliminating the need to redraw complete talking cycles for every emotional variant.

### **3\. Kinetic Physics Parameterization (animation\_hints)**

To prevent the **"mechanical metronome defect"** (where every 2D puppet bobs and gestures with identical, rigid sine-wave curves), animation\_hints allows artists to encode physical mass and emotional temperament into numeric parameters consumed by GoblinPuppet.tsx:

> * **talk\_bounce\_amplitude (Mass & Dominance):** Scales vertical pixel displacement during speech:  
>   Δ*y*\=sin(frame×*ω*)×talk\_bounce\_amplitude  
>   authoritative, massive characters receive lower amplitudes (e.g., Wart \= 4\) for a grounded posture, while manic characters receive higher values (e.g., Spleen \= 20\) for erratic movement.  
> * **idle\_shiver\_amplitude (Somatic State Injection):** Drives per-frame high-frequency pseudo-random jitter:  
>   Δ*x*jitter​\=noise(frame)×idle\_shiver\_amplitude  
>   When a character acquires the terrified condition or suffers from industrial dust neuropathy, idle\_shiver\_amplitude scales up to 14, imparting high-frequency trembling without distinct per-frame sprite sequences.

### **4\. The Explicit Null Protocol & State Taxonomy**

In production, script writing frequently outpaces visual asset completion. The contract handles missing artwork through an **Explicit Null Pattern**:

                        DIALOGUE TAG: emotion: "terrified"  
                                         │  
                                         ▼  
                     \[ Ingest bog/manifest.json \]  
                                         │  
                 Is condition\_variants.terrified defined?  
                                         │  
                         ┌───────────────┴───────────────┐  
                         ▼ YES                           ▼ NULL / UNDEFINED  
               \[ Load Target Sprite \]         \[ FALLBACK PROTOCOL FIRES \]  
             bog\_terrified\_take\_03.png        1\. Log non-blocking compiler WARN  
                                              2\. Fall back to base\_states.idle.file  
                                              3\. Inherit base\_states.idle.anchor\_point  
                                              4\. Pipeline renders without crashing

#### **The Formal Lifecycle State Taxonomy**

Collapsing un-rendered assets into a generic "missing" category introduces ambiguity. The contract distinguishes between nine formal states:

> * UNKNOWN: Unregistered in narrative bible or schema.  
> * EXPECTED: Scripted in narrative AST; production ticket open.  
> * MISSING: Declared active in manifest but file missing on disk (fatal file defect).  
> * INTENTIONALLY\_ABSENT (null): Formally acknowledged production gap.  
> * INVALID: Binary fails CV geometry, alpha, or palette tests.  
> * VALID: Passed all deterministic validation gates.  
> * WAIVED: Explicit signed exemption attached for broadcast mastering.  
> * LOCKED: Protected by showrunner Eject Button; immutable to automatic regeneration.  
> * SUPERSEDED: Replaced by remaster or newer take; preserved for historical hash trees.

#### **Dual-Phase Enforcement**

> 1. **Draft / Animatic Phase:** If a line requests "terrified" and manifest.json specifies "terrified": null, the compiler emits a non-fatal warning, falls back to base\_states.idle.file, and uses base anchor coordinates.  
> 2. **Broadcast Release Gate:** Mastering builds enforce zero tolerance:  
>    ∀shot∈Episode,referenced\_variant(shot)=null  
>    Compilation halts with exit code 1 if an active shot references a null variant, unless an authorized sign-off waiver is committed to applied\_waivers in render\_manifest.json.

### **5\. Autonomous Optical Extraction Loop & CV Gauntlets**

Coordinates in manifest.json are never manually entered into JSON files by hand. When a candidate sprite take is committed to /characters/{id}/emotion\_bank/{emotion}/take\_XX.png, the repository bot dispatches the **Jules Coding Agent** in an isolated VM to extract coordinates optically:

\[ take\_03.png Committed \] ──► \[ repo-bot Dispatches Jules VM \]  
                                           │  
                                           ▼  
                       ┌───────────────────────────────────────┐  
                       │       JULES OPTICAL TRACE PASS        │  
                       │                                       │  
                       │  1\. Ingests take\_03.png & bible spec  │  
                       │  2\. Emits \<visual\_scan\_trace\>:        │  
                       │     • Identifies eye/chin line coords │  
                       │     • Traces foot contact bounds      │  
                       │     • Isolates mouth perimeter box    │  
                       └───────────────────┬───────────────────┘  
                                           │  
                                           ▼  
                       ┌───────────────────────────────────────┐  
                       │     DETERMINISTIC VALIDATION CHECK    │  
                       │                                       │  
                       │  • Bounds Check: Box inside canvas    │  
                       │  • Alpha Check: contact\_point alpha\>0 │  
                       │  • Ratio Assert: 1.2 \<= W/H \<= 3.0    │  
                       └───────────────────┬───────────────────┘  
                                           │ Pass (Exit 0\)  
                                           ▼  
                       \[ Jules Patches & Commits manifest.json \]

#### **The Grounded Optical Analysis Trace (\<visual\_scan\_trace\>)**

To prevent multimodal vision-language models from hallucinating coordinates, Jules must emit a structured textual trace before modifying code:

\<visual\_scan\_trace\>  
\- Analyzing canvas dimensions: 1024x1024.  
\- Foot contact assessment: Scanning bottom rows. Row 980 contains the lowest opaque pixel cluster spanning x: 420 to x: 604\. Baseline midpoint: { x: 512, y: 980 }.  
\- Facial centroid: The bridge of the nose and inner eye socket cluster around { x: 412, y: 198 }.  
\- Mouth perimeter: Upper lip detected at y: 240, lower lip at y: 272\. Left corner at x: 380, right corner at x: 444\. Box envelope: \[x: 380, y: 240, w: 64, h: 32\].  
\</visual\_scan\_trace\>

#### **Deterministic CV Sanity Checks (validate-manifest-geometry.ts)**

Before Jules commits updates, a pre-flight test suite verifies the coordinates mathematically:

> 1. **Canvas Bounds Gate:** Asserts that all extracted coordinates fall within canvas dimensions (0≤*x*≤1024, 0≤*y*≤1024).  
> 2. **Non-Empty Alpha Gate:** Probes the sprite's alpha channel at (*Ax*​,*Ay*​) to assert *α*\>0, preventing ground contact points from floating in transparent space.  
> 3. **Viseme Bounding Ratio Gate:** Asserts 1.2≤*HW*​≤3.0, preventing viseme boxes from expanding across the entire head, neck, or chest.  
> 4. **Extraction Authority:** Deterministic algorithms (alpha scanning for ground contact, template matching against the neutral base for mouths) take precedence over multimodal estimation. The vision-language model is restricted to semantic validation (e.g., verifying that the expression reads as "humiliated" rather than generic "sad").

### **6\. Defect Routing & Closed-Loop QA**

When visual regression occurs during compositing audits, defects are triaged by comparing rendered coordinates against the manifest contract:

> * **CODE\_ERROR (AST & JSX Surgery):** If the JSX in Episode\_XXX.tsx does not match the coordinates in manifest.json, the code generation layer is defective. Jules executes AST corrections using ts-morph and validates fixes locally using software OpenGL (--gl=swangle) across a 36-frame window without cloud GPU spend.  
> * **ASSET\_ERROR (Asset Pipeline Rejection):** If the rendered JSX matches manifest.json, but the visual render shows a drift \>4px, the underlying manifest is defective. Automated repair agents are barred from injecting arbitrary offset hacks into JSX; the issue is routed back to the asset pipeline for re-extraction.  
> * **Independent Measurement QA Rule:** A flat debug-mask render comparing rendered visemes against the manifest will fail to catch cases where the manifest itself is wrong. QA validation suites measure viseme alignment by independently re-segmenting the base sprite's pixel ground truth and comparing it directly against the rendered frame.  
> * **DIRECTOR\_OVERRIDE Events:** If a director uses the manual "Eject Button" to override framing on a locked episode (@lifecycle: locked), the compiler does not overwrite the file; it logs the manual transformation as an append-only event in the historical ledger:  
>   {  
>     "type": "DIRECTOR\_OVERRIDE",  
>     "target": "shot\_040\_003",  
>     "property": "camera.scale",  
>     "from": 1.04,  
>     "to": 1.08,  
>     "reason": "emotional emphasis following canon injury re-anchoring"  
>   }

---

*User prompt: {{FOCUS: 3\. Emotion Triage & The Rejection Ledger }} /extreme-details*

Response: The **Emotion Bank Triage & Rejection Ledger** system in \[series-assets-visual\] addresses a fundamental defect in diffusion-based production pipelines: **generic emotional collapse**. When generative models are prompted with generic emotional descriptors across different characters (e.g., "Bog, humiliated expression" versus "Spleen, humiliated expression"), diffusion checkpoints regress toward a homogeneous statistical mean—producing interchangeable sad-faced expressions or cartoon grimaces.

To fulfill the core studio thesis that dialogue drives the narrative while animation carries emotional weight, facial expressions and body postures are treated as structured, testable, and auditable production assets rather than ephemeral prompt rolls.

### **1\. The Specification Rail: Character-Specific Emotion Bibles**

Triage is executed against written criteria codified in each character's canonical dossier in \[series-lore\] rather than subjective aesthetic impressions. Every condition within the closed narrative taxonomy is defined across four operational dimensions:

┌────────────────────────────────────────────────────────────────────────┐  
│                   CHARACTER EMOTION SPECIFICATION RAIL                 │  
├────────────────────────────────────────────────────────────────────────┤  
│ 1\. Physical / Somatic Staging:                                         │  
│    Anatomical posture, shoulder compression, gaze angle, finger tension│  
├────────────────────────────────────────────────────────────────────────┤  
│ 2\. Psychological Subtext (The "Refusal" Vector):                       │  
│    The character-specific emotional mechanism (e.g., interrupted       │  
│    control vs. passive sorrow; frantic management vs. paralysis)       │  
├────────────────────────────────────────────────────────────────────────┤  
│ 3\. Prompt Fragment Injection:                                          │  
│    Locked, regression-tested positive prompt tokens                    │  
├────────────────────────────────────────────────────────────────────────┤  
│ 4\. Distinctness Boundary Checks:                                       │  
│    Negative constraints preventing collision with other cast members   │  
│    or alternative emotional states of the same character               │  
└────────────────────────────────────────────────────────────────────────┘

#### **Specification Matrix (Floorboard Goblin Archetypes)**

| Character | Condition | Physical Specification (The Bible) | Prompt Fragment Injection | Distinctness Boundary Check |
| :---- | :---- | :---- | :---- | :---- |
| **Bog** | **Humiliated** | Shoulders pulled inward, hands freeze mid-count and clench into fists. Gaze averted down-left. Represents **interrupted control**, not passive sadness. | "frozen mid-gesture, hands clenched, gaze averted down-left, tense jaw, interrupted control" | Must **NOT** resemble Spleen's humiliated pose (loose-limbed shrinking). |
| **Bog** | **Smug** | Chin slightly raised, single eyebrow cocked, stillness rather than an active grin. Quiet self-satisfaction. | "chin raised, minimal closed-mouth smile, still posture, one eyebrow arched, unblinking" | Must **NOT** use a wide, performative open-mouthed smirk. |
| **Bog** | **Terrified** | Frantic, uneven hand gestures simulating counting that has failed. Terror expressed as **failed management**, not paralysis. | "hands mid-frantic-gesture, wide unfocused eyes, mouth open as if mid-count, posture off-balance" | Must read as a chaotic breakdown of control/management, not generic panic. |
| **Spleen** | **Humiliated** | Full-body inward hunch, spine compressed, loose limbs folded to minimize surface area. | "slouched spine, loose limbs, defensive tuck, wide watery unblinking eyes, neck retracted" | Must **NOT** exhibit fist clenching or jaw tension characteristic of Bog. |

### **2\. Directory Topology & Candidate Staging**

Every character maintains an isolated emotion bank directory indexed directly to the condition taxonomy:

\[series\]-assets-visual/  
└── characters/  
    └── bog/  
        ├── manifest.json                  \# Runtime sprite coordinates & spatial anchors  
        ├── palette\_lock.json              \# Gamut boundary mapping  
        ├── variants/                      \# Promoted production assets  
        │   ├── bog\_humiliated.png  
        │   └── bog\_smug.png  
        └── emotion\_bank/  
            ├── humiliated/  
            │   ├── approved.json          \# Authoritative lockfile & rejection ledger  
            │   ├── take\_01.png            \# Candidate generation (rejected)  
            │   ├── take\_02.png            \# Candidate generation (rejected)  
            │   ├── take\_03.png            \# Candidate generation (WINNER \-\> promoted)  
            │   └── take\_03\_silhouette.png \# Derived binary alpha mask  
            ├── smug/  
            │   ├── approved.json  
            │   └── take\_01.png  
            └── terrified/  
                └── approved.json          \# Explicit null pointer ({ "approved\_take": null })

#### **Multi-Angle Expansion**

For puppet rigs requiring directional turns, condition variants expand along a directional sub-axis (N, NE, SE, S, SW, NW) within the emotion directory, falling back to canonical idle states if specific directional angles remain unrendered.

### **3\. The Three-Tier Automated Triage Gauntlet**

When a batch of 6–8 candidate takes is committed to a staging branch, repo-bot dispatches an automated triage gauntlet running across three validation tiers:

\[ 6–8 Candidate Takes: take\_01.png to take\_08.png \]  
                         │  
                         ▼  
┌────────────────────────────────────────────────────────┐  
│ TIER 1: DETERMINISTIC PIXEL & EDGE INTEGRITY           │  
│ • palette\_enforce.py: 100% RGB in 155-color master LUT │  
│ • Per-Pixel Edge Spill: G \- max(R, B) over 3px contour │  
│ • Geometry: Power-of-two conformity (1024x1024)        │  
└────────────────────────┬───────────────────────────────┘  
                         │ Exit 0 (All valid takes pass)  
                         ▼  
┌────────────────────────────────────────────────────────┐  
│ TIER 2: PERCEPTUAL DEDUPLICATION & SILHOUETTE GATING   │  
│ • pHash distance: Reject takes with cosine dist \< 0.12 │  
│ • Silhouette Redaction Test: Classify character purely │  
│   off take\_XX\_silhouette.png (Entropy \< 0.15)          │  
└────────────────────────┬───────────────────────────────┘  
                         │ Pass (Exit 0\)  
                         ▼  
┌────────────────────────────────────────────────────────┐  
│ TIER 3: JULES MULTIMODAL SEMANTIC AUDITING             │  
│ • Sandboxed VM inspection using \<visual\_scan\_trace\>    │  
│ • Cross-character distinctness comparison              │  
│ • Bible specification alignment check                  │  
└────────────────────────┬───────────────────────────────┘  
                         │  
                         ▼  
\[ approved.json Formatted & Committed with Rejection Ledger \]

#### **Tier 1: Deterministic Pixel Integrity & High-Percentile Spill**

> * **Palette Enforcement:** Every pixel is checked against the 155-color master palette (master\_palette.json). Any out-of-gamut tones cause immediate failure.  
> * **Chroma Spill Edge Scan:** Early pipeline implementations calculated the mean green value along the outer 3-pixel border. Because a low overall mean can obscure severe, localized green halos on thin features (such as goblin ears or antennae), the gate enforces a **per-pixel spill-excess metric** over the outer contour band:  
>   Spillpixel​\=*G*−max(*R*,*B*)  
>   If the 95th percentile of Spillpixel​ exceeds 12, the asset is rejected for chroma contamination.

#### **Tier 2: Perceptual Deduplication & Adversarial Silhouette Gating**

> * **Perceptual Hashing (pHash):** Calculates pairwise cosine distance between candidate embeddings. Takes exhibiting a distance \<0.12 (or cosine similarity \>0.88) are flagged as duplicate diffusion seeds, discarding redundant frames.  
> * **The Silhouette Redaction Test:** The candidate cutout is converted to a binary two-tone alpha mask (take\_XX\_silhouette.png). An automated classifier assesses whether the character's identity can be disambiguated solely by outer contour, posture, and slouch angle. If character classification entropy exceeds 0.15, the take is rejected for lacking silhouette distinctness within the ensemble cast.

#### **Tier 3: Jules Multimodal Semantic Auditing & \<visual\_scan\_trace\>**

To prevent multimodal vision models from returning ungrounded or hallucinated approvals, the Jules agent operates in an ephemeral VM sandbox under an operational prompt requiring an explicit, grounded optical trace before emitting JSON:

\<visual\_scan\_trace\>  
\- Ingesting specification: characters/bog.md \[Condition: Humiliated\].  
\- Posture Analysis: Shoulders compressed inward by 42px relative to base\_idle.  
\- Upper Extremities: Left and right hands clenched at lower rib line; fingers curled into tight fists. Matches "interrupted control" criteria.  
\- Gaze Vector: Eye pupils oriented down-left (-28 deg pitch, \-15 deg yaw). Eyelids open at 60% aperture (not fully shut).  
\- Silhouette Comparison: Distinct from Spleen (spleen\_humiliated shows loose spinal curl without clenched hand clusters).  
\</visual\_scan\_trace\>

### **4\. Anatomy of approved.json (The Rejection Ledger)**

approved.json serves as the authoritative audit record for emotional asset selection. Rejected candidates are preserved in the repository rather than deleted; logging the exact reasons for failure preserves negative contrast data and prevents future LoRA training runs from sampling identical flawed latent regions.

{  
  "\$schema": "https://studio.internal/schemas/approved\_emotion.v2.json",  
  "schema\_version": "2.0.0",  
  "character": "bog",  
  "emotion": "humiliated",  
  "approved\_take": "take\_03.png",  
  "approved\_take\_hash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",  
  "optical\_anchors": {  
    "eye\_centroid": { "x": 412, "y": 198 },  
    "mouth\_bounding\_box": { "x": 380, "y": 240, "width": 64, "height": 32 },  
    "ground\_contact\_point": { "x": 512, "y": 980 }  
  },  
  "rejected\_takes": \[  
    {  
      "file": "take\_01.png",  
      "sha256": "3a1b4c...",  
      "rejection\_class": "SEMANTIC\_FAILURE",  
      "reason": "Mouth drooped into a curved frown; read as generic melodramatic sadness rather than interrupted control per bible spec."  
    },  
    {  
      "file": "take\_02.png",  
      "sha256": "8f9e0d...",  
      "rejection\_class": "DISTINCTNESS\_COLLISION",  
      "reason": "Posture is too upright with chin held high; failed distinctness check against bog\_smug/take\_01.png."  
    },  
    {  
      "file": "take\_04.png",  
      "sha256": "1c2d3e...",  
      "rejection\_class": "CROSS\_CHARACTER\_BLEED",  
      "reason": "Full-body inward hunch mirrors Spleen's humiliated baseline pose; lacks Bog's characteristic frozen hand tension."  
    },  
    {  
      "file": "take\_05.png",  
      "sha256": "9b8a7c...",  
      "rejection\_class": "PHYSICAL\_DEFECT",  
      "reason": "Alpha contour check failed: green chroma spill detected along collar line (95th percentile excess \= 28)."  
    }  
  \],  
  "agent\_audit": {  
    "triaged\_by": "jules-agent-v2",  
    "scan\_trace\_hash": "sha256:4a5b6c...",  
    "completed\_at": "2026-09-18T14:22:00Z"  
  },  
  "governance": {  
    "pull\_request\_number": 142,  
    "approved\_by\_user": "art-director-lead",  
    "commit\_sha": "a4f8e21c83d58296a29e46f145f8e3b2e7a10982",  
    "verified\_at": "2026-09-18T15:04:12Z"  
  }  
}

#### **Formal Rejection Taxonomy**

> * SEMANTIC\_FAILURE: The visual expression contradicts the subtextual psychological specification in the character bible (e.g., displaying passive grief instead of defensive anger).  
> * DISTINCTNESS\_COLLISION: The pose lacks visual differentiation from another approved emotional pose belonging to the same character.  
> * CROSS\_CHARACTER\_BLEED: The candidate borrows silhouette cues or posture habits that belong canonically to another ensemble cast member.  
> * PHYSICAL\_DEFECT: Deterministic validation failures, such as chroma halos, jagged alpha edging, or out-of-gamut RGB values.

#### **Cryptographic Governance vs. Decorative Strings**

Early configurations utilized unauthenticated fields like "supervised\_signoff": "art\_director", which provided no real audit protection since any script or contributor could write the string.

In production, human sign-off is managed via **GitHub pull request reviews under branch protection**. The governance block is populated by repo-bot querying the GitHub API directly during merge, ensuring the approving user, PR number, and commit SHA cannot be authored or altered by an autonomous agent.

### **5\. Promotion Cascades & Pointer Indirection**

Once approved.json merges into the default branch, repo-bot triggers a deterministic promotion cascade:

\[ approved.json Merged into default branch \]  
                         │  
                         ▼  
┌────────────────────────────────────────────────────────┐  
│             DETERMINISTIC ASSET PROMOTION              │  
│                                                        │  
│  1\. Copy winning take \-\> variants/{char}\_{emotion}.png │  
│  2\. Compute SHA-256 and seal immutable hash            │  
│  3\. Synchronize manifest.json with optical anchors     │  
│  4\. Resolve Pointer Indirection in compiler registry   │  
└────────────────────────┬───────────────────────────────┘  
                         │  
                         ▼  
┌────────────────────────────────────────────────────────┐  
│           DOWNSTREAM TIMELINE COMPILATION              │  
│                                                        │  
│  • Compiles Episode\_XXX.tsx with exact sprite import   │  
│  • Quantizes frames: ceil(duration\_ms / 1000 \* 24\)     │  
│  • Snaps Preston Blair visemes to mouth\_bounding\_box   │  
└────────────────────────────────────────────────────────┘

#### **Decoupling via Pointer Indirection**

In earlier iterations, promoting an asset required an automated commit back to the upstream \[series-lore\] repository to flip frontmatter pointers:

\# Fragile pattern: editing lore files from asset pipelines  
emotion\_visual\_mapping:  
  humiliated: "characters/bog/emotion\_bank/humiliated/approved.json"

Modifying narrative files from an asset build step introduces cross-repository circular write dependencies. The studio resolves this through **Pointer Indirection**:

> * The narrative bible in \[series-lore\] defines only the canonical emotion ID (e.g., humiliated).  
> * \[series-assets-visual\] owns the mapping registry that resolves the emotion ID to the active sprite path and anchor envelope.  
> * When a new take is approved, zero commits are made to \[series-lore\]; the asset vault updates its internal manifest, and the downstream compiler dynamically resolves the binding.

### **6\. The Explicit Null Protocol & The Waiver Ledger**

When dialogue scripts call for emotional states that have not yet been illustrated, the system prevents runtime failures while maintaining strict production gates:

> * **The Explicit Null Contract:** Un-illustrated states are explicitly declared as null within manifest.json ("terrified": null) and approved.json ("approved\_take": null), distinguishing known production gaps from missing-file defects.  
> * **Draft Resolution:** During animatic drafts and internal rendering passes, the compiler catches null references, falls back safely to base\_states.idle, inherits the neutral anchor points, and logs a non-blocking compiler warning.  
> * **The Fail-Loud Mastering Gate:** Final broadcast rendering enforces zero tolerance:  
>   ∀shot∈Episode,referenced\_variant(shot)=null  
>   Any attempt to render a master release referencing an unapproved null variant halts the build with exit code 1\.  
> * **The Production Waiver Ledger:** If an episode must go to air before a complex emotional variant is completed, a signed waiver record must be committed to the episode build manifest (render\_manifest.json), explicitly documenting the fallback substitution and the authorizing showrunner ID.

---

*User prompt: {{FOCUS: 4\. Downstream Ingestion & Storage Ceilings }} /extreme-details*

Response: The downstream ingestion pipeline and storage ceiling architecture of **\[series-assets-visual\]** form the critical bridge between the centralized visual asset vault and the downstream rendering nodes (\[series-viewport-template\] and \[series-episodes\]).

Because generative animation pipelines deal with multi-gigabyte binary payloads—spanning full Preston Blair mouth visemes, raw layered master PSDs, high-resolution environment mattes, and multi-take emotion candidate banks—naively coupling downstream renderers to the full upstream asset tree leads to catastrophic disk thrashing, slow CI/CD image pulls, network timeouts, and non-deterministic rendering crashes.

To solve this, the pipeline enforces an isolated, AST-driven harvesting model backed by strict cryptographic integrity tripwires and non-negotiable physical storage budgets.

 ┌────────────────────────────────────────────────────────────────────────┐  
 │                      \[series-assets-visual\] VAULT                      │  
 │   • Complete Emotion Banks (/characters/{id}/emotion\_bank/)            │  
 │   • Layered Master Artwork (.psd, .ai)                                 │  
 │   • Master High-Res Background Plates (1920x1080 / 4K)                 │  
 │   • Master Palette & Coordinate Contracts (manifest.json)              │  
 └───────────────────────────────────┬────────────────────────────────────┘  
                                     │  
                     sync-assets.ts  │ Shallow Clone (--depth 1\)  
                     Pinned Tag      │ Bypasses Submodules  
                                     ▼  
 ┌────────────────────────────────────────────────────────────────────────┐  
 │               \[series-viewport-template\] / COMPOSITOR CACHE            │  
 │               (Global Viewport Staging Buffer in RAM/NVMe)             │  
 └───────────────────────────────────┬────────────────────────────────────┘  
                                     │  
             collect-episode-assets.ts Dependency Crawl  
             Reads: dialogue\_ast.json & scene\_manifest.json  
                                     │  
                                     ▼  
 ┌────────────────────────────────────────────────────────────────────────┐  
 │                   \[series-episodes\]/epXXX/public/assets/               │  
 │                   (THE PRUNED LOCAL PRODUCTION SANDBOX)                │  
 │                                                                        │  
 │   • Cherry-Picks ONLY 10–20 Active Sprites Used in Script              │  
 │   • Cherry-Picks ONLY Referenced Phoneme Mouth Shapes                  │  
 │   • Zero-Byte Poison Sentinel: Rejects SHA-256 \= e3b0c442...           │  
 │   • Hard Ceiling Gate: Enforces \< 100MB (Hard Fail at 150MB)           │  
 └───────────────────────────────────┬────────────────────────────────────┘  
                                     │  
                                     ▼  
                  Remotion CLI Headless Render (--gl=swangle)  
                  Outputs: Broadcast MP4 \+ render\_manifest.json

### **1\. Tagged Shallow Synchronization (sync-assets.ts)**

Standard Git submodules present severe operational liabilities in production pipelines: they introduce detached HEAD synchronization ambiguities, complicate CI/CD credential inheritance, and default to cloning deep Git histories containing obsolete binary iterations.

The studio toolchain replaces submodules with a dedicated synchronization harness: scripts/sync-assets.ts.

#### **The Synchronization Mechanism**

When provisioning an assembly environment on a local workstation (Rig 1\) or an ephemeral cloud runner, sync-assets.ts executes an isolated shallow clone:

git clone \\  
  \--depth 1 \\  
  \--branch v1.4.0 \\  
  \--filter=blob:none \\  
  \--no-checkout \\  
  https://github.com/studio/\[series\]-assets-visual.git \\  
  ./cache/assets-visual/

> * **Blobless/Tree Filtering:** Initial checkout inspects only directory trees and metadata manifests (manifest.json, approved.json).  
> * **Git LFS Selective Fetch:** Instead of pulling all historical LFS pointers, Git LFS fetches only the tip objects referenced by the checked-out commit:  
>   git lfs pull \--include="characters/\*/base/\*\*,characters/\*/variants/\*\*,environments/\*\*"

> * **Decoupled Version Locking (data/versions.json):** Downstream compositors never track the default branch (main or trunk). The build environment reads an immutable version lockfile:  
>   {  
>     "schema\_version": "1.0.0",  
>     "dependencies": {  
>       "\[series\]-lore": "git:8f3b12a",  
>       "\[series\]-assets-visual": "v1.4.0",  
>       "\[series\]-viewport-template": "v2.1.0"  
>     },  
>     "enforce\_lock": true  
>   }

>   If \[series-assets-visual\] is updated upstream, downstream rendering compositions remain anchored to v1.4.0 until a deliberate lockfile upgrade PR is merged.

### **2\. AST Dependency Harvesting (collect-episode-assets.ts)**

A full series visual repository contains hundreds of emotional takes, exploratory variations, unapproved experimental takes, and high-resolution environmental source files, easily consuming 15GB to 50GB of storage. Stamping this entire corpus into an individual episode repo (\[series-episodes\]/epXXX) would break CI caching, overload Docker daemon overlays, and slow local compilation.

The pipeline solves this via **Abstract Syntax Tree (AST) Dependency Harvesting**. The compiler runs scripts/collect-episode-assets.ts as a build-time pre-pass, inspecting the validated narrative intermediate representation (dialogue\_ast.json) emitted upstream by worker-sower-engine.

// scripts/collect-episode-assets.ts  
import fs from 'node:fs';  
import path from 'node:path';  
import crypto from 'node:crypto';

interface DialogueRound {  
  speaker: string;  
  emotion: string;  
  facing: 'N' | 'NE' | 'SE' | 'S' | 'SW' | 'NW';  
  phonemes: Array\<{ time\_ms: number; viseme: 'closed' | 'small' | 'medium' | 'wide' }\>;  
}

interface DialogueAST {  
  episode\_id: string;  
  location\_id: string;  
  rounds: DialogueRound\[\];  
}

interface CharacterManifest {  
  base\_states: Record\<string, { file: string; sha256: string }\>;  
  condition\_variants: Record\<string, { file: string; sha256: string } | null\>;  
  mouth\_shapes: Record\<string, string\>;  
}

export async function harvestEpisodeAssets(  
  astPath: string,  
  visualVaultPath: string,  
  destinationPath: string  
): Promise\<{ stagedFiles: string\[\]; totalBytes: number }\> {  
  const ast: DialogueAST \= JSON.parse(fs.readFileSync(astPath, 'utf8'));  
  const stagedSet \= new Set\<string\>();  
  let totalBytes \= 0;

  // 1\. Resolve and harvest active environment plate  
  const envManifestPath \= path.join(visualVaultPath, 'environments', ast.location\_id, 'manifest.json');  
  const envManifest \= JSON.parse(fs.readFileSync(envManifestPath, 'utf8'));  
  stagedSet.add(path.join('environments', ast.location\_id, envManifest.plates.standard));

  // 2\. Crawl character dialogue AST nodes  
  for (const round of ast.rounds) {  
    const charDir \= path.join(visualVaultPath, 'characters', round.speaker);  
    const manifestPath \= path.join(charDir, 'manifest.json');  
    const manifest: CharacterManifest \= JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Always stage the canonical idle base pose  
    stagedSet.add(path.join('characters', round.speaker, manifest.base\_states.idle.file));

    // Resolve condition-specific emotional variant  
    const variant \= manifest.condition\_variants\[round.emotion\];  
    if (variant && variant.file) {  
      stagedSet.add(path.join('characters', round.speaker, variant.file));  
    } else {  
      // Explicit null fallback: Compositor will map to base\_states.idle  
      console.warn(\`\[WARN\] Emotion '\${round.emotion}' is NULL in manifest. Defaulting to idle.\`);  
    }

    // Harvest ONLY the specific phoneme mouth visemes declared in the audio sync cue stream  
    for (const cue of round.phonemes) {  
      const mouthFile \= manifest.mouth\_shapes\[cue.viseme\];  
      if (mouthFile) {  
        stagedSet.add(path.join('characters', round.speaker, mouthFile));  
      }  
    }  
  }

  // 3\. Physical Extraction & Copy Phase  
  for (const relFile of stagedSet) {  
    const sourceFilePath \= path.join(visualVaultPath, relFile);  
    const destFilePath \= path.join(destinationPath, relFile);

    fs.mkdirSync(path.dirname(destFilePath), { recursive: true });  
    fs.copyFileSync(sourceFilePath, destFilePath);

    const stats \= fs.statSync(destFilePath);  
    totalBytes \+= stats.size;  
  }

  return { stagedFiles: Array.from(stagedSet), totalBytes };  
}

#### **Pruning Efficiency**

> * **Before Harvesting:** Master asset repository footprint \=∼18.4 GB (full emotion banks, discarded takes, raw PSDs, unkeyed camera plates).  
> * **After Harvesting:** Per-episode staged asset footprint \=18 MB−42 MB.  
> * **Efficiency Gain:** Over **98% reduction** in physical disk footprint per episode container, eliminating network saturation during parallel rendering runs.

### **3\. The Strict Storage Envelope & Fail-Fast Economics**

The compilation of an episode operates under the **Fail-Fast Funnel at *T*0​\=\$0.00**. In a production environment where headless Chromium instances (puppeteer / Remotion CLI) and cloud GPU nodes incur direct compute billing, unvalidated or oversized assets must never escape into the rendering pipeline.

┌────────────────────────────────────────────────────────────────────────┐  
│                   THE STORAGE ENVELOPE SPECIFICATION                   │  
├──────────────────────────────────────┬─────────────────────────────────┤  
│ Metric Dimension                     │ Production Boundary Rule        │  
├──────────────────────────────────────┼─────────────────────────────────┤  
│ Target Episode Asset Budget          │ \< 100 MB (Nominal Green Light)  │  
├──────────────────────────────────────┼─────────────────────────────────┤  
│ Absolute Maximum Storage Ceiling     │ 150 MB (Hard Compile-Time Gate) │  
├──────────────────────────────────────┼─────────────────────────────────┤  
│ Maximum Single Sprite Dimension      │ 2048 x 2048 (4-Channel RGBA)    │  
├──────────────────────────────────────┼─────────────────────────────────┤  
│ Memory Footprint in Headless Chromium│ Max 1.2 GB V8 Heap per Isolate  │  
├──────────────────────────────────────┼─────────────────────────────────┤  
│ Storage Check Execution Time         │ T\_0 (Build Step 0: \$0.00 Cost)  │  
└──────────────────────────────────────┴─────────────────────────────────┘

#### **The Storage Enforcement Gate (assert-storage-envelope.ts)**

Immediately following the asset harvest, the build runner evaluates directory storage metrics before spawning the video compiler:

// scripts/assert-storage-envelope.ts  
import fs from 'node:fs';  
import path from 'node:path';

const NOMINAL\_BUDGET\_BYTES \= 100 \* 1024 \* 1024; // 100 MB  
const HARD\_CEILING\_BYTES \= 150 \* 1024 \* 1024;   // 150 MB

export function assertStorageEnvelope(stagedAssetDir: string): void {  
  let totalBytes \= 0;

  function crawl(dir: string) {  
    const files \= fs.readdirSync(dir);  
    for (const file of files) {  
      const fullPath \= path.join(dir, file);  
      const stat \= fs.statSync(fullPath);  
      if (stat.isDirectory()) {  
        crawl(fullPath);  
      } else {  
        totalBytes \+= stat.size;  
      }  
    }  
  }

  crawl(stagedAssetDir);

  const totalMb \= (totalBytes / (1024 \* 1024)).toFixed(2);

  if (totalBytes \> HARD\_CEILING\_BYTES) {  
    console.error(\`\\n\[FATAL ENVELOPE BREACH\] Staged asset footprint (\${totalMb} MB) exceeds hard ceiling of 150 MB.\`);  
    console.error(\`Action: Inspect staged files. Ensure raw PSDs or unpruned emotion banks were not ingested.\`);  
    process.exit(1); // Halts compilation immediately at T\_0 (\$0.00 spent)  
  }

  if (totalBytes \> NOMINAL\_BUDGET\_BYTES) {  
    console.warn(\`\\n\[STORAGE WARNING\] Staged asset footprint (\${totalMb} MB) exceeds nominal target of 100 MB.\`);  
  } else {  
    console.log(\`\\n\[ENVELOPE PASS\] Staged assets verified: \${totalMb} MB / 100 MB nominal budget.\`);  
  }  
}

### **4\. The Zero-Byte Poison Trap (Cryptographic Sentinel)**

A recurring failure mode in distributed Git LFS and cloud-storage asset pipelines is the **Silent Truncation Defect**:

> 1. A developer clones the repository on a machine lacking proper Git LFS hooks or authentication credentials, leaving standard 130-byte text pointer files on disk instead of hydrated PNG binaries.  
> 2. A network interruption during asset harvesting terminates an HTTP stream prematurely, writing a zero-byte file (0 bytes) to the staging folder.  
> 3. Headless Chromium launches to render the scene. When the browser engine encounters a 0-byte image or raw text pointer inside an \<img\> or \<canvas\> context, it throws an unhandled decoding error or hangs the rendering thread, generating hundreds of black or corrupted frames while burning compute hours.

To eliminate this vulnerability, the ingestion pipeline implements **The Zero-Byte Poison Sentinel**.

#### **The Sentinel Assertion**

The pipeline tests every staged binary against the immutable empty-string SHA-256 digest:

SHA-256empty​\=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
// scripts/verify-asset-integrity.ts  
import fs from 'node:fs';  
import path from 'node:path';  
import crypto from 'node:crypto';

const EMPTY\_FILE\_SHA256 \= 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

export function verifyStagedAssetIntegrity(stagedDir: string): void {  
  const files \= fs.readdirSync(stagedDir, { recursive: true }) as string\[\];

  for (const relPath of files) {  
    const fullPath \= path.join(stagedDir, relPath);  
    const stat \= fs.statSync(fullPath);

    if (stat.isFile()) {  
      // 1\. Check for physical zero-byte truncation  
      if (stat.size \=== 0\) {  
        console.error(\`\[FATAL POISON DETECTED\] Zero-byte file identified: \${relPath}\`);  
        process.exit(1);  
      }

      // 2\. Compute cryptographic SHA-256 digest  
      const fileBuffer \= fs.readFileSync(fullPath);  
      const digest \= crypto.createHash('sha256').update(fileBuffer).digest('hex');

      if (digest \=== EMPTY\_FILE\_SHA256) {  
        console.error(\`\[FATAL POISON DETECTED\] File matches empty SHA-256 signature (e3b0c442...): \${relPath}\`);  
        process.exit(1);  
      }

      // 3\. Detect unhydrated Git LFS pointer text files masquerading as binaries  
      if (relPath.endsWith('.png') || relPath.endsWith('.webp')) {  
        const header \= fileBuffer.subarray(0, 7).toString('ascii');  
        if (header \=== 'version') {  
          console.error(\`\[FATAL LFS DEFECT\] Unhydrated Git LFS pointer detected instead of binary: \${relPath}\`);  
          console.error(\`Content: "\${fileBuffer.toString('utf8').trim()}"\`);  
          process.exit(1);  
        }  
      }  
    }  
  }

  console.log(\`\[INTEGRITY AUDIT PASSED\] All staged visual binaries verified non-empty and hydrated.\`);  
}

### **5\. Tree-Hash Staleness Verification & Build Conductor Gates**

Before allowing produceEpisode.ts to execute down to the final media deliverable, the pipeline must verify that the visual assets staged locally are identical to the canon specifications defined in \[series-lore\].

 \[series-lore\]/compiled/bible-state.json        \[series-assets-visual\] (Active Working Copy)  
┌──────────────────────────────────────┐       ┌───────────────────────────────────────────┐  
│ {                                    │       │ characters/                               │  
│   "\_meta": {                         │       │ └── bog/                                  │  
│     "characters\_tree\_sha": "9a4f2b1" │       │     └── manifest.json                     │  
│   }                                  │       │                                           │  
│ }                                    │       │ \$ git rev-parse HEAD:characters           │  
└──────────────────┬───────────────────┘       └─────────────────────┬─────────────────────┘  
                   │                                                 │  
                   │ Recorded SHA                                    │ Live Tree SHA  
                   ▼                                                 ▼  
             ┌─────────────────────────────────────────────────────────────┐  
             │            TREE-HASH STALENESS INTEGRITY GATE               │  
             │                                                             │  
             │           bible\_state.characters\_tree\_sha \=== live\_sha     │  
             └──────────────────────────────┬──────────────────────────────┘  
                                            │  
                     ┌──────────────────────┴──────────────────────┐  
                     ▼ TRUE                                        ▼ FALSE  
              \[ BUILD PROCEEDS \]                        \[ HALT: CANON\_STALE \]  
           Compile Episode\_XXX.tsx                     Exit Code 1: Run compile.ts

#### **The Verification Mechanism**

> 1. During lore compilation (npm run compile in \[series-lore\]), the compiler computes and records the Git tree hash of the visual manifests:  
>    git rev-parse HEAD:characters/ \> compiled/characters-tree.sha

2\. During the episode build, the Conductor runs a pre-execution diff: \`\`\`typescript const expectedTreeSha \= fs.readFileSync(path.join(loreDir, 'compiled/characters-tree.sha'), 'utf8').trim(); const actualTreeSha \= execSync('git rev-parse HEAD:characters/', { cwd: visualVaultDir }).toString().trim();

if (expectedTreeSha \!== actualTreeSha) {  
  console.error(\`\[FATAL CANON DIVERGENCE\] Visual assets tree SHA mismatch\!\`);  
  console.error(\`Expected by Lore: \${expectedTreeSha}\`);  
  console.error(\`Actual in Vault:  \${actualTreeSha}\`);  
  console.error(\`Action: Visual assets have been updated without recompiling narrative law. Run 'npm run compile' in \[series-lore\].\`);  
  process.exit(1);  
}  
\`\`\`

This verification guarantees that if a character's anatomical conditions, injuries, or baseline parameters change in \[series-lore\], visual artists cannot commit updated assets without triggering a formal recompilation of the world state.

### **6\. Storage Tier Architecture & Ingestion Lifecycle**

To maximize operational throughput and eliminate runtime latency, \[series-assets-visual\] participates in a tri-tier storage topology:

| Storage Tier | Physical Substrate | Content Stored | Access Pattern & Constraints |
| :---- | :---- | :---- | :---- |
| **Tier 1: Hot Scratchpad** | Local Workstation NVMe (/tmp, /scratch) | Harvested episode sandbox (/epXXX/public/assets/), uncompressed audio waveforms, V8 frame buffers | High IOPS, ephemeral lifecycle; automatically wiped post-render upon terminal release verification. |
| **Tier 2: Warm Sync Vault** | Git LFS \+ Cloudflare R2 Object Storage | Versioned releases (v1.4.0), master matte plates, approved condition variants, C2PA provenance manifests | Read-through caching; zero egress billing on Cloudflare R2 allows parallel workers to pull assets on demand. |
| **Tier 3: Cold Sovereign Archive** | Immutable Cloudflare R2 / AWS S3 WORM Storage | Stamped broadcast master MP4s, historical render\_manifest.json files, daily .ndjson causal ledgers | Append-only; protected by object locks; verified via rolling cursor scrubbers to eliminate silent bit rot. |

#### **Source Baking into React (Episode\_XXX.tsx)**

Rather than relying on client-side React components to fetch assets dynamically via HTTP requests during rendering, the ingestion compiler uses **Source-Baking** (generator/generate-episode-repo.ts):

> * The compiler resolves all file paths, sprite anchors, and camera coordinates from manifest.json and bakes them directly into static TypeScript imports within Episode\_XXX.tsx:  
>   // Baked output in \[series-episodes\]/epXXX/src/Episode\_040.tsx  
>   import bogIdleSprite from '../public/assets/characters/bog/base/bog\_idle.png';  
>   import bogHumiliatedSprite from '../public/assets/characters/bog/variants/bog\_humiliated.png';  
>   import warmPipePlate from '../public/assets/environments/warm\_pipe/background.png';

>   export const Episode\_040 \= () \=\> {  
>     return (  
>       \<Puppet  
>         src={bogHumiliatedSprite}  
>         anchorX={518}  
>         anchorY={980}  
>         zoomTarget={{ x: 412, y: 198 }}  
>       /\>  
>     );  
>   };

> * **The Invariant Result:** Because asset paths, binary checksums, and layout parameters are baked into code at build time, the rendering composition becomes completely offline-capable, deterministic, and immune to runtime asset mutation.

---

*User prompt: {{FOCUS: 1\. The Sovereign Ontological Boundary: Meaning (Axis A) vs. Representation (Axis B)}} /extreme-details*

Response: The downstream ingestion pipeline and storage ceiling architecture of **\[series-assets-visual\]** form the critical bridge between the centralized visual asset vault and the downstream execution domains (\[series-viewport-template\] and \[series-episodes\]).

Because generative pipelines produce massive, non-deterministic binary payloads—including raw layered source files, unpruned emotion banks, and high-resolution environmental mattes—allowing downstream renderers to blindly consume the full upstream asset tree leads to catastrophic disk thrashing, CI/CD timeouts, and out-of-memory (OOM) rendering crashes. Furthermore, generated media is archive-dependent; it cannot be deterministically regenerated from seeds alone due to latent sampling and hardware variances, making its physical footprint permanent and heavy.

To solve this, the pipeline enforces a highly localized, AST-driven harvesting model backed by strict cryptographic integrity tripwires and non-negotiable physical storage budgets.

### **1\. Tagged Shallow Synchronization (sync-assets.ts)**

Standard Git submodules present severe operational liabilities in automated production pipelines: they introduce detached HEAD ambiguities, complicate CI/CD credential inheritance, and default to cloning deep Git histories containing gigabytes of obsolete binary iterations.

The studio toolchain eradicates submodules in favor of a dedicated synchronization harness (scripts/sync-assets.ts) that executes an isolated, shallow clone.

#### **The Decoupled Version Lock (versions.json)**

Downstream compositors (Axis B / Representation) are structurally forbidden from tracking the default branch (main or trunk) of the asset repository. The build environment reads an immutable version lockfile (versions.json) that pins the precise visual tag required to satisfy the episode's AST.

{  
  "schema\_version": "1.0.0",  
  "dependencies": {  
    "\[series\]-lore": "git:8f3b12a",  
    "\[series\]-assets-visual": "v1.4.0",  
    "\[series\]-viewport-template": "v2.1.0"  
  }  
}

If \[series-assets-visual\] is updated upstream with new emotion variants, downstream compositions remain securely anchored to v1.4.0 until a deliberate lockfile upgrade is merged, preventing mid-render visual drift.

#### **The Blobless LFS Ingestion**

The synchronization script uses tree-filtering and sparse Git LFS fetching to ingest only the tip objects referenced by the locked commit, bypassing unnecessary historical data:

git clone \\  
  \--depth 1 \\  
  \--branch v1.4.0 \\  
  \--filter=blob:none \\  
  \--no-checkout \\  
  https://github.com/studio/\[series\]-assets-visual.git \\  
  ./cache/assets-visual/

### **2\. AST Dependency Harvesting (collect-episode-assets.ts)**

A full series visual repository contains hundreds of emotional takes, exploratory variations, and high-resolution plates that easily exceed tens of gigabytes. Stamping this entire corpus into an individual episode container (\[series-episodes\]/epXXX) would break Docker daemon overlays and drastically inflate build times.

The pipeline solves this via **Abstract Syntax Tree (AST) Dependency Harvesting**. The compiler runs scripts/collect-episode-assets.ts as a pre-pass, inspecting the validated narrative intermediate representation (dialogue\_ast.json) emitted upstream by the semantic simulation core (worker-sower-engine).

#### **The Pruning Algorithm**

> 1. **Location Plate Extraction:** The harvester crawls the AST for the active location\_id, reads the environment's manifest.json, and stages only the exact matte plate required for the scene.  
> 2. **Character Sprite Targeting:** For every dialogue round in the AST, the script resolves the active speaker, reads their manifest.json, and stages the base neutral pose (base\_states.idle). It then looks up the precise emotional variant declared in the AST node (e.g., "emotion": "terrified"). If the variant is explicitly marked null, it safely falls back to the idle pose.  
> 3. **Phoneme Harvest:** The harvester crawls the audio sync cue stream and copies *only* the specific Preston Blair mouth shapes (e.g., mouth\_wide.png) referenced in that specific character's spoken lines.

**Efficiency Gain:** By cherry-picking only the 10–20 active sprites and plates referenced in the script, the local asset footprint is reduced by over 98% (e.g., condensing a 15GB vault down to a 30MB payload), preventing network saturation during headless rendering.

### **3\. The Strict Storage Envelope (Fail-Fast Economics)**

The compilation of an episode operates under the **Fail-Fast Economic QA Hierarchy (*T*0​→*T*5​)**. Because rendering costs scale exponentially (incurring cloud GPU and execution billing), defects must be caught at the earliest possible stage.

Catching a defect at the in-memory AST gate (*T*0​) costs exactly **\$0.00**. Allowing an unvalidated or oversized asset payload to reach cloud GPU diffusion (*T*3​) or broadcast delivery (*T*5​) results in severe compute waste.

#### **The Envelope Gate**

Immediately following the harvest, assert-storage-envelope.ts evaluates the local staging directory (/epXXX/public/assets/).

> * **Target Budget:** \<100 MB (Nominal Green Light).  
> * **Hard Maximum Ceiling:** 150 MB.

If the harvested directory exceeds 150 MB (typically caused by a human accidentally committing an unflattened 2GB PSD file into the variants directory), the compiler intentionally crashes with exit code 1 at *T*0​, halting the pipeline before spinning up costly headless Chromium renderers.

### **4\. The Zero-Byte Poison Sentinel (Cryptographic Trap)**

A recurring failure mode in CI/CD pipelines relying on Git LFS is the **Silent Truncation Defect**. If a runner lacks proper LFS hooks, it downloads 130-byte text pointer files instead of hydrated PNG binaries. If a network socket drops, it may leave a zero-byte file. When headless Chromium encounters these corrupted inputs inside a \<canvas\> context, it throws unhandled decoding errors, hanging the thread and generating hundreds of black frames while burning compute hours.

To eliminate this vulnerability, the ingestion pipeline implements the **Zero-Byte Poison Sentinel**.

Before authorizing the render, the pipeline computes the cryptographic SHA-256 digest of every staged binary. It tests this digest against the mathematical constant for an empty file:

SHA-256empty​\=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

If any file matches this hash—or if the script detects the ASCII header "version" characteristic of an unhydrated LFS pointer—the sentinel triggers a fatal build halt, guaranteeing that only fully verified, valid binaries reach the render context.

### **5\. Tree-Hash Staleness Verification**

To enforce the Cartesian boundary between Meaning (Axis A) and Representation (Axis B), visual pipelines must never render assets that are out-of-sync with the canonical narrative law.

The pipeline enforces this via a rigid Git tree-hash check.

> 1. During upstream narrative compilation (worker-sower-engine), the system calculates the Git tree SHA of the active visual assets and bakes it into compiled/bible-state.json.  
> 2. During downstream episode assembly, the conductor compares this expected hash against the live Git tree SHA of the /characters/ folder in the fetched \[series-assets-visual\] vault.

If the hashes diverge, it proves that an artist has committed a visual update (such as adding a severed limb variant) that has not yet been reconciled with the narrative simulation. The build halts immediately with a CANON\_STALE exception, preventing the episode from rendering an unauthorized visual state.

### **6\. Storage Tiers and TSX Source-Baking**

To maximize operational throughput, \[series-assets-visual\] propagates its harvested assets down through a multi-tier storage topology:

> * **Tier 1: Hot Scratchpad (Local NVMe):** Ephemeral staging for the harvested \< 150MB sandbox, uncompressed audio waveforms, and Chromium frame buffers. Purged automatically post-render.  
> * **Tier 2: Warm Sync Vault (Cloudflare R2):** Content-addressed object storage containing the master asset variants and C2PA provenance manifests.  
> * **Tier 3: Cold Sovereign Archive:** Immutable, WORM-protected cloud storage archiving the final broadcast MP4s and render\_manifest.json lockfiles.

#### **Source Baking in React (Episode\_XXX.tsx)**

Rather than relying on client-side React code to fetch assets dynamically via HTTP requests during headless rendering, the ingestion compiler utilizes **Source-Baking**.

The AST generator resolves all asset file paths and bakes them directly into static TypeScript imports:

// Baked output inside \[series-episodes\]/epXXX/src/Episode\_040.tsx  
import bogIdleSprite from '../public/assets/characters/bog/base/bog\_idle.png';  
import bogHumiliatedSprite from '../public/assets/characters/bog/variants/bog\_humiliated.png';

\<Puppet src={bogHumiliatedSprite} anchorX={518} anchorY={980} /\>

Because the asset paths, binary checksums, and layout parameters are hardcoded into the TSX at compile-time, the rendering environment becomes completely offline-capable, deterministic, and physically immune to runtime asset mutation.

---

*User prompt: {{FOCUS: 2\. Physical & Conceptual Isolation from Generative Training (\[series-lora-training\])}} /extreme-details*

Response: The physical and conceptual isolation of **\[series-lora-training\]** from the primary visual asset vault establishes the critical boundary between the chaotic, iterative generative foundry and the immutable, deterministic production timeline. In the studio architecture, generative models are classified as **untrusted, headless execution workers** possessing zero narrative or physical authority.

Failing to isolate training materials from production deliverables results in multi-gigabyte repository bloat, VRAM collisions on rendering hardware, and the accidental ingestion of unverified visual hallucinations into canon. To prevent this, the training environment is quarantined entirely within \[series-lora-training\], operating under strict hardware demarcation, dataset governance, and cryptographic promotion gates.

### **1\. Hardware Sovereignty & The Dual-Rig Partition**

The isolation begins at the physical silicon layer. Attempting to run relational databases, audio synthesis, temporal quantizers, and spatial-temporal video diffusion networks on a single consumer GPU guarantees fatal CUDA Out-Of-Memory (OOM) crashes and desynchronization. The architecture strictly divides compute across two specialized environments:

> * **Rig 1: The Sovereign Orchestrator (CPU / System RAM Bound):** Houses the deterministic control plane. It runs worker-sower-engine (narrative law), local SQLite ledgers, audio-microservice (:8000), and goblin-viewport-template (Remotion CLI optical compositing). Rig 1 operates with **zero GPU VRAM dependency**, relying entirely on deterministic integer math and software OpenGL rendering (--gl=swangle) to compile timelines.  
> * **Rig 2: The GPU Tensor Foundry (Dedicated Silicon):** Dedicated exclusively to high-VRAM model execution. It runs the headless ComfyUI daemon (:8188) and media-broker (:3000). Rig 2 is a "Dumb Executor" blind to narrative pacing, acting purely as a mechanical latent allocator that transforms incoming JSON integer frame budgets into raw pixels.

By segregating these environments, \[series-lora-training\] operates entirely within the isolated tensor boundaries of Rig 2, preventing iterative neural network training scripts from locking VRAM needed for active production rendering.

### **2\. Repository Topology & The Epistemic Gap**

\[series-lora-training\] contains the iterative, high-volume raw materials required to forge a visual identity, ensuring the downstream \[series-assets-visual\] vault remains a lightweight, strongly typed API.

The standard topology isolates working components into explicit validation tiers:

\[series-lora-training\]/  
├── /character  
│   └── /bog  
│       ├── /references  
│       │   ├── /raw                \# Ingestion buffer (3D rips, concept art)  
│       │   │   ├── raw\_001.png  
│       │   │   └── source\_log.json \# Ingestion provenance & licensing notes  
│       │   ├── /curated            \# Verified training ground truth  
│       │   │   ├── curated\_001.png  
│       │   │   └── curation\_manifest.json  
│       │   └── /rejected           \# Preserved negative exemplars  
│       │       └── rejected\_log.json  
│       ├── /training\_runs  
│       │   ├── /v1                 \# Frozen configurations & adapter weights  
│       │   │   ├── training\_config.json  
│       │   │   └── bog\_lora\_v1.safetensors  
│       └── manifest.json           \# LoRA-level dataset coverage tracking

#### **The Tri-Stage Reference State Machine**

> 1. **/references/raw/ (Ingestion Buffer):** The unfiltered drop-zone for artist sketches and unrefined diffusion exports. Every file requires an entry in source\_log.json detailing model seeds or clearance provenance, preventing copyright liability at the root.  
> 2. **/references/curated/ (Active Set):** Images verified by the Jules Coding Agent. Assets here are cropped to multi-resolution buckets, checked against master palettes, and explicitly bound to structured caption tokens.  
> 3. **/references/rejected/ (Negative Contrast Buffer):** Excluded candidate files are **never deleted**. They are tagged with explicit diagnostic categories (e.g., identity\_drift, motion\_jitter, anatomical\_collapse) in rejected\_log.json. Preserving failures provides negative reference data to counteract algorithmic bias and Model Autophagy Disorder (MAD) during future retraining sweeps.

### **3\. The LoRA Invariance Captioning Protocol**

A fundamental failure mode in Low-Rank Adaptation (LoRA) training occurs when base checkpoints fuse permanent character anatomy with ephemeral scene variables (e.g., locking a character forever into a specific apron or lighting setup).

To counter this, \[series-lora-training\] enforces the **Invariance Captioning Rule**:

> * **Omit Permanent Invariants:** Permanent anatomical traits (bone structure, scars, baseline skin texture, and posture quirks) must be **omitted** from training captions. This forces the diffusion training optimizer to bind these uncaptioned permanent traits directly to the character's unique trigger token (e.g., bog\_goblin).  
> * **Describe Ephemeral Volatility:** Removable wardrobe, held props, background environments, and lighting profiles are exhaustively captioned. By providing text tokens for the apron or the harsh sodium lighting, the model decouples those elements from the character token, enabling them to be swapped or removed at inference time.

### **4\. Coverage Gate Analysis & Anti-Autophagy Discipline**

Unmonitored generative pipelines frequently burn expensive GPU compute training on highly imbalanced datasets, yielding models that can only render characters from a single flattering angle or in a neutral mood.

Before any serverless training compute is scheduled, validate-references.ts crawls the manifest.json to enforce strict prerequisites:

> * **Dimensional Density Gates:** The auditor mandates a minimum of 5 samples per target emotion across at least 3 distinct camera elevations. If a character lacks sufficient references for a condition (e.g., flagging that Bog has zero terrified references), it populates coverage\_summary.emotions\_missing and blocks the training run, preventing blind execution.  
> * **Perceptual Deduplication:** Identical frames or continuous video sequences cause severe overfitting. The script calculates perceptual hashes (pHash) and feature distance matrices, rejecting images with a cosine similarity \>0.85 to ensure dataset variance.  
> * **The Anti-Autophagy Ratio (60/40):** Allowing an automated loop to feed its own synthetic outputs into future training sets triggers Model Autophagy Disorder (MAD)—a catastrophic collapse of visual variance. The repository strictly maintains an anchor ratio: a minimum of **60%** of training images must originate from primary human drawings or 3D viewport renders, capping synthetic generative feedback at **40%**.

### **5\. Automated Distillation & Shadow Canary Bake-Offs**

When \[series-lora-training\] leverages production exhaust to self-improve, it deploys a sophisticated, multi-tiered gauntlet to prevent degraded frames from baking into downstream model weights.

> 1. **Uncertainty-Weighted Active Sampling (Gate 4):** As live production generates candidate frames, those passing an algorithmic quality threshold (*S*≥0.92) are sent to a staging bucket. Instead of random sampling, a Video-LLM auditor evaluates them across three passes at *T*\=0.7. Unanimous passes move to the /golden/ dataset, while high-variance borderline candidates (0.91≤*S*≤0.93) are diverted to a human review queue.  
> 2. **Automated Serverless Baking:** Upon accumulating 200–250 validated pairs in the /golden/ directory, an event hook automatically triggers a headless LoRA training job (e.g., Kohya-ss or PEFT on an A100 instance).  
> 3. **The Shadow Canary Suite:** Before reaching production, the newly minted .safetensors adapter executes **100 headless shadow canary runs** against a locked baseline benchmark suite. If the new LoRA spikes a deterministic failure rate \>10% compared to the active production model, it is instantly quarantined.  
> 4. **Cryptographic Human Sign-Off (Gate 5):** If the shadow canary passes, an A/B matrix is presented to the Style/Art Director. An unreviewed mid-season model swap is the primary vector for silent visual identity drift. Deploying the new weight to the active cluster requires an explicit cryptographic signature via a GitHub Pull Request. Only upon signature does the system hot-reload the .safetensors payload directly into the ComfyUI network volume, seamlessly bridging the gap between isolated training and live execution.

---

*User prompt: {{FOCUS: 1\. The Specification Rail: Character-Specific Emotion Bibles (series-assets-visual))}} /extreme-details*

Response: The **Specification Rail** within the character bibles serves as the absolute, written authority governing visual emotion triage. It was designed to solve a fatal flaw in generative production pipelines: **generic emotional collapse**.

Without deliberate, per-character visual engineering, prompting a diffusion model for "Bog, humiliated expression" and "Spleen, humiliated expression" causes the neural network to default to a homogeneous, generic sad-faced RLHF mean. To prevent this, the studio treats facial expressions as structured, testable, and auditable production assets rather than ephemeral prompt rolls. Triage is executed against rigorous written criteria codified in \[series-lore\] rather than relying on the subjective aesthetic opinions of reviewers or multimodal agents.

### **1\. The Four-Dimensional Specification Matrix**

Every core emotional condition (e.g., humiliated, smug, terrified, exposed) is strictly defined in the character's narrative bible across four operational dimensions:

> * **Condition ID:** The canonical state name drawn from the unified condition taxonomy (world/conditions.md), guaranteeing that the mechanical simulation, the LLM dialogue tags, and the visual directory structures remain perfectly synchronized.  
> * **Physical / Somatic Staging:** Detailed prose describing exactly how this specific character's body reacts to the emotion based on their psychology and anatomical quirks.  
> * **Prompt Fragment Injection:** A locked, version-controlled string of positive prompt tokens that reliably guides the diffusion model toward the correct physical staging.  
> * **Distinctness Boundary Check:** Explicit negative constraints defining what the emotion must *not* look like, frequently establishing contrast against other ensemble cast members to prevent cross-character visual bleed.

### **2\. Concrete Implementation: Floorboard Goblin Archetypes**

The Specification Rail guarantees that when a character is humiliated, the audience sees that character's specific, personal psychology rendered consistently on screen.

| Character | Condition | Physical Specification (The Bible) | Prompt Fragment Injection | Distinctness Boundary Check |
| :---- | :---- | :---- | :---- | :---- |
| **Bog** | **Humiliated** | Shoulders pulled inward, hands freeze mid-count and clench into fists. Gaze averted down-left. Bog's humiliation represents **interrupted control**, not passive sadness. | "frozen mid-gesture, hands clenched, gaze averted down-left, tense jaw, interrupted control" | Must **NOT** resemble Spleen's humiliated pose (which is a loose-limbed, full-body shrinking). |
| **Bog** | **Smug** | Chin slightly raised, single eyebrow cocked, absolute physical stillness. Bog's smugness is quiet self-satisfaction rather than an active grin. | "chin raised, minimal closed-mouth smile, still posture, one eyebrow arched, unblinking" | Must **NOT** use a wide, performative open-mouthed smirk. |
| **Bog** | **Terrified** | Frantic, uneven hand gestures simulating counting that has failed. Terror expressed as **failed management**, not paralysis. | "hands mid-frantic-gesture, wide unfocused eyes, mouth open as if mid-count, posture off-balance" | Must read as a chaotic breakdown of counting/managing, not generic terror or generic panic. |

### **3\. Specialized Load-Bearing Visual States**

Beyond standard negative conflict states, the character bible specifies highly targeted physical poses that directly inform the downstream Remotion animation layer:

#### **The Comfort State (at\_ease)**

The at\_ease variant represents the character entirely at peace, with their guard down.

> * **Architectural Role:** It is the *only* positive-valence, non-conflict emotional state in the entire visual system.  
> * **Narrative Function:** Almost never shown, this state is reserved for rare "quiet cold opens" or season-finale beats where a genuine contrast moment is required. Knowing what the character looks like at ease makes the moments they are *not* at ease land significantly harder.  
> * **Production Priority:** Because it is structurally load-bearing and anchors the show's sharpest contrast technique, generating a weak or generic at\_ease render would severely undercut the emotional payoff; therefore, it requires intense artistic prioritization.

#### **The Physical Lying Tell**

Each character bible dictates one concrete, visual detail they exhibit when lying or hiding something (e.g., stopping counting mid-sentence, over-explaining, or getting perfectly still).

> * **Compositor Integration:** This provides the Remotion animation layer with explicit non-verbal actions to display during Backfire or reveal-adjacent scenes, preventing the engine from relying purely on dialogue to carry dramatic weight.  
> * **Manifest Linkage:** The pipeline formalizes this as its own manifest field (e.g., lying\_tell\_pose), allowing it to act as a direct pointer into condition\_variants rather than leaving it as unstructured prose the viewport must guess at.

### **4\. Integration with the Dual-Ledger Mapping**

The visual specifications authored in the Markdown bibles bridge directly into the \[series-assets-visual\] vault via frontmatter pointer indirection.

In \[series-lore\]/characters/bog.md, the YAML frontmatter explicitly links the mechanical condition taxonomy to the visual repository's authoritative lockfiles:

emotion\_visual\_mapping:  
  humiliated: "characters/bog/emotion\_bank/humiliated/approved.json"  
  smug: "characters/bog/emotion\_bank/smug/approved.json"  
  terrified: null \# Explicit null, never silently absent

This dual-ledger architecture ensures that the autonomous visual triage agents (like Jules) evaluate diffusion outputs directly against the character's exact psychological framing. If an artist or VLM attempts to approve a candidate image of Bog looking generically sad while his arms hang loose, the system rejects it for a SEMANTIC\_FAILURE because it violates the "interrupted control / hands frozen mid-count" mandate established by the Specification Rail.

---

*User prompt: {{FOCUS: 2\. Directory Topology & Candidate Staging (series-assets-visual)}} /extreme-details*

Response: The directory topology of **\[series-assets-visual\]** functions as a rigid, typed file-system API designed to domesticate the chaotic output of generative diffusion models. Rather than acting as a loose bin for graphics, the repository enforces a strict spatial hierarchy tracked via Git LFS, intentionally segregating unverified candidate generations from broadcast-ready production assets.

### **1\. The Git LFS Foundation**

Because the vault manages heavy, uncompressed binary media, standard Git object tracking is disabled for visual assets. The root .gitattributes file mandates Git Large File Storage (LFS) tracking for all master design files and raster outputs (e.g., \*.png, \*.psd). This prevents repository bloat while preserving deterministic version history for every pixel.

### **2\. The Standardized Directory Tree**

The repository layout organizes assets into explicit functional boundaries, ensuring downstream compositors can reliably locate bounding boxes, mouth visemes, and matte plates.

\[series-assets-visual\]/  
├── .gitattributes                    \# LFS tracking for \*.png, \*.psd\[cite: 14\]  
├── environments/  
│   └── warm\_pipe/  
│       └── background.png            \# Hand-painted matte plate\[cite: 14\]  
└── characters/  
    └── bog/  
        ├── manifest.json             \# Sprite coordinates & anchor points\[cite: 14\]  
        ├── variants/                 \# Promoted, broadcast-ready expression files\[cite: 21\]  
        │   └── bog\_humiliated.png  
        └── emotion\_bank/             \# Candidate staging and rejection ledgers\[cite: 14\]  
            ├── mouth\_visemes/        \# Cutout mouth shapes for lip-sync\[cite: 14\]  
            └── humiliated/  
                ├── take\_01.png       \# Unverified candidate generation  
                ├── take\_02.png       \# Unverified candidate generation  
                └── approved.json     \# Rejection ledger & final selection manifest\[cite: 21\]

### **3\. Candidate Staging & The Tri-Tier Gauntlet**

The /emotion\_bank/ directory serves as the quarantine zone for new visual generations. When a batch of candidate visual assets (such as new LoRA references, emotion bank takes, or cutout sprite sheets) is committed to this staging area, it cannot reach the /variants/ production folder until it survives a brutal, three-tier automated gauntlet.

> * **Tier 1: Deterministic Pixel Gate (palette\_enforce.py)**  
  * **Palette Conformity:** Asserts that 100% of the candidate's RGB values fall strictly inside the 155-color master Look-Up Table (LUT).  
  * **Alpha Edge Sweep:** Evaluates the transparency mask; the mean green value must remain \< 12 inside the outer 3-pixel contour to prevent chroma-key spill.  
  * **Perceptual Deduplication:** Calculates a pHash cosine distance; if the distance is \> 0.12, it ensures the candidate is sufficiently distinct from existing assets rather than a near-identical seed duplicate.  
> * **Tier 2: Adversarial Silhouette Gating**  
  * **The Redaction Test:** The candidate image is stripped down to a pure two-tone binary alpha mask.  
  * **Entropy Classification:** An automated classifier evaluates this outline, requiring a character classification entropy \< 0.15. This confirms that the character's posture and slouch are entirely distinct from the rest of the cast ensemble, preventing "silhouette bleed" across characters.  
> * **Tier 3: Jules Multimodal Optical Audit**  
  * **Attention Grounding:** The Jules coding agent performs a visual scan (\<visual\_scan\_trace\>), emitting explicit pixel coordinates to prove it isn't hallucinating the analysis.  
  * **Coordinate Extraction & Semantic Check:** Jules extracts the ground contact point, facial centroid, and mouth bounds, and rigorously compares the rendered facial expression against the written character emotion bible to ensure the psychology matches the prompt.

### **4\. Atomic Promotion & Synchronization**

If a candidate take survives all three tiers (returning Exit 0 across the board), the system triggers an atomic promotion protocol. The winning file is moved from the /emotion\_bank/ staging area into the active /variants/ directory (e.g., variants/{character}\_{emotion}.png).

To seal the pipeline, the system writes the approved.json file—which includes the full rejection log and rationale for the takes that failed—and immediately updates the character's root manifest.json with the newly extracted optical coordinates. This guarantees that the moment an asset becomes available to the downstream Remotion compositor, its mathematical layout contract is perfectly synchronized.

---

*User prompt: {{FOCUS: 3\. The Three-Tier Automated Triage Gauntlet (series-assets-visual)}} /extreme-details*

Response: When a batch of candidate visual assets (such as 6–8 takes ranging from take\_01.png to take\_08.png) is committed to a staging branch in \[series-assets-visual\], repo-bot and the Jules coding agent initiate a rigid, automated triage gauntlet. To prevent generic emotional collapse and ensure that generative diffusion models output highly specific, physically accurate character plates, these candidates must survive three distinct validation tiers before they can be promoted to production variants.

### **Tier 1: Deterministic Pixel Integrity (Physical Constraints)**

The first tier operates as a zero-compute-cost firewall, utilizing deterministic computer vision metrics to filter out fundamental generation errors before any neural evaluation occurs.

> * **Palette Conformity (palette\_enforce.py):** The system asserts that 100% of the candidate's RGB values fall strictly inside the 155-color master Look-Up Table (LUT). Any candidate that introduces muddy intermediate hues or unmapped out-of-gamut tones is failed immediately.  
> * **Per-Pixel Alpha Edge Purity:** To prevent edge haloing when composited in Remotion, the engine evaluates the greenscreen keying threshold. While early iterations measured the mean green channel value inside the outer 3-pixel contour (requiring it to remain \<12), this was updated because a mean allows localized fringes to pass. The pipeline now evaluates a high percentile or per-pixel spill-excess equation: *G*−max(*R*,*B*) over the edge band.  
> * **Coordinate Extraction:** The tier extracts foundational coordinates from layer bounds and alpha masks to prepare for downstream semantic grounding.

### **Tier 2: Embedding-Space Drift & Adversarial Silhouette Gating**

The second tier utilizes metric tensors and perceptual classifiers to guarantee that the candidate is visually distinct, anatomically stable, and unique from the rest of the ensemble cast.

> * **Perceptual Deduplication & Stability:** The system calculates perceptual hashes (pHash) and rejects candidate takes with a cosine similarity \>0.88 (or cosine distance \>0.12) to eliminate near-identical seed duplicates. It also enforces embedding stability by requiring a DINOv2 cosine distance of ≤0.08 and an LPIPS perceptual patch variance of ≤0.12.  
> * **The Silhouette Redaction Test:** To ensure characters do not degrade into generic, interchangeable talking heads, candidate renders are converted into pure two-tone binary alpha silhouettes, such as take\_XX\_silhouette.png.  
> * **Classification Entropy:** An automated classifier evaluates this binary outline. If the character classification entropy is not \<0.15 based strictly on posture, slouch angle, and silhouette asymmetry, the candidate is discarded. If the auditor cannot distinguish Bog from Wart or Spleen in a blackout test, it fails the distinctness boundary.

### **Tier 3: Jules Multimodal Semantic Auditing**

Asking a multimodal Vision-Language Model (VLM) for a direct "accept or reject" verdict typically results in hallucinatory, "vibes-based" approvals. Tier 3 forces the VLM into an objective, coordinate-bound diagnostic workflow.

> * **Mandatory Attention Grounding (\<visual\_scan\_trace\>):** Jules must emit an explicit optical scan trace before issuing any JSON verdict. This trace must pinpoint exact pixel coordinates for eyeline centroids, mouth bounding boxes, and props.  
> * **Bible Specification Alignment:** Once grounded, Jules compares the rendered facial expression and physical staging directly against the written criteria codified in the character's emotion bible.  
> * **Diagnostic Categorization:** The VLM classifies any detected root causes into a closed enum taxonomy, separating NOISE from LIGHTING, ANATOMICAL collapses, or CANON\_BREACH events.

### **Atomic Promotion & The Rejection Ledger**

If a candidate returns a clean Exit 0 across all three tiers, the system triggers an atomic promotion protocol and manifest synchronization.

> * **The approved.json Contract:** The system formats and commits an audit trail that includes the winning take's hash, optical anchors, and a structured rejection ledger. Rejected candidates are never silently deleted; their failures are permanently logged under classes such as SEMANTIC\_FAILURE, DISTINCTNESS\_COLLISION, CROSS\_CHARACTER\_BLEED, or PHYSICAL\_DEFECT to prevent the negative pool from regenerating identical flaws.  
> * **Cryptographic Human Sign-Off:** Approval is never handled by writing a decorative JSON string like "supervised\_signoff": "art\_director". Actual approval requires a GitHub pull request review under branch protection, with the approving user and PR number read directly from the GitHub API, preventing automated agents from authoring or modifying approval fields.  
> * **Pointer Indirection:** The winning file is copied to variants/{character}\_{emotion}.png, and {character}/manifest.json is updated with the extracted optical coordinates. The lore bible uses pointer indirection to reference this stable emotion ID, ensuring no high-risk lore files need to be edited when new art lands.

---

*User prompt: {{FOCUS: 4\. Anatomy of approved.json (The Rejection Ledger) (series-assets-visual)}} /extreme-details*

Response: The approved.json file serves as the authoritative audit record of authorial decisions within the \[series-assets-visual\] staging area. Rather than silently deleting rejected candidate generations, the pipeline preserves them in a structured rejection ledger. Documenting exactly why candidate takes failed preserves critical negative contrast data, which prevents the pipeline from sampling flawed latent regions and re-generating identical defects during future training runs.

{  
  "schema\_version": "1.1.0",  
  "character": "bog",  
  "emotion": "humiliated",  
  "approved\_take": "take\_03.png",  
  "approved\_take\_hash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",  
  "optical\_anchors": {  
    "eye\_centroid": { "x": 412, "y": 198 },  
    "mouth\_bounding\_box": { "x": 380, "y": 240, "width": 64, "height": 32 },  
    "ground\_contact\_point": { "x": 512, "y": 980 }  
  },  
  "rejected\_takes": \[  
    {  
      "file": "take\_01.png",  
      "rejection\_class": "SEMANTIC\_FAILURE",  
      "reason": "Mouth drooped into a curved frown; read as generic melodramatic sadness rather than interrupted control per bible spec."  
    }  
  \],  
  "triaged\_by": "jules-agent-v2",  
  "approved\_at": "2026-09-18T14:22:00Z"  
}

### **1\. The Rejection Taxonomy (rejected\_takes)**

The ledger categorizes every discarded candidate into a closed taxonomy, converting subjective aesthetic dismissals into structured, queryable regression data. Jules documents these failed candidates under specific classes:

> * **SEMANTIC\_FAILURE**: The visual expression contradicts the subtextual psychological specification in the character bible. For example, a mouth drooped into a generic melodramatic frown is rejected if the character's baseline for humiliation requires a state of "interrupted control".  
> * **DISTINCTNESS\_COLLISION**: The pose fails a distinctness check against another approved emotion belonging to the same character. An example is an upright posture with a high chin being rejected because it collides with a previously established "smug" pose.  
> * **CROSS\_CHARACTER\_BLEED**: The candidate borrows silhouette cues or posture habits that canonically belong to another ensemble cast member. If a generated image of Bog features a full-body inward hunch, it is rejected because it mirrors Spleen's characteristic pose.  
> * **PHYSICAL\_DEFECT**: The image fails deterministic physical validation gates. This includes alpha contour checks failing due to excessive green chroma spill detected along a collar line.

### **2\. Machine-Extracted Optical Anchors (optical\_anchors)**

The ledger permanently seals the geometric coordinates extracted during the multimodal visual scan, binding the raster image to a machine-computable spatial contract.

> * **mouth\_bounding\_box**: Captures the exact coordinate envelope defining the mouth's perimeter. Downstream Remotion compositors use these coordinates to position modular Preston Blair visemes (the A–H set) directly onto the static sprite without requiring manual alignment. The manifest acts as the single source of truth for these coordinates, and different bounding boxes for the same asset across documents are treated as a defect.  
> * **eye\_centroid**: Captures the centroid of the eyes, allowing programmatic crash zooms to center correctly on the face.  
> * **ground\_contact\_point**: Establishes the sub-pixel floor-plane pivot, ensuring the character can be pinned to the background matte plate without floating.

### **3\. Cryptographic Governance & Separation of Powers**

A core architectural rule dictates that "approval is not a JSON string". The ledger strictly separates machine-generated diagnostic rationale (such as triaged\_by and free-text rejection reasons) from human-authored governance fields.

> * **The Inefficacy of Decorative Strings:** Writing a key-value pair like "supervised\_signoff": "art\_director" provides zero actual audit security, as any automated agent or script editing the file can write that string.  
> * **Branch Protection Integration:** Promoting a candidate take to production requires a cryptographic sign-off or an Art Director's pull request merge under strict branch protection.  
> * **API-Sourced Reality:** The approving user identity and the PR number are read directly from the GitHub API by the host system. The automated agent is structurally forbidden from authoring or modifying these protected approval fields.  
> * **System-Driven Timestamps:** Temporal metadata, such as the approved\_at timestamp, is generated directly by the host system clock during the merge event. It is never populated by the text output of a generative model.

---

*User prompt: {{FOCUS: 3\. Kinetic Physics Parameterization (animation\_hints) (series-assets-visual)}} /extreme-details*

Response: Within \[series-assets-visual\], animation\_hints acts as a set of dynamic scalar parameters injected into the character manifest to encode physical weight, biological mass, and psychological states directly into numeric constants. This architecture specifically eliminates the "mechanical metronome" defect inherent to programmatic 2D puppet systems, where every character defaults to bobbing, bouncing, and reacting using the exact same hardcoded sine-wave math.

By storing these motion physics overrides inside the manifest.json contract, the visual repository allows a single generic presentation component (such as GoblinPuppet.tsx) to express completely different temperaments and physical weights for distinct actors without hardcoding unique animation logic per character.

**talk\_bounce\_amplitude (Physical Mass & Authority)**

> * This parameter controls the vertical pixel displacement applied to the character sprite during active speech frames.  
> * The displacement is driven by the mathematical function: Δ*y*\=sin(frame×*ω*)×amplitude.  
> * Bulky, authoritative characters (e.g., Wart) are assigned a low amplitude of 4, which produces a heavy, grounded rumble.  
> * Erratic, twitchy characters (e.g., Spleen) are assigned a high amplitude of 20, generating an exaggerated, frenetic bounce that accentuates nervousness.  
> * This parameter couples directly with the compositor's dynamic contact shadow engine; as the character recoils vertically during speech (tracked via talk\_bounce\_amplitude), the elliptical ground shadow scales down in size and drops in opacity from 0.65 to 0.40, granting the character tactile weight and lift.

**idle\_shiver\_amplitude (Somatic State Injection)**

> * This parameter controls high-frequency per-frame micro-displacement.  
> * It injects physical trauma or acute emotional distress into the puppet mechanically, applying deterministic pseudo-random jitter without requiring the art team to illustrate distinct shivering sprite files for every frame.  
> * When a character acquires the terrified condition, or suffers from systemic physical ailments like industrial dust exposure and neuropathy, the asset manifest elevates the idle\_shiver\_amplitude constant to 14\.

---

*User prompt: {{FOCUS: 5\. Downstream Ingestion Boundaries & Storage Ceilings (series-assets-visual), The Zero-Byte Poison Trap (series-assets-visual)}} /extreme-details*

Response: The downstream ingestion pipeline and storage ceiling architecture of \[series-assets-visual\] forms the critical mechanical bridge between the centralized, multi-gigabyte master visual vault and the downstream rendering nodes (such as \[series-viewport-template\] and \[series-episodes\]).

Because generative animation pipelines deal with massive binary payloads—including raw layered master PSDs, high-resolution environmental mattes, and unpruned emotion candidate banks—allowing downstream compositors to indiscriminately clone or glob the master asset tree leads to catastrophic disk thrashing, CI/CD timeouts, and out-of-memory (OOM) rendering crashes. Furthermore, because non-deterministic GPU kernel execution prevents bit-identical re-synthesis of generated media from seeds alone, these physical artifacts are archive-dependent, requiring highly disciplined storage management.

To solve this, the pipeline enforces an isolated, AST-driven harvesting model backed by strict cryptographic integrity tripwires (the Zero-Byte Poison Trap) and non-negotiable physical storage budgets.

### **1\. Tagged Shallow Synchronization (sync-assets.ts)**

Standard Git submodules present severe operational liabilities in automated production pipelines: they introduce detached HEAD ambiguities, complicate CI/CD credential inheritance, and default to cloning deep Git histories containing gigabytes of obsolete binary iterations.

The studio toolchain replaces submodules with a dedicated synchronization harness: scripts/sync-assets.ts.

#### **The Decoupled Version Lock (versions.json)**

Downstream compositors are structurally forbidden from tracking the default branch (main or trunk) of the asset repository. The build environment reads an immutable version lockfile (versions.json) that pins the precise visual tag required to satisfy the episode's AST.

If \[series-assets-visual\] is updated upstream with new emotion variants, downstream compositing compositions remain securely anchored to v1.4.0 until a deliberate lockfile upgrade PR is merged, preventing mid-render visual drift.

#### **The Blobless LFS Ingestion**

The synchronization script uses tree-filtering and sparse Git LFS fetching to ingest only the tip objects referenced by the locked commit, bypassing the full Git history:

git clone \\  
  \--depth 1 \\  
  \--branch v1.4.0 \\  
  \--filter=blob:none \\  
  \--no-checkout \\  
  https://github.com/studio/\[series\]-assets-visual.git \\  
  ./cache/assets-visual/

### **2\. AST Dependency Harvesting (collect-episode-assets.ts)**

A full series visual repository contains hundreds of emotional takes and high-resolution plates that easily exceed tens of gigabytes. Stamping this entire corpus into an individual episode container (\[series-episodes\]/epXXX) would break Docker daemon overlays and drastically inflate build times.

The pipeline solves this via **Abstract Syntax Tree (AST) Dependency Harvesting**. The compiler runs scripts/collect-episode-assets.ts as a build-time pre-pass, parsing the validated narrative intermediate representation (dialogue\_ast.json) emitted upstream by the semantic simulation core.

#### **The Pruning Algorithm**

> 1. **Location Plate Extraction:** The harvester crawls the AST for the active location\_id, reads the environment's manifest.json, and stages only the exact matte plate required for the scene.  
> 2. **Character Sprite Targeting:** For every dialogue round in the AST, the script resolves the active speaker, reads their manifest.json, and stages the base neutral pose (base\_states.idle). It then looks up the precise emotional variant declared in the AST node (e.g., "emotion": "terrified"). If the variant is explicitly marked null, it safely falls back to the idle pose.  
> 3. **Phoneme Harvest:** The harvester crawls the audio sync cue stream and copies *only* the specific Preston Blair mouth shapes referenced in that specific character's spoken lines.

**Efficiency Gain:** By cherry-picking only the 10–20 active sprites and plates referenced in the script, the local asset footprint is reduced by over 90% (e.g., condensing a 2.4 GB vault down to a 28 MB payload), preventing network saturation during headless rendering.

### **3\. The Strict Storage Envelope (Fail-Fast Economics)**

The compilation of an episode operates under the **Fail-Fast Economic QA Hierarchy (*T*0​→*T*5​)**. Because rendering costs scale exponentially (incurring cloud GPU and execution billing), defects must be caught at the earliest possible stage.

Catching an invalid asset at the in-memory AST gate (*T*0​) costs exactly **\$0.00**. Allowing an oversized asset payload to reach cloud GPU diffusion (*T*3​) or broadcast delivery (*T*5​) results in severe compute waste.

#### **The Envelope Gate**

Immediately following the harvest, the compiler evaluates the local staging directory (/epXXX/public/assets/).

> * **Target Budget:** \<100 MB (Nominal Green Light).  
> * **Hard Maximum Ceiling:** 150 MB.

If the harvested directory exceeds 150 MB (typically caused by the collection logic accidentally pulling in an entire unpruned emotion bank rather than the specific referenced poses), the compiler intentionally halts execution with exit code 1 at *T*0​, stopping the pipeline before spinning up costly headless Chromium renderers.

### **4\. The Zero-Byte Poison Trap (Cryptographic Sentinel)**

A recurring failure mode in distributed Git LFS and cloud-storage asset pipelines is the **Silent Truncation Defect**.

> 1. A runner lacking proper LFS hooks downloads 130-byte text pointer files instead of hydrated PNG binaries.  
> 2. A network interruption terminates an HTTP stream prematurely, writing a zero-byte file to the staging folder.  
> 3. When a headless Chromium rendering engine encounters these corrupted inputs inside a \<canvas\> context, it throws an unhandled decoding error or hangs the rendering thread, generating hundreds of black frames while burning compute hours.

To eliminate this vulnerability, the ingestion pipeline implements the **Zero-Byte Poison Sentinel**.

Before authorizing the render, the pipeline computes the cryptographic SHA-256 digest of every staged binary. It tests this digest against the mathematical constant for an empty file:

SHA-256empty​\=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

If any file matches this hash—or if its byte length falls below a minimum size threshold (e.g., \<1,024 bytes for image plates or audio stems)—the sentinel triggers a fatal build halt (CORRUPTED\_ZERO\_BYTE\_ASSET). This hard gate guarantees that only fully verified, hydrated binaries reach the Remotion execution context.

### **5\. Tree-Hash Staleness Verification**

To enforce the Cartesian boundary between Meaning (Axis A) and Representation (Axis B), visual pipelines must never render assets that are out-of-sync with canonical narrative law.

The pipeline enforces this via a rigid Git tree-hash check.

> 1. During upstream narrative compilation (worker-sower-engine), the system calculates the Git tree SHA of the active visual assets and bakes it into compiled/bible-state.json.  
> 2. During downstream episode assembly, the conductor compares this expected hash against the live Git tree SHA of the /characters/ folder in the fetched \[series-assets-visual\] vault.

If the hashes diverge, it proves that a visual update has been committed without a corresponding recompilation of the narrative simulation. The build halts immediately with a CANON\_STALE exception, preventing the episode from rendering an unauthorized or un-audited visual state.

---

*User prompt: {{FOCUS:  3\. Pod Governance & The Division of Sovereignty (series-assets-visual), 4\. Technical Architecture, Storage Tiers, & Binary Maintenance (series-assets-visual), 3-2-1 Preservation & The Rolling Range Cursor Scrubber (series-assets-visual) }}*

### **Response: 1\. Pod Governance & The Division of Sovereignty**

The governance of \[series-assets-visual\] operates under a strictly enforced separation of powers across the studio's 23-Pod macro-node architecture. To prevent the catastrophic blending of raw generative outputs with production-certified canon, authority is partitioned so that no single unit can autonomously create, certify, and consume an asset without cross-pod validation.

> * **POD-07 (Foundation Pod / The Asset Forge):** Operates within the Blueprint macro-node and serves as the absolute artistic legislature for visual language. POD-07 publishes the locked, versioned asset registry—including character LoRAs, aesthetic embeddings, and hand-painted master mattes. Their mandate is to produce the *ingredients* of the show, not the final rendered frames. They do not fix visual defects in downstream outputs, nor do they freeze the technical Python environments used to train their assets.  
> * **POD-06 (Data Ops & Model Lifecycle):** Operates within the Studio Firewall macro-node as the technical custodian. While POD-07 evaluates aesthetic intent, POD-06 certifies the technical reproducibility of the models and tooling, manages R2 storage tiering, and enforces the mandatory 14-day pruning rule for raw intermediate latents.  
> * **POD-01 (Legal, Provenance & Clearance):** Acts as the clean-room compliance node. It conducts algorithmic copyright audits, issues C2PA provenance manifests, and signs clean-room certificates for training sets before any LoRA is admitted to the active registry. Downstream pods are structurally forbidden from building against an asset lacking this cryptographic clearance.  
> * **POD-15 (Scene Pods / Generative Execution Nodes):** Sit within the Generative Core macro-node. They act as untrusted downstream consumers tasked with rendering final footage based entirely on POD-07's published LoRAs and POD-08's locked scripts. Scene Pods are strictly forbidden from training their own variant assets or diverging from the locked registry, even if an animator believes a slight visual deviation would benefit a scene.  
> * **POD-13 (Polish Pod):** Operates as the continuity cleanup and artifact remediation unit. If a Scene Pod generates a plate with six fingers or temporal flickering, POD-13 executes surgical ControlNet inpainting to repair the defect, but is mathematically constrained to stay visually consistent with POD-07's locked character designs.

### **2\. Technical Architecture, Storage Tiers, & Binary Maintenance**

Under the studio's **Expanded Deletion Principle**, media assets are fundamentally different from narrative code. While the narrative ledger (Class 1\) is fully derivable and the event log (Class 2\) is a reproducible sequence, rendered visual assets belong to **Class 3 Durability: Archive-Dependent Evidence**.

Because high-fidelity generative diffusion plates, intermediate alphas, and neural stems cannot be regenerated bit-for-bit from a mathematical seed—due to variations in GPU drivers, sampler non-determinism, and floating-point rounding across CUDA versions—these files are treated as irreplaceable historical evidence.

To sustain this, the storage topology is structured across three distinct operational tiers:

| Storage Tier | Physical Substrate | Asset Scope | Operational Role |
| :---- | :---- | :---- | :---- |
| **Tier 1: Source & Working Archive** | Local NVMe flash storage on execution hardware (Rig 1). | dialogue\_ast.json, transient frame buffers, uncompressed audio stems, and baked Episode\_XXX.tsx files. | High-IOPS ephemeral staging for active compilation and composition operations before broadcast encoding. |
| **Tier 2: Warm Object Vault** | Cloudflare R2 Content-Addressed Storage (CAS). | Promoted character base states, condition variants, master matte plates, and C2PA provenance sidecars. | Read-through caching layer allowing parallel headless worker pools to ingest heavy binaries without egress penalties. |
| **Tier 3: Cold Sovereign Archive** | AWS Glacier or Backblaze B2 with WORM (Write-Once-Read-Many) Object Locks. | High-fidelity mezzanine masters (ProRes 4444, discrete M\&E stems), broadcast derivatives, and immutable render manifests. | Geographically isolated preservation vault providing vendor-independent disaster recovery. |

#### **Cryptographic Provenance & The Errata Protocol**

Because updating an image in place destroys its content-addressed identifier, \[series-assets-visual\] enforces an **Append-Only Errata Protocol**. Every promoted asset carries an immutable manifest.json sidecar detailing its parent seed, container digest, and the precise neural checkpoint hashes used to synthesize it. If a canonical error is discovered post-broadcast, the legacy media and manifests are never deleted or overwritten. Instead, the canon is patched via Git (yielding a new *Hroot*​), an ErrataRecord is appended to lore/errata.json, and the revised remaster pipeline produces a wholly new content-addressed file—preserving both the original broadcast mistake and the corrected edition side-by-side in cold storage.

### **3\. 3-2-1 Preservation & The Rolling Range Cursor Scrubber**

Maintaining petabytes of generative exhaust presents a severe financial and operational liability. The studio executes its long-term archival obligations through a rigorous hybrid of physical hardware separation, aggressive retention boundaries, and deterministic bit-rot auditing.

#### **The 3-2-1 Backup Enforcement**

The visual pipeline satisfies the industry-standard 3-2-1 mandate through explicit vendor decoupling:

> * **3 Copies:** Live working storage on Rig 1, warm storage in Cloudflare R2, and deep cold storage in AWS Glacier/B2.  
> * **2 Media Types:** High-speed local NVMe flash filesystems paired with remote cloud object stores.  
> * **1 Offsite Replica:** The secondary cloud provider operates under strict geographic isolation and immutable object-locking, ensuring that a single vendor's account termination or systemic failure cannot destroy the series.

#### **Differentiated Storage Expiration**

To prevent unconstrained budget hemorrhage, storage retention policies distinguish between permanent canon and iterative waste:

> * **Permanent Retention:** Promoted canonical shots, locked condition variants, and approved broadcast masters are preserved forever.  
> * **14-Day Expiration TTL:** Unpromoted emotion candidates, rejected generation takes, temporary staging keys, and intermediate diffusion greenscreen passes are automatically purged after 14 days by bucket lifecycle policies.

#### **The Rolling Range Cursor Scrubber**

Simple random sampling is mathematically insufficient for detecting silent bit rot in vast media archives. Sampling 5% of assets at random with replacement leaves approximately 36.8% of the total archive unchecked over a 20-week cycle due to the *e*−1 statistical limit. Instead, a background scrubber daemon utilizes a deterministic, hash-ordered cursor that sweeps through 100% of the archived objects every 30 days, re-computing their SHA-256 digests against their provenance manifests to catch silent data corruption at the block level.

#### **The 15th-of-the-Month Cold Restore Drills**

A backup is operationally meaningless until a restore is proven. On the 15th of every month, an automated CI worker performs a full disaster-recovery simulation:

> 1. The worker restores an entire historical episode assembly purely from cold-storage raw R2 bytes into a sandboxed, isolated environment.  
> 2. It re-compiles the Remotion React composition completely from scratch.  
> 3. Rather than merely confirming that the resulting video "plays back cleanly," the drill computes the cryptographic hash of every single output artifact and asserts that they perfectly match the digests locked in the episode's original render\_manifest.json. A single hash mismatch triggers a critical infrastructure failure alert, proving the archive's absolute functional integrity.

---

*User prompt: {{FOCUS:  1\. The Authoritative Schema Specification (series-assets-visual), 2\. Spatial Invariants & Coordinate Mathematics (series-assets-visual) }} /extreme-details*

## **Response: 1\. The Authoritative Schema Specification (\[series-assets-visual\])**

The downstream compositor treats character assets as typed APIs defined by spatial invariants rather than loose image files. To eliminate implicit accumulated state, every asset must expose explicit coordinates, content hashes, and schema versions. Every emotion and condition variant exports a structured manifest.json.

### **The manifest.json Contract Structure**

> * **Asset Identity & Provenance:** The manifest includes the \$schema version, character\_id, specific variant (e.g., "humiliated"), the source\_file path, and a content\_hash (e.g., sha256:7f83...).  
> * **Cryptographic Human Sign-Off:** The approval block binds the asset to human governance, tracking the pull\_request\_number, approved\_by\_user, and commit\_sha.  
> * **Coordinate Extraction Authority:** Spatial coordinates must not be estimated by asking a multimodal vision-language model to guess pixel numbers.  
> * **Layered Assets Extraction:** For layered digital assets, coordinates are exported directly from authoring software layers (e.g., Photoshop or Krita layer bounds for the mouth viseme slot and ground baseline).  
> * **Flattened Plate Extraction:** For flattened diffusion plates, coordinates are extracted using deterministic computer vision algorithms. The ground\_contact\_point is computed by scanning the alpha channel for the lowest cluster of opaque pixels, while the mouth\_bounding\_box is located via template matching against the base neutral sprite.  
> * **Semantic VLM Boundary:** The Vision-Language Model is reserved strictly for semantic confirmation (e.g., verifying that the character actually reads as "humiliated" rather than generic "sad").

### **The Explicit Null Fallback Protocol**

Art production often lags behind script generation. To prevent pipeline crashes while maintaining strict production gates, the schema utilizes an explicit fallback architecture.

> * **Explicit Declaration:** Missing or un-illustrated variants must be committed in manifest.json as explicit null (e.g., "terrified": null) rather than being omitted as missing keys. This indicates an acknowledged production gap rather than a forgotten file.  
> * **Draft & Animatic Fallback:** During animatic rendering, when a scene AST references a variant marked null, the compiler logs a non-blocking WARN, substitutes base\_states.idle.file, and inherits the base anchor\_point, allowing the build to proceed.  
> * **Fail-Loud Release Gate:** Broadcast builds enforce zero tolerance, requiring ∀shot∈Episode,referenced\_variant(shot)=null. If an un-illustrated variant is encountered during final mastering, the compiler aborts with exit code 1 unless an authorized, cryptographically signed sign-off waiver is committed to the task record.

## **2\. Spatial Invariants & Coordinate Mathematics (\[series-assets-visual\])**

Spatial invariants map raw 2D pixel layouts into reproducible, deterministic geometric anchors that the Remotion video composition engine (Episode\_XXX.tsx) can interpolate at runtime.

### **Core Spatial Anchors**

> * **Ground Contact Pivots (anchor\_point):** Precise coordinate pairs (e.g., { x: 518, y: 980 }) defining the lowest central point of foot contact. The Remotion puppet wrapper uses this point to anchor characters to the stage horizon (*Y*ground​) across distinct art takes, ensuring characters do not float or slide across backgrounds during horizontal camera tracking.  
> * **Camera Focus Targets (crash\_zoom\_target):** Explicit coordinate targets (e.g., { x: 412, y: 198 }) centered on the character's facial centroid or eye line. Programmatic push-in cameras invert these coordinates to calculate exact CSS transformOrigin percentages, guaranteeing close-ups frame facial expressions properly regardless of character height.  
> * **Mouth Viseme Envelopes (mouth\_bounding\_box):** Explicit rectangles (e.g., { x: 380, y: 240, width: 64, height: 32 }) defining the exact placement window where modular viseme overlays (closed, small, medium, wide) snap onto the base cutout sprite.  
> * **Motion Physics Overrides (animation\_hints):** Dynamic parameters consumed by the generic GoblinPuppet.tsx component to impart physical weight and emotional temperament to character movement without hardcoding unique animation logic per actor. Properties include talk\_bounce\_amplitude, idle\_shiver\_amplitude, mass\_scalar, bounce\_frequency\_hz, and idle\_sway\_amplitude\_px.

### **Normalization Math and the Decapitation Defect**

A critical failure mode in automated animation is the "Decapitation Defect," which occurs when local sprite coordinates are applied directly to global composition canvases without accounting for scaling and layout translation. To achieve deterministic camera transforms without runtime performance overhead, the compiler maps coordinates at generation time.

> 1. **Stage Placement Translation:** The puppet is first aligned to the background ground plane using its anchor point.  
>    TranslateX=*X*stage​−anchor.x,TranslateY=*Y*ground​−anchor.y  
> 2. **Global Percentage Projection:** Camera zoom transforms require normalized transformOrigin percentages relative to the master canvas dimensions (1920×1080). The local target is projected through the active puppet scaling factor (*s*).  
>    originXglobal​\=canvas.widthpuppet.x+(crash\_zoom\_target.x×*s*)​×100%  
>    originYglobal​\=canvas.heightpuppet.y+(crash\_zoom\_target.y×*s*)​×100%  
>    For example, converting a local coordinate {*x*:412,*y*:198} on a 1024×1024 canvas translates to OriginX=1024412​×100%=40.23% and OriginY=1024198​×100%=19.33% before global projection.  
> 3. **Static Literal Inlining:** The resolved percentages are injected directly into the camera wrapper's inline JSX props (e.g., \<Shot01CameraWrapper originX="48.2%" originY="21.4%"\>). This exact literal inlining allows Remotion’s interpolate() to compute camera moves cleanly without runtime layout lookups.

---

*User prompt: {{FOCUS:  4\. The Explicit Null Protocol & State Taxonomy (series-assets-visual), 5\. Autonomous Optical Extraction Loop & CV Gauntlets (series-assets-visual), 6\. Defect Routing & Closed-Loop QA (series-assets-visual) }} /extreme-details*

## **Response: 4\. The Explicit Null Protocol & State Taxonomy**

In generative production environments, scriptwriting and dialogue generation frequently outpace the completion of visual assets. To prevent un-illustrated emotional states from crashing automated compilation pipelines while simultaneously protecting the final broadcast master from missing frames, the visual asset repository enforces the **Explicit Null Protocol**.

> * **The Contract of Intentional Absence:** Missing emotional variants are never silently omitted from the schema, as missing keys cannot be distinguished from parsing defects. Instead, un-illustrated states are committed as explicit nulls within the asset manifest (e.g., "terrified": null).  
> * **The Closed Status Taxonomy:** The pipeline categorizes the lifecycle of every asset into a strict taxonomy to govern pipeline behavior: Status∈{UNKNOWN,EXPECTED,MISSING,INTENTIONALLY\_ABSENT,INVALID,VALID,WAIVED,LOCKED,SUPERSEDED}. An explicit null maps directly to INTENTIONALLY\_ABSENT.  
> * **Draft Resolution (Animatic Fallback):** During internal rendering runs or animatic drafts, if the compiler encounters a null variant, it logs a non-fatal warning, safely substitutes base\_states.idle.file, and inherits the base anchor coordinates to allow the build to proceed seamlessly.  
> * **The Fail-Loud Release Gate:** Broadcast mastering builds operate on a zero-tolerance policy. The pipeline evaluates the rule ∀shot∈Episode,referenced\_variant(shot)=null. If any shot references an un-illustrated null variant, the episode cannot merge to the main branch or clear final mastering.  
> * **The Waiver Ledger:** The only mechanism to bypass a fail-loud gate for a missing asset is for a showrunner to commit an explicitly authorized waiver to the release ledger.

## **5\. Autonomous Optical Extraction Loop & CV Gauntlets**

To transform raw raster outputs into a machine-computable spatial contract, the visual asset pipeline utilizes a multi-tiered inspection gauntlet that strips generative models of their subjective aesthetic authority, replacing it with objective pixel mathematics and grounded trace validations.

### **Tier 2: Deterministic Geometric & Boundary Gates**

Before neural evaluation begins, deterministic computer vision evaluates the asset:

> * **Alpha Edge Purity:** The pipeline scans the outer 3-pixel contour of the keyed character silhouette. The 99th-percentile green channel spill must measure \<12 to prevent chroma-key fringing.  
> * **Viseme Anchor Drift:** The system measures the distance between the character's facial mouth anchor and the generated viseme layer. If the offset exceeds 4 pixels (∣mouth\_center−viseme∣\>4px), the asset flags a geometric anomaly.  
> * **Silhouette Redaction Test:** The visual plate is stripped down to a pure two-tone binary alpha mask. A classifier evaluates the character purely on posture and silhouette asymmetry; the outline must register an identity classification entropy of *H*\<0.15.

### **Tier 3: Panopticon Vision & The \<visual\_scan\_trace\>**

When adversarial triage requires a multimodal Vision-Language Model (VLM), the pipeline mitigates VLM hallucination through forced optical grounding. Jules (the coding agent) is structurally forbidden from emitting an immediate JSON verdict.

> * **Mandatory Attention Grounding:** The model must emit an explicit \<visual\_scan\_trace\> that pinpoints exact pixel coordinates for eyeline centroids, mouth bounding boxes, and primary prop contours.  
> * **Physical Verification:** The trace mandates a comparison of pixel luminance and line sharpness against the golden baseline, and requires an explicit scan for anachronistic surface materials (e.g., modern zippers, synthetic dyes, unmapped plastics). By forcing the model to articulate that a character holds a "metallic pocket knife" in the trace, it structurally prevents the VLM from lazily hallucinating a "cell phone" in its final verdict.  
> * **The Severity Matrix:** Jules applies a strict jurisprudence matrix based on the trace. Severity 1 (Nitpick: sub-pixel raster misalignment) and Severity 2 (Friction: soft color temperature drift) result in warnings. Severity 3 (Violation: somatic breach) triggers a test failure, while Severity 4 (Heresy: banned world elements) executes a hard pipeline halt.

## **6\. Defect Routing & Closed-Loop QA**

When the pipeline renders a candidate video, it triggers an automated, adversarial quality assurance harness that identifies defects, routes them by root cause, and executes targeted, localized repairs without burning unnecessary cloud compute.

### **Kinematically Directed Frame Sampling**

Uniform frame sampling creates blind spots where transient 2-frame viseme pops or off-by-one edge flashes slip through. The QA engine utilizes kinematically directed sampling to focus inspections purely on frames exhibiting high visual volatility.

> * It calculates the volatility curve *Vt*​ using a Mean Absolute Difference (MAD) luminance proxy and optical flow vectors: *Vt*​\=ΔLPIPS​(*Ft*​,*Ft*\+1​)+∥*v*RAFT​∥.  
> * Audits are executed exclusively at the local mathematical maxima of *Vt*​ (fast cuts, crash zooms), the first and last frames (*F*0​, *F*end​), and the exact phonetic centroids of spoken dialogue.

### **Diagnostic Remediation Tickets & Defect Routing**

When a geometric failure is detected, the QA critic emits a structured JSON ticket stripped of subjective language (e.g., "looks strange"), instead supplying exact coordinate arithmetic: {"prop\_target": "mouthBoundingBox.y", "suggested\_patch\_delta": 24}.

> * **ASSET\_ERROR:** If the JSX properties in Episode\_XXX.tsx match the manifest coordinates but the visual render drifts \>4px, the underlying source art atlas is defective. The ticket routes back to the art foundation team; code agents are strictly barred from injecting arbitrary JSX offsets to hide bad art.  
> * **CODE\_ERROR:** If the JSX property deviates from the approved manifest, it is a code-generation bug routed to the automated Jules coding agent.

### **Minimal Enclosing Unit (MEU) Surgical Patching**

Full-scene re-renders induce non-deterministic drift across unaffected elements.

> * **AST Code Patching:** For a CODE\_ERROR, Jules uses the TypeScript Compiler API (ts-morph) to mutate only the failing JSX attribute in-place. It then performs a local verification render of just the affected frame slice (e.g., 36 frames) using software rasterization (--gl=swangle) on the local CPU, confirming the fix for \$0.00 in cloud GPU spend.  
> * **Spatio-Temporal Image Patching:** For visual defects, the pipeline generates a Spatio-Temporal MEU tube—a 2D spatial bounding box padded with a ±6 frame temporal crossfade. It targets an ephemeral ComfyUI inpainting workflow strictly inside this envelope with denoising clamped between 0.35 and 0.45 to repair the defect while preserving underlying motion vectors.

### **The Three-Cycle Circuit Breaker**

To prevent self-healing agents from getting trapped in infinite oscillation loops (e.g., fixing mouth alignment but breaking safe-zone framing), the pipeline enforces a hard circuit breaker.

> * The system tracks defect convergence vs. divergence. An isolated shot is granted a maximum of three automated repair cycles (*N*\=3).  
> * If the defect triggers a different invariant category on retry (divergence), or if it fails three consecutive times, the loop aborts.  
> * The system executes an atomic git hard rollback, locks the local isolate, categorizes the failure, applies the \#ESCALATED\_REVISION\_CEILING\_BREACHED tag, and routes the diff to the Lead Architect.

---

*User prompt: {{FOCUS:  5\. Promotion Cascades & Pointer Indirection (series-assets-visual), 6\. The Explicit Null Protocol & The Waiver Ledger (series-assets-visual) }} /extreme-details*

Response: The governance and operational sovereignty of **\[series-assets-visual\]** is distributed across distinct studio pods to enforce a strict Cartesian boundary between Meaning (Axis A) and Representation (Axis B). A fundamental rule governs this architecture: **no single unit can autonomously create, certify, and consume an asset without cross-pod validation**.

### **1\. Pod Governance & The Division of Sovereignty**

Generative models—whether LLMs, TTS vocoders, or diffusion models—are classified structurally as **untrusted, headless rendering workers** possessing zero narrative, temporal, or spatial authority. To maintain this untrusted status, authority is strictly compartmentalized:

> * **POD-07 (Foundation Pod / The Asset Forge):** The artistic legislature. POD-07 owns the visual language and publishes the locked, versioned asset registry (e.g., character LoRAs, master mattes, aesthetic embeddings). Crucially, POD-07 produces the *ingredients* of the show, not the final rendered frames. They do not fix visual defects in downstream outputs or freeze Python technical environments.  
> * **POD-06 (Data Ops & Model Lifecycle):** The technical custodian. While POD-07 evaluates aesthetic intent, POD-06 certifies the technical reproducibility of the models, locks Python dependency trees, manages R2 storage tiering, and enforces the mandatory 14-day expiration TTL on unpromoted raw latents.  
> * **POD-01 (Legal, Provenance & Clearance):** The clean-room compliance node. Before any model enters the active registry, POD-01 conducts algorithmic copyright audits, issues C2PA provenance manifests, and signs clean-room certificates for training sets. Downstream pods are structurally forbidden from building against assets lacking this cryptographic clearance.  
> * **POD-15 (Scene Pods / Downstream Viewports):** The downstream execution consumers. Scene Pods render final footage based *entirely* on POD-07's published LoRAs and locked manifests. They are strictly forbidden from training variant assets, modifying local sprites, or diverging from the locked registry, even if an animator believes a slight visual deviation would benefit a scene.  
> * **POD-13 (Polish Pod):** The continuity cleanup unit. If a Scene Pod generates a plate with six fingers or temporal flickering, POD-13 executes surgical Minimal Enclosing Unit (MEU) Spatio-Temporal inpainting. However, they are mathematically constrained to stay visually consistent with POD-07's locked character designs.

### **2\. Technical Architecture, Storage Tiers, & Binary Maintenance**

The storage architecture is heavily informed by the **Expanded Deletion Principle** and the **Media Asymmetry Principle**.

#### **Class 3 Durability: Archive-Dependent Evidence**

While the relational narrative ledger (Class 1\) and the event log (Class 2\) are fully derivable (e.g., *Sn*​\=fold(apply,*S*0​,\[*E*1​…*En*​\])), rendered visual assets belong to **Class 3 Durability**. Generative media cannot be deterministically re-synthesized bit-for-bit from mathematical seeds due to CUDA kernel variance, sampler non-determinism, and floating-point rounding across GPU architectures. Because diffusion media is not bit-reproducible, it must be treated as irreplaceable physical evidence and stored in Content-Addressed Storage (CAS).

#### **Tri-Tier Storage Topology**

> 1. **Tier 1 (Hot Scratchpad):** Local NVMe flash on execution hardware (Rig 1). Ephemeral staging for the harvested \<150MB episode sandbox, uncompressed audio stems, and Chromium frame buffers. Purged automatically post-render.  
> 2. **Tier 2 (Warm Sync Vault):** Cloudflare R2 Content-Addressed Storage. Holds promoted condition variants, master matte plates, and C2PA manifests. Serves as a read-through cache with zero egress billing, allowing parallel worker nodes to pull assets dynamically.  
> 3. **Tier 3 (Cold Sovereign Archive):** AWS Glacier or Backblaze B2 WORM (Write-Once-Read-Many) storage. Geographically isolated, immutable preservation of broadcast master MP4s and locked render\_manifest.json artifacts.

#### **Cryptographic Provenance & The Append-Only Errata Protocol**

Because updating an image in place destroys its content-addressed identifier, the studio relies on an **Append-Only Errata Protocol** for retroactive continuity fixes. If an error is discovered in canon (e.g., a spelling typo in a dossier) that has already been rendered into broadcast media:

> 1. **Immutable Preservation:** Legacy .mp4 artifacts and their sidecar manifests remain untouched and byte-identical in cold storage.  
> 2. **Canon Patch:** The Markdown dossier is corrected via Git commit, establishing a new canonical root hash (*H*root​).  
> 3. **Errata Ledger:** An ErrataRecord is appended to lore/errata.json, referencing the affected artifact hashes and superseded commit SHAs.  
> 4. **Remaster Generation:** The compilation pipeline executes a new render under the revised commit hash, producing a completely new content-addressed file.

### **3\. 3-2-1 Preservation & The Rolling Range Cursor Scrubber**

Maintaining petabytes of generative exhaust presents a massive financial and operational liability. The visual pipeline enforces industry-standard 3-2-1 backup policies:

> * **3 Copies:** Live working NVMe cache, warm Cloudflare R2 CAS, and deep cold WORM storage.  
> * **2 Media Types:** High-speed local NVMe flash arrays paired with remote cloud object stores.  
> * **1 Offsite Replica:** A secondary cloud provider under strict geographic isolation and object-locking rules, ensuring a single vendor's account failure cannot destroy the series.

#### **Differentiated Expiration Lifecycles**

> * **Permanent Retention:** Promoted canonical shots, locked manifests, and broadcast master artifacts are preserved forever.  
> * **14-Day TTL:** Unpromoted emotion candidates, intermediate diffusion greenscreen passes, and staging keys are automatically purged by bucket lifecycle policies after 14 days.

#### **The Rolling Range Cursor Scrubber**

Simple random sampling is mathematically flawed for detecting silent bit rot; sampling 5% of assets randomly leaves approximately 36.8% of the archive unchecked over a 20-week cycle due to the *e*−1 statistical limit. Instead, a background scrubber daemon utilizes a deterministic, hash-ordered cursor that sweeps through **100% of the archived objects every 30 days**, re-computing their SHA-256 digests against their provenance manifests to catch block-level corruption.

#### **15th-of-the-Month Cold Restore Drills**

A backup is operationally meaningless until a restore is proven. On the 15th of every month, an automated CI worker executes a full disaster-recovery simulation:

> 1. Restores an entire historical episode purely from cold-storage R2 bytes into an isolated sandboxed environment.  
> 2. Re-compiles the Remotion React composition completely from scratch.  
> 3. Computes the cryptographic hash of every output artifact and asserts that they match the digests locked in the original render\_manifest.json. A single hash mismatch triggers a critical infrastructure failure alert, confirming the archive's absolute functional integrity.

---

*User prompt: {{FOCUS:  1\. Tagged Shallow Synchronization (sync-assets.ts) (series-assets-visual), 2\. AST Dependency Harvesting (collect-episode-assets.ts) (series-assets-visual) }} /extreme-details*

### **Response: 1\. Tagged Shallow Synchronization (sync-assets.ts)**

The studio toolchain bypasses the operational friction and historical bloat of standard Git submodules by utilizing a dedicated synchronization harness named sync-assets.ts. Traditional submodules easily trigger detached HEAD ambiguities and clone deep histories containing gigabytes of obsolete binary iterations.

Instead, the synchronization script executes shallow clones (--depth 1\) to pull explicitly pinned versions of the visual asset repository directly into public/assets/visual/.

The synchronization targets rely on strict pinning strategies rather than tracking a mutable default branch:

> * **Floating Tags (latest-stable):** Points to the most recently verified asset set, used primarily for daily local builds and iterative animatic drafts.  
> * **Permanent Semver Tags (e.g., v1.4.0):** Fixed Git tags or commit SHAs that lock historical episode builds to a specific, immutable state.

By freezing upstream Git hashes and binary digests, sync-assets.ts ensures that the episode acts as a permanent, executable software release that remains mathematically tied to its upstream inputs.

### **2\. AST Dependency Harvesting (collect-episode-assets.ts)**

Global asset repositories contain complete character emotion banks (e.g., 48 emotions for Bog, 52 for Spleen), alternative poses, and high-resolution background plates that easily exceed tens of gigabytes. Copying this entire library into every stamped episode workspace would create a catastrophic "Multi-Episode Redundancy Problem," where copying 4 active characters creates 200–600 MB of unpruned data per episode, ballooning to 4–12 GB of pure redundancy across a 20-episode season.

To enforce strict storage ceilings and prevent CI/CD pipeline bloat, collect-episode-assets.ts executes an intelligent, AST-driven dependency crawl during compilation.

#### **The Harvester Mechanics**

The extraction script uses the validated narrative intermediate representation (dialogue\_ast.json) to execute a targeted cherry-picking pass:

> 1. **Parse the Scene AST:** It reads the locked scene AST to identify exactly which characters speak and the specific emotional conditions they exhibit in the episode.  
> 2. **Extract the Manifests:** For each identified character, it loads their corresponding manifest.json.  
> 3. **Cherry-Pick Variants:** The script copies *only* the explicit emotion and facing combination required (e.g., pulling bog\_humiliated.png and bog\_idle.png while ignoring the other 46 unused states). If an emotion is explicitly un-illustrated, it respects the fallback-to-idle protocol.  
> 4. **Extract Visemes:** It scans the spoken lines' viseme timeline cues and stages only the required Preston Blair mouth shapes (e.g., closed, small, medium, wide) directly referenced by the audio.  
> 5. **Extract Mattes:** It reads the location\_manifest and stages the specific background matte (e.g., swamp\_relay\_matte.png).

#### **The Pruned Storage Envelope**

By copying just the 10–20 required files, the harvester achieves a \~90% storage reduction.

> * **Realized Workspace Size:** The asset footprint drops from dozens of gigabytes down to between 5 MB and 28 MB.  
> * **Hard Enforcements:** This strictly enforces the target \< 100MB per-episode storage budget, capped by a hard, non-negotiable ceiling of 150MB.  
> * **Self-Containment:** The resulting workspace remains 100% offline self-contained; rendering the episode does not require subsequent network access or a connection to the master asset repository.

#### **The Zero-Byte Poison Trap Integration**

During the harvesting and staging phase, collect-episode-assets.ts computes the SHA-256 binary hash of every file it copies to catch upstream upload truncations or dropped network writes.

If any file matches the empty-file hash signature: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 or if its byte length falls below a valid threshold (e.g., under 1,024 bytes for an image plate), the script terminates the build immediately with exit code 1\. This ensures that only fully verified, hydrated binaries reach the downstream Remotion execution context, preventing zero-byte scratch allocations from poisoning a headless render.

---

*User prompt: {{FOCUS:  1\. The Rejection Taxonomy (rejected\_takes), Tier 1: Deterministic Pixel Integrity (Physical Constraints), Tier 2: Embedding-Space Drift & Adversarial Silhouette Gating }} /extreme-details*

### **Response: 1\. The Rejection Taxonomy (rejected\_takes)**

Generative diffusion models naturally regress toward the statistical median of their training data, flattening distinct physical traits and creating generic outputs (e.g., prompting for two different humiliated characters yields the same sad-faced mean). To combat this, facial expressions and body poses are treated as structured, testable, and auditable production assets.

When candidate renders fail evaluation, they are never silently deleted. Instead, the system preserves failed generations in a dedicated negative exemplar buffer with explicit failure tags, appending them to a permanent rejection ledger inside approved.json. Retaining these failure cases provides crucial negative reference data to counteract algorithmic bias and Model Autophagy Disorder (MAD) during subsequent automated serverless training cycles.

The rejection ledger classifies discards into a closed taxonomy of failure modes:

> * **SEMANTIC\_FAILURE**: The visual expression contradicts the distinctness boundary or psychological specification defined in the character bible (e.g., Bog's humiliation must reflect interrupted control with hands frozen mid-count, not passive sadness).  
> * **DISTINCTNESS\_COLLISION**: The generated pose fails to stand apart visually from a different, already-approved condition variant belonging to the exact same character.  
> * **CROSS\_CHARACTER\_BLEED**: The candidate visually borrows silhouette cues, posture habits, or physical traits that canonically belong to another ensemble cast member (e.g., Bog inheriting Spleen's characteristic loose-limbed shrinking).  
> * **PHYSICAL\_DEFECT**: The candidate fails deterministic validation checks, exhibiting alpha spill, corrupted canvas geometries, or out-of-gamut pixels.

When deployed as a diagnostic router triggered by metric-space drift, the taxonomy expands to categorize specific regression breaks:

> * **HARMLESS\_FLOAT\_NOISE**: Minor CUDA or cuDNN driver variations causing negligible pixel shifts.  
> * **LIGHTING\_CURVE\_SHIFT**: Unwanted adjustments in sampler or VAE decoding that alter the image's overall contrast or shadow depth.  
> * **ANATOMICAL\_COLLAPSE**: Severe structural failures, including missing limbs, facial warping, or complete loss of character identity.  
> * **CANON\_INVARIANT\_BREACH**: The generation introduces forbidden elements (e.g., modern zippers or plastics) or erases mandatory permanent somatic features like scars.

To secure this ledger, approval is never handled via a simple JSON string like "supervised\_signoff": "art\_director", which any script could falsely write. True approval requires a GitHub Pull Request review under branch protection. The approving user and PR number are read directly from the GitHub API, ensuring the automated agent cannot author or modify governance fields.

### **2\. Tier 1: Deterministic Pixel Integrity (Physical Constraints)**

Tier 1 acts as a hierarchical fail-fast funnel designed to catch structural and visual defects with zero compute cost. It operates purely on deterministic computer vision mathematics, dropping flawed assets in milliseconds before any expensive neural evaluation or multimodal Vision-Language Model (VLM) is invoked.

> * **Alpha Edge Purity Sweep:** An automated script evaluates the outer 3-pixel contour of the keyed character silhouette to verify greenscreen threshold safety. It computes a high percentile or per-pixel spill-excess equation: *G*−max(*R*,*B*) over the edge band. The pipeline explicitly avoids using a simple mathematical mean, because a mean allows localized green fringing and halos to slip through undetected.  
> * **Palette Gamut Enforcement (palette\_enforce.py):** The system verifies raw RGB pixel values across every candidate image. It asserts that 100% of the candidate's pixels fall strictly within the 155-color master Look-Up Table (LUT). Any generation introducing muddy intermediate hues, hyper-saturated neon, or unmapped out-of-gamut pigments is rejected instantly at the file level.  
> * **Luminance Histogram Delta:** The tier measures the Wasserstein distance of the image's luminance histogram against the baseline, halting the build if the distance is ≥0.05.  
> * **Deterministic Coordinate Extraction:** Machine-readable spatial anchors must never be estimated by a multimodal VLM guessing pixel locations. If the asset is a layered file, coordinates are exported directly from authoring software bounds (e.g., Photoshop or Krita layer geometry). If the asset is a flattened diffusion plate, foot contact points are found by scanning the alpha channel from the bottom for the lowest opaque cluster, and the mouth\_bounding\_box is located via exact template matching against the base neutral sprite.  
> * **Acoustic & Temporal Alignment:** If the asset is a video sequence, ffprobe evaluates the physical waveform duration to ensure the rendered frame count perfectly matches the integer frame budget. Loudness is normalized to −16 LUFS (±1.0 LUFS) with a true-peak ceiling ≤−1.0 dBTP.

### **3\. Tier 2: Embedding-Space Drift & Adversarial Silhouette Gating**

If an asset clears Tier 1, it enters Tier 2, which leverages metric tensors and learned perceptual spaces to quantify drift and ensure character distinctness. Crucially, this tier avoids stochastic LLM interpretations, relying instead on mathematically reproducible distance calculations.

#### **Embedding-Space Tensors**

The pipeline quantifies perceptual distance to ensure the new generation does not deviate from the golden baseline:

> * **DINOv2 Identity Cosine Distance (≤0.08):** Evaluates overall semantic structure and identity permanence across generations to ensure the generated subject matches the character style bible.  
> * **LPIPS Perceptual Patch Variance (≤0.12):** The Learned Perceptual Image Patch Similarity metric measures localized texture shifts across frames. It flags surface boiling, flickering backgrounds, unexpected grain variance, or unnatural sharpening that traditional pixel-diffs miss.  
> * **ArcFace Feature Vector Divergence (≤0.10):** Evaluates facial landmark manifolds to ensure character features (e.g., eye spacing, jawline) have not migrated from the established baseline.

#### **Adversarial Silhouette Gating (The Redaction Test)**

To combat "The Beige Plague"—where diffusion models blend unique character designs into homogeneous, symmetrical archetypes—Tier 2 enforces the Visual Redaction Test.

> * **Binary Abstraction:** The pipeline strips all texture, lighting, and color from the candidate asset, converting the keyed cutout into a pure 1-bit black-and-white alpha silhouette (take\_XX\_silhouette.png).  
> * **Entropy Classification:** An adversarial vision classifier evaluates the pure outline to assert that the character's identity can be recognized entirely by their posture and slouch.  
> * **The Homogeny Threshold:** The test requires an identity classification entropy of *H*\<0.15. It mathematically confirms that Bog (defined by stooped, asymmetrical shoulders and hands held tense at the chest) remains statistically distinguishable from Spleen (who exhibits a scoliotic spinal curve and loose hanging limbs) and Wart (who maintains a broad-shouldered, rigid, vertical posture). If the classifier cannot tell the cast members apart in total darkness, the candidate is rejected for lacking visual distinctness.

---

*User prompt: {{FOCUS:  The Comfort State (at\_ease) }} /extreme-details*

Response: The **Comfort State (at\_ease)** is a highly specialized, structurally load-bearing visual and narrative asset within \[series-assets-visual\]. Unlike standard emotional variants (e.g., humiliated, smug, terrified), which represent socially charged or conflict-driven conditions, at\_ease is the *only* positive-valence, non-conflict emotional state in the entire visual system.

Rather than serving as generic set dressing, it is explicitly designed to anchor the studio's sharpest contrast technique: the **Quiet Open**.

### **1\. The Architectural Role of at\_ease (The Baseline of Contrast)**

The primary function of the Comfort State is to establish contrast. In a narrative simulation driven by high-friction strain propagation, physical trauma, and escalating paranoia, the audience (and the generative engine) must explicitly know what "off" looks like to make "on" land with impact.

> * **Mechanical Rarity:** The at\_ease state is mechanically rare by design. It is never applied via normal, probabilistic duel resolution. If an LLM were allowed to routinely pull this state into everyday scenes, the rarity-driven value of the asset would erode.  
> * **The Quiet Open Mechanism:** It is triggered specifically through a dedicated, infrequent, systemically-triggered prompt path called the Quiet Open (or Comfort State scene). This mechanic acts as a fifth generation branch alongside Boiling Over, Relief, Cooling-Off, and Tonal Overrides.  
> * **Production Priority:** Because at\_ease anchors this critical contrast technique, a weak, generic, or poorly illustrated Comfort State render undercuts the mechanic's entire payoff. Therefore, it demands intense artistic priority from POD-07 (The Asset Forge), even more so than standard conflict states, because it has exactly one highly visible job.

### **2\. Psychological Staging & The Humor Trigger**

A Quiet Open scene where nothing is at stake risks being genuinely boring if the character is merely depicted as generically "calm". The at\_ease variant is engineered to express the character's most specific, personal psychology at rest.

> * **The Humor Trigger Synthesis:** The visual design and narrative prompt for at\_ease draw directly from two rare fields in the character bible: the comfort\_state and the humor\_trigger ("what makes this character laugh").  
> * **Recontextualization of Trauma:** The most effective Comfort States recontextualize established character flaws. For example, Bog's defining trait is a frantic counting compulsion, normally a symptom of interrupted control and anxiety. In his at\_ease state, he is shown counting (or holding a spoon) with genuine contentment rather than desperate control. This only lands as release because the audience recognizes the tic and sees it transformed.  
> * **Zero Mechanical Activity:** The Comfort State must contain *zero* mechanical activity—no active grievances, no ticking paranoia clocks, and no duel math. It is the deliberate absence of systemic pressure.

### **3\. Implementation in manifest.json and the Explicit Null Protocol**

Because it is a distinct, load-bearing visual asset, an "idle, relaxed animation variant" must exist as a concrete file in the repository (e.g., variants/{char}\_at\_ease.png).

> * **Manifest Linkage:** It occupies a formal slot in condition\_variants, utilizing the same spatial coordinate math (mouth bounding boxes, ground contact points) as any other pose.  
> * **Explicit Null Enforcement:** If the art team has not yet completed a character's at\_ease pose, it must be declared as explicitly null ("at\_ease": null) in the manifest.json. It cannot be left un-keyed. During animatic drafts, the compositor safely falls back to base\_states.idle, but broadcast mastering will halt unless a waiver is provided.

### **4\. Systemic Scheduling constraints**

The engine is forbidden from triggering a Quiet Open at random. It must be season-plan-scheduled, anchored strictly to phase transitions (e.g., the end of the Rising phase, or 1-2 cycles before a planned spine/clock convergence).

To maximize dramatic impact, the character selected for a Comfort State scene is explicitly the one who is about to be hit hardest by the approaching climax. The devastating contrast between their moment of peace and the subsequent systemic collapse is the entire purpose of the at\_ease mechanic.

---

*User prompt: {{FOCUS:  The Physical Lying Tell }} /extreme-details*

Response: The Physical Lying Tell is a structurally load-bearing mechanism within the studio's narrative and visual architecture. It operates as a formalized bridge between the canonical character bibles in \[series-lore\] and the modular puppet rigs in \[series-assets-visual\].

Its primary function is to prevent downstream rendering engines from relying entirely on dialogue (audio) to carry dramatic weight, ensuring that deception, omission, and epistemic friction are physically manifested on screen.

### **1\. The Design and Function of the Lying Tell**

In the character bibles, the **Physical Lying Tell** is not merely descriptive flavor text; it is an explicit, mandatory mechanical field. Every character must have exactly one concrete, visual detail they exhibit involuntarily when they are lying, hiding information, or engaging in epistemic omission.

> * **Actionable Physicality:** The tell cannot be an abstract internal feeling (e.g., "feels nervous"). It must be an actionable, renderable physical action. Examples include stopping a repetitive counting tic mid-sentence, suddenly becoming perfectly still (freezing), over-explaining with hands, or a specific averting of the gaze.  
> * **The "Failure Behavior" Echo:** The lying tell is deliberately designed to share visual language with the character's *Risk Failure Behavior*. If Bog makes a specific face when he fails a high-stakes task, he makes that exact same face when he is hiding something. This serves two purposes:  
  1. **Production Economy:** It reduces art production costs by reusing an existing, already-designed asset (the lying tell pose) in a second narrative context.  
  2. **Audience Payoff:** It creates a meaningful visual echo for an attentive viewer ("that's the same face he made when he was hiding something"), converting a production shortcut into a deliberate narrative motif.

### **2\. Implementation in the Visual Pipeline**

To ensure the Physical Lying Tell is actually rendered on screen, it must be formalized within the mathematical contracts of the visual pipeline.

#### **The lying\_tell\_pose Manifest Linkage**

The tell is not left as unstructured prose for the visual pipeline to guess at. In the manifest.json for each character in \[series-assets-visual\], the tell is formalized as a dedicated field (e.g., lying\_tell\_pose).

This field acts as a direct **pointer into condition\_variants** (or a specific directional variant in a six-direction rig).

{  
  "character\_id": "char\_bog",  
  "lying\_tell\_pose": "variants/bog\_humiliated.png",   
  "condition\_variants": {  
    "humiliated": {  
      "file": "variants/bog\_humiliated.png",  
      "anchor\_point": { "x": 518, "y": 980 }  
    }  
  }  
}

By resolving the tell to an actual emotion-bank entry (such as the humiliated or defensive pose), the downstream Remotion compositor can programmatically trigger the exact raster asset when the dialogue AST indicates the character is engaging in deception.

### **3\. Integration with the Epistemic Vector**

The Lying Tell is inextricably linked to the **Epistemic Vector** of the simulation—the mathematical tracking of what a character knows, what they believe, and what they are trying to hide.

When the simulation compiles a dialogue beat, it checks the character's epistemic horizon. If the character's internal belief contradicts their external utterance (i.e., they are lying), or if they possess a RESTRAINED\_KNOWLEDGE directive forcing them to withhold the truth, the engine flags the beat with a deception tag.

Downstream, the goblin-viewport-template reads this tag and automatically maps it to the lying\_tell\_pose defined in the character's manifest. This ensures that the character's physical representation (Axis B) accurately reflects their internal epistemic friction (Axis A) without requiring manual animator intervention.

---

*User prompt: {{FOCUS:  1\. The Four-Dimensional Specification Matrix }} /extreme-details*

Response: The **Four-Dimensional Specification Matrix** within the character bibles serves as the absolute, written authority governing visual emotion triage. It is explicitly designed to solve the critical generative defect of **generic emotional collapse**. Without this matrix, prompting a diffusion model for two different characters experiencing the same emotion (e.g., "Bog, humiliated" vs. "Spleen, humiliated") causes the neural network to default to a homogeneous, statistically generic sad-faced mean.

To prevent this collapse, the studio treats facial expressions and body postures as structured, testable, and auditable production assets. Triage is executed against rigorous written criteria codified in the character dossiers of \[series-lore\] rather than relying on the subjective aesthetic opinions of human reviewers or multimodal agents.

Every core emotional condition (e.g., humiliated, smug, terrified, exposed) must be strictly defined across four operational dimensions:

### **1\. Condition ID (The Structural Anchor)**

> * **The Taxonomic Bind:** The canonical state name is drawn directly from a unified condition taxonomy (e.g., world/conditions.md).  
> * **Synchronization:** This guarantees that the mechanical simulation engine computing trauma, the LLM dialogue tags emitting the AST, and the visual repository directory structures (/emotion\_bank/humiliated/) remain perfectly synchronized via an immutable string identifier.

### **2\. Physical / Somatic Staging (The Bible Specification)**

> * **Psychological Translation:** Detailed prose describing exactly how this specific character's body reacts to the emotion based on their unique psychology, anatomical quirks, and coping mechanisms.  
> * **Actionable Physicality:** It cannot be an abstract internal feeling; it must define anatomical posture, shoulder compression, gaze angle, and finger tension. For example, Bog's humiliation represents "interrupted control," characterized by shoulders pulled inward, hands frozen mid-count, clenched fists, and a tense jaw.

### **3\. Prompt Fragment Injection (The Diffusion Guide)**

> * **Version-Controlled Injection:** A locked, regression-tested string of positive prompt tokens that reliably guides the specific diffusion model toward the correct physical staging.  
> * **Example:** For Bog's smug state, the injection might be "chin raised, minimal closed-mouth smile, still posture, one eyebrow arched, unblinking". This ensures that the generation doesn't rely on the model's generic interpretation of the word "smug," which often yields a performative, open-mouthed smirk.

### **4\. Distinctness Boundary Checks (The Negative Constraints)**

> * **Preventing Cross-Character Bleed:** Explicit negative constraints defining what the emotion must *not* look like, frequently establishing contrast against other ensemble cast members or alternative emotional states of the same character.  
> * **Adversarial Bounds:** For Bog's humiliated state, the distinctness boundary mandates that he must *not* resemble Spleen's humiliated pose (a loose-limbed, full-body shrinking). This provides the automated triage agents (like Jules) with falsifiable criteria to reject images that suffer from character silhouette bleed.

---

*User prompt: {{FOCUS:  Tier 3: Jules Multimodal Semantic Auditing }} /extreme-details*

Response: The **Four-Dimensional Specification Matrix** within the character bibles functions as the absolute, written authority governing visual emotion triage, designed to eradicate the fatal flaw of **generic emotional collapse** in generative production pipelines.

When diffusion models are prompted with generic emotional descriptors across different characters (e.g., "Bog is humiliated" versus "Spleen is humiliated"), the neural network invariably regresses toward a homogeneous, statistically generic sad-faced mean. The studio circumvents this by treating facial expressions and physical postures as structured, testable, and auditable production assets governed by the matrix.

### **1\. Condition ID (The Structural Anchor)**

The first dimension strips emotional states of linguistic ambiguity by binding them to a rigid string identifier.

> * **Taxonomic Synchronization:** The canonical state name is drawn directly from a unified, dynamic condition taxonomy read from upstream configurations like series.config.json.  
> * **The Tri-Partite Bind:** This immutable ID ensures that the mechanical simulation engine computing trauma, the LLM dialogue AST emitting the scene's emotional tags, and the visual repository directory structures (e.g., /emotion\_bank/humiliated/) remain perfectly coupled. If an author or code agent attempts to use a condition ID not registered in the taxonomy, the ingestion pipeline aborts the transaction.

### **2\. Physical / Somatic Staging (The Bible Specification)**

The second dimension translates abstract psychological states into explicit, actionable physiological geometry that can be rendered and audited.

> * **Actionable Physicality:** Subjective internal feelings ("he feels sad") are useless to a visual compositor. The specification must dictate anatomical posture, shoulder compression, gaze angle, and finger tension.  
> * **Cross-Field Motor Audit Integration:** This staging directly informs the somatic invariant layer of the narrative engine. If a character's physical staging requires them to curl their hands into tight fists, the system evaluates this against their active somatic.banned\_kinetic\_verbs vector. If the character has a shattered radius or missing limb, the Dual-Field Motor Audit flags a cross-field discrepancy, causing a fatal rejection.  
> * **Psychological Nuance:** For example, Bog's baseline for humiliation is "interrupted control," characterized by shoulders pulled inward, hands frozen mid-count, clenched fists, and a tense jaw. This guarantees the audience sees his specific coping mechanism failing, rather than passive grief.

### **3\. Prompt Fragment Injection (The Diffusion Guide)**

The third dimension bridges the human-readable character bible into machine-readable diffusion tensors.

> * **Version-Controlled Injection:** Rather than allowing downstream rendering nodes or Scene Pods to improvise prompts, the matrix provides a locked, regression-tested string of prompt tokens that reliably guides the specific diffusion checkpoint.  
> * **Somatic Prompt Triggers (POD-07):** To prevent prompt drift when translating 3,000-word character dossiers into diffusion batches, POD-07 (The Asset Forge) utilizes a dedicated custom field: *Somatic Prompt Triggers*. This distills the complex character bibles into rigorous positive and negative token matrices (e.g., specific matrices used for characters like Billie Fae \#031 or Branksi \#038) for direct injection into ComfyUI prompts.

### **4\. Distinctness Boundary Checks (The Negative Constraints)**

The final dimension acts as the pipeline's anti-bleed mechanism, establishing falsifiable negative criteria to prevent characters from visually merging.

> * **Adversarial Bounds:** Distinctness boundaries define what an emotion must *not* look like. Bog's humiliation must not resemble Spleen's loose-limbed, full-body shrinking.  
> * **Tier 2 Silhouette Redaction Integration:** These constraints feed directly into the Tier 2 Geometric Integrity Gates, which run the Silhouette Redaction Test. Candidate renders are stripped to pure black silhouettes to verify their identity entropy remains distinct from the ensemble cast.  
> * **Tier 3 Jules VLM Auditing:** If metric space diverges, the Jules multimodal agent performs a semantic audit, emitting a mandatory \<visual\_scan\_trace\> to pinpoint pixel coordinates. Jules evaluates the generated image strictly against these negative constraints, categorizing failures as DISTINCTNESS\_COLLISION or CROSS\_CHARACTER\_BLEED if the boundary is breached.

---

*User prompt: {{FOCUS:  1\. Condition ID (The Structural Anchor) }} /extreme-details*

Response: Tier 3 (Jules Multimodal Semantic Auditing) operates as the ultimate arbiter within the /emotion\_bank/ triage gauntlet, taking over only after candidate generations have cleared Tier 1 (Deterministic Pixel Gates) and Tier 2 (Geometric & Silhouette Entropy Checks). Its primary function is to prevent Vision-Language Models (VLMs) from issuing ungrounded, hallucinatory approvals (often referred to as "vibes-based" judgments) by forcing the model into an objective, coordinate-bound diagnostic workflow.

By enforcing this structure, Tier 3 ensures that every generated asset strictly adheres to the narrative and somatic requirements defined in the canonical lore.

### **1\. The Panopticon Protocol and Mandatory Attention Grounding (\<visual\_scan\_trace\>)**

When asking a multimodal VLM to evaluate an image, a simple binary prompt (e.g., "Does this image look correct? Yes/No") invariably results in false positives, as the model will gloss over structural errors if the overall aesthetic matches the prompt.

Tier 3 mitigates this through **Mandatory Attention Grounding**, structurally forbidding the Jules coding agent from emitting an immediate JSON verdict. Before any judgment is rendered, Jules must emit a structured, free-text \<visual\_scan\_trace\>.

#### **The Mechanisms of the Trace**

> * **Coordinate Pinpointing:** The trace requires Jules to extract and document exact pixel coordinates for critical features, such as the eye\_centroid, mouth\_bounding\_box, and primary prop contours. For example, the trace might specify: "Eye Centroid Coordinates: Baseline \[x: 412, y: 198\] vs Candidate \[x: 412, y: 197\]. Delta is within 1px."  
> * **Physical Trait Verification:** Jules must explicitly evaluate known somatic invariants. If a character dossier requires a specific physical trait (e.g., "Left Ear Notch (Somatic Invariant \#012)"), the trace must actively confirm its presence or absence by inspecting the corresponding pixel bounding box (e.g., \[x: 480, y: 172\]).  
> * **Anachronism Sweeps:** The agent scans for banned world elements or anachronistic materials. By forcing the trace to articulate exactly what an object is made of (e.g., confirming a "metallic pocket knife"), the system structurally prevents the VLM from lazily accepting a hallucinated "cell phone" in its final verdict.

By demanding this explicit mathematical and semantic grounding upfront, the pipeline ensures the VLM has actively "looked" at the necessary details before forming a conclusion.

### **2\. Bible Specification Alignment & Semantic Auditing**

Once the visual scan trace grounds the model's attention, Jules moves to semantic alignment, comparing the generated image directly against the **Four-Dimensional Specification Matrix** codified in the character's emotion bible.

#### **The Distinctness Boundary Check**

The VLM evaluates the candidate against explicit negative constraints. These boundaries dictate what an emotion must *not* look like to prevent characters from visually merging.

> * If Bog's humiliated state requires him to look "frozen mid-gesture" with clenched fists, and the generated image depicts a loose-limbed, full-body hunch (which canonically belongs to Spleen), Jules flags the discrepancy.  
> * This failure is mapped directly into the rejection ledger under the DISTINCTNESS\_COLLISION or CROSS\_CHARACTER\_BLEED classifications, proving that the generated asset violated the distinctness boundary.

#### **Somatic DSP Alignment (Cross-Field Audits)**

Jules also verifies that the visual staging respects the character's somatic realities (Axis A). If a character has a severed right arm (braxial\_plexus\_severed) recorded in their physical capability matrix, Jules will reject any generation showing them using two hands to heave an object, flagging it as an ANATOMICAL\_COLLAPSE or CANON\_INVARIANT\_BREACH.

### **3\. The Diagnostic Serialization Contract & Actionable Remediation**

When Jules detects a failure, it does not output vague aesthetic complaints. It serializes a structured **Diagnostic Remediation Ticket** directly into the VM environment, stripping all subjective language in favor of actionable geometric and semantic data.

#### **The Severity Matrix**

Jules categorizes issues according to a strict jurisprudence matrix:

> * **Severity 1 (Nitpick):** Sub-pixel raster misalignments. Action: WARN.  
> * **Severity 2 (Friction):** Soft color temperature drifts or minor styling inconsistencies. Action: WARN.  
> * **Severity 3 (Violation / SEVERITY\_3\_VIOLATION):** Somatic breaches, missing invariant traits (e.g., a missing ear notch), or significant spatial drift. Action: TEST FAILURE / REJECT.  
> * **Severity 4 (Heresy):** Banned world elements or severe anatomical collapses. Action: HARD PIPELINE HALT.

#### **Structured Output Examples**

The resulting JSON diagnostic clearly defines the root cause and provides actionable next steps:

{  
  "audit\_verdict": "FAIL\_REGRESSION",  
  "classification": "CANON\_INVARIANT\_BREACH",  
  "divergence\_severity": "SEVERITY\_3\_VIOLATION",  
  "affected\_entity": "char\_bog",  
  "breached\_invariant": "bog\_somatic\_ear\_notch",  
  "root\_cause\_analysis": "Upstream LoRA merge or clip-skip bump has smoothed out the high-frequency scar topology on Bog's left ear.",  
  "actionable\_remediation": "Reject proposed checkpoint. If retraining, increase caption weighting on 'notched\_left\_ear' and add negative prompt tokens for 'symmetrical ears, intact ears'."  
}

If the error is geometric (e.g., GEOMETRIC\_ANCHOR\_COLLISION), the ticket supplies exact pixel deltas (e.g., "suggested\_patch\_delta": 24\) for downstream automated repair agents to execute surgical Minimal Enclosing Unit (MEU) patches via ts-morph.

---

*User prompt: {{FOCUS:  2\. Physical / Somatic Staging (The Bible Specification) }} /extreme-details*

Response: The **Four-Dimensional Specification Matrix** within the character bibles functions as the absolute, written authority governing visual emotion triage. This framework is explicitly designed to eradicate the fatal flaw of **generic emotional collapse** in generative production pipelines. When diffusion models are prompted with generic emotional descriptors across different characters (e.g., "Bog is humiliated" versus "Spleen is humiliated"), the neural network invariably regresses toward a homogeneous, statistically generic sad-faced mean.

The studio circumvents this regression by treating facial expressions and physical postures as structured, testable, and auditable production assets governed by the matrix.

The second dimension of this matrix is **Physical / Somatic Staging (The Bible Specification)**. This dimension translates abstract psychological states into explicit, actionable physiological geometry that can be rendered, directed, and audited.

### **1\. Actionable Physicality vs. Subjective Feeling**

Subjective internal feelings (e.g., "he feels sad") are useless to a visual compositor or an automated triage agent. The specification must dictate concrete, physical staging: anatomical posture, shoulder compression, gaze angle, and finger tension.

> * **Psychological Translation:** Detailed prose describes exactly how this specific character's body reacts to the emotion based on their unique psychology, anatomical quirks, and coping mechanisms.  
> * **Example (Bog \- Humiliated):** Bog's baseline for humiliation is "interrupted control.". The physical specification requires: "Shoulders pulled inward, hands freeze mid-count and clench into fists. Gaze averted down-left.". This guarantees the audience sees his specific coping mechanism failing, rather than generic, passive grief.  
> * **Example (Bog \- Smug):** Defined as "Quiet self-satisfaction rather than an active grin.". The physical staging dictates: "Chin slightly raised, single eyebrow cocked, absolute physical stillness.".

### **2\. Integration with Downstream Triage (Tier 3\)**

The physical staging criteria provide the falsifiable grounding required by **Tier 3: Jules Multimodal Semantic Auditing** within the \[series-assets-visual\] triage gauntlet.

When evaluating candidate generations (e.g., take\_03.png), Jules is forced into an objective diagnostic workflow:

> 1. **Mandatory Optical Scan:** Jules must emit a \<visual\_scan\_trace\> pinpointing the pixel coordinates of the generated pose (eyes, hands, shoulders).  
> 2. **Bible Specification Alignment:** Jules directly compares the geometric reality of the image against the written physical staging in the bible. If the generated image of Bog shows a character standing upright with relaxed hands (failing the "shoulders pulled inward" and "clenched fists" criteria), the candidate is rejected for a SEMANTIC\_FAILURE.

### **3\. Cross-Field Motor Audit Integration**

The physical staging defined in the emotion bible must remain coherent with the character's underlying biological reality (Axis A). This staging directly informs the somatic invariant layer of the narrative engine.

If a character's physical staging requires them to curl their hands into tight fists, the system evaluates this against their active somatic profile (getCharacterSomaticMask). If the character possesses a severe pathology (e.g., a severed arm or paralyzed upper extremity), they cannot physically execute the staging. The system audits the intersection of the body (Somatic Vector) and the intended action, flagging a cross-field discrepancy (such as a SOMATIC\_CLEARANCE\_LOCK or invariant violation) and causing a fatal rejection if a physical impossibility is commanded.

---

*User prompt: {{FOCUS:  3\. Prompt Fragment Injection (The Diffusion Guide) }} /extreme-details*

Response: The **Four-Dimensional Specification Matrix** within the character bibles functions as the absolute, written authority governing visual emotion triage. It is explicitly designed to eradicate **generic emotional collapse** in generative production pipelines. When diffusion models are prompted with generic emotional descriptors across different characters, the neural network invariably regresses toward a homogeneous, statistically generic sad-faced mean.

To prevent this, the studio treats facial expressions and physical postures as structured, testable, and auditable production assets governed by the matrix.

The third dimension of this matrix is **Prompt Fragment Injection (The Diffusion Guide)**, which bridges the human-readable character bible into machine-readable diffusion tensors.

### **1\. Version-Controlled Injection**

Rather than allowing downstream rendering nodes, automated scripts, or human animators in Scene Pods to improvise prompts based on a general understanding of the character's emotion, the matrix provides a locked, version-controlled string of positive prompt tokens.

> * **The Diffusion Guide:** This specific sequence of tokens reliably guides the target diffusion checkpoint (such as SDXL or Wan 2.2) toward the correct physical staging defined in Dimension 2 (Physical / Somatic Staging).  
> * **Example (Bog \- Smug):** The injection might be "chin raised, minimal closed-mouth smile, still posture, one eyebrow arched, unblinking". This ensures that the generation does not rely on the model's generic, RLHF-trained interpretation of the word "smug," which almost always yields a performative, wide-open smirk that contradicts Bog's canonical personality.

### **2\. Somatic Prompt Triggers (POD-07 Custom Field)**

To prevent prompt drift when translating 3,000-word character dossiers into active diffusion batches, POD-07 (The Asset Forge) utilizes a dedicated custom field: **Somatic Prompt Triggers**.

> * **Distillation Process:** POD-07 ruthlessly distills the complex, 10-phase psychological and somatic character bibles into rigorous positive and negative token matrices.  
> * **Direct Injection:** These matrices (e.g., specific matrices used for characters like Billie Fae \#031 or Branksi \#038) are formatted for direct injection into ComfyUI prompts, bypassing any intermediate LLM interpretation during the rendering phase.  
> * **Example (Branksi \#038):**  
  * *Positive Triggers:* "absolute muscular slack, vaporous glide, matte gray oversized clothing, sterile breathing apparatus, wide unfocused eyes"  
  * *Negative Triggers:* "coiled tension, tactical stance, aggressive eye contact"

By locking these explicitly crafted prompt fragments into the matrix, the architecture ensures that the exact neuro-linguistic triggers required to reliably summon a specific character's psychological state are preserved and executed deterministically.

---

*User prompt: {{FOCUS:  4\. Distinctness Boundary Checks (The Negative Constraints) }} /extreme-details*

Response: The **Distinctness Boundary Checks (The Negative Constraints)** represent the final dimension of the Four-Dimensional Specification Matrix within the character emotion bibles. This dimension functions as the pipeline's primary anti-bleed mechanism, engineered specifically to prevent characters from visually merging or degrading into statistically generic archetypes—a phenomenon known as "The Beige Plague".

Generative diffusion models naturally default to symmetry and homogeneity unless actively constrained. The Distinctness Boundary sets falsifiable negative criteria to define exactly what an emotional expression or physical posture must *not* look like.

### **1\. The Adversarial Bounds**

Distinctness boundaries are authored to establish contrast, frequently against other ensemble cast members or alternative emotional states of the same character.

> * **Cross-Character Conflict:** If Bog's humiliated state requires him to reflect "interrupted control" with clenched fists, the Distinctness Boundary explicitly states that he must *not* resemble Spleen's humiliated pose, which is characterized by a loose-limbed, full-body shrinking.  
> * **Intra-Character Conflict:** A character's terrified state must be boundaried against their own startled or grieving states to ensure the diffusion model does not reuse the same geometric facial landmarks for distinct psychological events.

### **2\. Integration with Tier 2: The Silhouette Redaction Test**

The distinctness constraints feed directly into the Tier 2 Geometric Integrity Gates within \[series-assets-visual\].

> * **The Redaction Test:** To enforce these boundaries mathematically without relying on LLM vibes, candidate renders are stripped of all texture, lighting, and color, converting the keyed cutout into a pure 1-bit black-and-white alpha silhouette (take\_XX\_silhouette.png).  
> * **Entropy Classification:** An adversarial vision classifier evaluates the pure outline to assert that the character's identity can be recognized entirely by their posture and slouch. The test requires an identity classification entropy of *H*\<0.15. If the classifier cannot distinguish Bog from Spleen in total darkness based on the silhouette, the candidate is rejected for lacking visual distinctness.

### **3\. Integration with Tier 3: Jules VLM Auditing**

If the candidate survives Tier 2 but metric space diverges during generation, the Jules multimodal agent performs a semantic audit in Tier 3\.

> * **Attention Grounding:** Jules emits a mandatory \<visual\_scan\_trace\> to pinpoint pixel coordinates.  
> * **Negative Validation:** Jules evaluates the generated image strictly against the negative constraints defined in the Distinctness Boundary.  
> * **The Rejection Ledger:** If Jules detects that the image violates these negative constraints (e.g., Bog is exhibiting Spleen's loose-limbed slouch), it categorizes the failure under DISTINCTNESS\_COLLISION (if it mimics another of Bog's poses) or CROSS\_CHARACTER\_BLEED (if it mimics Spleen). This failure is preserved in the approved.json rejection ledger to prevent future training runs from sampling the flawed latent region.

---

*User prompt: {{FOCUS:  1\. The Adversarial Bounds }} /extreme-details*

Response: The Adversarial Bounds operate as the primary negative constraint mechanism within the Distinctness Boundary Checks, designed to prevent generative models from collapsing unique character designs into homogenized archetypes.

To enforce these boundaries mathematically, the system utilizes a **Visual Redaction (Silhouette) Test**.

> * **Binary Mask Abstraction:** The pipeline strips a generated candidate sprite down to a pure binary mask, acting as a cheap, model-independent probe for homogenization. It asks exclusively whether the character is still recognizable based on posture and outline alone.  
> * **Cast-Specific Classifiers:** To function as a reliable pipeline gate, this test relies on a classifier trained specifically on the production's established cast, which must include reported held-out accuracy. This is necessary because any newly generated candidate asset is inherently out-of-distribution by construction.  
> * **Entropy Thresholds:** The classifier evaluates the identity of the silhouette using classification entropy. For a three-class problem, this entropy is bounded at approximately 1.10 nats. The pipeline enforces a strict entropy threshold (e.g., 0.15) to ensure the classifier is highly confident in its identification.  
> * **The Calibration Hazard:** The architecture explicitly acknowledges a mathematical hazard: an entropy threshold of 0.15 means the classifier is confident, but confidence cannot be blindly conflated with true distinctness. A confidently wrong classifier will also return low entropy. Therefore, the visual entropy threshold must be rigorously calibrated using labeled evaluation sets and baseline measurements to ensure the bounds effectively block cross-character bleed.

---

*User prompt: {{FOCUS:  3\. Integration with Tier 3: Jules VLM Auditing }} /extreme-details*

Response: Tier 3: Jules Multimodal Semantic Auditing acts as the final gate within the multi-stage visual verification gauntlet, operating only after candidates survive Tier 1 (Deterministic Pixel Gates) and Tier 2 (Metric-Space & Silhouette Gates). Its fundamental purpose is to prevent generative pipelines from collapsing into homogeneous outputs and to anchor visual assertions strictly to the written canon.

### **1\. Mandatory Attention Grounding (\<visual\_scan\_trace\>)**

When an automated critic is asked for a direct JSON verdict, it typically defaults to "vibes-based" hallucinatory approvals, glossing over localized geometric flaws if the overall image feels correct. Tier 3 structurally prohibits this behavior by mandating an objective, coordinate-bound workflow.

> * **The Trace Requirement:** Before Jules (the multimodal VLM agent) can emit a verdict or classification, it is forced by its system prompt to output an explicit \<visual\_scan\_trace\>.  
> * **Coordinate Pinpointing:** This trace requires Jules to extract and document the exact pixel coordinates for critical features, such as the eye\_centroid, mouth perimeter bounds, and primary prop contours (e.g., "Eye Centroid Coordinates: Baseline \[x: 412, y: 198\] vs Candidate \[x: 412, y: 197\]").  
> * **Anachronism & Invariant Sweeps:** The agent must explicitly scan for banned world elements (e.g., modern zippers or unmapped plastics) and verify physical invariants (e.g., confirming a specific 12px wedge excision on a character's ear).

### **2\. Bible Specification Alignment & Cross-Character Boundaries**

Once optically grounded, Jules moves to semantic and state verification, comparing the generated image against the Four-Dimensional Specification Matrix codified in the character's emotion bible.

> * **Distinctness & Negative Constraints:** Jules evaluates the candidate against explicit negative constraints. If a character's humiliated state requires them to look "frozen mid-gesture" with clenched fists, but the generated image mimics another character's loose-limbed slouch, Jules rejects the image for violating the distinctness boundary.  
> * **Diagnostic Categorization:** Failures are logged into a permanent rejection ledger (approved.json) using a strict taxonomy. Jules classifies divergence into specific root causes: HARMLESS\_FLOAT\_NOISE (minor CUDA variation), LIGHTING\_CURVE\_SHIFT, ANATOMICAL\_COLLAPSE (loss of limbs or facial warping), or CANON\_INVARIANT\_BREACH (a missing somatic wound or banned costume element).

### **3\. Actionable Remediation Routing**

When Jules detects a defect, it strips subjective language and emits a structured JSON diagnostic ticket (the Diagnostic Remediation Ticket).

> * **Actionable Next Steps:** The ticket provides exact remediation instructions, such as recommending negative prompt weights (e.g., "add negative prompt tokens for 'symmetrical ears, intact ears'") or supplying exact pixel deltas for automated JSX patching downstream.  
> * **The Escalation Circuit Breaker:** If Jules is dispatched to execute an automated patch, the system tracks its trajectory via a Three-Cycle Escalation Rule. If the agent gets stuck in a loop or causes a divergence (fixing one error but creating a structural conflict), the pipeline executes a hard halt and escalates the ticket to a human Story Architect.

---

*User prompt: now look at the beginning of the conversation and create a 3000 page summary on what has been discussed on Series-Assets-Visual up until the last response and if you can add anything worthy and new which should be included*

# **Response: The Definitive Architecture of \[series-assets-visual\]**

### **A Strongly-Typed Visual API, Deterministic Triage Gauntlet, and Archival Substrate for Generative Media Pipelines**

## **1\. Executive Summary & Epistemological Stance**

### **The Problem: Generative Entropy & The Beige Plague**

Generative neural networks—whether spatial-temporal diffusion models (Wan 2.2, SDXL, Flux) or Large Language Models (LLMs)—are fundamentally non-deterministic, probabilistic token and latent predictors. When granted state, temporal, or spatial authority within an episodic animated pipeline, these systems inevitably succumb to catastrophic failure modes:

> 1. **The Median Regression Trap ("The Beige Plague"):** Unconstrained diffusion models naturally regress toward the statistical median of their training weights. Characters prompted across varying emotional extremes collapse into homogeneous, symmetrical, aesthetically bland faces. When prompting different characters (e.g., Bog vs. Spleen) under shared emotional tokens like "humiliated", the models default to an identical, sad-faced mean.  
> 2. **Context Window & Somatic Amnesia:** Probabilistic generators possess zero native concept of object permanence, persistent biological injury, or narrative debt. Characters regenerate severed limbs, switch wardrobe colors, lose facial scars, and introduce anachronistic artifacts (e.g., zippers, plastics) mid-shot.  
> 3. **The Illusion of the Clean Alpha & Edge Boil:** Generative green-screen keying (\#00FF00) suffers from non-deterministic edge sampling. Localized sub-pixel noise, fluctuating anti-aliasing contours, and chroma fringe cause "edge crawl" and visual chatter when keyed over hand-painted environmental plates.  
> 4. **The Engineering Fiction Trap:** Complex organizational abstractions (e.g., 23-pod slime-mold organizations, speculative Merkle trees, multi-agent transactional negotiations) frequently serve as sophisticated engineering procrastination, simulating operational rigor before a single frame is rendered.

### **The Solution: The Visual Repository as a Typed API**

The repository **\[series-assets-visual\]** is not a static media folder or an unorganized asset bucket; it functions as a **strongly-typed, compile-time Visual API**.

> * **Inversion of Authority:** Generative models are demoted to **untrusted, headless rendering workers** with zero narrative, spatial, or temporal authority.  
> * **Separation of Meaning and Representation:** The upstream narrative engine (worker-sower-engine) exercises total authority over **Meaning (Axis A)**—who is present, what they know, what trauma they suffer, and what emotional state they enter. The viewport engine (\[series-assets-visual\] and goblin-viewport-template) owns **Representation (Axis B)**—the concrete pixel coordinates, sprite cutouts, mouth visemes, and camera transforms required to project narrative meaning onto a 2D canvas.  
> * **Deterministic Contract Enforcement:** Media production is treated as an incremental software compilation problem. Every visual asset is locked via spatial invariants, cryptographic content hashes, and a strict triage gauntlet before downstream compositors (Remotion) are permitted to import them.

               THE INVERSION OF VISUAL AUTHORITY  
                 
┌────────────────────────────────────────────────────────┐  
│ MEANING LAYER (Axis A: worker-sower-engine / Canon)    │  
│ • Owns truth, narrative state, trauma, and emotion      │  
│ • Declares: "Bog is humiliated; left shoulder injured" │  
└───────────────────────────┬────────────────────────────┘  
                            │ dialogue\_ast.json  
                            ▼  
┌────────────────────────────────────────────────────────┐  
│ REPRESENTATION LAYER (Axis B: \[series-assets-visual\])  │  
│ • Owns pixels, coordinates, visemes, and camera bounds │  
│ • Compiles: variants/bog\_humiliated.png                │  
│ • Maps: anchor\_point: {x: 518, y: 980}                 │  
│ • Enforces: 155-color LUT, alpha edge purity, entropy  │  
└────────────────────────────────────────────────────────┘

## **2\. Directory Topology & Candidate Staging**

The directory structure of \[series-assets-visual\] enforces strict spatial and functional encapsulation, preventing unverified generative experiments from polluting production code.

### **Standardized Directory Tree**

\[series-assets-visual\]/  
├── .gitattributes                    \# Enforces Git LFS for \*.png, \*.psd, \*.webp\[cite: 14\]  
├── package.json                      \# Versioning, asset build scripts, and linter hooks\[cite: 7\]  
├── versions.json                     \# Pinned visual semver hashes\[cite: 14\]  
├── environments/                     \# Location plates and matte passes\[cite: 14\]  
│   └── warm\_pipe/  
│       ├── manifest.json             \# Horizon lines, depth planes, lighting anchors  
│       ├── background.png            \# Hand-painted matte plate\[cite: 14\]  
│       └── occlusion\_mask.png        \# Foreground layering geometry  
└── characters/                       \# Character sprite libraries\[cite: 14\]  
    └── bog/  
        ├── manifest.json             \# The Authoritative Visual Contract\[cite: 14\]  
        ├── variants/                 \# Production-Promoted Visual Assets\[cite: 21\]  
        │   ├── bog\_idle.png  
        │   ├── bog\_humiliated.png  
        │   ├── bog\_smug.png  
        │   └── bog\_at\_ease.png  
        ├── emotion\_bank/             \# Quarantine Staging for Diffusion Takes\[cite: 14\]  
        │   ├── humiliated/  
        │   │   ├── take\_01.png       \# Raw candidate take  
        │   │   ├── take\_02.png       \# Raw candidate take  
        │   │   ├── take\_03.png       \# Winning candidate take  
        │   │   ├── take\_03\_silhouette.png \# Tier 2 1-bit alpha redaction mask  
        │   │   └── approved.json     \# The Rejection Ledger & Triage Audit\[cite: 14, 21\]  
        │   └── smug/  
        │       ├── take\_01.png  
        │       └── approved.json  
        └── mouth\_visemes/            \# Preston Blair Modular Phoneme Set\[cite: 14\]  
            ├── viseme\_closed.png  
            ├── viseme\_small.png  
            ├── viseme\_medium.png  
            └── viseme\_wide.png

### **Git LFS Architecture & Binary Isolation**

> * Standard Git object tracking is strictly disabled for raster media (\*.png, \*.psd, \*.webp, \*.wav) via the root .gitattributes configuration.  
> * Binary media is managed exclusively through Git Large File Storage (LFS) backed by Cloudflare R2 object storage.  
> * Pointers committed to the repository tree remain tiny (∼130 bytes), preventing the local Git object store (.git/objects) from bloating across iterative generative cycles.

## **3\. The Authoritative Schema Specification (manifest.json)**

Downstream execution runtimes (such as Remotion compositions inside \[series-viewport-template\]) treat character manifests as typed interfaces. Assets are never addressed via arbitrary file paths; they are consumed through immutable spatial coordinates, content-addressed cryptographic digests, and strict fallback hierarchies.

### **Formal JSON Schema Definition**

{  
  "\$schema": "https://json-schema.org/draft/2020-12/schema",  
  "title": "CharacterVisualManifest",  
  "type": "object",  
  "required": \[  
    "schema\_version",  
    "character\_id",  
    "base\_states",  
    "condition\_variants",  
    "visemes",  
    "animation\_hints"  
  \],  
  "properties": {  
    "schema\_version": { "type": "string", "enum": \["1.1.0"\] },  
    "character\_id": { "type": "string", "pattern": "^char\_\[a-z0-9\_\]+\$" },  
    "lying\_tell\_pose": { "type": "string" },  
    "base\_states": {  
      "type": "object",  
      "required": \["idle"\],  
      "properties": {  
        "idle": { "\$ref": "\#/\$defs/VisualAssetContract" }  
      }  
    },  
    "condition\_variants": {  
      "type": "object",  
      "additionalProperties": {  
        "oneOf": \[  
          { "\$ref": "\#/\$defs/VisualAssetContract" },  
          { "type": "null" }  
        \]  
      }  
    },  
    "visemes": {  
      "type": "object",  
      "required": \["closed", "small", "medium", "wide"\],  
      "additionalProperties": { "\$ref": "\#/\$defs/VisemeAssetContract" }  
    },  
    "animation\_hints": { "\$ref": "\#/\$defs/AnimationHintsContract" }  
  },  
  "\$defs": {  
    "VisualAssetContract": {  
      "type": "object",  
      "required": \[  
        "file",  
        "content\_hash",  
        "anchor\_point",  
        "crash\_zoom\_target",  
        "mouth\_bounding\_box"  
      \],  
      "properties": {  
        "file": { "type": "string" },  
        "content\_hash": { "type": "string", "pattern": "^sha256:\[a-f0-9\]{64}\$" },  
        "anchor\_point": { "\$ref": "\#/\$defs/Point2D" },  
        "crash\_zoom\_target": { "\$ref": "\#/\$defs/Point2D" },  
        "mouth\_bounding\_box": { "\$ref": "\#/\$defs/BoundingBox" }  
      }  
    },  
    "VisemeAssetContract": {  
      "type": "object",  
      "required": \["file", "content\_hash", "local\_offset"\],  
      "properties": {  
        "file": { "type": "string" },  
        "content\_hash": { "type": "string", "pattern": "^sha256:\[a-f0-9\]{64}\$" },  
        "local\_offset": { "\$ref": "\#/\$defs/Point2D" }  
      }  
    },  
    "AnimationHintsContract": {  
      "type": "object",  
      "required": \[  
        "talk\_bounce\_amplitude",  
        "idle\_shiver\_amplitude",  
        "mass\_scalar",  
        "bounce\_frequency\_hz",  
        "idle\_sway\_amplitude\_px"  
      \],  
      "properties": {  
        "talk\_bounce\_amplitude": { "type": "number", "minimum": 0, "maximum": 50 },  
        "idle\_shiver\_amplitude": { "type": "number", "minimum": 0, "maximum": 50 },  
        "mass\_scalar": { "type": "number", "minimum": 0.1, "maximum": 5.0 },  
        "bounce\_frequency\_hz": { "type": "number", "minimum": 0.1, "maximum": 10.0 },  
        "idle\_sway\_amplitude\_px": { "type": "number", "minimum": 0, "maximum": 100 }  
      }  
    },  
    "Point2D": {  
      "type": "object",  
      "required": \["x", "y"\],  
      "properties": {  
        "x": { "type": "number" },  
        "y": { "type": "number" }  
      }  
    },  
    "BoundingBox": {  
      "type": "object",  
      "required": \["x", "y", "width", "height"\],  
      "properties": {  
        "x": { "type": "number" },  
        "y": { "type": "number" },  
        "width": { "type": "number", "minimum": 1 },  
        "height": { "type": "number", "minimum": 1 }  
      }  
    }  
  }  
}

## **4\. Spatial Invariants & Coordinate Mathematics**

A critical defect in automated 2D procedural puppet systems is the **Decapitation Defect** (or "floating puppet anomaly"), where local sprite coordinate offsets are applied directly to a global composition viewport without accounting for stage projection, sprite scaling, and camera interpolation.

               GLOBAL STAGE PROJECTION & CAMERA MATRIX  
                 
   (0,0) Master Canvas (1920x1080)  
     ┌────────────────────────────────────────────────────────┐  
     │                                                        │  
     │                      (originX\_glob, originY\_glob)      │  
     │                                 ▼                      │  
     │                           \* \[Eye Centroid\]             │  
     │                       ┌───────┐                        │  
     │                       │       │                        │  
     │                       │ Bog   │                        │  
     │                       │       │                        │  
     │                       └───┬───┘                        │  
     │                           ▼                            │  
     │     ──────────────────────\*───────────────────────     │  
     │                  (X\_stage, Y\_ground)                   │  
     │                  \[anchor\_point: (518, 980)\]            │  
     └────────────────────────────────────────────────────────┘

### **1\. Ground Contact Pivot (anchor\_point)**

> * **Role:** Establishes the sub-pixel floor-plane registration point (foot contact).  
> * **Math:** When placing a character sprite of native dimensions *W*sprite​×*H*sprite​ at a stage coordinate (*X*stage​,*Y*ground​), the top-left translation coordinates (TranslateX,TranslateY) are derived as:  
>   TranslateX=*X*stage​−(anchor\_point.x×*s*)  
>   TranslateY=*Y*ground​−(anchor\_point.y×*s*)  
>   where *s* is the active layout scale scalar (*s*\=scale). This guarantees that when a puppet switches condition variants (e.g., from idle to humiliated), the character's feet remain locked to the stage horizon without vertical jitter or ground slippage.

### **2\. Camera Focus Target (crash\_zoom\_target) & Decapitation Prevention**

> * **Role:** Dictates the exact focal center (eye centroid / bridge of nose) for dramatic push-ins, crash zooms, and reaction framing.  
> * **Math:** Remotion camera containers utilize CSS transformOrigin defined in global canvas percentages. Applying the local pixel coordinate directly causes the camera to frame empty space. The compiler converts local targets into global canvas space (*W*canvas​\=1920,*H*canvas​\=1080):  
>   *X*target\_global​\=TranslateX+(crash\_zoom\_target.x×*s*)  
>   *Y*target\_global​\=TranslateY+(crash\_zoom\_target.y×*s*)  
>   originXglobal​\=(*W*canvas​*X*target\_global​​)×100%  
>   originYglobal​\=(*H*canvas​*Y*target\_global​​)×100%  
> * **Source-Baking Optimization:** These percentages are computed at compile-time and stamped as static literals into JSX props (e.g., \<Shot02CameraWrapper originX="48.24%" originY="21.15%"\>), eliminating runtime trigonometric overhead during Remotion rendering.

### **3\. Mouth Viseme Envelope (mouth\_bounding\_box)**

> * **Role:** Defines the exact 2D envelope where Preston Blair phoneme sprites (viseme\_\*.png) snap over the static base sprite.  
> * **Math:** The viseme overlay container is scaled and translated relative to the sprite:  
>   VisemeX=mouth\_bounding\_box.x+viseme.local\_offset.x  
>   VisemeY=mouth\_bounding\_box.y+viseme.local\_offset.y  
>   This isolates mouth animation from facial generation, allowing zero-drift phoneme playback driven by acoustic speech analysis.

### **4\. Kinetic Physics Parameterization (animation\_hints)**

Procedural puppets suffer from the "mechanical metronome" defect if every entity oscillates using identical sine waves. The animation\_hints object parameters feed the universal presentation component (GoblinPuppet.tsx) to govern procedural motion:

> * **Speech Recoil:**  
>   Δ*y*talk​(*t*)=sin(2*π*⋅*f*bounce​⋅*t*)×*A*talk​  
>   where *A*talk​\=talk\_bounce\_amplitude and *f*bounce​\=bounce\_frequency\_hz.  
> * **Dynamic Contact Shadowing:** The elliptical ground shadow scales inversely with vertical recoil:  
>   ShadowScale(*t*)=1.0−(*A*talk​Δ*y*talk​(*t*)​×0.25)  
>   ShadowOpacity(*t*)=0.65−(*A*talk​Δ*y*talk​(*t*)​×0.25)  
>   This grounds the puppet, creating an organic sense of mass and floor contact during dialogue.  
> * **Somatic Disturbance Jitter:** High-frequency jitter reflects physical trauma, hypothermia, or intense anxiety:  
>   Δ*x*shiver​(*t*)=P(*t*,seed)×*A*shiver​  
>   Δ*y*shiver​(*t*)=P(*t*\+100,seed)×*A*shiver​  
>   where P is a deterministic 1D pseudo-random noise generator and *A*shiver​\=idle\_shiver\_amplitude.

## **5\. The Four-Dimensional Specification Matrix & Triage Gauntlet**

To eliminate generic emotional collapse and cross-character silhouette bleed, every emotional condition in \[series-lore\] is bound to a **Four-Dimensional Specification Matrix**.

┌────────────────────────────────────────────────────────────────────────┐  
│             THE FOUR-DIMENSIONAL SPECIFICATION MATRIX                  │  
├──────────────────────────────────┬─────────────────────────────────────┤  
│ 1\. Condition ID                  │ 2\. Physical / Somatic Staging       │  
│ • Unified taxonomy bind          │ • Actionable anatomical geometry    │  
│ • Immutable string key           │ • Joint angles, tension, eye lines  │  
├──────────────────────────────────┼─────────────────────────────────────┤  
│ 3\. Prompt Fragment Injection     │ 4\. Distinctness Boundary Checks     │  
│ • Locked diffusion token weights │ • Negative constraints              │  
│ • Anti-generic style guidance    │ • Silhouette redaction & entropy    │  
└──────────────────────────────────┴─────────────────────────────────────┘

### **Dimension Breakdown**

> 1. **Condition ID (The Structural Anchor):** An immutable string key drawn from world/conditions.md (e.g., humiliated, smug, terrified, at\_ease). It couples narrative state to directory paths and manifest definitions.  
> 2. **Physical / Somatic Staging (The Bible Specification):** Actionable physiological instructions detailing posture, shoulder compression, gaze angle, and finger tension. Abstract emotional labels are strictly forbidden.  
> 3. **Prompt Fragment Injection (The Diffusion Guide):** A locked string of positive and negative token weights injected into ComfyUI pipelines.  
> 4. **Distinctness Boundary Checks (The Negative Constraints):** Explicit falsifiable conditions preventing identity collisions against alternative states or other cast members.

### **Detailed Exemplars**

#### **Exemplar A: Bog — humiliated**

> * **Condition ID:** humiliated  
> * **Physical Staging:** Interrupted control. Shoulders pulled inward and raised toward ears; elbows pinned tightly against the ribcage. Hands frozen mid-count, curling into tight, trembling fists. Gaze broken sharply down and to the left (avoiding eye contact). Jaw clamped shut with corners of the mouth pulled straight horizontally, not curved into a melodramatic frown.  
> * **Prompt Injection:** (inward shoulder slouch:1.2), (clenched trembling fists held at chest:1.15), gaze averted downward-left, tight horizontal lip line, suppressed mortification, rigid posture, high tension, detailed line art, muted tones, \--no open mouth, weeping, melodramatic frown, loose limbs.  
> * **Distinctness Boundary:** Must **not** exhibit loose-limbed, ragdoll defeat or a full-body inward hunch (which canonically belongs to Spleen). Must **not** feature downturned cartoon lips or tears.

#### **Exemplar B: Bog — smug**

> * **Condition ID:** smug  
> * **Physical Staging:** Quiet, predatory stillness. Chin elevated 15 degrees above the horizontal plane. Spine extended to its maximum physiological limit. One eyebrow cocked slightly; eyelids half-dropped in heavy boredom. Mouth remains completely closed in a subtle, asymmetric smirk (no exposed teeth). Hands clasped behind the back.  
> * **Prompt Injection:** (elevated chin:1.1), (asymmetric closed-mouth smirk:1.1), half-lidded arrogant eyes, one arched eyebrow, erect rigid posture, hands clasped behind back, motionless confidence, \--no broad grin, showing teeth, laughing, cartoon wink.  
> * **Distinctness Boundary:** Must **not** feature an open-mouthed grin, broad toothy smile, or performative theatricality. Must remain distinct from defensive\_posturing.

#### **Exemplar C: Bog — at\_ease (The Comfort State)**

> * **Condition ID:** at\_ease  
> * **Physical Staging:** The Baseline of Contrast. Muscles visibly unclenched; shoulders dropped away from the ears. Hands resting flat on the thighs or loosely cradling a familiar object (the silver spoon) without white-knuckle pressure. Spine settles into a natural, unthreatened stoop. Gaze resting softly on a nearby physical prop.  
> * **Prompt Injection:** (completely relaxed posture:1.2), dropped shoulders, soft unburdened expression, hands loosely resting, calm breathing, peaceful goblin resting in warm light, \--no clenched fists, suspicious gaze, tactical tension, coiled muscles.  
> * **Distinctness Boundary:** Must **not** appear comatose, dead, or heavily sedated. Must retain Bog's characteristic asymmetric ear notch and facial structure while removing all traces of vigilance or paranoia.

#### **Exemplar D: The Physical Lying Tell (lying\_tell\_pose)**

> * **Condition ID:** Pointer to variants/bog\_humiliated.png (or dedicated deceptive variant).  
> * **Physical Staging:** Somatic freeze and motor interruption. Mid-speech, Bog's hands abruptly cease counting or manipulating objects; his fingers lock into rigid hooks against his belt. His left eyelid twitches upward once, and his gaze locks unnaturally onto his listener's forehead.  
> * **Architectural Linkage:** Tied directly to the narrative engine's Epistemic Vector. When dialogue\_ast.json emits an utterance where internal\_belief \!= spoken\_statement (or an active RESTRAINED\_KNOWLEDGE directive exists), the Remotion compositor automatically hot-swaps the active sprite to lying\_tell\_pose, physically exposing the character's deception on screen without requiring narrative exposition.

## **6\. The Three-Tier Automated Triage Gauntlet**

Candidate takes deposited into emotion\_bank/{emotion}/ must clear three hierarchical, automated validation gates before promotional clearance is granted.

                     THE TRIAGE GAUNTLET  
                       
   ┌────────────────────────────────────────────────────────┐  
   │ TIER 1: DETERMINISTIC PIXEL GATE (Physical Invariants) │  
   │ • Palette Conformity: 100% in 155-color master LUT     │  
   │ • Alpha Edge Sweep: Green spill G \- max(R,B) \< 12      │  
   │ • Perceptual Hash: pHash cosine distance \> 0.12        │  
   └───────────────────────────┬────────────────────────────┘  
                               │ Exit 0  
                               ▼  
   ┌────────────────────────────────────────────────────────┐  
   │ TIER 2: ADVERSARIAL SILHOUETTE & METRIC DRIFT          │  
   │ • Silhouette Redaction: 1-bit alpha mask extraction    │  
   │ • Posture Classifier: Identity entropy H \< 0.15 nats   │  
   │ • Metric Invariants: DINOv2 \<= 0.08, LPIPS \<= 0.12     │  
   └───────────────────────────┬────────────────────────────┘  
                               │ Exit 0  
                               ▼  
   ┌────────────────────────────────────────────────────────┐  
   │ TIER 3: JULES MULTIMODAL SEMANTIC AUDIT                │  
   │ • Mandatory scan trace: \<visual\_scan\_trace\> emission   │  
   │ • Coordinate extraction: Eyes, mouth, ground contact   │  
   │ • Bible Alignment: Negative distinctness checks        │  
   └───────────────────────────┬────────────────────────────┘  
                               │ Exit 0  
                               ▼  
                PROMOTION & MANIFEST SYNCHRONIZATION

### **Tier 1: Deterministic Pixel Integrity (palette\_enforce.py)**

Operating with near-zero compute cost, Tier 1 uses deterministic computer vision algorithms to discard unviable generations:

> 1. **Palette Conformity:** Asserts that 100% of candidate RGB values exist within the studio's 155-color master Look-Up Table (LUT). Generative outputs containing muddy intermediate tones, neon clipping, or out-of-gamut pigments fail immediately.  
> 2. **Per-Pixel Alpha Edge Purity:** Scans the transparency mask along the outer 3-pixel contour. Simple channel averages are prohibited because they permit localized halos to pass. Instead, the gate evaluates the 99th-percentile green spill excess:  
>    Spillpixel​\=*G*−max(*R*,*B*)  
>    The asset passes only if Spill99th​\<12 across the boundary band, guaranteeing zero edge fringing during compositing.  
> 3. **Perceptual Deduplication:** Computes perceptual hashes (pHash) against all existing variants. Candidate takes with cosine distance ≤0.12 are discarded as redundant seed duplicates.

### **Tier 2: Adversarial Silhouette Gating & Metric Drift**

Tier 2 evaluates silhouette distinctness and feature stability using deterministic metric spaces:

> 1. **The Visual Redaction Test:** The candidate sprite is converted into a pure 1-bit binary alpha mask (take\_XX\_silhouette.png), completely eliminating color, texture, and facial details.  
> 2. **Classification Entropy Gating:** A lightweight convolutional classifier—trained specifically on the ensemble cast's posture silhouettes with reported held-out test accuracy—evaluates the binary mask. The entropy of the predicted class distribution is evaluated:  
>    *H*(*X*)=−*i*\=1∑*C*​*P*(*ci*​)log*e*​*P*(*ci*​)  
>    For a three-character cast (*C*\=3, theoretical max entropy ≈1.10 nats), the asset must achieve *H*(*X*)\<0.15 nats. This mathematically ensures that Bog's hunched, tense silhouette is instantly recognizable from Spleen's loose droop or Wart's rigid spine in total darkness.  
> 3. **Embedding Tensor Stability:** Evaluates perceptual drift against the character's golden baseline:  
   * **DINOv2 Feature Distance:** Cosine distance must satisfy *D*DINO​≤0.08.  
   * **LPIPS Perceptual Patch Variance:** High-frequency texture variance must satisfy ΔLPIPS​≤0.12.  
   * **ArcFace Divergence:** Facial landmark feature distance must remain ≤0.10.

### **Tier 3: Jules Multimodal Semantic Auditing**

Generative Vision-Language Models (VLMs) will hallucinate approvals if asked for unstructured aesthetic evaluations. Tier 3 forces the Jules agent into an objective, coordinate-grounded verification procedure:

> 1. **Mandatory Attention Grounding (\<visual\_scan\_trace\>):** The model is structurally forbidden from emitting a JSON approval verdict without first outputting an explicit optical scan trace containing raw pixel coordinates:  
>    \<visual\_scan\_trace\>  
>    1\. Eye Centroid Scan: Detected pupils at \[x: 412, y: 198\]. Delta from base: 0.8px.  
>    2\. Mouth Envelope Scan: Perimeter bounds \[x: 380, y: 240, w: 64, h: 32\]. Lip posture: Flat horizontal line. Frown curvature: 0.00.  
>    3\. Somatic Invariant Check: Left ear tip inspected at \[x: 480, y: 172\]. Canonical 12px wedge excision notch CONFIRMED.  
>    4\. Anachronism Sweep: Clothing seams checked. Fasteners: Bone peg detected. Modern zippers: NONE. Synthetic sheen: NONE.  
>    5\. Distinctness Check: Hand position \[x: 395, y: 512\] curled into closed fists. Loose-limbed Spleen bleed: NEGATIVE.  
>    \</visual\_scan\_trace\>

2\. **Diagnostic Severity Matrix:** Violations are classified into a strict jurisprudence framework:

> * **Severity 1 (Nitpick):** Sub-pixel raster alignment jitter (\<2px). Non-blocking warning.  
> * **Severity 2 (Friction):** Soft color-temperature shift (Δ*E*\<3.0). Non-blocking warning.  
> * **Severity 3 (Violation):** Somatic invariant breach (missing ear notch, healed canonical scar, illegal bimanual motor action). Test failure and take rejection.  
> * **Severity 4 (Heresy):** Anachronistic materials (zippers, plastic, digital watches) or severe anatomical collapse. Immediate pipeline halt and alerting.

## **7\. The Rejection Ledger (approved.json)**

Rejected takes are never deleted; their physical files and structured failure diagnostics are preserved permanently in approved.json to prevent generative models from re-sampling flawed latent regions.

{  
  "\$schema": "https://json-schema.org/draft/2020-12/schema",  
  "schema\_version": "1.1.0",  
  "character": "bog",  
  "emotion": "humiliated",  
  "approved\_take": "take\_03.png",  
  "approved\_take\_hash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",  
  "optical\_anchors": {  
    "eye\_centroid": { "x": 412, "y": 198 },  
    "mouth\_bounding\_box": { "x": 380, "y": 240, "width": 64, "height": 32 },  
    "ground\_contact\_point": { "x": 518, "y": 980 }  
  },  
  "rejected\_takes": \[  
    {  
      "file": "take\_01.png",  
      "content\_hash": "sha256:9a32c7104b2a8d11c4e782901a18274d8127391028471bade001289471928410",  
      "rejection\_class": "SEMANTIC\_FAILURE",  
      "failing\_metric": "mouth\_curvature",  
      "measured\_value": \-0.42,  
      "permitted\_range": "\[-0.05, 0.05\]",  
      "reason": "Mouth drooped into a downward arc; read as melodramatic weeping sadness rather than interrupted control per bible spec."  
    },  
    {  
      "file": "take\_02.png",  
      "content\_hash": "sha256:11bce40182749102837401928374019283740192837401928374019283740192",  
      "rejection\_class": "CROSS\_CHARACTER\_BLEED",  
      "failing\_metric": "silhouette\_entropy",  
      "measured\_value": 0.38,  
      "permitted\_range": "\< 0.15",  
      "reason": "Spine curvature and hanging arms collided with Spleen silhouette baseline."  
    },  
    {  
      "file": "take\_04.png",  
      "content\_hash": "sha256:eed4910284710293847102938471029384710293847102938471029384710293",  
      "rejection\_class": "PHYSICAL\_DEFECT",  
      "failing\_metric": "alpha\_green\_spill\_99th",  
      "measured\_value": 24.2,  
      "permitted\_range": "\< 12.0",  
      "reason": "Chroma-key green edge fringe along collar contour failed alpha purity threshold."  
    }  
  \],  
  "governance": {  
    "triaged\_by\_agent": "jules-multimodal-v2",  
    "git\_pr\_number": 142,  
    "reviewed\_by\_user": "art-director-lead",  
    "approved\_at\_utc": "2026-09-18T14:22:00Z"  
  }  
}

### **Governance Rule: Separation of Audit Powers**

> 1. Automated agents write diagnostic logs (rejection\_class, measured\_value, reason), but **cannot approve assets**.  
> 2. Hard branch protection blocks direct commits to main.  
> 3. Merging requires an explicit pull request review from an authorized human art director.  
> 4. The deployment pipeline extracts reviewed\_by\_user and git\_pr\_number directly from the authenticated GitHub API during CI execution, preventing synthetic tampering with sign-off credentials.

## **8\. The Explicit Null Protocol & The Waiver Ledger**

Art generation frequently lags behind algorithmic script compilation. Missing assets must never crash development pipelines or trigger silent fallbacks in broadcast masters.

                     THE EXPLICIT NULL LIFECYCLE  
                       
                     AST references variant  
                               │  
                ┌──────────────┴──────────────┐  
                ▼                             ▼  
        Variant exists                Variant is NULL  
                │                             │  
         Load variant PNG                     │  
                               ┌──────────────┴──────────────┐  
                               ▼                             ▼  
                          Draft Mode                   Release Mode  
                               │                             │  
                        Log WARN                      Scan Waiver Ledger  
                        Fallback to idle                     │  
                        Inherit base coordinates      ┌──────┴──────┐  
                                                      ▼             ▼  
                                                Waiver valid   No waiver  
                                                      │             │  
                                                Inject notice     HALT  
                                                (Exit 0\)       (Exit 1\)

### **The Explicit Null Contract**

> * Omitting an emotion key from manifest.json is treated as a structural schema error (SCHEMA\_PARSE\_ERROR).  
> * If an asset has not yet been illustrated, it must be explicitly committed as null:  
>   "condition\_variants": {  
>     "humiliated": { "\$ref": "..." },  
>     "terrified": null,  
>     "grieving": null  
>   }

This explicitly communicates an acknowledged production gap rather than a forgotten file.

### **Dual-Phase Execution Gate**

> 1. **Draft / Animatic Compilation:**  
   * The compiler detects variant \== null.  
   * It logs a non-blocking COMPILER\_WARN.  
   * It safely substitutes base\_states.idle.file and inherits the idle state's anchor\_point, allowing animatic renders to proceed without runtime crashes.  
> 2. **Release / Broadcast Mastering Gate:**  
   * Enforces zero-tolerance invariant validation:  
     ∀shot∈Episode,referenced\_variant(shot)=null  
   * If any shot references a null variant, compilation aborts with Exit Code 1, preventing unfinished animation from reaching distribution.

### **The Waiver Ledger (waivers.json)**

The only mechanism to override a broadcast release halt is an entry in waivers.json, signed cryptographically by the showrunner:

{  
  "waiver\_id": "wv\_ep04\_bog\_terrified\_001",  
  "episode": "ep004",  
  "scene\_id": "sc002\_shot03",  
  "character": "bog",  
  "missing\_variant": "terrified",  
  "permitted\_fallback": "idle",  
  "reason": "Terrified plate delayed in Tier 2 triage; staging approved using idle with high-frequency shiver override.",  
  "authorized\_by": "showrunner\_signature\_ed25519",  
  "expires\_at": "2026-10-01T00:00:00Z"  
}

## **9\. Downstream Ingestion, Storage Ceilings, & Cryptographic Traps**

To protect downstream render nodes from network bloat, out-of-memory errors, and infinite CI wait states, \[series-assets-visual\] enforces strict ingestion rules.

### **1\. Tagged Shallow Synchronization (sync-assets.ts)**

> * Downstream compositors do not track main.  
> * Builds read an immutable versions.json lockfile and execute a shallow, tree-filtered clone:  
>   git clone \\  
>     \--depth 1 \\  
>     \--branch v1.4.0 \\  
>     \--filter=blob:none \\  
>     \--no-checkout \\  
>     https://github.com/studio/\[series\]-assets-visual.git \\  
>     ./cache/assets-visual/

This isolates the build runner from hundreds of historical commits and unneeded assets.

### **2\. AST Dependency Harvesting (collect-episode-assets.ts)**

Instead of copying the full multi-gigabyte asset vault into every episode directory, the compiler parses dialogue\_ast.json before rendering:

> * Scans all spoken beats for referenced character IDs.  
> * Identifies referenced condition variants (e.g., bog\_humiliated.png) and the base idle.png.  
> * Inspects phoneme cue timelines to extract only the required Preston Blair visemes.  
> * Extracts the specific background plate specified by location\_id.  
> * Copies only this minimal subset into the local build bundle (public/assets/).  
> * **Efficiency:** Compresses workspace staging payloads from \>2.4 GB down to 12–28 MB (\>90% reduction), allowing builds to render cleanly inside memory-constrained Docker runners.

### **3\. The 150MB Storage Envelope**

> * **Target Budget:** \<100 MB per episode asset payload.  
> * **Hard Storage Ceiling:** 150 MB.  
> * Evaluated immediately post-harvest at compile-time (*T*0​). If the harvested assets exceed 150 MB, the process aborts with Exit Code 1 before allocating expensive headless GPU/Chromium instances (*T*3​).

### **4\. The Zero-Byte Poison Sentinel**

Corrupted Git LFS checkouts or terminated network streams frequently write empty (0-byte) files or 130-byte text pointer files to disk. When headless Chromium loads these files into an HTML5 \<canvas\>, it crashes or silently renders black frames.

> * The compiler hashes every harvested file, testing against the empty SHA-256 constant:  
>   SHA-256empty​\=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
> * If any asset matches this digest, or if its size is \<1024 bytes for raster plates, the build aborts immediately with a fatal CORRUPTED\_ZERO\_BYTE\_ASSET error.

## **10\. Autonomous Remediation & The Three-Cycle Circuit Breaker**

When visual integration defects occur during compositor execution, the system employs an automated remediation loop to correct coordinates without introducing human delays.

                     DEFECT REMEDIATION & THE CIRCUIT BREAKER  
                       
                            Integration Defect Detected  
                                        │  
                         Emit Diagnostic JSON Ticket  
                                        │  
                         Is Loop Count N \>= 3?  
                                        │  
                         ┌──────────────┴──────────────┐  
                         ▼                             ▼  
                       YES                             NO  
                        │                              │  
                 Trigger Circuit Breaker        Categorize Defect  
                 Atomic git rollback                   │  
                 Lock isolate                   ┌──────┴──────┐  
                 Tag \#ESCALATED                 ▼             ▼  
                 Route to Lead Architect    ASSET\_ERROR   CODE\_ERROR  
                                                │             │  
                                           Route to Art   ts-morph AST patch  
                                           (Do not hack)  Local verification  
                                                          Increment N

### **Defect Routing Taxonomy**

> * **ASSET\_ERROR:** The JSX properties match the manifest coordinates, but the rendered visual plate drifts \>4px off-anchor. The issue is routed back to POD-07 (Asset Forge) for source-art redrawing. Automated code agents are strictly prohibited from adding arbitrary JSX translation hacks to mask defective art.  
> * **CODE\_ERROR:** The sprite plate matches the specification, but JSX layout properties deviate from manifest.json. Jules is dispatched to patch the code.

### **Minimal Enclosing Unit (MEU) Code Patching**

> * For CODE\_ERROR tickets, Jules uses the TypeScript Compiler API (ts-morph) to mutate only the failing JSX attribute in place.  
> * It executes an isolated test render over the affected frame window (e.g., 24–48 frames) using software rasterization (--gl=swangle) on a headless CPU worker.  
> * This confirms the geometric fix at \$0.00 GPU spend, avoiding full-scene re-renders.

### **The Three-Cycle Circuit Breaker**

Automated repair agents can easily enter infinite oscillation loops (e.g., adjusting an anchor to fix safe-zone framing, which in turn clips a mouth viseme).

> * The remediation loop tracks repair iterations (*N*).  
> * If an asset or JSX block fails to converge within **three automated cycles (*N*\=3)**, or if a repair introduces a new invariant violation in an adjacent category, the **Circuit Breaker trips**.  
> * The pipeline executes an atomic git reset \--hard to the pre-repair commit, locks the isolate, applies the tag \#ESCALATED\_REVISION\_CEILING\_BREACHED, and routes the structured ticket directly to the Lead Human Architect.

## **11\. Pod Governance, Storage Tiers, & Binary Maintenance**

Authority over \[series-assets-visual\] is partitioned across functional studio pods to prevent any single entity from autonomously authoring, validating, and consuming assets.

### **Pod Division of Sovereignty**

| Studio Pod | Functional Mandate | Boundaries & Prohibitions |
| :---- | :---- | :---- |
| **POD-07 (Asset Forge)** | Produces master character designs, LoRAs, condition variants, and hand-painted matte plates. | Forbidden from modifying rendering code or bypassing Tier 1–3 triage gates. |
| **POD-06 (Data Ops & Model Lifecycle)** | Technical custodian of model checkpoints, R2 bucket policies, and reproducibility environments. | Enforces the 14-day pruning TTL on unpromoted latents; cannot override artistic criteria. |
| **POD-01 (Legal & Clearance)** | Conducts algorithmic copyright scans and signs cryptographic C2PA provenance manifests. | Holds absolute veto power; unsigned assets cannot enter production registries. |
| **POD-15 (Scene Pods / Execution Nodes)** | Untrusted consumers that render final shots using locked manifests and LoRAs. | Strictly barred from training local LoRAs, altering sprites, or diverging from published manifests. |
| **POD-13 (Polish Pod)** | Executes surgical inpainting and ControlNet cleanup on generated video frames. | Constrained strictly to locked character geometries; cannot alter narrative beats. |

### **Storage Tiers & The Expanded Deletion Principle**

Narrative code belongs to Class 1 Durability (fully derivable from text), but diffusion media belongs to **Class 3 Durability: Archive-Dependent Evidence**. GPU kernel variance, sampler non-determinism, and CUDA floating-point rounding prevent diffusion frames from being reproduced bit-for-bit from a seed alone. Master visual assets must be preserved across a three-tier storage topology:

> * **Tier 1 (Hot Scratchpad):** Local NVMe flash arrays. Holds transient frames, intermediate passes, and uncompressed audio stems during active rendering. Auto-purged post-render.  
> * **Tier 2 (Warm Object Vault):** Cloudflare R2 Content-Addressed Storage. Houses promoted condition variants, matte plates, and C2PA manifests. Read-through caching with zero egress fees allows parallel headless renderers to stream binaries dynamically.  
> * **Tier 3 (Cold Sovereign Archive):** AWS Glacier / Backblaze B2 with WORM (Write-Once-Read-Many) object locking. Holds final broadcast masters, discrete stems, and immutable render manifests for permanent preservation.

### **The 3-2-1 Backup & Maintenance Regimen**

> * **3 Copies, 2 Media Types, 1 Offsite:** Working copies on local NVMe arrays, warm object storage in Cloudflare R2, and immutable cold storage in AWS Glacier.  
> * **Differentiated Expiration Lifecycle:** Promoted canonical variants and locked broadcast masters are preserved indefinitely. Unpromoted candidates, rejected takes, and intermediate greenscreen buffers are deleted automatically after **14 days** via bucket lifecycle policies.  
> * **The Rolling Range Cursor Scrubber:** Random sampling is statistically inadequate for detecting silent bit-rot (sampling 5% with replacement leaves 36.8% of an archive unchecked over 20 cycles due to the *e*−1 limit). A background daemon executes a deterministic, hash-ordered cursor that recalculates the SHA-256 digest of **100% of archived objects every 30 days**, flagging bit-rot against the provenance manifest.  
> * **15th-of-the-Month Cold Restore Drills:** On the 15th of every month, an automated CI worker restores a historical episode purely from cold object bytes into an isolated runner. It recompiles the Remotion composition from scratch and asserts that output hashes match the original locked render\_manifest.json. A single digest mismatch triggers a critical infrastructure alert.

## **12\. Strategic New Additions to the Visual Architecture**

To close the remaining operational gaps between the visual repository and downstream render execution, the following two protocols are formally incorporated into \[series-assets-visual\]:

### **1\. The Temporal Deflicker Node (Alpha-Matte Isolation)**

> * **The Operational Problem:** Keying green-screen diffusion plates over static hand-painted matte backgrounds produces edge crawl and sub-pixel edge boil. This occurs because generative diffusion models do not enforce temporal coherence across alpha contours, causing high-contrast edges to vibrate unnaturally between frames.  
> * **The Architectural Solution:** Compositing pipelines must isolate the alpha channel into a dedicated single-channel grayscale buffer (*At*​) prior to layer merging. A localized temporal deflicker node evaluates frame-to-frame alpha variance:  
>   *At*clean​(*x*,*y*)=clamp(*At*​(*x*,*y*),*At*−1​(*x*,*y*)−*δ*max​,*At*−1​(*x*,*y*)+*δ*max​)  
>   where *δ*max​ is a maximum edge-shift threshold calibrated to the character's active motion vector. This eliminates high-frequency boundary chatter while preserving intentional silhouette movement.

### **2\. The Native 12fps "On Twos" Rendering Cadence**

> * **The Operational Problem:** High-resolution video diffusion models (e.g., Wan 2.2, HunyuanVideo) run with high computational overhead and GPU thermal demands. Attempting to render raw 24fps diffusion video creates severe cloud GPU costs and frequently causes frame-rate cadence judder if the native checkpoint operates at 16fps.  
> * **The Architectural Solution:** The visual asset and generative video pipelines standardize on an explicit **12fps rendering cadence ("animating on twos")**.  
  * Diffusion backends render native 12fps image sequences.  
  * Downstream Remotion compositors operate on an industry-standard 24fps project timeline, holding each diffusion frame for exactly two ticks.  
  * **Economic & Aesthetic Yield:** This reduces cloud GPU inference costs and VRAM tenancy by ∼50% while establishing a traditional hand-drawn cinematic cadence that masks minor generative frame inconsistencies.

## **13\. Summary: Non-Negotiable Invariants of \[series-assets-visual\]**

> 1. **Meaning Precedes Representation:** Upstream narrative state determines character emotion and physical injury; downstream visual manifests determine pixels, anchors, and visemes. Representation never mutates narrative truth.  
> 2. **Explicit Null Safety:** Missing visual variants must be committed as null. Draft pipelines fall back to idle with non-blocking warnings; broadcast release pipelines halt immediately unless a signed entry exists in waivers.json.  
> 3. **No Decorative Human Sign-Offs:** Approval is not an editable JSON string. Approvals require authenticated GitHub Pull Request reviews under branch protection, with credentials verified via the GitHub API.  
> 4. **Zero-Byte Poison Trap:** Any staged asset matching the empty SHA-256 hash or measuring \<1024 bytes triggers an immediate compile-time abort, preventing downstream Chromium renderers from crashing on unhydrated pointers.  
> 5. **The 150MB Episode Envelope:** Cherry-picking assets via AST dependency harvesting keeps per-episode staging bundles under the 150 MB ceiling, eliminating out-of-memory errors on containerized rendering nodes.  
> 6. **Auditable Rejection Records:** Discarded generative takes are permanently cataloged in approved.json alongside negative diagnostic metrics to prevent the pipeline from repeating known generative failures.  
> 7. **The Three-Cycle Circuit Breaker:** Automated remediation agents are limited to three iterative repair attempts (*N*\=3) before execution trips, executing a clean Git rollback and alerting human engineering.

---
