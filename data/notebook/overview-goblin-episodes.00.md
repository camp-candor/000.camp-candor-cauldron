# **Overview: Goblin-Episodes.00**

[https://gemini.google.com/app/49b0517027860d75](https://gemini.google.com/app/49b0517027860d75)

*User prompt: we are starting working on the next repository \[ Goblin-Episodes \]; can you present me with a complete overview*

Response: goblin-episodes is the append-only, version-controlled repository of self-contained, immutable episode workspaces that store the source-baked compositions, local assets, provenance lockfiles, and rendered deliverables for the episodic generation pipeline.

Unlike monolithic video platforms that render changing dynamic payloads over shared code, goblin-episodes treats every episode as an autonomous software release package to guarantee bit-identical historical reproducibility across years of production.

### **1\. Core Architectural Mandate: Eradicating the Historical Corruption Trap**

The repository exists to permanently eliminate the **historical corruption trap** inherent in legacy video player engines:

> * **The Legacy Failure Mode:** In dynamic runtime systems (the retired goblin-viewport), a single application dynamically ingested mutable scene.json payloads at render time. Whenever shared puppet rigs (e.g., GoblinPuppet.tsx) or camera dampening curves were updated months later for newer episodes, re-rendering earlier episodes caused silent regressions—such as visemes detaching from chin lines, rubber-banding motion, or misaligned crash zooms.  
> * **The Metaprogram Isolation Model:** goblin-viewport-template acts strictly as an offline code-generation compiler and blueprint; it is never executed as a media runtime. Instead, its generator (generate-episode-repo.ts) compiles upstream narrative contracts into an isolated, committed workspace inside goblin-episodes/ (e.g., goblin-episodes/episode-040/ or ep040/).  
> * **Bit-Identical Replay:** Because each stamped workspace locks its dependencies, vendored components, media assets, and explicit literal TSX timelines, an episode can be executed years later and produce an identical optical result.

### **2\. Stamped Workspace Anatomy (episode-XXX/)**

Each episode stamped into goblin-episodes forms an autonomous, reproducible package with a strictly isolated filesystem layout:

goblin-episodes/ep040/  
├── Episode\_040.tsx              \# Source-baked static React composition  
├── render\_manifest.json          \# Cryptographic provenance & dependency lockfile  
├── remotion.config.ts           \# Pinned software OpenGL configuration (--gl=swangle)  
├── package.json                 \# Pinned exact dependencies (no carats)  
├── tsconfig.json                \# Locked compilation targets  
├── components/                  \# Vendored presentation primitives  
│   ├── GoblinPuppet.tsx         \# Isolated puppet rig  
│   ├── CameraWrappers.tsx       \# Per-shot scoped camera interpolations  
│   ├── AmbientTrack.tsx         \# Ducked audio bed  
│   └── FoleyTrack.tsx           \# Transient audio cues  
└── public/  
    └── assets/                  \# Pruned local media envelope (\< 100MB)  
        ├── sprites/             \# Harvested condition sprites (e.g., bog\_humiliated.png)  
        ├── visemes/             \# Harvested phoneme textures (closed, small, wide)  
        └── audio/               \# Uncompressed 48 kHz dialogue .wav stems

#### **Key Artifact Roles**

> * **Episode\_XXX.tsx (Source-Baking Pattern):** Timelines are compiled directly into static TypeScript JSX literals. Dynamic .map() loops and external JSON evaluation are forbidden. Start and end bounds are written as unquoted numeric literals (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>) to eliminate runtime parsing and prevent AST re-evaluation overhead.  
> * **render\_manifest.json (Provenance Lockfile):** Emitted at generation time to freeze the episode ID, generation timestamp, asset SHA-256 hashes, host execution environment (Node, Chromium, Remotion, FFmpeg), and the exact Git commit SHAs of worker-sower-engine, goblin-lore, goblin-assets-visual, and goblin-viewport-template.  
> * **Vendored Presentation Layer (components/):** Presentation components are either vendored directly into the workspace or pinned to an immutable semantic version (e.g., @studio/viewport@1.4.2) or Git SHA, preventing future global updates from altering historical framing or puppet physics.

### **3\. Pipeline Invariants & Spatial/Temporal Math**

Workspaces inside goblin-episodes adhere to rigid mathematical and resource constraints enforced by upstream compilers:

> * **Dual-Clock Frame Quantization:** Speech stems synthesized by the local TTS microservice serve as the non-negotiable master clock. Continuous physical duration measured in milliseconds (*D*ms​) via ffprobe is quantized into discrete 24 fps integer frames using the integer ceiling formula:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉  
> * **Absolute Timeline Offsets:** The compiler eliminates dynamic sequence chaining by computing absolute sequence start offsets ahead of time:  
>   fromFrame*k*​\=*i*\=1∑*k*−1​shot\_duration*i*​  
> * **Spatial Coordinate Normalization:** Local character sprite coordinates (1024×1024) are projected onto master canvas space (1920×1080 or 1280×720) at compile time, factoring in active scale (*s*) to bypass runtime math during headless rendering:  
>   originXglobal​\=canvas.widthpuppet.x+(anchor.x×*s*)​×100%,originYglobal​\=canvas.heightpuppet.y+(anchor.y×*s*)​×100%  
> * **Asset Envelope Harvesting (collect-episode-assets.ts):** Before rendering, the generator scans the scene AST and copies only referenced sprites, visemes, and audio stems into public/assets/, slashing asset footprint by \~90% and enforcing an episode storage ceiling under 100MB to 150MB.  
> * **Zero-Byte Poison Trap:** Rejects any staged binary asset matching the empty SHA-256 hash (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855) to prevent pipeline failure from truncated upstream transfers.  
> * **Pre-Flight Invariant Audit (\!MissingAssets):** An automated pre-render sweep audits the compiled TSX against local files. Missing background mattes, viseme files, or audio stems abort the compilation immediately with exit code 1 prior to initializing Chromium.

### **4\. Lifecycle State Machine & Execution Profile**

#### **The Sealed-File Lifecycle**

Every stamped Episode\_XXX.tsx carries a cryptographic header with lifecycle markers:

> 1. @lifecycle: generated: The default state stamped by CI/CD. Automated pipelines can safely regenerate and overwrite these files during iteration.  
> 2. @lifecycle: patched: Applied when diagnostic agents make automated AST adjustments (e.g., via ts-morph).  
> 3. @lifecycle: locked (The Showrunner Eject Button): Applied when a human director or editor manually modifies the composition file. Once marked @locked, upstream re-runs are blocked from clobbering the file; the generator will instead emit Episode\_XXX.candidate.tsx and raise a DIRECTOR\_OVERRIDE alert.

#### **Execution Profile & Hardware Boundary**

Rendering executes entirely on **Rig 1** (Host Orchestrator & Compositor):

> * **Hardware Demarcation:** Operates strictly on CPU and 64 GB system RAM, using **0 GB GPU VRAM**. All GPU VRAM is reserved for diffusion inference on Rig 2\.  
> * **Headless Chromium Execution:** Rendered via Remotion CLI with strict flags:  
>   npx remotion render Episode\_040 out.mp4 \--gl=swangle \--concurrency=1

> * Software OpenGL rendering (--gl=swangle) and single-thread concurrency prevent headless GPU driver crashes, Chromium memory leaks, and frame-dropping.  
> * **Permanent Canon Feedback:** Upon release finalization, the episode emits a machine-readable state\_delta.json recording somatic injuries, spent leverage, and character departures, which is routed via human review gates to reseal canonical law in goblin-lore.

Would you like to review the baseline package.json and directory scaffolding template for goblin-episodes, or establish the Git automation scripts (repo-bot integration) for stamping and locking incoming episode branches?

---

*User prompt: i think we will probally use the term \[series-episodes\] in addition to using \[goblin-episodes\]*

Response: Adopting **\[series-episodes\]** alongside **\[goblin-episodes\]** formalizes the boundary between the **abstract delivery contract** (the meta-ontology) and the **concrete story instance** (under-the-floorboards).

This distinction prevents the tooling from hardcoding goblin-specific assumptions and aligns the delivery tier with the universal narrative architecture.

### **1\. Architectural Role: Meta-Ontology vs. Story Instance**

The pipeline decouples narrative mechanics from specific diegetic content through the universal tuple ⟨S,A,I,R*m*​⟩ (State Space, Action Vocabulary, Invariant Engine, Medium Projections):

> * **series-episodes (The Architectural Tier / Pattern):** Represents the generic Cluster 05 delivery contract for any serialized storyworld. It defines the standard interface for stamped, source-baked workspaces, asset-pruning budgets (\<100MB), sealed lifecycles (@lifecycle: generated | patched | locked), and software OpenGL render configurations (--gl=swangle).  
> * **goblin-episodes (The Flagship Instance):** The concrete, committed repository housing the historical episode workspaces (ep040/, Episode\_040.tsx) for the pilot storyworld *Under the Floorboards* (Bog, Spleen, Wart, Mum Grissel).

### **2\. Operational Integration in the Tooling**

Using both terms clarifies repository configuration and CLI compiler workflows:

#### **Parameterizing the Stamping Compiler**

Rather than hardcoding goblin-specific paths into goblin-viewport-template/generator/generate-episode-repo.ts, the ingestion compiler accepts dynamic series targets calibrated against series.config.json:

\# Invocation for the Goblin storyworld:  
tsx ../goblin-viewport-template/generator/generate-episode-repo.ts \\  
  \--series under-the-floorboards \\  
  \--manifest ./outputs/ep01\_sc03/exposure\_sheet.json \\  
  \--ast ./outputs/ep01\_sc03/dialogue\_ast.json \\  
  \--out ../goblin-episodes/ep01\_sc03

\# Invocation under the generalized series-episodes structure:  
tsx ../viewport-template/generator/generate-episode-repo.ts \\  
  \--series wiregrass-basin \\  
  \--manifest ./outputs/ep04\_sc01/exposure\_sheet.json \\  
  \--ast ./outputs/ep04\_sc01/dialogue\_ast.json \\  
  \--out ../series-episodes/wiregrass-basin/ep04\_sc01

#### **Workspace Topology Under series-episodes**

If multiple storyworlds are co-located in a unified series-episodes archive (or if goblin-episodes is organized under the broader taxonomy), the directory topology isolates namespaces cleanly:

series-episodes/  
├── under-the-floorboards/         \# (Or alias/symlink: goblin-episodes/)  
│   ├── ep001/  
│   │   ├── Episode\_001.tsx  
│   │   ├── render\_manifest.json  
│   │   └── public/assets/  
│   └── ep040/  
└── wiregrass-basin/  
    └── ep001/  
        ├── Episode\_001.tsx  
        ├── render\_manifest.json  
        └── public/assets/

### **3\. Provenance & Provenance Invariants**

Using series-episodes enriches the metadata recorded in render\_manifest.json. The lockfile explicitly tracks the series\_slug from series.config.json to guarantee that multi-series renders never cross-contaminate character rigs, emotion banks, or locomotion baselines:

{  
  "episode\_id": "EP040",  
  "series\_slug": "under-the-floorboards",  
  "generated\_at": "2026-09-29T17:47:00Z",  
  "target\_source\_file": "Episode\_040.tsx",  
  "source\_file\_sha256": "7bd4e10a2f9c4b1e...",  
  "upstream\_provenance": {  
    "worker\_sower\_engine\_commit": "7bd4e10",  
    "lore\_commit": "9c3e401",  
    "assets\_visual\_tag": "v1.4.0"  
  }  
}

Maintaining series-episodes as the architectural standard while using goblin-episodes for the active production target gives you immediate operational clarity for the current show without calcifying the pipeline when spinning up a second series.

---

*User prompt: {{FOCUS: 1\. Core Architectural Mandate: Eradicating the Historical Corruption Trap Key Artifact Roles}} /extreme-details*

### **Response: 1\. Core Architectural Mandate: Eradicating the Historical Corruption Trap**

The architectural foundation of goblin-episodes (and its generalized pattern series-episodes) rests on the permanent structural elimination of the **historical corruption trap**. In conventional media architectures, video generation pipelines treat rendering engines as persistent, long-lived media players that dynamically ingest external data payloads (such as a dynamic scene.json sidecar) at runtime. The studio's legacy implementation (goblin-viewport) adhered to this model: a single Remotion codebase dynamically loaded scene payloads on the fly to render video files. Over extended production timelines, this pattern causes systemic failure.

THE HISTORICAL CORRUPTION TRAP: TIMELINE OF SILENT REGRESSION  
┌────────────────────────────────────────────────────────────────────────────────────────┐  
│ T0 (Month 0): Episode 012 rendered against Shared Viewport v1.0.0                      │  
│ • Component logic: GoblinPuppet.tsx v1.0.0 evaluates anchor\_point dynamically.         │  
│ • Result: Visemes align to chin baseline, camera push-in frames facial centroid.       │  
├────────────────────────────────────────────────────────────────────────────────────────┤  
│ T1 (Month 6): Shared Viewport refactored to v1.4.0 to support Episode 040              │  
│ • Camera spring dampening curve adjusted in GoblinPuppet.tsx for dynamic combat.       │  
│ • Transform-origin calculations modified to accommodate a taller character archetype.  │  
├────────────────────────────────────────────────────────────────────────────────────────┤  
│ T2 (Month 12): Re-render Episode 012 against Shared Viewport v1.4.0                    │  
│ • SILENT REGRESSION:                                                                   │  
│   \- Mouth visemes detach and float 20 pixels below the chin baseline.                  │  
│   \- New camera dampening curves cause facial close-ups to decapitate character sprites.│  
│   \- Sub-frame timing shifts introduce lip-sync rubber-banding across scene transitions.│  
└────────────────────────────────────────────────────────────────────────────────────────┘

#### **The Anatomy of the Legacy Failure Mode**

When application code is decoupled from its historical data payload, the rendering interpreter shifts underneath the archive:

> * **Dynamic Sidecar Ingestion:** Legacy renderers parse uncompiled scene.json files during runtime execution. The interpretation of coordinates, easing algorithms, layer depths, and character postures is deferred entirely to the current state of the React component tree.  
> * **Shared Component Drift:** As the production scales, developers continuously update core primitives. Modifying GoblinPuppet.tsx to add squash-and-stretch physics, adjusting camera dampening curves for high-action scenes, or updating CSS transform-origin logic for new character rigs alters global execution behaviors.  
> * **Silent Archive Corruption:** When older episodes (e.g., Episode 012\) are re-rendered months later to conform to new broadcast containers or aspect ratios, they execute against the evolved component code rather than their original execution environment. Without a single byte of scene.json changing, historical outputs suffer visual degradation: visemes detach from chin baselines, crash zooms overshoot facial targets, and timing calculations drift out of synchronization.

#### **The Metaprogramming Scaffolding Paradigm**

To resolve this trap, the architecture decouples the code compiler from the executable artifact:

               UPSTREAM NARRATIVE & ACOUSTIC CONTRACTS  
      \[ dialogue\_ast.json \] \+ \[ exposure\_sheet.json (ffprobe) \] \+ \[ manifest.json \]  
                                    │  
                                    ▼  
┌─────────────────────────────────────────────────────────────────────────────┐  
│       METAPROGRAM GENERATOR (generator/generate-episode-repo.ts)            │  
│                                                                             │  
│ 1\. Ingests exposure\_sheet.json, character manifest.json, and style\_rules    │  
│ 2\. Harvests & copies required assets (\<100MB ceiling via asset pruner)      │  
│ 3\. Compiles concrete Episode\_XXX.tsx with unquoted literal numeric props    │  
│ 4\. Scopes camera interpolation via Sequence-relative subcomponents          │  
│ 5\. Computes body SHA-256 and stamps header: // @lifecycle & // @checksum    │  
│ 6\. Writes immutable provenance lockfile: render\_manifest.json               │  
└─────────────────────────────────────┬───────────────────────────────────────┘  
                                      │  
                                      ▼  
┌─────────────────────────────────────────────────────────────────────────────┐  
│                    STAMPED WORKSPACE (goblin-episodes/ep040/)                │  
│                                                                             │  
│ ├── Episode\_040.tsx              \<-- Baked, self-contained TSX component    │  
│ ├── render\_manifest.json          \<-- Host environment & dependency lockfile │  
│ ├── components/ (Vendored)        \<-- GoblinPuppet.tsx, AmbientTrack.tsx    │  
│ └── assets/                       \<-- Harvested sprites, visemes, and audio  │  
└─────────────────────────────────────────────────────────────────────────────┘

> * **goblin-viewport-template (Compiler & Scaffolding):** Never acts as an episode runtime target. It exists solely as an offline code generator, AST transformer, and scaffolding engine (generator/generate-episode-repo.ts). It contains parameterized templates (Episode.tsx.hbs, package.json.hbs), asset harvesting utilities, and canonical presentation rigs.  
> * **goblin-episodes/ (The Stamped Archive):** The append-only repository containing committed, self-contained episode packages (e.g., goblin-episodes/episode-040/ or ep040/). Each directory is an autonomous software release capable of running offline and reproducing identical output indefinitely.  
> * **The "Episode as Sealed Build" Law:** The episode is not simply an MP4 video file. The MP4 is merely the compiled binary projection of the build. The true episode artifact is the complete, versioned build graph spanning narrative intent, compiled source code, harvested media assets, and execution environment manifests.  
> * **Decoded Media Equivalence:** The compiler enforces Level 3 Decoded Media Equivalence. Any re-render of a historical workspace must achieve bit-identical conformance against the original master render:  
>   SSIM\>0.9999,Δ*E*\<0.1  
>   across all decoded raw pixel matrices and PCM audio waveforms.

### **2\. Key Artifact Roles in the Stamped Episode Workspace**

Each stamped directory inside goblin-episodes/ is structured to ensure zero runtime network dependencies, zero unversioned dynamic evaluations, and strict isolation from external repository mutations.

goblin-episodes/episode-040/  
├── components/                          \# Vendored Presentation Primitives  
│   ├── GoblinPuppet.tsx                 \# Isolated 2D character rig & viseme snapper  
│   ├── CameraWrappers.tsx               \# Sequence-scoped local frame wrappers  
│   ├── AmbientTrack.tsx                 \# Programmatic sidechain ducking bed  
│   └── FoleyTrack.tsx                   \# Deterministic seeded transient audio  
├── public/assets/                       \# Pruned Episode Asset Envelope (\<100MB)  
│   ├── sprites/                         \# Specific character emotion poses referenced  
│   │   ├── bog\_humiliated.png  
│   │   └── spleen\_defensive.png  
│   ├── visemes/                         \# Specific Preston Blair mouth overlays  
│   │   ├── mouth\_closed.png  
│   │   ├── mouth\_small.png  
│   │   ├── mouth\_medium.png  
│   │   └── mouth\_wide.png  
│   ├── backgrounds/                     \# Static hand-painted location matte  
│   │   └── swamp\_relay\_matte.png  
│   └── audio/                           \# Master acoustic clock stems  
│       ├── dialogue/                    \# Synthesized 48 kHz uncompressed WAV stems  
│       │   ├── ep040\_sh01.wav  
│       │   └── ep040\_sh02.wav  
│       ├── foley/                       \# Pinned transient sound effects  
│       │   └── valve\_drop.wav  
│       └── ambient/                     \# Loopable environmental audio bed  
│           └── swamp\_drone.wav  
├── Episode\_040.tsx                      \# Source-Baked React Remotion Composition  
├── render\_manifest.json                 \# Cryptographic Multi-Repo Provenance Lockfile  
├── remotion.config.ts                   \# Headless Hardware Stability Configuration  
├── package.json                         \# Pinned Dependencies (Zero Floating Carats)  
├── tsconfig.json                        \# Inherited TypeScript Ruleset  
└── out/                                 \# Final Conformed Render Egress  
    ├── Episode\_040.mp4                  \# Broadcast Master (H.264 / AAC)  
    └── Episode\_040\_mezzanine.mov        \# Archival Master (ProRes 4444 \+ Alpha)

#### **A. Episode\_XXX.tsx (Source-Baked Remotion Composition)**

Episode\_XXX.tsx is the primary executable composition generated by generate-episode-repo.ts. It translates abstract narrative ASTs, dialogue timings, and staging manifests into static TypeScript JSX literals.

> * **Elimination of Dynamic Evaluation:** Dynamic array mapping (.map()), runtime fetch() requests, dynamic filesystem lookups, and uncompiled JSON sidecar reads are strictly forbidden in this file.  
> * **Literal Numeric Inlining:** Sequence durations, pixel coordinates, audio offsets, camera trajectories, and viseme timings are written as unquoted numeric literals (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>). This bypasses runtime AST evaluation overhead and locks every layout calculation at compile time.  
> * **Cryptographic Header & The Sealed-File Lifecycle:** The file begins with a cryptographic header governing automation authority and human artistic interventions (the "Showrunner Eject Button"):  
>   // @lifecycle: generated | patched | locked  
>   // @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f  
>   // @build\_profile: 1080p\_24fps\_master  
>   // @patch\_history: \["QA-EP040-SH03-VISEME\_ALIGN"\]

> * @lifecycle: generated: The default state stamped by CI/CD alongside the SHA-256 body checksum. Automated pipelines may overwrite and regenerate this file freely during iteration.  
> * @lifecycle: patched: Applied when automated diagnostic repair agents (such as computer-vision alignment agents) make targeted AST modifications (via ts-morph) that conform strictly to whitelisted JSX property diffs.  
> * @lifecycle: locked: Applied when a human director manually edits the composition file.  
> * **Collision Protection Protocol:** If upstream narrative state changes and the compiler is re-triggered against a @lifecycle: locked file (or if the body checksum fails to match the stamped header), the generator halts. It refuses to overwrite the locked source, emits Episode\_XXX.candidate.tsx alongside it, and posts an immutable DIRECTOR\_OVERRIDE event to the studio ledger.

#### **B. render\_manifest.json (The Universal Provenance Graph Root)**

Placed at the root of every stamped episode directory, render\_manifest.json serves as the immutable build lockfile that seals the episode’s identity into a Directed Acyclic Graph (DAG):

Build ID=H(Canon Root+Ledger State+AST+Assets+Container Digest+Toolchains)  
{  
  "build\_id": "sha256:4f8a1209bc87e5d23456789abcdef0123456789abcdef0123456789abcdef01",  
  "episode\_id": "EP040",  
  "schema\_version": "3.0.0",  
  "generated\_at": "2026-09-28T15:44:00Z",  
  "target\_source\_file": "Episode\_040.tsx",  
  "source\_file\_sha256": "7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",  
  "parents": {  
    "dialogue\_ast\_hash": "sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",  
    "exposure\_sheet\_hash": "sha256:9c3e401b2a4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",  
    "canon\_tree\_sha": "git:9c3e401",  
    "assets\_visual\_tree\_sha": "git:v1.4.0",  
    "viewport\_template\_sha": "git:4f8a120",  
    "worker\_sower\_engine\_commit": "git:7bd4e10"  
  },  
  "acoustic\_assets": {  
    "ep040\_sh01.wav": "sha256:4a8c9e2b10a56789abcdef0123456789abcdef0123456789abcdef0123456789",  
    "ep040\_sh02.wav": "sha256:9c1d8e3f4a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d"  
  },  
  "visual\_sprites\_used": {  
    "bog\_humiliated.png": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",  
    "spleen\_defensive.png": "sha256:a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4"  
  },  
  "runtime\_environment": {  
    "container\_digest": "ghcr.io/studio/render-node@sha256:7b4a29c1e4d3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",  
    "node\_version": "v20.12.0",  
    "remotion\_version": "4.0.140",  
    "chromium\_milestone": "122.0.6261.94",  
    "ffmpeg\_build": "6.1.1-static",  
    "font\_manifest": {  
      "Cinzel-Bold.ttf": "sha256:5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b"  
    }  
  },  
  "reproducibility\_audit": {  
    "protocol": "visual\_conformance\_v2",  
    "double\_render\_status": "BIT\_IDENTICAL",  
    "measured\_ssim": 1.0,  
    "delta\_e\_max": 0.0  
  }  
}

> * **Immutable Environmental Freezing:** Freezes the exact execution context down to the Chromium browser milestone, Node runtime, static FFmpeg binary build, and font file checksums. This prevents font rendering differences or layout engine updates from altering text kerning or frame bounds.  
> * **Content Hashing:** Records explicit SHA-256 checksums for every .wav dialogue stem and .png character sprite. Swapping an underlying media asset invalidates the manifest immediately.  
> * **Bidirectional Forensic Graph Traversal:** Supports deterministic audit queries across the historical graph:  
  * *Backward Audit:* Traces the causal justification for any individual rendered pixel or frame:  
    Frame 144→Shot 02→Sequence Prop→Audio Stem→AST Beat→Somatic Vector→Canon Constraint  
  * *Forward Blast Radius:* Identifies all downstream scenes invalidated (is\_dirty \= 1\) when an upstream lore fact, character injury, or sprite is altered.  
> * **C2PA Metadata Container Injection:** When headless Chromium outputs the final broadcast deliverable, the complete provenance record in render\_manifest.json is injected directly into the MP4 container via C2PA (Coalition for Content Provenance and Authenticity) standards. This anchors the delivered media to its authorizing human Git commits and execution logs.

#### **C. components/ (Vendored Presentation Layer)**

To prevent the **Shared-Component Import Leak**—the fatal anti-pattern where an episode imports rigs from an external path (e.g., import { GoblinPuppet } from '../../../goblin-viewport-template/...')—the generator creates an isolated presentation boundary:

┌────────────────────────────────────────────────────────────────────────┐  
│               COMPONENT BOUNDARY ISOLATION STRATEGIES                  │  
├────────────────────────────────────────────────────────────────────────┤  
│ 1\. LOCAL COMPONENT VENDORING (Standard Industrial Pattern)             │  
│    • The compiler physically copies GoblinPuppet.tsx, AmbientTrack.tsx,│  
│      and utilities directly into epXXX/components/ at bake time.       │  
│    • The episode imports only local files: from './components/...'.    │  
│    • Complete decoupling from template modifications.                  │  
├────────────────────────────────────────────────────────────────────────┤  
│ 2\. IMMUTABLE SEMVER PACKAGE REGISTRIES                                 │  
│    • Shared presentation primitives are published to a registry under  │  
│      strict semantic versioning: @studio/viewport@1.4.2.               │  
│    • Stamped package.json pins exact version without carats or tildes. │  
├────────────────────────────────────────────────────────────────────────┤  
│ 3\. GIT SUBMODULE COMMIT PINNING                                        │  
│    • Tracks the shared viewport repository as a Git submodule.         │  
│    • Locked to an immutable 40-character commit SHA.                   │  
└────────────────────────────────────────────────────────────────────────┘

> * **AST Import Linter Guard:** During pre-flight verification, CI linters parse the generated TypeScript AST using ts-morph. Any ImportDeclaration containing parent directory traversal (../..) that escapes the episode workspace aborts the build with exit code 1\.  
> * **GoblinPuppet.tsx:** The isolated 2D cutout character rig responsible for binding character coordinate anchors to the canvas, handling idle breathing loops, and mapping acoustic phonemes to discrete mouth shapes.  
> * **CameraWrappers.tsx:** Sequence-relative mathematical shot wrappers that compute camera interpolations (pans, push-ins, and screen shake) scoped strictly to the local duration of the shot.  
> * **AmbientTrack.tsx:** Manages continuous background environmental sound beds, utilizing programmatic sidechain ducking curves triggered by the presence of active dialogue sequences.  
> * **FoleyTrack.tsx:** Executes deterministic, punctual sound effect transients pegged to exact integer frame triggers derived from physical interaction events in the narrative AST.

#### **D. public/assets/ (Pruned Local Asset Envelope)**

Rather than cloning massive, multi-gigabyte character asset repositories into each episode workspace, the compiler executes an automated pruning step via collect-episode-assets.ts:

> * **Asset Harvesting & Budget Enforcement:** The script parses the validated dialogue\_ast.json and staging manifests, identifies the specific character emotion variants (e.g., bog\_humiliated.png), Preston Blair mouth visemes (mouth\_closed.png through mouth\_wide.png), and background plates used, and copies only those 10 to 20 files into public/assets/. This achieves a \~90% storage reduction and enforces a strict per-episode ceiling under 100MB (hard failure at 150MB).  
> * **The Zero-Byte Poison Sentinel:** The compiler computes the SHA-256 hash of every staged binary asset and halts execution if any file matches the empty hash constant: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 This prevents incomplete cloud transfers or broken local disk writes from failing silently inside headless Chromium.  
> * **\!MissingAssets Pre-Flight Audit:** An automated sweep verifies that every asset path declared in Episode\_XXX.tsx exists on disk before initializing Remotion. Missing assets abort compilation immediately, avoiding costly headless browser startup cycles.  
> * **Explicit Null Protocol:** If a character emotional variant declared in the AST is unfulfilled, the manifest marks it as null. In draft mode, the layout defaults safely to base\_states.idle, while in broadcast compilation modes, un-waived nulls trigger a fail-loud build termination.

#### **E. Toolchain & Execution Configurations**

> * **remotion.config.ts (Headless Hardware Stability):** Rendering executes on CPU hardware using software OpenGL:  
>   npx remotion render Episode\_040 out/Episode\_040.mp4 \--gl=swangle \--concurrency=1 \--offthreadvideo

Running software OpenGL (--gl=swangle) with single concurrency eliminates headless Chromium GPU driver crashes, VRAM fragmentation, and memory leaks on the compositing node.

> * **package.json (Exact Dependency Freezing):** All dependencies (@remotion/core, @remotion/renderer, react, etc.) are declared with strict, pinned versions without carats (^) or tildes (\~), preventing silent upstream package drift during subsequent npm install cycles.  
> * **out/ (Final Conformed Master Deliverables):** Houses the compiled outputs: Episode\_XXX.mp4 (H.264/AAC for broadcast egress with embedded C2PA data) and Episode\_XXX\_mezzanine.mov (ProRes 4444 with alpha channels for uncompressed master archiving).

### **Workspace Topology Matrix**

| Artifact | Authoring Source | Mutability Lifecycle | Primary Invariant / Deterministic Guard |
| :---- | :---- | :---- | :---- |
| **Episode\_XXX.tsx** | generator/generate-episode-repo.ts | Sealed (@lifecycle: generated | patched | locked) | Source-baked static numeric literals; no runtime JSON or .map() |
| **render\_manifest.json** | Generator Provenance Sealer | Append-only / Frozen | Cryptographic hash matching canon, assets, toolchains, and environment |
| **components/** | Vendored from goblin-viewport-template | Frozen per workspace | AST import linter forbids escaping workspace via ../.. paths |
| **public/assets/** | Harvested via collect-episode-assets.ts | Immutable file store | Strict \<100MB budget; zero-byte SHA-256 sentinel check |
| **remotion.config.ts** | Workspace template | Frozen configuration | Mandatory software rasterization flags (--gl=swangle \--concurrency=1) |
| **out/master.mp4** | Remotion Headless Renderer | Final compiled deliverable | Embedded C2PA provenance payload; bit-identical conformance |

---

*User prompt: {{FOCUS: 2\. Key Artifact Roles in the Stamped Episode Workspace }}*

Response: Every stamped workspace inside goblin-episodes/ (or generalized under \[series-episodes\]/) operates as an autonomous, self-contained, and byte-reproducible software release package. Rather than serving as an ephemeral cache of rendered media, each stamped directory contains the entire source-baked execution graph—spanning literal TypeScript timelines, vendored component rigs, pruned binary assets, toolchain configurations, and cryptographic provenance lockfiles.

goblin-episodes/episode-040/ (or ep040/)  
├── Episode\_040.tsx              \# Source-baked static React/Remotion composition  
├── render\_manifest.json          \# Root build lockfile & multi-repo provenance DAG  
├── remotion.config.ts           \# Software OpenGL (--gl=swangle) render configuration  
├── package.json                 \# Pinned dependencies (zero floating carats/tildes)  
├── tsconfig.json                \# Locked compilation targets inherited from goblin-config  
├── components/                  \# Vendored presentation primitives  
│   ├── GoblinPuppet.tsx         \# Isolated 2D character rig & viseme compositor  
│   ├── CameraWrappers.tsx       \# Scoped per-shot sequence interpolation boundaries  
│   ├── AmbientTrack.tsx         \# Continuous background audio bed with ducking curves  
│   └── FoleyTrack.tsx           \# Deterministic transient sound event player  
├── public/assets/               \# Pruned episode asset envelope (\<100MB ceiling)  
│   ├── sprites/                 \# Script-referenced character emotion variants  
│   ├── visemes/                 \# Referenced Preston Blair mouth shape overlays  
│   ├── backgrounds/             \# Location matte plates declared in the scene  
│   └── audio/                   \# Master acoustic clock stems (dialogue, foley, ambient)  
└── out/                         \# Final conformed render outputs  
    ├── master\_040.mp4           \# Broadcast master with injected C2PA metadata  
    └── mezzanine\_040.mov        \# Archival uncompressed master (ProRes 4444\)

### **1\. Episode\_XXX.tsx (Source-Baked Composition & Sealed State Machine)**

Episode\_XXX.tsx is the central executable script of the workspace, generated offline by generator/generate-episode-repo.ts. It converts upstream narrative abstract syntax trees (dialogue\_ast.json) and physical timing manifests (exposure\_sheet.json) into static React JSX literals.

#### **The Source-Baking Compilation Paradigm**

> * **Banning Dynamic Runtimes:** The file strictly forbids runtime dynamic expressions, array evaluations (.map()), remote network fetches, or dynamic imports. All narrative choices and timings are baked directly into the AST.  
> * **Inlining Literal Numeric Primitives:** Start frames, durations, pixel transforms, audio attenuation curves, and visibility flags are emitted as unquoted numeric literals (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>). This eliminates runtime string coercion, dynamic timing math, and AST calculation drift inside headless Chromium.  
> * **Sequence-Relative Hook Isolation:** Remotion evaluates execution hooks like useCurrentFrame() relative to the mounting component. If camera zoom curves are evaluated at the root level of a multi-shot composition, time calculations drift across cuts. The compiler generates dedicated subcomponent wrappers (\<Shot01CameraWrapper\>, \<Shot02CameraWrapper\>) for every shot cut, guaranteeing that useCurrentFrame() resets strictly to frame 0 within the local duration bounds of each sequence.  
> * **Deterministic Audio Ducking:** Dialogue audio stems and background audio ducking parameters (such as \-14 dB attenuation during active speech) are written as explicit scalar properties on \<Audio\> and custom track wrappers, removing dynamic acoustic analysis at render time.

#### **Cryptographic Header Anatomy & Line Normalization**

Byte 0 of every generated Episode\_XXX.tsx contains an immutable machine-readable comment block:

// @lifecycle: generated  
// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f  
// @upstream\_ast: sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d  
// @build\_profile: 1080p\_24fps\_master  
// @patch\_history: \[\]

> * **LF Line Normalization:** To prevent cross-platform Git checkouts (e.g., Windows CRLF vs. POSIX LF) from breaking the hash, checksums are calculated strictly over normalized LF line endings (\\n, 0x0A), enforced repo-wide via .gitattributes (\* text=auto eol=lf).  
> * **Header Exclusion Hashing:** The hashing pass isolates the file body beneath the header block. Computing the SHA-256 digest strictly over the raw component body prevents circular dependency bugs when writing the checksum into the header.

#### **The Three-Tier Lifecycle State Machine**

The workspace governs code modifications through three explicit lifecycle tiers:

           \[ generator/generate-episode-repo.ts \]  
                             │  
                             ▼  
                 // @lifecycle: generated  
                 // @checksum: SHA-256(Body)  
                             │  
        ┌────────────────────┴────────────────────┐  
        ▼ (Automated Diagnostic Agent)            ▼ (Human Director / Showrunner)  
   // @lifecycle: patched                    // @lifecycle: locked  
   • Surgical AST repair via ts-morph        • Pulls the "Showrunner Eject Button"  
   • Bounded to whitelisted properties        • Full manual creative sovereignty  
   • Validated via CPU test render           • Closes file to automated overwrites

> 1. **@lifecycle: generated:** Stamped automatically upon initial code generation. As long as the file body matches the burned @checksum, automated CI/CD pipelines maintain merge authority and can safely overwrite or re-stamp the file during upstream narrative re-runs.  
> 2. **@lifecycle: patched:** Applied when automated visual QA diagnostic agents (such as Jules) perform targeted AST repairs. For example, if a computer-vision validation node flags that a mouth viseme bounding box drifted 24px off the character chin line, the agent parses the AST using ts-morph, modifies only the whitelisted coordinate property, updates the @checksum, and logs the ticket ID into @patch\_history.  
> 3. **@lifecycle: locked (The Showrunner Eject Button):** Applied when a human director opens Episode\_XXX.tsx to manually tune camera curves, tweak timing, or add bespoke SVG styling. Marking the file @locked revokes automated write privileges, permanently freezing the source as an authoritative human artifact.

#### **Collision Avoidance & Candidate Forking Protocol**

If an upstream narrative revision occurs and generator/generate-episode-repo.ts is re-triggered against an existing workspace, it executes an automated integrity sweep:

> * **Lock Audit:** If // @lifecycle: locked is present, the compiler aborts regeneration immediately.  
> * **Checksum Verification:** If the file is marked @generated, the generator computes the SHA-256 digest of the on-disk file body and compares it against @checksum.  
  * If the hashes match, the file is confirmed untouched and is cleanly overwritten in place.  
  * If the hashes diverge, a human modified the code without updating the tag to @locked.  
> * **Forking Candidate Files:** To prevent clobbering human edits, the compiler refuses to overwrite Episode\_XXX.tsx. It emits Episode\_XXX.candidate.tsx alongside the working file and terminates with an error (METAPROGRAM\_COLLISION), forcing a visual diff review before human changes can be reconciled.

### **2\. render\_manifest.json (The Universal Provenance Graph Root)**

render\_manifest.json is an immutable build lockfile placed at the root of the stamped workspace. It anchors the episode to the Directed Acyclic Graph (DAG) of authorizing inputs and execution environments:

Build ID=H(Canon Root+Ledger State+AST+Assets+Container Digest+Toolchains)  
{  
  "build\_id": "sha256:4f8a1209bc87e5d23456789abcdef0123456789abcdef0123456789abcdef01",  
  "episode\_id": "EP040",  
  "schema\_version": "3.0.0",  
  "generated\_at": "2026-09-28T15:44:00Z",  
  "target\_source\_file": "Episode\_040.tsx",  
  "source\_file\_sha256": "7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",  
  "parents": {  
    "dialogue\_ast\_hash": "sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",  
    "exposure\_sheet\_hash": "sha256:9c3e401b2a4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",  
    "source\_file\_hash": "sha256:7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",  
    "canon\_tree\_sha": "git:9c3e401",  
    "assets\_visual\_tree\_sha": "git:v1.4.0",  
    "viewport\_template\_sha": "git:4f8a120",  
    "worker\_sower\_engine\_commit": "git:7bd4e10"  
  },  
  "acoustic\_assets": {  
    "ep040\_sh01.wav": "sha256:4a8c9e2b10a56789abcdef0123456789abcdef0123456789abcdef0123456789",  
    "ep040\_sh02.wav": "sha256:9c1d8e3f4a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d"  
  },  
  "visual\_sprites\_used": {  
    "bog\_humiliated.png": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",  
    "spleen\_defensive.png": "sha256:a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4"  
  },  
  "runtime\_environment": {  
    "container\_digest": "ghcr.io/studio/render-node@sha256:7b4a29c1e4d3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",  
    "node\_version": "v20.12.0",  
    "remotion\_version": "4.0.140",  
    "chromium\_milestone": "122.0.6261.94",  
    "ffmpeg\_build": "6.1.1-static",  
    "font\_manifest": {  
      "Cinzel-Bold.ttf": "sha256:5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b"  
    }  
  },  
  "epistemic\_invariants": \[  
    {  
      "topic\_id": "mystery\_the\_famine",  
      "standing": "ACTIVE\_ENDORSED",  
      "world\_status": "UNRESOLVED\_BY\_CANON",  
      "applied\_character\_horizons": {  
        "char\_bog": "TOTAL\_IGNORANCE",  
        "char\_spleen": "RUMOR\_ONLY"  
      }  
    }  
  \],  
  "reproducibility\_audit": {  
    "protocol": "visual\_conformance\_v2",  
    "double\_render\_status": "BIT\_IDENTICAL",  
    "measured\_ssim": 1.0,  
    "delta\_e\_max": 0.0  
  },  
  "broker\_signature": "MEQCID7f..."  
}

#### **Field-Level Architectural Roles**

> * **build\_id & parents:** Cryptographically binds the build to upstream repository commits (worker-sower-engine, goblin-lore, goblin-assets-visual, goblin-viewport-template) and source AST hashes. Swapping any upstream narrative beat or code file invalidates the build identity.  
> * **acoustic\_assets & visual\_sprites\_used:** Content-addresses all binary inputs via SHA-256. Replacing an underlying audio file or character sprite triggers immediate manifest divergence.  
> * **runtime\_environment:** Locks the execution context down to the Chromium browser milestone, Node version, Remotion build, static FFmpeg binary build, and font file checksums. Pinning font checksums ensures that text kerning and subtitle layout cannot drift across OS updates.  
> * **epistemic\_invariants:** Freezes the exact epistemic boundary of active narrative mysteries at the moment of compilation. If later seasons reveal a mystery's truth, historical episodes retain cryptographic proof that they respected contemporary lore boundaries.  
> * **broker\_signature:** The manifest is signed using the local media-broker private key, certifying that rendering occurred on an authorized physical execution node.  
> * **C2PA Metadata Container Injection:** When headless Chromium outputs the final broadcast deliverable, render\_manifest.json is injected directly into the MP4 container via C2PA standards, anchoring the video to its authorizing Git commits and input assets.

#### **Forensic Traversal Capabilities**

> * **Backward Forensic Audit:** Allows auditors to trace backwards from any individual broadcast pixel or frame to its causal root:  
>   Frame 144→Shot 02→Sequence Prop→Audio Stem→AST Beat→Somatic Vector→Canon Constraint  
> * **Forward Blast Radius Calculation:** Identifies every downstream rendered scene invalidated (is\_dirty \= 1\) when an upstream lore constraint, character injury vector, or sprite file is altered.

### **3\. components/ (Vendored Presentation Layer)**

The components/ directory contains isolated, presentation-tier React primitives. It eliminates the **Shared-Component Import Leak**—the fatal anti-pattern where an episode imports rigs from an external path (e.g., import { GoblinPuppet } from '../../../goblin-viewport-template/...'). If shared components evolve months later, external imports introduce silent regressions into past episodes.

┌────────────────────────────────────────────────────────────────────────┐  
│               COMPONENT BOUNDARY ISOLATION STRATEGIES                  │  
├────────────────────────────────────────────────────────────────────────┤  
│ 1\. LOCAL COMPONENT VENDORING (Standard Industrial Pattern)             │  
│    • generate-episode-repo.ts physically copies presentation primitives│  
│      into epXXX/components/ at compile time.                           │  
│    • Code imports locally: import { GoblinPuppet } from './components'.│  
├────────────────────────────────────────────────────────────────────────┤  
│ 2\. IMMUTABLE SEMVER PACKAGE REGISTRIES                                 │  
│    • Primitives are published to a private registry: @studio/viewport. │  
│    • package.json pins exact version without carats: "@studio/viewport"│  
├────────────────────────────────────────────────────────────────────────┤  
│ 3\. GIT SUBMODULE COMMIT PINNING                                        │  
│    • Shared presentation repo is tracked as a Git submodule locked     │  
│      to an immutable 40-character commit SHA.                          │  
└────────────────────────────────────────────────────────────────────────┘

#### **AST Import Linter Enforcement**

To guarantee boundary compliance, CI linters parse the AST of every emitted file using ts-morph. The linter inspects all ImportDeclaration nodes and terminates execution with a non-zero exit code if any import specifier contains parent directory traversals (../..) that escape the episode root.

#### **Component Responsibilities**

> * **GoblinPuppet.tsx:** The isolated 2D cutout character rig. It binds character coordinate anchors to the master canvas, drives idle breathing loops, and composites Preston Blair mouth visemes over the base emotion sprite based on the exposure sheet.  
> * **CameraWrappers.tsx:** Sequence-relative mathematical wrappers that calculate pans, push-ins, and screen shake curves strictly scoped to the local frame duration of that cut.  
> * **AmbientTrack.tsx:** Manages continuous background environmental audio beds, executing programmatic sidechain ducking curves when dialogue sequences are active.  
> * **FoleyTrack.tsx:** Plays deterministic, punctual sound effect transients pegged to exact integer frame triggers derived from physical interaction events in the narrative AST.

### **4\. public/assets/ (Pruned Local Asset Envelope)**

The master visual vault (goblin-assets-visual or \[series\]-assets-visual) contains complete 48-emotion character banks, layered source PSDs, and 4K environmental plates exceeding tens of gigabytes. Storing or copying the entire asset vault into every stamped workspace would cause disk thrashing and repository bloat.

GLOBAL ASSET VAULT (\[series\]-assets-visual)  
├── characters/bog/ (48 emotion variants, turnarounds, layered master art)  
└── characters/spleen/ (52 emotion variants, turnarounds, layered master art)  
                          │  
                          │ collect-episode-assets.ts AST Crawl  
                          ▼  
PRUNED EPISODE ENVELOPE (goblin-episodes/ep040/public/assets/)  
├── sprites/bog\_humiliated.png (Referenced in line 001\)  
├── sprites/spleen\_defensive.png (Referenced in line 002\)  
├── visemes/mouth\_{closed,small,medium,wide}.png (Referenced in speech cues)  
└── backgrounds/swamp\_relay\_matte.png (Active location plate)  
                          │  
                          ▼ Total Footprint: \~18.4 MB (Enforces \< 100MB Budget)

#### **Asset Harvesting & Quota Enforcement**

> * **AST Dependency Crawl (collect-episode-assets.ts):** Before rendering, the compiler parses dialogue\_ast.json. It reads speaking actors, extracts specific emotion conditions, identifies phoneme cues, and cherry-picks only the 10 to 20 referenced sprites, viseme textures, and background mattes into public/assets/.  
> * **The 100MB / 150MB Storage Gate:** Harvester execution achieves a \~90% reduction in asset footprint, keeping individual workspaces between 5MB and 28MB. Total assets staged in public/assets/ must remain below 100MB, with a hard ceiling at 150MB. Exceeding 150MB fails the build immediately to prevent unpruned asset banks from leaking into release packages.  
> * **The Zero-Byte Poison Sentinel:** The harvester computes the SHA-256 binary hash of every staged file. If any asset matches the empty-string SHA-256 digest:  
>   SHA-256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>   the build halts immediately with exit code 1 (ZERO\_BYTE\_ASSET\_POISON), catching truncated network transfers and un-pulled Git LFS pointers before headless Chromium boots.  
> * **Disk Parity Audit (\!MissingAssets):** Stamped JSX paths (staticFile(...)) are checked against disk; any missing asset halts execution before Chromium starts.  
> * **Explicit Null Fallback Hierarchy:** If an emotional variant declared in the AST is unfulfilled, the manifest marks it as null, causing the compositor to fall back safely to base\_states.idle.

### **5\. Toolchain & Execution Configurations**

┌────────────────────────────────────────────────────────────────────────┐  
│                        EXECUTION TOOLCHAIN ARTIFACTS                   │  
├────────────────────────────────────────────────────────────────────────┤  
│ remotion.config.ts                                                     │  
│ • Software OpenGL flags: Config.setChromiumOpenGlRenderer('swangle')   │  
│ • Concurrency throttle: Config.setConcurrency(1)                       │  
│ • Off-thread video decoding: Config.setOffthreadVideo(true)            │  
├────────────────────────────────────────────────────────────────────────┤  
│ package.json & tsconfig.json                                           │  
│ • Strict exact pinned dependencies (e.g., "remotion": "4.0.140")       │  
│ • Zero floating carats (^) or tildes (\~)                               │  
│ • Central ruleset link: "goblin-config": "file:../goblin-config"       │  
├────────────────────────────────────────────────────────────────────────┤  
│ out/ (Final Conformed Master Deliverables)                             │  
│ • Broadcast Master: out/master\_040.mp4 (H.264/AAC, C2PA injected)      │  
│ • Archival Master: out/mezzanine\_040.mov (ProRes 4444 \+ Alpha)         │  
└────────────────────────────────────────────────────────────────────────┘

> * **remotion.config.ts (Headless Hardware Stability):** Rendering executes on CPU and system RAM on Rig 1, reserving all GPU VRAM for generative diffusion tasks. The configuration locks software OpenGL rasterization (--gl=swangle) and single concurrency (--concurrency=1), preventing headless browser driver crashes, GPU context loss, and memory leaks.  
> * **package.json (Exact Dependency Freezing):** Declares exact dependencies without floating ranges (^ or \~), preventing silent upstream drift during future npm install runs. Centralized linting and compiler rules are inherited via "goblin-config": "file:../goblin-config".  
> * **tsconfig.json:** Locks TypeScript targets and enforces strict null checks, ensuring static type checking across baked JSX literals.  
> * **out/ (Final Conformed Deliverables):** Contains the compiled broadcast deliverables (master\_XXX.mp4 with embedded C2PA manifests) and archival masters (mezzanine\_XXX.mov in ProRes 4444).

### **Key Artifact Matrix**

| Artifact | Generation Source | Mutability Lifecycle | Core Invariant & Failure Sentinel |
| :---- | :---- | :---- | :---- |
| **Episode\_XXX.tsx** | generate-episode-repo.ts | Stamped (@generated, @patched, @locked) | Source-baked numeric literals; collision abort on modified body |
| **render\_manifest.json** | Provenance Engine | Immutable / Root DAG Lockfile | Cryptographic tuple hash; signed by media-broker private key |
| **components/** | Vendored from template | Frozen per workspace | AST import linter forbids escaping workspace root (../..) |
| **public/assets/** | collect-episode-assets.ts | Immutable file store | \<100MB budget (hard fail at 150MB); zero-byte SHA-256 sentinel |
| **remotion.config.ts** | Workspace template | Pinned configuration | Enforces \--gl=swangle \--concurrency=1 on Rig 1 CPU |
| **package.json** | Workspace template | Pinned dependencies | Zero floating carats/tildes; file-linked goblin-config |
| **out/master\_XXX.mp4** | Remotion Headless Renderer | Final compiled deliverable | Bit-identical replay (SSIM=1.0); injected C2PA metadata |

---

*User prompt: {{FOCUS: 1\. Episode\_XXX.tsx (Source-Baked Composition & Sealed State Machine) }} /extreme-details*

Response: Episode\_XXX.tsx is the immutable, source-baked executable composition file generated per episode by generator/generate-episode-repo.ts. It represents a complete paradigm shift away from dynamic runtime media players toward offline, compile-time React code generation. By converting upstream narrative intentions, physical audio measurements, and spatial manifests into hardcoded TypeScript JSX literals, Episode\_XXX.tsx functions as a deterministic software artifact that guarantees bit-identical video replay across decades of infrastructure evolution.

### **1\. The Source-Baking Compilation Paradigm**

In legacy video generation engines, a single long-lived rendering application dynamically ingested mutable scene.json sidecars at runtime. Dynamic evaluation at render time introduces the **historical corruption trap**: if shared presentation components (such as puppet rigs, camera easing curves, or CSS coordinate transforms) are refactored months later for newer episodes, re-rendering an older episode produces visual drift—such as detached visemes, clipped framing, or timing rubber-banding.

THE SOURCE-BAKING COMPILATION TOPOLOGY  
┌───────────────────────────┐     ┌───────────────────────────┐     ┌───────────────────────────┐  
│ worker-sower-engine       │     │ audio-microservice        │     │ goblin-assets-visual      │  
│ • dialogue\_ast.json       │     │ • 48 kHz dialogue .wav    │     │ • manifest.json           │  
│ • MRU reaction cues       │     │ • ffprobe duration\_ms     │     │ • anchors, viseme rects   │  
└─────────────┬─────────────┘     └─────────────┬─────────────┘     └─────────────┬─────────────┘  
              │                                 │                                 │  
              └────────────────────────┬────────┴─────────────────────────────────┘  
                                       │ Upstream Ingestion Contracts  
                                       ▼  
                     ┌───────────────────────────────────┐  
                     │ goblin-viewport-template          │  
                     │ generator/generate-episode-repo.ts│  
                     └─────────────────┬─────────────────┘  
                                       │ Offline Compile Pass (Source-Baking)  
                                       ▼  
                     ┌───────────────────────────────────┐  
                     │ goblin-episodes/ep040/            │  
                     │ • Episode\_040.tsx (Hardcoded JSX) │  
                     │ • render\_manifest.json (Locked)   │  
                     │ • components/ (Vendored Rigs)     │  
                     │ • public/assets/ (Pruned Media)   │  
                     └─────────────────┬─────────────────┘  
                                       │ Headless Execution (@remotion/renderer on Rig 1\)  
                                       ▼  
                     ┌───────────────────────────────────┐  
                     │ Broadcast Deliverable Master MP4  │  
                     └───────────────────────────────────┘

#### **Static JSX Emission Rules**

The compiler strictly enforces three code generation constraints when synthesizing Episode\_XXX.tsx:

> * **Elimination of Dynamic Evaluation:** The file completely bans runtime array iteration (.map()), dynamic variable lookups, runtime filesystem calls, and HTTP fetch() operations. All shot sequences, component mounts, and asset bindings are statically printed into the JSX tree.  
> * **Unquoted Numeric Literals:** Frame bounds, sequence offsets, camera parameters, and audio properties are inlined as raw TypeScript numeric primitives (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>). Emitting numeric primitives avoids string coercion, eliminates runtime regex parsing overhead, and enforces strict Remotion AST type safety.  
> * **Static Asset Path Resolution:** Every asset path is resolved at compile time via staticFile("assets/...") wrappers, ensuring paths reference locally harvested assets within the episode envelope rather than external network stores.

### **2\. Timeline Mathematics, Quantization, and Hook Scoping**

#### **Dual-Clock Frame Quantization**

Physical speech stems synthesized by the audio microservice serve as the master physical clock. Continuous physical audio duration (*D*ms​) measured via ffprobe sweeps is converted into a locked integer frame budget at 24 fps using the integer ceiling formula:

target\_frames=⌈(1000*D*ms​​)×24⌉

For example, a speech stem measuring exactly 3,120 ms yields:

target\_frames=⌈3.120×24⌉=⌈74.88⌉=75 frames

This discrete integer is printed directly into the JSX source, ensuring the Remotion headless renderer performs zero duration guessing or runtime rounding.

Shot Generation: Local Ceiling Rule (Never underruns speech)  
Timeline Cuts:   Cumulative-Millisecond Quantization (Zero-drift contiguous tiling)

#### **Cumulative Timeline Offset Accumulation**

Quantizing individual audio stems via ceiling math introduces up to 41.67 ms (one frame) of trailing silence padding per shot. If audio stems are concatenated naively end-to-end, an episode of 80 to 100 shots will accumulate over 3 to 4 seconds of drift against continuous background beds, Foley hits, and visual cuts.

To eliminate this, generate-episode-repo.ts separates per-shot audio budgets from master timeline placement. The compiler computes absolute timeline start frames by accumulating discrete shot durations:

fromFrame*k*​\=*i*\=1∑*k*−1​total\_shot\_frames*i*​  
Start*k*​\=⌈1000∑*i*\<*k*​*Di*​​×24⌉,End*k*​\=⌈1000∑*i*≤*k*​*Di*​​×24⌉−1  
End*k*​\+1=⌈1000∑*i*≤*k*​*Di*​​×24⌉=Start*k*\+1​

Because End*k*​\+1≡Start*k*\+1​, consecutive shots tile the Remotion timeline with zero gaps and zero overlaps. Total scene drift relative to the physical audio waveform is mathematically bounded to less than one frame (\<41.7 ms) across the entire episode runtime.

| Lines in Scene | Naive Per-Line Ceiling: Mean / Max Drift (Frames) | Cumulative Quantization: Mean / Max Drift (Frames) |
| :---- | :---- | :---- |
| **1 Shot** | 0.50 / 1.00 frames | **0.50 / 1.00 frames** |
| **6 Shots** | 3.00 / 5.38 frames | **0.50 / 1.00 frames** |
| **12 Shots** | 6.01 / 10.09 frames | **0.50 / 1.00 frames** |
| **24 Shots** | 11.97 / 17.06 frames | **0.50 / 1.00 frames** |
| **80 Shots** | \~40.00 / \~70.00 frames | **0.50 / 1.00 frames** |

#### **Sequence-Relative Hook Scoping (CameraWrappers)**

In Remotion, the hook useCurrentFrame() evaluates time relative to its mounting component. If camera interpolations or spring curves are called at the root composition level, subsequent shots evaluate time against the global scene frame rather than the cut's local frame index, corrupting animations on later cuts.

The compiler resolves this by generating scoped wrapper subcomponents (\<Shot01CameraWrapper\>, \<Shot02CameraWrapper\>) for every shot cut. Inside these isolated wrappers, useCurrentFrame() resets strictly to frame 0 at the start of each \<Sequence\>, isolating camera zoom curves, screen shake, and puppet breathing cycles to the local cut.

### **3\. Programmatic Acoustic Assembly & Gain Automation**

Audio tracks inside Episode\_XXX.tsx are partitioned into three concurrent, prioritized layers:

Track 1: Spoken Dialogue Stems (Master Clock — Absolute Integer Frame Placements)  
         \[--------- Shot 01 (75f) \---------\]          \[--------- Shot 02 (90f) \---------\]  
Track 2: Spot Foley Transients (Mulberry32 PRNG Seeded / MurmurHash3)  
                \[\*valve\_scrape\*\]                             \[\*boot\_squelch\*\]  
Track 3: Continuous Ambient Bed & Score (Programmatic Gain Automation)  
────┐                                       ┌────────┐                                 ┌────  
    │                                       │        │                                 │  
    └───────────────────────────────────────┘        └─────────────────────────────────┘  
      ^ Attack (6f)          Release (12f) ^          ^ Attack (6f)      Release (12f) ^  
      Ducking Floor: \-14 dB                           Ducking Floor: \-14 dB

#### **1\. Track Allocation Hierarchy**

> * **Track 1 (Dialogue Stems):** Uncompressed 48 kHz .wav stems mounted at absolute integer frame coordinates, locked to an integrated −16.0 LUFS (±1.0 LUFS) with a True-Peak ceiling ≤−1.0 dBTP.  
> * **Track 2 (Spot Foley Transients):** Physical sound cues extracted from the dialogue AST. To guarantee bit-identical audio rendering across headless workers without runtime randomness, variant selection is resolved deterministically at generation time using a Mulberry32 pseudo-random number generator (PRNG) keyed via MurmurHash3:  
>   Seed=MurmurHash3(sceneId+":"+shotId+":"+sampleKey)  
>   An anti-clustering salt (\${seed}:retry) re-rolls samples matching the immediately preceding shot to avoid mechanical sound repetition. The chosen variant is hardcoded as a literal path prop (src={staticFile("audio/foley/boot\_squelch\_02.wav")}).  
> * **Track 3 (Continuous Ambient Bed & Score):** Atmospheric loops and isolated music stems managed by AmbientTrack.tsx.

#### **2\. Programmatic Sidechain Ducking Math**

Vocal intelligibility is enforced via deterministic mathematical gain curves rather than analog, non-deterministic compressor plugins. During active dialogue windows \[*f*start​,*f*end​\], background beds attenuate by **−14 dB**:

Gainducked​\=1020−14 dB​×*V*base​≈0.1995×0.40≈0.0798  
Volume V(f)  
 1.0 ┌─────────────────────────────────────────────────────────────┐  
     │                                                             │  
Base │──┐                                                     ┌────│ (V\_base \= 0.40)  
 0.4 │  │                                                     │    │  
     │   \\  \<- Attack (6 frames)         Release (12 frames)-\> /    │  
     │    \\                                                   /     │  
Duck │     └─────────────────────────────────────────────────┘      │ (V\_duck \= 0.08)  
0.08 │      |              Active Dialogue Window           |      │  
 0.0 └──────┴───────────────────────────────────────────────┴──────┴─► Frame  
           f\_start                                         f\_end

The volume curve *V*(*f*) evaluates across four temporal phases using an authored 6-frame quadratic attack (*A*\=6, ≈250 ms) and a 12-frame quadratic release (*R*\=12, ≈500 ms):

*V*(*f*)=⎩⎨⎧​*V*base​,interpolate(*f*,\[*f*start​−*A*,*f*start​\],\[*V*base​,*V*duck​\],Easing.quadOut),*V*duck​(−14 dB),interpolate(*f*,\[*f*end​,*f*end​\+*R*\],\[*V*duck​,*V*base​\],Easing.quadIn),*V*base​,​*f*\<*f*start​−*Af*start​−*A*≤*f*\<*f*start​*f*start​≤*f*≤*f*end​*f*end​\<*f*≤*f*end​\+*Rf*\>*f*end​\+*R*​

#### **3\. The Envelope Minimum Bug vs. The Multi-Window Minimum Reducer**

A critical mechanical flaw occurs if dynamic ducking loops through dialogue windows and terminates on the first matching condition (break). If Line 1 ends at frame 75 (releasing through frame 87\) and Line 2 begins at frame 81 (attacking from frame 75), evaluating frame 78 hits Line 1's release condition, partially ramps up volume, and exits without evaluating Line 2's attack. The audio bed audibly pumps up between sentences before dipping violently.

To eliminate audio pumping, AmbientTrack.tsx evaluates all active dialogue windows across the scene simultaneously and applies a mathematical minimum reducer (Math.min):

// AmbientTrack.tsx: Multi-window minimum-composed sidechain ducking  
export const calculateDuckedGain \= (  
  frame: number,  
  baseVolume: number,  
  attenuationDb: number,  
  windows: Array\<{ from: number; to: number }\>,  
  attackFrames \= 6,  
  releaseFrames \= 12  
): number \=\> {  
  const targetDuckedVolume \= baseVolume \* Math.pow(10, attenuationDb / 20);  
  let minGain \= baseVolume;

  for (const win of windows) {  
    let windowGain \= baseVolume;  
    if (frame \>= win.from && frame \<= win.to) {  
      windowGain \= targetDuckedVolume;  
    } else if (frame \>= win.from \- attackFrames && frame \< win.from) {  
      windowGain \= interpolate(  
        frame,  
        \[win.from \- attackFrames, win.from\],  
        \[baseVolume, targetDuckedVolume\],  
        { easing: Easing.out(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }  
      );  
    } else if (frame \> win.to && frame \<= win.to \+ releaseFrames) {  
      windowGain \= interpolate(  
        frame,  
        \[win.to, win.to \+ releaseFrames\],  
        \[targetDuckedVolume, baseVolume\],  
        { easing: Easing.in(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }  
      );  
    }  
    // Union composition prevents pumping across short dialogue gaps  
    minGain \= Math.min(minGain, windowGain);  
  }

  return minGain;  
};

> * **Deliberate Dramatic Silence:** For moments of realization or high tension, explicit silence windows attenuate ambient beds down to **−24 dB** by applying additional linear gain multipliers over the ducked floor.

### **4\. Header Anatomy, Line Normalization, and Hash Isolation**

Byte 0 of every generated Episode\_XXX.tsx begins with a standardized, machine-readable cryptographic header block:

// @lifecycle: generated  
// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f  
// @upstream\_ast: sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d  
// @build\_profile: 1080p\_24fps\_master  
// @patch\_history: \[\]

#### **Header Exclusion Hashing**

The body checksum behaves as an objective mathematical contract. To avoid circular hash dependencies (where changing the written checksum inside the comment changes the checksum of the file), the hashing engine isolates the file body beneath the header comment block. The SHA-256 digest is calculated strictly over the raw UTF-8 component JSX source starting immediately after the trailing newline of the header.

#### **Cross-Platform Byte Normalization**

Divergent newline conventions between Windows (\\r\\n) and POSIX (\\n) operating systems cause identical text files to yield divergent SHA-256 digests.

> * **Canonical LF Enforcement:** Checksums are computed strictly over Canonical LF line breaks (\\n, 0x0A). Repositories enforce this via .gitattributes (\* text=auto eol=lf).  
> * **Linter & Formatter Exclusion:** Stylistic code formatters (Prettier, ESLint autofix) are strictly disabled across generated episode directories via .prettierignore and .eslintignore. An automated formatter re-breaking lines or wrapping JSX attributes would alter byte ordering and invalidate the stamped @checksum.

### **5\. The Three-Tier Sealed-File State Machine**

The sealed-file state machine governs automation authority, diagnostic healing, and manual artistic intervention (the "Showrunner Eject Button").

SEALED-FILE STATE MACHINE & MERGE ARBITRATION  
  ┌────────────────────────────────────────────────────────────┐  
  │ 1\. @lifecycle: generated                                   │  
  │    • Emitted by compiler; SHA-256 computed over body.      │  
  │    • Automated CI merge authority.                         │  
  └─────────────────────────────┬──────────────────────────────┘  
                                │  
        ┌───────────────────────┴───────────────────────┐  
        ▼                                               ▼  
┌──────────────────────────────┐        ┌──────────────────────────────┐  
│ 2\. @lifecycle: patched       │        │ 3\. @lifecycle: locked        │  
│ • Automated QA repair agents │        │ • Human director edit        │  
│   (e.g., Jules CV alignment).│        │   (The "Eject Button").      │  
│ • Permitted only if AST diff │        │ • Overwrites blocked.        │  
│   confirms whitelisted props.│        │ • Upstream reruns emit:      │  
└──────────────────────────────┘        │   Episode\_XXX.candidate.tsx  │  
                                        └──────────────────────────────┘

#### **Tier Specifications and Merge Authority**

| Lifecycle State | Target Author | Verification Mechanism | CI Merge Authority | Upstream Regeneration Behavior |
| :---- | :---- | :---- | :---- | :---- |
| **@lifecycle: generated** | Compiler (generate-episode-repo.ts) | Header checksum matches SHA-256(body). | **Automated Merge:** Merges via CI on passing lint/type checks. | **Clean In-Place Overwrite:** Upstream pipeline safely updates file. |
| **@lifecycle: patched** | Automated QA Agent (e.g., Jules CV Agent) | AST diff verified via ts-morph against whitelisted props. | **Bounded Merge:** Merges only if diff is verified strictly isolated. | **Alert & Review:** Halts if uncommitted; requires diff check. |
| **@lifecycle: locked** | Human Director ("The Eject Button") | Explicit @lifecycle: locked header tag present. | **Manual Gate:** Requires signed human director approval. | **Hard Stop:** Overwrites blocked; emits .candidate.tsx. |

#### **1\. @lifecycle: generated**

Stamped automatically by the compiler upon initial creation. The checksum matches the on-disk body byte-for-byte. Automated CI/CD pipelines retain full authority to re-render, re-stamp, or overwrite the file in place during routine batch remasters or script rebuilds.

#### **2\. @lifecycle: patched (Surgical AST Repair via ts-morph)**

When automated visual QA checks (such as computer-vision alignment agents) detect a physical geometric flaw—such as a character's mouth viseme bounding box drifting 24px off the chin anchor—a diagnostic agent (Jules) executes a targeted repair.

> * **Whitelisted Property Diffs:** The agent parses Episode\_XXX.tsx using ts-morph and mutates only explicitly whitelisted JSX layout properties (e.g., mouthBoundingBox, anchorPoint, or cameraScale). Any structural modification (such as adding components, changing import paths, or modifying sequence timing) fails CI validation.  
> * **Re-Verification & Checksum Burn:** After patching the AST, the agent re-renders an isolated 36-frame window on Rig 1 CPU to verify visual defect resolution, recomputes the body SHA-256 hash, updates @checksum, and appends the diagnostic ticket ID to @patch\_history (e.g., \["QA-EP040-SH03-VISEME\_ALIGN"\]).

#### **3\. @lifecycle: locked (The Showrunner Eject Button)**

In creative animation, human intervention is an operational reality. When a director opens Episode\_XXX.tsx to hand-tune a camera spring curve, inject an SVG displacement filter, or alter character pacing for dramatic timing, the file transitions to @lifecycle: locked. Marking a file locked revokes automated write privileges across all compilers and agents, permanently freezing the source as an authoritative human artifact.

### **6\. Collision Avoidance, Candidate Forking, and the Ledger Protocol**

When an upstream narrative change occurs in worker-sower-engine or an audio stem is updated, the pipeline dispatches generate-episode-repo.ts. Before writing to disk, the generator executes a three-step pre-flight audit against the destination file:

                    REGENERATION EXECUTION PASS  
                                 │  
                                 ▼  
                 Read Destination Episode\_XXX.tsx  
                                 │  
     ┌───────────────────────────┴───────────────────────────┐  
     ▼                                                       ▼  
Header contains @locked?                                Header is @generated?  
     │                                                       │  
┌────┴─────┐                                           ┌─────┴─────┐  
│ YES      │ NO                                        │           │  
▼          ▼                                           ▼           ▼  
\[HARD STOP\] Compute SHA-256(Disk Body)             Body Matches  Body Mismatch  
Emit        Compare to Header Checksum              Checksum?    (Unmarked Edit)  
Candidate;  │                                           │           │  
Halt Build. ├───────────────────────────────────────────┤           │  
            ▼ Match                                     ▼           ▼  
    \[ SAFE OVERWRITE \]                         \[ CLOBBER REFUSAL \]  
    Re-compile in-place                        Emit Episode\_XXX.candidate.tsx  
    Exit Code 0                                Exit with Diagnostic Warning

#### **The Four Conformance Test Cases**

> 1. **Case 1: Idempotent No-Op:** Re-running the generator against an unmodified directory produces identical source bytes. Git status reports zero modified lines (git diff \--exit-code returns 0), preventing extraneous commit churn.  
> 2. **Case 2: Protected Collision (Candidate Forking):** If the file is marked @lifecycle: locked—or if the body hash mismatches the header checksum (proving an unmarked human edit)—the generator refuses to overwrite Episode\_XXX.tsx. It writes the newly compiled output to Episode\_XXX.candidate.tsx beside the original and terminates with exit code 1 (METAPROGRAM\_COLLISION). This presents the showrunner with a structured visual diff, enabling deliberate human merging.  
> 3. **Case 3: The Downgrade Trap (Tamper Detection):** If a file is labeled @lifecycle: generated but its body hash does not match a fresh deterministic compile, the build runner halts and flags the file as corrupted or manually tampered with outside the authorized override workflow.  
> 4. **Case 4: Formatting & Line-Ending Invariance:** Re-compiling across Windows and POSIX nodes produces identical SHA-256 checksums due to mandatory LF normalization and linter bypass rules.

#### **The DIRECTOR\_OVERRIDE Event Ledger**

Human edits must never exist as untracked code modifications. Whenever a director modifies a locked composition, the orchestration harness logs an append-only DIRECTOR\_OVERRIDE transaction into the canonical narrative ledger (render\_manifest.json / SQLite event log):

{  
  "event\_type": "DIRECTOR\_OVERRIDE",  
  "episode\_id": "EP040",  
  "target\_file": "Episode\_040.tsx",  
  "target\_shot": "shot\_040\_002",  
  "director\_id": "usr\_showrunner\_01",  
  "timestamp": "2026-09-29T14:32:00Z",  
  "property\_delta": {  
    "target": "Shot02CameraWrapper.scale",  
    "from": 1.04,  
    "to": 1.12  
  },  
  "dramatic\_rationale": "Tighten framing on Spleen's defensive reaction following canon injury reveal."  
}

### **7\. Canonical Production Implementation: Episode\_040.tsx**

Below is the complete, source-baked implementation of Episode\_040.tsx demonstrating static numeric inlining, camera wrapper hook isolation, character puppet mounting, and multi-track gain ducking:

// @lifecycle: generated  
// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f  
// @upstream\_ast: sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d  
// @build\_profile: 1080p\_24fps\_master  
// @patch\_history: \[\]

import React from 'react';  
import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';  
import { GoblinPuppet } from './components/GoblinPuppet';  
import { Shot01CameraWrapper, Shot02CameraWrapper } from './components/CameraWrappers';  
import { AmbientTrack } from './components/AmbientTrack';

export const Episode\_040: React.FC \= () \=\> {  
  return (  
    \<AbsoluteFill style={{ backgroundColor: '\#050505' }}\>  
      {/\* \==================================================================  
          TRACK 3: CONTINUOUS BACKGROUND BED (Sidechain Gain Automation)  
          Evaluates all dialogue windows simultaneously via Math.min reducer.  
          \================================================================== \*/}  
      \<AmbientTrack  
        ambientFile="swamp\_drone.wav"  
        baseVolume={0.40}  
        attenuationDb={-14.0}  
        attackFrames={6}  
        releaseFrames={12}  
        dialogueWindows={\[  
          { from: 8, to: 83 },    // Shot 01: Dialogue speech active window  
          { from: 107, to: 182 }  // Shot 02: Dialogue speech active window  
        \]}  
        silences={\[  
          // Deliberate dramatic realization pause (drops bed to \-24 dB)  
          { fromFrame: 84, toFrame: 98, duckAmbientDb: \-24.0 }  
        \]}  
      /\>

      {/\* \==================================================================  
          SHOT 01: Dialogue line\_001 (BOG) \- Total Shot Duration: 99 Frames  
          Includes 8 frames pre-roll MRU shock and 16 frames reaction buffer.  
          \================================================================== \*/}  
      \<Sequence from={0} durationInFrames={99}\>  
        \<Shot01CameraWrapper originX="48.2%" originY="21.4%"\>  
          {/\* Static Character Presentation Rig \*/}  
          \<GoblinPuppet  
            character="BOG"  
            emotion="humiliated"  
            anchorPoint={{ x: 512, y: 980 }}  
            mouthBoundingBox={{ x: 380, y: 240, width: 64, height: 32 }}  
            talkBounceAmplitude={8}  
            spriteSrc={staticFile("assets/sprites/bog\_humiliated.png")}  
          /\>

          {/\* Track 1: Master Dialogue Audio Stem (Speech length: 75 frames) \*/}  
          \<Sequence from={8} durationInFrames={75}\>  
            \<Audio  
              src={staticFile("assets/audio/dialogue/ep040\_sh01.wav")}  
              volume={1.0}  
            /\>  
          \</Sequence\>

          {/\* Track 2: Seeded Spot Foley Transient (MurmurHash3 \+ Mulberry32) \*/}  
          \<Sequence from={14} durationInFrames={30}\>  
            \<Audio  
              src={staticFile("assets/audio/foley/valve\_drop.wav")}  
              volume={0.65}  
            /\>  
          \</Sequence\>  
        \</Shot01CameraWrapper\>  
      \</Sequence\>

      {/\* \==================================================================  
          SHOT 02: Dialogue line\_002 (SPLEEN) \- Total Shot Duration: 99 Frames  
          Starts at absolute frame offset 99 with zero cumulative drift.  
          \================================================================== \*/}  
      \<Sequence from={99} durationInFrames={99}\>  
        \<Shot02CameraWrapper originX="51.0%" originY="19.8%"\>  
          {/\* Static Character Presentation Rig \*/}  
          \<GoblinPuppet  
            character="SPLEEN"  
            emotion="defensive"  
            anchorPoint={{ x: 480, y: 960 }}  
            mouthBoundingBox={{ x: 410, y: 220, width: 58, height: 30 }}  
            talkBounceAmplitude={14}  
            spriteSrc={staticFile("assets/sprites/spleen\_defensive.png")}  
          /\>

          {/\* Track 1: Master Dialogue Audio Stem (Speech length: 75 frames) \*/}  
          \<Sequence from={8} durationInFrames={75}\>  
            \<Audio  
              src={staticFile("assets/audio/dialogue/ep040\_sh02.wav")}  
              volume={1.0}  
            /\>  
          \</Sequence\>

          {/\* Track 2: Seeded Spot Foley Transient (Anti-clustering salt applied) \*/}  
          \<Sequence from={22} durationInFrames={30}\>  
            \<Audio  
              src={staticFile("assets/audio/foley/boot\_squelch\_02.wav")}  
              volume={0.72}  
            /\>  
          \</Sequence\>  
        \</Shot02CameraWrapper\>  
      \</Sequence\>  
    \</AbsoluteFill\>  
  );  
};

