# **Overview : Worker-Sower-Conductor.00**

[https://gemini.google.com/app/848f5cae5d0d45dc](https://gemini.google.com/app/848f5cae5d0d45dc)

*User prompt: i am going to now need a complete and extensive overview of the \[worker-sower-conductor\] ; you should find all of the details related to this in the \[worker-sower-engine\]*

Response: The worker-sower-conductor serves as the pipeline conductor and local assembly host within the "Generative Production Pipeline". While its upstream sibling, the worker-sower-engine, resolves abstract narrative meaning and state at the edge, the conductor acts as the bridge that crosses into physical, time-based media. It operates exclusively on Rig 1, which is a dedicated CPU and system RAM workstation requiring zero GPU compute. By utilizing a full POSIX Node.js runtime, the conductor is capable of spawning necessary system child processes, such as ffprobe and remotion, which are strictly banned in the edge-native simulation core.

### **Core Responsibilities & System Boundaries**

The conductor translates abstract dialogue and narrative instructions into concrete media artifacts through the following operational domains:

> * **Audio Orchestration:** It sends HTTP POST requests to a local Python Text-To-Speech (TTS) microservice on port 8000 to synthesize and collect .wav speech stems.  
> * **Temporal Quantization:** It spawns an ffprobe child process to convert continuous sound durations into a locked temporal grid, calculating exact 24fps frame budgets using the formula target\_frames \= ceil(ms / 1000 \* 24).  
> * **Hardware Dispatch:** It compiles a SpokeExecutionPayload containing the locked frames and dispatches it over the network to the edge-director, which routes rendering jobs to the Rig 2 GPU foundry.  
> * **Optical Assembly:** It spawns the @remotion/renderer CLI subprocess using a software GL backend (gl: 'swangle') to pull green screen keys, composite layers, and render the final master MP4.  
> * **Git Staging & Canon Sealing:** It drains uncommitted staging memory deltas from the upstream Durable Object via HTTP, verifies the relational DAG, and executes signed Git commits to seal the historical ledger.

### **Target Repository Layout**

The worker-sower-conductor repository is specifically structured to manage I/O-heavy, binary-dependent execution layers:

> * **Root Configuration:** Includes package.json with dependencies like zod, ws, dotenv, and @remotion/renderer, alongside an .env.production file mapping the TTS service and Edge Director WebSocket URLs.  
> * **drafts/:** An ephemeral workspace containing the ingested dialogue\_ast.json contract emitted by the worker-sower-engine.  
> * **workflows/:** Houses ComfyUI JSON templates, such as wan\_greenscreen\_i2v.json and flux\_matte\_background.json, which receive injected frame counts.  
> * **src/audio/:** Contains ttsClient.ts for microservice calling and ffprobeQuantizer.ts for locking the 24fps frames.  
> * **src/dispatch/:** Contains payloadBuilder.ts to construct execution jobs and edgeDirectorClient.ts to manage heartbeat leases and WebSocket connections.  
> * **src/remotion/:** Manages character plate ingestion from Rig 2 via assetIngest.ts and optical compositing via renderSubprocess.ts.  
> * **src/git/:** Handles the local Git sync by pulling staging deltas with pullStaging.ts and committing them via gitSealer.ts.

### **The Conductor Lifecycle Contract**

The operational heartbeat of the conductor is the master assembly script, produceEpisode.ts, which executes a strict sequential lifecycle:

> 1. **AST Ingestion:** Reads and parses the validated dialogue\_ast.json to isolate spoken lines, speaker identities, and emotional tags.  
> 2. **Audio Synthesis:** Calls the local CPU microservice to generate speech stems for every dialogue line.  
> 3. **Temporal Quantization:** Processes the generated .wav files through ffprobe to lock the integer frame count for each shot.  
> 4. **Hardware Dispatch:** Sends the timing manifest and ComfyUI workflows to the edge-director to queue diffusion plate rendering on Rig 2\.  
> 5. **Optical Master Assembly:** Triggers the Remotion optical printer to ingest the completed plates and audio beds, rendering the final MP4 deliverable.  
> 6. **Canon Sealing:** Drains the uncommitted narrative ledger deltas from the edge and commits them locally to Git, ensuring the episode's events are permanently recorded.

---

*User prompt: {{FOCUS: Core Responsibilities & System Boundaries}} /extreme-details*

### **Response: Architectural Identity & System Boundaries**

The worker-sower-conductor (also referred to as goblin-conductor or "The Conductor") operates as the pipeline conductor and local assembly host, running exclusively on Rig 1\. Rig 1 is a dedicated CPU and system RAM workstation that requires zero GPU compute or VRAM. Adopting the worker-sower-conductor namespace establishes an explicit, paired pipeline division with its upstream counterpart, the worker-sower-engine. This division maintains a clean naming matrix by reserving goblin-\* for world-specific assets and dedicating worker-sower-\* exclusively to domain-agnostic generative pipeline infrastructure.

While the worker-sower-engine is an epistemological state machine that resolves narrative meaning, evaluates 2d6 duel math, and extracts dialogue ASTs at the edge, the worker-sower-conductor translates those abstract instructions into concrete, physical time-based media artifacts. To accomplish this, the conductor executes within a full POSIX Node.js runtime environment, breaking free from the 128 MB V8 isolate sandbox limits of the edge engine. This POSIX environment explicitly grants the conductor the boundary permission to spawn necessary system child processes—including ffprobe for audio analysis, @remotion/renderer for optical compositing, and git for ledger sealing.

### **Core Responsibilities & Output Contracts**

The worker-sower-conductor coordinates external subsystems without merging their responsibilities. It controls the production lifecycle through the following operational domains:

> * **Acoustic Synthesis & Master Clock Initialization:** The conductor treats generated audio as the non-negotiable master temporal clock. Before beginning synthesis, it issues an HTTP POST to \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) to flush text/speech models from the local GPU, ensuring VRAM headroom. It then parses the imported dialogue\_ast.json (which isolates speaker identities, emotional tags, and text) and dispatches HTTP POST requests to a local Python Text-To-Speech (TTS) microservice on port 8000 to generate uncompressed .wav stems. These stems undergo a strict acoustic loudness validation, targeting an integrated **\-16 LUFS** and a True-Peak ceiling of **\-1.0 dBTP**. Once synthesized, the .wav stems are saved locally to public/audio/dialogue/ as immutable artifacts. Rendering runtimes are strictly forbidden from re-calling the TTS service during compositing, which prevents sub-frame phase jitter.  
> * **Temporal Quantization (The Discrete Frame Math):** Continuous millisecond sound must be quantized into discrete video timelines. The conductor spawns an asynchronous ffprobe child process to read the exact sample length of each synthesized .wav buffer. It computes the exact 24 fps target frame budget using a non-negotiable ceiling formula: target\_frames=⌈(1000duration\_ms​)×24⌉.  
> * **Acoustic Geometry & Pacing Assembly:** The conductor assigns each audio stem an absolute starting integer frame index (fromFrame*k*​\=∑*i*\=1*k*−1​total\_shot\_frames*i*​) to prevent cumulative synchronization drift caused by Math.ceil rounding tails. It programmatically seeds Foley transients using a MurmurHash3 PRNG. For narrative \[BEAT\] nodes, it calculates an automated ducking envelope, dipping continuous ambient sound beds down to **\-14 dB** via a 6-frame quadratic attack during speech windows, and releasing them back to baseline over 12 frames during dialogue pauses.  
> * **Model Adapter Conformance:** Video diffusion models featuring 3D causal VAE architectures (like Wan 2.1/2.2) mandate temporal frame constraints governed by a 4*n*\+1 lattice. The conductor operates a backend adapter that evaluates the native generation rate (e.g., 16 fps), allocates the native diffusion lattice using diffusion\_allocation=4×⌈4*N*−1​⌉\+1, and eventually trims excess tail margin to resample the plate cleanly into the locked 24 fps master budget.  
> * **Hardware Dispatch & Edge Multiplexing:** The conductor compiles the frame counts, prompts, character LoRAs, and seeds into a SpokeExecutionPayload. It dispatches this payload over a WebSocket to the edge-director, which manages heartbeat leases and queues the job for the headless ComfyUI media-broker on Rig 2\.  
> * **Optical Master Assembly:** Once the \#00FF00 greenscreen plates are generated, the conductor triggers the @remotion/renderer CLI subprocess. It forces the compositor to use a software GL backend (gl: 'swangle') to pull the chroma keys and composite the final MP4 deliverable in system RAM, completely bypassing GPU drivers to prevent CUDA crashes or Linux OOM memory thrashing.  
> * **Git Staging & Canon Sealing:** The conductor executes an HTTP request to drain uncommitted staging deltas from the upstream SowerDO. It verifies the relational DAG locally and stamps a cryptographic SHA-256 commit into the local Git repository, sealing the historical ledger permanently.

### **Target Repository Layout (worker-sower-conductor)**

The repository structure is explicitly designed to isolate all I/O-heavy, binary-dependent execution layers from the core simulation engine:

