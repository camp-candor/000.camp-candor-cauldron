# **Overview: Goblin-Viewport-Template.01**

[https://gemini.google.com/app/77d13db01863001e](https://gemini.google.com/app/77d13db01863001e)

*User prompt: now i want to continue the exploration of \[Goblin-Viewport-Template\]; can you give a complete overview of its current functionality and purpose*

Response: goblin-viewport-template serves as the deterministic video compositing engine, presentation compiler, and digital optical printing layer for the episodic generation pipeline. Built around Remotion (React-based programmatic video rendering), its core purpose is to compile upstream narrative state, locked acoustic stems, and visual plates into final broadcast MP4 deliverables while guaranteeing bit-identical historical reproducibility.

### **Core Purpose & Architectural Model**

The repository exists to resolve the **historical corruption trap** of the legacy goblin-viewport implementation. In the legacy model, a single, long-lived application dynamically ingested mutable scene.json payloads at runtime. When shared React components (such as GoblinPuppet.tsx) or camera easing curves were modified for newer episodes, re-rendering earlier episodes caused silent visual regressions—such as mouth shapes detaching from chin lines or camera zooms misaligning.

goblin-viewport-template replaces the runtime player model with an **offline metaprogramming compiler and scaffolding blueprint**:

> * **Template, Not Runtime:** goblin-viewport-template is never executed directly as an episode runtime target; it functions exclusively as a compiler and boilerplate repository.  
> * **Per-Episode Stamping:** A generator script (generator/generate-episode-repo.ts) ingests upstream scene data and stamps out a dedicated, isolated directory inside goblin-episodes/ (e.g., goblin-episodes/episode-040/).  
> * **Source-Baking Pattern:** Rather than parsing dynamic JSON sidecars via .map() loops during rendering, shot boundaries, audio paths, and visual coordinates are burned directly into static TypeScript JSX literals within an immutable composition file (Episode\_XXX.tsx).  
> * **Component Vendoring & Isolation:** Shared presentation primitives are either vendored directly into the stamped episode directory, pinned to an immutable semver package release (e.g., @studio/viewport@1.4.2), or locked to an explicit Git commit SHA to eliminate dependency drift.

| Dimension | Legacy goblin-viewport | Current goblin-viewport-template |
| :---- | :---- | :---- |
| **System Role** | Monolithic runtime rendering application. | Metaprogramming compiler and scaffolding template. |
| **Execution Model** | Dynamically ingested runtime JSON payloads (scene.json). | Generator stamps out isolated, committed per-episode repositories. |
| **Timeline Definition** | Evaluated dynamic arrays and variables at render time. | **Source-Baking:** Hardcoded integer literals in static TSX. |
| **Reproducibility** | High regression risk; past renders broke on component updates. | Provable, bit-identical replay via frozen source and lockfiles. |

### **Upstream Ingestion & Contract Enforcement**

goblin-viewport-template operates strictly downstream of narrative, acoustic, and visual asset authorities, consuming immutable data contracts off local disk:

> * **Dialogue AST (dialogue\_ast.json):** Emitted by worker-sower-engine, declaring spoken lines, speaker IDs, emotional condition tags (e.g., humiliated, smug), and Motivation-Reaction Unit (MRU) beats.  
> * **Timing Manifest (exposure\_sheet.json):** Emitted after speech synthesis, containing millisecond durations converted to a locked 24 fps timebase using the quantization formula ⌈(duration\_ms/1000)×24⌉.  
> * **Visual Asset Contract (manifest.json):** Consumed from goblin-assets-visual to eliminate runtime guesswork and dynamic discovery. The manifest defines:  
  * **Ground Contact Pivots (anchor\_point):** Precise (*x*,*y*) coordinates anchoring characters to the background floor plane.  
  * **Camera Focus Targets (crash\_zoom\_target):** Coordinate offsets centered on facial centroids or eye lines to ensure accurate close-up framing regardless of character height.  
  * **Mouth Viseme Envelopes (mouth\_bounding\_box):** Coordinate bounding boxes defining exact placement windows for dynamic mouth overlays.  
  * **Physics Overrides (animation\_hints):** Dynamic weighting parameters (such as talk\_bounce\_amplitude and idle\_shiver\_amplitude) enabling generic components to express distinct character temperaments.  
  * **Graceful Degradation:** Explicit null declarations for un-illustrated emotions that fall back safely to idle states.

### **Core Compositing & Presentation Functionality**

Within the generated Remotion composition tree, the presentation layer acts as a programmatic optical printer executing four core responsibilities:

> * **2D Cutout Puppetry (GoblinPuppet.tsx):** Swaps emotion variant sprites keyed to dialogue windows and overlays synchronized mouth visemes (closed, small, medium, wide) derived from speech energy profiles.  
> * **Greenscreen Chroma Keying:** When compositing diffusion character plates (generated via ComfyUI against \#00FF00), it applies an algorithmic chroma-key shader (colorKey from @remotion/effects) with despill correction and edge smoothing over static background mattes.  
> * **Mathematical Camera Systems:** Executes distortion-free spatial transforms via Remotion’s interpolate(), including subtle push-ins (e.g., 1.0× to 1.05× over 120 frames), horizontal tracking pans, and seeded PRNG coordinate noise for impact screen shakes.  
> * **Multi-Track Audio Ducking:** Binds dialogue stems, spot sound effects (FoleyTrack.tsx), and continuous ambient score beds, programmatically executing an automated sidechain ducking curve that suppresses background audio by **\-14 dB** during speech.

### **Code-Generation Engine & Asset Management**

The scaffolding repository provides specialized toolchains and scripts to assemble, prune, and freeze stamped episodes:

> * **Metaprogram Generator (generator/generate-episode-repo.ts):** Calculates absolute frame offsets (fromFrame*k*​\=∑shot\_duration*i*​), projects character sprite coordinates into normalized canvas origin percentages, and stamps out Episode\_XXX.tsx with unquoted integer props.  
> * **Per-Episode Asset Pruner (collect-episode-assets.ts):** Parses the episode AST before rendering to extract and copy only the specific background mattes, visemes, and sprite variants referenced in the script, reducing the asset footprint by \~90% and enforcing an episode storage ceiling under 100MB to 150MB.  
> * **Asset Synchronization Harness (scripts/sync-assets.ts):** Clones or pulls pinned release tags (such as latest-stable or v1.4.0) from goblin-assets-visual into public/assets/visual/, avoiding the overhead and detached-HEAD issues of Git submodules.  
> * **Provenance Sealing (render\_manifest.json):** Emits an immutable build lockfile capturing the episode ID, generation timestamp, asset SHA-256 binary digests, execution toolchain versions (Node, Remotion, Chromium, FFmpeg), and the exact Git commit SHAs of worker-sower-engine, goblin-bible, goblin-assets-visual, and goblin-viewport-template.

### **Execution Profile & Hardware Boundary**

The rendering engine operates strictly as a CPU and system-memory workload on Rig 1, decoupled entirely from GPU resources. Because rendering is orchestrated by @remotion/renderer executing headless Chromium, the template locks execution to software rendering (--gl=swangle) and off-thread media decoding (\<OffthreadVideo/\>) with constrained concurrency. This profile prevents OpenGL driver leaks on headless Linux environments and preserves all available GPU VRAM for upstream diffusion and LoRA inference tasks.

---

*User prompt: Which repo does this come from \[Timing Manifest (exposure\_sheet.json): Emitted after speech synthesis, containing millisecond durations converted to a locked 24 fps timebase using the quantization formula \$\\lceil (\\text{duration\\\_ms} / 1000\) \\times 24 \\rceil\$\]*

Response: This artifact is emitted by **worker-sower-engine** (specifically orchestrated by the Conductor in src/pipeline/produceEpisode.ts, also structured in execution splits as worker-sower-conductor).

### **How and Where It Is Produced**

> * **Emitting Authority:** While the core simulation in worker-sower-engine produces the abstract narrative dialogue\_ast.json, its master orchestration harness (produceEpisode.ts / the Conductor) acts as the bridge to physical media time.  
> * **Generation Process:**  
  1. The Conductor dispatches the lines of dialogue to a local Text-To-Speech (TTS) microservice to generate uncompressed .wav stems.  
  2. It runs an asynchronous ffprobe child process across each audio buffer to extract the raw duration\_ms.  
  3. It calculates the locked frame budget using the integer quantization ceiling formula:  
     target\_frames=⌈(1000duration\_ms​)×24⌉  
  4. It writes the resulting frame counts, pre/post-roll frames, audio file paths, ducking parameters, and viseme cues into **exposure\_sheet.json**.  
> * **Downstream Consumer:** Once emitted by worker-sower-engine, exposure\_sheet.json is passed as a command-line input parameter to the generator script in **goblin-viewport-template** (generator/generate-episode-repo.ts) to source-bake the static Remotion TSX composition into goblin-episodes/.

---

*User prompt: {{FOCUS: The Metaprogram Code-Generation Model (goblin-viewport-template)}} /extreme-details*

Response: The Metaprogram Code-Generation Model of goblin-viewport-template is an architectural mechanism that replaces runtime media-player interpretation with build-time React code generation. The repository goblin-viewport-template does not function as an executable episode runtime target; instead, it operates as an offline metaprogram compiler, component blueprint, and scaffolding framework. It ingests upstream narrative, acoustic, and visual contracts to stamp out isolated, permanently committed, and statically baked episode repositories inside goblin-episodes/.

### **The Paradigm Shift: Monolithic Player vs. Source-Baking Compiler**

In the legacy goblin-viewport implementation, a monolithic application dynamically ingested mutable scene.json payloads at render time. This model produced the **historical corruption trap**:

`THE HISTORICAL CORRUPTION TRAP (LEGACY RUNTIME PLAYER)`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ Month 0:  Episode 012 rendered against Shared Viewport v1.0.0          │`  
`│           • Result: Frame 144 viseme aligned, crash zoom target exact. │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Month 6:  Shared Viewport refactored to v1.4.0 for Episode 040         │`  
`│           • Altered camera spring dampening curves in GoblinPuppet.tsx │`  
`│           • Refactored transform-origin logic for tall character rigs │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Re-render Episode 012 against Viewport v1.4.0                          │`  
`│           • SILENT REGRESSION: Visemes detach from chin baseline,      │`  
`│             camera zooms decapitate characters, timing rubber-bands.   │`  
`└────────────────────────────────────────────────────────────────────────┘`

When generic presentation components or layout logic evolved in the legacy player, the interpreter moved underneath the archive, causing re-renders of older episodes to suffer unmonitored visual regressions.

goblin-viewport-template eliminates runtime interpretation entirely. It operates on the principle of **explicit coordinates over implicit accumulated state**:

`LEGACY RUNTIME MODEL:`  
`Episode JSON + Current Viewport Code ──► Headless Chromium ──► Drifted Video`

`SOURCE-BAKED METAPROGRAM MODEL:`  
`Upstream Contracts (AST + Exposure Sheet + Visual Manifests)`  
                      `│`  
                      `▼`  
   `goblin-viewport-template/generator/generate-episode-repo.ts`  
                      `│`  
                      `▼`  
   `Frozen, Self-Contained TSX (goblin-episodes/ep040/Episode_040.tsx)`  
                      `│`  
                      `▼`  
   `Headless Remotion CLI (Rig 1 CPU) ──► Bit-Identical Historical Video`

The compiler moves all timeline evaluation, coordinate projection, audio-ducking curves, and viseme selections from runtime .map() evaluation into static TypeScript source code.

### **Upstream Ingestion Contracts & Quantization Mechanics**

The compiler (generator/generate-episode-repo.ts) takes three immutable upstream contracts from disk before generating code:

`tsx ../goblin-viewport-template/generator/generate-episode-repo.ts \`  
  `--manifest ./outputs/ep01_sc03/exposure_sheet.json \`  
  `--ast ./outputs/ep01_sc03/dialogue_ast.json \`  
  `--out ../goblin-episodes/ep01_sc03`

#### **1\. Machine Dialogue AST (dialogue\_ast.json)**

Emitted by worker-sower-engine, this AST represents the canonical semantic contract. It defines actor dialogue lines, character IDs, emotional condition tags (humiliated, smug, defensive), spatial staging, and Dwight Swain Motivation-Reaction Unit (MRU) cues (e.g., VISCERAL\_STING). Downstream presentation code never parses free-form narrative prose; it derives all visual and pacing logic strictly from this structured AST.

#### **2\. Quantized Timing Manifest (exposure\_sheet.json)**

The pipeline enforces a **Dual-Clock Architecture** where audio serves as the non-negotiable master clock:

> * **Audio Timebase Domain (48 kHz Continuous):** Dialogue lines are synthesized first by audio-microservice into uncompressed .wav stems. An asynchronous ffprobe process measures the precise buffer duration in milliseconds (*D*ms​).  
> * **Video Timebase Domain (24 fps Discrete):** Continuous physical time is quantized into discrete frame counts using the ceiling integer formula:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉  
>   For example, a speech stem of 3,120 ms resolves to ⌈3.120×24⌉=75 frames. The exposure sheet records start\_frame, audio\_frames, pre\_roll\_frames, post\_roll\_frames, sidechain ducking decibels (−14.0 dB), and exact viseme shape timelines.

#### **3\. Visual Asset Contracts (manifest.json)**

Visual layouts are governed strictly by typed manifests exported from goblin-assets-visual/characters/{id}/manifest.json:

> * **Ground Contact Pivots (anchor\_point):** Coordinate pairs (e.g., {"x": 512, "y": 980}) marking the lowest central point of foot contact. This locks the puppet rig to the background horizon line (*Y*ground​), preventing sliding or hovering during horizontal camera moves.  
> * **Camera Focus Targets (crash\_zoom\_target):** Precise coordinate targets (e.g., {"x": 412, "y": 198}) centered on facial centroids or eye lines to ensure automated framing without manual keyframing.  
> * **Mouth Viseme Envelopes (mouth\_bounding\_box):** Coordinate bounding boxes (e.g., \[380, 240, 64, 32\]) defining the exact rectangle where modular mouth textures (closed, small, medium, wide) snap over the base sprite.  
> * **Motion Physics Overrides (animation\_hints):** Dynamic weighting scalars (e.g., talk\_bounce\_amplitude: 8, idle\_shiver\_amplitude: 14\) that allow shared components (GoblinPuppet.tsx) to express character temperament and physical weight without per-character custom code.  
> * **The Explicit Null Protocol:** Missing or un-illustrated sprite variants are explicitly declared as null (e.g., "terrified": null). During animatic draft builds, the compiler falls back gracefully to base\_states.idle. For broadcast mastering, the compiler enforces a fail-loud invariant:  
>   ∀shot∈Episode,referenced\_variant(shot)=null  
>   Any missing asset variant aborts compilation with exit code 1 unless an authorized production waiver is committed.

### **Source-Baking Compilation & Remotion TSX Generation**

The generator compiles the abstract timeline into a concrete, self-contained TypeScript file (Episode\_XXX.tsx):

`// goblin-episodes/ep040/Episode_040.tsx`  
`// @lifecycle: generated`  
`// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f`  
`// @build_profile: 1080p_24fps_master`

`import React from 'react';`  
`import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';`  
`import { GoblinPuppet } from './components/GoblinPuppet';`  
`import { Shot01CameraWrapper, Shot02CameraWrapper } from './components/CameraWrappers';`

`export const Episode_040: React.FC = () => {`  
  `return (`  
    `<AbsoluteFill style={{ backgroundColor: '#050505' }}>`  
      `{/* Sequence 01: Absolute Frame Anchoring */}`  
      `<Sequence from={0} durationInFrames={75}>`  
        `<Shot01CameraWrapper originX="48.2%" originY="21.4%">`  
          `<GoblinPuppet`  
            `character="BOG"`  
            `emotion="humiliated"`  
            `anchorPoint={{ x: 512, y: 980 }}`  
            `mouthBoundingBox={[380, 240, 64, 32]}`  
          `/>`  
          `<Audio`  
            `src={staticFile("audio/dialogue/ep040_sh01.wav")}`  
            `volume={1.0}`  
          `/>`  
        `</Shot01CameraWrapper>`  
      `</Sequence>`  
        
      `{/* Sequence 02: Absolute Offset without Drift */}`  
      `<Sequence from={75} durationInFrames={99}>`  
        `<Shot02CameraWrapper originX="51.0%" originY="19.8%">`  
          `<GoblinPuppet`  
            `character="SPLEEN"`  
            `emotion="defensive"`  
            `anchorPoint={{ x: 480, y: 960 }}`  
            `mouthBoundingBox={[410, 220, 58, 30]}`  
          `/>`  
          `<Audio`  
            `src={staticFile("audio/dialogue/ep040_sh02.wav")}`  
            `volume={1.0}`  
          `/>`  
        `</Shot02CameraWrapper>`  
      `</Sequence>`  
    `</AbsoluteFill>`  
  `);`  
`};`

#### **1\. Unquoted Numeric Literals**

Frame bounds, durations, and audio parameters are stamped as raw TypeScript numbers (e.g., from={0} durationInFrames={75}), never as parsed string values (e.g., durationInFrames="75"). This prevents runtime type coercion overhead and ensures strict Remotion AST type-safety.

#### **2\. Absolute Timeline Pointer Accumulation**

Sequences are never chained end-to-end dynamically at runtime. Every sequence start boundary is precomputed at generation time by accumulating preceding frame durations:

fromFrame*k*​\=*i*\=1∑*k*−1​total\_shot\_frames*i*​

Because each audio stem mounts at exactly *f*/24 seconds, speech onset is sample-accurate relative to visual cuts, while tail padding absorbs any sub-frame slack (\<41.7 ms) without cumulative rounding drift.

#### **3\. Sequence-Relative Hook Scoping**

Calling Remotion's useCurrentFrame() at the composition root causes subsequent shots to evaluate camera curves against global scene time, corrupting interpolations for later cuts. The generator prevents this Remotion pitfall by compiling isolated shot sub-components (\<Shot01CameraWrapper\>, \<Shot02CameraWrapper\>), ensuring that useCurrentFrame() evaluates locally from frame 0 within every \<Sequence\>.

#### **4\. Scaled Coordinate Projection Math**

A sprite-local anchor coordinate (e.g., *x*\=412 on a 1024×1024 sprite canvas) cannot simply be divided by scene canvas width without triggering decapitation or zoom misalignments. The generator projects sprite coordinates into global composition space (1920×1080), factoring in puppet position offsets and the puppet's active scale factor (*s*):

originXglobal​\=canvas.widthpuppet.x+(anchor.x×*s*)​×100%  
originYglobal​\=canvas.heightpuppet.y+(anchor.y×*s*)​×100%

These percentages are baked directly into the camera wrapper's inline style.transformOrigin, allowing Remotion's interpolate() to execute camera moves without runtime coordinate lookups.

#### **5\. External Pacing Metaprogramming (style\_rules.json)**

Directorial heuristics are decoupled from compiler source code and read from a versioned configuration table:

> * When an AST node declares an emotional beat (e.g., VISCERAL\_STING), the generator burns an authored reaction hold (e.g., 18 frames) directly into the timeline before dialogue audio starts.  
> * Programmatic push-in trajectories (e.g., scaling smoothly from 1.0× to 1.03× or 1.05× over 120 frames using quadOut easing) are centered strictly on the facial centroid.

### **Component Isolation, Asset Pruning, & Pre-Flight Gating**

To enforce self-containment without repo bloat, goblin-viewport-template uses strict operational boundaries:

#### **Component Boundary Isolation**

Importing components from active sibling directories (e.g., ../../goblin-viewport/...) causes runtime component leaks. The template isolates presentation code using one of three patterns:

> 1. **Component Vendoring (Standard Pattern):** The generator copies presentation primitives (GoblinPuppet.tsx, AmbientTrack.tsx, FoleyTrack.tsx, remotion.config.ts) directly into goblin-episodes/epXXX/components/ at bake time.  
> 2. **Immutable Package Registries:** Presentation primitives are imported from an immutable, published package release (e.g., @studio/viewport@1.4.2).  
> 3. **Git Submodule Commit Locking:** Components are pinned to an immutable 40-character Git commit SHA.

#### **Asset Pruning (collect-episode-assets.ts)**

Full character asset repositories contain full emotion banks exceeding tens of gigabytes. To enforce the per-episode storage ceiling (\<100MB to 150MB), collect-episode-assets.ts walks the scene AST, extracts only the 10–20 referenced condition sprites, viseme overlays, and background plates, and stages them locally in goblin-episodes/epXXX/public/assets/:

`// scripts/collect-episode-assets.ts`  
`interface AssetReference {`  
  `file: string;`  
  `sourceRepo: "goblin-assets-visual" | "goblin-lora-training";`  
  `sourceCommit: string;`  
`}`

`function collectRequiredAssets(episodeScene: CompiledScene): AssetReference[] {`  
  `const required = new Set<string>();`

  `for (const round of episodeScene.rounds) {`  
    `if (round.speaker) {`  
      `const manifest = loadCharacterManifest(round.speaker);`  
      `// exact emotion + facing combination required by this line`  
      `const spriteFile = resolveSprite(manifest, round.emotion, round.facing);`  
      `required.add(spriteFile);`

      `// mouth-shape overlays actually used in this line's viseme timeline`  
      `for (const cue of round.mouthCues) {`  
        `required.add(manifest.mouth_shapes[cue.value]);`  
      `}`  
    `}`  
  `}`

  `// background matte actually used`  
  `required.add(loadLocationManifest(episodeScene.location).background);`

  `return Array.from(required).map((file) => ({`  
    `file,`  
    `sourceRepo: "goblin-assets-visual",`  
    `sourceCommit: getCurrentCommit("goblin-assets-visual"),`  
  `}));`  
`}`

This mechanism cuts the asset footprint by \~90%, staging episodes at 5MB–28MB and maintaining full offline self-containment.

#### **Asset Sync Harness (scripts/sync-assets.ts)**

Rather than using heavy Git submodules, sync-assets.ts clones pinned releases from goblin-assets-visual via shallow clones (--depth 1):

> * latest-stable: A floating Git tag pointing to the most recently verified asset set for daily local builds.  
> * Permanent Semver Tags (e.g., v1.4.0): Fixed Git tags or commit SHAs pinned for historical episode builds.

#### **Invariant Pre-Flight Checks**

Before headless rendering initializes, the engine executes four pre-flight gates:

> 1. **Disk Parity Audit (\!MissingAssets):** Parses hardcoded paths in Episode\_XXX.tsx against local disk. If any sprite, audio stem, or matte is missing, the build terminates immediately with exit code 1\.  
> 2. **The Empty-Hash Trap:** Calculates the SHA-256 digest of every binary asset. If any file matches the zero-byte hash (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855), compilation halts to catch truncated network transfers.  
> 3. **Tree-Hash Staleness Verification:** Compares source-tree hashes in compiled/bible-state.json against Git tree SHAs of /characters/ and /grievances/ to catch stale assets.  
> 4. **Alpha Spill Scan:** For ComfyUI greenscreen plates (\#00FF00), a pre-flight pixel pass scans the outer 3-pixel border of the matte silhouette. If mean green intensity exceeds threshold limits (≥12), the plate is rejected for excessive color spill before passing to @remotion/effects (colorKey).

### **The Cryptographic Sealed-File Lifecycle**

To support human artistic adjustments without compromising reproducibility, the model incorporates the **Showrunner Eject Button** governed by a cryptographic header lifecycle:

`// @lifecycle: generated | patched | locked`  
`// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f`  
`// @patch_history: ["QA-EP040-SH03-VISEME_ALIGN"]`

`SEALED-FILE STATE MACHINE & MERGE ARBITRATION`  
  `┌────────────────────────────────────────────────────────────┐`  
  `│ 1. @lifecycle: generated                                   │`  
  `│    • Emitted by generator; SHA-256 computed over body.     │`  
  `│    • Automated CI merge authority.                         │`  
  `└─────────────────────────────┬──────────────────────────────┘`  
                                `│`  
        `┌───────────────────────┴───────────────────────┐`  
        `▼                                               ▼`  
`┌──────────────────────────────┐        ┌──────────────────────────────┐`  
`│ 2. @lifecycle: patched       │        │ 3. @lifecycle: locked        │`  
`│ • Automated CV repair agents │        │ • Human director edit        │`  
`│   (e.g., Jules alignment).   │        │   (The "Eject Button").      │`  
`│ • Permitted only if AST diff │        │ • Overwrites blocked.        │`  
`│   confirms whitelisted props.│        │ • Upstream reruns emit:      │`  
`└──────────────────────────────┘        │   Episode_XXX.candidate.tsx  │`  
                                        `└──────────────────────────────┘`

> * **Byte Normalization:** Body checksums are calculated over NFC-normalized text. Episode workspaces enforce \* text=auto eol=lf in .gitattributes, while Prettier and ESLint formatting runs are disabled over generated directories to prevent line-ending checksum mismatches.  
> * **Collision Protection Protocol:** If upstream narrative state changes and the generator re-runs against an episode marked @lifecycle: locked (or with a mismatched checksum), the generator does not overwrite the file. It writes the new output to Episode\_XXX.candidate.tsx and halts, alerting the showrunner.  
> * **Event Ledger Auditing:** Any manual director edit emits an immutable DIRECTOR\_OVERRIDE event into the historical ledger, recording the author ID, timestamp, property delta, and dramatic rationale.

### **Provenance Graph Root: render\_manifest.json**

The final output of the metaprogram is render\_manifest.json, an immutable build lockfile placed at the root of the stamped episode. The episode build identity is defined as a cryptographic tuple:

Build ID=H(Canon+Ledger State+AST+Assets+Container Digest+Toolchains)  
`{`  
  `"build_id": "sha256:4f8a1209bc...",`  
  `"episode_id": "EP040",`  
  `"schema_version": "3.0.0",`  
  `"generated_at": "2026-09-28T15:44:00Z",`  
  `"target_source_file": "Episode_040.tsx",`  
  `"source_file_sha256": "7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",`  
  `"parents": {`  
    `"dialogue_ast_hash": "sha256:12c8a...",`  
    `"exposure_sheet_hash": "sha256:9c3e4...",`  
    `"source_file_hash": "sha256:7bd4e...",`  
    `"canon_tree_sha": "git:9c3e401",`  
    `"assets_visual_tree_sha": "git:v1.4.0",`  
    `"viewport_template_sha": "git:4f8a120"`  
  `},`  
  `"acoustic_assets": {`  
    `"ep040_sh01.wav": "sha256:4a8c9e2b10a...",`  
    `"ep040_sh02.wav": "sha256:9c1d8e3f4a..."`  
  `},`  
  `"visual_sprites_used": {`  
    `"bog_humiliated.png": "sha256:7f83b1657ff1...",`  
    `"spleen_defensive.png": "sha256:a3b4c5d6e7f8..."`  
  `},`  
  `"runtime_environment": {`  
    `"container_digest": "ghcr.io/studio/render-node@sha256:7b4a...",`  
    `"node_version": "v20.12.0",`  
    `"remotion_version": "4.0.140",`  
    `"chromium_milestone": "122.0.6261.94",`  
    `"ffmpeg_build": "6.1.1-static",`  
    `"font_manifest": {`  
      `"Cinzel-Bold.ttf": "sha256:5a6b7c..."`  
    `}`  
  `},`  
  `"reproducibility_audit": {`  
    `"protocol": "visual_conformance_v2",`  
    `"double_render_status": "BIT_IDENTICAL",`  
    `"measured_ssim": 1.0,`  
    `"delta_e_max": 0.0`  
  `}`  
`}`

By freezing upstream Git hashes, audio/sprite binary digests, font checksums, and headless browser binaries, the stamped episode acts as a permanent, executable software release. When rendered through Remotion (--gl=swangle \--concurrency=1) on Rig 1, the composition produces bit-identical video masters across years of infrastructure updates.

---

*User prompt: {{FOCUS: Source-Baking (goblin-viewport-template)}} /extreme-details*

Response: Source-baking is the foundational architectural mechanism within goblin-viewport-template that replaces runtime media-player interpretation with build-time React code generation. It was implemented to resolve the "historical corruption trap" found in legacy pipelines. In a dynamic pipeline, long-lived generic renderers ingest mutable scene.json payloads at runtime, meaning that if a shared component like GoblinPuppet.tsx or a camera easing curve is updated for a newer episode, re-rendering an older episode causes silent visual regressions (e.g., mouth visemes detaching from chin lines or camera zooms decapitating characters).

The source-baking pattern ensures that a generator metaprogram (generate-episode-repo.ts) consumes narrative ASTs, acoustic timings, and visual asset contracts to stamp out an isolated, self-contained directory inside goblin-episodes/ per episode.

### **1\. Upstream Contract Ingestion & Temporal Quantization**

The generator metaprogram takes three strict inputs before generating source code: the narrative AST (dialogue\_ast.json), the visual asset contracts (manifest.json), and the timing manifest (exposure\_sheet.json).

Because generative models and animation scripts possess no innate sense of biological cadence, the system treats audio as the non-negotiable master clock. Continuous physical time from synthesized .wav speech stems (measured via ffprobe) is quantized into discrete 24 fps video frames at generation time using the following ceiling function:

target\_frames=⌈(1000duration\_ms​)×24⌉

This derived integer frame budget is written directly into the source code, preventing any sub-frame floating-point drift across long compositions.

### **2\. Static Compilation & Literal Printing**

Instead of using runtime .map() expressions to iterate over JSON arrays, the compiler translates the abstract state into a concrete TypeScript component tree (Episode\_XXX.tsx) utilizing hardcoded JSX literals.

> * **Unquoted Numeric Literals:** Frame boundaries, volume curves, and anchor coordinates are printed as pure numbers (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>), never as parsed strings, which eliminates type-casting errors inside the Remotion engine.  
> * **Absolute Timeline Anchoring:** Stems are never chained dynamically end-to-end. Every sequence is pinned to an explicitly pre-calculated absolute integer frame offset, neutralizing cumulative rounding errors:  
>   start*k*​\=*i*\=1∑*k*−1​duration*i*​  
> * **Sequence-Relative Scoping:** Calling useCurrentFrame() at the Remotion composition root causes subsequent shots to evaluate camera curves against global scene time, breaking multi-shot sequences. The compiler circumvents this by wrapping each cut in an isolated shot sub-component, ensuring useCurrentFrame() evaluates locally from frame 0\.  
> * **Coordinate Normalization Math:** To guarantee that crash zooms track facial targets accurately without screen distortion, local character sprite coordinates (1024×1024) are mathematically projected onto the master canvas space (1920×1080) at bake time. Factoring in the puppet's active scale factor (*s*), the values are injected directly into the camera wrapper's inline style.transformOrigin:  
>   originXglobal​\=canvas.widthpuppet.x+(anchor.x×*s*)​×100%  
>   originYglobal​\=canvas.heightpuppet.y+(anchor.y×*s*)​×100%

### **3\. Component Boundary Isolation**

The generated source file remains vulnerable if it relies on relative imports from sibling repositories (e.g., import { GoblinPuppet } from '../../goblin-viewport/...'), as subsequent updates to those shared files will still leak runtime volatility into the baked episodes. To eliminate this "Shared-Component Import Leak", the compiler isolates components using one of three boundaries:

> 1. **Component Vendoring:** The generator physically copies the required presentation primitives directly into the episode's components/ directory at bake time.  
> 2. **Immutable Package Registries:** The episode imports primitives via pinned, immutable semantic package releases (e.g., @studio/viewport@1.4.2).  
> 3. **Git Submodule Commit Locking:** Shared viewports are pinned to an immutable 40-character Git commit SHA.

### **4\. The Cryptographic Sealed-File Lifecycle (The "Eject Button")**

Because the source-baked output is a readable .tsx file, human directors can perform manual interventions (the "Eject Button")—such as hand-tuning a camera spring easing curve or splicing an SVG filter—without altering shared engine code. To protect these manual edits from being clobbered by automated upstream pipeline regenerations, the system utilizes a cryptographic file header.

The header computes a SHA-256 hash over the normalized LF text body of the file and defines three lifecycle states:

`// @lifecycle: generated | patched | locked`  
`// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde...`  
`// @patch_history: ["QA-EP040-SH01-ZOOM_ALIGN"]`

> * **@lifecycle: generated:** Stamped by the compiler upon initial generation; CI merges clean builds automatically.  
> * **@lifecycle: patched:** Modified by automated diagnostic repair agents (like the Jules coding agent) using the TypeScript Compiler API (ts-morph) for targeted AST surgery; permissible only if diffs confirm changes are strictly bounded.  
> * **@lifecycle: locked:** Manually adjusted by a human director.

When regeneration is requested, the generator compares the embedded checksum against the on-disk body's SHA-256. If the file is marked @locked, or if the hashes mismatch (indicating human editing), the generator refuses to overwrite the file. Instead, it safely emits an Episode\_XXX.candidate.tsx file beside the existing one and halts, while the manual edit triggers an immutable DIRECTOR\_OVERRIDE event into the historical log.

### **5\. Provenance Manifest Sealing**

The final action of the source-baking process is emitting an immutable lockfile, render\_manifest.json, making the episode a permanent, executable software release. The build identity is mathematically rooted as a cryptographic tuple:

Build ID=H(Canon+Ledger State+AST+Assets+Container Digest+Toolchains)

The manifest freezes the Git commit SHAs of worker-sower-engine, goblin-bible, and goblin-assets-visual; the SHA-256 digests of specific visual sprites and acoustic stems; and the complete runtime environment, including the headless Chromium milestone, Node version, FFmpeg build, font checksums, and container digests.

---

*User prompt: {{FOCUS:The Deletion Principle Boundary (goblin-viewport-template)}} /extreme-details*

Response: The Deletion Principle Boundary establishes a strict operational partition within the studio architecture: if every generative model (LLMs, diffusion checkpoints, voice models) is permanently deleted, the narrative universe must remain logically consistent and structurally intact within its relational ledger. However, while the narrative state is model-independent, the resulting artifacts composited by goblin-viewport-template fall on the opposite side of this boundary, classifying them as irreplaceable, archive-dependent media.

### **The Epistemic Partition**

The architecture divides the system into two distinct epistemological domains:

> * **The Narrative Ledger (Model-Independent Reality):** Canon entities, facts, state vectors, and dependency graphs reside in relational SQLite/D1. This state is a primary asset reconstructible from pure source code and event logs. Its consistency is bounded strictly by explicitly declared rules, check constraints, foreign keys, and pre-flight SAT solvers. It survives the total destruction of all machine learning models.  
> * **The Media Archive (Archive-Dependent Artifacts):** Latent video plates, keyed alpha WebMs, and synthesized WAV stems are stored in content-addressed R2 storage. These assets cannot be regenerated deterministically and require active physical maintenance and validation drills.

### **Media Asymmetry & Generative Irreproducibility**

Within this framework, media artifacts (such as Remotion compositions, rendered MP4s, and exposure sheets) are treated strictly as projections of truth, never the truth itself. Modifying a media projection—like adjusting camera easing or re-recording a line—alters an editorial view, but it does not retroactively mutate the underlying narrative event or historical world state.

Because non-deterministic CUDA floating-point variances, latent sampling differences, container revisions, and GPU driver patches introduce mathematical chaos, it is impossible to regenerate diffusion plates bit-for-bit from seeds alone. Consequently, generated media acts as physical evidence rather than a reproducible state. It must be archived via content-addressed storage (CAS), version-pinned, and scrubbed continuously alongside the code.

### **Spatial Isolation**

To protect this boundary, the upstream goblin-spatial engine strictly separates geometric realities from presentation data. The spatial engine is structurally forbidden from knowing about Remotion, camera easing, pixel coordinates, dialogue, or LLMs. If a concept does not belong in pure spatial reasoning, it is deleted from the spatial layer entirely, ensuring that Remotion compositor pixels never corrupt the model-independent truth.

### **3-2-1 Archive Preservation & Active Auditing**

Because the visual plates and audio stems are archive-dependent, the physical storage infrastructure requires rigorous preservation policies to prevent bit rot and data loss.

> * **3-2-1 Backup Enforcement:** The system maintains 3 copies (local NVMe working storage on Rig 1, warm Cloudflare R2 object storage, and cold AWS Glacier or Backblaze B2), spread across 2 media types, with 1 geographically isolated offsite replica utilizing object locking.  
> * **Rolling Range Cursor Scrubbing:** Randomly sampling 5% of assets with replacement leaves roughly 36.8% of the archive unchecked over a 20-week cycle due to the *e*−1 limit. To counter this, a background scrubber uses a deterministic, hash-ordered cursor to verify the cryptographic SHA-256 checksums across 100% of archived objects every 30 days.  
> * **Scheduled Cold-Restore Drills:** On the 15th of every month, an automated worker restores a complete historical scene assembly from raw R2 bytes into a clean isolate. The worker compiles the Remotion composition and confirms that the output frame hashes perfectly match the original broadcast manifest, proving the archive remains structurally intact and executable.

---

*User prompt: {{FOCUS: 3\. Intermediate Representations & The Multi-Resolution Bridge (goblin-viewport-template)}} /extreme-details*

Response: The Deletion Principle Boundary establishes the fundamental epistemic partition within the studio's architecture: if every generative neural network, prompt transcript, and inference worker is permanently deleted, the universe must remain logically and referentially intact within its relational ledger. Within this framework, generative models (such as LLMs, diffusion models, and speech synthesizers) are stripped of all narrative, spatial, and temporal authority. They function strictly as untrusted, headless execution workers bounded by deterministic contracts, enforcing the architectural axiom that probabilistic systems propose and execute, but deterministic systems decide what is allowed to be true.

This boundary divides the production environment into two strict ontological domains:

> * **The Narrative Ledger (Model-Independent Reality):** The canonical rules, physical invariants, and materialized dynamic facts (such as somatic trauma, spatial coordinates, and paranoia meters) live entirely independent of AI generation, managed transactionally via SQLite or PostgreSQL. This state is reconstructible and mathematically pure.  
> * **The Media Archive (Archive-Dependent Artifacts):** The outputs compiled by goblin-viewport-template—including Remotion TSX compositions, synthesized audio stems, and rendered diffusion plates—fall on the opposite side of the boundary. Because non-deterministic GPU kernel execution and latent sampling prevent bit-identical re-synthesis of diffusion plates from mathematical seeds alone, these media assets cannot be deterministically regenerated on demand. Consequently, generated media assets are considered irreplaceable and must be preserved in content-addressed cold storage.

### **Unidirectional Information Flow & Edit Boundaries**

The system acts as an event-sourced, deterministic media compiler rather than a standard AI video generator, sealing its output as an auditable historical artifact. To protect the Deletion Principle Boundary, information is forced to flow strictly one way: World→Plan→Expression→Timing→Presentation→Archive.

This unidirectional pipeline explicitly partitions how human interventions and edits are handled:

> * **Representation Edits (Safe):** Media projections never mutate state. Adjusting visual parameters like camera easing curves, visual crop margins, or color grading lookup tables (LUTs) remains entirely local to the presentation source code (e.g., Episode\_XXX.tsx). No downstream media layer, including Remotion TSX files, FFmpeg filtergraphs, or MP4 masters, is permitted to feed back into the narrative ledger without an explicit, auditable transaction.  
> * **Meaning Edits (Ledger-Bound):** Any modification to narrative meaning—such as altering character actions, changing emotional beats, or modifying dialogue lines—cannot be hacked into the compositing layer. These changes must be routed upstream through the Scene Plan and Dialogue AST, forcing a complete downstream re-compilation that formally updates the immutable state log.

---

*User prompt: {{FOCUS: The Canonical Machine IR (dialogue\_ast.json) (goblin-viewport-template)}} /extreme-details*

Response: The Canonical Machine IR (Intermediate Representation), codified as dialogue\_ast.json, is the absolute connective tissue binding the meaning generated by worker-sower-engine to the representation rendered by goblin-viewport-template. It replaces traditional human-readable screenplays with a strictly typed, machine-executable schema that serves as the single source of truth for the entire downstream generative pipeline.

Within this architecture, prose is treated as a human-facing byproduct; the AST is the canonical contract. Downstream tools (TTS, ComfyUI, Remotion) never parse free prose or .fountain files. If a human editor alters a line in the .fountain screenplay, the build fails immediately unless the AST is programmatically synchronized, enforcing strict verbatim parity.

### **The Anatomy of the Dialogue AST Schema**

The JSON payload is structurally divided into global scene metadata and an ordered array of discrete execution blocks (beats or lines), enforcing deterministic causality:

`{`  
  `"$schema": "https://specs.studio.internal/schemas/v3/dialogue_ast.json",`  
  `"schema_version": "3.2.0",`  
  `"compiler_version": "2.4.1",`  
  `"episode_id": "EP040",`  
  `"scene_id": "ep040_sc03",`  
  `"state_snapshot_hash": "sha256:7f83b165...",`  
  `"lines": [`  
    `{`  
      `"line_id": "line_001",`  
      `"speaker": "BOG",`  
      `"dialogue_text": "The relay is dead. Don't touch the brass siphon.",`  
      `"subtext": "Bog cannot admit he broke the valve while attempting to flee.",`  
      `"conditions": ["humiliated", "brachial_plexus_severed"],`  
      `"motor_actions": ["RETREAT", "POINT_SINGLE_HAND"],`  
      `"reaction_cue": "VISCERAL_STING",`  
      `"pacing_scalar": 1.0`  
    `}`  
  `]`  
`}`

#### **1\. The Hashed State Snapshot (state\_snapshot\_hash)**

When the Sower compiles an AST, it burns the exact root hash (*H*root​) of the relational ledger into the header.

> * **Dependency Locking:** This prevents desynchronization across the pipeline. The exposure sheet and Remotion compositions verify that asset manifests and audio durations match this sealed state.  
> * **Invalidation Sweeps:** If an author applies a retrospective canon errata (e.g., Bog’s old injury was his left leg, not his right arm) that alters the upstream DAG, the resulting change in *H*root​ exposes the mismatch, triggering the DAG engine to mark all downstream ASTs and compiled media referencing that fact as dirty for remastering.

#### **2\. The Semantic Fields (Speech & Subtext)**

> * **dialogue\_text:** The literal string dispatched to the local TTS microservice (e.g., Parler-TTS or CosyVoice on port 8000\) for acoustic synthesis into .wav stems.  
> * **subtext (or parenthetical):** Captures the delta between the character's *Surface Want* (what they claim to be arguing about) and their *Actual Want* (the unadmitted existential wound). This drives directorial weighting and informs vocal inflection (e.g., dsp\_modifiers) without being spoken.  
> * **conditions (or emotion):** The precise emotional tag (e.g., "humiliated", "smug") that bridges meaning to representation. It must be drawn from a strict closed enum defined in world/conditions.md. In goblin-viewport-template, this key routes through the visual manifest API (e.g., characters/bog/manifest.json) to select the exact variants/bog\_humiliated.png file or \#00FF00 diffusion LoRA trigger.

#### **3\. Dual-Field Actions & The Panopticon Gauntlet**

Because LLMs struggle to respect physical constraints consistently in flowing prose, the AST employs a **Dual-Field Extraction** mechanism:

> * **motor\_actions / extracted\_motor\_actions:** Alongside the spoken dialogue, the LLM emits an explicit array of discrete kinetic verbs (e.g., \["RETREAT", "HIDE\_LIMB"\]).  
> * **The *T*0​ Somatic Invariant Linter:** Before the AST is accepted, the engine runs an *O*(1) set-intersection check against the character's active banned\_kinetic\_verbs mask (derived from their current somatic trauma ledger). If the AST proposes a two-handed action (\["HOLD\_ITEM\_DOUBLE"\]) for a character with a paralyzed\_arm condition, the draft is instantly rejected at zero GPU cost.

#### **4\. Causality Enforcement: Dwight Swain's MRU (reaction\_cue)**

To prevent models from generating passive prose or inverted causality (e.g., "Feeling terrified, she heard the explosion"), the AST explicitly models Dwight Swain's Motivation-Reaction Unit (MRU).

> * **The Rule:** Sensory stimulus must trigger an involuntary reflex, which precedes conscious thought, which precedes the spoken motor action.  
> * **AST Mapping:** When an AST node declares an emotional beat (e.g., reaction\_cue: "VISCERAL\_STING"), it directly dictates temporal geometry in goblin-viewport-template. The generator metaprogram burns an explicit 12-to-24 frame visual reaction window (a pre-roll hold or subtle camera push-in) *before* mounting the synthesized .wav audio stem. Dialogue never starts on frame 0 of an emotional turn.

### **Epistemic Sanitization (Ignorance by Omission)**

The dialogue within the AST is generated under strict **Ignorance by Omission** constraints. Characters must operate on their subjective belief vectors, which may contradict ground truth.

> * When assembling the LLM context envelope, the engine filters the lore through the acting character's Epistemic Vector.  
> * If Character B does not know a secret held by Character A, that fact is physically scrubbed from the prompt payload. The tokens do not exist in the context window, structurally preventing the model's attention heads from leaking the secret into the dialogue\_text of the AST.

---

*User prompt: {{FOCUS: 4\. Narrative Build System: Dependency DAG, Blast Radius, & Source-Baking Continuity as Cache Invalidation (goblin-viewport-template))}} /extreme-details*

Response: The Core State & Execution Model for goblin-viewport-template represents a fundamental rejection of the traditional dynamic media-player paradigm. Instead of maintaining a monolithic runtime application that ingests changing JSON payloads, it functions as a **metaprogramming compiler** that permanently locks semantic meaning into immutable, source-baked TypeScript execution code.

### **1\. The Metaprogramming Scaffolding Paradigm**

In legacy architectures, a single, long-lived generic renderer (goblin-viewport) would dynamically load external scene.json payloads on the fly. This created the **historical corruption trap**: if shared presentation components (like GoblinPuppet.tsx or camera dampening curves) were refactored for Episode 040, attempting to re-render Episode 012 against the updated codebase caused silent regressions (e.g., visemes detaching, crash zooms misaligning).

To resolve this, the architecture transitioned to goblin-viewport-template. This repository is **never an episode runtime target**; it is solely a compiler and a scaffolding blueprint.

> * **Per-Episode Workspaces:** A generator script (generator/generate-episode-repo.ts) ingests upstream data and stamps out a dedicated, permanently isolated workspace inside the goblin-episodes/ repository (e.g., goblin-episodes/episode-040/).  
> * **Component Boundary Isolation:** To prevent upstream modifications from causing regressions, presentation primitives (like GoblinPuppet.tsx) are either vendored directly into the stamped episode directory, pinned to an immutable semantic package release (e.g., @studio/viewport@1.4.2), or locked to an explicit Git commit SHA.  
> * **Central Ruleset Linkage:** The template inherits formatting invariants from goblin-config via devDependencies ("goblin-config": "file:../goblin-config"), avoiding local rule divergences.

### **2\. The Source-Baking Ingestion Pipeline**

The metaprogram compiler (generate-episode-repo.ts) translates abstract upstream state into unquoted TypeScript code. It takes three primary inputs:

> 1. **Machine Dialogue AST (dialogue\_ast.json):** From worker-sower-engine, defining lines, speaker IDs, conditions, and reaction cues.  
> 2. **Timing Manifest (exposure\_sheet.json):** Emitted by the audio orchestrator, defining absolute millisecond durations and integer frame allocations.  
> 3. **Visual Asset Contracts (manifest.json):** From goblin-assets-visual, establishing anatomical anchors, crash zoom targets, and motion scalars.

#### **Literal Value Inlining**

Standard web applications iterate over data using .map() loops. goblin-viewport-template rejects this, explicitly parsing data at compile time and burning the results into a static TSX file (e.g., Episode\_040.tsx) as **hardcoded raw literals**:

> * **Unquoted Integer Bounds:** Sequences receive raw numeric attributes (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>), eliminating runtime string parsing and type-coercion.  
> * **Absolute Timeline Pointers:** Audio stems and cuts are never concatenated dynamically. Each cut begins at a precomputed absolute frame offset: fromFrame*k*​\=∑*i*\=1*k*−1​shot\_duration*i*​. Furthermore, every cut is wrapped in an isolated subcomponent, ensuring useCurrentFrame() evaluates locally from 0\.  
> * **Normalized Origin Projection:** Local character sprite dimensions (1024×1024) are mathematically projected onto the master canvas (1920×1080) factoring in the puppet's scale (*s*):  
>   originX=canvas.widthpuppet.x+(anchor.x×*s*)​×100%  
>   originY=canvas.heightpuppet.y+(anchor.y×*s*)​×100%  
>   These resolved percentages are baked directly into inline style.transformOrigin, bypassing dynamic math during the headless CPU render.

### **3\. The Cryptographic Sealed-File Lifecycle (The "Eject Button")**

Human directors must be able to manually tweak presentation details (like camera easing curves or SVG filters) in the generated .tsx file without their work being clobbered by subsequent automated pipeline regenerations. This is governed by a cryptographic header lifecycle:

> 1. **@lifecycle: generated:** Stamped by the compiler with a SHA-256 body checksum upon initial execution.  
> 2. **@lifecycle: patched:** Modified by automated CV repair agents. The CI pipeline validates these patches by confirming the AST diff is strictly confined to whitelisted JSX properties.  
> 3. **@lifecycle: locked:** Manually edited by a director. When the upstream generator re-runs, it reads the header. If it detects the @locked tag or a checksum mismatch (proving human intervention), it safely emits Episode\_040.candidate.tsx and halts, refusing to overwrite the original. Every manual edit emits an auditable DIRECTOR\_OVERRIDE event to the historical ledger.

### **4\. Manifests & Asset Contracts**

> * **The Explicit Null Protocol:** Missing visual variants in the manifest.json are declared explicitly as null (e.g., "terrified": null). In draft mode, this defaults to base\_states.idle; in broadcast builds, it acts as a fail-loud gate, terminating compilation with exit code 1 unless explicitly waived.  
> * **The Provenance Root (render\_manifest.json):** Emitted alongside the .tsx file, this artifact proves the episode's build identity. It freezes the Git SHAs of all dependencies, binary hashes of acoustic and visual assets, and the exact headless execution environment (Chromium, Node, FFmpeg, font checksums), making the stamped directory a permanent, executable software release.

---

*User prompt: {{FOCUS : Source-Baking Compilation (goblin-viewport-template) }} /extreme-details*

### **Response: Core Architectural Philosophy & The Historical Corruption Trap**

The **Source-Baking Compilation** model implemented within goblin-viewport-template represents a fundamental shift away from traditional dynamic runtime media players. In legacy rendering architectures (goblin-viewport), a single long-lived application dynamically ingested mutable scene.json payloads at runtime, evaluating arrays and variables on the fly.

This dynamic model created the **historical corruption trap**: whenever shared presentation components (such as GoblinPuppet.tsx or camera easing curves) were updated to support newer episodes, attempting to re-render earlier episodes caused silent visual regressions—such as mouth visemes detaching from chin baselines, crash zooms misaligning, and timing rubber-banding.

goblin-viewport-template resolves this by transforming the viewport from a *runtime interpreter* into an *offline code-generation compiler*. The template repository itself is never executed directly as an episode runtime target; instead, an orchestration script stamps out an isolated, self-contained, and permanently committed workspace inside goblin-episodes/ per episode.

### **Upstream Ingestion Contracts & Temporal Quantization**

Before emitting any source code, the compiler ingests three immutable upstream contracts from local disk:

> * **The Dialogue AST (dialogue\_ast.json):** Emitted by worker-sower-engine, declaring spoken lines, speaker identifiers, emotional condition tags (e.g., humiliated, defensive), and Swain Motivation-Reaction Unit (MRU) reaction cues (VISCERAL\_STING).  
> * **The Quantized Timing Manifest (exposure\_sheet.json):** Derived from ffprobe sweeps of uncompressed speech .wav stems synthesized by the audio microservice. Because physical audio duration is continuous (measured in milliseconds) while video timelines are discrete (quantized to 24 fps), continuous sound is quantized into integer frame budgets:  
>   target\_frames=⌈(1000duration\_ms​)×24⌉  
> * **Visual Asset Contracts (manifest.json):** Read from goblin-assets-visual, supplying explicit coordinate pairs for ground contact pivots (anchor\_point), facial focus targets (camera\_anchor\_points.crash\_zoom\_target), mouth viseme bounding boxes (mouth\_bounding\_box), and puppet motion scalars (talk\_bounce\_amplitude).

### **The Generator Metaprogram (generate-episode-repo.ts)**

The compilation process is orchestrated by generator/generate-episode-repo.ts, which automates the transformation of abstract narrative and timing data into concrete React source code (Episode\_XXX.tsx).

| Pipeline Stage | Input Artifact | Processing Action | Output Deliverable |
| :---- | :---- | :---- | :---- |
| **1\. Ingestion & Quantization** | dialogue\_ast.json, exposure\_sheet.json | Computes integer frame targets via ceiling math and absolute cumulative offsets. | Bounded temporal budget |
| **2\. Spatial Resolution** | manifest.json | Maps character conditions to sprite assets and projects local anchor coordinates. | Grounded transform matrices |
| **3\. Asset Pruning** | Scene AST, Asset Registry | Executes collect-episode-assets.ts to strip unused textures, enforcing a \<100MB budget. | Pruned episode asset folder |
| **4\. Code Generation** | Template Primitives | Inlines literal JSX numbers, wraps shots in isolated sub-components, and stamps headers. | Episode\_XXX.tsx |
| **5\. Provenance Sealing** | Git SHAs, Binary Digests | Computes body checksums and emits render\_manifest.json. | Immutable build lockfile |

### **Literal Inlining, Absolute Anchoring, & Hook Scoping**

To eliminate runtime overhead and avoid type-coercion errors inside Remotion, the compiler avoids dynamic .map() loops over JSON data in favor of static literal printing:

> * **Unquoted Numeric Literals:** Frame boundaries and ducking values are printed as pure numbers (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>), never as parsed string values (durationInFrames="{75}").  
> * **Absolute Integer Timeline Anchoring:** Stems are never concatenated sequentially end-to-end at render time. Because ceiling calculations introduce up to 41.7 ms of tail silence per shot, chaining stems linearly would accumulate timing drift against continuous background tracks. The exposure sheet assigns each dialogue stem an absolute starting frame index computed upfront:  
>   fromFrame*k*​\=*i*\=1∑*k*−1​total\_shot\_frames*i*​  
> * **Sequence-Relative Hook Scoping:** Calling useCurrentFrame() at the Remotion composition root causes subsequent shots to evaluate camera curves against global scene time, breaking multi-shot sequences. The metaprogram avoids this by generating isolated shot sub-components for each cut, guaranteeing that useCurrentFrame() evaluates locally from frame 0 within every \<Sequence\>.

### **Coordinate Space Normalization & Transform Origin Mathematics**

A major class of bugs in automated animation pipelines is the **Silent Decapitation Bug**, caused by naively mapping sprite-local coordinates directly onto master canvas dimensions.

> * **Local Sprite Space vs. Canvas Space:** A sprite-local anchor (e.g., *x*\=412 in a 1024×1024 sprite canvas) cannot be divided by the master scene width (1920px) without throwing zoom framing off-center.  
> * **Projected Transform Origin Math:** The generator normalizes local puppet coordinates into master canvas space (1920×1080) at bake time by factoring in the puppet's scale factor (*s*) and stage translation:  
>   originXglobal​\=canvas.widthpuppet.x+(anchor.x×*s*)​×100%  
>   originYglobal​\=canvas.heightpuppet.y+(anchor.y×*s*)​×100%  
> * **Injection:** These resolved percentages are injected directly into the camera wrapper's inline style.transformOrigin, allowing Remotion's interpolate() engine to execute smooth push-ins centered on the character's facial centroid without runtime coordinate lookups.

### **Component Boundary Isolation & Asset Pruning**

To ensure that episodes remain self-contained and immune to upstream repository refactoring, the compilation process enforces strict boundaries:

> * **Component Boundary Isolation:** Relative imports from active sibling repositories (e.g., import { GoblinPuppet } from '../../goblin-viewport/...') are prohibited. The generator resolves this via **Component Vendoring** (copying required presentation primitives directly into episodes/epXXX/components/ at bake time), immutable semantic package pinning (@studio/viewport@1.4.2), or Git commit SHA locking.  
> * **Asset Pruning (collect-episode-assets.ts):** Full character asset repositories contain expansive emotion banks that exceed gigabyte scales. To enforce an episode storage ceiling under 100MB to 150MB, the pre-flight asset collector parses the scene AST and copies *only* the specific background mattes, sprite poses, and mouth overlays required for that episode into local storage.

### **The Cryptographic Sealed-File Lifecycle & The "Eject Button"**

Human artistic intervention is an inevitable operational reality. When a director opens Episode\_040.tsx to manually tune a camera spring curve or insert an SVG filter, the compiler protects these adjustments through a cryptographic file header state machine:

`// @lifecycle: generated | patched | locked`  
`// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f`  
`// @patch_history: ["QA-EP040-SH03-VISEME_ALIGN"]`  
```` ```[cite: 2, 7, 12] ````

`* **State Definitions:**`  
  ``* `@lifecycle: generated`: Stamped automatically by the compiler with a SHA-256 body checksum upon initial generation[cite: 2, 12].``  
  ``* `@lifecycle: patched`: Modified by automated diagnostic repair agents (e.g., Jules CV alignment) and validated strictly against whitelisted JSX property diffs[cite: 2, 12].``  
  ``* `@lifecycle: locked`: Manually edited by a human director (the "Eject Button")[cite: 2, 12].``  
``* **Collision Protection Protocol:** When upstream narrative state changes and the generator re-runs, it inspects the header[cite: 2, 12]. If the file is marked `@locked` or the body checksum mismatches, the generator refuses to overwrite the file; instead, it safely emits `Episode_XXX.candidate.tsx` and halts, while emitting an immutable `DIRECTOR_OVERRIDE` event to the historical ledger[cite: 2, 12].``

`---`

``### Provenance Sealing (`render_manifest.json`)``

``The final output of the source-baking process is `render_manifest.json`, an immutable build lockfile placed at the root of the stamped episode directory[cite: 1, 2, 4]. The build identity is mathematically defined as a cryptographic tuple freezing:``  
``* The exact Git commit SHAs of `worker-sower-engine`, `goblin-bible`, and `goblin-assets-visual`[cite: 1, 2, 4].``  
`* The SHA-256 binary digests of all referenced acoustic stems and visual sprites[cite: 1, 2, 4].`  
`* The complete headless execution environment, including container digests, Node version, Remotion build, Chromium milestone, FFmpeg binaries, and font file checksums[cite: 1, 2, 4].`

`By sealing these dependencies, the stamped episode acts as a permanent, executable software release capable of rendering bit-identical video masters across years of infrastructure updates[cite: 1, 2, 4].`

---

*User prompt: {{FOCUS: 5\. Generator Snapshot Rigor (goblin-viewport-template)}} /extreme-details*

Response: **Generator Snapshot Rigor** in goblin-viewport-template is the automated verification framework that prevents non-deterministic drift, runtime corruption, and silent regressions during code generation. Because the repository functions as an offline metaprogramming compiler rather than a dynamic media player, every stamped episode (Episode\_XXX.tsx) must be an immutable, type-safe, and byte-reproducible React component tree. Snapshot rigor ensures that identical upstream narrative, acoustic, and visual contracts consistently compile into identical TypeScript source code.

### **Architectural Purpose & The Determinism Thesis**

In dynamic rendering pipelines, playback engines evaluate mutable JSON payloads at runtime. When shared components, animation curves, or math libraries change, previously approved episodes suffer from silent regressions—such as mouth visemes detaching from chins, zoom framings drifting, or timing rubber-banding.

goblin-viewport-template addresses this via the **Source-Baking Pattern**, where all timeline calculations, layout coordinates, audio ducking curves, and component bindings are resolved at build time and printed as static literals inside Episode\_XXX.tsx. Generator snapshot rigor treats the code generator (generator/generate-episode-repo.ts) as a compiler requiring mathematical proof of purity:

Episode Source=G(AST,Exposure Sheet,Asset Manifests,Style Rules)

If an identical set of input contracts is supplied to generator G, the emitted TypeScript AST must produce identical bytes across different environments.

                     `UPSTREAM CONTRACTS`  
  `┌───────────────────────┬────────────────────────┬──────────────────────┐`  
  `│   Machine Dialogue    │    Quantized Timing    │     Visual Asset     │`  
  `│   AST (dialogue_ast)  │  (exposure_sheet.json) │   (manifest.json)    │`  
  `└───────────┬───────────┴───────────┬────────────┴──────────┬───────────┘`  
              `│                       │                       │`  
              `└───────────────────┐   │   ┌───────────────────┘`  
                                  `▼   ▼   ▼`  
                     `┌─────────────────────────┐`  
                     `│ generator/              │`  
                     `│ generate-episode-repo.ts│`  
                     `└────────────┬────────────┘`  
                                  `│`  
                                  `▼`  
                     `┌─────────────────────────┐`  
                     `│ GENERATOR SNAPSHOT      │`  
                     `│ RIGOR GATE              │`  
                     `├─────────────────────────┤`  
                     `│ 1. Zero-Nondeterminism  │`  
                     `│    AST Lint Suite       │`  
                     `│ 2. Conformance Harness  │`  
                     `│ 3. Sealed Header Check  │`  
                     `│ 4. Pre-Flight Disk Gate │`  
                     `└────────────┬────────────┘`  
                                  `│ Pass (Exit Code 0)`  
                                  `▼`  
                     `┌─────────────────────────┐`  
                     `│ goblin-episodes/epXXX/  │`  
                     `│ • Episode_XXX.tsx       │`  
                     `│ • render_manifest.json  │`  
                     `└─────────────────────────┘`

### **The Generator Lint Suite: Zero Runtime Non-Determinism**

Before any emitted file is committed or rendered, it must pass a specialized AST static analysis suite enforced via the TypeScript Compiler API (tsc \--noEmit) and custom ESLint rules. The linter treats any vector of runtime ambiguity or ambient environment access as a fatal build failure:

> * **Numeric JSX Literals:** All frame numbers, durations, coordinate positions, and audio gain values must be printed as raw numeric literals (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>), strictly prohibiting quoted strings (durationInFrames="75") to avoid runtime type coercion.  
> * **Sequence-Relative Hook Isolation:** Remotion’s useCurrentFrame() hook is barred from the composition root. Evaluating the frame hook at the top level causes multi-shot sequences to evaluate camera curves against global scene time. The generator must wrap every cut in an isolated camera sub-component (e.g., \<Shot01CameraWrapper\>), ensuring useCurrentFrame() evaluates locally from frame 0 within every \<Sequence\>.  
> * **Strict Ambient API Ban:** The component tree must remain a pure function of frame index. The generator AST linter terminates compilation if any of the following calls appear inside generated component files:  
  * Math.random() (violates PRNG seed lineage).  
  * Date.now() or new Date() (ambient clock leakage).  
  * fetch() or network sockets (breaks offline sandboxing).  
  * fs or Node.js runtime filesystem access inside client components.  
> * **Component Boundary Resolution:** Relative path traversal escaping the episode boundary (such as import { GoblinPuppet } from "../../../goblin-viewport/...") is prohibited. Imports must resolve either to local vendored source inside components/ or to a pinned, immutable semantic package release (e.g., @studio/viewport@1.4.2).  
> * **Static File & Asset Digest Audit:** Every staticFile() URI inside the TSX must point to a file that physically exists in the staged asset directory and whose binary SHA-256 matches the manifest entry.  
> * **Closed Easing Enumeration:** Camera pan/zoom transitions and viseme tweens cannot evaluate arbitrary continuous bezier curves or ad-hoc mathematical functions; they must reference an approved, closed string enum (e.g., "linear", "quadOut", "cubicInOut") implemented within the pinned engine.

### **Conformance Test Matrix & Golden Snapshot Harness**

The generator repository maintains an automated snapshot regression suite that tests the generator itself against fixed golden fixtures:

`describe("generate-episode-repo snapshot rigor", () => {`  
  `it("emits byte-identical TSX from deterministic AST fixtures", async () => {`  
    `const fixtureAst = loadFixture("dialogue_ast_ep040.golden.json");`  
    `const fixtureExposure = loadFixture("exposure_sheet_ep040.golden.json");`  
    `const fixtureManifest = loadFixture("manifest_ep040.golden.json");`

    `const resultTsx = await generateEpisodeSource({`  
      `ast: fixtureAst,`  
      `exposureSheet: fixtureExposure,`  
      `manifest: fixtureManifest,`  
    `});`

    `const goldenTsx = fs.readFileSync("test/golden/Episode_040.golden.tsx", "utf-8");`  
    `expect(resultTsx).toBe(goldenTsx);`  
  `});`  
`});`

#### **The Four Conformance Test Cases**

                                  `INCOMING REGENERATION RUN`  
                                             `│`  
                                             `▼`  
                              `Read Existing File on Disk`  
                                             `│`  
                     `┌───────────────────────┴───────────────────────┐`  
                     `▼                                               ▼`  
         `File Header: @generated                        File Header: @locked`  
                     `│                                               │`  
          `Compute Body Checksum                                      │`  
                     `│                                               │`  
         `┌───────────┴───────────┐                                   │`  
         `▼                       ▼                                   │`  
   `Body Hash Matches      Body Hash Mismatches                       │`  
         `│                       │                                   │`  
         `▼                       ▼                                   ▼`  
 `[CASE 1: IDEMPOTENT NO-OP]  [CASE 3: DOWNGRADE TRAP]   [CASE 2: PROTECTED COLLISION]`  
 `Clean In-Place Overwrite    Strip @generated Tag;       Halt Overwrite Immediately;`  
 `(Zero Diff / Zero Drift)    Downgrade to Candidate;     Emit Episode_XXX.candidate.tsx;`  
                             `Log Tamper Alert            Log DIRECTOR_OVERRIDE Event`

> 1. **Idempotent No-Op Case:** Re-running the generator against an existing, unmodified directory produces identical source bytes. Git status reports zero modified lines (git diff \--exit-code exits 0), preventing extraneous commit noise.  
> 2. **Candidate Forking on Human Edits:** When an episode file on disk contains a modified checksum or an auteur intervention marker, running the generator halts immediately. The generator preserves the human-edited file and writes the newly compiled output to Episode\_XXX.candidate.tsx, exiting with a non-zero diagnostic warning.  
> 3. **The Downgrade Trap (Tamper Detection):** If a file is labeled @lifecycle: generated but its body hash does not match a fresh deterministic compile, the harness downgrades the file’s validity status. The build runner rejects the file, catching manual file tampering that skipped the proper override protocol.  
> 4. **Formatting & Line-Ending Invariance:** Because Windows (\\r\\n) and POSIX (\\n) newline representations yield divergent SHA-256 digests, the generator normalizes all outputs to Canonical LF (0x0A) line breaks before computing hashes. Automated Prettier and ESLint autofix scripts are excluded from generated episode directories via .prettierignore and .eslintignore to prevent stylistic formatting tools from invalidating body checksums.

### **The Sealed-File Lifecycle State Machine**

To support necessary director interventions without breaking downstream build pipelines, goblin-viewport-template uses a cryptographic sealed-file header:

`// @lifecycle: generated`  
`// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f`  
`// @upstream_ast: sha256:12c8a994ef...`  
`// @style_rules: v1.4.0`

`import React from 'react';`  
`import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';`  
`// ...`

| Lifecycle State | Target Author | Verification Rule | CI Merge Policy | Upstream Regeneration Behavior |
| :---- | :---- | :---- | :---- | :---- |
| **@lifecycle: generated** | Metaprogram Compiler (generate-episode-repo.ts) | Header checksum matches SHA-256(body). | Automatic merge pass. | Clean in-place overwrite permitted. |
| **@lifecycle: patched** | Diagnostic Repair Agent (e.g., Jules CV Agent) | AST diff touches only whitelisted JSX properties (e.g., bounding boxes). | Gated merge (requires AST check). | Alerts agent; requires diff review before write. |
| **@lifecycle: locked** | Human Director (The "Eject Button") | Signature authorized by showrunner key. | Manual approval gate. | **Hard Stop:** Emits .candidate.tsx. |

Whenever a human director modifies a locked file, the orchestration harness logs an append-only DIRECTOR\_OVERRIDE event into the narrative ledger. This audit record captures the editor ID, timestamp, line delta, and dramatic rationale, ensuring that manual overrides remain auditable rather than undocumented codebase mutations.

### **The Tripartite Reproducibility Protocol**

In goblin-viewport-template, bit-identical reproduction is treated as an empirical hypothesis requiring experimental falsification rather than an assumed guarantee:

                      `CANONICAL EXPERIMENTAL AUDIT`  
                        
 `┌──────────────────────┐                     ┌──────────────────────┐`  
 `│       RENDER A       │                     │       RENDER B       │`  
 `│   (Base Container)   │                     │  (Cold Environment)  │`  
 `└──────────┬───────────┘                     └──────────┬───────────┘`  
            `│                                            │`  
            `▼                                            ▼`  
      `Output Hash: X                               Output Hash: Y`  
            `│                                            │`  
            `└──────────────────┐     ┌───────────────────┘`  
                               `▼     ▼`  
                          `assert(X == Y)`  
                                `│`  
               `┌────────────────┴────────────────┐`  
               `▼ Pass                            ▼ Fail`  
        `BIT-IDENTICAL                     INVESTIGATION`  
      `Empirical Release                1. Semantic Drift?`  
                                       `2. Render Drift?`  
                                       `3. Packaging Drift?`

The system separates reproducibility into three discrete phases:

> 1. **Semantic Reproducibility:** Proves that identical relational state and seeds generate an identical Dialogue AST and Exposure Sheet.  
> 2. **Render Reproducibility:** Proves that running Remotion CLI under software OpenGL rasterization (--gl=swangle) on Rig 1 outputs identical raw visual frames and audio samples.  
> 3. **Packaging Reproducibility:** Proves that FFmpeg muxing combines identical raw streams into an identical final MP4 container. This phase guards against non-deterministic container timestamps, unpinned metadata tags, variable entropy tables, and codec version differences.

#### **Environmental Invariant Locks**

To prevent cross-platform rendering discrepancies, the execution container enforces strict runtime parameters:

> * **Timezone & Locale:** Environment variables are explicitly pinned to TZ=UTC and LC\_ALL=C.UTF-8. Floating-point parsing and string date formatting in JavaScript runtimes will otherwise vary across operating systems.  
> * **Software Rasterization:** Headless Chromium rendering is locked to \--gl=swangle (SwiftShader running on ANGLE) and \--concurrency=1. This eliminates GPU driver nondeterminism, avoids VRAM contention, and sidesteps multi-threaded frame interleaving bugs.  
> * **Binary Font Checksums:** All TrueType/OpenType files used for titles and captions are hashed and matched against expected checksums, preventing system-level font substitutions from shifting subtitle geometry.

### **Provenance Root: render\_manifest.json**

The final output emitted by the generator snapshot process is render\_manifest.json, an immutable build lockfile that roots the episode’s identity in a directed acyclic graph (DAG):

Build ID=H(Canon+State Snapshot+AST+Assets+Container Digest+Toolchains)  
`{`  
  `"build_id": "sha256:4f8a1209bc...",`  
  `"episode_id": "EP040",`  
  `"schema_version": "3.0.0",`  
  `"generated_at": "2026-09-28T15:44:00Z",`  
  `"target_source_file": "Episode_040.tsx",`  
  `"source_file_sha256": "7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",`  
  `"parents": {`  
    `"dialogue_ast_hash": "sha256:12c8a994ef7...",`  
    `"exposure_sheet_hash": "sha256:9c3e401b2a...",`  
    `"source_file_hash": "sha256:7bd4e10a2f...",`  
    `"canon_tree_sha": "git:9c3e401",`  
    `"assets_visual_tree_sha": "git:v1.4.0",`  
    `"viewport_template_sha": "git:4f8a120"`  
  `},`  
  `"acoustic_assets": {`  
    `"bog_sh01_3120ms.wav": "sha256:4a8c9e2b10a...",`  
    `"spleen_sh02_3375ms.wav": "sha256:9c1d8e3f4a..."`  
  `},`  
  `"visual_sprites_used": {`  
    `"bog_humiliated.png": "sha256:7f83b1657ff1...",`  
    `"spleen_defensive.png": "sha256:a3b4c5d6e7f8..."`  
  `},`  
  `"runtime_environment": {`  
    `"container_digest": "ghcr.io/studio/render-node@sha256:7b4a29...",`  
    `"node_version": "v20.12.0",`  
    `"remotion_version": "4.0.140",`  
    `"chromium_milestone": "122.0.6261.94",`  
    `"ffmpeg_build": "6.1.1-static",`  
    `"font_manifest": {`  
      `"Cinzel-Bold.ttf": "sha256:5a6b7c8d9e..."`  
    `}`  
  `},`  
  `"reproducibility_audit": {`  
    `"protocol": "visual_conformance_v2",`  
    `"double_render_status": "BIT_IDENTICAL",`  
    `"measured_ssim": 1.0,`  
    `"delta_e_max": 0.0`  
  `}`  
`}`

By capturing upstream source hashes, media asset digests, compiler logic, and the binary execution environment, the stamped episode is transformed from an ephemeral render into a verified, permanently executable software deliverable.

---

*User prompt: {{FOCUS: 7\. Presentation Compilation: Source-Baking & The Sealed-File Lifecycle (goblin-viewport-template)}} /extreme-details*

Response: Presentation compilation within goblin-viewport-template is an offline code-generation paradigm that replaces runtime media-player interpretation with static React source compilation. The repository goblin-viewport-template does not serve as an active episode runtime target; it functions as a metaprogramming compiler, component blueprint, and scaffolding engine that transforms upstream narrative, acoustic, and visual contracts into isolated, committed, and permanently reproducible workspaces inside goblin-episodes/ (e.g., goblin-episodes/episode-040/).

### **1\. Architectural Mandate: Eliminating the Runtime Player**

In legacy programmatic video rendering architectures (goblin-viewport), a long-lived application dynamically ingested mutable scene.json payloads at render time. The dynamic player model inevitably triggered the **historical corruption trap**:

`THE HISTORICAL CORRUPTION TRAP (LEGACY DYNAMIC RUNTIME)`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ Month 0:  Episode 012 rendered against Shared Viewport v1.0.0          │`  
`│           • Result: Frame 144 viseme aligned, crash zoom target exact. │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Month 6:  Viewport refactored to v1.4.0 for Episode 040                │`  
`│           • Altered camera spring dampening curves in GoblinPuppet.tsx │`  
`│           • Refactored transform-origin logic for tall character rigs │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Re-render Episode 012 against Viewport v1.4.0                          │`  
`│           • SILENT REGRESSION: Visemes detach from chin baseline,      │`  
`│             camera zooms decapitate characters, timing rubber-bands.   │`  
`└────────────────────────────────────────────────────────────────────────┘`

When shared React layout primitives, camera easing equations, or viseme snapping components evolved to accommodate newer scenes, the runtime interpreter shifted beneath the existing media archive. Re-rendering an older episode against

---

*User prompt: {{FOCUS: 8\. Build Verification, Progressive QA, and Provenance DAGs (goblin-viewport-template)}} /extreme-details*

### **Response: Testing Economics & The Fail-Fast Funnel**

Testing economics within goblin-viewport-template dictate a single core operating rule: **Fail as close as possible to the cheapest point of detection**. In a programmatic video generation pipeline where downstream cloud GPU rendering and neural plate inference carry real financial and temporal costs, unvalidated assumptions must never reach headless Chromium rendering workers or video diffusion models.

`[ CONFIDENCE 0: Structural ] ──► JSON Schema valid, files present, non-empty hash check ($0.00)`  
              `│ Pass`  
              `▼`  
`[ CONFIDENCE 1: Physical ]   ──► ffprobe frame budgets match, audio noise floor < -60 dBFS`  
              `│ Pass`  
              `▼`  
`[ CONFIDENCE 2: Geometric ]  ──► Viseme drift < 4px, alpha spill < 12 inside 3px contour`  
              `│ Pass`  
              `▼`  
`[ CONFIDENCE 3: Semantic ]   ──► Capability-resource bounds pass, epistemic firewall intact`  
              `│ Pass`  
              `▼`  
`[ CONFIDENCE 4: Editorial ]  ──► Signed human director approval via GitHub Review API`

The quality assurance funnel is structured so that inexpensive, deterministic compute (*T*0​\=\$0.00) absorbs and eliminates the vast majority of potential regressions before any media compositing begins:

> * **Confidence 0 (Structural Pre-Flight):** Validates JSON schemas, confirms that all required files exist on disk, and executes the Empty-Hash Trap. It verifies that no referenced asset matches the zero-byte SHA-256 signature (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855) and runs \!MissingAssets audits across all baked TSX paths.  
> * **Confidence 1 (Physical Signal Gates):** Executes ffprobe frame budget inspections to ensure rendered frame budgets match the exposure sheet exactly, validates true-peak limits (conforming dialogue stem peaks to **\-1.0 dBTP**), and asserts background noise floors remain under **\-60 dBFS**.  
> * **Confidence 2 (Geometric & Optical Invariant Gates):** Conducts solid-color debug mask passes, verifying that character contact anchors touch the background matte floor plane, viseme centroid drift remains **\<4px** against mouth anchors, and outer 3-pixel contour green-channel intensity remains **\<12** on alpha-keyed diffusion plates.  
> * **Confidence 3 (Semantic & State Consistency):** Asserts that the capability-resource bounds are intact (such as ensuring an actor with a severed arm executes zero bimanual kinetic verbs) and verifies that the character epistemic firewall (Ignorance by Omission) was not breached in dialogue.  
> * **Confidence 4 (Editorial Sign-Off):** Evaluates final narrative cadence and performance nuance through authenticated, signed human director approvals submitted via the GitHub Review API.

### **Closed-Loop Visual QA & Minimal Enclosing Unit (MEU) Patching**

When an optical or geometric anomaly escapes pre-flight checks and appears in a candidate render, goblin-viewport-template does not discard the entire render or trigger an unconstrained regeneration loop. Instead, it employs **Closed-Loop Visual QA** paired with **Minimal Enclosing Unit (MEU) Surgical Patching**.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   THE TWO-MIND CODE-PATCHING HARNESS                   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ THE ACTOR / GENERATOR (Jules Coding Agent / High Velocity)             │`  
`│ • VM Environment: Sandboxed Ubuntu, Node 20, Remotion CLI              │`  
`│ • Task: Writes & refactors Episode_XXX.tsx component trees             │`  
`│ • Freedom: Adjusts CSS properties, layout wrappers, spring hooks       │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ THE AUDITOR / CRITIC (Adversarial Diagnostic Linter / Zero-Token Rig) │`  
`│ • Environment: Headless CLI runner, OpenCV/Sharp, MediaPipe Face       │`  
`│ • Task: Runs deterministic pixel checks & grounded optical inspection  │`  
`│ • Gate: Emits strictly typed JSON diagnostic traces with pixel coords  │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **1\. The Two-Mind Verification Harness**

To eliminate confirmation bias, generation is strictly decoupled from evaluation. The agent that writes the TypeScript component (the Jules Coding Agent) is structurally barred from verifying its visual appearance. Verification is executed exclusively by an adversarial diagnostic critic running OpenCV, Sharp, or MediaPipe. The critic evaluates rendered frames along a kinematic volatility curve *V*(*t*) that samples peaks of motion and dialogue transitions rather than scanning every frame naively.

#### **2\. Defect Routing: Code Error vs. Asset Error**

When a geometric invariant fails (e.g., viseme drift measured at 24px), the diagnostic router classifies the root cause before dispatching fixes:

> * **ASSET\_ERROR:** If the JSX properties in Episode\_XXX.tsx match the coordinates declared in the character's manifest.json, but the resulting render is misaligned, the underlying sprite or bounding box contract is corrupt. The ticket is routed to the visual asset team; code agents are blocked from introducing arbitrary offsets to mask bad art.  
> * **CODE\_ERROR:** If the JSX property diverges from manifest.json (or an unhandled layout translation offset the coordinate space), the defect is classified as a code fault and dispatched to Jules.

                        `VISUAL DEFECT DETECTED`  
                                   `│`  
                                   `▼`  
                `[ Diagnostic Router: Classify Root Cause ]`  
                                   `│`  
         `┌─────────────────────────┴─────────────────────────┐`  
         `▼ JSX Matches Manifest                              ▼ JSX Diverges`  
 `┌───────────────────────────────┐           ┌───────────────────────────────┐`  
 `│          ASSET_ERROR          │           │          CODE_ERROR           │`  
 `│ • Manifest coords incorrect   │           │ • Viewport props misaligned   │`  
 `│ • Route to Visual Art Team    │           │ • Dispatch Jules Coding Agent │`  
 `│ • Code alterations blocked    │           │ • ts-morph AST Surgical Patch │`  
 `└───────────────────────────────┘           └───────────────┬───────────────┘`  
                                                             `│`  
                                                             `▼`  
                                             `┌───────────────────────────────┐`  
                                             `│ LOCAL MEU FAST VERIFICATION   │`  
                                             `│ npx remotion render ...       │`  
                                             `│   --frames=144-180            │`  
                                             `│   --gl=swangle                │`  
                                             `│ Re-render 36 frames locally   │`  
                                             `└───────────────────────────────┘`

#### **3\. MEU Surgical Patching via AST Mutation**

Once a CODE\_ERROR is confirmed, Jules opens Episode\_XXX.tsx inside an ephemeral container using the TypeScript Compiler API (ts-morph).

> * **Targeted AST Surgery:** Rather than re-baking the whole file or modifying global stylesheets, Jules mutates *only* the specific JSX attribute of the affected Sequence:  
>   `<GoblinPuppet mouthBoundingBox={{ x: 380, y: 264, width: 64, height: 32 }} />`

> * **Localized Fast Verification:** Jules verifies the remediation locally without re-rendering the full episode:  
>   `npx remotion render src/index.ts ep040-sh03 --frames=144-180 --gl=swangle`

> * **Zero Cloud Spend:** The 36-frame patch is verified locally on CPU in seconds, leaving the rest of the composition untouched.

#### **4\. The Three-Cycle Circuit Breaker & Error Trajectories**

Automated patching enforces a hard circuit breaker to prevent agentic thrashing and infinite loops:

> * **Oscillation Detection (*En*​\==*En*−2​):** If the agent alternates between two states (fixing viseme alignment on attempt 1, which breaks framing on attempt 2, then reverting on attempt 3), an immediate circuit trip fires, terminating execution and escalating to the system architect.  
> * **Progressive Unmasking:** If fixing Invariant A exposes a genuine secondary Invariant B, the agent is permitted a final attempt with both constraints injected simultaneously.  
> * **The Three-Cycle Cap:** If an issue cannot be resolved within three consecutive iterations, the patch branch is quarantined and marked **Not Safely Certifiable**.

### **The Five Levels of Reproducibility**

Because programmatic video combines continuous media decoders with discrete software code, goblin-viewport-template formalizes reproducibility across five discrete tiers:

| Level | Reproducibility Domain | Verification Mechanism | Pass Criterion |
| :---- | :---- | :---- | :---- |
| **Level 1** | **Intent & Plan** | Random seed lineage, prompt parameters, and scene specifications. | Identical AST prompt tokens and constraint matrices. |
| **Level 2** | **Machine AST** | Strict JSON schema parsing of dialogue\_ast.json. | Bit-identical token output and condition tags. |
| **Level 3** | **Timing & Sync** | Discrete integer frame budgeting via exposure\_sheet.json. | Exact frame allocations (⌈(*D*ms​/1000)×24⌉). |
| **Level 4** | **Decoded Media** | Raw decoded pixel buffers and linear PCM audio streams. | **Δ*E*\<0.1**, **SSIM\>0.9999** (Formal engine pass gate). |
| **Level 5** | **Container Bytes** | Binary hash of final multiplexed MP4 deliverable. | SHA-256*A*​\==SHA-256*B*​ (Environment-dependent). |

Level 5 bitstream identity can diverge due to non-deterministic MP4 container metadata, moov-atom layout timestamps, and variable FFmpeg encoder thread race conditions. Therefore, **Level 4 Decoded Media Equivalence represents the formal binary exit gate** for deterministic rendering in goblin-viewport-template. To maintain Level 4 consistency across disparate hardware:

> * Headless Chromium rendering is locked to software OpenGL rasterization (--gl=swangle).  
> * Worker concurrency is restricted to single-threaded isolation (--concurrency=1).  
> * Operating system locales and timezones are pinned to TZ=UTC and LC\_ALL=C.UTF-8.  
> * All TrueType/OpenType subtitle and title fonts are validated against cryptographic checksums prior to rendering.

### **The Provenance DAG & Blast Radius Engine**

Every rendered media artifact represents the terminal leaf of an immutable, directed acyclic graph (DAG). The pipeline enforces a strict invariant across all stages: **Every artifact must identify its parents**.

                             `CANONICAL PROVENANCE DAG`  
                               
`[ Canon Commit: 000.goblin-lore ] ──► [ World State Ledger (D1) ]`  
                  `│                                │`  
                  `└────────────────┐   ┌───────────┘`  
                                   `▼   ▼`  
                        `[ dialogue_ast.json ]`  
                                   `│`  
                 `┌─────────────────┴─────────────────┐`  
                 `▼                                   ▼`  
      `[ Audio Synthesis (.wav) ]          [ Visual Manifests (API) ]`  
                 `│                                   │`  
                 `▼                                   ▼`  
      `[ exposure_sheet.json ]             [ Harvested Local Assets ]`  
                 `│                                   │`  
                 `└─────────────────┬─────────────────┘`  
                                   `▼`  
                        `[ Episode_XXX.tsx ]`  
                                   `│`  
                                   `▼`  
                     `[ Master Rendered MP4 Master ]`  
                                   `│`  
                                   `▼`  
                      `[ render_manifest.json ]`

#### **1\. Explicit Parentage Lineage**

The dependency links are explicitly codified throughout each phase of compilation:

> * Episode\_XXX.tsx ← exposure\_sheet.json hash, dialogue\_ast.json hash, character manifest.json hashes, generator build ID.  
> * exposure\_sheet.json ← audio stem binary hashes, dialogue\_ast.json hash.  
> * audio/\*.wav ← TTS model checkpoint hash, voice configuration seed, line string.  
> * assets/\*.png ← source image hash, manifest.json coordinate hash, LoRA weights hash.

#### **2\. Bidirectional Graph Traversal**

Formalizing the production pipeline as a mathematical DAG enables two essential operational workflows:

> * **Backward Causality (Forensic Audit):** Answers *“Why does this specific pixel/frame exist?”*. If an auditor flags Bog limping or exhibiting a scarred eye in frame 412 of Episode 040, the engine traces backwards:  
>   Frame 412→Shot 03→Sequence Prop→Audio Stem→AST Beat→Somatic Vector→Event Log→Canon Constraint  
> * **Forward Blast-Radius Analysis:** Answers *“If Fact X changes upstream, what breaks downstream?”*. When canon or somatic history is patched (e.g., correcting Bog's canonical trauma), the DAG walks forward to compute the exact invalidation cascade:  
>   `$ sower why-dirty fact_bog_arm_severed`

>   `[MUTATION]: fact_bog_arm_severed -> state: AGGRAVATED`  
>     `├── Scene 040/03 (Direct Match: consumes fact_bog_arm_severed) -> INVALIDATED`  
>     `├── Scene 040/07 (Downstream Dependent: assumes two-handed carry) -> INVALIDATED`  
>     `└── Episode 041/01 (Epistemic Chain: Spleen references Bog's injury) -> INVALIDATED`  
>   `Total Blast Radius: 3 scenes across 2 episodes. Rebuild cost: $0.00 (Draft Phase).`

Because Pass 2 cycle detection mathematically guarantees the DAG is acyclic (*A*→*B*→*C*→*A* is impossible), the invalidation sweep computes the finite transitive closure without risking infinite recursive regeneration cascades.

#### **3\. Cryptographic Build Identity & render\_manifest.json**

Every stamped episode workspace packages an immutable build lockfile (render\_manifest.json) that seals the root of the provenance DAG:

Episode Build ID=H(Canon+Ledger State+AST+Assets+Container Digest+Toolchains)  
`{`  
  `"build_id": "sha256:4f8a1209bc87e...",`  
  `"episode_id": "EP040",`  
  `"schema_version": "3.2.0",`  
  `"generated_at": "2026-09-28T15:44:00Z",`  
  `"target_source_file": "Episode_040.tsx",`  
  `"source_file_sha256": "7bd4e10a2f9c4b1e8f90123456789abcdef...",`  
  `"upstream_provenance": {`  
    `"worker_sower_engine_commit": "git:7bd4e10",`  
    `"goblin_lore_commit": "git:9c3e401",`  
    `"goblin_assets_visual_tag": "git:v1.4.0",`  
    `"viewport_template_commit": "git:4f8a120"`  
  `},`  
  `"runtime_environment": {`  
    `"node_version": "v20.12.0",`  
    `"remotion_version": "4.0.140",`  
    `"chromium_milestone": "122.0.6261.94",`  
    `"ffmpeg_build": "6.1.1-static",`  
    `"font_manifest": {`  
      `"Cinzel-Bold.ttf": "sha256:5a6b7c8d..."`  
    `}`  
  `},`  
  `"assets_consumed": {`  
    `"swamp_relay_matte.png": "sha256:8f4b1e3a...",`  
    `"bog_humiliated.png": "sha256:1a2b3c4d...",`  
    `"ep040_sh01.wav": "sha256:4d5e6f7a..."`  
  `},`  
  `"c2pa_manifest_injected": true`  
`}`

To establish an unbroken, tamper-evident audit trail, this provenance manifest is injected directly into the final deliverable MP4 container using C2PA metadata standards. This cryptographically anchors the physical video file to the exact GitHub commit, ledger transaction, and toolchain environment that created it.

### **Three-Class Failure Taxonomy**

To eliminate unconstrained, infinite retry loops that waste compute budgets while masking deterministic logic flaws, all errors occurring across build verification and execution are sorted into three explicit response paths:

                                  `PIPELINE ERROR DETECTED`  
                                             `│`  
         `┌───────────────────────────────────┼───────────────────────────────────┐`  
         `▼                                   ▼                                   ▼`  
`┌───────────────────┐               ┌───────────────────┐               ┌───────────────────┐`  
`│   DETERMINISTIC   │               │ STOCHASTIC QUALITY│               │  INFRASTRUCTURE   │`  
`│   (Fatal Halt)    │               │  (Bounded Retry)  │               │(Idempotent Resume)│`  
`├───────────────────┤               ├───────────────────┤               ├───────────────────┤`  
`│ • Schema mismatch │               │ • Flat dialogue   │               │ • Network timeout │`  
`│ • Banned verb used│               │ • Unearned subtext│               │ • CUDA OOM crash  │`  
`│ • Missing asset   │               │ • Voice bleed     │               │ • Dead headless   │`  
`│ • Invalid timeline│               │ • Bad TTS cadence │               │   browser worker  │`  
`└───────────────────┘               └───────────────────┘               └───────────────────┘`  
         `│                                   │                                   │`  
         `▼                                   ▼                                   ▼`  
  `Abort immediately.                 Retry up to 2x with                 Resume execution`  
  `Do NOT retry.                      adjusted parameters.                from last valid`  
  `Fix upstream code.                 Escalate to human.                  content-addressed`  
                                                                         `disk artifact.`

> 1. **Deterministic Failures (Fatal Halt):**  
   * *Triggers:* JSON schema violations, coordinate out-of-bounds, set-intersection hits on banned kinetic verbs, missing asset paths, or cyclic dependencies.  
   * *Protocol:* Terminate the build immediately with exit code 1\. Never retry automatically; retrying a deterministic failure consumes tokens and cycles without altering the mathematical outcome. The defect must be resolved upstream in the code, schema, or asset manifest.  
> 2. **Stochastic Quality Failures (Bounded Retry):**  
   * *Triggers:* Flat dialogue delivery, unearned subtext release, minor voice bleed, or unnatural TTS cadence.  
   * *Protocol:* Allow a maximum of two bounded retries with adjusted guidance prompts or modified sampling seeds. If the second retry fails quality thresholds, trip the circuit breaker and escalate to human review.  
> 3. **Infrastructure Failures (Idempotent Resume):**  
   * *Triggers:* Network timeouts, Cloudflare D1 lock contention, GPU CUDA out-of-memory errors, or crashed headless Chromium processes.  
   * *Protocol:* Resume execution atomically from the last valid content-addressed disk artifact using the task's unique idempotency key (UUIDv7 or UUIDv5). Completed upstream artifacts are never re-rendered.

---

*User prompt: {{FOCUS: Canon Errata and Re-Anchoring (goblin-viewport-template)}} /extreme-details*

Response: The Canon Errata and Re-Anchoring Protocol in goblin-viewport-template is the studio's formal mechanism for resolving narrative mistakes, anatomical contradictions, and retroactive continuity revisions without corrupting historical media archives or breaking content-addressed provenance. In traditional animation and media pipelines, retroactively fixing a continuity error—such as discovering that a character’s permanent injury was their left leg rather than their right arm—often leads to ad-hoc, in-place edits of previous project files, silently destroying the historical record and invalidating past renders. In this architecture, historical media artifacts are treated as permanent, immutable physical evidence: the system explicitly refuses to overwrite historical media or edit past manifests in place.

### **The Ontological Triad & The Immutability Principle**

The protocol enforces an absolute separation across three discrete ontological tiers to ensure that media revisions never distort reality:

> * **Canon (The World):** The schema-validated, read-only collection of world laws, entity dossiers, and historical rules managed in the goblin-lore repository.  
> * **Events (What Happened):** The immutable, append-only transaction ledger of simulation ticks, combat exchanges, somatic injuries, and belief changes.  
> * **Artifacts (What Was Rendered):** The final MP4 broadcast files, exposure sheets, synthesized audio stems, and static React composition files (Episode\_XXX.tsx) produced by the rendering pipeline.

Updating manifests or rendered media files in place breaks content addressing and invalidates cryptographic trust across the fleet. Because GPU driver variations, latent sampling seeds, and non-deterministic floating-point math prevent diffusion video plates from being regenerated bit-for-bit from scratch, historical media assets in cold storage (AWS Glacier or Backblaze B2) remain untouched and byte-identical forever.

                     `CANON ERRATA & RE-ANCHORING FLOW`  
                       
`[ Old Canon (H_root_A) ] ────────► [ Old Render (EP012.mp4) ] (Archived in Cold Storage)`  
           `│                                 │`  
           `│ Error Discovered                │ Retains Pinned canon_version`  
           `▼                                 ▼`  
`[ Git Commit in goblin-lore ] ──► Establishes New Root Hash (H_root_B)`  
           `│`  
           `▼`  
`[ Append ErrataRecord ] ────────► Appended to lore/errata.json`  
           `│`  
           `▼`  
`[ Forward Blast Radius Run ] ───► Evaluates DAG: Flags Affected Scenes (is_dirty = 1)`  
           `│`  
           `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   RE-ANCHORING DECISION GATE (Showrunner)              │`  
`├──────────────────────────────────┬─────────────────────────────────────┤`  
`│ OPTION A: Freeze History         │ OPTION B: Authorize Remaster         │`  
`│ • Old episode preserved as legacy│ • Re-run pipeline downstream        │`  
`│ • No further compute burned      │ • Emit distinct file:               │`  
`│                                  │   EP012_remaster_v2.mp4             │`  
`└──────────────────────────────────┴─────────────────────────────────────┘`

### **The Append-Only Errata and Retcon Protocol**

When an author or director discovers a foundational lore or physical contradiction in a completed episode, the errata pipeline executes five mandatory operations:

> 1. **Canonical Git Commit:** The correction is made directly inside the Markdown dossiers of goblin-lore, generating a brand-new Git commit and establishing a revised canonical root hash (*H*root​).  
> 2. **Append-Only Ledger Entry:** A formal ErrataRecord is appended to lore/errata.json (or canon\_errata\_v1.2.json). The existing file is never edited in place or truncated.  
> 3. **Cross-Referenced Provenance Binding:** The ErrataRecord binds the mutation cryptographically by recording:  
   * The superseded commit SHA of the old canon.  
   * The active Git commit SHA containing the authorized correction.  
   * The exact SHA-256 hashes of the media and AST artifacts affected.  
   * The affected entity IDs and affected historical episode lists.  
> 4. **Immutable Cold Preservation:** The original media files (e.g., EP012.mp4) and their sidecar provenance files (render\_manifest.json) remain intact in cold storage under their original content-addressed hashes.  
> 5. **Event-Level Canon Versioning:** To ensure that historical event replay does not generate logical contradictions (e.g., evaluating an old event where Bog lifted a crate against a newer rule stating his arm was already severed), events themselves record the active canon\_root\_hash, schema\_version, reducer\_version, and simulation\_seed under which they occurred.

### **DAG Dependency Invalidation & The Blast Radius Engine**

Once an errata commit establishes a new canonical root hash, worker-sower-engine analyzes the dependency Directed Acyclic Graph (DAG) using recursive Common Table Expressions (CTEs). Every narrative fact, dialogue AST beat, audio stem, visual contract, and source-baked Remotion component exists as a typed node in this graph connected by depends\_on edges.

               `FORWARD BLAST RADIUS EVALUATION (why-dirty)`  
                 
                 `[ Canon Mutation: character.bog.shoulder ]`  
                                     `│`  
                                     `▼`  
                        `[ Character State Mutated ]`  
                                     `│`  
                                     `▼`  
                    `[ Scene 040/003 (Direct Dependency) ]`  
                                     `│`  
                                     `▼`  
                   `[ Shot 040/003/02 References BOG Node ]`  
                                     `│`  
                                     `▼`  
                     `[ Machine Dialogue AST Invalidated ]`  
                                     `│`  
                                     `▼`  
                   `[ Acoustic Timing Manifest (.wav/json) ]`  
                                     `│`  
                                     `▼`  
                   `[ Visual Asset Plan & Puppet Manifest ]`  
                                     `│`  
                                     `▼`  
                 `[ Stamped Source: Episode_040.tsx Rebuild ]`

#### **1\. Blast Radius Forensics (why-dirty)**

To prevent unconstrained re-renders across an entire series, the showrunner runs targeted CLI inspections to trace the precise invalidation cascade:

`$ sower why-dirty character.bog.shoulder`

`BOG.SHOULDER changed`  
  `↓`  
`Character state changed`  
  `↓`  
`Scene 040/003 depends on shoulder state`  
  `↓`  
`Shot 040/003/02 references BOG`  
  `↓`  
`dialogue AST invalidated`  
  `↓`  
`audio invalidated`  
  `↓`  
`visual plan invalidated`  
  `↓`  
`Episode_040 requires rebuild`

This diagnostic output turns what was once an editorial continuity panic into a deterministic, traceable software build operation.

#### **2\. Asymmetric Minimal Enclosing Unit (MEU) Boundary Repair**

When an invalidated scene must be patched to match new canon, the pipeline restricts text and script rewrites using an **Asymmetric Minimal Enclosing Unit (MEU)**:

> * **The Backward Sweep:** Scans upward through the preceding beats to collect active preconditions and physical constraints without widening the text rewrite boundary.  
> * **The Forward Sweep:** Expands downward into subsequent beats only if an entity or somatic state altered by the patch is actively referenced by those later lines.  
> * **The Seam Gate:** Re-audits the conjoined boundaries (prefix \+ patch \+ suffix) for coreference alignment, pronoun stability, and tense consistency.  
> * **The 40% Circuit Breaker:** If the transitive closure of the forward patch expands beyond 40% of the entire scene, automated infill aborts and escalates to a human writer review gate.

### **The Re-Anchoring Decision Gate & Dual-Mode Execution**

When the blast radius has identified all dirty scenes, the pipeline halts at the **Re-Anchoring Decision Gate**. The director or showrunner must make an explicit choice regarding historical presentation:

| Operational Mode | System Behavior | Storage & Compute Impact | Creative Trade-Off |
| :---- | :---- | :---- | :---- |
| **Historical Preservation Mode** | Past episodes remain locked to their pinned canon\_version in render\_manifest.json. | **\$0.00 compute spend**; past artifacts in cold storage remain unmodified. | Acknowledges legacy continuity errors as part of the broadcast broadcast history. |
| **Remastering Mode** | Applies Schema Migration Adapters (*μv*1​→*v*2​​) and re-compiles the pipeline downstream from the mutation. | Re-synthesizes audio stems and renders new Remotion TSX trees. | Produces a brand-new content-addressed deliverable (e.g., EP012\_remaster\_v2.mp4). |

#### **Dual-Mode Schema Migration Adapters**

Under Remastering Mode, canon schema shifts between seasons (e.g., moving from Canon v1.0.0 to v1.1.0) are governed by formal migration functions:

State*v*2​\=*μv*1​→*v*2​​(State*v*1​)

This allows the compiler to project historical narrative states into updated schemas without discarding legacy relational variables.

#### **Ledger Retroactivity as an Authorial Choice**

The protocol enforces an explicit rule regarding world state: whether a canon errata retroactively modifies the downstream relational ledger (changing what "actually happened" in subsequent episodes) is a **creative decision** that must be recorded explicitly in the errata log, rather than discovered as a side effect of a bug report.

### **Physical & Geometric Re-Anchoring in the Viewport Layer**

When an errata impacts a character's physical embodiment, the downstream effects directly alter the spatial compilation in goblin-viewport-template:

#### **1\. Somatic Constraint Linting**

If Bog’s injury is updated in canon, the entity dossier updates its banned\_kinetic\_verbs mask (e.g., banning two-handed actions like HOLD\_ITEM\_DOUBLE). If an author or automated agent attempts to compile an animatic showing Bog using that limb, the Level 0 invariant linter trips instantly at *T*0​, terminating the build at zero cost before rendering begins. If a character is canonically retired or killed, their metadata receives banned\_kinetic\_verbs: \["\*"\], strictly prohibiting any generator from animating them in active forward scenes while still permitting historical references.

#### **2\. Sprite Atlas Coordinate Re-Anchoring**

Physical changes require updated sprite manifests (manifest.json). When a character pose, slouch angle, or limb status is altered, the viewport updates three spatial invariants:

> * **Ground Contact Pivot (anchor\_point):** Jules scans the alpha channel from the bottom (*y*\=1023) upward to locate the lowest non-zero pixels. This establishes the baseline midpoint (*Ax*​,*Ay*​), ensuring the puppet’s feet sit flush on the background matte's ground plane (*Y*ground​):  
>   TranslateX=*X*stage​−*Ax*​,TranslateY=*Y*ground​−*Ay*​  
> * **Camera Facial Focus (crash\_zoom\_target):** The facial centroid is re-extracted, allowing programmatic camera push-ins to invert coordinates and calculate exact CSS transformOrigin percentages. When the puppet sprite is scaled (*s*) to fit the canvas, the global origin is projected as:  
>   originXglobal​\=canvas.widthpuppet.x+(anchor.x×*s*)​×100%  
>   originYglobal​\=canvas.heightpuppet.y+(anchor.y×*s*)​×100%  
> * **Modular Mouth Viseme Envelopes (mouth\_bounding\_box):** The target rectangle \[*x*,*y*,*w*,*h*\] is pinned to the new facial baseline. Swapping expression sprites updates the viseme mounting coordinates simultaneously, preventing floating mouth anomalies.

#### **3\. Diagnostic Defect Routing: Code Bug vs. Asset Defect**

During visual regression audits of re-anchored scenes, mismatches between the character mouth and the viseme overlay are routed by evaluating coordinate parity:

> * **ASSET\_ERROR:** If the JSX properties in Episode\_XXX.tsx match the coordinates declared in manifest.json, but the visual render shows a drift \>4px, the underlying sprite manifest is defective. The ticket routes to the visual art team; code-repair agents are barred from hardcoding arbitrary offsets into JSX to mask flawed art.  
> * **CODE\_ERROR:** If the JSX property deviates from manifest.json, the code is wrong. Jules executes surgical AST surgery via the TypeScript Compiler API (ts-morph) and verifies the fix locally using software rendering (--gl=swangle) across an isolated 36-frame window without cloud GPU spend.

#### **4\. The Sealed-File Lifecycle & DIRECTOR\_OVERRIDE Events**

When re-anchoring an episode, the compiler reads the cryptographic header inside Episode\_XXX.tsx:

> * If marked @lifecycle: generated, the file may be safely overwritten by the compiler during a remaster.  
> * If marked @lifecycle: locked (indicating that a human director pulled the "Eject Button" to hand-tune visual framing), the generator refuses to overwrite the file. It emits Episode\_XXX.candidate.tsx beside it and halts.  
> * Any manual director adjustment to a locked re-anchored file logs an append-only event into the historical ledger:  
>   `{`  
>     `"type": "DIRECTOR_OVERRIDE",`  
>     `"target": "shot_040_003",`  
>     `"property": "camera.scale",`  
>     `"from": 1.04,`  
>     `"to": 1.08,`  
>     `"reason": "emotional emphasis following canon injury re-anchoring"`  
>   `}`

By combining append-only errata records, forward DAG blast-radius tracking, dual-mode remastering, and coordinate re-projection, goblin-viewport-template ensures that canon corrections remain auditable, mathematically grounded software releases rather than unmonitored revisions.

---

*User prompt: {{FOCUS: 1\. Architectural Paradigm: Metaprogram Compiler vs. Runtime Player}} /extreme-details*

Response: The architectural transition from the legacy goblin-viewport runtime player to the goblin-viewport-template metaprogram compiler represents an absolute structural rejection of the dynamic media-player paradigm. In conventional media architectures, video renderers operate as long-lived software applications that ingest mutable, external data payloads at runtime. goblin-viewport-template inverts this model: it treats episodic media generation as an offline software compilation problem, where narrative meaning and temporal plans are compiled directly into frozen, executable TypeScript code.

### **1\. The Core Thesis: Metaprogram Compiler vs. Runtime Player**

The primary architectural law governing goblin-viewport-template dictates that **the repository itself is never an episode runtime target**. It functions exclusively as an offline code generator, an AST transformation pipeline, and a scaffolding blueprint.

`THE RUNTIME PLAYER PARADIGM (LEGACY):`  
`External Data (scene.json) ──► Monolithic Viewport App ──► Dynamic .map() Iteration ──► Video Output`  
                                `(Shared mutable code)       (Runtime interpretation)`

`THE METAPROGRAM COMPILER PARADIGM (CURRENT):`  
`Upstream Contracts (AST/Stems) ──► generate-episode-repo.ts ──► Static Source (Episode_XXX.tsx) ──► Headless Chromium`  
                                     `(Metaprogram Compiler)       (Literal baked TSX)               (Rig 1 CPU Render)`

> * **The Runtime Player Model (Dynamic Interpretation):** A persistent, centralized application boots up, loads an external sidecar file (e.g., scene.json or timeline.json), parses the data structures in memory, and dynamically evaluates React hooks, layout equations, and asset bindings at 24 frames per second.  
> * **The Metaprogram Compiler Model (Build-Time Source-Baking):** An offline generator script (generator/generate-episode-repo.ts) ingests upstream machine contracts, performs spatial and temporal arithmetic ahead of time, and stamps out an independent, self-contained workspace inside goblin-episodes/ (e.g., goblin-episodes/episode-040/). All scene boundaries, audio paths, and visual coordinates are burned directly into static TypeScript JSX literals (Episode\_XXX.tsx).

### **2\. The Historical Corruption Trap: Anatomy of Legacy Failure**

The runtime player paradigm fails catastrophically when applied to long-term episodic media archives due to the **Historical Corruption Trap**.

`THE HISTORICAL CORRUPTION TRAP`  
`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ T0 (Month 0): Episode 012 rendered against Shared Viewport v1.0.0                      │`  
`│ • Component logic: GoblinPuppet.tsx v1.0.0 evaluates anchor_point dynamically.         │`  
`│ • Result: Visemes align to chin baseline, camera push-in frames facial centroid.       │`  
`├────────────────────────────────────────────────────────────────────────────────────────┤`  
`│ T1 (Month 6): Shared Viewport refactored to v1.4.0 to support Episode 040              │`  
`│ • Camera spring dampening curve adjusted in GoblinPuppet.tsx for dynamic combat.       │`  
`│ • Transform-origin calculations modified to accommodate a taller character archetype.  │`  
`├────────────────────────────────────────────────────────────────────────────────────────┤`  
`│ T2 (Month 12): Re-render Episode 012 against Shared Viewport v1.4.0                    │`  
`│ • SILENT REGRESSION:                                                                   │`  
`│   - Mouth visemes detach and float 20 pixels below the chin baseline.                  │`  
`│   - New camera dampening curves cause facial close-ups to decapitate character sprites.│`  
`│   - Sub-frame timing shifts introduce lip-sync rubber-banding across scene transitions.│`  
`└────────────────────────────────────────────────────────────────────────────────────────┘`

When a runtime player ingests dynamic JSON payloads, the application code executing the render remains decoupled from the data payload. Over a multi-month or multi-year production cycle, shared presentation primitives (such as GoblinPuppet.tsx, easing curve functions, or CSS layout containers) inevitably evolve. Because the historical data payload (scene.json) relies on the *current* state of the shared codebase, older episodes cannot be reliably re-rendered. The interpreter shifts underneath the archive, resulting in silent regressions where historical episodes are permanently corrupted without any changes having been made to their underlying data files.

### **3\. The Source-Baking Engine: Eliminating Runtime Interpretation**

To prevent historical regressions, goblin-viewport-template replaces runtime interpretation with **Source-Baking**. The generator metaprogram resolves all dynamic logic during code generation, producing static, unquoted TypeScript literals.

#### **Literal Value Inlining**

Runtime players parse JSON arrays dynamically using .map() loops:

`// RUNTIME PLAYER ANTI-PATTERN (Dynamic runtime evaluation)`  
`{sceneData.shots.map((shot) => (`  
  `<Sequence from={shot.startFrame} durationInFrames={shot.duration}>`  
    `<CameraWrapper zoom={shot.zoomLevel}>`  
      `<Puppet id={shot.characterId} pose={shot.emotion} />`  
    `</CameraWrapper>`  
  `</Sequence>`  
`))}`

The metaprogram compiler executes this loop during generation, writing explicit JSX tags containing hardcoded values directly into Episode\_XXX.tsx:

`// SOURCE-BAKED METAPROGRAM (Deterministic static compilation)`  
`<Sequence from={0} durationInFrames={75}>`  
  `<Shot01CameraWrapper originX="48.2%" originY="21.4%">`  
    `<GoblinPuppet`  
      `character="BOG"`  
      `emotion="humiliated"`  
      `anchorPoint={{ x: 512, y: 980 }}`  
      `mouthBoundingBox={[380, 240, 64, 32]}`  
    `/>`  
    `<Audio src={staticFile("audio/dialogue/ep040_sh01.wav")} volume={1.0} />`  
  `</Shot01CameraWrapper>`  
`</Sequence>`  
`<Sequence from={75} durationInFrames={99}>`  
  `<Shot02CameraWrapper originX="51.0%" originY="19.8%">`  
    `<GoblinPuppet`  
      `character="SPLEEN"`  
      `emotion="defensive"`  
      `anchorPoint={{ x: 480, y: 960 }}`  
      `mouthBoundingBox={[410, 220, 58, 30]}`  
    `/>`  
    `<Audio src={staticFile("audio/dialogue/ep040_sh02.wav")} volume={1.0} />`  
  `</Shot02CameraWrapper>`  
`</Sequence>`

#### **Elimination of Dynamic Runtime Hazards**

> * **Unquoted Numeric Literals:** Every frame duration, sequence offset, and audio gain multiplier is stamped as an unquoted numeric literal (e.g., durationInFrames={75}), eliminating runtime type coercion and string parsing overhead in Remotion.  
> * **Absolute Timeline Anchoring:** Stems and cuts are never concatenated sequentially end-to-end at runtime. The compiler accumulates discrete integer durations upfront (fromFrame*k*​\=∑*i*\=1*k*−1​duration*i*​), pinning every track to an immutable absolute timeline coordinate and preventing cumulative rounding drift.  
> * **Sequence-Relative Hook Isolation:** Remotion evaluates hooks like useCurrentFrame() relative to the mounting component. If a runtime player evaluates camera movement hooks at the composition root, later cuts evaluate curves against global scene time. The metaprogram compiler wraps every cut inside an isolated sub-component (\<Shot01CameraWrapper\>, \<Shot02CameraWrapper\>), ensuring useCurrentFrame() resets to 0 on every cut.

### **4\. Component Boundary Isolation & The Import Leak**

Baking static JSX literals into Episode\_XXX.tsx does not achieve complete determinism if the file imports shared components from a living monorepo root via relative paths:

`// THE SHARED-COMPONENT IMPORT LEAK (Vulnerability)`  
`import { GoblinPuppet } from '../../goblin-viewport/src/components/GoblinPuppet';`  
`import { AmbientTrack } from '../../goblin-viewport/src/components/AmbientTrack';`

If GoblinPuppet.tsx is modified months later to introduce a new spring physics curve, re-rendering Episode\_040.tsx will execute the modified logic, causing the renderer to drift despite the frozen timeline. To close this leak, goblin-viewport-template enforces one of three component boundary isolation strategies:

`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│                        COMPONENT BOUNDARY ISOLATION STRATEGIES                         │`  
`├────────────────────────────────────────────────────────────────────────────────────────┤`  
`│ 1. COMPONENT VENDORING (Standard Industrial Pattern)                                   │`  
`│    • The compiler physically copies GoblinPuppet.tsx, AmbientTrack.tsx, and common     │`  
`│      utilities directly into goblin-episodes/episode-XXX/components/ at bake time.     │`  
`│    • The episode imports only local, vendored files: from './components/GoblinPuppet'.│`  
`│    • The episode codebase is completely self-contained and decoupled from sibling repos│`  
`├────────────────────────────────────────────────────────────────────────────────────────┤`  
`│ 2. IMMUTABLE SEMVER PACKAGE REGISTRIES                                                 │`  
`│    • Shared presentation primitives are published to an immutable private registry     │`  
`│      under strict semantic versioning: @studio/viewport@1.4.2.                         │`  
`│    • The stamped episode pins this version exactly in its local package.json:         │`  
`│      dependencies: { "@studio/viewport": "1.4.2" } (zero carats, zero tildes).         │`  
`├────────────────────────────────────────────────────────────────────────────────────────┤`  
`│ 3. GIT SUBMODULE COMMIT PINNING                                                        │`  
`│    • The episode repository tracks the shared viewport repository as a Git submodule.  │`  
`│    • Locked to an immutable 40-character commit SHA recorded in the build manifest.    │`  
`└────────────────────────────────────────────────────────────────────────────────────────┘`

### **5\. Axis A vs. Axis B: The Two-Dimensional Compilation Architecture**

The separation between the metaprogram compiler and a runtime player corresponds directly to the **Two-Dimensional Compilation Architecture**, which isolates semantic narrative transformation from artifact hardening.

               `AXIS A: SEMANTIC TRANSFORMATION (Meaning / Functional Flow)`  
`┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐`  
`│ WORLD STATE │ ──► │ NARRATIVE IR │ ──► │ TEMPORAL IR  │ ──► │  VISUAL IR   │`  
`└─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘`  
       `│                   │                    │                    │`  
       `▼                   ▼                    ▼                    ▼`  
`┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐`  
`│  REDUCER &  │ ──► │ SOURCE CODE  │ ──► │ HEADLESS RUN │ ──► │   VERIFIED   │`  
`│  EVENT LOG  │     │ (TSX Baking) │     │  (Chromium)  │     │   ARTIFACT   │`  
`└─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘`  
               `AXIS B: ARTIFACT HARDENING (Representation / Execution Domains)`

> * **Axis A (Semantic Transformation):** Maps abstract world truth down through progressive intermediate representations: World State → Dialogue AST → Quantized Audio Frames → Asset Contracts.  
> * **Axis B (Artifact Hardening):** Hardens ephemeral representations into immutable, runnable software targets: Pure Event Reducers → Baked TSX Source Code → Headless Software OpenGL Rasterization → Sealed Media Artifacts.

This separation establishes a clear taxonomy for debugging build failures:

| Observed Failure Mode | Fault Domain | Architectural Remediation |
| :---- | :---- | :---- |
| Character uses a severed limb | **Axis A (Semantic)** | Somatic invariant filter rejects kinetic verb at compile time. |
| Dialogue finishes 2 frames before mouth closes | **Axis A (Temporal)** | Audio timebase quantization error (⌈(*D*ms​/1000)×24⌉). |
| Viseme detaches from character chin | **Axis A (Visual)** | Asset manifest anchor point mismatch against canvas layout. |
| Re-render of legacy episode alters camera easing | **Axis B (Hardening)** | **Runtime Player Trap:** Replace shared runtime import with vendored code. |
| Binary hash diverges between identical builds | **Axis B (Hardening)** | Non-deterministic MP4 container metadata or muxing timestamps. |

### **6\. The Human-in-the-Loop "Showrunner Eject Button" & Sealed Lifecycle**

A common failure mode in generative video pipelines is the "black box" trap: when an automated layout makes an artistic mistake, human directors have no recourse other than re-prompting or editing the final lossy MP4 in post-production software.

By compiling the episode into a human-readable React component (Episode\_XXX.tsx), goblin-viewport-template introduces the **Showrunner Eject Button**:

> * **Reviewable Code Diffs:** Because all timing and camera choreographies exist as JSX attributes, every directorial adjustment appears as an explicit Git diff rather than an opaque JSON or binary blob.  
> * **Direct Source Interventions:** A human director can open Episode\_XXX.tsx, adjust an interpolate() easing curve, modify a scale factor, or splice in custom SVG filter layers directly.

#### **The Cryptographic Sealed-File Lifecycle**

To ensure that automated regeneration passes (e.g., an upstream re-run of worker-sower-engine following a script tweak) do not clobber manual director interventions, the compiler enforces an embedded lifecycle state machine:

`// @lifecycle: generated | patched | locked`  
`// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f`  
`// @upstream_ast: sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d`

                       `UPSTREAM REGENERATION TRIGGERED`  
                                      `│`  
                                      `▼`  
                        `Read Episode_XXX.tsx Header`  
                                      `│`  
         `┌────────────────────────────┼────────────────────────────┐`  
         `▼                            ▼                            ▼`  
`[@lifecycle: generated]      [@lifecycle: patched]        [@lifecycle: locked]`  
`Hash matches body?           Valid AST surgical diff?     MANUAL HUMAN OVERRIDE`  
         `│                            │                            │`  
   `┌─────┴─────┐                      │                            │`  
   `▼           ▼                      ▼                            ▼`  
`[Match]     [Mismatch]       [Apply Agent Patch]           [HARD STOP]`  
`Safe        Treat as         Re-compute checksum           Refuse to overwrite.`  
`Overwrite   LOCKED                                         Emit Episode_XXX.candidate.tsx`  
                                                           `Log DIRECTOR_OVERRIDE event.`

> 1. **@lifecycle: generated:** Stamped by generate-episode-repo.ts upon initial creation. The file body is SHA-256 hashed across normalized LF line endings. If an upstream re-run occurs and the hash still matches, the compiler safely overwrites the file in place.  
> 2. **@lifecycle: patched:** Applied when automated visual QA diagnostic agents (such as Jules) perform targeted AST repairs using ts-morph to fix geometric issues. Patches are accepted only if the AST diff is strictly confined to whitelisted layout properties.  
> 3. **@lifecycle: locked:** Applied when a human director pulls the Eject Button and modifies the file. If generate-episode-repo.ts runs again, it detects the @locked tag (or a checksum mismatch indicating untagged edits). The generator **refuses to overwrite the file**; it writes its output to Episode\_XXX.candidate.tsx and halts, logging an immutable DIRECTOR\_OVERRIDE event to the provenance ledger.

### **7\. Architectural Demarcation & Hardware Boundary**

The operational distinction between the metaprogram compiler and the runtime execution engine is mirrored in the physical hardware architecture of the studio:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: PURE CPU / RAM BOUND (Orchestration & Optical Assembly)         │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • worker-sower-engine (Simulation, Duel Math, Dialogue AST)            │`  
`│ • Local TTS Microservice (:8000 on CPU, e.g., CosyVoice / Parler-TTS)  │`  
`│ • Temporal Quantizer (ffprobe CLI — locks discrete frames at 24 fps)   │`  
`│ • goblin-viewport-template Compiler (generate-episode-repo.ts)        │`  
`│ • Remotion Rendering Engine (@remotion/renderer CLI)                   │`  
`│   - Headless Chromium forced to software OpenGL: --gl=swangle          │`  
`│   - Concurrency locked: --concurrency=1                                │`  
`│   - Off-thread video decoding: <OffthreadVideo />                      │`  
`│   - ZERO GPU compute / ZERO VRAM footprint                             │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Network API Call (JSON only)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: HEAVY GPU TENSOR FOUNDRY (Dedicated High-VRAM Silicon)          │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Headless ComfyUI Daemon (:8188)                                      │`  
`│ • 100% of VRAM dedicated to Wan 2.2 / LoRA diffusion inference passes  │`  
`│ • ZERO Chromium instances / ZERO Remotion executions                   │`  
`│ • Renders raw greenscreen video plates (#00FF00) and exports to R2     │`  
`└────────────────────────────────────────────────────────────────────────┘`

Rendering the compiled React component tree is strictly a CPU and system-RAM workload on Rig 1\. Because Remotion executes headless Chromium, running hardware OpenGL acceleration on headless Linux hosts causes memory leaks, context losses, and driver-level crashes.

By compiling the composition down to static literals and executing Chromium with \--gl=swangle (SwiftShader CPU rasterization) and \--concurrency=1, rendering performance is made stable and deterministic. This design guarantees that 100% of Rig 2's GPU VRAM remains dedicated to heavy tensor operations (e.g., Wan diffusion models), completely shielding the compositing engine from GPU out-of-memory errors.

### **8\. Structural Comparison: Legacy vs. Current Architecture**

| Operational Dimension | goblin-viewport (Legacy Runtime Player) | goblin-viewport-template (Modern Metaprogram Compiler) |
| :---- | :---- | :---- |
| **System Role** | Monolithic, persistent runtime player application. | Offline metaprogram compiler and scaffolding template. |
| **Execution Target** | Executed directly as the rendering target for all episodes. | Never executed directly as an episode runtime target. |
| **Data Ingestion** | Ingested mutable external payloads (scene.json) dynamically at runtime. | Stamped out an independent, committed folder/repo per episode via generator script. |
| **Timeline Definition** | Evaluated dynamic arrays and variables at runtime via .map(). | **Source-Baking:** Hardcoded integer literals baked into static TSX (Episode\_XXX.tsx). |
| **Dependency Binding** | Shared components imported dynamically across episodes. | Components are vendored, pinned to strict semver packages, or locked to Git SHAs. |
| **Historical Integrity** | **Historical Corruption Trap:** Updating shared components broke past renders. | **Protected Builds:** Past episodes execute against frozen code and pinned dependencies. |
| **Directorial Overrides** | Black box; required re-prompting or external NLE post-production. | **Showrunner Eject Button:** Direct, diffable JSX adjustments protected by @lifecycle: locked. |
| **Hardware Workload** | Often competed for GPU resources with generative inference models. | Isolated to Rig 1 CPU/RAM via headless Chromium with \--gl=swangle. |
| **Reproducibility Exit Gate** | Assumed runtime consistency without deterministic guarantees. | Level 3 Decoded Media Equivalence (Δ*E*\<0.1, SSIM\>0.9999) backed by render\_manifest.json. |

---

*User prompt: {{FOCUS: 2\. State & Component Topologies: Template Core vs. Stamped Workspace}} /extreme-details*

Response: The separation between the **Template Core** (goblin-viewport-template) and the **Stamped Workspace** (goblin-episodes/episode-XXX/) forms the foundational architectural boundary of the presentation layer, transforming episodic video generation from an unmonitored runtime interpretation task into an offline, deterministic software compilation pipeline.

The Template Core is an immutable compiler, scaffolding blueprint, and component library; it is never executed directly as a broadcast media rendering target. In contrast, the Stamped Workspace is an isolated, committed, and statically baked software release containing frozen source code, pruned local assets, and an immutable build provenance manifest.

### **1\. Architectural Demarcation: The Two Topologies**

The relationship between the Template Core and the Stamped Workspace resolves the **historical corruption trap** by separating the mechanism of code generation from the artifact of presentation.

`┌─────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ TEMPLATE CORE: goblin-viewport-template (Offline Metaprogram Compiler & Scaffolding)   │`  
`├─────────────────────────────────────────────────────────────────────────────────────────┤`  
`│ • Authority: Transformation rules, camera heuristics, presentation component blueprints │`  
`│ • State: Zero narrative state, zero timeline allocations, zero episode-specific assets  │`  
`│ • Execution: Runs generator/generate-episode-repo.ts via Node.js on Rig 1 CPU           │`  
`└────────────────────────────────────────────┬────────────────────────────────────────────┘`  
                                             `│`  
                                             `│ Stamped via generator script`  
                                             `▼`  
`┌─────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ STAMPED WORKSPACE: goblin-episodes/ep040/ (Isolated, Executable Release Target)         │`  
`├─────────────────────────────────────────────────────────────────────────────────────────┤`  
`│ • Authority: Frozen presentation code for exactly ONE episodic narrative sequence       │`  
`│ • State: Source-baked numeric literals, absolute sequence offsets, localized visemes    │`  
`│ • Execution: Headless Chromium via Remotion CLI (--gl=swangle --concurrency=1)          │`  
`│ • Artifacts: Episode_040.tsx, render_manifest.json, pruned local asset envelope         │`  
`└─────────────────────────────────────────────────────────────────────────────────────────┘`

#### **The Template Core (Compiler Engine)**

> * **System Role:** Acts as an offline code generator, abstract syntax tree (AST) transformer, and component supplier.  
> * **State Profile:** Completely stateless regarding narrative lore, character injuries, and runtime events. It only knows transformation rules (e.g., mapping emotional tags to camera push-in parameters in style\_rules.json).  
> * **Dependency Posture:** Inherits centralized configurations from goblin-config via file-backed package links ("goblin-config": "file:../goblin-config"), preventing local configuration drift across the studio fleet.  
> * **Lifecycle:** Modified only when the studio updates its rendering engine, improves camera smoothing algorithms, or patches code generation bugs.

#### **The Stamped Workspace (Committed Release Artifact)**

> * **System Role:** A standalone, self-contained TypeScript and React package representing a single episode or scene cut (e.g., goblin-episodes/ep040/).  
> * **State Profile:** Contains fully resolved, source-baked state. Dynamic expressions (.map(), conditional branches) are replaced with static JSX elements and unquoted numeric literals.  
> * **Dependency Posture:** Structurally decoupled from the Template Core repository. Primitives are vendored locally or pinned to exact semantic versions (semver) to guarantee that future updates to the template cannot alter legacy renders.  
> * **Lifecycle:** Stamped by the generator, verified through progressive QA gates, cryptographically sealed, and permanently committed to the archive repository.

### **2\. Directory & Artifact Topologies**

The physical layouts of the two repositories reflect their opposing architectural roles—one optimized for parameterized code emission, the other for isolated, reproducible execution.

`goblin-viewport-template/                  goblin-episodes/ep040/`  
`├── generator/                             ├── components/                  # Vendored Presentation`  
`│   ├── generate-episode-repo.ts           │   ├── GoblinPuppet.tsx         # Isolated puppet rig`  
`│   ├── compile-camera-tracks.ts           │   ├── CameraWrappers.tsx       # Scoped shot wrappers`  
`│   └── style_rules.json                   │   ├── AmbientTrack.tsx         # Ducked audio bed`  
`├── scripts/                               │   └── FoleyTrack.tsx           # Pinned sound effects`  
`│   ├── collect-episode-assets.ts          ├── public/                      # Pruned Local Assets (<100MB)`  
`│   └── sync-assets.ts                     │   ├── assets/`  
`├── src/                                   │   │   ├── sprites/             # Only ep040 variants`  
`│   ├── components/                        │   │   │   ├── bog_humiliated.png`  
`│   │   ├── GoblinPuppet.tsx               │   │   │   └── spleen_defensive.png`  
`│   │   ├── CameraWrappers.tsx             │   │   └── visemes/             # Only referenced visemes`  
`│   │   └── AudioTracks.tsx                │   └── audio/`  
`│   └── index.ts                           │       ├── ep040_sh01.wav`  
`├── test/                                  │       └── ep040_sh02.wav`  
`│   ├── fixtures/                          ├── Episode_040.tsx              # Source-Baked React Tree`  
`│   └── golden/                            ├── render_manifest.json         # Cryptographic Build Lockfile`  
`├── package.json                           ├── remotion.config.ts           # Swangle Software GL Conf`  
`└── tsconfig.json                          ├── package.json                 # Pinned Dependencies (No Carats)`  
                                           `└── tsconfig.json`

| Dimension | Template Core (goblin-viewport-template) | Stamped Workspace (goblin-episodes/epXXX/) |
| :---- | :---- | :---- |
| **Workspace Mutability** | Living codebase; updated via standard pull requests. | Append-only; frozen upon release acceptance. |
| **Asset Strategy** | Holds utility scripts; assets are pulled on demand. | Holds a pruned, self-contained subset of binary assets (\<100MB). |
| **Composition File** | Generic parameterized scaffolding wrappers. | Episode\_XXX.tsx with static, literal JSX properties. |
| **Component Source** | Canonical authoring source for all visual components. | Vendored copies or pinned semver packages (@studio/viewport@1.4.2). |
| **Execution Target** | Executes generation tests and snapshot linter suites. | Executes Remotion CLI headless video rasterization. |
| **Lockfile Nature** | Manages development toolchain dependencies. | Houses render\_manifest.json sealing the multi-repo DAG. |

### **3\. Component Topologies & The Import-Leak Defense**

A primary failure mode of template-driven architectures is the **Shared-Component Import Leak**. If a stamped workspace imports presentation components via relative paths escaping its own directory boundary, changes to the core template will corrupt legacy episode builds:

`// THE SHARED-COMPONENT IMPORT LEAK (Fatal Anti-Pattern)`  
`// Inside goblin-episodes/ep040/Episode_040.tsx:`  
`import { GoblinPuppet } from '../../../goblin-viewport-template/src/components/GoblinPuppet';`

If GoblinPuppet.tsx is updated months later to introduce a new squash-and-stretch curve, re-rendering Episode\_040.tsx executes the updated logic, causing visual drift despite a frozen timeline. The system prevents this by enforcing one of three component boundary strategies:

`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│                        COMPONENT BOUNDARY ISOLATION STRATEGIES                         │`  
`├────────────────────────────────────────────────────────────────────────────────────────┤`  
`│ 1. LOCAL COMPONENT VENDORING (Standard Industrial Pattern)                             │`  
`│    • generate-episode-repo.ts physically copies required primitives into               │`  
`│      goblin-episodes/epXXX/components/ at generation time.                             │`  
`│    • Import resolves locally: import { GoblinPuppet } from './components/GoblinPuppet'.│`  
`│    • Result: The episode codebase is completely self-contained and isolated.           │`  
`├────────────────────────────────────────────────────────────────────────────────────────┤`  
`│ 2. IMMUTABLE SEMVER PACKAGE REGISTRIES                                                 │`  
`│    • Primitives are published to a private registry: @studio/viewport@1.4.2.           │`  
`│    • package.json strictly pins the exact version without carats (^) or tildes (~).    │`  
`│    • Result: Dependencies cannot float or auto-upgrade during CI installs.            │`  
`├────────────────────────────────────────────────────────────────────────────────────────┤`  
`│ 3. GIT SUBMODULE COMMIT PINNING                                                        │`  
`│    • Viewport code is tracked as a Git submodule locked to an immutable 40-hex SHA.    │`  
`│    • Result: Headless builds check out the exact historical tree matching the release. │`  
`└────────────────────────────────────────────────────────────────────────────────────────┘`

#### **AST Path Traversal Linters**

To guarantee boundary compliance, the CI verification harness inspects the AST of every emitted file using the TypeScript Compiler API (ts-morph). The linter parses all ImportDeclaration nodes and terminates with a non-zero exit code if any specifier contains parent directory traversal (../..) that escapes the episode workspace root.

### **4\. State Topology: The Dynamic-to-Static Elimination Transform**

The Template Core compiles dynamic upstream state into static code, moving all evaluations from render time to build time.

                  `THE STATE ELIMINATION TRANSFORMATION`  
                    
`UPSTREAM DYNAMIC STATE (AST / Exposure Sheet / Manifest)`  
`• Dynamic array: rounds = [{ speaker: "BOG", duration_ms: 3120, emotion: "humiliated" }]`  
`• Runtime calculation: target_frames = ceil((3120 / 1000) * 24) = 75`  
`• Dynamic coordinate lookup: manifest.json -> anchor_point { x: 512, y: 980 }`  
`• Dynamic audio ducking: sidechain curve computed on the fly`  
                                   `│`  
                                   `▼`  
        `[ generator/generate-episode-repo.ts Compiler ]`  
                                   `│`  
                                   `▼`  
`STAMPED STATIC JSX (Episode_040.tsx)`  
`• Literal frame integers: <Sequence from={0} durationInFrames={75}>`  
`• Pre-calculated origin: <Shot01CameraWrapper originX="48.2%" originY="21.4%">`  
`• Explicit component binding: <GoblinPuppet character="BOG" emotion="humiliated" />`  
`• Locked audio mount: <Audio src={staticFile("audio/ep040_sh01.wav")} volume={1.0} />`

#### **Absolute Integer Sequence Accumulation**

Dynamic media players evaluate offsets sequentially, causing sub-frame rounding drift across cuts. The compiler precomputes absolute frame boundaries during code generation:

fromFrame*k*​\=*i*\=1∑*k*−1​duration*i*​

Each \<Sequence\> tag in the stamped workspace receives an unquoted integer literal (from={0}, from={75}, from={174}). Audio stems mount at exact frame boundaries, synchronizing speech delivery with visual cuts and absorbing minor sub-frame timing variations within post-roll padding.

#### **Sequence-Relative Hook Scoping**

Remotion evaluates animation hooks like useCurrentFrame() relative to the mounting component. If hooks are evaluated at the composition root, later cuts calculate camera curves against global scene time, breaking multi-shot sequences. The compiler generates dedicated shot wrappers (\<Shot01CameraWrapper\>, \<Shot02CameraWrapper\>) for each cut, ensuring useCurrentFrame() resets to 0 inside every sequence.

#### **Coordinate Space Projection Math**

Sprite-local anchor coordinates (1024×1024) cannot be directly applied to master composition canvases (1920×1080). The generator normalizes coordinates at compile time by factoring in puppet positioning offsets and active scale factors (*s*):

originXglobal​\=canvas.widthpuppet.x+(anchor.x×*s*)​×100%  
originYglobal​\=canvas.heightpuppet.y+(anchor.y×*s*)​×100%

These calculated values are printed directly into inline style.transformOrigin properties, allowing camera push-ins to execute smoothly without runtime coordinate translation.

### **5\. Asset Topology & The Pruned Storage Envelope**

The visual asset repository (goblin-assets-visual) contains complete character emotion banks, alternative poses, and high-resolution background plates exceeding tens of gigabytes. Copying the full library into every episode directory would lead to repository bloat and slow down CI checkouts.

               `EPISODE ASSET HARVESTING & PRUNING PIPELINE`  
                 
   `[ goblin-assets-visual ] (Multi-Gigabyte Global Master Library)`  
   `├── characters/bog/ (All 48 emotions, turnarounds, props)`  
   `├── characters/spleen/ (All 52 emotions, turnarounds, props)`  
   `└── backgrounds/ (All master environmental matte plates)`  
                               `│`  
                               `▼`  
            `[ scripts/collect-episode-assets.ts ]`  
            `• Scans Episode_040 AST nodes`  
            `• Identifies referenced sprites:`  
              `- BOG: humiliated, idle`  
              `- SPLEEN: defensive, idle`  
            `• Identifies referenced visemes: closed, small, medium, wide`  
            `• Identifies referenced background: swamp_relay_matte.png`  
                               `│`  
                               `▼`  
   `[ goblin-episodes/ep040/public/assets/ ] (Pruned Local Staging)`  
   `• Total footprint: 18.4 MB (Enforces < 100MB-150MB Ceiling)`  
   `• Zero extraneous assets; 100% offline self-containment`

> * **AST Dependency Crawl:** collect-episode-assets.ts parses the compiled scene AST to extract every referenced character ID, emotion condition, and mouth shape cue.  
> * **Selective Staging:** Only the specific PNG assets and synthesized .wav stems required for the episode are copied into goblin-episodes/epXXX/public/assets/.  
> * **Storage Bounds:** The pruned workspace asset bundle occupies between 5MB and 28MB, comfortably beneath the mandatory 100MB to 150MB per-episode storage ceiling.  
> * **The Zero-Byte Hash Trap:** Before rendering, the asset harness calculates the SHA-256 digest of every staged binary. If any file matches the empty-file signature (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855), compilation halts immediately, catching corrupted asset downloads before headless Chromium initializes.

### **6\. Governance & Header Lifecycle Topology**

To allow human directors to adjust camera angles, timing curves, or SVG filters without having their work overwritten by automated pipeline runs, Episode\_XXX.tsx incorporates an embedded cryptographic lifecycle header:

`// @lifecycle: generated | patched | locked`  
`// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f`  
`// @patch_history: ["QA-EP040-SH01-ZOOM_ALIGN"]`  
`// @upstream_ast: sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f...`

                     `SEALED HEADER ARBITRATION MATRIX`  
                                     `│`  
                                     `▼`  
                      `Incoming Pipeline Generation Run`  
                                     `│`  
                                     `▼`  
                    `Inspect Episode_XXX.tsx Header`  
                                     `│`  
         `┌───────────────────────────┼───────────────────────────┐`  
         `▼                           ▼                           ▼`  
`[@lifecycle: generated]     [@lifecycle: patched]       [@lifecycle: locked]`  
`• Checksum matches body     • Verified diagnostic fix   • Human Director edit`  
`• Safe in-place overwrite   • Re-evaluates AST diff     • OVERWRITE FORBIDDEN`  
`• Automated CI merge        • Bounded patch accepted    • Emits .candidate.tsx`  
                                                        `• Emits DIRECTOR_OVERRIDE`

> 1. **@lifecycle: generated:** Applied by generate-episode-repo.ts upon initial creation. The checksum is computed across the file body normalized to LF line endings (\\n). If the upstream narrative AST changes and the file remains unmodified, the generator overwrites it cleanly.  
> 2. **@lifecycle: patched:** Applied when automated visual QA diagnostic agents (such as Jules) perform targeted AST repairs using ts-morph to fix geometric issues (e.g., viseme alignment). Patches are accepted only if the AST diff is strictly confined to whitelisted layout properties.  
> 3. **@lifecycle: locked:** Applied when a human director pulls the "Showrunner Eject Button" to manually adjust presentation code. If the generator runs again, it detects the @locked tag (or a hash mismatch indicating manual edits). The generator **refuses to overwrite the file**; it writes its output to Episode\_XXX.candidate.tsx and halts, logging an immutable DIRECTOR\_OVERRIDE event into the historical ledger.

### **7\. Physical Execution Topology & Hardware Demarcation**

The separation between template compilation and workspace rendering is mirrored across the physical hardware infrastructure, keeping resource-intensive tasks isolated.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: ORCHESTRATION & OPTICAL ASSEMBLY (Pure CPU & System RAM)        │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • worker-sower-conductor: Master execution loop, POSIX Node.js runtime │`  
`│ • Local TTS Service: Port 8000 speech synthesis (CPU bound)            │`  
`│ • Temporal Quantizer: Child process ffprobe measuring millisecond audio│`  
`│ • goblin-viewport-template: Offline code generator                     │`  
`│ • Stamped Episode Render: Remotion CLI headless Chromium rasterization │`  
`│   - Execution Flags: --gl=swangle --concurrency=1                      │`  
`│   - Decoder: <OffthreadVideo /> off-thread media decoding              │`  
`│   - Resource Footprint: ZERO GPU VRAM / Dedicated Multi-Core CPU       │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Network API Call (JSON Contract)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: GPU TENSOR FOUNDRY (Dedicated High-VRAM Silicon)                │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Headless ComfyUI Daemon: Port 8188                                   │`  
`│ • Tensor Operations: Wan 2.2 diffusion checkpoints, LoRA inference     │`  
`│ • Memory Profile: 20 GB to 24 GB unfragmented VRAM footprint           │`  
`│ • Structural Rule: ZERO Chromium instances, ZERO Remotion renders      │`  
`│ • Deliverable: Raw #00FF00 greenscreen character plates saved to R2    │`  
`└────────────────────────────────────────────────────────────────────────┘`

Executing Remotion rendering in the stamped workspace is strictly a CPU and system-RAM workload on Rig 1\. Headless Chromium instances running hardware OpenGL on Linux often experience GPU memory leaks, context losses, and driver crashes.

By compiling the episode down to static JSX literals and rendering Chromium via software OpenGL (--gl=swangle) with single-threaded concurrency (--concurrency=1), the render pipeline remains stable and deterministic. This guarantees that 100% of Rig 2's GPU VRAM remains available for heavy diffusion passes, completely protecting the compositing stage from GPU out-of-memory crashes.

---

*User prompt: {{FOCUS: 3\. The Source-Baking Ingestion Pipeline}} /extreme-details*

Response: The **Source-Baking Ingestion Pipeline** within goblin-viewport-template is the offline code-generation compiler that converts upstream narrative intentions, acoustic waveforms, and visual spatial contracts into immutable, type-safe React source code (Episode\_XXX.tsx). Rather than functioning as a traditional media player that dynamically fetches and evaluates JSON sidecars at runtime, the ingestion pipeline runs as a build-time pre-pass orchestrated by generator/generate-episode-repo.ts. It ingests raw data off local disk, resolves all spatial coordinates and temporal budgets upfront, and stamps out a frozen, self-contained workspace inside goblin-episodes/.

                     `THE INGESTION COMPILATION TOPOLOGY`  
                       
 `┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐`  
 `│ worker-sower-engine  │  │  audio-microservice   │  │ goblin-assets-visual │`  
 `│ • dialogue_ast.json  │  │ • dialogue *.wav     │  │ • manifest.json      │`  
 `│ • semantic MRU beats │  │ • exposure_sheet.json│  │ • anchors & visemes  │`  
 `└──────────┬───────────┘  └──────────┬───────────┘  └──────────┬───────────┘`  
            `│                         │                         │`  
            `└────────────────────┐    │    ┌────────────────────┘`  
                                 `▼    ▼    ▼`  
     `┌──────────────────────────────────────────────────────────────────┐`  
     `│ goblin-viewport-template/generator/generate-episode-repo.ts      │`  
     `├──────────────────────────────────────────────────────────────────┤`  
     `│ 1. Schema Ingestion & Parity Audit (Zod + SHA-256 checks)        │`  
     `│ 2. Dual-Clock Temporal Quantization (ceil(ms/1000 * 24))         │`  
     `│ 3. Spatial Origin Normalization (sprite-to-canvas projection)    │`  
     `│ 4. Asset Envelope Harvesting (collect-episode-assets.ts < 100MB) │`  
     `│ 5. Literal Source Printing (Episode_XXX.tsx JSX emission)        │`  
     `└──────────────────────────────────┬───────────────────────────────┘`  
                                        `│`  
                                        `▼`  
     `┌──────────────────────────────────────────────────────────────────┐`  
     `│ goblin-episodes/ep040/ (Committed Release Package)               │`  
     `│ • Episode_040.tsx (Hardcoded JSX literal timeline)               │`  
     `│ • render_manifest.json (Cryptographic provenance lockfile)       │`  
     `│ • components/ (Vendored GoblinPuppet and Camera rigs)            │`  
     `│ • public/assets/ (Pruned sprites, visemes, and audio stems)      │`  
     `└──────────────────────────────────────────────────────────────────┘`

### **1\. The Tripartite Upstream Ingestion Contracts**

The compiler refuses to process unverified prose or loosely structured payloads. Before emitting any source code, it requires three explicit, schema-validated contracts on disk:

#### **Contract A: Screenplay & Machine Dialogue AST (dialogue\_ast.json)**

Emitted by worker-sower-engine (via the Conductor in src/pipeline/produceEpisode.ts), this artifact contains the semantic, somatic, and pacing directives of the scene:

> * **Actor & Dialogue Literals:** Explicit speaker IDs (speaker: "BOG") and the verbatim synthesized line (dialogue\_text). Downstream presentation components never parse script prose directly; the spoken text in the AST is the exact phonetic string delivered to speech synthesis.  
> * **Emotional Conditions:** Strongly typed condition tags (conditions: \["humiliated"\]) mapped to a closed enumeration in the canon schema. These tags determine which base sprite variant is mounted by the character component.  
> * **Swain Motivation-Reaction Unit (MRU) Directives:** Explicit kinetic cues (e.g., reaction\_cue: "VISCERAL\_STING"). Generative models naturally lack an innate sense of physical timing and often begin speaking simultaneously with a stimulus. When an MRU sting is declared, the ingestion compiler injects an authored reaction window (e.g., a 12-to-24 frame hold or camera push-in) *before* speech audio begins.  
> * **Provenance Lineage Seal:** Every ingested AST contains the canonical root hash (*H*root​) of the narrative ledger from which it was compiled, ensuring that obsolete script versions cannot accidentally compile into active builds.

#### **Contract B: Quantized Timing Manifest (exposure\_sheet.json)**

Audio serves as the non-negotiable physical master clock of the studio. Produced by produceEpisode.ts following text-to-speech synthesis, the timing manifest bridges continuous physical acoustics to discrete video time:

> * **Acoustic Duration Sweeps:** Every synthesized 48 kHz uncompressed .wav stem is probed using a local ffprobe child process to extract its continuous duration in milliseconds (*D*ms​).  
> * **Ceiling Quantization Formula:** Because video displays in discrete frames (24 fps), the ingestion pipeline quantizes continuous acoustic durations using an integer ceiling formula:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉  
>   *Worked Example:* A dialogue stem measuring 3,120 ms resolves to:  
>   ⌈10003120​×24⌉\=⌈74.88⌉=75 frames  
> * **Tail Slack & Pad Frames:** The 0.12 frame difference (5.0 ms) between speech cessation and the 75th frame boundary is absorbed as natural decay padding, preventing speech from cutting off abruptly at shot boundaries.  
> * **Sidechain Ducking Envelope:** Defines precise audio levels, configuring the ambient background music bed to attenuate by **\-14 dB** during dialogue frames with a 4-frame ramp up and down.

#### **Contract C: Visual Asset Contract (manifest.json)**

Consumed from goblin-assets-visual/characters/{id}/manifest.json, this typed contract defines the geometric boundaries and motion characteristics of the puppets:

`{`  
  `"character_id": "char_bog",`  
  `"version": "1.4.0",`  
  `"native_dimensions": { "width": 1024, "height": 1024 },`  
  `"anchor_point": { "x": 512, "y": 980 },`  
  `"camera_anchor_points": {`  
    `"crash_zoom_target": { "x": 412, "y": 198 }`  
  `},`  
  `"mouth_bounding_box": { "x": 380, "y": 240, "width": 64, "height": 32 },`  
  `"animation_hints": {`  
    `"talk_bounce_amplitude": 8,`  
    `"idle_shiver_amplitude": 14`  
  `},`  
  `"variants": {`  
    `"idle": "sprites/bog_idle.png",`  
    `"humiliated": "sprites/bog_humiliated.png",`  
    `"terrified": null`  
  `}`  
`}`

> * **Ground Contact Pivots (anchor\_point):** Coordinates indicating the lowest center point of foot contact on the sprite, used to align characters with the background plane (*Y*ground​).  
> * **Camera Facial Centroids (crash\_zoom\_target):** Precise coordinate targets centered on the facial centroid or eye line to guide camera transforms.  
> * **Modular Viseme Envelopes (mouth\_bounding\_box):** The bounding box where modular mouth textures (closed, small, medium, wide) mount over the base sprite.  
> * **Motion Physics Scalars (animation\_hints):** Dynamic weighting scalars that configure how generic components (GoblinPuppet.tsx) handle idle breathing and speech bounce.  
> * **The Explicit Null Protocol:** Missing variants are explicitly declared as null. Draft animatics gracefully substitute variants.idle; production mastering builds treat unhandled null tags as fatal exceptions, halting compilation immediately.

### **2\. The Five Processing Stages of generate-episode-repo.ts**

The metaprogram compiler processes ingested inputs through a five-stage assembly pipeline:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STAGE 1: INGESTION & PRE-FLIGHT VALIDATION                             │`  
`│ • Schema validation across all three upstream contracts                │`  
`│ • Parity audit: Verifies audio stems and sprites exist on disk         │`  
`│ • Zero-Byte Trap: Rejects files with SHA-256 e3b0c442...               │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ STAGE 2: TEMPORAL QUANTIZATION & ACCUMULATION                          │`  
`│ • Calculates absolute sequence offsets: fromFrame_k = SUM(durations)   │`  
`│ • Injects Dwight Swain MRU reaction holds (12–24 frames pre-speech)    │`  
`│ • Generates sidechain audio ducking boundaries (-14 dB attenuation)    │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ STAGE 3: SPATIAL COORDINATE NORMALIZATION                              │`  
`│ • Projects sprite coordinates (1024x1024) to canvas space (1920x1080) │`  
`│ • Normalizes facial zoom targets factoring in puppet scale factor (s)  │`  
`│ • Bakes CSS transformOrigin percentages into camera wrappers           │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ STAGE 4: ASSET HARVESTING & PRUNING (collect-episode-assets.ts)        │`  
`│ • Crawls AST to extract only referenced sprites, visemes, and audio    │`  
`│ • Stages pruned files into episode workspace (< 100MB-150MB envelope)  │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ STAGE 5: STATIC TSX CODE GENERATION & PROVENANCE SEALING               │`  
`│ • Synthesizes Episode_XXX.tsx with unquoted numeric JSX literals       │`  
`│ • Enforces sequence-relative hook scoping via isolated shot wrappers   │`  
`│ • Computes normalized LF body checksum; stamps @lifecycle header       │`  
`│ • Emits render_manifest.json linking multi-repo Git commit SHAs        │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **Stage 1: Ingestion & Pre-Flight Validation**

The generator loads the three contracts into volatile memory and runs pre-flight integrity audits:

> 1. **Zod Schema Assertions:** Confirms that field types, arrays, and numeric intervals match engine specifications.  
> 2. **The Zero-Byte Poison Trap:** Computes the SHA-256 binary hash of every referenced audio file and image sprite. If any file produces the empty-file hash (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855), the generator halts immediately, preventing truncated assets from polluting the build.  
> 3. **Disk Parity Sweep:** Every path referenced in dialogue\_ast.json and manifest.json must resolve to a valid file on disk; missing assets trigger an immediate build failure.

#### **Stage 2: Temporal Quantization & Absolute Timeline Accumulation**

To eliminate cumulative timing drift, the generator avoids dynamically concatenating media clips end-to-end at runtime. Instead, it precomputes the absolute integer start frame for every shot:

fromFrame*k*​\=*i*\=1∑*k*−1​total\_shot\_frames*i*​

Where total\_shot\_frames*i*​\=mru\_pre\_roll*i*​\+target\_frames*i*​\+post\_roll*i*​.

By assigning explicit start frames, each dialogue stem mounts at an exact frame coordinate (*f*/24 seconds), ensuring audio-visual synchronization without rounding drift over long scenes.

#### **Stage 3: Spatial Coordinate Normalization & Projection Math**

Characters exist as high-resolution assets (often 1024×1024), but scenes are composited on a 1920×1080 canvas. To prevent crash zooms from drifting away from facial targets or decapitating puppets, the compiler normalizes local puppet coordinates into global canvas percentages at generation time:

originXglobal​\=canvas.widthpuppet.x+(anchor.x×*s*)​×100%  
originYglobal​\=canvas.heightpuppet.y+(anchor.y×*s*)​×100%

*(where s represents the puppet's active scale factor, and puppet.x,puppet.y represent the puppet's stage coordinates)*.

These calculated values are printed directly into inline style.transformOrigin properties, allowing camera push-ins to run smoothly during rendering without dynamic layout calculations.

#### **Stage 4: Asset Harvesting & Pruning (collect-episode-assets.ts)**

Global asset repositories like goblin-assets-visual contain dozens of gigabytes of character poses and textures. Copying the complete asset library into each episode directory would bloat disk usage and slow down CI builds.

The ingestion pipeline executes collect-episode-assets.ts, which traverses the scene AST and copies *only* the specific sprites, background mattes, and mouth visemes referenced in that episode into goblin-episodes/epXXX/public/assets/. This prunes the per-episode storage footprint down to between 5MB and 28MB, comfortably beneath the studio's 100MB to 150MB storage ceiling while preserving offline self-containment.

#### **Stage 5: Static TSX Code Generation & Provenance Sealing**

The generator synthesizes the React component tree into a single TypeScript file (Episode\_XXX.tsx), enforcing three strict coding rules:

> 1. **Unquoted Numeric Literals:** Properties are written as pure numbers (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>), eliminating runtime string parsing and type-coercion errors.  
> 2. **Sequence-Relative Hook Isolation:** Remotion evaluates hooks like useCurrentFrame() relative to the mounting component. If camera hooks are evaluated at the root level, multi-shot sequences evaluate curves against global scene time. The compiler generates dedicated shot wrappers (\<Shot01CameraWrapper\>, \<Shot02CameraWrapper\>) for each cut, ensuring useCurrentFrame() resets to 0 inside every sequence.  
> 3. **Cryptographic Sealed-File Header:** The file is stamped with an explicit lifecycle header containing a SHA-256 body checksum calculated over normalized LF line endings (\\n):  
>    `// @lifecycle: generated`  
>    `// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f`  
>    `// @upstream_ast: sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d`

### **3\. Generated Code Anatomy: The Stamped Artifact**

The resulting Episode\_040.tsx represents a statically baked, human-readable, and diffable React component tree:

`// goblin-episodes/ep040/Episode_040.tsx`  
`// @lifecycle: generated`  
`// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f`  
`// @upstream_ast: sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d`

`import React from 'react';`  
`import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';`  
`import { GoblinPuppet } from './components/GoblinPuppet';`  
`import { Shot01CameraWrapper, Shot02CameraWrapper } from './components/CameraWrappers';`

`export const Episode_040: React.FC = () => {`  
  `return (`  
    `<AbsoluteFill style={{ backgroundColor: '#050505' }}>`  
      `{/* SHOT 01: Dialogue line_001 (BOG) */}`  
      `<Sequence from={0} durationInFrames={75}>`  
        `<Shot01CameraWrapper originX="48.2%" originY="21.4%">`  
          `<GoblinPuppet`  
            `character="BOG"`  
            `emotion="humiliated"`  
            `anchorPoint={{ x: 512, y: 980 }}`  
            `mouthBoundingBox={{ x: 380, y: 240, width: 64, height: 32 }}`  
            `talkBounceAmplitude={8}`  
            `spriteSrc={staticFile("assets/sprites/bog_humiliated.png")}`  
          `/>`  
          `<Audio`  
            `src={staticFile("audio/dialogue/ep040_sh01.wav")}`  
            `volume={1.0}`  
          `/>`  
        `</Shot01CameraWrapper>`  
      `</Sequence>`

      `{/* SHOT 02: Dialogue line_002 (SPLEEN) */}`  
      `<Sequence from={75} durationInFrames={99}>`  
        `<Shot02CameraWrapper originX="51.0%" originY="19.8%">`  
          `<GoblinPuppet`  
            `character="SPLEEN"`  
            `emotion="defensive"`  
            `anchorPoint={{ x: 480, y: 960 }}`  
            `mouthBoundingBox={{ x: 410, y: 220, width: 58, height: 30 }}`  
            `talkBounceAmplitude={14}`  
            `spriteSrc={staticFile("assets/sprites/spleen_defensive.png")}`  
          `/>`  
          `<Audio`  
            `src={staticFile("audio/dialogue/ep040_sh02.wav")}`  
            `volume={1.0}`  
          `/>`  
        `</Shot02CameraWrapper>`  
      `</Sequence>`  
    `</AbsoluteFill>`  
  `);`  
`};`

### **4\. Hardware Demarcation & Ingestion Failure Routing**

The ingestion compiler runs on the CPU-bound Rig 1 workstation, requiring zero GPU resources:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: ORCHESTRATION & INGESTION COMPILER (Pure Multi-Core CPU / RAM)  │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • worker-sower-engine: Conflict simulation, duel math, AST compilation │`  
`│ • Local TTS Service (Port 8000): Synthesizes uncompressed dialogue WAVs│`  
`│ • Child Process (ffprobe): Quantizes continuous durations into frames  │`  
`│ • generate-episode-repo.ts: Ingestion compiler and TSX source-baker    │`  
`│ • Remotion CLI Execution: Headless Chromium via --gl=swangle           │`  
`│ • Resource Footprint: ZERO GPU VRAM / 100% CPU and System Memory       │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Pure JSON API Contract`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: GPU TENSOR FOUNDRY (High-VRAM Diffusion Workstation)            │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Headless ComfyUI Daemon (Port 8188)                                  │`  
`│ • Heavy Video Diffusion Models (Wan 2.2, LoRA adapters)                │`  
`│ • 100% of GPU VRAM dedicated to tensor inference                       │`  
`│ • ZERO Remotion processes / ZERO Chromium instances                    │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **Three-Class Ingestion Error Routing**

Errors encountered during ingestion are handled through three explicit operational paths:

| Error Category | Example Failures | System Response | Compute Impact |
| :---- | :---- | :---- | :---- |
| **Deterministic Failures** | Missing .wav stem, zero-byte file, unmapped emotion, broken schema. | **Immediate Fatal Halt (Exit 1).** The compiler aborts without retrying, flagging the broken contract. | **\$0.00**; no downstream rendering runs. |
| **Stochastic Failures** | TTS audio clipped, unnatural pacing inflection, synthetic vocal pop. | **Bounded Retry (Max 2).** Re-synthesizes audio with adjusted TTS seeds before compiling. | Minimal local CPU re-run. |
| **Infrastructure Failures** | Disk write contention, POSIX rename lock, transient OS I/O error. | **Idempotent Resume.** Resumes compilation from the last verified temporary file using its UUIDv7 key. | Zero loss; uncorrupted state preserved. |

### **5\. Provenance Root: render\_manifest.json**

The final operation of the ingestion and source-baking process is the generation of render\_manifest.json, an immutable build lockfile placed at the root of the stamped episode:

Build ID=H(Canon Root+Dialogue AST+Audio Manifest+Visual Assets+Toolchains)  
`{`  
  `"build_id": "sha256:4f8a1209bc87e5d...",`  
  `"episode_id": "EP040",`  
  `"generated_at": "2026-09-28T15:44:00Z",`  
  `"source_target": "Episode_040.tsx",`  
  `"source_body_sha256": "7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",`  
  `"upstream_contracts": {`  
    `"dialogue_ast_hash": "sha256:12c8a994ef7b8c9d...",`  
    `"exposure_sheet_hash": "sha256:9c3e401b2a4d5e...",`  
    `"canon_commit_sha": "git:9c3e401",`  
    `"visual_assets_tag": "git:v1.4.0",`  
    `"viewport_template_sha": "git:4f8a120"`  
  `},`  
  `"acoustic_assets": {`  
    `"ep040_sh01.wav": "sha256:4a8c9e2b10a5...",`  
    `"ep040_sh02.wav": "sha256:9c1d8e3f4a7b..."`  
  `},`  
  `"visual_assets": {`  
    `"bog_humiliated.png": "sha256:7f83b1657ff1...",`  
    `"spleen_defensive.png": "sha256:a3b4c5d6e7f8..."`  
  `},`  
  `"runtime_environment": {`  
    `"node_version": "v20.12.0",`  
    `"remotion_version": "4.0.140",`  
    `"chromium_milestone": "122.0.6261.94",`  
    `"ffmpeg_build": "6.1.1-static",`  
    `"font_manifest": {`  
      `"Cinzel-Bold.ttf": "sha256:5a6b7c8d9e..."`  
    `}`  
  `}`  
`}`

By freezing upstream Git hashes, acoustic binary digests, sprite checksums, and the exact headless browser binary, the ingestion pipeline transforms an abstract screenplay into a self-contained, permanently reproducible software release. When executed by Remotion CLI using software OpenGL (--gl=swangle) on Rig 1, the baked composition produces bit-identical video deliverables across production environments.

---

*User prompt: {{FOCUS: 4\. The Sealed-File Lifecycle & Cryptographic State Machine}} /extreme-details*

Response: The Sealed-File Lifecycle and Cryptographic State Machine in goblin-viewport-template establishes a deterministic boundary between automated code generation, automated diagnostic repair, and human artistic intervention. Designed around the showrunner's "Eject Button," this subsystem ensures that automated upstream pipeline runs never clobber hand-tuned presentation code, while simultaneously preventing manual edits from going unrecorded in the canonical audit ledger.

### **Architectural Purpose & The "Showrunner Eject Button"**

In automated media compilation, treating human intervention as an exceptional defect or failure creates an operational bottleneck. A finished creative artifact frequently requires manual aesthetic refinement, such as adjusting a camera push-in easing curve, fine-tuning an SVG filter, or altering sub-frame timing in the generated React component tree (Episode\_XXX.tsx). However, if an upstream script bugfix or narrative errata in worker-sower-engine triggers a pipeline re-run, a naive code generator will overwrite Episode\_XXX.tsx, destroying all human polish.

The sealed-file architecture resolves this by enforcing a core principle: **automation may create, automation may diagnose, but automation must never silently destroy human decisions**. Human intervention is codified as a first-class, auditable state transition governed by cryptographic verification rather than mutable filesystem permissions.

                     `SEALED-FILE STATE MACHINE & MERGE ARBITRATION`  
                       
                        `[ generator/generate-episode-repo.ts ]`  
                                          `│`  
                                          `▼`  
                              `// @lifecycle: generated`  
                              `// @checksum: SHA-256(Body)`  
                                          `│`  
                  `┌───────────────────────┴───────────────────────┐`  
                  `│                                               │`  
                  `▼ (Automated QA Agent)                          ▼ (Human Director)`  
        `// @lifecycle: patched                          // @lifecycle: locked`  
        `• Target: ts-morph AST surgery                  • Target: The "Eject Button"`  
        `• Scope: Whitelisted JSX props                  • Scope: Unconstrained creative polish`  
        `• Audit: CI verifies AST diff                   • Event: Emits DIRECTOR_OVERRIDE`  
        `• Gate: Automated merge if clean                • Guard: Hard block on regeneration`

### **Header Anatomy & Checksum Normalization**

Every generated episode composition file embeds a machine-readable, cryptographic comment block at byte 0 of the file:

`// @lifecycle: generated | patched | locked`  
`// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f`  
`// @patch_history: ["QA-EP040-SH01-ZOOM_ALIGN"]`

To ensure that the body checksum behaves as an objective mathematical contract rather than a platform-dependent value, the hashing engine enforces strict normalization:

> * **Normalized LF Delimiters:** Checksums are computed strictly over LF line endings (0x0A). Repository workspaces enforce this via .gitattributes (\* text=auto eol=lf), preventing Windows CRLF translations from breaking checksum verification.  
> * **Deterministic Exclusion:** The hashing pass isolates the file body beneath the header comment block. The SHA-256 digest is generated against the normalized UTF-8 byte stream of the component JSX, guaranteeing that comments inside the sealed header do not introduce circular hash dependencies.

### **The Three Lifecycle States & Authority Tiers**

The state machine codifies three discrete tiers of file maturity, each carrying explicit merge authorities and regeneration rules:

| Lifecycle State | Author Target | Verification Mechanism | CI Merge Authority | Upstream Regeneration Action |
| :---- | :---- | :---- | :---- | :---- |
| **@lifecycle: generated** | Metaprogram compiler (generate-episode-repo.ts) | SHA-256 of normalized body matches the @checksum header value. | **Automated Merge:** Merges automatically via CI when lint and type checks pass. | **Clean In-Place Overwrite:** Upstream pipeline overwrites file safely. |
| **@lifecycle: patched** | Automated diagnostic repair agents (e.g., Jules CV agent) | TypeScript AST diff verified via ts-morph against whitelisted properties. | **Bounded Merge:** Merges only if the diff is confirmed to be strictly isolated. | **Review Required:** Notifies the agent; regeneration halts if unmerged. |
| **@lifecycle: locked** | Human director (The "Showrunner Eject Button") | Explicit @lifecycle: locked tag present in the header. | **Manual Approval Gate:** Requires explicit, signed human review. | **Hard Stop:** Generator emits Episode\_XXX.candidate.tsx. |

#### **1\. The @lifecycle: generated Tier**

Stamped by generate-episode-repo.ts upon initial code emission. As long as the on-disk file body matches the burned header checksum, the compiler knows the file has not experienced human edits. In this state, continuous integration systems retain full authority to re-render, re-stamp, or overwrite the file during routine pipeline builds.

#### **2\. The @lifecycle: patched Tier**

When automated computer vision (CV) or audio verification gates flag a physical defect (e.g., a mouth viseme bounding box drifting 24px off the facial anchor), a diagnostic repair agent (Jules) executes surgical AST repairs. Rather than modifying files freely, the agent performs targeted prop mutations using the TypeScript Compiler API (ts-morph), recomputes the SHA-256 digest, and appends the diagnostic ticket ID to the @patch\_history array. CI checks verify that the AST diff modified only whitelisted presentation properties without altering scene structure.

#### **3\. The @lifecycle: locked Tier**

When an auteur or human director steps in to adjust camera easing curves or add bespoke styling, the file transitions to locked. Marking a file locked revokes automated write privileges across all compilers and agents, freezing the presentation component tree as an authoritative human artifact.

### **The Collision Avoidance & Candidate Forking Protocol**

When upstream narrative changes in worker-sower-engine or timing updates require an episode to be re-compiled, the generator script executes a three-step pre-flight check on the destination file:

                        `REGENERATION EXECUTION PASS`  
                                     `│`  
                                     `▼`  
                     `Read Destination Episode_XXX.tsx`  
                                     `│`  
         `┌───────────────────────────┴───────────────────────────┐`  
         `▼                                                       ▼`  
`Header contains @locked?                                Header is @generated?`  
         `│                                                       │`  
   `┌─────┴─────┐                                           ┌─────┴─────┐`  
   `│ YES       │ NO                                        │           │`  
   `▼           ▼                                           ▼           ▼`  
`[ HARD STOP ]  Compute SHA-256(Disk Body)            Body Matches  Body Mismatch`  
`Emit Candidate Compare to Header Checksum              Checksum?    (Unmarked Edit)`  
`Halt Build.    │                                           │           │`  
               `├───────────────────────────────────────────┤           │`  
               `▼ Match                                     ▼           ▼`  
       `[ SAFE OVERWRITE ]                         [ CLOBBER REFUSAL ]`  
       `Re-compile in-place                        Emit Episode_XXX.candidate.tsx`  
       `Exit Code 0                                Exit with Diagnostic Warning`

> 1. **Lock Check:** If // @lifecycle: locked is present, regeneration halts immediately.  
> 2. **Checksum Audit:** If the file is marked @generated, the generator computes the SHA-256 digest of the file body on disk and compares it to the embedded @checksum.  
   * **Matching Checksum:** Proves the file has not been touched since its last automated compilation; the generator safely executes an in-place overwrite.  
   * **Mismatched Checksum:** Proves a human made modifications to the file without manually updating the tag to locked.  
> 3. **Candidate Emission:** Rather than clobbering human edits, the generator refuses to overwrite Episode\_XXX.tsx. It emits Episode\_XXX.candidate.tsx directly alongside the existing file and terminates with a diagnostic exit code. This provides the showrunner with a structured visual diff, allowing intentional review and manual merging between the new machine output and the human polish.

### **Ledger Traceability & DIRECTOR\_OVERRIDE Events**

The sealed-file convention maintains the foundational authority law of the studio: **the narrative ledger is the single source of truth; media never mutates state**. Edits that modify narrative meaning (e.g., character choices, somatic injuries, or dialogue text) must be routed back upstream to the simulation engine to generate new events. Representation-only edits (e.g., camera push-ins, framing offsets, audio gain levels) are contained locally within Episode\_XXX.tsx.

To preserve unbroken forensic provenance across the media archive, any human edit to a locked presentation file emits an immutable DIRECTOR\_OVERRIDE event into the project's append-only ledger:

`{`  
  `"event_type": "DIRECTOR_OVERRIDE",`  
  `"episode_id": "EP040",`  
  `"target_file": "Episode_040.tsx",`  
  `"author": "director_alpha",`  
  `"timestamp": "2026-09-28T16:12:00Z",`  
  `"property_delta": {`  
    `"target_component": "Shot01CameraWrapper",`  
    `"property": "zoomLevel",`  
    `"previous_value": 1.05,`  
    `"override_value": 1.12`  
  `},`  
  `"narrative_justification": "Tighten framing on Bog's facial centroid to emphasize visceral reaction sting",`  
  `"prior_checksum": "7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",`  
  `"new_checksum": "9f8a3c2e1b4d5a6e7f80123456789abcdef0123456789abcdef0123456789abc"`  
`}`

This event record binds directly into the terminal render\_manifest.json lockfile, anchoring the human modification to the multi-repo Directed Acyclic Graph (DAG). The final media deliverable remains mathematically tied to its upstream inputs, ensuring that artistic intervention enhances visual expression without compromising system auditability.

---

*User prompt: {{FOCUS: 5\. Upstream Data Contracts & Manifest Binding Mechanics}} /extreme-details*

Response: The upstream data contracts and manifest binding mechanics of goblin-viewport-template form the deterministic bridge connecting upstream narrative, somatic, and acoustic truths to downstream video compositing. Rather than permitting runtime graphical interpreters to dynamically inspect asset folders or parse unvalidated JSON sidecars, the ingestion layer acts as a compiler pass. It ingests schema-validated, immutable contracts off disk, projects local asset coordinate spaces into global composition dimensions, and binds physical invariants directly into static TypeScript JSX literals (Episode\_XXX.tsx) alongside an immutable provenance manifest (render\_manifest.json).

### **1\. Constitutional Authority & The Unidirectional Boundary**

The presentation layer operates under the **Single Sovereign Rule** and the law of **Monotonic Cross-Repo Authority Flow**, where legislative authority decreases as data travels downstream:

Upstream Legislation (000.goblin-lore)⟶Downstream Runtime (000.worker-sower)⟶Projection Engine (goblin-viewport-template)  
                     `CONSTITUTIONAL AUTHORITY FLOW`  
                       
  `[ CANON ]           (Immutable Markdown laws, somatic limits, entity dossiers)[cite: 28]`  
      `│`  
      `│ constrains[cite: 28]`  
      `▼`  
  `[ STATE ]           (Materialized snapshot: somatic, logistical, epistemic vectors)[cite: 19, 28]`  
      `│`  
      `│ transformed by[cite: 19, 28]`  
      `▼`  
  `[ EVENTS ]          (Append-only chronological log: pure deterministic reduction)[cite: 19, 28]`  
      `│`  
      `│ reduced into[cite: 28]`  
      `▼`  
  `[ NEW STATE ]       State_{N+1} = fold(apply_v, State_N, Event_{N+1}, seed)[cite: 13, 28]`  
      `│`  
      `│ projected down unidirectional pipelines[cite: 19, 28]`  
      `▼`  
  `[ CONTRACTS ]       dialogue_ast.json  |  exposure_sheet.json  |  manifest.json[cite: 7, 19]`  
      `│`  
      `│ compiled offline via generate-episode-repo.ts[cite: 7, 19, 49]`  
      `▼`  
  `[ PROJECTION ]      Episode_XXX.tsx  ──►  Remotion CLI (Rig 1 CPU)  ──►  MP4 Deliverable[cite: 7, 19, 26]`

> * **The Meaning vs. Representation Boundary:** Upstream engines govern world truth (who spoke, what trauma was incurred, what spatial movements occurred). Downstream rendering components are untrusted projections possessing zero narrative authority.  
> * **The Prohibition on Reverse Flow:** Media projections never mutate state. If an automated compositor or director introduces visual flair or adjusts camera pacing, that data cannot flow back into the narrative ledger without a formal, human-authorized Git commit in upstream lore.  
> * **The Read-Only Projection Principle:** goblin-viewport-template treats all upstream inputs as deep-frozen, read-only artifacts. Ingestion tools cannot alter upstream ASTs or timing files; they consume them strictly to parameterize presentation components.

### **2\. The Tripartite Upstream Data Contracts**

Before generating code or verifying assets, generate-episode-repo.ts asserts the physical presence and schema validity of three upstream contracts:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                      THE TRIPARTITE INPUT SYSTEM                       │`  
`├──────────────────────────┬─────────────────────────────┬───────────────┤`  
`│ CONTRACT ARTIFACT        │ EMITTING REPOSITORY / POD   │ TIMEBASE      │`  
`├──────────────────────────┼─────────────────────────────┼───────────────┤`  
`│ 1. dialogue_ast.json     │ worker-sower-engine         │ Narrative     │`  
`│    (Machine Dialogue AST)│ (Pipeline Conductor)[cite: 7, 26]      │ Beats / Lines │`  
`├──────────────────────────┼─────────────────────────────┼───────────────┤`  
`│ 2. exposure_sheet.json   │ worker-sower-conductor      │ Physical Audio│`  
`│    (Timing Manifest)     │ (ffprobe Acoustic Harness)[cite: 7, 26]│ 48 kHz / 24fps│`  
`├──────────────────────────┼─────────────────────────────┼───────────────┤`  
`│ 3. manifest.json         │ goblin-assets-visual        │ Spatial /     │`  
`│    (Asset Contract)      │ (Foundation / Art Pod)[cite: 19, 24]   │ Pixel Vectors │`  
`└──────────────────────────┴─────────────────────────────┴───────────────┘`

#### **A. Machine Dialogue AST (dialogue\_ast.json)**

The canonical semantic contract emitted by worker-sower-engine establishes narrative intent without requiring downstream presentation tools to parse free-form screenplay prose:

> * **Verbatim Spoken String (dialogue\_text):** The exact phonetic text passed to the speech synthesizer; must match human-facing scripts with verbatim parity to prevent unsynchronized dialogue renders.  
> * **Emotional Conditions (conditions):** Strongly typed condition tags (e.g., \["humiliated"\]) chosen from a closed enum that map directly to sprite variants declared in visual asset manifests.  
> * **Motivation-Reaction Unit Directives (reaction\_cue):** Encodes Dwight Swain's causality rule (Stimulus → Involuntary Reflex → Conscious Thought → Action). When an AST node specifies an emotional beat (e.g., VISCERAL\_STING), the compiler automatically bakes an authored visual pre-roll (12 to 24 frames of facial reaction or camera push-in) *before* mounting dialogue audio stems.  
> * **Epistemic Horizon Stamps (applied\_character\_horizons):** Explicitly records the epistemic status of scene participants (e.g., TOTAL\_IGNORANCE, RUMOR\_ONLY) relative to canonical mysteries, verifying that characters act only upon what their subjective knowledge permits.  
> * **State Snapshot Seal (state\_snapshot\_hash):** Records the root hash (*H*root​) of the canonical lore repository from which the scene was compiled, anchoring narrative meaning to a specific Git commit.

#### **B. Quantized Timing Manifest (exposure\_sheet.json)**

Audio represents the master physical clock of the production pipeline. Produced by produceEpisode.ts following speech synthesis, the timing manifest bridges continuous physical acoustics to discrete rendering frames:

> * **Continuous Millisecond Probing:** Synthesized 48 kHz uncompressed .wav stems are probed via ffprobe to determine their exact continuous duration (*D*ms​).  
> * **Integer Frame Quantization:** Video timelines run at a fixed 24 fps. To eliminate floating-point drift, continuous durations are quantized using the ceiling formula:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉  
> * **Tail Slack & Pad Budgeting:** Sub-frame remainders (\<41.7 ms) resulting from the ceiling calculation are absorbed as post-roll acoustic decay padding, preventing speech from cutting off abruptly at cut transitions.  
> * **Sidechain Ducking Curves:** Declares absolute decibel attenuation envelopes for audio buses, dropping the background music track by **\-14 dB** during active speech frames with a 4-frame ramp.

#### **C. Visual Asset Contract (manifest.json)**

Located in goblin-assets-visual/characters/{id}/manifest.json, this typed contract converts raw graphics into a database of physical invariants:

`{`  
  `"character_id": "char_bog",`  
  `"version": "1.4.0",`  
  `"native_dimensions": { "width": 1024, "height": 1024 },`  
  `"anchor_point": { "x": 512, "y": 980 },`  
  `"camera_anchor_points": {`  
    `"crash_zoom_target": { "x": 412, "y": 198 }`  
  `},`  
  `"mouth_bounding_box": { "x": 380, "y": 240, "width": 64, "height": 32 },`  
  `"animation_hints": {`  
    `"talk_bounce_amplitude": 8,`  
    `"idle_shiver_amplitude": 14`  
  `},`  
  `"variants": {`  
    `"idle": "sprites/bog_idle.png",`  
    `"humiliated": "sprites/bog_humiliated.png",`  
    `"terrified": null`  
  `}`  
`}`

> * **Ground Contact Pivots (anchor\_point):** Identifies the bottom-center contact point of the puppet rig, locking the character to the background matte floor plane (*Y*ground​) to prevent feet from hovering or sliding during camera pans.  
> * **Facial Focus Targets (crash\_zoom\_target):** Precise coordinates marking the facial centroid or eye line, ensuring camera push-ins center properly across characters of varying heights.  
> * **Modular Viseme Envelopes (mouth\_bounding\_box):** The exact coordinate box defining where mouth textures (closed, small, medium, wide) snap over the base sprite.  
> * **Motion Physics Scalars (animation\_hints):** Bounded scalar weights that govern programmatic breathing cycles and talk bounces in shared components (GoblinPuppet.tsx).

### **3\. Geometric Manifest Binding & Normalization Math**

A critical failure mode in automated animation is the **Decapitation Defect**, which occurs when local sprite coordinates are applied directly to global composition canvases without accounting for scaling and layout translation.

                  `COORDINATE PROJECTION TRANSFORMATION`  
                    
  `Sprite Canvas (1024 x 1024)                 Master Canvas (1920 x 1080)`  
`┌─────────────────────────────┐             ┌─────────────────────────────────────┐`  
`│ (0,0)                       │             │ (0,0)                               │`  
`│                             │             │                                     │`  
`│      • crash_zoom_target    │             │         Stage Translation           │`  
`│        (x: 412, y: 198)     │             │         (puppet.x, puppet.y)        │`  
`│                             │    Scale    │                ▼                    │`  
`│                             │ ──────────► │               ┌──────────┐          │`  
`│                             │   Factor    │               │  Puppet  │          │`  
`│                             │    (s)      │               │  • Target│          │`  
`│      • anchor_point         │             │               └──────────┘          │`  
`│        (x: 512, y: 980)     │             │ ─────────────────────────────────── │`  
`└─────────────────────────────┘             │ Floor Plane (Y_ground)              │`  
                                            `└─────────────────────────────────────┘`

To achieve deterministic camera transforms without runtime performance overhead, the compiler maps coordinates at generation time:

> 1. **Stage Placement:** The puppet is aligned to the background ground plane:  
>    TranslateX=*X*stage​−anchor.x,TranslateY=*Y*ground​−anchor.y  
> 2. **Global Percentage Projection:** Camera zoom transforms require normalized transformOrigin percentages relative to the master canvas dimensions (1920×1080):  
>    originXglobal​\=canvas.widthpuppet.x+(crash\_zoom\_target.x×*s*)​×100%  
>    originYglobal​\=canvas.heightpuppet.y+(crash\_zoom\_target.y×*s*)​×100%  
>    *(where s is the active puppet scaling factor)*.  
> 3. **Static Literal Inlining:** The resolved percentages are injected directly into the camera wrapper's inline JSX props (e.g., \<Shot01CameraWrapper originX="48.2%" originY="21.4%"\>), allowing Remotion’s interpolate() to compute camera moves cleanly without runtime layout lookups.

### **4\. Asset Envelope Harvesting (collect-episode-assets.ts)**

Master visual repositories contain expansive character pose libraries that exceed tens of gigabytes. Copying entire asset libraries into every stamped episode workspace would bloat repository storage and slow down CI pipelines.

`GLOBAL ASSET REPOSITORY (goblin-assets-visual)`  
`├── characters/bog/ (All 48 emotional variants, turnarounds, props)[cite: 19]`  
`└── characters/spleen/ (All 52 emotional variants, turnarounds, props)[cite: 19]`  
                          `│`  
                          `│ collect-episode-assets.ts AST Crawl[cite: 7, 19]`  
                          `▼`  
`PRUNED EPISODE ENVELOPE (goblin-episodes/ep040/public/assets/)`  
`├── sprites/bog_humiliated.png (Referenced by line_001)[cite: 7, 19]`  
`├── sprites/spleen_defensive.png (Referenced by line_002)[cite: 7, 19]`  
`├── visemes/mouth_{closed,small,medium,wide}.png (Referenced in speech)[cite: 7, 19]`  
`└── backgrounds/swamp_relay_matte.png[cite: 7, 19]`  
                          `│`  
                          `▼ Total Footprint: 18.4 MB (Enforces < 100MB-150MB Ceiling)[cite: 7]`

#### **Harvesting Logic & Invariant Sweeps**

> * **AST Extraction:** collect-episode-assets.ts parses the compiled dialogue\_ast.json, extracting every referenced character ID, emotion tag, and viseme cue.  
> * **Envelope Pruning:** Only the specific PNG assets and .wav audio stems used in the episode are copied into goblin-episodes/epXXX/public/assets/, keeping the workspace footprint well below the studio's 100MB to 150MB storage ceiling.  
> * **The Zero-Byte Poison Trap:** The harvester computes the SHA-256 binary hash of every staged file. If any file matches the empty-hash signature:  
>   SHA-256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>   the build terminates immediately with exit code 1, preventing truncated network transfers from corrupting the render.  
> * **Disk Parity Audits:** Stamped JSX paths (staticFile(...)) are checked against disk; any missing asset halts execution before headless Chromium boots.

### **5\. Explicit Absence & The Unified Waiver Ledger**

In asset-driven generation pipelines, missing assets must not be treated as unexpected runtime exceptions. The architecture formalizes asset availability using explicit status tags within a unified waiver ledger:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   ASSET STATUS TAXONOMY & RESOLUTION                   │`  
`├──────────────────────┬─────────────────────────────────────────────────┤`  
`│ STATUS TAG           │ DEFINITION & PIPELINE BEHAVIOR                  │`  
`├──────────────────────┼─────────────────────────────────────────────────┤`  
`│ VALID                │ Asset exists, passes hash checks, ready for use[cite: 11, 45].│`  
`├──────────────────────┼─────────────────────────────────────────────────┤`  
`│ INTENTIONALLY_ABSENT │ Declared as null in manifest.json (e.g., variant│`  
`│                      │ does not exist by artistic design)[cite: 11, 19, 45].          │`  
`├──────────────────────┼─────────────────────────────────────────────────┤`  
`│ WAIVED               │ Temporary waiver registered in the waiver ledger│`  
`│                      │ signed by an authorized approver[cite: 7, 31, 45].             │`  
`├──────────────────────┼─────────────────────────────────────────────────┤`  
`│ BROKEN               │ Path declared in manifest but missing on disk;  │`  
`│                      │ or fails SHA-256 digest validation[cite: 7, 45].               │`  
`└──────────────────────┴─────────────────────────────────────────────────┘`

#### **Dual-Mode Compilation Handling**

> 1. **Draft Animatic Builds:** When an AST references an emotion tagged INTENTIONALLY\_ABSENT or WAIVED, the compiler substitutes variants.idle as a fallback, logging a non-blocking warning.  
> 2. **Broadcast Master Builds:** The compiler enforces a strict fail-loud policy:  
>    ∀shot∈Episode,status(variant)==VALID∨hasActiveWaiver(shot)  
>    Any unwaived null or BROKEN variant aborts compilation immediately, ensuring that unapproved placeholder assets never reach final broadcast renders.

### **6\. Terminal Provenance Manifest (render\_manifest.json)**

The final output of the manifest binding process is render\_manifest.json, an immutable build lockfile placed at the root of the stamped episode. The build identity is mathematically rooted as a cryptographic tuple:

Build ID=H(Canon Root+Ledger State+Dialogue AST+Asset Hashes+Toolchains)  
`{`  
  `"artifact_id": "ep040_master_delivery",`  
  `"build_id": "sha256:4f8a1209bc87e5d...",`  
  `"canon_root_hash": "abe935cccf3951f82f8ed9b05b1f2a19c1e56a8eb2f13ef8e7a9297a81b1b911",`  
  `"generated_at": "2026-09-28T15:44:00Z",`  
  `"compiler_version": "2.4.1",`  
  `"upstream_provenance": {`  
    `"worker_sower_commit": "git:7bd4e10",`  
    `"goblin_lore_commit": "git:9c3e401",`  
    `"goblin_assets_visual_tag": "git:v1.4.0",`  
    `"viewport_template_commit": "git:4f8a120"`  
  `},`  
  `"epistemic_invariants": [`  
    `{`  
      `"topic_id": "mystery_the_famine",`  
      `"standing": "ACTIVE_ENDORSED",`  
      `"world_status": "UNRESOLVED_BY_CANON",`  
      `"applied_character_horizons": {`  
        `"char_bog": "TOTAL_IGNORANCE",`  
        `"char_spleen": "RUMOR_ONLY"`  
      `}`  
    `}`  
  `],`  
  `"acoustic_assets": {`  
    `"ep040_sh01.wav": "sha256:4a8c9e2b10a...",`  
    `"ep040_sh02.wav": "sha256:9c1d8e3f4a..."`  
  `},`  
  `"visual_sprites_used": {`  
    `"bog_humiliated.png": "sha256:7f83b1657ff1...",`  
    `"spleen_defensive.png": "sha256:a3b4c5d6e7f8..."`  
  `},`  
  `"runtime_environment": {`  
    `"container_digest": "ghcr.io/studio/render-node@sha256:7b4a29...",`  
    `"node_version": "v20.12.0",`  
    `"remotion_version": "4.0.140",`  
    `"chromium_milestone": "122.0.6261.94",`  
    `"ffmpeg_build": "6.1.1-static",`  
    `"font_manifest": {`  
      `"Cinzel-Bold.ttf": "sha256:5a6b7c8d9e..."`  
    `}`  
  `},`  
  `"applied_waivers": [],`  
  `"broker_signature": "MEQCID7f..."`  
`}`

> * **Epistemic Mystery Tracking:** Binds the exact epistemic status of active narrative mysteries at compile time. If a mystery is resolved or altered in subsequent seasons, historical artifacts retain proof that they were compiled in compliance with contemporary canon.  
> * **Media-Broker Signature:** The manifest is signed using the local media-broker private key, proving that rendering occurred on an authorized physical node rather than an unverified worker.  
> * **C2PA Metadata Burning:** The completed render\_manifest.json is injected directly into the delivered MP4 container using MovieLabs Media Manifest Core (MMC) and C2PA standards, permanently linking the video file to its authorizing Git commits and input assets.

### **7\. Contract Failure-Mode Recovery Matrix**

To protect render hardware from non-deterministic failures, all contract exceptions are routed through a structured recovery matrix:

| Failure Event | Detection Mechanism | Immediate Pipeline Action | Recovery & Escalation Rule |
| :---- | :---- | :---- | :---- |
| **Schema Invalidation** | Zod runtime parser failure in generate-episode-repo.ts. | **Deterministic Fatal Halt (Exit 1).** Zero retries. | Fix upstream emitting code in worker-sower-engine. |
| **Missing Binary Asset** | Pre-flight disk parity audit sweeps against TSX paths. | **Deterministic Fatal Halt (Exit 1).** Build aborted. | Trigger sync-assets.ts or log waiver in ledger. |
| **Zero-Byte File Trap** | SHA-256 evaluates to empty hash signature e3b0c4.... | **Deterministic Fatal Halt (Exit 1).** File quarantined. | Re-download asset via content-addressed R2 fetch. |
| **Epistemic Horizon Breach** | Invariant linter flags character citing scrubbed topic. | **Deterministic Fatal Halt (Exit 1).** Compilation blocked. | Route back to Narrative Pod; re-filter prompt envelope. |
| **Acoustic Drift (\>41.7ms)** | Exposure sheet duration mismatches audio stem duration. | **Stochastic Bounded Retry (Max 2).** Re-probe audio. | Re-run quantization formula; re-quantize integer frames. |
| **Disk Write Contention** | POSIX rename lock contention in staging workspace. | **Infrastructure Idempotent Resume.** Backoff & retry. | Retry filesystem move using atomic .tmp swap pattern. |

---

*User prompt: {{FOCUS: 6\. Dual-Clock Temporal Engine & Master Audio Integration}} /extreme-details*

### **Response: 1\. The Master Physical Clock Axiom & Epistemic Hierarchy**

In traditional animation and post-production workflows, visuals dictate time: animators draw frames, and sound editors stretch or cut audio tracks to fit the visual cuts. In an automated generative stack, this inverted dependency causes desynchronization, rubbery mouth movements, and unnatural speech pauses.

The governing law of the studio's media compiler establishes that **audio is the architect of time; picture is an integer projection mapped to audio duration**.

               `THE TEMPORAL COMPILATION FLOW`  
                 
        `Approved Screenplay AST (dialogue_ast.json)`  
                           `│`  
                           `▼`  
          `Local TTS Synthesis (48 kHz PCM WAV)`  
                           `│`  
                           `▼`  
        `ffprobe Waveform Measurement (duration_ms)`  
         `[Observation: Real-valued physical time]`  
                           `│`  
                           `▼`  
        `Discrete Frame Quantization (24 fps Target)`  
         `[Derivation: Discrete presentation grid]`  
                           `│`  
                           `▼`  
      `Zero-Length Interval Clamp (assert(frames >= 1))`  
                           `│`  
                           `▼`  
      `Absolute Integer Coordinates in Episode_XXX.tsx`

This architecture is grounded in an economic asymmetry: **audio generation is computationally cheap, whereas video generation is computationally expensive**. Generative video diffusion models possess no innate concept of pacing, biological speech cadence, or rhythmic structure. Synthesizing dialogue first and measuring its physical duration establishes a locked frame target, ensuring cloud GPUs render only the exact frames required for compositing.

> * **Observation vs. Derivation Separation:** The physical duration in milliseconds (*D*ms​) measured via ffprobe represents the *observation*; the integer frame count represents the *derivation*. Both are stored in separate fields within exposure\_sheet.json. If the broadcast target changes from 24 fps to 30 fps or 60 fps, frame counts are re-derived from original millisecond durations without requiring audio re-synthesis.  
> * **Acoustic Stem Immutability:** Once synthesized and approved, .wav stems are content-addressed and archived in public/audio/dialogue/. Rendering components are strictly forbidden from calling TTS APIs during compositing, preventing sub-frame duration jitter from breaking the locked exposure sheet or misaligning visemes.

### **2\. The Dual-Clock Formulation & Multi-Resolution Time Bridge**

To preserve audio fidelity without producing video timing jitter, the compiler separates time into two synchronized domains:

`AUDIO DOMAIN (Continuous Timebase Clock): 48,000 samples/sec (Sample-Accurate Truth)`  
  `│`  
  `├─ Phoneme / Viseme Onsets (e.g., Sample Offset: 26,742)`  
  `├─ Transient Foley Hits (Seeded PRNG)`  
  `└─ Continuous Dynamic Ducking Envelopes (-14 dB Speech Window)`  
  `│`  
  `▼ Projection: Sample Index S = Frame * (48000 / 24) = Frame * 2000`  
`VIDEO DOMAIN (Master Video Clock): 24 integer frames/sec (Discrete Cut Boundaries)`

> * **Audio Timebase Domain (48 kHz):** Operates at 48,000 integer samples per second, capturing acoustic events such as transient spikes, phoneme boundaries, and ducking curves with high precision.  
> * **Master Video Clock (24 fps):** Operates strictly on discrete integer frames. At 24 fps, the duration of a single video frame is:  
>   Δ*t*frame​\=241​ s≈41.6667 ms  
> * **The Projection Ratio:** The mathematical bridge between the two clocks resolves to a constant integer factor:  
>   24 frames/sec48,000 samples/sec​\=2,000 audio samples per video frame  
>   The sample coordinate *S* corresponding to frame *F* is calculated as:  
>   *S*\=*F*×2,000

This mapping preserves continuous acoustic markers without losing phase precision. For example, if a phoneme onset or glass transient occurs at sample 26,742, it is mapped to video frame ⌊26,742/2,000⌋=Frame 13, while the audio mix plays back sample-accurately to prevent phase cancellation or perceptual lip-sync lag.

### **3\. Temporal Quantization Mathematics & Sub-Frame Guardrails**

The bridge from continuous audio durations to discrete video timelines relies on three mathematical guardrails:

#### **A. Integer Ceiling Quantization**

Continuous physical duration measured by ffprobe is quantized to master video frames using the integer ceiling function:

target\_frames=⌈(1000*D*ms​​)×delivery\_fps⌉

*Worked Example:* A speech stem measuring 3,120.50 ms at 24 fps yields:

target\_frames=⌈10003120.50​×24⌉\=⌈74.892⌉=75 frames (3.125 s)

#### **B. The Sub-Frame Duration Trap & Zero-Length Interval Clamp**

When processing clipped vocalizations or brief interjections (*"Hmph"*, *"Ha"*), the measured audio duration may be shorter than a single video frame (\<41.67 ms, such as 30 ms). Evaluating frame boundaries naively via:

StartFrame=⌈*a*⌉,EndFrame=⌈*b*⌉−1⟹EndFrame\<StartFrame

results in an inverted or zero-length frame interval, which crashes Remotion's sequencing engine. The compiler enforces a mandatory duration clamp: **every audio track is allocated a minimum duration of 1 frame (41.67 ms)**:

`const targetFrames = Math.max(1, Math.ceil((durationMs / 1000) * 24));`

If raw speech duration is shorter than 41.67 ms, the engine pads the tail of the audio buffer with digital silence up to the 1-frame boundary.

#### **C. Tail-Slack Budgeting**

In the 3,120.50 ms example, 75 frames equals 3,125.00 ms of video time. The resulting difference of 4.50 ms (0.108 frames) represents tail slack. Rather than truncating audio or stretching the video, the compiler absorbs this difference within the shot's natural decay padding, ensuring dialogue does not clip abruptly at cut boundaries.

### **4\. Absolute Integer Timeline Anchoring (Anti-Drift Calculus)**

A primary source of timing drift in programmatic media pipelines is relative timeline chaining (e.g., shot\[k\].start \= shot\[k-1\].end). Because the ceiling function introduces up to 41.67 ms of tail padding per cut, concatenating stems end-to-end causes sub-frame errors to compound. Across a 100-shot sequence, relative chaining can drift the overall audio track out of sync with visual cues by up to 4 seconds.

The exposure sheet prevents this by calculating absolute integer frame coordinates ahead of time:

fromFrame*k*​\=*i*\=1∑*k*−1​total\_shot\_frames*i*​  
total\_shot\_frames*i*​\=pre\_roll\_frames*i*​\+audio\_frames*i*​\+post\_roll\_frames*i*​  
                  `CUMULATIVE ABSOLUTE TIMELINE`  
                    
`Shot 01: [Pre: 8f] [Audio: 75f] [Post: 16f] ──► Duration: 99f (fromFrame = 0)`  
                                                                 `│`  
`Shot 02: [Pre: 12f] [Audio: 60f] [Post: 8f]  ──► Duration: 80f (fromFrame = 99)`  
                                                                 `│`  
`Shot 03: [Pre: 0f] [Audio: 110f] [Post: 12f] ──► Duration: 122f (fromFrame = 179)`

Alternatively, global timeline positions can be derived by quantizing cumulative milliseconds directly:

TimelineOffset*K*​\=⌈(*i*\=1∑*K*​DurationMs*i*​)×1000FPSmaster​​⌉

#### **Dwight Swain Motivation-Reaction Units (MRUs) as Timeline Geometry**

Generative language models frequently invert narrative causality (e.g., *"He spoke as the door slammed"*), which undermines visual storytelling. The compiler enforces chronological ordering based on Dwight Swain's Motivation-Reaction Unit (MRU): **Stimulus → Reflex → Calculation → Action/Speech**.

> * When dialogue\_ast.json flags a cognitive shock (e.g., reaction\_cue: "VISCERAL\_STING"), the compiler inserts a **12-to-24 frame visual pre-roll buffer** (held reaction, eye saccade, or camera push-in) before the dialogue audio mounts.  
> * In exposure\_sheet.json, pre\_roll\_frames and post\_roll\_frames are stored separately from audio\_frames, allowing pacing adjustments to be made without invalidating speech measurements.

### **5\. Backend Temporal Adapters & The 4*n*\+1 Latent Lattice**

Video diffusion backends that use 3D causal VAE architectures (such as Wan 2.1 and Wan 2.2) require generated frame counts to match a specific mathematical lattice:

Framesnative​\=4*n*\+1(*n*∈N)

To prevent model-specific constraints from leaking into the core pipeline, the system isolates them within **Backend Temporal Adapters**:

`Master Universal Timeline (24 fps Delivery Frame Budget)`  
                           `│`  
                           `▼`  
`Backend Adapter (Translates duration into model-native frame constraints)`  
                           `│`  
                           `├── 1. Compute Native Frames: N = ceil(Duration * Native_FPS)`  
                           `├── 2. Align to Lattice: N_diff = 4 * ceil((N - 1) / 4) + 1`  
                           `├── 3. GPU Diffusion Generation (ComfyUI Rig 2)`  
                           `├── 4. Trim Latent Noise Tail Margin`  
                           `└── 5. Retime / Conformance Resample to Master Timeline`  
                           `│`  
                           `▼`  
`Master Remotion Composite (Episode_XXX.tsx)`

#### **The Adapter Conversion Math**

> 1. **Native Frame Budget:**  
>    *N*\=⌈(1000*D*ms​​)×native\_fps⌉  
> 2. **4*n*\+1 Upward Alignment:**  
>    *N*diff​\=4×⌈4*N*−1​⌉\+1  
> 3. **Tail Truncation:** Diffusion renders *N*diff​ frames. Excess frames generated to satisfy the lattice boundary are trimmed from the shot tail, absorbing boundary latent artifacts.

#### **Cadence Conformance Configurations**

To convert native diffusion frame rates into the 24 fps master delivery timeline without cadence judder, the pipeline supports two verified configurations:

`CONFIGURATION A: Native 12 fps Animated "On Twos" (Zero Judder)`  
`• Audio Master: 3,120 ms -> Master 24 fps Budget: ceil(3.120 * 24) = 75 frames (3.125 s)`  
`• Native Diffusion (12 fps): Raw = ceil(3.120 * 12) = 38 frames`  
`• 4n + 1 Conformance: n = ceil((38 - 1) / 4) = 10 -> Native Count = 4(10) + 1 = 41 frames (3.4167 s)`  
`• Resample to 24 fps: 1:2 duplication (every frame doubled -> 82 frames @ 24 fps)`  
`• Tail Margin Trim: 82 - 75 = 7 frames trimmed at tail`  
`• Visual Cadence: Clean 2:2 animation "on twos" with zero pull-down judder`

`CONFIGURATION B: Native 24 fps (Direct Master Match)`  
`• Audio Master: 3,120 ms -> Master 24 fps Budget: ceil(3.120 * 24) = 75 frames (3.125 s)`  
`• 4n + 1 Conformance: n = ceil((75 - 1) / 4) = 19 -> Native Count = 4(19) + 1 = 77 frames (3.2083 s)`  
`• Tail Margin Trim: 77 - 75 = 2 frames trimmed at tail`  
`• Visual Cadence: Direct 1:1 identity map with zero cadence resampling`

#### **The 4*n*\+1 Sawtooth Waste Cost Model (scripts/audit-frame-waste.ts)**

Because 4*n*\+1 is a discrete step function, generative waste follows a periodic sawtooth pattern. For example, generating 38 native frames requires rendering 41 frames (*n*\=10), wasting 3 frames of compute. If the requirement were 37 frames, *n*\=9 would yield exactly 37 frames with zero waste. An automated audit tool scans planned audio durations before dispatch and reports potential savings:

*"Shot 04 wastes 3 native frames. Tightening line pause by 62ms reduces n from 10 to 9, saving 12% GPU compute."*

### **6\. Multi-Track Acoustic Blueprint & Deterministic Foley Seeding**

Remotion’s programmatic timeline partitions sound across three concurrent, prioritized layers:

`Track 1: Spoken Dialogue Stems (High Priority / Fixed Clocks via ffprobe)`  
         `[--------- Shot 01 (75f) ---------]          [--------- Shot 02 (90f) ---------]`  
`Track 2: Spot Foley Transients (Medium Priority / Seeded PRNG)`  
                `[*valve_scrape*]                             [*boot_squelch*]`  
`Track 3: Continuous Ambient Bed & Score (Low Priority / Sidechain Ducked)`  
`────┐                                       ┌────────┐                                 ┌────`  
    `│                                       │        │                                 │`  
    `└───────────────────────────────────────┘        └─────────────────────────────────┘`  
      `^ Attack (6f)          Release (12f) ^          ^ Attack (6f)      Release (12f) ^`  
      `Ducking Floor: -14 dB                           Ducking Floor: -14 dB`

> * **Track 1 (Dialogue):** Stamped at absolute frame coordinates based on synthesized .wav durations.  
> * **Track 2 (Spot Foley Transients):** Punctual physical effects (knife scrape, mud squelch, valve drop) parsed from script notes and aligned to visual action holds or pre-rolls.  
> * **Track 3 (Continuous Ambient Bed & Score):** Sustained environmental drones and music beds. While visual plates cut cleanly on shot boundaries, ambient beds crossfade across cuts to maintain acoustic continuity.

#### **Foley Variant Resolution: Build-Time Baking vs. Render-Time Seeding**

Using native non-deterministic methods like Math.random() inside headless Remotion renderers causes audio drift across concurrent browser workers. To ensure reproducibility, sample selection uses a deterministic **Mulberry32 PRNG** seeded by a context hash:

Seed=MurmurHash3(sceneId+":"+shotId+":"+sampleKey)

> * **Generation-Time Source-Baking:** In the modern template architecture, variant selection is resolved during metaprogram compilation (generate-episode-repo.ts) rather than at render time. The resolved asset path is printed directly as a static string literal into the TSX props (e.g., src={staticFile("audio/foley/metal\_scrape\_02.wav")}). This eliminates render-time random evaluations entirely, rendering worker concurrency irrelevant to Foley reproducibility.  
> * **Anti-Clustering Salts:** If the PRNG draws the same sample variant used in the immediately preceding shot, an anti-clustering salt (:retry) is appended to the seed to select an alternate take and prevent repetitive sound design.

### **7\. Programmatic Sidechain Ducking Engine (AmbientTrack.tsx)**

Dialogue intelligibility is maintained by programmatically ducking the ambient bed during speech windows.

> * **Attenuation Math:** Ducking depth is calculated from decibels rather than arbitrary fractional multipliers:  
>   *V*duck​\=*V*base​×1020attenuation\_dB​  
>   For a −14 dB attenuation with *V*base​\=0.40:  
>   *V*duck​\=0.40×1020−14​\=0.40×0.1995=0.0798≈0.08  
> * **Envelope Trajectory:** Ducking applies a 6-frame quadratic attack down to −14 dB prior to speech, maintains attenuation across the dialogue window, and recovers over a 12-frame quadratic release once speech concludes.  
> * **The Pumping Artifact & Multi-Window Minimum Reducer:** If dialogue ducking is computed in a naive loop that breaks on the first matching window, short gaps between consecutive lines (e.g., a 6-frame pause) will cause the volume to ramp up during release and immediately dip on the next attack. To prevent this pumping effect, the gain function evaluates all dialogue windows simultaneously and takes the minimum gain across all active envelopes:

`// apps/render/src/components/AmbientTrack.tsx`  
`import React from 'react';`  
`import { Audio, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';`

`export interface DialogueWindow {`  
  `from: number;`  
  `to: number;`  
`}`

`export interface AmbientTrackProps {`  
  `ambientFile: string;`  
  `baseVolume?: number;`  
  `attenuationDb?: number;`  
  `dialogueWindows: DialogueWindow[];`  
  `silences?: { fromFrame: number; toFrame: number; duckAmbientDb: number }[];`  
  `attackFrames?: number;`  
  `releaseFrames?: number;`  
`}`

`export const calculateDuckedGain = (`  
  `frame: number,`  
  `baseVolume: number,`  
  `attenuationDb: number,`  
  `windows: DialogueWindow[],`  
  `attackFrames = 6,`  
  `releaseFrames = 12`  
`): number => {`  
  `const targetDuckedVolume = baseVolume * Math.pow(10, attenuationDb / 20);`  
  `let minGain = baseVolume;`

  `for (const win of windows) {`  
    `let windowGain = baseVolume;`  
    `if (frame >= win.from && frame <= win.to) {`  
      `windowGain = targetDuckedVolume;`  
    `} else if (frame >= win.from - attackFrames && frame < win.from) {`  
      `windowGain = interpolate(`  
        `frame,`  
        `[win.from - attackFrames, win.from],`  
        `[baseVolume, targetDuckedVolume],`  
        `{ easing: Easing.out(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }`  
      `);`  
    `} else if (frame > win.to && frame <= win.to + releaseFrames) {`  
      `windowGain = interpolate(`  
        `frame,`  
        `[win.to, win.to + releaseFrames],`  
        `[targetDuckedVolume, baseVolume],`  
        `{ easing: Easing.in(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }`  
      `);`  
    `}`  
    `// Union composition prevents pumping across short dialogue gaps`  
    `minGain = Math.min(minGain, windowGain);`  
  `}`

  `return minGain;`  
`};`

`export const AmbientTrack: React.FC<AmbientTrackProps> = ({`  
  `ambientFile,`  
  `baseVolume = 0.40,`  
  `attenuationDb = -14.0,`  
  `dialogueWindows = [],`  
  `silences = [],`  
  `attackFrames = 6,`  
  `releaseFrames = 12,`  
`}) => {`  
  `const frame = useCurrentFrame();`

  `let resolvedVolume = calculateDuckedGain(`  
    `frame,`  
    `baseVolume,`  
    `attenuationDb,`  
    `dialogueWindows,`  
    `attackFrames,`  
    `releaseFrames`  
  `);`

  `// Apply explicit narrative silences (e.g., dramatic realization holds)`  
  `for (const silence of silences) {`  
    `if (frame >= silence.fromFrame && frame <= silence.toFrame) {`  
      `resolvedVolume *= Math.pow(10, silence.duckAmbientDb / 20);`  
    `}`  
  `}`

  `return (`  
    `<Audio`  
      ``src={staticFile(`audio/ambient/${ambientFile}`)}``  
      `volume={resolvedVolume}`  
    `/>`  
  `);`  
`};`

### **8\. Automated Master Conformance, Loudness Gates & Hardware Boundary**

Before final muxing to disk, the composited audio track passes through an automated FFmpeg filter pass to enforce distribution standards:

> * **Integrated Loudness Range (loudnorm):** Master tracks are conformed to **−16 LUFS** (±1.0 LUFS) for web and streaming distribution, or **−24 LUFS** (ATSC A/85) / **−23 LUFS** (EBU R128) for broadcast.  
> * **True-Peak Ceiling:** Brickwall peak limiters clamp peaks to **≤−1.0 dBTP** (or between −1.0 dBFS and −2.0 dBTP) to eliminate inter-sample clipping during codec decompression.  
> * **Noise Floor Certification:** Dialogue stems are certified to maintain a noise floor below **−60 dBFS** prior to insertion, preventing amplified room hiss when ducking envelopes release back to unity gain.

#### **Hardware Isolation: Rig 1 vs. Rig 2**

The physical separation of hardware preserves resource boundaries between media decoding and tensor computation:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: ORCHESTRATION & OPTICAL ASSEMBLY (Pure CPU / System RAM)        │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • worker-sower-conductor (produceEpisode.ts)                           │`  
`│ • Local Python TTS Microservice (:8000 on CPU, e.g., CosyVoice/Piper)  │`  
`│ • Temporal Quantizer (ffprobe CLI — locks discrete frames at 24 fps)   │`  
`│ • goblin-viewport-template (generate-episode-repo.ts source-baker)     │`  
`│ • Remotion Rendering Engine CLI (Software OpenGL: --gl=swangle)        │`  
`│ • Programmatic Audio Ducking & Automated FFmpeg Loudnorm Mastering     │`  
`│ • Resource Profile: ZERO GPU VRAM / 100% CPU and System RAM Bound      │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Pure JSON API Payload`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: GPU TENSOR FOUNDRY (Dedicated High-VRAM Silicon)                │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Headless ComfyUI Daemon (:8188)                                      │`  
`│ • 100% VRAM allocated to Wan 2.2 / LoRA latent video diffusion passes   │`  
`│ • ZERO Chromium / Remotion instances (prevents memory thrashing)      │`  
`│ • ZERO TTS / Audio processes (eliminates multi-tenant CUDA OOM crashes)│`  
`└────────────────────────────────────────────────────────────────────────┘`

Isolating all speech synthesis, duration probing, and Remotion rendering to Rig 1 ensures that heavy video diffusion models on Rig 2 maintain access to their full 24 GB VRAM envelope. This prevents memory oversubscription and driver crashes, ensuring both the audio master clock and downstream visual rendering execute deterministically.

---

*User prompt: {{FOCUS: 7\. Execution Profile & Headless Runtime Constraints}} /extreme-details*

Response: The headless execution profile and runtime constraints of goblin-viewport-template govern the deterministic physical rasterization of static React compositions (Episode\_XXX.tsx) into broadcast video deliverables. Because Remotion drives headless Chromium via @remotion/renderer, rendering represents a resource-intensive, memory-sensitive workload. The architecture enforces strict hardware boundaries, software-rasterized OpenGL backends, single-threaded worker concurrency, and off-thread media decoding to eliminate memory leaks, container crashes, and non-deterministic visual divergence.

### **1\. Physical Hardware Demarcation: Rig 1 vs. Rig 2**

To maintain system stability and prevent hardware contention, the studio partitions execution across two dedicated physical hosts based on their compute and memory profiles:

`┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐`  
`│ RIG 1: ORCHESTRATION & COMPOSITING     │       │ RIG 2: HEAVY GPU RENDER FOUNDRY        │`  
`│ (Zero GPU Compute / Pure CPU & RAM)    │       │ (Dedicated Silicon / High VRAM)        │`  
`├────────────────────────────────────────┤       ├────────────────────────────────────────┤`  
`│ • worker-sower-conductor (Node.js)     │       │ • Headless ComfyUI Daemon (:8188)      │`  
`│ • Local Canon DB (SQLite / Ledger)     │       │ • 100% of VRAM dedicated to:           │`  
`│ • Local Audio Microservice (:8000)     │  ──►  │     - Text Model GGUFs                 │`  
`│ • Temporal Quantizer (ffprobe CLI)     │ JSON  │     - TTS Voice Checkpoints            │`  
`│ • Optical Compositor (Remotion CLI)    │  IPC  │     - Wan 2.2 Diffusion Passes         │`  
`│ • Astro Showrunner Cockpit (:4321)     │       │ • Sequential VRAM Eviction Controller  │`  
`│ • Resource Profile: 64 GB System RAM   │       │ • Resource Profile: 24 GB VRAM (RTX)   │`  
`└────────────────────────────────────────┘       └────────────────────────────────────────┘`

The pipeline prohibits headless Chromium or audio tasks from executing on Rig 2\. Video diffusion models (such as Wan 2.2) require 20 GB to 24 GB of unfragmented VRAM. Running @remotion/renderer alongside diffusion models triggers GPU memory thrashing, driver context losses, and Linux Out-Of-Memory (OOM) process termination. Rig 1 absorbs all DOM rasterization and FFmpeg encoding, isolating GPU silicon entirely for stochastic tensor operations.

| Operational Vector | Rig 1 (Host Orchestrator & Compositor) | Rig 2 (Untrusted GPU Spoke / Foundry) |
| :---- | :---- | :---- |
| **Hardware Architecture** | Multi-core CPU (x86\_64 / ARM), 32 GB–64 GB System RAM. | NVIDIA GPU (≥16 GB to 24 GB VRAM, e.g., RTX 3090/4090/5070). |
| **GPU / VRAM Footprint** | **0 GB VRAM (Zero dedicated GPU compute)**. | 100% of VRAM allocated to PyTorch/TensorRT inference. |
| **Narrative Authority** | Sole owner of SQLite ledger, Zod schemas, and bible-state.json. | Zero narrative state; blind to canon, characters, and duel rules. |
| **Temporal Clocking** | Spawns ffprobe to quantize continuous audio into integer frames. | Blind to duration rules; renders the exact frame integer injected in JSON. |
| **Audio Processing** | Synthesizes dialogue stems locally via audio-microservice (:8000). | Banned from audio synthesis and waveform processing. |
| **Visual Rendering** | Headless Remotion CLI (--gl=swangle) compositing in system RAM. | Headless ComfyUI (:8188) outputting raw \#00FF00 character plates. |
| **OS Subprocesses** | Spawns POSIX child processes (ffprobe, git, npm, remotion). | Runs headless Python/ComfyUI daemon listening on local network/socket. |

### **2\. Headless Stability Controls: The Triad**

When the Conductor executes optical printing inside a stamped workspace (goblin-episodes/epXXX/), it launches the Remotion CLI with strict runtime flags:

`npx remotion render \`  
  `src/episodes/Episode_040.tsx \`  
  `outputs/ep040/master.mp4 \`  
  `--gl=swangle \`  
  `--concurrency=1 \`  
  `--offthreadvideo \`  
  `--image-format=png \`  
  `--pixel-format=yuv420p`

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   THE THREE STABILITY CONTROLS                         │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. SOFTWARE GL BACKEND: --gl=swangle                                   │`  
`│    • Directs ANGLE to use SwiftShader CPU rasterization                │`  
`│    • Bypasses Linux GPU driver OpenGL context leaks                    │`  
`│    • Eliminates sub-pixel GPU anti-aliasing variations                 │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 2. WORKER CONCURRENCY LOCK: --concurrency=1                            │`  
`│    • Enforces single-worker sequential frame extraction                │`  
`│    • Caps system RAM ceiling (requires >= 2 GB per browser instance)   │`  
`│    • Prevents multi-browser RAM thrashing and fatal OOM aborts         │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 3. OFF-THREAD MEDIA DECODING: <OffthreadVideo/>                        │`  
`│    • Bypasses Chromium HTML5 <video> DOM decoders                      │`  
`│    • Spawns isolated background FFmpeg processes per video asset       │`  
`│    • Streams raw frame buffers on demand and discards them immediately│`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **1\. Software OpenGL Backend (--gl=swangle / \--use-gl=angle \--use-angle=swiftshader)**

Hardware acceleration drivers on headless Linux and Docker hosts introduce non-deterministic sub-pixel rounding, driver-dependent anti-aliasing, and persistent memory leaks when creating headless EGL contexts.

> * Forcing SwiftShader through Google's ANGLE abstraction layer (swangle) executes all WebGL rendering, CSS matrix transforms, and canvas rasterization entirely within host CPU memory.  
> * This prevents crashes caused by X11/Wayland display server absences and OpenGL context teardown failures.

#### **2\. Locked Concurrency (--concurrency=1)**

While serverless render platforms (such as Remotion Lambda) distribute frame chunking across hundreds of isolated cloud micro-containers, local workstation runs lock worker concurrency to 1\.

> * Each headless Chromium browser instance demands a baseline of at least 2 GB of RAM.  
> * Spawning multiple browser workers in parallel causes them to compete for available system RAM, resulting in severe page faulting and kernel OOM kills during high-resolution 1080p/4K compositing passes.  
> * Concurrency locking guarantees that frame processing remains serialized, maintaining predictable memory usage throughout multi-minute renders.

#### **3\. Off-Thread Media Decoders (\<OffthreadVideo/\>)**

Embedding long-running media assets using standard HTML5 \<video\> tags causes Chromium's internal media pipeline to retain decoded video frames inside DOM heap memory. Over long compositions (e.g., 2,000+ frames), this leads to unbounded memory growth and eventual browser tab termination.

> * Remotion's \<OffthreadVideo/\> primitive completely bypasses the browser's native DOM video element.  
> * It delegates media decoding to background FFmpeg CLI subprocesses running outside Chromium, extracting uncompressed raw image buffers frame-by-frame on demand and immediately freeing them from memory after drawing to the canvas.

### **3\. Environmental Invariants & Determinism Protocol**

To prevent platform-dependent rendering variations across diverse developer operating systems and CI runners, the headless environment enforces a strict determinism protocol:

> * **Operating System Locale and Timezone:** All render executions enforce TZ=UTC and LC\_ALL=C.UTF-8 via POSIX environment variables, preventing locale-specific numeric parsing drift or system clock variances.  
> * **Pinned Runtime Manifest:** Every render environment is pinned to exact binary builds:  
  * *Chromium Milestone:* Version 128.0.6613.119 (or 122.0.6261.94 depending on release tag).  
  * *Node.js Runtime:* Active LTS release v20.12.0.  
  * *FFmpeg Binary Build:* Static release n7.0.2 / 6.1.1-static.  
> * **Cryptographic Font Manifest:** System-level font fallback differences alter text bounding boxes and line wraps in titles and subtitles. The build harness hashes every TrueType (.ttf) and Web Open Font (.woff2) file (e.g., Cinzel-Bold.ttf), asserting SHA-256 binary parity before mounting typography layers.  
> * **Deterministic Integer Basis Points:** To prevent floating-point calculation drift across heterogeneous CPU architectures (x86\_64 vs. ARM64), spatial scalars and layout percentages are calculated using integer basis points (0 to 10,000, where 10,000=1.0×) using Banker's Rounding (Round-Half-Even):

Scale(*A*,*B*)=RoundEven(10,000*A*×*B*​)  
divRoundHalfEven(*N*,*D*)=⎩⎨⎧​*qq*\+1*qq*\+1​if 2*r*\<*D*if 2*r*\>*D*if 2*r*\=*D* and *q*(mod2)=0if 2*r*\=*D* and *q*(mod2)=0​where *q*\=⌊*N*/*D*⌋,*r*\=*N*mod*D*

### **4\. Pre-Flight Execution Gates (\!MissingAssets)**

Because launching headless Chromium is computationally expensive, goblin-viewport-template executes an automated pre-flight linting harness (\!MissingAssets) before initializing @remotion/renderer:

                  `EPISODE WORKSPACE STAGED`  
                             `│`  
                             `▼`  
`┌─────────────────────────────────────────────────────────┐`  
`│        PRE-FLIGHT AUDIT HARNESS (!MissingAssets)        │`  
`│                                                         │`  
`│  1. AST Disk Parity: Asserts all referenced sprites,    │`  
`│     visemes, and audio stems exist on local scratch     │`  
`│  2. Empty-Hash Trap: Rejects zero-byte sha256_e3b0c44...│`  
`│  3. Alpha Edge Contour: Outer 3px mean green spill < 12 │`  
`│  4. Fail-Loud Gate: Null variants abort unless signed   │`  
`│     waiver is committed                                 │`  
`└────────────────────────────┬────────────────────────────┘`  
                             `│`  
                             `▼ (Exit Code 0)`  
`┌─────────────────────────────────────────────────────────┐`  
`│              HEADLESS CHROMIUM RENDERING                │`  
`│        npx remotion render Episode_040.tsx ...          │`  
`└─────────────────────────────────────────────────────────┘`

> * **Disk Parity Sweep (\!MissingAssets):** The harness parses the hardcoded paths in Episode\_XXX.tsx against local storage in public/assets/. If any referenced sprite pose, audio stem, or background plate is missing, the build terminates immediately with exit code 1\.  
> * **The Empty-Hash Sentinel Trap:** Every binary asset is evaluated against the SHA-256 hash of a zero-byte buffer:  
>   EMPTY\_SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>   If any file matches this constant, or has a byte length below the valid plate threshold (\<1,024 bytes), the render aborts immediately to catch truncated network pipes or dropped disk writes.  
> * **Diffusion Alpha Spill Scanner:** For character plates generated via ComfyUI against greenscreen (\#00FF00), a pre-flight pixel pass evaluates the outer 3-pixel border of the alpha silhouette. If the mean green-channel intensity is ≥12, the plate is rejected for excessive color spill before passing to the compositor.  
> * **The Fail-Loud Gate for Missing Art:** While draft animatic builds may gracefully substitute base\_states.idle for un-illustrated emotions, broadcast mastering builds enforce an absolute condition:  
>   ∀shot∈Episode,referenced\_variant(shot)=null  
>   Any missing asset halts compilation unless an explicitly scoped waiver is recorded in the release ledger.

### **5\. Multi-Layer Programmatic Optical Printing Hierarchy**

Within Remotion, goblin-viewport-template acts as a programmatic optical printer, layering visual and audio components in a strict vertical order:

`OPTICAL COMPOSITING LAYER HIERARCHY`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ Layer 4: Post-Processing & Grading (Cinematic LUTs, 35mm grain, shakes)│`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Layer 3: Character Plane (2D GoblinPuppet.tsx OR Keyed Diffusion Plate)│`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Layer 2: Practical Environmental Atmosphere (Rain loops, drifting fog) │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Layer 1: Environment Plate (Static hand-painted background matte)      │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Layer 1 (Environment Matte):** Renders the static 1920×1080 background plate.  
> * **Layer 2 (Practical Atmospheric Loops):** Composites looping environmental visual textures (such as rain streaks or drifting volumetric fog) using \<OffthreadVideo/\> with CSS screen/lighten blend modes.  
> * **Layer 3 (Character Puppet Plane):** Operates in one of two modes:  
  * *Cutout Puppetry (GoblinPuppet.tsx):* Renders the character condition sprite, dynamically overlays frame-synchronized mouth visemes (closed, small, medium, wide) constrained to the manifest bounding box, and applies programmatic talk bounces and shivering via animation hint scalars.  
  * *Diffusion Plate Assembly:* Composites pre-rendered Wan 2.2 video plates, applying chroma key despill filters over the \#00FF00 matte.  
> * **Layer 4 (Camera & Post-Processing):** Applies global canvas transforms (coordinate push-ins, tracking pans, and seeded PRNG screen shakes) and downstream color conforming. To prevent browser CSS filter discrepancies, intensive optical post-processing (such as 3D .cube LUT application, highlight halation, and per-frame procedural film grain) is decoupled from Remotion and executed as an offline FFmpeg filtergraph across the master plate stack.

### **6\. The Reproducibility Hierarchy & Verification Metrics**

The execution model decouples decoded media equivalence from container packaging:

`[ Level 1: Intent & AST ]           ──► Pinned seeds, dialogue AST tokens match[cite: 1, 3].`  
              `│ Pass`  
              `▼`  
`[ Level 2: Temporal Alignment ]     ──► Discrete integer frame budgets and cut points match[cite: 1, 3].`  
              `│ Pass`  
              `▼`  
`[ Level 3: Decoded Media Equivalence ] ──► FORMAL ENGINE PASS GATE: Raw decoded pixel buffers[cite: 1, 3]`  
              `│                            and PCM audio streams match (SSIM, LPIPS, Delta E)[cite: 1, 3].`  
              `▼ Pass`  
`[ Level 4: Container Bit-Identity ] ──► SHA-256 of final multiplexed MP4 matches identically[cite: 1, 3].`  
                                           `(Environment-dependent; sensitive to FFmpeg timestamps)[cite: 1, 3].`

Because final multiplexed MP4 byte streams are susceptible to non-deterministic container metadata, moov-atom serialization timestamps, and variable FFmpeg multithreading, bit-identical container hashes (Level 4\) can diverge across environments.

Consequently, **Level 3 Decoded Media Equivalence represents the formal binary exit gate** for deterministic rendering in goblin-viewport-template. Candidate frames are evaluated against golden reference frames using a two-tier comparison:

SSIMmean​≥0.998,SSIMmin​≥0.995  
LPIPSAlexNet​≤0.015,Δ*E*\<0.1

Failing any of these thresholds halts production and flags the render for technical review.

### **7\. Sandbox Security & Failure-Mode Handling**

Rendering untrusted, agent-authored component code in headless Chromium presents security and stability risks. The execution harness enforces explicit operational safeguards:

> * **Credential Segregation & Ephemeral Sandboxing:** Headless Chromium rendering executes in an ephemeral, credential-free environment completely detached from the studio's control plane. Render processes possess zero access to Cloudflare D1 database tokens, R2 administrative credentials, or GitHub write keys, preventing injected code or agent scripts from exfiltrating secrets.  
> * **Strict Ambient API Ban:** The component tree must remain a pure function of frame index. AST linters scan emitted files to verify that Math.random(), Date.now(), fetch(), and Node.js fs APIs are absent from browser-facing code.  
> * **The Three-Cycle Agent Repair Cap:** When diagnostic agents (such as Jules) execute surgical AST repairs on Episode\_XXX.tsx using ts-morph (e.g., re-aligning a viseme bounding box), execution is capped at a strict budget: **a maximum of 3 cycles or \$0.50 of compute spend**. If the candidate render fails to satisfy geometric invariants within three cycles, the branch is quarantined and escalated to a human director.  
> * **Three-Class Failure Taxonomy:** Runtime exceptions are routed through three explicit recovery paths to prevent uncontrolled retry loops:  
  * *Deterministic Failures (Fatal Halt):* Schema mismatches, missing assets, or banned kinetic verb violations terminate compilation immediately with exit code 1; automated retries are barred.  
  * *Stochastic Failures (Bounded Retry):* Unnatural vocal inflections or minor audio clipping permit up to two retries with adjusted seeds before tripping the circuit breaker.  
  * *Infrastructure Failures (Idempotent Resume):* Dead Chromium workers, POSIX file-rename locks, or network timeouts resume execution atomically from the last content-addressed disk artifact using the task's unique idempotency key (UUIDv7).

---

*User prompt: {{FOCUS: 8\. Optical Compositing Engine & Scene Assembly Mechanics}} /extreme-details*

### **Response: The Digital Optical Printing Architecture & Layer Hierarchy**

Within goblin-viewport-template, the optical compositing engine operates as a software-defined digital optical printer implemented in Remotion. Rather than executing visual effects through manual non-linear editors (NLEs) like Adobe After Effects or DaVinci Resolve, every visual transform, compositing blend, lighting wrap, and color transformation is codified as deterministic, executable React components (FinalCompositeMaster.tsx).

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ LAYER 4: GLOBAL OPTICAL UNIFICATION & MASTERING                        │`  
`│ • Unified 3D Color LUT (Kodak 2383 / Biopunk-Noir .cube Profile)       │`  
`│ • True 35mm silver halide film grain (frame-indexed procedural noise)  │`  
`│ • Single-pass optical halation bloom (isolated luminance > 0.95)       │`  
`│ • Programmatic camera transforms (spring crash zooms, pans, jitter)    │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ LAYER 3: FOREGROUND ACTOR INGESTION & GROUNDING                        │`  
`│ • Cutout Puppetry (GoblinPuppet.tsx) OR Keyed Neural Alpha Video       │`  
`│ • Directional ambient light-wrap & tracked dynamic contact shadows     │`  
`│ • Algorithmic despill filter & sub-pixel alpha contour smoothing       │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ LAYER 2: PRACTICAL ATMOSPHERE & DIEGETIC MOTION GRAPHICS               │`  
`│ • Screen-blended procedural VFX loops (volumetric fog, rain plates)    │`  
`│ • Vector typography, forensic HUD overlays, vector comic balloons     │`  
`│ • Zero-Diffusion Text Rule (Crisp vector SVGs from design tokens)      │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ LAYER 1: BESPOKE HAND-PAINTED MATTE BACKGROUND                         │`  
`│ • Static 2048x1152 matte plate (eliminates AI background swim)         │`  
`│ • Mathematical non-warping camera transforms (interpolate / spring)    │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **1\. Layer 1: Bespoke Hand-Painted Matte Background**

Generative video diffusion backends suffer from background instability, perspective hallucination, and structural morphing between cuts. Layer 1 isolates environmental geometry onto an immutable, high-resolution static plate (e.g., 2048×1152, 16-bit depth).

> * **Perspective Stability:** By locking the physical stage to a fixed matte, camera moves are applied mathematically as affine matrix transforms across the canvas rather than generated through diffusion frame-warping.  
> * **Coordinate Grounding:** The plate defines a spatial reference frame: the horizon line, light origin vectors, and the ground plane elevation (*Y*ground​) where actor contact points anchor.

#### **2\. Layer 2: Practical Atmosphere & Diegetic Motion Graphics**

Practical environmental effects and typography are mounted above the background canvas but beneath foreground actors:

> * **Practical Visual Loops:** Atmospheric plates (e.g., looping volumetric fog or torrential rain) are composited using \<OffthreadVideo/\> with CSS mixBlendMode: "screen" at fixed opacities (e.g., 65%).  
> * **The Zero-Diffusion Text Rule:** Generative diffusion models are strictly prohibited from synthesizing signage, forensic callouts, titles, or subtitles. All typographic elements are rendered programmatically as crisp vector SVG layers derived from design tokens, preserving edge sharpness at arbitrary display resolutions.

#### **3\. Layer 3: Foreground Actor Ingestion & Grounding**

Foreground subjects are introduced into the scene using one of two isolated rendering modes: 2D cutout puppetry or keyed neural alpha plates. Actors are integrated into the lighting environment using dynamic light-wraps and anchor-tracked contact shadows.

#### **4\. Layer 4: Global Optical Unification & Camera Directive Space**

The topmost composite layer harmonizes the underlying elements. It simulates a physical camera lens and analog film stock, stripping the synthetic "plastic sheen" of AI diffusion and binding disparate 2D cutouts and digital paintings into a cohesive visual register.

### **Foreground Actor Ingestion: 2D Cutouts vs. Keyed Diffusion Plates**

The optical compositing engine resolves visual representations through two distinct paths, depending on whether the shot is designated as an animatic/lightweight 2D cut or a photorealistic generative plate.

                        `ACTOR INGESTION PIPELINE`  
                                   `│`  
         `┌─────────────────────────┴─────────────────────────┐`  
         `▼                                                   ▼`  
`┌─────────────────────────────────┐         ┌─────────────────────────────────┐`  
`│ 2D CUTOUT PUPPETRY              │         │ KEYED NEURAL DIFFUSION PLATES   │`  
`│ (GoblinPuppet.tsx)              │         │ (ComfyUI / Wan 2.2 Egress)      │`  
`├─────────────────────────────────┤         ├─────────────────────────────────┤`  
`│ • Ingests manifest.json API     │         │ • Rendered against #00FF00 green│`  
`│ • Swaps emotion base sprites    │         │ • Pre-extracted BiRefNet alpha  │`  
`│ • Snaps Preston Blair visemes   │         │ • Archived as WebM VP9 w/ alpha │`  
`│ • talkBounceAmplitude physics   │         │ • Fallback: colorKey() despill  │`  
`│ • Anchored to Y_ground baseline │         │ • Alpha Edge Purity Gate (< 12) │`  
`└─────────────────────────────────┘         └─────────────────────────────────┘`

#### **1\. 2D Sprite & Viseme Puppetry (GoblinPuppet.tsx)**

In 2D cutout mode, the engine treats character assets as modular vector-and-raster puppets assembled directly from manifest.json contracts:

> * **Condition Sprite Switching:** Ingests the conditions array from dialogue\_ast.json (e.g., \["humiliated"\]) and maps it directly to the character's pre-rendered condition sprite (sprites/bog\_humiliated.png).  
> * **Modular Viseme Snap:** Snaps modular mouth visemes (the Preston Blair A–H phonetic series: closed, small, medium, wide) directly over the sprite. The mounting rectangle is locked to the manifest's mouth\_bounding\_box (\[x, y, width, height\]), ensuring visemes mount accurately without manual keyframing.  
> * **Parametric Animation Hints:** Ingests dynamic scalar multipliers (animation\_hints) to drive character movement without custom code:  
  * talk\_bounce\_amplitude: Modulates vertical pixel displacement (*y*\-bounce) synchronously with speech energy envelopes.  
  * idle\_shiver\_amplitude: Drives subtle, multi-frequency somatic shivering for traumatized or terrified states.

#### **2\. Keyed Diffusion Plates (The Greenscreen VFX Paradigm)**

When rendering high-end generative footage (Wan 2.2 outputs dispatched from Rig 2), characters are generated against an unlit, flat \#00FF00 green void.

> * **Neural Matting Pre-Pass:** Browser-side color keying operates on 8-bit sRGB buffers, which can introduce edge fringing and semi-transparent alpha degradation. To prevent this, ComfyUI on Rig 2 executes an upstream neural matting pass using BiRefNet or Robust Video Matting (RVM).  
> * **Archival Dual-Stream Hygiene:** The egress pipeline packages and archives both the raw \#00FF00 MP4 video plate (as immutable raw footage) and the derived 8-bit alpha WebM VP9 (or ProRes 4444\) video stream to Cloudflare R2.  
> * **Algorithmic Despill Fallback:** If browser-side keying is required, the viewport applies @remotion/effects colorKey() with mathematical despill suppression:  
>   *G*target​\=min(*G*,2*R*\+*B*​)  
> * **Alpha Edge Purity Gating:** Automated pre-flight linters sample the RGB channels of edge pixels along the 3-pixel contour of the alpha boundary. If the green-channel dominance exceeds a calibrated threshold (Spill≥12), the plate is rejected for excessive color spill before compositing.

### **Spatial Grounding & Environmental Lighting Integration**

To prevent foreground cutouts and diffusion plates from appearing as flat "cardboard cutouts" floating over background mattes, the engine programmatically injects contact physics and directional light interaction.

                  `SPATIAL CONTACT SHADOW TRACKING`  
                    
      `Character Anchor Coordinates: (anchorPoint.x, anchorPoint.y)`  
                                    `│`  
                                    `▼`  
       `┌────────────────────────────────────────────────────────┐`  
       `│             <DynamicContactShadow />                   │`  
       `│                                                        │`  
       `│   • Position: translate(-50%, -50%) at Anchor Baseline │`  
       `│   • Geometry: 150px x 30px Radial Gradient Ellipse     │`  
       `│   • Blend: mixBlendMode = "multiply"                   │`  
       `│   • Vertical Recoil Coupling:                          │`  
       `│       y_bounce ▲  ──►  Scale ▼  ──►  Opacity ▼         │`  
       `│       y_bounce ▼  ──►  Scale ▲  ──►  Opacity ▲         │`  
       `└────────────────────────────────────────────────────────┘`

#### **1\. Tracked Dynamic Contact Shadows**

Characters without ground-plane contact shadows fail visual grounding. The compiler injects an automated elliptical shadow element bound to the actor's anchor coordinates:

> * **Anchor Point Binding:** The shadow center is locked to (anchorPoint.x, anchorPoint.y) extracted from manifest.json, ensuring the shadow tracks with the character across horizontal pans and stage translations.  
> * **Vertical Dynamic Recoil:** When the character speaks or moves, the shadow's geometry and opacity modulate in inverse proportion to the vertical bounce displacement (*y*bounce​):  
>   Scaleshadow​\=clamp(1.0−*h*max​*y*bounce​​×0.25,0.70,1.05)  
>   Opacityshadow​\=clamp(0.65−*h*max​*y*bounce​​×0.35,0.20,0.65)  
> * **Zoom Scoping Invariant:** The shadow component is mounted inside the camera-transformed wrapper container rather than the global composition root. This ensures that camera push-ins scale the contact shadow along with the character sprite.

#### **2\. Directional Ambient Light-Wrapping**

High-contrast boundaries between foreground plates and dark background mattes create unnatural, sharp contours. Light-wrapping blends ambient environmental light into the actor's outer boundary:

> * **The Light-Wrap Operation:** An SVG/Canvas filter pass takes the background matte, applies a heavy horizontal Gaussian blur (*σ*\=16px to 24px), and masks it against an eroded, blurred inversion of the foreground actor's alpha channel.  
> * **Edge Infiltration:** The resulting light rim is blended additively or via screen blend mode over the actor's outer 4-pixel contour. This bleeds the atmospheric colors of the background directly into the actor's silhouette, grounding them within the scene's ambient lighting.

### **Mathematical Camera Choreography & Affine Matrix Systems**

Camera motion in goblin-viewport-template is handled programmatically via affine transforms, eliminating spatial raster warping and frame swimming.

       `NARRATIVE INTENSITY (1-10) ──► dialogue_ast.pacing.vocal_intensity`  
                                          `│`  
                                          `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                      KINETIC RIG COMPILER                              │`  
`│                                                                        │`  
`│  • Spring Dynamics: S_curve = spring({ frame, damping: 12, ... })      │`  
`│  • Origin Centroid: crash_zoom_target [412, 198] / 1024 -> 40.2%, 19.3%│`  
`│  • Scale Matrix:    interpolate(zoomSpring, [0, 1], [1.0, 1.45])       │`  
`│  • Handheld Jitter: ΔX = sin(f * 0.24)*A + sin(f * 0.08)*(0.5*A)       │`  
`│                     ΔY = cos(f * 0.18)*A + cos(f * 0.05)*(0.5*A)       │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│`  
                                   `▼`  
             `Baked CSS Transform on Remotion <AbsoluteFill />`

#### **1\. Emotional Crash Zooms & Spring Mechanics**

When an AST line registers a dramatic shift (e.g., an argument reversal, high vocal intensity, or an expended character string), the compiler replaces static framing with a spring-driven camera punch:

`const frame = useCurrentFrame();`  
`const { fps } = useVideoConfig();`

`// Deterministic spring dynamics evaluated locally per sequence`  
`const zoomSpring = spring({`  
  `frame: frame - beatStartFrame,`  
  `fps,`  
  `config: { damping: 12, mass: 0.5, stiffness: 180 },`  
`});`

`const scale = interpolate(zoomSpring, [0, 1], [1.0, 1.45], {`  
  `extrapolateLeft: "clamp",`  
  `extrapolateRight: "clamp",`  
`});`

#### **2\. Dynamic Anchor Point Snapping & Centroid Math**

A common defect in automated video composition is scaling toward the default canvas midpoint (512,512) or (960,540), which decapitates shorter character rigs or zooms into empty background plates. The generator queries manifest.json from goblin-assets-visual to establish normalized transform origins:

> 1. Extracts camera\_anchor\_points.crash\_zoom\_target (e.g., *x*\=412,*y*\=198 for Bog's eye line on a 1024×1024 sprite canvas).  
> 2. Normalizes local sprite coordinates into CSS transformOrigin percentages:  
>    originX=1024412​×100%=40.23%  
>    originY=1024198​×100%=19.33%  
> 3. Injects transformOrigin: "40.23% 19.33%" directly into the outer \<AbsoluteFill/\> camera wrapper, locking crash zooms onto the character's facial centroid.

#### **3\. Parametric Handheld Camera Jitter**

To break the visual rigidity of synthetic rendering without adding GPU passes, the engine applies multi-frequency trigonometric noise:

Δ*X*\=sin(frame×0.24)×*A*jitter​\+sin(frame×0.08)×(0.5⋅*A*jitter​)  
Δ*Y*\=cos(frame×0.18)×*A*jitter​\+cos(frame×0.05)×(0.5⋅*A*jitter​)

Where *A*jitter​ is a scalar amplitude derived directly from the scene's ambient tension rating. This produces organic, non-repeating handheld drift at zero GPU cost.

#### **4\. Swain Motivation-Reaction Unit (MRU) Pacing Compilation**

Generative language models often trigger dialogue concurrently with dramatic events. The compiler enforces Dwight Swain’s Motivation-Reaction Unit causality: **Stimulus → Involuntary Reflex → Conscious Thought → Action/Speech**.

> * When dialogue\_ast.json flags an emotional shock (reaction\_cue: "VISCERAL\_STING"), the compiler inserts a **12-to-24 frame visual pre-roll reaction hold** before dialogue audio begins.  
> * During this hold, the camera executes a subtle push-in (1.0×→1.03×) or swaps the actor's sprite to a stunned eyeline shift, visually capturing psychological realization prior to vocalization.

### **The Anti-Diffusion Mastering Stack & Architectural Hazard Corrections**

AI diffusion outputs frequently exhibit an unnatural "plastic sheen": oversaturated local edge contrast, synthetic midtone smoothing, and a lack of authentic optical halation. The optical engine counteracts these artifacts through an Anti-Diffusion Mastering Stack.

               `THE TWO-TIER OPTICAL MASTERING PIPELINE`  
                 
  `TIER 1: REMOTION COMPOSITING (Rig 1 Headless Chromium)`  
  `┌────────────────────────────────────────────────────────┐`  
  `│ • Compiles clean Layer 1 -> Layer 3 plates             │`  
  `│ • Applies micro-diffraction blur ONLY to actor cutouts │`  
  `│ • Keeps vector typography & HUDs 100% crisp            │`  
  `│ • Single-pass SVG halation (zero children duplication) │`  
  `│ • Exports un-graded master plate stack to ProRes 4444  │`  
  `└───────────────────────────┬────────────────────────────┘`  
                              `│`  
                              `▼`  
  `TIER 2: OFFLINE DETERMINISTIC FFmpeg FILTERGRAPH`  
  `┌────────────────────────────────────────────────────────┐`  
  `│ • 16-bit 3D LUT Application (lut3d=kodak_2383.cube)    │`  
  `│ • True Uncorrelated Film Grain: Frame-seeded PRNG noise│`  
  `│ • Broadcast Color Conforming & Brickwall Peak Limiting │`  
  `└────────────────────────────────────────────────────────┘`

#### **Architectural Hazards & Corrections in Browser Compositing**

Early implementations of optical mastering in browser CSS introduced several technical defects that required explicit architectural corrections:

| Structural Defect | Manifestation & Mechanism Failure | Architectural Resolution |
| :---- | :---- | :---- |
| **The Halation Duplication Defect** | Mounting {children} a second time inside a blurred container duplicated all underlying \<Video\> and \<Audio\> elements, doubling GPU decoding overhead and causing out-of-phase audio echoes. | **Single-Pass SVG Halation:** Apply an SVG filter using feColorMatrix luminance thresholding (*L*\>0.95), feGaussianBlur, and additive feMerge to a single container element. |
| **Static Grain Dirty-Window Trap** | Applying a static PNG overlay (kodak\_5219\_grain.png) left grain patterns frozen in place over moving actors, creating an unnatural "dirty glass" effect. | **Frame-Indexed Seeded Shuffling:** Advance the grain pattern dynamically per frame index: Offset=(frame×137.5)(mod1000), or synthesize procedural noise via FFmpeg. |
| **CSS Linear Gradient LUT Illusion** | Multiplying a linear gradient over the canvas produced a flat vignette rather than the non-linear RGB transfer curves of physical film stock (e.g., Kodak 2383). | **Offline FFmpeg lut3d:** Remotion exports clean ProRes 4444; color grading is executed via FFmpeg's lut3d filter against 16-bit .cube profiles during final packaging. |
| **Blanket Diffractive Blur** | Applying a global CSS blur(0.4px) to the top-level tree softened vector typography, subtitles, and painted background mattes. | **Isolated Actor Softening:** Micro-diffraction blur (0.35px to 0.5px) is applied *strictly* to the diffusion actor plate prior to typography mounting. |

#### **1\. Corrected Single-Pass SVG Halation Filter**

To isolate high-luminance highlights without re-mounting the React component tree, halation is applied through an inline SVG filter definition:

`<svg style={{ position: 'absolute', width: 0, height: 0 }}>`  
  `<filter id="optical-halation">`  
    `{/* Step 1: Isolate upper 5% luminance values (L > 0.95) */}`  
    `<feColorMatrix`  
      `type="matrix"`  
      `values="0 0 0 0 0`  
              `0 0 0 0 0`  
              `0 0 0 0 0`  
              `1 1 1 0 -2.6"`  
    `/>`  
    `{/* Step 2: Directional chromatic blur */}`  
    `<feGaussianBlur stdDeviation="6" result="coloredBlur"/>`  
    `{/* Step 3: Additive merge over pristine source graphic */}`  
    `<feMerge>`  
      `<feMergeNode in="SourceGraphic" />`  
      `<feMergeNode in="coloredBlur" />`  
    `</feMerge>`  
  `</filter>`  
`</svg>`

#### **2\. Frame-Seeded Film Grain Injection**

Authentic silver-halide film grain is uncorrelated frame to frame. When using image-based textures, the background position is shuffled deterministically using a Mulberry32 PRNG keyed to the composition frame:

`const frame = useCurrentFrame();`  
`const grainOffset = (frame * 137.5) % 1000;`

`<AbsoluteFill`  
  `style={{`  
    ``backgroundImage: `url(${staticFile('fx/grain_tile.png')})`,``  
    ``backgroundPosition: `${grainOffset}px ${grainOffset * 1.5}px`,``  
    `mixBlendMode: 'overlay',`  
    `opacity: 0.14,`  
    `pointerEvents: 'none',`  
  `}}`  
`/>`

### **Closed-Loop Visual QA, Volatility Sampling & MEU Surgical Repair**

When candidate video completes rendering, quality assurance is governed by an adversarial, two-mind verification harness that prevents non-deterministic drift and eliminates unnecessary cloud GPU expenditure.

`Candidate MP4 Rendered (ProRes / MP4)`  
        `│`  
        `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ TIER 1: Kinematically Directed Sampling (Volatility V_t)│`  
`│ • Evaluates MAD Luminance proxy / LPIPS spikes         │`  
`│ • Focuses inspection on motion peaks & cut boundaries  │`  
`└───────────────────────┬────────────────────────────────┘`  
                        `│`  
                        `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ TIER 2: Deterministic Geometric & Boundary Checks      │`  
`│ • Alpha Edge Purity: Outer 3px green spill < 12        │`  
`│ • Viseme Centroid Drift: |mouth_center - viseme| < 4px │`  
`└───────────────────────┬────────────────────────────────┘`  
                        `│ Defect Detected (Drift = -24px)`  
                        `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ DIAGNOSTIC REMEDIATION TICKET GENERATION               │`  
`│ • Target: Episode_040.tsx | Component: GoblinPuppet    │`  
`│ • Prop: mouthBoundingBox.y | Delta: +24px              │`  
`└───────────────────────┬────────────────────────────────┘`  
                        `│`  
                        `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ SURGICAL AST PATCHING & LOCAL VERIFICATION (Jules)    │`  
`│ • ts-morph mutates exact JSX attribute in-place        │`  
`│ • Re-renders ONLY 36 affected frames via --gl=swangle  │`  
`│ • Re-evaluates Tier 2 check: $0.00 Cloud GPU Spend     │`  
`└────────────────────────────────────────────────────────┘`

#### **1\. Kinematically Directed Frame Sampling**

Uniform frame sampling (e.g., checking every 24th frame) misses transient defects such as single-frame viseme pops or brief edge-key flashes. The inspection engine utilizes a kinematically directed sampling curve:

> * **Mean Absolute Difference (MAD) Volatility Proxy:** Rapidly triages frame-to-frame visual volatility without running expensive neural optical-flow models:  
>   *Vt*​\=*W*×*H*1​*x*,*y*∑​∣*I*(*x*,*y*,*t*)−*I*(*x*,*y*,*t*\+1)∣  
> * **Peak Maxima Extraction:** Audits frames clustered around the mathematical local maxima of *Vt*​, along with the first frame (*F*0​), the last frame (*F*end​), and the phonetic centroids of spoken dialogue.

#### **2\. Dual-Stage Debug-Mask Verification & Defect Routing**

Because stylized fantasy characters can cause standard neural facial-landmark detectors (e.g., MediaPipe) to fail, the engine executes a parallel solid-color debug pass:

> * **Debug Mask Centroid Calculations:** Mouth visemes and character facial anchors are rendered as high-contrast solid-color masks. The QA critic calculates centroid coordinates directly through pixel arithmetic.  
> * **Diagnostic Defect Routing:**  
  * **ASSET\_ERROR:** If the JSX properties in Episode\_XXX.tsx match the coordinates declared in manifest.json, but the visual render shows a drift \>4px, the underlying sprite manifest is defective. The ticket routes to the visual asset team; code-repair agents are barred from hardcoding arbitrary offsets into JSX to mask flawed art.  
  * **CODE\_ERROR:** If the JSX property deviates from manifest.json, the code is wrong. The defect routes to the automated coding agent (Jules).

#### **3\. Minimal Enclosing Unit (MEU) Surgical AST Patching**

Once a CODE\_ERROR is confirmed, the system avoids costly, non-deterministic full-scene regenerations:

> 1. **Diagnostic Remediation Ticket:** The critic emits a structured JSON payload containing the exact file path, failing component, frame range, and suggested delta.  
> 2. **ts-morph AST Surgery:** Jules opens Episode\_XXX.tsx and mutates *only* the failing sequence property (e.g., updating mouthBoundingBox.y from 240 to 264).  
> 3. **Fast Local Verification:** Jules verifies the fix by rendering only the affected 36-frame sequence locally on CPU:  
>    `npx remotion render src/index.ts ep040-sh03 --frames=144-180 --gl=swangle`

4\. **Circuit Breaker:** If the defect is not resolved within three consecutive iterations, or if the agent enters an oscillation loop (*A*→*B*→*A*), the circuit breaker trips, halting automated retries and escalating the ticket to the human lead architect.

### **Hardware Boundary & Deterministic Execution Profile**

Optical compositing enforces strict physical isolation across studio hardware, preventing resource competition between media rasterization and generative inference:

| System Dimension | Rig 1 (Host Orchestrator & Optical Compositor) | Rig 2 (GPU Tensor Foundry) |
| :---- | :---- | :---- |
| **Primary Workload** | Node.js Conductor, ffprobe, Remotion CLI, FFmpeg. | Headless ComfyUI daemon listening on port 8188\. |
| **Compute Profile** | Multi-Core CPU, 64 GB System RAM, **0 GB Dedicated VRAM**. | High-VRAM GPU (24 GB RTX silicon). |
| **Chromium Flags** | \--gl=swangle, \--concurrency=1, \--offthreadvideo. | **Zero Chromium instances; zero Remotion runs**. |
| **Primary Ingress** | Pinned matte art, .wav stems, R2 alpha plates. | Dialogue strings, character LoRAs, pinned frame budgets. |
| **Primary Egress** | Master Broadcast Deliverable (master\_epXXX.mp4). | Raw \#00FF00 green plates and alpha WebM files. |
| **Failure Boundary** | Software GL prevents OS OpenGL context leaks and RAM crashes. | Sequential queue with explicit POST /free VRAM eviction. |

By executing Remotion compositing on Rig 1 via SwiftShader CPU rasterization (--gl=swangle), the optical pipeline runs deterministically in system RAM without competing for the GPU memory required by Wan 2.2 diffusion passes on Rig 2\.

Once the master video passes all confidence gates, the conductor emits render\_manifest.json and injects cryptographic C2PA metadata into the container header. This seals the finished video file alongside the exact Git commit SHAs, binary asset digests, and toolchain configurations that compiled it, transforming episodic scene assembly into a verifiable, permanently reproducible software release.

---

*User prompt: {{FOCUS: 9\. Asset Harvesting, Boundary Isolation, & Packaging}} /extreme-details*

Response: The Asset Harvesting, Boundary Isolation, and Packaging processes inside goblin-viewport-template form the mechanical supply chain that isolates a stamped episode from the studio’s monolithic repositories. Instead of pulling assets at runtime from global libraries, the system parses the narrative intent, copies only what is strictly required into a local sandbox, and seals it. This ensures the stamped workspace (goblin-episodes/episode-XXX/) is offline-capable, highly performant, and completely decoupled from future updates to upstream art or code.

### **1\. Asset Harvesting & The Storage Envelope (collect-episode-assets.ts)**

The studio’s master visual repository (goblin-assets-visual) contains massive amounts of data: thousands of ComfyUI diffusion plates, full emotional variant banks for every character (e.g., 48 emotions for Bog, 52 for Spleen), and high-resolution background plates. If the viewport simply linked to this root directory, every stamped episode would carry a multi-gigabyte dependency footprint, crippling CI/CD checkouts and bloating Git histories.

To prevent this, collect-episode-assets.ts executes an intelligent pre-flight harvesting pass.

#### **The AST-Driven Dependency Crawl**

The harvester uses the parsed narrative AST as its map, executing a targeted extraction:

> 1. **Parse the Scene AST:** It reads the locked dialogue\_ast.json to identify exactly which characters speak and what emotional conditions they exhibit in this specific episode.  
> 2. **Extract the Manifests:** For each character identified, it reads their specific manifest.json.  
> 3. **Cherry-Pick Variants:** If Bog only exhibits the humiliated and idle states during the episode, the script copies *only* bog\_humiliated.png and bog\_idle.png into the local episode workspace.  
> 4. **Extract Visemes:** It reads the required Preston Blair mouth shapes (closed, small, medium, wide) from the manifest and stages them locally.  
> 5. **Extract Mattes:** It identifies the required location and copies only the specific background matte (e.g., swamp\_relay\_matte.png).

#### **The Pruned Storage Envelope**

All extracted files are staged into the episode’s private public directory: goblin-episodes/ep040/public/assets/.

> * This drops the visual asset footprint of an episode from dozens of gigabytes down to a **100MB to 150MB storage ceiling** (often landing between 5MB and 28MB for 2D animatics).  
> * The resulting workspace is 100% offline self-contained. Rendering the episode does not require network access or a connection to the master asset repository.

#### **The Zero-Byte Poison Trap**

Before the harvester finishes, it executes a critical data hygiene check. It computes the SHA-256 binary hash of every file it just copied. If any file matches the empty-file hash signature:

SHA-256(∅)=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

or if its byte length falls below a valid threshold (e.g., \<1,024 bytes for an image), the script terminates the build immediately with Exit Code 1\. This prevents truncated network transfers or corrupted disk writes from silently ruining a headless render.

### **2\. Component Boundary Isolation & The Import Leak**

Baking static timelines into Episode\_XXX.tsx does not guarantee historical reproducibility if the code still imports presentation components (like the React puppet rig) from a shared, living codebase.

`// THE SHARED-COMPONENT IMPORT LEAK (Fatal Anti-Pattern)`  
`import { GoblinPuppet } from '../../../goblin-viewport-template/src/components/GoblinPuppet';`

If GoblinPuppet.tsx is updated six months later to add a new squash-and-stretch animation, re-rendering this older episode will execute the new animation logic, causing silent visual drift (the "historical corruption trap").

To completely seal the boundary, the code generator enforces one of three strict **Component Boundary Isolation** strategies:

> 1. **Local Component Vendoring (The Standard Pattern):** During generation, generate-episode-repo.ts physically copies the required presentation primitives (GoblinPuppet.tsx, CameraWrappers.tsx, AmbientTrack.tsx) directly into the episode's components/ directory. The episode then imports them locally (import { GoblinPuppet } from './components/GoblinPuppet').  
> 2. **Immutable Semver Package Registries:** Primitives are published to a private registry under strict semantic versioning. The episode's package.json pins the exact version without carats or tildes ("@studio/viewport": "1.4.2"), ensuring dependency resolution cannot float during future CI installs.  
> 3. **Git Submodule Commit Pinning:** The viewport code is tracked as a Git submodule locked to a specific, immutable 40-character commit SHA.

To enforce this, CI linters parse the AST of the generated files using ts-morph. If any ImportDeclaration node tries to traverse out of the episode workspace using parent directory notation (../..), the build fails instantly.

### **3\. Packaging & The Artifact Provenance Manifest (render\_manifest.json)**

The final step in the pipeline transforms the isolated workspace into a verified software release. The compiler emits render\_manifest.json, an immutable lockfile placed at the root of the stamped episode.

This manifest is the root of the **Universal Provenance Graph**, answering exactly how and why the episode exists:

Build ID=H(Canon Root+Dialogue AST+Asset Hashes+Toolchains)  
`{`  
  `"artifact_id": "ep040_master_delivery",`  
  `"build_id": "sha256:4f8a1209bc87e5d...",`  
  `"canon_root_hash": "abe935cccf3951f82f8ed9b05b1f2a19c1e56a8eb2f13ef8e7a9297a81b1b911",`  
  `"upstream_provenance": {`  
    `"worker_sower_commit": "git:7bd4e10",`  
    `"goblin_lore_commit": "git:9c3e401",`  
    `"viewport_template_commit": "git:4f8a120"`  
  `},`  
  `"acoustic_assets": {`  
    `"ep040_sh01.wav": "sha256:4a8c9e2b10a..."`  
  `},`  
  `"visual_sprites_used": {`  
    `"bog_humiliated.png": "sha256:7f83b1657ff1..."`  
  `},`  
  `"runtime_environment": {`  
    `"node_version": "v20.12.0",`  
    `"remotion_version": "4.0.140",`  
    `"chromium_milestone": "122.0.6261.94"`  
  `}`  
`}`

> * **Immutable Freezing:** It freezes the Git commit SHAs of the narrative canon and the compiler itself.  
> * **Binary Hashing:** It records the SHA-256 digests of every .wav stem and .png sprite used, ensuring the assets cannot be swapped without invalidating the manifest.  
> * **Environment Locking:** It logs the exact container digest, Chromium milestone, and Node version used for rendering.

When the episode is rendered to an MP4 by the Remotion CLI, this render\_manifest.json data is injected directly into the video container using C2PA (Coalition for Content Provenance and Authenticity) cryptographic metadata.

If the episode is delivered to a platform or reviewed years later, the C2PA signature proves the video's exact chain of custody back to the human-authored Git commits and the specific generative model weights used, sealing it as a legally defensible and fully reproducible artifact.

---

*User prompt: {{FOCUS: 10\. Progressive Verification, MEU Patching, & Reproducibility Guarantees}} /extreme-details*

### **Response: The Economic QA Funnel & Progressive Confidence Hierarchy**

The verification architecture of goblin-viewport-template operates on an asymmetric economic law: **fail as close as possible to the cheapest point of detection (*T*0​\=\$0.00)**. In an automated production pipeline, passing unvalidated assets or corrupt ASTs downstream to headless Chromium renderers, local speech synthesis workers, or remote GPU diffusion nodes burns compute and invalidates downstream caches.

The verification engine structures quality gates into a five-tier progressive confidence funnel, progressing from inexpensive, deterministic structural assertions to physical signal measurements, optical geometry audits, semantic invariant proofs, and signed human editorial gates.

`[ CONFIDENCE 0: Structural Pre-Flight ]  ──► Zero-byte trap, schema assertions, !MissingAssets ($0.00)`  
              `│ Pass (Exit Code 0)`  
              `▼`  
`[ CONFIDENCE 1: Physical Signal Gates ] ──► ffprobe frame allocations, loudness (-16 LUFS), peak <= -1.0 dBTP`  
              `│ Pass (Exit Code 0)`  
              `▼`  
`[ CONFIDENCE 2: Geometric & Optical ]   ──► Viseme drift < 4px, contact anchor touches floor, spill < 12`  
              `│ Pass (Exit Code 0)`  
              `▼`  
`[ CONFIDENCE 3: Semantic & State Proof] ──► Dual-field lemma verifier, banned capability verbs, epistemic firewall`  
              `│ Pass (Exit Code 0)`  
              `▼`  
`[ CONFIDENCE 4: Editorial Sign-Off ]    ──► Signed Showrunner Review via GitHub Review API & C2PA manifest`

#### **1\. Confidence 0: Structural Pre-Flight (*T*0​)**

Before launching headless Chromium or spawning audio sub-processes, the engine audits raw files on disk:

> * **The Disk Parity Sweep (\!MissingAssets):** Statically parses all import statements, component asset props, and staticFile(...) paths in the generated Episode\_XXX.tsx against the staged workspace files in public/assets/. Any missing background plate, sprite variant, viseme overlay, or audio stem aborts execution immediately with exit code 1\.  
> * **The Zero-Byte Poison Sentinel Trap:** Computes the SHA-256 binary hash of every staged file and compares it against the empty-file constant:  
>   EMPTY\_FILE\_HASH=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>   If any file matches this hash or falls below a minimum size threshold (\<1,024 bytes for image plates or audio stems), compilation halts. This prevents truncated downloads, dropped network writes, or zero-byte scratch allocations from entering the render stage.  
> * **Schema & Typed Asset Contract Assertions:** Asserts that the character manifests (manifest.json), timing sheets (exposure\_sheet.json), and scene ASTs (dialogue\_ast.json) conform to strict Zod runtime schemas.  
> * **Explicit Asset Lifecycle Taxonomy:** Rather than collapsing un-rendered art into generic runtime errors, the asset contract enforces a closed status taxonomy:  
>   Status∈{UNKNOWN,EXPECTED,MISSING,INTENTIONALLY\_ABSENT,INVALID,VALID,WAIVED,LOCKED,SUPERSEDED}  
>   In draft animatic mode, INTENTIONALLY\_ABSENT (committed as an explicit null) gracefully falls back to variants.idle. In broadcast mastering mode, any un-waived null or MISSING asset causes an immediate build failure.

#### **2\. Confidence 1: Physical Signal Gates**

Validates physical waveforms and temporal constraints derived from continuous signals:

> * **Integer Quantization Frame Parity:** Spawns ffprobe across synthesized dialogue stems to measure continuous duration (*D*ms​) and asserts that the rendered video frame allocations match the quantized integer budget:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉  
> * **Broadcast Loudness Conformance (loudnorm):** Evaluates dialogue stems and mixed audio beds against EBU R128 and ATSC A/85 specifications, locking integrated loudness to **−16 LUFS** (±1.0 LUFS) for web masters (or **−24 LUFS** for television broadcast), with a true-peak ceiling locked to **≤−1.0 dBTP** to prevent inter-sample clipping.  
> * **Acoustic Noise Floor Ceilings:** Sweeps audio stems to verify background noise floors remain under **−60 dBFS**, preventing ambient hiss when programmatic ducking curves release back to unity gain.

#### **3\. Confidence 2: Geometric & Optical Invariant Gates**

Validates geometric alignment and compositing integrity across the visual layers:

> * **Solid-Color Debug-Mask Pass:** Bypasses error-prone neural face landmark detectors on stylized characters by rendering high-contrast solid-color masks of mouth visemes and facial centroids. Centroid coordinates are extracted via direct pixel arithmetic.  
> * **Viseme Centroid Drift Tolerance:** Compares the active mouth overlay centroid (*xv*​,*yv*​) against the character manifest's mouth\_bounding\_box (*xm*​,*ym*​):  
>   Drift=(*xv*​−*xm*​)2\+(*yv*​−*ym*​)2​\<4px  
>   Any drift ≥4px trips the gate.  
> * **Stage Contact Baseline Alignment:** Scans alpha silhouettes to verify that character ground anchors (anchor\_point) intersect the background matte floor plane (*Y*ground​) without floating or sinking.  
> * **Alpha Spill Edge Purity Scanner:** Samples RGB channels along the outer 3-pixel contour of keyed diffusion silhouettes. If mean green-channel intensity exceeds threshold limits (Spill≥12), the plate is rejected for excessive color bleed before compositing.

#### **4\. Confidence 3: Semantic & State Consistency**

Validates that physical actions depicted on screen match the immutable relational ledger:

> * **Dual-Field Action Verification Fence:** Compares self-reported model action tokens against independent extraction passes:  
>   Δactions​\=(ActionsSelfReported​∪ActionsExtracted​)∩BannedCapabilityVerbs  
>   Δactions​\=∅⟹HALT\_REJECT  
> * **Prose Lemma Polarity Scanning:** Executes dependency parsing across spoken text and action descriptions to confirm that negated or modal constructions (e.g., *"he could not lift the latch"*) pass, whereas illicit physical actions (e.g., *"he lifted the latch"* with a paralyzed arm) halt compilation.  
> * **Epistemic Horizon Firewall:** Enforces Ignorance by Omission, asserting that characters speak and act only upon facts present in their subjective knowledge vectors, with all canonical secrets purged from prompt envelopes.

#### **5\. Confidence 4: Editorial Sign-Off**

Applies human judgment and legal clearances to the finalized render:

> * **Cryptographic Human Sign-Off:** Final broadcast promotion requires authenticated, signed human approvals submitted via the GitHub Review API, recording the reviewer's public key in the historical ledger.  
> * **C2PA Container Injection:** Injects Content Credentials (C2PA) cryptographic metadata into the MP4 container header, linking the media to authorizing Git commits, training clearances, and render manifests.

### **Minimal Enclosing Unit (MEU) Surgical Patching Architecture**

When a geometric or layout defect is detected during Confidence 2 audits, goblin-viewport-template rejects full-scene re-rolls. In generative pipelines, regenerating an entire 90-second scene or re-running global diffusion passes to fix a minor coordinate error introduces **non-deterministic drift**, altering unrelated poses, facial expressions, and timing.

The system resolves defects via **Minimal Enclosing Unit (MEU) Surgical Patching**, targeting only the isolated component properties or sub-sequences requiring remediation.

                        `DEFECT DETECTED IN RENDER`  
                      `(Viseme drift = 24px in Shot 03)`  
                                     `│`  
                                     `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ 1. DIAGNOSTIC DEFECT CLASSIFICATION ROUTER                             │`  
`│    Inspect JSX props in Episode_XXX.tsx vs. character manifest.json:   │`  
`│    • Props match manifest, but render is wrong -> ASSET_ERROR          │`  
`│      Action: Block code edits; route ticket to Visual Art Pod.         │`  
`│    • Props diverge from manifest -> CODE_ERROR                         │`  
`│      Action: Dispatch Jules Coding Agent VM for AST surgery.           │`  
`└────────────────────────────────────┬───────────────────────────────────┘`  
                                     `│ CODE_ERROR Confirmed`  
                                     `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ 2. BIDIRECTIONAL MEU SCOPING ENGINE                                    │`  
`│    Calculate repair boundary [I_start, I_end]:                         │`  
`│    • Backward Scan: Lock prerequisite anchor (Immutable Prefix)        │`  
`│    • Target Window: Sequence from={144} durationInFrames={36}          │`  
`│    • Forward Scan: Lock dependent downstream cuts (Immutable Suffix)   │`  
`└────────────────────────────────────┬───────────────────────────────────┘`  
                                     `│`  
                                     `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ 3. SURGICAL AST MUTATION VIA ts-morph                                  │`  
`│    Jules modifies ONLY the targeted JSX prop in Episode_XXX.tsx:       │`  
`│    // BEFORE: mouthBoundingBox={{ x: 380, y: 240, w: 64, h: 32 }}      │`  
`│    // AFTER:  mouthBoundingBox={{ x: 380, y: 264, w: 64, h: 32 }}      │`  
`└────────────────────────────────────┬───────────────────────────────────┘`  
                                     `│`  
                                     `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ 4. FAST LOCAL VERIFICATION RENDER (Zero Cloud GPU Spend)               │`  
`│    npx remotion render src/index.ts ep040-sh03 \                       │`  
`│      --frames=144-180 --gl=swangle --output=/tmp/patch_sh03.mp4        │`  
`│    Re-renders isolated 36 frames on CPU; re-evaluates Confidence 2     │`  
`└────────────────────────────────────┬───────────────────────────────────┘`  
                                     `│`  
                    `Did Confidence 2 Invariant Pass?`  
                    `┌────────────────┴────────────────┐`  
                    `▼ YES                             ▼ NO`  
`┌───────────────────────────────────────┐ ┌──────────────────────────────┐`  
`│ COMMIT SURGICAL PATCH                 │ │ CIRCUIT BREAKER EVALUATION   │`  
`│ • Update header: @lifecycle: patched  │ │ Cycle count < 3?             │`  
`│ • Burn patch ticket into history      │ │ • Converging: Retry Cycle +1 │`  
`│ • Merge PR via automated CI           │ │ • Diverging: HARD HALT       │`  
`└───────────────────────────────────────┘ └──────────────────────────────┘`

#### **1\. Diagnostic Router: Code Error vs. Asset Error**

When a geometric invariant fails, the diagnostic router audits coordinate parity before dispatching fixes:

> * **ASSET\_ERROR:** If the JSX properties in Episode\_XXX.tsx match the coordinates declared in manifest.json, the source code accurately implemented the contract, but the underlying graphic or bounding box is defective. The issue routes to the visual art pod; automated coding agents are barred from hardcoding arbitrary offsets into JSX to mask flawed source art.  
> * **CODE\_ERROR:** If the JSX property deviates from manifest.json (or an unhandled layout translation offset the coordinate space), the defect is classified as a code fault and dispatched to the Jules coding agent.

#### **2\. Bidirectional MEU Scoping Engine**

The repair engine identifies the Minimal Enclosing Unit boundary \[*I*start​,*I*end​\] across the timeline:

> * **Backward Scan (Prerequisite Closure):** Scans upward through preceding sequences to lock prerequisite anchors (e.g., verifying character stage translation and emotion state established in Shot 02\) as an **Immutable Prefix**.  
> * **Forward Scan (Downstream Closure):** Scans downward through subsequent shots to verify whether downstream cuts depend on physical transitions initiated in the failing shot, locking subsequent cuts as an **Immutable Suffix**.  
> * **Disjoint Workspace Partitioning at *T*0​:** If multiple defects occur across distinct shots, the orchestrator computes the Longest Common Prefix (LCP) of declared file whitelists:  
>   MEU(*Dk*​)=LCP({*p*∣*p*∈file\_whitelist(*Dk*​)})  
>   If MEU(*Dj*​)∩MEU(*Dk*​)=∅, tasks execute concurrently across isolated worker branches without merge conflicts.

#### **3\. Targeted AST Mutation (ts-morph)**

Inside an isolated sandbox VM, the Jules coding agent avoids regex rewrites that risk corrupting adjacent tags. Jules parses the TypeScript component tree using the TypeScript Compiler API (ts-morph), navigates directly to the failing \<Sequence\> AST node, and mutates only the targeted attribute:

`// Automated AST surgery executed by Jules`  
`import { Project, SyntaxKind } from 'ts-morph';`

`const project = new Project();`  
`const sourceFile = project.addSourceFileAtPath('src/episodes/Episode_040.tsx');`

`// Locate Sequence starting at frame 144`  
`const sequences = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)`  
  `.filter(node => node.getTagNameNode().getText() === 'Sequence');`

`for (const seq of sequences) {`  
  `const fromAttr = seq.getAttribute('from');`  
  `if (fromAttr && fromAttr.getText() === 'from={144}') {`  
    `const puppet = seq.getParent().getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)`  
      `.find(node => node.getTagNameNode().getText() === 'GoblinPuppet');`  
      
    `if (puppet) {`  
      `const mouthProp = puppet.getAttribute('mouthBoundingBox');`  
      `mouthProp?.replaceWithText('mouthBoundingBox={{ x: 380, y: 264, width: 64, height: 32 }}');`  
    `}`  
  `}`  
`}`  
`sourceFile.saveSync();`

#### **4\. Local Fast Verification (Zero Cloud GPU Spend)**

Rather than executing a full episode render, Jules verifies the remediation locally in software:

`npx remotion render src/index.ts ep040-sh03 \`  
  `--frames=144-180 \`  
  `--gl=swangle \`  
  `--output=/tmp/test_sh03_patch.mp4`

This re-renders only the isolated 36-frame window on Rig 1 CPU using SwiftShader (--gl=swangle). The patch is verified against Confidence 2 gates in under 10 seconds without consuming GPU VRAM or cloud resources.

#### **5\. The Circuit Breaker Protocol & Convergence Telemetry**

To prevent automated agents from looping indefinitely, patching enforces a hard circuit breaker:

> * **The Three-Cycle Cap (*N*\=3):** An isolated shot is permitted a maximum of three repair iterations.  
> * **Convergence vs. Divergence Tracking:**  
  * *Convergence (Local Minima):* If Attempt 2 fails with the same error type but reduced delta (e.g., viseme drift reduces from 24px to 6px), the model is converging; Cycle 3 is authorized.  
  * *Divergence (Structural Conflict):* If Attempt 2 triggers an error in a different invariant category (e.g., fixing mouth alignment introduces an alpha contour leak or causes framing clipping), the error is marked divergent. This signals that the underlying asset is defective and cannot be resolved by editing React wrapper props.  
> * **Atomic Rollback & Escalation:** On the third failure or upon divergence detection, the loop aborts immediately. The system executes git checkout \-- Episode\_XXX.tsx, tags the task \#ESCALATED\_REVISION\_CEILING\_BREACHED, and routes the diagnostic diff to the Lead Architect in Slack \#ops-bridge.  
> * **Rule Override Density (*D*override​):** If an invariant trips repeatedly across unrelated tasks, the engine calculates its override density:  
>   *D*override​(rule)=Total Task InvocationsOverrides+CircuitBreakerTrips​  
>   If *D*override​\>0.15, the rule is flagged as an obsolete or miscalibrated constraint, alerting engineers to amend the invariant.

### **The Reproducibility Ladder & Empirical Verification Discipline**

A core architectural principle of goblin-viewport-template is that **"bit-identical reproduction" is an empirical hypothesis to be falsified through testing, not an assumed property**. Declaring an output "100% deterministic" simply because source files are frozen conflates algorithmic determinism with full-system environmental reproducibility.

Determinism=Reproducibility

> * **Determinism:** A mathematical property of an *algorithm* (identical inputs yield identical calculations).  
> * **Reproducibility:** A physical property of an *algorithm plus its execution environment, runtime dependencies, and hardware state* (the ability to reconstruct identical outputs across time and machines).

#### **The Six-Tier Reproducibility Ladder**

The architecture structures reproducibility across an explicit operational ladder:

| Tier | Reproducibility Domain | Verification Mechanism | Acceptance Pass Criteria |
| :---- | :---- | :---- | :---- |
| **Level 0** | **Intent** | Canonical narrative premise, seed lineage, and constraints. | Identical premise tokens and invariant configurations. |
| **Level 1** | **Machine AST** | Validated schema contracts in dialogue\_ast.json. | Identical machine tokens, condition tags, and MRU cues. |
| **Level 2** | **Timing & Sync** | Discrete integer frame budgeting via exposure\_sheet.json. | Exact sample allocations (⌈(*D*ms​/1000)×24⌉). |
| **Level 3** | **Decoded Media** | Raw uncompressed planar pixel matrices and PCM audio buffers. | **Δ*E*\<0.1**, **SSIM\>0.9999** (**Formal Engine Exit Gate**). |
| **Level 4** | **Encoded Streams** | Elementary video (H.264/HEVC) and audio (AAC/PCM) bitstreams. | Bit-identical elementary packets prior to container multiplexing. |
| **Level 5** | **Container Bytes** | Multiplexed MP4 binary deliverable. | SHA-256*A*​\==SHA-256*B*​ (Environment-dependent). |

#### **Why Level 3 Decoded Media Equivalence is the Formal Engine Exit Gate**

Level 5 container byte identity can diverge across platforms due to non-deterministic container timestamps, moov-atom serialization order, variable entropy coding tables, and multi-threaded FFmpeg race conditions.

Therefore, **Level 3 Decoded Media Equivalence represents the formal binary exit gate** for deterministic rendering in goblin-viewport-template. Two renders are certified equivalent if their raw decoded video frames and audio sample buffers satisfy:

SSIMmean​≥0.9999,Δ*E*max​\<0.1

#### **The Three Distinct Reproducibility Experiments**

To prevent conflating narrative drift with encoding variances, the studio tests reproducibility across three isolated experiments:

> 1. **Semantic Reproducibility:** Proves that identical relational state and random seeds compile into an identical dialogue\_ast.json.  
> 2. **Render Reproducibility:** Proves that identical ASTs, asset manifests, and audio stems generate identical raw frame buffers and PCM audio samples under headless software OpenGL (--gl=swangle).  
> 3. **Packaging Reproducibility:** Proves that multiplexing identical raw streams produces matching container deliverables across identical toolchain versions.

#### **The Five Epistemic Qualities**

Every promoted media asset must satisfy five epistemic criteria:

> * **Deterministic:** Same inputs → same computation.  
> * **Reproducible:** An independent environment can reconstruct the same output.  
> * **Auditable:** The system can explain *why* every frame, cut, and property exists.  
> * **Verifiable:** An independent diagnostic critic can validate the result against formal rules.  
> * **Recoverable:** If intermediate media is deleted, the state that produced it can be re-materialized.

### **The Cryptographic Build Identity & Forensic Provenance DAG**

To make reproducibility operational across years of infrastructure updates, the stamped episode anchors its identity in an immutable Directed Acyclic Graph (DAG).

Recording only Git commit SHAs is insufficient. Differences in system font packages, operating system libc libraries, headless browser builds, or FFmpeg versions introduce sub-pixel frame shifts.

Build ID=*f*(Source,Schema,Compiler,Dependency Graph,Runtime,Configuration)

The build identity is calculated as an all-encompassing cryptographic tuple:

Episode Build ID=H​Canon State Snapshot Hash+Ledger Event Log Version+Dialogue AST Hash+Timing Manifest Hash+Acoustic Stems SHA-256+Visual Sprites SHA-256+Generator Compiler Source Hash+Dependency Lockfile Hash+Container Image Digest+Chromium Milestone+Node.js Runtime Version+FFmpeg Static Build String+Font Manifest Hashes+Hardware Metadata+Seeds​​  
`{`  
  `"build_id": "sha256:4f8a1209bc87e5d23456789abcdef0123456789abcdef0123456789abcdef01",`  
  `"episode_id": "EP040",`  
  `"schema_version": "3.2.0",`  
  `"generated_at": "2026-09-28T15:44:00Z",`  
  `"target_source_file": "Episode_040.tsx",`  
  `"source_file_sha256": "7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",`  
  `"parents": {`  
    `"canon_root_hash": "abe935cccf3951f82f8ed9b05b1f2a19c1e56a8eb2f13ef8e7a9297a81b1b911",`  
    `"dialogue_ast_hash": "sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",`  
    `"exposure_sheet_hash": "sha256:9c3e401b2a4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",`  
    `"compiler_source_sha": "git:4f8a120"`  
  `},`  
  `"acoustic_assets": {`  
    `"ep040_sh01.wav": "sha256:4a8c9e2b10a56789abcdef0123456789abcdef0123456789abcdef0123456789",`  
    `"ep040_sh02.wav": "sha256:9c1d8e3f4a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d"`  
  `},`  
  `"visual_sprites_used": {`  
    `"bog_humiliated.png": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",`  
    `"spleen_defensive.png": "sha256:a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4"`  
  `},`  
  `"runtime_environment": {`  
    `"container_digest": "ghcr.io/studio/render-node@sha256:7b4a29c1e4d3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",`  
    `"node_version": "v20.12.0",`  
    `"remotion_version": "4.0.140",`  
    `"chromium_milestone": "122.0.6261.94",`  
    `"ffmpeg_build": "6.1.1-static",`  
    `"font_manifest": {`  
      `"Cinzel-Bold.ttf": "sha256:5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b"`  
    `}`  
  `},`  
  `"hardware_execution_metadata": {`  
    `"host_target": "Rig1_CPU_Cluster",`  
    `"cpu_architecture": "x86_64_avx512",`  
    `"nvidia_driver_version": "550.54.14",`  
    `"cuda_version": "12.4",`  
    `"gpu_device": "NONE_CPU_SWANGLE_RASTERIZED"`  
  `},`  
  `"reproducibility_audit": {`  
    `"protocol": "visual_conformance_v2",`  
    `"double_render_status": "BIT_IDENTICAL",`  
    `"measured_ssim": 1.0,`  
    `"delta_e_max": 0.0`  
  `},`  
  `"broker_signature": "MEQCID7f3a8b...[SEALED_ECDSA_SIGNATURE]"`  
`}`

> * **Hardware State Logging:** Records host driver versions and CPU architectures to account for potential floating-point variances across chip migrations.  
> * **Media Broker Cryptographic Signature:** The manifest is signed using the local node's private key, confirming that rendering was executed by an authorized physical worker.

### **The Determinism Measurement Harness & Operational Health**

To transition determinism from an assumption into an empirically tested property, goblin-viewport-template executes an automated **Determinism Measurement Harness**:

                      `DETERMINISM VERIFICATION EXPERIMENT`  
                        
   `[ Machine A (Rig 1) ]                                 [ Machine B (CI Worker) ]`  
   `Run 1: Cold Cache, Thread=1                           Run 3: Cold Cache, Clean Container`  
   `Run 2: Warm Cache, Thread=1                                       │`  
            `│                                                        │`  
            `▼                                                        ▼`  
      `Render A1 / A2                                             Render B`  
            `│                                                        │`  
            `└──────────────────────────┬─────────────────────────────┘`  
                                       `▼`  
                       `FRAME-BY-FRAME PIXEL BUFFER HASH`  
                                       `│`  
                      `Assert Tolerance Defined in Advance:`  
                      `• SSIM >= 0.9999`  
                      `• Delta E < 0.1`  
                      `• Max Pixel Delta = 0 (Software GL)`

#### **1\. The Multi-Environment Testing Battery**

> 1. **Double Local Render:** Renders the episode twice on the same machine (Rig 1\) in the pinned container—once with a cold cache and once with a warm cache.  
> 2. **Cross-Host Render:** Renders the episode a third time on an isolated machine or fresh CI runner.  
> 3. **Frame Buffer Diffs:** Hashes raw decoded frame buffers and measures perceptual divergence (SSIM, Δ*E*).  
> 4. **A-Priori Tolerance Gating:** Acceptance thresholds must be defined in advance to prevent post-hoc rationalization of rendering variations.

#### **2\. Pipeline Health Metrics & Failure Budgets**

A verification pipeline that halts indiscriminately on soft stylistic edge cases risks production paralysis. The architecture balances strict enforcement with explicit operational failure budgets:

> * **Bounded Retries:** If a candidate dialogue pass trips a soft stylometric gate, the engine feeds the violation back as a negative constraint for up to **two retries** before escalating.  
> * **Rejection-Rate Monitoring:** Tracks pipeline health metrics in real time:  
>   Rejection Rate=Total Generation InvocationsRejected Generations​  
>   If the rejection rate exceeds 25% across a rolling window of 100 scenes, compilation pauses to alert the system architect, preventing infinite retry loops from stalling active production lines.

---

*User prompt: {{FOCUS: goblin-episodes/episode-XXX/}} /extreme-details*

Response: goblin-episodes/episode-XXX/ (also referenced in pipeline configurations as goblin-episodes/epXXX/ or zero-padded studio notation sXXeYY/) represents the **stamped, isolated, and committed episode workspace** in the generation pipeline.

Unlike legacy architectures where a centralized, mutable runtime application dynamically parsed external JSON sidecars, goblin-episodes/episode-XXX/ is an immutable, self-contained software release package. It encapsulates static TypeScript composition source code, localized and pruned binary assets, vendored presentation components, and an immutable cryptographic provenance lockfile (render\_manifest.json).

### **1\. Architectural Purpose: Eradication of the Historical Corruption Trap**

The existence of goblin-episodes/episode-XXX/ resolves the **historical corruption trap** inherent in monolithic rendering engines.

`THE HISTORICAL CORRUPTION TRAP (LEGACY DYNAMIC MODEL)`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ Month 0:  Episode 012 rendered against Shared Viewport v1.0.0          │`  
`│           • Result: Frame 144 viseme aligned, crash zoom target exact. │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Month 6:  Shared Viewport refactored to v1.4.0 for Episode 040         │`  
`│           • Altered camera spring dampening curves in GoblinPuppet.tsx │`  
`│           • Refactored transform-origin logic for tall character rigs │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Re-render Episode 012 against Viewport v1.4.0                          │`  
`│           • SILENT REGRESSION: Visemes detach from chin baseline,      │`  
`│             camera zooms decapitate characters, timing rubber-bands.   │`  
`└────────────────────────────────────────────────────────────────────────┘`

In the original goblin-viewport model, running an episode meant feeding dynamic scene.json payloads into a single long-lived Remotion app. When shared presentation primitives (such as GoblinPuppet.tsx or camera dampening curves) were refactored for newer episodes, attempting to re-render earlier episodes against that shared codebase caused silent visual regressions: mouth visemes detached from chin baselines, camera zooms misaligned, and temporal easing curves rubber-banded.

The studio resolved this by separating the compiler from the artifact:

> * **goblin-viewport-template** serves strictly as an offline code-generation compiler and scaffolding template; it is never an episode runtime target.  
> * **goblin-episodes/** is the committed destination repository that grows by one dedicated, isolated directory (or commit) per episode cycle.  
> * Every stamped workspace inside goblin-episodes/episode-XXX/ acts as an autonomous software package capable of re-rendering its final broadcast deliverable years later with bit-identical fidelity.

### **2\. Workspace Directory Topology & File Anatomy**

A stamped workspace inside goblin-episodes/episode-XXX/ contains every code, asset, configuration, and manifest dependency required to execute headless rendering offline without reaching out to external networks or sibling repositories:

`goblin-episodes/episode-040/`  
`├── components/                          # Vendored Presentation Primitives`  
`│   ├── GoblinPuppet.tsx                 # Isolated 2D character rig & viseme snapper`  
`│   ├── CameraWrappers.tsx               # Sequence-scoped local frame wrappers`  
`│   ├── AmbientTrack.tsx                 # Programmatic sidechain ducking bed`  
`│   └── FoleyTrack.tsx                   # Deterministic seeded transient audio`  
`├── public/assets/                       # Pruned Episode Asset Envelope (<100MB)`  
`│   ├── sprites/                         # Specific character emotion poses referenced`  
`│   │   ├── bog_humiliated.png`  
`│   │   └── spleen_defensive.png`  
`│   ├── visemes/                         # Specific Preston Blair mouth overlays`  
`│   │   ├── mouth_closed.png`  
`│   │   ├── mouth_small.png`  
`│   │   ├── mouth_medium.png`  
`│   │   └── mouth_wide.png`  
`│   ├── backgrounds/                     # Static hand-painted location matte`  
`│   │   └── swamp_relay_matte.png`  
`│   └── audio/                           # Master acoustic clock stems`  
`│       ├── dialogue/                    # Synthesized 48 kHz uncompressed WAV stems`  
`│       │   ├── ep040_sh01.wav`  
`│       │   └── ep040_sh02.wav`  
`│       ├── foley/                       # Pinned transient sound effects`  
`│       │   └── valve_drop.wav`  
`│       └── ambient/                     # Loopable environmental audio bed`  
`│           └── swamp_drone.wav`  
`├── Episode_040.tsx                      # Source-Baked React Remotion Composition`  
`├── render_manifest.json                 # Cryptographic Multi-Repo Provenance Lockfile`  
`├── remotion.config.ts                   # Headless Hardware Stability Configuration`  
`├── package.json                         # Pinned Dependencies (Zero Floating Carats)`  
`├── tsconfig.json                        # Inherited TypeScript Ruleset`  
`└── out/                                 # Final Conformed Render Egress`  
    `├── Episode_040.mp4                  # Broadcast Master (H.264 / AAC)`  
    `└── Episode_040_mezzanine.mov        # Archival Master (ProRes 4444 + Alpha)`

#### **Delivery Standards & Naming Conventions**

When packaging offline milestone episodes or conforming to network intake guidelines (e.g., Netflix/IMF delivery standards), the directory structure supports standardized file naming conventions:

> * **Universal Zero-Padding:** Formatted as sXXeYY/ (e.g., s02e19/) with shot sub-folders incremented by tens (sh0010/, sh0020/), permitting the non-destructive insertion of intermediate cuts (sh0015/). Exported frame sequences use strict zero-padded notation (.0001.png, .0002.png).  
> * **Self-Describing Redundant Filenames:** Files carry parent hierarchy tags (e.g., s02e19\_sh0010\_board\_v001.psd), ensuring identity remains unambiguous if detached from the folder hierarchy.  
> * **Legal Character Sets:** Strict ASCII enforcement restricting filenames to \[a-zA-Z0-9.\_-\] with no spaces or special characters.  
> * **Two-Tier Manifest Indexing:** A root master manifest (manifest.csv) indexes every working internal asset, checksum, and status tag to eliminate filesystem tree crawling during batch ingestion.

### **3\. Source-Baking Mechanics (Episode\_XXX.tsx)**

The central executable script of the workspace is Episode\_XXX.tsx. It is generated by generator/generate-episode-repo.ts via compiler source-baking, translating abstract narrative and timing manifests into static TypeScript JSX literals.

`// goblin-episodes/episode-040/Episode_040.tsx`  
`// @lifecycle: generated`  
`// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f`  
`// @build_profile: 1080p_24fps_master`

`import React from 'react';`  
`import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';`  
`import { GoblinPuppet } from './components/GoblinPuppet';`  
`import { Shot01CameraWrapper, Shot02CameraWrapper } from './components/CameraWrappers';`  
`import { AmbientTrack } from './components/AmbientTrack';`

`export const Episode_040: React.FC = () => {`  
  `return (`  
    `<AbsoluteFill style={{ backgroundColor: '#050505' }}>`  
      `{/* Background Layer: Continuous Ambient Audio with Sidechain Ducking */}`  
      `<AmbientTrack`  
        `ambientFile="swamp_drone.wav"`  
        `baseVolume={0.4}`  
        `attenuationDb={-14.0}`  
        `dialogueWindows={[`  
          `{ from: 8, to: 83 },`  
          `{ from: 107, to: 182 }`  
        `]}`  
      `/>`

      `{/* SHOT 01: Dialogue line_001 (BOG) */}`  
      `<Sequence from={0} durationInFrames={99}>`  
        `<Shot01CameraWrapper originX="48.2%" originY="21.4%">`  
          `<GoblinPuppet`  
            `character="BOG"`  
            `emotion="humiliated"`  
            `anchorPoint={{ x: 512, y: 980 }}`  
            `mouthBoundingBox={{ x: 380, y: 240, width: 64, height: 32 }}`  
            `talkBounceAmplitude={8}`  
            `spriteSrc={staticFile("assets/sprites/bog_humiliated.png")}`  
          `/>`  
          `<Sequence from={8} durationInFrames={75}>`  
            `<Audio`  
              `src={staticFile("audio/dialogue/ep040_sh01.wav")}`  
              `volume={1.0}`  
            `/>`  
          `</Sequence>`  
        `</Shot01CameraWrapper>`  
      `</Sequence>`

      `{/* SHOT 02: Dialogue line_002 (SPLEEN) */}`  
      `<Sequence from={99} durationInFrames={99}>`  
        `<Shot02CameraWrapper originX="51.0%" originY="19.8%">`  
          `<GoblinPuppet`  
            `character="SPLEEN"`  
            `emotion="defensive"`  
            `anchorPoint={{ x: 480, y: 960 }}`  
            `mouthBoundingBox={{ x: 410, y: 220, width: 58, height: 30 }}`  
            `talkBounceAmplitude={14}`  
            `spriteSrc={staticFile("assets/sprites/spleen_defensive.png")}`  
          `/>`  
          `<Sequence from={8} durationInFrames={75}>`  
            `<Audio`  
              `src={staticFile("audio/dialogue/ep040_sh02.wav")}`  
              `volume={1.0}`  
            `/>`  
          `</Sequence>`  
        `</Shot02CameraWrapper>`  
      `</Sequence>`  
    `</AbsoluteFill>`  
  `);`  
`};`

#### **Static Compilation Invariants**

> 1. **Unquoted Numeric Literals:** Frame boundaries (from={0}, durationInFrames={99}) and volume coefficients are written as pure numeric literals rather than strings (from="0"), preventing runtime type-coercion bugs and AST re-evaluation overhead in Remotion.  
> 2. **Absolute Timeline Accumulation:** Sequential clips are never concatenated dynamically. The start boundary of every sequence is locked upfront using integer accumulation:  
>    fromFrame*k*​\=*i*\=1∑*k*−1​total\_shot\_frames*i*​  
>    This eliminates floating-point sub-frame rounding drift across long scenes.  
> 3. **Sequence-Relative Hook Isolation:** Remotion’s useCurrentFrame() hook is barred from the composition root. Top-level evaluation forces subsequent cuts to evaluate camera transforms against global scene time. The compiler generates dedicated shot wrappers (\<Shot01CameraWrapper\>, \<Shot02CameraWrapper\>), ensuring useCurrentFrame() resets locally from frame 0 within each \<Sequence\>.  
> 4. **Normalized Origin Projection:** Local character sprite anchor coordinates (1024×1024) are projected onto canvas space (1920×1080) at bake time by factoring in puppet scaling (*s*):  
>    originX=canvas.widthpuppet.x+(anchor.x×*s*)​×100%  
>    originY=canvas.heightpuppet.y+(anchor.y×*s*)​×100%  
>    These values are baked directly into inline style.transformOrigin, bypassing dynamic coordinate lookups during headless execution.

### **4\. Asset Harvesting & Physical Pruning (collect-episode-assets.ts)**

A self-contained episode repository cannot store the studio's full asset library. The master visual repository (goblin-assets-visual) contains complete character emotion banks, alternative poses, and high-resolution background plates exceeding multi-gigabyte scales.

`THE MULTI-EPISODE REDUNDANCY PROBLEM`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ Global Character Emotion Bank: 50–150 MB per character                │`  
`│ 4 Active Characters: 200–600 MB per episode (unpruned)                 │`  
`│ 20 Episodes per Season: 4–12 GB pure redundancy across Git history!    │`  
`└────────────────────────────────────────────────────────────────────────┘`  
                                    `│`  
                                    `│ collect-episode-assets.ts AST Crawl`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ PRUNED EPISODE WORKSPACE (goblin-episodes/episode-040/public/assets/)  │`  
`│ • Harvests ONLY 10–20 active sprites, mouth visemes, and backgrounds   │`  
`│ • Realized Workspace Size: 5 MB – 20 MB (90%+ storage reduction)       │`  
`│ • Hard Pass/Fail Enforcement: Total assets/ directory < 100 MB         │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **The Harvester Mechanics**

To ensure self-containment while respecting storage budgets, scripts/collect-episode-assets.ts executes an AST-driven dependency crawl during Stage 8 compilation:

`// scripts/collect-episode-assets.ts`  
`interface AssetReference {`  
  `file: string;`  
  `sourceRepo: "goblin-assets-visual" | "goblin-lora-training";`  
  `sourceCommit: string;`  
`}`

`function collectRequiredAssets(episodeScene: CompiledScene): AssetReference[] {`  
  `const required = new Set<string>();`

  `for (const round of episodeScene.rounds) {`  
    `if (round.speaker) {`  
      `const manifest = loadCharacterManifest(round.speaker);`  
      `// exact emotion + facing combination required by this line`  
      `const spriteFile = resolveSprite(manifest, round.emotion, round.facing);`  
      `required.add(spriteFile);`

      `// mouth-shape overlays actually used in this line's viseme timeline`  
      `for (const cue of round.mouthCues) {`  
        `required.add(manifest.mouth_shapes[cue.value]);`  
      `}`  
    `}`  
  `}`

  `// background matte actually used`  
  `required.add(loadLocationManifest(episodeScene.location).background);`

  `return Array.from(required).map((file) => ({`  
    `file,`  
    `sourceRepo: "goblin-assets-visual",`  
    `sourceCommit: getCurrentCommit("goblin-assets-visual"),`  
  `}));`  
`}`

#### **Performance Audit Limits**

The pipeline enforces a strict performance metric across all stamped workspaces:

> * **Primary Metric:** Total assets/ directory size per episode repo \<100MB (with a hard ceiling of 150MB).  
> * **Allowed Regression:** 0%. Exceeding 100MB indicates that the collection logic accidentally pulled in an entire unpruned emotion bank rather than the specific referenced poses.  
> * **The Zero-Byte Poison Trap:** Computes the SHA-256 binary hash of every staged file. If any asset matches the empty-file signature (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855), the build halts immediately with exit code 1\.  
> * **\!MissingAssets Pre-Render Linter:** Audits every staticFile(...) path in Episode\_XXX.tsx against disk before launching headless Chromium, preventing midnight render crashes caused by missing files.

### **5\. Component Boundary Isolation & Vendoring**

Baking static JSX literals into Episode\_XXX.tsx fails to guarantee historical determinism if the file imports components via relative paths escaping its directory boundary (import { GoblinPuppet } from '../../../goblin-viewport-template/...').

To prevent this "Shared-Component Import Leak," the workspace enforces component boundary isolation through one of three strategies:

| Isolation Strategy | Mechanism | Operational Trade-Off |
| :---- | :---- | :---- |
| **1\. Local Component Vendoring (Standard)** | generate-episode-repo.ts physically copies GoblinPuppet.tsx, CameraWrappers.tsx, and AmbientTrack.tsx into epXXX/components/ at bake time. | Maximizes offline self-containment; decouples the workspace from all sibling repository edits. |
| **2\. Immutable Semver Registries** | Workspace package.json imports presentation primitives via pinned private package releases: "@studio/viewport": "1.4.2" (zero carats, zero tildes). | Clean repository boundaries; guarantees that package managers do not float dependencies during future CI installs. |
| **3\. Git Submodule Commit Pinning** | The workspace tracks the viewport codebase as a Git submodule locked to an immutable 40-character commit SHA. | Preserves Git tree history; requires submodule checkout initialization during headless CI builds. |

### **6\. The Sealed-File Lifecycle & The Showrunner Eject Button**

Human artistic intervention is an inevitable operational reality in cinematic animation. When a human director opens Episode\_XXX.tsx to manually tweak a camera spring curve or adjust timing, the file's cryptographic header state machine arbitrates subsequent automated builds:

`// @lifecycle: generated | patched | locked`  
`// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f`  
`// @patch_history: ["QA-EP040-SH01-ZOOM_ALIGN"]`

                     `UPSTREAM REGENERATION ATTEMPT`  
                                   `│`  
                                   `▼`  
                   `Inspect Episode_XXX.tsx Header`  
                                   `│`  
         `┌─────────────────────────┼─────────────────────────┐`  
         `▼                         ▼                         ▼`  
`[@lifecycle: generated]   [@lifecycle: patched]     [@lifecycle: locked]`  
`Checksum matches body?    Targeted ts-morph diff?   MANUAL HUMAN OVERRIDE`  
         `│                         │                         │`  
   `┌─────┴─────┐                   │                         │`  
   `▼           ▼                   ▼                         ▼`  
`[Match]     [Mismatch]    [Apply Verified Patch]      [HARD STOP]`  
`Safe        Treat as      Re-compute checksum         Refuse overwrite.`  
`Overwrite   LOCKED                                    Emit .candidate.tsx`  
                                                      `Log DIRECTOR_OVERRIDE`

> 1. **@lifecycle: generated:** Stamped automatically by the compiler alongside a SHA-256 body checksum. CI maintains automated merge authority and may overwrite the file cleanly during upstream script re-runs.  
> 2. **@lifecycle: patched:** Modified by automated diagnostic repair agents (such as the Jules coding agent). Jules executes surgical AST repairs on specific JSX props (e.g., re-aligning viseme bounding boxes via ts-morph), re-renders an isolated 36-frame window on CPU to verify the fix, updates the checksum, and records the defect ticket in @patch\_history.  
> 3. **@lifecycle: locked:** Manually edited by a human director (the "Showrunner Eject Button"). If upstream narrative changes trigger a re-run of generate-episode-repo.ts, the generator reads the @locked tag (or detects a checksum mismatch indicating uncommitted edits). The compiler **refuses to overwrite the director's adjustments**; it writes its output to Episode\_XXX.candidate.tsx and halts, logging an append-only DIRECTOR\_OVERRIDE event into the historical ledger.

### **7\. Provenance Root: render\_manifest.json**

Every stamped workspace contains an immutable build lockfile, render\_manifest.json, positioned at the root directory. It links the final rendered media to the Directed Acyclic Graph (DAG) of authorizing inputs and execution environments:

Build ID=H(Canon Root+Dialogue AST+Exposure Sheet+Asset Hashes+Container Digest+Toolchains)  
`{`  
  `"build_id": "sha256:4f8a1209bc87e5d23456789abcdef0123456789abcdef0123456789abcdef01",`  
  `"episode_id": "EP040",`  
  `"schema_version": "3.0.0",`  
  `"generated_at": "2026-09-28T15:44:00Z",`  
  `"target_source_file": "Episode_040.tsx",`  
  `"source_file_sha256": "7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",`  
  `"parents": {`  
    `"dialogue_ast_hash": "sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",`  
    `"exposure_sheet_hash": "sha256:9c3e401b2a4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",`  
    `"canon_tree_sha": "git:9c3e401",`  
    `"assets_visual_tree_sha": "git:v1.4.0",`  
    `"viewport_template_sha": "git:4f8a120",`  
    `"worker_sower_engine_commit": "git:7bd4e10"`  
  `},`  
  `"acoustic_assets": {`  
    `"ep040_sh01.wav": "sha256:4a8c9e2b10a56789abcdef0123456789abcdef0123456789abcdef0123456789",`  
    `"ep040_sh02.wav": "sha256:9c1d8e3f4a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d"`  
  `},`  
  `"visual_sprites_used": {`  
    `"bog_humiliated.png": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",`  
    `"spleen_defensive.png": "sha256:a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4"`  
  `},`  
  `"runtime_environment": {`  
    `"container_digest": "ghcr.io/studio/render-node@sha256:7b4a29c1e4d3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",`  
    `"node_version": "v20.12.0",`  
    `"remotion_version": "4.0.140",`  
    `"chromium_milestone": "122.0.6261.94",`  
    `"ffmpeg_build": "6.1.1-static",`  
    `"font_manifest": {`  
      `"Cinzel-Bold.ttf": "sha256:5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b"`  
    `}`  
  `},`  
  `"reproducibility_audit": {`  
    `"protocol": "visual_conformance_v2",`  
    `"double_render_status": "BIT_IDENTICAL",`  
    `"measured_ssim": 1.0,`  
    `"delta_e_max": 0.0`  
  `}`  
`}`

#### **Forensic Traversal Capabilities**

This immutable record enables bidirectional forensic graph queries:

> * **Backward Audit:** Traces why a specific frame exists:  
>   Frame 144→Shot 02→Sequence Prop→Audio Stem→AST Beat→Somatic Vector→Canon Constraint  
> * **Forward Blast Radius:** Identifies every downstream scene invalidated when an upstream lore fact or asset is mutated (is\_dirty \= 1).  
> * **C2PA Metadata Injection:** The manifest is injected directly into the final deliverable MP4 container as C2PA cryptographic metadata, establishing an unbroken, legally defensible chain of custody from human-authored Git commits down to the delivered broadcast pixels.

### **8\. Headless Execution Profile & Preservation Hierarchy**

Rendering the stamped workspace is strictly a CPU and system-RAM workload executed on **Rig 1** (or dedicated CPU worker containers). Headless Chromium processes are barred from Rig 2 to prevent competing with high-VRAM video diffusion pipelines (e.g., Wan 2.2).

`# Headless render invocation inside goblin-episodes/episode-040/`  
`npx remotion render \`  
  `Episode_040 \`  
  `out/Episode_040.mp4 \`  
  `--gl=swangle \`  
  `--concurrency=1 \`  
  `--offthreadvideo`

> * **\--gl=swangle:** Directs Google's ANGLE layer to use SwiftShader software OpenGL rasterization, executing all greenscreen chroma keying, despill shaders, and layer compositing entirely in system RAM. This bypasses Linux GPU driver OpenGL context leaks and display server dependencies.  
> * **\--concurrency=1:** Enforces single-worker frame extraction, capping memory consumption and preventing multi-browser RAM thrashing and Linux kernel OOM kills.  
> * **\<OffthreadVideo/\>:** Bypasses Chromium's internal HTML5 \<video\> DOM decoder heap by spawning dedicated background FFmpeg child processes to stream uncompressed raw frame buffers on demand.

#### **The Three Preservation Tiers**

Once the headless render completes, the studio manages the output across three distinct tiers to balance long-term reproducibility against distribution requirements:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ TIER 1: SOURCE & IR ARCHIVE (goblin-episodes/episode-XXX/)             │`  
`│ • Episode_XXX.tsx, dialogue_ast.json, render_manifest.json, assets/   │`  
`│ • Fully reproducible text-and-stem archive; permanently versioned      │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ TIER 2: HIGH-FIDELITY MEZZANINE MASTER (out/Episode_XXX_mezzanine.mov) │`  
`│ • Apple ProRes 4444 (with 8-bit/16-bit Alpha where applicable)         │`  
`│ • Discrete 24-bit 48 kHz Dialogue, Music, and Foley M&E audio stems    │`  
`│ • Allows re-grading, re-dubbing, and mastering without re-generation   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ TIER 3: DELIVERY DERIVATIVES (out/Episode_XXX.mp4)                     │`  
`│ • Web Streaming Profile: Integrated -16 LUFS (±1.0), True-Peak <= -1dB │`  
`│ • US Broadcast Profile (ATSC A/85): Integrated -24 LKFS, True-Peak -2dB│`  
`│ • European Broadcast Profile (EBU R128): Integrated -23 LUFS           │`  
`└────────────────────────────────────────────────────────────────────────┘`

By archiving discrete uncompressed M\&E (Music & Effects) stems alongside ProRes 4444 master plates, the studio can author foreign-language dub packs, accessibility audio descriptions, and future broadcast format conversions decades later without executing generative re-renders.

---

*User prompt: can you go back to the beginning of the conversation and sum up all of material until the end of the chat*

Response: The entire architectural progression moves from speculative, distributed infrastructure toward a hardened, deterministic, event-sourced media compilation engine. The system replaces probabilistic text-and-video generation with an offline software build system where narrative truth is calculated deterministically, generative models operate as untrusted workers, and media deliverables are compiled into immutable, reproducible artifacts.

### **1\. The Core Epistemic Consensus & Constitutional Axioms**

The foundational thesis of the architecture is the strict separation between **Semantic Meaning (Axis A)** and **Media Representation/Projection (Axis B)**.

               `THE SOVEREIGN SEPARATION OF MEANING AND PROJECTION`  
                 
    `AXIS A: SEMANTIC TRUTH & LAW                    AXIS B: UNTRUSTED PROJECTION`  
 `┌──────────────────────────────────────┐          ┌─────────────────────────────┐`  
 `│ 000.goblin-lore (Canon Repository)   │          │ worker-sower-engine         │`  
 `│ • Markdown dossiers & Zod schemas    │          │ • Conductor (produceEpisode)│`  
 `│ • Flat table of narrative facts      │ ───────► │ • LLM dialogue generation   │`  
 `│ • scripts/compile.ts -> bible-state  │          │ • ComfyUI / Wan 2.2 / Flux  │`  
 `│ • ZERO runtime LLMs in state path    │          │ • Remotion video projection │`  
 `└──────────────────────────────────────┘          └─────────────────────────────┘`

> * **Untrusted Generative Models:** Large Language Models (LLMs), neural Text-to-Speech (TTS), and video diffusion models operate strictly as headless, untrusted rendering workers with zero state, temporal, or spatial authority. Probabilistic systems propose; deterministic code decides what is allowed to be true.  
> * **The Median Regression Trap:** Generative models naturally regress toward the statistical median of their training data, flattening distinct idiolects, diluting dark/satirical tone, and prematurely resolving narrative tension ("closure bias").  
> * **The Deletion Principle & Ontological Triad:** If every neural network weight, prompt history, and generative model were permanently destroyed, the universe must remain completely reconstructible from its committed, human-authored ledger. The architecture enforces a four-tier partition:  
  * *Canon (The World):* Immutable laws, entity dossiers, and spatial topologies authored in Markdown/Git.  
  * *Events (What Happened):* An append-only, chronologically ordered, hash-chained transaction log (*E*1​,*E*2​,…,*EN*​) representing historical truth.  
  * *Materialized State (What Is True Now):* A fast, ephemeral projection derived via a pure reducer: State*N*​\=fold(apply*v*​,State0​,\[*E*1​,…,*EN*​\],*σ*).  
  * *Media Artifacts (Evidence of Representation):* Rendered diffusion plates, audio stems, and final MP4s stored in content-addressed storage (CAS). Media is a one-way projection that never mutates state.  
> * **Truth vs. Belief vs. Utterance:** Objective reality, subjective internal conviction, and spoken dialogue are strictly segregated: WorldTruth=InternalBelief=ExternalUtterance. Characters operate under **ignorance by omission**—information an actor does not know is physically scrubbed from prompt envelopes, preventing attention heads from leaking canonical secrets.  
> * **Epistemic Unresolved Canon Registry (unresolved.schema.ts):** Models open mysteries (e.g., the famine, the pantry watcher) as immutable contracts to prevent LLM closure bias. Mysteries can transition into historical facts only through an explicit, signed human commit.

### **2\. Narrative Engine & Simulation Architecture (worker-sower-engine)**

The narrative layer compiles dramatic conflict through explicit mathematical models before passing structured contracts to language models.

`CANON & DOSSIERS ──► SIMULATION (2d6 / Space) ──► DIALOGUE AST ──► TEMPORAL IR ──► REMOTION TSX`

> * **The Grievance Corpus & Dual-Rail Architecture:** Rather than allowing LLMs to improvise conflicts per scene, narrative friction is driven by 40–60 pre-authored, schema-validated grievances structured across two rails:  
  * *The Machine Rail (Frontmatter):* Participant arrays, intensity bounds \[Min,Max\], cooldowns, decay rates, and Directed Acyclic Graph (DAG) escalation spawns.  
  * *The Voice Rail (Body):* Decouples the *Surface Argument* (what the characters claim to fight over, e.g., grease on a silver spoon) from the *Underneath* (the existential wound/leverage). Prompts instruct the LLM to escalate the surface topic while strictly suppressing direct statements of the underlying wound.  
> * **Deterministic Conflict Resolution:** Mechanical duels use 2d6 dice rolls plus character attribute modifiers and String currency spends. Encounters resolve into four structured outcomes: clean\_win, costly\_win, mutual\_wound, and backfire (where a high numeric roll backfires socially due to exhausted leverage). The true difference distribution of two independent 2d6 sums yields ≈11.3% for margin 0, ≈21.6% for margin ±1, and ≈19.3% for margin ±2 (≈52.2% combined for margins 0–2).  
> * **Dwight Swain Motivation-Reaction Units (MRUs):** Scenes must respect psychological causality: Cause→Reflex→Processing→Decision→Action/Speech. When an AST beat flags a VISCERAL\_STING, the presentation compiler allocates a 12-to-24 frame visual reaction window before audio speech begins.  
> * **Canonical Machine Dialogue IR (dialogue\_ast.json):** Screenplays in .fountain format are human-facing projections; dialogue\_ast.json is the sole machine contract. It enforces verbatim phonetic parity against speech synthesis, contains hashed canonical state snapshots (*H*root​), and carries declared kinetic verbs.  
> * **The Somatic Invariant Linter:** Spoken prose and declared actions are validated via low-temperature extraction and dependency parsing. Proposing a two-handed action (HOLD\_ITEM\_DOUBLE) for a character with a severed arm immediately trips a *T*0​ invariant gate, terminating compilation at zero cost.

### **3\. Physical Causality, Geometry, & Spatial Mechanics (goblin-spatial)**

goblin-spatial was formally restructured from a stateful, networked edge service into a pure, stateless mathematical kernel.

> * **Possibility vs. Occurrence:** goblin-spatial determines what is physically possible (e.g., line-of-sight, acoustic attenuation, portal connectivity, path traversal costs); worker-sower-engine decides what actually occurs and writes the event to the ledger.  
> * **Mathematical Purity & Integer Discipline:** To prevent cross-platform floating-point drift, spatial operations use integer axial coordinates, centibel (cdB) signal levels, and integer movement budgets. Raycasting uses doubled-coordinate exact integer cross-products. Ambiguous line-of-sight checks resolve deterministically via HMAC-SHA256(seed,actorId,tick).  
> * **The Discriminated Mobility Union:** Actors exist strictly on a tactical lattice or on a regional transit edge, enforced via a type union (STAGED | IN\_TRANSIT), eliminating boundary transition bugs.  
> * **The Causal Progression Chain:** Physical state flows unidirectionally:  
>   Canonical Topology⟶Geometric Math⟶Simulation Ledger⟶Contact Graph⟶Percepts⟶Beliefs⟶Dialogue  
>   Spatial routines emit raw sensory *percepts* (bearing, signal-to-noise ratio), which the Sower passes through somatic filters (e.g., ear damage) before recording a subjective BeliefRecord.

### **4\. Media Compilation, Master Audio, & Viewport Architecture (goblin-viewport-template)**

The presentation layer acts as an offline compiler rather than a dynamic media player, resolving the **historical corruption trap** where updating shared presentation components silently alters past episodes.

`THE HISTORICAL CORRUPTION TRAP (LEGACY DYNAMIC MODEL)`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ Month 0:  Episode 012 rendered against Shared Viewport v1.0.0          │`  
`│           • Result: Frame 144 viseme aligned, crash zoom target exact. │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Month 6:  Shared Viewport refactored to v1.4.0 for Episode 040         │`  
`│           • Altered camera spring dampening curves in GoblinPuppet.tsx │`  
`│           • Refactored transform-origin logic for tall character rigs │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Re-render Episode 012 against Viewport v1.4.0                          │`  
`│           • SILENT REGRESSION: Visemes detach from chin baseline,      │`  
`│             camera zooms decapitate characters, timing rubber-bands.   │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Audio as the Architect of Time:** Speech stems are synthesized first; continuous acoustic duration (*D*ms​) measured via ffprobe serves as the non-negotiable master clock. Discrete video frames are derived via the integer ceiling formula:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉  
> * **The Source-Baking Pattern:** generator/generate-episode-repo.ts stamps out an isolated, self-contained workspace inside goblin-episodes/episode-XXX/. Timelines are written directly as static TypeScript JSX literals (Episode\_XXX.tsx) with unquoted numeric literals, precomputed absolute sequence offsets (fromFrame*k*​\=∑duration*i*​), and isolated camera wrapper scopes that reset useCurrentFrame() to 0 per shot.  
> * **Coordinate Space Normalization Math:** To prevent camera crash zooms from decapitating characters, local puppet coordinates (1024×1024) are projected onto master canvas space (1920×1080) at compile time, factoring in active scale (*s*):  
>   originXglobal​\=canvas.widthpuppet.x+(anchor.x×*s*)​×100%,originYglobal​\=canvas.heightpuppet.y+(anchor.y×*s*)​×100%  
> * **Asset Harvesting & Boundaries (collect-episode-assets.ts):** Scans the AST to copy only the referenced poses, visemes, and background plates into epXXX/public/assets/, cutting the asset footprint from tens of gigabytes to under 100MB. It enforces the **Zero-Byte Poison Trap**—rejecting any file matching empty hash e3b0c442.... Shared components (GoblinPuppet.tsx, CameraWrappers.tsx) are vendored locally or pinned to exact semver packages.  
> * **The Sealed-File Lifecycle State Machine:** Episode\_XXX.tsx carries a cryptographic header (@lifecycle: generated | patched | locked). Automated CI overwrites @generated files safely; diagnostic agents mark files @patched via ts-morph AST edits; manual adjustments by a human director trigger the **Showrunner Eject Button**, locking the file as @locked. Upstream re-runs refuse to clobber locked files, safely emitting Episode\_XXX.candidate.tsx and logging a DIRECTOR\_OVERRIDE event.  
> * **Physical Hardware Demarcation:**  
  * *Rig 1 (Host Orchestrator & Compositor):* Pure CPU and 64 GB system RAM. Runs the Conductor (produceEpisode.ts), local TTS (:8000), ffprobe, and Remotion CLI rendering via software OpenGL (--gl=swangle \--concurrency=1 \--offthreadvideo). Uses **0 GB VRAM**.  
  * *Rig 2 (GPU Foundry):* High-VRAM silicon (24 GB RTX) running headless ComfyUI (:8188). Executes heavy Wan 2.2 diffusion passes against greenscreen (\#00FF00) and issues POST /free to evict latent models before VRAM exhaustion. Zero Remotion runs and zero Chromium instances are permitted on Rig 2\.

### **5\. Verification, Progressive QA, & Provenance Architecture**

Quality assurance follows an economic rule: **fail as close as possible to the cheapest point of detection (*T*0​\=\$0.00)**.

`[ CONFIDENCE 0: Structural ] ──► JSON Schema valid, files present, non-empty hash check ($0.00)`  
              `│ Pass`  
              `▼`  
`[ CONFIDENCE 1: Physical ]   ──► ffprobe frame budgets match, audio noise floor < -60 dBFS`  
              `│ Pass`  
              `▼`  
`[ CONFIDENCE 2: Geometric ]  ──► Viseme drift < 4px, alpha spill < 12 inside 3px contour`  
              `│ Pass`  
              `▼`  
`[ CONFIDENCE 3: Semantic ]   ──► Capability-resource bounds pass, epistemic firewall intact`  
              `│ Pass`  
              `▼`  
`[ CONFIDENCE 4: Editorial ]  ──► Signed human director approval via GitHub Review API`

> * **Closed-Loop Visual QA & Defect Routing:** An adversarial diagnostic critic inspects rendered video along a kinematic volatility curve (*Vt*​). If mouth drift exceeds 4px, the router checks coordinate parity:  
  * *ASSET\_ERROR:* JSX matches manifest.json; the sprite/bounding box is flawed. Routed to the art team; code agents are barred from hardcoding offsets.  
  * *CODE\_ERROR:* JSX diverges from manifest. Jules executes surgical AST edits via ts-morph and verifies locally across an isolated 36-frame window on CPU in seconds.  
  * *Circuit Breaker:* A hard cap limits repairs to three cycles; diverging invariants trigger an immediate rollback and escalate to the Lead Architect.  
> * **The Reproducibility Ladder:** Container binary hashes (Level 5\) can diverge due to non-deterministic MP4 container metadata and FFmpeg timestamps. Therefore, **Level 3 Decoded Media Equivalence represents the formal engine exit gate**:  
>   SSIMmean​≥0.9999,Δ*E*max​\<0.1  
> * **The Terminal Provenance Lockfile (render\_manifest.json):** Freezes the episode build identity as an immutable cryptographic tuple:  
>   Build ID=H(Canon Root+State Snapshot+Dialogue AST+Asset Hashes+Container Digest+Toolchains)  
>   This manifest is injected directly into the delivered MP4 container using C2PA standards, creating an unbroken audit trail back to authorizing Git commits.

### **6\. The Meta-Architectural Reality: Discarded Speculation vs. The Validated Core**

Across multiple review iterations, the architecture distinguished load-bearing engineering mechanisms from unvalidated organizational complexity.

| Architectural Mechanism | Design Assessment | Final Operational Verdict |
| :---- | :---- | :---- |
| **23-Pod Production Organization** | Speculative bureaucracy masking production inertia. | **Discarded.** Replaced by a single Node.js Conductor loop and small focused creator roles. |
| **Networked SpatialBridge Microservice** | Added latency, async overhead, and network points of failure to hot simulation paths. | **Discarded.** Restructured as an in-process, pure TypeScript library (SpatialPort). |
| **CellDO Sharding & Edge Mitosis** | Prematurely imported from massive multiplayer MMO notebooks. | **Discarded.** Spatial hashing and interest management handle small turn-based casts without DO sharding. |
| **LLM Edge Stage Director** | Put non-deterministic LLM tool loops on the simulation query path. | **Discarded.** Prohibited; LLMs sit strictly outside the causal state boundary. |
| **Narrative Dependency Invalidation** | Modeled after software build systems (like Make or spreadsheets). | **Validated Core.** Flat tables of facts and scenes; changing an upstream fact flags downstream scenes as dirty (is\_dirty \= 1). |
| **Audio-Quantized Source-Baking** | Eliminated runtime interpretation drift and component rot. | **Validated Core.** Integer ceiling frame quantization burned directly into static Remotion TSX. |
| **Human Grievance Corpus** | Addressed the true bottleneck of automated narrative generation. | **Validated Core.** 40–60 pre-authored, stateful grievances provide the subtext and fuel that LLMs cannot synthesize from void. |

The ultimate system design resolves into an event-sourced narrative compiler: human authors establish canon and write the grievance corpus; deterministic simulation calculates conflict and physical state; speech synthesis establishes a locked master timebase; an offline compiler source-bakes static React compositions; and headless software rendering outputs verified, bit-identical video deliverables.

---