---

*User prompt: {{FOCUS: 2\. render\_manifest.json (The Universal Provenance Graph Root) }} /extreme-details*

Response: render\_manifest.json is the immutable build lockfile placed at the root of every stamped episode workspace, serving as the terminal provenance graph root for the multi-repository generation pipeline. Positioned at the boundary between deterministic semantic state (Axis A) and physical media projection (Axis B), it cryptographically seals the conditions of creation for every rendered frame, audio stem, and component tree.

### **1\. Cryptographic Tuple & Ontological Foundation**

Rendered media artifacts—such as neural-synthesized dialogue stems, diffusion-generated visual plates, and composited video containers—cannot be deterministically re-derived bit-for-bit from state alone due to hardware variance, sampler stochasticity, and floating-point drift across compute nodes. The architecture therefore treats rendered media as immutable historical evidence rather than ephemeral derived cache.

                           THE BUILD IDENTITY TUPLE  
┌────────────────────────────────────────────────────────────────────────────────────────┐  
│  Build ID \= H( Canon Root \+ Ledger State \+ AST \+ Assets \+ Container \+ Toolchains )     │  
├────────────────────────────────────────────────────────────────────────────────────────┤  
│  • Canon Root        : Universal Merkle Root (H\_root) of 000.goblin-lore               │  
│  • Ledger State      : Snapshot hash of Cloudflare D1 relational state ledger          │  
│  • AST               : Cryptographic hash of dialogue\_ast.json                         │  
│  • Assets            : Sum of SHA-256 digests for all acoustic and visual binaries     │  
│  • Container Digest  : Pinned OCI image hash (ghcr.io/studio/render-node@sha256:...)   │  
│  • Toolchains        : Exact versions and binary hashes of Node, Chromium, Remotion   │  
└────────────────────────────────────────────────────────────────────────────────────────┘