> * **package.json & .env.production**: Defines strict runtime dependencies (zod, ws, dotenv, @remotion/renderer) alongside an .env matrix mapping RIG2\_HOST, the EDGE\_DIRECTOR\_WS\_URL, and the local TTS\_SERVICE\_URL.  
> * **drafts/**: Serves as the ephemeral staging workspace for the current cycle, housing the dialogue\_ast.json contract ingested from worker-sower-engine.  
> * **workflows/**: Stores ComfyUI API templates (wan\_greenscreen\_i2v.json and flux\_matte\_background.json) designed to receive dynamically injected target\_frames.  
> * **src/pipeline/produceEpisode.ts**: The master sequential lifecycle contract. It orchestrates AST ingestion, calls TTS, triggers the ffprobe quantizer, dispatches to the edge-director, triggers the Remotion renderer, and executes the Git ledger seal.  
> * **src/audio/**: Houses ttsClient.ts for managing HTTP POST operations against the Python microservice, and ffprobeQuantizer.ts for spawning the child process to lock integer frames.  
> * **src/dispatch/**: Contains payloadBuilder.ts to structure the SpokeExecutionPayload and edgeDirectorClient.ts to manage multiplexed WSS connections.  
> * **src/remotion/**: Manages the ingestion of rendered assets from Rig 2 (assetIngest.ts) and handles software GL compositing instructions (renderSubprocess.ts).  
> * **src/git/**: Hosts pullStaging.ts to drain the edge memory and gitSealer.ts to evaluate the relational DAG before signing local Git commits.

---

*User prompt: {{FOCUS: The Conductor Lifecycle Contract}} /expand-focus*

### **Response: The Conductor Lifecycle Contract: A Deep Dive**

The Conductor Lifecycle Contract governs the operations of worker-sower-conductor (the "Conductor") inside worker-sower-engine/src/pipeline/produceEpisode.ts. This contract is a five-stage (sometimes categorized as six-stage) deterministic assembly cycle that translates the epistemological reality established by the Sower engine into concrete, physical media assets. It acts as the immutable bridge between narrative truth and time-based video.

#### **1\. Ingestion & Dialogue Extraction**

The cycle begins when the Conductor receives the dialogue\_ast.json file from the upstream worker-sower-engine. This file is the primary source of truth, establishing what must be rendered.

> * **The Contract Payload:** The dialogue\_ast.json strictly defines lines of dialogue, speaker identities, internal emotional states, explicit physical motor actions, and subtext for each shot.  
> * **VRAM Preparation (The Flush):** Before any processing occurs, the Conductor must ensure there is sufficient hardware headroom. If local GPU resources on Rig 1 were utilized for preliminary drafting or local inference, the Conductor executes an HTTP POST request to a local ComfyUI endpoint (\[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free)). This instantly clears up to 14.2GB of models from VRAM in roughly 300 milliseconds, paving the way for vocal synthesis without Out-of-Memory (OOM) collisions.

#### **2\. Acoustic Synthesis (The Voice of the Canon)**

The Conductor treats audio generation as the unyielding physical clock for the entire pipeline. Without audio, there is no video timeline.

> * **Microservice Dispatch:** The Conductor loops over every line in the AST, dispatching HTTP POST requests to a local Python Text-To-Speech (TTS) microservice (e.g., CosyVoice or Parler-TTS) running on port 8000\.  
> * **Parameter Injection:** It injects specific vocal embeddings and DSP modifiers based on the character and scene constraints. For example, if a character has a respiratory injury logged in the state ledger, the Conductor will inject a pause\_frequency\_multiplier modifier to alter the breath pacing of the generated audio.  
> * **Artifact Generation:** The TTS engine returns raw, uncompressed .wav stems for every line of dialogue, saving them to public/audio/dialogue/.  
> * **Loudness Verification:** The pipeline demands strict acoustic compliance. Stems must pass a loudness gate targeting an integrated \-16 LUFS and a strict True-Peak ceiling of \-1.0 dBTP.

#### **3\. Temporal Quantization (The Discrete Frame Math)**

Because continuous sound operates in milliseconds and video timelines operate in discrete frames, the Conductor must resolve the physical duration of the audio into a mathematical frame budget.

> * **ffprobe Interrogation:** The Conductor spawns an asynchronous child process using ffprobe (ffprobe \-v error \-show\_entries format=duration ...) to read the exact, millisecond-accurate length of each synthesized .wav stem.  
> * **The Master 24fps Lock:** Using the extracted duration, the Conductor calculates the mandatory integer frame count using a strict ceiling formula: target\_frames=⌈(1000duration\_ms​)×24⌉. This effectively quantizes the continuous audio into a rigid 24fps grid, dictating the exact length of the visual render.  
> * **Native Lattice Math (For Diffusion):** If the pipeline uses video diffusion models (like Wan 2.x), the Conductor also calculates a native frame allocation targeting the model's VAE boundaries (e.g., 4*n*\+1).

#### **4\. Hardware Dispatch & Spoke Multiplexing**

With the physical frames locked, the Conductor pushes the rendering workloads out to the GPU foundries.

> * **Payload Construction:** It compiles a SpokeExecutionPayload containing the sceneId, targetFrames, positive prompts, specific loraTag requirements, and generation seeds.  
> * **Edge Director Routing:** It sends this payload via WebSocket to the edge-director on Cloudflare. The edge-director enforces queue management, verifies idempotency keys, issues a 30-second heartbeat lease, and routes the job to media-broker running on Rig 2\.  
> * **Remote Execution:** The headless ComfyUI daemon on Rig 2 executes the graph, generating a green-screen (\#00FF00) character plate matching the exact locked frame duration, and uploads the final proxy MP4 to Cloudflare R2.

#### **5\. Optical Master Assembly**

After the edge-director returns the verified plate assets, the Conductor orchestrates the final composite locally on Rig 1\.

> * **Remotion Metaprogramming:** A code generator (generate-episode-repo.ts) consumes the AST and the ffprobe timing manifest, writing a static, immutable React component (Episode\_XXX.tsx). The exact frame budgets and absolute timeline offsets are hardcoded into the component (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>).  
> * **Software GL Rasterization:** The Conductor triggers @remotion/renderer as a headless CLI subprocess. Crucially, it forces the renderer to use software OpenGL (--gl=swangle) and off-thread media decoding (--offthreadvideo). This confines the intense compositing tasks (chroma-keying the \#00FF00 background, ducking audio, handling parallax mattes) strictly to the CPU and system RAM, preventing headless Chromium instances from triggering GPU driver crashes.

#### **6\. Canon Sealing (The Relational Ledger)**

Once the physical MP4 artifact is successfully rendered and conformed, the Conductor finalizes the state transaction.

> * **Deltas & Pointers:** The Conductor issues a command to drain the uncommitted narrative state deltas from the worker-sower-engine (or the upstream SowerDO).  
> * **Immutable Ledger Record:** It writes these relational changes to the bible-state.json file and executes a signed Git commit, generating a permanent, cryptographic SHA-256 seal. This permanently logs that the events of the episode are now canonical history, and flags downstream dependencies to recalculate based on the new active state.

---

*User prompt: {{FOCUS: Acoustic Synthesis & Master Clock Initialization:}} /extreme-details*

Response: The Generative Production Pipeline strictly treats audio as the non-negotiable physical master clock. Because video diffusion models lack any innate sense of biological cadence or speech timing, speech must exist on disk before video timelines can be calculated. Audio duration dictates the physical cuts, while picture operates purely as an integer projection mapped directly to that exact duration.

### **The Turn-Based VRAM Flush**

Before audio synthesis begins, the Conductor must systematically secure hardware memory.

> * If local GPUs (such as the RTX 4090 on Rig 2\) were utilized for drafting the text AST, the Conductor issues an HTTP POST request to a local ComfyUI endpoint at \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free).  
> * This request includes the payload {"unload\_models": true, "free\_memory": true}.  
> * This explicit flush evicts the \~14.2 GB text generation model (such as a Qwen 14B GGUF) in approximately 300 milliseconds.  
> * Enforcing this sequential eviction eliminates CUDA Out-Of-Memory collisions and reserves the required 4–6 GB of unfragmented VRAM specifically for the upcoming Text-To-Speech generation models.

### **Microservice Dispatch & Acoustic Generation**

The Conductor bridges narrative text into speech by iterating through the validated dialogue\_ast.json.

> * It routes the text strings and character IDs via HTTP POST to a local Python TTS microservice (such as CosyVoice, Parler-TTS, or XTTSv2) hosted on port 8000 (\[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate)).  
> * During this request, the system injects specific character voice embeddings and Somatic DSP modifiers.  
> * For example, a character recorded in the ledger with a respiratory deficit may receive a pause\_frequency\_multiplier: 1.4 payload, elevating breathiness and altering the natural speech cadence.

### **Immutability & Content-Addressed Storage**

The TTS engine outputs raw, uncompressed 48 kHz .wav stems.

> * These stems are saved locally to public/audio/dialogue/ and are immediately treated as immutable, content-addressed archival artifacts.  
> * Once synthesized and approved, they are strictly forbidden from being secretly re-generated during the visual rendering phase.  
> * This prohibition prevents subtle sub-frame sample duration jitter from breaking the locked exposure sheet and misaligning downstream lip-sync.

### **Acoustic Verification & Automated Normalization**

The synthesized stems and subsequent audio beds must pass strict automated validation checks to ensure broadcast compliance.

> * An automated FFmpeg loudnorm filter pass conforms the integrated loudness of the final track.  
> * Master audio must hit integrated loudness targets of \-16 LUFS (± 1.0 LUFS) for web and streaming distribution.  
> * For broadcast delivery, targets are specifically adjusted to \-24 LKFS (ATSC A/85) for the US or \-23 LUFS (EBU R128) for Europe.  
> * A programmatic brickwall limiter enforces a true-peak ceiling locked mathematically at ≤ \-1.0 dBTP to prevent inter-sample clipping.  
> * Dialogue stems are certified to maintain a noise floor below \-60 dB prior to timeline insertion, preventing amplified room hiss when ducking envelopes recover.

### **Temporal Quantization (The Discrete Frame Math)**

Continuous physical sound operates in milliseconds, while video operates in discrete frames. The Conductor bridges this domain gap by mathematically converting audio length into a locked frame budget.

> * The Conductor spawns an asynchronous ffprobe child process (ffprobe \-v error \-show\_entries format=duration \-of default=noprint\_wrappers=1:nokey=1) to measure the exact millisecond duration of every generated .wav buffer.  
> * The duration is quantized into a 24 fps target frame budget using a strict ceiling formula:  
>   target\_frames=⌈(1000duration\_ms​)×24⌉  
> * For example, an audio stem measuring precisely 3,120.50 ms forces a mathematically pinned allocation of exactly 75 frames.  
> * The Conductor enforces a Sub-Frame Zero-Length Interval Clamp. Because extremely short interjections (e.g., 30 ms) can mathematically result in negative frame spans during rounding, the system enforces a hard minimum threshold of 1 frame (42 ms), padding silence if necessary.

### **Absolute Integer Anchoring**

Synthesized stems are never sequentially concatenated end-to-end.

> * Because the Math.ceil quantization calculation introduces up to 41.7 ms (one frame) of silence padding per shot, stringing stems together linearly accumulates timing drift against continuous background tracks.  
> * To guarantee zero cumulative drift across scene stitches, the exposure sheet maps every stem to an absolute integer starting coordinate evaluated at compile time:  
>   StartFrame*k*​\=*i*\=0∑*k*−1​DurationFrames*i*​

---

*User prompt: {{FOCUS: Core Responsibilities & System Boundaries}} /extreme-details*

Response: The worker-sower-conductor treats audio as the non-negotiable master clock for the entire pipeline because generative video models lack any innate sense of biological cadence. Every visual timeline and physical cut is derived explicitly from the physical duration of synthesized speech.

### **VRAM Eviction & Hardware Preparation**

Before acoustic synthesis can begin, the conductor must secure local hardware memory. If local GPU resources were utilized during preceding narrative drafting passes, the conductor issues a synchronous HTTP POST request to a local ComfyUI instance (\[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free)). This operation flushes large language and text diffusion models from VRAM in approximately 300 milliseconds, guaranteeing unfragmented memory headroom specifically for the vocal synthesis checkpoints.

### **Microservice Dispatch & Intent Translation**

The conductor iterates sequentially through the ingested dialogue\_ast.json, dispatching HTTP POST requests to a local Python Text-To-Speech microservice (such as Parler-TTS, CosyVoice, or Piper) running on \[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate). The JSON payload strictly maps abstract narrative intent into digital signal processing (DSP) parameters. A standard payload explicitly links the character identity (e.g., ELIAS) and emotion tag (e.g., tense\_jaw) alongside somatic dsp\_modifiers, such as injecting a pause\_frequency\_multiplier of 1.4 to alter breath pacing.

### **Content Verification & Automated Conformance**

Once the microservice outputs the uncompressed 48 kHz .wav stems, the conductor subjects the raw files to a rigorous automated inspection gate before they can be committed to the timeline.

> * **Transcript Alignment:** An automated Speech-to-Text inference pass scans the generated audio to verify the actor perfectly matched the AST text, blocking the pipeline if the model hallucinated or dropped words.  
> * **Loudness Gates:** An FFmpeg pass conforms the integrated loudness to strict broadcast targets, locking levels to \-16 LUFS (± 1.0 LUFS) for web distribution or \-24 LUFS for linear broadcast.  
> * **True-Peak Limiting:** A programmatic brickwall limiter enforces a strict acoustic ceiling between \-1.0 dBFS and \-2.0 dBTP to eliminate inter-sample clipping.  
> * **Noise Floor Certification:** Every dialogue stem must register a baseline noise floor below \-60 dB to prevent digital room hiss from being amplified during mixing compression.

### **The Dual-Domain Clock Architecture**

To prevent acoustic phase cancellation and visual quantization drift, the compiler bridges two synchronized temporal domains. The acoustic domain operates at continuous precision using 48,000 integer samples per second, while the video domain is locked to discrete cut boundaries at 24 integer frames per second.

Once validated, the generated .wav stems are saved to public/audio/dialogue/ and are immediately sealed as immutable, content-addressed artifacts. Downstream rendering components read these stems directly from disk. They are strictly forbidden from re-triggering the TTS service during compositing, which guarantees zero sub-frame sample jitter and locks visual phoneme alignment permanently.

### **Programmatic Acoustic Assembly**

The conductor handles the final mix deterministically in code, bypassing manual Digital Audio Workstation (DAW) editing. Continuous ambient audio beds are dynamically shaped around the spoken dialogue stems using quadratic sidechain ducking envelopes. When a speech window opens, the conductor calculates a precise linear gain multiplier targeting a \-14 dB reduction, applied across a 6-frame attack curve and restored over a 12-frame release curve. Hard Foley transients and environmental sound effects are algorithmic, seeded perfectly into the audio timeline using a Mulberry32 PRNG to guarantee exact reproducibility across distributed render cycles.

---

*User prompt: {{FOCUS: The Conductor Lifecycle Contract}} /extreme-details*

Response: The worker-sower-conductor—colloquially the "Conductor"—operates as the pipeline conductor and local assembly host, establishing an explicit physical and architectural boundary against the upstream worker-sower-engine. While the engine acts as an epistemological state machine that extracts abstract dialogue and narrative intent at the edge, the Conductor translates those abstractions into concrete, time-based physical media.

To achieve this, the Conductor executes strictly on Rig 1, a dedicated CPU and system RAM orchestration workstation that requires zero GPU compute or VRAM. Operating within a full POSIX Node.js runtime, the Conductor breaks free from the 128 MB V8 isolate sandbox limits of the edge engine, granting it the explicit permission to spawn necessary system child processes like ffprobe, @remotion/renderer, and local git binaries.

### **The Master Sequence: produceEpisode.ts**

The Conductor orchestrates external subsystems without merging their responsibilities into its core, governed by a strict sequential lifecycle contract inside src/pipeline/produceEpisode.ts. It controls the production environment through the following operational boundaries:

> * **VRAM Flushing & Hardware Preparation:** Before vocal synthesis begins, the Conductor must secure local hardware memory on shared rigs. It issues a synchronous HTTP POST request to \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) (with the payload {"unload\_models": true, "free\_memory": true}) to flush text inference checkpoints from VRAM in approximately 300 milliseconds. This guarantees unfragmented memory headroom specifically for text-to-speech execution without triggering CUDA Out-Of-Memory crashes.  
> * **Acoustic Synthesis (The Non-Negotiable Master Clock):** Generative video diffusion models lack any innate sense of biological cadence, meaning audio must exist on disk before video timelines can be calculated. The Conductor parses the ingested dialogue\_ast.json, mapping speaker identities and emotional tags to digital signal processing (DSP) payloads. It dispatches these payloads via HTTP POST to a local Python TTS microservice running on port 8000 to generate raw, uncompressed 48 kHz .wav stems.  
> * **Temporal Quantization (Discrete Frame Math):** Continuous millisecond sound must be quantized into discrete visual frames. The Conductor spawns an asynchronous ffprobe child process (ffprobe \-v error \-show\_entries format=duration...) to read the exact sample length of every generated .wav buffer. It then enforces a rigid 24 fps master budget using the ceiling formula: target\_frames=⌈(1000duration\_ms​)×24⌉.  
> * **Acoustic Geometry & Absolute Timeline Anchoring:** Stringing audio stems together linearly accumulates timing drift against background tracks because the Math.ceil quantization introduces up to 41.7 ms (one frame) of silence padding per shot. To guarantee zero cumulative drift, the Conductor maps every stem to an absolute integer starting coordinate: fromFrame*k*​\=∑*i*\=1*k*−1​total\_shot\_frames*i*​. It also injects programmatic Foley transients using a Mulberry32 PRNG and calculates an automated ducking envelope, dipping continuous ambient audio beds down to \-14 dB via a 6-frame attack during active speech windows.  
> * **Hardware Dispatch & Edge Multiplexing:** The Conductor is structurally isolated from direct GPU execution. It compiles the locked target frame counts, positive prompts, LoRA targets, and seeds into a SpokeExecutionPayload. This payload is dispatched over a WebSocket to the edge-director on Cloudflare, which queues the job and routes it to the headless media-broker on Rig 2 for video plate diffusion.  
> * **Programmatic Optical Assembly:** Once the greenscreen (\#00FF00) character plates are returned from the foundry, the Conductor triggers the @remotion/renderer CLI subprocess locally on Rig 1\. It strictly bounds this execution to prevent headless Chromium memory leaks by forcing software OpenGL rasterization (--gl=swangle), locking concurrency to a single worker (--concurrency=1), and offloading media decoding to isolated FFmpeg processes (--offthreadvideo).  
> * **Git Staging & Canon Sealing:** Upon successful MP4 rendering, the Conductor finalizes the state transaction. It issues a command to drain the uncommitted narrative state deltas from the upstream SowerDO, writes these relational changes to the bible-state.json file, and executes a local, signed Git commit to cryptographically seal the episode's events into the canonical ledger.

---

*User prompt: {{FOCUS: Core Responsibilities & Output Contracts}} /extreme-details*

Response: The worker-sower-conductor is the dedicated local pipeline conductor and media assembly host running exclusively on the Rig 1 workstation. While its upstream architectural sibling, worker-sower-engine, functions as an epistemological state machine operating within an edge isolate to evaluate narrative law and duel math, the conductor translates abstract narrative specifications into physical, time-based media deliverables.

Because the conductor must coordinate heavy I/O, execute native command-line binaries, and handle video rasterization, it executes in a full POSIX Node.js runtime on Rig 1, where it has explicit permission to spawn child processes (ffprobe, @remotion/renderer, and git) that are strictly forbidden inside edge sandboxes. Rig 1 operates entirely on multi-core CPU and system RAM, requiring zero dedicated GPU compute or VRAM.

`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE EDGE: worker-sower-engine (Pure Epistemic Core & Ledger State)              │`  
`│ Emits: dialogue_ast.json (Immutable Screenplay AST) & Unsealed Staging Memory Deltas    │`  
`└───────────────────────────────────────────┬────────────────────────────────────────────┘`  
                                            `│ HTTP / WSS Contract Ingress`  
                                            `▼`  
`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: worker-sower-conductor (CPU / System RAM Host — Zero VRAM Compute)              │`  
`├────────────────────────────────────────────────────────────────────────────────────────┤`  
`│ 1. Memory Hygiene: Turn-based VRAM flush trigger (POST http://127.0.0.1:8188/free)    │`  
`│ 2. Acoustic Synthesis: Local Python TTS caller (HTTP POST :8000 -> 48kHz .wav stems)   │`  
`│ 3. Temporal Quantization: Asynchronous ffprobe child process (24fps discrete lock)    │`  
`│ 4. Model Adapter Conformance: 4n + 1 VAE temporal lattice padding and trim logic       │`  
`│ 5. Hardware Dispatch: Compiles & emits SpokeExecutionPayload to edge-director / Rig 2  │`  
`│ 6. Optical Assembly: Spawns @remotion/renderer CLI subprocess (gl: 'swangle')          │`  
`│ 7. Acoustic Conformance: Two-pass EBU R128 / ATSC A/85 loudnorm & True-Peak gates     │`  
`│ 8. Canon Sealing: Drains DO staging deltas, validates DAG, and writes signed Git commit│`  
`└───────────────────────────────────────────┬────────────────────────────────────────────┘`  
                                            `│ Media Egress / Canon Storage`  
                                            `▼`  
`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ DOWNSTREAM SINKS: goblin-episodes/ (Master Broadcast MP4) & Signed Git Ledger (D1/Disk)│`  
`└────────────────────────────────────────────────────────────────────────────────────────┘`

### **System Demarcation & Hardware Boundaries**

The architecture maintains an explicit operational boundary between simulation logic, temporal orchestration, and tensor generation:

| Architectural Vector | Upstream Engine (worker-sower-engine) | Local Conductor (worker-sower-conductor) | Downstream Foundry (media-broker / Rig 2\) |
| :---- | :---- | :---- | :---- |
| **Physical Host** | Cloudflare Edge Worker / Durable Object | **Rig 1** (Local CPU/System RAM Workstation) | **Rig 2** (Heavy GPU Render Foundry) |
| **Operational Domain** | Narrative Meaning, Duel Math, & Canon Law | **Physical Time, Audio Clock, & Optical Media** | Headless Tensor Diffusion & KSampling |
| **Compute Profile** | V8 Isolate (≤128 MB RAM, no disk) | Pure CPU, System RAM, Multi-threaded I/O | Dedicated GPU VRAM (e.g., 24GB RTX Silicon) |
| **Child Processes** | **Banned** (Cannot spawn OS binaries) | **Required** (ffprobe, Remotion CLI, git) | Headless Python/ComfyUI Daemon |
| **Acoustic Function** | Assigns speaker IDs, dialogue, and emotion tags | Calls local TTS (:8000), normalizes, quantizes | Zero audio processing (prevents OOM collisions) |
| **Optical Assembly** | None (Agnostic to pixels and viewports) | Runs Remotion CLI with software GL (swangle) | **Banned** (Zero Chromium/Remotion instances) |
| **State Interaction** | Evaluates active ledger; mutates state *Sn*​→*Sn*\+1​ | Drains unsealed deltas; writes signed Git commits | Stateless spoke (holds no historical canon) |

Assigning optical assembly or speech quantization to Rig 2 breaks hardware isolation. Video diffusion checkpoints (such as Wan 2.2) require 20 GB to 24 GB of unfragmented VRAM. Spawning headless Chromium instances (@remotion/renderer) or audio workers on Rig 2 triggers system memory thrashing, driver conflicts, and erratic Linux OOM kills. Rig 1 isolates these memory-heavy, non-CUDA tasks completely.

### **Ingress Contract: The Screenplay AST (dialogue\_ast.json)**

The conductor's execution cycle is triggered exclusively by ingesting an immutable screenplay AST compiled and validated upstream by worker-sower-engine. This contract is strictly validated via Zod before any child processes are invoked:

`// src/types/narrative.ts`  
`import { z } from "zod";`

`export const DialogueLineSchema = z.object({`  
  `speaker: z.string(),`  
  `text: z.string(),`  
  `emotion: z.string(),`  
  `tonePacing: z.number().default(1.0),`  
  `dspModifiers: z.record(z.number()).optional(), // e.g. pause_frequency_multiplier`  
  `foleyCues: z.array(z.string()).optional()`  
`});`

`export const SceneASTSchema = z.object({`  
  `sceneId: z.string(),`  
  `episodeId: z.string(),`  
  `lines: z.array(DialogueLineSchema)`  
`});`

`export type SceneAST = z.infer<typeof SceneASTSchema>;`

### **Core Responsibilities & Output Delivery Contracts**

#### **1\. Hardware Memory Hygiene & Acoustic Synthesis**

Because speech models and diffusion models cannot reside concurrently on shared consumer hardware without triggering CUDA OOM failures, the conductor acts as the external gatekeeper of memory hygiene.

> * **Turn-Based VRAM Eviction:** If local GPU resources were utilized during upstream drafting passes, the conductor issues a synchronous HTTP POST request to ComfyUI's memory management route (\[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free)) with the payload {"unload\_models": true, "free\_memory": true}. This clears up to 14.2 GB of text generation checkpoints from VRAM within \~300 ms.  
> * **Acoustic Synthesis Dispatch:** Iterating over SceneAST.lines, the conductor dispatches HTTP POST requests to the local Python TTS microservice on port 8000 (\[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate)), passing the character identifier, target text, emotion tags, and somatic DSP modifiers.  
> * **The Master Clock Rule:** Audio is the absolute physical clock of the pipeline. Generative video diffusion models lack biological cadence; therefore, audio stems must exist on disk before video timelines can be calculated.  
> * **Output Contract (Dialogue Stems):** Uncompressed, 48 kHz mono .wav audio files saved to public/audio/dialogue/\${sceneId}\_SH\${shotIndex}.wav. Once synthesized and written to disk, these stems are immutable content-addressed artifacts. Downstream rendering runtimes are strictly forbidden from re-triggering the TTS service during compositing, preventing sub-frame phase jitter and phoneme misalignment.

#### **2\. Temporal Quantization & Absolute Timeline Anchoring**

Continuous acoustic sound operates in milliseconds, whereas downstream video composition operates on discrete timeline frames. The conductor reconciles this domain boundary:

> * **ffprobe Interrogation:** Spawns an asynchronous ffprobe child process to read the exact sample length of each generated .wav buffer:  
>   `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 stem.wav`

> * **Integer Quantization Math:** To eliminate floating-point drift at boundary edges, frame counts are evaluated using integer ceiling arithmetic at 24 fps:  
>   target\_frames=⌈(1000duration\_ms​)×24⌉\=⌊1000(duration\_ms×24)+999​⌋  
> * **Sub-Frame Zero-Length Interval Clamp:** Extreme audio interjections (\<42 ms) are clamped to a minimum duration of 1 frame (41.67 ms) to prevent negative or zero-frame layout collapses.  
> * **Absolute Integer Coordinate Anchoring:** Consecutively stringing rounded shots together introduces up to 41.67 ms of tail silence per cut, accumulating seconds of drift against continuous background tracks. The conductor computes each shot's start position from cumulative milliseconds quantized once:  
>   StartFrame*k*​\=⌈(*i*\=1∑*k*−1​DurationMs*i*​)×100024​⌉  
> * **Output Contract (exposure\_sheet.json):** A machine-readable manifest mapping each shot ID to its exact audio path, raw millisecond duration, calculated integer frame budget, and absolute timeline start/end coordinates.

#### **3\. Video Diffusion Lattice Conformance (Model Adapter)**

Generative video models featuring 3D causal VAE architectures (such as Wan 2.1 and Wan 2.2) cannot ingest arbitrary frame counts without crashing the latent tensor decoder. The conductor isolates this model quirk inside a backend adapter:

> * **The 4*n*\+1 Lattice Allocation:** Frame counts must conform to the sequence 4*n*\+1 (17,21,25,33,49,53,65,77,81,…). Naive flooring truncates plates shorter than the audio, causing severe lip-sync defects. The conductor rounds up:  
>   *N*\=⌈(1000duration\_ms​)×native\_fps⌉  
>   diffusion\_allocation=4×⌈4*N*−1​⌉\+1  
> * **Cadence Engineering & Judder Elimination:** Generating at 16 fps and delivering at 24 fps introduces a 1.5× pulldown (alternating 2:1 frame holds), causing severe motion judder. The conductor adapter resolves this through two strict configurations:  
  * *Configuration A (12 fps Native "On Twos"):* Raw frames are computed at 12 fps, aligned to 4*n*\+1, and rendered. During assembly, every native frame is duplicated 1:2 to reach 24 fps with zero cadence judder, and excess tail padding frames are safely trimmed.  
  * *Configuration B (24 fps Native Direct Match):* Applied only if the checkpoint was natively trained at 24 fps. Generates directly to the 24 fps 4*n*\+1 boundary, trimming 1 to 3 padding frames at the shot tail.  
> * **Sawtooth Waste Audit (scripts/audit-frame-waste.ts):** Because 4*n*\+1 is a periodic step function, generating 38 native frames forces an allocation of 41 frames (*n*\=10, wasting 3 frames), whereas 37 frames requires only 37 (*n*\=9, wasting 0 frames). The conductor audits audio durations prior to dispatch, notifying operators if adjusting audio pauses by \<65 ms saves compute cycles.

#### **4\. Hardware Dispatch Contract (SpokeExecutionPayload)**

The conductor compiles the locked parameters and workflow requirements into a standardized dispatch contract, pushing it across the network via WebSocket to the Cloudflare edge-director (or directly over HTTP to http://rig2:8188/prompt):

`// src/dispatch/payloadBuilder.ts`  
`export interface SpokeExecutionPayload {`  
  `type: "ENQUEUE_SHOT";`  
  `jobId: string;                     // e.g. "SC001_SH002"`  
  `artistId: string;                  // "artist_rig1"`  
  `workflowTemplate: string;          // "wan_greenscreen_i2v.json"`  
  `payload: {`  
    `prompt: string;                  // Isolated character prompt + "#00FF00 background"`  
    `negativePrompt: string;          // Background clutter, photorealistic artifacts`  
    `loraTag: string;                 // Target character LoRA weights & rank`  
    `targetPromptNodeId: string;      // ComfyUI node ID for positive prompt injection`  
    `targetFrameNodeId: string;       // ComfyUI node ID for diffusion_allocation`  
    `targetSeedNodeId: string;        // ComfyUI node ID for KSampler seed`  
    `diffusionAllocation: number;     // Conformed 4n + 1 frame count`  
    `masterDeliveryFrames: number;    // Master 24fps target frame count`  
    `seed: number;                    // Deterministic PRNG seed`  
  `};`  
`}`

> * **Output Contract (Foundry Coordination):** Emits this strongly typed payload and maintains an isolated background heartbeat lease (sending BROKER\_HEARTBEAT every 10 seconds against a 30-second TTL) while monitoring remote execution progress.

#### **5\. Optical Master Assembly & Broadcast Conformance**

When Rig 2 finishes sampling and returns the raw \#00FF00 character plate MP4 (via Cloudflare R2 or shared local storage), the conductor executes final optical mastering on Rig 1:

> * **Remotion Metaprogramming:** Executes generate-episode-repo.ts to generate an immutable, static React composition component (Episode\_XXX.tsx). Sequence frame budgets and offsets are hardcoded as static constants (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>), ensuring the renderer performs zero dynamic duration guessing.  
> * **Software GL CLI Execution:** Spawns @remotion/renderer as a headless child process:  
>   `npx remotion render src/index.ts Episode_001 out/Episode_001.mp4 \`  
>     `--gl=swangle \`  
>     `--concurrency=1 \`  
>     `--offthreadvideo`

\* \--gl=swangle: Forces Chromium to use software OpenGL rasterization, executing all greenscreen chroma-keying, layer compositing, and alpha despill in system RAM. \* \--offthreadvideo: Moves video decoding out of browser rendering processes into dedicated FFmpeg subprocesses, preventing memory leaks.

> * **Multi-Track Acoustic Mixing & Ducking Envelopes:** Composites audio across three concurrent priority layers:  
  * *Track 1 (Dialogue Stems):* Pinned to absolute integer frame boundaries.  
  * *Track 2 (Spot Foley Transients):* Algorithmic sound effects seeded using a deterministic Mulberry32 PRNG keyed to MurmurHash3(scene\_id \+ ":" \+ shot\_id \+ ":" \+ cue\_name).  
  * *Track 3 (Continuous Ambient Beds):* Shaped dynamically around spoken dialogue windows using a programmatic gain envelope (6-frame quadratic attack dipping beds to −14 dB, held through speech, and released over 12 frames).  
> * **Offline Video Finishing Filtergraph:** Complex visual unification runs through a deterministic offline FFmpeg filtergraph pass on the conformed master, applying upper-luminance highlight bloom (halation), per-frame seeded procedural film grain (*t*), and a global 16-bit .cube 3D LUT to tie character plates and painted matte backgrounds together.  
> * **Automated QA Egress Gates:** The rendered media container must pass strict deterministic physical gates before release:  
  * *Alpha Edge Purity Check:* An automated pixel analysis script checks the 3-pixel contour of the character silhouette; the mean green-channel intensity must register \<12 inside the mask.  
  * *Silhouette Bounding Integrity Check:* Verifies the character alpha bounding box falls within declared safe-zones across the first and last frames, catching cropping truncations caused by bad generation seeds.  
  * *Automated Loudness Normalization (Two-Pass loudnorm):* Master audio passes through an automated FFmpeg filter pass conforming to the targeted channel delivery profile:  
    * **Web / Streaming Profile:** Integrated −16 LUFS (±1.0 LUFS), True-Peak ceiling ≤−1.0 dBTP.  
    * **US Broadcast Profile (ATSC A/85):** Integrated −24 LKFS (±1.0 LKFS), True-Peak ceiling ≤−2.0 dBTP.  
    * **European Broadcast Profile (EBU R128):** Integrated −23 LUFS (±1.0 LUFS), True-Peak ceiling ≤−1.0 dBTP.  
    * **Noise Floor Certification:** Dialogue stems are certified to maintain an RMS noise floor below −60 dBFS in unvoiced regions.  
> * **Output Contract (Master MP4):** Master broadcast container (out/Episode\_XXX.mp4 / ProRes) deposited into cold storage in goblin-episodes/.

#### **6\. Canon Sealing Contract (gitSealer.ts)**

Once the physical MP4 deliverable is certified, the conductor finalizes the state transaction to prevent narrative split-brain divergences:

> * **Draining Uncommitted Staging Deltas:** The conductor issues an HTTP GET/POST to the upstream SowerDO isolate on Cloudflare, pulling the uncommitted relational ledger deltas (character relationship shifts, inventory mutations, injury states) recorded during that episode's mechanical resolution.  
> * **Relational DAG Verification:** Verifies local database integrity (PostgreSQL/SQLite) against the ingested deltas to guarantee zero schema or constraint violations.  
> * **Cryptographic Git Commit:** Executes a signed Git commit stamping bible-state.json and episodic manifests into the repository history.  
> * **Output Contract (Signed Canon Commit):** A permanent, cryptographic SHA-256 Git commit sealing the episode's events into canonical history, signaling downstream tools that state *Sn*\+1​ is active.

### **Target Repository Layout (worker-sower-conductor)**

The conductor code repository isolates all I/O-heavy, binary-dependent execution layers from the core simulation engine:

`worker-sower-conductor/`  
`├── package.json                   # Dependencies: zod, ws, dotenv, @remotion/renderer`  
`├── tsconfig.json                  # NodeNext, strict mode`  
`├── .env.production                # RIG2_HOST, EDGE_DIRECTOR_WS_URL, TTS_SERVICE_URL`  
`├── drafts/                        # Ephemeral working directory for the active production cycle`  
`│   ├── dialogue_ast.json          # Ingested screenplay contract from worker-sower-engine`  
`│   └── exposure_sheet.json        # Derived timing manifest from ffprobe analysis`  
`├── workflows/                     # Headless ComfyUI API templates injected with target_frames`  
`│   ├── wan_greenscreen_i2v.json   # Character diffusion plate template`  
`│   └── flux_matte_background.json # Matte background plate template`  
`└── src/`  
    `├── index.ts                   # Conductor CLI entrypoint`  
    `├── audio/`  
    `│   ├── ttsClient.ts           # HTTP POST caller to local Python TTS service (Port 8000)`  
    `│   └── ffprobeQuantizer.ts    # Spawns ffprobe child process; calculates 24fps frames`  
    `├── dispatch/`  
    `│   ├── payloadBuilder.ts      # Compiles SpokeExecutionPayload with locked frame math`  
    `│   └── edgeDirectorClient.ts  # Manages WSS connection & heartbeat leases to edge-director`  
    `├── remotion/`  
    `│   ├── assetIngest.ts         # Pulls completed #00FF00 character plates from Rig 2 / R2`  
    `│   ├── generateTsx.ts         # Metaprograms static Episode_XXX.tsx Remotion manifest`  
    `│   └── renderSubprocess.ts    # Spawns @remotion/renderer CLI subprocess (gl: 'swangle')`  
    `├── git/`  
    `│   ├── pullStaging.ts         # Drains unsealed deltas from upstream SowerDO via HTTP`  
    `│   └── gitSealer.ts           # Verifies relational DAG and executes signed git commits`  
    `└── pipeline/`  
        `└── produceEpisode.ts      # Master Conductor Lifecycle Harness (Sequential Pipeline)`

---

*User prompt: go into more detail on the target repository layout*

Response: As detailed in the "Generative Production Pipeline", the worker-sower-conductor repository is explicitly structured to extract all I/O-heavy, binary-dependent execution layers from the core simulation engine. Because it operates exclusively on Rig 1—a dedicated CPU and system RAM host—its directories isolate temporal locking, media assembly, and Git operations from pure narrative logic.

**Root Configuration & Environment Variables**

> * **package.json**: Configured with "private": true and manages strict runtime dependencies including zod, ws, dotenv, and @remotion/renderer.  
> * **tsconfig.json**: Enforces strict TypeScript rules and targets NodeNext.  
> * **.env.production**: Houses the network addresses required to bridge the system's hardware split, specifically defining RIG2\_HOST, EDGE\_DIRECTOR\_WS\_URL, and TTS\_SERVICE\_URL.

**Workspace & Injection Directories**

> * **drafts/**: Acts as the ephemeral working directory for the current production cycle. It specifically stores dialogue\_ast.json, which is the validated contract emitted by the upstream worker-sower-engine.  
> * **workflows/**: Contains headless ComfyUI API templates designed to be dynamically injected with locked target\_frames. This includes wan\_greenscreen\_i2v.json (the diffusion plate template) and flux\_matte\_background.json (the background plate template).

**Source Execution (src/)**

> * **src/index.ts**: Serves as the primary command-line interface entrypoint for the conductor.  
> * **src/audio/**: Manages the acoustic domain and physical clock. It contains ttsClient.ts, an HTTP caller that interfaces with the local Python TTS service running on port 8000\. It also contains ffprobeQuantizer.ts, which spawns an ffprobe child process to lock continuous audio into discrete 24fps frames.  
> * **src/git/**: Handles the permanent sealing of narrative events. It utilizes pullStaging.ts to drain staging memory from the upstream Sower Durable Object via HTTP. Once drained, gitSealer.ts verifies the relational DAG and executes a cryptographically signed Git commit.  
> * **src/dispatch/**: Manages the hardware multiplexing to the GPU foundry. The payloadBuilder.ts script compiles the SpokeExecutionPayload using the locked target\_frames. The edgeDirectorClient.ts script manages the WebSocket connection and heartbeat leases required to communicate with the edge-director.  
> * **src/remotion/**: Controls the local optical assembly process. It features assetIngest.ts to stage the completed \#00FF00 character plates returned from Rig 2 or R2 storage. It uses renderSubprocess.ts to spawn the @remotion/renderer CLI, explicitly using the software OpenGL backend (gl: 'swangle').  
> * **src/pipeline/**: The heart of the application, housing the master linear conductor script produceEpisode.ts. This script executes the strict sequential lifecycle: ingesting the AST, synthesizing TTS audio, triggering ffprobe quantization, dispatching payloads to the network, and orchestrating the final Remotion render.

---

*User prompt: look at the beginning of the conversation and sum up everything until the last response concerning the most important parts of the \[worker-sower-conductor\]*

Response: The worker-sower-conductor (originally designated goblin-conductor) is the local assembly host and temporal pipeline orchestrator running exclusively on Rig 1\. While its upstream counterpart, worker-sower-engine, functions as a pure narrative simulation core and epistemological authority at the edge, the conductor bridges abstract narrative intent into physical, time-based media deliverables.

### **Hardware Demarcation & System Boundaries**

The conductor is strictly bounded by the physical and architectural constraints of the multi-tier workstation pipeline:

> * **Rig 1 (Pure CPU / System RAM):** The conductor runs exclusively on Rig 1, a dedicated CPU workstation that requires zero dedicated GPU silicon or VRAM. It operates in a full POSIX Node.js runtime, granting it the explicit permission to execute heavy I/O and spawn native child processes (ffprobe, @remotion/renderer, and git).  
> * **The Edge Boundary (Why it cannot live in Cloudflare Workers):** The upstream worker-sower-engine can reside inside a Cloudflare Worker and Durable Object because it only handles 2d6 duel math, spatial queries, and AST extraction. The conductor cannot live at the edge because Cloudflare V8 isolates enforce a ≤128 MB RAM limit and strictly ban POSIX child process spawning.  
> * **The Foundry Boundary (Why it cannot run on Rig 2):** Rig 2 is strictly a high-VRAM, headless GPU tensor foundry running ComfyUI on port 8188 for heavy generative models (e.g., Wan 2.2 plates and LoRA passes). Spawning headless Chromium instances (@remotion/renderer) or audio services on Rig 2 causes CPU/RAM thrashing, memory fragmentation, driver collisions, and Linux out-of-memory (OOM) crashes that break sequential GPU memory hygiene.  
> * **Namespace Hygiene:** Adopting worker-sower-conductor pairs directly with worker-sower-engine, reserving the worker-sower-\* prefix for domain-agnostic generative pipeline infrastructure while reserving goblin-\* for world-specific instances and creative lore.

| Architectural Vector | Upstream Engine (worker-sower-engine) | Local Conductor (worker-sower-conductor) | Downstream Foundry (media-broker / Rig 2\) |
| :---- | :---- | :---- | :---- |
| **Physical Host** | Cloudflare Edge Worker / Durable Object | **Rig 1** (Local CPU/System RAM Workstation) | **Rig 2** (Dedicated High-VRAM GPU Foundry) |
| **Operational Domain** | Narrative Meaning, Duel Math, & Canon Law | **Physical Time, Audio Clock, & Optical Media** | Headless Tensor Diffusion & KSampling |
| **Runtime Profile** | V8 Isolate (≤128 MB RAM, no disk) | Full POSIX Node.js Runtime | Headless Python/ComfyUI Daemon |
| **Child Processes** | **Banned** (Cannot spawn OS binaries) | **Required** (ffprobe, Remotion CLI, git) | Headless execution only |
| **Acoustic Function** | Emits line text, speaker IDs, and emotion tags | Calls local TTS (:8000), quantizes frames | Zero audio processing (prevents OOM crashes) |
| **Optical Assembly** | None (Visual-agnostic) | Remotion CLI with software GL (swangle) | **Banned** (Zero Chromium/Remotion instances) |
| **State Interaction** | Evaluates ledger; mutates state *Sn*​→*Sn*\+1​ | Drains unsealed deltas; writes signed Git commits | Stateless compute spoke (holds no canon) |

### **The Master Lifecycle Contract (produceEpisode.ts)**

The conductor executes a deterministic six-stage lifecycle contract located in src/pipeline/produceEpisode.ts that coordinates external tools without merging their logic into the simulation core:

#### **1\. Ingestion of the Screenplay Contract**

The conductor reads and validates drafts/dialogue\_ast.json, an immutable AST emitted by the upstream engine containing speaker identities, dialogue text, emotional tags, and somatic actions.

#### **2\. VRAM Eviction & Acoustic Synthesis**

> * **VRAM Flushing:** If local GPU resources were previously used during preliminary drafting passes, the conductor issues a synchronous HTTP POST request to \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) ({"unload\_models": true, "free\_memory": true}), flushing models from VRAM in \~300 ms to reserve headroom for speech generation.  
> * **The Master Clock Rule:** Video diffusion models have no innate concept of biological cadence or speech timing; therefore, audio must exist on disk before video timelines can be calculated.  
> * **Microservice Dispatch:** The conductor iterates through the dialogue lines and issues HTTP POST requests to a local Python TTS microservice running on port 8000 (\[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate)), injecting emotional tags and digital signal processing (DSP) modifiers (e.g., pause\_frequency\_multiplier).  
> * **Immutable Stems:** Synthesized 48 kHz .wav files are saved locally to public/audio/dialogue/ as content-addressed artifacts and are strictly locked against re-generation during visual assembly.  
> * **Acoustic Compliance:** Stems must pass an automated loudness gate targeting an integrated \-16 LUFS and a True-Peak ceiling ≤−1.0 dBTP.

#### **3\. Temporal Quantization & Acoustic Geometry**

> * **ffprobe Interrogation:** The conductor spawns an asynchronous ffprobe child process to read the exact sample length of each synthesized .wav file:  
>   `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 stem.wav`

> * **The Discrete Frame Lock:** Continuous millisecond audio is quantized into a locked 24 fps integer frame budget using a ceiling calculation:  
>   target\_frames=⌈(1000duration\_ms​)×24⌉  
> * **Anti-Drift Integer Anchoring:** Because Math.ceil adds up to 41.7 ms (1 frame) of tail silence per cut, concatenating audio files end-to-end causes cumulative sync drift. The conductor maps each stem to an absolute timeline frame coordinate evaluated at compile time:  
>   fromFrame*k*​\=*i*\=1∑*k*−1​total\_shot\_frames*i*​  
> * **Dynamic Audio Bed ducking:** Calculates ducking curves for ambient audio beds, dipping background tracks to \-14 dB using a 6-frame quadratic attack during dialogue and recovering over a 12-frame release. Hard Foley cues are seeded deterministically using a Mulberry32 PRNG keyed to shot metadata to prevent rendering drift.

#### **4\. Hardware Dispatch (SpokeExecutionPayload)**

The conductor compiles the scene ID, conformed target frames, positive/negative prompts, LoRA tags, and deterministic seeds into a typed SpokeExecutionPayload. It dispatches this payload via WebSocket to the Cloudflare edge-director (or directly to Rig 2 via http://rig2:8188/prompt), where a FIFO queue and a 30-second heartbeat lease manage the job for the headless ComfyUI media-broker on Rig 2\.

#### **5\. Optical Master Assembly**

Once Rig 2 renders the green-screen (\#00FF00) character plates and returns them, the conductor triggers @remotion/renderer as a local CLI subprocess on Rig 1:

> * **Software OpenGL (gl: 'swangle'):** Chromium is forced to rasterize and pull chroma keys in system RAM, bypassing GPU drivers completely to eliminate multi-tenant CUDA crashes.  
> * **Process Isolation:** Uses \--concurrency=1 and \--offthreadvideo to move media decoding out of browser threads into isolated FFmpeg processes, preventing memory leaks.

#### **6\. Canon Sealing & Git Staging**

Once the final master MP4 is conformed and verified, the conductor issues an HTTP call to the upstream SowerDO to drain uncommitted staging memory deltas. It validates the relational DAG locally and executes a signed Git commit, permanently stamping the episode's state mutations (*Sn*​→*Sn*\+1​) into the canonical repository ledger.

### **Target Repository Layout**

The file layout of worker-sower-conductor is structured to isolate all I/O-heavy, binary-dependent execution layers from the pure simulation logic:

`worker-sower-conductor/`  
`├── package.json                     # private: true; deps: zod, ws, dotenv, @remotion/renderer`  
`├── tsconfig.json                    # NodeNext, strict mode`  
`├── .env.production                  # RIG2_HOST, EDGE_DIRECTOR_WS_URL, TTS_SERVICE_URL`  
`├── drafts/                          # Ephemeral working directory for the active production cycle`  
`│   └── dialogue_ast.json            # Ingested screenplay contract from worker-sower-engine`  
`├── workflows/                       # Headless ComfyUI API templates injected with target_frames`  
`│   ├── wan_greenscreen_i2v.json     # Character diffusion plate template`  
`│   └── flux_matte_background.json  # Background plate template`  
`└── src/`  
    `├── index.ts                     # Conductor CLI entrypoint`  
    `├── audio/`  
    `│   ├── ttsClient.ts             # HTTP caller to local Python TTS microservice (Port 8000)`  
    `│   └── ffprobeQuantizer.ts      # Spawns ffprobe child process; locks 24fps frames`  
    `├── git/`  
    `│   ├── pullStaging.ts           # Drains unsealed SowerDO staging memory via HTTP`  
    `│   └── gitSealer.ts             # Verifies relational DAG and executes signed git commit`  
    `├── dispatch/`  
    `│   ├── payloadBuilder.ts        # Compiles SpokeExecutionPayload with locked target_frames`  
    `│   └── edgeDirectorClient.ts    # Manages WSS connection & heartbeat leases to edge-director`  
    `├── remotion/`  
    `│   ├── renderSubprocess.ts      # Spawns @remotion/renderer CLI (gl: 'swangle')`  
    `│   └── assetIngest.ts           # Stages returned #00FF00 character plates from Rig 2/R2`  
    `└── pipeline/`  
        `└── produceEpisode.ts        # Master Linear Conductor: Ingest -> TTS -> ffprobe -> Dispatch -> Remotion`

---

*User prompt: {{FOCUS: Acoustic Synthesis & Master Clock Initialization}} /extreme-details*

### **Response: The Master Physical Clock Axiom & Epistemic Hierarchy**

In traditional animation workflows, visual artists draw frames and sound editors adjust audio tracks to fit the visual cuts. In an automated generative pipeline, this dependency structure causes severe desynchronization, rubbery mouth movements, and unnatural speech pauses. The governing architectural law of the worker-sower-conductor establishes that **audio is the architect of time; picture is an integer projection mapped to audio duration**.

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

This design is rooted in an economic asymmetry: **audio generation is computationally cheap, whereas video generation is computationally expensive**. Generative video diffusion models possess no innate understanding of biological cadence, speech timing, or dramatic rhythm. Synthesizing dialogue first and measuring its physical duration establishes a locked frame target, ensuring GPUs render only the exact frames required for compositing.

> * **Observation vs. Derivation Decoupling:** The physical duration in milliseconds (*D*ms​) measured via ffprobe is the *observation*; the integer frame count is the *derivation*. Both are stored as distinct fields in exposure\_sheet.json. If delivery targets change from 24 fps to 30 fps or 60 fps, frame budgets are re-derived from the original millisecond durations without requiring audio re-synthesis.  
> * **Acoustic Stem Immutability:** Once synthesized and verified, .wav stems are content-addressed and archived in public/audio/dialogue/. Downstream rendering runtimes are strictly forbidden from calling TTS APIs during compositing, preventing sub-frame duration jitter from breaking the exposure sheet or misaligning visemes.

### **Hardware Preparation & Memory Hygiene (Turn-Based VRAM Flush)**

Running language inference, speech synthesis, and video diffusion on shared hardware creates memory contention. The conductor enforces hardware hygiene before audio processing begins:

> * **The Hardware Boundary Split:** In multi-workstation deployments, Rig 1 handles orchestration, speech synthesis, duration probing, and Remotion optical assembly using pure CPU and system RAM, reserving Rig 2's 24 GB VRAM exclusively for diffusion passes.  
> * **The Turn-Based Sequential Flush:** When text drafting passes (Child Graph A) run on local GPU silicon, the conductor executes an HTTP POST request to ComfyUI's memory release endpoint at \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free):  
>   `{`  
>     `"unload_models": true,`  
>     `"free_memory": true`  
>   `}`

This evicts the \~14.2 GB text LLM (such as a Qwen 14B GGUF) in approximately 300 ms, clearing memory headroom and eliminating CUDA Out-of-Memory (OOM) collisions for upcoming TTS synthesis models.

> * **Stage-Level Batching Advantage:** Rather than thrashing VRAM per shot (loading and unloading text, audio, and video models for every line), the pipeline batches operations by *Stage*. It synthesizes all episodic dialogue stems in a single pass before evicting audio weights and transitioning hardware resources to video diffusion.

### **Microservice Dispatch & Acoustic Generation**

The conductor ingests the screenplay contract (dialogue\_ast.json) emitted by worker-sower-engine. This payload is validated using Zod schemas to ensure type safety:

`// src/types/narrative.ts`  
`import { z } from "zod";`

`export const DialogueLineSchema = z.object({`  
  `speaker: z.string(),`  
  `text: z.string(),`  
  `emotion: z.string(),`  
  `tonePacing: z.number().default(1.0),`  
  `dsp_modifiers: z.record(z.number()).optional()`  
`});`

`export const SceneASTSchema = z.object({`  
  `sceneId: z.string(),`  
  `episodeId: z.string(),`  
  `lines: z.array(DialogueLineSchema)`  
`});`

The conductor iterates through the AST lines, dispatching HTTP POST requests to the local Python TTS microservice running on port 8000 (\[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate), powered by CosyVoice, Parler-TTS, or Piper):

`{`  
  `"character": "ELIAS",`  
  `"text": "The relay is dead. We move now.",`  
  `"emotion": "tense_jaw",`  
  `"dsp_modifiers": {`  
    `"pause_frequency_multiplier": 1.4`  
  `}`  
`}`

> * **Somatic DSP Parameter Injection:** Narrative conditions logged in the upstream state ledger are converted into digital signal processing (DSP) modifiers. A character with a physical respiratory injury receives an elevated pause\_frequency\_multiplier (e.g., 1.4), forcing the model to lengthen breath intervals and alter speech cadence.  
> * **Speech-to-Text (STT) Verification Gate:** Raw audio stems undergo an automated STT alignment check to confirm the synthesized waveform matches the approved AST text, halting execution if the model dropped words or hallucinated.

### **Dual-Domain Clock Architecture & Temporal Projection**

To maintain audio phase fidelity while enforcing strict video frame boundaries, the compiler bridges two synchronized temporal domains:

`AUDIO TIMEBASE DOMAIN: 48,000 integer samples/second (Sample-Accurate Truth)`  
  `│`  
  `├─ Measured Waveform Duration: e.g., 3,120 ms (149,760 samples)`  
  `├─ Phoneme / Viseme Onsets (e.g., Sample Offset: 26,742)`  
  `└─ Sidechain Ducking Envelope (-14 dB Speech Window)`  
  `│`  
  `▼ Projection: Sample Index S = Frame * (48000 / 24) = Frame * 2000`  
`MASTER VIDEO CLOCK: 24 integer frames/second (Discrete Cut Boundaries)`  
  `│`  
  `├─ Calculated Target Frames: ceil(3.120 * 24) = 75 frames`  
  `└─ Absolute Timeline Anchor: fromFrame_k = Σ duration_i`

> * **Audio Timebase Domain (48 kHz):** Operates at 48,000 integer samples per second, capturing high-precision acoustic events such as transient spikes, phoneme boundaries, and ducking envelopes.  
> * **Master Video Clock (24 fps):** Operates strictly on discrete integer frames, where a single frame represents:  
>   Δ*t*frame​\=241​ s≈41.6667 ms  
> * **The Projection Ratio:** The mathematical bridge between both domains resolves to a fixed integer multiplier:  
>   24 frames/sec48,000 samples/sec​\=2,000 audio samples per video frame  
>   The sample index *S* matching frame *F* is calculated as:  
>   *S*\=*F*×2,000  
>   For example, a transient occurring at sample coordinate 26,742 maps to video frame ⌊26,742/2,000⌋=Frame 13, while the audio stream plays back at sample precision to prevent phase cancellation or perceptual lip-sync lag.  
> * **Frame-Accurate vs. Sample-Accurate Boundaries:** Cut points and shot transitions fall strictly on video-frame boundaries (e.g., Frame 72 falls exactly at 72/24=3.0 s), while internal waveform processing within a cut maintains continuous sample-accurate alignment.

### **Temporal Quantization Math (ffprobe & Sub-Frame Clamping)**

Continuous physical sound must be mapped onto integral frame boundaries. The conductor invokes ffprobe as an asynchronous child process to read the duration of each .wav buffer:

`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 dialogue_sh001.wav`

`// src/services/audioTiming.ts`  
`import { execFile } from "node:child_process";`  
`import util from "node:util";`

`const execFileAsync = util.promisify(execFile);`

`export async function quantizeAudioStem(wavPath: string): Promise<{ durationMs: number; targetFrames: number }> {`  
  `const { stdout } = await execFileAsync("ffprobe", [`  
    `"-v", "error",`  
    `"-show_entries", "format=duration",`  
    `"-of", "default=noprint_wrappers=1:nokey=1",`  
    `wavPath`  
  `]);`

  `const durationSec = parseFloat(stdout.trim());`  
  `const durationMs = Math.round(durationSec * 1000);`  
    
  `// Non-negotiable ceiling quantization: ceil(ms / 1000 * 24)`  
  `const targetFrames = Math.max(1, Math.ceil((durationMs / 1000) * 24));`

  `return { durationMs, targetFrames };`  
`}`

> * **Integer Ceiling Quantization:** To guarantee video never underruns audio, frame budgets use an integer ceiling calculation:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉  
>   *Example:* A stem measuring 3,120.50 ms yields ⌈3.1205×24⌉=⌈74.892⌉=75 frames (3.125 s).  
> * **The Sub-Frame Duration Trap & Zero-Length Interval Clamp:** For short utterances (e.g., *"Ha"*, 30 ms), naive rounding produces inverted frame intervals (EndFrame\<StartFrame), causing timeline sequence crashes. The compiler clamps allocations to a minimum of 1 frame (41.67 ms):  
>   target\_frames=max(1,⌈1000*D*ms​​×24⌉)  
>   Audio buffers shorter than 41.67 ms are padded with trailing digital silence to fill the 1-frame boundary.

### **Timeline Anchoring & Cumulative Drift Prevention**

Quantizing per-shot audio stems via ceiling math introduces up to 41.67 ms (one frame) of silence padding at the end of each cut. Concatenating rounded shots end-to-end causes cumulative timing drift against continuous background audio (e.g., a 24-shot sequence averages \~12 frames of drift, drifting by over half a second).

The conductor resolves this by separating per-shot generation budgets from master timeline placement:

`Shot Generation: Local Ceiling Rule (Never underruns speech)`  
`Timeline Cuts:   Cumulative-Millisecond Quantization (Zero-drift tiling)`

> * **Cumulative Millisecond Quantization:** Shot placements on the Remotion timeline are derived from cumulative raw milliseconds quantized once:  
>   Start*k*​\=⌈1000∑*i*\<*k*​*Di*​​×24⌉,End*k*​\=⌈1000∑*i*≤*k*​*Di*​​×24⌉−1  
> * **Mathematical Proof of Contiguity:**  
>   End*k*​\+1=⌈1000∑*i*≤*k*​*Di*​​×24⌉\=Start*k*\+1​  
>   Because End*k*​\+1≡Start*k*\+1​, consecutive lines tile the master timeline with zero gaps and zero overlaps.  
> * **Bounded Error Guarantee:** Total scene drift relative to the true audio duration is mathematically bounded to less than one frame (\<41.7 ms) across an entire episode, regardless of cut count:

| Lines in Scene | Per-Line Ceiling: Mean Drift / Max (Frames) | Cumulative Quantization: Mean Drift / Max (Frames) |
| :---- | :---- | :---- |
| **1** | 0.50 / 1.00 | **0.50 / 1.00** |
| **6** | 3.00 / 5.38 | **0.50 / 1.00** |
| **12** | 6.01 / 10.09 | **0.50 / 1.00** |
| **24** | 11.97 / 17.06 | **0.50 / 1.00** |

Excess padding frames produced by per-shot ceiling generation are trimmed at the tail of each shot before the next shot's start frame.

### **Programmatic Acoustic Assembly & Gain Automation**

Audio tracks inside Episode\_XXX.tsx are organized into three discrete, prioritized lanes:

`Track 1: Spoken Dialogue Stems (Master Clock — Fixed Duration)`  
         `[--------- Shot 01 (75f) ---------]          [--------- Shot 02 (90f) ---------]`  
`Track 2: Spot Foley Transients (Seeded PRNG)`  
                `[*clink*]                                    [*scrape*]`  
`Track 3: Continuous Ambient Bed (Programmatic Gain Automation)`  
`────┐                                       ┌────────┐                                 ┌────`  
    `│                                       │        │                                 │`  
    `└───────────────────────────────────────┘        └─────────────────────────────────┘`  
      `^ Attack (6f)          Release (12f) ^          ^ Attack (6f)      Release (12f) ^`  
      `Ducking Floor: -14 dB                           Ducking Floor: -14 dB`

#### **1\. Track Allocation Hierarchy**

> * **Track 1 (Dialogue Stems):** Immutable .wav stems mounted at absolute integer frame coordinates.  
> * **Track 2 (Spot Foley Transients):** Punctual sound effects triggered by narrative AST cues. Variant selection is resolved deterministically at generation time using a Mulberry32 PRNG keyed with a 32-bit hash:  
>   Seed=MurmurHash3(scene\_id+":"+shot\_id+":"+cue\_name)  
>   An anti-clustering salt (\${seed}:retry) re-rolls samples matching the immediately preceding shot to avoid mechanical repetition. Variants are compiled as literal strings into TSX props (src={staticFile("audio/footstep\_02.wav")}), eliminating render-time PRNG evaluation.  
> * **Track 3 (Continuous Ambient Bed & Music):** Continuous atmospheric loops and musical stems shaped dynamically by gain automation envelopes.

#### **2\. Programmatic Gain Automation Math (Sidechain Ducking)**

Gain ducking operates as a deterministic, timeline-keyed envelope rather than a signal-reactive compressor, preserving reproducible output across headless renderers.

`Volume V(f)`  
 `1.0 ┌─────────────────────────────────────────────────────────────┐`  
     `│                                                             │`  
`Base │──┐                                                     ┌────│ (V_base = 0.40)`  
 `0.4 │  │                                                     │    │`  
     `│   \  <- Attack (6 frames)         Release (12 frames)-> /    │`  
     `│    \                                                   /     │`  
`Duck │     └─────────────────────────────────────────────────┘      │ (V_duck = 0.08)`  
`0.08 │      |              Active Dialogue Window           |      │`  
 `0.0 └──────┴───────────────────────────────────────────────┴──────┴─► Frame`  
           `f_start                                         f_end`

During active dialogue windows \[*f*start​,*f*end​\], background beds attenuate by −14 dB using a 6-frame quadratic attack (*A*\=6, ≈250 ms) and recover over a 12-frame quadratic release (*R*\=12, ≈500 ms) whenever a speech pause exceeds 12 frames:

Gainducked​\=1020−14 dB​×*V*base​≈0.1995×0.40≈0.0798  
*V*(*f*)=⎩⎨⎧​*V*base​,interpolate(*f*,\[*f*start​−*A*,*f*start​\],\[*V*base​,*V*duck​\],Easing.quadOut),*V*duck​(−14 dB),interpolate(*f*,\[*f*end​,*f*end​\+*R*\],\[*V*duck​,*V*base​\],Easing.quadIn),*V*base​,​*f*\<*f*start​−*Af*start​−*A*≤*f*\<*f*start​*f*start​≤*f*≤*f*end​*f*end​\<*f*≤*f*end​\+*Rf*\>*f*end​\+*R*​

#### **3\. Acoustic Unit Consistency (Strict Centi-Decibels)**

Mixing basis-point multipliers (0 to 10000) with standard decibels (0 to 120 dB) introduces systematic floating-point rounding drift. All internal acoustic math evaluates in integer centi-decibels (cdB), where 0 dB=0 cdB and 120 dB=12000 cdB. Audibility checks verify that:

*I*arrival​≥*T*hearing​AND*I*arrival​−*N*ambient​≥SNRmin​

Auditory quality is derived as a normalized per-mille integer score (0 to 1000):

*Q*auditory​\=clamp(⌊*I*ref​−(*N*ambient​\+SNRmin​)(*I*arrival​−(*N*ambient​\+SNRmin​))×1000​⌋,0,1000)

### **Automated Master Conformance & Loudness Verification Gates**

Ducking depth alone does not guarantee broadcast compliance; audio compliance is an empirical property of the conformed final mix. The conductor executes an automated two-pass FFmpeg ebur128 / loudnorm filter pass (ffmpeg \-af ebur128=framelog=verbose) against the master render:

`Candidate Audio Mix`  
       `│`  
       `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ PHYSICAL SIGNAL GATES (Post-Mix Conformance Pass)                      │`  
`│ • Loudness Profile: Target matched via two-pass FFmpeg loudnorm        │`  
`│ • True-Peak Limit: Brickwall clamp prevents inter-sample clipping      │`  
`│ • Noise Floor Gate: RMS ceiling < -60 dBFS in unvoiced regions         │`  
`│ • Integer Frame Parity: Rendered frame count matches target_frames     │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│`  
                  `┌────────────────┴────────────────┐`  
                  `│ PASS                            │ FAIL`  
                  `▼                                 ▼`  
         `[ Proceed to Muxing ]            [ Reject & Alert Conductor ]`

> * **Delivery Profile Standards:** Compliance targets are determined by delivery channel profiles rather than a hardcoded constant:  
  * **Web / Streaming Master:** Integrated −16 LUFS (±1.0 LUFS) with True-Peak ≤−1.0 dBTP (or −14 LUFS for target-specific platforms).  
  * **US Broadcast Master (ATSC A/85):** Integrated −24 LKFS (±1.0 LKFS) with True-Peak ceiling ≤−2.0 dBTP.  
  * **European Broadcast Master (EBU R128):** Integrated −23 LUFS (±1.0 LUFS) with True-Peak ceiling ≤−1.0 dBTP.  
  * *Unit Discipline:* Sample-peak (dBFS) is never mixed with True-Peak (dBTP). Limiters enforce inter-sample peak ceilings in dBTP.  
> * **Noise Floor Certification:** Dialogue stems are certified to maintain an unvoiced RMS noise floor below −60 dBFS, preventing audible ambient hiss when ducking envelopes release back to unity gain.

### **Diffusion Latency & The 4*n*\+1 Sawtooth Waste Cost Model**

When driving downstream video diffusion models equipped with 3D causal VAE architectures (such as Wan 2.1 and Wan 2.2), raw frame requests must satisfy temporal lattice boundaries:

diffusion\_frames=4*n*\+1(17,21,25,33,49,65,77,81,…)

Feeding arbitrary frame counts (such as 75 frames) directly into causal VAE latent decoders risks tensor shape mismatches. The conductor's backend adapter reconciles the 24 fps master clock against diffusion constraints through two configurations:

> * **Configuration A (Native 12 fps Animated "On Twos" — Zero Judder):** For a 3.120 s stem, master 24 fps delivery requires ⌈3.120×24⌉=75 frames. Native 12 fps requires ⌈3.120×12⌉=38 frames. Conforming to 4*n*\+1 yields *n*\=⌈(38−1)/4⌉=10⟹41 native frames. During assembly, frames are duplicated 1:2 to reach 82 frames at 24 fps, and the 7 excess tail frames (82−75) are trimmed, delivering motion "on twos" with zero pull-down judder.  
> * **Configuration B (Native 24 fps Direct Master Match):** Valid only if the model natively supports 24 fps. For a 3.120 s audio stem, the 75-frame budget conforms to *n*\=⌈(75−1)/4⌉=19⟹77 native frames. The 2 excess tail frames (77−75) are trimmed at the cut boundary with zero cadence resampling.

#### **Sawtooth Waste Audit (scripts/audit-frame-waste.ts)**

Because 4*n*\+1 is a discrete step function, generation waste follows a periodic sawtooth pattern:

`Native Frames Needed: 37 ➔ n = 9  ➔ Allocates 37 frames (0 wasted frames)`  
`Native Frames Needed: 38 ➔ n = 10 ➔ Allocates 41 frames (3 wasted frames)`

The conductor runs a pre-dispatch audit on planned audio durations. If a shot falls on an inefficient sawtooth peak, the tool alerts the operator:

*"Shot 04 wastes 3 native frames. Tightening dialogue pause by 62 ms reduces n from 10 to 9, saving 12% GPU compute."*

---

*User prompt: {{FOCUS: Temporal Quantization (The Discrete Frame Math)} /extreme-details*

### **Response: The Master Physical Clock Axiom & Architectural Decoupling**

In traditional computer animation and visual post-production workflows, visual layout dictates time: animators stage keyframes, and sound editors cut, time-stretch, or pad audio clips to fit visual cut boundaries. In an automated, generative media pipeline, inverting this dependency causes severe visual desynchronization, rubbery lip-sync, floating pauses, and broken scene cadence.

The governing law of the pipeline establishes that **audio is the architect of time; picture is an integer projection mapped to audio duration**.

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

This architecture is grounded in an economic and technical asymmetry: **audio generation is computationally cheap, whereas video diffusion generation is computationally expensive**. Generative video diffusion models possess no innate concept of biological speech cadence, acoustic rhythm, or dramatic timing. Synthesizing dialogue first and measuring its physical waveform establishes a locked frame target, ensuring local GPUs and cloud foundries render only the exact frames required for final optical compositing.

> * **Observation vs. Derivation Decoupling:** The physical waveform duration in milliseconds (*D*ms​) measured via ffprobe represents the empirical *observation*; the integer frame count represents the downstream *derivation*. Both values are stored in separate, immutable fields within exposure\_sheet.json. If the broadcast target changes from 24 fps to 30 fps or 60 fps, frame budgets are re-derived from the original millisecond durations without requiring audio re-synthesis.  
> * **Acoustic Stem Immutability:** Once synthesized and verified, .wav stems are content-addressed and archived in public/audio/dialogue/. Downstream rendering runtimes are strictly forbidden from calling text-to-speech (TTS) APIs during compositing, preventing sub-frame duration jitter from breaking the locked exposure sheet or misaligning visemes.

### **The Dual-Domain Multi-Resolution Clock Formulation**

Continuous sound cannot be forced into video frames prematurely without destroying acoustic phase precision and transient alignment. To preserve acoustic fidelity while enforcing frame-accurate video cut points, the compiler bridges two synchronized temporal domains:

`AUDIO DOMAIN (Continuous Timebase Clock): 48,000 samples/sec (Sample-Accurate Truth)`  
  `│`  
  `├─ Phoneme / Viseme Onsets (e.g., Sample Offset: 26,742)`  
  `├─ Seeded Transient Foley Hits (Mulberry32 PRNG)`  
  `└─ Dynamic Ducking Envelopes (-14 dB Speech Window)`  
  `│`  
  `▼ Projection: Sample Index S = Frame * (48000 / 24) = Frame * 2000`  
`VIDEO DOMAIN (Master Video Clock): 24 integer frames/sec (Discrete Cut Boundaries)`

> * **Audio Timebase Domain (48 kHz):** Operates at 48,000 integer samples per second, capturing acoustic events such as transient Foley hits, phoneme/viseme boundaries, and ducking curves with sample-accurate precision.  
> * **Master Video Clock (24 fps):** Operates strictly on discrete integer frames, where the temporal duration of a single video frame is:  
>   Δ*t*frame​\=241​ s≈41.6667 ms  
> * **The Projection Ratio:** The mathematical bridge between both clocks resolves to a constant integer factor:  
>   24 frames/sec48,000 samples/sec​\=2,000 audio samples per video frame  
> * **The Coordinate Mapping Equation:** The sample coordinate *S* corresponding to video frame *F* is calculated as:  
>   *S*\=*F*×2,000  
> * **Frame-Accurate Cuts vs. Sample-Accurate Truth:** Video cut points and shot transitions fall strictly on video-frame boundaries (e.g., Frame 72 falls at 72/24=3.0 s), while internal waveform processing within a cut maintains continuous sample-accurate alignment. If a phoneme onset or glass transient occurs at sample 26,742, it is projected onto video frame ⌊26,742/2,000⌋=Frame 13, while the audio mix plays back sample-accurately to prevent phase cancellation or perceptual lip-sync lag.

### **Discrete Quantization Mathematics & The Pure-Integer Policy**

The conductor queries the exact millisecond duration of each generated .wav buffer by spawning an asynchronous ffprobe child process:

`ffprobe -v error -show_entries format=duration \`  
  `-of default=noprint_wrappers=1:nokey=1 dialogue_sh001.wav`

The tool acts strictly as a **measurement instrument, not the clock authority**; the synthesized .wav waveform remains the authoritative physical truth.

#### **Standard Ceiling Quantization**

Continuous physical duration measured by ffprobe is quantized to master video frames using the integer ceiling function to guarantee that video never underruns audio:

target\_frames=⌈(1000*D*ms​​)×delivery\_fps⌉

> * *Worked Example:* A speech stem measuring 3,120.50 ms at 24 fps yields:  
>   target\_frames=⌈10003120.50​×24⌉\=⌈74.892⌉=75 frames (3.125 s)  
> * *Tail-Slack Absorption:* In this example, 75 frames equals 3,125.00 ms of video time. The resulting delta of 4.50 ms (0.108 frames) represents tail slack. Rather than truncating audio or stretching video, the compiler absorbs this difference within the shot's natural decay padding, ensuring dialogue decays naturally without clipping at cut boundaries.

#### **The Floating-Point Hazard & The Integer-Time Policy**

Evaluating frame allocations using standard IEEE 754 floating-point numbers introduces representation errors. A calculation like *D*×fps can produce values such as 74.00000000000001, which ceiling-rounds to 75 instead of the intended 74\. To prevent platform-dependent round-off divergence across operating systems, all durations and frame calculations evaluate using **pure integer arithmetic**:

Let *x*\=*D*ms​×delivery\_fps (an exact integer):

target\_frames=⌊1000*x*\+999​⌋\=⌊1000(*D*ms​×delivery\_fps)+999​⌋

> * *Worked Verification:* For *D*ms​\=3,120 at 24 fps:  
>   *x*\=3,120×24=74,880  
>   target\_frames=⌊100074,880+999​⌋\=⌊100075,879​⌋\=75 frames

#### **Rational Framerate Representation**

To prevent hardcoded assumptions and eliminate decimal drift on non-integer drop-frame standards, frame rates are formalized as exact rational numbers:

FPS=*qp*​

For example, 23.976 fps is represented as 1,00124,000​. The integer ceiling quantization formula generalizes to:

target\_frames=⌊1000×*q*(*D*ms​×*p*)+(1000×*q*−1)​⌋

### **The Sub-Frame Duration Trap & Zero-Length Interval Clamp**

When compiling short interjections, non-verbal vocalizations, or clipped syllables (*"Hmph"*, *"Ha"*, *D*ms​\<41.67 ms, such as 30 ms), naive interval math collapses:

StartFrame=⌈*a*⌉,EndFrame=⌈*b*⌉−1

If ⌈*a*⌉=⌈*b*⌉, then:

EndFrame=StartFrame−1

This evaluates to an inverted, negative-length interval (FrameBudget\<1), which causes timeline sequence parsers and Remotion components to crash during rendering passes.

`// Mandatory compiler clamp in src/audio/ffprobeQuantizer.ts`  
`const targetFrames = Math.max(1, Math.floor(((durationMs * deliveryFps) + 999) / 1000));`

The conductor enforces three deterministic rules to protect timeline integrity:

> 1. **Mandatory 1-Frame Allocation:** Every audio track is allocated a mandatory minimum duration of 1 frame (41.67 ms at 24 fps).  
> 2. **Digital Silence Padding:** If the physical .wav stem duration is shorter than 41.67 ms (or 42 ms), the audio engine automatically pads the tail of the buffer with digital silence up to the 1-frame boundary.  
> 3. **Neighbor Merging:** If an audio line cannot be padded without acoustic artifacting, it is merged into the adjacent dialogue window. Under no circumstances may an exposure sheet emit an entry with FrameBudget\<1.

### **Cumulative-Millisecond Master Clock Quantization (Anti-Drift Calculus)**

A primary failure mode of automated video compilers is **relative timeline chaining** (e.g., setting shot\[k\].start \= shot\[k-1\].end) using independently ceiling-rounded durations.

#### **The Rounding Accumulation Defect**

Because integer ceiling quantization rounds up to the nearest whole frame, it introduces up to 41.67 ms (one frame) of excess silence padding per shot.

> * Summing per-line ceilings ∑⌈*Di*​×24⌉ compounds this error.  
> * Across a 12-line scene, fractional padding inflates the timeline by 6 to 12 frames (250 to 500 ms), noticeably breaking lip-sync against continuous background audio.  
> * Across a 100-shot episode, relative concatenation drifts the video track out of sync with ambient audio beds and music stems by up to 4 seconds.

#### **Cumulative-Millisecond Formulation**

To eliminate cumulative drift across multi-line scenes, timeline placement is derived from a **running cumulative millisecond sum quantized once**:

StartFrame*k*​\=⌈1000∑*i*\=1*k*−1​*Di*​​×FPS⌉  
EndFrame*k*​\=⌈1000∑*i*\=1*k*​*Di*​​×FPS⌉−1

#### **Mathematical Proof of Contiguous Tiling**

Evaluating the start boundary of the subsequent shot (*k*\+1):

StartFrame*k*\+1​\=⌈1000∑*i*\=1*k*​*Di*​​×FPS⌉

Subtracting the end boundary of the preceding shot (*k*):

StartFrame*k*\+1​−EndFrame*k*​\=⌈1000∑*i*\=1*k*​*Di*​​×FPS⌉−(⌈1000∑*i*\=1*k*​*Di*​​×FPS⌉−1)\=1  
⟹EndFrame*k*​\+1=StartFrame*k*\+1​

Because EndFrame*k*​\+1≡StartFrame*k*\+1​, consecutive shots tile the timeline with **zero gaps and zero overlaps**. Total drift relative to true elapsed audio time is mathematically bounded to less than one frame (\<41.7 ms) across an entire episode, regardless of shot count.

#### **Resolving the Generation vs. Placement Tension**

The pipeline resolves the operational tension between local ceiling generation and cumulative placement through an explicit division of labor:

> * **Per-Shot Generation Budgets:** Use the local ceiling rule (⌈*Dk*​×fps⌉) when generating raw video plates so visual action never underruns spoken speech.  
> * **Master Timeline Placement:** Uses cumulative millisecond quantization to anchor absolute cut boundaries in Remotion.  
> * **Tail Margin Trimming:** The 1 to 2 excess frames produced by local ceiling over-allocation are trimmed at the shot's cut boundary during optical assembly.

### **Timeline Geometry & Dwight Swain Motivation-Reaction Units (MRUs)**

To preserve the separation of meaning and representation, temporal units are organized across a strict six-level hierarchy:

| Level | Unit Name | Governing Plane | Primary Clock | Allowed State Mutations |
| :---- | :---- | :---- | :---- | :---- |
| **L1** | **Simulation Cycle** | World Simulation | Discrete World Tick (1 Day) | Hex movement, passive condition decay, hunger/supplies. |
| **L2** | **Episode** | Broadcast Container | Pacing / Schedule | Public status changes, grievance cooldown decrements. |
| **L3** | **Scene** | Encounter Space | Spatial Adjacency | Duel resolution, trauma injection, secret revelations. |
| **L4** | **Beat** | Narrative AST | Swain MRU Order | Somatic fatigue increment, refusal strain, local tension. |
| **L5** | **Shot** | Exposure Sheet | Master Video (24 fps) | Audio stem trigger, camera push-in, viseme cueing. |
| **L6** | **Frame** | Optical Compositor | 1/24 s Rasterization | Pixel transforms, chroma despill, motion interpolation. |

> * **Beats Belong to Narrative:** A beat is a semantic unit of dramatic change in dialogue\_ast.json (e.g., an accusation, a denial, a concession).  
> * **Shots Belong to Presentation:** A shot is an optical unit in exposure\_sheet.json (a continuous camera setup, a background matte, a single audio stem).  
> * *Separation:* One beat can span three presentation shots (Speaker → Listener reaction cut → Insert shot of clenched fist); conversely, one long tracking shot can contain multiple narrative beats.

#### **MRUs as Physical Timeline Geometry**

Generative large language models naturally invert dramatic causality (e.g., generating *"He spoke as the door slammed"* or having characters speak instantaneously without registering shock). The compiler enforces chronological ordering based on Dwight Swain’s Motivation-Reaction Unit: **Stimulus → Reflex → Calculation → Action/Speech**.

`CAUSE EVENT (Stimulus) ──► Frame 52`  
                             `│`  
`REFLEX (Visceral Shock) ──► Frames 53–57`  
                             `│`  
`PROCESSING (Calculation) ──► Frames 58–69`  
                             `│`  
`DECISION (Intent)      ──► Frames 70–73`  
                             `│`  
`SPEECH (Action)        ──► Frame 74`

> * **Reaction Pre-Roll Buffers:** When dialogue\_ast.json flags a cognitive shock (reaction\_cue: "VISCERAL\_STING"), the compiler inserts a **12-to-24 frame visual pre-roll buffer** (held reaction, eye saccade, camera push-in) *before* the dialogue audio stem begins.  
> * **The Calculation Phase:** Internal thought is rendered visually as an explicit held beat, eye-dart animation, or cut to an object of focus.  
> * **Pre-Roll and Post-Roll Separation:** In exposure\_sheet.json, pre\_roll\_frames and post\_roll\_frames are stored separately from audio\_frames, allowing pacing adjustments to be made without invalidating speech measurements.

### **Backend Temporal Adapters & The 4*n*\+1 Latent Lattice Mechanics**

Video diffusion backends featuring 3D causal Variational Autoencoders (such as Wan 2.1, Wan 2.2, and HunyuanVideo) mandate temporal frame allocations governed by downsampling lattices:

Framesnative​\=4*n*\+1(*n*∈N)

Crucially, **4*n*\+1 is a property of specific model checkpoints and latent VAE nodes, not a universal law of generative video**. To keep model implementation details from contaminating universal narrative logic, constraints are encapsulated within **Backend Temporal Adapters**:

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

#### **The Ceil-Based Lattice Allocation Formula**

Naively flooring frame counts using 4⌊*N*/4⌋+1 truncates video plates shorter than the spoken audio, producing visual cutoffs and severe lip-sync defects. The compiler strictly **rounds up**:

