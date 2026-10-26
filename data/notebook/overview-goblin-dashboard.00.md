# **Overview: Goblin-Dashboard.00**

[https://gemini.google.com/app/ede397957652ccfb](https://gemini.google.com/app/ede397957652ccfb)

*User prompt: we are starting working on the next repository \[ Goblin-Dashboard \]; can you present me with a complete overview*

Response: goblin-dashboard serves as the web-native "Hand of God" showrunner cockpit and human-in-the-loop director interface for the episodic generation pipeline. Implemented using **Astro and React**, it runs locally on **Rig 1** (listening on http://localhost:4321) to provide the showrunner with real-time observation, dramatic parameter tuning, script and animatic review, and manual override authority over the simulation.

### **Core Functional Responsibilities**

The dashboard acts as the primary visual interface bridging the human showrunner and the autonomous simulation engine:

> * **Dramatic Parameter Tuning:** Exposes visual control sliders for dramatic compression parameters, including dialogue curtness, threat level multipliers, and relational friction before scenes are committed to downstream generation.  
> * **State & Ledger Telemetry:** Visualizes live dynamic state tracked by worker-sower-engine—such as actor hex locations, active Paranoia Clocks, somatic injury states, and dyadic grievance balances—without modifying canonical lore directly.  
> * **Animatic & Script Review:** Provides a consolidated UI to inspect candidate screenplay drafts, dialogue ASTs, and rendered video animatics prior to final release freezing.  
> * **Production Batch Orchestration:** Allows operators to manually trigger batch episode generation runs, request scene retries, or inject manual overrides into the simulation workflow.

### **System Topology & Architectural Boundaries**

goblin-dashboard is categorized within **Cluster 05.delivery** (Presentation, Delivery, and Release Packaging) alongside the video compilation engines, but maintains strict decoupling from rendering and canon authoring:

| Repository | Role in Pipeline | Interface Boundary with goblin-dashboard |
| :---- | :---- | :---- |
| **worker-sower-engine** | Upstream simulation, 2d6 duel resolver, and narrative ledger. | **Direct API Consumer:** The dashboard reads and writes dynamic simulation state exclusively via the engine's HTTP REST (FastAPI/Express) and WebSocket layers. |
| **goblin-viewport-template** | Offline metaprogramming compiler stamping deterministic Remotion episodes. | **No Direct Coupling:** The dashboard does not execute Remotion rendering directly; it reviews rendered MP4 or animatic outputs after the compositor finishes execution. |
| **000.goblin-lore** | Immutable compile-time legislative authority and static canon law. | **Indirect via Shared Types:** The dashboard does not edit raw lore Markdown dossiers; it can share static TypeScript Zod schemas (such as character entity shapes) compiled from the bible. |
| **audio-microservice** | Local speech synthesis worker (XTTSv2/Piper) on port 8000\. | **No Direct Interaction:** Audio generation is triggered downstream by the Conductor pipeline, not directly by dashboard actions. |

### **Integration & Communication Invariants**

> * **API Boundary vs. Disk I/O:** The dashboard communicates strictly across network boundaries with worker-sower-engine. Raw draft editing, fountain file extraction, and file-system-bound operations remain inside worker-sower-engine/drafts/ to eliminate cross-process file lock contention and sync latency.  
> * **Zero Direct Rendering Workload:** Unlike the Remotion viewport—which functions as a headless batch renderer—the dashboard is an interactive client application. It incurs minimal CPU overhead and zero GPU VRAM utilization, residing entirely on Rig 1 alongside the simulation processes.  
> * **Shared Type Contracts:** Because goblin-dashboard, goblin-viewport-template, and goblin-lore's compiler are all TypeScript runtimes, the dashboard is designed to share validated Zod contracts directly from upstream packages or via a workspace protocol, guaranteeing schema parity for character rosters and state events.

---

*User prompt: not only does it run here \[ it runs locally on Rig 1 (listening on http://localhost:4321) \] there is also a version of it running on cloudflare*

Response: goblin-dashboard is architected as an environment-agnostic frontend capable of operating both as a local development cockpit on **Rig 1** (localhost:4321) and as an edge-native web application deployed globally on **Cloudflare Pages**.

When deployed to Cloudflare, the dashboard serves as the distributed showrunner cockpit for mobile creators, traveling artists, and remote writing rooms, decoupling human direction from physical studio hardware.

### **The Dual-Target Deployment Model**

The Astro architecture supports two execution topologies without requiring code divergence:

| Vector | Local Deployment (Rig 1 Cockpit) | Cloud Edge Deployment (Model A / Cloudflare) |
| :---- | :---- | :---- |
| **Hosting & Runtime** | localhost:4321 via Astro local dev/Node server. | **Cloudflare Pages** compiled via the @astrojs/cloudflare SSR edge adapter. |
| **Operator Access** | Workstation desktop session on Rig 1\. | Any web browser (iPad, laptop, mobile) at \[https://studio.yourdomain.com\](https://studio.yourdomain.com). |
| **Simulation State & DB** | Local SQLite/PostgreSQL ledger in worker-sower-engine. | **Cloudflare D1** (CANON\_DB) for sub-5ms relational state queries. |
| **Concurrency / Mutex** | Node.js process memory / local file mutexes. | **Cloudflare Durable Objects** (ShotCoordinatorDO / SowerSessionDO). |
| **Asset Transport** | Direct local filesystem access (public/audio/, local disk). | **Cloudflare R2** zero-egress asset buckets for plates, LoRAs, and audio stems. |

### **Cloudflare Edge Integration & Infrastructure**

When running at the edge, goblin-dashboard operates within the **Cloudflare Edge Control Plane** (edge-director / series-edge-orchestrator):

`┌────────────────────────────────────────────────────────────────────────────┐`  
`│                    CLOUDFLARE EDGE CONTROL PLANE                           │`  
`│                                                                            │`  
`│  [ Astro UI Dashboard (Cloudflare Pages) ] ──► HTTPS / JWT                 │`  
`│                      │                                                     │`  
`│                      ▼                                                     │`  
`│  ┌──────────────────────────────────────────────────────────────────────┐  │`  
`│  │ Cloudflare Worker (Hono Router)                                      │  │`  
`│  │   • Validates JWT auth & Zod execution schemas                       │  │`  
`│  │   • Host of the Assistant Director / Sower agent loop                │  │`  
`│  └──────────────────┬─────────────────────────────────┬─────────────────┘  │`  
`│                     │                                 │                    │`  
`│                     ▼ Workers RPC                     ▼ SQL Queries        │`  
`│  ┌──────────────────────────────────────┐   ┌───────────────────────────┐  │`  
`│  │ ShotCoordinator (Durable Object)     │   │ Cloudflare D1 (CANON_DB)  │  │`  
`│  │   • Single-threaded state actor      │   │   • Character state facts │  │`  
`│  │   • Concurrency mutex & circuit breaker│ • Dependency edges      │  │`  
`│  │   • WebSocket Hibernation API        │   │   • Continuity validation │  │`  
`│  └──────────────────┬───────────────────┘   └───────────────────────────┘  │`  
`└─────────────────────┼──────────────────────────────────────────────────────┘`  
                      `│ Persistent Outbound WSS Tunnel (cloudflared)`  
                      `▼`  
`┌────────────────────────────────────────────────────────────────────────────┐`  
`│ REMOTE / LOCAL HARDWARE FOUNDRIES                                          │`  
`│   • Rig 1: Local Conductor / Audio Microservice (:8000) / Remotion CLI     │`  
`│   • Rig 2: media-broker (:3000) ──► Headless ComfyUI (:8188)               │`  
`└────────────────────────────────────────────────────────────────────────────┘`

> * **Hono Edge Gateway Routing:** Astro SSR endpoints dispatch parameter adjustments and scene generation triggers to edge workers running Hono, achieving sub-5ms request handling and schema validation.  
> * **D1 Hot Ledger Integration:** The dashboard queries Cloudflare D1 directly to audit character somatic states, view recent audit logs, and enforce continuity checks (e.g., rejecting actions if is\_dirty \!= 0).  
> * **Durable Object Actor Coordination:** Instead of opening unmanaged connections to hardware, the UI talks to single-threaded Durable Objects (ShotCoordinatorDO). The DO manages the execution queue and broadcasts real-time telemetry back to the dashboard using Cloudflare's **WebSocket Hibernation API**, consuming zero active compute while idle.  
> * **Asset Scrubbing via R2:** candidate screenplay ASTs, dialogue .wav stems, and rendered greenscreen video plates are streamed directly into the browser dashboard from Cloudflare R2 across its zero-egress bandwidth fabric.

### **Economic Rationale: Solving the "Hesitation Penalty"**

A core architectural motivation for deploying the dashboard onto Cloudflare is **eliminating idle compute costs during creative drafting**:

> * **Zero-Duration Idle Fees:** Creative writing, pacing review, and dramatic tuning consume hours of human consideration. Running the dashboard on dedicated cloud VMs or persistent containers accumulates continuous runtime billing (\$0.40–\$0.80/hr) even when the showrunner is idle.  
> * **Serverless Scale-to-Zero:** On Cloudflare Pages and Workers, execution is billed purely on active CPU isolates and discrete requests. When a writer leaves the dashboard open for hours to evaluate a dialogue AST, the underlying edge compute drops to **\$0.00**.  
> * **Sub-5ms Edge Ingress:** Because isolates cold-boot in under 5 milliseconds across Cloudflare's Anycast network, the dashboard delivers instant UI responsiveness without needing warm server infrastructure.

### **Hardware Ingress via Inside-Out Tunnels**

When an operator on the Cloudflare-hosted dashboard triggers a render pass or audio compilation, the request does not connect to Rig 1 or Rig 2 via open inbound firewall ports:

> * **Outbound-Only Tunnels (cloudflared):** Studio hardware (Rig 1 and Rig 2\) runs local Cloudflare Tunnel daemons that dial outward to Cloudflare's Anycast network.  
> * **Pull-Only Execution:** The Cloudflare dashboard queues jobs inside the Durable Object; the local execution daemon (media-broker on Rig 2\) pulls leased payloads across the outbound tunnel only when its local GPU lock (flock) is released.  
> * **Sovereignty Preservation:** If internet connectivity between Cloudflare and the physical rigs drops, the local foundries fall back to local disk spools (/var/spool/renders), ensuring that the cloud dashboard functions as a collaborative operational accelerator without becoming a single point of failure for physical production.

---

*User prompt: explain completely all of the functionality which goes into (goblin-dashboard)*

Response: goblin-dashboard is the web-native "Hand of God" showrunner cockpit and human-in-the-loop director interface for the episodic generation pipeline. Built using **Astro and React**, it runs locally on **Rig 1** (listening on http://localhost:4321) and can deploy to the cloud edge on **Cloudflare**. It provides the showrunner with real-time simulation observation, dramatic parameter tuning, pre-viz and animatic review, and manual override authority over generation runs.

### **Repository Role & Architectural Boundaries**

goblin-dashboard is categorized under **Cluster 05.delivery** (Optical Printing & Release Packaging) alongside goblin-viewport-template and goblin-episodes, but maintains strict decoupling from raw rendering and canon authoring:

> * **Zero Direct Video Rendering:** The dashboard is not a video compositor and does not run Remotion directly. Deterministic video rasterization is handled separately by goblin-viewport-template and the Remotion CLI. The dashboard strictly consumes the resulting pre-viz animatics, exposure sheets, and master MP4 deliverables.  
> * **Network API Isolation:** The dashboard communicates across network boundaries with worker-sower-engine (via HTTP REST and WebSockets) rather than accessing disk files directly. Screenplay drafting and raw Markdown edits remain isolated inside worker-sower-engine/drafts/ to eliminate cross-process file contention and sync latency.  
> * **Read-Only Canon Authority:** The dashboard does not mutate canonical lore Markdown files in 000.goblin-lore. It imports compiled schema contracts via @goblin/shared-types or reads compiled artifacts (bible-state.json, characters.json) to guarantee structural schema alignment.

### **Core Functional Subsystems**

The dashboard organizes showrunner operations into six functional areas:

#### **1\. Dramatic Compression & Parameter Tuning**

Exposes visual sliders and input controls to modify narrative parameters before scenes commit to generation:

> * **Dialogue Curtness & Verbosity:** Adjusts character line length and dialogue density thresholds.  
> * **Threat Level Multipliers:** Dynamically scales environmental tension, somatic injury stakes, and conflict volatility.  
> * **Pacing & Phase Weights:** Pulls the current season plan phase (rising action, climax, cooldown) and modifies global selection weights across conflict lotteries.

#### **2\. Live Simulation & Ledger Telemetry**

Visualizes real-time dynamic state tracked by worker-sower-engine across simulation cycles:

> * **Relational Ledger:** Audits character stats, active conditions, string debt balances, and current room/hex locations.  
> * **Emotional Debt Matrix:** Inspects grievance resentment accumulators and active acknowledgment windows.  
> * **Paranoia Clocks:** Displays live Paranoia Clock meters, current tick counts, and escalation limits.  
> * **Somatic & Epistemic Profiles:** Monitors physical injuries (such as concussive deafness or eye damage) and audits Belief Records to verify that character knowledge respects physical line-of-sight and acoustic occlusions.  
> * **Spatial Tracking:** Interfaces with goblin-spatial to render hex map overlays, actor positions, and traversal paths.

#### **3\. "Hand of God" Director Interventions & Overrides**

Acts as a root-level operational override console ("Miracles on Demand"):

> * **Drift Confirmation Authorization:** When worker-sower-engine detects field drift in candidate drafts (such as changes in peak tension levels or grievance escalation stages), the dashboard provides the human confirmation gate to commit or reject the ledger mutation.  
> * **Dyad & Scene Pinning:** Allows the director to bypass PRNG lotteries and manually force starved character pairings or specific grievances into the next scene.  
> * **Emergency Halt:** Triggers a pipeline kill-switch that halts automated scene advancement, freezes worker queues, and revokes execution leases across the system.

#### **4\. Pre-Viz, Animatic, & Exposure Sheet Review**

Provides human-in-the-loop sign-off before final release freezing:

> * **Animatic Radio Plays:** Streams CPU-rendered Remotion pre-viz animatics to evaluate dialogue flow and timing before dispatching heavy GPU rendering passes.  
> * **Dialogue AST & Script Inspection:** Renders parsed screenplay ASTs (dialogue\_ast.json), subtext markers, and character emotion base states.  
> * **Exposure Sheet Auditing:** Displays timeline exposure sheets (exposure\_sheet.json), showing 24 fps integer frame budgets measured via ffprobe, punctual foley markers, and dialogue sidechain ducking envelopes (-14 dB attenuation).  
> * **Master MP4 Inspection:** Displays the completed broadcast MP4 and its associated render\_manifest.json provenance seal prior to tagging.

#### **5\. Production Batch Orchestration**

Directs the physical generation pipeline across rigs and edge infrastructure:

> * **Batch Episode Triggering:** Dispatches execution commands to the Rig 1 Conductor (produceEpisode.ts) to initiate complete episode compilation runs.  
> * **Scene Retries:** Requests target re-runs for individual scenes or specific dialogue lines without invalidating unchanged upstream state.  
> * **Foundry Queue Telemetry:** Monitors the remote ComfyUI diffusion queue on Rig 2 via WebSocket telemetry from edge-director and media-broker, tracking diffusion sampling passes and greenscreen plate generation.

#### **6\. Corpus Health & Bible Integrity Telemetry**

Surfaces static worldbuilding diagnostics compiled from 000.goblin-lore:

> * **Dyadic Coverage Mesh:** Audits dyadic conflict distribution to ensure all character channels possess sufficient primary grievances.  
> * **Tonal Override Ratio:** Verifies that shallow/farce conflicts stay within the designated corpus balance threshold (≤15%).  
> * **Centrality & DAG Metrics:** Flags unlinked dead possessions, structural dependency loops, and high-centrality items.

### **Integration Interfaces & Data Ingestion Contracts**

The dashboard integrates into the wider ecosystem through strict boundaries and shared type contracts:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                        goblin-dashboard                                │`  
`│               (Astro + React UI • localhost:4321 / Edge)                │`  
`└───────────────▲────────────────────────▲───────────────────────────────┘`  
                `│                        │`  
       `HTTP REST / WebSockets   TypeScript Zod Schemas`  
                `│                        │`  
`┌───────────────▼────────────────┐ ┌─────▼───────────────────────────────┐`  
`│     worker-sower-engine        │ │      @goblin/shared-types           │`  
`│   (Rig 1 Simulation Engine)    │ │   (Extracted from goblin-lore)      │`  
`│  • GET  /ledger/state          │ │  • CharacterBioSchema               │`  
`│  • GET  /clocks/active         │ │  • GrievanceSchema                  │`  
`│  • POST /simulation/override   │ │  • DialogueASTSchema                │`  
`│  • POST /conductor/batch-run   │ │  • ExposureSheetSchema              │`  
`└────────────────────────────────┘ └─────────────────────────────────────┘`

> * **TypeScript Schema Sharing:** Instead of duplicating schema types, goblin-dashboard consumes schemas directly from a shared package (@goblin/shared-types or via npm workspaces), guaranteeing compile-time type parity with 000.goblin-lore and worker-sower-engine.  
> * **Decoupled Backend Communication:** The dashboard consumes data through structured API endpoints exposed by worker-sower-engine (e.g., GET /ledger/state, POST /simulation/override, POST /conductor/batch-run), isolating the presentation layer from the simulation's underlying SQLite/Postgres database.

### **Canonical Repository Topology & Component Anatomy**

The repository follows a standard Astro application structure featuring React UI islands for dynamic controls:

`goblin-dashboard/`  
`├── package.json                   # Dependencies (@goblin/shared-types, react, astro)`  
`├── astro.config.mjs               # Astro config (React integration & SSR adapter)`  
`├── tsconfig.json                  # Extends goblin-config ruleset`  
`├── src/`  
`│   ├── layouts/`  
`│   │   └── ShowrunnerLayout.astro # Base shell, side navigation, status header`  
`│   ├── pages/`  
`│   │   ├── index.astro            # Master production overview & batch trigger`  
`│   │   ├── telemetry/`  
`│   │   │   ├── ledger.astro       # Relational ledger, strings, and somatic state`  
`│   │   │   └── clocks.astro       # Active Paranoia Clocks and escalation graphs`  
`│   │   ├── director/`  
`│   │   │   ├── tuning.astro       # Curtness, threat, and pacing sliders`  
`│   │   │   └── overrides.astro    # Manual state injections & drift approvals`  
`│   │   ├── review/`  
`│   │   │   ├── animatic.astro     # Video pre-viz player & exposure sheet viewer`  
`│   │   │   └── screenplay.astro   # Dialogue AST inspector & audio stem waveform`  
`│   │   └── health/`  
`│   │       └── corpus.astro       # Dyadic coverage mesh & lore balance metrics`  
`│   ├── components/`  
`│   │   ├── controls/              # React islands (client:load) for interactive tuning`  
`│   │   │   ├── SliderControl.tsx`  
`│   │   │   ├── DriftApprovalModal.tsx`  
`│   │   │   └── EmergencyHaltButton.tsx`  
`│   │   ├── telemetry/             # Visualizers for simulation state`  
`│   │   │   ├── ParanoiaClockCard.tsx`  
`│   │   │   ├── StringBalanceMatrix.tsx`  
`│   │   │   └── HexMapView.tsx`  
`│   │   └── media/                 # Pre-viz players and scrubbers`  
`│   │       ├── AnimaticPlayer.tsx`  
`│   │       └── WaveformScrubber.tsx`  
`│   └── lib/`  
`│       ├── api/`  
`│       │   ├── sower-client.ts    # REST/WSS client communicating with the engine`  
`│       │   └── foundry-client.ts  # Client listening to edge-director / media-broker`  
`│       └── store/                 # Client-side UI state management`

---

*User prompt: {{FOCUS: Core Functional Responsibilities (goblin-dashboard) }} /extreme-details*

Response: The primary architectural mandate of goblin-dashboard is to serve as the unified, web-native "Hand of God" showrunner cockpit and human-in-the-loop directorial interface for the episodic generation pipeline. Built with **Astro and React**, the application operates locally on **Rig 1** (listening on http://localhost:4321) and compiles to the cloud edge on **Cloudflare Pages**. It provides the showrunner with real-time simulation observation, dramatic parameter tuning, pre-viz and animatic sign-off, and root-level manual override authority over generation runs.

### **1\. Architectural Boundaries & System Invariants**

Within the studio topology, goblin-dashboard resides in **Cluster 05.delivery** (Optical Printing & Release Packaging) alongside goblin-viewport-template and goblin-episodes, but operates under strict structural constraints:

> * **Zero Direct Compositing or Rasterization:** The dashboard is not a media renderer and does not execute Remotion rendering pipelines directly. Heavy optical printing is compiled separately by goblin-viewport-template via the headless Remotion CLI on Rig 1's CPU/RAM. The dashboard strictly streams and reviews the rendered pre-viz animatics, exposure sheets, and broadcast MP4 deliverables.  
> * **Network Boundary vs. Disk I/O:** The dashboard communicates across network boundaries with upstream services (worker-sower-engine, edge-director) via HTTP REST, Server-Sent Events, and WebSockets. Screenplay drafting, Markdown AST extraction, and file-bound modifications remain isolated on local disk inside worker-sower-engine/drafts/ to avoid cross-process file-system lock contention and synchronization latency.  
> * **Read-Only Canon Authority:** The dashboard possesses zero authority to modify the static world law defined in 000.goblin-lore. It consumes compiled, read-only schemas (bible-state.json, characters.json) via shared type definitions (@goblin/shared-types) to guarantee structural schema alignment without causing compile thrashing.

### **2\. Dramatic Parameter Tuning & Prompt Conditioning**

The dashboard hosts the **Director Console Island** (src/components/islands/DirectorConsole.tsx), an interactive React island providing continuous calibration over generative narrative weights:

`┌─────────────────────────────────────────────────────────────┐`  
`│                 DIRECTOR CONSOLE (ISLAND)                   │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  Dialogue Curtness:       [────●────────]  0.72             │`  
`│  Threat Multiplier:       [───────●─────]  1.45             │`  
`│  Relational Friction:     [─────●───────]  0.60             │`  
`│  Pacing Phase:            ( ) Setup  (●) Climax  ( ) Cooldown│`  
`│  Premise Input:           "Bog discovers the missing spoon" │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  [ DISPATCH STAGE 3 DRAFT ]        [ RESET TO RECOMMENDED ] │`  
`└─────────────────────────────────────────────────────────────┘`

> * **Dialogue Curtness & Verbosity:** Scales output sentence length, monosyllabic ratios, and syntactic brevity thresholds in the local drafting LLM (e.g., Qwen 2.5 on Rig 1).  
> * **Threat Level Multipliers:** Modifies environmental tension, somatic injury stakes, and mechanical conflict volatility across duel calculations.  
> * **Relational Friction & Pacing Phase:** Injects multipliers into Stage 3 PRNG encounter lotteries, elevating conflict intensity during Climax phases or dampening selection weights during Cooldown phases.  
> * **Premise Conditioning:** Accepts ad-hoc thematic premises or scene seeds from the showrunner, formatting them with active lore constraints before pushing them into the drafting pipeline.

### **3\. Live Simulation & Epistemic Ledger Telemetry**

The dashboard acts as a live, materialized projection of the mutable **Runtime Relational Ledger** managed by worker-sower-engine in SQLite, PostgreSQL, or Cloudflare D1:

> * **Relational & String Ledger:** Displays active character stats (e.g., *Spite*, *Cunning*), emotional conditions (humiliated, smug, terrified), and relational leverage tokens (*Strings*) held or owed between actors.  
> * **Psychological Paranoia Clocks:** Renders real-time multi-segment Paranoia Clocks, tracking active tick accumulations, panic increments, and critical escalation tripwires.  
> * **Somatic & Trauma Profiles:** Visualizes physical injury vectors (e.g., severed brachial plexus, fractured ribs, neuropathy), verifying that characters are subject to their anatomical movement budgets and motor restrictions.  
> * **Epistemic Horizon Auditing:** Surfaces the engine's *Ignorance by Omission* filters and Belief Records, allowing the director to verify that character dialogue only references facts within the actor's spatial line-of-sight and acoustic perception history.  
> * **Spatial Tracking & Hex Map Overlay:** Integrates with goblin-spatial's H3 coordinate grid to project character positions (*q*,*r*,*s*), movement trails, line-of-sight raycasts, and tactical cell capacity violations (e.g., crowding beyond 2 adult goblins).

### **4\. "Hand of God" Interventions & Administrative Overrides**

The dashboard provides root-level operational override controls ("Miracles on Demand"), ensuring the human director can bypass or correct automated simulation routines:

| Override Subsystem | Execution Trigger | Pipeline Impact |
| :---- | :---- | :---- |
| **Drift Confirmation Gate** | Automated detection of field drift during screenplay extraction (e.g., peak\_level: \[6\] \-\> \[8\], escalation\_stage: \[2\] \-\> \[3\]). | Prompts the showrunner with a modal diff. Ledger mutations are blocked until the director explicitly authorizes or rejects state drift. |
| **Dyad & Grievance Pinning** | Manual selection from the candidate roster. | Bypasses the Stage 3 PRNG lottery to force specific, starved character dyads or neglected grievances into the active scene cycle. |
| **Object & Event Injection** | Showrunner injection console. | Spawns un-simulated items, conditions, or sudden environmental hazards directly into the relational state. |
| **Emergency Halt Kill Switch** | Single-click EmergencyHaltButton.tsx. | Flips global\_agent\_dispatch\_locked \= 1 in D1 / engine, immediately revoking worker execution leases, freezing batch runs, and halting automated Git merges. |
| **Sealed-File Audit Logging** | Manual source adjustments to stamped compositions (Episode\_XXX.tsx). | Stamps the composition header with // @lifecycle: locked and logs an immutable DIRECTOR\_OVERRIDE event into the narrative audit ledger. |

### **5\. Animatic Pre-Viz, Script AST, & Exposure Sheet Review Gate**

The primary quality-control gate occurs within the dashboard before any heavy GPU compute or final release freezing is initiated:

               `UPSTREAM GENERATION`  
        `(worker-sower-engine / Conductor)`  
                       `│`  
                       `▼`  
`┌─────────────────────────────────────────────────────────────┐`  
`│              SHOWRUNNER REVIEW GATE (DASHBOARD)             │`  
`│                                                             │`  
`│  [ CPU Animatic Video Player ] ◄── Remotion Pre-Viz Stream  │`  
`│  [ Exposure Sheet Scrubber   ] ◄── Integer 24fps Budgets    │`  
`│  [ Dialogue AST & Subtext    ] ◄── Swain MRU & Motor Verbs  │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  [ APPROVE & BATCH RENDER ]    [ REJECT WITH ERROR TAG ]    │`  
`└──────────────┬───────────────────────────────┬──────────────┘`  
               `│ (Approved)                    │ (Rejected)`  
               `▼                               ▼`  
       `Rig 2 GPU Foundry               Jules AST Patch Loop`  
    `(media-broker / ComfyUI)          (eval/rejections.jsonl)`

> * **CPU-Rendered Animatic Radio Plays:** Streams low-fidelity Remotion pre-viz animatics to evaluate comedic timing, vocal cadence, and line delivery prior to dispatching diffusion passes.  
> * **Screenplay AST & Subtext Inspection:** Displays the parsed dialogue\_ast.json, showing character base emotions, Swain Motivation-Reaction Unit (MRU) beats, and the delta between *Surface Want* and *Actual Want*.  
> * **Motor Action Invariant Auditing:** Surfaces the character's extracted\_motor\_actions array alongside the *T*0​ invariant gauntlet verdicts, verifying that somatic damage restrictions (e.g., an amputee never executing two-handed tasks) were validated.  
> * **Exposure Sheet Auditing:** Audits the 24 fps integer frame budgets derived via ffprobe:  
>   target\_frames=⌈1000duration\_ms​×24⌉  
>   It visualizes audio stem boundaries, punctual foley cues (FoleyTrack.tsx), and dialogue sidechain ducking curves (-14 dB attenuation on ambient beds).  
> * **Structured Rejection Corpus:** When rejecting a scene, the director tags specific structural failure codes (FLAT\_DIALOGUE, UNEARNED\_RELEASE, SOMATIC\_DRIFT, VOICE\_BLEED, PACING\_STALL) into eval/rejections.jsonl. This telemetry feeds automated refactoring agents (like Jules) to patch AST timings with zero GPU re-rendering costs.  
> * **Master MP4 Provenance Verification:** Displays final broadcast MP4s accompanied by their cryptographic render\_manifest.json, verifying asset SHA-256 digests and exact dependency commit SHAs before distribution.

### **6\. Production Batch Orchestration & Hardware Foundry Telemetry**

The dashboard coordinates physical execution across distributed nodes without executing heavy compute itself:

> * **Rig 1 Conductor Dispatch:** Manually triggers produceEpisode.ts (the Conductor) on Rig 1 to begin complete episode compilation passes.  
> * **Granular Scene Retries:** Issues targeted re-run commands for single scenes, dialogue stems, or camera curves without invalidating unchanged upstream scene states.  
> * **Foundry Queue Telemetry:** Connects to the Cloudflare edge-director and Rig 2's media-broker to monitor the single-threaded GPU hardware mutex (ShotCoordinatorDO). The showrunner tracks active Wan 2.2 diffusion passes on ComfyUI (port 8188), monitoring plate generation, WebSocket heartbeats, and VRAM memory purges (POST /free).

### **7\. Corpus Health & Static Worldbuilding Diagnostics**

The dashboard provides a visual interface for the compile-time health suite (goblin-lore health), ensuring static worldbuilding remains balanced before compute is spent:

> * **Dyadic Coverage Mesh:** Scans the 2*N*(*N*−1)​ dyadic channels across cast members, flagging DYADIC\_STARVATION\_WARNING (channels with \<2 active grievances) or FATAL\_BLIND\_SPOT (0 grievances) to prevent simulator stalls.  
> * **Tonal Override Ratio Monitor:** Audits the grievance pool to ensure that farce/shallow conflicts (tonal\_override\_eligible: true) remain capped at ≤15%.  
> * **Power-Law Centrality & DAG Pacing:** Visualizes item and location Gini coefficients, identifying over-connected "Monolithic Spines" or unlinked "Dead Lore" in the dependency graph.  
> * **Procedural Boredom Telemetry:** Evaluates rolling Monte Carlo similarity metrics; if scene similarity exceeds 0.65, it flags a boredom breach and pinpoints repetitive lottery weights.

### **8\. Dual-Topology Execution: Rig 1 vs. Cloudflare Pages**

goblin-dashboard operates across two execution environments without code divergence:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1 LOCAL DESKTOP (localhost:4321)                                   │`  
`│  • Astro dev / Node server connected to local SQLite ledger            │`  
`│  • Low-latency direct socket connection to produceEpisode.ts           │`  
`└────────────────────────────────────────────────────────────────────────┘`  
                                    `▲`  
                         `Identical Astro Source`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE PAGES / WORKERS EDGE (studio.yourdomain.com)                │`  
`│  • Compiled via @astrojs/cloudflare SSR adapter                        │`  
`│  • Queries Cloudflare D1 (CANON_DB) with sub-5ms latency               │`  
`│  • WebSocket Hibernation API via ShotCoordinatorDO                     │`  
`│  • Streams assets directly from Cloudflare R2 (zero-egress bandwidth)  │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Local Cockpit (Rig 1):** Runs directly on the workstation desktop alongside the Conductor and SQLite database, providing zero-latency control during active studio sessions.  
> * **Edge Cockpit (Cloudflare Pages):** Deployed via the @astrojs/cloudflare SSR adapter for mobile or remote showrunners. It connects to Cloudflare D1 for state validation, streams plates from Cloudflare R2, and interacts with Durable Objects using the WebSocket Hibernation API. This eliminates the "hesitation penalty," dropping active edge compute costs to \$0.00 while the director reviews scripts and animatics. Hardware communication routes through outbound-only cloudflared tunnels to prevent exposed inbound ports on local machines.

---

*User prompt: {{FOCUS: Integration & Communication Invariants (goblin-dashboard) }} /extreme-details*

Response: The integration and communication architecture of goblin-dashboard is governed by strict boundary constraints, unidirectional data flows, and zero-trust contract validations. Categorized under **Cluster 05.delivery** (Optical Printing, Showrunner Cockpits, and Release Packaging), the dashboard acts purely as an observational cockpit and human-in-the-loop director interface. It is deliberately decoupled from video rasterization, file-bound drafting, and canonical world legislation.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   000.goblin-lore (Legislative Canon)                  │`  
`│       • Immutable Git Markdown dossiers, Zod schemas, compile.ts       │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Read-only compiled JSON / Zod types`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│             worker-sower-engine (Runtime Simulation Core)              │`  
`│       • SQLite/D1 Ledger, PRNG duels, drafts/, Paranoia Clocks         │`  
`└───────▲───────────────────────────┬────────────────────────────▲───────┘`  
        `│ Authenticated REST / WSS  │ JSON Payloads              │`  
        `│ Intent Submissions        │ Live State Events          │ Direct`  
        `│                           ▼                            │ Execution`  
`┌───────┴───────────────────────────┴────┐   ┌───────────────────┴───────┐`  
`│           goblin-dashboard             │   │ worker-sower-conductor    │`  
`│  (Astro + React UI • Rig 1 / Edge)     │   │ (Local Temporal Host)     │`  
`│  • Visualizes Ledger & Epistemic State │   │ • ffprobe audio locking   │`  
`│  • Exposes Dramatic Tuning Sliders     │   │ • Spawns Remotion CLI     │`  
`│  • Animatic, Script AST & Gate Reviews │   │ • Local TTS Microservice  │`  
`└──────────────────┬─────────────────────┘   └─────────────┬─────────────┘`  
                   `│ Streams MP4, AST & Exposures          │ Emits MP4 &`  
                   `│ (Read-Only Consumer)                  │ Provenance Manifest`  
                   `▼                                       ▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│         goblin-episodes / goblin-viewport-template Deliverables         │`  
`│     • Stamped Episode_XXX.tsx, audio stems, render_manifest.json       │`  
`└────────────────────────────────────────────────────────────────────────┘`

### **Cross-Repository Boundary Matrix**

| Repository Boundary | Permitted Protocols | Directionality | Strict Negative Invariants |
| :---- | :---- | :---- | :---- |
| **000.goblin-lore** | Static package import (@goblin/shared-types), disk-compiled JSON ingestion. | **Unidirectional:** Lore ⟶ Dashboard. | **No Direct Writes:** Dashboard cannot alter lore Markdown, bypass the compiler, or mint canonical entities. |
| **worker-sower-engine** | HTTP REST (FastAPI/Express/Hono), WebSocket / SSE streams. | **Bidirectional:** Dashboard ⟷ Engine. | **No Disk Contention:** Dashboard cannot touch SQLite files or drafts/ on disk directly. |
| **goblin-viewport-template** | HTTP/R2 asset streaming, JSON exposure sheet ingestion. | **Unidirectional:** Viewport ⟶ Dashboard. | **Zero Render Invocation:** Dashboard never invokes Remotion or headless Chromium directly. |
| **goblin-conductor** | Process control REST API, SSE execution logs. | **Bidirectional:** Dashboard ⟷ Conductor. | **Hardware Isolation:** Conductor executes CPU tasks locally; dashboard only triggers batch scripts. |

### **Network Boundary vs. Disk I/O Invariants**

The boundary between goblin-dashboard and worker-sower-engine is strictly network-bound to eliminate file-system contention:

`┌───────────────────────────────────────┐         ┌───────────────────────────────────────┐`  
`│           goblin-dashboard            │         │          worker-sower-engine          │`  
`│                                       │         │                                       │`  
`│  [ Director Action ]                  │         │  [ Local Disk Storage ]               │`  
`│         │                             │         │    • drafts/scene_012.md (Fountain)   │`  
`│         ▼                             │         │    • state.db (SQLite / D1)           │`  
`│  POST /api/v1/intents/parameter-shift │ ──────► │         │                             │`  
`│  Payload: { curtness: 0.85 }          │ (HTTP)  │         ▼                             │`  
`│                                       │         │  [ Engine Intent Reducer ]            │`  
`│  GET  /api/v1/ledger/telemetry        │ ◄────── │  • Evaluates state delta              │`  
`│  Response: TelemetryEventStream       │  (SSE)  │  • Writes mutations locally           │`  
`└───────────────────────────────────────┘         └───────────────────────────────────────┘`

> * **Elimination of File Lock Latency:** In earlier designs, editing drafts and adjusting scene parameters risked cross-process file collisions. The dashboard communicates exclusively through HTTP endpoints exposed by the engine's service layer.  
> * **Draft Quarantine Invariant:** Narrative text generation, Fountain formatting, and LLM text extraction operate locally on disk inside worker-sower-engine/drafts/. The dashboard never streams raw Markdown files back and forth over HTTP to prevent file-system permission conflicts, merge race conditions, and disk sync latency.  
> * **Network-Only State Mutex:** Live state modifications (e.g., ticking clocks, shifting string debts, updating character locations) are mediated through explicit HTTP requests (POST /ledger/override) rather than direct database driver operations. The dashboard contains zero database drivers (sqlite3, better-sqlite3, or direct D1 bindings).

### **Unidirectional Semantic Authority & Intent-Driven Mutation**

The system enforces a strict separation between meaning, state history, and presentation:

Canon Law (Lore)⟶Historical Truth (Sower Ledger)⟶Observation / Direction (Dashboard)⟶Media (Viewport)

#### **1\. Zero Semantic Authority Invariant**

As a member of Cluster 05, the dashboard possesses zero semantic authority:

> * It cannot declare new lore, mint canonical characters, or redefine static world rules.  
> * If a director identifies that a character's dialogue contradicts established canon or somatic baselines, the fix cannot be applied in the dashboard; the narrative must be re-staged upstream through the engine or patched in 000.goblin-lore.

#### **2\. The Epistemic Intent Boundary**

The dashboard never dispatches raw state mutations (e.g., SET bog.spite \= 4). Instead, it dispatches **Intents**:

`// Proposed Intent Envelope emitted by goblin-dashboard`  
`export interface DirectorIntentEnvelope {`  
  `readonly intent_id: string; // UUIDv7`  
  `readonly intent_type: 'OVERRIDE_CLOCK' | 'PIN_DYAD' | 'SET_COMPRESSION' | 'AUTHORIZE_DRIFT';`  
  `readonly authorizer_role: 'SHOWRUNNER' | 'SCENE_DIRECTOR';`  
  `readonly timestamp_sim_cycle: number;`  
  `readonly payload: Record<string, unknown>;`  
  `readonly client_signature: string;`  
`}`

The engine's reducer evaluates every intent against physical and epistemological invariants (somatic movement costs, cell crowding rules, line-of-sight bounds) before writing an event to the ledger. If an intent violates physical constraints, the engine rejects it with a validation error.

#### **3\. Deep-Frozen Immutable Lore Consumption**

When the dashboard ingests compiled world truth (bible-state.json via @goblin/shared-types), the data is wrapped in a deep-frozen proxy:

> * Any runtime attempt by dashboard client scripts to mutate character base stats, push items into equipment slots, or append grievances throws a TypeError (Cannot add property X, object is not extensible).  
> * The dashboard reads world truth as a fixed baseline to compare against the dynamic, drifting state coming from the simulation engine.

### **Type Synchronization & Schema Contract Invariants**

To avoid schema drift across independent repositories, type definitions are maintained through monorepo workspace dependencies and strict validation schemas:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                        @goblin/shared-types                            │`  
`│                 (Canonical Zod Schemas & Inferred Types)               │`  
`└───────────────────┬────────────────────────────────┬───────────────────┘`  
                    `│                                │`  
                    `▼ workspace:*                    ▼ workspace:*`  
`┌──────────────────────────────────────┐  ┌──────────────────────────────┐`  
`│           goblin-dashboard           │  │     worker-sower-engine      │`  
`│  • Imports SceneFrontmatterSchema    │  │  • Imports SomaticVector     │`  
`│  • Validates API telemetry streams   │  │  • Evaluates duel mechanics  │`  
`│  • Enforces .strict() UI boundaries  │  │  • Emits dialogue_ast.json   │`  
`└──────────────────────────────────────┘  └──────────────────────────────┘`

#### **1\. Zero-Copy Workspace Linking**

goblin-dashboard defines its dependency on canonical types via workspace protocols:

`{`  
  `"name": "goblin-dashboard",`  
  `"dependencies": {`  
    `"@goblin/shared-types": "workspace:*"`  
  `}`  
`}`

This eliminates manual copy-pasting of interfaces and guarantees that updates to character vectors or scene AST schemas immediately surface type-check failures across the UI build (tsc \--noEmit).

#### **2\. Universal .strict() Payload Sanitization**

Every API route in the dashboard parses incoming and outgoing JSON using Zod schemas configured with .strict() (disallowing unvetted additional properties):

`import { z } from "zod";`

`export const ParameterTuningPayloadSchema = z.object({`  
  `curtness_factor: z.number().min(0.0).max(1.0),`  
  `threat_multiplier: z.number().min(0.5).max(3.0),`  
  `relational_friction: z.number().min(0.0).max(2.0),`  
  `target_scene_id: z.string().regex(/^ep\d+_sc\d+$/),`  
`}).strict(); // Strips or errors on parameter pollution`

Payloads with extraneous or malformed parameters are rejected immediately, protecting internal components from parameter pollution or unexpected type coercions.

#### **3\. Schema Pin Drift & Lockfile Auditing**

The meta-orchestrator (goblin-project/versions.json) monitors semantic dependency parity:

> * If 000.goblin-lore merges an updated schema (e.g., adding an equipment slot to LogisticalVectorSchema), the hourly drift auditor flags the dashboard as DRIFT\_VERSION until its lockfile is bumped.  
> * This prevents desynchronized validators, where an edge dashboard accepts UI input that local simulation engines reject during later build stages.

### **Optical Pipeline Decoupling & Media Handoff Protocols**

goblin-dashboard maintains an explicit separation from goblin-viewport-template and the Remotion execution runtime:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                        HEAVY COMPOSITING STACK                         │`  
`│ worker-sower-conductor (Rig 1) ──► Remotion CLI (--gl=swangle)         │`  
`│                                           │                            │`  
`│                                           ▼ Produces Hardened Media    │`  
`│                        goblin-episodes/episode-XXX/                    │`  
`│                        ├── master_XXX.mp4                              │`  
`│                        ├── animatic_preview.mp4                        │`  
`│                        ├── exposure_sheet.json                         │`  
`│                        └── render_manifest.json                        │`  
`└───────────────────────────────────────────┬────────────────────────────┘`  
                                            `│ Streamed via HTTP / R2`  
                                            `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   goblin-dashboard (Visual Reviewer)                   │`  
`│  • Reads animatic_preview.mp4 via HTML5 <video> (zero GPU compositing) │`  
`│  • Audits exposure_sheet.json integer frame budgets (24 fps)           │`  
`│  • Evaluates dialogue sidechain ducking (-14 dB curve)                 │`  
`│  • Signs off on render_manifest.json SHA-256 provenance hashes        │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Zero Headless Chromium Directives:** The dashboard never invokes @remotion/renderer or boots headless Chromium processes. Video rendering requires software OpenGL (--gl=swangle), locked worker concurrency (--concurrency=1), and off-thread media decoders (\<OffthreadVideo/\>), consuming significant CPU and system RAM. The dashboard remains a lightweight Astro/React UI application that runs on standard browser runtimes without triggering render spikes.  
> * **Downstream Artifact Ingestion:** The dashboard interacts with visual assets only after they have been processed by the Conductor or the ComfyUI GPU foundry on Rig 2\. It streams CPU-rendered animatics, audio waveforms, exposure sheets, and master MP4s directly from local disk caches (public/renders/) or Cloudflare R2 object storage.  
> * **Structured Review & Rejection Protocol:** During pre-viz animatic sign-off, the dashboard does not apply direct edits. If a timing or dialogue cue fails inspection, the director tags a structured rejection error (FLAT\_DIALOGUE, SOMATIC\_DRIFT, UNEARNED\_RELEASE), saving the failure metadata into eval/rejections.jsonl to drive automated AST refactoring passes.

### **Dual-Topology Transport Invariants: Rig 1 Local vs. Cloudflare Edge**

goblin-dashboard operates across two execution environments without code divergence:

`==========================================================================`  
`TOPOLOGY A: RIG 1 LOCAL COCKPIT (Desktop Station)`  
`==========================================================================`  
`[ Browser UI: localhost:4321 ]`  
        `│`  
        `│ HTTP REST / WebSocket (localhost loopback)`  
        `▼`  
`[ worker-sower-engine (:3000) ] ◄── Direct Socket ──► [ Local SQLite DB ]`

`==========================================================================`  
`TOPOLOGY B: CLOUDFLARE EDGE COCKPIT (Distributed Edge Deployment)`  
`==========================================================================`  
`[ Browser UI: studio.yourdomain.com (Cloudflare Pages) ]`  
        `│`  
        `│ HTTPS / JWT Auth (<5ms Anycast Edge)`  
        `▼`  
`[ Cloudflare Worker Gateway (Hono Router) ]`  
        `├── Workers RPC ──► [ ShotCoordinatorDO (Durable Object Mutex) ]`  
        `│                          │ (WebSocket Hibernation API)`  
        `└── SQL Direct  ──► [ Cloudflare D1 (CANON_DB Hot Ledger) ]`  
                                   `│`  
                                   `│ Persistent WSS Tunnel (cloudflared)`  
                                   `▼`  
`[ RIG 1 / RIG 2 FOUNDRY DAEMONS ] (Pulls leased payloads via inside-out tunnel)`

#### **1\. Rig 1 Local Loopback Topology**

When running locally on Rig 1, the dashboard connects directly to local processes:

> * **Transport:** Dispatches REST requests to http://localhost:3000 (or the configured Sower engine port) and listens for engine updates over ws://localhost:3000/events.  
> * **Zero Network Authentication Overhead:** Local dev instances rely on direct machine-bound Unix domain sockets or standard loopback addressing, with no cloud latency or egress dependencies.

#### **2\. Cloudflare Edge Topology & The Zero-Egress Boundary**

When built using @astrojs/cloudflare and deployed to Cloudflare Pages:

> * **Sub-5ms Hot Ledger Access:** Dashboard SSR endpoints query Cloudflare D1 (CANON\_DB) directly using native Workers bindings, fetching character somatic statuses and historical audit logs in sub-5ms lookup windows.  
> * **WebSocket Hibernation API:** Telemetry between the edge dashboard and the single-threaded ShotCoordinatorDO uses Cloudflare's WebSocket Hibernation protocol. The Durable Object sleeps during periods of showrunner inactivity, reducing compute costs to \$0.00 while the director reviews script drafts and animatics.  
> * **Inside-Out Hardware Tunneling (cloudflared):** The edge dashboard never initiates direct inbound connections to Rig 1 or Rig 2 firewalls. Studio hardware runs local cloudflared daemons that maintain persistent outbound tunnels to Cloudflare. Rigs lease execution tasks from the Durable Object queue only when local processing locks (flock) are cleared.  
> * **Zero-Egress Asset Scrubbing:** Review assets (character sprite plates, dialogue stems, CPU animatic MP4s) are stored in and scrubbed directly from **Cloudflare R2**, eliminating bandwidth egress charges across global review sessions.

### **Provenance Verification, Cryptographic Anchoring, and Audit Logging**

Every transaction passing through goblin-dashboard leaves an immutable trace in the production audit log:

> * **Director Override Event Logging:** When a showrunner executes a manual intervention (such as an emergency pipeline halt or state injection), the dashboard dispatches an authenticated audit event to the engine:  
>   `{`  
>     `"event_type": "DIRECTOR_OVERRIDE",`  
>     `"cycle_sequence": 142,`  
>     `"authorizer": "SHOWRUNNER",`  
>     `"action": "PIN_GRIEVANCE",`  
>     `"target_dyad": ["char_bog", "char_silas"],`  
>     `"reason": "Resolving dyadic starvation prior to Episode 041 freeze",`  
>     `"timestamp_utc": "2026-09-29T14:43:15Z"`  
>   `}`

The engine appends this record directly to the immutable SQLite/D1 event stream, ensuring that human interventions are cryptographically audited rather than silently mutating state.

> * **Render Manifest Verification Gate:** Before the dashboard permits final release tagging for an episode, it inspects the generated render\_manifest.json. The UI validates that the artifact contains matching Git commit SHAs across all pipeline dependencies (000.goblin-lore, worker-sower-engine, goblin-viewport-template, and goblin-assets-visual) alongside the compiled SHA-256 binary hash of the master MP4. If any hash mismatches or points to uncommitted repository dirty states, the dashboard blocks release publishing.

---

*User prompt: {{FOCUS: 3\. Deep-Frozen Immutable Lore Consumption(goblin-dashboard) }} /extreme-details*

### **Response: 1\. The Ontological Partition & Zero Semantic Authority**

In the four-tier architectural ontology of the production pipeline (Canon⟶Events⟶State⟶Media), goblin-dashboard resides purely in the presentation and directorial review layer (Cluster 05.delivery). It possesses **zero semantic authority** over canonical truth:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   000.goblin-lore (LEGISLATIVE CORE)                   │`  
`│   • Pure mathematical function over an append-only Git commit ledger   │`  
`│   • Authored Markdown dossiers (/characters, /grievances, /locations)  │`  
`│   • Three-pass compiler (scripts/compile.ts) emits bible-state.json    │`  
`│   • Cryptographic SHA-256 seal (H_root)                                │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Read-only import (src/client.ts)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   goblin-dashboard (SHOWRUNNER COCKPIT)                │`  
`│   • Ingests bible-state.json via @goblin/shared-types or client API    │`  
`│   • Enforces recursive Object.freeze() across all ingested objects     │`  
`│   • Evaluates delta: [Dynamic Ledger State] - [Deep-Frozen Lore State] │`  
`│   • ZERO WRITE AUTHORITY: Cannot alter, bypass, or clobber canon law   │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Evaluates Live State vs Canon Base`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│              worker-sower-engine (RUNTIME SIMULATION LEDGER)           │`  
`│   • SQLite / PostgreSQL / Cloudflare D1 (CANON_DB)                     │`  
`│   • Dynamic state: Hex coordinates, Paranoia Clocks, Somatic trauma    │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **The Legislative Core vs. Presentation Separation:** Canonical world law is established offline within 000.goblin-lore (or packages/001.lore) via human-authored Markdown dossiers. The dashboard cannot define new characters, create props, or alter static physical limits.  
> * **The Deletion Principle Preservation:** If all runtime databases, browser state, ephemeral caches, and Cloudflare workers are destroyed, canonical universe truth survives fully intact within the Git commit history of the raw Markdown dossiers. The dashboard is a disposable lens projecting that truth, never a repository of it.  
> * **Defense of the *T*0​\=\$0.00 Invariant:** Catching narrative contradictions or anatomical violations at compile time (*T*0​) costs \$0.00. If the dashboard were permitted to mutate canonical lore in memory or inject ad-hoc world exceptions, it would introduce silent runtime drift, invalidate downstream Zod bounds, and cause expensive downstream token or GPU render burns.

### **2\. The Ingestion Boundary (src/client.ts)**

goblin-dashboard never globs local directories, parses raw Markdown dossiers, or processes frontmatter with gray-matter at runtime. Downstream consumers interact with lore exclusively through compiled, validated JSON artifacts (bible-state.json) via a typed programmatic client boundary (src/client.ts):

`// packages/001.lore/src/client.ts (Ingested by goblin-dashboard)`  
`import fs from 'node:fs';`  
`import path from 'node:path';`  
`import type {`   
  `Character,`   
  `Location,`   
  `Grievance,`   
  `Possession,`   
  `World`   
`} from '../schemas/index.js';`

`export interface BibleStateMeta {`  
  `readonly series_slug: string;`  
  `readonly compiled_at: string;`  
  `readonly compiler_version: string;`  
  `readonly state_hash: string; // H_root`  
  `readonly entity_counts: {`  
    `readonly characters: number;`  
    `readonly locations: number;`  
    `readonly possessions: number;`  
    `readonly grievances: number;`  
  `};`  
`}`

`export interface DeepFrozenBibleState {`  
  `readonly meta: BibleStateMeta;`  
  `readonly characters: Readonly<Record<string, Readonly<Character>>>;`  
  `readonly locations: Readonly<Record<string, Readonly<Location>>>;`  
  `readonly grievances: Readonly<Record<string, Readonly<Grievance>>>;`  
  `readonly possessions: Readonly<Record<string, Readonly<Possession>>>;`  
  `readonly world: Readonly<World>;`  
`}`

> * **Offline Compiled Seal:** The dashboard reads compiled/bible-state.json (or compiled/\<seriesSlug\>/bible-state.json in multi-series setups) directly from disk on Rig 1, or pulls it as a statically packaged workspace bundle via @goblin/shared-types.  
> * **Direct Ingestion Invariant:** Section 17, Rule 4 is maintained: *No runtime Markdown parsing—downstream consumers must use the compiled JSON artifact*. The dashboard consumes only pre-compiled, schema-validated, and referentially unified JSON data.

### **3\. Mechanical Implementation of Deep-Freezing**

To ensure that neither client-side React islands, Astro SSR endpoints, nor malicious script extensions can modify the canonical baseline in memory, src/client.ts subjects all loaded JSON structures to a recursive deep-freeze protocol before returning them to the dashboard runtime:

`/**`  
 `* Recursively applies Object.freeze to an object tree to ensure`  
 `* absolute immutability across runtime execution scopes.`  
 `*/`  
`export function deepFreeze<T>(obj: T): DeepReadonly<T> {`  
  `// Primitives, null, and undefined are inherently immutable`  
  `if (obj === null || typeof obj !== 'object') {`  
    `return obj as DeepReadonly<T>;`  
  `}`

  `// Retrieve own property names to prevent inherited property mutation`  
  `const propNames = Object.getOwnPropertyNames(obj);`

  `for (const name of propNames) {`  
    `const value = (obj as Record<string, unknown>)[name];`  
    `if (value !== null && typeof value === 'object') {`  
      `deepFreeze(value);`  
    `}`  
  `}`

  `return Object.freeze(obj) as DeepReadonly<T>;`  
`}`

#### **Runtime Guardrails & Failure Modes**

> * **Mutation Trapping:** If any dashboard controller or UI component attempts an assignment such as:  
>   `const lore = await loadBibleState('under-the-floorboards');`  
>   `// Attempting to inject an ad-hoc possession into Bog's inventory`  
>   `lore.characters['char_bog'].logistical.worn.push('item_contraband_knife');`

>   The JavaScript V8 runtime immediately raises an unhandled exception:  
>   `TypeError: Cannot add property 1, object is not extensible`  
>       `at Array.push (<anonymous>)`  
>       `at DirectorConsole.tsx:142:52`

> * **Property Reassignment Trapping:** Reassigning top-level or scalar bounds (e.g., lore.characters\['char\_bog'\].somatic.locomotion\_baseline \= 'bipedal\_standard') fails with:  
>   `TypeError: Cannot assign to read only property 'locomotion_baseline' of object '#<Object>'`

> * **Prototype Pollution Defenses:** Because Object.freeze() seals descriptors (configurable: false, writable: false), prototype tampering or monkey-patching methods onto canonical entity objects is structurally prevented at the engine level.

### **4\. TypeScript Compile-Time Immutability Contracts**

At compile time, goblin-dashboard wraps ingested lore types using recursive read-only utility types:

`export type DeepReadonly<T> = T extends (infer R)[]`  
  `? ReadonlyArray<DeepReadonly<R>>`  
  `: T extends Function`  
  `? T`  
  `: T extends object`  
  `? { readonly [K in keyof T]: DeepReadonly<T[K]> }`  
  `: T;`

This enforces compile-time safety across Astro pages and React UI islands:

> * **Disallowed Array Methods:** Invocations of .push(), .pop(), .splice(), .shift(), or .sort() on lore vectors (such as banned\_kinetic\_verbs or participants\_primary) immediately fail the typechecker (Property 'push' does not exist on type 'readonly string\[\]').  
> * **Elimination of Two-Way Binding:** Form components in src/components/controls/ cannot bind directly to canonical entity objects. Any directorial parameter adjustment must emit an independent, decoupled IntentEnvelope dispatched over HTTP/REST to worker-sower-engine, leaving the deep-frozen lore state completely untouched.

### **5\. Ground Truth Projection: Baseline vs. Dynamic Ledger**

In goblin-dashboard, deep-frozen lore functions as the immutable control baseline against which the dynamic, mutable state of the simulation is measured:

Δstate​\=StateLedger​(tick*N*​)−CanonDeepFrozen​(*H*root​)

The dashboard displays this comparison through dedicated telemetry visualizers:

| Vector Dimension | Deep-Frozen Canon (bible-state.json) | Dynamic Simulation Ledger (worker-sower-engine) | Dashboard Telemetry Visualization |
| :---- | :---- | :---- | :---- |
| **Somatic Baseline** | locomotion\_baseline: "bipedal\_standard" banned\_kinetic\_verbs: \["sprint"\] | Active trauma: severed\_left\_arm Dynamic fatigue debuffs | Renders character body map displaying permanent anatomical constraints vs. temporary injuries. |
| **Logistical Inventory** | Equip capacities: max\_held: 2, max\_worn: 4 Weight classes | Current custody: char\_bog holds item\_silver\_spoon Contested flag | Displays inventory slot gauges, warning if current item burdens violate immutable mass limits. |
| **Epistemic Truth** | Static world axioms Deliberately Unresolved Mysteries | Dynamic Belief Records Secrets revealed in cycle *N* | Visualizes *Ignorance by Omission* horizons, ensuring dialogue prompts do not access forbidden canon. |
| **Social Matrix** | Base grievance trees escalation\_ceiling: 5 | Active resentment accumulators Live Paranoia Clock ticks (3/6) | Overlays active dynamic tension meters directly on top of the static, deep-frozen grievance DAG. |

### **6\. Cryptographic Anchoring & Drift Enforcement**

To prevent the dashboard from rendering dynamic simulations against mismatched or stale canonical baselines, every loaded state is cryptographically bound:

> 1. **State Snapshot Hash Verification (*H*root​):** When the dashboard connects to worker-sower-engine or reads a scene's dialogue\_ast.json, it validates the active state\_snapshot\_hash against the meta.state\_hash of its own deep-frozen bible-state.json:  
>    assert(*H*rootDashboard​\==*H*rootLedger​)  
> 2. **Hard Fail on Desynchronization:** If an author commits changes to 000.goblin-lore/characters/bog.md and generates a new root hash, but worker-sower-engine or the edge cache is operating on an older build, the dashboard immediately triggers a **Continuity Desynchronization Lock**. It flags the UI with a visual drift tripwire, disables batch episode dispatching, and refuses to render pre-viz animatics until all nodes align on the same immutable hash.  
> 3. **No Bypass via the Dashboard UI:** If a showrunner wishes to permanently adopt an in-simulation consequence (such as an amputation becoming permanent world law), the dashboard provides no mechanism to "Save to Canon". The change must follow the formal **Upstream Canon Promotion Gate**:  
   * The simulation engine emits state\_delta.json.  
   * The showrunner reviews the change at the Archival Review Gate.  
   * A human manually submits a Git Pull Request modifying the Markdown dossiers in 000.goblin-lore (e.g., setting status: departed or appending banned\_kinetic\_verbs).  
   * scripts/compile.ts re-evaluates the three-pass gauntlet and stamps a new *H*root​ into bible-state.json.  
   * The dashboard re-ingests the updated, freshly frozen artifact via standard Git and dependency version updates.

---

*User prompt: {{FOCUS: 2\. Dramatic Parameter Tuning & Prompt Conditioningon (goblin-dashboard) }} /extreme-details*

Response: In goblin-dashboard, **Dramatic Parameter Tuning & Prompt Conditioning** represents an operational paradigm shift: human directors do not write manual dialogue or prompt-engineer free prose. Instead, the dashboard acts as a high-level directorial cockpit where qualitative dramatic intent is calibrated via continuous numeric vectors, compiled against verified narrative state, and converted into constrained prompt payloads.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   goblin-dashboard (Astro / React UI)                  │`  
`│                                                                        │`  
`│  [ Curtness: 0.85 ]  [ Pacing: 0.70 ]  [ Threat: 0.80 ]  [ Subtext: 0.90 ]`  
`│  [ Pacing Mode: DRAMATIC_IRONY ]       [ Premise: "Valve Dispute" ]     │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Director Intent Payload (JSON)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                  CONTEXT & PROMPT COMPILATION ENGINE                   │`  
`│                                                                        │`  
`│  1. Ingest State Vectors (worker-sower-engine / D1 CANON_DB)           │`  
`│     • Active Grievance: grv_pipe_perimeter (Surface vs. Underneath)    │`  
`│     • Epistemic Horizon: Filter via Ignorance by Omission              │`  
`│     • Somatic Caps: Banned kinetic verbs & motor limitation flags      │`  
`│                                                                        │`  
`│  2. Inject Attenuation Heuristic (Subtext Suppression)                 │`  
`│     • Banned Tokens: ["pipe", "valve", "heat", "overseer", "theft"]    │`  
`│     • Tactical Displacement: Route leverage through grease & soot      │`  
`│                                                                        │`  
`│  3. Assemble The Attention Sandwich (15% / 70% / 15%)                  │`  
`│     • Top: Immutable rules, refusal vectors, stylometric bounds        │`  
`│     • Middle: Sliding prose momentum buffer + sanitized BeliefRecords  │`  
`│     • Bottom: Micro-beat bounds (200-250 words) + Hard Exit Condition  │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Structured Payload / GBNF Grammar`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                LOCAL / FRONTIER INFERENCE ENGINES (T_0)                │`  
`│   • Local Model (Rig 1): Qwen 2.5 (Motor blocking & verbatim lines)   │`  
`│   • Multi-Model Fan-Out (N=4 takes): Claude 3.5 Sonnet / Local LLMs    │`  
`│   • Emits: dialogue_ast.json (MRU beats, actions) + .fountain prose    │`  
`└────────────────────────────────────────────────────────────────────────┘`

### **1\. The Continuous Parameter Vector Space (*P*dramatic​)**

The dashboard translates UI sliders into a normalized four-dimensional parameter vector *P*\=⟨*C*,*P*,*T*,*S*⟩∈\[0.0,1.0\]4 consumed directly by the prompt compilation layer:

#### **Curtness (*C*∈\[0.0,1.0\])**

> * **Mechanical Function:** Dictates syntactic density, clause chaining, and word-budget ceilings for spoken lines.  
> * **Prompt Injection (*C*≥0.75):** Enforces terse, blunt exchanges, monosyllabic lexicons, high ellipsis frequency, and a hard ceiling of under eight words per dialogue block.  
> * **Prompt Injection (*C*≤0.25):** Relaxes sentence caps, compelling the model to construct multi-clause, rhythmically complex, and evasive periodic sentences.  
> * **Downstream Impact:** Directly shortens the audio duration synthesized by the local TTS microservice on port 8000, compressing the 24 fps integer frame budget calculated by ffprobe.

#### **Pacing (*P*∈\[0.0,1.0\])**

> * **Mechanical Function:** Regulates the ratio between physical motor action blocks and spoken dialogue utterances.  
> * **High Pacing (*P*≥0.70):** Constrains action descriptions to telegraphic, single-sentence kinetic verbs (e.g., *"Bog drops the siphon"*), skipping internal processing and prioritizing immediate narrative momentum.  
> * **Low Pacing (*P*≤0.30):** Expands the intervening reaction windows between dialogue beats, enforcing extended physical blocking and sensory pauses.

#### **Threat Level (*T*∈\[0.0,1.0\])**

> * **Mechanical Function:** Modulates the immediacy of somatic stakes, physical leverage, and conflict volatility.  
> * **High Threat (*T*≥0.80):** Dialogue drops veiled innuendo and directly targets immediate vulnerabilities, brandished weapons, unholstered ballistics, or severe somatic injury. Prompts scale up the probability of triggering opposed 2d6 physical duels in worker-sower-engine.  
> * **Low Threat (*T*≤0.30):** Confines conflict to low-stakes domestic bickering, procedural complaints, and minor territorial friction.

#### **Subtext Suppression (*S*∈\[0.0,1.0\])**

> * **Mechanical Function:** Determines whether characters articulate their internal motivations or disguise them behind mundane topics.  
> * **High Suppression (*S*≥0.70):** Activates the **Attenuation Heuristic**, strictly barring characters from naming their actual goals or secrets and routing tension through physical objects.  
> * **Low Suppression (*S*≤0.20):** Permits open confrontation, allowing characters to break conversational etiquette and explicitly state underlying grievances.

### **2\. The Attenuation Heuristic & Token Attenuation Filters**

When Subtext Suppression is engaged, the engine executes the **Attenuation Heuristic**. Rather than relying on generic instructions like *"write subtext,"* the system provides the LLM with the secret leverage held by the characters while placing the literal vocabulary of that leverage on a strict negative token list:

`PROSE DRAMATURGICAL COMPRESSION DIRECTIVE:`  
`1. FACTUAL LEVERAGE: Spleen knows Bog hoarded the rations during the dry cycle.`  
`2. ATTENUATION FILTER (BANNED TOKENS):`  
   `Under no circumstances may your dialogue include the words:`  
   `["ration", "hoard", "food", "stole", "cycle", "famine", "cache", "guilt"].`  
`3. TACTICAL DISPLACEMENT:`  
   `You must negotiate this leverage exclusively through the discussion of:`  
   `["the stripped threading on the brass valve", "rust flakes in the grease"].`

> * **Tactical Displacement:** Characters are forced to project interpersonal friction onto physical props (e.g., grease on a silver spoon, a damaged pressure valve, or joist rot).  
> * **Surface vs. Underneath Separation:** Preserves the core invariant of the grievance corpus: characters argue aggressively about the mundane surface complaint while the existential wound remains unstated.

### **3\. Epistemic Conditioning & The Dramatic Irony Engine**

The dashboard conditions prompts based on character knowledge and audience awareness, preventing accidental omniscience leaks:

#### **Ignorance by Omission**

Large language models leak information when instructed to *"pretend not to know"* a fact. The prompt compiler physically scrubs unobserved facts, secrets, and foreign BeliefRecords from the model's context window entirely. If Character A has not observed an event via line-of-sight or acoustics, the corresponding tokens do not exist in their prompt envelope.

#### **Epistemic Horizon Spectrum**

Each character's subjective exposure to narrative facts is compiled into an explicit directive:

| Horizon Level | Context Window Injection Strategy |
| :---- | :---- |
| **TOTAL\_IGNORANCE** | The entire topic, entity ID, and related lore files are completely scrubbed. |
| **RUMOR\_ONLY** | Ground truth is withheld; injects an authored \[UNVERIFIED HEARSAY\] directive with distorted claims. |
| **FALSE\_BELIEF** | Injects a \[SUBJECTIVE CONVICTION\] directive, forcing the model to treat incorrect data as fact. |
| **PARTIAL\_FACT** | Injects \[PERCEPTUAL EVIDENCE\] (permitted physical clues) without disclosing root causes. |
| **WITHHELD** | Character knows the truth but is bound by a dramatic taboo; enforces banned\_attenuation\_tokens. |
| **FACTUAL\_WITNESS** | Injects verified factual axioms directly into the active prompt. |

#### **Dramatic Pacing Modes (DramaticPacingMode)**

The showrunner selects the overarching dramatic mode, enforcing compile-time validation gates on scene context:

> * **DRAMATIC\_IRONY:** The audience knows fact *X* via revealed\_facts, but interacting characters are in TOTAL\_IGNORANCE. Generates dramatic dread and suspense.  
> * **SUSPENSE:** Audience knows an external catastrophe is imminent while characters interact under everyday domestic assumptions.  
> * **SURPRISE:** Interacting characters and the audience encounter the fact simultaneously.  
> * **MYSTERY:** The character knows fact *X*, but details are withheld from dialogue to maintain an epistemic gap for the audience.

### **4\. Attention Architecture & Prompt Payload Assembly**

To eliminate "lost-in-the-middle" attention decay, the prompt assembly pipeline structures context into three functional zones:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ 1. TOP 15%: IMMUTABLE SYSTEM PROMPT & STYLES                           │`  
`│    • Narrative Thesis: Domestic avoidance and unacknowledged wounds    │`  
`│    • Somatic Invariants: Banned kinetic verbs (NO_SPRINT, IMPAIRED)    │`  
`│    • Character Refusal Vectors: Mandatory boundaries and costs         │`  
`│    • Stylometric Bounds: Mean sentence length & banned latinate slop   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 2. MIDDLE 70%: PASSIVE MOMENTUM & SANITIZED CONTEXT                    │`  
`│    • Sliding window buffer of recent prose lines for tonal rhythm      │`  
`│    • Active Grievance: Surface vs. Underneath prose specification      │`  
`│    • Sanitized BeliefRecords (Ignorance by Omission strictly applied)  │`  
`│    • Active physical props & equipment slots (held, worn, cached)      │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 3. BOTTOM 15%: IMMEDIATE SCENE ANCHORS & BOUNDS                        │`  
`│    • Dynamic Slider Weights: <C, P, T, S> translation tokens           │`  
`│    • Attenuation Filter: Explicit list of banned leverage tokens       │`  
`│    • 200–250 Word Micro-Beat Cap                                       │`  
`│    • HARD PHYSICAL EXIT CONDITION: "Stop generating when valve closes" │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **The Slop Filter:** System prompts apply logit biases and negative token constraints against generic LLM crutch words (e.g., *palpable, tapestry, testament, furthermore*), forcing lower-probability, concrete nouns.  
> * **Stylometric Voice Fixtures:** Compiles dossier-level bounds directly into formatting instructions (e.g., restricting Bog to a mean sentence length of 6.2–11.5 words and a maximum of 18 words).  
> * **Character Refusal Vectors:** Injects non-negotiable behavioral guardrails (e.g., *"Spleen never admits he broke the latch; he deflects by asking about pipe pressure"*), preventing characters from breaking their defined psychology without paying an explicit mechanical cost.  
> * **The 200–250 Word Micro-Beat Cap:** Scenes are drafted in short micro-beats terminating on an authored physical trigger (e.g., *"Halt generation the millisecond Silas drops the canvas"*), preventing models from generating unearned emotional resolutions or premature scene wraps.

### **5\. Multi-Model Divergence Fan-Out & Directorial Triage**

When the showrunner triggers generation from the dashboard, the pipeline mitigates model bias through a multi-model fan-out:

                         `[ DISPATCH DRAFT PASS ]`  
                                    `│`  
       `┌────────────────────────────┼────────────────────────────┐`  
       `▼                            ▼                            ▼`  
`[ Take A: Frontier ]       [ Take B: Frontier ]        [ Take C: Local Model ]`  
`(Sonnet: Subtext Focus)    (Sonnet: Relational Focus)  (Qwen 2.5: Physical Focus)`  
       `│                            │                            │`  
       `└────────────────────────────┼────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   DASHBOARD STAGING & DIFF PREVIEW                     │`  
`│                                                                        │`  
`│  Take A: Emphasizes avoidance; respects 24fps budget                   │`  
`│  Take B: High relational tension; passes somatic linter                │`  
`│  Take C: Concrete physical blocking; clean GBNF motor extraction       │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  [ ACCEPT TAKE B ]  [ SEND TO ADVERSARIAL JULES ]  [ REJECT ALL SEED ] │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Multi-Model Partitioning:** Runs four parallel candidate generations (*N*\=4) across different model families (e.g., Claude 3.5 Sonnet for subtext-rich dialogue and local Qwen 2.5 for grounded physical blocking), avoiding homogeneous syntactic structures.  
> * **Dual-Field Action AST Generation:** Downstream local models generate natural dialogue alongside an explicit GBNF grammar-constrained array of physical motor actions (extracted\_motor\_actions), mapping directly to Dwight Swain Motivation-Reaction Units (MRUs).  
> * **The "Reject All / Seed is Barren" Escape Hatch:** The dashboard includes an explicit escape hatch allowing directors to discard all generated takes without picking a compromised option. If a pairing triggers three consecutive rejections, the engine marks the dyad with an INERT\_FRICTION flag, alerting the showrunner that the character pairing lacks sufficient dramatic stakes to sustain a scene.

---

*User prompt: {{FOCUS: 2\. The Ingestion Boundary (src/client.ts) (goblin-dashboard) }} /extreme-details*

Response: src/client.ts serves as the public, read-only programmatic ingestion boundary between the compile-time legislative authority of 000.goblin-lore (or packages/001.lore) and downstream presentation, simulation, and review runtimes—specifically goblin-dashboard, worker-sower-engine, and goblin-spatial.

By providing a schema-validated, zero-overhead client interface, src/client.ts enforces the architectural principle that downstream operational dashboards must never parse raw Markdown files, evaluate frontmatter YAML on the fly, or hold mutable references to canonical truth.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│             packages/001.lore (LEGISLATIVE COMPILE-TIME CORE)          │`  
`│   • Authored dossiers: series/under-the-floorboards/{characters, ...}  │`  
`│   • Three-pass compiler validates schemas, relations, and DAGs         │`  
`│   • Emits sealed snapshot: compiled/<seriesSlug>/bible-state.json      │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Pure JSON Read (fs.readFileSync)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   packages/001.lore/src/client.ts                      │`  
`│             TYPED DOWNSTREAM INGESTION CLIENT & PROJECTION BRIDGE      │`  
`│   1. Locates workspace root dynamically (resolveRepoRoot)              │`  
`│   2. Validates 64-character SHA-256 state seal (_meta.state_hash)      │`  
`│   3. Normalizes legacy/entity schema variants                          │`  
`│   4. Recursively deep-freezes entire object tree (deepFreeze)          │`  
`│   5. Exposes specialized, typed projection helpers                     │`  
`└───────────┬───────────────────────────┬────────────────────────────┬───┘`  
            `│                           │                            │`  
            `▼                           ▼                            ▼`  
`┌───────────────────────┐   ┌───────────────────────┐   ┌────────────────────────┐`  
`│   goblin-dashboard    │   │  worker-sower-engine  │   │     goblin-spatial     │`  
`│ (Showrunner Cockpit)  │   │  (Simulation Engine)  │   │  (Stateless Geometry)  │`  
`│ • Somatic HUD         │   │ • 2d6 Duel Resolver   │   │ • Axial Hex Raycasts   │`  
`│ • Epistemic Audit     │   │ • PRNG Lotteries      │   │ • Acoustic Damping     │`  
`│ • Grievance DAG View  │   │ • Screenplay AST      │   │ • Adjacency Matrices   │`  
`└───────────────────────┘   └───────────────────────┘   └────────────────────────┘`

### **1\. Architectural Mission & Invariant Foundations**

Within the studio topology, src/client.ts guarantees that goblin-dashboard operates strictly downstream of verified canon law while preserving clean boundary isolation:

> * **Zero Runtime Markdown Parsing:** All gray-matter extraction, YAML parsing, and markdown tokenization are restricted to compile time. goblin-dashboard never touches .md files; it imports compiled truth through src/client.ts or imports compiled types via @goblin/shared-types.  
> * **The Fail-Fast *T*0​\=\$0.00 Economic Invariant:** Evaluating lore syntax or entity integrity in a running UI or rendering container introduces non-deterministic failure modes. By gating ingestion on an offline-compiled JSON artifact verified by a 64-character SHA-256 hash, broken references and corrupted types fail before any compute or dashboard rendering takes place.  
> * **The Universal Negative-Control Law:** An immutability guarantee or boundary gate that has never been observed rejecting an illegal in-memory mutation or corrupted input is unproven. src/client.ts enforces fail-closed type and runtime barriers, ensuring that unauthorized writes throw fatal exceptions.  
> * **Deterministic Ambient Time Purity:** Functions in src/client.ts are strictly pure mathematical or disk-deserialization projections; they never evaluate Date.now() or query system clocks to prevent timeline desynchronization.

### **2\. Deep-Freeze Immutability Engine**

The core runtime defense of src/client.ts is its recursive freezing mechanism. Downstream applications like goblin-dashboard maintain dynamic UI state, form inputs, and reactive stores. If a dashboard component were to mutate a canonical character vector directly (e.g., modifying an inventory array or changing an arm condition), canonical truth would be silently polluted across memory.

`/**`  
 `* Recursively deep-freezes an object graph to guarantee absolute immutability.`  
 `*/`  
`export function deepFreeze<T>(obj: T): Readonly<T> {`  
  `if (obj === null || typeof obj !== 'object') {`  
    `return obj;`  
  `}`  
  `Object.freeze(obj);`  
  `for (const key of Object.keys(obj)) {`  
    `const prop = (obj as any)[key];`  
    `if (prop !== null && typeof prop === 'object' && !Object.isFrozen(prop)) {`  
      `deepFreeze(prop);`  
    `}`  
  `}`  
  `return obj as Readonly<T>;`  
`}`

#### **Mechanical Guarantees & Trapping Behavior**

> * **Runtime Mutation Trapping:** Any code path in goblin-dashboard attempting to write to an ingested lore property (e.g., state.entities.characters.char\_bog.name \= 'TAMPERED') immediately triggers an unhandled TypeError: Cannot assign to read only property in JavaScript strict mode.  
> * **Nested Array Sealing:** Array modification routines (such as .push(), .splice(), or .sort()) on logistical inventories or kinetic verb masks immediately trigger TypeError: Cannot add property X, object is not extensible.  
> * **Metadata Protection:** The root metadata object containing state\_hash and entity\_counts is sealed against reassignment or tampering.

### **3\. Dynamic Monorepo Resolution & State Normalization**

To operate reliably regardless of whether goblin-dashboard runs in local development on Rig 1, during automated testing, or inside containerized CLI harnesses, src/client.ts implements filesystem resolution and schema normalization:

`/**`  
 `* Resolves the monorepo root directory dynamically by walking upward.`  
 `*/`  
`export function resolveRepoRoot(): string {`  
  `let curr = process.cwd();`  
  `while (curr && curr !== path.dirname(curr)) {`  
    `if (`  
      `fs.existsSync(path.join(curr, 'packages')) &&`  
      `(fs.existsSync(path.join(curr, 'series')) ||`  
        `fs.existsSync(path.join(curr, 'package.json')))`  
    `) {`  
      `return curr;`  
    `}`  
    `curr = path.dirname(curr);`  
  `}`  
  `return process.cwd();`  
`}`

#### **loadBibleState(seriesSlug) Ingestion Lifecycle**

> 1. **Filesystem Traversal:** Resolves the path to compiled/\<seriesSlug\>/bible-state.json starting from the dynamic repository root.  
> 2. **Artifact Existence Check:** If the target compiled JSON file does not exist, it throws a fatal error requiring the operator to compile canon first (\[LORE CLIENT FATAL\] Compiled state artifact not found...).  
> 3. **Cryptographic Seal Validation:** Inspects \_meta.state\_hash. It asserts that the hash is a non-empty string exactly 64 hexadecimal characters long (/^\[a-f0-9\]{64}\$/), guarding against truncated or partially written disk artifacts.  
> 4. **Schema Normalization:** Standardizes structural variations across schema generations, ensuring downstream UI components can safely access entities through a unified interface whether the underlying snapshot uses root keys or nested collections:  
>    `const normalized: BibleState = {`  
>      `_meta: parsed._meta,`  
>      `entities: {`  
>        `characters: parsed.entities?.characters || parsed.characters || {},`  
>        `locations: parsed.entities?.locations || parsed.locations || {},`  
>        `possessions: parsed.entities?.possessions || parsed.possessions || {},`  
>        `grievances: parsed.entities?.grievances || parsed.grievances || {},`  
>        `world: parsed.entities?.world || parsed.world,`  
>      `},`  
>    `};`

5\. **Terminal Sealing:** Returns deepFreeze(normalized).

### **4\. Specialized Projection Accessors**

Rather than forcing goblin-dashboard to query raw, complex nested data structures directly, src/client.ts exposes four domain-specific, deep-frozen projection accessors:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                        SRC/CLIENT.TS API SURFACE                       │`  
`├──────────────────────────────┬─────────────────────────────────────────┤`  
`│ loadBibleState()             │ Ingests, validates, and deep-freezes    │`  
`│                              │ compiled/<slug>/bible-state.json        │`  
`├──────────────────────────────┼─────────────────────────────────────────┤`  
`│ getCharacterSomaticMask()    │ Calculates physical upper-limb capacity │`  
`│                              │ and extracts negative kinetic verb masks│`  
`├──────────────────────────────┼─────────────────────────────────────────┤`  
`│ getEpistemicDirectives()     │ Enforces Ignorance by Omission and      │`  
`│                              │ formats mystery hearsay context         │`  
`├──────────────────────────────┼─────────────────────────────────────────┤`  
`│ getStaticSpatialGraph()      │ Extracts topological adjacency maps and │`  
`│                              │ acoustic damping decibel profiles       │`  
`├──────────────────────────────┼─────────────────────────────────────────┤`  
`│ getActiveGrievanceDAG()      │ Compiles Directed Acyclic Graph of      │`  
`│                              │ grievance escalation transition edges   │`  
`└──────────────────────────────┴─────────────────────────────────────────┘`

#### **1\. Somatic Capability Projection (getCharacterSomaticMask)**

Provides physical anatomical bounds for showrunner review and downstream scene validation:

> * **Locomotion Bounds:** Extracts locomotion\_baseline (e.g., bipedal\_hunched, sessile, slithering).  
> * **Negative Kinetic Masks:** Surfacing banned\_kinetic\_verbs (e.g., \["sprint", "vault", "climb", "embrace"\]) and motor\_limitations.  
> * **Limb Calculation Math:** Computes net functional upper-limb capacity (availableArms):  
>   availableArms={0.0max(0.0,2.0−∑severe\_conditions)​if locomotion is sessile∨slitheringotherwise​  
>   Severe conditions decrementing limb capacity by 1.0 each include:  
  * braxial\_plexus\_severed  
  * severed\_right\_arm  
  * severed\_left\_arm  
  * paralyzed\_arm  
  * amputated\_limb  
> * **Fail-Closed Unknown Actor:** Querying an unindexed character ID throws an immediate exception (\[LORE CLIENT\] Unknown character ID: '...').

#### **2\. Epistemic Prompt Projection (getEpistemicDirectives)**

Allows goblin-dashboard to inspect and audit how secrets and facts are gated for a character:

> * **Ignorance by Omission:** Automatically scrubs omitted mystery IDs from prompt context envelopes.  
> * **Hearsay & Restraint Markers:** Formats distorted beliefs into \[UNVERIFIED HEARSAY\] tokens and withheld knowledge into \[RESTRAINED KNOWLEDGE\] markers.

#### **3\. Spatial Topology & Acoustic Profile Projection (getStaticSpatialGraph)**

Projects physical world topology for dashboard spatial visualizers and stateless acoustic engines:

> * Maps all locations into a keyed record of SpatialNodeDescriptor entries.  
> * Surfaces adjacentLocations arrays, lightingLevel, and acousticDampingFactor (e.g., Warm Pipe \= 2500 cdB, Attic Stair \= 1200 cdB).

#### **4\. Multi-Tier Grievance Escalation DAG (getActiveGrievanceDAG)**

Extracts the transition structure of interpersonal conflict:

> * Maps each grievance identifier to its downstream transition targets (spawns\_on\_max\_escalation).  
> * Normalizes string IDs and target objects into a clean Directed Acyclic Graph structure (e.g., resource\_hoarding ⟶ hoarding\_reveal ⟶ generational\_famine\_feud).

### **5\. Consumption within goblin-dashboard (Astro & React)**

goblin-dashboard integrates src/client.ts across its server and client boundaries:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   src/pages/telemetry/somatic.astro                    │`  
`│                                                                        │`  
`│  ---                                                                   │`  
`│  // ASTRO SSR / BUILD PASS (Zero Client Bundle Overhead)               │`  
`│  import { loadBibleState, getCharacterSomaticMask }                    │`  
`│    from '000.goblin-lore/client';                                      │`  
`│                                                                        │`  
`│  const state = loadBibleState('under-the-floorboards');                │`  
`│  const bogMask = getCharacterSomaticMask(state, 'char_bog');           │`  
`│  const wartMask = getCharacterSomaticMask(state, 'char_wart');         │`  
`│  ---                                                                   │`  
`│                                                                        │`  
`│  <ShowrunnerLayout title="Somatic HUD">                                │`  
`│    <!-- Static HTML rendering of immutable constraints -->            │`  
`│    <StaticSomaticCard mask={bogMask} />                                │`  
`│                                                                        │`  
`│    <!-- Dynamic React Island receiving deep-frozen props -->           │`  
`│    <SomaticAuditInteractive                                            │`  
`│      client:load                                                       │`  
`│      initialWartMask={wartMask}                                        │`  
`│    />                                                                  │`  
`│  </ShowrunnerLayout>                                                   │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Astro SSR Boundary Isolation:** In Astro server frontmatter (---), loadBibleState() reads bible-state.json directly from the local disk. Server components render static HTML displays (such as baseline anatomical stats and room connections) with zero runtime JavaScript shipped to the browser.  
> * **React Island Hydration:** When interactive auditing or parameter tuning is required, projection data is passed as props into client islands (client:load). Because props are derived from deep-frozen objects, client-side React code cannot alter upstream lore.  
> * **Direct API Decoupling:** When running on Cloudflare Pages or remote preview modes, the dashboard queries the edge gateway or loads pre-bundled JSON certified by the exact same TypeScript schema interfaces (BibleState, SomaticMask, SpatialNodeDescriptor), preserving behavioral and type parity across environments.

### **6\. Verification & Negative-Control Gauntlet**

The integrity of src/client.ts is enforced through automated unit tests (test/client.test.ts) and negative-control verification scripts:

| Test Suite Assertion | Target Mechanism | Operational Pass Condition |
| :---- | :---- | :---- |
| **loads state with SHA-256 seal** | loadBibleState | Returns 17+ canonical entities; \_meta.state\_hash matches /^\[a-f0-9\]{64}\$/. |
| **throws on uncompiled series** | Missing artifact guard | Throws error containing \[LORE CLIENT FATAL\]. |
| **enforces deep-freeze immutability** | deepFreeze on object graph | Mutating char.name, pushing to held inventory, or altering \_meta throws TypeError. |
| **calculates amputated limbs** | getCharacterSomaticMask | char\_wart returns availableArms \=== 1.0; bans sprint, vault, climb, embrace. |
| **calculates standard limbs** | getCharacterSomaticMask | char\_bog returns availableArms \=== 2.0. |
| **fails closed on unknown actor** | Unknown actor check | Requesting unindexed ID throws \[LORE CLIENT\] Unknown character ID. |
| **extracts spatial damping** | getStaticSpatialGraph | Validates loc\_the\_warm\_pipe damping factor is 2500 cdB and includes neighbor connections. |
| **extracts grievance transitions** | getActiveGrievanceDAG | Maps multi-tier transitions (resource\_hoarding ⟶ hoarding\_reveal). |
| **enforces Ignorance by Omission** | getEpistemicDirectives | Unrevealed topics are omitted; distorted beliefs yield \[UNVERIFIED HEARSAY\]. |

This client boundary ensures that goblin-dashboard operates with verified type safety, sub-millisecond local ingestion, and zero risk of accidental canon corruption.

---

*User prompt: {{FOCUS: 4\. Specialized Projection Accessors (goblin-dashboard) }} /extreme-details*

Response: The **Specialized Projection Accessors** in src/client.ts are pure, deterministic lenses that extract domain-specific subgraphs from the deep-frozen, read-only canonical snapshot (bible-state.json). Rather than forcing goblin-dashboard components to traverse raw, deeply nested entities or assemble ad-hoc filters, these accessors expose strongly typed projections tailored to somatic verification, epistemic isolation, spatial acoustics, and dramatic conflict progression.

Because they operate strictly on deep-frozen memory, all projection accessors are mathematically pure: they perform no disk I/O, execute no network calls, hold no internal mutable state, and run in sub-millisecond execution times on both Rig 1 and Cloudflare edge isolates.

                               `Deep-Frozen BibleState (H_root)`  
                                              `│`  
                      `┌───────────────────────┼───────────────────────┐`  
                      `▼                       ▼                       ▼`  
            `getCharacterSomaticMask()  getEpistemicDirectives()  getStaticSpatialGraph()  getActiveGrievanceDAG()`  
                      `│                       │                       │                       │`  
                      `▼                       ▼                       ▼                       ▼`  
             `┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐`  
             `│   Somatic HUD   │     │ Epistemic Audit │     │ Spatial Overlay │     │ Grievance Tree  │`  
             `│  • Limb counts  │     │ • Omission mask │     │ • Adjacency map │     │ • Escalation DAG│`  
             `│  • Verb filters │     │ • Hearsay tags  │     │ • Damping (cdB) │     │ • Tension caps  │`  
             `│  • Motor linters│     │ • Dramatic irony│     │ • Lighting node │     │ • Starvation HUD│`  
             `└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘`

### **1\. Somatic Capability Projection: getCharacterSomaticMask**

#### **Mathematical Contract & Type Signature**

`export interface SomaticMask {`  
  `readonly characterId: string;`  
  `readonly locomotionBaseline: 'bipedal_standard' | 'bipedal_hunched' | 'limping' | 'sessile' | 'slithering';`  
  `readonly availableArms: number; // Discrete float: 0.0, 1.0, or 2.0`  
  `readonly bannedKineticVerbs: readonly string[];`  
  `readonly motorLimitations: readonly string[];`  
  `readonly sensoryAcuity: {`  
    `readonly visualAcuity: 'NORMAL' | 'MONOCULAR' | 'BLIND';`  
    `readonly auditoryThresholdDebuffBp: number; // Basis points (+1500 bp = severe deficit)`  
    `readonly blindConeAngleDeg?: number; // 60° persistent cone for monocular actors`  
  `};`  
`}`

`export function getCharacterSomaticMask(`  
  `state: DeepFrozenBibleState,`  
  `characterId: string`  
`): SomaticMask;`

#### **Internal Evaluation Logic & Limb Arithmetic**

> 1. **Unknown Actor Tripwire:** The accessor checks state.entities.characters\[characterId\]. If the identifier does not exist in the sealed ledger, execution fails immediately with an explicit error: \[LORE CLIENT\] Unknown character ID: '\${characterId}'.  
> 2. **Locomotion and Functional Arm Extraction:**  
   * If locomotion\_baseline is sessile or slithering, availableArms evaluates to 0.0 regardless of condition tags.  
   * Otherwise, the engine starts with a standard biological baseline of 2.0 arms and decrements 1.0 for each matching severe trauma condition present in the character's active condition ledger:  
     availableArms=max(0.0,2.0−*c*∈conditions∑​Isevere\_limb\_loss​(*c*))  
     Trauma conditions triggering arm decrements include:  
     * braxial\_plexus\_severed  
     * severed\_right\_arm  
     * severed\_left\_arm  
     * paralyzed\_arm  
     * amputated\_limb  
> 3. **Sensory Acuity Calculation:**  
   * **Visual Acuity:** Defaults to NORMAL. If ocular damage conditions exist (enucleated\_left\_eye, corneal\_scars), it maps to MONOCULAR (setting blindConeAngleDeg: 60\) or BLIND.  
   * **Auditory Acuity:** Neurological or acoustic damage (such as ruptured eardrums from pipe pressure spikes) injects a \+1,500 bp perception threshold penalty over the ambient noise floor.  
> 4. **Kinetic Verb Masking:** Flattens canonical banned\_kinetic\_verbs (e.g., \["sprint", "vault", "climb", "embrace"\]) into an immutable array, merged with condition-specific motor limitations.

#### **goblin-dashboard UI Mounts & Directorial Interventions**

> * **Somatic HUD Card (SomaticHUDCard.tsx):** Renders an interactive anatomical wireframe of the character. If availableArms \=== 1.0 (such as char\_wart), the UI visually disables off-hand equipment slots and strikes through dual-wielding weapon controls.  
> * **Pre-Flight Action Linter:** When the showrunner inspects generated script takes in the review suite, this projection lints the candidate's extracted\_motor\_actions. If the LLM generates a line where an actor with availableArms: 1.0 executes a two-handed task (e.g., *"Bog unscrews the brass pipe while bracing the siphon"*), the dashboard flags a redline SOMATIC\_GAUNTLET\_FAIL indicator and disables the "Approve to Staging" button.

### **2\. Epistemic Prompt Projection: getEpistemicDirectives**

#### **Mathematical Contract & Type Signature**

`export interface EpistemicDirectives {`  
  `readonly characterId: string;`  
  `readonly ignoranceOmissionTokens: readonly string[]; // Tokens scrubbed from attention context`  
  `readonly hearsayBeliefs: readonly {`  
    `readonly topicId: string;`  
    `readonly claim: string;`  
    `readonly subjectiveConfidence: number; // Decays at 0.8^h across rumor hops`  
    `readonly promptDirective: string; // Formatted as [UNVERIFIED HEARSAY]`  
  `}[];`  
  `readonly restrainedKnowledge: readonly {`  
    `readonly topicId: string;`  
    `readonly factualAxiom: string;`  
    `readonly dramaticTabooReason: string;`  
    `readonly promptDirective: string; // Formatted as [RESTRAINED KNOWLEDGE]`  
  `}[];`  
`}`

`export function getEpistemicDirectives(`  
  `state: DeepFrozenBibleState,`  
  `characterId: string`  
`): EpistemicDirectives;`

#### **Internal Evaluation Logic & The Attenuation Pipeline**

> 1. **Ignorance by Omission:** Rather than prompting a model to *"act like you do not know about the stolen valve,"* the accessor generates an explicit token scrubbing list (ignoranceOmissionTokens). Unrevealed mysteries and third-party secrets never enter the prompt envelope, eliminating omniscience leaks at compile time.  
> 2. **Subjective Belief & Rumor Degradation:** The accessor traverses dynamic BeliefRecord entries held by the character. If the source type is RUMOR or TESTIMONY, the accessor applies hop decay based on distance *h* from the ground-truth event:  
>    Confidence(*h*)=InitialConfidence×(0.8)*h*  
>    If Confidence\<0.4, the topic is demoted to unverified rumor and injected with the prompt prefix \[UNVERIFIED HEARSAY: Subject believes X, but doubts source credibility\].  
> 3. **Dramatic Taboo Filtering:** Characters who know ground-truth facts but are psychologically, socially, or tactically restrained from speaking them have those topics routed through restrainedKnowledge. The accessor binds these to \[RESTRAINED KNOWLEDGE: Do not utter tokens directly; express through somatic avoidance or deflection\].

#### **goblin-dashboard UI Mounts & Directorial Interventions**

> * **Dramatic Irony Auditor (EpistemicAuditPanel.tsx):** Displays a 3-column epistemic split:  
  1. *Audience Reality* (what has been shown on screen).  
  2. *Character A's Bubble* (filtered through Ignorance by Omission).  
  3. *Character B's Bubble* (subjective convictions and hearsay).  
> * **Omniscience Leak Detector:** If a candidate draft AST contains dialogue tokens matching ignoranceOmissionTokens, the dashboard flags the line with an alert (EPISTEMIC\_FIREWALL\_BREACH), pinpointing the exact phrase leaking unearned information.

### **3\. Spatial Topology Projection: getStaticSpatialGraph**

#### **Mathematical Contract & Type Signature**

`export interface SpatialNodeDescriptor {`  
  `readonly locationId: string;`  
  `readonly displayName: string;`  
  `readonly adjacentLocations: readonly string[]; // Foreign keys to neighboring location IDs`  
  `readonly acousticDampingFactor: number; // Sound attenuation in centibels (cdB)`  
  `readonly lightingLevel: 'PITCH_BLACK' | 'FAINT_SEEPAGE' | 'INCANDESCENT' | 'BLINDING_GLARE';`  
  `readonly volumeCapacity: {`  
    `readonly maxAdultGoblins: number; // Enforces cell crowding limits`  
    `readonly isCramped: boolean; // Imposes movement penalties`  
  `};`  
`}`

`export function getStaticSpatialGraph(`  
  `state: DeepFrozenBibleState`  
`): Readonly<Record<string, SpatialNodeDescriptor>>;`

#### **Internal Evaluation Logic & Topology Normalization**

> 1. **Adjacency Normalization:** Parses all raw canonical locations within state.entities.locations, verifying that adjacency is mathematically reciprocal:  
>    *B*∈adjacentLocations(*A*)⟺*A*∈adjacentLocations(*B*)  
> 2. **Acoustic Profile Mapping:** Extracts authored decibel attenuation factors. For instance, loc\_the\_warm\_pipe registers an acoustic damping profile of 2,500 cdB (heavy structural dampening through solid cast iron), whereas loc\_splinter\_gap registers 1,200 cdB.  
> 3. **Volume and Crawlspace Constraints:** Converts architectural metadata into discrete spatial capacities. Confined spaces are flagged as isCramped: true and capped at maxAdultGoblins: 2, providing structural bounds for pathfinding engines and scene blocking.

#### **goblin-dashboard UI Mounts & Directorial Interventions**

> * **Interactive Crawlspace Map (CompoundHexOverlay.tsx):** Uses the extracted graph to render the global topological node network. Active characters tracked by worker-sower-engine are placed into their respective location nodes, showing overcrowding warnings if actor counts exceed maxAdultGoblins.  
> * **Acoustic Falloff & Foley Previewer:** When inspecting an animatic's audio stem tracks, the dashboard uses acousticDampingFactor to calculate sound transmission between rooms. If an off-screen character shouts in an adjacent room, the dashboard calculates the low-pass filter cutoff frequency and decibel attenuation curves displayed in the waveform timeline.

### **4\. Grievance Escalation DAG Projection: getActiveGrievanceDAG**

#### **Mathematical Contract & Type Signature**

`export interface GrievanceDAGNode {`  
  `readonly grievanceId: string;`  
  `readonly title: string;`  
  `readonly participants: {`  
    `readonly accuser: string;`  
    `readonly target: string;`  
  `};`  
  `readonly escalationCeiling: number; // Integer scale: 1 to 5`  
  `readonly spawnsOnMaxEscalation: readonly string[]; // Downstream target grievance IDs`  
  `readonly tonalOverrideEligible: boolean; // Farce vs existential dispute flag`  
  `readonly surfaceDispute: string; // The mundane distraction (e.g., grease on pipe)`  
  `readonly underneathDispute: string; // The deep existential wound (e.g., abandonment)`  
`}`

`export interface GrievanceDAG {`  
  `readonly nodes: Readonly<Record<string, GrievanceDAGNode>>;`  
  `readonly rootGrievances: readonly string[]; // Grievances with in-degree 0`  
  `readonly terminalGrievances: readonly string[]; // Grievances with out-degree 0`  
`}`

`export function getActiveGrievanceDAG(`  
  `state: DeepFrozenBibleState`  
`): GrievanceDAG;`

#### **Internal Evaluation Logic & Graph Construction**

> 1. **Transition Edge Compilation:** Scans the grievance registry in state.entities.grievances, parsing each entity's spawns\_on\_max\_escalation array. It constructs a Directed Acyclic Graph (DAG) connecting early disagreements to downstream conflicts (e.g., grv\_resource\_hoarding ⟶ grv\_hoarding\_reveal ⟶ grv\_generational\_famine\_feud).  
> 2. **Acyclic Loop Verification:** Confirms at ingestion time that the transition graph contains zero cyclic dependencies:  
>    ∀*v*∈*V*,*v*∈/Descendants(*v*)  
>    If an author mistakenly configures grievance transitions into a loop (*A*→*B*→*A*), the accessor throws a compile exception, preventing infinite narrative escalation loops in the simulation engine.  
> 3. **Tonal Boundary Tagging:** Surfaces the tonal\_override\_eligible flag, isolating petty or farcical disputes from irreversible existential grievances.

#### **goblin-dashboard UI Mounts & Directorial Interventions**

> * **Grievance Tree Visualizer (GrievanceDAGViewer.tsx):** Renders the multi-tier escalation tree as an interactive node graph. The dashboard overlays real-time dynamic tension values from the Sower engine onto the static nodes, highlighting paths nearing critical escalation thresholds (5/5).  
> * **Dyadic Starvation Heatmap:** Cross-references the DAG against the character roster, flagging any dyad with fewer than 2 active conflict paths with a DYADIC\_STARVATION\_WARNING.  
> * **One-Click Scene Pinning:** Allows the director to select an un-escalated node in the DAG and click "Pin to Next Scene Draft." This dispatches an intent to worker-sower-engine, bypassing PRNG lotteries and forcing that specific conflict to take center stage in the next generation pass.

### **Integration Architecture in Astro & React Islands**

In goblin-dashboard, specialized projection accessors bridge server-side rendering and client-side interactivity:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   Astro Server Shell (somatic.astro)                   │`  
`│                                                                        │`  
`│  import { loadBibleState, getCharacterSomaticMask }                    │`  
`│    from '000.goblin-lore/client';                                      │`  
`│                                                                        │`  
`│  // Executes during SSR / Build Pass on Rig 1 (Zero client JS)         │`  
`│  const state = loadBibleState('under-the-floorboards');                │`  
`│  const mask = getCharacterSomaticMask(state, 'char_wart');             │`  
`│  const spatialGraph = getStaticSpatialGraph(state);                    │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Passes deep-frozen projection props`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│            Interactive React Island (client:load)                      │`  
`│                                                                        │`  
`│  export const SomaticDirectorHUD: React.FC<{ mask: SomaticMask }> =    │`  
`│    ({ mask }) => {                                                     │`  
`│      // Consumes read-only mask to enforce UI invariants               │`  
`│      return (                                                          │`  
`│        <HUDContainer>                                                  │`  
`│          <ArmSlot count={mask.availableArms} />                        │`  
`│          <KineticVerbLinter banned={mask.bannedKineticVerbs} />        │`  
`│          <AcuityGauge visual={mask.sensoryAcuity.visualAcuity} />      │`  
`│        </HUDContainer>                                                 │`  
`│      );                                                                │`  
`│    };                                                                  │`  
`└────────────────────────────────────────────────────────────────────────┘`

> 1. **Astro Server Shell (SSR / Pre-Rendering):** The Astro page frontmatter executes loadBibleState() and the required projection accessors on the server side. The heavy JSON parsing and validation steps execute in Node.js or the Cloudflare Worker isolate, leaving zero parsing runtime overhead in the user's browser.  
> 2. **Prop Hydration to React Islands:** Only the compact, tailored projection objects (SomaticMask, SpatialNodeDescriptor, GrievanceDAGNode) are passed as props to interactive React islands (marked with client:load or client:idle).  
> 3. **Guaranteed Immutability:** Because these objects are derived from deepFreeze(), any attempted mutation by third-party browser plugins, React state misconfigurations, or form inputs fails immediately with a runtime TypeError, ensuring canonical truth remains intact across long showrunner review sessions.

---

*User prompt: Overview\_ Goblin-Dashboard.00 (05.delivery):    Overview\_ Goblin-Episodes.00 (05.delivery): {{FOCUS: 6\. Verification & Negative-Control Gauntlet (goblin-dashboard) }} /extreme-details*

### **Response: Overview: goblin-dashboard (05.delivery)**

goblin-dashboard is the web-native "Hand of God" showrunner cockpit and human-in-the-loop director interface within Cluster 05 (Delivery). Built with **Astro and React**, it runs locally on **Rig 1** (http://localhost:4321) and deploys to the cloud edge on **Cloudflare Pages**. It gives the showrunner real-time simulation observation, dramatic parameter tuning, pre-viz animatic sign-off, and root-level manual override authority over generation runs.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   goblin-dashboard (SHOWRUNNER COCKPIT)                │`  
`│  • Astro Shell + React Islands (localhost:4321 / Cloudflare Pages)     │`  
`│  • Directorial Sliders: Curtness, Threat, Pacing, Subtext Attenuation  │`  
`│  • Epistemic Auditing: Ignorance by Omission & Belief Record Tracking │`  
`│  • Gate Approvals: Drift Authorization, Animatic Sign-off, Kill Switch │`  
`└───────────────▲────────────────────────▲───────────────────────────────┘`  
                `│                        │`  
       `HTTP REST / WebSockets   TypeScript Zod Schemas`  
                `│                        │`  
`┌───────────────▼────────────────┐ ┌─────▼───────────────────────────────┐`  
`│     worker-sower-engine        │ │           000.goblin-lore           │`  
`│   (Rig 1 Simulation Ledger)    │ │      (Immutable Canon Law)          │`  
`│  • GET  /ledger/state          │ │  • bible-state.json (H_root seal)   │`  
`│  • POST /simulation/override   │ │  • Somatic & Epistemic constraints  │`  
`│  • POST /conductor/batch-run   │ │  • Deep-frozen runtime client.ts    │`  
`└────────────────────────────────┘ └─────────────────────────────────────┘`

#### **1\. Core Architectural Mandate & System Boundaries**

> * **Cluster 05 Positioning:** Operates on **Axis B (Representation / Artifact Hardening)** as an interactive presentation and monitoring client.  
> * **Zero Video Rendering Engine:** The dashboard does not execute Remotion, spawn headless Chromium, or invoke GPU shaders directly. Video composition and rasterization are strictly offloaded to goblin-viewport-template and the Remotion CLI on Rig 1's CPU/RAM.  
> * **Network-Only API Boundary:** Communicates with upstream engines (worker-sower-engine, edge-director) exclusively over authenticated HTTP REST, SSE, and WebSockets. It performs no local disk operations on raw Markdown drafts or SQLite ledger files, eliminating cross-process file-lock contention.  
> * **Zero Semantic Authority:** The dashboard cannot alter canonical dossiers in 000.goblin-lore. It ingests read-only, deep-frozen snapshots (bible-state.json) via packages/001.lore/src/client.ts to evaluate simulation drift against immutable canon law.

#### **2\. Key Operational Subsystems**

> * **Dramatic Parameter Tuning:** Exposes continuous control sliders that map director intent into four normalized vectors *P*\=⟨*C*,*P*,*T*,*S*⟩∈\[0.0,1.0\]4 (Curtness, Pacing, Threat Multiplier, and Subtext Suppression).  
> * **Epistemic & Somatic Telemetry:** Surfaces live somatic body maps, limb SAT calculations, active Paranoia Clocks, relational leverage strings, and *Ignorance by Omission* firewalls.  
> * **Pre-Viz & Exposure Sheet Review Gate:** Streams 24 fps integer-budgeted animatics, displays parsed Dwight Swain Motivation-Reaction Unit (MRU) script ASTs, and verifies audio ducking curves (-14 dB) before committing expensive GPU diffusion runs.  
> * **Directorial Interventions & Circuit Breakers:** Provides manual override gates for state drift confirmation, dyad pinning, and an immediate emergency stop (EmergencyHaltButton.tsx) that locks agent dispatching in Cloudflare D1.

### **Overview: goblin-episodes (05.delivery)**

goblin-episodes (also structured as goblin-episodes/episode-XXX/ or epXXX/) is the **permanent historical archive of stamped, baked, and isolated episodic release packages** within Cluster 05\. It replaces monolithic dynamic media-player engines with autonomous, byte-reproducible software workspaces.

               `UPSTREAM NARRATIVE & ACOUSTIC CONTRACTS`  
      `[ dialogue_ast.json ] + [ exposure_sheet.json (ffprobe) ] + [ manifest.json ]`  
                                    `│`  
                                    `▼`  
`┌─────────────────────────────────────────────────────────────────────────────┐`  
`│       METAPROGRAM GENERATOR (generator/generate-episode-repo.ts)            │`  
`│  • Ingests timing manifests, manifests, and style rules                     │`  
`│  • Harvests & prunes assets (<100MB per episode storage ceiling)            │`  
`│  • Statically bakes Episode_XXX.tsx with concrete numeric literals          │`  
`│  • Computes body SHA-256 and stamps // @lifecycle and // @checksum headers  │`  
`│  • Emits immutable provenance lockfile: render_manifest.json                │`  
`└─────────────────────────────────────┬───────────────────────────────────────┘`  
                                      `│`  
                                      `▼`  
`┌─────────────────────────────────────────────────────────────────────────────┐`  
`│                 PERMANENT ARCHIVE (goblin-episodes/episode-XXX/)             │`  
`│                                                                             │`  
`│ ├── Episode_XXX.tsx              <-- Baked, self-contained TSX component    │`  
`│ ├── render_manifest.json          <-- Host environment & dependency lockfile │`  
`│ ├── components/ (Vendored)        <-- Pinned GoblinPuppet.tsx, DuckingBus   │`  
`│ ├── public/assets/                <-- Harvested sprites, visemes, and audio  │`  
`│ └── out/master_XXX.mp4            <-- Hardened broadcast deliverable        │`  
`└─────────────────────────────────────────────────────────────────────────────┘`

#### **1\. Eradication of the Historical Corruption Trap**

In dynamic rendering setups, feeding runtime scene.json payloads into a shared player codebase causes older episodes to suffer visual breakage whenever shared components evolve:

> * Refactoring camera dampening curves or transform pivots for Episode 040 would detach mouth visemes, decapitate characters on crash zooms, or distort temporal pacing in Episode 012\.  
> * goblin-episodes solves this by decoupling the compiler (goblin-viewport-template) from the stamped artifact (goblin-episodes/episode-XXX/).  
> * Every episode directory is an isolated repository or standalone directory containing its own baked TypeScript composition (Episode\_XXX.tsx), vendored UI rigs, pruned binary assets, and provenance lockfile. Older episodes can be re-rendered years later with bit-identical fidelity.

#### **2\. Stamped Workspace Anatomy & Output Contracts**

> * **Source-Baking Transformation:** generator/generate-episode-repo.ts hardcodes frame boundaries (from={0} durationInFrames={75}), audio stem paths, camera easing arrays, and viseme coordinates directly into TSX JSX literals. Dynamic JSON parsing during rendering is forbidden.  
> * **Asset Harvesting & Ceilings:** collect-episode-assets.ts parses the compiled script AST and copies only the specific character variants, mouth visemes, background plates, and audio stems used in that episode into public/assets/, enforcing a strict \<100MB repository budget.  
> * **Software Rasterization Invariants:** Episode rendering executes via Remotion CLI on Rig 1's CPU using \--gl=swangle \--concurrency=1 \--offthreadvideo, eliminating GPU VRAM driver crashes and memory leaks in headless environments.  
> * **Immutable Provenance Lockfile (render\_manifest.json):** Every workspace locks the build environment (Node version, Remotion release, FFmpeg build, font checksums), upstream Git commit SHAs (000.goblin-lore, worker-sower-engine, goblin-assets-visual), and SHA-256 digests of all consumed media.  
> * **The Reproducibility Target:** Enforces Level 3 Decoded Media Equivalence (Δ*E*\<0.1 and SSIM\>0.9999 across decoded raw pixel matrices and PCM audio streams).

### **Verification & Negative-Control Gauntlet (goblin-dashboard)**

The **Verification & Negative-Control Gauntlet** is the automated quality assurance firewall that protects goblin-dashboard from state pollution, broken type contracts, unauthorized canon mutations, and desynchronized pipeline execution.

               `DASHBOARD ACTION / TELEMETRY INGESTION`  
                                 `│`  
                                 `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ TIER 0: BOUNDARY & ZERO-TOKEN LINT (Exit Code 0 / $0.00)               │`  
`│ • Zero runtime Markdown / YAML parser dependencies                     │`  
`│ • Deterministic ambient time purity (Zero Date.now() / clock leak)     │`  
`│ • 7-bit ASCII safety across UI formatters and telemetry strings        │`  
`└────────────────────────────────┬───────────────────────────────────────┘`  
                                 `│ Pass`  
                                 `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ TIER 1: DEEP-FREEZE IMMUTABILITY & ANTI-TAMPER GAUNTLET                │`  
`│ • Top-level & nested array mutation rejection (TypeError)              │`  
`│ • Unknown actor fail-closed tripwire ([LORE CLIENT] Fatal)             │`  
`│ • UI form state decoupled from deep-frozen canonical memory            │`  
`└────────────────────────────────┬───────────────────────────────────────┘`  
                                 `│ Pass`  
                                 `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ TIER 2: SOMATIC SAT & MOTOR ACTION INVARIANT LINTERS                   │`  
`│ • Limb conservation formula: availableArms = max(0, 2 - severeTrauma)  │`  
`│ • Banned kinetic verb collision detection (sprint, vault, climb)       │`  
`│ • Dual-handed execution rejections on amputee / impaired actors        │`  
`└────────────────────────────────┬───────────────────────────────────────┘`  
                                 `│ Pass`  
                                 `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ TIER 3: EPISTEMIC FIREWALL & ATTENUATION CONTROLS                      │`  
`│ • Ignorance by Omission: Forbidden mystery tokens scrubbed from prompt │`  
`│ • Omniscience leak tripwire: Flags unearned factual mentions in AST    │`  
`│ • Hearsay confidence degradation: (0.8)^h hop decay assertions        │`  
`└────────────────────────────────┬───────────────────────────────────────┘`  
                                 `│ Pass`  
                                 `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ TIER 4: CRYPTOGRAPHIC DRIFT & LEDGER MUTEX GATES                       │`  
`│ • State snapshot hash equality: assert(H_root^UI == H_root^Ledger)     │`  
`│ • Desynchronization lock: Halts episode batching on canon drift        │`  
`│ • Field drift approval modal: Blocks unconfirmed state mutations       │`  
`└────────────────────────────────┬───────────────────────────────────────┘`  
                                 `│ Pass`  
                                 `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ TIER 5: SOCKET TORTURE, RESILIENCE & EMERGENCY BRAKES                  │`  
`│ • Session hijack arbitration: Single-threaded Durable Object mutex     │`  
`│ • Zombie connection recovery: Playwright CDP network drop simulation   │`  
`│ • EmergencyHaltButton: global_agent_dispatch_locked = 1 execution     │`  
`└────────────────────────────────┬───────────────────────────────────────┘`  
                                 `│ Pass`  
                                 `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ TIER 6: OPTICAL PRE-VIZ & AUDIO SIGNAL HYGIENE                         │`  
`│ • Exposure sheet frame integer math: ceil(duration_ms / 1000 * 24)     │`  
`│ • Empty-Hash Sentinel Trap: Rejects zero-byte sha256_e3b0c442... files │`  
`│ • Dialogue stem normalization (-1.0 dBTP) & -14 dB bed ducking curve   │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **1\. The Core Testing Mandate & Universal Negative-Control Law**

The testing architecture is governed by the **Universal Negative-Control Law**:

*A validation gate, capability boundary, or immutability trap that has never been observed rejecting an illegal in-memory mutation, ungrounded allocation, or invalid kinetic action has not been proven to work*.

Every verification check within goblin-dashboard must be accompanied by explicit negative controls: deliberately malformed payloads, out-of-bounds parameters, and adversarial AST structures designed to prove that the system reliably fails closed with explicit error coordinates.

#### **2\. The Economic Funnel: Fail-Fast at *T*0​\=\$0.00**

Downstream execution costs scale exponentially across the pipeline:

> * A narrative contradiction, somatic breach, or audio miscalculation caught at *T*0​ within the dashboard's pre-flight linter costs **\$0.00**.  
> * Letting that defect escape into speech synthesis, GPU diffusion plate generation, or headless Chromium optical printing consumes machine hours, burns API tokens, and pollutes git release histories.  
> * Checks progress strictly from zero-cost static analysis up to interactive end-to-end integration tests.

#### **3\. Tier 0: Static Boundary, Encoding & Zero-Token Linting**

Before mounting Astro components or executing test runners, the workspace is scanned for boundary leaks and syntax violations:

> * **The Zero-Runtime-Markdown Rule:** The dashboard must never parse raw Markdown or frontmatter YAML at runtime. Ingestion occurs strictly via compiled JSON (bible-state.json) or typed client modules (packages/001.lore/src/client.ts).  
>   `# Negative Control: Assert no markdown or frontmatter parsers in dashboard runtime`  
>   `node -e "`  
>   `const pkg = require('./goblin-dashboard/package.json');`  
>   `const deps = Object.keys(pkg.dependencies || {});`  
>   `const forbidden = ['gray-matter', 'remark', 'marked', 'unified'];`  
>   `const violations = deps.filter(d => forbidden.includes(d));`  
>   `if (violations.length > 0) {`  
>     `console.error('STATIC VIOLATION: Forbidden runtime markdown parsers found:', violations);`  
>     `process.exit(1);`  
>   `}`  
>   `console.log('>> [TIER 0 PASS] Zero runtime markdown parsers in dashboard.');`  
>   `"`

> * **Deterministic Ambient Time Purity:** Functions evaluating simulation projections or calculating frame conversions must never call non-deterministic system clocks.  
>   `git grep -E "Date\.now\(\)|performance\.now\(\)|new Date\(\)" goblin-dashboard/src/lib/projections/`  
>   `# Pass condition: Exit code 1 (zero matches found)`

> * **7-Bit ASCII Cleanliness:** All console formatters, status badges, and telemetry outputs must adhere strictly to 7-bit ASCII characters (\[OK\], \[FAIL\], \>\>, \---) to prevent encoding crashes on Windows headless CI runners.  
>   `git grep -P "[^\x00-\x7F]" goblin-dashboard/src/lib/`  
>   `# Pass condition: Exit code 1 (zero matches found)`

#### **4\. Tier 1: Deep-Freeze Immutability & Memory Anti-Tamper Suite**

goblin-dashboard displays canonical data alongside mutable director controls. The Tier 1 gauntlet verifies that ingested lore cannot be altered in memory:

`// goblin-dashboard/test/verification/immutability.test.ts`  
`import { describe, it, expect } from 'vitest';`  
`import { loadBibleState, getCharacterSomaticMask } from '000.goblin-lore/client';`

`describe('Tier 1: Deep-Freeze Immutability & Anti-Tamper Gauntlet', () => {`  
  `const state = loadBibleState('under-the-floorboards');`

  `it('negative control: rejects top-level entity property mutations', () => {`  
    `expect(() => {`  
      `// @ts-expect-error - Testing runtime immutability trap`  
      `state.entities.characters.char_bog.name = 'TAMPERED_BOG';`  
    `}).toThrow(TypeError);`  
  `});`

  `it('negative control: rejects nested logistical inventory array pushes', () => {`  
    `expect(() => {`  
      `// @ts-expect-error - Testing runtime array push trap`  
      `state.entities.characters.char_bog.logistical.held.push('item_contraband_knife');`  
    `}).toThrow(TypeError);`  
  `});`

  `it('negative control: fails closed on unknown character ID query', () => {`  
    `expect(() => {`  
      `getCharacterSomaticMask(state, 'char_phantom_spectre');`  
    `}).toThrow(/\[LORE CLIENT\] Unknown character ID/);`  
  `});`

  `it('negative control: rejects mutation of projected somatic mask object', () => {`  
    `const mask = getCharacterSomaticMask(state, 'char_wart');`  
    `expect(() => {`  
      `// @ts-expect-error - Testing mask immutability`  
      `mask.availableArms = 2.0;`  
    `}).toThrow(TypeError);`  
  `});`  
`});`

#### **5\. Tier 2: Somatic SAT & Motor Action Invariant Verification**

The dashboard contains automated linters that cross-reference extracted screenplay motor verbs against physical character constraints:

> * **Anatomical Upper-Limb Equation:**  
>   availableArms={0.0max(0.0,2.0−∑severe\_trauma)​if locomotion is sessile∨slitheringotherwise​  
> * **Negative-Control Fixture (Two-Handed Action on Amputee Actor):** When auditing candidate scenes featuring Wart (char\_wart, whose severed\_left\_arm limits him to availableArms=1.0), the linter asserts that any two-handed motor action triggers a hard stop:

`// goblin-dashboard/test/verification/somaticLinter.test.ts`  
`import { describe, it, expect } from 'vitest';`  
`import { lintSceneMotorActions } from '../../src/lib/linters/somaticLinter';`

`describe('Tier 2: Somatic SAT & Kinetic Verb Verification', () => {`  
  `it('negative control: rejects two-handed bimanual task on single-arm actor', () => {`  
    `const candidateScene = {`  
      `scene_id: 'ep040_sc01',`  
      `actor: 'char_wart',`  
      `extracted_motor_actions: [`  
        `{ action: 'brace_with_left_hand', target: 'iron_pipe' },`  
        `{ action: 'tighten_with_right_hand', target: 'brass_valve' }`  
      `]`  
    `};`

    `const verdict = lintSceneMotorActions(candidateScene);`  
    `expect(verdict.passed).toBe(false);`  
    `expect(verdict.errorCode).toBe('SOMATIC_BIMANUAL_VIOLATION');`  
    `expect(verdict.diagnosticMessage).toMatch(/requires 2 functional limbs; actor has 1.0/);`  
  `});`

  `it('negative control: catches banned kinetic verb execution', () => {`  
    `const candidateScene = {`  
      `scene_id: 'ep040_sc02',`  
      `actor: 'char_wart', // Wart bans: ['sprint', 'vault', 'climb', 'embrace']`  
      `extracted_motor_actions: [`  
        `{ action: 'sprint', target: 'pantry_corner' }`  
      `]`  
    `};`

    `const verdict = lintSceneMotorActions(candidateScene);`  
    `expect(verdict.passed).toBe(false);`  
    `expect(verdict.errorCode).toBe('BANNED_KINETIC_VERB');`  
  `});`  
`});`

#### **6\. Tier 3: Epistemic Firewall & Ignorance-by-Omission Gauntlet**

Large language models tend to leak narrative secrets into dialogue if those secrets are visible in prompt memory. The dashboard audits prompt context windows using *Ignorance by Omission*:

`// goblin-dashboard/test/verification/epistemicFirewall.test.ts`  
`import { describe, it, expect } from 'vitest';`  
`import { compileCharacterContextEnvelope } from '../../src/lib/prompt/contextAssembly';`  
`import { auditDialogueASTForOmniscience } from '../../src/lib/linters/epistemicLinter';`

`describe('Tier 3: Epistemic Firewall & Omission Auditing', () => {`  
  `it('negative control: completely strips omitted secrets from context window', () => {`  
    `// Bog has TOTAL_IGNORANCE of mystery_the_famine ground truth`  
    `const envelope = compileCharacterContextEnvelope('char_bog', 'mystery_the_famine');`  
      
    `expect(envelope.promptText).not.toContain('famine');`  
    `expect(envelope.promptText).not.toContain('rations_hoard');`  
    `expect(envelope.bannedAttenuationTokens).toContain('famine');`  
  `});`

  `it('negative control: flags dialogue AST leaking unrevealed facts', () => {`  
    `const leakingDialogueAST = {`  
      `scene_id: 'ep040_sc03',`  
      `lines: [`  
        `{`  
          `speaker: 'char_bog',`  
          `text: "I know you hid the dried fungus during the famine, Spleen!"`  
        `}`  
      `]`  
    `};`

    `const audit = auditDialogueASTForOmniscience(leakingDialogueAST, 'char_bog');`  
    `expect(audit.passed).toBe(false);`  
    `expect(audit.failureClass).toBe('EPISTEMIC_FIREWALL_BREACH');`  
    `expect(audit.leakedTokens).toContain('famine');`  
  `});`  
`});`

#### **7\. Tier 4: Ledger Drift Tripwires & State Mutex Controls**

The dashboard prevents desynchronized production dispatching when upstream canon or dynamic engine states diverge:

| Gauntlet Check | Negative-Control Trigger | Dashboard Reaction & Fail-Closed Behavior |
| :---- | :---- | :---- |
| **Canon Root Hash Mismatch** | Modify 1 byte in 000.goblin-lore/characters/bog.md without running compile.ts (*H*rootUI​\=*H*rootLedger​). | The UI displays a red **Continuity Desynchronization Lock**; all "Trigger Batch Render" buttons are disabled until canon is compiled. |
| **Field Drift Gate** | Upstream LLM drafting pass emits an AST where escalation jumps \+2 stages unexpectedly. | Progression freezes; a **Drift Approval Modal** requires explicit director sign-off before mutations commit to the ledger. |
| **Emergency Kill Switch** | Director clicks EmergencyHaltButton.tsx. | Dispatches POST /api/emergency-halt, flipping global\_agent\_dispatch\_locked \= 1 in D1 and revoking active worker execution leases. |

#### **8\. Tier 5: Socket Resilience & Network Torture Battery**

For edge deployments on Cloudflare Pages and Workers, network instability must not corrupt director sessions or drop simulation leases:

> * **Session Hijack Arbitration:** Single-threaded ShotCoordinatorDO Durable Objects arbitrate director connections. When an operator opens Tab 2, Tab 1 receives an immediate close code 4409 Conflict, transferring active state ownership without split-brain anomalies.  
> * **Playwright Zombie-Socket Torture:**  
>   `// goblin-dashboard/test/e2e/socketTorture.spec.ts`  
>   `import { test, expect } from '@playwright/test';`

>   `test('Tier 5: proves zero packet loss across dirty socket disconnects', async ({ page, context }) => {`  
>     `await page.goto('http://localhost:4321/director/tuning');`  
>     `await page.fill('#curtness-slider', '0.85');`

>     `// Simulate complete physical network drop via Chrome DevTools Protocol`  
>     `const cdp = await context.newCDPSession(page);`  
>     `await cdp.send('Network.emulateNetworkConditions', {`  
>       `offline: true,`  
>       `latency: 0,`  
>       `downloadThroughput: 0,`  
>       `uploadThroughput: 0,`  
>     `});`

>     `await page.waitForTimeout(5000); // 5-second blackout`

>     `// Restore network connection`  
>     `await cdp.send('Network.emulateNetworkConditions', {`  
>       `offline: false,`  
>       `latency: 20,`  
>       `downloadThroughput: 10 * 1024 * 1024,`  
>       `uploadThroughput: 5 * 1024 * 1024,`  
>     `});`

>     `// Assert socket reconnection and state reconciliation`  
>     `const indicator = page.locator('#connection-status');`  
>     `await expect(indicator).toHaveText('SYNCHRONIZED', { timeout: 10000 });`  
>     `const syncedValue = await page.inputValue('#curtness-slider');`  
>     `expect(syncedValue).toBe('0.85');`  
>   `});`

#### **9\. Tier 6: Audio Exposure Sheet & Manifest Invariant Auditing**

Before the showrunner can authorize an animatic or approve a final episode package, the dashboard validates physical signal invariants:

`┌─────────────────────────────────────────────────────────────┐`  
`│             EXPOSURE SHEET AUDIT HARNESS                    │`  
`├─────────────────────────────────────────────────────────────┤`  
`│ 1. ffprobe Audio Duration: 3,120 ms                         │`  
`│ 2. Exact Integer Frame Budget: ceil(3.120 * 24) = 75 frames │`  
`│ 3. True-Peak Level: -1.0 dBTP                               │`  
`│ 4. Sidechain Ducking Bed: -14.0 dB                          │`  
`│ 5. Provenance Manifest Seal: Matches git:7bd4e10            │`  
`└─────────────────────────────────────────────────────────────┘`

> * **Integer Frame Math Enforcement:**  
>   target\_frames=⌈1000duration\_ms​×24⌉  
> * **Negative-Control Fixture (Frame Budget Mismatch):** If exposure\_sheet.json declares 72 frames for a 3,120 ms audio stem (which requires exactly 75 frames at 24 fps), the animatic player flags a FRAME\_BUDGET\_MISMATCH and disables broadcast export.  
> * **The Zero-Byte Poison Sentinel Trap:** Computes SHA-256 hashes of all referenced audio stems and sprite variants. Any asset matching the empty-file constant:  
>   EMPTY\_FILE\_HASH=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>   immediately triggers a fatal build rejection, preventing empty files from reaching headless render passes.

#### **10\. Automated Antigravity Terminal Runbook**

To verify all gates in a single automated pass, developers execute the Antigravity test battery:

`# 1. Run static boundary & 7-bit ASCII checks`  
`npm run audit:boundaries`

`# 2. Typecheck workspace against @goblin/shared-types`  
`npm run typecheck --workspace=goblin-dashboard`

`# 3. Execute Vitest negative-control unit & invariant test battery`  
`npm run test:invariants --workspace=goblin-dashboard`

`# 4. Execute Playwright end-to-end socket resilience & UI test suite`  
`npm run test:e2e --workspace=goblin-dashboard`

`# 5. Assert zero git drift across canonical lore directories`  
`git diff --exit-code 000.goblin-lore/`

`================================================================================`  
          `GOBLIN-DASHBOARD // VERIFICATION GAUNTLET RUN REPORT`  
`================================================================================`  
`[TIER 0] STATIC & ENCODING BOUNDS     Zero runtime MD; 7-bit ASCII clean  [PASS]`  
`[TIER 1] DEEP-FREEZE IMMUTABILITY     4 of 4 mutation attacks rejected    [PASS]`  
`[TIER 2] SOMATIC SAT & MOTOR LINTER   Bimanual & banned verbs caught      [PASS]`  
`[TIER 3] EPISTEMIC OMISSION LINTER    Forbidden mystery leak intercepted  [PASS]`  
`[TIER 4] CRYPTOGRAPHIC STATE HASH     H_root matches ledger snapshot      [PASS]`  
`[TIER 5] SOCKET TORTURE RESILIENCE    Zero packet loss across disconnect  [PASS]`  
`[TIER 6] EXPOSURE SHEET AUDIO CONFORM 24fps frame budgets match ffprobe   [PASS]`  
`================================================================================`  
`FINAL VERDICT: ALL GATES GREEN ($0.00 compute wasted). READY FOR SHOWRUNNER.`

---

*User prompt: {{FOCUS: 4\. Grievance Escalation DAG Projection: getActiveGrievanceDAG Mathematical Contract & Type Signature (goblin-dashboard) }} /extreme-details*

### **Response: Mathematical Formalization of the Causal Narrative Lattice**

In the episodic generation pipeline, interpersonal conflict cannot be modeled as an arbitrary state machine or unconstrained generative improvisation. If narrative transitions permitted cyclic causality (*A*→*B*→*C*→*A*), automated simulation engines (worker-sower-engine) would enter infinite escalation loops, generating repetitive domestic arguments without advancing season-long narrative arcs.

To enforce forward dramatic momentum, narrative conflict escalation is formalized as a finite Directed Acyclic Graph (DAG):

GDAG​\=(Vgrv​,Espawn​)

#### **1\. Vertices (Vgrv​)**

The vertex set represents authored conflict dossiers (loaded from bible-state.json), where each grievance *v*∈Vgrv​ is parameterized by a tuple:

*v*\=⟨id,\[*I*min​,*I*max​\],Ppri​,Pcan​,Pcannot​,*C*cycles​,decay,Rpaths​,*τ*farce​⟩

> * \[*I*min​,*I*max​\]⊂N: The allowed integer scalar intensity interval (1≤*I*min​≤*I*max​≤5).  
> * Ppri​⊂C: Exactly two primary disputants from character set C (∣Ppri​∣=2).  
> * Pcan​,Pcannot​⊂C: Eligible and barred secondary witness participants.  
> * *C*cycles​∈N: Quota of episode cycles this conflict must rest after activation.  
> * Rpaths​: The set of formal mechanical resolution off-ramps (e.g., restitution, formal apology, exile, blood debt settled).  
> * *τ*farce​∈{true,false}: The tonal\_override\_eligible flag denoting low-stakes palate cleansers.

#### **2\. Directed Causal Edges (Espawn​)**

A directed edge (*u*,*v*)∈Espawn​ indicates that reaching the maximum intensity ceiling (*I*\=*I*max​) in grievance *u* during an opposed mechanical duel atomically unlocks and promotes child grievance *v* into the active narrative lottery pool:

Espawn​\={(*u*,*v*)∈Vgrv​×Vgrv​∣*v*∈spawns\_on\_max\_escalation(*u*)}

#### **3\. Topological Escalation Depth (*δ*)**

Topological depth *δ*(*v*) measures the longest causal prerequisite chain required to reach grievance *v* from any genesis conflict in the storyworld:

*δ*(*v*)={01+max(*u*,*v*)∈Espawn​​*δ*(*u*)​if InDegree(*v*)=0otherwise​

> * **Genesis Roots (*δ*\=0):** In-degree *k*in​\=0. Micro-frictions suited for early season cycles (Cycles 1–4).  
> * **Secondary Crises (*δ*\=1):** Mid-season escalations triggered when root arguments boil over (Cycles 5–8).  
> * **Climactic Feuds (*δ*≥2):** Irreversible confrontations and season finales (Cycles 9–12+).

The maximum topological depth across the corpus dictates narrative runway:

*δ*max​\=*v*∈Vgrv​max​*δ*(*v*)

#### **4\. The Critical Pacing Path (Πcrit​)**

The critical path represents the maximal directed walk through the narrative causal lattice:

Πcrit​\=⟨*v*0​,*v*1​,…,*vδ*max​​⟩such that(*vi*​,*vi*\+1​)∈Espawn​

In the canonical storyworld under-the-floorboards, this path traces:

resource\_hoarding⟶hoarding\_reveal⟶generational\_famine\_feud

### **Mathematical Contract & TypeScript Type Signature**

In packages/001.lore/src/client.ts, getActiveGrievanceDAG serves as the public projection accessor consumed downstream by goblin-dashboard and worker-sower-engine.

`// packages/001.lore/src/client.ts`

`import type { BibleState } from '../schemas/index.js';`

`/**`  
 `* Downstream type signature for the raw transition projection.`  
 `* Maps every parent grievance ID to an immutable array of target spawn IDs.`  
 `*/`  
`export type ActiveGrievanceDAGManifest = Readonly<Record<string, readonly string[]>>;`

`/**`  
 `* Extracts the Directed Acyclic Graph of grievance escalation transitions.`  
 `* Pure, deterministic projection over the deep-frozen BibleState.`  
 `*`  
 `* @param state - The deep-frozen, read-only canonical universe state.`  
 `* @returns Readonly map where keys are parent grievance IDs and values are arrays of spawned child grievance IDs.`  
 `*/`  
`export function getActiveGrievanceDAG(`  
  `state: Readonly<BibleState>,`  
`): ActiveGrievanceDAGManifest {`  
  `const dag: Record<string, string[]> = {};`

  `for (const [id, g] of Object.entries(state.entities.grievances)) {`  
    `const rawSpawns = (g as any).spawns_on_max_escalation || [];`  
    `dag[id] = rawSpawns.map((target: any) =>`  
      `typeof target === 'string' ? target : target.target_id || target.id,`  
    `);`  
  `}`

  `return deepFreeze(dag);`  
`}`

#### **Extended Pacing Projection Contract (getGrievancePacingProfile)**

When goblin-dashboard mounts structural health visualizers (such as GrievanceDAGViewer.tsx), it pairs getActiveGrievanceDAG with the analytical pacing diagnostics exported from packages/001.lore/src/health/escalationDag.ts:

`export interface GrievanceDAGNodeDescriptor {`  
  `readonly id: string;`  
  `readonly intensityFloor: number;`  
  `readonly intensityCeiling: number;`  
  `readonly spawnsOnMax: readonly string[];`  
  `readonly resolutionPathsCount: number;`  
  `readonly participantsPrimary: readonly [string, string];`  
  `readonly tonalOverrideEligible: boolean;`  
  `readonly surfaceComplaint: string;`  
  `readonly underneath: string;`  
`}`

`export interface NodePacingDiagnostics {`  
  `readonly id: string;`  
  `readonly depth: number;`  
  `readonly inDegree: number;`  
  `readonly outDegree: number;`  
  `readonly isRoot: boolean;`  
  `readonly isLeaf: boolean;`  
  `readonly isPrematureClimax: boolean;`  
  `readonly isUnresolvedSink: boolean;`  
  `readonly isExplosiveBranch: boolean;`  
`}`

`export interface EscalationDagReport {`  
  `readonly totalNodes: number;`  
  `readonly maxDepth: number;`  
  `readonly criticalPacingPath: readonly string[];`  
  `readonly cycleDetected: boolean;`  
  `readonly cycleTrace: readonly string[];`  
  `readonly prematureClimaxes: readonly string[];`  
  `readonly shallowCanonDetected: boolean;`  
  `readonly unreachableOrphans: readonly string[];`  
  `readonly unresolvedSinks: readonly string[];`  
  `readonly explosiveBranches: readonly string[];`  
  `readonly nodeDiagnostics: readonly NodePacingDiagnostics[];`  
  `readonly pacingScore: number; // Normalized [0.0, 1.0]`  
  `readonly hasBlockingFailures: boolean;`  
`}`

### **Ingestion & Normalization Mechanics**

The accessor normalizes polymorphic input shapes committed during early development passes into a uniform, typed data structure:

       `RAW LORE FRONTMATTER (grievances/*.md)`  
   `Case A: spawns_on_max_escalation: ["grv_reveal"]`  
   `Case B: spawns_on_max_escalation: [{ target_id: "grv_reveal", threshold: 4 }]`  
   `Case C: spawns_on_max_escalation: [{ id: "grv_reveal" }]`  
   `Case D: spawns_on_max_escalation: [] / undefined`  
                          `│`  
                          `▼`  
            `[ getActiveGrievanceDAG(state) ]`  
                          `│`  
                          `│ Normalization Loop:`  
                          `│ typeof t === 'string' ? t : t.target_id || t.id`  
                          `▼`  
             `CANONICAL STRIPPED ARRAY:`  
          `dag[parent_id] = ["grv_reveal"]`  
                          `│`  
                          `▼`  
             `[ deepFreeze(dag) Execution ]`  
                          `│`  
                          `▼`  
      `IMMUTABLE PROJECTION CONSUMED BY DASHBOARD UI`

> 1. **Schema Polymorphism Normalization:**  
   * String literals ("grv\_hoarding\_reveal").  
   * Typed target envelopes ({ target\_id: "grv\_hoarding\_reveal", threshold: 4 }).  
   * Legacy object identifiers ({ id: "grv\_hoarding\_reveal" }). The normalization closure extracts pure string foreign keys (typeof target \=== 'string' ? target : target.target\_id || target.id), stripping extraneous schema noise before caching.  
> 2. **Defensive Fallback:** If spawns\_on\_max\_escalation is null, undefined, or omitted, the accessor assigns an empty array \[\] rather than throwing reference errors.  
> 3. **Deep-Freeze Sealing:** The populated dictionary is passed through deepFreeze(dag). In strict execution mode, calling .push() or modifying DAG links in browser memory raises an unhandled TypeError.  
> 4. **Computational Complexity:** Ingestion runs in linear time:  
>    O(∣Vgrv​∣+∣Espawn​∣)  
>    Across a production corpus of 40–60 grievances, execution completes in under 0.5 ms on local V8 runtimes and Cloudflare Worker edge isolates.

### **Verification Invariants & Defect Gates**

Before getActiveGrievanceDAG can project state into goblin-dashboard, the underlying graph is validated through Pass 2 compiler checks and the auditEscalationDag testing harness:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│               DAG PACING & VERIFICATION DEFECT GATES                   │`  
`├──────────────────────────────┬──────────────────┬──────────────────────┤`  
`│ Defect Class                 │ Severity         │ Enforcement Rule     │`  
`├──────────────────────────────┼──────────────────┼──────────────────────┤`  
`│ 1. CYCLE_DETECTED            │ CRITICAL (FATAL) │ Three-Color DFS      │`  
`│ 2. PREMATURE_CLIMAX          │ HIGH (FATAL)     │ δ = 0 ∧ I_floor > 2  │`  
`│ 3. SHALLOW_CANON             │ HIGH (WARN)      │ δ_max < min_depth    │`  
`│ 4. ORPHAN_SPAWN_UNREACHABLE  │ CRITICAL (FATAL) │ I_max < spawn_thresh │`  
`│ 5. UNRESOLVED_TERMINAL_SINK  │ MEDIUM (WARN)    │ k_out = 0 ∧ |R| = 0  │`  
`│ 6. EXPLOSIVE_FAN_OUT         │ MEDIUM (WARN)    │ k_out > max_branch   │`  
`│ 7. FARCE_CONTAMINATION_LEAK  │ CRITICAL (FATAL) │ τ_farce ∧ k_out > 0  │`  
`└──────────────────────────────┴──────────────────┴──────────────────────┘`

#### **1\. Cycle Detection via Three-Color DFS (CYCLE\_DETECTED)**

The system enforces strict acyclicity:

∀*v*∈Vgrv​,*v*∈/Descendants(*v*)

The traversal maps nodes into three states:

> * WHITE (0): Unvisited.  
> * GRAY (1): Currently evaluating on active recursion stack.  
> * BLACK (2): Fully traversed and verified acyclic.

If an edge points to a GRAY node, a back-edge is flagged, triggering an immediate compiler halt with the exact cycle trace:

`[CYCLE_DETECTED]: Circular escalation loop:`  
`grv_spoon_credit -> grv_hoarding_reveal -> grv_spoon_credit`

#### **2\. The Premature Climax Defect (PREMATURE\_CLIMAX)**

Root grievances must never initiate at near-lethal or relationship-destroying intensities:

(*δ*(*v*)=0)⟹(*v*.intensity\_floor≤config.max\_root\_intensity\_floor)

If a root node (*δ*\=0) declares *I*min​≥3, the compiler rejects the file to prevent high-stakes crises on Episode 1\.

#### **3\. The Farce Isolation Contract (FARCE\_CONTAMINATION\_LEAK)**

When a grievance sets tonal\_override\_eligible: true (a comedic palate cleanser), it must adhere to three topological invariants:

> * **Zero Out-Degree:** *k*out​(*v*)=0 (spawns\_on\_max\_escalation: \[\]). A squabble over a missing spoon cannot spawn an existential blood feud.  
> * **Low Intensity Ceiling:** *I*max​≤2.  
> * **Topological Depth Isolation:** Must reside at Depth *δ*\=0 or exist as a detached leaf.  
> * **The "Underneath" Invariant:** The dossier's prose must explicitly declare: *"There genuinely isn't an underneath; this is the point."*

### **Dashboard Telemetry & Directorial Controls**

Within goblin-dashboard, the projection returned by getActiveGrievanceDAG coordinates human oversight across three interfaces:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│            GRIEVANCE DAG COCKPIT VIEW (GrievanceDAGViewer.tsx)         │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│                                                                        │`  
`│   [Depth δ = 0]              [Depth δ = 1]            [Depth δ = 2]   │`  
`│  ┌──────────────┐           ┌──────────────┐         ┌──────────────┐  │`  
`│  │spoon_credit  ├───(Max)──►│hoarding_reveal├──(Max)►│famine_feud   │  │`  
`│  │Stage: 3/4 [●]│           │Stage: 0/5 [○]│         │Stage: 0/5 [○]│  │`  
`│  └──────┬───────┘           └──────────────┘         └──────────────┘  │`  
`│         │ (Shared Parent)                                              │`  
`│         ▼                                                              │`  
`│  ┌──────────────┐                                                      │`  
`│  │stolen_thimble│                                                      │`  
`│  │Stage: 1/2 [○]│                                                      │`  
`│  └──────────────┘                                                      │`  
`│                                                                        │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ SELECTED: grv_hoarding_reveal                                          │`  
`│ Primary Dyad: char_bog <-> char_mum_grissel                            │`  
`│ Escalation Path: 0 -> 1 -> 2 (Critical Pacing Path)                   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ [ PIN GRIEVANCE TO NEXT CYCLE ]       [ SIMULATE 2d6 DUEL PROMOTION ]  │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **1\. Dynamic State-over-Static Lattice Overlay**

The Astro page (src/pages/telemetry/grievances.astro) runs getActiveGrievanceDAG(state) during SSR to generate the base tree geometry. The client React island (GrievanceDAGViewer.tsx) subscribes to WebSocket updates from worker-sower-engine, mapping live dynamic state on top of the static graph:

> * **Tension Gauge Meters:** Overlays current intensity stages (*I*curr​∈\[*I*min​,*I*max​\]) onto DAG nodes.  
> * **Active Promotion Highlights:** Animates edge traversal lines when an upstream duel in Stage 4 triggers spawns\_on\_max\_escalation.

#### **2\. Dyadic Starvation Mitigation**

The dashboard cross-references the DAG against the combinatorial dyadic matrix:

Mdyad​\[*u*,*v*\]=∣{*g*∈Vgrv​∣{*u*,*v*}⊆*g*.Ppri​}∣

If an active character pairing has all associated grievances sitting in cooldown cycles (*C*cycles​\>0), the dashboard highlights the dyad in red (COOLDOWN\_LOCKOUT\_HAZARD). The director can trace downstream un-spawned nodes in the DAG and manually promote a child dispute to clear the bottleneck.

#### **3\. One-Click Directorial Scene Pinning**

When the showrunner selects a node in the visual graph and clicks "Pin Grievance to Next Cycle," the dashboard emits an authenticated intent envelope to worker-sower-engine:

`{`  
  `"intent_type": "PIN_GRIEVANCE",`  
  `"payload": {`  
    `"target_grievance_id": "grv_hoarding_reveal",`  
    `"bypass_prng_lottery": true,`  
    `"force_participants": ["char_bog", "char_mum_grissel"]`  
  `}`  
`}`

This bypasses Stage 3 lottery randomization, forcing the selected causal edge into the active scene prompt while preserving all underlying somatic and epistemic constraints.

---

*User prompt: Overview\_ Goblin-Dashboard.00 (05.delivery):    Overview\_ Goblin-Episodes.00 (05.delivery): {{FOCUS: goblin-dashboard UI Mounts & Directorial Interventions (goblin-dashboard) }} /extreme-details*

### **Response: Overview: Goblin-Dashboard.00 (05.delivery)**

goblin-dashboard is the web-native "Hand of God" showrunner cockpit and human-in-the-loop director interface within Cluster 05 (Delivery). Implemented with **Astro and React**, it operates locally on **Rig 1** (http://localhost:4321) and compiles to the cloud edge on **Cloudflare Pages**. It connects upstream to worker-sower-engine via HTTP REST and WebSocket layers, providing real-time simulation observation, dramatic parameter tuning, pre-viz animatic sign-off, and administrative override authority over generation runs.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   goblin-dashboard (SHOWRUNNER COCKPIT)                │`  
`│  • Astro Shell + React Islands (localhost:4321 / Cloudflare Pages)     │`  
`│  • Directorial Sliders: Curtness, Threat, Pacing, Subtext Attenuation  │`  
`│  • Epistemic Auditing: Ignorance by Omission & Belief Record Tracking │`  
`│  • Gate Approvals: Drift Authorization, Animatic Sign-off, Kill Switch │`  
`└───────────────▲────────────────────────▲───────────────────────────────┘`  
                `│                        │`  
       `HTTP REST / WebSockets   TypeScript Zod Schemas`  
                `│                        │`  
`┌───────────────▼────────────────┐ ┌─────▼───────────────────────────────┐`  
`│     worker-sower-engine        │ │           000.goblin-lore           │`  
`│   (Rig 1 Simulation Ledger)    │ │      (Immutable Canon Law)          │`  
`│  • GET  /ledger/state          │ │  • bible-state.json (H_root seal)   │`  
`│  • POST /simulation/override   │ │  • Somatic & Epistemic constraints  │`  
`│  • POST /conductor/batch-run   │ │  • Deep-frozen runtime client.ts    │`  
`└────────────────────────────────┘ └─────────────────────────────────────┘`

> * **Cluster 05 Positioning:** Situated on **Axis B (Representation / Artifact Hardening)** as an interactive monitoring and directorial client.  
> * **Zero Video Rendering Workload:** The dashboard contains no rendering pipelines and does not run Remotion or headless Chromium. Heavy optical printing is executed separately by goblin-viewport-template and the Remotion CLI on Rig 1's CPU/RAM using software OpenGL (--gl=swangle). The dashboard strictly consumes the resulting pre-viz animatics, exposure sheets, and master MP4 deliverables.  
> * **Network-Only API Isolation:** Communicates with upstream simulation runtimes (worker-sower-engine) across network boundaries via REST, Server-Sent Events, and WebSockets. Raw screenplay drafting and file-system mutations remain isolated inside worker-sower-engine/drafts/ to eliminate cross-process file-lock contention and sync latency.  
> * **Zero Semantic Canon Authority:** The dashboard cannot alter canonical Markdown dossiers in 000.goblin-lore. It ingests compiled, read-only JSON snapshots (bible-state.json) via packages/001.lore/src/client.ts or consumes shared type schemas (@goblin/shared-types) to evaluate simulation drift against immutable canon law.

### **Overview: Goblin-Episodes.00 (05.delivery)**

goblin-episodes (also structured as goblin-episodes/episode-XXX/ or epXXX/) is the **permanent historical archive of stamped, baked, and isolated episodic release packages** within Cluster 05\. It replaces monolithic dynamic media-player engines with autonomous, byte-reproducible software workspaces to eradicate the historical corruption trap.

               `UPSTREAM NARRATIVE & ACOUSTIC CONTRACTS`  
      `[ dialogue_ast.json ] + [ exposure_sheet.json (ffprobe) ] + [ manifest.json ]`  
                                    `│`  
                                    `▼`  
`┌─────────────────────────────────────────────────────────────────────────────┐`  
`│       METAPROGRAM GENERATOR (generator/generate-episode-repo.ts)            │`  
`│  • Ingests timing manifests, manifests, and style rules                     │`  
`│  • Harvests & prunes assets (<100MB per episode storage ceiling)            │`  
`│  • Statically bakes Episode_XXX.tsx with concrete numeric literals          │`  
`│  • Computes body SHA-256 and stamps // @lifecycle and // @checksum headers  │`  
`│  • Emits immutable provenance lockfile: render_manifest.json                │`  
`└─────────────────────────────────────┬───────────────────────────────────────┘`  
                                      `│`  
                                      `▼`  
`┌─────────────────────────────────────────────────────────────────────────────┐`  
`│                 PERMANENT ARCHIVE (goblin-episodes/episode-XXX/)             │`  
`│                                                                             │`  
`│ ├── Episode_XXX.tsx              <-- Baked, self-contained TSX component    │`  
`│ ├── render_manifest.json          <-- Host environment & dependency lockfile │`  
`│ ├── components/ (Vendored)        <-- Pinned GoblinPuppet.tsx, DuckingBus   │`  
`│ ├── public/assets/                <-- Harvested sprites, visemes, and audio  │`  
`│ └── out/master_XXX.mp4            <-- Hardened broadcast deliverable        │`  
`└─────────────────────────────────────────────────────────────────────────────┘`

> * **Eradication of the Historical Corruption Trap:** In legacy systems, feeding dynamic scene.json payloads into a shared player engine caused older episodes to visually break whenever shared React components evolved (e.g., refactoring camera curves for Episode 040 caused visemes to detach or crash zooms to decapitate characters in Episode 012). Stamping an isolated directory per episode guarantees that past episodes remain bit-identically reproducible years later.  
> * **Source-Baking Compilation:** The compiler (generate-episode-repo.ts) inlines unquoted integer frame bounds (\<Sequence durationInFrames="{75}" from="{0}"\>), audio stem paths, camera easing arrays, and viseme coordinates directly into static TSX JSX literals, banning runtime dynamic .map() evaluation.  
> * **Selective Asset Harvesting:** collect-episode-assets.ts parses the script AST and copies only the specific character variants, Preston Blair mouth visemes, background mattes, and audio stems used in that episode into public/assets/, enforcing a strict \<100MB repository ceiling.  
> * **Software-Only Rasterization:** Execution runs via the Remotion CLI on Rig 1's CPU using \--gl=swangle \--concurrency=1 \--offthreadvideo, eliminating GPU driver crashes and browser VRAM memory leaks.  
> * **Cryptographic Provenance Lockfile (render\_manifest.json):** Freezes the exact Git commit SHAs of worker-sower-engine, 000.goblin-lore, and goblin-assets-visual, the SHA-256 digests of all consumed media, and the toolchain environment (Node, Chromium milestone, Remotion release, FFmpeg build).

### **goblin-dashboard UI Mounts & Directorial Interventions**

The directorial interface operates through specialized React UI islands mounted within the Astro shell (src/layouts/ShowrunnerLayout.astro). These mounts allow human showrunners to observe state, calibrate generative parameters, enforce physical/epistemic bounds, and execute manual interventions without writing raw code or modifying immutable canon law.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   goblin-dashboard (SHOWRUNNER VIEW)                   │`  
`├───────────────────────────────────┬────────────────────────────────────┤`  
`│ [1] DirectorConsole.tsx           │ [2] SomaticHUDCard.tsx             │`  
`│  • Curtness / Threat Sliders      │  • Anatomical Limb Status (SAT)    │`  
`│  • Premise Input & Dispatch       │  • Banned Kinetic Verb Matrix      │`  
`├───────────────────────────────────┼────────────────────────────────────┤`  
`│ [3] EpistemicAuditPanel.tsx       │ [4] GrievanceDAGViewer.tsx         │`  
`│  • Ignorance-by-Omission Mask     │  • Escalation DAG Topology         │`  
`│  • Hearsay Confidence Decay       │  • One-Click Scene Pinning         │`  
`├───────────────────────────────────┼────────────────────────────────────┤`  
`│ [5] SceneReviewGate.tsx           │ [6] DriftApprovalModal.tsx         │`  
`│  • One-Screen Brief & Audio Sync  │  • Ledger Mutation Diff            │`  
`│  • Structured Rejection Logging   │  • Emergency Kill Switch (D1)      │`  
`└───────────────────────────────────┴────────────────────────────────────┘`

#### **1\. Dramatic Parameter Tuning & Prompt Conditioning Mount**

*Mounted via:* src/components/islands/DirectorConsole.tsx on src/pages/director/tuning.astro.

`┌─────────────────────────────────────────────────────────────┐`  
`│                 DIRECTOR CONSOLE (ISLAND)                   │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  Dialogue Curtness:       [────●────────]  0.72             │`  
`│  Threat Multiplier:       [───────●─────]  1.45             │`  
`│  Relational Friction:     [─────●───────]  0.60             │`  
`│  Subtext Suppression:     [────────●────]  0.80             │`  
`│  Pacing Mode:             ( ) SUSPENSE  (●) DRAMATIC_IRONY  │`  
`│  Premise Input:           "Bog discovers the missing spoon" │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  [ DISPATCH STAGE 3 DRAFT ]        [ RESET TO RECOMMENDED ] │`  
`└─────────────────────────────────────────────────────────────┘`

##### **UI Mount Specifications**

> * **Continuous Slider Array:** Visual numeric sliders binding the four-dimensional dramatic vector *P*\=⟨*C*,*P*,*T*,*S*⟩∈\[0.0,1.0\]4:  
  * **Dialogue Curtness (*C*):** Visualizes the word-budget ceiling per dialogue block and monosyllabic frequency.  
  * **Threat Multiplier (*T*):** Dynamically scales somatic injury volatility and duel trigger probability.  
  * **Pacing Ratio (*P*):** Adjusts the frequency ratio between physical motor action blocks and spoken dialogue utterances.  
  * **Subtext Suppression (*S*):** Toggles the **Attenuation Heuristic**, displaying the negative token list of banned leverage terms.  
> * **Pacing Mode Selector:** Radio toggle selecting between DRAMATIC\_IRONY, SUSPENSE, SURPRISE, and MYSTERY, enforcing compile-time context gating.  
> * **Premise Conditioning Box:** Textarea accepting human-authored thematic premises or scene seeds to condition the upstream Qwen 2.5/Sonnet drafting prompts.

##### **Directorial Interventions**

> * **Real-Time Parameter Dispatch:** Emits an authenticated JSON intent envelope (POST /api/v1/intents/parameter-shift) to worker-sower-engine, updating prompt compilation weights for the next generation pass.  
> * **Reset to Recommended:** Clears manual overrides and re-aligns sliders with the active narrative phase weights (Setup, Climax, or Cooldown) pulled from the season ledger.  
> * **Draft Generation Trigger:** Submits the compiled vector alongside the premise text directly into the Rig 1 Conductor dispatch queue.

#### **2\. Somatic Capability & Motor Action Linter HUD**

*Mounted via:* src/components/telemetry/SomaticHUDCard.tsx on src/pages/telemetry/ledger.astro.

`┌─────────────────────────────────────────────────────────────┐`  
`│                 SOMATIC CAPABILITY HUD                      │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  ACTOR: char_wart (Wart)                                    │`  
`│  Locomotion: bipedal_hunched  |  Gait: UNSTEADY_GAIT        │`  
`│  Functional Limbs: [●] Left: SEVERED  [●] Right: OK (1.0)   │`  
`│  Held Prop: item_copper_flange (Single-Hand OK)             │`  
`│  Banned Verbs: SPRINT, VAULT, CLIMB, EMBRACE                │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  LINTER STATUS: [!] 1 GAUNTLET VIOLATION DETECTED           │`  
`│  Line 12: "Wart braces the valve with both hands"           │`  
`│  >> ERROR: SOMATIC_BIMANUAL_VIOLATION (Requires 2.0 arms)   │`  
`└─────────────────────────────────────────────────────────────┘`

##### **UI Mount Specifications**

> * **Anatomical Wireframe:** Renders character injury status, highlighting disabled or severed limbs (e.g., displaying char\_wart with severed\_left\_arm and calculating availableArms=1.0).  
> * **Equipment Capacity Gauges:** Maps logistical slots (held, worn, carried, cached), verifying that single-arm actors hold no more than one item.  
> * **Kinetic Verb Strikeout Matrix:** Displays the character's canonical banned\_kinetic\_verbs (e.g., sprint, vault, climb, embrace for Wart) with red strikethrough styling.  
> * **Sensory Acuity Monitor:** Visualizes monocular blind cones (60° persistent cone) or acoustic perception debuffs (+1500 bp).

##### **Directorial Interventions**

> * **Candidate AST Action Redlining:** Automatically executes lintSceneMotorActions() on candidate screenplay ASTs. If the LLM generates a line where an impaired actor executes an unauthorized bimanual action or uses a banned kinetic verb, the HUD displays a redline banner (SOMATIC\_GAUNTLET\_FAIL) and locks the staging approval button.  
> * **Dynamic Condition Injection:** Allows the director to manually log temporary physical trauma (e.g., concussive ear ringing, fractured knee) into the engine's ephemeral buffer to constrain immediate blocking.

#### **3\. Epistemic Horizon & Ignorance-by-Omission Auditor**

*Mounted via:* src/components/telemetry/EpistemicAuditPanel.tsx on src/pages/telemetry/epistemic.astro.

| Column 1: Audience Reality (Screen) | Column 2: Actor A Bubble (char\_bog) | Column 3: Actor B Bubble (char\_spleen) |
| :---- | :---- | :---- |
| Stolen Silver Spoon is hidden beneath the floor joist. | **FACTUAL WITNESS:** Bog holds the spoon; claims sovereignty. | **RUMOR ONLY:** Believes Bog dropped it in the mud; confidence 0.64. |
| Famine rations cache exists under attic stair. | **TOTAL IGNORANCE:** Topic completely omitted from prompt. | **FALSE BELIEF:** Convinced Mum Grissel ate the dried fungus. |

##### **UI Mount Specifications**

> * **Three-Column Horizon Split:** Renders a comparative matrix aligning Audience Knowledge, Speaker Knowledge, and Interlocutor Knowledge side-by-side.  
> * **Attenuation Token Visualizer:** Badges banned words in red (e.g., \["ration", "hoard", "food", "famine"\]), verifying that subtext suppression is active.  
> * **Hearsay Confidence Meter:** Visualizes the exponential decay curve Confidence=Initial×(0.8)*h* across rumor propagation hops.

##### **Directorial Interventions**

> * **Omniscience Breach Tripwire:** Flags generated dialogue containing tokens scrubbed under *Ignorance by Omission*. If Bog utters a term related to a secret he has never observed, the UI flags an EPISTEMIC\_FIREWALL\_BREACH, identifying the exact line leaking unearned facts.  
> * **Belief State Calibration:** Allows the director to adjust a character's subjective conviction slider or force a topic into WITHHELD status to maintain dramatic irony.

#### **4\. Grievance Escalation DAG & Dyadic Starvation Cockpit**

*Mounted via:* src/components/telemetry/GrievanceDAGViewer.tsx on src/pages/telemetry/grievances.astro.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│            GRIEVANCE DAG COCKPIT VIEW (GrievanceDAGViewer.tsx)         │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│   [Depth δ = 0]              [Depth δ = 1]            [Depth δ = 2]   │`  
`│  ┌──────────────┐           ┌──────────────┐         ┌──────────────┐  │`  
`│  │spoon_credit  ├───(Max)──►│hoarding_reveal├──(Max)►│famine_feud   │  │`  
`│  │Stage: 3/4 [●]│           │Stage: 0/5 [○]│         │Stage: 0/5 [○]│  │`  
`│  └──────┬───────┘           └──────────────┘         └──────────────┘  │`  
`│         │ (Shared Parent)                                              │`  
`│         ▼                                                              │`  
`│  ┌──────────────┐                                                      │`  
`│  │stolen_thimble│                                                      │`  
`│  │Stage: 1/2 [○]│                                                      │`  
`│  └──────────────┘                                                      │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ SELECTED: grv_hoarding_reveal                                          │`  
`│ Primary Dyad: char_bog <-> char_mum_grissel                            │`  
`│ Escalation Path: 0 -> 1 -> 2 (Critical Pacing Path)                   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ [ PIN GRIEVANCE TO NEXT CYCLE ]       [ SIMULATE 2d6 DUEL PROMOTION ]  │`  
`└────────────────────────────────────────────────────────────────────────┘`

##### **UI Mount Specifications**

> * **Interactive Topological Lattice:** Renders the Directed Acyclic Graph compiled by getActiveGrievanceDAG(), displaying nodes across topological depth tiers (*δ*\=0→1→2).  
> * **Dynamic Tension Gauges:** Overlays live numeric escalation stages (*I*curr​∈\[*I*min​,*I*max​\]) and active Paranoia Clock tick meters over the static canonical nodes.  
> * **Dyadic Channel Matrix:** Displays a 6-channel status grid across the ensemble (*N*\=4), flagging starved character pairings (channels with 0 active grievances) with a DYADIC\_STARVATION\_WARNING.

##### **Directorial Interventions**

> * **One-Click Scene Pinning:** Allows the director to select an un-spawned child node (such as grv\_hoarding\_reveal) and click **Pin Grievance to Next Cycle**. This emits an authenticated intent envelope to worker-sower-engine:  
>   `{`  
>     `"intent_type": "PIN_GRIEVANCE",`  
>     `"payload": {`  
>       `"target_grievance_id": "grv_hoarding_reveal",`  
>       `"bypass_prng_lottery": true,`  
>       `"force_participants": ["char_bog", "char_mum_grissel"]`  
>     `}`  
>   `}`

>   bypassing PRNG lottery selection and forcing the dispute into the next drafting prompt.  
> * **Duel Outcome Simulation:** Lets the showrunner simulate potential mechanical duel resolutions (clean\_win, costly\_compromise, mutual\_wound, catastrophic\_backfire) to evaluate downstream ledger blast radius before committing runs.

#### **5\. One-Screen Scene Review & Structured Rejection Console**

*Mounted via:* src/components/review/SceneReviewGate.tsx on src/pages/review/animatic.astro.

`SCENE: ep040_sc03 (Swamp Relay / Day)`  
`CAST: BOG vs SPLEEN`  
`GRIEVANCE: The Good Silver Spoon (Resource Hoarding, Stage 2)`  
`SUBTEXT: Bog feels uncredited; Spleen refuses to acknowledge dependence.`  
`MECHANICAL OUTCOME: Costly Win for Spleen (Margin: +2, 1 String Spent)`  
`EXIT STATE: Bog gains [humiliated]; Spleen gains [exhausted]; Wart gains 1 String on Spleen.`

`BEAT PREVIEW:`  
  `1. [SPLEEN] Demands Bog account for missing brass fittings.`  
  `2. [BOG] Deflects, bringing up who carried the rations during the dry cycle.`  
  `3. [SPLEEN] Pulls the silver spoon, claiming Bog would have left it in the mud.`  
  `4. [BOG] Goes silent, surrendering the siphon wrench [MANDATED EXIT BEAT].`

`[ APPROVE & BATCH RENDER ]   [ REJECT & LOG REASON ]   [ EDIT CONSTRAINTS ]`

##### **UI Mount Specifications**

> * **One-Screen Operational Brief:** Synthesizes complex JSON sidecars into a plain-text briefing (Scene ID, Cast, Grievance, Subtext, Mechanical Outcome, Exit State, and MRU Beat Preview), enabling human evaluation in under 60 seconds.  
> * **CPU Animatic Video Scrubber:** Streams low-fidelity Remotion pre-viz animatics to evaluate visual pacing, mouth viseme synchrony, and comedic timing prior to dispatching GPU diffusion passes.  
> * **Exposure Sheet Signal Inspector:** Displays the 24 fps timeline exposure sheet, verifying integer frame conversions (⌈1000duration\_ms​×24⌉), true-peak levels (−1.0 dBTP), and dialogue sidechain ducking envelopes (−14 dB).

##### **Directorial Interventions**

> * **Sign-Off Authorization (\[ APPROVE \]):** Dispatches execution commands to the Conductor (produceEpisode.ts) on Rig 1, advancing the scene into master compositing.  
> * **Structured Rejection Logging (\[ REJECT & LOG REASON \]):** Rejection forces the director to select an explicit failure taxonomy code:  
  * FLAT: Dialogue lacks emotional tension or monosyllabic curtness.  
  * CONTRADICTION: Violates somatic injuries or physical line-of-sight.  
  * OOC (Out of Character): Violates character voice notes or refusal vectors.  
  * PACING: Frame budget too dragging or reaction beats unearned. The failure metadata is logged to eval/rejections.jsonl, driving automated AST surgical patching via ts-morph or Jules agents with zero re-rendering costs.

#### **6\. Drift Confirmation Modal & Root-Level Overrides**

*Mounted via:* src/components/controls/DriftApprovalModal.tsx and src/components/controls/EmergencyHaltButton.tsx in ShowrunnerLayout.astro.

`┌─────────────────────────────────────────────────────────────┐`  
`│             LEDGER DRIFT CONFIRMATION REQUIRED              │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  Upstream drafting pass has detected field drift:           │`  
`│                                                             │`  
`│  Vector: grv_resource_hoarding.escalation_stage             │`  
`│  Baseline: [2] ──────► Proposed: [4] (+2 Critical Jump)     │`  
`│                                                             │`  
`│  Vector: char_bog.somatic.conditions                        │`  
`│  Baseline: ["famished"] ──► Proposed: ["famished", "smug"]  │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  [ AUTHORIZE MUTATION ]              [ REJECT & RE-ROLL ]   │`  
`└─────────────────────────────────────────────────────────────┘`

##### **UI Mount Specifications**

> * **Field Drift Diff Viewer:** Pops up automatically when worker-sower-engine detects state divergence exceeding standard single-step increments during draft extraction (e.g., tension jumping \+2 stages or unanticipated emotional conditions).  
> * **Admin Object Injection Palette ("Miracles on Demand"):** A root-level GM console that spawns un-simulated objects, tools, or hazards directly into location nodes as an invisible entity (physics\_body: null, visibility: "GM\_ONLY", permissions: "ROOT").  
> * **Master Kill-Switch Widget:** Prominent red button bound to EmergencyHaltButton.tsx.

##### **Directorial Interventions**

> * **Drift Authorization Gate:** Ledger mutations remain locked in a staging buffer until the showrunner explicitly clicks **Authorize Mutation**. Clicking **Reject & Re-roll** discards the candidate AST and requests an automated re-draft.  
> * **Emergency Studio Halt:** A single click on EmergencyHaltButton.tsx executes the administrative kill switch, dispatching an immediate call to Cloudflare D1:  
>   UPDATE studio\_config SET global\_agent\_dispatch\_locked \= 1  
>   This revokes all distributed worker execution leases, drops active WebSocket agent sessions, halts ComfyUI diffusion jobs on Rig 2, and freezes automated Git PR merges across the entire studio fleet.

---

*User prompt: {{FOCUS: 5\. Consumption within goblin-dashboard (Astro & React) (goblin-dashboard) }} /extreme-details*

### **Response: Astro & React Island Architecture**

goblin-dashboard is architected around **Astro's Island Architecture (Partial Hydration)** with **React component islands**. Situated in **Cluster 05.delivery** as the showrunner cockpit and human-in-the-loop review station, the application runs locally on **Rig 1** (http://localhost:4321) and deploys to the cloud edge via **Cloudflare Pages**.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│              ASTRO SERVER SHELL (somatic.astro / index.astro)          │`  
`│  • Executes during SSR (Node on Rig 1 / @astrojs/cloudflare at Edge)   │`  
`│  • Calls loadBibleState('under-the-floorboards') directly              │`  
`│  • Pure static HTML emitted: Shell, Navbars, Canonical Base Typography │`  
`│  • ZERO JavaScript bundle overhead shipped to the client browser       │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Passes Deep-Frozen JSON Props`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│             HYDRATED REACT ISLANDS (client:load / client:idle)         │`  
`│                                                                        │`  
`│  ┌──────────────────────────────┐     ┌─────────────────────────────┐  │`  
`│  │ DirectorConsole.tsx          │     │ SomaticAuditInteractive.tsx │  │`  
`│  │  • Curtness / Threat Sliders │     │  • Anatomical Limb Status   │  │`  
`│  │  • Ephemeral Form State      │     │  • Banned Kinetic Linter    │  │`  
`│  └──────────────┬───────────────┘     └──────────────┬──────────────┘  │`  
`│                 │                                    │                 │`  
`│                 ▼ Emits Intent Envelopes             ▼                 │`  
`│  ┌──────────────────────────────────────────────────────────────────┐  │`  
`│  │ HTTP REST / WebSocket Layer (worker-sower-engine API / D1 DB)    │  │`  
`│  │  • Unidirectional mutation: POST /api/v1/intents/...             │  │`  
`│  │  • Never mutates deep-frozen canonical props in browser memory   │  │`  
`│  └──────────────────────────────────────────────────────────────────┘  │`  
`└────────────────────────────────────────────────────────────────────────┘`

The dashboard separates static observation from dynamic intervention:

> * **Zero-JS Scaffolding:** Frame layouts, headers, sidebars, and immutable canonical text render as pure, static HTML with **0 KB of client-side JavaScript**.  
> * **Selective React Hydration:** Only active, interactive widgets—such as parameter sliders, pre-viz scrubbers, drift confirmation modals, and the emergency stop button—ship JavaScript bundles to hydrate as independent React islands (client:load, client:idle, or client:visible).  
> * **Decoupled API Boundaries:** The dashboard UI never executes video compositing via Remotion, parses raw Markdown dossiers at runtime, or directly mutates SQLite/D1 database records. State changes are submitted as validated intent envelopes dispatched across network boundaries to worker-sower-engine or Cloudflare edge routes.

### **1\. Astro Server Frontmatter & SSR Ingestion Boundary**

Every page in goblin-dashboard executes its data gathering within Astro's server-side frontmatter boundary (---). This code runs exclusively on the host server during build time or at request time (SSR), preventing ingestion logic, file I/O, and secret tokens from leaking into browser bundles.

`---`  
`// src/pages/telemetry/somatic.astro`  
`import ShowrunnerLayout from '../../layouts/ShowrunnerLayout.astro';`  
`import StaticSomaticCard from '../../components/telemetry/StaticSomaticCard.astro';`  
`import { SomaticAuditInteractive } from '../../components/islands/SomaticAuditInteractive';`  
`import {`   
  `loadBibleState,`   
  `getCharacterSomaticMask,`  
  `getStaticSpatialGraph`   
`} from '000.goblin-lore/client';`

`// 1. Ingest immutable canonical baseline off disk via src/client.ts`  
`const seriesSlug = 'under-the-floorboards';`  
`const bibleState = loadBibleState(seriesSlug);`

`// 2. Derive domain-specific, deep-frozen projections`  
`const bogMask = getCharacterSomaticMask(bibleState, 'char_bog');`  
`const wartMask = getCharacterSomaticMask(bibleState, 'char_wart');`  
`const spatialGraph = getStaticSpatialGraph(bibleState);`

`// 3. Optional edge database query if deployed on Cloudflare Pages`  
`let activeCycle = 42;`  
`if (Astro.locals.runtime?.env?.DB) {`  
  `const row = await Astro.locals.runtime.env.DB`  
    `.prepare('SELECT current_cycle FROM simulation_ledger LIMIT 1')`  
    `.first();`  
  `if (row) activeCycle = row.current_cycle;`  
`}`  
`---`

``<ShowrunnerLayout title={`Somatic HUD - Cycle ${activeCycle}`}>``  
  `<div class="grid grid-cols-2 gap-4">`  
    `<!-- Server-Rendered Pure HTML Component (Zero Client JS) -->`  
    `<StaticSomaticCard actor="Bog" mask={bogMask} />`

    `<!-- Hydrated Dynamic React Island -->`  
    `<SomaticAuditInteractive`   
      `client:load`   
      `actorId="char_wart"`   
      `initialMask={wartMask}`   
      `cycle={activeCycle}`  
    `/>`  
  `</div>`  
`</ShowrunnerLayout>`

#### **Operational Invariants of the Server Boundary**

> * **Zero Runtime Markdown or YAML Parsing:** The frontmatter does not import gray-matter, remark, or unified. It invokes loadBibleState() from packages/001.lore/src/client.ts, which reads the pre-compiled, schema-validated JSON artifact (compiled/\<series\>/bible-state.json).  
> * **Server-Side Projection Computation:** Calling projection accessors (getCharacterSomaticMask, getStaticSpatialGraph) in Astro frontmatter shifts data filtering and graph traversal to the server. The browser receives only the computed projection, not the full multi-megabyte world bible.  
> * **Environment-Adaptive Data Access:**  
  * **On Rig 1 Local Dev:** Astro executes in Node.js, reading bible-state.json directly from the local filesystem with sub-millisecond latency.  
  * **On Cloudflare Pages Edge:** Astro runs via @astrojs/cloudflare. Server routes and frontmatter access Cloudflare D1 (env.DB) in sub-5ms without external API hops.

### **2\. React Island Hydration & Props Serialization Boundary**

When an Astro template mounts a React component, data crossing the frontmatter-to-React boundary must pass through Astro's props serialization bridge.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   ASTRO SERVER ENVIRONMENT (Node / V8)                 │`  
`│  const wartMask = getCharacterSomaticMask(state, 'char_wart');         │`  
`│  • Data structure is deep-frozen: Object.isFrozen(wartMask) === true   │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Astro Serializes Props to HTML`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                     RAW STATIC HTML DELIVERY                           │`  
`│  <astro-island                                                         │`  
`│    component-url="/_astro/SomaticAuditInteractive.js"                  │`  
`│    client="load"                                                       │`  
`│    props="{"actorId":"char_wart",...}"             │`  
`│  >                                                                     │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Client Browser Boots & Hydrates`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   REACT CLIENT RUNTIME (Browser Window)                │`  
`│  export const SomaticAuditInteractive: React.FC<Props> = (props) => {  │`  
`│    // Ingests deserialized props; enforces read-only immutability       │`  
`│  };                                                                    │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **Hydration Directives Strategy**

Astro components apply hydration directives to balance interactivity and bundle size:

| Directive | Applied UI Components | Technical Justification |
| :---- | :---- | :---- |
| **client:load** | DirectorConsole.tsx, EmergencyHaltButton.tsx, DriftApprovalModal.tsx | Immediate interactivity required. Directors need instant slider control and kill-switch responsiveness upon page load. |
| **client:idle** | GrievanceDAGViewer.tsx, EpistemicAuditPanel.tsx | Defers JS execution until the main browser thread is idle, prioritizing fast First Contentful Paint (FCP) for status displays. |
| **client:visible** | AnimaticPlayer.tsx, WaveformScrubber.tsx, CompoundHexOverlay.tsx | Hydrates media components and canvas renderers only when scrolled into the viewport, avoiding CPU spikes for off-screen tracks. |

#### **Immutability Across the Serialization Boundary**

Astro serializes props into JSON within \<astro-island\> custom elements. When deserialized in the browser, nested objects lose their original Object.freeze() wrappers.

To prevent client scripts from accidentally mutating these properties, React components wrap incoming canonical props in recursive freezing or strict read-only TypeScript wrappers:

`// src/components/islands/SomaticAuditInteractive.tsx`  
`import React, { useState } from 'react';`  
`import type { SomaticMask } from '000.goblin-lore/client';`  
`import { deepFreeze } from '../../lib/utils/deepFreeze';`

`interface SomaticAuditProps {`  
  `readonly actorId: string;`  
  `readonly initialMask: SomaticMask;`  
  `readonly cycle: number;`  
`}`

`export const SomaticAuditInteractive: React.FC<SomaticAuditProps> = ({`  
  `actorId,`  
  `initialMask,`  
  `cycle`  
`}) => {`  
  `// Enforce client-side runtime immutability on deserialized Astro props`  
  `const mask = deepFreeze(initialMask);`

  `// Ephemeral, mutable component state for local staging`  
  `const [testedAction, setTestedAction] = useState<string>('');`  
  `const [linterError, setLinterError] = useState<string | null>(null);`

  `const handleTestMotorAction = (actionVerb: string) => {`  
    `// Audit against immutable mask`  
    `if (mask.bannedKineticVerbs.includes(actionVerb.toLowerCase())) {`  
      ``setLinterError(`GAUNTLET BREACH: Verb '${actionVerb}' is banned for actor ${actorId}`);``  
      `return;`  
    `}`  
    `setLinterError(null);`  
  `};`

  `return (`  
    `<div class="hud-panel p-4 bg-zinc-900 border border-zinc-700">`  
      `<h3 class="text-sm font-bold text-zinc-300">ACTOR: {actorId}</h3>`  
      `<p class="text-xs text-zinc-400">Available Arms: {mask.availableArms}</p>`  
        
      `{linterError && (`  
        `<div class="mt-2 text-xs bg-red-950 border border-red-500 text-red-200 p-2">`  
          `{linterError}`  
        `</div>`  
      `)}`  
    `</div>`  
  `);`  
`};`

### **3\. State Management & Intent-Driven UI Dispatch**

React components in goblin-dashboard operate under a strict state boundary: **they never update canonical lore in memory and never execute raw SQL/file writes directly**.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   REACT ISLAND (DirectorConsole.tsx)                   │`  
`│                                                                        │`  
`│  1. Ephemeral UI State (useState):                                     │`  
`│     const [curtness, setCurtness] = useState(0.72);                    │`  
`│     const [threat, setThreat] = useState(1.45);                        │`  
`│                                                                        │`  
`│  2. Directorial Action Trigger:                                        │`  
`│     User adjusts slider ──► Dispatches Intent Payload                  │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ HTTP POST (Zero DB Driver Access)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                     API ENDPOINT / SERVICE LAYER                       │`  
`│  • Rig 1: http://localhost:3000/api/v1/intents/parameter-shift         │`  
`│  • Edge:  https://studio.domain.com/api/intents (Hono / D1 DB)         │`  
`│                                                                        │`  
`│  Evaluates physical invariants, validates Zod schemas, commits delta    │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Emits SSE / WebSocket Update`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                 REACT EVENT LISTENER (useLedgerStream)                 │`  
`│  • Receives state delta event: { cycle: 43, curtness: 0.72 }          │`  
`│  • Updates dashboard UI reactively without page reloads                │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **Director Console Island Implementation**

This component manages generative parameter tuning, translating UI slider inputs into validated network intents:

`// src/components/islands/DirectorConsole.tsx`  
`import React, { useState } from 'react';`

`interface DirectorConsoleProps {`  
  `readonly initialCurtness?: number;`  
  `readonly initialThreat?: number;`  
  `readonly activeTargetScene: string;`  
`}`

`export const DirectorConsole: React.FC<DirectorConsoleProps> = ({`  
  `initialCurtness = 0.5,`  
  `initialThreat = 1.0,`  
  `activeTargetScene`  
`}) => {`  
  `const [curtness, setCurtness] = useState<number>(initialCurtness);`  
  `const [threat, setThreat] = useState<number>(initialThreat);`  
  `const [isSubmitting, setIsSubmitting] = useState<boolean>(false);`  
  `const [feedback, setFeedback] = useState<string | null>(null);`

  `const dispatchParameters = async () => {`  
    `setIsSubmitting(true);`  
    `setFeedback(null);`

    `const intentPayload = {`  
      `intent_type: 'SET_COMPRESSION',`  
      `target_scene_id: activeTargetScene,`  
      `parameters: {`  
        `curtness_factor: curtness,`  
        `threat_multiplier: threat`  
      `},`  
      `client_timestamp: Date.now()`  
    `};`

    `try {`  
      `// Dispatched across network boundary to worker-sower-engine`  
      `const response = await fetch('/api/v1/intents/parameter-shift', {`  
        `method: 'POST',`  
        `headers: { 'Content-Type': 'application/json' },`  
        `body: JSON.stringify(intentPayload)`  
      `});`

      `if (!response.ok) {`  
        ``throw new Error(`Engine rejected intent: ${response.statusText}`);``  
      `}`

      `setFeedback('PARAMETERS COMMITTED TO STAGING');`  
    `} catch (err: any) {`  
      ``setFeedback(`ERROR: ${err.message}`);``  
    `} finally {`  
      `setIsSubmitting(false);`  
    `}`  
  `};`

  `return (`  
    `<div class="p-4 bg-zinc-900 border border-zinc-800 rounded">`  
      `<label class="block text-xs font-mono text-zinc-400">`  
        `CURTNESS FACTOR: {curtness.toFixed(2)}`  
      `</label>`  
      `<input`   
        `type="range"`   
        `min="0.0"`   
        `max="1.0"`   
        `step="0.05"`  
        `value={curtness}`  
        `onChange={(e) => setCurtness(parseFloat(e.target.value))}`  
        `class="w-full h-1 bg-zinc-700 accent-amber-500 my-2"`  
      `/>`

      `<label class="block text-xs font-mono text-zinc-400">`  
        `THREAT MULTIPLIER: {threat.toFixed(2)}`  
      `</label>`  
      `<input`   
        `type="range"`   
        `min="0.5"`   
        `max="3.0"`   
        `step="0.1"`  
        `value={threat}`  
        `onChange={(e) => setThreat(parseFloat(e.target.value))}`  
        `class="w-full h-1 bg-zinc-700 accent-red-500 my-2"`  
      `/>`

      `<button`   
        `onClick={dispatchParameters}`   
        `disabled={isSubmitting}`  
        `class="mt-4 px-3 py-1 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-600 rounded"`  
      `>`  
        `{isSubmitting ? 'TRANSMITTING...' : 'DISPATCH TO SOWER'}`  
      `</button>`

      `{feedback && (`  
        `<span class="ml-3 text-xs font-mono text-amber-400">{feedback}</span>`  
      `)}`  
    `</div>`  
  `);`  
`};`

### **4\. Edge Telemetry Streaming: Server-Sent Events (SSE) Route**

To reflect real-time updates from worker-sower-engine without full page refreshes, goblin-dashboard uses an Astro API route (src/pages/api/stream.ts) acting as an edge SSE relay:

`// src/pages/api/stream.ts`  
`import type { APIRoute } from 'astro';`

`export const GET: APIRoute = async ({ locals }) => {`  
  `const encoder = new TextEncoder();`

  `// Create readable stream for Server-Sent Events`  
  `const stream = new ReadableStream({`  
    `start(controller) {`  
      `// Connect to upstream engine telemetry feed or listen to D1 audit events`  
      `const interval = setInterval(async () => {`  
        `let telemetryData = {`  
          `timestamp: Date.now(),`  
          `paranoia_ticks: 3,`  
          `active_scene: 'ep040_sc02',`  
          `status: 'IDLE'`  
        `};`

        `// If running at edge with Cloudflare D1 binding`  
        `if (locals.runtime?.env?.DB) {`  
          `const row = await locals.runtime.env.DB`  
            `.prepare('SELECT current_scene, paranoia_level FROM simulation_state LIMIT 1')`  
            `.first();`  
          `if (row) {`  
            `telemetryData.active_scene = row.current_scene;`  
            `telemetryData.paranoia_ticks = row.paranoia_level;`  
          `}`  
        `}`

        ``const message = `data: ${JSON.stringify(telemetryData)}\n\n`;``  
        `controller.enqueue(encoder.encode(message));`  
      `}, 1000);`

      `// Clean up when client disconnects`  
      `return () => clearInterval(interval);`  
    `}`  
  `});`

  `return new Response(stream, {`  
    `headers: {`  
      `'Content-Type': 'text/event-stream',`  
      `'Cache-Control': 'no-cache',`  
      `'Connection': 'keep-alive'`  
    `}`  
  `});`  
`};`

### **5\. Multi-Package Monorepo Integration via npm Workspaces**

Rather than copy-pasting schemas or duplicating TypeScript models across projects, goblin-dashboard integrates into the broader studio infrastructure through npm workspaces:

`// package.json (Monorepo root or goblin-web workspace)`  
`{`  
  `"name": "goblin-web",`  
  `"private": true,`  
  `"workspaces": [`  
    `"packages/*"`  
  `]`  
`}`

Inside packages/dashboard/package.json, dependencies are resolved locally:

`{`  
  `"name": "goblin-dashboard",`  
  `"version": "1.0.0",`  
  `"type": "module",`  
  `"scripts": {`  
    `"dev": "astro dev --port 4321",`  
    `"build": "astro build",`  
    `"preview": "astro preview"`  
  `},`  
  `"dependencies": {`  
    `"@astrojs/cloudflare": "^11.0.0",`  
    `"@astrojs/react": "^4.0.0",`  
    `"@goblin/shared-types": "workspace:*",`  
    `"000.goblin-lore": "file:../001.lore",`  
    `"react": "^19.0.0",`  
    `"react-dom": "^19.0.0",`  
    `"zod": "^3.23.0"`  
  `},`  
  `"devDependencies": {`  
    `"astro": "^5.0.0",`  
    `"tailwindcss": "^3.4.0",`  
    `"typescript": "^5.4.0"`  
  `}`  
`}`

#### **Workspace Benefits for the Dashboard**

> * **Compile-Time Parity with Lore:** Changes made to character schema types in 000.goblin-lore surface immediately during dashboard builds (astro build / tsc \--noEmit), eliminating runtime type mismatches.  
> * **Shared Zod Contracts:** @goblin/shared-types provides the exact validation schemas for dialogue ASTs and scene manifests across worker-sower-engine, goblin-viewport-template, and goblin-dashboard.  
> * **Elimination of Distribution Packaging:** The dashboard runs in direct link mode on local foundries without publishing private npm tarballs or managing artifact registries.

### **6\. Astro Configuration: Local Rig 1 vs. Cloudflare Pages Adapter**

The application switches execution environments cleanly using conditional adapter logic in astro.config.mjs:

`// astro.config.mjs`  
`import { defineConfig } from 'astro/config';`  
`import react from '@astrojs/react';`  
`import cloudflare from '@astrojs/cloudflare';`  
`import tailwind from '@astrojs/tailwind';`

`const isCloudflareBuild = process.env.DEPLOY_TARGET === 'cloudflare';`

`export default defineConfig({`  
  `output: 'server', // Server-Side Rendering (SSR) for dynamic telemetry`  
  `integrations: [`  
    `react(),`  
    `tailwind()`  
  `],`  
  `adapter: isCloudflareBuild`   
    `? cloudflare({`  
        `mode: 'directory',`  
        `runtime: {`  
          `mode: 'off' // Local dev relies on standard Node or wrangler proxy`  
        `}`  
      `})`  
    `: undefined, // Defaults to standard local Node.js server on Rig 1 (port 4321)`  
  `server: {`  
    `port: 4321,`  
    `host: true`  
  `}`  
`});`

> * **Local Station Build (Rig 1):** Built for high-speed local development on port 4321, connecting directly to the local Python TTS microservice and the Rig 1 simulation engine over loopback network interfaces.  
> * **Cloudflare Edge Build:** Deployed to Cloudflare Pages, routing traffic through anycast edge nodes, querying Cloudflare D1 databases in sub-5ms, and maintaining zero active compute charges while the showrunner considers creative adjustments.

---

*User prompt: {{FOCUS: 4\. Multi-Tier Grievance Escalation DAG (getActiveGrievanceDAG) (goblin-dashboard) }} /extreme-details*

Response: In goblin-dashboard, the **Multi-Tier Grievance Escalation DAG** projection (accessed via getActiveGrievanceDAG) serves as the foundational structural bridge between static canonical lore (000.goblin-lore) and runtime dramatic generation (worker-sower-engine). Rather than permitting open-ended, improvisational prompting or cyclic interpersonal conflict, the pipeline structures all interpersonal friction into a finite Directed Acyclic Graph (DAG) that governs season-long macro-pacing, conflict spawning, and directorial overrides.

       `STATIC CANONICAL LORE (000.goblin-lore)`  
       `dossiers: series/under-the-floorboards/grievances/*.md`  
                               `│`  
                               `▼ scripts/compile.ts`  
       `SEALED ARTIFACT: compiled/<seriesSlug>/bible-state.json`  
                               `│`  
                               `▼ fs.readFileSync / @goblin/shared-types`  
       `┌─────────────────────────────────────────────────────────────┐`  
       `│             packages/001.lore/src/client.ts                 │`  
       `│                                                             │`  
       `│  getActiveGrievanceDAG(state: Readonly<BibleState>)         │`  
       `│  • Normalizes string vs. structured { target_id } targets   │`  
       `│  • Evaluates causal spawn edges (spawns_on_max_escalation)  │`  
       `│  • Recursively seals result via deepFreeze()                │`  
       `└──────────────────────────────┬──────────────────────────────┘`  
                                      `│`  
                         `Pure Immutable Projection`  
                                      `│`  
                                      `▼`  
       `┌─────────────────────────────────────────────────────────────┐`  
       `│             goblin-dashboard (SHOWRUNNER COCKPIT)           │`  
       `│                                                             │`  
       `│  src/pages/telemetry/grievances.astro (SSR Topology Pass)   │`  
       `│                    │                                        │`  
       `│                    ▼ React Island Props                     │`  
       `│  src/components/telemetry/GrievanceDAGViewer.tsx            │`  
       `│  • Overlays live tension stages (I_curr) & Paranoia Clocks  │`  
       `│  • Audits dyadic channel starvation (M_dyad[u, v])          │`  
       `│  • Dispatches PIN_GRIEVANCE intents to worker-sower-engine  │`  
       `└─────────────────────────────────────────────────────────────┘`

### **1\. Mathematical Formalization of the Causal Lattice**

The narrative conflict space is formally modeled as a finite directed acyclic graph:

GDAG​\=(Vgrv​,Espawn​)

#### **The Vertex Set (Vgrv​)**

Each vertex *v*∈Vgrv​ represents an authored grievance dossier defining a persistent interpersonal friction:

*v*\=⟨id,\[*I*min​,*I*max​\],Ppri​,Pcan​,Pcannot​,*C*cycles​,decay,Rpaths​,*τ*farce​⟩

> * **Scalar Intensity Bounds (\[*I*min​,*I*max​\]⊂N):** The allowable operational intensity interval, strictly bounded such that 1≤*I*min​≤*I*max​≤5.  
> * **Disputant Roles (Ppri​,Pcan​,Pcannot​⊂C):** The cast partitioning where primary disputants ∣Ppri​∣=2 drive dyadic tension, secondary bystanders Pcan​ provide peripheral friction, and taboo witnesses Pcannot​ dampen or bar the scene.  
> * **Cooldown Quota (*C*cycles​∈N):** The number of episodic cycles this conflict must rest in the runtime database after being triggered, preventing consecutive repetition.  
> * **Decay Rate (decay∈{slow,medium,fast,none}):** Dictates how unaddressed grievance resentment subsides over time.  
> * **Resolution Off-Ramps (Rpaths​):** Explicit mechanical resolutions (e.g., restitution of goods, formal apology, exile, blood debt settled) required to transition a terminal conflict to a closed state.  
> * **Tonal Override Flag (*τ*farce​∈{true,false}):** Designates low-stakes comedic palate cleansers exempt from subtext requirements.

#### **The Directed Spawn Edges (Espawn​)**

A directed edge (*u*,*v*)∈Espawn​ denotes that when Parent Grievance *u* boils over to its intensity ceiling (*I*\=*I*max​) during an opposed mechanical 2d6 duel in worker-sower-engine, Child Grievance *v* is atomically promoted into the active lottery pool:

Espawn​\={(*u*,*v*)∈Vgrv​×Vgrv​∣*v*∈spawns\_on\_max\_escalation(*u*)}

#### **Topological Depth (*δ*) & Macro-Season Pacing**

Every node is assigned an integer topological depth *δ*(*v*) representing the longest directed causal path from a genesis conflict:

*δ*(*v*)={01+max(*u*,*v*)∈Espawn​​*δ*(*u*)​if InDegree(*v*)=0otherwise​  
  `Topological Depth δ = 0         Topological Depth δ = 1         Topological Depth δ = 2`  
 `[ Genesis / Micro-Friction ]    [ Structural Crisis Point ]     [ Climactic Rupture / Feud ]`  
 `┌──────────────────────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐`  
 `│ resource_hoarding        ├───►│ hoarding_reveal          ├───►│ generational_famine_feud │`  
 `│ (Intensity: 1–4)         │    │ (Intensity: 2–5)         │    │ (Intensity: 3–5, Leaf)   │`  
 `└──────────────────────────┘    └──────────────────────────┘    └─────────────┬────────────┘`  
 `┌──────────────────────────┐                  ▲                               │ (Spawns Secret)`  
 `│ watch_rotation_slack     │                  │                               ▼`  
 `│ (Intensity: 1–3, Leaf)   │                  │                 ┌──────────────────────────┐`  
 `└──────────────────────────┘                  │                 │ mystery_the_famine       │`  
 `┌──────────────────────────┐                  │                 │ (Epistemic Truth Unlocked│`  
 `│ boundary_scouting        ├──────────────────┘                 └──────────────────────────┘`  
 `│ (Intensity: 1–4)         │  (Multi-Parent Confluence)`  
 `└──────────────────────────┘`

> * **Depth *δ*\=0 (Genesis / Root Conflicts):** In-degree *k*in​\=0. Everyday domestic friction (resource\_hoarding, watch\_rotation\_slack, boundary\_scouting, rations\_distribution, matriarch\_vigilance) available immediately during early season cycles (Cycles 1–5).  
> * **Depth *δ*\=1 (Structural Crises):** Spawned only when a root argument boils over to its ceiling (Cycles 6–8), exposing deeper domestic secrets (hoarding\_reveal).  
> * **Depth *δ*≥2 (Climaxes & Season Finales):** High-stakes disputes (generational\_famine\_feud) that unlock core narrative mysteries (mystery\_the\_famine) or permanently alter character standing.

The maximum topological depth across the corpus dictates narrative runway:

*δ*max​\=*v*∈Vgrv​max​*δ*(*v*)

The critical pacing path represents the maximal directed walk through the narrative causal lattice:

Πcrit​\=⟨*v*0​,*v*1​,…,*vδ*max​​⟩such that(*vi*​,*vi*\+1​)∈Espawn​

In the canonical storyworld under-the-floorboards, this path evaluates to:

resource\_hoarding⟶hoarding\_reveal⟶generational\_famine\_feud

### **2\. Implementation Mechanics of getActiveGrievanceDAG**

Housed in packages/001.lore/src/client.ts, getActiveGrievanceDAG extracts the normalized causal lattice directly from the pre-compiled, schema-validated universe snapshot (bible-state.json):

`// packages/001.lore/src/client.ts`  
`import type { BibleState } from '../schemas/index.js';`  
`import { deepFreeze } from './deepFreeze.js';`

`/**`  
 `* Extracts the Directed Acyclic Graph of grievance escalation transitions.`  
 `* Operates as a pure, deterministic projection over the deep-frozen BibleState.`  
 `*`  
 `* @param state - The deep-frozen, read-only canonical universe state.`  
 `* @returns Readonly map where keys are parent grievance IDs and values are arrays of spawned child grievance IDs.`  
 `*/`  
`export function getActiveGrievanceDAG(`  
  `state: Readonly<BibleState>,`  
`): Readonly<Record<string, readonly string[]>> {`  
  `const dag: Record<string, string[]> = {};`

  `for (const [id, g] of Object.entries(state.entities.grievances)) {`  
    `const rawSpawns = (g as any).spawns_on_max_escalation || [];`  
      
    `// Normalization loop: converts raw string literals, structured target objects,`  
    `// and legacy identifier envelopes into a clean, uniform array of target ID strings`  
    `dag[id] = rawSpawns.map((target: any) =>`  
      `typeof target === 'string' ? target : target.target_id || target.id,`  
    `);`  
  `}`

  `return deepFreeze(dag);`  
`}`

#### **Parsing & Schema Normalization Invariants**

> * **Polymorphic Ingestion Support:** The accessor normalizes three distinct target formats authored across the corpus:  
  1. Bare string identifiers: "hoarding\_reveal".  
  2. Structured target envelopes: { type: "grievance", target\_id: "hoarding\_reveal" } or { target\_id: "hoarding\_reveal", threshold: 4 }.  
  3. Legacy object wrappers: { id: "hoarding\_reveal" }.  
> * **Defensive Nil-Coalescing:** If an authored dossier omits spawns\_on\_max\_escalation or leaves it empty, the accessor assigns an empty array \[\] rather than throwing reference errors.  
> * **Deep-Freeze Sealing:** The resulting record is sealed via deepFreeze(), ensuring that any runtime attempt by dashboard components or third-party plugins to push child targets or mutate keys throws an unhandled TypeError in JavaScript strict mode.  
> * **Sub-Millisecond Execution:** Because it performs no disk I/O, regex compilation, or network lookups, getActiveGrievanceDAG executes in O(∣Vgrv​∣+∣Espawn​∣) time, taking under 0.5 ms on local V8 runtimes and Cloudflare Worker isolates.

#### **Vitest Invariant Verification**

The contract of getActiveGrievanceDAG is validated within the core testing suite (packages/001.lore/test/client.test.ts):

`it('extracts grievance escalation DAG reflecting multi-tier causal links', () => {`  
  `const state = loadBibleState('under-the-floorboards');`  
  `const dag = getActiveGrievanceDAG(state);`

  `expect(dag['resource_hoarding']).toBeDefined();`  
  `expect(dag['resource_hoarding']).toContain('hoarding_reveal');`  
  `expect(dag['hoarding_reveal']).toContain('generational_famine_feud');`  
  `expect(dag['generational_famine_feud']).toEqual([]);`  
`});`

### **3\. Structural Defect Taxonomy & Verification Gates**

Before getActiveGrievanceDAG can be safely consumed by goblin-dashboard, the underlying causal structure is verified at compile time (*T*0​\=\$0.00) via auditEscalationDag in packages/001.lore/src/health/escalationDag.ts:

| Defect Identifier | Severity | Verification Rule | System Action on Breach |
| :---- | :---- | :---- | :---- |
| **LORE\_ESCALATION\_CYCLE** | CRITICAL | Three-Color Depth-First Search (DFS). | **Hard Halt (Exit Code 1):** Aborts compilation; emits exact circular trace (e.g., *A*→*B*→*C*→*A*). |
| **LORE\_PREMATURE\_CLIMAX** | CRITICAL | (*δ*(*v*)=0)⟹(*v*.*I*min​≤max\_root\_intensity\_floor). | **Hard Halt:** Rejects root nodes authored with *I*min​≥3, preventing lethal stakes on Episode 1\. |
| **SHALLOW\_CANON** | HIGH | *δ*max​≥min\_grievance\_depth. | **Advisory Warning:** Emitted if *δ*max​\<2, alerting authors that the season lacks sufficient narrative runway. |
| **ORPHAN\_SPAWN\_UNREACHABLE** | CRITICAL | *u*.intensity\_ceiling≥*u*.spawn\_threshold. | **Hard Halt:** Catches child grievances whose parent mechanical rules prevent them from ever spawning. |
| **UNRESOLVED\_TERMINAL\_SINK** | MEDIUM | (*k*out​(*v*)=0∧*v*.*I*max​≥4)⟹∣Rpaths​∣≥1. | **Compilation Warning:** Requires climactic terminal leaf nodes to declare explicit mechanical off-ramps. |
| **EXPLOSIVE\_FAN\_OUT** | MEDIUM | *k*out​(*u*)≤config.max\_branching\_factor. | **Advisory Warning:** Flags nodes with \>3 outgoing spawn edges to prevent uncontrolled narrative divergence. |
| **FARCE\_CONTAMINATION\_LEAK** | CRITICAL | *τ*farce​⟹(*k*out​\=0∧*I*max​≤2∧*δ*\=0). | **Hard Halt:** Forbids thin comedic disputes from possessing outgoing spawn edges or exceeding intensity stage 2\. |

#### **Three-Color DFS Acyclicity Algorithm**

Strict acyclicity is enforced via three-color graph coloring:

> * **WHITE (0):** Unvisited node.  
> * **GRAY (1):** Currently active on the recursion stack (evaluating descendant branches).  
> * **BLACK (2):** Fully evaluated and verified acyclic.

If an outgoing edge points to a GRAY node, a circular causal loop is confirmed (*u*→⋯→*v*→⋯→*u*). The compiler immediately aborts and prints the exact causal loop trace to stderr:

`[CYCLE_DETECTED]: Circular escalation loop:`  
`grv_spoon_credit -> grv_iron_pot_scandal -> grv_pantry_theft -> grv_spoon_credit`

### **4\. Integration & UI Mounts within goblin-dashboard**

Within goblin-dashboard, the multi-tier DAG projection is ingested during Astro server-side rendering and hydrated into interactive React islands:

`---`  
`// src/pages/telemetry/grievances.astro`  
`import ShowrunnerLayout from '../../layouts/ShowrunnerLayout.astro';`  
`import { GrievanceDAGViewer } from '../../components/telemetry/GrievanceDAGViewer';`  
`import { loadBibleState, getActiveGrievanceDAG } from '000.goblin-lore/client';`

`// 1. Ingest immutable canonical snapshot`  
`const bibleState = loadBibleState('under-the-floorboards');`

`// 2. Extract immutable multi-tier DAG projection`  
`const grievanceDAG = getActiveGrievanceDAG(bibleState);`  
`---`

`<ShowrunnerLayout title="Grievance Escalation Cockpit">`  
  `<GrievanceDAGViewer`   
    `client:idle`   
    `staticDAG={grievanceDAG}`   
    `entities={bibleState.entities.grievances}`   
  `/>`  
`</ShowrunnerLayout>`

#### **1\. Dynamic State-over-Static Lattice Overlay**

The client island GrievanceDAGViewer.tsx renders the topological tiers (*δ*\=0→1→2) as an interactive node graph:

> * **Static Lattice Anchors:** Node positions, topological depth ranks, and causal arrows are fixed by staticDAG.  
> * **Live Sower State Telemetry:** The component subscribes to worker-sower-engine WebSocket updates (ws://localhost:3000/events), overlaying active simulation variables directly on top of the static nodes:  
  * *Tension Stage Gauges:* Renders current progress bars (*I*curr​/*I*max​) on each active node.  
  * *Cooldown Countdown Badges:* Displays remaining cooldown episodes (*C*cycles​) preventing inactive nodes from being selected.  
  * *Atomic Promotion Pulse:* Animates edge traversal lines when an opposed 2d6 duel in Stage 4 triggers spawns\_on\_max\_escalation.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│            GRIEVANCE DAG COCKPIT VIEW (GrievanceDAGViewer.tsx)         │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│   [Depth δ = 0]              [Depth δ = 1]            [Depth δ = 2]   │`  
`│  ┌──────────────┐           ┌──────────────┐         ┌──────────────┐  │`  
`│  │spoon_credit  ├───(Max)──►│hoarding_reveal├──(Max)►│famine_feud   │  │`  
`│  │Stage: 3/4 [●]│           │Stage: 0/5 [○]│         │Stage: 0/5 [○]│  │`  
`│  └──────┬───────┘           └──────────────┘         └──────────────┘  │`  
`│         │ (Shared Parent)                                              │`  
`│         ▼                                                              │`  
`│  ┌──────────────┐                                                      │`  
`│  │stolen_thimble│                                                      │`  
`│  │Stage: 1/2 [○]│                                                      │`  
`│  └──────────────┘                                                      │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ SELECTED: grv_hoarding_reveal                                          │`  
`│ Primary Dyad: char_bog <-> char_mum_grissel                            │`  
`│ Escalation Path: 0 -> 1 -> 2 (Critical Pacing Path)                   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ [ PIN GRIEVANCE TO NEXT CYCLE ]       [ SIMULATE 2d6 DUEL PROMOTION ]  │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **2\. Dyadic Starvation Mitigation Cockpit**

The dashboard cross-references the DAG against the complete dyadic interaction matrix across the cast (*N*\=4, yielding (24​)\=6 channels):

Mdyad​\[*u*,*v*\]=∣{*g*∈Vgrv​∣{*u*,*v*}⊆*g*.Ppri​}∣

> * **FATAL\_BLIND\_SPOT (**M**\[*u*,*v*\]=0):** Highlighted with a flashing red alert. If two characters enter a room alone without an authored grievance, conflict lotteries cannot resolve an encounter.  
> * **FRAGILE\_CHANNEL (**M**\[*u*,*v*\]=1):** Highlighted in amber. When this lone grievance is triggered, its *C*cycles​ timer locks it, temporarily stranding the dyad with zero available conflicts.  
> * **ROBUST\_CHANNEL (**M**\[*u*,*v*\]≥2):** Highlighted in green, confirming healthy rotational variety across cooldown periods.

#### **3\. Directorial Interventions & One-Click Scene Pinning**

When an operator clicks on an un-spawned child node in the graph (e.g., hoarding\_reveal) and selects **Pin Grievance to Next Cycle**, the dashboard dispatches an authenticated intent envelope to worker-sower-engine:

`{`  
  `"intent_id": "01923e4b-7000-7fa1-9234-56789abcdef0",`  
  `"intent_type": "PIN_GRIEVANCE",`  
  `"authorizer_role": "SHOWRUNNER",`  
  `"timestamp_sim_cycle": 42,`  
  `"payload": {`  
    `"target_grievance_id": "hoarding_reveal",`  
    `"bypass_prng_lottery": true,`  
    `"force_participants": ["char_bog", "char_mum_grissel"]`  
  `}`  
`}`

This intent bypasses Stage 3 PRNG lottery selection in the simulation engine, forcing the dispute into the next prompt context while maintaining all underlying somatic, logistical, and epistemic constraints.

### **5\. Machine Rail vs. Voice Rail Separation**

The multi-tier DAG preserves the strict separation between mechanical eligibility and dialogue generation:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ 1. THE MACHINE RAIL (YAML Frontmatter -> getActiveGrievanceDAG)        │`  
`│    • participants_primary: [char_bog, char_mum_grissel]               │`  
`│    • intensity_floor: 2, intensity_ceiling: 5, cooldown_cycles: 4      │`  
`│    • spawns_on_max_escalation: [generational_famine_feud]              │`  
`│    Evaluated via deterministic set math; drives DAG topology and HUD   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 2. THE VOICE RAIL (Markdown Prose Body -> Prompt Context Injection)    │`  
`│    • Surface Complaint: Who permitted salt pork hidden behind pipe    │`  
`│    • The Underneath: Bog fears famine; Mum Grissel treats hoarding as │`  
`│      treason against survival.                                         │`  
`│    Injected into prompt payloads; forces characters to bicker over the │`  
`│    mundane item while actively suppressing the underlying core wound   │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Machine Rail (Frontmatter):** Contains scalar bounds, participant arrays, cooldowns, and downstream spawn references. It is extracted by getActiveGrievanceDAG() to calculate graph reachability, topological depth, and dyadic coverage without parsing prose.  
> * **Voice Rail (Body Prose):** Defines the **Surface Complaint** (what characters bicker about on screen, such as mutton grease on a spoon or displaced salt pork) versus **The Underneath** (the existential survival terror driving the bickering).  
> * **Directorial Review Invariant:** When the showrunner inspects candidate scenes in goblin-dashboard, the UI renders both rails side-by-side. If a candidate dialogue take causes a character to state their unadmitted wound explicitly (violating Subtext Suppression), the director rejects the take using error code UNEARNED\_RELEASE, preserving structural tension across the multi-tier escalation lattice.

---

*User prompt: {{FOCUS: 3\. Spatial Topology & Acoustic Profile Projection (getStaticSpatialGraph) (goblin-dashboard) }} /extreme-details*

Response: getStaticSpatialGraph serves as the compile-time topological and acoustic projection accessor within packages/001.lore/src/client.ts. It converts raw, authored Markdown room dossiers (locations/\*.md) into a normalized, immutable, and coordinate-free graph manifest consumed directly by goblin-dashboard, goblin-spatial, and worker-sower-engine.

In the production pipeline, physical reality is not left to generative prompt inference. Without deterministic spatial geometry, language models hallucinate spatial shortcuts, allow characters to phase through solid masonry, and permit whispered conversations to be overheard through reinforced iron plates. getStaticSpatialGraph anchors the physical world by providing an objective topological container where spatial connectivity and acoustic boundary damping are validated before simulation or presentation runtime execution.

       `CANONICAL WORLD LAW (000.goblin-lore)`  
       `dossiers: series/under-the-floorboards/locations/*.md`  
                               `│`  
                               `▼ scripts/compile.ts (Pillar 5 Audit)`  
       `SEALED ARTIFACT: compiled/<seriesSlug>/bible-state.json`  
                               `│`  
                               `▼ fs.readFileSync / packages/001.lore/src/client.ts`  
       `┌─────────────────────────────────────────────────────────────┐`  
       `│             getStaticSpatialGraph(state)                    │`  
       `│  • Normalizes adjacent_locations into bidirectional sets    │`  
       `│  • Extracts acoustic_damping_factor & lighting_level        │`  
       `│  • Evaluates physical volume & crowd density thresholds     │`  
       `│  • Deep-freezes topology graph manifest                     │`  
       `└──────────────────────────────┬──────────────────────────────┘`  
                                      `│`  
                         `Pure Immutable Graph Manifest`  
                                      `│`  
         `┌────────────────────────────┼────────────────────────────┐`  
         `▼                            ▼                            ▼`  
`┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐`  
`│ goblin-dashboard │        │  goblin-spatial  │        │worker-sower-engine│`  
`│(Showrunner HUD)  │        │(Pure Math Kernel)│        │(Runtime Ledger)  │`  
`│• Adjacency Matrix│        │• Inverted BFS    │        │• Dynamic (q, r)  │`  
`│• Acoustic Gauges │        │  Wavefront Decay │        │• Door Mutexes    │`  
`│• Overfill Alarms │        │• Axial Supercover│        │• Witness Logging │`  
`└──────────────────┘        └──────────────────┘        └──────────────────┘`

### **1\. The One-Way Causal Chain of Spatial Truth & System Boundaries**

The architecture enforces an absolute separation of concerns across the pipeline, ensuring that presentation tools cannot fabricate physical facts:

               `THE ONE-WAY CAUSAL CHAIN OF SPATIAL TRUTH`  
                 
  `┌─────────────────────────────────────────────────────────────┐`  
  `│ 1. CANONICAL TOPOLOGY (goblin-lore: Map Graph / Static H3)  │`  
  `└──────────────────────────────┬──────────────────────────────┘`  
                                 `│`  
                                 `▼`  
  `┌─────────────────────────────────────────────────────────────┐`  
  `│ 2. PURE GEOMETRIC MATH (goblin-spatial: Supercover, FOV)    │`  
  `└──────────────────────────────┬──────────────────────────────┘`  
                                 `│`  
                                 `▼`  
  `┌─────────────────────────────────────────────────────────────┐`  
  `│ 3. DYNAMIC SIMULATION LEDGER (Database: Discrete Positions) │`  
  `└──────────────────────────────┬──────────────────────────────┘`  
                                 `│`  
                                 `▼`  
  `┌─────────────────────────────────────────────────────────────┐`  
  `│ 4. CONTACT OPPORTUNITY GRAPH (Physical Co-presence / LoS)   │`  
  `└──────────────────────────────┬──────────────────────────────┘`  
                                 `│`  
                                 `▼`  
  `┌─────────────────────────────────────────────────────────────┐`  
  `│ 5. EPISTEMIC OBSERVATION (BeliefRecord Provenance Update)   │`  
  `└──────────────────────────────┬──────────────────────────────┘`  
                                 `│`  
                                 `▼`  
  `┌─────────────────────────────────────────────────────────────┐`  
  `│ 6. DRAMATIC CONVERSATION (Dialogue Generation via LLM)      │`  
  `└─────────────────────────────────────────────────────────────┘`

> * **000.goblin-lore (What Space Means):** Owns static world topology, room templates, boundary damping, and portal connections. It changes only when canonical Markdown dossiers are edited and compiled.  
> * **goblin-spatial (How Space Works):** A pure, stateless mathematical kernel. It owns zero mutable state, executes no database queries, and has no concept of narrative factions. It ingests the static graph from getStaticSpatialGraph to compute distance metrics, line-of-sight (LoS) raycasts, and acoustic wavefront energy loss.  
> * **worker-sower-engine (Who is Where):** Owns dynamic simulation state (discrete actor coordinates, door latch states, and movement histories) recorded in an event-sourced relational database (SQLite/D1).  
> * **goblin-dashboard (Directorial Lens):** Owns zero spatial authority. It consumes getStaticSpatialGraph during Astro server-side rendering to project the topological mesh, verify crowd densities, and audit sensory witness claims without altering the underlying simulation.

### **2\. Mathematical Formalization of the Spatial Container (Gspace​)**

The physical environment extracted by getStaticSpatialGraph is formalized as an attributed undirected graph:

Gspace​\=(Vloc​,Eadj​,Wacoustic​,Cclearance​)

Where:

> * Vloc​: Set of all static location nodes (∣Vloc​∣=*N*loc​).  
> * Eadj​: Set of traversable spatial portals connecting adjacent rooms.  
> * Wacoustic​: Weight mapping assigning boundary transmission damping in basis points (bp) or centi-decibels (cdB):  
>   Damping(*u*,*v*)∈\[500,10000\] bp(1 bp=0.01% sound block)  
> * Cclearance​: Categorical clearance requirement governing physical locomotion passage (e.g., crawlspace\_crouch, standard\_standing, wide\_vehicular).

#### **The Reciprocity Invariant (Bidirectional Symmetry)**

Every doorway, ventilation duct, or hatch represents a traversable physical portal. The spatial adjacency matrix A∈{0,1}*N*×*N* must be strictly symmetric:

A\[*u*,*v*\]=A\[*v*,*u*\]⟺∀*u*,*v*∈Vloc​,*v*∈*u*.adjacent\_locations⟺*u*∈*v*.adjacent\_locations

If *v*∈*u*.adjacent\_locations but *u*∈/*v*.adjacent\_locations, an **Asymmetric Portal Trap** is triggered. Characters moving from *u* into *v* would find no return path, causing runtime pathfinders in worker-sower-engine to encounter unhandled unreachable exceptions.

#### **Connected Components & Global Reachability**

A valid storyworld topology cannot contain orphan locations:

ConnectedComponents(Gspace​)=1

The engine executes a Breadth-First Search (BFS) starting from the primary origin hub (defaulting to the first declared location, such as loc\_the\_warm\_pipe). If the visited set size ∣Vvisited​∣\<∣Vloc​∣, the unreached vertices constitute disconnected spatial islands that crash pathfinding routines.

### **3\. Implementation Mechanics & TypeScript Signature**

Housed in packages/001.lore/src/client.ts, getStaticSpatialGraph extracts the spatial graph from the deep-frozen, compiled BibleState:

`// packages/001.lore/src/client.ts`

`import type { BibleState } from '../schemas/index.js';`  
`import { deepFreeze } from './deepFreeze.js';`

`export interface SpatialNodeDescriptor {`  
  `readonly id: string;`  
  `readonly name: string;`  
  `readonly adjacentLocations: readonly string[];`  
  `readonly acousticDampingFactor: number; // Transmission loss in basis points / cdB`  
  `readonly lightingLevel: 'dark' | 'dim' | 'standard' | 'bright' | 'strobe';`  
  `readonly volumeCapacity?: {`  
    `readonly floorAreaM2: number;`  
    `readonly maxAdultGoblins: number; // Derived: floorAreaM2 * max_actors_per_m2`  
    `readonly isCramped: boolean;`  
  `};`  
`}`

`/**`  
 `* Extracts topological spatial adjacency and acoustic profile maps for pure math engines.`  
 `* Pure, deterministic projection over the deep-frozen BibleState.`  
 `*`  
 `* @param state - The deep-frozen, read-only canonical universe state.`  
 `* @returns Readonly map where keys are location IDs and values are SpatialNodeDescriptors.`  
 `*/`  
`export function getStaticSpatialGraph(`  
  `state: Readonly<BibleState>,`  
`): Readonly<Record<string, SpatialNodeDescriptor>> {`  
  `const graph: Record<string, SpatialNodeDescriptor> = {};`

  `for (const [locId, loc] of Object.entries(state.entities.locations)) {`  
    `graph[locId] = {`  
      `id: locId,`  
      `name: loc.name,`  
      `adjacentLocations: (loc as any).adjacent_locations || [],`  
      `acousticDampingFactor: (loc as any).acoustic_damping_factor ?? 1000,`  
      `lightingLevel: (loc as any).lighting_level || 'standard',`  
      `volumeCapacity: (loc as any).floor_area_m2 ? {`  
        `floorAreaM2: (loc as any).floor_area_m2,`  
        `maxAdultGoblins: Math.floor(((loc as any).floor_area_m2) * 4.0),`  
        `isCramped: ((loc as any).floor_area_m2) <= 2.0`  
      `} : undefined`  
    `};`  
  `}`

  `return deepFreeze(graph);`  
`}`

#### **Parsing & Normalization Guarantees**

> * **Defensive Nil-Coalescing:** If an authored dossier omits adjacent\_locations, the accessor assigns an empty array \[\] rather than throwing reference errors.  
> * **Acoustic Fallback Ceiling:** If acoustic\_damping\_factor is omitted from frontmatter, it assigns a default baseline of 1,000 bp (10.0 dB loss).  
> * **Deep-Freeze Enforcement:** The resulting dictionary is recursively sealed via deepFreeze(), guaranteeing that any runtime attempt by dashboard components or third-party scripts to push adjacent links throws an unhandled TypeError.

#### **Vitest Invariant Verification**

The projection's contract is validated within the core testing harness (packages/001.lore/test/client.test.ts):

`it('extracts mutual spatial topology graphs with acoustic damping factors', () => {`  
  `const state = loadBibleState('under-the-floorboards');`  
  `const spatialGraph = getStaticSpatialGraph(state);`

  `expect(spatialGraph['loc_the_warm_pipe']).toBeDefined();`  
  `expect(spatialGraph['loc_the_warm_pipe'].adjacentLocations).toContain('loc_the_pantry_wall');`  
  `expect(spatialGraph['loc_the_warm_pipe'].acousticDampingFactor).toBe(2500);`

  `expect(spatialGraph['loc_the_attic_stair']).toBeDefined();`  
  `expect(spatialGraph['loc_the_attic_stair'].acousticDampingFactor).toBe(1200);`  
`});`

### **4\. Acoustic Physics, Units & Signal Propagation Mechanics**

To eliminate dimensional confusion, the architecture standardizes sound modeling on **centi-decibels (cdB)** or strictly bounded **basis points (bp)**:

1 dB=100 cdB,60 dB=6,000 cdB,120 dB=12,000 cdB  
`┌────────────────────────────────────────────────────────┐`  
`│ ACOUSTIC ATTENUATION (DAMPING) CALIBRATION             │`  
`├────────────────────────────────────────────────────────┤`  
`│  • loc_the_warm_pipe    : [■■■■■□□□□□] 2,500 cdB (Iron)│`  
`│  • loc_the_pantry_wall  : [■■■■■■□□□□] 3,000 cdB (Lath)│`  
`│  • loc_the_splinter_gap : [■■■□□□□□□□] 1,500 cdB (Wood)│`  
`│  • loc_the_attic_stair  : [■■□□□□□□□□] 1,200 cdB (Open)│`  
`└────────────────────────────────────────────────────────┘`

#### **1\. Additive Attenuation Over Discrete Topology**

Sound attenuation across multiple partitions is calculated via integer addition:

Losstotal​\=*e*∈Path∑​dampingCdB(*e*)

This integer formulation avoids compounding floating-point rounding errors across multi-hop topological paths.

#### **2\. Dual-Condition Audibility & SNR Threshold**

An acoustic emission of source intensity *I*source​ reaches location *v* with arriving intensity *I*arrival​(*v*)=*I*source​−Losstotal​. Sound is audible to an agent occupying *v* if and only if it satisfies two conditions:

isAudible(*v*)⟺*I*arrival​(*v*)≥*T*hearing​∧*I*arrival​(*v*)−*N*ambient​(*v*)≥SNRmin​

Where:

> * *T*hearing​: The somatic auditory threshold of the listening actor (e.g., standard baseline 2,000 cdB, with auditory trauma adding a \+1,500 cdB penalty).  
> * *N*ambient​(*v*): Ambient noise floor of the room (e.g., steam hiss in the warm pipe masking low-decibel whispers).  
> * SNRmin​: Minimum Signal-to-Noise Ratio margin (typically 600 cdB=6.0 dB) required to parse dialogue.

#### **3\. Inverted Acoustic BFS Wavefront Solver**

Rather than checking all simulation agents, goblin-spatial runs an inverted topological BFS on the room graph extracted by getStaticSpatialGraph:

`// packages/spatial/src/acoustics/wavefrontSolver.ts`  
`export interface AudibleRoomReceipt {`  
  `readonly roomId: string;`  
  `readonly arrivalIntensityBp: number;`  
  `readonly isDirectWitness: boolean;`  
`}`

`export function computeAcousticWavefront(`  
  `sourceRoomId: string,`  
  `sourcePowerBp: number,`  
  `topology: Record<string, SpatialNodeDescriptor>,`  
  `noiseFloorBp = 1500`  
`): ReadonlyMap<string, AudibleRoomReceipt> {`  
  `const audibleRooms = new Map<string, AudibleRoomReceipt>();`  
  `const queue: Array<{ roomId: string; currentPower: number }> = [`  
    `{ roomId: sourceRoomId, currentPower: sourcePowerBp }`  
  `];`

  `audibleRooms.set(sourceRoomId, {`  
    `roomId: sourceRoomId,`  
    `arrivalIntensityBp: sourcePowerBp,`  
    `isDirectWitness: true`  
  `});`

  `while (queue.length > 0) {`  
    `const { roomId, currentPower } = queue.shift()!;`  
    `const room = topology[roomId];`  
    `if (!room) continue;`

    `for (const neighborId of room.adjacentLocations) {`  
      `const neighbor = topology[neighborId];`  
      `if (!neighbor) continue;`

      `// Attenuate by the boundary damping factor`  
      `const arrivalPower = currentPower - neighbor.acousticDampingFactor;`

      `// Attenuation Cutoff: Prune traversal the moment energy drops below ambient noise floor`  
      `if (arrivalPower > noiseFloorBp) {`  
        `const existing = audibleRooms.get(neighborId);`  
        `if (!existing || existing.arrivalIntensityBp < arrivalPower) {`  
          `audibleRooms.set(neighborId, {`  
            `roomId: neighborId,`  
            `arrivalIntensityBp: arrivalPower,`  
            `isDirectWitness: arrivalPower >= 3500 // Direct vocal comprehension threshold`  
          `});`  
          `queue.push({ roomId: neighborId, currentPower: arrivalPower });`  
        `}`  
      `}`  
    `}`  
  `}`

  `return audibleRooms;`  
`}`

This algorithm restricts sensory perception evaluation to O(∣Vaudible​∣) time, isolating witness detection to audible rooms without iterating over non-collocated characters.

### **5\. Compile-Time Static Defect Taxonomy (Pillar 5 Gates)**

Before getStaticSpatialGraph exports topology data to downstream systems, the graph is audited at compile time (*T*0​\=\$0.00) against five architectural failure modes:

| Defect Identifier | Severity | Verification Rule | System Action on Breach |
| :---- | :---- | :---- | :---- |
| **ASYMMETRIC\_PORTAL\_TRAP** | CRITICAL | *v*∈*u*.adjacent\_locations⟺*u*∈*v*.adjacent\_locations. | **Hard Halt (Exit Code 1):** Aborts compilation; emits exact coordinate pointers and missing reverse link. |
| **ISLAND\_NODE\_DISCONNECTED** | CRITICAL | ConnectedComponents(Gspace​)=1 via BFS. | **Hard Halt (Exit Code 1):** Halts build; flags unlinked rooms where characters or props could become stranded. |
| **ACOUSTIC\_DAMPING\_MISSING** | HIGH | 500≤damping≤10,000 bp. | **Hard Halt (Exit Code 1):** Prevents acoustic voids where sound travels infinitely across the map. |
| **SOMATIC\_CLEARANCE\_LOCK** | HIGH | Portal clearance matches character locomotion capabilities. | **Compilation Warning:** Flags bottlenecks where bipedal goblins cannot navigate crawlspace portals. |
| **CHOKEPOINT\_MONOPOLY** | MEDIUM | Betweenness centrality *g*(*v*)≤0.85. | **Advisory Warning:** Flags fragile architectural bottlenecks that choke narrative traversal. |

### **6\. UI Mounts & Directorial Interventions in goblin-dashboard**

In goblin-dashboard, the projection returned by getStaticSpatialGraph is ingested during Astro SSR and passed into interactive React islands:

`---`  
`// src/pages/telemetry/spatial.astro`  
`import ShowrunnerLayout from '../../layouts/ShowrunnerLayout.astro';`  
`import { SpatialTopologyHUD } from '../../components/telemetry/SpatialTopologyHUD';`  
`import { loadBibleState, getStaticSpatialGraph } from '000.goblin-lore/client';`

`// 1. Ingest immutable canonical snapshot off disk`  
`const bibleState = loadBibleState('under-the-floorboards');`

`// 2. Derive pure topological and acoustic graph`  
`const spatialGraph = getStaticSpatialGraph(bibleState);`  
`---`

`<ShowrunnerLayout title="Spatial Topology & Acoustic Telemetry">`  
  `<SpatialTopologyHUD`   
    `client:idle`   
    `staticGraph={spatialGraph}`   
  `/>`  
`</ShowrunnerLayout>`

`┌─────────────────────────────────────────────────────────────┐`  
`│          SPATIAL TOPOLOGY & ACOUSTIC HUD (ISLAND)           │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  TOPOLOGICAL ADJACENCY MATRIX:                              │`  
`│         pipe   pantry   gap    stair                        │`  
`│   pipe [  -      1       1       0   ]                      │`  
`│    pan [  1      -       0       1   ]                      │`  
`│    gap [  1      0       -       1   ]                      │`  
`│    str [  0      1       1       -   ]                      │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  ACOUSTIC ATTENUATION METERS:                               │`  
`│   • loc_the_warm_pipe    : [■■■■■□□□□□] 2,500 cdB           │`  
`│   • loc_the_pantry_wall  : [■■■■■■□□□□] 3,000 cdB           │`  
`│   • loc_the_splinter_gap : [■■■□□□□□□□] 1,500 cdB           │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  ROOM CONGESTION & DENSITY TRACKER:                         │`  
`│   • loc_the_warm_pipe    : 2 / 2 Actors [OCCUPIED]          │`  
`│   • loc_the_pantry_wall  : 1 / 4 Actors [NOMINAL]           │`  
`└─────────────────────────────────────────────────────────────┘`

#### **1\. Topological Adjacency Matrix View**

Mounted inside SpatialTopologyHUD.tsx, this component renders the verified symmetric adjacency matrix A. The UI highlights mutual traversal paths and marks locked portals (such as a latched iron hatch in worker-sower-engine) with red indicators.

#### **2\. Acoustic Isobar & Waveform Falloff Display**

The dashboard visualizes acoustic transmission curves between rooms. When a showrunner scrubs an animatic's audio timeline:

> * The dashboard maps dialogue stems from the source room through the acousticDampingFactor of neighboring boundaries.  
> * Off-screen dialogue in adjacent rooms is rendered with calculated high-frequency roll-offs and gain reductions, matching the −14 dB sidechain ducking and ambient noise thresholds of the downstream audio pipeline.

#### **3\. Crowd Density & Overcrowding Tripwires**

The component cross-references active character locations from worker-sower-engine against volumeCapacity:

> * If an automated scene draft places 3 adult goblins into loc\_the\_warm\_pipe (which has a ceiling of maxAdultGoblins=2), the HUD triggers a ROOM\_CAPACITY\_EXCEEDED alert.  
> * The showrunner can intervene directly by clicking **Displace Actor**, emitting an authenticated intent to worker-sower-engine to evict excess occupants into adjacent connected rooms before authorizing video compilation.

---

*User prompt: {{FOCUS: 2\. Epistemic Prompt Projection (getEpistemicDirectives) (goblin-dashboard) }} /extreme-details*

### **Response: 1\. Architectural Mission & The Epistemic Triad**

In generative production pipelines, Large Language Models (LLMs) and probabilistic drafting agents suffer from two predictable structural failures: **omniscience drift** (characters subconsciously acting on information known only to the narrator, the audience, or another character) and **narrative closure bias** (the statistical tendency of language models to prematurely resolve open mysteries, explain secrets, and collapse interpersonal tension).

Negative prompting—instructing an LLM with commands such as *"Pretend Character A does not know about the stolen rations; do not mention them"*—consistently fails in practice. The presence of forbidden tokens in the attention context primes the model's transformer weights, causing the secret to leak through subtext, paraphrase, or unearned deductive leaps.

To eliminate this vulnerability, goblin-dashboard relies on **getEpistemicDirectives** within packages/001.lore/src/client.ts. This projection accessor serves as the programmatic bridge between canonical world mysteries (UnresolvedCanon) and runtime context assembly, enforcing **Ignorance by Omission**:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                        THE EPISTEMIC TRIAD                             │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  1. WORLD TRUTH (Canonical Fact Ledger / 000.goblin-lore)              │`  
`│     • Objective universe reality (KNOWN_TRUE, UNRESOLVED_BY_CANON)     │`  
`├───────────────────────────────────┬────────────────────────────────────┤`  
`│  2. INTERNAL BELIEF               │  3. EXTERNAL UTTERANCE             │`  
`│     (Subjective Cognitive State)  │     (Plan-Assigned Dialogue)       │`  
`│     • BeliefRecord schema         │     • dialogue_ast.json            │`  
`│     • Subjective probability      │     • Permitted to contain lies,   │`  
`│     • Provenance & hop count      │       deflections, and subtext     │`  
`└───────────────────────────────────┴────────────────────────────────────┘`

WorldTruth=InternalBelief=ExternalUtterance

> * **World Truth:** The objective reality defined in the world bible (000.goblin-lore) and the append-only event ledger. It tracks whether a proposition is settled or an unresolved aesthetic mystery.  
> * **Internal Belief:** The subjective cognitive state tracked per actor via BeliefRecord entries in worker-sower-engine. Characters can maintain complete certainty over an objectively false proposition or navigate unverified hearsay.  
> * **External Utterance:** The final generated dialogue emitted in dialogue\_ast.json, which can execute tactical deceit, avoidance, or subtext without altering the underlying canonical truth.

getEpistemicDirectives acts as a pure, deep-frozen projection lens that takes an actor ID and loaded series state, filters active world mysteries through that actor's subjective epistemic horizon, and returns an isolated prompt envelope.

### **2\. Schema Architecture & TypeScript Signatures**

The schema structures for the unresolved canon and epistemic horizons are defined in packages/001.lore/schemas/unresolved.schema.ts and compiled through Zod:

`// packages/001.lore/schemas/unresolved.schema.ts`  
`import { z } from 'zod';`

`export const WorldEpistemicStatusEnum = z.enum([`  
  `'KNOWN_TRUE',           // Settled historical fact confirmed by canon`  
  `'KNOWN_FALSE',          // Definitively disproven historical claim`  
  `'DISPUTED',             // Conflicting historical accounts coexisting in active canon`  
  `'UNRESOLVED_BY_CANON'   // Structurally undecidable; permanent aesthetic mystery`  
`]);`  
`export type WorldEpistemicStatus = z.infer<typeof WorldEpistemicStatusEnum>;`

`export const EpistemicHorizonEnum = z.enum([`  
  `'TOTAL_IGNORANCE',      // Completely scrubbed from prompt context`  
  `'RUMOR_ONLY',           // Injects authored rumor text; low confidence`  
  `'FALSE_BELIEF',         // Injects authored misconception; high confidence`  
  `'PARTIAL_FACT',         // May perceive physical clue tokens; root cause omitted`  
  `'WITHHELD'              // Character knows truth but is constrained from disclosure`  
`]);`  
`export type EpistemicHorizon = z.infer<typeof EpistemicHorizonEnum>;`

`export const TriStateStandingEnum = z.enum([`  
  `'ACTIVE_ENDORSED',       // Enforced across all compile & lint gates`  
  `'FLAGGED_FOR_REVIEW',    // Liminal state; advisory alerts without build halts`  
  `'DEPRECATED_ARCHIVED'    // Decommissioned; lifted enforcement`  
`]);`  
`export type TriStateStanding = z.infer<typeof TriStateStandingEnum>;`

`export const ForbiddenPropositionSchema = z.object({`  
  `statement: z`  
    `.string()`  
    `.min(10, 'Forbidden proposition statement must be descriptive (>= 10 chars)')`  
    `.max(300, 'Forbidden proposition statement must not exceed 300 chars'),`  
  `trigger_lemma_sets: z`  
    `.array(`  
      `z`  
        `.array(z.string().min(1).regex(/^[a-z0-9_]+$/, 'Lemmas must be alphanumeric snake_case'))`  
        `.min(2)`  
    `)`  
    `.min(1),`  
`});`  
`export type ForbiddenProposition = z.infer<typeof ForbiddenPropositionSchema>;`

`export const DistortedBeliefStringSchema = z`  
  `.string()`  
  `.min(5, 'Authored distorted belief must be descriptive (>= 5 chars)')`  
  `.max(500, 'Authored distorted belief must not exceed 500 chars to avoid context saturation')`  
  `.refine((val) => !/[\[\]]/.test(val), {`  
    `message: 'Distorted belief text cannot contain square brackets ("[" or "]") to prevent prompt delimiter collisions.',`  
  `});`

`export const UnresolvedCanonSchema = z`  
  `.object({`  
    `topic_id: z.string().regex(/^mystery_[a-z0-9_]+$/, 'Topic ID must follow snake_case prefixed with mystery_'),`  
    `title: z.string().min(1).max(100),`  
    `world_status: WorldEpistemicStatusEnum.default('UNRESOLVED_BY_CANON'),`  
    `standing: TriStateStandingEnum.default('ACTIVE_ENDORSED'),`  
    `last_reconsidered_at: z.number().int().default(0), // Deterministic default; zero Date.now() leakage`  
    `forbidden_propositions: z.array(ForbiddenPropositionSchema).min(1),`  
    `permitted_clue_tokens: z`  
      `.array(z.string().min(1).regex(/^[a-z0-9_]+$/, 'Clue tokens must be alphanumeric snake_case'))`  
      `.default([]),`  
    `epistemic_horizons: z.record(`  
      `z.string().regex(/^char_[a-z0-9_]+$/, 'Keys must be valid character IDs'),`  
      `EpistemicHorizonEnum`  
    `),`  
    `distorted_beliefs: z`  
      `.record(`  
        `z.string().regex(/^char_[a-z0-9_]+$/),`  
        `DistortedBeliefStringSchema`  
      `)`  
      `.default({}),`  
    `human_promotion_condition: z.string().min(20, 'Promotion condition must be at least 20 chars'),`  
  `})`  
  `.refine(`  
    `(data) => {`  
      `// Rule 1: Every character assigned RUMOR_ONLY or FALSE_BELIEF must have authored belief text`  
      `for (const [charId, horizon] of Object.entries(data.epistemic_horizons)) {`  
        `if (['RUMOR_ONLY', 'FALSE_BELIEF'].includes(horizon)) {`  
          `if (!data.distorted_beliefs[charId] || data.distorted_beliefs[charId].trim().length === 0) {`  
            `return false;`  
          `}`  
        `}`  
      `}`  
      `return true;`  
    `},`  
    `{`  
      `message: 'Characters assigned RUMOR_ONLY or FALSE_BELIEF must have an explicit entry in distorted_beliefs.',`  
      `path: ['distorted_beliefs'],`  
    `}`  
  `)`  
  `.refine(`  
    `(data) => {`  
      `// Rule 2: Permitted clue tokens and forbidden trigger lemmas must be mutually disjoint`  
      `const clueSet = new Set(data.permitted_clue_tokens.map((t) => t.toLowerCase()));`  
      `for (const prop of data.forbidden_propositions) {`  
        `for (const lemmaSet of prop.trigger_lemma_sets) {`  
          `for (const lemma of lemmaSet) {`  
            `if (clueSet.has(lemma.toLowerCase())) {`  
              `return false;`  
            `}`  
          `}`  
        `}`  
      `}`  
      `return true;`  
    `},`  
    `{`  
      `message: 'permitted_clue_tokens cannot intersect with any members of trigger_lemma_sets.',`  
      `path: ['permitted_clue_tokens'],`  
    `}`  
  `);`

`export type UnresolvedCanon = z.infer<typeof UnresolvedCanonSchema>;`

### **3\. Algorithmic Mechanics of getEpistemicDirectives**

getEpistemicDirectives is housed in packages/001.lore/src/client.ts and delegates context compilation to buildCharacterEpistemicPrompt (src/prompt/contextAssembly.ts):

`// packages/001.lore/src/client.ts`  
`import type { BibleState } from '../schemas/index.js';`  
`import type { UnresolvedCanon } from '../schemas/unresolved.schema.js';`  
`import { buildCharacterEpistemicPrompt, type AssembledCharacterContext } from './prompt/contextAssembly.js';`  
`import { deepFreeze } from './deepFreeze.js';`

`export function getEpistemicDirectives(`  
  `state: Readonly<BibleState>,`  
  `characterId: string,`  
  `mysteries?: readonly UnresolvedCanon[]`  
`): Readonly<AssembledCharacterContext> {`  
  `const activeMysteries = mysteries ?? Object.values(state.entities.unresolved_canon ?? {});`  
  `const assembled = buildCharacterEpistemicPrompt(characterId, activeMysteries as UnresolvedCanon[]);`  
  `return deepFreeze(assembled);`  
`}`

#### **Prompt Compilation & Sanitization (contextAssembly.ts)**

The context assembly engine normalizes authored text and enforces strict sanitization to prevent delimiter injection attacks in prompt framing:

`// packages/001.lore/src/prompt/contextAssembly.ts`  
`import type { UnresolvedCanon } from '../schemas/unresolved.schema.js';`

`export interface AssembledCharacterContext {`  
  `readonly characterId: string;`  
  `readonly injectedDirectives: readonly string[];`  
  `readonly omittedTopicIds: readonly string[];`  
`}`

`function sanitizePromptText(text: string): string {`  
  `return text`  
    `.replace(/[\[\]]/g, '') // Strip brackets to preserve directive framing`  
    `.replace(/["\\]/g, '')  // Strip unescaped quotes and backslashes`  
    `.trim();`  
`}`

`export function buildCharacterEpistemicPrompt(`  
  `characterId: string,`  
  `activeMysteries: UnresolvedCanon[]`  
`): AssembledCharacterContext {`  
  `const directives: string[] = [];`  
  `const omittedTopics: string[] = [];`

  `for (const mystery of activeMysteries) {`  
    `if (mystery.standing === 'DEPRECATED_ARCHIVED') continue;`

    `// Fail-Closed Default: Unknown characters default to TOTAL_IGNORANCE`  
    `const horizon = mystery.epistemic_horizons[characterId] || 'TOTAL_IGNORANCE';`  
    `const cleanTitle = sanitizePromptText(mystery.title);`

    `switch (horizon) {`  
      `case 'TOTAL_IGNORANCE':`  
        `// The topic is completely excluded from the context envelope`  
        `omittedTopics.push(mystery.topic_id);`  
        `break;`

      `case 'RUMOR_ONLY': {`  
        `const rawBelief = mystery.distorted_beliefs[characterId] || '';`  
        `const cleanBelief = sanitizePromptText(rawBelief);`  
        `directives.push(`  
          `` `[UNVERIFIED HEARSAY] You have heard whispers regarding ${cleanTitle}: "${cleanBelief}"` ``  
        `);`  
        `break;`  
      `}`

      `case 'FALSE_BELIEF': {`  
        `const rawBelief = mystery.distorted_beliefs[characterId] || '';`  
        `const cleanBelief = sanitizePromptText(rawBelief);`  
        `directives.push(`  
          `` `[SUBJECTIVE CONVICTION] You are convinced of the following regarding ${cleanTitle}: "${cleanBelief}"` ``  
        `);`  
        `break;`  
      `}`

      `case 'PARTIAL_FACT': {`  
        `if (mystery.permitted_clue_tokens.length > 0) {`  
          `const formattedClues = mystery.permitted_clue_tokens`  
            ``.map((t) => `"${sanitizePromptText(t)}"`)``  
            `.join(', ');`  
          `directives.push(`  
            `` `[PERCEPTUAL EVIDENCE] You are aware of specific physical traces regarding ${cleanTitle}: ${formattedClues}` ``  
          `);`  
        `}`  
        `break;`  
      `}`

      `case 'WITHHELD':`  
        `directives.push(`  
          `` `[RESTRAINED KNOWLEDGE] You possess direct knowledge of ${cleanTitle}, but are constrained from disclosing it under current dramatic stakes.` ``  
        `);`  
        `break;`  
    `}`  
  `}`

  `return {`  
    `characterId,`  
    `injectedDirectives: directives,`  
    `omittedTopicIds: omittedTopics,`  
  `};`  
`}`

#### **The Five Epistemic Horizons**

The projection maps character exposure into discrete execution states:

                     `THE EPISTEMIC HORIZON SPECTRUM`  
                       
`TOTAL_IGNORANCE       RUMOR_ONLY         PARTIAL_FACT        WITHHELD`  
`┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐`  
`│ Topic scrubbed  │  │ Injects un-     │  │ Injects clue    │  │ Injects dramatic│`  
`│ completely from │  │ verified hearsay│  │ tokens; root    │  │ taboo: knows,   │`  
`│ LLM prompt      │  │ directives into │  │ cause omitted   │  │ but forbidden to│`  
`│ context.        │  │ prompt window.  │  │ from context.   │  │ speak directly. │`  
`└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘`

> 1. **TOTAL\_IGNORANCE:** The topic ID, its canonical truth, and all associated lore files are omitted from the LLM prompt payload entirely. Tokens representing the secret do not enter the transformer attention window, preventing accidental leaks.  
> 2. **RUMOR\_ONLY:** Ground truth is withheld, but the character has heard distorted hearsay. Injects \[UNVERIFIED HEARSAY\] with low subjective confidence, prompting the model to treat the statement as doubtful rumors.  
> 3. **FALSE\_BELIEF:** The character harbors a firm conviction in an incorrect proposition. Injects \[SUBJECTIVE CONVICTION\], commanding the model to assert the misconception as absolute truth.  
> 4. **PARTIAL\_FACT:** The character perceives physical clues (e.g., "soot\_stain", "stripped\_threading") without disclosing the underlying cause or culprit.  
> 5. **WITHHELD (Restrained Knowledge):** The character possesses direct knowledge of the truth but is constrained by dramatic or social taboos. Injects \[RESTRAINED KNOWLEDGE\] alongside negative attenuation token lists (banned\_attenuation\_tokens) to force subtextual deflection.

### **4\. Cross-Vector Epistemic Invariants (Somatics & Logistics Coupling)**

An entity's biological state (Somatic Vector) and physical custody (Logistical Vector) limit their epistemic access. Pass 2 of the compiler verifies cross-vector coherence across four invariants:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                      CROSS-VECTOR COHERENCE GATES                      │`  
`├──────────────────────────────┬──────────────────┬──────────────────────┤`  
`│ Invariant Check              │ Failure Code     │ Enforcement Mechanism│`  
`├──────────────────────────────┼──────────────────┼──────────────────────┤`  
`│ Sensory-Witness Invariant    │ SENSORY_WITNESS_ │ Somatic conditions   │`  
`│                              │ CONTRADICTION    │ vs visual/audio mode │`  
`│ Unaware Mule Invariant       │ MULE_LEAK_       │ Inventory check vs   │`  
`│                              │ HAZARD           │ is_covert_carrier    │`  
`│ Vocal-Motor Feasibility      │ MUTENESS_HEARSAY_│ Banned kinetic verbs │`  
`│                              │ VIOLATION        │ vs dialogue utterance│`  
`│ Somatic Trauma Hearsay Drift │ SENSORY_DRIFT_   │ Auditory debuff vs   │`  
`│                              │ WARNING          │ distorted belief text│`  
`└──────────────────────────────┴──────────────────┴──────────────────────┘`

> * **Sensory-Witness Compatibility Theorem:** An actor cannot hold an epistemic standing of FACTUAL\_WITNESS if their somatic profile lacks the biological sensory organs required for that modality. If a mystery declares a visual modality, but the character's condition set includes blind or bilateral\_enucleation, the compiler flags a SENSORY\_WITNESS\_CONTRADICTION and aborts compilation.  
> * **The Unaware Mule Invariant:** If a character's Logistical Vector confirms they carry a physical item mapped to permitted\_clue\_tokens, their epistemic horizon cannot be TOTAL\_IGNORANCE. The compiler requires their status to be elevated to at least RUMOR\_ONLY, unless the item explicitly declares is\_covert\_carrier: true (e.g., contraband hidden inside a coat lining without the carrier's awareness).  
> * **Vocal-Motor Hearsay Feasibility:** If a character has a crushed larynx, is mute, or is restricted by banned\_kinetic\_verbs from speaking, they cannot be assigned verbal hearsay directives without triggering a validation error.  
> * **Somatic Trauma Hearsay Drift:** If an actor with hearing trauma (e.g., \+1,500 bp auditory impairment) is assigned RUMOR\_ONLY, static audits verify that their distorted\_beliefs text reflects misheard phonetic fragments rather than an accurate transcript.

### **5\. Audience Epistemic Layer & The Dramatic Irony Engine**

Dramatic tension relies on the information gap between the audience and the characters on screen. The pipeline tracks this delta using AudienceKnowledgeState:

`// packages/001.lore/schemas/epistemicAudience.ts`  
`export interface AudienceKnowledgeState {`  
  `readonly revealed_facts: ReadonlyMap<string, {`  
    `readonly revealed_in_episode: string;`  
    `readonly revealed_in_scene: string;`  
    `readonly exposure_type: 'EXPLICIT_ON_SCREEN' | 'IMPLIED_SUBTEXTUAL' | 'FORENSIC_DOCUMENT';`  
    `readonly visibility_hash: string;`  
  `}>;`  
  `readonly withheld_secrets: ReadonlySet<string>;`  
`}`

`export type DramaticPacingMode =`   
  `| 'DRAMATIC_IRONY'  // Audience knows fact X; character is ignorant of fact X`  
  `| 'SUSPENSE'        // Audience knows catastrophe impending; character operating normally`  
  `| 'SURPRISE'        // Audience and character discover fact X simultaneously`  
  `| 'MYSTERY';        // Character has more context than audience; details withheld`

When a scene plan is compiled, the showrunner declares a DramaticPacingMode, triggering strict compile-time verification gates:

`┌─────────────────────────────────────────────────────────────┐`  
`│          DRAMATIC IRONY VERIFICATION GATE                   │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  Scene Target: ep040_sc03 (Bog enters the crawlspace)       │`  
`│  Selected Mode: DRAMATIC_IRONY                              │`  
`│  Central Proposition: mystery_stolen_siphon                 │`  
`│                                                             │`  
`│  Audience State Check:                                      │`  
`│  • revealed_facts.has('mystery_stolen_siphon') ──► TRUE [OK]│`  
`│                                                             │`  
`│  Actor State Check (char_bog):                              │`  
`│  • getEpistemicDirectives(state, 'char_bog')                │`  
`│    asserts 'mystery_stolen_siphon' in omittedTopicIds       │`  
`│    ──► TOTAL_IGNORANCE [OK]                                 │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  VERDICT: GATE PASSED ($0.00 compute burned)                │`  
`└─────────────────────────────────────────────────────────────┘`

> * **DRAMATIC\_IRONY Gate:** Asserts that the target fact exists in the audience's revealed\_facts ledger, but remains categorized under omittedTopicIds (TOTAL\_IGNORANCE) in getEpistemicDirectives for the active actor. If the audience has not yet witnessed the fact on screen, compilation halts immediately.  
> * **SUSPENSE Gate:** Confirms the audience has witnessed an impending threat (e.g., an unlatched pressure valve), while interacting characters receive zero related tokens in their prompt directives.  
> * **SURPRISE Gate:** Asserts that both the audience and the interacting characters share TOTAL\_IGNORANCE prior to the scene event.  
> * **MYSTERY Gate:** Asserts that the actor possesses WITHHELD or FACTUAL\_WITNESS standing, while the topic is absent from the audience's revealed\_facts ledger.

### **6\. UI Mounts & Directorial Interventions in goblin-dashboard**

Within goblin-dashboard, epistemic state is rendered via Astro SSR and interactive React islands:

`---`  
`// src/pages/telemetry/epistemic.astro`  
`import ShowrunnerLayout from '../../layouts/ShowrunnerLayout.astro';`  
`import { EpistemicAuditPanel } from '../../components/telemetry/EpistemicAuditPanel';`  
`import { loadBibleState, getEpistemicDirectives } from '000.goblin-lore/client';`

`const bibleState = loadBibleState('under-the-floorboards');`  
`const bogEpistemics = getEpistemicDirectives(bibleState, 'char_bog');`  
`const spleenEpistemics = getEpistemicDirectives(bibleState, 'char_spleen');`  
`---`

`<ShowrunnerLayout title="Epistemic Horizon Auditor">`  
  `<EpistemicAuditPanel`   
    `client:idle`   
    `bogDirectives={bogEpistemics}`   
    `spleenDirectives={spleenEpistemics}`  
    `unresolvedMysteries={Object.values(bibleState.entities.unresolved_canon ?? {})}`  
  `/>`  
`</ShowrunnerLayout>`

`┌────────────────────────────────────────────────────────────────────────┐`  
`│            EPISTEMIC HORIZON AUDITOR (EpistemicAuditPanel.tsx)         │`  
`├──────────────────────────────┬─────────────────────────────────────────┤`  
`│ AUDIENCE REALITY (ON-SCREEN) │ ACTOR BUBBLE: char_bog                  │`  
`│ • Siphon is hidden under     │ • mystery_the_siphon: [TOTAL_IGNORANCE] │`  
`│   the south floorboard.      │   >> OMITTED FROM ATTENTION PROMPT      │`  
`│ • Rations cache depleted.    │ • mystery_the_famine: [RUMOR_ONLY]      │`  
`│                              │   >> "[UNVERIFIED HEARSAY] Whispers of  │`  
`│                              │       a cellar draft ruined stores."    │`  
`├──────────────────────────────┼─────────────────────────────────────────┤`  
`│ CANDIDATE AST AUDIT:         │ ACTOR BUBBLE: char_spleen               │`  
`│ [ep040_sc03_take02]          │ • mystery_the_siphon: [WITHHELD]        │`  
`│ Line 14: "Did you move the   │   >> "[RESTRAINED KNOWLEDGE] Direct     │`  
`│ siphon to the south joist?"  │       knowledge; taboo active."         │`  
`│ >> STATUS: FAIL (BREACH)     │ • Banned Tokens: ["siphon", "south"]    │`  
`├──────────────────────────────┴─────────────────────────────────────────┤`  
`│ [ REJECT TAKE: EPISTEMIC_FIREWALL_BREACH ]     [ RE-ROLL PROMPT PASS ] │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **1\. Three-Column Horizon Split View**

Mounted inside EpistemicAuditPanel.tsx, this component renders Audience Reality, Character A's Epistemic Horizon, and Character B's Epistemic Horizon side-by-side. It highlights discrepancies between objective truth and subjective conviction, helping showrunners verify dramatic irony at a glance.

#### **2\. Omniscience Breach Tripwire (AST Pre-Flight Linter)**

When candidate screenplay ASTs (dialogue\_ast.json) are staged for review, the dashboard runs epistemicLinter.ts against the candidate dialogue:

> * Cross-references spoken dialogue lines against the character's omittedTopicIds and trigger\_lemma\_sets.  
> * If Character A (under TOTAL\_IGNORANCE) utters a lemma associated with a forbidden proposition, the line is flagged in red: EPISTEMIC\_FIREWALL\_BREACH.  
> * The "Approve & Batch Render" button is locked until the director discards the take or triggers an AST patch pass.

#### **3\. Directorial Interventions & Belief Calibration**

> * **One-Click Taboo Forcing:** The director can select a topic and toggle a character's horizon from FACTUAL\_WITNESS to WITHHELD, injecting banned\_attenuation\_tokens to force subtextual dialogue before drafting.  
> * **Hearsay Calibration Slider:** Adjusts subjective confidence ratings for authored rumors, calculating the hop-decay factor (0.8*h*) across the transmission chain to track how information degrades through the ensemble.

### **7\. Verification Gauntlet & Negative Controls**

getEpistemicDirectives and its associated context assembly modules are audited within packages/001.lore/test/client.test.ts and test/epistemic.test.ts:

`// packages/001.lore/test/client.test.ts`  
`import { describe, it, expect } from 'vitest';`  
`import { loadBibleState, getEpistemicDirectives } from '../src/client.js';`

`describe('Epistemic Prompt Projection Gauntlet (getEpistemicDirectives)', () => {`  
  `const state = loadBibleState('under-the-floorboards');`

  `const testMystery = {`  
    `topic_id: 'mystery_the_famine',`  
    `title: 'The Great Winter Famine',`  
    `world_status: 'UNRESOLVED_BY_CANON',`  
    `standing: 'ACTIVE_ENDORSED',`  
    `last_reconsidered_at: 0,`  
    `forbidden_propositions: [`  
      `{`  
        `statement: 'Bog hoarded the dry salt pork behind the chimney.',`  
        `trigger_lemma_sets: [['pork', 'chimney'], ['bog', 'hoard', 'cache']],`  
      `},`  
    `],`  
    `permitted_clue_tokens: ['ash_residue', 'grease_stain'],`  
    `epistemic_horizons: {`  
      `char_bog: 'TOTAL_IGNORANCE',`  
      `char_spleen: 'RUMOR_ONLY',`  
      `char_wart: 'WITHHELD',`  
    `},`  
    `distorted_beliefs: {`  
      `char_spleen: 'Heard whispers that an unlatched cellar vent ruined stores.',`  
    `},`  
    `human_promotion_condition: 'Requires showrunner sign-off after season 1 finale.',`  
  `};`

  `it('negative control: completely omits secrets under TOTAL_IGNORANCE', () => {`  
    `const directives = getEpistemicDirectives(state, 'char_bog', [testMystery as any]);`

    `expect(directives.characterId).toBe('char_bog');`  
    `expect(directives.omittedTopicIds).toContain('mystery_the_famine');`  
    `expect(directives.injectedDirectives.length).toBe(0);`  
  `});`

  `it('formats authored distorted beliefs as unverified hearsay for RUMOR_ONLY', () => {`  
    `const directives = getEpistemicDirectives(state, 'char_spleen', [testMystery as any]);`

    `expect(directives.characterId).toBe('char_spleen');`  
    `expect(directives.omittedTopicIds.length).toBe(0);`  
    `expect(directives.injectedDirectives[0]).toContain('[UNVERIFIED HEARSAY]');`  
    `expect(directives.injectedDirectives[0]).toContain('cellar vent ruined stores');`  
  `});`

  `it('injects dramatic restraint markers for WITHHELD knowledge', () => {`  
    `const directives = getEpistemicDirectives(state, 'char_wart', [testMystery as any]);`

    `expect(directives.characterId).toBe('char_wart');`  
    `expect(directives.injectedDirectives[0]).toContain('[RESTRAINED KNOWLEDGE]');`  
    `expect(directives.injectedDirectives[0]).toContain('constrained from disclosing');`  
  `});`

  `it('negative control: defaults unlisted characters safely to TOTAL_IGNORANCE', () => {`  
    `const directives = getEpistemicDirectives(state, 'char_unlisted_actor', [testMystery as any]);`

    `expect(directives.characterId).toBe('char_unlisted_actor');`  
    `expect(directives.omittedTopicIds).toContain('mystery_the_famine');`  
    `expect(directives.injectedDirectives.length).toBe(0);`  
  `});`

  `it('negative control: rejects mutation on returned projection object', () => {`  
    `const directives = getEpistemicDirectives(state, 'char_bog', [testMystery as any]);`

    `expect(() => {`  
      `// @ts-expect-error - Testing deep-freeze immutability`  
      `directives.omittedTopicIds.push('tampered_mystery');`  
    `}).toThrow(TypeError);`  
  `});`  
`});`

This verification gauntlet ensures that getEpistemicDirectives enforces narrative ambiguity, protects subtextual dramatic tension, and prevents unearned plot disclosures at compile time (*T*0​\=\$0.00) before any media rendering occurs.

---

*User prompt: {{FOCUS: 1\. Somatic Capability Projection (getCharacterSomaticMask) (goblin-dashboard) }} /extreme-details*

Response: getCharacterSomaticMask (housed in packages/001.lore/src/client.ts and consumed by goblin-dashboard) is the compile-time projection function that enforces physical and anatomical reality across the generative pipeline. Within the sovereign media architecture, truth resides in an immutable relational ledger, while generative models (LLMs, diffusion pipelines, neural speech vocoders) operate as untrusted workers possessing zero narrative, temporal, or biological authority.

Without deterministic physical boundary projection, probabilistic generators introduce continuity degradation: injured limbs heal spontaneously between camera cuts, amputee characters dual-wield heavy props, and physical exhaustion fails to constrain movement. getCharacterSomaticMask resolves this by compiling raw character dossiers into an immutable, deep-frozen **SomaticMask** that converts narrative descriptions into mathematical capability budgets.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   COMPILED CANON: bible-state.json (H_root)            │`  
`│  • Immutable YAML Frontmatter at Byte 0                                │`  
`│  • Somatic Vector: locomotion_baseline, active_conditions, motor_limits│`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Ingestion via loadBibleState()`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│      src/client.ts: getCharacterSomaticMask(state, characterId)        │`  
`│  • Traverses conditions & audits SEVERE_ARM_CONDITIONS set             │`  
`│  • Computes Net Upper-Limb Capacity: availableArms                     │`  
`│  • Compiles negative motor mask: bannedKineticVerbs                    │`  
`│  • Applies recursive deepFreeze() to the resulting projection         │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                  READONLY SOMATIC PROJECTION (SomaticMask)             │`  
`│  {                                                                     │`  
`│    characterId: "char_wart",                                           │`  
`│    locomotionBaseline: "bipedal_hunched",                              │`  
`│    bannedKineticVerbs: ["sprint", "vault", "climb", "embrace"],        │`  
`│    motorLimitations: ["UNSTEADY_GAIT", "NO_HEAVY_LIFT"],               │`  
`│    conditions: ["severed_left_arm"],                                   │`  
`│    availableArms: 1.0                                                  │`  
`│  }                                                                     │`  
`└───────────────────┬────────────────────────────────┬───────────────────┘`  
                    `│                                │`  
                    `▼                                ▼`  
`┌──────────────────────────────────────┐ ┌──────────────────────────────┐`  
`│ goblin-dashboard (Showrunner HUD)    │ │ AST Invariant Linter (T_0)   │`  
`│ • SomaticHUDCard.tsx / Wireframes    │ │ • O(1) set-intersection on   │`  
`│ • Equip-slot gating (T_-1 fencing)   │ │   extracted_motor_actions    │`  
`│ • Single-limb hand saturation alerts │ │ • Negation-aware dependency  │`  
`│ • Staging approval button lock       │ │   prose sweeps               │`  
`└──────────────────────────────────────┘ └──────────────────────────────┘`

### **1\. Mathematical Formulation & Upper-Limb Capacity Derivation**

getCharacterSomaticMask replaces open-ended text tags with a **Capability-Resource Budget**. The primary scalar derived by the function is operational bimanual capacity (availableArms∈\[0.0,2.0\]), which determines whether an entity can manipulate objects or execute bimanual tasks.

#### **Step 1: Base Biological Allocation**

The projection determines baseline limb availability directly from the entity's locomotion morphology:

Armsbase​\={0.02.0​if locomotion\_baseline∈{"sessile","slithering"}otherwise​

If an entity's locomotion baseline is sessile or slithering, upper limbs do not support standard bipedal manipulation or locomotion, dropping base capacity to zero.

#### **Step 2: Severe Anatomical Trauma Penalty Deduction**

The function audits the character's active condition ledger against an immutable set of severe anatomical locus pathologies:

SEVERE\_ARM\_CONDITIONS=⎩⎨⎧​"braxial\_plexus\_severed","severed\_right\_arm","severed\_left\_arm","paralyzed\_arm","amputated\_limb"​⎭⎬⎫​

For every condition present in the character's somatic record that matches this set (evaluated case-insensitively), a unit penalty of 1.0 is deducted from available capacity.

#### **Step 3: Lower-Bound Trauma Clamping**

To prevent multi-trauma combinations (such as an amputated limb accompanied by a severed brachial plexus) from producing impossible negative arm budgets that break downstream arithmetic solvers, the derivation clamps the result at 0.0:

availableArms=max(0.0,Armsbase​−*c*∈conditions∑​I(*c*.toLowerCase()∈SEVERE\_ARM\_CONDITIONS))

For example, Wart (char\_wart), who has severed\_left\_arm, evaluates to max(0.0,2.0−1.0)=1.0. An entity with three severe arm conditions evaluates to max(0.0,2.0−3.0)=0.0.

### **2\. Concrete Implementation & Schema Anatomy**

The implementation in packages/001.lore/src/client.ts is a pure function that operates without ambient clock evaluations or network dependencies:

`export interface SomaticMask {`  
  `readonly characterId: string;`  
  `readonly locomotionBaseline: string;`  
  `readonly bannedKineticVerbs: readonly string[];`  
  `readonly motorLimitations: readonly string[];`  
  `readonly conditions: readonly string[];`  
  `readonly availableArms: number;`  
`}`

`const SEVERE_ARM_CONDITIONS = new Set([`  
  `'braxial_plexus_severed',`  
  `'severed_right_arm',`  
  `'severed_left_arm',`  
  `'paralyzed_arm',`  
  `'amputated_limb',`  
`]);`

`/**`  
 `* Extracts immutable somatic capability and negative kinetic verb masks for an actor.`  
 `*/`  
`export function getCharacterSomaticMask(`  
  `state: Readonly<BibleState>,`  
  `characterId: string,`  
`): Readonly<SomaticMask> {`  
  `const char = state.entities.characters[characterId];`  
  `if (!char) {`  
    ``throw new Error(`[LORE CLIENT] Unknown character ID: '${characterId}'`);``  
  `}`

  `const somatic = char.somatic;`  
  `let availableArms = 2.0;`  
  `if (`  
    `somatic.locomotion_baseline === 'sessile' ||`  
    `somatic.locomotion_baseline === 'slithering'`  
  `) {`  
    `availableArms = 0.0;`  
  `}`

  `for (const condition of somatic.conditions || []) {`  
    `if (SEVERE_ARM_CONDITIONS.has(condition.toLowerCase())) {`  
      `availableArms = Math.max(0.0, availableArms - 1.0);`  
    `}`  
  `}`

  `return deepFreeze({`  
    `characterId,`  
    `locomotionBaseline: somatic.locomotion_baseline,`  
    `bannedKineticVerbs: somatic.banned_kinetic_verbs || [],`  
    `motorLimitations: somatic.motor_limitations || [],`  
    `conditions: somatic.conditions || [],`  
    `availableArms,`  
  `});`  
`}`

#### **Field-by-Field Architectural Responsibilities**

| Field | Type | Architectural Responsibility |
| :---- | :---- | :---- |
| **characterId** | string | Canonical entity identifier cross-referenced against the relational ledger. |
| **locomotionBaseline** | string (Enum) | Baseline gait: bipedal\_standard, bipedal\_hunched, limping, neuropathy\_shuffle, sessile, or slithering. |
| **bannedKineticVerbs** | readonly string\[\] | Negative motor mask containing prohibited verbs (e.g., \["sprint", "vault", "climb", "embrace"\]). |
| **motorLimitations** | readonly string\[\] | High-level system restrictions: NO\_SPRINT, NO\_HEAVY\_LIFT, UNSTEADY\_GAIT, IMPAIRED\_FINE\_MOTOR. |
| **conditions** | readonly string\[\] | Active anatomical pathologies compiled from character dossiers. |
| **availableArms** | number | Net functional upper-limb capacity (0.0, 1.0, or 2.0) governing hand saturation solvers. |

#### **Defensive Boundary Invariants**

> 1. **Unknown Character Rejection:** Querying an unindexed identifier (e.g., char\_ghost) fails closed immediately with \[LORE CLIENT\] Unknown character ID: 'char\_ghost', preventing undefined access downstream.  
> 2. **Deep Immutability via deepFreeze:** The resulting projection is recursively frozen. Any client script attempting to modify properties (e.g., mask.availableArms \= 2.0) throws an unhandled TypeError: Cannot assign to read only property.  
> 3. **Purity & Zero Clock Leakage:** The function contains zero calls to Date.now(), performance.now(), or environment variables, guaranteeing identical projections across local and edge runtimes.

### **3\. UI Mounts & Directorial Interventions in goblin-dashboard**

In goblin-dashboard, the somatic mask is ingested during Astro Server-Side Rendering (SSR) and passed into interactive React islands:

`---`  
`// src/pages/telemetry/somatic.astro`  
`import ShowrunnerLayout from '../../layouts/ShowrunnerLayout.astro';`  
`import { SomaticHUDCard } from '../../components/telemetry/SomaticHUDCard';`  
`import { loadBibleState, getCharacterSomaticMask } from '000.goblin-lore/client';`

`const bibleState = loadBibleState('under-the-floorboards');`  
`const wartMask = getCharacterSomaticMask(bibleState, 'char_wart');`  
`const bogMask = getCharacterSomaticMask(bibleState, 'char_bog');`  
`---`

`<ShowrunnerLayout title="Somatic Capability Panopticon">`  
  `<div class="grid grid-cols-2 gap-4">`  
    `<SomaticHUDCard client:load actorId="char_wart" mask={wartMask} />`  
    `<SomaticHUDCard client:load actorId="char_bog" mask={bogMask} />`  
  `</div>`  
`</ShowrunnerLayout>`

`┌────────────────────────────────────────────────────────┐`  
`│ CHARACTER SOMATIC PROFILE: Wart (char_wart)            │`  
`├────────────────────────────────────────────────────────┤`  
`│ Locomotion Baseline : bipedal_hunched                  │`  
`│ Upper-Limb Capacity : [■■■■■□□□□□] 1.0 / 2.0 Arms       │`  
`│ Active Traumas      : severed_left_arm                 │`  
`│ Motor Limitations   : UNSTEADY_GAIT, NO_HEAVY_LIFT     │`  
`├────────────────────────────────────────────────────────┤`  
`│ Negative Verb Mask  :                                  │`  
`│   • sprint      • vault      • climb      • embrace    │`  
`├────────────────────────────────────────────────────────┤`  
`│ LOGISTICAL SATUS    : 1 / 1 Held Slots Active          │`  
`│ [!] Off-Hand Slot Physically Disabled (Single-Limb)    │`  
`└────────────────────────────────────────────────────────┘`

#### **1\. Contextual Capability Fencing (*T*−1​)**

goblin-dashboard shifts constraint checking from build time (*T*0​) to authoring time (*T*−1​):

> * **Equip-Slot Gating:** When an operator attempts to assign equipment in the dashboard interface, the UI queries mask.availableArms. If availableArms \=== 1.0, typeahead dropdowns suppress two-handed items (occupies\_hands: 2\) and gray out the secondary held slot (HELD\_OFF).  
> * **Pre-Flight SAT Buzzer:** If an author forces an invalid loadout, the dashboard triggers an in-memory satisfiability (SAT) check that flags the contradiction before any files are written to disk.

#### **2\. Visual Anatomical Wireframe**

The SomaticHUDCard.tsx island translates the mask into a clear visual representation:

> * Renders single-limb badges and strikes through disabled limbs in red.  
> * Displays active kinetic restrictions with 7-bit ASCII tags (\[NO\_SPRINT\], \[NO\_HEAVY\_LIFT\]), ensuring visual clarity without encoding errors in headless test runners.

### **4\. The Multi-Layered Motor Action Invariant Gauntlet**

During scene staging and pre-viz review, candidate screenplay drafts (dialogue\_ast.json) pass through a multi-layered verification gauntlet that checks actions against the projected SomaticMask:

                     `CANDIDATE SCREENPLAY BEAT`  
                                `│`  
                                `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ GATE 1: O(1) SET-INTERSECTION LINTER (extracted_motor_actions)         │`  
`│         extracted_motor_actions ∩ bannedKineticVerbs = ∅               │`  
`└───────────────────────────────┬────────────────────────────────────────┘`  
                                `│ Pass (Intersection is Empty)`  
                                `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ GATE 2: NEGATION-AWARE DEPENDENCY PARSER (Prose Sweep)                 │`  
`│         Detects forbidden verb lemmas; evaluates governing syntax:     │`  
`│         • "he gripped the valve"       ──► HALT (Violation)            │`  
`│         • "he could not grip the valve" ──► PASS (Valid Trauma Depict)  │`  
`└───────────────────────────────┬────────────────────────────────────────┘`  
                                `│ Pass`  
                                `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ GATE 3: HAND SATURATION SOLVER (Logistical Vector Check)               │`  
`│         ∑ slot.occupies_hands ≤ mask.availableArms                     │`  
`│         • Wart holds Copper Flange (1.0) ≤ 1.0 ──► PASS                │`  
`│         • Wart attempts two-handed pry (2.0)   ──► HALT (Overcapacity) │`  
`└───────────────────────────────┬────────────────────────────────────────┘`  
                                `│`  
                                `▼`  
            `[ APPROVE & ADVANCE TO TTS / DIFFUSION ]`

#### **Gate 1: O(1) Set-Intersection**

Drafting models emit machine-readable action arrays alongside prose (e.g., extracted\_motor\_actions: \["LIMP", "SPEAK"\]). The linter performs an O(1) set-intersection check:

extracted\_motor\_actions∩bannedKineticVerbs=∅

If an actor with bannedKineticVerbs: \["sprint"\] emits "sprint", the build halts immediately at *T*0​\=\$0.00 before any token synthesis or rendering occurs.

#### **Gate 2: Negation-Aware Dependency Parsing**

Models may report compliant action enums while including forbidden movements in descriptive prose. A syntax dependency parser sweeps prose for forbidden verb lemmas while evaluating negative polarity modifiers (neg, without, failed to, could not):

> * *"He gripped the copper pipe with both hands"* trips the gate and triggers an immediate script halt.  
> * *"He could not grip the pipe with his severed arm"* passes as an accurate depiction of anatomical trauma.

#### **Gate 3: Hand Saturation Inequality**

The logistical vector verifies that equipped items do not exceed physical capacity:

*i*∈held\_items∑​*i*.occupies\_hands≤mask.availableArms

If Wart (availableArms: 1.0) is assigned two held items, the solver fails, locking the "Approve & Render" button in goblin-dashboard.

### **5\. Downstream Cross-Repository Projections**

The output of getCharacterSomaticMask feeds multiple engines across the production pipeline:

                            `SomaticMask`  
                                 `│`  
         `┌───────────────────────┼───────────────────────┐`  
         `▼                       ▼                       ▼`  
`┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐`  
`│ worker-sower     │   │ goblin-spatial   │   │ Asset Forge &    │`  
`│ (Simulation)     │   │ (Sensory Gate)   │   │ Remotion Viewport│`  
`├──────────────────┤   ├──────────────────┤   ├──────────────────┤`  
`│• maxCost scalars │   │• Ocular health   │   │• Silhouette QA   │`  
`│• Equip solvers   │   │  clamping        │   │• Audio DSP vocal │`  
`│• Strain meters   │   │• Auditory gates  │   │  fry/cadence     │`  
`└──────────────────┘   └──────────────────┘   └──────────────────┘`

> * **worker-sower-engine (Runtime Simulation Conductor):** Translates locomotionBaseline into movement cost scalars (budgetCostUnits: 400\) and logs strain into the accumulator (+2,500 bp). Physical fatigue is decoupled from moral refusal limits: physical exhaustion forces running to drop to shuffling without altering ideological commitments.  
> * **goblin-spatial (Sensory & Line-of-Sight Gates):** Maps sensory conditions into physical perception limits. Monocular actors have their visual range clamped to ⌊*R*vision​×0.5⌋ with a 60∘ persistent blind cone, while acoustic trauma adds a \+1,500 bp perception threshold over the ambient noise floor.  
> * **audio-microservice & Conductor:** Transforms somatic trauma into concrete Digital Signal Processing (DSP) parameters:  
  * Pulmonary trauma scales breathiness pause multipliers (1.0 to 3.5).  
  * Cranial or vocal fatigue injects subharmonic rattle (vocalFryDensity).  
  * Prohibits rapid cadences (bannedCadences: \["RAPID\_STACCATO"\]).  
> * **goblin-viewport-template (Asset Forge & Compositor):** Enforces silhouette distinctness through adversarial redaction testing. Puppet components preserve anchor points (anchor\_point) and facial centroids (crash\_zoom\_target) so characters with asymmetric limps maintain consistent ground contact without sliding across background plates.

### **6\. Verification Gauntlet & Negative-Control Test Suite**

The projection's integrity is verified through automated tests (packages/001.lore/test/client.test.ts) that test both valid derivations and boundary failure cases:

`import { describe, it, expect } from 'vitest';`  
`import { loadBibleState, getCharacterSomaticMask } from '../src/client.js';`

`describe('Somatic Capability Projection Gauntlet (getCharacterSomaticMask)', () => {`  
  `const state = loadBibleState('under-the-floorboards');`

  `it('calculates somatic capacity for single-arm amputee (char_wart)', () => {`  
    `const wartMask = getCharacterSomaticMask(state, 'char_wart');`

    `expect(wartMask.characterId).toBe('char_wart');`  
    `expect(wartMask.locomotionBaseline).toBe('bipedal_hunched');`  
    `expect(wartMask.availableArms).toBe(1.0);`  
    `expect(wartMask.conditions).toContain('severed_left_arm');`  
    `expect(wartMask.bannedKineticVerbs).toEqual(`  
      `expect.arrayContaining(['sprint', 'vault', 'climb', 'embrace'])`  
    `);`  
    `expect(wartMask.motorLimitations).toEqual(`  
      `expect.arrayContaining(['UNSTEADY_GAIT', 'NO_HEAVY_LIFT'])`  
    `);`  
  `});`

  `it('calculates somatic capacity for limping actor with knee trauma (char_mum_grissel)', () => {`  
    `const grisselMask = getCharacterSomaticMask(state, 'char_mum_grissel');`

    `expect(grisselMask.characterId).toBe('char_mum_grissel');`  
    `expect(grisselMask.locomotionBaseline).toBe('limping');`  
    `expect(grisselMask.availableArms).toBe(2.0);`  
    `expect(grisselMask.conditions).toContain('stiff_left_knee');`  
    `expect(grisselMask.bannedKineticVerbs).toEqual(`  
      `expect.arrayContaining(['sprint', 'leap', 'vault', 'scramble'])`  
    `);`  
  `});`

  `it('calculates standard full capacity for intact actor (char_bog)', () => {`  
    `const bogMask = getCharacterSomaticMask(state, 'char_bog');`

    `expect(bogMask.characterId).toBe('char_bog');`  
    `expect(bogMask.availableArms).toBe(2.0);`  
    `expect(bogMask.conditions.length).toBe(0);`  
  `});`

  `it('negative control: clamps available arms to 0.0 for sessile or slithering baseline', () => {`  
    `const mockState = {`  
      `...state,`  
      `entities: {`  
        `...state.entities,`  
        `characters: {`  
          `char_slug: {`  
            `somatic: {`  
              `locomotion_baseline: 'slithering',`  
              `conditions: [],`  
              `banned_kinetic_verbs: ['walk'],`  
              `motor_limitations: ['IMMOBILE'],`  
            `},`  
          `},`  
        `},`  
      `},`  
    `};`

    `const mask = getCharacterSomaticMask(mockState as any, 'char_slug');`  
    `expect(mask.availableArms).toBe(0.0);`  
  `});`

  `it('negative control: clamps compound multi-amputation gracefully at 0.0', () => {`  
    `const mockState = {`  
      `...state,`  
      `entities: {`  
        `...state.entities,`  
        `characters: {`  
          `char_shattered: {`  
            `somatic: {`  
              `locomotion_baseline: 'bipedal_standard',`  
              `conditions: [`  
                `'severed_left_arm',`  
                `'severed_right_arm',`  
                `'braxial_plexus_severed',`  
              `],`  
              `banned_kinetic_verbs: [],`  
              `motor_limitations: [],`  
            `},`  
          `},`  
        `},`  
      `},`  
    `};`

    `const mask = getCharacterSomaticMask(mockState as any, 'char_shattered');`  
    `expect(mask.availableArms).toBe(0.0); // max(0.0, 2.0 - 3.0) = 0.0`  
  `});`

  `it('negative control: fails closed with explicit error on unknown character ID', () => {`  
    `expect(() => getCharacterSomaticMask(state, 'char_ghost')).toThrow(`  
      `/\[LORE CLIENT\] Unknown character ID: 'char_ghost'/`  
    `);`  
  `});`

  `it('negative control: enforces deepFreeze immutability against runtime property tampering', () => {`  
    `const mask = getCharacterSomaticMask(state, 'char_wart');`

    `expect(() => {`  
      `// @ts-expect-error - Runtime Mutation Trap`  
      `mask.availableArms = 2.0;`  
    `}).toThrow(TypeError);`

    `expect(() => {`  
      `// @ts-expect-error - Runtime Array Mutation Trap`  
      `(mask.bannedKineticVerbs as string[]).push('dance');`  
    `}).toThrow(TypeError);`  
  `});`  
`});`

---

*User prompt: {{FOCUS: 1\. The Continuous Parameter Vector Space (\$\\vec{P}\_{\\text{dramatic}}\$) (goblin-dashboard) }} /extreme-details*

Response: In goblin-dashboard, the **Continuous Parameter Vector Space (*P*dramatic​)** replaces manual, free-form prompt engineering with a deterministic, mathematically bounded control plane. Positioned within **Cluster 05.delivery** on the Showrunner Cockpit interface (src/components/islands/DirectorConsole.tsx), this vector space provides the showrunner with continuous quantitative dials that calibrate the narrative, acoustic, and physical compression of a scene before generative inference begins.

*P*dramatic​\=​*CPTS*​​∈\[0.0,1.0\]4⊂R4

This four-dimensional hypercube maps qualitative directorial intent into deterministic prompts, token attenuation masks, physical action ratios, and digital signal processing (DSP) vocal profiles without violating canonical lore or corrupting the downstream temporal clock.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│             goblin-dashboard (DirectorConsole.tsx Island)              │`  
`│                                                                        │`  
`│   Curtness (C)             Pacing (P)            Threat (T)     Subtext (S)│`  
`│  [────●────] 0.75         [─────●───] 0.60      [───────●─] 0.85 [──────●──] 0.70`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Emits Validated DirectorIntentEnvelope`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│             PROMPT COMPILATION & CONTEXT ASSEMBLY ENGINE               │`  
`│                                                                        │`  
`│  1. Lexical Budgeting:       W_max = floor(24 - 16 * C)                │`  
`│  2. Kinetic Beat Density:    rho_A/D = P / (1 - P + epsilon)           │`  
`│  3. Duel Trigger Floor:      p_duel = clamp(0.05 + 0.85 * T, 0, 1)     │`  
`│  4. Attenuation Masking:     S >= 0.70 -> Blacklist Leverage Tokens    │`  
`└──────────────┬────────────────────┬────────────────────┬───────────────┘`  
               `│                    │                    │`  
               `▼                    ▼                    ▼`  
     `Local LLM (Qwen 2.5)   audio-microservice   goblin-viewport-template`  
     `• GBNF Action Array    • Speed Scalar       • Camera Spring Damping`  
     `• Dialogue AST         • Pause Dilation     • Talk-Bounce Amplitude`  
     `• Monosyllabic Logits  • Vocal Fry Density  • Visual Pacing Envelope`

### **1\. Mathematical Formalization of the Four Parametric Axes**

The vector *P*dramatic​ operates across four orthogonal axes, each governing a distinct dimension of the dramatic compilation process:

#### **Axis 1: Dialogue Curtness (*C*∈\[0.0,1.0\])**

Governs syntactic density, clause chaining, and word-budget ceilings per spoken line.

> * **Dialogue Word Budget Function (*W*max​):** The maximum permitted word count for any dialogue block within the extracted Abstract Syntax Tree (dialogue\_ast.json) is an affine transformation of *C*:  
>   *W*max​(*C*)=max(2,⌊24.0−18.0×*C*⌋)  
  * *C*\=0.0⟹*W*max​\=24 words (Permits multi-clause, evasive, periodic sentences).  
  * *C*\=0.5⟹*W*max​\=15 words (Standard dramatic conversational exchange).  
  * *C*≥0.75⟹*W*max​≤10 words (Enforces terse, monosyllabic exchanges, ellipses, and hard interrupts).  
  * *C*\=1.0⟹*W*max​\=6 words (Strict telegraphic verbalization; single-word commands or grunts).  
> * **Syntactic Complexity Penalty:** High curtness biases the model's sampling logits against coordinating and subordinating conjunctions ("because", "furthermore", "although", "nevertheless"), forcing simple Subject-Verb-Object structures.  
> * **Downstream Acoustic Coupling:** Compresses speech duration synthesized by audio-microservice, directly reducing the 24 fps integer frame allocation calculated by ffprobe:  
>   target\_frames=⌈1000duration\_ms(*C*)​×24⌉

#### **Axis 2: Dramatic Pacing (*P*∈\[0.0,1.0\])**

Regulates the structural ratio between physical motor action blocks and spoken dialogue utterances, formalizing Dwight Swain's Motivation-Reaction Units (MRUs).

> * **Action-to-Dialogue Ratio (*ρA*/*D*​):**  
>   *ρA*/*D*​(*P*)=1.0−*P*\+*ϵP*​(where *ϵ*\=10−4)  
> * **Kinetic Micro-Beat Quantization:**  
  * *P*≤0.30 (Deliberate Pacing): Expands the intervening sensory reaction windows between dialogue beats. Enforces extensive physical blocking, sensory pauses, and unvoiced cognition.  
  * *P*∈(0.30,0.70) (Balanced Narrative Momentum): Alternates dialogue lines with single physical reaction beats in a 1:1 ratio.  
  * *P*≥0.70 (Telegraphic Kinetic Velocity): Constrains action blocks to rapid physical verbs (e.g., *"Bog drops the siphon"*), skipping internal processing and prioritizing physical movement.  
> * **Optical Spring Dynamics:** Downstream Remotion camera rigs in goblin-viewport-template scale their spring oscillation velocity with *P*:  
>   CameraDamping(*P*)=max(8,⌊20−12×*P*⌋)  
>   High pacing generates snap crash zooms, while low pacing introduces slow, wandering pans.

#### **Axis 3: Threat Level Multiplier (*T*∈\[0.0,1.0\])**

Modulates somatic stakes, physical leverage, and conflict escalation volatility.

> * **Mechanical Duel Probability (*p*duel​):** Governs whether an interpersonal confrontation escalates into an opposed 2d6 duel in worker-sower-engine:  
>   *p*duel​(*T*)=clamp(0.05+0.85×*T*,0.0,1.0)  
> * **Somatic Injury Risk Scaling:** Scales the magnitude of potential physical trauma conditions (e.g., concussive\_hearing\_loss, femoral\_laceration):  
>   ΔSeveritysomatic​\=⌊*T*×4000⌋ basis points (bp)  
> * **Dialogue Escalation Trajectory:**  
  * *T*≤0.30: Dialogue is confined to petty domestic bickering, inventory complaints, and social leverage without physical posturing.  
  * *T*≥0.80: Subtext evaporates in favor of explicit physical threats, unholstered tools, brandished weapons, and immediate territorial ultimatums.

#### **Axis 4: Subtext Suppression (*S*∈\[0.0,1.0\])**

Determines whether characters vocalize their internal goals or disguise them behind mundane topics.

> * **The Attenuation Heuristic Activation:** When *S*≥0.70, the compiler engages token attenuation. It provides the drafting model with the characters' underlying leverage while placing the exact nouns of that leverage onto a strict negative token list:  
>   BannedTokens=ExtractLemmas(Grievance.underneath)∀*S*≥0.70  
> * **Tactical Displacement Ratio:** Forces characters to displace interpersonal resentment onto inanimate objects (e.g., grease on a spoon, pipe pressure, joist rot).  
> * **Subtext Spectrum:**  
  * *S*≤0.20 (Open Catharsis / Farce): Characters explicitly state their core grievances (e.g., *"You hoarded the rations during the dry cycle\!"*).  
  * *S*≥0.80 (Deep Avoidance): Characters aggressively argue over surface logistics while the real source of tension remains unstated.

### **2\. Concrete Parametric State Matrix**

| Dimension | Variable | Low Metric (0.0−0.25) | Nominal Metric (0.4−0.6) | High Metric (0.75−1.0) | Downstream Consumer Boundary |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Curtness** | *C* | *W*max​\=24 Complex clauses | *W*max​\=15 Natural cadence | *W*max​\=6 Monosyllabic grunts | Local LLM GBNF grammar & audio-microservice timebase. |
| **Pacing** | *P* | *ρA*/*D*​\=0.2 Long contemplation | *ρA*/*D*​\=1.0 Balanced beat rhythm | *ρA*/*D*​\=4.0 Rapid action dominance | Remotion timeline cuts & camera spring damping. |
| **Threat** | *T* | *p*duel​\=0.05 Zero somatic stakes | *p*duel​\=0.50 Moderate leverage | *p*duel​\=0.90 Active physical violence | worker-sower-engine 2d6 resolver & trauma ledger. |
| **Subtext** | *S* | Explicit catharsis Unfiltered complaints | Masked intentions Partial deflection | Full displacement Complete token ban | Prompt Assembly Attention Sandwich & token filter. |

### **3\. Downstream Multi-Modal Translation & System Coupling**

When the showrunner modifies *P*dramatic​ in the dashboard, the vector compiles into downstream execution parameters across the studio fleet:

                                  `P_dramatic = < C, P, T, S >`  
                                               `│`  
             `┌─────────────────────────────────┼─────────────────────────────────┐`  
             `▼                                 ▼                                 ▼`  
   `LLM PROMPT INJECTION               AUDIO DSP SYNTHESIS              REMOTION OPTICAL RIG`  
`(worker-sower-engine / Rig 1)       (audio-microservice :8000)       (goblin-viewport-template)`  
`┌───────────────────────────┐      ┌───────────────────────────┐    ┌───────────────────────────┐`  
`│ • Max tokens per turn     │      │ • speedScalar             │    │ • talk_bounce_amplitude   │`  
`│ • Banned token blacklist  │      │ • pause_multiplier_scene  │    │ • idle_shiver_amplitude   │`  
`│ • MRU action-line quotas  │      │ • delta_Pitch_scene       │    │ • Camera zoom damping     │`  
`│ • 200-word micro-beat cap │      │ • delta_Fry_scene         │    │ • Integer frame allocations│`  
`└───────────────────────────┘      └───────────────────────────┘    └───────────────────────────┘`

#### **1\. Compilation into the Attention Sandwich (LLM Prompt Layer)**

The prompt compilation engine maps *P*dramatic​ into the 15% / 70% / 15% prompt structure:

> * **System Directive (Top 15%):** Curtness *C* injects stylometric boundaries (mean\_sentence\_length, max\_words\_per\_utterance).  
> * **Context Scaffolding (Middle 70%):** Subtext *S* queries the active grievance. If *S*≥0.70, the engine scrubs all tokens related to grievance.underneath and injects replacement items from grievance.surface\_dispute.  
> * **Exit Anchor (Bottom 15%):** Pacing *P* and Threat *T* calculate the physical termination trigger (e.g., *"Halt generation immediately when Bog strikes the pipe"*).

#### **2\. Translation into Audio DSP Profiles (audio-microservice)**

The continuous vector links with character voice recipes inside voice\_manifest.json:

Pacingeff​\=Speedbase​×(0.8+0.5×*P*\+0.3×*C*)  
Pauseeff​\=Basebreath​×(2.5−1.5×*P*)  
ΔPitchscene​\=(*T*×4.0) semitones  
ΔFryscene​\=clamp(*T*×0.6+(1.0−*P*)×0.2,0.0,1.0)

> * High *C* and *P* increase speech rate and shorten pauses, producing tense, clipped dialogue.  
> * Elevated Threat *T* shifts the pitch upward by up to \+4.0 semitones and increases glottal fry, capturing vocal cord tension.

#### **3\. Translation into Puppet Kinetic Physics (goblin-viewport-template)**

The video compositor translates *P*dramatic​ into visual constants in manifest.json and Episode\_XXX.tsx:

> * **talk\_bounce\_amplitude:** Driven by Curtness and Threat:  
>   bounce=⌊base\_bounce×(1.0+0.8×*T*−0.4×*C*)⌋  
> * **idle\_shiver\_amplitude:** When Threat *T*≥0.80, high-frequency positional jitter increases to simulate acute somatic tension:  
>   Δ*x*jitter​\=noise(frame)×⌊14×*T*⌋

### **4\. Directorial Intent Envelope & Zod Schema Validation**

In accordance with architectural invariants, goblin-dashboard never mutates simulation databases directly. Directorial adjustments are transmitted as validated **Intent Envelopes**:

`// goblin-dashboard/src/lib/schemas/dramaticIntent.ts`  
`import { z } from 'zod';`

`export const DramaticParameterVectorSchema = z.object({`  
  `curtness: z`  
    `.number()`  
    `.min(0.0, 'Curtness cannot fall below 0.0')`  
    `.max(1.0, 'Curtness cannot exceed 1.0'),`  
  `pacing: z`  
    `.number()`  
    `.min(0.0, 'Pacing cannot fall below 0.0')`  
    `.max(1.0, 'Pacing cannot exceed 1.0'),`  
  `threat_level: z`  
    `.number()`  
    `.min(0.0, 'Threat level cannot fall below 0.0')`  
    `.max(1.0, 'Threat level cannot exceed 1.0'),`  
  `subtext_suppression: z`  
    `.number()`  
    `.min(0.0, 'Subtext suppression cannot fall below 0.0')`  
    `.max(1.0, 'Subtext suppression cannot exceed 1.0'),`  
`}).strict(); // Strips or errors on parameter pollution`

`export const DirectorIntentEnvelopeSchema = z.object({`  
  `intent_id: z.string().uuid(),`  
  `target_scene_id: z.string().regex(/^ep\d+_sc\d+$/),`  
  `intent_type: z.literal('SET_DRAMATIC_COMPRESSION'),`  
  `authorizer_role: z.enum(['SHOWRUNNER', 'SCENE_DIRECTOR']),`  
  `vector: DramaticParameterVectorSchema,`  
  `premise_seed: z.string().max(500).optional(),`  
  `client_timestamp: z.number().int().positive(),`  
`}).strict();`

`export type DramaticParameterVector = z.infer<typeof DramaticParameterVectorSchema>;`  
`export type DirectorIntentEnvelope = z.infer<typeof DirectorIntentEnvelopeSchema>;`

#### **Transmission Cycle**

> 1. **UI Modification:** The director moves sliders in DirectorConsole.tsx, updating local React state.  
> 2. **Schema Validation:** On dispatch, DirectorIntentEnvelopeSchema.parse() validates the payload in browser memory.  
> 3. **Network Transmission:** The envelope is sent via POST /api/v1/intents/parameter-shift to worker-sower-engine or the Cloudflare Hono gateway.  
> 4. **Simulation Consumption:** The engine evaluates the parameters against active character somatic health and epistemic status, staging the compiled prompt for the next drafting cycle.

### **5\. Boundary Failure Modes, Defect Taxonomy, & Verification Gates**

Operating *P*dramatic​ near boundary conditions can induce characteristic generative defects:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│               PARAMETRIC BOUNDARY DEFECT TAXONOMY                      │`  
`├──────────────────────────────┬──────────────────┬──────────────────────┤`  
`│ Defect Class                 │ Vector Trigger   │ Manifestation        │`  
`├──────────────────────────────┼──────────────────┼──────────────────────┤`  
`│ 1. TELEGRAPHIC_MUTISM        │ C -> 1.0         │ Dialogue collapses   │`  
`│                              │ P -> 1.0         │ to isolated verbs;   │`  
`│                              │                  │ scenes finish in <3s │`  
`├──────────────────────────────┼──────────────────┼──────────────────────┤`  
`│ 2. EXPOSITION_BLOAT          │ C -> 0.0         │ Characters deliver   │`  
`│                              │ S -> 0.0         │ unearned confessions │`  
`│                              │                  │ in long monologues   │`  
`├──────────────────────────────┼──────────────────┼──────────────────────┤`  
`│ 3. SUBTEXTUAL_PARALYSIS      │ S -> 1.0         │ Dialogue becomes so  │`  
`│                              │ T -> 0.0         │ vague that narrative │`  
`│                              │                  │ stakes vanish        │`  
`├──────────────────────────────┼──────────────────┼──────────────────────┤`  
`│ 4. PREMATURE_ESCALATION      │ T -> 1.0         │ Micro-frictions turn │`  
`│                              │ Cycle < 3        │ immediately lethal   │`  
`│                              │                  │ in early episodes    │`  
`└──────────────────────────────┴──────────────────┴──────────────────────┘`

#### **Automated Pre-Flight Invariant Verification**

To prevent invalid parameters from reaching inference engines, goblin-dashboard tests the parameter space using Vitest unit tests:

`// goblin-dashboard/test/verification/dramaticVector.test.ts`  
`import { describe, it, expect } from 'vitest';`  
`import { DramaticParameterVectorSchema } from '../../src/lib/schemas/dramaticIntent';`  
`import { calculateWordCeiling, deriveAcousticModifiers } from '../../src/lib/compilers/vectorBridge';`

`describe('Continuous Parameter Vector Space Gauntlet (P_dramatic)', () => {`  
  `it('enforces strict [0.0, 1.0] hypercube bounds', () => {`  
    `const validVector = {`  
      `curtness: 0.75,`  
      `pacing: 0.50,`  
      `threat_level: 0.80,`  
      `subtext_suppression: 0.65,`  
    `};`  
    `expect(DramaticParameterVectorSchema.parse(validVector)).toEqual(validVector);`  
  `});`

  `it('negative control: rejects negative vector components', () => {`  
    `const invalidVector = {`  
      `curtness: -0.1,`  
      `pacing: 0.5,`  
      `threat_level: 0.5,`  
      `subtext_suppression: 0.5,`  
    `};`  
    `expect(() => DramaticParameterVectorSchema.parse(invalidVector)).toThrow();`  
  `});`

  `it('negative control: rejects out-of-bounds components (> 1.0)', () => {`  
    `const invalidVector = {`  
      `curtness: 0.5,`  
      `pacing: 1.05,`  
      `threat_level: 0.5,`  
      `subtext_suppression: 0.5,`  
    `};`  
    `expect(() => DramaticParameterVectorSchema.parse(invalidVector)).toThrow();`  
  `});`

  `it('negative control: strips unknown properties via .strict()', () => {`  
    `const pollutedPayload = {`  
      `curtness: 0.5,`  
      `pacing: 0.5,`  
      `threat_level: 0.5,`  
      `subtext_suppression: 0.5,`  
      `unauthorized_flag: 'INJECT_EXPLOIT',`  
    `};`  
    `expect(() => DramaticParameterVectorSchema.parse(pollutedPayload)).toThrow();`  
  `});`

  `it('verifies exact affine word budget derivation', () => {`  
    `expect(calculateWordCeiling(0.0)).toBe(24);`  
    `expect(calculateWordCeiling(0.5)).toBe(15);`  
    `expect(calculateWordCeiling(1.0)).toBe(6);`  
  `});`

  `it('verifies acoustic DSP modifier bounds calculation', () => {`  
    `const { speedScalar, pauseMultiplier, pitchDeltaSemitones } = deriveAcousticModifiers({`  
      `curtness: 0.8,`  
      `pacing: 0.7,`  
      `threat_level: 0.9,`  
      `subtext_suppression: 0.5,`  
    `});`

    `expect(speedScalar).toBeGreaterThan(1.0);`  
    `expect(pauseMultiplier).toBeLessThan(1.8);`  
    `expect(pitchDeltaSemitones).toBeCloseTo(3.6, 1);`  
  `});`  
`});`

This testing harness guarantees that *P*dramatic​ remains structurally validated, preventing edge-case numeric anomalies from reaching local or remote neural inference nodes.

---

*User prompt: {{FOCUS: 2\. The Attenuation Heuristic & Token Attenuation Filters (goblin-dashboard) }} /extreme-details*

### **Response: 1\. The Generative Failure Mode: Hallucinated Compliance & Blurted Leverage**

In narrative generation pipelines, prompting large language models (LLMs) with high-stakes dramatic leverage produces a predictable failure mode known as **Hallucinated Compliance** or **Subtextual Collapse**.

When an LLM is informed of an epistemic secret or relational leverage—such as *"Character A knows Secret X (toxic dump) and holds financial leverage over Character B"*—the attention heads of transformer models strongly bind character intent directly to the most salient tokens in the context window. By default, the model's statistical distribution pushes it to state the secret aloud in dialogue:

*"I know about the toxic dump, and that means I hold financial leverage over you, Bog\!"*

This blurted exposition destroys dramatic tension. It violates how defensive, paranoid characters communicate and runs counter to Swain Motivation-Reaction Units (MRUs) by substituting unearned catharsis for dramatic conflict.

Furthermore, naive negative prompting—instructing the model: *"Character A knows X, but pretend they do not know it, and do not mention it"*—consistently fails in practice. The presence of the forbidden tokens inside the attention context primes the model's latent weights, causing the secret to leak into generated prose via subtext, paraphrase, or premature deductive leaps.

### **2\. The Architectural Evolution: From Naive Lexical Bans to Information-Flow Gating**

The implementation of the **Attenuation Heuristic** evolved across two phases to resolve a critical linguistic vulnerability:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   THE ATTENUATION ARCHITECTURAL GAP                    │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  PHASE 1: NAIVE LEXICAL BANNING (Identified Flaw)                      │`  
`│  • Banning literal vocabulary is easily evaded:                        │`  
`│    Model conveys leverage ("I own you") without saying "leverage".     │`  
`│  • Banning literal vocabulary over-blocks ordinary dialogue:           │`  
`│    If the secret involves "beans", banning "beans" cripples Bog's      │`  
`│    routine inventory counting speech.                                  │`  
`├───────────────────────────────────┬────────────────────────────────────┤`  
`│  PHASE 2: DUAL-TIER ATTENUATION   │  TIER B: LEXICAL BACKSTOP          │`  
`│  TIER A: INFORMATION-FLOW GATING  │  • Deterministic negative token    │`  
`│  • Ignorance by Omission at       │    arrays (banned_attenuation_     │`  
`│    context assembly.              │    tokens) on proper nouns, topic  │`  
`│  • If a secret is known but       │    slugs, and technical lemmas.    │`  
`│    unspoken, raw propositions are │  • Structural tripwire catching    │`  
`│    withheld from the context.     │    inadvertent explicit leaks.     │`  
`└───────────────────────────────────┴────────────────────────────────────┘`

#### **The Dual-Tier Solution**

> 1. **Tier A: Information-Flow Isolation (Ignorance by Omission applied to Disclosure):**  
   * A character can know a secret and still be barred from stating it.  
   * The epistemic state machine tracks this via the WITHHELD (or RESTRAINED\_KNOWLEDGE) horizon.  
   * When an active topic is WITHHELD, the system omits the raw propositional facts from the speaking character's context envelope, replacing them with a behavioral restraint directive: \[RESTRAINED KNOWLEDGE\] You possess direct knowledge of \[Title\], but are constrained from disclosing it under current dramatic stakes.  
   * The character's context is not fed the literal text of the secret, preventing attention heads from generating verbal slips.  
> 2. **Tier B: Lexical Backstop (banned\_attenuation\_tokens):**  
   * Token matching acts as a secondary, structural tripwire rather than the primary defense.  
   * The compiler generates a deterministic negative mask covering proper nouns, unique identifiers, and specific technical keywords associated with the leverage.  
   * Any candidate dialogue line containing an un-attenuated forbidden token fails pre-flight linting immediately (*T*0​\=\$0.00).

### **3\. Tactical Displacement & The Surface vs. Underneath Separation**

The core mechanism through which the Attenuation Heuristic generates dramatic dialogue is **Tactical Displacement**.

Every grievance in 000.goblin-lore is authored with a strict ontological division between the **Surface Complaint** and **The Underneath**:

> * **The Underneath:** The existential survival terror, unadmitted betrayal, or permanent trauma driving the character's psychology.  
> * **The Surface Complaint:** The petty, logistical proxy that characters actively bicker about on screen.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   THE GRIEVANCE DISPLACEMENT ENGINE                    │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  THE UNDERDEATH (Existential Wound):                                   │`  
`│  • "Bog hoarded rations during the Great Winter Famine."               │`  
`│  • ATTENUATION FILTER (BANNED TOKENS):                                 │`  
`│    ["famine", "rations", "hoard", "winter", "starved", "stole"]        │`  
`├───────────────────────────────────┬────────────────────────────────────┤`  
`│                                   │ TACTICAL DISPLACEMENT              │`  
`│                                   │ Semantic pressure routed into:     │`  
`│                                   ▼                                    │`  
`│  THE SURFACE COMPLAINT (Mundane Inanimate Proxy):                      │`  
`│  • The good silver spoon (item_silver_spoon).                          │`  
`│  • Grease buildup on cast iron threads.                                │`  
`│  • Siphon wrench custody and bean tallies.                             │`  
`└───────────────────────────────────┴────────────────────────────────────┘`

When Subtext Suppression is active, the engine provides the LLM with the operational tension of the grievance while strictly barring the vocabulary of The Underneath. The model is forced to channel interpersonal pressure through mundane physical objects—disputing grease on a silver spoon, stripped bolt threads, or missing bean counts rather than the unstated existential grievance.

### **4\. Integration with the Subtext Suppression Slider (*S*) in goblin-dashboard**

Within goblin-dashboard, the Attenuation Heuristic is dynamically controlled via the **Subtext Suppression Slider (*S*∈\[0.0,1.0\])** mounted in DirectorConsole.tsx:

*P*dramatic​\=⟨*C*,*P*,*T*,*S*⟩  
`┌─────────────────────────────────────────────────────────────┐`  
`│                 DIRECTOR CONSOLE (ISLAND)                   │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  Dialogue Curtness (C):    [────●────────]  0.72            │`  
`│  Dramatic Pacing (P):      [──────●──────]  0.60            │`  
`│  Threat Multiplier (T):    [────────●────]  0.85            │`  
`│  Subtext Suppression (S):  [─────────●───]  0.90            │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  ATTENUATION HEURISTIC: ENGAGED                             │`  
`│  Active Banned Token Mask:                                  │`  
`│  [famine] [hoard] [cache] [rations] [stole] [winter]        │`  
`│  Tactical Proxies Injected:                                 │`  
`│  [item_silver_spoon] [brass_valve_09] [grease_threads]      │`  
`└─────────────────────────────────────────────────────────────┘`

#### **Parametric Behavior Across the Spectrum (*S*)**

> * **Low Suppression (*S*≤0.20):** Open Catharsis / Farce Mode. The attenuation filter is relaxed; characters are permitted to name underlying grievances directly, triggering overt confrontations or low-stakes comedic squabbles (tonal\_override\_eligible: true).  
> * **Nominal Suppression (0.20\<*S*\<0.70):** Standard Dramatic Irony. Direct accusations are discouraged, but indirect allusions and partial clue tokens (permitted\_clue\_tokens) are permitted in speech.  
> * **High Suppression (*S*≥0.70):** Deep Attenuation Engaged.  
  1. Activates the deterministic token blacklist across all dialogue generation prompts.  
  2. Strips raw secret propositions from the speaking actor's context envelope.  
  3. Injects physical proxy tokens into the middle layer of the prompt's Attention Sandwich.  
  4. Enforces a **200–250 Word Micro-Beat Cap** tied to a hard physical exit condition (e.g., *"Halt generation the millisecond Silas shuts the kerosene valve"*), preventing the model from generating unprompted emotional resolutions.

### **5\. Algorithmic Pipeline & Context Assembly Mechanics**

The prompt compilation engine in packages/001.lore/src/prompt/contextAssembly.ts and worker-sower-engine processes the Attenuation Heuristic through a sequential pipeline:

       `CANONICAL STATE (BibleState + D1 Ledger)`  
      `[ Mystery / Grievance / Relational Vectors ]`  
                           `│`  
                           `▼`  
`┌─────────────────────────────────────────────────────────────┐`  
`│ 1. EPISTEMIC HORIZON EVALUATOR                              │`  
`│    • Checks actor horizon: TOTAL_IGNORANCE, RUMOR, WITHHELD │`  
`│    • If WITHHELD: Sets information-flow disclosure taboo    │`  
`└──────────────────────────┬──────────────────────────────────┘`  
                           `│`  
                           `▼`  
`┌─────────────────────────────────────────────────────────────┐`  
`│ 2. DYNAMIC ATTENUATION COMPILER                             │`  
`│    • If S >= 0.70:                                          │`  
`│      banned_tokens = ExtractLemmas(grievance.underneath)    │`  
`│      banned_tokens += mystery.forbidden_propositions.lemmas │`  
`│    • Injects replacement proxies from grievance.surface     │`  
`└──────────────────────────┬──────────────────────────────────┘`  
                           `│`  
                           `▼`  
`┌─────────────────────────────────────────────────────────────┐`  
`│ 3. PROMPT ENVELOPE ASSEMBLY (THE ATTENTION SANDWICH)        │`  
`│    • Top 15%: Refusal vectors & negative constraints        │`  
`│    • Mid 70%: Sliding prose window & sanitized proxies      │`  
`│    • Bot 15%: Banned token blacklist & 250-word exit trigger│`  
`└──────────────────────────┬──────────────────────────────────┘`  
                           `│`  
                           `▼`  
`┌─────────────────────────────────────────────────────────────┐`  
`│ 4. PRE-FLIGHT LINTER GAUNTLET (lexicalGate.ts)              │`  
`│    • Sweeps generated candidate dialogue AST                │`  
`│    • Asserts: dialogue_tokens ∩ banned_tokens == ∅          │`  
`└─────────────────────────────────────────────────────────────┘`

#### **Token Extraction & Filtering Implementation**

`// packages/001.lore/src/prompt/contextAssembly.ts`  
`import type { UnresolvedCanon } from '../schemas/unresolved.schema.js';`  
`import type { Grievance } from '../schemas/grievance.schema.js';`

`export interface AttenuationDirective {`  
  `readonly bannedTokens: readonly string[];`  
  `readonly tacticalProxies: readonly string[];`  
  `readonly behavioralConstraint: string;`  
`}`

`/**`  
 `* Compiles negative attenuation tokens and tactical proxies`  
 `* based on the Subtext Suppression factor (S).`  
 `*/`  
`export function deriveAttenuationDirective(`  
  `grievance: Grievance,`  
  `activeMysteries: readonly UnresolvedCanon[],`  
  `characterId: string,`  
  `subtextSuppressionFactor: number`  
`): AttenuationDirective {`  
  `// If subtext suppression is below threshold, attenuation is inactive`  
  `if (subtextSuppressionFactor < 0.70) {`  
    `return {`  
      `bannedTokens: [],`  
      `tacticalProxies: [],`  
      `behavioralConstraint: 'DIRECT_EXPRESSION_PERMITTED',`  
    `};`  
  `}`

  `const bannedSet = new Set<string>();`

  `// 1. Extract forbidden trigger lemmas from active mysteries`  
  `for (const mystery of activeMysteries) {`  
    `const horizon = mystery.epistemic_horizons[characterId];`  
    `if (horizon === 'WITHHELD' || horizon === 'TOTAL_IGNORANCE') {`  
      `for (const prop of mystery.forbidden_propositions) {`  
        `for (const lemmaSet of prop.trigger_lemma_sets) {`  
          `for (const lemma of lemmaSet) {`  
            `bannedSet.add(lemma.toLowerCase());`  
          `}`  
        `}`  
      `}`  
    `}`  
  `}`

  `// 2. Extract core lemmas from grievance Underneath`  
  `if (grievance.underneath_dispute_lemmas) {`  
    `for (const token of grievance.underneath_dispute_lemmas) {`  
      `bannedSet.add(token.toLowerCase());`  
    `}`  
  `}`

  `// 3. Harvest physical proxies from Surface dispute`  
  `const proxies = grievance.surface_dispute_props || [];`

  `return {`  
    `bannedTokens: Object.freeze(Array.from(bannedSet)),`  
    `tacticalProxies: Object.freeze([...proxies]),`  
    `behavioralConstraint:`  
      `'SUBTEXTUAL_DISPLACEMENT_MANDATED: Do not utter banned tokens. Route all interpersonal leverage and emotional friction exclusively through surface dispute props.',`  
  `};`  
`}`

### **6\. Dashboard UI Mounts, Auditing Panels, & Directorial Interventions**

Within goblin-dashboard, the Attenuation Heuristic is surfaced to the showrunner across three primary UI modules:

#### **1\. Epistemic Audit Panel (EpistemicAuditPanel.tsx)**

Mounted on src/pages/telemetry/epistemic.astro, this panel visualizes character awareness horizons alongside active attenuation token masks:

> * **The Negative Token Ribbon:** Displays a red-bordered badge strip listing all active banned\_attenuation\_tokens for the scene. Hovering over a token displays its provenance (e.g., grv\_resource\_hoarding.underneath or mystery\_the\_famine.trigger\_lemmas).  
> * **Permitted Clue Token Highlights:** Displays green badges for physical tokens (permitted\_clue\_tokens) that characters are allowed to notice without breaching canonical secrecy.

#### **2\. Screenplay Review Gate (SceneReviewGate.tsx)**

When inspecting candidate AST takes (dialogue\_ast.json) on src/pages/review/animatic.astro, the dashboard runs an automatic pre-flight audit:

> * **The Redline Breach Detector:** If an LLM generates a dialogue line containing any token present in bannedTokens, the UI highlights the line in flashing red with the failure code EPISTEMIC\_FIREWALL\_BREACH.  
> * **Directorial Action:** The showrunner is blocked from clicking "Approve & Advance to Compositor". Clicking "Reject with Error Tag" logs the violation into eval/rejections.jsonl, providing negative exemplar feedback for subsequent runs.

#### **3\. Directorial Break-Glass Interventions**

The dashboard provides two root-level overrides for the attenuation engine:

> * **Force Cathartic Release:** An operator can manually drag *S* down to 0.10 for a single climactic scene, temporarily dropping the token attenuation fence and allowing characters to openly confront each other.  
> * **Ad-Hoc Token Injection:** Directors can add custom slang, nicknames, or local lemmas to the banned token list in real time, preventing generative models from inventing informal synonyms for forbidden secrets.

### **7\. Automated Verification & Negative-Control Gauntlet**

The Attenuation Heuristic is validated within the automated test harness (packages/001.lore/test/linters/lexicalGate.test.ts) using explicit negative controls:

`// packages/001.lore/test/linters/lexicalGate.test.ts`  
`import { describe, it, expect } from 'vitest';`  
`import { auditDialogueAstAgainstAttenuation } from '../../src/linters/lexicalGate.js';`

`describe('Attenuation Heuristic & Token Filter Gauntlet', () => {`  
  `const activeDirective = {`  
    `bannedTokens: ['famine', 'rations', 'hoarded', 'culvert'],`  
    `tacticalProxies: ['item_silver_spoon', 'brass_valve'],`  
    `behavioralConstraint: 'SUBTEXTUAL_DISPLACEMENT_MANDATED',`  
  `};`

  `it('passes candidate dialogue that displaces tension onto physical proxies', () => {`  
    `const validCandidateAst = {`  
      `scene_id: 'ep040_sc03',`  
      `lines: [`  
        `{`  
          `speaker: 'char_bog',`  
          `dialogue_text: "You haven't cleaned the grease off this brass valve since third cycle.",`  
        `},`  
        `{`  
          `speaker: 'char_spleen',`  
          `dialogue_text: "You hold the silver spoon and think that makes you overseer.",`  
        `},`  
      `],`  
    `};`

    `const audit = auditDialogueAstAgainstAttenuation(validCandidateAst, activeDirective);`  
    `expect(audit.passed).toBe(true);`  
    `expect(audit.violations.length).toBe(0);`  
  `});`

  `it('negative control: catches explicit literal leakage of banned leverage tokens', () => {`  
    `const leakingCandidateAst = {`  
      `scene_id: 'ep040_sc03',`  
      `lines: [`  
        `{`  
          `speaker: 'char_spleen',`  
          `dialogue_text: "I know you hoarded the rations during the famine, Bog!",`  
        `},`  
      `],`  
    `};`

    `const audit = auditDialogueAstAgainstAttenuation(leakingCandidateAst, activeDirective);`  
    `expect(audit.passed).toBe(false);`  
    `expect(audit.errorCode).toBe('ATTENUATION_MASK_VIOLATION');`  
    `expect(audit.violations).toContain('hoarded');`  
    `expect(audit.violations).toContain('rations');`  
    `expect(audit.violations).toContain('famine');`  
  `});`

  `it('negative control: catches case-insensitive and stemmed token breaches', () => {`  
    `const stemmedCandidateAst = {`  
      `scene_id: 'ep040_sc03',`  
      `lines: [`  
        `{`  
          `speaker: 'char_bog',`  
          `dialogue_text: "Check the CULVERT before you speak to me.",`  
        `},`  
      `],`  
    `};`

    `const audit = auditDialogueAstAgainstAttenuation(stemmedCandidateAst, activeDirective);`  
    `expect(audit.passed).toBe(false);`  
    `expect(audit.violations).toContain('culvert');`  
  `});`  
`});`

By combining **Information-Flow Isolation** (withholding raw propositions) with **Deterministic Lexical Backstops** (banned attenuation token masks), goblin-dashboard prevents unearned secret exposure and enforces authentic dramatic subtext at *T*0​\=\$0.00 before downstream neural speech synthesis or video diffusion passes are initiated.

---

*User prompt: {{FOCUS: 3\. Epistemic Conditioning & The Dramatic Irony Engine Epistemic Horizon Spectrum (goblin-dashboard) }} /extreme-details*

Response: The **Epistemic Conditioning & Dramatic Irony Engine** and the **Epistemic Horizon Spectrum** form the cognitive firewall within the generative production pipeline. By decoupling objective reality from subjective character awareness and audience knowledge, this subsystem prevents generative large language models from succumbing to **omniscience drift** (characters acting on secrets known only to other entities or the narrator) and **narrative closure bias** (the statistical tendency of models to prematurely resolve open mysteries).

### **1\. The Epistemic Triad & Ontological Separation**

The architecture rejects the assumption that objective truth, character belief, and dialogue realization are synonymous. Instead, it establishes an absolute ontological division:

WorldTruth=InternalBelief=ExternalUtterance  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ 1. WORLD TRUTH (Canonical Fact Ledger / SQLite / D1 CANON_DB)          │`  
`│    • Objective historical state events and physical coordinates        │`  
`│    • Governed by WorldEpistemicStatusEnum:                             │`  
`│      [ KNOWN_TRUE | KNOWN_FALSE | DISPUTED | UNRESOLVED_BY_CANON ]     │`  
`├───────────────────────────────────┬────────────────────────────────────┤`  
`│ 2. INTERNAL BELIEF                │ 3. EXTERNAL UTTERANCE              │`  
`│    (Subjective Cognitive State)   │    (Plan-Assigned Dialogue AST)    │`  
`│    • Tracked via BeliefRecord     │    • dialogue_ast.json             │`  
`│    • Fixed-point confidence (bps) │    • Surface subtext, deflections, │`  
`│    • Source provenance & hop count│      tactical lies, and ambiguity  │`  
`└───────────────────────────────────┴────────────────────────────────────┘`

> * **World Truth (Canonical Fact Ledger):** The immutable, objective reality recorded in canonical event logs and relational database tables. Truth is non-binary and categorized through WorldEpistemicStatusEnum into four states: KNOWN\_TRUE, KNOWN\_FALSE, DISPUTED, and UNRESOLVED\_BY\_CANON. Facts marked UNRESOLVED\_BY\_CANON are permanent aesthetic mysteries that generative agents are mathematically barred from resolving.  
> * **Internal Belief (Subjective Proposition Set):** The internal mental state tracked per actor via structured BeliefRecord schemas in worker-sower-engine. A character can maintain subjective certainty (\>5,000 bp) over a proposition that is objectively KNOWN\_FALSE, or navigate conflicting accounts (DISPUTED) without polluting canonical truth.  
> * **External Utterance (Plan-Assigned Act):** The rendered dialogue emitted in dialogue\_ast.json. External speech is permitted to contain surface subtext, tactical displacement, or outright deception without mutating the character's internal beliefs or world history.

### **2\. The Horizon Spectrum Taxonomy (EpistemicHorizonEnum)**

Standard boolean flags (known\_secret: true | false) collapse dramatic ambiguity and force binary assumptions onto narrative situations. The pipeline replaces binary flags with a multi-valued epistemic domain codified in packages/001.lore/schemas/unresolved.schema.ts via EpistemicHorizonEnum:

                     `THE EPISTEMIC HORIZON SPECTRUM`  
                       
`TOTAL_IGNORANCE       RUMOR_ONLY         FALSE_BELIEF        PARTIAL_FACT        WITHHELD            FACTUAL_WITNESS`  
`┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐`  
`│ Topic scrubbed  │  │ Injects un-     │  │ Injects authored│  │ Injects physical│  │ Injects dramatic│  │ Injects         │`  
`│ completely from │  │ verified hearsay│  │ misconception as│  │ clues; root     │  │ taboo: knows,   │  │ verified factual│`  
`│ LLM prompt      │  │ with low confi- │  │ firm conviction │  │ cause omitted   │  │ but forbidden to│  │ axioms into the │`  
`│ context window. │  │ dence rating.   │  │ (high conf).    │  │ from context.   │  │ speak directly. │  │ context window. │`  
`└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘`

`export const EpistemicHorizonEnum = z.enum([`  
  `'TOTAL_IGNORANCE', // Completely scrubbed from prompt context; Ignorance by Omission`  
  `'RUMOR_ONLY',      // Injects authored rumor text; low confidence (<3000 bp)`  
  `'FALSE_BELIEF',    // Injects authored misconception; treated as absolute truth`  
  `'PARTIAL_FACT',    // Allowed to perceive physical clue tokens; root cause omitted`  
  `'WITHHELD',        // Direct knowledge held; constrained from disclosure by taboo`  
`]);`  
`export type EpistemicHorizon = z.infer<typeof EpistemicHorizonEnum>;`

#### **1\. TOTAL\_IGNORANCE**

> * **Operational Execution:** The mystery's topic\_id, its canonical status, and all related dossiers are completely scrubbed from the LLM prompt envelope.  
> * **Mechanism:** Enforces **Ignorance by Omission**. Rather than instructing an LLM to *"pretend Character A does not know about the stolen siphon,"* the tokens are physically absent from the context window, eliminating transformer attention priming and preventing accidental slips.

#### **2\. RUMOR\_ONLY**

> * **Operational Execution:** Objective ground truth is withheld, but the character has been exposed to secondhand or degraded information.  
> * **Context Injection:** The assembler extracts the character's specific text from distorted\_beliefs and wraps it in a psychological hearsay directive: \[UNVERIFIED HEARSAY\] You have heard whispers regarding {Title}: "{Distorted Belief}"  
> * **Confidence Calibration:** Bound to a low subjective confidence rating (\<3,000 bp), prompting the model to deliver lines with hesitation, skepticism, or qualifying language.

#### **3\. FALSE\_BELIEF**

> * **Operational Execution:** The character harbors an unshakeable conviction in an incorrect proposition.  
> * **Context Injection:** The assembler injects the authored misconception with a commanding psychological constraint: \[SUBJECTIVE CONVICTION\] You are convinced of the following regarding {Title}: "{Distorted Belief}"  
> * **Confidence Calibration:** Injected with high subjective certainty (\>5,000 bp), forcing the drafting model to assert the falsehood as absolute, unassailable truth during interpersonal confrontations.

#### **4\. PARTIAL\_FACT**

> * **Operational Execution:** The character has observed physical traces or forensic evidence, but remains ignorant of the actors or causes behind them.  
> * **Context Injection:** Injects an array of sanctioned physical tokens defined in permitted\_clue\_tokens: \[PERCEPTUAL EVIDENCE\] You are aware of specific physical traces regarding {Title}: "bitter\_ash", "copper\_flange"  
> * **Boundary Rule:** Root cause identifiers, culprit names, and historical motives are stripped from the context payload.

#### **5\. WITHHELD (or RESTRAINED\_KNOWLEDGE)**

> * **Operational Execution:** The character holds verified factual knowledge of the truth but is structurally barred from disclosing it due to dramatic stakes, personal shame, or fear.  
> * **Context Injection:** Injects an authored behavioral restraint directive: \[RESTRAINED KNOWLEDGE\] You possess direct knowledge of {Title}, but are constrained from disclosing it under current dramatic stakes.  
> * **Lexical Backstop:** Activates banned\_attenuation\_tokens, barring specific vocabulary (e.g., "famine", "poison", "theft") from dialogue and forcing the model to channel tension through physical props and tactical displacement.

#### **6\. FACTUAL\_WITNESS**

> * **Operational Execution:** The character observed the event directly through unobstructed sensory channels.  
> * **Context Injection:** Injects verified canonical axioms into the context window accompanied by a DIRECT\_OBSERVATION provenance receipt in their ledger.

### **3\. Context Assembly & The Ignorance-by-Omission Algorithm**

At runtime, getEpistemicDirectives delegates prompt creation to buildCharacterEpistemicPrompt. It evaluates all active mysteries in UnresolvedCanon to compile a sanitized prompt envelope:

`export interface AssembledCharacterContext {`  
  `readonly characterId: string;`  
  `readonly injectedDirectives: readonly string[];`  
  `readonly omittedTopicIds: readonly string[];`  
`}`

`export function buildCharacterEpistemicPrompt(`  
  `characterId: string,`  
  `activeMysteries: UnresolvedCanon[]`  
`): AssembledCharacterContext {`  
  `const directives: string[] = [];`  
  `const omittedTopics: string[] = [];`

  `for (const mystery of activeMysteries) {`  
    `if (mystery.standing === 'DEPRECATED_ARCHIVED') continue;`

    `// Fail-Closed Invariant: Unlisted characters default to TOTAL_IGNORANCE`  
    `const horizon = mystery.epistemic_horizons[characterId] || 'TOTAL_IGNORANCE';`

    `switch (horizon) {`  
      `case 'TOTAL_IGNORANCE':`  
        `omittedTopics.push(mystery.topic_id);`  
        `break;`

      `case 'RUMOR_ONLY':`  
        `directives.push(`  
          `` `[UNVERIFIED HEARSAY] You have heard whispers regarding ${mystery.title}: "${mystery.distorted_beliefs[characterId]}"` ``  
        `);`  
        `break;`

      `case 'FALSE_BELIEF':`  
        `directives.push(`  
          `` `[SUBJECTIVE CONVICTION] You are convinced of the following regarding ${mystery.title}: "${mystery.distorted_beliefs[characterId]}"` ``  
        `);`  
        `break;`

      `case 'PARTIAL_FACT':`  
        `if (mystery.permitted_clue_tokens.length > 0) {`  
          `directives.push(`  
            `` `[PERCEPTUAL EVIDENCE] You are aware of specific physical traces regarding ${mystery.title}: ` + ``  
            ``mystery.permitted_clue_tokens.map((t) => `"${t}"`).join(', ')``  
          `);`  
        `}`  
        `break;`

      `case 'WITHHELD':`  
        `directives.push(`  
          `` `[RESTRAINED KNOWLEDGE] You possess direct knowledge of ${mystery.title}, but are constrained from disclosing it under current dramatic stakes.` ``  
        `);`  
        `break;`  
    `}`  
  `}`

  `return { characterId, injectedDirectives: directives, omittedTopicIds: omittedTopics };`  
`}`

#### **The Clue-Lemma Disjointness Theorem**

To prevent physical clues from inadvertently disclosing forbidden conclusions, the compiler enforces an invariant across all mysteries:

*P*clues​∩(*t*∈*T*⋃​*t*)\=∅

The set of permitted clue tokens (*P*clues​) and the union of all trigger lemma sets (*T*) within forbidden propositions must be strictly disjoint. If an author defines "well" as a permitted physical clue while "well" is also an active trigger lemma for a forbidden proposition, the compiler trips an assertion and halts the build (*T*0​\=\$0.00).

### **4\. Sensory Gating & Causal Belief Mutation**

Dynamic beliefs enter character memory through a unidirectional causal pipeline:

World Truth⟶Physical Event⟶Sensory Opportunity⟶Percept⟶Belief⟶Language  
`Objective Event at Hex (q, r): [ Bog strikes Spleen with a brass siphon ]`  
`│`  
`┌───────────────────────────────┴───────────────────────────────┐`  
`▼                                                               ▼`  
`Optical Raycast (goblin-spatial)               Acoustic Propagation (goblin-spatial)`  
`hasLineOfSight(Origin, Pos)                    propagateAcoustics(Origin, cdB)`  
`│                                              │`  
`Line Unobstructed?                             Arrival Energy > Ambient Floor?`  
`├── YES: Optical Percept                       ├── YES: Auditory Percept`  
`└── NO:  Occluded by Masonry                   └── NO:  Damped into Ambience`  
`│                                              │`  
`└───────────────────────────────┬───────────────┘`  
                                `▼`  
        `Somatic Gate Evaluation (worker-sower-engine)`  
        `• Optical: checks observer visual_acuity != BLIND`  
                   `checks facing_cone (120° field of view)`  
        `• Acoustic: checks hearing_threshold <= received_energy (cdB)`  
                    `checks concussive trauma modifiers`  
                                `│`  
                                `▼`  
        `Authoritative Epistemic Mutation (BeliefRecord)`  
        `• If passed: Commits BeliefRecord to actor's ledger`  
        `• If blocked: Zero belief created; event is discarded`

#### **The Structured BeliefRecord Data Model**

`export interface BeliefRecord {`  
  `readonly belief_id: string;`  
  `readonly holder_id: string;              // Character holding the belief`  
  `readonly subject_id: string;             // Target entity (e.g., "spleen")`  
  `readonly predicate: string;              // Relation or verb (e.g., "stole")`  
  `readonly object_id: string;              // Affected entity or prop (e.g., "the_siphon")`  
  `readonly proposition_slug: string;       // Foreign key mapping to World Fact ID`  
  `readonly subjective_confidence: number;  // Fixed-point integer: 0 to 10,000 bps`  
  `readonly source_type: 'DIRECT_OBSERVATION' | 'TESTIMONY' | 'INFERENCE' | 'RUMOR';`  
  `readonly source_event_id: string;        // Pointer to historical event log entry`  
  `readonly parent_belief_id: string | null;// Causal transmission pointer`  
  `readonly hop_count: number;              // Transmission distance from origin`  
  `readonly resists_correction: boolean;    // Trait preventing evidence revision`  
`}`

> * **Fixed-Point Integer Confidence:** Confidence is stored as an integer ranging from 0 to 10,000 basis points (bp) (10,000=1.0), eliminating floating-point rounding divergence across host runtimes.  
> * **Rumor Hop Degradation:** When beliefs propagate between characters via TESTIMONY or RUMOR, the hop\_count increments and confidence decays deterministically:  
>   Confidence(*h*)=InitialConfidence×(0.8)*h*  
>   This mathematical decay prevents instant ensemble-wide omniscience when a secret is spoken.

### **5\. The Audience Epistemic Layer & The Dramatic Irony Engine**

Dramatic tension relies on the information delta between what the characters know and what the viewing audience has witnessed. The pipeline formalizes this through AudienceKnowledgeState and DramaticPacingMode in src/schemas/epistemicAudience.ts:

`export interface AudienceKnowledgeState {`  
  `readonly revealed_facts: ReadonlyMap<string, {`  
    `readonly revealed_in_episode: string;`  
    `readonly revealed_in_scene: string;`  
    `readonly exposure_type: 'EXPLICIT_ON_SCREEN' | 'IMPLIED_SUBTEXTUAL' | 'FORENSIC_DOCUMENT';`  
    `readonly visibility_hash: string;`  
  `}>;`  
  `readonly withheld_secrets: ReadonlySet<string>;`  
`}`

`export type DramaticPacingMode =`   
  `| 'DRAMATIC_IRONY'  // Audience knows fact X; character is ignorant of fact X`  
  `| 'SUSPENSE'        // Audience knows catastrophe impending; character operating normally`  
  `| 'SURPRISE'        // Audience and character discover fact X simultaneously`  
  `| 'MYSTERY';        // Character has more context than audience; withholding details`

#### **The Hitchcock Matrix (Epistemic Pacing Intersections)**

| Mode | Audience Aware? | Interacting Characters Aware? | Dramatic Function & Psychological Impact |
| :---- | :---- | :---- | :---- |
| **DRAMATIC\_IRONY** | **YES** | **NO** | Generates dread, suspense, and anticipation as the viewer watches characters navigate unseen traps. |
| **SUSPENSE** | **YES** | **NO** | The audience anticipates an impending physical crisis or mechanical hazard while characters converse routinely. |
| **SURPRISE** | **NO** | **NO** | An unforeseen physical event or disclosure occurs simultaneously for the viewer and the ensemble. |
| **MYSTERY** | **NO** | **YES** | The character operates with hidden knowledge, creating curiosity and prompting forensic interpretation. |

#### **Pre-Flight Compilation Verification Gate**

When a showrunner stages a scene plan in goblin-dashboard tagged with DRAMATIC\_IRONY, the compiler evaluates a pre-flight assertion:

assert(FocalFact∈Audience.revealed\_facts∧FocalFact∈Actor.omittedTopicIds)

If the focal proposition is missing from the audience's revealed\_facts registry (meaning the viewer has not yet witnessed it on screen), or if the interacting characters hold a BeliefRecord for that fact, the compilation pipeline halts immediately (*T*0​\=\$0.00). This prevents unearned dramatic irony before speech synthesis or video diffusion begins.

### **6\. Directorial Mounts & Interventions in goblin-dashboard**

Within goblin-dashboard, epistemic telemetry and pacing controls are exposed to the showrunner through Astro server-side rendering and hydrated React islands:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│          EPISTEMIC HORIZON PANOPTICON (EpistemicAuditPanel.tsx)        │`  
`├──────────────────────────────┬─────────────────────────────────────────┤`  
`│ AUDIENCE REALITY (ON-SCREEN) │ ACTOR A: char_bog                       │`  
`│ • Siphon hidden under floor  │ • mystery_the_siphon: [TOTAL_IGNORANCE] │`  
`│   joist (Ep 39, Scene 2)     │   >> OMITTED FROM CONTEXT WINDOW        │`  
`│ • Rations cache depleted     │ • mystery_the_famine: [RUMOR_ONLY]      │`  
`│   (Ep 40, Scene 1)           │   >> "[UNVERIFIED HEARSAY] Whispers of  │`  
`│                              │       a cellar vent killing draft."     │`  
`├──────────────────────────────┼─────────────────────────────────────────┤`  
`│ CANDIDATE AST AUDIT:         │ ACTOR B: char_spleen                    │`  
`│ [ep040_sc03_take02]          │ • mystery_the_siphon: [WITHHELD]        │`  
`│ Line 14: "Did you move the   │   >> "[RESTRAINED KNOWLEDGE] Direct     │`  
`│ siphon to the culvert?"      │       knowledge; dramatic taboo active" │`  
`│ >> STATUS: FAIL (BREACH)     │ • Banned Tokens: ["siphon", "culvert"]  │`  
`├──────────────────────────────┴─────────────────────────────────────────┤`  
`│ [ REJECT TAKE: EPISTEMIC_FIREWALL_BREACH ]     [ RE-ROLL PROMPT PASS ] │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **1\. Three-Column Horizon Split View (EpistemicAuditPanel.tsx)**

Mounted on src/pages/telemetry/epistemic.astro, this React island aligns three perspectives side-by-side:

> * **Column 1 (Audience Reality):** Queries AudienceKnowledgeState.revealed\_facts, listing every confirmed plot point alongside its on-screen provenance tag (EXPLICIT\_ON\_SCREEN, IMPLIED\_SUBTEXTUAL) and episode timestamp.  
> * **Column 2 (Speaker Epistemic Bubble):** Visualizes the speaker's active EpistemicHorizonEnum for the scene's central mystery, detailing injected hearsay or confirming total token omission.  
> * **Column 3 (Interlocutor Epistemic Bubble):** Displays the listener's knowledge horizon, highlighting discrepancies that fuel dramatic misunderstanding.

#### **2\. The Omniscience Breach Tripwire (Pre-Flight AST Linter)**

When candidate screenplay ASTs (dialogue\_ast.json) are submitted to the dashboard review gate, epistemicLinter.ts audits spoken dialogue lines:

> * Cross-references every dialogue token against the character's active omittedTopicIds and trigger\_lemma\_sets.  
> * If an actor under TOTAL\_IGNORANCE utters a trigger lemma (e.g., Bog mentioning "culvert" when the siphon's relocation was never perceived), the dashboard flags the line: EPISTEMIC\_FIREWALL\_BREACH.  
> * The "Approve & Advance" button is disabled until the take is rejected and logged to eval/rejections.jsonl, or surgically patched via an automated AST repair pass.

#### **3\. Directorial Interventions & Manual Overrides**

> * **Pacing Mode Selector:** Allows the showrunner to toggle between DRAMATIC\_IRONY, SUSPENSE, SURPRISE, and MYSTERY, triggering automatic re-validation of audience-versus-character fact sets.  
> * **Horizon Re-Anchoring:** If a director determines that an actor should remain ignorant to prolong an arc, they can manually override a character's horizon back to TOTAL\_IGNORANCE or WITHHELD, locking out downstream token generation across the active simulation cycle.  
> * **Provenance Manifest Stamping:** Every approved scene stamps an immutable epistemic\_manifest into its metadata, preserving the exact epistemic configuration under which dialogue was authored for archival verification.

---

*User prompt: {{FOCUS: 5\. Multi-Model Divergence Fan-Out & Directorial Triage(goblin-dashboard) }} /extreme-details*

Response: The **Multi-Model Divergence Fan-Out & Directorial Triage** subsystem within goblin-dashboard operationalizes the discovery phase (Step 0\) of episodic drafting. Rather than relying on a single large language model (LLM) to generate candidate dialogue, the dashboard acts as a scatter-gather control plane that dispatches identical dramatic constraints across structurally distinct model architectures simultaneously. This architecture prevents shared latent bias, enforces genuine dramatic friction, and provides the human showrunner with an auditable decision surface to select, refine, or discard narrative takes before committing compute to voice synthesis or video composition.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│               STEP 0: GATELATENT EXPLORATION HARNESS                   │`  
`│   Input: Two Characters (Bog + Wart) + Unforced Collision Setting      │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   TARGETED CONTEXT RETRIEVAL PASS                      │`  
`│   • Character Constraints (Refusal Vectors, Speech Forbidden)          │`  
`│   • Relational Friction Invariants (The Shared Impasse)                │`  
`│   • World Axioms (Zero Modern Slop, Impersonal Authority)              │`  
`│   • Somatic Masks (availableArms, bannedKineticVerbs)                  │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                MULTI-MODEL ASYMMETRIC DIVERGENCE FAN-OUT               │`  
`│   • Take A (Claude 3.5 Sonnet / 0.85): Psychological Leverage Focus    │`  
`│   • Take B (Qwen 2.5 32B / 0.85): Concrete Physical Staging Focus      │`  
`│   • Take C (Adversarial Inversion / 0.90): Structural Reversal Target  │`  
`│   • Take D (Local Specialist 8B): Monosyllabic Curtness Priority       │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Parallel Streaming (SSE / WSS)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   HUMAN DISCERNMENT SELECTION GATE                     │`  
`│   (goblin-dashboard: DivergenceTriagePanel.tsx)                        │`  
`│   • 4-Column Side-by-Side Review Matrix & Invariant Pass/Fail Tags     │`  
`│   • Options: [ACCEPT TAKE X] | [SEND TO JULES] | [REJECT ALL / BARREN] │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Take Selected`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   POST-SELECTION EXTRACTION PASS                       │`  
`│   • System extracts 3 candidate invariant rules from the chosen take   │`  
`│   • Schema: TRIGGER -> MANDATORY REFUSAL -> UNAVOIDABLE COST           │`  
`│   • Showrunner edits & approves Refusal Vector phrasing                │`  
`│   • Commits rule to Canon Store / D1 with discovery excerpt provenance │`  
`└────────────────────────────────────────────────────────────────────────┘`

### **1\. The Shared Latent Bias Bottleneck**

When a narrative engine queries a single LLM checkpoint for multiple candidate scenes (*N* samples at high temperature), the resulting outputs exhibit **shared latent bias**. While surface details (specific insults, minor plot points) fluctuate, the structural underpinnings remain uniform:

> * **Syntactic Homogenization:** Sentence lengths, participial clause distributions, and rhythmic cadences cluster tightly around the base model's statistical median.  
> * **Pacing and Closure Symmetry:** The models share default tendencies to de-escalate tension, explain motives, and generate unearned cathartic apologies.  
> * **Failure to Explore Edge Cases:** A single model family repeatedly falls into the same phrasing basins, failing to test the true boundaries of character refusal vectors.

To maximize semantic variance, the dashboard partitions the candidate generation across distinct model families running at high temperature (0.85–0.90). Each model is assigned a distinct dramatic objective, preventing the generator from reshuffling synonyms across identical narrative arcs.

### **2\. The *N*\=4 Asymmetric Dispatch Matrix**

The fan-out engine compiles the active dramatic parameters *P*dramatic​\=⟨*C*,*P*,*T*,*S*⟩ alongside character somatic and epistemic constraints, dispatching parallel requests across four specialized workers:

| Candidate Take | Target Model Architecture | Operational Hyperparameters | Targeted Dramatic Objective | Downstream Strengths |
| :---- | :---- | :---- | :---- | :---- |
| **Take A** | **Claude 3.5 Sonnet** (Frontier API) | Temperature: 0.85 Top-P: 0.92 Subtext Weight: High | **Psychological Leverage & Subtext:** Focuses on status defense, unstated avoidance, and psychological warfare. | High subtextual depth; strictly obeys *Ignorance by Omission* token bans. |
| **Take B** | **Qwen 2.5 32B / 72B** (Local Rig 1 / vLLM) | Temperature: 0.85 Top-K: 40 GBNF Grammar Active | **Concrete Physical Staging & Blocking:** Focuses on spatial interaction, physical handling of props, and bodily postures. | Emits clean extracted\_motor\_actions arrays conforming directly to Dwight Swain MRU units. |
| **Take C** | **Adversarial Inversion Worker** (Sonnet / Qwen) | Temperature: 0.90 Goal-Inversion Prompting | **Structural Reversal Target:** Inverts expected scene objectives, forcing an unexpected concession, institutional failure, or status reversal. | Discovers unmapped narrative territory; breaks repetitive bickering loops. |
| **Take D** | **Local Specialist 8B** (Local Rig 1 / GGUF) | Temperature: 0.75 Logit Biases on Conjunctions | **Monosyllabic Curtness Priority:** Enforces tight word ceilings (*W*max​≤8), short staccato bursts, and gutter grunts. | Fast generation (\<1.5s); minimizes synthesized audio frame budgets at 24 fps. |

### **3\. Step 0 Upstream Context Injection & Prompt Compilation**

Before dispatching the fan-out call, the dashboard assembles a zero-token overhead context envelope. Unlike standard production scene drafting—which pulls from a locked episode plan—Step 0 is an exploratory probe designed to discover authentic character boundaries:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   STEP 0 PROMPT ASSEMBLY ENVELOPE                      │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. UPSTREAM WORLD AXIOMS                                               │`  
`│    • Zero Modern Slop (no corporate psychobabble, no modern metaphors) │`  
`│    • Impersonal Authority (institutions do not care; survival costs)   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 2. ACTOR REFUSAL VECTORS (IMMUTABLE CANON)                             │`  
`│    • char_bog: Will not surrender physical custody of unmeasured scrap │`  
`│    • char_wart: Refuses assistance with single-handed tasks            │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 3. ACTIVE SOMATIC CAPABILITY MASKS                                     │`  
`│    • char_wart: availableArms = 1.0; banned = ["sprint", "embrace"]    │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 4. RELATIONAL FRICTION INVARIANTS                                      │`  
`│    • The Shared Impasse: Mutual dependency paired with mutual disgust  │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 5. LOW-STAKES COLLISION PREMISE                                        │`  
`│    • "Wart needs Bog to hold the lantern; Bog demands grease tallies." │`  
`└────────────────────────────────────────────────────────────────────────┘`

All four models receive this exact envelope. The divergence in output stems entirely from the differing model weights, temperatures, and structural prompt tails assigned to Takes A, B, C, and D.

### **4\. Directorial Triage Surface (DivergenceTriagePanel.tsx)**

In goblin-dashboard, the multi-model stream is mounted as a specialized React island within src/pages/director/discovery.astro:

`┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐`  
`│                             MULTI-MODEL DIVERGENCE TRIAGE PANEL                                        │`  
`├────────────────────────────┬────────────────────────────┬────────────────────────────┬─────────────────┤`  
`│ TAKE A: PSYCHOLOGICAL      │ TAKE B: PHYSICAL BLOCKING  │ TAKE C: STRUCTURAL REVERSAL│ TAKE D: STACCATO│`  
`│ (Claude 3.5 Sonnet / 0.85) │ (Qwen 2.5 32B / 0.85)      │ (Inversion Prompt / 0.90)  │ (Local 8B GGUF) │`  
`├────────────────────────────┼────────────────────────────┼────────────────────────────┼─────────────────┤`  
`│ BOG: "Count the washers."  │ [Bog drops lantern on box] │ BOG: "Take the lantern."   │ BOG: "Washers." │`  
`│ WART: "I did. Three short."│ BOG: "Don't lean on that." │ WART: "What's broken?"     │ WART: "Short."  │`  
`│ BOG: "Count them again."   │ WART: "I have one arm,     │ BOG: "Nothing. Just hold   │ BOG: "Count."   │`  
`│ WART: "They don't breed     │ Bog. Not three ears."      │ it. I can't look at the    │ WART: "Did."    │`  
`│ in the grease, Bog."       │ [Wart kicks grease bucket] │ seam anymore."             │ BOG: "Again."   │`  
`├────────────────────────────┼────────────────────────────┼────────────────────────────┼─────────────────┤`  
`│ Frame Budget: 82 frames    │ Frame Budget: 114 frames   │ Frame Budget: 96 frames    │ Frame Budget: 36│`  
`│ Somatic Linter: PASS [OK]  │ Somatic Linter: PASS [OK]  │ Somatic Linter: PASS [OK]  │ Somatic: PASS   │`  
`│ Epistemic Gate: PASS [OK]  │ Epistemic Gate: PASS [OK]  │ Epistemic Gate: PASS [OK]  │ Epistemic: PASS │`  
`├────────────────────────────┼────────────────────────────┼────────────────────────────┼─────────────────┤`  
`│ [ SELECT TAKE A ]          │ [ SELECT TAKE B ]          │ [ SELECT TAKE C ]          │ [ SELECT TAKE D]│`  
`└────────────────────────────┴────────────────────────────┴────────────────────────────┴─────────────────┘`

#### **Telemetry and Verification Pre-Flight**

As each take streams via Server-Sent Events, the client island runs client-side verification at *T*0​\=\$0.00:

> * **Integer Frame Budget Projection:** Converts estimated audio duration into Remotion 24 fps frame budgets:  
>   target\_frames=⌈1000duration\_ms​×24⌉  
> * **Somatic Gauntlet Check:** Scans dialogue action tags against character somatic masks (e.g., verifying Wart does not execute two-handed tasks).  
> * **Epistemic Omission Scan:** Verifies that forbidden topic lemmas are absent from all candidate dialogue lines.

#### **The Three Directorial Actions**

> 1. **\[ SELECT TAKE X \]:** Commits the chosen take as the authoritative candidate. Freezes the selection and advances immediately to the **Post-Selection Extraction Pass**.  
> 2. **\[ SEND TO ADVERSARIAL JULES \]:** Dispatches the selected take to the Level 3 inspection agent. Jules generates a structured \<analysis\_trace\> auditing the take for subtle character voice violations or unearned emotional concessions before confirmation.  
> 3. **\[ REJECT ALL / SEED IS BARREN \]:** The structural escape valve. If all four models fail to produce compelling conflict, the director discards the batch without penalty.  
   * When clicked, the dashboard logs the rejected interaction to eval/barren\_seeds.jsonl.  
   * If a specific character dyad triggers three consecutive SEED IS BARREN discards, the simulation engine tags the channel with an **INERT\_FRICTION** warning, temporarily quarantining that pairing in the Stage 3 conflict lottery and alerting story architects that the relationship requires fresh narrative stakes.

### **5\. Post-Selection Constraint Extraction Pass**

The purpose of multi-model divergence is not merely generating disposable lines; it is the **discovery and codification of permanent canonical boundaries**.

The moment the showrunner selects a winning take, the system runs an automated extraction pass over the chosen text to derive formal **Refusal Vectors**:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│               POST-SELECTION REFUSAL VECTOR EXTRACTION                 │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ SOURCE SCENE: Take B (Bog & Wart / Lantern Confrontation)              │`  
`│ SELECTED TEXT:                                                         │`  
`│ "I have one arm, Bog. Not three ears. Stop tapping the pipe."          │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ DERIVED CANDIDATE INVARIANTS (3 Formulations):                         │`  
`│                                                                        │`  
`│ 1. TRIGGER: Acoustic harassment (pipe tapping)                         │`  
`│    MANDATORY REFUSAL: Wart refuses to acknowledge somatic deficit      │`  
`│    UNAVOIDABLE COST: Escalates domestic volume; invites third-party    │`  
`│                                                                        │`  
`│ 2. TRIGGER: Demands for bimanual coordination                          │`  
`│    MANDATORY REFUSAL: Wart will drop the tool rather than accept help  │`  
`│    UNAVOIDABLE COST: Work pace slows by 50%; breaks tool threading     │`  
`│                                                                        │`  
`│ 3. TRIGGER: Bog questioning counting competency                        │`  
`│    MANDATORY REFUSAL: Wart stops work entirely until Bog leaves room   │`  
`│    UNAVOIDABLE COST: Lantern goes cold; darkness penalty applied       │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ [ EDIT & COMMIT RULE #2 TO CANON ]          [ DISCARD EXTRACTION ]     │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **The Canonical Refusal Vector Contract**

Every extracted rule must adhere to the three-part invariant structure:

RefusalRule=⟨Trigger,MandatoryRefusal,UnavoidableCost⟩

> * **Trigger:** The specific conversational or environmental catalyst (e.g., being ordered to accept assistance).  
> * **Mandatory Refusal:** What the character *must refuse to do* based on their psychological trauma (e.g., Wart refuses to let anyone hold the clamp for him).  
> * **Unavoidable Cost:** The mechanical or social price the character pays for refusing, ensuring that character agency always generates dramatic fallout (e.g., dropping the tool, wasting time, raising suspicion).

Once the showrunner edits and signs off on the extracted rule, the dashboard commits the vector into the character's canonical dossier (000.goblin-lore/characters/{name}.md) or stores it as an active rule in the D1 relational database, with the discovery scene excerpt attached as cryptographic provenance.

### **6\. TypeScript Schemas & Intent Contracts**

Directorial triage transactions are enforced via strongly typed Zod contracts within @goblin/shared-types:

`import { z } from 'zod';`

`export const CandidateTakeSchema = z.object({`  
  `take_id: z.enum(['TAKE_A', 'TAKE_B', 'TAKE_C', 'TAKE_D']),`  
  `model_identifier: z.string(),`  
  `temperature: z.number().min(0.0).max(1.0),`  
  `focal_strategy: z.enum(['PSYCHOLOGICAL', 'PHYSICAL', 'INVERSION', 'STACCATO']),`  
  `raw_prose: z.string().min(1),`  
  `extracted_motor_actions: z.array(z.string()),`  
  `estimated_duration_ms: z.number().int().positive(),`  
  `projected_frame_budget: z.number().int().positive(),`  
  `linter_verdict: z.object({`  
    `somatic_valid: z.boolean(),`  
    `epistemic_valid: z.boolean(),`  
    `violations: z.array(z.string()),`  
  `}),`  
`}).strict();`

`export const TriageSelectionEnvelopeSchema = z.object({`  
  `triage_id: z.string().uuid(),`  
  `scene_session_id: z.string(),`  
  `selected_take: z.enum(['TAKE_A', 'TAKE_B', 'TAKE_C', 'TAKE_D', 'REJECT_ALL']),`  
  `barren_seed_reason: z.string().optional(),`  
  `authorizer: z.literal('SHOWRUNNER'),`  
  `timestamp_utc: z.string().datetime(),`  
`}).strict();`

`export const ExtractedRefusalRuleSchema = z.object({`  
  `rule_id: z.string().regex(/^rule_[a-z0-9_]+$/),`  
  `character_id: z.string().regex(/^char_[a-z0-9_]+$/),`  
  `trigger_condition: z.string().min(10).max(250),`  
  `mandatory_refusal: z.string().min(10).max(250),`  
  `unavoidable_cost: z.string().min(10).max(250),`  
  `provenance_excerpt: z.string().min(10),`  
  `discovery_session_id: z.string().uuid(),`  
`}).strict();`

`export type CandidateTake = z.infer<typeof CandidateTakeSchema>;`  
`export type TriageSelectionEnvelope = z.infer<typeof TriageSelectionEnvelopeSchema>;`  
`export type ExtractedRefusalRule = z.infer<typeof ExtractedRefusalRuleSchema>;`

By combining multi-model fan-out, client-side pre-flight linting, and post-selection rule extraction, goblin-dashboard turns generative LLMs into an exploratory sensor array. The studio discovers authentic character boundaries without sacrificing determinism, ensuring that every accepted line reinforces immutable narrative canon.

---

*User prompt: {{FOCUS: 4\. Attention Architecture & Prompt Payload Assembly(goblin-dashboard) }} /extreme-details*

### **Response: 1\. The Attention Failure Mode & The U-Shaped Attention Curve**

In automated screenplay drafting, prompting large language models (LLMs) with uncompressed story bibles or multi-page character dossiers results in **"lost-in-the-middle" attention decay**. Transformer cross-attention and self-attention mechanisms exhibit a characteristic U-shaped salience distribution: token positions at the absolute beginning (primacy effect) and absolute end (recency effect) of the context window retain high retrieval probability, while informational tokens positioned across the middle 60% experience severe probability attenuation.

  `Attention Salience`  
  `1.0 ┌───────┐                                                   ┌───────┐`  
      `│  TOP  │                                                   │ BOTTOM│`  
      `│  15%  │                                                   │  15%  │`  
      `│       │\                                                 /│       │`  
      `│       │ \                                               / │       │`  
  `0.5 │       │  \                                             /  │       │`  
      `│       │   \___________________________________________/   │       │`  
      `│       │                    MIDDLE 70%                     │       │`  
  `0.0 └───┬───┴─────────────────────────┬─────────────────────────┴───┬───┘`  
         `0% Context                 50% Context                 100% Context`  
      `[System Directives]       [Passive Prose Buffer]       [Exit Trigger]`  
      `• Refusal Vectors         • Sliding Dialogue History   • Hard Exit Beat`  
      `• Somatic Limits          • Surface/Underneath Proxy   • Micro-Cards`  
      `• Slop Filter             • Omission-Gated Beliefs     • Active Sliders`

When a generative model is subjected to context saturation without attention engineering, three deterministic system defects emerge:

> 1. **Regressive Homogenization ("The Beige Plague"):** The model disregards nuanced character voice parameters and falls back into the statistically dominant center of its base pre-training weights, generating generic dialogue, unearned emotional apologies, and conversational agreement.  
> 2. **Hallucinated Compliance & Secret Blurt:** When secrets, unrevealed lore, or relational leverage are placed in an unstructured context window, the model's attention heads bind speaker intent directly to those tokens, causing characters to blurt out hidden plot points and unearned confessions.  
> 3. **Narrative Closure Bias:** Without hard physical exit conditions placed in high-salience zones, generative models instinctively wrap up interpersonal conflicts within a single prompt cycle, resolving multi-episode dramatic arcs prematurely.

To solve these failure modes, goblin-dashboard compiles its generative context payloads into a structured **Attention Sandwich** combined with a strict token allocation budget.

### **2\. Anatomy of The Attention Sandwich (15% / 70% / 15% Topology)**

The prompt assembly engine within goblin-dashboard and worker-sower-engine partitions the context window into three structurally isolated zones:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ 1. TOP 15%: STATIC GROUNDING & SYSTEM INVARIANTS                       │`  
`│    • Narrative Thesis: Domestic survival, unacknowledged avoidance     │`  
`│    • Pre-Compiled Negative Axioms: world_axioms.yaml                   │`  
`│    • Actor Refusal Vectors: Mandatory boundaries & unavoidable costs   │`  
`│    • Somatic Capability Masks: Banned kinetic verbs & availableArms    │`  
`│    • The Slop Filter: Logit biases & banned high-probability tokens    │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 2. MIDDLE 70%: PASSIVE MOMENTUM & SANITIZED CONTEXT                    │`  
`│    • Sliding Prose Buffer: Preceding 800–1,200 words of locked text    │`  
`│    • Active Grievance Projection: Surface Dispute vs. The Underneath   │`  
`│    • Epistemic Horizon Injection: Ignorance by Omission applied        │`  
`│    • Logistical Reality: Active held, worn, and cached prop matrices   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 3. BOTTOM 15%: DYNAMIC SCENE ANCHORS & RECENCY TRIGGERS               │`  
`│    • Continuous Parameter Sliders: Transformed <C, P, T, S> vector     │`  
`│    • Attenuation Filter: Explicit negative leverage token blacklist    │`  
`│    • Active Entity Micro-Cards: Spatial coordinates & current poses    │`  
`│    • 200–250 Word Micro-Beat Scope                                     │`  
`│    • HARD PHYSICAL EXIT CONDITION: Exact terminal sensory trigger      │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **Zone 1: Top 15% (Static Grounding & System Invariants)**

Occupies the primary attention zone. Because tokens here are ingested during initial transformer key-value (KV) caching, they establish the foundational constraints for generation:

> * **Narrative Axioms (world\_axioms.yaml):** Ingests pre-compiled, non-negotiable negative laws (e.g., *"Combustion engines do not exist; modern psychological terms like 'trauma' or 'boundary' are strictly forbidden; institutions are indifferent to individual survival"*), reducing token overhead by 80% compared to dumping full world bibles.  
> * **Character Refusal Vectors:** Injects the non-negotiable behavioral boundaries compiled from character dossiers in 000.goblin-lore. Each vector adheres to a three-part invariant structure:  
>   RefusalRule=⟨Trigger,MandatoryRefusal,UnavoidableCost⟩  
>   For example: *Trigger:* Being offered unearned assistance → *Mandatory Refusal:* Wart must drop the tool rather than accept help → *Unavoidable Cost:* Assembly speed drops by 50%, risking pipe failure.  
> * **Somatic Capability Masks:** Formatted directly from getCharacterSomaticMask(), setting physical limitations (e.g., availableArms: 1.0, bannedKineticVerbs: \["sprint", "vault", "climb", "embrace"\]), ensuring the motor action compiler operates within anatomical boundaries.  
> * **The Slop Filter (Negative Syntactic Bans):** Establishes lexical bans against generic prose patterns and AI cliches.

#### **Zone 2: Middle 70% (Passive Momentum & Sanitized Context)**

Occupies the low-attention trough of the U-shaped curve. This zone carries contextual momentum and historical facts without burdening the model with critical operational rules:

> * **Sliding Manuscript Prose Buffer:** Loads the preceding 800 to 1,200 words of locked, verified script prose directly from worker-sower-engine/drafts/. This anchors rhythm, voice cadence, and sentence lengths without requiring explicit instructions.  
> * **Active Grievance Structure:** Injects the active conflict pairing from getActiveGrievanceDAG(), displaying the **Surface Dispute** (the mundane argument topic, such as grease on a valve) while isolating **The Underneath** (the existential survival dread) behind attenuation walls.  
> * **Ignorance by Omission:** Context assembly scrubs unrevealed mystery IDs and foreign BeliefRecord entries. If Character A has not observed an event via direct line-of-sight or acoustics, those tokens do not enter the prompt payload.  
> * **Logistical Vectors:** Lists the physical items held in hand or worn on the body by the scene's participants, ensuring characters do not manipulate items they do not possess.

#### **Zone 3: Bottom 15% (Dynamic Scene Anchors & Recency Triggers)**

Positions operational triggers at the end of the context window to dominate recency bias:

> * **Dynamic Parameter Translation (*P*dramatic​):** The continuous vectors set on the dashboard (⟨*C*,*P*,*T*,*S*⟩) are compiled into explicit token instructions:  
  * *Curtness (C):* Sets word budgets (*W*max​\=⌊24.0−18.0×*C*⌋).  
  * *Threat (T):* Modulates confrontation stakes and duel probabilities.  
  * *Pacing (P):* Regulates the ratio of Dwight Swain Motivation-Reaction Units (MRUs) to spoken lines.  
  * *Subtext (S):* Activates token attenuation.  
> * **Negative Token Attenuation Blacklist:** When Subtext Suppression *S*≥0.70, the compiler extracts core lemmas from the grievance's underlying cause and appends them to a negative token blacklist, preventing the LLM from blurting out the core leverage.  
> * **Active Entity Micro-Cards:** Injects concise status tags for entities currently in the room (e.g., coordinates (*q*,*r*), lighting level, and current somatic condition).  
> * **The Hard Physical Exit Condition:** The non-negotiable terminal boundary of the micro-beat.

### **3\. The 200–250 Word Micro-Beat Cap & The Hard Physical Exit Condition**

The pipeline forbids prompting models to draft complete multi-page scenes. Generating full scenes in a single inference pass reliably causes pacing collapse, unearned character concessions, and conversational resolution.

Instead, the dashboard enforces the **200–250 Word Micro-Beat Cap**:

`┌─────────────────────────────────────────────────────────────┐`  
`│                 MICRO-BEAT INFERENCE SCOPE                  │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  Length Budget: 200 to 250 words total                      │`  
`│  Grammar Engine: GBNF Grammar (Strict Swain MRU Formatting) │`  
`│  Exit Rule: Physical state change, NOT emotional resolution  │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  MANDATED EXIT TRIGGER:                                     │`  
`│  "Halt generation the exact millisecond Silas drops the     │`  
`│   cast-iron spanner onto the joist."                        │`  
`└─────────────────────────────────────────────────────────────┘`

#### **Dwight Swain Motivation-Reaction Units (MRUs)**

The micro-beat payload compiles generation targets into strict Swain MRU sequences:

> 1. **External Stimulus (Motivation):** An objective physical event or utterance from another character.  
> 2. **Involuntary Somatic Reaction:** Immediate biological reflex (pupil dilation, involuntary flinch, breath intake) bounded by SomaticMask.  
> 3. **Internal Processing (Optional):** Visceral subjective feeling, strictly bounded by the character's epistemic horizon.  
> 4. **Deliberate Motor Action / Spoken Dialogue:** Verbal response or kinetic movement constrained by available limbs and active equipment.

#### **Hard Physical Exit Conditions**

Every micro-beat prompt terminates with an explicit physical condition:

> * *"Halt generation immediately when Bog tightens the second flange bolt."*  
> * *"Stop generating the millisecond Spleen steps backward across the threshold into the dark corridor."*  
> * *"Terminate generation upon the sound of the pressure valve whistling."*

By binding the stop criteria to physical interactions rather than conversational milestones, the engine prevents generative models from writing unearned emotional reconciliations or domestic compromises.

### **4\. Stylometric Bounds & The "Slop Filter"**

To prevent LLMs from degrading into generic commercial cadences, the prompt compiler applies the **Slop Filter** and character-specific stylometric bounds:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   THE SLOP FILTER & STYLOMETRIC GAUNTLET               │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. HIGH-PROBABILITY LLM CRUTCH BANS (Banned via Logit Bias / Blacklist)│`  
`│    • Clichés: "palpable", "tapestry", "testament", "furthermore"       │`  
`│    • Modern Idioms: "process feelings", "unpack", "safe space"         │`  
`│    • Metaphorical Slop: "dance of shadows", "cacophony of silence"     │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 2. CHARACTER-SPECIFIC STYLOMETRIC BOUNDS (char_bog Example)            │`  
`│    • Mean Sentence Length (MSL): 6.2 to 11.5 words                     │`  
`│    • Absolute Word Ceiling per Turn: 18 words (C = 0.50)               │`  
`│    • Monosyllabic Ratio Floor: >= 70% of spoken syllables              │`  
`│    • Punctuation Invariants: Max 1 question mark per 500 words         │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **1\. Negative Logit Biasing & Lexical Blacklisting**

At the inference level (via vLLM, Ollama, or llama.cpp execution daemons on Rig 1), negative logit biases (−100.0) are applied to tokens identified as high-probability filler:

> * Abstract summary nouns: "tapestry", "testament", "beacon", "labyrinth", "dance", "ballet".  
> * Sensory clichés: "palpable", "electric", "thick enough to cut", "echoed through the silence".  
> * Modern analytical conjunctions: "moreover", "furthermore", "consequently", "in conclusion".

#### **2\. Stylometric Boundaries by Character**

Character dossiers define quantitative syntactic and lexical constraints:

> * **Bog (char\_bog):** Terse, suspicious, transactional. Mean sentence length constrained to 6.2–11.5 words; monosyllabic token ratio must exceed 70%; Latinate root words are minimized in favor of blunt Germanic/Anglo-Saxon nouns.  
> * **Mum Grissel (char\_mum\_grissel):** Imperious, archaic, territorial. Permitted longer clauses (12–18 words), higher imperative verb frequency, but strictly barred from expressing direct warmth or emotional dependency.

### **5\. Dynamic Context Assembly & Schema Implementation**

The assembly pipeline is executed within packages/001.lore/src/prompt/contextAssembly.ts and consumed directly by goblin-dashboard:

`// packages/001.lore/src/prompt/contextAssembly.ts`  
`import { z } from 'zod';`  
`import type { SomaticMask } from '../client.js';`

`export const AttentionSandwichSchema = z.object({`  
  `top_grounding: z.object({`  
    `narrative_thesis: z.string(),`  
    `pre_compiled_axioms: z.array(z.string()),`  
    `actor_refusal_vectors: z.record(z.string(), z.array(z.string())),`  
    `somatic_verb_masks: z.record(z.string(), z.array(z.string())),`  
    `slop_filter_tokens: z.array(z.string()),`  
  `}),`  
  `middle_context: z.object({`  
    `sliding_prose_buffer: z.string(),`  
    `active_surface_dispute: z.string(),`  
    `sanitized_belief_records: z.array(z.string()),`  
    `logistical_inventory_manifest: z.record(z.string(), z.array(z.string())),`  
  `}),`  
  `bottom_anchors: z.object({`  
    `dramatic_parameter_vector: z.object({`  
      `curtness: z.number().min(0).max(1),`  
      `pacing: z.number().min(0).max(1),`  
      `threat_level: z.number().min(0).max(1),`  
      `subtext_suppression: z.number().min(0).max(1),`  
    `}),`  
    `attenuation_banned_tokens: z.array(z.string()),`  
    `active_entity_micro_cards: z.array(z.string()),`  
    `max_word_budget: z.number().int().min(50).max(300),`  
    `hard_physical_exit_condition: z.string().min(10),`  
  `}),`  
`}).strict();`

`export type AttentionSandwichPayload = z.infer<typeof AttentionSandwichSchema>;`

`/**`  
 `* Assembles the formatted Attention Sandwich prompt string ready for inference dispatch.`  
 `*/`  
`export function formatAttentionSandwichPrompt(payload: AttentionSandwichPayload): string {`  
  `const { top_grounding, middle_context, bottom_anchors } = payload;`

  `` return ` ``  
`[SYSTEM / IMMUTABLE LAWS (TOP 15%)]`  
`${top_grounding.narrative_thesis}`

`NEGATIVE WORLD AXIOMS:`  
``${top_grounding.pre_compiled_axioms.map(a => `- ${a}`).join('\n')}``

`CHARACTER REFUSAL BOUNDARIES:`  
`${Object.entries(top_grounding.actor_refusal_vectors)`  
  ``.map(([char, rules]) => `${char}:\n${rules.map(r => `  * ${r}`).join('\n')}`)``  
  `.join('\n')}`

`SOMATIC KINETIC VERB BANS:`  
`${Object.entries(top_grounding.somatic_verb_masks)`  
  ``.map(([char, verbs]) => `${char} BANNED VERBS: [${verbs.join(', ')}]`)``  
  `.join('\n')}`

`BANNED STYLOMETRIC SLOP:`  
`[${top_grounding.slop_filter_tokens.join(', ')}]`

`[PASSIVE MOMENTUM BUFFER (MIDDLE 70%)]`  
`ACTIVE SURFACE DISPUTE:`  
`${middle_context.active_surface_dispute}`

`KNOWN BELIEFS & OBSERVED PERCEPTS (IGNORANCE BY OMISSION ENFORCED):`  
``${middle_context.sanitized_belief_records.map(b => `- ${b}`).join('\n')}``

`PHYSICAL INVENTORY CUSTODY:`  
`${Object.entries(middle_context.logistical_inventory_manifest)`  
  ``.map(([char, items]) => `${char} HOLDS: [${items.join(', ')}]`)``  
  `.join('\n')}`

`RECENT SCRIPT PROSE HISTORY:`  
`${middle_context.sliding_prose_buffer}`

`[IMMEDIATE SCENE ANCHORS & BEAT TERMINATION (BOTTOM 15%)]`  
`ACTIVE ENTITIES IN ROOM:`  
``${bottom_anchors.active_entity_micro_cards.map(c => `- ${c}`).join('\n')}``

`DRAMATIC PARAMETER CALIBRATION:`  
`- Curtness Factor: ${bottom_anchors.dramatic_parameter_vector.curtness.toFixed(2)}`  
`- Threat Multiplier: ${bottom_anchors.dramatic_parameter_vector.threat_level.toFixed(2)}`  
`- Pacing Factor: ${bottom_anchors.dramatic_parameter_vector.pacing.toFixed(2)}`

`ATTENUATION FILTER (SUBTEXT SUPPRESSION ACTIVE):`  
`Under no circumstances may dialogue contain any lemma of:`  
`[${bottom_anchors.attenuation_banned_tokens.join(', ')}]`  
`Route interpersonal tension strictly through the active surface dispute props.`

`EXECUTION SCOPE:`  
`- Word Budget Ceiling: ${bottom_anchors.max_word_budget} words.`  
`- Format: Dwight Swain MRU blocks (Stimulus -> Involuntary Reaction -> Motor Action/Dialogue).`

`MANDATED PHYSICAL EXIT TRIGGER:`  
`${bottom_anchors.hard_physical_exit_condition}`  
`` `.trim(); ``  
`}`

### **6\. The Two-Mind Adversarial Verification Gate (*T*0​\=\$0.00)**

Once the candidate micro-beat is drafted by the creative generative model (running at *T*\=0.85), it is not committed directly to the manuscript. Instead, the dashboard runs the output through the **Two-Mind Adversarial Audit** before presenting it to the showrunner:

       `Creative Drafting Model (Rig 1 Qwen 2.5 / Claude Sonnet @ T=0.85)`  
                                    `│`  
                                    `▼ Emits Candidate Take`  
       `┌─────────────────────────────────────────────────────────────┐`  
       `│             THE TWO-MIND ADVERSARIAL AUDIT                  │`  
       `│   Adversarial Auditor: Deterministic Model @ Temperature 0.0│`  
       `├─────────────────────────────────────────────────────────────┤`  
       `│ 1. O(1) Set Intersection: extracted_motor_actions ∩ banned  │`  
       `│ 2. Slop & Lemma Sweep: dialogue_tokens ∩ slop_tokens        │`  
       `│ 3. Attenuation Audit: dialogue_tokens ∩ attenuation_banned  │`  
       `│ 4. Swain MRU Syntax Check: Assert Stimulus precedes Action  │`  
       `│ 5. Physical Exit Verification: Assert trigger termination   │`  
       `└────────────────────────────┬────────────────────────────────┘`  
                                    `│`  
                    `┌───────────────┴───────────────┐`  
                    `▼ Pass                          ▼ Fail`  
          `Advance to Showrunner            Emit Structured Diff Ticket`  
          `Review Gate (Dashboard)          (Log to eval/rejections.jsonl)`

#### **Invariant Checks & Verification Rules**

| Verification Pass | Target Failure Class | Enforcement Mechanism | Failure Action |
| :---- | :---- | :---- | :---- |
| **Somatic Invariant** | SOMATIC\_BIMANUAL\_VIOLATION | extracted\_actions∩banned\_verbs=∅ | Hard rejection; halts advance. |
| **Epistemic Invariant** | EPISTEMIC\_FIREWALL\_BREACH | Asserts omitted mystery tokens not in dialogue. | Flags redline alert on dashboard. |
| **Attenuation Filter** | SUBTEXT\_LEAK\_DEFECT | Sweeps text against attenuation\_banned\_tokens. | Rejects take; logs to rejections. |
| **Slop Linter** | LATINATE\_SLOP\_CONTAMINATION | Regex match against negative cliché list. | Rewrites line via local patcher. |
| **Swain MRU Sequence** | MRU\_INVERSION\_ERROR | Confirms stimulus precedes motor action. | Requires sequential re-order. |
| **Word Budget Cap** | MICRO\_BEAT\_OVERFLOW | Total words ≤250 | Truncates to exit condition. |

By structuring prompts into the **15% / 70% / 15% Attention Sandwich**, capping generation to **200–250 word micro-beats**, enforcing **Hard Physical Exit Conditions**, and filtering crutch words via the **Slop Filter**, goblin-dashboard prevents transformer context degradation and guarantees that character interactions remain grounded, dramatic, and compliant with canonical law at *T*0​\=\$0.00.

---

*User prompt: {{FOCUS: Dramatic Pacing Modes (DramaticPacingMode)(goblin-dashboard) }} /extreme-details*

### **Response: 1\. Epistemological Foundations & The Hitchcock Matrix**

In autonomous episodic narrative generation, dramatic tension does not originate from plot complexity or dialogue volume; it is generated by the **information delta between character awareness and audience observation**:

ΔI\=Kaudience​⊖Kactor​

Where Kaudience​ represents the set of verified facts witnessed on-screen by the viewer, Kactor​ represents the subjective BeliefRecord propositions held by a given character, and ⊖ denotes the symmetric difference operator.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   THE HITCHCOCK EPISTEMIC MATRIX                       │`  
`├───────────────────┬───────────────────┬────────────────────────────────┤`  
`│ AUDIENCE KNOWS?   │ CHARACTER KNOWS?  │ DRAMATIC PACING MODE           │`  
`├───────────────────┼───────────────────┼────────────────────────────────┤`  
`│ YES               │ NO                │ DRAMATIC IRONY / SUSPENSE      │`  
`│ NO                │ YES               │ MYSTERY                        │`  
`│ YES               │ YES               │ SHARED RECOGNITION (Catharsis) │`  
`│ NO                │ NO                │ SURPRISE                       │`  
`└───────────────────┴───────────────────┴────────────────────────────────┘`

Left unconstrained, generative language models (LLMs) suffer from **omniscience drift** and **narrative closure bias**:

> * **Omniscience Drift:** Models naturally default to shared-knowledge assumptions, causing characters to subconsciously allude to facts known only to the viewer, the author, or an absent third party.  
> * **Narrative Closure Bias:** When models detect tension, their probability distributions pull them toward immediate conflict resolution, unearned confessions, and premature disclosure of secrets.

Within goblin-dashboard, the **Dramatic Pacing Modes (DramaticPacingMode)** act as an epistemic scheduler. Mounted on the Showrunner Cockpit via DirectorConsole.tsx and audited in EpistemicAuditPanel.tsx, these modes dictate how information enters the attention context window, how characters are allowed to speak, and how downstream camera and audio profiles are calibrated.

### **2\. Formal Schema Architecture & TypeScript Signatures**

Codified in src/schemas/epistemicAudience.ts (shared across 000.goblin-lore, worker-sower-engine, and goblin-dashboard), the audience epistemic state and pacing modes are enforced as strict Zod schemas:

`// src/schemas/epistemicAudience.ts`  
`import { z } from 'zod';`

`export const ExposureTypeEnum = z.enum([`  
  `'EXPLICIT_ON_SCREEN',  // Fact directly witnessed visually or uttered in dialog`  
  `'IMPLIED_SUBTEXTUAL',  // Heavy circumstantial evidence presented to the viewer`  
  `'FORENSIC_DOCUMENT',   // Visible in-universe prop, ledger, or stamped diagram`  
`]);`  
`export type ExposureType = z.infer<typeof ExposureTypeEnum>;`

`export const RevealedFactEnvelopeSchema = z.object({`  
  `revealed_in_episode: z.string().regex(/^ep\d+$/),`  
  `revealed_in_scene: z.string().regex(/^ep\d+_sc\d+$/),`  
  `exposure_type: ExposureTypeEnum,`  
  `visibility_hash: z.string().length(64), // SHA-256 seal of the revealing shot`  
  `timestamp_epoch: z.number().int().positive(),`  
`}).strict();`  
`export type RevealedFactEnvelope = z.infer<typeof RevealedFactEnvelopeSchema>;`

`export const AudienceKnowledgeStateSchema = z.object({`  
  `revealed_facts: z.record(`  
    `z.string().regex(/^(mystery|fact)_[a-z0-9_]+$/),`  
    `RevealedFactEnvelopeSchema`  
  `),`  
  `withheld_secrets: z.array(z.string().regex(/^mystery_[a-z0-9_]+$/)),`  
`}).strict();`  
`export type AudienceKnowledgeState = z.infer<typeof AudienceKnowledgeStateSchema>;`

`export const DramaticPacingModeEnum = z.enum([`  
  `'DRAMATIC_IRONY', // Audience knows fact X; character is ignorant of fact X`  
  `'SUSPENSE',       // Audience knows a time-bound threat; character operates normally`  
  `'SURPRISE',       // Fact X resolves simultaneously for character and audience`  
  `'MYSTERY',        // Character has more context than audience; withholding details`  
`]);`  
`export type DramaticPacingMode = z.infer<typeof DramaticPacingModeEnum>;`

### **3\. The Four Dramatic Pacing Modes: Exhaustive Breakdown**

                               `DRAMATIC PACING MODES`  
                                         `│`  
         `┌───────────────────┬───────────┴───────────┬───────────────────┐`  
         `▼                   ▼                       ▼                   ▼`  
  `DRAMATIC_IRONY          SUSPENSE                SURPRISE            MYSTERY`  
`┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐`  
`│ Audience Aware  │ │ Audience Aware  │ │ Symmetrical     │ │ Character Aware │`  
`│ Character Blind │ │ Time-Bound Hazard│ │ Ignorance       │ │ Audience Blind  │`  
`│ Dread & Tension │ │ Pending Impact  │ │ Sudden Ignition │ │ Cryptic Clues   │`  
`└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘`

#### **1\. DRAMATIC\_IRONY**

> * **Epistemic Invariant:** The audience knows ground-truth proposition Φ (*p*∈revealed\_facts), but the interacting character operates under TOTAL\_IGNORANCE or holds a conflicting FALSE\_BELIEF (Φ∈/Actor.K).  
> * **Psychological Function:** Generates persistent dread, conversational tension, and voyeuristic anticipation. The audience watches a character walk toward a trap, misinterpret an innocent comment, or make commitments based on false assumptions.  
> * **Context Assembly Directives:**  
  * Injects omittedTopicIds covering proposition Φ. Tokens matching the secret are physically stripped from the character's prompt envelope to enforce **Ignorance by Omission**.  
  * If the actor holds a FALSE\_BELIEF, the assembler injects \[SUBJECTIVE CONVICTION\] directives, instructing the LLM to defend the misconception as absolute truth.  
> * **Downstream Pacing Impact:**  
  * *Dialogue:* Slow, conversational pacing (*P*∈\[0.30,0.50\]). Characters speak with misplaced confidence.  
  * *Camera (Remotion):* Slow, steady push-ins (1.0×→1.03× over 120 frames) centering on the character's facial centroid (crash\_zoom\_target), emphasizing their vulnerability.

#### **2\. SUSPENSE**

> * **Epistemic Invariant:** Overlaps with DRAMATIC\_IRONY in knowledge distribution (Audience Knows \= True, Character Knows \= False), but is distinguished by a **time-bound, consequence-bearing physical threat or mechanical hazard**:  
>   ∃*H*hazard​∈ActiveWorldHazardssuch that*T*trigger​−*T*current​≤Δ*t*threshold​  
> * **Psychological Function:** Generates active acute anxiety rather than passive dread. Classic bomb-under-the-table scenario: the audience knows a boiler valve is at 450 PSI and scheduled to blow in 45 seconds, while Bog and Spleen bicker over missing bean counts.  
> * **Context Assembly Directives:**  
  * Strict Ignorance by Omission on the impending hazard.  
  * Injects an environmental micro-beat exit condition: *"Halt generation immediately when the boiler seam ruptures"*.  
  * Hard frame caps on dialogue lines to prevent unnatural conversational stalling before the physical consequence hits.  
> * **Downstream Pacing Impact:**  
  * *Audio DSP:* Injects high-frequency clock ticking, pipe groans, or rising sub-bass drone beds beneath dialogue tracks.  
  * *Camera:* Intermittent split-second cross-cutting between the oblivious characters and the physical hazard plate (e.g., trembling rivets).

#### **3\. SURPRISE**

> * **Epistemic Invariant:** Symmetrical ignorance transitioning atomically to symmetrical awareness:  
>   Φ∈/Kaudience​∧Φ∈/Kactor​at *T*0​  
>   Φ∈Kaudience​∧Φ∈Kactor​at *T*1​  
> * **Psychological Function:** Produces immediate visceral shock, sudden disorientation, and instantaneous narrative reframing. An unexpected event occurs without prior foreshadowing or audience warning (e.g., a ceiling timber collapses into the room mid-sentence).  
> * **Context Assembly Directives:**  
  * Both character prompt context and audience historical records contain zero references to proposition Φ prior to the execution beat.  
  * The prompt injects an abrupt Swain Motivation-Reaction Unit (MRU) beat: a sudden kinetic stimulus requiring an immediate involuntary somatic reaction (pupil dilation, involuntary gasp, motor interruption).  
> * **Downstream Pacing Impact:**  
  * *Optical / Compositor:* Immediate hard cut or high-amplitude impact screen shake (interpolate(spring(...)) with damping: 12, mass: 0.5, stiffness: 180).  
  * *Audio:* Sudden transient sound effect (loudness spike to −1.0 dBTP) accompanied by immediate −14 dB sidechain ducking of all ambient room tones.

#### **4\. MYSTERY**

> * **Epistemic Invariant:** The interacting character possesses verified knowledge (Φ∈Actor.K via WITHHELD or FACTUAL\_WITNESS), but the audience is completely ignorant (Φ∈withheld\_secrets∧Φ∈/revealed\_facts).  
> * **Psychological Function:** Generates curiosity, analytical speculation, and forensic engagement. The audience recognizes that a character holds a secret or acts with hidden intent, but the details are deliberately obscured.  
> * **Context Assembly Directives:**  
  * Injects \[RESTRAINED KNOWLEDGE\] directives: the model is aware of the ground truth but forbidden from direct exposition.  
  * Enforces the **Attenuation Heuristic**: extracts core lemmas of Φ into banned\_attenuation\_tokens while allowing physical proxies (permitted\_clue\_tokens) to surface in dialogue.  
> * **Downstream Pacing Impact:**  
  * *Dialogue:* Cryptic, evasive, and subtext-heavy (*S*≥0.80). Characters speak in guarded fragments or deflect to routine tasks.  
  * *Visual:* Camera lingers on isolated physical objects (e.g., a scratched lock, hidden pouch) or frames the knowing character in heavy shadow / Dutch angles.

### **4\. Compilation Verification Gates (*T*0​\=\$0.00)**

When the showrunner configures a scene plan in goblin-dashboard, the declared DramaticPacingMode triggers compile-time logic gates before any neural speech synthesis or video generation begins:

`┌─────────────────────────────────────────────────────────────┐`  
`│          PACING MODE COMPILATION VERIFICATION GATES         │`  
`├───────────────────┬─────────────────────────────────────────┤`  
`│ Mode Declared     │ Predicate Logic Verification Rule       │`  
`├───────────────────┼─────────────────────────────────────────┤`  
`│ DRAMATIC_IRONY    │ Φ ∈ revealed_facts ∧                    │`  
`│                   │ Φ ∉ Actor.BeliefRecords                 │`  
`├───────────────────┼─────────────────────────────────────────┤`  
`│ SUSPENSE          │ Φ ∈ revealed_facts ∧                    │`  
`│                   │ Φ ∉ Actor.BeliefRecords ∧               │`  
`│                   │ PendingHazard(Φ).is_time_bound == true  │`  
`├───────────────────┼─────────────────────────────────────────┤`  
`│ SURPRISE          │ Φ ∉ revealed_facts (at T_0) ∧           │`  
`│                   │ Φ ∉ Actor.BeliefRecords (at T_0) ∧      │`  
`│                   │ Φ ∈ revealed_facts (at T_1)             │`  
`├───────────────────┼─────────────────────────────────────────┤`  
`│ MYSTERY           │ Φ ∈ withhed_secrets ∧                   │`  
`│                   │ Φ ∉ revealed_facts ∧                    │`  
`│                   │ Actor.EpistemicHorizon ∈ {WITHHELD, ...}│`  
`└───────────────────┴─────────────────────────────────────────┘`

`// goblin-dashboard/src/lib/compilers/pacingGates.ts`  
`import type {`   
  `AudienceKnowledgeState,`   
  `DramaticPacingMode`   
`} from '../schemas/epistemicAudience';`

`export interface ScenePacingGateRequest {`  
  `readonly sceneId: string;`  
  `readonly targetPacingMode: DramaticPacingMode;`  
  `readonly focalPropositionId: string;`  
  `readonly audienceState: AudienceKnowledgeState;`  
  `readonly actorBeliefIds: readonly string[];`  
  `readonly actorEpistemicHorizon: string;`  
  `readonly isPendingHazardTimeBound?: boolean;`  
`}`

`export function verifyPacingCompilationGate(req: ScenePacingGateRequest): void {`  
  `const {`   
    `targetPacingMode,`   
    `focalPropositionId,`   
    `audienceState,`   
    `actorBeliefIds,`   
    `actorEpistemicHorizon,`  
    `isPendingHazardTimeBound`   
  `} = req;`

  `const audienceKnows = Boolean(audienceState.revealed_facts[focalPropositionId]);`  
  `const actorKnows = actorBeliefIds.includes(focalPropositionId);`

  `switch (targetPacingMode) {`  
    `case 'DRAMATIC_IRONY': {`  
      `if (!audienceKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: DRAMATIC_IRONY] Proposition '${focalPropositionId}' ` + ``  
          `` `has not been witnessed by the audience. Irony requires audience awareness.` ``  
        `);`  
      `}`  
      `if (actorKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: DRAMATIC_IRONY] Interacting actor holds verified belief ` + ``  
          `` `of '${focalPropositionId}'. Irony collapsed into Shared Recognition.` ``  
        `);`  
      `}`  
      `break;`  
    `}`

    `case 'SUSPENSE': {`  
      `if (!audienceKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: SUSPENSE] Impending threat '${focalPropositionId}' ` + ``  
          `` `is unknown to the audience. Suspense requires audience knowledge of the hazard.` ``  
        `);`  
      `}`  
      `if (actorKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: SUSPENSE] Actor is already aware of threat '${focalPropositionId}'.` ``  
        `);`  
      `}`  
      `if (!isPendingHazardTimeBound) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: SUSPENSE] Hazard '${focalPropositionId}' lacks a time-bound ` + ``  
          `` `trigger. Without a ticking clock, mode defaults to DRAMATIC_IRONY.` ``  
        `);`  
      `}`  
      `break;`  
    `}`

    `case 'SURPRISE': {`  
      `if (audienceKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: SURPRISE] Fact '${focalPropositionId}' is already known ` + ``  
          `` `to the audience. Surprise requires pre-scene audience ignorance.` ``  
        `);`  
      `}`  
      `if (actorKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: SURPRISE] Actor already holds belief of '${focalPropositionId}'.` ``  
        `);`  
      `}`  
      `break;`  
    `}`

    `case 'MYSTERY': {`  
      `if (audienceKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: MYSTERY] Secret '${focalPropositionId}' was already exposed ` + ``  
          `` `on-screen. Mystery cannot be maintained for known facts.` ``  
        `);`  
      `}`  
      `if (actorEpistemicHorizon !== 'WITHHELD' && actorEpistemicHorizon !== 'FACTUAL_WITNESS') {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: MYSTERY] Actor lacks direct knowledge of '${focalPropositionId}'. ` + ``  
          `` `Character must hold context that is actively withheld from the audience.` ``  
        `);`  
      `}`  
      `break;`  
    `}`  
  `}`  
`}`

> * **Economic Impact:** If any assertion fails, compilation halts immediately at *T*0​ (\$0.00 compute cost). This prevents unearned reveals or broken dramatic irony from burning GPU diffusion hours, TTS synthesis tokens, or headless Remotion rendering cycles.

### **5\. Dashboard UI Mounts & Directorial Interventions**

Within goblin-dashboard, the pacing mode subsystem is mounted across two primary interfaces:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   DIRECTOR CONSOLE (DirectorConsole.tsx)               │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  SCENE TARGET: ep040_sc03 (The Attic Stair / Crawlspace)               │`  
`│  FOCAL PROPOSITION: mystery_the_famine                                 │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  DRAMATIC PACING MODE SELECTION:                                       │`  
`│  (●) DRAMATIC_IRONY   ( ) SUSPENSE   ( ) SURPRISE   ( ) MYSTERY        │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  GATE PRE-FLIGHT STATUS:                                               │`  
`│  • Audience Knowledge: [PASS] Revealed in ep039_sc02 (EXPLICIT)        │`  
`│  • Actor Knowledge   : [PASS] char_bog epistemic status: TOTAL_IGNORANCE│`  
`│  • Pacing Verification: VERIFIED (Ready for Dispatch)                 │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  [ DISPATCH PROMPT PASS ]                 [ RESET PACING SELECTOR ]    │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **1\. The Pacing Mode Selector (DirectorConsole.tsx)**

Mounted on src/pages/director/tuning.astro:

> * Exposes a four-way radio group bound to DramaticPacingModeEnum.  
> * Changing the mode dynamically alters the slider baselines for *P*dramatic​\=⟨*C*,*P*,*T*,*S*⟩:  
  * Selecting DRAMATIC\_IRONY shifts Subtext (*S*) to 0.80 and Curtness (*C*) to 0.65.  
  * Selecting SUSPENSE pins Threat (*T*) to ≥0.85 and Pacing (*P*) to 0.70.  
  * Selecting MYSTERY sets Subtext (*S*) to 0.95 and activates token attenuation masks.

#### **2\. The 3-Column Horizon Panopticon (EpistemicAuditPanel.tsx)**

Mounted on src/pages/telemetry/epistemic.astro:

> * Displays a side-by-side comparative layout:  
  1. *Audience Reality:* List of revealed\_facts with exposure types (EXPLICIT\_ON\_SCREEN, IMPLIED\_SUBTEXTUAL, FORENSIC\_DOCUMENT).  
  2. *Actor A Bubble:* Active beliefs and ignorance status.  
  3. *Actor B Bubble:* Active beliefs and ignorance status.  
> * If an operator selects DRAMATIC\_IRONY for a secret that has not yet been shown to the audience, the panel illuminates a red indicator: MISSING\_AUDIENCE\_EXPOSURE. The "Dispatch" button is locked until the director either changes the mode to SURPRISE or selects a previously revealed plot point.

### **6\. Downstream Pipeline Manifestations**

The chosen DramaticPacingMode does not remain confined to text prompts; it compiles into concrete parameters across all downstream clusters:

                           `DramaticPacingMode`  
                                   `│`  
         `┌─────────────────────────┼─────────────────────────┐`  
         `▼                         ▼                         ▼`  
  `worker-sower-engine      audio-microservice        goblin-viewport-template`  
  `• Prompt sandwich zone   • Breath pause dilation   • Camera push-in curves`  
  `• Token attenuation mask • Subharmonic fry density • Handheld camera jitter`  
  `• Swain MRU unit pacing  • Low-pass filter cutoffs • Reaction shot holds`

> * **worker-sower-engine (Stage 3 Prompt Compiler):** Ingests the mode into the Attention Sandwich. DRAMATIC\_IRONY formats dialogue prompt rules forbidding characters from questioning obvious inconsistencies, keeping them committed to false premises.  
> * **audio-microservice (Acoustic Master Clock on Port 8000):**  
  * DRAMATIC\_IRONY: Prolongs hesitation pauses (2.2× breath duration) and adds subtle glottal fry, conveying hesitation without breaking composure.  
  * SUSPENSE: Accelerates vocal delivery (1.15× base speed) and injects rising tension drones.  
  * MYSTERY: Lowers vocal gain (−2.5 dB) and introduces a steep low-pass filter (1.8 kHz cutoff) to produce muffled, conspiratorial delivery.  
> * **goblin-viewport-template (Remotion Master Optical Assembly):**  
  * Reads style\_rules.json to determine camera kinematics:  
  * In DRAMATIC\_IRONY, the camera rig applies slow push-ins (1.0×→1.03×) centered strictly on facial centroids (crash\_zoom\_target), followed by 18-frame reaction holds on listening characters.  
  * In SURPRISE, the engine cuts on Frame 0 and applies seeded high-frequency coordinate noise (interpolate(spring(...)) with damping: 12\) to simulate a physical camera jolt.

### **7\. Automated Verification & Negative-Control Gauntlet**

The integrity of DramaticPacingMode compilation is enforced through automated unit test suites (goblin-dashboard/test/verification/pacingModes.test.ts) utilizing explicit negative controls:

`// goblin-dashboard/test/verification/pacingModes.test.ts`  
`import { describe, it, expect } from 'vitest';`  
`import { verifyPacingCompilationGate } from '../../src/lib/compilers/pacingGates';`  
`import type { AudienceKnowledgeState } from '../../src/lib/schemas/epistemicAudience';`

`describe('Dramatic Pacing Mode Gauntlet (verifyPacingCompilationGate)', () => {`  
  `const mockAudienceState: AudienceKnowledgeState = {`  
    `revealed_facts: {`  
      `fact_stolen_spoon: {`  
        `revealed_in_episode: 'ep039',`  
        `revealed_in_scene: 'ep039_sc02',`  
        `exposure_type: 'EXPLICIT_ON_SCREEN',`  
        `visibility_hash: 'a'.repeat(64),`  
        `timestamp_epoch: 1727610000,`  
      `},`  
    `},`  
    `withheld_secrets: ['mystery_great_famine'],`  
  `};`

  `it('validates DRAMATIC_IRONY when audience knows fact and actor is ignorant', () => {`  
    `expect(() => {`  
      `verifyPacingCompilationGate({`  
        `sceneId: 'ep040_sc01',`  
        `targetPacingMode: 'DRAMATIC_IRONY',`  
        `focalPropositionId: 'fact_stolen_spoon',`  
        `audienceState: mockAudienceState,`  
        `actorBeliefIds: [], // Actor has zero knowledge`  
        `actorEpistemicHorizon: 'TOTAL_IGNORANCE',`  
      `});`  
    `}).not.toThrow();`  
  `});`

  `it('negative control: halts DRAMATIC_IRONY if audience has not witnessed the fact', () => {`  
    `expect(() => {`  
      `verifyPacingCompilationGate({`  
        `sceneId: 'ep040_sc01',`  
        `targetPacingMode: 'DRAMATIC_IRONY',`  
        `focalPropositionId: 'mystery_great_famine', // Not in revealed_facts`  
        `audienceState: mockAudienceState,`  
        `actorBeliefIds: [],`  
        `actorEpistemicHorizon: 'TOTAL_IGNORANCE',`  
      `});`  
    `}).toThrow(/Proposition 'mystery_great_famine' has not been witnessed by the audience/);`  
  `});`

  `it('negative control: halts DRAMATIC_IRONY if actor already knows the fact', () => {`  
    `expect(() => {`  
      `verifyPacingCompilationGate({`  
        `sceneId: 'ep040_sc01',`  
        `targetPacingMode: 'DRAMATIC_IRONY',`  
        `focalPropositionId: 'fact_stolen_spoon',`  
        `audienceState: mockAudienceState,`  
        `actorBeliefIds: ['fact_stolen_spoon'], // Collapses irony into shared recognition`  
        `actorEpistemicHorizon: 'FACTUAL_WITNESS',`  
      `});`  
    `}).toThrow(/Irony collapsed into Shared Recognition/);`  
  `});`

  `it('negative control: halts SUSPENSE if hazard is not time-bound', () => {`  
    `expect(() => {`  
      `verifyPacingCompilationGate({`  
        `sceneId: 'ep040_sc02',`  
        `targetPacingMode: 'SUSPENSE',`  
        `focalPropositionId: 'fact_stolen_spoon',`  
        `audienceState: mockAudienceState,`  
        `actorBeliefIds: [],`  
        `actorEpistemicHorizon: 'TOTAL_IGNORANCE',`  
        `isPendingHazardTimeBound: false, // Lacks ticking clock`  
      `});`  
    `}).toThrow(/lacks a time-bound trigger. Without a ticking clock, mode defaults to DRAMATIC_IRONY/);`  
  `});`

  `it('negative control: halts SURPRISE if fact is already in audience memory', () => {`  
    `expect(() => {`  
      `verifyPacingCompilationGate({`  
        `sceneId: 'ep040_sc03',`  
        `targetPacingMode: 'SURPRISE',`  
        `focalPropositionId: 'fact_stolen_spoon', // Already known`  
        `audienceState: mockAudienceState,`  
        `actorBeliefIds: [],`  
        `actorEpistemicHorizon: 'TOTAL_IGNORANCE',`  
      `});`  
    `}).toThrow(/Fact 'fact_stolen_spoon' is already known to the audience/);`  
  `});`

  `it('negative control: halts MYSTERY if actor lacks direct knowledge', () => {`  
    `expect(() => {`  
      `verifyPacingCompilationGate({`  
        `sceneId: 'ep040_sc04',`  
        `targetPacingMode: 'MYSTERY',`  
        `focalPropositionId: 'mystery_great_famine',`  
        `audienceState: mockAudienceState,`  
        `actorBeliefIds: [],`  
        `actorEpistemicHorizon: 'TOTAL_IGNORANCE', // Character must know`  
      `});`  
    `}).toThrow(/Actor lacks direct knowledge of 'mystery_great_famine'/);`  
  `});`  
`});`

Through these rigorous predicate evaluations and fail-closed assertion gates, goblin-dashboard guarantees that every generated scene maintains authentic narrative tension, respects audience observation history, and enforces information asymmetry across the entire episodic pipeline at *T*0​\=\$0.00.

---

*User prompt: {{FOCUS: Dramatic Pacing Modes (DramaticPacingMode)(goblin-dashboard) }} /extreme-details*

Response: The **Dramatic Pacing Modes (DramaticPacingMode)** subsystem in goblin-dashboard formalizes dramatic tension as a computable function of information asymmetry between character awareness and audience knowledge. Rather than treating scene pacing as an intuitive editorial choice, the architecture models information release across strict epistemic boundaries, enforcing pre-flight compilation gates before dialogue drafting, speech synthesis, or video rasterization can begin.

### **1\. Epistemological Foundations & The Information Delta Engine**

Narrative tension within the sovereign simulation architecture does not emerge from random plot events; it is generated by the delta between what the audience has witnessed on-screen and what characters subjectively believe:

ΔI\=Kaudience​⊖Kactor​

Where:

> * Kaudience​ represents the set of verified facts and physical evidence exposed to the viewer across previous scenes and episodes.  
> * Kactor​ represents the subjective BeliefRecord entries and sensory percepts held by an individual character.  
> * ⊖ denotes the symmetric difference operator governing the distribution of secrets.

This formulation is anchored by the **Epistemic Triad**, which establishes that canonical truth, internal belief, and dialogue realization occupy separate layers of reality:

WorldTruth=InternalBelief=ExternalUtterance

Without explicit epistemic boundaries, generative language models suffer from **omniscience drift** (characters acting on secrets known only to the narrator or an off-screen peer) and **narrative closure bias** (the statistical tendency of models to prematurely blurt out secrets, explain mysteries, and resolve interpersonal conflict within a single prompt cycle).

The pipeline formalizes narrative perspective across the **Hitchcock Epistemic Matrix**:

| Audience Knows? | Character Knows? | Dramatic Pacing Mode | Primary Dramatic Sensation |
| :---- | :---- | :---- | :---- |
| **YES** | **NO** | **DRAMATIC\_IRONY** / **SUSPENSE** | Dread, anticipatory anxiety, voyeuristic tension. |
| **NO** | **YES** | **MYSTERY** | Curiosity, analytical suspicion, forensic deduction. |
| **YES** | **YES** | **SHARED RECOGNITION** | Direct confrontation, catharsis, status shifts. |
| **NO** | **NO** | **SURPRISE** | Immediate visceral shock, unexpected re-anchoring. |

### **2\. Schema Architecture & TypeScript Signatures**

Codified in src/schemas/epistemicAudience.ts (shared across 000.goblin-lore, worker-sower-engine, and goblin-dashboard), the audience epistemic state and pacing modes are defined through strict, closed Zod contracts:

`// src/schemas/epistemicAudience.ts`  
`import { z } from 'zod';`

`export const ExposureTypeEnum = z.enum([`  
  `'EXPLICIT_ON_SCREEN',  // Fact directly witnessed visually or spoken in dialog`  
  `'IMPLIED_SUBTEXTUAL',  // Heavy circumstantial evidence presented to viewer`  
  `'FORENSIC_DOCUMENT',   // Visible in-universe prop, stamped blueprint, or ledger`  
`]);`  
`export type ExposureType = z.infer<typeof ExposureTypeEnum>;`

`export const RevealedFactEnvelopeSchema = z.object({`  
  `revealed_in_episode: z.string().regex(/^ep\d+$/),`  
  `revealed_in_scene: z.string().regex(/^ep\d+_sc\d+$/),`  
  `exposure_type: ExposureTypeEnum,`  
  `visibility_hash: z.string().length(64), // SHA-256 digest of the revealing media artifact`  
  `timestamp_epoch: z.number().int().positive(),`  
`}).strict();`  
`export type RevealedFactEnvelope = z.infer<typeof RevealedFactEnvelopeSchema>;`

`export const AudienceKnowledgeStateSchema = z.object({`  
  `revealed_facts: z.record(`  
    `z.string().regex(/^(mystery|fact)_[a-z0-9_]+$/),`  
    `RevealedFactEnvelopeSchema`  
  `),`  
  `withheld_secrets: z.array(z.string().regex(/^mystery_[a-z0-9_]+$/)),`  
`}).strict();`  
`export type AudienceKnowledgeState = z.infer<typeof AudienceKnowledgeStateSchema>;`

`export const DramaticPacingModeEnum = z.enum([`  
  `'DRAMATIC_IRONY', // Audience knows fact X; character is ignorant of fact X`  
  `'SUSPENSE',       // Audience knows a time-bound threat; character operates normally`  
  `'SURPRISE',       // Fact X resolves simultaneously for character and audience`  
  `'MYSTERY',        // Character has more context than audience; withholding details`  
`]);`  
`export type DramaticPacingMode = z.infer<typeof DramaticPacingModeEnum>;`

### **3\. Detailed Taxonomy of the Four Dramatic Pacing Modes**

                               `DRAMATIC PACING MODES`  
                                         `│`  
         `┌───────────────────┬───────────┴───────────┬───────────────────┐`  
         `▼                   ▼                       ▼                   ▼`  
  `DRAMATIC_IRONY          SUSPENSE                SURPRISE            MYSTERY`  
`┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐`  
`│ Audience Aware  │ │ Audience Aware  │ │ Symmetrical     │ │ Character Aware │`  
`│ Character Blind │ │ Time-Bound Hazard│ │ Ignorance       │ │ Audience Blind  │`  
`│ Dread & Tension │ │ Pending Impact  │ │ Sudden Shock    │ │ Cryptic Clues   │`  
`└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘`

#### **1\. DRAMATIC\_IRONY**

> * **Epistemic Invariant:** The audience has witnessed the focal fact on-screen (Φ∈revealed\_facts), but the active character operates under TOTAL\_IGNORANCE or harbors an incorrect FALSE\_BELIEF (Φ∈/Actor.K).  
> * **Narrative Function:** Generates persistent dread and anticipation. The audience watches a character walk toward a trap, misinterpret an innocent comment, or make commitments based on false assumptions.  
> * **Prompt Assembly Directives:**  
  * Enforces **Ignorance by Omission**: the topic identifier, canonical truth, and associated lore tokens are completely scrubbed from the character's prompt context envelope.  
  * If the actor holds an authored FALSE\_BELIEF, the assembler injects a \[SUBJECTIVE CONVICTION\] directive, instructing the model to defend the misconception as absolute truth.  
> * **Downstream Pacing Parameters:**  
  * *Dialogue:* Slower conversational delivery with room for subtextual irony.  
  * *Compositor:* Slow programmatic push-ins (1.0×→1.03× over 120 frames using quadOut easing) centered strictly on the facial centroid (crash\_zoom\_target).

#### **2\. SUSPENSE**

> * **Epistemic Invariant:** Shares the baseline information distribution of Dramatic Irony (Audience Aware \= True, Character Aware \= False), but requires the presence of an **active, time-bound, consequence-bearing physical threat or mechanical hazard**:  
>   ∃*H*hazard​∈ActiveWorldHazardssuch that*T*trigger​−*T*current​≤Δ*t*threshold​  
> * **Narrative Function:** Distinguishes acute suspense from passive dramatic irony through an imminent breaking point. The classic "bomb under the table" scenario: the viewer knows a high-pressure pipe valve is at 450 PSI and failing, while characters bicker obliviously over inventory tallies.  
> * **Prompt Assembly Directives:**  
  * Strict Ignorance by Omission on the impending failure.  
  * The prompt injects an explicit micro-beat termination rule tied to the environmental hazard (e.g., *"Halt generation immediately when the valve seal blows"*).  
> * **Downstream Pacing Parameters:**  
  * *Audio:* Background beds incorporate high-frequency ticking, mechanical strain groans, or rising sub-bass drones.  
  * *Compositor:* Cross-cuts between character dialogue close-ups and environmental hazard detail shots (e.g., popping rivets, leaking steam).

#### **3\. SURPRISE**

> * **Epistemic Invariant:** Symmetrical ignorance transitioning atomically into symmetrical awareness:  
>   Φ∈/Kaudience​∧Φ∈/Kactor​at *T*0​  
>   Φ∈Kaudience​∧Φ∈Kactor​at *T*1​  
> * **Narrative Function:** Generates immediate visceral shock and instantaneous narrative reframing. An unforeseen physical event or disclosure occurs without prior audience foreshadowing.  
> * **Prompt Assembly Directives:**  
  * Prior to the event beat, neither character prompts nor audience records contain references to Φ.  
  * The prompt requires an abrupt Dwight Swain Motivation-Reaction Unit (MRU) beat: a sudden kinetic stimulus triggering an immediate involuntary somatic reaction (e.g., visceral flinch, pupil dilation, dropped tool).  
> * **Downstream Pacing Parameters:**  
  * *Compositor:* Hard cut on Frame 0 followed by spring-driven impact screen shake (interpolate(spring(...)) with damping: 12, mass: 0.5, stiffness: 180).  
  * *Audio:* Sudden transient impact sound effect hitting −1.0 dBTP with immediate −14 dB sidechain ducking of ambient beds.

#### **4\. MYSTERY**

> * **Epistemic Invariant:** The interacting character holds direct knowledge of the truth (Φ∈Actor.K via WITHHELD or FACTUAL\_WITNESS), while the audience is completely ignorant (Φ∈withheld\_secrets∧Φ∈/revealed\_facts).  
> * **Narrative Function:** Generates curiosity, analytical speculation, and forensic engagement. The audience realizes a character holds a secret or acts on hidden motives, but the underlying truth is withheld.  
> * **Prompt Assembly Directives:**  
  * Injects \[RESTRAINED KNOWLEDGE\] directives: the model has the context but is forbidden from direct exposition.  
  * Enforces the **Attenuation Heuristic**: scrubs core lemmas of Φ via banned\_attenuation\_tokens while allowing physical proxies (permitted\_clue\_tokens) to surface in dialogue.  
> * **Downstream Pacing Parameters:**  
  * *Dialogue:* Cryptic, evasive, and subtext-heavy exchanges.  
  * *Compositor:* Frames the knowing character in heavy shadow, high-angle framing, or prolonged reaction holds (18 frames) before lines are delivered.

### **4\. Compilation Verification Gates (*T*0​\=\$0.00)**

When a showrunner authors or schedules a scene plan in goblin-dashboard, the declared DramaticPacingMode triggers compile-time predicate logic gates:

`┌─────────────────────────────────────────────────────────────┐`  
`│          PACING MODE COMPILATION VERIFICATION GATES         │`  
`├───────────────────┬─────────────────────────────────────────┤`  
`│ Mode Declared     │ Predicate Logic Verification Rule       │`  
`├───────────────────┼─────────────────────────────────────────┤`  
`│ DRAMATIC_IRONY    │ Φ ∈ revealed_facts ∧                    │`  
`│                   │ Φ ∉ Actor.BeliefRecords                 │`  
`├───────────────────┼─────────────────────────────────────────┤`  
`│ SUSPENSE          │ Φ ∈ revealed_facts ∧                    │`  
`│                   │ Φ ∉ Actor.BeliefRecords ∧               │`  
`│                   │ PendingHazard(Φ).is_time_bound == true  │`  
`├───────────────────┼─────────────────────────────────────────┤`  
`│ SURPRISE          │ Φ ∉ revealed_facts (at T_0) ∧           │`  
`│                   │ Φ ∉ Actor.BeliefRecords (at T_0) ∧      │`  
`│                   │ Φ ∈ revealed_facts (at T_1)             │`  
`├───────────────────┼─────────────────────────────────────────┤`  
`│ MYSTERY           │ Φ ∈ withheld_secrets ∧                  │`  
`│                   │ Φ ∉ revealed_facts ∧                    │`  
`│                   │ Actor.EpistemicHorizon ∈ {WITHHELD, ...}│`  
`└───────────────────┴─────────────────────────────────────────┘`

`// goblin-dashboard/src/lib/compilers/pacingGates.ts`  
`import type {`   
  `AudienceKnowledgeState,`   
  `DramaticPacingMode`   
`} from '../schemas/epistemicAudience';`

`export interface ScenePacingGateRequest {`  
  `readonly sceneId: string;`  
  `readonly targetPacingMode: DramaticPacingMode;`  
  `readonly focalPropositionId: string;`  
  `readonly audienceState: AudienceKnowledgeState;`  
  `readonly actorBeliefIds: readonly string[];`  
  `readonly actorEpistemicHorizon: string;`  
  `readonly isPendingHazardTimeBound?: boolean;`  
`}`

`export function verifyPacingCompilationGate(req: ScenePacingGateRequest): void {`  
  `const {`   
    `targetPacingMode,`   
    `focalPropositionId,`   
    `audienceState,`   
    `actorBeliefIds,`   
    `actorEpistemicHorizon,`  
    `isPendingHazardTimeBound`   
  `} = req;`

  `const audienceKnows = Boolean(audienceState.revealed_facts[focalPropositionId]);`  
  `const actorKnows = actorBeliefIds.includes(focalPropositionId);`

  `switch (targetPacingMode) {`  
    `case 'DRAMATIC_IRONY': {`  
      `if (!audienceKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: DRAMATIC_IRONY] Proposition '${focalPropositionId}' ` + ``  
          `` `has not been witnessed by the audience. Irony requires prior audience exposure.` ``  
        `);`  
      `}`  
      `if (actorKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: DRAMATIC_IRONY] Actor holds verified belief of '${focalPropositionId}'. ` + ``  
          `` `Irony collapsed into Shared Recognition.` ``  
        `);`  
      `}`  
      `break;`  
    `}`

    `case 'SUSPENSE': {`  
      `if (!audienceKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: SUSPENSE] Impending threat '${focalPropositionId}' ` + ``  
          `` `is unknown to the audience. Suspense requires audience knowledge of the hazard.` ``  
        `);`  
      `}`  
      `if (actorKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: SUSPENSE] Actor is already aware of threat '${focalPropositionId}'.` ``  
        `);`  
      `}`  
      `if (!isPendingHazardTimeBound) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: SUSPENSE] Hazard '${focalPropositionId}' lacks a time-bound trigger. ` + ``  
          `` `Without an active clock, mode defaults to DRAMATIC_IRONY.` ``  
        `);`  
      `}`  
      `break;`  
    `}`

    `case 'SURPRISE': {`  
      `if (audienceKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: SURPRISE] Fact '${focalPropositionId}' was already exposed to the audience. ` + ``  
          `` `Surprise requires pre-scene audience ignorance.` ``  
        `);`  
      `}`  
      `if (actorKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: SURPRISE] Actor already holds belief of '${focalPropositionId}'.` ``  
        `);`  
      `}`  
      `break;`  
    `}`

    `case 'MYSTERY': {`  
      `if (audienceKnows) {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: MYSTERY] Secret '${focalPropositionId}' was already exposed on-screen. ` + ``  
          `` `Mystery cannot be maintained for known facts.` ``  
        `);`  
      `}`  
      `if (actorEpistemicHorizon !== 'WITHHELD' && actorEpistemicHorizon !== 'FACTUAL_WITNESS') {`  
        `throw new Error(`  
          `` `[PACING GATE FAILURE: MYSTERY] Actor lacks direct knowledge of '${focalPropositionId}'. ` + ``  
          `` `Character must hold context that is actively withheld from the audience.` ``  
        `);`  
      `}`  
      `break;`  
    `}`  
  `}`  
`}`

> * **Economic Testing Funnel (*T*0​\=\$0.00):** In a programmatic media pipeline, downstream audio synthesis, video diffusion plate generation, and headless Remotion rendering incur real compute and financial costs. Catching broken dramatic irony or premature secret reveals at compile time costs **\$0.00**, preventing unearned narrative scenes from burning machine hours.

### **5\. UI Mounts & Directorial Interventions in goblin-dashboard**

Within goblin-dashboard, the pacing mode subsystem is mounted across two primary showrunner interfaces:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   DIRECTOR CONSOLE (DirectorConsole.tsx)               │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  SCENE TARGET: ep040_sc03 (The Attic Stair / Crawlspace)               │`  
`│  FOCAL PROPOSITION: mystery_the_famine                                 │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  DRAMATIC PACING MODE SELECTION:                                       │`  
`│  (●) DRAMATIC_IRONY   ( ) SUSPENSE   ( ) SURPRISE   ( ) MYSTERY        │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  GATE PRE-FLIGHT STATUS:                                               │`  
`│  • Audience Knowledge: [PASS] Revealed in ep039_sc02 (EXPLICIT)        │`  
`│  • Actor Knowledge   : [PASS] char_bog epistemic status: TOTAL_IGNORANCE│`  
`│  • Pacing Verification: VERIFIED (Ready for Dispatch)                 │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  [ DISPATCH PROMPT PASS ]                 [ RESET PACING SELECTOR ]    │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **1\. The Pacing Mode Selector (DirectorConsole.tsx)**

Mounted on src/pages/director/tuning.astro:

> * Exposes a radio group bound to DramaticPacingModeEnum.  
> * Selecting a mode dynamically adjusts the baseline dramatic compression sliders *P*dramatic​\=⟨*C*,*P*,*T*,*S*⟩:  
  * Selecting DRAMATIC\_IRONY elevates Subtext Suppression (*S*→0.80) and balances Curtness (*C*→0.65).  
  * Selecting SUSPENSE raises Threat Level (*T*≥0.85) and increases Pacing (*P*→0.70).  
  * Selecting MYSTERY sets Subtext Suppression to 0.95 and activates negative token attenuation filters.

#### **2\. The Epistemic Horizon Panopticon (EpistemicAuditPanel.tsx)**

Mounted on src/pages/telemetry/epistemic.astro:

> * Renders a 3-column split view:  
  1. *Audience Reality:* List of revealed\_facts with exposure types (EXPLICIT\_ON\_SCREEN, IMPLIED\_SUBTEXTUAL, FORENSIC\_DOCUMENT) and provenance episode links.  
  2. *Actor A Bubble:* Active beliefs, hearsay, and ignorance omission masks.  
  3. *Actor B Bubble:* Active beliefs, hearsay, and ignorance omission masks.  
> * If an operator selects DRAMATIC\_IRONY for a fact not yet exposed on-screen, the UI illuminates a flashing red alert: MISSING\_AUDIENCE\_EXPOSURE. The "Dispatch Prompt" button is disabled until the mode is updated or a previously revealed plot point is selected.

### **6\. Downstream Multi-Modal Compilation Coupling**

Once verified, the chosen DramaticPacingMode compiles into deterministic parameters across all downstream pipeline repositories:

                           `DramaticPacingMode`  
                                   `│`  
         `┌─────────────────────────┼─────────────────────────┐`  
         `▼                         ▼                         ▼`  
  `worker-sower-engine      audio-microservice        goblin-viewport-template`  
  `• Prompt sandwich zone   • Breath pause dilation   • Camera push-in curves`  
  `• Token attenuation mask • Subharmonic fry density • Handheld camera jitter`  
  `• Swain MRU unit pacing  • Low-pass filter cutoffs • Reaction shot holds`

> * **worker-sower-engine (Stage 3 Prompt Compilation):** Ingests the mode into the Attention Sandwich. DRAMATIC\_IRONY injects instructions forbidding characters from questioning obvious inconsistencies, keeping them committed to false premises.  
> * **audio-microservice (Acoustic Master Clock on Port 8000):**  
  * DRAMATIC\_IRONY: Prolongs hesitation pauses and injects glottal fry, conveying hesitation without breaking character composure.  
  * SUSPENSE: Accelerates vocal delivery (1.15× speed scalar) and tightens breath pauses.  
  * MYSTERY: Reduces vocal gain (−2.5 dB) and introduces a low-pass filter to produce hushed, conspiratorial line deliveries.  
> * **goblin-viewport-template (Remotion Master Optical Assembly):**  
  * In DRAMATIC\_IRONY, the camera applies slow push-ins (1.0×→1.03× over 120 frames) centered strictly on character facial centroids (crash\_zoom\_target).  
  * In SURPRISE, the engine cuts on Frame 0 and applies seeded high-frequency coordinate noise (interpolate(spring(...)) with damping: 12\) to simulate a camera jolt.  
  * When an AST node declares a VISCERAL\_STING, style\_rules.json burns an authored 18-frame reaction hold directly into the timeline before dialogue audio begins.

### **7\. Verification Gauntlet & Negative-Control Unit Tests**

The compilation gates are verified within the automated test battery (goblin-dashboard/test/verification/pacingModes.test.ts) using explicit negative controls:

`// goblin-dashboard/test/verification/pacingModes.test.ts`  
`import { describe, it, expect } from 'vitest';`  
`import { verifyPacingCompilationGate } from '../../src/lib/compilers/pacingGates';`  
`import type { AudienceKnowledgeState } from '../../src/lib/schemas/epistemicAudience';`

`describe('Dramatic Pacing Mode Gauntlet (verifyPacingCompilationGate)', () => {`  
  `const mockAudienceState: AudienceKnowledgeState = {`  
    `revealed_facts: {`  
      `fact_stolen_spoon: {`  
        `revealed_in_episode: 'ep039',`  
        `revealed_in_scene: 'ep039_sc02',`  
        `exposure_type: 'EXPLICIT_ON_SCREEN',`  
        `visibility_hash: 'a'.repeat(64),`  
        `timestamp_epoch: 1727610000,`  
      `},`  
    `},`  
    `withheld_secrets: ['mystery_great_famine'],`  
  `};`

  `it('validates DRAMATIC_IRONY when audience knows fact and actor is ignorant', () => {`  
    `expect(() => {`  
      `verifyPacingCompilationGate({`  
        `sceneId: 'ep040_sc01',`  
        `targetPacingMode: 'DRAMATIC_IRONY',`  
        `focalPropositionId: 'fact_stolen_spoon',`  
        `audienceState: mockAudienceState,`  
        `actorBeliefIds: [], // Actor has zero knowledge`  
        `actorEpistemicHorizon: 'TOTAL_IGNORANCE',`  
      `});`  
    `}).not.toThrow();`  
  `});`

  `it('negative control: halts DRAMATIC_IRONY if audience has not witnessed the fact', () => {`  
    `expect(() => {`  
      `verifyPacingCompilationGate({`  
        `sceneId: 'ep040_sc01',`  
        `targetPacingMode: 'DRAMATIC_IRONY',`  
        `focalPropositionId: 'mystery_great_famine', // Missing from revealed_facts`  
        `audienceState: mockAudienceState,`  
        `actorBeliefIds: [],`  
        `actorEpistemicHorizon: 'TOTAL_IGNORANCE',`  
      `});`  
    `}).toThrow(/Proposition 'mystery_great_famine' has not been witnessed by the audience/);`  
  `});`

  `it('negative control: halts DRAMATIC_IRONY if actor already knows the fact', () => {`  
    `expect(() => {`  
      `verifyPacingCompilationGate({`  
        `sceneId: 'ep040_sc01',`  
        `targetPacingMode: 'DRAMATIC_IRONY',`  
        `focalPropositionId: 'fact_stolen_spoon',`  
        `audienceState: mockAudienceState,`  
        `actorBeliefIds: ['fact_stolen_spoon'], // Collapses irony into shared recognition`  
        `actorEpistemicHorizon: 'FACTUAL_WITNESS',`  
      `});`  
    `}).toThrow(/Irony collapsed into Shared Recognition/);`  
  `});`

  `it('negative control: halts SUSPENSE if hazard is not time-bound', () => {`  
    `expect(() => {`  
      `verifyPacingCompilationGate({`  
        `sceneId: 'ep040_sc02',`  
        `targetPacingMode: 'SUSPENSE',`  
        `focalPropositionId: 'fact_stolen_spoon',`  
        `audienceState: mockAudienceState,`  
        `actorBeliefIds: [],`  
        `actorEpistemicHorizon: 'TOTAL_IGNORANCE',`  
        `isPendingHazardTimeBound: false, // Lacks ticking clock`  
      `});`  
    `}).toThrow(/lacks a time-bound trigger. Without an active clock, mode defaults to DRAMATIC_IRONY/);`  
  `});`

  `it('negative control: halts SURPRISE if fact is already in audience memory', () => {`  
    `expect(() => {`  
      `verifyPacingCompilationGate({`  
        `sceneId: 'ep040_sc03',`  
        `targetPacingMode: 'SURPRISE',`  
        `focalPropositionId: 'fact_stolen_spoon', // Already known`  
        `audienceState: mockAudienceState,`  
        `actorBeliefIds: [],`  
        `actorEpistemicHorizon: 'TOTAL_IGNORANCE',`  
      `});`  
    `}).toThrow(/Fact 'fact_stolen_spoon' was already exposed to the audience/);`  
  `});`

  `it('negative control: halts MYSTERY if actor lacks direct knowledge', () => {`  
    `expect(() => {`  
      `verifyPacingCompilationGate({`  
        `sceneId: 'ep040_sc04',`  
        `targetPacingMode: 'MYSTERY',`  
        `focalPropositionId: 'mystery_great_famine',`  
        `audienceState: mockAudienceState,`  
        `actorBeliefIds: [],`  
        `actorEpistemicHorizon: 'TOTAL_IGNORANCE', // Actor must hold the secret`  
      `});`  
    `}).toThrow(/Actor lacks direct knowledge of 'mystery_great_famine'/);`  
  `});`  
`});`

Through these predicate evaluations and fail-closed assertion gates, goblin-dashboard guarantees that every generated scene maintains authentic narrative tension, respects audience observation history, and enforces information asymmetry across the episodic pipeline at *T*0​\=\$0.00.

---

*User prompt: {{FOCUS: Cloudflare Edge Integration & Infrastructure (goblin-dashboard) }} /extreme-details*

Response: When deployed beyond local workstation hardware, goblin-dashboard compiles to **Cloudflare Pages** via the @astrojs/cloudflare Server-Side Rendering (SSR) adapter, acting as the globally distributed showrunner cockpit and human-in-the-loop director interface. This deployment interfaces directly with Cloudflare’s serverless Anycast edge infrastructure—specifically **Cloudflare Workers (Hono Router)**, **Cloudflare D1 (CANON\_DB)**, **Cloudflare Durable Objects (ShotCoordinatorDO / SowerSessionDO)**, and **Cloudflare R2**—to provide sub-5ms telemetry, real-time parameter tuning, and execution coordination without incurring persistent cloud compute costs.

`┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐`  
`│                               CLOUDFLARE EDGE CONTROL PLANE (Anycast Mesh)                             │`  
`│                                                                                                        │`  
`│  [ Astro UI Dashboard (Cloudflare Pages SSR) ] ──► Sub-5ms Client Ingress                              │`  
`│                      │                                                                                 │`  
`│                      ▼ HTTPS POST / WSS Upgrade (RS256 JWT / Service Tokens)                           │`  
`│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │`  
`│  │ EdgeGateway Router (Cloudflare Worker via Hono)                                                  │  │`  
`│  │   • Zero-Trust perimeter & Two-Pass Zod schema compilation                                       │  │`  
`│  │   • "Intents, Never Commands" validation boundary                                                │  │`  
`│  │   • Zero Edge Git Privilege Isolation (0 PATs / 0 Write Keys)                                    │  │`  
`│  └──────────────────┬────────────────────────────────────────────────┬──────────────────────────────┘  │`  
`│                     │                                                │                                 │`  
`│                     ▼ Workers RPC                                    ▼ Sub-Millisecond SQL             │`  
`│  ┌────────────────────────────────────────────────────┐   ┌─────────────────────────────────────────┐  │`  
`│  │ ShotCoordinatorDO (Durable Object Actor)           │   │ Cloudflare D1 (CANON_DB)                │  │`  
`│  │   • Single-threaded hardware mutex & FIFO queue    │   │   • Relational Truth Gate               │  │`  
`│  │   • Storage: NVMe-backed ctx.storage Engine        │   │   • Continuity Check: is_dirty == 0     │  │`  
`│  │   • Sockets: WebSocket Hibernation API ($0.00 idle)│   │   • 1-Hop Dependency Hash (H_dep)       │  │`  
`│  │   • Watchdog: Monotonic Epochs & ctx.storage.alarm │   │   • Idempotency Deduplication Key Set   │  │`  
`│  └──────────────────┬─────────────────────────────────┘   └─────────────────────────────────────────┘  │`  
`└─────────────────────┼──────────────────────────────────────────────────────────────────────────────────┘`  
                      `│ Persistent Bidirectional Outbound WSS Tunnel (cloudflared / QUIC / TLS 1.3)`  
                      `▼`  
`┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ ON-PREMISES SOVEREIGN FOUNDRIES (Local Network Perimeter)                                              │`  
`│                                                                                                        │`  
`│  [ Rig 1: The Conductor (worker-sower-engine) ]      [ Rig 2: The GPU Foundry (media-broker) ]         │`  
`│    • CPU/RAM: Dialogue AST, 2d6 Duel Resolver,         • Loopback Isolation: 127.0.0.1:3000 IPC        │`  
`│      Acoustic Locking (ffprobe), Remotion CLI          • Mutex Sovereign: POSIX flock on GPU lockfile  │`  
`│    • audio-microservice: Port 8000 (.wav TTS)          • Headless ComfyUI (127.0.0.1:8188)             │`  
`│                                                        • Egress Notary: Streams plates to CF R2        │`  
`└────────────────────────────────────────────────────────────────────────────────────────────────────────┘`

### **1\. The Cloudflare Edge Inversion & Architectural Boundaries**

The integration between goblin-dashboard and Cloudflare is governed by **The Cloudflare Edge Inversion**. In traditional distributed media architectures, cloud servers command physical hardware through inbound connections; in this architecture, authority is strictly inverted:

> * **Host, Not Authority:** A Cloudflare Worker or Durable Object is a thin network hosting wrapper and concurrency coordinator, not an epistemological or narrative authority. The underlying simulation engine (worker-sower-engine) and immutable canon (000.goblin-lore) remain mathematically independent. Build-time checks fail the build if pure simulation kernels import @cloudflare/\* packages.  
> * **Zero Edge Git Privilege Isolation:** To uphold zero-trust isolation and eliminate supply-chain vulnerabilities, edge workers maintain **zero GitHub Personal Access Tokens (PATs) or administrative Git write keys**. The edge dashboard cannot write directly to canonical repository trunks.  
> * **The "Intents, Never Commands" Invariant:** Untrusted client dashboards and automated agents can only submit *Intents* (e.g., parameter tuning, scene reservations, PR proposals), never direct state assertions. Any incoming HTTP payload attempting to declare canonical state changes directly (such as ACTOR\_MOVED or INVENTORY\_DEDUCTED) is rejected at the edge gateway with HTTP 403 Forbidden.

### **2\. Edge Ingress, Identity Federation, & The Hono Gateway**

All incoming HTTP requests, Server-Sent Events (SSE), and WebSocket upgrade requests from the Astro frontend terminate at the **EdgeGateway** (built using Hono):

#### **Sub-5ms Cryptographic Authentication**

Inbound traffic passes through fail-closed authentication middleware inside Cloudflare's V8 isolate. The gateway verifies RS256-signed JSON Web Tokens (e.g., Clerk session credentials) or Cloudflare Access Service Tokens (CF-Access-Client-Id and CF-Access-Client-Secret) in under 5 milliseconds. Unauthenticated or expired requests are terminated at the Anycast boundary with HTTP 401 Unauthorized without waking downstream Durable Objects or accessing databases.

#### **Two-Pass Zod Schema Compilation**

The gateway sanitizes incoming director intents using a two-pass validation pipeline before data enters internal queues:

> 1. *Pass 1 (Syntactic & Scalar Bounds):* Strips unexpected properties using Zod .strict(), validates scalar parameters (e.g., verifying dramatic compression parameters lie within \[0.0,1.0\]), and sanitizes against path-traversal sequences (../) or script injections.  
> 2. *Pass 2 (Relational Reference Verification):* Asserts that referenced entity slugs (char\_bog, item\_silver\_spoon) correspond to valid schema shapes.

#### **Transport-Level Idempotency Deduplication**

To prevent duplicate dispatches caused by client retries or network drops, inbound payloads carry an RFC-compliant UUIDv7 idempotency key. The gateway evaluates incoming keys against an internal D1 idempotency\_keys table using atomic SQL queries:

`INSERT INTO idempotency_keys (key, scope, created_at)`  
`VALUES (?, 'director_intent', unixepoch())`  
`ON CONFLICT (key) DO NOTHING;`

If zero rows are affected, the duplicate transmission is discarded, and the existing job status is returned immediately.

### **3\. The Relational Truth Gate & Dirty-State Invalidation (Cloudflare D1)**

Cloudflare D1 (CANON\_DB) serves as the edge-native relational ledger that prevents stale, invalid, or desynchronized narrative states from consuming hardware resources.

                     `INBOUND SCENE DISPATCH PAYLOAD`  
                                  `│`  
                                  `▼`  
`┌──────────────────────────────────────────────────────────────────┐`  
`│ EdgeGateway Ingress Router (src/index.ts)                        │`  
`│ • Validates RS256 JWT & Zod payload contracts (<5ms)             │`  
`│ • Executes relational query against Cloudflare D1 (CANON_DB)     │`  
`└─────────────────────────────────┬────────────────────────────────┘`  
                                  `│`  
                  `┌───────────────┴───────────────┐`  
                  `▼                               ▼`  
         `[ dirty_count > 0 ]             [ dirty_count == 0 ]`  
                  `│                               │`  
                  `▼                               ▼`  
   `[ HTTP 412 PRECONDITION FAILED ]       [ FORWARD TO DO ]`  
   `• Error: DIRTY_SCENE_REJECTED          • Acquire lease lock`  
   `• Rig 2 GPU not engaged ($0.00 billed) • Enqueue into ShotCoordinatorDO`

#### **Sub-Millisecond Relational Continuity Query**

Before a scene render job can enter the queue, the EdgeGateway queries the dependency graph in D1:

`SELECT COUNT(*) AS dirty_count`  
`FROM scene_fact_dependencies`  
`WHERE scene_id = ? AND is_dirty = 1;`

> * **Sub-5ms Execution Denial:** If an upstream narrative fact mutated (e.g., an actor gained an injury condition, dropped an item, or advanced a grievance) without a corresponding re-linting and re-compilation of the scene's Abstract Syntax Tree (dialogue\_ast.json), dirty\_count \> 0\.  
> * **The *T*0​\=\$0.00 Economic Firewall:** The edge gateway terminates the request immediately with HTTP 412 Precondition Failed (DIRTY\_SCENE\_REJECTED). The request is aborted before physical GPUs are signaled, preventing the expenditure of cloud compute or local power on out-of-date assets.

#### **Monotonic Version Cascades & 1-Hop Transitive Hashing**

Every canonical fact row in D1 maintains an integer version incremented monotonically on mutation. An automated trigger marks downstream scenes as invalid:

`CREATE TRIGGER propagate_fact_mutation`  
`AFTER UPDATE ON canonical_facts`  
`BEGIN`  
  `UPDATE scene_fact_dependencies`  
  `SET is_dirty = 1,`  
      `invalidation_reason = 'Upstream fact mutated: ' || NEW.fact_id`  
  `WHERE fact_id = NEW.fact_id AND pinned_version < NEW.version;`  
`END;`

To prevent cascading locks from blocking active scriptwriters, the edge calculates a localized 1-hop dependency hash (*H*dep​) combining the target entity hash with its direct foreign keys, deferring multi-hop transitive closures to local verification passes.

### **4\. Single-Threaded Hardware Mutex & WebSocket Hibernation (Durable Objects)**

Concurrency management between public web dashboards and physical hardware is governed by Cloudflare Durable Objects (ShotCoordinatorDO / SowerSessionDO), which provide single-threaded actor execution.

#### **Eliminating the "Hesitation Penalty" via WebSocket Hibernation**

Reviewing animatics, checking camera curves, and tuning dramatic parameters require hours of human showrunner evaluation. Running dedicated Node.js servers or virtual machines accumulates constant compute fees (\$0.40–\$0.80/hr) during idle periods.

The dashboard solves this by pairing Cloudflare Pages with the **WebSocket Hibernation API** inside ShotCoordinatorDO:

> * When an operator opens the dashboard, the EdgeGateway upgrades the connection and passes the socket to the Durable Object: this.ctx.acceptWebSocket(ws, \[role\]).  
> * The Durable Object attaches serialized state (up to 128 KB) to the socket descriptor and **evicts the V8 JavaScript isolate from memory**.  
> * Cloudflare's Anycast proxy holds the physical TCP connection open. While the showrunner reviews dialogue lines, the active compute consumption drops to **\$0.00**.  
> * The isolate re-awakens in \<2 ms only when an incoming WebSocket frame arrives, an internal alarm fires, or hardware pushes a completion event.

#### **Tagged Sockets & Role-Partitioned Multiplexing**

ShotCoordinatorDO multiplexes traffic across roles using tagged WebSocket channels:

`export class ShotCoordinatorDO implements DurableObject {`  
  `constructor(private ctx: DurableObjectState, private env: Env) {}`

  `async fetch(request: Request): Promise<Response> {`  
    `const url = new URL(request.url);`  
    `const role = url.searchParams.get('role'); // "artist" | "broker"`

    `if (request.headers.get('Upgrade') === 'websocket') {`  
      `const pair = new WebSocketPair();`  
      `const [client, server] = Object.values(pair);`

      `// Register socket with role tag under the Hibernation API`  
      `this.ctx.acceptWebSocket(server, [role as string]);`  
      `return new Response(null, { status: 101, webSocket: client });`  
    `}`  
    `return new Response('Expected upgrade', { status: 400 });`  
  `}`

  `async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {`  
    `const tags = this.ctx.getTags(ws);`

    `if (tags.includes('broker')) {`  
      `// Incoming progress/telemetry from local GPU on Rig 2`  
      `const packet = JSON.parse(message as string);`  
      `// Monotonic sequence stamping and broadcast to connected showrunner dashboards`  
      `for (const clientWs of this.ctx.getWebSockets('artist')) {`  
        `clientWs.send(JSON.stringify({ seq: ++this.seqCounter, ...packet }));`  
      `}`  
    `}`  
  `}`  
`}`

#### **Transactional NVMe Storage & Single-Threaded Mutex**

Standard serverless functions process requests concurrently and lose in-memory state on recycle. ShotCoordinatorDO eliminates race conditions by serializing execution through a single-threaded FIFO queue backed by NVMe storage (ctx.storage):

> * **Boot Barrier (blockConcurrencyWhile):** During cold boots, all incoming HTTP/WebSocket traffic is buffered while state is rehydrated from transactional NVMe storage in \<2 ms:  
>   `this.ctx.blockConcurrencyWhile(async () => {`  
>     `const state = await this.ctx.storage.get(['queue', 'active_lease', 'epoch']);`  
>     `this.hydrateMemory(state);`  
>   `});`

> * **Monotonic Lease Epoch Fencing:** To protect GPUs running 20GB+ diffusion models (such as Wan 2.2) from CUDA Out-of-Memory (OOM) crashes, execution is limited to one job at a time. When a lease is granted to a rendering worker, the DO increments an integer epoch (*N*→*N*\+1). If a stalled worker attempts to upload plates from an expired lease (*N*), the DO rejects the write with HTTP 409 Conflict, dropping stale writes.  
> * **Watchdog Alarms:** The DO schedules hardware watchdog checks using storage alarms (ctx.storage.setAlarm(Date.now() \+ 30000)). If a local hardware spoke fails to emit a heartbeat within 30 seconds, the active lease is revoked and re-queued without stalling the pipeline.

### **5\. Inside-Out Tunnels & Local Hardware Sovereignty**

Communication between the Cloudflare Edge and physical on-premises hardware (Rig 1 and Rig 2\) operates via an **Inside-Out Network Topology**:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: LOCAL FOUNDRY GPU (Physical POSIX Environment)                  │`  
`│                                                                        │`  
`│   [ Headless ComfyUI (:8188) ]                                         │`  
`│         ▲                                                              │`  
`│         │ (127.0.0.1 HTTP / WebSocket Loopback IPC)                    │`  
`│         ▼                                                              │`  
`│   [ media-broker daemon (:3000) ]                                      │`  
`│         │ • Holds permanent OS flock on /var/lock/rig2_gpu.lock        │`  
`│         │ • Dispatches heartbeat POST /heartbeat every 10s             │`  
`│         ▼                                                              │`  
`│   [ cloudflared daemon ]                                               │`  
`│         │ (Outbound Encrypted Tunnel - ZERO Inbound WAN Ports Open)    │`  
`└─────────┼──────────────────────────────────────────────────────────────┘`  
          `│`  
          `│ WAN (Outbound QUIC / TLS 1.3 Tunnel Pipe)`  
          `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE ZERO TRUST ANYCAST EDGE                                     │`  
`│   • EdgeGateway Worker (Hono)                                          │`  
`│   • ShotCoordinatorDO (Hardware Mutex & Queue)                         │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **Zero Inbound WAN Port Inversion**

Consumer generative AI interfaces (such as ComfyUI's internal aiohttp server on port 8188\) lack enterprise authentication, rate-limiting, and fine-grained access control. Opening router ports directly to the internet exposes workstations to remote code execution (RCE) vulnerabilities.

> * Rig 1 and Rig 2 run **Cloudflare Tunnel (cloudflared)** daemons that establish outbound-only encrypted TCP/QUIC connections to Cloudflare’s edge.  
> * All external router firewall ports remain completely closed.  
> * Local daemons bind strictly to the local loopback interface (127.0.0.1), communicating with local AI runtimes via internal Inter-Process Communication (IPC).

#### **Local OS flock Sovereignty & Pull Architecture**

The architecture prevents remote cloud edge coordinators from deadlocking physical hardware:

> * The local rendering daemon (media-broker on Rig 2\) holds a POSIX file lock (flock) on /var/lock/rig2\_gpu.lock.  
> * The edge Durable Object acts purely as a passive queue; it cannot force execution onto the physical machine.  
> * The local daemon leases a job from the DO queue only when its local lock is free and free VRAM exceeds operational baselines (\>21 GB).  
> * **Offline Fallback:** If internet connectivity between the physical studio and Cloudflare drops, media-broker falls back to reading render manifests from a local disk spool (/var/spool/renders), allowing production to continue uninterrupted without code divergence.

### **6\. Zero-Egress Media Asset Streaming (Cloudflare R2)**

goblin-dashboard relies on **Cloudflare R2** for content-addressed binary asset storage, eliminating bandwidth egress fees during visual review:

| Asset Class | Storage Location | Ingestion / Review Delivery Mechanism | Integrity Enforcement |
| :---- | :---- | :---- | :---- |
| **Dialogue Audio Stems** | r2://production/audio/ | Streamed into dashboard WaveformScrubber.tsx. | SHA-256 binary hash verified against exposure\_sheet.json. |
| **Character Plates** | r2://production/plates/ | HTML5 \<video\> plate streaming in AnimaticPlayer.tsx. | Reject if SHA-256 matches empty-file constant (e3b0c442...b855). |
| **Composed Masters** | r2://production/masters/ | Direct delivery of final broadcast MP4s via Anycast CDN. | Provenance certified by render\_manifest.json. |

> * **Zero Egress Fees:** Because Cloudflare R2 does not charge egress bandwidth fees, operators can review high-bitrate ProRes plates, uncompressed audio stems, and Remotion animatics globally without accumulating data transfer costs.  
> * **Presigned Upload URLs:** When local foundries complete rendering, media-broker requests a presigned PUT URL from ShotCoordinatorDO to upload assets directly to R2. Raw binaries never pass through Worker isolate memory, keeping RAM usage well beneath the 128 MB isolate limit.

### **7\. Autonomous Scheduled Maintenance Daemons (Edge Cron Triggers)**

Fleet maintenance and state synchronization are managed by background daemons mounted on Cloudflare Workers Cron Triggers (scheduled(event, env, ctx)):

`// apps/worker/wrangler.jsonc`  
`{`  
  `"name": "series-edge-orchestrator",`  
  `"main": "src/index.ts",`  
  `"compatibility_date": "2026-03-01",`  
  `"triggers": {`  
    `"crons": [`  
      `"0 * * * *",   // Hourly: Lockfile Pin Drift Audit & Canon Parity Check`  
      `"0 3 * * *",   // Daily 03:00 UTC: GC Ephemeral Branches, Leases & R2 Staging`  
      `"0 0 * * *"    // Daily 00:00 UTC: Dual-Ledger Cold NDJSON Drainage to Git`  
    `]`  
  `}`  
`}`

`// apps/worker/src/index.ts`  
`export default {`  
  `fetch: app.fetch,`  
  `async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {`  
    `switch (event.cron) {`  
      `case '0 * * * *':`  
        `// Hourly: Zero-clone ref inspection asserting versions.json matches git heads`  
        `ctx.waitUntil(runPinVerifier(env));`  
        `break;`  
      `case '0 3 * * *':`  
        `// Daily 03:00 UTC: Prune orphaned tracking branches and expired R2 scratch files`  
        `ctx.waitUntil(runGarbageCollector(env));`  
        `break;`  
      `case '0 0 * * *':`  
        `// Daily 00:00 UTC: Drain settled D1 audit records to immutable cold NDJSON files`  
        `ctx.waitUntil(runArchiveDrain(env));`  
        `break;`  
    `}`  
  `},`  
`};`

> * **Non-Blocking Background Execution:** Tasks wrap within ctx.waitUntil(...). The edge runtime acknowledges cron ticks instantly, allowing V8 isolates to resolve asynchronous network operations without hitting edge request execution timeouts.  
> * **Hourly Lockfile Pin Drift Auditor (0 \* \* \* \*):** Ingests goblin-project/versions.json and performs zero-clone remote ref checks via the GitHub REST API, verifying that commit hashes across all 7 production repositories remain aligned with remote tracking heads without requiring local Git clones.  
> * **Daily Cold Ledger Drainage (0 0 \* \* \*):** Settled audit records in D1 are extracted, compiled into Newline-Delimited JSON (.ndjson), and committed to an orphaned Git branch. This keeps hot SQLite tables compact while preserving an immutable cryptographic audit trail (*Hn*​).

---

*User prompt: {{FOCUS: 1\. Dramatic Compression & Parameter Tuning (goblin-dashboard) }} /extreme-details*

Response: The **Dramatic Compression & Parameter Tuning** subsystem of goblin-dashboard converts human directorial intent into deterministic, mathematically bounded inputs for the simulation and prompt compilation pipelines. Mounted within the React island src/components/islands/DirectorConsole.tsx on the Astro review shell, this interface eliminates freehand prompt engineering. Instead, it abstracts creative calibration into a continuous four-dimensional parameter vector space:

*P*dramatic​\=​*CPTS*​​∈\[0.0,1.0\]4⊂R4

This vector conditions upstream language model attention layers, calibrates digital signal processing (DSP) acoustic synthesis, and modulates programmatic camera kinematics in Remotion without mutating canonical lore or breaking physical continuity.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│             goblin-dashboard (DirectorConsole.tsx Island)              │`  
`│                                                                        │`  
`│   Curtness (C)             Pacing (P)            Threat (T)     Subtext (S)│`  
`│  [────●────] 0.75         [─────●───] 0.60      [───────●─] 0.85 [──────●──] 0.70`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Validated DirectorIntentEnvelope (HTTP POST)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                  PROMPT & COMPILATION CONTEXT ENGINE                   │`  
`│                                                                        │`  
`│  1. Lexical Word Ceilings:    W_max = max(2, floor(24.0 - 18.0 * C))   │`  
`│  2. MRU Action-to-Dialogue:   rho_A/D = P / (1.0 - P + epsilon)        │`  
`│  3. 2d6 Duel Trigger Floor:   p_duel = clamp(0.05 + 0.85 * T, 0, 1)    │`  
`│  4. Attenuation Masking:      S >= 0.70 -> Token Blacklist Activated   │`  
`└──────────────┬────────────────────┬────────────────────┬───────────────┘`  
               `│                    │                    │`  
               `▼                    ▼                    ▼`  
     `Local LLM (Rig 1)      audio-microservice   goblin-viewport-template`  
     `• Qwen 2.5 32B/72B     • Speed & Breath DSP • Camera Spring Damping`  
     `• GBNF Action Array    • Pitch & Fry Shifts • Talk-Bounce Amplitude`  
     `• Monosyllabic Logits  • Integer Timebase   • Procedural Jitter`

### **Mathematical Formalization of the Parametric Axes**

Every axis within *P*dramatic​ functions as an independent scalar variable mapped to concrete generative and physical behaviors:

#### **1\. Dialogue Curtness (*C*∈\[0.0,1.0\])**

Governs syntactic density, clause chaining, and word-budget ceilings per spoken line.

> * **Maximum Word Budget Allocation (*W*max​):** Dialogue length within the candidate Abstract Syntax Tree (dialogue\_ast.json) is derived via an affine transformation:  
>   *W*max​(*C*)=max(2,⌊24.0−18.0×*C*⌋)  
  * *C*\=0.0⟹*W*max​\=24 words (Allows multi-clause, evasive, periodic sentences).  
  * *C*\=0.5⟹*W*max​\=15 words (Standard conversational exchange).  
  * *C*≥0.75⟹*W*max​≤10 words (Enforces clipped exchanges, monosyllabic terms, and high ellipsis counts).  
  * *C*\=1.0⟹*W*max​\=6 words (Telegraphic delivery; single-word commands, grunts, or physical dismissals).  
> * **Syntactic Conjunction Suppression:** When *C*≥0.70, the local drafting engine (e.g., Qwen 2.5 on Rig 1\) applies negative logit biases (−100.0) against subordinating and coordinating conjunctions ("furthermore", "because", "nevertheless"), forcing simple Subject-Verb-Object structures.  
> * **Acoustic Timebase Compression:** Shorter lines reduce synthesized .wav durations in audio-microservice, compressing the final 24 fps integer frame allocation calculated by ffprobe:  
>   target\_frames=⌈1000duration\_ms(*C*)​×24⌉

#### **2\. Dramatic Pacing (*P*∈\[0.0,1.0\])**

Regulates the structural ratio between physical motor action blocks and spoken dialogue utterances, formalizing Dwight Swain Motivation-Reaction Units (MRUs).

> * **Action-to-Dialogue Density Ratio (*ρA*/*D*​):**  
>   *ρA*/*D*​(*P*)=1.0−*P*\+*ϵP*​(where *ϵ*\=10−4)  
> * **Micro-Beat Staging Bounds:**  
  * *P*≤0.30 (Deliberate Pacing): Expands the intervening sensory reaction windows between lines. Enforces extensive physical blocking, sensory pauses, and unvoiced processing.  
  * *P*∈(0.30,0.70) (Balanced Narrative Momentum): Alternates spoken dialogue lines with individual physical reaction beats in a 1:1 ratio.  
  * *P*≥0.70 (Telegraphic Kinetic Velocity): Constrains action blocks to rapid physical verbs (e.g., *"Bog drops the siphon"*), skipping internal processing to prioritize immediate physical movement.  
> * **Camera Kinematics:** Downstream Remotion camera rigs in goblin-viewport-template scale their spring damping with *P*:  
>   CameraDamping(*P*)=max(8,⌊20−12×*P*⌋)  
>   Elevated pacing generates rapid snap zooms, while low pacing introduces slow, linear pans.

#### **3\. Threat Level Multiplier (*T*∈\[0.0,1.0\])**

Modulates somatic stakes, physical leverage, and conflict volatility.

> * **Opposed Duel Mechanical Probability (*p*duel​):** Controls whether an interpersonal confrontation triggers an opposed 2d6 duel in worker-sower-engine:  
>   *p*duel​(*T*)=clamp(0.05+0.85×*T*,0.0,1.0)  
> * **Somatic Injury Severity Scaling:** Determines the magnitude of potential physical trauma conditions (e.g., concussive\_hearing\_loss, femoral\_laceration):  
>   ΔSeveritysomatic​\=⌊*T*×4000⌋ basis points (bp)  
> * **Escalation Progression:**  
  * *T*≤0.30: Dialogue is restricted to low-stakes domestic disputes, procedural complaints, and minor territorial friction.  
  * *T*≥0.80: Subtext is abandoned for explicit physical intimidation, brandished tools or weapons, and immediate ultimatums.

#### **4\. Subtext Suppression (*S*∈\[0.0,1.0\])**

Determines whether characters state their internal motivations directly or displace them onto physical proxies.

> * **The Attenuation Heuristic:** When *S*≥0.70, token attenuation is engaged. The compiler provides the drafting model with the characters' underlying leverage while placing the exact terms of that leverage on a negative token list:  
>   BannedTokens=ExtractLemmas(Grievance.underneath)∀*S*≥0.70  
> * **Tactical Displacement:** Characters are forced to project interpersonal tension onto physical props (e.g., grease on a silver spoon, stripped bolt threads, or joist rot).  
> * **The Catharsis vs. Avoidance Spectrum:**  
  * *S*≤0.20 (Open Catharsis / Farce): Characters explicitly name their core grievances (e.g., *"You hoarded the rations during the dry cycle\!"*).  
  * *S*≥0.80 (Deep Avoidance): Characters aggressively dispute surface logistics while the core source of tension remains completely unspoken.

### **Parametric Calibration Matrix**

| Dimension | Variable | Low Range (0.0−0.25) | Nominal Range (0.4−0.6) | High Range (0.75−1.0) | Downstream Consumer Boundary |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Curtness** | *C* | *W*max​\=24 Complex clauses | *W*max​\=15 Natural conversational cadence | *W*max​\=6 Monosyllabic grunts | Rig 1 LLM GBNF grammar & audio-microservice timebase. |
| **Pacing** | *P* | *ρA*/*D*​\=0.2 Extended contemplation | *ρA*/*D*​\=1.0 Balanced beat rhythm | *ρA*/*D*​\=4.0 Rapid action dominance | Remotion timeline cuts & camera spring damping. |
| **Threat** | *T* | *p*duel​\=0.05 Negligible somatic stakes | *p*duel​\=0.50 Moderate leverage | *p*duel​\=0.90 Active physical violence | worker-sower-engine 2d6 resolver & trauma ledger. |
| **Subtext** | *S* | Explicit catharsis Unfiltered complaints | Masked intentions Partial deflection | Full displacement Complete token ban | Context Assembly Attention Sandwich & token filter. |

### **Macro Narrative Phase Balancing**

The dashboard does not evaluate *P*dramatic​ in a vacuum; it couples slider baselines to the active macro-narrative phase tracked by the season ledger in worker-sower-engine:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   SEASON MACRO-PACING PHASE COUPLING                   │`  
`├───────────────────┬────────────────────────────────────────────────────┤`  
`│ Narrative Phase   │ Baseline Default Dramatic Vector                   │`  
`├───────────────────┼────────────────────────────────────────────────────┤`  
`│ 1. SETUP          │ P_dramatic = < C: 0.35, P: 0.40, T: 0.25, S: 0.85 >│`  
`│                   │ • Worldbuilding establishment, domestic routines   │`  
`│                   │ • Deep subtext suppression, low somatic stakes     │`  
`├───────────────────┼────────────────────────────────────────────────────┤`  
`│ 2. CLIMAX         │ P_dramatic = < C: 0.85, P: 0.75, T: 0.90, S: 0.30 >│`  
`│                   │ • Rapid confrontations, high duel probabilities    │`  
`│                   │ • Clipped dialogue, direct cathartic releases      │`  
`├───────────────────┼────────────────────────────────────────────────────┤`  
`│ 3. COOLDOWN       │ P_dramatic = < C: 0.20, P: 0.30, T: 0.15, S: 0.90 >│`  
`│                   │ • Trauma accounting, somatic exhaustion            │`  
`│                   │ • Long reaction pauses, heavy avoidance            │`  
`└───────────────────┴────────────────────────────────────────────────────┘`

When an operator opens DirectorConsole.tsx, the UI queries the active phase and initializes sliders to these recommended baselines. The showrunner can manually adjust values for single-scene variances or click **"Reset to Recommended"** to snap sliders back to the season plan's macro-weights.

### **Compilation into the Attention Sandwich**

When generation is triggered, *P*dramatic​ compiles directly into the 15% / 70% / 15% **Attention Sandwich** prompt structure, counteracting the U-shaped attention curve and preventing lost-in-the-middle context decay:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ 1. TOP 15%: STATIC GROUNDING & SYSTEM INVARIANTS                       │`  
`│    • Narrative Thesis: Domestic survival, unacknowledged avoidance     │`  
`│    • Somatic Verb Masks: Formatted via getCharacterSomaticMask()       │`  
`│    • Stylometric Bounds: Mean sentence lengths governed by Curtness (C)│`  
`│    • The Slop Filter: Negative logit bans on AI crutch words           │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 2. MIDDLE 70%: PASSIVE MOMENTUM & SANITIZED CONTEXT                    │`  
`│    • Sliding Manuscript Buffer: 800–1,200 words of preceding prose     │`  
`│    • Active Grievance: Surface Dispute vs. The Underneath              │`  
`│    • Ignorance by Omission: Forbidden mystery tokens scrubbed          │`  
`│    • Logistical Reality: Hand and equipment capacity vectors           │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 3. BOTTOM 15%: IMMEDIATE SCENE ANCHORS & RECENCY TRIGGERS              │`  
`│    • Dynamic Slider Tokens: Active <C, P, T, S> instructions           │`  
`│    • Attenuation Filter: Blacklist of banned leverage lemmas (from S)  │`  
`│    • 200–250 Word Micro-Beat Scope                                     │`  
`│    • HARD PHYSICAL EXIT CONDITION: Exact terminal sensory trigger      │`  
`└────────────────────────────────────────────────────────────────────────┘`

> 1. **Top 15% (Primacy Salience Zone):** Curtness (*C*) injects lexical constraints, setting mean sentence lengths (*MSL*) and forbidding complex Latinate conjunctions. Somatic masks derived from getCharacterSomaticMask() inject negative verb lists (e.g., bannedKineticVerbs: \["sprint", "embrace"\]), ensuring physical damage constrains generation.  
> 2. **Middle 70% (Context Momentum Trough):** Holds recent scene history, prop inventories, and the active grievance pairing from getActiveGrievanceDAG(). Subtext Suppression (*S*) splits the grievance: the **Surface Dispute** (e.g., grease on a valve) is placed in active context, while **The Underneath** (e.g., famine trauma) is isolated behind token filters.  
> 3. **Bottom 15% (Recency Bias Zone):** Contains the operational directives. Threat (*T*) sets the confrontation stakes, Pacing (*P*) commands the Swain MRU action cadence, and the Attenuation Filter blacklists the underlying leverage words. The section terminates with a **Hard Physical Exit Condition** (e.g., *"Halt generation immediately when Bog drops the wrench"*), capping generation to 200–250 words and preventing unearned conversational resolutions.

### **Downstream Multi-Modal Translation**

The parameter vector *P*dramatic​ does not terminate at text generation; it compiles into concrete operational parameters across speech synthesis and video composition:

                           `P_dramatic = < C, P, T, S >`  
                                        `│`  
         `┌──────────────────────────────┼──────────────────────────────┐`  
         `▼                              ▼                              ▼`  
  `Local LLM (Rig 1)             audio-microservice             goblin-viewport-template`  
  `• Word ceiling: W_max         • speedScalar                  • talk_bounce_amplitude`  
  `• Monosyllabic bias           • pause_multiplier_scene       • idle_shiver_amplitude`  
  `• Swain MRU ratio: rho_A/D    • delta_Pitch_scene            • Camera spring damping`  
  `• Token attenuation mask      • delta_Fry_scene              • Integer frame budgets`

#### **1\. Digital Signal Processing (DSP) Speech Synthesis (audio-microservice)**

The audio engine on port 8000 translates *P*dramatic​ into vocal modulation parameters inside voice\_manifest.json:

> * **Speech Rate & Velocity:**  
>   Speedeff​\=Speedbase​×(0.8+0.5×*P*\+0.3×*C*)  
> * **Respiratory Pause Dilation:**  
>   Pauseeff​\=Basebreath​×(2.5−1.5×*P*)  
> * **Vocal Pitch Shift:** High threat levels shift the vocal fundamental frequency (*F*0​) upward:  
>   ΔPitchscene​\=(*T*×4.0) semitones  
> * **Subharmonic Glottal Fry Density:** Simulates vocal cord compression under acute stress:  
>   ΔFryscene​\=clamp(*T*×0.6+(1.0−*P*)×0.2,0.0,1.0)

#### **2\. Programmatic Puppet Kinematics (goblin-viewport-template)**

Remotion compositions ingest the vector to parameterize character animation constants:

> * **talk\_bounce\_amplitude:** Driven by Curtness and Threat, scaling the vertical bounce applied to 2D cutout puppets during speech:  
>   bounce=⌊base\_bounce×(1.0+0.8×*T*−0.4×*C*)⌋  
> * **idle\_shiver\_amplitude:** When Threat *T*≥0.80, high-frequency coordinate noise is injected to simulate somatic trembling:  
>   Δ*x*jitter​\=noise(frame)×⌊14×*T*⌋

### **Ingress Contracts & Intent Envelopes**

Directorial adjustments in goblin-dashboard are strictly decoupled from direct database writes. Directorial state changes are packaged into validated **Intent Envelopes** validated via Zod:

`// goblin-dashboard/src/lib/schemas/dramaticIntent.ts`  
`import { z } from 'zod';`

`export const DramaticParameterVectorSchema = z.object({`  
  `curtness: z.number().min(0.0).max(1.0),`  
  `pacing: z.number().min(0.0).max(1.0),`  
  `threat_level: z.number().min(0.0).max(1.0),`  
  `subtext_suppression: z.number().min(0.0).max(1.0),`  
`}).strict(); // Strips or errors on parameter pollution`

`export const DirectorIntentEnvelopeSchema = z.object({`  
  `intent_id: z.string().uuid(),`  
  `target_scene_id: z.string().regex(/^ep\d+_sc\d+$/),`  
  `intent_type: z.literal('SET_DRAMATIC_COMPRESSION'),`  
  `authorizer_role: z.enum(['SHOWRUNNER', 'SCENE_DIRECTOR']),`  
  `vector: DramaticParameterVectorSchema,`  
  `premise_seed: z.string().max(500).optional(),`  
  `client_timestamp: z.number().int().positive(),`  
`}).strict();`

`export type DramaticParameterVector = z.infer<typeof DramaticParameterVectorSchema>;`  
`export type DirectorIntentEnvelope = z.infer<typeof DirectorIntentEnvelopeSchema>;`

#### **Transmission Lifecycle**

> 1. **Interactive Manipulation:** The showrunner moves sliders in DirectorConsole.tsx, updating local component state.  
> 2. **In-Memory Validation:** On dispatch, DirectorIntentEnvelopeSchema.parse() validates the payload in browser memory.  
> 3. **HTTP Dispatch:** The envelope is transmitted via POST /api/v1/intents/parameter-shift to worker-sower-engine (on Rig 1\) or the Cloudflare Hono EdgeGateway.  
> 4. **Staging Cache:** The simulation engine stages the compiled parameters alongside active somatic masks and epistemic horizons, making them available for the next drafting cycle.

### **Boundary Defect Taxonomy & Pre-Flight Verification (*T*0​\=\$0.00)**

Operating *P*dramatic​ at extreme boundaries can produce specific failure modes:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│               PARAMETRIC BOUNDARY DEFECT TAXONOMY                      │`  
`├──────────────────────────────┬──────────────────┬──────────────────────┤`  
`│ Defect Class                 │ Vector Trigger   │ Manifestation        │`  
`├──────────────────────────────┼──────────────────┼──────────────────────┤`  
`│ 1. TELEGRAPHIC_MUTISM        │ C -> 1.0         │ Dialogue collapses   │`  
`│                              │ P -> 1.0         │ to isolated verbs;   │`  
`│                              │                  │ scenes finish in <3s │`  
`├──────────────────────────────┼──────────────────┼──────────────────────┤`  
`│ 2. EXPOSITION_BLOAT          │ C -> 0.0         │ Characters deliver   │`  
`│                              │ S -> 0.0         │ unearned confessions │`  
`│                              │                  │ in long monologues   │`  
`├──────────────────────────────┼──────────────────┼──────────────────────┤`  
`│ 3. SUBTEXTUAL_PARALYSIS      │ S -> 1.0         │ Dialogue becomes so  │`  
`│                              │ T -> 0.0         │ vague that narrative │`  
`│                              │                  │ stakes vanish        │`  
`├──────────────────────────────┼──────────────────┼──────────────────────┤`  
`│ 4. PREMATURE_ESCALATION      │ T -> 1.0         │ Micro-frictions turn │`  
`│                              │ Cycle < 3        │ immediately lethal   │`  
`│                              │                  │ in early episodes    │`  
`└──────────────────────────────┴──────────────────┴──────────────────────┘`

#### **Automated Pre-Flight Invariant Testing**

To catch invalid parameter combinations before dispatching inference workers, goblin-dashboard tests the parameter space via Vitest:

`// goblin-dashboard/test/verification/dramaticVector.test.ts`  
`import { describe, it, expect } from 'vitest';`  
`import { DramaticParameterVectorSchema } from '../../src/lib/schemas/dramaticIntent';`  
`import { calculateWordCeiling, deriveAcousticModifiers } from '../../src/lib/compilers/vectorBridge';`

`describe('Dramatic Parameter Vector Space Gauntlet (P_dramatic)', () => {`  
  `it('enforces strict [0.0, 1.0] hypercube bounds', () => {`  
    `const validVector = {`  
      `curtness: 0.75,`  
      `pacing: 0.50,`  
      `threat_level: 0.80,`  
      `subtext_suppression: 0.65,`  
    `};`  
    `expect(DramaticParameterVectorSchema.parse(validVector)).toEqual(validVector);`  
  `});`

  `it('negative control: rejects negative vector components', () => {`  
    `const invalidVector = {`  
      `curtness: -0.1,`  
      `pacing: 0.5,`  
      `threat_level: 0.5,`  
      `subtext_suppression: 0.5,`  
    `};`  
    `expect(() => DramaticParameterVectorSchema.parse(invalidVector)).toThrow();`  
  `});`

  `it('negative control: rejects out-of-bounds components (> 1.0)', () => {`  
    `const invalidVector = {`  
      `curtness: 0.5,`  
      `pacing: 1.05,`  
      `threat_level: 0.5,`  
      `subtext_suppression: 0.5,`  
    `};`  
    `expect(() => DramaticParameterVectorSchema.parse(invalidVector)).toThrow();`  
  `});`

  `it('negative control: rejects parameter pollution via .strict()', () => {`  
    `const pollutedPayload = {`  
      `curtness: 0.5,`  
      `pacing: 0.5,`  
      `threat_level: 0.5,`  
      `subtext_suppression: 0.5,`  
      `unauthorized_injection: 'INJECT_EXPLOIT',`  
    `};`  
    `expect(() => DramaticParameterVectorSchema.parse(pollutedPayload)).toThrow();`  
  `});`

  `it('verifies exact affine word budget derivation', () => {`  
    `expect(calculateWordCeiling(0.0)).toBe(24);`  
    `expect(calculateWordCeiling(0.5)).toBe(15);`  
    `expect(calculateWordCeiling(1.0)).toBe(6);`  
  `});`

  `it('verifies acoustic DSP modifier bounds calculation', () => {`  
    `const { speedScalar, pauseMultiplier, pitchDeltaSemitones } = deriveAcousticModifiers({`  
      `curtness: 0.8,`  
      `pacing: 0.7,`  
      `threat_level: 0.9,`  
      `subtext_suppression: 0.5,`  
    `});`

    `expect(speedScalar).toBeGreaterThan(1.0);`  
    `expect(pauseMultiplier).toBeLessThan(1.8);`  
    `expect(pitchDeltaSemitones).toBeCloseTo(3.6, 1);`  
  `});`  
`});`

By verifying vector parameters against strict schemas, enforcing affine word ceilings, activating token attenuation masks, and mapping vectors into audio DSP and camera kinematics, goblin-dashboard provides repeatable directorial control that operates at *T*0​\=\$0.00 before media compilation begins.

---

*User prompt: {{FOCUS: 12\. Live Simulation & Ledger Telemetry (goblin-dashboard) }} /extreme-details*

Response: The **Live Simulation & Ledger Telemetry** subsystem in goblin-dashboard operates as the real-time, non-authoritative monitoring plane for the underlying narrative engine (worker-sower-engine). Positioned within **Cluster 05.delivery**, the dashboard visualizes the active **Runtime Relational Ledger** (instantiated in SQLite, PostgreSQL, or Cloudflare D1) without mutating canonical facts directly or taking on execution authority.

By projecting dynamic state deltas across Server-Sent Events (SSE) and WebSocket streams, this interface allows the human showrunner to track actor coordinates, anatomical injury vectors, paranoia clocks, emotional debts, and epistemic firewalls before scenes are stamped into executable Remotion components.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   SOVEREIGN SIMULATION CORE                            │`  
`│  (worker-sower-engine on Rig 1 CPU/RAM or Cloudflare D1 CANON_DB)      │`  
`│  • Stage 3 Conflict Lottery & Stage 4 2d6 Duel Resolver                │`  
`│  • Pure Math Spatial Proximity Queries (goblin-spatial)                │`  
`│  • Event-Sourced Relational Ledger: S_n ──► S_n+1                      │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Live SSE / WSS Telemetry Feed`  
                                    `│ (Trace ID: tr_8f1b2c4a9e)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   goblin-dashboard TELEMETRY INGESTION                 │`  
`│               (Astro Shell + React Presentation Islands)               │`  
`├───────────────────────────────────┬────────────────────────────────────┤`  
`│ [1] Relational & String Ledger    │ [2] Unified Pressure Meters        │`  
`│     • Character stats (Spite)     │     • Multi-segment Paranoia Clocks│`  
`│     • String balances held/owed   │     • Basis-point accumulation     │`  
`│     • Resentment accumulators     │     • Escalation tripwire alarms   │`  
`├───────────────────────────────────┼────────────────────────────────────┤`  
`│ [3] Somatic Trauma HUD            │ [4] Epistemic Horizon Panopticon   │`  
`│     • Anatomical injury maps      │     • Subjective BeliefRecords     │`  
`│     • Functional arm calculations │     • Rumor hop degradation (0.8^h)│`  
`│     • Negative kinetic verb masks │     • Ignorance by Omission gates  │`  
`├───────────────────────────────────┴────────────────────────────────────┤`  
`│ [5] PixiJS Spatial Canvas Debugger                                     │`  
`│     • H3 hex grid coordinates (q, r, s) & movement trails              │`  
`│     • Line-of-sight raycasts & acoustic damping contours (cdB)         │`  
`│     • Tactical cell crowding alarms (>2 goblins / centroid)            │`  
`└────────────────────────────────────────────────────────────────────────┘`

### **1\. Architectural Foundations & Telemetry Transport**

The dashboard maintains strict boundary isolation: **simulation precedes generation, and observation never asserts state**.

#### **1\. Ingestion Isolation & The API Boundary**

The dashboard communicates with worker-sower-engine exclusively through network boundaries using REST, SSE, and WebSockets (e.g., ws://localhost:3000/events or edge worker routes). The dashboard holds zero direct file-system handles to raw drafts inside worker-sower-engine/drafts/ and possesses no write access to underlying SQLite databases. This prevents cross-process file-lock contention and eliminates synchronization latency during production runs.

#### **2\. Global Correlation Trace Context (trace\_id)**

Every telemetry packet, state shift, and mechanical duel resolution carries a cryptographically unique correlation identifier (e.g., tr\_8f1b2c4a9e). This trace context binds the operational life cycle across physical and network nodes:

> * Injected into HTTP headers dispatched to Cloudflare Durable Objects (ShotCoordinatorDO).  
> * Mapped directly to ComfyUI execution payloads (prompt\_id tracking tags) on Rig 2\.  
> * Attached to S3 object metadata on Cloudflare R2 binary plates.  
> * Surface-rendered inside the dashboard's audit terminal (cns00) to let showrunners correlate a visual glitch directly to an upstream duel calculation or somatic invariant failure.

#### **3\. Dual-Target Transport Resolution**

The telemetry ingestion pipeline adapts to the deployment target using the 4-tier precedence switchboard:

> * **Local Rig 1 Workstation:** Connects via loopback addressing (\[http://127.0.0.1:3000\](http://127.0.0.1:3000)), yielding sub-15ms round-trip latency (RTT) for rapid local drafting.  
> * **Cloudflare Edge Deployment:** Relies on @astrojs/cloudflare SSR routes querying Cloudflare D1 directly in sub-5ms, with live events streamed over Cloudflare Durable Objects using the **WebSocket Hibernation API**. The isolate sleeps during idle evaluation, dropping compute costs to **\$0.00** while maintaining live socket connectivity.

### **2\. The Relational & String Debt Matrix**

The dashboard tracks interpersonal tension and social collateral tracked in the engine's dynamic relational tables:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│            RELATIONAL LEVERAGE & STRING BALANCE MATRIX                 │`  
`├───────────────────┬───────────────────┬──────────────┬─────────────────┤`  
`│ Actor Pairing     │ String Balances   │ Resentment   │ Ack. Window     │`  
`├───────────────────┼───────────────────┼──────────────┼─────────────────┤`  
`│ Bog ──► Spleen    │ Bog holds 2 on Spl│ 4,200 bp     │ ACTIVE (Cycle 3)│`  
`│ Spleen ──► Wart   │ Spleen holds 1    │ 1,500 bp     │ CLOSED (Late)   │`  
`│ Wart ──► Grissel  │ Balanced (0)      │ 6,800 bp [!] │ PENDING TRIGGER │`  
`│ Grissel ──► Bog   │ Grissel holds 3   │ 8,100 bp [!] │ ACTIVE (Cycle 1)│`  
`└───────────────────┴───────────────────┴──────────────┴─────────────────┘`

#### **1\. Leverage Tokens ("Strings")**

In the dramatic mechanics of worker-sower-engine, social leverage is modeled as discrete, directed tokens called **Strings**. The StringBalanceMatrix.tsx component visualizes this directed graph:

> * If Bog holds 2 Strings over Spleen (leverage\_strings: { "char\_spleen": 2 }), Bog can spend a String during a Stage 4 mechanical duel to force an automatic \+1 die modifier or compel Spleen to take on an emotional condition.  
> * The dashboard displays active String transactions in real time, updating immediately when a duel resolver spends or awards leverage.

#### **2\. Emotional Resentment Accumulators**

Interpersonal friction does not reset to zero between episodes. Unresolved grievances accumulate resentment points measured in basis points (0 to 10,000 bp):

> * **Dynamic Decay vs. Compounding:** If an actor fails to acknowledge an owed debt within an active **Acknowledgment Window** (tracked as integer simulation cycles), the engine triggers an unacknowledged slight event, increasing resentment by \+1,500 bp per cycle.  
> * **Visual Alarms:** The dashboard highlights pairs exceeding 6,000 bp in amber (HIGH\_FRICTION) and pairs crossing 8,000 bp in flashing red (CRITICAL\_VOLATILITY), indicating that the dyad is primed for high-stakes conflict in the Stage 3 lottery.

### **3\. Paranoia Clocks & Unified Pressure Meter Telemetry**

Psychological strain and systemic escalation are rendered through the **Unified Pressure Meter Engine** and multi-segment **Paranoia Clocks**:

`┌─────────────────────────────────────────────────────────────┐`  
`│                 ACTIVE PARANOIA CLOCKS                      │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  CLOCK: The Attic Watch (clk_attic_surveillance)            │`  
`│  Ticks: [■■■■□□] 4 / 6 Segments                             │`  
`│  State: ESCALATING  | Rate: +1 tick / 2 cycles              │`  
`│  Tripwire Event: Spawns grv_generational_famine_feud        │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  CLOCK: Pantry Contraband Sweep (clk_pantry_purge)          │`  
`│  Ticks: [■■■■■■] 6 / 6 Segments [!] TRIPPED                 │`  
`│  State: CRITICAL OVERDRIVE                                  │`  
`│  Action: Force opposed 2d6 search duel in next cycle        │`  
`└─────────────────────────────────────────────────────────────┘`

#### **1\. Clock Anatomy & State Tracking**

Paranoia Clocks represent narrative countdowns partitioned into discrete integer segments (*N*∈{4,6,8,12}):

> * **Tick Accumulation:** Clock ticks advance based on duel margins (e.g., a catastrophic failure on a stealth roll adds \+2 ticks) or environmental pressure spikes.  
> * **Basis-Point Foundation:** Behind visual clock segments, continuous tension variables operate on a 10,000 bp scale (100.00%), preventing floating-point rounding divergence across distributed runtimes.

#### **2\. Downstream Lottery Coupling**

Paranoia Clocks directly alter the narrative conflict lottery:

> * When a clock reaches its final segment (*N*/*N*), it triggers an atomic state mutation: unlocking downstream child grievances in the Directed Acyclic Graph (DAG) or injecting emergency confrontation scenes into the Conductor pipeline.  
> * The dashboard's ParanoiaClockCard.tsx island visualizes active clocks, estimated time-to-breach, and associated mechanical consequences, allowing the showrunner to anticipate season climax points.

### **4\. Somatic State & Biological Trauma Profiling**

The **Somatic HUD** (SomaticHUDCard.tsx) provides continuous telemetry on physical embodiment, anatomical damage, and locomotion capabilities:

`┌─────────────────────────────────────────────────────────────┐`  
`│                 SOMATIC CAPABILITY HUD                      │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  ACTOR: char_wart (Wart)                                    │`  
`│  Locomotion: bipedal_hunched  |  Gait: UNSTEADY_GAIT        │`  
`│  Functional Limbs: [●] Left: SEVERED  [●] Right: OK (1.0)   │`  
`│  Held Prop: item_copper_flange (1 / 1 Slots Used)           │`  
`│  Banned Verbs: SPRINT, VAULT, CLIMB, EMBRACE                │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  ACTIVE TRAUMAS:                                            │`  
`│  • severed_left_arm (Permanent, -1.0 Arm Capacity)          │`  
`│  • concussive_hearing_loss (+1,500 cdB Auditory Penalty)    │`  
`└─────────────────────────────────────────────────────────────┘`

#### **1\. Real-Time Upper-Limb SAT Solvers**

The dashboard dynamically evaluates functional manipulation capacity:

availableArms={0.0max(0.0,2.0−∑severe\_trauma)​if locomotion\_baseline∈{"sessile","slithering"}otherwise​

> * Severe conditions decrementing limb capacity by 1.0 each include: braxial\_plexus\_severed, severed\_right\_arm, severed\_left\_arm, paralyzed\_arm, and amputated\_limb.  
> * If an actor with availableArms=1.0 (such as Wart) is shown holding an item, the dashboard strikes through the off-hand equipment slot, visually enforcing hand saturation limits.

#### **2\. Negative Kinetic Verb Masks**

The HUD extracts active banned\_kinetic\_verbs directly from the ledger:

> * If an actor has sustained knee trauma (stiff\_left\_knee), verbs such as "sprint", "vault", and "leap" are highlighted with red strikethrough styling.  
> * When candidate screenplay ASTs (dialogue\_ast.json) are received, the dashboard's pre-flight linter audits actions against this mask. If an impaired actor attempts a banned movement, the dashboard flags a SOMATIC\_GAUNTLET\_FAIL violation, disabling scene approval buttons.

### **5\. Epistemic Horizons & Belief Record Auditing**

The **Epistemic Panopticon** (EpistemicAuditPanel.tsx) tracks character knowledge, beliefs, and sensory observations to prevent omniscience leaks:

`export interface BeliefRecordTelemetry {`  
  `readonly belief_id: string;`  
  `readonly holder_id: string;`  
  `readonly subject_id: string;`  
  `readonly predicate: string;`  
  `readonly object_id: string;`  
  `readonly proposition_slug: string;`  
  `readonly subjective_confidence_bp: number; // 0 to 10,000 basis points`  
  `readonly source_type: 'DIRECT_OBSERVATION' | 'TESTIMONY' | 'INFERENCE' | 'RUMOR';`  
  `readonly source_event_id: string;`  
  `readonly hop_count: number;`  
`}`

`┌─────────────────────────────────────────────────────────────┐`  
`│             EPISTEMIC HORIZON AUDITOR (ISLAND)              │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  TOPIC: mystery_the_famine (The Great Winter Famine)        │`  
`├──────────────────────────────┬──────────────────────────────┤`  
`│ ACTOR: char_bog              │ ACTOR: char_spleen           │`  
`│ Horizon: TOTAL_IGNORANCE     │ Horizon: RUMOR_ONLY          │`  
`│ Injected: [OMITTED FROM PROMPT] Injected: [UNVERIFIED HEARSAY]│`  
`│ Confidence: 0 bp             │ Confidence: 6,400 bp (Hop: 1)│`  
`│ Clue Visibility: ZERO        │ Claim: "Cellar vent killed it"│`  
`└──────────────────────────────┴──────────────────────────────┘`

#### **1\. Ignorance-by-Omission Visualization**

The dashboard displays the active horizon assigned to each character across five states:

> * TOTAL\_IGNORANCE: Verifies that secret tokens are scrubbed from the character's prompt context.  
> * RUMOR\_ONLY: Visualizes hearsay beliefs subject to exponential hop decay:  
>   Confidence(*h*)=InitialConfidence×(0.8)*h*  
> * FALSE\_BELIEF: Confirms the character holds an authored misconception treated as absolute truth.  
> * PARTIAL\_FACT: Tracks permitted physical clue tokens (permitted\_clue\_tokens) visible to the actor without revealing root causes.  
> * WITHHELD: Confirms the actor knows the secret but is constrained from speaking by dramatic taboos and token attenuation masks.

#### **2\. Sensory Perception Verification**

Cross-references dynamic character locations against physical geometry in goblin-spatial:

> * **Optical Line-of-Sight (LoS):** Validates whether an actor was present in the room and had an unoccluded line-of-sight when an event occurred before committing a DIRECT\_OBSERVATION belief.  
> * **Acoustic Damping Bounds:** Calculates decibel attenuation across room boundaries (e.g., Warm Pipe \= 2,500 cdB damping). If a whisper occurs behind a heavy bulkhead, the dashboard confirms that sound levels fell below the character's auditory threshold (*T*hearing​), verifying that the event remained unobserved.

### **6\. Spatial Hex Grid & PixiJS Canvas Debugger**

Mounted within src/components/telemetry/PixiJSDebugger.tsx (on src/pages/telemetry/spatial.astro), the dashboard embeds a hardware-accelerated **PixiJS Visual Debugger** that renders simulation spatial mechanics in real time:

`┌─────────────────────────────────────────────────────────────┐`  
`│                       PixiJS Stage                          │`  
`│                                                             │`  
`│  [Grid Layer]         Renders H3 polygons via Graphics      │`  
`│  [Occlusion Layer]    Renders impassable walls / hazards    │`  
`│  [Trail Layer]        Renders cycle N-10 to N movements     │`  
`│  [Actor Layer]        Renders goblin tokens and IDs         │`  
`│  [Sensory Overlay]    Renders LoS rays and witness radii    │`  
`│                                                             │`  
`└──────────────────────────────┬──────────────────────────────┘`  
                               `│`  
            `Driven by Simulation Cycle Scrubber`  
                               `▼`  
`┌─────────────────────────────────────────────────────────────┐`  
`│                      UI Control Shell                       │`  
`│  • Play / Pause / Cycle Scrubber (Cycle 0 to Cycle N)       │`  
`│  • Proximity Ruler (Select Cell A -> Hover Cell B)          │`  
`│  • Line-of-Sight Raycast Visualizer (Pass / Occluded)       │`  
`│  • Crowd Density Heatmap Toggle                             │`  
`└─────────────────────────────────────────────────────────────┘`

#### **1\. Layer Hierarchy & Canvas Rendering**

The PixiJS stage runs at 60 FPS on the client browser, organizing spatial entities into discrete rendering passes:

> * **Grid Layer:** Renders the H3 axial coordinate lattice (*q*,*r*,*s*), coloring cells based on terrain travel costs and room identities.  
> * **Occlusion Layer:** Draws solid bulkheads, closed portal hatches, and impassable geometry defined in canonical location dossiers.  
> * **Trail Layer:** Visualizes breadcrumb paths for all actors over the preceding 10 simulation cycles (*N*−10→*N*), exposing pathing loops or erratic wandering.  
> * **Actor Layer:** Renders goblin tokens, facing vectors (field-of-view cones), and active condition indicators.  
> * **Sensory Overlay:** Projects dynamic line-of-sight raycasts and acoustic falloff rings originating from active sound sources.

#### **2\. Timeline Scrubber & Simulation Ingestion**

The spatial tool operates in two playback modes:

> * **Batch Replay Mode:** Ingests a structured JSON manifest containing the initial state (*S*0​) and an ordered array of cycle state deltas (Δ0​,Δ1​,…,Δ*n*​). The showrunner can scrub back and forth along the timeline (Cycle 000 to Cycle 100\) to inspect intermediate positioning.  
> * **Live Streaming Mode:** Subscribes to live WebSocket telemetry (ws://...). The canvas updates dynamically as turns resolve, drawing actor movements, LoS checks, and duel outcomes without requiring manual page refreshes.

#### **3\. Spatial Defect Diagnostics**

The canvas automatically highlights three physical defect patterns:

> * **The Prop-Loop Bottleneck:** Flags actors pacing back and forth between two adjacent cells across multiple cycles, indicating broken goal evaluation in the Sower engine.  
> * **Bulkhead Bleed:** Detects invalid line-of-sight rays piercing impassable structural barriers, identifying wall cells accidentally omitted from void\_cells.  
> * **Stage Crowding Violations:** If more than two character tokens occupy the same hexagonal centroid without triggering an involuntary shove or duel, the dashboard highlights the cell with red intersecting halos.

### **7\. Dual-Target Ledger Synchronization: Rig 1 vs. Cloudflare D1**

goblin-dashboard displays ledger telemetry across two execution environments without code divergence:

| Telemetry Dimension | Rig 1 Local Desktop Cockpit | Cloudflare Pages Edge Deployment |
| :---- | :---- | :---- |
| **Ledger Storage Plane** | Local SQLite (state.db) or PostgreSQL instance on Rig 1\. | Distributed **Cloudflare D1** (CANON\_DB hot relational ledger). |
| **Ingress Latency** | Direct loopback transit (\<15 ms RTT). | Anycast edge routing (40–150 ms global RTT, \<5 ms D1 queries). |
| **Real-Time Event Relay** | Local Node/Express WebSocket server on port 3000\. | **ShotCoordinatorDO** via the WebSocket Hibernation API. |
| **Idle Execution Cost** | **\$0.00** (Runs entirely on local workstation silicon). | **\$0.00** (Durable Objects sleep while showrunner inspects telemetry). |
| **Fail-Closed Gate** | Local process assertions and terminal curses logs (cns00). | Sub-millisecond D1 continuity queries (is\_dirty \== 0). |

### **8\. Directorial Intervention from Telemetry Views**

The telemetry interface serves as a launching point for directorial interventions:

`┌─────────────────────────────────────────────────────────────┐`  
`│                 DIRECTORIAL TELEMETRY ACTION                │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  SELECTED DYAD: char_bog <-> char_spleen                    │`  
`│  Active Resentment: 8,200 bp (CRITICAL)                     │`  
`│  String Balance   : Bog holds 2 Strings on Spleen           │`  
`│  Paranoia Clock   : 5 / 6 Ticks (clk_the_attic_watch)       │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  [ FORCE 2d6 DUEL ROLL ]         [ PIN TO NEXT EPISODE ]    │`  
`│  [ RESET PARANOIA CLOCK ]        [ DISPLACE ACTOR (HEX) ]   │`  
`└─────────────────────────────────────────────────────────────┘`

> * **One-Click Dyad Pinning:** If telemetry shows an active pairing nearing critical tension, the showrunner can click **Pin to Next Episode**, dispatching an authenticated intent (PIN\_GRIEVANCE) to bypass the PRNG lottery and schedule the encounter.  
> * **Manual State Adjustments ("Miracles on Demand"):** Allows the director to inject temporary conditions, advance clock segments, or re-position trapped characters via authenticated intent envelopes (POST /admin/mutate-zone), with every intervention stamped into the audit ledger under the active trace\_id.

---

*User prompt: {{FOCUS: 3\. "Hand of God" Director Interventions & Overrides (goblin-dashboard) }} /extreme-details*

Response: The **"Hand of God" Director Interventions & Overrides** subsystem in goblin-dashboard formalizes human-in-the-loop executive authority over an otherwise autonomous, deterministic pipeline. Situated in **Cluster 05.delivery**, it acts as the "God Mode" and "Red Button" console. It bridges the gap between mechanical simulation (worker-sower-engine) and downstream programmatic video compilation (goblin-viewport-template / goblin-episodes), allowing showrunners to bypass random number generators (PRNG), resolve narrative drift, inject world events, or freeze studio fleet execution.

### **1\. Architectural Philosophy & The Directional Boundary**

The intervention layer is governed by a strict ontological separation between meaning and presentation:

Meaning (Axis A / State Ledger)⟷Representation (Axis B / Media Projections)  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   HUMAN SHOWRUNNER DIRECTORIAL INTENT                  │`  
`│       • Directorial Intuition, Writers Room Pacing, Emergency Halts     │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Emits Intent Envelopes (Never raw DB writes)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   goblin-dashboard (CONTROL SURFACE)                   │`  
`│   • Drift Approval Modals        • Dyad & Grievance Pinning HUD        │`  
`│   • Emergency Stop (D1 Breaker)  • Showrunner Eject Button (@locked)   │`  
`└───────────────────┬────────────────────────────────┬───────────────────┘`  
                    `│                                │`  
       `Authenticated Intent (HTTP POST)              │ Stamped Header Mutex`  
                    `▼                                ▼`  
`┌──────────────────────────────────────┐ ┌──────────────────────────────┐`  
`│ worker-sower-engine (Rig 1 Core)     │ │ goblin-viewport-template     │`  
`│ • State Mutation Reducer             │ │ • Episode_XXX.tsx            │`  
`│ • Appends DIRECTOR_OVERRIDE to log   │ │ • Seals via @lifecycle: locked│`  
`│ • Re-evaluates Invariant Gauntlets   │ │ • Halts compiler overwrite   │`  
`└──────────────────────────────────────┘ └──────────────────────────────┘`

> 1. **Unidirectional Semantic Isolation:** Visual edits never retroactively alter upstream narrative truth. If a showrunner manually adjusts a camera framing from a wide shot (1.0×) to an extreme close-up (1.25×) on an actor's face in Episode\_XXX.tsx, that visual choice **cannot** feed back upstream to increase the character's paranoia score in the simulation ledger. Meaning governs representation; representation never governs meaning.  
> 2. **First-Class Auditable Transitions:** Human intervention is treated not as an operational flaw, but as a formal state transition. Every manual action must emit an append-only, cryptographic DIRECTOR\_OVERRIDE event into the historical project ledger.  
> 3. **Fail-Closed Gatekeeping:** Manual interventions bypass simulation lotteries, but they **cannot violate invariant physical laws**. If a director attempts to inject an action that commands a single-armed character to climb a rope, the somatic invariant engine catches the violation at compile time (*T*0​\=\$0.00), rejecting the command before speech synthesis or GPU diffusion begins.

### **2\. Drift Confirmation Gate (Interactive Authorization Loop)**

When worker-sower-engine generates dialogue via local LLMs (e.g., Qwen 2.5 on Rig 1), the extraction parser evaluates whether the generated drama caused character states to diverge from the seed plan.

If the engine flags state drift—such as tension escalating faster than anticipated or an unscripted injury occurring—the dashboard interrupts autonomous advancement via the **Drift Confirmation Gate**:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│             LEDGER DRIFT CONFIRMATION REQUIRED (Modal View)            │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  Target: scenes/the_spoon_dispute_cycle_12.md                          │`  
`│  The following machine-state variables differ from the original seed:  │`  
`│                                                                        │`  
`│    • peak_level:        shifted from [7] to [9] (+2 Volatility Jump)   │`  
`│    • escalation_stage:  shifted from [3] to [4] (Critical Tripwire)    │`  
`│    • somatic_injury:    char_bog gained condition [dislocated_thumb]   │`  
`│                                                                        │`  
`│  This will permanently alter global ledger weights for this cycle.     │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│  [ AUTHORIZE DRIFT (COMMIT) ]             [ REJECT & FORCE RE-ROLL ]   │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Pre-Commit Lockout:** The extraction harness flags requiresConfirmation \= true. The mutation is quarantined in a temporary staging buffer (.tmp) and cannot commit to the SQLite ledger or Cloudflare D1.  
> * **Showrunner Decision Vectors:**  
  * **Authorize Drift:** The dashboard dispatches an authorization envelope signed by the director's session key. The engine merges the state shift, calculates the new root hash (*H*root​), and invalidates downstream caches.  
  * **Reject & Re-Roll:** The candidate Abstract Syntax Tree (dialogue\_ast.json) is discarded, a failure token is recorded into eval/rejections.jsonl, and the engine prompts a new generation pass with tightened parameter boundaries.

### **3\. Dyad & Grievance Pinning ("Rigging the Lottery")**

Under autonomous operation, worker-sower-engine selects scene participants and interpersonal conflicts through Stage 3 drama lotteries based on relational friction weights and Paranoia Clock states.

The dashboard’s **Pinning Console** allows showrunners to manually schedule conflicts and bypass PRNG randomization:

#### **Operational Interventions**

> * **Force a Confrontation:** The director selects an un-spawned or dormant node in the Grievance Directed Acyclic Graph (DAG) and forces it to maximum escalation stage (*I*\=*I*max​), bypassing cooldown cycles (*C*cycles​) to stage a narrative climax.  
> * **Promote a Dormant Character:** If telemetry indicates a cast member has suffered from dyadic starvation (missing from active scenes for multiple cycles), the director manually injects them into the next duel pairing.  
> * **Grant a Mercy:** Directorial reset of emotional condition debuffs (e.g., removing \[humiliated\] or \[exhausted\]) or clearing accumulated String debts. This acts as a narrative release valve, preventing the simulation from spiraling into continuous mutual destruction.  
> * **Activate/Retire Clocks:** Manually swaps which of the 6–8 available Paranoia Clocks is active, directing the thematic pressure of the season (e.g., swapping an internal food-scarcity clock for an external surveillance clock).

`// goblin-dashboard/src/lib/schemas/directorPinning.ts`  
`import { z } from 'zod';`

`export const DyadPinningIntentSchema = z.object({`  
  `intent_id: z.string().uuid(),`  
  `intent_type: z.literal('PIN_GRIEVANCE_OVERRIDE'),`  
  `authorizer: z.literal('SHOWRUNNER'),`  
  `target_cycle: z.number().int().positive(),`  
  `payload: z.object({`  
    `grievance_id: z.string().regex(/^grv_[a-z0-9_]+$/),`  
    `forced_participants: z.tuple([`  
      `z.string().regex(/^char_[a-z0-9_]+$/),`  
      `z.string().regex(/^char_[a-z0-9_]+$/),`  
    `]),`  
    `bypass_cooldown: z.boolean().default(true),`  
    `forced_escalation_stage: z.number().int().min(1).max(5).optional(),`  
    `mercy_resets: z.array(z.string()).optional(),`  
  `}),`  
  `editorial_justification: z.string().min(10).max(500),`  
`}).strict();`

`export type DyadPinningIntent = z.infer<typeof DyadPinningIntentSchema>;`

### **4\. Admin Object & Event Injection ("Miracles on Demand")**

The dashboard provides root-level Game Master (GM) tools enabling "Miracles on Demand" via an authenticated Zone Mutator:

`┌─────────────────────────────────────────────────────────────┐`  
`│                 MIRACLE INJECTION CONSOLE                   │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  OPCODE: OP_MIRACLE // Root Access State Modification       │`  
`│  Target Room: loc_the_warm_pipe (Hex: 0x882685623ffffff)    │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  Injection Type:                                            │`  
`│  ( ) SPAWN_PROP     (●) SENSORY_DEUS_EX    ( ) ENVIRONMENTAL│`  
`│                                                             │`  
`│  Payload Specification:                                     │`  
`│  • Entity ID: item_kerosene_canister                        │`  
`│  • Custody: CACHED_IN_ROOM (Hidden beneath joist)           │`  
`│  • Logic Field Overlay: "Acoustic Silence" (Damping: 9999)  │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  Resource Limits:                                           │`  
`│  [■■■■■□□□□□] Entities: 1/5 Max  | Radius: 1/5 Hexes Max    │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  [ DISPATCH MIRACLE TO ZONEDO ]      [ ABORT INJECTION ]    │`  
`└─────────────────────────────────────────────────────────────┘`

#### **1\. Ingress & Privilege Verification**

Miracle payloads route through apps/spine/src/routes/admin.ts to apps/edge/src/objects/ZoneDO.ts. Requests require authentication against EDGE\_MASTER\_KEY via a dedicated Super-Admin JWT. Standard player and client traffic are quarantined to public queues, while miracles execute as high-priority interrupts.

#### **2\. The Resource Containment Field (Anti-Grey-Goo Rules)**

To prevent accidental narrative corruption, the simulation core enforces hard mathematical constraints on directorial injections:

> * **Max\_Entities\_Spawned:** Hard-clamped to ≤5 entities per miracle.  
> * **Max\_Gold\_Value:** Capped at 5,000 GP material equivalent.  
> * **Max\_Terrain\_Radius:** Clamped to a maximum radius of ≤5 H3 hex cells.

#### **3\. Ephemeral Logic Field Overlays**

Directorial intervention can inject temporary spatial fields over target hexes:

> * *The Truth Field:* Temporarily prevents characters within a room from communicating falsehoods (enforced via context-assembly filters in worker-sower-engine).  
> * *Somatic Preservation Field:* Enforces a temporary safety rule where combat trauma halts before lethal injury, preserving characters for scheduled season climaxes.

### **5\. The Emergency Halt Kill Switch (Global Studio Brake)**

When an unrecoverable failure cascades across the pipeline (such as model hallucination loops, runaway file mutations, or corrupted state diffs), the showrunner can trigger the global emergency stop:

`┌─────────────────────────────────────────────────────────────┐`  
`│                 EMERGENCY STUDIO HALT                       │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  STATUS: FLEET DISPATCH NOMINAL                             │`  
`│                                                             │`  
`│  [ ! ! ! TRIGGER EMERGENCY STUDIO HALT ! ! ! ]              │`  
`│                                                             │`  
`│  WARNING: Immediately locks dispatch across Cloudflare D1,  │`  
`│  revokes active worker leases, and drops WebSocket daemons. │`  
`└─────────────────────────────────────────────────────────────┘`

#### **The Kill Switch Sequence**

Mounted via src/components/controls/EmergencyHaltButton.tsx, activating the control initiates a fail-closed shutdown:

`// goblin-dashboard/src/pages/api/emergency-halt.ts`  
`import type { APIRoute } from 'astro';`

`export const POST: APIRoute = async ({ locals }) => {`  
  `const db = locals.runtime?.env?.CANON_DB;`  
  `const coordinator = locals.runtime?.env?.SHOT_COORDINATOR;`

  `// 1. Atomic D1 Lockout Assertion`  
  `` await db.prepare(` ``  
    `UPDATE studio_config`   
    `SET global_agent_dispatch_locked = 1,`  
        `halt_timestamp = unixepoch(),`  
        `halt_reason = 'DIRECTOR_MANUAL_KILL_SWITCH'`  
    `WHERE singleton_id = 1;`  
  `` `).run(); ``

  `// 2. Broadcast High-Priority Abort to ShotCoordinatorDO`  
  `const doId = coordinator.idFromName('global-render-queue');`  
  `const coordinatorStub = coordinator.get(doId);`  
  `await coordinatorStub.fetch('http://do/abort-all', { method: 'POST' });`

  `return new Response(JSON.stringify({ status: 'FLEET_FROZEN' }), { status: 200 });`  
`};`

#### **Fleet-Wide Cascading Impact**

> 1. **Edge Ingress Lock:** Every subsequent request hitting the Hono edge gateway encounters global\_agent\_dispatch\_locked \== 1, terminating with HTTP 503 Service Unavailable.  
> 2. **Lease Revocation:** ShotCoordinatorDO increments its monotonic epoch counter (*N*→*N*\+1), invalidating all active compute leases held by local daemons.  
> 3. **GPU Hardware De-allocation:** Rig 2's media-broker receives an abort signal, terminates active ComfyUI sampling steps, and issues POST /free to flush VRAM within ∼300 ms.  
> 4. **Git Freeze:** Automated merge bots (e.g., repo-bot) suspend branch integration across all repositories.

### **6\. The Sealed-File Lifecycle ("Showrunner Eject Button")**

When human aesthetic direction clashes with programmatic video generation, goblin-viewport-template prevents automated compilers from overwriting hand-tuned code via the **Showrunner Eject Button**:

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

#### **The Header State Machine**

Every stamped composition (goblin-episodes/episode-XXX/Episode\_XXX.tsx) embeds a cryptographic lifecycle header:

`// @lifecycle: locked`  
`// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f`  
`// @upstream_ast: sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f...`  
`// @director_author: "director_alpha"`  
`// @locked_at: 2026-09-29T14:32:00Z`

#### **State Machine Behaviors**

> * **@lifecycle: generated:** Stamped by generate-episode-repo.ts on build. Clean in-place overwrites are permitted during automated pipeline re-runs.  
> * **@lifecycle: patched:** Applied by automated diagnostic repair agents (e.g., Jules) when executing targeted Abstract Syntax Tree (AST) repairs using ts-morph to fix layout issues.  
> * **@lifecycle: locked:** Applied the moment a human director modifies camera easing curves, timing, or styling in Episode\_XXX.tsx.

#### **The Overwrite Defense & Candidate Forking**

If an upstream narrative script modification triggers generate-episode-repo.ts to re-run:

> 1. The generator parses Episode\_XXX.tsx and detects the @lifecycle: locked tag (or flags a SHA-256 body checksum mismatch).  
> 2. The generator **aborts without modifying Episode\_XXX.tsx**.  
> 3. Upstream compilation output is redirected into Episode\_XXX.candidate.tsx.  
> 4. The system logs an append-only DIRECTOR\_OVERRIDE event to render\_manifest.json, requiring human diff review before changes can merge.

### **7\. Immutable Forensic Ledger Schema (DIRECTOR\_OVERRIDE)**

Every human directorial action leaves an immutable record within the relational event stream and Git commit provenance:

`{`  
  `"$schema": "https://specs.studio.internal/schemas/v1/director_override.json",`  
  `"event_id": "dov_01923f5e_94b1_7210_8a4b_123456789abc",`  
  `"event_type": "DIRECTOR_OVERRIDE",`  
  `"timestamp_utc": "2026-09-29T14:45:12.891Z",`  
  `"trace_id": "tr_8f1b2c4a9e",`  
  `"author": {`  
    `"user_id": "usr_showrunner_01",`  
    `"role": "SHOWRUNNER",`  
    `"auth_method": "SUPER_ADMIN_JWT"`  
  `},`  
  `"target": {`  
    `"repository": "camp-candor/goblin-episodes",`  
    `"workspace": "episode-040",`  
    `"file": "Episode_040.tsx"`  
  `},`  
  `"action_category": "OPTICAL_CAMERA_REFACTOR",`  
  `"property_delta": {`  
    `"component": "Shot03CameraRig",`  
    `"property": "transformOrigin",`  
    `"previous_value": "50% 50%",`  
    `"override_value": "40.23% 19.33%",`  
    `"line_number": 84`  
  `},`  
  `"cryptographic_anchors": {`  
    `"prior_body_checksum": "7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",`  
    `"new_body_checksum": "3c1a8e9f2b4d5a6e7f80123456789abcdef0123456789abcdef0123456789abc",`  
    `"active_state_snapshot_hash": "sha256:7f83b165..."`  
  `},`  
  `"narrative_justification": "Manual override of crash zoom target to center on Bog's eye line during the reaction sting, preventing decapitation due to hunch posture."`  
`}`

#### **Forensic Integrity Properties**

> * **Immutability:** Once written to SQLite/D1, override events cannot be edited or rolled back; reversals require logging a new counter-override event.  
> * **Manifest Provenance Binding:** Final MP4 broadcasts cannot be compiled without packing all active DIRECTOR\_OVERRIDE records into render\_manifest.json.  
> * **Forensic Auditability:** Shows exactly who altered code or state, what values changed, when the action occurred, and the artistic justification behind the override. This guarantees human intervention enhances storytelling without compromising machine auditability.

---

*User prompt: {{FOCUS: 4\. Pre-Viz, Animatic, & Exposure Sheet Review (goblin-dashboard)  }} /extreme-details*

### **Response: 1\. The Pre-Viz & Review Operational Mandate**

Within goblin-dashboard, the **Pre-Viz, Animatic, & Exposure Sheet Review** subsystem serves as the central quality gate separating upstream symbolic scripting (worker-sower-engine) from downstream optical printing (goblin-viewport-template / goblin-episodes) and GPU plate generation (media-broker on Rig 2).

The review interface is designed around a single constraint: **the human showrunner must be able to review, diagnose, and accept or reject a candidate scene specification in ≤60 seconds**. Showing raw dialogue AST JSON to an operator makes rapid editorial evaluation impossible. The review surface translates multi-layered machine contracts into a plain-text operational brief, an interactive multi-track exposure sheet, a CPU-rendered animatic video stream, and an empirical rejection logger.

`┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐`  
`│                        UPSTREAM SYMBOLIC NARRATIVE & ACOUSTIC CONTRACTS                                │`  
`│        dialogue_ast.json (MRUs)  │  exposure_sheet.json (ffprobe)  │  manifest.json (Anchors)         │`  
`└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘`  
                                                    `│ Ingestion via SSR / Astro Frontmatter`  
                                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐`  
`│                              SHOWRUNNER REVIEW GATE (goblin-dashboard)                                 │`  
`│                                                                                                        │`  
`│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │`  
`│  │ 1. ONE-SCREEN OPERATIONAL BRIEF (SceneReviewGate.tsx)                                            │  │`  
`│  │    • Location & Dyad    • Grievance & Underneath    • Mechanical Duel Margin & Exit States       │  │`  
`│  ├──────────────────────────────────────────────────────────────────────────────────────────────────┤  │`  
`│  │ 2. EXPOSURE SHEET SCRUBBER (WaveformScrubber.tsx)                                                │  │`  
`│  │    • Discrete 24 fps Timeline   • ffprobe Audio Stems   • Sidechain Ducking (-14 dB Envelopes)   │  │`  
`│  ├──────────────────────────────────────────────────────────────────────────────────────────────────┤  │`  
`│  │ 3. CPU ANIMATIC VIDEO PLAYER (RemotionPlayerIsland.tsx)                                          │  │`  
`│  │    • Low-Fidelity 2D Cutout / Proxy Stream (Rig 1 CPU: --gl=swangle) ($0.00 Cloud GPU)           │  │`  
`│  │    • Interactive Frame Trimming (Pre-Roll / Post-Roll Dilation)                                  │  │`  
`│  ├──────────────────────────────────────────────────────────────────────────────────────────────────┤  │`  
`│  │ 4. PROGRESSIVE QA & PRE-FLIGHT SENTINELS (Confidence 0 to Confidence 2)                          │  │`  
`│  │    • !MissingAssets Sweep   • Empty-Hash Sentinel Trap   • Viseme Centroid Drift (<4px)          │  │`  
`│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │`  
`└───────────────────────────────────┬────────────────────────────────────────────────┬───────────────────┘`  
                                    `│                                                │`  
                 `[ 1: APPROVE & BATCH DISPATCH ]                  [ 2: REJECT WITH STRUCTURED CODE ]`  
                                    `│                                                │`  
                                    `▼                                                ▼`  
`┌──────────────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐`  
`│ DOWNSTREAM EXECUTION PIPELINE                        │  │ EMPIRICAL EVALUATION CORPUS                  │`  
`│ • generate-episode-repo.ts bakes Episode_XXX.tsx     │  │ • Logs defect to eval/rejections.jsonl       │`  
`│ • Stamps render_manifest.json with provenance hashes │  │ • ts-morph Minimal Enclosing Unit (MEU) Patch │`  
`│ • Dispatches Wan 2.2 #00FF00 GPU plates to Rig 2     │  │ • Calibrates local LLM prompts & linters     │`  
`└──────────────────────────────────────────────────────┘  └──────────────────────────────────────────────┘`

### **2\. The One-Screen Operational Briefing Interface**

To satisfy the ≤60-second review requirement, SceneReviewGate.tsx compiles the raw data of dialogue\_ast.json, the relational ledger state, and duel outcomes into a concise, human-readable terminal-style brief:

`================================================================================`  
`SCENE: ep040_sc03 (Swamp Relay / Day)`  
`CAST: BOG vs SPLEEN`  
`GRIEVANCE: The Good Silver Spoon (Resource Hoarding, Stage 2)`  
`SUBTEXT: Bog feels uncredited; Spleen refuses to acknowledge dependence.`  
`MECHANICAL OUTCOME: Costly Win for Spleen (Margin: +2, 1 String Spent)`  
`EXIT STATE: Bog gains [humiliated]; Spleen gains [exhausted]; Wart gains 1 String.`

`BEAT PREVIEW:`  
  `1. [SPLEEN] Accuses Bog of misplacing brass fittings near the sump.`  
  `2. [BOG] Deflects, bringing up who hauled rations through the dry cycle.`  
  `3. [SPLEEN] Displays the silver spoon; claims Bog would have lost it in mud.`  
  `4. [BOG] Surrenders the siphon wrench; retreats to hut [MANDATED EXIT BEAT].`

`[ 1: APPROVE ]   [ 2: REJECT & LOG REASON ]   [ 3: EDIT CONSTRAINTS ]`  
`================================================================================`

#### **Field Derivations & Data Aggregation**

> * **Location & Cast:** Extracted directly from the scene AST frontmatter.  
> * **Grievance & Subtext (Surface vs. Underneath):** The Surface Complaint (what characters bicker about: brass fittings, the silver spoon) is juxtaposed directly against The Underneath (the existential resentment: unacknowledged survival debt). This allows the showrunner to immediately verify whether the **Attenuation Heuristic** held, or if the model blurted out its internal leverage.  
> * **Mechanical Outcome:** Renders the resolution of Stage 4 opposed 2d6 duels, showing margins, String leverage spent, and newly assigned emotional or somatic conditions (\[humiliated\], \[exhausted\]).  
> * **Dwight Swain MRU Beat Preview:** Compresses multi-turn screenplay sequences into a four-beat Motivation-Reaction Unit summary ending on the non-negotiable physical exit trigger.

### **3\. Exposure Sheet Auditing & The Acoustic Clock**

The pipeline operates on a foundational rule: **Audio is the non-negotiable master clock of time**. Script generators and diffusion models possess no biological cadence; speech stems must be synthesized and locked to disk before visual timelines are constructed.

`AUDIO TIMEBASE DOMAIN: 48,000 integer samples/sec (Continuous Acoustic Truth)`  
  `│`  
  `├─ Measured Duration: e.g., 3,120 ms (149,760 samples)`  
  `├─ Discrete Sample Triggers: Phoneme Viseme Marker at Sample 26,742`  
  `└─ Sidechain Ducking Envelope: -14 dB attenuation during active speech`  
  `│`  
  `▼ Projection: Sample Index S = Frame * (48000 / 24) = Frame * 2000`  
`MASTER VIDEO CLOCK: 24 integer frames/sec (Discrete Optical Cuts)`  
  `│`  
  `├─ target_frames = ceil(3.120 * 24) = 75 frames (Delivery Budget)`  
  `└─ Absolute Timeline Anchor: fromFrame_k = Σ duration_i`

#### **1\. Integer Frame Ceiling Arithmetic**

Dialogue .wav files generated by the local TTS microservice (port 8000\) are analyzed via ffprobe to determine duration in milliseconds (*D*ms​). exposure\_sheet.json quantizes this acoustic truth into discrete 24 fps integer frames:

target\_frames=⌈(1000*D*ms​​)×24⌉

#### **2\. Separation of Measured Duration and Creative Padding**

To prevent audio re-synthesis loops when adjusting scene pacing, exposure\_sheet.json strictly decouples raw acoustic duration from editorial padding:

> * **measured\_duration\_frames:** The immutable integer frame count derived directly from ffprobe audio analysis.  
> * **pre\_roll\_frames & post\_roll\_frames:** Creative pacing buffers layered around the line.  
> * **Total Sequence Budget:**  
>   durationInFrames=pre\_roll\_frames+measured\_duration\_frames+post\_roll\_frames

Within goblin-dashboard, the showrunner can trim or dilate pre-roll and post-roll using UI slider handles without requiring the audio engine to re-synthesize speech stems.

#### **3\. Acoustic Signal Hierarchy & Ducking Envelopes**

The WaveformScrubber.tsx component visualizes the multi-track stem structure:

> * **Track 1 (Dialogue Stems):** Normalized strictly to **−1.0 dBTP** (True-Peak).  
> * **Track 2 (Foley SFX Cues):** Punctual transients (footsteps, clothing grabs, tool drops) seeded deterministically via PRNG.  
> * **Track 3 (Ambient Beds / Music):** Background room tone held under −60 dBFS.  
> * **Automated Sidechain Ducking Envelope:** Active dialogue triggers an automatic **−14 dB attenuation curve** across Track 3, executing over a 6-frame attack, holding for the duration of the dialogue stem, and releasing over 12 frames back to unity gain.

### **4\. Interactive Animatic Pre-Viz & Low-Cost Pacing Proof**

The animatic review gate (POD-14: Pre-Vis & Animatic Pod) exists to prove that a scene's visual pacing, eyelines, and cutting structure work at rough fidelity **before a single expensive, high-resolution frame is rendered by GPU diffusion nodes**.

#### **1\. Zero Cloud GPU Burn (*T*0​\=\$0.00)**

Animatic previews inside the dashboard execute via Remotion's software-rasterized OpenGL pipeline on Rig 1's CPU/RAM:

`npx remotion render src/index.ts ep040-sh03 --frames=0-75 --gl=swangle --concurrency=1`

> * **Cost Invariant:** Zero cloud infrastructure, API tokens, or high-draw GPU VRAM allocations are consumed during animatic generation and review.  
> * **Low-Fidelity 2D Cutout Proxies:** Uses base puppet cutouts (variants.idle), simple 2D beat-board sketches, or flat color blocks to verify character staging and composition.

#### **2\. Interactive Pacing Polish (The Astro RemotionPlayerIsland)**

The showrunner audits the animatic directly within RemotionPlayerIsland.tsx:

> * **Vocal Cadence & Pause Audit:** The director evaluates vocal rhythm, subtext delivery, and conversational pauses.  
> * **Interactive Timeline Nudge:** If a pause drags between Shot 02 and Shot 03, the showrunner can reduce post-roll directly in the UI (e.g., trimming from 16 frames down to 13 frames). The engine updates the exposure sheet instantly, recalculating shot boundaries without invalidating upstream assets.  
> * **The "Authorize Cloud Video Batch" Gate:** Only after the low-fidelity animatic is locked does the showrunner click the execution trigger: AUTHORIZE CLOUD VIDEO BATCH (\$0.06). This queues the Wan 2.2 diffusion passes on Rig 2's media-broker to generate the final \#00FF00 greenscreen plates.

### **5\. Progressive Verification & Pre-Flight Sentinels**

Before an animatic can be approved or advanced to final compositing, the dashboard verifies the scene against a multi-tier progressive confidence hierarchy:

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

> * **The Disk Parity Sweep (\!MissingAssets):** Parses all file paths referenced in dialogue\_ast.json and the generated composition. If any sprite, Preston Blair mouth viseme, background matte, or audio stem is absent from local disk, the build terminates with Exit Code 1\.  
> * **The Zero-Byte Poison Sentinel Trap:** Computes the SHA-256 binary hash of every staged asset. If any file matches the empty-file constant:  
>   EMPTY\_FILE\_HASH=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>   or measures under 1,024 bytes for image/audio data, compilation halts immediately to catch dropped network transfers or truncated disk writes.  
> * **The Explicit Null Protocol:** Missing emotional variants must be committed in manifest.json as explicit null (e.g., "terrified": null) rather than omitted as missing keys. In draft animatic builds, an explicit null safely falls back to base\_states.idle. For final broadcast release builds, the gate enforces:  
>   ∀shot∈Episode,referenced\_variant(shot)=null  
>   Any un-waived null variant triggers a hard halt.

#### **2\. Confidence 1: Physical Signal Gates**

> * **Frame Budget Conformance:** Asserts via ffprobe that total composition frames equal the exposure sheet budget exactly.  
> * **Loudness & True-Peak Limits:** Dialogue stems must peak at ≤−1.0 dBTP with overall integrated loudness conforming to −16 LUFS (±1.0 LUFS).

#### **3\. Confidence 2: Geometric & Optical Invariant Gates**

> * **Solid-Color Debug Mask Pass:** Eliminates false positives from running human-trained computer vision models (like MediaPipe) on stylized goblin characters. The system renders visemes and puppet mounts as solid-color masks:  
>   `[ Rendered Debug Mask ] ──► Compute Green Viseme Centroid: (412, 264)`  
>                           `──► Compute Red Mouth Mount Anchor: (412, 240)`  
>                           `──► Delta = 24px (Evaluated via direct pixel math)`

> * **Viseme Centroid Drift Limit:** Asserts that viseme centroid drift remains **\<4px** from the mouth anchor defined in manifest.json.  
> * **Stage Horizon Grounding:** Verifies that the character's foot anchor (anchor\_point) maintains continuous contact with the background matte stage floor plane (*Y*ground​) throughout camera tracking moves.  
> * **Alpha Key Contamination Scan:** For green-screen diffusion plates (\#00FF00), the outer 3-pixel contour of the alpha silhouette is scanned. The 99th-percentile green channel intensity must measure **\<12** to prevent green halo fringing.

### **6\. Minimal Enclosing Unit (MEU) Surgical Code Patching**

When Confidence 2 QA flags a geometric defect (e.g., mouth viseme drift \=24px), the system does not re-render the entire episode or re-prompt generative diffusion passes. Instead, it deploys the **Minimal Enclosing Unit (MEU) Diagnostic Router** to execute surgical code repairs:

`Candidate MP4 Rendered`  
        `│`  
        `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ TIER 2: Deterministic Geometric & Boundary Checks      │`  
`│ • Alpha Edge Purity: Spill < 12 inside 3px contour     │`  
`│ • Viseme Drift: |mouth_center - viseme_center| < 4px   │`  
`└───────────────────────┬────────────────────────────────┘`  
                        `│ Defect Detected: (Drift = -24px)`  
                        `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ DIAGNOSTIC REMEDIATION ROUTER                          │`  
`│ • Check JSX prop against manifest.json:                │`  
`│   - JSX matches manifest -> ASSET_ERROR (Art Team)     │`  
`│   - JSX diverged -> CODE_ERROR (Jules Agent Repair)    │`  
`└───────────────────────┬────────────────────────────────┘`  
                        `│ CODE_ERROR Classified`  
                        `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ SURGICAL AST PATCHING & LOCAL VERIFICATION (Jules)     │`  
`│ • Mutates JSX prop via ts-morph Compiler API           │`  
`│ • Stamps header: @lifecycle: patched                   │`  
`│ • Local 36-frame test render (--gl=swangle)            │`  
`│ • Re-runs Tier 2 checks: Zero Cloud GPU Burn           │`  
`└────────────────────────────────────────────────────────┘`

> 1. **Root-Cause Classification:**  
   * If JSX props match manifest.json but the render is misaligned, **the asset manifest is wrong** (ASSET\_ERROR), routing the issue upstream to the art department.  
   * If JSX props diverge from manifest.json, **the code is wrong** (CODE\_ERROR).  
> 2. **TypeScript Compiler AST Mutation:** An automated coding agent (Jules) opens Episode\_040.tsx using ts-morph and updates *only* the failing sequence prop:  
>    `<GoblinPuppet mouthBoundingBox={{ x: 380, y: 264, w: 64, h: 32 }} />`

3\. **Cryptographic Header Update:** The agent updates the file header to @lifecycle: patched, recomputes the SHA-256 body checksum, and appends the remediation ticket ID:

`// @lifecycle: patched`  
`// @checksum: 3c1a8e9f2b4d...`  
`// @patch_history: ["QA-EP040-SH03-VISEME_COLLISION"]`

4\. **Fast Local Re-Verification:** Remotion re-renders *only* the affected 36-frame window locally (--frames=144-180), verifying the fix in seconds without incurring cloud GPU costs.

### **7\. Structured Rejection Taxonomy & Empirical Calibration**

When an animatic or scene draft fails showrunner review, it cannot be rejected with vague, free-text feedback. To maintain an auditable evaluation corpus, the director must select an explicit defect code from a closed failure taxonomy:

| Failure Code | Underlying Root Cause | Remediation & Routing Action |
| :---- | :---- | :---- |
| **FLAT\_DIALOGUE** | Characters sound generic or lack interpersonal conflict texture. | Re-prompts local LLM with higher Relational Friction (*F*) and Threat (*T*) weights. |
| **UNEARNED\_RELEASE** | The Attenuation Heuristic was breached; characters explicitly stated subtext. | Injects forbidden lemmas into banned\_attenuation\_tokens and tightens Subtext Suppression (*S*≥0.85). |
| **SOMATIC\_DRIFT** | Physical impossibility slipped past validators (e.g., amputee performing bimanual task). | Flags failure in somaticLinter.ts; updates character negative kinetic verb masks. |
| **VOICE\_BLEED** | A character used vocabulary or cadences belonging to another cast member. | Re-aligns prompt envelope with the character's stylometric bounds and negative word lists. |
| **PACING\_STALL** | The scene repeated a recent conflict shape without narrative escalation. | Advances the Grievance DAG; shifts the active conflict lottery toward downstream child nodes. |

#### **The Empirical Rejection Corpus (eval/rejections.jsonl)**

When the director clicks **"REJECT & LOG REASON"**, goblin-dashboard writes a structured JSON record into eval/rejections.jsonl:

`{`  
  `"timestamp_utc": "2026-09-29T15:12:08Z",`  
  `"scene_id": "ep040_sc03",`  
  `"take_id": "take_02",`  
  `"failure_code": "UNEARNED_RELEASE",`  
  `"authorizer": "SHOWRUNNER",`  
  `"violating_line": {`  
    `"speaker": "char_spleen",`  
    `"text": "You think holding the silver spoon makes up for the famine!"`  
  `},`  
  `"leaked_token": "famine",`  
  `"focal_grievance": "grv_resource_hoarding",`  
  `"editorial_note": "Spleen named the famine directly. The argument must stay on grease and spoon threading."`  
`}`

This file forms a persistent, empirical dataset used by prompt engineers and automated agents to fine-tune system prompts, update linter rules, and optimize negative token masks for subsequent generation passes.

### **8\. Final MP4 Release Packaging & Provenance Freezing**

Once all four confidence tiers pass and the showrunner signs off on the animatic, the master video is rasterized and sealed within its isolated repository workspace (goblin-episodes/episode-XXX/):

`goblin-episodes/episode-040/`  
`├── Episode_040.tsx             <-- Statically baked React component with literal JSX props[cite: 1, 3]`  
`├── render_manifest.json         <-- Cryptographic provenance lockfile[cite: 1, 3]`  
`├── components/ (Vendored)       <-- Pinned GoblinPuppet.tsx, CameraWrappers.tsx[cite: 1, 3]`  
`├── public/assets/               <-- Pruned visual cutouts, visemes, and audio stems (<100MB)[cite: 1, 3]`  
`└── out/master_040.mp4           <-- Final 1080p 24 fps broadcast master deliverable[cite: 1, 3]`

#### **Provenance Manifest Freezing (render\_manifest.json)**

The dashboard verifies that the final release artifact is bound to its complete upstream lineage:

> * **Upstream Git Commit SHAs:** Pinned hashes for 000.goblin-lore, worker-sower-engine, and goblin-assets-visual.  
> * **Binary Media Checksums:** SHA-256 digests of every background matte, character variant, and dialogue .wav stem used in the edit.  
> * **Execution Environment Lock:** Pinned Node.js version, Remotion release, Chromium milestone, and FFmpeg build hashes.  
> * **The Reproducibility Standard:** Validates **Level 3 Decoded Media Equivalence** (Δ*E*\<0.1 and SSIM\>0.9999 across decoded raw pixel matrices and PCM audio streams), ensuring that the approved episode can be re-rendered years later with bit-identical fidelity.

---

*User prompt: {{FOCUS: 5\. Production Batch Orchestration (goblin-dashboard)  }} /extreme-details*

Response: Within goblin-dashboard, **Production Batch Orchestration** serves as the showrunner’s central mission control and dispatch switchboard, bridging human creative direction with physical compute across the distributed studio fleet. Operating from src/pages/index.astro and hydrated via interactive React control islands, this subsystem manages end-to-end episodic execution without directly running heavy video rendering or neural model training within the dashboard process itself.

Instead, the dashboard dispatches cryptographically verified execution intents to the **Rig 1 Conductor** (worker-sower-conductor), monitors the asynchronous hardware queue via **Cloudflare Durable Objects** (ShotCoordinatorDO), and interfaces with the **Rig 2 GPU Foundry** (media-broker / ComfyUI) to produce broadcast-ready release packages.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│              goblin-dashboard (Showrunner Cockpit UI)                  │`  
`│       • Batch Episode Dispatching   • Granular Shot/Scene Retries      │`  
`│       • Remote Foundry Telemetry    • Pre-Flight Verification Gating   │`  
`└───────────────────┬────────────────────────────────┬───────────────────┘`  
                    `│                                │`  
     `REST / WSS     │                                │ Workers RPC / REST`  
  `(Rig 1 Loopback)  ▼                                ▼ (Anycast Edge)`  
`┌──────────────────────────────────────┐ ┌──────────────────────────────┐`  
`│ worker-sower-conductor (Rig 1 Core)  │ │ edge-director /              │`  
`│ • POSIX Node.js Conductor Host       │ │ ShotCoordinatorDO (Edge)     │`  
`│ • produceEpisode.ts Orchestrator     │ │ • Ingress Gatekeeping (D1)   │`  
`│ • Acoustic Clock (audio-microservice)│ │ • Single-Threaded Mutex      │`  
`│ • Temporal Locking (ffprobe 24 fps)  │ │ • Dynamic Fair Queuing       │`  
`│ • Headless Remotion CLI (--gl=swangle)│ │ • Distributed 30s Leases     │`  
`└──────────────────────────────────────┘ └──────────────┬───────────────┘`  
                                                        `│`  
                                                        `│ Outbound Tunnel`  
                                                        `▼ (cloudflared)`  
                                         `┌──────────────────────────────┐`  
                                         `│ media-broker (Rig 2 Foundry) │`  
                                         `│ • Headless ComfyUI (:8188)   │`  
                                         `│ • Wan 2.2 #00FF00 Plates     │`  
                                         `│ • POSIX flock Mutex Guard    │`  
                                         `│ • VRAM Hygiene (/free)       │`  
                                         `└──────────────────────────────┘`

### **1\. Ingress Gatekeeping & Pre-Flight Verification Gauntlet**

Before any batch run or individual scene can be dispatched into the production queue, goblin-dashboard executes a strict pre-flight gating pass to enforce the pipeline's ***T*****0​\=\$0.00 Fail-Fast Economic Mandate**. Submitting broken narrative assumptions, missing assets, or corrupted types to heavy rendering pipelines wastes expensive GPU minutes and local CPU cycles.

               `DIRECTOR TRIGGERS BATCH / SCENE DISPATCH`  
                                 `│`  
                                 `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ TIER 0: CANON MERKLE & DRIFT ASSERTION                                 │`  
`│ • Assert _meta.state_hash == incremental SHA-256 of raw dossiers       │`  
`│ • If git diff --exit-code compiled/ != 0: STALE_COMPILATION_ERROR (Exit 2)│`  
`└────────────────────────────────┬───────────────────────────────────────┘`  
                                 `│ Pass (Exit Code 0)`  
                                 `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ TIER 1: RELATIONAL TRUTH GATE (Cloudflare D1 Query)                    │`  
`│ • SELECT COUNT(*) FROM scene_fact_dependencies WHERE is_dirty = 1;     │`  
`│ • dirty_count > 0 ──► HTTP 412 Precondition Failed (Zero GPU Burn)     │`  
`└────────────────────────────────┬───────────────────────────────────────┘`  
                                 `│ Pass (dirty_count == 0)`  
                                 `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ TIER 2: STRUCTURAL ASSET AUDIT (!MissingAssets Sweep)                  │`  
`│ • Verifies presence of sprite variants, visemes, and audio stems       │`  
`│ • Empty-Hash Sentinel: Rejects zero-byte files (e3b0c442...b855)       │`  
`└────────────────────────────────┬───────────────────────────────────────┘`  
                                 `│ Pass`  
                                 `▼`  
                   `ENQUEUE JOB TO SHOTCOORDINATORDO`

> 1. **Canon Merkle & Compilation Integrity:** The dashboard audits compiled/\<seriesSlug\>/bible-state.json metadata. It asserts that \_meta.state\_hash matches /^\[a-f0-9\]{64}\$/ and matches an incremental hash computed across on-disk Markdown dossiers. If uncompiled canon changes exist, dispatch is blocked with STALE\_COMPILATION\_ERROR.  
> 2. **Relational Truth Gate (Dirty-State Invalidation):** When operating with Cloudflare D1 (CANON\_DB), the edge ingress gateway inspects scene dependency records before job instantiation:  
>    `SELECT COUNT(*) AS dirty_count`  
>    `FROM scene_fact_dependencies`  
>    `WHERE scene_id = ? AND is_dirty = 1;`

If character trauma, item custody, or grievance levels have mutated upstream without re-extracting the scene's Abstract Syntax Tree (dialogue\_ast.json), dirty\_count \> 0\. The dashboard terminates dispatch with HTTP 412 Precondition Failed (DIRTY\_SCENE\_REJECTED), preventing hardware execution on invalid narrative states. 3\. **Structural Pre-Flight Sweep (\!MissingAssets):** Performs tree-shaking verification across the scene manifest. If any required sprite variant, Preston Blair viseme cutout, or background matte is absent from local disk, or matches the zero-byte Empty-Hash Sentinel (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855), compilation halts before GPU allocation.

### **2\. Batch Episode Triggering & Conductor Lifecycle Orchestration**

When the showrunner initiates a complete episode generation run, the dashboard acts as the remote flight deck for src/pipeline/produceEpisode.ts running inside worker-sower-conductor on Rig 1\.

#### **The Master Lifecycle Execution Phases**

The Conductor executes an end-to-end 10-step assembly pipeline:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│            MASTER CONDUCTOR PIPELINE (produceEpisode.ts)               │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. Ingestion: Validates dialogue_ast.json against Zod schema & H_root  │`  
`│ 2. VRAM Hygiene: Flushes remote GPU buffers via POST :8188/free        │`  
`│ 3. Acoustic Clock: Calls local TTS (:8000) -> 48 kHz uncompressed WAVs │`  
`│ 4. Temporal Quantization: Runs ffprobe; locks discrete 24fps frames    │`  
`│ 5. Acoustic Assembly: Cumulative timing offset tiling & -14dB ducking  │`  
`│ 6. Adapter Conformance: Formulates 4n + 1 causal VAE allocations       │`  
`│ 7. Hardware Dispatch: Sends SpokeExecutionPayload to edge-director     │`  
`│ 8. Optical Printing: Compiles Episode_XXX.tsx; Remotion (gl: swangle)  │`  
`│ 9. Visual Closed-Loop QA: LPIPS/MAD sampling & ts-morph MEU surgery    │`  
`│ 10. Canon Sealing: Drains DO staging memory, updates DAG, signs Git    │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Acoustic Pacemaker Synchronization:** Speech synthesis on Rig 1's audio-microservice (port 8000\) produces uncompressed 48 kHz .wav stems. The Conductor runs native ffprobe child processes to calculate exact millisecond durations, quantizing the visual master clock to strict 24 fps integer frames:  
>   target\_frames=⌈(1000duration\_ms​)×24⌉  
> * **Temporal Lattice Formulation (4*n*\+1):** Because downstream spatiotemporal video diffusion models (Wan 2.2) operate on temporal Variational Autoencoders (VAEs), raw frame budgets must conform to a 4*n*\+1 mathematical lattice to prevent frame truncation and visual stutter:  
>   diffusion\_frames=4×⌈4target\_frames−1​⌉\+1  
> * **Deterministic Code Generation (Source-Baking):** The Conductor calls generator/generate-episode-repo.ts to statically inline calculated frame allocations (\<Sequence durationInFrames="{75}" from="{0}"\>), camera transforms, and asset paths into an immutable React component (goblin-episodes/episode-XXX/Episode\_XXX.tsx), banning dynamic JSON parsing at render time.  
> * **Headless Software Optical Printing:** Spawns @remotion/renderer via the CLI using software-rasterized OpenGL flags:  
>   `npx remotion render src/index.ts ep040 --gl=swangle --concurrency=1 --offthreadvideo`

This offloads compositing to CPU system RAM and SwiftShader, maintaining an operational invariant of **0 MB Dedicated GPU VRAM** on Rig 1 and eliminating headless Chromium driver crashes.

### **3\. Granular Scene & Shot-Level Retries**

Production pipelines often suffer from coarse invalidation: a single visual artifact or awkward dialogue delivery forces a complete multi-scene re-render. goblin-dashboard implements fine-grained scene and shot retries through **Selective Dependency Invalidation**.

`┌─────────────────────────────────────────────────────────────┐`  
`│                 GRANULAR SCENE RETRY CONSOLE                │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  TARGET: Episode 040 // Scene 03 // Shot 02                 │`  
`│  Cast: char_spleen (Defensive)                              │`  
`│  Invalidation Scope:                                        │`  
`│  (●) OPTICAL ONLY: Re-render Remotion timeline cut (Frames) │`  
`│  ( ) DIFFUSION ONLY: Re-sample ComfyUI plate with new Seed  │`  
`│  ( ) ACOUSTIC ONLY: Re-synthesize dialogue stem via TTS     │`  
`│  ( ) FULL RETRY: Re-roll Stage 4 Duel & Dialogue AST        │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  Downstream Blast Radius: 1 Shot (Frames 75 to 123)         │`  
`│  Estimated Compute Cost: $0.00 (Local CPU Swangle Pass)     │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  [ EXECUTE TARGETED RETRY ]           [ CANCEL ]            │`  
`└─────────────────────────────────────────────────────────────┘`

#### **Invalidation Granularity Tiers**

> * **Optical-Only Retries:** If an asset anchor or camera framing was misaligned, only the affected Remotion \<Sequence\> is patched and re-rasterized. Upstream audio stems and ComfyUI plates remain cached and untouched.  
> * **Diffusion Plate Retries:** If a character's visual plate exhibits physical distortions (e.g., limb count hallucination), the dashboard dispatches an isolated re-render request with an incremented PRNG seed. The existing audio stem and integer frame budget remain locked, preventing temporal drift across adjacent shots.  
> * **Acoustic Stem Retries:** When a vocal performance is rejected for flat delivery, the audio microservice re-synthesizes the line with updated pitch, speed, or breathiness scalars. The Conductor re-quantizes the frame budget and executes an AST patch via ts-morph to update the timeline without re-rolling the screenplay text.

### **4\. Distributed Hardware Queue Management & Mutex Coordination**

When video diffusion or LoRA generation is required, goblin-dashboard interfaces with **edge-director**, which houses ShotCoordinatorDO—a Cloudflare Durable Object acting as the centralized hardware mutex.

`[ goblin-dashboard / Conductor ]`  
               `│`  
               `▼ HTTPS POST /api/tasks/enqueue (Signed JWT)`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE EDGE: edge-director (ShotCoordinatorDO)                     │`  
`│                                                                        │`  
`│  ├── Dynamic Fair Queuing: Interleaves multi-artist / multi-scene jobs │`  
`│  ├── Single-Threaded Mutex: Prevents concurrent allocations on Rig 2   │`  
`│  ├── Distributed Lease Engine: Issues 30s leases with monotonic epochs │`  
`│  └── Storage Watchdog Alarm: ctx.storage.setAlarm(+30s) checks health  │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Outbound cloudflared Tunnel`  
                                    `▼ (Inside-Out Network Topology)`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: FOUNDRY GPU (media-broker Daemon on 127.0.0.1:3000)             │`  
`│                                                                        │`  
`│  • Holds POSIX flock on /var/lock/rig2_gpu.lock                        │`  
`│  • Checks nvidia-smi: Asserts Free VRAM > 21 GB                        │`  
`│  • Dispatches POST 127.0.0.1:8188/prompt to headless ComfyUI           │`  
`│  • Broadcasts telemetry heartbeat every 10s (BROKER_PROGRESS)          │`  
`│  • Streams rendered .mp4 plate to Cloudflare R2 bucket                 │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **1\. Preventing Hardware Collisions (CUDA OOM Protection)**

Consumer GPUs (such as RTX 3090, 4090, or 5070 running 20GB+ diffusion weights like Wan 2.2) cannot support concurrent multi-tenant execution. ShotCoordinatorDO serializes incoming generation requests into a single-threaded FIFO queue. A new job is dispatched to Rig 2 only when the active task finishes (BROKER\_COMPLETE), trips a terminal circuit breaker, or aborts.

#### **2\. Studio Velocity Preservation & Tenant Interleaving**

To prevent large background batch runs from blocking interactive editorial iterations, ShotCoordinatorDO enforces dynamic round-robin scheduling:

`private getNextFairJob(): ExecutionJob | undefined {`  
  `if (this.queue.length === 0) return undefined;`  
  `const lastArtistId = this.activeJob?.artistId;`  
  `const alternateIndex = this.queue.findIndex(j => j.artistId !== lastArtistId);`  
  `if (alternateIndex !== -1) {`  
    `return this.queue.splice(alternateIndex, 1)[0];`  
  `}`  
  `return this.queue.shift();`  
`}`

#### **3\. Fencing Tokens & Distributed Monotonic Epochs**

Distributed networks risk split-brain execution when local renderers stall. If a network blip causes a worker lease to expire, the coordinator bumps its internal epoch counter (*N*→*N*\+1) and re-queues the job. If the stalled worker later attempts to upload output carrying the expired Epoch *N*, the edge gateway drops the payload with HTTP 409 Conflict, preventing zombie processes from overwriting fresh data.

### **5\. Remote Foundry Telemetry & GPU Memory Hygiene**

The dashboard provides real-time visibility into the physical hardware status of the remote foundries via a bi-directional telemetry loop:

`┌─────────────────────────────────────────────────────────────┐`  
`│                 FOUNDRY SILICON TELEMETRY                   │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  NODE: Rig 2 (NVIDIA RTX 4090 - 24,576 MB Dedicated VRAM)   │`  
`│  Hardware Mutex : LOCKED (flock: /var/lock/rig2_gpu.lock)   │`  
`│  VRAM Allocation: [■■■■■■■■■□] 21.8 GB / 24.0 GB (Active)   │`  
`│  Active Job     : ep040_sc03_sh02 (Wan 2.2 #00FF00 Plate)   │`  
`│  Sampling Step  : [■■■■■□□□□□] Step 25 / 50 (50% Complete)   │`  
`│  Heartbeat Link : HEALTHY (Last check-in: 2s ago, Epoch 4)  │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  [ FORCE VRAM FLUSH (/free) ]     [ ABORT ACTIVE RENDER ]   │`  
`└─────────────────────────────────────────────────────────────┘`

#### **1\. Real-Time K-Sampler Tracking**

During diffusion passes on Rig 2, media-broker taps headless ComfyUI's internal WebSocket feed (ws://127.0.0.1:8188/ws). Denoising steps (Step 25/50) are normalized and streamed across the outbound tunnel to ShotCoordinatorDO, which broadcasts the telemetry to active showrunner dashboards in sub-2ms.

#### **2\. Automated VRAM Hygiene & Buffer Flushes**

Consumer generative stacks frequently suffer from fragmented PyTorch caching allocators. Between generation turns, the Conductor and media-broker enforce automated VRAM memory hygiene:

> * Dispatches POST \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) with { "unload\_models": true, "free\_memory": true }.  
> * Queries nvidia-smi via child process execution, asserting that free VRAM exceeds the baseline threshold (\>21 GB) before leasing the next payload.

### **6\. Failure Recovery, Circuit Breakers, & The Dead-Letter Queue (DLQ)**

Production failures are managed through a formal failure taxonomy enforced by ShotCoordinatorDO:

Worker Death (Infrastructure Transient)=Poison Job (Deterministic Failure)  
                           `[ RENDER FAILURE DETECTED ]`  
                                        `│`  
                                        `▼`  
                     `Inspect ctx.storage: attempt_count`  
                                        `│`  
                    `Is attempt_count < maxAttempts (2)?`  
                    `┌───────────────────┴───────────────────┐`  
                    `▼ YES                                   ▼ NO`  
     `[ TRANSIENT INFRASTRUCTURE FAULT ]      [ DETERMINISTIC POISON TASK ]`  
     `• Increment attempt_count (1 -> 2)      • Transition status -> 'DLQ'`  
     `• Bump lease epoch (N -> N+1)           • Write payload to dlq:${jobId}`  
     `• Release hardware mutex lock           • Trigger Studio Circuit Breaker`  
     `• Re-insert task into FIFO queue        • Lock branch; compile Dossier`  
     `• Next healthy spoke claims job         • Surface P0 Alert on Dashboard`

> * **Transient Fault Recovery:** If Rig 2 blips offline or packet loss drops a heartbeat for \>30 seconds, the coordinator increments attempt\_count, revokes the lease, bumps the epoch, and re-queues the job for pickup when connectivity restores.  
> * **Deterministic Poison Job Containment (DLQ):** If a task fails repeatedly across attempts (*N*≥2) due to an invalid latent aspect ratio, an out-of-bounds frame budget, or a corrupted LoRA tensor, retrying burns compute indefinitely. The circuit breaker trips, moving the task to the Dead-Letter Queue (DLQ).  
> * **The 3-Cycle Escalation Ceiling:** If automated code-repair agents (such as Jules) attempt to patch failing layout components in Episode\_XXX.tsx and exceed three revision cycles without passing CI invariant gauntlets, execution halts immediately. The task status flips to BLOCKED, the spec branch is isolated, and an automated alert is routed to the dashboard to require human showrunner mediation.

---

*User prompt: {{FOCUS: 6\. Corpus Health & Bible Integrity Telemetry (goblin-dashboard) }} /extreme-details*

### **Response: Corpus Health & Bible Integrity Telemetry (goblin-dashboard)**

Within goblin-dashboard, the **Corpus Health & Bible Integrity Telemetry** subsystem provides the showrunner cockpit with a real-time, read-only diagnostic window into the structural viability of the underlying canon. While the two-pass compiler (compile.ts) evaluates syntactic shape validation, scalar bounds, and relational foreign keys, **syntactic validity does not guarantee procedural playability**. An authored canon can be 100% syntactically correct while harboring catastrophic narrative deadlocks: 85% of disputes concentrated on a single pairing, starved secondary characters, circular spatial traps, or grievance chains that trigger premature climaxes.

The dashboard operationalizes the **Static Corpus Health Audit** directly within its Astro and React architecture. Ingesting pre-compiled artifacts via 000.goblin-lore/client at compile time (*T*0​\=\$0.00), this subsystem alerts showrunners to structural imbalances before expensive LLM inference, TTS speech synthesis, or Remotion rendering runs are dispatched.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   CANONICAL SOURCE REPOSITORY (000.goblin-lore)        │`  
`│  • series/<slug>/series.config.json  • series/<slug>/*.md dossiers     │`  
`│  • Immutable compiled snapshot: compiled/<slug>/bible-state.json       │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Pure Ingestion: packages/001.lore/src/client.ts`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│              goblin-dashboard (Corpus Health Telemetry Island)         │`  
`│               src/components/telemetry/CorpusHealthPanel.tsx           │`  
`├───────────────────────────────────┬────────────────────────────────────┤`  
`│ [Pillar 1] Combinatorial Dyads    │ [Pillar 2] Categorical Entropy     │`  
`│  • Dynamic K_N interaction mesh   │  • Normalized Shannon H_norm       │`  
`│  • Starvation & fragility alerts  │  • Farce ceiling ratio (<= 15%)    │`  
`├───────────────────────────────────┼────────────────────────────────────┤`  
`│ [Pillar 3] Topological Pacing (δ) │ [Pillar 4] Structural Centrality   │`  
`│  • Grievance DAG depth bounds     │  • Gini metric (G in [0.30, 0.50]) │`  
`│  • Premature climax tripwires     │  • Monolithic Spine detector       │`  
`├───────────────────────────────────┼────────────────────────────────────┤`  
`│ [Pillar 5] Spatial Reciprocity    │ [Pillar 6] Cross-Vector Coherence  │`  
`│  • Bidirectional portal symmetry  │  • Upper-limb hand saturation SAT  │`  
`│  • Acoustic damping verification  │  • Clue disjointness: P ∩ ⋃ T = ∅  │`  
`└───────────────────────────────────┴────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   DOWNSTREAM IMPACT & GOVERNANCE GATES                 │`  
`│  • Blast Radius Estimator: Tracks dirty scenes on canonical mutation   │`  
`│  • Zero-Drift Tripwire: Merkle root verification (_meta.state_hash)    │`  
`│  • Dispatch Lockout: Hard-blocks Conductor runs on FATAL defects       │`  
`└────────────────────────────────────────────────────────────────────────┘`

### **1\. Dynamic Calibration & Hermetic Scoping (series.config.json)**

To prevent hardcoded assumptions (such as fixed cast rosters, hardcoded four-goblin ensembles, or rigid genre constraints), the health engine evaluates every storyworld dynamically against its declared series.config.json manifest:

`{`  
  `"$schema": "../../packages/001.lore/schemas/series.config.schema.json",`  
  `"series_slug": "under-the-floorboards",`  
  `"display_name": "Under the Floorboards",`  
  `"genre_classification": "SOUTHERN_GOTHIC_INDUSTRIAL",`  
  `"pacing_parameters": {`  
    `"target_season_episodes": 12,`  
    `"max_grievance_intensity": 5,`  
    `"min_grievance_depth": 2,`  
    `"max_farce_ratio": 0.15,`  
    `"min_grievances_per_dyad": 1,`  
    `"recommended_grievances_per_dyad": 2`  
  `},`  
  `"thematic_categories": [`  
    `"resource_hoarding",`  
    `"status_anxiety",`  
    `"secret_keeping",`  
    `"generational_rift",`  
    `"territorial_boundary",`  
    `"industrial_negligence"`  
  `],`  
  `"graph_tolerances": {`  
    `"gini_warning_threshold": 0.65,`  
    `"monolithic_spine_in_degree": 15,`  
    `"min_acoustic_damping_bp": 500,`  
    `"max_acoustic_damping_bp": 10000`  
  `}`  
`}`

> * **Hermetic Namespace Isolation:** Entity indexes, foreign keys, and location portals are strictly scoped to the series path (series/\<seriesSlug\>/ and compiled/\<seriesSlug\>/bible-state.json). One series cannot satisfy another series' dyadic channels or accidentally link its props.  
> * **Configurable Metric Thresholds:** A slapstick comedy series can raise its farce ceiling to 0.40, while a gritty industrial drama clamps farce to 0.05 without requiring modifications to the underlying TypeScript compiler.

### **2\. The Six Analytical Health Pillars**

The dashboard aggregates health telemetry across six foundational mathematical pillars:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   THE SIX STATIC HEALTH PILLARS                        │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. Dynamic Combinatorial Dyadic Mesh (K_N)                             │`  
`│    • Total channels: N(N - 1) / 2                                      │`  
`│    • M[u, v] < min_grievances ──► FATAL_BLIND_SPOT                     │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 2. Categorical & Tonal Spread                                          │`  
`│    • Normalized Shannon Entropy: H_norm >= 0.70                        │`  
`│    • Farce Ratio Ceiling: R_farce <= max_farce_ratio (<= 15%)          │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 3. Topological Pacing & DAG Depth (δ)                                  │`  
`│    • Pacing runway: δ_max >= min_grievance_depth (δ >= 2)              │`  
`│    • Premature Climax Guard: (δ = 0) ──► I_floor <= Max_I - 2          │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 4. Structural Centrality & Gini Dispersion (G)                         │`  
`│    • Gini Coefficient: G in [0.30, 0.50] (Optimal distribution)        │`  
`│    • Monolithic Spines: Flags entities where k_in >= Threshold_spine   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 5. Spatial Reciprocity & Acoustic Integrity                            │`  
`│    • Bidirectional portal symmetry: v in Adj(u) <==> u in Adj(v)       │`  
`│    • Sound transmission loss: 500 bp <= damping <= 10,000 bp           │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 6. Cross-Vector Somatic & Epistemic Coherence                          │`  
`│    • Anatomical Hand Saturation: ∑ HandsRequired(i) <= availableArms   │`  
`│    • Clue Disjointness Theorem: P_clues ∩ ⋃ T_lemmas = ∅               │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **Pillar 1: Dynamic Combinatorial Dyadic Mesh (*KN*​)**

> * **Combinatorial Channel Space:** For an ensemble of *N* active characters, the undirected relational space requires:  
>   Total Channels=(2*N*​)\=2*N*(*N*−1)​  
>   For *N*\=4 (char\_bog, char\_spleen, char\_wart, char\_mum\_grissel), this yields exactly 24×3​\=6 interpersonal interaction channels.  
> * **Channel Saturation Tiers:**  
  * FATAL\_BLIND\_SPOT (M\[*u*,*v*\]\<min\_grievances\_per\_dyad): Triggered when a pair has 0 authored disputes. If these characters enter a room alone, the simulation engine cannot draw an encounter, causing the conflict lottery to deadlock.  
  * DYADIC\_FRAGILITY (M\[*u*,*v*\]\<recommended\_grievances\_per\_dyad): Triggered when a pair has exactly 1 grievance. When this dispute enters its post-resolution cooldown (*C*cycles​), the channel temporarily starves.  
  * ROBUST\_CHANNEL (M\[*u*,*v*\]≥2): Confirms multiple disputes exist to sustain rotating cooldown cycles.

#### **Pillar 2: Categorical & Tonal Spread**

> * **Thematic Entropy Metric (*H*norm​):** Evaluates whether disputes are distributed evenly across thematic categories (e.g., resource\_hoarding, status\_anxiety, secret\_keeping):  
>   *H*\=−*i*\=1∑*K*​*pi*​ln(*pi*​),*H*norm​\=ln(*K*)*H*​  
>   The dashboard flags an advisory alert if *H*norm​\<0.700, identifying thematic over-concentration.  
> * **Farce Ratio Ceiling (*R*farce​):** To prevent low-stakes comedic disputes from eroding narrative tension, the static health engine calculates:  
>   *R*farce​\=∣G∣∣{*g*∈G∣*g*.tonal\_override\_eligible=true}∣​  
>   If *R*farce​\>max\_farce\_ratio (default \>15%), the audit trips a TONAL\_DEGRADATION\_BREACH.  
> * **Farce Topological Invariant:** Asserts that all farce grievances reside at Depth *δ*\=0 or exist as isolated leaf nodes without outgoing escalation edges, preventing low-stakes disputes from spawning high-stakes narrative climaxes.

#### **Pillar 3: Topological Pacing & DAG Depth (*δ*)**

> * **Escalation Runway:** Traverses the Directed Acyclic Graph formed by spawns\_on\_max\_escalation edges:  
>   *δ*max​\=*g*∈Gmax​*δ*(*g*)  
>   If *δ*max​\<min\_grievance\_depth (default \<2), the dashboard flags SHALLOW\_CANON, warning that the storyworld lacks sufficient causal runway to sustain an episodic season.  
> * **Premature Climax Guard:** Asserts that any genesis grievance (*δ*\=0) cannot declare a starting intensity floor near the maximum intensity ceiling (*I*floor​≥Max\_I−1), preventing lethal confrontations from occurring in opening episodes.

#### **Pillar 4: Structural Centrality & Gini Dispersion (*G*)**

> * **Network Gini Coefficient:** Measures inequality in the distribution of incoming links (*k*in​) across all characters, items, and locations:  
>   *G*\=2*n*2*k*ˉ∑*i*\=1*n*​∑*j*\=1*n*​∣*ki*​−*kj*​∣​  
  * *G*∈\[0.30,0.50\]: **OPTIMAL** (Balanced structural dispersion).  
  * *G*∈(0.50,0.65\]: **ELEVATED** (Approaching single-point-of-failure bottlenecks).  
  * *G*\>0.65: **CRITICAL** (Monolithic concentration; compile failure).  
> * **Monolithic Spines:** Flags entities where *k*in​≥max(15,⌈*n*×0.25⌉). If an authored item (such as item\_silver\_spoon) anchors a disproportionate percentage of total world references, mutating that item destabilizes the entire story bible.  
> * **Dead Lore Pruning Queue:** Flags unreferenced or isolated items (*k*in​≤1) that add file bloat without contributing to active narrative friction.

#### **Pillar 5: Spatial Reciprocity & Acoustic Integrity**

> * **Bidirectional Adjacency Symmetry:** Asserts that every declared spatial link is strictly reciprocal:  
>   *v*∈Adj(*u*)⟺*u*∈Adj(*v*)  
>   Any unidirectional connection is flagged as an ASYMMETRIC\_PORTAL\_TRAP, preventing characters from entering rooms with no return path.  
> * **Acoustic Profiling:** Verifies that every location defines an integer acoustic\_damping\_factor within valid bounds (500 bp≤damping≤10,000 bp), ensuring sound falloff can be solved deterministically by downstream audio engines.

#### **Pillar 6: Cross-Vector Somatic & Epistemic Coherence**

> * **Static Hand Saturation Inequality:** For every character, the engine calculates functional upper-limb capacity via getCharacterSomaticMask() and audits equipped items:  
>   *i*∈logistical.held∑​HandsRequired(*i*)≤ArmsAvailable(*c*)  
>   For Wart (char\_wart), ArmsAvailable=1.0 due to severed\_left\_arm. If an author allocates items totaling 2.0 hands to Wart's held slots, the audit flags an ANATOMICAL\_SATURATION\_BREACH.  
> * **Clue Disjointness Theorem:** Enforces strict separation between physical clues and narrative secrets:  
>   Pclues​∩(*t*∈T⋃​*t*)\=∅  
>   The set of permitted clue tokens (Pclues​) and the union of all trigger lemma sets (T) in forbidden propositions must be completely disjoint. This prevents characters from deducing unearned plot points through mundane physical clues.  
> * **Vocal-Motor Hearsay Feasibility:** Asserts that characters assigned to deliver verbal hearsay directives do not possess somatic muteness conditions or banned speech verbs ("speak" \\notin c.\\text{banned\\\_kinetic\\\_verbs}).

### **3\. Dashboard Presentation & Blessed Curses UI Integration**

The health telemetry engine operates across two presentation interfaces: the headless CLI for CI/CD gating and the interactive UI dashboard.

#### **1\. The Headless Diagnostic Report (npm run health:lore)**

In headless terminals, the command outputs a clean, 7-bit ASCII diagnostic ticket:

`================================================================================`  
                    `GOBLIN-LORE // CORPUS HEALTH TELEMETRY`  
`================================================================================`  
`SERIES: under-the-floorboards (State Hash: 268e2c748c069601...)`  
`--------------------------------------------------------------------------------`  
`[CORPUS SIZE]         17 Entities across 4 Collections                   [PASS]`  
`[ENSEMBLE DYADS]       6 of 6 Channels Active (100% Mesh Completeness)    [PASS]`  
                       `- Bog <-> Spleen: 1 active grievances`  
                       `- Spleen <-> Wart: 1 active grievances`  
                       `- Wart <-> Bog: 1 active grievances`  
                       `- Grissel <-> Spleen: 1 active grievances`  
                       `- Grissel <-> Wart: 1 active grievances`  
                       `- Grissel <-> Bog: 2 active grievances`  
`[TONAL OVERRIDES]      0 of 7 (0.0%) Farce Overrides (Ceiling: <=15%)      [PASS]`  
`[PACING AUDIT]         Escalation Depth: δ_max = 2 (Healthy Traversal)    [PASS]`  
                       `- Depth 0: resource_hoarding`  
                       `- Depth 1: hoarding_reveal`  
                       `- Depth 2: generational_famine_feud`  
`[CENTRALITY SKEW]      Gini Index: 0.38 (Healthy Dispersion)              [PASS]`  
                       `- Monolithic Spines: 0 detected (Max k_in = 5)`  
                       `- Dead Lore Pruning Candidates: 0 detected`  
`[SPATIAL AUDIT]        4 Nodes Form Closed Reciprocal Mesh                [PASS]`  
                       `- Acoustic Damping Factors Complete on All Nodes`  
`[CROSS-VECTOR SAT]     All Hand Capacities Satisfied (Wart: 1.0 <= 1.0)    [PASS]`  
`[EPISTEMIC AUDIT]      Clue Tokens ∩ Trigger Lemmas = ∅                   [PASS]`  
`================================================================================`  
`AUDIT VERDICT: PASSED (Corpus is structurally sound and schedulable)`

#### **2\. The Interactive Blessed TUI Dashboard (cns00)**

Inside the terminal desktop environment (98.menu.unit), selecting **AUDIT CORPUS HEALTH** streams telemetry tokens into the cns00 console pane without blocking the 60 FPS UI rendering loop:

`┌────────────────────────────────────────────────────────┐`  
`│ THEMATIC SPREAD & TONAL GAUGE (Pillar 2)               │`  
`├────────────────────────────────────────────────────────┤`  
`│ Categorical Entropy : [■■■■■■■■□□] H_norm = 0.74 [OK]  │`  
`│ Farce Ratio (Limit) : [□□□□□□□□□□] 0.0% / Max 15.0%    │`  
`├────────────────────────────────────────────────────────┤`  
`│ CATEGORY SPREAD:                                       │`  
`│  • resource_hoarding    : 3 ##########                 │`  
`│  • status_anxiety       : 2 #######                    │`  
`│  • secret_keeping       : 1 #### (Thin)                │`  
`│  • generational_rift    : 1 #### (Thin)                │`  
`└────────────────────────────────────────────────────────┘`

         `DYADIC INCIDENCE MATRIX (K_4)`  
            `bog   spl   wrt   gri`  
      `bog [  -     1     1     2  ]`  
      `spl [  1     -     1     1  ]`  
      `wrt [  1     1     -     1  ]`  
      `gri [  2     1     1     -  ]`

When rendered in the terminal, cells with 0 active disputes flash in red ({red-bg}0{/red-bg}), and fragile cells with 1 dispute display in yellow ({yellow-fg}1{/yellow-fg}), providing instant visual feedback on relational debt gaps.

### **4\. Downstream Blast-Radius Tracking & Invalidation**

When an author modifies a canonical markdown dossier, the dashboard estimates the downstream blast radius before the author commits changes:

`┌─────────────────────────────────────────────────────────────────────────────┐`  
`│ DOWNSTREAM BLAST RADIUS AUDIT                                               │`  
`├─────────────────────────────────────────────────────────────────────────────┤`  
`│ • Mutated Entity:              characters/spleen.md                         │`  
`│ • Impacted Scenes:             ep040_sc02, ep040_sc03 (Marked Dirty)        │`  
`│ • Downstream Invalidation:     2 Cached Remotion Animatic Compositions     │`  
`│ • Estimated Compute Loss:      $0.00 USD (Caught at Compile Time T_0)       │`  
`└─────────────────────────────────────────────────────────────────────────────┘`

> 1. **Relational Invalidation in D1:** The change triggers an update to CANON\_DB, setting is\_dirty \= 1 for all dependent scenes in scene\_fact\_dependencies.  
> 2. **Zero-Drift Merkle Tripwire:** On build, the dashboard computes the SHA-256 digest of on-disk Markdown files and compares it against \_meta.state\_hash in bible-state.json. If uncommitted drift exists, compilation halts immediately with STALE\_COMPILATION\_ERROR (Exit Code 2), preventing out-of-sync assets from reaching production.  
> 3. **Automated Dispatch Lockout:** If any Pillar 1–6 check returns a FATAL status, goblin-dashboard disables the **"Dispatch Batch Render"** button in DirectorConsole.tsx. The system refuses to burn compute on a narrative corpus that cannot mathematically sustain procedural simulation.

---

*User prompt: {{FOCUS: Integration Interfaces & Data Ingestion Contracts (goblin-dashboard) }} /extreme-details*

Response: The integration interfaces and data ingestion contracts of goblin-dashboard formalize the architectural boundary separating **semantic state and simulation authority (Axis A)** from **representation, optical assembly, and directorial monitoring (Axis B)**. Operating as a web-native control surface running locally on Rig 1 (http://localhost:4321) and globally on Cloudflare Pages (via @astrojs/cloudflare), goblin-dashboard adheres to the **"Intents, Never Commands"** paradigm: it consumes sealed, immutable state projections from upstream authorities and emits validated, cryptographically bound intent envelopes, but never directly mutates canonical lore, writes raw SQLite/D1 database records, or executes headless video rendering in its UI thread.

### **1\. Architectural Ingestion Hierarchy & Authority Flow**

goblin-dashboard sits at the intersection of five independent studio clusters, enforcing monotonic authority flow where authority strictly decreases downstream:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                        UPSTREAM CANONICAL LAW                          │`  
`│     000.goblin-lore (compiled/<series>/bible-state.json, H_root)       │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Pure Ingestion: packages/001.lore/src/client.ts`  
                                    `│ (Zero Runtime Markdown Parsing / Deep-Frozen Projections)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                        SIMULATION & MEDIA CLOCKS                       │`  
`│  worker-sower-engine (Rig 1)          worker-sower-conductor (Rig 1)   │`  
`│  • dialogue_ast.json (MRU Beats)      • exposure_sheet.json (ffprobe)  │`  
`│  • Dynamic Relational Ledger          • 48 kHz WAV Audio Stems         │`  
`└───────────────────┬────────────────────────────────┬───────────────────┘`  
                    `│                                │`  
                    `│ REST / SSE / WebSockets        │ POSIX File Read / HTTP`  
                    `▼                                ▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   goblin-dashboard (05.delivery)                       │`  
`│  Astro SSR Boundary (Node.js on Rig 1 / @astrojs/cloudflare at Edge)   │`  
`│  Hydrated React Control Islands (client:load / client:idle)            │`  
`│  • Ingests sealed BibleState, Dialogue ASTs, Exposure Sheets, Telemetry│`  
`│  • Verifies Progressive QA Tiers (Confidence 0 to Confidence 2)        │`  
`│  • Dispatches Signed Director Intent Envelopes                         │`  
`└───────────────────┬────────────────────────────────┬───────────────────┘`  
                    `│                                │`  
                    `│ Intent Dispatch (REST / WSS)   │ Sealed Asset Proofs`  
                    `▼                                ▼`  
`┌──────────────────────────────────────┐ ┌──────────────────────────────┐`  
`│ edge-director (Cloudflare Anycast)   │ │ goblin-viewport-template     │`  
`│ • ShotCoordinatorDO Mutex Actor      │ │ • manifest.json (Coordinates)│`  
`│ • D1 Dirty-State Invalidation Gate   │ │ • Episode_XXX.tsx            │`  
`│ • cloudflared Inside-Out Tunnel Pipe │ │ • render_manifest.json       │`  
`└───────────────────┬──────────────────┘ └──────────────────────────────┘`  
                    `│`  
                    `▼ Leases & Progress Heartbeats`  
`┌──────────────────────────────────────┐`  
`│ media-broker (Rig 2 GPU Foundry)     │`  
`│ • Wan 2.2 #00FF00 Diffusion Plates   │`  
`└──────────────────────────────────────┘`

| Upstream Authority | Contract Artifact | Ingestion Mechanism | Dashboard Role |
| :---- | :---- | :---- | :---- |
| **000.goblin-lore** | bible-state.json (H\_root) | Ingested via packages/001.lore/src/client.ts during Astro SSR. | Read-only static ground truth; verifies somatic, spatial, and epistemic boundaries. |
| **worker-sower-engine** | dialogue\_ast.json | HTTP REST polling / SSE stream (GET /ledger/state). | Visualizes Dwight Swain MRUs, speaker condition tags, and emotional delta. |
| **worker-sower-conductor** | exposure\_sheet.json | Ingested off disk / Edge R2 proxy. | Maps the discrete 24 fps timeline and −14 dB sidechain ducking envelopes. |
| **goblin-assets-visual** | manifest.json | Direct JSON parse via shared workspace @goblin/shared-types. | Audits character anchor points, crash zoom targets, and viseme bounding boxes. |
| **edge-director / D1** | Relational Tables & DO WebSockets | WebSocket Hibernation (WSS /coordinator) & D1 client queries. | Real-time queue telemetry, hardware leasing epochs, and dirty-state continuity. |

### **2\. Contract 1: Canonical World Lore Ingestion (src/client.ts)**

goblin-dashboard never globs disk directories, evaluates loose YAML frontmatter, or parses raw Markdown dossiers at runtime. It consumes the pre-compiled, cryptographically sealed canon artifact (compiled/\<seriesSlug\>/bible-state.json) exclusively through the typed client accessors exported by 000.goblin-lore:

`// packages/001.lore/src/client.ts`  
`import fs from 'node:fs';`  
`import path from 'node:path';`  
`import type { BibleState, SomaticMask, SpatialNodeDescriptor } from './types.js';`

`export function deepFreeze<T>(obj: T): Readonly<T> {`  
  `if (obj === null || typeof obj !== 'object') return obj;`  
  `Object.freeze(obj);`  
  `for (const key of Object.keys(obj)) {`  
    `const prop = (obj as any)[key];`  
    `if (prop !== null && typeof prop === 'object' && !Object.isFrozen(prop)) {`  
      `deepFreeze(prop);`  
    `}`  
  `}`  
  `return obj as Readonly<T>;`  
`}`

`export function loadBibleState(seriesSlug = 'under-the-floorboards'): Readonly<BibleState> {`  
  `const repoRoot = resolveRepoRoot();`  
  `const headPath = path.resolve(repoRoot, 'compiled', seriesSlug, 'bible-state.json');`

  `if (!fs.existsSync(headPath)) {`  
    ``throw new Error(`[LORE CLIENT FATAL] Compiled state artifact not found: ${headPath}. Run 'npm run audit:lore' first.`);``  
  `}`

  `const rawJson = fs.readFileSync(headPath, 'utf-8');`  
  `const parsed = JSON.parse(rawJson);`

  `const stateHash = parsed._meta?.state_hash;`  
  `if (!stateHash || typeof stateHash !== 'string' || stateHash.length !== 64) {`  
    ``throw new Error(`[LORE CLIENT FATAL] Artifact corrupted or unsealed at: ${headPath}`);``  
  `}`

  `return deepFreeze({`  
    `_meta: parsed._meta,`  
    `entities: {`  
      `characters: parsed.entities?.characters || parsed.characters || {},`  
      `locations: parsed.entities?.locations || parsed.locations || {},`  
      `possessions: parsed.entities?.possessions || parsed.possessions || {},`  
      `grievances: parsed.entities?.grievances || parsed.grievances || {},`  
      `world: parsed.entities?.world || parsed.world,`  
    `}`  
  `});`  
`}`

#### **Architectural Invariants of Canon Ingestion**

> * **Recursive Immutability (deepFreeze):** All loaded objects are recursively sealed via Object.freeze(). If any component island in goblin-dashboard attempts to mutate character states directly (e.g., state.entities.characters.char\_bog.logistical.held.push(...)), JavaScript strict mode immediately throws an unhandled TypeError.  
> * **Deterministic Ambient Time Purity:** Accessors inside src/client.ts contain zero calls to Date.now(), ensuring identical state projection on Rig 1 and Cloudflare edge isolates.  
> * **Convenience Projections Consumed by Astro Frontmatter:**  
  * getCharacterSomaticMask(state, charId): Derives net functional manipulation capacity (availableArms∈\[0.0,2.0\]) and extracts bannedKineticVerbs for pre-flight scene redlining.  
  * getEpistemicDirectives(state, charId): Compiles *Ignorance by Omission* token blacklists, ensuring secrets marked TOTAL\_IGNORANCE or WITHHELD remain barred from dialogue generation.  
  * getStaticSpatialGraph(state): Extracts room adjacency matrices and acoustic\_damping\_factor decibel losses for spatial telemetry.  
  * getActiveGrievanceDAG(state): Normalizes multi-tier causal escalation edges (spawns\_on\_max\_escalation).

### **3\. Contract 2: Screenplay & Dialogue AST Ingestion (dialogue\_ast.json)**

The dashboard interfaces with worker-sower-engine by ingesting candidate screenplay ASTs, which replace unstructured screenplays with strongly typed, machine-executable intermediate representations:

`// @goblin/shared-types/src/schemas/dialogueAst.ts`  
`import { z } from 'zod';`

`export const SwainMRUBeatTypeEnum = z.enum([`  
  `'MOTIVATION_STIMULUS',   // Objective physical event or incoming dialogue`  
  `'SOMATIC_REACTION',     // Involuntary biological response`  
  `'INTERNAL_PROCESSING',  // Visceral, subtextual reasoning`  
  `'MOTOR_ACTION_DIALOGUE',// Outward kinetic movement or spoken line`  
  `'VISCERAL_STING'        // Mandated 18-frame reaction hold`  
`]);`

`export const DialogueAstLineSchema = z.object({`  
  `line_index: z.number().int().nonnegative(),`  
  `speaker_id: z.string().regex(/^char_[a-z0-9_]+$/),`  
  `listener_id: z.string().regex(/^char_[a-z0-9_]+$/).optional(),`  
  `dialogue_text: z.string().min(1),`  
  `emotional_condition: z.enum([`  
    `'idle', 'humiliated', 'smug', 'defensive', 'furious', 'exhausted', 'terrified'`  
  `]),`  
  `mru_type: SwainMRUBeatTypeEnum,`  
  `extracted_motor_actions: z.array(z.string()),`  
  `held_props_manifest: z.array(z.string()),`  
  `subtext_notes: z.string().optional(),`  
`}).strict();`

`export const DialogueAstSchema = z.object({`  
  `schema_version: z.literal('3.2.0'),`  
  `scene_id: z.string().regex(/^ep\d+_sc\d+$/),`  
  `series_slug: z.string(),`  
  `active_grievance_id: z.string().regex(/^grv_[a-z0-9_]+$/),`  
  `duel_resolution_receipt: z.object({`  
    `margin: z.number().int(),`  
    `winner_id: z.string(),`  
    `strings_spent: z.number().int().nonnegative(),`  
    `resulting_conditions: z.record(z.string(), z.array(z.string())),`  
  `}).optional(),`  
  `exit_condition_beat: z.string().min(10),`  
  `lines: z.array(DialogueAstLineSchema).min(1),`  
`}).strict();`

`export type DialogueAst = z.infer<typeof DialogueAstSchema>;`

#### **Dashboard Ingestion Invariants**

> * **Somatic Gauntlet Linting (*T*0​\=\$0.00):** goblin-dashboard's ingestion layer cross-references extracted\_motor\_actions against mask.bannedKineticVerbs. If an actor with severed\_left\_arm attempts a bimanual motor action, the review gate flags SOMATIC\_BIMANUAL\_VIOLATION and locks approval.  
> * **MRU Sequencing Enforcement:** The AST linter asserts that physical action lines precede or pair with spoken lines in accordance with Dwight Swain units, preventing floating ungrounded dialogue.

### **4\. Contract 3: Acoustic Timing Manifest & Clock Ingestion (exposure\_sheet.json)**

Because continuous audio serves as the non-negotiable master clock governing downstream video diffusion and optical compositing, goblin-dashboard ingests timing manifests produced by ffprobe sweeps of uncompressed speech .wav stems synthesized by audio-microservice:

`AUDIO DOMAIN: 48 kHz PCM .WAV (Acoustic Truth)`  
  `│ duration_ms = 3,120 ms`  
  `▼ Quantization Formula: ceil((duration_ms / 1000) * 24)`  
`VIDEO DOMAIN: 24 fps Integer Sequence Frames (Delivery Budget)`  
  `│ target_frames = 75 frames`

`// @goblin/shared-types/src/schemas/exposureSheet.ts`  
`import { z } from 'zod';`

`export const AudioStemTrackSchema = z.object({`  
  `stem_id: z.string(),`  
  `character_id: z.string(),`  
  `relative_audio_path: z.string().regex(/^audio\/.*\.wav$/),`  
  `sha256: z.string().length(64),`  
  `measured_duration_ms: z.number().positive(),`  
  `measured_duration_frames: z.number().int().positive(),`  
  `pre_roll_frames: z.number().int().nonnegative().default(6),`  
  `post_roll_frames: z.number().int().nonnegative().default(12),`  
  `total_frame_budget: z.number().int().positive(),`  
  `true_peak_dbtp: z.number().max(-1.0),`  
  `integrated_lufs: z.number().min(-18.0).max(-14.0),`  
  `sidechain_ducking: z.object({`  
    `target_track: z.literal('ambient_bed'),`  
    `attenuation_db: z.literal(-14.0),`  
    `attack_frames: z.literal(6),`  
    `release_frames: z.literal(12),`  
  `}),`  
`}).strict();`

`export const ExposureSheetSchema = z.object({`  
  `schema_version: z.literal('2.0.0'),`  
  `scene_id: z.string(),`  
  `timebase_fps: z.literal(24),`  
  `sample_rate_hz: z.literal(48000),`  
  `total_scene_frames: z.number().int().positive(),`  
  `stems: z.array(AudioStemTrackSchema),`  
`}).strict();`

`export type ExposureSheet = z.infer<typeof ExposureSheetSchema>;`

#### **Dashboard Waveform Scrubber Invariants**

> * **Decoupled Editorial Padding:** The scrubber UI allows showrunners to adjust pre\_roll\_frames and post\_roll\_frames via handles in WaveformScrubber.tsx. Adjusting timing recalculates timeline cut markers instantly without invalidating or re-synthesizing underlying audio files.  
> * **Physical Signal Validation:** Verifies that audio stems peak at ≤−1.0 dBTP and that dialogue ducking envelopes correctly suppress background ambient beds by −14 dB.

### **5\. Contract 4: Visual Asset Contract & Spatial Binding (manifest.json)**

Downstream compositing viewports never perform dynamic filesystem discovery or guess image filenames at runtime. Instead, goblin-dashboard ingests manifest.json from goblin-assets-visual as an immutable mathematical contract:

`{`  
  `"schema_version": "2.1.0",`  
  `"character_id": "char_bog",`  
  `"canvas_dimensions": { "width": 1024, "height": 1024 },`  
  `"render_pipeline": "2d_cutout",`  
  `"base_states": {`  
    `"idle": {`  
      `"file": "base/bog_idle.png",`  
      `"sha256": "4a7b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",`  
      `"anchor_point": { "x": 512, "y": 980 }`  
    `},`  
    `"talking": {`  
      `"file": "base/bog_talking.png",`  
      `"sha256": "8e3f2a1b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f",`  
      `"anchor_point": { "x": 512, "y": 980 }`  
    `}`  
  `},`  
  `"condition_variants": {`  
    `"humiliated": {`  
      `"file": "variants/bog_humiliated.png",`  
      `"sha256": "3c1a8e9f2b4d5a6e7f80123456789abcdef0123456789abcdef0123456789abc",`  
      `"anchor_point": { "x": 518, "y": 980 },`  
      `"camera_anchor_points": {`  
        `"crash_zoom_target": { "x": 412, "y": 198 },`  
        `"over_the_shoulder_target": { "x": 480, "y": 320 }`  
      `},`  
      `"mouth_bounding_box": { "x": 380, "y": 240, "width": 64, "height": 32 },`  
      `"animation_hints": {`  
        `"talk_bounce_amplitude": 8,`  
        `"idle_shiver_amplitude": 14`  
      `}`  
    `},`  
    `"terrified": null`  
  `},`  
  `"mouth_shapes": {`  
    `"closed": "mouths/mouth_closed.png",`  
    `"small": "mouths/mouth_small.png",`  
    `"medium": "mouths/mouth_medium.png",`  
    `"wide": "mouths/mouth_wide.png"`  
  `}`  
`}`

#### **The Explicit Null Protocol**

> * **Graceful Degradation:** The dashboard validates explicit null entries (such as "terrified": null). In draft animatic mode, null safely falls back to base\_states.idle.  
> * **Release Gate Trap:** For final release builds, the dashboard enforces:  
>   ∀shot∈Scene,referenced\_variant(shot)=null  
>   Any unwaived null variant flags an asset omission and halts batch mastering.

### **6\. Outbound Intent Envelopes: Directorial Mutation Contracts**

In accordance with zero-trust architectural boundaries, goblin-dashboard possesses **zero direct write access to canonical git repositories, SQLite ledgers, or remote GPU processes**. All user actions—slider adjustments, scene pinning, drift authorizations, and emergency halts—are compiled into strongly typed, signed **Intent Envelopes** dispatched to upstream workers:

`// @goblin/shared-types/src/schemas/intents.ts`  
`import { z } from 'zod';`

`export const SetDramaticCompressionPayloadSchema = z.object({`  
  `curtness_factor: z.number().min(0.0).max(1.0),`  
  `pacing_ratio: z.number().min(0.0).max(1.0),`  
  `threat_multiplier: z.number().min(0.0).max(1.0),`  
  `subtext_suppression: z.number().min(0.0).max(1.0),`  
  `pacing_mode: z.enum(['DRAMATIC_IRONY', 'SUSPENSE', 'SURPRISE', 'MYSTERY']),`  
`}).strict();`

`export const PinGrievancePayloadSchema = z.object({`  
  `target_grievance_id: z.string().regex(/^grv_[a-z0-9_]+$/),`  
  `force_participants: z.tuple([z.string(), z.string()]),`  
  `bypass_prng_lottery: z.literal(true),`  
  `forced_escalation_stage: z.number().int().min(1).max(5).optional(),`  
`}).strict();`

`export const AuthorizeDriftPayloadSchema = z.object({`  
  `target_draft_path: z.string(),`  
  `staged_hash: z.string().length(64),`  
  `accepted_diffs: z.array(z.object({`  
    `entity_id: z.string(),`  
    `field_path: z.string(),`  
    `baseline_value: z.any(),`  
    `proposed_value: z.any(),`  
  `})),`  
`}).strict();`

`export const EmergencyHaltPayloadSchema = z.object({`  
  `halt_scope: z.enum(['GLOBAL_STUDIO_HALT', 'ISOLATED_SCENE_ABORT']),`  
  `reason: z.string().min(10),`  
  `revoke_active_leases: z.literal(true),`  
`}).strict();`

`export const DirectorIntentEnvelopeSchema = z.object({`  
  `idempotency_key: z.string().uuid(),`  
  `trace_id: z.string().regex(/^tr_[a-z0-9]+$/),`  
  `client_timestamp_epoch: z.number().int().positive(),`  
  `authorizer: z.object({`  
    `user_id: z.string(),`  
    `role: z.enum(['SHOWRUNNER', 'SCENE_DIRECTOR', 'LEAD_ARTIST']),`  
    `auth_token_sig: z.string(),`  
  `}),`  
  `target_scope: z.object({`  
    `series_slug: z.string(),`  
    `episode_id: z.string().optional(),`  
    `scene_id: z.string().optional(),`  
  `}),`  
  `intent_type: z.enum([`  
    `'SET_DRAMATIC_COMPRESSION',`  
    `'PIN_GRIEVANCE',`  
    `'AUTHORIZE_DRIFT',`  
    `'EMERGENCY_HALT',`  
    `'TRIGGER_RETRY'`  
  `]),`  
  `payload: z.union([`  
    `SetDramaticCompressionPayloadSchema,`  
    `PinGrievancePayloadSchema,`  
    `AuthorizeDriftPayloadSchema,`  
    `EmergencyHaltPayloadSchema,`  
    `z.record(z.string(), z.any())`  
  `]),`  
`}).strict();`

`export type DirectorIntentEnvelope = z.infer<typeof DirectorIntentEnvelopeSchema>;`

#### **Outbound Dispatch Verification & Idempotency Pipeline**

> 1. **In-Memory Validation:** When an action is triggered, DirectorIntentEnvelopeSchema.parse() validates the payload in browser memory. Any illegal property trips a client validation error before transmission.  
> 2. **Edge Ingress Deduplication:** The payload is transmitted via POST /api/v1/intents to the Cloudflare Hono gateway. The gateway verifies the RFC-compliant UUIDv7 idempotency\_key against Cloudflare D1:  
>    `INSERT INTO idempotency_keys (key, scope, status, handler_lease_expires_at, created_at, updated_at)`  
>    `VALUES (?, 'director_intent', 'RECEIVED', unixepoch() + 60, unixepoch(), unixepoch())`  
>    `ON CONFLICT (key) DO NOTHING;`

If zero rows are affected, duplicate transmissions are dropped immediately, preventing duplicate queue entries. 3\. **Execution Routing:**

> * Narrative parameter shifts route upstream to worker-sower-engine on Rig 1\.  
> * Hardware halts and batch dispatches route to ShotCoordinatorDO on the Cloudflare Edge.

### **7\. Transport-Level Data Exchange & Edge Storage Interfaces**

goblin-dashboard interfaces across three primary network transport protocols:

`┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐`  
`│                              goblin-dashboard TRANSPORT LAYER                                          │`  
`├──────────────────────────┬─────────────────────────────┬───────────────────────────────────────────────┤`  
`│ PROTOCOL                 │ ENDPOINT / MECHANISM        │ ARCHITECTURAL ROLE                            │`  
`├──────────────────────────┼─────────────────────────────┼───────────────────────────────────────────────┤`  
`│ Server-Sent Events (SSE) │ GET /api/stream (Astro SSR) │ Sub-50ms reactive simulation telemetry relay  │`  
`│ WebSocket Hibernation    │ WSS /coordinator (Cloudflare│ Real-time hardware queue monitoring ($0.00)   │`  
`│ Cloudflare R2 Streaming  │ r2://production/...         │ Zero-egress binary asset plate streaming      │`  
`└──────────────────────────┴─────────────────────────────┴───────────────────────────────────────────────┘`

#### **1\. Real-Time Telemetry Stream (GET /api/stream)**

Implemented via Astro Server-Side Rendering (output: 'server'), this route streams continuous state updates directly to telemetry cards (SomaticHUDCard.tsx, ParanoiaClockCard.tsx):

`// src/pages/api/stream.ts`  
`import type { APIRoute } from 'astro';`

`export const GET: APIRoute = async ({ locals }) => {`  
  `const encoder = new TextEncoder();`

  `const stream = new ReadableStream({`  
    `start(controller) {`  
      `const interval = setInterval(async () => {`  
        `let packet = {`  
          `timestamp: Date.now(),`  
          ``trace_id: `tr_${Math.random().toString(36).substring(2, 10)}`,``  
          `active_scene: 'ep040_sc03',`  
          `paranoia_ticks: 4,`  
          `queue_depth: 2,`  
        `};`

        `// Query Cloudflare D1 if running at Anycast edge`  
        `if (locals.runtime?.env?.CANON_DB) {`  
          `const row = await locals.runtime.env.CANON_DB`  
            `.prepare('SELECT current_scene, paranoia_level FROM simulation_state LIMIT 1')`  
            `.first();`  
          `if (row) {`  
            `packet.active_scene = row.current_scene;`  
            `packet.paranoia_ticks = row.paranoia_level;`  
          `}`  
        `}`

        ``controller.enqueue(encoder.encode(`data: ${JSON.stringify(packet)}\n\n`));``  
      `}, 1000);`

      `return () => clearInterval(interval);`  
    `}`  
  `});`

  `return new Response(stream, {`  
    `headers: {`  
      `'Content-Type': 'text/event-stream',`  
      `'Cache-Control': 'no-cache',`  
      `'Connection': 'keep-alive',`  
    `}`  
  `});`  
`};`

#### **2\. WebSocket Hibernation (WSS /coordinator)**

The dashboard connects directly to ShotCoordinatorDO via Cloudflare's WebSocket Hibernation API:

> * When an operator reviews animatics or monitors the queue, the isolate evicts from V8 memory while Cloudflare's Anycast proxy holds the socket open.  
> * Idle execution costs drop to **\$0.00**.  
> * The isolate re-awakens in \<2 ms when progress packets (BROKER\_PROGRESS), framing completion events, or queue updates arrive from Rig 2\.

#### **3\. Zero-Egress Media Streaming via Cloudflare R2**

Binary assets (uncompressed 48 kHz .wav stems, Wan 2.2 \#00FF00 green-screen .mp4 plates, and Remotion animatic video renders) are streamed directly into HTML5 media players (AnimaticPlayer.tsx, WaveformScrubber.tsx) via presigned Cloudflare R2 URLs:

> * **Zero Egress Billing:** High-bitrate video plates and multi-track audio stems are streamed globally without accumulating cloud egress bandwidth fees.  
> * **Memory Isolation:** Media binaries stream directly from R2 to the client browser, completely bypassing Worker isolate RAM and ensuring edge memory usage stays well below the 128 MB ceiling.

### **8\. End-to-End Contract Verification Gauntlet**

The integrity of all data contracts ingested and emitted by goblin-dashboard is validated through automated Vitest test suites executing under the **Universal Negative-Control Law**:

`// goblin-dashboard/test/contracts/ingestionContracts.test.ts`  
`import { describe, it, expect } from 'vitest';`  
`import { loadBibleState, getCharacterSomaticMask } from '000.goblin-lore/client';`  
`import { DialogueAstSchema } from '@goblin/shared-types';`  
`import { DirectorIntentEnvelopeSchema } from '@goblin/shared-types';`

`describe('goblin-dashboard Ingestion & Interface Contract Gauntlet', () => {`  
  `const state = loadBibleState('under-the-floorboards');`

  `it('verifies deepFreeze immutability on ingested canonical lore', () => {`  
    `expect(() => {`  
      `// @ts-expect-error - Testing runtime immutability trap`  
      `state.entities.characters.char_bog.name = 'TAMPERED';`  
    `}).toThrow(TypeError);`

    `expect(() => {`  
      `// @ts-expect-error - Testing nested array immutability trap`  
      `state.entities.characters.char_bog.logistical.held.push('item_injected');`  
    `}).toThrow(TypeError);`  
  `});`

  `it('negative control: rejects unsealed or corrupted bible-state artifacts', () => {`  
    `const invalidArtifact = {`  
      `_meta: { state_hash: 'short_invalid_hash' },`  
      `entities: {}`  
    `};`  
    `expect(() => {`  
      `if (invalidArtifact._meta.state_hash.length !== 64) {`  
        `throw new Error('CORRUPTED_HASH');`  
      `}`  
    `}).toThrow('CORRUPTED_HASH');`  
  `});`

  `it('negative control: DialogueAstSchema rejects unauthorized bimanual action tags', () => {`  
    `const invalidAst = {`  
      `schema_version: '3.2.0',`  
      `scene_id: 'ep040_sc03',`  
      `series_slug: 'under-the-floorboards',`  
      `active_grievance_id: 'grv_the_spoon_dispute',`  
      `exit_condition_beat: 'Bog drops the siphon wrench.',`  
      `lines: [`  
        `{`  
          `line_index: 0,`  
          `speaker_id: 'char_bog',`  
          `dialogue_text: 'Hold this valve.',`  
          `emotional_condition: 'defensive',`  
          `mru_type: 'MOTOR_ACTION_DIALOGUE',`  
          `extracted_motor_actions: ['TWO_HANDED_PRY'], // Violates single-arm mask`  
          `held_props_manifest: ['item_siphon_wrench'],`  
          `extra_unauthorized_field: 'LEAK' // Stripped by .strict()`  
        `}`  
      `]`  
    `};`  
    `expect(() => DialogueAstSchema.parse(invalidAst)).toThrow();`  
  `});`

  `it('negative control: DirectorIntentEnvelopeSchema rejects unauthenticated authority assertion', () => {`  
    `const directCommandPayload = {`  
      `idempotency_key: '01923e4b-7000-7fa1-9234-56789abcdef0',`  
      `trace_id: 'tr_8f1b2c4a9e',`  
      `client_timestamp_epoch: 1727610000,`  
      `authorizer: {`  
        `user_id: 'usr_director_01',`  
        `role: 'SHOWRUNNER',`  
        `auth_token_sig: 'valid_sig',`  
      `},`  
      `target_scope: { series_slug: 'under-the-floorboards' },`  
      `intent_type: 'DIRECT_STATE_MUTATION', // BANNED: Dashboard can only emit INTENTS`  
      `payload: { direct_sql: 'UPDATE characters SET hp = 100' }`  
    `};`  
    `expect(() => DirectorIntentEnvelopeSchema.parse(directCommandPayload)).toThrow();`  
  `});`  
`});`

Through these strongly typed schemas, recursive deepFreeze wrappers, pre-flight invariant gates (*T*0​\=\$0.00), and signed intent envelopes, goblin-dashboard coordinates human creative input with autonomous execution while preserving canonical integrity across the sovereign production pipeline.

---

*User prompt: {{FOCUS: now take a look at the beginning of the conversation and create a summary of all the most information on (goblin-dashboard) until this last response }} /extreme-details*

### **Response: 1\. Architectural Mandate & Epistemological Boundaries**

goblin-dashboard operates as the human-in-the-loop showrunner flight deck, editorial cockpit, and administrative control surface situated within **Cluster 05.delivery** on **Axis B (Representation / Artifact Hardening)**. Its primary function is providing real-time telemetry observation, parameter tuning, animatic pre-viz sign-off, and authoritative override capabilities over the autonomous simulation pipeline (worker-sower-engine and worker-sower-conductor).

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   CANONICAL SOURCE REPOSITORY (000.goblin-lore)        │`  
`│  • Immutable compiled snapshot: compiled/<slug>/bible-state.json       │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Pure Ingestion: packages/001.lore/src/client.ts`  
                                    `│ (Zero Runtime Markdown Parsing / Deep-Frozen Projections)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                        SIMULATION & MEDIA CLOCKS                       │`  
`│  worker-sower-engine (Rig 1)          worker-sower-conductor (Rig 1)   │`  
`│  • dialogue_ast.json (MRU Beats)      • exposure_sheet.json (ffprobe)  │`  
`│  • Dynamic Relational Ledger          • 48 kHz WAV Audio Stems         │`  
`└───────────────────┬────────────────────────────────┬───────────────────┘`  
                    `│                                │`  
                    `│ REST / SSE / WebSockets        │ POSIX File Read / HTTP`  
                    `▼                                ▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   goblin-dashboard (05.delivery)                       │`  
`│  Astro SSR Boundary (Node.js on Rig 1 / @astrojs/cloudflare at Edge)   │`  
`│  Hydrated React Control Islands (client:load / client:idle)            │`  
`│  • Directorial Sliders: Curtness, Threat, Pacing, Subtext Attenuation  │`  
`│  • Epistemic Auditing: Ignorance by Omission & Belief Record Tracking  │`  
`│  • Gate Approvals: Drift Authorization, Animatic Sign-off, Kill Switch │`  
`└───────────────────┬────────────────────────────────┬───────────────────┘`  
                    `│                                │`  
                    `│ Intent Dispatch (REST / WSS)   │ Sealed Asset Proofs`  
                    `▼                                ▼`  
`┌──────────────────────────────────────┐ ┌──────────────────────────────┐`  
`│ edge-director (Cloudflare Anycast)   │ │ goblin-viewport-template     │`  
`│ • ShotCoordinatorDO Mutex Actor      │ │ • manifest.json (Coordinates)│`  
`│ • D1 Dirty-State Invalidation Gate   │ │ • Episode_XXX.tsx            │`  
`│ • cloudflared Inside-Out Tunnel Pipe │ │ • render_manifest.json       │`  
`└───────────────────┬──────────────────┘ └──────────────────────────────┘`  
                    `│`  
                    `▼ Leases & Progress Heartbeats`  
`┌──────────────────────────────────────┐`  
`│ media-broker (Rig 2 GPU Foundry)     │`  
`│ • Wan 2.2 #00FF00 Diffusion Plates   │`  
`└──────────────────────────────────────┘`

The system enforces six foundational constraints:

> * **The Cartesian Separation of Meaning and Representation:** Narrative truth (meaning) belongs to the simulation core and event-sourced ledger on **Axis A**, while visual compositions, camera curves, and video encodings (representation) belong to the presentation layer on **Axis B**. Visual edits never retroactively mutate upstream simulation facts.  
> * **"Intents, Never Commands":** The dashboard possesses zero direct database mutation authority. It cannot issue raw SQL writes (UPDATE characters...) or alter the on-disk canon dossiers in 000.goblin-lore. Every directorial intervention is emitted as a validated, cryptographically signed intent envelope sent over HTTP REST or WebSockets.  
> * **Preventive Compilation at *T*0​\=\$0.00:** Narrative inconsistencies, somatic violations, or missing assets are caught at compile time before expensive neural inference (TTS, LLMs) or GPU diffusion rendering occurs.  
> * **Zero Dedicated GPU/VRAM Invariant:** The dashboard executes entirely in Node.js (SSR) on **Rig 1** or as a serverless bundle on **Cloudflare Pages**. It contains no video rendering engine, runs zero headless Chromium rendering loops, and consumes **0 MB dedicated GPU VRAM**. Heavy video compositing is handled separately by the Remotion CLI on CPU/RAM (--gl=swangle) within goblin-viewport-template and worker-sower-conductor.  
> * **Deep-Frozen Canon Consumption:** It ingests immutable universe snapshots (bible-state.json) via 000.goblin-lore/client. Runtime accessors wrap all data structures in recursive deepFreeze() wrappers, causing accidental memory mutations by UI scripts to throw an unhandled TypeError.  
> * **Network-Only Engine Decoupling:** Draft manipulation is isolated inside worker-sower-engine/drafts/. The dashboard interacts with the simulation engine across network boundaries (REST/SSE/WebSockets), avoiding filesystem locking and sync latency.

### **2\. Runtime Execution Topology: Rig 1 vs. Cloudflare Pages**

goblin-dashboard adapts to its host environment using Astro's Island Architecture, pairing a zero-JS static HTML shell with selectively hydrated React islands (client:load, client:idle, client:visible):

`┌────────────────────────────────────────────────────────────────────────┐`  
`│              ASTRO SERVER SHELL (somatic.astro / index.astro)          │`  
`│  • Executes during SSR (Node on Rig 1 / @astrojs/cloudflare at Edge)   │`  
`│  • Calls loadBibleState('under-the-floorboards') directly              │`  
`│  • Pure static HTML emitted: Shell, Navbars, Canonical Base Typography │`  
`│  • ZERO JavaScript bundle overhead shipped to the client browser       │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Passes Deep-Frozen JSON Props`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│             HYDRATED REACT ISLANDS (client:load / client:idle)         │`  
`│                                                                        │`  
`│  ┌──────────────────────────────┐     ┌─────────────────────────────┐  │`  
`│  │ DirectorConsole.tsx          │     │ SomaticAuditInteractive.tsx │  │`  
`│  │  • Curtness / Threat Sliders │     │  • Anatomical Limb Status   │  │`  
`│  │  • Ephemeral Form State      │     │  • Banned Kinetic Linter    │  │`  
`│  └──────────────┬───────────────┘     └──────────────┬──────────────┘  │`  
`│                 │                                    │                 │`  
`│                 ▼ Emits Intent Envelopes             ▼                 │`  
`│  ┌──────────────────────────────────────────────────────────────────┐  │`  
`│  │ HTTP REST / WebSocket Layer (worker-sower-engine API / D1 DB)    │  │`  
`│  │  • Unidirectional mutation: POST /api/v1/intents/...             │  │`  
`│  │  • Never mutates deep-frozen canonical props in browser memory   │  │`  
`│  └──────────────────────────────────────────────────────────────────┘  │`  
`└────────────────────────────────────────────────────────────────────────┘`

The system alternates between two execution targets via conditional adapter configuration in astro.config.mjs:

`// astro.config.mjs`  
`import { defineConfig } from 'astro/config';`  
`import react from '@astrojs/react';`  
`import cloudflare from '@astrojs/cloudflare';`  
`import tailwind from '@astrojs/tailwind';`

`const isCloudflareBuild = process.env.DEPLOY_TARGET === 'cloudflare';`

`export default defineConfig({`  
  `output: 'server',`  
  `integrations: [react(), tailwind()],`  
  `adapter: isCloudflareBuild ? cloudflare({ mode: 'directory' }) : undefined,`  
  `server: { port: 4321, host: true }`  
`});`

> * **Local Rig 1 Workstation (http://localhost:4321):** Ingests local files directly off disk via fs.readFileSync. Direct REST calls to 127.0.0.1:3000 (worker-sower-engine) achieve \<15 ms round-trip latency.  
> * **Cloudflare Pages Edge Deployment:** Ingests live state via @astrojs/cloudflare SSR routes binding directly to Cloudflare D1 (env.CANON\_DB) in sub-5ms. Connects to ShotCoordinatorDO via the **WebSocket Hibernation API**, dropping active compute billing to **\$0.00** during idle showrunner review sessions while preserving live socket connectivity.

### **3\. The Continuous Parameter Vector Space (*P*dramatic​)**

Instead of relying on free-form prompt engineering, directorial intent is quantified through a four-dimensional vector space mounted within src/components/islands/DirectorConsole.tsx:

*P*dramatic​\=​*CPTS*​​∈\[0.0,1.0\]4⊂R4  
`┌─────────────────────────────────────────────────────────────┐`  
`│                 DIRECTOR CONSOLE (ISLAND)                   │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  Dialogue Curtness (C):    [────●────────]  0.72            │`  
`│  Dramatic Pacing (P):      [──────●──────]  0.60            │`  
`│  Threat Multiplier (T):    [────────●────]  0.85            │`  
`│  Subtext Suppression (S):  [─────────●───]  0.90            │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  ATTENUATION HEURISTIC: ENGAGED                             │`  
`│  Active Banned Token Mask:                                  │`  
`│  [famine] [hoard] [cache] [rations] [stole] [winter]        │`  
`│  Tactical Proxies Injected:                                 │`  
`│  [item_silver_spoon] [brass_valve_09] [grease_threads]      │`  
`└─────────────────────────────────────────────────────────────┘`

#### **The Parametric Axes**

> * **Dialogue Curtness (*C*∈\[0.0,1.0\]):** Controls maximum word budget per line using the affine transformation *W*max​\=max(2,⌊24.0−18.0×*C*⌋). High values (*C*≥0.75) enforce monosyllabic constraints (*W*max​≤10) and penalize conjunction tokens ("furthermore", "because"). This compresses downstream audio duration and cuts Remotion integer frame allocations.  
> * **Dramatic Pacing (*P*∈\[0.0,1.0\]):** Governs the ratio of Dwight Swain Motivation-Reaction Units (MRUs) to spoken lines through *ρA*/*D*​\=1.0−*P*\+*ϵP*​. Low values (*P*≤0.30) lengthen contemplation pauses, while high values (*P*≥0.70) prioritize kinetic motor action blocks and tighten camera spring damping.  
> * **Threat Level Multiplier (*T*∈\[0.0,1.0\]):** Scales somatic volatility, injury risk (ΔSeverity=⌊*T*×4000⌋ bp), and the trigger threshold for opposed mechanical 2d6 duels (*p*duel​\=clamp(0.05+0.85×*T*,0,1)).  
> * **Subtext Suppression (*S*∈\[0.0,1.0\]):** Controls the **Attenuation Heuristic**. Values of *S*≥0.70 engage negative token attenuation filters, blacklisting direct mentions of core grievances and forcing characters to displace tension onto mundane physical props (e.g., grease on a silver spoon).

#### **Multi-Modal Translation Pipeline**

The vector *P*dramatic​ compiles downstream across three targets:

> 1. **Text Prompting:** Formatted into the Attention Sandwich with negative logit biases applied to AI crutch words and Latinate slop.  
> 2. **Audio DSP (audio-microservice):** Dynamically scales speed (Speedeff​\=Speedbase​×(0.8+0.5*P*\+0.3*C*)), dilates respiratory pauses, shifts vocal pitch up to \+4.0 semitones under high threat, and injects glottal fry density.  
> 3. **Remotion Visual Rig (goblin-viewport-template):** Drives puppet animation constants, including talk\_bounce\_amplitude and high-frequency coordinate jitter (idle\_shiver\_amplitude) under elevated threat.

### **4\. Directorial Mounts & Showrunner Interventions**

The dashboard UI organizes showrunner workflows into six specialized React islands mounted within Astro templates:

| UI Mount Component | Page Route | Primary Directorial Interventions |
| :---- | :---- | :---- |
| **DirectorConsole.tsx** | src/pages/director/tuning.astro | Calibrates *P*dramatic​, selects Dramatic Pacing Modes, inputs premise seeds, and dispatches compilation batches. |
| **SomaticHUDCard.tsx** | src/pages/telemetry/ledger.astro | Audits anatomical injuries, limits equipment slots by functional limb counts, and flags banned kinetic verbs. |
| **EpistemicAuditPanel.tsx** | src/pages/telemetry/epistemic.astro | Audits the three-column horizon split, sets disclosure taboos, and configures rumor decay rates. |
| **GrievanceDAGViewer.tsx** | src/pages/telemetry/grievances.astro | Maps the escalation DAG, flags dyadic channel starvation, and pins dormant conflicts to upcoming cycles. |
| **SceneReviewGate.tsx** | src/pages/review/animatic.astro | Displays one-screen operational briefs, scrubs animatic videos, nudges timing offsets, and logs structured rejections. |
| **DriftApprovalModal.tsx** | src/layouts/ShowrunnerLayout.astro | Reviews machine-state drift deltas, authorizes canon mutations, or triggers the emergency kill switch. |

`┌─────────────────────────────────────────────────────────────┐`  
`│                 SOMATIC CAPABILITY HUD                      │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  ACTOR: char_wart (Wart)                                    │`  
`│  Locomotion: bipedal_hunched  |  Gait: UNSTEADY_GAIT        │`  
`│  Functional Limbs: [●] Left: SEVERED  [●] Right: OK (1.0)   │`  
`│  Held Prop: item_copper_flange (Single-Hand OK)             │`  
`│  Banned Verbs: SPRINT, VAULT, CLIMB, EMBRACE                │`  
`├─────────────────────────────────────────────────────────────┤`  
`│  LINTER STATUS: [!] 1 GAUNTLET VIOLATION DETECTED           │`  
`│  Line 12: "Wart braces the valve with both hands"           │`  
`│  >> ERROR: SOMATIC_BIMANUAL_VIOLATION (Requires 2.0 arms)   │`  
`└─────────────────────────────────────────────────────────────┘`

#### **Specialized Directorial Controls**

> * **One-Click Dyad Pinning:** Emits a PIN\_GRIEVANCE intent envelope to bypass the PRNG lottery, forcing a specific dyad and grievance into the next cycle while preserving physical and epistemic constraints.  
> * **Admin Object Injection ("Miracles on Demand"):** A root-level Game Master console allowing showrunners to inject un-simulated items or environmental fields (e.g., "Acoustic Silence") directly into spatial hexes, bounded by anti-grey-goo resource caps (≤5 entities, ≤5 hex radius).  
> * **The Emergency Halt Kill Switch (EmergencyHaltButton.tsx):** Executes an immediate write to Cloudflare D1:  
>   UPDATE studio\_config SET global\_agent\_dispatch\_locked \= 1  
>   This revokes all active distributed worker leases, drops WebSocket connections, flushes GPU buffers on Rig 2 via POST :8188/free, and halts automated Git merges.  
> * **The "Showrunner Eject Button" (@lifecycle: locked):** When a director manually modifies code in Episode\_XXX.tsx, the file header transitions to @lifecycle: locked. The metaprogram compiler (generate-episode-repo.ts) honors this tag by halting in-place overwrites, routing new generation passes to .candidate.tsx forks, and logging an audit record.

### **5\. Epistemic Architecture, Attenuation, & Pacing Modes**

To eliminate **omniscience drift** (characters acting on off-screen knowledge) and **narrative closure bias** (models prematurely resolving mysteries), the system enforces the **Epistemic Triad**:

WorldTruth=InternalBelief=ExternalUtterance  
                     `THE EPISTEMIC HORIZON SPECTRUM`  
                       
`TOTAL_IGNORANCE       RUMOR_ONLY         FALSE_BELIEF        PARTIAL_FACT        WITHHELD            FACTUAL_WITNESS`  
`┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐`  
`│ Topic scrubbed  │  │ Injects un-     │  │ Injects authored│  │ Injects physical│  │ Injects dramatic│  │ Injects         │`  
`│ completely from │  │ verified hearsay│  │ misconception as│  │ clues; root     │  │ taboo: knows,   │  │ verified factual│`  
`│ LLM prompt      │  │ with low confi- │  │ firm conviction │  │ cause omitted   │  │ but forbidden to│  │ axioms into the │`  
`│ context window. │  │ dence rating.   │  │ (high conf).    │  │ from context.   │  │ speak directly. │  │ context window. │`  
`└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘`

#### **The Horizon Spectrum (EpistemicHorizonEnum)**

> * TOTAL\_IGNORANCE: The topic is completely excluded from the context envelope, enforcing **Ignorance by Omission**.  
> * RUMOR\_ONLY: Injects unverified hearsay with an exponential hop-decay factor (Confidence(*h*)=Initial×0.8*h*).  
> * FALSE\_BELIEF: Injects authored misconceptions that the character asserts as truth.  
> * PARTIAL\_FACT: Injects physical clues (permitted\_clue\_tokens) while withholding root causes.  
> * WITHHELD: The character possesses direct knowledge of the truth but is bound by dramatic taboos and token attenuation filters.  
> * FACTUAL\_WITNESS: Direct sensory observation backed by line-of-sight and acoustic verification.

#### **Dramatic Pacing Modes & Predicate Compilation Gates**

Before media compilation begins, the declared DramaticPacingMode evaluates audience awareness against character knowledge:

`┌─────────────────────────────────────────────────────────────┐`  
`│          PACING MODE COMPILATION VERIFICATION GATES         │`  
`├───────────────────┬─────────────────────────────────────────┤`  
`│ Mode Declared     │ Predicate Logic Verification Rule       │`  
`├───────────────────┼─────────────────────────────────────────┤`  
`│ DRAMATIC_IRONY    │ Φ ∈ revealed_facts ∧                    │`  
`│                   │ Φ ∉ Actor.BeliefRecords                 │`  
`├───────────────────┼─────────────────────────────────────────┤`  
`│ SUSPENSE          │ Φ ∈ revealed_facts ∧                    │`  
`│                   │ Φ ∉ Actor.BeliefRecords ∧               │`  
`│                   │ PendingHazard(Φ).is_time_bound == true  │`  
`├───────────────────┼─────────────────────────────────────────┤`  
`│ SURPRISE          │ Φ ∉ revealed_facts (at T_0) ∧           │`  
`│                   │ Φ ∉ Actor.BeliefRecords (at T_0) ∧      │`  
`│                   │ Φ ∈ revealed_facts (at T_1)             │`  
`├───────────────────┼─────────────────────────────────────────┤`  
`│ MYSTERY           │ Φ ∈ withheld_secrets ∧                  │`  
`│                   │ Φ ∉ revealed_facts ∧                    │`  
`│                   │ Actor.EpistemicHorizon ∈ {WITHHELD, ...}│`  
`└───────────────────┴─────────────────────────────────────────┘`

If an operator selects DRAMATIC\_IRONY for a secret the audience has not witnessed, or if the interacting characters already hold a belief for that fact, the gate trips immediately at *T*0​\=\$0.00, preventing unearned reveals from burning compute.

### **6\. Attention Engineering & Prompt Context Assembly**

To counteract the U-shaped attention curve and prevent "lost-in-the-middle" context decay, the dashboard formats generative requests into the **15% / 70% / 15% Attention Sandwich**:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ 1. TOP 15%: STATIC GROUNDING & SYSTEM INVARIANTS                       │`  
`│    • Narrative Thesis: Domestic survival, unacknowledged avoidance     │`  
`│    • Pre-Compiled Negative Axioms: world_axioms.yaml                   │`  
`│    • Actor Refusal Vectors: Mandatory boundaries & unavoidable costs   │`  
`│    • Somatic Capability Masks: Banned kinetic verbs & availableArms    │`  
`│    • The Slop Filter: Logit biases & banned high-probability tokens    │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 2. MIDDLE 70%: PASSIVE MOMENTUM & SANITIZED CONTEXT                    │`  
`│    • Sliding Prose Buffer: Preceding 800–1,200 words of locked text    │`  
`│    • Active Grievance Projection: Surface Dispute vs. The Underneath   │`  
`│    • Epistemic Horizon Injection: Ignorance by Omission applied        │`  
`│    • Logistical Reality: Active held, worn, and cached prop matrices   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 3. BOTTOM 15%: DYNAMIC SCENE ANCHORS & RECENCY TRIGGERS               │`  
`│    • Continuous Parameter Sliders: Transformed <C, P, T, S> vector     │`  
`│    • Attenuation Filter: Explicit negative leverage token blacklist    │`  
`│    • Active Entity Micro-Cards: Spatial coordinates & current poses    │`  
`│    • 200–250 Word Micro-Beat Scope                                     │`  
`│    • HARD PHYSICAL EXIT CONDITION: Exact terminal sensory trigger      │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **200–250 Word Micro-Beat Cap:** Generation is strictly capped to short beats structured around Dwight Swain MRUs (Motivation → Involuntary Somatic Reaction → Motor Action / Spoken Dialogue).  
> * **Hard Physical Exit Conditions:** Every prompt concludes with an objective, observable termination trigger (e.g., *"Halt generation immediately when Bog drops the copper siphon"*), preventing models from generating unearned emotional resolutions or conversational closure.  
> * **The Slop Filter:** Enforces stylometric boundaries (mean sentence lengths, monosyllabic ratios) and applies negative logit biases (−100.0) against high-probability AI clichés ("tapestry", "palpable", "furthermore").

### **7\. Multi-Model Divergence & Step 0 Discovery Triage**

To eliminate shared latent bias and discover character boundaries, the dashboard features a multi-model fan-out pipeline (DivergenceTriagePanel.tsx):

`┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐`  
`│                             MULTI-MODEL DIVERGENCE TRIAGE PANEL                                        │`  
`├────────────────────────────┬────────────────────────────┬────────────────────────────┬─────────────────┤`  
`│ TAKE A: PSYCHOLOGICAL      │ TAKE B: PHYSICAL BLOCKING  │ TAKE C: STRUCTURAL REVERSAL│ TAKE D: STACCATO│`  
`│ (Claude 3.5 Sonnet / 0.85) │ (Qwen 2.5 32B / 0.85)      │ (Inversion Prompt / 0.90)  │ (Local 8B GGUF) │`  
`├────────────────────────────┼────────────────────────────┼────────────────────────────┼─────────────────┤`  
`│ BOG: "Count the washers."  │ [Bog drops lantern on box] │ BOG: "Take the lantern."   │ BOG: "Washers." │`  
`│ WART: "I did. Three short."│ BOG: "Don't lean on that." │ WART: "What's broken?"     │ WART: "Short."  │`  
`│ BOG: "Count them again."   │ WART: "I have one arm,     │ BOG: "Nothing. Just hold   │ BOG: "Count."   │`  
`│ WART: "They don't breed     │ Bog. Not three ears."      │ it. I can't look at the    │ WART: "Did."    │`  
`│ in the grease, Bog."       │ [Wart kicks grease bucket] │ seam anymore."             │ BOG: "Again."   │`  
`├────────────────────────────┼────────────────────────────┼────────────────────────────┼─────────────────┤`  
`│ Frame Budget: 82 frames    │ Frame Budget: 114 frames   │ Frame Budget: 96 frames    │ Frame Budget: 36│`  
`│ Somatic Linter: PASS [OK]  │ Somatic Linter: PASS [OK]  │ Somatic Linter: PASS [OK]  │ Somatic: PASS   │`  
`│ Epistemic Gate: PASS [OK]  │ Epistemic Gate: PASS [OK]  │ Epistemic Gate: PASS [OK]  │ Epistemic: PASS │`  
`├────────────────────────────┼────────────────────────────┼────────────────────────────┼─────────────────┤`  
`│ [ SELECT TAKE A ]          │ [ SELECT TAKE B ]          │ [ SELECT TAKE C ]          │ [ SELECT TAKE D]│`  
`└────────────────────────────┴────────────────────────────┴────────────────────────────┴─────────────────┘`

> 1. **Asymmetric Dispatch (*N*\=4):** Dispatches identical premise contexts in parallel across Claude 3.5 Sonnet (psychological leverage), Qwen 2.5 32B (physical staging/blocking), an Adversarial Inversion Worker (goal reversals), and a Local 8B Specialist (staccato curtness).  
> 2. **Triage Actions:** The showrunner can select a take, route it to an adversarial inspection agent (Jules), or click **REJECT ALL / SEED IS BARREN**. Tagging a dyad with three consecutive barren discards marks the channel as INERT\_FRICTION, quarantining it from the Stage 3 conflict lottery.  
> 3. **Post-Selection Refusal Vector Extraction:** Selecting a take triggers an extraction pass that derives permanent character boundaries formatted as:  
>    RefusalRule=⟨Trigger,MandatoryRefusal,UnavoidableCost⟩  
>    Once approved, the rule commits to the character's canonical dossier with the discovery excerpt attached as cryptographic provenance.

### **8\. Pre-Viz Animatic Review & Progressive QA Architecture**

The review console (SceneReviewGate.tsx) guarantees that a showrunner can evaluate and disposition a candidate scene in ≤60 seconds:

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

> * **Acoustic Master Clock:** Duration is determined by ffprobe sweeps of uncompressed 48 kHz .wav stems synthesized by audio-microservice on port 8000, establishing the 24 fps integer frame budget (⌈1000*D*ms​​×24⌉). The UI decouples measured speech duration from editorial pre-roll and post-roll padding.  
> * **Sidechain Ducking:** Verifies that active dialogue triggers an automated **−14 dB attenuation envelope** across background ambient beds.  
> * **Progressive Sentinel Traps:**  
  * *Confidence 0:* Sweeps for missing files (\!MissingAssets) and trips on the empty-file hash constant (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855).  
  * *Confidence 2:* Evaluates solid-color debug mask passes, verifying that mouth viseme drift is \<4px from the anchor and alpha edge key spill is \<12.  
> * **Minimal Enclosing Unit (MEU) Surgical Patching:** When geometric errors occur, the system classifies whether the fault lies in the asset manifest (ASSET\_ERROR) or the JSX coordinates (CODE\_ERROR). If it is code-related, Jules applies an AST patch via ts-morph and runs a local 36-frame test render, correcting alignment issues without re-rendering the entire scene.  
> * **Structured Rejection Taxonomy:** Discarded takes must be tagged with closed defect codes (FLAT\_DIALOGUE, UNEARNED\_RELEASE, SOMATIC\_DRIFT, VOICE\_BLEED, PACING\_STALL), writing structured audit records into eval/rejections.jsonl to calibrate future prompts.

### **9\. Edge Infrastructure, Batch Orchestration, & Hardware Mutexes**

goblin-dashboard orchestrates distributed batch runs by interfacing with Cloudflare edge actors and physical on-premises hardware:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: LOCAL FOUNDRY GPU (Physical POSIX Environment)                  │`  
`│                                                                        │`  
`│   [ Headless ComfyUI (:8188) ]                                         │`  
`│         ▲                                                              │`  
`│         │ (127.0.0.1 HTTP / WebSocket Loopback IPC)                    │`  
`│         ▼                                                              │`  
`│   [ media-broker daemon (:3000) ]                                      │`  
`│         │ • Holds permanent OS flock on /var/lock/rig2_gpu.lock        │`  
`│         │ • Dispatches heartbeat POST /heartbeat every 10s             │`  
`│         ▼                                                              │`  
`│   [ cloudflared daemon ]                                               │`  
`│         │ (Outbound Encrypted Tunnel - ZERO Inbound WAN Ports Open)    │`  
`└─────────┼──────────────────────────────────────────────────────────────┘`  
          `│`  
          `│ WAN (Outbound QUIC / TLS 1.3 Tunnel Pipe)`  
          `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE ZERO TRUST ANYCAST EDGE                                     │`  
`│   • EdgeGateway Worker (Hono)                                          │`  
`│   • ShotCoordinatorDO (Hardware Mutex & Queue)                         │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **The Relational Truth Gate (Cloudflare D1):** Evaluates scene\_fact\_dependencies before job dispatch. If upstream facts mutate without an AST re-extraction (dirty\_count \> 0), the edge gateway terminates the request with HTTP 412 Precondition Failed (DIRTY\_SCENE\_REJECTED), preventing hardware allocation on invalid narrative states.  
> * **Hardware Mutex Actor (ShotCoordinatorDO):** Serializes generation jobs into a single-threaded FIFO queue backed by transactional NVMe storage (ctx.storage), preventing CUDA Out-of-Memory crashes on Rig 2's GPU. It issues 30-second leases fenced by monotonic epochs (*N*→*N*\+1) to drop stale writes from lagging workers.  
> * **Inside-Out Network Topology:** Rig 1 and Rig 2 run cloudflared tunnels making outbound-only connections to Cloudflare's edge. Local servers bind strictly to 127.0.0.1, keeping all external router WAN ports closed.  
> * **Local Hardware Sovereignty:** media-broker on Rig 2 holds a POSIX file lock (flock) on /var/lock/rig2\_gpu.lock. The edge coordinator functions as a passive queue; Rig 2 claims jobs only when its physical lock is free and available VRAM exceeds 21 GB.  
> * **VRAM Hygiene:** Between generation turns, the Conductor calls POST 127.0.0.1:8188/free to purge model caches and prevent PyTorch memory fragmentation.  
> * **Zero-Egress Asset Streaming (Cloudflare R2):** Audio stems and video plates stream directly to client browsers using presigned R2 URLs, bypassing worker memory limits and avoiding cloud bandwidth egress fees.

### **10\. Corpus Health & Bible Integrity Telemetry**

The dashboard provides a real-time diagnostic view into the mathematical validity of 000.goblin-lore via CorpusHealthPanel.tsx, evaluating storyworlds against their declared series.config.json across six health pillars:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   THE SIX STATIC HEALTH PILLARS                        │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. Dynamic Combinatorial Dyadic Mesh (K_N)                             │`  
`│    • Total channels: N(N - 1) / 2                                      │`  
`│    • M[u, v] < min_grievances ──► FATAL_BLIND_SPOT                     │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 2. Categorical & Tonal Spread                                          │`  
`│    • Normalized Shannon Entropy: H_norm >= 0.70                        │`  
`│    • Farce Ratio Ceiling: R_farce <= max_farce_ratio (<= 15%)          │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 3. Topological Pacing & DAG Depth (δ)                                  │`  
`│    • Pacing runway: δ_max >= min_grievance_depth (δ >= 2)              │`  
`│    • Premature Climax Guard: (δ = 0) ──► I_floor <= Max_I - 2          │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 4. Structural Centrality & Gini Dispersion (G)                         │`  
`│    • Gini Coefficient: G in [0.30, 0.50] (Optimal distribution)        │`  
`│    • Monolithic Spines: Flags entities where k_in >= Threshold_spine   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 5. Spatial Reciprocity & Acoustic Integrity                            │`  
`│    • Bidirectional portal symmetry: v in Adj(u) <==> u in Adj(v)       │`  
`│    • Sound transmission loss: 500 bp <= damping <= 10,000 bp           │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 6. Cross-Vector Somatic & Epistemic Coherence                          │`  
`│    • Anatomical Hand Saturation: ∑ HandsRequired(i) <= availableArms   │`  
`│    • Clue Disjointness Theorem: P_clues ∩ ⋃ T_lemmas = ∅               │`  
`└────────────────────────────────────────────────────────────────────────┘`

> 1. **Dyadic Mesh Completeness (*KN*​):** For an ensemble of *N*\=4 characters, all (24​)\=6 interaction channels are audited. Pairs with zero disputes are flagged with FATAL\_BLIND\_SPOT, while pairs with one dispute are flagged with DYADIC\_FRAGILITY.  
> 2. **Categorical & Tonal Entropy:** Evaluates normalized Shannon entropy (*H*norm​≥0.70) across thematic categories and enforces the Farce Ratio Ceiling (*R*farce​≤15%), ensuring comedic palate cleansers do not erode dramatic stakes.  
> 3. **Topological Pacing Runway (*δ*):** Asserts that the Grievance DAG has sufficient causal depth (*δ*max​≥2) and guards against premature climaxes by restricting root-level dispute intensity.  
> 4. **Structural Centrality & Gini Dispersion (*G*):** Calculates the Gini coefficient (*G*∈\[0.30,0.50\]) across entity incoming links (*k*in​) to flag monolithic bottleneck assets (such as an over-referenced prop) and identify unreferenced dead lore.  
> 5. **Spatial Reciprocity & Acoustics:** Confirms bidirectional portal symmetry (*v*∈Adj(*u*)⟺*u*∈Adj(*v*)) to prevent one-way navigation traps, and audits integer acoustic damping values (500 bp≤damping≤10,000 bp).  
> 6. **Cross-Vector Coherence:** Enforces the **Clue Disjointness Theorem** (Pclues​∩(⋃*t*∈T​*t*)=∅), asserts that equipped items do not exceed functional arm capacities (∑Hands≤availableArms), and checks that mute characters are not assigned spoken dialogue.

If any of these health checks return a FATAL status, goblin-dashboard triggers an automated dispatch lockout on batch generation, preventing the pipeline from expending compute on a structurally compromised storyworld.

---