The build identity is mathematically rooted as an irreversible cryptographic tuple:

Build ID=H(*H*root​\+ASThash​\+∑Assetsha256​\+Containerdigest​\+Toolchains)

#### **The Axiom of Monotonic Authority**

The manifest enforces the **Law of Monotonic Cross-Repo Authority Flow**, which dictates that legislative authority decreases as data travels downstream:

Upstream Legislation (000.goblin-lore)⟶Downstream Runtime (worker-sower)⟶Projection Engine (goblin-viewport-template)

> * **Prohibition on Reverse Flow:** Media projections possess zero semantic authority. If a visual anomaly, creative timing tweak, or dialogue improvisation occurs during rasterization, that data cannot flow upstream into canonical lore without an explicit, human-authorized Git commit in 000.goblin-lore.  
> * **Single Sovereign Rule:** render\_manifest.json treats all upstream inputs as deep-frozen, read-only artifacts. The compositor cannot alter upstream ASTs, timing manifests, or character bibles; it records their hashes to anchor downstream media to upstream truth.

### **2\. Complete Authoritative Schema Specification**

The manifest is written at compile time by generator/generate-episode-repo.ts beside Episode\_XXX.tsx. It conforms to schema\_version: 3.2.0:

{  
  "\$schema": "https://studio.internal/schemas/render\_manifest.v3.json",  
  "build\_id": "sha256:4f8a1209bc87e5d23456789abcdef0123456789abcdef0123456789abcdef01",  
  "episode\_id": "EP040",  
  "schema\_version": "3.2.0",  
  "generated\_at": "2026-09-28T15:44:00Z",  
  "target\_source\_file": "Episode\_040.tsx",  
  "source\_file\_sha256": "7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",  
  "canon\_root\_hash": "abe935cccf3951f82f8ed9b05b1f2a19c1e56a8eb2f13ef8e7a9297a81b1b911",  
  "compiler\_version": "2.4.1",  
  "parents": {  
    "dialogue\_ast\_hash": "sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",  
    "exposure\_sheet\_hash": "sha256:9c3e401b2a4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",  
    "source\_file\_hash": "sha256:7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",  
    "scene\_plan\_hash": "sha256:8b4e2a1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a",  
    "series\_config\_hash": "sha256:3b8f1a2c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a",  
    "upstream\_provenance": {  
      "worker\_sower\_engine\_commit": "git:7bd4e10",  
      "goblin\_lore\_commit": "git:9c3e401",  
      "goblin\_assets\_visual\_tag": "git:v1.4.0",  
      "viewport\_template\_commit": "git:4f8a120"  
    }  
  },  
  "acoustic\_assets": {  
    "ep040\_sh01.wav": "sha256:4a8c9e2b10a56789abcdef0123456789abcdef0123456789abcdef0123456789",  
    "ep040\_sh02.wav": "sha256:9c1d8e3f4a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d"  
  },  
  "visual\_sprites\_used": {  
    "bog\_humiliated.png": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",  
    "spleen\_defensive.png": "sha256:a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",  
    "warm\_pipe\_bg.png": "sha256:5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6"  
  },  
  "runtime\_environment": {  
    "container\_digest": "ghcr.io/studio/render-node@sha256:7b4a29c1e4d3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",  
    "node\_version": "v20.12.0",  
    "remotion\_version": "4.0.140",  
    "chromium\_milestone": "122.0.6261.94",  
    "ffmpeg\_build": "6.1.1-static",  
    "font\_manifest": {  
      "Cinzel-Bold.ttf": "sha256:5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",  
      "Inter-Bold.ttf": "sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d"  
    }  
  },  
  "epistemic\_invariants": \[  
    {  
      "topic\_id": "mystery\_the\_famine",  
      "standing": "ACTIVE\_ENDORSED",  
      "world\_status": "UNRESOLVED\_BY\_CANON",  
      "applied\_character\_horizons": {  
        "char\_bog": "TOTAL\_IGNORANCE",  
        "char\_spleen": "RUMOR\_ONLY"  
      }  
    }  
  \],  
  "delivery\_compliance": {  
    "integrated\_lufs": \-16.2,  
    "true\_peak\_dbtp": \-1.1,  
    "measured\_drift\_max\_ms": 14.2,  
    "signed\_release\_waivers": \[\]  
  },  
  "reproducibility\_audit": {  
    "protocol": "visual\_conformance\_v2",  
    "double\_render\_status": "BIT\_IDENTICAL",  
    "measured\_ssim": 1.0,  
    "delta\_e\_max": 0.0  
  },  
  "c2pa\_manifest\_injected": true,  
  "broker\_signature": "MEQCID7f..."  
}

### **3\. Detailed Field Responsibilities & Structural Semantics**

#### **parents & Upstream Provenance Linkage**

The parents block binds the episode to the exact immutable Git commits and intermediate contract digests that authorized it:

> * **dialogue\_ast\_hash:** The SHA-256 hash of dialogue\_ast.json, ensuring line-by-line dialogue fidelity, emotional cues, and character assignments match the approved script.  
> * **exposure\_sheet\_hash:** Pinned digest of exposure\_sheet.json, capturing frame budgets quantized from physical audio stems.  
> * **source\_file\_hash:** The SHA-256 digest of Episode\_XXX.tsx, matching the @checksum burned into its component header.  
> * **upstream\_provenance:** Pinned Git commits for worker-sower-engine, 000.goblin-lore, goblin-assets-visual, and goblin-viewport-template. Changing a single commit hash alters the parentage, invalidating stale downstream artifacts.

#### **Content-Addressed Media Registry (acoustic\_assets & visual\_sprites\_used)**

All binary dependencies mounted during rendering are registered by their SHA-256 digests:

> * **Content Addressing Over Semantic Paths:** Downstream workers do not assume image or audio content based on file paths. Content hashes guarantee that updating a sprite on disk without updating the manifest triggers an immediate hash mismatch.  
> * **The Zero-Byte Poison Sentinel:** During manifest generation, any asset matching the empty file hash (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855) fails generation immediately with exit code 1, catching truncated network transfers or failed LFS checkouts.

#### **runtime\_environment (The Hardware-Independent Sandbox)**

To eradicate rendering drift caused by host operating system variations, the manifest freezes the complete rasterization environment:

> * **container\_digest:** Pins the OCI container image hash (ghcr.io/studio/render-node@sha256:...), locking the exact Linux userspace, shared C libraries, and system dependencies.  
> * **Browser & Compositor Milestones:** Locks Node.js (v20.12.0), Remotion (4.0.140), and Chromium (122.0.6261.94). Pinning the exact Chromium milestone prevents browser layout engine patches from modifying flexbox layout or sub-pixel text rendering.  
> * **font\_manifest:** Explicit SHA-256 checksums for all typography files (e.g., Cinzel-Bold.ttf, Inter-Bold.ttf). Prevents divergent font packages on host systems from shifting kerning, leading, or subtitle bounding boxes.  
> * **FFmpeg Build:** Locks the static build string (6.1.1-static), ensuring consistent color-space matrix transforms (*Y*’*CbCr* to *RGB*) and encoder quantization parameters.

#### **epistemic\_invariants (The Narrative Horizon Lock)**

Maintains historical canon boundaries by recording the status of unresolved mysteries during episode generation:

> * **Mystery Standing:** Captures active secrets (e.g., mystery\_the\_famine) with their current standing (ACTIVE\_ENDORSED) and canon status (UNRESOLVED\_BY\_CANON).  
> * **Character Knowledge Horizons:** Formally bounds individual character perspectives (e.g., char\_bog: TOTAL\_IGNORANCE, char\_spleen: RUMOR\_ONLY).  
> * **Audit Trail Protection:** If future seasons reveal a secret, historical episodes retain cryptographic evidence proving they adhered to narrative constraints active at generation time.

#### **reproducibility\_audit & Decoded Media Equivalence**

The manifest validates Level 3 Decoded Media Equivalence:

> * **Double-Render Pass:** A freshly generated workspace undergoes two consecutive rendering passes. The resulting master files are decoded into uncompressed raw pixel matrices and PCM audio buffers.  
> * **Mathematical Invariants:** The manifest asserts exact visual and acoustic identity:  
>   SSIM=1.0,Δ*E*max​\=0.0  
> * **double\_render\_status: BIT\_IDENTICAL:** Certified only when decoded streams exhibit zero variance across runs.

#### **broker\_signature**

To prevent unauthorized manifest fabrication, the manifest is signed with ECDSA by the media broker's private key (broker\_signature: MEQCID7f...). This verifies that compositing executed on an authorized studio node (Rig 1\) rather than an unverified development machine.

### **4\. The Directed Acyclic Graph (DAG) Topology**

render\_manifest.json serves as the root index of a multi-tiered Directed Acyclic Graph (DAG), mapping upstream human intent down to rendered master pixels:

                           THE CANONICAL PROVENANCE DAG  
                             
       \[ 000.goblin-lore \] (Human Git Commits)  
               │  
               ├──────────────────────────────────────────────┐  
               ▼                                              ▼  
   \[ World State Ledger (D1) \]                     \[ series.config.json \]  
               │                                              │  
               ▼                                              │  
      \[ dialogue\_ast.json \]                                   │  
               │                                              │  
      ┌────────┴─────────────────────────┐                    │  
      ▼                                  ▼                    │  
\[ Audio Synthesis (.wav) \]    \[ Visual Manifest (manifest.json) \]  
      │                                  │                    │  
      ▼                                  ▼                    │  
\[ exposure\_sheet.json \]       \[ Harvested Local Assets \]      │  
      │                                  │                    │  
      └────────────────┬─────────────────┘                    │  
                       ▼                                      ▼  
               \[ Episode\_XXX.tsx \] ◄──────────────────────────┘  
                       │  
                       ▼  
          \[ Master Rendered MP4 Master \]  
                       │  
                       ▼  
            \[ render\_manifest.json \] (Universal Provenance Root)

#### **Explicit Parentage Rules**

Every node within the DAG requires explicit parent hashes:

> 1. **Episode\_XXX.tsx:** Derived from exposure\_sheet.json hash, dialogue\_ast.json hash, character manifest.json hashes, and the viewport compiler build SHA.  
> 2. **exposure\_sheet.json:** Derived from physical audio stem binary hashes and dialogue\_ast.json.  
> 3. **audio/\*.wav:** Derived from the neural TTS model checkpoint hash, voice configuration seed, phoneme lexicon hash, and verbatim dialogue string.  
> 4. **assets/\*.png:** Derived from source master image hashes, coordinate bounding boxes in manifest.json, and LoRA weights hashes.

#### **Structural Acyclicity**

The dependency topology is audited during Pass 2 compilation passes. Cycle detection algorithms prevent circular dependencies (*A*→*B*→*C*→*A*), guaranteeing that graph invalidation sweeps can calculate finite transitive closures.

### **5\. Bidirectional Graph Traversal & Blast-Radius Engine**

Formalizing build metadata into a DAG enables two operational traversal workflows:

TRAVERSAL DIRECTION 1: FORENSIC AUDIT (BACKWARD CAUSALITY)  
Pixel / Frame ──► Shot Sequence ──► Audio Stem ──► AST Beat ──► Somatic Vector ──► Canon Commit

TRAVERSAL DIRECTION 2: BLAST-RADIUS SWEEP (FORWARD INVALIDATION)  
Canon Mutation (H\_root) ──► Query DAG ──► Mark is\_dirty \= 1 ──► Alert Production Teams

#### **1\. Backward Forensic Audit (Causal Justification)**

Auditors can trace backwards from any individual broadcast pixel or audio frame to its origin:

Frame 412⟶Shot 03⟶Sequence Prop⟶Audio Stem⟶AST Beat⟶Somatic Vector⟶Canon Constraint

> * **Example:** If Bog is depicted limping in Episode 040, the system traces the layout prop back through the AST motor action, to the somatic injury vector in the state ledger, grounding out at the specific Git commit in 000.goblin-lore where the trauma occurred.

#### **2\. Forward Blast-Radius Analysis (Cache Invalidation)**

When an upstream lore fact, somatic condition, or character sprite is patched, the engine walks forward to compute the invalidation cascade:

\$ sower why-dirty fact\_bog\_arm\_severed