*N*\=⌈(1000*D*ms​​)×model\_native\_fps⌉  
diffusion\_allocation=4×⌈4*N*−1​⌉\+1

#### **Cadence Conformance Configurations**

Converting native diffusion frame rates into the 24 fps master delivery timeline without motion judder is handled through distinct configurations:

> * **Configuration A: Native 12 fps Animated "On Twos" (Clean Cadence):**  
  * *Speech Duration:* 3,120 ms.  
  * *Master 24 fps Budget:* ⌈3.120×24⌉=75 frames (3.125 s).  
  * *Native 12 fps Requirement:* *N*\=⌈3.120×12⌉=38 frames.  
  * *4n\+1 Conformance:* *n*\=⌈(38−1)/4⌉=⌈9.25⌉=10⟹4(10)+1=41 frames (3.4167 s).  
  * *Resample to 24 fps:* Clean 1:2 frame duplication (every native frame held for exactly 2 ticks ⟹82 frames at 24 fps).  
  * *Tail Margin Trim:* 82−75=7 frames trimmed at the cut boundary.  
  * *Result:* Clean 2:2 animation cadence with **zero conversion-rate judder** caused by uneven resampling.  
> * **Configuration B: Native 24 fps (Direct Master Match):**  
  * Applies when targeting 24 fps native models.  
  * *Audio Master:* 3,120 ms⟹75 frames.  
  * *4n\+1 Conformance:* *n*\=⌈(75−1)/4⌉=19⟹4(19)+1=77 native frames.  
  * *Tail Margin Trim:* 77−75=2 frames trimmed at the shot tail.  
  * *Result:* 1:1 direct identity mapping with zero cadence resampling.  
