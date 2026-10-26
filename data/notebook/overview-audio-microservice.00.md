# **Overview : Audio Microservice.00**

[https://gemini.google.com/app/bd2d89122d2676b3](https://gemini.google.com/app/bd2d89122d2676b3)

*User prompt: we are starting working on the next repository \[ audio-microservice   \]; can you present me with a complete overview*

Response: audio-microservice is the local speech synthesis daemon and temporal pacemaker within the multi-repository studio fleet, deployed as a Python and FastAPI service running on port 8000\. It acts as an untrusted generative spoke that synthesizes abstract dialogue lines into physical, uncompressed audio stems, establishing the non-negotiable master clock that governs all downstream visual animation and timeline cut points.

### **1\. Architectural Role & Hardware Boundary**

In the studio's tripartite execution topology, audio-microservice belongs to the heavy compute cluster (03.foundry/) but operates under strict hardware demarcation:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: ORCHESTRATION & ACOUSTIC HOST (Pure CPU / System RAM)           │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Conductor Runtime: Node.js (produceEpisode.ts / ttsClient.ts)        │`  
`│ • Vocal Engine: audio-microservice (Python / FastAPI on port 8000)     │`  
`│ • Compute Target: Multi-core CPU threads & 64 GB System RAM            │`  
`│ • VRAM Allocation: Exactly 0 MB Dedicated GPU VRAM                      │`  
`│ • Engines Supported: CosyVoice, Parler-TTS, XTTSv2, Piper              │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ HTTP POST (:8000/generate)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: GPU TENSOR FOUNDRY (Isolated 24 GB VRAM Silicon)                │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Headless ComfyUI daemon on port 8188                                 │`  
`│ • 100% of VRAM dedicated to Wan 2.2 video diffusion & LoRA passes      │`  
`│ • Boundary Rule: Zero audio synthesis or TTS models permitted          │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Hardware Isolation Invariant:** audio-microservice runs primarily on Rig 1 using CPU inference or low-power accelerators. It is strictly banned from Rig 2 to prevent multi-tenant VRAM fragmentation and CUDA Out-of-Memory (OOM) collisions during heavy 24 GB video diffusion passes.  
> * **Turn-Based VRAM Eviction:** On single-workstation deployments where the host GPU is shared with preliminary drafting models (e.g., Qwen 14B GGUF), the pipeline issues an eviction request (POST \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) with {"unload\_models": true, "free\_memory": true}) to flush up to 14.2 GB of language model weights in \~300 ms prior to vocal synthesis.  
> * **Persistent Daemon Architecture:** Unlike static CLI utilities, audio-microservice remains warm in memory to keep neural speech models and reference voice checkpoints loaded, avoiding per-line cold-boot latencies.

### **2\. Ingress Contract & Somatic DSP Mapping**

The microservice receives per-line dialogue requests from worker-sower-conductor (src/audio/ttsClient.ts) over HTTP POST at \[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate)\[cite: 3, 4, 8, 18\].

`// Formal payload dispatched to audio-microservice`  
`export interface TTSGenerationRequest {`  
  `character: string;              // e.g., "ELIAS", "char_bog"`  
  `text: string;                   // Verbatim phonetic dialogue text`  
  `emotion: string;                // Condition enum (e.g., "tense_jaw")`  
  `tonePacing: number;             // Base pacing scalar (default: 1.0)`  
  `dsp_modifiers: {`  
    `pause_frequency_multiplier?: number; // Pacing scalar for breath cadence`  
    `breathinessPauseMultiplier?: number; // Pulmonary trauma scaling (1.0 to 3.5)`  
    `basePitchShiftSemitones?: number;    // -12.0 to 12.0 semitones`  
    `formantWarpingFactor?: number;       // 0.5 to 2.0`  
    `vocalFryDensity?: number;            // 0.0 to 1.0`  
  `};`  
`}`

> * **Somatic Translation:** Narrative trauma logged in the canonical ledger is injected directly into digital signal processing (DSP) parameters. For example, characters with respiratory damage receive an elevated pause\_frequency\_multiplier: 1.4 and breathinessPauseMultiplier: 2.2, forcing the synthesis model to elongate breath intervals and alter speech cadence dynamically.  
> * **Verbatim Text Enforcement:** Downstream models perform zero generative text iteration; the service synthesizes only the locked strings emitted by dialogue\_ast.json.

### **3\. Output Delivery Contracts & Automated Verification Gates**

Once vocal synthesis completes, audio-microservice produces discrete audio stems that must pass rigorous conformance filters before timeline mounting:

`Synthesis Output (.wav) ──► STT Alignment ──► Loudness Normalization ──► True-Peak Limiter ──► Noise Floor Check`

> * **Acoustic Output Format:** Emits uncompressed, 48 kHz mono or stereo .wav stems written to public/audio/dialogue/\${sceneId}\_SH\${shotIndex}.wav alongside duration reporting in milliseconds.  
> * **Speech-to-Text (STT) Alignment Gate:** An automated transcription pass compares the synthesized audio against the source screenplay AST; any dropped words or model hallucinations halt the build immediately.  
> * **Loudness Standards:** An automated FFmpeg loudness pass conforms dialogue to an integrated **−16 LUFS** (±1.0 LUFS) target for web distribution or **−24 LUFS** (±1.0 LUFS) for broadcast.  
> * **True-Peak Ceiling:** Brickwall limiters eliminate inter-sample clipping by enforcing a strict true-peak ceiling of **−1.0 dBTP** (clamped between **−1.0 dBFS** and **−2.0 dBTP**).  
> * **Noise Floor Certification:** Dialogue stems must maintain an acoustic noise floor below **−60 dB**, preventing amplified background hiss when downstream ducking envelopes release.  
> * **Stem Immutability:** Generated .wav stems are content-addressed and pinned to prevent sub-frame duration drift or viseme misalignment. Video rendering runtimes are strictly forbidden from re-triggering the TTS service during visual compositing.

### **4\. The Master Clock & Quantization Bridge**

Because video diffusion models possess no innate biological cadence, audio duration is treated as the non-negotiable physical clock for the entire production pipeline.

`AUDIO DOMAIN (Timebase Clock): 48,000 samples/second (Sample-Accurate Waveform)`  
`│`  
`├─ Duration Observation: duration_ms (ffprobe inspection)`  
`├─ Phoneme / Viseme Onsets (e.g., Plosive transient at sample 26,742)`  
`└─ Continuous Dynamic Ducking Envelopes (-14 dB Speech Window)`  
`│`  
`▼ Integer Projection Ratio: S = Frame * (48,000 / 24) = Frame * 2,000`  
`VIDEO DOMAIN (Master Video Clock): 24 integer frames/second (Discrete Visual Cut Boundaries)`

> * **Integer Ceiling Quantization:** Downstream orchestration measures the stem duration (*D*ms​) via ffprobe and computes the discrete 24 fps frame budget using ceiling arithmetic:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉\=⌊1000(*D*ms​×24)+999​⌋  
> * **Sub-Frame Zero-Length Clamp:** Interjections under 41.67 ms are clamped to a minimum duration of 1 frame (41.67 ms) with digital silence padding to prevent inverted timeline intervals:  
>   `const targetFrames = Math.max(1, Math.ceil((durationMs / 1000) * 24));`

> * **Sidechain Gain Automation:** Spoken dialogue windows exported from the stems govern Track 3 ambient ducking. Continuous beds dip down by **−14 dB** across a 6-frame quadratic attack during speech, releasing over a 12-frame curve back to unity during dialogue pauses.

### **5\. Reference Voice Management & Storage Hierarchy**

Unlike visual assets that tolerate experimental churn, character reference voices represent critical production configuration where silent drift breaks continuity across episodes.

`audio-microservice/`  
`├── voices/`  
`│   ├── active/`  
`│   │   └── bog.wav              # Active pointer/symlink consumed by FastAPI server`  
`│   ├── versions/`  
`│   │   ├── bog_v1.wav           # Pinned historical reference (never deleted)`  
`│   │   └── bog_v2.wav           # Superseded reference preserved for audits`  
`│   └── voice_manifest.json      # Cryptographic hashes, speaker IDs & semantic tags`  
`├── server.py                    # FastAPI application entrypoint (:8000)`  
`├── engines/                     # Model wrappers (CosyVoice, Parler-TTS, Piper)`  
`└── tests/                       # Conformance, duration reporting & loudness tests`

> * **Two-Tier Versioning:** Active references point to tagged files in /voices/versions/. Historical references are never deleted, ensuring that previous episodes can be re-audited or regenerated with exact vocal parity.  
> * **Voice Manifestation:** voice\_manifest.json tracks the active references, assigned character identities, and model configurations, ensuring reproducibility within the fleet's overarching versions.json governance.

---

*User prompt: {{FOCUS: 1\. Architectural Role & Hardware Boundary}} /extreme-details*

Response: audio-microservice operates as the local speech synthesis daemon, hardware-isolated acoustic runtime, and master temporal authority within the multi-repository studio production fleet. Serving as an untrusted generative spoke, it receives validated screenplay Abstract Syntax Tree (AST) contracts and translates semantic text into uncompressed, physical audio waveforms. Its operational boundaries and hardware topology are governed by strict multi-modal resource demarcation, hardware isolation invariants, and explicit memory lifecycle hygiene.

### **1\. Operational Mandate & Daemon Architecture**

Unlike static script utilities or transient CLI tools, audio-microservice is architected as an independent, long-running daemon designed to eliminate per-inference cold-boot latency and maintain stateful hardware stability:

> * **Warm Process Daemonization:** The service runs as a persistent Python and FastAPI web server bound to local port 8000 (\[http://127.0.0.1:8000\](http://127.0.0.1:8000)). It maintains active neural speech synthesis model checkpoints (such as CosyVoice, Parler-TTS, Piper, XTTSv2, or Chatterbox) and character vocal embeddings warm in memory.  
> * **Network Client Relationship:** Upstream orchestrators, such as worker-sower-conductor (executing inside worker-sower-engine at src/pipeline/produceEpisode.ts), never invoke synthesis via shared disk mutability or direct filesystem coupling. They communicate with audio-microservice over a typed HTTP client (src/audio/ttsClient.ts) via asynchronous REST queries (POST \[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate)).  
> * **Read-Only Upstream Ingestion:** The microservice reads immutable canonical character identity profiles compiled from upstream repositories (e.g., characters.json from goblin-bible), but is fundamentally forbidden from writing back to canonical narrative databases.  
> * **POD-05 Structural Governance:** Within studio infrastructure taxonomy, this service fulfills the technical implementation of **POD-05: Audio Pod** (Macro-Node 02: Blueprint, Tier 2 Foundational). Its one-sentence institutional mission is to establish the immutable, rigid temporal and emotional timing grid that every downstream visual pod must animate to.

### **2\. Physical Machine Demarcation: The Dual-Rig Split**

To protect system stability and eliminate multi-tenant process collisions, the studio execution infrastructure permanently separates CPU-bound orchestration and audio synthesis from high-throughput GPU tensor diffusion:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: ORCHESTRATION & ACOUSTIC HOST (CPU / System RAM Bound)          │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Pipeline Conductor: worker-sower-conductor (produceEpisode.ts)       │`  
`│ • Canon Database: Local SQLite ledger & Zod schema invariant linters   │`  
`│ • Script Engine: llama.cpp / Ollama (Qwen 2.5 GGUF on CPU/RAM)         │`  
`│ • Vocal Engine: audio-microservice (FastAPI on Port 8000)              │`  
`│ • Temporal Quantizer: POSIX ffprobe CLI (target_frames = ceil(...))    │`  
`│ • Optical Compositor: Remotion CLI (@remotion/renderer)                │`  
`│   - Software GL: --gl=swangle (SwiftShader on ANGLE)                   │`  
`│   - Worker Concurrency: --concurrency=1                                │`  
`│   - Media Decoding: <OffthreadVideo /> background FFmpeg decoders      │`  
`│ • Showrunner Cockpit: Astro interface (localhost:4321) & Blessed TUI   │`  
`│ • Compute Target: Multi-core CPU (x86_64/ARM), 32 GB–64 GB System RAM  │`  
`│ • Dedicated VRAM Allocation: EXACTLY 0 MB (Zero GPU Compute)           │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Authenticated Edge Tunnel / R2 Egress`  
                                    `│ (Zero Direct LAN Sockets to Port 8188)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: HEAVY GPU TENSOR FOUNDRY (Isolated Dedicated High-VRAM Silicon) │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Workstation Hardware: NVIDIA RTX 3090, RTX 4090, or RTX 5070         │`  
`│ • Silicon Capacity: 24 GB Dedicated VRAM (CUDA 12.x / PyTorch)         │`  
`│ • Spoke Execution Daemon: media-broker controller on port 3000         │`  
`│ • Inverted Hardware Mutex: POSIX advisory file lock (/var/lock/rig2)   │`  
`│ • Inference Engine: Headless ComfyUI daemon on port 8188               │`  
`│ • VRAM Allocation: 100% dedicated to Wan 2.2 diffusion & LoRA passes   │`  
`│ • Strict Boundary Invariant: ZERO TTS or Audio synthesis daemons       │`  
`│ • Headless Quarantine: ZERO Chromium, Remotion, or SQLite processes    │`  
`│ • Hardware Output: Raw #00FF00 uncomposited chroma-key plate MP4s      │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **Operational Vector Comparison**

| Architectural Vector | Rig 1 (Host Orchestrator & Acoustic Host) | Rig 2 (Untrusted GPU Spoke / Foundry) | Upstream Simulation (Edge) |
| :---- | :---- | :---- | :---- |
| **Physical Host** | Multi-core CPU workstation. | High-VRAM GPU rendering workstation. | Cloudflare Edge Worker / Durable Object. |
| **Silicon Allocation** | **0 MB Dedicated GPU VRAM** (Pure RAM/CPU). | **100% of 24 GB VRAM** allocated to PyTorch/CUDA. | Cloudflare V8 Isolate (≤128 MB RAM, no disk). |
| **Audio Processing** | Runs audio-microservice (:8000), normalizes, probes. | **Strictly Banned** from audio synthesis/waveform math. | Assigns speaker IDs, dialogue, and emotion tags. |
| **Temporal Clocking** | Spawns ffprobe to quantize continuous sound to 24 fps. | Blind to duration rules; renders injected integer frames. | Completely agnostic to frame rates and audio waveforms. |
| **Optical Assembly** | Remotion CLI using software OpenGL (--gl=swangle). | **Strictly Banned** (Zero Chromium / Remotion instances). | Visual-agnostic (blind to pixels and viewports). |
| **Child Processes** | Required (spawns ffprobe, git, npm, remotion). | Headless execution only (comfyui, media-broker). | **Strictly Banned** (Cannot spawn OS binaries). |
| **Narrative Authority** | Sole owner of SQLite ledger, Zod schemas, canon checks. | Stateless spoke; zero narrative state or canon access. | Evaluates active ledger; mutates state *Sn*​→*Sn*\+1​. |

### **3\. The 24 GB Spatial Ceiling & Hardware Contention Math**

The fundamental imperative separating audio-microservice from GPU tensor execution arises from the finite physical capacity of consumer workstation silicon (such as an NVIDIA RTX 3090, 4090, or 5070 equipped with 24 GB VRAM). Generative multi-modal character pipelines exceed this memory boundary if run concurrently:

Text AST Generation (Qwen 2.5 14B GGUF)Speech Synthesis (CosyVoice / Parler-TTS / XTTSv2)Temporal Video Diffusion (Wan 2.2 \+ Character LoRAs)Total Concurrent Memory Footprint​≈9 GB to 10 GB VRAM≈4 GB to 6 GB VRAM≈16 GB to 22 GB Scratchpad VRAM≈29 GB to 38 GB VRAM​​

Because consumer-grade graphics silicon lacks dynamic hardware virtualization to safely overcommit and partition tensors across independent, uncoordinated daemons, attempting to initialize speech synthesis while a video diffusion model is resident triggers an immediate, unrecoverable torch.cuda.OutOfMemoryError.

### **4\. Memory Isolation Modes: Dual-Rig Offloading vs. Turn-Based Flushing**

Depending on the operational deployment (a fully distributed dual-machine topology vs. a single-workstation local development setup), the architecture enforces one of two execution disciplines to isolate audio-microservice:

#### **Architecture A: The Decoupled Dual-Rig Split (Production Standard)**

In the primary production configuration, audio-microservice is permanently evicted from the GPU foundry:

> * **Pure CPU Speech Synthesis:** audio-microservice executes entirely on Rig 1, utilizing multi-threaded CPU instructions and system RAM (or an isolated, low-power auxiliary accelerator).  
> * **Dedicated Foundry Allocation:** Rig 2 dedicates 100% of its physical 24 GB VRAM pool strictly to Wan 2.2 temporal video diffusion and character LoRA sampling.  
> * **Elimination of the Swapping Tax:** This physical isolation permanently relieves the GPU workstation of the need to load and evict neural speech checkpoints on every production pass, eliminating PCIe model-swapping latency and maximizing rendering throughput.

#### **Architecture B: The Serialized Turn-Based Flush Protocol (Single-GPU Fallback)**

On local workstations where Rig 1 and Rig 2 workloads share a single 24 GB GPU card, all processes are unified under sequential, non-overlapping execution phases separated by synchronous REST memory evictions:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ SINGLE-GPU SEQUENTIAL EXECUTION LIFECYCLE                              │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. TURN 1: CHILD GRAPH A (Text & Dialogue AST Synthesis)               │`  
`│    • Quantized Qwen 2.5 14B GGUF loaded into VRAM (~9 GB to 10 GB)     │`  
`│    • Emits validated drafts/dialogue_ast.json contract                 │`  
`│                                                                        │`  
`│ 2. THE FIRST HARD FLUSH (POST http://127.0.0.1:8188/free)              │`  
`│    • Payload: {"unload_models": true, "free_memory": true}             │`  
`│    • Evicts ~14.2 GB of text weights; drops active VRAM in ~300 ms     │`  
`│                                                                        │`  
`│ 3. TURN 2: CHILD GRAPH B (Acoustic Timing & Speech Synthesis)          │`  
`│    • audio-microservice / TTS node hydrates into clean VRAM (4–6 GB)   │`  
`│    • Synthesizes uncompressed 48 kHz .wav dialogue stems to disk       │`  
`│    • Temporal quantization locks integer frame budgets at 24 fps       │`  
`│                                                                        │`  
`│ 4. THE SECOND HARD FLUSH (POST http://127.0.0.1:8188/free)              │`  
`│    • Purges TTS weights, vocoder checkpoints, and audio buffers        │`  
`│    • Memory drops back to baseline in ~300 ms                          │`  
`│                                                                        │`  
`│ 5. TURN 3: CHILD GRAPH C (Temporal Video Diffusion)                    │`  
`│    • 100% of 24 GB VRAM allocated to Wan 2.2 + Character LoRAs         │`  
`│    • Renders uncomposited #00FF00 chroma-key plate MP4s                │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Eviction Command:** Prior to activating speech generation, the orchestrator issues a synchronous HTTP POST call to ComfyUI's memory management route:  
>   `// worker-sower-conductor: src/pipeline/produceEpisode.ts`  
>   `await fetch("http://127.0.0.1:8188/free", {`  
>     `method: "POST",`  
>     `headers: { "Content-Type": "application/json" },`  
>     `body: JSON.stringify({ unload_models: true, free_memory: true })`  
>   `});`

> * **Eviction Latency:** This call unbinds active model pointers and instructs PyTorch's caching allocator to release its reserved CUDA memory blocks, clearing up to 14.2 GB of text weights and returning active VRAM to baseline in approximately 300 milliseconds.

### **5\. Hardware Quarantine Rules & Process Hygiene**

To guarantee deterministic media output and protect hardware silicon, the architecture enforces uncompromising execution firewalls:

#### **Strict Prohibition of Chromium & Compositing on GPU Silicon**

Spawning headless Chromium instances (such as @remotion/renderer) on Rig 2 alongside PyTorch diffusion models triggers catastrophic system memory thrashing, OpenGL driver context loss, and kernel out-of-memory (oom-killer) process termination.

> * All optical compositing, DOM rasterization, and video decoding are quarantined to Rig 1\.  
> * Chromium is forced to rasterize inside system RAM via SwiftShader software OpenGL using the \--gl=swangle flag.  
> * Frame rendering concurrency is clamped to \--concurrency=1 to eliminate memory spikes and race conditions during high-resolution compositing.  
> * Media decoding is offloaded from browser processes to isolated background FFmpeg child processes using Remotion's \<OffthreadVideo/\> component.

#### **Virtual Memory Defragmentation & 25-Shot Process Recycling**

During multi-hour rendering sessions, cycling between 1D audio sample arrays, variable-token text sequences, and massive 5D spatio-temporal video latents (\[*B*,*C*,*T*,*H*,*W*\]) induces severe virtual memory fragmentation within PyTorch’s caching allocator (cudaMalloc/cudaFree).

> * Even when nvidia-smi reports over 21 GB of cumulative free VRAM, the address space can become fragmented into non-contiguous blocks smaller than the \~14.0 GB contiguous block required by Wan 2.2 attention matrices, causing unexpected CUDA OOM aborts.  
> * **The 25-Shot Recycling Governor:** The spoke controller (media-broker) monitors operational boundaries and automatically terminates and relaunches the headless ComfyUI process every 25 completed shots or upon crossing major production stage transitions. Gracefully killing the host Python process forces the Linux kernel and the NVIDIA kernel driver (nvidia.ko) to completely unmap active CUDA context tables, restoring a pristine physical address space.

#### **Stage-Level Batching Discipline**

The pipeline abandons naive per-shot model reloading. Rather than loading the text model, flushing, loading the audio model, synthesizing one line, and loading video diffusion for a single shot, the orchestrator batches tasks by stage:

> 1. Compiles and linters validate the complete scene dialogue AST.  
> 2. audio-microservice synthesizes all dialogue stems for the entire episode in a continuous batch.  
> 3. The spoken stems are conformed, measured via ffprobe, and frame-budgeted.  
> 4. VRAM is evacuated once via POST /free.  
> 5. Video diffusion processes execute all required shot latents back-to-back.

#### **Temporal Scheduling Splits (Weekday / Weekend)**

On hardware setups utilizing asymmetric silicon (such as an RTX 2060 on weekdays and an RTX 5070 on weekends), audio-microservice adjusts its model-loading discipline dynamically:

> * **Weekday Schedule (2060 Silicon):** Enforces strict sequential model loading and lighter quantization models to fit tighter VRAM envelopes.  
> * **Weekend Schedule (5070 Silicon):** Employs explicit resource scheduling to support higher parameter vocoders concurrently with visual passes while maintaining hard guards against VRAM contention.

### **6\. Ingress/Egress Hardware Interfaces & Network Topology**

audio-microservice operates within a zero-trust, inside-out network topology designed to isolate internal ports from the public internet and maintain transactional data integrity:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE EDGE PLANE                                                  │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Ingress Gateway: Hono router validating HMAC-SHA256 signatures       │`  
`│ • State Authority: ShotCoordinatorDO (Durable Object Mutex)            │`  
`│ • Ledger Verifier: Cloudflare D1 continuity check (is_dirty == 0)       │`  
`│ • Lease Governor: 30-second heartbeats & monotonic fencing tokens      │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Outbound cloudflared Secure Tunnel`  
                                    `│ (Zero unauthenticated inbound ports)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ WORKSTATION NETWORK TRANSPORT & DISPATCH                               │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. INGRESS: produceEpisode.ts ──► POST http://127.0.0.1:8000/generate  │`  
`│    • Injects speaker, phonetic text, emotion, somatic DSP modifiers    │`  
`│                                                                        │`  
`│ 2. SCRATCH DISK: Local NVMe File I/O                                   │`  
`│    • Writes stems directly to public/audio/dialogue/${scene}_${shot}.wav│`  
`│    • Reads buffer in <2 ms via local ffprobe child process             │`  
`│                                                                        │`  
`│ 3. TIMING BRIDGE: SpokeExecutionPayload dispatched to Edge Director    │`  
`│    • Converts millisecond audio to locked 24 fps integer frame budgets │`  
`│                                                                        │`  
`│ 4. FOUNDRY DISPATCH: Edge Director ──► media-broker (Rig 2)            │`  
`│    • Pull semantics govern execution; binds POSIX /var/lock/rig2 mutex │`  
`│    • ComfyUI samples plate MP4s and streams directly to Cloudflare R2  │`  
`│                                                                        │`  
`│ 5. ASSEMBLY EGRESS: Remotion downloads R2 plate ($0.00 egress fees)    │`  
`│    • Composites plate with local .wav stems into master MP4 deliverable│`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **No Direct LAN Sockets Between Rigs:** Rig 1 does not dispatch rendering commands directly to Rig 2 over unauthenticated local TCP sockets (e.g., \[http://192.168.1.50:8188\](http://192.168.1.50:8188)). All cross-machine dispatch routes upward through an authenticated Edge Gateway and downward through an outbound cloudflared tunnel, ensuring all render jobs are verified against Cloudflare D1 continuity ledgers (is\_dirty \== 0).  
> * **Local Filesystem I/O Speed:** Synthesized speech stems write directly to local NVMe scratch storage (public/audio/dialogue/). Because audio files reside locally on Rig 1, the Conductor spawns ffprobe child processes to extract millisecond-accurate durations in under 2 milliseconds, bypassing the multi-second latency of serializing, uploading, and fetching audio over remote cloud buckets.  
> * **Zero Egress Fee Asset Egress:** Video plates generated on Rig 2 stream directly up to Cloudflare R2 under immutable SHA-256 keys (plates/sha256\_{hash}.mp4). Rig 1 downloads these verified plates over Cloudflare R2's zero-egress bandwidth guarantee, preventing multi-gigabyte video transfers from congesting local workstation loopback networks or disrupting real-time audio playback during final optical assembly.

---

*User prompt: {{FOCUS: 2\. Ingress Contract & Somatic DSP Mapping}} /extreme-details*

### **Response: 1\. Canonical Ingress Architecture & Contract Validation**

audio-microservice does not parse unformatted screenplay text or .fountain files directly. Downstream presentation runtimes operate strictly on a machine-readable Abstract Syntax Tree (dialogue\_ast.json) compiled upstream by worker-sower-engine and validated at runtime on Rig 1 by worker-sower-conductor.

`SCREENPLAY / CANON LEDGER (State Sn)`  
                 `│`  
                 `▼`  
       `worker-sower-engine (Edge DO)`  
                 `│  • Constrained Decoding (llama.cpp GBNF / Temp 0)`  
                 `│  • Script & AST Demuxer`  
                 `▼`  
     `ephemeral/drafts/dialogue_ast.json`  
                 `│`  
                 `▼`  
      `produceEpisode.ts (Rig 1 POSIX Conductor)`  
                 `│  • Zod Contract Parsing (SceneASTSchema)`  
                 `│  • Cryptographic Root Seal Validation (H_root / is_dirty == 0)`  
                 `│  • Vocal-Motor Feasibility Gating (c.banned_kinetic_verbs)`  
                 `│  • Verbatim Script Parity Check (.fountain vs AST)`  
                 `▼`  
      `ttsClient.ts (:8000 Ingress Dispatch)`  
                 `│  • Injects Somatic DSP Modifiers & Character Voice Embeddings`  
                 `▼`  
      `audio-microservice (FastAPI Port 8000)`

#### **Runtime Zod Contract (src/types/narrative.ts)**

Before any network socket is opened or child process is spawned, the incoming AST is parsed through strict Zod schemas:

`import { z } from "zod";`

`export const DialogueLineSchema = z.object({`  
  `line_id: z.string(),`  
  `speaker: z.string(),`  
  `dialogue_text: z.string().min(1),`  
  `subtext: z.string().optional(),`  
  `conditions: z.array(z.string()).default([]),`  
  `emotion: z.string().optional(),`  
  `tonePacing: z.number().default(1.0),`  
  `motor_actions: z.array(z.string()).default([]),`  
  `reaction_cue: z.enum(["NONE", "VISCERAL_STING", "CALCULATION_HOLD"]).default("NONE"),`  
  `pacing_scalar: z.number().min(0.1).max(3.0).default(1.0),`  
  `dsp_modifiers: z.record(z.string(), z.number()).optional(),`  
  `foley_cues: z.array(z.string()).optional()`  
`}).strict();`

`export const SceneASTSchema = z.object({`  
  `sceneId: z.string().min(1),`  
  `episodeId: z.string().min(1),`  
  `lines: z.array(DialogueLineSchema)`  
`}).strict();`

`export type DialogueLine = z.infer<typeof DialogueLineSchema>;`  
`export type SceneAST = z.infer<typeof SceneASTSchema>;`

#### **Cryptographic State Lock & *T*0​ Invariant Enforcement**

> * **State Snapshot Hash (*H*root​):** The AST embeds a SHA-256 state snapshot seal anchoring the scene to the active relational database ledger (Cloudflare D1 / SQLite). If upstream canon facts mutated after the AST was drafted, the conductor marks the scene as dirty (is\_dirty \= 1\) and halts compilation immediately at zero GPU cost (*T*0​\=\$0.00).  
> * **Verbatim Text Parity:** An automated linter asserts that every character in the human-facing .fountain prose identically matches the dialogue\_text string in the AST. Downstream speech synthesis never hallucinates or rephrases dialogue; any manual text edit made outside the compiler pipeline aborts the build.  
> * **Vocal-Motor Hearsay Feasibility Gating:** Prior to microservice dispatch, an assertion validates physical vocalization capability:  
>   *c*.has\_verbal\_directives⟹"mute"∈/*c*.conditions∧"speak"∈/*c*.banned\_kinetic\_verbs  
>   If an entity with crushed laryngeal cartilage or a severed trachea is instructed to execute dialogue, the conductor raises a blocking VOCAL\_DELIVERY\_BREACH.

### **2\. Ingress Wire Protocol (ttsClient.ts to audio-microservice)**

Communication between the conductor runtime and audio-microservice is governed by a typed payload dispatched over HTTP POST to \[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate):

`// worker-sower-conductor: src/audio/ttsClient.ts`  
`export interface TTSGenerationRequest {`  
  `character: string;              // Unique character identifier (e.g., "char_020_the_pilot", "ELIAS")`  
  `text: string;                   // Verbatim phonetic dialogue string`  
  `emotion: string;                // Closed condition enum (e.g., "tense_jaw", "defensive")`  
  `tonePacing: number;             // Base pacing multiplier (default: 1.0)`  
  `dsp_modifiers: {`  
    `basePitchShiftSemitones?: number;    // Clamped [-12.0, 12.0] semitones`  
    `formantWarpingFactor?: number;       // Clamped [0.5, 2.0]`  
    `breathinessPauseMultiplier?: number; // Clamped [1.0, 3.5] (pulmonary trauma)`  
    `vocalFryDensity?: number;            // Clamped [0.0, 1.0]`  
    `pause_frequency_multiplier?: number; // Clamped [0.1, 3.0]`  
  `};`  
`}`

#### **Field-Level Wire Specifications**

| Payload Attribute | Type | Permitted Range | Architectural Function |
| :---- | :---- | :---- | :---- |
| character | string | Exact canonical ID | Resolves speaker identity to pinned reference voice embeddings in voices/active/. |
| text | string | ≥1 characters | Literal string synthesized into audio; verified downstream via STT alignment. |
| emotion | string | Closed enum | Conditions vocoder latent space and prosodic inflection contours. |
| tonePacing | float | 0.1 to 3.0 | Global phonetic duration scalar; adjusts baseline speaking rate. |
| dsp\_modifiers | object | Keyed floats | Low-level acoustic warping parameters derived from somatic biological trauma. |

#### **Outbound Network JSON Serialization**

`{`  
  `"character": "ELIAS",`  
  `"text": "The relay is dead. We move now.",`  
  `"emotion": "tense_jaw",`  
  `"tonePacing": 1.0,`  
  `"dsp_modifiers": {`  
    `"pause_frequency_multiplier": 1.4,`  
    `"breathinessPauseMultiplier": 2.2,`  
    `"basePitchShiftSemitones": -1.5,`  
    `"formantWarpingFactor": 0.95,`  
    `"vocalFryDensity": 0.35`  
  `}`  
`}`

### **3\. Somatic DSP Mapping Architecture**

The biological condition of an entity logged in the upstream state ledger directly conditions acoustic digital signal processing. Rather than relying on non-deterministic generative prompts, somatic trauma translates deterministically into acoustic filters:

`LEDGER SOMATIC RECORD (Cloudflare D1 / SQLite)`  
                    `│`  
                    `▼`  
     `SOMATIC VECTOR COMPILATION (Rig 1)`  
  `• Anatomical capability checks (ArmsAvailable, MobilityClass)`  
  `• Banned kinetic verbs & trauma flags`  
                    `│`  
                    `▼`  
     `ACOUSTIC DSP TRANSLATION MATRIX`  
                    `│`  
   `┌────────────────┴────────────────┐`  
   `▼                                 ▼`  
`PROSODIC CADENCE WARPING          FORMANT & SPECTRAL SHAPING`  
`• pause_frequency_multiplier      • basePitchShiftSemitones`  
`• breathinessPauseMultiplier      • formantWarpingFactor`  
`• bannedCadences filtering        • vocalFryDensity`  
                    `│`  
                    `▼`  
       `FastAPI Daemon Ingress (:8000/generate)`

#### **Somatic Trauma to Acoustic DSP Translation Matrix**

| Biological Condition / Trauma Vector | Injected DSP Parameters | Acoustic Manifestation & Signal Impact |
| :---- | :---- | :---- |
| **Stage-1 Pulmonary Fibrosis / Gas Inhalation Damage** | breathinessPauseMultiplier: 2.2 pause\_frequency\_multiplier: 1.4 | Caps spoken phrase length; forces sentences to terminate prematurely on hard consonants; injects micro-silence windows. |
| **Severe Hypothermia / Physiological Shock** | basePitchShiftSemitones: \+2.5 vocalFryDensity: 0.8 | Induces glottal instability, high-frequency vocal flutter, shivering pitch wobble, and irregular vocal fold adduction. |
| **Crushed Laryngeal Cartilage** | formantWarpingFactor: 0.7 basePitchShiftSemitones: \-4.0 | Severe acoustic formant scooping, resonant tract collapse, fundamental frequency (*F*0​) suppression, and unnatural pharyngeal damping. |
| **Severe Spinal Compression & Tremors (The Pilot)** | pause\_frequency\_multiplier: 1.4 basePitchShiftSemitones: \-2.0 breathinessPauseMultiplier: 1.8 | Low-register pitch drag, elevated diaphragmatic exhaustion, and spasmodic phrase segmentation. |

#### **Formal Acoustic Profile Interface (AcousticDSPProfile)**

`export interface AcousticDSPProfile {`  
  `basePitchShiftSemitones: number;    // -12.0 to 12.0 (Fundamental F0 modulation)`  
  `formantWarpingFactor: number;       // 0.5 to 2.0 (Vocal tract length/shape scaling)`  
  `breathinessPauseMultiplier: number; // 1.0 to 3.5 (Pulmonary damage caps maximum phrase length)`  
  `vocalFryDensity: number;            // 0.0 to 1.0 (Subharmonic low-frequency pulse injection)`  
  `bannedCadences: readonly string[];  // e.g., ["RAPID_STACCATO", "RISING_INFLECTION"]`  
`}`

> * **pause\_frequency\_multiplier & breathinessPauseMultiplier:** Governs breath cadence. At values \>1.0, the vocoder inserts breathing pauses between dependent clauses. A setting of 2.2 forces the speech synthesizer to truncate phrase arcs, breaking longer continuous lines into segmented, breathless vocal bursts.  
> * **basePitchShiftSemitones:** Modulates the fundamental frequency (*F*0​) by a signed semitone delta without changing temporal playback speed. Shock and shivering elevate pitch (+2.5), while structural throat trauma or exhaustion forces pitch downward (−4.0).  
> * **formantWarpingFactor:** Scales spectral formants (*F*1​,*F*2​,*F*3​) independently of pitch. Factors \<1.0 emulate an expanded or collapsed pharyngeal cavity (tubular, muffled tone), while factors \>1.0 compress the perceived vocal tract.  
> * **vocalFryDensity:** Injects a low-frequency, aperiodic glottal rattle at phrase terminations. Replicates phonation at minimal subglottal pressure, signaling physical depletion or advanced vocal cord fatigue.  
> * **bannedCadences:** Enforces prosodic exclusion filters. Entities suffering from pulmonary or laryngeal trauma cannot emit rhythmic structures such as "RAPID\_STACCATO" or energetic "RISING\_INFLECTION".

### **4\. Pressure Meter Engine Coupling & Basis-Point Dynamics**

Somatic DSP modifiers are not static constants; they are dynamically driven by the simulation's Unified Pressure Meter Engine. Stress and physical trauma are tracked as basis points (0 to 10,000 bp) within the staging ledger:

`export interface PressureMeter {`  
  `meter_id: string;`  
  `entity_id: string;`  
  `meter_type: 'SOMATIC_FATIGUE' | 'PHYSICAL_PAIN' | 'REFUSAL_STRAIN' | 'PARANOIA_CLOCK';`  
  `current_value: number;           // 0 to 10,000 bp`  
  `threshold_ceiling: number;       // e.g., 8,000 bp`  
  `decay_rate_per_day: number;      // Exponential half-life decay`  
  `post_break_state_mutation: {`  
    `target_refusal_vector_id: string;`  
    `new_behavior_directive: string;`  
    `banned_tokens_removed: string[];`  
  `} | null;`  
`}`

#### **Decoupled Pressure Domains & Acoustic Translation**

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   UNIFIED PRESSURE METER ENGINE                        │`  
`├──────────────────────┬──────────────────────┬──────────────────────────┤`  
`│ Meter Type           │ Dynamic Range (bp)   │ Signal & Kinetic Impact │`  
`├──────────────────────┼──────────────────────┼──────────────────────────┤`  
`│ SOMATIC_FATIGUE      │ 0 to 10,000 bp       │ Pacing drag: tonePacing  │`  
`│                      │                      │ reduced from 1.0 to 0.7; │`  
`│                      │                      │ elevates pause_frequency │`  
`├──────────────────────┼──────────────────────┼──────────────────────────┤`  
`│ PHYSICAL_PAIN        │ 0 to 10,000 bp       │ High pain injects vocal  │`  
`│                      │                      │ fry and visceral reflex  │`  
`│                      │                      │ holds into exposure sheet│`  
`├──────────────────────┼──────────────────────┼──────────────────────────┤`  
`│ REFUSAL_STRAIN       │ 0 to 10,000 bp       │ Psychological taboo load;│`  
`│                      │                      │ breaches trigger         │`  
`│                      │                      │ Post-Break State changes │`  
`├──────────────────────┼──────────────────────┼──────────────────────────┤`  
`│ PARANOIA_CLOCK       │ 0 to 10,000 bp       │ Epistemic dread; alters  │`  
`│                      │                      │ subharmonic pitch flutter│`  
`└──────────────────────┴──────────────────────┴──────────────────────────┘`

> * **Domain Isolation Invariant:** Physical fatigue is strictly decoupled from moral or ideological resistance. A character with 9,000 bp in SOMATIC\_FATIGUE will experience heavy vocal drag and labored breathing pauses, but their refusal boundaries remain firm.  
> * **Authored Inter-Meter Bridges:** Meters interact exclusively through explicit, authored bridge equations. For example, if an authored rule specifies:  
>   SOMATIC\_FATIGUE≥8,000 bp⟹Refusal Threshold×0.80  
>   the exhaustion lowers psychological resistance by 20%, reflecting systemic breakdown.  
> * **Post-Break State Mutations:** When current\_value \>= threshold\_ceiling, the entity trips a permanent post-break mutation in Cloudflare D1. This alters the character's allowable action vocabulary and modifies baseline DSP configurations (e.g., removing banned cadences or locking an elevated vocal fry density permanently).

### **5\. Swain Motivation-Reaction Units (MRUs) & Pre-Roll Acoustic Geometry**

Screenplay lines ingested by audio-microservice are structured around Dwight Swain’s Motivation-Reaction Unit (MRU) architecture:

Stimulus⟶Involuntary Reflex⟶Conscious Thought⟶Motor Action / Speech

The AST captures this progression through the reaction\_cue field within each dialogue line:

`reaction_cue: "NONE" | "VISCERAL_STING" | "CALCULATION_HOLD"`

`TIMELINE REACTION-CUE GEOMETRY (24 FPS)`

`Case A: reaction_cue = "NONE"`  
`┌────────────────────────────────────────────────────────┐`  
`│ Audio Stem: dialogue_sh001.wav                         │`  
`└────────────────────────────────────────────────────────┘`  
`▲`  
`Line Starts (Frame 0)`

`Case B: reaction_cue = "VISCERAL_STING"`  
`┌──────────────────────┬─────────────────────────────────┐`  
`│ Visual Pre-Roll Hold │ Audio Stem: dialogue_sh002.wav  │`  
`│ (12 to 24 Frames)    │ (Involuntary gasp/motor flinch) │`  
`└──────────────────────┴─────────────────────────────────┘`  
`▲                      ▲`  
`Action Stimulus        Speech Delivery Begins`

> * **VISCERAL\_STING Pre-Roll Padding:** When a line contains a VISCERAL\_STING directive, the conductor programmatically prepends an unvoiced temporal buffer of 12 to 24 frames (500 to 1000 ms) before audio mounting. This guarantees that visual reactions—such as a pupil dilation, flinch, or breath catch—rasterize prior to dialogue onset.  
> * **CALCULATION\_HOLD Pacing Multiplier:** Triggers an elongated pause before speech onset, temporarily scaling tonePacing and shifting sentence prosody downward to convey internal cognitive processing.  
> * **Shot Segmentation:** Although a dramatic beat may contain continuous dialogue, the presence of distinct MRU cues allows the conductor to split lines into discrete audio stems, mapping speech segments cleanly across distinct presentation camera angles (e.g., Speaker → Reaction Insert → Reverse Shot).

---

*User prompt: {{FOCUS: 3\. Output Delivery Contracts & Automated Verification Gates}} /extreme-details*

Response: The delivery contracts and verification gauntlets of audio-microservice govern the conversion of volatile neural text-to-speech inferences into immutable, broadcast-compliant acoustic stems. Because continuous audio serves as the non-negotiable master clock governing downstream video diffusion and optical compositing, all synthesized waveforms are subjected to physical signal inspections, transcript alignment gates, loudness normalization filters, and content-addressed cryptographic anchoring before timeline mounting.

### **1\. Acoustic Container & Stem Delivery Specifications**

Dialogue stems produced by audio-microservice adhere to strict physical format specifications to prevent sub-frame sample jitter and decoding drift:

> * **Linear PCM Encoding:** Stems are rendered as uncompressed, linear Pulse-Code Modulation (PCM) .wav files at a mandatory sampling rate of **48,000 Hz** (48 kHz) and a bit depth of **24-bit**. Downsampling, lossy MP3/AAC intermediate encoding, or variable sample rates are strictly prohibited.  
> * **Channel Configuration:** Synthesized dialogue lines are delivered as discrete mono or centered stereo stems. Spatialization, stereo widening, and reverb tails are decoupled from synthesis and managed downstream in assembly and composition.  
> * **File System Topology & Naming:** Stems are written to local NVMe scratch storage at public/audio/dialogue/\${sceneId}\_SH\${shotIndex}.wav. For enterprise packaging and IMF intake, naming conventions enforce standardized zero-padded paths (e.g., s02e19/sh0010/s02e19\_sh0010\_dialogue\_v001.wav) with a strict ASCII alphanumeric character set (\[a-zA-Z0-9.\_-\]).  
> * **POD-05 / POD-18 Inter-Pod Contracts:** In accordance with studio pod architecture, the Audio Pod (POD-05) writes exactly two immutable artifacts to shared object storage (Cloudflare R2): the master conformed .wav stem and a matching timecode map JSON. The Mastering & QC Pod (POD-18) reads these stems to certify compliance with network distribution profiles. Downstream pods (Assembly POD-10, Scene Pods) are strictly forbidden from mutating audio stems directly.  
> * **Discrete Stem Preservation Hierarchy:** The studio archives audio as separated functional layers rather than a single flattened master:  
  * **Track 1 (Dialogue):** Spoken dialogue stems conformed to absolute integer frame positions.  
  * **Track 2 (Foley Transients):** Spot sound effects triggered by narrative AST cues.  
  * **Track 3 (Continuous Ambient Bed & Music):** Room tone, continuous atmospheric soundscapes, and musical score.  
  * **Clean M\&E Track:** A dedicated Music & Effects master stem with dialogue completely isolated and stripped. Preserving discrete M\&E stems enables foreign-language dubbing (POD-17 Localization), accessibility audio descriptions, and format remastering without requiring visual re-generation.

### **2\. The Verification Gauntlet: Five Sequential Conformance Filters**

Every raw audio buffer emitted by the local FastAPI daemon on port 8000 passes through an automated five-stage verification pipeline executed by the Conductor on Rig 1:

`RAW TTS BUFFER (48 kHz / 24-bit WAV from Port 8000)`  
       `│`  
       `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ FILTER 1: SPEECH-TO-TEXT (STT) ALIGNMENT GATE                          │`  
`│ • Transcribes synthesized waveform via automated STT pass              │`  
`│ • Asserts character-for-character parity against dialogue_ast.json     │`  
`│ • Rejects on hallucinated phonemes, dropped tokens, or stuttering      │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass (Zero Discrepancy)`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ FILTER 2: PRE-CONFORM SPECTRAL HYGIENE                                 │`  
`│ • High-Pass Roll-Off: 24 dB/octave attenuation below 80–100 Hz         │`  
`│ • Optical De-Essing: Attenuates sibilance in the 6 kHz to 8 kHz band   │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass (Clean Spectrum)`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ FILTER 3: TWO-PASS LOUDNORM PASS (FFmpeg ebur128)                      │`  
`│ • Pass 1: Measure integrated loudness, LRA, and true peak              │`  
`│ • Pass 2: Normalize to delivery target (-16 LUFS Web / -24 LKFS ATSC)  │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass (Target Conformed)`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ FILTER 4: BRICKWALL TRUE-PEAK LIMITER                                  │`  
`│ • Inter-sample peak clamping strictly in dBTP (≤ -1.0 to -2.0 dBTP)    │`  
`│ • Sample peak (dBFS) is decoupled and disregarded for clipping safety  │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass (No Inter-Sample Overs)`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ FILTER 5: NOISE FLOOR GATE & CERTIFICATION                             │`  
`│ • Measures RMS baseline in unvoiced speech pauses                      │`  
`│ • Asserts noise floor remains strictly below -60 dBFS                  │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass (Exit 0)`  
                                   `▼`  
      `Committed to public/audio/dialogue/${sceneId}_SH${shotIndex}.wav`

#### **Filter 1: Speech-to-Text (STT) Verbatim Alignment Gate**

Neural TTS architectures occasionally drop trailing words, mispronounce technical tokens, stutter on plosives, or hallucinate non-lexical sounds.

> * **Transcription Verification:** An automated, local Speech-to-Text inference pass transcribes the generated audio file.  
> * **Parity Enforcement:** The transcription is normalized (stripping external whitespace and casing) and compared against the source dialogue\_text in dialogue\_ast.json.  
> * **Failure Interception:** If a word is omitted, swapped, or phonetically hallucinated, the Conductor aborts pipeline execution immediately, raising a STT\_ALIGNMENT\_BREACH. The stem is rejected before any GPU cycles are spent on downstream video diffusion plates.

#### **Filter 2: Pre-Conform Spectral Hygiene**

Raw vocal synthesis often carries mechanical artifacts, low-end proximity boom, and high-frequency sibilance that distort downstream dynamic sidechain envelopes:

> * **High-Pass Attenuation:** A 24 dB/octave high-pass filter rolls off low-frequency rumble below **80 Hz to 100 Hz**. This removes DC offsets, plosive thumps, and infrasonic energy that would falsely trigger dynamic ducking sensors.  
> * **Optical De-Essing:** A dedicated dynamic de-esser targets harsh sibilance in the **6 kHz to 8 kHz** band. It suppresses strident fricatives (s, z, sh), preventing high-frequency digital clipping during lossy delivery distribution encoding (AAC/Opus).

#### **Filter 3: Post-Mix Loudness Normalization (Two-Pass FFmpeg loudnorm)**

Audio compliance is an empirical property of the mixed output, not a theoretical guarantee provided by sidechain ducking depth.

> * **Mandatory Two-Pass Execution:** Single-pass normalization relies on dynamic compression estimates that cause audible pumping. The Conductor enforces a headless, two-pass FFmpeg loudnorm / ebur128 filter sequence:  
>   `# Pass 1: Measure integrated loudness, loudness range, and true peak`  
>   `ffmpeg -i raw_stem.wav -af loudnorm=I=-16:TP=-1.0:LRA=11:print_format=json -f null -`

>   `# Pass 2: Apply linear normalization using measured JSON metadata`  
>   `ffmpeg -i raw_stem.wav -af loudnorm=I=-16:TP=-1.0:LRA=11:measured_I=-19.2:measured_TP=-0.4:measured_LRA=8.1:measured_thresh=-29.5:linear=true conformed_stem.wav`

> * **Measurement Logging:** Detailed loudness statistics are captured via ffmpeg \-af ebur128=framelog=verbose to generate an audit log for QC certification.

#### **Filter 4: Brickwall True-Peak Limiter & Unit Discipline**

> * **The True-Peak Ceiling:** To prevent inter-sample clipping when uncompressed PCM audio is reconstructed by consumer digital-to-analog converters (DACs), stems pass through a brickwall limiter enforcing a ceiling of **≤−1.0 dBTP** (or **−2.0 dBTP** for linear broadcast).  
> * **Unit Discipline Invariant:** Sample peak in decibels relative to full scale (**dBFS**) must never be conflated with True-Peak (**dBTP**). A signal measuring −0.5 dBFS may exceed \+1.5 dBTP during inter-sample interpolation, causing distortion. The gate verifies and clamps true-peak exclusively in dBTP.

#### **Filter 5: Acoustic Noise Floor Certification**

> * **Unvoiced RMS Threshold:** All unvoiced intervals (pre-roll silences, intra-phrase pauses, post-roll buffers) are swept using an RMS window to verify that baseline noise levels remain strictly below **−60 dBFS**.  
> * **Anti-Pumping Protection:** When downstream sidechain gain automation releases from a −14 dB dialogue duck back to 0 dB unity gain, any residual ambient noise floor higher than −60 dBFS would swell into an audible hiss, destroying audio clarity. Stems failing this noise ceiling are rejected.

### **3\. Multi-Channel Distribution Profiles & Compliance Matrix**

The compilation engine does not hardcode a single static loudness constant (e.g., MASTER\_LOUDNESS \= \-16). Delivery standards are encapsulated in versioned configuration profiles to satisfy distinct platform specifications:

| Delivery Profile Target | Governing Standard | Integrated Loudness Target | Permitted Tolerance | True-Peak Ceiling (dBTP) | Primary Distribution Channel |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **WEB\_STREAMING** | Platform Specs | **−16.0 LUFS** (or −14.0 LUFS) | ±1.0 LUFS | ≤−1.0 dBTP | YouTube, Web Player, Podcasts |
| **BROADCAST\_US** | ATSC A/85 (2026 Revision) | **−24.0 LKFS** | ±1.0 LKFS | ≤−2.0 dBTP | Linear US Television, Cable |
| **BROADCAST\_EBU** | EBU R128 | **−23.0 LUFS** | ±1.0 LUFS | ≤−1.0 dBTP | European Terrestrial & Satellite |
| **ARCHIVAL\_MEZZANINE** | Studio IMF Spec | **Uncompressed Mix** | Dynamic Range Intact | ≤−1.0 dBTP | ProRes 4444 Master / Cold CAS |

### **4\. The Master Clock: Temporal Quantization & Integer Anchoring**

Because visual diffusion networks possess no intrinsic sense of biological pacing, the physical duration of the synthesized audio file establishes the master timeline for the entire project.

`AUDIO DOMAIN (Sample-Accurate Physical Clock: 48,000 samples/sec)`  
`│`  
`├─ duration_ms = 3,120.00 ms (measured via POSIX ffprobe)`  
`└─ Integer sample count = 149,760 samples`  
`│`  
`▼ Quantization Projection: target_frames = ceil((3120 / 1000) * 24) = ceil(74.88) = 75 frames`  
`VIDEO DOMAIN (Discrete Video Clock: 24 frames/sec)`  
`│`  
`├─ Total Shot Duration: 75 frames (3,125.00 ms)`  
`└─ Fractional Tail Slack: 5.00 ms (0.12 frames of digital silence padding)`

#### **Observation vs. Derivation Decoupling**

To ensure that changing distribution formats does not invalidate cached audio stems, the pipeline permanently decouples physical measurement from frame derivation:

> * **Empirical Observation (*D*ms​):** The physical waveform duration in milliseconds (*D*ms​) is extracted directly from the .wav header using POSIX ffprobe:  
>   `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 stem.wav`

> * **Discrete Derivation (target\_frames):** Downstream video frame budgets are derived using integer ceiling quantization at 24 fps:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉  
>   *Worked Example:* A dialogue stem measuring 3,120 ms resolves to:  
>   ⌈10003120​×24⌉\=⌈74.88⌉=75 frames (3,125 ms)  
> * **Format Agnosticism:** Both *D*ms​ and target\_frames are stored in separate, immutable fields in exposure\_sheet.json. If the distribution deliverable transitions from 24 fps to 30 fps or 60 fps, frame counts are re-derived from *D*ms​ without requiring neural audio re-synthesis.

#### **The Rounding Tail Hazard & Absolute Integer Anchoring**

> * **The Concatenation Trap:** Because ceiling quantization rounds upward to whole frames, it introduces fractional tail slack (e.g., 0.12 frames=5.0 ms of trailing silence) per shot boundary. Concatenating audio stems end-to-end linearly compounds these fractional tails; across a 100-shot episode, this introduces up to **4.17 seconds** of cumulative sync drift against continuous background beds, Foley hits, and visual cuts.  
> * **Absolute Timeline Formulation:** To mathematically bound timing error, the Conductor eliminates relative concatenation by mounting every dialogue stem at an absolute timeline frame coordinate evaluated at compile time:  
>   fromFrame*k*​\=*i*\=1∑*k*−1​total\_shot\_frames*i*​  
>   Every audio stem is anchored to the cumulative timeline frame budget rather than the end of the preceding audio buffer, bounding total episode sync drift to less than one frame across hours of footage.

### **5\. Multi-Track Gain Automation & Acoustic Unit Consistency**

Once verified stems are mounted on Track 1, dynamic mixing is executed via deterministic mathematical envelopes rather than unpredictable, reactive compressors:

`Track 1: Spoken Dialogue Stems (Mounted at Absolute Integer Frames via ffprobe)`  
         `[--------- Shot 01 (75 frames) ---------]          [--------- Shot 02 (90 frames) ---------]`  
`Track 2: Foley Transients (Mulberry32 PRNG Seeded)`  
                `[*metal_siphon_clink*]                             [*mud_boot_squelch*]`  
`Track 3: Continuous Ambient Bed & Music (Programmatic Sidechain Envelope)`  
`1.0 ────┐                                       ┌────────┐                                       ┌──── (V_base = 0.40)`  
        `│                                       │        │                                       │`  
`0.08    └───────────────────────────────────────┘        └───────────────────────────────────────┘     (V_duck = 0.08)`  
          `^ Attack (6f)          Release (12f) ^           ^ Attack (6f)          Release (12f) ^`  
          `Ducking Floor: -14 dB                            Ducking Floor: -14 dB`

#### **Programmatic Gain Automation Math**

Dynamic sidechain attenuation operates as a timeline-keyed mathematical envelope evaluated inside Remotion composition TSX:

> * **Attack & Release Geometry:** When a dialogue window begins (*f*start​), background ambient and music beds attenuate by **−14 dB** across an authored 6-frame quadratic attack (*A*\=6, ≈250 ms). The attenuation holds across the speech window and recovers to unity over a 12-frame quadratic release (*R*\=12, ≈500 ms) whenever a pause between dialogue lines exceeds 12 frames (\[BEAT\] nodes).  
> * **Deterministic Volume Interpolation Function:**  
>   *V*(*f*)=⎩⎨⎧​*V*base​,interpolate(*f*,\[*f*start​−*A*,*f*start​\],\[*V*base​,*V*duck​\],Easing.quadOut),*V*duck​(−14 dB),interpolate(*f*,\[*f*end​,*f*end​\+*R*\],\[*V*duck​,*V*base​\],Easing.quadIn),*V*base​,​*f*\<*f*start​−*Af*start​−*A*≤*f*\<*f*start​*f*start​≤*f*≤*f*end​*f*end​\<*f*≤*f*end​\+*Rf*\>*f*end​\+*R*​  
>   Where ducked gain evaluates as:  
>   Gainducked​\=1020−14 dB​×*V*base​≈0.1995×0.40≈0.0798

#### **Strict Centi-Decibels (cdB) Unit Discipline**

To prevent systematic floating-point rounding drift across Node.js, Python, and C++ audio libraries, all acoustic thresholds and calculations evaluate strictly in integer **centi-decibels** (cdB), where 1 dB=100 cdB and 120 dB=12,000 cdB:

> * **Dual-Condition Audibility Formulation:** Sound arrival is audible if and only if it clears both the actor's absolute hearing threshold (*T*hearing​) and the ambient room noise floor (*N*ambient​) by a minimum Signal-to-Noise Ratio (SNRmin​, typically 600 cdB=6 dB):  
>   isAudible(*v*)⟺*I*arrival​(*v*)≥*T*hearing​∧*I*arrival​(*v*)−*N*ambient​(*v*)≥SNRmin​  
> * **Normalized Auditory Quality Score:** Audibility quality is derived as a normalized per-mille integer score (0 to 1000):  
>   *Q*auditory​\=clamp(⌊*I*ref​−(*N*ambient​\+SNRmin​)(*I*arrival​−(*N*ambient​\+SNRmin​))×1000​⌋,0,1000)  
>   This discrete score determines whether dialogue arrives cleanly (*Q*≥700), ambiguously muffled, or inaudible.

#### **Deterministic Foley Lexical Extraction & Mulberry32 Seeding**

Action cues and sound production notes in the AST are extracted and resolved against a dual-output lexical registry (FOLEY\_REGISTRY) that pairs narrative physical nouns with audio sample assets:

> * **Asset Mapping:** Concrete nouns map directly to sample keys (e.g., ITEM\_SILVER\_SPOON → foley/metal\_spoon\_clink\_01.wav, TERRAIN\_SWAMP → foley/mud\_boot\_squelch\_02.wav).  
> * **Deterministic Mulberry32 PRNG:** Standard Math.random() is banned across distributed rendering workers. Sample selection is resolved using a deterministic Mulberry32 PRNG seeded via a 32-bit MurmurHash3 string hash:  
>   Seed=MurmurHash3(sceneId+":"+shotId+":"+sampleKey)  
> * **Anti-Clustering Salt (:retry):** If the PRNG draws a sample variant that matches the take used in the immediately preceding shot, an anti-clustering salt (:retry) is appended to the seed to force a re-roll, avoiding acoustic repetition across cuts.  
> * **Source-Baking into TSX Props:** Resolved sample file paths are written as literal strings into generated TSX props (src={staticFile("audio/footstep\_02.wav")}), ensuring zero runtime PRNG evaluation during headless Remotion rendering.

### **6\. Cryptographic Provenance, Immutability & Failure Routing**

Rendered audio stems cannot be re-derived bit-for-bit from prompt seeds due to non-deterministic CUDA floating-point math and vocoder runtime variations. Consequently, synthesized .wav files are treated as immutable historical evidence rather than ephemeral cache entries.

#### **The Content-Addressed Stem Invariant**

> * **Acoustic Stem Immutability:** Once a .wav stem passes the verification gauntlet, its SHA-256 digest is calculated and the binary is sealed in public/audio/dialogue/.  
> * **Strict Re-Synthesis Prohibition:** Video rendering runtimes and visual compositing pipelines are strictly forbidden from re-triggering speech synthesis APIs during visual generation passes. This protects the exposure sheet against sub-frame duration drift or viseme misalignment.

#### **The Provenance DAG & Sidecar Manifest (render\_manifest.json)**

Every promoted stem is permanently sealed into an immutable Directed Acyclic Graph (DAG) recorded in render\_manifest.json:

`{`  
  `"build_id": "sha256:4f8a1209bc87e5d...",`  
  `"episode_id": "EP040",`  
  `"generated_at": "2026-09-28T15:44:00Z",`  
  `"source_target": "Episode_040.tsx",`  
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
  `"runtime_environment": {`  
    `"node_version": "v20.12.0",`  
    `"remotion_version": "4.0.140",`  
    `"chromium_milestone": "122.0.6261.94",`  
    `"ffmpeg_build": "6.1.1-static"`  
  `}`  
`}`

> * **Backward Auditability:** Allows any inspector to trace from a delivered MP4 frame back through its exposure sheet, audio stem SHA-256, AST beat, narrative state transition, and originating Git commit.  
> * **Forward Blast Radius Calculation:** If an upstream narrative fact or character voice recipe is modified, a recursive DAG sweep identifies every downstream audio stem rendered dirty (is\_dirty \= 1), scheduling only the invalidated nodes for re-compilation.

#### **Ingestion Error Taxonomy & Failure Routing**

To prevent corrupted or non-conforming stems from contaminating downstream visual diffusion, audio-microservice enforces three strict failure paths:

| Error Class | Example Trigger | Pipeline Action & Response | Compute Cost Impact |
| :---- | :---- | :---- | :---- |
| **Deterministic Failures** | Zod schema validation error, verbatim text mismatch against screenplay, or missing dialogue text. | **Immediate Fatal Halt (Exit 1).** Processing terminates immediately; error coordinates logged. | **\$0.00**; execution halts before GPU diffusion or FFmpeg encoding runs. |
| **Stochastic Failures** | Synthesized stem contains an audible pop, clipped waveform, dropped word, or fails the integrated −16 LUFS gate. | **Bounded Retry (Max 2).** Microservice re-synthesizes the failing line with an altered PRNG seed. | Negligible; re-runs a single local CPU audio pass. |
| **Infrastructure Failures** | Transient file lock contention, partial disk write, or POSIX rename failure during stem save. | **Idempotent Resume.** Resumes ingestion from the last verified temporary file using its staging descriptor. | Zero state loss; preserves pipeline integrity. |

#### **3-2-1 Archival Policy & Append-Only Errata Protocol**

> * **3-2-1 Cold Preservation:** Conformed audio stems are archived across three distinct tiers: local NVMe scratch on Rig 1, warm object storage in Cloudflare R2, and geographically isolated cold storage (AWS Glacier or Backblaze B2) with object locking enabled.  
> * **Append-Only Errata:** If a narrative error is discovered after an episode has been broadcast, historical audio stems and manifests are never overwritten or deleted. Canon dossiers are corrected via Git commit (producing a new *H*root​), and a formal record is appended to lore/errata.json. Any subsequent remaster produces a new content-addressed file under the revised commit hash, preserving both the original broadcast history and the remaster byte-identical in cold storage.

---

*User prompt: {{FOCUS: 4\. The Master Clock & Quantization Bridge}} /extreme-details*

Response: audio-microservice serves as the non-negotiable physical timebase and master pacemaker for the entire production pipeline. Because generative video diffusion backends possess no innate biological or conversational cadence, the continuous acoustic duration of synthesized speech establishes the physical master clock that downstream video generation, visual plate cutting, and Remotion optical timeline compositing must rigidly conform to.

Bridging continuous physical sound and discrete digital video requires resolving fundamental tensions between continuous sample arrays, rational video framerates, generative neural latent downsampling lattices (4*n*\+1), and cumulative sub-frame rounding drift.

### **1\. The Dual-Domain Clock Architecture**

To prevent sub-frame phase cancellation, audio-visual rubber-banding, and visual cut jitter, the compilation runtime bifurcates temporal tracking into two synchronized domains:

`AUDIO DOMAIN (Continuous Audio Precision Clock: 48,000 samples/sec)`  
  `│`  
  `├─ Phoneme & Viseme Onset Markers (Sample Offset: S = 26,742)`  
  `├─ Seeded Punctual Foley Impacts (Mulberry32 PRNG Transients)`  
  `└─ Continuous Programmatic Ducking Envelopes (-14 dB Speech Windows)`  
  `│`  
  `▼ Projection Ratio: S = F * (48,000 / 24) = F * 2,000 audio samples/frame`  
`VIDEO DOMAIN (Master Media Clock: 24 integer frames/sec)`  
  `│`  
  `├─ Total Shot Duration Budget (target_frames = ceil(D_ms * 24 / 1000))`  
  `├─ Discrete Visual Cut Boundaries (Remotion <Sequence> timeline mounts)`  
  `└─ ComfyUI Latent Diffusion Frame Allocations (4n + 1 lattice conformance)`

#### **Domain Decoupling & Resolution Mapping**

> * **Audio Precision Clock (Acoustic Truth):** Operates at an invariant sampling frequency of **48,000 Hz** (48,000 integer samples per second). It governs sample-accurate physical events, such as sub-millisecond acoustic transients, phoneme onsets, viseme mouth positions, and continuous ducking attenuation envelopes.  
> * **Master Media Clock (Visual Cut Authority):** Operates on discrete integer video frames locked to **24.0 fps**. At 24 fps, the duration of a single video frame is:  
>   Δ*t*frame​\=241​ s≈41.6667 ms  
> * **The Constant Projection Factor:** The mathematical ratio bridging the Audio Precision Clock to the Master Media Clock simplifies to an exact integer factor:  
>   24 frames/sec48,000 samples/sec​\=2,000 audio samples per video frame  
> * **Sample-to-Frame Mapping:** The absolute sample coordinate *S* corresponding to any video frame *F* is calculated as:  
>   *S*\=*F*×2,000  
>   Conversely, any acoustic event, phoneme marker, or Foley hit detected at sample index *S* maps to the nearest enclosing video frame via integer division:  
>   *F*\=⌊2,000*S*​⌋  
>   *Worked Example:* A sharp consonant or transient plosive detected at sample offset *S*\=26,742 projects to video frame:  
>   *F*\=⌊2,00026,742​⌋\=Frame 13  
>   While the visual cut or mouth viseme is assigned to Frame 13, the audio stem plays back with 48 kHz sample precision, eliminating perceived lip-sync lag or acoustic phasing artifacts.

### **2\. Observation vs. Derivation Decoupling & Pure Integer Arithmetic**

To prevent hardcoded delivery formats from corrupting canonical production assets, the runtime enforces a strict boundary between empirical measurement and downstream presentation derivations:

`Approved Screenplay AST`  
           `│`  
           `▼`  
`Local Speech Synthesis (:8000) ──► Uncompressed PCM .wav Buffer`  
                                           `│`  
                                           `▼`  
                                `POSIX ffprobe Inspection`  
                                           `│`  
                                           `▼`  
                               `duration_ms (Empirical Observation)`  
                                           `│`  
         `┌─────────────────────────────────┴─────────────────────────────────┐`  
         `▼                                                                   ▼`  
`target_frames = ceil((D_ms / 1000) * 24)                           target_frames = ceil((D_ms / 1000) * 30)`  
`(24 fps Cinema Master Derivation)                                  (30 fps Broadcast Derivation)`

#### **The IEEE 754 Floating-Point Hazard**

Evaluating frame budgets using standard floating-point operations introduces platform-dependent representation discrepancies. Because decimal durations cannot always be represented exactly in IEEE 754 binary floating-point numbers, multiplying floating-point durations by frame rates can yield numbers such as 74.00000000000001. Applying a ceiling function to that value produces 75 frames instead of the intended 74, silently corrupting frame budgets across operating systems.

#### **The Pure Integer-Time Formulation**

To guarantee deterministic results across all hosts, operating systems, and worker runtimes, frame quantization is evaluated using pure integer arithmetic:

Let *x*\=*D*ms​×delivery\_fps (an exact integer product):

target\_frames=⌊1000*x*\+999​⌋\=⌊1000(*D*ms​×delivery\_fps)+999​⌋

*Worked Verification:* For an audio take with a duration of *D*ms​\=3,120 ms at 24 fps:

*x*\=3,120×24=74,880  
target\_frames=⌊100074,880+999​⌋\=⌊100075,879​⌋\=75 frames

#### **Rational Framerate Representation**

To support non-integer drop-frame standards (such as NTSC 23.976 fps) without accumulating fractional rounding drift, frame rates are formalized as exact rational numbers *p*/*q*:

FPS=*qp*​

For 23.976 fps, the rate is expressed as 1,00124,000​. The integer ceiling quantization formula generalizes to:

target\_frames=⌊1000×*q*(*D*ms​×*p*)+(1000×*q*−1)​⌋

### **3\. The Sub-Frame Trap, Zero-Length Interval Clamp & Tail Slack**

When synthesizing short vocalizations, clipped syllables, or non-verbal grunts (*"Hmph"*, *"Ha"*), the measured audio duration may be shorter than the span of a single video frame (*D*ms​\<41.67 ms).

#### **The Inverted Interval Collapse**

In naive timeline systems where intervals are bounded by:

StartFrame=⌈*a*⌉,EndFrame=⌈*b*⌉−1

If an event is shorter than one frame, then ⌈*a*⌉=⌈*b*⌉, which collapses into:

EndFrame=StartFrame−1⟹FrameBudget\<1

This negative-length interval invalidates sequencing graphs, causing Remotion's layout parser and timeline renderers to throw fatal unhandled exceptions.

#### **Compiler Clamping & State Hygiene**

To prevent inverted timeline crashes, src/audio/ffprobeQuantizer.ts enforces an automated duration clamp:

`// Compiler interval guard in src/audio/ffprobeQuantizer.ts`  
`const targetFrames = Math.max(1, Math.floor(((durationMs * deliveryFps) + 999) / 1000));`

`SUB-FRAME CLAMPING WORKFLOW`  
`Raw Audio Buffer (e.g., 30 ms) ──► Measured < 41.67 ms (Single frame threshold)`  
                                           `│`  
                                           `▼`  
                                 `targetFrames Clamped to 1`  
                                           `│`  
                                           `▼`  
                      `Audio Buffer Padded with Digital Silence to 42 ms`  
                                           `│`  
                                           `▼`  
               `Padded Duration (42 ms) Recorded into Cumulative State Ledger`

> 1. **Mandatory 1-Frame Allocation:** Every speech track receives a minimum allocation of 1 frame (41.67 ms at 24 fps).  
> 2. **Digital Silence Tail Padding:** If the raw .wav stem duration is shorter than 41.67 ms (or 42 ms), the engine pads the tail of the audio buffer with digital silence up to the 1-frame boundary.  
> 3. **Padded Duration State Hygiene:** Because duration drives cumulative timeline positioning, the *padded duration* (42 ms)—not the sub-frame raw measurement—is recorded in the active ledger. This prevents discrepancies between physical audio duration and timeline frame budgets.  
> 4. **Neighbor Merging Fallback:** If an isolated vocalization cannot be padded without acoustic artifacting, the compiler merges the token into the adjacent dialogue window. Under no circumstances may an exposure sheet emit an entry with FrameBudget\<1.

#### **Tail-Slack Budgeting**

For an audio stem measuring 3,120.50 ms, ceiling quantization assigns 75 frames, which represents exactly 3,125.00 ms of video time. The resulting delta of 4.50 ms (0.108 frames) represents tail slack. Rather than truncating audio or stretching video latents, the compiler absorbs this delta into the shot's natural decay padding, ensuring dialogue decays naturally without clipping at visual cuts.

### **4\. The Anti-Drift Calculus: Generation Budget vs. Master Timeline Placement**

A primary source of drift in automated video assembly is relative timeline chaining (e.g., setting shot\[*k*\].start=shot\[*k*−1\].end).

#### **The Rounding Accumulation Defect**

Because ceiling quantization rounds upward to whole frames, it introduces up to 41.67 ms of silence padding per shot.

> * Summing rounded per-line ceilings (∑⌈*Di*​×24⌉) compounds this error linearly.  
> * Across a 12-line scene, fractional tail padding inflates the timeline by 6 to 12 frames (250 to 500 ms).  
> * Across an 80-to-100 shot episode, naive chaining causes dialogue to drift out of sync with continuous background music beds and visual cuts by up to 3 to 4 seconds.

`RELATIVE CHAINING (ERROR ACCUMULATION - DRIFTS > 3 SECONDS)`  
`Shot 1 (ceil) ──► Pad (+20ms) ──► Shot 2 (ceil) ──► Pad (+35ms) ──► Shot 3 (ceil) ──► Pad (+15ms) ...`  
`[Cumulative drift inflates linearly with cut count]`

`CUMULATIVE QUANTIZATION (ZERO-DRIFT TILING - ERROR BOUNDED < 1 FRAME)`  
`Line 1 [D1] ──► Line 2 [D1 + D2] ──► Line 3 [D1 + D2 + D3]`  
      `│                   │                        │`  
      `▼ Quantize Once     ▼ Quantize Once          ▼ Quantize Once`  
`Start_1 / End_1     Start_2 / End_2          Start_3 / End_3`  
`(End_k + 1 ≡ Start_k+1: Perfectly contiguous, bounded drift < 41.7 ms across entire episode)`

#### **Cumulative-Millisecond Formulation & Proof of Contiguity**

To eliminate cumulative timing drift, master timeline placement is derived from a running cumulative millisecond sum quantized once:

StartFrame*k*​\=⌈1000∑*i*\=1*k*−1​*Di*​​×FPS⌉  
EndFrame*k*​\=⌈1000∑*i*\=1*k*​*Di*​​×FPS⌉−1

Evaluating the start frame of the immediately subsequent shot (*k*\+1):

StartFrame*k*\+1​\=⌈1000∑*i*\=1*k*​*Di*​​×FPS⌉

Subtracting the end frame of the preceding shot (*k*):

StartFrame*k*\+1​−EndFrame*k*​\=⌈1000∑*i*\=1*k*​*Di*​​×FPS⌉−(⌈1000∑*i*\=1*k*​*Di*​​×FPS⌉−1)\=1  
⟹EndFramek​\+1\=StartFramek\+1​

Because EndFrame*k*​\+1≡StartFrame*k*\+1​, consecutive lines tile the master timeline with zero gaps and zero overlaps. Cumulative timing drift relative to true elapsed audio time is mathematically bounded to less than one frame (\<41.67 ms) across an entire episode, regardless of cut count.

#### **Empirical Monte-Carlo Drift Bounds**

Simulations comparing per-line ceiling accumulation against cumulative quantization demonstrate this divergence (20,000 trials, line durations uniform over 300 to 4,000 ms):

| Lines in Scene | Per-Line Ceiling: Mean Drift / Max (Frames) | Cumulative Quantization: Mean Drift / Max (Frames) |
| :---- | :---- | :---- |
| **1** | 0.50 / 1.00 frames | **0.50 / 1.00 frames** |
| **6** | 3.00 / 5.38 frames | **0.50 / 1.00 frames** |
| **12** | 6.01 / 10.09 frames | **0.50 / 1.00 frames** |
| **24** | 11.97 / 17.06 frames (\~0.71 s) | **0.50 / 1.00 frames** |

#### **The Operational Division of Labor**

The pipeline resolves the operational tension between local plate generation and master timeline placement through a clear separation of concerns:

> * **Per-Shot Generation Budgets:** Use the local ceiling rule when dispatching jobs to GPU diffusion workers:  
>   Framesgen​\=4⌈4⌈*D*sec​×FPSnative​⌉−1​⌉\+1  
>   This guarantees that rendered visual plates never underrun spoken audio.  
> * **Master Timeline Placement:** Uses cumulative millisecond quantization to precompute absolute cut offsets in Remotion:  
>   TimelineOffset*K*​\=⌈(*i*\=1∑*K*​DurationMs*i*​)×1000FPSmaster​​⌉  
> * **Tail Margin Trimming:** The excess frames generated by local ceiling rules are trimmed from the tail of each shot before the next shot's start frame, eliminating cumulative frame-drift across scenes.

### **5\. Diffusion Latent Lattices (4*n*\+1) & Temporal Resampling**

Video diffusion architectures (e.g., Wan 2.1, Wan 2.2) utilize 3D causal Variational Autoencoders (VAEs) with temporal downsampling factors that require frame counts to satisfy a 4*n*\+1 mathematical sequence (17,21,25,33,49,65,81,…). Backend adapters isolate these model-specific requirements to keep the core master timeline agnostic to hardware quirks.

`Master Timeline (Locked 24.0 fps Timebase Clock)`  
                       `│`  
                       `▼`  
            `Model Backend Adapter`  
                       `│`  
        `┌──────────────┼──────────────┐`  
        `▼              ▼              ▼`  
  `Config A       Config B       Config C`  
 `(12 fps Twos)  (24 fps Match) (16 fps Optical Flow)`

#### **The Three Temporal Configurations (Worked Comparison for *D*ms​\=3,120 ms)**

`CONFIGURATION A: NATIVE 12 FPS ("ON TWOS" — ZERO JUDDER)`  
`Acoustic Clock: 3,120 ms ──► Raw Native: 38f ──► 4n+1 Lattice: 41f (3.4167 s)`  
`Diffusion Plate (12 fps): [ F01 ][ F02 ][ F03 ] ... [ F41 ]`  
`Remotion Conformance:     Duplicate 1:2 ──► 82 frames at 24 fps`  
`Master Trim:              Trim last 7 frames ──► Pinned 75 frames at 24 fps`

`CONFIGURATION B: NATIVE 24 FPS (DIRECT IDENTITY MATCH)`  
`Acoustic Clock: 3,120 ms ──► Master Budget: 75f ──► 4n+1 Lattice: 77f (3.2083 s)`  
`Diffusion Plate (24 fps): Generates 77 frames directly`  
`Master Trim:              Trim last 2 frames ──► Pinned 75 frames at 24 fps`

`CONFIGURATION C: NATIVE 16 FPS (OPTICAL FLOW / RIFE INTERPOLATION)`  
`Acoustic Clock: 3,120 ms ──► Raw Native: 50f ──► 4n+1 Lattice: 53f`  
`Diffusion Plate (16 fps): Truncate 3 padding frames ──► Exactly 50 native frames (3.125 s)`  
`Optical Flow Engine:      Resample 16 fps ──► 24 fps via motion vectors ──► 75 frames`

> * **Configuration A (Native 12 fps Animated "On Twos"):**  
  1. Master 24 fps budget: ⌈3.120×24⌉=75 frames (3.125 s).  
  2. Native 12 fps raw requirement: ⌈3.120×12⌉=38 frames.  
  3. 4*n*\+1 Conformance: *n*\=⌈(38−1)/4⌉=10⟹4(10)+1=41 native frames (3.4167 s).  
  4. Compositing resample: Each frame is held for two 24 fps ticks (1:2 duplication →82 frames).  
  5. Tail trim: The 7 excess frames (82−75) are trimmed at the cut boundary. Produces uniform 2:2 frame cadence with zero pulldown judder.  
> * **Configuration B (Native 24 fps Direct Master Match):**  
  1. Master 24 fps budget: 75 frames.  
  2. 4*n*\+1 Conformance: *n*\=⌈(75−1)/4⌉=19⟹4(19)+1=77 native frames (3.2083 s).  
  3. Compositing trim: The 2 excess tail frames (77−75) are trimmed during assembly. Valid only if the model checkpoint was natively trained at 24 fps.  
> * **Configuration C (Native 16 fps via Optical Flow):**  
  1. Direct 16-to-24 fps playback creates an uneven 1.5× pulldown (alternating 2:1 frame holds) that introduces severe motion judder.  
  2. Native 16 fps raw requirement: ⌈3.120×16⌉=50 frames.  
  3. 4*n*\+1 Conformance: *n*\=⌈49/4⌉=13⟹4(13)+1=53 native frames.  
  4. Tail trim: 3 excess padding frames are trimmed to isolate exactly 50 native frames (3.125 s).  
  5. Temporal retiming: RIFE optical flow interpolates 50 frames at 16 fps into 75 frames at 24 fps, avoiding judder.

#### **The 4*n*\+1 Sawtooth Waste Cost Model (scripts/audit-frame-waste.ts)**

Because the 4*n*\+1 lattice operates as a step function, frame waste follows a periodic sawtooth pattern:

`Native Frames Generated`  
 `45 ┌─────────────────────────────────────────────────────────────┐`  
    `│                                                       /|    │`  
 `41 │                                           ┌──────────/ │    │`  
    `│                                           │  n = 10 /  │    │`  
 `37 │                             ┌─────────────┘        /   │    │`  
    `│                             │   n = 9             /    │    │`  
 `33 │               ┌─────────────┘                    /     │    │`  
    `│               │   n = 8                         /      │    │`  
    `└───────────────┴────────────────────────────────┴───────┴────┴─► Raw Frames Needed`  
                    `33            37                 38      41`

> * A shot requiring 38 raw native frames forces the generator to step up to *n*\=10, producing 41 frames and wasting 3 native frames (a 7.9% compute penalty).  
> * If the raw requirement was 37 frames, *n*\=9 would generate exactly 37 frames (4×9+1), wasting 0 frames.  
> * **Pre-Flight Compute Audit:** scripts/audit-frame-waste.ts analyzes dialogue durations before dispatching jobs to Rig 2\. When a shot falls on an inefficient peak of the sawtooth, the tool flags the optimization opportunity:*"Shot 04 wastes 3 native frames. Tightening line pause by 62ms reduces n from 10 to 9, saving 12% GPU compute."*

### **6\. Programmatic Acoustic Assembly & Timeline Automation**

Audio assembly in Episode\_XXX.tsx partitions audio into three discrete functional lanes, driven by programmatic gain automation envelopes rather than reactive DSP compressors:

`Track 1: Spoken Dialogue Stems (Master Clock — Fixed Duration PCM WAV)`  
         `[--------- Shot 01 (75f) ---------]          [--------- Shot 02 (90f) ---------]`  
`Track 2: Foley Transients (Seeded PRNG Mulberry32)`  
                `[*metal_siphon_clink*]                             [*mud_boot_squelch*]`  
`Track 3: Continuous Ambient Bed & Music (Programmatic Gain Automation)`  
`1.0 ────┐                                       ┌────────┐                                       ┌──── (V_base = 0.40)`  
        `│                                       │        │                                       │`  
`0.08    └───────────────────────────────────────┘        └───────────────────────────────────────┘     (V_duck = 0.08)`  
          `^ Attack (6f)          Release (12f) ^           ^ Attack (6f)          Release (12f) ^`  
          `Ducking Floor: -14 dB                            Ducking Floor: -14 dB`

#### **Programmatic Gain Automation Math (AmbientTrack.tsx)**

During speech playback, background ambient beds and musical score stems attenuate by **−14 dB**:

*V*duck​\=*V*base​×1020−14 dB​≈0.40×0.1995≈0.0798

Gain curves evaluate across four discrete phases using quadratic easing:

> * **Attack Phase (*A*\=6 frames≈250 ms):** Quadratic out easing dips volume before speech begins.  
> * **Active Speech Window (*f*start​≤*f*≤*f*end​):** Volume is held at the ducked floor (*V*duck​\=0.08).  
> * **Release Phase (*R*\=12 frames≈500 ms):** Quadratic in easing restores the ambient bed to baseline volume.  
> * **Narrative Silences:** In profiles where musical score is suppressed, deliberate dramatic pauses attenuate beds by **−24 dB**.

*V*(*f*)=⎩⎨⎧​*V*base​,interpolate(*f*,\[*f*start​−6,*f*start​\],\[*V*base​,*V*duck​\],Easing.out(Easing.quad)),*V*duck​(−14 dB),interpolate(*f*,\[*f*end​,*f*end​\+12\],\[*V*duck​,*V*base​\],Easing.in(Easing.quad)),*V*base​,​*f*\<*f*start​−6*f*start​−6≤*f*\<*f*start​*f*start​≤*f*≤*f*end​*f*end​\<*f*≤*f*end​\+12*f*\>*f*end​\+12​

#### **The Multi-Window Minimum Reducer (Anti-Pumping Architecture)**

In naive implementations that break on the first matching dialogue window, pauses between sentences cause the background volume to ramp up during release and immediately dip on the next attack, producing audible volume pumping:

`// AmbientTrack.tsx: Minimum-composed multi-window sidechain ducking`  
`export const calculateDuckedGain = (`  
  `frame: number,`  
  `baseVolume: number,`  
  `attenuationDb: number,`  
  `windows: Array<{ from: number; to: number }>,`  
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
    `// Union composition across all windows eliminates volume pumping`  
    `minGain = Math.min(minGain, windowGain);`  
  `}`

  `return minGain;`  
`};`

Taking the mathematical minimum across all active envelopes guarantees that if two spoken lines are separated by a gap shorter than the combined release-and-attack duration, the background bed remains held at the −14 dB floor without pumping.

#### **Strict Centi-Decibels (cdB) Unit Discipline**

To prevent systematic floating-point rounding drift across audio libraries, internal acoustic parameters evaluate strictly in integer **centi-decibels** (cdB), where 0 dB=0 cdB and 120 dB=12,000 cdB:

> * Audibility checks verify that:  
>   *I*arrival​≥*T*hearing​∧*I*arrival​−*N*ambient​≥SNRmin​  
> * Auditory quality is derived as a normalized per-mille integer score (0 to 1000):  
>   *Q*auditory​\=clamp(⌊*I*ref​−(*N*ambient​\+SNRmin​)(*I*arrival​−(*N*ambient​\+SNRmin​))×1000​⌋,0,1000)

#### **Dwight Swain Motivation-Reaction Units (MRUs) & Pre-Roll Geometry**

The compiler enforces chronological storytelling order based on Dwight Swain's Motivation-Reaction Unit (MRU): **Stimulus → Reflex → Calculation → Action/Speech**.

`MRU TIMELINE BUFFER GEOMETRY`  
`┌──────────────────────────────┬──────────────────────────────┬──────────────────────────────┐`  
`│ pre_roll_frames (12–24 f)    │ audio_frames (75 f)          │ post_roll_frames (8–16 f)    │`  
`│ Visceral sting / eye saccade │ Active spoken dialogue       │ Natural physical decay       │`  
`└──────────────────────────────┴──────────────────────────────┴──────────────────────────────┘`  
`▲                              ▲                              ▲`  
`Stimulus Occurs                Speech Begins                  Speech Ends / Cut Holds`

> * When dialogue\_ast.json flags a cognitive shock (reaction\_cue: "VISCERAL\_STING"), the compiler inserts a **12-to-24 frame visual pre-roll buffer** before dialogue mounts.  
> * In exposure\_sheet.json, pre\_roll\_frames and post\_roll\_frames are stored separately from audio\_frames:  
>   total\_shot\_frames*i*​\=pre\_roll\_frames*i*​\+audio\_frames*i*​\+post\_roll\_frames*i*​  
> * Isolating pre-roll and post-roll frames allows editorial pacing adjustments without invalidating the underlying speech synthesis measurements.

---

*User prompt: {{FOCUS: 5\. Reference Voice Management & Storage Hierarchy}} /extreme-details*

Response: Reference voice assets in audio-microservice represent immutable production configuration rather than ephemeral cache, functioning as the acoustic ground truth for character identity across multi-episode lifecycles. Because neural text-to-speech models and vocoders are susceptible to latent timbre drift, speaker bleed, and acoustic degeneration over hundreds of unattended inference calls, character voices are governed by a two-tier storage hierarchy, explicit legal clearance boundaries, and cryptographic manifest anchoring.

### **1\. Physical Storage Hierarchy & Directory Topology**

The file structure within audio-microservice/voices/ isolates the active runtime references consumed by the local FastAPI daemon from the append-only historical archive:

`audio-microservice/`  
`├── voices/`  
`│   ├── active/`  
`│   │   ├── bog.wav                  # Pointer/symlink to active version (consumed by FastAPI)[cite: 1]`  
`│   │   ├── spleen.wav               # Points to /voices/versions/spleen_v1.wav[cite: 1]`  
`│   │   └── pilot.wav                # Points to /voices/versions/pilot_v3.wav[cite: 1]`  
`│   ├── versions/`  
`│   │   ├── bog_v1.wav               # Baseline reference take (pinned; never mutated/deleted)[cite: 1]`  
`│   │   ├── bog_v2.wav               # Superseded reference (retained for regression audits)[cite: 1]`  
`│   │   ├── spleen_v1.wav            # Initial reference master[cite: 1]`  
`│   │   ├── pilot_v1.wav             # Deprecated early take[cite: 1]`  
`│   │   ├── pilot_v2.wav             # Intermediate reference[cite: 1]`  
`│   │   └── pilot_v3.wav             # Current certified production take[cite: 1]`  
`│   ├── voice_manifest.json          # Cryptographic inventory, speaker mappings & DSP seeds[cite: 1]`  
`│   └── CHANGELOG.md                 # Human-readable rationale for reference updates[cite: 1]`  
`├── engines/                         # Model execution wrappers (Parler-TTS, Chatterbox, CosyVoice, Piper)[cite: 8, 35]`  
`├── server.py                        # FastAPI application listening on port 8000[cite: 1, 8]`  
`└── tests/                           # Conformance, duration reporting, and acoustic tests[cite: 8, 25]`

> * **/voices/active/ (The Floating Runtime Rail):** Contains normalized, standardized .wav files named strictly after canonical character identifiers. These files are filesystem symlinks or mirrored copies pointing directly to a specific tagged binary in /voices/versions/. The FastAPI inference routes (POST /generate) read exclusively from this directory, ensuring runtime client contracts do not require updating when a character reference is revved.  
> * **/voices/versions/ (The Append-Only Historical Vault):** Houses every iteration of every reference voice ever promoted to production. Files adhere to a strict semantic versioning format (\${characterId}\_v\${versionNumber}.wav). Deleting, overwriting, or modifying any file in this directory is prohibited by continuous integration lint rules.  
> * **CHANGELOG.md:** Documents the narrative and technical justification for each version bump, detailing performer changes, microphone upgrades, or stylistic alterations.

### **2\. The Two-Tier Pointer Architecture & Drift Defense**

Audio synthesis is the stage of the multi-modal compiler most exposed to generative content drift. Over long series runs, gradual model updates or unchecked reference substitutions alter vocal resonance, accent contours, and perceived character age.

`PROMOTION LIFECYCLE & POINTER SEPARATION`

`[ Studio Record / POD-04 Reference ]`  
                 `│`  
                 `▼`  
  `Acoustic Conformance Gate (Filter 1–5)`  
                 `│`  
                 `▼`  
  `Commit to /voices/versions/bog_v2.wav  ──► (Append-only; Permanent Immutable Target)[cite: 1]`  
                 `│`  
                 `▼`  
  `Update voice_manifest.json             ──► (Recalculate SHA-256 & Update Recipe)[cite: 1, 17]`  
                 `│`  
                 `▼`  
  `Atomically Repoint Symlink:`  
  `/voices/active/bog.wav ───────────────► Points to bog_v2.wav[cite: 1]`

> * **Convenience vs. Reproducibility:** The two-tier model resolves the tension between operational ergonomics and historical auditability. Active development targets a predictable path (voices/active/bog.wav), while the underlying engine pins every generated episode to the immutable versioned file (voices/versions/bog\_v2.wav).  
> * **Separation of Shape Validation and Content Validation:** Syntactic checks in the pipeline verify that an audio buffer contains valid 48 kHz PCM samples conforming to schema shapes. Semantic checks evaluate whether the generated voice accurately matches character identity. Conflating structural schema compliance with acoustic identity compliance allows content drift to escape detection.  
> * **Preservation for Historical Audits:** Because previous episodes were synthesized against specific historical vocal references, reproducing or re-mastering an earlier scene requires access to the exact checkpoint and reference take used at that broadcast tick. Retaining superseded reference files in /voices/versions/ ensures legacy builds remain reconstructible without forced migration to newer vocal profiles.

### **3\. The Audio Recipe Book Contract & Inter-Pod Clearance Pipeline**

Reference voice files do not operate in isolation; they are tightly bound to multi-repo contracts spanning the Talent & Casting Pod (POD-04), the Legal & Provenance Pod (POD-01), the Audio Pod (POD-05), and the central series bible.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ POD-04: TALENT & CASTING (Voice Licensing & Capture)                   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Negotiates union SAG-AFTRA agreements for digital voice synthesis    │[cite: 22]`  
`│ • Captures clean studio reference takes under POD-05 capture specs     │[cite: 22]`  
`│ • Ingestion Gate: Cleared package (WAV + explicit use boundaries)      │[cite: 22]`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Cross-Pod Verification[cite: 22]`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ POD-01: LEGAL, PROVENANCE & CLEARANCE                                  │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Validates chain of title, performer consent, and scope of use       │[cite: 22]`  
`│ • Restricts synthesis strictly to licensed media channels              │[cite: 22]`  
`│ • Prohibits downstream pods from reinterpreting or expanding scope     │[cite: 22]`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Certified Cleared Package[cite: 22]`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ POD-05: AUDIO POD (Audio & Dialogue Lab)                               │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Writes conformed audio to /voices/versions/ and updates active link  │[cite: 1]`  
`│ • Binds reference audio to the formal Audio Recipe Book                │[cite: 17, 46]`  
`│ • Emits master stems and timecode maps to shared object storage (R2)   │[cite: 8, 35]`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **The Audio Recipe Book Fields**

To eliminate the gap where voice audio exists without the instructions needed to recreate the performance, every reference profile in audio-microservice requires three generative baseline parameters:

> 1. **TTS Model Used:** The specific model architecture, checkpoint version, and quantization variant (e.g., Parler-TTS-v0.1-Mini, Chatterbox-Base-FP16, CosyVoice-300M).  
> 2. **Voice Clone / Speaker ID:** The unique performer seed, reference file hash, or speaker vector embedding used to condition the vocoder latent space.  
> 3. **Pacing / Pitch Modifiers:** Default baseline vocal adjustments assigned to the character's neutral state (e.g., \-15% speed, \+5% breathiness for Branksi; a specific gravelly drawl parameter array for Billie Fae).

#### **Pod Boundaries & Downstream Invariants**

> * **Formal Input Contracts:** POD-08 (Narrative) provides character persona dossiers, emotional baselines, and casting requirements. POD-05 (Audio) dictates technical recording specifications to ensure incoming material integrates cleanly with neural synthesis models.  
> * **Global Read / Local Write:** Casting discussions and unconfirmed auditions remain private working state within POD-04. Once signed and recorded, POD-04 commits the cleared package immutably to the shared registry. Downstream pods (POD-05 Audio, POD-17 Localization, POD-07 Foundation) have read access but are structurally forbidden from re-interpreting or expanding use scopes. Any expansion (e.g., promotional teasers or multilingual dubs) requires formal renegotiation and an updated clearance record.

### **4\. Schema & DAG Linkage of voice\_manifest.json**

The operational state of the voice library is governed by voice\_manifest.json, mirroring the multi-repository manifest conventions found across the visual and narrative domains:

`{`  
  `"schema_version": "2.1.0",`  
  `"generated_at": "2026-09-28T19:30:00Z",`  
  `"canon_commit_sha": "git:9c3e401",`  
  `"voices": {`  
    `"char_bog": {`  
      `"display_name": "Bog",`  
      `"active_version": "v2",`  
      `"versions": {`  
        `"v1": {`  
          `"file_path": "voices/versions/bog_v1.wav",`  
          `"sha256": "4a8c9e2b10a5e8f1d3c5e7b9a2c4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0",`  
          `"duration_ms": 12450.0,`  
          `"sample_rate_hz": 48000,`  
          `"channels": 1,`  
          `"bit_depth": 24,`  
          `"integrated_lufs": -16.1,`  
          `"true_peak_dbtp": -1.2,`  
          `"performer_consent_id": "SAG-AFTRA-2026-00412",`  
          `"recipe": {`  
            `"tts_model": "Parler-TTS-v0.1-Mini",`  
            `"speaker_id": "bog_performer_seed_904",`  
            `"base_modifiers": {`  
              `"speed_scalar": 0.85,`  
              `"breathiness_scalar": 1.05,`  
              `"vocal_fry": 0.10`  
            `}`  
          `}`  
        `},`  
        `"v2": {`  
          `"file_path": "voices/versions/bog_v2.wav",`  
          `"sha256": "7b3e1c9d2f4a5e6b8a0c2d4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e",`  
          `"duration_ms": 15200.0,`  
          `"sample_rate_hz": 48000,`  
          `"channels": 1,`  
          `"bit_depth": 24,`  
          `"integrated_lufs": -16.0,`  
          `"true_peak_dbtp": -1.0,`  
          `"performer_consent_id": "SAG-AFTRA-2026-00412-EXT",`  
          `"recipe": {`  
            `"tts_model": "Chatterbox-Base-FP16",`  
            `"speaker_id": "bog_studio_rec_2026_09",`  
            `"base_modifiers": {`  
              `"speed_scalar": 0.85,`  
              `"breathiness_scalar": 1.15,`  
              `"vocal_fry": 0.25`  
            `}`  
          `}`  
        `}`  
      `}`  
    `}`  
  `}`  
`}`

#### **Transitive Dependency Hashing & Blast Radius Analysis**

voice\_manifest.json anchors directly into the production fleet's Directed Acyclic Graph (DAG) recorded in render\_manifest.json and the root versions.json:

`UNIVERSAL PROVENANCE GRAPH (render_manifest.json)`  
`[ MASTER COMPOSITE MP4 ]`  
       `│`  
       `▼`  
`[ Episode_XXX.tsx Assembly ]`  
       `│`  
       `├─► Exposure Sheet (Frame Budgets)[cite: 15]`  
       `│         │`  
       `│         ▼`  
       `├─► Synthesized WAV Stems (48 kHz PCM)[cite: 8, 15]`  
       `│         │`  
       `│         ▼`  
       `└─► voice_manifest.json (Voice Reference & Recipe Hash)[cite: 1, 15]`  
                 `│`  
                 `▼`  
           `Git Canon Commit ($H_{root}$)[cite: 4, 15]`

> * **Backward Auditability:** A reviewer inspecting an anomalous phoneme inflection in Episode 40 traces the output frame back to its exposure sheet, the synthesized stem SHA-256, the voice\_manifest.json version tag (v2), and the legal clearance certificate (SAG-AFTRA-2026-00412-EXT).  
> * **Forward Blast Radius Calculation (*R*blast​):** If an actor's reference take is updated in /voices/versions/ and the active symlink is repointed, the compiler calculates the transitive reachability of the character identity:  
>   *R*blast​(*v*)=*n*∣I(*v*)∣​  
>   Scenes featuring that character are flagged as dirty (is\_dirty \= 1), scheduling re-synthesis and downstream optical compositing while isolating unaffected scenes from unnecessary re-renders.

### **5\. Acoustic Ingestion Hygiene & Certification Gauntlet**

Raw vocal captures submitted by POD-04 cannot be mounted directly into /voices/versions/. They must pass five sequential pre-flight digital signal processing checks to ensure compatibility with neural vocoders:

`RAW ACTOR RECORDING (POD-04 Studio Take)`  
                 `│`  
                 `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STEP 1: SIGNAL FORMAT & BIT-DEPTH VERIFICATION                         │`  
`│ • Asserts uncompressed Linear PCM WAV container                       │[cite: 8]`  
`│ • Sample rate must equal exactly 48,000 Hz; bit depth exactly 24-bit    │[cite: 8, 14]`  
`│ • Channel count clamped to mono (single-channel source)                │[cite: 5]`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STEP 2: INFRASONIC & SPECTRAL DE-NOISING                               │`  
`│ • 24 dB/octave high-pass filter applied below 80 Hz                    │[cite: 6, 12]`  
`│ • Dynamic spectral notch suppression to remove microphone resonance    │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STEP 3: ANECHOIC NOISE FLOOR CERTIFICATION                             │`  
`│ • Measures RMS baseline across 500 ms unvoiced intervals               │[cite: 5]`  
`│ • Fails if baseline noise exceeds -60 dBFS                             │[cite: 5, 8]`  
`│ • Confirms zero room reflections or reverb tails in reference capture  │[cite: 22]`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STEP 4: TWO-PASS EBU R128 LOUDNORM NORMALIZATION                       │`  
`│ • Targets reference integrated loudness: -16.0 LUFS (±0.5 LUFS)        │[cite: 8]`  
`│ • Clamps maximum True-Peak strictly to -1.0 dBTP                       │[cite: 8]`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STEP 5: EMBEDDING EXTRACTION & COSINE STABILITY AUDIT                  │`  
`│ • Synthesizes 5 calibration sentences using target TTS model           │`  
`│ • Computes speaker embedding vector: E_synth                           │`  
`│ • Asserts CosineSimilarity(E_synth, E_ref) ≥ 0.92                      │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Certified Pass`  
                                   `▼`  
        `Promoted to /voices/versions/${char}_v${next}.wav[cite: 1]`

> * **Noise Floor Ceilings:** If reference audio contains ambient HVAC hum, preamp hiss, or room reflection above **−60 dBFS**, neural vocoders will encode the noise into the character's latent representation, causing audible hiss across all future synthesized lines.  
> * **Cosine Similarity Gating:** Before a new reference version is committed to the manifest, the microservice generates five standardized calibration phoneme sentences. The resulting waveforms are passed through a speaker recognition feature extractor. If the cosine similarity between the synthesized sample vectors and the reference take falls below 0.92, the take is rejected for vocal instability.

### **6\. Archival Classification, 3-2-1 Preservation & Errata Protocols**

Under the studio's Deletion Principle, reference voices fall into an explicit durability class requiring rigorous data preservation:

| Durability Class | System Artifacts | Source of Truth? | Reproducibility & Recovery Mandate |
| :---- | :---- | :---- | :---- |
| **Class 1: Fully Derivable** | Relational state, dependency DAGs, scene plans. | **No** (Derived) | Rebuilt deterministically by re-running compilation and folding the event log over base canon. |
| **Class 2: Irreplaceable Event Log** | events.jsonl, duel resolution, narrative logs. | **Yes** | Append-only event sequence; secured via Write-Ahead Logging and hash chains. |
| **Class 3: Archive-Dependent Evidence** | Diffusion video plates, synthesized dialogue stems, **reference voice .wav files**. | **Yes** *(as evidence)* | **Cannot be regenerated bit-for-bit from seeds alone** due to GPU floating-point non-determinism and vocoder library variations. Requires permanent content-addressed storage. |

#### **3-2-1 Backup Implementation**

Because reference voices represent irreplaceable Class 3 evidence, their storage follows a strict 3-2-1 backup topology:

> * **3 Physical Copies:** Retained across three independent environments: Rig 1 local NVMe scratch (audio-microservice/voices/versions/), Cloudflare R2 warm object storage (r2://studio-archive/voices/), and cold cloud storage.  
> * **2 Media Types:** Distributed across local solid-state storage (NVMe PCIe 4.0) and distributed cloud block/object infrastructure.  
> * **1 Independent Offsite / Vendor Isolation:** The cold archival tier resides in AWS S3 Glacier Flexible Deep Archive or Backblaze B2, completely separated from the primary Cloudflare account to defend against single-vendor account termination or credential revocation.  
> * **WORM Object Locking:** Buckets in the archival tier enforce Write-Once-Read-Many (WORM) compliance with strict multi-year legal hold retention, preventing accidental administrative deletion.

#### **Integrity Scrubbing & Cold Restore Drills**

> * **Rolling Range Cursor Scrubbing:** Rather than using randomized probabilistic sampling (which leaves up to 36.8% of assets unchecked over extended periods due to *e*−1 statistical limits), an automated background scrubber uses a deterministic, hash-ordered cursor to verify cryptographic SHA-256 digests across 100% of archived voice assets every 30 days.  
> * **Scheduled Cold Restore Drills:** On the 15th of every month, an automated verification agent isolates a past episode build, purges local voice caches, restores the versioned reference takes from cold storage, and verifies that the synthesized output stems match historical audio waveforms within certified tolerances.

#### **Append-Only Errata Protocol (lore/errata.json)**

Modifying or replacing reference files in place breaks content addressing and violates provenance auditability. If a voice reference is found to carry defective phase issues or licensing limitations after an episode has aired:

> 1. The historical file (bog\_v1.wav) remains permanently preserved and byte-identical in cold storage.  
> 2. The revised audio file is committed under a new version tag (bog\_v2.wav).  
> 3. A formal entry is appended to lore/errata.json recording the affected commit SHAs, the superseded file digest, the replacement file digest, and the authoring justification.  
> 4. Any remastered episode release is compiled under a distinct build ID referencing the updated Git commit hash (*H*root​), preserving both the historical broadcast artifact and the remastered deliverable side by side.

---

*User prompt: how is this going to handle voices for different series*

Response: To handle vocal identities across multiple creative universes (such as the domestic goblin world of under-the-floorboards versus the biopunk noir of wiregrass-basin) without cross-contamination or drift, audio-microservice employs **series-scoped namespace isolation, multi-engine routing, series-specific phonetic lexicons, and strict legal rights firewalls**.

Because audio-microservice acts as a shared, warm daemon on Rig 1 (port 8000\) serving the entire studio fleet, it abstracts voice execution using the series parameterization established in the "Quintet" multi-repository topology:

### **1\. Series-Scoped Directory Topology & Storage Partitioning**

To avoid global namespace collisions (e.g., two different series featuring a character named "The Pilot" or "Spleen") and prevent massive Git LFS bloat across disparate shows, the storage hierarchy is partitioned at the top level by series\_slug (matching series.config.json):

`audio-microservice/`  
`├── voices/`  
`│   ├── under-the-floorboards/             # Series Slug A (Goblin Universe)`  
`│   │   ├── active/`  
`│   │   │   ├── bog.wav                    # Symlink -> versions/bog_v2.wav`  
`│   │   │   └── spleen.wav                 # Symlink -> versions/spleen_v1.wav`  
`│   │   ├── versions/`  
`│   │   │   ├── bog_v1.wav`  
`│   │   │   └── bog_v2.wav`  
`│   │   ├── lexicon.json                   # Goblin dialect & invented noun phonetics`  
`│   │   └── voice_manifest.json            # Cryptographic hashes, actor IDs, & recipes`  
`│   │`  
`│   ├── wiregrass-basin/                   # Series Slug B (Southern Gothic Noir)`  
`│   │   ├── active/`  
`│   │   │   ├── the_pilot.wav              # Symlink -> versions/the_pilot_v3.wav`  
`│   │   │   └── billie_fae.wav             # Symlink -> versions/billie_fae_v1.wav`  
`│   │   ├── versions/`  
`│   │   │   ├── the_pilot_v1.wav`  
`│   │   │   ├── the_pilot_v2.wav`  
`│   │   │   └── the_pilot_v3.wav`  
`│   │   ├── lexicon.json                   # Industrial solvent & dialect phonetics`  
`│   │   └── voice_manifest.json`  
`│   │`  
`│   └── deep-space-salvage/                # Series Slug C (Hard Sci-Fi)`  
`│       └── ...`  
`├── server.py                              # FastAPI routing core (:8000)`  
`└── engines/                               # Shared neural runtime wrappers`

> * **Isolation Invariant:** Voice assets for Series B are never placed in the directory of Series A. If an artist or automated runner clones or updates assets for a single series, they only touch the relevant series partition.  
> * **Two-Tier Versioning Per Series:** Every story world maintains its own independent /active/ floating pointers and /versions/ append-only historical vault. Updating Bog’s reference take in under-the-floorboards has zero blast radius on the assets of wiregrass-basin.

### **2\. Ingress Wire Protocol & Dynamic Series Routing**

When upstream simulation conductors (e.g., worker-sower-engine or wiregrass-engine) dispatch requests to audio-microservice, the ingress JSON contract explicitly passes the series\_id alongside the character identifier:

`// Updated TTS Client Payload (worker-sower-conductor / wiregrass-conductor)`  
`export interface TTSGenerationRequest {`  
  `series_id: string;               // e.g., "under-the-floorboards", "wiregrass-basin"`  
  `character: string;               // Character identifier within that series`  
  `text: string;                    // Verbatim dialogue line`  
  `emotion: string;                 // Emotional condition enum`  
  `tonePacing: number;              // Pacing scalar`  
  `dsp_modifiers: Record<string, number>;`  
`}`

#### **FastAPI Dispatch Logic**

`# server.py (audio-microservice)`  
`@app.post("/generate")`  
`async def generate_speech(request: TTSGenerationRequest):`  
    `series_dir = Path("voices") / request.series_id`  
    `if not series_dir.exists():`  
        `raise HTTPException(status_code=404, detail=f"Series '{request.series_id}' not found.")`  
      
    `# Load the series-specific manifest`  
    `manifest_path = series_dir / "voice_manifest.json"`  
    `manifest = json.loads(manifest_path.read_text())`  
      
    `char_entry = manifest.get(request.character)`  
    `if not char_entry:`  
        `raise HTTPException(status_code=404, detail=f"Character '{request.character}' missing in series manifest.")`

    `# Route to engine and reference specified by the series recipe`  
    `active_ref = series_dir / "active" / f"{request.character}.wav"`  
    `return await execute_synthesis(char_entry["recipe"], active_ref, request)`

### **3\. The Audio Recipe Book & Multi-Engine Multiplexing**

Different series operate across different aesthetic registers and require different underlying neural engines:

> * **under-the-floorboards (Cartoon Melodrama):** May use faster, lighter engines (such as Piper or a specialized Parler-TTS model) paired with formant-preserved upward pitch shifting (+3 to +4 semitones) to create distinct creature timbres.  
> * **wiregrass-basin (Cinematic Noir):** Demands high-fidelity diffusion-based acoustic models (e.g., CosyVoice, Chatterbox-Base, or XTTSv2) capable of rendering low-register gravel, breath leakage, and subtle dramatic pauses.

The voice\_manifest.json within each series directory specifies the exact engine backend and baseline acoustic profile for each character:

`{`  
  `"the_pilot": {`  
    `"active_version": "v3",`  
    `"file": "versions/the_pilot_v3.wav",`  
    `"recipe": {`  
      `"tts_engine": "CosyVoice-300M",`  
      `"model_checkpoint": "cosyvoice_v1.2_fp16",`  
      `"speaker_embedding_id": "spk_pilot_noir_01",`  
      `"base_dsp_modifiers": {`  
        `"basePitchShiftSemitones": -2.0,`  
        `"formantWarpingFactor": 0.92,`  
        `"breathinessPauseMultiplier": 1.8`  
      `}`  
    `}`  
  `}`  
`}`

When the request arrives, audio-microservice routes the task to the engine declared in that series’ recipe book without forcing all shows into a single model architecture.

### **4\. Series-Specific Pronunciation Dictionaries (lexicon.json)**

Neural TTS systems mispronounce invented words, proprietary tech jargon, and idiosyncratic dialect spellings. Because each series develops its own vocabulary, audio-microservice enforces a per-series Grapheme-to-Phoneme (G2P) replacement pass prior to synthesis:

> * **Goblin Slapstick:** Words like "siphon", "Snerk", or "Mum Grissel" map to phonetic stress tags ("SAI-fun", "SNERK").  
> * **Southern Gothic Noir:** Words like "culvert", "Gallbreaker", or dialect contractions like "d'you" require specific regional cadence and phonetic overrides.

Before passing text to the neural vocoder, the microservice replaces unvetted tokens using the series-local voices/\<series\_slug\>/lexicon.json.

### **5\. Talent Licensing, POD-04 Boundaries & Cross-Series Firewalls**

The studio's institutional architecture enforces strict legal and operational boundaries around voice identity:

| Governance Dimension | Policy & Hard Invariant | Governing Pods |
| :---- | :---- | :---- |
| **Cross-Series Borrowing** | **Strictly Forbidden.** A voice reference cleared for an actor in Series A cannot be used to voice a character in Series B, even as temp audio. | POD-04 (Talent & Casting) POD-01 (Legal & Provenance) |
| **Contract Scoping** | Every reference voice package must contain an unambiguous union-compliant license (e.g., SAG-AFTRA AI Digital Voice Rider) scoped explicitly to the series slug and character name. | POD-04 (Talent & Casting) |
| **Multilingual Dubs** | If a foreign-language dub is produced (POD-17), dub synthesis cannot reuse the actor's primary voice reference without a formal contract addendum cleared by Talent & Casting. | POD-17 (Localization) POD-04 (Talent & Casting) |

If a generation request specifies a character whose underlying contract does not contain verified clearance for that series\_id, the microservice halts with a LEGAL\_CLEARANCE\_BREACH.

### **6\. Meta-Repo Coordination & Immutable Provenance**

In the studio's coordination architecture, each series maintains its own root project repository (goblin-project, wiregrass-project) that pins dependencies via versions.json:

`// wiregrass-project/versions.json`  
`{`  
  `"series_slug": "wiregrass-basin",`  
  `"repos": {`  
    `"wiregrass-lore": { "commit": "9c10bb4", "ref": "v1.0.0" },`  
    `"wiregrass-engine": { "commit": "a4f8e21", "ref": "main" },`  
    `"wiregrass-assets": { "commit": "f018bc9", "ref": "v1.2.0" },`  
    `"audio-microservice": {`   
      `"commit": "3b2e7a1",`   
      `"series_manifest_hash": "sha256:7f3b89a4e..."`   
    `}`  
  `}`  
`}`

> * **Manifest Pinning:** The meta-repo tracks the specific SHA-256 digest of that series' voice\_manifest.json.  
> * **Bake-Time Freezing:** When an episode is compiled into goblin-episodes/ or wiregrass-episodes/, its immutable render\_manifest.json logs the exact hashes of the .wav reference takes and recipes used.  
> * **Independent Series Evolution:** A complete overhaul of character voices in wiregrass-basin updates only wiregrass-project/versions.json. The git history, asset manifests, and compilation pipelines of under-the-floorboards remain clean, untouched, and fully reproducible decades later.

---

*User prompt: {{FOCUS: 3\. The Audio Recipe Book & Multi-Engine Multiplexing}} /extreme-details*

Response: The **Audio Recipe Book & Multi-Engine Multiplexing** architecture within audio-microservice resolves a fundamental vulnerability in generative audio engineering: the epistemic gap between static audio waveforms and generative instructions. A captured .wav stem or isolated speaker embedding is incapable of reproducing an acting performance on its own. Without formalizing the neural engine architecture, the exact checkpoint weights, the latent conditioning prompt, the base digital signal processing (DSP) offsets, and the grapheme-to-phoneme (G2P) dialect overrides into an immutable machine contract, character vocal identity collapses into drift across long production runs.

Under the studio's institutional governance, this subsystem implements the operational mandate of **POD-05: Audio & Dialogue Lab** (Macro-Node 02: Blueprint). It functions as a warm, hardware-isolated daemon on Rig 1 (port 8000\) that multiplexes disparate speech synthesis backends (such as CosyVoice, Chatterbox, Parler-TTS, Kokoro, and Piper) behind a unified, polymorphic execution API.

### **1\. The Epistemological Triad of Voice Identity**

A character's acoustic identity is formalized not as a single file, but as an irreducible triad of generative specifications:

                     `┌────────────────────────────────────────┐`  
                     `│          CHARACTER ACOUSTIC IDENTITY   │`  
                     `└───────────────────┬────────────────────┘`  
                                         `│`  
         `┌───────────────────────────────┼───────────────────────────────┐`  
         `▼                               ▼                               ▼`  
`┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐`  
`│   1. MODEL CHECKPOINT  │  │   2. SPEAKER EMBEDDING │  │   3. BASELINE DSP      │`  
`│   & ENGINE ADAPTER     │  │   & CONDITIONING TOKEN │  │   PARAMETER VECTOR     │`  
`├────────────────────────┤  ├────────────────────────┤  ├────────────────────────┤`  
`│ • Engine Runtime Enum  │  │ • Pinned Reference WAV │  │ • Fundamental Pitch F0 │`  
`│ • Checkpoint Git SHA   │  │ • Speaker Vector (.pt) │  │ • Formant Warping (W)  │`  
`│ • Quantization (FP16/  │  │ • Latent Description   │  │ • Breathiness Scalar   │`  
`│   INT8 / ONNX)         │  │   Prompt (Parler-TTS)  │  │ • Vocal Fry Density    │`  
`└────────────────────────┘  └────────────────────────┘  └────────────────────────┘`

> 1. **The Engine Architecture & Weights Lock:** Coupling acoustic identity strictly to proprietary cloud APIs (e.g., ElevenLabs) or unpinned open weights invites silent model churn. Upstream model updates silently alter formant registers and micro-cadence. The Recipe Book requires an explicit engine binding and a cryptographic model digest (checkpoint\_sha256), ensuring that synthesis runs against the identical neural tensor weights indefinitely.  
> 2. **The Speaker Embedding & Conditioning Target:** Neural models accept speaker conditioning through varied modalities: zero-shot reference audio takes (CosyVoice/XTTSv2), static latent projection matrices (Chatterbox/Piper), or continuous natural language prompt descriptions of vocal texture (Parler-TTS). The Recipe Book pins this exact token, preventing vocoder interpolation errors.  
> 3. **The Baseline DSP Vector:** Raw neural vocoder output is frequently anatomically generic or prone to high-frequency digital sibilance. The recipe hardcodes baseline physical transformations—such as fundamental frequency (*F*0​) pitch transposition, acoustic tract formant scaling, and pulmonary breathiness—establishing the neutral biological baseline for that character before any scene-specific emotional trauma modifiers are injected.

### **2\. The Abstract Engine Interface (BaseTTSEngine)**

To decouple the Conductor (worker-sower-conductor on Rig 1\) from the operational intricacies of disparate machine learning frameworks, audio-microservice routes all generation through an abstract factory pattern:

`# audio-microservice/engines/base.py`  
`from abc import ABC, abstractmethod`  
`from typing import Dict, Any, Optional`  
`import numpy as np`

`class BaseTTSEngine(ABC):`  
    `"""`  
    `Abstract polymorphic base class for all speech synthesis runtimes.`  
    `Guarantees isolation of engine-specific tensor mechanics from the HTTP routing core.`  
    `"""`  
    `def __init__(self, model_checkpoint_path: str, device: str = "cpu"):`  
        `self.model_checkpoint_path = model_checkpoint_path`  
        `self.device = device`  
        `self.is_warm = False`

    `@abstractmethod`  
    `def warm_up(self) -> None:`  
        `"""Hydrates weights into System RAM and compiles execution graphs."""`  
        `pass`

    `@abstractmethod`  
    `def synthesize_line(`  
        `self,`  
        `phonetic_text: str,`  
        `speaker_reference_path: Optional[str],`  
        `speaker_embedding: Optional[np.ndarray],`  
        `conditioning_prompt: Optional[str],`  
        `base_modifiers: Dict[str, float],`  
        `scene_dsp_modifiers: Dict[str, float]`  
    `) -> np.ndarray:`  
        `"""`  
        `Synthesizes a single dialogue line into a raw float32 48 kHz PCM numpy buffer.`  
        `Must execute deterministically given identical inputs and PRNG seeds.`  
        `"""`  
        `pass`

    `@abstractmethod`  
    `def tear_down(self) -> None:`  
        `"""Explicit memory eviction interface to release host RAM blocks."""`  
        `pass`

#### **Polymorphic Execution Topology**

`Ingress: POST :8000/generate (TTSGenerationRequest)`  
                      `│`  
                      `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ server.py: Series Manifest & Character Recipe Lookup   │`  
`└─────────────────────┬──────────────────────────────────┘`  
                      `│`  
                      `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ EngineFactory.get_engine(recipe.tts_engine)            │`  
`└───────┬─────────────┬─────────────┬─────────────┬──────┘`  
        `│             │             │             │`  
        `▼             ▼             ▼             ▼`  
`┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐`  
`│ PiperEngine  ││ParlerEngine  ││ChatterboxEng ││CosyVoiceEng  │`  
`│ (ONNX / CPU) ││(PyTorch CPU) ││(FP16 Torch)  ││(300M Causal) │`  
`└───────┬──────┘└──────┬───────┘└──────┬───────┘└──────┬───────┘`  
        `│              │               │               │`  
        `└──────────────┴───────┬───────┴───────────────┘`  
                               `│ Raw float32 PCM (48 kHz)`  
                               `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ DSP Post-Processing Channel (Formant Warping & Limit)  │`  
`└─────────────────────┬──────────────────────────────────┘`  
                      `│`  
                      `▼`  
`Egress: Uncompressed 48 kHz / 24-bit WAV committed to scratch NVMe`

### **3\. The Engine Zoo: Specialization Matrix & Trade-Off Calculus**

No single speech synthesis architecture fulfills all dramaturgical and computational requirements across disparate episodic universes. The studio deploys a specialized engine zoo categorized by compute intensity, latency, and aesthetic capabilities:

| Engine Runtime | Primary Architectural Mechanism | Compute Profile (Rig 1 Host) | Cold Boot & RTF (Real-Time Factor) | Best-Fit Universe & Dramaturgical Profile |
| :---- | :---- | :---- | :---- | :---- |
| **Piper** | FastSpeech2 / VITS via ONNX Runtime | Pure Multi-Thread CPU; **\~80 MB RAM** | \<50 ms boot; RTF≤0.08× (Ultra-fast) | **under-the-floorboards (Goblin Universe):** Rapid slapstick, extreme pitch tolerance, frantic staccato cadence, crowd chirps. |
| **Parler-TTS** | Autoregressive Transformer with natural language conditioning | PyTorch OpenVINO / CPU; **\~1.2 GB RAM** | ∼800 ms boot; RTF≈0.65× (Near real-time) | **goblin-social-satire:** Nuanced prosodic modulation, controllable irony, whispered subtext, specific acoustic space prompts. |
| **Chatterbox** | Lightweight Neural Vocoder with dynamic pitch-contour tracking | Multi-core AVX-512 CPU; **\~1.5 GB RAM** | ∼500 ms boot; RTF≈0.40× (Fast) | **wiregrass-basin (Secondary Characters):** Reliable colloquial drawl, high phonetic intelligibility, minimal sibilance. |
| **CosyVoice (300M)** | Flow Matching & Causal Diffusion Vocoder (Zero-Shot Clone) | Heavy CPU / Auxiliary Low-VRAM; **\~2.8 GB RAM** | ∼1,800 ms boot; RTF≈1.20× (Slower) | **wiregrass-basin (Lead Noir Cast):** Complex emotional conditioning, laryngeal trauma, glottal fry, rich gravelly bass. |
| **Kokoro** | Compact Style-TTS2 Variant (82M params) | Pure CPU / WebAssembly; **\~350 MB RAM** | \<100 ms boot; RTF≤0.15× (Ultra-fast) | **deep-space-salvage:** Clean, emotionless synthetic comms, ship telemetry announcements, high-speed radio chatter. |

### **4\. Machine Contract: The Recipe Specification Schema**

Every character's acoustic profile is codified in voice\_manifest.json under an explicit, machine-validated JSON schema:

`{`  
  `"$schema": "https://specs.studio.internal/schemas/v2/voice_recipe.json",`  
  `"character_id": "char_020_the_pilot",`  
  `"series_slug": "wiregrass-basin",`  
  `"active_version": "v3",`  
  `"recipe": {`  
    `"tts_engine": "CosyVoice-300M",`  
    `"checkpoint": {`  
      `"model_repo": "FunAudioLLM/CosyVoice-300M",`  
      `"weights_sha256": "8a7c29e1f5d4a3b8c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9",`  
      `"quantization": "FP16"`  
    `},`  
    `"conditioning": {`  
      `"strategy": "ZERO_SHOT_CLONE",`  
      `"reference_voice_path": "voices/wiregrass-basin/versions/the_pilot_v3.wav",`  
      `"reference_sha256": "4a8c9e2b10a5e8f1d3c5e7b9a2c4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0",`  
      `"speaker_embedding_cache": "voices/wiregrass-basin/embeddings/the_pilot_v3.pt",`  
      `"description_prompt": null`  
    `},`  
    `"base_dsp_modifiers": {`  
      `"basePitchShiftSemitones": -2.5,`  
      `"formantWarpingFactor": 0.92,`  
      `"breathinessPauseMultiplier": 1.8,`  
      `"vocalFryDensity": 0.45,`  
      `"speedScalar": 0.85`  
    `},`  
    `"dynamics_and_eq": {`  
      `"high_pass_cutoff_hz": 90.0,`  
      `"de_esser_threshold_db": -18.0,`  
      `"de_esser_frequency_hz": 6800.0,`  
      `"target_integrated_lufs": -16.0,`  
      `"brickwall_true_peak_dbtp": -1.0`  
    `},`  
    `"phonetic_overrides": {`  
      `"lexicon_file": "voices/wiregrass-basin/lexicon.json",`  
      `"enable_regex_replacements": true`  
    `},`  
    `"banned_cadences": [`  
      `"RAPID_STACCATO",`  
      `"RISING_INFLECTION_INTERROGATIVE"`  
    `]`  
  `}`  
`}`

#### **Field-Level Technical Invariants**

> * **strategy:** Governs how the multiplexer conditions the underlying neural net. In ZERO\_SHOT\_CLONE, the microservice extracts a 512-dimensional speaker vector from reference\_voice\_path. In DESCRIPTION\_PROMPT (used by Parler-TTS), it passes a structured natural language prompt: *"A raspy, middle-aged man speaking slowly in a dry room with low reverb."*  
> * **base\_dsp\_modifiers vs dsp\_modifiers:** Base modifiers establish neutral biological traits. When the Conductor sends dynamic modifiers in TTSGenerationRequest (derived from somatic trauma or pressure meters), the microservice composes the two vectors algebraically:  
>   Effective Pitch=basePitchShiftSemitones+ΔPitchscene​  
>   Effective Formant=formantWarpingFactor×ΔFormantscene​  
>   Effective Breathiness=breathinessPauseMultiplier×ΔPausescene​  
> * **banned\_cadences:** Prohibits incompatible prosodic tokens. If the upstream narrative AST instructs an injured character with severe lung trauma to deliver dialogue with "RAPID\_STACCATO", the multiplexer intercepts the directive and rejects the payload at compile time.

### **5\. Multi-Series Case Studies: Concrete Parametric Configurations**

To demonstrate how the multiplexer serves radically divergent aesthetics, consider two contrasting character recipes executed on the same Rig 1 hardware daemon:

#### **Case Study A: Bog (under-the-floorboards)**

> * **Dramaturgical Function:** A hyper-neurotic, physically exhausted domestic goblin holed up beneath floorboards, terrified of human footfalls overhead.  
> * **Aesthetic Needs:** High-strung tempo, vocal squeaks, frantic plosives, and instantaneous comedic timing.  
> * **Multiplexed Engine:** **Piper (VITS / ONNX)**.

`{`  
  `"tts_engine": "Piper-ONNX",`  
  `"checkpoint": {`  
    `"model_repo": "rhasspy/piper-voices/en_US-lessac-medium",`  
    `"weights_sha256": "3e9b1a0f8c...",`  
    `"quantization": "INT8"`  
  `},`  
  `"conditioning": {`  
    `"strategy": "SPEAKER_ID",`  
    `"speaker_id": 2`  
  `},`  
  `"base_dsp_modifiers": {`  
    `"basePitchShiftSemitones": 3.8,`  
    `"formantWarpingFactor": 0.86,`  
    `"breathinessPauseMultiplier": 1.25,`  
    `"vocalFryDensity": 0.05,`  
    `"speedScalar": 1.18`  
  `},`  
  `"dynamics_and_eq": {`  
    `"high_pass_cutoff_hz": 120.0,`  
    `"de_esser_threshold_db": -14.0,`  
    `"de_esser_frequency_hz": 7500.0,`  
    `"target_integrated_lufs": -16.0,`  
    `"brickwall_true_peak_dbtp": -1.0`  
  `}`  
`}`

> * **Acoustic Rationale:** The \+3.8 semitone pitch shift paired with a 0.86 formant warping factor shrinks the perceived anatomical vocal tract, creating a convincing goblin biology without chipmunk distortion. High-pass filtering at 120 Hz clears out room-rumble, letting frantic syllables cut through heavy slapstick Foley.

#### **Case Study B: Billie Fae (wiregrass-basin)**

> * **Dramaturgical Function:** An aging, cynical bar owner in a toxic swamp basin who has breathed industrial defoliants for thirty years.  
> * **Aesthetic Needs:** Low-frequency subharmonic rattle, unhurried cadence, heavy diaphragmatic breath leakage.  
> * **Multiplexed Engine:** **CosyVoice-300M (Flow Matching Diffusion)**.

`{`  
  `"tts_engine": "CosyVoice-300M",`  
  `"checkpoint": {`  
    `"model_repo": "FunAudioLLM/CosyVoice-300M",`  
    `"weights_sha256": "8a7c29e1f...",`  
    `"quantization": "FP16"`  
  `},`  
  `"conditioning": {`  
    `"strategy": "ZERO_SHOT_CLONE",`  
    `"reference_voice_path": "voices/wiregrass-basin/versions/billie_fae_v1.wav",`  
    `"reference_sha256": "9b1c3e4d5f...",`  
    `"speaker_embedding_cache": "voices/wiregrass-basin/embeddings/billie_fae_v1.pt"`  
  `},`  
  `"base_dsp_modifiers": {`  
    `"basePitchShiftSemitones": -3.2,`  
    `"formantWarpingFactor": 1.12,`  
    `"breathinessPauseMultiplier": 2.4,`  
    `"vocalFryDensity": 0.60,`  
    `"speedScalar": 0.82`  
  `},`  
  `"dynamics_and_eq": {`  
    `"high_pass_cutoff_hz": 75.0,`  
    `"de_esser_threshold_db": -22.0,`  
    `"de_esser_frequency_hz": 6200.0,`  
    `"target_integrated_lufs": -16.0,`  
    `"brickwall_true_peak_dbtp": -1.0`  
  `}`  
`}`

> * **Acoustic Rationale:** Formant scaling at 1.12 expands the virtual pharynx, while the −3.2 semitone drop places her fundamental pitch in the gravelly range. The elevated vocalFryDensity: 0.60 injects subharmonic periodic pulses on sentence decay, signaling physical exhaustion and decades of toxin exposure.

### **6\. Rig 1 Lifecycle Management & Memory Concurrency Isolation**

Because audio-microservice executes alongside worker-sower-conductor, generate-episode-repo.ts, and headless Remotion Chromium instances on Rig 1, memory and CPU thread consumption are governed by strict operational limits:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1 SYSTEM MEMORY POOL (64 GB TOTAL SYSTEM RAM)                      │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Remotion Headless Chromium CLI: ~12.0 GB RAM                         │`  
`│ • worker-sower-conductor & Node.js Runtime: ~4.0 GB RAM                │`  
`│ • OS Kernels, NVMe Buffers, Page Caches: ~8.0 GB RAM                   │`  
`│ • Free Safety Buffer: ~32.0 GB RAM                                     │`  
`│ • AUDIO-MICROSERVICE ALLOCATION CEILING: Exactly 8.0 GB RAM            │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ AUDIO-MICROSERVICE RESIDENT ENGINE CACHE (Max 3 Resident Engines)      │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ [Slot 1: Active] Piper-ONNX (under-the-floorboards)       ~0.08 GB RAM │`  
`│ [Slot 2: Active] CosyVoice-300M (wiregrass-basin)          ~2.80 GB RAM │`  
`│ [Slot 3: Active] Chatterbox-FP16 (deep-space-salvage)      ~1.50 GB RAM │`  
`│ Total Resident Tensor Footprint:                           ~4.38 GB RAM │`  
`│ Headroom Remaining Under Microservice Ceiling:             ~3.62 GB RAM │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **The Least Recently Used (LRU) Engine Eviction Policy**

> * **Resident Slot Limit:** The service caps simultaneously resident engine checkpoints to a maximum of three (*N*max​\=3).  
> * **LRU Hydration & Eviction:** When a line requires an engine not currently warm in memory:  
  1. The daemon checks total resident allocation. If *N*\=3, it identifies the engine with the oldest last\_inference\_timestamp.  
  2. The service invokes engine.tear\_down() on the victim instance, setting its internal model references to None and explicitly invoking Python’s garbage collector (gc.collect()).  
  3. The requested engine initializes via engine.warm\_up(), loading its tensor weights into RAM.  
> * **Single-Threaded Execution Mutex:** To prevent CPU thread contention from causing erratic audio duration jitter during synthesis, the microservice serializes generation through an asynchronous queue lock (asyncio.Lock()). Only one TTS engine executes inference at any given millisecond. This guarantees that ffprobe temporal duration measurements remain deterministic across identical seeds.

### **7\. Cryptographic Recipe Versioning & Transitive DAG Blast Radius**

In the studio's compilation DAG, an Audio Recipe is an immutable configuration node. Modifying a recipe's pacing scalar from 0.85 to 0.90 is mathematically equivalent to altering a line of screenplay dialogue:

              `RECIPE HASH CALCULATION`  
  `┌──────────────────────────────────────────────────┐`  
  `│ • tts_engine: "CosyVoice-300M"                   │`  
  `│ • checkpoint.weights_sha256                      │`  
  `│ • conditioning.reference_sha256                  │`  
  `│ • canonical_json(base_dsp_modifiers)             │`  
  `└─────────────────────────┬────────────────────────┘`  
                            `│`  
                            `▼`  
              `H_recipe = HMAC-SHA256(...)`  
                            `│`  
                            `▼`  
         `TOPOLOGICAL DEPENDENCY CASCADE (Blast Radius)`  
  `┌──────────────────────────────────────────────────┐`  
  `│ Affected Dialogue Stems ──► is_dirty = 1         │`  
  `│ Downstream Exposure Sheet ──► Re-derive Frames   │`  
  `│ Video Diffusion Plates  ──► Re-calculate 4n + 1  │`  
  `│ Remotion Timeline       ──► Re-composite Cuts    │`  
  `└──────────────────────────────────────────────────┘`

#### **The Recipe Hash (*H*recipe​)**

The recipe digest is computed via a canonicalized HMAC-SHA256 hash across all identity properties:

*H*recipe​\=HMAC-SHA256(SeriesSecret,engine∥weights\_sha∥ref\_sha∥Serialize(base\_dsp)∥lexicon\_sha)

#### **Transitive Invalidation (*R*blast​)**

When *H*recipe​ changes:

> 1. **Targeted Invalidation:** An automated DAG walk in edge-director flags only the dialogue lines assigned to that character within that series as dirty (is\_dirty \= 1).  
> 2. **Audio Clock Re-Measurement:** audio-microservice re-synthesizes the invalidated .wav stems, and ffprobe recalculates their millisecond durations.  
> 3. **Timeline Frame Re-Budgeting:** If the new pacing alters the duration of an audio stem, the integer frame budget expands or contracts:  
>    target\_framesnew​\=⌈(1000*D*ms, new​​)×24⌉  
> 4. **Plate Safety:** Downstream visual plates on Rig 2 are flagged for regeneration only if the change in frame budget violates the existing diffusion plate length or breaches the 4*n*\+1 temporal lattice. Unaffected scenes featuring other characters retain their cached, content-addressed MP4 plates and stems, bounding compute costs while preserving series continuity.

---

*User prompt: {{FOCUS: 5\. Multi-Series Case Studies: Concrete Parametric Configurations}} /extreme-details*

Response: The multi-series case studies in audio-microservice define how the abstract tuple ⟨S,A,I,R*m*​⟩ (State space, Action vocabulary, Invariant laws, Medium-projection rules) translates into concrete, reproducible digital signal processing (DSP) parameters and neural speech synthesis runtimes. Because the studio’s narrative engine governs worlds with radically divergent physical and aesthetic axioms—ranging from claustrophobic domestic farce (under-the-floorboards) to toxic Southern Gothic industrial noir (wiregrass-basin) and vacuum-isolated hard sci-fi (deep-space-salvage)—the audio daemon cannot employ a single monolithic vocoder or uniform acoustic envelope.

Instead, vocal identity is parameterized within each universe’s voice\_manifest.json, creating an immutable contract between narrative trauma vectors, neural inference backends, dynamic DSP matrices, and downstream optical assembly clocks.

### **1\. The Dynamic Algebraic DSP Composition Engine**

Every incoming speech generation request from the upstream conductor (worker-sower-conductor on Rig 1\) carries two independent parameter spaces: the **Baseline Voice Recipe** (the character's neutral biological profile registered in voice\_manifest.json) and the **Scene Somatic Modifiers** (dynamic deltas derived at runtime from the Unified Pressure Meter Engine and narrative condition flags).

`┌────────────────────────────────────────────────────────┐`  
`│ BASELINE VOICE RECIPE (voice_manifest.json)            │`  
`│ • basePitchShiftSemitones (Neutral F0 offset)          │`  
`│ • formantWarpingFactor    (Vocal tract anatomy scale)  │`  
`│ • speedScalar             (Default conversational rate)│`  
`│ • baseBreathiness         (Diaphragmatic baseline)     │`  
`│ • baseVocalFry            (Glottal closure baseline)   │`  
`└───────────────────────────┬────────────────────────────┘`  
                            `│`  
                            `│ Algebraic Composition Channel`  
                            `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ DYNAMIC SCENE INGRESS (TTSGenerationRequest Payload)   │`  
`│ • ΔPitch_scene            (Emotional / shock delta)    │`  
`│ • ΔFormant_scene          (Laryngeal trauma scaling)   │`  
`│ • tonePacing_scene        (Dramatic urgency multiplier)│`  
`│ • pause_multiplier_scene  (Pulmonary exhaustion scale) │`  
`│ • ΔFry_scene              (Somatic fatigue pulse delta)│`  
`└───────────────────────────┬────────────────────────────┘`  
                            `│`  
                            `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ EFFECTIVE RUNTIME DSP VECTOR                           │`  
`│ • Pitch_eff   = Base_Pitch + ΔPitch_scene              │`  
`│ • Formant_eff = Base_Formant * ΔFormant_scene          │`  
`│ • Pacing_eff  = Speed_Base * tonePacing_scene          │`  
`│ • Pause_eff   = Base_Breath * pause_multiplier_scene   │`  
`│ • Fry_eff     = clamp(Base_Fry + ΔFry_scene, 0.0, 1.0) │`  
`└────────────────────────────────────────────────────────┘`

#### **Composition Equations**

> 1. **Effective Pitch (*F*0, eff​):** Additive signed semitone transposition:  
>    *F*0, eff​\=basePitchShiftSemitones+ΔPitchscene​  
> 2. **Effective Formant Warping (*W*eff​):** Multiplicative tract scaling:  
>    *W*eff​\=formantWarpingFactor×ΔFormantscene​  
> 3. **Effective Pacing Velocity (*P*eff​):** Compounded rate scalar:  
>    *P*eff​\=speedScalar×tonePacingscene​  
> 4. **Effective Inter-Clause Pause Factor (Πeff​):** Compounded breath interval dilation:  
>    Πeff​\=baseBreathiness×pause\_frequency\_multiplierscene​  
> 5. **Effective Vocal Fry Density (Φeff​):** Clamped subharmonic rattle injection:  
>    Φeff​\=clamp(baseVocalFry+ΔFryscene​,0.0,1.0)

### **2\. Case Study A: under-the-floorboards (Claustrophobic Domestic Farce)**

> * **Diegetic Reality:** A family of domestic goblins living in sub-floor crawlspaces beneath a human household. High-stress status anxiety, hoarding feuds over discarded human cutlery (item\_silver\_spoon), and visceral panic regarding human footfalls overhead.  
> * **Aesthetic Axiom:** *Pastoral-Contemplative* collapsing into frantic *Visceral Ballistics* (slapstick staccato, plosive terror, rapid micro-cadence).  
> * **Spatial & Acoustic Constraints:** Heavy structural acoustic absorption from wall insulation and aged timber floorboards; location damping factors calibrate between 6,000 and 8,500 bp (60% to 85% high-frequency absorption).

`CRAWLSPACE ACOUSTIC GEOMETRY (under-the-floorboards)`  
`┌────────────────────────────────────────────────────────┐`  
`│ Human Room Overhead: High-Impact Footfall (120 dB)     │`  
`├════════════════════════════════════════════════════════┤`  
`│ Sub-Floor Joists: 8,500 bp Damping Factor              │`  
`├────────────────────────────────────────────────────────┤`  
`│ Subterranean Crawlspace: Dry Wood / Zero Flutter Reverb │`  
`│ Target Noise Floor: ≤ -64 dBFS                         │`  
`│ Vocal Delivery: High-Speed, Pitch-Shifted Staccato     │`  
`│ Engine: Piper-ONNX (Pure CPU Multi-Thread)             │`  
`└────────────────────────────────────────────────────────┘`

#### **Profile 1: Bog (char\_bog) — High-Strung Hoarder**

Bog's physiology is defined by chronic hyperventilation, neurotic pacing, and an undersized vocal tract that produces high-register sibilance under stress.

`{`  
  `"$schema": "https://specs.studio.internal/schemas/v2/voice_recipe.json",`  
  `"series_slug": "under-the-floorboards",`  
  `"character_id": "char_bog",`  
  `"active_version": "v2",`  
  `"recipe": {`  
    `"tts_engine": "Piper-ONNX",`  
    `"checkpoint": {`  
      `"model_repo": "rhasspy/piper-voices/en_US-lessac-medium",`  
      `"weights_sha256": "3e9b1a0f8c2b4d6e8a0c2d4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e",`  
      `"quantization": "INT8"`  
    `},`  
    `"conditioning": {`  
      `"strategy": "SPEAKER_ID",`  
      `"speaker_id": 2,`  
      `"reference_voice_path": null,`  
      `"speaker_embedding_cache": null,`  
      `"description_prompt": null`  
    `},`  
    `"base_dsp_modifiers": {`  
      `"basePitchShiftSemitones": 3.8,`  
      `"formantWarpingFactor": 0.86,`  
      `"speedScalar": 1.18,`  
      `"baseBreathiness": 1.25,`  
      `"baseVocalFry": 0.05`  
    `},`  
    `"dynamics_and_eq": {`  
      `"high_pass_cutoff_hz": 120.0,`  
      `"high_pass_slope_db_oct": 24,`  
      `"de_esser_threshold_db": -14.0,`  
      `"de_esser_frequency_hz": 7500.0,`  
      `"target_integrated_lufs": -16.0,`  
      `"brickwall_true_peak_dbtp": -1.0,`  
      `"noise_floor_ceiling_dbfs": -62.0`  
    `},`  
    `"phonetic_overrides": {`  
      `"lexicon_file": "voices/under-the-floorboards/lexicon.json",`  
      `"enable_regex_replacements": true`  
    `},`  
    `"banned_cadences": [`  
      `"MONOTONE_GRAVEL",`  
      `"LANGUID_DRAWL"`  
    `]`  
  `}`  
`}`

> * **Acoustic Rationale:** The \+3.8 semitone pitch shift coupled with a 0.86 formant warping factor scales down the apparent anatomical volume of the oral and pharyngeal cavities, creating an authentic goblin vocal scale without the hollow phase distortion of naive resampling. High-pass filtering at 120 Hz strips mechanical rumble from Rig 1 workstation chassis fans and sub-floor resonance.  
> * **Pressure Meter Coupling:** When the character’s PARANOIA\_CLOCK (tracking the human schedule in world/clocks.md) crosses 7,500 bp, the simulation conductor automatically injects dynamic modifiers:  
>   ΔPitchscene​\=+1.7 semitones⟹*F*0, eff​\=+5.5 semitones  
>   tonePacingscene​\=1.25⟹*P*eff​\=1.18×1.25=1.475× baseline speed  
>   This forces Bog’s dialogue into hyper-compressed, panicked bursts that reduce target frame budgets downstream on the Remotion timeline.

#### **Profile 2: Mum Grissel (char\_mum\_grissel) — Ancient Matriarch**

Mum Grissel maintains total domestic authority through measured silence, terrifying vocal rasp, and severe diaphragmatic depletion.

`{`  
  `"$schema": "https://specs.studio.internal/schemas/v2/voice_recipe.json",`  
  `"series_slug": "under-the-floorboards",`  
  `"character_id": "char_mum_grissel",`  
  `"active_version": "v1",`  
  `"recipe": {`  
    `"tts_engine": "Parler-TTS-Mini",`  
    `"checkpoint": {`  
      `"model_repo": "parler-tts/parler-tts-mini-v1",`  
      `"weights_sha256": "9f8e7d6c5b4a3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",`  
      `"quantization": "FP16"`  
    `},`  
    `"conditioning": {`  
      `"strategy": "DESCRIPTION_PROMPT",`  
      `"description_prompt": "An ancient, menacing goblin matriarch speaking in a slow, dry, gravelly rasp with intense vocal fry and long, breathless pauses. Very low room reverberation, close microphone proximity.",`  
      `"speaker_id": null,`  
      `"reference_voice_path": null,`  
      `"speaker_embedding_cache": null`  
    `},`  
    `"base_dsp_modifiers": {`  
      `"basePitchShiftSemitones": -2.0,`  
      `"formantWarpingFactor": 1.08,`  
      `"speedScalar": 0.72,`  
      `"baseBreathiness": 2.80,`  
      `"baseVocalFry": 0.75`  
    `},`  
    `"dynamics_and_eq": {`  
      `"high_pass_cutoff_hz": 80.0,`  
      `"high_pass_slope_db_oct": 24,`  
      `"de_esser_threshold_db": -20.0,`  
      `"de_esser_frequency_hz": 6000.0,`  
      `"target_integrated_lufs": -16.0,`  
      `"brickwall_true_peak_dbtp": -1.0,`  
      `"noise_floor_ceiling_dbfs": -65.0`  
    `},`  
    `"phonetic_overrides": {`  
      `"lexicon_file": "voices/under-the-floorboards/lexicon.json",`  
      `"enable_regex_replacements": true`  
    `},`  
    `"banned_cadences": [`  
      `"RAPID_STACCATO",`  
      `"RISING_INFLECTION_INTERROGATIVE",`  
      `"CHIRP"`  
    `]`  
  `}`  
`}`

> * **Acoustic Rationale:** Utilizing Parler-TTS's natural language latent conditioning, Mum Grissel's performance is pinned to an authoritative, gravelly rasp. Her high baseBreathiness: 2.80 causes the neural model to segment sentences across deep respiratory inhalations, forcing downstream ffprobe duration measurements to expand significantly, which in turn expands visual hold frames in exposure\_sheet.json.

#### **Goblin Dialect Lexicon (voices/under-the-floorboards/lexicon.json)**

`{`  
  `"series_slug": "under-the-floorboards",`  
  `"phonetic_rules": {`  
    `"siphon": "SAI-fun",`  
    `"Snerk": "SNERK",`  
    `"Grissel": "GRIZ-zul",`  
    `"marrow-bone": "MAIR-oh-BOHN",`  
    `"floor-timbers": "FLOR-TIM-berz"`  
  `},`  
  `"regex_replacements": [`  
    `{`  
      `"pattern": "\\b(d'you)\\b",`  
      `"replacement": "dyoo"`  
    `},`  
    `{`  
      `"pattern": "\\b(gotta)\\b",`  
      `"replacement": "GAHT-tuh"`  
    `}`  
  `]`  
`}`

### **3\. Case Study B: wiregrass-basin (Southern Gothic Industrial Noir)**

> * **Diegetic Reality:** A decaying, chemical-polluted river basin dominated by toxic agrochemical runoff, diesel barge traffic, and institutional negligence. Characters suffer from chronic occupational poisoning, liver failure, and laryngeal trauma.  
> * **Aesthetic Axiom:** *Necro-Ballistics* (lead-weighted atmospheric gravity, industrial 60 Hz hum, visceral bodily grit, bleached acoustic transients).  
> * **Spatial & Acoustic Constraints:** Cavernous concrete spillways, corrugated sheet-metal sheds, open bayous, and wet riverbeds; low structural absorption (500 to 2,500 bp) producing long, muddy acoustic decays that require tight post-synthesis noise-floor gating.

`BASIN ACOUSTIC GEOMETRY (wiregrass-basin)`  
`┌────────────────────────────────────────────────────────┐`  
`│ Corrugated Metal Pump Station / Open Spillway Culvert   │`  
`├════════════════════════════════════════════════════════┤`  
`│ Boundary Reflections: Low Acoustic Damping (1,200 bp)  │`  
`├────────────────────────────────────────────────────────┤`  
`│ Background Atmosphere: 60 Hz Industrial Dynamo Drone   │`  
`│ Vocal Delivery: Slow Drawl, Diaphragmatic Wheeze       │`  
`│ Sibilance Risk: Severe Metal Sheen Echo                │`  
`│ Engine: CosyVoice-300M (FP16 Causal Diffusion Flow)    │`  
`└────────────────────────────────────────────────────────┘`

#### **Profile 1: The Pilot (char\_020\_the\_pilot) — Dying Crop Duster**

The Pilot suffers from Stage-2 chemical pulmonary fibrosis from decades of defoliant spraying, compounded by severe lower-spinal compression.

`{`  
  `"$schema": "https://specs.studio.internal/schemas/v2/voice_recipe.json",`  
  `"series_slug": "wiregrass-basin",`  
  `"character_id": "char_020_the_pilot",`  
  `"active_version": "v3",`  
  `"recipe": {`  
    `"tts_engine": "CosyVoice-300M",`  
    `"checkpoint": {`  
      `"model_repo": "FunAudioLLM/CosyVoice-300M",`  
      `"weights_sha256": "8a7c29e1f5d4a3b8c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9",`  
      `"quantization": "FP16"`  
    `},`  
    `"conditioning": {`  
      `"strategy": "ZERO_SHOT_CLONE",`  
      `"reference_voice_path": "voices/wiregrass-basin/versions/the_pilot_v3.wav",`  
      `"reference_sha256": "4a8c9e2b10a5e8f1d3c5e7b9a2c4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0",`  
      `"speaker_embedding_cache": "voices/wiregrass-basin/embeddings/the_pilot_v3.pt",`  
      `"description_prompt": null`  
    `},`  
    `"base_dsp_modifiers": {`  
      `"basePitchShiftSemitones": -2.5,`  
      `"formantWarpingFactor": 0.92,`  
      `"speedScalar": 0.85,`  
      `"baseBreathiness": 1.80,`  
      `"baseVocalFry": 0.45`  
    `},`  
    `"dynamics_and_eq": {`  
      `"high_pass_cutoff_hz": 90.0,`  
      `"high_pass_slope_db_oct": 24,`  
      `"de_esser_threshold_db": -18.0,`  
      `"de_esser_frequency_hz": 6800.0,`  
      `"target_integrated_lufs": -16.0,`  
      `"brickwall_true_peak_dbtp": -1.0,`  
      `"noise_floor_ceiling_dbfs": -60.0`  
    `},`  
    `"phonetic_overrides": {`  
      `"lexicon_file": "voices/wiregrass-basin/lexicon.json",`  
      `"enable_regex_replacements": true`  
    `},`  
    `"banned_cadences": [`  
      `"RAPID_STACCATO",`  
      `"RISING_INFLECTION_INTERROGATIVE",`  
      `"CHEERFUL_MODULATION"`  
    `]`  
  `}`  
`}`

> * **Acoustic Rationale:** The combination of basePitchShiftSemitones: \-2.5 and formantWarpingFactor: 0.92 lowers the fundamental pitch into a chesty drone while slightly constricting the formant profile, reflecting physical vocal tract damage.  
> * **Dynamic Biological Failure Gating:** In worker-sower-engine, The Pilot’s SOMATIC\_FATIGUE meter tracks basis points (0 to 10,000 bp). When exhaustion exceeds 8,000 bp, the conductor trips a physical speech constraint:  
>   `// produceEpisode.ts somatic translation logic`  
>   `if (character.meters.SOMATIC_FATIGUE > 8000) {`  
>     `dsp_modifiers.breathinessPauseMultiplier = 2.8;`  
>     `dsp_modifiers.vocalFryDensity = 0.85;`  
>     `// Banned kinetic verb enforcement`  
>     `assert(!line.motor_actions.includes("RUN"), "CANON_BREACH: Motor collapse");`  
>   `}`

This forces the flow-matching diffusion vocoder to introduce broken glottal stops and deep gasps between words, expanding the physical audio stem duration by up to 40%.

#### **Profile 2: Billie Fae (char\_billie\_fae) — Poisoned Saloon Proprietor**

Billie Fae speaks with a slow, smoky drawl marked by subharmonic bass frequencies and heavy cigarette rasps.

`{`  
  `"$schema": "https://specs.studio.internal/schemas/v2/voice_recipe.json",`  
  `"series_slug": "wiregrass-basin",`  
  `"character_id": "char_billie_fae",`  
  `"active_version": "v1",`  
  `"recipe": {`  
    `"tts_engine": "CosyVoice-300M",`  
    `"checkpoint": {`  
      `"model_repo": "FunAudioLLM/CosyVoice-300M",`  
      `"weights_sha256": "8a7c29e1f5d4a3b8c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9",`  
      `"quantization": "FP16"`  
    `},`  
    `"conditioning": {`  
      `"strategy": "ZERO_SHOT_CLONE",`  
      `"reference_voice_path": "voices/wiregrass-basin/versions/billie_fae_v1.wav",`  
      `"reference_sha256": "7b3e1c9d2f4a5e6b8a0c2d4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e",`  
      `"speaker_embedding_cache": "voices/wiregrass-basin/embeddings/billie_fae_v1.pt",`  
      `"description_prompt": null`  
    `},`  
    `"base_dsp_modifiers": {`  
      `"basePitchShiftSemitones": -3.2,`  
      `"formantWarpingFactor": 1.12,`  
      `"speedScalar": 0.82,`  
      `"baseBreathiness": 2.40,`  
      `"baseVocalFry": 0.60`  
    `},`  
    `"dynamics_and_eq": {`  
      `"high_pass_cutoff_hz": 75.0,`  
      `"high_pass_slope_db_oct": 24,`  
      `"de_esser_threshold_db": -22.0,`  
      `"de_esser_frequency_hz": 6200.0,`  
      `"target_integrated_lufs": -16.0,`  
      `"brickwall_true_peak_dbtp": -1.0,`  
      `"noise_floor_ceiling_dbfs": -60.0`  
    `},`  
    `"phonetic_overrides": {`  
      `"lexicon_file": "voices/wiregrass-basin/lexicon.json",`  
      `"enable_regex_replacements": true`  
    `},`  
    `"banned_cadences": [`  
      `"PERKY_UPBEAT",`  
      `"STACCATO_ALERT"`  
    `]`  
  `}`  
`}`

#### **Basin Dialect Lexicon (voices/wiregrass-basin/lexicon.json)**

`{`  
  `"series_slug": "wiregrass-basin",`  
  `"phonetic_rules": {`  
    `"culvert": "KULL-vert",`  
    `"Gallbreaker": "GAWL-bray-ker",`  
    `"creosote": "KREE-uh-soht",`  
    `"slough": "SLOO",`  
    `"diesel": "DEEZ-ul"`  
  `},`  
  `"regex_replacements": [`  
    `{`  
      `"pattern": "\\b(ain't)\\b",`  
      `"replacement": "aynt"`  
    `},`  
    `{`  
      `"pattern": "\\b(d'you)\\b",`  
      `"replacement": "dee-yoo"`  
    `}`  
  `]`  
`}`

### **4\. Case Study C: deep-space-salvage (Hard Sci-Fi Telemetry & Vacuum Comms)**

> * **Diegetic Reality:** Asteroid belt salvage operations within depressurized ship hulls, sealed environmental suits, and unshielded command decks. Dialogue is mediated through RF radio loops, EVA comm channels, and ship artificial intelligence systems.  
> * **Aesthetic Axiom:** *Prophetic Brutalism* meets cold digital utility (vector-flat clarity, narrow-band RF filtering, severe digital hard-clipping, total absence of acoustic room reflections).  
> * **Spatial & Acoustic Constraints:** Vacuum space (0 bp sound conduction); interior suit reflections are minimal and dry (9,900 bp damping). Transmissions pass through brickwall bandpass filters (300 Hz to 3,400 Hz) replicating standard military telemetry specifications.

`EVA SUIT TELEMETRY ACOUSTIC GEOMETRY (deep-space-salvage)`  
`┌────────────────────────────────────────────────────────┐`  
`│ External Vacuum: 0 bp Transmission (Absolute Silence)  │`  
`├════════════════════════════════════════════════════════┤`  
`│ Helmet Visor: Zero Room Reflections (Dry Direct Mic)   │`  
`├────────────────────────────────────────────────────────┤`  
`│ In-Line DSP: 300 Hz – 3,400 Hz RF Comms Bandpass       │`  
`│ Bitcrush: 12-Bit Linear PCM Quantization Artifacts     │`  
`│ Noise Floor Gate: Aggressive Hard Gate (≤ -70 dBFS)    │`  
`│ Engine: Kokoro-82M (Ultra-Low-Latency Pure CPU)        │`  
`└────────────────────────────────────────────────────────┘`

#### **Profile 1: ORACLE-7 (sys\_oracle7) — Autonomous Hull Core**

An unfeeling, high-speed ship telemetry computer executing hazard warnings and orbital calculations.

`{`  
  `"$schema": "https://specs.studio.internal/schemas/v2/voice_recipe.json",`  
  `"series_slug": "deep-space-salvage",`  
  `"character_id": "sys_oracle7",`  
  `"active_version": "v1",`  
  `"recipe": {`  
    `"tts_engine": "Kokoro-82M",`  
    `"checkpoint": {`  
      `"model_repo": "hexgrad/Kokoro-82M",`  
      `"weights_sha256": "1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",`  
      `"quantization": "FP32"`  
    `},`  
    `"conditioning": {`  
      `"strategy": "SPEAKER_VECTOR",`  
      `"speaker_id": "synthetic_telemetry_neutral_01",`  
      `"reference_voice_path": null,`  
      `"speaker_embedding_cache": null,`  
      `"description_prompt": null`  
    `},`  
    `"base_dsp_modifiers": {`  
      `"basePitchShiftSemitones": 0.0,`  
      `"formantWarpingFactor": 1.00,`  
      `"speedScalar": 1.25,`  
      `"baseBreathiness": 1.00,`  
      `"baseVocalFry": 0.00`  
    `},`  
    `"dynamics_and_eq": {`  
      `"high_pass_cutoff_hz": 300.0,`  
      `"high_pass_slope_db_oct": 48,`  
      `"low_pass_cutoff_hz": 3400.0,`  
      `"low_pass_slope_db_oct": 48,`  
      `"bit_depth_reduction": 12,`  
      `"de_esser_threshold_db": -10.0,`  
      `"de_esser_frequency_hz": 8000.0,`  
      `"target_integrated_lufs": -16.0,`  
      `"brickwall_true_peak_dbtp": -1.0,`  
      `"noise_floor_ceiling_dbfs": -75.0`  
    `},`  
    `"phonetic_overrides": {`  
      `"lexicon_file": "voices/deep-space-salvage/lexicon.json",`  
      `"enable_regex_replacements": true`  
    `},`  
    `"banned_cadences": [`  
      `"EMOTIONAL_TREMOR",`  
      `"VOCAL_FRY",`  
      `"HESITATION_STAMMER"`  
    `]`  
  `}`  
`}`

> * **Acoustic Rationale:** Kokoro-82M delivers sub-100 ms inference latency on pure CPU with near-zero memory footprint (\~350 MB RAM). The rigid 48 dB/octave bandpass filters at 300 Hz and 3,400 Hz instantly create an authentic spacecraft comms channel, while the complete eradication of vocal fry (Φ=0.0) and breathiness (Π=1.0) reinforces its cold synthetic origin.

#### **Profile 2: Chief Vance (char\_vance) — Hypoxic Lead Welder**

A veteran salvage mechanic speaking through a pressurized EVA helmet microphone, battling suit leaks and low oxygen.

`{`  
  `"$schema": "https://specs.studio.internal/schemas/v2/voice_recipe.json",`  
  `"series_slug": "deep-space-salvage",`  
  `"character_id": "char_vance",`  
  `"active_version": "v2",`  
  `"recipe": {`  
    `"tts_engine": "Chatterbox-Base",`  
    `"checkpoint": {`  
      `"model_repo": "chatterbox/chatterbox-base-fp16",`  
      `"weights_sha256": "4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c",`  
      `"quantization": "FP16"`  
    `},`  
    `"conditioning": {`  
      `"strategy": "ZERO_SHOT_CLONE",`  
      `"reference_voice_path": "voices/deep-space-salvage/versions/vance_v2.wav",`  
      `"reference_sha256": "5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",`  
      `"speaker_embedding_cache": "voices/deep-space-salvage/embeddings/vance_v2.pt",`  
      `"description_prompt": null`  
    `},`  
    `"base_dsp_modifiers": {`  
      `"basePitchShiftSemitones": -1.2,`  
      `"formantWarpingFactor": 0.96,`  
      `"speedScalar": 0.95,`  
      `"baseBreathiness": 2.10,`  
      `"baseVocalFry": 0.30`  
    `},`  
    `"dynamics_and_eq": {`  
      `"high_pass_cutoff_hz": 180.0,`  
      `"high_pass_slope_db_oct": 24,`  
      `"low_pass_cutoff_hz": 4800.0,`  
      `"low_pass_slope_db_oct": 18,`  
      `"de_esser_threshold_db": -16.0,`  
      `"de_esser_frequency_hz": 7000.0,`  
      `"target_integrated_lufs": -16.0,`  
      `"brickwall_true_peak_dbtp": -1.0,`  
      `"noise_floor_ceiling_dbfs": -64.0`  
    `},`  
    `"phonetic_overrides": {`  
      `"lexicon_file": "voices/deep-space-salvage/lexicon.json",`  
      `"enable_regex_replacements": true`  
    `},`  
    `"banned_cadences": [`  
      `"SONOROUS_ORATORY"`  
    `]`  
  `}`  
`}`

#### **Salvage Comms Lexicon (voices/deep-space-salvage/lexicon.json)**

`{`  
  `"series_slug": "deep-space-salvage",`  
  `"phonetic_rules": {`  
    `"apogee": "AP-uh-jee",`  
    `"EVA": "EE-vee-ay",`  
    `"RCS": "AHR-see-ess",`  
    `"bulkhead": "BULK-hed",`  
    `"hydrazine": "HY-druh-zeen"`  
  `},`  
  `"regex_replacements": [`  
    `{`  
      `"pattern": "\\b(kpa)\\b",`  
      `"replacement": "KIL-oh-pas-kahlz"`  
    `},`  
    `{`  
      `"pattern": "\\b(atmo)\\b",`  
      `"replacement": "AT-moh"`  
    `}`  
  `]`  
`}`

### **5\. Cross-Series Engine Arbitrage & Hardware Profiling Matrix**

The multi-engine architecture on Rig 1 prevents monoculture across the studio's production fleet while enforcing strict adherence to hardware resource caps:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1 RESOURCE POOL: 64 GB SYSTEM RAM / CPU MULTI-THREAD BOUND         │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Microservice Memory Cap: 8.0 GB RAM  (Zero GPU VRAM Allocated)         │`  
`│ Maximum Resident Engines in Warm Cache: N_max = 3 (Managed via LRU)    │`  
`└────────────────────────────────────────────────────────────────────────┘`

| Operational Metric | Case A: under-the-floorboards (Bog) | Case B: wiregrass-basin (The Pilot) | Case C: deep-space-salvage (ORACLE-7) |
| :---- | :---- | :---- | :---- |
| **Series Aesthetic** | Claustrophobic Farce / Slapstick | Southern Gothic Industrial Noir | Hard Sci-Fi Industrial Comms |
| **Target Engine** | **Piper-ONNX** (INT8) | **CosyVoice-300M** (FP16) | **Kokoro-82M** (FP32) |
| **Execution Hardware** | Pure Multi-Thread CPU (x86\_64) | AVX-512 CPU / Low-VRAM Helper | Pure CPU WebAssembly/Native |
| **Resident RAM** | **\~80 MB** | **\~2,800 MB (2.8 GB)** | **\~350 MB** |
| **Real-Time Factor** | RTF≤0.08× (Ultra-fast) | RTF≈1.20× (Compute-heavy) | RTF≤0.12× (Instant) |
| **Conditioning Mode** | Pinned Speaker ID Integer | Zero-Shot 512-dim Latent Vector | Synthetic Tensor Vector |
| **Pitch Modulation** | \+3.8 semitones (Goblin Formant) | −2.5 semitones (Chest Drone) | 0.0 semitones (Calibrated Identity) |
| **Formant Warping** | 0.86 (Compressed Pharynx) | 0.92 (Laryngeal Damping) | 1.00 (Neutral Digital Track) |
| **In-Line Signal Filters** | 120 Hz HPF∥7.5 kHz De-Ess | 90 Hz HPF∥6.8 kHz De-Ess | 300–3400 Hz Bandpass∥12-bit |
| **Output Conformance** | −16 LUFS∥≤−1.0 dBTP | −16 LUFS∥≤−1.0 dBTP | −16 LUFS∥≤−1.0 dBTP |

### **6\. Transitive DAG Blast Radius & Cache Invalidation Walk**

In the studio’s Directed Acyclic Graph (DAG) compilation engine, every Audio Recipe functions as a cryptographic dependency node. Modifying a single parameter in a character recipe does not invalidate unrelated assets across the fleet:

                      `MODIFY RECIPE PARAMETER`  
             `(e.g., Billie Fae speedScalar: 0.82 -> 0.86)`  
                                 `│`  
                                 `▼`  
                     `HMAC-SHA256 Recalculation`  
                                 `│`  
                                 `▼`  
                   `H_recipe Hash Mutation Detected`  
                                 `│`  
         `┌───────────────────────┴───────────────────────┐`  
         `▼                                               ▼`  
`[ INVALIDATED NODES: is_dirty = 1 ]             [ UNTOUCHED / IMMUTABLE ]`  
`• Billie Fae dialogue stems in Wiregrass        • All Bog stems (Under-the-Floorboards)`  
`• Wiregrass exposure_sheet.json frame counts    • All ORACLE-7 stems (Deep-Space-Salvage)`  
`• Wiregrass Remotion FinalComposite cuts        • All unaffected Wiregrass character stems`  
`• ComfyUI plates breaching 4n+1 boundary        • Video plates within temporal margin`

#### **Worked Blast Radius Execution Walk**

> 1. **The Recipe Mutation:** An editor adjusts Billie Fae's baseline tempo in voices/wiregrass-basin/voice\_manifest.json, changing speedScalar from 0.82 to 0.86 to tighten dramatic pacing.  
> 2. **Cryptographic Hash Invalidation (*H*recipe​):**  
>    *H*recipe, new​\=HMAC-SHA256(SeriesSecret,"CosyVoice-300M"∥WeightsSHA∥⋯∥speedScalar: 0.86)  
>    Because *H*recipe, new​\=*H*recipe, old​, the metadata lockfile is marked dirty (is\_dirty \= 1).  
> 3. **Topological Invalidation Scope:**  
   * **Targeted Audio Re-Synthesis:** The compiler walks dialogue\_ast.json for wiregrass-basin Episode 4\. Only lines where speaker \=== "char\_billie\_fae" are scheduled for re-synthesis on audio-microservice. Dialogue lines for The Pilot and RC Spurl retain their cached, content-addressed .wav binaries.  
   * **Temporal Clock Re-Measurement:** The newly synthesized stem for Shot 03 measures *D*ms, new​\=2,840 ms (contracted from 3,120 ms).  
   * **Integer Frame Recalculation:** The Conductor recomputes the discrete 24 fps frame budget:  
     target\_framesnew​\=⌈(10002840​)×24⌉\=⌈68.16⌉=69 frames(formerly 75 frames)  
   * **Visual Plate Invalidation Logic (4*n*\+1 Check):** On Rig 2, the ComfyUI video diffusion spoke previously generated an uncomposited green-screen plate conformed to the 4*n*\+1 temporal lattice:  
     *n*\=19⟹4(19)+1=77 native frames  
     Because the new requirement of 69 frames is strictly less than the existing 77-frame plate (69≤77), the compiler does **not** re-render the expensive GPU diffusion plate. Instead, the Remotion optical compositor simply trims an additional 6 frames from the tail of the plate (77−69=8 frames of tail slack).  
   * **Total Cost of Invalidation:** GPU compute cost on Rig 2 remains exactly **\$0.00**; the revision executes entirely on Rig 1 in under 3.5 seconds through local CPU speech synthesis and Remotion headless TSX re-assembly.

The multi-series architecture achieves complete isolation: creative adjustments to vocal pacing or somatic trauma in one storyworld update only that series' localized manifests, preserving downstream timeline stability and eliminating cross-universe contamination across the production fleet.

---

*User prompt: {{FOCUS: 3\. The Audio Recipe Book & Multi-Engine Multiplexing}} /extreme-details*

Response: The **Audio Recipe Book & Multi-Engine Multiplexing** subsystem within audio-microservice resolves the central epistemic vulnerability of generative voice engineering: the decoupling of physical sound waveforms from reproducible generative instructions. A bare audio recording (.wav) or isolated speaker embedding vector contains zero inherent instructions for how a dramatic performance was computed. Without formalizing the generative model checkpoint, the latent conditioning prompt, the baseline digital signal processing (DSP) offsets, and the dialect pronunciation rules into an immutable machine contract, neural vocal synthesis suffers from severe timbre drift, speaker bleed, and cadential decay across episodic production runs.

Under studio infrastructure taxonomy, this architecture operationalizes the mandate of **POD-05: Audio & Dialogue Lab** (Macro-Node 02: Blueprint). It operates as a warm, persistent daemon hosted locally on Rig 1 (port 8000), executing entirely on multi-core CPU and system RAM with an invariant hardware allocation of **exactly 0 MB dedicated GPU VRAM**\[cite: 1, 3, 4, 14\]. Behind its single HTTP routing endpoint (POST \[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate)), it multiplexes disparate neural text-to-speech runtimes (including Piper, Parler-TTS, Chatterbox, CosyVoice, and Kokoro) behind a polymorphic execution engine.

`┌────────────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: ACOUSTIC DAEMON & ENGINE MULTIPLEXER (Pure CPU / System RAM / 0 MB GPU VRAM)            │`  
`├────────────────────────────────────────────────────────────────────────────────────────────────┤`  
`│ Ingress: POST :8000/generate (TTSGenerationRequest from worker-sower-conductor)               │`  
`│                                                                                                │`  
`│               ┌─────────────────────────────────────────────────────────────┐                  │`  
`│               │ server.py: Series Resolution & Manifest Recipe Dispatcher   │                  │`  
`│               └──────────────────────────────┬──────────────────────────────┘                  │`  
`│                                              │                                                 │`  
`│                                              ▼                                                 │`  
`│               ┌─────────────────────────────────────────────────────────────┐                  │`  
`│               │ BaseTTSEngine Polymorphic Factory (engines/base.py)         │                  │`  
`│               └───────┬─────────────┬─────────────┬─────────────┬───────────┘                  │`  
`│                       │             │             │             │                              │`  
`│       ┌───────────────┘             │             │             └───────────────┐              │`  
`│       ▼                             ▼             ▼                             ▼              │`  
`│ ┌───────────┐                 ┌───────────┐ ┌───────────┐                 ┌───────────┐        │`  
`│ │ PiperEngine│                 │ParlerEng. │ │Chatterbox │                 │CosyVoice  │        │`  
`│ │ ONNX/CPU  │                 │PyTorch CPU│ │Torch/CPU  │                 │Flow Match │        │`  
`│ └─────┬─────┘                 └─────┬─────┘ └─────┬─────┘                 └─────┬─────┘        │`  
`│       │                             │             │                             │              │`  
`│       └─────────────────────────────┼─────────────┴─────────────────────────────┘              │`  
`│                                     ▼                                                          │`  
`│               ┌─────────────────────────────────────────────────────────────┐                  │`  
`│               │ Dynamic Somatic DSP Composition (Formant, Pitch, Fry, Pause)│                  │`  
`│               └──────────────────────────────┬──────────────────────────────┘                  │`  
`│                                              ▼                                                 │`  
`│               ┌─────────────────────────────────────────────────────────────┐                  │`  
`│               │ Hardware Scratch Disk: public/audio/dialogue/${id}.wav      │                  │`  
`│               └─────────────────────────────────────────────────────────────┘                  │`  
`└────────────────────────────────────────────────────────────────────────────────────────────────┘`

### **1\. The Epistemological Triad of Voice Identity**

A character’s vocal identity cannot be defined merely as a reference audio asset. Within audio-microservice, character voice identity is codified as an irreducible triad of generative specifications:

                     `┌────────────────────────────────────────┐`  
                     `│       CANONICAL VOCAL IDENTITY TRIAD   │`  
                     `└───────────────────┬────────────────────┘`  
                                         `│`  
         `┌───────────────────────────────┼───────────────────────────────┐`  
         `▼                               ▼                               ▼`  
`┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐`  
`│   1. MODEL CHECKPOINT  │  │   2. SPEAKER EMBEDDING │  │   3. BASELINE DSP      │`  
`│   & ENGINE ADAPTER     │  │   & CONDITIONING TOKEN │  │   PARAMETER VECTOR     │`  
`├────────────────────────┤  ├────────────────────────┤  ├────────────────────────┤`  
`│ • Engine Runtime Enum  │  │ • Pinned Reference WAV │  │ • Fundamental Pitch F0 │`  
`│ • Checkpoint Git SHA   │  │ • Speaker Vector (.pt) │  │ • Formant Warping (W)  │`  
`│ • Quantization (INT8 / │  │ • Latent Description   │  │ • Default speedScalar  │`  
`│   FP16 / FP32 / ONNX)  │  │   Prompt (Parler-TTS)  │  │ • Base Breathiness (Π) │`  
`│ • Execution Graph Hash │  │ • Target Speaker ID    │  │ • Base Vocal Fry (Φ)   │`  
`└────────────────────────┘  └────────────────────────┘  └────────────────────────┘`

> 1. **The Engine Architecture & Weights Lock:** Coupling acoustic identity strictly to proprietary, cloud-hosted black-box APIs (such as ElevenLabs) introduces silent breaking changes when upstream providers update vocoder weights, altering formant registers and micro-cadence without notice. The Recipe Book requires an explicit engine binding and a cryptographic model digest (checkpoint.weights\_sha256), guaranteeing that synthesis executes against identical neural tensor weights across years of production.  
> 2. **The Speaker Embedding & Conditioning Target:** Neural models accept vocal conditioning through varied mathematical modalities: zero-shot reference audio takes (CosyVoice), static latent projection matrices (Chatterbox), speaker identity integers (Piper), or continuous natural language prompt descriptions of vocal texture (Parler-TTS). The Recipe Book pins this exact token, preventing vocoder interpolation errors.  
> 3. **The Baseline DSP Vector:** Raw neural vocoder output is frequently anatomically generic or prone to high-frequency digital sibilance. The recipe hardcodes baseline physical transformations—such as fundamental frequency (*F*0​) pitch transposition, acoustic tract formant scaling, and pulmonary breathiness—establishing the neutral biological baseline for that character before any scene-specific emotional trauma modifiers are injected.

### **2\. Abstract Multiplexing Architecture & Factory Polymorphism**

To decouple the Conductor (worker-sower-conductor on Rig 1\) from the operational intricacies of disparate machine learning frameworks, audio-microservice routes all generation through an abstract factory pattern:

`# audio-microservice/engines/base.py`  
`from abc import ABC, abstractmethod`  
`from typing import Dict, Any, Optional`  
`import numpy as np`

`class BaseTTSEngine(ABC):`  
    `"""`  
    `Abstract polymorphic base class for all speech synthesis runtimes.`  
    `Guarantees isolation of engine-specific tensor mechanics from the HTTP routing core.`  
    `"""`  
    `def __init__(self, model_checkpoint_path: str, device: str = "cpu"):`  
        `self.model_checkpoint_path = model_checkpoint_path`  
        `self.device = device`  
        `self.is_warm = False`

    `@abstractmethod`  
    `def warm_up(self) -> None:`  
        `"""Hydrates weights into System RAM and compiles execution graphs."""`  
        `pass`

    `@abstractmethod`  
    `def synthesize_line(`  
        `self,`  
        `phonetic_text: str,`  
        `speaker_reference_path: Optional[str],`  
        `speaker_embedding: Optional[np.ndarray],`  
        `conditioning_prompt: Optional[str],`  
        `base_modifiers: Dict[str, float],`  
        `scene_dsp_modifiers: Dict[str, float]`  
    `) -> np.ndarray:`  
        `"""`  
        `Synthesizes a single dialogue line into a raw float32 48 kHz PCM numpy buffer.`  
        `Must execute deterministically given identical inputs and PRNG seeds.`  
        `"""`  
        `pass`

    `@abstractmethod`  
    `def tear_down(self) -> None:`  
        `"""Explicit memory eviction interface to release host RAM blocks."""`  
        `pass`

#### **The Engine Zoo: Specialization Matrix & Trade-Off Calculus**

Different episodic universes operate across different dramaturgical registers and latency budgets, requiring specialized engine backends:

| Engine Runtime | Primary Architectural Mechanism | Compute Profile (Rig 1 Host) | Cold Boot & RTF (Real-Time Factor) | Best-Fit Universe & Dramaturgical Profile |
| :---- | :---- | :---- | :---- | :---- |
| **Piper** | FastSpeech2 / VITS via ONNX Runtime | Pure Multi-Thread CPU; **\~80 MB RAM** | \<50 ms boot; RTF≤0.08× (Ultra-fast) | **under-the-floorboards (Goblin Universe):** Rapid slapstick, extreme pitch tolerance, frantic staccato cadence, crowd chirps. |
| **Parler-TTS** | Autoregressive Transformer with natural language conditioning | PyTorch OpenVINO / CPU; **\~1.2 GB RAM** | ∼800 ms boot; RTF≈0.65× (Near real-time) | **goblin-social-satire:** Nuanced prosodic modulation, controllable irony, whispered subtext, specific acoustic space prompts. |
| **Chatterbox** | Lightweight Neural Vocoder with dynamic pitch-contour tracking | Multi-core AVX-512 CPU; **\~1.5 GB RAM** | ∼500 ms boot; RTF≈0.40× (Fast) | **wiregrass-basin (Secondary Characters):** Reliable colloquial drawl, high phonetic intelligibility, minimal sibilance. |
| **CosyVoice (300M)** | Flow Matching & Causal Diffusion Vocoder (Zero-Shot Clone) | Heavy CPU / Auxiliary Low-VRAM; **\~2.8 GB RAM** | ∼1,800 ms boot; RTF≈1.20× (Slower) | **wiregrass-basin (Lead Noir Cast):** Complex emotional conditioning, laryngeal trauma, glottal fry, rich gravelly bass. |
| **Kokoro** | Compact Style-TTS2 Variant (82M params) | Pure CPU / WebAssembly; **\~350 MB RAM** | \<100 ms boot; RTF≤0.15× (Ultra-fast) | **deep-space-salvage:** Clean, emotionless synthetic comms, ship telemetry announcements, high-speed radio chatter. |

### **3\. Machine Contract: The Voice Recipe Specification Schema**

Every character's acoustic profile is codified in voice\_manifest.json under an explicit, machine-validated JSON schema:

`{`  
  `"$schema": "https://specs.studio.internal/schemas/v2/voice_recipe.json",`  
  `"character_id": "char_020_the_pilot",`  
  `"series_slug": "wiregrass-basin",`  
  `"active_version": "v3",`  
  `"recipe": {`  
    `"tts_engine": "CosyVoice-300M",`  
    `"checkpoint": {`  
      `"model_repo": "FunAudioLLM/CosyVoice-300M",`  
      `"weights_sha256": "8a7c29e1f5d4a3b8c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9",`  
      `"quantization": "FP16"`  
    `},`  
    `"conditioning": {`  
      `"strategy": "ZERO_SHOT_CLONE",`  
      `"reference_voice_path": "voices/wiregrass-basin/versions/the_pilot_v3.wav",`  
      `"reference_sha256": "4a8c9e2b10a5e8f1d3c5e7b9a2c4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0",`  
      `"speaker_embedding_cache": "voices/wiregrass-basin/embeddings/the_pilot_v3.pt",`  
      `"description_prompt": null`  
    `},`  
    `"base_dsp_modifiers": {`  
      `"basePitchShiftSemitones": -2.5,`  
      `"formantWarpingFactor": 0.92,`  
      `"speedScalar": 0.85,`  
      `"baseBreathiness": 1.80,`  
      `"baseVocalFry": 0.45`  
    `},`  
    `"dynamics_and_eq": {`  
      `"high_pass_cutoff_hz": 90.0,`  
      `"high_pass_slope_db_oct": 24,`  
      `"de_esser_threshold_db": -18.0,`  
      `"de_esser_frequency_hz": 6800.0,`  
      `"target_integrated_lufs": -16.0,`  
      `"brickwall_true_peak_dbtp": -1.0,`  
      `"noise_floor_ceiling_dbfs": -60.0`  
    `},`  
    `"phonetic_overrides": {`  
      `"lexicon_file": "voices/wiregrass-basin/lexicon.json",`  
      `"enable_regex_replacements": true`  
    `},`  
    `"banned_cadences": [`  
      `"RAPID_STACCATO",`  
      `"RISING_INFLECTION_INTERROGATIVE"`  
    `]`  
  `}`  
`}`

#### **Field-Level Technical Invariants**

> * **conditioning.strategy:** Directs how the multiplexer conditions the underlying neural net. In ZERO\_SHOT\_CLONE, the microservice extracts a 512-dimensional speaker vector from reference\_voice\_path. In DESCRIPTION\_PROMPT (used by Parler-TTS), it passes a structured natural language prompt: *"A raspy, middle-aged man speaking slowly in a dry room with low reverb."*  
> * **banned\_cadences:** Enforces prosodic exclusion filters. If the upstream narrative AST instructs an injured character with severe lung trauma to deliver dialogue with "RAPID\_STACCATO", the multiplexer intercepts the directive and rejects the payload at compile time.

### **4\. Dynamic Algebraic DSP Composition & Somatic Coupling**

Incoming speech generation requests from the Conductor (worker-sower-conductor on Rig 1\) carry two independent parameter spaces: the **Baseline Voice Recipe** (the character's neutral biological profile registered in voice\_manifest.json) and the **Scene Somatic Modifiers** (dynamic deltas derived at runtime from the Unified Pressure Meter Engine and narrative condition flags):

`┌────────────────────────────────────────────────────────┐`  
`│ BASELINE VOICE RECIPE (voice_manifest.json)            │`  
`│ • basePitchShiftSemitones (Neutral F0 offset)          │`  
`│ • formantWarpingFactor    (Vocal tract anatomy scale)  │`  
`│ • speedScalar             (Default conversational rate)│`  
`│ • baseBreathiness         (Diaphragmatic baseline)     │`  
`│ • baseVocalFry            (Glottal closure baseline)   │`  
`└───────────────────────────┬────────────────────────────┘`  
                            `│`  
                            `│ Algebraic Composition Channel`  
                            `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ DYNAMIC SCENE INGRESS (TTSGenerationRequest Payload)   │`  
`│ • ΔPitch_scene            (Emotional / shock delta)    │`  
`│ • ΔFormant_scene          (Laryngeal trauma scaling)   │`  
`│ • tonePacing_scene        (Dramatic urgency multiplier)│`  
`│ • pause_multiplier_scene  (Pulmonary exhaustion scale) │`  
`│ • ΔFry_scene              (Somatic fatigue pulse delta)│`  
`└───────────────────────────┬────────────────────────────┘`  
                            `│`  
                            `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ EFFECTIVE RUNTIME DSP VECTOR                           │`  
`│ • Pitch_eff   = Base_Pitch + ΔPitch_scene              │`  
`│ • Formant_eff = Base_Formant * ΔFormant_scene          │`  
`│ • Pacing_eff  = Speed_Base * tonePacing_scene          │`  
`│ • Pause_eff   = Base_Breath * pause_multiplier_scene   │`  
`│ • Fry_eff     = clamp(Base_Fry + ΔFry_scene, 0.0, 1.0) │`  
`└────────────────────────────────────────────────────────┘`

#### **Mathematical Composition Formulas**

> 1. **Effective Pitch (*F*0, eff​):** Additive signed semitone transposition without altering temporal duration:  
>    *F*0, eff​\=basePitchShiftSemitones+ΔPitchscene​  
> 2. **Effective Formant Warping (*W*eff​):** Multiplicative tract scaling (values \<1.0 emulate an expanded/collapsed cavity; values \>1.0 compress the perceived vocal tract):  
>    *W*eff​\=formantWarpingFactor×ΔFormantscene​  
> 3. **Effective Pacing Velocity (*P*eff​):** Compounded speaking rate scalar:  
>    *P*eff​\=speedScalar×tonePacingscene​  
> 4. **Effective Inter-Clause Pause Factor (Πeff​):** Compounded breath interval dilation for pulmonary exhaustion:  
>    Πeff​\=baseBreathiness×pause\_frequency\_multiplierscene​  
> 5. **Effective Vocal Fry Density (Φeff​):** Clamped subharmonic rattle pulse injection:  
>    Φeff​\=clamp(baseVocalFry+ΔFryscene​,0.0,1.0)

#### **Coupling with the Unified Pressure Meter Engine**

Somatic DSP modifiers are not arbitrary static values; they are dynamically driven by the simulation's Unified Pressure Meter Engine, which tracks stress and physical trauma as basis points (0 to 10,000 bp) within the staging ledger:

> * When an entity's SOMATIC\_FATIGUE meter exceeds 8,000 bp, the Conductor trips a physical speech constraint:  
>   `// worker-sower-conductor: src/pipeline/produceEpisode.ts`  
>   `if (character.meters.SOMATIC_FATIGUE > 8000) {`  
>     `dsp_modifiers.pause_frequency_multiplier = 2.8;`  
>     `dsp_modifiers.vocalFryDensity = 0.85;`  
>     `assert(!line.motor_actions.includes("RUN"), "CANON_BREACH: Motor collapse");`  
>   `}`

> * This forces the vocoder to inject broken glottal stops and deep respiratory inhalations between words, expanding the physical audio stem duration by up to 40%.

### **5\. Multi-Series Parametric Case Studies & Dialect Lexicons**

The multiplexer serves radically divergent aesthetics across the studio fleet without cross-universe contamination:

#### **Case Study A: Bog (under-the-floorboards)**

> * **Dramaturgical Profile:** A hyper-neurotic, physically exhausted domestic goblin holed up beneath floorboards, terrified of human footfalls overhead.  
> * **Aesthetic Needs:** High-strung tempo, vocal squeaks, frantic plosives, rapid micro-cadence.  
> * **Multiplexed Engine:** **Piper (VITS / ONNX)**.

`{`  
  `"tts_engine": "Piper-ONNX",`  
  `"checkpoint": {`  
    `"model_repo": "rhasspy/piper-voices/en_US-lessac-medium",`  
    `"weights_sha256": "3e9b1a0f8c2b4d6e...",`  
    `"quantization": "INT8"`  
  `},`  
  `"conditioning": {`  
    `"strategy": "SPEAKER_ID",`  
    `"speaker_id": 2`  
  `},`  
  `"base_dsp_modifiers": {`  
    `"basePitchShiftSemitones": 3.8,`  
    `"formantWarpingFactor": 0.86,`  
    `"speedScalar": 1.18,`  
    `"baseBreathiness": 1.25,`  
    `"baseVocalFry": 0.05`  
  `},`  
  `"dynamics_and_eq": {`  
    `"high_pass_cutoff_hz": 120.0,`  
    `"de_esser_threshold_db": -14.0,`  
    `"de_esser_frequency_hz": 7500.0,`  
    `"target_integrated_lufs": -16.0,`  
    `"brickwall_true_peak_dbtp": -1.0`  
  `}`  
`}`

> * **Acoustic Rationale:** The \+3.8 semitone pitch shift coupled with a 0.86 formant warping factor scales down the apparent anatomical volume of the oral and pharyngeal cavities, creating an authentic goblin vocal scale without chipmunk distortion. High-pass filtering at 120 Hz clears out sub-floor rumble, letting frantic syllables cut through heavy slapstick Foley.

#### **Case Study B: Billie Fae (wiregrass-basin)**

> * **Dramaturgical Profile:** An aging, cynical bar owner in a toxic swamp basin who has breathed industrial defoliants for thirty years.  
> * **Aesthetic Needs:** Low-frequency subharmonic rattle, unhurried cadence, heavy diaphragmatic breath leakage.  
> * **Multiplexed Engine:** **CosyVoice-300M (Flow Matching Causal Diffusion)**.

`{`  
  `"tts_engine": "CosyVoice-300M",`  
  `"checkpoint": {`  
    `"model_repo": "FunAudioLLM/CosyVoice-300M",`  
    `"weights_sha256": "8a7c29e1f5d4a3b8...",`  
    `"quantization": "FP16"`  
  `},`  
  `"conditioning": {`  
    `"strategy": "ZERO_SHOT_CLONE",`  
    `"reference_voice_path": "voices/wiregrass-basin/versions/billie_fae_v1.wav",`  
    `"reference_sha256": "7b3e1c9d2f4a5e6b...",`  
    `"speaker_embedding_cache": "voices/wiregrass-basin/embeddings/billie_fae_v1.pt"`  
  `},`  
  `"base_dsp_modifiers": {`  
    `"basePitchShiftSemitones": -3.2,`  
    `"formantWarpingFactor": 1.12,`  
    `"speedScalar": 0.82,`  
    `"baseBreathiness": 2.40,`  
    `"baseVocalFry": 0.60`  
  `},`  
  `"dynamics_and_eq": {`  
    `"high_pass_cutoff_hz": 75.0,`  
    `"de_esser_threshold_db": -22.0,`  
    `"de_esser_frequency_hz": 6200.0,`  
    `"target_integrated_lufs": -16.0,`  
    `"brickwall_true_peak_dbtp": -1.0`  
  `}`  
`}`

> * **Acoustic Rationale:** Formant scaling at 1.12 expands the virtual pharynx, while the −3.2 semitone drop places her fundamental pitch in the gravelly range. The elevated vocalFryDensity: 0.60 injects subharmonic periodic pulses on sentence decay, signaling physical exhaustion and decades of toxin exposure.

#### **Case Study C: ORACLE-7 (deep-space-salvage)**

> * **Dramaturgical Profile:** An autonomous ship telemetry core executing hazard warnings and orbital calculations within depressurized hulls.  
> * **Aesthetic Needs:** Vector-flat clarity, narrow-band RF filtering, severe digital hard-clipping, total absence of acoustic room reflections.  
> * **Multiplexed Engine:** **Kokoro-82M (Compact Style-TTS2 Variant)**.

`{`  
  `"tts_engine": "Kokoro-82M",`  
  `"checkpoint": {`  
    `"model_repo": "hexgrad/Kokoro-82M",`  
    `"weights_sha256": "1c2d3e4f5a6b7c8d...",`  
    `"quantization": "FP32"`  
  `},`  
  `"conditioning": {`  
    `"strategy": "SPEAKER_VECTOR",`  
    `"speaker_id": "synthetic_telemetry_neutral_01"`  
  `},`  
  `"base_dsp_modifiers": {`  
    `"basePitchShiftSemitones": 0.0,`  
    `"formantWarpingFactor": 1.00,`  
    `"speedScalar": 1.25,`  
    `"baseBreathiness": 1.00,`  
    `"baseVocalFry": 0.00`  
  `},`  
  `"dynamics_and_eq": {`  
    `"high_pass_cutoff_hz": 300.0,`  
    `"high_pass_slope_db_oct": 48,`  
    `"low_pass_cutoff_hz": 3400.0,`  
    `"low_pass_slope_db_oct": 48,`  
    `"bit_depth_reduction": 12,`  
    `"target_integrated_lufs": -16.0,`  
    `"brickwall_true_peak_dbtp": -1.0`  
  `}`  
`}`

> * **Acoustic Rationale:** Kokoro-82M delivers sub-100 ms inference latency on pure CPU with near-zero memory footprint (\~350 MB RAM). Rigid 48 dB/octave bandpass filters at 300 Hz and 3,400 Hz instantly create an authentic spacecraft comms channel, while the complete eradication of vocal fry (Φ=0.0) and breathiness (Π=1.0) reinforces its cold synthetic origin.

#### **Series-Specific Pronunciation Dictionaries (lexicon.json)**

Before passing dialogue text to any neural vocoder, audio-microservice executes a series-local Grapheme-to-Phoneme (G2P) replacement pass to prevent mispronunciations of invented vocabulary:

> * **under-the-floorboards/lexicon.json:** Overrides goblin slapstick nouns (e.g., "siphon" → "SAI-fun", "Snerk" → "SNERK", "Grissel" → "GRIZ-zul").  
> * **wiregrass-basin/lexicon.json:** Enforces Southern Gothic regional cadences and chemical nouns (e.g., "culvert" → "KULL-vert", "Gallbreaker" → "GAWL-bray-ker", "creosote" → "KREE-uh-soht", "d'you" → "dee-yoo").  
> * **deep-space-salvage/lexicon.json:** Overrides technical telemetry acronyms (e.g., "EVA" → "EE-vee-ay", "RCS" → "AHR-see-ess", "kpa" → "KIL-oh-pas-kahlz").

### **6\. Host Resource Management, Memory Lifecycle & Concurrency Invariants**

Because audio-microservice runs concurrently alongside the Conductor (worker-sower-conductor), code generation scripts (generate-episode-repo.ts), and Remotion headless Chromium workers on Rig 1, memory and CPU thread consumption are governed by strict operational limits:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1 SYSTEM MEMORY POOL (64 GB TOTAL SYSTEM RAM)                      │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Remotion Headless Chromium CLI: ~12.0 GB RAM                         │`  
`│ • worker-sower-conductor & Node.js Runtime: ~4.0 GB RAM                │`  
`│ • OS Kernels, NVMe Buffers, Page Caches: ~8.0 GB RAM                   │`  
`│ • Free Safety Buffer: ~32.0 GB RAM                                     │`  
`│ • AUDIO-MICROSERVICE ALLOCATION CEILING: Exactly 8.0 GB RAM            │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RESIDENT ENGINE CACHE (Max 3 Resident Engines / LRU Eviction)          │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ [Slot 1: Active] Piper-ONNX (under-the-floorboards)       ~0.08 GB RAM │`  
`│ [Slot 2: Active] CosyVoice-300M (wiregrass-basin)          ~2.80 GB RAM │`  
`│ [Slot 3: Active] Chatterbox-FP16 (deep-space-salvage)      ~1.50 GB RAM │`  
`│ Total Resident Tensor Footprint:                           ~4.38 GB RAM │`  
`│ Headroom Remaining Under Microservice Ceiling:             ~3.62 GB RAM │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **Least Recently Used (LRU) Engine Eviction Policy**

> * **Resident Slot Limit:** The service caps simultaneously resident engine checkpoints to a maximum of three (*N*max​\=3).  
> * **LRU Hydration & Eviction:** When a line requires an engine not currently warm in memory:  
  1. The daemon checks total resident allocation. If *N*\=3, it identifies the engine with the oldest last\_inference\_timestamp.  
  2. The service invokes engine.tear\_down() on the victim instance, setting its internal model references to None and explicitly invoking Python’s garbage collector (gc.collect()).  
  3. The requested engine initializes via engine.warm\_up(), loading its tensor weights into RAM.  
> * **Single-Threaded Execution Mutex:** To prevent CPU thread contention from causing erratic audio duration jitter during synthesis, the microservice serializes generation through an asynchronous queue lock (asyncio.Lock()). Only one TTS engine executes inference at any given millisecond. This guarantees that ffprobe temporal duration measurements remain deterministic across identical seeds.

### **7\. Cryptographic Provenance, Transitive Hashing & The 4*n*\+1 Blast Radius**

In the studio’s Directed Acyclic Graph (DAG) compilation engine, every Audio Recipe functions as a cryptographic dependency node. Modifying a single parameter in a character recipe (such as changing Billie Fae's speedScalar from 0.82 to 0.86) is treated with the same rigor as modifying screenplay dialogue:

                      `MODIFY RECIPE PARAMETER`  
             `(e.g., Billie Fae speedScalar: 0.82 -> 0.86)`  
                                 `│`  
                                 `▼`  
                     `HMAC-SHA256 Recalculation`  
                                 `│`  
                                 `▼`  
                   `H_recipe Hash Mutation Detected`  
                                 `│`  
         `┌───────────────────────┴───────────────────────┐`  
         `▼                                               ▼`  
`[ INVALIDATED NODES: is_dirty = 1 ]             [ UNTOUCHED / IMMUTABLE ]`  
`• Billie Fae dialogue stems in Wiregrass        • All Bog stems (Under-the-Floorboards)`  
`• Wiregrass exposure_sheet.json frame counts    • All ORACLE-7 stems (Deep-Space-Salvage)`  
`• Wiregrass Remotion FinalComposite cuts        • All unaffected Wiregrass character stems`  
`• ComfyUI plates breaching 4n+1 boundary        • Video plates within temporal margin`

#### **The Recipe Hash (*H*recipe​)**

The recipe digest is computed via a canonicalized HMAC-SHA256 hash across all identity properties:

*H*recipe​\=HMAC-SHA256(SeriesSecret,engine∥weights\_sha∥ref\_sha∥Serialize(base\_dsp)∥lexicon\_sha)

#### **Transitive Dependency Walk & The 4*n*\+1 GPU Compute Firewall**

When *H*recipe​ mutates:

> 1. **Targeted Stem Re-Synthesis:** The compiler walks dialogue\_ast.json. Only lines where speaker \=== "char\_billie\_fae" are scheduled for re-synthesis on audio-microservice. Unaffected characters retain their cached, content-addressed .wav binaries.  
> 2. **Temporal Re-Measurement via ffprobe:** The newly synthesized stem for Shot 03 measures *D*ms, new​\=2,840 ms (contracted from 3,120 ms).  
> 3. **Discrete Integer Frame Quantization:** The Conductor recomputes the discrete 24 fps frame budget:  
>    target\_framesnew​\=⌈(10002840​)×24⌉\=⌈68.16⌉=69 frames(formerly 75 frames)  
> 4. **Diffusion Latent Lattice Evaluation (4*n*\+1 Check):** On Rig 2, the ComfyUI video diffusion spoke previously generated an uncomposited green-screen plate conformed to the 4*n*\+1 temporal lattice:  
>    *n*\=19⟹4(19)+1=77 native frames  
>    Because the new requirement of 69 frames is strictly less than the existing 77-frame plate (69≤77), the compiler **does not re-render the GPU diffusion plate**. Instead, the Remotion optical compositor simply trims an additional 6 frames from the tail of the plate (77−69=8 frames of tail slack).  
> 5. **Total Invalidation Cost:** GPU compute cost on Rig 2 remains **\$0.00**; the entire re-compilation completes on Rig 1 in under 3.5 seconds through local CPU speech synthesis and Remotion headless TSX re-assembly.

---

*User prompt: {{FOCUS: 4\. Series-Specific Pronunciation Dictionaries (lexicon.json) }} /extreme-details*

### **Response: 1\. Operational Mandate & The G2P Failure Modes in Neural TTS**

Neural text-to-speech architectures do not read language semantically; they map tokenized text into acoustic frames through internal Grapheme-to-Phoneme (G2P) rule-sets and learned latent embeddings. When deployed across episodic fiction featuring bespoke worldbuilding, fantasy nomenclature, technical jargon, or regional vernacular, standard out-of-the-box G2P models (such as CMUdict, eSpeak-NG, or g2p-en) exhibit predictable structural failure modes:

> * **Out-of-Vocabulary (OOV) Orthographic Hallucinations:** Invented nouns (e.g., *"Snerk"*, *"Gallbreaker"*, *"hydrazine"*) lack standard phonetic entries. Standard G2P fallbacks apply naive character-level letter-to-sound rules, resulting in inconsistent stress placement, split diphthongs, or dropped syllables across different generation takes.  
> * **Dialectal Cadence Collapse:** Standard TTS engines normalize colloquial dialect spellings into generic American standard pronunciation (flattening regional drawls or colloquialisms) or misinterpret dialect elisions (e.g., synthesizing *"d'you"* as separate staccato syllables *"d"* and *"you"*).  
> * **The Toxic Homophone & Slur Collision Hazard:** In natural language models and speech backends, writing extreme vernacular contractions directly into dialogue prose creates serious safety hazards: speech-to-text safety filters and LLM alignment guardrails frequently flag heavily contracted phonetic spellings as offensive slurs or profanity. The pipeline enforces an invariant: **screenplay prose must remain grammatically readable while acoustic phonetic expansion is isolated to the ingestion layer**.  
> * **Temporal Drift via Variable Syllabification:** If an engine stumbles over an unvetted word, it may stretch vowels or insert hesitation pauses. Because audio duration establishes the non-negotiable physical master clock (24 fps integer cuts derived from *D*ms​), non-deterministic pronunciation directly destabilizes downstream frame budgeting and diffusion plate lengths.

lexicon.json operates as the series-scoped, deterministic phonetic firewall. Located at voices/\<series\_slug\>/lexicon.json, it intercepts the verified verbatim dialogue\_text string emitted by dialogue\_ast.json and executes a deterministic, two-stage grapheme-and-phoneme normalization pass before tensors are passed to the neural vocoder.

### **2\. Machine Contract: The Authoritative lexicon.schema.json**

Every series lexicon must pass strict validation against lexicon.schema.json at build time:

`{`  
  `"$schema": "https://json-schema.org/draft/2020-12/schema",`  
  `"title": "SeriesLexiconSchema",`  
  `"type": "object",`  
  `"required": [`  
    `"schema_version",`  
    `"series_slug",`  
    `"phonetic_alphabet",`  
    `"phonetic_rules",`  
    `"regex_replacements"`  
  `],`  
  `"additionalProperties": false,`  
  `"properties": {`  
    `"schema_version": {`  
      `"type": "string",`  
      `"enum": ["2.0.0"]`  
    `},`  
    `"series_slug": {`  
      `"type": "string",`  
      `"pattern": "^[a-z0-9]+(-[a-z0-9]+)*$"`  
    `},`  
    `"phonetic_alphabet": {`  
      `"type": "string",`  
      `"enum": ["ARPABET", "IPA", "CUSTOM_STRESS_EXPANSION"]`  
    `},`  
    `"phonetic_rules": {`  
      `"type": "object",`  
      `"description": "Exact case-insensitive token mapping to target pronunciation",`  
      `"additionalProperties": {`  
        `"type": "string",`  
        `"minLength": 1`  
      `}`  
    `},`  
    `"regex_replacements": {`  
      `"type": "array",`  
      `"description": "Ordered sequence of non-destructive syntactic expansions",`  
      `"items": {`  
        `"type": "object",`  
        `"required": ["pattern", "replacement", "description"],`  
        `"additionalProperties": false,`  
        `"properties": {`  
          `"pattern": {`  
            `"type": "string",`  
            `"description": "PCRE-compliant regular expression with word boundaries"`  
          `},`  
          `"replacement": {`  
            `"type": "string"`  
          `},`  
          `"description": {`  
            `"type": "string"`  
          `},`  
          `"case_sensitive": {`  
            `"type": "boolean",`  
            `"default": false`  
          `}`  
        `}`  
      `}`  
    `},`  
    `"banned_pronunciations": {`  
      `"type": "object",`  
      `"description": "Negative assertions: target word mapped to banned phonetic outputs",`  
      `"additionalProperties": {`  
        `"type": "array",`  
        `"items": { "type": "string" }`  
      `}`  
    `}`  
  `}`  
`}`

#### **Zod Runtime Validation (src/types/lexicon.ts)**

`import { z } from "zod";`

`export const RegexReplacementSchema = z.object({`  
  `pattern: z.string().min(1),`  
  `replacement: z.string(),`  
  `description: z.string(),`  
  `case_sensitive: z.boolean().default(false)`  
`}).strict();`

`export const SeriesLexiconSchema = z.object({`  
  `schema_version: z.literal("2.0.0"),`  
  `series_slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),`  
  `phonetic_alphabet: z.enum(["ARPABET", "IPA", "CUSTOM_STRESS_EXPANSION"]),`  
  `phonetic_rules: z.record(z.string(), z.string()),`  
  `regex_replacements: z.array(RegexReplacementSchema),`  
  `banned_pronunciations: z.record(z.string(), z.array(z.string())).optional()`  
`}).strict();`

`export type SeriesLexicon = z.infer<typeof SeriesLexiconSchema>;`

### **3\. The Pre-Inference Normalization & Substitution Pipeline**

Within audio-microservice/engines/base.py, text normalization runs in an isolated, deterministic execution sandbox prior to dispatching arrays to the model runtime:

`RAW SCRIPT INGRESS (from dialogue_ast.json: "The siphon wrench is under the culvert.")`  
                                `│`  
                                `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STAGE 1: REGEX SYNTACTIC EXPANSION                                     │`  
`│ • Applies ordered regex_replacements with word-boundary isolation       │`  
`│ • Expands colloquial elisions, metric units, and dialect forms         │`  
`│ • Transforms dialect safely without triggering upstream safety filters │`  
`└───────────────────────────────┬────────────────────────────────────────┘`  
                                `│`  
                                `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STAGE 2: CASE-INSENSITIVE LEXICAL TOKENIZATION                         │`  
`│ • Splits stream into words, punctuation tokens, and whitespace         │`  
`│ • Preserves trailing punctuation (!, ?, .) for prosodic intonation    │`  
`└───────────────────────────────┬────────────────────────────────────────┘`  
                                `│`  
                                `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STAGE 3: PHONETIC LEXICON OVERRIDE LOOKUP                              │`  
`│ • Strips punctuation for lookup against phonetic_rules keys            │`  
`│ • Hit: Replaces token with phonetic string or ARPAbet phoneme sequence │`  
`│ • Miss: Forwards token to engine default G2P fallback                  │`  
`└───────────────────────────────┬────────────────────────────────────────┘`  
                                `│`  
                                `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STAGE 4: ENGINE-SPECIFIC PHONEME ADAPTATION                            │`  
`│ • Piper/ONNX: Maps directly to internal phoneme ID tokens              │`  
`│ • CosyVoice: Formats as SSML/phoneme tag or phonetic text string       │`  
`│ • Parler-TTS: Formats as phonetically spelled syllables with caps stress│`  
`└───────────────────────────────┬────────────────────────────────────────┘`  
                                `│`  
                                `▼`  
         `DISPATCHED TO NEURAL SYNTHESIS ENGINE (float32 PCM 48 kHz)`

#### **The Normalization Algorithm (audio-microservice/normalization/pipeline.py)**

`import re`  
`import string`  
`from typing import Dict, List, Any`  
`from pydantic import BaseModel`

`class NormalizationEngine:`  
    `def __init__(self, lexicon_data: Dict[str, Any]):`  
        `self.alphabet = lexicon_data["phonetic_alphabet"]`  
        `self.phonetic_rules = {k.lower(): v for k, v in lexicon_data["phonetic_rules"].items()}`  
        `self.regex_replacements = lexicon_data["regex_replacements"]`  
          
        `# Pre-compile regexes for zero per-line compilation latency`  
        `self._compiled_regexes = []`  
        `for rule in self.regex_replacements:`  
            `flags = 0 if rule.get("case_sensitive", False) else re.IGNORECASE`  
            `self._compiled_regexes.append((`  
                `re.compile(rule["pattern"], flags),`  
                `rule["replacement"]`  
            `))`

    `def normalize(self, raw_text: str) -> str:`  
        `# 1. Sequential Regex Substitution Pass`  
        `normalized_text = raw_text`  
        `for pattern, replacement in self._compiled_regexes:`  
            `normalized_text = pattern.sub(replacement, normalized_text)`

        `# 2. Tokenize preserving punctuation attachments`  
        `# Match sequences of word characters vs non-word characters`  
        `tokens = re.findall(r"[\w'-]+|[^\w\s]|\s+", normalized_text)`  
          
        `processed_tokens: List[str] = []`  
        `for token in tokens:`  
            `# Skip pure whitespace or standalone punctuation`  
            `if token.isspace() or token in string.punctuation:`  
                `processed_tokens.append(token)`  
                `continue`  
              
            `# Extract clean lookup lemma by stripping wrapping punctuation/hyphens`  
            `lookup_key = token.strip(string.punctuation).lower()`  
              
            `if lookup_key in self.phonetic_rules:`  
                `target_phonemes = self.phonetic_rules[lookup_key]`  
                `# Re-attach any stripped punctuation (e.g. "siphon," -> "SAI-fun,")`  
                `prefix = token[:len(token) - len(token.lstrip(string.punctuation))]`  
                `suffix = token[len(token.rstrip(string.punctuation)):]`  
                `processed_tokens.append(f"{prefix}{target_phonemes}{suffix}")`  
            `else:`  
                `processed_tokens.append(token)`

        `return "".join(processed_tokens)`

### **4\. Dialect Mechanics & The NLP Homophone / Slur Collision Defense**

A critical vulnerability in generative audio production is the tension between authorial naturalism and machine safety filters. In Southern Gothic, rural noir, or working-class dialect scripts, screenwriters frequently employ contractions that trigger algorithmic censorship:

*"NLP models misread heavy phonetic dialect as slurs. Spell out grammatical words even if the voice track delivers a heavy contraction."*

#### **The Dual-Layer Separation of Concerns**

The multi-repository studio fleet permanently divorces **Screenplay AST Grammar** from **Synthesized Acoustic Delivery**:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ REPO: worker-sower-engine / goblin-lore (Screenplay AST Domain)        │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • AST contains clean, standard grammatical English:                    │`  
`│   "Do you hear what they are saying in the culvert?"                   │`  
`│ • Screenplay linters verify standard orthography                       │`  
`│ • Zero safety breaches across Cloudflare AI / OpenAI guardrails        │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Verbatim AST Transfer`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ REPO: audio-microservice / voices/wiregrass-basin/ (Acoustic Ingress)  │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Ingress receives: "Do you hear what they are saying..."              │`  
`│ • regex_replacements transforms: "Do you" ──► "dee-yoo"                │`  
`│ • phonetic_rules transforms: "culvert"   ──► "KULL-vert"               │`  
`│ • Ingested by CosyVoice: "dee-yoo hear what they are saying..."        │`  
`│ • Synthesized WAV delivers heavy regional Southern drawl perfectly    │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ REPO: worker-sower-conductor (Acoustic Master Timeline)                │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • ffprobe measures 48 kHz stem duration                                │`  
`│ • Remotion mounts stem onto master exposure sheet                      │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Safety Compliance Guarantee:** The raw screenplay and canonical D1 database remain 100% clean of ambiguous phonetic slang that could trigger content moderation shutdowns.  
> * **Acoustic Authenticity:** The local audio-microservice daemon performs dialect expansion offline on Rig 1, where zero external cloud API content filters exist, allowing authentic regional performance without systemic compromise.

### **5\. Multi-Series Lexicon Implementations**

Because series are strictly segregated under top-level namespaces (voices/\<series\_slug\>/), lexicons never contaminate each other. A rule mapping *"siphon"* in under-the-floorboards has zero visibility in wiregrass-basin or deep-space-salvage.

#### **Case Study A: voices/under-the-floorboards/lexicon.json**

> * **World Axiom:** Fast, anxious domestic goblin farce beneath kitchen floorboards.  
> * **Phonetic Strategy:** High-pitched, clipped consonant emphasis, stress on front-of-mouth plosives.

`{`  
  `"schema_version": "2.0.0",`  
  `"series_slug": "under-the-floorboards",`  
  `"phonetic_alphabet": "CUSTOM_STRESS_EXPANSION",`  
  `"phonetic_rules": {`  
    `"siphon": "SAI-fun",`  
    `"snerk": "SNERK",`  
    `"grissel": "GRIZ-zul",`  
    `"marrow-bone": "MAIR-oh-BOHN",`  
    `"floor-timbers": "FLOR-TIM-berz",`  
    `"skitter": "SKIT-ter",`  
    `"tallow": "TAL-oh",`  
    `"peevish": "PEE-vish"`  
  `},`  
  `"regex_replacements": [`  
    `{`  
      `"pattern": "\\b(d'you)\\b",`  
      `"replacement": "dyoo",`  
      `"description": "Contracts 'd'you' to quick goblin dental glide"`  
    `},`  
    `{`  
      `"pattern": "\\b(gotta)\\b",`  
      `"replacement": "GAHT-tuh",`  
      `"description": "Forces clipped staccato on glottal stop"`  
    `},`  
    `{`  
      `"pattern": "\\b(underneath)\\b",`  
      `"replacement": "un-ner-NEETH",`  
      `"description": "Flattens 'd' sound for subterranean colloquial speech"`  
    `},`  
    `{`  
      `"pattern": "\\b(\\d+)\\s*(in|inch|inches)\\b",`  
      `"replacement": "$1 IN-chez",`  
      `"description": "Expands dimensional measurements for hoarded items"`  
    `}`  
  `],`  
  `"banned_pronunciations": {`  
    `"siphon": ["SEE-fon", "sih-FON"],`  
    `"grissel": ["GRIZ-lee", "gray-SEL"]`  
  `}`  
`}`

#### **Case Study B: voices/wiregrass-basin/lexicon.json**

> * **World Axiom:** Southern Gothic industrial noir, chemical defoliant runoff, heavy laryngeal wear.  
> * **Phonetic Strategy:** Elongated diphthongs, dropping terminal g’s, dark unreleased plosives.

`{`  
  `"schema_version": "2.0.0",`  
  `"series_slug": "wiregrass-basin",`  
  `"phonetic_alphabet": "CUSTOM_STRESS_EXPANSION",`  
  `"phonetic_rules": {`  
    `"culvert": "KULL-vert",`  
    `"gallbreaker": "GAWL-bray-ker",`  
    `"creosote": "KREE-uh-soht",`  
    `"slough": "SLOO",`  
    `"diesel": "DEEZ-ul",`  
    `"spurl": "SPERL",`  
    `"defoliant": "dee-FOH-lee-unt",`  
    `"wiregrass": "WY-er-grass"`  
  `},`  
  `"regex_replacements": [`  
    `{`  
      `"pattern": "\\b(ain't)\\b",`  
      `"replacement": "aynt",`  
      `"description": "Standardizes dialect negation without nasal pinch"`  
    `},`  
    `{`  
      `"pattern": "\\b(do you)\\b",`  
      `"replacement": "dee-yoo",`  
      `"description": "Softens interrogative onset into regional drawl"`  
    `},`  
    `{`  
      `"pattern": "\\b(\\w+)ing\\b",`  
      `"replacement": "$1-in'",`  
      `"description": "Enforces dropped alveolar nasals across all continuous verbs"`  
    `},`  
    `{`  
      `"pattern": "\\b(drainage)\\b",`  
      `"replacement": "DRAY-nij",`  
      `"description": "Prevents over-enunciation of second syllable"`  
    `}`  
  `],`  
  `"banned_pronunciations": {`  
    `"slough": ["SLUFF", "SLOH"],`  
    `"creosote": ["kree-OH-soht"]`  
  `}`  
`}`

#### **Case Study C: voices/deep-space-salvage/lexicon.json**

> * **World Axiom:** Hard sci-fi telemetry, depressurized radio channels, NASA-spec acronyms.  
> * **Phonetic Strategy:** Military NATO cadence, hard syllabic separation, letter-by-letter expansion.

`{`  
  `"schema_version": "2.0.0",`  
  `"series_slug": "deep-space-salvage",`  
  `"phonetic_alphabet": "ARPABET",`  
  `"phonetic_rules": {`  
    `"apogee": "AE1 P AH0 JH IY0",`  
    `"perigee": "P EH1 R AH0 JH IY0",`  
    `"eva": "IY1 V IY1 EY1",`  
    `"rcs": "AA1 R S IY1 EH1 S",`  
    `"hydrazine": "HH AY1 D R AH0 Z IY2 N",`  
    `"bulkhead": "B AH1 L K HH EH2 D",`  
    `"oracle": "AO1 R AH0 K AH0 L"`  
  `},`  
  `"regex_replacements": [`  
    `{`  
      `"pattern": "\\b(\\d+)\\s*(kpa|kilopascals?)\\b",`  
      `"replacement": "$1 KIL-oh-pas-kahlz",`  
      `"description": "Metric pressure telemetry expansion"`  
    `},`  
    `{`  
      `"pattern": "\\b(\\d+)\\s*(m/s|meters per second)\\b",`  
      `"replacement": "$1 MEE-terz per SEK-und",`  
      `"description": "Velocity vector expansion"`  
    `},`  
    `{`  
      `"pattern": "\\b(atmo)\\b",`  
      `"replacement": "AT-moh",`  
      `"description": "Salvage slang for atmosphere"`  
    `},`  
    `{`  
      `"pattern": "\\b(o2)\\b",`  
      `"replacement": "OH-TOO",`  
      `"description": "Life-support gas telemetry"`  
    `}`  
  `],`  
  `"banned_pronunciations": {`  
    `"eva": ["EE-vah"],`  
    `"rcs": ["er-SEE-ess"]`  
  `}`  
`}`

### **6\. Cryptographic Provenance & Transitive Blast Radius**

In the studio’s Directed Acyclic Graph (DAG) governance model, lexicon.json is not an unversioned helper file; it is an active dependency node that anchors directly into voice\_manifest.json and the overarching render\_manifest.json:

               `SERIES LEXICON (voices/under-the-floorboards/lexicon.json)`  
                                         `│`  
                                         `▼`  
                     `Canonical Serialization & SHA-256 Hash`  
                                         `│`  
                                         `▼`  
                                  `lexicon_sha256`  
                                         `│`  
                     `┌───────────────────┴───────────────────┐`  
                     `▼                                       ▼`  
       `voices/voice_manifest.json                 render_manifest.json`  
       `(Baked into H_recipe digest)               (Root Provenance Seal)`

#### **The Lexicon Hash (*H*lexicon​) & Recipe Binding**

> 1. **Canonical JSON Serialization:** The compiler loads lexicon.json, sorts all keys alphabetically, eliminates non-semantic whitespace, and computes a SHA-256 digest:  
>    *H*lexicon​\=SHA-256(Canonicalize(lexicon.json))  
> 2. **Recipe Digest Injection:** Every character recipe inside voice\_manifest.json incorporates *H*lexicon​ into its identity digest:  
>    *H*recipe​\=HMAC-SHA256(Secret,Engine∥WeightsSHA∥RefSHA∥BaseDSP∥*H*lexicon​)

#### **Worked Blast Radius Execution Walk**

When an engineer updates an entry in voices/under-the-floorboards/lexicon.json (e.g., refining "siphon": "SAI-fun" → "SAI-fawn"):

`1. GIT COMMIT COMMITTED ──► lexicon_sha256 mutates`  
                                `│`  
                                `▼`  
`2. H_recipe INVALIDATION ──► All recipes in under-the-floorboards marked is_dirty = 1`  
                                `│`  
                                `▼`  
`3. AST SCAN ──► Compiler inspects drafts/dialogue_ast.json for "siphon"`  
                                `│`  
       `┌────────────────────────┴────────────────────────┐`  
       `▼                                                 ▼`  
`[ CONTAINS TARGET TOKEN ]                       [ DOES NOT CONTAIN TOKEN ]`  
`Shot 01: "...hand over the siphon wrench."      Shot 02: "I carried the rations!"`  
`• Stem ep040_sh01.wav marked dirty              • Stem cached; untouched (is_dirty = 0)`  
`• Dispatched to audio-microservice (:8000)      • Zero CPU re-synthesis`  
`• Audio duration re-measured via ffprobe        • Frame count preserved`  
`• target_frames re-derived for Sequence 01      • Visual Plate retained`

> * **Lexical Selective Invalidation:** Unlike a global checkpoint update that re-renders all lines, the compiler scans the dialogue lines of the scene. If a line's dialogue\_text does not intersect with the mutated lexicon lemma or regex pattern, its content-addressed .wav stem is certified clean and skipped.  
> * **Downstream Timeline Protection:** If the new pronunciation expands or contracts the stem by even a few milliseconds, ffprobe re-measures duration, updates exposure\_sheet.json, and recalculates downstream cut points without inducing sub-frame visual jitter or breaking multi-track ducking automation.

---

*User prompt: {{FOCUS: The Audio Recipe Book Fields}} /extreme-details*

Response: The **Audio Recipe Book Fields** are the standardized metadata and configuration fields governing vocal synthesis within the multi-repository studio production fleet. Managed within **04 \- AUDIO & DIALOGUE LAB** (POD-05: Audio Pod), these fields eliminate the operational gap where synthesized master audio stems exist without the generative parameters necessary to reconstruct or audit the performance.

By standardizing vocal generation baselines across disparate neural text-to-speech (TTS) engines, these fields establish an immutable contract that bridges performer casting, legal rights clearance, acoustic synthesis, and timeline assembly.

### **1\. Structural Mandate & Epistemic Origin of the Recipe Book**

The requirement for the Audio Recipe Book emerged from a structural flaw in early production iterations of the Audio Pod (POD-05):

> * **The Historical Reconstruction Defect:** Early specifications for POD-05 mandated the delivery of master uncompressed .wav files and timecode JSON maps to downstream pods, but omitted the generative recipe required to recreate that exact performance months or years later.  
> * **The Deletion Principle Boundary:** Under the studio's architectural Deletion Principle, if all generative models were deleted, canonical truth would remain intact inside the relational ledger. However, generated media is inherently archive-dependent: neural speech synthesis cannot be regenerated bit-for-bit from prompt seeds alone due to non-deterministic CUDA floating-point math, driver revisions, and vocoder library variances.  
> * **The Section 5.2 Contract Amendment:** To resolve this defect, the POD-05 Section 5.2 output contract was formally updated to require the Audio Recipe Book metadata fields on every discrete dialogue task.  
> * **Reproducibility vs. Auditability:** The fields resolve two distinct systemic needs: *reproducibility* (can the performance be mechanically regenerated?) and *auditability* (can the pipeline explain why and from which assets it was created?). The Audio Recipe Book ensures that any synthesized stem can be traced back to its model weights, performer consent agreements, and baseline acoustic offsets.

### **2\. Exhaustive Breakdown of the Three Required Core Fields**

Within POD-05 (Audio List), every character voice profile and dialogue generation task mandates three dedicated technical fields:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│             AUDIO RECIPE BOOK: THE THREE MANDATORY FIELDS              │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. TTS Model Used         ──► Architecture, checkpoint, & release tag  │`  
`│ 2. Voice Clone/Speaker ID ──► Performer reference hash & consent seed   │`  
`│ 3. Pacing/Pitch Modifiers ──► Neutral biological DSP baseline offsets  │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **Field 1: TTS Model Used**

> * **Field Type & Location:** Text / Dropdown within POD-05 Audio List.  
> * **Core Function:** Pins the specific neural speech synthesis model architecture, checkpoint version, and quantization variant executed by audio-microservice on local port 8000\.  
> * **Standard Implementations:** Typically specifies runtimes such as **Parler-TTS v0.1** (or Parler-TTS-Mini), **Chatterbox** (e.g., Chatterbox-Base-FP16), **CosyVoice** (e.g., CosyVoice-300M), or **Piper**.  
> * **Technical Invariant:** Neural vocoder architectures possess fundamentally different latent spaces and prosodic behaviors. Coupling voice profiles to an explicit model identifier prevents "model drift," ensuring that upstream neural model upgrades or vendor alterations do not silently mutate character vocal resonance or speech cadence.

#### **Field 2: Voice Clone / Speaker ID**

> * **Field Type & Location:** Text within POD-05 Audio List.  
> * **Core Function:** Identifies the unique performer seed, acoustic reference recording identifier, or speaker embedding vector used to condition the vocoder's latent space.  
> * **Legal & Clearance Binding:** Binds directly to the Talent & Casting Pod (POD-04) and Legal & Provenance Pod (POD-01). Every performer reference recording must be paired with clear documentation of its contractual use boundaries (such as SAG-AFTRA digital voice likeness riders). Downstream pods are strictly prohibited from mutating or reinterpreting what a cleared package covers.  
> * **Locked Voice Consistency Invariant:** Governed by the POD-05 boundary value of *locked voice consistency over per-scene optimization*. The Audio Pod must reuse Talent & Casting's approved reference audio/seeds across all scenes rather than re-tuning vocal characteristics scene-by-scene, preserving character continuity even if an alternate seed might sound marginally better in isolation.

#### **Field 3: Pacing / Pitch Modifiers**

> * **Field Type & Location:** Text / Parameterized String within POD-05 Audio List.  
> * **Core Function:** Declares the baseline physical transformations applied to the character's neutral delivery before scene-level dramatic conditions are introduced.  
> * **Concrete Parameter Expressions:**  
  * **Branksi Profile:** Documented explicitly with **\-15% speed, \+5% breathiness**. This establishes a compressed, labored cadence representing physical exhaustion and diaphragmatic drag.  
  * **Billie Fae Profile:** Documented explicitly with **gravelly drawl parameters**. This injects lower fundamental pitch contours, extended vowel durations, and subharmonic vocal fry into her baseline register.  
> * **Decoupling from Emotional State:** These modifiers establish the biological constant of the character's vocal tract and respiratory system in a neutral state, preventing the system from confusing inherent physical anatomy with temporary emotional reaction.

### **3\. Cross-Pod Interfacing & Lifecycle Boundary Conditions**

The Audio Recipe Book serves as the primary coordination bridge across multiple studio pods:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ POD-04: TALENT & CASTING                                               │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Negotiates performer agreements & voice likeness licenses            │[cite: 33]`  
`│ • Captures clean studio reference takes meeting POD-05 capture specs   │[cite: 33]`  
`│ • Emits cleared reference package + strict use-boundary metadata       │[cite: 33]`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Certified Performer Seed / Audio Take[cite: 33]`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ POD-05: AUDIO & DIALOGUE LAB (The Audio Recipe Book)                   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Registers: TTS Model Used + Voice Clone ID + Pacing/Pitch Modifiers  │[cite: 5, 6, 19]`  
`│ • Synthesizes dialogue stems on Rig 1 via audio-microservice (:8000)   │[cite: 1, 3]`  
`│ • Conforms stems: -16 LUFS (±1.0 LUFS) & True-Peak ≤ -1.0 dBTP         │[cite: 1]`  
`│ • Measures duration_ms via ffprobe & emits integer frame budget        │[cite: 1, 49]`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Master WAV Stems + Exposure Sheet[cite: 1, 49]`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ DOWNSTREAM PODS (POD-10 Assembly / POD-18 Mastering & QC)              │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Mounts Track 1 dialogue stems onto programmatic Remotion timeline    │[cite: 1, 7]`  
`│ • Applies programmatic sidechain ducking (-14 dB floor, 6f A / 12f R)   │[cite: 1, 30]`  
`│ • Strict Invariant: Zero downstream mutation of voice parameters       │[cite: 33, 51]`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Talent & Casting (POD-04) Interface:** POD-04 provides the physical source reference and licensing scope. The use-boundary documentation is treated as inseparable from the reference file itself. Downstream pods are strictly barred from reinterpreting agreements (e.g., using a reference cleared only for primary dialogue in foreign-language localization without confirmation).  
> * **Narrative (POD-08) Interface:** Ingests character descriptions, surface wants, actual wants, and dialogue lines from dialogue\_ast.json. The literal string in dialogue\_text is synthesized using the exact recipe configured for that character ID.  
> * **Mastering & QC (POD-18) Interface:** POD-18 audits all output stems against technical broadcast specifications. Spec compliance is absolute: stems must pass an automated loudness pass targeting integrated **\-16 LUFS** (±1.0 LUFS) with a True-Peak ceiling of **≤ \-1.0 dBTP**.  
> * **Absolute Timing Lock:** Under POD-05 operating principles, once a track is synthesized, conformed, and approved, its timing and recipe parameters are permanently locked. The pod does not have discretion to revise audio stems informally; any modification requires an explicit revision cycle.

### **4\. Composition with Runtime Somatic & Emotional Modifiers**

The static fields in the Audio Recipe Book do not operate in a vacuum; they compose algebraically with runtime modifiers declared in the world ledger:

`┌────────────────────────────────────────────────────────┐`  
`│ AUDIO RECIPE BOOK (POD-05 / voice_manifest.json)       │`  
`│ • Neutral baseline speed (e.g., -15% for Branksi)      │`  
`│ • Neutral breathiness    (e.g., +5% for Branksi)       │`  
`│ • Neutral pitch/drawl    (Billie Fae parameters)       │`  
`└───────────────────────────┬────────────────────────────┘`  
                            `│`  
                            `│ Algebraic Composition Channel[cite: 24, 30]`  
                            `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ WORLD CONDITIONS LEDGER (world/conditions.md)          │`  
`│ • Maps emotional states directly to DSP parameters     │`  
`│ • e.g., "humiliated" forces trailing pauses & ellipses │`  
`│ • Injects dynamic tension scalars and temperature dB   │`  
`└───────────────────────────┬────────────────────────────┘`  
                            `│`  
                            `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ EFFECTIVE RUNTIME INGRESS TO TTS MICROSERVICE (:8000)  │`  
`│ • Speed_eff       = Recipe_Base_Speed + Scene_Delta    │`  
`│ • Breathiness_eff = Recipe_Base_Breath * Scene_Scale   │`  
`│ • Synthesizes 48 kHz Linear PCM WAV                    │`  
`└────────────────────────────────────────────────────────┘`

> * **world/conditions.md Integration:** Acts as the single-source taxonomy mapping emotional states directly to audio DSP parameters (speed modifiers, temperature, gain dB) and syntactic prompt constraints. For example, the condition "humiliated" forces ellipses and trailing, uncompleted sentences in synthesized TTS output.  
> * **Algebraic Composition:** When a scene requires an emotional shift (e.g., a character experiencing severe panic), the conductor takes the character's base recipe fields (e.g., Branksi's \-15% speed) and composes them with the condition delta from world/conditions.md. The base recipe ensures Branksi's signature physical exhaustion remains present even when he is screaming or speaking in panic.  
> * **Dialogue AST Mapping:** In dialogue\_ast.json, each line delivers the literal dialogue\_text, the dramatic subtext (informing inflection without being spoken), the conditions/emotion tag, and optional dsp\_modifiers. The local microservice evaluates these inputs against the character's locked recipe to synthesize the final 48 kHz .wav file.

### **5\. Machine Schema Representation**

Within audio-microservice and series configuration manifests (e.g., series.config.json and voice\_manifest.json), the Audio Recipe Book fields are codified into machine-validated schemas:

`{`  
  `"$schema": "https://specs.studio.internal/schemas/v2/voice_recipe.json",`  
  `"character_id": "char_branksi",`  
  `"series_slug": "under-the-floorboards",`  
  `"recipe": {`  
    `"tts_model_used": "Parler-TTS v0.1",`  
    `"voice_clone_speaker_id": "spk_branksi_ref_v02",`  
    `"pacing_pitch_modifiers": {`  
      `"speed_scalar": 0.85,`  
      `"breathiness_multiplier": 1.05,`  
      `"pitch_shift_semitones": 0.0,`  
      `"formant_warping": 1.00,`  
      `"vocal_fry_density": 0.15`  
    `},`  
    `"textual_description": "-15% speed, +5% breathiness",`  
    `"legal_clearance": {`  
      `"contract_id": "SAG-AFTRA-VOX-2026-0089",`  
      `"scope": ["EPISODIC_SYNTHESIS", "IN_WORLD_MARKETING"],`  
      `"verified": true`  
    `}`  
  `}`  
`}`

`{`  
  `"$schema": "https://specs.studio.internal/schemas/v2/voice_recipe.json",`  
  `"character_id": "char_billie_fae",`  
  `"series_slug": "wiregrass-basin",`  
  `"recipe": {`  
    `"tts_model_used": "Chatterbox",`  
    `"voice_clone_speaker_id": "spk_billie_fae_master_take",`  
    `"pacing_pitch_modifiers": {`  
      `"speed_scalar": 0.82,`  
      `"breathiness_multiplier": 1.40,`  
      `"pitch_shift_semitones": -2.8,`  
      `"formant_warping": 1.10,`  
      `"vocal_fry_density": 0.55`  
    `},`  
    `"textual_description": "gravelly drawl parameters",`  
    `"legal_clearance": {`  
      `"contract_id": "SAG-AFTRA-VOX-2026-0142",`  
      `"scope": ["EPISODIC_SYNTHESIS"],`  
      `"verified": true`  
    `}`  
  `}`  
`}`

### **6\. Temporal Master Clock Integration & Timeline Packaging**

Once speech synthesis completes using the Recipe Book parameters, the resulting audio buffer directly drives the pipeline's temporal architecture:

`AUDIO DOMAIN (Sample-Accurate Waveform: 48,000 samples/sec)`  
`│`  
`├── duration_ms = 3,120 ms (Empirically measured via ffprobe)`  
`└── Passes LUFS & Peak Gate (-16 LUFS / -1.0 dBTP)`  
`│`  
`▼ Discrete Integer Frame Derivation: target_frames = ceil((3120 / 1000) * 24) = 75 frames`  
`VIDEO DOMAIN (Master Media Timeline: 24 frames/sec)`  
`│`  
`├── Track 1: Mounted at absolute frame coordinates (<Sequence from={atFrame} />)`  
`├── Track 2: Punctual Foley events (Mulberry32 PRNG seeded via sceneId:shotId:sampleKey)`  
`└── Track 3: Continuous Ambient Bed (Programmatic gain ducking: -14 dB floor, 6f A / 12f R)`

> * **Observation vs. Derivation Decoupling:** In the exposure sheet, the physical audio measurement (duration\_ms via ffprobe) is decoupled from the derived frame count (target\_frames \= ceil(duration\_ms \* 24 / 1000)). This preserves physical acoustic truth independently of delivery frame rates.  
> * **Multi-Track Gain Automation:** Spoken dialogue on Track 1 governs dynamic sidechain attenuation on Track 3\. When dialogue is active, background beds attenuate by **\-14 dB** via a 6-frame quadratic attack (*A*\=6, ≈250 ms) and recover over a 12-frame quadratic release (*R*\=12, ≈500 ms) during dialogue gaps.  
> * **Immutable Exposure Sheet Freezing:** Approved stems are sealed into public/audio/dialogue/ and locked in exposure\_sheet.json. They are never re-synthesized at visual render time, ensuring that subtle sample jitter or vocoder variance cannot invalidate visual diffusion plate budgets or downstream optical compositing cuts.

---

*User prompt: {{FOCUS: 1\. The Epistemological Triad of Voice Identity}} /extreme-details*

Response: The **Epistemological Triad of Voice Identity** formalizes the boundary between abstract narrative state and physical sound synthesis within audio-microservice and the studio's production fleet. In an event-sourced architecture governed by the separation of semantic meaning (Axis A) from untrusted media projection (Axis B), generative models—including Large Language Models (LLMs), neural Text-to-Speech (TTS), and video diffusion backends—operate strictly as untrusted, headless execution workers possessing zero narrative, spatial, or temporal authority. Canonical reality resides exclusively in an immutable relational ledger.

A character’s voice cannot be captured by a standalone audio buffer (.wav), an unversioned speaker identification tag, or a natural language prompt string. Because neural vocoders and autoregressive audio models are prone to non-deterministic drift, statistical median regression ("The Beige Plague"), and loss of identity across long production runs, voice identity is codified as an irreducible tripartite contract:

                     `┌────────────────────────────────────────┐`  
                     `│       CANONICAL VOCAL IDENTITY TRIAD   │`  
                     `└───────────────────┬────────────────────┘`  
                                         `│`  
         `┌───────────────────────────────┼───────────────────────────────┐`  
         `▼                               ▼                               ▼`  
`┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐`  
`│   1. MODEL CHECKPOINT  │  │   2. SPEAKER EMBEDDING │  │   3. BASELINE DSP      │`  
`│   & ENGINE ADAPTER     │  │   & CONDITIONING TOKEN │  │   PARAMETER VECTOR     │`  
`├────────────────────────┤  ├────────────────────────┤  ├────────────────────────┤`  
`│ • Architecture Enum    │  │ • Pinned Reference WAV │  │ • Fundamental Pitch F0 │`  
`│ • Checkpoint Weights   │  │ • Latent Tensor (.pt)  │  │ • Formant Warping (W)  │`  
`│   SHA-256 Digest       │  │ • Conditioning Prompt  │  │ • Neutral Speed Scalar │`  
`│ • Execution Graph Hash │  │ • Pinned Performer ID  │  │ • Diaphragmatic Breath │`  
`│ • Quantization Variant │  │ • Legal Clearance Tag  │  │ • Subharmonic Fry (Φ)  │`  
`└────────────────────────┘  └────────────────────────┘  └────────────────────────┘`

This triad governs how character embodiment, dramatic subtext, and biological trauma translate into uncompressed 48 kHz linear PCM waveforms.

### **1\. Epistemic Grounding: Projecting State into Acoustic Reality**

The Triad of Voice Identity acts as the physical acoustic realization of the system's governing epistemological law:

WorldTruth=InternalBelief=ExternalUtterance  
`CANONICAL STATE LEDGER (Cloudflare D1 / SQLite)`  
`├─ Somatic Vector:   Laryngeal trauma, pulmonary capacity, motor restrictions[cite: 5, 11]`  
`├─ Epistemic Vector: BeliefRecord, Ignorance by Omission, horizon constraints[cite: 7, 11, 15]`  
`└─ Logistical Vector: Equipment carried, environmental contact opportunities[cite: 11, 28]`  
                           `│`  
                           `▼`  
`UNTRUSTED PROPOSAL (Dialogue AST Generation via LLM)`  
`└─ Plan-Assigned Act: Generates dialogue_text, subtext, emotion, and reaction cues[cite: 1, 8, 22]`  
                           `│`  
                           `▼ Verbatim Parity Linter (assertVerbatimParity)[cite: 2, 6]`  
                           `▼ Pre-Flight Vocal-Motor Feasibility Gating[cite: 3, 4]`  
`THE VOCAL IDENTITY TRIAD (audio-microservice on Rig 1 :8000)`  
`├─ 1. Model Checkpoint:  Execution engine, deterministic graph, locked weights[cite: 30]`  
`├─ 2. Speaker Embedding: Pinned acoustic reference, cleared likeness seed[cite: 18, 30]`  
`└─ 3. Baseline DSP:      Neutral anatomical geometry composed with somatic trauma deltas[cite: 5, 12, 30]`  
                           `│`  
                           `▼`  
`MASTER PHYSICAL CLOCK (48 kHz / 24-bit Uncompressed PCM WAV)`  
`└─ duration_ms (ffprobe) ──► target_frames = ceil((duration_ms * 24) / 1000)[cite: 2, 5, 27]`

> * **The Epistemic Separation:** WorldTruth stores historical events; InternalBelief isolates what the actor subjectively knows through directional percepts and BeliefRecord schemas; ExternalUtterance realizes dialogue that may contain lies, bluffs, or suppressed subtext.  
> * **The Deletion Principle & Class 3 Evidence:** Under the architecture's storage classifications, derived relational state can be deterministically recomputed by folding events over baseline canon (Replay(H)→S). However, synthesized voice tracks are **Class 3 Archive-Dependent Evidence**: because neural vocoders rely on non-deterministic floating-point math across disparate GPU/CPU kernels, a voice track cannot be deterministically re-generated bit-for-bit from prompt seeds alone. If an intermediate audio file is lost, its exact waveform is gone. Therefore, the parameter triad must be sealed immutably alongside the conformed .wav stem in content-addressed storage (CAS).  
> * **The Acoustic Redaction Test vs. The Beige Plague:** Generative audio models naturally regress toward the statistical median of their training datasets, producing characters with identical, conversational American accents and flattened emotional inflections. To prevent this, candidate voice models must pass the **Acoustic Redaction Battery**: audio stems are pitch-shifted and normalized to strip superficial timbre. An auditor or classifier evaluates the remaining prosody, pause frequency distributions, consonant-attack velocities, and duration-per-syllable metrics. The character's cadential rhythm must remain mathematically distinct and recognizable even in complete acoustic darkness.

### **2\. Triad Component 1: The Model Checkpoint & Engine Adapter**

The first pillar of the triad defines the computational tensor engine responsible for converting phoneme representations into acoustic samples.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ COMPONENT 1: MODEL CHECKPOINT & ENGINE SPECIFICATION                   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • tts_engine: Runtime adapter enum (PIPER_ONNX, COSYVOICE, PARLER, etc)│`  
`│ • checkpoint_repo: Authoritative upstream repository identifier        │`  
`│ • weights_sha256: 64-character hexadecimal digest of binary weights    │`  
`│ • execution_target: Pure CPU / System RAM (0 MB Dedicated GPU VRAM)    │`  
`│ • execution_graph_hash: SHA-256 of compiled ONNX / TorchScript graph   │`  
`│ • precision_format: INT8 / FP16 / FP32 quantization declaration        │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **The Vulnerability of Unpinned Neural Black Boxes**

Relying on proprietary cloud APIs (such as ElevenLabs) or floating rolling releases of open-source weights introduces silent model drift. When an external provider updates a vocoder checkpoint, internal latent spaces warp: vowel formants shift, sentence-ending decay times fluctuate, and breathing pause frequencies alter.

Because continuous audio duration (*D*ms​) measured via ffprobe dictates the discrete integer frame budgets (target\_frames) of visual diffusion plates on Rig 2, an unannounced model update upstream will alter speech duration by a few milliseconds, invalidating downstream video cuts and causing visual lip-sync desynchronization.

#### **Hardware Isolation on Rig 1**

The model adapter is structurally quarantined to Rig 1:

> * **Hardware Demarcation Invariant:** audio-microservice executes entirely on multi-core host CPU threads and system RAM. Dedicated GPU VRAM allocation is strictly clamped to **0 MB**.  
> * **CUDA Contention Prevention:** Dedicated GPU silicon (Rig 2's 24 GB VRAM) is reserved exclusively for heavy visual diffusion tasks (Wan 2.2 / ComfyUI). Quarantining audio model checkpoints to CPU and system RAM prevents CUDA memory fragmentation and out-of-memory (OOM) aborts.

#### **Engine Specialization Topology**

The engine adapter field points to distinct runtimes tailored to specific narrative and latency requirements:

| Engine Runtime Enum | Underlying Architecture | Hardware Profile (Rig 1\) | Real-Time Factor (RTF) | Dramaturgical Specialization |
| :---- | :---- | :---- | :---- | :---- |
| **PIPER\_ONNX** | VITS / FastSpeech2 export via ONNX Runtime | Multi-threaded CPU; **\~80 MB RAM** | ≤0.08× (Instantaneous) | Rapid slapstick comedy, domestic farce, extreme upward pitch shifting, frantic staccato delivery (under-the-floorboards). |
| **PARLER\_TTS** | Autoregressive Transformer with natural language conditioning prompts | PyTorch OpenVINO / CPU; **\~1.2 GB RAM** | ≈0.65× (Near real-time) | Social satire, nuanced prosodic irony, whispered subtext, explicit room acoustic simulation (goblin-social-satire). |
| **CHATTERBOX** | Pitch-tracking neural vocoder with latent style conditioning | Multi-core AVX-512 CPU; **\~1.5 GB RAM** | ≈0.40× (Fast) | Colloquial drawls, high intelligibility dialogue, secondary ensemble characters (wiregrass-basin). |
| **COSYVOICE\_300M** | Causal Flow Matching & multi-scale diffusion vocoder | Heavy CPU / Auxiliary RAM; **\~2.8 GB RAM** | ≈1.20× (Compute intensive) | Cinematic Southern Gothic noir, deep laryngeal trauma, glottal fry, rich subharmonics (wiregrass-basin). |
| **KOKORO\_82M** | Compact Style-TTS2 architecture | Pure CPU / WebAssembly; **\~350 MB RAM** | ≤0.12× (Ultra-fast) | Synthetic radio comms, ship telemetry, vacuum intercom announcements (deep-space-salvage). |

### **3\. Triad Component 2: The Speaker Embedding & Conditioning Token**

The second pillar anchors the individual character identity within the engine's latent space, bridging performer casting, legal rights clearance, and conditioning mechanics.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ COMPONENT 2: SPEAKER EMBEDDING & CONDITIONING PROFILE                  │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • strategy: Conditioning type (ZERO_SHOT_CLONE, SPEAKER_ID, PROMPT)    │`  
`│ • reference_audio_path: Pinned .wav take in /voices/versions/          │`  
`│ • reference_sha256: Cryptographic hash of historical reference master  │`  
`│ • speaker_embedding_tensor: Latent vector cache path (.pt / .npy)      │`  
`│ • latent_description_prompt: Natural language texture prompt (Parler)  │`  
`│ • performer_consent_id: SAG-AFTRA / C2PA licensing contract identifier │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **Conditioning Modalities**

Depending on the underlying engine, the speaker conditioning token is realized through one of three mechanisms:

> 1. **Zero-Shot Acoustic Reference Clones (ZERO\_SHOT\_CLONE):** Used by CosyVoice and XTTSv2. The engine extracts a fixed-dimension latent speaker vector (e.g., a 512-dimensional embedding) from a clean, dry, studio-recorded vocal take. The reference audio is pinned to an immutable file in /voices/versions/\${character}\_v\${version}.wav and verified via SHA-256.  
> 2. **Discrete Speaker Integer IDs (SPEAKER\_ID):** Used by multi-speaker checkpoints like Piper-ONNX. A discrete integer points to an indexed voice vector inside the model's static weight matrix, providing fast lookups with zero external reference audio dependencies.  
> 3. **Natural Language Latent Descriptions (DESCRIPTION\_PROMPT):** Used by Parler-TTS. Rather than an audio file, identity is conditioned via a prompt specifying speaker traits, room acoustics, and delivery:*"An ancient, gravelly female voice speaking with deep rasp, heavy vocal fry, and breathless clauses in an extremely dry, dead acoustic room with no reverberation."*

#### **The Institutional Clearance Firewall (POD-04 / POD-01 Integration)**

Voice identity is bounded by legal and institutional constraints:

> * **Talent & Casting Pod (POD-04) Mandate:** Casts, records, and calibrates vocal identity. No performer’s vocal likeness may be synthesized without an executed voice-rider contract detailing compensation per synthesized minute and specifying permitted series usage.  
> * **Downstream Reinterpretation Prohibition:** Downstream pods (POD-05 Audio Lab, POD-10 Assembly, POD-17 Localization) are structurally forbidden from altering or expanding licensing scope. A voice model cleared for episodic drama cannot be deployed for external marketing or cloned into foreign-language dubs without an updated clearance certificate registered in performer\_consent\_id.  
> * **The Locked Voice Invariant:** Governed by the core boundary value: *locked voice consistency over per-scene optimization*. audio-microservice must reuse approved reference tokens across all scenes, explicitly prohibiting engineers from re-tuning reference audio on a per-scene basis even if an alternate seed sounds marginally better in isolation.

### **4\. Triad Component 3: The Baseline DSP Parameter Vector**

The third pillar specifies the baseline physical transformations applied to the character's vocal tract and respiratory system in a neutral state, before any scene-specific dramatic trauma or emotional modifiers are applied.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ COMPONENT 3: BASELINE DIGITAL SIGNAL PROCESSING (DSP) VECTOR           │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • basePitchShiftSemitones: Fundamental frequency (F0) transposition    │`  
`│ • formantWarpingFactor: Pharyngeal/oral vocal tract scale multiplier   │`  
`│ • speedScalar: Baseline tempo / conversational velocity multiplier     │`  
`│ • baseBreathiness: Diaphragmatic respiratory pause multiplier (Π)      │`  
`│ • baseVocalFry: Subharmonic glottal pulse density scalar (Φ)           │`  
`│ • high_pass_cutoff_hz: Pre-conform infrasonic rumble filter frequency  │`  
`│ • de_esser_frequency_hz: Sibilance attenuation band center             │`  
`│ • banned_cadences: Structural prosodic exclusion array                 │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **The Five Primary Parametric Dimensions**

                        `THE FIVE DSP DIMENSIONS`  
                                   `│`  
      `┌────────────────┬───────────┴────┬───────────────┬────────────────┐`  
      `▼                ▼                ▼               ▼                ▼`  
`[ Pitch (F0) ]   [ Formants (W) ]  [ Pacing (P) ]  [ Breath (Π) ]   [ Vocal Fry (Φ) ]`  
`Fundamental      Vocal tract       Conversational  Pulmonary        Glottal fold`  
`frequency delta  geometry scalar   speed multiplier pause dilation  rattle density`  
`(-12 to +12 st)  (0.5 to 2.0)      (0.1 to 3.0)    (1.0 to 3.5)     (0.0 to 1.0)`

> 1. **Fundamental Frequency Transposition (*F*0​):** Signed semitone pitch modulation (\[−12.0,+12.0\] semitones) that preserves duration. Shifting downward (e.g., −2.5 st) establishes heavy, chest-resonant authority; shifting upward (e.g., \+3.8 st) establishes diminutive, high-strung physiology.  
> 2. **Formant Warping Factor (*W*):** Modulates resonant frequencies (*F*1​,*F*2​,*F*3​) independently of pitch (\[0.5,2.0\]). Scaling below 1.0 (e.g., 0.86) emulates an anatomically smaller oral cavity (goblin biology); scaling above 1.0 (e.g., 1.12) expands the perceived virtual pharynx.  
> 3. **Conversational Speed Scalar (*P*):** Establishes the neutral delivery pace of the speaker (\[0.1,3.0\]). Characters like Branksi mandate \-15% speed (*P*\=0.85), embedding chronic fatigue into their baseline cadence.  
> 4. **Diaphragmatic Breathiness Multiplier (Π):** Scales the duration and frequency of respiratory inhalations between clauses (\[1.0,3.5\]). A setting of \+5% (Π=1.05) represents mild drag, whereas Π=2.40 indicates severe pulmonary exhaustion.  
> 5. **Subharmonic Vocal Fry Density (Φ):** Injects low-frequency glottal rattle at sentence decay (\[0.0,1.0\]). Replicates aperiodic vocal fold adduction under low subglottal pressure, signaling physical depletion or advanced age.

#### **Algebraic Composition with Runtime Scene Somatics**

Baseline DSP vectors do not exist in isolation; they compose algebraically with the dynamic somatic trauma flags and pressure meters injected at runtime by the Conductor:

*F*0, effective​*W*effective​*P*effective​Πeffective​Φeffective​​\=basePitchShiftSemitones+ΔPitchscene​\=formantWarpingFactor×ΔFormantscene​\=speedScalar×tonePacingscene​\=baseBreathiness×pause\_multiplierscene​\=clamp(baseVocalFry+ΔFryscene​,0.0,1.0)​  
`EXAMPLE: OCTAVIUS ODDWADD UNDER ACUTE CHEMICAL TRAUMA`  
`1. Baseline Voice Recipe:`  
   `basePitchShiftSemitones: -1.0 | baseBreathiness: 1.2 | speedScalar: 0.90[cite: 30]`  
`2. Ledger Ingress: Stage-1 Pulmonary Fibrosis[cite: 5, 12]`  
   `breathinessPauseMultiplier: 2.2 | pause_frequency_multiplier: 1.4[cite: 5, 12]`  
`3. Effective Composition at Port 8000:`  
   `Π_effective = 1.2 * 2.2 * 1.4 = 3.696 (Forces extreme breath gaps)[cite: 5, 12]`  
   `Caps maximum spoken phrase length; forces hard consonants to cut abruptly into silence[cite: 5, 12].`

#### **Pre-Flight Invariant & Banned Cadence Linters**

Before a line is synthesized, two deterministic checks validate the DSP parameters:

> * **Vocal-Motor Speech Feasibility Theorem:**  
>   *c*.has\_verbal\_directives⟹"mute"∈/*c*.conditions∧"speak"∈/*c*.banned\_kinetic\_verbs  
>   If an entity with crushed vocal cords or a severed trachea is instructed to whisper or speak, the pre-flight linter halts compilation at zero GPU cost (*T*0​\=\$0.00), raising a fatal VOCAL\_DELIVERY\_BREACH.  
> * **Banned Cadence Scanning:** Characters suffering from respiratory trauma cannot emit prosodic rhythms registered in banned\_cadences (such as RAPID\_STACCATO or RISING\_INFLECTION\_INTERROGATIVE), preventing cheerful or energetic inflection leaks.

### **4\. Acoustic Delivery & The Physical Master Clock Bridge**

Once synthesized via the Triad parameters, the raw audio buffer establishes the physical clock governing all downstream visual rendering.

`AUDIO DOMAIN (Sample-Accurate Waveform: 48,000 samples/sec)`  
`│`  
`├── duration_ms = 3,120.00 ms (Observed via POSIX ffprobe)[cite: 2, 5]`  
`└── Five-Stage Conformance Gate (-16 LUFS, <= -1.0 dBTP, Noise Floor <= -60 dBFS)[cite: 8, 27]`  
`│`  
`▼ Discrete Integer Frame Quantization Ratio: target_frames = ceil((3120 / 1000) * 24) = 75 frames[cite: 2, 5]`  
`VIDEO DOMAIN (Master Media Timeline: 24 frames/sec)`  
`│`  
`├── Track 1: Mounted at absolute frame coordinates (<Sequence from={atFrame} />)[cite: 2, 6]`  
`├── Track 2: Punctual Foley events (Mulberry32 PRNG seeded via sceneId:shotId:sampleKey)[cite: 2, 6]`  
`└── Track 3: Continuous Ambient Bed (Programmatic gain ducking: -14 dB floor, 6f A / 12f R)[cite: 2, 6]`

> * **The Observation vs. Derivation Decoupling:** The physical duration in milliseconds (*D*ms​) measured via ffprobe is an empirical *observation*; the integer video frame count is a presentation *derivation*:  
>   target\_frames=⌈(1000*D*ms​​)×FPSmaster​⌉\=⌊1000(*D*ms​×24)+999​⌋  
>   Both are stored as separate, immutable fields in exposure\_sheet.json. If master deliverables change from 24 fps to 30 fps or 60 fps, frame counts are re-derived from *D*ms​ without requiring neural audio re-synthesis.  
> * **Acoustic Conformance Gate:** Stems must pass two-pass FFmpeg normalization to **−16.0 LUFS** (±1.0 LUFS), enforce an inter-sample true-peak ceiling of **≤−1.0 dBTP**, and maintain an unvoiced noise floor below **−60 dBFS**.  
> * **Dynamic Sidechain Ducking:** Spoken dialogue windows on Track 1 trigger programmatic gain automation on Track 3 ambient beds. The bed ducks by **−14 dB** across an authored 6-frame quadratic attack before speech and recovers over a 12-frame quadratic release during pauses exceeding 12 frames.

### **5\. Provenance DAG Integration & Transitive Blast Radius**

In the studio’s Directed Acyclic Graph (DAG) compilation engine, the Epistemological Triad of Voice Identity functions as a cryptographic node. Modifying any element of the triad triggers an explicit, bounded invalidation walk:

                  `MUTATE VOICE RECIPE PARAMETER`  
     `(e.g., Change Branksi speedScalar from 0.85 to 0.88)[cite: 30]`  
                               `│`  
                               `▼`  
               `HMAC-SHA256 Recalculation (H_recipe)`  
                               `│`  
                               `▼`  
          `TOPOLOGICAL BLAST RADIUS AUDIT (render_manifest.json)[cite: 17, 22]`  
                               `│`  
         `┌─────────────────────┴─────────────────────┐`  
         `▼                                           ▼`  
`[ INVALIDATED NODES: is_dirty = 1 ]         [ UNTOUCHED NODES: is_dirty = 0 ]`  
`• Branksi dialogue stems in Episode AST     • All unaffected character stems[cite: 2]`  
`• ffprobe duration_ms re-measurement        • Background ambient beds & Foley tracks[cite: 2]`  
`• exposure_sheet.json integer frames        • Visual plates satisfying 4n+1 lattice[cite: 2]`

> 1. **HMAC-SHA256 Recipe Seal:** The recipe digest is calculated across all three components:  
>    *H*recipe​\=HMAC-SHA256(SeriesSecret,engine∥weights\_sha∥ref\_sha∥Serialize(base\_dsp))  
> 2. **Selective Stem Invalidation:** When *H*recipe​ changes, the compiler walks dialogue\_ast.json. Only lines spoken by that character are flagged for re-synthesis (is\_dirty \= 1\) on Rig 1\. Unaffected cast members retain their content-addressed .wav binaries, eliminating unnecessary re-computation.  
> 3. **The 4*n*\+1 GPU Compute Firewall:** Video diffusion backends on Rig 2 require frame counts conforming to a 3D causal VAE temporal downsampling lattice (4*n*\+1, e.g., 17,21,25,33,…,77 frames). If a revised audio duration produces a frame budget that still fits within the existing rendered plate's 4*n*\+1 temporal ceiling (target\_framesnew​≤framesplate​), Rig 2 is not re-invoked. Remotion trims the excess slack during optical assembly, preserving GPU compute hours while ensuring audio and video cut points remain in frame-accurate synchrony.

---

*User prompt: {{FOCUS: 5\. Acoustic Ingestion Hygiene & Certification Gauntlet}} /extreme-details*

Response: The **Acoustic Ingestion Hygiene & Certification Gauntlet** is the automated quality assurance firewall within audio-microservice that validates, filters, and certifies raw vocal captures before they can be committed to the append-only reference vault (/voices/versions/) or symlinked into runtime execution (/voices/active/).

Because neural text-to-speech (TTS) engines, diffusion vocoders, and speaker-cloning latent projection networks are sensitive to acoustic impurities, raw actor recordings provided by the Talent & Casting Pod (POD-04) cannot be ingested directly. If an input recording contains preamp hiss, room reverberation, DC offset, or plosive distortion, the neural model will encode these artifacts directly into the character's latent speaker embedding, poisoning every downstream dialogue line synthesized across the life of a series.

Operating under the studio's fail-fast economic rule—terminating defects at the earliest and cheapest stage (*T*0​\=\$0.00) before invoking downstream visual diffusion or optical compositing—the gauntlet enforces an automated, five-stage physical signal and latent embedding verification pipeline.

`RAW STUDIO RECORDING (Submitted by POD-04 Talent & Casting)`  
                          `│`  
                          `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STEP 1: CONTAINER FORMAT & PHYSICAL SIGNAL SANITY                      │`  
`│ • Validates Linear PCM WAV container (Header inspection)               │`  
`│ • Sample Rate == 48,000 Hz, Bit Depth == 24-bit, Channels == 1 (Mono)  │`  
`│ • Zero-Byte Trap & Minimum Duration Enforcement (10.0s ≤ D ≤ 60.0s)    │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass (Exit Code 0)`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STEP 2: INFRASONIC & SPECTRAL DE-NOISING                               │`  
`│ • 24 dB/octave high-pass filter below 80–100 Hz (DC / rumble strip)    │`  
`│ • Dynamic optical de-esser targeting harsh sibilance (6–8 kHz band)    │`  
`│ • Ultrasonic low-pass filter at 22 kHz (Anti-aliasing cutoff)          │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass (Exit Code 0)`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STEP 3: ANECHOIC BASELINE & NOISE FLOOR CERTIFICATION                  │`  
`│ • Sweeps 500 ms unvoiced pause intervals using sliding RMS window      │`  
`│ • Noise Floor must remain strictly below -60 dBFS                      │`  
`│ • Direct-to-Reverberant Ratio (DRR) Check: Rejects room reflection     │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass (Exit Code 0)`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STEP 4: TWO-PASS EBU R128 LOUDNORM & TRUE-PEAK CLAMP                   │`  
`│ • Two-pass FFmpeg loudnorm targeting Integrated -16.0 LUFS (±0.5 LUFS) │`  
`│ • True-Peak strictly clamped to ≤ -1.0 dBTP (Inter-sample ceiling)     │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass (Exit Code 0)`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STEP 5: NEURAL EMBEDDING EXTRACTION & LATENT STABILITY AUDIT           │`  
`│ • Synthesizes 5 calibration phoneme sentences via target TTS engine    │`  
`│ • Computes Cosine Similarity between E_synth and E_ref (Assert ≥ 0.92)  │`  
`│ • Acoustic Redaction Test: Verifies rhythm and syllable metrics        │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Certified Pass (Exit Code 0)`  
                                   `▼`  
      `Promoted to /voices/versions/${character}_v${next}.wav`

### **1\. Step 1: Container Format & Physical Signal Sanity**

The first stage inspects raw audio files on disk using low-level header parsing and POSIX ffprobe sweeps, preventing corrupted, truncated, or incompatible formats from entering the Python runtime:

> * **Linear PCM Encoding Invariant:** Incoming files must be uncompressed Linear Pulse-Code Modulation (PCM) wrapped in a standard RIFF/WAVE container. Compressed formats (MP3, AAC, OGG, FLAC) are rejected with CONTAINER\_FORMAT\_INVALID to prevent lossy compression codecs from altering spectral phase relationships.  
> * **Exact Sampling Rate & Bit Depth:** The sampling frequency must evaluate to exactly **48,000 Hz** (48 kHz) and the quantization depth must equal **24-bit signed integer** (or 32-bit float). Files recorded at 44.1 kHz, 96 kHz, or 16-bit are rejected at ingestion rather than resampled on the fly, eliminating sample-rate conversion filter ripples.  
> * **Strict Mono Channel Clamping:** Reference voice takes must be single-channel (1.0 mono). Multi-channel or stereo recordings are rejected immediately: differential microphone phase cancellation in stereo tracks causes destructive interference when converted to mono latent representations by neural vocoders.  
> * **The Zero-Byte Poison Sentinel Trap:** Before inspecting audio headers, the pipeline checks the file's SHA-256 digest against the empty-file constant:  
>   EMPTY\_FILE\_HASH=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>   Any file matching this hash or falling below 64 KB in size triggers an immediate fatal build halt (EMPTY\_FILE\_DETECTED), protecting the engine against dropped network writes or broken storage allocations.  
> * **Duration Boundary Envelopes:** A reference recording must contain sufficient phonetic diversity without overwhelming memory during latent extraction. The continuous duration (*D*ms​) must satisfy:  
>   10,000 ms≤*D*ms​≤60,000 ms  
>   Files shorter than 10 seconds fail for INSUFFICIENT\_PHONETIC\_COVERAGE; files longer than 60 seconds fail for REFERENCE\_DURATION\_EXCEEDED.

### **2\. Step 2: Infrasonic & Spectral De-Noising**

Raw microphone takes capture physical room phenomena and hardware electrical artifacts that destabilize neural conditioning latents:

> * **Infrasonic High-Pass Roll-Off:** Mechanical floor rumble, air conditioning turbulence, and microphone diaphragm pops generate high-energy infrasonic transients between 1 Hz and 60 Hz. A 24 dB/octave Butterworth high-pass filter is applied with a corner frequency at **80 Hz to 100 Hz**:  
>   ∣*H*HPF​(*f*)∣=1+(*ffc*​​)2*N*​1​,*N*\=4,*fc*​\=90 Hz  
>   This strips DC offset and mechanical boom without thinning the fundamental frequency (*F*0​) of deep human voices.  
> * **Mains Hum Elimination:** Dynamic narrow-band notch filters (infinite impulse response with a *Q*≥30) target 50 Hz and 60 Hz electrical mains hum and their secondary harmonics (100 Hz and 120 Hz).  
> * **Optical De-Essing Band (6 kHz to 8 kHz):** High-frequency sibilants (s, z, sh) often produce exaggerated resonant peaks on studio condenser microphones. A fast dynamic optical de-esser is placed across the **6,000 Hz to 8,000 Hz** frequency band. Sibilance spikes exceeding a −18 dBFS threshold are attenuated with a 1 ms attack and 20 ms release, preventing sibilant digital clipping during neural latent projection.  
> * **Ultrasonic Bandwidth Limiting:** A steep low-pass filter at **22 kHz** eliminates inaudible high-frequency noise that could alias during neural vocoder upsampling.

### **3\. Step 3: Anechoic Baseline & Noise Floor Certification**

To produce consistent voice clones, reference takes must be recorded in an acoustically dry, isolated environment. Ambient noise and room reflections that escape detection will be permanently synthesized into the character's vocal profile.

`SLIDING RMS NOISE FLOOR AUDIT (500 ms Sliding Window)`  
`Unvoiced Pause Window`  
`├─────────────────────────┤`  
`[ Digital Silence Target  ] ──► RMS Measurement: Must be ≤ -60 dBFS`  
`▲                         ▲`  
`Voice Energy Decays       Next Consonant Attack`

> * **Unvoiced RMS Noise Ceiling:** The gauntlet segments the recording into voiced and unvoiced intervals using energy-based Voice Activity Detection (VAD). Across every unvoiced pause window (≥500 ms), the root-mean-square (RMS) energy is measured:  
>   RMSunvoiced​\=*M*1​*i*\=1∑*M*​*x*\[*i*\]2​  
>   The pipeline enforces a hard ceiling:  
>   NoiseFloor=20log10​(RMSunvoiced​)≤−60.0 dBFS  
>   If HVAC hiss, fan noise, or headphone bleed pushes the unvoiced RMS above −60 dBFS, the recording fails with ACOUSTIC\_NOISE\_FLOOR\_BREACH. This guarantees that when downstream programmatic sidechain ducking releases back to unity gain (recovering from −14 dB), background hiss does not swell into audibility.  
> * **Direct-to-Reverberant Ratio (DRR) Check:** Room reflections corrupt voice cloning models by blurring phoneme transitions. The gauntlet calculates the early-to-late energy ratio across phoneme decays:  
>   DRR=10log10​(∫*td*​∞​*h*2(*t*)*dt*∫0*td*​​*h*2(*t*)*dt*​)  
>   Where *td*​\=50 ms. If late reverberant energy exceeds configured tolerances, indicating a live room rather than a treated vocal booth, the file is rejected with ROOM\_REVERBERATION\_EXCESSIVE.

### **4\. Step 4: Two-Pass EBU R128 Loudnorm & True-Peak Gating**

Ducking depth alone does not guarantee broadcast compliance; audio compliance is an empirical property of the conformed final mix. Reference voices must match the global target loudness to ensure the neural vocoder receives consistent signal amplitude across all takes:

`# Pass 1: Parse acoustic profile and measure integrated loudness, LRA, and true peak`  
`ffmpeg -hide_banner -i prefiltered_take.wav \`  
  `-af loudnorm=I=-16.0:TP=-1.0:LRA=11:print_format=json -f null - 2> measurement.json`

`# Pass 2: Apply linear normalization targeting exactly -16.0 LUFS`  
`ffmpeg -hide_banner -i prefiltered_take.wav \`  
  `-af loudnorm=I=-16.0:TP=-1.0:LRA=11:measured_I=-19.4:measured_TP=-0.2:measured_LRA=7.5:measured_thresh=-29.8:linear=true \`  
  `-ar 48000 -c:a pcm_s24le conformed_reference.wav`

#### **Loudness Conformance Standards**

| Metric Target | Standard | Allowed Tolerance | Pipeline Action on Violation |
| :---- | :---- | :---- | :---- |
| **Integrated Loudness (*I*)** | **−16.0 LUFS** | ±0.5 LUFS | Two-pass linear normalization correction. |
| **Maximum True-Peak (TP)** | **≤−1.0 dBTP** | Hard ceiling | Brickwall limiting applied if inter-sample peak \>−1.0 dBTP. |
| **Loudness Range (LRA)** | **≤11.0 LU** | Dynamic range cap | Warns if compressed below 3.0 LU; fails if \>14.0 LU. |

> * **True-Peak Decoupling Invariant:** Sample peak in decibels relative to full scale (dBFS) is never conflated with True-Peak in decibels relative to full scale measured with inter-sample oversampling (dBTP). A digital signal peaking at −1.2 dBFS can generate inter-sample peaks of \+0.8 dBTP when reconstructed by continuous digital-to-analog converters, causing harsh harmonic distortion. The limiter evaluates and clamps peaks strictly in **dBTP**.

### **5\. Step 5: Neural Embedding Extraction & Latent Stability Audit**

Meeting signal-level specs does not guarantee that a voice take will clone cleanly. The final stage proves that the target neural TTS engine can derive a stable speaker representation from the audio:

`CONFORMED TAKE (conformed_reference.wav)`  
                 `│`  
                 `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ SPEAKER EMBEDDING ENCODER (e.g., CosyVoice / Resemblyzer)              │`  
`│ • Extracts 512-dimensional reference embedding vector: E_ref           │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ CALIBRATION SYNTHESIS PASS (5 Standardized Diagnostic Sentences)       │`  
`│ • S1: Plosives & High Sibilance                                        │`  
`│ • S2: Low Fundamental F0 Chest Resonance                               │`  
`│ • S3: Rapid Syllabic Consonant Transitions                             │`  
`│ • S4: Extended Vowel Decay & Breaths                                   │`  
`│ • S5: Micro-Cadence Dramatic Pause Sentence                            │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Synthesizes 5 WAVs (CPU Rig 1)`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ SYNTHETIC EMBEDDING ENCODER                                            │`  
`│ • Extracts average embedding across generated takes: E_synth           │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ COSINE SIMILARITY GATE                                                 │`  
`│ • Computes CosineSim(E_ref, E_synth)                                   │`  
`│ • Assert: CosineSim ≥ 0.92 (Threshold for stable voice reproduction)   │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass (Exit Code 0)`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ THE ACOUSTIC REDACTION TEST (Prosody & Syllable Architecture)          │`  
`│ • Pitch-shifts and flattens vocal formants                             │`  
`│ • Evaluates duration-per-syllable, pause distribution, consonant attack│`  
`│ • Confirms character remains recognizable in complete acoustic darkness│`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **Mathematical Formulation of Cosine Stability**

Given the reference speaker embedding vector *E*ref​ and the synthesized speaker embedding vector *E*synth​ in R512:

Sim(*E*ref​,*E*synth​)=∥*E*ref​∥2​∥*E*synth​∥2​*E*ref​⋅*E*synth​​\=∑*i*\=1512​*E*ref,*i*2​​∑*i*\=1512​*E*synth,*i*2​​∑*i*\=1512​*E*ref,*i*​*E*synth,*i*​​

> * **The Stability Gate:** If Sim(*E*ref​,*E*synth​)\<0.92, the take is rejected with EMBEDDING\_LATENT\_INSTABILITY. This prevents the promotion of vocal takes that sound clear to the human ear but confuse the vocoder's latent space, resulting in speaker drift or erratic pitch jumps.

#### **The Acoustic Redaction Battery**

To ensure the character does not regress toward the statistical median of the base model training data ("The Beige Plague"), the synthesized output is subjected to the **Acoustic Redaction Test**:

> * **Timbre Stripping:** The test pitch-shifts and normalizes the audio to flatten superficial timbral colors.  
> * **Prosodic & Syllable Verification:** The pipeline measures duration-per-syllable, pause distribution between phonemes, and consonant-attack velocities.  
> * **Metric Assertion:** A character with frantic, high-strung delivery (like Bog in under-the-floorboards) must remain mathematically distinct from a character with a slow, labored drawl (like The Pilot or Billie Fae in wiregrass-basin). Emotional cadence must survive even in low-fidelity acoustic environments.

### **6\. Executable Vitest Implementation & Rejection Taxonomy**

The certification pipeline is codified as an automated test gauntlet executed on Rig 1:

`// packages/audio-microservice/test/ingestion/acousticGauntlet.test.ts`  
`import { describe, it, expect } from "vitest";`  
`import { execSync } from "node:child_process";`  
`import * as fs from "node:fs";`

`interface IngestionReport {`  
  `sample_rate_hz: number;`  
  `bit_depth: number;`  
  `channels: number;`  
  `duration_ms: number;`  
  `unvoiced_noise_floor_dbfs: number;`  
  `integrated_lufs: number;`  
  `true_peak_dbtp: number;`  
  `embedding_cosine_similarity: number;`  
`}`

`describe("Acoustic Ingestion Hygiene & Certification Gauntlet", () => {`  
  `const candidateTakePath = "ephemeral/ingest/char_bog_candidate.wav";`

  `it("verifies physical container and sample rate parity", () => {`  
    `const probe = JSON.parse(`  
      ``execSync(`ffprobe -v quiet -print_format json -show_streams ${candidateTakePath}`).toString()``  
    `);`  
    `const audioStream = probe.streams.find((s: any) => s.codec_type === "audio");`

    `expect(audioStream.codec_name).toBe("pcm_s24le");`  
    `expect(parseInt(audioStream.sample_rate)).toBe(48000);`  
    `expect(audioStream.channels).toBe(1); // Strict mono invariant`  
  `});`

  `it("certifies noise floor remains strictly below -60 dBFS", () => {`  
    `const report: IngestionReport = JSON.parse(`  
      ``execSync(`python scripts/audit_noise_floor.py --file ${candidateTakePath}`).toString()``  
    `);`  
    `expect(report.unvoiced_noise_floor_dbfs).toBeLessThanOrEqual(-60.0);`  
  `});`

  `it("enforces EBU R128 loudness conformance and True-Peak limits", () => {`  
    `const loudnormJson = JSON.parse(`  
      `execSync(`  
        `` `ffmpeg -i ${candidateTakePath} -af loudnorm=I=-16:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p'` ``  
      `).toString()`  
    `);`  
    `expect(parseFloat(loudnormJson.input_i)).toBeGreaterThanOrEqual(-16.5);`  
    `expect(parseFloat(loudnormJson.input_i)).toBeLessThanOrEqual(-15.5);`  
    `expect(parseFloat(loudnormJson.input_tp)).toBeLessThanOrEqual(-1.0);`  
  `});`

  `it("certifies speaker embedding cosine stability above threshold", async () => {`  
    `const stabilityScore = parseFloat(`  
      ``execSync(`python engines/audit_embedding_stability.py --file ${candidateTakePath}`).toString()``  
    `);`  
    `expect(stabilityScore).toBeGreaterThanOrEqual(0.92);`  
  `});`  
`});`

#### **Failure Taxonomy & Exit Action Mapping**

| Error Code | Trigger Condition | Severity | System Consequence |
| :---- | :---- | :---- | :---- |
| EMPTY\_FILE\_DETECTED | File matches e3b0c442... or size \<64 KB. | **Fatal** | Halts build immediately (Exit 1). |
| STEREO\_CHANNEL\_FORBIDDEN | Reference take contains 2 or more channels. | **Fatal** | Rejects take; requests mono re-export. |
| ACOUSTIC\_NOISE\_FLOOR\_BREACH | Unvoiced pause RMS \>−60.0 dBFS. | **High** | Fails take; requires recording booth re-capture. |
| TRUE\_PEAK\_CLIPPING\_VIOLATION | Inter-sample peak exceeds −1.0 dBTP. | **Medium** | Re-applies brickwall limiter pass. |
| EMBEDDING\_LATENT\_INSTABILITY | Cosine similarity across test sentences \<0.92. | **High** | Rejects reference take; flags vocoder mismatch. |
| REDACTION\_RHYTHM\_COLLAPSE | Prosodic metrics overlap with baseline ensemble. | **High** | Fails for character voice bleed. |

### **7\. Atomic Vault Promotion & The Three-Cycle Circuit Breaker**

Once a candidate reference recording passes all five gauntlet checks, it is promoted to production via an atomic filesystem swap and manifest commit:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ ATOMIC PROMOTION SEQUENCE                                              │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. Move validated WAV to voices/versions/${character}_v${version}.wav   │`  
`│ 2. Compute canonical SHA-256 binary hash of the conformed audio        │`  
`│ 3. Update voice_manifest.json with measured metrics and recipe fields  │`  
`│ 4. Atomically repoint symlink: voices/active/${character}.wav           │`  
`│ 5. Trigger DAG blast radius scan: update versions.json and seals       │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **The Three-Cycle Circuit Breaker (Cross-Pod Escalation Standard)**

To prevent infinite retry loops when a performer take fails the technical gauntlet, audio-microservice enforces the studio-wide **Cross-Pod Escalation Standard**:

               `PROPOSED REFERENCE AUDIO TAKE (POD-04)`  
                                 `│`  
                                 `▼`  
`┌───────────────────────────────────────────────────────────────┐`  
`│ CYCLE 1: First Full Gauntlet Run                              │`  
`│ • Noise floor or cosine stability breaches threshold          │`  
`│ • ACTION: Log failure trace; return diagnostic to POD-04      │`  
`└───────────────────────────────┬───────────────────────────────┘`  
                                `│ POD-04 uploads filtered take`  
                                `▼`  
`┌───────────────────────────────────────────────────────────────┐`  
`│ CYCLE 2: Second Gauntlet Run                                  │`  
`│ • Output fails again; sibilance or True-Peak clips            │`  
`│ • ACTION: Log failure trace; return targeted remediation      │`  
`└───────────────────────────────┬───────────────────────────────┘`  
                                `│ POD-04 attempts third patch`  
                                `▼`  
`┌───────────────────────────────────────────────────────────────┐`  
`│ CYCLE 3: Third Consecutive Gauntlet Failure                   │`  
`│ • Output continues to breach certification gates              │`  
`└───────────────────────────────┬───────────────────────────────┘`  
                                `│ (THREE-CYCLE THRESHOLD TRIPPED)`  
                                `▼`  
`┌───────────────────────────────────────────────────────────────┐`  
`│ MANDATORY ESCALATION (Showrunner / Lead Audio Architect)      │`  
`│ • "Reference take uncertifiable under current studio specs."  │`  
`│ • Freeze update branch; revert active symlink to prior take   │`  
`│ • Mandates physical re-recording in treated studio booth      │`  
`└───────────────────────────────────────────────────────────────┘`

If an asset fails three consecutive certification cycles, the automated pipeline halts all updates for that character identity. The active symlink remains locked to the prior stable reference (v\${version-1}.wav), protecting the active production line while routing the issue to human audio leadership for resolution.

---

*User prompt: {{FOCUS : Conditioning Modalities}} /extreme-details*

Response: The **Conditioning Modality** defines the mathematical, algorithmic, and operational mechanism by which audio-microservice injects character vocal identity into an underlying neural speech synthesis checkpoint. Because the studio's production fleet spans distinct aesthetic paradigms—from the high-speed domestic slapstick of under-the-floorboards to the toxic Southern Gothic noir of wiregrass-basin and the vacuum telemetry of deep-space-salvage—no single conditioning interface can satisfy all hardware, latency, legal, and dramaturgical requirements.

In audio-microservice, the voice recipe codifies character conditioning under the conditioning.strategy schema attribute. This attribute multiplexes across four discrete modalities: **Zero-Shot Acoustic Reference Cloning (ZERO\_SHOT\_CLONE)**, **Discrete Speaker Integer IDs (SPEAKER\_ID)**, **Natural Language Latent Descriptions (DESCRIPTION\_PROMPT)**, and **Precomputed Synthetic Latent Vectors (SPEAKER\_VECTOR)**.

### **1\. Architectural Mandate: The Four Conditioning Modalities**

The selection of a conditioning modality governs how identity information crosses the architectural boundary between static series configuration and dynamic neural tensor evaluation:

`┌─────────────────────────────────────────────────────────────────────────────────────────────────┐`  
`│                           THE FOUR SPEECH CONDITIONING MODALITIES                               │`  
`├─────────────────────────┬─────────────────────────┬─────────────────────────┬───────────────────┤`  
`│ ZERO_SHOT_CLONE         │ SPEAKER_ID              │ DESCRIPTION_PROMPT      │ SPEAKER_VECTOR    │`  
`├─────────────────────────┼─────────────────────────┼─────────────────────────┼───────────────────┤`  
`│ • Input: Pinned .wav    │ • Input: Discrete int   │ • Input: Natural text   │ • Input: Raw .pt  │`  
`│ • Engine: CosyVoice     │ • Engine: Piper-ONNX    │ • Engine: Parler-TTS    │ • Engine: Kokoro  │`  
`│ • Conditioning: Latent  │ • Conditioning: Static  │ • Conditioning: Cross-  │ • Conditioning:   │`  
`│   acoustic projection   │   embedding lookup      │   attention prompt      │   Direct W-tensor │`  
`│ • RTF: ~1.20x (Heavy)   │ • RTF: ≤0.08x (Instant) │ • RTF: ~0.65x (Moderate)│ • RTF: ≤0.12x     │`  
`│ • RAM: ~2.8 GB          │ • RAM: ~80 MB           │ • RAM: ~1.2 GB          │ • RAM: ~350 MB    │`  
`│ • Legal: SAG-AFTRA Rider│ • Legal: Open Model Tag │ • Legal: Text Copyright │ • Legal: Synthetic│`  
`└─────────────────────────┴─────────────────────────┴─────────────────────────┴───────────────────┘`

#### **The Non-Negotiable Governance Boundary**

Every conditioning modality operates under the studio's foundational production axiom: **locked voice consistency over per-scene optimization**.

> * audio-microservice is strictly forbidden from dynamically altering speaker reference takes, swapping embedding seeds, or revising conditioning prompts on a per-scene basis to chase a localized aesthetic improvement.  
> * The reference token certified during pre-production must be reused across all episodes and dramatic contexts.  
> * If a scene demands a dramatic transformation (e.g., acute panic, physical agony, or exhaustion), the transformation must occur via algebraic composition with runtime digital signal processing (DSP) offsets and condition parameters—never by tampering with the underlying conditioning asset.

### **2\. Modality 1: Zero-Shot Acoustic Reference Cloning (ZERO\_SHOT\_CLONE)**

The ZERO\_SHOT\_CLONE modality derives vocal timbre, formant resonance, and glottal behaviors directly from a physical, studio-recorded audio reference stem. It serves as the primary conditioning engine for grounded, character-driven dramatic leads (e.g., The Pilot and Billie Fae in wiregrass-basin) executing through models like **CosyVoice-300M** and **XTTSv2**.

`OFFLINE CALIBRATION & INGESTION (Rig 1)`  
  `Clean Studio Take (48 kHz / 24-bit Mono WAV)`  
                     `│`  
                     `▼`  
  `Acoustic Gauntlet Pass (HPF 90 Hz, De-ess, Noise Floor ≤ -60 dBFS)`  
                     `│`  
                     `▼`  
  `Neural Speaker Encoder (ECAPA-TDNN / CAMPPlus)`  
                     `│`  
                     `▼`  
  `Extracted Embedding Vector: \vec{E}_{ref} \in \mathbb{R}^{512}`  
                     `│`  
                     `├───────────────────────────────┐`  
                     `▼                               ▼`  
  `voices/.../versions/char_v3.wav   voices/.../embeddings/char_v3.pt (Cached)`  
                     `│                               │`  
                     `└───────────────┬───────────────┘`  
                                     `│`  
`RUNTIME INFERENCE (:8000/generate)   ▼`  
  `Text AST + Somatic Modifiers ──► Flow Matching Diffusion Transformer ──► Master WAV`

#### **Mathematical Formulation & Latent Extraction**

During initialization, the microservice passes the reference waveform *x*ref​(*t*) through a convolutional and transformer-based speaker recognition backbone (such as ECAPA-TDNN or CAMPPlus):

hframe​\=Encoder(*x*ref​(*t*))

Temporal pooling converts variable-length frame representations into a fixed-length identity representation:

*E*ref​\=AttentiveStatisticsPooling(hframe​)∈R*D*

where *D*\=512 (or 1024 depending on checkpoint architecture). This vector *E*ref​ is projected via cross-attention layers into the diffusion flow-matching prior, conditioning the generation of mel-spectrogram frames:

*vt*​\=v*θ*​(*zt*​,*t*,TextTokens,*E*ref​)

#### **The Two-Tier Storage & Embedding Caching Architecture**

Extracting *E*ref​ on every HTTP request introduces 150 ms to 350 ms of CPU overhead per dialogue line. To maintain high throughput while upholding the Deletion Principle, audio-microservice enforces a strict cache hierarchy:

> * **The Root Reference Archive:** The conformed audio file is stored immutably at voices/\<series\_slug\>/versions/\<character\>\_v\<N\>.wav. It is content-addressed, SHA-256 hashed, and never mutated.  
> * **The Tensor Cache:** The computed embedding tensor is serialized directly to disk at voices/\<series\_slug\>/embeddings/\<character\>\_v\<N\>.pt.  
> * **Cache Invalidation Invariant:** At runtime, the server compares the SHA-256 digest of the .wav file against the metadata header embedded inside the .pt file. If a digest mismatch is detected, the cache is discarded and re-extracted immediately.

#### **Failure Modes & Acoustic Defect Traps**

> 1. **Reverb & Reflection Leakage:** If the reference capture contains subtle room reflections (\>−50 dB early reflections), the speaker encoder interprets the spatial echo as intrinsic vocal resonance. Every synthesized line will sound as though the character is trapped in the recording room, corrupting downstream Remotion spatialization and dynamic ducking envelopes.  
> 2. **Phase Smeared Sibilants:** Condenser microphone sibilance peaks between 6 kHz and 8 kHz can cause flow-matching vocoders to generate harsh digital tearing artifacts on unvoiced fricatives (s, sh, z). The pre-flight acoustic gauntlet must de-ess the reference before embedding extraction.  
> 3. **The Beige Regression Danger:** If the reference take is too short (\<10 s), the encoder fails to establish a stable statistical manifold, causing the vocoder to default toward the statistical median of the base model's dataset ("The Beige Plague").

### **3\. Modality 2: Discrete Speaker Integer IDs (SPEAKER\_ID)**

The SPEAKER\_ID modality bypasses external audio files entirely by addressing fixed, pre-trained speaker identity projections encoded directly inside multi-speaker neural weight matrices. It represents the standard operational profile for **Piper-ONNX** and VITS models executing in the fast-paced, high-volume world of under-the-floorboards.

`STATIC ENGINE WEIGHTS (Piper-ONNX Runtime)`  
`┌────────────────────────────────────────────────────────┐`  
`│ Multi-Speaker Embedding Matrix: W_spk \in \mathbb{R}^{K \times D}     │`  
`│ [ ID 0: Neutral Female ]                               │`  
`│ [ ID 1: Authoritative Male ]                           │`  
`│ [ ID 2: High-Tension Compressed Vocal Track (Bog) ]    │ ◄── SPEAKER_ID: 2`  
`│ [ ID 3: Low-Resonance Sombre Drone ]                   │`  
`└───────────────────────────┬────────────────────────────┘`  
                            `│ Matrix Lookup: W_spk[speaker_id]`  
                            `▼`  
           `Text Phonemes ──► VITS Flow Prior / Duration Predictor`  
                            `│`  
                            `▼`  
                 `Linear PCM Waveform (Pure CPU)`

#### **Lookup Mechanics & Latent Injection**

In a multi-speaker VITS/Piper architecture, the model contains an internalized linear projection layer *W*spk​∈R*K*×*D*, where *K* is the number of trained speakers and *D* is the hidden latent dimension (typically *D*\=256 or 512).

> * During inference, the engine performs an instantaneous *O*(1) tensor slice:  
>   *e*speaker​\=*W*spk​\[speaker\_id\]  
> * This discrete vector conditions the text encoder outputs, the stochastic duration predictor, and the residual affine coupling layers within the flow-based decoder:  
>   *μz*​,*σz*​\=PriorEncoder(Phonemes,*e*speaker​)

#### **Hardware Performance & Execution Purity**

> * **Zero I/O Overhead:** Because identity is contained completely within the static model weights, the microservice executes zero disk reads, zero file system checks, and zero cryptographic hash recalculations during inference.  
> * **Ultra-Low Real-Time Factor (RTF≤0.08×):** Generating a 3-second dialogue line requires less than 240 ms of total compute on standard multi-core x86/ARM CPUs.  
> * **Minimal Memory Footprint:** The entire Piper ONNX runtime requires less than 80 MB of system RAM, completely avoiding multi-tenant memory thrashing on Rig 1\.

#### **Escaping Monoculture via DSP Warping**

Because discrete speaker IDs are shared assets built into open model checkpoints, multiple projects utilizing the same base model risk sounding identical. To counteract this, audio-microservice combines the discrete SPEAKER\_ID lookup with extreme baseline DSP offsets in voice\_manifest.json:

> * **The Goblin Archetype (Bog):** Maps to speaker\_id: 2, but applies basePitchShiftSemitones: \+3.8 and formantWarpingFactor: 0.86. The physical model provides pristine consonant clarity, while the algebraic DSP layer warps the vocal tract geometry into a non-human, subterranean anatomy without incurring runtime overhead.

### **4\. Modality 3: Natural Language Latent Descriptions (DESCRIPTION\_PROMPT)**

The DESCRIPTION\_PROMPT modality abandons numerical embeddings and reference files in favor of structured, natural language prompt vectors. Pioneered by architectures like **Parler-TTS**, this modality conditions speech by directing an autoregressive cross-attention transformer using descriptive text tags.

`CANONICAL DESCRIPTION PROMPT (voice_manifest.json)`  
`"An ancient, menacing goblin matriarch speaking in a slow, dry, gravelly rasp with intense`   
 `vocal fry and long, breathless pauses. Very low room reverberation, close microphone proximity."`  
                               `│`  
                               `▼`  
            `BPE / T5 Text Encoder (Text-to-Conditioning)`  
                               `│`  
                               `▼`  
        `Description Embedding Sequence: H_desc \in \mathbb{R}^{L \times D}`  
                               `│`  
                               `▼`  
`SCREENPLAY TEXT ──► Autoregressive Transformer (Cross-Attention) ──► DAC Neural Vocoder`

#### **Cross-Attention Conditioning Mechanics**

Parler-TTS utilizes a dual-prompt architecture:

> 1. **Screenplay Text Tokens:** The actual dialogue to be spoken (*Y*\=\[*y*1​,*y*2​,…,*yM*​\]).  
> 2. **Conditioning Description Tokens:** The descriptive text specifying timbre, acoustic environment, and prosody (*C*\=\[*c*1​,*c*2​,…,*cL*​\]).

The conditioning sequence is projected into a hidden representation via a frozen text encoder:

Hdesc​\=TextEncoder(*C*)∈R*L*×*D*model​

Within each decoder layer of the audio generation transformer, the audio tokens attend to Hdesc​ via multi-head cross-attention:

Attention(*Q*,*K*,*V*)=softmax(*dk*​​*QWQ*​(Hdesc​*WK*​)*T*​)(Hdesc​*WV*​)

#### **Prompt Engineering Disciplines: Escaping the "Beige Plague"**

Unconstrained natural language models exhibit a powerful regression toward the mean: vague prompts like *"a dramatic male voice"* collapse into generic commercial voiceover cadences. To maintain consistent character identity across hundreds of episode generations, DESCRIPTION\_PROMPT strings must adhere to four strict authoring dimensions:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ DESCRIPTION_PROMPT FORMAL SPECIFICATION MATRIX                         │`  
`├────────────────────┬───────────────────────────────────────────────────┤`  
`│ Dimension          │ Permitted Invariant Lexicon                       │`  
`├────────────────────┼───────────────────────────────────────────────────┤`  
`│ 1. Timbral Density │ "gravelly rasp", "thin wheeze", "resonant chest", │`  
`│                    │ "nasal pinch", "hollow subharmonic rattle"        │`  
`├────────────────────┼───────────────────────────────────────────────────┤`  
`│ 2. Cadence & Tempo │ "slow deliberate drawl", "frantic staccato",      │`  
`│                    │ "rhythmic clipped syllables", "hesitant metric"   │`  
`├────────────────────┼───────────────────────────────────────────────────┤`  
`│ 3. Glottal Closure │ "heavy vocal fry", "diaphragmatic breath leakage",│`  
`│                    │ "hyper-adducted vocal cords", "glottal stops"     │`  
`├────────────────────┼───────────────────────────────────────────────────┤`  
`│ 4. Acoustic Space  │ "extremely dry dead room", "zero reverberation",   │`  
`│                    │ "close proximity microphone", "anechoic chamber"  │`  
`└────────────────────┴───────────────────────────────────────────────────┘`

> * **Acoustic Environment Pinning:** The description prompt **must** explicitly mandate "extremely dry room, zero reverberation, close proximity". If ambient acoustics are omitted from the prompt, the model will randomly synthesize distant room reflections, bathroom tile flutter, or synthetic studio reverb across different takes, breaking acoustic continuity across scene cuts.

### **5\. Modality 4: Precomputed Synthetic Latent Vectors (SPEAKER\_VECTOR)**

The SPEAKER\_VECTOR modality operates by directly injecting mathematically defined or offline-optimized tensor arrays into the hidden layers of compact neural vocoders (such as **Kokoro-82M** or **Style-TTS2**). It decouples voice conditioning from both physical reference WAVs and human text parsing.

`PRECOMPUTED STYLE VECTOR FILE (.pt / .npy)`  
`\vec{S} = [ -0.142, 0.891, 0.004, -0.451, ..., 0.219 ] \in \mathbb{R}^{128}`  
                            `│`  
                            `▼`  
              `Direct Injection into Style-TTS2`  
                            `│`  
        `┌───────────────────┴───────────────────┐`  
        `▼                                       ▼`  
`Pitch / Energy Predictor                Diffusion Decoder Trajectory`

#### **Style Manifold Navigation & Vector Synthesis**

In Style-TTS2 and Kokoro architectures, speech is conditioned via a style vector *S*∈R128 residing in an acoustic latent manifold:

> * **Direct Vector Injection:** Unlike ZERO\_SHOT\_CLONE, which requires passing reference audio through an extraction network during ingestion, SPEAKER\_VECTOR loads the finalized, normalized 128-dimensional floating-point array directly into system memory.  
> * **Synthetic Identity Construction:** Style vectors can be generated mathematically by computing linear combinations of disparate voice vectors across the manifold:  
>   *S*composite​\=*αSA*​\+*βSB*​\+(1−*α*−*β*)*SC*​  
>   This allows the studio to engineer unique, synthetic identities that bear zero acoustic resemblance to any living human voice, eliminating talent likeness exposure entirely.

#### **Telemetry & Radio Comms Specialization**

> * **Extreme CPU Speed:** Kokoro-82M executes with a Real-Time Factor of RTF≤0.12× while consuming only 350 MB of system RAM.  
> * **Application in deep-space-salvage:** Powers non-biological identities, such as sys\_oracle7 (autonomous ship core) and sealed-suit telemetry systems. The synthetic vector guarantees flat, unwavering pitch tracking that mimics shipboard computer readouts.

### **6\. Polymorphic Engine Dispatching & Wire Protocol**

Within audio-microservice, the HTTP routing layer is completely decoupled from model execution mechanics. When an ingress request arrives at POST /generate, the polymorphic switchboard evaluates the character's registered conditioning.strategy and invokes the matching engine implementation:

`# audio-microservice/engines/multiplexer.py`  
`from typing import Dict, Any`  
`import numpy as np`  
`import torch`  
`from engines.base import BaseTTSEngine`  
`from schemas.manifest import VoiceRecipeSchema`

`class ConditioningMultiplexer:`  
    `def __init__(self, engines: Dict[str, BaseTTSEngine]):`  
        `self.engines = engines`

    `async def dispatch(`  
        `self,`  
        `text: str,`  
        `recipe: VoiceRecipeSchema,`  
        `scene_dsp_modifiers: Dict[str, float]`  
    `) -> np.ndarray:`  
        `engine = self.engines.get(recipe.tts_engine)`  
        `if not engine:`  
            `raise ValueError(f"Engine {recipe.tts_engine} not registered in warm pool.")`

        `strategy = recipe.conditioning.strategy`

        `# Polymorphic branching across the four conditioning modalities`  
        `if strategy == "ZERO_SHOT_CLONE":`  
            `# Pass cached embedding tensor or resolve reference WAV path`  
            `return engine.synthesize_line(`  
                `phonetic_text=text,`  
                `speaker_reference_path=recipe.conditioning.reference_voice_path,`  
                `speaker_embedding=self._load_tensor_cache(recipe.conditioning.speaker_embedding_cache),`  
                `conditioning_prompt=None,`  
                `base_modifiers=recipe.base_dsp_modifiers,`  
                `scene_dsp_modifiers=scene_dsp_modifiers`  
            `)`

        `elif strategy == "SPEAKER_ID":`  
            `# Pass integer speaker ID directly to ONNX runtime`  
            `return engine.synthesize_line(`  
                `phonetic_text=text,`  
                `speaker_reference_path=None,`  
                `speaker_embedding=recipe.conditioning.speaker_id, # Integer index`  
                `conditioning_prompt=None,`  
                `base_modifiers=recipe.base_dsp_modifiers,`  
                `scene_dsp_modifiers=scene_dsp_modifiers`  
            `)`

        `elif strategy == "DESCRIPTION_PROMPT":`  
            `# Forward immutable prompt string to autoregressive text encoder`  
            `return engine.synthesize_line(`  
                `phonetic_text=text,`  
                `speaker_reference_path=None,`  
                `speaker_embedding=None,`  
                `conditioning_prompt=recipe.conditioning.description_prompt,`  
                `base_modifiers=recipe.base_dsp_modifiers,`  
                `scene_dsp_modifiers=scene_dsp_modifiers`  
            `)`

        `elif strategy == "SPEAKER_VECTOR":`  
            `# Directly inject style vector into neural latent layers`  
            `style_vector = self._load_tensor_cache(recipe.conditioning.speaker_embedding_cache)`  
            `return engine.synthesize_line(`  
                `phonetic_text=text,`  
                `speaker_reference_path=None,`  
                `speaker_embedding=style_vector,`  
                `conditioning_prompt=None,`  
                `base_modifiers=recipe.base_dsp_modifiers,`  
                `scene_dsp_modifiers=scene_dsp_modifiers`  
            `)`

        `else:`  
            `raise NotImplementedError(f"Conditioning strategy {strategy} unsupported.")`

### **7\. Governance, Legal Clearance & Provenance Firewalls**

Conditioning modalities operate under distinct legal, contractual, and provenance requirements enforced by the studio's **Talent & Casting Pod (POD-04)** and **Legal & Provenance Pod (POD-01)**:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ LEGAL & PROVENANCE CLEARANCE TAXONOMY                                  │`  
`├────────────────────┬───────────────────────────────────────────────────┤`  
`│ Modality           │ Union & Licensing Invariant                       │`  
`├────────────────────┼───────────────────────────────────────────────────┤`  
`│ ZERO_SHOT_CLONE    │ Mandatory SAG-AFTRA Digital Voice Likeness Rider  │`  
`│                    │ Pinned performer ID; strict series exclusivity;   │`  
`│                    │ per-minute royalty calculation in ledger.         │`  
`├────────────────────┼───────────────────────────────────────────────────┤`  
`│ SPEAKER_ID         │ Checkpoint License Verification                   │`  
`│                    │ Asserts commercial runtime clearance of the base  │`  
`│                    │ ONNX weights (e.g., MIT, Apache 2.0).             │`  
`├────────────────────┼───────────────────────────────────────────────────┤`  
`│ DESCRIPTION_PROMPT │ Non-Biometric Text Copyright Shield               │`  
`│                    │ Validates that description tokens do not cite     │`  
`│                    │ living performers (e.g., "sounds like Actor X").  │`  
`├────────────────────┼───────────────────────────────────────────────────┤`  
`│ SPEAKER_VECTOR     │ Synthetic Identity Certification                  │`  
`│                    │ Asserts mathematical synthetic origin; verifies   │`  
`│                    │ zero biometric overlap with living talent pools.  │`  
`└────────────────────┴───────────────────────────────────────────────────┘`

#### **Cross-Series Invariant: The Quarantine of Likeness**

> * **Strict Namespace Firewalls:** A voice embedding created under ZERO\_SHOT\_CLONE for wiregrass-basin can never be referenced by under-the-floorboards. Reusing a voice asset across series boundaries trips a fatal LEGAL\_CLEARANCE\_BREACH during pre-flight linting.  
> * **Foreign-Language Dubs (POD-17 Localization):** A zero-shot voice reference cleared for English episodic synthesis cannot be deployed in localized foreign-language synthesis without an executed contract addendum. If foreign dubbing is required without performer clearance, the character's profile in that language must migrate to a distinct SPEAKER\_VECTOR or DESCRIPTION\_PROMPT configuration.

#### **Cryptographic Provenance Anchoring**

Whenever a voice stem is synthesized, the conditioning parameters are permanently captured in the episode's root provenance ledger:

> * For ZERO\_SHOT\_CLONE, the stem record logs the SHA-256 hash of the input reference .wav file.  
> * For SPEAKER\_ID, it logs the exact integer ID and the ONNX model graph digest.  
> * For DESCRIPTION\_PROMPT, it logs the canonicalized text prompt string and its HMAC token.  
> * For SPEAKER\_VECTOR, it logs the binary hash of the .pt tensor.

These signatures are baked into render\_manifest.json and attached to the C2PA digital asset certification envelope, ensuring that decades later, any rendered frame or audio second can be traced to the exact conditioning rules that governed its physical generation.

---

*User prompt: {{FOCUS: Profile 1: The Pilot (char\_020\_the\_pilot) — Dying Crop Duster}} /extreme-details*

### **Response: 1\. Ontological Identity & Machine Representation**

**The Pilot** (char\_020\_the\_pilot, historically indexed in structural drafts as char\_008 / char\_pilot) is the load-bearing somatic and moral anchor of the *Wiregrass Basin* narrative universe. Operating as an unlicensed, rogue crop duster and aerial scavenger in the post-industrial swamp basin of South Georgia, the character embodies the collision of severe physical entropy, illicit logistical survival, and repressed generational debt.

Within the multi-repository studio architecture, the character is codified not as a collection of loose literary descriptions, but as an immutable, typed entity configuration (corpus/characters/char\_020\_the\_pilot.md in goblin-lore / wiregrass-lore) validated at build time (*T*0​) by continuous integration schemas:

`---`  
`id: char_020_the_pilot`  
`name: The Pilot`  
`type: character`  
`somatic_vector:`  
  `locomotion_baseline: heavy_grounded_slog`  
  `active_conditions:`  
    `- condition_id: neurotoxic_tremor_acute`  
      `severity: 0.75`  
      `motor_limitations: [NO_SPRINT, IMPAIRED_FINE_MOTOR, UNSTEADY_GAIT]`  
      `vocal_dsp_modifiers:`  
        `pitch_semitones: -1.5`  
        `speed_multiplier: 0.90`  
        `pause_frequency_multiplier: 1.4`  
      `generation_prompt_fragment: "haggard 40s airborne scrapper, right hand clamped to combat vest to hide shaking, grease-stained flight suit"`  
  `signature_tics:`  
    `- "flexes right fingers rhythmically against his thigh to break muscular lockup"`  
    `- "keeps his left shoulder dropped, bracing against chronic lumbar pinch"`  
  `banned_kinetic_verbs: [sprint, run, vault, leap, sprint_forward, dive]`  
`equip_slots:`  
  `worn: ["faded_nomex_flight_suit", "lumbar_support_harness"]`  
  `held: "brass_siphon_nozzle"`  
  `carried: ["father_composition_notebook_1980s", "clove_lozenges"]`  
  `cached_at:`  
    `culvert_drain_basin: ["five_gallon_poly_drum"]`  
`epistemic_vector:`  
  `known_secret_ids: ["secret_004_solvent_taint"]`  
  `escalation_ceiling: "The Pilot will never mention his father's debts unprompted; his psychological armor breaks only if Spurl names the aircraft registry."`  
  `voice_tags: [clipped_cadence, aeronautical_slang, evasive_declaratives]`  
`---`

### **2\. Somatic Vector, Pathological Biomechanics & Kinetic SAT Invariants**

The Pilot’s physical state is a deterministic constraint engine rather than background flavor. The character’s biology governs what actions child generative workers (large language models, diffusion models, and optical compositors) are permitted to output:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   SOMATIC PATHOLOGY & TRAUMA LEDGER                    │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. L4–L5 Lumbar Vertebral Compression                                  │`  
`│    • Etiology: Hundreds of un-cushioned ditch landings & autorotations │`  
`│    • Biomechanical Penalty: locomotion_baseline = heavy_grounded_slog   │`  
`│    • Kinetic Invariant: Banned from sprinting, jumping, or leaping     │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 2. Right Brachial Plexus Severing & Neuropathy                         │`  
`│    • Etiology: Chemical / mechanical severing in 1991                  │`  
`│    • Neurological Symptoms: Raynaud's syndrome & neurotoxic tremors    │`  
`│    • Motor Penalty: IMPAIRED_FINE_MOTOR; right arm lacks motor power   │`  
`│    • Hand Invariant: Hand Capacity = 1.0 (Left hand functional only)   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 3. Stage-2 Chemical Pulmonary Fibrosis                                 │`  
`│    • Etiology: Inhalation of defoliants, kerosene mist, and solvents   │`  
`│    • Dynamic Coupling: Respiratory drag scales inter-clause pauses     │`  
`│    • Acoustic Manifestation: Spasmodic diaphragmatic breath leakage    │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Locomotion Baseline (heavy\_grounded\_slog):** The Pilot cannot move with fluid athletic agility. Every forward step involves dragging mass against gravitational resistance, with his center of gravity pitched forward to alleviate lower spine compression.  
> * **The Hand Capacity Invariant Equation (*C*hand​):** Evaluated at compile time (*T*0​\=\$0.00) before any text generation or rendering occurs:  
>   *C*hand​\=*h*∈Hands∑​I(*h*.functional)−*i*∈HeldItems∑​*i*.hands\_required  
>   Because The Pilot's right brachial plexus is severed and subject to severe neurotoxic tremors, the right arm possesses zero motor function below the clavicle. His functional hand count is exactly **1** (the left hand).  
  * If a screenplay beat instructs The Pilot to hold both the brass\_siphon\_nozzle and a flashlight simultaneously, the compiler halts immediately:  
    *C*hand​\=1−(1+1)=−1\<0⟹FAIL (HAND\_CAPACITY\_BREACH)  
> * **Banned Kinetic Verbs:** The pipeline linter enforces that:  
>   extracted\_motor\_actions∩banned\_kinetic\_verbs=∅  
>   The set \[sprint, run, vault, leap, sprint\_forward, dive, climb, two\_handed\_aim\] is completely illegal for The Pilot. If an untrusted generative script has him vaulting over an iron culvert or sprinting away from a patrol cruiser, the AST validator rejects the scene prior to GPU dispatch.  
> * **Signature Biomechanical Tics:** To prevent "floating head syndrome" in diffusion video generation, prompting injection forces specific grounding behaviors:  
  1. *Right-Hand Thigh Flex:* Rhythmically flexing his right fingers against his outer thigh to break acute muscular lockups caused by adrenaline.  
  2. *Dropped Left Shoulder:* Dropping and leaning into his left shoulder to offset chronic L4–L5 impingement.  
  3. *Chest Vest Clamping:* Clamping his shaking right hand into the webbing of his survival vest to conceal the tremors from adversaries.

### **3\. Logistical Vector, Material Scarcity & Equip-Slot Physics**

In the *Wiregrass Basin*, material resources and equipment are not plot conveniences; they obey strict physical conservation-of-matter invariants. Items cannot teleport, and containers cannot exceed spatial volume:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   THE PILOT: LOGISTICAL VECTOR GRAPH                   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ WORN:                                                                  │`  
`│ ├── faded_nomex_flight_suit (Grease-stained, fire-retardant skin)      │`  
`│ └── lumbar_support_harness (Reinforced canvas brace for L4-L5 vertebrae│`  
`│                                                                        │`  
`│ HELD (Strict 1-Item Anatomical Limit):                                 │`  
`│ └── brass_siphon_nozzle (Machined fitting for illegal drainage tap)    │`  
`│                                                                        │`  
`│ CARRIED (Pockets / Bandolier):                                         │`  
`│ ├── father_composition_notebook_1980s (Water-damaged debt ledger)      │`  
`│ └── tin_of_clove_lozenges (Medicinal masking agent for solvent breath) │`  
`│                                                                        │`  
`│ CACHED (Culvert Drain Basin - Spatial Anchor):                         │`  
`│ └── five_gallon_poly_drum (Plastic vessel containing 8.5L red diesel)  │`  
`│                                                                        │`  
`│ VEHICLE / MOBILE RIG (Scavenged Airframe):                             │`  
`│ └── Scavenged Hughes 500 Rotary-Hybrid Utility Sled                    │`  
`│     • Fuel System: Un-geofenced, illicit untaxed red-diesel & ethanol  │`  
`│     • Vulnerability: Corrosive solvent melt-hazard on turbine seals    │`  
`│     • Avionics: Analog flight telemetry black box tractor feed         │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Strict Volume Accounting:** In Episode 1, Scene 1 ("The Siphon"), The Pilot siphons exactly 8.5 liters of fuel from an agricultural valve into his five-gallon polyethylene drum. This logistical expenditure is tracked downstream:  
>   `-- D1 State Mutation Transaction (Step 10)`  
>   `INSERT INTO canon_state_snapshots (`  
>     `id, entity_id, scene_origin_id, version,`   
>     `somatic_vector, logistics_vector, epistemic_vector, state_hash`  
>   `) VALUES (`  
>     `'snap_pilot_ep01_sc02', 'char_020_the_pilot', 'ep01_sc01', 2,`  
>     `'{"locomotion":"heavy_grounded_slog","conditions":[{"id":"neurotoxic_tremor_acute","severity":0.85}]}',`  
>     `'{"inventory":[{"id":"five_gallon_poly_drum","fuel_liters":8.5}]}',`  
>     `'{"known_secrets":["secret_004_solvent_taint","fact_fuel_is_poisoned"]}',`  
>     `'9a12c4e8b7f1'`  
>   `);`

> * **The Cascade Cliff Hazard:** If an author or pipeline run drafts Scene 3 assuming The Pilot has 80 liters of clean fuel remaining when the ledger records only 8.5 liters of poisoned kerosene, the system triggers a cascade invalidation:  
>   Ep 1, Scene 3⟹INVALIDATED (Requires 80L, holds 8.5L)  
>   Ep 1, Scene 6⟹IMPOSSIBLE (Turbine seals dissolved by solvent)

### **4\. Epistemic Vector, Secrets & The Attenuation Engine**

The Pilot’s psychological space is defined by extreme informational asymmetry and conversational defense mechanisms. He interacts through Dwight Swain’s Motivation-Reaction Units (MRUs), where cognitive processing is mediated by fear of economic exposure:

               `EPISTEMIC HORIZON & ATTENUATION FENCE`  
                 
  `Canonical Truth: Spurl knows the culvert fuel is contaminated industrial solvent.`  
  `Pilot's Belief:  The fuel is clean, high-grade agricultural red diesel.`  
                                   `│`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ ASTRO COCKPIT: DYNAMIC TENSION CONTROLS                                │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Curtness: 0.84             ──► Breath-starved, clipped syntax          │`  
`│ Pacing / Action Density: 0.70 ──► Heavy silence, prolonged reaction cuts│`  
`│ Threat Level: 0.92         ──► Lethal stakes; physical cornering       │`  
`│ Subtext Suppression: 0.88  ──► Negative Attenuation Fence Active       │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ THE ATTENUATION NEGATIVE FENCE (Child Graph A Prompt Guard)            │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ BANNED LITERAL TOKENS:                                                 │`  
`│ ["solvent", "poison", "steal", "arrest", "illegal", "jurisdiction",     │`  
`│  "father", "debt"]                                                     │`  
`│                                                                        │`  
`│ TACTICAL DISPLACEMENT PROXY:                                           │`  
`│ All psychological warfare must be negotiated entirely through:         │`  
`│ • Weight ratings of corrugated iron ditch culverts                     │`  
`│ • Hydraulic backflow pressure & siphon suction clicks                  │`  
`│ • Flash point and color tint of agricultural diesel                    │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **The Escalation Ceiling:** The Pilot will never mention his father's salvage debts unprompted. His psychological defense breaks only if an interlocutor explicitly speaks the aircraft registry code of the downed 1980s spray rig.  
> * **Voice Tags & Cadence:** \[clipped\_cadence, aeronautical\_slang, evasive\_declaratives\]. He deflects personal inquiries by describing pressure gauges, wind shear, manifold pressure, and fuel contamination thresholds.

### **5\. Acoustic Blueprint & Audio-Microservice Recipe Specification**

Within audio-microservice on Rig 1 (port 8000), The Pilot's voice is executed via an immutable recipe in voices/wiregrass-basin/voice\_manifest.json:

`{`  
  `"$schema": "https://specs.studio.internal/schemas/v2/voice_recipe.json",`  
  `"series_slug": "wiregrass-basin",`  
  `"character_id": "char_020_the_pilot",`  
  `"active_version": "v3",`  
  `"recipe": {`  
    `"tts_engine": "CosyVoice-300M",`  
    `"checkpoint": {`  
      `"model_repo": "FunAudioLLM/CosyVoice-300M",`  
      `"weights_sha256": "8a7c29e1f5d4a3b8c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9",`  
      `"quantization": "FP16"`  
    `},`  
    `"conditioning": {`  
      `"strategy": "ZERO_SHOT_CLONE",`  
      `"reference_voice_path": "voices/wiregrass-basin/versions/the_pilot_v3.wav",`  
      `"reference_sha256": "4a8c9e2b10a5e8f1d3c5e7b9a2c4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0",`  
      `"speaker_embedding_cache": "voices/wiregrass-basin/embeddings/the_pilot_v3.pt",`  
      `"performer_consent_id": "SAG-AFTRA-VOX-2026-PILOT-020"`  
    `},`  
    `"base_dsp_modifiers": {`  
      `"basePitchShiftSemitones": -2.5,`  
      `"formantWarpingFactor": 0.92,`  
      `"speedScalar": 0.85,`  
      `"baseBreathiness": 1.80,`  
      `"baseVocalFry": 0.45`  
    `},`  
    `"dynamics_and_eq": {`  
      `"high_pass_cutoff_hz": 90.0,`  
      `"high_pass_slope_db_oct": 24,`  
      `"de_esser_threshold_db": -18.0,`  
      `"de_esser_frequency_hz": 6800.0,`  
      `"target_integrated_lufs": -16.0,`  
      `"brickwall_true_peak_dbtp": -1.0,`  
      `"noise_floor_ceiling_dbfs": -60.0`  
    `},`  
    `"phonetic_overrides": {`  
      `"lexicon_file": "voices/wiregrass-basin/lexicon.json",`  
      `"enable_regex_replacements": true`  
    `},`  
    `"banned_cadences": [`  
      `"RAPID_STACCATO",`  
      `"RISING_INFLECTION_INTERROGATIVE",`  
      `"CHEERFUL_MODULATION"`  
    `]`  
  `}`  
`}`

#### **Acoustic DSP Rationale**

> * **Pitch & Formants (*F*0​\=−2.5 st,*W*\=0.92):** A fundamental pitch shift of −2.5 semitones drops his delivery into an exhausted chest drone, while a 0.92 formant factor tightens the virtual vocal tract, replicating chronic laryngeal scarring and throat tightness caused by defoliant exposure.  
> * **Diaphragmatic Breathiness (Π=1.80):** Forces the flow-matching vocoder to insert deep, raspy breath intakes before and after spoken clauses, reflecting his compromised lung capacity.  
> * **Subharmonic Glottal Fry (Φ=0.45):** Generates low-frequency vocal fold rattle at sentence terminations, signaling fatigue.

#### **Dynamic Pressure Meter Coupling**

When The Pilot’s SOMATIC\_FATIGUE basis-point meter crosses 8,000 bp (or when his acute tremor severity escalates from 0.75 to 0.85 following physical exertion at the culvert), dynamic somatic modifiers compose algebraically with his baseline profile:

Πeffective​\=1.80×1.4=2.52× pause dilation  
Φeffective​\=clamp(0.45+0.40,0.0,1.0)=0.85 vocal fry density

This forces his lines to fragment into exhausted, broken syllables that terminate abruptly on plosives.

### **6\. Temporal Master Clock & Gate 2 Tracer Bullet Execution**

Because audio duration serves as the physical pacemaker for the entire production pipeline, The Pilot’s speech sets the exact frame boundary for visual plates:

`AUDIO DOMAIN (Sample-Accurate Timebase Clock: 48,000 samples/sec)`  
`│`  
`├── Input Text: "Headlights don't make you a deputy, Spurl. Not anymore."`  
`├── Ingestion: voices/wiregrass-basin/lexicon.json transforms dialect`  
`├── CosyVoice-300M synthesizes uncompressed 48 kHz / 24-bit WAV`  
`└── ffprobe inspection: D_ms = 3,120.00 ms (Passes -16 LUFS / -1.0 dBTP gate)`  
`│`  
`▼ Pure Integer Ceiling Derivation: ceil((3120 / 1000) * 24) = 75 frames (3,125.00 ms)`  
`VIDEO DOMAIN (Discrete Video Clock: 24 frames/sec)`  
`│`  
`├── Track 1: Mounted at absolute frame offset in Remotion timeline`  
`├── Track 2: Seeded Foley (brass_siphon_clink, mud_boot_squelch via Mulberry32)`  
`├── Track 3: Sidechain ducking dips industrial rain bed by -14 dB (6f attack, 12f release)`  
`│`  
`▼ Rig 2 Foundry Conformance (4n + 1 Latent Lattice)`  
`└── ComfyUI / Wan 2.2 allocates n = 19: 4(19) + 1 = 77 native frames`  
    `Remotion trims the 2 frames of tail slack, locking the 75-frame visual plate`

In the Gate 2 Tracer Bullet test for Episode 1, Scene 1, Shot 02, this exact pipeline synthesized The Pilot's confrontational dialogue, measured the 3.12-second duration, locked the 75-frame budget, and composited the final green-screen plate over an industrial drainage culvert matte without human intervention.

### **7\. Forensic Artifact Fiction: The Sled Telemetry Black Box**

In accordance with the studio's Forensic Artifact Fiction protocol, The Pilot's state is preserved not only in visual video composites, but as an in-world bureaucratic and mechanical artifact extracted from his machine:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ EP101 FORENSIC DOSSIER // ARTIFACT C                                   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ ARTIFACT ID: TELEM-1984-SLED-020-BLACKBOX                              │`  
`│ CLASSIFICATION: CONTINUOUS TRACTOR-FEED FLIGHT RECORDER                │`  
`│ SOURCE ENGINE: Utility Sled Turbine Core / Suction Tap Interface       │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ [11:58:12 PM] ROTOR RPM: 0000 (STATIC ON GROUND TIE-DOWN)             │`  
`│ [11:59:04 PM] SUCTION TAP ENGAGED: PORT CULVERT-4B                     │`  
`│ [12:01:45 AM] FUEL ACCUMULATION: +8.5 LITERS [UNTAXED RED DIESEL]     │`  
`│ [12:02:11 AM] HYDROCARBON DENSITY WARNING: 0.892 g/cm³                │`  
`│               >> VISCOSITY ANOMALY: AROMATIC HYDROCARBON SOLVENT <<   │`  
`│               >> ACIDITY THRESHOLD EXCEEDED: NITRILE SEAL HAZARD <<    │`  
`│ [12:03:00 AM] FLIGHT CONTROL SYSTEM: UNSTEADY CYCLIC INPUT DETECTED    │`  
`│               >> LATERAL ROLL DRIFT: +14.2° (RIGHT-HAND SLIPPAGE) <<  │`  
`│ [12:03:22 AM] PILOT INTERCOM ACOUSTIC CAPTURE:                         │`  
`│               "Headlights don't make you a deputy, Spurl..."           │`  
`│               >> INTEGRATED LOUDNESS: -16.0 LUFS | RMS NOISE: -61 dBFS │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Forensic Separation:** The artifact is generated by compiling vector typography (Typst) over a 300 DPI aged, oil-stained continuous tractor-feed paper texture rendered via diffusion. Generative models never draw the text. The discrepancies between Spurl’s official police narrative, the coroner’s autopsy reports, and this flight recorder create the dramatic "forensic gap" that drives the overarching mystery of the series.

### **8\. The "Still Good" Protocol & Auteur Review Telemetry**

Because The Pilot’s physical damage is heavily load-bearing across the narrative dependency graph, modifying his facts carries severe invalidation liability:

`┌─────────────────────────────────────────────────────────────────────────────┐`  
`│ ASTRO SHOWRUNNER COCKPIT // LOAD-BEARING PILLAR AUDIT                       │`  
`├─────────────────────────────────────────────────────────────────────────────┤`  
`│ 🚨 AUDIT ITEM 1 OF 2 // CRITICAL PRIORITY SCORE: 114.8                     │`  
`│                                                                             │`  
`│ Fact ID: fact_char020_right_arm_paralysis                                   │`  
`│ Scope: SOMATIC INVARIANT (Weight: 1.5) // Standing: ACTIVE_ENDORSED         │`  
`│ Days Without Scrutiny: 94 Days                                              │`  
`│ Downstream Load: 42 Scenes (18 Video Plates, 14 Comic Panels, 10 Prose)     │`  
`│                                                                             │`  
`│ [ CORE STATEMENT ]:                                                         │`  
`│ "The Pilot's right arm possesses zero motor function below the clavicle     │`  
`│  due to a chemical brachial plexus severing in 1991."                       │`  
`│                                                                             │`  
`│ [ RECONSIDERATION ACTIONS ]:                                                │`  
`│  [1] STILL GOOD (Reaffirms truth; zero ripple effects; resets stale days)   │`  
`│  [2] FLAG FOR ROOM (Enters liminal state; amber badge; zero cascades)       │`  
`│  [3] RETCON FACT (Opens atomic migration dialog; cascades 42 scenes)        │`  
`└─────────────────────────────────────────────────────────────────────────────┘`

> * **Downstream Load (*k*\=42):** If a showrunner carelessly edits fact\_char020\_right\_arm\_paralysis in the database, 18 completed GPU video plates, 14 Typst comic panels, and 10 prose beats are immediately flagged dirty (is\_dirty \= 1), halting render queues across the studio.  
> * **The Tri-State Standing Lifecycle:** The cockpit decouples creative doubt from destructive invalidation. A writer can move the fact to FLAGGED\_FOR\_REVIEW to debate whether his arm should be healed, placing an amber badge in the writing room without halting active ComfyUI rendering passes on Rig 2\.  
> * **Double-Blind Canary Defect:** To ensure independent human story auditors are rigorously catching continuity breaches, engineering injects deliberate canary defects into test scripts:  
  * *Canary 1 (Somatic):* The Pilot grips a heavy metal siphon or flashlight with his right hand in Scene 4\.  
  * If the external auditor fails to flag this violation of his brachial plexus severing, the audit is discarded for insufficient attentiveness, preserving the integrity of the character's biological laws.

---

*User prompt: {{FOCUS: 3\. Somatic DSP Mapping Architecture}} /extreme-details*

Response: The **Somatic DSP Mapping Architecture** within audio-microservice transforms biological damage, nervous exhaustion, and physical trauma recorded in the canonical relational ledger into concrete digital signal processing parameters and neural vocoder conditioning vectors. Under the studio's governing separation of semantic truth (Axis A) from artifact hardening (Axis B), generative models are untrusted, headless execution workers that possess zero authority to invent character behavior or ignore physical pathology. Rather than relying on non-deterministic generative prompts, somatic trauma translates deterministically into acoustic filters, formant warping, and respiratory pauses, directly dictating the physical duration of synthesized dialogue stems that establish the master timeline clock for all downstream visual animation.

### **1\. Ingress Contracts & Pre-Flight Feasibility Validation**

The translation process begins when the local Conductor (worker-sower-conductor running on Rig 1\) parses the canonical state snapshot emitted by worker-sower-engine via getCharacterSomaticMask(state, characterId) and receives the scene's abstract syntax tree (dialogue\_ast.json).

`CANONICAL STATE LEDGER (Cloudflare D1 / SQLite Snapshot)`  
  `├─ SomaticVector: Conditions, severities (0.0 to 1.0), locomotion baseline, motor limits`  
  `└─ EquipSlots & Inventory: Anatomical hand saturation (occupies_hands)`  
                          `│`  
                          `▼`  
            `getCharacterSomaticMask(state, charId)`  
                          `│`  
                          `▼`  
     `Zod Ingress Linter (SceneASTSchema / DialogueLineSchema)`  
                          `│`  
                          `▼ Pre-Flight Feasibility Assertion (T_0 = $0.00)`  
    `assert(c.has_verbal_directives => "mute" ∉ conditions ∧ "speak" ∉ banned_kinetic_verbs)`  
                          `│`  
                          `▼`  
      `ttsClient.ts Ingress Dispatch (POST http://127.0.0.1:8000/generate)`

#### **The Runtime Zod Contract (src/types/narrative.ts)**

Before dispatching network sockets or invoking local neural engines, the Conductor validates the payload against strict Zod contracts:

`import { z } from "zod";`

`export const DialogueLineSchema = z.object({`  
  `speaker: z.string(),`  
  `text: z.string(),`  
  `emotion: z.string(),`  
  `tonePacing: z.number().default(1.0),`  
  `dspModifiers: z.record(z.number()).optional(), // e.g., pause_frequency_multiplier, pitch`  
  `foleyCues: z.array(z.string()).optional()`  
`});`

`export const SceneASTSchema = z.object({`  
  `sceneId: z.string(),`  
  `episodeId: z.string(),`  
  `lines: z.array(DialogueLineSchema)`  
`});`

`export type SceneAST = z.infer<typeof SceneASTSchema>;`

#### **The Formal AcousticDSPProfile Interface**

The biological constraints projected from getCharacterSomaticMask are represented through a standardized schema:

`export interface AcousticDSPProfile {`  
  `basePitchShiftSemitones: number;    // -12.0 to 12.0 semitones`  
  `formantWarpingFactor: number;       // 0.5 to 2.0 (vocal tract geometry scaling)`  
  `breathinessPauseMultiplier: number; // 1.0 to 3.5 (pulmonary trauma phrase ceiling)`  
  `vocalFryDensity: number;            // 0.0 to 1.0 (subharmonic rattle injection)`  
  `bannedCadences: readonly string[];  // e.g., ["RAPID_STACCATO", "RISING_INFLECTION"]`  
`}`

#### **Pre-Flight Vocal-Motor Feasibility Gating**

Before any audio inference is triggered, the Conductor runs a compile-time feasibility assertion at zero GPU compute cost (*T*0​\=\$0.00):

*c*.has\_verbal\_directives⟹"mute"∈/*c*.conditions∧"speak"∈/*c*.banned\_kinetic\_verbs

> * If an entity suffering from crushed laryngeal cartilage, bilateral vocal cord paralysis, or a severed trachea is instructed to speak, the compiler aborts compilation immediately with VOCAL\_DELIVERY\_BREACH.  
> * Similarly, if an entity's locomotion baseline is tagged as heavy\_grounded\_slog or neuropathy\_shuffle, or if its available arms evaluate to 0.0, dialogue lines accompanied by incompatible physical movements (e.g., shouting while sprinting or two-handed aiming) are halted before touching audio workers.

### **2\. The Somatic-to-Acoustic Translation Matrix**

Biological conditions stored in the simulation ledger map to digital signal processing parameters that reshape both the neural vocoder’s latent space and the post-synthesis waveform:

`LEDGER SOMATIC DAMAGE ──► ACOUSTIC DSP TRANSLATION MATRIX`  
`┌──────────────────────────────────────┬────────────────────────────────────────┐`  
`│ Biological Condition / Trauma Vector │ Injected DSP Parameters                │`  
`├──────────────────────────────────────┼────────────────────────────────────────┤`  
`│ Stage-1 Pulmonary Fibrosis / Gas     │ breathinessPauseMultiplier: 2.2        │`  
`│ Inhalation Damage                    │ pause_frequency_multiplier: 1.4        │`  
`│                                      │ Injects micro-silences; forces phrases │`  
`│                                      │ to end prematurely on hard consonants  │`  
`├──────────────────────────────────────┼────────────────────────────────────────┤`  
`│ Severe Hypothermia / Shock           │ basePitchShiftSemitones: +2.5          │`  
`│                                      │ vocalFryDensity: 0.8                   │`  
`│                                      │ High-frequency vocal flutter           │`  
`├──────────────────────────────────────┼────────────────────────────────────────┤`  
`│ Crushed Laryngeal Cartilage          │ formantWarpingFactor: 0.7              │`  
`│                                      │ basePitchShiftSemitones: -4.0          │`  
`│                                      │ Severe formant scooping                │`  
`└──────────────────────────────────────┴────────────────────────────────────────┘`

#### **Deep Parametric Breakdown of Biological Trauma**

> * **Stage-1 Pulmonary Fibrosis & Chemical Gas Inhalation:**  
  * *Parameters:* breathinessPauseMultiplier: 2.2, pause\_frequency\_multiplier: 1.4.  
  * *Mechanics:* Lung capacity caps maximum uninterrupted phrase duration. In the vocoder, clauses are truncated after 4–6 syllables, inserting unvoiced aspiration frames (200 ms to 450 ms). Sentences end abruptly on hard consonants with trailing aspiration rather than smooth vowel decays.  
> * **Severe Hypothermia & Acute Physiological Shock:**  
  * *Parameters:* basePitchShiftSemitones: \+2.5, vocalFryDensity: 0.8.  
  * *Mechanics:* Acute somatic distress causes muscle hypertonia, elevating the fundamental frequency (*F*0​) by \+2.5 semitones without altering speaking tempo. The elevated vocal fry density (0.8) injects glottal instability and shivering micro-flutter, simulating erratic vocal fold adduction under shivering.  
> * **Crushed Laryngeal Cartilage & Blunt Neck Trauma:**  
  * *Parameters:* formantWarpingFactor: 0.7, basePitchShiftSemitones: \-4.0.  
  * *Mechanics:* Physical trauma collapses the pharyngeal resonant cavity. Dropping fundamental pitch by −4.0 semitones while compressing formants by 0.7 creates deep acoustic formant scooping, resonant tract constriction, and muffled pharyngeal damping, eliminating high-frequency harmonic overtones.  
> * **Neurotoxic Tremor & Spinal Vertebral Compression (e.g., The Pilot / char\_020\_the\_pilot):**  
  * *Parameters:* basePitchShiftSemitones: \-1.5, speed\_multiplier: 0.90, pause\_frequency\_multiplier: 1.4.  
  * *Mechanics:* Vertebral compression (L4–L5) and motor neuropathy produce diaphragmatic exhaustion. Dialogue drags by 10% with a downward pitch shift of −1.5 semitones, while inter-clause breath intervals dilate by 40% to convey persistent physical strain.  
> * **Psychological Humiliation & Submissive Collapse:**  
  * *Parameters:* speed\_modifier: 0.85, dsp\_gain\_db: \-2.0, trailing ellipses injection.  
  * *Mechanics:* When an entity acquires the humiliated condition tag during tactical state resolution, the DSP pipeline attenuates output gain by −2.0 dB, decelerates tempo to 0.85×, and forces unvoiced trailing pauses at sentence endings, preventing confident or projected delivery.

### **3\. Dynamic Algebraic Composition & Pressure Meter Dynamics**

Somatic modifiers are not static presets; they compose dynamically through algebraic summation across the character's baseline profile and runtime state:

`┌────────────────────────────────────────────────────────┐`  
`│ BASELINE VOICE RECIPE (voice_manifest.json)            │`  
`│ • basePitchShiftSemitones (Neutral F0 offset)          │`  
`│ • formantWarpingFactor    (Vocal tract anatomy scale)  │`  
`│ • speedScalar             (Default conversational rate)│`  
`│ • baseBreathiness         (Diaphragmatic baseline)     │`  
`│ • baseVocalFry            (Glottal closure baseline)   │`  
`└───────────────────────────┬────────────────────────────┘`  
                            `│`  
                            `│ Algebraic Composition Channel`  
                            `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ DYNAMIC SCENE INGRESS (TTSGenerationRequest Payload)   │`  
`│ • ΔPitch_scene            (Emotional / shock delta)    │`  
`│ • ΔFormant_scene          (Laryngeal trauma scaling)   │`  
`│ • tonePacing_scene        (Urgency multiplier)         │`  
`│ • pause_multiplier_scene  (Pulmonary exhaustion scale) │`  
`│ • ΔFry_scene              (Somatic fatigue delta)      │`  
`└───────────────────────────┬────────────────────────────┘`  
                            `│`  
                            `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ EFFECTIVE RUNTIME DSP VECTOR                           │`  
`│ • F_0,eff   = basePitchShift + ΔPitch_scene            │`  
`│ • W_eff     = formantWarping * ΔFormant_scene          │`  
`│ • P_eff     = speedScalar * tonePacing_scene           │`  
`│ • Π_eff     = baseBreathiness * pause_multiplier_scene │`  
`│ • Φ_eff     = clamp(baseVocalFry + ΔFry_scene, 0, 1)   │`  
`└────────────────────────────────────────────────────────┘`

#### **Mathematical Composition Formulas**

> 1. **Effective Pitch (*F*0, eff​):**  
>    *F*0, eff​\=basePitchShiftSemitones+ΔPitchscene​  
> 2. **Effective Formant Warping (*W*eff​):**  
>    *W*eff​\=formantWarpingFactor×ΔFormantscene​  
> 3. **Effective Pacing Velocity (*P*eff​):**  
>    *P*eff​\=speedScalar×tonePacingscene​  
> 4. **Effective Breath Pause Factor (Πeff​):**  
>    Πeff​\=baseBreathiness×pause\_frequency\_multiplierscene​  
> 5. **Effective Vocal Fry Density (Φeff​):**  
>    Φeff​\=clamp(baseVocalFry+ΔFryscene​,0.0,1.0)

#### **Unified Pressure Meter Engine Coupling**

Dynamic scene deltas are driven directly by the simulation's Unified Pressure Meter Engine, which tracks trauma and exhaustion in integer basis points (0 to 10,000 bp):

> * **SOMATIC\_FATIGUE (0 to 10,000 bp):** When fatigue exceeds 8,000 bp, the engine injects severe diaphragmatic drag, scaling pause\_frequency\_multiplier to 2.8 and vocalFryDensity to 0.85, while compile-time linters assert that banned\_kinetic\_verbs includes running and jumping.  
> * **PHYSICAL\_PAIN (0 to 10,000 bp):** High pain ratings inject sudden involuntary pitch spikes (ΔPitchscene​\=+3.0) and trigger visceral reaction holds in the exposure sheet.  
> * **Domain Decoupling Invariant:** Physical fatigue is decoupled from moral or psychological refusal. A character with 9,000 bp in SOMATIC\_FATIGUE will experience labored breathing pauses, but their ideological boundaries remain intact unless bridged by explicit authored threshold rules.

### **4\. Dwight Swain Motivation-Reaction Units (MRUs) & Acoustic Geometry**

Dialogue lines processed by audio-microservice adhere to Dwight Swain’s Motivation-Reaction Unit (MRU) structure: **Stimulus → Involuntary Reflex → Conscious Thought → Speech/Action**:

`TIMELINE REACTION-CUE GEOMETRY (24 FPS)`

`Case A: reaction_cue = "NONE"`  
`┌────────────────────────────────────────────────────────┐`  
`│ Audio Stem: dialogue_sh001.wav (Continuous Delivery)   │`  
`└────────────────────────────────────────────────────────┘`  
`▲`  
`Line Starts (Frame 0)`

`Case B: reaction_cue = "VISCERAL_STING"`  
`┌──────────────────────┬─────────────────────────────────┐`  
`│ Visual Pre-Roll Hold │ Audio Stem: dialogue_sh002.wav  │`  
`│ (12 to 24 Frames)    │ (Involuntary gasp / motor flinch│`  
`└──────────────────────┴─────────────────────────────────┘`  
`▲                      ▲`  
`Stimulus Impact        Spoken Dialogue Begins`

> * **Visual Pre-Roll Allocation:** When an AST node contains reaction\_cue: "VISCERAL\_STING", the compiler automatically inserts a **12-to-24 frame reaction shot** (e.g., a dilated pupil, camera push, or physical flinch) *before* the dialogue audio stem begins playing. This prevents characters from delivering lines instantaneously after trauma.  
> * **Calculation Hold Dynamics:** When tagged with reaction\_cue: "CALCULATION\_HOLD", the Conductor injects an unvoiced buffer before speech onset, lowering tonePacing to simulate internal cognitive processing before verbal delivery.  
> * **Shot Segmentation:** The compiler uses MRU cues to determine visual cut points: lines with high somatic trauma or reaction cues are split across shot-reverse-shot camera angles, aligning cuts with breath intakes.

### **5\. Prosodic Cadence Filtering & The Acoustic Redaction Battery**

To prevent characters from sliding into homogenized delivery ("The Beige Plague"), the somatic architecture enforces cadence exclusions and tests voice distinctiveness under acoustic redaction:

#### **banned\_cadences Prosodic Exclusions**

The banned\_cadences array prevents neural vocoders from applying inappropriate prosodic rhythm templates:

> * Characters with pulmonary fibrosis or respiratory damage are strictly barred from RAPID\_STACCATO and RISING\_INFLECTION\_INTERROGATIVE.  
> * Entities with severe depressive or trauma conditions are barred from CHEERFUL\_MODULATION and UPBEAT\_LILT.  
> * If an AST generator attempts to tag an injured entity with an excluded rhythm, the compiler rejects the payload prior to synthesis.

#### **The Acoustic Redaction Battery (Tier 3 Redaction)**

To verify that somatic conditioning produces a distinct, recognizable performance, synthesized stems are evaluated through the **Three-Tier Redaction Battery**:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   THE THREE-TIER REDACTION BATTERY                     │`  
`├────────────────────┬───────────────────────────────────────────────────┤`  
`│ Tier 1: Visual     │ Binary alpha silhouette: classify character from  │`  
`│                    │ posture and hunch alone (Entropy H < 0.15)[cite: 16, 24].       │`  
`├────────────────────┼───────────────────────────────────────────────────┤`  
`│ Tier 2: Textual    │ Strip speaker tags: idiolect and sentence length   │`  
`│                    │ must match speaker with >90% confidence[cite: 16, 24].          │`  
`├────────────────────┼───────────────────────────────────────────────────┤`  
`│ Tier 3: Acoustic   │ Pitch-shift and flatten vocal formants: prosody,  │`  
`│                    │ consonant attack, pause frequency, and syllable   │`  
`│                    │ duration must identify speaker in total darkness[cite: 16, 24]. │`  
`└────────────────────┴───────────────────────────────────────────────────┘`

> * The test strips superficial timbral coloring by pitch-shifting and flattening formants.  
> * The underlying speaking rhythm, pause distribution, and syllable metrics must remain identifiable: an auditor must be able to distinguish Bog’s frantic, short-syllable delivery from The Pilot’s labored, pause-heavy drawl even in total acoustic darkness.

### **6\. Physical Clock Quantization & Timeline Gain Automation**

Synthesized dialogue stems do not adapt to visual timelines; rather, the physical stem duration dictates visual frame budgets and sidechain gain envelopes:

`AUDIO DOMAIN (Sample-Accurate Physical Clock: 48,000 samples/sec)`  
`│`  
`├── duration_ms: Measured via ffprobe child process (e.g., 3,120.50 ms)`  
`└── Conformance Gate: Integrated -16.0 LUFS (±1.0), True-Peak ≤ -1.0 dBTP`  
`│`  
`▼ Pure Integer Ceiling Quantization: target_frames = ceil((D_ms / 1000) * 24) = 75 frames`  
`VIDEO DOMAIN (Master Media Clock: 24 frames/sec)`  
`│`  
`├── Track 1: Mounted at absolute frame coordinate (<Sequence from={fromFrame} />)`  
`├── Track 2: Spot Foley cues seeded via Mulberry32 PRNG (hash(scene:shot:sample))`  
`└── Track 3: Continuous Ambient Bed & Score (Programmatic Gain Automation)`

#### **Discrete Integer Ceiling Quantization**

The Conductor spawns an asynchronous ffprobe process to extract exact waveform duration (*D*ms​) from the .wav file header, deriving discrete video frames using ceiling arithmetic:

target\_frames=⌈(1000*D*ms​​)×24⌉\=⌊1000(*D*ms​×24)+999​⌋

> * *Worked Example:* An audio stem measuring 3,120.50 ms yields:  
>   target\_frames=⌈10003120.50​×24⌉\=⌈74.892⌉=75 frames (3,125 ms)  
> * *Tail-Slack Absorption:* The resulting 4.50 ms delta (0.108 frames) represents tail slack, which is absorbed into natural room decay padding, preventing speech from cutting abruptly on visual edits.

#### **Multi-Track Gain Automation & Ducking Envelopes**

Dialogue stems mounted on Track 1 dynamically automate attenuation on Track 3 ambient beds inside AmbientTrack.tsx:

`Track 1: Spoken Dialogue Stems (Fixed Master Clocks via ffprobe)`  
         `[--------- Shot 01 (75f) ---------]          [--------- Shot 02 (90f) ---------]`  
`Track 2: Spot Foley Transients (Mulberry32 PRNG Seeded)`  
                `[*valve_scrape*]                             [*boot_squelch*]`  
`Track 3: Continuous Ambient Sound Bed (Gain Automated)`  
`────┐                                       ┌────────┐                                 ┌────`  
    `│                                       │        │                                 │`  
    `└───────────────────────────────────────┘        └─────────────────────────────────┘`  
      `^ Attack (6f)          Release (12f) ^          ^ Attack (6f)      Release (12f) ^`  
      `Ducking Floor: -14 dB                           Ducking Floor: -14 dB`

> * **Attenuation Depth:** During active dialogue windows, Track 3 ambient sound ducks to **−14 dB**, computed as:  
>   Gainducked​\=1020−14​×*V*base​≈0.1995×*V*base​  
> * **Attack & Release Curves:** The bed dips over an authored 6-frame quadratic attack before speech onset (*A*\=6, ≈250 ms) and recovers over a 12-frame quadratic release (*R*\=12, ≈500 ms) when pauses between words or lines exceed 12 frames.  
> * **Anti-Pumping Multi-Window Reducer:** To prevent volume pumping during short inter-sentence dialogue pauses, gain curves are composed using Math.min() across all active speech windows, maintaining the −14 dB floor across brief breath gaps.  
> * **Physical Signal Standards:** Stems must pass two-pass FFmpeg normalization conforming to integrated **−16.0 LUFS** (±1.0 LUFS) with a True-Peak ceiling of **≤−1.0 dBTP** and an unvoiced noise floor below **−60 dBFS**, ensuring broadcast compliance before visual rendering proceeds.

---

*User prompt: {{FOCUS: 1\. Ingress Contracts & Pre-Flight Feasibility Validation}} /extreme-details*

Response: The **Ingress Contracts & Pre-Flight Feasibility Validation** layer serves as the zero-trust perimeter and fail-fast economic firewall (*T*0​\=\$0.00) for audio-microservice and worker-sower-conductor on the Rig 1 workstation. Under the studio's governing separation of semantic state (Axis A) from physical artifact projection (Axis B), generative models—whether text LLMs, neural speech synthesis vocoders, or diffusion backends—operate strictly as untrusted proposers with zero authority over canonical narrative, spatial, or somatic truth.

Before any network socket is opened to the FastAPI daemon on port 8000, any CPU audio thread is allocated, or any downstream GPU diffusion pass is scheduled on Rig 2, inbound scene requests must pass a sequential barrage of structural schemas, somatic resource checks, kinetic verb filters, verbatim parity linters, and epistemic leak gates.

### **1\. The Economic QA Mandate & Commitment Cliffs (*T*0​→*T*5​)**

The architecture enforces validation as early as mathematically possible because the cost of repairing a physical, narrative, or continuity defect does not scale on a smooth linear curve. Instead, it compounds exponentially across discrete, irreversible commitment thresholds:

Cost(*t*)=*i*\=0∑5​Δ*Ci*​⋅1{*t*≥*Ti*​}​  
Cost (\$) ▲  
         │                                                         \[T\_5: Broadcast / Delivery\]  
         │                                                         \$1,000s — Catastrophic Refusal  
         │                                                    ┌────  
         │                                \[T\_4: Human Conform\]│  
         │                                Hours of Manual Fix   
         │                           ┌────  
         │       \[T\_3: Cloud GPU\]    │  
         │       \$0.05 – \$5.00 / shot│  
         │  ┌────  
         │  │ \[T\_1/T\_2: Audio / Pre-Viz\]  
         │  │ Pennies (CPU Cycles / Stems)  
   ──────┴──┴──────────────────────────────────────────────────────► Pipeline Stage (t)  
    \[T\_0: Pre-Flight Ingress & Feasibility Gate\]  
    \$0.0000 / \< 2 ms (In-Memory Node.js TypeScript)

> * ***T*****0​ In-Memory Gate (\<\$0.0001,\<2 ms):** In-memory Node.js/TypeScript AST parsing, TypeBox/Zod structural validation, and somatic capability checks. Catching an impossible action (e.g., an actor with a severed arm attempting a two-handed task) costs exactly **\$0.00**.  
> * ***T*****1​ Acoustic Synthesis Gate (\$0.0005 to \$0.002):** Local CPU inference on Rig 1 via audio-microservice.  
> * ***T*****2​ Spatial & Optical Pre-Viz (\$0.005 to \$0.02):** Headless software OpenGL Remotion layout evaluation (--gl=swangle).  
> * ***T*****3​ Heavy Foundry Tensor Diffusion (\$0.05 to \$5.00 per shot):** Rig 2 ComfyUI rendering passes executing 24 GB VRAM Wan 2.2 diffusion.  
> * ***T*****4​ Human Editorial Conformance:** Multi-hour manual artist repair in NLE timelines.  
> * ***T*****5​ Broadcast Delivery:** Catastrophic multi-thousand-dollar network delivery failure or permanent narrative canon corruption.

The pre-flight gate guarantees that no unvalidated assumption escapes into the execution environment to burn billable compute or GPU cycles.

### **2\. Structural Ingress Contract & The TypeBox/Zod Firewall**

All tasks and scene drafts originate as version-controlled, machine-readable contracts. Before the Conductor (src/pipeline/produceEpisode.ts) dispatches dialogue to audio-microservice, it parses the machine intermediate representation (dialogue\_ast.json) emitted upstream by worker-sower-engine.

               worker-sower-engine (Edge DO / LLM Drafter)  
                                  │  
                                  ▼ Emits dialogue\_ast.json  
┌────────────────────────────────────────────────────────────────────────┐  
│ RIG 1 INGRESS STRUCTURAL FIREWALL (worker-sower-conductor)             │  
├────────────────────────────────────────────────────────────────────────┤  
│ 1\. Schema Validation: Strict Zod parsing (.strict(), no extra keys)    │  
│ 2\. Zero-Byte Poison Sentinel: Binary hash \!= e3b0c442... (\> 1,024 B)   │  
│ 3\. Semantic Bounds: Scalar clamping (0.0 \<= s \<= 1.0)                  │  
│ 4\. Closed Discriminated Unions: Reaction cues & pacing ranges          │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Structurally Validated AST  
                                   ▼

#### **Runtime Contract Schema (src/types/narrative.ts)**

The schema layer acts as an edge-level structural firewall: all inbound payloads must be validated prior to touching application state, database adapters, or child processes. Following the additionalProperties: false / .strict() paradigm, any extra properties hallucinated by an upstream language model trigger an immediate validation termination, rejecting the request with an HTTP 400 Bad Request before execution logic is entered:

import { z } from "zod";

export const ReactionCueSchema \= z.enum(\[  
  "NONE",  
  "VISCERAL\_STING",  
  "CALCULATION\_HOLD"  
\]);

export const DSPModifiersSchema \= z.object({  
  basePitchShiftSemitones: z.number().min(-12.0).max(12.0).optional(),  
  formantWarpingFactor: z.number().min(0.5).max(2.0).optional(),  
  breathinessPauseMultiplier: z.number().min(1.0).max(3.5).optional(),  
  vocalFryDensity: z.number().min(0.0).max(1.0).optional(),  
  pause\_frequency\_multiplier: z.number().min(0.1).max(3.0).optional()  
}).strict(); // additionalProperties: false enforced

export const DialogueLineSchema \= z.object({  
  line\_id: z.string().regex(/^LINE-\[0-9\]{3,}\$/),  
  speaker: z.string().min(1).regex(/^\[a-zA-Z0-9\_.-\]+\$/),  
  dialogue\_text: z.string().min(1),  
  subtext: z.string().optional(),  
  conditions: z.array(z.string()).default(\[\]),  
  emotion: z.string().min(1),  
  tonePacing: z.number().min(0.1).max(3.0).default(1.0),  
  motor\_actions: z.array(z.string().regex(/^\[A-Z\_\]+\$/)).default(\[\]),  
  reaction\_cue: ReactionCueSchema.default("NONE"),  
  pacing\_scalar: z.number().min(0.1).max(3.0).default(1.0),  
  dsp\_modifiers: DSPModifiersSchema.optional(),  
  foley\_cues: z.array(z.string()).optional()  
}).strict();

export const SceneASTSchema \= z.object({  
  sceneId: z.string().min(1),  
  episodeId: z.string().min(1),  
  contract\_version: z.enum(\["v1.0.0", "v2.1.0"\]),  
  base\_commit\_sha: z.string().length(40),  
  lines: z.array(DialogueLineSchema).min(1)  
}).strict();

export type DialogueLine \= z.infer\<typeof DialogueLineSchema\>;  
export type SceneAST \= z.infer\<typeof SceneASTSchema\>;

#### **Zero-Byte Poison Sentinel & Disk Parity Sweeps**

> * **The Empty-Hash Guard:** The ingress linter computes the SHA-256 binary digest of the input contract and any staged assets, asserting that no input matches the zero-byte constant:  
>   EMPTY\_FILE\_HASH=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>   If any input file matches this hash or falls below 1,024 bytes, compilation halts with EMPTY\_FILE\_DETECTED, preventing truncated writes or dropped buffers from poisoning the pipeline.  
> * **Disk Parity Sweep (\!MissingAssets):** Parses all asset paths referenced in the AST against local workspace files in public/assets/. If a referenced background matte, reference voice .wav, or character profile is absent, execution halts before triggering synthesis.

### **3\. Somatic Capability Checking & Limb Resource Arithmetic**

Rather than relying on non-deterministic generative prompts, the Conductor extracts the character's biological condition from the state ledger using getCharacterSomaticMask(state, characterId) and executes an upfront capability satisfiability check.

┌────────────────────────────────────────────────────────────────────────┐  
│ PRE-FLIGHT CAPABILITY SAT SOLVER (T\_0 \= \$0.00)                         │  
├────────────────────────────────────────────────────────────────────────┤  
│ Ingest Somatic Vector:                                                 │  
│ • Net Functional Arms: ArmsAvailable \= TotalArms \- ImpairmentPenalty   │  
│ • Mobility Ranking:    MobilityRank(Entity)                            │  
│                                                                        │  
│ Ingest Logistical Vector & AST Proposed Action:                        │  
│ • Sum Occupied Hands:  ArmsRequired \= ∑ slot.occupies\_hands            │  
│ • Proposed Kinetic:    motor\_actions: \["BIMANUAL\_LEVER\_PULL"\]          │  
├────────────────────────────────────────────────────────────────────────┤  
│ EVALUATION FORMULA:                                                    │  
│ 1\. ArmsRequired \<= ArmsAvailable                                       │  
│ 2\. MobilityRank(Action) \<= MobilityRank(Entity)                        │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │  
                    ┌──────────────┴──────────────┐  
                    ▼ SATISFIABLE                 ▼ CONTRADICTION (UNSAT)  
          \[ STAGE ATOMIC WRITE \]        \[ FATAL BUILD INTERCEPTION \]  
          • Emits validated AST         • Halts execution at \$0.00  
          • Advances to audio synthesis • Emits diagnostic coordinate

#### **Upper-Limb Capacity Arithmetic**

Upper-limb capacity is modeled as a physical conservation inequality:

ArmsRequired(EquipState)≤ArmsAvailable(Entity)  
ArmsAvailable=TotalArms−ImpairmentPenalty

> * *Worked Example:* In *Wiregrass Basin*, The Pilot (char\_020\_the\_pilot) has an active condition of BRACHIAL\_PLEXUS\_RIGHT with severity 1.0. His functional upper-limb capacity drops immediately:  
>   ArmsAvailable=2.0−1.0=1.0  
> * If a proposed beat has The Pilot holding a brass\_siphon\_nozzle (occupies\_hands: 1\) and a flashlight (occupies\_hands: 1), or attempts a two-handed action (BIMANUAL\_LEVER\_PULL, occupies\_hands: 2), the solver evaluates:  
>   ArmsRequired=2≤1.0⟹FALSE  
>   The linter aborts compilation immediately with HAND\_CAPACITY\_BREACH, preventing the LLM or animation engine from attempting to render an anatomically impossible physical performance.

#### **Keeping Claims Honest: Arithmetic vs. General SAT**

Checking whether ArmsRequired≤ArmsAvailable is an integer resource comparison rather than a full combinatorial NP-complete SAT solver. For single-shot tracer-bullet tasks, simple arithmetic checks suffice. The pipeline labels these pre-flight checks as bounded invariant arithmetic rather than general SAT solving to avoid overclaiming system properties.

### **4\. Kinetic & Acoustic Boundary Enforcement**

To protect character consistency and physical plausibility, the pre-flight gate combines deterministic set operations with semantic exclusion lists.

               PROPOSED DIALOGUE AST NODE  
                            │  
       ┌────────────────────┴────────────────────┐  
       ▼                                         ▼  
\[ motor\_actions Array \]                 \[ dialogue\_text String \]  
       │                                         │  
       ▼ Set-Intersection Check                  ▼ Vocal-Motor Feasibility Check  
motor\_actions ∩ banned\_verbs \== ∅        assert(has\_verbal \=\> "mute" ∉ conditions)  
       │                                         │  
       ├─────────────────┬───────────────────────┤  
       ▼ FAILED          ▼ PASSED                ▼ FAILED  
 \[ FATAL HALT: T\_0 \]   \[ CHECK CADENCE \]   \[ FATAL HALT: T\_0 \]  
 Banned verb leaked    bannedCadences filter VOCAL\_DELIVERY\_BREACH

#### **Set-Intersection Action Gating**

Every character profile compiles a deterministic negative motor mask from their locomotion baseline. Selecting heavy\_grounded\_slog or neuropathy\_shuffle populates banned\_kinetic\_verbs with tokens such as \["sprint", "vault", "leap", "lunge", "dive"\]. The linter performs an efficient set intersection:

motor\_actions∩banned\_kinetic\_verbs=∅

If a scene drafts an injured character sprinting or leaping across a culvert, the non-empty intersection triggers a fatal build halt at *T*0​.

#### **The Dual-Field Decomposition & The Negation Trap**

Relying solely on string searches across screenplay prose introduces the **negation trap**: a line stating *"The Pilot failed to sprint across the ditch"* contains the word *"sprint"*, yet describes the absence of the action.

The pipeline resolves this by decomposing drafting into a dual-field contract:

> 1. **Machine Rail:** The generator emits an explicit, structured array of discrete motor enums (motor\_actions: \["LIMP", "DRAG\_DRUM"\]).  
> 2. **Prose Rail:** The generator emits natural human-readable screenplay prose.  
> 3. **Cross-Field Discrepancy Verification:** The set-intersection check operates on the structured enum array. An independent negation-aware parsing pass inspects the prose to verify that the structured array faithfully reflects the text, rejecting mismatches where the model emits \["LIMP"\] in the machine rail while the prose describes running.

#### **Vocal-Motor Feasibility & Cadence Exclusions**

Before audio synthesis is initialized, an explicit logical implication is evaluated:

*c*.has\_verbal\_directives⟹"mute"∈/*c*.conditions∧"speak"∈/*c*.banned\_kinetic\_verbs

> * If an entity suffering from crushed laryngeal cartilage or a severed trachea has dialogue lines assigned, the compiler raises a fatal VOCAL\_DELIVERY\_BREACH.  
> * **banned\_cadences Prosodic Exclusions:** The character’s active recipe contains an exclusion list (e.g., \["RAPID\_STACCATO", "RISING\_INFLECTION\_INTERROGATIVE"\] for pulmonary damage). Any directive attempting to apply an energetic cadence to a character with compromised lungs is rejected before touching the vocoder.

### **5\. Verbatim Script Parity & Epistemic Third Rails**

Downstream speech synthesis engines and video compositors are strictly forbidden from altering dialogue or hallucinating missing lines.

┌────────────────────────────────────────────────────────────────────────┐  
│ DUAL-ARTIFACT VERBATIM PARITY LINTER (assertVerbatimParity)            │  
├────────────────────────────────────────────────────────────────────────┤  
│ HUMAN SCRIPT (.fountain): "The relay is dead. We move now."            │  
│ AST DIALOGUE (dialogue\_ast.json): "The relay is dead. We move now."    │  
│                                                                        │  
│ PARITY RULE: Normalized(Fountain.text) \=== Normalized(AST.text)        │  
│ Divergence: Character-for-character mismatch halts audio synthesis.    │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Pass  
                                   ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ EPISTEMIC FIREWALL & THIRD-RAIL AUDIT (Ignorance by Omission)          │  
├────────────────────────────────────────────────────────────────────────┤  
│ Check known\_secrets vs. dialogue tokens:                               │  
│ • Asserts character does not speak facts outside their horizon         │  
│ • Attenuation negative fences ban leakage of third-rail terms          │  
│ • Leak detected ──► Immediate fatal halt before audio rendering        │  
└────────────────────────────────────────────────────────────────────────┘

> * **Verbatim Parity Enforcement:** The pipeline maintains a dual-artifact pattern: a human-readable screenplay (.fountain) and a machine-executable shot AST (dialogue\_ast.json). An automated linter strips external whitespace and asserts exact character-for-character parity. If a human editor modifies the screenplay prose without re-compiling the AST, the mismatch blocks audio synthesis immediately, preventing audio-visual desynchronization.  
> * **Epistemic Firewall (Ignorance by Omission):** Fictional characters are bounded by their epistemic\_vector in the state ledger. If a character's profile does not include a specific secret (e.g., secret\_004\_solvent\_taint), an automated lexical scan verifies that the dialogue does not mention banned third-rail tokens. Epistemic leaks abort the build at *T*0​, ensuring characters never act on out-of-world knowledge.

### **6\. The Three-Class Error Taxonomy & Escalation Routing**

When a defect is intercepted by the pre-flight gate, the system does not enter an unconstrained retry loop. Errors are routed into a deterministic three-domain taxonomy:

                               INVARIANT CHECK EVENT  
                                         │  
         ┌───────────────────────────────┼───────────────────────────────┐  
         ▼                               ▼                               ▼  
┌───────────────────┐           ┌───────────────────┐           ┌───────────────────┐  
│   DETERMINISTIC   │           │ STOCHASTIC QUALITY│           │  INFRASTRUCTURE   │  
│   (Fatal Halt)    │           │  (Bounded Retry)  │           │(Idempotent Resume)│  
├───────────────────┤           ├───────────────────┤           ├───────────────────┤  
│ • Capability UNSAT│           │ • Voice bleed     │           │ • File lock busy  │  
│ • Banned verb leak│           │ • Flat subtext    │           │ • EPIPE on socket │  
│ • Out-of-bound num│           │ • Pacing drag     │           │ • Transient disk  │  
│ • Parity breach   │           │ • Prosodic lilt   │           │   write failure   │  
└───────────────────┘           └───────────────────┘           └───────────────────┘  
         │                               │                               │  
         ▼                               ▼                               ▼  
  Halt immediately at             Allow max 2 retries             Resume from last  
  T\_0 (\$0.00 compute).            with feedback; escalate         valid content-  
  Block file creation.            to human if stalled.            addressed buffer.

#### **Error Classification & Handling Rules**

> 1. **Deterministic Failures (Fatal Build Interception):**  
   * *Triggers:* Somatic capability contradictions (ArmsRequired\>ArmsAvailable), banned kinetic verb leaks, out-of-bounds scalar values, unratified schema versions, or screenplay-to-AST parity breaches.  
   * *Resolution:* The build halts immediately at *T*0​ (\$0.00 compute cost) with exit code 1\. No retries are attempted because identical inputs to deterministic checks will produce identical failures. A structured diagnostic dossier is emitted containing the task ID, failing constraint, and entity state coordinate.  
> 2. **Stochastic Quality Failures (Bounded Retry Loop):**  
   * *Triggers:* Flawed dramatic pacing, vocal bleed, flat subtext, or subtle prosodic drift during text generation.  
   * *Resolution:* A strictly bounded retry loop allows up to **two retries** (*N*max​\=2). The specific defect is fed back as an explicit negative prompt constraint. If the failure persists across three cycles, a circuit breaker trips, freezing the branch and escalating a diagnostic ticket to the Showrunner or Scene Architect.  
> 3. **Infrastructure Failures (Idempotent Resume):**  
   * *Triggers:* Transient network timeouts, socket EPIPE disconnects, temporary SQLite/D1 lock contention, or scratch disk write stalls.  
   * *Resolution:* The execution runtime catches the transport error and resumes processing idempotently from the last verified, content-addressed buffer without discarding valid upstream work.

### **7\. Concrete Executable Pre-Flight Linter Implementation**

The pre-flight gate is codified as an executable linter module run before dispatching tasks to audio-microservice:

// packages/worker-sower-conductor/src/services/preFlightLinter.ts  
import { SceneAST, SceneASTSchema } from "../types/narrative";

export interface SomaticLedgerState {  
  characterId: string;  
  totalArms: number;  
  impairmentPenalty: number;  
  conditions: string\[\];  
  bannedKineticVerbs: string\[\];  
  heldItemsOccupiesHands: number;  
}

export interface PreFlightLintResult {  
  valid: boolean;  
  errors: Array\<{  
    code: "SCHEMA\_ERROR" | "SOMATIC\_CAPACITY\_UNSAT" | "BANNED\_VERB\_BREACH" | "VOCAL\_DELIVERY\_BREACH";  
    message: string;  
    lineId?: string;  
  }\>;  
}

export class PreFlightFeasibilityLinter {  
  static validateScene(  
    rawPayload: unknown,  
    somaticLedger: Map\<string, SomaticLedgerState\>  
  ): PreFlightLintResult {  
    const errors: PreFlightLintResult\["errors"\] \= \[\];

    // 1\. Strict Schema Structural Firewall  
    const parseResult \= SceneASTSchema.safeParse(rawPayload);  
    if (\!parseResult.success) {  
      return {  
        valid: false,  
        errors: parseResult.error.errors.map(e \=\> ({  
          code: "SCHEMA\_ERROR",  
          message: \`\${e.path.join(".")}: \${e.message}\`  
        }))  
      };  
    }

    const scene: SceneAST \= parseResult.data;

    // 2\. Pre-Flight Semantic & Somatic Checks across Lines  
    for (const line of scene.lines) {  
      const somatic \= somaticLedger.get(line.speaker);  
      if (\!somatic) {  
        errors.push({  
          code: "SCHEMA\_ERROR",  
          message: \`Speaker '\${line.speaker}' has no valid record in canonical somatic ledger.\`,  
          lineId: line.line\_id  
        });  
        continue;  
      }

      // Check A: Upper-Limb Capacity Arithmetic  
      const armsAvailable \= somatic.totalArms \- somatic.impairmentPenalty;  
      if (somatic.heldItemsOccupiesHands \> armsAvailable) {  
        errors.push({  
          code: "SOMATIC\_CAPACITY\_UNSAT",  
          message: \`Somatic contradiction: \${somatic.heldItemsOccupiesHands} hands occupied but only \${armsAvailable} available.\`,  
          lineId: line.line\_id  
        });  
      }

      // Check B: Vocal-Motor Speech Feasibility Implication  
      const isMute \= somatic.conditions.includes("MUTE") || somatic.conditions.includes("TRACHEA\_SEVERED");  
      const cannotSpeak \= somatic.bannedKineticVerbs.includes("SPEAK");  
      if (line.dialogue\_text.trim().length \> 0 && (isMute || cannotSpeak)) {  
        errors.push({  
          code: "VOCAL\_DELIVERY\_BREACH",  
          message: \`Physical feasibility breach: Character '\${line.speaker}' has verbal dialogue but is medically mute.\`,  
          lineId: line.line\_id  
        });  
      }

      // Check C: Banned Kinetic Verb Set-Intersection  
      const leakedBannedVerbs \= line.motor\_actions.filter(action \=\>  
        somatic.bannedKineticVerbs.includes(action)  
      );  
      if (leakedBannedVerbs.length \> 0\) {  
        errors.push({  
          code: "BANNED\_VERB\_BREACH",  
          message: \`Banned kinetic verb leak detected: \[\${leakedBannedVerbs.join(", ")}\]\`,  
          lineId: line.line\_id  
        });  
      }  
    }

    return {  
      valid: errors.length \=== 0,  
      errors  
    };  
  }  
}

By validating incoming payloads through strict schema parsing, somatic inequality checks, and set-intersection verb filters before network dispatch, audio-microservice guarantees that invalid states are terminated at *T*0​\=\$0.00, preserving hardware stability and bounding compute spend across the studio fleet.

---

*User prompt: {{FOCUS: 2\. The Somatic-to-Acoustic Translation Matrix}} /extreme-details*

### **Response: 1\. Ingress Architecture & The Somatic Boundary**

The Somatic-to-Acoustic Translation Matrix converts physical trauma, biological damage, and somatic strain stored in the authoritative relational ledger into deterministic digital signal processing (DSP) parameters and neural speech synthesis directives. Under the governing separation of semantic truth (Axis A) from artifact representation (Axis B), generative models—including large language models, neural text-to-speech engines, and video diffusion models—are untrusted, headless workers that lack authority to invent character behavior or bypass physical reality.

AXIS A: SEMANTIC TRUTH (Relational Ledger / Cloudflare D1)  
  │  
  ├─ SomaticVector: Anatomical conditions, severities \[0.0, 1.0\], motorBlacklist  
  └─ getCharacterSomaticMask(state, characterId)  
  │  
  ▼  
RIG 1: CONDUCTOR PRE-FLIGHT COMPILER (worker-sower-conductor)  
  │  
  ├─ Verbatim Parity Linter: assertVerbatimParity(fountainProse, ast)  
  ├─ Vocal-Motor Feasibility: c.has\_verbal \=\> "mute" ∉ conditions ∧ "speak" ∉ banned\_verbs  
  └─ SOMATIC-TO-ACOUSTIC TRANSLATION MATRIX: Resolves AcousticDSPProfile  
  │  
  ▼ HTTP POST http://127.0.0.1:8000/generate  
AXIS B: ACOUSTIC DAEMON & TIMEBASE CLOCK (audio-microservice)  
  │  
  ├─ Synthesis Engine: CosyVoice / Parler-TTS / Piper (Pure CPU / System RAM)  
  ├─ Acoustic Container: Uncompressed 48 kHz / 24-bit PCM .wav  
  ├─ Temporal Inspection: ffprobe extracts duration\_ms  
  └─ Discrete Projection: target\_frames \= ceil((duration\_ms / 1000\) \* 24\)

> * **Semantic Primacy:** Upstream narrative states determine physical capability. If an entity incurs damage, that impairment is recorded as an active condition inside their SomaticVector.  
> * **Pre-Flight Interception (*T*0​\=\$0.00):** Inbound screenplay lines and actions are checked before dispatching network sockets or allocating memory. Validating feasibility upfront catches anatomical contradictions without spending GPU cycles or generating corrupt media.  
> * **Verbatim Parity Enforcement:** Before synthesizing audio, the Conductor runs assertVerbatimParity(fountainProse, ast) to confirm that every character in the .fountain prose matches the AST dialogue\_text string. If an author edits dialogue in the script without updating the machine AST, the compiler halts before audio synthesis begins.  
> * **Network Dispatch:** Validated dialogue text, speaker identifiers, and mapped DSP modifiers are dispatched over HTTP POST to \[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate) on Rig 1\.

### **2\. Typological Contract: Schema & Interface Specifications**

The somatic vector and its corresponding acoustic profile are codified through strict Zod schemas, enforcing typed constraints on biological and vocal boundaries:

// src/schemas/somaticVector.ts  
import { z } from 'zod';

export const LocomotionBaselineSchema \= z.enum(\[  
  'HEAVY\_GROUNDED\_SLOG',       // Low-velocity, high-inertia dragging gait  
  'NEUROPATHY\_SHUFFLE',        // Unsteady footing, zero toe-lift, wide stance  
  'RIGID\_CARAPACE\_STRIDE',     // Upright, mechanical, zero spinal rotation  
  'FLUID\_ASYMETRIC\_LIMP',      // Favors one side, reduced single-leg load  
  'STANDARD\_UNRESTRICTED'      // Peak athletic mobility (rarely assigned)  
\]);

export const ActiveConditionSchema \= z.object({  
  condition\_id: z.string(),  
  name: z.string(),  
  severity: z.number().min(0.0).max(1.0), // 0.0 \= Trace; 1.0 \= Total loss of function  
  anatomical\_locus: z.enum(\[  
    'CRANIAL', 'CERVICAL\_SPINE', 'LUMBAR\_L4\_L5', 'BRACHIAL\_PLEXUS\_RIGHT',  
    'RADIAL\_NERVE\_LEFT', 'FEMORAL\_RIGHT', 'PULMONARY\_SYSTEM'  
  \]),  
  mechanical\_consequence: z.string(),  
  is\_permanent: z.boolean(),  
  acquired\_at\_scene\_id: z.string()  
});

export const AcousticDSPProfileSchema \= z.object({  
  base\_pitch\_shift\_semitones: z.number().min(-12.0).max(12.0),  
  formant\_warping\_factor: z.number().min(0.5).max(2.0),  
  breathiness\_pause\_multiplier: z.number().min(1.0).max(3.5),  
  vocal\_fry\_density: z.number().min(0.0).max(1.0),  
  banned\_cadences: z.array(z.string()) // e.g., \["RAPID\_STACCATO", "RISING\_INFLECTION"\]  
});

export const SomaticVectorSchema \= z.object({  
  entity\_id: z.string(),  
  locomotion\_baseline: LocomotionBaselineSchema,  
  banned\_kinetic\_verbs: z.array(z.string()),  
  active\_conditions: z.array(ActiveConditionSchema),  
  acoustic\_dsp: AcousticDSPProfileSchema,  
  last\_mutated\_at\_hash: z.string()  
});

export type SomaticVector \= z.infer\<typeof SomaticVectorSchema\>;

#### **Core Invariant Parameters of AcousticDSPProfile**

| Parameter Field | Permitted Range | Invariant Function & Acoustic Manifestation |
| :---- | :---- | :---- |
| base\_pitch\_shift\_semitones | −12.0 to 12.0 | Transposes the fundamental frequency (*F*0​) up or down without altering baseline playback speed. |
| formant\_warping\_factor | 0.5 to 2.0 | Scales spectral formants independently of pitch; values \<1.0 compress the apparent pharyngeal volume. |
| breathiness\_pause\_multiplier | 1.0 to 3.5 | Reflects pulmonary trauma by capping phrase length and injecting unvoiced aspiration intervals. |
| vocal\_fry\_density | 0.0 to 1.0 | Injects subharmonic glottal flutter and aperiodic creak into decaying phrase tails. |
| banned\_cadences | Readonly string array | Excludes incompatible prosodic rhythms (such as RAPID\_STACCATO or RISING\_INFLECTION). |

### **3\. The Somatic-to-Acoustic Translation Matrix**

When an entity incurs trauma within the simulation, the biological condition maps directly to acoustic digital signal processing parameters:

LEDGER SOMATIC DAMAGE ──► ACOUSTIC DSP TRANSLATION MATRIX  
┌──────────────────────────────────────┬────────────────────────────────────────┐  
│ Biological Condition / Trauma Vector │ Injected DSP Parameters                │  
├──────────────────────────────────────┼────────────────────────────────────────┤  
│ Stage-1 Pulmonary Fibrosis / Gas     │ breathinessPauseMultiplier: 2.2        │  
│ Inhalation Damage                    │ pause\_frequency\_multiplier: 1.4        │  
│                                      │ Injects micro-silences; forces phrases │  
│                                      │ to end prematurely on hard consonants  │  
├──────────────────────────────────────┼────────────────────────────────────────┤  
│ Severe Hypothermia / Shock           │ basePitchShiftSemitones: \+2.5          │  
│                                      │ vocalFryDensity: 0.8                   │  
│                                      │ High-frequency vocal flutter           │  
├──────────────────────────────────────┼────────────────────────────────────────┤  
│ Crushed Laryngeal Cartilage          │ formantWarpingFactor: 0.7              │  
│                                      │ basePitchShiftSemitones: \-4.0          │  
│                                      │ Severe formant scooping                │  
└──────────────────────────────────────┴────────────────────────────────────────┘

### **4\. Biological Condition Mechanics & DSP Impact**

#### **Pulmonary Fibrosis & Gas Inhalation Damage**

> * **Acoustic Parameters:** breathinessPauseMultiplier: 2.2, pause\_frequency\_multiplier: 1.4.  
> * **Physiological Origin:** Inhalation of industrial defoliants, toxic smoke, chemical solvents, or deep pulmonary fibrosis (e.g., Octavius Oddwadd / char\_008).  
> * **Waveform Manifestation:** Lung damage restricts continuous airflow, setting a hard ceiling on spoken phrase duration. The vocoder injects micro-silence intervals and forces clauses to terminate abruptly on unvoiced plosives or hard consonants. Long, sweeping sentences are broken into segmented, breathless bursts.  
> * **Temporal Impact:** By inserting unvoiced pauses, pulmonary trauma expands the physical duration (*D*ms​) of dialogue stems, expanding downstream video frame budgets on the Remotion timeline.

#### **Severe Hypothermia & Physiological Shock**

> * **Acoustic Parameters:** basePitchShiftSemitones: \+2.5, vocalFryDensity: 0.8.  
> * **Physiological Origin:** Acute neurogenic shock, freezing submersion, autonomic panic, or extreme physiological shivering.  
> * **Waveform Manifestation:** Severe muscular tension and autonomic hyperarousal elevate the fundamental pitch by \+2.5 semitones. The elevated vocal fry density (0.8) injects rapid glottal instability and high-frequency flutter into vowel sustains, capturing the sound of shivering vocal cords and irregular subglottal pressure.

#### **Crushed Laryngeal Cartilage & Blunt Neck Trauma**

> * **Acoustic Parameters:** formantWarpingFactor: 0.7, basePitchShiftSemitones: \-4.0.  
> * **Physiological Origin:** Fractured thyroid or cricoid cartilage, strangulation trauma, or compressive neck injury.  
> * **Waveform Manifestation:** Structural collapse of the larynx constricts the pharyngeal resonating chamber. Dropping fundamental pitch by −4.0 semitones while compressing formants down to 0.7 produces severe acoustic formant scooping, resonant tract constriction, and dark pharyngeal damping. High-frequency overtones are attenuated, leaving a hollow, guttural, and muffled vocal delivery.

#### **Lumbar Compression & Neuropathy**

> * **Acoustic Parameters:** speed\_multiplier: 0.90, basePitchShiftSemitones: \-1.5, pause\_frequency\_multiplier: 1.4.  
> * **Physiological Origin:** L4–L5 lumbar vertebral compression (severity 0.85), spinal nerve impingement, or peripheral neuropathy requiring a NEUROPATHY\_SHUFFLE or HEAVY\_GROUNDED\_SLOG gait.  
> * **Waveform Manifestation:** Chronic lower back impingement and diaphragmatic fatigue slow conversational tempo down to 0.90×, lower pitch by −1.5 semitones, and dilate clause pauses by 40%. The delivery conveys physical heaviness, dragging syllables out as the entity braces against spinal pain.

#### **Psychological Conditions: Humiliation & Submissive Collapse**

> * **Acoustic Parameters:** speed\_modifier: 0.85, dsp\_gain\_db: \-2.0, trailing ellipses injection.  
> * **Source Taxonomy:** world/conditions.md operates as the single-source taxonomy mapping emotional and tactical conditions directly to audio DSP parameters and syntactic prompt constraints.  
> * **Waveform Manifestation:** When a character acquires the humiliated condition (e.g., Spleen in Beat 2, Phase C), dialogue generation attenuates the output gain by −2.0 dB, slows speaking rate to 0.85×, and inserts ellipses. This forces the synthesized voice into hesitant, unfinished lines that decay into silence.

### **5\. Pre-Flight Feasibility & Kinetic Gating**

Before audio generation is dispatched to Rig 1, pre-flight validators verify physical and anatomical feasibility, protecting against impossible actions:

               PROPOSED SCENE AST LINE  
                          │  
         ┌────────────────┴────────────────┐  
         ▼                                 ▼  
\[ VOCAL-MOTOR HEARSAY CHECK \]     \[ BANNED KINETIC VERBS CHECK \]  
assert(has\_verbal \=\>              motor\_actions ∩ banned\_verbs \== ∅  
  "mute" ∉ conditions ∧           (e.g., Octavius Oddwadd cannot  
  "speak" ∉ banned\_verbs)         \["sprint", "vault", "rapid\_stairs"\])  
         │                                 │  
         ├────────────────┬────────────────┤  
         ▼ FAILED         ▼ PASSED         ▼ FAILED  
  VOCAL\_DELIVERY\_BREACH  Passed to Port 8000  KINETIC\_INVARIANT\_BREACH  
  (Halts build at \$0.00)                      (Halts build at \$0.00)

#### **The Vocal-Motor Hearsay Feasibility Theorem**

The compiler evaluates an explicit conditional check prior to speech synthesis:

*c*.has\_verbal\_directives⟹"mute"∈/*c*.conditions∧"speak"∈/*c*.banned\_kinetic\_verbs

> * **Failure Handling:** If an entity's condition mask contains mute, crushed\_larynx, bilateral\_tympanic\_rupture, or has speak or whisper blacklisted, any attempt to assign dialogue triggers a VOCAL\_DELIVERY\_BREACH. Compilation halts immediately, preventing invalid audio synthesis.  
> * **Hearsay Drift Verification:** When an actor with auditory sensory impairment (e.g., partial deafness, concussive trauma, or tinnitus) is assigned a RUMOR\_ONLY epistemic status, the audit asserts that their reported beliefs reflect misheard speech rather than clean transcripts.

#### **Banned Kinetic Verb Masking & Feature Roll-Up**

Biological conditions compile down into a negative motor mask (banned\_kinetic\_verbs):

> * **Feature Roll-Up:** To prevent authoring dozens of individual verb prohibitions manually, conditions inherit entire semantic verb families. An entity assigned lumbar\_pinch or neuropathy inherits the parent category LOCOMOTION\_RAPID, which automatically blacklists \["sprint", "vault", "rapid\_stairs", "dive", "carry\_heavy"\].  
> * **Resource Constraint:** If Octavius Oddwadd's action AST proposes OCTAVIUS\_VAULTS\_RAILING, the invariant engine rejects the transaction at *T*0​ via set intersection. This validation runs on CPU memory before reaching the GPU foundry.

### **6\. Master Clock Quantization & Timeline Integration**

In this pipeline, audio dictates visual pacing: the duration of synthesized dialogue stems governs visual cut points, while sound effects and ambient beds adapt around speech:

AUDIO DOMAIN (Continuous Timebase Clock: 48,000 samples/sec)  
│  
├── Synthesized Stem: 48 kHz / 24-bit PCM WAV (Port 8000\)  
├── ffprobe Inspection: duration\_ms \= 3,120.50 ms  
└── Passes Gate: Integrated \-16.0 LUFS (±1.0), True-Peak ≤ \-1.0 dBTP  
│  
▼ Integer Ceiling Projection: S \= Frame \* 2,000 samples | target\_frames \= ceil(3.1205 \* 24\) \= 75 frames  
VIDEO DOMAIN (Master Video Clock: 24 integer frames/sec)  
│  
├── Track 1: Mounted at absolute frame coordinates (\<Sequence from={fromFrame} /\>)  
├── Track 2: Spot Foley cues snapped to hold-frames (Mulberry32 PRNG seeded)  
└── Track 3: Continuous Ambient Bed & Music (Programmatic Sidechain Ducking)

#### **The Dual-Domain Multi-Resolution Clock Formulation**

> * **Continuous Audio Timebase (48 kHz):** Operates at 48,000 integer samples per second, capturing transient spikes, phoneme boundaries, and ducking envelopes with sample-accurate alignment.  
> * **Discrete Video Clock (24 fps):** Operates on discrete integer frames, where each frame represents Δ*t*frame​\=241​ s≈41.6667 ms.  
> * **The Projection Ratio:** The mathematical bridge between both domains is an integer ratio:  
>   24 frames/sec48,000 samples/sec​\=2,000 audio samples per video frame  
> * **Sample-to-Frame Mapping:** The sample coordinate *S* corresponding to video frame *F* evaluates to *S*\=*F*×2,000. If a transient plosive occurs at sample 26,742, it maps to video frame ⌊26,742/2,000⌋=Frame 13, while internal audio maintains sample precision to prevent phase cancellation or perceptual lip-sync lag.

#### **Discrete Ceiling Quantization & Tail-Slack Absorption**

The physical duration (*D*ms​) measured via an asynchronous ffprobe child process is quantized to 24 fps video frames using an integer ceiling function to guarantee video never underruns audio:

target\_frames=⌈(1000*D*ms​​)×24⌉

> * *Worked Example:* A speech stem measuring 3,120.50 ms at 24 fps yields ⌈(3120.50/1000)×24⌉=⌈74.892⌉=75 frames (3,125.00 ms).  
> * *Tail-Slack Absorption:* The resulting 4.50 ms delta (0.108 frames) represents tail slack. Rather than stretching video or clipping audio, the compiler absorbs this delta into the shot's natural decay padding, allowing speech to decay naturally across cuts.  
> * *Zero-Length Interval Clamp:* For short vocalizations or interjections (\<41.67 ms), the compiler enforces a minimum duration of 1 frame (41.67 ms) via max(1,⌈(*D*ms​/1000)×24⌉) and pads the tail with digital silence to prevent timeline crashes.

#### **Multi-Track Gain Automation (Programmatic Sidechain Ducking)**

Audio stems are mounted across three discrete functional tracks in the Remotion component tree:

> * **Track 1 (Dialogue Stems):** Spoken dialogue conformed to an integrated −16.0 LUFS (±1.0 LUFS) target with True-Peak ≤−1.0 dBTP.  
> * **Track 2 (Spot Foley Transients):** Physical sound cues resolved deterministically via Mulberry32 PRNG keyed with MurmurHash3(scene\_id+":"+shot\_id+":"+cue\_name) and anti-clustering salt.  
> * **Track 3 (Continuous Ambient Bed & Music):** Sustained background loops and music. During active dialogue windows, Track 3 ducks by −14 dB across a 6-frame quadratic attack (*A*\=6, ≈250 ms) and recovers over a 12-frame quadratic release (*R*\=12, ≈500 ms) when pauses exceed 12 frames:  
>   Gainducked​\=1020−14 dB​×*V*base​≈0.1995×0.40≈0.0798

### **7\. The Acoustic Redaction Battery**

To confirm that the Somatic-to-Acoustic Translation Matrix produces a distinctive, character-specific performance, synthesized stems are evaluated against the Acoustic Redaction Battery (Tier 3 of the studio's Three-Tier Redaction Battery):

               SYNTHESIZED DIALOGUE STEM (.wav)  
                              │  
                              ▼  
┌────────────────────────────────────────────────────────┐  
│ TIER 3 ACOUSTIC REDACTION: PITCH-SHIFTED CEPSTRUM      │  
├────────────────────────────────────────────────────────┤  
│ • Pitch-shifts and flattens vocal formants             │  
│ • Strips superficial timbral coloration & pitch tags   │  
│ • Evaluates underlying rhythmic and metric structures: │  
│   \- Duration-per-syllable distribution                │  
│   \- Inter-phoneme pause frequency                      │  
│   \- Consonant-attack velocity envelopes                │  
└─────────────────────────────┬──────────────────────────┘  
                              │  
                              ▼  
┌────────────────────────────────────────────────────────┐  
│ CLASSIFICATION / AUDIT TEST                            │  
│ Does speaking rhythm distinguish Bog from Wart in     │  
│ total acoustic darkness?                               │  
│ • PASS: Cadence survives somatic redaction             │  
│ • FAIL: "The Beige Plague" (Voice Bleed / Homogenized) │  
└────────────────────────────────────────────────────────┘

> * **Timbre Stripping:** The test flattens vocal formants and pitch shifts the waveform to remove superficial vocal color.  
> * **Cadence Verification:** The evaluator measures the remaining prosodic structures—syllable duration distributions, breath pause frequencies, and consonant-attack velocities.  
> * **Failure Interception:** The test confirms that somatic conditioning survives audio processing. A character with pulmonary damage (like Octavius Oddwadd) must remain distinguishable from uninjured entities by rhythmic cadence alone, preventing vocal homogenization across the cast.

---

*User prompt: {{FOCUS: 4\. Pressure Meter Engine Coupling & Basis-Point Dynamics }} /extreme-details*

Response: The **Pressure Meter Engine Coupling & Basis-Point Dynamics** represents the deterministic thermodynamic control plane within worker-sower-engine and worker-sower-conductor. It bridges abstract character psychology, somatic trauma, and physical exhaustion into quantifiable, non-drifting integer scalars that directly modulate the acoustic digital signal processing (DSP) synthesis pipeline inside audio-microservice.

Under the studio's separation of semantic meaning (Axis A) from physical artifact representation (Axis B), generative models are strictly untrusted workers forbidden from deciding when a character breaks, when fatigue slows speech, or when moral resistance collapses. Those transformations are governed by an append-only, integer-quantized basis-point ledger.

### **1\. The Integer Basis-Point Standard (0–10,000 bp) & Thermodynamic Flow**

Binary state switches (e.g., is\_tired: true or refuses\_help: false) create static characters incapable of believable dramatic escalation. Conversely, allowing continuous floating-point variables (0.0 to 1.0) across distributed edge nodes (Cloudflare V8 Isolates), local orchestrators (Node.js on Rig 1), and neural runtimes (Python/PyTorch on port 8000\) causes floating-point rounding divergence and non-deterministic logic forks.

To ensure bit-identical state simulation across all runtime boundaries, the engine quantizes all physical, psychological, and social tension into an invariant integer scale:

1.0×(100% Capacity)≡10,000 basis points (bp)  
0.0001(0.01%)≡1 basis point (bp)  
┌────────────────────────────────────────────────────────────────────────┐  
│               THERMODYNAMIC FLOW OF A BASIS-POINT METER                │  
├────────────────────────────────────────────────────────────────────────┤  
│ Meter\_{t+1} \= max(baselineBp, Meter\_t \- DecayRate) \+ ∑ FrictionEvents  │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │  
         ┌─────────────────────────┴─────────────────────────┐  
         ▼                                                   ▼  
\[ HIGH-FRICTION INPUT \]                             \[ NATURAL COOL-OFF \]  
• Dragging fuel drum: \+2,500 bp                     • Rest cycle / Sleep  
• Interrogated on secret: \+1,800 bp                 • Exponential half-life  
• Sustaining femoral laceration: \+3,500 bp          • Floor clamped at baselineBp

#### **The Thermodynamic Flow Equation**

Every pressure meter updates at each discrete simulation cycle according to an exact thermodynamic accumulation and decay formula:

Meter*t*\+1​\=max(baselineBp,Meter*t*​−DecayRatePerCycleBp)+*k*∑​FrictionEvent*k*​

> * **baselineBp (The Chronic Floor):** Establishes the irreversible physical or mental floor below which a meter can never cool down. For example, an untreated lumbar compression (L4–L5) enforces a permanent somatic floor of 2,000 bp.  
> * **DecayRatePerCycleBp (The Half-Life):** The integer rate at which stress dissipates when an entity rests or receives medical aid.  
> * **∑FrictionEvent*k*​ (The Debit Injection):** Whenever an actor executes a permitted high-friction action (e.g., carrying an 8.5 L fuel drum with a damaged arm), the capability solver allows the action but injects a debit (e.g., \+2,500 bp) directly into the active accumulator.

### **2\. Typological Contract: The PressureMeter Primitive**

The engine models all friction using a single polymorphic interface. While the narrative manifestations diverge radically, their mathematical execution is structurally identical:

// worker-sower-engine: src/types/pressure.ts  
export type PressureCategory \=   
  | 'SOMATIC\_FATIGUE'     // Muscular, metabolic, and respiratory depletion  
  | 'PHYSICAL\_PAIN'       // Acute nervous trauma and untreated lacerations  
  | 'REFUSAL\_STRAIN'      // Psychological friction on core moral taboos  
  | 'PARANOIA\_CLOCK';     // Epistemic dread, betrayal anxiety, surveillance fear

export interface PostBreakMutation {  
  readonly targetRefusalVectorId: string;  
  readonly newBehaviorDirective: string;  
  readonly bannedTokensRemoved: readonly string\[\];  
  readonly permanentAcousticDeltas: {  
    readonly basePitchShiftSemitones?: number;  
    readonly formantWarpingFactor?: number;  
    readonly vocalFryDensity?: number;  
    readonly breathinessPauseMultiplier?: number;  
  };  
}

export interface PressureMeter {  
  readonly meterId: string;  
  readonly entityId: string;  
  readonly category: PressureCategory;  
  readonly currentValueBp: number;       // 0 to 10,000 bp  
  readonly baselineBp: number;            // Chronic resting floor (0 to 10,000 bp)  
  readonly decayRatePerCycleBp: number;   // Dissipation per discrete simulation cycle  
  readonly thresholdLimitBp: number;      // Breaking limit (capped at 10,000 bp)  
  readonly postBreakStateMutation: PostBreakMutation | null;  
}

#### **Volatile Scratchpad vs. Atomic D1 Commit**

> 1. **The Mutable Staging Accumulator:** During scene generation, meter deltas accumulate in an in-memory scratchpad on Rig 1 (worker-sower-conductor). This prevents split-brain race conditions across distributed edge Durable Objects.  
> 2. **The Atomic Reduction:** Once the scene resolves, all meter updates, state changes, and narrative tags compile into a single batch commit.  
> 3. **The Sovereign Event Append:** The batch is committed as an immutable transaction to Cloudflare D1 (CANON\_DB). The volatile accumulator is wiped, and the updated basis-point values become canonical history.

### **3\. Strict Domain Decoupling: The Four Thermodynamic Tracks**

Generative models suffer from the "Exhausted Apostate" defect: if physical fatigue and moral resistance share a generic variable (such as stress \= 0.9), the model assumes a character who just sprinted up a flight of stairs will spontaneously surrender their core beliefs or confess state secrets.

The engine resolves this by executing four decoupled tracks in parallel:

┌────────────────────────────────────────────────────────────────────────┐  
│                     THE FOUR PARALLEL DOMAINS                          │  
├────────────────────┬────────────────────┬──────────────────────────────┤  
│ Domain Track       │ Primary Drivers    │ Operational Boundaries       │  
├────────────────────┼────────────────────┼──────────────────────────────┤  
│ 1\. SOMATIC\_FATIGUE │ Physical exertion, │ Alters motor verbs (RUN ──►  │  
│                    │ heavy loads, long  │ SHUFFLE). Dilates breath     │  
│                    │ locomotion sprints │ pauses. Zero moral impact.   │  
├────────────────────┼────────────────────┼──────────────────────────────┤  
│ 2\. PHYSICAL\_PAIN   │ Blunt impact,      │ Injects visceral reflex      │  
│                    │ burns, lacerations,│ holds, vocal pitch spikes,   │  
│                    │ untreated wounds   │ and tremors. Zero surrender. │  
├────────────────────┼────────────────────┼──────────────────────────────┤  
│ 3\. REFUSAL\_STRAIN  │ Interpersonal      │ Scoped to specific taboo     │  
│                    │ coercion, forced   │ vectors (e.g. pride). Breaks │  
│                    │ ethical compromise │ trigger ideological collapse.│  
├────────────────────┼────────────────────┼──────────────────────────────┤  
│ 4\. PARANOIA\_CLOCK  │ Eavesdropping,     │ Increases glance frequencies │  
│                    │ unexplained clues, │ and whispering. Decays only  │  
│                    │ systemic isolation │ through public vindication.  │  
└────────────────────┴────────────────────┴──────────────────────────────┘

> * **Somatic Fatigue vs. Refusal Strain:** A character carrying 9,500 bp of SOMATIC\_FATIGUE collapses physically, panting for air with severe pause multipliers. However, their REFUSAL\_STRAIN remains at 0 bp. If interrogated, they remain completely obstinate, delivering defiance between gasps.  
> * **Physical Pain vs. Epistemic Secrets:** A character suffering 8,500 bp of PHYSICAL\_PAIN experiences involuntary motor flinches and pitch instability, but does not disclose hidden coordinates unless their specific secret refusal vector is targeted and broken.

### **4\. Authored Inter-Meter Bridges: Deterministic Coupling**

While the four tracks are isolated by default, human psychology and narrative conventions acknowledge that prolonged physical torture or exhaustion eventually degrades willpower. To prevent generative models from hallucinating these transitions, cross-domain coupling is permitted **exclusively through explicit, authored bridge rules** declared in canonical lore (goblin-lore / wiregrass-lore):

                      AUTHORED CROSS-DOMAIN BRIDGE  
                        
             \[ SOMATIC\_FATIGUE \>= 8,000 bp Threshold \]  
                                │  
                                ▼ Evaluate Authored Bridge Equation  
      \[ Active Refusal Threshold Limit: 10,000 bp \-\> 8,000 bp \]  
                                │  
                                ▼  
         Coercive Dialogue Event (+1,500 bp Refusal Strain)  
                                │  
                                ▼  
           \[ BREACH\! Refusal Strain Hits Dynamic Ceiling \]  
                                │  
                                ▼  
                    POST-BREAK STATE COLLAPSE

#### **The Three Structural Bridge Equations**

Bridges are codified as deterministic functions executed during pre-flight scene compilation:

> 1. **Step-Threshold Threshold Compression:**  
>    thresholdLimitBpeffective​\={thresholdLimitBpbase​×(1.0−*δ*),thresholdLimitBpbase​,​if Metersource​≥*T*trigger​otherwise​  
>    *Rule:* If SOMATIC\_FATIGUE ≥8,000 bp, reduce all REFUSAL\_STRAIN thresholds by *δ*\=0.20 (20%).  
> 2. **Continuous Dynamic Transfer (The Drag Coefficient):**  
>    ΔMetertarget​\=⌊ΔMetersource​×(10,000*K*bridge​​)⌋  
>    *Rule:* For every \+1,000 bp of acute PHYSICAL\_PAIN sustained while isolated in darkness, add \+250 bp (*K*bridge​\=2,500) to PARANOIA\_CLOCK.  
> 3. **The Entangled Caregiver Heat Sink:** When two entities share a topological resonance lock (:ENTANGLED { type: "MAGNETIC\_VECTOR\_LOCK" }), high-friction trauma can be redirected:  
>    Metertarget, *t*\+1​\=Metertarget, *t*​  
>    Metercaregiver, *t*\+1​\=Metercaregiver, *t*​\+ΔFrictionEvent  
>    The Caregiver acts as a biological buffer, absorbing somatic or psychological strain onto their own ledger to prevent the primary target from tripping a terminal break.

### **5\. Acoustic Coupling: Translating Basis Points to DSP Modifiers**

When worker-sower-conductor prepares a line of dialogue, it translates the character's active basis points into concrete DSP modifiers dispatched to audio-microservice at \[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate).

CANONICAL BASIS-POINT LEDGER (Cloudflare D1 / Accumulator)  
├─ SOMATIC\_FATIGUE: 8,400 bp  
├─ PHYSICAL\_PAIN:   4,200 bp  
└─ PARANOIA\_CLOCK:  6,800 bp  
                     │  
                     ▼ Algebraic Somatic-to-Acoustic Bridge  
DYNAMIC DSP MODIFIERS (worker-sower-conductor: ttsClient.ts)  
├─ tonePacing:                  0.748   (Conversational deceleration)  
├─ pause\_frequency\_multiplier:  2.176   (Severe respiratory fragmentation)  
├─ breathinessPauseMultiplier:  2.008   (Pulmonary aspiration gaps)  
├─ vocalFryDensity:             0.588   (Subharmonic rattle at line tails)  
└─ basePitchShiftSemitones:     \-0.54   (Low-register physical drag)  
                     │  
                     ▼ HTTP POST :8000/generate  
audio-microservice (Pure CPU / System RAM)  
                     │  
                     ▼  
Uncompressed 48 kHz / 24-bit PCM .wav Stem Generated  
                     │  
                     ▼ ffprobe Duration Measurement  
duration\_ms \= 4,280 ms  ──► target\_frames \= ceil((4280 / 1000\) \* 24\) \= 103 frames

#### **Mathematical Transfer Functions**

> 1. **Pacing Velocity (*P*eff​):** Compresses dialogue rate as fatigue increases:  
>    *P*eff​\=speedScalarbase​×(1.0−0.30×(10,000SOMATIC\_FATIGUE​))  
> 2. **Breath Interval Dilation (Πeff​):** Dilates pause frequency to emulate breath starvation:  
>    Πeff​\=baseBreathiness×(1.0+1.40×(10,000SOMATIC\_FATIGUE​)2)  
>    The quadratic curve ensures that breath spacing remains relatively normal until fatigue crosses 6,000 bp, after which pause lengths expand rapidly.  
> 3. **Subharmonic Vocal Fry Injection (Φeff​):** Driven by both physical exhaustion and pain:  
>    Φeff​\=clamp(baseVocalFry+0.50(10,000SOMATIC\_FATIGUE​)\+0.40(10,000PHYSICAL\_PAIN​),0.0,1.0)  
> 4. **Fundamental Frequency Tremor Modulation (Δ*F*0​):** Acute pain injects sharp upward semitone spikes; heavy somatic exhaustion drags pitch downward:  
>    Δ*F*0​\=(\+3.5×10,000PHYSICAL\_PAIN​)\+(−2.0×10,000SOMATIC\_FATIGUE​)

#### **Master Clock & Timeline Impact**

When high basis points inflate pause\_frequency\_multiplier and breathinessPauseMultiplier, the physical audio file duration (*D*ms​) expands significantly.

> * An identical 8-word line that takes 2,100 ms at resting baseline (51 frames) expands to 3,850 ms (93 frames) when SOMATIC\_FATIGUE sits at 8,500 bp.  
> * ffprobe extracts this duration directly from the uncompressed .wav header on Rig 1, recalculating the discrete 24 fps frame budget:  
>   target\_frames=⌈(10003,850​)×24⌉\=93 frames  
> * The physical state of the character’s body dictates the visual cut length of the shot, ensuring that downstream video diffusion plates accommodate the labored, breath-starved performance without unnatural visual cuts.

### **6\. The Post-Break State: Irreversible Ledger Finality**

The defining architectural feature of the Pressure Meter Engine is how it enforces failure. Unlike video game stamina bars, when currentValueBp \>= thresholdLimitBp, the meter **never silently resets to zero**.

                 THE POST-BREAK ATOMIC SEQUENCE  
                   
      \[ currentValueBp \>= thresholdLimitBp (10,000 bp) \]  
                              │  
                              ▼  
┌─────────────────────────────────────────────────────────────┐  
│ 1\. HALT LOCAL CYCLE: Intercepts active compilation         │  
│ 2\. D1 TRANSACTION: Writes PostBreakMutation event to log   │  
│ 3\. PERMANENT CANON ALTERATION: Modifies Refusal Vector      │  
│ 4\. REMOVE BANNED TOKENS: Lifts verbal attenuation fences    │  
│ 5\. EMIT MANDATORY SCENE SPEC: Forces dramatic climax beat   │  
└─────────────────────────────────────────────────────────────┘

#### **The Mutation Lifecycle**

> 1. **Immediate Execution:** The compiler catches the overflow during staging accumulation.  
> 2. **Terminal State Mutation:** The accumulator applies the postBreakStateMutation payload. For example, when Bog's Refusal Vector ("Bog will not ask for help") redlines past 10,000 bp, the condition collapses into SUBSERVIENT\_DESPERATION.  
> 3. **Token De-Listing:** Banned words that the character was previously forbidden from speaking (e.g., \["please", "help me", "I can't lift it"\]) are permanently removed from their negative lexical fence.  
> 4. **Permanent Ledger Alteration:** An immutable record is committed to Cloudflare D1 (CANON\_DB):  
>    INSERT INTO canon\_state\_events (  
>      event\_id, entity\_id, event\_type, payload, post\_break\_state  
>    ) VALUES (  
>      'evt\_break\_bog\_042', 'char\_bog', 'REFUSAL\_COLLAPSE',  
>      '{"refusal\_id": "refuse\_begging", "mutated\_to": "SUBSERVIENT\_DESPERATION"}',  
>      'SUBSERVIENT\_DESPERATION'  
>    );

5\. **Irreversible Production Consequence:** In all future episodes, Bog's baseline recipe permanently incorporates elevated vocal fry (Φbase​\=0.35) and lower status tags. The character arc advances irreversibly through physical and psychological wear, entirely driven by deterministic arithmetic.

---

*User prompt: {{FOCUS: 5\. Swain Motivation-Reaction Units (MRUs) & Pre-Roll Acoustic Geometry}} /extreme-details*

### **Response: 1\. Theoretical Foundations: Dwight Swain’s MRU Architecture & The Causal Perception Pipeline**

Dwight Swain’s Motivation-Reaction Unit (MRU) structure formalizes psychological causality into an ordered biological sequence: **Stimulus ⟶ Involuntary Visceral Reflex ⟶ Conscious Thought (Calculation) ⟶ Deliberate Motor Action / Spoken Dialogue**. In cognitive neuroscience and dramaturgical craft, physical reflexes precede conscious deliberation, which in turn precedes motor action and speech.

┌────────────────────────────────────────────────────────────────────────┐  
│                   DWIGHT SWAIN'S MRU CAUSAL SEQUENCE                   │  
├────────────────────────────────────────────────────────────────────────┤  
│                                                                        │  
│   1\. EXTERNAL SENSORY STIMULUS (Motivation)                            │  
│      Objective, external sensory input (sight, sound, tactile impact). │  
│                    │                                                   │  
│                    ▼                                                   │  
│   2\. INVOLUNTARY VISCERAL REFLEX (Autonomic Response)                  │  
│      Autonomic nervous response (pupil dilation, flinch, pulse spike). │  
│                    │                                                   │  
│                    ▼                                                   │  
│   3\. CONSCIOUS PSYCHIC REACTION (Calculation / Processing)             │  
│      Cognitive assessment, emotional flash, or tactical calculation.   │  
│                    │                                                   │  
│                    ▼                                                   │  
│   4\. DELIBERATE MOTOR ACTION & SPOKEN DIALOGUE (Motor Output)          │  
│      Intentional physical movement, terminating in vocalized speech.   │  
│                                                                        │  
└────────────────────────────────────────────────────────────────────────┘

> * **Step 1: External Sensory Stimulus (Motivation):** An objective physical event perceived through eye, ear, or skin (e.g., an iron steam-valve venting high-pressure vapor, an explosion, or a sudden footfall overhead). Crucially, the stimulus contains zero internal emotion; it exists purely as external physical evidence.  
> * **Step 2: Involuntary Visceral Reflex (Autonomic Reaction):** Unthinking, autonomic nervous system response (e.g., startle flinch, pupil dilation or contraction, heart rate spike, adrenaline rush, or throat contraction). This occurs in milliseconds without conscious cognitive control.  
> * **Step 3: Conscious Psychic Reaction (Calculation / Thought):** Internal cognitive processing, sensory interpretation, or tactical assessment (e.g., evaluating that a four-bar pressure drop will rupture lower seals, or registering that human footsteps are overhead). In dramatic pacing, this represents the cognitive gap between sensation and deliberate intention.  
> * **Step 4: Deliberate Motor Action & Speech (Spoken Action):** Intentional physical locomotion, object manipulation (lunging for a spanner, sliding a bolt), followed lastly by vocal articulation. Spoken dialogue must sit at the absolute end of the unit, never at the beginning.

Within the multi-repository studio fleet, narrative truth (S) is medium-agnostic. Output formats are unidirectional mathematical projections (*Rm*​:S→*Om*​):

> * **Prose Fiction Mode (*Rp*​):** Enforces MRU chronological syntax in text, using dependency parsing to prevent causal inversion while managing Sentence Length Variance (SLV).  
> * **Comic / Graphic Mode (*Rc*​):** Quantizes spatial panels and gutters, rendering the visceral reflex and calculation into frozen visual tension and 180° eyeline vectors before speech bubbles appear.  
> * **Animated Video Mode (*Rv*​):** Quantizes time into discrete frames at 24 fps, compiling the visceral reflex and calculation phases into physical pre-roll reaction geometry *before* dialogue stems are mounted.

### **2\. The AI Generation Failure Mode: Inverted Causality & Syntactic Profiling**

Large language models (LLMs) and unconstrained generative writers naturally invert physical causality and compress dramatic time.

STANDARD AI GENERATION DEFECT (INVERTED CAUSALITY)  
"Silas ducked as the high-velocity round pulverized the timber behind his skull, feeling his adrenaline surge."  
 └─ Error 1: Action (ducked) precedes Sensory Stimulus (round pulverizing timber)\[cite: 13, 14\].  
 └─ Error 2: Autonomic reflex (adrenaline surge) is appended as a participial afterthought\[cite: 13, 14\].

CANONICAL MRU COMPILER ENFORCEMENT  
1\. Stimulus:   A high-velocity round pulverized the timber behind Silas's skull\[cite: 7, 13, 14\].  
2\. Reflex:     His breath caught cold in his throat; adrenaline spiked his pulse\[cite: 7, 14, 21\].  
3\. Thought:    The sniper had shifted to the eastern treeline\[cite: 7, 14, 21\].  
4\. Action:     He drove his boot into the mud, ducking beneath the iron sill\[cite: 7, 14, 21\].

#### **Common Syntactic Failure Modes**

> 1. **Participial Inversion Chains:** Generative models habitually open beats with participial clauses linked by *as* or *while* (e.g., *"Feeling terrified, she heard the explosion"* or *"Reaching for his knife, he lunged as the glass broke"*), reporting the character's internal terror before describing the physical event that triggered it.  
> 2. **Instantaneous Vocalization ("Zero-Frame Speech"):** Models trigger spoken dialogue concurrently with catastrophic sensory shocks (e.g., speaking on frame 0 of an explosion), eliminating the physiological interval required for human neurological processing.  
> 3. **Filter-Verb Scaffolding:** Inserting perception filters (*"he noticed"*, *"she felt"*, *"he saw"*) that buffer the audience from immediate sensory impact.

#### **Static Analysis & Structural Syntactic Profiler (spacy-linter)**

In prose compilation (*Rp*​), deterministic linters intercept causality inversions before narrative assets are committed:

> * **Shallow Dependency Parsing:** String-matching fails on complex grammar. The linter constructs dependency trees across sentence clauses to assert that the head verb of the external stimulus clause precedes the verb of the reaction clause.  
> * **Sentence Length Variance (SLV):** Calculates the standard deviation (*σ*) of sentence lengths within rolling windows. If *σ*\<4.5, the beat is flagged for monotonous, droning cadence.  
> * **Advisory Scoring vs. Hard Blocking:** Because human authors occasionally invert MRUs for dramatic irony or stylistic punch, MRU prose linters surface advisory quality scores to human editors in the Astro cockpit rather than acting as hard gating walls. However, when compiling for animated video (*Rv*​), the timeline geometry is enforced programmatically.

### **3\. AST Codification & The Machine Rail (reaction\_cue)**

Before dialogue enters the presentation layer, worker-sower-engine compiles narrative turns into an Abstract Syntax Tree (dialogue\_ast.json). The MRU sequence is codified in the AST schema through explicit typed fields:

\# AST Machine Representation of an MRU Beat  
MRU\_ENFORCEMENT\_RULE:  
  sequence:  
    1\_STIMULUS: "External, sensory only (sight, sound, impact). No internal state."  
    2\_REFLEX: "Autonomic, unthinking (pupil dilation, involuntary flinch, pulse spike)."  
    3\_CALCULATION: "Brief mental assessment or emotional flash. Max 1 sentence."  
    4\_RESPONSE: "Deliberate action, movement, or spoken dialogue."  
  CONSTRAINT: "Never allow Step 3 or 4 to precede Step 1\. Invert no clauses."

#### **The DialogueLine Contract (src/types/narrative.ts)**

import { z } from "zod";

export const ReactionCueEnum \= z.enum(\[  
  "NONE",               // Standard delivery; neutral conversational exchange\[cite: 5\]  
  "VISCERAL\_STING",     // Sudden sensory/emotional shock; mandates pre-roll hold\[cite: 3, 5, 6\]  
  "CALCULATION\_HOLD",   // Tactical deliberation, hesitation, or cognitive assessment\[cite: 5\]  
  "INTERRUPTION\_SNAP"   // Dialogue-First override; cuts off preceding beat immediately\[cite: 7, 28\]  
\]);

export const DialogueLineAST \= z.object({  
  line\_id: z.string(),  
  speaker: z.string(),  
  dialogue\_text: z.string().min(1),  
  subtext: z.string().optional(),  
  reaction\_cue: ReactionCueEnum.default("NONE"), // MRU stimulus trigger\[cite: 5\]  
  reaction\_duration\_frames: z.number().int().min(0).max(60).optional(), // Custom override\[cite: 28\]  
  mru\_override: z.enum(\["STANDARD", "SPEECH\_FIRST"\]).default("STANDARD"), // Interruption escape\[cite: 7, 28\]  
  camera\_action: z.enum(\["STATIC", "PUSH\_IN", "CRASH\_ZOOM", "EYELINE\_SACCADE"\]).default("STATIC"),  
  held\_item\_interaction: z.string().optional(), // Meso/Micro sensory budget anchor\[cite: 21\]  
  dsp\_modifiers: z.record(z.number()).optional()  
}).strict();

> * **reaction\_cue: "VISCERAL\_STING":** Directs the compiler to insert an explicit unvoiced reaction pre-roll window *before* the dialogue audio stem begins. Dialogue never starts on frame 0 of an emotional turn.  
> * **reaction\_cue: "CALCULATION\_HOLD":** Directs the compiler to render internal thought through an explicit held frame, eye-dart animation, or cut to an object being assessed.  
> * **mru\_override: "SPEECH\_FIRST":** Bypasses default pre-roll holds for rapid comedic non-sequiturs, interjections, or immediate verbal interruptions.

### **4\. Timeline Frame Geometry: Pre-Roll Buffers & Optical Mapping**

When compiling the exposure sheet (exposure\_sheet.json) and Remotion TSX manifests (Episode\_XXX.tsx), the compiler maps Swain's causal phases to discrete 24 fps timeline frame budgets:

TIMELINE FRAME GEOMETRY (Shot 03: 96 Total Frames at 24 fps)  
┌───────────────────────────────────────────────┬───────────────────────────────┐  
│ CAUSAL PRE-ROLL (Unvoiced Reaction Buffer)    │ ACTIVE DIALOGUE (Expression)  │  
├───────────┬───────────────────┬───────────────┼───────────────────────────────┤  
│ Frame Span│ Dramatic Phase    │ Optical / Physical Presentation               │  
├───────────┼───────────────────┼───────────────┼───────────────────────────────┤  
│ F00 \- F05 │ Autonomic Reflex  │ Pupil dilation, jaw clench, startle flinch    │  
│ F06 \- F17 │ Processing / Calc │ Eye saccade to object, camera push-in (1.03x) │  
│ F18 \- F23 │ Intent / Decision │ Diaphragmatic inhale, forward weight shift    │  
├───────────┴───────────────────┴───────────────┼───────────────────────────────┤  
│ F24 \- F96 │ Spoken Dialogue   │ Spoken line delivery (48 kHz PCM WAV stem)    │  
└───────────────────────────────────────────────┴───────────────────────────────┘

#### **Phase Allocation Breakdown**

CAUSE EVENT (Stimulus) ──► Frame 52  
                             │  
REFLEX (Visceral Shock) ──► Frames 53–57 (5 frames / \~208 ms)  
                             │  
PROCESSING (Calculation) ──► Frames 58–69 (12 frames / 500 ms)  
                             │  
DECISION (Intent)      ──► Frames 70–73 (4 frames / \~167 ms)  
                             │  
SPEECH (Action)        ──► Frame 74 Onward (Dialogue Audio Un-mutes)

> 1. **Visceral Reflex Window (Frames 00–05):** Involuntary shock is rendered via instant visual triggers. In 2D cutout pipelines, the engine swaps to a dilated pupil sprite overlay or an impact posture sprite; in diffusion pipelines, this window triggers a high-frequency coordinate shake decaying over 10–18 frames. Speech remains completely muted.  
> 2. **Calculation / Processing Window (Frames 06–17):** Internal thought cannot be heard; it must be rendered visually. The engine maps calculation to one of three explicit optical choices:  
   * *Held Beat with Eye Movement:* An eyeline saccade darting toward the source of conflict.  
   * *Cut to Object of Assessment:* An insert shot focusing on the critical tactical prop (e.g., the pressure valve, the siphon nozzle, or the door latch).  
   * *Slow Programmatic Push-In:* A smooth camera zoom scaling from 1.0×→1.03× or 1.04× centered on the facial centroid.  
> 3. **Decision / Physical Pre-Speech (Frames 18–23):** Physical preparation for speech: diaphragmatic inhalation, postural weight shift, or hand placement adjustments.  
> 4. **Speech Window (Frames 24–96):** Track 1 dialogue audio stem unmutes and plays with sample-accurate alignment.

#### **Pre-Roll Duration Table**

While the default buffer is **12 to 24 frames** (0.5 to 1.0 seconds at 24 fps), using a uniform duration creates a predictable, mechanical cadence. The timeline compiler draws durations from an authored reaction table based on dramatic context:

| Reaction / Reflex Class | Pre-Roll Duration (*F*pre​) | Frame Duration at 24 fps | Associated Camera / Visual Macro |
| :---- | :---- | :---- | :---- |
| **Acute Startle / Sting** | 8 to 12 frames | 333 to 500 ms | Immediate camera shake \+ impact snap. |
| **Standard Shock / Turn** | 12 to 24 frames | 500 to 1000 ms | Smooth quadOut camera push-in (1.0×→1.03×). |
| **Cognitive Recognition** | 18 to 30 frames | 750 to 1250 ms | Eyeline dart to prop \+ crash zoom target lock. |
| **Existential Dread / Chill** | 24 to 48 frames | 1000 to 2000 ms | Glacial slow-zoom (1.0×→1.05×) over held silence. |

### **5\. The Master Clock Decoupling: Reconciling Reaction Duration with Physical Audio Time**

The injection of pre-roll reaction geometry intersects with the foundational axiom: **audio is the physical master clock; picture is an integer projection mapped to audio duration**.

TIMELINE CONCATENATION ORDERING

Screenplay AST Beat ──► reaction\_cue: "VISCERAL\_STING"  
                          │  
                          ├─► Audio Microservice (:8000) ──► duration\_ms (ffprobe) \= 3,120 ms  
                          │                                  F\_raw \= ceil(3120 \* 24 / 1000\) \= 75 frames\[cite: 8, 17, 20\]  
                          │  
                          └─► Authored MRU Table        ──► F\_pre  \= 18 frames (Reaction Hold)\[cite: 3, 5, 28\]  
                                                            F\_post \= 8 frames (Decay Padding)\[cite: 17\]  
                                                             │  
                                                             ▼  
TOTAL SHOT DURATION BUDGET:  
total\_shot\_frames\_i \= F\_pre \+ F\_raw \+ F\_post \= 18 \+ 75 \+ 8 \= 101 frames\[cite: 6, 17\]

> * **The Ordering Hierarchy:**  
  1. *Beat structure and dramatic context* determine pre-roll reaction and post-roll decay durations (*F*pre​, *F*post​) as input constants.  
  2. *Synthesized .wav audio stems* determine speech duration (*F*raw​) via ffprobe observation.  
  3. *The master timeline* is their deterministic concatenation.  
> * **Separation in the Exposure Sheet:** In exposure\_sheet.json, pre-roll and post-roll frames are explicitly decoupled from speech frames:  
>   total\_shot\_frames*i*​\=pre\_roll\_frames*i*​\+audio\_frames*i*​\+post\_roll\_frames*i*​  
>   This allows human directors or automated pacing tools to adjust reaction holds without invalidating cached, content-addressed speech stems.  
> * **Speech Window Framing:** For shot *i*, dialogue audio begins at an offset within the shot:  
>   \[*S*speech(*i*)​,*E*speech(*i*)​\]\=\[*T*start(*i*)​\+*F*pre(*i*)​,*T*start(*i*)​\+*F*pre(*i*)​\+*F*raw(*i*)​\]  
> * **Anti-Drift Absolute Integer Anchoring:** Rather than chaining shots relatively (*Sk*​\=*Ek*−1​), which compounds rounding errors, every shot's global start coordinate is precomputed:  
>   fromFrame*k*​\=*i*\=1∑*k*−1​total\_shot\_frames*i*​  
>   TimelineOffset*K*​\=⌈(*i*\=1∑*K*​DurationMs*i*​)×1000FPSmaster​​⌉  
>   This bounds cumulative episodic synchronization drift to less than one frame across thousands of cuts.

### **6\. Programmatic Directorial Metaprogramming: Camera Choreography & Visual Mechanics**

Directorial heuristics are decoupled from compiler source code and read from a versioned configuration table (style\_rules.json). Remotion calculates camera moves programmatically using interpolate(), ensuring smooth sub-pixel rendering without raster distortion:

// worker-sower-conductor: Remotion Camera Choreography Wrapper  
import { interpolate, Easing } from "remotion";

export const calculateMRUCameraTransform \= (  
  frame: number,  
  preRollFrames: number,  
  totalShotFrames: number,  
  anchorTarget: { x: number; y: number }  
) \=\> {  
  // Push-in executes strictly during the MRU reaction/calculation window  
  const scale \= interpolate(  
    frame,  
    \[0, preRollFrames, totalShotFrames\],  
    \[1.0, 1.03, 1.05\],  
    {  
      easing: Easing.out(Easing.quad), // quadOut easing from style\_rules.json\[cite: 5\]  
      extrapolateLeft: "clamp",  
      extrapolateRight: "clamp"  
    }  
  );

  return {  
    transform: \`scale(\${scale})\`,  
    transformOrigin: \`\${anchorTarget.x}% \${anchorTarget.y}%\`  
  };  
};

#### **Origin Normalization & Target Centroids**

Standard zooms toward the canvas center (50%,50%) cause characters standing off-center to drift out of frame. Camera push-ins anchor to facial centroids (crash\_zoom\_target) stored in the character manifest:

originXglobal​\=canvas.widthpuppet.*x*\+(anchor.*x*×*s*)​×100%  
originYglobal​\=canvas.heightpuppet.*y*\+(anchor.*y*×*s*)​×100%

These normalized coordinates are injected directly into the camera wrapper's transformOrigin style, ensuring crash zooms focus squarely on the actor's eyes during visceral reactions.

#### **High-Frequency Impact Screen Shakes**

For physical impacts or concussive shocks, the camera injects high-frequency coordinate noise via a deterministic Mulberry32 PRNG (random(frame)), decaying across 10 to 18 frames:

const shakeIntensity \= interpolate(frame, \[0, 18\], \[14, 0\], { extrapolateRight: "clamp" });  
const offsetX \= (random(frame \* 2\) \- 0.5) \* shakeIntensity;  
const offsetY \= (random(frame \* 2 \+ 1\) \- 0.5) \* shakeIntensity;

### **7\. Multi-Track Acoustic Geometry: Silence Staging & Sidechain Gain Ducking**

Audio inside Episode\_XXX.tsx is organized into three prioritized layers in the Remotion component tree:

Track 1: Spoken Dialogue Stems (High Priority / Sample-Accurate Master Clock)  
         \[ Pre-Roll: Silent \] \[--- Active Dialogue Stem \---\] \[ Post-Roll: Silent \]  
Track 2: Spot Foley Transients (Medium Priority / Mulberry32 Seeded PRNG)  
         \[\*visceral\_gasp\*\]                                   \[\*brass\_lever\_clink\*\]  
Track 3: Continuous Ambient Bed & Score (Low Priority / Dynamic Sidechain Gain Automation)  
1.0 ────┐                                                   ┌────────┐                 
        │                                                   │        │                 
0.08    └───────────────────────────────────────────────────┘        └───────────────  
          ^ Attack (6 frames)          Release (12 frames) ^  
          Speech Window Ducking: \-14 dB (Gain \= 0.0798)

#### **Sidechain Gain Automation Math (AmbientTrack.tsx)**

Vocal intelligibility is enforced via programmatic gain envelopes rather than dynamic compressors, guaranteeing deterministic output across headless render workers:

> * **Speech Window Ducking:** When Track 1 dialogue begins (*f*start​\=*T*start​\+*F*pre​), Track 3 ambient beds attenuate by **−14 dB**.  
> * **Attack & Release Dynamics:** The bed attenuates over a 6-frame quadratic attack (*A*\=6, ≈250 ms) leading into speech and recovers over a 12-frame quadratic release (*R*\=12, ≈500 ms) when pauses exceed 12 frames:  
>   Gainducked​\=1020−14 dB​×*V*base​≈0.1995×0.40≈0.0798  
> * **Pre-Roll Silence Staging:** Track 1 audio remains completely muted during the pre-roll interval (0≤*f*\<*F*pre​). The ambient bed remains un-ducked or performs its initial attack ramp, letting room tone or Foley punctuate the visual shock.  
> * **Multi-Window Math.min() Reducer:** When multiple dialogue windows occur in close succession, gain curves are composed via Math.min(), preventing volume pumping during short breath pauses.

#### **Narrative Pause Swell (\[BEAT\] Nodes)**

When the screenplay AST introduces dedicated narrative pause markers (\[BEAT\] nodes), speech synthesis is bypassed entirely:

> * **Acoustic Swell:** The Conductor releases the active sidechain ducking envelope, allowing continuous atmospheric drones or orchestral score to swell up to baseline volume (*V*base​).  
> * **Pre-Dialogue Decay:** The atmospheric swell sustains across the pause and decays roughly **0.5 seconds** prior to the resumption of dialogue, cleanly preparing the acoustic space for speech.  
> * **Punctual Foley Injection:** Punctual Foley cues (e.g., striking a match, valve drips) mount at exact offsets during the silence, seeded deterministically via Mulberry32(MurmurHash3(sceneId \+ ":" \+ shotId \+ ":" \+ cueName)).

### **8\. Temporal Edge Cases: Overrides, Horizons & Diffusion Lattices**

#### **The Dialogue-First Override (mru\_override: "SPEECH\_FIRST")**

The rule that speech must always sit at the end of the unit is a strong baseline, but an absolute prohibition breaks interruptions and comedic timing.

> * When a character cuts off an interlocutor, screams mid-reflex, or delivers a comic non-sequitur, the AST marks the line with mru\_override: "SPEECH\_FIRST".  
> * The compiler clamps pre\_roll\_frames to 0, mounting dialogue on frame 0 while shifting camera movement and actor shock to simultaneous or post-speech frames.

#### **Diffusion Horizon Coverage & Shot-Reverse-Shot Decomposition**

Video diffusion models (e.g., Wan 2.1/2.2) lose temporal coherence and exhibit morphing on continuous sequences exceeding **3.5 to 5.0 seconds** (84 to 120 frames at 24 fps).

> * When an MRU beat contains extended dialogue exceeding 3.5 seconds, the Conductor decomposes the monolithic beat into cinematic shot-reverse-shot coverage:  
  1. *Shot A (Speaker Action):* 3.0 seconds rendering the speaking character.  
  2. *Cut to Coverage (Listener Reaction):* Cuts to a 2.0-second reaction plate of the listening character registering the line, with speaker dialogue continuing uninterrupted under the cut.  
  3. *Shot B (Return to Speaker):* Cuts back to the speaker for the resolution and physical post-roll decay.  
> * **Hard Failure Gate (MISSING\_REACTION\_ASSET):** The compiler bans silent fallbacks to static idle loops. If a required reaction plate is missing from the asset registry during assembly, the compiler halts execution immediately with MISSING\_REACTION\_ASSET.

#### **Video Diffusion Latent Lattice Conformance (4*n*\+1)**

Diffusion backends enforce temporal downsampling constraints requiring frame budgets to conform to a discrete 4*n*\+1 mathematical sequence (17,21,25,33,49,65,77,81,…):

Framesdiffusion​\=4×⌈4*N*raw​−1​⌉\+1

> * **Adapter Isolation:** The Conductor passes total shot frames (total\_shot\_frames=*F*pre​\+*F*raw​\+*F*post​) to the backend adapter. The adapter rounds up to the nearest 4*n*\+1 lattice, renders the latent plate on Rig 2, and trims trailing padding frames during Remotion compositing.  
> * **Sawtooth Waste Optimization (scripts/audit-frame-waste.ts):** Because 4*n*\+1 is a step function, needing 38 frames forces *n*\=10 (41 frames, wasting 3 frames), whereas 37 frames wastes 0 frames. The Conductor audits MRU pre-roll and audio duration pre-dispatch, alerting operators when adjusting a reaction hold by 1–2 frames saves billable GPU compute cycles while preserving psychological pacing.

---

*User prompt: {{FOCUS: 3\. AST Codification & The Machine Rail (reaction\_cue)}} /extreme-details*

### **Response: 1\. The Machine Rail vs. Voice Rail Dichotomy**

The studio’s compilation pipeline enforces an absolute architectural partition between deterministic computation and creative prose realization, formalized as the **Machine Rail vs. Voice Rail split**. Most generative pipelines collapse structure, physical capability, and literary text into a single unstructured prompt, inviting hallucination, attention degradation, and broken continuity. The pipeline resolves this by decoupling what must be computed from what must be spoken or felt.

               THE DUAL-RAIL ENTITY & SCENE ARCHITECTURE  
┌────────────────────────────────────────────────────────────────────────┐  
│ THE MACHINE RAIL (Byte 0: Schema-Locked YAML / dialogue\_ast.json)      │  
├────────────────────────────────────────────────────────────────────────┤  
│ • Strongly typed biological, logistical, and spatial state vectors     │  
│ • Deterministic enums (ReactionCueEnum, LocomotionBaseline)            │  
│ • Integer frame budgets, basis-point meters, and discrete motor arrays │  
│ • Set-intersection evaluation: Eligible \= (Cast ∩ Primary) \\ Excluded  │  
│ • Zero natural-language parsing required at runtime                    │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼ Unidirectional Projection  
┌────────────────────────────────────────────────────────────────────────┐  
│ THE VOICE RAIL (Body Markdown / Screenplay Prose / Subtext Engine)     │  
├────────────────────────────────────────────────────────────────────────┤  
│ • Surface Wants vs. Actual Wants (Existential wounds / Subtext)        │  
│ • "The Underneath" psychological tension & evasion directions          │  
│ • Literal callback phrases, regional syntax, and dialect cadence       │  
│ • Injected selectively into drafting context to preserve attention     │  
└────────────────────────────────────────────────────────────────────────┘

#### **Machine Rail Principles**

> * **Byte-0 Frontmatter Placement:** Machine Rails in authored Markdown entities (grievances, character dossiers) begin strictly at byte 0 (---). Any preceding whitespace, UTF-8 Byte Order Mark (BOM), or newline causes parsers like gray-matter to fail silently or misparse data. In downstream compilation, this rail is compiled offline into dialogue\_ast.json.  
> * **Zero Runtime Markdown Parsing:** Production runtimes (worker-sower-conductor on Rig 1, headless Remotion viewports, ComfyUI daemons on Rig 2\) are strictly prohibited from parsing, reading, or importing Markdown files at runtime. Markdown dossiers are strictly compile-time authoring representations; runtimes consume only typed, validated JSON snapshots (dialogue\_ast.json, bible-state.json) stamped with a SHA-256 root hash.  
> * **Set-Theoretic Matching:** The Machine Rail enables pure set-theoretic execution:  
>   Eligible=(SceneCast∩Primary)∖Excluded  
>   subject to Intensity∈\[Min,Max\] and Cooldown=0. The runtime queries eligibility in *O*(1) time without relying on language models.

#### **Voice Rail Principles**

> * **Selective Context Injection:** The Voice Rail holds qualitative drama: surface arguments, underlying fears, and recurring callback phrases. Rather than dumping entire character dossiers into an LLM context window—which dilutes attention and triggers hallucination—the engine pulls only the specific subtext vectors relevant to the active grievance.  
> * **Surface vs. Underneath Subtext Model:** The generator is explicitly directed to escalate the *Surface Argument* (e.g., arguing over a missing silver spoon or a damaged brass siphon nozzle) while strictly suppressing direct verbal mention of *The Underneath* (e.g., fear of abandonment, unadmitted guilt, or generational financial debt). The conflict manifests through evasion, tactical pauses, and physical motor deflection.

### **2\. Machine Contract: The Canonical dialogue\_ast.json Schema**

The human-readable screenplay (.fountain) is merely an ephemeral view. The machine intermediate representation driving audio synthesis, exposure sheets, camera choreography, and QA linters is dialogue\_ast.json.

       CANON (Immutable Axioms & Physiological Laws)  
          │  
          ▼ constrains  
       STATE (Materialized Snapshot: Somatic, Logistical, Epistemic)  
          │  
          ▼ transformed by  
       EVENT (2d6 Duel Mechanics / Mechanical Outcome)  
          │  
          ▼ reduced via Pure Function  
     NEW STATE (S\_{n+1})  
          │  
          ▼ compiled down Axis A  
   CANONICAL MACHINE IR (dialogue\_ast.json)  
          │  
     ┌────┴───────────────────────────┐  
     ▼                                ▼  
AUDIO SYNTHESIS (:8000)      TEMPORAL EXPOSURE SHEET  
Linear 48 kHz PCM WAV        Quantized 24 fps Frames  
     │                                │  
     └──────────────┬─────────────────┘  
                    ▼  
          REMOTION TSX ASSEMBLY

#### **Complete Runtime Zod Specification (src/types/dialogueAst.ts)**

The schema enforces strict validation (.strict()), rejecting any un-schemaed keys hallucinated by language models:

import { z } from "zod";

export const ReactionCueSchema \= z.enum(\[  
  "NONE",               // Standard conversational delivery; frame-0 alignment  
  "VISCERAL\_STING",     // Sudden sensory/emotional shock; mandates pre-roll hold  
  "CALCULATION\_HOLD",   // Tactical deliberation, hesitation, or cognitive assessment  
  "INTERRUPTION\_SNAP"   // Cuts off preceding speaker; clamps pre-roll to 0  
\]);

export const MotorActionSchema \= z.enum(\[  
  "RETREAT",  
  "POINT\_SINGLE\_HAND",  
  "DRAG\_OBJECT\_ONE\_HANDED",  
  "BRACE\_ARM",  
  "LIMP",  
  "CLENCH\_JAW",  
  "EYELINE\_DART",  
  "FREEZE"  
\]);

export const DSPModifiersSchema \= z.object({  
  basePitchShiftSemitones: z.number().min(-12.0).max(12.0).optional(),  
  formantWarpingFactor: z.number().min(0.5).max(2.0).optional(),  
  breathinessPauseMultiplier: z.number().min(1.0).max(3.5).optional(),  
  vocalFryDensity: z.number().min(0.0).max(1.0).optional(),  
  pause\_frequency\_multiplier: z.number().min(0.1).max(3.0).optional()  
}).strict();

export const DialogueLineASTSchema \= z.object({  
  line\_id: z.string().regex(/^LINE-\[0-9\]{3,}\$/),  
  speaker: z.string().min(1).regex(/^\[A-Z0-9\_.-\]+\$/),  
  dialogue\_text: z.string().min(1),  
  subtext: z.string().min(1),  
  conditions: z.array(z.string()).default(\[\]),  
  motor\_actions: z.array(MotorActionSchema).default(\[\]),  
  reaction\_cue: ReactionCueSchema.default("NONE"),  
  reaction\_duration\_frames: z.number().int().min(0).max(60).optional(),  
  pacing\_scalar: z.number().min(0.1).max(3.0).default(1.0),  
  camera\_action: z.enum(\["STATIC", "PUSH\_IN", "CRASH\_ZOOM", "EYELINE\_SACCADE"\]).default("STATIC"),  
  held\_item\_interaction: z.string().nullable().optional(),  
  dsp\_modifiers: DSPModifiersSchema.optional(),  
  foley\_cues: z.array(z.string()).default(\[\])  
}).strict();

export const SceneASTContractSchema \= z.object({  
  \$schema: z.literal("https://specs.studio.internal/schemas/v3/dialogue\_ast.json"),  
  schema\_version: z.literal("3.2.0"),  
  compiler\_version: z.string(),  
  episode\_id: z.string(),  
  scene\_id: z.string(),  
  state\_snapshot\_hash: z.string().regex(/^sha256:\[a-f0-9\]{64}\$/),  
  lines: z.array(DialogueLineASTSchema).min(1)  
}).strict();

export type DialogueLineAST \= z.infer\<typeof DialogueLineASTSchema\>;  
export type SceneASTContract \= z.infer\<typeof SceneASTContractSchema\>;

#### **Canonical Wire Payload (dialogue\_ast.json)**

{  
  "\$schema": "https://specs.studio.internal/schemas/v3/dialogue\_ast.json",  
  "schema\_version": "3.2.0",  
  "compiler\_version": "2.4.1",  
  "episode\_id": "EP040",  
  "scene\_id": "ep040\_sc03",  
  "state\_snapshot\_hash": "sha256:7f83b165a2e1c0d4f9b8e7d6c5b4a3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6",  
  "lines": \[  
    {  
      "line\_id": "LINE-001",  
      "speaker": "BOG",  
      "dialogue\_text": "The relay is dead. Don't touch the brass siphon.",  
      "subtext": "Bog cannot admit he broke the valve while attempting to flee.",  
      "conditions": \["humiliated", "brachial\_plexus\_severed"\],  
      "motor\_actions": \["RETREAT", "POINT\_SINGLE\_HAND"\],  
      "reaction\_cue": "VISCERAL\_STING",  
      "reaction\_duration\_frames": 18,  
      "pacing\_scalar": 1.0,  
      "camera\_action": "PUSH\_IN",  
      "held\_item\_interaction": "brass\_siphon\_nozzle",  
      "dsp\_modifiers": {  
        "pause\_frequency\_multiplier": 1.4,  
        "breathinessPauseMultiplier": 2.2,  
        "basePitchShiftSemitones": \-1.5  
      },  
      "foley\_cues": \["valve\_scrape", "mud\_boot\_squelch"\]  
    }  
  \]  
}

### **3\. Dwight Swain’s Motivation-Reaction Unit (MRU) Codification**

Unconstrained language models default to inverted causality (e.g., *"Silas jumped back as the buckshot shattered the door, feeling his adrenaline surge"*), placing the motor response before the sensory cause and appending autonomic shock as a participial afterthought.

The AST enforces Dwight Swain’s strict biological causality sequence as an explicit machine contract:

1\. Stimulus⟶2. Involuntary Reflex⟶3. Calculation / Thought⟶4. Motor Action / Speech  
\# Strict MRU Causality Rules Codified in Compiler AST  
MRU\_ENFORCEMENT\_RULE:  
  sequence:  
    1\_STIMULUS:  
      type: "External, sensory only (sight, sharp sound, impact). No internal state."  
    2\_REFLEX:  
      type: "Autonomic, unthinking (pupil dilation, involuntary flinch, muscle lock, adrenaline surge)."  
    3\_CALCULATION:  
      type: "Brief mental assessment or emotional flash. Max 1 sentence."  
    4\_RESPONSE:  
      type: "Deliberate action, movement, or spoken dialogue."  
  CONSTRAINT: "Never allow Step 3 or 4 to precede Step 1\. Invert no clauses."

#### **Operational Semantics of reaction\_cue**

TIMELINE PRE-ROLL GEOMETRY GOVERNED BY REACTION\_CUE (24 FPS)

Case A: reaction\_cue \= "NONE"  
Frame 0 ───────────────────────────────────────────────► Line Ends  
┌────────────────────────────────────────────────────────┐  
│ Audio Stem: dialogue\_sh01.wav (Dialogue Active)        │  
└────────────────────────────────────────────────────────┘

Case B: reaction\_cue \= "VISCERAL\_STING"  
Frame 0 ──────────────► Frame 18 ──────────────────────► Line Ends  
┌──────────────────────┬─────────────────────────────────┐  
│ Visual Pre-Roll Hold │ Audio Stem: dialogue\_sh02.wav   │  
│ (Reflex \+ Calc)      │ (Dialogue Speech Window)        │  
└──────────────────────┴─────────────────────────────────┘  
▲                      ▲  
Stimulus Impact        Speech Audio Un-mutes

> 1. **VISCERAL\_STING (Autonomic Reflex Shock):**  
   * *Aesthetic Intent:* An unexpected revelation, threat, or physical impact stuns the character.  
   * *Compiler Execution:* Injects an unvoiced visual pre-roll hold of **12 to 24 frames** (500 to 1000 ms) *before* mounting the synthesized .wav speech stem. Spoken dialogue never begins on frame 0 of an emotional turn.  
   * *Optical Staging:* Triggers pupil dilation sprite swaps, jaw clenches, or a programmatic camera push-in (1.0×→1.03×) centered on the character's facial centroid.  
> 2. **CALCULATION\_HOLD (Cognitive Assessment & Tactical Hesitation):**  
   * *Aesthetic Intent:* The character absorbs a statement, evaluates leverage, and calculates a counter-strategy before replying.  
   * *Compiler Execution:* Holds speech playback while inserting an eyeline saccade dart or an insert shot of the prop being evaluated (e.g., cutting to the siphon nozzle or pressure gauge). The speech synthesizer applies a lower pacing\_scalar to convey deliberate calculation.  
> 3. **INTERRUPTION\_SNAP (Dialogue-First Override):**  
   * *Aesthetic Intent:* Urgent verbal cuts, combat shouts, or comic interruptions that break normal biological latency.  
   * *Compiler Execution:* Clamps pre\_roll\_frames to 0\. Spoken dialogue ignites on frame 0, cutting off any trailing decay from the preceding shot's audio track.  
> 4. **NONE (Conversational Continuity):**  
   * *Aesthetic Intent:* Flowing, low-friction dialogue exchanges where rhythm has already been established. Dialogue begins aligned with standard shot cut boundaries.

### **4\. Downstream Temporal Geometry & Optical Mapping**

reaction\_cue bridges abstract narrative intent into the physical timing grid of Remotion compositions and exposure sheets (exposure\_sheet.json).

AUDIO DOMAIN (Sample-Accurate Physical Clock: 48,000 samples/sec)  
│  
├── dialogue\_text synthesized via local TTS daemon on port 8000  
└── ffprobe measures continuous duration: D\_ms \= 3,120.00 ms  
│  
▼ Discrete Integer Frame Derivation: F\_raw \= ceil(3120 \* 24 / 1000\) \= 75 frames  
VIDEO DOMAIN (Master Media Timeline: 24 frames/sec)  
│  
├── F\_pre  \= reaction\_cue ("VISCERAL\_STING") ──► 18 Frames Pre-Roll Reaction Hold  
├── F\_raw  \= Spoken Dialogue Audio Window    ──► 75 Frames Spoken Dialogue Stem  
└── F\_post \= Acoustic Decay Padding          ──►  8 Frames Physical Settle Hold  
│  
▼ Cumulative Shot Duration Equation:  
total\_shot\_frames \= F\_pre \+ F\_raw \+ F\_post \= 18 \+ 75 \+ 8 \= 101 Frames (4,208.33 ms)

#### **Absolute Timeline Decoupling & Invariant Frame Allocation**

To allow pacing adjustments without invalidating cached, content-addressed audio stems, the exposure sheet isolates pre-roll, speech, and post-roll allocations into independent fields:

total\_shot\_frames*i*​\=pre\_roll\_frames*i*​\+audio\_frames*i*​\+post\_roll\_frames*i*​

> * pre\_roll\_frames*i*​ (*F*pre​): Dictated entirely by the AST's reaction\_cue.  
> * audio\_frames*i*​ (*F*raw​): Evaluated from the synthesized .wav stem duration (*D*ms​) using pure integer ceiling arithmetic:  
>   *F*raw​\=⌈(1000*D*ms​​)×24⌉\=⌊1000(*D*ms​×24)+999​⌋  
> * post\_roll\_frames*i*​ (*F*post​): Provides natural room decay and prevents abrupt cutoffs on final consonants.

#### **The Speech Window Interval**

In the generated Remotion component (Episode\_XXX.tsx), the audio stem is mounted at an explicit internal frame offset rather than the beginning of the sequence:

\[*S*speech(*i*)​,*E*speech(*i*)​\]\=\[*T*start(*i*)​\+*F*pre(*i*)​,*T*start(*i*)​\+*F*pre(*i*)​\+*F*raw(*i*)​\]  
// Metaprogram-generated Remotion sequence for Shot 03  
\<Sequence from={shotStartFrame} durationInFrames={101}\>  
  {/\* Visual reaction renders across entire shot, camera pushes during pre-roll \*/}  
  \<CameraWrapper   
    preRollFrames={18}   
    totalFrames={101}   
    action="PUSH\_IN"   
    targetCentroid={{ x: 42.5, y: 31.0 }}  
  \>  
    \<PuppetSprite character="BOG" condition="humiliated" /\>  
  \</CameraWrapper\>

  {/\* Dialogue stem is delayed by 18 frames of causal pre-roll \*/}  
  \<Sequence from={18} durationInFrames={75}\>  
    \<Audio src={staticFile("audio/dialogue/ep040\_sc03\_sh03.wav")} /\>  
  \</Sequence\>  
\</Sequence\>

### **5\. Dual-Field Action AST & The Cross-Field Discrepancy Gate**

A major point of failure in automated screenwriting is the **self-reporting trap**: a language model generating prose can slip past naive regex checks through lexical substitution (e.g., swapping *"sprinted"* for *"bolted"*, *"scrambled"*, or *"dashed"*).

The pipeline neutralizes this via the **Dual-Field Motor Audit**:

                              DUAL-FIELD MOTOR AUDIT  
                                
      ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  
      │     Grammar-Constrained AST     │   │      Screenplay Action Line     │  
      │ extracted\_motor\_actions:        │   │ "Silas vaults the iron gate and │  
      │ \["LIMP", "RETRIEVE\_KEY"\]        │   │  sprints across the yard."      │  
      └────────────────┬────────────────┘   └────────────────┬────────────────┘  
                       │                                     │  
                       ▼                                     ▼  
      ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  
      │      O(1) Set-Intersection      │   │    Dependency Lemma Parser      │  
      │ Checks against:                 │   │ Detects 'vault' & 'sprint'      │  
      │ somatic.banned\_kinetic\_verbs    │   │ Evaluates negation & modals     │  
      └────────────────┬────────────────┘   └────────────────┬────────────────┘  
                       │                                     │  
                       └──────────────────┬──────────────────┘  
                                          │  
                                          ▼  
                      \[ Cross-Field Discrepancy Gate \]  
                      • AST claims valid LIMP  
                      • Prose contains illegal SPRINT  
                      • RESULT: FATAL REJECTION (Exit Code 1\)

#### **The Dual-Field Separation**

> 1. **The Machine Array (motor\_actions):** The LLM must explicitly declare the character's discrete kinetic actions using closed enums (\["RETREAT", "POINT\_SINGLE\_HAND"\]).  
> 2. **The Prose Expression:** The human-facing screenplay prose describes the physical blocking in natural language.

#### **The Cross-Field Verification Check**

The pre-flight compiler runs two independent audits across both fields:

> * **Set-Intersection Audit (*O*(1)):**  
>   motor\_actions∩somatic.banned\_kinetic\_verbs=∅  
>   If an entity with severed brachial nerves or lumbar trauma outputs \["VAULT", "SPRINT"\], the intersection is non-empty, immediately halting the pipeline.  
> * **Dependency Lemma Scanning (Negation-Aware):** Rather than using naive regex, a token dependency parser scans prose for banned verb lemmas while evaluating negation trees.  
  * *"Silas couldn't sprint across the mud"* ⟶ Negated dependency detected; **PASSES**.  
  * *"Silas vaulted the ditch"* ⟶ Un-negated banned lemma detected; **FAILS**.  
> * **The Discrepancy Gate:** If the model attempts to deceive the parser by declaring a legal movement enum in the machine rail (motor\_actions: \["LIMP"\]) while writing an illegal action in the prose (*"he sprinted toward the door"*), the discrepancy between the two rails trips the gate, throwing a fatal exit code 1 at *T*0​\=\$0.00 before media synthesis begins.

### **6\. Multi-Track Acoustic Staging Driven by AST Cues**

In the studio's acoustic architecture, dialogue stems do not adapt to audio beds; **dialogue is the master pacemaker**, and ambient sound and Foley adapt around spoken words.

Track 1: Spoken Dialogue Stems (Fixed Master Timebase via ffprobe)  
         \[ Pre-Roll: Silent (18f) \] \[--- Active Speech Window (75f) \---\] \[ Post-Roll (8f) \]  
Track 2: Spot Foley Transients (Seeded Mulberry32 PRNG)  
                \[\*valve\_scrape\*\]                                   \[\*mud\_boot\_squelch\*\]  
Track 3: Continuous Ambient Bed & Score (Programmatic Gain Automation)  
1.0 ────┐                                                         ┌────────┐  
        │                                                         │        │  
0.08    └─────────────────────────────────────────────────────────┘        └────────────  
          ^ Attack (6 frames)                Release (12 frames) ^  
          Speech Ducking Floor: \-14 dB (Gain \= 0.0798)

> * **Pre-Roll Silence Staging:** During the pre-roll interval (0≤*f*\<*F*pre​) designated by VISCERAL\_STING, Track 1 dialogue audio is completely silent. Track 3 ambient beds remain un-ducked or begin their 6-frame quadratic attack ramp, allowing atmospheric sound or sudden Foley impacts (e.g., an iron pipe dropping) to play cleanly against the actor's facial shock.  
> * **Dynamic Sidechain Ducking Math (AmbientTrack.tsx):** When Track 1 dialogue ignites (*f*\=*F*pre​), Track 3 attenuates by **−14 dB**:  
>   Gainducked​\=1020−14 dB​×*V*base​≈0.1995×0.40≈0.0798  
>   The bed ducks over a 6-frame quadratic attack curve (*A*\=6, ≈250 ms) leading into speech and recovers over a 12-frame quadratic release curve (*R*\=12, ≈500 ms) during pauses exceeding 12 frames.  
> * **Narrative \[BEAT\] Swells:** When the AST contains an explicit narrative pause line (\[BEAT\]), dialogue synthesis is bypassed. The sidechain envelope releases, allowing atmospheric room tone or musical score to swell up to unity gain (*V*base​), sustaining across the silence and decaying 500 ms before dialogue resumes.

### **7\. Provenance DAG Integration & The Forward Blast Radius**

In the studio’s Directed Acyclic Graph (DAG) compilation engine, dialogue\_ast.json functions as an immutable, content-addressed node linking semantic meaning (Axis A) to media deliverables (Axis B):

UNIVERSAL PROVENANCE GRAPH (render\_manifest.json)  
\[ MASTER COMPOSITE MP4 \]  
       │  
       ▼  
\[ Episode\_XXX.tsx Assembly \]  
       │  
       ├─► Exposure Sheet (Frame Budgets)  
       │         │  
       │         ▼  
       ├─► Synthesized WAV Stems (48 kHz PCM)  
       │         │  
       │         ▼  
       └─► dialogue\_ast.json (Canonical Machine IR)  
                 │  
                 ├─► state\_snapshot\_hash (sha256:7f83b165...)  
                 │         │  
                 │         ▼  
                 │   Relational Ledger (Cloudflare D1 Snapshot)  
                 │  
                 └─► AST Line Checksums (HMAC-SHA256)

#### **Backward Auditability Query**

Any inspector can audit a single delivered video frame backward through the pipeline:

Frame 1420⟶Shot 03⟶Exposure Sheet⟶Stem SHA-256⟶AST Line-001⟶Event ID⟶Ledger State *Sn*​

#### **Forward Blast Radius Calculation**

If an author modifies a fact in the canonical ledger (e.g., retconning a character's physical trauma or changing a grievance condition):

> 1. **Root Hash Mutation:** The ledger recalculates its Merkle root (*H*root​).  
> 2. **State Snapshot Hash Mismatch:** Downstream AST contracts whose state\_snapshot\_hash does not match the active ledger are flagged as dirty (is\_dirty \= 1).  
> 3. **Selective Re-Compilation:** The DAG engine sweeps downward, scheduling only the invalidated dialogue lines for re-synthesis on Rig 1, recalculating exposure sheet frame counts, and re-compositing Remotion sequences. Unaffected scenes featuring clean characters remain untouched, preserving deterministic parity while bounding compute costs across the studio fleet.

---

*User prompt: take a look at the start of this conversation and summarize for 3000 words all the most important parts until the last response and add any additional information you consider worthy on the Audio Microservice*

Response: The architectural progression of the generative production pipeline centers on an uncompromising systems engineering principle: **semantic truth resides exclusively in an immutable relational ledger, while generative machine-learning models (large language models, neural speech synthesizers, and spatial-temporal video diffusion backends) are untrusted, headless execution workers with zero narrative, spatial, or temporal authority**. When generative models are granted state authority, character injuries vanish, physical laws collapse, conversational context windows degrade, character secrets leak into dialogue, and multi-episode continuity suffers catastrophic failure.

To prevent these systemic failure modes, media production is structured as a deterministic compiler problem. The pipeline compiles abstract narrative axioms into machine-readable intermediate representations, quantizes continuous physical sound into discrete temporal timelines, drives isolated GPU rendering spokes, and seals completed media deliverables into content-addressed, auditable historical packages.

### **1\. Epistemological Foundations & The Pruning of Engineering Fiction**

The system architecture evolved through a critical reckoning with its own design history. Initial iterations accumulated elaborate, speculative structures: 23-pod organizational hierarchies, complex Merkle DAG reconcilers, distributed Byzantine consensus protocols, and speculative multi-agent negotiation frameworks. Direct adversarial scrutiny revealed that these mechanisms were "engineering fiction"—abstract technical facades masking the reality that the pipeline had not yet processed an empirical end-to-end production run against live GPU memory boundaries, real network latency, or physical artist review cycles.

            THE COLLAPSE OF GENERATIVE STATE AUTHORITY  
              
   ┌────────────────────────────────────────────────────────┐  
   │ PROBABILISTIC FOUNDATION (Untrusted State Holder)      │  
   │  • LLMs hallucinate facts across context windows       │  
   │  • Diffusion models warp anatomy and wardrobe          │  
   │  • Speech engines introduce non-deterministic jitter   │  
   │  • Failure Mode: Catastrophic Continuity Collapse      │  
   └───────────────────────────┬────────────────────────────┘  
                               │ Inversion of Authority  
                               ▼  
   ┌────────────────────────────────────────────────────────┐  
   │ DETERMINISTIC CONTROL PLANE (Authoritative Reality)    │  
   │  • Immutable relational ledger stores canonical truth  │  
   │  • State transitions calculated via discrete reducers  │  
   │  • Models demoted to subordinate execution workers     │  
   │  • Outcome: Bit-stable, reproducible media compilation │  
   └────────────────────────────────────────────────────────┘

Stripped of speculative scaffolding, the architecture crystallized into the **Cartesian separation of Axis A (Semantic Truth & Meaning) and Axis B (Artifact Hardening & Representation)**:

> * **Axis A (The Semantic Domain):** Encompasses canonical narrative axioms, character somatic vectors (anatomical conditions and physical injuries), logistical inventories, and epistemic boundaries (who knows what at what exact historical tick). Axis A is completely blind to pixels, framerates, and audio sample rates.  
> * **Axis B (The Media Representation Domain):** Converts semantic state into physical deliverables. Media representations (whether 2D Remotion viewports, 48 kHz .wav dialogue stems, or Wan 2.2 diffusion plates) are unidirectional projections of state. Media is never state: if an optical compositor or video model is replaced, the underlying narrative truth remains unchanged.  
> * **The Minimal Validated Core:** A flat relational ledger of narrative facts, a table of scenes with pinned dependencies on those facts, and a deterministic query that invalidates downstream media (is\_dirty \= 1\) whenever an upstream fact mutates.  
> * **The Fail-Fast Economic QA Hierarchy (*T*0​→*T*5​):** Because rendering costs scale exponentially rather than linearly, defects must be caught at the earliest possible stage:  
>   Cost(*t*)=*i*\=0∑5​Δ*Ci*​⋅1{*t*≥*Ti*​}​  
>   Catching a somatic contradiction (such as a character with a severed arm attempting a two-handed task) at the in-memory AST gate (*T*0​) costs exactly **\$0.00**. Allowing that defect to reach cloud GPU diffusion (*T*3​) or broadcast delivery (*T*5​) results in severe compute waste and permanent canon corruption.

### **2\. Execution Topology & Physical Hardware Demarcation**

To eliminate multi-tenant memory thrashing and process collisions, the physical execution infrastructure enforces strict hardware boundaries across distributed nodes:

┌────────────────────────────────────────────────────────────────────────┐  
│ RIG 1: HOST CONDUCTOR & ACOUSTIC HOST (CPU / System RAM Bound)         │  
├────────────────────────────────────────────────────────────────────────┤  
│ • Pipeline Conductor: worker-sower-conductor (produceEpisode.ts)       │  
│ • Vocal Synthesis: audio-microservice (FastAPI on Port 8000\)           │  
│ • Audio Inspection: Asynchronous POSIX ffprobe child processes         │  
│ • Optical Compositing: @remotion/renderer (--gl=swangle, \--concurrency=1│  
│ • Compute Profile: Multi-core CPU threads, 64 GB System RAM            │  
│ • Hardware Boundary: EXACTLY 0 MB Dedicated GPU VRAM                   │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │ Outbound WSS / cloudflared Tunnel  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ CLOUDFLARE EDGE PLANE: edge-director (System Middleware POD-12)        │  
├────────────────────────────────────────────────────────────────────────┤  
│ • Ingress Router: Hono gateway validating HMAC-SHA256 signatures       │  
│ • Concurrency Mutex: ShotCoordinatorDO (Durable Object FIFO Queue)     │  
│ • Network Architecture: WebSocket Hibernation API (\$0.00 idle cost)    │  
│ • Lease Management: 30-second heartbeats & monotonic epoch tokens      │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │ Outbound Polling / Tunnel  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ RIG 2: GPU TENSOR FOUNDRY: media-broker (Port 3000\)                    │  
├────────────────────────────────────────────────────────────────────────┤  
│ • Workstation Hardware: Isolated NVIDIA RTX GPU (24 GB VRAM Pool)      │  
│ • Process Controller: media-broker binding POSIX /var/lock/rig2 mutex  │  
│ • Local Inference Daemon: Headless ComfyUI instance (Port 8188\)        │  
│ • Tensor Allocation: 100% of VRAM dedicated to Wan 2.2 Video Diffusion │  
│ • Hardware Invariant: ZERO Audio Synthesis / ZERO Chromium Processes   │  
│ • Media Egress: Streams uncomposited \#00FF00 plates to Cloudflare R2   │  
└────────────────────────────────────────────────────────────────────────┘

#### **Hardware Isolation Rules**

> 1. **Quarantine of Video Silicon:** High-resolution spatial-temporal video diffusion (Wan 2.2 with character LoRAs) requires 16 GB to 22 GB of scratchpad VRAM. audio-microservice is strictly banned from Rig 2's primary GPU during production passes to prevent CUDA Out-of-Memory (OOM) aborts.  
> 2. **Headless Chromium Isolation:** Executing Remotion headless browser rendering alongside PyTorch diffusion models triggers OpenGL context loss, severe memory thrashing, and Linux kernel OOM kills. Optical compositing is quarantined to Rig 1, where Chromium is forced to rasterize inside system RAM via SwiftShader software OpenGL (--gl=swangle) with concurrency clamped to \--concurrency=1.  
> 3. **Turn-Based VRAM Eviction (Single-GPU Fallback):** On local workstations where text generation, audio synthesis, and video diffusion share a single GPU card, the orchestrator enforces serialized turns separated by memory flushes. Prior to audio synthesis, the conductor issues a synchronous HTTP POST request to ComfyUI's memory management route:  
>    curl \-X POST http://127.0.0.1:8188/free \\  
>      \-H "Content-Type: application/json" \\  
>      \-d '{"unload\_models": true, "free\_memory": true}'

This unbinds active text model pointers and purges PyTorch's caching allocator, releasing up to 14.2 GB of VRAM in approximately 300 ms. 4\. **The 25-Shot Process Recycling Governor:** Cycling between variable-token text models, 1D audio sample arrays, and massive 5D spatio-temporal video latents (\[*B*,*C*,*T*,*H*,*W*\]) induces severe virtual memory fragmentation. The media-broker daemon automatically recycles the headless ComfyUI process every 25 shots, allowing the operating system kernel to clean up unmapped CUDA contexts.

### **3\. The Intermediate Representation (dialogue\_ast.json) & Ingress Contracts**

Screenplay text written in .fountain files or narrative prose is treated as an ephemeral human presentation view. The sole machine contract governing downstream production is the Abstract Syntax Tree (dialogue\_ast.json), compiled by worker-sower-engine and validated at runtime on Rig 1 by worker-sower-conductor.

               worker-sower-engine (Edge DO / LLM Drafter)  
                                  │  
                                  ▼ Compiles drafts/dialogue\_ast.json  
┌────────────────────────────────────────────────────────────────────────┐  
│ RIG 1 INGRESS STRUCTURAL FIREWALL (worker-sower-conductor)             │  
├────────────────────────────────────────────────────────────────────────┤  
│ 1\. Schema Validation: Strict Zod parsing (.strict(), no extra keys)    │  
│ 2\. Parity Linter: Normalized(Fountain.text) \=== Normalized(AST.text)   │  
│ 3\. Zero-Byte Trap: Binary hash \!= e3b0c442... (\> 1,024 Bytes)          │  
│ 4\. Somatic Feasibility: ArmsRequired \<= ArmsAvailable                  │  
│ 5\. Kinetic Exclusion: motor\_actions ∩ banned\_kinetic\_verbs \== ∅        │  
│ 6\. Vocal Feasibility: has\_verbal \=\> "mute" ∉ conditions                │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Structurally Certified AST  
                                   ▼ Dispatched to Audio Microservice (:8000)

#### **The Machine Rail vs. Voice Rail Dichotomy**

The AST resolves the failure mode of natural language prompting by maintaining two parallel representations:

> * **The Machine Rail:** Encodes structured, machine-validated properties: discrete character identifiers, typed reaction cues, integer frame counts, and motor arrays. Runtimes evaluate state via *O*(1) set-intersection operations without performing runtime natural language parsing.  
> * **The Voice Rail:** Houses qualitative dramatic intent: the tension between *Surface Wants* (what characters claim they want) and *The Underneath* (repressed shame, guilt, and existential subtext). Subtext guides prompt generation during writing passes but is never parsed for timeline calculation.

#### **Pre-Flight Invariant Checking & Ingress Contracts**

Before any HTTP socket is opened to audio-microservice, the AST passes through a sequence of compile-time linters (*T*0​\=\$0.00):

> 1. **Verbatim Parity Enforcement (assertVerbatimParity):** Asserts character-for-character equality between the human-facing script and the AST dialogue\_text string. If an editor changes dialogue in the .fountain file without re-compiling the AST, the pipeline halts immediately, preventing audio-to-script drift.  
> 2. **Somatic Capability Resource Arithmetic:** Upper-limb saturation is evaluated as an integer conservation inequality:  
>    ArmsRequired(EquipState)≤ArmsAvailable(Entity)  
>    If The Pilot (char\_020\_the\_pilot), whose right brachial plexus is severed (ArmsAvailable=1.0), is scripted to hold a brass siphon nozzle (occupies\_hands: 1\) and a flashlight (occupies\_hands: 1\) simultaneously, the compiler halts with HAND\_CAPACITY\_BREACH.  
> 3. **Kinetic Set-Intersection Gating:** Actions are checked against the character's somatic movement mask:  
>    motor\_actions∩banned\_kinetic\_verbs=∅  
>    Characters with severe lumbar compression or neuropathy cannot sprint, vault, or leap; violations abort the build before dispatching audio or visual jobs.  
> 4. **Vocal-Motor Feasibility Implication:**  
>    *c*.has\_verbal\_directives⟹"mute"∈/*c*.conditions∧"speak"∈/*c*.banned\_kinetic\_verbs  
>    An entity with crushed laryngeal cartilage or a severed trachea is barred from speaking lines, throwing a fatal VOCAL\_DELIVERY\_BREACH.  
> 5. **Epistemic Horizon Defense ("Ignorance by Omission"):** Characters are bounded by an epistemic\_vector containing their known\_secrets. Dialogue text is checked against an attenuation fence of banned lexical tokens; characters cannot disclose secrets or lore facts outside their subjective horizon.

### **4\. The Physical Master Clock & Temporal Quantization Math**

In conventional animation pipelines, visual keyframes dictate the timeline while sound editors stretch or cut audio to fit visual scenes. In an automated generative stack, this inverted dependency causes severe synchronization errors, rubbery mouth movements, and unnatural pauses. The governing law of the pipeline establishes that **audio is the architect of physical time; picture is an integer projection mapped to audio duration**.

AUDIO DOMAIN (Sample-Accurate Timebase Clock: 48,000 samples/sec)  
│  
├── Speech Synthesis: Local TTS microservice (:8000) emits 48 kHz PCM WAV  
└── Empirical Duration: D\_ms \= 3,120.00 ms (measured via POSIX ffprobe)  
│  
▼ Pure Integer Ceiling Derivation: ceil((3120 / 1000\) \* 24\) \= 75 frames (3,125.00 ms)  
VIDEO DOMAIN (Discrete Video Clock: 24 frames/sec)  
│  
├── Track 1: Mounted at absolute integer frame offset (\<Sequence from={atFrame} /\>)  
├── Track 2: Punctual Foley cues (Mulberry32 PRNG seeded via metadata)  
└── Track 3: Ambient Bed (Dynamic sidechain gain ducking: \-14 dB floor, 6f A / 12f R)  
│  
▼ ComfyUI Diffusion Conformance (3D Causal VAE 4n \+ 1 Temporal Lattice)  
└── WAN 2.2 Latent Allocation: n \= 19 ──► 4(19) \+ 1 \= 77 native frames  
    Remotion optical compositor trims 2 frames of tail slack, locking 75 master frames

#### **The Dual-Domain Multi-Resolution Clock Formulation**

> * **Continuous Audio Timebase (48 kHz):** Governs sample-accurate events at an invariant frequency of 48,000 integer samples per second, capturing transients, phoneme boundaries, and ducking envelopes without sub-frame phase issues.  
> * **Discrete Video Clock (24 fps):** Operates on discrete integer video frames, where each frame represents:  
>   Δ*t*frame​\=241​ s≈41.6667 ms  
> * **The Projection Factor:** The mathematical ratio bridging both domains resolves to an exact integer factor:  
>   24 frames/sec48,000 samples/sec​\=2,000 audio samples per video frame  
> * **Sample-to-Frame Coordinate Mapping:** An acoustic transient at sample index *S* maps to video frame *F*\=⌊*S*/2,000⌋. While visual cuts snap to Frame *F*, the audio stem plays back with 48 kHz sample precision, eliminating perceived lip-sync lag.

#### **Observation vs. Derivation Decoupling**

To ensure that changing distribution formats does not invalidate cached audio stems, the pipeline decouples empirical measurement from presentation derivation:

> * **Empirical Observation (*D*ms​):** The physical duration in milliseconds is extracted from the .wav file header via an asynchronous ffprobe child process:  
>   ffprobe \-v error \-show\_entries format=duration \-of default=noprint\_wrappers=1:nokey=1 stem.wav

> * **Discrete Frame Derivation (target\_frames):** Evaluated using pure integer ceiling arithmetic at 24 fps to eliminate floating-point representation drift across operating systems:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉\=⌊1000(*D*ms​×24)+999​⌋  
>   *Worked Example:* An audio stem measuring *D*ms​\=3,120.00 ms resolves to:  
>   ⌊1000(3120×24)+999​⌋\=⌊100074880+999​⌋\=75 frames  
>   The resulting 5.00 ms delta (0.12 frames) represents tail slack, which is absorbed into natural room decay padding, preventing speech from cutting abruptly on visual edits.  
> * **Sub-Frame Zero-Length Interval Clamp:** Extremely short interjections (*D*ms​\<41.67 ms) are clamped to a minimum duration of 1 frame (41.67 ms) with digital silence padding:  
>   const targetFrames \= Math.max(1, Math.ceil((durationMs / 1000\) \* 24));

This prevents zero- or negative-length timeline intervals that would crash Remotion's layout engine.

#### **Cumulative Millisecond Anti-Drift Formulation**

Concatenating rounded per-shot frame budgets end-to-end (∑⌈*Di*​×24⌉) compounds fractional tail rounding errors. Across an 80-to-100 shot episode, this introduces up to **4.17 seconds** of cumulative sync drift against continuous background beds and visual cut boundaries.

To eliminate drift, master timeline placement is derived from a running cumulative millisecond sum quantized once:

StartFrame*k*​\=⌈1000∑*i*\=1*k*−1​*Di*​​×24⌉,EndFrame*k*​\=⌈1000∑*i*\=1*k*​*Di*​​×24⌉−1

Evaluating the contiguous boundary:

StartFrame*k*\+1​−EndFrame*k*​\=⌈1000∑*i*\=1*k*​*Di*​​×24⌉−(⌈1000∑*i*\=1*k*​*Di*​​×24⌉−1)\=1

Because EndFrame*k*​\+1≡StartFrame*k*\+1​, consecutive shots tile the timeline with zero gaps and zero overlaps. Total cumulative drift relative to true elapsed audio time is mathematically bounded to less than one frame (\<41.67 ms) across an entire episode.

#### **3D Causal VAE Latent Lattices (4*n*\+1)**

Spatial-temporal video diffusion models (e.g., Wan 2.1, Wan 2.2) utilize 3D causal Variational Autoencoders that enforce temporal downsampling constraints. Frame allocations must satisfy a discrete 4*n*\+1 mathematical sequence (17,21,25,33,49,65,77,81,…):

Framesdiffusion​\=4×⌈4Framesdelivery​−1​⌉\+1

> * *Model Adapter Boundary:* For a 75-frame delivery budget, the adapter calculates:  
>   *n*\=⌈475−1​⌉\=19⟹4(19)+1=77 native frames  
> * *Tail Slack Trimming:* Rig 2 renders 77 frames of uncomposited green-screen plate. During optical assembly in Episode\_XXX.tsx, Remotion mounts the plate with durationInFrames={75} and trims the 2 excess padding frames via trimEndFrames={2}, locking the composite to audio time.

### **5\. The Audio Microservice: Architecture, Daemon Mechanics & Multi-Engine Multiplexing**

audio-microservice functions as the local speech synthesis daemon, hardware-isolated acoustic runtime, and master temporal authority within the studio fleet. Operating as an untrusted generative spoke, it receives validated screenplay AST payloads from worker-sower-conductor and synthesizes abstract text into uncompressed physical audio waveforms.

audio-microservice/  
├── voices/  
│   ├── under-the-floorboards/         \# Namespace: Goblin Universe  
│   │   ├── active/  
│   │   │   └── bog.wav                \# Symlink \-\> versions/bog\_v2.wav  
│   │   ├── versions/  
│   │   │   ├── bog\_v1.wav             \# Baseline take (immutable Class 3 asset)  
│   │   │   └── bog\_v2.wav             \# Superseded take (preserved for audits)  
│   │   ├── lexicon.json               \# Dialect G2P & phoneme stress rules  
│   │   └── voice\_manifest.json        \# Cryptographic hashes, actor IDs, recipes  
│   │  
│   ├── wiregrass-basin/               \# Namespace: Southern Gothic Noir  
│   │   ├── active/  
│   │   │   └── the\_pilot.wav          \# Symlink \-\> versions/the\_pilot\_v3.wav  
│   │   ├── versions/  
│   │   │   ├── the\_pilot\_v1.wav  
│   │   │   └── the\_pilot\_v3.wav  
│   │   ├── lexicon.json               \# Industrial terminology & dialect overrides  
│   │   └── voice\_manifest.json  
│   └── CHANGELOG.md                   \# Human-readable authoring justifications  
├── engines/                           \# Polymorphic BaseTTSEngine wrappers  
│   ├── piper\_engine.py                \# Piper-ONNX (Pure CPU / Ultra-fast)  
│   ├── cosyvoice\_engine.py            \# CosyVoice-300M (Flow Matching Diffusion)  
│   ├── parler\_engine.py               \# Parler-TTS (Natural language prompt conditioned)  
│   └── kokoro\_engine.py               \# Kokoro-82M (Compact Style-TTS2)  
└── server.py                          \# FastAPI application listening on port 8000

#### **Daemon Architecture & Lifecycle Hygiene**

> * **Persistent Memory Residency:** The service runs as a persistent Python FastAPI web daemon bound to local port 8000 (\[http://127.0.0.1:8000\](http://127.0.0.1:8000)) on Rig 1\. It keeps neural model weights and reference voice embeddings warm in system RAM, avoiding per-line cold-boot latency.  
> * **Resource Ceiling & LRU Cache:** Memory consumption is capped at **8.0 GB RAM**. The daemon maintains a maximum of three resident engines in memory (*N*max​\=3), evicting the least recently used engine via explicit engine.tear\_down() and garbage collection (gc.collect()) calls when a new engine is requested.  
> * **Single-Threaded Synthesis Mutex:** To prevent CPU thread contention from causing non-deterministic execution timing or duration jitter, the microservice serializes synthesis through an asynchronous queue lock (asyncio.Lock()). Only one speech inference executes at any given millisecond, ensuring duration measurements remain stable across identical seeds.

#### **Storage Hierarchy: The Two-Tier Pointer Architecture**

Character reference voices are treated as immutable production configuration:

> * **/voices/\<series\>/active/ (Floating Runtime Rail):** Contains standardized .wav files named after canonical character IDs (e.g., bog.wav). These files are filesystem symlinks pointing to specific tagged binaries in the versions directory. FastAPI inference routes consume this path directly, decoupling client contracts from version bumps.  
> * **/voices/\<series\>/versions/ (Append-Only Historical Vault):** Houses every iteration of every reference voice ever promoted (\${charId}\_v\${version}.wav). Files are content-addressed, SHA-256 hashed, and never mutated or deleted. Because older episodes were compiled against specific historical references, preserving superseded versions ensures legacy builds remain reconstructible without forced migration to newer vocal profiles.

#### **The Epistemological Triad of Voice Identity**

A character's vocal identity cannot be defined by an unversioned audio file or a generic prompt. It is codified as an irreducible triad of generative specifications:

> 1. **Model Checkpoint & Engine Adapter:** Pins the specific neural architecture, git release tag, and weights digest (weights\_sha256). This prevents "model drift," ensuring that upstream vendor updates do not silently alter vocal resonance or cadence.  
> 2. **Speaker Embedding & Conditioning Target:** Identifies the performer seed, reference file hash, or speaker vector embedding used to condition the vocoder latent space. Binds directly to performer licensing agreements (e.g., SAG-AFTRA digital voice likeness riders) managed by the Talent & Casting Pod (POD-04).  
> 3. **Baseline DSP Vector:** Declares the baseline physical transformations applied to the character's neutral delivery (fundamental frequency *F*0​, formant warping *W*, base breathiness Π, and vocal fry density Φ) before scene-level dramatic conditions are introduced.

#### **Conditioning Modalities**

audio-microservice multiplexes across four discrete conditioning mechanisms via its polymorphic engine interface:

| Conditioning Modality | Input Parameter | Target Engine | Hardware Profile | Dramaturgical Specialization |
| :---- | :---- | :---- | :---- | :---- |
| **ZERO\_SHOT\_CLONE** | Pinned .wav reference take | CosyVoice-300M / XTTSv2 | Heavy CPU / Auxiliary RAM; **\~2.8 GB RAM** | Grounded dramatic leads; deep laryngeal trauma, glottal fry, rich gravelly bass (wiregrass-basin). |
| **SPEAKER\_ID** | Discrete integer speaker index | Piper-ONNX | Pure multi-thread CPU; **\~80 MB RAM**; RTF≤0.08× | Frantic slapstick comedy, extreme upward pitch shifting, rapid staccato cadence (under-the-floorboards). |
| **DESCRIPTION\_PROMPT** | Natural language descriptive text | Parler-TTS | PyTorch OpenVINO / CPU; **\~1.2 GB RAM**; RTF≈0.65× | Nuanced prosodic modulation, whispered subtext, explicit acoustic space control (goblin-social-satire). |
| **SPEAKER\_VECTOR** | Precomputed style tensor (.pt) | Kokoro-82M | Pure CPU WebAssembly/Native; **\~350 MB RAM**; RTF≤0.12× | Synthetic non-biological telemetry, shipboard computers, radio loops (deep-space-salvage). |

#### **Pronunciation Dictionaries (lexicon.json) & The Dialect Defense**

Neural TTS models frequently mispronounce invented fantasy terms, regional slang, or technical jargon. Furthermore, writing heavy phonetic contractions directly into screenplay text creates serious safety hazards: cloud language models and automated safety filters often flag contracted phonetic spellings as offensive profanity or slurs.

The architecture resolves this by separating **Screenplay AST Grammar** from **Synthesized Acoustic Delivery**:

> 1. The screenplay AST maintains grammatically clean English (*"Do you hear what they are saying in the culvert?"*).  
> 2. Prior to neural synthesis, audio-microservice executes a series-local Grapheme-to-Phoneme (G2P) pass using voices/\<series\>/lexicon.json.  
> 3. Pre-compiled regex patterns transform dialect elisions (*"Do you"* → *"dee-yoo"*), while lexical token dictionaries override proper nouns (*"culvert"* → "KULL-vert", *"siphon"* → "SAI-fun", *"Gallbreaker"* → "GAWL-bray-ker").  
> 4. The neural engine receives phonetically unambiguous inputs, delivering authentic regional accents while keeping upstream databases clean and compliant.

### **6\. Somatic DSP Mapping, Biological Trauma & The Audio Recipe Book**

Narrative trauma logged in the canonical relational ledger translates deterministically into acoustic digital signal processing parameters:

CANONICAL STATE LEDGER (Cloudflare D1 / SQLite)  
├─ Baseline Voice Recipe (voice\_manifest.json)  
└─ Somatic Vector: Active conditions, severities \[0.0, 1.0\], basis-point meters  
                          │  
                          ▼ Algebraic Composition Channel  
DYNAMIC INGRESS DISPATCH (ttsClient.ts ──► POST :8000/generate)  
├─ tonePacing:                  0.75   (Conversational tempo deceleration)  
├─ pause\_frequency\_multiplier:  1.40   (Pulmonary clause fragmentation)  
├─ breathinessPauseMultiplier:  2.20   (Respiratory aspiration gaps)  
├─ vocalFryDensity:             0.60   (Subharmonic rattle at line tails)  
└─ basePitchShiftSemitones:     \-2.50   (Fundamental F0 chest-drone drop)  
                          │  
                          ▼  
audio-microservice (Pure CPU / System RAM on Port 8000\)  
                          │  
                          ▼ Linear 48 kHz PCM WAV Stem  
duration\_ms \= 4,280 ms ──► target\_frames \= ceil((4280 / 1000\) \* 24\) \= 103 frames

#### **Somatic-to-Acoustic Parameter Mapping**

> * **Pulmonary Fibrosis & Gas Inhalation Damage:**  
  * *Injected DSP:* breathinessPauseMultiplier: 2.2, pause\_frequency\_multiplier: 1.4.  
  * *Acoustic Impact:* Biological lung capacity caps maximum phrase duration. The vocoder injects micro-silences and forces sentences to terminate abruptly on unvoiced plosives or hard consonants. Spoken dialogue is broken into breathless, fragmented clauses.  
> * **Severe Hypothermia & Physiological Shock:**  
  * *Injected DSP:* basePitchShiftSemitones: \+2.5, vocalFryDensity: 0.8.  
  * *Acoustic Impact:* Autonomic hyperarousal elevates fundamental frequency (*F*0​) by \+2.5 semitones. High vocal fry density (0.8) injects glottal instability and shivering micro-flutter, capturing irregular subglottal pressure.  
> * **Crushed Laryngeal Cartilage & Blunt Neck Trauma:**  
  * *Injected DSP:* formantWarpingFactor: 0.7, basePitchShiftSemitones: \-4.0.  
  * *Acoustic Impact:* Structural collapse of the larynx constricts the pharyngeal cavity. Compressing formants down to 0.7 while dropping fundamental pitch by −4.0 semitones produces deep acoustic formant scooping, dark pharyngeal damping, and muffled guttural tones.  
> * **Spinal Vertebral Compression & Peripheral Neuropathy (The Pilot / char\_020\_the\_pilot):**  
  * *Injected DSP:* basePitchShiftSemitones: \-2.5, speed\_multiplier: 0.85, pause\_frequency\_multiplier: 1.4.  
  * *Acoustic Impact:* Lower back nerve compression (L4–L5) and diaphragmatic fatigue slow speaking tempo by 15%, shift fundamental pitch downward into an exhausted chest drone, and dilate inter-clause pauses by 40%.

#### **Algebraic Composition Equations**

Dynamic scene modifiers compose algebraically with the character's baseline profile registered in voice\_manifest.json:

*F*0, eff​\=basePitchShiftSemitones+ΔPitchscene​  
*W*eff​\=formantWarpingFactor×ΔFormantscene​  
*P*eff​\=speedScalar×tonePacingscene​  
Πeff​\=baseBreathiness×pause\_multiplierscene​  
Φeff​\=clamp(baseVocalFry+ΔFryscene​,0.0,1.0)

#### **The Unified Pressure Meter Engine & Basis-Point Dynamics**

Somatic modifiers are driven by the simulation's Unified Pressure Meter Engine, which tracks stress and physical trauma as integer basis points (0 to 10,000 bp):

> * **Domain Decoupling Invariant:** The engine isolates four parallel thermodynamic tracks: SOMATIC\_FATIGUE, PHYSICAL\_PAIN, REFUSAL\_STRAIN, and PARANOIA\_CLOCK. Physical exhaustion is decoupled from moral refusal: a character carrying 9,000 bp in SOMATIC\_FATIGUE will experience labored breathing pauses, but their moral resistance remains firm unless breached via an authored threshold bridge.  
> * **The Post-Break State Mutation:** When currentValueBp \>= thresholdLimitBp, the meter does not reset. The character trips an irreversible state mutation in Cloudflare D1 (e.g., Bog's refusal collapsing into SUBSERVIENT\_DESPERATION), permanently altering baseline recipe fry and lifting verbal attenuation fences across all future episodes.

#### **The Audio Recipe Book Contract (POD-05 Section 5.2)**

To eliminate the defect where synthesized audio exists without the instructions required to reproduce it, every voice profile mandates three core fields:

> 1. **TTS Model Used:** The explicit model architecture, git release commit, and quantization format (e.g., CosyVoice-300M, Parler-TTS v0.1, Piper-ONNX).  
> 2. **Voice Clone / Speaker ID:** The unique performer seed, reference file hash, or speaker vector embedding linked directly to performer consent riders (e.g., SAG-AFTRA-VOX-2026-0089). Governed by the invariant: *locked voice consistency over per-scene optimization*—the Audio Pod reuses approved reference takes across all scenes rather than re-tuning seeds on a per-scene basis.  
> 3. **Pacing / Pitch Modifiers:** Standard baseline transformations defining the neutral character anatomy (e.g., \-15% speed, \+5% breathiness for Branksi; gravelly drawl parameters for Billie Fae).

### **7\. Programmatic Gain Automation, Swain MRUs & Multi-Track Mixing**

Once verified speech stems are written to disk, multi-track mixing is executed deterministically in code inside AmbientTrack.tsx, bypassing manual Digital Audio Workstation (DAW) editing:

Track 1: Spoken Dialogue Stems (Fixed Master Clock via ffprobe)  
         \[ Pre-Roll: Silent (18f) \] \[--- Active Dialogue Stem (75f) \---\] \[ Post-Roll (8f) \]  
Track 2: Spot Foley Transients (Seeded Mulberry32 PRNG)  
                \[\*valve\_scrape\*\]                                   \[\*mud\_boot\_squelch\*\]  
Track 3: Continuous Ambient Bed & Music (Programmatic Gain Automation)  
1.0 ────┐                                                         ┌────────┐  
        │                                                         │        │  
0.08    └─────────────────────────────────────────────────────────┘        └────────────  
          ^ Attack (6 frames)                Release (12 frames) ^  
          Speech Ducking Floor: \-14 dB (Gain Multiplier \= 0.0798)

#### **Programmatic Gain Automation Math (AmbientTrack.tsx)**

Vocal intelligibility is enforced via programmatic gain envelopes evaluated inside Remotion composition TSX:

> * **Speech Window Ducking:** When Track 1 dialogue begins (*f*start​\=*T*start​\+*F*pre​), Track 3 ambient beds and music attenuate by **−14 dB**:  
>   Gainducked​\=1020−14 dB​×*V*base​≈0.1995×0.40≈0.0798  
> * **Attack & Release Geometry:** The bed dips over an authored 6-frame quadratic attack (*A*\=6, ≈250 ms) leading into speech and recovers over a 12-frame quadratic release (*R*\=12, ≈500 ms) during dialogue gaps.  
> * **The Multi-Window Minimum Reducer (Anti-Pumping Architecture):** Naive sidechain implementations that loop dialogue windows and break on the first match cause volume pumping during short inter-sentence pauses. If two spoken lines are separated by a 6-frame gap, the first window enters its release ramp while the second initiates its attack, causing background volume to swell up and dip abruptly. The engine computes gain envelopes across all active dialogue windows and applies Math.min(), ensuring that overlapping envelopes compose as a union and remain ducked across brief breath pauses.  
> * **Narrative \[BEAT\] Swells:** When the AST contains an explicit narrative pause line (\[BEAT\]), dialogue synthesis is bypassed. The ducking envelope releases, allowing atmospheric room tone or musical score to swell up to unity gain (*V*base​), sustaining across the silence and decaying 500 ms before dialogue resumes.

#### **Dwight Swain Motivation-Reaction Units (MRUs) & Pre-Roll Geometry**

The compiler enforces chronological storytelling order based on Dwight Swain's biological sequence: **Stimulus → Involuntary Visceral Reflex → Conscious Thought (Calculation) → Motor Action / Speech**.

> * **The Pre-Roll Buffer (reaction\_cue: VISCERAL\_STING):** When an emotional shock or physical turn occurs, the compiler injects an unvoiced visual pre-roll hold of **12 to 24 frames** (500 to 1000 ms) *before* mounting the synthesized .wav speech stem. Dialogue never begins on frame 0 of an emotional turn.  
> * **Optical Choreography:** During the pre-roll window, the camera executes a programmatic push-in (1.0×→1.03×) centered on the character's facial centroid (crash\_zoom\_target) while Track 1 remains silent, letting room tone or sudden Foley hits (e.g., an iron pipe dropping) punctuate the visual shock.  
> * **Decoupled Timeline Geometry:** In exposure\_sheet.json, pre-roll frames (*F*pre​) and post-roll decay frames (*F*post​) are stored separately from raw audio frames (*F*raw​):  
>   total\_shot\_frames*i*​\=*F*pre(*i*)​\+*F*raw(*i*)​\+*F*post(*i*)​  
>   This allows directors to adjust reaction holds without invalidating cached speech stems.

#### **Deterministic Foley Synthesis & Mulberry32 Seeding**

Spot Foley cues (e.g., ITEM\_BRASS\_NOZZLE → foley/brass\_valve\_scrape\_01.wav) are resolved deterministically at generation time:

> * **PRNG Seeding:** Resolved using a deterministic Mulberry32 PRNG seeded via a 32-bit MurmurHash3 string hash:  
>   Seed=MurmurHash3(sceneId+":"+shotId+":"+sampleKey)  
> * **Anti-Clustering Salt:** If the PRNG draws a variant matching the immediately preceding beat, an anti-clustering salt (:retry) is appended to the seed to force a re-roll, avoiding acoustic repetition across cuts.  
> * **Source-Baking:** Resolved asset paths are written as static literals into generated Remotion TSX props (src={staticFile("audio/foley/valve\_02.wav")}), eliminating runtime randomness during headless rendering.

### **8\. Quality Assurance Gauntlets, Immutability & Provenance Architecture**

Synthesized .wav dialogue stems are treated as **Class 3 Archive-Dependent Evidence**: because neural vocoders rely on non-deterministic floating-point math across disparate GPU/CPU kernels, a voice track cannot be regenerated bit-for-bit from prompt seeds alone. Once synthesized and verified, audio stems are sealed as immutable artifacts in public/audio/dialogue/ and are strictly forbidden from being re-called during visual compositing.

RAW TTS BUFFER (48 kHz / 24-bit WAV from Port 8000\)  
       │  
       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 1: SPEECH-TO-TEXT (STT) ALIGNMENT GATE                          │  
│ • Transcribes synthesized waveform via local STT pass                  │  
│ • Asserts character parity against dialogue\_ast.json                   │  
│ • Rejects hallucinated phonemes, dropped words, or stuttering          │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Pass (Zero Discrepancy)  
                                   ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 2: PRE-CONFORM SPECTRAL HYGIENE                                 │  
│ • 24 dB/octave high-pass filter below 80–100 Hz (DC / rumble strip)    │  
│ • Optical de-esser targeting sibilance in the 6 kHz to 8 kHz band      │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Pass (Clean Spectrum)  
                                   ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 3: TWO-PASS EBU R128 LOUDNORM (FFmpeg)                          │  
│ • Conforms dialogue to integrated \-16.0 LUFS (±1.0 LUFS) Web target    │  
│ • Linear normalization pass using measured JSON statistics             │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Pass (Target Conformed)  
                                   ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 4: BRICKWALL TRUE-PEAK LIMITER                                  │  
│ • Inter-sample peak clamping strictly in dBTP (≤ \-1.0 dBTP ceiling)    │  
│ • Sample peak (dBFS) is decoupled and disregarded for clipping safety  │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Pass (No Inter-Sample Overs)  
                                   ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 5: NOISE FLOOR GATE & LATENT STABILITY CERTIFICATION            │  
│ • Asserts unvoiced pause RMS remains strictly below \-60 dBFS           │  
│ • Cosine similarity check between reference and synthesized embeddings │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Pass (Exit Code 0\)  
                                   ▼  
      Committed to public/audio/dialogue/\${sceneId}\_SH\${shotIndex}.wav

#### **The Five Sequential Conformance Filters**

> 1. **Speech-to-Text (STT) Verbatim Alignment Gate:** Transcribes the generated waveform via an automated local STT inference pass, comparing the result against dialogue\_text. Any dropped tokens, mispronounced technical terms, or model hallucinations halt execution immediately (STT\_ALIGNMENT\_BREACH).  
> 2. **Pre-Conform Spectral Hygiene:** A 24 dB/octave Butterworth high-pass filter cuts infrasonic frequencies below **80 Hz to 100 Hz**, removing microphone diaphragm thumps and workstation chassis fan rumble. A dynamic optical de-esser compresses harsh sibilance in the **6 kHz to 8 kHz** band, preventing digital clipping during delivery encoding.  
> 3. **Two-Pass EBU R128 Loudness Normalization:** Dialogue compliance is an empirical property of the conformed mix, not an assumption derived from sidechain ducking depth. The conductor runs a headless two-pass FFmpeg loudnorm filter sequence:  
>    \# Pass 1: Measure integrated loudness, LRA, and true peak  
>    ffmpeg \-i raw\_stem.wav \-af loudnorm=I=-16:TP=-1.0:LRA=11:print\_format=json \-f null \-  
>    \# Pass 2: Apply linear normalization targeting exactly \-16.0 LUFS  
>    ffmpeg \-i raw\_stem.wav \-af loudnorm=I=-16:TP=-1.0:LRA=11:measured\_I=-19.2:measured\_TP=-0.4:linear=true conformed.wav

Master stems hit integrated targets of **−16.0 LUFS** (±1.0 LUFS) for web streaming or **−24.0 LKFS** (±1.0 LKFS) for linear broadcast. 4\. **Brickwall True-Peak Limiter:** Digital-to-analog reconstruction in consumer playback devices frequently creates inter-sample peaks that clip even when digital sample peaks register below 0 dBFS. The limiter measures and clamps peaks exclusively in True-Peak units, locking the ceiling to **≤−1.0 dBTP** (or **−2.0 dBTP** for broadcast). 5\. **Noise Floor Certification:** Dialogue stems must maintain an unvoiced RMS baseline below **−60 dBFS**. This prevents background microphone hiss from surging into audibility when downstream sidechain gain envelopes recover from −14 dB back to unity.

#### **The Three-Class Error Taxonomy & Escalation Routing**

When a defect is intercepted, the system routes the failure through an unambiguous taxonomy:

> * **Deterministic Failures:** Zod schema validation errors, script verbatim parity mismatches, or somatic capability contradictions (ArmsRequired\>ArmsAvailable). Processing halts immediately at *T*0​ (\$0.00 compute cost) with exit code 1; no retries are attempted because identical deterministic inputs produce identical failures.  
> * **Stochastic Failures:** Audible vocoder clicks, dropped phonemes, or subtle vocal fry collapse. A bounded retry loop permits up to **two retries** (*N*max​\=2) with an altered PRNG seed. If the failure persists across three cycles, a circuit breaker trips, freezing the branch and escalating a diagnostic ticket to the Showrunner.  
> * **Infrastructure Failures:** File lock contention, transient socket disconnects, or scratch disk write stalls. The runtime catches the error and resumes processing idempotently from the last verified, content-addressed buffer.

#### **Universal Provenance DAG (render\_manifest.json)**

Every delivered MP4 frame is anchored to an immutable Directed Acyclic Graph recorded in render\_manifest.json:

{  
  "build\_id": "sha256:4f8a1209bc87e5d...",  
  "episode\_id": "EP040",  
  "generated\_at": "2026-09-28T21:40:00Z",  
  "source\_target": "Episode\_040.tsx",  
  "upstream\_contracts": {  
    "dialogue\_ast\_hash": "sha256:12c8a994ef7b8c9d...",  
    "exposure\_sheet\_hash": "sha256:9c3e401b2a4d5e...",  
    "canon\_commit\_sha": "git:9c3e401",  
    "series\_config\_hash": "sha256:3b8f1a2c..."  
  },  
  "acoustic\_assets": {  
    "ep040\_sh01.wav": "sha256:4a8c9e2b10a5...",  
    "ep040\_sh02.wav": "sha256:9c1d8e3f4a7b..."  
  },  
  "runtime\_environment": {  
    "node\_version": "v20.12.0",  
    "remotion\_version": "4.0.140",  
    "ffmpeg\_build": "6.1.1-static"  
  }  
}

This provenance structure allows backward auditability: any delivered video frame can be traced back through its exposure sheet, audio stem SHA-256 digest, AST beat, somatic state transition, and originating Git commit.

Conversely, it enables precise forward blast radius calculations: if an actor's reference voice is updated in voice\_manifest.json, the compiler identifies only the specific dialogue lines invalidated by the update, re-synthesizing the dirty stems on Rig 1 while leaving unaffected scenes untouched.

By establishing audio-microservice as a warm, persistent, CPU-bound daemon on Rig 1, enforcing pure integer temporal quantization, translating biological trauma into somatic DSP matrices, and treating audio duration as the master clock for video diffusion, the pipeline provides a deterministic production architecture where creative expression operates within a mathematically locked causal skeleton.

---