\[MUTATION\]: fact\_bog\_arm\_severed \-\> state: AGGRAVATED  
  ├── Scene 040/03 (Direct Match: consumes fact\_bog\_arm\_severed) \-\> INVALIDATED  
  ├── Scene 040/07 (Downstream Dependent: assumes two-handed carry) \-\> INVALIDATED  
  └── Episode 041/01 (Epistemic Chain: Spleen references Bog's injury) \-\> INVALIDATED  
Total Blast Radius: 3 scenes across 2 episodes. Rebuild cost: \$0.00 (Draft Phase).

> * **Transitive Fingerprinting (*H*dep​):** Downstream nodes calculate a transitive dependency hash (*H*dep​). If an upstream dependency changes, *H*dep​ diverges, marking affected cached scenes as dirty (is\_dirty \= 1\) and preventing obsolete renders from reaching broadcast egress.

### **6\. Delivery Standards, C2PA Injection, & Cold Preservation**

#### **C2PA Cryptographic Metadata Injection**

When headless Chromium completes rasterization on Rig 1, the manifest data is injected into the MP4 container via C2PA standards:

> * **Hardware Provenance:** The MP4 embeds the build ID, upstream Git commits, model hashes, and the media-broker digital signature into container metadata.  
> * **Tamper-Evident Chain:** Any modification to video frames or audio tracks breaks the container signature, providing cryptographic proof of custody from human-authored Git commits down to delivery pixels.  
> * **MovieLabs MMC Alignment:** Metadata maps cleanly to MovieLabs Media Manifest Core (MMC) structures, defining track roles, character anchors, and component relationships for partner ingestion pipelines.

#### **The Append-Only Errata & Retcon Protocol**

Updating manifests in place violates content addressing and breaks historical immutability. When historical canon errors are discovered:

> 1. Canon files are modified via a standard Git commit, establishing a new *H*root​.  
> 2. A formal ErrataRecord is appended to lore/errata.json declaring the superseded commit SHA, affected asset IDs, and historical episodes.  
> 3. **Immutable Preservation:** Existing MP4 files, stamped workspaces, and render\_manifest.json sidecars remain untouched in storage.  
> 4. Any subsequent remaster compiles into a new content-addressed directory under the revised commit hash, preserving both the original broadcast record and the remaster.

                                ARCHIVAL STORAGE TIERS  
┌─────────────────────────────┬─────────────────────────────┬─────────────────────────────┐  
│ 1\. Working Storage          │ 2\. Warm Object Storage      │ 3\. Cold Storage             │  
│ • Local NVMe on Rig 1       │ • Cloudflare R2             │ • AWS Glacier / B2          │  
│ • Active episode workspaces │ • Distribution derivatives  │ • Immutable object locking  │  
│ • 0 GB GPU VRAM compositing │ • 14-day candidate expiry   │ • Permanent historical data │  
└─────────────────────────────┴─────────────────────────────┴─────────────────────────────┘

Workspaces are preserved under a **3-2-1 Backup Policy**: three independent copies across two distinct media types (local NVMe flash filesystem and cloud object stores), with at least one offsite replica secured with object locking. Monthly automated audits re-verify stored media hashes against render\_manifest.json digests, ensuring long-term data integrity across the production fleet.

---

*User prompt: {{FOCUS: 3\. components/ (Vendored Presentation Layer) }} /extreme-details*

Response: components/ is the vendored presentation layer within each stamped workspace inside goblin-episodes/ (and its generalized pattern \[series-episodes\]/). It provides the self-contained React and Remotion presentation primitives that translate static AST properties into on-screen kinematics, viseme compositing, camera optics, and acoustic mixing.

By physically isolating or immutably versioning these primitives per workspace, the architecture eliminates runtime dependencies on mutable parent repositories, ensuring that changes to future character rigs, camera curves, or audio algorithms cannot introduce visual or temporal drift into historical episodes.

### **1\. Architectural Imperative: Eradicating the Shared-Component Import Leak**

In conventional component-driven media pipelines, projects import shared UI or rigging libraries via relative path traversal or dynamic workspace linking (e.g., import { GoblinPuppet } from '../../../goblin-viewport-template/components/GoblinPuppet'). Over a multi-year production cadence, this pattern causes the **Shared-Component Import Leak**:

THE SHARED-COMPONENT IMPORT LEAK & HISTORICAL DRIFT  
┌────────────────────────────────────────────────────────────────────────────────────────┐  
│ EPISODE 010 (Rendered September 2026\)                                                  │  
│ • Uses Shared GoblinPuppet v1.0.0 via relative traversal (../../../)                   │  
│ • Coordinate Anchor: Evaluated at sprite origin \[512, 980\].                            │  
│ • Result: Visemes composite flush against chin boundary; broadcast verified.           │  
├────────────────────────────────────────────────────────────────────────────────────────┤  
│ REFACTOR PASS (March 2027\)                                                             │  
│ • Global GoblinPuppet updated to v2.1.0 to support 4-legged quadrupeds in Episode 075\. │  
│ • Modified: CSS transform-origin math and spring dampening coefficients.               │  
├────────────────────────────────────────────────────────────────────────────────────────┤  
│ RE-RENDER ATTEMPT: EPISODE 010 (August 2027\)                                           │  
│ • SILENT CORRUPTION: Relative import pulls GoblinPuppet v2.1.0.                        │  
│ • Regressions:                                                                         │  
│   \- Mouth visemes float 28px below Bog's jawline.                                      │  
│   \- Idle breathing spring oscillations double in frequency (hyperventilation bug).     │  
│   \- Camera framing clips character skulls on close-up push-ins.                        │  
└────────────────────────────────────────────────────────────────────────────────────────┘

To enforce Level 3 Decoded Media Equivalence (SSIM\>0.9999, Δ*E*\<0.1), the stamped workspace must encapsulate its presentation logic. When an episode workspace is stamped, its component layer is severed from the upstream template.

### **2\. The Component Boundary Isolation Hierarchy**

The pipeline formalizes three isolation tiers, balancing per-episode disk overhead against long-term maintenance costs:

                       COMPONENT ISOLATION SPECTRUM  
 Level 1: SemVer Registry ──► Level 2: Locked Git Commit ──► Level 3: Fully Vendored  
 (Lowest disk footprint)                                     (Maximum isolation)

#### **Level 1: Immutable Package Registry (@studio/viewport@1.4.2)**

> * **Mechanism:** Core presentation components are published to an internal, immutable package registry under strict semantic versioning.  
> * **Invariant Guard:** The episode's package.json pins the exact version with zero floating ranges (no carats ^ or tildes \~). Package registries enforce an unpublish/overwrite ban, guaranteeing the package bytes remain immutable.  
> * **Application:** Ideal for standard utilities (e.g., standard easing curves, scalar interpolation formulas).

#### **Level 2: Locked Git Submodule Commit SHA**

> * **Mechanism:** The workspace mounts presentation components through a Git submodule pinned to an immutable 40-character commit hash.  
> * **Invariant Guard:** Detached HEAD states and branch pointer tracking are banned. The commit SHA is recorded directly inside render\_manifest.json under parents.upstream\_provenance.viewport\_template\_sha.

#### **Level 3: Fully Vendored Source (epXXX/components/)**

> * **Mechanism:** The metaprogram generator (generator/generate-episode-repo.ts) copies presentation primitives directly into goblin-episodes/epXXX/components/ at compile time.  
> * **Invariant Guard:** All imports inside Episode\_XXX.tsx reference local sibling files exclusively (import { GoblinPuppet } from './components/GoblinPuppet').  
> * **Application:** The default studio standard for all character rigs, camera wrappers, and audio tracks. It guarantees complete independence from outside codebases; even if goblin-viewport-template is deleted, the episode renders autonomously.

### **3\. AST Import Linter Enforcement (ts-morph Sentinel)**

To prevent developer shortcuts or generator errors from introducing external dependencies, an automated pre-flight linting pass inspects every emitted TypeScript file using ts-morph before rendering begins:

               PRE-FLIGHT AST IMPORT AUDIT  
                 
  Parse Source Code (ts-morph AST Engine)  
               │  
               ▼  
  Extract all ImportDeclaration Nodes  
               │  
               ├── Does specifier start with "../.."?  
               │      ├── YES ──► THROW: FATAL\_ESCAPE\_ATTEMPT (Exit Code 1\)  
               │      └── NO  ──► Continue  
               │  
               ├── Is it a bare specifier (node\_modules)?  
               │      ├── Check package.json for exact pinned SemVer  
               │      ├── Floating ranges (^, \~) ──► THROW: UNPINNED\_DEPENDENCY  
               │      └── Exact pin ─────────────► Continue  
               │  
               ▼  
  Status: ISOLATION\_VERIFIED (Proceed to Chromium Engine)

#### **The Enforcement Rule**

The linter extracts every ImportDeclaration within Episode\_XXX.tsx and all files inside components/. Any import path matching the regex ^(\\.\\.\\/){2,} (traversing above the episode root) halts execution immediately:

// Validation logic inside preflight-audit.ts  
import { Project } from 'ts-morph';

export function enforceComponentIsolation(workspaceRoot: string): void {  
  const project \= new Project();  
  project.addSourceFilesAtPaths(\`\${workspaceRoot}/\*\*/\*.tsx\`);

  for (const sourceFile of project.getSourceFiles()) {  
    for (const importDecl of sourceFile.getImportDeclarations()) {  
      const moduleSpecifier \= importDecl.getModuleSpecifierValue();  
        
      // Ban parent workspace traversal  
      if (moduleSpecifier.startsWith('../../') || moduleSpecifier.includes('/../..')) {  
        throw new Error(  
          \`\[SECURITY\_VIOLATION\]: Component isolation breach in \${sourceFile.getBaseName()}. \` \+  
          \`Illegal relative escape path: "\${moduleSpecifier}". \` \+  
          \`All presentation components must be locally vendored inside ./components/\`  
        );  
      }  
    }  
  }  
}

### **4\. Deep Architectural Dive into Vendored Primitives**

Each component vendored into epXXX/components/ is designed as a stateless, deterministic transformer that bridges narrative data into visual and acoustic signals.

epXXX/components/  
├── GoblinPuppet.tsx     \# 2D Cutout Rig, Viseme Engine & Spatial Invariant Binder  
├── CameraWrappers.tsx   \# Sequence-Relative Frame Scoper & Kinetic Interpolator  
├── AmbientTrack.tsx     \# Deterministic Sidechain Gain Reducer (Anti-Pumping)  
└── FoleyTrack.tsx       \# Seeded Transient Audio Player (MurmurHash3 / Mulberry32)

#### **A. GoblinPuppet.tsx (Cutout Rig & Viseme Compositor)**

GoblinPuppet.tsx is the presentation rig responsible for rendering 2D cutout character performances on Layer 3 of the optical stack. It maps the character's physical state, ground contact points, facial visemes, and emotional vibration into screen-space coordinates.

                         GOBLIN PUPPET COMPOSITION LAYERS  
┌────────────────────────────────────────────────────────────────────────┐  
│ Master Canvas Space (1920x1080)                                        │  
│                                                                        │  
│                      \[ Talk Bounce / Shiver Jitter \]                   │  
│                                     │                                  │  
│                                     ▼                                  │  
│         ┌────────────────────────────────────────────────────┐         │  
│         │ Base Sprite: bog\_humiliated.png (1024x1024)        │         │  
│         │ • Normalized ground anchor: origin \[512, 980\]       │         │  
│         │                                                    │         │  
│         │         ┌──────────────────────────────┐           │         │  
│         │         │ mouthBoundingBox:            │           │         │  
│         │         │ \[x: 380, y: 240, w: 64, h: 32│           │         │  
│         │         │   ┌──────────────────────┐   │           │         │  
│         │         │   │ Viseme: mouth\_wide   │   │           │         │  
│         │         │   │ (Acoustic-driven)    │   │           │         │  
│         │         │   └──────────────────────┘   │           │         │  
│         │         └──────────────────────────────┘           │         │  
│         └────────────────────────────────────────────────────┘         │  
│                                     ▲                                  │  
│                                     │                                  │  
│                      \[ Ground Plane Y\_ground Anchor \]                  │  
└────────────────────────────────────────────────────────────────────────┘

##### **1\. Coordinate Mathematics & Spatial Invariant Binding**

The puppet rig does not calculate positions dynamically at runtime. Instead, it binds invariants authored in manifest.json directly into CSS affine transforms:

> * **Canvas Origin Projection:** To anchor a 1024×1024 character cutout to an exact pixel coordinate (*X*stage​,*Y*stage​) on the 1920×1080 master matte plate without scaling distortions, the component sets the CSS transform-origin to the character's biological anchor (e.g., ground contact point between feet):  
>   OriginX%​\=(1024anchor.x​)×100%,OriginY%​\=(1024anchor.y​)×100%  
> * **Stage Grounding Invariant:** Ground elevation (*Y*ground​) is locked so the character's feet contact the environment floor plane regardless of character scale (*s*):  
>   Toppixel​\=*Y*stage​−anchor.y×*s*  
>   Leftpixel​\=*X*stage​−anchor.x×*s*

##### **2\. Dynamic Viseme Swapping Engine**

The rig overlays Preston Blair mouth shapes (mouth\_closed.png, mouth\_small.png, mouth\_medium.png, mouth\_wide.png) directly onto the base emotion sprite.

> * **Viseme Centroid Alignment:** The viseme texture is framed inside the mouthBoundingBox specified in the character bible. The rig guarantees that the center of the viseme texture aligns with the mouth center:  
>   ∣mouth\_center−viseme\_centroid∣\<4px  
> * **Quantized Acoustic Gating:** Instead of continuous morph targets, viseme frames are swapped using discrete integer thresholds driven by normalized speech stem RMS energy (*E*rms​):  
>   Viseme(*f*)=⎩⎨⎧​mouth\_closed,mouth\_small,mouth\_medium,mouth\_wide,​*E*rms​\<0.050.05≤*E*rms​\<0.300.30≤*E*rms​\<0.65*E*rms​≥0.65​

##### **3\. Kinetic Physics & animation\_hints Parameterization**

To prevent the "mechanical metronome" defect—where every character bobs identically—the rig ingests character-specific scalars from manifest.json:

> * **Conversational Talk-Bounce:** Applied when active speech energy is detected:  
>   *Y*bounce​(*f*)=sin(*λ*bounce​2*πf*​)×*A*bounce​  
>   where *A*bounce​ (e.g., Bog \= 8px, Spleen \= 14px) scales the vertical displacement.  
> * **Pathological Shiver / Tremor:** Driven by high-frequency sinusoidal noise to reflect fear or somatic exhaustion:  
>   *X*jitter​(*f*)=sin(1.85*f*)×*A*shiver​,*Y*jitter​(*f*)=cos(2.11*f*)×*A*shiver​

#### **B. CameraWrappers.tsx (Sequence-Relative Hook Isolation)**

Remotion's native useCurrentFrame() hook measures the frame count relative to its enclosing \<Sequence\> boundary. If camera pans, zooms, or shakes are declared at the root composition level, time flows globally from frame 0 to frame N across the entire episode.

Under a global clock, adding, removing, or trimming Shot 01 shifts the starting frame of Shot 02, altering easing curves, spring velocities, and framing on subsequent cuts.

ROOT-CLOCK VS. SEQUENCE-RELATIVE HOOK EVALUATION  
Global Timeline:  
Shot 01: \[0 ──────────────────────── 99\]  
Shot 02:                                \[100 ─────────────────────── 198\]  
Global useCurrentFrame() at Shot 02 Cut \= Frame 100 (Spring velocity already settled)

Sequence-Relative Timeline (CameraWrappers):  
Shot 02:                                \[0 ────────────────────────── 98\]  
Local useCurrentFrame() at Shot 02 Cut  \= Frame 0 (Spring starts at t=0, fully reproducible)

##### **Implementation Pattern**

CameraWrappers.tsx defines isolated subcomponents for every camera setup. Each wrapper wraps its children in a local coordinate and transform context:

// components/CameraWrappers.tsx  
import React from 'react';  
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface CameraWrapperProps {  
  children: React.ReactNode;  
  originX?: string;  
  originY?: string;  
}

export const Shot01CameraWrapper: React.FC\<CameraWrapperProps\> \= ({  
  children,  
  originX \= '50%',  
  originY \= '50%',  
}) \=\> {  
  const frame \= useCurrentFrame(); // Resets strictly to 0 at shot cut  
  const { fps } \= useVideoConfig();

  // Subtle dramatic push-in: 1.0 \-\> 1.05 over shot length  
  const scale \= interpolate(frame, \[0, 99\], \[1.0, 1.05\], {  
    extrapolateLeft: 'clamp',  
    extrapolateRight: 'clamp',  
  });

  return (  
    \<div  
      style={{  
        width: '100%',  
        height: '100%',  
        transformOrigin: \`\${originX} \${originY}\`,  
        transform: \`scale(\${scale})\`,  
      }}  
    \>  
      {children}  
    \</div\>  
  );  
};

export const Shot02CameraWrapper: React.FC\<CameraWrapperProps\> \= ({  
  children,  
  originX \= '50%',  
  originY \= '50%',  
}) \=\> {  
  const frame \= useCurrentFrame();  
  const { fps } \= useVideoConfig();

  // Aggressive crash zoom using Remotion spring physics  
  const springProgress \= spring({  
    frame,  
    fps,  
    config: {  
      damping: 12,  
      mass: 0.5,  
      stiffness: 180,  
    },  
  });

  const scale \= interpolate(springProgress, \[0, 1\], \[1.0, 1.15\]);

  return (  
    \<div  
      style={{  
        width: '100%',  
        height: '100%',  
        transformOrigin: \`\${originX} \${originY}\`,  
        transform: \`scale(\${scale})\`,  
      }}  
    \>  
      {children}  
    \</div\>  
  );  
};

#### **C. AmbientTrack.tsx (Deterministic Sidechain Ducking)**

AmbientTrack.tsx manages background environmental beds (machinery hums, swamp drones, pipe drips) and executes sidechain gain automation during active dialogue windows.

               MULTI-WINDOW MIN-REDUCTION DUCKING  
Line 1 Active Window: \[10 ─────────── 70\] (Release: frames 70 \-\> 82\)  
Line 2 Active Window:            \[75 ─────────── 130\] (Attack: frames 69 \-\> 75\)

Without Min-Reducer (Naive Evaluation):  
Gain jumps upward at frame 71 due to Line 1 release, then violently dips at frame 74\.  
Result: AUDIBLE GAIN PUMPING ARTIFACT.

With Math.min Evaluation:  
minGain \= Math.min(Line1Gain(f), Line2Gain(f))  
Result: SMOOTH CONTINUOUS ATTENUATION (-14 dB floor held across boundary).

##### **Implementation Contract**

// components/AmbientTrack.tsx  
import React from 'react';  
import { Audio, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';

interface DialogueWindow {  
  from: number;  
  to: number;  
}

interface SilenceWindow {  
  fromFrame: number;  
  toFrame: number;  
  duckAmbientDb: number;  
}

interface AmbientTrackProps {  
  ambientFile: string;  
  baseVolume: number;  
  attenuationDb: number;  
  attackFrames: number;  
  releaseFrames: number;  
  dialogueWindows: DialogueWindow\[\];  
  silences?: SilenceWindow\[\];  
}

export const AmbientTrack: React.FC\<AmbientTrackProps\> \= ({  
  ambientFile,  
  baseVolume,  
  attenuationDb,  
  attackFrames,  
  releaseFrames,  
  dialogueWindows,  
  silences \= \[\],  
}) \=\> {  
  const frame \= useCurrentFrame();  
  const targetDuckedVolume \= baseVolume \* Math.pow(10, attenuationDb / 20);

  let currentGain \= baseVolume;

  // Multi-window minimum evaluation prevents pumping  
  for (const win of dialogueWindows) {  
    let windowGain \= baseVolume;  
      
    if (frame \>= win.from && frame \<= win.to) {  
      windowGain \= targetDuckedVolume;  
    } else if (frame \>= win.from \- attackFrames && frame \< win.from) {  
      windowGain \= interpolate(  
        frame,  
        \[win.from \- attackFrames, win.from\],  
        \[baseVolume, targetDuckedVolume\],  
        { easing: Easing.out(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }  
      );  
    } else if (frame \> win.to && frame \<= win.to \+ releaseFrames) {  
      windowGain \= interpolate(  
        frame,  
        \[win.to, win.to \+ releaseFrames\],  
        \[targetDuckedVolume, baseVolume\],  
        { easing: Easing.in(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }  
      );  
    }  
      
    currentGain \= Math.min(currentGain, windowGain);  
  }

  // Evaluate deliberate dramatic silence overrides  
  for (const silence of silences) {  
    if (frame \>= silence.fromFrame && frame \<= silence.toFrame) {  
      const silenceFloor \= baseVolume \* Math.pow(10, silence.duckAmbientDb / 20);  
      currentGain \= Math.min(currentGain, silenceFloor);  
    }  
  }

  return (  
    \<Audio  
      src={staticFile(\`assets/audio/ambient/\${ambientFile}\`)}  
      volume={currentGain}  
      loop  
    /\>  
  );  
};

#### **D. FoleyTrack.tsx (Deterministic Transient Audio)**

FoleyTrack.tsx mounts discrete physical sound effects (valve drops, boot squelches, gear clicks) pegged to integer frame timestamps derived from narrative AST reaction cues.

               DETERMINISTIC FOLEY RESOLUTION PIPELINE  
                 
  1\. Narrative Interaction Cue (dialogue\_ast.json)  
     { shot: "shot\_02", action: "boot\_step", timestamp\_frame: 22 }  
               │  
               ▼  
  2\. MurmurHash3 Key Generation  
     Key: "ep040:shot\_02:boot\_step" ──► Hash Seed: 0x9e3779b9  
               │  
               ▼  
  3\. Mulberry32 PRNG Execution  
     Sample Variant Index \= Floor(Mulberry32(Seed) \* Pool.length)  
               │  
               ├── Anti-Clustering Check: Did Variant match shot\_01?  
               │      ├── YES ──► Salt Seed: "\${seed}:retry" ──► Re-roll  
               │      └── NO  ──► Retain Variant  
               │  
               ▼  
  4\. Static TSX Literal Mounting  
     \<FoleyTrack src="assets/audio/foley/boot\_squelch\_02.wav" volume={0.72} /\>

##### **Seeded PRNG Variant Resolution**

To eliminate non-deterministic sound variations across different rendering nodes while avoiding robotic repetition, the component leverages a compound hash seed:

Seed=MurmurHash3(sceneId+":"+shotId+":"+sampleKey)  
// Shared deterministic PRNG utility in components/foley-utils.ts  
export function mulberry32(seed: number): () \=\> number {  
  return function () {  
    let t \= (seed \+= 0x6d2b79f5);  
    t \= Math.imul(t ^ (t \>\>\> 15), t | 1);  
    t ^= t \+ Math.imul(t ^ (t \>\>\> 7), t | 61);  
    return ((t ^ (t \>\>\> 14)) \>\>\> 0\) / 4294967296;  
  };  
}

### **5\. Multi-Layer Optical Printing Hierarchy**

Within the stamped workspace, components assemble according to the 4-layer optical printing model:

OPTICAL LAYER COMPOSITING STACK  
┌────────────────────────────────────────────────────────────────────────┐  
│ Layer 4: Global Optical Unification & Camera Optics                    │  
│ • CameraWrappers.tsx (Pans, Push-ins, Easing springs)                  │  
│ • Offline FFmpeg Filtergraph (Kodak 2383 LUT, 35mm grain, Halation)    │  
├────────────────────────────────────────────────────────────────────────┤  
│ Layer 3: Foreground Actor Grounding & Viseme Swapping                  │  
│ • GoblinPuppet.tsx (2D Cutout Rig, Preston Blair Visemes)              │  
│ • Directional light-wrap & Contact shadows                             │  
├────────────────────────────────────────────────────────────────────────┤  
│ Layer 2: Practical Atmosphere & Vector Motion Graphics                 │  
│ • Procedural Fog / Rain loops via \<OffthreadVideo/\>                    │  
│ • Zero-Diffusion Text Rule (Crisp vector SVGs from design tokens)      │  
├────────────────────────────────────────────────────────────────────────┤  
│ Layer 1: Bespoke Hand-Painted Matte Background                         │  
│ • Static 2048x1152 matte plate (Eliminates AI background swim)         │  
│ • Mathematical affine coordinate pinning                               │  
└────────────────────────────────────────────────────────────────────────┘

> * **Layer 1 (Environment Matte):** Mounts the static high-resolution background plate (2048×1152), anchoring the physical horizon line and spatial light origin vectors.  
> * **Layer 2 (Atmosphere & Motion Graphics):** Overlays looping volumetric environmental elements via \<OffthreadVideo\> using CSS screen and lighten blend modes. Text and interface elements follow the **Zero-Diffusion Text Rule**: they are rendered exclusively as crisp vector SVGs directly in React, completely bypassing diffusion models.  
> * **Layer 3 (Foreground Actors):** Evaluates GoblinPuppet.tsx (or green-screen alpha-keyed diffusion plates), managing character ground plane contact and dynamic mouth viseme swapping.  
> * **Layer 4 (Mastering & Optical Unification):** Applies the sequence-relative affine camera transforms from CameraWrappers.tsx. High-overhead optical effects—such as 3D .cube color Look-Up Tables, procedural 35mm film grain, and red-orange halation bloom—are decoupled from Remotion and applied downstream via an offline FFmpeg filtergraph to guarantee deterministic headless rendering on CPU.

### **Component Responsibility & Invariant Matrix**

| Vendored Component | Operational Responsibility | Input Data Contracts | Deterministic Failure Sentinel |
| :---- | :---- | :---- | :---- |
| **GoblinPuppet.tsx** | Character rigging, anchor positioning, viseme overlay, kinetic bouncing. | manifest.json (anchorPoint, mouthBoundingBox, animation\_hints). | Viseme centroid drift must measure \<4px off mouth center. |
| **CameraWrappers.tsx** | Scopes useCurrentFrame() to shot duration; applies pans, zooms, springs. | Scoped sequence durations (*D*frames​), target anchor transforms. | AST import audit prevents escaping workspace root via ../... |
| **AmbientTrack.tsx** | Continuous atmospheric sound beds; sidechain gain ducking automation. | Dialogue speech windows \[*f*start​,*f*end​\], silence intervals. | Math.min reducer prevents audio pumping artifacts between lines. |
| **FoleyTrack.tsx** | Frame-accurate transient sound triggers snapped to physical actions. | AST reaction cues, compound MurmurHash3 seeds, acoustic sample keys. | Anti-clustering salt prevents identical transient variant reuse across adjacent shots. |

---

*User prompt: {{FOCUS: 4\. public/assets/ (Pruned Local Asset Envelope) }} /extreme-details*

Response: public/assets/ is the pruned, hermetically sealed local asset envelope housed within each stamped episode workspace in goblin-episodes/ (and the generalized pattern \[series-episodes\]/). It serves as the physical boundary that isolates downstream headless Chromium rendering nodes from the multi-gigabyte upstream visual and acoustic vaults.

By staging only the explicit binary media files declared in the narrative AST, public/assets/ reduces workspace asset footprints by over 90% to 98%, protects headless compositing nodes from memory exhaustion, and cryptographically guarantees offline rendering determinism.

### **1\. Architectural Mandate: Resolving the Multi-Episode Redundancy Problem**

The upstream source art vault (\[series\]-assets-visual / goblin-assets-visual) operates on **Axis B (Representation / Artifact Hardening)** as a centralized, content-addressed visual authority. It stores complete 48-to-52-emotion variant banks for every cast member, layered master source artwork (.psd, .ai), high-resolution background plates (1920×1080 / 4K), and candidate staging directories (/emotion\_bank/). In total, the visual vault spans between 10 GB and 18.4 GB of Git LFS data.

THE MULTI-EPISODE REDUNDANCY COLLAPSE (NAIVE VS. PRUNED)

NAIVE DIRECTORY CLONING:  
Master Visual Vault (\>10 GB \- 18.4 GB)  
      │  
      ├── Clone into Episode 001 ──► 200 MB \- 600 MB unpruned cast assets  
      ├── Clone into Episode 002 ──► 200 MB \- 600 MB unpruned cast assets  
      └── Clone into Episode 020 ──► 200 MB \- 600 MB unpruned cast assets  
RESULT: 4 GB \- 12 GB of pure data duplication across a single 20-episode season.  
        Docker overlay exhaustion, CI network saturation, and Chromium out-of-memory.

AST-DRIVEN HERMETIC HARVESTING (collect-episode-assets.ts):  
Master Visual Vault (\>10 GB) ──► AST Crawl ──► public/assets/ (18 MB \- 42 MB)  
RESULT: \>90% to 98% footprint reduction; offline self-contained; zero network calls.

#### **The Multi-Episode Redundancy Problem**

> * **Unpruned Waste:** A typical scene utilizes between two and four speaking characters, referencing only one or two specific emotion poses per character. Naively copying full character directories copies 46 to 50 unreferenced emotion files per character, bloating each episode directory with 200 MB to 600 MB of redundant binaries.  
> * **Seasonal Bloat:** Across a standard 20-episode season, naive asset copying generates 4 GB to 12 GB of duplicate Git and disk overhead.  
> * **Hermetic Local Execution:** public/assets/ completely decouples the rendering phase from external networks, shared network mounts, and upstream repository mutations. Once harvested, rendering executes entirely offline; deleting or refactoring the upstream goblin-assets-visual repository has zero effect on the local workspace's ability to render bit-identical frames.

### **2\. The Two-Stage Ingestion Pipeline**

Rather than relying on fragile Git submodules—which cause detached HEAD ambiguities, credential inheritance failures in CI, and recursive cloning of gigabytes of dead binary history—the pipeline moves assets through a two-stage extraction sequence:

STAGE 1: TAGGED SHALLOW SYNCHRONIZATION (sync-assets.ts)  
\[series\]-assets-visual (Remote Vault via Cloudflare R2 / Git LFS)  
                          │  
                          │ git clone \--depth 1 \--filter=blob:none \--no-checkout  
                          ▼  
\[series\]-viewport-template / Cache (Local NVMe Shared Staging Buffer)  
                          │  
STAGE 2: AST DEPENDENCY HARVESTING (collect-episode-assets.ts)  
                          │  
  Crawls: drafts/dialogue\_ast.json & scene\_manifest.json  
  Reads:  manifest.json (coordinates, anchors, and viseme rects)  
                          │  
                          ├── 1\. Stage exact location background plate  
                          ├── 2\. Stage active speaker base\_states.idle  
                          ├── 3\. Stage declared emotion condition variants  
                          └── 4\. Stage referenced Preston Blair phoneme visemes  
                          │  
                          ▼  
\[series-episodes\]/epXXX/public/assets/ (The Pruned Sandbox: 18 MB \- 42 MB)

#### **Stage 1: Tagged Shallow Synchronization (sync-assets.ts)**

> * **Decoupled Version Locking:** Downstream compositors read the pinned visual semver hash or tag recorded in versions.json (e.g., "\[series\]-assets-visual": "v1.4.0" or latest-stable). Compositors remain insulated from upstream master branch commits until a formal lockfile update pull request is merged.  
> * **Blobless LFS Fetching:** The script executes a tree-filtered shallow clone that pulls only the Git tree without binary blobs:  
>   git clone \--depth 1 \--branch v1.4.0 \--filter=blob:none \--no-checkout \\  
>     https://github.com/studio/\[series\]-assets-visual.git ./cache/assets-visual/  
>   git lfs pull \--include="characters/\*/variants/\*\*,environments/\*\*"

This populates the local workstation NVMe staging cache with certified art while bypassing all intermediate draft takes and experimental training checkpoints.

#### **Stage 2: AST Dependency Harvesting (collect-episode-assets.ts)**

The extraction engine crawls the compiled narrative AST (dialogue\_ast.json) and spatial staging manifests (scene\_manifest.json / location\_manifest.json) to execute surgical cherry-picking:

> 1. **Location Matte Extraction:** Reads the scene's location\_id, loads the corresponding environment manifest.json, and copies only the specific hand-painted background plate (e.g., environments/warm\_pipe/background.png).  
> 2. **Character Variant Targeting:** For every dialogue turn in the AST, the script identifies the speaking entity, opens their manifest.json, and stages their neutral baseline (base\_states.idle). It then resolves the specific emotional condition tag declared on the line (e.g., "emotion": "humiliated"). The harvester extracts only bog\_humiliated.png, completely ignoring the remaining 46 to 50 unused emotion plates in that character's variant bank.  
> 3. **Phoneme Viseme Harvesting:** The harvester parses the audio sync cue stream and copies *only* the specific Preston Blair mouth shapes (mouth\_closed.png, mouth\_small.png, mouth\_medium.png, mouth\_wide.png) directly referenced by the spoken phonemes in that scene.  
> 4. **Physical Extraction:** Files are copied directly into the episode's sandboxed filesystem under public/assets/. Total harvested files typically range between 10 and 20 individual graphic files.

### **3\. Physical Storage Envelopes & Fail-Fast Economics (*T*0​\=\$0.00)**

The pipeline enforces an asymmetric economic QA mandate: **fail as close as possible to the cheapest point of detection (*T*0​\=\$0.00)**.

Catching an asset defect, missing file, or bloated payload at compile time (*T*0​) costs \$0.00 because zero cloud resources or compute hours have been allocated. Allowing an oversized payload to escape into headless Chromium execution (*T*3​) or broadcast delivery (*T*5​) causes severe compute waste, memory crashes, and invalidates downstream caches.

┌────────────────────────────────────────────────────────────────────────┐  
│                   THE STORAGE ENVELOPE SPECIFICATION                   │  
├──────────────────────────────────────┬─────────────────────────────────┤  
│ Metric Dimension                     │ Production Boundary Rule        │  
├──────────────────────────────────────┼─────────────────────────────────┤  
│ Target Episode Asset Budget          │ \< 100 MB (Nominal Green Light)  │  
├──────────────────────────────────────┼─────────────────────────────────┤  
│ Absolute Maximum Storage Ceiling     │ 150 MB (Hard Compile-Time Gate) │  
├──────────────────────────────────────┼─────────────────────────────────┤  
│ Realized Pruned Workspace Size       │ 18 MB \- 42 MB (Animatics: 5-28MB)│  
├──────────────────────────────────────┼─────────────────────────────────┤  
│ Maximum Single Sprite Dimension      │ 2048 x 2048 (4-Channel RGBA)    │  
├──────────────────────────────────────┼─────────────────────────────────┤  
│ Headless Chromium Memory Budget      │ Max 1.2 GB V8 Heap per Isolate  │  
├──────────────────────────────────────┼─────────────────────────────────┤  
│ Storage Check Execution Time         │ T\_0 (Build Step 0: \$0.00 Cost)  │  
└──────────────────────────────────────┴─────────────────────────────────┘

#### **The Storage Enforcement Gate (assert-storage-envelope.ts)**

Immediately following extraction, the compiler runs an automated disk audit over public/assets/ before launching any rendering worker:

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

  // Hard Ceiling Breach: Unpruned data or raw PSD leak  
  if (totalBytes \> HARD\_CEILING\_BYTES) {  
    console.error(\`\\n\[FATAL ENVELOPE BREACH\] Staged asset footprint (\${totalMb} MB) exceeds hard ceiling of 150 MB.\`);  
    console.error(\`Action: Inspect staged files. Ensure raw PSDs or unpruned emotion banks were not ingested.\`);  
    process.exit(1); // Halts compilation immediately at T\_0 (\$0.00 spent)  
  }

  // Nominal Budget Warning  
  if (totalBytes \> NOMINAL\_BUDGET\_BYTES) {  
    console.warn(\`\\n\[STORAGE WARNING\] Staged asset footprint (\${totalMb} MB) exceeds nominal target of 100 MB.\`);  
  } else {  
    console.log(\`\\n\[ENVELOPE PASS\] Staged assets verified: \${totalMb} MB / 100 MB nominal budget.\`);  
  }  
}

> * **Failure Tripping:** If a human operator accidentally places an uncompressed 2 GB Photoshop source file into variants/, or if the harvester accidentally copies an entire unpruned emotion bank, the total directory size breaches 150 MB. The compiler terminates execution immediately with exit code 1 at *T*0​, aborting the run before Chromium spawns.

### **4\. Cryptographic Hygiene & Integrity Guards**

Staged binary files in public/assets/ are subjected to automated structural and cryptographic validation to prevent corrupt data from reaching the browser engine.

                  PRE-RENDER INTEGRITY GAUNTLET (Confidence 0\)  
                    
  Inspect Staged Assets (public/assets/)  
                  │  
                  ├── 1\. SHA-256 Digest Check  
                  │      SHA-256 \== e3b0c44298fc1c149afbf4c8996fb92427ae41... ?  
                  │      ├── YES ──► FATAL: ZERO\_BYTE\_POISON (Exit Code 1\)  
                  │      └── NO  ──► Continue  
                  │  
                  ├── 2\. Minimum Size & Header Audit  
                  │      File Size \< 1,024 bytes OR Starts with "version https://git-lfs"?  
                  │      ├── YES ──► FATAL: UNHYDRATED\_LFS\_POINTER (Exit Code 1\)  
                  │      └── NO  ──► Continue  
                  │  
                  ├── 3\. Disk Parity Sweep (\!MissingAssets)  
                  │      Does staticFile("...") in Episode\_XXX.tsx exist on disk?  
                  │      ├── NO  ──► FATAL: MISSING\_ASSET\_DEPENDENCY (Exit Code 1\)  
                  │      └── YES ──► Continue  
                  │  
                  └── 4\. Tree-Hash Staleness Verification  
                         Live characters/ Git Tree SHA \== Expected Tree SHA in bible-state?  
                         ├── NO  ──► FATAL: CANON\_STALE (Exit Code 1\)  
                         └── YES ──► AUTHORIZE CHROMIUM LAUNCH

#### **A. The Zero-Byte Poison Sentinel & Silent Truncation Defect**

A recurring vulnerability in automated pipelines relying on cloud buckets and Git LFS is the **Silent Truncation Defect**:

> 1. A runner lacking Git LFS credentials or authentication hooks checks out the repository, downloading standard ∼130-byte ASCII text pointer files (e.g., version \[https://git-lfs.github.com/spec/v1\](https://git-lfs.github.com/spec/v1)...) instead of hydrated PNG binaries.  
> 2. A network timeout or socket drop terminates an HTTP stream prematurely, writing a zero-byte (0 bytes) file to disk.  
> 3. When headless Chromium attempts to decode a zero-byte file or an ASCII pointer inside an HTML5 \<img\> or \<canvas\> context, it throws an unhandled decoding exception, enters an infinite thread hang, or silently outputs hundreds of black frames while consuming CPU and GPU cycles.

To eliminate this, the ingestion engine calculates the SHA-256 binary hash of every file staged in public/assets/ and checks it against the mathematical empty-string constant:

SHA-256empty​\=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

If any staged file matches this hash—or if its byte length falls below 1,024 bytes for raster images and audio stems—the sentinel halts compilation with a fatal ZERO\_BYTE\_ASSET\_POISON exception. Furthermore, binary files must successfully decode (opening headers via image decoders and probing audio frame lengths via ffprobe) before promotion into the rendering sandbox.

#### **B. The Disk Parity Sweep (\!MissingAssets)**

Before initializing the Remotion compositor, an automated pre-flight script parses the static TypeScript AST of Episode\_XXX.tsx. It extracts all asset targets wrapped in staticFile(...) declarations and asserts their presence on disk within public/assets/. If a single sprite, mouth viseme, or sound effect is missing from the directory, the build terminates with exit code 1 before launching headless Chromium.

#### **C. Tree-Hash Staleness Verification (CANON\_STALE)**

To ensure visual representations never fall out of sync with canonical narrative facts, the compiler executes a Git tree-hash validation:

> 1. Upstream narrative compilation (worker-sower-engine) bakes the expected Git tree SHA of the visual vault into compiled/bible-state.json.  
> 2. During episode assembly, the conductor computes the live Git tree SHA of the characters/ folder in the fetched asset vault.  
> 3. If the live hash diverges from the state ledger, the build aborts with a CANON\_STALE error, preventing the episode from rendering an unauthorized visual revision.

### **5\. Missing Assets, Closed Status Taxonomy, & The Explicit Null Protocol**

In generative production, dialogue writing and audio synthesis frequently outpace visual character plate completion. Treating missing artwork as an unexpected runtime crash creates severe production bottlenecks, while silently ignoring missing art results in blank, corrupt video renders.

The pipeline formalizes asset availability through a closed status taxonomy and the **Explicit Null Protocol**:

┌────────────────────────────────────────────────────────────────────────┐  
│                   CLOSED ASSET STATUS TAXONOMY                         │  
├──────────────────────┬─────────────────────────────────────────────────┤  
│ STATUS TAG           │ DEFINITION & ENGINE BEHAVIOR                    │  
├──────────────────────┼─────────────────────────────────────────────────┤  
│ VALID                │ Asset exists, passes hash checks, ready for use\[cite: 5\]. │  
├──────────────────────┼─────────────────────────────────────────────────┤  
│ INTENTIONALLY\_ABSENT │ Declared as explicit null in manifest.json      │  
│                      │ (variant un-illustrated by design)\[cite: 2, 5\].             │  
├──────────────────────┼─────────────────────────────────────────────────┤  
│ WAIVED               │ Temporary waiver registered in release ledger,  │  
│                      │ signed by an authorized human approver\[cite: 2, 5\].         │  
├──────────────────────┼─────────────────────────────────────────────────┤  
│ BROKEN               │ Path declared in manifest but missing on disk;  │  
│                      │ or fails SHA-256 digest validation\[cite: 2, 5\].             │  
└──────────────────────┴─────────────────────────────────────────────────┘

#### **The Contract of Intentional Absence**

> * **No Missing Keys:** Missing emotional variants are never omitted from manifest.json, as omitted JSON keys cannot be distinguished from parser corruption. Un-illustrated emotional states are committed explicitly as null (e.g., "terrified": null). This signals that the omission is a known production gap rather than an unresolved error.

#### **Dual-Mode Resolution Architecture**

> * **Draft & Animatic Fallback Mode:** When compiling internal animatics or editor drafts, if collect-episode-assets.ts encounters an AST node referencing an INTENTIONALLY\_ABSENT (null) variant, the compiler emits a non-blocking WARN, substitutes base\_states.idle.png, and inherits the base anchor coordinates. The animatic continues rendering without missing character geometry.  
> * **Broadcast Mastering Gate (Fail-Loud Law):** Final broadcast mastering builds enforce zero tolerance:  
>   ∀shot∈Episode,referenced\_variant(shot)=null  
>   If any shot in a production mastering run references an un-illustrated null variant, the build terminates immediately with exit code 1\.  
> * **The Unified Waiver Ledger:** The only mechanism to bypass a broadcast failure for an un-illustrated asset is for a showrunner or art director to commit an authorized, cryptographically signed waiver to the release ledger.

### **6\. Physical Directory Structure of public/assets/**

When collect-episode-assets.ts completes extraction, the staged public/assets/ directory inside goblin-episodes/ep040/ exhibits this final physical layout:

goblin-episodes/ep040/public/assets/  
├── backgrounds/  
│   └── swamp\_relay\_matte.png         \# Exact 2048x1152 background plate for Scene 01  
├── sprites/  
│   ├── bog\_idle.png                  \# Baseline neutral sprite for Bog (1024x1024)  
│   ├── bog\_humiliated.png            \# Certified condition variant for Line 001  
│   ├── spleen\_idle.png               \# Baseline neutral sprite for Spleen  
│   └── spleen\_defensive.png          \# Certified condition variant for Line 002  
├── visemes/  
│   ├── mouth\_closed.png              \# Preston Blair phoneme shape (Rest / M, B, P)  
│   ├── mouth\_small.png               \# Phoneme shape (E, S, T)  
│   ├── mouth\_medium.png              \# Phoneme shape (A, I)  
│   └── mouth\_wide.png                \# Phoneme shape (O, U, Loud transients)  
└── audio/  
    ├── dialogue/  
    │   ├── ep040\_sh01.wav            \# Synthesized 48 kHz uncompressed vocal stem (Bog)  
    │   └── ep040\_sh02.wav            \# Synthesized 48 kHz uncompressed vocal stem (Spleen)  
    ├── foley/  
    │   ├── valve\_drop.wav            \# MurmurHash3-seeded transient sound effect  
    │   └── boot\_squelch\_02.wav       \# Seeded transient sound effect (anti-clustered)  
    └── ambient/  
        └── swamp\_drone.wav           \# Continuous background environmental audio bed

#### **Invariant Metadata Binding**

Every file copied into public/assets/ is registered in render\_manifest.json under its specific content-addressed SHA-256 hash. Because Episode\_040.tsx addresses these files locally via staticFile("assets/..."), the entire episode package forms an immutable, sealed build graph capable of rendering offline across years of production infrastructure updates.

---

*User prompt: {{FOCUS: 5\. Toolchain & Execution Configurations }} /extreme-details*

Response: The toolchain and execution architecture of goblin-episodes (and its generalized series pattern \[series-episodes\]) under Cluster 05.delivery/ establishes a deterministic runtime environment for episodic video compositing. It translates source-baked React compositions (Episode\_XXX.tsx) into broadcast deliverables while protecting the pipeline against hardware driver instability, memory exhaustion, runtime drift, and unverified dependency shifts.

### **1\. Hardware Profile Boundary: The Rig 1 vs. Rig 2 Workstation Demarcation**

The execution model enforces a physical hardware split between CPU orchestration/compositing (Rig 1\) and heavy GPU tensor diffusion (Rig 2\) to prevent multi-modal compute contention:

┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐  
│ RIG 1: ORCHESTRATION & OPTICAL ASSEMBLY│       │ RIG 2: HEAVY GPU TENSOR FOUNDRY        │  
│ (Zero Dedicated VRAM / Pure CPU & RAM) │       │ (Dedicated Silicon / High VRAM)        │  
├────────────────────────────────────────┤       ├────────────────────────────────────────┤  
│ • worker-sower-conductor (Node.js LTS) │       │ • Headless ComfyUI Daemon (:8188)      │  
│ • Local Canon DB (SQLite / Ledger)     │       │ • media-broker Controller (:3000)      │  
│ • Local Audio Microservice (:8000)     │  ──►  │ • 100% of VRAM dedicated to:           │  
│ • Temporal Quantizer (ffprobe CLI)     │ JSON  │     \- Wan 2.2 / LoRA Diffusion Passes  │  
│ • Optical Compositor (Remotion CLI)    │  IPC  │     \- \#00FF00 Greenscreen Plates       │  
│   \- Headless Chromium (--gl=swangle)   │       │ • POSIX flock(/var/lock/rig2\_gpu.lock) │  
│   \- Concurrency: \--concurrency=1       │       │ • Process Isolation Invariant:         │  
│ • Resource Footprint: 0 MB GPU VRAM    │       │     \- ZERO Chromium / Remotion Renders │  
└────────────────────────────────────────┘       └────────────────────────────────────────┘

#### **The Multi-Modal Contention Hazard**

Running large language models, neural acoustic synthesizers, headless Chromium browser instances, and spatio-temporal video diffusion networks on a shared GPU workstation triggers compounding systemic failures:

> * **Driver Context Collisions:** Concurrently launching @remotion/renderer (Chromium) on an active NVIDIA CUDA host causes OpenGL driver context loss, GPU kernel race conditions, and GPU memory fragmentation.  
> * **Fatal OOM Aborts:** Video diffusion passes (such as Wan 2.2) consume 16 GB to 22 GB of physical VRAM. Spawning a Chromium rendering process on that same GPU triggers immediate CUDA Out-Of-Memory (OOM) aborts and Linux kernel oom-killer terminations.  
> * **State Pollution:** Concurrent SQLite writes and unconstrained browser processes on a tensor generation spoke risk corrupted transaction logs and split-brain state mutations.

#### **Rig 1 Execution Profile**

Rig 1 operates entirely on multi-core CPU architecture (x86\_64 or ARM64) and 32 GB to 64 GB of system RAM, allocating **exactly 0 MB of dedicated GPU VRAM**.

> * **POSIX Runtime Authority:** Unlike upstream simulation workers trapped within 128 MB Cloudflare Workers edge isolate sandboxes, the Rig 1 conductor (worker-sower-conductor) runs in a full POSIX Node.js runtime with explicit authority to spawn native operating system child processes: child\_process.spawn('ffprobe'), child\_process.spawn('git'), and npx remotion render.  
> * **Process Quarantine:** Rig 2 is strictly forbidden from executing Chromium, Remotion, audio vocoders, or SQLite database drivers. All timeline layout, audio mixing, visual layer compositing, and broadcast container multiplexing are quarantined to Rig 1\.

### **2\. remotion.config.ts: Headless Hardware Stability & Software OpenGL**

The rendering pipeline relies on @remotion/renderer to drive headless Chromium. To ensure deterministic rasterization and prevent headless browser hangs, remotion.config.ts locks down the rendering environment:

// remotion.config.ts (Sealed Execution Configuration)  
import { Config } from '@remotion/cli/config';

// 1\. Force Software OpenGL Rasterization (SwiftShader on ANGLE)  
Config.setChromiumOpenGlRenderer('swangle');

// 2\. Lock Concurrency to Single-Worker Threading  
Config.setConcurrency(1);

// 3\. Isolate Video Decoding to Background FFmpeg Processes  
Config.setOffthreadVideo(true);

// 4\. Set Headless Browser Timeout & Memory Headroom  
Config.setTimeoutInMilliseconds(120000);  
Config.setPixelFormat('yuv420p');  
Config.setCodec('h264');  
Config.setImageFormat('png');  
Config.setScale(1);

// 5\. Headless Chromium Security and Sandboxing Flags  
Config.setChromiumFlags(\[  
  '--no-sandbox',  
  '--disable-setuid-sandbox',  
  '--disable-dev-shm-usage',  
  '--disable-accelerated-2d-canvas',  
  '--disable-gpu',  
  '--no-zygote',  
  '--single-process',  
\]);

#### **Configuration Flags**

> * **Software OpenGL Enforcement (gl: 'swangle'):** Disables hardware-accelerated ANGLE backends in favor of Google SwiftShader running on top of ANGLE (swangle). This completely bypasses host GPU drivers, eliminating Linux OpenGL display leaks and X11/Wayland context loss while guaranteeing bit-identical CPU pixel rendering.  
> * **Single-Worker Concurrency Throttle (concurrency: 1):** Rendering multi-layer 1080p compositions across concurrent browser tabs quickly exhausts system RAM, triggering V8 heap thrashing and frame drops. Locking concurrency to 1 limits the V8 heap footprint to \<1.2 GB, ensuring deterministic, sequential frame rasterization without memory leaks.  
> * **Off-Thread Media Decoders (\<OffthreadVideo/\> / setOffthreadVideo(true)):** Chromium's native HTML5 \<video\> tag implementation leaks memory over long rendering runs because decoded video frames accumulate in the browser DOM memory heap. Off-thread decoding extracts frames using background FFmpeg CLI subprocesses outside the browser sandbox, streaming raw decoded frames directly into the compositing canvas and eliminating DOM memory bloat.  
> * **Shared Memory Mitigation (--disable-dev-shm-usage):** Containerized CI environments allocate a default 64 MB shared memory space (/dev/shm), which causes Chromium to crash on high-resolution layers. This flag forces Chromium to use /tmp system RAM instead.

### **3\. Dependency Freezing & Toolchain Hermeticity (package.json & tsconfig.json)**

To prevent the **Historical Corruption Trap**—where updating an upstream library months later breaks past episode renders—the stamped workspace pins its entire runtime dependency tree.

               WORKSPACE DEPENDENCY HIERARCHY  
                 
┌────────────────────────────────────────────────────────┐  
│ central: goblin-config (Shared Ruleset & Types)       │  
│ • Inherited via "file:../goblin-config"                │  
└───────────────────────────┬────────────────────────────┘  
                            │  
                            ▼  
┌────────────────────────────────────────────────────────┐  
│ epXXX/package.json (Pinned Immutable Manifest)         │  
│ • "private": true (Prevents accidental registry publish)│  
│ • ZERO floating carats (^) or tildes (\~)               │  
│ • Pure NPM Workspaces (Strict ban on Nx, pnpm, yarn)   │  
└───────────────────────────┬────────────────────────────┘  
                            │  
                            ▼  
┌────────────────────────────────────────────────────────┐  
│ epXXX/tsconfig.json (Strict TypeScript Sandbox)        │  
│ • module: "NodeNext"                                   │  
│ • target: "ES2022"                                     │  
│ • strict: true, noImplicitAny: true                    │  
│ • JSX: "react-jsx"                                     │  
└────────────────────────────────────────────────────────┘

#### **Pinned Dependency Specification (package.json)**

The stamped package.json contains locked dependency versions without range operators:

{  
  "name": "@goblin-episodes/episode-040",  
  "version": "1.0.0",  
  "private": true,  
  "type": "module",  
  "scripts": {  
    "build": "remotion render Episode\_040 out/master\_040.mp4",  
    "build:mezzanine": "remotion render Episode\_040 out/mezzanine\_040.mov \--codec=prores \--prores-profile=4444",  
    "audit:preflight": "tsx ../../scripts/preflight-audit.ts",  
    "test:conformance": "vitest run tests/conformance.test.ts"  
  },  
  "dependencies": {  
    "@remotion/cli": "4.0.140",  
    "@remotion/core": "4.0.140",  
    "@remotion/media-utils": "4.0.140",  
    "@remotion/renderer": "4.0.140",  
    "react": "18.2.0",  
    "react-dom": "18.2.0",  
    "zod": "3.22.4"  
  },  
  "devDependencies": {  
    "@types/node": "20.12.0",  
    "@types/react": "18.2.79",  
    "goblin-config": "file:../../packages/goblin-config",  
    "ts-morph": "21.0.1",  
    "tsx": "4.7.1",  
    "typescript": "5.4.3",  
    "vitest": "1.4.0"  
  }  
}

> * **Absolute Zero-Carat Law:** Dependencies omit caret (^) and tilde (\~) prefixes. Every execution of npm install inside CI/CD or archival recreation resolves the exact same semantic versions.  
> * **Pure NPM Workspace Discipline:** Multi-repository builds rely on standardized NPM workspaces. Monorepo tooling like Nx, pnpm, or yarn is banned across the pipeline to prevent custom package resolution hooks and symlink nesting from breaking container builds.

#### **Compiler Settings (tsconfig.json)**

Type safety and predictable module resolution are enforced via strict TypeScript configurations:

{  
  "compilerOptions": {  
    "target": "ES2022",  
    "module": "NodeNext",  
    "moduleResolution": "NodeNext",  
    "lib": \["DOM", "DOM.Iterable", "ES2022"\],  
    "allowJs": false,  
    "jsx": "react-jsx",  
    "strict": true,  
    "noImplicitAny": true,  
    "strictNullChecks": true,  
    "strictFunctionTypes": true,  
    "noImplicitThis": true,  
    "alwaysStrict": true,  
    "noUnusedLocals": true,  
    "noUnusedParameters": true,  
    "noImplicitReturns": true,  
    "noFallthroughCasesInSwitch": true,  
    "noUncheckedIndexedAccess": true,  
    "esModuleInterop": true,  
    "skipLibCheck": false,  
    "forceConsistentCasingInFileNames": true  
  },  
  "include": \["Episode\_040.tsx", "components/\*\*/\*.tsx", "types/\*\*/\*.ts"\],  
  "exclude": \["node\_modules", "out"\]  
}

### **4\. Containerization, Execution Sandboxing, & Forensic Environment Locking**

To eliminate rendering differences caused by varying host operating systems, media compositing executes within an immutable Open Container Initiative (OCI) container image.

┌────────────────────────────────────────────────────────────────────────┐  
│             MULTI-STAGE RENDER CONTAINER (ghcr.io/studio/render-node)  │  
├────────────────────────────────────────────────────────────────────────┤  
│ STAGE 1: BUILDER & COMPILER (nvidia/cuda:12.4.1-devel-ubuntu22.04)     │  
│ • gcc, g++, nvcc, kernel headers                                       │  
│ • Compiles native C++ extensions, custom Node/Python shared objects    │  
│ • Validates static FFmpeg 6.1.1 binary checksum                        │  
├──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Copy compiled binaries only  
                                   ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 2: LEAN RUNTIME SANDBOX (ghcr.io/studio/render-node@sha256:...)  │  
│ • Base: Ubuntu 22.04 LTS (Zero unpinned build toolchains)              │  
│ • Node.js: v20.12.0 LTS (Pinned exact binary release)                  │  
│ • Chromium Milestone: 122.0.6261.94 (Pinned layout engine)             │  
│ • Remotion CLI: 4.0.140                                                │  
│ • Static FFmpeg: 6.1.1-static (Bit-identical color transforms)         │  
│ • Font Manifest: Verified SHA-256 typography hashes                    │  
└────────────────────────────────────────────────────────────────────────┘

#### **The Five Pinned Execution Milestones**

The environment specification in render\_manifest.json locks five runtime properties:

> 1. **Container Image Digest:** Pinned via explicit 64-character SHA-256 (ghcr.io/studio/render-node@sha256:7b4a29c1...), locking down Linux userspace libraries and standard C runtimes.  
> 2. **Chromium Engine Milestone:** Pinned to 122.0.6261.94. Browser layout updates between major milestones can introduce sub-pixel shifts in text kerning, flexbox rounding, or SVG transforms.  
> 3. **Static FFmpeg Binary:** Pinned to 6.1.1-static. Eliminates variable color space conversion math (*Y*’*CbCr*↔*RGB*) and dynamic quantization differences across varying system FFmpeg packages.  
> 4. **Node.js LTS Build:** Pinned to v20.12.0.  
> 5. **Typography Manifest (font\_manifest):** Font files (.ttf, .woff2) are content-addressed and mounted directly from the local workspace. This prevents rendering differences caused by varying font versions on the host system.

"font\_manifest": {  
  "Cinzel-Bold.ttf": "sha256:5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",  
  "Inter-Bold.ttf": "sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d"  
}

### **5\. Mastering Egress: Asymmetric Master Preservation & C2PA Ingestion (out/)**

Master video deliverables are exported into epXXX/out/ under the **Asymmetric Master Preservation Law**, generating two distinct output formats:

epXXX/out/  
├── master\_040.mp4           \# Broadcast Master (H.264 / AAC \+ Embedded C2PA Provenance)  
└── mezzanine\_040.mov        \# Archival Master (ProRes 4444 \+ 24-bit 48kHz M\&E Stems)

#### **Master Delivery Matrix**

| Output Artifact | Codec & Container | Bit Depth & Color Profile | Audio Mastering Constraints | Provenance Payload | Primary Destination |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **master\_XXX.mp4** | H.264 (High Profile) / MP4 | 8-bit, 4:2:0 YUV, 24.0 fps | AAC-LC, 320 kbps, 48 kHz stereo; −16.0 LUFS±1.0, Peak ≤−1.0 dBTP | Injected C2PA manifest container (Authoring Git commits, build ID) | Edge CDN / Web Streaming / Social Distribution |
| **mezzanine\_XXX.mov** | Apple ProRes 4444 / QuickTime MOV | 12-bit, 4:4:4:4 RGB \+ Alpha, 24.0 fps | Uncompressed 24-bit 48 kHz PCM; Discrete M\&E stems (Music, Foley, Dialogue) | External sidecar render\_manifest.json | Cold Archival Storage / Post-Production Remastering |

#### **C2PA Cryptographic Provenance Injection**

During MP4 generation, the compositor injects the complete DAG metadata from render\_manifest.json directly into the MP4 container via C2PA standards:

> * **Cryptographic Attestation:** Embeds the upstream Git commit SHAs (worker-sower-engine, 000.goblin-lore, goblin-assets-visual), source AST digests, model weights, and the media-broker digital signature into the media header.  
> * **Tamper Evident:** Modifying or re-encoding frames invalidates the embedded signature, ensuring end-to-end auditability from human commits down to output pixels.  
> * **MovieLabs MMC Alignment:** Structures metadata to conform to MovieLabs Media Manifest Core (MMC) delivery requirements.

### **6\. Execution Invocation & Progressive Verification Gauntlets**

The rendering process executes through a series of progressive confidence gates, failing early at the lowest compute cost (*T*0​\=\$0.00):

\[ CONFIDENCE 0: Structural Pre-Flight \]  ──► Zero-byte trap, schema assertions, \!MissingAssets (\$0.00)  
              │ Pass (Exit Code 0\)  
              ▼  
\[ CONFIDENCE 1: Physical Signal Gates \] ──► ffprobe frame allocations, loudness (-16 LUFS), peak \<= \-1.0 dBTP  
              │ Pass (Exit Code 0\)  
              ▼  
\[ CONFIDENCE 2: Geometric & Optical \]   ──► Viseme drift \< 4px, contact anchor touches floor, spill \< 12  
              │ Pass (Exit Code 0\)  
              ▼  
\[ CONFIDENCE 3: Semantic & State Proof\] ──► Dual-field lemma verifier, banned capability verbs, epistemic firewall  
              │ Pass (Exit Code 0\)  
              ▼  
\[ CONFIDENCE 4: Editorial Sign-Off \]    ──► Signed Showrunner Review via GitHub Review API & C2PA manifest

#### **The Pre-Flight Invariant Audit (Confidence 0\)**

Before launching Chromium, the conductor runs an automated pre-flight script:

> 1. **\!MissingAssets Sweep:** Parses Episode\_XXX.tsx to verify every staticFile(...) path exists in public/assets/.  
> 2. **Zero-Byte Poison Sentinel:** Computes the SHA-256 digest of every staged binary; if any file matches e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855, the build aborts immediately.  
> 3. **AST Traversals:** Verifies that no import paths escape the workspace via ../../ traversals.

#### **Invocation Command Pattern**

Once Confidence 0 passes, rendering is dispatched via the CLI:

\# Execute deterministic headless composition on Rig 1 CPU  
npx remotion render Episode\_040 out/master\_040.mp4 \\  
  \--config=remotion.config.ts \\  
  \--gl=swangle \\  
  \--concurrency=1 \\  
  \--offthreadvideo \\  
  \--pixel-format=yuv420p \\  
  \--codec=h264 \\  
  \--log=warn

#### **Double-Render Conformance Audit (Level 3 Decoded Equivalence)**

Master builds are validated through a double-render pass:

> * The composition is rendered twice consecutively to produce runA.mp4 and runB.mp4.  
> * Both streams are decoded into raw, uncompressed RGBA pixel buffers and 32-bit float audio matrices.  
> * The run is certified only when divergence metrics confirm zero variance:  
>   SSIM(runA,runB)=1.0,Δ*E*max​\=0.0  
>   Audio Drift=0 samples (Bit-Identical PCM)  
> * Once verified, render\_manifest.json logs double\_render\_status: "BIT\_IDENTICAL" and the episode is cleared for broadcast delivery.

---

*User prompt: {{FOCUS: 3\. Pipeline Invariants & Spatial/Temporal Math }} /extreme-details*

Response: The mathematical and physical invariants governing goblin-episodes (and its generalized pattern \[series-episodes\]) under Cluster 05.delivery/ define the boundaries within which abstract narrative intent is converted into broadcast-compliant media. In this pipeline, ontology strictly precedes presentation: narrative causality, physical motion, and temporal cadence are locked by deterministic mathematical contracts before video rasterization begins.

### **1\. The Master Physical Clock Axiom & Dual-Domain Clock Architecture**

In traditional computer animation, visual layouts establish the timeline: animators place keyframes on an exposure sheet, and sound engineers pad, time-stretch, or pitch-shift audio stems to fit visual cuts. In an automated generative pipeline, this dependency structure produces visual desynchronization, rubbery mouth movements, and unnatural speech pauses.

The governing law of the pipeline establishes that **audio is the architect of physical time; picture is an integer projection mapped to audio duration**.

AUDIO DOMAIN (Continuous Acoustic Clock: 48,000 samples/sec)  
  │  
  ├─ Sub-millisecond acoustic transients  
  ├─ Phoneme & viseme onset markers (e.g., S \= 26,742)  
  └─ Continuous programmatic ducking curves (-14 dB floor)  
  │  
  ▼ Exact Ratio: S \= F \* (48,000 / 24\) \= F \* 2,000 samples/frame  
VIDEO DOMAIN (Master Media Clock: 24 integer frames/sec)  
  │  
  ├─ Discrete Visual Cut Boundaries (Remotion \<Sequence\> timeline mounts)  
  ├─ Total Shot Frame Budgets (target\_frames \= ceil(D\_ms \* 24 / 1000))  
  └─ ComfyUI Latent Diffusion Allocations (4n \+ 1 lattice conformance)

#### **Domain Decoupling & The 2,000-Sample Constant**

To prevent sub-frame phase cancellation and cut jitter, temporal execution is split across two synchronized domains:

> * **Audio Precision Clock (Acoustic Truth):** Operates at an invariant sampling frequency of **48,000 Hz** (48,000 integer PCM samples per second). It governs sub-millisecond acoustic transients, phoneme boundaries, viseme swaps, and continuous ducking attenuation envelopes.  
> * **Master Media Clock (Visual Cut Authority):** Operates on discrete integer video frames locked to **24.0 fps**. At 24 fps, the duration of a single video frame is:  
>   Δ*t*frame​\=241​ s≈41.6667 ms  
> * **The Constant Projection Factor:** The ratio bridging the Audio Precision Clock to the Master Media Clock simplifies to an exact integer factor:  
>   24 frames/sec48,000 samples/sec​\=2,000 audio samples per video frame  
> * **Sample-to-Frame Mapping:** The absolute sample coordinate *S* corresponding to any video frame *F* is calculated as:  
>   *S*\=*F*×2,000  
>   Conversely, any acoustic event, phoneme marker, or Foley hit detected at sample index *S* maps to the nearest enclosing video frame via integer floor division:  
>   *F*\=⌊2,000*S*​⌋  
>   *Worked Example:* A transient plosive detected at sample offset *S*\=26,742 projects to video frame:  
>   *F*\=⌊2,00026,742​⌋=Frame 13  
>   While the visual cut or mouth viseme is assigned to Frame 13, the audio stem plays back with 48 kHz sample precision, eliminating perceived lip-sync lag or acoustic phasing artifacts.

### **2\. Discrete Frame Quantization & Cumulative-Millisecond Math**

Physical speech stems synthesized by the local TTS microservice serve as the empirical timebase. The duration of continuous audio measured in milliseconds (*D*ms​) via ffprobe is an empirical *observation*; the integer frame count represents the downstream *derivation*.

NAIVE PER-LINE CEILING QUANTIZATION (DRIFT EXPANDS MONOTONICALLY)  
Shot 1: ceil(D1) ──► Shot 2: ceil(D2) ──► Shot 3: ceil(D3) ──► Shot N: ceil(DN)  
Cumulative Error: E \= ∑ (ceil(Di) \- Di) ──► Drifts up to 40+ frames across an episode.

CUMULATIVE-MILLISECOND QUANTIZATION (ZERO-DRIFT TILING: ERROR BOUNDED \< 1 FRAME)  
Line 1 \[D1\] ────────► Line 2 \[D1 \+ D2\] ────────► Line 3 \[D1 \+ D2 \+ D3\]  
    │                        │                            │  
    ▼ Quantize Once          ▼ Quantize Once              ▼ Quantize Once  
Start\_1 / End\_1          Start\_2 / End\_2              Start\_3 / End\_3  
(End\_k \+ 1 ≡ Start\_{k+1}: Perfectly contiguous, bounded drift \< 41.7 ms across entire episode)

#### **The Naive Ceiling Flaw vs. Cumulative Tiling Proof**

Converting each shot's millisecond duration to an integer frame count using the ceiling formula ⌈(*D*ms​/1000)×24⌉ pads each shot with up to 41.67 ms (1 frame) of trailing silence. Across an 80-shot episode, naive summation accumulates over 3 to 4 seconds of drift against the musical score, Foley transients, and environmental audio beds.

To achieve zero drift, master timeline placement is derived from a running cumulative millisecond sum quantized once:

Start*k*​\=⌈1000∑*i*\<*k*​*Di*​​×24⌉  
End*k*​\=⌈1000∑*i*≤*k*​*Di*​​×24⌉−1

#### **Mathematical Proof of Contiguity**

Evaluating the boundary between Shot *k* and Shot *k*\+1:

End*k*​\+1=(⌈1000∑*i*≤*k*​*Di*​​×24⌉−1)+1=⌈1000∑*i*≤*k*​*Di*​​×24⌉=Start*k*\+1​

Because End*k*​\+1≡Start*k*\+1​, consecutive shots tile the Remotion timeline with zero gaps and zero overlaps. Total cumulative drift relative to continuous physical audio is mathematically bounded to less than one frame (\<41.67 ms) across the entire episode runtime.

| Sequence Length | Naive Summation Drift (Mean / Max) | Cumulative-MS Quantization (Max Drift) |
| :---- | :---- | :---- |
| **1 Shot** | 0.50 frames/1.00 frames | **\<1.00 frame (\<41.7 ms)** |
| **6 Shots** | 3.00 frames/5.38 frames | **\<1.00 frame (\<41.7 ms)** |
| **12 Shots** | 6.01 frames/10.09 frames | **\<1.00 frame (\<41.7 ms)** |
| **24 Shots** | 11.97 frames/17.06 frames | **\<1.00 frame (\<41.7 ms)** |
| **80 Shots** | ∼40.00 frames/∼70.00 frames | **\<1.00 frame (\<41.7 ms)** |

#### **Swain Motivation-Reaction Units (MRUs) & Pre-Roll Visual Mapping**

In prose, Dwight Swain's Motivation-Reaction Units (MRUs) describe internal cognition (Motivation → Visceral Reflex → Rational Response). In an automated video pipeline, internal thought cannot be represented through dialogue text alone.

The compiler maps MRU AST nodes directly into visual pre-roll padding:

> * **Visceral Reflex Pre-Roll:** When an AST turn specifies an initial emotional shock or reflex, the compiler allocates a **12-to-24 frame reaction window** (≈500 to 1000 ms) *before* the spoken dialogue audio stem begins mounting.  
> * **Reaction Cues:** During this pre-roll window, character sprites mount shock variants (dilated pupils, jaw drops) and camera wrappers execute subtle push-ins before dialogue begins.

### **3\. Model Adapter Conformance & The 4*n*\+1 Temporal Lattice**

Generative video diffusion backends (such as Wan 2.1 / Wan 2.2) utilize 3D spatio-temporal causal Variational Autoencoders (VAEs) that perform 4× temporal downsampling. Consequently, video diffusion models require frame budgets conforming to a 4*n*\+1 lattice (*n*∈N).

MASTER TIMELINE (Universal Time: 24 fps, Pure Millisecond Target)  
                          │  
                          ▼  
             \[ MODEL BACKEND ADAPTER \]  
(Encapsulates 4n \+ 1 Temporal Downsampling Lattice: Wan 2.2 / ComfyUI)  
                          │  
                          ├── 1\. Compute raw frames at native inference fps (e.g., 16 fps)  
                          ├── 2\. Round UP to nearest 4n \+ 1 lattice point  
                          └── 3\. Allocate exact latent tensor depth on Rig 2  
                          │  
                          ▼  
            \[ OPTICAL RETIMING / TRIMMING \]  
Remotion conforms excess tail slack back to 24 fps delivery timeline

#### **Frame Lattice Allocation Formula**

Generating off-lattice frame counts causes the VAE to truncate final frames, causing visual stutter and lip-sync drift. The adapter calculates diffusion allocations by rounding *up*:

*N*\=⌈(1000duration\_ms​)×native\_fps⌉  
diffusion\_frames=4×⌈4*N*−1​⌉+1

#### **Worked Example: Audio-to-Diffusion Allocation**

Consider a dialogue audio stem measuring *D*ms​\=3,120 ms dispatched to a native 16 fps diffusion engine:

> 1. **Raw Frame Calculation:**  
>    *N*\=⌈3.120×16⌉=⌈49.92⌉=50 frames  
> 2. **4*n*\+1 Conformance:**  
>    diffusion\_frames=4×⌈450−1​⌉+1=4×⌈12.25⌉+1=4×13+1=53 frames  
> 3. **Temporal Duration of Diffusion Output:**  
>    Generated Duration=16 fps53 frames​\=3.3125 seconds  
> 4. **Master Timeline Delivery Reconciliation (24 fps):** The delivery master requires:  
>    Master Frames=⌈10003,120​×24⌉=⌈74.88⌉=75 frames(3.125 s)  
>    The compositor trims the excess 0.1875 s of tail slack during optical assembly, ensuring lip-sync and audio ducking remain aligned to the master clock.

#### **Architectural Decoupling Law**

The 4*n*\+1 constraint is strictly an **adapter-specific implementation detail**, not an intrinsic property of narrative time. The universal compiler manages pure durations and integer frame targets; the diffusion adapter translates those targets into model-specific tensor allocations.

### **4\. Spatial Coordinate Normalization & Affine Stage Invariants**

To eliminate runtime layout calculations inside headless Chromium, the compiler pre-projects 2D character sprite cutouts (1024×1024) onto the master video canvas (1920×1080).

                         STAGE COORDINATE PROJECTION  
┌────────────────────────────────────────────────────────────────────────┐  
│ MASTER CANVAS: 1920 x 1080 (Origin \[0, 0\] at Top-Left)                 │  
│                                                                        │  
│                      X\_stage, Y\_stage                                  │  
│                            │                                           │  
│                            ▼                                           │  
│                 ┌────────────────────┐                                 │  
│                 │ Character Sprite   │                                 │  
│                 │ (1024 x 1024\)      │                                 │  
│                 │                    │                                 │  
│                 │     \[mouthBox\]     │ \<── visemeCentroid              │  
│                 │                    │                                 │  
│                 │     \[anchor\]       │ \<── Biological Ground Anchor    │  
│                 └────────────────────┘                                 │  
│ ───────────────────────────▲────────────────────────────────────────── │  
│                     Y\_ground Floor Plane                               │  
└────────────────────────────────────────────────────────────────────────┘

#### **1\. Affine Transform-Origin Projection**

The character's physical pivot (e.g., ground contact between the feet) is defined in manifest.json as anchorPoint: { x, y } within local 1024×1024 sprite space. The compiler translates this into normalized CSS percentage coordinates:

originX%​\=(1024anchor.x​)×100%,originY%​\=(1024anchor.y​)×100%

When scaling a character (*s*∈\[0.5,1.5\]) to simulate depth or camera push-ins, scaling occurs around the contact anchor rather than the image center, preventing characters from floating or clipping through the floor.

#### **2\. Canvas Positioning & Ground Plane Invariant**

To position the puppet at canvas stage coordinate (*X*stage​,*Y*stage​):

Toppixel​\=*Y*stage​−(anchor.y×*s*)  
Leftpixel​\=*X*stage​−(anchor.x×*s*)

> * **Stage Grounding Invariant:** For characters positioned on the same horizontal walking track, *Y*stage​ is bound to the location's floor plane *Y*ground​:  
>   *Y*stage​≡*Y*ground​  
>   This mathematical invariant prevents foot-sliding and grounding errors across cuts.

#### **3\. Viseme Centroid Alignment Invariant**

Preston Blair viseme textures (mouth\_closed.png through mouth\_wide.png) composite directly over the character's base sprite:

> * In manifest.json, the mouth is bounded by mouthBoundingBox: { x, y, width, height }.  
> * The optical compositor asserts that the center of the viseme texture aligns with the mouth center within a strict tolerance:  
>   ∣mouth\_center−viseme\_centroid∣\<4px  
>   A viseme drift ≥4px aborts the build during automated QA inspection.

### **5\. Upstream Spatial Invariants (goblin-spatial Grounding)**

Narrative causality is bound to physical space: characters cannot interact, exchange items, or speak unless spatial topology allows it. The spatial kernel operates as a pure, stateless mathematical library using integer arithmetic.

               THE CAUSAL SPATIAL PIPELINE  
Canonical Topology (000.goblin-lore: Static Hexes, Portals, Walls)  
                       │  
                       ▼  
Pure Geometric Math (goblin-spatial: Supercover, Line-of-Sight, BFS)  
                       │  
                       ▼  
Simulation Event Ledger (worker-sower-engine: Discrete Coordinates)  
                       │  
                       ▼  
Contact Opportunity Graph (Physical Co-presence / Perception)  
                       │  
                       ▼  
Epistemic Percepts (BeliefRecord: Observation Provenance)  
                       │  
                       ▼  
Screenplay AST & Remotion Episode Assembly

#### **1\. Tactical Scale: Doubled Integer Axial Hex Lattice**

To eliminate cross-platform floating-point drift and spherical distortion in crawlspaces and interior rooms, tactical space uses a doubled integer axial hex lattice (*q*,*r*,*s*\=−*q*−*r*):

> * **Centroid Transformation:** Pointy-top hexagons of circumradius *s*\=2 map to doubled Cartesian integers:  
>   Centroid(*q*,*r*)=(4*q*\+2*r*,6*r*)  
> * **Vertices:** (*cx*,*cy*±4),(*cx*±2,*cy*±2)  
> * **Edge Midpoints:** (*cx*±1,*cy*±3),(*cx*±2,*cy*)  
> * **Exact Integer Line-of-Sight Supercover:** Raycasting uses 2D integer cross-products with zero floating-point operations:  
>   crossProduct(*A*,*B*,*C*)=(*Bx*​−*Ax*​)(*Cy*​−*Ay*​)−(*By*​−*Ay*​)(*Cx*​−*Ax*​)  
> * **The EDGE\_PAIR Boundary Policy:** A ray running along the boundary between Hex *U* and Hex *V* is occluded if and only if an edge occluder exists on that shared boundary *or* both Hex *U* and Hex *V* are opaque cells.  
> * **The 8,190-Pair Oracle Verification:** In a canonical radius-5 hex disk (91 cells), every ordered pair (91×90=8,190 pairs) is tested to confirm optical reciprocity:  
>   LoS(*A*,*B*)≡LoS(*B*,*A*)

#### **2\. Regional Scale: Split-Invariant Rational Transit Progress**

When traveling across regional graphs, actors exist in an IN\_TRANSIT state where movement is an analytical function of time. When an environmental overlay changes an edge multiplier (*μ*bps​ in basis points, where 10,000=1.0×) at tick *T*change​, tracking remaining time directly causes scale distortion. Progress is accumulated as a rational fraction over denominator *D*\=109:

Δ*P*\=⌊*C*active​(*T*change​−*T*depart​)×109​⌋where *C*active​\=⌊10,000*C*base​×*μ*bps​\+5,000​⌋

> * **Impassable Sentinel:** If *μ*bps​\=0, the edge is blocked; the actor halts and emits ACTOR\_STRANDED.  
> * **Ceiling Remainder:** Remaining duration is derived via integer ceiling division:  
>   Δ*T*rem​\=⌈109(109−*P*accum​)×*C*new​​⌉,*T*arrival, new​\=*T*change​\+Δ*T*rem​  
>   This formulation guarantees **split-invariance**: splitting an edge segment into arbitrary sub-intervals yields the exact same arrival tick down to the centisecond.

#### **3\. BigInt Banker's Rounding for Mid-Edge Encounters**

When two actors traverse an edge in regional transit, encounters are solved algebraically without per-tick coordinate evaluation. Intermediate products run in BigInt to prevent 64-bit integer overflow (\>253−1). Round-Half-Even (Banker's Rounding) eliminates directional rounding bias:

divRoundHalfEven(*N*,*D*)=⎩⎨⎧​*q*,*q*\+1,*q* (if *q* is even) else *q*\+1,​2*r*\<*D*2*r*\>*D*2*r*\=*D*​where *q*\=⌊*N*/*D*⌋,*r*\=*N*mod*D*

> * **Head-On Convergence (*A*:0→1,*B*:1→0):**  
>   *t*meet​\=divRoundHalfEven((*DA*​*DB*​\+*TA*,enter​*DB*​\+*TB*,enter​*DA*​),(*DA*​\+*DB*​))

### **6\. Asset Envelope Harvesting & Cryptographic Sentinels (*T*0​\=\$0.00)**

The asset pipeline isolates downstream compositing nodes from the multi-gigabyte source art vault (\[series\]-assets-visual), failing early at zero compute cost (*T*0​\=\$0.00):

                  PRE-RENDER INTEGRITY GAUNTLET (Confidence 0\)  
                    
  Inspect Staged Assets (public/assets/)  
                  │  
                  ├── 1\. Zero-Byte Poison Trap  
                  │      SHA-256 \== e3b0c44298fc1c149afbf4c8996fb92427ae41... ?  
                  │      ├── YES ──► FATAL: ZERO\_BYTE\_POISON (Exit Code 1\)  
                  │      └── NO  ──► Continue  
                  │  
                  ├── 2\. Minimum Size & Header Audit  
                  │      File Size \< 1,024 bytes OR Starts with "version https://git-lfs"?  
                  │      ├── YES ──► FATAL: UNHYDRATED\_LFS\_POINTER (Exit Code 1\)  
                  │      └── NO  ──► Continue  
                  │  
                  ├── 3\. Disk Parity Sweep (\!MissingAssets)  
                  │      Does staticFile("...") in Episode\_XXX.tsx exist on disk?  
                  │      ├── NO  ──► FATAL: MISSING\_ASSET\_DEPENDENCY (Exit Code 1\)  
                  │      └── YES ──► Continue  
                  │  
                  └── 4\. Storage Budget Enforcement  
                         Total Footprint \> 150 MB?  
                         ├── YES ──► FATAL: STORAGE\_CEILING\_BREACH (Exit Code 1\)  
                         └── NO  ──► AUTHORIZE CHROMIUM LAUNCH

#### **1\. Storage Ceilings & Asset Pruning (collect-episode-assets.ts)**

> * **AST Harvesting:** The compiler reads dialogue\_ast.json and copies *only* referenced character emotion variants, background mattes, and phoneme visemes into public/assets/.  
> * **Footprint Envelope:** Reduces workspace size by \>90%, maintaining typical animatic envelopes between 18 MB and 42 MB.  
> * **Storage Gates:** A nominal budget ceiling is enforced at **\<100 MB**, with a hard compile-time failure at **150 MB**. Exceeding 150 MB aborts compilation at *T*0​ to prevent accidental inclusion of uncompressed PSDs or unpruned asset banks.

#### **2\. The Zero-Byte Poison Sentinel**

Truncated downloads or failed Git LFS pointer initializations can leave empty files on disk. To prevent headless Chromium from hanging or rendering blank frames, the compiler checks every asset against the SHA-256 empty-string constant:

SHA-256empty​\=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

If any file matches this hash—or is smaller than 1,024 bytes while starting with version https://git-lfs—the build terminates immediately with exit code 1 (ZERO\_BYTE\_ASSET\_POISON).

#### **3\. Disk Parity Sweep (\!MissingAssets)**

Before initializing Chromium, an automated AST parser scans Episode\_XXX.tsx and validates every staticFile(...) path against disk. Any unfulfilled asset halts the build before browser launch.

### **7\. Closed Status Taxonomy & The Explicit Null Protocol**

Dialogue writing and audio synthesis often proceed faster than 2D character illustration. To prevent missing visual variants from crashing the pipeline, asset states are governed by a closed taxonomy:

| Status Tag | Engine Interpretation & Execution Behavior |
| :---- | :---- |
| **VALID** | Asset exists on disk, matches its content hash, and decodes cleanly. |
| **INTENTIONALLY\_ABSENT** | Explicitly committed as null in manifest.json (variant un-drawn by design). |
| **WAIVED** | Registered in the release ledger under an authorized, signed showrunner waiver. |
| **BROKEN** | Declared in manifest but missing on disk, zero-byte truncated, or corrupt. |

#### **The Explicit Null Protocol**

> * **Prohibition of Missing Keys:** Un-illustrated character variants are never omitted from manifest.json; omitting JSON keys creates ambiguity with parser corruption. Missing states must be explicitly declared as null (e.g., "petrified": null).  
> * **Draft / Animatic Mode:** If an AST references an INTENTIONALLY\_ABSENT (null) variant, the compiler logs a non-blocking WARN, substitutes base\_states.idle.png, and inherits base coordinates, allowing rough-cut editorial review to proceed.  
> * **Broadcast Master Gate (Fail-Loud Law):** Final broadcast mastering builds enforce strict completeness:  
>   ∀shot∈Episode,referenced\_variant(shot)=null  
>   Any un-waived null reference in a mastering run triggers an immediate fatal compilation error, preventing incomplete artwork from reaching distribution.

### **Pipeline Invariants Matrix**

| Category | Invariant Rule | Mathematical Formulation / Target Boundary | Verification Stage & Failure Action |
| :---- | :---- | :---- | :---- |
| **Temporal** | Cumulative Tiling | Start*k*\+1​≡End*k*​\+1; cumulative drift \<41.67 ms | AST compilation (*T*0​); build aborts on overlap. |
| **Diffusion** | 4*n*\+1 VAE Lattice | diffusion\_frames=4×⌈(*N*−1)/4⌉+1 | Adapter generation; rounds up to prevent stutter. |
| **Compositing** | Viseme Centroid Drift | ∥mouth\_center−viseme\_centroid∥\<4px | Automated visual QA inspection; rejection if drift ≥4px. |
| **Tactical Space** | Doubled Lattice LoS | Exact integer cross-product; 8,190-pair optical reciprocity | Unit test suite; fails if LoS(*A*,*B*)=LoS(*B*,*A*). |
| **Regional Space** | Split-Invariance | *P*accum​ rational fraction over denominator *D*\=109 | Transit progress check; arrival tick invariant to sub-intervals. |
| **Integrity** | Zero-Byte Poison | SHA-256=e3b0c442...; File size ≥1,024 bytes | Pre-flight disk audit; exit code 1 before Chromium spawns. |
| **Footprint** | Storage Ceiling | Total staged assets \<100 MB nominal, hard fail at 150 MB | Ingestion audit; exit code 1 on ceiling breach. |

---

*User prompt: {{FOCUS: 4\. Lifecycle State Machine & Execution Profile }} /extreme-details*

Response: The lifecycle state machine and headless execution profile of goblin-episodes (and its generalized series pattern \[series-episodes\]) govern the deterministic transition of source-baked React compositions into broadcast-certified media deliverables. Operating within Cluster 05.delivery/ on Axis B (Artifact Hardening), this architecture enforces strict cryptographic boundaries between automated code generators, automated diagnostic repair agents, and human showrunners, while isolating physical compute workloads to prevent hardware contention and non-deterministic visual drift.

### **1\. The Sealed-File Lifecycle State Machine**

The sealed-file lifecycle eliminates the fragility of unversioned code generation. In conventional workflows, running a pipeline compiler either overwrites existing source files—wiping out manual directorial refinements—or treats manual intervention as an exceptional defect that breaks CI automation.

The sealed-file architecture treats human intervention and automated diagnostic patching as first-class, auditable state transitions governed by cryptographic headers burned directly into byte 0 of Episode\_XXX.tsx.

                     SEALED-FILE STATE MACHINE & MERGE ARBITRATION  
                       
                        \[ generator/generate-episode-repo.ts \]  
                                          │  
                                          ▼  
                              // @lifecycle: generated  
                              // @checksum: SHA-256(Body)  
                                          │  
                  ┌───────────────────────┴───────────────────────┐  
                  │                                               │  
                  ▼ (Automated QA Agent)                          ▼ (Human Director)  
        // @lifecycle: patched                          // @lifecycle: locked  
        • Target: ts-morph AST surgery                  • Target: The "Eject Button"  
        • Scope: Whitelisted JSX props                  • Scope: Unconstrained creative polish  
        • Audit: CI verifies AST diff                   • Event: Emits DIRECTOR\_OVERRIDE  
        • Gate: Automated merge if clean                • Guard: Hard block on regeneration

#### **The Header Contract & Cryptographic Exclusion Hashing**

Every generated Episode\_XXX.tsx begins with a machine-readable, strictly typed comment block:

// @lifecycle: generated  
// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f  
// @upstream\_ast: sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d  
// @build\_profile: 1080p\_24fps\_master  
// @patch\_history: \[\]

> * **Header Exclusion Hashing:** To avoid circular checksum calculation bugs (where altering the checksum inside the comment mutates the checksum of the file), the digest engine calculates the SHA-256 hash strictly over the component body starting immediately after the trailing newline of the header comment.  
> * **Canonical POSIX LF Normalization:** Checksums are computed strictly over LF line endings (\\n, 0x0A). Pre-commit hooks enforce .gitattributes (\* text=auto eol=lf), and external code formatters (Prettier, ESLint autofix) are disabled via .prettierignore to prevent automated white-space reformatting from altering byte digests.

#### **The Three Operational Lifecycle States**

┌────────────────────────────────────────────────────────────────────────────────────────┐  
│                          LIFECYCLE SPECIFICATION MATRIX                                │  
├──────────────────────┬────────────────────────┬───────────────────┬────────────────────┤  
│ Lifecycle State      │ Permitted Author       │ CI Merge Protocol │ Upstream Rerun     │  
├──────────────────────┼────────────────────────┼───────────────────┼────────────────────┤  
│ @lifecycle: generated│ generate-episode-repo  │ Fully automated   │ Clean in-place     │  
│                      │ (Compiler)             │ merge authority   │ overwrite          │  
├──────────────────────┼────────────────────────┼───────────────────┼────────────────────┤  
│ @lifecycle: patched  │ Jules / Diagnostic QA  │ Bounded AST diff  │ Block if unstaged; │  
│                      │ (ts-morph Agent)       │ verification gate │ alert & diff check │  
├──────────────────────┼────────────────────────┼───────────────────┼────────────────────┤  
│ @lifecycle: locked   │ Human Director         │ Manual signature  │ HARD HALT: Fork to │  
│                      │ ("The Eject Button")   │ & review gate     │ .candidate.tsx     │  
└──────────────────────┴────────────────────────┴───────────────────┴────────────────────┘

##### **1\. @lifecycle: generated**

> * **Trigger:** Stamped by generator/generate-episode-repo.ts upon initial code compilation from dialogue\_ast.json and exposure\_sheet.json.  
> * **Verification:** CI computes SHA-256(body) on Rig 1 and asserts bit-identity against the burned @checksum.  
> * **Authority:** Automated pipelines maintain full write authority. If an upstream dialogue line or sound effect is adjusted in worker-sower-engine, the compiler cleanly overwrites Episode\_XXX.tsx without human intervention.

##### **2\. @lifecycle: patched (Automated Diagnostic AST Surgery)**

> * **Trigger:** Triggered when closed-loop automated visual QA inspectors (such as computer-vision diagnostic agents) detect a physical layout or geometric violation—such as a character's mouth viseme bounding box drifting off the chin anchor by \+24px.  
> * **Mechanism:** Rather than regenerating the entire file or invoking non-deterministic LLM rewriting, the agent parses the source using the TypeScript Compiler API (ts-morph). It navigates the AST directly to the targeted JSX element:  
>   // Surgical AST mutation via ts-morph  
>   const puppetNode \= sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.JsxSelfClosingElement);  
>   const mouthBoxProp \= puppetNode.getAttributeOrThrow("mouthBoundingBox");  
>   mouthBoxProp.replaceWithText(\`mouthBoundingBox={{ x: 380, y: 264, width: 64, height: 32 }}\`);

> * **The Minimal Enclosing Unit (MEU) Boundary:** Modifications are restricted to whitelisted layout properties (anchorPoint, mouthBoundingBox, zoomTarget, talkBounceAmplitude). Any diff that attempts to inject new components, alter import statements, or manipulate sequence timing fails the CI boundary gate.  
> * **Resealing:** Once patched, the agent re-renders the affected shot on Rig 1, recomputes the SHA-256 digest of the updated component body, burns the new @checksum, and appends the diagnostic ticket ID to the header array:  
>   // @lifecycle: patched  
>   // @checksum: 3c1a8e9f2b74...  
>   // @patch\_history: \["QA-EP040-SH03-VISEME\_ALIGN"\]

##### **3\. @lifecycle: locked (The Showrunner Eject Button)**

> * **Trigger:** Applied when a human director opens Episode\_XXX.tsx to hand-tune an animation spring, tweak an SVG displacement filter, or alter character pacing.  
> * **Operational Sovereignty:** Changing the header to // @lifecycle: locked revokes automated write privileges across all agents and compilers. It asserts that the file is an authoritative human creative artifact that must never be clobbered.

#### **Collision Avoidance & The Candidate Forking Protocol**

When an upstream narrative change occurs (e.g., in 000.goblin-lore or worker-sower-engine) and generate-episode-repo.ts is re-triggered across the fleet, the generator checks the target workspace:

                   UPSTREAM REGENERATION TRIGGERED  
                                  │  
                                  ▼  
                    Read Episode\_XXX.tsx Header  
                                  │  
     ┌────────────────────────────┼────────────────────────────┐  
     ▼                            ▼                            ▼  
\[@lifecycle: generated\]   \[@lifecycle: patched\]        \[@lifecycle: locked\]  
     │                            │                            │  
Checksum Valid?           Unstaged Changes?            ABORT OVERWRITE  
├── YES: Safe Overwrite   ├── NO: Safe Overwrite       Emit Episode\_XXX.candidate.tsx  
└── NO:  Fork Candidate   └── YES: Fork Candidate      Emit DIRECTOR\_OVERRIDE Alert

> 1. **Hash Verification:** If marked @generated, the compiler hashes the local file body. If the hash matches @checksum, it overwrites the file cleanly. If the hash diverges, a human modified the file without updating the lifecycle tag to @locked.  
> 2. **Candidate Forking:** The compiler refuses to overwrite the uncommitted changes. Instead, it writes the new compile output to Episode\_XXX.candidate.tsx beside the existing file and exits with a non-zero diagnostic warning (METAPROGRAM\_COLLISION).  
> 3. **The DIRECTOR\_OVERRIDE Ledger Transaction:** Any manual edit committed under @lifecycle: locked automatically emits an immutable event record into the production ledger (render\_manifest.json and the Cloudflare D1 event log):  
>    {  
>      "event\_type": "DIRECTOR\_OVERRIDE",  
>      "episode\_id": "EP040",  
>      "target\_file": "Episode\_040.tsx",  
>      "target\_sequence": "shot\_040\_002",  
>      "author": "usr\_director\_candor",  
>      "timestamp": "2026-09-29T18:14:00Z",  
>      "property\_delta": {  
>        "component": "Shot02CameraWrapper",  
>        "property": "springConfig.damping",  
>        "from": 12,  
>        "to": 18  
>      },  
>      "dramatic\_rationale": "Dampen visual crash zoom to emphasize Spleen's suppressed panic."  
>    }

### **2\. The Formal FSM Task Transition Matrix**

Autonomous maintenance, asset promotion, and rendering workflows are governed by an edge-native 13-state Finite State Machine (FSM) implemented in src/fsm/transitions.ts and enforced by the ShotCoordinatorDO Durable Object:

                                \[ DISPATCH \]  
                                     │  
                                     ▼  
                                ┌─────────┐  
                      ┌────────►│ PENDING │◄────────┐  
                      │         └────┬────┘         │  
                      │              │ LEASE\_CLAIMED│  
                      │              ▼              │  
                      │         ┌─────────┐         │  
                      │         │ CLAIMED │         │  
                      │         └────┬────┘         │  
                      │              │ WORKER\_ACK   │  
                      │              ▼              │  
                      │         ┌─────────┐         │ OPERATOR\_RESUME  
                      │   ┌────►│ RUNNING │         │ (From Non-Destructive Halt)  
                      │   │     └────┬────┘         │  
       RETRY\_EXHAUSTED│   │          │ SUBMIT\_VERIFY│  
       (Attempts \< Max│   │          ▼              │  
       New Attempt)   │   │    ┌───────────┐        │  
                      │   │    │ VERIFYING │◄───────┤ (NEW\_HEAD\_PUSHED resets  
                      │   │    └─────┬─────┘        │  from SCOPE\_PASSED or  
                      │   │          │ SCOPE\_PASS   │  AWAITING\_APPROVAL)  
                      │   │          ▼              │  
                      │   │    ┌──────────────┐     │  
                      │   │    │ SCOPE\_PASSED │─────┘  
                      │   │    └─────┬────────┘  
                      │   │          │ QUALITY\_PASS  
                      │   │          ├────────────────────────┐  
                      │   │          ▼ \[Low-Risk\]             ▼ \[High-Risk\]  
                      │   │    ┌───────────┐        ┌──────────────────┐  
                      │   │    │  MERGING  │        │AWAITING\_APPROVAL │  
                      │   │    └─────┬─────┘        └─────────┬────────┘  
                      │   │          │                        │ HUMAN\_APPROVE  
                      │   │          │ MERGE\_SUCCEEDED        ▼  
                      │   │          │                  ┌───────────┐  
                      │   │          ▼                  │  MERGING  │  
                      │   │     ┌─────────┐             └─────┬─────┘  
                      │   │     │ MERGED  │                   │ MERGE\_SUCCEEDED  
                      │   │     └─────────┘                   ▼  
                      │   │                             ┌─────────┐  
                      │   │                             │ MERGED  │  
                      │   │ QUALITY\_FAIL\_RETRY          └─────────┘  
                      │   │ (Attempts \< Max)  
                      │   │  
                      │   └─────┌──────────┐  
                      └─────────┤ RETRYING │  
                                └──────────┘

#### **The 13 FSM Operational States**

> 1. **PENDING:** Task or episode build queued at edge; awaiting runner allocation.  
> 2. **CLAIMED:** Rig 1 or Rig 2 has reserved the lease epoch; hardware budget fenced.  
> 3. **RUNNING:** Active processing (metaprogram compilation or Remotion headless rendering).  
> 4. **VERIFYING:** Automated quality gauntlet execution (Level 0 through Level 2 gates).  
> 5. **SCOPE\_PASSED:** Static boundaries verified; cheap structural checks passed.  
> 6. **AWAITING\_APPROVAL:** High-risk modification path requiring showrunner cryptographic sign-off.  
> 7. **MERGING:** Intermediate confirmation state executing atomic Git merge and lockfile sealing.  
> 8. **MERGED:** Terminal success; confirmed strictly via MERGE\_SUCCEEDED.  
> 9. **RETRYING:** Bounded non-fatal failure; attempt counter incremented (*Attempts*\<3).  
> 10. **ROLLING\_BACK:** Destructive rollback active; ephemeral branches obliterated.  
> 11. **ROLLED\_BACK:** Stable baseline restored; resources drained.  
> 12. **DLQ (Dead-Letter Queue):** Terminal failure; maximum retries exhausted or divergent state hop detected.  
> 13. **HALTED:** Non-destructive pause via system kill-switch; preserves state for triage.

#### **Formal FSM Transition Rules**

export interface TransitionRule {  
  from: TaskState;  
  event: FSMEvent;  
  to: TaskState;  
  authorizedActor: 'SYSTEM' | 'WORKER' | 'AUDIT\_ENGINE' | 'LEAD\_ARCHITECT';  
}

export const LEGAL\_TRANSITIONS: TransitionRule\[\] \= \[  
  // Dispatch Phase  
  { from: 'PENDING', event: 'LEASE\_CLAIMED', to: 'CLAIMED', authorizedActor: 'SYSTEM' },  
  { from: 'PENDING', event: 'KILL\_SWITCH\_TRIP', to: 'HALTED', authorizedActor: 'SYSTEM' },  
  { from: 'HALTED', event: 'OPERATOR\_RESUME', to: 'PENDING', authorizedActor: 'SYSTEM' },

  // Execution Phase  
  { from: 'CLAIMED', event: 'WORKER\_ACK', to: 'RUNNING', authorizedActor: 'WORKER' },  
  { from: 'CLAIMED', event: 'WATCHDOG\_EXPIRE', to: 'ROLLING\_BACK', authorizedActor: 'SYSTEM' },  
  { from: 'RUNNING', event: 'SUBMIT\_VERIFICATION', to: 'VERIFYING', authorizedActor: 'WORKER' },  
  { from: 'RUNNING', event: 'WATCHDOG\_EXPIRE', to: 'ROLLING\_BACK', authorizedActor: 'SYSTEM' },  
  { from: 'RUNNING', event: 'KILL\_SWITCH\_TRIP', to: 'ROLLING\_BACK', authorizedActor: 'SYSTEM' },

  // Verification & Routing  
  { from: 'VERIFYING', event: 'SCOPE\_PASS\_HIGH\_RISK', to: 'AWAITING\_APPROVAL', authorizedActor: 'AUDIT\_ENGINE' },  
  { from: 'VERIFYING', event: 'SCOPE\_PASS\_LOW\_RISK', to: 'MERGED', authorizedActor: 'AUDIT\_ENGINE' },  
  { from: 'VERIFYING', event: 'QUALITY\_FAIL\_RETRY', to: 'RETRYING', authorizedActor: 'AUDIT\_ENGINE' },  
  { from: 'VERIFYING', event: 'SECURITY\_VIOLATION', to: 'ROLLING\_BACK', authorizedActor: 'AUDIT\_ENGINE' },  
  { from: 'VERIFYING', event: 'RETRY\_EXHAUSTED', to: 'ROLLING\_BACK', authorizedActor: 'AUDIT\_ENGINE' },

  // Human Gate  
  { from: 'AWAITING\_APPROVAL', event: 'HUMAN\_APPROVE', to: 'MERGED', authorizedActor: 'LEAD\_ARCHITECT' },  
  { from: 'AWAITING\_APPROVAL', event: 'HUMAN\_REJECT', to: 'ROLLING\_BACK', authorizedActor: 'LEAD\_ARCHITECT' },  
  { from: 'AWAITING\_APPROVAL', event: 'APPROVAL\_TIMEOUT', to: 'ROLLING\_BACK', authorizedActor: 'SYSTEM' },

  // Rollback & Replay  
  { from: 'RETRYING', event: 'LEASE\_CLAIMED', to: 'CLAIMED', authorizedActor: 'SYSTEM' },  
  { from: 'ROLLING\_BACK', event: 'ROLLBACK\_COMPLETE', to: 'ROLLED\_BACK', authorizedActor: 'SYSTEM' },  
  { from: 'ROLLED\_BACK', event: 'RETRY\_EXHAUSTED', to: 'DLQ', authorizedActor: 'SYSTEM' },  
  { from: 'ROLLED\_BACK', event: 'OPERATOR\_RESUME', to: 'PENDING', authorizedActor: 'SYSTEM' }  
\];

> * **Actor Authorization Invariant:** Transitions are gated on typed actor permissions (SYSTEM, WORKER, AUDIT\_ENGINE, LEAD\_ARCHITECT). A worker cannot approve its own verification submission, and the audit engine cannot bypass a human approval gate on high-risk paths.  
> * **Confirmation-Driven Merging:** The state MERGED is never set speculatively. It is transitioned into only upon receiving an affirmative MERGE\_SUCCEEDED event after the Git ref update and file lock have settled on disk.

### **3\. Execution Profile & Hardware Boundary (Rig 1 vs. Rig 2\)**

The execution architecture enforces a physical split across dedicated hardware profiles to prevent resource contention between multi-modal diffusion backends and Remotion headless browser rendering:

┌─────────────────────────────────────────────────┐   ┌─────────────────────────────────────────────────┐  
│        RIG 1: HOST ORCHESTRATOR & COMPOSITOR    │   │        RIG 2: DEDICATED GPU TENSOR FOUNDRY      │  
│        (64 GB System RAM / Pure Multi-Core CPU) │   │        (24 GB Dedicated VRAM Silicon)           │  
├─────────────────────────────────────────────────┤   ├─────────────────────────────────────────────────┤  
│ • worker-sower-conductor (Assembly Conductor)   │   │ • media-broker daemon (Port 3000\)               │  
│ • Local Audio Microservice (:8000)              │   │ • Headless ComfyUI instance (:8188)             │  
│ • Native POSIX Subprocesses:                    │   │ • Wan 2.2 / LoRA spatio-temporal video diffusion│  
│   \- child\_process.spawn('ffprobe')              │   │ • Hardware Mutex: flock(/var/lock/rig2\_gpu.lock)│  
│   \- child\_process.spawn('git')                  │   │ • Strict Hardware Quota:                        │  
│   \- npx remotion render                         │   │   \- 100% VRAM reserved for generative tensors   │  
│ • Optical Compositing:                          │   │   \- ZERO Chromium / Remotion execution         │  
│   \- Headless Chromium (--gl=swangle)            │   │   \- ZERO audio vocoders or SQLite drivers       │  
│ • Strict Hardware Profile: 0 MB GPU VRAM        │   │                                                 │  
└─────────────────────────────────────────────────┘   └─────────────────────────────────────────────────┘

#### **The Multi-Modal Contention Hazard**

Running diffusion inference and headless Chromium simultaneously on a single GPU workstation causes system-level failures:

> * **Driver Context Drops:** Launching @remotion/renderer against an NVIDIA driver actively executing CUDA matrix multiplications triggers OpenGL/EGL context losses and display server crashes.  
> * **CUDA Out-of-Memory (OOM) Aborts:** Wan 2.2 diffusion passes consume 16 GB to 22 GB of physical VRAM. When a Chromium browser instance allocates VRAM for hardware-accelerated canvas compositing, it triggers Linux kernel oom-killer terminations that crash both pipelines.

#### **Rig 1 POSIX Execution Authority**

Unlike upstream simulation engines running inside the restricted 128 MB V8 isolate sandboxes of Cloudflare Workers, the assembly conductor on Rig 1 operates in a standard POSIX Node.js runtime. This grants Rig 1 explicit authority to manage filesystem streams and spawn system child processes:

> * Spawns ffprobe to measure exact millisecond audio durations (*D*ms​) for temporal quantization.  
> * Spawns git to verify tree hashes, check working tree diffs, and inspect remote references.  
> * Spawns @remotion/renderer to composite, rasterize, and multiplex final broadcast containers.

### **4\. Headless Rasterization & Stability Engineering**

Compositing complex multi-layered scenes (background mattes, cutouts, visemes, and audio beds) inside headless Chromium requires strict runtime configuration to ensure stability:

               HEADLESS CHROMIUM STABILITY PROFILE  
                 
  npx remotion render Episode\_040 out/master\_040.mp4  
         │  
         ├── \--gl=swangle (Software SwiftShader via ANGLE)  
         │   └── Bypasses GPU drivers; prevents Linux OpenGL context loss  
         │  
         ├── \--concurrency=1 (Strict Single-Threaded Processing)  
         │   └── Bounds V8 isolate heap to \< 1.2 GB; stops RAM exhaustion  
         │  
         ├── \<OffthreadVideo/\> (External FFmpeg Subprocess Decoding)  
         │   └── Extracts frames outside Chromium DOM; stops memory leaks  
         │  
         └── \--disable-dev-shm-usage  
             └── Directs shared memory to /tmp; prevents container aborts

#### **Core Configuration Directives (remotion.config.ts)**

import { Config } from '@remotion/cli/config';

// 1\. Force CPU-Based Software OpenGL Rasterization  
Config.setChromiumOpenGlRenderer('swangle');

// 2\. Lock Concurrency to a Single Worker Thread  
Config.setConcurrency(1);

// 3\. Delegate Video Decoding to FFmpeg Subprocesses  
Config.setOffthreadVideo(true);

// 4\. Memory Headroom and Watchdog Timers  
Config.setTimeoutInMilliseconds(120000);  
Config.setPixelFormat('yuv420p');  
Config.setCodec('h264');

// 5\. Containerized Sandbox Chromium Flags  
Config.setChromiumFlags(\[  
  '--no-sandbox',  
  '--disable-setuid-sandbox',  
  '--disable-dev-shm-usage',  
  '--disable-accelerated-2d-canvas',  
  '--disable-gpu',  
  '--no-zygote',  
  '--single-process'  
\]);

> * **Software OpenGL (gl: 'swangle'):** Forces Chromium to rasterize through Google SwiftShader via ANGLE. Bypassing physical GPU hardware eliminates display driver memory leaks, prevents container segmentation faults, and ensures bit-identical pixel rendering across heterogeneous compute nodes.  
> * **Single-Worker Concurrency (concurrency: 1):** Spawning parallel rendering threads inside Chromium multiplies memory usage, causing V8 garbage collector stalls and dropped frames. Enforcing a concurrency of 1 keeps the memory footprint under 1.2 GB of system RAM, ensuring predictable execution.  
> * **Off-Thread Decoding (\<OffthreadVideo/\>):** Standard HTML5 \<video\> tags leak memory over prolonged rendering runs as decoded frames accumulate in the browser heap. Off-thread decoding delegates video unpacking to an external FFmpeg process that pipes raw frames directly into the Remotion compositing buffer, keeping browser memory flat.  
> * **Shared Memory Protection (--disable-dev-shm-usage):** Container environments typically restrict shared memory (/dev/shm) to 64 MB, causing crashes on multi-layered 1080p renders. This flag redirects memory allocation to system RAM (/tmp).

### **5\. Post-Render Finalization, Canonical Feedback, & The Sunset Seal**

Rendering completion does not mark the end of the pipeline lifecycle. A finished episode must reconcile with upstream narrative state before release packaging is finalized.

               RELEASE SETTLEMENT & CANONICAL CLOSURE  
                 
  1\. Headless Render Completes (Bit-Identical MP4/MOV Master)  
               │  
               ▼  
  2\. Emit state\_delta.json  
     • Somatic Injuries: bog\_broken\_rib \= true  
     • Logistical Inventory: fuel\_spent \= 14, valve\_broken \= true  
     • Epistemic Status: mystery\_the\_famine \= EXPOSED\_TO\_SPLEEN  
               │  
               ▼  
  3\. Upstream Relational Reconciliation (D1 / SQLite CANON\_DB)  
     • Atomic transaction writes state\_delta to authoritative ledger  
     • Evaluates Transitive Dependency Hash (H\_dep)  
               │  
               ▼  
  4\. Blast-Radius Propagation  
     • Cascades dirty flags down the DAG: is\_dirty \= 1  
     • Flags downstream scenes/episodes requiring re-render  
               │  
               ▼  
  5\. The "Sunset Seal" / "Long Rest"  
     • Terminal hash burn: reseals bible-state.json  
     • Transitions daily labor from mutable compute to immutable history

#### **1\. The state\_delta.json Emission**

Upon render verification, the workspace compiler generates a structured state\_delta.json capturing the narrative, physical, and somatic costs incurred during the episode:

> * **Somatic Injuries:** Traumas sustained in combat or physical actions (e.g., limb fractures, burns).  
> * **Logistical Consumption:** Depleted ammunition, spent fuel units, or destroyed gear slots.  
> * **Epistemic Disclosures:** Secrets revealed to specific characters, expanding their knowledge horizons.

#### **2\. Upstream Reconciliation & Blast-Radius Propagation**

The emitted state\_delta.json is submitted through an authorized ledger transaction to Cloudflare D1 (CANON\_DB).

> * **Transitive Dependency Invalidation:** The engine walks the scene Directed Acyclic Graph (DAG) and computes transitive dependency hashes (*H*dep​).  
> * **Dirty Marking:** Any future scene or draft assuming an outdated character state (e.g., assuming Bog has two functional arms after an injury) is automatically flagged as dirty (is\_dirty \= 1), preventing corrupted state from entering downstream rendering queues.

#### **3\. The "Sunset Seal" (The Long Rest Protocol)**

Borrowed from tabletop mechanics, the Sunset Seal marks the formal boundary between mutable daily iteration and the immutable historical record:

> * **Halting Entropy:** Feature churn and code mutation are halted at the end of the production shift.  
> * **Merkle Resealing:** Volatile staging accumulators are wiped, and updated narrative state is compiled, alpha-sorted, and sealed into compiled/\<series\>/bible-state.json under an updated cryptographic Merkle root (*H*root​).  
> * **Preservation Law:** Drafts may tolerate fallbacks, but final deliverables may not. Once the Sunset Seal executes, the episode workspace and master media deliverables calcify into read-only archival storage, establishing a permanent historical record across the production fleet.

---

*User prompt: {{FOCUS: The Sealed-File Lifecycle }} /extreme-details*

Response: The Sealed-File Lifecycle governs the boundary between automated metaprogram compilation, automated diagnostic repair, and authoritative human artistic direction within episodic media rendering pipelines. Built around the showrunner’s "Eject Button," this subsystem ensures that automated upstream pipeline runs never clobber hand-tuned presentation code, while guaranteeing that manual creative adjustments remain forensically auditable within an immutable narrative ledger.

## **Architectural Mandate & The "Eject Button"**

In programmatic animation architectures such as goblin-viewport-template, treating human artistic refinement as an exceptional defect causes severe pipeline brittleness. Creative deliverables require aesthetic adjustments—such as retiming camera spring curves, applying custom SVG filters, or tuning sub-frame visual composition—directly inside the generated React component tree (Episode\_XXX.tsx). If an upstream narrative bugfix or script patch in worker-sower-engine triggers a pipeline re-run, naive code generation would wipe out these director adjustments.

The sealed-file lifecycle operates on a foundational operational rule: *automation may create, automation may diagnose, but automation must never silently destroy human decisions*. The protocol enforces a strict Cartesian demarcation between Meaning (Axis A) and Representation (Axis B):

> * **Meaning-Altering Modifications (Axis A):** Any human edit altering narrative meaning (such as character injury states, dialogue wording, or logistical facts) cannot remain local to the viewport. It must route back upstream to the simulation engine and relational world ledger to be re-derived down the Directed Acyclic Graph (DAG).  
> * **Representation-Altering Modifications (Axis B):** Presentation-only polishes (such as framing coordinates, camera easing parameters, viseme offsets, and audio gain) stay localized inside Episode\_XXX.tsx without invalidating canonical world truth.

               SEALED-FILE STATE MACHINE & MERGE ARBITRATION

                    \[ generator/generate-episode-repo.ts \]  
                                      │  
                                      ▼  
                          // @lifecycle: generated  
                          // @checksum: SHA-256(Body)  
                                      │  
              ┌───────────────────────┴───────────────────────┐  
              │                                               │  
              ▼ (Automated QA Agent)                          ▼ (Human Director)  
    // @lifecycle: patched                          // @lifecycle: locked  
    • Target: ts-morph AST patch                    • Target: "Eject Button"  
    • Scope: Whitelisted JSX props                  • Scope: Permanent human override  
    • Audit: CI verifies AST diff scope             • Event: Emits DIRECTOR\_OVERRIDE  
    • Gate: Auto-merge if clean                     • Guard: Generator refuses overwrite  
                                                            (Emits .candidate.tsx)

## **Header Topology, Syntax, & Byte Normalization**

Every generated presentation file embeds a structured, machine-readable cryptographic lifecycle header starting strictly at Byte 0:

// @lifecycle: generated | patched | locked  
// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f  
// @patch\_history: \["QA-EP040-SH03-VISEME\_ALIGN"\]  
// @upstream\_ast: sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d  
// @style\_rules: v1.4.0

To eliminate non-deterministic checksum divergence across operating systems, developer workstations, and continuous integration runners, the lifecycle engine enforces rigorous byte normalization:

> * **Text Normalization:** Checksums are computed strictly over NFC-normalized text using line-feed (\\n, LF) line endings.  
> * **Filesystem Attributes:** Episode workspaces mandate \* text=auto eol=lf in .gitattributes to prevent Windows/POSIX newline translation mismatches during checkout and commit operations.  
> * **Linter Isolation:** Formatting tools such as Prettier and ESLint are explicitly disabled over generated composition directories, preventing automated code beautifiers from mutating byte bodies and breaking checksum validity.

## **State Machine Taxonomy & Merge Arbitration Matrix**

The lifecycle moves across three discrete, mutually exclusive states, each mapped to specific authoring authorities, validation rules, and merge policies.

| Lifecycle State | Target Author | Verification Rule | CI Merge Policy | Upstream Regeneration Behavior |
| :---- | :---- | :---- | :---- | :---- |
| **@lifecycle: generated** | Metaprogram Compiler (generate-episode-repo.ts) | Header checksum matches SHA-256(body). | Automated merge pass when lint/type checks clear. | Clean in-place overwrite permitted. |
| **@lifecycle: patched** | Diagnostic Repair Agent (e.g., Jules CV Agent) | AST diff touches only whitelisted JSX properties (e.g., bounding boxes). | Gated merge (requires automated AST check). | Alerts agent; requires diff review before write. |
| **@lifecycle: locked** | Human Director (The "Showrunner Eject Button") | Signature authorized by showrunner key. | Manual approval gate (requires human review). | **Hard Stop:** Refuses overwrite; emits .candidate.tsx. |

### **1\. @lifecycle: generated**

Applied by generate-episode-repo.ts upon initial code synthesis. The compiler computes the SHA-256 digest over the raw TSX body and burns it into the header. When upstream narrative code changes, CI engines have full automated merge authority and may re-stamp or cleanly overwrite the file in place, provided the current body hash still matches the header checksum. If the checksum mismatches while still marked @lifecycle: generated, the compiler detects an untracked external manual modification, halts, and flags a build violation.

### **2\. @lifecycle: patched**

Encountered when autonomous computer-vision repair agents (such as Jules) perform remediation on detected visual defects. Jules uses the TypeScript Compiler API (ts-morph) to execute surgical Abstract Syntax Tree (AST) surgery on specific JSX properties—such as shifting viseme bounding boxes by \+24px to correct lip-sync clipping:

> * Jules re-renders an isolated 36-frame window on CPU to visually confirm that the patch resolved the defect.  
> * It recomputes the SHA-256 body checksum and appends the tracking defect ticket into the @patch\_history array.  
> * The continuous integration pipeline validates that the AST diff touches *only* whitelisted sequence properties before granting automated merge approval.

### **3\. @lifecycle: locked**

The full manifestation of the showrunner's "Eject Button". Once an artist manually opens Episode\_XXX.tsx to alter presentation timing, easing curves, or layer structures, the file transitions to @lifecycle: locked. Marking the file locked permanently revokes write privileges from all automated compilers, agents, and upstream generators, establishing the component tree as an authoritative human artifact.

## **Collision Arbitration, Candidate Forking, & Ledger Provenance**

When upstream narrative events change or a remaster is triggered across the multi-repository fleet, generate-episode-repo.ts initiates a three-step pre-flight check on destination files to prevent clobbering:

                     UPSTREAM REGENERATION ATTEMPT  
                                   │  
                                   ▼  
                    Inspect Episode\_XXX.tsx Header  
                                   │  
         ┌─────────────────────────┼─────────────────────────┐  
         ▼                         ▼                         ▼  
\[@lifecycle: generated\]   \[@lifecycle: patched\]     \[@lifecycle: locked\]  
Checksum matches body?    Targeted ts-morph diff?   MANUAL HUMAN OVERRIDE  
         │                         │                         │  
   ┌─────┴─────┐                   │                         │  
   ▼           ▼                   ▼                         ▼  
\[Match\]     \[Mismatch\]    \[Apply Verified Patch\]      \[HARD STOP\]  
Safe        Treat as      Re-compute checksum         Refuse overwrite.  
Overwrite   LOCKED                                    Emit .candidate.tsx  
                                                      Log DIRECTOR\_OVERRIDE

> 1. **Header Inspection:** The compiler reads the Byte-0 comment block of Episode\_XXX.tsx.  
> 2. **State & Checksum Verification:**  
   * If @lifecycle: locked is present, the compiler aborts generation against the target file immediately.  
   * If @lifecycle: generated is present, but SHA-256(current\_body)=header\_checksum, the engine infers an uncommitted human intervention and treats the file as locked.  
> 3. **The Candidate Forking Protocol:** Rather than overwriting the director's adjustments, the generator forks its output, emitting a sibling file named Episode\_XXX.candidate.tsx (or .candidate.ts) and exiting with an operational alert. The human supervisor can then run a visual diff between their locked file and the candidate file to cherry-pick upstream script improvements without losing manual tweaks.

### **Ledger Traceability & DIRECTOR\_OVERRIDE Events**

To prevent human interventions from becoming invisible code mutations that break upstream causal auditability, every manual edit applied to a locked file must emit an append-only DIRECTOR\_OVERRIDE event into the historical ledger:

{  
  "event\_type": "DIRECTOR\_OVERRIDE",  
  "episode\_id": "EP040",  
  "target\_file": "Episode\_040.tsx",  
  "author": "director\_alpha",  
  "timestamp": "2026-09-28T16:12:00Z",  
  "property\_delta": {  
    "target\_component": "Shot01CameraWrapper",  
    "property": "zoomLevel",  
    "previous\_value": 1.05,  
    "override\_value": 1.12  
  },  
  "narrative\_justification": "Tighten framing on Bog's facial centroid to emphasize visceral reaction sting",  
  "prior\_checksum": "7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",  
  "new\_checksum": "9f8a3c2e1b4d5a6e7f80123456789abcdef0123456789abcdef0123456789abc"  
}

This event record permanently binds into render\_manifest.json—the episode's terminal provenance lockfile. By binding the DIRECTOR\_OVERRIDE metadata to upstream Git commit hashes, visual sprite digests, synthesized acoustic stem hashes, and headless Chromium/FFmpeg container digests, the pipeline anchors human artistic direction into the mathematical Directed Acyclic Graph, ensuring long-term bit-identical reproducibility without sacrificing human agency.

---

*User prompt: {{FOCUS: 1\. Architectural Role: Meta-Ontology vs. Story Instance }} /extreme-details*

Response: The architectural demarcation between the **Meta-Ontology** and the **Story Instance** resolves a foundational failure mode in generative production: the **Category Error of Conflating the Universal Grammar with a Single Diegetic World**.

When a video generation pipeline hardcodes genre-specific assumptions—such as naming core primitives after goblin characters, crawlspace locations, or domestic farce mechanics—the software calcifies. The codebase becomes incapable of hosting second-generation storyworlds without extensive refactoring, while simultaneously leaking presentation-tier assumptions into canonical world logic.

The distinction between **series-episodes** (the universal delivery tier and scaffolding contract) and **goblin-episodes** (the flagship story instance) operationalizes this boundary across Cluster 05.delivery/.

                  THE ONTOLOGICAL SEPARATION OF PRODUCTION  
                    
┌────────────────────────────────────────────────────────────────────────┐  
│                   META-ONTOLOGY (Universal Framework)                  │  
│                                                                        │  
│ • Universal Narrative Tuple: ⟨S, A, I, R\_m⟩                            │  
│ • Schema Primitives: Agent, Debt, Location, Possession, Axiom, Event   │  
│ • Sealed-File Lifecycle: @lifecycle: generated | patched | locked      │  
│ • Architectural Tier: series-episodes / series-viewport-template       │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │ Parameterized by series.config.json  
                                    │ & Ingestion Compilers (--series)  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│                   STORY INSTANCE (Diegetic Concrete World)             │  
│                                                                        │  
│ • World: Under the Floorboards (Bog, Spleen, Wart, Mum Grissel)        │  
│ • Diegetic Domain: Crawlspace farce, hoarded brass, bean tallies       │  
│ • Rigs & Assets: GoblinPuppet.tsx, Preston Blair goblin visemes        │  
│ • Production Deployment: goblin-episodes/ (ep001/, ep040/)             │  
└────────────────────────────────────────────────────────────────────────┘

### **1\. The Core Architectural Dichotomy: Meta-Ontology vs. Story Instance**

The studio partitions its software systems into two non-interchangeable conceptual layers:

#### **A. The Meta-Ontology (The Universal Reusable Grammar)**

The meta-ontology is the format-agnostic, genre-blind engine that governs the physics of narrative state transitions. It knows nothing of goblins, spaceships, detectives, or magic spells. Instead, it defines abstract, domain-neutral computational primitives:

> * **Agent:** An embodied entity defined by physiological limits, logistical equipment slots, and an epistemic horizon (what the entity knows, suspects, or is blind to).  
> * **Debt / Tension Node:** A directional, quantifiable social or psychological friction vector between two agents or factions (e.g., grievances, leverage, blackmail).  
> * **Location / Spatial Node:** A bounded topological coordinate within a discrete spatial graph, governing co-presence, line-of-sight, and acoustic propagation.  
> * **Possession / Item:** A material asset governed by strict physical placement, hand capacity equations, and equip-slot limits rather than abstract video-game inventories.  
> * **World Axiom / Modality:** A formal macro-constraint governing what is physically, socially, or epistemically possible within an execution shard (Lubomír Doležel’s alethic, deontic, axiological, and epistemic modal constraints).  
> * **Event:** An immutable, ordered, and typed state transition receipt explaining *why* reality mutated.  
> * **Projection:** A unidirectional, read-only translation of verified state into a sensory medium.

#### **B. The Story Instance (The Diegetic Concrete Manifestation)**

A story instance is a specific narrative world populated with authored lore, distinct character biographies, genre-specific locomotion styles, bespoke visual assets, and acoustic palettes. Story instances reside within isolated directories or dedicated repositories (the *Library of Genesis* pattern):

> * **under-the-floorboards (The Goblin Instance):** A claustrophobic domestic farce centered on a goblin family holed up in a pipe crawlspace (Bog, Spleen, Wart, Mum Grissel), fighting over food rations, hoarded brass valves, and petty household indignities.  
> * **wiregrass-basin (The Industrial Noir Instance):** A biopunk Southern Gothic setting defined by chemical solvent runoff, blackwater fogs, neuropathy shuffles, heavy industrial machinery, and union tension.  
> * **deep-space-salvage (The Hard Sci-Fi Instance):** A high-friction vacuum survival thriller governed by orbital mechanics, oxygen depletion rates, radiation exposure vectors, and unyielding salvage contracts.

#### **The Risk of Conflation**

If goblin-lore or goblin-viewport-template acts as both the engine and the story bible, developers inevitably introduce hardcoded assumptions into core compilers: checking for character.is\_goblin, asserting that all entities possess two hands, or assuming speech is always performed via 2D cutout mouth overlays.

By decoupling the meta-ontology into universal schemas and isolating story instances into parameterized payloads, the identical compiler harness can process a 4-actor goblin chamber piece or a 10,000-actor galactic fleet drama without modifying a single line of compiler logic.

### **2\. The Formal Mathematical Foundation: The Universal Narrative Tuple ⟨S,A,I,R*m*​⟩**

The meta-ontology models fictional reality as a mathematical state transition engine formalized by the universal narrative tuple:

StoryWorld=⟨S,A,I,R*m*​⟩  
                           THE UNIVERSAL NARRATIVE TUPLE  
┌────────────────────────────────────────────────────────────────────────┐  
│ S  : Universal State Space (Somatic, Logistical, Epistemic, Spatial)   │  
├────────────────────────────────────────────────────────────────────────┤  
│ A  : Action Vocabulary (Domain-specific verbs parameterizing changes)   │  
├────────────────────────────────────────────────────────────────────────┤  
│ I  : Invariant Engine (Two-pass deterministic compile-time gate: T\_0)  │  
├────────────────────────────────────────────────────────────────────────┤  
│ R\_m: Medium Projection Function (State \-\> Time, Space, or Attention)   │  
└────────────────────────────────────────────────────────────────────────┘

#### **1\. S — The Universal State Space**

S represents the strongly typed, model-independent record of reality at any discrete chronological tick *T*. It is completely blind to pixels, framerates, fonts, and audio sample rates:

S=⟨Vsomatic​,Vlogistical​,Vepistemic​,Vspatial​,Vpressure​⟩

> * **Vsomatic​:** Biological and physical integrity vectors (bone fractures, limb amputations, nerve damage, fatigue baselines).  
> * **Vlogistical​:** Discrete item placement mapped to anatomical equipment slots (HELD\_PRIMARY, HELD\_SECONDARY, WORN\_TORSO, CACHED).  
> * **Vepistemic​:** The multi-valued knowledge boundary separating objective truth from character belief:  
>   WorldTruth=InternalBelief=ExternalUtterance  
>   Governed by EpistemicHorizonEnum (TOTAL\_IGNORANCE, RUMOR\_ONLY, FALSE\_BELIEF, PARTIAL\_FACT, WITHHELD).  
> * **Vspatial​:** Exact physical placement within discrete coordinate meshes (doubled integer axial hexes (*q*,*r*) for tactical rooms, rational transit progress *P*accum​/109 for regional graphs).  
> * **Vpressure​:** Integer stress meters tracked in basis points (0 to 10,000 bps).

#### **2\. A — The Action Vocabulary**

A is the bounded catalog of legal verbs entities can execute to propose transitions from S*n*​→S*n*\+1​. While the meta-ontology defines the *shape* of an action, the story instance provides the concrete enum vocabulary via series.config.json:

> * In under-the-floorboards: A={HOARD\_SCRAP,CONCEAL\_VALVE,GLOWER,SQUEAL,DUEL\_2D6}.  
> * In wiregrass-basin: A={LIMP,EXPEND\_LEVERAGE,SIPHON\_SOLVENT,BRANDISH\_CANE}.

#### **3\. I — The Invariant Engine**

I is the collection of deterministic compile-time solvers and Zod validation rules that verify proposed actions against canonical law before execution occurs.

> * **Fail-Fast Economics (*T*0​\=\$0.00):** If an agent attempts an action that violates physical law—such as attempting to draw a two-handed weapon while holding a valve with a severed arm—I halts compilation at *T*0​, costing \$0.00 before any LLM inference or GPU rendering occurs.  
> * **Two-Pass Compilation:** Pass 1 validates isolated scalar bounds and enum matching; Pass 2 audits the relational Directed Acyclic Graph (DAG) across the active instance directory, verifying foreign-key integrity with zero orphaned pointers.

#### **4\. R*m*​ — The Medium Projection Function**

R*m*​ is the specialized adapter that projects verified, format-agnostic state transitions into the native dimensional coordinates of a specific physical medium:

R*m*​:S⟶O*m*​  
               THE MEDIUM PROJECTION DISPATCH (R\_m)  
                 
                             \[ S\_n \]  
                                │  
        ┌───────────────────────┼───────────────────────┐  
        ▼ (R\_video)             ▼ (R\_comics)            ▼ (R\_prose)  
   COORDINATE:             COORDINATE:             COORDINATE:  
   Physical Time           Visual Space            Audience Attention  
   • Integer frames @ 24fps• Panel geometry        • Swain MRU units  
   • Audio master clock    • Gutter bleed          • Visceral reflex  
   • Viseme phoneme swaps  • Lettering bubbles     • Subtext evasion

> * **Video (Rvideo​):** Projects state into the dimension of **Physical Time**—quantizing continuous speech stems (48 kHz) into discrete 24 fps Remotion video frames, affine camera interpolations, and Preston Blair viseme textures.  
> * **Graphic Novels (Rcomics​):** Projects state into the dimension of **Two-Dimensional Space**—mapping narrative beats into panel bounding boxes, page layouts, gutter widths, and dialogue balloons.  
> * **Screenplays & Prose (Rprose​):** Projects state into the dimension of **Audience Attention & Reading Rhythm**—structuring sentences into Dwight Swain Motivation-Reaction Units (MRUs: Stimulus → Visceral Reflex → Rational Action), subtextual dialogue deflections, and dramatic irony horizons.

### **3\. The Four Ontological Tiers & The Cartesian Demarcation**

The meta-ontology organizes all data into four hierarchical tiers, governed by the strict separation of **Meaning (Axis A)** from **Representation (Axis B)**:

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

#### **The Four Ontological Tiers**

| Tier | Ontological Question | Mutability Lifecycle | Operational Definition | Engine Owner |
| :---- | :---- | :---- | :---- | :---- |
| **1\. Canon** | *What is allowed to be true?* | Human Git commits only | Version-pinned physical laws, anatomical constraints, geographic layouts, and baseline axioms. | 001.lore / \[series\]-lore |
| **2\. Events** | *What happened, and why?* | Append-only transactional log | Immutable chronological record of causes: injuries inflicted, secrets revealed, duels resolved. | worker-sower-engine (WAL) |
| **3\. State** | *What is true right now?* | Disposable snapshot cache | Rebuildable working view folded over history: *Sn*​\=fold(apply,*S*0​,\[*E*1​…*En*​\]). | Relational Ledger (D1/SQLite) |
| **4\. Media** | *What did we actually produce?* | Unidirectional projections | Screenplays, 48 kHz WAV stems, Remotion TSX source, and rendered broadcast MP4s. | series-episodes (Remotion) |

#### **The Foundational Rule: Media Is Not State**

Media representations possess **zero semantic authority**. An optical compositor, video diffusion backend, or speech synthesizer cannot modify world truth.

If an animator hand-tunes a camera zoom in Episode\_040.tsx or re-records an audio stem with a different inflection, they have altered a *projection* (Tier 4). The world state (Tier 3), historical event log (Tier 2), and canonical laws (Tier 1) remain completely untouched.

Conversely, narrative truth remains valid even if all media files, video diffusion models, and GPU servers are completely destroyed (The Deletion Principle Boundary).

### **4\. Concrete Structural Contrast: series-episodes vs. goblin-episodes**

The relationship between series-episodes and goblin-episodes mirrors the relationship between an abstract interface and its concrete implementation:

┌────────────────────────────────────────────────────────────────────────┐  
│ series-episodes (The Architectural Pattern / Meta-Contract)            │  
│ • Directory Standard: Stamped, isolated workspace per episode cut     │  
│ • Resource Boundary: Strictly \< 100MB asset envelopes (\< 150MB fail)   │  
│ • Execution Profile: Software OpenGL (--gl=swangle, concurrency=1)     │  
│ • Hardware Boundary: Quarantined to Rig 1 CPU (0 MB GPU VRAM)          │  
│ • Lifecycle FSM: @lifecycle: generated | patched | locked              │  
│ • Provenance Root: Cryptographic render\_manifest.json lockfile         │  
├────────────────────────────────────────────────────────────────────────┤  
│ goblin-episodes (The Concrete Production Flagship Instance)            │  
│ • Active Storyworld: under-the-floorboards                             │  
│ • Cast Rigs: GoblinPuppet.tsx (Bog, Spleen, Wart, Mum Grissel)         │  
│ • Audio Profile: Squeaky, low-frequency guttural DSP vocal stems       │  
│ • Spatial Mattes: swamp\_relay\_matte.png, warm\_pipe\_bg.png              │  
│ • Storage Target: Local studio archive & GitHub repository             │  
└────────────────────────────────────────────────────────────────────────┘

#### **Granular Specification Comparison**

| Architectural Dimension | series-episodes (The Meta-Ontology Tier) | goblin-episodes (The Concrete Story Instance) |
| :---- | :---- | :---- |
| **Ontological Role** | Abstract Cluster 05.delivery delivery contract. | Concrete flagship implementation for Season 1\. |
| **Namespace Scope** | Multi-series root (series-episodes/\<series\>/epXXX/). | Dedicated series root (goblin-episodes/epXXX/). |
| **Component Rigs** | Abstract rigging contracts: anchor bindings, viseme matrices. | Concrete GoblinPuppet.tsx with specific goblin anchor baselines. |
| **Asset Envelope** | Universal rules: \<100MB budget, zero-byte sentinel checks. | Staged binary files (bog\_humiliated.png, valve\_drop.wav). |
| **Acoustic Clock** | Cumulative millisecond quantization formula at 24 fps. | Specific synthesized dialogue stems (ep040\_sh01.wav at −16.2 LUFS). |
| **Hardware Boundary** | Pinned \--gl=swangle \--concurrency=1 on Rig 1 CPU. | Executed on workstation Rig 1 with local filesystem cache. |
| **Sealed Lifecycle** | @generated \\to @patched \\to @locked state machine. | Burned headers inside Episode\_040.tsx with active director tags. |

### **5\. Decoupling and Parameterization in Production Tooling**

To ensure the delivery tier remains decoupled from story content, the tooling isolates instance configurations into declarative metadata files and parameterized CLI commands.

#### **A. Decoupling Story Axioms via series.config.json**

Every storyworld checked into the system defines its physical parameters, genre logic, and custom enums inside a schema-locked series.config.json:

{  
  "\$schema": "../../packages/001.lore/schemas/series.config.schema.json",  
  "series\_slug": "under-the-floorboards",  
  "display\_name": "Under the Floorboards",  
  "genre\_classification": "DOMESTIC\_FARCE\_MELODRAMA",  
  "pacing\_parameters": {  
    "target\_season\_episodes": 20,  
    "max\_grievance\_intensity": 10,  
    "default\_dialogue\_ducking\_db": \-14.0,  
    "reaction\_preroll\_frames\_min": 12,  
    "reaction\_preroll\_frames\_max": 24  
  },  
  "custom\_enums": {  
    "locomotion\_baselines": \[  
      "quadruped\_crawl",  
      "bipedal\_scuttle",  
      "pipe\_shimmy"  
    \],  
    "weight\_classes": \[  
      "scrap\_featherweight",  
      "brass\_pocket",  
      "tool\_heavy"  
    \]  
  },  
  "visual\_manifest\_defaults": {  
    "standard\_canvas\_width": 1920,  
    "standard\_canvas\_height": 1080,  
    "viseme\_centroid\_tolerance\_px": 4  
  }  
}

#### **B. Parameterizing the Scaffolding Engine**

The metaprogram code generator (generate-episode-repo.ts) resides in the viewport template. It contains zero hardcoded references to goblin characters or pipe locations. Instead, it accepts dynamic flags:

\# Stamping an episode into the Goblin flagship instance:  
tsx packages/viewport-template/generator/generate-episode-repo.ts \\  
  \--series under-the-floorboards \\  
  \--manifest ./outputs/ep040/exposure\_sheet.json \\  
  \--ast ./outputs/ep040/dialogue\_ast.json \\  
  \--out ../goblin-episodes/ep040

\# Stamping an episode under the generalized series-episodes structure:  
tsx packages/viewport-template/generator/generate-episode-repo.ts \\  
  \--series wiregrass-basin \\  
  \--manifest ./outputs/ep012/exposure\_sheet.json \\  
  \--ast ./outputs/ep012/dialogue\_ast.json \\  
  \--out ../series-episodes/wiregrass-basin/ep012

#### **C. Cross-Series Provenance Isolation**

When generate-episode-repo.ts stamps a workspace, it writes render\_manifest.json. By locking the series\_slug alongside input hashes, the build system ensures that multi-series renders can never cross-pollinate character assets, audio profiles, or narrative facts:

{  
  "build\_id": "sha256:4f8a1209bc87e5d23456789abcdef0123456789abcdef0123456789abcdef01",  
  "series\_slug": "under-the-floorboards",  
  "episode\_id": "EP040",  
  "schema\_version": "3.2.0",  
  "generated\_at": "2026-09-29T18:30:00Z",  
  "target\_source\_file": "Episode\_040.tsx",  
  "parents": {  
    "series\_config\_hash": "sha256:3b8f1a2c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a",  
    "dialogue\_ast\_hash": "sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",  
    "upstream\_provenance": {  
      "lore\_commit": "git:9c3e401",  
      "worker\_sower\_commit": "git:7bd4e10",  
      "viewport\_template\_commit": "git:4f8a120"  
    }  
  }  
}

Maintaining **series-episodes** as the universal architectural pattern while utilizing **goblin-episodes** as the active production repository ensures that your immediate creative work on *Under the Floorboards* is completely functional today, while guaranteeing that spinning up your second series (*Wiregrass Basin* or *Deep Space Salvage*) requires zero architectural rework.

---

*User prompt: {{FOCUS: Now look at the beginning of the converstation and summarize and find all the most importand parts on \[series-episodes\] until the last response  }} /extreme-details*

Response: series-episodes (and its concrete flagship instance goblin-episodes) serves as the append-only, version-controlled repository of self-contained, immutable episode workspaces that store source-baked React compositions, local assets, provenance lockfiles, and rendered deliverables for Cluster 05.delivery/.

The repository functions as an autonomous software release archive rather than an ephemeral rendering cache, ensuring Level 3 Decoded Media Equivalence (SSIM\>0.9999,Δ*E*\<0.1) across decades of production.

### **1\. Ontological Foundation: Meta-Ontology vs. Story Instance**

The system architecture enforces a strict Cartesian demarcation separating **Semantic Meaning (Axis A)** from **Media Representation (Axis B)**. Within this structure, series-episodes defines the universal delivery specification, while goblin-episodes represents the concrete diegetic instantiation.

                  THE ONTOLOGICAL SEPARATION OF PRODUCTION  
┌────────────────────────────────────────────────────────────────────────┐  
│                   META-ONTOLOGY (Universal Framework)                  │  
│ • Universal Narrative Tuple: ⟨S, A, I, R\_m⟩                            │  
│ • Schemas: Agent, Tension/Debt, Location, Slot Possession, World Axiom │  
│ • Sealed Lifecycle: @lifecycle: generated | patched | locked           │  
│ • Universal Contract: series-episodes / series-viewport-template       │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │ Parameterized by series.config.json  
                                    │ & CLI Ingestion Compilers (--series)  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│                   STORY INSTANCE (Concrete Diegetic World)             │  
│ • Canonical World: Under the Floorboards (Bog, Spleen, Wart, Grissel)  │  
│ • Domain Logic: Crawlspace farces, brass hoarding, bean rations        │  
│ • Cast Rigs: GoblinPuppet.tsx, Preston Blair goblin viseme maps        │  
│ • Flagship Repo: goblin-episodes/ (ep001/, ep040/)                     │  
└────────────────────────────────────────────────────────────────────────┘

#### **The Universal Narrative Tuple ⟨S,A,I,R*m*​⟩**

The meta-ontology models fictional reality as a format-agnostic state transition engine:

StoryWorld=⟨S,A,I,R*m*​⟩

> 1. **S (Universal State Space):** Strongly typed state vector containing biological/somatic trauma (Vsomatic​), anatomical equipment slot bindings (Vlogistical​), knowledge horizons (Vepistemic​), and discrete spatial coordinates (Vspatial​).  
> 2. **A (Action Vocabulary):** Bounded set of domain verbs parameterized by series.config.json (e.g., HOARD\_SCRAP, CONCEAL\_VALVE for goblins; LIMP, EXPEND\_LEVERAGE for industrial noir).  
> 3. **I (Invariant Engine):** Deterministic compile-time gates evaluating somatic capability equations and relational integrity at zero compute cost (*T*0​\=\$0.00) before rendering.  
> 4. **R*m*​ (Medium Projection Function):** Unidirectional adapter projecting state into physical media dimensions. For video (Rvideo​), state projects into **Physical Time** via 48 kHz speech master clocks, 24 fps integer frames, and affine camera transforms.

#### **The Foundational Rule: Media Is Not State**

Media representations possess zero semantic authority. A video container, audio stem, or camera wrapper cannot alter canonical world facts. The narrative universe remains logically intact within its relational ledger even if all neural models, media files, and rendering nodes are deleted.

### **2\. Core Architectural Mandate: Eradicating the Historical Corruption Trap**

The primary driver for series-episodes is the permanent eradication of the **historical corruption trap** common to dynamic video engines:

THE HISTORICAL CORRUPTION TRAP (LEGACY DYNAMIC RUNTIMES)  
┌────────────────────────────────────────────────────────────────────────┐  
│ T0: Episode 012 rendered against Shared Viewport v1.0.0                │  
│     • Dynamic scene.json parsed at runtime; visemes align to chin.     │  
├────────────────────────────────────────────────────────────────────────┤  
│ T1: Shared Viewport updated to v1.4.0 for Episode 040                  │  
│     • Camera spring damping & transform-origin modified for new rigs.  │  
├────────────────────────────────────────────────────────────────────────┤  
│ T2: Re-render Episode 012 against Shared Viewport v1.4.0               │  
│     • SILENT REGRESSION: Mouth visemes detach and float below chin;    │  
│       damped push-in decapitates character; sub-frame timing drifts.   │  
└────────────────────────────────────────────────────────────────────────┘

> * **The Legacy Failure Mode:** In systems parsing runtime sidecars (e.g., scene.json), updates to shared presentation components months later cause unmonitored regressions when earlier episodes are re-rendered.  
> * **The Metaprogram Isolation Model:** series-viewport-template acts strictly as an offline code generator and compiler (generate-episode-repo.ts); it never executes as a production runtime. It compiles upstream narrative contracts into an isolated, committed workspace in series-episodes/epXXX/.  
> * **Sealed Build Packaging:** Every episode directory bundles its own pinned dependencies, vendored components, harvested media envelopes, and literal TSX timelines, ensuring bit-identical replay over years of infrastructure churn.

### **3\. Stamped Workspace Anatomy (epXXX/)**

Each stamped directory forms a self-contained release package:

series-episodes/under-the-floorboards/ep040/  
├── Episode\_040.tsx              \# Source-baked static React Remotion composition  
├── render\_manifest.json          \# Root cryptographic build lockfile & DAG anchor  
├── remotion.config.ts           \# Software OpenGL (--gl=swangle) render configuration  
├── package.json                 \# Pinned dependencies (zero floating carats/tildes)  
├── tsconfig.json                \# Pinned TypeScript compilation ruleset  
├── components/                  \# Vendored presentation primitives  
│   ├── GoblinPuppet.tsx         \# Isolated 2D character rig & viseme compositor  
│   ├── CameraWrappers.tsx       \# Scoped per-shot sequence interpolation boundaries  
│   ├── AmbientTrack.tsx         \# Programmatic sidechain ducking bed (Math.min)  
│   └── FoleyTrack.tsx           \# Deterministic seeded transient audio (MurmurHash3)  
└── public/assets/               \# Pruned local asset envelope (\< 100MB ceiling)  
    ├── sprites/                 \# Script-referenced character emotion variants  
    ├── visemes/                 \# Referenced Preston Blair mouth shape overlays  
    ├── backgrounds/             \# Location matte plates declared in the scene  
    └── audio/                   \# Master acoustic clock stems (dialogue, foley, ambient)

### **4\. Key Artifact Roles**

#### **A. Episode\_XXX.tsx (Source-Baked Static Composition)**

Generated offline by generator/generate-episode-repo.ts, converting narrative ASTs and exposure sheets into static TypeScript JSX literals:

> * **Dynamic Evaluation Ban:** Dynamic array mapping (.map()), runtime fetch() requests, and uncompiled JSON sidecar reads are strictly forbidden.  
> * **Literal Numeric Inlining:** Sequence durations, timeline offsets, coordinate anchors, and audio levels are inlined as unquoted numeric primitives (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>), eliminating string coercion and runtime AST evaluation overhead.  
> * **Sequence-Relative Scoping:** Camera interpolations and spring physics are encapsulated inside per-shot wrapper components (\<Shot01CameraWrapper\>) to ensure useCurrentFrame() resets strictly to frame 0 within each sequence cut.

#### **B. render\_manifest.json (Universal Provenance Root)**

The immutable build lockfile placed at the workspace root, anchoring the episode into a Directed Acyclic Graph (DAG):

Build ID=H(*H*root​\+ASThash​\+∑Assetsha256​\+Containerdigest​\+Toolchains)

> * **Upstream Commit Freezing:** Pins exact Git commit hashes for worker-sower-engine, 000.goblin-lore, goblin-assets-visual, and goblin-viewport-template.  
> * **Runtime Freezing:** Locks the OCI container image hash (ghcr.io/studio/render-node@sha256:...), Node version, Remotion version, Chromium browser milestone (122.0.6261.94), static FFmpeg build string (6.1.1-static), and typography SHA-256 checksums.  
> * **Forensic Traversal:** Supports bidirectional causal auditing:  
  * *Backward Audit:* Traces any delivered pixel or audio sample back to its causal root:  
    Frame 144→Shot 02→Audio Stem→AST Beat→Somatic Vector→Canon Commit  
  * *Forward Blast Radius:* Identifies all downstream scenes invalidated (is\_dirty \= 1\) when an upstream fact or sprite changes.  
> * **C2PA Metadata Container Injection:** When headless Chromium outputs the final broadcast deliverable, the complete manifest is injected into the MP4 container via C2PA standards, anchoring the video to authorizing Git commits and execution logs.

#### **C. components/ (Vendored Presentation Layer)**

Eliminates the **Shared-Component Import Leak** where an episode references mutable external libraries (e.g., import { ... } from '../../../template'):

> * **AST Import Linter Guard:** During pre-flight verification, an automated linter parses the AST via ts-morph. Any import specifier containing parent directory traversal (../..) that escapes the episode workspace aborts the build with exit code 1\.  
> * **Component Primitives:**  
  * GoblinPuppet.tsx: Binds coordinate anchors, drives idle breathing loops, and gates Preston Blair visemes based on speech energy.  
  * CameraWrappers.tsx: Scopes affine camera curves to sequence durations.  
  * AmbientTrack.tsx: Manages background audio beds with sidechain ducking.  
  * FoleyTrack.tsx: Executes frame-accurate transient audio cues.

#### **D. public/assets/ (Pruned Local Asset Envelope)**

Isolates the episode from the 10 GB to 18 GB master visual vault (goblin-assets-visual) via collect-episode-assets.ts:

> * **AST Harvesting:** Scans dialogue\_ast.json and copies only referenced emotion variants (e.g., bog\_humiliated.png), visemes, and location plates into the workspace, achieving a \>90% footprint reduction.  
> * **Budget Ceilings:** Enforces a nominal target under 100 MB, tripping a fatal compile-time abort at 150 MB to block unpruned PSDs or raw asset dumps.  
> * **Zero-Byte Poison Sentinel:** Pre-flight checks compute SHA-256 hashes of all staged binaries, immediately failing if any file matches the empty hash constant:  
>   SHA-256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>   catching truncated network downloads and unhydrated Git LFS text pointers at *T*0​\=\$0.00.

### **5\. Mathematical & Physical Invariants**

               THE DUAL-DOMAIN ACOUSTIC/OPTICAL BRIDGE  
AUDIO DOMAIN (Continuous Master Clock: 48,000 samples/sec)  
  │  
  ├─ Sub-millisecond acoustic transients  
  └─ Integrated loudness: \-16 LUFS (±1.0), True-Peak \<= \-1.0 dBTP  
  │  
  ▼ Exact Integer Ratio: S \= F \* (48,000 / 24\) \= F \* 2,000 samples/frame  
VIDEO DOMAIN (Master Media Clock: 24 integer frames/sec)  
  │  
  ├─ target\_frames \= ceil(D\_ms \* 24 / 1000\) (Ceiling Rule)  
  └─ Absolute Timeline Placement: fromFrame\_k \= Σ duration\_i (Cumulative-MS)

#### **The Master Physical Clock Axiom**

Audio is the architect of physical time; picture is an integer projection mapped to audio duration. Speech stems synthesized by the local TTS microservice serve as the empirical timebase.

> * **The 2,000-Sample Constant:**  
>   24 frames/sec48,000 samples/sec​\=2,000 audio samples per video frame  
>   Acoustic events at sample index *S* map to discrete video frame *F*\=⌊*S*/2,000⌋.

#### **Cumulative-Millisecond Timeline Quantization**

Quantizing individual audio stems via naive ceiling math accumulates up to 1 frame (41.67 ms) of trailing silence per cut, causing 3 to 4 seconds of drift across an 80-shot episode. The compiler eliminates this via cumulative timeline tiling:

Start*k*​\=⌈1000∑*i*\<*k*​*Di*​​×24⌉,End*k*​\=⌈1000∑*i*≤*k*​*Di*​​×24⌉−1

Because End*k*​\+1≡Start*k*\+1​, consecutive shots tile the Remotion timeline with zero gaps, zero overlaps, and total episode drift strictly bounded to \<41.67 ms.

#### **Model Adapter Conformance & The 4*n*\+1 Temporal Lattice**

Generative video diffusion engines (Wan 2.2 / ComfyUI) employ 3D spatio-temporal causal VAEs with 4× temporal downsampling, requiring latent frames to conform to 4*n*\+1 (*n*∈N):

diffusion\_frames=4×⌈4⌈(*D*ms​/1000)×native\_fps⌉−1​⌉+1

The compiler isolates this constraint to the adapter layer; the diffusion output is trimmed or held in Remotion to fit the master 24 fps delivery timeline.

#### **Spatial Normalization & Stage Invariants**

> * **Transform-Origin Percentage Projection:** To prevent character cutouts (1024×1024) from scaling off-center, the compiler pre-projects the biological contact anchor to CSS percentages:  
>   originX%​\=(1024anchor.x​)×100%,originY%​\=(1024anchor.y​)×100%  
> * **Grounding Invariant:** Vertical stage placement is bound to the floor plane: *Y*stage​≡*Y*ground​, preventing foot-sliding across cuts.  
> * **Viseme Centroid Alignment:** Preston Blair mouth overlays must center on the character mouth bounding box within a strict tolerance:  
>   ∥mouth\_center−viseme\_centroid∥\<4px

### **6\. Acoustic Mixing & Programmatic Ducking Automation**

Audio assembly in Episode\_XXX.tsx partitions into three concurrent, prioritized layers:

Track 1: Spoken Dialogue Stems (Master Clock — Absolute Integer Frame Placements)  
         \[--------- Shot 01 (75f) \---------\]          \[--------- Shot 02 (90f) \---------\]  
Track 2: Spot Foley Transients (Mulberry32 PRNG Seeded / MurmurHash3)  
                \[\*valve\_scrape\*\]                             \[\*boot\_squelch\*\]  
Track 3: Continuous Ambient Bed & Score (Programmatic Gain Automation)  
────┐                                       ┌────────┐                                 ┌────  
    │                                       │        │                                 │  
    └───────────────────────────────────────┘        └─────────────────────────────────┘  
      ^ Attack (6f)          Release (12f) ^          ^ Attack (6f)      Release (12f) ^  
      Ducking Floor: \-14 dB                           Ducking Floor: \-14 dB

> 1. **Track 1 (Dialogue Stems):** Uncompressed 48 kHz .wav stems mounted at absolute frame coordinates, mastered to −16.0 LUFS±1.0 with a True-Peak ceiling ≤−1.0 dBTP.  
> 2. **Track 2 (Spot Foley Transients):** Physical interaction sound cues mapped from AST nodes. Transient sample variants are resolved deterministically using a Mulberry32 PRNG seeded via MurmurHash3:  
>    Seed=MurmurHash3(sceneId+":"+shotId+":"+sampleKey)  
>    An anti-clustering salt (\${seed}:retry) prevents identical sample selection across adjacent shots.  
> 3. **Track 3 (Continuous Ambient Bed & Score):** Atmospheric loops ducked programmatically by **−14 dB** during active dialogue windows (*V*duck​≈0.08 on base 0.40), using a 6-frame quadratic attack and a 12-frame quadratic release.  
   * **Multi-Window Minimum Reducer (Math.min):** AmbientTrack.tsx evaluates all dialogue windows across the scene simultaneously with a Math.min reduction. This prevents the "envelope pumping bug," where short dialogue gaps cause the ambient bed to audibly jump up and down between adjacent sentences.  
   * **Dramatic Silences:** Explicit silence windows drop the ambient floor to **−24 dB** for dramatic realizations.

### **7\. The Sealed-File Lifecycle State Machine**

Byte 0 of every generated Episode\_XXX.tsx carries a cryptographic header establishing the boundary between automation and human direction:

// @lifecycle: generated | patched | locked  
// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f  
// @upstream\_ast: sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d  
// @build\_profile: 1080p\_24fps\_master  
// @patch\_history: \["QA-EP040-SH03-VISEME\_ALIGN"\]

> * **Header Exclusion Hashing:** Checksums are computed strictly over the component body starting after the trailing newline of the header to prevent circular hash dependencies.  
> * **Canonical LF Normalization:** Checksums require POSIX LF line endings (\\n, 0x0A) enforced via .gitattributes. Automated formatters (Prettier, ESLint) are disabled across generated directories to prevent white-space changes from invalidating hashes.

┌────────────────────────────────────────────────────────────────────────────────────────┐  
│                          LIFECYCLE SPECIFICATION MATRIX                                │  
├──────────────────────┬────────────────────────┬───────────────────┬────────────────────┤  
│ Lifecycle State      │ Permitted Author       │ CI Merge Protocol │ Upstream Rerun     │  
├──────────────────────┼────────────────────────┼───────────────────┼────────────────────┤  
│ @lifecycle: generated│ generate-episode-repo  │ Fully automated   │ Clean in-place     │  
│                      │ (Compiler)             │ merge authority   │ overwrite          │  
├──────────────────────┼────────────────────────┼───────────────────┼────────────────────┤  
│ @lifecycle: patched  │ Jules / Diagnostic QA  │ Bounded AST diff  │ Block if unstaged; │  
│                      │ (ts-morph Agent)       │ verification gate │ alert & diff check │  
├──────────────────────┼────────────────────────┼───────────────────┼────────────────────┤  
│ @lifecycle: locked   │ Human Director         │ Manual signature  │ HARD HALT: Fork to │  
│                      │ ("The Eject Button")   │ & review gate     │ .candidate.tsx     │  
└──────────────────────┴────────────────────────┴───────────────────┴────────────────────┘

#### **Collision Protection & Candidate Forking**

When upstream narrative state changes and the compiler is re-run against an existing workspace:

> 1. If marked @lifecycle: locked (or if an unmarked file has a body hash that diverges from its header checksum), the compiler halts.  
> 2. Overwrites are blocked; the compiler emits Episode\_XXX.candidate.tsx beside the original file and exits with code 1 (METAPROGRAM\_COLLISION).  
> 3. Directorial interventions log an append-only DIRECTOR\_OVERRIDE event into the production ledger and render\_manifest.json, preserving causal traceability.

### **8\. Hardware Profile Demarcation & Headless Execution**

To prevent GPU driver crashes and Out-Of-Memory aborts caused by running diffusion models and headless browsers on the same workstation, compute is strictly quarantined across hardware profiles:

┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐  
│ RIG 1: ORCHESTRATION & OPTICAL ASSEMBLY│       │ RIG 2: HEAVY GPU TENSOR FOUNDRY        │  
│ (Zero Dedicated VRAM / Pure CPU & RAM) │       │ (Dedicated Silicon / High VRAM)        │  
├────────────────────────────────────────┤       ├────────────────────────────────────────┤  
│ • worker-sower-conductor (Node.js LTS) │       │ • Headless ComfyUI Daemon (:8188)      │  
│ • Local Audio Microservice (:8000)     │       │ • media-broker Controller (:3000)      │  
│ • Optical Compositor (Remotion CLI):   │  ──►  │ • 100% of VRAM dedicated to:           │  
│   \- Headless Chromium (--gl=swangle)   │ JSON  │     \- Wan 2.2 / LoRA Diffusion Passes  │  
│   \- Concurrency: \--concurrency=1       │  IPC  │     \- \#00FF00 Greenscreen Plates       │  
│ • Resource Footprint: 0 MB GPU VRAM    │       │ • POSIX Mutex: flock(rig2\_gpu.lock)    │  
│ • Child processes: ffprobe, git        │       │ • Quarantined: ZERO Chromium / Remotion│  
└────────────────────────────────────────┘       └────────────────────────────────────────┘

#### **Headless Stability Rules (remotion.config.ts)**

> * **Software OpenGL (--gl=swangle):** Forces Chromium to rasterize via Google SwiftShader on ANGLE, bypassing host GPU drivers to eliminate Linux OpenGL display leaks and X11/Wayland context crashes.  
> * **Single-Worker Concurrency (--concurrency=1):** Limits V8 heap consumption to \<1.2 GB, preventing RAM exhaustion and frame drops.  
> * **Off-Thread Decoding (\<OffthreadVideo/\>):** Video decoding is handled by external FFmpeg subprocesses rather than Chromium DOM \<video\> tags, preventing memory leaks over long rendering runs.  
> * **Shared Memory Protection (--disable-dev-shm-usage):** Forces Chromium to allocate memory in /tmp rather than the constrained 64 MB container /dev/shm space.

#### **Double-Render Conformance Audit (Level 3 Verification)**

Master builds are rendered twice consecutively (runA.mp4, runB.mp4). Both streams are decoded into raw RGBA pixel arrays and PCM audio buffers. Master deliverables are certified only when variance evaluates to zero:

SSIM(runA,runB)=1.0,Δ*E*max​\=0.0,Audio Drift=0 samples

#### **Post-Render Finalization & The Sunset Seal**

Upon render certification, the episode emits state\_delta.json recording somatic injuries, spent items, and character knowledge disclosures. This delta reconciles into the canonical database (CANON\_DB), propagating dirty flags (is\_dirty \= 1\) down the DAG to invalidate downstream dependent scenes.

At the end of the production shift, the **Sunset Seal (The Long Rest)** compiles and seals updated state into compiled/\<series\>/bible-state.json under a new Merkle root (*H*root​), permanently calcifying the episode workspace and media deliverables into read-only historical archives.

---