> * **Configuration C: Native 16 fps (Interpolation / Retiming):**  
  * *N*\=⌈3.120×16⌉=50 frames.  
  * *4n\+1 Conformance:* 4×⌈49/4⌉+1=53 frames (3.3125 s).  
  * *Tail Truncation:* Trimming excess 3 frames aligns the plate to exactly 50 native frames (3.120 s).  
  * *Resampling:* Converting 16 fps to 24 fps introduces a 1.5× ratio (alternating 2:1 pull-down holds), requiring optical-flow interpolation (e.g., RIFE) or speed retiming to fit the locked 75-frame master delivery budget.

#### **The 4*n*\+1 Sawtooth Waste Cost Model (scripts/audit-frame-waste.ts)**

Because 4*n*\+1 is a discrete step function, generative waste follows a periodic sawtooth pattern:

> * A requirement of 37 native frames yields *n*\=9⟹37 frames (0 wasted frames).  
> * A requirement of 38 native frames yields *n*\=10⟹41 frames (3 wasted frames, an extra 7.9% to 9.8% compute penalty).

`// scripts/audit-frame-waste.ts`  
`export function auditShotFrameWaste(durationMs: number, nativeFps: number): {`  
  `rawFrames: number;`  
  `allocatedFrames: number;`  
  `wastedFrames: number;`  
  `optimizationOpportunityMs: number;`  
`} {`  
  `const rawFrames = Math.ceil((durationMs / 1000) * nativeFps);`  
  `const n = Math.ceil((rawFrames - 1) / 4);`  
  `const allocatedFrames = 4 * n + 1;`  
  `const wastedFrames = allocatedFrames - rawFrames;`  
    
  `// Calculate ms reduction required to drop to (n - 1)`  
  `const targetRaw = 4 * (n - 1) + 1;`  
  `const targetDurationMs = (targetRaw / nativeFps) * 1000;`  
  `const optimizationOpportunityMs = Math.max(0, durationMs - targetDurationMs);`

  `return { rawFrames, allocatedFrames, wastedFrames, optimizationOpportunityMs };`  
`}`

### **Source Baking & Exposure Sheet Contract (exposure\_sheet.json)**

To prevent dynamic duration guessing or floating-point rounding divergence at render time, the conductor generates static, source-baked code. The script generate-episode-repo.ts consumes the AST and timing manifest, compiling the data directly into literal props inside Episode\_XXX.tsx:

`// Deterministic source-baking inside Episode_001.tsx`  
`<Sequence durationInFrames={75} from={0}>`  
  `<CharacterPlate`  
    `src={staticFile("renders/ep01_sh001_wan.mp4")}`  
    `playbackRate={1.0}`  
    `trimEndFrames={2}`  
  `/>`  
  `<Audio`  
    `src={staticFile("audio/dialogue/ep01_sc03_sh001.wav")}`  
    `volume={1.0}`  
  `/>`  
`</Sequence>`

At render time, Remotion executes with zero duration guessing, zero runtime rounding, and zero dynamic synchronization.

#### **The Exposure Sheet Data Contract**

The intermediate timing manifest decouples physical observation from creative pacing:

`{`  
  `"scene_id": "ep01_sc03",`  
  `"fps": 24,`  
  `"total_frames": 365,`  
  `"shots": [`  
    `{`  
      `"shot_id": "ep01_sc03_sh001",`  
      `"speaker": "bog",`  
      `"audio_stem_path": "public/audio/dialogue/ep01_sc03_sh001.wav",`  
      `"audio_duration_ms": 3120,`  
      `"pre_roll_frames": 8,`  
      `"audio_frames": 75,`  
      `"post_roll_frames": 16,`  
      `"start_frame": 0,`  
      `"duration_in_frames": 99,`  
      `"ducking_db": -14.0,`  
      `"viseme_cues": [`  
        `{ "frame": 8,  "shape": "small" },`  
        `{ "frame": 12, "shape": "medium" }`  
      `]`  
    `}`  
  `]`  
`}`

Storing audio\_duration\_ms as the physical observation alongside pre\_roll\_frames, audio\_frames, and post\_roll\_frames allows directors and editors to adjust camera pacing and reaction timings freely without re-synthesizing audio or corrupting historical ledger facts.

---

*User prompt: {{FOCUS: Acoustic Geometry & Pacing Assembly (Worker-Sower-Conductor) }} /extreme-details*

### **Response: Multi-Track Priority Topology & Structural Blueprint**

The worker-sower-conductor compiles a scene's complete multi-track acoustic blueprint directly from abstract screenplay metadata, treating audio as the non-negotiable master clock governing all downstream timelines. In programmatic video, audio dictates the timeline: dialogue stem durations dictate visual cuts, while Foley impacts and background beds adapt dynamically around speech. The acoustic topology is organized into three concurrent, prioritized layers within the Remotion component tree:

`Track 1: Spoken Dialogue Stems (High Priority / Fixed Master Clocks via ffprobe)`  
         `[--------- Shot 01 (75f) ---------]          [--------- Shot 02 (90f) ---------]`  
`Track 2: Spot Foley Transients (Medium Priority / Mulberry32 PRNG Seeded)`  
                `[*valve_scrape*]                             [*boot_squelch*]`  
`Track 3: Continuous Ambient Sound Bed (Low Priority / Multi-Window Sidechain Ducking)`  
`────┐                                       ┌────────┐                                 ┌────`  
    `│                                       │        │                                 │`  
    `└───────────────────────────────────────┘        └─────────────────────────────────┘`  
      `^ Attack (6f)          Release (12f) ^          ^ Attack (6f)      Release (12f) ^`  
      `Ducking Floor: -14 dB                           Ducking Floor: -14 dB`

> * **Track 1: Spoken Dialogue Stems (High Priority / Fixed Master Clocks):** Discrete mono or stereo .wav audio buffers synthesized by the local Python text-to-speech microservice on port 8000 (such as CosyVoice or Parler-TTS). Waveforms are measured using an asynchronous ffprobe child process to establish an immutable integer frame budget using ceiling quantization: target\_frames=⌈(duration\_ms/1000)×24⌉. Stems must pass an automated acoustic gate targeting an integrated **\-16 LUFS** (± 1.0 LUFS) and a True-Peak ceiling ≤ **\-1.0 dBTP** before timeline mounting.  
> * **Track 2: Spot Foley Cues & Transients (Medium Priority / Synchronized Events):** Punctual physical sound effects (e.g., boot scrapes, valve turns, fluid squelches) snapped to exact frame offsets, character action hold-frames, or pre-roll reaction intervals. Variants are resolved pseudo-randomly from local sound asset pools using deterministic hashing.  
> * **Track 3: Continuous Ambient Sound Bed & Score (Low Priority / Dynamic Attenuation):** Sustained geometric texture loops (such as machinery drones, electrical hums, or rain on zinc) and isolated music stems. Unlike character plates that cut cleanly on visual shot boundaries, Track 3 persists across scene and shot transitions with linear crossfades to maintain continuous acoustic space. Track 3 is continuously reshaped via frame-by-frame sidechain gain automation.

### **Absolute Integer Anchoring & Anti-Drift Assembly**

When audio stems are compiled into exposure sheets, sequential concatenation end-to-end is strictly prohibited.

> * **The Rounding Tail Hazard:** Because integer ceiling quantization (⌈(ms/1000)×24⌉) rounds continuous waveforms up to the nearest whole frame, it introduces up to **41.7 ms** (one full video frame at 24 fps) of trailing digital silence per shot. Stringing audio files together linearly compounds these fractional rounding tails across multi-shot sequences, accumulating seconds of drift against continuous background audio beds, music stems, and visual cuts.  
> * **Absolute Coordinate Formulation:** To eliminate cumulative timing drift, the conductor maps every dialogue stem to an absolute timeline frame coordinate evaluated at compile time:  
>   fromFrame*k*​\=*i*\=1∑*k*−1​total\_shot\_frames*i*​  
> * **Bounded Error Guarantee:** Each shot's start frame is anchored to the cumulative timeline budget rather than relative to the termination of the preceding audio buffer. This mathematically bounds total episodic timing variance to less than one frame across an entire production, guaranteeing frame-accurate synchronization between spoken dialogue, Foley transients, and visual plate transitions.

### **Dwight Swain Motivation-Reaction Unit (MRU) Pacing & Narrative Pauses**

Generative language models frequently invert or collapse dramatic timing, producing immediate spoken dialogue without accounting for visceral shock, physical processing, or cognitive hesitation. The conductor counteracts this by enforcing Dwight Swain's classical Motivation-Reaction Unit (MRU) structure (Stimulus → Reflex → Calculation → Action/Speech) within the timeline compiler.

> * **Reaction Pre-Roll Injection (VISCERAL\_STING):** When the screenplay AST flags a cognitive shock or narrative impact (reaction\_cue: "VISCERAL\_STING"), the conductor programmatically inserts an authored pre-roll buffer of **8 to 24 frames** (or **12 to 24 frames**) of silence, held reaction, or camera push-in *before* the dialogue audio stem begins.  
> * **Shot-Reverse-Shot Decomposition:** Dialogue lines exceeding **3.5 seconds** in duration are automatically split by the timeline compiler into shot-reverse-shot configurations. This intercuts the speaker with conformed reaction plates of the listening actor to maintain cinematic cutting cadence.  
> * **Asset Verification & Hard Failure Gates:** The compiler strictly bans silent fallbacks to idle animation loops. If a required listener reaction plate is missing from the asset registry during assembly, the compiler trips a hard failure (MISSING\_REACTION\_ASSET), aborting the build immediately.  
> * **Narrative Pause Swell (\[BEAT\] Nodes):** When the AST introduces dedicated narrative pause markers (\[BEAT\] nodes), the conductor releases the active sidechain ducking envelope. This allows continuous atmospheric drones or score beds to swell into the physical silence, reaching full baseline volume before decaying roughly **0.5 seconds** prior to the resumption of dialogue.

### **Deterministic Foley Lexical Extraction & PRNG Seeding**

Foley events and ambient sound effects are not manually aligned in a Digital Audio Workstation; they are compiled directly from screenplay action cues and bound to immutable frame timestamps:

`[ Script Sound Production Note ] ──► Parsed Nouns ("siphon", "boot", "canvas")`  
                                               `│`  
                                               `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ FOLEY LEXICAL MAPPING (Dual-Output Vocabulary)                         │`  
`│ • ITEM_SIPHON   ──► Visual Plate: "corroded brass tube"                │`  
`│                 ──► Audio Stem:   foley/metal_siphon_scrape_02.wav     │`  
`│ • TERRAIN_SWAMP ──► Audio Stem:   foley/mud_boot_squelch_01.wav        │`  
`└──────────────────────────────────────┬─────────────────────────────────┘`  
                                       `│`  
                                       `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ DETERMINISTIC PSEUDO-RANDOM SEEDING                                    │`  
`│ • Seed = MurmurHash3(sceneId + ":" + shotId + ":" + sampleKey)         │`  
`│ • Anti-Clustering Salt: Appends ":retry" if variant matches prev shot  │`  
`│ • Banned: Math.random() (Guarantees parity across browser workers)     │`  
`└──────────────────────────────────────┬─────────────────────────────────┘`  
                                       `│`  
                                       `▼`  
    `Baked into Remotion TSX Props: <Sequence from={atFrame} />`

> * **Dual-Output Lexical Mapping:** Action cues and sound production notes in the AST are parsed for concrete nouns (e.g., "siphon", "boot", "canvas") and resolved against a centralized registry (FOLEY\_REGISTRY). This unifies visual prompt tokens with corresponding audio sample keys (e.g., an item described visually as a "corroded brass tube" maps directly to foley/metal\_siphon\_scrape\_02.wav).  
> * **Temporal Snapping:** Punctual Foley cues are snapped to action hold-frames, pre-roll windows, or the impact phase of the action cycle (such as Triad Phase B).  
> * **Deterministic PRNG Seeding (Mulberry32):** Native JavaScript Math.random() is strictly banned to ensure identical output across parallel headless browser workers and distributed rendering nodes. Variant selection from sample pools is resolved using a Mulberry32 PRNG seeded deterministically:  
>   Seed=MurmurHash3(sceneId+":"+shotId+":"+sampleKey)  
> * **Anti-Clustering Salt (:retry):** If the PRNG draws a sample variant that matches the asset selected in the immediately preceding shot, an anti-clustering salt (:retry) is appended to the seed. This forces an automatic re-roll to provide acoustic variation without introducing non-deterministic drift.  
> * **Compile-Time Source Baking:** Foley variant resolutions are evaluated at generation time and written directly as literal string props into the generated TSX component (e.g., src={staticFile("audio/footstep\_02.wav")}). This eliminates runtime PRNG evaluation during headless Remotion rendering.

### **Programmatic Sidechain Ducking & Geometric Sound Beds**

The conductor enforces vocal clarity using programmatic gain automation curves (AmbientTrack.tsx) rather than analog compressor emulation.

> * **Mathematical Sidechain Ducking Math:** During active dialogue windows (*f*start​≤*f*≤*f*end​), background ambient beds and musical score stems attenuate by **\-14 dB**. The attenuation factor is derived from decibels using the standard conversion formula:  
>   Gainducked​\=1020dB​\=1020−14​≈0.1995  
> * **Quadratic Attack and Release Envelopes:** Rather than applying hard volume cuts, gain curves transition smoothly using quadratic easing functions:  
  * *Attack Curve:* A 6-frame quadratic attack dips the ambient track volume before speech begins.  
  * *Release Curve:* A 12-frame quadratic release restores the ambient bed back to its baseline volume once speech concludes.  
> * **Multi-Window Reducer (Math.min):** To prevent volume "pumping" (unnatural rapid volume swells during brief dialogue pauses between sentences), the conductor composes gain envelopes across all dialogue windows in a scene using a Math.min() reducer. If two spoken lines are separated by a gap shorter than the release-and-attack window, the background volume remains held at the ducked floor.  
> * **Deliberate Silence Gating:** In strict narrative or *chosisme* production profiles where dramatic musical scoring is prohibited, deliberate dramatic silences are encoded as explicit ducking events, attenuating background beds down to **\-24 dB**.  
> * **Geometric Sound Bed Mapping (Kinetic Curves):** Ambient sound beds are structured around measurable acoustic properties rather than emotional mood tags. The screenplay's 6-Beat Kinetic Curve serves as a machine-readable automation script:  
  * *Curve Level (1–10):* Maps directly into loop layer density, saturation, and gain staging.  
  * *Curve Phase:* Serves as a database query key into the loop library, matching files indexed by objective physical parameters, including spectralCentroidHz, intensityBand, seamlessLoop, and durationFrames.

---

*User prompt: {{FOCUS: Model Adapter Conformance (Worker-Sower-Conductor)}} /extreme-details*

### **Response: The Universal Timeline Decoupling Axiom**

A core architectural vulnerability in generative media systems is coupling universal narrative time to the idiosyncratic hardware quirks of a specific diffusion model. If an engine defines its master timeline using the frame lattice of a specific checkpoint, the entire narrative architecture becomes hostage to that model. The worker-sower-conductor strictly enforces the **Separation of Meaning, Universal Time, and Adapter Representation**:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ UNIVERSAL MASTER TIMELINE (worker-sower-conductor / Remotion)          │`  
`│ • Desired Duration (ffprobe millisecond-accurate acoustic truth)       │`  
`│ • Locked Master Delivery Clock: Rigid 24.0 fps integer grid            │`  
`│ • Pure Representation-Agnostic Timing Coordinates                      │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ BACKEND MODEL ADAPTER (Isolated Conformance Layer)                     │`  
`│ • Encapsulates: Native frame rates (12, 16, 24 fps)                   │`  
`│ • Encapsulates: Latent lattice bounds (e.g., 4n + 1 Causal VAEs)       │`  
`│ • Encapsulates: Spatial/Temporal downsampling ratios & latent channels │`  
`│ • Computes: Dynamic padding, tail trims, and cadence conformance       │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Model-Specific Execution Contract`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ MODEL-SPECIFIC FOUNDRY EXECUTION (ComfyUI on Rig 2 / Headless GPU)     │`  
`│ • Wan 2.1 / Wan 2.2 / HunyuanVideo / Flux / SDXL Generation            │`  
`│ • Emits: Raw diffusion plate conformed to model-native tensor shape    │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Physical Plate Return`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ CONFORMED OPTICAL RESULT (Episode_XXX.tsx)                             │`  
`│ • Trim excess tail padding; conform cadence to master 24 fps           │`  
`└────────────────────────────────────────────────────────────────────────┘`

The universal compiler knows only three parameters: desired duration, desired frame timing, and desired visual result. The backend model adapter encapsulates native frame rates, valid latent sizes, padding rules, and sampling constraints. This isolation guarantees that replacing a diffusion checkpoint (e.g., swapping Wan 2.2 for a future architecture) requires updating only the adapter, leaving the upstream story engine and downstream optical compositor untouched.

### **The Mathematical Lattice Mechanics: 3D Causal VAEs (4*n*\+1)**

Video diffusion backends featuring 3D causal Variational Autoencoders (VAEs)—such as the Wan 2.1 and Wan 2.2 families—compress video both spatially and temporally. While spatial downsampling compresses spatial resolution by 8×, the temporal downsampler compresses consecutive frames along the timeline by a factor of 4×.

Because causal VAE architectures process the initial anchor frame independently before evaluating subsequent temporal latent blocks of 4 frames, the input frame count must satisfy an immutable discrete lattice:

Framesnative​\=4*n*\+1where *n*∈N(17,21,25,29,33,49,65,77,81,…)

Attempting to feed an arbitrary integer frame budget (e.g., 75 frames) directly into a 3D causal VAE decoder causes internal tensor shape mismatches, triggering low-level PyTorch tensor assertion errors, CUDA kernel aborts, or corrupted green-screen plates.

#### **The Non-Negotiable Ceiling Allocation Formula**

A naive implementation might round to the nearest valid lattice coordinate or apply a floor function (4⌊*N*/4⌋+1). **Flooring is strictly prohibited in the conductor adapter**. Truncating a generation allocation below the audio duration yields a visual plate that underruns the spoken dialogue stem, causing frozen mouth holds, dropped visemes, and broken cuts.

The conductor adapter applies a strict ceiling-based lattice allocation:

> 1. **Calculate Native Raw Frames:**  
>    *N*raw​\=⌈(1000*D*ms​​)×model\_native\_fps⌉  
> 2. **Calculate Lattice Step Index (*n*):**  
>    *n*\=⌈4*N*raw​−1​⌉  
> 3. **Compute Mandatory Diffusion Allocation:**  
>    diffusion\_allocation=4*n*\+1=4×⌈4*N*raw​−1​⌉\+1

`// src/adapters/wanVideoAdapter.ts`  
`export interface LatticeAllocation {`  
  `rawNativeFrames: number;`  
  `diffusionAllocation: number;`  
  `tailPaddingFrames: number;`  
  `masterDeliveryFrames: number;`  
`}`

`export function computeWanLattice(durationMs: number, nativeFps: number = 24): LatticeAllocation {`  
  `const masterDeliveryFrames = Math.max(1, Math.ceil((durationMs / 1000) * 24));`  
  `const rawNativeFrames = Math.max(1, Math.ceil((durationMs / 1000) * nativeFps));`  
    
  `// Non-negotiable ceiling allocation over 4n + 1 lattice`  
  `const n = Math.ceil((rawNativeFrames - 1) / 4);`  
  `const diffusionAllocation = (4 * n) + 1;`  
  `const tailPaddingFrames = diffusionAllocation - rawNativeFrames;`

  `return {`  
    `rawNativeFrames,`  
    `diffusionAllocation,`  
    `tailPaddingFrames,`  
    `masterDeliveryFrames`  
  `};`  
`}`

### **Cadence Engineering & Temporal Resampling Configurations**

The master delivery format across the entire pipeline is locked to **24.0 fps integer time**. However, video diffusion backends are frequently trained on alternative native sampling rates, such as 12 fps, 16 fps, or 24 fps. Direct playback of a 16 fps plate on a 24 fps timeline introduces a 1.5× pull-down ratio (alternating 2-frame and 1-frame holds), producing visual motion judder and unnatural character movement.

The conductor's model adapter resolves temporal divergence through three mutually exclusive configurations:

`CONFIGURATION A: NATIVE 12 FPS ("ON TWOS" — ZERO JUDDER)`  
`Acoustic Clock: 3,120 ms ──► Raw Native: 38f ──► 4n+1 Lattice: 41f`  
`Diffusion Plate (12 fps): [ F01 ][ F02 ][ F03 ] ... [ F41 ]`  
`Remotion Conformance:     Duplicate 1:2 ──► 82 frames at 24 fps`  
`Master Trim:              Trim last 7 frames ──► Pinned 75 frames at 24 fps`

`CONFIGURATION B: NATIVE 24 FPS (DIRECT IDENTITY MATCH)`  
`Acoustic Clock: 3,120 ms ──► Master Budget: 75f ──► 4n+1 Lattice: 77f`  
`Diffusion Plate (24 fps): Generates 77 frames directly`  
`Master Trim:              Trim last 2 frames ──► Pinned 75 frames at 24 fps`

`CONFIGURATION C: NATIVE 16 FPS (TEMPORAL RETIMING / RIFE INTERPOLATION)`  
`Acoustic Clock: 3,120 ms ──► Raw Native: 50f ──► 4n+1 Lattice: 53f`  
`Diffusion Plate (16 fps): Truncate 3 padding frames ──► Exactly 50 native frames`  
`Optical Flow Engine:      Resample 16 fps ──► 24 fps via motion vectors`

#### **Configuration A: Native 12 fps ("On Twos" Animation Standard)**

> * **Target Application:** Traditional animated styles or stylized character acting where motion "on twos" is aesthetically desirable.  
> * **Mathematical Walkthrough (*D*ms​\=3,120 ms):**  
  * Master 24 fps target: ⌈3.120×24⌉=75 frames (3.125 s).  
  * Native 12 fps raw requirement: *N*raw​\=⌈3.120×12⌉=38 frames.  
  * Lattice conformance: *n*\=⌈(38−1)/4⌉=10⟹diffusion\_allocation=4(10)+1=41 frames.  
  * Optical conversion: Every native frame is held for exactly two 24 fps ticks (41×2=82 frames at 24 fps).  
  * Tail trim: The 7 excess frames (82−75) are trimmed at the cut boundary.  
  * *Cadence Guarantee:* Produces an exact, uniform 2:2 frame cadence with zero fractional judder.

#### **Configuration B: Native 24 fps (Direct Master Match)**

> * **Target Application:** Checkpoints trained natively on 24 fps data (e.g., custom fine-tunes or high-tier video foundations).  
> * **Mathematical Walkthrough (*D*ms​\=3,120 ms):**  
  * Master 24 fps target: 75 frames.  
  * Lattice conformance: *n*\=⌈(75−1)/4⌉=19⟹diffusion\_allocation=4(19)+1=77 frames.  
  * Tail trim: The 2 excess tail frames (77−75) are trimmed during assembly.  
  * *Cadence Guarantee:* 1:1 temporal identity mapping with zero motion interpolation artifacts.

#### **Configuration C: Native 16 fps (Optical Flow Resampling)**

> * **Target Application:** Default base models natively trained at 16 fps (e.g., baseline Wan 2.1).  
> * **Mathematical Walkthrough (*D*ms​\=3,120 ms):**  
  * Native 16 fps raw requirement: *N*raw​\=⌈3.120×16⌉=50 frames.  
  * Lattice conformance: *n*\=⌈49/4⌉=13⟹diffusion\_allocation=4(13)+1=53 frames.  
  * Tail trim: Trim 3 padding frames to isolate the exact 50 native frames (3.125 s).  
  * Resampling: Dispatches through a motion-vector interpolation engine (e.g., RIFE) or speed retiming to convert 50 frames at 16 fps into 75 frames at 24 fps.

### **The 4*n*\+1 Sawtooth Waste Cost Model & Pre-Dispatch Optimization**

Because 4*n*\+1 is a discrete step function, hardware resource consumption does not scale linearly with dialogue duration. Instead, compute allocation exhibits a periodic **sawtooth efficiency curve**:

`Compute Cost / Allocated Frames`  
  `▲`  
`45│                                              ┌────────── (n = 11: 45 frames)`  
  `│                                  ┌───────────┘`  
`41│                      ┌───────────┘ (n = 10: 41 frames)`  
  `│          ┌───────────┘ (n = 9: 37 frames)`  
`37│          │`  
  `└──────────┴───────────┴───────────┴───────────┴───────────► Raw Native Frames`  
            `34          37  38                  41`

