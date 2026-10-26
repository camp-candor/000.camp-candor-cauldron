# **Overview: Goblin-Render-Pipeline.00**

[https://gemini.google.com/app/6364acdf017ca7e8](https://gemini.google.com/app/6364acdf017ca7e8)

*User prompt: we are starting working on the next repository \[ Goblin-Render-Pipeline \]; can you present me with a complete overview*

### **Response: Architectural Overview: goblin-render-pipeline**

goblin-render-pipeline (often referenced interchangeably with goblin-lora-training) resides under **Cluster 03.foundry/** as the dedicated heavy compute, neural synthesis, and model training engine.

In contrast to goblin-assets-visual (which acts strictly as a hardened vault for production-approved renders, background mattes, and coordinate manifests), goblin-render-pipeline houses the **stochastic, iterative, and GPU-intensive generative toolchains**. It possesses zero narrative authority and zero temporal clocking rights, acting as an untrusted spoke that transforms locked upstream constraints into raw visual plates and trained weights.

### **1\. System Role & Hardware Demarcation**

The repository is built around the strict physical hardware split between the Rig 1 orchestrator and the high-VRAM GPU foundry:

| Operational Vector | Rig 1 (worker-sower / goblin-viewport-template) | Rig 2 / Cloud Foundry (goblin-render-pipeline) |
| :---- | :---- | :---- |
| **Physical Hardware** | Multi-core CPU, 32–64 GB System RAM, **0 MB VRAM**. | NVIDIA GPU (≥16 GB to 24 GB VRAM, RTX 3090/4090/5070) or RunPod serverless. |
| **Operational Domain** | Narrative meaning, relational state, audio quantization, Remotion compositing. | Heavy diffusion sampling, character LoRA training, and synthetic plate generation. |
| **Workload Rhythms** | **Weekday Workload:** Lightweight simulation, CPU audio synthesis, and Remotion rendering over approved assets. | **Weekend / Burst Workload:** High-VRAM training passes, emotion candidate generation, and checkpoint baking. |
| **Process Quarantine** | POSIX child processes (ffprobe, remotion, git, software OpenGL \--gl=swangle). | Headless Python/ComfyUI daemons (:8188), media-broker (:3000), PyTorch/TensorRT inference. **Zero Chromium/Remotion allowed**. |

### **2\. Core Functional Pillars**

goblin-render-pipeline encompasses three operational domains:

#### **A. LoRA Training & Checkpoint Governance**

> * **Dataset Ingestion & Hygiene:** Curates raw reference photography, synthetic turnarounds, and character crops. Enforces strict color palette validation, caption structuring, and aspect ratio bucketing to prevent identity drift.  
> * **Training Recipes:** Contains container recipes, hyperparameter scripts, and execution manifests for character, fashion, and emotion LoRAs.  
> * **Multi-LoRA Composition:** Prepares LoRA adapters configured to stack simultaneously at inference time (e.g., character identity \+ outfit/condition \+ emotional state).  
> * **Active Checkpoint Resolution:** Tracks trained model versions via active\_checkpoint.json per character, providing explicit provenance pointers that feed into goblin-assets-visual's trained\_from\_lora metadata.

#### **B. The Headless ComfyUI Generative Workflows**

> * **Modular API Graphs:** Stores headless API workflow graphs (JSON) for ComfyUI:  
  * *Text AST / Grammar Passes:* Structured prompt expansion via local LLM GGUFs (e.g., Qwen 2.5).  
  * *Video Latent Diffusion:* Video generation graphs (such as Wan 2.2) executing discrete latent sampling.  
> * **Hardware Adaptation:** Encapsulates model-specific causal lattice constraints (such as Wan's 4*n*\+1 frame requirement) inside adapters so downstream 24 fps timeline budgets remain mathematically aligned.

#### **C. The Isolated Greenscreen (\#00FF00) VFX Pipeline**

> * **The Silhouette Paradigm:** To eliminate the "melting world" failure mode—where diffusion models warp backgrounds across frames—the generative models are forced to render characters exclusively against an unlit, flat \#00FF00 neon green void.  
> * **Separation of Attention:** 100% of latent diffusion attention is dedicated to character anatomy, silhouette integrity, costume details, and facial expression.  
> * **Downstream Delivery:** The resulting raw plates are uploaded to Cloudflare R2 as cleanly keyed proxies for ingestion by goblin-viewport-template on Rig 1, where they are keyed over static matte art.

### **3\. Execution Topology & Ingress/Egress Boundaries**

       `Rig 1 (Orchestrator)                  Cloudflare Edge (POD-12)`  
 `┌───────────────────────────────┐        ┌───────────────────────────────┐`  
 `│ worker-sower-conductor        │        │ edge-director                 │`  
 `│ • Locked AST & target_frames  │ ──WSS─►│ • FIFO Mutex (Single GPU Lock)│`  
 `│ • SpokeExecutionPayload       │        │ • 30s Heartbeat Leases        │`  
 `└───────────────────────────────┘        └──────────────┬────────────────┘`  
                                                         `│ Outbound Tunnel`  
                                                         `▼`  
 `┌────────────────────────────────────────────────────────────────────────┐`  
 `│ RIG 2 / RUNPOD: goblin-render-pipeline / media-broker                  │`  
 `├────────────────────────────────────────────────────────────────────────┤`  
 `│ 1. Hardware Mutex: flock(/var/lock/rig2_gpu.lock)                      │`  
 `│ 2. Ingress: Hydrate LoRAs & checkpoints from R2 via s5cmd              │`  
 `│ 3. Sequential Execution (Headless ComfyUI :8188):                      │`  
 `│    • Turn 1: Wan 2.2 Character Latent Diffusion                        │`  
 `│    • Turn 2: Memory Eviction via POST /free                            │`  
 `│    • Turn 3: 25-Shot Monotonic Process Recycling Governor              │`  
 `│ 4. Output: Render isolated #00FF00 MP4 character plate                 │`  
 `│ 5. Egress: Upload MP4 to Cloudflare R2 ($0.00 egress)                  │`  
 `└────────────────────────────────────────────────────────────────────────┘`

> 1. **Ingress Contract (SpokeExecutionPayload):** Ingests an immutable execution payload containing sceneId, targetFrames (quantized via ffprobe on Rig 1), seeds, positive/negative prompts, and required LoRA tags.  
> 2. **GPU Mutex & Process Recycling:** Execution on Rig 2 is guarded by an OS-level file lock (flock) to prevent multiple jobs from colliding in VRAM. To combat PyTorch virtual allocator fragmentation, memory is flushed via POST /free between stages, and the headless daemon is recycled cleanly every 25 shots.  
> 3. **Egress Contract:** Completed \#00FF00 character plates and checkpoint binaries are pushed to Cloudflare R2 with SHA-256 binary digests, returning an immutable asset URL to the conductor.

### **4\. Repository Anatomy & Key Deliverables**

When scaffolding goblin-render-pipeline, the structure organizes around training, ComfyUI workflows, and deployment handlers:

`goblin-render-pipeline/`  
`├── workflows/                     # Exported Headless ComfyUI API JSONs`  
`│   ├── wan2.2_greenscreen.json    # Character diffusion against #00FF00`  
`│   └── lora_validation.json       # Automated multi-angle testing harnesses`  
`├── training/                      # LoRA training scripts & hyperparameter configs`  
`│   ├── dataset_prep/              # Cropping, tagging, and color audit tools`  
`│   ├── configs/                   # Character/fashion Kohya / ai-toolkit configs`  
`│   └── active_checkpoints.json    # Canonical map of character -> LoRA version`  
`├── cloud/                         # Cloud burst & serverless dispatch`  
`│   ├── Dockerfile                 # GHCR GPU container recipe (CUDA, PyTorch)`  
`│   ├── handler.py                 # RunPod / Modal serverless worker entrypoint`  
`│   └── sync_weights.sh            # High-speed weight hydration via s5cmd`  
`├── scripts/`  
`│   ├── local_broker.ts            # media-broker glue listening to edge-director`  
`│   └── test_vram_limits.py        # Baseline allocation & fragmentation probes`  
`└── README.md                      # Operational guide (hardware specs, 5070 vs 2060 rules)`

### **Recommended Immediate First Step**

Establish the **ComfyUI API execution graph and the SpokeExecutionPayload Zod schema**, locking down the parameter inputs (prompt, seed, target frames, LoRA tags) required to generate a \#00FF00 plate deterministically.

---

*User prompt: {{FOCUS:  A. LoRA Training & Checkpoint Governance }} /extreme-details*

### **Response: LoRA Training Systems & Checkpoint Governance**

goblin-render-pipeline (operating in conjunction with goblin-lora-training under Cluster 03.foundry/) houses the heavy compute, iterative neural training, and checkpoint lifecycle infrastructure. Because diffusion adapters cannot be regenerated bit-for-bit from mathematical seeds alone due to non-deterministic CUDA execution and floating-point drift, model training and checkpoint releases are managed under strict, auditable governance.

### **1\. Repository Topology & The Reference State Machine**

To protect downstream production environments (goblin-assets-visual, goblin-viewport-template) from multi-gigabyte bloat, raw training artifacts are quarantined behind an immutable three-stage reference lifecycle:

`goblin-lora-training/`  
`├── /character`  
`│   └── /<character-id>/                  # e.g., /bog`  
`│       ├── /references`  
`│       │   ├── /raw                      # Ingestion buffer (3D rips, concept art, sketches)`  
`│       │   │   ├── raw_001.png`  
`│       │   │   └── source_log.json       # Ingestion provenance, base models, licensing`  
`│       │   ├── /curated                  # Verified training ground truth`  
`│       │   │   ├── curated_001.png`  
`│       │   │   └── curation_manifest.json`  
`│       │   └── /rejected                 # Preserved negative exemplars`  
`│       │       └── rejected_log.json     # Tagged failure taxonomy (e.g., identity_drift)`  
`│       ├── /training_runs`  
`│       │   ├── /v1                       # Frozen run configs, logs, adapter binaries`  
`│       │   │   ├── training_config.json`  
`│       │   │   ├── <char>_lora_v1.safetensors`  
`│       │   │   └── sample_outputs/`  
`│       │   └── /v2/`  
`│       └── active_checkpoint.json        # Floating pointer consumed by runtime workers`  
`├── /schemas`  
`│   └── lora-manifest.schema.ts           # Strict Zod validation contracts for curation ledgers`  
`└── LORA_TYPES.md                         # Operational rules across adapter classes`

#### **The Tri-Stage Reference State Machine**

> 1. **/references/raw/ (Ingestion Buffer):** Raw concept art exports, artist turnarounds, or 3D viewport screengrabs. Every asset requires an entry in source\_log.json detailing model seeds, base checkpoint versions, or third-party licensing notes to eliminate copyright and attribution liability at the root.  
> 2. **/references/curated/ (Active Set):** The verified ground truth. Assets are cropped across standardized multi-resolution buckets (512, 768, 1024), color-audited against the 155-color master palette (master\_palette.json), and bound to caption tokens.  
> 3. **/references/rejected/ (Negative Contrast Buffer):** Excluded candidate files are **never deleted**. Every discard is cataloged in rejected\_log.json with structured failure categories (SEMANTIC\_FAILURE, DISTINCTNESS\_COLLISION, PHYSICAL\_DEFECT, identity\_drift, motion\_jitter). Retaining these failure exemplars provides negative guidance contrast to counteract algorithmic bias and Model Autophagy Disorder (MAD).

### **2\. Multi-Dimensional Curation Taxonomy (curation\_manifest.json)**

To prevent the LoRA from flattening three-dimensional structure or over-indexing on a single neutral pose, curation\_manifest.json tracks every reference image across four orthogonal axes:

`{`  
  `"dataset_version": "2.1.0",`  
  `"character_id": "bog",`  
  `"base_checkpoint": "sdxl-1.0",`  
  `"palette_enforcement_profile": "master_palette_155.json",`  
  `"total_curated_images": 48,`  
  `"curated_references": [`  
    `{`  
      `"file_id": "curated_014.png",`  
      `"sha256": "8a3f4e2b01c9...",`  
      `"camera_angle": "three_quarter_low_angle",`  
      `"shot_framing": "medium_close_up",`  
      `"somatic_pose": "idle_slouch",`  
      `"primary_emotion": "humiliated",`  
      `"emotion_variant": "interrupted_control",`  
      `"lighting_profile": "harsh_underwater_sodium_lamp",`  
      `"palette_verified": true,`  
      `"caption_tokens": [`  
        `"bog_goblin",`  
        `"male",`  
        `"three-quarter angle",`  
        `"low angle",`  
        `"medium close-up",`  
        `"tattered pantry apron",`  
        `"humiliated expression",`  
        `"clenched jaw",`  
        `"harsh sodium lighting"`  
      `]`  
    `}`  
  `]`  
`}`

> * **Camera Angle (Orientation):** profile\_left, profile\_right, three\_quarter\_left, three\_quarter\_right, frontal, high\_angle\_down, low\_angle\_up.  
> * **Framing Scale:** extreme\_close\_up (viseme/facial texture), close\_up (expression baseline), medium\_shot (gesture and arm mechanics), and full\_body (locomotion and proportion balance).  
> * **Somatic Posture & Gesture:** Bound to physical baselines (e.g., idle\_slouch, clutching\_siphon, hands\_pinned\_to\_ribs).  
> * **Emotional State & Tone:** Mapped directly to the upstream condition taxonomy in world/conditions.md (humiliated, smug, terrified, exposed).

### **3\. Captioning Architecture & Token Binding Mechanics**

How reference images are captioned determines whether traits become permanently fused to character identity or remain dynamically controllable at inference:

                  `THE INVARIANCE CAPTIONING PRINCIPLE`  
                    
   `┌────────────────────────────────────────────────────────┐`  
   `│                  TRAINING IMAGE INPUT                  │`  
   `│  • Character: Bog (distinct jaw, bald head, ear scar)  │`  
   `│  • Costume: Tattered pantry apron                      │`  
   `│  • Prop: The Good Silver Spoon                         │`  
   `│  • Lighting: Deep blue ambient shadow                  │`  
   `└───────────────────────────┬────────────────────────────┘`  
                               `│`  
                `What gets captioned vs. omitted?`  
                               `│`  
            `┌──────────────────┴──────────────────┐`  
            `▼ OMIT FROM CAPTION                   ▼ EXPLICITLY CAPTION`  
   `[ Identity & Anatomy ]                [ Mutable Context & Wearables ]`  
   `• Facial bone structure               • "tattered pantry apron"`  
   `• Skin tone and ear notch             • "holding silver spoon"`  
   `• Eye placement and size              • "deep blue shadow"`  
            `│                                     │`  
            `▼                                     ▼`  
   `Model permanently binds               Model decouples these features`  
   `these traits to trigger token:        from the trigger token, allowing`  
   `bog_goblin                            them to be swapped at inference`

> * **The Invariance Principle:**  
  * **Omitted from Captions:** Permanent anatomical traits (bone structure, ear notches, scars, baseline skin texture) must be omitted. The diffusion optimizer binds these uncaptioned permanent traits directly to the trigger token (bog\_goblin).  
  * **Explicitly Captioned:** Removable wardrobe, held props, background environments, and lighting angles are exhaustively captioned. This decouples them from the character trigger token, allowing them to be swapped at inference time via prompt directives.  
> * **Caption Dropout Regularization:** Training configs enforce a 5% caption dropout (caption\_dropout \= 0.05). During 5% of training steps, captions are dropped completely, forcing the model to reconstruct the entire scene from the base trigger token alone, reinforcing overall character identity cohesion.

### **4\. Classification Taxonomy of LoRA Types (LORA\_TYPES.md)**

Adapters are strictly typed to prevent applying incorrect QC metrics across heterogeneous generative domains:

| LoRA Type | Consistency Bar | Scope & Training Rigor | Usage Mechanics |
| :---- | :---- | :---- | :---- |
| **character** | **Highest** | Full emotion bank references, multi-angle coverage, 155-color palette lock. Matches canonical character\_id. | Permanent visual identity. Uses character trigger token (e.g., bog\_goblin). |
| **fashion** | **Moderate** | Specific worn items or outfit variants (e.g., tattered\_pantry\_apron). | Stacked on top of character LoRAs. Minor visual drift is acceptable as it is a modifier, not an identity. |
| **object** | **High Identity / Low Expression** | Narrative props (e.g., "The Good Silver Spoon", recurring letters). | Ensures audience recognizes the identical item across scenes; does not require emotional/pose range. |
| **mood** | **Broad / Low Specificity** | Atmospheric style, lighting profiles, and Paranoia Clock visual states (e.g., blue-tint fear treatments). | Biases overall palette and texture; applies across disparate characters and environments. |

### **5\. Automated Pre-Training Coverage Gates & Gap Analysis**

Before any compute is dispatched, validate-references.ts executes automated static audits against manifest.json and the target character's emotion taxonomy:

> * **Dimensional Density Gates:** Mandates ≥5 reference samples per target emotion across at least 3 distinct camera elevations.  
> * **Coverage Gap Detection:** If an emotion lacks necessary reference assets, validate-references.ts writes to coverage\_summary.emotions\_missing and blocks training configuration generation in CI/CD PR checks:  
>   `> ⚠️ Training Blocked: Cannot compile training config for bog_lora_v2.`  
>   `> Missing required visual ground truth for conditions: ['terrified', 'exhausted'].`

> * **Perceptual Deduplication:** Computes perceptual hashes (pHash) and feature distance embeddings. Any candidate take exhibiting \>0.85 cosine similarity against the existing dataset is pruned to prevent overfitting on identical frames.  
> * **The Anti-Autophagy Ratio (60/40 Rule):** Recursive training on unanchored synthetic outputs causes Model Autophagy Disorder (MAD), producing variance collapse, plastic skin textures, and anatomical hallucinations. Every curated dataset must maintain **at least 60% human-authored ground truth** (drawings, manual turnarounds, 3D viewport renders) and **no more than 40% synthetic diffusion outputs**.

### **6\. Automated Distillation, Shadow Canaries, and Gates 4 & 5**

When goblin-render-pipeline utilizes production exhaust to retrain candidate adapters, it enforces a two-tier evaluation gauntlet:

`Active Generative Passes (ComfyUI / RunPod)`  
                     `│`  
                     `▼`  
       `Cascaded Verifier Funnel`  
                     `│`  
         `┌───────────┴───────────┐`  
         `▼ S >= 0.92             ▼ Severe Failure`  
   `/staging/ Bucket      Negative Exemplar Buffer (identity_drift, etc.)`  
         `│`  
         `▼`  
`Uncertainty-Weighted Active Sampling (Video-LLM: 3 passes @ T=0.7)`  
         `│`  
         `├── High Variance / Borderline (0.91 <= S <= 0.93)`  
         `│   └──► [HUMAN GATE 4: Spot-Check Queue]`  
         `│`  
         `└── High Confidence / Unanimous Pass`  
             `└──► Admitted to /golden/ Dataset`  
                      `│ (Accumulates 200–250 verified pairs)`  
                      `▼`  
             `Automated Serverless Training (Kohya-ss / PEFT; 60/40 Anchor)`  
                      `│`  
                      `▼`  
             `Headless Shadow Canary Suite (100 runs against baseline benchmark)`  
                      `│`  
                      `▼ Deterministic Hard Gates Hold (Failure Spike <= 10%)`  
             `[HUMAN GATE 5: LoRA Promotion Sign-off]`  
                      `│ (Cryptographic GitHub PR Review Signature)`  
                      `▼`  
             `ComfyUI Hot-Reload via API (Network Volume)`

> 1. **Uncertainty-Weighted Active Sampling (Human Gate 4):** Frames clearing automated scoring (*S*≥0.92) pass to a staging bucket. A multimodal Video-LLM evaluates candidates across 3 passes at *T*\=0.7 with permuted frame orders. High-variance or borderline takes (0.91≤*S*≤0.93) divert to the human supervisor's queue, while unanimous passes advance to /golden/.  
> 2. **Automated Serverless Training:** Once /golden/ accumulates 200–250 verified pairs, an automated serverless job trains a candidate adapter preserving the 60/40 anchor-to-synthetic ratio.  
> 3. **Headless Shadow Canary Suite:** The candidate adapter executes 100 headless shadow canary runs alongside production traffic against a locked baseline benchmark. If its deterministic hard-gate failure rate spikes \>10% compared to baseline, promotion aborts and the weights are quarantined.  
> 4. **Human Gate 5 Promotion:** If shadow metrics remain stable, an A/B matrix is surfaced to the Art Director. Deployment requires an authenticated GitHub PR approval under branch protection. CI reads the reviewer identity directly from the GitHub API, signing the release and hot-reloading the .safetensors binary into the shared ComfyUI storage volume without instance restarts.

### **7\. Provenance Tracking & Downstream Ingestion Contracts**

Checkpoints maintain a decoupled relationship between training history and production rendering:

#### **Canonical Pointer (active\_checkpoint.json)**

Located at the root of each character's training directory, this pointer informs runtime workers which adapter version is active:

`{`  
  `"lora_id": "bog_character",`  
  `"type": "character",`  
  `"linked_entity": "bog",`  
  `"active_checkpoint": "training_runs/v2/bog_lora_v2.safetensors",`  
  `"active_checkpoint_hash": "sha256:4a8c9e2b10a56789abcdef0123456789...",`  
  `"base_model": "sdxl-1.0",`  
  `"trained_at": "2026-08-17",`  
  `"trained_on_hardware": "rtx_5070_weekend_session",`  
  `"palette_lock_ref": "goblin-assets-visual/palette/master_palette.json",`  
  `"consistency_qc_status": "passed",`  
  `"consistency_qc_report": "training_runs/v2/qc_report.json"`  
`}`

#### **Upstream & Downstream Integration Contracts**

> * **goblin-bible:** Character and location dossiers specify valid adapter compositions (e.g., applicable\_loras: \["bog\_character", "tattered\_pantry\_apron"\]).  
> * **goblin-assets-visual:** Character manifests include a trained\_from\_lora field pointing back to the specific version in goblin-lora-training that produced currently approved renders.  
> * **Episode Freeze (render\_manifest.json):** Because active\_checkpoint.json is a floating pointer, render\_manifest.json resolves and seals the explicit cryptographic binary hash (active\_checkpoint\_hash) into the terminal DAG lockfile:  
>   Build ID=H(Canon Root+Dialogue AST+Asset Hashes+LoRA Weights SHA-256+Toolchains)  
>   This guarantees that future retrainings (e.g., releasing v3) cannot retroactively invalidate the reproducible build chain of prior broadcast episodes.

---

*User prompt: {{FOCUS:  B. The Headless ComfyUI Generative Workflows }} /extreme-details*

### **Response: Headless ComfyUI Generative Workflows**

In goblin-render-pipeline, ComfyUI is not operated as an interactive node canvas. It functions strictly as a **headless, programmatic tensor execution runtime** executing Directed Acyclic Graphs (DAGs) over PyTorch. Upstream orchestrators (worker-sower-conductor or media-broker) interact with ComfyUI as a blind compute worker, dispatching mathematically compiled JSON execution graphs over local REST and WebSocket interfaces.

### **1\. Headless DAG Topology & The AST Paradigm**

Standard visual workflows bundle presentation data (canvas zoom, grid positions, color palettes, wire routes). Exporting a workflow via **"Save (API Format)"** strips all UI metadata, leaving a flat, addressable topological schema:

`{`  
  `"3": {`  
    `"class_type": "KSampler",`  
    `"inputs": {`  
      `"seed": 84920411,`  
      `"steps": 30,`  
      `"cfg": 6.0,`  
      `"sampler_name": "euler_ancestral",`  
      `"scheduler": "normal",`  
      `"denoise": 1.0,`  
      `"model": ["4", 0],`  
      `"positive": ["6", 0],`  
      `"negative": ["7", 0],`  
      `"latent_image": ["37", 0]`  
    `}`  
  `}`  
`}`

> * **Node Registry Mapping:** Every processing node is keyed by an arbitrary string identifier (e.g., "3", "6", "37") mapped to its underlying Python class (class\_type).  
> * **Dependency Edge Tuples:** Inter-node data connections are strictly declared as two-element arrays: \["\<source\_node\_id\>", \<output\_index\>\]. Primitive properties (seeds, dimensions, steps, literals) are declared directly in the inputs map.  
> * **Stateless Memory Profile:** Headless ComfyUI boots into an empty runtime state. It does not store pre-loaded recipes; it deserializes the graph JSON received in the HTTP request body, resolves dependencies, and maps tensors directly into CUDA streams.

### **2\. In-Memory Graph Hydration vs. Dynamic AST Synthesis**

The pipeline operates across two execution compilation tiers:

               `NARRATIVE DIRECTIVES (dialogue_ast.json)`  
                                   `│`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                      GRAPH COMPILER ENGINE                             │`  
`│                                                                        │`  
`│  1. Ingest SpokeExecutionPayload (targetFrames, seeds, prompts)        │`  
`│  2. Allocate Monotonic Node ID Registry (Collision-free O(1) builder)  │`  
`│  3. Directive-Driven Subgraph Injection:                               │`  
`│     • Chained LoRA Loaders + Regional Masks (for multi-character)      │`  
`│     • ControlNet OpenPose/Depth blocks (for kinetic choreography)      │`  
`│  4. Causal Temporal Quantization: Enforce (4n + 1) frame lattice       │`  
`│  5. Transpilation Target: Rig 2 (GGUF + /free) vs. RunPod (FP16 batch) │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Emits workflow_api.json`  
                                   `▼`  
                   `POST http://127.0.0.1:8188/prompt`

#### **A. Level 1: Static Template Ingestion & Hydration**

For standard single-character shots, media-broker maintains allowlisted baseline API templates on local NVMe:

> * wan\_greenscreen\_plate.json: Configured for temporal video diffusion on a pure \#00FF00 chroma-key void.  
> * flux\_matte\_background.json: Static, high-resolution environmental background plate generation.  
> * latent\_inpaint\_repair.json: Targeted frame-window masked inpainting.

The broker loads the template from disk into memory, navigates the JSON tree, directly mutates input fields, and posts the hydrated payload to /prompt:

`// Blind parameter injection into memory-hydrated template`  
``workflow["6"].inputs.text = `${payload.positivePrompt}, isolated on solid vivid green screen background, chroma key #00FF00, flat high-key studio lighting, crisp silhouettes`;``  
`workflow["37"].inputs.length = payload.targetFrames; // Injected discrete temporal budget`  
`workflow["3"].inputs.seed = payload.seed;             // Locked PRNG seed`  
`workflow["14"].inputs.lora_name = payload.loraTag;   // Resolved LoRA filename`

#### **B. Level 2: Dynamic AST Graph Compilation**

To prevent a combinatorial explosion of static templates (e.g., wan\_dual\_lora\_depth\_inpaint.json), complex cinematic passes are compiled on the fly as an Abstract Syntax Tree (AST):

> * **Monotonic Node ID Allocation:** Splicing distinct subgraphs together frequently causes ID collisions. The compiler utilizes an internal monotonic counter, issuing guaranteed unique IDs in *O*(1) time:  
>   `class ComfyGraphBuilder {`  
>     `private currentId = 1;`  
>     `public nodes: Record<string, { class_type: string; inputs: Record<string, any> }> = {};`

>     `allocateNode(nodeClass: string, inputs: Record<string, any>): string {`  
>       `const id = (this.currentId++).toString();`  
>       `this.nodes[id] = { class_type: nodeClass, inputs };`  
>       `return id;`  
>     `}`  
>   `}`

> * **Regional Conditioning Subgraphs:** If the scene calls for two characters interacting (e.g., Bog and Spleen), a single prompt causes identity bleeding. The compiler injects dual LoRA loaders and spatial conditioning masks (RegionalConditioningByMask), bounding each character's weights strictly to their screen-space quadrant.  
> * **Temporal Causal Lattice (4*n*\+1 Math):** Spatio-temporal video diffusion models (Wan 2.2, HunyuanVideo) downsample time across a 3D causal VAE lattice (4× temporal downsampling). The compiler enforces this sequence (17,33,49,65,81), calculating the exact tensor allocation:  
>   diffusion\_frames=4×⌊4⌈(duration\_ms/1000)×24⌉​⌋\+1  
>   This discrete integer is bound directly to EmptyWanLatentVideo.length.

### **3\. Compile-Time Typing & Static Graph Linting (*T*0​)**

ComfyUI treats edges as broad strings (LATENT, IMAGE, MODEL). It cannot detect structural latent family mismatches (such as routing a 4-channel SDXL latent into a 16-channel Wan 2.2 DiT sampler), leading to unhandled CUDA memory aborts.

Before any GPU memory is committed, the compiler executes a static validation pass at *T*0​:

| Latent Family | Channel Depth | Spatial/Temporal Downsampling | Target Decoder Class |
| :---- | :---- | :---- | :---- |
| **SDXL** | 4 channels | 8× spatial | VAEDecode |
| **Flux.1** | 16 channels | 8× spatial | FluxVAEDecode |
| **Wan 2.2 / 2.1** | 16 channels | 8× spatial×4× temporal | WanVideoDecode |
| **HunyuanVideo** | 16 channels | 8× spatial×4× temporal | HunyuanVideoDecode |

> * **Introspected Node Registry (/object\_info):** Rather than hardcoding node signatures, the container build queries /object\_info at startup. The compiler checks all proposed edges against node\_registry.json to verify input names, socket types, and output indices.  
> * **Acyclicity & Dead Node Sweeping:** Validates that the directed graph is fully acyclic via Tarjan's or Kahn's algorithm, and confirms that all terminal output nodes connect back to valid root model loaders.

### **4\. VRAM Lifecycle Governance: The Anti-Ollama Paradigm**

Hosting concurrent runtimes (e.g., running an Ollama or vLLM server on port 11434 alongside ComfyUI on port 8188\) causes fatal memory collisions. Ollama caches weights across a 5-minute keep-alive window, and ComfyUI's dynamic memory allocator cannot inspect or evict tensors held by an external OS process. When video diffusion latents are allocated, PyTorch crashes instantly with a CUDA Out-of-Memory exception.

All execution on Rig 2 is unified strictly under **ComfyUI’s native Directed Acyclic Graph** using ComfyUI-GGUF. Memory lifecycle governance enforces three execution turns:

`TURN 1: Child Graph A (Qwen 2.5 14B GGUF ~10 GB)`  
        `│`  
        `▼ (Generates dialogue_ast.json)`  
`POST http://127.0.0.1:8188/free {"unload_models": true, "free_memory": true}`  
        `│`  
        `▼ (nvidia-smi Polling Gate: Assert >21 GB VRAM Available)`  
`TURN 2: Child Graph B (Local TTS Microservice / Node ~5 GB)`  
        `│`  
        `▼ (Synthesizes .wav stems; locks target_frames)`  
`POST http://127.0.0.1:8188/free {"unload_models": true, "free_memory": true}`  
        `│`  
        `▼ (nvidia-smi Polling Gate: Assert >21 GB VRAM Available)`  
`TURN 3: Child Graph C (Wan 2.2 + Character LoRAs ~21 GB)`  
        `│`  
        `▼ (Samples uncompressed #00FF00 character plate)`  
`Clean baseline restored (Process Recycling every 25 shots)`

#### **Eviction Dynamics & Polling Gates**

> 1. **Turn-Based Eviction (POST /free):** At the completion of each modal pass, the broker issues an eviction call:  
>    `await fetch("http://127.0.0.1:8188/free", {`  
>      `method: "POST",`  
>      `headers: { "Content-Type": "application/json" },`  
>      `body: JSON.stringify({ unload_models: true, free_memory: true })`  
>    `});`

This unbinds active model pointers and instructs PyTorch's caching allocator to release its reserved CUDA memory blocks, returning VRAM to baseline within approximately 300 ms. 2\. **The Asynchronous /free Hazard:** ComfyUI returns HTTP 200 OK asynchronously while tensor unmapping is still running on a background thread. Dispatching the next stage immediately results in an allocation overlap crash. The broker polls nvidia-smi directly:

`nvidia-smi --query-gpu=memory.free --format=csv,noheader,nounits`

It halts execution until free VRAM returns to within Δ≤500 MB of the machine's calibrated boot baseline (\>21 GB available on a 24 GB card). 3\. **Stage-Level Batching:** Naively alternating Text → TTS → Video per shot introduces severe PCIe bus thrashing (swapping 33+ GB across PCIe lanes burns 45–90 seconds per shot). The broker groups passes by stage across an entire scene: compile all text ASTs, synthesize all audio stems, then hydrate Wan 2.2 once to render all character plates back-to-back. 4\. **The 25-Shot Process Recycling Governor:** Continuous execution of high-dimensional 5D spatio-temporal video latents (\[*B*,*C*,*T*,*H*,*W*\]) induces driver-level virtual memory fragmentation. To clear unmapped CUDA contexts, the broker gracefully recycles the headless ComfyUI daemon every 25 shots or at major sequence boundaries.

### **5\. Loopback REST Dispatch, WebSockets, & Sentinel Tapping**

Execution communication between the local media-broker (port 3000\) and the headless ComfyUI daemon (port 8188\) is managed through standard loopback primitives:

 `Rig 2: media-broker (:3000)                Headless ComfyUI (:8188)        edge-director DO`  
             `│                                        │                           │`  
             `├─ Connects ws://127.0.0.1:8188/ws ─────►│                           │`  
             `│  (Taps socket BEFORE dispatch)         │                           │`  
             `│                                        │                           │`  
             `├─ POST /prompt { hydrated_graph } ─────►│                           │`  
             `│                                        ├─ Begins Sampling Pass     │`  
             `│                                        │                           │`  
             `│◄── execution_start ────────────────────┤                           │`  
             `│◄── executing (node: "37") ─────────────┤                           │`  
             `│◄── progress (value: 25, max: 50) ──────┤                           │`  
             `│                                        │                           │`  
             `├─ Normalizes to BROKER_PROGRESS ───────────────────────────────────►│ (Broadcasts to UI)`  
             `│                                        │                           │`  
             `│  [ Thread-Isolated Background Loop ]   │                           │`  
             `├─ Emits BROKER_HEARTBEAT (every 10s) ──────────────────────────────►│ (Resets 30s alarm)`  
             `│                                        │                           │`  
             `│◄── executing (node: null) [SENTINEL] ──┤                           │`  
             `│                                        ├─ MP4 written to disk      │`  
             `│                                        │                           │`  
             `├─ Intercepts Completion Sentinel        │                           │`  
             `├─ Audits local MP4 scratch file         │                           │`  
             `└─ Streams artifact to Cloudflare R2     │                           │`

> * **Pre-Dispatch Socket Tapping:** The broker establishes its WebSocket client to ws://127.0.0.1:8188/ws?clientId=\${clientId} *before* dispatching POST /prompt, preventing dropped initialization events (e.g., prompt parsing, CLIP encoding).  
> * **Binary Preview Filtering:** ComfyUI streams intermediate latent preview updates as raw binary packets over its WebSocket bus. The telemetry bridge inspects the initial byte headers, discarding raw image streams to avoid corrupting text-based JSON parsers.  
> * **Completion Sentinel Interception:** When generation concludes, ComfyUI emits the terminal sentinel { "executing": { "node": null } }. The broker catches this event, reads the rendered .mp4 from ComfyUI/output/, verifies its SHA-256 hash against empty-file constants (e3b0c442...b855), and streams the binary to Cloudflare R2.

---

*User prompt: {{FOCUS:  C. The Isolated Greenscreen (\#00FF00) VFX Pipeline }} /extreme-details*

### **Response: The Isolated Greenscreen (\#00FF00) VFX Pipeline**

The isolated greenscreen VFX pipeline exists to solve the **spatial-temporal collapse** inherent in generative video diffusion models. When models (such as Wan 2.2 or HunyuanVideo) are tasked with concurrently rendering characters, complex kinematic motion, and intricate background geometry, attention tensors cross-contaminate. This produces the classic "melting world" failure mode: static backgrounds boil and warp across cuts, characters blend into set furniture, and spatial perspective drifts.

goblin-render-pipeline strips environmental complexity away from the neural network entirely. Diffusion compute is constrained to a pure character silhouette isolated against an unlit \#00FF00 neon green void, delegating environmental placement, perspective stability, and optical integration to deterministic downstream software engines.

                  `THE GREENSCREEN SEPARATION ARCHITECTURE`  
                    
  `STOCHASTIC FOUNDRY (Rig 2 / RunPod)         DETERMINISTIC COMPOSITOR (Rig 1)`  
`┌─────────────────────────────────────┐    ┌───────────────────────────────────┐`  
`│ Child Graph C: Wan 2.2 Diffusion    │    │ Layer 1: Bespoke Matte Background │`  
`│ • Character LoRA + Emotion Weights  │    │ • Static 2048x1152 16-bit plate   │`  
`│ • Locked frame budget: target_frames│    │ • Affine matrix camera transforms │`  
`│ • Pure #00FF00 green void           │    └─────────────────┬─────────────────┘`  
`└──────────────────┬──────────────────┘                      │`  
                   `│                                         ▼`  
                   `▼                       ┌───────────────────────────────────┐`  
`┌─────────────────────────────────────┐    │ Layer 2: Practical Atmosphere     │`  
`│ In-Engine Neural Matting            │    │ • Screen-blended fog/rain loops   │`  
`│ • BiRefNet / RVM Alpha Extraction   │    │ • Zero-Diffusion SVG text / HUDs  │`  
`│ • Temporal Alpha Deflicker Pass     │    └─────────────────┬─────────────────┘`  
`└──────────────────┬──────────────────┘                      │`  
                   `│                                         ▼`  
                   `▼                       ┌───────────────────────────────────┐`  
`┌─────────────────────────────────────┐    │ Layer 3: Keyed Character Ingestion│`  
`│ Egress Packaging & R2 Hydration     │───►│ • Pre-extracted WebM VP9 / Despill│`  
`│ • Raw #00FF00 MP4 Master            │    │ • Directional Ambient Light-Wrap  │`  
`│ • 8-bit Alpha WebM VP9 (with alpha) │    │ • Dynamic Ground Contact Shadows  │`  
`│ • Empty-hash check (e3b0c442...b855)│    └─────────────────┬─────────────────┘`  
`└─────────────────────────────────────┘                      │`  
                                                             `▼`  
                                           `┌───────────────────────────────────┐`  
                                           `│ Layer 4: Global Optical Mastering │`  
                                           `│ • Unified 3D .cube LUT / Grain    │`  
                                           `└───────────────────────────────────┘`

### **1\. Ingress Contracts & Hardware Isolation**

Execution of greenscreen passes follows strict physical machine boundaries to prevent VRAM competition:

> * **The Ingress Payload:** worker-sower-conductor on Rig 1 compiles an immutable SpokeExecutionPayload containing the sceneId, character LoRA tags, PRNG seeds, and a quantized frame budget. The frame count is calculated from physical speech stems via ffprobe duration analysis:  
>   target\_frames=⌈(1000duration\_ms​)×24⌉  
> * **Machine Isolation:** Headless ComfyUI processes the shot on Rig 2 (or an ephemeral RunPod serverless RTX 4090). Checkpoint weights and character LoRAs are hydrated onto local NVMe via s5cmd from Cloudflare R2.  
> * **Quarantine Invariant:** The GPU foundry produces raw, uncomposited character plates keyed against \#00FF00. **It is strictly forbidden from running Remotion or launching Chromium** to preserve all VRAM for tensor operations and prevent CUDA driver crashes.

### **2\. Neural Matting & Dual-Stream Egress**

Diffusion models do not produce mathematically pure, flat \#00FF00 pixels. Anti-aliasing filters and micro-occlusion introduce green edge halos, translucent fringes, and spill into hair, fur, and costume fibers. Relying exclusively on standard browser-side chroma keyers degrades sub-pixel edge details.

To solve this, goblin-render-pipeline executes an automated in-engine extraction pass directly inside ComfyUI before network egress:

> 1. **Neural Background Extraction:** The rendered frames pass through **BiRefNet** or **Robust Video Matting (RVM)** within ComfyUI, isolating foreground character pixels from the \#00FF00 plane and generating a clean, continuous 8-bit alpha channel.  
> 2. **Dual-Stream Archival Packaging:** The egress harness packages two distinct artifacts to Cloudflare R2:  
   * *The Preservation Master:* Raw, uncompressed \#00FF00 MP4 video plate (preserves untouched diffusion tensor outputs).  
   * *The Alpha Delivery Proxy:* Derived 8-bit alpha WebM VP9 (or ProRes 4444\) video stream with embedded alpha transparency, allowing the downstream Remotion engine to composite directly with zero client-side keying overhead.  
> 3. **Empty-Hash & Header Tripwire:** Before confirming asset keys in R2, the uploader verifies the binary digest against the empty-file SHA-256 hash constant:  
>    SHA-256(∅)=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>    An automated ffprobe header inspection verifies stream integrity and frame-duration parity, stamping the asset with a W3C UUIDv7 trace context.

### **3\. The Temporal Deflicker Node (Alpha-Matte Isolation)**

Keying diffusion plates over static, high-resolution background plates exposes **boundary chatter** and **sub-pixel edge boil**, caused because diffusion models lack cross-frame temporal constraints on alpha contours.

To stabilize boundary vibration, the extraction pipeline routes the alpha stream into a dedicated single-channel grayscale buffer (*At*​). A localized temporal deflicker node constrains boundary variance against the preceding frame:

*At*clean​(*x*,*y*)=clamp(*At*​(*x*,*y*),*At*−1​(*x*,*y*)−*δ*max​,*At*−1​(*x*,*y*)+*δ*max​)

> * Where *δ*max​ is a dynamic threshold calibrated to the character’s active motion vector.  
> * This clamp prevents rapid 1-to-2 pixel boundary flickering while allowing deliberate kinetic movements and gross anatomical shifts to pass through cleanly.

### **4\. Deterministic CV Gatekeeping & The Critic Funnel**

Before any generated plate is cleared for compositing, it must pass an automated inspection gauntlet:

                  `CANDIDATE DIFFUSION PLATE`  
                             `│`  
                             `▼`  
 `┌────────────────────────────────────────────────────────┐`  
 `│ TIER 1: DETERMINISTIC GEOMETRIC & PURITY GATES         │`  
 `│ • Alpha Edge Purity: 3px contour green spill < 12      │`  
 `│ • Silhouette Redaction Test: binary entropy H < 0.15   │`  
 `└───────────────────────────┬────────────────────────────┘`  
                             `│ PASS`  
                             `▼`  
 `┌────────────────────────────────────────────────────────┐`  
 `│ TIER 2: CASCADED CRITIC FUNNEL                         │`  
 `│ • LPIPS: Frame-to-frame pixel patch boiling check      │`  
 `│ • RAFT Optical Flow: Kinetic acceleration / limb tears │`  
 `│ • DINOv2 / CLIP: Cosine distance to character anchor   │`  
 `└───────────────────────────┬────────────────────────────┘`  
                             `│ PASS`  
                             `▼`  
     `Approved for Remotion Final Master Compositing`

> * **Alpha Edge Purity Gate:** Deterministic computer vision scans the outer 3-pixel contour of the character silhouette. The 99th-percentile green channel dominance across partially transparent boundary pixels must register below a strict threshold (Spill\<12); excessive spill flags the plate for re-extraction or rejection.  
> * **Silhouette Redaction Test:** Strips the character to a two-tone binary alpha mask. A shape classifier evaluates posture, limb separation, and silhouette readability; the outline must register an identity classification entropy of *H*\<0.15.  
> * **Cascaded Critic Funnel:**  
  * *LPIPS:* Detects high-frequency frame-to-frame patch divergence (texture boiling).  
  * *RAFT Optical Flow:* Flags velocity spikes, warping tearing, and disarticulated limbs.  
  * *DINOv2 / FaceID / CLIP:* Calculates the cosine embedding distance against certified character reference sheets to ensure facial bone structure and costume invariants have not drifted off-model.

### **5\. Downstream Assembly & Optical Integration (Remotion on Rig 1\)**

Once verified alpha plates arrive at Rig 1, the conductor integrates them using the 4-layer optical printing stack inside FinalCompositeMaster.tsx:

#### **Algorithmic Despill Fallback**

If processing fallback raw \#00FF00 footage rather than pre-extracted WebM alpha, Remotion applies @remotion/effects colorKey() with mathematical despill suppression:

*G*target​\=min(*G*,2*R*\+*B*​)

If the green channel exceeds the mean of the red and blue channels, it is clamped down to eliminate green fringing along ears, clothing folds, and hair without muting the actor's actual palette.

#### **Welding Characters to the Stage**

Characters rendered in isolation lack the ambient photon bounce, directional illumination, and ground occlusion of the environment. Remotion resolves this through three programmatic operations:

> 1. **Directional Ambient Light-Wrap:** The static matte background (Layer 1\) is convolved via a 20–30px Gaussian blur, masked to an interior 3–6px rim of the character's eroded alpha silhouette, and screen-blended over the actor at 25% opacity. This bleeds the room's atmospheric color into the character's boundary, eliminating the "cardboard cutout" appearance.  
> 2. **Tracked Dynamic Contact Shadows:** Remotion projects an elliptical radial gradient using mix-blend-mode: multiply at the character’s ground contact point (anchor\_point.x, anchor\_point.y). As the character moves or speaks, the shadow dynamically scales its radius and decreases opacity in inverse proportion to vertical displacement above *Y*ground​, keeping the silhouette physically anchored to the floor.  
> 3. **Layer 4 Optical Unification:** An offline FFmpeg filtergraph applies a sub-pixel Gaussian micro-diffraction blur (0.4px) to soften harsh AI edges, an optical halation bloom on the top 5% luminance pixels (red-orange scattering), a unified 3D .cube LUT (e.g., Kodak 2383), and 14–15% opacity 35mm silver halide film grain. This glues the static digital matte painting and the generative character plate into a single, cohesive cinematic frame.

---

*User prompt: {{FOCUS:  3\. Execution Topology & Ingress/Egress Boundaries }} /extreme-details*

### **Response: Execution Topology & Ingress/Egress Boundaries**

The execution topology for goblin-render-pipeline governs how generative jobs move from abstract narrative intent down to physical GPU silicon and egress back out as immutable video plates. It enforces an architectural boundary between orchestrator, edge coordinator, and foundry spoke, eliminating race conditions, memory collisions, and compute waste by construction.

               `RIG 1 (ORCHESTRATOR / CONDUCTOR)`  
   `┌────────────────────────────────────────────────────────┐`  
   `│ worker-sower-conductor (:4321 / Node.js)               │`  
   `│ • CPU Only / Zero VRAM                                 │`  
   `│ • Temporal Audio Quantization (ffprobe 24 fps)         │`  
   `│ • Compiles SpokeExecutionPayload                       │`  
   `└───────────────────────────┬────────────────────────────┘`  
                               `│ HTTPS POST / Signed JWT + UUIDv7`  
                               `▼`  
            `CLOUDFLARE EDGE (POD-12: SYSTEM MIDDLEWARE)`  
   `┌────────────────────────────────────────────────────────┐`  
   `│ EdgeGateway (Hono / Cloudflare Workers)                │`  
   `│ • JWT & Two-Pass Zod Schema Validation                 │`  
   `│ • Continuity Gate: Cloudflare D1 (is_dirty == 0)       │`  
   `├────────────────────────────────────────────────────────┤`  
   `│ ShotCoordinatorDO (Durable Object)                     │`  
   `│ • Single-Threaded FIFO Mutex Queue                     │`  
   `│ • Leases: 30s TTL, 10s Heartbeat, Monotonic Epoch (N)  │`  
   `└───────────────────────────┬────────────────────────────┘`  
                               `│ Pull Semantics (Outbound cloudflared Tunnel)`  
                               `▼`  
             `RIG 2 / RUNPOD (HEAVY GPU FOUNDRY)`  
   `┌────────────────────────────────────────────────────────┐`  
   `│ media-broker (:3000 / Node.js)                         │`  
   `│ • Hardware Mutex: flock(/var/lock/rig2_gpu.lock)       │`  
   `│ • Polling Gate: nvidia-smi (Free VRAM > 21 GB)         │`  
   `│ • High-Speed Model Ingress: s5cmd from Cloudflare R2   │`  
   `├────────────────────────────────────────────────────────┤`  
   `│ Headless ComfyUI Runtime (:8188)                       │`  
   `│ • In-Memory Parameter Injection into JSON API Template │`  
   `│ • Sequential Turns (POST /free between stages)         │`  
   `│ • Monotonic 25-Shot Process Recycling Governor         │`  
   `├────────────────────────────────────────────────────────┤`  
   `│ Local Scratch & Egress Engine                          │`  
   `│ • Assert size > 0 & SHA-256 != e3b0c442...b855         │`  
   `│ • Structural Container Check (ffprobe moov atom)       │`  
   `│ • Upload to staging/renders/.../epoch_N_{hash}.mp4     │`  
   `│ • RPC: POST /tasks/complete -> Atomic DO Promotion     │`  
   `└────────────────────────────────────────────────────────┘`

### **1\. The Cross-Machine Demarcation & Physical Quarantine**

The system relies on a **Workstation Split Architecture** to isolate resource contention between memory-heavy browser engines and VRAM-heavy diffusion passes:

| Boundary Dimension | Rig 1: The Conductor (Presentation Compiler) | Rig 2: The Foundry Spoke (Neural Synthesizer) |
| :---- | :---- | :---- |
| **Compute Profile** | Multi-threaded CPU, System RAM bound. **0 MB VRAM**. | NVIDIA GPU (≥24 GB VRAM: RTX 3090/4090/5070) or RunPod Serverless. |
| **Active Runtimes** | Node.js, SQLite/D1 drivers, Local Audio TTS (:8000), remotion, Astro Cockpit (:4321). | Node.js media-broker (:3000), Headless ComfyUI (:8188), CUDA 12.x/PyTorch. |
| **Strict Process Bans** | ❌ **No GPU diffusion passes**. ❌ **No direct unauthenticated LAN calls** to http://rig2:8188. | ❌ **No Chromium / Remotion rendering**. ❌ **No SQLite canon databases**. ❌ **No audio waveform clocking (ffprobe)**. |
| **Network Exposure** | Client to EdgeGateway via HTTPS/WSS. | **Zero inbound WAN/LAN listeners** (bound strictly to 127.0.0.1); outbound-only cloudflared tunnel. |

### **2\. Ingress Phase: Schema Contracts & Pre-Flight Gating**

Execution never ingests arbitrary scripts, untyped commands, or mutable state changes (such as ACTOR\_MOVED). Upstream orchestration dispatches declarative *Intents* bound strictly to strongly typed contracts.

#### **A. Temporal Quantization & Lattice Math**

Before building the execution payload, Rig 1 evaluates physical .wav audio stems using ffprobe to derive an immutable duration in milliseconds. It converts duration to discrete 24 fps integer frames:

masterDeliveryFrames=⌈(1000duration\_ms​)×24⌉

Spatiotemporal video diffusion models (Wan 2.2, HunyuanVideo) downsample time across a 3D causal VAE lattice (4× temporal downsampling). The conductor calculates the conformed lattice allocation (4*n*\+1):

diffusionAllocation=4×⌈4masterDeliveryFrames−1​⌉\+1

(e.g., a 75-frame delivery target conforms to 77 allocated diffusion frames; the extra 2 frames are flagged via trimEndFrames for downstream alignment in Remotion).

#### **B. The Ingress Payload Contract (SpokeExecutionPayload)**

The compiled intent is validated via Zod schemas (additionalProperties: false):

`// packages/000.cauldron/src/contracts/SpokeExecutionPayload.ts`  
`import { z } from "zod";`

`export const SpokeExecutionPayloadSchema = z.object({`  
  `type: z.literal("ENQUEUE_SHOT"),`  
  `jobId: z.string(),                             // e.g., "EP101_SC02_SH003"[cite: 5]`  
  `artistId: z.string(),                          // Tenant / Machine ID[cite: 5]`  
  `idempotencyKey: z.string().uuid(),             // UUIDv7 unique dispatch key[cite: 2, 5]`  
  `workflowTemplate: z.enum([`  
    `"wan_greenscreen_i2v.json",`  
    `"flux_matte_background.json",`  
    `"inpaint_repair.json"`  
  `]),[cite: 5]`  
  `payload: z.object({`  
    `sceneId: z.string(),[cite: 5]`  
    `shotId: z.string(),[cite: 5]`  
    `prompt: z.string(),                          // Base prompt + ", chroma key #00FF00"[cite: 2, 3, 5]`  
    `negativePrompt: z.string(),                  // Clutter, real background, photorealism[cite: 3, 5]`  
    `loraTag: z.string(),                         // Target character LoRA key on disk[cite: 2, 3, 5]`  
    `targetPromptNodeId: z.string().default("6"), // CLIPTextEncode Node ID[cite: 1, 5]`  
    `targetFrameNodeId: z.string().default("37"), // EmptyWanLatentVideo Node ID[cite: 1, 5]`  
    `targetSeedNodeId: z.string().default("3"),   // KSampler Node ID[cite: 1, 5]`  
    `diffusionAllocation: z.number().int(),       // Conformed 4n + 1 frame lattice[cite: 5]`  
    `masterDeliveryFrames: z.number().int(),      // Target 24fps frame count[cite: 5]`  
    `seed: z.number().int().nonnegative()         // Immutable PRNG seed[cite: 3, 5]`  
  `})`  
`});`  
`export type SpokeExecutionPayload = z.infer<typeof SpokeExecutionPayloadSchema>;`

#### **C. Edge Continuity & Dirty-State Invalidation Gate**

When Rig 1 posts the payload to the EdgeGateway (src/index.ts via Hono), the gateway enforces a pre-flight relational continuity audit against Cloudflare D1 within 5 ms:

`SELECT COUNT(*) AS dirty_count`  
`FROM scene_fact_dependencies`  
`WHERE scene_id = ? AND is_dirty = 1;`

If upstream canon, character somatic conditions (e.g., paralyzed limbs), or scene inventory mutated without an AST re-compile, dirty\_count \> 0\. The gateway halts dispatch immediately with **HTTP 412 Precondition Failed** (DIRTY\_SCENE\_REJECTED), blocking invalid tasks before they consume GPU time or queue locks.

### **3\. Execution Concurrency & The Inverted Mutex Architecture**

Consumer GPUs (e.g., 24 GB VRAM) cannot dynamically segment memory across concurrent video diffusion jobs. Simultaneous allocations cause catastrophic CUDA Out-Of-Memory (OOM) aborts.

#### **A. The "Two-Queue" Failure Mode**

If an edge control plane holds authoritative locking power, network latency across the WAN tunnel creates a fatal split-claimant state:

> 1. The edge leases Job A to Rig 2 under Epoch *N*.  
> 2. A transient network partition drops outbound telemetry for \>30 seconds.  
> 3. The edge watchdog timer trips, revokes the lease, and reassigns Job A to a secondary worker under Epoch *N*\+1.  
> 4. Rig 2's local GPU is unaware of the revocation and continues sampling frames.  
> 5. When connectivity recovers, competing allocations hit the same GPU, crashing the driver.

                           `THE TWO-QUEUE COLLISION HAZARD`  
                             
   `[ Remote Cloud Edge (DO) ]                              [ Local Rig 2 (Foundry) ]`  
               `│                                                       │`  
               `├───── Job A Leased to Rig 2 (Epoch N) ────────────────►│ (GPU starts diffusion pass)[cite: 3]`  
               `│                                                       │`  
               `│   x──── Transient Network Partition / Delay ────x     │ (GPU still rendering Job A)[cite: 3]`  
               `│                                                       │`  
               `├─ Watchdog Timer Trips (30s silence)[cite: 3]`  
               `├─ DO assumes Worker dead; revokes lease[cite: 3]`  
               `├─ DO reassigns Job A to Worker B / Epoch N+1[cite: 3]`  
               `│                                                       │`  
               `│   x──── Network Reconnects / Worker B Hits GPU ───x   │`  
               `│                                                       ▼`  
               `└──────────────────────────────────────────────► [ FATAL COLLISION ]`  
                                                                `• Two claimants on 1 GPU[cite: 3]`  
                                                                `• Concurrent VRAM allocation[cite: 3]`  
                                                                `• CUDA OUT-OF-MEMORY (OOM)[cite: 3]`

#### **B. The Architectural Inversion: Local Kernel Lock (flock)**

The authority relationship is inverted: **The edge Durable Object is a passive FIFO queue; physical silicon sovereignty belongs exclusively to Rig 2**.

Remote DO⟶Passive Logical Queue⟶Local media-broker⟶OS flock⟶GPU Silicon

The local daemon (media-broker) holds an unconditional POSIX advisory lock via fcntl:

`// media-broker/src/hardware/gpuLock.ts`  
`import fs from "node:fs";`  
`import fcntl from "fs-ext";`

`export class GpuHardwareMutex {`  
  `private lockFd: number | null = null;`  
  `private readonly lockFilePath = "/var/lock/rig2_gpu.lock";`

  `public acquireLock(): boolean {`  
    `if (this.lockFd !== null) return true;`  
    `try {`  
      `this.lockFd = fs.openSync(this.lockFilePath, "w");`  
      `fcntl.flockSync(this.lockFd, "exnb"); // LOCK_EX | LOCK_NB`  
      `return true;`  
    `} catch (err: any) {`  
      `if (err.code === "EAGAIN" || err.code === "EWOULDBLOCK") return false;`  
      ``throw new Error(`[GpuMutex] Kernel failure acquiring GPU lock: ${err.message}`);``  
    `}`  
  `}`

  `public releaseLock(): void {`  
    `if (this.lockFd === null) return;`  
    `try { fcntl.flockSync(this.lockFd, "un"); }`  
    `finally {`  
      `fs.closeSync(this.lockFd);`  
      `this.lockFd = null;`  
    `}`  
  `}`  
`}`

> * **Pull-Only Semantics:** The edge *never pushes* execution down to hardware. media-broker claims work from ShotCoordinatorDO over its outbound tunnel **only when its local flock is successfully claimed and available**.  
> * **Single Mutex Reality:** There is only one hardware lock in the ecosystem, and it resides on Rig 2's filesystem. Edge timeouts cannot force concurrent execution onto active silicon.

### **4\. Local Execution & Memory Lifecycle Management**

Once media-broker pulls a lease, it executes the job within a controlled lifecycle on local NVMe (/mnt/nvme-scratch/):

#### **A. High-Speed Dependency Hydration (s5cmd)**

The broker checks if required .safetensors model weights and character LoRAs exist on disk. Missing assets are pulled from Cloudflare R2 using s5cmd over high-concurrency parallel streams (transferring up to 22 GB in ≤18 seconds) directly into ComfyUI's model directories.

#### **B. In-Memory Graph Ingestion**

media-broker loads the approved template (wan\_greenscreen\_i2v.json) into memory and injects execution parameters into their target node sockets:

> * workflow\["6"\].inputs.text \= payload.prompt  
> * workflow\["37"\].inputs.length \= payload.diffusionAllocation  
> * workflow\["3"\].inputs.seed \= payload.seed

#### **C. Loopback REST & WebSocket Tapping**

> 1. The broker opens ws://127.0.0.1:8188/ws?clientId=\${clientId} *before* triggering execution to ensure no initial lifecycle packets are dropped.  
> 2. It executes POST \[http://127.0.0.1:8188/prompt\](http://127.0.0.1:8188/prompt) with the hydrated JSON DAG.  
> 3. A background thread isolates heartbeats (BROKER\_HEARTBEAT), renewing the lease with the edge DO every 10 seconds against a 30-second sliding expiration.  
> 4. The broker listens for ComfyUI's completion sentinel: {"executing": {"node": null}}.

#### **D. The Polling Gate & The 25-Shot Recycling Governor**

> 1. **Turn-Based VRAM Eviction:** Between pipeline turns, the broker issues POST \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) ({"unload\_models": true, "free\_memory": true}).  
> 2. **The nvidia-smi Polling Gate:** Because ComfyUI's /free endpoint returns asynchronously while PyTorch's caching allocator is still unmapping memory, the broker spawns an independent nvidia-smi subprocess:  
>    `nvidia-smi --query-gpu=memory.free --format=csv,noheader,nounits`

It halts downstream dispatching every 250 ms until available VRAM returns to within Δ≤500 MB of its calibrated boot baseline (\>21 GB free). If memory remains trapped past a 15-second ceiling, a circuit breaker trips and restarts the daemon. 3\. **The 25-Shot Process Recycling Governor:** Continuous 5D spatio-temporal video latent operations (\[*B*,*C*,*T*,*H*,*W*\]) cause PyTorch driver virtual allocator fragmentation. Every **25 completed shots**, media-broker terminates the headless ComfyUI child process, allowing nvidia.ko to unmap memory contexts, and respawns the daemon cleanly.

### **5\. Egress Phase: Defensive Audits, Content Addressing, & Promotion**

Generative video plates cannot be reproduced bit-for-bit from mathematical seeds due to non-deterministic CUDA execution and floating-point drift. Consequently, output plates are treated as immutable historical evidence.

`Rig 2 (media-broker)                 Cloudflare R2 Bucket          edge-director DO`  
      `│                                       │                           │`  
      `├─ ComfyUI emits: { node: null }        │                           │[cite: 3]`  
      `├─ Validates MP4 on scratch disk        │                           │[cite: 3]`  
      `├─ Computes SHA-256 Digest              │                           │[cite: 3]`  
      `│                                       │                           │`  
      `├─ Streams MP4 to Staging Key ─────────►│                           │[cite: 3]`  
      `│  staging/.../epoch_4_a8f5b.mp4        │                           │[cite: 3]`  
      `│                                       │                           │`  
      `├─ RPC: POST /tasks/complete ──────────────────────────────────────►│[cite: 3]`  
      `│  { taskId, epoch: 4, sha256, key }    │                           ├─ Asserts active Epoch == 4[cite: 3]`  
      `│                                       │                           ├─ Promotes staging to canonical[cite: 3]`  
      `│                                       │                           ├─ Releases Hardware Mutex[cite: 3]`  
      `│                                       │                           │`  
      `│◄───── HTTP 200 OK ────────────────────────────────────────────────┤[cite: 3]`  
      `│                                       │                           │`  
      `│                                       │                           ├─ Broadcasts to Artists:[cite: 3]`  
      `│                                       │                           │  SHOT_READY { seq: 114, url }[cite: 3]`

#### **Step 1: Defensive Scratchpad Audit**

When { "executing": { "node": null } } arrives, media-broker inspects ComfyUI/output/:

> 1. **Size Verification:** Asserts binary file size \>0 bytes.  
> 2. **The Empty-File Hash Trap:** Computes the SHA-256 binary digest and asserts it does not match the empty-string constant:  
>    SHA-256(∅)=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
> 3. **Container Decode (ffprobe):** Spawns an ffprobe child process to ensure the MP4 container moov atom is intact and that total decoded frames match the conformed diffusionAllocation.

#### **Step 2: Content-Addressed Staging Upload**

Cloudflare R2 and AWS S3 cannot natively evaluate custom epoch lease tokens on raw object PUT requests. The broker streams the verified MP4 using @aws-sdk/client-s3 or s5cmd directly to an isolated, epoch-scoped staging key:

`staging/renders/${taskId}/epoch_${epoch}_${sha256}.mp4`

Because the key includes both the epoch and content hash, competing workers can never overwrite existing assets.

#### **Step 3: The Atomic Promotion RPC & Split-Brain Fencing**

> 1. The broker sends an authenticated RPC to ShotCoordinatorDO:  
>    `POST /tasks/complete`  
>    `Content-Type: application/json`

>    `{`  
>      `"taskId": "EP101_SC02_SH003",`  
>      `"epoch": 4,`  
>      `"sha256": "8a3f4e2b...",`  
>      `"stagingKey": "staging/renders/EP101_SC02_SH003/epoch_4_8a3f4e2b.mp4"`  
>    `}`

2\. The single-threaded Durable Object evaluates packet.epoch \=== this.activeEpoch inside an atomic transaction (ctx.storage):

> * **Epoch Valid:** The DO updates the canonical episode manifest, unlocks the queue mutex, and broadcasts SHOT\_READY containing the pre-signed R2 asset URL to Rig 1\.  
> * **Epoch Stale (Network Partition / Timeout Reassignment):** If the watchdog timer tripped prior to completion, the DO has already incremented its internal epoch (*N*→*N*\+1). The DO rejects the write with **HTTP 409 Conflict**.  
> 3. **Storage Hygiene (Zero-Waste Lifecycle):** Unpromoted zombie objects left by partitioned workers are ignored by canonical manifests and purged automatically by Cloudflare R2's 7-day lifecycle retention policy.  
> 4. **Zero-Egress Distribution:** Rig 1 downloads the verified plate from Cloudflare R2 under its **\$0.00 egress fee guarantee** and feeds the video directly into Remotion's optical compositor (--gl=swangle).

### **6\. Offline Autonomy & Zero Code-Path Divergence**

Under the **Deletion Principle**, production must continue during an internet outage or Cloudflare tunnel disruption without introducing branching logic:

> * **Zero Code-Path Divergence:** The offline fallback is structurally identical to the online path. Template hydration, parameter injection, VRAM hygiene gates, and ffprobe validations run through identical code.  
> * **Filesystem Ingress Switching:** If the outbound cloudflared tunnel drops, media-broker redirects its polling loop from the remote WebSocket to a local POSIX drop directory: /var/spool/renders/\*.json.  
> * **Local Content-Addressed Egress:** Rendered plates are hashed and committed directly to /mnt/nvme-scratch/canonical\_plates/sha256\_{hash}.mp4.  
> * **Automatic Re-sync Upon Reconnection:** When the tunnel recovers, media-broker drains its completion queue, syncs staging objects up to R2, reconciles the remote D1 ledger, and resumes polling ShotCoordinatorDO without human intervention.

---

*User prompt: {{FOCUS:  4\. Repository Anatomy & Key Deliverables }} /extreme-details*

### **Response: Repository Anatomy & Key Deliverables: goblin-render-pipeline**

goblin-render-pipeline (operating under **03.foundry/** as camp-candor/goblin-render-pipeline or goblin-lora-training) houses the code, headless Directed Acyclic Graphs (DAGs), neural training configurations, and cloud deployment recipes that drive heavy visual tensor computation. It produces no narrative facts and renders no final Remotion compositions; its sole purpose is compiling upstream geometric and narrative constraints into raw visual plates and trained adapter binaries.

### **1\. Canonical Directory Topology**

The file tree organizes generative passes across model training, headless ComfyUI graph synthesis, quality control gating, and containerized cloud deployment:

`goblin-render-pipeline/`  
`├── .gitattributes                          # Git LFS rules (*.safetensors, *.pth, *.onnx)`  
`├── README.md                               # Hardware spec, VRAM tiers, weekend vs. weekday rules`  
`├── package.json                            # Local media-broker daemon, TypeScript Zod contracts`  
`├── tsconfig.json                           # Extends goblin-config ruleset`  
`│`  
`├── workflows/                              # Headless ComfyUI API Format Graphs (Pure JSON)`  
`│   ├── wan2.2_greenscreen_i2v.json         # Spatiotemporal video diffusion over #00FF00 void`  
`│   ├── flux_matte_background.json          # Static 2048x1152 environment matte plate generation`  
`│   ├── birefnet_matting.json               # In-engine neural alpha matte extraction`  
`│   └── lora_regression_benchmark.json      # Standardized multi-angle character pose evaluation`  
`│`  
`├── lora-training/                          # Character, Fashion, Object, & Mood LoRA Toolchains`  
`│   ├── train_character_lora.py             # Serverless/local Kohya-ss & PEFT training harness`  
`│   ├── dataset_prep/                       # Ingestion, cropping, and caption regularizers`  
`│   │   ├── crop_buckets.py                 # Multi-resolution bucket quantization (512, 768, 1024)`  
`│   │   ├── caption_dropout.py              # Invariance tokenizer (5% caption dropout gate)`  
`│   │   └── palette_audit.py                # Pre-flight check against master_palette.json`  
`│   ├── configs/                            # Character-specific training parameters`  
`│   │   ├── bog.yaml                        # Rank 32 / Alpha 16 SDXL / Wan config`  
`│   │   ├── spleen.yaml                     # Anatomical ratio and skin texture constraints`  
`│   │   └── fashion_apron.yaml              # Wardrobe adapter config (decoupled from identity)`  
`│   └── active_checkpoints.json             # Canonical pointers to deployed .safetensors hashes`  
`│`  
`├── emotion-generation/                     # Staged Batch Candidate Synthesis`  
`│   ├── generate_emotion_bank.py            # High-throughput batch pose generator`  
`│   └── emotion_prompt_templates.json       # Upstream condition mappings (humiliated, smug, etc.)`  
`│`  
`├── alpha-compositing/                      # Edge Isolation & Clean Plate Extraction`  
`│   ├── green_screen_key.py                 # Algorithmic fallback despill & color-clamp`  
`│   ├── temporal_deflicker.py               # Boundary alpha-clamp against preceding frame`  
`│   └── palette_enforce.py                  # Quantizes boundary pixels to the 155-color gamut`  
`│`  
`├── qc/                                     # Automated Visual Gating & Regression Funnel`  
`│   ├── consistency_check.py                # DINOv2 / CLIP cosine embedding distance vs. anchor`  
`│   ├── temporal_stability.py               # RAFT optical flow & LPIPS patch boiling analyzer`  
`│   └── verify_hashes.py                    # Assert >0 bytes and SHA-256 != e3b0c442...b855`  
`│`  
`├── cloud/                                  # Serverless Burst & Container Topology`  
`│   ├── Dockerfile                          # GHCR image: CUDA 12.4, PyTorch, xFormers, ComfyUI`  
`│   ├── handler.py                          # RunPod Serverless / Modal execution entrypoint`  
`│   └── sync_weights.sh                     # High-concurrency R2 weight hydration via s5cmd`  
`│`  
`└── broker/                                 # Rig 2 Hardware Coordination Glue`  
    `├── local_broker.ts                     # Local daemon bridging edge-director to localhost:8188`  
    `├── hardware_mutex.ts                   # Kernel flock(/var/lock/rig2_gpu.lock) wrapper`  
    `└── memory_monitor.ts                   # nvidia-smi polling gate & 25-shot process recycler`

### **2\. Deep Dive: Component Subsystems**

#### **A. Headless ComfyUI API Graphs (/workflows/)**

> * **Stripped UI Presentation:** Unlike interactive workspaces that bundle pan/zoom and viewport nodes, every JSON workflow in /workflows/ is saved strictly via **"Save (API Format)"**.  
> * **Dynamic Injection Points:** Nodes are keyed by deterministic string IDs (e.g., node "6" for CLIPTextEncode, node "37" for EmptyWanLatentVideo, node "3" for KSampler). The orchestrator injects runtime parameters (positivePrompt, seed, diffusionAllocation) directly into these sockets in memory before execution.  
> * **wan2.2\_greenscreen\_i2v.json:** Contains the primary character pipeline. Prompts are automatically appended with , isolated on solid vivid green screen background, chroma key \#00FF00, flat high-key studio lighting, and latent dimensions are configured to conform to the 4*n*\+1 temporal lattice.

#### **B. LoRA Training Infrastructure (/lora-training/)**

> * **dataset\_prep/:** Prepares curated raw photography, turnaround sketches, and 3D renders. Implements the **Invariance Principle**: permanent anatomical markers (scars, ear notches, bone contours) are omitted from image captions to bind them directly to the character trigger word (bog\_goblin). Wearable items, handheld props, and lighting angles are captioned explicitly to decouple them from the core identity.  
> * **The 60/40 Anti-Autophagy Barrier:** Script checks enforce that no training set exceeds 40% synthetic diffusion outputs, requiring at least 60% human-authored ground truth (concept art, 3D orthographics) to prevent Model Autophagy Disorder (MAD) variance collapse.  
> * **configs/:** Stores YAML definitions setting Rank (*R*\=16 or *R*\=32), Network Alpha (*α*\=8 or *α*\=16), learning rates (1*e*−4 with cosine annealing), and caption dropout rates (0.05).

#### **C. Emotion Generation & Batch Staging (/emotion-generation/)**

> * **Candidate Farming:** Translates narrative conditions legislated in 000.goblin-lore (world/conditions.md) into generative visual batches.  
> * **generate\_emotion\_bank.py:** Reads emotion\_prompt\_templates.json to generate candidate sets (e.g., take\_01.png, take\_02.png, take\_03.png) for a target character condition (such as humiliated or smug).  
> * **Upstream Handoff:** These generated candidate takes are not committed here; they are packaged and staged into goblin-assets-visual/characters/\<id\>/emotion\_bank/\<emotion\>/ for triage.

#### **D. Alpha Extraction & Color Governance (/alpha-compositing/)**

> * **Neural Matting Pass:** Executes **BiRefNet** or **Robust Video Matting (RVM)** immediately post-diffusion, separating foreground character silhouettes from the raw \#00FF00 background.  
> * **temporal\_deflicker.py:** Applies an inter-frame alpha clamp:  
>   *At*clean​(*x*,*y*)=clamp(*At*​(*x*,*y*),*At*−1​(*x*,*y*)−*δ*max​,*At*−1​(*x*,*y*)+*δ*max​)  
>   This operation suppresses high-frequency boundary boiling along character contours before the plate is compressed.  
> * **palette\_enforce.py:** Pre-flight script that scans rendered plate frames against the studio's 155-color master palette (master\_palette.json), flagging out-of-gamut diffusion artifacts.

#### **E. Cloud Bursting & Container Execution (/cloud/)**

> * **Dockerfile:** Standardized NVIDIA CUDA container recipe built and tagged to the GitHub Container Registry (GHCR). Bundles pinned PyTorch, headless ComfyUI, xFormers, and flash-attention libraries.  
> * **sync\_weights.sh:** Uses s5cmd to pull multi-gigabyte foundation models (Wan 2.2, Flux.1) and character LoRAs from Cloudflare R2 into ephemeral GPU instance NVMe storage at transfer speeds up to 22 GB≤18 seconds.  
> * **handler.py:** The serverless worker adapter (for RunPod Serverless or Modal). Ingests SpokeExecutionPayload via HTTP POST, dispatches execution to local ComfyUI via loopback REST, monitors the job, and pushes finished output directly back to Cloudflare R2.

### **3\. Key Production Deliverables & Egress Contracts**

goblin-render-pipeline produces three core artifacts consumed downstream across the studio fleet:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   goblin-render-pipeline DELIVERABLES                  │`  
`└────────────────────────────────────────────────────────────────────────┘`  
                 `│`  
                 `├──► 1. Production Model Checkpoints (.safetensors)`  
                 `│    • Deployed to Cloudflare R2 bucket: /models/loras/`  
                 `│    • Tracked via active_checkpoints.json`  
                 `│    • Consumed by: Headless ComfyUI Generative Daemons`  
                 `│`  
                 `├──► 2. Isolated Character Video Plates (Dual-Stream)`  
                 `│    • Stream A: Raw #00FF00 Master (MP4, H.264/H.265)`  
                 `│    • Stream B: Pre-Keyed Alpha Proxy (WebM VP9 with Alpha)`  
                 `│    • Consumed by: goblin-viewport-template / Remotion`  
                 `│`  
                 `└──► 3. Emotion Bank Candidate Takes (take_XX.png)`  
                      `• Staged to: goblin-assets-visual/.../emotion_bank/`  
                      `• Triaged into approved.json & promoted to variants/`

#### **Deliverable 1: Trained Model Checkpoints (.safetensors)**

> * High-rank, low-loss neural adapter weights for character identities, fashion variations, key narrative objects, and cinematic moods.  
> * Every released checkpoint is cataloged in active\_checkpoints.json with an explicit SHA-256 hash, base checkpoint target, and consistency QC report path. Downstream scene compilation records this hash directly into render\_manifest.json.

#### **Deliverable 2: Isolated Character Video Plates (Dual-Stream)**

> * Raw character action keyed to the exact integer frame count dictated by audio speech stems (target\_frames=⌈(duration\_ms/1000)×24⌉).  
> * Exported to Cloudflare R2 as:  
  1. **Raw Preservation Plate:** High-bitrate MP4 rendered against pure \#00FF00.  
  2. **Alpha Video Proxy:** 8-bit alpha WebM VP9 containing transparent background channels, enabling Remotion on Rig 1 to drop the actor straight onto hand-painted matte backgrounds with zero local keying overhead.  
> * **The Zero-Byte Poison Tripwire:** Every generated plate must be audited prior to network promotion; any file whose SHA-256 matches e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 halts the release immediately.

#### **Deliverable 3: Emotion Bank Candidate Takes**

> * Batches of 2D full-figure or close-up candidate poses rendered across standardized aspect buckets.  
> * Dispatched to 04.assets/goblin-assets-visual/characters/\<id\>/emotion\_bank/\<emotion\>/ where they pass through the three-tier triage gauntlet before promotion to variants/\<character\>\_\<emotion\>.png and declaration in manifest.json.

### **4\. Hardware Demarcation & Operational Rhythms (README.md)**

The repository's documentation mandates a strict hardware division between development cycles and compute tasks:

> * **The Hardware Quarantine:** goblin-render-pipeline runs exclusively on dedicated high-VRAM hardware (local Rig 2 with ≥24 GB VRAM, or ephemeral RunPod/Modal instances). It is **strictly prohibited from executing Remotion or Chromium** to prevent GPU display-driver context switching and out-of-memory aborts.  
> * **The Two Production Rhythms:**  
  * **Weekend / Burst Cadence (Foundry Active):** High-VRAM sessions dedicated to running train\_character\_lora.py, updating active checkpoints, and batch-farming emotion candidate poses via generate\_emotion\_bank.py.  
  * **Weekday Cadence (Foundry Idle / On-Demand):** Simulation runs on Rig 1 via worker-sower-engine and audio-microservice. The foundry is activated only on-demand by media-broker to render individual \#00FF00 character plates over pre-trained models.

---

*User prompt: {{FOCUS:  1\. Repository Topology & The Reference State Machine }} /extreme-details*

## **Response: Minimal Enclosing Unit & Directory Topology**

goblin-render-pipeline operates within Cluster 03.foundry/, serving as the dedicated tensor execution broker. It is physically isolated from legislative narrative ledgers (01.canon) and optical presentation (05.delivery), functioning as a Minimal Enclosing Unit (MEU) with zero overlapping code dependencies.

> * **workflows/**: Contains pure JSON headless ComfyUI API execution graphs.  
> * **training/**: Houses LoRA configuration YAMLs and dataset preparation scripts.  
> * **cloud/**: Defines container recipes, weights synchronization, and serverless execution entrypoints.

## **The Tri-Stage Reference State Machine**

To protect downstream systems from multi-gigabyte bloat and unverified synthetic hallucinations, raw training imagery moves through a strict, immutable state machine on disk.

> * **Stage 1: /references/raw/ (Ingestion Buffer)**: Stores raw concept art, viewport screengrabs, and external references. Every asset requires a source\_log.json entry detailing base models and licensing provenance.  
> * **Stage 2: /references/curated/ (Active Set)**: The verified ground truth. Assets are cropped across standardized multi-resolution buckets, color-audited, and mapped against a four-axis taxonomy (angle, framing, pose, emotion).  
> * **Stage 3: /references/rejected/ (Negative Buffer)**: Excluded files are never deleted. They are logged in rejected\_log.json to provide negative guidance contrast, counteracting algorithmic bias and preventing Model Autophagy Disorder (MAD).

## **Checkpoint Governance & The Deletion Principle**

The pipeline adheres strictly to the Deletion Principle: neural weights and generative outputs are disposable projections, not irreplaceable canonical facts.

> * **Floating Pointers (active\_checkpoint.json)**: Located at the root of each character's directory, this file tracks the currently deployed .safetensors binary hash, base model, and quality control status.  
> * **Cryptographic Sealing**: When an episode renders, the current checkpoint hash is baked into an immutable build lockfile. Retraining a character LoRA to version 3 cannot retroactively alter the deterministic build graph of past episodes.

## **Asset Egress & Vault Promotion**

Output artifacts are immediately evicted from the compute foundry upon completion.

> * Trained LoRA checkpoints, generation plates, and curated emotion banks are exported to Cluster 04.assets/, the studio's LFS source art vault.  
> * This enforces a one-way thermodynamic flow of state, ensuring the generative execution layer never acts as a permanent storage host for production-approved renders.

Should we map out the specific Zod schemas used to validate curation\_manifest.json before a LoRA training run is authorized?

---

*User prompt: {{FOCUS:  2\. Multi-Dimensional Curation Taxonomy (curation\_manifst.json) }} /extreme-details*

Response: To prevent diffusion models from over-indexing on a single flattering camera angle or a single neutral expression, curation\_manifest.json categorizes every verified reference image across four orthogonal axes. This multi-dimensional curation taxonomy acts as the explicit ground-truth index for any LoRA training run.

`{`  
  `"dataset_version": "2.1.0",`  
  `"character_id": "bog",`  
  `"base_checkpoint": "sdxl-1.0",`  
  `"palette_enforcement_profile": "master_palette_155.json",`  
  `"total_curated_images": 48,`  
  `"curated_references": [`  
    `{`  
      `"file_id": "curated_014.png",`  
      `"sha256": "8a3f4e2b...",`  
      `"represents": {`  
        `"pose": "idle_slouch",`  
        `"emotion": "humiliated",`  
        `"angle": "three_quarter_low_angle"`  
      `},`  
      `"camera_angle": "three_quarter_low_angle",`  
      `"shot_framing": "medium_close_up",`  
      `"somatic_pose": "idle_slouch",`  
      `"primary_emotion": "humiliated",`  
      `"emotion_variant": "interrupted_control",`  
      `"lighting_profile": "harsh_underwater_sodium_lamp",`  
      `"palette_check": "pass",`  
      `"source": "sd_generated",`  
      `"source_reference": "raw/ref_014.png",`  
      `"added_for": "v2 retrain — humiliated emotion coverage gap",`  
      `"caption_tokens": [`  
        `"bog_goblin",`  
        `"male",`  
        `"three-quarter angle",`  
        `"low angle",`  
        `"medium close-up",`  
        `"tattered pantry apron",`  
        `"humiliated expression",`  
        `"clenched jaw",`  
        `"harsh sodium lighting"`  
      `]`  
    `}`  
  `],`  
  `"coverage_summary": {`  
    `"poses_represented": ["idle_slouch", "hands_gesturing", "talking"],`  
    `"emotions_represented": ["humiliated", "smug"],`  
    `"emotions_missing": ["terrified", "exhausted"]`  
  `}`  
`}`

### **The Four Classification Vectors**

Every character reference image is strictly evaluated and tagged against four physical bounds:

> * **Camera Angle (Orientation):** Prevents the LoRA from flattening three-dimensional structure. Required tags include profile\_left, profile\_right, three\_quarter\_left, three\_quarter\_right, frontal, high\_angle\_down, and low\_angle\_up.  
> * **Framing Scale:** Establishes the optical distance and detail focus. Bounded to extreme\_close\_up (for viseme and facial texture), close\_up (for the expression baseline), medium\_shot (for gesture and arm interaction), and full\_body (for locomotion and proportion balance).  
> * **Somatic Posture & Gesture:** Categorizes the physical stance according to the character's established physical baseline, utilizing specific tags like idle\_slouch, clutching\_siphon, or hands\_pinned\_to\_ribs.  
> * **Emotional State & Tone:** Maps the facial expression directly to the narrative bible's Phase 0 condition taxonomy, ensuring states like humiliated, smug, terrified, or exposed are explicitly bound to the visual reference rather than relying on generic descriptions.

### **Coverage Tracking and Ingestion Provenance**

The manifest utilizes a coverage\_summary block to compute multi-dimensional density before authorizing a training run. It calculates poses\_represented and emotions\_represented against the master taxonomy, explicitly flagging emotions\_missing (e.g., \["terrified", "exhausted"\]) to identify exact gaps in the training ground truth.

Every ingested image must state its provenance via source\_reference (pointing back to the raw buffer) and track its origin as either human-authored or synthetic ("source": "sd\_generated"). The added\_for field documents the specific reason the asset was curated into the active set, such as filling a specific emotion coverage gap during a version 2 retraining.

### **Structural Degradation for Non-Character LoRAs**

The curation schema gracefully downgrades its strict requirements when training non-character models:

> * **Object LoRAs:** For narrative props (e.g., /object/the\_good\_spoon), the manifest drops emotion and pose tracking. The taxonomy focuses strictly on validating camera angle and lighting coverage across the curated set to ensure the object holds its structural geometry when rotated.  
> * **Mood LoRAs:** For atmospheric or stylistic treatments (e.g., /mood/paranoia\_blue\_tint\_palette), the manifest links to a Paranoia Clock ID or a location ID rather than a character. Reference images establishing the target color and lighting treatment are curated independently of character identity, sourced from film stills or hand-adjusted concept renders.

---

*User prompt: {{FOCUS:  3\. Captioning Architecture & Token Binding Mechanics }} /extreme-details*

Response: The captioning architecture within the generative pipeline dictates exactly how physical traits are permanently fused into a neural network's latent space versus what remains dynamically swappable. It operationalizes a core architectural truth: generative models are untrusted, headless rendering workers that possess zero narrative or temporal authority, and their outputs must be mathematically bound to the canonical ledger.

Here is the exact mechanical breakdown of how visual concepts are tokenized, bound, and regularized during training:

**The Hybrid Tagging Pipeline** The ingestion process does not rely solely on human data entry. It utilizes a hybrid pipeline where raw training images receive automated initial tagging via natural language models (like BLIP) or structured taggers (like WD14/Danbooru). These automated passes are then subjected to rigorous manual review and correction to align with the studio's strict ontological boundaries.

**Trigger Tokens & Syntactic Binding** Semantic binding relies on rare, low-association trigger tokens—such as ohwx, sks, or bespoke alphanumeric strings—to prevent cross-contamination with the base model's pre-existing knowledge. The exact syntax and word order of the caption strictly dictate how the model binds the visual concept.

> * Prompting *"photo of an ohwx man in a trenchcoat"* binds the newly trained neural weights directly to the man's physical identity.  
> * Conversely, prompting *"photo of a man in an ohwx trenchcoat"* binds the trained weights exclusively to the garment, leaving the wearer generic.

**The Invariance Principle** This is the central doctrine determining what becomes a hardcoded biological reality versus what remains a modular, swappable prop.

> * **Omit from Captions (Permanent Invariants):** Features that must be permanently baked into the character's trigger token (e.g., bog\_goblin) are deliberately excluded from the training text. This includes core facial bone structure, baseline skin tone, specific ear notches, and eye placement. By omitting these details, the model associates them directly with the trigger word, making them invariant. If an artist fails to caption a character's glasses, the model mathematically assumes the glasses are an inseparable, biological part of the character's face.  
> * **Explicitly Caption (Mutable Context):** Features that must remain variable at inference time must be exhaustively captioned. This includes wearables (like a "tattered pantry apron"), held props (like a "silver spoon"), specific lighting conditions (like a "deep blue ambient shadow"), and background settings. Explicitly naming these elements decouples them from the core character identity, allowing downstream rendering nodes to swap costumes or lighting simply by altering the generation prompt.

**Caption Dropout Regularization** To prevent the model from lazily memorizing exact text-to-image pairs, the training configuration enforces a caption dropout rate of 5% (caption\_dropout \= 0.05). During these specific training steps, all descriptive caption tokens are stripped away. This forces the optimizer to attempt to reconstruct the entire visual scene relying entirely on the base trigger word. This mechanism serves as a powerful regularizer that prevents verbatim prompt-memorization, enhances the model's ability to generalize to new prompts, and reinforces overall character cohesion across the latent space.

---

*User prompt: {{FOCUS:  4\. Classification Taxonomy of LoRA Types (LORA\_TYPES.md) }} /extreme-details*

Response: goblin-lora-training/LORA\_TYPES.md establishes the LoRA type as a first-class classification, explicitly documenting the divergent training and usage characteristics of different neural adapters. This taxonomy ensures that engineering effort is not wasted enforcing rigid character-level consistency requirements on atmospheric modifiers, nor under-invested in core identities where strict adherence is critical.

The taxonomy divides adapters into four strictly governed classes, each dictating its own curation rules and manifest.json structure:

> * **character (The Identity Baseline)**  
  * Represents the absolute visual identity of a specific entity (e.g., /character/bog).  
  * It carries the highest consistency bar in the pipeline and requires the full rigor of the emotion bank, multi-pose coverage, and strict palette-locking.  
  * The model must pass rigorous distinctness checks and per-emotion approved takes, and it is referenced by a character\_id that perfectly matches the goblin-bible.  
> * **fashion (The Contextual Modifier)**  
  * Trained on a specific worn item or outfit variant (e.g., tattered\_pantry\_apron, formal\_spore\_collar).  
  * These adapters are designed to be stacked on top of a character LoRA during inference.  
  * Because it functions as a modifier rather than a foundational identity, it carries a lower consistency bar where minor visual drift is acceptable.  
> * **object (The Narrative Prop)**  
  * Dedicated to specific recurring props that carry narrative weight (e.g., the\_good\_spoon, the\_letters\_in\_the\_wall).  
  * The consistency requirement is strictly structural: the item must be reproducible enough that the audience recognizes it as the exact same object across different episodes.  
  * It completely drops the multi-pose and multi-emotion range requirements necessary for characters; its manifest.json tracks dataset coverage across camera angles and lighting profiles instead.  
> * **mood (The Atmospheric Bias)**  
  * Not a discrete visual identity, but a broad style and atmosphere adapter trained to bias the overall image generation toward a specific texture, palette, or lighting treatment (e.g., gothic\_candlelit\_interior, paranoia\_blue\_tint\_palette).  
  * It possesses the lowest specificity requirement and the broadest application, used primarily for environments or to visually represent Paranoia Clock states.  
  * Training references consist of film stills or concept renders that establish a color treatment, entirely decoupled from any specific character.  
  * In its manifest.json, the linked\_entity points to a Paranoia Clock ID or a location ID.

---

*User prompt: {{FOCUS:  5\. Automated Pre-Training Coverage Gates & Gap Analysis }} /extreme-details*

### **Response: Repository Anatomy & Key Deliverables**

The repository topology and execution outputs of the generative foundry are structured to enforce an impassable boundary between iterative, stochastic experimentation and permanent, certified media artifacts. The file structure organizes around a strict reference state machine, automated gap analysis linters, and headless training recipes.

#### **1\. The Tri-Stage Reference State Machine (Directory Anatomy)**

Dataset curation is physically isolated from the final 04.assets/ vault and is governed by a strict three-tier directory structure.

> * **/references/raw/ (The Ingestion Buffer):** Stores unfiltered concept art, 3D viewport screengrabs, and reference photography. Every asset must possess an entry in source\_log.json detailing its base checkpoint version, generation seeds, or clearance provenance.  
> * **/references/curated/ (The Golden Ground Truth):** Houses the actively verified training set. Assets here are cropped into standardized multi-resolution buckets (512, 768, 1024), audited against the 155-color master palette, and bound to the strict Invariance Captioning Rule.  
> * **/references/rejected/ (The Negative Buffer):** Candidate images that fail structural or semantic gates are logged in rejected\_log.json with explicit failure classifications (e.g., SEMANTIC\_FAILURE, DISTINCTNESS\_COLLISION). These files are permanently retained as negative reference points to counter algorithmic bias and prevent the pipeline from re-sampling known-bad latent regions.

#### **2\. Key Deliverables & Artifact Promotion**

The pipeline functions as a programmatic factory, compiling upstream constraints into three distinct, immutable deliverables:

> * **Deliverable 1: The Golden Dataset Pool**  
  * Raw generations that achieve an algorithmic critic score of *S*≥0.92 (the top 5th percentile) are staged, captioned via a Vision-Language Model, and deposited into a cloud-hosted /golden/ dataset.  
  * To prevent Model Autophagy Disorder (MAD)—where a model collapses from recursively training on synthetic data—the pipeline enforces an Anti-Autophagy ratio. The dataset must retain a strict 60/40 anchor ratio: a minimum of 60% human-authored ground truth against a maximum of 40% synthetic golden samples.  
> * **Deliverable 2: Certified LoRA Adapters (.safetensors)**  
  * Once the /golden/ dataset accumulates 200–250 verified image pairs, an event hook automatically dispatches a headless serverless training job (using Kohya-ss or PEFT on an A100 GPU instance).  
  * The compiled .safetensors adapter is synced to the serverless ComfyUI cluster's network volume for immediate hot-reloading.  
  * The deployed LoRA is canonically registered in manifest.json, locking its lora\_id, active\_checkpoint\_hash, base\_model, trained\_on\_hardware, and consistency\_qc\_status to ensure deterministic reproducibility downstream.  
> * **Deliverable 3: Cryptographic Provenance Ledgers (C2PA)**  
  * Every inference run emits its exact deterministic parameters (seed, steps, CFG scale), cryptographic model hashes, and ComfyUI DAG topology JSON directly into a relational experience ledger.  
  * Upon final optical mastering, these artifacts are sealed into a C2PA provenance ledger, cryptographically proving the media's exact chain of custody back to the human-authored commits and specific neural weights.

#### **3\. Automated Scaffolding & CI/CD Canaries**

The repository infrastructure is guarded by automated scripts that prevent wasted compute and silently drifting hardware environments:

> * **validate-references.ts (Pre-Training Coverage Gate):** Before any GPU training compute is authorized, this script analyzes manifest.json to ensure the curated dataset contains a minimum of 5 samples per target emotion across at least 3 distinct camera angles. It populates coverage\_summary.emotions\_missing (e.g., flagging a lack of "terrified" or "exhausted" states) and blocks the pull request to prevent a blind training run.  
> * **.github/workflows/gpu-canary.yml (Monthly Infrastructure Drift):** Triggered on the 1st of every month at 04:00 UTC, this CI script executes an isolated 3-run cold-start benchmark on RunPod Serverless. It audits s5cmd cold ingress latency (asserting ≤18.0s), VRAM hydration times, and CUDA Out-Of-Memory failure rates to detect silent cloud provider drift before it impacts episodic delivery.

---

*User prompt: {{FOCUS:  1\. Headless DAG Topology & The AST Paradigm }} /extreme-details*

Response: In production generative pipelines, ComfyUI functions strictly as a headless, programmatically driven tensor execution runtime. When visual workflows are exported from the user interface via the "API Format" (workflow\_api.json), all frontend canvas metadata—including node coordinates, zoom levels, node colors, and virtual wire routing—is completely stripped away. This reduction exposes a flat, typed Directed Acyclic Graph (DAG) serialized as a key-value JSON dictionary, acting as a deterministic Abstract Syntax Tree (AST).

### **Structural Adjacency & Node Architecture**

> * **Immutable String Addressing:** Every processing node within the execution graph is addressed exclusively by an immutable string identifier.  
> * **Dependency Edge Tuples:** Node inputs are strictly defined as either literal primitive values or dependency edge tuples formatted as \[source\_node\_id, output\_index\].  
> * **Topological Sorting:** Upon dispatch, the execution engine performs a strict topological sort on the submitted DAG to establish the execution sequence.

### **Dynamic Workflow Ingestion**

> * **The Blind Execution Target:** The media-broker (or rig2-broker) operates ComfyUI as a blind execution target rather than an interactive application.  
> * **Parameter Injection:** The broker programmatically builds and injects variables directly into these JSON graphs before dispatching them.  
> * **The Dumb Executor Principle:** The GPU foundry receives only an immutable integer frame budget calculated upstream, injects it into an allowlisted workflow template, and allocates the exact latent tensor depth required for denoising.

### **Dirty-State Hashing & Execution Telemetry**

> * **Memory Pointer Reuse:** The ComfyUI runtime determines dirty states by hashing node inputs alongside their upstream dependencies. If the node IDs and inputs remain static from a prior run, the execution engine skips recalculation entirely and reuses cached memory pointers.  
> * **Telemetry Discrimination:** Because unchanged nodes skip computation, execution telemetry monitored over WebSockets must explicitly capture execution\_cached events.  
> * **Ledger Attribution:** When mutating seeds or parameters, the orchestrator must accurately distinguish between a node that genuinely re-executed and one that yielded cached pointers, ensuring the experience ledger does not record false causal relationships.

---

*User prompt: {{FOCUS:  A. Level 1: Static Template Ingestion & Hydration }} /extreme-details*

### **Response: Level 1: Static Template Ingestion & Hydration**

ComfyUI executes its generative visual passes via a Directed Acyclic Graph (DAG). When these workflows are exported from the visual interface using the "API Format," all frontend presentation metadata—such as canvas positions, node colors, and virtual wire routing—is entirely stripped away. This reduction leaves a clean, topological schema represented strictly as a flat JSON dictionary.

Rather than interacting with ComfyUI as a standard desktop application, the local media-broker (acting as the physical GPU foundry on Rig 2\) treats it exclusively as a blind execution target. This relationship is governed by the **Pacing Decoupling Axiom**, which dictates that the GPU foundry must remain entirely ignorant of narrative pacing, dramatic cadence, biological speech timing, and lip-sync requirements. In this pipeline architecture, audio serves as the absolute architect of time, while picture is simply an integer projection mapped to that acoustic duration.

During the ingestion and hydration phase, the media-broker functions as a "Dumb Executor". It passively receives an immutable, pre-calculated targetFrames integer inside its execution payload. The broker programmatically builds and injects this parameter—alongside any required prompt fragments or PRNG seeds—directly into the static workflow API template (e.g., wan\_greenscreen\_i2v.json). Once the JSON graph is fully hydrated with these runtime variables, the broker dispatches the payload, instructing ComfyUI to allocate and sample the exact latent tensor depth required for the scene's denoising pass.

---

*User prompt: {{FOCUS:  3\. Compile-Time Typing & Static Graph Linting (\$T\_0\$) }} /extreme-details*

Response: Native ComfyUI models connections between nodes using coarse, untyped strings such as LATENT, IMAGE, MODEL, or CONDITIONING. It cannot natively detect structural latent mismatches, such as routing a 4-channel SDXL latent into a 16-channel Wan 2.2 DiT sampler. When edges are hand-edited or programmatically mutated, it frequently introduces silent structural defects like orphaned nodes, cyclic connections, or plugging an IMAGE tensor into a LATENT socket. If left unchecked, these malformed graphs reach the GPU and cause expensive, unhandled CUDA aborts inside PyTorch during execution.

To prevent runtime crashes, the pipeline enforces a Compile-Time Type Checker that arrests malformed graphs at *T*0​ before any GPU memory is allocated. This validation operates under a fail-fast economic funnel where catching structural and syntactic defects at *T*0​ costs \$0.00. The compile-time socket type check asserts that a latent from one model family cannot feed a sampler designed for another, ensuring channel depths and families accurately match. This strictly applies the "catch it at *T*0​ for free" principle to graph wiring, turning expensive runtime GPU failures into instantaneous compile-time errors.

Before dispatch, a structural lint pass is performed to mathematically guarantee the integrity of the Directed Acyclic Graph (DAG). The structural linter ensures that every referenced node exists, all output types correctly match input socket types, and the entire graph is perfectly acyclic. Rather than relying on a hand-written table, the environment generates its node registry from /object\_info at build time. The compiler introspects this endpoint to diff installed node schemas against its builder's registry to detect custom-node drift. This ensures the type checker is correct by construction for the exact environment, capturing the introspected node-schema hash directly into the forensic environment record alongside tensor hashes and execution seeds.

---

*User prompt: {{FOCUS:  5\. Loopback REST Dispatch, WebSockets, & Sentinel Tapping }} /extreme-details*

Response: The media-broker daemon acts as a local telemetry bridge on Rig 2, interfacing with ComfyUI's internal aiohttp server exclusively through loopback addressing to isolate execution from the public internet.

### **The Pre-Dispatch Telemetry Tap & REST Injection**

Before any tensor evaluation begins, the broker taps into the generative event bus by opening a local WebSocket connection to ws://127.0.0.1:8188/ws?clientId=\<daemon\_uuid\>. Establishing this socket *prior* to dispatch guarantees that early lifecycle events, such as CLIP text encoding or graph parsing, are not dropped. Once the telemetry socket is active, the broker compiles the execution payload into ComfyUI's native JSON DAG format and executes an HTTP POST to \[http://127.0.0.1:8188/prompt\](http://127.0.0.1:8188/prompt) with the hydrated graph.

### **Real-Time Event Normalization & Binary Suppression**

ComfyUI emits raw, unformatted node execution events over its WebSocket bus. The media-broker intercepts these raw signals, sanitizes them, and translates them into a strict domain-specific telemetry vocabulary designed for the edge-director and upstream viewports.

> * **State Translation:** The raw execution\_start event translates to TASK\_INITIALIZED. Incremental progress events are mapped into standardized BROKER\_PROGRESS JSON packets containing normalized step counts, percentage completion, the active processing node (e.g., KSamplerAdvanced), and real-time VRAM allocation metrics.  
> * **Hardware Fault Detection:** The broker tracks execution\_cached events for memory pointer reuse and traps execution\_error signals (such as CUDA OOM aborts) to immediately trip edge circuit breakers.  
> * **Binary Stream Filtering:** During sampling, ComfyUI transmits intermediate latent preview frames as raw binary WebSocket packets. The local broker inspects incoming message types and suppresses these binary streams, bypassing or stripping the initial 8-byte headers to prevent transient data blocks from corrupting text-based JSON parsers or saturating the outbound cloudflared tunnel.

### **The Thread-Isolated Heartbeat Loop**

To prevent the remote Cloudflare Durable Object from assuming the local hardware has crashed during a multi-minute render, the media-broker maintains a decoupled, thread-isolated background timer. This loop emits a BROKER\_HEARTBEAT packet containing VRAM metrics every 10 seconds. This telemetry travels up the persistent outbound tunnel to the edge, continuously resetting the remote 30-second watchdog alarm without blocking the local Node.js event loop.

### **The Completion Sentinel Trap**

The local execution pass does not rely on arbitrary timeouts; it terminates exclusively via a deterministic sentinel event. The media-broker watches the active WebSocket stream for the terminal payload {"executing": {"node": null}}. Intercepting this specific sentinel signals that ComfyUI has finished rendering and safely written the .mp4 file to the local scratch disk, which immediately triggers the broker's post-render egress engine to audit the asset and stream it to Cloudflare R2.

---

*User prompt: {FOCUS:  5\. Downstream Assembly & Optical Integration (Remotion on Rig 1\) }} /extreme-details*

Response: The downstream assembly and optical integration phase functions as a software-defined digital optical printing press operating exclusively on the Rig 1 workstation. Rather than relying on manual non-linear editors (NLEs) like Premiere or After Effects, worker-sower-conductor programmatically composites raw \#00FF00 character diffusion plates, static matte backgrounds, and audio stems into a final broadcast-ready deliverable.

### **1\. Hardware Demarcation & The Zero-VRAM Invariant**

Optical assembly enforces a strict hardware boundary: it executes entirely within multi-core CPU threads and system RAM on Rig 1, consuming exactly 0 MB of dedicated GPU VRAM. Spawning headless Chromium browser instances alongside active PyTorch diffusion pipelines on Rig 2 causes memory thrashing, driver context losses, and CUDA Out-Of-Memory (OOM) crashes. Therefore, all DOM rasterization and optical compositing are quarantined to Rig 1, preserving Rig 2 exclusively for tensor operations.

### **2\. Metaprogrammed Source Baking (generate-episode-repo.ts)**

To prevent race conditions or non-deterministic visual drift at runtime, the conductor executes generate-episode-repo.ts to operate as an offline compiler. It ingests the JSON execution contracts and generates a static, immutable React component tree (Episode\_XXX.tsx).

> * **Immutable Temporal Budgets:** Sequence durations and timeline offsets are hardcoded directly into the TSX as static integers (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>), stripping Remotion of any dynamic duration guessing.  
> * **Adapter Trimming:** If the diffusion plate required 77 frames to satisfy a 4*n*\+1 causal VAE lattice, but the audio requires exactly 75 frames, the React component explicitly trims the tail slack via trimEndFrames={2}.

### **3\. Headless CLI Execution & Software Rasterization**

The master assembly is rasterized by spawning @remotion/renderer as a headless child process with explicit execution flags designed to prevent Linux memory leaks:

> * \--gl=swangle: Bypasses hardware GPU ANGLE acceleration, forcing Chromium to use SwiftShader for software OpenGL rasterization entirely in system memory.  
> * \--concurrency=1: Locks the renderer to a single worker, bounding system memory consumption and eliminating race conditions across frames.  
> * \--offthreadvideo: Offloads media decoding to isolated background FFmpeg child processes, protecting the main Chromium heap from bloating during multi-shot sequences.

### **4\. The Four-Layer Compositing Stack**

During frame capture, Remotion constructs the visual scene through a strict four-layer optical hierarchy:

> 1. **Layer 1 (The Environment):** A static 2048x1152 hand-painted matte background with affine camera transforms applied.  
> 2. **Layer 2 (Practical Atmosphere):** Vector motion effects and practical environmental loops (e.g., drifting fog, rain) conforming to the zero-diffusion text rule.  
> 3. **Layer 3 (The Character Plane):** The keyed \#00FF00 diffusion plate or 2D cutout puppet (GoblinPuppet.tsx). Remotion applies algorithmic despill filters to strip green edge fringing.  
> 4. **Layer 4 (Optical Mastering):** Offline post-processing that unifies the disparate layers using programmatic camera transforms (pans, high-frequency shakes), 3D LUTs, film grain, and halation.

### **5\. Acoustic Geometry & Dynamic Ducking**

In this pipeline, audio operates as the non-negotiable master clock. Spoken dialogue tracks directly drive the gain automation of the ambient foley beds. Remotion applies a programmatic, real-time sidechain ducking envelope that drops the continuous background ambiance (e.g., industrial rain) to a rigid **\-14 dB** floor, executing a 6-frame attack and a 12-frame release around active speech waveforms.

### **6\. Canon Sealing & Cryptographic Provenance**

Upon successful rasterization of the master MP4, the conductor seals the episode's state. It drains uncommitted staging memory deltas from the edge Durable Object and writes an Ed25519-signed Git commit to the local ledger. The output video is anchored by a render\_manifest.json sidecar, cryptographically binding the MP4 digest to the exact commit SHAs, audio binary hashes, and *H*root​ of the upstream clusters.

---

*User prompt: {{FOCUS:  Welding Characters to the Stage }} /extreme-details*

Response: Automated 2D procedural puppet systems frequently suffer from the "Decapitation Defect" or "floating puppet anomaly," a visual failure that occurs when local sprite coordinate offsets are applied directly to a global composition viewport without calculating proper stage projection, scaling, and camera interpolation. Welding characters to the stage physically anchors them into the composition using a strict set of spatial invariants, coordinate mathematics, and pre-compiled React constraints.

### **The Ground Contact Pivot**

To prevent foot-sliding across animation cuts, vertical stage placement is strictly bound to a floor plane invariant, expressed as *Y*stage​≡*Y*ground​. The pipeline establishes a sub-pixel floor-plane registration point for each character using an anchor\_point.

When mapping a character sprite to the stage, the layout engine calculates translation coordinates to ensure characters of varying heights make solid contact with the floor. The math dictates that TranslateX=*X*stage​−(anchor\_point.x×*s*) and TranslateY=*Y*ground​−(anchor\_point.y×*s*), where *s* is the active layout scale. This formula guarantees that when a puppet switches between different emotional variants (such as shifting from an idle stance to a humiliated posture), the character's feet remain locked to the stage horizon without any vertical jitter or ground slippage.

### **Camera Focus & Decapitation Prevention**

When high-tension dramatic beats trigger automated camera directives like a crash zoom, scaling the camera to the center of the canvas frequently pushes the character's face entirely off-screen.

> * **Focal Centroid Targeting:** The system extracts a crash\_zoom\_target coordinate from the character's manifest, pinpointing the specific location of the character's eye centroid or the bridge of their nose.  
> * **Global Canvas Projection:** Remotion relies on CSS transformOrigin, which expects global canvas percentages. Applying local pixel coordinates directly would cause the camera to frame empty space.  
> * **Coordinate Conversion:** The compiler converts local space (e.g., 1024x1024) into master canvas space (e.g., 1920x1080) at bake time. It calculates the global target via *X*target\_global​\=TranslateX+(crash\_zoom\_target.x×*s*).  
> * **Percentage Normalization:** The target is converted into percentages: originXglobal​\=(*W*canvas​*X*target\_global​​)×100% and originYglobal​\=(*H*canvas​*Y*target\_global​​)×100%. By pinning these exact percentages to the layout containers, crash zooms center precisely on the character's face without decapitating shorter cast members.

### **Kinetic Physics and The Mechanical Metronome**

To counteract the "mechanical metronome" defect—where every procedural character bobs, bounces, and reacts using identical, hardcoded sine-wave math—the architecture relies on animation\_hints. These are dynamic scalar parameters injected into the character manifest that encode biological mass, weight, and temperament directly into numeric constants.

Constants like talk\_bounce\_amplitude and idle\_shiver\_amplitude dictate how the puppet moves. If a character enters a terrified or neuropathic state, the system elevates the idle\_shiver\_amplitude using deterministic pseudo-random jitter, entirely avoiding the need to render bespoke, per-frame shiver sprites. Additionally, multi-frequency translation noise can simulate handheld camera jitter without requiring extra GPU rendering passes, breaking the sterility of synthetic staging.

### **Deterministic Validation and Source-Baking**

Before these spatial parameters are ever rendered, they pass through a cheap, deterministic post-extraction validation gate. This script checks that the coordinates sit within the canvas bounds and verifies that the anchor\_point lands on an opaque pixel rather than floating in transparent space.

Once validated, these layout parameters, binary checksums, and anchor coordinates (e.g., \<Puppet 198 412, anchorX="{518}" anchorY="{980}" x: y: zoomTarget="{{" }}/\>) are stamped directly into immutable TSX components at compile time. Hardcoding these values as static literals eliminates runtime trigonometric calculations during rendering, rendering the final composition offline-capable, completely deterministic, and physically immune to downstream asset mutations.

---

*User prompt: {{FOCUS:  Deliverable 1: Trained Model Checkpoints (.safetensors) }} /extreme-details*

Response: Certified model checkpoints (.safetensors) represent the foundational neural weights and specialized adapter files that drive the physical sensory projection within the generative production pipeline. These deliverables encapsulate both foundational diffusion models (such as Wan 2.2 or Flux) and highly specific, studio-trained Low-Rank Adaptations (LoRAs) that lock character identities, wardrobe configurations, and cinematic styles into reusable mathematical matrices. Because these artifacts dictate the visual and structural boundaries of every generated frame, their creation, validation, and storage are governed by an uncompromising lifecycle architecture.

### **1\. Autonomous Distillation & Training Triggers**

Rather than relying solely on manual dataset curation, the pipeline actively distills its own production exhaust into specialized downstream weights.

> * The system monitors the /golden/ dataset, which accumulates generated frames that have successfully passed an algorithmic quality threshold of *S*≥0.92 and a multimodal semantic audit.  
> * Once this staging directory accumulates a critical mass of 200 to 250 verified image pairs, an automated event hook is triggered.  
> * This hook dispatches a headless serverless training job, utilizing libraries such as Kohya-ss or PEFT, executed on high-compute instances like an NVIDIA A100 GPU.

### **2\. The Anti-Autophagy Governance Barrier (60/40 Rule)**

Feeding automated synthetic outputs back into a model's own training set risks Model Autophagy Disorder (MAD)—a catastrophic feedback loop that flattens visual variance, eliminates tail distributions, and introduces compounding physical artifacts.

> * Before any serverless GPU compute is scheduled, the pipeline enforces a strict base data anchor ratio.  
> * The training payload must consist of a minimum of 60% human-authored ground truth (such as 3D viewport renders or primary artist drawings) and a maximum of 40% synthetic golden dataset generations.  
> * This ratio mathematically anchors the neural network to canonical human intent, preventing the model from collapsing into a homogenized synthetic baseline.

### **3\. The Shadow Canary Bake-Off**

Newly minted .safetensors adapters are treated as untrusted artifacts that must prove their stability before touching the active production cluster.

> * The newly trained candidate adapter is forced to execute 100 headless shadow canary runs against a locked baseline benchmark suite, operating alongside active production traffic.  
> * The system computes the hard-gate failure rate of these canary runs.  
> * If the candidate LoRA spikes a deterministic failure rate that is \>10% higher than the current active production model, the pipeline instantly aborts the promotion and automatically quarantines the weights.

### **4\. Cryptographic Human Sign-Off (Gate 5\) & Hot-Reloading**

Models that survive the shadow canary suite cannot deploy themselves; an unreviewed mid-season model swap is the primary vector for silent visual identity drift.

> * Once shadow metrics are confirmed stable, an A/B evaluation matrix is generated and surfaced to the Style or Art Director.  
> * Deploying the candidate .safetensors file requires an explicit cryptographic signature executed via a GitHub Pull Request review under strict branch protection.  
> * The deployment pipeline authenticates this approval by extracting the reviewed\_by\_user and git\_pr\_number directly from the GitHub API, mathematically preventing synthetic agents from forging sign-off credentials.  
> * Upon successful verification of the signature, the system executes a live hot-reload, syncing the .safetensors payload directly into the ComfyUI cluster's network storage volume (/models) without requiring a service interruption or instance restart.

### **5\. Content-Addressed Storage & Ephemeral Hydration**

The pipeline enforces a strict "Zero-Local-Footprint" architecture, severing the multi-gigabyte .safetensors weights from the static Docker container images.

> * Model weights are tracked as immutable, content-addressed blobs stored in Cloudflare R2 or Amazon S3 buckets (e.g., s3://production-checkpoints-us-east/).  
> * Instead of copying weights into the Dockerfile, ephemeral GPU workers utilize s5cmd to execute high-speed parallel hydration.  
> * This mechanism pulls massive datasets—such as a 21.4 GB Wan 2.2 .safetensors file—over a zero-egress network pipe directly into the container's NVMe scratch disk (/workspace/ComfyUI/models/) in under 18 seconds.

### **6\. Provenance Sealing & Ledger Anchoring**

To guarantee long-term reproducibility and shield the studio from copyright liability, every checkpoint's lifecycle is permanently sealed into the production ledger.

> * All base diffusion models (such as Wan 2.2 or Parler-TTS) must pass through a Clean-Room Provenance Certificate under POD-01, verifying they operate under permissive licenses (e.g., Apache 2.0) and are free of non-commercial research restrictions.  
> * The active model pointer is managed via active\_checkpoint.json, which acts as a floating reference to the currently deployed version (e.g., bog\_lora\_v2.safetensors).  
> * When a final episode is stamped, the exact SHA-256 cryptographic digest of the .safetensors model is permanently baked into the render\_manifest.json lockfile.  
> * This operation ensures that subsequent LoRA retrainings or model upgrades can never retroactively alter or invalidate the deterministic build graph of previously broadcast episodes.

---

*User prompt: {{FOCUS:  Deliverable 2: Isolated Character Video Plates (Dual-Stream) }} /extreme-details*

### **Response: Deliverable 2: Isolated Character Video Plates (Dual-Stream)**

**Deliverable 2** constitutes the primary visual output of the heavy compute foundry (goblin-render-pipeline on Rig 2\) and serves as the raw material for optical assembly on Rig 1 (goblin-viewport-template). Because diffusion models cannot maintain background consistency across cuts (the "melting world" failure mode), characters are rendered strictly against an unlit, flat **\#00FF00 neon green void**.

The egress pipeline packages these outputs into an immutable **Dual-Stream Archival Package** dispatched directly to Cloudflare R2 storage.

### **1\. The Dual-Stream Architecture**

To balance raw tensor preservation with high-performance browser compositing, the foundry packages two distinct video files per shot:

> * **Stream A: The Raw \#00FF00 Preservation Master (MP4):**  
  * Maintains the untouched, uncompressed diffusion output rendered against the pure green void.  
  * Preserves the high-frequency tensor details and serves as the historical evidentiary record in Cloudflare R2.  
> * **Stream B: The Derived Alpha Delivery Proxy (WebM VP9 / ProRes 4444):**  
  * An 8-bit alpha video stream containing an embedded, pre-extracted transparency channel.  
  * Enables the downstream Remotion engine on Rig 1 to composite actors directly onto static matte backgrounds with zero client-side keying overhead.

### **2\. Neural Matting & Extraction Pre-Pass**

Standard browser-side color keying operates on 8-bit sRGB buffers, which inevitably introduce green edge halos, translucent fringing, and color contamination into hair, fur, and clothing fibers.

To eliminate this artifact at the source, ComfyUI on Rig 2 executes an **upstream neural matting pre-pass** before network egress:

> * **BiRefNet & Robust Video Matting (RVM):** Rendered frames are routed through specialized neural matting networks that analyze semantic silhouette boundaries, generating clean, continuous 8-bit alpha mattes directly from the latent space.  
> * **Decoupled Computation:** By performing matting inside the high-VRAM foundry environment, sub-pixel edge fidelity is locked before the asset leaves Rig 2\.

### **3\. Alpha Edge Purity Gating & Contouring**

Before any character plate is cleared for storage or downstream composition, it must survive automated pre-flight computer vision linters:

> * **The 3-Pixel Contour Scan:** Automated scripts sample the RGB color values along the outer 3-pixel contour of the character's extracted alpha boundary.  
> * **Spill Threshold Enactment:** The 99th-percentile green channel dominance across partially transparent boundary pixels must measure strictly below a defined tolerance (Spill\<12). If residual green spill exceeds this threshold, the plate is automatically flagged and rejected to prevent chroma-key fringing.

### **4\. Algorithmic Despill Fallback & Stage Integration**

If a Remotion viewport instance requires a runtime browser-side fallback key, it applies @remotion/effects colorKey() paired with mathematical despill suppression:

*G*target​\=min(*G*,2*R*\+*B*​)

> * If the green channel value exceeds the arithmetic mean of the red and blue channels, it is clamped downward. This neutralizes green edge fringing along skin tones and clothing without flattening the actor's natural color palette.  
> * The keyed plate is then bound to the stage using directional ambient light-wrap (bleeding background luminance into actor edges) and tracked dynamic contact shadows.

### **5\. Egress Hygiene & Content-Addressed Storage**

Upon completing the matting and gating passes, the dual streams undergo strict validation before entering the global asset vault:

> * **The Empty-Hash Sentinel Trap:** The egress handler computes the SHA-256 binary digest of the output files and asserts that they do not match the empty-string constant (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855).  
> * **Container Validation (ffprobe):** Spawns a local ffprobe process to verify that the MP4 and WebM container moov atoms are fully intact and that total decoded frames match the conformed frame budget.  
> * **Immutable Staging:** Verified streams are pushed to Cloudflare R2 using content-addressed staging keys (staging/renders/...), protecting historical episode builds against overwrites and ensuring \$0.00 egress distribution to Rig 1\.

---

*User prompt: {{FOCUS:  Deliverable 3: Emotion Bank Candidate Takes }} /extreme-details*

### **Response: Deliverable 3: Emotion Bank Candidate Takes & The Triage Lifecycle**

Deliverable 3 within goblin-assets-visual addresses a catastrophic failure mode in generative pipelines known as **generic emotional collapse** (or "The Beige Plague"). When diffusion models are prompted with generic emotional descriptors across different characters (e.g., "Bog humiliated" versus "Spleen humiliated"), the neural network naturally regresses toward a homogeneous, statistically generic sad-faced mean. To counteract this, candidate facial expressions and body postures are treated as structured, testable, and auditable production assets rather than ephemeral prompt outputs.

### **1\. Candidate Staging & Directory Topology**

Rather than overwriting production assets directly, the pipeline farms batches of 6 to 8 candidate takes (e.g., take\_01.png through take\_06.png) and quarantines them within an isolated staging directory indexed to the canonical condition taxonomy.

> * **The Quarantine Zone:** Candidates are deposited into characters/\<id\>/emotion\_bank/\<emotion\>/ alongside derived binary alpha masks (e.g., take\_03\_silhouette.png) for optical scanning.  
> * **The Explicit Null Protocol:** If a specific emotion has not yet been generated for a character (e.g., terrified), the directory contains an approved.json with an explicit null pointer ({ "approved\_take": null }). This prevents automated compilation pipelines from crashing and allows downstream renderers to fall back cleanly to a base\_states.idle state.

### **2\. The Three-Tier Automated Triage Gauntlet**

Before a candidate take can be promoted from the /emotion\_bank/ staging area to the active /variants/ directory, it must survive a brutal, three-tier automated verification gauntlet executed by repo-bot and the Jules multimodal agent.

> * **Tier 1: Deterministic Pixel Integrity:**  
  * **Empty-Hash Sentinel:** Computes the SHA-256 binary digest to assert the file does not match the empty-string constant (e3b0c442...).  
  * **Palette Conformity:** Asserts that 100% of the candidate's RGB values fall strictly inside the 155-color master Look-Up Table (LUT) defined in master\_palette.json.  
  * **Alpha Edge Purity:** Scans the outer 3-pixel contour of the transparency mask; the 99th-percentile green channel spill must measure \<12 to prevent chroma fringing.  
  * **Perceptual Deduplication:** Calculates a pHash cosine distance; if the distance is \>0.12, it ensures the candidate is sufficiently distinct from existing seed duplicates.  
> * **Tier 2: Adversarial Silhouette & Geometric Gates:**  
  * **The Redaction Test:** The candidate image is stripped down to a pure two-tone binary alpha mask (take\_XX\_silhouette.png). A classifier evaluates this outline, requiring a character classification entropy of *H*\<0.15 nats. This confirms the posture and slouch are entirely distinct from the rest of the cast ensemble, preventing silhouette bleed.  
  * **Viseme Centroid Drift:** Asserts that the mouth anchor offset from the base sprite satisfies ∣*mouth*\_*center*−*viseme*∣≤4*px*.  
> * **Tier 3: Jules Multimodal Semantic Auditing:**  
  * **Mandatory Attention Grounding:** To prevent ungrounded "vibes-based" approvals, the Jules VLM must emit an explicit \<visual\_scan\_trace\> pinpointing exact pixel coordinates for the eye centroid, mouth bounding box, and props before issuing a JSON verdict.  
  * **Bible Specification Alignment:** Jules directly compares the rendered expression against the character's four-dimensional Emotion Bible specification.  
  * **Distinctness Boundary Checks:** Jules validates the image against negative constraints; for example, verifying Bog's humiliation looks like "interrupted control" (tense jaw, clenched fists) and actively rejecting it if it mimics Spleen's loose-limbed slump.

### **3\. The approved.json Rejection Ledger**

When triage concludes, the system creates an approved.json file inside the emotion directory, serving as the authoritative audit lockfile. Crucially, rejected candidates are **never silently deleted**.

> * **Negative Contrast Preservation:** Preserving the exact reasons for failure in the rejected\_takes array provides negative contrast data, which prevents future LoRA training runs from sampling identical flawed latent regions.  
> * **The Rejection Taxonomy:** Failures are strictly categorized as SEMANTIC\_FAILURE (contradicts the psychological subtext), DISTINCTNESS\_COLLISION (lacks differentiation from the same character's other poses), CROSS\_CHARACTER\_BLEED (steals silhouette cues from another cast member), or PHYSICAL\_DEFECT (chroma halos or out-of-gamut pixels).

### **4\. The Promotion Cascade & Authenticated Sign-Off**

Once a take survives the gauntlet, an atomic promotion cascade finalizes the asset for downstream consumption.

> * **Cryptographic Sign-Off:** The approval cannot be a simple string (e.g., "approved\_by": "art\_director") written by an automated agent. Genuine sign-off is enforced via a GitHub Pull Request review under strict branch protection, with the approved\_by\_user and pull\_request\_number read directly from the GitHub API.  
> * **Asset Migration & Anchor Extraction:** The winning file (e.g., take\_03.png) is atomically copied to variants/{character}\_{emotion}.png.  
> * **Manifest Synchronization:** The pipeline seals the file's SHA-256 hash and extracts the verified optical anchors (eye centroid, mouth bounding box, ground contact point) directly into the character's root manifest.json. This ensures that the moment the asset becomes available to the downstream Remotion compositor, its mathematical layout contract is perfectly synchronized.

---

*User prompt: {{FOCUS:  Now look at the beginning of the converstation  and create a summary of all of the information  untill the last reponse for the {Goblin Render Pipeline} }} /extreme-details*

### **Response: 1\. Architectural Mandate & Hardware Demarcation**

goblin-render-pipeline operates within Cluster 03.foundry/ as the stochastic, GPU-intensive tensor execution engine of the generative production pipeline. It is governed by a strict **Workstation Split Architecture**:

> * **Rig 1 (The Orchestrator):** Handles narrative state, Remotion optical compositing, and audio synthesis using multi-core CPUs and system RAM, possessing **0 MB of VRAM**.  
> * **Rig 2 / Cloud Foundry (The Synthesizer):** Dedicated high-VRAM hardware (≥24 GB RTX 3090/4090/5070) executing headless ComfyUI daemons, PyTorch training runs, and potential hybrid 3D/ControlNet refinement passes.

The foundry is structurally "dumb." It possesses zero narrative, spatial, or temporal authority. It passively accepts immutable execution payloads containing pre-calculated integer frame budgets (derived from audio durations) and explicit LoRA tags, ensuring that generative models execute as untrusted rendering workers rather than storytellers.

### **2\. Training Governance & Checkpoint Sealing**

Neural adapters (LoRAs) dictating character identities, wardrobes, and cinematic moods are heavily regulated to prevent visual drift and Model Autophagy Disorder (MAD).

> * **The Tri-Stage Reference State Machine:** Raw references land in /references/raw/. Verified ground truths are cropped, color-audited, and moved to /references/curated/. Excluded images move to /references/rejected/ to serve as preserved negative exemplars against algorithmic bias.  
> * **Multi-Dimensional Curation Taxonomy:** The curation\_manifest.json strict-types reference imagery across four orthogonal axes: Camera Angle, Framing Scale, Somatic Posture, and Emotional State. Automated linters (e.g., validate-references.ts) block CI/CD pipelines if a character lacks required emotional coverage (e.g., missing \<terrified\> assets).  
> * **The Invariance Captioning Principle:** Permanent anatomical markers (bone structure, ear notches, skin tone) are deliberately omitted from training captions, forcing the network to bind them inextricably to the core identity token. Mutable features (wardrobe, lighting, props) are explicitly captioned so they can be decoupled and swapped at inference.  
> * **Promotion & Sealing:** Training sets enforce a 60/40 ratio (human-authored to synthetic data) to prevent variance collapse. Candidate .safetensors models must pass a 100-run shadow canary suite without exceeding a 10% failure spike. Upon cryptographic human sign-off via a GitHub PR, the model is hot-reloaded into the network volume, and its binary hash is sealed into active\_checkpoint.json.

### **3\. Headless ComfyUI & Execution Topology**

The pipeline completely abstracts the visual node-graph interface, treating ComfyUI purely as an Abstract Syntax Tree (AST) compilation target for programmatic dispatch.

> * **Compile-Time Linting (*T*0​):** Before any GPU memory is committed, a compiler intercepts the JSON Directed Acyclic Graph (DAG) template. It evaluates the introspected node registry to ensure structural integrity, guaranteeing that channel depths match (e.g., preventing a 4-channel SDXL latent from routing into a 16-channel Wan 2.2 DiT sampler) and catching acyclic anomalies instantly for \$0.00.  
> * **VRAM Lifecycle & Process Recycling:** To survive on 24 GB consumer GPUs without CUDA OOM crashes, execution follows a rigid turn-based eviction model. Between processing passes (Text → Audio → Video), the local media-broker issues a POST /free command and directly polls nvidia-smi until memory returns to the boot baseline (≤500 MB delta). The entire headless daemon is gracefully restarted every 25 shots to purge virtual allocator fragmentation.  
> * **The Inverted Mutex Architecture:** Cloud-edge systems never push jobs to the physical hardware. Instead, media-broker secures a local OS-level kernel lock (flock) on Rig 2 before initiating a pull request from the Cloudflare Durable Object queue. This ensures zero network latency timeouts can accidentally trigger multi-tenant allocation collisions on the silicon.

### **4\. Visual Egress & Optical Assembly**

To eliminate the "melting world" defect—where diffusion models warp background geometry across frames—generative attention is constrained purely to character silhouettes isolated against an unlit \#00FF00 void.

> * **Neural Matting & Temporal Deflicker:** Within the ComfyUI run, a BiRefNet or Robust Video Matting (RVM) pass isolates the character and generates a continuous 8-bit alpha mask. An inter-frame temporal deflicker node clamps boundary variance against the preceding frame to suppress high-frequency edge boiling.  
> * **Automated Quality Gating:** Before egress, the plate passes deterministic computer vision audits: an empty-hash sentinel trap, a 3-pixel contour scan ensuring green spill is \<12, and a silhouette redaction test verifying structural readability (entropy \<0.15). Emotion candidate generations face an even stricter gauntlet, utilizing a Vision-Language Model (Jules) to verify semantic alignment with the character's core dossier.  
> * **Stage Integration (Rig 1):** Verified dual-stream WebM alpha plates are synced to Rig 1\. Remotion mathematically anchors the character to the stage using sub-pixel anchor\_point offsets—preventing foot sliding or the "floating puppet" anomaly. Directional background light-wrapping and dynamic ground contact shadows are applied programmatically before a unified optical master (LUTs, halation, and 35mm grain) cements the final frame.

---

*User prompt: {{FOCUS:  Now expand upon that last response for the {Goblin Render Pipeline} for 3000 words }} /extreme-details *

# **Response: The Definitive Architecture of goblin-render-pipeline**

goblin-render-pipeline (operating within Cluster 03.foundry/ as camp-candor/goblin-render-pipeline, interchangeably designated with its training companion goblin-lora-training) is the heavy tensor execution and sensory manufacturing tier of the episodic media generation pipeline. It serves as the physical neural projection engine that translates upstream abstract narrative truth, somatic condition logs, and discrete audio budgets into raw visual plates and trained neural adapters.

Within the studio's constitutional ontology—which enforces a Cartesian split between Semantic Meaning (Axis A) and Media Representation (Axis B)—goblin-render-pipeline resides strictly on Axis B. It is an untrusted, headless execution worker. It possesses zero narrative authority to mutate canonical lore, zero spatial authority to alter stage topologies, and zero temporal authority to negotiate pacing. Its operational mandate is to execute stochastic neural sampling and gradient-descent optimization under deterministic, verifiable software constraints.

`====================================================================================================`  
`AXIS A: SEMANTIC MEANING & REASONING (01.canon / 02.simulation)`  
`====================================================================================================`  
`000.goblin-lore         worker-sower-engine          audio-microservice`  
`(Immutable Truth)  ──►  (Relational Ledger)     ──►  (Acoustic Master Clock)`  
                                                            `│`  
                                                            `│ ffprobe duration (ms)`  
                                                            `▼`  
                                                    `Discrete Frame Math (24 fps)`  
                                                            `│`  
                                                            `│ SpokeExecutionPayload`  
`════════════════════════════════════════════════════════════╪═══════════════════════════════════════`  
`AXIS B: SENSORY PROJECTION & ARTIFACT HARDENING (03.foundry / 04.assets / 05.delivery)`  
`════════════════════════════════════════════════════════════╪═══════════════════════════════════════`  
                                                            `▼`  
                                                `goblin-render-pipeline (Rig 2)`  
                                                `• Hardware flock(/var/lock/rig2_gpu.lock)`  
                                                `• Turn-based VRAM eviction (POST /free)`  
                                                `• Headless ComfyUI DAG execution (:8188)`  
                                                `• Isolated #00FF00 character diffusion`  
                                                            `│`  
                                                            `│ Dual-Stream Egress (Cloudflare R2)`  
                                                            `▼`  
`goblin-assets-visual    ◄─────────────────────── Isolated Character Plates`  
`(LFS Source Art Vault)                            • Raw #00FF00 MP4 Master`  
                                                  `• 8-Bit WebM VP9 Alpha Proxy`  
                                                            `│`  
                                                            `│ Asset Ingestion`  
                                                            `▼`  
                                                `goblin-viewport-template (Rig 1)`  
                                                `• Source-Baking Compiler (generate-episode-repo.ts)`  
                                                `• Remotion CLI (--gl=swangle, 0 MB VRAM)`  
                                                `• 4-Layer Optical Printing Stack`  
                                                            `│`  
                                                            `▼`  
                                                `Broadcast MP4 Deliverable`

## **1\. System Role & Hardware Demarcation**

The physical foundation of goblin-render-pipeline is governed by the **Workstation Split Architecture**. Consumer-tier hardware environments introduce a hard physical ceiling: simultaneously loading large language models, neural acoustic vocoders, headless Chromium browser engines, and high-dimensional spatio-temporal video diffusion models onto a single machine causes immediate CUDA Out-Of-Memory (OOM) aborts, display-driver context resets, and Linux kernel oom-killer terminations.

To eliminate resource competition, compute workloads are physically quarantined across machines:

`┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐`  
`│ RIG 1: ORCHESTRATION & OPTICAL ASSEMBLY│       │ RIG 2: HEAVY GPU TENSOR FOUNDRY        │`  
`│ (Zero Dedicated VRAM / Pure CPU & RAM) │       │ (Dedicated Silicon / High VRAM)        │`  
`├────────────────────────────────────────┤       ├────────────────────────────────────────┤`  
`│ • worker-sower-conductor (Node.js LTS) │       │ • Headless ComfyUI Daemon (:8188)      │`  
`│ • Local Canon DB (SQLite / Ledger)     │       │ • media-broker Controller (:3000)      │`  
`│ • Local Audio Microservice (:8000)     │  ──►  │ • 100% of VRAM dedicated to:           │`  
`│ • Temporal Quantizer (ffprobe CLI)     │ JSON  │     - Wan 2.2 / LoRA Diffusion Passes  │`  
`│ • Optical Compositor (Remotion CLI)    │  IPC  │     - #00FF00 Greenscreen Plates       │`  
`│   - Headless Chromium (--gl=swangle)   │       │ • POSIX flock(/var/lock/rig2_gpu.lock) │`  
`│   - Concurrency: --concurrency=1       │       │ • Process Isolation Invariant:         │`  
`│ • Resource Footprint: 0 MB GPU VRAM    │       │     - ZERO Chromium / Remotion Renders │`  
`└────────────────────────────────────────┘       └────────────────────────────────────────┘`

### **The Workstation Split Parameters**

| Operational Metric | Rig 1: The Conductor / Orchestrator | Rig 2 / Cloud Foundry: goblin-render-pipeline |
| :---- | :---- | :---- |
| **Physical Compute** | Multi-core CPU, 64 GB System RAM, **0 MB VRAM**. | NVIDIA GPU (≥24 GB VRAM: RTX 3090/4090/5070) or RunPod Serverless. |
| **Active Subsystems** | worker-sower-conductor, audio-microservice, SQLite, Remotion CLI. | media-broker (:3000), Headless ComfyUI (:8188), PyTorch, CUDA 12.x. |
| **Workload Cadence** | **Weekday Workload:** Lightweight simulation, CPU audio synthesis, and Remotion rendering over approved assets. | **Weekend / Burst Workload:** High-VRAM training passes, emotion candidate generation, and checkpoint baking. |
| **Prohibited Tasks** | ❌ **Zero GPU diffusion sampling**. ❌ **Zero model training**. | ❌ **Zero Chromium / Remotion execution**. ❌ **Zero SQLite ledger authority**. ❌ **Zero audio waveform clocking**. |
| **Networking** | Internal client connecting to Cloudflare Edge Gateway. | **Zero inbound public ports**; outbound cloudflared tunnel to Edge Durable Objects. |

### **The Pacing Decoupling Axiom**

The operational relationship between Rig 1 and Rig 2 is governed by the **Pacing Decoupling Axiom**: *The physical GPU foundry must remain entirely blind to narrative pacing, dramatic cadence, biological speech timing, and lip-sync requirements*.

In traditional visual effects pipelines, animators stage shots and force audio editors to cut or time-stretch audio stems to match visual cuts. In this automated generative pipeline, that dependency is inverted. Speech audio is the absolute physical master clock: continuous sound duration dictates the physical cut, while picture is merely a discrete integer projection mapped onto that acoustic window.

Before goblin-render-pipeline is dispatched, the upstream conductor on Rig 1 probes the uncompressed vocal .wav stems synthesized by audio-microservice using ffprobe. The continuous millisecond duration is converted into a discrete integer frame budget at 24 fps:

masterDeliveryFrames=⌈(1000duration\_ms​)×24⌉

Spatiotemporal video diffusion models (Wan 2.2, HunyuanVideo) downsample time across a 3D causal VAE lattice (4× temporal downsampling). The conductor calculates the conformed lattice allocation (4*n*\+1):

diffusionAllocation=4×⌈4masterDeliveryFrames−1​⌉\+1

goblin-render-pipeline acts as a "Dumb Executor". It receives the diffusionAllocation integer inside a declarative SpokeExecutionPayload, injects it into a headless ComfyUI workflow template, allocates that exact 5D latent tensor depth, and samples the pixels. It has no awareness of who is speaking, what jokes are being delivered, or where the narrative beat falls.

## **2\. LoRA Training Systems & Checkpoint Governance**

Because diffusion adapters cannot be regenerated bit-for-bit from mathematical seeds alone due to non-deterministic CUDA execution and floating-point drift, model training and checkpoint releases are managed under strict, auditable governance.

`goblin-lora-training/`  
`├── /character`  
`│   └── /<character-id>/                  # e.g., /bog`  
`│       ├── /references`  
`│       │   ├── /raw                      # Ingestion buffer (3D rips, concept art, sketches)`  
`│       │   │   ├── raw_001.png`  
`│       │   │   └── source_log.json       # Ingestion provenance, base models, licensing`  
`│       │   ├── /curated                  # Verified training ground truth`  
`│       │   │   ├── curated_001.png`  
`│       │   │   └── curation_manifest.json`  
`│       │   └── /rejected                 # Preserved negative exemplars`  
`│       │       └── rejected_log.json     # Tagged failure taxonomy (e.g., identity_drift)`  
`│       ├── /training_runs`  
`│       │   ├── /v1                       # Frozen run configs, logs, adapter binaries`  
`│       │   │   ├── training_config.json`  
`│       │   │   ├── <char>_lora_v1.safetensors`  
`│       │   │   └── sample_outputs/`  
`│       │   └── /v2/`  
`│       └── active_checkpoint.json        # Floating pointer consumed by runtime workers`  
`├── /schemas`  
`│   └── lora-manifest.schema.ts           # Strict Zod validation contracts for curation ledgers`  
`└── LORA_TYPES.md                         # Operational rules across adapter classes`

### **The Tri-Stage Reference State Machine**

To protect downstream production environments from multi-gigabyte bloat, raw training artifacts are quarantined behind an immutable three-stage reference lifecycle:

> 1. **/references/raw/ (Ingestion Buffer):** Raw concept art exports, artist turnarounds, or 3D viewport screengrabs. Every asset requires an entry in source\_log.json detailing model seeds, base checkpoint versions, or third-party licensing notes to eliminate copyright and attribution liability at the root.  
> 2. **/references/curated/ (Active Set):** The verified ground truth. Assets are cropped across standardized multi-resolution buckets (512, 768, 1024), color-audited against the 155-color master palette (master\_palette.json), and bound to caption tokens.  
> 3. **/references/rejected/ (Negative Contrast Buffer):** Excluded candidate files are **never deleted**. Every discard is cataloged in rejected\_log.json with structured failure categories (SEMANTIC\_FAILURE, DISTINCTNESS\_COLLISION, PHYSICAL\_DEFECT, identity\_drift, motion\_jitter). Retaining these failure exemplars provides negative guidance contrast to counteract algorithmic bias and Model Autophagy Disorder (MAD).

### **Multi-Dimensional Curation Taxonomy (curation\_manifest.json)**

To prevent the LoRA from flattening three-dimensional structure or over-indexing on a single neutral pose, curation\_manifest.json tracks every reference image across four orthogonal axes:

`{`  
  `"dataset_version": "2.1.0",`  
  `"character_id": "bog",`  
  `"base_checkpoint": "sdxl-1.0",`  
  `"palette_enforcement_profile": "master_palette_155.json",`  
  `"total_curated_images": 48,`  
  `"curated_references": [`  
    `{`  
      `"file_id": "curated_014.png",`  
      `"sha256": "8a3f4e2b01c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9",`  
      `"camera_angle": "three_quarter_low_angle",`  
      `"shot_framing": "medium_close_up",`  
      `"somatic_pose": "idle_slouch",`  
      `"primary_emotion": "humiliated",`  
      `"emotion_variant": "interrupted_control",`  
      `"lighting_profile": "harsh_underwater_sodium_lamp",`  
      `"palette_verified": true,`  
      `"caption_tokens": [`  
        `"bog_goblin",`  
        `"male",`  
        `"three-quarter angle",`  
        `"low angle",`  
        `"medium close-up",`  
        `"tattered pantry apron",`  
        `"humiliated expression",`  
        `"clenched jaw",`  
        `"harsh sodium lighting"`  
      `]`  
    `}`  
  `]`  
`}`

> * **Camera Angle (Orientation):** Prevents the adapter from baking a single 2D plane into its latent space. Requires multi-angle representation: profile\_left, profile\_right, three\_quarter\_left, three\_quarter\_right, frontal, high\_angle\_down, and low\_angle\_up.  
> * **Framing Scale:** Establishes detail focus across shot scales. Bounded to extreme\_close\_up (viseme and facial skin grain), close\_up (expression baseline), medium\_shot (gesture mechanics and arm bounds), and full\_body (locomotion and proportion balance).  
> * **Somatic Posture & Gesture:** Bound to physical baselines (e.g., idle\_slouch, clutching\_siphon, hands\_pinned\_to\_ribs).  
> * **Emotional State & Tone:** Mapped directly to upstream condition taxonomies (humiliated, smug, terrified, exposed).

### **Captioning Architecture & Token Binding Mechanics**

How reference images are captioned determines whether traits become permanently fused to character identity or remain dynamically controllable at inference:

                  `THE INVARIANCE CAPTIONING PRINCIPLE`  
                    
   `┌────────────────────────────────────────────────────────┐`  
   `│                  TRAINING IMAGE INPUT                  │`  
   `│  • Character: Bog (distinct jaw, bald head, ear scar)  │`  
   `│  • Costume: Tattered pantry apron                      │`  
   `│  • Prop: The Good Silver Spoon                         │`  
   `│  • Lighting: Deep blue ambient shadow                  │`  
   `└───────────────────────────┬────────────────────────────┘`  
                               `│`  
                `What gets captioned vs. omitted?`  
                               `│`  
            `┌──────────────────┴──────────────────┐`  
            `▼ OMIT FROM CAPTION                   ▼ EXPLICITLY CAPTION`  
   `[ Identity & Anatomy ]                [ Mutable Context & Wearables ]`  
   `• Facial bone structure               • "tattered pantry apron"`  
   `• Skin tone and ear notch             • "holding silver spoon"`  
   `• Eye placement and size              • "deep blue shadow"`  
            `│                                     │`  
            `▼                                     ▼`  
   `Model permanently binds               Model decouples these features`  
   `these traits to trigger token:        from the trigger token, allowing`  
   `bog_goblin                            them to be swapped at inference`

> * **The Invariance Principle:**  
  * **Omitted from Captions:** Permanent anatomical traits (bone structure, ear notches, scars, baseline skin texture) must be omitted. The diffusion optimizer binds these uncaptioned permanent traits directly to the rare trigger token (bog\_goblin).  
  * **Explicitly Captioned:** Removable wardrobe, held props, background environments, and lighting angles are exhaustively captioned. This decouples them from the character trigger token, allowing them to be swapped at inference time via prompt directives.  
> * **Caption Dropout Regularization:** Training configs enforce a 5% caption dropout (caption\_dropout \= 0.05). During 5% of training steps, captions are dropped completely, forcing the model to reconstruct the entire scene from the base trigger token alone, reinforcing overall character identity cohesion.

### **Classification Taxonomy of LoRA Types (LORA\_TYPES.md)**

Adapters are strictly typed to prevent applying incorrect QC metrics across heterogeneous generative domains:

| LoRA Type | Consistency Bar | Scope & Training Rigor | Usage Mechanics |
| :---- | :---- | :---- | :---- |
| **character** | **Highest** | Full emotion bank references, multi-angle coverage, 155-color palette lock. Matches canonical character\_id. | Permanent visual identity. Uses character trigger token (e.g., bog\_goblin). |
| **fashion** | **Moderate** | Specific worn items or outfit variants (e.g., tattered\_pantry\_apron). | Stacked on top of character LoRAs. Minor visual drift is acceptable as it is a modifier, not an identity. |
| **object** | **High Identity / Low Expression** | Narrative props (e.g., "The Good Silver Spoon", recurring letters). | Ensures audience recognizes the identical item across scenes; does not require emotional/pose range. |
| **mood** | **Broad / Low Specificity** | Atmospheric style, lighting profiles, and Paranoia Clock visual states (e.g., blue-tint fear treatments). | Biases overall palette and texture; applies across disparate characters and environments. |

### **Automated Pre-Training Coverage Gates & Gap Analysis**

Before any compute is dispatched, validate-references.ts executes automated static audits against curation\_manifest.json and the target character's emotion taxonomy:

> * **Dimensional Density Gates:** Mandates ≥5 reference samples per target emotion across at least 3 distinct camera elevations.  
> * **Coverage Gap Detection:** If an emotion lacks necessary reference assets, validate-references.ts writes to coverage\_summary.emotions\_missing and blocks training configuration generation in CI/CD PR checks:  
>   `> ⚠️ Training Blocked: Cannot compile training config for bog_lora_v2.`  
>   `> Missing required visual ground truth for conditions: ['terrified', 'exhausted'].`

> * **Perceptual Deduplication:** Computes perceptual hashes (pHash) and feature distance embeddings. Any candidate take exhibiting \>0.85 cosine similarity against the existing dataset is pruned to prevent overfitting on identical frames.  
> * **The Anti-Autophagy Ratio (60/40 Rule):** Recursive training on unanchored synthetic outputs causes Model Autophagy Disorder (MAD), producing variance collapse, plastic skin textures, and anatomical hallucinations. Every curated dataset must maintain **at least 60% human-authored ground truth** (drawings, manual turnarounds, 3D viewport renders) and **no more than 40% synthetic diffusion outputs**.

### **Automated Distillation, Shadow Canaries, and Gates 4 & 5**

When goblin-render-pipeline utilizes production exhaust to retrain candidate adapters, it enforces a two-tier evaluation gauntlet:

`Active Generative Passes (ComfyUI / RunPod)`  
                     `│`  
                     `▼`  
       `Cascaded Verifier Funnel`  
                     `│`  
         `┌───────────┴───────────┐`  
         `▼ S >= 0.92             ▼ Severe Failure`  
   `/staging/ Bucket      Negative Exemplar Buffer (identity_drift, etc.)`  
         `│`  
         `▼`  
`Uncertainty-Weighted Active Sampling (Video-LLM: 3 passes @ T=0.7)`  
         `│`  
         `├── High Variance / Borderline (0.91 <= S <= 0.93)`  
         `│   └──► [HUMAN GATE 4: Spot-Check Queue]`  
         `│`  
         `└── High Confidence / Unanimous Pass`  
             `└──► Admitted to /golden/ Dataset`  
                      `│ (Accumulates 200–250 verified pairs)`  
                      `▼`  
             `Automated Serverless Training (Kohya-ss / PEFT; 60/40 Anchor)`  
                      `│`  
                      `▼`  
             `Headless Shadow Canary Suite (100 runs against baseline benchmark)`  
                      `│`  
                      `▼ Deterministic Hard Gates Hold (Failure Spike <= 10%)`  
             `[HUMAN GATE 5: LoRA Promotion Sign-off]`  
                      `│ (Cryptographic GitHub PR Review Signature)`  
                      `▼`  
             `ComfyUI Hot-Reload via API (Network Volume)`

> 1. **Uncertainty-Weighted Active Sampling (Human Gate 4):** Frames clearing automated scoring (*S*≥0.92) pass to a staging bucket. A multimodal Video-LLM evaluates candidates across 3 passes at *T*\=0.7 with permuted frame orders. High-variance or borderline takes (0.91≤*S*≤0.93) divert to the human supervisor's queue, while unanimous passes advance to /golden/.  
> 2. **Automated Serverless Training:** Once /golden/ accumulates 200–250 verified pairs, an automated serverless job trains a candidate adapter preserving the 60/40 anchor-to-synthetic ratio.  
> 3. **Headless Shadow Canary Suite:** The candidate adapter executes 100 headless shadow canary runs alongside production traffic against a locked baseline benchmark. If its deterministic hard-gate failure rate spikes \>10% compared to baseline, promotion aborts and the weights are quarantined.  
> 4. **Human Gate 5 Promotion:** If shadow metrics remain stable, an A/B matrix is surfaced to the Art Director. Deployment requires an authenticated GitHub PR approval under branch protection. CI reads the reviewer identity directly from the GitHub API, signing the release and hot-reloading the .safetensors binary into the shared ComfyUI storage volume without instance restarts.

### **Provenance Tracking & Downstream Ingestion Contracts**

Checkpoints maintain a decoupled relationship between training history and production rendering:

#### **Canonical Pointer (active\_checkpoint.json)**

Located at the root of each character's training directory, this pointer informs runtime workers which adapter version is active:

`{`  
  `"lora_id": "bog_character",`  
  `"type": "character",`  
  `"linked_entity": "bog",`  
  `"active_checkpoint": "training_runs/v2/bog_lora_v2.safetensors",`  
  `"active_checkpoint_hash": "sha256:4a8c9e2b10a56789abcdef0123456789abcdef0123456789abcdef0123456789",`  
  `"base_model": "sdxl-1.0",`  
  `"trained_at": "2026-08-17",`  
  `"trained_on_hardware": "rtx_5070_weekend_session",`  
  `"palette_lock_ref": "goblin-assets-visual/palette/master_palette.json",`  
  `"consistency_qc_status": "passed",`  
  `"consistency_qc_report": "training_runs/v2/qc_report.json"`  
`}`

#### **Upstream & Downstream Integration Contracts**

> * **goblin-bible:** Character and location dossiers specify valid adapter compositions (e.g., applicable\_loras: \["bog\_character", "tattered\_pantry\_apron"\]).  
> * **goblin-assets-visual:** Character manifests include a trained\_from\_lora field pointing back to the specific version in goblin-lora-training that produced currently approved renders.  
> * **Episode Freeze (render\_manifest.json):** Because active\_checkpoint.json is a floating pointer, render\_manifest.json resolves and seals the explicit cryptographic binary hash (active\_checkpoint\_hash) into the terminal DAG lockfile:  
>   Build ID=H(Canon Root+Dialogue AST+Asset Hashes+LoRA Weights SHA-256+Toolchains)  
>   This guarantees that future retrainings (e.g., releasing v3) cannot retroactively invalidate the reproducible build chain of prior broadcast episodes.

## **3\. Headless ComfyUI Generative Workflows**

In goblin-render-pipeline, ComfyUI is not operated as an interactive node canvas. It functions strictly as a **headless, programmatic tensor execution runtime** executing Directed Acyclic Graphs (DAGs) over PyTorch. Upstream orchestrators (worker-sower-conductor or media-broker) interact with ComfyUI as a blind compute worker, dispatching mathematically compiled JSON execution graphs over local REST and WebSocket interfaces.

               `NARRATIVE DIRECTIVES (dialogue_ast.json)`  
                                   `│`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                      GRAPH COMPILER ENGINE                             │`  
`│                                                                        │`  
`│  1. Ingest SpokeExecutionPayload (targetFrames, seeds, prompts)        │`  
`│  2. Allocate Monotonic Node ID Registry (Collision-free O(1) builder)  │`  
`│  3. Directive-Driven Subgraph Injection:                               │`  
`│     • Chained LoRA Loaders + Regional Masks (for multi-character)      │`  
`│     • ControlNet OpenPose/Depth blocks (for kinetic choreography)      │`  
`│  4. Causal Temporal Quantization: Enforce (4n + 1) frame lattice       │`  
`│  5. Transpilation Target: Rig 2 (GGUF + /free) vs. RunPod (FP16 batch) │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Emits workflow_api.json`  
                                   `▼`  
                   `POST http://127.0.0.1:8188/prompt`

### **Headless DAG Topology & The AST Paradigm**

Standard visual workflows bundle presentation data (canvas zoom, grid positions, color palettes, wire routes). Exporting a workflow via **"Save (API Format)"** strips all UI metadata, leaving a flat, addressable topological schema:

`{`  
  `"3": {`  
    `"class_type": "KSampler",`  
    `"inputs": {`  
      `"seed": 84920411,`  
      `"steps": 30,`  
      `"cfg": 6.0,`  
      `"sampler_name": "euler_ancestral",`  
      `"scheduler": "normal",`  
      `"denoise": 1.0,`  
      `"model": ["4", 0],`  
      `"positive": ["6", 0],`  
      `"negative": ["7", 0],`  
      `"latent_image": ["37", 0]`  
    `}`  
  `}`  
`}`

> * **Node Registry Mapping:** Every processing node is keyed by an arbitrary string identifier (e.g., "3", "6", "37") mapped to its underlying Python class (class\_type).  
> * **Dependency Edge Tuples:** Inter-node data connections are strictly declared as two-element arrays: \["\<source\_node\_id\>", \<output\_index\>\]. Primitive properties (seeds, dimensions, steps, literals) are declared directly in the inputs map.  
> * **Stateless Memory Profile:** Headless ComfyUI boots into an empty runtime state. It does not store pre-loaded recipes; it deserializes the graph JSON received in the HTTP request body, resolves dependencies, and maps tensors directly into CUDA streams.

### **Dynamic AST Graph Compilation**

To prevent a combinatorial explosion of static templates (e.g., wan\_dual\_lora\_depth\_inpaint.json), complex cinematic passes are compiled on the fly as an Abstract Syntax Tree (AST):

> * **Monotonic Node ID Allocation:** Splicing distinct subgraphs together frequently causes ID collisions. The compiler utilizes an internal monotonic counter, issuing guaranteed unique IDs in *O*(1) time:  
>   `class ComfyGraphBuilder {`  
>     `private currentId = 1;`  
>     `public nodes: Record<string, { class_type: string; inputs: Record<string, any> }> = {};`

>     `allocateNode(nodeClass: string, inputs: Record<string, any>): string {`  
>       `const id = (this.currentId++).toString();`  
>       `this.nodes[id] = { class_type: nodeClass, inputs };`  
>       `return id;`  
>     `}`  
>   `}`

> * **Regional Conditioning Subgraphs:** If the scene calls for two characters interacting (e.g., Bog and Spleen), a single prompt causes identity bleeding. The compiler injects dual LoRA loaders and spatial conditioning masks (RegionalConditioningByMask), bounding each character's weights strictly to their screen-space quadrant.  
> * **Temporal Causal Lattice (4*n*\+1 Math):** Spatio-temporal video diffusion models (Wan 2.2, HunyuanVideo) downsample time across a 3D causal VAE lattice (4× temporal downsampling). The compiler enforces this sequence (17,33,49,65,81), calculating the exact tensor allocation:  
>   diffusion\_frames=4×⌊4⌈(duration\_ms/1000)×24⌉​⌋\+1  
>   This discrete integer is bound directly to EmptyWanLatentVideo.length.

### **Compile-Time Typing & Static Graph Linting (*T*0​)**

ComfyUI treats edges as broad strings (LATENT, IMAGE, MODEL). It cannot detect structural latent family mismatches (such as routing a 4-channel SDXL latent into a 16-channel Wan 2.2 DiT sampler), leading to unhandled CUDA memory aborts.

Before any GPU memory is committed, the compiler executes a static validation pass at *T*0​:

| Latent Family | Channel Depth | Spatial/Temporal Downsampling | Target Decoder Class |
| :---- | :---- | :---- | :---- |
| **SDXL** | 4 channels | 8× spatial | VAEDecode |
| **Flux.1** | 16 channels | 8× spatial | FluxVAEDecode |
| **Wan 2.2 / 2.1** | 16 channels | 8× spatial×4× temporal | WanVideoDecode |
| **HunyuanVideo** | 16 channels | 8× spatial×4× temporal | HunyuanVideoDecode |

> * **Introspected Node Registry (/object\_info):** Rather than hardcoding node signatures, the container build queries /object\_info at startup. The compiler checks all proposed edges against node\_registry.json to verify input names, socket types, and output indices.  
> * **Acyclicity & Dead Node Sweeping:** Validates that the directed graph is fully acyclic via Kahn's algorithm, and confirms that all terminal output nodes connect back to valid root model loaders.

### **VRAM Lifecycle Governance: The Anti-Ollama Paradigm**

Hosting concurrent runtimes (e.g., running an Ollama or vLLM server on port 11434 alongside ComfyUI on port 8188\) causes fatal memory collisions. Ollama caches weights across a 5-minute keep-alive window, and ComfyUI's dynamic memory allocator cannot inspect or evict tensors held by an external OS process. When video diffusion latents are allocated, PyTorch crashes instantly with a CUDA Out-of-Memory exception.

All execution on Rig 2 is unified strictly under **ComfyUI’s native Directed Acyclic Graph** using ComfyUI-GGUF. Memory lifecycle governance enforces three execution turns:

`TURN 1: Child Graph A (Qwen 2.5 14B GGUF ~10 GB)`  
        `│`  
        `▼ (Generates dialogue_ast.json)`  
`POST http://127.0.0.1:8188/free {"unload_models": true, "free_memory": true}`  
        `│`  
        `▼ (nvidia-smi Polling Gate: Assert >21 GB VRAM Available)`  
`TURN 2: Child Graph B (Local TTS Microservice / Node ~5 GB)`  
        `│`  
        `▼ (Synthesizes .wav stems; locks target_frames)`  
`POST http://127.0.0.1:8188/free {"unload_models": true, "free_memory": true}`  
        `│`  
        `▼ (nvidia-smi Polling Gate: Assert >21 GB VRAM Available)`  
`TURN 3: Child Graph C (Wan 2.2 + Character LoRAs ~21 GB)`  
        `│`  
        `▼ (Samples uncompressed #00FF00 character plate)`  
`Clean baseline restored (Process Recycling every 25 shots)`

> 1. **Turn-Based Eviction (POST /free):** At the completion of each modal pass, the broker issues an eviction call:  
>    `await fetch("http://127.0.0.1:8188/free", {`  
>      `method: "POST",`  
>      `headers: { "Content-Type": "application/json" },`  
>      `body: JSON.stringify({ unload_models: true, free_memory: true })`  
>    `});`

>    This unbinds active model pointers and instructs PyTorch's caching allocator to release its reserved CUDA memory blocks, returning VRAM to baseline within approximately 300 ms.  
> 2. **The Asynchronous /free Hazard:** ComfyUI returns HTTP 200 OK asynchronously while tensor unmapping is still running on a background thread. Dispatching the next stage immediately results in an allocation overlap crash. The broker polls nvidia-smi directly:  
>    `nvidia-smi --query-gpu=memory.free --format=csv,noheader,nounits`

>    It halts execution until free VRAM returns to within Δ≤500 MB of the machine's calibrated boot baseline (\>21 GB available on a 24 GB card).  
> 3. **Stage-Level Batching:** Naively alternating Text → TTS → Video per shot introduces severe PCIe bus thrashing (swapping 33+ GB across PCIe lanes burns 45–90 seconds per shot). The broker groups passes by stage across an entire scene: compile all text ASTs, synthesize all audio stems, then hydrate Wan 2.2 once to render all character plates back-to-back.  
> 4. **The 25-Shot Process Recycling Governor:** Continuous execution of high-dimensional 5D spatio-temporal video latents (\[*B*,*C*,*T*,*H*,*W*\]) induces driver-level virtual memory fragmentation. To clear unmapped CUDA contexts, the broker gracefully recycles the headless ComfyUI daemon every 25 shots or at major sequence boundaries.

### **Loopback REST Dispatch, WebSockets, & Sentinel Tapping**

Execution communication between the local media-broker (port 3000\) and the headless ComfyUI daemon (port 8188\) is managed through standard loopback primitives:

 `Rig 2: media-broker (:3000)                Headless ComfyUI (:8188)        edge-director DO`  
             `│                                        │                           │`  
             `├─ Connects ws://127.0.0.1:8188/ws ─────►│                           │`  
             `│  (Taps socket BEFORE dispatch)         │                           │`  
             `│                                        │                           │`  
             `├─ POST /prompt { hydrated_graph } ─────►│                           │`  
             `│                                        ├─ Begins Sampling Pass     │`  
             `│                                        │                           │`  
             `│◄── execution_start ────────────────────┤                           │`  
             `│◄── executing (node: "37") ─────────────┤                           │`  
             `│◄── progress (value: 25, max: 50) ──────┤                           │`  
             `│                                        │                           │`  
             `├─ Normalizes to BROKER_PROGRESS ───────────────────────────────────►│ (Broadcasts to UI)`  
             `│                                        │                           │`  
             `│  [ Thread-Isolated Background Loop ]   │                           │`  
             `├─ Emits BROKER_HEARTBEAT (every 10s) ──────────────────────────────►│ (Resets 30s alarm)`  
             `│                                        │                           │`  
             `│◄── executing (node: null) [SENTINEL] ──┤                           │`  
             `│                                        ├─ MP4 written to disk      │`  
             `│                                        │                           │`  
             `├─ Intercepts Completion Sentinel        │                           │`  
             `├─ Audits local MP4 scratch file         │                           │`  
             `└─ Streams artifact to Cloudflare R2     │                           │`

> * **Pre-Dispatch Socket Tapping:** The broker establishes its WebSocket client to ws://127.0.0.1:8188/ws?clientId=\${clientId} *before* dispatching POST /prompt, preventing dropped initialization events (e.g., prompt parsing, CLIP encoding).  
> * **Binary Preview Filtering:** ComfyUI streams intermediate latent preview updates as raw binary packets over its WebSocket bus. The telemetry bridge inspects the initial byte headers, discarding raw image streams to avoid corrupting text-based JSON parsers.  
> * **Completion Sentinel Interception:** When generation concludes, ComfyUI emits the terminal sentinel { "executing": { "node": null } }. The broker catches this event, reads the rendered .mp4 from ComfyUI/output/, verifies its SHA-256 hash against empty-file constants (e3b0c442...b855), and streams the binary to Cloudflare R2.

## **4\. The Isolated Greenscreen (\#00FF00) VFX Pipeline**

The isolated greenscreen VFX pipeline solves the spatial-temporal collapse inherent in generative video diffusion models. When diffusion models render complex kinematic action against detailed environments, cross-attention latents bleed between character silhouettes and background geometry, producing the "melting world" failure mode.

goblin-render-pipeline strips environmental complexity away entirely. Diffusion compute is constrained to a pure character silhouette isolated against an unlit \#00FF00 neon green void, delegating environmental placement, perspective stability, and optical integration to deterministic downstream software engines.

                  `THE GREENSCREEN SEPARATION ARCHITECTURE`  
                    
  `STOCHASTIC FOUNDRY (Rig 2 / RunPod)         DETERMINISTIC COMPOSITOR (Rig 1)`  
`┌─────────────────────────────────────┐    ┌───────────────────────────────────┐`  
`│ Child Graph C: Wan 2.2 Diffusion    │    │ Layer 1: Bespoke Matte Background │`  
`│ • Character LoRA + Emotion Weights  │    │ • Static 2048x1152 16-bit plate   │`  
`│ • Locked frame budget: target_frames│    │ • Affine matrix camera transforms │`  
`│ • Pure #00FF00 green void           │    └─────────────────┬─────────────────┘`  
`└──────────────────┬──────────────────┘                      │`  
                   `│                                         ▼`  
                   `▼                       ┌───────────────────────────────────┐`  
`┌─────────────────────────────────────┐    │ Layer 2: Practical Atmosphere     │`  
`│ In-Engine Neural Matting            │    │ • Screen-blended fog/rain loops   │`  
`│ • BiRefNet / RVM Alpha Extraction   │    │ • Zero-Diffusion SVG text / HUDs  │`  
`│ • Temporal Alpha Deflicker Pass     │    └─────────────────┬─────────────────┘`  
`└──────────────────┬──────────────────┘                      │`  
                   `│                                         ▼`  
                   `▼                       ┌───────────────────────────────────┐`  
`┌─────────────────────────────────────┐    │ Layer 3: Keyed Character Ingestion│`  
`│ Egress Packaging & R2 Hydration     │───►│ • Pre-extracted WebM VP9 / Despill│`  
`│ • Raw #00FF00 MP4 Master            │    │ • Directional Ambient Light-Wrap  │`  
`│ • 8-bit Alpha WebM VP9 (with alpha) │    │ • Dynamic Ground Contact Shadows  │`  
`│ • Empty-hash check (e3b0c442...b855)│    └─────────────────┬─────────────────┘`  
`└─────────────────────────────────────┘                      │`  
                                                             `▼`  
                                           `┌───────────────────────────────────┐`  
                                           `│ Layer 4: Global Optical Mastering │`  
                                           `│ • Unified 3D .cube LUT / Grain    │`  
                                           `└───────────────────────────────────┘`

### **Neural Matting & Dual-Stream Egress**

Standard browser-side color keying operates on 8-bit sRGB buffers, which inevitably introduce green edge halos, translucent fringing, and color contamination into hair, fur, and clothing fibers.

To eliminate this artifact at the source, ComfyUI on Rig 2 executes an in-engine extraction pass directly before network egress:

> 1. **Neural Background Extraction:** The rendered frames pass through **BiRefNet** or **Robust Video Matting (RVM)** within ComfyUI, isolating foreground character pixels from the \#00FF00 plane and generating a clean, continuous 8-bit alpha channel.  
> 2. **Dual-Stream Archival Packaging:** The egress harness packages two distinct artifacts to Cloudflare R2:  
   * *Stream A: The Raw \#00FF00 Preservation Master (MP4):* Uncompressed, untouched diffusion output rendered against the pure green void. Preserves raw tensor data for future retraining and archival history.  
   * *Stream B: The Derived Alpha Delivery Proxy (WebM VP9 / ProRes 4444):* Pre-extracted 8-bit alpha channel embedded directly in the container. Remotion on Rig 1 composites this stream directly over static mattes with zero browser-side keying overhead.

### **The Temporal Deflicker Node (Alpha-Matte Isolation)**

Keying diffusion plates over static background plates exposes boundary chatter and sub-pixel edge boil, caused because diffusion models lack cross-frame temporal constraints on alpha contours.

To stabilize boundary vibration, the extraction pipeline routes the alpha stream into a dedicated single-channel grayscale buffer (*At*​). A localized temporal deflicker node constrains boundary variance against the preceding frame:

*At*clean​(*x*,*y*)=clamp(*At*​(*x*,*y*),*At*−1​(*x*,*y*)−*δ*max​,*At*−1​(*x*,*y*)+*δ*max​)

> * Where *δ*max​ is a dynamic threshold calibrated to the character’s active motion vector.  
> * This clamp prevents rapid 1-to-2 pixel boundary flickering while allowing deliberate kinetic movements and gross anatomical shifts to pass through cleanly.

### **Deterministic CV Gatekeeping & The Critic Funnel**

Before any generated plate is cleared for compositing, it must pass an automated inspection gauntlet:

                  `CANDIDATE DIFFUSION PLATE`  
                             `│`  
                             `▼`  
 `┌────────────────────────────────────────────────────────┐`  
 `│ TIER 1: DETERMINISTIC GEOMETRIC & PURITY GATES         │`  
 `│ • Alpha Edge Purity: 3px contour green spill < 12      │`  
 `│ • Silhouette Redaction Test: binary entropy H < 0.15   │`  
 `└───────────────────────────┬────────────────────────────┘`  
                             `│ PASS`  
                             `▼`  
 `┌────────────────────────────────────────────────────────┐`  
 `│ TIER 2: CASCADED CRITIC FUNNEL                         │`  
 `│ • LPIPS: Frame-to-frame pixel patch boiling check      │`  
 `│ • RAFT Optical Flow: Kinetic acceleration / limb tears │`  
 `│ • DINOv2 / CLIP: Cosine distance to character anchor   │`  
 `└───────────────────────────┬────────────────────────────┘`  
                             `│ PASS`  
                             `▼`  
     `Approved for Remotion Final Master Compositing`

> * **Alpha Edge Purity Gate:** Deterministic computer vision scans the outer 3-pixel contour of the character silhouette. The 99th-percentile green channel dominance across partially transparent boundary pixels must register below a strict threshold (Spill\<12); excessive spill flags the plate for re-extraction or rejection.  
> * **Silhouette Redaction Test:** Strips the character to a two-tone binary alpha mask. A shape classifier evaluates posture, limb separation, and silhouette readability; the outline must register an identity classification entropy of *H*\<0.15.  
> * **Cascaded Critic Funnel:**  
  * *LPIPS:* Detects high-frequency frame-to-frame patch divergence (texture boiling).  
  * *RAFT Optical Flow:* Flags velocity spikes, warping tearing, and disarticulated limbs.  
  * *DINOv2 / FaceID / CLIP:* Calculates the cosine embedding distance against certified character reference sheets to ensure facial bone structure and costume invariants have not drifted off-model.

### **Downstream Assembly & Optical Integration (Remotion on Rig 1\)**

Once verified alpha plates arrive at Rig 1, the conductor integrates them using the 4-layer optical printing stack inside FinalCompositeMaster.tsx:

#### **Algorithmic Despill Fallback**

If processing fallback raw \#00FF00 footage rather than pre-extracted WebM alpha, Remotion applies @remotion/effects colorKey() with mathematical despill suppression:

*G*target​\=min(*G*,2*R*\+*B*​)

If the green channel exceeds the mean of the red and blue channels, it is clamped down to eliminate green fringing along ears, clothing folds, and hair without muting the actor's actual palette.

#### **Welding Characters to the Stage**

Characters rendered in isolation lack the ambient photon bounce, directional illumination, and ground occlusion of the environment. Remotion resolves this through three programmatic operations:

> 1. **Directional Ambient Light-Wrap:** The static matte background (Layer 1\) is convolved via a 20–30px Gaussian blur, masked to an interior 3–6px rim of the character's eroded alpha silhouette, and screen-blended over the actor at 25% opacity. This bleeds the room's atmospheric color into the character's boundary, eliminating the "cardboard cutout" appearance.  
> 2. **Tracked Dynamic Contact Shadows:** Remotion projects an elliptical radial gradient using mix-blend-mode: multiply at the character’s ground contact point (anchor\_point.x, anchor\_point.y). As the character moves or speaks, the shadow dynamically scales its radius and decreases opacity in inverse proportion to vertical displacement above *Y*ground​, keeping the silhouette physically anchored to the floor.  
> 3. **Layer 4 Optical Unification:** An offline FFmpeg filtergraph applies a sub-pixel Gaussian micro-diffraction blur (0.4px) to soften harsh AI edges, an optical halation bloom on the top 5% luminance pixels (red-orange scattering), a unified 3D .cube LUT (e.g., Kodak 2383), and 14–15% opacity 35mm silver halide film grain. This glues the static digital matte painting and the generative character plate into a single, cohesive cinematic frame.

## **5\. Execution Topology & Ingress/Egress Boundaries**

The execution topology for goblin-render-pipeline governs how generative jobs move from abstract narrative intent down to physical GPU silicon and egress back out as immutable video plates. It enforces an architectural boundary between orchestrator, edge coordinator, and foundry spoke, eliminating race conditions, memory collisions, and compute waste by construction.

               `RIG 1 (ORCHESTRATOR / CONDUCTOR)`  
   `┌────────────────────────────────────────────────────────┐`  
   `│ worker-sower-conductor (:4321 / Node.js)               │`  
   `│ • CPU Only / Zero VRAM                                 │`  
   `│ • Temporal Audio Quantization (ffprobe 24 fps)         │`  
   `│ • Compiles SpokeExecutionPayload                       │`  
   `└───────────────────────────┬────────────────────────────┘`  
                               `│ HTTPS POST / Signed JWT + UUIDv7`  
                               `▼`  
            `CLOUDFLARE EDGE (POD-12: SYSTEM MIDDLEWARE)`  
   `┌────────────────────────────────────────────────────────┐`  
   `│ EdgeGateway (Hono / Cloudflare Workers)                │`  
   `│ • JWT & Two-Pass Zod Schema Validation                 │`  
   `│ • Continuity Gate: Cloudflare D1 (is_dirty == 0)       │`  
   `├────────────────────────────────────────────────────────┤`  
   `│ ShotCoordinatorDO (Durable Object)                     │`  
   `│ • Single-Threaded FIFO Mutex Queue                     │`  
   `│ • Leases: 30s TTL, 10s Heartbeat, Monotonic Epoch (N)  │`  
   `└───────────────────────────┬────────────────────────────┘`  
                               `│ Pull Semantics (Outbound cloudflared Tunnel)`  
                               `▼`  
             `RIG 2 / RUNPOD (HEAVY GPU FOUNDRY)`  
   `┌────────────────────────────────────────────────────────┐`  
   `│ media-broker (:3000 / Node.js)                         │`  
   `│ • Hardware Mutex: flock(/var/lock/rig2_gpu.lock)       │`  
   `│ • Polling Gate: nvidia-smi (Free VRAM > 21 GB)         │`  
   `│ • High-Speed Model Ingress: s5cmd from Cloudflare R2   │`  
   `├────────────────────────────────────────────────────────┤`  
   `│ Headless ComfyUI Runtime (:8188)                       │`  
   `│ • In-Memory Parameter Injection into JSON API Template │`  
   `│ • Sequential Turns (POST /free between stages)         │`  
   `│ • Monotonic 25-Shot Process Recycling Governor         │`  
   `├────────────────────────────────────────────────────────┤`  
   `│ Local Scratch & Egress Engine                          │`  
   `│ • Assert size > 0 & SHA-256 != e3b0c442...b855         │`  
   `│ • Structural Container Check (ffprobe moov atom)       │`  
   `│ • Upload to staging/renders/.../epoch_N_{hash}.mp4     │`  
   `│ • RPC: POST /tasks/complete -> Atomic DO Promotion     │`  
   `└────────────────────────────────────────────────────────┘`

### **Ingress Contracts & Schema Compilation**

Execution never ingests arbitrary scripts, untyped commands, or mutable state changes. Upstream orchestration dispatches declarative *Intents* bound strictly to strongly typed contracts:

`// packages/000.cauldron/src/contracts/SpokeExecutionPayload.ts`  
`import { z } from "zod";`

`export const SpokeExecutionPayloadSchema = z.object({`  
  `type: z.literal("ENQUEUE_SHOT"),`  
  `jobId: z.string(),                             // e.g., "EP101_SC02_SH003"`  
  `artistId: z.string(),                          // Tenant / Machine ID`  
  `idempotencyKey: z.string().uuid(),             // UUIDv7 unique dispatch key`  
  `workflowTemplate: z.enum([`  
    `"wan_greenscreen_i2v.json",`  
    `"flux_matte_background.json",`  
    `"inpaint_repair.json"`  
  `]),`  
  `payload: z.object({`  
    `sceneId: z.string(),`  
    `shotId: z.string(),`  
    `prompt: z.string(),                          // Base prompt + ", chroma key #00FF00"`  
    `negativePrompt: z.string(),                  // Clutter, real background, photorealism`  
    `loraTag: z.string(),                         // Target character LoRA key on disk`  
    `targetPromptNodeId: z.string().default("6"), // CLIPTextEncode Node ID`  
    `targetFrameNodeId: z.string().default("37"), // EmptyWanLatentVideo Node ID`  
    `targetSeedNodeId: z.string().default("3"),   // KSampler Node ID`  
    `diffusionAllocation: z.number().int(),       // Conformed 4n + 1 frame lattice`  
    `masterDeliveryFrames: z.number().int(),      // Target 24fps frame count`  
    `seed: z.number().int().nonnegative()         // Immutable PRNG seed`  
  `})`  
`});`  
`export type SpokeExecutionPayload = z.infer<typeof SpokeExecutionPayloadSchema>;`

#### **Edge Continuity & Dirty-State Invalidation Gate**

When Rig 1 posts the payload to the EdgeGateway (src/index.ts via Hono), the gateway enforces a pre-flight relational continuity audit against Cloudflare D1 within 5 ms:

`SELECT COUNT(*) AS dirty_count`  
`FROM scene_fact_dependencies`  
`WHERE scene_id = ? AND is_dirty = 1;`

If upstream canon, character somatic conditions (e.g., paralyzed limbs), or scene inventory mutated without an AST re-compile, dirty\_count \> 0\. The gateway halts dispatch immediately with **HTTP 412 Precondition Failed** (DIRTY\_SCENE\_REJECTED), blocking invalid tasks before they consume GPU time or queue locks.

### **Hardware Mutex & The Inverted Mutex Architecture**

Consumer GPUs (e.g., 24 GB VRAM) cannot dynamically segment memory across concurrent video diffusion jobs. Simultaneous allocations cause catastrophic CUDA Out-Of-Memory (OOM) aborts.

#### **The "Two-Queue" Failure Mode**

If an edge control plane holds authoritative locking power, network latency across the WAN tunnel creates a fatal split-claimant state:

> 1. The edge leases Job A to Rig 2 under Epoch *N*.  
> 2. A transient network partition drops outbound telemetry for \>30 seconds.  
> 3. The edge watchdog timer trips, revokes the lease, and reassigns Job A to a secondary worker under Epoch *N*\+1.  
> 4. Rig 2's local GPU is unaware of the revocation and continues sampling frames.  
> 5. When connectivity recovers, competing allocations hit the same GPU, crashing the driver.

                           `THE TWO-QUEUE COLLISION HAZARD`  
                             
   `[ Remote Cloud Edge (DO) ]                              [ Local Rig 2 (Foundry) ]`  
               `│                                                       │`  
               `├───── Job A Leased to Rig 2 (Epoch N) ────────────────►│ (GPU starts diffusion pass)`  
               `│                                                       │`  
               `│   x──── Transient Network Partition / Delay ────x     │ (GPU still rendering Job A)`  
               `│                                                       │`  
               `├─ Watchdog Timer Trips (30s silence)`  
               `├─ DO assumes Worker dead; revokes lease`  
               `├─ DO reassigns Job A to Worker B / Epoch N+1`  
               `│                                                       │`  
               `│   x──── Network Reconnects / Worker B Hits GPU ───x   │`  
               `│                                                       ▼`  
               `└──────────────────────────────────────────────► [ FATAL COLLISION ]`  
                                                                `• Two claimants on 1 GPU`  
                                                                `• Concurrent VRAM allocation`  
                                                                `• CUDA OUT-OF-MEMORY (OOM)`

#### **The Architectural Inversion: Local Kernel Lock (flock)**

The authority relationship is inverted: **The edge Durable Object is a passive FIFO queue; physical silicon sovereignty belongs exclusively to Rig 2**.

Remote DO⟶Passive Logical Queue⟶Local media-broker⟶OS flock⟶GPU Silicon

The local daemon (media-broker) holds an unconditional POSIX advisory lock via fcntl:

`// media-broker/src/hardware/gpuLock.ts`  
`import fs from "node:fs";`  
`import fcntl from "fs-ext";`

`export class GpuHardwareMutex {`  
  `private lockFd: number | null = null;`  
  `private readonly lockFilePath = "/var/lock/rig2_gpu.lock";`

  `public acquireLock(): boolean {`  
    `if (this.lockFd !== null) return true;`  
    `try {`  
      `this.lockFd = fs.openSync(this.lockFilePath, "w");`  
      `fcntl.flockSync(this.lockFd, "exnb"); // LOCK_EX | LOCK_NB`  
      `return true;`  
    `} catch (err: any) {`  
      `if (err.code === "EAGAIN" || err.code === "EWOULDBLOCK") return false;`  
      ``throw new Error(`[GpuMutex] Kernel failure acquiring GPU lock: ${err.message}`);``  
    `}`  
  `}`

  `public releaseLock(): void {`  
    `if (this.lockFd === null) return;`  
    `try { fcntl.flockSync(this.lockFd, "un"); }`  
    `finally {`  
      `fs.closeSync(this.lockFd);`  
      `this.lockFd = null;`  
    `}`  
  `}`  
`}`

> * **Pull-Only Semantics:** The edge *never pushes* execution down to hardware. media-broker claims work from ShotCoordinatorDO over its outbound tunnel **only when its local flock is successfully claimed and available**.  
> * **Single Mutex Reality:** There is only one hardware lock in the ecosystem, and it resides on Rig 2's filesystem. Edge timeouts cannot force concurrent execution onto active silicon.

### **Egress Phase: Defensive Audits, Content Addressing, & Promotion**

Generative video plates cannot be reproduced bit-for-bit from mathematical seeds due to non-deterministic CUDA execution and floating-point drift. Consequently, output plates are treated as immutable historical evidence.

`Rig 2 (media-broker)                 Cloudflare R2 Bucket          edge-director DO`  
      `│                                       │                           │`  
      `├─ ComfyUI emits: { node: null }        │                           │`  
      `├─ Validates MP4 on scratch disk        │                           │`  
      `├─ Computes SHA-256 Digest              │                           │`  
      `│                                       │                           │`  
      `├─ Streams MP4 to Staging Key ─────────►│                           │`  
      `│  staging/.../epoch_4_a8f5b.mp4        │                           │`  
      `│                                       │                           │`  
      `├─ RPC: POST /tasks/complete ──────────────────────────────────────►│`  
      `│  { taskId, epoch: 4, sha256, key }    │                           ├─ Asserts active Epoch == 4`  
      `│                                       │                           ├─ Promotes staging to canonical`  
      `│                                       │                           ├─ Releases Hardware Mutex`  
      `│                                       │                           │`  
      `│◄───── HTTP 200 OK ────────────────────────────────────────────────┤`  
      `│                                       │                           │`  
      `│                                       │                           ├─ Broadcasts to Artists:`  
      `│                                       │                           │  SHOT_READY { seq: 114, url }`

> 1. **Defensive Scratchpad Audit:** When { "executing": { "node": null } } arrives, media-broker inspects ComfyUI/output/:  
   * **Size Verification:** Asserts binary file size \>0 bytes.  
   * **The Empty-File Hash Trap:** Computes the SHA-256 binary digest and asserts it does not match the empty-string constant:  
     SHA-256(∅)=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
   * **Container Decode (ffprobe):** Spawns an ffprobe child process to ensure the MP4 container moov atom is intact and that total decoded frames match the conformed diffusionAllocation.  
> 2. **Content-Addressed Staging Upload:** Cloudflare R2 and AWS S3 cannot natively evaluate custom epoch lease tokens on raw object PUT requests. The broker streams the verified MP4 using @aws-sdk/client-s3 or s5cmd directly to an isolated, epoch-scoped staging key:  
>    `staging/renders/${taskId}/epoch_${epoch}_${sha256}.mp4`

>    Because the key includes both the epoch and content hash, competing workers can never overwrite existing assets.  
> 3. **The Atomic Promotion RPC & Split-Brain Fencing:**  
   * The broker sends an authenticated RPC to ShotCoordinatorDO containing taskId, epoch, sha256, and stagingKey.  
   * The single-threaded Durable Object evaluates packet.epoch \=== this.activeEpoch inside an atomic transaction (ctx.storage):  
     * **Epoch Valid:** The DO updates the canonical episode manifest, unlocks the queue mutex, and broadcasts SHOT\_READY containing the pre-signed R2 asset URL to Rig 1\.  
     * **Epoch Stale (Network Partition / Timeout Reassignment):** If the watchdog timer tripped prior to completion, the DO has already incremented its internal epoch (*N*→*N*\+1). The DO rejects the write with **HTTP 409 Conflict**.  
> 4. **Storage Hygiene (Zero-Waste Lifecycle):** Unpromoted zombie objects left by partitioned workers are ignored by canonical manifests and purged automatically by Cloudflare R2's 7-day lifecycle retention policy.  
> 5. **Zero-Egress Distribution:** Rig 1 downloads the verified plate from Cloudflare R2 under its **\$0.00 egress fee guarantee** and feeds the video directly into Remotion's optical compositor (--gl=swangle).

## **6\. Repository Anatomy & Key Deliverables**

goblin-render-pipeline organizes generative passes across model training, headless ComfyUI graph synthesis, quality control gating, and containerized cloud deployment:

`goblin-render-pipeline/`  
`├── .gitattributes                          # Git LFS rules (*.safetensors, *.pth, *.onnx)`  
`├── README.md                               # Hardware spec, VRAM tiers, weekend vs. weekday rules`  
`├── package.json                            # Local media-broker daemon, TypeScript Zod contracts`  
`├── tsconfig.json                           # Extends goblin-config ruleset`  
`│`  
`├── workflows/                              # Headless ComfyUI API Format Graphs (Pure JSON)`  
`│   ├── wan2.2_greenscreen_i2v.json         # Spatiotemporal video diffusion over #00FF00 void`  
`│   ├── flux_matte_background.json          # Static 2048x1152 environment matte plate generation`  
`│   ├── birefnet_matting.json               # In-engine neural alpha matte extraction`  
`│   └── lora_regression_benchmark.json      # Standardized multi-angle character pose evaluation`  
`│`  
`├── lora-training/                          # Character, Fashion, Object, & Mood LoRA Toolchains`  
`│   ├── train_character_lora.py             # Serverless/local Kohya-ss & PEFT training harness`  
`│   ├── dataset_prep/                       # Ingestion, cropping, and caption regularizers`  
`│   │   ├── crop_buckets.py                 # Multi-resolution bucket quantization (512, 768, 1024)`  
`│   │   ├── caption_dropout.py              # Invariance tokenizer (5% caption dropout gate)`  
`│   │   └── palette_audit.py                # Pre-flight check against master_palette.json`  
`│   ├── configs/                            # Character-specific training parameters`  
`│   │   ├── bog.yaml                        # Rank 32 / Alpha 16 SDXL / Wan config`  
`│   │   ├── spleen.yaml                     # Anatomical ratio and skin texture constraints`  
`│   │   └── fashion_apron.yaml              # Wardrobe adapter config (decoupled from identity)`  
`│   └── active_checkpoints.json             # Canonical pointers to deployed .safetensors hashes`  
`│`  
`├── emotion-generation/                     # Staged Batch Candidate Synthesis`  
`│   ├── generate_emotion_bank.py            # High-throughput batch pose generator`  
`│   └── emotion_prompt_templates.json       # Upstream condition mappings (humiliated, smug, etc.)`  
`│`  
`├── alpha-compositing/                      # Edge Isolation & Clean Plate Extraction`  
`│   ├── green_screen_key.py                 # Algorithmic fallback despill & color-clamp`  
`│   ├── temporal_deflicker.py               # Boundary alpha-clamp against preceding frame`  
`│   └── palette_enforce.py                  # Quantizes boundary pixels to the 155-color gamut`  
`│`  
`├── qc/                                     # Automated Visual Gating & Regression Funnel`  
`│   ├── consistency_check.py                # DINOv2 / CLIP cosine embedding distance vs. anchor`  
`│   ├── temporal_stability.py               # RAFT optical flow & LPIPS patch boiling analyzer`  
`│   └── verify_hashes.py                    # Assert >0 bytes and SHA-256 != e3b0c442...b855`  
`│`  
`├── cloud/                                  # Serverless Burst & Container Topology`  
`│   ├── Dockerfile                          # GHCR image: CUDA 12.4, PyTorch, xFormers, ComfyUI`  
`│   ├── handler.py                          # RunPod Serverless / Modal execution entrypoint`  
`│   └── sync_weights.sh                     # High-concurrency R2 weight hydration via s5cmd`  
`│`  
`└── broker/                                 # Rig 2 Hardware Coordination Glue`  
    `├── local_broker.ts                     # Local daemon bridging edge-director to localhost:8188`  
    `├── hardware_mutex.ts                   # Kernel flock(/var/lock/rig2_gpu.lock) wrapper`  
    `└── memory_monitor.ts                   # nvidia-smi polling gate & 25-shot process recycler`

### **The Three Production Deliverables**

goblin-render-pipeline produces three core artifacts consumed downstream across the studio fleet:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   goblin-render-pipeline DELIVERABLES                  │`  
`└────────────────────────────────────────────────────────────────────────┘`  
                 `│`  
                 `├──► 1. Production Model Checkpoints (.safetensors)`  
                 `│    • Deployed to Cloudflare R2 bucket: /models/loras/`  
                 `│    • Tracked via active_checkpoints.json`  
                 `│    • Consumed by: Headless ComfyUI Generative Daemons`  
                 `│`  
                 `├──► 2. Isolated Character Video Plates (Dual-Stream)`  
                 `│    • Stream A: Raw #00FF00 Master (MP4, H.264/H.265)`  
                 `│    • Stream B: Pre-Keyed Alpha Proxy (WebM VP9 with Alpha)`  
                 `│    • Consumed by: goblin-viewport-template / Remotion`  
                 `│`  
                 `└──► 3. Emotion Bank Candidate Takes (take_XX.png)`  
                      `• Staged to: goblin-assets-visual/.../emotion_bank/`  
                      `• Triaged into approved.json & promoted to variants/`

#### **Deliverable 1: Trained Model Checkpoints (.safetensors)**

> * High-rank, low-loss neural adapter weights for character identities, fashion variations, key narrative objects, and cinematic moods.  
> * Every released checkpoint is cataloged in active\_checkpoints.json with an explicit SHA-256 hash, base checkpoint target, and consistency QC report path. Downstream scene compilation records this hash directly into render\_manifest.json.

#### **Deliverable 2: Isolated Character Video Plates (Dual-Stream)**

> * Raw character action keyed to the exact integer frame count dictated by audio speech stems (target\_frames=⌈(duration\_ms/1000)×24⌉).  
> * Exported to Cloudflare R2 as:  
  1. **Raw Preservation Plate:** High-bitrate MP4 rendered against pure \#00FF00.  
  2. **Alpha Video Proxy:** 8-bit alpha WebM VP9 containing transparent background channels, enabling Remotion on Rig 1 to drop the actor straight onto hand-painted matte backgrounds with zero local keying overhead.  
> * **The Zero-Byte Poison Tripwire:** Every generated plate must be audited prior to network promotion; any file whose SHA-256 matches e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 halts the release immediately.

#### **Deliverable 3: Emotion Bank Candidate Takes**

> * Batches of 2D full-figure or close-up candidate poses rendered across standardized aspect buckets.  
> * Dispatched to 04.assets/goblin-assets-visual/characters/\<id\>/emotion\_bank/\<emotion\>/ where they pass through the three-tier triage gauntlet before promotion to variants/\<character\>\_\<emotion\>.png and declaration in manifest.json.

## **7\. Operational Rhythms & Failure Mode Taxonomy**

The repository documentation (README.md) mandates strict separation between creative development cycles and hardware compute tasks:

### **The Two Studio Production Rhythms**

`WEEKDAY CADENCE (FOUNDRY IDLE / ON-DEMAND)`  
`Rig 1 (CPU/RAM Orchestrator)`  
`• Simulation runs via worker-sower-engine & dialogue AST compilation`  
`• Local audio-microservice speech synthesis & temporal ffprobe frame quantization`  
`• goblin-viewport-template stamps Episode_XXX.tsx and compiles Remotion composites`  
`• Rig 2 activated on-demand ONLY to render individual #00FF00 plates over frozen weights`

`WEEKEND / BURST CADENCE (FOUNDRY ACTIVE)`  
`Rig 2 (High-VRAM GPU Foundry) / RunPod Serverless`  
`• Heavy model training passes via train_character_lora.py (Kohya-ss / PEFT)`  
`• Character emotion candidate batch farming via generate_emotion_bank.py`  
`• Checkpoint verification canary sweeps (100 headless runs against baseline benchmarks)`  
`• Updating active_checkpoints.json and releasing .safetensors binaries to Cloudflare R2`

### **Complete Pipeline Failure Mode Taxonomy**

By decoupling semantic meaning from media presentation across strict architectural boundaries, the engineering team classifies and isolates production defects to their exact layer of origin:

| Defect Class | Concrete Failure Symptom | Physical / Algorithmic Root Cause | Diagnostic & Prevention Gate |
| :---- | :---- | :---- | :---- |
| **Semantic Defect (Axis A)** | Character with a severed arm swings a two-handed weapon in prose. | Unconstrained LLM context hallucination. | ***T*****0​ Compile Gate:** Hand Capacity Invariant Equation blocks the AST prior to audio synthesis (\$0.00 cost). |
| **Epistemic Defect (Axis A)** | Character reveals a secret known only to the narrator. | Context assembly leak; broken epistemic horizon. | **Epistemic Directives Linter:** Assert Fact\_ID in omittedTopicIds at AST compilation. |
| **Temporal Defect (Axis A)** | Mouth stops moving 6 frames before speech audio finishes. | Lip-sync calculated from word tokens rather than physical acoustic waveform. | **Exposure Sheet Quantizer:** Derive viseme windows strictly from physical ffprobe energy sweeps. |
| **Hardware Collision (Axis B)** | CUDA Out-Of-Memory (OOM) abort during video sampling. | Concurrent model hosting (e.g., Ollama running alongside ComfyUI). | **VRAM Turn Governance:** Enforce loopback ComfyUI DAGs, issue POST /free, poll nvidia-smi baseline. |
| **Split-Brain Collision (Axis B)** | Two workers allocate tensors on the same GPU simultaneously. | Remote edge timer revoked a lease during a network partition. | **Inverted Mutex Architecture:** Local POSIX flock owns physical silicon; DO is a passive queue. |
| **Visual Warping (Axis B)** | Background walls warp, boil, and melt between cuts. | Forcing video diffusion models to synthesize character motion and room geometry simultaneously. | **The Greenscreen Void:** Force diffusion sampling strictly against unlit \#00FF00 green void. |
| **Boundary Chatter (Axis B)** | Outer edge of character silhouette flickers and buzzes over static matte. | Diffusion models lack cross-frame temporal alpha constraints. | **Temporal Deflicker Node:** Clamp inter-frame alpha variance: *At*clean​\=clamp(*At*​,*At*−1​±*δ*max​). |
| **Decapitation Defect (Axis B)** | Automated crash zoom frames empty air or cuts off actor's head. | Viewport scales to canvas center rather than character's facial centroid. | **Manifest Spatial Math:** Target crash\_zoom\_target coordinate from manifest.json via TSX literal. |
| **Foot-Sliding Anomaly (Axis B)** | Character slides across the floor during dialogue bounces. | Visual sprite lacks floor plane registration point. | **Ground Contact Invariant:** Lock vertical placement to *Y*stage​≡*Y*ground​ via anchor\_point. |
| **Historical Corruption (Axis B)** | Re-rendering an episode 6 months later causes visual and timing regressions. | Shared, mutable runtime components evolved beneath historical scene JSONs. | **Source-Baking Pattern:** Metaprogram stamps immutable TypeScript JSX (Episode\_XXX.tsx) into committed repo. |

---
