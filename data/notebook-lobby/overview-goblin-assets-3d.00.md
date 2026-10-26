# **Overview: Goblin-Assets-3D.00**

[https://gemini.google.com/app/773e6477d15bbb53](https://gemini.google.com/app/773e6477d15bbb53)

*User prompt: we are starting working on the next repository \[Goblin-Assets-3D \]; can you present me with a complete overview*

### **Response: Overview: goblin-assets-3d**

**goblin-assets-3d** is the planned 3D mesh, rig, and scene-geometry vault within **Cluster 04.assets (The Source Art Vault)**. It serves as the physical spatial complement to the 2D visual art vault (goblin-assets-visual) and the acoustic vault (goblin-assets-audio).

Under the studio's governing Cartesian axis model, goblin-assets-3d sits strictly on **Axis B (Representation / Artifact Hardening)**. It acts as a strongly typed, read-only spatial asset API for downstream rendering engines, possessing zero authority over narrative law or dynamic simulation state.

### **1\. Architectural Boundaries & Lifecycle**

> * **Domain Isolation:** The studio strictly isolates asset types by format and toolchain rather than using a single omnibus asset monorepo. Separating 3D files from 2D sprites and WAV audio ensures downstream animators and build workers do not pull gigabytes of irrelevant DCC (digital content creation) files, mesh caches, or texture bakes.  
> * **Outputs vs. Stochastic Generators:** goblin-assets-3d is reserved exclusively for *finished, production-certified 3D assets*. Iterative training pipelines, raw multi-angle diffusion crops, ControlNet depth pre-processors, and Babylon.js/ComfyUI scene harness setups belong upstream in **goblin-render-pipeline** (or goblin-render-pipeline-sd / goblin-lora-training).  
> * **Separation of Physics, Meaning, and Geometry:**  
  * 000.goblin-lore defines what environments, bounds, and character proportions **mean**.  
  * goblin-spatial defines how space **behaves mathematically** (axial coordinates, LoS raycasts, acoustic occlusion).  
  * worker-sower-engine records **who is where** on the runtime ledger.  
  * goblin-assets-3d stores **what objects look like geometrically** (mesh topology, UVs, low-poly puppet rigs, material maps).

### **2\. Role Across the Multi-Series Pipeline**

> * **Series-Specific Scope:** Following the studio's "Quintet" multi-repository topology, goblin-assets-3d is dedicated exclusively to the crawlspace story world (*Under the Floorboards*). Other story worlds maintain their own asset vaults (e.g., wiregrass-assets) to prevent namespace clashes and massive cross-series Git LFS clones.  
> * **Pipeline Activation & Render Workflows:**  
  * The repository is designated for when the production expands beyond flat 2D cutouts into 3D rendering stages or hybrid 2.5D/SD pipelines (e.g., low-poly Babylon.js scene rigs passed through ControlNet/SD img2img passes).  
  * Downstream execution targets declare whether a character utilizes flat cutouts or hybrid 3D puppets via the manifest.json schema (e.g., render\_pipeline: "2d\_cutout" | "sd\_babylon\_hybrid").

### **3\. Standard Repository Topology & Invariants**

Scaffolded from goblin-repo-template, goblin-assets-3d adheres to the fleet-wide structural conventions:

`goblin-assets-3d/`  
`├── .gitattributes                    # Enforces Git LFS for binary formats`  
`├── CHANGELOG.md                      # Release tagging and asset change history`  
`├── ASSET_GUIDE.md                    # Polycount budgets, scale/unit invariants, UV norms`  
`├── package.json                      # Versioning scripts, asset linters, schema checks`  
`├── data/`  
`│   ├── versions.json                 # Pinned fleet coordination lockfile`  
`│   └── directive/`  
`│       └── day-000/                  # Standardized causal bootstrap directives`  
`├── characters/`  
`│   └── <character_id>/`  
`│       ├── manifest.json             # Strongly typed 3D puppet contract (bone anchors, transforms)`  
`│       ├── model.glb / model.gltf    # Certified runtime mesh & armature`  
`│       ├── textures/                 # Pinned diffuse, normal, roughness textures`  
`│       └── source/                   # LFS-tracked master working files (.blend, .fbx)`  
`├── environments/`  
`│   └── <location_id>/`  
`│       ├── manifest.json             # Spatial origin, camera focal bounds, occlusion zones`  
`│       ├── stage_geometry.glb        # Low-poly background & collision shells`  
`│       └── textures/`  
`└── props/`  
    `└── <item_id>/`  
        `├── manifest.json             # Attachment bone IDs and scale normalizers`  
        `└── prop.glb`

#### **Core Operational Invariants**

> 1. **Git LFS Binary Management:** All mesh, model, and source 3D files (\*.glb, \*.gltf, \*.blend, \*.fbx, \*.obj) are tracked through Git LFS backed by Cloudflare R2 object storage. Repository commits contain lightweight pointers (\~130 bytes) to maintain a lean Git tree.  
> 2. **The Manifest Contract:** Downstream compositors or render workers never traverse directories or parse arbitrary geometry. Every character and environment exports a manifest.json defining explicit coordinate origins, socket attachment points (e.g., hands, head, ground contact), and camera framing targets.  
> 3. **AST-Driven Harvesting & Pruning:** When compiling an episode release into goblin-episodes/epXXX/, collect-episode-assets.ts walks the scene AST to pull *only* the specific meshes and textures used in that scene into public/assets/, preserving the studio's strict **\<100MB to 150MB episode storage ceiling**.  
> 4. **The Zero-Byte Poison Sentinel:** Pre-flight CI gates calculate SHA-256 binary digests of all staged assets; any empty file matching e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 halts the build immediately to prevent corrupted downloads from crashing headless runs.

---

*User prompt: i want this is be a little more dynamic since it could be holding a series different than the goblin one; lets call it the Series Assets 3d*

### **Response: Architectural Overview: \[series\]-assets-3d**

**\[series\]-assets-3d** is the series-agnostic specification and vault within **Cluster 04.assets (The Source Art Vault)** for production-certified 3D meshes, armatures, scene geometry, and material maps.

Following the naming abstraction established across the fleet (such as \[series\]-assets-visual and \[series\]-assets-audio), \[series\]-assets-3d treats spatial assets as a **strongly typed, read-only 3D asset API**. It sits strictly on **Axis B (Representation / Artifact Hardening)**, possessing zero authority over narrative law or dynamic simulation state.

### **1\. Architectural Scope & Repository Isolation**

`┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐`  
`│        [series]-render-pipeline        │       │          [series]-assets-3d            │`  
`│   (Cluster 03.foundry: Heavy Compute)  │       │      (Cluster 04.assets: Vault)        │`  
`├────────────────────────────────────────┤       ├────────────────────────────────────────┤`  
`│ • Multi-angle 2D diffusion turnarounds │       │ • Production-certified .glb / .gltf   │`  
`│ • Raw photogrammetry / NeRF pointclouds│       │ • Low-poly puppet rigs & socket bones  │`  
`│ • Unbaked high-poly sculpts (.blend)   │ ───►  │ • Stage geometry & occlusion colliders │`  
`│ • ControlNet depth/normal pre-passes   │       │ • Power-of-two PBR texture channels    │`  
`│ • GPU baking scripts & training models │       │ • Strongly typed manifest.json API     │`  
`└────────────────────────────────────────┘       └────────────────────────────────────────┘`

> * **Finished Artifacts vs. Upstream Generation:** Like \[series\]-assets-visual, this vault houses only finished, production-certified 3D assets. High-poly sculpts, raw multi-view diffusion batches, ControlNet pre-processors, and headless rendering harnesses are quarantined upstream in \[series\]-render-pipeline.  
> * **Separation of Concerns:**  
  * 001.\[series\]-lore dictates physical truth, character height, somatic injuries, and environment lore.  
  * \[series\]-spatial provides coordinate mathematics, raycasting, and line-of-sight checks.  
  * \[series\]-assets-3d holds only the **geometric and material implementation** (topology, UVs, bone transforms, visual meshes).  
> * **Class 3 Durability (Archive-Dependent Evidence):** Mesh vertex caches, baked normal maps, and stylized textures cross the archive-dependent boundary. Because floating-point rendering variances and DCC bake differences prevent byte-identical re-synthesis from mathematical seeds alone, these 3D assets are immutable historical evidence tracked via Git LFS backed by Cloudflare R2.

### **2\. Standardized Directory Topology**

Every series instantiating this vault implements a rigid file structure to enable headless ingestion:

`[series]-assets-3d/`  
`├── .gitattributes                    # Git LFS tracking for *.glb, *.gltf, *.bin, *.blend, *.fbx, *.png`  
`├── CHANGELOG.md                      # Release tagging and geometric iterations`  
`├── ASSET_GUIDE.md                    # Triangle caps, unit scales (1 unit = 1m), texture standards`  
`├── package.json                      # Validation scripts and schema linters`  
`├── data/`  
`│   ├── versions.json                 # Pinned fleet coordination lockfile`  
`│   └── directive/`  
`│       └── day-000/                  # Standardized causal bootstrap directives`  
`├── characters/`  
`│   └── <character_id>/`  
`│       ├── manifest.json             # Strongly typed 3D puppet contract`  
`│       ├── model.glb                 # Certified runtime low-poly mesh + skeleton`  
`│       ├── textures/                 # PBR textures (base_color, normal, roughness)`  
`│       └── source/                   # LFS-tracked master working files (.blend, .fbx)`  
`├── environments/`  
`│   └── <location_id>/`  
`│       ├── manifest.json             # Spatial bounds, origin (0,0,0), camera framing sockets`  
`│       ├── stage_geometry.glb        # Low-poly background shells & camera occluders`  
`│       └── textures/`  
`└── props/`  
    `└── <item_id>/`  
        `├── manifest.json             # Attachment socket mapping, scale scalars`  
        `└── prop.glb`

### **3\. The Typed 3D Contract (manifest.json)**

Downstream execution layers (whether Babylon.js, Three.js, or hybrid ComfyUI 3D passes) never traverse directories or parse arbitrary scene graphs. Every asset exposes a validated contract:

`{`  
  `"$schema": "https://studio.internal/schemas/mesh_manifest.v1.json",`  
  `"schema_version": "1.0.0",`  
  `"character_id": "char_jack",`  
  `"model_file": "model.glb",`  
  `"content_hash": "sha256:8f3b12a09bc87e5d23456789abcdef0123456789abcdef0123456789abcdef01",`  
  `"metrics": {`  
    `"triangle_count": 4850,`  
    `"draw_calls": 2,`  
    `"bounding_box": {`  
      `"min": [-0.45, 0.0, -0.3],`  
      `"max": [0.45, 1.82, 0.3]`  
    `}`  
  `},`  
  `"rig": {`  
    `"armature_root": "root_bone",`  
    `"ground_contact_bone": "foot_ik_ground",`  
    `"sockets": {`  
      `"head_cam_focus": "head_bone",`  
      `"hand_right_socket": "hand_R",`  
      `"hand_left_socket": "hand_L"`  
    `}`  
  `},`  
  `"condition_variants": {`  
    `"severed_left_arm": {`  
      `"model_file": "variants/jack_severed_arm.glb",`  
      `"content_hash": "sha256:12c8a994ef7b8c9d0e1f4438..."`  
    `},`  
    `"paralyzed": null`  
  `},`  
  `"animation_hints": {`  
    `"mass_scalar": 1.2,`  
    `"shiver_amplitude": 0.04`  
  `}`  
`}`

> * **Strict Constraint Enforcement:** Conforms directly to the studio's technical audit gates—enforcing maximum triangle budgets (e.g., \< 5,000 triangles), power-of-two texture maps, and unit scale consistency.  
> * **The Explicit Null Protocol:** Missing 3D mesh states (such as paralyzed: null) allow animatic builds to fall back gracefully to the base model while failing loudly during final release compilation unless covered by an authorized waiver.

### **4\. Downstream Ingestion & Storage Discipline**

> 1. **Tagged Shallow Synchronization (sync-assets.ts):** Render nodes perform blobless shallow clones (--depth 1 \--filter=blob:none) against immutable semantic tags (e.g., \[series\]-assets-3d: v1.0.0) recorded in versions.json, avoiding submodule overhead.  
> 2. **AST-Driven Harvesting (collect-episode-assets.ts):** Stamping an entire 3D library (which spans tens of gigabytes of meshes and textures) into an episode container would cause severe memory exhaustion. The harvester walks dialogue\_ast.json and stages *only* the specific models, props, and location shells referenced in that scene into public/assets/3d/.  
> 3. **The 150MB Episode Budget Gate:** Cherry-picked assets must fit within the strict per-episode workspace ceiling (nominal \< 100MB, hard fail at 150MB).  
> 4. **The Zero-Byte Poison Sentinel:** The compiler calculates the SHA-256 hash of all staged 3D binaries. If any asset matches the empty hash (e3b0c44298fc...) or contains an unhydrated Git LFS pointer, execution halts immediately before scene engine initialization.

### **5\. Multi-Series Partitioning**

To avoid the **Organization Git LFS Quota Trap**—where heavy 3D commits for one production exhaust bandwidth and halt builds across the entire studio—each story world operates its own isolated \[series\]-assets-3d repository inside its respective GitHub organization or namespace (e.g., goblin-assets-3d, wiregrass-assets-3d).

Shared tooling (Zod validators, coordinate transformers, export macros) lives upstream in studio config packages, ensuring each creative universe maintains complete spatial, artistic, and operational isolation.

---

*User prompt: {{FOCUS:  1\. Architectural Boundaries & Lifecycle }} /extreme-details*

Response: **\[series\]-assets-3d** operates within Cluster 04.assets as the centralized, content-addressed vault for production-certified 3D meshes, armatures, scene geometry, and material maps. Expanding the structural invariants established by the visual repositories, it functions as a strongly typed, read-only 3D spatial API for downstream compositing engines and render pipelines.

### **1\. The Ontological Boundary (Axis A vs. Axis B)**

In accordance with the Sovereign Separation of Meaning and Projection, \[series\]-assets-3d resides strictly on **Axis B (Representation / Artifact Hardening)**.

> * **Sensory Projection Only:** The repository is mathematically forbidden from altering canonical world states, character injuries, or inventory logic. All narrative facts and spatial rules are governed upstream by 001.\[series\]-lore and the worker-sower-engine (Axis A).  
> * **Archive-Dependent Media:** Because 3D assets (baked textures, optimized .glb binaries, vertex caches) cross the Archive-Dependent boundary and cannot be deterministically re-synthesized bit-for-bit from a mathematical seed, they are treated as irreplaceable historical evidence. They are tracked via Git LFS and sealed in content-addressed storage (Cloudflare R2).

### **2\. Isolation from Generative Toolchains**

The architecture strictly divides iterative raw generation from final production deliverables.

> * **Upstream (The Foundry):** High-poly sculpts, raw multi-view point clouds, iterative ControlNet depth pre-passes, and messy .blend working files are quarantined in \[series\]-lora-training (or \[series\]-render-pipeline).  
> * **Downstream (The Vault):** \[series\]-assets-3d houses only the finished, approved outputs. It must remain lightweight, deterministic, and free of speculative generative artifacts to ensure stable downstream ingestion.

### **3\. The Typed 3D Spatial Contract (manifest.json)**

Downstream compositors never perform dynamic filesystem discovery or guess mesh filenames at runtime. Every 3D character, prop, and environment is bound to a typed manifest.json contract.

> * **Spatial Invariants & Rigging:** The manifest maps the raw .glb or .gltf binary into the rendering coordinate system, explicitly declaring ground-contact pivots (anchor\_point), camera focal targets (crash\_zoom\_target), and bone socket references for attaching props.  
> * **The Explicit Null Protocol:** If a 3D variant (e.g., a specific severed-limb model or damaged prop state) has not yet been modeled, it must be explicitly committed as null in the manifest to acknowledge the production gap. In draft mode, this triggers a safe fallback (e.g., substituting the default base mesh); in final broadcast mastering, an unwaived null acts as a fail-loud gate, terminating the build with Exit Code 1\.

### **4\. Downstream Ingestion & Physical Ceilings**

Because 3D asset libraries easily balloon into tens of gigabytes, indiscriminately cloning them into episode workspaces would cause immediate Docker overlay exhaustion and out-of-memory crashes on rendering nodes.

> * **Tagged Shallow Synchronization (sync-assets.ts):** Downstream nodes read the immutable tag pinned in versions.json (e.g., v1.4.0) and execute a blobless Git LFS shallow clone (--depth 1 \--filter=blob:none). This isolates the render from upstream master branch commits.  
> * **AST Dependency Harvesting (collect-episode-assets.ts):** A compiler parses the episode's dialogue\_ast.json and cherry-picks only the specific meshes, variants, and location shells referenced in that scene.  
> * **The Storage Envelope:** By pruning unreferenced assets, the harvested staging directory (public/assets/) is kept strictly under a 100 MB budget, with a hard, non-negotiable compile-time failure triggered if it exceeds 150 MB.  
> * **The Zero-Byte Poison Sentinel:** The compiler calculates the SHA-256 hash of every staged .glb or texture file. If any file matches the empty-string constant (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855) or measures \<1024 bytes, the build halts immediately, preventing headless rendering engines from crashing on truncated network transfers or unhydrated pointers.

---

*User prompt: {{FOCUS:  2\. Role Across the Multi-Series Pipeline }} /extreme-details*

### **Response: The Quintet Multi-Repository Fleet Topology**

To prevent cross-series asset bloat, namespace collisions, and unconstrained Git LFS bandwidth consumption, the studio rejects monolithic asset storage. Every distinct narrative universe deploys its own self-contained stack of five core repositories known as the **Quintet Multi-Repository Topology**:

`GOBLIN SERIES FLEET (Under the Floorboards)     WIREGRASS SERIES FLEET (Wiregrass Basin)`  
`├── goblin-lore / goblin-bible (01.canon)       ├── wiregrass-lore / wiregrass-bible (01.canon)`  
`├── worker-sower-engine (02.simulation)          ├── wiregrass-engine (02.simulation)`  
`├── goblin-assets-visual / 3d (04.assets)       ├── wiregrass-assets / 3d (04.assets)`  
`├── goblin-viewport-template (05.delivery)       ├── wiregrass-viewport (05.delivery)`  
`└── goblin-project (coordination)               └── wiregrass-project (coordination)`

(References:)

> * **Instance Vaults vs. Shared Infrastructure:** Generic compilers, formatters, coordinate transformers, and base Zod schemas reside in shared upstream tooling packages (e.g., @studio/lore-compiler, goblin-config). Diegetic story instance data—narrative bibles, entity states, character rigs, meshes, and textures—remains strictly quarantined within its respective series repositories.  
> * **The Dedicated Asset Rule:** \[series\]-assets-3d (such as goblin-assets-3d or wiregrass-assets-3d) is dedicated exclusively to its parent story world. A character model, environment collision hull, or skeletal mesh from *Under the Floorboards* is never committed to the asset tree of *Wiregrass Basin*.

### **Architectural Justifications for Dedicated 3D Vaults**

Maintaining dedicated 3D asset vaults per series solves four systemic production bottlenecks:

> * **Git LFS Bandwidth & Disk Isolation:** 3D assets carry massive binary payloads, including high-density mesh caches, multi-channel PBR textures, source .blend/.fbx files, and .glb stage geometries. Combining multiple productions into a single repository forces animators and CI runners working on Series A to download gigabytes of irrelevant 3D geometry belonging to Series B.  
> * **Aesthetic & Scale Rule Enforcement:** Spatial and artistic rules differ across creative universes. *Under the Floorboards* enforces micro-scale dimensions (crawlspaces, pipe clearances, insect proportions) and specific stylistic shaders, whereas a Southern Gothic or sci-fi universe enforces real-world human scale metrics, distinct PBR roughness/metallic ranges, and divergent camera perspective bounds.  
> * **Namespace & Bone Hierarchy Collisions:** Rigs and geometries are structured around specific entity identifiers (e.g., /characters/bog/, /characters/spleen/) and location colliders (e.g., /environments/warm\_pipe/). Segregating repositories prevents identifier collisions, avoids cross-series rig pollution, and maintains a clean 1:1 mapping between manifest.json schemas and canonical entity dossiers in 001.\[series\]-lore.  
> * **Audit-Proof Provenance & Independent Versioning:** Asset tags are pinned in the series coordination lockfile (versions.json) and baked into final episode delivery manifests (render\_manifest.json). Merging multiple shows into one asset repository causes tag churn—updating a prop in Series B forces artificial version bumps and dirty Git histories across Series A.

### **Cross-Series Orchestration & Downstream Consumption**

When an episodic scene is compiled and rendered, the toolchain resolves 3D assets through its series-specific pipeline:

`[series]-lore (Axis A: Canon) ──► worker-sower-engine (Axis A: Simulation)`  
                                             `│`  
                                             `│ dialogue_ast.json + scene_manifest.json`  
                                             `▼`  
                                `collect-episode-assets.ts`  
                                             `│`  
             `┌───────────────────────────────┴───────────────────────────────┐`  
             `▼                                                               ▼`  
   `[series]-assets-visual                                          [series]-assets-3d`  
   `• Cherry-picks 2D plates/visemes                                • Cherry-picks .glb meshes/rigs`  
             `│                                                               │`  
             `└───────────────────────────────┬───────────────────────────────┘`  
                                             `│ Stages <100MB envelope`  
                                             `▼`  
                              `[series-episodes]/epXXX/public/assets/`  
                                             `│`  
                                             `▼`  
                             `Remotion / 3D Composition Pipeline`  
                                             `│`  
                                             `▼`  
                                 `Broadcast Master Deliverable`

(References:)

> 1. **Targeted Ingestion via sync-assets.ts:** Downstream viewport engines (\[series\]-viewport-template) avoid standard Git submodules. Instead, scripts/sync-assets.ts performs a blobless shallow clone (--depth 1 \--filter=blob:none) against the specific semver tag (e.g., v1.4.0) pinned in versions.json, pulling only the LFS pointers needed for that story world.  
> 2. **Selective Asset Pruning via collect-episode-assets.ts:** A full 3D library can easily exceed 20 GB to 50 GB. To prevent Docker overlay exhaustion and out-of-memory crashes on rendering workers, collect-episode-assets.ts parses dialogue\_ast.json and stages **only the explicit 3D models, bone anchors, and location shells referenced in that scene** into \[series-episodes\]/epXXX/public/assets/. This prunes the workspace payload down to fit the studio's strict **\<100MB budget (150MB hard ceiling)**.  
> 3. **The Zero-Byte Poison Sentinel:** The compiler computes the SHA-256 hash of every staged 3D binary and texture. If any asset matches the empty-file digest:  
>    SHA-256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>    or represents an unhydrated Git LFS pointer, the build halts immediately with exit code 1 to prevent corrupt files from crashing the rendering engine.  
> 4. **Tree-Hash Staleness Verification:** The conductor computes the Git tree hash of the active 3D assets and compares it against compiled/bible-state.json. If 3D meshes or character rigs have been altered in the asset vault without a corresponding update and recompilation of canonical law in \[series\]-lore, compilation aborts with a FATAL CANON DIVERGENCE exception.  
> 5. **Immutable Provenance Freeze:** The stamped render\_manifest.json logs the exact commit SHA, container digest, and binary asset hashes for every 3D model used in the broadcast master. Because assets are permanently pinned to content-addressed storage (Cloudflare R2), historical episodes can be re-rendered offline decades later with guaranteed Level 3 Decoded Media Equivalence.

---

*User prompt: {{FOCUS:  3\. The Typed 3D Contract (manifest.json) }} /extreme-details*

### **Response: The 3D Asset Contract (manifest.json)**

In **\[series\]-assets-3d**, manifest.json is not passive metadata; it is the **strongly typed, version-controlled public API** and database of physical spatial invariants for 3D meshes, armatures, stage hulls, and props.

Downstream viewports, headless scene builders (e.g., Babylon.js, Three.js), and generative hybrid pipelines (e.g., ControlNet depth/normal passes) never perform runtime filesystem discovery, glob asset directories, or guess mesh geometries. Instead, they consume manifest.json as an immutable spatial contract that maps binary 3D payloads (.glb, .gltf) into a deterministic coordinate engine.

### **1\. Authoritative Schema Specification (mesh\_manifest.v1.json)**

Every character, environment, and prop directory within \[series\]-assets-3d must expose an authoritative manifest.json conforming to the studio's strict JSON Schema standard:

`{`  
  `"$schema": "https://studio.internal/schemas/mesh_manifest.v1.json",`  
  `"schema_version": "1.0.0",`  
  `"entity_id": "char_bog",`  
  `"entity_type": "character",`  
  `"render_pipeline": "sd_babylon_hybrid",`  
  `"coordinate_system": {`  
    `"handedness": "right_handed",`  
    `"up_axis": "+Y",`  
    `"forward_axis": "+Z",`  
    `"unit_scale_meters": 1.0`  
  `},`  
  `"metrics": {`  
    `"triangle_count": 4850,`  
    `"draw_calls": 2,`  
    `"bounding_box": {`  
      `"min": [-0.35, 0.0, -0.25],`  
      `"max": [0.35, 1.15, 0.25]`  
    `}`  
  `},`  
  `"base_model": {`  
    `"file": "models/bog_base.glb",`  
    `"sha256": "8f3b12a09bc87e5d23456789abcdef0123456789abcdef0123456789abcdef01",`  
    `"armature_root": "root_bone",`  
    `"spatial_anchors": {`  
      `"ground_contact_pivot": { "x": 0.0, "y": 0.0, "z": 0.0 },`  
      `"crash_zoom_target": { "x": 0.0, "y": 0.92, "z": 0.08 },`  
      `"over_the_shoulder_target": { "x": 0.18, "y": 0.85, "z": -0.22 }`  
    `},`  
    `"attachment_sockets": {`  
      `"socket_hand_r": "bone_hand_R",`  
      `"socket_hand_l": "bone_hand_L",`  
      `"socket_head": "bone_skull",`  
      `"socket_belt": "bone_pelvis"`  
    `},`  
    `"viseme_driver": {`  
      `"type": "morph_targets",`  
      `"target_node": "mesh_head",`  
      `"viseme_map": {`  
        `"closed": "viseme_closed",`  
        `"small": "viseme_small",`  
        `"medium": "viseme_medium",`  
        `"wide": "viseme_wide"`  
      `}`  
    `}`  
  `},`  
  `"condition_variants": {`  
    `"humiliated": {`  
      `"file": "variants/bog_humiliated.glb",`  
      `"sha256": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",`  
      `"spatial_anchors": {`  
        `"ground_contact_pivot": { "x": 0.0, "y": 0.0, "z": 0.0 },`  
        `"crash_zoom_target": { "x": 0.04, "y": 0.78, "z": 0.12 }`  
      `},`  
      `"animation_hints": {`  
        `"mass_scalar": 1.4,`  
        `"shiver_amplitude": 0.08,`  
        `"idle_sway_frequency_hz": 0.6`  
      `}`  
    `},`  
    `"severed_left_arm": {`  
      `"file": "variants/bog_amputated_L.glb",`  
      `"sha256": "3c1a8e9f2b4d5a6e7f80123456789abcdef0123456789abcdef0123456789abc",`  
      `"disabled_sockets": ["socket_hand_l"]`  
    `},`  
    `"terrified": null`  
  `},`  
  `"animation_hints": {`  
    `"mass_scalar": 1.0,`  
    `"shiver_amplitude": 0.02,`  
    `"idle_sway_frequency_hz": 1.2`  
  `},`  
  `"approval": {`  
    `"pull_request_number": 184,`  
    `"approved_by_user": "lead-technical-director",`  
    `"commit_sha": "a4f8e21c83d58296a29e46f145f8e3b2e7a10982"`  
  `}`  
`}`

(References:)

### **2\. Spatial Invariants & 3D Coordinate Mathematics**

Analogous to the 2D cutout contracts, the 3D manifest binds spatial invariants directly into scene-graph transformations without ad-hoc positioning code:

#### **Ground Contact Alignment (ground\_contact\_pivot)**

> * **The Problem:** Dynamic character heights and irregular feet meshes cause models to float above the stage or clip through floor collision planes.  
> * **The Invariant:** The manifest declares the exact vector offset (*x*0​,*y*0​,*z*0​) representing zero-elevation foot contact. At scene hydration, the transformation pipeline normalizes the entity matrix:  
>   *T*world​\=*P*stage\_spawn​−R⋅*A*ground\_pivot​  
>   This guarantees that puppets rest on stage hulls regardless of variant posture changes.

#### **Camera Centroids & Close-Up Trajectories (crash\_zoom\_target)**

> * **Directorial Framing:** In 2D viewports, crash\_zoom\_target normalizes the facial center or eye line so camera push-ins do not decapitate characters.  
> * **3D Ray Target:** In the 3D pipeline, this vector provides the target vector for programmatic camera controllers. When a shot script requests an extreme close-up (CRASH\_ZOOM), the camera's LookAt matrix interpolates toward:  
>   *P*cam\_target​\=*T*world​\+R⋅*C*crash\_zoom​  
>   preventing height-induced misframing without requiring manual artist keyframing per take.

#### **Modular Viseme Mapping (viseme\_driver)**

> * Unlike 2D sprite mouth overlays that mount atop bounding boxes (mouth\_bounding\_box), the 3D manifest abstracts phoneme rendering to **GPU morph targets** (blend shapes) or **bone transforms**.  
> * The contract maps canonical Preston Blair mouth states (closed, small, medium, wide) to internal glTF target channels (viseme\_closed, etc.), enabling lip-sync drivers to modulate acoustic frames deterministically.

#### **Socket Matrix & Prop Attachment (attachment\_sockets)**

> * Props (weapons, scrap tools, held items) declare their own connection sockets in their manifests.  
> * The character manifest maps socket names (socket\_hand\_r) to specific joint nodes in the glTF skeletal armature (bone\_hand\_R), allowing the downstream compiler to mount prop hierarchies dynamically while inheriting parent bone kinematics.

### **3\. The Explicit Null Protocol & Dual-Mode Execution Gate**

In multi-series production, narrative screenplays and machine dialogue ASTs outpace 3D modeling and rigging schedules. The repository prevents runtime pipeline crashes while safeguarding broadcast integrity via the **Explicit Null Protocol**:

               `MACHINE AST REQUEST: variant: "terrified"`  
                               `│`  
                               `▼`  
                  `[ Ingest bog/manifest.json ]`  
                               `│`  
             `Is condition_variants.terrified defined?`  
                               `│`  
             `┌─────────────────┴─────────────────┐`  
             `▼ YES                               ▼ NULL / INTENTIONALLY_ABSENT`  
   `[ Load bog_terrified.glb ]          [ EVALUATE BUILD ENVIRONMENT ]`  
                                                 `│`  
                               `┌─────────────────┴─────────────────┐`  
                               `▼ DRAFT / ANIMATIC BUILD            ▼ BROADCAST MASTERING BUILD`  
                      `[ SAFE FALLBACK APPLIED ]              [ FAIL-LOUD RELEASE GATE ]`  
                      `1. Log compiler WARN                   1. Evaluate ∀ shot, var != null`  
                      `2. Fallback: base_model.file           2. Scan waivers.json ledger`  
                      `3. Inherit base spatial anchors        3. Missing Waiver -> EXIT CODE 1`  
                      `4. Render animatic successfully        (Zero missing geometry in master)`

(References:)

#### **Contract of Intentional Absence**

> * Omitting a variant key from condition\_variants is treated as a structural schema error (SCHEMA\_PARSE\_ERROR).  
> * If a 3D variant has not yet been modeled, rigged, or approved, it must be explicitly committed as null:  
>   `"condition_variants": {`  
>     `"humiliated": { "$ref": "..." },`  
>     `"terrified": null,`  
>     `"grieving": null`  
>   `}`

>   This distinguishes an acknowledged production gap from parsing bugs or corrupted JSON files.

#### **Dual-Mode Compilation Enforcement**

> 1. **Draft / Animatic Mode:** When the scene compiler encounters variant \== null, it emits a non-fatal warning (COMPILER\_WARN), falls back to base\_model.file, and inherits default anchors and animation hints, allowing layout and timing review to proceed uninterrupted.  
> 2. **Broadcast Release Gate (Fail-Loud Law):** Final broadcast mastering builds enforce strict, zero-tolerance invariant validation:  
>    ∀shot∈Episode,referenced\_variant(shot)=null  
>    If any active shot references an un-illustrated null variant, the pipeline halts immediately with **Exit Code 1**.

#### **The Cryptographic Waiver Ledger (waivers.json)**

The only mechanism to bypass a broadcast failure for an incomplete 3D asset is an explicit waiver entry committed to the release ledger, cryptographically signed by the showrunner:

`{`  
  `"waiver_id": "wv_ep04_bog_terrified_3d_001",`  
  `"episode_id": "EP004",`  
  `"scene_id": "sc002_shot03",`  
  `"entity_id": "char_bog",`  
  `"missing_variant": "terrified",`  
  `"permitted_fallback": "base_model",`  
  `"reason": "3D terrified blendshape rig delayed in Tier 2 sculpt triage; animatic approved using base model with shiver amplitude override.",`  
  `"authorized_by": "showrunner_signature_ed25519",`  
  `"expires_at": "2026-10-01T00:00:00Z"`  
`}`

(References:)

### **4\. Technical Performance Budgets & Ingress Validation**

Unlike 2D raster images, unconstrained 3D meshes introduce GPU memory exhaustion, draw call bottlenecks, and geometry pipeline stalls. manifest.json acts as the technical gatekeeper:

> * **The Triangle & Draw-Call Ceiling:** CI linters parse the staged binary and assert that metrics.triangle\_count and metrics.draw\_calls remain within the hard limits defined in ASSET\_GUIDE.md (e.g., character meshes ≤5,000 triangles, draw calls ≤4).  
> * **Bounding-Box Sanity Assertion:** metrics.bounding\_box is compared against canonical entity sizing defined in 001.\[series\]-lore. If a goblin model measures 1.82m tall when lore dictates a maximum height of 1.15m, the asset linter rejects the pull request at ingestion.  
> * **The Zero-Byte Poison Sentinel:** The compiler computes the SHA-256 hash of base\_model.file and every variant .glb. If any binary matches the empty-string constant:  
>   SHA-256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>   or falls below 1,024 bytes (indicating an unhydrated Git LFS pointer), compilation terminates immediately with an EMPTY\_FILE\_DETECTED exception.  
> * **Provenance Freeze (render\_manifest.json):** Every promoted asset's sha256 content hash from manifest.json is stamped directly into the root render\_manifest.json. This ties rendered broadcast frames to the exact geometry binaries stored in Cloudflare R2, ensuring long-term auditability and reproducible scene re-renders.

---

*User prompt: {{FOCUS:  4\. Downstream Ingestion & Physical Ceilings }} /extreme-details*

### **Response: Downstream Ingestion & Physical Ceilings**

The downstream ingestion pipeline and physical ceiling architecture form the mechanical boundary separating the centralized, multi-gigabyte master asset vault (\[series\]-assets-3d) from downstream execution targets like \[series\]-viewport-template and episodic production containers (\[series\]-episodes/epXXX).

Because 3D asset libraries contain dense polygon armatures, high-resolution multi-channel PBR textures, source .blend/.fbx binaries, and environment stage colliders, letting downstream renderers blindly clone or traverse the master asset tree causes severe disk thrashing, Docker daemon overlay exhaustion, and out-of-memory (OOM) failures. Furthermore, because rendered media belongs to **Class 3 Durability (Archive-Dependent Evidence)** and cannot be re-synthesized bit-for-bit from a mathematical seed alone due to CUDA non-determinism and floating-point variances, these assets must be handled through strict, deterministic ingestion mechanics.

### **1\. Tagged Shallow Synchronization (sync-assets.ts)**

Standard Git submodules introduce detached HEAD ambiguities, CI credential inheritance failures, and recursive downloads of historical binary versions. The toolchain replaces submodules with a dedicated synchronization harness:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   TAGGED SHALLOW SYNCHRONIZATION                       │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ [series]-assets-3d (Remote Vault via Cloudflare R2 / Git LFS)          │`  
`│                                │                                       │`  
`│                                │ git clone --depth 1                   │`  
`│                                │           --branch v1.4.0             │`  
`│                                │           --filter=blob:none          │`  
`│                                │           --no-checkout               │`  
`│                                ▼                                       │`  
`│ [series]-viewport-template / cache/assets-3d/ (Local NVMe Shared Cache)│`  
`│                                │                                       │`  
`│                                │ git lfs pull --include="..."          │`  
`│                                ▼                                       │`  
`│ Pinned Geometry & Armatures Hydrated for Active Production Tag         │`  
`└────────────────────────────────────────────────────────────────────────┘`

(References:)

> * **Decoupled Version Locking (versions.json):** Downstream compositors are strictly forbidden from tracking the main or trunk branch. Builds inspect an immutable lockfile (versions.json) that pins the precise semantic version tag (e.g., "\[series\]-assets-3d": "v1.4.0" or latest-stable). Upstream commits or experimental geometry changes never propagate into an active render run until an explicit lockfile update pull request is merged.  
> * **Blobless LFS Ingestion:** The synchronization script executes a tree-filtered, blobless shallow clone:  
>   `git clone \`  
>     `--depth 1 \`  
>     `--branch v1.4.0 \`  
>     `--filter=blob:none \`  
>     `--no-checkout \`  
>     `https://github.com/studio/[series]-assets-3d.git \`  
>     `./cache/assets-3d/`  
>   `git lfs pull --include="characters/*/model.glb,environments/*/stage_geometry.glb"`

>   (References:)  
>   This populates the local NVMe staging cache with certified tip assets while bypassing historical iterations, raw multi-angle diffusion crops, and unbaked sculpt files.

### **2\. AST Dependency Harvesting (collect-episode-assets.ts)**

A full series 3D vault easily exceeds 20 GB to 50 GB. Stamping an entire vault into an individual episode repository creates a severe **Multi-Episode Redundancy Problem**—copying 4 active characters with unpruned assets across a 20-episode season generates 4 GB to 12 GB of pure data redundancy.

The pipeline solves this via **Abstract Syntax Tree (AST) Dependency Harvesting**. A build-time pre-pass parses the scene intermediate representation (dialogue\_ast.json) and cherry-picks only the referenced meshes, variants, and stage geometry into \[series-episodes\]/epXXX/public/assets/3d/:

`// scripts/collect-episode-assets.ts (3D Pipeline Specialization)`  
`import fs from 'node:fs';`  
`import path from 'node:path';`

`interface SceneAST {`  
  `episode_id: string;`  
  `location_id: string;`  
  `rounds: Array<{ speaker: string; condition_tag?: string }>;`  
  `props_spawned?: string[];`  
`}`

`export async function harvestEpisode3DAssets(`  
  `astPath: string,`  
  `vaultPath: string,`  
  `destPath: string`  
`): Promise<{ stagedFiles: string[]; totalBytes: number }> {`  
  `const ast: SceneAST = JSON.parse(fs.readFileSync(astPath, 'utf8'));`  
  `const stagedSet = new Set<string>();`  
  `let totalBytes = 0;`

  `// 1. Resolve and harvest active location stage geometry`  
  `const envManifestPath = path.join(vaultPath, 'environments', ast.location_id, 'manifest.json');`  
  `const envManifest = JSON.parse(fs.readFileSync(envManifestPath, 'utf8'));`  
  `stagedSet.add(path.join('environments', ast.location_id, envManifest.stage_geometry));`

  `// 2. Resolve character armatures and referenced condition variants`  
  `for (const round of ast.rounds) {`  
    `if (!round.speaker) continue;`  
    `const charManifestPath = path.join(vaultPath, 'characters', round.speaker, 'manifest.json');`  
    `const charManifest = JSON.parse(fs.readFileSync(charManifestPath, 'utf8'));`

    `// Always stage the certified base mesh/armature`  
    `stagedSet.add(path.join('characters', round.speaker, charManifest.base_model.file));`

    `// Stage condition-specific mesh variant if explicitly declared`  
    `if (round.condition_tag) {`  
      `const variant = charManifest.condition_variants?.[round.condition_tag];`  
      `if (variant && variant.file) {`  
        `stagedSet.add(path.join('characters', round.speaker, variant.file));`  
      `}`  
    `}`  
  `}`

  `// 3. Harvest active props`  
  `if (ast.props_spawned) {`  
    `for (const propId of ast.props_spawned) {`  
      `const propManifestPath = path.join(vaultPath, 'props', propId, 'manifest.json');`  
      `const propManifest = JSON.parse(fs.readFileSync(propManifestPath, 'utf8'));`  
      `stagedSet.add(path.join('props', propId, propManifest.model_file));`  
    `}`  
  `}`

  `// 4. Copy harvested assets into local public/assets/ sandbox`  
  `for (const relFile of stagedSet) {`  
    `const src = path.join(vaultPath, relFile);`  
    `const dest = path.join(destPath, relFile);`  
    `fs.mkdirSync(path.dirname(dest), { recursive: true });`  
    `fs.copyFileSync(src, dest);`  
    `totalBytes += fs.statSync(dest).size;`  
  `}`

  `return { stagedFiles: Array.from(stagedSet), totalBytes };`  
`}`

(References:)

> * **Footprint Reduction:** Selective extraction slashes the physical asset footprint by over 90% to 98% (condensing a multi-gigabyte vault down to a 5 MB to 28 MB payload for typical animatics, or 18 MB to 42 MB for full production scenes).  
> * **Offline Hermetic Isolation:** Downstream rendering executes completely offline. Upstream alterations, branch deletions, or network cuts to \[series\]-assets-3d cannot break the stamped episode's ability to render identical frames.

### **3\. The Strict Physical Storage Envelope (*T*0​\=\$0.00)**

The pipeline adheres to the **Fail-Fast Economic Hierarchy**: defects, missing assets, or storage breaches must fail at Step 0 (*T*0​), where financial compute cost is exactly \$0.00. Allowing bloated assets to escape into headless rendering (*T*3​) or cloud GPU compositing incurs direct billing, CPU/GPU timeouts, and memory crashes.

| Envelope Dimension | Production Boundary Rule | Enforcement Behavior |
| :---- | :---- | :---- |
| **Nominal Episode Budget** | \<100 MB total staged assets | Green light; standard production execution. |
| **Storage Warning Zone** | 100 MB−150 MB total staged assets | Build emits non-blocking warning log for inspection. |
| **Hard Storage Ceiling Gate** | 150 MB absolute maximum | **Hard build failure (Exit Code 1\)** at *T*0​ (\$0.00 cost). |
| **Allowed Regression** | 0% tolerance above hard ceiling | Traps accidental commits of unbaked .blend files or raw scan caches. |
| **Memory Isolation Limit** | Max 1.2 GB V8 heap per isolate | Protects headless Chromium / Remotion worker pools from thrashing. |

`// scripts/assert-storage-envelope.ts`  
`import fs from 'node:fs';`  
`import path from 'node:path';`

`const NOMINAL_BUDGET_BYTES = 100 * 1024 * 1024; // 100 MB`  
`const HARD_CEILING_BYTES = 150 * 1024 * 1024;   // 150 MB`

`export function assertStorageEnvelope(stagedDir: string): void {`  
  `let totalBytes = 0;`  
  `function crawl(dir: string) {`  
    `for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {`  
      `const fullPath = path.join(dir, entry.name);`  
      `if (entry.isDirectory()) crawl(fullPath);`  
      `else totalBytes += fs.statSync(fullPath).size;`  
    `}`  
  `}`  
  `crawl(stagedDir);`

  `const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);`  
  `if (totalBytes > HARD_CEILING_BYTES) {`  
    ``console.error(`\n[FATAL ENVELOPE BREACH] Staged 3D assets (${totalMb} MB) exceed 150 MB ceiling.`);``  
    ``console.error(`Action: Verify high-poly meshes, raw textures, or unpruned scenes were not staged.`);``  
    `process.exit(1); // Halts execution immediately before allocating compute`  
  `}`  
  `if (totalBytes > NOMINAL_BUDGET_BYTES) {`  
    ``console.warn(`[STORAGE WARNING] Staged 3D assets (${totalMb} MB) exceed 100 MB nominal target.`);``  
  `}`  
`}`

(References:)

### **4\. Cryptographic Sentinels & Invariant Pre-Flight Gates**

Before initializing headless Chromium, Babylon.js headless contexts, or Remotion compositors, the staging environment executes a series of low-level confidence audits:

#### **A. The Zero-Byte Poison Sentinel**

In distributed workflows involving Cloudflare R2 and Git LFS, network timeouts or missing LFS hooks often produce **Silent Truncation Defects**: writing a 0-byte file to disk or leaving a \~130-byte ASCII text pointer file (e.g., version \[https://git-lfs.github.com/spec/v1\](https://git-lfs.github.com/spec/v1)...). When headless rendering engines attempt to parse these corrupted inputs as binary GLB buffers, they crash or enter infinite thread hangs.

The sentinel evaluates the SHA-256 binary digest of every staged binary against the empty-buffer constant:

SHA-256empty​\=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

(References:)

`// scripts/verify-asset-integrity.ts`  
`import fs from 'node:fs';`  
`import path from 'node:path';`  
`import crypto from 'node:crypto';`

`const EMPTY_FILE_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';`

`export function verifyStagedAssetIntegrity(stagedDir: string): void {`  
  `const files = fs.readdirSync(stagedDir, { recursive: true }) as string[];`

  `for (const relPath of files) {`  
    `const fullPath = path.join(stagedDir, relPath);`  
    `const stat = fs.statSync(fullPath);`  
    `if (!stat.isFile()) continue;`

    `// 1. Trap physical zero-byte truncation`  
    `if (stat.size === 0) {`  
      ``console.error(`[FATAL POISON DETECTED] Zero-byte asset: ${relPath}`);``  
      `process.exit(1);`  
    `}`

    `// 2. Trap empty-string SHA-256 hash`  
    `const buf = fs.readFileSync(fullPath);`  
    `const digest = crypto.createHash('sha256').update(buf).digest('hex');`  
    `if (digest === EMPTY_FILE_SHA256) {`  
      ``console.error(`[FATAL POISON DETECTED] Empty hash constant matched: ${relPath}`);``  
      `process.exit(1);`  
    `}`

    `// 3. Trap unhydrated Git LFS text pointers masquerading as 3D binaries`  
    `if (relPath.endsWith('.glb') || relPath.endsWith('.gltf') || relPath.endsWith('.bin')) {`  
      `const header = buf.subarray(0, 7).toString('ascii');`  
      `if (header === 'version' || stat.size < 1024) {`  
        ``console.error(`[FATAL LFS DEFECT] Unhydrated LFS pointer detected: ${relPath}`);``  
        `process.exit(1);`  
      `}`  
    `}`  
  `}`  
`}`

(References:)

#### **B. The Disk Parity Sweep (\!MissingAssets)**

The pre-flight audit statically crawls all asset references inside the generated scene code (Episode\_XXX.tsx / scene\_manifest.json) and verifies their physical presence within public/assets/. If an asset is missing or unreadable, the build halts with Exit Code 1 before allocating render instances.

#### **C. Tree-Hash Staleness Verification (CANON\_STALE)**

To preserve the Cartesian boundary between Meaning (Axis A) and Representation (Axis B), 3D assets must never fall out of sync with canonical narrative law.

> 1. Upstream narrative compilation (worker-sower-engine) bakes the expected Git tree SHA of the 3D asset vault into compiled/bible-state.json.  
> 2. The conductor compares this expected hash against the live Git tree SHA of /characters/ and /environments/ in the fetched \[series\]-assets-3d repository.  
> 3. Divergent hashes indicate that geometry or armatures were updated without re-running the narrative simulation, aborting compilation with a CANON\_STALE exception.

### **5\. Multi-Tier Storage Topology & Zero-Egress Caching**

To support high-throughput rendering runs across serverless render nodes, local GPU rigs, and long-term storage, \[series\]-assets-3d integrates into a tri-tier storage topology:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   TRI-TIER 3D STORAGE TOPOLOGY                         │`  
`├──────────────┬────────────────────────┬────────────────────────────────┤`  
`│ Storage Tier │ Physical Substrate     │ Asset Scope & Operational Role │`  
`├──────────────┼────────────────────────┼────────────────────────────────┤`  
`│ Tier 1:      │ Local Workstation NVMe │ Harvested episode sandbox      │`  
`│ Hot Scratch  │ (/tmp, /scratch)       │ (public/assets/3d/), unpacked  │`  
`│              │                        │ GLB buffers, frame caches[cite: 2, 4].   │`  
`├──────────────┼────────────────────────┼────────────────────────────────┤`  
`│ Tier 2:      │ Cloudflare R2 Content- │ Production-promoted GLB meshes,│`  
`│ Warm Vault   │ Addressed Storage      │ baked PBR maps, and manifests  │`  
`│              │ (CAS)                  │ keyed by SHA-256[cite: 1, 2]. Zero-egress│`  
`│              │                        │ allows parallel worker pulls[cite: 1, 9]. │`  
`├──────────────┼────────────────────────┼────────────────────────────────┤`  
`│ Tier 3:      │ AWS Glacier / B2 with  │ Source .blend files, high-poly │`  
`│ Cold WORM    │ Object-Lock (WORM)     │ sculpt archives, and immutable │`  
`│ Archive      │                        │ release packages[cite: 1, 2]. Verified via │`  
`│              │                        │ 30-day cursor scrubbers[cite: 1, 2].     │`  
`└──────────────┴────────────────────────┴────────────────────────────────┘`

(References:)

> * **Cloudflare R2 Zero-Egress Economics:** Content-addressed 3D assets (models/sha256\_{hash}.glb) stream directly from Cloudflare R2 using S3-compatible SDK bindings. Because R2 charges \$0.00 egress fees, parallel rendering nodes pull heavy geometry payloads without incurring bandwidth cost penalties.  
> * **Immutable Provenance Stamping:** Every harvested 3D file's SHA-256 digest is stamped directly into the broadcast deliverable's render\_manifest.json. Tying the rendered video frames mathematically to the exact geometry binaries stored in Cloudflare R2 ensures permanent auditability and bit-identical, offline-reproducible scene re-renders across decades of production.

---

*User prompt: {{FOCUS:  Ground Contact Alignment (ground\_contact\_pivot) }} /extreme-details*

### **Response: Ground Contact Alignment (ground\_contact\_pivot / anchor\_point)**

In both 2D procedural cutout puppetry (\[series\]-assets-visual) and 3D spatial pipelines (\[series\]-assets-3d), **Ground Contact Alignment** is the fundamental spatial invariant governing vertical registration and floor-plane locking. Without an authoritative ground contact pivot, procedural layout systems default to bounding-box midpoints or arbitrary container origins (0,0), triggering the **Floating Puppet Anomaly** (characters hovering above ground) or the **Terrain Clipping Defect** (characters sinking into the stage).

The anchor acts as the mathematical bridge connecting discrete stage topology to continuous rendering viewports.

### **1\. The Core Geometric Problem: The Decapitation & Floating Anomalies**

In standard layout and compositing frameworks (such as Remotion or headless Chromium viewports), elements default to top-left positioning (0,0).

> * **Variable Biological Height:** If a wiry character (e.g., Spleen) measures 960 px tall and a hunched character (e.g., Bog) measures 820 px tall, fixing their container tops to an arbitrary layout offset (e.g., top: 200px) causes Bog to float in mid-air while Spleen clips through the floor plane.  
> * **Variant Posture Shifts:** When an entity transitions between condition variants—such as switching from a tall neutral idle to a crouched humiliated or smug posture—the bounding-box dimensions and local pixel bounds shift dynamically. If positions are applied naively, switching emotional states produces violent vertical popping, ground-sliding, or camera misframing across cuts.

### **2\. Mathematical Formalization & Coordinate Invariants**

To eliminate visual jitter and maintain continuity across scene cuts, the layout engine enforces an invariant stage grounding law:

Ystage​≡Yground​

(References:)

where Yground​ is the immutable floor horizon line defined on the scene’s background environment plate or stage geometry mesh.

#### **A. 2D Layout Projection Math**

Given an authoring sprite canvas of dimensions *W*canvas​×*H*canvas​ (standard: 1024×1024 px), the character manifest exports the discrete ground contact pivot:

*A*\=(*Ax*​,*Ay*​)=(anchor\_point.x,anchor\_point.y)

(References:)

When staging the puppet at world canvas coordinates (*X*stage​,*Y*ground​) with an active scaling factor *s*∈\[0.5,1.5\] (used for camera perspective or depth staging), the top-left translation coordinates (TranslateX,TranslateY) are derived deterministically:

TranslateX=*X*stage​−(*Ax*​×*s*)  
TranslateY=*Y*ground​−(*Ay*​×*s*)

(References:)

#### **B. Affine Transform-Origin Projection**

To ensure that character scaling (push-ins, breathing squash/stretch, or perspective adjustments) originates from the point of physical support rather than the container center, the compiler projects the biological anchor into normalized CSS percentage coordinates:

originX%​\=(*W*canvas​*Ax*​​)×100%=(1024*Ax*​​)×100%  
originY%​\=(*H*canvas​*Ay*​​)×100%=(1024*Ay*​​)×100%

(References:)

> * **Example (Bog Base):** With *A*\=(512,980):  
>   originX%​\=1024512​×100%=50.0%,originY%​\=1024980​×100%=95.70%  
> * **Example (Bog Humiliated Variant):** With slouch shift *A*\=(518,980):  
>   originX%​\=1024518​×100%=50.58%,originY%​\=1024980​×100%=95.70%

#### **C. 3D Spatial Rig Alignment (\[series\]-assets-3d)**

In the 3D pipeline, the ground contact pivot operates in metric space (1.0 unit=1.0 meter):

> * ground\_contact\_pivot defines the vector offset *A*ground​\=(*x*0​,*y*0​,*z*0​) representing zero-elevation foot contact relative to the armature root bone.  
> * The world transformation matrix for the entity node is resolved prior to scene evaluation:  
>   *T*world​\=*P*stage\_spawn​−R⋅*A*ground​  
>   where R∈SO(3) represents the entity's active rotation matrix. This binds the bottom of the bounding volume directly to the environment's stage colliders.

### **3\. Automated Coordinate Extraction: Jules Optical Trace Pass**

To eliminate subjective artist guessing and coordinate drift across generative batches, anchor coordinates are extracted autonomously inside an isolated VM by the **Jules Coding Agent** using deterministic computer vision algorithms:

                  `CANDIDATE ASSET COMMITTED (take_XX.png)`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                      JULES OPTICAL TRACE PASS                          │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. Ingests candidate raster and bible spec                             │`  
`│ 2. Scans alpha channel upward from bottom row (y = 1023 -> 0)          │`  
`│ 3. Identifies lowest non-zero alpha clusters:                          │`  
`│      x_min = min(x | alpha(x, y_bottom) > 0)                           │`  
`│      x_max = max(x | alpha(x, y_bottom) > 0)                           │`  
`│ 4. Resolves contact baseline midpoint:                                 │`  
`│      A_x = floor((x_min + x_max) / 2)                                  │`  
`│      A_y = y_bottom                                                    │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   DETERMINISTIC SANITY GATES                           │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Canvas Bounds Gate: 0 <= A_x, A_y <= 1024                            │`  
`│ • Non-Empty Alpha Gate: alpha(A_x, A_y) > 0 (prevents transparent gap) │`  
`│ • Extraction Authority Rule: Deterministic CV overrides VLM guesses   │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Pass (Exit Code 0)`  
                                    `▼`  
       `ATOMIC PATCH COMMITTED TO characters/{character_id}/manifest.json`

(References:)

> * **Extraction Authority Rule:** Vision-Language Models (VLMs) are strictly forbidden from estimating pixel coordinates. The VLM is restricted to semantic validation (e.g., verifying that the expression reads as "humiliated" rather than generic "sad"), while deterministic alpha scanning extracts spatial anchors.  
> * **The Non-Empty Alpha Gate:** The CI linter probes the pixel at (*Ax*​,*Ay*​) and asserts *α*\>0. If the resolved coordinate falls in transparent space, the patch is rejected immediately, preventing "floating" registration points.

### **4\. Dynamic Contact Shadow Rigging & Kinetic Recoil**

Grounding a character requires both geometric positioning and optical interaction with the floor. The viewport compiler injects an automated dynamic contact shadow element centered squarely on the ground contact pivot:

`// Excerpt: Programmatic Contact Shadow Rigging in Viewport Layer`  
`<div`  
  `style={{`  
    `position: "absolute",`  
    `left: anchorPoint.x - 75,`  
    `top: anchorPoint.y - 15,`  
    `width: 150,`  
    `height: 30,`  
    `borderRadius: "50%",`  
    `background: "radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 75%)",`  
    ``transform: `scale(${shadowScale})`,``  
    `opacity: shadowOpacity,`  
    `mixBlendMode: "multiply",`  
  `}}`  
`/>`

(References:)

#### **Dynamic Recoil Coupling (animation\_hints)**

When an actor speaks or gestures, vertical motion physics are modulated by talk\_bounce\_amplitude (*y*bounce​):

Δ*y*\=sin(frame×*ω*)×talk\_bounce\_amplitude

(References:)

To grant the puppet tactile weight and prevent it from appearing as a flat sticker, the ground contact shadow dynamically modulates in inverse proportion to the character's vertical lift:

Scaleshadow​\=clamp(1.0−*h*max​*y*bounce​​×0.25,0.70,1.05)  
Opacityshadow​\=clamp(0.65−*h*max​*y*bounce​​×0.35,0.20,0.65)

(References:)

> * **Speech Recoil:** As *y*bounce​ rises, the shadow contracts and fades (0.65→0.40), indicating physical lift from the floor.  
> * **Landing Impact:** As *y*bounce​ compresses downward, the shadow expands up to 1.05× scale and reaches maximum opacity (0.65), locking the character firmly to the floor plane.

### **5\. Architectural Defect Routing: Code Error vs. Asset Defect**

During pre-flight testing and visual regression audits, grounding drift is classified into two distinct diagnostic paths to ensure repairs are applied to the correct layer:

| Defect Classification | Diagnostic Criterion | Operational Resolution |
| :---- | :---- | :---- |
| **ASSET\_ERROR** | Rendered foot contact drifts \>4px from *Y*ground​, but JSX properties in Episode\_XXX.tsx match manifest.json. | The underlying sprite or 3D mesh has an erroneous anchor. A ticket routes to the visual art vault; coding agents are **strictly barred from adding ad-hoc offsets in JSX** to mask flawed source art. |
| **CODE\_ERROR** | Rendered foot drifts, and the JSX properties in Episode\_XXX.tsx deviate from manifest.json. | The layout code is corrupt. Jules executes surgical AST surgery via ts-morph to restore strict manifest parity, verified locally via software rendering (--gl=swangle) across a 36-frame window at \$0.00 compute cost. |

---

*User prompt: {{FOCUS:  1\. Tagged Shallow Synchronization (sync-assets.ts) }} /extreme-details*

### **Response: Tagged Shallow Synchronization (sync-assets.ts)**

In the multi-repository fleet architecture, **scripts/sync-assets.ts** is the deterministic synchronization harness that bridges the master asset vaults (\[series\]-assets-3d / \[series\]-assets-visual) in **Cluster 04.assets** to downstream execution runtimes such as **\[series\]-viewport-template** (in Cluster 05.delivery) and staging caches.

It eliminates the operational vulnerabilities of Git submodules, isolates downstream rendering nodes from volatile upstream development, and implements a high-throughput, blobless Git LFS ingestion mechanism.

### **1\. Structural Rejection of Git Submodules**

Standard Git submodules present severe liabilities across automated rendering pipelines:

> * **Detached HEAD Pitfalls:** Submodules check out anonymous detached heads by default, leading to ambiguous upstream lineage and accidental untracked commits.  
> * **CI Credential Inheritance Failures:** Ephemeral cloud build runners or isolated Docker daemons often struggle to propagate SSH keys and OAuth tokens recursively across submodule boundaries.  
> * **Historical Binary Overhead:** Traditional recursive checkouts clone hundreds of historical commits and discarded binary iterations, causing disk bloat on local workstations and cloud workers.  
> * **Decoupled Sync Harness:** The pipeline replaces submodules with scripts/sync-assets.ts, executing targeted shallow clones (--depth 1\) directly into local staging directories while stripping nested .git metadata.

### **2\. The Ingestion Engine & Blobless Fetch Mechanics**

To pull certified tip meshes, armatures, stage hulls, and manifests without cloning multi-gigabyte LFS databases, sync-assets.ts executes a two-phase blobless ingestion sequence:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   TAGGED SHALLOW SYNCHRONIZATION                       │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ [series]-assets-3d (Remote Vault via Cloudflare R2 / Git LFS)          │`  
`│                                │                                       │`  
`│                                │ 1. git clone --depth 1                │`  
`│                                │              --branch <ref>           │`  
`│                                │              --filter=blob:none       │`  
`│                                │              --no-checkout            │`  
`│                                ▼                                       │`  
`│ [series]-viewport-template / cache/assets-3d/ (Local NVMe Buffer)     │`  
`│                                │                                       │`  
`│                                │ 2. git checkout HEAD                  │`  
`│                                │ 3. git lfs pull --include="..."       │`  
`│                                ▼                                       │`  
`│ Production-Certified Geometry, Armatures, and manifests Hydrated       │`  
`└────────────────────────────────────────────────────────────────────────┘`

(References:)

#### **Phase 1: Blobless Tree Checkout**

The initial fetch clones only the lightweight directory trees and metadata manifests (manifest.json, approved.json), filtering out file blobs entirely:

`git clone \`  
  `--depth 1 \`  
  `--branch v1.4.0 \`  
  `--filter=blob:none \`  
  `--no-checkout \`  
  `https://github.com/studio/[series]-assets-3d.git \`  
  `./cache/assets-3d/`

(References:)

#### **Phase 2: Selective LFS Hydration**

Rather than pulling every historical or experimental .glb, .blend, or high-poly sculpt file, Git LFS selectively hydrates only the production tip objects needed by downstream compositing engines:

`git checkout HEAD`  
`git lfs pull --include="characters/*/model.glb,environments/*/stage_geometry.glb,props/*/prop.glb"`

(References:)

This populates the local staging cache with production geometry while bypassing unbaked sculpts and intermediate drafts.

### **3\. Decoupled Version Locking (versions.json)**

Downstream compositors (Axis B / Representation) are structurally forbidden from tracking default branch heads (main or trunk). Instead, sync-assets.ts anchors itself to the fleet coordination manifest (versions.json):

`{`  
  `"$schema": "./schemas/versions.schema.json",`  
  `"cauldron_release": "v1.2.0",`  
  `"updated_at": "2026-09-27T00:00:00Z",`  
  `"repos": {`  
    `"[series]-lore": {`  
      `"ref": "v1.4.0",`  
      `"commit": "9c3e401",`  
      `"role": "Narrative Canon & Zod Schemas"`  
    `},`  
    `"[series]-viewport-template": {`  
      `"ref": "main",`  
      `"commit": "a3f9c21",`  
      `"role": "Compositor & Scene Engine"`  
    `},`  
    `"[series]-assets-3d": {`  
      `"ref": "v1.4.0",`  
      `"commit": "b71fa02",`  
      `"role": "Certified 3D Meshes, Armatures & Stage Colliders"`  
    `}`  
  `},`  
  `"enforce_lock": true`  
`}`

(References:)

#### **Pinning Archetypes**

> * **Floating Stable Tags (latest-stable):** Points to the most recently verified asset set. Used primarily for daily local builds and iterative animatic drafts.  
> * **Permanent Semver Tags (v1.4.0) or Commit SHAs:** Locks historical episode builds to an immutable state.  
> * **Insulation Guarantee:** If \[series\]-assets-3d is updated upstream with new character models or revised stage hulls, downstream rendering pipelines remain anchored to v1.4.0 until a formal lockfile upgrade pull request is merged.

### **4\. Implementation Specification (sync-assets.ts)**

The synchronization harness automates the fetch, cache hydration, and pre-flight validation workflow:

`// scripts/sync-assets.ts`  
`import { execSync } from 'node:child_process';`  
`import { existsSync, rmSync, mkdirSync, readFileSync } from 'node:fs';`  
`import path from 'node:path';`

`interface AssetSource {`  
  `repoKey: string;`  
  `repoUrl: string;`  
  `targetDir: string;`  
  `lfsFilterPattern: string;`  
`}`

`const ASSET_SOURCES: AssetSource[] = [`  
  `{`  
    `repoKey: '[series]-assets-3d',`  
    `repoUrl: 'https://github.com/studio/[series]-assets-3d.git',`  
    `targetDir: 'public/assets/3d',`  
    `lfsFilterPattern: 'characters/*/model.glb,environments/*/stage_geometry.glb,props/*/prop.glb',`  
  `},`  
`];`

`export function syncAssets(): void {`  
  `const versionsPath = path.resolve(process.cwd(), 'data/versions.json');`  
  `if (!existsSync(versionsPath)) {`  
    `console.error('>> [FATAL] data/versions.json lockfile not found.');`  
    `process.exit(1);`  
  `}`

  `const versions = JSON.parse(readFileSync(versionsPath, 'utf8'));`

  `for (const source of ASSET_SOURCES) {`  
    `const repoConfig = versions.repos?.[source.repoKey];`  
    `if (!repoConfig) {`  
      ``console.warn(`>> [WARN] Repo '${source.repoKey}' not defined in versions.json. Skipping.`);``  
      `continue;`  
    `}`

    `const ref = repoConfig.ref || 'latest-stable';`  
    `const commit = repoConfig.commit;`  
    `const targetPath = path.resolve(process.cwd(), source.targetDir);`

    ``console.log(`>> [SYNC] Hydrating ${source.repoKey} @ ${ref} -> ${source.targetDir}`);``

    `// 1. Purge stale staging cache`  
    `if (existsSync(targetPath)) {`  
      `rmSync(targetPath, { recursive: true, force: true });`  
    `}`  
    `mkdirSync(targetPath, { recursive: true });`

    `// 2. Perform blobless shallow clone`  
    `execSync(`  
      `` `git clone --depth 1 --branch ${ref} --filter=blob:none --no-checkout ${source.repoUrl} "${targetPath}"`, ``  
      `{ stdio: 'inherit' }`  
    `);`

    `// 3. Optional hard commit alignment`  
    `if (commit) {`  
      ``console.log(`>> [PIN] Aligning to explicit commit SHA: ${commit}`);``  
      ``execSync(`git checkout ${commit}`, { cwd: targetPath, stdio: 'inherit' });``  
    `} else {`  
      `execSync('git checkout HEAD', { cwd: targetPath, stdio: 'inherit' });`  
    `}`

    `// 4. Hydrate tip binary assets via Git LFS`  
    ``console.log(`>> [LFS] Hydrating objects: ${source.lfsFilterPattern}`);``  
    ``execSync(`git lfs pull --include="${source.lfsFilterPattern}"`, {``  
      `cwd: targetPath,`  
      `stdio: 'inherit',`  
    `});`

    `// 5. Isolate directory: strip nested .git database to maintain a clean tree`  
    `rmSync(path.join(targetPath, '.git'), { recursive: true, force: true });`

    `// 6. Pre-flight manifest contract audit`  
    `const manifestPath = path.join(targetPath, 'manifest.json');`  
    `if (existsSync(manifestPath)) {`  
      ``console.log(`>> [OK] Master manifest.json verified for ${source.repoKey}`);``  
    `} else {`  
      ``console.warn(`>> [WARN] No root manifest.json found at ${ref} — proceeding with caution`);``  
    `}`  
  `}`

  `console.log('>> [SUCCESS] Tagged asset synchronization completed.');`  
`}`

`if (process.argv[1]?.endsWith('sync-assets.ts')) {`  
  `syncAssets();`  
`}`

(References:)

#### **Integration into Build Hooks**

To ensure assets are synchronized before dev servers or compile passes run, the script is registered into package.json:

`{`  
  `"scripts": {`  
    `"presync": "echo '>> Validating external asset dependencies...'",`  
    `"sync-assets": "tsx scripts/sync-assets.ts",`  
    `"prebuild": "npm run sync-assets",`  
    `"predev": "npm run sync-assets"`  
  `}`  
`}`

(References:)

Target staging paths (public/assets/3d/, public/assets/visual/) remain strictly excluded via .gitignore. Assets are treated as **generated runtime inputs** rather than checked-in source code, keeping the compositor's Git history lean and auditable.

---

*User prompt: {{FOCUS:  2\. Spatial Invariants & 3D Coordinate Mathematics }} /extreme-details*

### **Response: Spatial Invariants & 3D Coordinate Mathematics**

In **\[series\]-assets-3d**, spatial invariants and coordinate mathematics eliminate runtime layout guesswork, coordinate drift, and floating artifacts across downstream viewports, headless scene builders (e.g., Babylon.js, Three.js), and hybrid diffusion harnesses (e.g., ControlNet depth/normal passes).

Rather than allowing rendering nodes to parse loose meshes or calculate dynamic offsets on the fly, the architecture binds **metric invariants, spatial transforms, and bone sockets** into the immutable contract of manifest.json.

### **1\. Authoritative Coordinate Reference Systems (CRS)**

To interface between upstream discrete topological engines (\[series\]-spatial) and downstream continuous rendering contexts, the 3D pipeline defines rigid reference standards:

  `Discrete Tactical Lattice              Local Metric Continuous Space             Downstream Hardware Viewport`  
`┌───────────────────────────┐          ┌───────────────────────────────┐         ┌──────────────────────────────┐`  
`│ Doubled Axial Hex Lattice │ ───────► │ Metric Stage Space            │ ──────► │ Camera Screen Projection     │`  
`│ (q, r, s = -q - r)        │  Affine  │ (X, Y, Z) in Meters           │ Direct3D│ Hardware Pixels (Xpx, Ypx)   │`  
`│ Units: Integer Steps      │  Bridge  │ Right-Handed (+Y Up, +Z Fwd)  │ / OpenGL│ Clip-space [-1.0, 1.0]       │`  
`└───────────────────────────┘          └───────────────────────────────┘         └──────────────────────────────┘`

(References:)

> * **Metric Standard:** All spatial geometry operates in real-world metric units where **1.0 unit≡1.0 meter**.  
> * **Coordinate Handedness:** Assets in \[series\]-assets-3d enforce the standard glTF 2.0 convention: **Right-Handed Cartesian System**, where:  
  * \+Y is the vertical axis (Elevation / Up).  
  * \+Z is the forward-facing normal (Forward).  
  * \+X is the lateral axis (Right-hand cross-product: *X*\=*Y*×*Z*).  
> * **Tactical Lattice Projection Bridge:** When converting positions from \[series\]-spatial’s integer hex lattice (*q*,*r*) into continuous 3D stage coordinates (*X*stage​,*Z*stage​), the engine maps doubled coordinates directly into metric centroids:  
>   *X*stage​\=*R*hex​⋅3​⋅(*q*\+2*r*​)  
>   *Z*stage​\=*R*hex​⋅23​⋅*r*  
>   *(where Rhex​ is the canonical circumradius of the cell in meters)*.

### **2\. The Ground Contact Invariant (ground\_contact\_pivot)**

Automated staging systems frequently suffer from the **"Floating Puppet Anomaly"** (models hovering above floors) or the **"Terrain Clipping Defect"** (feet penetrating floor geometry) due to posture changes and biological variance across character variants.

#### **Mathematical Floor Locking**

Vertical stage placement is bound to an absolute floor invariant:

*Y*contact​≡*Y*ground​

(References:)

where *Y*ground​ is the exact elevation coordinate of the environment’s collision shell at point (*X*stage​,*Z*stage​).

                           `GROUND CONTACT MATRIX ALIGNMENT`  
                             
       `Local Rig Origin: (0,0,0) [Root Bone]`  
             `│`  
             `│   - A_ground (Vector offset to sole baseline)`  
             `▼`  
       `┌───────────┐`  
       `│   Mesh    │`  
       `│  Armature │`  
       `│           │`  
       `└─────┬─────┘`  
             `▼`  
   `══════════*══════════ Floor Horizon Plane (Y_ground)`  
       `[ground_contact_pivot]`

(References:)

> 1. **Local Pivot Declaration:** In manifest.json, the character declares an exact vector offset from the armature root to the lowest sole contact point:  
>    *A*ground​\=(*x*pivot​,*y*pivot​,*z*pivot​)  
> 2. **Transform Evaluation:** To position the 3D entity at world coordinate *P*stage​\=(*X*stage​,*Y*ground​,*Z*stage​) with rotation R∈SO(3) and uniform scale *s*, the world translation matrix *T*world​ is computed as:  
>    *T*world​\=*P*stage​−*s*⋅(R⋅*A*ground​)  
>    (References:)  
>    This guarantees that even when an entity slouches, takes a wide combat stance, or switches to a variant mesh (e.g., transitioning from idle to humiliated), its feet remain locked to *Y*ground​ without vertical jitter or sliding across camera cuts.

### **3\. Programmatic Camera Trajectories & Decapitation Prevention**

In automated scene composition, dramatic beats (such as a Swain Motivation-Reaction Unit visceral reflex or spent character string) trigger programmatic camera punch-ins and close-ups.

If a camera scales toward an arbitrary geometric center or bounding-box midpoint (0.0,0.0,0.0), differences in character height cause close-up cameras to cut off foreheads or zoom into empty chest cavities—a failure mode termed the **Decapitation Defect**.

#### **A. Focal Target Vector (crash\_zoom\_target)**

The manifest declares the exact coordinate target centered on the facial centroid, bridge of the nose, or eye line:

*C*local​\=(*x*target​,*y*target​,*z*target​)

(References:)

#### **B. World-Space Camera Trajectory**

When a close-up or push-in is executed, the camera's LookAt vector does not point at the character's base origin; it resolves dynamically to the world-projected focal target:

*P*lookat​\=*T*world​\+*s*⋅(R⋅*C*local​)

(References:)

               `PROGRAMMATIC 3D CAMERA INTERPOLATION (CRASH ZOOM)`  
                 
  `Wide Framing                                               Close-Up Framing`  
`┌─────────────────────────┐                                ┌─────────────────────────┐`  
`│ Camera Viewport         │                                │ Camera Viewport         │`  
`│                         │                                │      ┌───────────┐      │`  
`│                         │        LookAt Interpolates     │      │* P_lookat │      │`  
`│      ┌───────────┐      │       ─────────────────────►   │      │ (Centroid)│      │`  
`│      │* P_lookat │      │                                │      └─────┬─────┘      │`  
`│      │ (Centroid)│      │                                │            │            │`  
`│      └─────┬─────┘      │                                │            ▼            │`  
`│            │            │                                └─────────────────────────┘`  
`│            ▼            │                                (Eye-Line Locked; Zero Decapitation)`  
`│ ═══════════*═══════════ │`  
`└─────────────────────────┘`

(References:)

#### **C. Camera Lens & Directorial Mechanics**

Using physical camera parameters, the view matrix V(*t*) and projection matrix Mproj​ interpolate across the shot duration:

FOV(*t*)=interpolate(*t*,\[0,*t*sting​\],\[FOVwide​,FOVtight​\])  
*P*cam​(*t*)=*P*lookat​\+*d*(*t*)⋅*u*camera\_angle​

(References:)

Because *P*lookat​ is computed from the variant's manifest, short goblins (e.g., Spleen) and tall rigid figures (e.g., Wart) can share identical directorial camera directives without custom layout branches.

### **4\. Modular Socket Matrix Kinematics (attachment\_sockets)**

Props and equipment (such as scrap blades, lanterns, and brass levers) are never merged directly into static character meshes. Instead, props maintain independent physical models that mount to character skeletal armatures through **Socket Matrix Kinematics**:

#### **Forward Kinematics Socket Transform**

A character manifest exposes an attachment map binding logical names to skeletal joint identifiers:

`"attachment_sockets": {`  
  `"socket_hand_r": "bone_wrist_R",`  
  `"socket_hand_l": "bone_wrist_L",`  
  `"socket_jaw": "bone_mandible",`  
  `"socket_belt": "bone_pelvis"`  
`}`

When an entity equips an item, the local prop matrix Mprop​ is transformed by the global joint transformation matrix Mjoint​(*t*) computed by the animation skinning engine:

Mworld\_prop​(*t*)=Mworld\_entity​⋅Mjoint​(*t*)⋅Tsocket\_offset​⋅Rsocket\_rot​

> * **Somatic Invariant Validation (*T*0​):** Before solving kinematics, the engine evaluates whether the character possesses the physical capacity to hold the prop. If banned\_kinetic\_verbs includes "manipulate\_right" or if upper-limb capacity is insufficient:  
>   ∑occupies\_hands\>ArmsAvailable  
>   (References:)  
>   the compilation compiler rejects the shot with a SOMATIC\_CAPACITY\_VIOLATION before allocating render compute.

### **5\. Viseme Kinematics: Morph Targets vs. Bone Drivers**

In flat 2D cutout puppetry, speech is handled by overlaying Preston Blair bounding-box sprites (mouth\_bounding\_box). In \[series\]-assets-3d, phonetic articulation is abstracted into continuous GPU-accelerated facial targets:

#### **Morph Target (Blend Shape) Mapping**

The manifest binds canonical phonemes (closed, small, medium, wide) to glTF morph target indices:

`"viseme_driver": {`  
  `"type": "morph_targets",`  
  `"target_node": "mesh_head",`  
  `"viseme_map": {`  
    `"closed": "target_mouth_closed",`  
    `"small": "target_mouth_small",`  
    `"medium": "target_mouth_medium",`  
    `"wide": "target_mouth_wide"`  
  `}`  
`}`

#### **Acoustic Weight Modulation**

Given speech RMS energy *E*rms​(*t*) extracted from the master 48 kHz audio stem, vertex positions *V*final​ are evaluated per frame on the GPU:

*V*final​\=*V*base​\+*k*∈{visemes}∑​*wk*​(*t*)⋅Δ*Vk*​

where weights *wk*​(*t*)∈\[0.0,1.0\] are driven continuously by the phonetic alignment track, eliminating 2D sprite "popping" while preserving identical audio-clock synchronization.

### **6\. Kinetic Physics & Micro-Motion Noise (animation\_hints)**

To avoid the **"Mechanical Metronome Defect"**—where procedural rigs cycle through identical, rigid mathematical curves—manifest.json parameterizes physical mass, somatic fatigue, and emotional anxiety directly into kinetic scalars:

> * **Conversational Talk Bounce (*y*bounce​):** Displaces the center of mass vertically during active dialogue:  
>   Δ*Y*(*t*)=sin(*ω*bounce​⋅*t*)⋅talk\_bounce\_amplitude  
>   Heavy, dominant characters possess low amplitudes (e.g., 4 mm), while manic or subservient characters possess high amplitudes (e.g., 18 mm).  
> * **Somatic Shiver / Pathological Tremor:** When a character enters a somatic state of terror, hypothermia, or dust poisoning, high-frequency rotational jitter is injected into the spine and skull armatures:  
>   Δ*θ*jitter​(*t*)=Mulberry32(*t*)⋅idle\_shiver\_amplitude  
>   (References:)  
>   This injects believable somatic micro-tremors directly through bone transforms without requiring dedicated hand-keyed animations for every emotional state.

---

*User prompt: {{FOCUS:  2\. Spatial Invariants & 3D Coordinate Mathematics }} /extreme-details*

### **Response: Spatial Invariants & 3D Coordinate Mathematics**

In **\[series\]-assets-3d** (and across its interface with \[series\]-spatial), spatial invariants and coordinate mathematics prevent floating puppets, decapitated camera zooms, broken line-of-sight (LoS), and non-deterministic physics across runtimes.

The architecture strictly separates:

> * **Discrete Tactical Interiors** (\[series\]-spatial, where space is an exact, integer-driven causal lattice)  
> * **Continuous Metric Stage Space** (\[series\]-assets-3d, where meshes, armatures, and sockets operate in real-world metric units)  
> * **Downstream Viewports / Projection Systems** (\[series\]-viewport-template, where 3D cameras and compositors project geometry onto hardware pixels).

### **1\. Dual Coordinate Reference Systems & The Projection Bridge**

To prevent floating-point platform divergence, non-deterministic ray-triangle clipping, and IEEE-754 discrepancies across execution nodes (e.g., Node.js V8 vs. browser WebAssembly vs. GPU headless daemons), spatial reasoning is partitioned across a mathematical bridge:

  `Discrete Tactical Lattice (hexgeom)            Metric Continuous Stage Space                Hardware Screen / Viewport`  
`┌──────────────────────────────────────┐       ┌───────────────────────────────┐            ┌────────────────────────────┐`  
`│ Doubled Axial Integer Lattice        │ ────► │ Metric Continuous Stage Space │ ─────────► │ Hardware Viewport          │`  
`│ (q, r, s = -q - r)                   │ Affine│ (X, Y, Z) in Meters           │ Direct3D / │ Clip-Space [-1.0, 1.0]     │`  
`│ Centroid: (4q + 2r, 6r)              │ Bridge│ Right-Handed (+Y Up, +Z Fwd)  │ OpenGL     │ Pixels (Xpx, Ypx)          │`  
`└──────────────────────────────────────┘       └───────────────────────────────┘            └────────────────────────────┘`

(References:)

#### **A. The Exact Integer Tactical Lattice (hexgeom)**

Interior stages (crawlspaces, pipe intersections, conduits) operate on an exact axial integer grid (*q*,*r*) with planar constraint *q*\+*r*\+*s*\=0.

> * **Pointy-Top Cartesian Centroid (circumradius *s*\=2):**  
>   *x*\=*s*⋅3​⋅(*q*\+2*r*​)\=3​⋅(2*q*\+*r*),*y*\=*s*⋅(23​)⋅*r*\=3*r*  
>   (References:)  
> * **Affine X-Stretch (1/3​):** Dividing *x* by 3​ eliminates the irrational square root. Because affine transformations preserve straight-line incidence, collinearity, convexity, and segment-polygon intersections, integer cross-products in this space remain exact.  
> * **Doubled Coordinate Scaling (2×):** Multiplying all axes by 2 ensures that cell centers, edge midpoints, and polygon vertices all land on integer coordinates:  
  * Centroid(*q*,*r*)=(4*q*\+2*r*,6*r*)  
  * Vertices=(*cx*,*cy*±4),(*cx*±2,*cy*±2)  
  * Edge Midpoints=(*cx*±1,*cy*±3),(*cx*±2,*cy*)  
> * **The Affine Caveat:** Euclidean distance formulas do not apply within this stretched integer space. All topological range and step calculations must use the axial distance metric:  
>   *d*axial​(*a*,*b*)=2∣*qa*​−*qb*​∣+∣(*qa*​\+*ra*​)−(*qb*​\+*rb*​)∣+∣*ra*​−*rb*​∣​\=max(∣*qa*​−*qb*​∣,∣*ra*​−*rb*​∣,∣*sa*​−*sb*​∣)  
>   (References:)

#### **B. Continuous Metric Stage Space (\[series\]-assets-3d)**

When a 3D asset is instantiated, the tactical cell coordinates are mapped into continuous metric Cartesian space via the site’s canonical cell pitch (*L*pitch​, measured in integer millimeters):

*X*stage​\=(1000*L*pitch​​)⋅3​⋅(*q*\+2*r*​),*Z*stage​\=(1000*L*pitch​​)⋅23​⋅*r*

In this space, glTF 2.0 conventions govern:

> * \+Y is elevation (Up)  
> * \+Z is forward normal (Forward)  
> * \+X is lateral right (*X*\=*Y*×*Z*)  
> * 1.0 unit≡1.0 meter

### **2\. The Ground Contact Invariant (ground\_contact\_pivot)**

Procedural staging engines frequently suffer from the **"Floating Puppet Anomaly"** (assets hovering above floor hulls) or the **"Terrain Clipping Defect"** (feet sinking into floor geometry). This issue is exacerbated when dynamic characters switch between different emotional variants with shifting postures (e.g., swapping a tall neutral idle for a hunched humiliated mesh).

                           `GROUND CONTACT MATRIX ALIGNMENT`  
                             
       `Armature Root Origin: (0, 0, 0)`  
             `│`  
             `│   - A_ground (Vector offset to lowest sole contact point)`  
             `▼`  
       `┌───────────┐`  
       `│   Mesh    │`  
       `│  Armature │`  
       `│           │`  
       `└─────┬─────┘`  
             `▼`  
   `══════════*══════════ Floor Horizon Plane (Y_ground)`  
       `[ground_contact_pivot]`

(References:)

#### **Formal Staging Law**

Vertical alignment is bound to an absolute invariant:

*Y*contact​≡*Y*ground​

(References:)

where *Y*ground​ is the exact elevation coordinate of the environment’s collision shell at point (*X*stage​,*Z*stage​).

> 1. **Pivot Declaration in manifest.json:** The manifest exports the discrete metric vector offset from the armature root node to the lowest sole contact point:  
>    *A*ground​\=(*x*pivot​,*y*pivot​,*z*pivot​)  
> 2. **Deterministic Transform Evaluation:** Given a world target spawn *P*stage​\=(*X*stage​,*Y*ground​,*Z*stage​), uniform scale scalar *s*, and rotation matrix R∈SO(3), the translation matrix *T*world​ is resolved as:  
>    *T*world​\=*P*stage​−*s*⋅(R⋅*A*ground​)  
>    (References:)  
>    This ensures that regardless of mesh variant or bone slouch, the model's feet remain locked to the collision hull across cuts and tracking moves without manual per-frame keyframing.

### **3\. Programmatic Camera Trajectories & The Decapitation Defect**

When automated scene compilers trigger dramatic close-ups or push-ins (e.g., reacting to a Swain Motivation-Reaction Unit beat), centering the camera on a container's geometric origin or bounding box midpoint (0,0,0) creates the **Decapitation Defect**. Shorter characters have their foreheads clipped off, while taller characters have their facial features framed completely out of the viewport.

               `PROGRAMMATIC 3D CAMERA INTERPOLATION (CRASH ZOOM)`  
                 
  `Wide Stage Viewport                                        Extreme Close-Up (Crash Zoom)`  
`┌───────────────────────────┐                              ┌───────────────────────────┐`  
`│ Viewport Frame            │                              │ Viewport Frame            │`  
`│                           │                              │      ┌───────────┐        │`  
`│                           │      LookAt Interpolation    │      │* P_lookat │        │`  
`│       ┌───────────┐       │     ──────────────────────►  │      │(Eye-Line) │        │`  
`│       │* P_lookat │       │                              │      └─────┬─────┘        │`  
`│       │ (Centroid)│       │                              │            │              │`  
`│       └─────┬─────┘       │                              │            ▼              │`  
`│             │             │                              └───────────────────────────┘`  
`│             ▼             │                              (Facial Features Centered; Zero Decapitation)`  
`│  ═══════════*═══════════  │`  
`└───────────────────────────┘`

(References:)

#### **A. Metric Focal Centroid Target (crash\_zoom\_target)**

The manifest isolates the exact physical coordinate target centered on the facial centroid, bridge of the nose, or eye line:

*C*local​\=(*x*target​,*y*target​,*z*target​)

(References:)

#### **B. Dynamic World LookAt Resolution**

During runtime execution, the camera's LookAt target vector interpolates dynamically toward the transformed focal vector rather than the entity root:

*P*lookat​(*t*)=*T*world​\+*s*⋅(R(*t*)⋅*C*local​)

(References:)

#### **C. Directorial Interpolation Math**

Given camera distance *d*(*t*), field of view FOV(*t*), and orientation vector *u*cam​:

*P*cam​(*t*)=*P*lookat​(*t*)+*d*(*t*)⋅*u*cam​

Because *P*lookat​ is derived from the variant’s manifest contract, actors of differing physical statures execute identical shot trajectories without bespoke animation patching.

### **4\. Symmetric Integer Supercover & The EDGE\_PAIR Policy**

Line-of-sight (LoS) raycasting in tactical 3D spaces is not computed via floating-point vector intersection. Floating-point approximations violate **optical reciprocity** (LoS(*A*,*B*)≡LoS(*B*,*A*)) along diagonal ray sweeps.

`Doubled Integer Coordinate Lattice (Centroid cx = 4q + 2r, cy = 6r)`  
                           `(cx, cy + 4)`  
                               `▲`  
                              `/ \`  
        `(cx - 1, cy + 3) *   /   \   * (cx + 1, cy + 3)`  
                            `/     \`  
   `(cx - 2, cy + 2) ◄──────*   •   *──────► (cx + 2, cy + 2)`  
                           `| (cx,cy|`  
      `(cx - 2, cy)  *      |       |      * (cx + 2, cy)`  
                           `|       |`  
   `(cx - 2, cy - 2) ◄──────*       *──────► (cx + 2, cy - 2)`  
                            `\     /`  
        `(cx - 1, cy - 3) *   \   /   * (cx + 1, cy - 3)`  
                              `\ /`  
                               `▼`  
                           `(cx, cy - 4)`

(References:)

#### **A. Exact Integer Cross-Product Raycasting**

Intersection between ray segment *AB* and polygon edge *CD* evaluates via exact 2D integer cross-products with zero floating-point operations:

crossProduct(*A*,*B*,*C*)=(*Bx*​−*Ax*​)(*Cy*​−*Ay*​)−(*By*​−*Ay*​)(*Cx*​−*Ax*​)

(References:)

#### **B. The Authoritative EDGE\_PAIR Boundary Policy**

To eliminate grazing ambiguities when a ray runs along cell boundaries or clips a shared corner:

> 1. **Collinear Edge Grazing:** A ray running along the boundary between Hex *U* and Hex *V* is occluded if and only if an edge occluder exists on that shared boundary **OR** both Hex *U* and Hex *V* are opaque cells.  
> 2. **Vertex Passage:** A ray passing directly through a vertex shared by three hexagons is occluded if and only if at least 2 of the 3 adjacent hexes are opaque (majority rule).  
> 3. **Endpoint Exemption:** The origin cell *A* and destination cell *B* are transparent to their own emitted and received rays.

#### **C. The 8,190-Pair Oracle Verification**

In a canonical radius-5 hex disk (91 cells), every ordered pair (91×90=8,190 pairs) is audited against an independent rational reference model. This mathematical test suite confirms optical symmetry across all possible cell pairs in the presence of asymmetric barriers before assets are promoted:

LoS(*A*,*B*)≡LoS(*B*,*A*)∀(*A*,*B*)∈Disk(5)2

(References:)

### **5\. Forward Kinematics Socket Architecture (attachment\_sockets)**

Props, tools, and weapons are never permanently merged into base character meshes. Instead, props remain independent mesh binaries attached at runtime through skeletal bone sockets:

`┌────────────────────────────────────────────────────────┐`  
`│               FORWARD KINEMATICS MOUNT                 │`  
`├────────────────────────────────────────────────────────┤`  
`│ Entity Armature Root                                   │`  
`│    └── Torso Bone                                      │`  
`│           └── Clavicle_R                               │`  
`│                  └── Arm_R                             │`  
`│                         └── Wrist_R                    │`  
`│                                └── socket_hand_r       │`  
`│                                           │            │`  
`│                     Transformed By:       ▼            │`  
`│                     M_world_prop(t) =                  │`  
`│                       M_world_entity · M_joint(t) ·    │`  
`│                       T_socket_offset · R_socket_rot   │`  
`│                                           │            │`  
`│                                           ▼            │`  
`│                             Prop Mesh Origin (prop.glb)│`  
`└────────────────────────────────────────────────────────┘`

(References:)

#### **Pre-Flight Biological SAT Check (*T*0​)**

Before kinematics matrices are solved, the simulation compiler evaluates the character's biological equip capacity:

*i*∈HeldItems∑​occupies\_hands(*i*)≤ArmsAvailable

(References:)

If an asset manifest attempts to mount an item to socket\_hand\_r while the character's canonical condition lists an amputated arm or banned\_kinetic\_verbs: \["manipulate\_right"\], the compiler terminates with a SOMATIC\_CAPACITY\_VIOLATION at Step 0 (*T*0​\=\$0.00), preventing broken rigs from ever reaching render compute.

### **6\. Kinetic Physics Parameterization (animation\_hints)**

To avoid the **Mechanical Metronome Defect**—where automated puppets move with identical, uniform procedural curves—manifest.json parameterizes biological mass, emotional stress, and somatic condition into deterministic scalars:

| Manifest Parameter | Mathematical Formulation | Kinetic Execution Function |
| :---- | :---- | :---- |
| **talk\_bounce\_amplitude** | Δ*Y*(*t*)=sin(*ωt*)⋅*A*bounce​ | Vertical displacement of the center-of-mass during active dialogue beats. |
| **idle\_shiver\_amplitude** | Δ*θ*(*t*)=Hash(*t*)⋅*A*shiver​ | High-frequency rotational micro-tremor injected into skull/spine armatures during high-stress states. |
| **mass\_scalar** | *T*ease​\=*T*base​⋅*M*scalar​​ | Modulates velocity easing curves, imparting inertia to heavy actors. |
| **idle\_sway\_amplitude\_px** | Δ*X*(*t*)=cos(*ω*sway​*t*)⋅*A*sway​ | Horizontal posture drift across camera holds. |

Through these mathematical invariants, \[series\]-assets-3d functions as a fully deterministic, strongly typed spatial API—protecting broadcast renders from spatial tearing, floating assets, and visual jitter.

---

*User prompt: {{FOCUS:  2\. Standardized Directory Topology }} /extreme-details*

### **Response: Standardized Directory Topology (\[series\]-assets-3d)**

Operating within **Cluster 04.assets (The Source Art Vault)** on **Axis B (Representation / Artifact Hardening)**, **\[series\]-assets-3d** provides an immutable, strongly typed, read-only 3D spatial API for downstream compositors and scene builders (e.g., Three.js, Babylon.js, Remotion, and headless diffusion passes).

Rather than serving as a loose storage bin for arbitrary DCC (Digital Content Creation) files, the repository enforces a deterministic physical hierarchy. This structure isolates heavy binary meshes, protects against repository bloat via Git LFS, and binds all spatial invariants to machine-readable JSON schemas.

### **1\. Root-Level Anatomy & Configuration**

`[series]-assets-3d/`  
`├── .gitattributes                    # Enforces Git LFS pointer tracking for binary assets`  
`├── .gitignore                        # Prevents OS junk, temp DCC caches, and node_modules leakage`  
`├── CHANGELOG.md                      # Human-readable iteration and semantic version tagging log`  
`├── ASSET_GUIDE.md                    # Polycount budgets, draw calls, PBR standards, and unit scale norms`  
`├── package.json                      # Validation scripts, integrity test runners, and asset linters`  
`├── tsconfig.json                     # Strict TypeScript rules for validation scripts and schemas`  
`├── data/`  
`│   ├── versions.json                 # Pinned fleet coordination lockfile and drift manifest`  
`│   └── directive/                    # Append-only causal architectural directives`  
`│       ├── day-000/                  # Canonical bootstrap, schemas, and infrastructure seeding`  
`│       │   ├── 001.bootstrap.jules.md`  
`│       │   ├── 002.mesh-contract.gravity.md`  
`│       │   └── 003.lfs-audit.ag-test.md`  
`│       └── day-XXX/                  # Settled historical workday shifts`  
`├── schemas/`  
`│   ├── mesh_manifest.v1.json         # JSON Schema governing characters, props, and environments`  
`│   └── approved_3d.schema.json       # JSON Schema governing the candidate triage ledger`  
`├── characters/                       # Certified 3D character puppets, armatures, and variants`  
`├── environments/                     # Certified 3D stage colliders, room geometry, and occlusion hulls`  
`└── props/                            # Equippable items, physical scrap, tools, and socket attachments`

(References:)

#### **Git LFS Tracking Rules (.gitattributes)**

Standard Git object databases cannot store high-frequency 3D binary mutations without incurring permanent repository bloat. The root .gitattributes mandates that all heavy geometries, textures, and DCC project files are tracked exclusively through Git LFS backed by Cloudflare R2 object storage:

`# Git LFS Binary Invariant Rules`  
`*.glb filter=lfs diff=lfs merge=lfs -text`  
`*.gltf filter=lfs diff=lfs merge=lfs -text`  
`*.bin filter=lfs diff=lfs merge=lfs -text`  
`*.blend filter=lfs diff=lfs merge=lfs -text`  
`*.blend1 filter=lfs diff=lfs merge=lfs -text`  
`*.fbx filter=lfs diff=lfs merge=lfs -text`  
`*.obj filter=lfs diff=lfs merge=lfs -text`  
`*.png filter=lfs diff=lfs merge=lfs -text`  
`*.webp filter=lfs diff=lfs merge=lfs -text`  
`*.exr filter=lfs diff=lfs merge=lfs -text`  
`*.hdr filter=lfs diff=lfs merge=lfs -text`

(References:)

Only lightweight pointers (∼130 bytes) reside in Git commit trees, preventing .git/objects from accumulating gigabytes of historical binary garbage.

#### **The Append-Only Causal Ledger (data/directive/day-XXX/)**

In lockstep with studio-wide standards, data/directive/ maintains an append-only causal record of all architectural mutations, schema updates, and asset promotions. It enforces the **Precedent Precedence Rule**: higher-numbered days represent settled law and supersede earlier days.

### **2\. Character Domain Subsystem (characters/\<character\_id\>/)**

Every character registered in the canonical world bible (001.\[series\]-lore) maintains an isolated directory housing its base puppet armature, production condition variants, and triage staging area:

`characters/`  
`└── <character_id>/                   # Canonical entity slug (e.g., char_bog, char_spleen)`  
    `├── manifest.json                 # Strongly typed 3D puppet contract (spatial anchors, sockets)`  
    `├── model.glb                     # Production-certified runtime mesh + skeletal rig`  
    `├── textures/                     # PBR maps (Power-of-Two: 1024x1024 / 2048x2048)`  
    `│   ├── base_color.png`  
    `│   ├── normal.png`  
    `│   ├── roughness_metallic.png`  
    `│   └── emissive.png`  
    `├── variants/                     # Permanent somatic & condition variants`  
    `│   ├── <condition_id>.glb        # e.g., severed_arm.glb, humiliated.glb`  
    `│   └── textures/`  
    `├── source/                       # LFS-tracked master DCC source files`  
    `│   ├── rig_master.blend`  
    `│   └── highpoly_sculpt.blend`  
    `└── triage_bank/                  # Isolated intake for generative/photogrammetry candidate takes`  
        `├── take_01/`  
        `│   ├── candidate.glb`  
        `│   └── render_preview.png`  
        `├── take_02/`  
        `│   ├── candidate.glb`  
        `│   └── render_preview.png`  
        `└── approved_3d.json          # Triage Audit Record & Rejection Ledger`

(References:)

#### **Character Directory Functional Invariants**

> * **The Single-Root glTF Standard (model.glb):** The primary runtime model is always delivered as a binary glTF (.glb) containing baked skinning, bone armatures, and optional morph targets.  
> * **Decoupled Source Files (source/):** Multi-gigabyte .blend and .fbx working sculpts reside strictly within source/. Downstream episode harvesters are filtered to ignore source/, preventing local animation caches from pulling master sculpt data.  
> * **Candidate Triage Quarantining (triage\_bank/):** Generative 3D candidates (e.g., NeRF/Gaussian splat extractions, TripoSR/SV3D outputs, or artist test takes) are quarantined inside triage\_bank/. A candidate cannot move into model.glb or variants/ without clearing validation gates and recording an explicit entry in approved\_3d.json.

### **3\. Environment Domain Subsystem (environments/\<location\_id\>/)**

Environments house the physical geometry required for spatial layout, camera collision, and lighting interaction:

`environments/`  
`└── <location_id>/                    # Canonical location slug (e.g., loc_warm_pipe)`  
    `├── manifest.json                 # Bounds, origin (0,0,0), camera framing nodes`  
    `├── stage_geometry.glb            # Certified visual stage mesh`  
    `├── collision_hull.glb            # Simplified convex mesh for physics & floor grounding`  
    `├── lightmap/                     # Baked irradiance and ambient shadow textures`  
    `│   ├── baked_ao.png`  
    `│   └── lightmap_diffuse.exr`  
    `├── textures/                     # PBR surface maps`  
    `│   ├── surface_color.png`  
    `│   └── surface_normal.png`  
    `└── portals/                      # Bounding volumes defining transition thresholds`  
        `├── portal_in.json            # Linkage vector to upstream location`  
        `└── portal_out.json           # Linkage vector to downstream location`

(References:)

#### **Environment Functional Invariants**

> * **Visual Geometry vs. Collision Hulls:** Visual rendering meshes (stage\_geometry.glb) are strictly segregated from physics/collision meshes (collision\_hull.glb). Downstream raycasters and ground contact solvers evaluate against simplified low-poly convex hulls to ensure deterministic sub-millisecond grounding calculations.  
> * **Portal Boundaries (portals/):** Define spatial handoff thresholds connecting to adjacent rooms in \[series\]-spatial, mapping local metric coordinates directly to discrete tactical hex portals.

### **4\. Prop & Possession Subsystem (props/\<item\_id\>/)**

Props represent physical, equippable items, tools, weapons, and scrap pieces that characters carry or contest:

`props/`  
`└── <item_id>/                        # Canonical item slug (e.g., prop_scrap_blade)`  
    `├── manifest.json                 # Socket bindings, pivot offsets, mass, scale scalars`  
    `├── prop.glb                      # Production-certified runtime mesh`  
    `├── collision_box.json            # Axis-Aligned Bounding Box (AABB) metrics`  
    `├── textures/                     # PBR maps (Power-of-Two: 512x512 / 1024x1024)`  
    `│   ├── base_color.png`  
    `│   └── normal_roughness.png`  
    `└── lod/                          # Level-of-Detail geometry for extreme wide shots`  
        `└── prop_lod1.glb`

(References:)

#### **Prop Functional Invariants**

> * **Origin Normalization:** The coordinate origin (0.0,0.0,0.0) of prop.glb is placed directly at the primary grip/socket mounting point, allowing downstream kinematic engines to bind the model to an armature joint without calculating custom translation offsets at runtime.

### **5\. Anatomy of approved\_3d.json (The Rejection Ledger)**

Mirroring the visual art vault's approved.json, triage\_bank/approved\_3d.json preserves negative contrast data. Rather than silently discarding failed generative 3D meshes, the repository documents why candidate takes failed to prevent downstream diffusion or photogrammetry pipelines from re-sampling flawed latent configurations:

`{`  
  `"$schema": "../../schemas/approved_3d.schema.json",`  
  `"character_id": "char_bog",`  
  `"condition_variant": "humiliated",`  
  `"winning_take": "take_03",`  
  `"promoted_at": "2026-09-28T14:32:00Z",`  
  `"rejection_ledger": [`  
    `{`  
      `"take_id": "take_01",`  
      `"model_file": "take_01/candidate.glb",`  
      `"rejection_tier": "TIER_1_METRIC_GATE",`  
      `"reason": "Topology manifold failure: 42 open non-manifold edges detected in pelvic girdle. Exceeds max triangle ceiling (12,400 > 5,000 budget).",`  
      `"sha256": "4b2e8d1a3c5f..."`  
    `},`  
    `{`  
      `"take_id": "take_02",`  
      `"model_file": "take_02/candidate.glb",`  
      `"rejection_tier": "TIER_2_SILHOUETTE_GATE",`  
      `"reason": "Anatomical posture contradiction: slouch spine angle measures only 4 degrees (expected 18-24 degrees for 'humiliated' condition per canon dossier).",`  
      `"sha256": "9a1c7b3e2f5d..."`  
    `}`  
  `],`  
  `"promoted_metadata": {`  
    `"take_id": "take_03",`  
    `"triangle_count": 4820,`  
    `"draw_calls": 2,`  
    `"sha256": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"`  
  `}`  
`}`

(References:)

### **6\. Verification & Ingestion Hooks (package.json)**

To prevent non-compliant 3D models or unhydrated pointers from entering production branches, the repository root enforces automated validation gates:

`{`  
  `"name": "@studio/[series]-assets-3d",`  
  `"version": "1.4.0",`  
  `"private": true,`  
  `"scripts": {`  
    `"lint:manifests": "tsx scripts/lint-manifests.ts",`  
    `"lint:topology": "tsx scripts/lint-3d-topology.ts",`  
    `"verify:lfs": "tsx scripts/verify-lfs-pointers.ts",`  
    `"verify:zero-byte": "tsx scripts/verify-zero-byte.ts",`  
    `"pre-commit": "npm run verify:zero-byte && npm run lint:manifests && npm run verify:lfs"`  
  `},`  
  `"devDependencies": {`  
    `"tsx": "^4.7.0",`  
    `"typescript": "^5.4.0",`  
    `"zod": "^3.22.4"`  
  `}`  
`}`

(References:)

> * **lint:manifests:** Asserts that every character, environment, and prop directory contains a valid manifest.json conforming to schemas/mesh\_manifest.v1.json.  
> * **lint:topology:** Parses all .glb binaries to ensure triangle counts, draw calls, and bounding-box dimensions remain within authorized budgets defined in ASSET\_GUIDE.md.  
> * **verify:zero-byte & verify:lfs:** Intercepts unhydrated Git LFS text pointers or corrupted zero-byte files matching the empty SHA-256 constant (e3b0c442...), preventing corrupted data from breaking downstream rendering engines.

---

*User prompt: {{FOCUS:  Architectural Justifications for Dedicated 3D Vaults }} /extreme-details*

### **Response: Architectural Justifications for Dedicated 3D Vaults (\[series\]-assets-3d)**

Within the studio’s fleet-wide architecture, asset storage is never treated as a single omnibus monorepo or a catch-all folder. Instead, the studio mandates an uncompromising design rule: **every distinct narrative universe maintains its own dedicated, series-isolated 3D asset vault** (e.g., goblin-assets-3d, wiregrass-assets-3d) positioned strictly within **Cluster 04.assets (The Source Art Vault)** on **Axis B (Representation / Artifact Hardening)**.

This architectural choice is driven by five hard, non-negotiable operational requirements:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│         THE SYSTEMIC LIABILITIES OF MONOLITHIC 3D ASSET STORAGE        │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. Git LFS Bandwidth & Quota Exhaustion (The Multi-Gigabyte Clone Trap)│`  
`│ 2. Semantic Blast Radius & Artificial Tag Churn (Invalidation Cascade) │`  
`│ 3. Divergent Physics, Coordinate Norms, and Aesthetic Axioms           │`  
`│ 4. Entity Namespace Clashes & Skeletal Rig Pollution                   │`  
`│ 5. Class 3 Durability & Offline Provenance Isolation (R2 / WORM)       │`  
`└────────────────────────────────────────────────────────────────────────┘`

(References:)

### **1\. Mitigating the Git LFS Quota Trap & Workstation Ingestion Drag**

3D spatial vaults carry massive, immutable binary payloads: dense quad-mesh armatures, multi-resolution vertex caches, uncompressed 16-bit normal/roughness textures, baked ambient occlusion lightmaps, and source .blend/.fbx master working files. A single character or environment location can easily consume hundreds of megabytes, with complete series libraries swelling from 20 GB to upwards of 50 GB.

> * **The Shared-Monolith Failure Mode:** If multiple series (*Under the Floorboards*, *Wiregrass Basin*, *Deep Space Salvage*) share a single omnibus asset repository, developers, animators, and cloud CI runners working on an episode for Series A are forced to clone, index, and cache gigabytes of unreferenced geometry belonging to Series B and Series C.  
> * **Git LFS Bandwidth Clamping:** Cloud-hosted Git providers (e.g., GitHub, GitLab) enforce strict monthly data transfer and storage bandwidth quotas on Git Large File Storage. High-frequency checkouts on heavy omnibus repos quickly trigger quota exhaustion across the entire organization, halting builds and deployments across unrelated productions.  
> * **Isolated Blobless Ingestion:** Dedicated per-series repositories allow downstream execution runtimes (such as \[series\]-viewport-template) to perform isolated, blobless shallow clones (--depth 1 \--filter=blob:none) via scripts/sync-assets.ts. Workstation and CI runners download *only* the specific LFS pointer objects for the target series, avoiding out-of-memory errors and preserving shared bandwidth.

### **2\. Eliminating Semantic Blast Radius & Versioning Churn**

The studio’s build pipeline relies on **Monotonic Authority and Transitive Dependency Hashing**:

`[series]-lore (01.canon) ──► compiled/bible-state.json (Tree-Hash: H_canon)`  
                                       `│`  
                                       `▼ (Audit Gate: H_canon vs H_assets)`  
`[series]-assets-3d (04.assets) ──► manifest.json (Release Tag: v1.4.0)`  
                                       `│`  
                                       `▼ (Hard Pinning via versions.json)`  
`[series]-episodes/epXXX (05.delivery) ──► render_manifest.json (Immutable Provenance)`

(References:)

> * **The Omnibus Tag-Churn Hazard:** In an omnibus asset repository, promoting a new prop for *Wiregrass Basin* (e.g., prop\_rusty\_pipe) creates a new commit SHA and bumps the global repository release tag. If *Under the Floorboards* shares this repository, its coordination lockfile (versions.json) or dependency tree becomes artificially dirty (is\_dirty \= 1), triggering false-positive staleness audits and unnecessary CI test invalidations across unrelated episodes.  
> * **Contained Blast Radius:** A dedicated \[series\]-assets-3d ensures that the blast radius of any asset addition, mesh decimation, or rig fix is mathematically bounded to that specific series. Upstream commits or experimental geometry changes never propagate into other productions.  
> * **Tree-Hash Staleness Verification:** The compiler enforces a strict consistency check between Axis A (Meaning) and Axis B (Representation): the conductor validates the active asset vault’s Git tree hash against compiled/bible-state.json. Separated repositories guarantee that this verification audits only relevant universe entities, preventing cross-series false alarms.

### **3\. Divergent Physical Axioms, Coordinate Systems, & Aesthetic Rules**

Different story worlds within the studio operate under fundamentally incompatible physical scales, aesthetic constraints, and camera projection requirements:

| Production Metric | *Under the Floorboards* (goblin-assets-3d) | *Wiregrass Basin* (wiregrass-assets-3d) | Hard Sci-Fi Salvage (space-assets-3d) |
| :---- | :---- | :---- | :---- |
| **Physical Scale Metric** | Micro-scale (1.0 unit=100 mm crawlspaces) | Human real-world scale (1.0 unit=1.0 m) | Macro-scale / Zero-G (1.0 unit=10.0 m) |
| **Triangle Caps (ASSET\_GUIDE)** | Low-poly puppet rigs (≤5,000 tris) | Mid-density characters (≤25,000 tris) | High-detail hard-surface hull colliders |
| **Material/Texture Models** | Hand-painted diffuse with stylized cel-shading | High-grit PBR (weathered rust, grime, peeling paint) | Clean metallic, emissive visors, vacuum thermal foil |
| **Downstream Pipeline** | 2.5D hybrid / Babylon.js into ControlNet | Full 3D raytraced stage geometry | Dynamic occlusion hulls with zero-gravity cameras |

Enforcing these contradictory constraints inside a single repository’s ASSET\_GUIDE.md and automated linting suite (package.json \-\> scripts/lint-3d-topology.ts) would require bloated conditional logic, brittle exceptions, and fragile multi-tenant config schemas. Dedicated vaults allow each creative universe to enforce strict, uncompromised validation rules at ingestion.

### **4\. Namespace Collision Prevention & Biological Rig Integrity**

Every 3D asset exposes an authoritative manifest.json that binds entity slugs directly to canonical character bibles authored in 001.\[series\]-lore:

> * **Identifier Collisions:** Without dedicated vaults, common entity or prop identifiers (e.g., characters/jack/, environments/vault/, props/knife/) collide across universes unless wrapped in cumbersome, redundant prefixing (goblin\_char\_jack vs. wiregrass\_char\_jack).  
> * **Somatic & Bone Hierarchy Integrity:** A character manifest in \[series\]-assets-3d maps explicit attachment sockets (socket\_hand\_r) to specific skeletal joints (bone\_wrist\_R). Character biologies diverge across series: a micro-scale goblin possesses distinct proportions, bone lengths, and locomotion constraints compared to a human actor or a mechanical drone. Quarantining these rigs guarantees that downstream animation and kinematics solvers never bind an asset to an incompatible armature hierarchy.  
> * **Compile-Time Somatic SAT Solvers (*T*0​\=\$0.00):** Pre-flight solvers evaluate an entity’s physical equip capacity against its biological limits (e.g., asserting that ∑occupies\_hands≤ArmsAvailable). Segregated repositories ensure that entity identifiers map 1:1 to their canonical dossiers in 001.\[series\]-lore with zero cross-series namespace ambiguity.

### **5\. Class 3 Durability & The Anti-Corruption Preservation Seal**

In the studio’s ontological taxonomy, media assets differ fundamentally from narrative code:

> * **The Narrative Ledger (Class 1 / Model-Independent Reality):** The canonical world state authored in \[series\]-lore and the event log in worker-sower-engine are fully derivable and reconstructible through pure mathematical state reduction:  
>   State*N*​\=fold(apply,State0​,\[*E*1​,*E*2​,…,*EN*​\])  
>   (References:)  
> * **The Media Archive (Class 3 / Archive-Dependent Evidence):** Rendered 3D assets, vertex caches, and baked normal maps cannot be deterministically re-synthesized bit-for-bit from mathematical seeds alone due to GPU driver differences, floating-point rounding variances across CUDA versions, and DCC baking quirks. They represent **irreplaceable historical evidence**.

#### **The 3-2-1 Preservation & R2 Content-Addressed Vault**

Because 3D media cannot be regenerated on demand, isolating assets into a dedicated per-series repository allows the studio to enforce a clean **3-2-1 Storage Architecture**:

> 1. **Local Scratch:** High-speed NVMe storage on rendering workstations (/tmp/assets-3d/).  
> 2. **Warm Vault (Cloudflare R2):** Immutable, content-addressed storage keyed by SHA-256 binary digests. Because Cloudflare R2 has zero-egress fees, distributed rendering nodes pull multi-gigabyte models without bandwidth cost penalties.  
> 3. **Cold WORM Archive (Glacier / Backblaze B2):** Write-Once-Read-Many storage protected by object locking for long-term preservation.

By dedicating a repository to each series, monthly automated background audits can run rolling SHA-256 cursor scrubs and scheduled cold-restore drills on a per-universe basis. If an asset in one series ever experiences bit rot or corrupts an LFS pointer, the defect is quarantined immediately without compromising the archival integrity or historical reproducibility of the rest of the studio’s productions.

---

*User prompt: {{FOCUS:  Cross-Series Orchestration & Downstream Consumption }} /extreme-details*

### **Response: Cross-Series Orchestration & Downstream Consumption**

The downstream consumption of spatial assets operates as an automated compilation and deployment pipeline. It bridges abstract narrative state in **Cluster 01.canon / Cluster 02.simulation** (Axis A: Meaning) with physical media compilation in **Cluster 04.assets / Cluster 05.delivery** (Axis B: Representation).

Because spatial assets contain massive binary footprints (multi-megabyte quad-mesh armatures, Power-of-Two PBR textures, source DCC files, and collision geometry), downstream presentation nodes cannot naively clone or dynamically traverse master asset vaults. Instead, the architecture uses a **two-phase ingestion and harvesting pipeline** governed by cryptographic integrity sentinels, physical storage envelopes, and strict topological blast-radius containment.

### **1\. Macro Orchestration Architecture & System Flow**

Downstream execution targets (such as \[series\]-viewport-template or stamped workspaces in \[series-episodes\]/epXXX) do not maintain long-lived dynamic media players that query un-sanitized databases at runtime. Downstream consumption compiles an immutable, offline-executable software container for every scene:

 `01.canon / 02.simulation (Rig 1 Edge Isolate / Axis A)`  
 `┌────────────────────────────────────────────────────────┐`  
 `│ 001.[series]-lore ──► worker-sower-engine (Simulation) │`  
 `└───────────────────────────────────┬────────────────────┘`  
                                     `│ Emits Machine Intermediate Representations`  
                                     `▼ (dialogue_ast.json, exposure_sheet.json)`  
 `05.delivery (Rig 1 Node.js POSIX Runtime / Axis B)`  
 `┌──────────────────────────────────────────────────────────────────────────────┐`  
 `│ worker-sower-conductor / packages/viewport-template/generator                │`  
 `│                                                                              │`  
 `│ 1. Ingests coordination lockfile: data/versions.json                         │`  
 `│ 2. Phase 1: sync-assets.ts (Blobless Git LFS fetch to local NVMe buffer)     │`  
 `│ 3. Phase 2: collect-episode-assets.ts (AST-driven pruning into epXXX/assets/) │`  
 `└──────────────┬───────────────────────────────────────────────┬───────────────┘`  
                `│                                               │`  
                `▼                                               ▼`  
 `04.assets (The Visual Vault)                   04.assets (The 3D Vault)`  
 `┌─────────────────────────────┐                ┌─────────────────────────────┐`  
 `│   [series]-assets-visual    │                │     [series]-assets-3d      │`  
 `│ • Preston Blair 2D visemes  │                │ • Production .glb armatures │`  
 `│ • Layered matte plates      │                │ • Stage collision hulls     │`  
 `│ • Emotion variant cutouts   │                │ • Sockets & morph targets   │`  
 `└──────────────┬──────────────┘                └──────────────┬──────────────┘`  
                `│                                               │`  
                `└───────────────────────┬───────────────────────┘`  
                                        `│ Cherry-picked payloads (< 100MB envelope)`  
                                        `▼`  
 `05.delivery / Stamped Production Container`  
 `┌──────────────────────────────────────────────────────────────────────────────┐`  
 `│ [series-episodes]/epXXX/                                                     │`  
 `│ ├── Episode_XXX.tsx         (Source-baked immutable React composition)       │`  
 `│ ├── public/assets/3d/       (Cherry-picked local meshes and armatures)       │`  
 `│ ├── public/assets/visual/   (Cherry-picked local cutouts and matte plates)   │`  
 `│ └── render_manifest.json    (Cryptographic root: pins commit SHAs & hashes)  │`  
 `└──────────────────────────────────────┬───────────────────────────────────────┘`  
                                        `│`  
                                        `▼`  
 `Headless Execution Runtime (Rig 1: @remotion/renderer CLI)`  
 `┌──────────────────────────────────────────────────────────────────────────────┐`  
 `│ • Execution Sandbox: --gl=swangle, --concurrency=1, 0 MB GPU VRAM            │`  
 `│ • Audio Master Pacemaker: Continuous stems dictate discrete 24 fps cuts      │`  
 `│ • Verified Broadcast Deliverable: Apple ProRes 4444 / H.264 MP4             │`  
 `└──────────────────────────────────────────────────────────────────────────────┘`

(References:)

### **2\. Upstream Ingress Contracts: The Machine Intermediate Representation**

Downstream asset ingestion is driven by machine-compiled Intermediate Representations (IRs) rather than unformatted screenplay prose or human Markdown notes:

#### **A. The Dialogue Abstract Syntax Tree (dialogue\_ast.json)**

Compiled upstream by worker-sower-engine at the end of the simulation stage, the AST codifies physical scene requirements into typed JSON nodes:

`{`  
  `"schema_version": "2.1.0",`  
  `"series_slug": "under-the-floorboards",`  
  `"episode_id": "EP040",`  
  `"scene_id": "sc003",`  
  `"location_id": "loc_swamp_relay",`  
  `"spatial_framework": "tactical_hex",`  
  `"rounds": [`  
    `{`  
      `"round_index": 1,`  
      `"speaker": "char_bog",`  
      `"listener": "char_spleen",`  
      `"somatic_condition": "humiliated",`  
      `"active_held_item": "prop_siphon_wrench",`  
      `"dialogue_stem": "audio/stems/ep040_sc03_rnd01_bog.wav",`  
      `"viseme_track": "audio/visemes/ep040_sc03_rnd01_bog.json"`  
    `}`  
  `],`  
  `"environmental_props": ["prop_rusty_pipe", "prop_valve_drop"]`  
`}`

(References:)

#### **B. The Exposure Sheet (exposure\_sheet.json)**

Generated via physical acoustic probing (ffprobe) inside worker-sower-conductor on Rig 1, this file quantizes continuous sound durations into an exact, integer-quantized 24 fps frame grid:

> * Audio is the non-negotiable master clock governing downstream video timelines; picture is an integer projection mapped to audio duration.  
> * The frame count for every shot sequence is locked prior to asset extraction:  
>   durationInFrames=⌈1000durationMs​×24.0⌉  
>   (References:)

### **3\. Two-Tier Asset Resolution Mechanics**

To resolve dependencies without burdening render nodes with gigabytes of Git history, consumption executes in two isolated stages:

#### **Phase 1: Tagged Shallow Synchronization (sync-assets.ts)**

Render nodes and staging environments do not track upstream Git branches (main or trunk). Instead, scripts/sync-assets.ts anchors itself to data/versions.json:

> 1. The harness reads the pinned semantic tag or commit SHA for the target series vault (e.g., "\[series\]-assets-3d": "v1.4.0").  
> 2. It executes a blobless shallow clone (--depth 1 \--branch v1.4.0 \--filter=blob:none \--no-checkout) to populate directory structures and parse manifest.json schemas while bypassing object contents.  
> 3. It performs a sparse Git LFS pull targeting only production-certified tip models (characters/\*/model.glb, environments/\*/stage\_geometry.glb) into a local shared NVMe cache (cache/assets-3d/), ignoring source sculpts (source/) and experimental candidate takes (triage\_bank/).

#### **Phase 2: AST-Driven Harvesting (collect-episode-assets.ts)**

Stamping an entire series asset vault into an episode workspace causes severe workspace bloat, creating 4 GB to 12 GB of redundant copies across a single season.

collect-episode-assets.ts executes an AST walk against dialogue\_ast.json:

> 1. **Location Geometry:** Reads ast.location\_id and copies only environments/\<location\_id\>/stage\_geometry.glb and its collision hull.  
> 2. **Actor Armatures:** Inspects ast.rounds for active speaker and listener slugs. It stages the base skeleton/model (characters/\<speaker\>/model.glb).  
> 3. **Condition Variants:** If a round specifies a somatic or emotional mutation (e.g., somatic\_condition: "humiliated"), the script queries manifest.json under condition\_variants.humiliated and stages that specific variant binary (variants/bog\_humiliated.glb).  
> 4. **Prop Sockets:** Walks active\_held\_item and environmental\_props, copying target meshes into public/assets/3d/props/.  
> 5. **Pruning Output:** Assets not referenced in the AST are excluded from the staging directory, reducing local workspace footprints to a compact 5 MB to 28 MB payload.

### **4\. Physical Storage Ceilings & Pre-Flight Sentinels (*T*0​\=\$0.00)**

The ingestion pipeline enforces the **Fail-Fast Economic Hierarchy**: defects, corrupted pointers, and storage breaches must terminate at Step 0 (*T*0​), where financial compute spend is exactly \$0.00. Allowing defective assets to reach headless Chromium rendering or GPU foundries incurs heavy timeout costs, worker thrashing, and memory leaks.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   PRE-FLIGHT CONFIDENCE GATES (T_0)                    │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. Storage Envelope Assertion (assert-storage-envelope.ts)             │`  
`│    • Total staged assets in public/assets/ < 100MB (Nominal Budget)    │`  
`│    • 100MB - 150MB: Build warning emitted                             │`  
`│    • Total staged assets > 150MB: Hard fatal compile break (Exit 1)    │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 2. The Zero-Byte Poison Sentinel (verify-asset-integrity.ts)           │`  
`│    • Evaluates binary buffer sizes (size == 0 -> FATAL EXIT 1)         │`  
`│    • Traps empty SHA-256 digest: e3b0c44298fc1c149afbf4c8996fb9242... │`  
`│    • Traps unhydrated Git LFS ASCII pointers (first 7 bytes == version)│`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 3. Disk Parity Sweep (!MissingAssets)                                  │`  
`│    • Statically cross-references JSX imports with public/assets/       │`  
`│    • Any missing .glb, .png, or .wav file triggers an immediate abort  │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 4. Cryptographic Canon-Asset Parity Gate                               │`  
`│    • Compares Git tree SHA of active 3D assets to bible-state.json     │`  
`│    • Mismatch flags FATAL CANON DIVERGENCE (Code != Reality)           │`  
`└────────────────────────────────────────────────────────────────────────┘`

(References:)

#### **The Explicit Null Waiver Check**

If the dialogue AST requests a character variant that is explicitly declared as null in manifest.json (acknowledging an incomplete asset):

> * In **Draft / Animatic Mode**, the compiler warns and safely falls back to the base model (model.glb).  
> * In **Broadcast Mastering Mode**, compilation halts immediately with Exit Code 1 unless an authorized entry exists in waivers.json signed by the showrunner.

### **5\. Downstream Consumption & Source-Baking Compilation**

Once assets are staged and audited, the compiler does not emit a loose script for an external media player to interpret. Instead, generate-episode-repo.ts metaprograms an immutable, self-contained React composition: **Episode\_XXX.tsx**.

`// Excerpt: ep040/src/Episode_040.tsx (Source-Baked 3D / Hybrid Composition)`  
`import React from 'react';`  
`import { Composition, Sequence, staticFile } from 'remotion';`  
`import { SpatialStage } from './components/SpatialStage';`  
`import { PuppetRig3D } from './components/PuppetRig3D';`

`export const Episode_040 = () => {`  
  `return (`  
    `<SpatialStage`  
      `stageModel={staticFile('assets/3d/environments/loc_swamp_relay/stage_geometry.glb')}`  
      `collisionHull={staticFile('assets/3d/environments/loc_swamp_relay/collision_hull.glb')}`  
    `>`  
      `{/* Round 1: Frame 0 to 75 (ffprobe locked duration: 3120ms) */}`  
      `<Sequence from={0} durationInFrames={75}>`  
        `<PuppetRig3D`  
          `modelSrc={staticFile('assets/3d/characters/char_bog/variants/bog_humiliated.glb')}`  
          `groundContactPivot={[0.0, 0.0, 0.0]}`  
          `crashZoomTarget={[0.04, 0.78, 0.12]}`  
          `heldPropSrc={staticFile('assets/3d/props/prop_siphon_wrench/prop.glb')}`  
          `mountSocket="bone_wrist_R"`  
          `audioStem={staticFile('assets/audio/stems/ep040_sc03_rnd01_bog.wav')}`  
          `visemeTrack={staticFile('assets/audio/visemes/ep040_sc03_rnd01_bog.json')}`  
          `animationHints={{`  
            `massScalar: 1.4,`  
            `shiverAmplitude: 0.08,`  
            `talkBounceAmplitude: 0.02`  
          `}}`  
        `/>`  
      `</Sequence>`  
    `</SpatialStage>`  
  `);`  
`};`

(References:)

> * **Source-Baking Invariant:** Parameters like durationInFrames={75}, metric coordinates \[0.04, 0.78, 0.12\], and asset paths are baked directly into the JSX source code as literals.  
> * **Offline Replay Independence:** Because the composition addresses local relative assets via staticFile(), it does not query remote databases, network storage, or cloud APIs during rendering. It can be checked out and rendered offline decades later with guaranteed Level 3 Decoded Media Equivalence.

### **6\. Topological Blast-Radius Containment & Invalidation Boundaries**

Modeling narrative universes as Directed Acyclic Graphs (DAGs) means an unconstrained asset mutation can trigger systemic invalidation. The multi-series architecture prevents this through strict mathematical containment:

> * **The Invalidation Set (I(*v*)):** The operational penalty of mutating an asset or entity *v* is determined by its transitive reachability in the reverse dependency graph Gref​:  
>   I(*v*)={*u*∈Vent​∣*u*⇝*v* in Gref​}  
>   (References:)  
> * **Transitive Blast Radius (*R*blast​):** Evaluated over total population *n*:  
>   *R*blast​(*v*)=*n*∣I(*v*)∣​  
>   (References:)  
> * **Franchise Boundary Wall:** Merging multiple shows into a shared asset vault would allow modifying an asset in *Under the Floorboards* to mark episodes in *Wiregrass Basin* as dirty (is\_dirty \= 1), triggering false-positive rebuilds and wasting compute.  
> * **Independent Git Spaces:** Quarantining each narrative universe into dedicated repositories (\[series\]-assets-3d, \[series\]-episodes) guarantees that graph reachability terminates at the organization boundary. The blast radius of an asset iteration remains strictly contained within that series, preserving independent semantic versioning and release cadences across the studio fleet.

### **7\. Immutable Provenance Sealing (render\_manifest.json)**

When optical rendering completes, the build container writes the terminal build lockfile: **render\_manifest.json**. Situated on Axis B, it cryptographically freezes the exact conditions of creation:

`{`  
  `"build_id": "sha256:7a9f201bcde8456789abcdef0123456789abcdef0123456789abcdef01234567",`  
  `"series_slug": "under-the-floorboards",`  
  `"episode_id": "EP040",`  
  `"schema_version": "3.2.0",`  
  `"rendered_at": "2026-09-30T04:12:00Z",`  
  `"target_source_file": "Episode_040.tsx",`  
  `"parents": {`  
    `"series_config_hash": "sha256:3b8f1a2c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a",`  
    `"dialogue_ast_hash": "sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",`  
    `"upstream_provenance": {`  
      `"lore_commit": "git:9c3e401",`  
      `"assets_3d_commit": "git:b71fa02",`  
      `"worker_sower_commit": "git:7bd4e10",`  
      `"viewport_template_commit": "git:4f8a120"`  
    `}`  
  `},`  
  `"asset_fingerprints": {`  
    `"assets/3d/characters/char_bog/variants/bog_humiliated.glb": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",`  
    `"assets/3d/environments/loc_swamp_relay/stage_geometry.glb": "sha256:4a8c9e12...",`  
    `"assets/3d/props/prop_siphon_wrench/prop.glb": "sha256:91b2c3d4..."`  
  `},`  
  `"delivery_master": {`  
    `"file": "Episode_040_Master.mp4",`  
    `"sha256": "5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",`  
    `"audio_loudness_lufs": -16.2,`  
    `"true_peak_dbtp": -1.1`  
  `}`  
`}`

(References:)

By locking asset content hashes directly into render\_manifest.json, the stamped episode links every pixel and audio frame to the exact geometry binaries stored in Cloudflare R2. Downstream distribution hubs can verify C2PA cryptographic signatures against this manifest, providing a tamper-proof chain of custody extending from canonical narrative law down to final broadcast pixels.

---

*User prompt: {{FOCUS:  2\. Character Domain Subsystem (characters/\<character\_id\>/) }} /extreme-details*

### **Response: The Character Domain Subsystem (characters/\<character\_id\>/)**

Within **\[series\]-assets-3d** (and across its boundary with \[series\]-assets-visual under **Cluster 04.assets** on **Axis B: Representation**), the Character Domain Subsystem is the isolated, version-controlled vault for production-certified 3D meshes, armatures, condition variants, and triage staging for a specific actor.

Downstream viewports (such as Remotion or headless scene builders) never glob asset directories or parse arbitrary geometry at runtime. Instead, each directory exposes an immutable, strongly typed contract that binds physical geometry to the canonical somatic dossiers authored upstream in 001.\[series\]-lore (Axis A: Meaning).

### **1\. Concrete Filesystem Topology**

Each character registered in the canonical relational ledger (e.g., char\_bog, char\_spleen, char\_wart, char\_mum\_grissel) maintains a strictly uniform folder structure:

`characters/`  
`└── <character_id>/                   # Canonical entity slug (e.g., char_bog, char_wart)`  
    `├── manifest.json                 # Strongly typed 3D puppet contract (anchors, sockets, variants)`  
    `├── model.glb                     # Certified runtime base mesh + skeletal rig`  
    `├── textures/                     # Power-of-Two (POT) PBR runtime maps`  
    `│   ├── base_color.png            # Diffuse / Albedo (1024x1024 or 2048x2048)`  
    `│   ├── normal.png                # Tangent-space normal map`  
    `│   ├── roughness_metallic.png    # Channel-packed (G: Roughness, B: Metallic)`  
    `│   └── emissive.png              # Ambient glow / bioluminescent accents`  
    `├── variants/                     # Permanent somatic & emotional mesh variations`  
    `│   ├── <condition_id>.glb        # e.g., humiliated.glb, severed_left_arm.glb`  
    `│   └── textures/                 # Variant-specific overrides (e.g., grime, open wounds)`  
    `├── source/                       # LFS-tracked master working files (DCC master assets)`  
    `│   ├── rig_master.blend          # Master Blender rig with IK controls & constraints`  
    `│   ├── highpoly_sculpt.blend     # Multi-million polygon ZBrush/Blender sculpt`  
    `│   └── exports.fbx               # Intermediary DCC exchange files`  
    `└── triage_bank/                  # Isolated intake for generative/photogrammetry candidate takes`  
        `├── take_01/`  
        `│   ├── candidate.glb         # Candidate geometry under evaluation`  
        `│   └── render_preview.png    # 36-frame orthographic turnaround plate`  
        `├── take_02/`  
        `│   ├── candidate.glb`  
        `│   └── render_preview.png`  
        `└── approved_3d.json          # Triage Audit Record & Rejection Ledger`

### **2\. Functional Roles of Subdirectories & Files**

#### **A. Certified Runtime Baseline (model.glb & textures/)**

> * **The Single-Root glTF Invariant:** The runtime model is always delivered as a binary glTF container (.glb) containing baked skinning, bone armatures, and optional morph targets.  
> * **Power-of-Two (POT) Channel Packing:** Textures are constrained to POT resolutions (1024×1024 or 2048×2048). To minimize texture sampler allocations in headless WebGL/WebGPU contexts, roughness and metallic properties are packed into the green and blue channels of a single image buffer.

#### **B. Somatic & Condition Variants (variants/)**

> * **Permanent Somatic Modifications:** Stores discrete geometries representing permanent bodily trauma compiled from the character's somatic dossier (e.g., severed\_left\_arm.glb, amputated\_limb.glb).  
> * **Postural & Expressive Shifts:** Distinct meshes that alter bone resting lengths or spine curves (e.g., bog\_humiliated.glb). Storing condition meshes explicitly prevents procedural rigs from relying on unconstrained generative warping at runtime.

#### **C. Decoupled DCC Working Files (source/)**

> * **Master DCC Working Files:** Multi-gigabyte .blend, .fbx, and ZBrush sculpt files are quarantined in source/.  
> * **Harvesting Isolation:** Episode dependency harvesters (collect-episode-assets.ts) are structurally barred from parsing or staging source/ files. Local rendering caches pull only runtime binaries (model.glb), preventing gigabytes of DCC data from entering render worker nodes.

#### **D. The Intake Quarantine (triage\_bank/)**

> * **Intake Quarantine:** Candidate geometries generated by upstream diffusion pipelines, photogrammetry tools, or 3D artists are placed in isolated take\_XX folders.  
> * **Promotion Gate:** A candidate take cannot be moved to model.glb or promoted into variants/ without clearing the Three-Tier Validation Gauntlet and appending an auditable record to approved\_3d.json.

### **3\. Machine-Enforced Invariants & Validation Gauntlets**

Every character asset committed to the subsystem must pass automated pre-flight checks before promotion:

#### **1\. Metric Scale & Triangle Caps**

> * CI parsing tools (scripts/lint-3d-topology.ts) evaluate the staged .glb binary against limits declared in ASSET\_GUIDE.md (e.g., base character meshes must measure ≤5,000 triangles with ≤4 draw calls).  
> * The mesh bounding box is asserted against the character's canonical height in 001.\[series\]-lore (e.g., short crawlspace goblins are constrained to micro-scale bounding heights *H*≤1.15 m, preventing human-scale scale drift).

#### **2\. Somatic SAT Conformance (*T*0​\=\$0.00)**

> * The armature joint hierarchy is cross-referenced against the character's active physical capabilities compiled via getCharacterSomaticMask().  
> * If wart.md dictates a severed\_left\_arm resulting in availableArms=1.0, the corresponding wart/manifest.json must disable or omit socket\_hand\_l. An asset attempting to bind a left hand socket to an amputee character fails compilation at Step 0 (*T*0​) with a SOMATIC\_CAPACITY\_VIOLATION.

#### **3\. The Zero-Byte Poison Sentinel**

> * Before promotional staging, the compiler computes the SHA-256 digest of every binary. If any file matches the empty-string constant:  
>   SHA-256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>   or falls below 1,024 bytes (signaling an unhydrated Git LFS text pointer), the build aborts immediately, preventing headless scene builders from crashing on empty buffers.

### **4\. Anatomy of triage\_bank/approved\_3d.json (The Rejection Ledger)**

To eliminate **"The Beige Plague"** (generic collapse toward homogeneous, statistically average character models), the subsystem documents failed takes alongside promotions. Preserving negative contrast data ensures upstream generative pipelines do not re-sample rejected latent seeds:

`{`  
  `"$schema": "../../schemas/approved_3d.schema.json",`  
  `"character_id": "char_bog",`  
  `"condition_variant": "humiliated",`  
  `"winning_take": "take_03",`  
  `"promoted_at": "2026-09-28T14:32:00Z",`  
  `"rejection_ledger": [`  
    `{`  
      `"take_id": "take_01",`  
      `"model_file": "take_01/candidate.glb",`  
      `"rejection_tier": "TIER_1_METRIC_GATE",`  
      `"reason": "Topology manifold failure: 42 open non-manifold edges detected in pelvic girdle. Triangle count (12,400) exceeds 5,000 budget.",`  
      `"sha256": "4b2e8d1a3c5f..."`  
    `},`  
    `{`  
      `"take_id": "take_02",`  
      `"model_file": "take_02/candidate.glb",`  
      `"rejection_tier": "TIER_2_SILHOUETTE_GATE",`  
      `"reason": "Anatomical posture contradiction: spine flexion is only 4 degrees (expected 18-24 degrees for 'humiliated' per canon dossier). Silhouette collides with char_spleen.",`  
      `"sha256": "9a1c7b3e2f5d..."`  
    `}`  
  `],`  
  `"promoted_metadata": {`  
    `"take_id": "take_03",`  
    `"triangle_count": 4820,`  
    `"draw_calls": 2,`  
    `"sha256": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",`  
    `"metrics": {`  
      `"ground_contact_pivot": [0.0, 0.0, 0.0],`  
      `"crash_zoom_target": [0.04, 0.78, 0.12]`  
    `}`  
  `}`  
`}`

*(References:)*

### **5\. Dual-Rail Character Dossier Alignment**

The Character Domain Subsystem provides the physical 3D implementation of the **Dual-Rail Character Dossier** authored upstream in 001.\[series\]-lore/characters/\<character\_id\>.md:

 `001.[series]-lore (Axis A: Meaning)          [series]-assets-3d (Axis B: Representation)`  
`┌────────────────────────────────────────┐   ┌────────────────────────────────────────┐`  
`│ FRONTMATTER: THE MACHINE RAIL          │   │ MANIFEST CONTRACT (manifest.json)      │`  
`│ • somatic.locomotion_baseline          │──►│ • ground_contact_pivot, anchor_point   │`  
`│ • somatic.banned_kinetic_verbs         │──►│ • animation_hints (shiver, bounce)     │`  
`│ • somatic.conditions (injuries)        │──►│ • condition_variants (severed limbs)   │`  
`│ • logistical.equip_slots (held/worn)   │──►│ • attachment_sockets (bone joints)     │`  
`└────────────────────────────────────────┘   └────────────────────────────────────────┘`  
`┌────────────────────────────────────────┐   ┌────────────────────────────────────────┐`  
`│ MARKDOWN BODY: THE VOICE RAIL          │   │ TRIAGE BANK (triage_bank/)             │`  
`│ • The Central Irony & Refusal Vectors  │──►│ • approved_3d.json                     │`  
`│ • Surface Wants vs. Actual Wants       │──►│ • Distinctness boundary checks         │`  
`│ • Physical Tells & Comfort States      │──►│ • Emotion-specific posture bakes       │`  
`└────────────────────────────────────────┘   └────────────────────────────────────────┘`

(References:)

> * **Machine Rail to Manifest Binding:** Frontmatter variables—such as locomotion\_baseline: bipedal\_hunched or held: \["item\_silver\_spoon"\]—map directly to geometric constants, bone sockets (socket\_hand\_r), and translation offsets in manifest.json.  
> * **Voice Rail to Expressive Geometry:** Textual elements—such as signature physical tics, lying tells, and comfort states—govern the sculpt criteria in triage\_bank/, ensuring that character models visually reflect their psychological wounds and somatic limitations on screen.

---

*User prompt: {{FOCUS:  4\. Prop & Possession Subsystem (props/\<item\_id\>/) }} /extreme-details*

### **Response: The Prop & Possession Subsystem (props/\<item\_id\>/)**

Within **\[series\]-assets-3d** (operating inside **Cluster 04.assets** on **Axis B: Representation / Artifact Hardening**), the **Prop & Possession Subsystem** manages production-certified 3D meshes, collision geometry, physical mass constants, and kinematic mounting contracts for all equippable items, tools, weapons, and environmental scrap.

Props are not passive decoration or static meshes merged into character geometry. They are **discrete spatial and logistical entities** that possess their own state, physical bounding boxes, Level-of-Detail (LOD) tiers, and attachment metadata. The subsystem operationalizes the canonical rules legislated upstream in 001.\[series\]-lore/possessions/ (Axis A: Meaning) and enforced by worker-sower-engine (Logistical Vector & Equip-Slot Hierarchy).

### **1\. Concrete Filesystem Topology**

Every physical item cataloged in canon (e.g., item\_silver\_spoon, item\_tallow\_candle, prop\_siphon\_wrench, the\_unfinished\_carving) is housed in an isolated directory conforming to strict layout invariants:

`props/`  
`└── <item_id>/                        # Canonical item slug (e.g., item_silver_spoon)`  
    `├── manifest.json                 # Authoritative 3D prop contract (sockets, origins, physics)`  
    `├── prop.glb                      # Production-certified runtime mesh (glTF 2.0 binary)`  
    `├── collision_box.json            # Axis-Aligned Bounding Box (AABB) & convex hull metrics`  
    `├── textures/                     # Power-of-Two (POT) PBR runtime maps`  
    `│   ├── base_color.png            # Diffuse / Albedo (512x512 or 1024x1024)`  
    `│   ├── normal.png                # Tangent-space normal map`  
    `│   └── roughness_metallic.png    # Packed channels (G: Roughness, B: Metallic)`  
    `├── lod/                          # Discrete Level-of-Detail geometric tiers`  
    `│   ├── prop_lod1.glb             # Mid-range decimation (~50% poly budget)`  
    `│   └── prop_lod2.glb             # Extreme wide-shot proxy (<200 triangles)`  
    `├── source/                       # LFS-tracked master working files (DCC masters)`  
    `│   └── prop_master.blend         # High-poly source model, unbaked bevels, UV layouts`  
    `└── triage_bank/                  # Isolated intake for candidate takes`  
        `├── take_01/`  
        `│   ├── candidate.glb`  
        `│   └── render_preview.png`  
        `└── approved_3d.json          # Triage Audit Record & Rejection Ledger`

(References:)

#### **Subsystem Structural Invariants**

> * **The Grip Origin Normalization Invariant:** The local coordinate origin (0.0,0.0,0.0) of prop.glb is placed directly at the primary grip or mounting pivot. When attached to an entity's bone socket, the local prop matrix mounts without ad-hoc translation offsets.  
> * **Decoupled High-Poly Source Files (source/):** Master DCC files (.blend, .fbx) reside exclusively in source/. Episode harvesting pipelines (collect-episode-assets.ts) ignore source/, preventing gigabytes of DCC data from entering render worker nodes.  
> * **LOD Boundaries (lod/):** Primary meshes (prop.glb) are evaluated for close-up hero shots. In wide-angle perspectives, rendering viewports switch to lod/ variants to conserve memory and render time.

### **2\. Authoritative Schema Specification (prop\_manifest.v1.json)**

Every prop exports a manifest.json that functions as its public spatial contract:

`{`  
  `"$schema": "https://studio.internal/schemas/prop_manifest.v1.json",`  
  `"schema_version": "1.0.0",`  
  `"item_id": "item_silver_spoon",`  
  `"display_name": "The Good Silver Spoon",`  
  `"logistical": {`  
    `"weight_class": "light",`  
    `"mass_grams": 45,`  
    `"occupies_hands": 1,`  
    `"is_contested": true,`  
    `"wearable_slot": null`  
  `},`  
  `"metrics": {`  
    `"triangle_count": 820,`  
    `"draw_calls": 1,`  
    `"bounding_box_meters": {`  
      `"min": [-0.015, -0.005, -0.075],`  
      `"max": [0.015, 0.012, 0.075]`  
    `}`  
  `},`  
  `"model": {`  
    `"file": "prop.glb",`  
    `"sha256": "91b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",`  
    `"grip_transform": {`  
      `"translation": [0.0, 0.0, -0.04],`  
      `"rotation_quaternion": [0.0, 0.0, 0.0, 1.0],`  
      `"scale": [1.0, 1.0, 1.0]`  
    `},`  
    `"attachment_compatibility": [`  
      `"socket_hand_r",`  
      `"socket_hand_l",`  
      `"socket_belt"`  
    `]`  
  `},`  
  `"condition_variants": {`  
    `"intact": {`  
      `"file": "prop.glb",`  
      `"sha256": "91b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"`  
    `},`  
    `"bent_shank": {`  
      `"file": "variants/spoon_bent.glb",`  
      `"sha256": "e3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"`  
    `},`  
    `"destroyed": null`  
  `},`  
  `"interaction_physics": {`  
    `"center_of_mass": [0.0, 0.002, -0.01],`  
    `"surface_acoustic_profile": "tarnished_silver_clink",`  
    `"restitution": 0.15,`  
    `"friction": 0.65`  
  `}`  
`}`

(References:)

### **3\. Logistical Vector Integration & Hand Capacity Enforcement**

The Prop & Possession Subsystem acts as the spatial counterpart to the **Equip-Slot Hierarchy** (Worn, Held, Carried, Cached).

 `01.canon / 02.simulation (Axis A: Meaning)         [series]-assets-3d / props/ (Axis B: Representation)`  
`┌────────────────────────────────────────┐          ┌───────────────────────────────────────────────┐`  
`│ 001.[series]-lore/possessions/*.md     │          │ props/<item_id>/manifest.json                 │`  
`│ • weight_class: light                  │─────────►│ • logistical.weight_class                     │`  
`│ • occupies_hands: 1                    │          │ • logistical.occupies_hands                   │`  
`│ • current_owner: char_bog              │          │ • model.attachment_compatibility              │`  
`└────────────────────────────────────────┘          └───────────────────────┬───────────────────────┘`  
                                                                            `│`  
                                                                            `▼`  
 `02.simulation / Pre-Flight SAT Check (T_0 = $0.00)  [ Hand Capacity Invariant Solver ]`  
 `┌──────────────────────────────────────────────────────────────────────────────────────────┐`  
 `│ Sum(slot.occupies_hands) <= ArmsAvailable                                                │`  
 `│ If violated -> HAND_CAPACITY_EXCEEDED (Execution halts closed before allocating compute) │`  
 `└──────────────────────────────────────────────────────────────────────────────────────────┘`

(References:)

#### **A. The Hand Capacity Invariant Equation (*T*0​\=\$0.00)**

Before an item is assigned to an actor's hand socket in a scene, the compiler executes a zero-cost feasibility check:

*i*∈HeldItems∑​occupies\_hands(*i*)≤ArmsAvailable

(References:)

> * **Somatic Mask Reduction:** ArmsAvailable is dynamically projected from getCharacterSomaticMask(). If a character has suffered an amputation or severe condition (e.g., severed\_left\_arm), their capacity decrements from 2.0 to 1.0.  
> * **Fail-Fast Invariant:** If the AST attempts to equip an item where occupies\_hands=2 (e.g., a two-handed iron lever) onto a one-armed character, or equips two 1-handed props simultaneously, compilation terminates immediately with a HAND\_CAPACITY\_EXCEEDED error.

#### **B. The Exposure and Non-Fungible Lease Rule**

Props follow the conservation of matter across the simulation ledger:

> * **Non-Fungible Leases:** A prop cannot inhabit two places simultaneously. It must have either an explicit character holder (owner) or reside within an indexed room node (location).  
> * **The Exposure Rule:** Only props allocated to HELD or WORN\_OUTER slots are rendered as active physical objects attached to character armatures. Items stored in CACHED or POCKET\_STORAGE remain non-rendered spatial entities until unholstered or discovered.

### **4\. Kinematics, Grip Transforms, & Socket Attachment**

When a prop is staged, the rendering engine avoids freeform coordinate placement by resolving attachments through forward kinematics:

`┌────────────────────────────────────────────────────────┐`  
`│             FORWARD KINEMATICS PROP MOUNT              │`  
`├────────────────────────────────────────────────────────┤`  
`│ Character Skeleton (e.g., char_bog.glb)               │`  
`│   └── Armature_Root                                    │`  
`│         └── Wrist_R Bone Node                          │`  
`│               └── socket_hand_r Joint                  │`  
`│                     │                                  │`  
`│                     │ Applied Kinematic Transform      │`  
`│                     ▼                                  │`  
`│ Prop Grip Matrix:                                      │`  
`│ M_prop(t) = M_char_world · M_socket(t) · T_grip · R_grip│`  
`│                     │                                  │`  
`│                     ▼                                  │`  
`│ Prop Geometry: props/item_silver_spoon/prop.glb        │`  
`└────────────────────────────────────────────────────────┘`

(References:)

> 1. **Socket Alignment:** The prop manifest's attachment\_compatibility is cross-referenced against the target character manifest's attachment\_sockets.  
> 2. **Grip Transform (*T*grip​,*R*grip​):** The local transformation matrix of the prop origin relative to the skeletal socket is solved as:  
>    Mprop\_world​(*t*)=Mchar\_world​(*t*)⋅Msocket\_joint​(*t*)⋅Tgrip​⋅Rgrip​  
>    (References:)  
> 3. **Physical Clamping:** If a character's hand bone moves, rotates, or vibrates due to conversational gestures or somatic tremors (talk\_bounce\_amplitude, idle\_shiver\_amplitude), the prop inherits these kinematics without frame desynchronization.

### **5\. Condition Variants & The Explicit Null Protocol**

Props experience damage, wear, and destruction across scene rounds. The subsystem tracks these states using the **Explicit Null Protocol**:

> * **Intact Baseline (intact):** Points to the default approved mesh (prop.glb).  
> * **Damaged Variants (bent\_shank, chipped):** Points to specific damaged variant geometries (variants/\*.glb).  
> * **The Explicit Null Protocol (destroyed: null):** If an item is destroyed in the event log (e.g., melted, shattered into unrecoverable scrap) or if a damaged state has not yet been modeled, it is committed explicitly as null in condition\_variants.  
  * **Draft Mode:** Replaces missing geometry with a placeholder bounding box.  
  * **Broadcast Release Gate:** Throws an unresolved variant exception unless covered by a signed waiver in waivers.json.

### **6\. Automated Triage & Ingestion Gauntlet (triage\_bank/)**

Every prop model introduced from upstream generative foundry tools or 3D artists must pass an automated intake gauntlet before promotion:

                  `CANDIDATE PROP INTAKE (take_XX/candidate.glb)`  
                                       `│`  
                                       `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                     TIER 1: METRIC SANITY GATES                        │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Polycount Cap: <= 1,000 triangles for standard hand props            │`  
`│ • Draw Call Cap: 1 draw call (single PBR material)                     │`  
`│ • POT Texture Gate: Textures must measure 512x512 or 1024x1024         │`  
`│ • Scale Gate: Bounding box must align with mass_grams and lore spec    │`  
`└──────────────────────────────────────┬─────────────────────────────────┘`  
                                       `│ Pass`  
                                       `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                     TIER 2: TOPOLOGICAL INTEGRITY                      │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Manifold Check: 0 open boundary edges on solid props                 │`  
`│ • Origin Audit: Coordinate origin (0,0,0) must lie within grip volume   │`  
`│ • Zero-Byte Sentinel: SHA-256 != e3b0c442...; size > 1024 bytes        │`  
`└──────────────────────────────────────┬─────────────────────────────────┘`  
                                       `│ Pass`  
                                       `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                     TIER 3: AUDIT & REJECTION LEDGER                   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Promotion: File copied to prop.glb                                   │`  
`│ • Manifest Stamp: SHA-256 hash written to manifest.json                │`  
`│ • Audit Log: Failures & successes appended to approved_3d.json         │`  
`└────────────────────────────────────────────────────────────────────────┘`

(References:)

#### **The Rejection Ledger (approved\_3d.json)**

Failed takes are preserved in triage\_bank/approved\_3d.json alongside the promoted take. Storing failure reasons (e.g., non-manifold geometry, grip origin drifting \>50 mm outside the handle volume) prevents generative workflows from re-sampling flawed seeds, ensuring all production props remain physically stable and runtime-ready.

---

*User prompt: {{FOCUS:  Camera Centroids & Close-Up Trajectories (crash\_zoom\_target), also take a look at beginning of the coversation and create a summary of all of the most important info related to series assets 3d until the last response for 1500 words  }} /extreme-details*

### **Response: Part 1: Camera Centroids & Close-Up Trajectories (crash\_zoom\_target)**

In procedural, machine-directed rendering runtimes—such as Remotion viewports, headless Chromium nodes, and hybrid 3D engines like Babylon.js or Three.js—camera choreography is driven algorithmically rather than manually keyed frame-by-frame by human layout artists. When dramatic narrative beats occur (such as a Swain Motivation-Reaction Unit visceral reflex, an argument reversal, or the spending of an interpersonal grievance string), the compilation engine automatically generates camera punch-ins, push-ins, and extreme close-ups.

Without a strongly typed spatial contract, automated camera routines default to container midpoints (0.5,0.5) or raw entity origins (0,0,0). Because character heights and variant postures vary widely across a cast (e.g., hunched actors vs. tall, rigid figures), scaling toward an arbitrary center creates the **Decapitation Defect**: cutting off characters' foreheads or zooming into empty chest cavities, belt buckles, and background plates.

#### **1\. Geometric Definition & Coordinate Normalization**

crash\_zoom\_target is an explicit vector defined within each character variant’s manifest.json. It pinpoints the precise anatomical facial centroid—the bridge of the nose or midpoint of the eye line—in the asset’s local coordinate system.

                  `COORDINATE PROJECTION TRANSFORMATION`  
                    
  `Local Asset Canvas (1024 x 1024)            Master Viewport Canvas (1920 x 1080)`  
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

(References:)

##### **A. 2D Planar Projection Math**

In a 1024×1024 authoring space, local coordinates normalize into percentage offsets:

OriginXlocal​\=(*W*canvas​crash\_zoom\_target.x​)×100%=(1024412​)×100%=40.23%  
OriginYlocal​\=(*H*canvas​crash\_zoom\_target.y​)×100%=(1024198​)×100%=19.33%

(References:)

When placing the sprite onto a global master canvas (1920×1080) at world coordinate (puppet.x,puppet.y) with scale factor *s*, naively using local percentages misaligns the shot. The compiler projects the target through the layout matrix to compute global canvas transform origins:

OriginXglobal​\=(*W*viewport​puppet.x+(crash\_zoom\_target.x×*s*)​)×100%  
OriginYglobal​\=(*H*viewport​puppet.y+(crash\_zoom\_target.y×*s*)​)×100%

(References:)

##### **B. 3D Spatial Vector Math**

In continuous metric 3D space (1.0 unit≡1.0 meter), the manifest declares *C*local​\=(*xc*​,*yc*​,*zc*​) relative to the skeletal root node. For an entity at world position *P*stage​ with rotation matrix R∈SO(3) and uniform scale *s*, the world-space camera LookAt focus point *P*lookat​ resolves dynamically:

*P*lookat​\=*P*stage​\+*s*⋅(R⋅*C*local​)

The camera position *P*cam​(*t*) moves along an authored view vector *u*cam​ over focal distance *d*(*t*) while maintaining *P*lookat​ at the viewport center:

*P*cam​(*t*)=*P*lookat​\+*d*(*t*)⋅*u*cam​

#### **2\. Directorial Spring Dynamics & Swain MRU Translation**

Directorial heuristics are decoupled from compiler source code and read from a versioned configuration table (style\_rules.json). When a scene AST marks an emotional sting (VISCERAL\_STING), the timeline compiler inserts an unvoiced reaction window (typically 12 to 24 frames) *before* triggering active dialogue audio stems.

`// worker-sower-conductor: Remotion Camera Choreography Wrapper`  
`import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";`

`export const CameraReactionPunch: React.FC<{`  
  `beatStartFrame: number;`  
  `originX: string;`  
  `originY: string;`  
  `children: React.ReactNode;`  
`}> = ({ beatStartFrame, originX, originY, children }) => {`  
  `const frame = useCurrentFrame();`  
  `const { fps } = useVideoConfig();`

  `// Evaluates second-order spring dynamics locally per shot sequence`  
  `const zoomSpring = spring({`  
    `frame: frame - beatStartFrame,`  
    `fps,`  
    `config: { damping: 12, mass: 0.5, stiffness: 180 }, // QuadOut profile`  
  `});`

  `const scale = interpolate(zoomSpring, [0, 1], [1.0, 1.45], {`  
    `extrapolateLeft: "clamp",`  
    `extrapolateRight: "clamp",`  
  `});`

  `return (`  
    `<div`  
      `style={{`  
        `width: "100%",`  
        `height: "100%",`  
        ``transform: `scale(${scale})`,``  
        ``transformOrigin: `${originX} ${originY}`,``  
      `}}`  
    `>`  
      `{children}`  
    `</div>`  
  `);`  
`};`

(References:)

> * **Multi-Character Invariance:** Tall characters (e.g., Wart) and crouched, wiry characters (e.g., Spleen) share identical camera directives without custom layout branches. The compiler queries manifest.json for each character's crash\_zoom\_target, centering close-ups regardless of stature.  
> * **Compile-Time Source Baking:** These transform percentages are computed during compilation and injected as static literals into JSX props (e.g., \<CameraReactionPunch originX="48.24%" originY="21.15%"\>). This avoids runtime trigonometric calculations during headless rendering.

### **Part 2: Comprehensive Architecture Summary of \[series\]-assets-3d**

#### **1\. Executive Summary & Epistemological Boundaries**

The transition from single-series hardcoded vaults (such as goblin-assets-3d) to the abstracted specification **\[series\]-assets-3d** formalizes a core studio principle: **semantic narrative truth lives strictly within an immutable relational ledger (Axis A: Meaning), while generative models and media vaults operate as untrusted rendering workers with zero narrative authority (Axis B: Representation)**.

Operating within **Cluster 04.assets (The Source Art Vault)**, \[series\]-assets-3d acts as a strongly typed, read-only 3D spatial API. It houses production-certified low-poly meshes, skeletal armatures, condition variants, collision hulls, and PBR textures. It rejects loose file storage: all geometries, sockets, and spatial metrics are bound to strict JSON Schema contracts (mesh\_manifest.v1.json).

Because 3D media (vertex caches, baked normal maps, decimation topology) cannot be deterministically regenerated bit-for-bit from mathematical seeds due to GPU driver differences and CUDA non-determinism, it is classified as **Class 3 Durability (Archive-Dependent Evidence)**. Once certified, assets are immutable and tracked via Git LFS backed by Cloudflare R2 object storage.

#### **2\. Isolation from Upstream Generative Foundries**

The architecture strictly separates raw generation from certified production deliverables:

> * **Upstream Foundry (\[series\]-render-pipeline / lora-training):** High-poly sculpts, raw multi-view point clouds, ControlNet depth/normal pre-passes, and unbaked .blend files remain quarantined in Cluster 03.foundry.  
> * **Downstream Vault (\[series\]-assets-3d):** Contains only certified, production-ready runtime assets (.glb binaries, channel-packed textures). This keeps the vault lightweight and deterministic, insulating downstream execution runtimes from speculative training artifacts.

#### **3\. Standardized Filesystem Topology**

Every story universe instantiates an identical directory topology, facilitating automated tooling and ingestion:

`[series]-assets-3d/`  
`├── .gitattributes                    # Enforces Git LFS for *.glb, *.gltf, *.bin, *.blend, *.png`  
`├── CHANGELOG.md                      # Release tagging and geometric iterations`  
`├── ASSET_GUIDE.md                    # Polycount budgets, draw calls, PBR standards, metric scales`  
`├── package.json                      # Integrity scripts, schema linters, topology verifiers`  
`├── data/`  
`│   ├── versions.json                 # Pinned fleet coordination lockfile`  
`│   └── directive/                    # Append-only causal directives (day-000, day-001)`  
`├── schemas/`  
`│   ├── mesh_manifest.v1.json         # Authoritative spatial contract schema`  
`│   └── approved_3d.schema.json       # Triage audit and negative rejection schema`  
`├── characters/<character_id>/         # Actor models, armatures, variants, and triage bank`  
`├── environments/<location_id>/       # Stage geometries, low-poly collision hulls, portals`  
`└── props/<item_id>/                  # Equippable tools, scrap items, and socket mounts`

(References:)

#### **4\. The Authoritative 3D Spatial Contract (manifest.json)**

Downstream viewports (Remotion, Babylon.js) never scan directories or parse unvalidated scene graphs. Every asset exports an authoritative manifest.json defining its physical parameters:

> * **Coordinate Standards:** glTF 2.0 right-handed Cartesian metric system (+*Y* Up, \+*Z* Forward, 1.0 unit≡1.0 meter).  
> * **Metric Validation:** Bounding-box dimensions are verified against canonical heights in 001.\[series\]-lore. Models violating polycount ceilings (≤5,000 triangles for characters) or draw-call limits are rejected at the gate.  
> * **Ground Contact Pivot (ground\_contact\_pivot):** The vector offset from the armature root to the lowest sole contact point, locking the character to the stage floor (*Y*contact​≡*Y*ground​) and preventing floating or clipping across posture changes.  
> * **Facial Centroid Target (crash\_zoom\_target):** Normalizes camera LookAt trajectories directly to the eye-line centroid, preventing the Decapitation Defect during dramatic close-ups.  
> * **Kinematic Sockets (attachment\_sockets):** Maps logical attachment points (socket\_hand\_r, socket\_belt) to skeletal bone nodes (bone\_wrist\_R), enabling dynamic prop mounting without merging meshes.  
> * **Viseme Drivers (viseme\_driver):** Maps Preston Blair phonemes (closed, small, medium, wide) to glTF blendshapes/morph targets, driving lip-sync directly from audio stems.  
> * **Kinetic Modulators (animation\_hints):** Defines parameters like talk\_bounce\_amplitude, idle\_shiver\_amplitude, and mass\_scalar to eliminate the "mechanical metronome defect" and give procedural movement realistic physical weight.

#### **5\. The Explicit Null Protocol & Dual-Mode Execution Gate**

Production scripting often runs ahead of 3D modeling. To keep pipelines operational without masking production gaps, missing variants must be explicitly defined as null (e.g., "terrified": null):

> * **The Contract of Intentional Absence:** Missing keys fail schema parsing, distinguishing deliberate omissions from accidental corruptions.  
> * **Draft / Animatic Mode:** Resolves null variants by logging a compiler warning, substituting the base model (model.glb), and inheriting base spatial pivots to let layout testing proceed.  
> * **Broadcast Release Gate:** Enforces ∀shot∈Episode,referenced\_variant(shot)=null. Final mastering builds fail with Exit Code 1 on un-illustrated variants unless covered by an authorized waiver signed by the showrunner in waivers.json.

#### **6\. Candidate Triage & The Rejection Ledger (approved\_3d.json)**

Located in each entity's triage\_bank/, approved\_3d.json records both successful promotions and rejected takes. Preserving negative contrast data (e.g., topology non-manifold errors, silhouette collisions, incorrect spine angles) prevents upstream generative pipelines from repeatedly sampling flawed latent spaces and eliminates "The Beige Plague" (convergence toward generic, homogenized character models).

#### **7\. Prop & Possession Subsystem**

Props are discrete logistical entities bound to the canonical equip-slot hierarchy (Worn, Held, Carried, Cached):

> * **Grip Normalization:** Prop coordinate origins (0,0,0) are placed at the primary mounting grip, allowing them to mount to character bone sockets via forward kinematics:  
>   Mprop\_world​(*t*)=Mchar\_world​(*t*)⋅Msocket\_joint​(*t*)⋅Tgrip​⋅Rgrip​  
>   (References:)  
> * **Hand Capacity Invariant (*T*0​\=\$0.00):** Before evaluating kinematics, the compiler validates the character's somatic capacity:  
>   *i*∈HeldItems∑​occupies\_hands(*i*)≤ArmsAvailable  
>   (References:)  
>   If an AST assigns a two-handed tool or two separate items to a character with a severed arm (ArmsAvailable \= 1.0), compilation aborts with a HAND\_CAPACITY\_EXCEEDED error before incurring rendering costs.

#### **8\. Downstream Ingestion, AST Harvesting, & Storage Envelopes**

To protect downstream execution containers (\[series\]-episodes/epXXX) from memory exhaustion, consumption runs through two phases:

> 1. **Tagged Shallow Synchronization (sync-assets.ts):** Replaces Git submodules with a blobless shallow clone (--depth 1 \--filter=blob:none) against an immutable tag (e.g., v1.4.0) locked in versions.json. Only tip runtime models are hydrated into the local staging cache.  
> 2. **AST Dependency Harvesting (collect-episode-assets.ts):** Parses dialogue\_ast.json to stage *only* the specific meshes, variants, and stage hulls referenced in that episode into public/assets/3d/, reducing workspace footprints from gigabytes to a compact 5 MB to 28 MB payload.

##### **Physical Storage Envelope & Fail-Fast Sentinels**

> * **Nominal Budget:** \<100 MB total staged assets.  
> * **Hard Ceiling:** 150 MB absolute limit (triggers a build failure at Step 0, *T*0​\=\$0.00).  
> * **The Zero-Byte Poison Sentinel:** Pre-flight checks compute SHA-256 digests across all staged binaries. Any file measuring 0 bytes, matching the empty constant (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855), or containing an unhydrated Git LFS pointer halts execution immediately to prevent headless rendering engine crashes.

#### **9\. Dedicated Multi-Series Vault Isolation**

The architecture strictly enforces separate vaults per series (e.g., goblin-assets-3d, wiregrass-assets-3d). This multi-repository approach ensures:

> * **Bandwidth & Quota Isolation:** Prevents multi-gigabyte LFS checkouts from one series from exhausting shared organization transfer limits or slowing down other teams.  
> * **Aesthetic & Scale Autonomy:** Keeps divergent physical scales (micro-scale crawlspaces vs. human-scale industrial environments) and polycount budgets cleanly separated in their own configuration contracts.  
> * **Blast-Radius Containment:** Ensures changes to character rigs or props in Series A never trigger false-positive cache invalidations, dirty flags, or CI rebuilds in Series B.  
> * **Immutable Historical Provenance:** Renders seal exact binary SHA-256 hashes into render\_manifest.json. Backed by zero-egress Cloudflare R2 storage, scenes remain fully reproducible offline decades later with guaranteed Level 3 Decoded Media Equivalence.

---

*User prompt: is there anything else that needs to be added which has not been discussed*

Response: An analysis of the full architecture, system invariants, and the broader fleet-wide pipeline reveals several concrete operational, mechanical, and technical elements that are critical for **\[series\]-assets-3d** but have not yet been addressed.

### **1\. Concrete Per-Limb Capability Modeling vs. Integer Hand Counts**

In the Prop & Possession Subsystem, earlier drafts formulated hand availability as a scalar integer (*T*0​\=\$0.00 check: ∑occupies\_hands≤ArmsAvailable). However, modeling arms as a simple integer is too coarse for practical physical rigging and somatic verification:

> * **Somatic Handedness & Reach:** A scalar integer cannot distinguish *which* arm is functional (e.g., left arm paralyzed vs. right arm functional) or whether an action requires a dominant hand, a two-handed overhead reach, or an ambidextrous hold.  
> * **Resource Unification:** The logistical equip slot (what a hand holds) and the somatic condition (whether the limb is functional) compete for the exact same physical resource.  
> * **The Rigging Manifest Spec:** The manifest.json schema must replace generic attachment\_sockets with an explicit limb slot schema:  
>   `"limb_slots": {`  
>     `"arm_right": {`  
>       `"bone_root": "clavicle_R",`  
>       `"socket_terminal": "bone_wrist_R",`  
>       `"functional_status": "functional",`  
>       `"equipped_item_id": "prop_siphon_wrench"`  
>     `},`  
>     `"arm_left": {`  
>       `"bone_root": "clavicle_L",`  
>       `"socket_terminal": "bone_wrist_L",`  
>       `"functional_status": "severed_or_paralyzed",`  
>       `"equipped_item_id": null`  
>     `}`  
>   `}`

>   (References:)  
> * **Pre-Flight SAT Check:** The compilation gate at *T*0​ must verify not just total count, but directional compatibility: an action requiring LEFT\_HAND\_STABILIZE must halt closed if arm\_left.functional\_status \!== "functional".

### **2\. Mesh-Level Discrepancy Fencing (Constrained vs. Unconstrained Actions)**

When comparing the Dialogue AST and the generated scene actions, testing for naive set equality (ActionsDeclared​ Δ ActionsExtracted​\=∅) produces excessive false positives due to extraction noise (such as harmless unscripted glances or minor head nods).

> * **Constrained Capabilities Only:** The 3D validation linter must restrict AST discrepancy checks strictly to actions that consume constrained somatic resources (actions requiring functional limbs, locomotion, eye-line sight, or speech articulation).  
> * **Safe Noise:** Disagreements regarding non-constrained cosmetic movements (e.g., an unscripted eye shift) are ignored, while disagreements regarding a two-handed heavy lift or walking with an amputated leg trigger immediate fail-closed pipeline breaks.

### **3\. Dynamic Environment Overlays & Mutated State Hulls**

While static stage colliders (stage\_geometry.glb and collision\_hull.glb) are well-defined, real scenes require dynamic state-driven geometric variations:

> * **The Problem:** Doors open, barricades collapse, floorboards break, and water/pipes flood.  
> * **Dynamic Overlay Snapshot:** Downstream ingestion cannot rely on static hulls alone. The environment directory requires a formal dynamic overlay contract:  
>   `"dynamic_overlays": {`  
>     `"door_breached": {`  
>       `"collider_patch": "colliders/door_open_hull.glb",`  
>       `"acoustic_damping_modifier_cdB": -1200`  
>     `},`  
>     `"floorboard_ruptured": {`  
>       `"collider_patch": "colliders/floor_hole_hull.glb",`  
>       `"nav_mesh_exclusion_zone": [[1.2, 0.0, 0.4], [1.8, 0.0, 0.9]]`  
>     `}`  
>   `}`

> * **Content Hashing:** Overlays must be hashed as immutable full snapshots (not floating runtime deltas) so that physical collisions and acoustic occlusion changes are reproducible and audited under the episode's render\_manifest.json.

### **4\. Acoustic Occlusion & Portals in 3D Stage Geometry**

The architecture acknowledges acoustic propagation across corridors and crawlspaces, but the 3D stage geometry spec has not formalized how audio interacts with spatial hulls:

> * **Portal Damping Properties:** The portals defined in environments/\<location\_id\>/portals/ must store exact material damping coefficients (measured in centibels, cdB) representing physical doors, air gaps, and crawlway bends:  
>   `"portals": [`  
>     `{`  
>       `"portal_id": "portal_grate_to_pipe",`  
>       `"connected_location_id": "loc_warm_pipe",`  
>       `"acoustic_damping_closed_cdB": 1800,`  
>       `"acoustic_damping_open_cdB": 200,`  
>       `"current_state": "closed"`  
>     `}`  
>   `]`

>   (References:)  
> * **Wavefront Routing:** Ingestion engines (e.g., @remotion/renderer or spatial audio mixers) read these portal damping attributes to attenuate audio stems based on character positions and obstacle geometry, replacing simplistic Euclidean distance cutoffs.

### **5\. Level-of-Detail (LOD) & GPU Memory Budgeting for Headless Chromium**

While the 150MB hard physical disk envelope was detailed, the hardware memory budget during headless rendering was left unquantified:

> * **Headless Constraints:** Headless rendering environments (e.g., Chromium running \--gl=swangle or headless SwiftShader) operate with strictly limited CPU-shared memory and software rasterizers.  
> * **VRAM/Buffer Limits:** Staging four high-poly meshes with four sets of 2048×2048 uncompressed PBR textures quickly exceeds Chrome's software rasterizer heap, causing silent process crashes or broken frame dumps.  
> * **Asset Guide Invariants:** The ASSET\_GUIDE.md must enforce:  
  1. Texture downsampling to 1024×1024 for secondary actors and background props.  
  2. Channel packing: Green \= Roughness, Blue \= Metallic, Alpha \= Ambient Occlusion (single texture read).  
  3. Automatic runtime switching to lod/prop\_lod1.glb whenever a prop's screen-space coverage falls below 5% of total viewport height.

### **6\. The Unified Waiver Ledger (waivers.json)**

The "Explicit Null Protocol" was previously applied separately to character variants and props, but lacked a unified administrative schema:

> * **Consolidation:** Missing assets across characters, condition variants, reaction plates, and props must be recorded in a single top-level data/waivers.json ledger:  
>   `{`  
>     `"$schema": "./schemas/waivers.schema.json",`  
>     `"waivers": [`  
>       `{`  
>         `"waiver_id": "wv_2026_09_001",`  
>         `"scope": "EP040:sc003:shot02",`  
>         `"asset_type": "prop_variant",`  
>         `"target_entity": "item_silver_spoon",`  
>         `"missing_condition": "bent_shank",`  
>         `"permitted_fallback": "intact",`  
>         `"authorized_by": "showrunner_signature_ed25519",`  
>         `"expires_at_cycle": 45,`  
>         `"reason": "Bent shank asset delayed in triage; base spoon fallback approved for animatic and mastering."`  
>       `}`  
>     `]`  
>   `}`

>   (References:)  
> * **Release Gate Rule:** If an asset is null and lacks an active, non-expired entry in data/waivers.json, compilation terminates immediately with a non-zero exit code.

### **7\. Explicit Deprecation & Garbage Collection Rules**

Because assets are content-addressed and committed to Git LFS and Cloudflare R2, files accumulate over time:

> * **The Dangling Asset Problem:** Upstream generative triage produces rejected candidate takes and superseded mesh topologies.  
> * **Safe Garbage Collection (GC) Policy:**  
  1. Never delete an asset based solely on local folder crawls.  
  2. GC scripts parse all historical render\_manifest.json files and master branch commit trees across \[series\]-episodes/.  
  3. An asset is eligible for cold-archive offloading or deletion if and only if it has zero references in any released episode manifest and has remained untagged for a grace period exceeding 90 days.

### **8\. The 3-Second Tracer Bullet Proof for 3D**

The theoretical specification has converged across all domains. The final required operational step is to halt further specification expansion and execute an end-to-end **3-Second Tracer Bullet Proof**:

`001.[series]-lore (One Canonical Character: Bog + One Severed Arm Condition)`  
       `│`  
       `▼`  
`worker-sower-engine (One Precondition Check: Hand Demand <= Supply)`  
       `│`  
       `▼`  
`dialogue_ast.json (One Line of Dialogue + One Viseme Track)`  
       `│`  
       `▼`  
`sync-assets.ts (Pulls char_bog/model.glb from [series]-assets-3d @ locked tag)`  
       `│`  
       `▼`  
`collect-episode-assets.ts (Harvests Bog mesh + audio stem into <100MB envelope)`  
       `│`  
       `▼`  
`Episode_Tracer.tsx (Remotion Headless Chromium Render: 72 frames @ 24 fps)`  
       `│`  
       `▼`  
`render_manifest.json (Verified SHA-256 binary hash + Zero-Byte Check Passed)`

(References:)

Executing this single pipeline test will immediately validate the socket transforms, ground contact alignments, and headless GLB memory behavior on actual hardware far more effectively than further paper design.

---

*User prompt: {{FOCUS: 7\. Explicit Deprecation & Garbage Collection Rules}} /extreme-details*

### **Response: Explicit Deprecation & Garbage Collection Rules**

In **\[series\]-assets-3d** (and across its boundary with \[series\]-episodes/ and Cloudflare R2 object storage within Cluster 04.assets), media assets cannot be managed through naive filesystem deletion (rm \-rf) or simple local directory crawling. Because 3D assets represent **Class 3 Durability (Archive-Dependent Evidence)**, indiscriminate deletions permanently shatter historical scene auditability, break historical episode replayability (*SN*​\=fold(apply,*S*0​,\[*E*1​…*EN*​\])), and produce fatal dangling-pointer exceptions across older release containers.

At the same time, unconstrained storage accumulation—caused by upstream generative triage takes, rejected sculpt iterations, and orphaned staging blobs—exhausts Git LFS bandwidth quotas and balloons Cloudflare R2 operational costs. The deprecation and garbage collection (GC) architecture reconciles these competing pressures through deterministic, multi-phase lifecycle state machines, reverse dependency reachability graphs, and cryptographically verified cold-storage offloading.

### **1\. The Asset Lifecycle State Machine**

Every individual 3D mesh, character armature, condition variant, stage geometry hull, and prop binary within \[series\]-assets-3d progresses through a strictly defined state machine:

 `┌──────────────┐`  
 `│   UNKNOWN    │ ──► Unmapped asset reference in incoming draft AST[cite: 37]`  
 `└──────┬───────┘`  
        `▼`  
 `┌──────────────┐`  
 `│   EXPECTED   │ ──► Asset declared in manifest.json or production spec; awaiting intake[cite: 37]`  
 `└──────┬───────┘`  
        `├──────────────────────────────────────┬─────────────────────────────────────┐`  
        `▼                                      ▼                                     ▼`  
 `┌──────────────┐                      ┌──────────────┐                       ┌──────────────┐`  
 `│   MISSING    │                      │   INVALID    │                       │INTENTIONALLY_│`  
 `│ (Build Break)│                      │ (Fails Linters)                      │   ABSENT     │`  
 `└──────────────┘                      └──────────────┘                       │ (Explicit    │`  
        `│                                      │                              │  Null)[cite: 37]    │`  
        `│                                      │                              └──────┬───────┘`  
        `▼                                      ▼                                     │`  
   `[ EXIT 1 ]                             [ REJECT ]                                 ▼`  
   `Pre-Flight Gate                        Triage Gate                         ┌──────────────┐`  
                                                                              `│    WAIVED    │`  
                                                                              `│ (Signed in   │`  
                                                                              `│ waivers.json)│`  
                                                                              `└──────────────┘`  
        `┌────────────────────────────────────────────────────────────────────────────┘`  
        `▼`  
 `┌──────────────┐`  
 `│    VALID     │ ──► Passes polycount, manifoldness, and SHA-256 integrity[cite: 37]`  
 `└──────┬───────┘`  
        `▼`  
 `┌──────────────┐`  
 `│    LOCKED    │ ──► Referenced in released episode render_manifest.json (Immutable)[cite: 37]`  
 `└──────┬───────┘`  
        `├────────────────────────────────────────────────────────────────────────────┐`  
        `▼ (Character departure, item destruction, or topology modernization)         ▼`  
 `┌──────────────┐                                                             ┌──────────────┐`  
 `│  DEPRECATED  │ (Retains read references; quarantined from future writing)  │  SUPERSEDED  │`  
 `└──────┬───────┘                                                             │ (Errata patch│`  
        `▼                                                                     │  pointer)[cite: 7, 37]   │`  
 `┌──────────────┐                                                             └──────────────┘`  
 `│   RETRACTED  │ ──► Moved to _retired/ quarantine; eligible for cold drain[cite: 3, 10]`  
 `└──────┬───────┘`  
        `▼`  
 `┌──────────────┐`  
 `│ DECOMMISSION │ ──► Evicted from Tier 2 Warm R2 to Tier 3 Cold WORM Glacier[cite: 4, 6]`  
 `└──────────────┘`

#### **Detailed State Invariants**

> 1. **INTENTIONALLY\_ABSENT vs. MISSING:** Differentiates an acknowledged production gap from an accidental file omission. If an asset is INTENTIONALLY\_ABSENT and mapped to null in manifest.json, it requires a valid entry in waivers.json to pass broadcast release compilation. An unacknowledged missing file is marked MISSING and terminates the build immediately.  
> 2. **LOCKED:** Once an asset's SHA-256 hash is stamped into a published render\_manifest.json, its content hash is permanently immutable. The asset cannot be edited in place.  
> 3. **SUPERSEDED:** If an asset contains a technical defect (e.g., inverted normal maps on a character sole) after episode release, the original binary remains preserved for historical replay. The asset manifest appends a superseded\_by\_hash pointer to the corrected asset, preserving non-repudiation.  
> 4. **DEPRECATED:** The model is marked in frontmatter or manifest.json as standing: "DEPRECATED\_ARCHIVED". It remains accessible to historical scenes but is excluded from active simulation lotteries and authoring autocomplete.

### **2\. The Authoritative Manifest Sweep (GC Invariant 1\)**

Garbage collection runs as a nightly scheduled edge daemon (crons/sweeper.ts at 03:00 UTC). The garbage collector is structurally forbidden from deleting files based on local disk state or ephemeral database tables. It enforces the **Authoritative Manifest Check Rule**:

               `NIGHTLY SWEEPER RUN (03:00 UTC)[cite: 1, 2]`  
                             `│`  
                             `▼`  
              `[ List Objects in R2 Staging ][cite: 1, 9]`  
                             `│`  
              `Object Age >= 24-Hour Grace Period?[cite: 1, 9]`  
              `┌──────────────┴──────────────┐`  
              `▼ NO                          ▼ YES[cite: 9]`  
       `[ RETAIN OBJECT ]                    │`  
       `(Upload in-flight)[cite: 1, 9]             ▼`  
`┌─────────────────────────────────────────────────────────────┐`  
`│             AUTHORITATIVE MANIFEST AUDIT                    │[cite: 1, 9]`  
`│                                                             │`  
`│ Search all committed Git release manifests:                 │[cite: 1, 9]`  
`│ • [series-episodes]/ep*/render_manifest.json                │[cite: 1, 9]`  
`│ • [series]-assets-3d/manifest.json                          │`  
`│ • [series]-lore/compiled/bible-state.json                   │[cite: 1, 9]`  
`│                                                             │`  
`│ Does object SHA-256 exist in ANY committed Git manifest?    │[cite: 1, 9]`  
`└──────────────────────────────┬──────────────────────────────┘`  
                               `│`  
              `┌────────────────┴────────────────┐`  
              `▼ YES                             ▼ NO[cite: 9]`  
       `[ PROMOTE OBJECT ]                [ CANDIDATE FOR GC ][cite: 9]`  
       `Move to /canonical-archive/[cite: 1, 9]  Check 90-Day Untagged Window`  
       `Lock against deletion[cite: 1, 9]        and Zero-Reference DAG Walk`

#### **Enforcement Principles**

> * **Git as the Sole Source of Truth:** Cloudflare D1 databases and Durable Object registries are treated as volatile caches. If an asset's SHA-256 exists in any committed render\_manifest.json on any release branch of \[series-episodes\], it is mathematically non-deletable.  
> * **The 24-Hour Upload Grace Window:** Objects created within the last 24 hours under temporary staging prefixes (staging/3d/\* or ephemeral/takes/\*) are skipped, protecting multi-part uploads and active headless render jobs from deletion races.  
> * **Zero-Byte Immediate Purge:** Any object with a byte size of zero or matching the empty SHA-256 hash constant (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855) bypasses the grace window and is purged immediately, raising a poison alert to intercept upload truncation.

### **3\. The Reverse Dependency Invalidation DAG Walk (GC Invariant 2\)**

An asset cannot be retired or moved to cold storage without analyzing its upstream reachability in the production dependency graph:

     `[ Upstream Narrative Canon ]        [ Intermediate Simulation ]         [ Downstream Delivery ]`  
`┌─────────────────────────────────────┐  ┌─────────────────────────┐  ┌───────────────────────────────────┐`  
`│ 001.[series]-lore                   │  │ worker-sower-engine     │  │ [series-episodes]                 │`  
`│ • characters/char_bog.md            │─►│ • dialogue_ast.json     │─►│ • ep040/render_manifest.json     │`  
`│   (status: departed)[cite: 10]               │  │   (requires bog_slouch) │  │ • ep041/render_manifest.json     │`  
`└─────────────────────────────────────┘  └─────────────────────────┘  └───────────────────────────────────┘`  
                   `│                                                                    ▲`  
                   `└──────────────────────────────┬─────────────────────────────────────┘`  
                                                  `▼`  
                                 `[ REVERSE DEPENDENCY DAG WALK ][cite: 3, 15]`  
                                 `k_in = Count(Referencing Manifests)[cite: 3, 47]`

#### **Downstream Reachability Evaluation**

Before a character model, condition variant, or prop is removed from the active staging tree, the CLI executes a recursive Common Table Expression (CTE) dependency traversal across the relational ledger:

I(*A*target​)={*M*∈Manifests∣*M*⇝*A*target​}

> * **Zero-In-Degree Requirement (*k*in​\=0):** An asset is eligible for retirement if and only if its in-degree across active drafting scenes is exactly zero. If an active episode (status \= 'DRAFT' or 'CLEAN') contains an AST node referencing the asset, retirement is blocked.  
> * **The Long Zero-Degree Tail:** If a 3D prop (e.g., props/decorative\_bolt.glb) has maintained an in-degree of *k*in​≤1 across multiple completed episodes, the CLI places it on the **Bible Pruning Queue**. Authors are prompted to formally archive the prop into props/\_retired/.

### **4\. The \_retired/ Directory Quarantine Protocol**

In accordance with the Refined Deletion Principle, deleting an authored asset outright breaks historical provenance. Instead, the system models deprecation as an **ontological phase shift** using the \_retired/ directory quarantine pattern:

characters/  
├── char\_spleen/  
└── \_retired/  
    └── char\_wart/                     \# Migrated via \[series\]-assets-3d retire char\_wart\[cite: 10, 21\]  
        ├── manifest.json              \# Frontmatter updated: status: departed\[cite: 10\]  
        ├── model.glb                  \# Asset payload retained for historical replay\[cite: 10\]  
        └── tombstone\_receipt.json     \# Immutable archival receipt

#### **The Retirement Command (retire \<entity\_id\>)**

When an entity is retired (e.g., a character dies or a unique prop is permanently destroyed in the narrative ledger), the operator executes \[series\]-assets-3d retire \<entity\_id\>. The harness executes four mandatory steps:

> 1. **Equipment & Socket Evacuation:** The tool sweeps character slots to verify that all attached weapons or tools in manifest.json have been unmounted or transferred to a location node, enforcing conservation of matter.  
> 2. **Directory Relocation:** The entity folder is moved under \_retired/. Active scene builders ignore \_retired/ directories during runtime entity selection lotteries.  
> 3. **Tombstone Metadata Injection:** The manifest is updated with an immutable tombstone receipt:  
>    {  
>      "status": "retired",  
>      "lifecycle": {  
>        "retired\_at\_cycle": 47,  
>        "departure\_type": "death",  
>        "resolution\_cause": "Sacrificed during attic threshold breach in EP104\_SC02.",  
>        "tombstone\_hash": "7f8b9a4c12c3e5d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"  
>      },  
>      "somatic": {  
>        "banned\_kinetic\_verbs": \["\*"\]  
>      }  
>    }

>    (References:)  
> 4. **Relational State Sync:** The corresponding state row in Cloudflare D1 transitions to RESOLVED or SPAWNED\_OUT, locking the asset against future runtime queries.

### **5\. Multi-Tier Storage Offloading: The 90-Day Cold Transition**

While \_retired/ keeps metadata accessible in Git, heavy 3D binaries (.glb, .blend, high-poly sculpts) cannot sit indefinitely in Tier 2 warm storage (Cloudflare R2 Standard) without incurring unnecessary hosting costs.

┌────────────────────────────────────────────────────────────────────────┐  
│                   TRI-TIER 3D STORAGE DRAINAGE                         │  
├──────────────┬────────────────────────┬────────────────────────────────┤  
│ Storage Tier │ Substrate & SLA        │ Retention & Eviction Policies  │  
├──────────────┼────────────────────────┼────────────────────────────────┤  
│ Tier 1:      │ Local NVMe Working Dir │ Harvested episode sandbox      │  
│ Hot Scratch  │ (/tmp/assets-3d/)      │ (public/assets/3d/). Evicted   │  
│              │ Latency: \< 1ms         │ immediately upon broadcast     │  
│              │ Cost: \$0.00            │ render completion\[cite: 4, 9\].         │  
├──────────────┼────────────────────────┼────────────────────────────────┤  
│ Tier 2:      │ Cloudflare R2 Standard │ Active character/prop meshes.  │  
│ Warm Vault   │ Latency: \~50ms         │ Stored under CAS (SHA-256 keys)│  
│              │ Zero-Egress Economics  │ Re-hashed via 30-day cursor    │  
│              │                        │ rolling scrubbers\[cite: 4, 16, 24\].       │  
├──────────────┼────────────────────────┼────────────────────────────────┤  
│ Tier 3:      │ AWS S3 Glacier Deep    │ Quarantined retired assets,    │  
│ Cold WORM    │ Archive / Backblaze B2 │ candidate rejection banks, and │  
│ Archive      │ Retrieval: 3-5 Hours   │ unbaked DCC source sculpts.    │  
│              │ Immutability: WORM     │ Object-locked for 10+ years\[cite: 4, 6\].│  
└──────────────┴────────────────────────┴────────────────────────────────┘

(References:)

#### **The Cold Drainage Pipeline (crons/archiveDrain.ts)**

Triggered at midnight UTC (0 0 \* \* \*), the drainage daemon sweeps R2 storage:

> 1. **Candidate Identification:** It queries R2 metadata for assets whose prefix is \_retired/\* or residing in triage\_bank/.  
> 2. **The 90-Day Inactivity Rule:** An asset is eligible for Tier 3 cold offload if and only if:  
   * Its creation and tombstone timestamps exceed **90 days**.  
   * Its SHA-256 digest is referenced exclusively by frozen historical episode manifests (\>90 days old).  
   * It has not been requested by any active workspace sync within the last 90 days.  
> 3. **Archival Offloading:** The binary is streamed directly from Cloudflare R2 to AWS Glacier Deep Archive with an Object-Lock WORM (Write-Once-Read-Many) retention header.  
> 4. **Pointer Stubbing:** Once Glacier returns an HTTP 200 upload confirmation, the object in Cloudflare R2 is deleted and replaced with a zero-cost metadata JSON stub (models/char\_wart.glb.stub.json) recording the Glacier Archive ID, byte length, and SHA-256 content digest.

### **6\. Archival Scrubbing & Cold-Restore Verification Drills**

Archived data is not considered safe until its retrieval and execution are proven: *"A backup that has never been restored is an assertion, not evidence"*.

#### **Deterministic Rolling Range Cursor Scrubbing**

Standard 5% random sampling with replacement is mathematically flawed; it leaves approximately 36.8% (*e*−1) of an archive completely unchecked over a 20-week cycle.

> * The background scrubber uses a deterministic, hash-ordered cursor that sweeps through **100% of all archived 3D objects every 30 days**.  
> * It recomputes the SHA-256 digest of each stored binary and compares it directly against the committed manifest hash.  
> * Any bit rot or storage corruption triggers an immediate PagerDuty alert and triggers an automated repair fetch from the secondary offsite cold replica.

#### **Scheduled Monthly Cold-Restore Drills**

On the 15th of every month, an automated CI isolate executes a full disaster recovery drill:

> 1. A historically frozen episode container (e.g., ep004) is cloned into a clean, air-gapped test isolate.  
> 2. The drill worker resolves an offloaded 3D asset, initiates an asynchronous restore from cold Glacier storage, and waits for hydration.  
> 3. The Remotion composition renders offline using software rasterization (--gl=swangle).  
> 4. The output frame hashes and composite MP4 checksum are compared against the original broadcast manifest. If the hashes match bit-for-bit, the drill records an audit certification in data/recovery\_audit.log; if any discrepancy emerges, the pipeline halts until the drift is diagnosed.

### **7\. Concrete Sweeper Implementation (scripts/gc-3d-assets.ts)**

The following TypeScript daemon executes the authoritative manifest check, topological reachability analysis, and R2 purge cycle:

// scripts/gc-3d-assets.ts  
import { S3Client, ListObjectsV2Command, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';  
import { readFileSync, readdirSync, existsSync } from 'node:fs';  
import path from 'node:path';

interface GCOptions {  
  r2Bucket: string;  
  seriesEpisodesDir: string;  
  dryRun?: boolean;  
}

const EMPTY\_FILE\_SHA256 \= 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';  
const GRACE\_PERIOD\_MS \= 24 \* 60 \* 60 \* 1000;      // 24 Hours  
const RETIRED\_DRAIN\_MS \= 90 \* 24 \* 60 \* 60 \* 1000; // 90 Days

export async function run3DAssetGarbageCollector(s3: S3Client, opts: GCOptions): Promise\<void\> {  
  const now \= Date.now();  
  console.log(\`\[GC\] Starting 3D Asset Sweep across bucket: \${opts.r2Bucket}\`);

  // Step 1: Collect ALL authoritative SHA-256 hashes from committed Git manifests  
  const authoritativeHashes \= new Set\<string\>();

  const episodeDirs \= readdirSync(opts.seriesEpisodesDir, { withFileTypes: true })  
    .filter(d \=\> d.isDirectory() && d.name.startsWith('ep'))  
    .map(d \=\> path.join(opts.seriesEpisodesDir, d.name));

  for (const epDir of episodeDirs) {  
    const manifestPath \= path.join(epDir, 'render\_manifest.json');  
    if (\!existsSync(manifestPath)) continue;

    const manifest \= JSON.parse(readFileSync(manifestPath, 'utf8'));  
    if (manifest.asset\_fingerprints) {  
      for (const hash of Object.values(manifest.asset\_fingerprints)) {  
        authoritativeHashes.add((hash as string).replace('sha256:', ''));  
      }  
    }  
  }  
  console.log(\`\[GC\] Indexed \${authoritativeHashes.size} authoritative hashes from committed manifests.\`);

  // Step 2: List objects in staging and temporary prefixes  
  const listCmd \= new ListObjectsV2Command({  
    Bucket: opts.r2Bucket,  
    Prefix: 'staging/3d/',  
  });

  const response \= await s3.send(listCmd);  
  if (\!response.Contents) {  
    console.log('\[GC\] No staging objects found. Exiting.');  
    return;  
  }

  for (const object of response.Contents) {  
    if (\!object.Key || \!object.LastModified) continue;

    const ageMs \= now \- object.LastModified.getTime();  
    const objectSize \= object.Size ?? 0;

    // RULE 1: Immediate purge of zero-byte or corrupt empty-hash binaries  
    if (objectSize \=== 0\) {  
      console.warn(\`\[GC\] Purging corrupt zero-byte object: \${object.Key}\`);  
      if (\!opts.dryRun) {  
        await s3.send(new DeleteObjectCommand({ Bucket: opts.r2Bucket, Key: object.Key }));  
      }  
      continue;  
    }

    // RULE 2: Protect objects within the 24-hour grace period  
    if (ageMs \< GRACE\_PERIOD\_MS) {  
      continue;  
    }

    // Extract SHA-256 from content metadata or filename convention  
    const head \= await s3.send(new HeadObjectCommand({ Bucket: opts.r2Bucket, Key: object.Key }));  
    const contentSha256 \= head.Metadata?.\['sha256'\] || path.basename(object.Key, path.extname(object.Key));

    if (contentSha256 \=== EMPTY\_FILE\_SHA256) {  
      console.warn(\`\[GC\] Purging empty-hash sentinel match: \${object.Key}\`);  
      if (\!opts.dryRun) {  
        await s3.send(new DeleteObjectCommand({ Bucket: opts.r2Bucket, Key: object.Key }));  
      }  
      continue;  
    }

    // RULE 3: Authoritative Reference Verification  
    if (authoritativeHashes.has(contentSha256)) {  
      console.log(\`\[GC\] Retaining referenced asset: \${object.Key} (Pinned in released episode)\`);  
      continue;  
    }

    // RULE 4: Purge unreferenced staging artifacts exceeding the grace window  
    console.log(\`\[GC\] Purging unreferenced asset: \${object.Key} (Age: \${(ageMs / 86400000).toFixed(1)} days)\`);  
    if (\!opts.dryRun) {  
      await s3.send(new DeleteObjectCommand({ Bucket: opts.r2Bucket, Key: object.Key }));  
    }  
  }

  console.log('\[GC\] Garbage collection cycle completed successfully.');  
}

(References:)

### **8\. Architectural Summary: Deprecation & GC Operational Invariants**

| Protocol Dimension | Operational Invariant | Systemic Failure Mode Prevented |
| :---- | :---- | :---- |
| **Authority** | Committed Git manifests are the sole deletion authority; database rows are unauthoritative. | Accidental purge of active assets caused by database/cache desynchronization. |
| **Grace Window** | Staging assets younger than 24 hours cannot be purged. | Race conditions breaking active multi-part uploads or headless renders. |
| **Sentinel Check** | Zero-byte or empty-hash files are purged immediately on discovery. | Headless WebGL crashes and infinite process hangs caused by corrupt pointers. |
| **Retirement** | Entities are moved to \_retired/ rather than deleted via filesystem rm. | Dangling pointers in historical DAGs and broken backward scene replay. |
| **Cold Drain** | Retired assets unreferenced for \>90 days are offloaded to Glacier WORM storage. | Cloudflare R2 standard storage cost ballooning on abandoned media. |
| **Integrity Audit** | Hash-ordered cursor sweeps re-verify 100% of object SHA-256 hashes every 30 days. | Silent bit rot and undetectable storage bit corruption. |
| **Restore Verification** | Monthly air-gapped headless re-renders test full asset recovery from cold bytes. | Disaster recovery failures during real production outages. |

---