| Raw Native Frames Required (*N*raw​) | Lattice Step (*n*) | Allocated Frames (4*n*\+1) | Wasted Compute Frames | GPU Overhead Penalty |
| :---- | :---- | :---- | :---- | :---- |
| **34 frames** | 9 | **37 frames** | 3 frames | \+8.8% compute waste |
| **36 frames** | 9 | **37 frames** | 1 frame | \+2.7% compute waste |
| **37 frames** | 9 | **37 frames** | 0 frames | **0.0% (Optimal Efficiency)** |
| **38 frames** | 10 | **41 frames** | 3 frames | \+7.8% compute waste |

A single additional frame requirement (crossing from 37 to 38 frames) forces the model to allocate a full 4-frame latent block, resulting in 3 discarded frames and an immediate GPU compute penalty.

#### **The Frame-Waste Audit Diagnostic (scripts/audit-frame-waste.ts)**

To prevent GPU waste on consumer or dedicated render nodes, the conductor executes a pre-dispatch audit on all audio stems before jobs are sent over the network:

`// scripts/audit-frame-waste.ts`  
`export interface FrameWasteAudit {`  
  `shotId: string;`  
  `durationMs: number;`  
  `rawFrames: number;`  
  `allocatedFrames: number;`  
  `wastedFrames: number;`  
  `isWasteful: boolean;`  
  `slackMsToSaveStep: number;`  
`}`

`export function auditShotFrameWaste(shotId: string, durationMs: number, nativeFps: number = 24): FrameWasteAudit {`  
  `const rawFrames = Math.ceil((durationMs / 1000) * nativeFps);`  
  `const n = Math.ceil((rawFrames - 1) / 4);`  
  `const allocatedFrames = 4 * n + 1;`  
  `const wastedFrames = allocatedFrames - rawFrames;`  
    
  `// Calculate millisecond reduction required to drop to step (n - 1)`  
  `const targetRaw = 4 * (n - 1) + 1;`  
  `const targetDurationMs = (targetRaw / nativeFps) * 1000;`  
  `const slackMsToSaveStep = Math.max(0, durationMs - targetDurationMs);`

  `return {`  
    `shotId,`  
    `durationMs,`  
    `rawFrames,`  
    `allocatedFrames,`  
    `wastedFrames,`  
    `isWasteful: wastedFrames >= 2,`  
    `slackMsToSaveStep: Math.round(slackMsToSaveStep)`  
  `};`  
`}`

If a shot falls on a sawtooth peak with 3 wasted frames, the conductor logs an optimization advisory:

`[ADAPTER AUDIT] Shot ep01_sc03_sh002: Duration 1,580 ms requires 38 native frames (n=10 -> 41 frames).`  
`[ADAPTER ADVISORY] Wasting 3 frames (7.8% GPU overhead). Trimming 42 ms of acoustic tail silence`   
`drops allocation to n=9 (37 frames), saving ~4.2s of KSampler compute on Rig 2.`

### **Typed Socket Contracts & Latent Space Compatibility**

A frequent point of failure in mixed-modality ComfyUI environments is **latent space corruption**: attempting to pipe the latent tensor of an SDXL checkpoint into a Wan 2.2 sampler, or connecting a 16-channel FLUX latent into an 8-channel temporal upscaler. While these inputs may parse generically as 4D PyTorch tensors at the coarse socket layer (LATENT), the internal mismatch results in solid gray noise, CUDA memory segmentation faults, or severe driver aborts.

ComfyUI validates connections at runtime using coarse strings (LATENT, IMAGE, MODEL), which fails to detect model family mismatches natively. The conductor's model adapter prevents this by enforcing an upstream **Typed Socket Contract Matrix** before dispatching workflows to Rig 2:

| Model Family | Latent Channel Depth | Spatial Downsampling | Temporal Downsampling | Compatible VAE Decoder Classes | Model Class / Constraints |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **SDXL 1.0** | 4 Channels | 8× (1024→128) | None (1×) | VAEDecode | Standard 2D Latent |
| **Flux.1-dev** | 16 Channels | 8× (1024→128) | None (1×) | FluxVAEDecode | 16-channel DiT Latent |
| **Wan 2.1 / 2.2** | 16 Channels | 8× (1024→128) | **4× Temporal** | WanVideoDecode | **Requires 4*n*\+1 frame lattice** |
| **HunyuanVideo** | 16 Channels | 8× (1024→128) | **4× Temporal** | HunyuanVideoDecode | **Requires 4*n*\+1 frame lattice** |
| **BiRefNet** | Tensor Masks | N/A (Image Pixel Space) | N/A | AlphaCleanComposite | Direct Image/Mask Processing |

`// src/schemas/socketContracts.ts`  
`import { z } from "zod";`

`export const LatentFamilySchema = z.enum(["SDXL", "FLUX_1", "WAN_2_2", "HUNYUAN_VIDEO"]);`

`export const SocketContractSchema = z.object({`  
  `nodeId: z.string(),`  
  `outputIndex: z.number(),`  
  `dataType: z.enum(["MODEL", "CLIP", "CONDITIONING", "LATENT", "IMAGE", "MASK"]),`  
  `latentFamily: LatentFamilySchema.optional(),`  
  `channelDepth: z.number().optional(),`  
  `temporalCompression: z.number().optional()`  
`});`

`export function validateWorkflowWiring(sourceSocket: SocketContract, targetSocket: SocketContract): void {`  
  `if (sourceSocket.dataType !== targetSocket.dataType) {`  
    ``throw new Error(`Socket Type Mismatch: Cannot connect ${sourceSocket.dataType} to ${targetSocket.dataType}`);``  
  `}`  
    
  `if (sourceSocket.dataType === "LATENT") {`  
    `if (sourceSocket.latentFamily !== targetSocket.latentFamily) {`  
      `throw new Error(`  
        `` `Fatal Latent Incompatibility: Cannot route ${sourceSocket.latentFamily} latent ` + ``  
        `` `into ${targetSocket.latentFamily} sampler socket.` ``  
      `);`  
    `}`  
  `}`  
`}`

### **Ingress & Hardware Dispatch Integration**

Once the conductor's model adapter resolves temporal quantization, lattice conformance, and socket verification, it translates the abstract render intent into the concrete SpokeExecutionPayload:

`// src/dispatch/payloadBuilder.ts`  
`import { computeWanLattice } from "../adapters/wanVideoAdapter.js";`  
`import type { SpokeExecutionPayload } from "../types/contracts.js";`

`export function buildWanShotPayload(`  
  `sceneId: string,`  
  `shotId: string,`  
  `durationMs: number,`  
  `prompt: string,`  
  `loraTag: string,`  
  `seed: number`  
`): SpokeExecutionPayload {`  
  `const lattice = computeWanLattice(durationMs, 24);`

  `return {`  
    `type: "ENQUEUE_SHOT",`  
    ``jobId: `${sceneId}_${shotId}`,``  
    `artistId: "artist_rig1",`  
    `workflowTemplate: "wan_greenscreen_i2v.json",`  
    `payload: {`  
      ``prompt: `${prompt}, solid #00FF00 green screen background, clean rim lighting`,``  
      `negativePrompt: "photorealistic background, complex foliage, room interior, artifacts",`  
      `loraTag,`  
      `targetPromptNodeId: "6",       // Injected into CLIPTextEncode (Positive)`  
      `targetFrameNodeId: "37",      // Injected into WanLatentImage (length)`  
      `targetSeedNodeId: "3",        // Injected into KSampler (seed)`  
      `diffusionAllocation: lattice.diffusionAllocation, // Conformed 4n + 1 frames`  
      `masterDeliveryFrames: lattice.masterDeliveryFrames, // Locked 24fps target frames`  
      `seed`  
    `}`  
  `};`  
`}`

`RIG 1: worker-sower-conductor               RIG 2: media-broker (Port 8188)`  
`┌──────────────────────────────┐            ┌──────────────────────────────┐`  
`│ buildWanShotPayload()        │            │ LocalComfyProvider           │`  
`│ • Duration: 3,120 ms         │            │ • Pulls LoRAs via s5cmd      │`  
`│ • Allocation: 77 frames      │            │ • Injects Node 37: 77f       │`  
`│ • Target Delivery: 75 frames │            │ • Injects Node 06: Prompt    │`  
`└──────────────┬───────────────┘            └──────────────┬───────────────┘`  
               `│                                           │`  
               `▼ JSON-RPC over WebSocket                   ▼ HTTP POST /prompt`  
`┌──────────────────────────────┐            ┌──────────────────────────────┐`  
`│ edge-director                │            │ Headless ComfyUI Daemon      │`  
`│ • Single-Threaded Mutex      │───────────►│ • 100% VRAM Wan 2.2 Sampling │`  
`│ • Issues 30s Heartbeat Lease │            │ • Renders 77 frames (#00FF00)│`  
`└──────────────────────────────┘            └──────────────┬───────────────┘`  
                                                           `│`  
                                                           `▼ Upload Proxy`  
                                            `┌──────────────────────────────┐`  
                                            `│ Cloudflare R2 / Disk Share   │`  
                                            `│ out/ep01_sc03_sh001.mp4      │`  
                                            `└──────────────┬───────────────┘`  
                                                           `│`  
               `Asset Ingestion & Remotion Conformance      │`  
               `◄───────────────────────────────────────────┘`  
`┌────────────────────────────────────────────────────────┐`  
`│ Episode_XXX.tsx: Master Optical Assembly (Rig 1)       │`  
`│ <Sequence durationInFrames={75} from={0}>              │`  
`│   <CharacterPlate src="out/ep01_sc03_sh001.mp4"        │`  
`│                   trimEndFrames={2} />                 │`  
`│   <Audio src="dialogue_sh001.wav" />                   │`  
`│ </Sequence>                                            │`  
`└────────────────────────────────────────────────────────┘`

#### **Downstream Source-Baking & Conformance**

When the media broker returns the completed proxy MP4 from Rig 2, the conductor's code generator (generate-episode-repo.ts) writes the exact conformance instructions into the static Remotion manifest (Episode\_XXX.tsx):

> * **durationInFrames:** Locked strictly to masterDeliveryFrames (e.g., 75), derived from the acoustic duration.  
> * **trimEndFrames:** Hardcoded to the exact delta between the diffusion allocation and the master budget (e.g., trimEndFrames={2}).  
> * **playbackRate:** Preserved at 1.0 (direct match for 24 fps native) or 0.5 (for 12 fps native "on twos").

This end-to-end design ensures that hardware-specific constraints (such as temporal downsampling lattices and VAE channel structures) remain fully encapsulated within the adapter, allowing the universal master timeline to compile with frame-accurate precision across distributed workstations.

---

*User prompt: {{FOCUS: Hardware Dispatch & Edge Multiplexing (Worker-Sower-Conductor)}} /extreme-details*

### **Response: Architectural Role & The Tripartite Topology**

The hardware dispatch and edge multiplexing layer bridges the CPU-bound orchestration host (**Rig 1 / The Conductor**), the serverless edge control plane (**edge-director / POD-12**), and the high-VRAM GPU rendering foundry (**Rig 2 / media-broker**).

`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: THE CONDUCTOR (worker-sower-conductor)                                          │`  
`│ • Local CPU/RAM Host: Ingests AST, quantizes 24fps frames, compiles dispatch payload   │`  
`│ • Client Network Bridge: src/dispatch/edgeDirectorClient.ts (Signed JWT + Idempotency) │`  
`└───────────────────────────────────┬────────────────────────────────────────────────────┘`  
                                    `│ HTTPS POST / Duplex Authenticated WSS`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE EDGE: edge-director (POD-12: System Middleware)                             │`  
`│                                                                                        │`  
`│  ├── Ingress Gateway (src/index.ts via Hono)                                           │`  
`│  │   • Validates JWTs, artist service tokens, and Zod execution schemas                │`  
`│  │   • Queries Cloudflare D1: Verifies scene is clean (is_dirty == 0)                  │`  
`│  │   • Upgrades HTTP connections to persistent WebSockets                              │`  
`│  │                                                                                     │`  
`│  └── ShotCoordinatorDO (src/ShotCoordinator.ts - Cloudflare Durable Object)            │`  
`│      • WebSocket Hibernation: Maintains duplex client/broker streams at $0 idle cost   │`  
`│      • Hardware Mutex: Serializes GPU access via strict single-threaded FIFO queue     │`  
`│      • Lease Engine: Issues 30s heartbeat-renewed leases with monotonic fencing tokens │`  
`│      • Watchdog Alarms: ctx.storage.setAlarm() dead-man's switch with DLQ routing      │`  
`│      • Telemetry Bus: Relays live progress ticks and signed R2 asset delivery URLs     │`  
`└───────────────────────────────────┬────────────────────────────────────────────────────┘`  
                                    `│ Persistent WSS / Outbound cloudflared Tunnel`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: THE FOUNDRY (media-broker + Headless ComfyUI on Port 8188)                      │`  
`│ • Pulls ONE leased job at a time when local OS-level flock is free                     │`  
`│ • Flushes VRAM (/free), injects parameters into modular ComfyUI JSON, samples latents   │`  
`│ • Streams telemetry, uploads master .mp4 plate to Cloudflare R2, returns sentinel      │`  
`└────────────────────────────────────────────────────────────────────────────────────────┘`

In a distributed generative studio, multiple remote artists operating on lightweight laptops or Rig 1 orchestration nodes share a single workstation GPU (e.g., an RTX 3090, 4090, or 5070 running 20GB+ diffusion checkpoints like Wan 2.2). Direct unmediated network access to ComfyUI's native port (127.0.0.1:8188) invites immediate disaster: concurrent tensor allocations trigger catastrophic CUDA Out-Of-Memory (OOM) crashes, corrupted graph states, and dropped connections.

The dispatch subsystem eliminates these failure modes by enforcing a strict physical separation of concerns:

> * **Rig 1 (worker-sower-conductor):** Expresses pure *intent* and temporal constraints, holding zero GPU compute dependencies.  
> * **Cloudflare Edge (edge-director):** Functions as a stateful traffic controller, concurrency governor, and single-threaded serialization gate, holding zero canonical narrative authority and zero media-rendering binaries.  
> * **Rig 2 (media-broker):** Acts as a stateless, untrusted compute spoke dedicated 100% to VRAM allocation and tensor operations.

### **The Dispatch Contract: SpokeExecutionPayload**

Upstream orchestration systems and human artists never interact directly with ComfyUI's internal node execution graphs or worry about low-level memory addressing. Instead, src/dispatch/payloadBuilder.ts on Rig 1 compiles the conformed frame math, character LoRA requirements, and prompt tokens into an immutable, strongly typed execution contract:

`// Shared Contract: SpokeExecutionPayload.ts`  
`import { z } from "zod";`

`export const SpokeExecutionPayloadSchema = z.object({`  
  `type: z.literal("ENQUEUE_SHOT"),`  
  `jobId: z.string(),                          // e.g. "EP101_SC02_SH003"`  
  `artistId: z.string(),                       // Tenant/Artist identifier for fair scheduling`  
  `idempotencyKey: z.string().uuid(),          // UUIDv7 unique dispatch key`  
  `workflowTemplate: z.enum([`  
    `"wan_greenscreen_i2v.json",`  
    `"flux_matte_background.json",`  
    `"inpaint_repair.json"`  
  `]),`  
  `payload: z.object({`  
    `sceneId: z.string(),`  
    `shotId: z.string(),`  
    `prompt: z.string(),                       // Subject tokens + "#00FF00 background, rim lighting"`  
    `negativePrompt: z.string(),               // Photorealistic clutter, complex background`  
    `loraTag: z.string(),                      // Character LoRA weights and network rank`  
    `targetPromptNodeId: z.string(),           // Target CLIP Text Encode node ID`  
    `targetFrameNodeId: z.string(),            // Target WanLatentImage frame length node ID`  
    `targetSeedNodeId: z.string(),             // Target KSampler seed node ID`  
    `diffusionAllocation: z.number().int(),    // Conformed 4n + 1 frame lattice`  
    `masterDeliveryFrames: z.number().int(),   // Master 24fps frame count locked by ffprobe`  
    `seed: z.number().int().nonnegative()      // Deterministic PRNG seed`  
  `})`  
`});`

`export type SpokeExecutionPayload = z.infer<typeof SpokeExecutionPayloadSchema>;`

This contract guarantees that if ComfyUI custom node IDs change or if the studio migrates its render backend to an external cloud cluster (such as RunPod Serverless), the upstream conductor requires zero code rewrites.

### **Ingress Gatekeeping & Relational Pre-Flight Gating (Cloudflare D1)**

Before an incoming execution payload is admitted to the hardware queue or consumes any memory, the ingress edge gateway (src/index.ts via Hono) enforces a two-tier gatekeeping pass:

#### **1\. Cryptographic and Schema Pre-Flight**

The edge gateway verifies remote artist credentials and machine service tokens via signed JWTs or Cloudflare Access service headers. Payload JSON structures are validated against SpokeExecutionPayloadSchema via Zod. Malformed graph definitions, invalid characters, or path-traversal strings are rejected at the edge boundary with an immediate HTTP 400 Bad Request.

#### **2\. The Relational Continuity Gate (is\_dirty \== 0\)**

Generative video diffusion is computationally expensive; rendering frames for an obsolete screenplay scene burns hardware capacity and budget. Rather than relying on semantic LLM checks, the edge gateway queries the canonical relational ledger in Cloudflare D1 (CANON\_DB):

`SELECT COUNT(*) AS dirty_count`  
`FROM scene_fact_dependencies`  
`WHERE scene_id = ? AND is_dirty = 1;`

> * **Sub-5ms Short-Circuit:** If upstream narrative state has mutated (e.g., an entity's somatic condition decayed, an item was dropped, or a duel was resolved without re-compiling the scene's dialogue AST), dirty\_count \> 0\.  
> * **Rejection Response:** The ingress gateway halts execution before the payload touches the hardware queue, returning HTTP 412 Precondition Failed:  
>   `{`  
>     `"error": "DIRTY_SCENE_REJECTED",`  
>     `"sceneId": "EP101_SC02",`  
>     `"dirtyDependencies": 1,`  
>     `"message": "Upstream canon changed. Re-lint and re-compile scene AST before queuing render."`  
>   `}`

This eliminates wasted GPU compute on invalid scenes at zero compute cost.

### **Single-Threaded Mutex & Queue Architecture (ShotCoordinatorDO)**

Once validated, the payload is routed to the ShotCoordinatorDO Durable Object via Cloudflare Workers RPC. The Durable Object implements the **Actor Model**, functioning as the centralized hardware mutex and asynchronous dispatch queue.

#### **The Single-Threaded Mutex Guarantee**

Durable Objects run as single, stateful V8 isolates bound to a deterministic global name (e.g., idFromName("global-render-queue")).

> * **ACID in RAM:** Memory access inside the isolate is strictly single-threaded. All incoming requests, cancellations, and telemetry webhooks pass through a single event loop.  
> * **Race Condition Elimination:** Standard microservice race conditions—such as two concurrent requests bypassing an if (\!isRendering) check—are structurally impossible. Rig 2 is guaranteed 100% dedicated access to GPU VRAM for the duration of a render.  
> * **Strict Gate Progression:** The active GPU lock is released, and a new job is dispatched to Rig 2, *only* when one of three absolute conditions is met:  
  1. The active job completes cleanly and returns a valid BROKER\_COMPLETE sentinel payload.  
  2. The watchdog timer trips a dead-man's switch, marking the job as failed and quarantining it to the Dead-Letter Queue (DLQ).  
  3. A human showrunner or artist issues an explicit cancellation command (POST /jobs/:id/cancel), clearing the lock and commanding Rig 2 to dump its VRAM.

#### **Fair Scheduling and Per-Tenant Round-Robin**

In a multi-artist studio, a pure FIFO queue creates a severe starvation hazard: if Artist A queues a 50-shot animatic, Artist B submitting a single-frame revision would be blocked for 40+ minutes. The ShotCoordinatorDO mitigates this by maintaining a fair round-robin interleaving algorithm across artistId tags:

`private getNextFairJob(): ExecutionJob | undefined {`  
  `if (this.queue.length === 0) return undefined;`  
    
  `const lastArtistId = this.activeJob?.artistId;`  
  `// Look for the next job in the queue owned by a different artist`  
  `const alternateIndex = this.queue.findIndex(job => job.artistId !== lastArtistId);`  
    
  `if (alternateIndex !== -1) {`  
    `return this.queue.splice(alternateIndex, 1)[0];`  
  `}`  
    
  `return this.queue.shift();`  
`}`

A queue saturated with requests (\[A, A, A, B\]) is dynamically reordered into (\[A, B, A, A\]), ensuring interactive revisions execute promptly without starving batch runs.

#### **Transactional Transport Idempotency**

Mobile and remote artists working on volatile Wi-Fi networks frequently drop packets, triggering aggressive client-side UI retry loops.

> * Every incoming job requires an idempotencyKey cryptographically bound to the task fingerprint.  
> * The DO inspects its transactional key-value store (ctx.storage).  
> * **Pending/Running Jobs:** If a matching key exists and is marked PENDING or PROCESSING, the DO ignores duplicate queue insertion and returns the active job status immediately.  
> * **Completed Jobs:** If the key is marked COMPLETED, the DO bypasses Rig 2 entirely and immediately returns the cached, signed Cloudflare R2 asset link, preventing redundant GPU execution.

### **WebSocket Hibernation Multiplexing & Reconnection Protocols**

Maintaining persistent, stateful TCP socket streams between distributed client workstations and the GPU foundry introduces a severe economic and architectural vulnerability: long-lived cloud instances charge continuously for idle server memory while waiting for long diffusion jobs to finish.

The ShotCoordinatorDO resolves this using Cloudflare's **WebSocket Hibernation API**:

`// Inside ShotCoordinatorDO.ts fetch() handler`  
`if (url.pathname === "/ws") {`  
  `if (request.headers.get("Upgrade") !== "websocket") {`  
    `return new Response("Expected WebSocket", { status: 426 });`  
  `}`  
    
  `const pair = new WebSocketPair();`  
  `const [client, server] = Object.values(pair);`  
  `const role = url.searchParams.get("role") || "artist"; // 'artist' or 'broker'`

  `// Accept socket and tag by role`  
  `this.ctx.acceptWebSocket(server, [role]);`  
  `return new Response(null, { status: 101, webSocket: client });`  
`}`

#### **1\. Zero Idle-Cost Operation**

Once the socket is accepted via this.ctx.acceptWebSocket(), the V8 JavaScript isolate is serialized and evicted from edge server RAM. Cloudflare's Anycast proxy holds the bare TCP connection. While Rig 2 spends 60 to 120 seconds sampling latents, the edge coordinator incurs **\$0.00 in billable CPU duration charges**.

#### **2\. Sub-2ms Wake-Up Cycle**

When Rig 2 emits a progress payload over the outbound tunnel, the edge proxy detects the incoming bytes and wakes the Durable Object isolate in under 2 milliseconds. The DO's webSocketMessage() handler executes, relays the telemetry payload to all hibernating sockets tagged "artist", and immediately hibernates again.

#### **3\. Application-Layer Keep-Alives & The Coma State**

Standard TCP keep-alives are too sluggish to reliably catch dropped connections on mobile workstations. The protocol enforces an explicit application-layer ping/pong exchange:

> * **The 2-Second Pulse:** The client SDK and edge coordinator exchange application-level system.ping / system.pong frames every 2 seconds.  
> * **The Coma State:** If three consecutive pings are missed (6 seconds of silence), the connection is declared dead. The artist's cockpit freezes the viewport, greys out controls, and transitions to a "Reconnecting..." Coma State rather than spinning indefinitely.  
> * **Custom Close Codes:** The system reserves codes in the 4000–4999 range (e.g., 4001: LEASE\_EXPIRED, 4002: KILLED\_BY\_ADMIN, 4003: IDEMPOTENCY\_COLLISION) to distinguish purposeful disconnects from transient network failures.  
> * **Deterministic Reconnection Jitter:** To prevent a "thundering herd" reconnect storm from taking down the edge gateway when a regional network blip clears, client SDKs implement exponential backoff combined with randomized jitter between 100 ms and 5,000 ms.

### **Distributed Leases, Monotonic Epoch Fencing & Watchdogs**

The core distributed systems hazard when orchestrating long-running jobs over volatile network tunnels is the **Split-Brain Zombie Runner Problem**:

`[ edge-director (DO) ]                                            [ media-broker (Rig 2) ]`  
        `│                                                                     │`  
        `├──────────── Lease Granted (Epoch: 1) ──────────────────────────────►│ (Starts Render)`  
        `│                                                                     │`  
        `│   x--- Network Partition (Tunnel Drops Packets for 35s) ---x        │`  
        `│                                                                     │`  
        `├─ 30s Hardware Alarm Trips                                           │ (Still rendering...)`  
        `├─ Revokes Lease Epoch 1                                              │`  
        `├─ Re-queues Job to Rig 2B (Epoch: 2)                                 │`  
        `│                                                                     │`  
        `│◄─────────── Zombie Uploads Plate (Carrying Epoch 1) ────────────────┤ (Finishes Render)`  
        `│                                                                     │`  
        `└─── REJECTED VIA FENCING TOKEN ───► [ Drop Write / HTTP 409 ]        │`

If Rig 2 initiates a heavy diffusion pass and the network tunnel drops packets for 35 seconds, the edge must not hang indefinitely waiting for the partitioned worker. However, if the edge reassigns the job to Worker B, Worker A (now a "zombie") may eventually finish and attempt to overwrite Worker B's newer, canonical output.

The pipeline resolves this through a three-part distributed fencing architecture:

#### **1\. Time Authority & Heartbeat-Renewed Leases**

Static timeout windows (e.g., an arbitrary 180-second TTL) are strictly banned because they inevitably kill legitimate, complex video diffusion jobs mid-render. Instead, the ShotCoordinatorDO acts as the sole arbiter of time, issuing dynamic, heartbeat-renewed leases:

> * **The 30-Second Window:** When a job is leased, the DO sets an expiration window exactly 30 seconds into the future.  
> * **The 10-Second Pulse:** The media-broker on Rig 2 must send an HTTP POST /heartbeat or a WebSocket BROKER\_HEARTBEAT every 10 seconds. Each valid heartbeat pushes the DO's expiration window out by \+30 seconds.  
> * **Thread Isolation Requirement:** The heartbeat pulse on Rig 2 must run inside an independent background thread or Web Worker, completely decoupled from the main Node.js event loop and PyTorch process. If the main process blocks while calculating SHA-256 hashes on a 2GB video file, the heartbeat does not stall, preventing the edge from falsely declaring the worker dead.  
> * **Absolute Execution Ceiling:** To catch rogue processes stuck in infinite generation loops, the DO enforces an absolute job ceiling of 15 minutes, after which the lease is revoked regardless of active heartbeats.

#### **2\. Monotonic Fencing Tokens & Content-Addressed Promotion**

Because object storage services like Cloudflare R2 and AWS S3 cannot natively evaluate custom application fencing tokens during raw PUT operations, fencing is enforced through an atomic promotion pattern:

> 1. **Epoch Grant:** When a worker claims a job, the DO increments an internal monotonic counter (*N*→*N*\+1) and stamps the lease with epoch: N+1.  
> 2. **Staging Upload:** The worker uploads its raw render to an epoch-scoped, content-addressed staging path:  
>    `staging/renders/${taskId}/epoch_${epoch}_${sha256}.mp4`

3\. **Completion Sentinel:** The worker issues a completion RPC (POST /tasks/complete) to the DO, passing its assigned epoch token. 4\. **Epoch Validation:** The DO checks the incoming epoch token against the active lease in ctx.storage. If the worker stalled, its lease timed out, and the job was reassigned to Epoch *N*\+2, the DO rejects the sentinel with **HTTP 409 Conflict**. 5\. **Canonical Promotion:** The rejected staging asset is never referenced in canonical episode manifests and is automatically pruned by an R2 lifecycle retention rule. A zombie worker can write bytes to storage, but it can never promote those bytes into canonical production truth.

#### **3\. Proactive Watchdog Hardware Alarms**

Relying on incoming HTTP requests to discover a dead worker is a dangerous, passive pattern. The ShotCoordinatorDO leverages Cloudflare's ctx.storage.setAlarm() API to establish a proactive watchdog alarm exactly 30 seconds into the future:

> * Every valid heartbeat pushes the alarm forward (ctx.storage.setAlarm(Date.now() \+ 30000)).  
> * If Rig 2 drops offline or loses power, missing three consecutive heartbeats, the hardware alarm fires autonomously inside the edge isolate.  
> * The DO's alarm() handler revokes the active lease, increments the retry attempt counter, requeues the job (up to an attempt limit of 2), or routes it to the Dead-Letter Queue (DLQ) while alerting connected clients.

### **Inverted Hardware Sovereignty (Local flock) & Graceful Degradation**

A fundamental architectural insight of the pipeline is that **the remote cloud edge must never hold an authoritative lock over a local physical workstation**.

If the edge DO held the exclusive hardware lock (telling Rig 2 *"you own the GPU now"*), any network partition or dropped Cloudflare tunnel would leave the physical GPU frozen in an ambiguous or contested state. Furthermore, slight network delays could cause the edge to reassign an active job to another machine while Rig 2 was still actively generating frames, causing two claimants to hit the GPU simultaneously and triggering a fatal CUDA OOM crash.

To eliminate this hazard by physical construction, the locking relationship is completely inverted:

`CORRECTED INVERTED ARCHITECTURE:`  
`Remote DO ──► Logical Request Queue ──► Local media-broker ──► OS flock ──► GPU Silicon`

#### **1\. Permanent Local OS-Level flock**

The local execution daemon (media-broker on Rig 2\) permanently holds an unconditional, OS-level file lock (flock) on the GPU hardware interface. The edge Durable Object possesses zero authority to command or lock hardware; it is strictly relegated to a passive, logical FIFO request queue.

#### **2\. The Pull-Only Execution Model**

The local media-broker polls or claims work from the edge DO *only* when its own local flock is released and available. The hardware dictates when it is ready to receive requests, rather than having the cloud push workloads onto silicon blindly.

#### **3\. Offline Local Fallback & Zero Code-Path Divergence**

To uphold the studio's "Deletion Principle" (ensuring production survives cloud provider outages), the system enforces seamless offline degradation:

> * **The Local Disk Spool:** If the internet drops or Cloudflare becomes unreachable, the media-broker automatically polls a local disk queue (/var/spool/renders) instead of the edge DO.  
> * **Zero Code-Path Divergence:** Crucially, the broker executes using the exact same rendering logic, VRAM flushing cycles, and ComfyUI API templates. It is not a secondary "fallback mode" that rots from disuse, but the exact same code path reading from a local file descriptor rather than a remote WebSocket.

#### **4\. SIMULATION\_ONLY Degradation Mode (When the GPU Foundry Fails)**

If physical hardware fails entirely (e.g., Rig 2 suffers a power outage or motherboard failure), the edge director supports a specialized SIMULATION\_ONLY degradation mode:

> * **State Commit Without Pixels:** If the execution payload permits simulation-only fallback, the edge gateway executes the narrative state transitions directly against Cloudflare D1 (mutating character somatic states, recording duel outcomes, expending inventory) without blocking on video generation.  
> * **Append-Only Backlog Queue:** Unrendered scene ASTs and conformed frame budgets are deposited into a persistent D1 backlog queue. Writers and directors continue drafting episodes seamlessly.  
> * **Batch Catch-Up:** When Rig 2 regains power and reconnects via its outbound tunnel, its local loop pulls from the backlog queue, rendering the missing visual plates in an automated batch to catch up to the current canonical ledger state.

---

*User prompt: {{FOCUS: Optical Master Assembly (Worker-Sower-Conductor)}} /extreme-details*

Response: The optical master assembly layer within worker-sower-conductor (operating in coordination with goblin-viewport-template) functions as a software-defined digital optical printing press running locally on Rig 1\. Rather than delegating visual effects and timeline assembly to manual non-linear editors (NLEs) like Adobe Premiere or DaVinci Resolve, the entire post-processing, chroma-keying, layer compositing, and visual unification pipeline is codified as deterministic, executable React components orchestrated via the @remotion/renderer CLI.

### **Hardware Demarcation & The Headless Runtime Environment**

Optical assembly enforces an uncompromising hardware boundary between multi-threaded CPU rasterization and remote GPU tensor sampling:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: LOCAL MASTER CONDUCTOR & OPTICAL PRINTER (Pure CPU / System RAM)│`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Workload: Remotion CLI (@remotion/renderer), FFmpeg, OpenCV, ts-morph │`  
`│ • System Profile: Multi-Core CPU, 64 GB RAM, ZERO Dedicated VRAM       │`  
`│ • Execution Flags: --gl=swangle, --concurrency=1, --offthreadvideo     │`  
`│ • Ingress: Pinned matte plates, .wav stems, conformed #00FF00 MP4 plates│`  
`│ • Egress: Master Broadcast Deliverable (master_epXXX.mp4 / ProRes)     │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ HTTP / WebSocket (SpokeExecutionPayload)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: HEAVY GPU TENSOR FOUNDRY (Port 8188 / Isolated VRAM)            │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Workload: Headless ComfyUI daemon executing Wan 2.2 diffusion passes │`  
`│ • VRAM Allocation: 100% of GPU memory dedicated to model weights       │`  
`│ • Isolation Rule: ZERO Chromium / Remotion instances permitted         │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **System RAM Isolation (--gl=swangle):** Spawning headless Chromium instances on Rig 2 alongside active PyTorch diffusion models causes severe system memory thrashing, driver collisions, and unpredictable Linux out-of-memory (OOM) process terminations. Rig 1 isolates the entire rendering process by forcing Chromium to use SwiftShader software OpenGL rasterization (--gl=swangle), performing all image processing, keying, and compositing strictly in CPU and system RAM.  
> * **Single-Threaded Worker Concurrency (--concurrency=1):** Rendering processes are clamped to a concurrency of one worker. This eliminates race conditions during asset caching, bounds memory consumption during high-resolution frame rasterization, and guarantees deterministic pixel rendering across successive runs.  
> * **Isolated Off-Thread Video Decoding (--offthreadvideo):** Video decoding is decoupled from the main Chromium browser process and handled by external FFmpeg child processes. This prevents browser DOM memory leaks and frame buffer overflows during long multi-shot timeline passes.

### **Metaprogramming & Source-Baked Manifests**

In the production stack, the viewport repository (goblin-viewport-template) functions as a code generator rather than a generic runtime playback engine. Stamped episode workspaces in goblin-episodes/ (e.g., episode-040/) are populated with source-baked, static React manifests generated by generate-episode-repo.ts:

> * **Hardcoded Literals & Zero Runtime Guessing:** All temporal durations, cut points, spatial offsets, and mouth bounding coordinates are compiled directly into JSX as immutable literal primitives (e.g., \<Sequence durationInFrames="{75}" from="{0}"\>). The optical engine performs zero runtime frame estimation, zero dynamic audio waveform analysis, and zero non-deterministic synchronization at render time.  
> * **Lifecycle Annotations:** Stamped components strictly enforce @lifecycle docblock annotations (@generated, @patched, or @locked). Automated code-patching agents are barred from clobbering components tagged @locked, ensuring that human editorial interventions remain permanent.  
> * **Black-Box Studio Assembly:** In alignment with the studio's Mission Command framework (POD-10 Assembly Pod), the assembly pipeline consumes completed assets as self-contained black-box packages. Upstream scene pods do not inspect how their plates are trimmed or keyed, and the assembly engine does not alter upstream narrative state or re-render raw diffusion plates.

### **The Four-Layer Digital Optical Printing Stack (FinalCompositeMaster.tsx)**

Compositing executes within a deterministic four-layer spatial and optical hierarchy inside FinalCompositeMaster.tsx:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ LAYER 4: GLOBAL OPTICAL UNIFICATION (Anti-Diffusion Mastering Stack)   │`  
`│ • Unified 3D Color LUT (Kodak 2383 / Biopunk-Noir .cube profile)       │`  
`│ • Real 35mm silver halide film grain overlay (14-15% opacity)          │`  
`│ • Optical halation bloom pass (red-orange bleed on top 5% luminance)   │`  
`│ • Camera matrix transforms (spring zooms, pan vectors, jitter)         │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ LAYER 3: FOREGROUND ACTOR INGESTION & GROUNDING                        │`  
`│ • ChromaKeyFilter (#00FF00 green extraction, despill, edge smoothing)  │`  
`│ • Neural Alpha Video (BiRefNet/RVM WebM VP9 with embedded alpha)       │`  
`│ • Tracked dynamic contact shadows (scaled elliptical radial gradients) │`  
`│ • Directional ambient light-wrap & cutout puppet rigs (GoblinPuppet)   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ LAYER 2: PRACTICAL ATMOSPHERE & DIEGETIC MOTION GRAPHICS               │`  
`│ • Screen-blended procedural VFX loops (volumetric fog, rain plates)    │`  
`│ • Zero-Diffusion Text Rule: crisp SVG vector typography & HUD overlays │`  
`│ • Diegetic narrative callouts and vector speech balloons               │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ LAYER 1: BESPOKE HAND-PAINTED MATTE BACKGROUND                         │`  
`│ • Static 2048x1152 high-resolution matte plate (zero background swim)  │`  
`│ • Mathematical non-warping camera transforms (interpolate / spring)    │`  
`│ • Coordinate grounding: horizon lines, light vectors, Y_ground plane   │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **Layer 1: Bespoke Hand-Painted Matte Background**

Generative video diffusion models inherently suffer from perspective drift, temporal hallucination, and background swim across camera cuts. Layer 1 isolates environment geometry onto an immutable, high-resolution static digital matte plate (e.g., 2048×1152 resolution, 16-bit color depth).

> * **Perspective Stability:** Camera motion is applied mathematically as affine matrix transforms across the canvas using Remotion's interpolate and spring methods, avoiding generative frame warping.  
> * **Coordinate Grounding:** The static matte establishes the physical reference frame: the vanishing point, directional light vectors, and the ground plane elevation (*Y*ground​) upon which foreground character contact points anchor.

#### **Layer 2: Practical Atmosphere & Diegetic Motion Graphics**

> * **Procedural Atmosphere Loops:** Atmospheric elements such as rolling volumetric smoke, haze, and rain plates are composited over the background plate using screen and additive blend modes prior to actor placement.  
> * **The Zero-Diffusion Text Rule:** Text generation inside diffusion models produces garbled characters and unstable glyphs. All on-screen typography, forensic HUD diagnostics, character dossiers, and vector comic balloons are rendered strictly from design tokens as vector SVGs, ensuring sharp sub-pixel rendering.

#### **Layer 3: Foreground Actor Ingestion & Grounding**

> * **Automated Chroma-Keying & Despill:** Raw diffusion plates generated against \#00FF00 green backdrops (or neural alpha WebM VP9 containers output via BiRefNet/RVM) are keyed programmatically. The custom ChromaKeyFilter executes green-channel suppression, despill subtraction, and sub-pixel edge contour smoothing.  
> * **Ambient Light-Wrap:** To integrate keyed actors naturally into the scene, an algorithmic light-wrap convolves the edges of the character's alpha silhouette with the luminance and chrominance of the underlying background matte.  
> * **Tracked Dynamic Contact Shadows:** To eliminate the visual artifact of characters "floating" over painted plates, the engine projects a programmatic contact shadow at the character's ground contact anchor (anchorPoint.x, anchorPoint.y):  
  * Shadows are rendered as elliptical radial gradients using mix-blend-mode: multiply.  
  * As an actor animates, walks, or speaks, the shadow dynamically scales its radius and reduces opacity in inverse proportion to vertical displacement above *Y*ground​, anchoring the silhouette to the physical floor.  
> * **Cutout Puppetry & Viseme Mapping:** For 2D puppet rigs (GoblinPuppet.tsx), the mouth bounding box is tracked via facial landmark centroids. Modular mouth shapes conforming to the standard Preston Blair viseme taxonomy (A–H) are swapped dynamically at absolute frame indices dictated by the speech engine's phonetic alignment.

#### **Layer 4: Global Optical Unification (Anti-Diffusion Mastering Stack)**

Raw diffusion footage frequently presents a synthetic digital appearance characterized by razor-sharp pixel contours, over-sharpened contrast, and plastic skin tones. Layer 4 acts as an analog mastering pass across the merged composition:

> * **Micro-Diffraction Filter:** Applies a sub-pixel Gaussian blur (blur(0.4px)) to take the edge off digital boundary transitions and soften key lines.  
> * **Optical Halation Bloom:** Simulates the red-orange light scattering found in physical film stock emulsions. High-luminance pixels (the top 5% brightest values) are isolated, thresholded, colored red-orange, blurred by 8 pixels, and blended back using mix-blend-mode: screen at 25% opacity.  
> * **Global Chemical 3D LUT:** A unified .cube color lookup table (e.g., Kodak 2383 or Biopunk-Noir profiles) is applied across both the background and keyed foreground actors to harmonize contrast curves and skin-tone hues.  
> * **Authentic 35mm Silver Halide Film Grain:** A scanned analog emulsion plate (e.g., Kodak 5219\) or procedural per-frame random noise is blended over the entire frame using mix-blend-mode: overlay at 14–15% opacity, eliminating spatial static and tying disparate layers together.

### **Closed-Loop Visual QA, Volatility Sampling & MEU Surgical Repair**

Candidate renders are vetted by an automated, adversarial two-mind quality assurance harness that decouples asset generation from visual evaluation:

`Candidate MP4 Rendered (ProRes / MP4)`  
        `│`  
        `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ TIER 1: Kinematically Directed Sampling (Volatility V_t)│`  
`│ • Evaluates MAD Luminance proxy / LPIPS spikes         │`  
`│ • Audits local maxima, F_0, F_end, and phonetic peaks  │`  
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
`│ • Prop: mouthBoundingBox.y | Suggested Delta: +24px   │`  
`└───────────────────────┬────────────────────────────────┘`  
                        `│`  
                        `▼`  
`┌────────────────────────────────────────────────────────┐`  
`│ MINIMAL ENCLOSING UNIT (MEU) SURGICAL AST REPAIR       │`  
`│ • ts-morph mutates exact JSX attribute in-place        │`  
`│ • Re-renders ONLY affected frame range (--gl=swangle)  │`  
`│ • Re-evaluates Tier 2 check at $0.00 Cloud GPU Spend   │`  
`└────────────────────────────────────────────────────────┘`

#### **1\. Kinematically Directed Sampling**

Rather than naively inspecting every frame in a render, the critic targets frames exhibiting the highest likelihood of visual failure:

> * **Mean Absolute Difference (MAD) Volatility Proxy:** The critic calculates frame-to-frame visual volatility without running heavy neural models:  
>   *Vt*​\=*W*×*H*1​*x*,*y*∑​∣*I*(*x*,*y*,*t*)−*I*(*x*,*y*,*t*\+1)∣  
> * **Peak Extraction:** The testing harness audits frames clustered around local maxima of *Vt*​, along with the sequence boundary frames (*F*0​ and *F*end​) and the phonetic centroids of spoken dialogue lines where viseme changes occur.

#### **2\. Deterministic Geometric & Boundary Gates**

> * **Alpha Edge Purity Check:** An automated script evaluates the outer 3-pixel contour of the keyed character silhouette. The mean intensity in the green channel must register \<12 inside the edge boundary; higher values indicate green screen spill and fail the check.  
> * **Viseme Centroid Alignment:** Characters undergo a solid-color debug-mask pass to pinpoint facial landmarks. If the distance between the mouth center and the viseme center exceeds 4 pixels (∣mouth\_center−viseme∣\>4px), a defect is flagged.  
> * **Defect Classification:**  
  * ASSET\_ERROR: Occurs if the JSX properties in Episode\_XXX.tsx match the sprite manifest, but the rendered output exhibits drift \>4px. The underlying sprite asset is tagged as defective and routed to the art foundation team; code agents are strictly barred from adding arbitrary offsets in JSX to compensate for bad source art.  
  * CODE\_ERROR: Occurs if the JSX property deviates from the approved manifest coordinates. This ticket routes directly to the automated coding agent (Jules).

#### **3\. Minimal Enclosing Unit (MEU) Surgical AST Repair**

When a CODE\_ERROR is detected, the conductor avoids full-scene regenerations, which cause non-deterministic visual drift in unaffected elements:

> 1. **Remediation Ticket:** The critic generates a typed JSON payload specifying the file path, failing component, frame range, and required coordinate delta.  
> 2. **AST Mutation via ts-morph:** The coding agent parses the TypeScript AST of Episode\_XXX.tsx and mutates only the failing attribute in-place (e.g., updating mouthBoundingBox.y from 240 to 264).  
> 3. **Local CPU Frame Verification:** The agent compiles and re-renders only the affected slice of the timeline locally on Rig 1:  
>    `npx remotion render src/index.ts ep040-sh03 --frames=144-180 --gl=swangle`

The fix is verified against the diagnostic gate with zero cloud GPU compute expenditure. 4\. **Three-Cycle Escalation Circuit Breaker:** If a defect is not resolved within three consecutive correction cycles, or if the agent enters an oscillation loop (*A*→*B*→*A*), the circuit breaker trips, freezing automated execution and escalating the ticket to the lead human architect.

### **Provenance Sealing & Container Release**

Once the rendered master timeline passes all acoustic, geometric, and optical gates, the conductor finalizes the media release:

> * **Render Manifest Generation:** Emits render\_manifest.json, documenting the exact frame budgets, asset source hashes, LUT configurations, and font fingerprints used during the render.  
> * **C2PA Metadata Injection:** Injects cryptographic Coalition for Content Provenance and Authenticity (C2PA) manifests directly into the master container header (master\_epXXX.mp4 / ProRes 4444). This embeds the upstream Git commit SHAs, binary input digests, and toolchain versions into the file structure, establishing an immutable cryptographic chain of custody from the narrative simulation core to the finished broadcast deliverable.  
> * **Canon Seal Trigger:** Concluding optical assembly hands control back to produceEpisode.ts, which triggers drainAndCommitStagedLedger to pull uncommitted narrative state deltas from the edge and commit them to the local Git repository, permanently recording the episode's events into canon history.

---

*User prompt: {{FOCUS: The Turn-Based VRAM Flush (Worker-Sower-Conductor) }} /extreme-details*

### **Response: The Spatial Reality & Hardware Contention Ceiling**

Operating a multi-modal generative production pipeline on consumer-tier workstation hardware (e.g., an NVIDIA RTX 3090, 4090, or 5070 equipped with 24 GB of VRAM) introduces a hard physical constraint: **the concurrent spatial footprint of multi-modal models far exceeds physical GPU memory**.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ TOTAL 24 GB PHYSICAL VRAM CAPACITY                                     │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Qwen 2.5 14B GGUF (Text AST Draft)     │ ~9 GB to 10 GB VRAM           │`  
`│ CosyVoice / Parler-TTS (Speech Stems)  │ ~4 GB to 6 GB VRAM            │`  
`│ Wan 2.2 + LoRAs (Video Diffusion Plate)│ ~16 GB to 22 GB Scratchpad    │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ CONCURRENT MEMORY FOOTPRINT REQUIRED   │ ~29 GB to 38 GB VRAM          │`  
`│ 💥 RESULT IF LOADED CONCURRENTLY       │ INSTANT CUDA OUT-OF-MEMORY    │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Dialogue AST Inference:** A 14B parameter language model (such as Qwen 2.5 14B GGUF) performing structured grammar decoding via GBNF consumes between **9 GB and 10 GB** of VRAM.  
> * **Acoustic Synthesis:** High-fidelity neural Text-to-Speech models (such as CosyVoice, XTTSv2, or Parler-TTS) require **4 GB to 6 GB** of memory for voice prompt embeddings and vocoder checkpoints.  
> * **Temporal Video Diffusion:** Video generation backends (such as Wan 2.2 running with character LoRA ranks) require **16 GB to 22 GB** of unfragmented VRAM to allocate massive 3D attention matrices and multi-dimensional latent tensors.  
> * **The Hardware Ceiling:** Attempting to maintain all three models resident in memory simultaneously requires between **29 GB and 38 GB** of VRAM, immediately triggering a fatal runtime abort: CUDA: Out of Memory.

The worker-sower-conductor resolves this hardware limitation through the **Turn-Based VRAM Flush**—a strictly coordinated lifecycle that enforces sequential model loading, deterministic inference, and total memory eviction.

### **The Anti-Pattern vs. The Anti-Ollama Paradigm**

The primary cause of catastrophic VRAM crashes on local rendering workstations is **uncoordinated multi-daemon hardware access**.

`THE ANTI-PATTERN: MULTI-DAEMON HARDWARE COLLISION`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ 24 GB GPU WORKSTATION SILICON                                          │`  
`│  ├── Ollama Daemon (Port 11434): Qwen 14B (~10 GB Unmanaged VRAM)      │`  
`│  └── ComfyUI Daemon (Port 8188): Wan 2.2 (~20 GB Diffusion Workspace)   │`  
`│  💥 RESULT: ComfyUI cannot evict Ollama's memory space -> CUDA OOM!    │`  
`└────────────────────────────────────────────────────────────────────────┘`

`THE NATIVE SOLUTION: THE ANTI-OLLAMA PARADIGM`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ 24 GB GPU WORKSTATION SILICON (Single Unified Process)                 │`  
`│  └── Headless ComfyUI Daemon (Port 8188 Exclusive GPU Lock)           │`  
`│      ├── Dynamic Cache Manager controls 100% of physical allocations   │`  
`│      └── Node.js Conductor forces explicit evictions via POST /free    │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **The Multi-Daemon Collision Hazard**

In naive machine configurations, developers run background inference daemons alongside media generation engines (e.g., an Ollama daemon listening on port 11434 alongside a ComfyUI instance on port 8188). Because Ollama and ComfyUI run as completely separate OS processes, ComfyUI’s internal dynamic cache manager has zero visibility into, and zero authority over, the VRAM allocations held by Ollama. When ComfyUI initializes its video diffusion latent tensor, it encounters an unexpected memory boundary, causing an immediate crash.

#### **The Anti-Ollama Solution**

The pipeline eliminates external runtimes (such as Ollama or standalone vLLM servers) from GPU execution. All model execution on Rig 2 is unified directly under **ComfyUI’s native Directed Acyclic Graph (DAG)** runtime (utilizing extensions such as ComfyUI-GGUF and native ComfyUI audio nodes).

> * **Single-Process Sovereignty:** ComfyUI is the sole process holding a file descriptor and CUDA context on the GPU silicon.  
> * **Total Allocation Awareness:** Because every tensor belongs to ComfyUI's memory pool, the system can dynamically track, de-allocate, and garbage-collect weights without leaving orphaned background allocations.

### **The Mechanical Turn-Based Flush Protocol**

The execution lifecycle on the render foundry is segmented into three sequential, non-overlapping child graphs managed by the orchestrator:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: SEQUENTIAL TURN-BASED EXECUTION CYCLE                           │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. TURN 1: CHILD GRAPH A (Script & Dialogue AST)                       │`  
`│    • ComfyUI hydrates Qwen 2.5 14B GGUF (~9–10 GB VRAM)                │`  
`│    • Evaluates mechanical state -> emits dialogue_ast.json             │`  
`│                                                                        │`  
`│ 2. THE FIRST HARD FLUSH (POST /free)                                   │`  
`│    • Unloads Qwen weights; clears PyTorch cache; VRAM drops to baseline │`  
`│                                                                        │`  
`│ 3. TURN 2: CHILD GRAPH B (Acoustic Timing & Synthesis)                 │`  
`│    • ComfyUI hydrates local TTS node (~4–6 GB VRAM)                    │`  
`│    • Synthesizes .wav stems; derives target_frames = ceil(ms/1000*24)  │`  
`│                                                                        │`  
`│ 4. THE SECOND HARD FLUSH (POST /free)                                  │`  
`│    • Unloads TTS weights; purges audio latent buffers                  │`  
`│                                                                        │`  
`│ 5. TURN 3: CHILD GRAPH C (Temporal Video Diffusion)                    │`  
`│    • 100% of 24 GB VRAM allocated to Wan 2.2 + Character LoRAs         │`  
`│    • Samples #00FF00 green-screen plate at full precision              │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **1\. Turn 1: Child Graph A (Text & AST Synthesis)**

ComfyUI loads the Qwen 2.5 14B GGUF weights (\~9 GB to 10 GB) into VRAM. Constrained by GBNF grammar logit masking, the model processes the upstream tabletop state, outputs the validated dialogue\_ast.json manifest, and immediately yields execution.

#### **2\. The First Hard Flush**

Before audio processing can begin, the orchestrating daemon executes an HTTP POST request to ComfyUI's memory release endpoint:

`// Clear text model weights and unbind CUDA memory pointers`  
`await fetch('http://127.0.0.1:8188/free', {`   
  `method: 'POST',`   
  `headers: { 'Content-Type': 'application/json' },`  
  `body: JSON.stringify({`   
    `unload_models: true,`   
    `free_memory: true`   
  `})`   
`});`

This call instructs ComfyUI to unbind the active text model pointers and signal PyTorch to release its cached memory blocks, dropping active VRAM back to the idle system baseline in roughly **300 milliseconds**.

#### **3\. Turn 2: Child Graph B (Acoustic Synthesis & Frame Locking)**

ComfyUI hydrates the neural TTS checkpoint (\~4 GB to 6 GB) into clean memory. The node iterates through the dialogue lines, synthesizes uncompressed 48 kHz .wav audio stems, and derives the integer frame budget using ceiling quantization:

target\_frames=⌈(1000duration\_ms​)×24⌉

Once stems and timing manifests are written to disk, Child Graph B halts.

#### **4\. The Second Hard Flush**

The orchestrator issues a second identical POST /free command. The audio vocoder and speech embeddings are purged, completely clearing VRAM.

#### **5\. Turn 3: Child Graph C (Temporal Video Diffusion)**

With the GPU completely cleared, **100% of the 24 GB VRAM** is claimed by Wan 2.2 and character LoRAs. The diffusion model allocates its large 3D latent tensors (e.g., 16 channels×8×spatial downsampling×4×temporal downsampling) and renders the \#00FF00 green-screen plate at full native precision without downscaling or OOM failures.

### **Asynchronous Semantics & Verifiable Memory Hygiene**

A critical engineering vulnerability in basic orchestration scripts is assuming that calling POST /free is a synchronous operation.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ VERIFIABLE MEMORY POLLING SEQUENCE                                     │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Conductor calls POST /free ──► ComfyUI queues async model unload       │`  
`│                                         │                              │`  
`│ ┌───────────────────────────────────────┴────────────────────────────┐ │`  
`│ │ WHILE (Elapsed < 15s Timeout):                                     │ │`  
`│ │   1. Poll GET /system_stats (or inspect nvidia-smi via child_proc) │ │`  
`│ │   2. Read Free_VRAM                                                │ │`  
`│ │   3. IF Free_VRAM >= (Measured_Baseline_VRAM - Tolerance):         │ │`  
`│ │        BREAK -> Emit VRAM_VERIFIED (Proceed to next stage)         │ │`  
`│ │   4. ELSE: Sleep(250ms)                                            │ │`  
`│ └───────────────────────────────────────┬────────────────────────────┘ │`  
`│                                         │                              │`  
`│ ├── PASS: Dispatch Child Graph C        └── TIMEOUT EXCEEDED (15s):    │`  
`│                                             • Detect Memory Leak       │`  
`│                                             • Trigger Daemon Restart   │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **The Race Condition Hazard:** In ComfyUI, /free accepts the request immediately and executes the model unload and memory reclamation asynchronously in a background thread. If the conductor immediately dispatches Child Graph C across the wire, PyTorch will attempt to allocate video latent memory while the previous model's weights are still being unmapped from VRAM, causing an instant CUDA crash.  
> * **The Polling Gate:** The conductor or local media-broker must enforce a verifiable polling lock. After emitting POST /free, it enters an active poll loop querying ComfyUI's GET /system\_stats or invoking nvidia-smi via a child process.  
> * **Relative Baseline Verification:** Hardcoding a static threshold (such as free\_vram \> 21 GB) introduces subtle failures: if a local desktop environment, display compositor, or terminal monitor consumes 1.5 GB of VRAM, available memory may peak at 20.8 GB, causing a static check to hang indefinitely. The conductor measures the machine's initial **idle baseline VRAM** upon boot and confirms that memory has recovered to within an acceptable tolerance (Δ≤500 MB) of that baseline before releasing the execution gate.  
> * **Watchdog Timeout Circuit Breaker:** The polling loop enforces a hard timeout (typically 10 to 15 seconds). If VRAM fails to return to baseline within this window—indicating a hung CUDA stream or a leaked C++ tensor reference—the conductor aborts waiting and triggers an automated daemon restart rather than stalling the pipeline.

### **Stage-Level Batching Amortization vs. Naive Per-Shot Thrashing**

Executing the three-turn cycle (Text → Audio → Video) on a per-shot basis introduces an unsustainable PCIe bus bottleneck.

`NAIVE PER-SHOT THRASHING (Weights Swapped Every Single Shot)`  
`Shot 1: [Load LLM ➔ Flush ➔ Load TTS ➔ Flush ➔ Load Wan ➔ Flush]`  
`Shot 2: [Load LLM ➔ Flush ➔ Load TTS ➔ Flush ➔ Load Wan ➔ Flush]`  
`...`  
`Shot 20: [Load LLM ➔ Flush ➔ Load TTS ➔ Flush ➔ Load Wan ➔ Flush]`  
`❌ Burns 5 to 8 minutes per episode solely on PCIe weight swapping!`

`OPTIMAL STAGE-LEVEL BATCHING (Weights Loaded ONCE Per Episode)`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ STAGE 1: EPISODIC SCRIPT PASS (All Shots 1..N)                         │`  
`│ • Load Qwen 2.5 14B GGUF once ➔ Compile all dialogue_ast.json files    │`  
`│ • Single Hard VRAM Flush (POST /free)                                  │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ STAGE 2: EPISODIC AUDIO & TIMING PASS (All Shots 1..N)                 │`  
`│ • Load TTS model once ➔ Synthesize all .wav stems ➔ Lock all frames    │`  
`│ • Single Hard VRAM Flush (POST /free)                                  │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ STAGE 3: EPISODIC VIDEO DIFFUSION PASS (All Shots 1..N)                │`  
`│ • Load Wan 2.2 once ➔ Sequentially render all locked #00FF00 plates    │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **The PCIe Transfer Tax**

Hydrating large neural checkpoints from system NVMe storage across PCIe lanes into GPU memory takes significant time:

> * Moving 9 GB of LLM weights takes ≈3 to 5 seconds.  
> * Moving 4 GB of TTS weights takes ≈1 to 2 seconds.  
> * Moving 20 GB of Wan 2.2 weights takes ≈6 to 10 seconds.  
> * A full per-shot eviction and reload cycle burns **10 to 25 seconds** purely in weight swapping.  
> * Across a standard 20-shot episodic sequence, naive per-shot thrashing wastes **5 to 8 minutes** of pure GPU downtime swapping identical files back and forth across the bus.

#### **The Stage-Level Batching Solution**

The conductor amortizes weight hydration across the entire episode by batching by **Stage**, rather than by Shot:

> 1. **Stage 1 (Text AST Pass):** The LLM is loaded once. It compiles the dialogue ASTs and scene logic for all shots (1…*N*) in the episode. A single POST /free unloads the model.  
> 2. **Stage 2 (Acoustic & Quantization Pass):** The TTS engine is loaded once. It synthesizes all .wav speech stems, runs ffprobe duration measurements, and locks the integer frame manifests for all shots (1…*N*). A single POST /free unloads the model.  
> 3. **Stage 3 (Video Diffusion Pass):** Wan 2.2 is loaded once. The GPU renders all conformed green-screen character plates sequentially without ever unloading the diffusion weights.

#### **Alignment with Human Editorial Gates**

Stage-level batching integrates directly with editorial verification:

> * The showrunner audits the entire textual script at the end of Stage 1\.  
> * The director scrubs the completed audio animatic and exposure sheet at the end of Stage 2\.  
> * Expensive, compute-heavy Stage 3 video diffusion is greenlit only after the script and audio foundations are locked, eliminating wasted video generation cycles on flawed lines.

### **PyTorch Allocator Fragmentation & Process Recycling**

Over multi-hour batch runs, standard memory polling can fail to detect **PyTorch Virtual Memory Fragmentation**.

`PHYSICAL VRAM (Reported by nvidia-smi: 21.5 GB Free)`  
`┌─────┬───────────┬─────┬───────────┬─────┬───────────┬─────┐`  
`│Alloc│   Free    │Alloc│   Free    │Alloc│   Free    │Alloc│`  
`│128MB│  4.2 GB   │64MB │  3.8 GB   │256MB│  5.1 GB   │32MB │`  
`└─────┴───────────┴─────┴───────────┴─────┴───────────┴─────┘`  
`❌ Contiguous Block Check for Video Latent: REQUIRES 14.0 GB CONTIGUOUS!`  
`💥 RESULT: Out of Memory (Fragmented Heap) despite 21.5 GB total free!`

> * **The Mechanism of Heap Fragmentation:** PyTorch utilizes an internal caching allocator (cudaMalloc / cudaFree) to avoid expensive system memory calls during execution. When switching between disparate tensor shapes (e.g., small 1D audio waveform buffers, variable-length text embedding matrices, and massive 5D video latent tensors \[*B*,*C*,*T*,*H*,*W*\]), the allocator's memory pool becomes heavily fragmented with interleaved, un-coalesced memory blocks.  
> * **The Phantom Free-Memory Trap:** While nvidia-smi or ComfyUI's /system\_stats may report \>21 GB of unallocated memory, the GPU may lack a single **contiguous block** large enough to allocate the multi-gigabyte attention matrices required by Wan 2.2. The pipeline crashes with a delayed, unpredictable CUDA Out of Memory error despite appearing to have ample free space.  
> * **Process Recycling (The Hard Boundary Reset):** To eliminate memory fragmentation over long production runs, the media-broker implements an automated **Process Recycling** daemon:  
  * The conductor maintains a monotonic counter tracking consecutive completed shots.  
  * Upon reaching a configured threshold (typically **every 25 shots**), or immediately upon transitioning across major production stages (e.g., moving from Stage 2 audio to Stage 3 video), the broker gracefully restarts the headless ComfyUI child process.  
  * Terminating the host Python process forces the Linux kernel and NVIDIA display driver to reclaim all memory pointers, completely destroying the fragmented PyTorch memory arena and providing a clean, unfragmented VRAM address space for subsequent diffusion runs.

### **Upstream Architectural Optimization: CPU Drafting on Rig 1**

While the turn-based flush enables all three modalities to share a single GPU sequentially, the optimal architecture **removes the language model from the GPU foundry entirely**.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ OPTIMIZED WORKSTATION TOPOLOGY                                         │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ RIG 1: ORCHESTRATION HOST (Pure CPU & 64 GB System RAM)                │`  
`│  ├── Dialogue AST Drafting: Local Qwen 14B/32B via llama.cpp (CPU)     │`  
`│  ├── Temporal Quantizer: ffprobe CLI (target_frames calculation)       │`  
`│  └── Optical Compositor: Remotion CLI (--gl=swangle on CPU)            │`  
`│  ✨ BENEFIT: Turn 1 is permanently evicted from the shared GPU!        │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ JSON Execution Contract (Network)`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: GPU TENSOR FOUNDRY (Dedicated 24 GB VRAM Silicon)               │`  
`│  ├── ComfyUI Dedicated Exclusively to Heavy Models:                    │`  
`│  │   • Turn A: CosyVoice / Parler-TTS (:8000)                          │`  
`│  │   • Single POST /free Eviction                                      │`  
`│  │   • Turn B: Wan 2.2 Video Diffusion (100% VRAM Allocation)          │`  
`│  ✨ BENEFIT: Eliminates one full load/flush PCIe cycle per batch!       │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Bounded Script Generation Task:** The upstream simulation core (worker-sower-engine) resolves all narrative facts, character duels, and mechanical outcomes deterministically *before* text generation occurs. The language model's task is strictly confined to realizing those pre-determined mechanical outcomes as dialogue under rigid grammar constraints—a task requiring only a few hundred output tokens.  
> * **Decoupled CPU Inference via llama.cpp:** Running a 14B or 32B quantized GGUF on Rig 1's multi-core CPU and system RAM generates at single-digit tokens per second (e.g., 4 to 8 tokens/sec). For a 300-token scene, execution completes in under a minute without blocking other systems.  
> * **Eliminating GPU Eviction Overhead:** Shifting the LLM to Rig 1 completely removes Turn 1 from Rig 2's schedule. This saves an entire model loading and eviction cycle, isolates the interactive writing room from the rendering queue, and allows Rig 2's GPU memory to be dedicated solely to heavy audio synthesis and video diffusion.

---

*User prompt: {{FOCUS: 1\. Ingestion & Dialogue Extraction (Worker-Sower-Conductor) }} /extreme-details*

### **Response: Ingress Boundary & Architectural Demarcation**

The ingestion and dialogue extraction phase serves as the entry boundary for worker-sower-conductor on the Rig 1 workstation. Operating at the beginning of the master lifecycle script (src/pipeline/produceEpisode.ts), this phase ingests the validated machine intermediate representation (dialogue\_ast.json) emitted upstream by Stage 5 of worker-sower-engine.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ UPSTREAM: worker-sower-engine (Stage 5 Epistemic Core — Rig 1 CPU)     │`  
`│ • Resolves 2d6 duels, state mutations (Sn -> Sn+1), somatic masks      │`  
`│ • Enforces Ignorance by Omission & GBNF grammar decoding               │`  
`│ • Demuxer outputs: human scene.fountain & machine dialogue_ast.json    │`  
`│ • Panopticon Invariant Gauntlet (T_0 = $0.00): O(1) somatic check      │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Emits: drafts/dialogue_ast.json`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ INGRESS: worker-sower-conductor (produceEpisode.ts — Rig 1 Node.js)    │`  
`│ 1. Schema Ingestion: Zod runtime validation (SceneASTSchema)           │`  
`│ 2. DAG Hash Verification: Validates state_snapshot_hash (H_root)       │`  
`│ 3. Semantic Dialogue Extraction:                                       │`  
`│    ├── Phonetic Text Isolation ──► Dispatched to TTS (:8000)           │`  
`│    ├── Somatic DSP Modifiers   ──► Injected into vocal synthesis       │`  
`│    ├── Swain MRU Reaction Cues ──► Pre-roll / reaction window buffers  │`  
`│    ├── Condition / Emotion Tags──► Visual LoRA & sprite variant routes │`  
`│    └── Lexical Foley Extraction──► Noun parsing -> PRNG sample pool    │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Downstream Pipeline Clock`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ DOWNSTREAM: Acoustic Synthesis (:8000) & ffprobe Frame Quantization    │`  
`└────────────────────────────────────────────────────────────────────────┘`

This architectural handoff strictly enforces the separation of **meaning** from **representation**:

> * worker-sower-engine functions as the epistemic state authority, resolving dramatic conflict, character health, physical trauma, and dialogue text without any awareness of pixels, frame rates, or audio waveforms.  
> * worker-sower-conductor accepts these narrative facts as an immutable contract, parsing and extracting the structural parameters necessary to establish the physical master clock and coordinate downstream media foundries.  
> * Human-readable screenplay text (.fountain) is treated as a presentation byproduct; dialogue\_ast.json is the sole authoritative contract. If a human editor alters .fountain prose without synchronizing the machine AST, downstream validation halts compilation immediately to enforce verbatim parity.

### **Ingestion Contract & Schema Anatomy**

The conductor ingests dialogue\_ast.json from the ephemeral drafts/ directory and validates its contents at runtime using Zod schemas before any child processes or network sockets are initialized:

`// worker-sower-conductor: src/types/narrative.ts`  
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
`});`

`export const SceneASTSchema = z.object({`  
  `$schema: z.string().optional(),`  
  `schema_version: z.string(),`  
  `compiler_version: z.string(),`  
  `episode_id: z.string(),`  
  `scene_id: z.string(),`  
  `state_snapshot_hash: z.string().regex(/^sha256:[a-f0-9]{64}$/),`  
  `lines: z.array(DialogueLineSchema).min(1)`  
`});`

`export type DialogueLine = z.infer<typeof DialogueLineSchema>;`  
`export type SceneAST = z.infer<typeof SceneASTSchema>;`

#### **Data Field Semantics**

> * state\_snapshot\_hash (*H*root​): The SHA-256 cryptographic Merkle root of the upstream relational ledger (SQLite/D1) captured at the moment of mechanical conflict resolution. It verifies that the narrative state from which the dialogue was generated matches active canon, preventing desynchronized builds.  
> * speaker: Canonical entity slug (e.g., char\_bog, ELIAS) mapping to immutable character definitions in 000.goblin-lore.  
> * dialogue\_text: The verbatim phonetic script line delivered to the Text-To-Speech (TTS) microservice.  
> * subtext: The unadmitted psychological objective ("The Underneath"), representing the delta between the character's surface claim and their existential wound. It guides directorial inflection without being verbalized.  
> * conditions / emotion: Categorical condition slugs (e.g., humiliated, tense\_jaw) drawn from a closed canon enum, used downstream to select sprite texture maps or ComfyUI LoRA trigger prompts.  
> * reaction\_cue: Dwight Swain Motivation-Reaction Unit (MRU) timing directive (e.g., VISCERAL\_STING), signaling the need for visual reaction pre-roll.  
> * dsp\_modifiers: Somatic acoustic parameters (e.g., pause\_frequency\_multiplier: 1.4) that alter vocal delivery based on physical injury.

### **Upstream Verification: The *T*0​ Panopticon Gauntlet**

The conductor only accepts AST payloads that have cleared the upstream engine's *T*0​\=\$0.00 verification gauntlet. Because generative language models are treated as untrusted token generators, compliance is enforced through pre-generation constraints and post-inference set-intersection linting:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ PRE-GENERATION CONSTRAINTS (worker-sower-engine Stage 5)               │`  
`│ • Ignorance by Omission: Secret tokens scrubbed from prompt context    │`  
`│ • Somatic Mask Injection: Banned kinetic verbs derived from ledger     │`  
`│ • GBNF Grammar Clamping: Constrains Qwen 2.5 on Rig 1 CPU/RAM          │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ INFERENCE & SCRIPT/AST DEMUXER                                         │`  
`│ • Emits: scenes/epXX_scYY.fountain (Human Screenplay)                  │`  
`│ • Emits: outputs/dialogue_ast.json (Structured Dual-Field JSON)        │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ THE PANOPTICON INVARIANT GAUNTLET (T_0 = $0.00 Local Linter)           │`  
`│                                                                        │`  
`│  CombinedActions = Actions_self_reported ∪ Actions_prose_extracted     │`  
`│  CombinedActions ∩ BannedVerbs(Subject) == ∅                           │`  
`│                                                                        │`  
`│ • O(1) Set-Intersection against Somatic Vector                         │`  
`│ • Negation-Aware Dependency Parser (filters "could not grip")          │`  
`│ • Stylometric Voice Fixture: mean_sentence_length, banned latinates    │`  
`│ • Discrepancy Halt: Halts execution before billing any GPU/media work  │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **1\. Ignorance by Omission & Epistemic Context Sanitization**

The engine strictly prohibits prompting an LLM to "pretend" it does not know a fact. Mentioning secret tokens primes the model's attention heads, inevitably causing information leakage via subtext or phrasing.

> * The Sower filters the character's active BeliefRecord.  
> * If an event was occluded by spatial geometry or damped into ambient noise in goblin-spatial, the event is physically omitted from the prompt context.  
> * Characters cannot leak facts that do not exist within their token window.

#### **2\. Constrained Decoding & The Demuxer Node**

Inference executes locally on Rig 1 CPU threads via llama.cpp using GBNF (GGML BNF) grammars or native JSON Schema constraints. This prevents formatting corruption, unescaped quotes, or conversational preambles that would break JSON parsing. The resulting payload passes through the **Script & AST Demuxer**, splitting the stream into human-readable .fountain prose and machine-readable dialogue\_ast.json.

#### **3\. Dual-Field Action AST & The Negation Trap**

To prevent models from masking physical actions behind complex prose, generation mandates a dual-field schema pairing natural dialogue with discrete motor action enums:

> * ***O*****(1) Set-Intersection:** The linter compares extracted\_motor\_actions directly against the entity's banned\_kinetic\_verbs (e.g., an amputee outputting \["BIMANUAL\_CLIMB"\]).  
> * **The Negation Trap:** Models can suffer from the "Self-Reporting Trap," asserting compliance in the enum array (\["LIMP"\]) while writing a violation in the action text (*"he vaulted the fence"*), or conversely writing valid trauma (*"he could not grip the iron ladder"*) that naive substring linters incorrectly flag.  
> * **Secondary Lemma Parsing:** An independent dependency parser inspects the syntax. Forbidden action lemmas modified by negative polarity operators (neg, without, failed to) are cleared as valid depictions of impairment. Any unmitigated collision triggers an immediate *T*0​ rejection, halting compilation at \$0.00 GPU cost.

#### **4\. Stylometric Voice Fixtures**

Every character dossier in 000.goblin-lore enforces an automated stylometric boundary:

> * Sentence length is bounded by an explicit mean and maximum (e.g., Bog: mean 6.2–11.5 words, max 18 words).  
> * Generic or anachronistic Latinate lemmas (testament, tapestry, palpable, furthermore) are strictly banned.  
> * Dialogue failing these boundaries is rejected before entering the conductor's execution stream.

### **Dialogue Extraction Mechanics (The Conductor Processing Loop)**

Once dialogue\_ast.json is validated, produceEpisode.ts executes the extraction loop, decomposing the AST into four discrete operational domains:

                               `dialogue_ast.json`  
                                       `│`  
         `┌─────────────────────────────┼─────────────────────────────┐`  
         `▼                             ▼                             ▼`  
`┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐`  
`│ ACOUSTIC DOMAIN  │          │ TEMPORAL PACING  │          │ VISUAL & SPATIAL │`  
`├──────────────────┤          ├──────────────────┤          ├──────────────────┤`  
`│• Verbatim Text   │          │• Swain MRU Cues  │          │• Speaker IDs     │`  
`│• Speaker ID      │          │  (VISCERAL_STING)│          │• Condition Enums │`  
`│• Somatic DSP     │          │• Pacing Scalars  │          │• Foley Lexical   │`  
`│  Modifiers       │          │• Pre/Post Rolls  │          │  Nouns           │`  
`└────────┬─────────┘          └────────┬─────────┘          └────────┬─────────┘`  
         `│                             │                             │`  
         `▼                             ▼                             ▼`  
   `TTS POST :8000             exposure_sheet.json           ComfyUI Dispatch /`  
  `48 kHz .wav Stems          Master Integer Frames        goblin-viewport TSX`

#### **1\. Phonetic Text & Somatic DSP Isolation**

For each entry in SceneAST.lines, the conductor isolates the literal dialogue\_text string, ensuring downstream rendering engines perform zero runtime text generation.

> * The conductor extracts character IDs and pairs them with somatic DSP parameters.  
> * If a character's somatic ledger logs respiratory damage or pulmonary trauma, the conductor extracts dsp\_modifiers such as pause\_frequency\_multiplier: 1.4 or breathiness\_pause\_multiplier: 2.2.  
> * These parameters are packaged directly into the HTTP POST request dispatched to the local Python TTS microservice on port 8000 (\[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate)), ensuring the synthesized .wav reflects the character's physical state.

#### **2\. Dwight Swain MRU Pacing Extraction**

Generative language models frequently compress scene pacing, causing characters to react and speak simultaneously with incoming stimuli. The conductor extracts reaction\_cue values to establish physical pacing:

> * When reaction\_cue is set to VISCERAL\_STING, the conductor allocates an authored visual pre-roll reaction buffer of **12 to 24 frames** (at 24 fps).  
> * This buffer is logged in exposure\_sheet.json as pre\_roll\_frames, holding camera movement or displaying an actor's stunned reaction *prior* to un-muting speech audio.  
> * Storing pre\_roll\_frames and post\_roll\_frames separately from raw speech frames allows human directors to re-time reaction beats without invalidating synthesized audio stems.

#### **3\. Lexical Foley Extraction & Dual-Output Mapping**

Screenplay action lines and foley\_cues arrays are parsed for concrete physical nouns.

> * Extracted nouns are looked up in the FOLEY\_REGISTRY, a dual-output dictionary that maps narrative nouns to both visual prompts and audio sample keys:  
  * ITEM\_SILVER\_SPOON → Visual: "bent tea spoon" → Audio: foley/metal\_spoon\_clink\_01.wav.  
  * TERRAIN\_SWAMP → Visual: "opaque mud sludge" → Audio: foley/mud\_boot\_squelch\_02.wav.  
> * Foley events are mapped to specific hold-frame timestamps on the timeline.  
> * Variant resolution is computed deterministically using a Mulberry32 PRNG keyed to MurmurHash3(scene\_id \+ ":" \+ shot\_id \+ ":" \+ cue\_name), with an anti-clustering salt appended if the selected variant matches the immediately preceding shot.

#### **4\. Emotional Condition & Sprite/LoRA Routing**

The conductor extracts conditions and emotion strings (e.g., humiliated, paralyzed\_arm) and routes them through the presentation manifest:

> * In 2D cut-out pipelines (goblin-viewport), the tag routes through manifest.json to mount the specific character texture variant (e.g., variants/bog\_humiliated.png).  
> * In video diffusion pipelines, the tag is injected into the ComfyUI workflow template as a positive conditioning token and character LoRA weight.

### **Ingestion Validation Gates & Failure Routing**

To prevent invalid, corrupt, or desynchronized data from progressing into audio synthesis or GPU diffusion, the ingestion stage enforces three strict error routing paths:

| Error Class | Example Failure Trigger | Pipeline Response | Compute Cost Impact |
| :---- | :---- | :---- | :---- |
| **Deterministic Failures** | Zod schema validation error, invalid JSON syntax, broken foreign-key slug, missing dialogue\_text, or unmapped condition enum. | **Immediate Fatal Halt (Exit 1).** The compiler aborts processing without retrying and logs the schema breach. | **\$0.00**; execution terminates before any TTS, ComfyUI, or Remotion subprocesses run. |
| **Stochastic Failures** | Local TTS microservice synthesis produces an audible pop, clipped waveform, or fails the integrated \-16 LUFS loudness gate. | **Bounded Retry (Max 2).** Re-synthesizes the failing stem with an altered PRNG seed. | Negligible; re-runs a single local CPU audio pass. |
| **Infrastructure Failures** | Transient file lock contention, partial disk write, or POSIX rename failure during AST read. | **Idempotent Resume.** Resumes ingestion from the last verified temporary file using its UUIDv7 staging descriptor. | Zero state loss; preserves execution integrity. |

#### **The State Invalidation Gate (*H*root​ Mismatch)**

Before executing audio synthesis, the conductor verifies the AST's state\_snapshot\_hash against the current ledger state in Cloudflare D1 or the local SQLite database:

> * If an upstream author or automated event mutated canonical history (e.g., a retroactive canon errata updated a character's physical condition) after the AST was drafted, *H*root​ will not match.  
> * The conductor flags the scene dependency as dirty (is\_dirty \= 1), rejects ingestion, and refuses to compile media until the AST is re-linted and re-compiled against current state, preventing historical desynchronization across the studio fleet.

---

*User prompt: {{FOCUS: 2\. Acoustic Synthesis (The Voice of the Canon) (Worker-Sower-Conductor) }} /extreme-details*

### **Response: The Master Physical Clock Axiom & Epistemological Hierarchy**

In conventional animation and digital video workflows, visual layouts dictate the timeline: keyframe animators time scene cuts, while sound engineers edit, pitch-shift, and stretch dialogue stems to fit the visual edits. In an automated generative pipeline, this dependency structure causes rubbery lip-sync, floating pauses, broken cadence, and video-audio drift.

The governing law of the worker-sower-conductor establishes that **audio is the architect of time; picture is an integer projection mapped to audio duration**:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ THE TEMPORAL COMPILATION PIPELINE                                     │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. Immutable Screenplay Contract (drafts/dialogue_ast.json)            │`  
`│                              │                                         │`  
`│                              ▼                                         │`  
`│ 2. Acoustic Synthesis (Stage 2): Local TTS Microservice (:8000)        │`  
`│    • Emits: 48 kHz uncompressed PCM mono/stereo .wav stems             │`  
`│                              │                                         │`  
`│                              ▼                                         │`  
`│ 3. ffprobe Physical Waveform Measurement (duration_ms)                 │`  
`│    • Empirical Observation: Continuous millisecond truth               │`  
`│                              │                                         │`  
`│                              ▼                                         │`  
`│ 4. Integer Quantization: target_frames = ceil(duration_ms / 1000 * 24) │`  
`│    • Mathematical Derivation: Discrete 24 fps timeline allocation      │`  
`│                              │                                         │`  
`│                              ▼                                         │`  
`│ 5. Sub-Frame Zero-Length Interval Clamp: max(1, target_frames)         │`  
`│                              │                                         │`  
`│                              ▼                                         │`  
`│ 6. Absolute Integer Frame Anchoring inside Episode_XXX.tsx             │`  
`└────────────────────────────────────────────────────────────────────────┘`

This design is rooted in an asymmetric cost profile: **speech synthesis is computationally lightweight, fast, and emotionally diagnostic, whereas video diffusion is computationally expensive, memory-intensive, and structurally fragile**. Video diffusion models have no innate understanding of biological cadence, speech tempo, or dramatic rhythm. By synthesizing dialogue first and measuring its physical waveform, the conductor locks exact frame budgets before allocating GPU compute on downstream foundries.

> * **Observation vs. Derivation Decoupling:** The duration in milliseconds (*D*ms​) measured via ffprobe represents the empirical *observation*; the integer frame count represents the downstream *derivation*. Both metrics are stored in separate, immutable fields within exposure\_sheet.json. If a deliverable target changes from 24 fps to 30 fps or 60 fps, frame budgets are re-derived from the original millisecond durations without requiring audio re-synthesis.  
> * **The Radio Play Animatic Gate (Phase A):** Before any GPU allocates a single byte of VRAM for video plates, synthesized dialogue stems are assembled into a headless audio animatic. Pacing, vocal dynamics, and dramatic delivery are reviewed and locked at this stage. Compute is never expended on a scene with flawed dramatic pacing.  
> * **Acoustic Stem Immutability:** Once synthesized and verified, .wav stems are content-addressed and archived in public/audio/dialogue/. Downstream rendering runtimes are strictly forbidden from calling text-to-speech (TTS) APIs during compositing, preventing sub-frame duration jitter from breaking the exposure sheet or misaligning visemes.

### **Hardware Demarcation & The Turn-Based VRAM Flush**

Acoustic synthesis executes under a strict hardware boundary between multi-threaded CPU orchestration on **Rig 1** and high-VRAM GPU rendering on **Rig 2**:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: ORCHESTRATION & ACOUSTIC HOST (Pure CPU / System RAM)           │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Execution Runtime: Full POSIX Node.js (produceEpisode.ts)            │`  
`│ • Acoustic Microservice: Local Python TTS (:8000, CosyVoice/Piper)     │`  
`│ • Compute Consumption: Multi-core CPU threads, 64 GB System RAM        │`  
`│ • Dedicated GPU VRAM Usage: EXACTLY 0 MB (Zero VRAM compute)           │`  
`│ • Child Processes Spawned: ffprobe, git, @remotion/renderer            │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Pure JSON API Payload`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: GPU TENSOR FOUNDRY (Isolated 24 GB VRAM Silicon)                │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ • Execution Runtime: Headless ComfyUI daemon on port 8188              │`  
`│ • Model Allocations: 100% of VRAM dedicated to Wan 2.2 / LoRA passes   │`  
`│ • Strict Boundary Invariant: ZERO TTS / Audio processes permitted     │`  
`│ • Multi-Tenant Collision Rule: ZERO Chromium / Remotion instances      │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **The Sequential VRAM Flush (POST /free)**

On single-GPU workstations where the local machine's GPU is utilized for preliminary drafting passes (Child Graph A: Qwen 2.5 14B GGUF via ComfyUI-GGUF), running a neural TTS model concurrently risks a fatal CUDA: Out of Memory collision.

Before dispatching speech generation requests, the conductor issues a synchronous HTTP POST request to ComfyUI's memory release endpoint:

`curl -X POST http://127.0.0.1:8188/free \`  
  `-H "Content-Type: application/json" \`  
  `-d '{"unload_models": true, "free_memory": true}'`

> * **Eviction Dynamics:** This command unbinds the active text model pointers and signals PyTorch to clear its cache, freeing \~14.2 GB of VRAM in approximately 300 milliseconds.  
> * **Hardware Isolation:** In dual-rig topologies, the local Python TTS microservice runs on Rig 1 entirely over CPU threads (or an isolated low-power inference accelerator), keeping Rig 2’s 24 GB VRAM envelope unfragmented for subsequent Wan 2.2 video diffusion passes.

### **Microservice Dispatch Architecture & Somatic DSP Injection**

The conductor's audio client (src/audio/ttsClient.ts) bridges the narrative contract (dialogue\_ast.json) into the acoustic domain. It processes each entry of SceneAST.lines by dispatching a structured JSON payload over HTTP POST to the local Python TTS microservice listening on port 8000 (\[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate)):

`// Payload dispatched by src/audio/ttsClient.ts`  
`export interface TTSGenerationRequest {`  
  `character: string;              // e.g., "char_bog", "ELIAS"`  
  `text: string;                   // Verbatim phonetic dialogue text`  
  `emotion: string;                // Closed condition enum (e.g., "tense_jaw")`  
  `tonePacing: number;             // Base pacing scalar (default: 1.0)`  
  `dsp_modifiers: {`  
    `basePitchShiftSemitones?: number;    // -12.0 to 12.0 semitones`  
    `formantWarpingFactor?: number;       // 0.5 to 2.0`  
    `breathinessPauseMultiplier?: number; // 1.0 to 3.5 (pulmonary trauma)`  
    `vocalFryDensity?: number;            // 0.0 to 1.0`  
    `pause_frequency_multiplier?: number; // Pacing scalar`  
  `};`  
`}`

#### **1\. Ingestion of the Narrative AST**

The dialogue text string is ingested strictly from dialogue\_ast.json. The compiler enforces **verbatim parity**: if an author updates .fountain prose without synchronizing the machine AST, the compilation pipeline aborts before audio synthesis is initialized.

#### **2\. Somatic DSP Profile Mapping**

The conductor translates biological damage logged in the upstream relational ledger into acoustic digital signal processing (DSP) parameters:

`LEDGER SOMATIC DAMAGE ──► ACOUSTIC DSP TRANSLATION MATRIX`  
`┌──────────────────────────────────────┬────────────────────────────────────────┐`  
`│ Biological Condition / Trauma Vector │ Injected DSP Parameters                │`  
`├──────────────────────────────────────┼────────────────────────────────────────┤`  
`│ Stage-1 Pulmonary Fibrosis / Gas     │ breathinessPauseMultiplier: 2.2        │`  
`│ Inhalation Damage[cite: 34]         │ pause_frequency_multiplier: 1.4        │`  
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

#### **3\. Vocal-Motor Hearsay Feasibility Gating**

Before dispatching a line to the TTS daemon, the conductor's pre-flight validator asserts physical capability:

*c*.has\_verbal\_directives⟹"mute"∈/*c*.conditions∧"speak"∈/*c*.banned\_kinetic\_verbs

If an entity with destroyed vocal cords or a severed trachea is instructed to speak, the compiler halts with a VOCAL\_DELIVERY\_BREACH, preventing invalid audio generation.

### **Signal Architecture, Automated Conformance & Loudness Gates**

Dialogue stems generated by the local TTS engine (such as CosyVoice, Parler-TTS, Chatterbox, or Piper) are saved as 48 kHz, 24-bit uncompressed .wav files. Before any stem is accepted into the scene layout, it passes through an automated inspection and conformance filtergraph:

`RAW TTS BUFFER (48 kHz PCM WAV from Port 8000)`  
       `│`  
       `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ PHYSICAL SIGNAL INTEGRITY INSPECTION                                  │`  
`│ • Speech-to-Text Verbatim Parity: STT matches AST text                 │`  
`│ • Noise Floor Certification: RMS unvoiced baseline < -60 dBFS         │`  
`│ • Sibilance & Clamping: Fast optical de-esser on 6–8 kHz band          │`  
`│ • High-Pass Roll-off: Mechanical rumble attenuation below 80–100 Hz    │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ AUTOMATED LOUDNORM PASS (Two-Pass FFmpeg ebur128 Filter)               │`  
`│ • Web / Streaming: Integrated -16 LUFS (±1.0 LUFS), Peak ≤ -1.0 dBTP   │`  
`│ • US Broadcast (ATSC A/85): Integrated -24 LKFS, Peak ≤ -2.0 dBTP      │`  
`│ • European Broadcast (EBU R128): Integrated -23 LUFS, Peak ≤ -1.0 dBTP │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│ Pass (Exit 0)`  
                                   `▼`  
          `public/audio/dialogue/${sceneId}_SH${shotIndex}.wav`

#### **1\. Noise Floor & Signal Purity Certification**

> * **Noise Floor Gate:** Dialogue stems are certified to maintain an unvoiced RMS noise floor below **−60 dBFS**. This prevents ambient digital hiss from becoming audible when downstream sidechain ducking envelopes release back to unity gain.  
> * **High-Pass Attenuation:** A 24 dB/octave high-pass filter rolls off low-frequency rumble below **80–100 Hz**, eliminating proximity-effect mud and sub-bass energy that could distort dynamic ducking sensors.  
> * **Optical De-Essing:** A dedicated de-esser targets harsh sibilance in the 6 kHz to 8 kHz band, preventing digital clipping during format compression.

#### **2\. Two-Pass EBU R128 / ATSC A/85 Loudnorm Standards**

Raw stems pass through an automated FFmpeg filter pass configured to the target delivery specification:

> * **Web / Streaming Standard:** Conformed to an integrated **−16 LUFS** (±1.0 LUFS) with a maximum True-Peak ceiling of **−1.0 dBTP**.  
> * **Linear Broadcast Standards:** Conformed to **−24 LKFS** (±1.0 LKFS) with a **−2.0 dBTP** ceiling for ATSC A/85 (US), or **−23 LUFS** with a **−1.0 dBTP** ceiling for EBU R128 (Europe).  
> * **True-Peak Limiting:** Inter-sample clipping is prevented using a brickwall True-Peak limiter; sample-peak measurements (dBFS) are strictly decoupled from True-Peak limits (dBTP) to guarantee signal compliance across various DAC decoders.

### **Dual-Domain Clock Architecture & Temporal Projection**

To maintain audio phase fidelity while enforcing strict video frame boundaries, the conductor bridges two synchronized temporal domains:

`AUDIO TIMEBASE DOMAIN: 48,000 integer samples/sec (Continuous Acoustic Truth)`  
  `│`  
  `├─ Raw Measured Duration: e.g., 3,120 ms (149,760 samples)`  
  `├─ Phoneme / Viseme Onsets (e.g., Bilabial plosive at Sample 26,742)`  
  `└─ Dynamic Sidechain Ducking Curve (-14 dB Speech Window)`  
  `│`  
  `▼ Projection: Sample Index S = Frame * (48,000 / 24) = Frame * 2,000`  
`MASTER VIDEO CLOCK: 24.0 integer frames/sec (Discrete Cut Boundaries)`  
  `│`  
  `├─ Calculated Target Frames: ceil(3.120 * 24) = 75 frames`  
  `└─ Absolute Timeline Anchor: fromFrame_k = Σ duration_i`

> * **The Projection Ratio:** The mathematical bridge between both domains resolves to a fixed integer multiplier:  
>   24 frames/sec48,000 samples/sec​\=2,000 audio samples per video frame  
> * **The Coordinate Mapping Equation:** The sample index *S* matching frame *F* is calculated as:  
>   *S*\=*F*×2,000  
>   A transient occurring at sample coordinate 26,742 maps to video frame ⌊26,742/2,000⌋=Frame 13, while the audio stream plays back at full sample precision to eliminate phase cancellation or lip-sync latency.

#### **Absolute Integer Anchoring & Anti-Drift Math**

Concatenating rounded audio stems end-to-end introduces up to 41.7 ms (one full video frame at 24 fps) of silence padding per shot. Across a 24-shot sequence, linear chaining causes over half a second of cumulative drift against background music and Foley cues.

The conductor resolves this by mapping each stem to an absolute timeline frame coordinate evaluated at compile time:

fromFrame*k*​\=*i*\=1∑*k*−1​total\_shot\_frames*i*​

Total scene drift relative to the true audio duration is mathematically bounded to less than one frame (\<41.7 ms) across an entire episode, regardless of cut count.

### **Swain MRUs, Pacing Dynamics & Narrative \[BEAT\] Nodes**

Dialogue pacing is governed by Dwight Swain's Motivation-Reaction Unit (MRU) structure (Stimulus → Reflex → Calculation → Action/Speech), preventing characters from delivering lines without accounting for visceral shock or cognitive hesitation:

`SCENE EVENT (Stimulus) ──► AST Cue: reaction_cue = "VISCERAL_STING"`  
                             `│`  
                             `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ PRE-ROLL REACTION BUFFER INJECTION                                     │`  
`│ • Injects 8 to 24 frames of held silence / camera push-in              │`  
`│ • Speech stem audio remains muted during pre-roll interval             │`  
`│ • Stored independently as pre_roll_frames in exposure_sheet.json       │`  
`└────────────────────────────────────┬───────────────────────────────────┘`  
                                     `│`  
                                     `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ NARRATIVE [BEAT] NODE EXECUTION (Silence & Atmospheric Swell)          │`  
`│ • duration_seconds_requested: 4.5s ──► TTS engine BYPASSED entirely    │`  
`│ • Foley Engine places match_strike.wav at specified offset             │`  
`│ • POD-16 Score Engine swells atmospheric drone to fill the void        │`  
`│ • Swell decays exactly 0.5s prior to next spoken dialogue node         │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Reaction Pre-Roll Injection:** When reaction\_cue is set to VISCERAL\_STING, the conductor inserts an authored pre-roll buffer of **8 to 24 frames** of held reaction or camera movement before the dialogue audio stem begins.  
> * **Narrative Pause Swell (\[BEAT\] Nodes):** When the AST introduces dedicated narrative pause markers (\[BEAT\] nodes), the TTS engine is bypassed entirely. The conductor mounts punctual Foley cues and triggers POD-16 (Score & Composition) volume automation, swelling ambient drones to fill the narrative void before decaying them **0.5 seconds** prior to the resumption of dialogue.

### **Multi-Track Priority Topology & Sidechain Gain Automation**

Within the Remotion optical compositor (Episode\_XXX.tsx), audio is assembled across three concurrent, prioritized layers:

`Track 1: Spoken Dialogue Stems (High Priority / Fixed Clocks via ffprobe)`  
         `[--------- Shot 01 (75f) ---------]          [--------- Shot 02 (90f) ---------]`  
`Track 2: Spot Foley Transients (Medium Priority / Mulberry32 PRNG Seeded)`  
                `[*valve_scrape*]                             [*boot_squelch*]`  
`Track 3: Continuous Ambient Bed & Score (Low Priority / Sidechain Ducked)`  
`────┐                                       ┌────────┐                                 ┌────`  
    `│                                       │        │                                 │`  
    `└───────────────────────────────────────┘        └─────────────────────────────────┘`  
      `^ Attack (6f)          Release (12f) ^          ^ Attack (6f)      Release (12f) ^`  
      `Ducking Floor: -14 dB                           Ducking Floor: -14 dB`

#### **1\. Track Layer Hierarchy**

> * **Track 1 (Dialogue Stems):** Immutable 48 kHz .wav files mounted at absolute integer frame coordinates.  
> * **Track 2 (Spot Foley Transients):** Physical sound effects extracted from screenplay action cues and mapped via FOLEY\_REGISTRY. Variant selection is resolved deterministically at compile time using a Mulberry32 PRNG:  
>   Seed=MurmurHash3(sceneId+":"+shotId+":"+sampleKey)  
>   If the generator draws a sample variant identical to the preceding shot, an anti-clustering salt (:retry) is appended to pull an alternate take. Variants are baked as literal strings into TSX props (src={staticFile("audio/foley/boot\_squelch\_02.wav")}), eliminating runtime PRNG evaluation.  
> * **Track 3 (Continuous Ambient Beds & Score):** Atmospheric loops and isolated music stems from POD-16 (Melodic, Harmonic, Percussive, Sub-bass). Ambient beds persist across cut boundaries with linear crossfades, maintaining acoustic continuity.

#### **2\. Programmatic Sidechain Ducking Math (AmbientTrack.tsx)**

Vocal intelligibility is enforced via programmatic gain curves rather than analog compressor emulation. During dialogue windows (*f*start​≤*f*≤*f*end​), background tracks attenuate by **−14 dB**:

Gainducked​\=1020−14 dB​×*V*base​≈0.1995×0.40≈0.0798  
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
    `minGain = Math.min(minGain, windowGain);`  
  `}`

  `return minGain;`  
`};`

> * **Multi-Window Reducer (Math.min):** The ducking engine evaluates all active dialogue windows across the scene simultaneously. If two lines are separated by a pause shorter than the release-and-attack window, the background track remains held at the −14 dB floor, preventing volume pumping between sentences.  
> * **Deliberate Dramatic Silence:** In austere narrative profiles where musical scoring is suppressed, deliberate dramatic silences are encoded as explicit ducking events, attenuating background beds down to **−24 dB**.

---

*User prompt: can you look at the beginning of the conversation and create a summary of all of the most important information until the last response regarding the \[worker-sower-conductor\]*

Response: The worker-sower-conductor (originally designed as goblin-conductor) is the local pipeline conductor, temporal clock authority, and optical media assembly host within the Generative Production Pipeline. Operating exclusively on **Rig 1**—a dedicated CPU and system RAM workstation requiring zero dedicated GPU silicon or VRAM—it acts as the operational counterpart to worker-sower-engine. While the upstream engine operates at the edge as an epistemological state machine to resolve narrative law, spatial adjacency, and duel math, the conductor translates abstract narrative specifications into physical, time-based broadcast media.

`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE EDGE: worker-sower-engine (Epistemic State & Narrative Core)               │`  
`│ • Resolves 2d6 duels, spatial queries, and relational ledger mutations (Sn -> Sn+1)    │`  
`│ • Emits: Immutable drafts/dialogue_ast.json contract & uncommitted staging deltas      │`  
`└───────────────────────────────────────────┬────────────────────────────────────────────┘`  
                                            `│ HTTP / Git Transport`  
                                            `▼`  
`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: worker-sower-conductor (Local Assembly Host & Temporal Conductor)               │`  
`│ • Hardware: Multi-core CPU, 64 GB System RAM, ZERO Dedicated GPU Compute               │`  
`│ • Runtime: POSIX Node.js (Child processes: ffprobe, @remotion/renderer, git)          │`  
`│ ├── 1. Ingestion: Validates AST against Zod schemas & verifies Merkle hash (H_root)   │`  
`│ ├── 2. VRAM Hygiene: Issues turn-based POST http://127.0.0.1:8188/free model flush     │`  
`│ ├── 3. Acoustic Clock: Calls local TTS (:8000) -> 48 kHz uncompressed .wav stems      │`  
`│ ├── 4. Temporal Quantization: Spawns ffprobe; locks discrete 24fps frames (ceil math)  │`  
`│ ├── 5. Acoustic Assembly: Anti-drift cumulative tiling & -14 dB sidechain ducking      │`  
`│ ├── 6. Adapter Conformance: Formulates 4n + 1 causal VAE allocations & cadence modes   │`  
`│ ├── 7. Hardware Dispatch: Emits SpokeExecutionPayload to edge-director / Rig 2         │`  
`│ ├── 8. Optical Printing: Compiles Episode_XXX.tsx; runs Remotion CLI (gl: 'swangle')   │`  
`│ ├── 9. Visual Closed-Loop QA: Volatility sampling (MAD) & MEU AST repair via ts-morph  │`  
`│ └── 10. Canon Sealing: Drains DO staging memory, checks DAG, and signs Git commit      │`  
`└───────────────────────────────────────────┬────────────────────────────────────────────┘`  
                                            `│ Media Egress / Canon Storage`  
                                            `▼`  
`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ DOWNSTREAM ARTIFACTS: goblin-episodes/ (Master MP4 deliverable) & Signed Git History  │`  
`└────────────────────────────────────────────────────────────────────────────────────────┘`

### **Architectural Identity & System Boundaries**

The architecture enforces an absolute boundary between narrative simulation, temporal orchestration, and tensor generation:

| Architectural Vector | Upstream Engine (worker-sower-engine) | Local Conductor (worker-sower-conductor) | Downstream Foundry (media-broker / Rig 2\) |
| :---- | :---- | :---- | :---- |
| **Physical Host** | Cloudflare Edge Worker / Durable Object | **Rig 1** (Local CPU/System RAM Workstation) | **Rig 2** (Dedicated High-VRAM GPU Workstation) |
| **Operational Domain** | **Narrative Meaning & Law** | **Physical Time & Media Execution** | Headless Tensor Diffusion & KSampling |
| **Compute Profile** | V8 Isolate (≤128 MB RAM, no disk) | Pure CPU, System RAM, Multi-threaded I/O | Dedicated GPU Silicon (24 GB VRAM) |
| **Child Processes** | **Banned** (Cannot spawn Linux binaries) | **Required** (ffprobe, Remotion CLI, git) | Headless Python/ComfyUI Daemon |
| **Acoustic Function** | Emits line text, speaker IDs, and emotion tags | Calls local TTS (:8000), quantizes frames | Zero audio processing (prevents OOM collisions) |
| **Optical Assembly** | None (Visual-agnostic; zero JSX/Remotion) | Remotion CLI with software GL (swangle) | **Banned** (Zero Chromium/Remotion instances) |
| **State Interaction** | Evaluates active ledger; mutates *Sn*​→*Sn*\+1​ | Drains unsealed deltas; writes signed Git commits | Stateless compute spoke (holds no historical canon) |

#### **Boundary Isolation Logic**

> * **The Edge Sandbox Exclusion:** The upstream engine cannot orchestrate media because Cloudflare V8 isolates enforce a 128 MB RAM ceiling and strictly prohibit spawning system child processes (ffprobe, @remotion/renderer, git).  
> * **The Foundry Exclusion:** Rig 2 is strictly reserved for high-VRAM GPU tensor diffusion (Wan 2.2 character plates on port 8188). Spawning headless Chromium instances (@remotion/renderer) or audio workers on Rig 2 causes memory thrashing, driver conflicts, and Linux Out-Of-Memory (OOM) aborts that break sequential VRAM hygiene.  
> * **Namespace Discipline:** The worker-sower-\* prefix is dedicated exclusively to domain-agnostic generative pipeline infrastructure, while goblin-\* is reserved for world-specific instances, creative assets, and lore.

### **Target Repository Layout (worker-sower-conductor)**

The conductor code repository isolates all I/O-heavy, binary-dependent execution layers from the core simulation engine:

`worker-sower-conductor/`  
`├── package.json                     # private: true; deps: zod, ws, dotenv, @remotion/renderer`  
`├── tsconfig.json                    # NodeNext, strict mode`  
`├── .env.production                  # RIG2_HOST, EDGE_DIRECTOR_WS_URL, TTS_SERVICE_URL`  
`├── drafts/                          # Ephemeral staging workspace for the active production cycle`  
`│   ├── dialogue_ast.json            # Ingested screenplay contract from worker-sower-engine`  
`│   └── exposure_sheet.json          # Derived timing manifest from ffprobe analysis`  
`├── workflows/                       # Headless ComfyUI API templates injected with target_frames`  
`│   ├── wan_greenscreen_i2v.json     # Graph C: Diffusion character plate template`  
`│   └── flux_matte_background.json  # Matte background plate template`  
`└── src/`  
    `├── index.ts                     # Conductor CLI entrypoint`  
    `├── audio/`  
    `│   ├── ttsClient.ts             # HTTP caller to local Python TTS microservice (Port 8000)`  
    `│   └── ffprobeQuantizer.ts      # Spawns ffprobe child process; locks 24fps frames`  
    `├── dispatch/`  
    `│   ├── payloadBuilder.ts        # Compiles SpokeExecutionPayload with locked frame math`  
    `│   └── edgeDirectorClient.ts    # Manages WSS connection & heartbeat leases to edge-director`  
    `├── remotion/`  
    `│   ├── assetIngest.ts           # Stages returned #00FF00 character plates from Rig 2 / R2`  
    `│   ├── generateTsx.ts           # Metaprograms static Episode_XXX.tsx Remotion manifest`  
    `│   └── renderSubprocess.ts      # Spawns @remotion/renderer CLI subprocess (gl: 'swangle')`  
    `├── git/`  
    `│   ├── pullStaging.ts           # Drains unsealed SowerDO staging memory via HTTP`  
    `│   └── gitSealer.ts             # Verifies relational DAG and executes signed git commit`  
    `└── pipeline/`  
        `└── produceEpisode.ts        # Master Conductor Lifecycle Harness (Sequential Pipeline)`

### **The Master Conductor Lifecycle Contract (produceEpisode.ts)**

The operational core of worker-sower-conductor is governed by a strict sequential execution lifecycle implemented in src/pipeline/produceEpisode.ts:

#### **1\. Ingestion & Dialogue Extraction**

The cycle begins by ingesting drafts/dialogue\_ast.json, an immutable AST emitted by worker-sower-engine.

> * **Contract Validation:** Validated via Zod against SceneASTSchema, extracting spoken dialogue lines, character IDs, emotional condition tags, somatic DSP modifiers, and Dwight Swain Motivation-Reaction Unit (MRU) directives.  
> * **Cryptographic State Lock (*H*root​):** The conductor inspects the AST's state\_snapshot\_hash against the active relational database ledger (Cloudflare D1 / SQLite). If upstream narrative state mutated after the AST was drafted, the scene is flagged as dirty (is\_dirty \= 1), aborting execution before compute resources are spent.  
> * ***T*****0​ Invariant Enforcement:** The payload must satisfy upstream *T*0​\=\$0.00 invariants: *Ignorance by Omission* (secret propositions physically omitted from token context), dual-field kinetic action verification (*O*(1) set-intersection against character somatic limits), and stylometric voice constraints.

#### **2\. Acoustic Synthesis & Master Clock Initialization**

The conductor treats audio as the non-negotiable master clock governing physical time; video diffusion models possess no innate concept of biological cadence, so speech must exist on disk before visual timelines can be computed.

> * **Sequential VRAM Flush (POST /free):** If local GPU silicon was used during preliminary drafting passes, the conductor issues a synchronous HTTP POST request to \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) ({"unload\_models": true, "free\_memory": true}), clearing \~14.2 GB of language model weights in \~300 ms to reserve unfragmented VRAM for vocal models.  
> * **Microservice Dispatch:** Iterates through SceneAST.lines, dispatching HTTP POST requests to the local Python TTS microservice on port 8000 (\[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate)).  
> * **Somatic DSP Parameter Injection:** Injects somatic parameters derived from character trauma (e.g., a pulmonary injury injects pause\_frequency\_multiplier: 1.4 and breathiness\_pause\_multiplier: 2.2).  
> * **Acoustic Compliance & Immutability:** Emits uncompressed 48 kHz .wav stems stored in public/audio/dialogue/. Stems must pass an automated loudness gate targeting an integrated **\-16 LUFS** (± 1.0 LUFS) and a True-Peak ceiling ≤ **\-1.0 dBTP**. Stems are sealed as immutable artifacts; downstream renderers are strictly prohibited from re-calling the TTS service.

#### **3\. Temporal Quantization & Acoustic Geometry**

Continuous millisecond sound is quantized into discrete video timelines:

> * **ffprobe Interrogation:** Spawns an asynchronous ffprobe child process to extract the millisecond duration (*D*ms​) of every .wav buffer.  
> * **Integer Ceiling Quantization Math:** Frame budgets are calculated using integer ceiling arithmetic at 24 fps:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉\=⌊1000(*D*ms​×24)+999​⌋  
> * **Zero-Length Interval Clamp:** Short interjections (\<41.67 ms) are clamped to a minimum duration of 1 frame (41.67 ms) with digital silence padding to prevent inverted timeline intervals (EndFrame\<StartFrame).  
> * **Cumulative Millisecond Anti-Drift Anchoring:** Concatenating rounded stems end-to-end introduces up to 41.7 ms of silence padding per shot, accumulating seconds of drift against continuous tracks. The conductor calculates timeline placement from a running cumulative millisecond sum quantized once:  
>   StartFrame*k*​\=⌈1000∑*i*\=1*k*−1​*Di*​​×24⌉,EndFrame*k*​\=⌈1000∑*i*\=1*k*​*Di*​​×24⌉−1  
>   Because EndFrame*k*​\+1≡StartFrame*k*\+1​, consecutive shots tile the timeline with zero gaps, zero overlaps, and total episodic drift bounded to \<41.7 ms.  
> * **The Dual-Domain Clock Formulation:** Maps 48,000 samples/sec continuous audio to 24 frames/sec video via the exact integer ratio:  
>   24 frames/sec48,000 samples/sec​\=2,000 audio samples per video frame  
>   A transient at sample coordinate *S* projects to video frame *F*\=⌊*S*/2,000⌋, preserving sample-accurate audio fidelity alongside frame-accurate visual cuts.

#### **4\. Acoustic Topology & Swain MRU Pacing Assembly**

Audio inside the Remotion manifest is assembled across a three-track priority hierarchy:

> * **Track 1 (Dialogue Stems):** Master clock audio pinned to absolute integer frames.  
> * **Track 2 (Spot Foley Transients):** Physical sound cues extracted from AST action nouns via FOLEY\_REGISTRY. Variant selection is resolved deterministically at compile time using a Mulberry32 PRNG keyed to MurmurHash3(sceneId \+ ":" \+ shotId \+ ":" \+ cueName) with an anti-clustering salt (:retry) to prevent identical back-to-back assets.  
> * **Track 3 (Continuous Ambient Beds & Score):** Atmospheric beds persisting across shot transitions with linear crossfades. Vocal clarity is enforced via programmatic sidechain gain automation (AmbientTrack.tsx): background beds attenuate by **\-14 dB** during dialogue using a 6-frame quadratic attack and a 12-frame quadratic release, composed across multiple speech windows via a Math.min() reducer to eliminate volume pumping. Deliberate dramatic silences attenuate beds to **\-24 dB**.  
> * **Dwight Swain MRU Pacing:** Pacing is structured around Stimulus → Reflex → Calculation → Action/Speech. Cognitive shock directives (reaction\_cue: "VISCERAL\_STING") inject an authored pre-roll reaction buffer of **8 to 24 frames** of silence or camera push-in before dialogue audio un-mutes. AST \[BEAT\] pause nodes swell background drones to fill physical silence, decaying 0.5s prior to resuming speech.

#### **5\. Model Adapter Conformance & The 4*n*\+1 Lattice**

The conductor isolates diffusion model constraints within backend adapters, preserving universal 24 fps narrative time:

> * **3D Causal VAE Downsampling:** Video diffusion models with temporal downsamplers (e.g., Wan 2.1/2.2) mandate frame allocations conforming to a discrete 4*n*\+1 lattice (17,21,25,33,49,65,77,81,…).  
> * **Ceiling Allocation Formula:** Flooring frame counts truncates plates shorter than spoken dialogue; the adapter strictly rounds up:  
>   *N*raw​\=⌈(1000*D*ms​​)×native\_fps⌉,diffusion\_allocation=4×⌈4*N*raw​−1​⌉\+1  
> * **Cadence Engineering:**  
  * *Configuration A (Native 12 fps "On Twos"):* Raw frames allocated at 12 fps on 4*n*\+1; duplicated 1:2 to reach 24 fps with zero judder, trimming excess tail frames.  
  * *Configuration B (Native 24 fps Direct Match):* 1:1 identity mapping on 4*n*\+1, trimming 1 to 3 padding frames at the shot tail.  
  * *Configuration C (Native 16 fps Optical Flow):* Native frames trimmed and resampled to 24 fps via motion-vector interpolation (e.g., RIFE).  
> * **Sawtooth Waste Cost Audit (scripts/audit-frame-waste.ts):** Because 4*n*\+1 is a step function, needing 38 native frames forces 41 frames (*n*\=10, wasting 3 frames), while 37 frames wastes 0 frames. The conductor audits stems pre-dispatch, alerting operators when trimming \<65 ms of acoustic silence saves compute cycles.  
> * **Typed Socket Contracts:** Enforces upstream validation of tensor depth, temporal downsampling ratios, and latent families before dispatch, preventing crashes caused by routing incompatible tensors into ComfyUI samplers.

#### **6\. Hardware Dispatch & Edge Multiplexing**

The conductor constructs an immutable execution contract and coordinates with remote foundries without direct GPU coupling:

> * **SpokeExecutionPayload:** Compiles jobId, artistId, workflowTemplate, prompts, character LoRAs, conformed diffusionAllocation, masterDeliveryFrames, and deterministic seeds.  
> * **Ingress Pre-Flight Gate (is\_dirty \== 0):** Ingress gateway queries Cloudflare D1; if canonical facts mutated, the job is rejected with HTTP 412 before entering the hardware queue.  
> * **Single-Threaded Hardware Mutex (ShotCoordinatorDO):** Cloudflare Durable Object provides serialized, single-threaded FIFO access to Rig 2, eliminating concurrent CUDA collisions. Implements per-tenant fair round-robin scheduling and UUIDv7 idempotency caching.  
> * **WebSocket Hibernation:** Bridges persistent client-broker sockets at \$0.00 idle CPU cost, waking within 2 ms upon incoming telemetry.  
> * **Distributed Leases & Monotonic Fencing Tokens:** Issues 30-second leases renewed via 10-second heartbeats (BROKER\_HEARTBEAT). Workers upload renders to epoch-scoped paths (staging/renders/\${taskId}/epoch\_\${epoch}\_\${sha256}.mp4). If a worker partitions and times out, its completion sentinel is rejected with HTTP 409 Conflict, preventing zombie workers from corrupting canonical storage. Hardware alarms (ctx.storage.setAlarm()) autonomously re-queue dead jobs.  
> * **Inverted Sovereignty (Local flock):** The local daemon on Rig 2 holds an unconditional OS file lock (flock) on the GPU, pulling work from the edge queue only when silicon is idle. If network partitions occur, the broker spools jobs from a local disk queue (/var/spool/renders) using the exact same code path.

#### **7\. Optical Master Assembly (FinalCompositeMaster.tsx)**

Once Rig 2 deposits raw \#00FF00 character plates into Cloudflare R2, the conductor executes optical mastering locally on Rig 1:

> * **Metaprogrammed Static Manifests:** Executes generate-episode-repo.ts to bake frame budgets, cut offsets, and audio stems directly into static React JSX (Episode\_XXX.tsx). Rendering runtimes perform zero dynamic duration guessing.  
> * **Software GL Rasterization:** Spawns @remotion/renderer CLI with \--gl=swangle (SwiftShader software OpenGL in system RAM), \--concurrency=1, and \--offthreadvideo (FFmpeg-isolated decoding), bypassing GPU drivers to eliminate memory leaks and CUDA collisions.  
> * **The Four-Layer Compositing Stack:**  
  * *Layer 1 (Matte Background):* Static 2048×1152 matte plate establishing perspective, horizon, light vectors, and *Y*ground​ plane; camera moves evaluate as affine matrix transforms via interpolate and spring.  
  * *Layer 2 (Practical Atmosphere & SVG Vectors):* Volumetric smoke/rain loops blended via screen/additive; all text and HUD callouts conform to the Zero-Diffusion Text Rule, rendering as vector SVGs.  
  * *Layer 3 (Foreground Actor Grounding):* ChromaKeyFilter executes green-channel suppression and edge despill; convolved light-wrap integrates actors into background luminance; tracked dynamic contact shadows (elliptical radial multiply gradients) scale inversely with vertical displacement above floor anchors; facial landmarks drive Preston Blair viseme swapping.  
  * *Layer 4 (Anti-Diffusion Mastering Stack):* Micro-diffraction blur (0.4px), optical halation bloom on the top 5% luminance, unified chemical 3D LUT (.cube), and authentic scanned 35mm film grain overlay (14–15% opacity) harmonize synthetic elements.  
> * **Closed-Loop Visual QA & MEU Surgical Repair:** Audits candidate MP4s using Kinematically Directed Sampling (tracking Mean Absolute Difference volatility *Vt*​), alpha edge purity (green channel intensity \<12), and viseme centroid drift (∣mouth−viseme∣\<4px). When code defects occur, ts-morph surgically mutates failing JSX attributes in-place, re-rendering only the affected frame slice (--frames=X-Y) on Rig 1 CPU at \$0.00 cloud spend.  
> * **Provenance Release:** Generates render\_manifest.json and injects cryptographic C2PA metadata directly into the master container header (master\_epXXX.mp4), embedding input digests, toolchain versions, and Git SHAs.

#### **8\. Canon Sealing & Ledger Finalization (gitSealer.ts)**

Media assembly hands control back to src/git/gitSealer.ts to finalize the state transaction:

> * **Staging Delta Ingestion:** The conductor issues an HTTP call to SowerDO via src/git/pullStaging.ts, draining uncommitted narrative mutations (*Sn*​→*Sn*\+1​) generated during mechanical resolution.  
> * **Relational DAG Verification:** Verifies structural and relational constraints against the local database schema.  
> * **Cryptographic Git Commit:** Executes a signed Git commit stamping bible-state.json and episodic manifests into the canonical ledger. This locks the episode's events permanently into historical truth and triggers downstream systems to update dependencies against the new active state.

---
