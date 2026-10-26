# **Overview: Goblin-Assets-Audio.00**

[https://gemini.google.com/app/23e8e8aa53d1f7a5](https://gemini.google.com/app/23e8e8aa53d1f7a5)

*User prompt: we are starting working on the next repository \[Goblin-Assets-Audio \]; can you present me with a complete overview*

Response: goblin-assets-audio is the dedicated audio authority and acoustic source vault within **Cluster 04.assets (The Source Art Vault)**. It houses the immutable, production-certified raw voice reference WAVs, dynamic musical score stems, and physical Foley sound libraries for *Under the Floorboards*.

In this architecture, **audio is the architect of time**: dialogue durations establish the master physical clock that dictates every downstream video frame count. Isolating acoustic assets into goblin-assets-audio ensures animators never pull gigabytes of raw uncompressed audio, while providing the strict versioning discipline required for load-bearing speech synthesis models.

### **1\. Architectural Boundary & Separation of Concerns**

goblin-assets-audio is strictly decoupled from dynamic runtime generation and code execution:

> * **Source Assets vs. Runtime Data:** It contains *source references and libraries*, not transient episodic outputs. The uncompressed dialogue WAV stems generated per line (via audio-microservice) and staged in goblin-episodes/epXXX/public/assets/audio/ are runtime artifacts produced on demand, not tracked in this vault.  
> * **Load-Bearing Production Data:** Unlike iterative visual sketches, reference files in /voices (e.g., bog\_v1.wav, spleen\_v1.wav) are operational dependencies for neural speech synthesis (e.g., CosyVoice, Parler-TTS, Piper). Modifying or corrupting a voice reference silently reshapes character vocal timbre across the entire show.  
> * **Single-Consumer Decoupling:** Downstream consumers only pull what they require. goblin-viewport-template and the episode compiler sync only the Foley and ambient beds needed for assembly, while audio-microservice ingests the reference audio to calibrate neural synthesis.

### **2\. Git LFS Configuration & Directory Topology**

Binary acoustic assets are tracked strictly via **Git Large File Storage (Git LFS)**:

`git lfs track "*.wav" "*.mp3" "*.flac"`  
`git add .gitattributes`  
`git commit -m "Configure LFS tracking"`

The canonical directory layout provides dedicated workspaces for reference audio, transient sound effects, and continuous musical/environmental beds:

`goblin-assets-audio/`  
`├── .gitattributes                # Git LFS tracking rules (*.wav, *.mp3, *.flac)`  
`├── CHANGELOG.md                  # Explicit revision log for reference takes & stem updates`  
`├── AUDIO_SPEC.md                 # 48 kHz / 24-bit PCM standards, LUFS targets, ducking laws`  
`├── voices/                       # Neural reference WAVs for local TTS microservice`  
`│   ├── voice_manifest.json       # DSP warping recipes, speaker IDs, and reference SHAs`  
`│   ├── bog/`  
`│   │   ├── bog_v1.wav            # Production reference take (never overwrite in-place)`  
`│   │   └── bog_v2.wav            # Tagged revision if vocal timbre evolves`  
`│   ├── spleen/`  
`│   │   └── spleen_v1.wav`  
`│   ├── wart/`  
`│   │   └── wart_v1.wav`  
`│   └── grissel/`  
`│       └── grissel_v1.wav`  
`├── foley/                        # Spot transient SFX library`  
`│   ├── registry.json             # Semantic lookup registry (FOLEY_REGISTRY mappings)`  
`│   ├── impacts/                  # valve_drop.wav, pipe_clang_01.wav`  
`│   ├── locomotion/               # boot_squelch_01.wav, boot_squelch_02.wav`  
`│   └── handling/                 # brass_rattle.wav, cloth_grab_heavy.wav`  
`└── music/                        # Dynamic score & ambient sound beds`  
    `├── manifest.json             # Loop metadata, BPM, root keys, and intro/tail stems`  
    `├── ambient/                  # swamp_drone.wav, pipe_hum_40hz.wav`  
    `└── score/`  
        `└── crawlspace_tension/   # Multi-track stems (bass, percussion, pads)`

### **3\. Subsystem Contracts & Operational Invariants**

#### **A. Voice References (voices/voice\_manifest.json)**

To avoid vocal monoculture and ensure reproducible speech synthesis, character voices pair reference WAVs with algebraic DSP tract transformations:

> * **Explicit Versioning:** Reference files are tagged immutably (bog\_v1.wav, not bog.wav). Downstream service configs lock to exact filenames and SHA-256 hashes.  
> * **DSP Warping Offsets:** voice\_manifest.json specifies character tract modifications applied over the base checkpoint (e.g., basePitchShiftSemitones: \+3.8, formantWarpingFactor: 0.86) to create distinct non-human anatomies without runtime overhead.  
> * **Audit Trail:** Any modification to a voice profile requires a rationale entry in CHANGELOG.md, adhering to the same governance discipline as canon changes in goblin-bible.

#### **B. Foley Registry (foley/registry.json)**

Foley is not dropped into a DAW timeline manually; it is triggered deterministically via the screenplay AST and FoleyTrack.tsx:

> * **Lexical Mapping:** The registry maps semantic cues parsed from the narrative script (e.g., wet\_cough, metal\_boot\_scrape, valve\_drop) to concrete audio samples.  
> * **Deterministic Seeding & Anti-Clustering:** Variant selection across concurrent Remotion workers uses compound seed keys (e.g., pickFromPool(pool, "\${sceneId}:\${triadId}:\${cue}")) and retry salts to guarantee deterministic frame-accurate audio without clumping identical sounds.

#### **C. Continuous Beds & Score (music/)**

Ambient sound beds and score layers operate as low-priority continuous channels:

> * **Sidechain Ducking Compliance:** Stems must be calibrated to support automated ducking curves in the compositor, attenuating by **\-14 dB** during active dialogue frames with a 4-frame ramp.  
> * **Acoustic Grounding:** Stems declare frequency spectrum profiles (low-frequency hums vs. high-frequency transients), enabling spatial attenuation engines like goblin-spatial to compute low-pass barrier damping across rooms.

### **4\. Downstream Ingestion & Storage Discipline**

> 1. **The Master Clock Axiom:** Continuous physical duration extracted from synthesized dialogue stems via ffprobe is quantized into discrete 24 fps integer video frames using ⌈(duration\_ms/1000)×24⌉ (governed by the constant of 2,000 PCM samples per frame at 48 kHz).  
> 2. **Selective Harvesting (collect-episode-assets.ts):** Stamped episode workspaces in goblin-episodes/ do not clone the full audio vault. The asset harvester parses dialogue\_ast.json to pull *only* the specific Foley cues and ambient loops required for that script, enforcing the strict **\< 100MB to 150MB per-episode storage ceiling**.  
> 3. **The Zero-Byte Poison Sentinel:** Pre-flight CI checks compute SHA-256 hashes of all staged audio binaries; any asset matching the empty hash (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855) aborts compilation immediately, preventing un-pulled Git LFS pointers or network dropouts from corrupting renders.

---

*User prompt: {{FOCUS:  1\. Architectural Boundary & Separation of Concerns }} /extreme-details*

Response: goblin-assets-audio operates under a strict architectural boundary that defines it as the immutable, content-addressed acoustic vault within **Cluster 04.assets (The Source Art Vault)**. Its separation of concerns is enforced through rigid taxonomic, logistical, and domain-specific firewalls designed to prevent repository bloat and maintain structural purity.

> * **Source Media vs. Runtime Output:** The repository is restricted entirely to *source* assets—specifically master voice reference WAVs, dynamic musical score stems, and physical Foley SFX libraries. It explicitly rejects generated TTS dialogue or downstream runtime audio output, which are classified as transient runtime data rather than canonical source assets.  
> * **Targeted Consumer Isolation:** By isolating audio into a dedicated repository, the architecture ensures that downstream consumers only pull their exact dependencies. The audio-microservice requires only the voice reference WAVs to function, just as the goblin-viewport syncs only visual art. If these assets were combined into an omnibus repository, every worker and consumer would be forced to clone gigabytes of irrelevant binary weight, muddying the dependency graph.  
> * **Taxonomic Integrity (Type E vs. Type A):** The repository enforces the studio's internal ARTE taxonomy by strictly isolating "TYPE E: THE ASSET (Binary & Static Media)" from "TYPE A: THE LAW (Schemas & Logic)". Audio assets provide sensory output and are governed by strict quota audits, which is functionally distinct from structural or legislative code. Embedding binary audio data into the same repository as generated TSX templates would collapse this fundamental distinction.  
> * **The 4GB Global Ceiling Constraint:** The studio operates under a shared, finite 4GB storage budget across the entire project. By storing audio assets centrally in goblin-assets-audio and referencing them via file paths and commit pins in downstream episode workspaces (goblin-episodes), the architecture prevents the fatal redundancy of copying identical audio files into 40 separate episode folders, which would instantly blow through the global data limit.  
> * **Strict Series-Specific Ontology:** goblin-assets-audio represents a concrete "Story Instance" and is strictly dedicated to a single diegetic universe (e.g., *Under the Floorboards*). It cannot be shared across multiple series because it houses universe-specific acoustic training data, character voice timbre references, and distinct environmental Foley (such as crawlspace valve drops and pipe squelches) tailored entirely to the goblin universe.

---

*User prompt: {{FOCUS:  2\. Git LFS Configuration & Directory Topology }} /extreme-details*

Response: The goblin-assets-audio repository strictly manages its binary acoustic files using Git Large File Storage (Git LFS) to prevent repository bloat, isolating load-bearing production audio from runtime generated outputs.

### **Git LFS Configuration Rules**

> * **Format Tracking:** Standard Git object tracking is disabled for heavy binary formats; instead, .gitattributes tracks files such as \*.wav, \*.mp3, and \*.flac exclusively through Git LFS.  
> * **Pointer Optimization:** By utilizing LFS, the actual pointers committed to the Git repository tree remain extremely small (approximately 130 bytes), preventing .git/objects from bloating during iterative generative cycles.  
> * **Initialization Setup:** The concrete setup for the repository is executed via the following commands:  
>   `cd goblin-assets-audio`  
>   `git lfs install`  
>   `git lfs track "*.wav" "*.mp3" "*.flac"`  
>   `git add .gitattributes`  
>   `git commit -m "Configure LFS tracking"`

> * **Exclusion of Runtime Data:** The repository is reserved exclusively for source art—master voice reference WAVs, Foley SFX libraries, and music stems. It strictly excludes any generated TTS dialogue or music output, which are classified as transient runtime data rather than source assets.

### **Directory Topology**

The repository employs a rigid, standardized directory tree to separate dynamic scores, transient sound effects, and canonical voice references:

`goblin-assets-audio/`  
`├── .gitattributes                # Git LFS tracking rules for *.wav, *.mp3, *.flac[cite: 1, 4]`  
`├── CHANGELOG.md                  # Dedicated revision log for voice reference changes[cite: 1]`  
`├── references/                   # Clean, load-bearing voice reference audio WAVs[cite: 4]`  
`│   ├── bog_v1.wav                # Explicitly version-tagged source reference[cite: 1]`  
`│   └── spleen_v1.wav             # Explicitly version-tagged source reference[cite: 1]`  
`├── music/                        # Dynamic score stems and recurring leitmotifs[cite: 4]`  
`└── sfx/                          # Foley sound effects library[cite: 4]`

### **Operational Invariants & Versioning Discipline**

> * **Explicit Version Tagging:** Voice reference files within the references/ directory must be explicitly version-tagged (e.g., bog\_v1.wav, never just bog.wav).  
> * **Targeted Configuration:** Downstream services, such as the audio-microservice, are configured to lock onto these specific version-tagged files. This ensures that a well-meaning overwrite or asset update does not silently reshape the vocal timbre of the entire show's cast.  
> * **Changelog Governance:** Any modification to a voice reference file must be explicitly logged with its underlying reasoning in the root CHANGELOG.md. This enforces the exact same strict revision discipline applied to the canonical narrative rules in goblin-bible's revision log.

---

*User prompt: {{FOCUS:  is needs to be abstracted out to support multiple series so callit the series-assets-audio }} /extreme-details*

Response: Adopting **\[series-assets-audio\]** establishes a series-agnostic architectural standard across the production fleet, transforming the acoustic vault from a hardcoded single-show repository into a universally scalable, strongly typed visual API.

Rather than dumping all audio across different shows into a single omnibus monorepo, each creative universe deploys an isolated, parallel repository stack under the **"Quintet" multi-repository topology**. For example, the domestic goblin setting uses goblin-assets-audio, while the Southern Gothic noir setting uses wiregrass-audio.

### **1\. Architectural Mandate & Repository Isolation**

Maintaining dedicated asset repositories per series resolves critical operational and legal bottlenecks:

> * **Git LFS Bandwidth Isolation:** Acoustic repositories store heavy, uncompressed 48 kHz / 24-bit PCM reference WAVs, multi-track dynamic score stems, and dense Foley libraries. Combining universes forces build workers to clone gigabytes of unneeded binary weight, causing network saturation.  
> * **Namespace & Anatomical Collisions:** Structuring repositories per series prevents character naming conflicts (e.g., if both shows have a character named "The Pilot" or "Spleen").  
> * **Independent Series Evolution:** A complete overhaul of character voices in one series updates only that specific project's coordination lockfile (versions.json). The Git history, asset manifests, and compilation pipelines of sibling series remain untouched and completely reproducible.

### **2\. Series-Scoped Directory Topology**

To avoid global namespace collisions and support shared fleet daemons, the audio-microservice multiplexes incoming requests by routing them into strictly partitioned series boundaries defined by the series\_slug:

`[series-assets-audio]/                     # e.g., wiregrass-audio/`  
`├── .gitattributes                         # Git LFS tracking rules[cite: 12]`  
`├── voices/`  
`│   ├── active/`  
`│   │   ├── the_pilot.wav                  # Symlink -> versions/the_pilot_v3.wav[cite: 1]`  
`│   │   └── billie_fae.wav                 # Symlink -> versions/billie_fae_v1.wav[cite: 1]`  
`│   ├── versions/`  
`│   │   ├── the_pilot_v1.wav               # Pinned historical references[cite: 1]`  
`│   │   ├── the_pilot_v2.wav`                 
`│   │   └── the_pilot_v3.wav`                 
`│   ├── lexicon.json                       # Series-specific dialect & phonetics[cite: 1]`  
`│   └── voice_manifest.json                # Cryptographic hashes & engine recipes[cite: 1]`  
`├── music/                                 # Series-specific dynamic score stems[cite: 1]`  
`└── foley/                                 # Series-specific transient SFX[cite: 1]`

> * **The Isolation Invariant:** Voice assets for Series B are never placed in the directory of Series A. If an artist updates an asset, they only touch the relevant series partition, ensuring zero transitive blast radius on other shows.  
> * **Two-Tier Versioning Per Series:** Every story world maintains its own independent /active/ floating pointers and /versions/ append-only historical vault.

### **3\. Multi-Engine Routing & The Audio Recipe Book**

The voice\_manifest.json within each \[series-assets-audio\] repository acts as an immutable Audio Recipe Book, allowing different shows to leverage entirely different neural backend architectures without forcing the studio into a monolithic model:

> * **Dynamic Multiplexing:** When a generation request arrives, the audio-microservice inspects the manifest to route the task. Series A might route to CosyVoice-300M for deep character acting, while Series B routes to Chatterbox or Parler-TTS v0.1 for specific gravelly vocal fry.  
> * **Baseline Acoustic Profiles:** The manifest codifies the generative model checkpoint, the latent conditioning prompt, and series-specific digital signal processing (DSP) offsets (e.g., basePitchShiftSemitones: \-2.0, breathinessMultiplier: 1.40) to lock character timbre permanently.

### **4\. The Phonetic Firewall (lexicon.json)**

Because neural text-to-speech systems mispronounce invented words and proprietary tech jargon, each \[series-assets-audio\] repository enforces its own Grapheme-to-Phoneme (G2P) replacement pass:

> * **Strict Segregation:** A rule mapping the word "siphon" to "SAI-fun" in the goblin universe has zero visibility or effect within the biopunk noir universe.  
> * **Dialect Expansion:** The local daemon uses lexicon.json to enforce regional cadence and phonetic overrides offline (e.g., softening interrogative onsets or standardizing dialect negation).  
> * **Provenance Anchoring:** The lexicon.json is not an unversioned helper file; it is an active dependency node whose SHA-256 hash anchors directly into the voice\_manifest.json and the episode's overarching render\_manifest.json.

### **5\. Talent Licensing & Cross-Series Firewalls (POD-04 / POD-01)**

The multi-series architecture enforces strict legal, contractual, and provenance boundaries around voice identity to prevent unauthorized likeness leakage:

> * **The Quarantine of Likeness:** Cross-series borrowing is **strictly forbidden**. A voice reference cleared for an actor in Series A cannot be used to voice a character in Series B, even as temporary audio. Reusing a voice asset across series boundaries trips a fatal LEGAL\_CLEARANCE\_BREACH during pre-flight linting.  
> * **Contract Scoping:** Every reference voice package committed to \[series-assets-audio\] must contain an unambiguous union-compliant license (e.g., SAG-AFTRA AI Digital Voice Rider) scoped explicitly to the series\_slug and character name. If a generation request specifies a character without verified clearance for that specific series\_id, the microservice halts execution.

---

*User prompt: {{FOCUS:  A. Voice References (voices/voice\_manifest.json) }} /extreme-details*

Response: The voice\_manifest.json file operates as an immutable Audio Recipe Book governing the operational state of the character voice library, tracking active audio references, character identities, and neural model configurations. Because neural text-to-speech models are highly susceptible to latent drift and acoustic degeneration over long production runs, character voices are not treated as standalone audio buffers but are codified within the manifest as an irreducible generative triad.

### **1\. The Epistemological Triad of Voice Identity**

Every character entry inside the manifest requires three explicit baselines to guarantee bit-for-bit reproducibility across years of production:

> * **Model Checkpoint & Engine Adapter:** The manifest explicitly pins the neural speech synthesis model architecture (e.g., Parler-TTS-v0.1-Mini, CosyVoice-300M, Piper-ONNX), its git release tag, and the cryptographic weights digest (weights\_sha256). Coupling the acoustic identity strictly to explicit model hashes prevents "model drift," ensuring upstream vendor updates do not silently alter vocal resonance or cadence.  
> * **Speaker Embedding & Conditioning Target:** This layer defines how the vocoder's latent space is conditioned via the conditioning.strategy field (e.g., ZERO\_SHOT\_CLONE using a 512-dimensional vector, SPEAKER\_ID using an integer, or DESCRIPTION\_PROMPT using natural language). This section binds directly to explicit legal clearance certificates (e.g., SAG-AFTRA digital voice likeness riders) logged by POD-04, guaranteeing verified provenance.  
> * **Baseline DSP Vector:** To establish a character's neutral biological anatomy before emotional modifiers are introduced, the recipe hardcodes physical transformations such as fundamental frequency ( *F*0​ ) transpositions, acoustic tract formant scaling, and pulmonary breathiness.

### **2\. Machine Contract & Technical Invariants**

The voice recipe enforces strict machine validation schemas across its parameters to reject incompatible generations at compile time:

> * **Prosodic Exclusion (banned\_cadences):** A strict array (e.g., \["RAPID\_STACCATO", "RISING\_INFLECTION\_INTERROGATIVE"\]) that prohibits specific delivery styles. If the upstream narrative dictates a delivery style that physically contradicts the character's baseline profile, the microservice intercepts and rejects the payload.  
> * **Acoustic & Dynamics Control (dynamics\_and\_eq):** Declares required master target integrated loudness ( −16.0 LUFS ), true-peak ceilings ( −1.0 dBTP ), and a strict background noise floor limit ( −60.0 dBFS ).  
> * **Phonetic Firewalls (phonetic\_overrides):** Enforces series-specific grapheme-to-phoneme pronunciations by cryptographically binding a local lexicon\_file hash to the character's recipe, ensuring proprietary jargon or dialects are synthesized perfectly.

### **3\. Dynamic Algebraic Composition**

The parameters locked within voice\_manifest.json (base\_dsp\_modifiers) establish the permanent foundation that algebraic modifiers interact with during runtime. When the compilation pipeline injects dynamic scene somatic conditions, they are calculated against the manifest's baselines:

*F*0,eff​\=basePitchShiftSemitones+ΔPitchscene​  
*W*eff​\=formantWarpingFactor×ΔFormantscene​  
Πeff​\=baseBreathiness×pause\_multiplierscene​

By maintaining these base attributes in the manifest, a character with chronic diaphragmatic fatigue (baseBreathiness: 1.80) will retain their signature labored delivery even when elevated threat levels dynamically shift their pitch.

### **4\. DAG Integration & Transitive Blast Radius**

The completed voice recipe functions as a cryptographic node within the studio's overarching Directed Acyclic Graph (DAG). The recipe identity is secured via an HMAC-SHA256 hash that incorporates the engine, model weights, reference file SHA, baseline DSP parameters, and the lexicon hash.

If a sound engineer modifies an actor's pitch modifier within voice\_manifest.json, the DAG computes a topological blast radius audit. The compiler sweeps the dialogue\_ast.json, flagging only the specific lines spoken by the modified character as dirty (is\_dirty \= 1\) for re-synthesis, while all unaffected character stems and background ambient beds remain completely untouched.

---

*User prompt: {{FOCUS:  B. Foley Registry (foley/registry.json) }} /extreme-details*

Response: The foley/registry.json operates as a programmatic, dual-output dictionary that decouples Foley sound design from manual Digital Audio Workstation (DAW) placement, automating acoustic assembly directly from the narrative script.

By binding physical interactions to deterministic execution logic, the registry ensures that audio artifacts remain mathematically reproducible across distributed rendering nodes.

### **1\. Dual-Output Lexical Mapping**

Rather than relying on audio engineers to manually sync sounds, the compilation engine parses concrete physical nouns from the dialogue\_ast.json action cues and narrative production notes. The registry maps these semantic keys (e.g., ITEM\_SIPHON, TERRAIN\_SWAMP) to two synchronized outputs simultaneously: a visual plate prompt (e.g., "corroded brass tube") and a localized .wav sample path (e.g., foley/metal\_siphon\_scrape\_02.wav). This guarantees absolute parity between the generated visual item and its acoustic footprint.

### **2\. Temporal Snapping & Priority**

Within Remotion's composition tree, spot Foley transients reside on Track 2 as medium-priority synchronized events. Cues are distributed across a shot's lifecycle rather than clumped together: the initial trigger fires during a calculated pre-roll window, while subsequent physical impacts snap precisely to action hold-frames or the impact phase (Triad Phase B) of an animation cycle.

### **3\. Deterministic PRNG Seeding (Mulberry32)**

Standard non-deterministic functions like Math.random() are strictly banned in the pipeline because Remotion evaluates frame chunks concurrently across isolated headless browser workers; native randomness would cause catastrophic audio drift. Instead, variant selection from sample pools is driven by a deterministic Mulberry32 pseudorandom number generator.

The PRNG initializes using a compound 32-bit MurmurHash3 seed key derived from the scene's exact metadata: *Seed*\=*MurmurHash*3(*sceneId*\+":"+*shotId*\+":"+*sampleKey*).

### **4\. Anti-Clustering Salts**

To prevent mechanical repetition without sacrificing determinism, the engine tracks variant lineage. If the PRNG draws the exact same audio variant (e.g., footstep\_mud\_04.wav) used in the immediately preceding beat or shot, an anti-clustering salt (:retry or \${seed}:retry) is automatically appended to the seed hash. This forces a deterministic re-roll to select an alternative take, ensuring acoustic variety.

### **5\. Compile-Time Source Baking**

Foley variant resolution executes exclusively at generation time via generate-episode-repo.ts, never at runtime. Once the Mulberry32 PRNG determines the variant, the exact file path is written as a static literal string directly into the generated TSX component properties (e.g., \<Audio audio/foley/boot\_squelch\_02.wav")}" src="{staticFile("/\>).

Baking the result directly into the codebase completely eliminates runtime PRNG evaluation, making distributed worker concurrency utterly irrelevant to acoustic reproducibility.

---

*User prompt: {{FOCUS:  1\. The Epistemological Triad of Voice Identity }} /extreme-details*

Response: The Epistemological Triad of Voice Identity formalizes the strict boundary between abstract narrative intent and physical sound synthesis within the studio's architecture. It serves as the physical acoustic realization of the system's governing epistemological law: WorldTruth=InternalBelief=ExternalUtterance.

Because neural vocoders and autoregressive audio models are highly susceptible to non-deterministic latent drift and regression toward the statistical median of their training data (a degradation termed "The Beige Plague"), a character’s voice cannot be defined by a standalone .wav buffer, an unversioned speaker tag, or a generic prompt. Furthermore, synthesized voice tracks are classified as **Class 3 Archive-Dependent Evidence**; they rely on non-deterministic floating-point math across disparate hardware kernels and cannot be deterministically regenerated bit-for-bit from prompt seeds alone. Therefore, vocal identity is codified as an irreducible tripartite contract that translates character embodiment and biological trauma into uncompressed 48 kHz linear PCM waveforms.

### **1\. Model Checkpoint & Engine Adapter**

The first pillar defines the specific computational tensor engine responsible for converting phoneme representations into acoustic samples.

> * **The Engine Architecture & Weights Lock:** Coupling acoustic identity strictly to proprietary cloud APIs (e.g., ElevenLabs) or unpinned open weights introduces silent breaking changes when upstream providers update vocoder weights, which alters formant registers and micro-cadence without notice. The triad requires an explicit engine runtime enum (e.g., PIPER\_ONNX, COSYVOICE, PARLER\_TTS) and a cryptographic model digest (weights\_sha256) to guarantee synthesis executes against identical neural tensor weights indefinitely.  
> * **Execution Target & Hardware Quarantine:** The execution graph hash and quantization variants (INT8, FP16, FP32, ONNX) are explicitly declared. To prevent CUDA memory fragmentation on the visual rendering nodes, audio microservices execute strictly on pure CPU and system RAM, with dedicated GPU VRAM allocation clamped to 0 MB.

### **2\. Speaker Embedding & Conditioning Token**

The second pillar anchors the individual character identity within the engine's latent space, bridging performer casting, legal rights clearance, and mathematical conditioning mechanics.

> * **Conditioning Modalities:** The triad pins the exact conditioning token to prevent vocoder interpolation errors. Depending on the engine, this token manifests as a zero-shot acoustic reference clone (a pinned studio-recorded .wav file), a discrete speaker integer ID, a continuous natural language description prompt, or a precomputed synthetic latent vector (.pt).  
> * **Institutional Clearance Firewall:** The token binds directly to legal clearance certificates (e.g., performer\_consent\_id tracking SAG-AFTRA digital voice likeness riders) established by the Talent & Casting Pod (POD-04). Downstream systems are structurally forbidden from reinterpreting this scope.  
> * **The Locked Voice Invariant:** The architecture enforces a core boundary value of "locked voice consistency over per-scene optimization". Engineers are strictly prohibited from dynamically altering speaker reference takes, swapping embedding seeds, or revising conditioning prompts on a per-scene basis to chase localized aesthetic improvements.

### **3\. Baseline Digital Signal Processing (DSP) Vector**

The third pillar specifies the baseline physical transformations applied to the character's vocal tract and respiratory system in a neutral state, before any scene-specific dramatic trauma is introduced.

> * **Anatomical Geometry Initialization:** Raw neural vocoder output is frequently anatomically generic or prone to high-frequency digital sibilance. The triad hardcodes neutral biological baseline attributes, including fundamental frequency transposition (*F*0​), acoustic tract formant scaling (*W*), default conversational velocity (speedScalar), baseline diaphragmatic breathiness (Π), and subharmonic glottal pulse density (Φ).  
> * **Acoustic Fencing:** The vector declares strict pre-conform infrasonic rumble filter frequencies, sibilance attenuation band centers, and prosodic exclusion arrays (banned\_cadences) that intercept and reject incompatible emotional deliveries at compile time.  
> * **Algebraic Somatic Composition:** When a scene requires a dramatic transformation (e.g., physical agony or exhaustion), the transformation occurs strictly via algebraic composition where runtime DSP deltas derived from the canon ledger are applied against this fixed baseline vector.

### **Provenance Linkage & The Acoustic Redaction Test**

The completed voice recipe functions as a cryptographic node within the studio's overarching Directed Acyclic Graph (DAG). Modifying any parameter inside the triad triggers an HMAC-SHA256 recalculation (*H*recipe​) and a topological blast radius audit that flags only the specific lines spoken by the modified character for re-synthesis.

To certify that the generated triad successfully establishes a unique identity, candidates must pass the **Acoustic Redaction Battery**. Synthesized audio stems are pitch-shifted and normalized to entirely flatten superficial vocal timbre. An auditor evaluates the remaining structural elements—prosody, pause frequency distributions, consonant-attack velocities, and duration-per-syllable metrics—to confirm the character's cadential rhythm remains mathematically distinct and identifiable even in complete acoustic darkness.

---

*User prompt: {{FOCUS:  2\. Machine Contract & Technical Invariants }} /extreme-details*

Response: The Machine Contract governs the audio-microservice as a rigid, deterministic firewall between upstream narrative generation and downstream acoustic rendering. Because generative text-to-speech (TTS) models are untrusted rendering workers, their execution is tightly bound by machine-validated schemas, somatic capacity gates, and explicit payload definitions that reject impossible or unauthorized audio synthesis at *T*0​ (\$0.00 compute cost).

### **1\. The Ingress Payload Contract (TTSGenerationRequest)**

The audio-microservice receives per-line dialogue requests from the worker-sower-conductor over HTTP POST at \[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate). This payload explicitly defines the execution parameters for a single spoken line:

> * **Verbatim String Enforcement:** The text field contains the exact phonetic string to be synthesized. Downstream neural models perform zero generative text iteration; they are strictly forbidden from hallucinating or altering the locked strings emitted by dialogue\_ast.json.  
> * **Somatic DSP Translation:** Narrative physical trauma from the canonical ledger is injected directly into the dsp\_modifiers object. If a character suffers respiratory damage, the payload includes modifiers like pause\_frequency\_multiplier: 1.4 and breathinessPauseMultiplier: 2.2, forcing the vocoder to elongate breath intervals and compress speech cadence dynamically.  
> * **Pacing & Pitch Bounds:** Structural Zod schemas (DSPModifiersSchema) strictly clamp incoming modifiers: basePitchShiftSemitones is bounded between −12.0 and 12.0, and formantWarpingFactor is constrained between 0.5 and 2.0.

### **2\. Pre-Flight Verification & Vocal-Motor Feasibility**

Before the pipeline opens a network socket to dispatch the HTTP POST request, the AST must pass a series of deterministic compile-time linters:

> * **Verbatim Parity Gate (assertVerbatimParity):** The compiler asserts character-for-character equality between the human-readable screenplay prose (.fountain) and the machine AST dialogue\_text string. If an editor alters dialogue in the script without re-compiling the AST, the pipeline halts immediately, preventing audio-to-script drift.  
> * **The Vocal-Motor Hearsay Feasibility Theorem:** The compiler mathematically evaluates physical capability before speech synthesis is permitted:  
>   *c*.has\_verbal\_directives⟹"mute"∈/*c*.conditions∧"speak"∈/*c*.banned\_kinetic\_verbs  
>   If an entity with a crushed larynx or severed trachea is assigned dialogue, the invariant engine intercepts the transaction and throws a fatal VOCAL\_DELIVERY\_BREACH, preventing invalid audio from burning GPU/CPU cycles.

### **3\. The Voice Recipe Specification Schema (voice\_manifest.json)**

The biological baseline of every character is locked within an explicit, machine-validated JSON schema (\[https://specs.studio.internal/schemas/v2/voice\_recipe.json\](https://specs.studio.internal/schemas/v2/voice\_recipe.json)), decoupling inherent anatomy from temporary emotional modifiers.

> * **checkpoint Configuration:** explicitly declares the tts\_engine (e.g., CosyVoice-300M), locks the weights\_sha256 cryptographic digest, and dictates the tensor quantization variant (e.g., FP16 or INT8). This guarantees synthesis executes against identical neural weights across years of production, completely eliminating silent upstream vendor "model drift".  
> * **conditioning.strategy:** Directs how the multiplexer maps identity into the neural latent space. ZERO\_SHOT\_CLONE exacts a 512-dimensional speaker vector from a cryptographically pinned reference\_sha256 .wav file, whereas DESCRIPTION\_PROMPT utilizes a fixed natural language parameter (e.g., *"A raspy, middle-aged man speaking slowly..."*).  
> * **base\_dsp\_modifiers:** Establishes the neutral anatomical geometry of the character before scene trauma is introduced, specifying constants like basePitchShiftSemitones, formantWarpingFactor, and baseBreathiness.  
> * **dynamics\_and\_eq:** Defines mandatory acoustic filtering targets, including the exact high-pass cutoff frequencies (e.g., 90.0 Hz), optical de-esser thresholds, integrated LUFS targets (-16.0), and strict noise floor ceilings (-60.0 dBFS).

### **4\. Semantic Filtering & Phonetic Firewalls**

> * **Prosodic Exclusion (banned\_cadences):** The voice schema enforces negative arrays of prohibited vocal deliveries. If the upstream AST instructs an exhausted or lung-damaged character to speak with "RAPID\_STACCATO", the multiplexer intercepts the directive and rejects the payload at compile time for violating the character's physical baseline.  
> * **Deterministic Phonetic Firewalls (lexicon.schema.json):** Located at voices/\<series\_slug\>/lexicon.json, the phonetic dictionary intercepts verified verbatim text and executes a deterministic, two-stage grapheme-to-phoneme normalization pass via strict regex replacements and custom stress expansions. This ensures that proprietary world jargon and regional dialects are synthesized flawlessly without relying on the vocoder's internal, non-deterministic pronunciation guessing.

---

*User prompt: {{FOCUS:  2\. Speaker Embedding & Conditioning Token }} /extreme-details*

Response: The **Speaker Embedding & Conditioning Token** forms the second pillar of the Canonical Vocal Identity Triad, functioning to anchor an individual character's acoustic identity within a neural engine's latent space. This component bridges physical performer casting, strict legal rights clearance, and mathematical conditioning mechanics into an immutable profile.

The character conditioning profile relies on specific metadata schema attributes: a conditioning strategy, a reference\_audio\_path (for pinned .wav takes), a reference\_sha256 cryptographic hash, a speaker\_embedding\_tensor cache path, a latent\_description\_prompt, and a performer\_consent\_id for union licensing.

The audio-microservice multiplexes across four discrete conditioning modalities via a polymorphic dispatch engine, each carrying specific mathematical, hardware, and legal clearance invariants.

### **1\. Zero-Shot Acoustic Reference Cloning (ZERO\_SHOT\_CLONE)**

This modality derives vocal timbre, formant resonance, and glottal behaviors directly from a physical, studio-recorded audio reference stem, primarily utilizing engines like CosyVoice-300M and XTTSv2.

> * **Mathematical Latent Extraction:** The microservice passes the reference waveform *x*ref​(*t*) through a convolutional and transformer-based speaker recognition backbone (e.g., ECAPA-TDNN or CAMPPlus) to generate frame representations: hframe​\=Encoder(*x*ref​(*t*)). Temporal pooling converts this into a fixed-length identity representation: *E*ref​\=AttentiveStatisticsPooling(hframe​)∈R*D*, where *D*\=512 or 1024\. This vector is projected via cross-attention into the diffusion flow-matching prior: *vt*​\=v*θ*​(*zt*​,*t*,TextTokens,*E*ref​).  
> * **Two-Tier Caching Architecture:** To prevent the 150 ms to 350 ms CPU overhead per dialogue line required for latent extraction, the computed embedding tensor is serialized to disk at voices/\<series\_slug\>/embeddings/\<character\>\_v\<N\>.pt. At runtime, the server compares the SHA-256 digest of the .wav file against the .pt file's metadata header; if a mismatch occurs, the cache is discarded and re-extracted.  
> * **Legal Clearance Invariant:** This modality requires a mandatory SAG-AFTRA Digital Voice Likeness Rider paired with a pinned performer ID. It dictates strict series exclusivity and tracks per-minute royalty calculations in the ledger.  
> * **Cryptographic Anchoring:** When synthesized, the stem record logs the exact SHA-256 hash of the input reference .wav file.

### **2\. Discrete Speaker Integer IDs (SPEAKER\_ID)**

This modality bypasses external audio files entirely by addressing fixed, pre-trained speaker identity projections encoded directly inside multi-speaker neural weight matrices, operating on pure multi-thread CPU with less than 80 MB of RAM.

> * **Lookup Mechanics:** In a multi-speaker VITS/Piper architecture, the model contains an internalized linear projection layer *W*spk​∈R*K*×*D*, where *K* is the number of trained speakers and *D* is the hidden latent dimension (typically 256 or 512).  
> * **Latent Injection:** During inference, the engine performs an instantaneous *O*(1) tensor slice: *e*speaker​\=*W*spk​\[speaker\_id\]. This discrete vector conditions the text encoder outputs and the stochastic duration predictor: *μz*​,*σz*​\=PriorEncoder(Phonemes,*e*speaker​).  
> * **Legal Clearance Invariant:** Operates under Checkpoint License Verification, asserting commercial runtime clearance of the base ONNX weights (e.g., MIT, Apache 2.0).  
> * **Cryptographic Anchoring:** The provenance ledger logs the exact integer ID and the ONNX model graph digest.

### **3\. Natural Language Latent Descriptions (DESCRIPTION\_PROMPT)**

Utilized by autoregressive transformers like Parler-TTS, this modality Abandons numerical embeddings in favor of structured, natural language prompt vectors specifying speaker traits, room acoustics, and delivery.

> * **Cross-Attention Mechanics:** A frozen text encoder projects the descriptive text conditioning tokens *C*\=\[*c*1​,*c*2​,…,*cL*​\] into a hidden representation: Hdesc​\=TextEncoder(*C*)∈R*L*×*D*model​.  
> * **Decoder Alignment:** The audio tokens attend to Hdesc​ via multi-head cross-attention within each decoder layer: Attention(*Q*,*K*,*V*)=softmax(*dk*​​*QWQ*​(Hdesc​*WK*​)*T*​)(Hdesc​*WV*​).  
> * **Legal Clearance Invariant:** Operates under a Non-Biometric Text Copyright Shield, which validates that description tokens do not cite living performers (e.g., "sounds like Actor X").  
> * **Cryptographic Anchoring:** The pipeline logs the canonicalized text prompt string and its HMAC token into the ledger.

### **4\. Precomputed Synthetic Latent Vectors (SPEAKER\_VECTOR)**

This modality decouples voice conditioning from human text parsing and physical reference .wav files by directly injecting mathematically defined tensor arrays into the hidden layers of compact neural vocoders like Kokoro-82M.

> * **Direct Vector Injection:** Speech is conditioned via a style vector *S*∈R128 that is loaded directly into system memory as a finalized, normalized floating-point array, completely skipping extraction networks.  
> * **Synthetic Construction:** Vectors can be mathematically generated by computing linear combinations of disparate voice vectors across the acoustic latent manifold: *S*composite​\=*αSA*​\+*βSB*​\+(1−*α*−*β*)*SC*​.  
> * **Legal Clearance Invariant:** Requires Synthetic Identity Certification, which mathematically asserts a synthetic origin and verifies zero biometric overlap with living talent pools.  
> * **Cryptographic Anchoring:** The stem record logs the exact binary hash of the .pt tensor.

### **Institutional Clearance Firewalls & Governance Boundaries**

The conditioning token acts as a strict legal firewall governed by the Talent & Casting Pod (POD-04) and Legal & Provenance Pod (POD-01).

> * **Downstream Reinterpretation Prohibition:** Every reference voice package is paired with a clear statement of permitted use boundaries. Downstream pods (Audio, Localization, Assembly) are structurally forbidden from altering or expanding this licensing scope.  
> * **Cross-Series Likeness Quarantine:** A zero-shot voice embedding cleared for English episodic synthesis in Series A cannot be used as temporary audio in Series B, nor can it be deployed for localized foreign-language dubbing without an executed contract addendum. Attempting cross-series synthesis trips a fatal LEGAL\_CLEARANCE\_BREACH during pre-flight linting.  
> * **The Locked Voice Invariant:** The architecture enforces "locked voice consistency over per-scene optimization". The audio-microservice must reuse approved reference tokens across all scenes, explicitly prohibiting audio engineers from dynamically altering speaker reference takes, swapping embedding seeds, or revising conditioning prompts on a per-scene basis to chase localized aesthetic improvements.  
> * **C2PA Manifest Sealing:** All captured cryptographic signatures from the chosen modality are baked into render\_manifest.json and attached to the C2PA digital asset certification envelope, ensuring that any rendered audio second can be traced to the exact conditioning rules that governed its physical generation.

---

*User prompt: {{FOCUS:  3\. Dynamic Algebraic Composition }} /extreme-details*

### **Response: 1\. The Algebraic Composition Channel**

The digital signal processing (DSP) parameters governing speech synthesis do not exist as static presets; they are calculated per-line via an algebraic composition channel. Every incoming TTSGenerationRequest dispatched to the audio-microservice merges two independent parameter spaces:

> * **The Baseline Voice Recipe:** The character’s neutral biological profile, declared in voice\_manifest.json, establishing their foundational anatomy (e.g., basePitchShiftSemitones, formantWarpingFactor, baseBreathiness, speedScalar, and baseVocalFry).  
> * **Dynamic Scene Ingress:** The scene-specific somatic modifiers (ΔPitchscene​, ΔFormantscene​, tonePacingscene​, pause\_multiplierscene​, and ΔFryscene​) derived at runtime from narrative condition flags and pressure meters.

### **2\. Mathematical Composition Formulas**

The audio-microservice evaluates the effective runtime DSP vector by algebraically summing or multiplying the scene deltas against the neutral baseline:

> 1. **Effective Pitch (*F*0, eff​):** Additive signed semitone transposition that alters fundamental pitch without changing temporal duration:  
>    *F*0, eff​\=basePitchShiftSemitones+ΔPitchscene​  
> 2. **Effective Formant Warping (*W*eff​):** Multiplicative vocal tract scaling where values \<1.0 emulate a collapsed cavity and \>1.0 compress the perceived pharynx:  
>    *W*eff​\=formantWarpingFactor×ΔFormantscene​  
> 3. **Effective Pacing Velocity (*P*eff​):** Compounded speaking rate scalar determining conversational speed:  
>    *P*eff​\=speedScalar×tonePacingscene​  
> 4. **Effective Inter-Clause Pause Factor (Πeff​):** Compounded breath interval dilation representing pulmonary exhaustion:  
>    Πeff​\=baseBreathiness×pause\_frequency\_multiplierscene​  
> 5. **Effective Vocal Fry Density (Φeff​):** Clamped injection of aperiodic, low-frequency subharmonic glottal rattle:  
>    Φeff​\=clamp(baseVocalFry+ΔFryscene​,0.0,1.0)

### **3\. Unified Pressure Meter Transfer Functions**

Dynamic scene modifiers are driven by the simulation's Unified Pressure Meter Engine, which tracks active trauma and psychological stress as integer basis points (0 to 10,000 bp) in the canonical ledger. As basis points accumulate, transfer functions reshape the acoustic output:

> * **Pacing Velocity (*P*eff​):** Compresses the dialogue rate as physical exhaustion mounts:  
>   *P*eff​\=speedScalarbase​×(1.0−0.30×(10,000SOMATIC\_FATIGUE​))  
> * **Breath Interval Dilation (Πeff​):** Dilates pause frequency to emulate breath starvation via a quadratic curve, ensuring normal breathing until fatigue crosses 6,000 bp, after which intervals expand rapidly:  
>   Πeff​\=baseBreathiness×(1.0+1.40×(10,000SOMATIC\_FATIGUE​)2)  
> * **Fundamental Frequency Tremor (Δ*F*0​):** Acute physical pain injects upward pitch spikes, while heavy somatic exhaustion drags pitch into a low-register drone:  
>   Δ*F*0​\=(\+3.5×10,000PHYSICAL\_PAIN​)\+(−2.0×10,000SOMATIC\_FATIGUE​)  
> * **Subharmonic Vocal Fry (Φeff​):** Driven simultaneously by physical depletion and pain, injecting rattle at line tails:  
>   Φeff​\=clamp(baseVocalFry+0.50(10,000SOMATIC\_FATIGUE​)\+0.40(10,000PHYSICAL\_PAIN​),0.0,1.0)

### **4\. The Somatic-to-Acoustic Translation Matrix**

Specific biological traumas logged in the ledger map to distinct combinations of these DSP parameters, warping the final waveform:

> * **Stage-1 Pulmonary Fibrosis / Gas Damage:** Injects breathinessPauseMultiplier: 2.2 and pause\_frequency\_multiplier: 1.4. This strictly caps the maximum spoken phrase length, forcing the vocoder to terminate sentences prematurely on hard consonants and inject breathless micro-silences between dependent clauses.  
> * **Severe Hypothermia / Physiological Shock:** Injects basePitchShiftSemitones: \+2.5 and vocalFryDensity: 0.8. Autonomic panic and shivering elevate the fundamental pitch, while the high fry density introduces glottal instability and high-frequency flutter into sustained vowels.  
> * **Crushed Laryngeal Cartilage:** Injects formantWarpingFactor: 0.7 and basePitchShiftSemitones: \-4.0. Structural collapse of the larynx constricts the pharyngeal resonating chamber, creating severe formant scooping and deep pharyngeal damping that results in a hollow, muffled delivery.  
> * **Spinal Vertebral Compression & Neuropathy:** Injects speed\_multiplier: 0.90, basePitchShiftSemitones: \-1.5, and pause\_frequency\_multiplier: 1.4. Bracing against L4-L5 spinal pain slows conversational tempo by 10%, forces the pitch downward, and dilates pauses by 40%, dragging syllables out.

### **5\. Master Timeline Expansion Impact**

Because audio dictates the physical timing of the pipeline, dynamic somatic parameter composition directly alters the visual cut length of a shot.

> * When elevated SOMATIC\_FATIGUE basis points artificially inflate the pause\_frequency\_multiplier, the physical audio file duration (*D*ms​) generated by the vocoder expands significantly.  
> * An 8-word line that takes 2,100 ms (51 frames) at a resting baseline will stretch to 3,850 ms (93 frames) when somatic fatigue reaches 8,500 bp.  
> * The ffprobe service extracts this expanded duration directly from the .wav header and recalculates the discrete 24 fps frame budget (⌈(3850/1000)×24⌉=93 frames), ensuring the video diffusion plate inherently accommodates the physically labored, breath-starved delivery.

---

*User prompt: {{FOCUS:  4\. DAG Integration & Transitive Blast Radius }} /extreme-details*

Response: The Generative Production Pipeline models narrative reality and media generation as an immutable Directed Acyclic Graph (DAG) governed by the "Generative Production Pipeline" documentation. Rather than treating scenes as isolated media assets, the architecture maps upstream human intent down to rendered master pixels through cryptographic dependency linking, enabling exact invalidation sweeps when canonical facts or source art mutate.

### **1\. The Universal Provenance Root (render\_manifest.json)**

Every delivered media artifact acts as a terminal leaf in the DAG, irrevocably bound to an immutable JSON sidecar manifest (render\_manifest.json) stored in content-addressed storage (CAS). This manifest seals the precise conditions of the artifact's birth:

> * **The Build Tuple Hash:** The identity of the episode is anchored by a master checksum: Build ID=H(Canon Root+Ledger State+AST+Assets+Container Digest+Toolchains).  
> * **Explicit Parentage Lineage:** Every node declares its cryptographic parents. The final Episode\_XXX.tsx assembly depends on the exposure\_sheet.json hash, the dialogue\_ast.json hash, visual asset tree tags, and container runtime digests.  
> * **Decoded Media Equivalence:** A double-render audit validates pipeline determinism. Rendered outputs are decoded into raw pixel matrices and linear PCM buffers to mathematically assert zero variance: SSIM=1.0,Δ*E*max​\=0.0. If passing, the double\_render\_status is marked BIT\_IDENTICAL.  
> * **Broker Signatures & C2PA Injection:** The manifest is signed via ECDSA by the authorized execution node's private key (broker\_signature: MEQCID7f...). This provenance record is injected directly into the final MP4 container using C2PA standards, creating an unbroken cryptographic link from the screen pixels back to the authorizing Git commits in 000.goblin-lore.

### **2\. Topological Blast Radius Calculation (*R*blast​)**

When a showrunner patches a canonical fact upstream (e.g., retroactively altering Bog's canonical trauma), the DAG walks forward to compute the transitive invalidation cascade. To avoid hiding systemic liabilities, the Edge-Director executes a recursive Common Table Expression (CTE) query in SQLite/Cloudflare D1 to calculate the "True Economic Blast Radius".

The pipeline quantifies this via the **Transitive Invalidation Blast Radius** formula:

*R*blast​(*v*)=*n*∣I(*v*)∣​

Where I(*v*) represents the set of all entities reachable via reverse dependency edges from node *v*.

Entities are classified into a Centrality Audit Taxonomy based on their in-degree (*k*in​) and reachability:

> * **Dead Lore (*k*in​≤1):** Unreferenced background data targeted for pruning.  
> * **Satellite Asset (2≤*k*in​≤4):** Holds localized dramatic context.  
> * **Balanced Hub (5≤*k*in​\<Spine):** A stable recurring anchor.  
> * **Monolithic Spine / Critical Invalidation Hazard:** If *R*blast​(*v*)\>0.40 (the max\_transitive\_blast\_radius\_ratio), modifying the entity triggers a rebuild cascading through more than 40% of the entire story bible. Mutations at this level require human authorization and halt standard compilation.

### **3\. Asymmetric MEU Repair (Surgical Remediation)**

When a scene is marked dirty (is\_dirty \= 1), discarding the entire script triggers unconstrained, non-deterministic drift (where fixing one line breaks three others). Instead, the compiler deploys **Asymmetric Minimal Enclosing Unit (MEU) Repair**:

> * **Backward Prerequisite Closure:** Scans upward from the invalidation target, freezing historical preconditions (e.g., active prop custody) as immutable context.  
> * **Forward Dependent Expansion:** Scans downward, expanding the repair boundary *only* if an entity introduced or patched in the new text is explicitly referenced by subsequent lines.  
> * **The 40% Ceiling:** If the forward dependency expansion requires mutating more than 40% of the total scene text, the surgical infill aborts and escalates the ticket to a human Scene Architect.

### **4\. The 4*n*\+1 GPU Compute Firewall**

The DAG natively isolates expensive graphical compute from lightweight acoustic revisions. If an Audio Recipe's hashing parameter (*H*recipe​) mutates (e.g., tightening a character's pacing scalar), only the dialogue lines mapped to that character are invalidated for re-synthesis.

> 1. **Temporal Re-Measurement:** The new .wav stems are measured via ffprobe (*D*ms, new​).  
> 2. **Frame Re-Quantization:** The exposure sheet integer budget is re-derived: target\_framesnew​\=⌈(1000*D*ms, new​​)×24⌉.  
> 3. **Lattice Firewall Check:** Video diffusion models on Rig 2 run on a 3D causal VAE temporal downsampling lattice (4*n*\+1 frames, e.g., 77 native frames). If the new audio frame budget remains strictly less than or equal to the existing cached diffusion plate (target\_framesnew​≤framesplate​), the compiler bypasses the GPU entirely. Remotion simply trims the newly excess tail slack during optical assembly (e.g., 77−69=8 frames trimmed).

### **5\. The Cascading Economic Cost Cliff**

To minimize waste, the DAG structures execution across cost horizons (T0 to T5), halting invalid states as early as possible:

> * **Phase *T*0​ (Drafting):** Linter checks, verbatim parity assertion, and schema validation execute before any sockets open. Cost: **\$0.00**.  
> * **Phase *T*1​ \- *T*4​ (Execution):** CPU dialogue extraction (*T*1​) cascades into local GPU TTS synthesis (*T*2​), heavy VRAM video diffusion (*T*3​), and finally CPU/Memory optical composition (*T*4​).  
> * **Post-Render Escapes:** If a contradiction bypasses the system and forces a post-render retcon, the edge-director computes the incident's cumulative financial impact: Total Incident Cost=Δ*C*root​\+∑*d*∈Downstream​Δ*Cd*​⋅1{*d* is rendered}​\+Morale Overhead. Because the DAG structure is evaluated in *O*(*E*) time within SQLite, this economic analysis returns in under 2 milliseconds.

---

*User prompt: {{FOCUS:  1\. Dual-Output Lexical Mapping }} /extreme-details*

Response: The Dual-Output Lexical Mapping system decouples Foley sound design from manual alignment by compiling audio events directly from screenplay action cues and immutable frame timestamps. Rather than treating sound effects and visual props as disparate assets, the architecture unifies them into a single executable contract.

> * **Lexical Parsing:** The compilation engine parses the narrative script's Abstract Syntax Tree (AST), scanning sound production notes and action lines for concrete physical nouns, such as "siphon", "boot", or "canvas".  
> * **The Dual-Output Dictionary (FOLEY\_REGISTRY):** These extracted semantic keys (e.g., ITEM\_SIPHON, TERRAIN\_SWAMP, ITEM\_SILVER\_SPOON) are resolved against a centralized registry. This registry maps the narrative noun simultaneously to two synchronized pipeline outputs:  
  * **Visual Plate Prompt:** A descriptive textual token used for video diffusion (e.g., "corroded brass tube", "bent tea spoon", or "opaque mud sludge").  
  * **Audio Stem Path:** The exact local .wav sample path within the asset repository (e.g., foley/metal\_siphon\_scrape\_02.wav, foley/metal\_spoon\_clink\_01.wav, or foley/mud\_boot\_squelch\_02.wav).  
> * **Sensory Parity & Single Source of Truth:** By unifying these modalities, the pipeline guarantees absolute parity between the generated visual item and its acoustic footprint. If an author updates a physical entity in the world dictionary, the system automatically updates both the visual prompt and the corresponding Foley resolution simultaneously, eliminating sensory desynchronization.  
> * **Fallback Handling:** If a parsed semantic label lacks a specific audio match in the AST, the registry utilizes a fallback dictionary mapping (e.g., default: 'sfx/room\_tone\_subtle.wav') to ensure continuous playback without crashing the component.

---

*User prompt: {{FOCUS:  2\. Temporal Snapping & Priority }} /extreme-details*

Response: Spot Foley operates as a synchronized, medium-priority acoustic layer within the Remotion composition tree, decoupling sound design from manual DAW placement by programmatically snapping events to deterministic frame timestamps.

> * **Track 2 (Medium Priority) Allocation:** Foley resides on Track 2 within the pipeline's three-tier acoustic topology. It operates below the high-priority master pacing clocks of Track 1 (Dialogue Stems), but above the low-priority, dynamically ducked continuous beds of Track 3 (Ambient).  
> * **Temporal Snapping & Impact Holds:** Punctual sound effects, such as weapon draws or footsteps, are pinned to explicit integer frame offsets parsed directly from narrative AST cues. These impacts are snapped strictly to visual action hold-frames, pre-roll intervals, or the "Phase B (Action/Impact)" window of a character's kinetic cycle.  
> * **Trigger Offset Windows:** Foley triggers are mathematically dispersed across a shot's lifecycle to prevent audio clumping. The initial cue typically fires during a calculated pre-roll window, utilizing the formula Math.floor(preRoll / 2). Subsequent effects are triggered rhythmically during active dialogue windows using offsets such as preRoll \+ (cueIndex \* 18).  
> * **Component Mounting & Playback Constraints:** Transients are mounted directly into the timeline using Remotion's \<Sequence\> and \<Audio\> React primitives. To ensure clean transients without unnatural overlapping decays, Foley playback is capped with a standard durationInFrames={72} (a 3-second maximum limit).  
> * **Spectral Separation & Spatial Panning:** Spot Foley transients are deployed as hard-panned spatial stereo impacts. To eliminate the need for manual, per-shot EQ adjustments, Foley transients are explicitly mixed to occupy upper-mid frequencies, keeping them spectrally isolated from ambient sound beds which are restricted to frequencies below 250 Hz.

---

*User prompt: {{FOCUS:  3\. Deterministic PRNG Seeding (Mulberry32) }} /extreme-details*

> Response:

> * **The Multi-Thread Randomness Bug:** Standard JavaScript Math.random() is strictly forbidden within the pipeline. Because Remotion renders frame chunks concurrently across isolated headless browser workers, native randomness causes catastrophic non-determinism, leading to audio drift, mismatched samples between frames, and divergent sequential exports.  
> * **Compound Seed Key Design:** To prevent cascading randomness—where inserting an upstream cue alters the outcome of every subsequent draw—the system derives seeds from semantic identity rather than sequential execution order. The seed key combines the scene, timing, and lexical dictionary key (e.g., sceneId:shotId:sampleKey or SC-12:T2:ITEM\_ADHESIVE). This ensures that modifying an unrelated sentence upstream does not alter the seed key for a localized Foley cue.  
> * **MurmurHash3 Conversion:** The composite string is digested into a 32-bit integer seed via a MurmurHash3 function. For example, the narrative cue "ep040:shot\_02:boot\_step" yields the explicit hash seed 0x9e3779b9.  
> * **Mulberry32 Mathematical Execution:** The 32-bit integer is fed into a deterministic Mulberry32 pseudo-random number generator shared via components/foley-utils.ts. The PRNG advances the seed by 0x6d2b79f5 and applies strict bitwise operations: t \= Math.imul(t ^ (t \>\>\> 15), t | 1\) followed by t ^= t \+ Math.imul(t ^ (t \>\>\> 7), t | 61). It ultimately returns a float in the range \[0,1) via the calculation ((t ^ (t \>\>\> 14)) \>\>\> 0\) / 4294967296\.  
> * **Variant Pool Selection:** The specific audio variant index is extracted from the sample pool using the formula: ⌊Mulberry32(Seed)×Pool.length⌋.  
> * **Generation-Time Source Baking:** PRNG evaluation executes exclusively at generation time (e.g., during the Node.js Agent Pass or via generate-episode-repo.ts), completely decoupling variant resolution from render-time execution. The resolved sample path is written directly into the generated SceneAudioBed manifest or TSX props as a static string literal (e.g., src={staticFile("audio/foley/metal\_scrape\_02.wav")}). By feeding headless Remotion rendering workers static strings, rendering thread concurrency becomes entirely irrelevant to acoustic reproducibility.

---

*User prompt: {{FOCUS:  C. Continuous Beds & Score (music/) }} /extreme-details*

Response: Continuous sound beds and musical scores operate on Track 3 as the low-priority acoustic foundation within the Remotion component tree. Unlike visual plates that cut cleanly on shot boundaries, Track 3 audio spans across scenes with linear crossfades, maintaining an uninterrupted acoustic space while the camera edits.

### **1\. Compositional Paradigms & POD-16 Sourcing**

Track 3 ingests environmental loops and musical compositions through two distinct architectural models, depending on the series' narrative profile:

> * **POD-16 Multi-Stem Score:** When traditional thematic music is utilized, it is sourced from the Score & Composition Pod (POD-16) as separated master stems (Melodic, Harmonic, Percussive, Sub-bass). By mounting separated stems rather than flattened mixes, the assembly pipeline can dynamically balance specific musical frequencies against dialogue without requiring full audio recomposition.  
> * **Geometric Sound Beds (*Chosisme* Style):** For austere narrative modes where traditional cinematic scoring is banned, the pipeline relies on geometric ambient beds (e.g., machinery drones, rain on zinc, or 40 Hz pipe hums). These loops are queried from the library using objective physical metadata (such as spectralCentroidHz \< 250 and intensityBand) rather than subjective emotional tags, intentionally keeping ambient energy below the frequency bands occupied by spot Foley transients.  
> * **Kinetic Curve Automation:** In geometric scoring, the screenplay's 6-Beat Kinetic Curve acts as a machine-readable automation script. The curve's level (1 through 10\) dictates the density, saturation, and gain staging of the ambient loop layers.

### **2\. Programmatic Sidechain Ducking Math (AmbientTrack.tsx)**

To protect vocal intelligibility without relying on non-deterministic analog compressor plugins, Track 3 executes programmatic gain automation tied explicitly to Track 1 dialogue windows.

> * **Decibel-Derived Attenuation:** During an active speech window (*f*start​≤*f*≤*f*end​), background audio automatically attenuates by a strict −14 dB. The component calculates this ducked gain multiplier mathematically based on the baseline volume (*V*base​):  
>   Gainducked​\=1020−14 dB​×*V*base​≈0.1995×0.40≈0.0798  
> * **Quadratic Envelope Geometry:** Gain transitions do not cut abruptly. The audio bed dips via a 6-frame quadratic attack (*A*\=6, ≈250 ms) leading into the dialogue onset, and recovers back to unity volume using a 12-frame quadratic release (*R*\=12, ≈500 ms) once speech concludes.  
> * **Pre-Roll Staging:** During a shot's pre-roll interval (0≤*f*\<*F*pre​), Track 1 speech remains silent, allowing Track 3 ambient beds to remain un-ducked or to initiate their 6-frame attack ramp. This allows unmodified room tone to punch through the visual reaction before the character speaks.

### **3\. The Multi-Window Minimum Reducer (Anti-Pumping Architecture)**

If sidechain envelopes were evaluated with a naive loop that terminated upon the first matching dialogue window, the background volume would ramp up during short inter-sentence pauses and violently dip again on the subsequent attack, causing a jarring "volume pumping" artifact.

> * To eliminate this, AmbientTrack.tsx evaluates all active dialogue windows across the scene simultaneously and applies a Math.min() union composition across the resulting gain curves.  
> * If two lines of dialogue are separated by a breath pause shorter than the combined 18-frame release-and-attack duration, the union math ensures the background bed remains flat at the ducked −14 dB floor across the gap.

### **4\. Narrative Silences & \[BEAT\] Swells**

The pipeline responds dynamically to authored pauses in the AST:

> * **Dramatic Silence Drops:** In strict narrative profiles, deliberate moments of dramatic realization or high tension trigger explicit silence windows that force the ambient bed floor even lower, attenuating the background by −24 dB.  
> * **Continuous Swells:** When the AST issues an explicit narrative \[BEAT\] node (e.g., 4.5 seconds), the speech synthesizer is bypassed, and the sidechain ducking envelope releases. This allows the continuous ambient score or sub-bass drone to swell back to full baseline volume (*V*base​), sustaining across the silence to fill the void before decaying exactly 0.5 seconds before the next dialogue node begins.

---

*User prompt: {{FOCUS:  1\. Compositional Paradigms & POD-16 Sourcing }} /extreme-details*

Response: The viewport's acoustic architecture governs continuous ambient sound beds and musical scores on Track 3, utilizing two distinct compositional paradigms depending on the series' narrative constraints.

### **1\. POD-16 Score & Composition (Separated Stems)**

When a production utilizes traditional thematic music, the Score & Composition Pod (POD-16) handles the musical landscape.

> * **Thematic Continuity:** The Composer prioritizes thematic continuity over episode-by-episode novelty, developing established leitmotifs across a season rather than discarding them for freshness.  
> * **Separated Master Stems:** POD-16 explicitly delivers separated master stems—categorized as Melodic, Harmonic, Percussive, and Sub-bass—rather than a single, pre-baked mix. Delivering separated stems outranks the convenience of a finished-sounding file, as it allows the Assembly Pod to dynamically balance specific musical frequencies against dialogue and Foley downstream without needing to recompose the audio.  
> * **Frequency Band Constraints:** Score compositions operate under a strict acoustic boundary: music cannot cross into the primary dialogue formant spectrum (1 kHz to 3.5 kHz) during spoken lines.  
> * **Pacing Respect:** POD-16 must compose around the already-locked dialogue timing established by the Audio Pod; if a deliberate dramatic silence is authored into the timeline, POD-16 must respect that boundary condition and cannot override it by inserting a musical cue.  
> * **Parallel Coordination:** The Composer times cues and tempo maps against the locked animatic provided by POD-14/POD-15. However, because the final visual cut may shift slightly from the animatic, POD-16 coordinates in parallel with the Assembly Pod to reconcile these minor timing adjustments.

### **2\. Geometric Sound Beds (*Chosisme* Style)**

For austere narrative profiles operating under *chosisme* production guidelines, traditional cinematic musical scoring (e.g., swelling emotional strings or dramatic brass) is explicitly prohibited, as it smuggles subjective psychology into the work.

> * **Objective Acoustic Indexing:** Instead of using subjective mood tags (e.g., "tense drone" or "melancholy chord"), geometric sound beds are indexed by objective, quantifiable physical phenomena. The loop metadata schema categorizes beds using parameters like intensityBand, texture (e.g., "sustained-low-frequency"), and compatiblePhases.  
> * **Spectral Masking Prevention:** Continuous ambient beds are strictly restricted to low and mid-frequency bands, specifically maintaining a spectralCentroidHz \< 250\. This keeps ambient energy entirely below the upper-mid frequencies occupied by Spot Foley transients, naturally preventing acoustic masking and eliminating the need for manual EQ adjustments.  
> * **Kinetic Curve Automation:** The script's 6-Beat Kinetic Curve acts as a machine-readable automation score for geometric beds. The assigned curve level (ranging from 1 to 10\) directly translates into loop layer density, saturation, and overall gain staging.

### **Decoupled Acoustic Continuity**

Regardless of the compositional paradigm employed, Track 3 operates on a principle of decoupled continuity.

> * While Track 1 (Dialogue) utilizes fixed integer frame clocks and video plates cut sharply on beat boundaries via \<Sequence\> primitives, continuous ambient music and sound beds persist across these hard visual cuts.  
> * The continuous beds bridge scenes using linear crossfades, ensuring that while the camera edits sharply, the underlying acoustic space continues to breathe without interruption.

---

*User prompt: {{FOCUS:  2\. Programmatic Sidechain Ducking Math (AmbientTrack.tsx) }} /extreme-details*

Response: The AmbientTrack.tsx component enforces vocal intelligibility by computing programmatic, timeline-keyed gain automation curves for continuous background audio (Track 3\) rather than relying on non-deterministic, signal-reactive analog compressors.

> * **Decibel Attenuation Math:** During active dialogue windows on Track 1 (*f*start​≤*f*≤*f*end​), background tracks duck by a target depth of −14 dB. To maintain unit consistency, the ducked multiplier is calculated dynamically from a single decibel parameter inside the component rather than relying on hardcoded fractions: *V*duck​\=*V*base​×1020attenuation\_dB​. Given a baseline volume of 0.40, this evaluates as *V*duck​\=0.40×1020−14​≈0.0798.  
> * **Quadratic Attack Phase:** The ambient bed dips over a 6-frame quadratic attack (*A*\=6, ≈250 ms) leading into the speech onset, interpolated using Easing.out(Easing.quad).  
> * **Active Speech Window:** The background volume is held statically at the *V*duck​ floor for the continuous duration of the speech stem.  
> * **Quadratic Release Phase:** The audio bed recovers to *V*base​ over a 12-frame quadratic release (*R*\=12, ≈500 ms) once speech concludes, interpolated using Easing.in(Easing.quad).

### **The Multi-Window Minimum Reducer (Anti-Pumping Architecture)**

> * **The Envelope First-Match Flaw:** A naive implementation loops through dialogue windows and uses a break statement upon the first condition match. If two spoken lines are separated by a short gap (e.g., 6 frames), evaluating a frame within that gap hits the first window's release branch, partially recovering the volume, and breaks before recognizing the second window's attack phase. This logic error produces an audible gain pumping artifact where the background abruptly swells and violently dips between sentences.  
> * **Union Composition:** The calculateDuckedGain function eliminates this artifact by evaluating all active dialogue windows across the scene simultaneously. It calculates a windowGain for every envelope and applies a reducer: minGain \= Math.min(minGain, windowGain).  
> * **Gap Bridging:** By taking the mathematical minimum across all envelopes, overlapping attack and release curves compose as a union, successfully holding the background volume at the −14 dB floor across brief breath pauses without pumping.

### **Narrative Overrides & Temporal Edge Cases**

> * **Pre-Roll Silence Staging:** During an unvoiced pre-roll buffer (0≤*f*\<*F*pre​) triggered by a visceral sting, Track 1 dialogue remains completely muted. Track 3 remains un-ducked or executes its 6-frame attack ramp smoothly, allowing room tone or Foley to play cleanly against the actor's facial shock before speech ignites.  
> * **Deliberate Dramatic Silences:** Explicit dramatic realization pauses trigger distinct narrative silence windows that apply additional linear gain multipliers over the ducked floor, forcing the ambient volume down to −24 dB.  
> * **Narrative Swells (\[BEAT\] Nodes):** If the script generates an explicit narrative \[BEAT\] node, dialogue synthesis is bypassed. The sidechain envelope releases completely, allowing atmospheric drones or musical scores to swell back to unity gain (*V*base​), sustaining through the silence before decaying 500 ms prior to the next dialogue onset.

---

*User prompt: {{FOCUS:  2\. Geometric Sound Beds (Chosisme Style) }} /extreme-details*

### **Response: 1\. The *Chosisme* Acoustic Philosophy & Objective Metrics**

In *chosisme* production guidelines, traditional cinematic musical scoring, such as swelling emotional strings or dramatic brass, is explicitly prohibited. Emotional musical cues are banned because they smuggle subjective psychology through the acoustic back door, violating the principle of external objective fact. Instead, the pipeline relies on geometric ambient beds, which are continuous atmospheric loops like 40 Hz pipe hums, electrical hums, machinery drones, or rain on zinc.

To enforce grounded narrative realism, sound beds are framed strictly as quantifiable physical phenomena rather than subjective emotional pads like "tense drone" or "melancholy chord". Loops are indexed in the library by objective spectral properties using a precise metadata schema:

> * **Acoustic Loop Metadata:** The schema categorizes loops using explicit physical parameters, including intensityBand, texture (e.g., "sustained-low-frequency"), seamlessLoop, durationFrames, and compatiblePhases (e.g., \["stasis", "inspection", "arrest"\]).  
> * **Spectral Separation:** Continuous ambient beds are strictly restricted to low and mid-frequency bands, explicitly maintaining a spectralCentroidHz \< 250\. By keeping ambient energy below the upper-mid frequencies occupied by spot Foley transients, the system naturally prevents acoustic masking and entirely eliminates the need for manual, per-shot EQ adjustments.

### **2\. Kinetic Curve Automation**

Geometric sound beds are not manually placed or mixed in a Digital Audio Workstation (DAW); instead, the screenplay's 6-Beat Kinetic Curve functions as a machine-readable mix automation score.

> * **Gain Staging & Density:** The narrative script’s kinetic intensity rating, defined as a Curve Level ranging from 1 to 10, dictates the loop layer density, saturation, and overall gain staging of the ambient beds.  
> * **Database Query Routing:** The Curve Phase serves as the exact database query key into the loop library, matching the narrative phase directly to the compatiblePhases array in the loop's objective metadata.

### **3\. Track Topology & Decoupled Continuity**

Geometric sound beds are mounted on Track 3 as low-priority, continuous acoustic layers within Remotion's prioritized component tree.

> * **Linear Crossfades:** While spoken dialogue dictates the master clock and video plates cut sharply on visual beat boundaries using \<Sequence\> primitives, the ambient sound beds decouple from these hard cuts. The loops persist continuously across scene and shot transitions using linear crossfades, ensuring the acoustic space breathes uninterrupted.

### **4\. Programmatic Gain Automation (Sidechain Ducking)**

To strictly protect vocal intelligibility without relying on unpredictable analog compressors, geometric sound beds are dynamically shaped by deterministic, timeline-keyed mathematical gain envelopes.

> * **Speech Window Attenuation:** During active Track 1 dialogue windows, the continuous ambient bed is programmatically ducked by an exact linear gain multiplier targeting a \-14 dB reduction.  
> * **Quadratic Envelopes:** Rather than applying hard volume cuts, the \-14 dB attenuation dips smoothly via a 6-frame quadratic attack curve before speech begins, and recovers back to baseline volume via a 12-frame quadratic release curve once the speech pause exceeds 12 frames.  
> * **Multi-Window Union Reducer:** To prevent unnatural volume pumping between brief inter-sentence pauses, the system evaluates all active dialogue windows simultaneously using a Math.min() reducer, maintaining the ducked floor across short breath gaps.  
> * **Deliberate Silence Gating:** In strict *chosisme* production profiles, authored dramatic silences or \[BEAT\] nodes trigger explicit ducking events that force the ambient background bed down even further to a \-24 dB attenuation floor.

---

*User prompt: {{FOCUS:  3\. The Multi-Window Minimum Reducer (Anti-Pumping Architecture) }} /extreme-details*

Response: The Multi-Window Minimum Reducer operates within AmbientTrack.tsx as a programmatic gain automation architecture to enforce continuous sidechain ducking without signal pumping.

**The First-Match Break Flaw** Naive programmatic sidechain implementations loop through active dialogue windows and use a break statement to terminate the loop upon the first condition match. This creates a severe calculation error during short inter-sentence pauses.

Consider two consecutive lines of dialogue separated by a 6-frame gap: Line 1 ends at frame 75 (initiating a release ramp through 87), and Line 2 begins at frame 81 (initiating an attack ramp starting at 75). If the system evaluates frame 78 using a first-match loop, the frame triggers Line 1's release condition. The system calculates a partial volume recovery, sets the volume, and exits the loop without ever evaluating Line 2's overlapping attack ramp. This causes the background ambient bed to swell abruptly during the short gap and then violently dip again when the next sentence begins, resulting in a highly noticeable, audible volume pumping artifact.

**The Min-Envelope Union Reducer** To eliminate this pumping artifact, the calculateDuckedGain function evaluates all active dialogue windows across the entire scene simultaneously.

> * **Decibel-Derived Targets:** The engine derives the target ducked volume directly from a single decibel parameter using the mathematical formula baseVolume \* Math.pow(10, attenuationDb / 20\) (e.g., a base volume of 0.40 attenuated by \-14 dB yields approximately 0.0798). This ensures the ducking depth is structurally linked to acoustics rather than passing two independent, coincidental float numbers.  
> * **Mathematical Minimum Evaluation:** Instead of exiting the envelope loop early, the system calculates a discrete windowGain for every phase (attack, sustain, release) and applies a minimum reducer: minGain \= Math.min(minGain, windowGain).  
> * **Union Composition:** By continually selecting the lowest resulting volume across all envelopes, overlapping attack and release ramps mathematically compose as a continuous union. If the breath pause between sentences is shorter than the combined release-and-attack duration, the Math.min() logic ensures the background track remains securely flat at the \-14 dB floor across the entire gap.

---

*User prompt: {{FOCUS:  4\. Narrative Silences & \[BEAT\] Swells }} /extreme-details*

Response: The pipeline processes narrative silences not as empty gaps in the timeline, but as active, machine-readable acoustic events dictated directly by the Abstract Syntax Tree (AST). When the script compiler encounters dedicated narrative pauses or silence holds, it executes specific programmatic gain automation and component bypassing:

> * **Acoustic Swells (\[BEAT\] Nodes):** When the AST introduces explicit narrative pause lines (labeled as \[BEAT\] nodes), the pipeline bypasses the text-to-speech (TTS) synthesis engine entirely. The Conductor automatically releases the active sidechain ducking envelope, allowing continuous atmospheric drones or orchestral scores to swell up to their full baseline volume (*V*base​). This acoustic swell sustains across the narrative void and decays exactly 0.5 seconds prior to the resumption of spoken dialogue, cleanly preparing the acoustic space.  
> * **Punctual Foley Injection:** During these \[BEAT\] swells, punctual spot Foley cues (such as a match strike or a valve drip) are mounted at exact offsets. Their temporal placement and variant selection are seeded deterministically using Mulberry32(MurmurHash3(sceneId \+ ":" \+ shotId \+ ":" \+ cueName)).  
> * **Deliberate Dramatic Silences (−24 dB Attenuation):** For austere narrative profiles or moments of high-tension realization, silence actively suppresses the environment. The event is encoded into the timeline as a specific object (e.g., {"type": "silence", "fromFrame": 240, "toFrame": 375, "duckAmbientDb": \-24}). This triggers an explicit ducking event that forces ambient sound beds down to a strict −24 dB floor by applying additional linear gain multipliers over the standard ducked baseline.  
> * **Macro-Level Scarcity & The Silence Budget:** Silence is governed globally as a finite narrative currency via the Episode Tension Curve Matrix. Outlines use a Hold? (X / \-) analytical field to enforce a strict budget, permitting only one or two beats per episode to expend a silence hold. When triggered during a critical revelation, ambient room tone, music, and dialogue drop out completely, creating a vacuum of dead air that forces the audience to confront the realization alongside the character.

---

*User prompt: {{FOCUS:  4\. Downstream Ingestion & Storage Discipline }} /extreme-details*

Response: The downstream ingestion pipeline forms a critical mechanical bridge between the centralized, multi-gigabyte master asset vault and downstream rendering nodes like goblin-viewport-template and goblin-episodes. Naively coupling downstream renderers directly to the full upstream asset tree results in catastrophic disk thrashing, slow CI/CD image pulls, network timeouts, and non-deterministic rendering crashes.

> * **Pruned Local Asset Envelope (public/assets/):** To solve the coupling hazard, each stamped episode workspace maintains a pruned, hermetically sealed local asset envelope housed within public/assets/. This serves as an uncompromising physical boundary isolating downstream headless Chromium rendering nodes from the massive upstream acoustic and visual vaults.  
> * **AST-Driven Selective Harvesting:** Instead of pulling assets at runtime from global libraries, the architecture utilizes an isolated, AST-driven harvesting model. Scripts such as scripts/collect-episode-assets.ts parse the upstream narrative intent (the AST) and copy only the specific assets strictly required for that exact scene into the local sandbox, sealing it completely decoupled from future updates to upstream art or code.  
> * **Strict Storage Ceilings:** This selective harvesting is governed by non-negotiable physical storage budgets. The pipeline enforces a strict storage envelope of \<100MB per episode, with an absolute hard ceiling of 150MB, ensuring lightweight and performant compilations.  
> * **Cryptographic Integrity & The Zero-Byte Poison Sentinel:** The ingestion process is backed by strict cryptographic integrity tripwires. The pipeline utilizes a "Zero-Byte Poison Sentinel" mechanism designed to trap truncation attacks or corrupted LFS pulls by explicitly checking for the empty SHA-256 hash (e3b0c442...).  
> * **Tagged Shallow Synchronization:** The physical transfer of these assets relies on tagged shallow synchronization commands (e.g., scripts/sync-assets.ts (--depth 1)), avoiding the overhead of cloning the entire Git history for downstream compilation.

---

*User prompt: {{FOCUS:  4\. Semantic Filtering & Phonetic Firewalls }} /extreme-details*

### **Response: 1\. Semantic Prosodic Exclusion Filters (banned\_cadences)**

Within voice\_manifest.json, the character baseline recipe enforces explicit prosodic exclusion vectors to halt incompatible emotional deliveries at compile time (*T*0​\=\$0.00) before invoking the neural vocoder:

> * **The Invariant Law:** If an upstream narrative instruction dictates a delivery style that physically contradicts a character's active anatomical state or somatic trauma recorded in the canonical relational ledger, the ingress firewall intercepts the payload immediately.  
> * **The Anatomical Feasibility Implication:** Before audio synthesis is dispatched, the compiler evaluates the vocal-motor theorem:  
>   *c*.has\_verbal\_directives⟹"mute"∈/*c*.conditions∧"speak"∈/*c*.banned\_kinetic\_verbs  
>   If an entity suffering from crushed laryngeal cartilage or a severed trachea has spoken lines assigned, the compiler raises a fatal VOCAL\_DELIVERY\_BREACH.  
> * **Compile-Time Cadence Pruning:** The character's active recipe contains an explicit array of prohibited deliveries:  
>   "banned\_cadences": \[  
>     "RAPID\_STACCATO",  
>     "RISING\_INFLECTION\_INTERROGATIVE",  
>     "BREATHLESS\_WHISPER"  
>   \]

>   If the upstream Abstract Syntax Tree (dialogue\_ast.json) instructs an injured character with severe diaphragmatic or pulmonary damage to deliver dialogue with "RAPID\_STACCATO", the multiplexer intercepts the directive and rejects the payload with exit code 1, protecting GPU and CPU cycles.

### **2\. The Phonetic Firewall Architecture (lexicon.json)**

Neural Text-to-Speech (TTS) models map tokenized text into acoustic frames through learned latent embeddings and internal Grapheme-to-Phoneme (G2P) systems (e.g., CMUdict, eSpeak-NG). Standard out-of-the-box G2P models predictably break on episodic worldbuilding, proprietary proper nouns, and regional dialects:

> * **Out-of-Vocabulary (OOV) Orthographic Hallucinations:** Invented nouns (e.g., *"Snerk"*, *"Gallbreaker"*, *"hydrazine"*) lack standard phonetic entries, triggering naive character-level letter-to-sound rules that cause erratic stress placement, split diphthongs, or dropped syllables.  
> * **Dialectal Cadence Collapse:** Standard TTS engines flatten regional drawls or colloquialisms into generic standard American pronunciation, or misinterpret elisions (e.g., pronouncing *"d'you"* as two distinct staccato tokens *"d"* and *"you"*).  
> * **Temporal Pacing Instability:** Inconsistent syllabification causes the vocoder to non-deterministically alter line duration (*D*ms​). Because continuous audio duration acts as the master pacemaker determining integer 24 fps video cut budgets (⌈(*D*ms​/1000)×24⌉), pronunciation jitter destabilizes downstream video plates and optical ducking automation.

Located at voices/\<series\_slug\>/lexicon.json, the phonetic dictionary acts as an isolated, pre-inference normalization sandbox executed via audio-microservice/engines/base.py:

RAW SCRIPT INGRESS (from dialogue\_ast.json: "The siphon wrench is under the culvert.")  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 1: REGEX SYNTACTIC EXPANSION                                     │  
│ • Applies ordered regex\_replacements with word-boundary isolation       │  
│ • Expands colloquial elisions, metric units, and dialect forms         │  
│ • Transforms dialect safely without triggering upstream safety filters │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 2: CASE-INSENSITIVE LEXICAL TOKENIZATION                         │  
│ • Splits stream into words, punctuation tokens, and whitespace         │  
│ • Preserves trailing punctuation (\!, ?, .) for prosodic intonation    │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 3: PHONETIC LEXICON OVERRIDE LOOKUP                              │  
│ • Strips punctuation for lookup against phonetic\_rules keys            │  
│ • Hit: Replaces token with phonetic string or ARPAbet phoneme sequence │  
│ • Miss: Forwards token to engine default G2P fallback                  │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 4: ENGINE-SPECIFIC PHONEME ADAPTATION                            │  
│ • Piper/ONNX: Maps directly to internal phoneme ID tokens              │  
│ • CosyVoice: Formats as SSML/phoneme tag or phonetic text string       │  
│ • Parler-TTS: Formats as phonetically spelled syllables with caps stress│  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
         DISPATCHED TO NEURAL SYNTHESIS ENGINE (float32 PCM 48 kHz)

### **3\. Concrete Multi-Series Lexicon Implementations**

Because series are strictly segregated under top-level repository namespaces (voices/\<series\_slug\>/), lexicons never cross-contaminate. A pronunciation rule in *Under the Floorboards* has zero visibility in *Wiregrass Basin*.

#### **A. Domestic Goblin Setting (voices/under-the-floorboards/lexicon.json)**

> * **World Axiom:** Fast, anxious, clipped domestic goblin farce beneath kitchen floorboards.  
> * **Acoustic Strategy:** High-pitched, clipped consonant emphasis with hard front-of-mouth plosives.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "under-the-floorboards",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "siphon": "SAI-fun",  
    "snerk": "SNERK",  
    "grissel": "GRIZ-zul",  
    "marrow-bone": "MAIR-oh-BOHN",  
    "floor-timbers": "FLOR-TIM-berz",  
    "skitter": "SKIT-ter",  
    "tallow": "TAL-oh",  
    "peevish": "PEE-vish"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(d'you)\\\\b",  
      "replacement": "dyoo",  
      "description": "Contracts 'd'you' to quick goblin dental glide"  
    },  
    {  
      "pattern": "\\\\b(gotta)\\\\b",  
      "replacement": "GAHT-tuh",  
      "description": "Forces clipped staccato on glottal stop"  
    },  
    {  
      "pattern": "\\\\b(underneath)\\\\b",  
      "replacement": "un-ner-NEETH",  
      "description": "Flattens 'd' sound for subterranean colloquial speech"  
    },  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(in|inch|inches)\\\\b",  
      "replacement": "\$1 IN-chez",  
      "description": "Expands dimensional measurements for hoarded items"  
    }  
  \],  
  "banned\_pronunciations": {  
    "siphon": \["SEE-fon", "sih-FON"\],  
    "grissel": \["GRIZ-lee", "gray-SEL"\]  
  }  
}

#### **B. Industrial Noir Setting (voices/wiregrass-basin/lexicon.json)**

> * **World Axiom:** Southern Gothic industrial noir, chemical defoliant runoff, heavy vocal fry, and laryngeal wear.  
> * **Acoustic Strategy:** Elongated diphthongs, dropped terminal nasals, dark unreleased plosives.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "wiregrass-basin",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "culvert": "KULL-vert",  
    "gallbreaker": "GAWL-bray-ker",  
    "creosote": "KREE-uh-soht",  
    "slough": "SLOO",  
    "diesel": "DEEZ-ul",  
    "spurl": "SPERL",  
    "defoliant": "dee-FOH-lee-unt",  
    "wiregrass": "WY-er-grass"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(ain't)\\\\b",  
      "replacement": "aynt",  
      "description": "Standardizes dialect negation without nasal pinch"  
    },  
    {  
      "pattern": "\\\\b(do you)\\\\b",  
      "replacement": "dee-yoo",  
      "description": "Softens interrogative onset into regional drawl"  
    },  
    {  
      "pattern": "\\\\b(\\\\w+)ing\\\\b",  
      "replacement": "\$1-in'",  
      "description": "Enforces dropped alveolar nasals across all continuous verbs"  
    },  
    {  
      "pattern": "\\\\b(drainage)\\\\b",  
      "replacement": "DRAY-nij",  
      "description": "Prevents over-enunciation of second syllable"  
    }  
  \],  
  "banned\_pronunciations": {  
    "slough": \["SLUFF", "SLOH"\],  
    "creosote": \["kree-OH-soht"\]  
  }  
}

### **4\. Dialect Mechanics & The NLP Slur Collision Defense**

In rural, noir, or colloquial dialect scripts, authors write phonetically contracted dialogue that triggers false-positive algorithmic censorship in automated safety filters:

*"NLP models misread heavy phonetic dialect as slurs. Spell out grammatical words even if the voice track delivers a heavy contraction."*

To solve this, the pipeline enforces an absolute architectural partition between the **Screenplay AST Grammar (Voice Rail)** and **Synthesized Acoustic Delivery**:

> 1. **Upstream Safety Invariant:** The canonical database (Cloudflare D1 / SQLite) and human-readable screenplay AST strictly maintain grammatically clean, standardized English prose (e.g., *"Do you hear what they are saying in the culvert?"*). This completely insulates upstream cloud language models, linters, and edge gateways from tripping safety filters on vernacular contractions.  
> 2. **Offline Dialect Expansion:** When the local audio-microservice daemon runs on Rig 1, it executes the series-local G2P pass entirely offline where zero cloud API moderation filters exist.  
> 3. **Deterministic Replacement:** Pre-compiled regex patterns transform the clean grammatical tokens into phonetic dialect forms (e.g., \\b(do you)\\b → "dee-yoo"), while proper nouns are swapped with unambiguous phonetic representations ("culvert" → "KULL-vert").  
> 4. **Acoustic Authenticity Without Compromise:** The neural vocoder receives unambiguous, phonetically explicit inputs, synthesizing regional accents while preserving clean text in all upstream logs and databases.

### **5\. Post-Synthesis Conformance Verification**

Once audio is synthesized through the phonetic firewall, it is not trusted blindly; it must pass the **Speech-to-Text (STT) Verbatim Alignment Gate** (Filter 1 of the 5-Stage Conformance Pipeline) before it can be committed to disk:

> * **Automated Transcription Verification:** A local, automated STT inference pass transcribes the raw synthesized 48 kHz / 24-bit PCM buffer.  
> * **Parity Enforcement:** The transcription is normalized (stripping external whitespace and casing) and compared character-for-character against dialogue\_text in dialogue\_ast.json.  
> * **Alignment Breach Interception:** If the vocoder stutters on a plosive, drops a terminal token, or phonetically hallucinates an OOV artifact, execution halts immediately, raising an STT\_ALIGNMENT\_BREACH. The stem is rejected with an exit code 1 at *T*0​, terminating the run before any GPU cycles are spent on downstream video diffusion plates.

---

*User prompt: {{FOCUS:  take a look at the beginning of the converstation and create a summary of the most important information on the series assets audio until the last reponse for 1500 words add any new information you consider worthy }} /extreme-details*

### **Response: 1\. Executive Summary & Epistemological Stance**

The transition from a hardcoded single-series vault (goblin-assets-audio) to the abstracted **series-assets-audio** specification formalizes a foundational law of the studio architecture: **semantic world truth resides exclusively in an immutable relational ledger, while generative machine learning models (LLMs, neural text-to-speech vocoders, and video diffusion models) operate strictly as untrusted, headless rendering workers possessing zero narrative, temporal, or spatial authority**.

Within this framework, **audio serves as the non-negotiable architect of physical time**. Generative video diffusion backends possess no innate biological cadence, respiratory rhythm, or conversational pacing. Therefore, speech must be synthesized, measured, and locked to disk before visual timelines can be constructed. Continuous acoustic duration dictates physical cuts, while picture operates purely as a discrete integer projection mapped directly to that duration.

series-assets-audio functions within **Cluster 04.assets (The Source Art Vault)** on **Axis B (Artifact Hardening / Representation)**. It establishes a strongly typed, read-only acoustic API that isolates canonical voice reference WAVs, dynamic musical score stems, and physical Foley libraries from transient episodic outputs, runtime execution code, and cross-universe contamination.

### **2\. Architectural Boundary & Multi-Series Isolation**

Under the "Quintet" multi-repository topology, every narrative universe maintains a completely decoupled asset stack (e.g., goblin-assets-audio for *Under the Floorboards*, wiregrass-audio for *Wiregrass Basin*):

series-assets-audio/                     \# Canonical Asset Vault (Cluster 04.assets)  
├── .gitattributes                         \# Git LFS tracking rules (\*.wav, \*.mp3, \*.flac)  
├── CHANGELOG.md                           \# Human-audited log for voice and stem mutations  
├── AUDIO\_SPEC.md                          \# 48 kHz / 24-bit PCM, LUFS targets, ducking laws  
├── voices/                                \# Neural TTS Voice Authority  
│   ├── active/                            \# Floating symlinks to certified production takes  
│   │   ├── char\_a.wav                     \# \-\> ../versions/char\_a\_v2.wav  
│   │   └── char\_b.wav                     \# \-\> ../versions/char\_b\_v1.wav  
│   ├── versions/                          \# Append-only immutable historical reference takes  
│   │   ├── char\_a\_v1.wav                  \# Pinned takes (never overwritten in-place)  
│   │   ├── char\_a\_v2.wav  
│   │   └── char\_b\_v1.wav  
│   ├── embeddings/                        \# Serialized speaker latent caches (\*.pt)  
│   ├── lexicon.json                       \# Series-specific dialect overrides & G2P rules  
│   └── voice\_manifest.json                \# Cryptographic hashes, engines, and DSP recipes  
├── foley/                                 \# Spot Transient SFX Library  
│   ├── registry.json                      \# Dual-output semantic lookup table  
│   ├── impacts/                           \# valve\_drop.wav, pipe\_clang\_01.wav  
│   ├── locomotion/                        \# boot\_squelch\_01.wav, boot\_squelch\_02.wav  
│   └── handling/                          \# brass\_rattle.wav, cloth\_grab\_heavy.wav  
└── music/                                 \# Continuous Beds & Score (POD-16 / Chosisme)  
    ├── manifest.json                      \# Loop metadata, spectral centroids, BPM, keys  
    ├── ambient/                           \# 40 Hz pipe hums, zinc rain, machine drones  
    └── score/                             \# Multi-track stems (melody, harmony, rhythm, sub)

The repository layout enforces five non-negotiable operational invariants:

> 1. **Source Media vs. Transient Runtime Artifacts:** The vault contains only canonical source material. Staged dialogue stems generated per line (e.g., ep040\_sh01.wav) are transient runtime artifacts placed in goblin-episodes/epXXX/public/assets/audio/, not tracked in the asset vault.  
> 2. **Git LFS Quarantine:** Standard Git object tracking is disabled for heavy binary formats. All \*.wav, \*.mp3, and \*.flac files are tracked strictly via Git LFS, keeping git tree pointers to \~130 bytes and isolating bandwidth consumption.  
> 3. **Storage Ceiling Budget:** Selective harvesting tools (collect-episode-assets.ts) copy only the exact Foley and ambient files required by an episode's AST into a hermetic local sandbox, guaranteeing each stamped episode adheres to a strict budget of **\< 100 MB (150 MB hard ceiling)**.  
> 4. **The Zero-Byte Poison Sentinel:** Pre-flight CI checks verify that staged binary assets do not match the empty SHA-256 hash (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855), halting compilation if an LFS pointer failed to hydrate.  
> 5. **Cross-Series Likeness Quarantine (POD-04 / POD-01):** Legal voice likeness clearances (e.g., SAG-AFTRA AI Digital Voice Riders) are strictly series-scoped. Borrowing an actor's voice reference across series boundaries triggers a compile-time LEGAL\_CLEARANCE\_BREACH.

### **3\. The Epistemological Triad of Voice Identity & Voice Manifest**

Because neural text-to-speech models are susceptible to "The Beige Plague" (statistical regression toward an aesthetically bland median) and latent drift, vocal identity cannot be defined by an unversioned .wav buffer. It is codified within voices/voice\_manifest.json as an irreducible triad:

                 THE EPISTEMOLOGICAL TRIAD OF VOICE IDENTITY  
 ┌────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  
 │ 1\. ENGINE & CHECKPOINT │  │ 2\. CONDITIONING TOKEN   │  │ 3\. BASELINE DSP VECTOR  │  
 │ • Model: CosyVoice-300M│  │ • Strategy: ZERO\_SHOT    │  │ • Pitch: \-2.8 semitones │  
 │ • Weights: sha256:...  │  │ • Embedding: .pt cache  │  │ • Formant Warping: 1.10 │  
 │ • Quantization: FP16   │  │ • Reference: .wav hash  │  │ • Speed Scalar: 0.82    │  
 │ • Target: CPU (0MB VRAM│  │ • Legal: SAG-AFTRA Rider│  │ • Diaphragmatic Breath   │  
 └────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘

The microservice multiplexes across four conditioning modalities:

> * **ZERO\_SHOT\_CLONE:** Computes 512- or 1024-dimensional speaker vectors via convolutional/transformer backbones (ECAPA-TDNN/CAMPPlus) from pinned .wav files. Vectors are cached as .pt tensors to avoid extraction overhead.  
> * **SPEAKER\_ID:** Maps an integer ID via an *O*(1) tensor slice into an internalized linear embedding matrix (*W*spk​∈R*K*×*D*) on CPU architectures (e.g., Piper/ONNX).  
> * **DESCRIPTION\_PROMPT:** Utilizes structured natural language traits cross-attended in autoregressive decoders (e.g., Parler-TTS) without living biometric likenesses.  
> * **SPEAKER\_VECTOR:** Directly injects precomputed, mathematically synthesized latent vectors into lightweight vocoders (e.g., Kokoro-82M).

### **4\. Dynamic Algebraic Somatic Composition**

Narrative physical trauma recorded in the canonical relational ledger is translated into quantitative basis points (0 to 10,000 bp) by the Unified Pressure Meter Engine. The audio-microservice applies runtime DSP deltas against the neutral baseline:

Pitch: *F*0,eff​\=basePitchShiftSemitones+ΔPitchscene​  
Formant: *W*eff​\=formantWarpingFactor×ΔFormantscene​  
Velocity: *P*eff​\=speedScalarbase​×(1.0−0.30×(10,000SOMATIC\_FATIGUE​))  
Breath: Πeff​\=baseBreathiness×(1.0+1.40×(10,000SOMATIC\_FATIGUE​)2)  
Fry: Φeff​\=clamp(baseVocalFry+0.50(10,000SOMATIC\_FATIGUE​)\+0.40(10,000PHYSICAL\_PAIN​),0.0,1.0)

#### **Master Timeline Expansion**

Because physical duration governs visual cuts, expanding inter-clause pause factors (Πeff​) due to exhaustion directly lengthens audio duration (*D*ms​). A line taking 2,100 ms (51 frames) at resting baseline expands to 3,850 ms (93 frames) under 8,500 bp fatigue. The exposure sheet recalculates discrete 24 fps integer frames, forcing downstream video plates to adapt to the labored delivery.

### **5\. Semantic Filtering & The Phonetic Firewall**

To protect the synthesis engine from out-of-vocabulary hallucinations and ensure prompt safety:

> * **Compile-Time Prosodic Exclusion:** The banned\_cadences array (e.g., \["RAPID\_STACCATO"\]) intercepts and aborts deliveries that contradict a character's physical state (e.g., lung damage) at *T*0​ (\$0.00 cost).  
> * **The Vocal-Motor Invariant:** Evaluates whether physical conditions permit speech before calling vocoders:  
>   *c*.has\_verbal\_directives⟹"mute"∈/*c*.conditions∧"speak"∈/*c*.banned\_kinetic\_verbs  
> * **The NLP Slur Collision Defense (lexicon.json):** Cloud LLMs and safety filters misread vernacular spellings and contractions as slurs or corrupted text. The architecture enforces an absolute partition:  
  * **Upstream Screenplay AST:** Enforces standard grammatical English prose (e.g., *"Do you hear what they are saying in the culvert?"*), completely insulating upstream APIs and linters.  
  * **Local Phonetic Expansion:** The local daemon on Rig 1 executes regex passes (\\b(do you)\\b → "dee-yoo") and lexicon dictionary overrides ("culvert" → "KULL-vert") offline where zero cloud moderation filters exist, guaranteeing dialect authenticity.  
> * **Speech-to-Text Verbatim Alignment Gate:** Transcribes the generated PCM buffer locally and compares it character-for-character against the AST dialogue\_text. Stutters, phonetic dropped tokens, or vocoder hallucinations raise an STT\_ALIGNMENT\_BREACH, halting the pipeline at *T*0​.

### **6\. Dual-Output Foley Architecture**

Foley sound design is programmatically compiled rather than manually placed:

> * **Lexical Mapping (foley/registry.json):** Screenplay action nouns (e.g., ITEM\_SIPHON, TERRAIN\_SWAMP) map simultaneously to a visual plate prompt ("corroded brass tube") and a concrete audio stem (foley/metal\_siphon\_scrape\_02.wav), guaranteeing visual-acoustic parity.  
> * **Temporal Snapping & Priority:** Foley resides on Track 2\. Transient cues snap directly to action hold-frames or kinetic impact windows (Phase B). Triggers disperse across pre-roll (Math.floor(preRoll / 2)) and dialogue offsets (preRoll \+ (cueIndex \* 18)), capped at 72 frames duration.  
> * **Deterministic Seeding & Anti-Clustering:** Remotion renders frames concurrently across isolated workers, making standard Math.random() catastrophic. The compiler uses Mulberry32 initialized with a 32-bit MurmurHash3 seed derived from semantic metadata:  
>   Seed=MurmurHash3(sceneId+":"+shotId+":"+sampleKey)  
>   If the drawn sample matches the variant used in the preceding beat, an anti-clustering salt (:retry) is appended to force a deterministic re-roll.  
> * **Source Baking:** PRNG resolution executes at generation time; the resolved path is baked into the TSX component as a static string literal (\<Audio audio/foley/boot\_squelch\_02.wav")}" src="{staticFile("/\>), eliminating runtime evaluation.

### **7\. Continuous Beds, Score & Anti-Pumping Sidechain Math**

Track 3 hosts continuous musical score stems (POD-16) or geometric ambient loops (*Chosisme* style):

> * **Spectral Decoupling:** Ambient beds must maintain a spectral centroid \<250 Hz to avoid masking the upper-mid frequencies occupied by spot Foley transients.  
> * **Decibel-Derived Attenuation:** Active speech windows (*f*start​≤*f*≤*f*end​) attenuate background audio by −14 dB:  
>   *V*duck​\=*V*base​×1020−14​≈0.40×0.1995≈0.0798  
> * **Quadratic Envelope Curves:** Gain modulates via a 6-frame quadratic attack (Easing.out(Easing.quad)) before speech, holds flat during dialogue, and recovers via a 12-frame quadratic release (Easing.in(Easing.quad)).  
> * **Multi-Window Minimum Reducer:** Naive implementations loop through dialogue windows and break on the first match, causing background volume to pump violently during brief breath pauses. AmbientTrack.tsx evaluates all dialogue envelopes across the scene and reduces them via Math.min(), keeping background gain locked at −14 dB across inter-sentence gaps.  
> * **Narrative Silences & \[BEAT\] Swells:** Authored \[BEAT\] pause lines bypass TTS synthesis and release the sidechain envelope, allowing the ambient bed to swell back to *V*base​ before decaying 0.5s prior to the next dialogue line. High-tension realization holds trigger an explicit silence window forcing ambient levels to a −24 dB floor.

### **8\. Directed Acyclic Graph (DAG) Blast Radius & Economic Horizons**

Media compilation is modeled as an immutable DAG where every deliverable is sealed by a provenance root (render\_manifest.json):

CANON LEDGER ──► DIALOGUE AST ──► TTS SYNTHESIS ──► EXPOSURE SHEET ──► DIFFUSION & COMPOSITING  
   (D1/SQLite)      (IR JSON)      (48kHz WAV)        (24fps Frames)      (Rig 2 / Remotion)

> * **Topological Blast Radius:** If an author patches a voice parameter or canonical fact, the invalidation ratio is calculated via:  
>   *R*blast​(*v*)=*n*∣I(*v*)∣​  
>   If *R*blast​\>0.40, compilation halts to prevent cascading invalidation of over 40% of the corpus.  
> * **Asymmetric MEU Repair:** When dialogue invalidates a scene, the compiler freezes historical preconditions (backward prerequisite closure) and only regenerates downstream lines if mutated entities are actively referenced.  
> * **The 4*n*\+1 GPU Compute Firewall:** When a voice recipe mutates, new .wav files are measured and re-quantized. Video diffusion plates operate on a 4*n*\+1 temporal lattice (e.g., 77 frames). If the new audio frame budget satisfies target\_framesnew​≤framesplate​, the GPU is bypassed entirely; Remotion simply trims excess frames in optical assembly.  
> * **Economic Cost Horizons:**  
  * ***T*****0​ (\$0.00):** Linters, verbatim parity checks, schema assertions, and banned cadence gates abort before execution.  
  * ***T*****1​ (\$0.0001):** CPU AST extraction and dialect expansion.  
  * ***T*****2​ (\$0.001):** Local CPU/GPU neural speech synthesis.  
  * ***T*****3​ (\$0.15):** Heavy GPU video diffusion plates.  
  * ***T*****4​ (\$0.01):** Headless Chromium optical compositing.

### **9\. New Strategic & Operational Additions**

To maximize operational reliability across production fleets, three architectural safeguards should be integrated into series-assets-audio:

┌────────────────────────────────────────────────────────────────────────┐  
│ 1\. IDEMPOTENT ATOMIC STAGING & RECOVERY                                │  
│    • Synthesis writes to filename.tmp before atomic filesystem rename. │  
│    • Resumes partial scenes immediately upon socket timeout restarts.  │  
├────────────────────────────────────────────────────────────────────────┤  
│ 2\. SENSORY AUDITABILITY VS. REPRODUCIBILITY                            │  
│    • Neural audio stems are Class 3 Archive-Dependent artifacts.       │  
│    • Once approved, stems are immutable evidence, never regenerated.   │  
├────────────────────────────────────────────────────────────────────────┤  
│ 3\. MASTER LOUDNESS NORMALIZATION GATE (EBU R128 / ITU-R BS.1770-4)     │  
│    • Pre-muxing filter passes: Integrated Loudness \= \-16.0 LUFS (±0.5) │  
│    • True-Peak ceiling clamped to \-1.0 dBTP; Noise floor \<= \-60 dBFS.  │  
└────────────────────────────────────────────────────────────────────────┘

> 1. **Idempotent Atomic Staging:** Network timeouts during multi-line synthesis must not corrupt active directories. Audio stems must write to .tmp files and commit via atomic POSIX rename(), allowing pipeline restarts to resume from the exact un-synthesized line rather than clobbering existing stems.  
> 2. **Sensory Evidence Archival:** Neural vocoder outputs rely on non-deterministic floating-point math across disparate GPU/CPU kernels. Approved stems must be treated as immutable historical evidence and locked to content-addressed storage (CAS); regenerating audio on demand silently destabilizes the master clock and corrupts downstream optical exposure sheets.  
> 3. **Master Loudness & Dynamic Range Normalization:** Raw TTS outputs vary widely in signal power. Before stems are passed to the exposure sheet, an automated DSP filter pass must enforce broadcast normalization: clamping integrated loudness to −16.0 LUFS (±0.5 LUFS for web/streaming) or −24.0 LUFS (broadcast standard), capping True-Peak levels at −1.0 dBTP, and gating residual vocoder noise below −60.0 dBFS.

---

*User prompt: {{FOCUS: 2\. Kinetic Curve Automation}} /extreme-details*

Response: **Kinetic Curve Automation** is the deterministic control-plane subsystem that translates narrative dramatic intensity into synchronized, frame-accurate acoustic mix parameters and visual camera kinematics without human intervention or manual non-linear editor (NLE) keyframing.

Operating across **Axis A (Semantic Meaning)** and **Axis B (Physical Representation)**, the Kinetic Curve eliminates arbitrary, "vibes-based" creative pacing by encoding dramatic pressure as an explicit, machine-readable automation score directly within the screenplay Markdown Abstract Syntax Tree (AST). This score simultaneously governs multi-track digital signal processing (DSP) gain staging on Track 3 and affine matrix transformations on the Remotion camera viewport.

### **1\. The Screenplay AST Contract & Markdown Source of Truth**

The compilation pipeline rejects parallel or detached parameter sidecars in favor of human-readable, schema-locked screenplay Markdown files (.md / .fountain), establishing the script as the immutable single source of truth.

               THE SCRIPT-TO-KINETIC AUTOMATION FLOW  
                 
        Screenplay Markdown Source (.md / locked geometry)  
                           │  
                           ▼  
          Unified Remark AST Compiler (Remark.js)  
                           │  
      ┌────────────────────┴────────────────────┐  
      ▼                                         ▼  
Beat / Triad AST Nodes               Kinetic Curve Table  
(Beats 1–6 / Triads A–C)             (Beat Indices & Levels 1–10)  
      │                                         │  
      ▼                                         ▼  
Exposure Sheet Timelines             Unified Timeline Interpolator  
(Track 1 Audio Clocks)               (interpolate() / spring())  
      │                                         │  
      ├────────────────────┬────────────────────┤  
      ▼                    ▼                    ▼  
Track 3 Ambient Beds   Camera Kinematics    Volumetric QA  
(Gain/Saturation/Bus)  (Zoom/Scale/Jitter)  (MAD Volatility Curve)

> * **Locked Output Geometry:** The authoring format enforces strict structural headings, standardized 6-Beat delineations, Triad identifiers (e.g., **TRIAD A**, **TRIAD B**, **TRIAD C**), explicit action hold indicators (*Hold 18 frames*), and an embedded Kinetic Curve Table.  
> * **AST Extraction:** A unified Remark-based AST parser processes the script offline, converting text headers, tables, and parenthetical directives into structured Intermediate Representation (IR) tokens without performing dynamic parsing at runtime.  
> * **The Machine-Readable Curve Table:** The screenplay explicitly specifies integer intensity ratings across the sequence's lifecycle:  
>   | Beat | Phase       | Level (1–10) | Target Focus        |  
>   | :--- | :---------- | :----------- | :------------------ |  
>   | 1    | Stasis      | 2            | Establishing Culvert|  
>   | 2    | Inspection  | 4            | Siphon Mechanism    |  
>   | 3    | Friction    | 6            | Bog Hands / Valve   |  
>   | 4    | Rupture     | 9            | High-Pressure Burst |  
>   | 5    | Arrest      | 8            | Valve Spindle Clamp |  
>   | 6    | Aftermath   | 3            | Oozing Sludge Pipe  |

> * **Temporal Pinning:** Beats 1 through 6 map directly to Remotion \<Sequence\> layout wrappers whose exact durations are dictated by the measured length of spoken dialogue stems extracted via ffprobe.

### **2\. Acoustic Mix Automation: Ambient Beds & Score Staging (Track 3\)**

In productions utilizing geometric sound beds (*chosisme* style)—where traditional cinematic emotional scoring is banned to prevent smuggling unearned subjective psychology into the scene—the 6-Beat Kinetic Curve acts as an automated mix console.

┌────────────────────────────────────────────────────────────────────────┐  
│                   TRACK 3 MIX AUTOMATION DISPATCH                      │  
├────────────────────────────────────────────────────────────────────────┤  
│ 1\. Database Query Routing: Curve Phase ──► compatiblePhases Array      │  
│ 2\. Spectral Firewall: spectralCentroidHz \< 250 Hz (Anti-Masking)       │  
│ 3\. Layer Density: Active loop tracks \= clamp(ceil(Level / 2.5), 1, 4\)  │  
│ 4\. Bus Saturation: Total Harmonic Distortion THD \= (Level \- 1\) \* 0.035 │  
│ 5\. Pacing Attenuation: Sidechain Ducking Floor \= \-14 dB (Level-Weighted)│  
└────────────────────────────────────────────────────────────────────────┘

#### **A. Database Query Routing & Acoustic Indexing**

Sound beds are not cataloged by subjective moods (e.g., *"dread"*, *"suspense"*); they are indexed in music/manifest.json using objective acoustic parameters:

> * **compatiblePhases:** The AST's current Curve Phase (e.g., \["stasis", "inspection", "arrest"\]) acts as a discrete query key into the loop vault.  
> * **intensityBand:** Matched against the curve's numeric level (1≤Level≤10).  
> * **Spectral Centroid Boundary:** Continuous loops are hard-filtered to maintain a spectral centroid strictly below 250 Hz (spectralCentroidHz\<250). This acoustic barrier prevents ambient room tone and machine drones from colliding with upper-mid spot Foley transients (Track 2\) or the primary dialogue formant spectrum (1 kHz to 3.5 kHz) on Track 1\.

#### **B. Algorithmic Layer Density & Saturation**

The automation engine dynamically balances Track 3 loop stems at each frame boundary based on the interpolated curve level:

> 1. **Stem Stacking Density:** The number of concurrent loop layers mounted in the mix increases monotonically with dramatic intensity:  
>    ActiveLayers=clamp(⌈2.5Level​⌉,1,4)  
>    At Level 2 (Stasis), only the root environmental low-frequency drone plays; at Level 9 (Rupture), the root drone, electrical transformer hum, structural chassis vibration, and high-pressure steam hiss stems are stacked simultaneously.  
> 2. **Harmonic Saturation & Drive:** Analog tape-drive emulation and harmonic saturation curves are applied programmatically to the master ambient bus:  
>    THDtarget​\=(Level−1)×0.035  
>    As the scene approaches Level 10, the baseline pristine loop is pushed into subtle, warm harmonic distortion, signaling systemic narrative collapse without requiring pitch modulation.  
> 3. **Sidechain Ducking Modulation:** While the master sidechain ducking envelope holds background beds at −14 dB during spoken dialogue windows via the Multi-Window Minimum Reducer, the recovery ramp timing (*R*) dynamically compresses as the Kinetic Curve Level rises:  
>    *R*eff​\=clamp(12−⌊2Level​⌋,6,12) frames  
>    Under low-stress conditions, ambient sound recovers leisurely over 12 frames (≈500 ms); under maximum kinetic stress (Level 9–10), the release snaps back aggressively in 6 frames (≈250 ms), forcing the oppressive environment to crash back in between vocal clauses.

### **3\. Algorithmic Camera Kinematics & Optical Viewport Automation**

When compiling visual plates inside goblin-viewport-template, the autonomous coding agent (Jules) ingests the Kinetic Curve Table to compute declarative affine transformations for Remotion’s \<AbsoluteFill/\> layout components. This replaces manual camera blocking with reproducible mathematical functions.

       DRAMATIC INTENSITY (1-10) ──► AST pacing.vocal\_intensity  
                                          │  
                                          ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│                      JULES KINETIC RIG COMPILER                        │  
│                                                                        │  
│  • Normalizes Intensity: S\_curve \= spring({ frame, fps: 24, ... })     │  
│  • Calculates Centroids: Extracts crash\_zoom\_target from manifest.json │  
│  • Maps Affine Matrix:                                                 │  
│      Scale:      interpolate(frame, \[0, F\], \[1.0, 1.0 \+ (int \* 0.02)\])  │  
│      Translate:  Offsets canvas to pin focal point to screen optical center│  
│      Jitter:     Simulates micro-shakes via high-frequency sine noise  │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │  
                                   ▼  
             Baked CSS Transform on Remotion \<AbsoluteFill /\>

#### **A. Global Curve Interpolation Math**

The continuous intensity value is calculated per frame across the sequence using piecewise linear interpolation mapped between beat starting frames:

const intensity \= interpolate(  
  frame,  
  scene.curve.map((c) \=\> beatStartFrame\[c.beat\]),  
  scene.curve.map((c) \=\> c.level),  
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }  
);

#### **B. Dynamic Camera Punch-Ins & Spring Mechanics**

Rather than applying uniform linear scale increases—which produce an artificial, robotic appearance—the Kinetic Rig compiler drives scale via second-order differential spring mechanics combined with normalized intensity factors:

const frame \= useCurrentFrame();  
const { fps } \= useVideoConfig();

// Jules writes deterministic spring dynamics directly into the component  
const zoomSpring \= spring({  
  frame: frame \- beatStartFrame,  
  fps,  
  config: { damping: 12, mass: 0.5, stiffness: 180 },  
});

// Scale factor bounded by continuous curve intensity  
const maxScale \= 1.0 \+ (intensity \* 0.045); // e.g., Level 10 \-\> 1.45x punch  
const scale \= interpolate(zoomSpring, \[0, 1\], \[1.0, maxScale\], {  
  extrapolateLeft: "clamp",  
  extrapolateRight: "clamp",  
});

#### **C. Centroid Locking & Decapitation Prevention**

To ensure that aggressive, curve-driven camera punch-ins do not cut off character foreheads or zoom into empty negative space (the **Decapitation Defect**), the camera translation matrix is locked to the character's explicit crash\_zoom\_target vector declared in manifest.json:

originXglobal​\=(canvas.widthpuppet.x+target.x​)×100%  
originYglobal​\=(canvas.heightpuppet.y+target.y​)×100%  
                  COORDINATE PROJECTION TRANSFORMATION  
                    
  Local Asset Canvas (1024 x 1024\)            Master Viewport Canvas (1920 x 1080\)  
┌─────────────────────────────┐             ┌─────────────────────────────────────┐  
│ (0,0)                       │             │ (0,0)                               │  
│                             │             │                                     │  
│      • crash\_zoom\_target    │             │         Stage Translation           │  
│        (x: 412, y: 198\)     │             │         (puppet.x, puppet.y)        │  
│                             │    Scale    │                ▼                    │  
│                             │ ──────────► │               ┌──────────┐          │  
│                             │   Factor    │               │  Puppet  │          │  
│      • anchor\_point         │    (s)      │               │  • Target│          │  
│        (x: 512, y: 980\)     │             │               └──────────┘          │  
└─────────────────────────────┘             │ ─────────────────────────────────── │  
                                            │ Floor Plane (Y\_ground)              │  
                                            └─────────────────────────────────────┘

The compiler injects this transformed anchor point directly into the container's CSS styling (e.g., transformOrigin: "40.23% 19.33%"), guaranteeing that high-intensity crash zooms center on the actor's facial centroid.

#### **D. Parametric Handheld Camera Jitter**

To break the sterility of 2D digital puppets without requiring GPU diffusion reruns, the compiler injects continuous multi-frequency harmonic translation noise scaled directly by the Kinetic Curve intensity:

Δ*X*\=(sin(frame×0.24)×*A*jitter​)+(sin(frame×0.08)×(0.5⋅*A*jitter​))  
Δ*Y*\=(cos(frame×0.18)×*A*jitter​)+(cos(frame×0.05)×(0.5⋅*A*jitter​))

Where the jitter amplitude scalar *A*jitter​ is derived as:

*A*jitter​\=(intensity−1)×0.75 px

At Level 1 (Stasis), *A*jitter​\=0.0 px, resulting in a locked tripod shot; at Level 10 (Maximum Crisis), *A*jitter​\=6.75 px, generating violent structural camera vibration.

### **4\. Directorial Discipline: Frame Snapping, Hard Cuts & Triad Phase Anchoring**

Kinetic Curve Automation enforces strict directorial laws codified in the *chosisme* production guidelines, eliminating subjective transitions:

> * **Prohibition of Emotional Cross-Fades:** Dissolves, wipes, and eased transitions are explicitly banned. Sequence boundaries between Beats 1 through 6 compile as frame-precise hard cuts via Remotion \<Sequence\> wrappers. This eliminates overlapping alpha-blended rendering passes, maximizing headless Chromium export performance.  
> * **Triad Phase B Impact Anchoring:** Kinetic sub-beats are structured as Triad units (Phase A: Anticipation, Phase B: Action/Impact, Phase C: Resolution/Hold). Punctual spot Foley transients on Track 2 snap to the exact frame where Phase B ignites, or during designated action hold windows (e.g., *Hold 18 frames*) parsed from the screenplay AST.  
> * **Swain MRU Visceral Reflex Buffers:** If the AST registers an abrupt surge in the Kinetic Curve (ΔLevel≥+4 between contiguous beats), the Swain Motivation-Reaction Unit (MRU) parser automatically mounts a 12-to-24 frame unvoiced reaction buffer. The camera initiates a tight push-in (1.0→1.03) and mounts a visceral shock viseme (e.g., pupil dilation) while Track 1 dialogue remains muted, staging the physical reaction before vocal utterance begins.

### **5\. Kinematically Directed Frame Sampling & Verification Gauntlet**

Because Kinetic Curve Automation produces variable temporal and spatial acceleration, verifying rendered video deliverables cannot rely on naive, uniform frame sampling (e.g., inspecting every 24th frame), which routinely misses single-frame viseme pops or transient green-screen key flashes.

Volatilty V(t) ▲  
               │           Peak: Fast Cut / Crash Zoom  
               │                 ▲  
               │                / \\  
               │   /\\          /   \\  
               │  /  \\  /\\    /     \\      /\\  
             ──┴─/────\\/──\\──/───────\\────/──\\──► Frame Index (t)  
                 F\_12     F\_48       F\_92 F\_110  
                   ▲        ▲          ▲    ▲  
                   └────────┴──────────┴────┴── Selected Audit Frames

> 1. **Mean Absolute Difference (MAD) Volatility Proxy:** The automated QA inspection engine computes frame-by-frame visual acceleration using a combination of Learned Perceptual Image Patch Similarity (LPIPS) deltas and dense optical flow vectors:  
>    *Vt*​\=ΔLPIPS​(*Ft*​,*Ft*\+1​)+∥*v*RAFT​∥  
> 2. **Peak Maxima Extraction:** Automated visual audit passes concentrate verification frames at the mathematical local maxima of *Vt*​, which correlate with the steep inflection points of the Kinetic Curve (crash zooms, rapid cut transitions, and abrupt camera shakes).  
> 3. **Coordinate-Bound Diagnostic Remediation:** If a kinetic transformation causes a character puppet's viseme layer to drift beyond tolerance (drift\>4 px), the critic emits a structured ticket containing raw coordinate deltas rather than subjective commentary:  
>    {  
>      "incident\_id": "QA-EP104-BEAT04-FAIL",  
>      "target\_component": "GoblinPuppet",  
>      "failure\_classification": "GEOMETRIC\_ANCHOR\_COLLISION",  
>      "telemetry": {  
>        "kinetic\_curve\_level": 9,  
>        "vertical\_drift\_pixels": \-24  
>      },  
>      "actionable\_fix": {  
>        "prop\_target": "mouthBoundingBox.y",  
>        "suggested\_patch\_delta": 24,  
>        "rationale": "Viseme layer separated from jaw anchor during Level 9 spring-zoom punch."  
>      }  
>    }

By binding the 6-Beat Kinetic Curve Table directly from Markdown prose into concrete Remotion TSX math, continuous audio mix automation and optical camera choreographies execute as reproducible software builds. This preserves narrative causality and physical timing across the studio fleet without introducing non-deterministic human editorial drift.

---

*User prompt: {{FOCUS:  3\. Track Topology & Decoupled Continuity }}(Series-Assets-Audio) /extreme-details*

Response: The **Track Topology & Decoupled Continuity** subsystem within series-assets-audio defines how multi-layered soundscapes are structured, scheduled, and mixed against programmatic visual plates. Operating under the studio's governing law that **audio is the architect of physical time while picture is an integer projection mapped to audio duration**, this architecture decouples the continuous temporal flow of the acoustic environment from the discrete, hard-cut boundaries of the visual timeline.

### **1\. The Master Physical Clock Axiom & Tripartite Priority Topology**

Remotion’s programmatic timeline models sound as three concurrent, prioritized layers mounted inside the component tree:

┌────────────────────────────────────────────────────────────────────────┐  
│ TRACK 1: SPOKEN DIALOGUE STEMS (High Priority / Fixed Master Clocks)   │  
│ • Uncompressed 48 kHz / 24-bit linear PCM WAVs synthesized via TTS     │  
│ • Quantized to 24 fps integer frames via ffprobe (target\_frames)       │  
│ • Locked to \-16.0 LUFS (±1.0 LUFS), True-Peak \<= \-1.0 dBTP             │  
├────────────────────────────────────────────────────────────────────────┤  
│ TRACK 2: SPOT FOLEY TRANSIENTS (Medium Priority / Synchronized Events) │  
│ • Punctual physical sound cues extracted from AST action nouns         │  
│ • Hard-panned spatial stereo snapped to Action Phase B or pre-roll     │  
│ • Resolved at compile time via Mulberry32 PRNG (MurmurHash3 \+ Salts)   │  
├────────────────────────────────────────────────────────────────────────┤  
│ TRACK 3: CONTINUOUS SOUND BED & SCORE (Low Priority / Attenuated)      │  
│ • Geometric texture loops (\<250 Hz centroid) or separated POD-16 stems │  
│ • Spans across hard visual cuts with linear crossfades                 │  
│ • Programmatically ducked by \-14 dB via Multi-Window Minimum Reducer   │  
└────────────────────────────────────────────────────────────────────────┘

#### **Track 1: Spoken Dialogue Stems (The Master Pacemaker)**

> * **The Invariant Timebase:** Spoken dialogue represents the highest acoustic priority and the immutable physical pacemaker for the entire production pipeline.  
> * **Acoustic Inspection:** Line stems synthesized by the local neural text-to-speech daemon (e.g., CosyVoice, Parler-TTS) are measured with an asynchronous ffprobe process to extract their exact continuous duration in milliseconds (*D*ms​).  
> * **Broadcast Compliance:** Stems must pass an automated conformance gate targeting an integrated loudness of **−16.0 LUFS** (±1.0 LUFS), an inter-sample True-Peak ceiling of **≤−1.0 dBTP**, and an unvoiced noise floor below **−60.0 dBFS** prior to timeline mounting.

#### **Track 2: Spot Foley Transients (Physical Action Anchors)**

> * **Diegetic Parity:** Spot Foley cues (e.g., boot squelches, valve drops, weapon draws) provide localized physical impacts.  
> * **Spatial Staging:** Cues are staged as hard-panned spatial stereo events snapped to explicit integer frame offsets parsed from screenplay AST action cues.  
> * **Frequency Allocation:** Transients are mixed to occupy the upper-mid frequency spectrum, isolating them from low-end ambient beds.

#### **Track 3: Continuous Sound Bed & Score (Atmospheric Foundation)**

> * **Acoustic Foundation:** Track 3 hosts low-priority continuous atmospheric loops (e.g., 40 Hz pipe drones, electrical transformer hums, rain on zinc) or isolated multi-track musical stems (Melodic, Harmonic, Percussive, Sub-bass) sourced from POD-16.  
> * **Dynamic Attenuation:** Track 3 yields dynamically to Track 1 dialogue via deterministic sidechain gain automation envelopes.

### **2\. The Decoupled Continuity Principle**

In conventional video editing, visual cuts, Foley hits, and background music are frequently spliced together on identical frame boundaries, creating an unnatural, mechanical rhythm. The pipeline resolves this by enforcing **Decoupled Continuity** between the visual and acoustic planes:

VISUAL TIMELINE (24 fps Integer Cuts via \<Sequence\>)  
\[      Shot 01 Plate (75f)      \]\[          Shot 02 Plate (90f)          \]  
▲                               ▲                                        ▲  
Hard Cut (Frame 0\)              Hard Cut (Frame 75\)                      Hard Cut (Frame 165\)

ACOUSTIC TIMELINE (Continuous 48 kHz Domain)  
Track 1: \[--- Dialogue 01 \---\]                  \[--- Dialogue 02 \---\]  
Track 2:        \[\*scrape\*\]                             \[\*squelch\*\]  
Track 3: ══════════════════════════╦══════════════════════════════════════  
         Bed A (Ambient Hum)       ║ Linear Crossfade (Frames 69–81)  
                                   ╚══════════════════════════════════════  
                                             Bed B (Machinery Drone)

#### **Directorial Hard Cuts vs. Continuous Acoustic Breathing**

> * **Visual Axiom:** Under the *chosisme* directorial guidelines, visual transitions such as dissolves, alpha wipes, and optical eases are explicitly banned. Video plates cut on hard beat boundaries inside Remotion \<Sequence\> layout primitives.  
> * **Acoustic Counterpoint:** While the camera cuts instantly to a new angle or focal length, the diegetic room tone on Track 3 does not drop or splice abruptly. Continuous atmospheric sound beds span across multiple visual shots and scenes, allowing the acoustic space to breathe uninterrupted.

#### **Crossfade Implementation Mechanics**

When narrative beats shift environments (e.g., moving from a subterranean culvert to an open drainage slough), ambient beds crossfade across scene transitions.

> * Because Remotion’s native \<Audio loop\> primitive requires the source's exact duration to loop cleanly and cannot natively crossfade arbitrary files, crossfades are achieved by mounting two distinct \<AmbientTrack\> components across an overlapping boundary window:  
>   Window=\[*f*cut​−Δ*f*fade​,*f*cut​\+Δ*f*fade​\]  
> * Complementary linear gain curves ensure constant acoustic power across the visual cut:  
>   *V*outgoing​(*f*)=*V*base​×(1.0−2⋅Δ*ff*−(*f*cut​−Δ*f*)​)  
>   *V*incoming​(*f*)=*V*base​×(2⋅Δ*ff*−(*f*cut​−Δ*f*)​)

### **3\. The Dual-Domain Clock & The 2,000-Sample Constant**

Temporal execution spans two synchronized domains to prevent sub-frame phase cancellation and cut jitter:

AUDIO DOMAIN (Sample-Accurate Physical Clock: 48,000 samples/sec)  
│  
├── Sub-millisecond acoustic transients  
├── Phoneme and viseme onset markers (e.g., Sample S \= 26,742)  
└── Continuous dynamic ducking envelopes (-14 dB speech window)  
│  
▼ Exact Ratio: S \= F \* (48,000 / 24\) \= F \* 2,000 samples/frame  
VIDEO DOMAIN (Master Media Timeline: 24 integer frames/sec)  
│  
├── Discrete Visual Cut Boundaries (Remotion \<Sequence\> timeline mounts)  
├── Total Shot Frame Budgets (target\_frames \= ceil(D\_ms \* 24 / 1000))  
└── ComfyUI Latent Diffusion Allocations (4n \+ 1 lattice conformance)

> * **The Audio Precision Clock:** Operates at an invariant sampling rate of **48,000 Hz** (48,000 linear PCM samples per second). It governs sub-millisecond acoustic transients, phoneme boundaries, viseme swaps, and ducking gain automation.  
> * **The Master Media Clock:** Operates on discrete integer video frames locked to **24.0 fps**. The duration of a single video frame is:  
>   Δ*t*frame​\=241​ s≈41.6667 ms  
> * **The Constant Projection Factor:** The ratio bridging the Audio Precision Clock to the Master Media Clock simplifies to an exact integer:  
>   24 frames/sec48,000 samples/sec​\=2,000 audio samples per video frame  
> * **Sample-to-Frame Mapping:** Any video frame *F* projects to an absolute audio sample coordinate:  
>   *S*\=*F*×2,000  
>   Conversely, any acoustic event, phoneme marker, or Foley transient detected at sample offset *S* maps to the nearest enclosing video frame via integer floor division:  
>   *F*\=⌊2,000*S*​⌋

**Worked Example:** A transient plosive detected via waveform analysis at sample offset *S*\=26,742 projects to video frame:

*F*\=⌊2,00026,742​⌋\=Frame 13

While the visual cut or mouth viseme is assigned to discrete Frame 13, the audio stem plays back with 48 kHz sample precision, eliminating perceived lip-sync lag or acoustic phasing artifacts.

### **4\. Absolute Timeline Placement vs. The Concatenation Trap**

Quantizing continuous audio stems to discrete 24 fps frames via ceiling arithmetic introduces up to 41.67 ms (one frame) of tail silence per cut. The pipeline strictly forbids concatenating audio stems sequentially end-to-end.

THE CONCATENATION TRAP (Linear Drift Accumulation)  
Shot 1 (74.1f \-\> 75f)     Shot 2 (89.2f \-\> 90f)     Shot 3 (50.1f \-\> 51f)  
\[ Stem 1 \]\[+0.9f pad\]     \[ Stem 2 \]\[+0.8f pad\]     \[ Stem 3 \]\[+0.9f pad\]  
├─────────────────────────┼─────────────────────────┼─────────────────────►  
Result: By Shot 100, audio has drifted \+4.17 SECONDS against continuous beds\!

ABSOLUTE TIMELINE PLACEMENT (Zero-Drift Tiling)  
fromFrame\_k \= ceil( (sum\_{i\<k} D\_i) / 1000 \* 24 )  
\[ Stem 1 (75f)           \]\[ Stem 2 (90f)           \]\[ Stem 3 (51f)        \]  
├─────────────────────────┴─────────────────────────┴─────────────────────►  
Result: Total episode drift is bounded to \< 1 frame (\< 41.67 ms) indefinitely\!

#### **The Concatenation Trap**

> * If an episode contains 100 shots and each rounded dialogue stem is concatenated end-to-end, the fractional ceiling pads linearly compound.  
> * An average per-shot drift of ≈0.5 frames (20.8 ms) accumulates into **50 frames (≈2.08 seconds)** of positive drift across a single episode, causing visual cuts, background music swells, and Foley cues to drift completely out of sync with dialogue.

#### **Absolute Timeline Formulation**

To eliminate cumulative sync drift, generate-episode-repo.ts decouples local shot generation budgets from master timeline placement:

> 1. **Cumulative Millisecond Quantization:** Timeline placements are derived from a running cumulative millisecond sum quantized once:  
>    Start*k*​\=⌈1000∑*i*\<*k*​*Di*​​×24⌉  
>    End*k*​\=⌈1000∑*i*≤*k*​*Di*​​×24⌉−1  
> 2. **Mathematical Proof of Contiguity:**  
>    End*k*​\+1=(⌈1000∑*i*≤*k*​*Di*​​×24⌉−1)\+1=⌈1000∑*i*≤*k*​*Di*​​×24⌉\=Start*k*\+1​  
>    Because End*k*​\+1≡Start*k*\+1​, consecutive lines tile the master timeline with zero gaps and zero overlaps.  
> 3. **Bounded Error Guarantee:** Total sequence drift relative to continuous physical audio is mathematically clamped to less than one single frame (\<41.67 ms) across an entire episode, regardless of shot count:

| Lines in Scene | Per-Line Ceiling: Mean Drift / Max (Frames) | Cumulative Quantization: Mean Drift / Max (Frames) |
| :---- | :---- | :---- |
| **1** | 0.50 / 1.00 | **0.50 / 1.00** |
| **6** | 3.00 / 5.38 | **0.50 / 1.00** |
| **12** | 6.01 / 10.09 | **0.50 / 1.00** |
| **24** | 11.97 / 17.06 | **0.50 / 1.00** |

### **5\. Programmatic Ducking Automation (AmbientTrack.tsx)**

To maintain absolute vocal intelligibility without relying on non-deterministic, signal-reactive analog compressor plugins during headless rendering, Track 3 executes deterministic, timeline-keyed mathematical gain envelopes.

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

#### **The Mathematical Attenuation Invariant**

During an active dialogue window \[*f*start​,*f*end​\], background beds attenuate by a strict **−14 dB**. The ducked gain floor (*V*duck​) is calculated dynamically from the base volume (*V*base​) using decibel power conversion:

*V*duck​\=*V*base​×1020attenuation\_dB​\=0.40×1020−14​≈0.40×0.1995≈0.0798

#### **Envelope Geometry**

> * **Quadratic Attack Phase (*A*\=6 frames,≈250 ms):** Precedes the dialogue onset (*f*start​−*A*≤*f*\<*f*start​), smoothly ramping down gain via Easing.out(Easing.quad).  
> * **Active Dialogue Window (*f*start​≤*f*≤*f*end​):** Gain holds statically at the *V*duck​ floor.  
> * **Quadratic Release Phase (*R*\=12 frames,≈500 ms):** Follows dialogue conclusion (*f*end​\<*f*≤*f*end​\+*R*), recovering smoothly back to *V*base​ via Easing.in(Easing.quad).

#### **The Multi-Window Minimum Reducer (Anti-Pumping Architecture)**

A primary vulnerability in automated gain staging is the "envelope pumping bug". If an implementation loops through dialogue windows and uses an early break statement upon the first match, a gap shorter than the combined release and attack ramps (e.g., a 6-frame breath pause between sentences) triggers the release branch of Window 1, causing the background bed to abruptly swell before violently dipping on Window 2\.

The canonical calculateDuckedGain implementation eliminates this by evaluating all dialogue windows simultaneously across the scene and applying a Math.min() union composition:

// AmbientTrack.tsx: Multi-window minimum-composed sidechain ducking  
import React from 'react';  
import { Audio, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';

export interface DialogueWindow {  
  from: number;  
  to: number;  
}

export interface AmbientTrackProps {  
  src: string;  
  baseVolume: number;  
  attenuationDb: number;  
  activeDialogueWindows: DialogueWindow\[\];  
  silences?: { fromFrame: number; toFrame: number; duckAmbientDb: number }\[\];  
}

export const calculateDuckedGain \= (  
  frame: number,  
  baseVolume: number,  
  attenuationDb: number,  
  windows: DialogueWindow\[\],  
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

export const AmbientTrack: React.FC\<AmbientTrackProps\> \= ({  
  src,  
  baseVolume,  
  attenuationDb,  
  activeDialogueWindows,  
  silences \= \[\],  
}) \=\> {  
  const currentFrame \= useCurrentFrame();

  // 1\. Calculate sidechain ducking against dialogue windows  
  let resolvedVolume \= calculateDuckedGain(  
    currentFrame,  
    baseVolume,  
    attenuationDb,  
    activeDialogueWindows  
  );

  // 2\. Process intentional narrative silences (e.g., \-24 dB holds)  
  for (const silence of silences) {  
    if (currentFrame \>= silence.fromFrame && currentFrame \<= silence.toFrame) {  
      resolvedVolume \= resolvedVolume \* Math.pow(10, silence.duckAmbientDb / 20);  
      break;  
    }  
  }

  return (  
    \<Audio  
      src={staticFile(src)}  
      volume={resolvedVolume}  
      loop  
    /\>  
  );  
};

### **6\. Source-Baking Invariant & Verification Contract**

To guarantee Level 3 Decoded Media Equivalence across distributed render clusters, all track assignments, timeline offsets, and resolved sample paths are baked at generation time via generate-episode-repo.ts into Episode\_XXX.tsx:

// ep040/src/Episode\_040.tsx (Excerpt: Source-Baked Multi-Track Audio Layout)  
export const Episode\_040 \= () \=\> {  
  return (  
    \<\>  
      {/\* Track 3: Continuous Ambient Sound Bed (Spans across all shots) \*/}  
      \<AmbientTrack  
        src="audio/ambient/culvert\_drone\_40hz.wav"  
        baseVolume={0.40}  
        attenuationDb={-14.0}  
        activeDialogueWindows={\[  
          { from: 8, to: 83 },    // Shot 01 Dialogue Window  
          { from: 104, to: 194 }, // Shot 02 Dialogue Window  
        \]}  
        silences={\[  
          { fromFrame: 84, toFrame: 103, duckAmbientDb: \-24.0 } // Realization Hold  
        \]}  
      /\>

      {/\* Visual & Audio Shot 01: Frame 0 to 99 \*/}  
      \<Sequence from={0} durationInFrames={99}\>  
        \<CharacterPlate src={staticFile("renders/ep040\_sh01.mp4")} /\>  
          
        {/\* Track 1: Master Spoken Dialogue Stem \*/}  
        \<Sequence from={8} durationInFrames={75}\>  
          \<Audio src={staticFile("audio/dialogue/ep040\_sh01\_bog.wav")} volume={1.0} /\>  
        \</Sequence\>

        {/\* Track 2: Punctual Spot Foley Transients (Source-Baked String Literal) \*/}  
        \<Sequence from={4} durationInFrames={72}\>  
          \<Audio src={staticFile("audio/foley/pipe\_clang\_02.wav")} volume={0.65} /\>  
        \</Sequence\>  
      \</Sequence\>  
    \</\>  
  );  
};

By converting abstract screenplay AST directives into concrete, statically baked TypeScript literals:

> 1. **Zero Render-Time Randomness:** The Mulberry32 PRNG runs exclusively during code generation; render-time headless browser workers evaluate pure static strings, making thread concurrency irrelevant to acoustic determinism.  
> 2. **Permanent Offline Replay:** Because the composition references static files locally via staticFile(), an episode can be checked out decades later and re-rendered with bit-for-bit acoustic reproducibility, fulfilling the core architectural promise of series-assets-audio.

---

*User prompt: {{FOCUS:  1\. Semantic Prosodic Exclusion Filters (banned\_cadences) (Series-Assets-Audio) }} /extreme-details*

### **Response: 1\. Architectural Mandate & The *T*0​ Fail-Fast Economic Perimeter**

The **Semantic Prosodic Exclusion Filters (banned\_cadences)** subsystem within series-assets-audio operates as an automated pre-flight firewall at the boundary between semantic dramatic intent (**Axis A: Meaning**) and acoustic rendering (**Axis B: Representation**). In an event-sourced production fleet governed by the formal four-tuple ⟨S,A,I,R*m*​⟩, Large Language Models (LLMs) and neural Text-to-Speech (TTS) vocoders are untrusted execution workers with zero authority over canonical biological truth.

SCREENPLAY AST (dialogue\_ast.json from worker-sower-engine)  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ PRE-FLIGHT COMPILATION GATE (T0 \= \$0.00 COMPUTE COST)                 │  
│ • Validates Vocal-Motor Feasibility Theorem                            │  
│ • Evaluates AST Delivery Directives ∩ Character banned\_cadences        │  
│ • Inspects Relational Ledger Somatic Trauma State (Pulmonary / Larynx) │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
            ┌────────────────┴────────────────┐  
            ▼                                 ▼  
      \[DISCREPANCY\]                     \[VALIDATED\]  
    HALT: Exit Code 1                         │  
VOCAL\_DELIVERY\_BREACH                         ▼  
                             Ingress to audio-microservice (:8000)  
                             (Pure CPU / 0 MB GPU VRAM Allocation)

> * **The Problem of "The Beige Plague":** Neural autoregressive vocoders (e.g., CosyVoice, Parler-TTS, Piper) inherently suffer from regression toward the statistical median of their training datasets. When prompted with emotional dialogue, unconstrained models default to homogenized, upbeat, or bouncy cadence templates—such as cheerful radio-announcer inflections or generic rising interrogative pitch contours—even when character health or narrative stakes demand exhaustion or despair.  
> * **The Economic Fail-Fast Law (*T*0​\=\$0.00):** Intercepting prosodic violations during the intermediate representation (IR) compilation pass aborts invalid jobs before opening network sockets, dispatching inference requests to the local Python microservice on port 8000, or burning GPU cycles on Rig 2 diffusion plates.  
> * **The Pacing Decoupling Axiom:** Spoken dialogue is the non-negotiable physical pacemaker of the production pipeline; its duration (*D*ms​) measured via ffprobe establishes the discrete 24 fps integer video cut budget via ⌈(*D*ms​/1000)×24⌉. If a damaged character slips into an unauthorized rapid cadence, line duration artificially contracts, causing downstream visual exposure sheets to truncate reaction plates and destroy dramatic timing.

### **2\. Formal Mathematical Invariant: The Vocal-Motor Feasibility Theorem**

Before any audio worker evaluates a delivery style, the pipeline runs a mathematical feasibility check across the entity's physiological ledger state:

*c*.has\_verbal\_directives⟹("mute"∈/*c*.conditions∧"speak"∈/*c*.banned\_kinetic\_verbs)

If an entity’s canonical status in the SQLite/D1 state ledger records irreversible laryngeal trauma, a crushed trachea, or acute asphyxiation, any downstream attempt to assign spoken dialogue triggers an immediate VOCAL\_DELIVERY\_BREACH.

When verbal capability is intact, the gate evaluates the intersection of the proposed delivery profile against the character’s locked exclusion vector:

Δprosody​\=(DirectivesAST​∪InferredStyle(Prose))∩Recipe.banned\_cadences  
Δprosody​\=∅⟹HALT\_REJECT(Exit Code 1)

Because this evaluation is deterministic, it is classified as a **Class 1 Deterministic Failure**. Under the studio's error taxonomy, Class 1 failures strictly forbid automated retries (*N*max​\=0): identical corrupted inputs will yield identical failures, halting the pipeline instantly to preserve compute resources.

### **3\. Machine Schema & The Enumerated Prosodic Taxonomy**

Inside voices/\<series\_slug\>/voice\_manifest.json, the banned\_cadences property is declared as a validated JSON array of closed enum tokens adhering to the studio's central audio recipe schema (\[https://specs.studio.internal/schemas/v2/voice\_recipe.json\](https://specs.studio.internal/schemas/v2/voice\_recipe.json)):

{  
  "\$schema": "https://specs.studio.internal/schemas/v2/voice\_recipe.json",  
  "character\_id": "CHAR\_BOG\_01",  
  "series\_slug": "under-the-floorboards",  
  "checkpoint": {  
    "tts\_engine": "Piper-ONNX",  
    "model\_repo": "rhasspy/piper-voices/en\_US-lessac-medium",  
    "weights\_sha256": "3e9b1a0f8c2b4d6e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",  
    "quantization": "INT8"  
  },  
  "banned\_cadences": \[  
    "RAPID\_STACCATO",  
    "RISING\_INFLECTION\_INTERROGATIVE",  
    "CHEERFUL\_MODULATION",  
    "UPBEAT\_LILT",  
    "SING\_SONG\_RESONANCE"  
  \],  
  "base\_dsp\_modifiers": {  
    "basePitchShiftSemitones": 3.8,  
    "formantWarpingFactor": 0.86,  
    "speedScalar": 1.18,  
    "baseBreathiness": 1.25,  
    "baseVocalFry": 0.05  
  }  
}

#### **Closed Enum Definitions & Biological Mechanics**

| Cadence Enum Identifier | Prohibited Acoustic Characteristics | Biological / Psychological Pathological Trigger |
| :---- | :---- | :---- |
| RAPID\_STACCATO | Short syllable durations (\<80 ms), zero inter-clause pause insertion, high-velocity consonant attacks. | **Pulmonary Damage / Gas Inhalation:** Severe diaphragmatic fatigue or pulmonary fibrosis (severity≥0.70) prevents rapid subglottal pressure recharge. |
| RISING\_INFLECTION\_INTERROGATIVE | High-register terminal fundamental frequency glides (+4.0 to +8.0 semitones) on declarative sentence endings. | **Authoritative Posture / Total Exhaustion:** Banned for high-status, menacing characters or utterly beaten entities whose subglottal pressure decays to zero at line tails. |
| CHEERFUL\_MODULATION | Wide fundamental frequency variance (*σF*0​​\>45 Hz), high pitch agility, bright harmonic overtone excitation. | **Somatic Shock / Depressive Trauma:** Trauma conditions lock vocal cords into rigid, hypokinetic physical patterns, eliminating melodic variance. |
| UPBEAT\_LILT | Rhythmic anapestic or dactylic stress skipping with ascending phrase onsets. | **Existential Dread / Paranoia Clocks:** In settings with systemic dread, lilts violate world tone, signaling unearned comedic buoyancy. |
| BREATHLESS\_WHISPER | Pure unvoiced fricative turbulence without glottal vibration (*F*0​\=0 Hz across \>70% of frames). | **Acoustic Noise Floor Collapse:** Barred in high-SPL environments where whisper amplitude drops below the −60 dBFS noise floor gate or fails audibility formulas. |
| SING\_SONG\_RESONANCE | Sustained vowel durations holding stationary pitches with pitch drift \<0.1 semitones across \>250 ms. | **Acoustic Realism Mandate:** Banned across all dramatic universes to eradicate cartoon-like nursery delivery patterns native to cheap synthetic vocoders. |

### **4\. Somatic Coupling & Compounded DSP Transformations**

The banned\_cadences filter operates alongside algebraic Digital Signal Processing (DSP) modifiers. When canonical somatic trauma is registered in the narrative ledger, the engine derives runtime modifier deltas that enforce the physical exclusion:

NARRATIVE LEDGER: Pulmonary Damage Severity \= 0.70  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ SOMATIC-TO-ACOUSTIC TRANSLATION PASS                                   │  
│ • Injects breathinessPauseMultiplier: 2.2                              │  
│ • Scales pause\_frequency\_multiplier: 1.40                              │  
│ • Compounded breath dilation: Pi\_eff \= baseBreathiness \* (1 \+ 1.40\*S^2)│  
│ • Appends "RAPID\_STACCATO" and "UPBEAT\_LILT" to banned\_cadences        │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STT & ACOUSTIC REDACTION VERIFICATION (Pre-Conform Gate)              │  
│ • Asserts intra-phrase breathing gaps \>= 180 ms                        │  
│ • Confirms zero phrase runs exceeding 6 consecutive words              │  
└────────────────────────────────────────────────────────────────────────┘

> 1. **Breath Interval Dilation (Πeff​):** When pulmonary severity hits 0.70, breathinessPauseMultiplier scales to 2.2, forcing the vocoder to inject breathing silences between clauses. If the upstream AST attempts to circumvent this by marking a line as "pacing": "unbroken\_rush", the banned\_cadences filter catches the conflict and rejects the payload.  
> 2. **Clause Truncation Enforcement:** Characters under acute respiratory distress have their dialogue word budget capped via the curtness transformation:  
>    *W*max​(*C*)=max(2,⌊24.0−18.0×*C*⌋)  
>    At high curtness (*C*≥0.75⟹*W*max​≤10 words), long continuous clauses cannot compile. Any prosodic pattern requiring continuous vocalization without mid-sentence inhalation violates the character's active physical state.

### **5\. The Verification Gauntlet: Acoustic Redaction Battery (Tier 3\)**

Conformance to prosodic exclusion is verified post-synthesis through the **Acoustic Redaction Battery (Tier 3 Conformance)**:

RAW PCM BUFFER (48 kHz / 24-bit WAV from Port 8000\)  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ ACOUSTIC REDACTION MODULE                                              │  
│ • Applies WSOLA Pitch-Shift: Transposes F0 to flat 120 Hz mono-tone    │  
│ • Applies LPC Spectral Whitening: Flattens formants (F1, F2, F3)       │  
│ • Output: Dematrixed Acoustic Silhouette (Timbre Completely Removed)  │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ CADENCE AUDITOR / CLASSIFIER                                           │  
│ • Measures Consonant-Attack Velocity: d(RMS)/dt at onsets              │  
│ • Measures Pause-to-Speech Ratio (P2SR) and Syllabic Duration          │  
│ • Asserts Prohibited Prosodic Templates are Absent (P(Cadence) \< 0.05) │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
            ┌────────────────┴────────────────┐  
            ▼                                 ▼  
         \[FAIL\]                            \[PASS\]  
Re-synthesize (PRNG Salt: retry)   Proceed to Filter 2  
(Circuit trips at N\_max \= 2\)       (Pre-Conform Spectral Hygiene)

> 1. **Timbral Neutralization:** The raw 48 kHz / 24-bit linear PCM buffer is stripped of superficial timbral color. Waveform Similarity Overlap-Add (WSOLA) pitch-shifts the fundamental frequency to a flat baseline, while Linear Predictive Coding (LPC) inverse filtering flattens the character’s unique formant structure.  
> 2. **Structural Rhythmic Inspection:** The auditor evaluates the remaining structural skeleton: prosodic contour, syllable pacing, pause frequency distributions, and consonant-attack velocities (*d*(RMS)/*dt*).  
> 3. **Acoustic Redaction Invariant:** An auditor inspecting the performance in total acoustic darkness must identify the speaker's canonical cadence based on timing rhythm alone, while confirming the absence of banned cadential structures:  
>    *P*(Cadence∈banned\_cadences)\<0.05  
>    If a character barred from RAPID\_STACCATO exhibits an average syllabic duration below 95 ms across five consecutive tokens, the stem is rejected with a PROSODIC\_EXCLUSION\_LEAK.

### **6\. Multi-Series Concrete Parametric Case Studies**

Because series-assets-audio segregates asset definitions into dedicated series vaults (voices/\<series\_slug\>/), prosodic exclusion rules adapt to divergent physical realities across the fleet:

#### **Case Study A: *Under the Floorboards* (Domestic Goblin Setting)**

> * **Acoustic Axiom:** Neurotic, high-strung, compressed domestic farce beneath floorboards.  
> * **Engine:** Piper-ONNX (VITS architecture, pure CPU execution, 0 MB VRAM).  
> * **Character:** Bog (Chronic anxiety, diaphragmatic exhaustion).

{  
  "character\_id": "BOG",  
  "series\_slug": "under-the-floorboards",  
  "banned\_cadences": \[  
    "CHEERFUL\_MODULATION",  
    "UPBEAT\_LILT",  
    "SOOTHING\_LEGATO",  
    "STATELY\_DECLAMATION"  
  \],  
  "base\_dsp\_modifiers": {  
    "basePitchShiftSemitones": 3.8,  
    "formantWarpingFactor": 0.86,  
    "speedScalar": 1.18,  
    "baseBreathiness": 1.25  
  }  
}

> * **Operational Behavior:** Bog is permitted rapid, clipped, staccato delivery, but strictly prohibited from SOOTHING\_LEGATO or CHEERFUL\_MODULATION. Any script generation attempting to resolve Bog’s panic with casual emotional comfort is terminated at compile time.

#### **Case Study B: *Wiregrass Basin* (Southern Gothic Industrial Noir)**

> * **Acoustic Axiom:** Atmospheric decay, heavy vocal fry, toxic herbicide runoff, laryngeal scarring.  
> * **Engine:** Parler-TTS (Mini-v0.1, Autoregressive Transformer with natural language conditioning).  
> * **Character:** The Pilot (Severe chemical emphysema, terminal respiratory fatigue).

{  
  "character\_id": "THE\_PILOT",  
  "series\_slug": "wiregrass-basin",  
  "banned\_cadences": \[  
    "RAPID\_STACCATO",  
    "RISING\_INFLECTION\_INTERROGATIVE",  
    "ENERGETIC\_CRESCENDO",  
    "CHEERFUL\_MODULATION"  
  \],  
  "base\_dsp\_modifiers": {  
    "basePitchShiftSemitones": \-3.2,  
    "formantWarpingFactor": 1.15,  
    "speedScalar": 0.78,  
    "baseBreathiness": 1.95,  
    "baseVocalFry": 0.65  
  }  
}

> * **Operational Behavior:** Due to severe lung deterioration, The Pilot is barred from RAPID\_STACCATO and ENERGETIC\_CRESCENDO. The model is forced to deliver slow, dragging syllables with heavy glottal fry. If an upstream LLM drafts an action sequence where The Pilot shouts rapid tactical orders, the pre-flight compiler catches the conflict, rejecting the AST before audio synthesis or video generation begins.

---

*User prompt: {{FOCUS:  2\. The Phonetic Firewall Architecture (lexicon.json) (Series-Assets-Audio) }} /extreme-details*

Response: The **Phonetic Firewall Architecture (lexicon.json)** within series-assets-audio is the deterministic pre-inference normalization subsystem that intercepts verbatim screenplay text and standardizes pronunciation before token strings are dispatched to neural speech synthesis engines.

Operating at the boundary between semantic text (**Axis A: Meaning**) and physical acoustic waveforms (**Axis B: Representation**), the phonetic firewall resolves a core tension in generative voice engineering: neural vocoders do not read language semantically, but instead map characters or phonemes to acoustic frames via learned latent embeddings and internal Grapheme-to-Phoneme (G2P) rule-sets. Without an authoritative phonetic contract, bespoke worldbuilding terms, fantasy dialects, technical telemetry, and colloquial contractions trigger severe phonetic hallucinations, cadential collapse, and master clock desynchronization.

### **1\. Operational Mandate & Neural G2P Structural Failure Modes**

Standard out-of-the-box G2P models (such as CMUdict, eSpeak-NG, or g2p-en) are designed for generalized lexical vocabularies. When deployed across episodic fiction featuring proprietary lore, they exhibit four failure modes that corrupt downstream pipelines:

                  G2P FAILURE MODES IN GENERATIVE PIPELINES  
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐  
│ 1\. OOV ORTHOGRAPHIC HALLUCINATIONS   │  │ 2\. DIALECTAL CADENCE COLLAPSE        │  
│ • Invented fantasy/sci-fi lemmas     │  │ • Flattening regional vernacular     │  
│ • Unpredictable syllabic splitting   │  │ • Staccato splitting of elisions     │  
│ • Erratic lexical stress placement   │  │ • Loss of authentic subtext/drawl    │  
└──────────────────┬───────────────────┘  └──────────────────┬───────────────────┘  
                   │                                         │  
                   ▼                                         ▼  
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐  
│ 3\. THE NLP SLUR COLLISION HAZARD     │  │ 4\. TEMPORAL MASTER CLOCK DRIFT       │  
│ • Vernacular flagged by cloud filters│  │ • Unvetted words alter duration (D\_ms│  
│ • Automated safety pipeline shutdowns│  │ • Inconsistent 24 fps frame budgets  │  
│ • False-positive API rejections      │  │ • Truncated downstream visual plates │  
└──────────────────────────────────────┘  └──────────────────────────────────────┘

> * **Out-of-Vocabulary (OOV) Orthographic Hallucinations:** Invented nouns (such as *"Snerk"*, *"Gallbreaker"*, or *"hydrazine"*) do not exist in default pronunciation dictionaries. Fallback heuristic algorithms guess letter-to-sound mappings, resulting in unpredictable stress placement, split diphthongs, or dropped syllables across different generation takes.  
> * **Dialectal Cadence Collapse:** Standard TTS engines normalize colloquial spellings into generic American English pronunciation. Regional drawls are flattened, and dialectal elisions are misinterpreted (e.g., parsing the colloquial contraction *"d'you"* into two distinct, staccato tokens *"d"* and *"you"*).  
> * **The NLP Slur Collision Hazard:** In scriptwriting pipelines involving large language models, writing heavy vernacular contractions directly into dialogue prose creates severe safety hazards. Cloud language model guardrails and API safety filters frequently misinterpret phonetically spelled colloquial speech as offensive slurs or profanity, causing pipeline shutdowns. The phonetic firewall solves this by enforcing an architectural invariant: **screenplay prose must remain grammatically readable while acoustic phonetic expansion is isolated to the local ingestion layer**.  
> * **Temporal Drift via Variable Syllabification:** If an engine stumbles over an unvetted word, it may stretch vowels or insert hesitation pauses. Because continuous audio duration (*D*ms​) measured via ffprobe establishes the physical master clock (24 fps integer video cut frames via ⌈(*D*ms​/1000)×24⌉), non-deterministic pronunciation directly destabilizes downstream visual frame budgets and optical sidechain ducking envelopes.

### **2\. The Four-Stage Pre-Inference Normalization Pipeline**

Located at voices/\<series\_slug\>/lexicon.json, the phonetic dictionary acts as an isolated sandbox executed by audio-microservice prior to vocoder tensor allocation. The engine executes a four-stage normalization pipeline:

RAW SCRIPT INGRESS (dialogue\_text: "The siphon wrench is under the culvert.")  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 1: REGEX SYNTACTIC EXPANSION                                     │  
│ • Applies ordered PCRE regex with word-boundary isolation (\\b)         │  
│ • Expands colloquial elisions, technical metrics, and abbreviations    │  
│ • Transforms prose safely without triggering upstream safety filters   │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 2: CASE-INSENSITIVE LEXICAL TOKENIZATION                         │  
│ • Splits normalized text into lexical lemmas and punctuation tokens   │  
│ • Isolates and preserves terminal punctuation (?, \!, .) for prosody   │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 3: PHONETIC LEXICON OVERRIDE LOOKUP                              │  
│ • Strips punctuation for lookup against phonetic\_rules keys            │  
│ • Hit: Replaces token with phonetic string or ARPAbet phoneme sequence │  
│ • Miss: Passes token untouched to the engine's default G2P fallback    │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 4: ENGINE-SPECIFIC PHONEME ADAPTATION                            │  
│ • Piper/ONNX: Maps directly to internal phoneme ID tokens              │  
│ • CosyVoice: Injects SSML/phoneme wrappers (\<phoneme ph="..."\>)        │  
│ • Parler-TTS: Generates phonetically spelled syllables with caps stress│  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
         DISPATCHED TO NEURAL SYNTHESIS ENGINE (float32 PCM 48 kHz)

#### **Stage 1: Regex Syntactic & Dialect Expansion**

The engine iterates through the regex\_replacements array sequentially. Rules enforce strict word-boundary isolation (\\b) to prevent substring collisions (e.g., ensuring a rule for "in" does not alter the interior of "siphon"). This stage expands colloquial elisions, technical telemetry units (e.g., converting "12 kpa" to "12 KIL-oh-pas-kahlz"), and dimensional measurements.

#### **Stage 2: Case-Insensitive Lexical Tokenization**

The expanded string is tokenized into word units while isolating terminal punctuation (., ,, \!, ?, —). Punctuation marks are preserved because neural vocoders rely on them to condition terminal pitch inflections, breath cadences, and phrase-final lengthening.

#### **Stage 3: Phonetic Lexicon Override Lookup**

Stripped lexical tokens are evaluated against the phonetic\_rules dictionary using case-insensitive matching. If an exact match is discovered, the raw token is replaced with the target phonetic string (formatted according to the series' designated phonetic\_alphabet). Unmatched tokens are retained in their natural orthographic spelling for processing by the engine's internal dictionary.

#### **Stage 4: Engine-Specific Phoneme Adaptation**

The normalized phoneme stream is adapted to the target TTS engine runtime declared in voice\_manifest.json:

> * **Piper (VITS / ONNX):** Converts phonemes directly into integer token IDs utilizing the model's internalized eSpeak-NG phoneme mapping matrix.  
> * **CosyVoice-300M:** Formats the target phonemes as structured SSML tags (e.g., \<phoneme ph="s aɪ 1 f ʌ n"\>siphon\</phoneme\>), instructing the flow-matching diffusion network to condition on exact IPA vectors.  
> * **Parler-TTS:** Formats the phonetic representations as capitalized syllable stress strings (e.g., "SAI-fun"), which the autoregressive text encoder processes reliably.

### **3\. Machine Contracts: Schema Specification & Runtime Validation**

Every series lexicon must pass strict validation against lexicon.schema.json at build time. To prevent accidental schema mutations or unvetted configuration fields, the JSON Schema enforces additionalProperties: false across all objects.

#### **Authoritative JSON Schema (lexicon.schema.json)**

{  
  "\$schema": "https://json-schema.org/draft/2020-12/schema",  
  "title": "SeriesLexiconSchema",  
  "type": "object",  
  "required": \[  
    "schema\_version",  
    "series\_slug",  
    "phonetic\_alphabet",  
    "phonetic\_rules",  
    "regex\_replacements"  
  \],  
  "additionalProperties": false,  
  "properties": {  
    "schema\_version": {  
      "type": "string",  
      "enum": \["2.0.0"\]  
    },  
    "series\_slug": {  
      "type": "string",  
      "pattern": "^\[a-z0-9\]+(-\[a-z0-9\]+)\*\$"  
    },  
    "phonetic\_alphabet": {  
      "type": "string",  
      "enum": \["ARPABET", "IPA", "CUSTOM\_STRESS\_EXPANSION"\]  
    },  
    "phonetic\_rules": {  
      "type": "object",  
      "description": "Exact case-insensitive token mapping to target pronunciation",  
      "additionalProperties": {  
        "type": "string",  
        "minLength": 1  
      }  
    },  
    "regex\_replacements": {  
      "type": "array",  
      "description": "Ordered sequence of non-destructive syntactic expansions",  
      "items": {  
        "type": "object",  
        "required": \["pattern", "replacement", "description"\],  
        "additionalProperties": false,  
        "properties": {  
          "pattern": {  
            "type": "string",  
            "description": "PCRE-compliant regular expression with word boundaries"  
          },  
          "replacement": {  
            "type": "string"  
          },  
          "description": {  
            "type": "string"  
          },  
          "case\_sensitive": {  
            "type": "boolean",  
            "default": false  
          }  
        }  
      }  
    },  
    "banned\_pronunciations": {  
      "type": "object",  
      "description": "Negative assertions: target word mapped to banned phonetic outputs",  
      "additionalProperties": {  
        "type": "array",  
        "items": { "type": "string" }  
      }  
    }  
  }  
}

#### **Runtime Zod Contract (src/types/lexicon.ts)**

The orchestrator on Rig 1 validates the JSON file using Zod before registering it with the active build graph:

import { z } from "zod";

export const RegexReplacementSchema \= z.object({  
  pattern: z.string().min(1),  
  replacement: z.string(),  
  description: z.string(),  
  case\_sensitive: z.boolean().default(false),  
}).strict();

export const SeriesLexiconSchema \= z.object({  
  schema\_version: z.literal("2.0.0"),  
  series\_slug: z.string().regex(/^\[a-z0-9\]+(-\[a-z0-9\]+)\*\$/),  
  phonetic\_alphabet: z.enum(\["ARPABET", "IPA", "CUSTOM\_STRESS\_EXPANSION"\]),  
  phonetic\_rules: z.record(z.string(), z.string()),  
  regex\_replacements: z.array(RegexReplacementSchema),  
  banned\_pronunciations: z.record(z.string(), z.array(z.string())).optional(),  
}).strict();

export type SeriesLexicon \= z.infer\<typeof SeriesLexiconSchema\>;  
export type RegexReplacement \= z.infer\<typeof RegexReplacementSchema\>;

### **4\. Tri-Series Parametric Case Studies & Multi-Alphabet Implementations**

Because series are strictly partitioned under top-level repository namespaces (voices/\<series\_slug\>/), lexicons never contaminate sibling universes. A pronunciation rule in *Under the Floorboards* has zero visibility in *Wiregrass Basin* or *Deep Space Salvage*.

                  SERIES NAMESPACE ISOLATION  
                    
voices/  
├── under-the-floorboards/  
│   └── lexicon.json  ──► "siphon" \-\> "SAI-fun" (Custom Stress)  
│  
├── wiregrass-basin/  
│   └── lexicon.json  ──► "culvert" \-\> "KULL-vert" (Custom Stress)  
│  
└── deep-space-salvage/  
    └── lexicon.json  ──► "apogee" \-\> "AE1 P AH0 JH IY0" (ARPABET)

#### **Case Study A: Domestic Goblin Farce (voices/under-the-floorboards/lexicon.json)**

> * **World Axiom:** Fast, anxious, clipped domestic goblin farce set beneath kitchen floorboards.  
> * **Phonetic Alphabet:** CUSTOM\_STRESS\_EXPANSION.  
> * **Strategy:** High-pitched, clipped consonant emphasis, stress on front-of-mouth plosives.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "under-the-floorboards",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "siphon": "SAI-fun",  
    "snerk": "SNERK",  
    "grissel": "GRIZ-zul",  
    "marrow-bone": "MAIR-oh-BOHN",  
    "floor-timbers": "FLOR-TIM-berz",  
    "skitter": "SKIT-ter",  
    "tallow": "TAL-oh",  
    "peevish": "PEE-vish"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(d'you)\\\\b",  
      "replacement": "dyoo",  
      "description": "Contracts 'd'you' to quick goblin dental glide"  
    },  
    {  
      "pattern": "\\\\b(gotta)\\\\b",  
      "replacement": "GAHT-tuh",  
      "description": "Forces clipped staccato on glottal stop"  
    },  
    {  
      "pattern": "\\\\b(underneath)\\\\b",  
      "replacement": "un-ner-NEETH",  
      "description": "Flattens 'd' sound for subterranean colloquial speech"  
    },  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(in|inch|inches)\\\\b",  
      "replacement": "\$1 IN-chez",  
      "description": "Expands dimensional measurements for hoarded items"  
    }  
  \],  
  "banned\_pronunciations": {  
    "siphon": \["SEE-fon", "sih-FON"\],  
    "grissel": \["GRIZ-lee", "gray-SEL"\]  
  }  
}

#### **Case Study B: Southern Gothic Noir (voices/wiregrass-basin/lexicon.json)**

> * **World Axiom:** Southern Gothic industrial noir, chemical defoliant runoff, heavy vocal fry, and laryngeal wear.  
> * **Phonetic Alphabet:** CUSTOM\_STRESS\_EXPANSION.  
> * **Strategy:** Elongated diphthongs, dropped terminal nasals, dark unreleased plosives.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "wiregrass-basin",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "culvert": "KULL-vert",  
    "gallbreaker": "GAWL-bray-ker",  
    "creosote": "KREE-uh-soht",  
    "slough": "SLOO",  
    "diesel": "DEEZ-ul",  
    "spurl": "SPERL",  
    "defoliant": "dee-FOH-lee-unt",  
    "wiregrass": "WY-er-grass"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(ain't)\\\\b",  
      "replacement": "aynt",  
      "description": "Standardizes dialect negation without nasal pinch"  
    },  
    {  
      "pattern": "\\\\b(do you)\\\\b",  
      "replacement": "dee-yoo",  
      "description": "Softens interrogative onset into regional drawl"  
    },  
    {  
      "pattern": "\\\\b(\\\\w+)ing\\\\b",  
      "replacement": "\$1-in'",  
      "description": "Enforces dropped alveolar nasals across all continuous verbs"  
    },  
    {  
      "pattern": "\\\\b(drainage)\\\\b",  
      "replacement": "DRAY-nij",  
      "description": "Prevents over-enunciation of second syllable"  
    }  
  \],  
  "banned\_pronunciations": {  
    "slough": \["SLUFF", "SLOH"\],  
    "creosote": \["kree-OH-soht"\]  
  }  
}

#### **Case Study C: Hard Sci-Fi Telemetry (voices/deep-space-salvage/lexicon.json)**

> * **World Axiom:** Depressurized radio channels, NASA-spec telemetry acronyms, orbital mechanics vocabulary.  
> * **Phonetic Alphabet:** ARPABET.  
> * **Strategy:** Military NATO cadence, hard syllabic separation, letter-by-letter expansion.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "deep-space-salvage",  
  "phonetic\_alphabet": "ARPABET",  
  "phonetic\_rules": {  
    "apogee": "AE1 P AH0 JH IY0",  
    "perigee": "P EH1 R AH0 JH IY0",  
    "eva": "IY1 V IY1 EY1",  
    "rcs": "AA1 R S IY1 EH1 S",  
    "hydrazine": "HH AY1 D R AH0 Z IY2 N",  
    "bulkhead": "B AH1 L K HH EH2 D",  
    "oracle": "AO1 R AH0 K AH0 L"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(kpa|kilopascals?)\\\\b",  
      "replacement": "\$1 KIL-oh-pas-kahlz",  
      "description": "Metric pressure telemetry expansion"  
    },  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(m/s|meters per second)\\\\b",  
      "replacement": "\$1 MEE-terz per SEK-und",  
      "description": "Velocity vector expansion"  
    },  
    {  
      "pattern": "\\\\b(atmo)\\\\b",  
      "replacement": "AT-moh",  
      "description": "Salvage slang for atmosphere"  
    },  
    {  
      "pattern": "\\\\b(o2)\\\\b",  
      "replacement": "OH-TOO",  
      "description": "Life-support gas telemetry"  
    }  
  \],  
  "banned\_pronunciations": {  
    "eva": \["EE-vah"\],  
    "rcs": \["er-SEE-ess"\]  
  }  
}

### **5\. Cryptographic Provenance, DAG Integration & The Selective Invalidation Walk**

In the studio’s Directed Acyclic Graph (DAG) compilation engine, lexicon.json is not an unversioned helper file; it is an active dependency node that anchors into voice\_manifest.json and the overarching render\_manifest.json.

               SERIES LEXICON (voices/\<series\_slug\>/lexicon.json)  
                                         │  
                                         ▼  
                     Canonical Serialization & SHA-256 Hash  
                                         │  
                                         ▼  
                                  lexicon\_sha256  
                                         │  
                     ┌───────────────────┴───────────────────┐  
                     ▼                                       ▼  
       voices/voice\_manifest.json                 render\_manifest.json  
       (Baked into H\_recipe digest)               (Root Provenance Seal)

#### **1\. Canonical Serialization & Recipe Binding**

> 1. **Canonical JSON Serialization (RFC 8785):** The compiler sorts all object keys alphabetically, eliminates non-semantic whitespace, and computes a SHA-256 digest:  
>    *H*lexicon​\=SHA-256(Canonicalize(lexicon.json))  
> 2. **Recipe Digest Injection:** Every character voice recipe inside voice\_manifest.json incorporates *H*lexicon​ into its identity digest:  
>    *H*recipe​\=HMAC-SHA256(Secret,Engine∥WeightsSHA∥RefSHA∥BaseDSP∥*H*lexicon​)

#### **2\. The Lexical Selective Invalidation Algorithm**

When an engineer updates an entry in voices/\<series\_slug\>/lexicon.json (e.g., updating "siphon": "SAI-fun" → "SAI-fawn"), a naive compiler would mark every audio stem in the series as dirty, triggering expensive re-renders. The pipeline prevents this by running an AST token intersection scan:

1\. GIT COMMIT COMMITTED ──► lexicon\_sha256 mutates  
                                │  
                                ▼  
2\. H\_recipe INVALIDATION ──► All recipes in series marked is\_dirty \= 1  
                                │  
                                ▼  
3\. AST SCAN ──► Compiler inspects drafts/dialogue\_ast.json for "siphon"  
                                │  
       ┌────────────────────────┴────────────────────────┐  
       ▼                                                 ▼  
\[ CONTAINS TARGET TOKEN \]                       \[ DOES NOT CONTAIN TOKEN \]  
Shot 01: "...hand over the siphon wrench."      Shot 02: "I carried the rations\!"  
• Stem ep040\_sh01.wav marked dirty              • Stem cached; untouched (is\_dirty \= 0\)  
• Dispatched to audio-microservice (:8000)      • Zero CPU re-synthesis  
• Audio duration re-measured via ffprobe        • Frame count preserved  
• target\_frames re-derived for Sequence 01      • Visual Plate retained

> 1. **Lexical Intersection Filter:** The compiler sweeps the dialogue lines of the scene. If a line's dialogue\_text does not intersect with the mutated lexicon lemma or regex pattern, its content-addressed .wav stem is certified clean and skipped.  
> 2. **Downstream Master Clock Protection:** If the updated pronunciation alters the stem's duration by even a few milliseconds, ffprobe re-measures duration (*D*ms​), recalculates the discrete frame budget (⌈(*D*ms​/1000)×24⌉), and updates exposure\_sheet.json. This ensures visual cut boundaries and multi-track sidechain ducking automation align with the updated pronunciation without introducing timing errors.

### **6\. The STT Alignment Gate & Negative Assertions (banned\_pronunciations)**

Once audio is synthesized through the phonetic firewall, it is verified post-synthesis through the **Speech-to-Text (STT) Verbatim Alignment Gate** (Filter 1 of the 5-Stage Conformance Pipeline) before being written to disk:

RAW PCM BUFFER (48 kHz / 24-bit WAV from Port 8000\)  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ LOCAL AUTOMATED STT INFERENCE PASS (Whisper / Local Speech Model)      │  
│ • Generates raw normalized transcription of the audio buffer           │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ VERBATIM PARITY & NEGATIVE ASSERTION CHECK                             │  
│ • Asserts character-for-character parity against dialogue\_ast.json     │  
│ • Sweeps phoneme transcription against banned\_pronunciations array     │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
            ┌────────────────┴────────────────┐  
            ▼                                 ▼  
         \[FAIL\]                            \[PASS\]  
  STT\_ALIGNMENT\_BREACH               Filter 2: Pre-Conform  
  Halt at T0 (\$0.00 compute)         Spectral Hygiene Pass

> * **Transcription Verification:** A local STT model transcribes the synthesized 48 kHz / 24-bit PCM buffer. The transcription is normalized (stripping casing and external whitespace) and asserted character-for-character against the source dialogue\_text in dialogue\_ast.json.  
> * **Enforcement of banned\_pronunciations:** The gate inspects the phonetic transcription against the negative assertions declared in lexicon.json. For example, if the model synthesizes "siphon" with the banned split diphthong \["SEE-fon"\] or "slough" as \["SLUFF"\], the check intercepts the anomaly.  
> * **Failure Routing:** An alignment breach or banned pronunciation match aborts compilation immediately with an STT\_ALIGNMENT\_BREACH at *T*0​ (\$0.00 compute cost). The system rejects the corrupted stem before any GPU resources are allocated for downstream video diffusion plates on Rig 2\.

---

*User prompt: {{FOCUS:  3\. Concrete Multi-Series Lexicon Implementations (Series-Assets-Audio) }} /extreme-details*

Response: The **Concrete Multi-Series Lexicon Implementations** within series-assets-audio enforce strict linguistic and acoustic boundaries across disparate episodic universes, preventing the cross-contamination of pronunciation rules, dialectal elisions, and world-specific vocabularies.

Located at voices/\<series\_slug\>/lexicon.json, each lexicon operates as an immutable pre-inference normalization contract executed offline on Rig 1 by the local audio-microservice daemon. By isolating dictionaries into series-scoped namespaces, a phonetic override in one universe has zero visibility or side effects within sibling show repositories.

### **1\. Structural Schema Invariants & Multi-Alphabet Standard**

Every series lexicon must validate against lexicon.schema.json at build time. To prevent configuration drift and untyped parameters, the schema mandates additionalProperties: false across all objects.

voices/  
├── under-the-floorboards/  
│   ├── lexicon.json            \# Alphabet: CUSTOM\_STRESS\_EXPANSION (Goblin Slapstick)  
│   └── voice\_manifest.json     \# Binds lexicon\_sha256 into H\_recipe  
├── wiregrass-basin/  
│   ├── lexicon.json            \# Alphabet: CUSTOM\_STRESS\_EXPANSION (Industrial Noir)  
│   └── voice\_manifest.json  
└── deep-space-salvage/  
    ├── lexicon.json            \# Alphabet: ARPABET (Hard Sci-Fi Telemetry)  
    └── voice\_manifest.json

> * **schema\_version:** Locked strictly to "2.0.0".  
> * **series\_slug:** A lower-case kebab-case identifier matching series.config.json (e.g., "under-the-floorboards").  
> * **phonetic\_alphabet:** Declares the phonemic notation parsed by the series' neural synthesis backends ("ARPABET", "IPA", or "CUSTOM\_STRESS\_EXPANSION").  
> * **phonetic\_rules:** A case-insensitive dictionary mapping orthographic lemmas to phonetic replacements.  
> * **regex\_replacements:** An ordered sequence of non-destructive syntactic expansions executing with word-boundary isolation (\\b).  
> * **banned\_pronunciations:** Negative assertions used by the post-synthesis Speech-to-Text (STT) gate to trap common out-of-vocabulary (OOV) neural hallucinations.

### **2\. Case Study A: Domestic Goblin Farce (voices/under-the-floorboards/lexicon.json)**

> * **Narrative Axiom:** Fast, anxious, clipped domestic goblin farce set beneath kitchen floorboards.  
> * **Acoustic & Dramaturgical Profile:** Characters (Bog, Spleen, Mum Grissel) speak with high fundamental frequency (*F*0​), compressed oral cavity resonance (formant warping *W*\<1.0), and frantic consonant delivery.  
> * **Engine Target:** Piper-ONNX (FastSpeech2/VITS architecture running on multi-core CPU with ≈80 MB RAM).  
> * **Notation Standard:** CUSTOM\_STRESS\_EXPANSION.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "under-the-floorboards",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "siphon": "SAI-fun",  
    "snerk": "SNERK",  
    "grissel": "GRIZ-zul",  
    "marrow-bone": "MAIR-oh-BOHN",  
    "floor-timbers": "FLOR-TIM-berz",  
    "skitter": "SKIT-ter",  
    "tallow": "TAL-oh",  
    "peevish": "PEE-vish"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(d'you)\\\\b",  
      "replacement": "dyoo",  
      "description": "Contracts 'd'you' to quick goblin dental glide",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(gotta)\\\\b",  
      "replacement": "GAHT-tuh",  
      "description": "Forces clipped staccato on glottal stop",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(underneath)\\\\b",  
      "replacement": "un-ner-NEETH",  
      "description": "Flattens 'd' sound for subterranean colloquial speech",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(in|inch|inches)\\\\b",  
      "replacement": "\$1 IN-chez",  
      "description": "Expands dimensional measurements for hoarded items",  
      "case\_sensitive": false  
    }  
  \],  
  "banned\_pronunciations": {  
    "siphon": \["SEE-fon", "sih-FON"\],  
    "grissel": \["GRIZ-lee", "gray-SEL"\]  
  }  
}

#### **Linguistic & Engine Mechanics**

> * **Front-of-Mouth Consonant Snapping:** In Piper-ONNX, unstressed tokens like *"siphon"* default to ambiguous schwa endings or French nasalization ("SEE-fon"). Enforcing "SAI-fun" locks the high-energy diphthong /aɪ/ into the initial syllable, giving the puppet its signature frantic bite.  
> * **Dental Glide Contraction:** The regex rule converting \\b(d'you)\\b to "dyoo" prevents the neural vocoder from splitting the colloquial phrase into two staccato words ("d" and "you"), eliminating unwanted frame dilation in the exposure sheet.  
> * **Measurement Normalization:** Goblin dialogue frequently cites stolen scraps (e.g., *"3 inch bolt"*). The measurement regex expands digits into explicit stress tokens ("3 IN-chez"), preventing the TTS engine from reading abbreviations as "in" (the preposition).

### **3\. Case Study B: Southern Gothic Noir (voices/wiregrass-basin/lexicon.json)**

> * **Narrative Axiom:** Southern Gothic industrial noir, chemical herbicide runoff, somatic exhaustion, and laryngeal wear.  
> * **Acoustic & Dramaturgical Profile:** Characters (The Pilot, Billie Fae) speak with low fundamental frequency (*F*0​), high subharmonic vocal fry (Φeff​≥0.45), elongated vowels, and unreleased stop consonants.  
> * **Engine Target:** CosyVoice-300M (Flow-matching diffusion vocoder) and Chatterbox-Base-FP16.  
> * **Notation Standard:** CUSTOM\_STRESS\_EXPANSION.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "wiregrass-basin",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "culvert": "KULL-vert",  
    "gallbreaker": "GAWL-bray-ker",  
    "creosote": "KREE-uh-soht",  
    "slough": "SLOO",  
    "diesel": "DEEZ-ul",  
    "spurl": "SPERL",  
    "defoliant": "dee-FOH-lee-unt",  
    "wiregrass": "WY-er-grass"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(ain't)\\\\b",  
      "replacement": "aynt",  
      "description": "Standardizes dialect negation without nasal pinch",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(do you)\\\\b",  
      "replacement": "dee-yoo",  
      "description": "Softens interrogative onset into regional drawl",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(\\\\w+)ing\\\\b",  
      "replacement": "\$1-in'",  
      "description": "Enforces dropped alveolar nasals across all continuous verbs",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(drainage)\\\\b",  
      "replacement": "DRAY-nij",  
      "description": "Prevents over-enunciation of second syllable",  
      "case\_sensitive": false  
    }  
  \],  
  "banned\_pronunciations": {  
    "slough": \["SLUFF", "SLOH"\],  
    "creosote": \["kree-OH-soht"\]  
  }  
}

#### **Linguistic & Engine Mechanics**

> * **Chemical Solvent Nomenclature:** Industrial terms like *"creosote"* and *"slough"* cause significant hallucination in autoregressive models (often parsed as "SLUFF" or "kree-OH-soht"). Hardcoding "SLOO" and "KREE-uh-soht" guarantees accurate regional pronunciation across every episode.  
> * **Alveolar Nasal Dropping (-in'):** The broad regex rule \\b(\\w+)ing\\b \\to \$1-in' globally transforms progressive participles (e.g., *"running"* → *"run-in'"*, *"siphoning"* → *"siphon-in'"*). This forces the diffusion vocoder to drop the velar nasal /ŋ/ in favor of the alveolar nasal /n/, producing the regional cadence without modifying the upstream screenplay text.  
> * **Softened Interrogative Onsets:** Transforming "do you" into "dee-yoo" eliminates harsh consonant attacks at phrase starts, allowing the line to flow directly into the character's low-register drawl.

### **4\. Case Study C: Hard Sci-Fi Telemetry (voices/deep-space-salvage/lexicon.json)**

> * **Narrative Axiom:** Hard sci-fi telemetry, depressurized radio channels, vacuum salvage, and NASA-spec instrumentation.  
> * **Acoustic & Dramaturgical Profile:** Flat affect, military NATO cadence, rapid syllabic pacing, zero vocal fry, high bandpass filtering (comms channel simulation).  
> * **Engine Target:** Kokoro-82M (Compact Style-TTS2 variant running on CPU/Wasm) and Piper-ONNX.  
> * **Notation Standard:** ARPABET.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "deep-space-salvage",  
  "phonetic\_alphabet": "ARPABET",  
  "phonetic\_rules": {  
    "apogee": "AE1 P AH0 JH IY0",  
    "perigee": "P EH1 R AH0 JH IY0",  
    "eva": "IY1 V IY1 EY1",  
    "rcs": "AA1 R S IY1 EH1 S",  
    "hydrazine": "HH AY1 D R AH0 Z IY2 N",  
    "bulkhead": "B AH1 L K HH EH2 D",  
    "oracle": "AO1 R AH0 K AH0 L"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(kpa|kilopascals?)\\\\b",  
      "replacement": "\$1 KIL-oh-pas-kahlz",  
      "description": "Metric pressure telemetry expansion",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(m/s|meters per second)\\\\b",  
      "replacement": "\$1 MEE-terz per SEK-und",  
      "description": "Velocity vector expansion",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(atmo)\\\\b",  
      "replacement": "AT-moh",  
      "description": "Salvage slang for atmosphere",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(o2)\\\\b",  
      "replacement": "OH-TOO",  
      "description": "Life-support gas telemetry",  
      "case\_sensitive": false  
    }  
  \],  
  "banned\_pronunciations": {  
    "eva": \["EE-vah"\],  
    "rcs": \["er-SEE-ess"\]  
  }  
}

#### **Linguistic & Engine Mechanics**

> * **ARPAbet Precision:** Hard telemetry requires exact stress markers (1 for primary stress, 0 for unstressed, 2 for secondary stress). In Kokoro-82M, spelling *"apogee"* as "AE1 P AH0 JH IY0" locks the vowel lengths and pitch trajectory, preventing casual conversational drift.  
> * **Acronym Expansion vs. Word Merging:** Without explicit rules, neural TTS models attempt to pronounce acronyms like *"EVA"* as a single word ("EE-vah") or *"RCS"* as an unparsed consonant cluster. Mapping them to individual letter pronunciations ("IY1 V IY1 EY1", "AA1 R S IY1 EH1 S") preserves technical realism.  
> * **Telemetry Unit Synthesis:** Unexpanded scientific units like "14 kpa" produce erratic readings across models (e.g., reading "k-p-a" or omitting the unit entirely). Pre-inference regex expansion converts the token stream to "14 KIL-oh-pas-kahlz", maintaining consistent duration calculation (*D*ms​) for downstream video frame budgeting.

### **5\. The NLP Slur Collision Defense & Architectural Partition**

Writing heavy phonetic contractions directly into human-authored screenplay text introduces significant failure modes into modern production pipelines:

SCREENPLAY SOURCE (Axis A: Meaning / D1 Canon Database)  
Text: "Do you hear what they are saying in the drainage culvert?"  
                               │  
            ┌──────────────────┴──────────────────┐  
            ▼                                     ▼  
   Cloud LLM / Edge Gateways            Offline Local Host (Rig 1\)  
   • 100% Clean Grammatical Prose        • Ingestion Pass (audio-microservice)  
   • Passes API Safety Filters           • Applies voices/wiregrass-basin/lexicon.json  
   • Zero Slur / Profanity Collisions   • Regex: "do you" \-\> "dee-yoo"  
   • Exit Code 0 (Unblocked)            • Phonetic: "culvert" \-\> "KULL-vert"  
                                                  │  
                                                  ▼  
                                         Neural Vocoder (Port 8000\)  
                                         Synthesizes authentic regional drawl

> * **The Safety Filter Trap:** Commercial cloud APIs, LLM alignment filters, and automated edge linters frequently flag vernacular spelling (e.g., heavy regional contractions or colloquial phonetic dialogue) as garbled text, offensive slurs, or toxic language.  
> * **The Upstream Clean Text Invariant:** The canonical database (Cloudflare D1 / SQLite) and upstream screenplay ASTs (dialogue\_ast.json) store only standard grammatical English text.  
> * **Offline G2P Normalization:** Dialect expansion occurs strictly downstream within the isolated, local Python microservice on Rig 1\. Because this daemon operates entirely offline behind port 8000, regex transformations synthesize regional vernacular without exposing the pipeline to false-positive cloud moderation shutdowns.

### **6\. Cryptographic Provenance, DAG Invalidation & Timeline Protection**

Within the studio's Directed Acyclic Graph (DAG), lexicon.json is not a mutable helper script; it is a version-controlled cryptographic dependency node:

SERIES LEXICON (voices/\<series\_slug\>/lexicon.json)  
                         │  
                         ▼  
        RFC 8785 Canonical JSON Serialization  
                         │  
                         ▼  
           SHA-256 Digest (lexicon\_sha256)  
                         │  
         ┌───────────────┴───────────────┐  
         ▼                               ▼  
voice\_manifest.json              render\_manifest.json  
(H\_recipe HMAC-SHA256)           (Root Provenance Envelope)

> 1. **Deterministic Hashing (*H*lexicon​):** The compiler serializes lexicon.json according to RFC 8785 (sorting object keys alphabetically and stripping non-semantic whitespace) and calculates its SHA-256 hash:  
>    *H*lexicon​\=SHA-256(Canonicalize(lexicon.json))  
> 2. **Recipe Digest Binding (*H*recipe​):** The character recipe inside voice\_manifest.json incorporates *H*lexicon​ into its root cryptographic signature:  
>    *H*recipe​\=HMAC-SHA256(Secret,Engine∥WeightsSHA∥RefSHA∥BaseDSP∥*H*lexicon​)  
> 3. **AST Token Intersection Scan (Selective Invalidation):** If an engineer modifies a rule in under-the-floorboards/lexicon.json (e.g., updating "siphon": "SAI-fun" → "SAI-fawn"), the compiler does not invalidate every audio line in the show. It sweeps dialogue\_ast.json across active scenes:  
   * **Unmatched Lines:** Lines that do not contain the lemma "siphon" maintain a cache hit (is\_dirty \= 0), preserving existing .wav files and skipping synthesis.  
   * **Matched Lines:** Lines containing "siphon" are flagged dirty (is\_dirty \= 1). The line is re-synthesized by audio-microservice.  
> 4. **Temporal Master Clock Recalculation:** Because changing a vowel's phonetic realization can expand or contract audio duration by several milliseconds, ffprobe re-measures the new waveform duration (*D*ms​) and re-quantizes the integer 24 fps frame budget:  
>    target\_frames=⌈(1000*D*ms​​)×24⌉  
>    The updated integer frame count is updated in exposure\_sheet.json, locking visual plate durations and optical sidechain ducking curves to the new acoustic measurement without sub-frame drift.

### **7\. Verification Gauntlet: Negative Assertions & STT Alignment**

Before a synthesized PCM buffer is written to disk, it must pass Filter 1 of the verification gauntlet: the **Speech-to-Text (STT) Verbatim Alignment Gate**.

> * **Local STT Transcription:** A local Whisper model transcribes the raw 48 kHz / 24-bit audio stream.  
> * **Negative Assertion Check:** The transcription is cross-referenced against the series' banned\_pronunciations map. If under-the-floorboards synthesizes "siphon" as "SEE-fon" or wiregrass-basin synthesizes "slough" as "SLUFF", the engine flags an explicit phonetic failure.  
> * **Fail-Fast Invalidation (*T*0​\=\$0.00):** A detected breach throws an immediate STT\_ALIGNMENT\_BREACH and halts the pipeline with exit code 1\. The corrupted stem is rejected before any GPU cycles are spent on downstream video diffusion plates, enforcing complete acoustic correctness across all production series.

---

*User prompt: {{FOCUS:  4\. Dialect Mechanics & The NLP Slur Collision Defense (Series-Assets-Audio) }} /extreme-details*

Response: The **Dialect Mechanics & The NLP Slur Collision Defense** subsystem within series-assets-audio governs the translation of regional vernacular, character idiolects, and phonetic contractions into synthesized acoustic waveforms without exposing upstream production pipelines or downstream distribution channels to automated content moderation failure modes.

Operating at the junction of **Axis A (Semantic Meaning)** and **Axis B (Physical Representation)**, this architecture resolves a systemic vulnerability in generative multi-modal engineering: the fundamental conflict between authorial naturalism and machine safety classifiers.

### **1\. The Core Vulnerability: Authorial Naturalism vs. Algorithmic Moderation**

In narrative fiction exploring regional, historical, rural, or fantasy subcultures—such as the Southern Gothic vernacular of *Wiregrass Basin* or the subterranean patter of *Under the Floorboards*—naturalistic dialogue relies heavily on phonetically contracted speech, eye dialect, dropped terminal consonants, and localized colloquialisms.

When creative pipelines allow unvetted phonetic spellings to be drafted directly into the core screenplay text or prompt contexts, three distinct points of failure occur across the generative stack:

               THE PHONETIC CONTRACTION COLLISION TRAP  
┌────────────────────────────────────────────────────────────────────────┐  
│ UNVETTED EYE-DIALECT IN SCRIPT PROSE:                                  │  
│ "D'you hear what they're sayin' in the culvert? It ain't right, boy."  │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
         ┌──────────────────────────┼──────────────────────────┐  
         ▼                          ▼                          ▼  
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐  
│ CLOUD API LINTER │       │ NEURAL G2P / TTS │       │ PLATFORM STT     │  
│ & SAFETY GATES   │       │ INFERENCE ENGINE │       │ (DISTRIBUTION)   │  
├──────────────────┤       ├──────────────────┤       ├──────────────────┤  
│• Misidentifies   │       │• Inconsistent    │       │• Mistranscribes  │  
│  contractions    │       │  syllabic timing │       │  slurred audio   │  
│  as profanity    │       │• Hallucinates    │       │  as hate speech  │  
│  or racial slurs │       │  OOV phonemes    │• Automated demon-│  
│• Pipeline halts  │       │• Destabilizes    │  etization and   │  
│  with Exit 1     │       │  24 fps master   │  account flags   │  
│  at T0 (\$0.00)   │       │  clock budgets   │  post-broadcast  │  
└──────────────────┘       └──────────────────┘       └──────────────────┘

> * **The NLP Slur Collision Hazard:** Cloud-hosted Large Language Models (LLMs), edge API safety guardrails, and automated text linters parse tokens through probabilistic safety classifiers. Heavily contracted vernacular (e.g., colloquial negations, clipped imperatives, or regional phonetic spellings) routinely collides with toxic n-gram classifiers, false-positively tripping hate-speech and profanity filters.  
> * **The Subtitle & STT Demonetization Trap:** Downstream distribution networks (such as YouTube, broadcast networks, or SVOD services) run automated Speech-to-Text (STT) ingestion pipelines on published audio. Automated STT parsers frequently mistake non-verbal character vocalizations (grunts, groans, labored combat exhalations) or slurred regional contractions for racial slurs or extreme profanity, triggering automated demonetization or content takedowns.  
> * **Acoustic & Temporal Instability:** When a neural vocoder receives non-standard orthographic spellings (e.g., *"sayin'"* or *"d'you"*), its internal Grapheme-to-Phoneme (G2P) fallback heuristic often treats the word as out-of-vocabulary (OOV). This triggers erratic character-level letter-to-sound rules, causing erratic syllabification and unpredictable duration (*D*ms​) variance. Because continuous dialogue duration establishes the physical master clock that dictates 24 fps integer video cut allocations (⌈(*D*ms​/1000)×24⌉), pronunciation jitter directly destabilizes downstream visual plates.

### **2\. The Architectural Partition: Screenplay Grammar vs. Synthesized Delivery**

To neutralize this systemic vulnerability, the studio architecture mandates an absolute separation of concerns formalized as the **Machine Rail vs. Voice Rail Split**:

*"NLP models misread heavy phonetic dialect as slurs. Spell out grammatical words even if the voice track delivers a heavy contraction."*

               THE DUAL-LAYER SEPARATION OF CONCERNS  
                 
LAYER 1: SCREENPLAY AST & CANON DATABASE (Axis A: Meaning / D1 / SQLite)  
┌────────────────────────────────────────────────────────────────────────┐  
│ • Dialogue text strictly maintains 100% grammatically clean English:   │  
│   "Do you hear what they are saying in the drainage culvert?"          │  
│ • Completely bypasses cloud LLM moderation filters and API linters    │  
│ • Passed character-for-character into dialogue\_ast.json                │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼ Dispatched via POST :8000/generate  
LAYER 2: LOCAL PHONETIC FIREWALL (Axis B: Representation / Rig 1 Host)  
┌────────────────────────────────────────────────────────────────────────┐  
│ • audio-microservice executes series-local voices/\<series\>/lexicon.json│  
│ • Runs 100% offline behind local host port 8000 (Zero external APIs)   │  
│ • Regex syntactic pass: \\b(do you)\\b ──► "dee-yoo"                     │  
│ • Morphological pass:   \\b(\\w+)ing\\b ──► "\$1-in'"                      │  
│ • Proper noun pass:     "culvert"    ──► "KULL-vert"                   │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼ Dispatched to Local Vocoder  
LAYER 3: NEURAL VOCAL INFERENCE (CosyVoice / Parler-TTS / Piper)  
┌────────────────────────────────────────────────────────────────────────┐  
│ • Receives unambiguous, phonetically expanded token streams            │  
│ • Synthesizes authentic regional drawl into uncompressed 48 kHz PCM    │  
│ • Downstream closed-captions retain clean orthography for safety      │  
└────────────────────────────────────────────────────────────────────────┘

> 1. **Upstream Safety Compliance (Axis A):** The canonical narrative ledger (Cloudflare D1 / SQLite), writer-facing .fountain screenplays, and machine ASTs (dialogue\_ast.json) store only grammatically standard English text. Authors are prohibited from writing phonetic eye-dialect into dialogue blocks. This insulates all upstream language models, cloud API gateways, and CI/CD linters from tripping moderation heuristics.  
> 2. **Offline Local Dialect Expansion (Axis B):** Dialect expansion executes downstream on Rig 1 inside the local audio-microservice daemon. Because this daemon operates entirely offline behind local port 8000, regex and phonemic transformations occur in a sandboxed runtime containing zero external moderation filters, enabling authentic regional performance without systemic compromise.  
> 3. **Transmedia Delivery Decoupling:** When episodes compile into delivery packages, the audio channel outputs authentic regional contractions, while the timed text subtitle stream (.srt) maintains standard grammatical orthography, shielding the distribution release from automated platform transcription penalties.

### **3\. The Offline Dialect Expansion Pipeline (lexicon.json)**

The phonetic engine on Rig 1 intercepts the verbatim dialogue\_text emitted by dialogue\_ast.json and executes a multi-stage transformation sequence before feeding tensors to the neural synthesis engine:

RAW INGRESS: "Do you hear what they are saying in the drainage culvert?"  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 1: PCRE REGEX SYNTACTIC EXPANSION                                │  
│ • Evaluates regex\_replacements sequentially                            │  
│ • \\b(do you)\\b                ──► "dee-yoo"                            │  
│ • \\b(\\w+)ing\\b                ──► "\$1-in'" (Targeted: "say-in'")       │  
│ • \\b(drainage)\\b              ──► "DRAY-nij"                           │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 2: CASE-INSENSITIVE LEXICAL TOKENIZATION                         │  
│ • Isolates word tokens while preserving prosodic punctuation (?, .)    │  
│ • Tokens: \["dee-yoo", "hear", "what", "they", "are", "say-in'",       │  
│            "in", "the", "DRAY-nij", "culvert", "?"\]                    │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 3: PHONETIC LEXICON OVERRIDE LOOKUP                              │  
│ • Matches lemmas against series phonetic\_rules dictionary              │  
│ • "culvert"                   ──► "KULL-vert"                          │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
FINAL EXPANDED PAYLOAD: "dee-yoo hear what they are say-in' in the DRAY-nij KULL-vert?"  
                                │  
                                ▼ Dispatched to Neural Vocoder

#### **Stage 1: Word-Bounded Regex Syntactic Expansions**

The engine iterates through the regex\_replacements array defined in voices/\<series\_slug\>/lexicon.json. Every regular expression is compiled with word-boundary anchors (\\b) to eliminate unintended substring mutations:

> * Ensures that an expansion rule for the contraction \\b(in)\\b does not mutate internal characters inside "siphon" or "basin".  
> * Standardizes dialectal negations (e.g., transforming \\b(ain't)\\b → "aynt") to prevent nasal pinching in the vocoder.  
> * Transforms progressive verb participles (e.g., \\b(\\w+)ing\\b → "\$1-in'") to enforce regional dropped alveolar nasals (/n/ instead of /ŋ/) across all active dialogue verbs.

#### **Stage 2: Tokenization & Punctuation Preservation**

The modified string is tokenized into lexical lemmas while strictly isolating and preserving sentence-level terminal punctuation (?, \!, ., —). Neural vocoders rely directly on terminal punctuation tokens to condition interrogative pitch inflection, pharyngeal glottal closure, and phrase-final breath decay.

#### **Stage 3: Lexical Dictionary Overrides (phonetic\_rules)**

Tokens are matched case-insensitively against the phonetic\_rules dictionary. Proprietary lore nouns, invented materials, and dialectal idioms are replaced with target stress strings (e.g., "culvert" → "KULL-vert", "siphon" → "SAI-fun").

### **4\. Concrete Multi-Series Parametric Dialect Configurations**

Because series are strictly segregated under top-level namespaces (voices/\<series\_slug\>/), dialect mechanics adapt to disparate aesthetic requirements without cross-universe contamination:

voices/  
├── wiregrass-basin/  
│   ├── lexicon.json            \# Southern Gothic Noir (Drawl, Fry, Nasal Drops)  
│   └── voice\_manifest.json     \# Pinned to CosyVoice-300M / Chatterbox  
├── under-the-floorboards/  
│   ├── lexicon.json            \# Domestic Goblin Farce (Plosive Snaps, High F0)  
│   └── voice\_manifest.json     \# Pinned to Piper-ONNX (INT8)  
└── deep-space-salvage/  
    ├── lexicon.json            \# Hard Sci-Fi Telemetry (NATO Cadence, RF Comms)  
    └── voice\_manifest.json     \# Pinned to Kokoro-82M / Style-TTS2

#### **A. Case Study: Southern Gothic Noir (voices/wiregrass-basin/lexicon.json)**

> * **Aesthetic & Somatic Axiom:** Chemical defoliant runoff, severe laryngeal fatigue, chronic peripheral neuropathy, and regional drawl.  
> * **Acoustic Profile:** Elongated diphthongs, dropped terminal velar nasals, dark unreleased plosives, and deep fundamental frequency drop.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "wiregrass-basin",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "culvert": "KULL-vert",  
    "gallbreaker": "GAWL-bray-ker",  
    "creosote": "KREE-uh-soht",  
    "slough": "SLOO",  
    "diesel": "DEEZ-ul",  
    "spurl": "SPERL",  
    "defoliant": "dee-FOH-lee-unt",  
    "wiregrass": "WY-er-grass"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(ain't)\\\\b",  
      "replacement": "aynt",  
      "description": "Standardizes dialect negation without nasal pinch"  
    },  
    {  
      "pattern": "\\\\b(do you)\\\\b",  
      "replacement": "dee-yoo",  
      "description": "Softens interrogative onset into regional drawl"  
    },  
    {  
      "pattern": "\\\\b(\\\\w+)ing\\\\b",  
      "replacement": "\$1-in'",  
      "description": "Enforces dropped alveolar nasals across all continuous verbs"  
    },  
    {  
      "pattern": "\\\\b(drainage)\\\\b",  
      "replacement": "DRAY-nij",  
      "description": "Prevents over-enunciation of second syllable"  
    }  
  \],  
  "banned\_pronunciations": {  
    "slough": \["SLUFF", "SLOH"\],  
    "creosote": \["kree-OH-soht"\]  
  }  
}

> * **Acoustic Coupling:** When combined with The Pilot's base DSP modifiers (basePitchShiftSemitones: \-2.5, vocalFryDensity: 0.45, speedScalar: 0.85), the softened onset "dee-yoo" prevents acoustic spiking, allowing the voice to slide into a low-register chest drone.

#### **B. Case Study: Domestic Goblin Farce (voices/under-the-floorboards/lexicon.json)**

> * **Aesthetic & Somatic Axiom:** High-strung claustrophobic panic, paranoia, and rapid domestic argument beneath kitchen floorboards.  
> * **Acoustic Profile:** High pitch (+3.8 semitones), compressed oral formants (0.86), fast conversational velocity (1.18×), and rapid plosives.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "under-the-floorboards",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "siphon": "SAI-fun",  
    "snerk": "SNERK",  
    "grissel": "GRIZ-zul",  
    "marrow-bone": "MAIR-oh-BOHN",  
    "floor-timbers": "FLOR-TIM-berz",  
    "skitter": "SKIT-ter",  
    "tallow": "TAL-oh",  
    "peevish": "PEE-vish"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(d'you)\\\\b",  
      "replacement": "dyoo",  
      "description": "Contracts 'd'you' to quick goblin dental glide"  
    },  
    {  
      "pattern": "\\\\b(gotta)\\\\b",  
      "replacement": "GAHT-tuh",  
      "description": "Forces clipped staccato on glottal stop"  
    },  
    {  
      "pattern": "\\\\b(underneath)\\\\b",  
      "replacement": "un-ner-NEETH",  
      "description": "Flattens 'd' sound for subterranean colloquial speech"  
    },  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(in|inch|inches)\\\\b",  
      "replacement": "\$1 IN-chez",  
      "description": "Expands dimensional measurements for hoarded items"  
    }  
  \],  
  "banned\_pronunciations": {  
    "siphon": \["SEE-fon", "sih-FON"\],  
    "grissel": \["GRIZ-lee", "gray-SEL"\]  
  }  
}

> * **Acoustic Coupling:** Contracting \\b(d'you)\\b to "dyoo" prevents Piper-ONNX from synthesizing two distinct words, eliminating unnecessary frame dilation in exposure\_sheet.json and preserving rapid slapstick timing.

### **5\. Verification Gauntlet & Alignment Defense**

Synthesized dialect audio must pass Filter 1 of the conformance pipeline—the **Speech-to-Text (STT) Verbatim Alignment Gate**—before being committed to disk:

RAW SYNTHESIZED PCM BUFFER (48 kHz / 24-bit WAV from Port 8000\)  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 1: LOCAL STT ALIGNMENT PASS (Whisper / Local Speech Model)      │  
│ • Runs locally on Rig 1 (Zero network calls, zero external logs)       │  
│ • Generates normalized raw transcription of synthesized stem           │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ BIDIRECTIONAL PARITY AUDIT                                             │  
│ • Evaluates transcription against dialogue\_text from dialogue\_ast.json │  
│ • Normalizes dialect variants using reverse-lexicon mapping matrices   │  
│ • Confirms zero dropped words, skipped plosives, or stutter loops      │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ NEGATIVE PRONUNCIATION SWEEP (banned\_pronunciations)                   │  
│ • Inspects phonemic tokens against series banned\_pronunciations map    │  
│ • Traps OOV neural hallucinations (e.g., "SEE-fon", "SLUFF")           │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
            ┌────────────────┴────────────────┐  
            ▼                                 ▼  
         \[FAIL\]                            \[PASS\]  
  STT\_ALIGNMENT\_BREACH               Proceed to Filter 2  
  Immediate Halt at T0 (\$0.00)       (Pre-Conform Spectral Hygiene)

> 1. **Local Automated Transcription:** An automated local STT inference pass transcribes the raw 48 kHz / 24-bit PCM buffer on Rig 1\.  
> 2. **Reverse Dialect Normalization:** The verification pass applies the series' reverse-lexicon dictionary to map expanded phonetic tokens back to standard lemmas (e.g., mapping recognized "dee-yoo" back to "do you" and "say-in'" back to "saying").  
> 3. **Verbatim Parity Assertion:** The normalized STT transcript is asserted character-for-character against the canonical dialogue\_text in dialogue\_ast.json. If the neural vocoder stumbles on a contraction, drops a syllable, or hallucinates an unscripted interjection, the gate catches the variance.  
> 4. **Negative Assertion Trap (banned\_pronunciations):** The transcribed phoneme sequence is cross-referenced against the banned\_pronunciations array in lexicon.json. If the engine mispronounces "slough" as "SLUFF" or "creosote" as "kree-OH-soht", execution halts immediately.  
> 5. **Fail-Fast Economic Enforcement (*T*0​\=\$0.00):** Any STT parity discrepancy raises an STT\_ALIGNMENT\_BREACH and halts execution with exit code 1\. Because this failure is caught before ComfyUI diffusion batches or Remotion Chromium compositors run, corrupted speech is terminated at zero additional compute cost.

### **6\. Transmedia Caption Engineering & Subtitle Evasion (POD-05 / POD-17)**

The defense against NLP slur collisions extends downstream into the generation of SubRip (.srt) timed-text assets and closed-captioning streams, adhering to DCMP and Netflix broadcast standards:

AUDIO TRACK (Diegetic Acoustic Reality)  
│ • Synthesizes: "aynt", "dee-yoo", "KULL-vert", and visceral grunts  
│ • Pushes physical 48 kHz linear PCM to container  
│  
▼ PARALLEL TRANSMEDIA PROJECTION (Axis A \-\> Text / Axis B \-\> Audio)  
SUBTITLE TRACK (.srt Timed Text Stream)  
│ • Strictly spells out: "Do you", "are not", "culvert"  
│ • Encodes physiological actions: \[sharp exhale\], \[strained grunt\]  
│ • Bypasses automated YouTube STT censorship and demonetization bots

> * **Orthographic Normalization in Captions:** Subtitle files never mirror the raw phonetic strings generated for the neural vocoder ("dee-yoo", "aynt"). The caption generation compiler extracts directly from the canonical dialogue\_text of the Screenplay AST, ensuring that viewers and platform moderation bots read clean, standard grammatical sentences.  
> * **Clinical Action Over Phonetics:** Automated speech recognition frequently misreads non-verbal combat and physical effort sounds as profanity or slurs. The subtitle pipeline adheres to strict sound effect conventions, replacing phonetic onomatopoeia with clinical physiological descriptions:  
  * Use \[sharp exhale\], never *huff*.  
  * Use \[strained grunt\], never *urgggh*.  
  * Use \[agonized groan\], never *aaargh*.  
> * **Speaker Disambiguation:** When non-verbal physical actions occur during complex blocking or off-screen struggles, subtitles must explicitly bind the action to the character slug (e.g., \[Bog grunts with effort\], \[The Pilot groans\]). This eliminates ambiguous phonetic audio that third-party moderation models could misattribute to hostile verbal slurs.

### **7\. Directed Acyclic Graph (DAG) Selective Invalidation**

In the studio’s DAG compilation engine, lexicon.json is an active dependency node that anchors into voice\_manifest.json and the overarching render\_manifest.json:

*H*lexicon​\=SHA-256(Canonicalize(lexicon.json))  
*H*recipe​\=HMAC-SHA256(Secret,Engine∥WeightsSHA∥RefSHA∥BaseDSP∥*H*lexicon​)  
LEXICON COMMIT: Modifies regex \\b(do you)\\b \-\> "dee-yoo"  
                                │  
                                ▼  
TOPOLOGICAL BLAST RADIUS AUDIT (Selective Invalidation Walk)  
                                │  
       ┌────────────────────────┴────────────────────────┐  
       ▼                                                 ▼  
\[ CONTAINS TARGET PATTERN \]                     \[ DOES NOT CONTAIN PATTERN \]  
Shot 01: "Do you hear the water?"               Shot 02: "The valve is locked."  
• Stem ep040\_sh01.wav marked dirty              • Stem cached; untouched (is\_dirty \= 0\)  
• Dispatched to audio-microservice (:8000)      • Zero CPU re-synthesis  
• Duration re-measured via ffprobe              • Frame budget preserved (75 frames)  
• Exposure sheet cut point updated              • Downstream visual plate retained

> 1. **Lemma Intersection Audit:** When an author or audio engineer modifies a pronunciation rule or regex pattern in lexicon.json, the compiler does not blindly purge the audio cache for the entire show. It scans the text tokens of all scenes in dialogue\_ast.json. Lines that do not intersect with the mutated pattern maintain a cache hit (is\_dirty \= 0), preserving existing .wav files and skipping synthesis entirely.  
> 2. **Master Clock Protection:** For lines that match the mutated pattern, the line is re-synthesized offline. Because changing a phonetic pronunciation alters vowel hold times and consonant releases, ffprobe re-measures the new continuous duration (*D*ms​) and re-quantizes the discrete 24 fps frame budget (⌈(*D*ms​/1000)×24⌉).  
> 3. **Downstream Alignment:** The updated frame budget updates exposure\_sheet.json, adjusting visual cut points and multi-track sidechain ducking envelopes without inducing timing drift or desynchronizing visual animation.

---

*User prompt: {{FOCUS:  4\. Case Study C: Hard Sci-Fi Telemetry (voices/deep-space-salvage/lexicon.json) (Series-Assets-Audio) }} /extreme-details*

Response: The **Hard Sci-Fi Telemetry (voices/deep-space-salvage/lexicon.json)** subsystem within series-assets-audio governs the acoustic normalization, phonetic pronunciation contracts, and radio-frequency (RF) comms formatting for vacuum-isolated salvage environments. Positioned at the boundary between semantic lore (**Axis A: Meaning**) and physical waveform synthesis (**Axis B: Representation**), it converts aerospace jargon, orbital mechanics acronyms, and metric telemetry tokens into deterministic phonetic streams before passing audio tensors to the neural vocoder pool.

### **1\. Diegetic Reality & Acoustic Boundary Constraints**

The diegetic world of deep-space-salvage takes place within asteroid belt salvage corridors, depressurized spacecraft hulls, unshielded command decks, and sealed extravehicular activity (EVA) suits. Dialogue is never recorded in ambient air; it is mediated entirely through internal helmet microphones, narrow-band RF comms loops, and ship artificial intelligence systems.

                  VACUUM COMMS & TELEMETRY ACOUSTIC GEOMETRY  
┌────────────────────────────────────────────────────────────────────────┐  
│ EXTERNAL ENVIRONMENT: Deep-Space Vacuum (0 bp Sound Conduction)        │  
├════════════════════════════════════════════════════════════════════════┤  
│ SUIT VISOR ACOUSTICS: Dry Direct Mic / 9,900 bp High Damping           │  
├────────────────────────────────────────────────────────────────────────┤  
│ IN-LINE DSP CHAIN:                                                     │  
│ • Brickwall Bandpass: 300 Hz – 3,400 Hz (Military Telemetry Spec)       │  
│ • Bit-Depth Truncation: 12-Bit Linear PCM Emulation                     │  
│ • Noise Floor Ceiling: \-75.0 dBFS (Hard Squelch Gate)                  │  
│ • Pacing Velocity: 1.25x (Telemetry Core) / 0.95x (Hypoxic Welder)     │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼  
          Zero Acoustic Room Reflections / Complete Absence of Wet Reverb

> * **Aesthetic Axiom:** The acoustic design adheres to *Prophetic Brutalism* fused with cold digital utility: vector-flat clarity, harsh digital hard-clipping, bandpass squelch, and the total absence of wet room reflections.  
> * **Physical Sound Conduction Invariant:** External space conducts zero acoustic vibrations (0 bp). Internal suit reflections are damped (9,900 bp damping), producing dry, claustrophobic vocal recordings without room tone.  
> * **Military Telemetry Bandpass:** Dialogue audio is shaped by steep 48 dB/octave brickwall bandpass filters bounded between 300 Hz and 3,400 Hz, matching narrow-band radio transceivers.

### **2\. The Machine Contract: voices/deep-space-salvage/lexicon.json**

Because aerospace telemetry relies on technical abbreviations, metric pressure exponents, and strict military letter-by-letter pronunciations, deep-space-salvage uses the **ARPAbet** phonetic standard rather than custom syllabic approximations.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "deep-space-salvage",  
  "phonetic\_alphabet": "ARPABET",  
  "phonetic\_rules": {  
    "apogee": "AE1 P AH0 JH IY0",  
    "perigee": "P EH1 R AH0 JH IY0",  
    "eva": "IY1 V IY1 EY1",  
    "rcs": "AA1 R S IY1 EH1 S",  
    "hydrazine": "HH AY1 D R AH0 Z IY2 N",  
    "bulkhead": "B AH1 L K HH EH2 D",  
    "oracle": "AO1 R AH0 K AH0 L"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(kpa|kilopascals?)\\\\b",  
      "replacement": "\$1 KIL-oh-pas-kahlz",  
      "description": "Metric pressure telemetry expansion"  
    },  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(m/s|meters per second)\\\\b",  
      "replacement": "\$1 MEE-terz per SEK-und",  
      "description": "Velocity vector expansion"  
    },  
    {  
      "pattern": "\\\\b(atmo)\\\\b",  
      "replacement": "AT-moh",  
      "description": "Salvage slang for atmosphere"  
    },  
    {  
      "pattern": "\\\\b(o2)\\\\b",  
      "replacement": "OH-TOO",  
      "description": "Life-support gas telemetry"  
    }  
  \],  
  "banned\_pronunciations": {  
    "eva": \["EE-vah"\],  
    "rcs": \["er-SEE-ess"\]  
  }  
}

### **3\. Engine Arbitrage & Profile Implementation**

The audio-microservice routes deep-space-salvage requests between two distinct character recipes configured in voice\_manifest.json:

               SERIES MULTIPLEXING: DEEP-SPACE-SALVAGE  
                                  │  
         ┌────────────────────────┴────────────────────────┐  
         ▼                                                 ▼  
PROFILE 1: sys\_oracle7                            PROFILE 2: char\_vance  
• Autonomous Hull Core AI                         • Veteran Hypoxic Lead Welder  
• Engine: Kokoro-82M (FP32)                       • Engine: Chatterbox-Base (FP16)  
• Pure Multi-Thread CPU / \~350 MB RAM             • AVX-512 CPU / \~1.5 GB RAM  
• Real-Time Factor: RTF \<= 0.12x                  • Real-Time Factor: RTF \~ 0.40x  
• Conditioning: SPEAKER\_VECTOR                    • Conditioning: ZERO\_SHOT\_CLONE  
• Speed: 1.25x | Fry: 0.00 | Breath: 1.00         • Speed: 0.95x | Fry: 0.30 | Breath: 2.10  
• Comms Bandpass: 300 Hz \- 3,400 Hz               • Comms Bandpass: 180 Hz \- 4,800 Hz

#### **Profile 1: Autonomous Hull Core (sys\_oracle7)**

> * **Dramaturgical Role:** An unfeeling, automated ship telemetry core executing high-speed hazard warnings, hull breach telemetry, and orbital calculations.  
> * **Engine & Memory Topology:** Deployed on **Kokoro-82M** (Style-TTS2 variant) running on pure CPU via WebAssembly/native execution, consuming ∼350 MB RAM with an inference factor RTF≤0.12× and boot latency under 100 ms.  
> * **Synthetic Conditioning:** Employs SPEAKER\_VECTOR mapped to synthetic\_telemetry\_neutral\_01. It bypasses physical voice clone WAVs and runtime extraction nets, passing pre-calculated tensor vectors directly to memory.  
> * **Acoustic & DSP Modifiers:**  
  * basePitchShiftSemitones: 0.0.  
  * formantWarpingFactor: 1.00.  
  * speedScalar: 1.25 (rapid, machine-paced delivery).  
  * baseBreathiness: 1.00 (zero respiratory pause injection).  
  * baseVocalFry: 0.00 (complete eradication of subharmonic glottal flutter).  
  * high\_pass\_cutoff\_hz: 300.0 Hz (48 dB/octave slope).  
  * low\_pass\_cutoff\_hz: 3400.0 Hz (48 dB/octave slope).  
  * bit\_depth\_reduction: 12-bit linear quantization artifacts.  
  * noise\_floor\_ceiling\_dbfs: −75.0 dBFS.  
> * **Banned Cadences:** \["EMOTIONAL\_TREMOR", "VOCAL\_FRY", "HESITATION\_STAMMER"\]. The linter halts generation if an upstream LLM inserts hesitation markers or affective wavering.

#### **Profile 2: Chief Vance (char\_vance)**

> * **Dramaturgical Role:** A veteran salvage welder speaking through an EVA helmet comm loop, fighting suit leaks, cold exposure, and hypoxia.  
> * **Engine & Memory Topology:** Deployed on **Chatterbox-Base** (FP16) running on multi-core AVX-512 CPU, consuming ∼1.5 GB RAM with RTF≈0.40×.  
> * **Acoustic Conditioning:** Utilizes ZERO\_SHOT\_CLONE pinned to voices/deep-space-salvage/versions/vance\_v2.wav (backed by cached embedding vance\_v2.pt and cryptographic hash verification).  
> * **Acoustic & DSP Modifiers:**  
  * basePitchShiftSemitones: −1.2 (chest-resonant gravel).  
  * formantWarpingFactor: 0.96.  
  * speedScalar: 0.95 (fatigued cadence).  
  * baseBreathiness: 2.10 (pulmonary strain inside closed life support).  
  * baseVocalFry: 0.30 (hypoxic glottal exhaustion).  
  * high\_pass\_cutoff\_hz: 180.0 Hz (24 dB/octave).  
  * low\_pass\_cutoff\_hz: 4800.0 Hz (18 dB/octave).  
  * noise\_floor\_ceiling\_dbfs: −64.0 dBFS.  
> * **Banned Cadences:** \["SONOROUS\_ORATORY"\]. Prevents theatrical projection or classical declamation inside a cramped spacesuit.

### **4\. Phonetic & Syntactic Normalization Mechanics**

The phonetic engine on Rig 1 executes four normalization passes over incoming telemetry strings:

RAW AST INGRESS: "ORACLE: Vent 14 kpa of hydrazine from the RCS manifold before apogee."  
                                    │  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ 1\. REGEX TELEMETRY EXPANSION PASS                                      │  
│ • \\b(\\d+)\\s\*(kpa)\\b   ──► "\$1 KIL-oh-pas-kahlz"                        │  
│ • Result: "ORACLE: Vent 14 KIL-oh-pas-kahlz of hydrazine..."           │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ 2\. CASE-INSENSITIVE TOKENIZATION & PUNCTUATION PINNING                 │  
│ • Tokens: \["ORACLE", "Vent", "14", "KIL-oh-pas-kahlz", "of",           │  
│            "hydrazine", "from", "the", "RCS", "manifold", "before",    │  
│            "apogee", "."\]                                              │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ 3\. ARPABET PHONEMIC MAPPING                                            │  
│ • "ORACLE"    ──► AO1 R AH0 K AH0 L                                    │  
│ • "hydrazine" ──► HH AY1 D R AH0 Z IY2 N                               │  
│ • "RCS"       ──► AA1 R S IY1 EH1 S                                    │  
│ • "apogee"    ──► AE1 P AH0 JH IY0                                     │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ 4\. ENGINE PHONEME INJECTION                                            │  
│ • Direct numeric phoneme ID injection into Kokoro-82M tensor graph     │  
└────────────────────────────────────────────────────────────────────────┘

> * **Stress Anchoring in ARPAbet:** Technical terms use explicit stress integers (1 \= primary stress, 0 \= unstressed, 2 \= secondary stress). Coding *"hydrazine"* as HH AY1 D R AH0 Z IY2 N prevents vocoder syllable merging or vowel degradation across takes.  
> * **Acronym Splitting vs. Word Formation:** Without explicit phonetic mapping, neural vocoders misread acronyms: *"EVA"* is frequently hallucinated as a single female name ("EE-vah"), and *"RCS"* produces unintelligible fricative slurs. Mapping them to letter-by-letter pronunciations (IY1 V IY1 EY1 and AA1 R S IY1 EH1 S) enforces technical communication standards.  
> * **Scientific Unit Expansion:** Raw strings such as "14 kpa" or "250 m/s" trigger inconsistent reading patterns across models (e.g., spelling out letters or dropping exponents). Regex expansions rewrite tokens to "14 KIL-oh-pas-kahlz" and "250 MEE-terz per SEK-und", stabilizing line duration (*D*ms​) before physical timeline quantization.

### **5\. Master Clock Protection & Verification Gauntlet**

Synthesized telemetry waveforms serve as the physical pacing clock for downstream visual plates and Remotion compositing compositions:

SYNTHESIZED TELEMETRY BUFFER (48 kHz / 24-bit PCM)  
                        │  
                        ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 1: STT VERBATIM ALIGNMENT GATE (Whisper On-Device Inference)    │  
│ • Verifies character transcription matches dialogue\_ast.json           │  
│ • Negative Check: Flags banned pronunciations (e.g., \["EE-vah"\])       │  
│ • Exit code 1 at T0 (\$0.00 cost) on pronunciation breach               │  
└───────────────────────┬────────────────────────────────────────────────┘  
                        │  
                        ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 2: PRE-CONFORM SIGNAL HYGIENE & BANDPASS CHECK                  │  
│ • Confirms brickwall cutoffs: 300 Hz HPF / 3,400 Hz LPF                │  
│ • Clamps True-Peak to \<= \-1.0 dBTP; Loudness to \-16.0 LUFS (±1.0)      │  
│ • Squelch Gate: Noise floor verified \<= \-75.0 dBFS                     │  
└───────────────────────┬────────────────────────────────────────────────┘  
                        │  
                        ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ ffprobe MASTER CLOCK QUANTIZATION BRIDGE                               │  
│ • Exact duration measured: D\_ms \= 2,416 ms                             │  
│ • Target frames: ceil((2416 / 1000\) \* 24\) \= 58 integer frames          │  
│ • Exposure sheet locks timeline; ComfyUI/Remotion receives 58 frames   │  
└────────────────────────────────────────────────────────────────────────┘

> * **Fail-Fast Negative Assertion Gate:** If the synthesis model pronounces "EVA" as "EE-vah" or "RCS" as "er-SEE-ess", Filter 1 intercepts the token, raises an STT\_ALIGNMENT\_BREACH, and terminates the build before running GPU diffusion plates on Rig 2\.  
> * **Cryptographic Recipe Invalidation (*H*recipe​):** voices/deep-space-salvage/lexicon.json is serialized via canonical RFC 8785 rules and hashed to produce lexicon\_sha256. Any modification to orbital terms or pressure units recalculates *H*recipe​ in voice\_manifest.json, triggering selective invalidation only for scenes where the mutated terms appear in dialogue\_ast.json.  
> * **Integer Quantization Invariant:** The measured continuous duration of the telemetry callout is converted to discrete 24 fps integer frames via:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉  
>   This calculation locks the visual cut point of the depressurized command bridge plate, preventing sub-frame timing drift between the telemetry audio and the on-screen heads-up display (HUD) graphics.

---

*User prompt: {{FOCUS:  3\. Case Study B: Southern Gothic Noir (voices/wiregrass-basin/lexicon.json) (Series-Assets-Audio) }} /extreme-details*

Response: The **voices/wiregrass-basin/lexicon.json** specification establishes the deterministic phonetic firewall and pronunciation contract for the *Wiregrass Basin* narrative universe, governing how regional South Georgia dialect, agrochemical nomenclature, and somatic laryngeal damage translate into synthesized waveforms.

Operating across **Axis A (Semantic Meaning)** and **Axis B (Physical Representation)**, this module enforces an acoustic partition: dialogue text within the canonical relational database (Cloudflare D1 / SQLite) and Screenplay AST (dialogue\_ast.json) maintains standard, grammatically clean English, while the local audio-microservice daemon executes dialect expansion and phonetic overrides offline on Rig 1 prior to neural vocoder tensor dispatch.

### **1\. Diegetic Reality & Acoustic Axioms (*Necro-Ballistics*)**

The *Wiregrass Basin* setting is an industrial Southern Gothic ecosystem shaped by chronic agricultural poisoning, diesel barge transit, stagnant blackwater sloughs, and institutional abandonment. The acoustic environment operates under the aesthetic axiom of **Necro-Ballistics**: lead-weighted atmospheric gravity, a pervasive 60 Hz electrical dynamo hum, visceral bodily grit, and bleached acoustic transients.

                     WIREGRASS BASIN ACOUSTIC PROFILE  
┌────────────────────────────────────────────────────────────────────────┐  
│ DIEGETIC ENVIRONMENT: Corrugated Metal Pump Sheds, Flooded Spillways   │  
├════════════════════════════════════════════════════════════════════════┤  
│ STRUCTURAL DAMPING: 500 to 2,500 bp (Muddy reflections, long decays)   │  
├────────────────────────────────────────────────────────────────────────┤  
│ BACKGROUND BED: 60 Hz Industrial Dynamo Drone & Cicada Hiss (\<250 Hz)  │  
├────────────────────────────────────────────────────────────────────────┤  
│ VOCAL DELIVERY: South Georgia Drawl, Elongated Diphthongs, Vocal Fry   │  
├────────────────────────────────────────────────────────────────────────┤  
│ SOMATIC PATHOLOGY: Chronic Defoliant Poisoning, Laryngeal Fibrosis     │  
├────────────────────────────────────────────────────────────────────────┤  
│ ENGINE TARGET: CosyVoice-300M (FP16 Flow-Matching Diffusion Vocoder)   │  
└────────────────────────────────────────────────────────────────────────┘

> * **Acoustic Space & Boundary Reflections:** Scenes take place within corrugated sheet-metal pumping stations, open concrete culverts, uninsulated river shacks, and stagnant swamp corridors. Structural acoustic absorption ranges from **500 to 2,500 bp**, creating muddy low-mid decays that necessitate tight post-synthesis noise-floor gating (noise floor ceiling ≤−60.0 dBFS).  
> * **Continuous Ambient Bed Constraints:** Track 3 ambient beds (such as sustain\_040hz\_v3) maintain a spectral centroid strictly below 250 Hz (spectralCentroidHz\<250). This prevents environmental drones from masking vocal formants or spot Foley transients.  
> * **Somatic Pathology:** Characters suffer from occupational trauma, systemic organ deterioration, and laryngeal fibrosis caused by decades of inhaling atomized defoliants. Spoken dialogue is characterized by subharmonic glottal flutter, low fundamental pitch (*F*0​), labored diaphragmatic breath inhalations, and dropped terminal consonants.

### **2\. The Machine Contract: voices/wiregrass-basin/lexicon.json**

The lexicon adheres to lexicon.schema.json under schema\_version: "2.0.0". It employs the CUSTOM\_STRESS\_EXPANSION alphabet, utilizing capital letters to dictate primary syllabic stress and hyphens for phonemic separation:

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "wiregrass-basin",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "culvert": "KULL-vert",  
    "gallbreaker": "GAWL-bray-ker",  
    "creosote": "KREE-uh-soht",  
    "slough": "SLOO",  
    "diesel": "DEEZ-ul",  
    "spurl": "SPERL",  
    "defoliant": "dee-FOH-lee-unt",  
    "wiregrass": "WY-er-grass"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(ain't)\\\\b",  
      "replacement": "aynt",  
      "description": "Standardizes dialect negation without nasal pinch",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(do you)\\\\b",  
      "replacement": "dee-yoo",  
      "description": "Softens interrogative onset into regional drawl",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(d'you)\\\\b",  
      "replacement": "dee-yoo",  
      "description": "Normalizes elided interrogative contractions",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(\\\\w+)ing\\\\b",  
      "replacement": "\$1-in'",  
      "description": "Enforces dropped alveolar nasals across all continuous verbs",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(drainage)\\\\b",  
      "replacement": "DRAY-nij",  
      "description": "Prevents over-enunciation of second syllable",  
      "case\_sensitive": false  
    }  
  \],  
  "banned\_pronunciations": {  
    "slough": \["SLUFF", "SLOH"\],  
    "creosote": \["kree-OH-soht"\]  
  }  
}

### **3\. Linguistic Mechanics & Dialect Transformation Logic**

Neural Text-to-Speech vocoders map graphemes to acoustic frames through learned statistical patterns. Without intervention, standard models flatten regional colloquialisms into homogenized American standard speech or misread dialect spellings as out-of-vocabulary (OOV) tokens. The normalization pipeline resolves this through three distinct transformation phases:

RAW AST INGRESS (dialogue\_text):  
"Do you hear what they are saying in the drainage culvert? It ain't right."  
                               │  
                               ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 1: ORDERED REGEX SYNTACTIC EXPANSIONS                            │  
│ • \\b(do you)\\b               ──► "dee-yoo"                             │  
│ • \\b(\\w+)ing\\b               ──► "\$1-in'" (Targeted: "say-in'")        │  
│ • \\b(drainage)\\b             ──► "DRAY-nij"                            │  
│ • \\b(ain't)\\b                ──► "aynt"                                │  
└──────────────────────────────┬─────────────────────────────────────────┘  
                               │  
                               ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 2: CASE-INSENSITIVE TOKENIZATION & PUNCTUATION ISOLATION         │  
│ • Tokens: \["dee-yoo", "hear", "what", "they", "are", "say-in'",        │  
│            "in", "the", "DRAY-nij", "culvert", "?", "It", "aynt",      │  
│            "right", "."\]                                               │  
└──────────────────────────────┬─────────────────────────────────────────┘  
                               │  
                               ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 3: PHONETIC LEXICON OVERRIDES                                    │  
│ • "culvert"                  ──► "KULL-vert"                           │  
└──────────────────────────────┬─────────────────────────────────────────┘  
                               │  
                               ▼  
FINAL VOCAL PAYLOAD DISPATCHED TO COSYVOICE-300M (PORT 8000):  
"dee-yoo hear what they are say-in' in the DRAY-nij KULL-vert? It aynt right."

#### **A. Chemical & Geographical Lexical Overrides (phonetic\_rules)**

> * **"slough": "SLOO":** Standard neural G2P heuristics predictably hallucinate *"slough"* as *"SLUFF"* (the biological verb for shedding tissue) or *"SLOH"*. In South Georgia hydrology, stagnant river offshoots are pronounced strictly as *"SLOO"* /sluː/.  
> * **"creosote": "KREE-uh-soht":** Untrained models frequently place primary stress on the second syllable ("kree-OH-soht"), conflicting with local industrial pronunciation ("KREE-uh-soht" /ˈkriː.ə.soʊt/).  
> * **"culvert": "KULL-vert":** Fixes the short vowel /ʌ/ and dark lateral consonant /l/, eliminating unnatural elongation or diphthongization across neural inference runs.  
> * **"gallbreaker": "GAWL-bray-ker":** Proprietary agricultural machinery lemma; locks the open back rounded vowel /ɒ/ on the initial syllable.

#### **B. Morphological & Syntactic Dialect Normalization (regex\_replacements)**

> * **Alveolar Nasal Dropping (\\b(\\w+)ing\\b → "\$1-in'"):** Replaces the velar nasal /ŋ/ with the alveolar nasal /n/ across all active continuous verb participles (e.g., *"running"* → *"run-in'"*, *"siphoning"* → *"siphon-in'"*). This forces the diffusion vocoder to relax tongue placement, generating authentic regional drawl without manual phoneme-by-phoneme keying.  
> * **Interrogative Onset Softening (\\b(do you)\\b → "dee-yoo"):** Standard interrogative onsets trigger abrupt plosive attacks (/d/ followed by high tense /uː/). Replacing the phrase with "dee-yoo" creates a soft dental glide that transitions into the character's low-register drawl.  
> * **Dialect Negation Standardization (\\b(ain't)\\b → "aynt"):** Prevents vocoders from over-nasalizing the diphthong /eɪ/, ensuring an authentic, weary vocal timbre.  
> * **Schwa Enunciation Suppression (\\b(drainage)\\b → "DRAY-nij"):** Prevents British or mid-Atlantic neutral vocoder pronunciations from over-enunciating the secondary syllable.

### **4\. Engine Multiplexing & Character Voice Recipes**

The audio-microservice multiplexes wiregrass-basin requests through high-fidelity, diffusion-based acoustic models capable of rendering gravelly low frequencies, breath leakage, and subtle dramatic pauses.

Character recipes declared in voices/wiregrass-basin/voice\_manifest.json govern how the normalized phonetic stream interacts with neural checkpoints and baseline DSP vectors:

               WIREGRASS BASIN MULTIPLEXING ARCHITECTURE  
                                   │  
         ┌─────────────────────────┴─────────────────────────┐  
         ▼                                                   ▼  
PROFILE 1: char\_020\_the\_pilot                       PROFILE 2: char\_billie\_fae  
• Role: Dying Crop Duster                           • Role: Poisoned Saloon Proprietor  
• Engine: CosyVoice-300M (FP16 Flow Matching)       • Engine: CosyVoice-300M / Chatterbox  
• Conditioning: ZERO\_SHOT\_CLONE                     • Conditioning: ZERO\_SHOT\_CLONE  
• Memory: \~2.80 GB RAM on Rig 1                     • Memory: \~2.80 GB RAM on Rig 1  
• Base Pitch Shift: \-2.5 semitones                  • Base Pitch Shift: \-3.2 semitones  
• Formant Warping Factor: 0.92                      • Formant Warping Factor: 1.12  
• Speed Scalar: 0.85                                • Speed Scalar: 0.82  
• Breathiness Pause Multiplier: 1.80                • Breathiness Pause Multiplier: 2.40  
• Vocal Fry Density: 0.45                           • Vocal Fry Density: 0.60

#### **Profile 1: The Pilot (char\_020\_the\_pilot) — Dying Crop Duster**

> * **Dramaturgical Function:** The moral and somatic anchor of the series; an unlicensed crop duster suffering from severe chemical emphysema and brachial plexus trauma.  
> * **Engine & Checkpoint:** CosyVoice-300M (FunAudioLLM/CosyVoice-300M, FP16 causal flow matching) running locally on Rig 1\.  
> * **Machine Recipe Definition:**

{  
  "\$schema": "https://specs.studio.internal/schemas/v2/voice\_recipe.json",  
  "character\_id": "char\_020\_the\_pilot",  
  "series\_slug": "wiregrass-basin",  
  "active\_version": "v3",  
  "recipe": {  
    "tts\_engine": "CosyVoice-300M",  
    "checkpoint": {  
      "model\_repo": "FunAudioLLM/CosyVoice-300M",  
      "weights\_sha256": "8a7c29e1f5d4a3b8c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9",  
      "quantization": "FP16"  
    },  
    "conditioning": {  
      "strategy": "ZERO\_SHOT\_CLONE",  
      "reference\_voice\_path": "voices/wiregrass-basin/versions/the\_pilot\_v3.wav",  
      "reference\_sha256": "4a8c9e2b10a5e8f1d3c5e7b9a2c4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0",  
      "speaker\_embedding\_cache": "voices/wiregrass-basin/embeddings/the\_pilot\_v3.pt",  
      "description\_prompt": null  
    },  
    "base\_dsp\_modifiers": {  
      "basePitchShiftSemitones": \-2.5,  
      "formantWarpingFactor": 0.92,  
      "speedScalar": 0.85,  
      "breathinessPauseMultiplier": 1.80,  
      "vocalFryDensity": 0.45  
    },  
    "dynamics\_and\_eq": {  
      "high\_pass\_cutoff\_hz": 90.0,  
      "high\_pass\_slope\_db\_oct": 24,  
      "de\_esser\_threshold\_db": \-18.0,  
      "de\_esser\_frequency\_hz": 6800.0,  
      "target\_integrated\_lufs": \-16.0,  
      "brickwall\_true\_peak\_dbtp": \-1.0,  
      "noise\_floor\_ceiling\_dbfs": \-60.0  
    },  
    "phonetic\_overrides": {  
      "lexicon\_file": "voices/wiregrass-basin/lexicon.json",  
      "enable\_regex\_replacements": true  
    },  
    "banned\_cadences": \[  
      "RAPID\_STACCATO",  
      "RISING\_INFLECTION\_INTERROGATIVE"  
    \]  
  }  
}

> * **Acoustic & Somatic Rationale:** Formant scaling at 0.92 tightens the pharynx, while the −2.5 semitone shift drops the pitch into a low chest register. The elevated vocalFryDensity: 0.45 injects periodic subharmonic pulses, emulating damaged vocal fold vibration.  
> * **Banned Cadences:** Barred from RAPID\_STACCATO and RISING\_INFLECTION\_INTERROGATIVE. If an upstream LLM drafts an action sequence instructing The Pilot to deliver lines with staccato urgency, the pre-flight compiler intercepts the directive at *T*0​ (\$0.00 compute cost) and terminates compilation.

#### **Profile 2: Billie Fae (char\_billie\_fae) — Poisoned Saloon Proprietor**

> * **Dramaturgical Function:** An aging, cynical bar owner who has breathed defoliant vapors for thirty years; speaks with an unhurried, smoky drawl.  
> * **Machine Recipe Definition:**

{  
  "\$schema": "https://specs.studio.internal/schemas/v2/voice\_recipe.json",  
  "character\_id": "char\_billie\_fae",  
  "series\_slug": "wiregrass-basin",  
  "active\_version": "v1",  
  "recipe": {  
    "tts\_engine": "CosyVoice-300M",  
    "checkpoint": {  
      "model\_repo": "FunAudioLLM/CosyVoice-300M",  
      "weights\_sha256": "8a7c29e1f5d4a3b8c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9",  
      "quantization": "FP16"  
    },  
    "conditioning": {  
      "strategy": "ZERO\_SHOT\_CLONE",  
      "reference\_voice\_path": "voices/wiregrass-basin/versions/billie\_fae\_v1.wav",  
      "reference\_sha256": "7b3e1c9d2f4a5e6b8a0c2d4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e",  
      "speaker\_embedding\_cache": "voices/wiregrass-basin/embeddings/billie\_fae\_v1.pt",  
      "description\_prompt": null  
    },  
    "base\_dsp\_modifiers": {  
      "basePitchShiftSemitones": \-3.2,  
      "formantWarpingFactor": 1.12,  
      "speedScalar": 0.82,  
      "breathinessPauseMultiplier": 2.40,  
      "vocalFryDensity": 0.60  
    },  
    "dynamics\_and\_eq": {  
      "high\_pass\_cutoff\_hz": 75.0,  
      "high\_pass\_slope\_db\_oct": 24,  
      "de\_esser\_threshold\_db": \-22.0,  
      "de\_esser\_frequency\_hz": 6200.0,  
      "target\_integrated\_lufs": \-16.0,  
      "brickwall\_true\_peak\_dbtp": \-1.0,  
      "noise\_floor\_ceiling\_dbfs": \-60.0  
    },  
    "phonetic\_overrides": {  
      "lexicon\_file": "voices/wiregrass-basin/lexicon.json",  
      "enable\_regex\_replacements": true  
    },  
    "banned\_cadences": \[  
      "PERKY\_UPBEAT",  
      "STACCATO\_ALERT"  
    \]  
  }  
}

> * **Acoustic & Somatic Rationale:** Formant scaling at 1.12 expands the virtual pharynx, while the −3.2 semitone drop places her fundamental pitch in a heavy bass register. The elevated vocalFryDensity: 0.60 combined with breathinessPauseMultiplier: 2.40 injects severe breath leakage and subharmonic rasp on phrase endings, capturing decades of exposure to tobacco and chemical runoff.  
> * **Banned Cadences:** Barred from PERKY\_UPBEAT and STACCATO\_ALERT.

### **5\. Somatic Coupling & The Master Physical Clock Axiom**

In wiregrass-basin, somatic trauma dynamically drives physical audio duration, which in turn establishes the visual timeline:

CANONICAL RELATIONAL LEDGER: SOMATIC\_FATIGUE \= 8,200 bp  
                               │  
                               ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ CONTEXT ASSEMBLY PASS (worker-sower-conductor)                         │  
│ • Trips physical constraint: SOMATIC\_FATIGUE \> 8,000 bp                │  
│ • Sets pause\_frequency\_multiplier \= 2.8                                │  
│ • Sets vocalFryDensity \= 0.85                                          │  
│ • Asserts motor capability: \!line.motor\_actions.includes("RUN")        │  
└──────────────────────────────┬─────────────────────────────────────────┘  
                               │  
                               ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ NEURAL SYNTHESIS (CosyVoice-300M on Port 8000\)                         │  
│ • Injects broken glottal stops and labored respiratory inhalations     │  
│ • Expands continuous audio duration (D\_ms) by up to \+40%               │  
└──────────────────────────────┬─────────────────────────────────────────┘  
                               │  
                               ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ ffprobe MASTER CLOCK QUANTIZATION BRIDGE                               │  
│ • Baseline Line Duration: 2,100 ms (51 video frames at 24 fps)         │  
│ • Dilated Fatigue Duration: 2,940 ms                                   │  
│ • target\_frames \= ceil((2940 / 1000\) \* 24\) \= 71 integer video frames   │  
│ • Exposure sheet allocates 71 frames to visual plate & Remotion Sequence│  
└────────────────────────────────────────────────────────────────────────┘

> 1. **Algebraic DSP Composition:** When narrative events increment physical damage, the Conductor composes runtime deltas over the character's baseline recipe:  
>    Effective Pitch (*F*0,eff​)=basePitchShiftSemitones+ΔPitchscene​  
>    Effective Formant (*W*eff​)=formantWarpingFactor×ΔFormantscene​  
>    Effective Velocity (*P*eff​)=speedScalar×tonePacingscene​  
>    Effective Pause (Πeff​)=breathinessPauseMultiplier×ΔPausescene​  
>    Effective Fry (Φeff​)=clamp(baseVocalFry+ΔFryscene​,0.0,1.0)  
> 2. **Audio-Driven Temporal Expansion:** Under severe pulmonary fatigue (SOMATIC\_FATIGUE\>8,000 bp), pause\_frequency\_multiplier scales up to 2.8, and vocalFryDensity reaches 0.85. The flow-matching vocoder injects respiratory gasps and broken glottal stops between words, expanding the physical audio waveform by up to **\+40%**.  
> 3. **Master Exposure Sheet Recalculation:** Because continuous audio duration is the master physical clock, downstream visual plates do not compress the voice track. ffprobe measures the dilated duration (*D*ms​) and derives the discrete 24 fps frame budget:  
>    target\_frames=⌈(1000*D*ms​​)×24⌉  
>    A line that normally compiles to 51 frames (2,100 ms) expands to 71 frames (2,940 ms). The visual exposure sheet automatically allocates 71 frames of footage, adjusting downstream video cuts and camera tracking curves to the actor's labored speech.

### **6\. The NLP Slur Collision Defense & Subtitle Architecture**

In Southern Gothic scripts, authors frequently write dialect dialogue using eye-dialect contractions that trigger false-positive algorithmic censorship in automated safety filters:

*"NLP models misread heavy phonetic dialect as slurs. Spell out grammatical words even if the voice track delivers a heavy contraction."*

The architecture enforces an absolute separation between the **Screenplay AST Grammar (Voice Rail)** and **Synthesized Acoustic Delivery**:

               THE MULTI-TIER RECEPTION SAFETY FIREWALL  
                 
LAYER 1: SCREENPLAY AST / CANON D1 DATABASE (Axis A: Meaning)  
┌────────────────────────────────────────────────────────────────────────┐  
│ • Standard English: "Do you hear what they are saying in the culvert?" │  
│ • Completely bypasses upstream cloud LLM and API moderation filters   │  
│ • Passed verbatim into dialogue\_ast.json                               │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼ Dispatched to Rig 1 Host (:8000)  
LAYER 2: LOCAL PHONETIC FIREWALL (Axis B: Representation)  
┌────────────────────────────────────────────────────────────────────────┐  
│ • audio-microservice executes voices/wiregrass-basin/lexicon.json      │  
│ • Runs 100% offline behind local port 8000 (Zero external cloud APIs)  │  
│ • Expands: \\b(do you)\\b ──► "dee-yoo", \\b(\\w+)ing\\b ──► "\$1-in'"       │  
│ • Synthesizes authentic regional drawl via CosyVoice-300M              │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼ Post-Render Assembly  
LAYER 3: TRANSMEDIA CLOSED-CAPTION STREAM (.srt Timed Text)  
┌────────────────────────────────────────────────────────────────────────┐  
│ • Subtitle generator extracts from canonical dialogue\_text, NOT audio  │  
│ • Captions display: "Do you hear what they are saying in the culvert?" │  
│ • Non-verbal effort sounds encoded clinically: \[sharp exhale\], \[grunt\] │  
│ • Bypasses automated YouTube / SVOD platform transcription censorship  │  
└────────────────────────────────────────────────────────────────────────┘

> * **Upstream Text Protection:** The canonical database and Screenplay AST contain only standard grammatical English, insulating upstream cloud models and automated linters from tripping hate-speech or toxicity classifiers.  
> * **Offline Synthesis Isolation:** Dialect transformations occur locally on Rig 1 inside the sandboxed Python daemon, enabling authentic regional performance without external API scrutiny.  
> * **Downstream Timed-Text Hygiene (POD-05 / POD-17):** Timed-text subtitle files (.srt) are derived directly from the clean AST dialogue\_text rather than audio transcriptions. Non-verbal efforts are codified using clinical physiological descriptions (e.g., \[sharp exhale\], \[strained grunt\], \[agonized groan\]) rather than phonetic onomatopoeia (huff, urgggh, aaargh), protecting published releases from automated demonetization on distribution platforms.

### **7\. Directed Acyclic Graph (DAG) Invalidation & Conformance Gauntlet**

Within the studio's compilation DAG, voices/wiregrass-basin/lexicon.json is a cryptographic dependency node anchoring into voice\_manifest.json and render\_manifest.json:

               SERIES LEXICON (voices/wiregrass-basin/lexicon.json)  
                                         │  
                                         ▼  
                     Canonical Serialization (RFC 8785\)  
                                         │  
                                         ▼  
                                  lexicon\_sha256  
                                         │  
                     ┌───────────────────┴───────────────────┐  
                     ▼                                       ▼  
       voices/voice\_manifest.json                 render\_manifest.json  
       (Baked into H\_recipe digest)               (Root Provenance Seal)

#### **A. Cryptographic Binding & Selective Invalidation**

> 1. **Canonical Hashing:** lexicon.json is serialized according to RFC 8785 (keys sorted alphabetically, non-semantic whitespace stripped) to produce lexicon\_sha256:  
>    *H*lexicon​\=SHA-256(Canonicalize(lexicon.json))  
> 2. **Recipe Digest Binding:** Every voice recipe in voice\_manifest.json incorporates *H*lexicon​ into its HMAC-SHA256 signature (*H*recipe​).  
> 3. **Selective AST Invalidation Walk:** When an engineer modifies lexicon.json (e.g., updating "culvert": "KULL-vert" → "KUHL-vurt"), the compiler does not invalidate every audio line across the series. It scans dialogue\_ast.json across active episodes:  
   * **Unmatched Lines:** Lines that do not contain the target token maintain a cache hit (is\_dirty \= 0), preserving existing .wav files and skipping synthesis.  
   * **Matched Lines:** Lines containing the lemma "culvert" are flagged dirty (is\_dirty \= 1), dispatched to audio-microservice on port 8000, and re-synthesized.  
   * **Exposure Sheet Updates:** If the updated pronunciation alters stem duration, ffprobe re-measures duration (*D*ms​), recalculates the integer frame count (⌈(*D*ms​/1000)×24⌉), and updates exposure\_sheet.json to keep visual cuts and sidechain ducking aligned.

#### **B. The Post-Synthesis Verification Gauntlet**

Before a synthesized stem is committed to public/audio/dialogue/, it must clear the five-stage verification battery:

> * **Filter 1: STT Verbatim Alignment Gate:** A local Whisper model transcribes the synthesized 48 kHz PCM stream. The transcription is normalized using reverse-lexicon mapping (converting "aynt" back to "ain't" and "dee-yoo" back to "do you") and compared character-for-character against dialogue\_text. Stutters, skipped words, or dropped syllables trigger an immediate STT\_ALIGNMENT\_BREACH.  
> * **Filter 1B: Negative Assertion Trap (banned\_pronunciations):** The transcribed phonemes are evaluated against the banned\_pronunciations map. If the model pronounces "slough" as "SLUFF" or "creosote" as "kree-OH-soht", compilation aborts at *T*0​ (\$0.00 compute cost) before GPU diffusion begins.  
> * **Filter 2: Pre-Conform Signal Hygiene:** The audio buffer is checked for signal integrity:  
>   Integrated Loudness=−16.0 LUFS (±1.0 LUFS)  
>   True-Peak Ceiling≤−1.0 dBTP  
>   Noise Floor≤−60.0 dBFS  
> * **Tier 3 Conformance: The Acoustic Redaction Battery:** The synthesized audio is evaluated under total timbral redaction (WSOLA pitch-shifting and LPC formant whitening). An automated classifier measures duration-per-syllable, pause distribution between phonemes, and consonant-attack velocities (*d*(RMS)/*dt*) to verify that The Pilot's labored, pause-heavy drawl remains mathematically distinct from other characters even when all timbral cues are stripped away.

---

*User prompt: {{FOCUS:  3\. The Epistemological Triad of Voice Identity & Voice Manifest (Series-Assets-Audio) }} /extreme-details*

### **Response: 1\. Epistemological Foundation & The Class 3 Storage Mandate**

The **Epistemological Triad of Voice Identity** formalizes the boundary between abstract narrative state (**Axis A: Meaning**) and physical acoustic waveforms (**Axis B: Representation**). Under the studio's event-sourced architecture, Large Language Models (LLMs), neural Text-to-Speech (TTS) engines, and video diffusion models operate strictly as untrusted, headless execution workers possessing zero narrative, spatial, or temporal authority. Canonical reality resides exclusively in an immutable relational ledger (Cloudflare D1 / SQLite), while sensory media functions as a downstream projection.

Within this framework, character vocal identity cannot be defined merely by an unversioned .wav file, an ephemeral speaker tag, or a descriptive natural-language prompt. Neural vocoders and autoregressive audio models are susceptible to latent timbre drift, speaker bleed, and statistical regression toward a homogenized, conversational median—a vulnerability designated as **"The Beige Plague"**.

               THE ONTOLOGICAL STATUS OF CHARACTER VOICE  
                 
    AXIS A: SEMANTIC TRUTH                  AXIS B: PHYSICAL PROJECTION  
┌─────────────────────────────┐           ┌─────────────────────────────┐  
│   CANONICAL STATE LEDGER    │           │      AUDIO MICROSERVICE     │  
│  (Cloudflare D1 / SQLite)   │           │    (Rig 1 / CPU / :8000)    │  
├─────────────────────────────┤           ├─────────────────────────────┤  
│ • Verified Somatic State    │           │ • Neural Model Checkpoint   │  
│ • Epistemic BeliefRecord    │ ────────► │ • Speaker Conditioning Vector│  
│ • Logistical Inventory      │           │ • Baseline DSP Modifiers    │  
└─────────────────────────────┘           └──────────────┬──────────────┘  
                                                         │  
                                                         ▼  
                                          ┌─────────────────────────────┐  
                                          │     MASTER TIMEBASE CLOCK   │  
                                          │  (48 kHz / 24-bit PCM WAV)  │  
                                          └─────────────────────────────┘

#### **The Epistemic Triad: Truth, Belief, and Utterance**

The architecture rejects the assumption that objective reality, character perception, and spoken dialogue are identical, enforcing a strict separation across three layers:

> 1. **World Truth:** The canonical state ledger of historical events and physical facts.  
> 2. **Internal Belief:** The subjective cognitive state (BeliefRecord), tracking what a character believes with quantified confidence (0 to 10,000 basis points) based on specific evidence types (DIRECT\_OBSERVATION, TESTIMONY, RUMOR).  
> 3. **External Utterance:** The dramatic line delivered in dialogue\_ast.json, which may contain lies, bluffs, or suppressed subtext.

#### **Class 3 Archive-Dependent Evidence & The Deletion Principle**

Under the architectural **Deletion Principle**, derived relational state can be deterministically recomputed at any time by replaying event logs over baseline history (Replay(H)→S).

However, synthesized voice tracks are classified as **Class 3 Archive-Dependent Evidence**:

> * Because neural speech synthesis backends rely on non-deterministic floating-point math across disparate GPU/CPU kernels, dynamic thread schedulers, and vendor runtime revisions, a vocal track cannot be regenerated bit-for-bit from prompt seeds or screenplay text alone.  
> * If an intermediate audio stem is lost or corrupted, its exact waveform is gone.  
> * Therefore, the generative recipe parameters must be sealed immutably alongside the conformed .wav stem in content-addressed storage (CAS).

#### **The Acoustic Redaction Battery (Tier 3 Conformance)**

To ensure vocal distinctiveness and eradicate "The Beige Plague," candidate voice models must clear Tier 3 of the **Three-Tier Redaction Battery**:

> * Synthesized stems are subjected to Waveform Similarity Overlap-Add (WSOLA) pitch shifting and Linear Predictive Coding (LPC) spectral whitening, stripping away superficial timbral warmth and formants.  
> * An automated classifier evaluates the underlying structural rhythm: consonant-attack velocities (*d*(RMS)/*dt*), pause frequency distributions, and duration-per-syllable metrics.  
> * A certified character profile must remain mathematically identifiable based on speaking cadence alone in complete acoustic darkness (*P*(Identity)\>0.95).

### **2\. The Irreducible Epistemological Triad of Voice Identity**

Within series-assets-audio, character vocal identity is codified as an irreducible tripartite contract:

                     ┌────────────────────────────────────────┐  
                     │       CANONICAL VOCAL IDENTITY TRIAD   │  
                     └───────────────────┬────────────────────┘  
                                         │  
         ┌───────────────────────────────┼───────────────────────────────┐  
         ▼                               ▼                               ▼  
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐  
│   1\. MODEL CHECKPOINT  │  │   2\. SPEAKER EMBEDDING │  │   3\. BASELINE DSP      │  
│   & ENGINE ADAPTER     │  │   & CONDITIONING TOKEN │  │   PARAMETER VECTOR     │  
├────────────────────────┤  ├────────────────────────┤  ├────────────────────────┤  
│ • Architecture Enum    │  │ • Pinned Reference WAV │  │ • Fundamental Pitch F0 │  
│ • Checkpoint Weights   │  │ • Latent Tensor (.pt)  │  │ • Formant Warping (W)  │  
│   SHA-256 Digest       │  │ • Conditioning Prompt  │  │ • Neutral Speed Scalar │  
│ • Execution Graph Hash │  │ • Pinned Performer ID  │  │ • Diaphragmatic Breath │  
│ • Quantization Variant │  │ • Legal Clearance Tag  │  │ • Subharmonic Fry (Φ)  │  
└────────────────────────┘  └────────────────────────┘  └────────────────────────┘

                     THE THREE PILLARS OF VOCAL IDENTITY  
┌────────────────────────────────────────────────────────────────────────┐  
│ PILLAR 1: MODEL CHECKPOINT & ENGINE ADAPTER                            │  
│ • Architecture Enum (CosyVoice-300M, Chatterbox, Parler-TTS, Piper)    │  
│ • Cryptographic Weights Digest (weights\_sha256)                        │  
│ • Quantization & Execution Target (Pure CPU / 0 MB GPU VRAM Allocation)│  
├────────────────────────────────────────────────────────────────────────┤  
│ PILLAR 2: SPEAKER EMBEDDING & CONDITIONING TOKEN                       │  
│ • Conditioning Strategy (ZERO\_SHOT\_CLONE, SPEAKER\_ID, PROMPT, VECTOR)  │  
│ • Pinned Historical Audio Take (voices/versions/\${id}\_v\${n}.wav)       │  
│ • Latent Tensor Cache (.pt) & Performer Clearance ID (SAG-AFTRA Rider) │  
├────────────────────────────────────────────────────────────────────────┤  
│ PILLAR 3: BASELINE DSP PARAMETER VECTOR                                │  
│ • Fundamental Frequency Shift (F0 semitones) & Formant Warping (W)     │  
│ • Speed Scalar, Diaphragmatic Breathiness (Π), and Vocal Fry (Φ)       │  
│ • Dynamics, High-Pass Cutoffs, Sibilance Attenuation & Banned Cadences │  
└────────────────────────────────────────────────────────────────────────┘

### **3\. Pillar 1: Model Checkpoint & Engine Adapter**

Pillar 1 locks the execution graph, neural architecture, and tensor weights of the speech synthesizer. Coupling vocal identity to unpinned models or cloud APIs introduces breaking changes when upstream providers update vocoder weights, altering formant registers and micro-cadence without notice.

#### **Execution Topology & Hardware Allocation**

> * **The Zero-VRAM Invariant:** The speech synthesis microservice (audio-microservice) runs on Rig 1, listening on local port 8000\. It is allocated **exactly 0 MB of dedicated GPU VRAM**, executing entirely on multi-core CPU and system RAM via AVX-512 and OpenVINO/ONNX runtimes. This leaves GPU VRAM unconstrained for heavy visual diffusion models (ComfyUI / Wan 2.1) on Rig 2\.  
> * **Polymorphic Base Adapter:** Disparate synthesis engines implement a standardized abstract base class (BaseTTSEngine), providing a polymorphic execution API behind a single routing endpoint (POST \[http://127.0.0.1:8000/generate\](http://127.0.0.1:8000/generate)).

#### **Supported Engine Architectures & Specifications**

| Engine Identifier | Architectural Profile | Execution Runtime | Memory Footprint | Real-Time Factor (RTF) | Primary Production Use |
| :---- | :---- | :---- | :---- | :---- | :---- |
| CosyVoice-300M | Flow-matching causal diffusion vocoder. | PyTorch C++ / TorchScript (FP16). | ∼2.8 GB System RAM. | ≈1.20× (Non-realtime). | High-fidelity somatic realism, respiratory strain, vocal fry. |
| Chatterbox-Base | Autoregressive transformer with latent cross-attention. | LibTorch / AVX-512 CPU (FP16). | ∼1.5 GB System RAM. | ≈0.40×. | Dramatic dialogue, regional drawls, heavy subtext. |
| Parler-TTS-v0.1 | Autoregressive text-to-speech with natural-language prompt conditioning. | HuggingFace Optimum (FP16). | ∼1.2 GB System RAM. | ≈0.65×. | Ensemble background characters, non-biometric synthesis. |
| Kokoro-82M | Compact Style-TTS2 variant with linear latent projection. | Native C++ / ONNX Runtime (FP32). | ∼350 MB System RAM. | ≤0.12× (Fast). | Shipboard telemetry, AI cores, radio broadcasts. |
| Piper-ONNX | VITS-based acoustic model and neural vocoder. | ONNX Runtime (INT8 Quantized). | ∼80 MB System RAM. | ≤0.08× (Ultra-fast). | Fast-paced comedic dialogue, domestic goblin banter. |

### **4\. Pillar 2: Speaker Embedding & Conditioning Modality**

Pillar 2 anchors character identity within the engine's latent space, formalizing how biometric characteristics, performer casting, and legal rights clearances cross from series configuration into neural tensor evaluation.

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐  
│                           THE FOUR SPEECH CONDITIONING MODALITIES                               │  
├─────────────────────────┬─────────────────────────┬─────────────────────────┬───────────────────┤  
│ ZERO\_SHOT\_CLONE         │ SPEAKER\_ID              │ DESCRIPTION\_PROMPT      │ SPEAKER\_VECTOR    │  
├─────────────────────────┼─────────────────────────┼─────────────────────────┼───────────────────┤  
│ • Input: Pinned .wav    │ • Input: Discrete int   │ • Input: Natural text   │ • Input: Raw .pt  │  
│ • Engine: CosyVoice     │ • Engine: Piper-ONNX    │ • Engine: Parler-TTS    │ • Engine: Kokoro  │  
│ • Conditioning: Latent  │ • Conditioning: Static  │ • Conditioning: Cross-  │ • Conditioning:   │  
│   acoustic projection   │   embedding lookup      │   attention prompt      │   Direct W-tensor │  
│ • RTF: \~1.20x (Heavy)   │ • RTF: ≤0.08x (Instant) │ • RTF: \~0.65x (Moderate)│ • RTF: ≤0.12x     │  
│ • RAM: \~2.8 GB          │ • RAM: \~80 MB           │ • RAM: \~1.2 GB          │ • RAM: \~350 MB    │  
│ • Legal: SAG-AFTRA Rider│ • Legal: Open Model Tag │ • Legal: Text Copyright │ • Legal: Synthetic│  
└─────────────────────────┴─────────────────────────┴─────────────────────────┴───────────────────┘

#### **The Four Conditioning Strategies**

> 1. **ZERO\_SHOT\_CLONE:** Extracts a continuous 512- or 1024-dimensional speaker embedding vector from a conformed, historical reference .wav file using a convolutional/transformer backbone (e.g., CAMPPlus or ECAPA-TDNN). To avoid re-extraction latency during production, extracted vectors are serialized and cached to disk as .pt tensors alongside the reference take.  
> 2. **SPEAKER\_ID:** Maps an integer index into an internalized, pre-trained speaker embedding weight matrix (*W*spk​∈R*K*×*D*) via an *O*(1) tensor lookup, executed natively within architectures like Piper-ONNX.  
> 3. **DESCRIPTION\_PROMPT:** Conditions speech generation through structured, natural-language descriptions of vocal timbre, pitch, texture, and acoustic environment (e.g., *"A gravelly, raspy middle-aged male voice speaking slowly in a dry room with low reverb"*), avoiding reliance on living biometric sources.  
> 4. **SPEAKER\_VECTOR:** Directly injects precomputed, mathematically synthesized latent vectors into the vocoder network, providing deterministic acoustic identity without external audio files.

#### **Legal Governance, Likeness Quarantine & C2PA Provenance**

Conditioning tokens are strictly bound to legal clearance agreements managed by the **Talent & Casting Pod (POD-04)** and **Legal & Provenance Pod (POD-01)**:

> * **The SAG-AFTRA Digital Voice Likeness Rider:** Any voice utilizing ZERO\_SHOT\_CLONE must declare an active performer\_consent\_id (e.g., SAG-AFTRA-2026-00412-EXT). This identifier records contractual parameters, permitted use contexts (such as EPISODIC\_SYNTHESIS vs IN\_WORLD\_MARKETING), and compensation rates in the relational ledger.  
> * **Strict Namespace Likeness Quarantine:** Likeness clearances are non-transferable across series boundaries. An acoustic reference or embedding tensor approved for *Wiregrass Basin* cannot be referenced by *Under the Floorboards*. Attempting to cross-reference voice profiles across series triggers an immediate LEGAL\_CLEARANCE\_BREACH during pre-flight linting.  
> * **Localization Governance (POD-17):** Clearance for original-language episodic delivery does not extend to localized foreign-language dubs without a contractual addendum. If dubbing rights are unnegotiated, localization engines must re-condition the character using DESCRIPTION\_PROMPT or SPEAKER\_VECTOR models.  
> * **C2PA Manifest Binding:** Every synthesized audio stem records the SHA-256 digest of its conditioning reference, its legal agreement tag, and model weights into render\_manifest.json, which is permanently injected into downstream delivery containers via standard Content Credentials (C2PA).

### **5\. Pillar 3: Baseline DSP Parameter Vector**

Pillar 3 specifies the physical transformations applied to the character's vocal tract, oral cavity, and respiratory system in a neutral emotional state, prior to the injection of narrative trauma or scene-specific modifiers. This decouples constant anatomical geometry from temporary emotional reaction.

                        THE FIVE DSP DIMENSIONS  
                                   │  
      ┌────────────────┬───────────┴────┬───────────────┬────────────────┐  
      ▼                ▼                ▼               ▼                ▼  
\[ Pitch (F0) \]   \[ Formants (W) \]  \[ Pacing (P) \]  \[ Breath (Π) \]   \[ Vocal Fry (Φ) \]  
Fundamental      Vocal tract       Conversational  Pulmonary        Glottal fold  
frequency delta  geometry scalar   speed multiplier pause dilation  rattle density  
(-12 to \+12 st)  (0.5 to 2.0)      (0.1 to 3.0)    (1.0 to 3.5)     (0.0 to 1.0)

#### **The Five Primary Parametric Dimensions**

> 1. **Fundamental Frequency Transposition (*F*0​):** Modulates the baseline pitch in signed semitones (\[−12.0,+12.0\] semitones) using phase-vocoder time-stretch and pitch-shift algorithms. Pitch adjustments preserve speech duration while establishing authority (downward shift, e.g., −2.5 st) or small biological stature (upward shift, e.g., \+3.8 st).  
> 2. **Formant Warping Factor (*W*):** Scales pharyngeal and oral acoustic resonance independent of pitch (\[0.5,2.0\]). Scaling below 1.0 (*W*\=0.86) emulates compressed oral geometry (such as goblin anatomy), while scaling above 1.0 (*W*\=1.12) expands the perceived physical pharynx.  
> 3. **Conversational Speed Scalar (*P*):** Sets the baseline delivery tempo (\[0.1,3.0\]). Characters with chronic fatigue default to slower tempos (e.g., *P*\=0.85 for −15% speed).  
> 4. **Diaphragmatic Breathiness Multiplier (Π):** Controls the insertion frequency and duration of respiratory inhalations between clauses (\[1.0,3.5\]). A setting of Π=1.05 represents normal respiratory drag, whereas Π=2.40 indicates severe pulmonary damage.  
> 5. **Subharmonic Vocal Fry Density (Φ):** Injects low-frequency glottal rattle at phrase decay points (\[0.0,1.0\]), emulating irregular, aperiodic vocal fold closure caused by age, exhaustion, or chemical exposure.

#### **Pre-Conform Signal Hygiene & Dynamic Range Constraints**

The recipe embeds strict hardware boundaries that synthesized buffers must clear before proceeding downstream:

> * **High-Pass Rumble Filter:** A 24 dB/octave high-pass filter (75.0 Hz to 180.0 Hz) strips sub-audible infrasonic vocoder thumps.  
> * **Dynamic De-Esser Band:** Attenuates harsh sibilance spikes between 6,000 Hz and 7,200 Hz prior to broadcast compression.  
> * **Integrated Loudness Target:** Normalized strictly to **−16.0 LUFS** (±1.0 LUFS) for web streaming or **−24.0 LUFS** for linear television broadcast, adhering to EBU R128 and ATSC A/85 specifications.  
> * **True-Peak Ceiling:** Clamped to **≤−1.0 dBTP** using inter-sample oversampled brickwall limiting to prevent distortion during lossy platform transcoding (AAC/Opus).  
> * **Noise Floor Ceiling:** Gated strictly to **≤−60.0 dBFS**, ensuring zero ambient hiss when downstream sidechain ducking envelopes release back to unity gain.

### **6\. Storage Hierarchy: /voices/active/ vs. /voices/versions/**

Reference audio files represent production configuration rather than temporary cache. To balance active development ergonomics with historical auditability, series-assets-audio implements a two-tier storage hierarchy:

series-assets-audio/  
├── voices/  
│   ├── active/                          \# Floating Runtime Rail (Pointers / Symlinks)  
│   │   ├── bog.wav                      \# \-\> ../versions/bog\_v2.wav  
│   │   └── the\_pilot.wav                \# \-\> ../versions/the\_pilot\_v3.wav  
│   ├── versions/                        \# Append-Only Historical Vault (Pinned Takes)  
│   │   ├── bog\_v1.wav                   \# Historical baseline (Never mutated/deleted)  
│   │   ├── bog\_v2.wav                   \# Active production reference take  
│   │   ├── the\_pilot\_v1.wav             \# Deprecated early take  
│   │   ├── the\_pilot\_v2.wav             \# Intermediate audit take  
│   │   └── the\_pilot\_v3.wav             \# Current certified production take  
│   ├── embeddings/                      \# Serialized speaker tensor caches (\*.pt)  
│   ├── lexicon.json                     \# Series-scoped dialect & G2P overrides  
│   ├── voice\_manifest.json              \# Canonical machine recipe catalog  
│   └── CHANGELOG.md                     \# Human-readable justification for bumps

> * **/voices/active/ (Floating Runtime Rail):** Contains normalized .wav files named strictly after canonical character slugs. These files are filesystem symlinks pointing to tagged binaries in /voices/versions/. Local microservice instances read from /voices/active/ so that client routing contracts remain stable when a voice reference is revved.  
> * **/voices/versions/ (Append-Only Historical Vault):** Houses every iteration of every reference voice promoted to production. Files follow strict semantic versioning (\${characterId}\_v\${versionNumber}.wav). Deleting, overwriting, or modifying any file in this directory is blocked by CI rules.  
> * **Preservation for Historical Audits:** Because prior episodes were compiled against specific historical references, reproducing or remastering an earlier scene requires the exact reference take and checkpoint used during that broadcast tick. Preserving superseded versions ensures legacy builds remain reproducible without forced migration to newer vocal profiles.

### **7\. Machine Contract: The voice\_manifest.json Specification**

The state of the voice library is governed by voices/voice\_manifest.json under an explicit JSON schema (\[https://specs.studio.internal/schemas/v2/voice\_recipe.json\](https://specs.studio.internal/schemas/v2/voice\_recipe.json)).

{  
  "\$schema": "https://specs.studio.internal/schemas/v2/voice\_recipe.json",  
  "schema\_version": "2.1.0",  
  "series\_slug": "wiregrass-basin",  
  "generated\_at": "2026-09-28T19:30:00Z",  
  "canon\_commit\_sha": "git:9c3e401b2a4d5e8f1d3c5e7b9a2c4e6f8a0b2d4e",  
  "voices": {  
    "char\_020\_the\_pilot": {  
      "display\_name": "The Pilot",  
      "active\_version": "v3",  
      "versions": {  
        "v2": {  
          "file\_path": "voices/versions/the\_pilot\_v2.wav",  
          "sha256": "3e9b1a0f8c2b4d6e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",  
          "duration\_ms": 14200.0,  
          "sample\_rate\_hz": 48000,  
          "channels": 1,  
          "bit\_depth": 24,  
          "integrated\_lufs": \-16.2,  
          "true\_peak\_dbtp": \-1.1,  
          "performer\_consent\_id": "SAG-AFTRA-2026-00388",  
          "recipe": {  
            "tts\_model": "CosyVoice-300M",  
            "checkpoint": {  
              "model\_repo": "FunAudioLLM/CosyVoice-300M",  
              "weights\_sha256": "8a7c29e1f5d4a3b8c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9",  
              "quantization": "FP16"  
            },  
            "conditioning": {  
              "strategy": "ZERO\_SHOT\_CLONE",  
              "reference\_voice\_path": "voices/versions/the\_pilot\_v2.wav",  
              "reference\_sha256": "3e9b1a0f8c2b4d6e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",  
              "speaker\_embedding\_cache": "voices/embeddings/the\_pilot\_v2.pt",  
              "description\_prompt": null  
            },  
            "base\_dsp\_modifiers": {  
              "basePitchShiftSemitones": \-2.0,  
              "formantWarpingFactor": 0.95,  
              "speedScalar": 0.88,  
              "baseBreathiness": 1.60,  
              "baseVocalFry": 0.35  
            },  
            "dynamics\_and\_eq": {  
              "high\_pass\_cutoff\_hz": 90.0,  
              "high\_pass\_slope\_db\_oct": 24,  
              "de\_esser\_threshold\_db": \-18.0,  
              "de\_esser\_frequency\_hz": 6800.0,  
              "target\_integrated\_lufs": \-16.0,  
              "brickwall\_true\_peak\_dbtp": \-1.0,  
              "noise\_floor\_ceiling\_dbfs": \-60.0  
            },  
            "phonetic\_overrides": {  
              "lexicon\_file": "voices/wiregrass-basin/lexicon.json",  
              "enable\_regex\_replacements": true  
            },  
            "banned\_cadences": \[  
              "RAPID\_STACCATO",  
              "RISING\_INFLECTION\_INTERROGATIVE"  
            \]  
          }  
        },  
        "v3": {  
          "file\_path": "voices/versions/the\_pilot\_v3.wav",  
          "sha256": "4a8c9e2b10a5e8f1d3c5e7b9a2c4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0",  
          "duration\_ms": 16850.0,  
          "sample\_rate\_hz": 48000,  
          "channels": 1,  
          "bit\_depth": 24,  
          "integrated\_lufs": \-16.0,  
          "true\_peak\_dbtp": \-1.0,  
          "performer\_consent\_id": "SAG-AFTRA-2026-00388-REN",  
          "recipe": {  
            "tts\_model": "CosyVoice-300M",  
            "checkpoint": {  
              "model\_repo": "FunAudioLLM/CosyVoice-300M",  
              "weights\_sha256": "8a7c29e1f5d4a3b8c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9",  
              "quantization": "FP16"  
            },  
            "conditioning": {  
              "strategy": "ZERO\_SHOT\_CLONE",  
              "reference\_voice\_path": "voices/versions/the\_pilot\_v3.wav",  
              "reference\_sha256": "4a8c9e2b10a5e8f1d3c5e7b9a2c4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0",  
              "speaker\_embedding\_cache": "voices/embeddings/the\_pilot\_v3.pt",  
              "description\_prompt": null  
            },  
            "base\_dsp\_modifiers": {  
              "basePitchShiftSemitones": \-2.5,  
              "formantWarpingFactor": 0.92,  
              "speedScalar": 0.85,  
              "baseBreathiness": 1.80,  
              "baseVocalFry": 0.45  
            },  
            "dynamics\_and\_eq": {  
              "high\_pass\_cutoff\_hz": 90.0,  
              "high\_pass\_slope\_db\_oct": 24,  
              "de\_esser\_threshold\_db": \-18.0,  
              "de\_esser\_frequency\_hz": 6800.0,  
              "target\_integrated\_lufs": \-16.0,  
              "brickwall\_true\_peak\_dbtp": \-1.0,  
              "noise\_floor\_ceiling\_dbfs": \-60.0  
            },  
            "phonetic\_overrides": {  
              "lexicon\_file": "voices/wiregrass-basin/lexicon.json",  
              "enable\_regex\_replacements": true  
            },  
            "banned\_cadences": \[  
              "RAPID\_STACCATO",  
              "RISING\_INFLECTION\_INTERROGATIVE"  
            \]  
          }  
        }  
      }  
    }  
  }  
}

### **8\. Algebraic Composition with Runtime Somatics & Master Clock Integration**

The baseline parameters declared in voice\_manifest.json do not operate in isolation; they compose algebraically with runtime somatic damage and emotional conditions recorded in the state ledger.

CANONICAL STATE LEDGER (Cloudflare D1 / SQLite)  
├─ voice\_manifest.json: Neutral biological baseline  
└─ Somatic Vector: Active pathologies, severities \[0.0, 1.0\], basis-point meters  
                          │  
                          ▼ Algebraic Composition Channel  
DYNAMIC INGRESS DISPATCH (POST :8000/generate)  
├─ Speed\_eff       \= speedScalar \* (1.0 \- 0.30 \* (FATIGUE / 10,000))  
├─ Formant\_eff     \= formantWarpingFactor \* Delta\_Formant\_scene  
├─ Pause\_eff       \= baseBreathiness \* (1.0 \+ 1.40 \* (FATIGUE / 10,000)^2)  
└─ Fry\_eff         \= clamp(baseVocalFry \+ Delta\_Fry\_scene, 0.0, 1.0)  
                          │  
                          ▼  
audio-microservice (Pure CPU / System RAM on Port 8000\)  
                          │  
                          ▼ Linear 48 kHz / 24-bit PCM WAV Stem  
duration\_ms \= 4,280 ms ──► target\_frames \= ceil((4280 / 1000\) \* 24\) \= 103 frames

#### **Runtime Algebraic Formulas**

When dramatic events increment physical damage, the compiler evaluates effective runtime parameters:

*F*0,eff​\=basePitchShiftSemitones+ΔPitchscene​  
*W*eff​\=formantWarpingFactor×ΔFormantscene​  
*P*eff​\=speedScalar×(1.0−0.30×(10,000SOMATIC\_FATIGUE​))  
Πeff​\=baseBreathiness×(1.0+1.40×(10,000SOMATIC\_FATIGUE​)2)  
Φeff​\=clamp(baseVocalFry+0.50(10,000SOMATIC\_FATIGUE​)\+0.40(10,000PHYSICAL\_PAIN​),0.0,1.0)

#### **The Master Physical Clock Axiom & Integer Quantization**

Because generative video diffusion backends possess no innate biological cadence or respiratory timing, speech must exist on disk before video timelines can be calculated:

> * **The Invariant Timebase:** Spoken dialogue is the non-negotiable physical pacemaker for the entire pipeline; audio duration dictates visual cuts, while picture operates as an integer projection mapped to audio duration.  
> * **Duration Extraction:** The synthesized .wav buffer is inspected via ffprobe to determine its exact continuous duration in milliseconds (*D*ms​).  
> * **Ceiling Quantization:** The discrete 24 fps video frame budget is derived via integer ceiling arithmetic:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉\=⌊1000(*D*ms​×24)+999​⌋  
> * **Zero-Length Guard:** Interjections under 41.67 ms are clamped to a minimum duration of 1 frame (41.67 ms) with digital silence padding, preventing inverted timeline intervals in Remotion \<Sequence\> wrappers:  
>   const targetFrames \= Math.max(1, Math.ceil((durationMs / 1000\) \* 24));

> * **Timeline Locking:** Once an audio stem clears conformance, its duration and frame budget are permanently frozen in exposure\_sheet.json. The stem is never re-synthesized during visual compositing, ensuring that microsecond vocoder jitter cannot invalidate downstream diffusion plate allocations or optical cut boundaries.

### **9\. Directed Acyclic Graph (DAG) Governance & Blast Radius Analysis**

In the studio’s Directed Acyclic Graph (DAG) compilation engine, voice\_manifest.json is a cryptographic dependency node anchoring into render\_manifest.json and the root versions.json:

                           THE CANONICAL PROVENANCE DAG  
                             
       \[ series-lore \] (Human Git Commits / Canon Ledger)  
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

#### **Cryptographic Recipe Digests (*H*recipe​)**

> 1. **Canonical Serialization (RFC 8785):** The compiler sorts object keys alphabetically, strips whitespace, and computes a SHA-256 hash for lexicon.json (*H*lexicon​) and each voice recipe.  
> 2. **Recipe Digest Binding:** Every character recipe computes a deterministic HMAC-SHA256 signature:  
>    *H*recipe​\=HMAC-SHA256(Secret,Engine∥WeightsSHA∥RefSHA∥BaseDSP∥*H*lexicon​)

#### **Forward Blast Radius Analysis (*R*blast​)**

When a character's reference take is updated in /voices/versions/ and the active symlink is repointed, the compiler calculates the transitive reachability of that character identity across active scenes:

*R*blast​(*v*)=*n*∣I(*v*)∣​

> * **Selective Invalidation:** The DAG traversal marks downstream dependent nodes dirty (is\_dirty \= 1). Only scenes featuring the modified character are scheduled for re-synthesis and visual compositing.  
> * **Corpus Protection Threshold:** If the blast radius exceeds 40% (*R*blast​\>0.40), the build halts with an EXCESSIVE\_BLAST\_RADIUS\_BREACH. This requires explicit showrunner sign-off before invalidating large swathes of the cached media corpus, preventing accidental fleet-wide compute thrashing.  
> * **Backward Forensic Traceability:** If a visual or audio defect is observed on broadcast, any reviewer can trace an anomalous frame back through render\_manifest.json → exposure\_sheet.json → synthesized stem SHA-256 → voice\_manifest.json version tag → legal clearance ID (performer\_consent\_id) → originating Git commit (*H*root​), providing end-to-end provenance across the lifecycle of series-assets-audio.

---

*User prompt: {{FOCUS:  5\. Semantic Filtering & The Phonetic Firewall (Series-Assets-Audio) }} /extreme-details*

### **Response: 1\. Architectural Mandate & The *T*0​\=\$0.00 Economic Fail-Fast Perimeter**

The **Semantic Filtering & Phonetic Firewall** subsystem within series-assets-audio operates as an automated pre-flight security and normalization perimeter positioned at the boundary between abstract narrative intent (**Axis A: Meaning**) and physical waveform synthesis (**Axis B: Representation**). Under the studio's event-sourced architectural tuple ⟨S,A,I,R*m*​⟩, Large Language Models (LLMs) and neural Text-to-Speech (TTS) vocoders operate strictly as untrusted, headless rendering workers possessing zero narrative, temporal, or biological authority. Canonical world truth resides exclusively in the immutable relational ledger (Cloudflare D1 / SQLite), while sensory audio files are treated as downstream physical projections.

SCREENPLAY AST (dialogue\_ast.json from worker-sower-engine)  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ PRE-FLIGHT COMPILATION GATE (T0 \= \$0.00 COMPUTE COST)                 │  
│ • Asserts Script Verbatim Parity (.fountain vs. dialogue\_ast.json)     │  
│ • Epistemic Third-Rail Audit (Ignorance by Omission)                  │  
│ • Evaluates Vocal-Motor Feasibility Theorem (c.conditions vs speech)   │  
│ • Prosodic Exclusion Firewall: AST Directives ∩ banned\_cadences \= ∅   │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
               ┌────────────────┴────────────────┐  
               ▼                                 ▼  
         \[DISCREPANCY\]                     \[VALIDATED\]  
       HALT: Exit Code 1                         │  
    VOCAL\_DELIVERY\_BREACH                        ▼  
                                Ingress to audio-microservice (:8000)  
                                (Pure CPU / 0 MB GPU VRAM Allocation)

#### **The Generative Failure Modes**

Neural autoregressive vocoders (e.g., CosyVoice, Parler-TTS, Piper) exhibit two structural failure modes when deployed without deterministic constraints:

> 1. **"The Beige Plague":** Neural vocoders regress toward the statistical median of their training sets, defaulting to upbeat, conversational, or emotionally flattened delivery styles. Left unconstrained, models synthesize cheery rising inflections or generic pacing even when the scene demands traumatic exhaustion or existential dread.  
> 2. **Out-of-Vocabulary (OOV) Phonetic Hallucinations:** When confronted with invented world lore, dialect contractions, or technical telemetry, neural grapheme-to-phoneme (G2P) networks produce erratic syllabic splitting, dropped consonants, and unpredictable duration shifts.

#### **The Economic Fail-Fast Law (*T*0​\=\$0.00)**

Because continuous dialogue duration (*D*ms​) measured via ffprobe establishes the physical master clock that dictates downstream 24 fps integer video cut allocations (⌈(*D*ms​/1000)×24⌉), any semantic contradiction, dialect hallucination, or timing drift destabilizes the visual exposure sheet and invalidates video diffusion plates.

The Semantic Filtering and Phonetic Firewall intercepts these errors at compile time (*T*0​\=\$0.00), terminating the build before opening network sockets to the local audio-microservice daemon on port 8000, before allocating CPU inference cycles on Rig 1, and before spending GPU resources on Rig 2 ComfyUI video diffusion passes.

### **2\. Epistemic & Semantic Firewalls (Pre-Flight Ingress)**

Before dialogue text is processed by phonetic replacement dictionaries, it must pass through three semantic verification gates:

               PRE-FLIGHT SEMANTIC INGRESS VERIFICATION  
┌────────────────────────────────────────────────────────────────────────┐  
│ 1\. DUAL-ARTIFACT VERBATIM PARITY LINTER (assertVerbatimParity)         │  
│ • Strips whitespace/casing: Normalized(Fountain) \=== Normalized(AST)   │  
│ • Zero-tolerance character mismatch halts build immediately            │  
├────────────────────────────────────────────────────────────────────────┤  
│ 2\. EPISTEMIC FIREWALL & THIRD-RAIL AUDIT (Ignorance by Omission)       │  
│ • Scans dialogue tokens against known\_secrets ledger                   │  
│ • Enforces negative fences: characters cannot voice unrevealed facts   │  
├────────────────────────────────────────────────────────────────────────┤  
│ 3\. THE VOCAL-MOTOR FEASIBILITY THEOREM                                 │  
│ • c.has\_verbal\_directives \=\> ("mute" ∉ cond ∧ "speak" ∉ banned\_verbs)  │  
│ • Traps physical somatic contradictions (e.g., severed trachea)        │  
└────────────────────────────────────────────────────────────────────────┘

#### **1\. Dual-Artifact Verbatim Parity Linter**

The pipeline strictly enforces synchronization between human-readable .fountain screenplays and the machine-executable dialogue\_ast.json:

> * An automated parser (assertVerbatimParity) normalizes both strings by stripping exterior whitespace and typography variations.  
> * If a human writer alters dialogue in the screenplay file without re-compiling the shot AST, the linter catches the mismatch and halts execution with exit code 1, preventing media desynchronization.

#### **2\. Epistemic Horizon & Third-Rail Audit (Ignorance by Omission)**

Characters within the studio fleet are bound by their subjective epistemic horizons:

> * Each character possesses an active epistemic\_vector tracking known entities, observed actions, and secrets.  
> * If an entity’s ledger record does not include a specific plot secret (e.g., secret\_004\_solvent\_taint), an automated lexical scanner audits the dialogue tokens for third-rail terms.  
> * Any unauthorized informational leak aborts compilation at *T*0​, ensuring characters never voice information outside their canonical experience.

#### **3\. The Vocal-Motor Feasibility Theorem**

Before a vocoder is invoked, the compiler verifies that the physical state of the character’s vocal anatomy permits verbalization:

*c*.has\_verbal\_directives⟹("mute"∈/*c*.conditions∧"speak"∈/*c*.banned\_kinetic\_verbs)

If the canonical state ledger records trauma such as crushed laryngeal cartilage, acute asphyxiation, or a severed trachea, any spoken line assigned to that entity raises a fatal VOCAL\_DELIVERY\_BREACH.

#### **4\. Prosodic Exclusion Filters (banned\_cadences)**

Declared within voices/\<series\_slug\>/voice\_manifest.json, the banned\_cadences array acts as a prosodic firewall:

Δprosody​\=(DirectivesAST​∪InferredStyle(Prose))∩Recipe.banned\_cadences  
Δprosody​\=∅⟹HALT\_REJECT(Exit Code 1)  
{  
  "banned\_cadences": \[  
    "RAPID\_STACCATO",  
    "RISING\_INFLECTION\_INTERROGATIVE",  
    "CHEERFUL\_MODULATION",  
    "UPBEAT\_LILT",  
    "SING\_SONG\_RESONANCE"  
  \]  
}

| Cadence Identifier | Excluded Acoustic Behavior | Somatic / Narrative Invariant |
| :---- | :---- | :---- |
| RAPID\_STACCATO | Syllable duration \<80 ms; zero inter-clause pause insertion; high-velocity consonant attacks. | **Pulmonary Damage:** Severe lung fibrosis or defoliant inhalation (severity≥0.70) prevents subglottal pressure recharge. |
| RISING\_INFLECTION\_INTERROGATIVE | High-register terminal *F*0​ glides (+4.0 to +8.0 semitones) on declarative phrases. | **Exhaustion / Menace:** Banned for authoritative or completely defeated characters whose breath decays to zero at line tails. |
| CHEERFUL\_MODULATION | Wide fundamental frequency variance (*σF*0​​\>45 Hz); bright harmonic excitation. | **Somatic Shock / Trauma:** Locks vocal folds into rigid, hypokinetic physical patterns, eliminating melodic variance. |
| UPBEAT\_LILT | Rhythmic anapestic or dactylic stress skipping with ascending phrase onsets. | **Paranoia Clocks:** Banned in settings with systemic dread to prevent unearned comedic buoyancy. |
| SING\_SONG\_RESONANCE | Sustained vowel durations holding stationary pitch with drift \<0.1 semitones. | **Realism Mandate:** Banned studio-wide to eradicate synthetic nursery-rhyme artifacts native to small vocoders. |

### **3\. The Phonetic Firewall Architecture (lexicon.json)**

Neural TTS systems map tokenized text into acoustic frames through internal G2P rules and learned latent embeddings. Because out-of-the-box G2P models break when compiling bespoke worldbuilding nouns or regional vernacular, the pipeline routes all text through voices/\<series\_slug\>/lexicon.json.

RAW SCRIPT INGRESS (dialogue\_text: "The siphon wrench is under the culvert.")  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 1: REGEX SYNTACTIC EXPANSION                                     │  
│ • Evaluates ordered PCRE regex replacements with word boundaries (\\b)  │  
│ • Expands colloquial elisions, technical metrics, and contractions     │  
│ • Isolates dialect transforms safely away from upstream cloud APIs     │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 2: CASE-INSENSITIVE LEXICAL TOKENIZATION                         │  
│ • Splits normalized text into lexical lemmas and punctuation tokens   │  
│ • Preserves prosodic punctuation (?, \!, .) to condition pitch curves   │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 3: PHONETIC LEXICON OVERRIDE LOOKUP                              │  
│ • Strips punctuation for lookup against phonetic\_rules keys            │  
│ • Hit: Replaces token with phonetic string or ARPAbet phoneme sequence │  
│ • Miss: Passes token untouched to engine default G2P fallback          │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 4: ENGINE-SPECIFIC PHONEME ADAPTATION                            │  
│ • Piper/ONNX: Injects numeric token IDs from eSpeak-NG mapping matrix  │  
│ • CosyVoice: Formats as SSML/IPA wrapper tags (\<phoneme ph="..."\>)     │  
│ • Parler-TTS: Formats as capitalized syllable stress representations   │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
       DISPATCHED TO NEURAL SYNTHESIS ENGINE (48 kHz / 24-bit PCM)

#### **The Four-Stage Pre-Inference Normalization Pipeline**

> 1. **Stage 1: Regex Syntactic & Dialect Expansion:** Evaluates sequential regular expressions enforcing word boundaries (\\b) to prevent substring collisions (e.g., ensuring a pattern matching \\b(in)\\b does not alter the interior of "siphon").  
> 2. **Stage 2: Case-Insensitive Tokenization:** Isolates word tokens while preserving prosodic terminal punctuation (?, \!, ., —). Autoregressive neural vocoders require these punctuation tokens to condition terminal pitch inflections, glottal closures, and phrase-final lengthening.  
> 3. **Stage 3: Lexicon Dictionary Lookup:** Matches stripped lexical tokens case-insensitively against phonetic\_rules. If matched, the token is substituted with its standardized phonetic representation.  
> 4. **Stage 4: Engine-Specific Adaptation:** Converts phonemes into the format required by the series' neural synthesis backend:  
   * **Piper (VITS / ONNX):** Maps phonemes directly to numeric token IDs via its internal mapping table.  
   * **CosyVoice-300M:** Formats phonemes as SSML wrappers (e.g., \<phoneme ph="s aɪ 1 f ʌ n"\>siphon\</phoneme\>) for its flow-matching diffusion network.  
   * **Parler-TTS:** Converts phonemes into syllable-stressed strings (e.g., "SAI-fun"), which its text encoder parses reliably.

#### **The Authoritative Machine Schema (lexicon.schema.json)**

Every series lexicon must validate against lexicon.schema.json under schema\_version: "2.0.0" with additionalProperties: false to eliminate configuration drift:

{  
  "\$schema": "https://json-schema.org/draft/2020-12/schema",  
  "title": "SeriesLexiconSchema",  
  "type": "object",  
  "required": \[  
    "schema\_version",  
    "series\_slug",  
    "phonetic\_alphabet",  
    "phonetic\_rules",  
    "regex\_replacements"  
  \],  
  "additionalProperties": false,  
  "properties": {  
    "schema\_version": { "type": "string", "enum": \["2.0.0"\] },  
    "series\_slug": { "type": "string", "pattern": "^\[a-z0-9\]+(-\[a-z0-9\]+)\*\$" },  
    "phonetic\_alphabet": { "type": "string", "enum": \["ARPABET", "IPA", "CUSTOM\_STRESS\_EXPANSION"\] },  
    "phonetic\_rules": {  
      "type": "object",  
      "additionalProperties": { "type": "string", "minLength": 1 }  
    },  
    "regex\_replacements": {  
      "type": "array",  
      "items": {  
        "type": "object",  
        "required": \["pattern", "replacement", "description"\],  
        "additionalProperties": false,  
        "properties": {  
          "pattern": { "type": "string" },  
          "replacement": { "type": "string" },  
          "description": { "type": "string" },  
          "case\_sensitive": { "type": "boolean", "default": false }  
        }  
      }  
    },  
    "banned\_pronunciations": {  
      "type": "object",  
      "additionalProperties": {  
        "type": "array",  
        "items": { "type": "string" }  
      }  
    }  
  }  
}

### **4\. Dialect Mechanics & The NLP Slur Collision Defense**

Narrative realism in regional or fantasy worlds requires dropped consonants, colloquial elisions, and contracted speech. However, writing non-standard phonetic spellings directly into screenplay prose introduces catastrophic vulnerabilities across cloud-connected pipelines:

               THE MULTI-TIER RECEPTION SAFETY FIREWALL  
                 
LAYER 1: SCREENPLAY AST / CANON D1 DATABASE (Axis A: Meaning)  
┌────────────────────────────────────────────────────────────────────────┐  
│ • Standard English: "Do you hear what they are saying in the culvert?" │  
│ • Completely bypasses upstream cloud LLM and API moderation filters   │  
│ • Passed verbatim into dialogue\_ast.json                               │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼ Dispatched to Rig 1 Host (:8000)  
LAYER 2: LOCAL PHONETIC FIREWALL (Axis B: Representation)  
┌────────────────────────────────────────────────────────────────────────┐  
│ • audio-microservice executes voices/\<series\>/lexicon.json             │  
│ • Runs 100% offline behind local port 8000 (Zero external cloud APIs)  │  
│ • Expands: \\b(do you)\\b ──► "dee-yoo", \\b(\\w+)ing\\b ──► "\$1-in'"       │  
│ • Synthesizes authentic regional drawl via CosyVoice-300M              │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼ Post-Render Assembly  
LAYER 3: TRANSMEDIA CLOSED-CAPTION STREAM (.srt Timed Text)  
┌────────────────────────────────────────────────────────────────────────┐  
│ • Subtitle generator extracts from canonical dialogue\_text, NOT audio  │  
│ • Captions display: "Do you hear what they are saying in the culvert?" │  
│ • Non-verbal effort sounds encoded clinically: \[sharp exhale\], \[grunt\] │  
│ • Bypasses automated YouTube / SVOD platform transcription censorship  │  
└────────────────────────────────────────────────────────────────────────┘

#### **The Dual-Layer Separation of Concerns**

> 1. **Upstream Guardrail Protection:** Cloud-based LLMs, API linters, and edge gateways parse tokens through strict moderation classifiers. Writing eye-dialect contractions (such as colloquial negations or clipped imperatives) frequently triggers false-positive toxicity or slur detections. The pipeline enforces an invariant: **Screenplay text stored in Cloudflare D1 and dialogue\_ast.json must remain 100% standard grammatical English prose**.  
> 2. **Offline Local Dialect Expansion:** Dialect transforms are executed downstream by the local audio-microservice daemon running on Rig 1\. Operating completely offline behind loopback port 8000, regex replacements expand clean text into regional vernacular without passing through external moderation filters.  
> 3. **Transmedia Subtitle Hygiene (POD-05 / POD-17):** Timed-text subtitle files (.srt) and closed-caption assets are compiled directly from the clean AST dialogue\_text, rather than automated audio transcriptions. Non-verbal combat exhalations and vocal strain sounds are codified using clinical physiological descriptions (\[sharp exhale\], \[strained grunt\], \[agonized groan\]) instead of phonetic onomatopoeia (huff, urgggh, aaargh), protecting published releases from automated platform demonetization or content strikes.

### **5\. Multi-Series Parametric Isolation**

Asset manifests and pronunciation rules are strictly segregated under series namespaces (voices/\<series\_slug\>/), guaranteeing that dialect rules in one universe never contaminate sibling repositories:

series-assets-audio/voices/  
├── under-the-floorboards/         \# Goblin Universe: Piper-ONNX (Pure CPU)  
│   ├── lexicon.json               \# Alphabet: CUSTOM\_STRESS\_EXPANSION  
│   └── voice\_manifest.json        \# Fast speech scalars, high-register pitch  
├── wiregrass-basin/               \# Southern Gothic Noir: CosyVoice-300M (FP16)  
│   ├── lexicon.json               \# Alphabet: CUSTOM\_STRESS\_EXPANSION  
│   └── voice\_manifest.json        \# Vocal fry, low chest drones, breath dilation  
└── deep-space-salvage/            \# Hard Sci-Fi Telemetry: Kokoro-82M / Chatterbox  
    ├── lexicon.json               \# Alphabet: ARPABET  
    └── voice\_manifest.json        \# NATO cadence, metric expansion, comms bandpass

#### **Case Study A: Domestic Goblin Farce (voices/under-the-floorboards/lexicon.json)**

> * **World Axiom:** Fast, anxious, clipped domestic goblin farce set beneath kitchen floorboards.  
> * **Acoustic Profile:** High pitch (*F*0​\+3.8 st), compressed vocal tract (*W*\=0.86), fast tempo (1.18×), front-of-mouth plosive attacks.  
> * **Target Engine:** Piper-ONNX (VITS architecture running on CPU with ≈80 MB RAM).

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "under-the-floorboards",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "siphon": "SAI-fun",  
    "snerk": "SNERK",  
    "grissel": "GRIZ-zul",  
    "marrow-bone": "MAIR-oh-BOHN",  
    "floor-timbers": "FLOR-TIM-berz",  
    "skitter": "SKIT-ter",  
    "tallow": "TAL-oh",  
    "peevish": "PEE-vish"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(d'you)\\\\b",  
      "replacement": "dyoo",  
      "description": "Contracts 'd'you' to quick goblin dental glide"  
    },  
    {  
      "pattern": "\\\\b(gotta)\\\\b",  
      "replacement": "GAHT-tuh",  
      "description": "Forces clipped staccato on glottal stop"  
    },  
    {  
      "pattern": "\\\\b(underneath)\\\\b",  
      "replacement": "un-ner-NEETH",  
      "description": "Flattens 'd' sound for subterranean colloquial speech"  
    },  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(in|inch|inches)\\\\b",  
      "replacement": "\$1 IN-chez",  
      "description": "Expands dimensional measurements for hoarded items"  
    }  
  \],  
  "banned\_pronunciations": {  
    "siphon": \["SEE-fon", "sih-FON"\],  
    "grissel": \["GRIZ-lee", "gray-SEL"\]  
  }  
}

#### **Case Study B: Southern Gothic Industrial Noir (voices/wiregrass-basin/lexicon.json)**

> * **World Axiom:** Agricultural defoliant poisoning, stagnant blackwater sloughs, heavy vocal fry, and somatic exhaustion.  
> * **Acoustic Profile:** Low pitch (*F*0​−2.5 st), heavy vocal fry (Φ≥0.45), elongated diphthongs, and dropped terminal alveolar nasals.  
> * **Target Engine:** CosyVoice-300M (Flow-matching diffusion vocoder running on CPU).

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "wiregrass-basin",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "culvert": "KULL-vert",  
    "gallbreaker": "GAWL-bray-ker",  
    "creosote": "KREE-uh-soht",  
    "slough": "SLOO",  
    "diesel": "DEEZ-ul",  
    "spurl": "SPERL",  
    "defoliant": "dee-FOH-lee-unt",  
    "wiregrass": "WY-er-grass"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(ain't)\\\\b",  
      "replacement": "aynt",  
      "description": "Standardizes dialect negation without nasal pinch"  
    },  
    {  
      "pattern": "\\\\b(do you)\\\\b",  
      "replacement": "dee-yoo",  
      "description": "Softens interrogative onset into regional drawl"  
    },  
    {  
      "pattern": "\\\\b(\\\\w+)ing\\\\b",  
      "replacement": "\$1-in'",  
      "description": "Enforces dropped alveolar nasals across all continuous verbs"  
    },  
    {  
      "pattern": "\\\\b(drainage)\\\\b",  
      "replacement": "DRAY-nij",  
      "description": "Prevents over-enunciation of second syllable"  
    }  
  \],  
  "banned\_pronunciations": {  
    "slough": \["SLUFF", "SLOH"\],  
    "creosote": \["kree-OH-soht"\]  
  }  
}

#### **Case Study C: Hard Sci-Fi Vacuum Telemetry (voices/deep-space-salvage/lexicon.json)**

> * **World Axiom:** Sealed space suits, depressurized salvage corridors, and narrow-band RF telemetry.  
> * **Acoustic Profile:** Military NATO cadence, flat pitch modulation, radio bandpass (300 Hz to 3,400 Hz), zero vocal fry.  
> * **Target Engine:** Kokoro-82M (Compact Style-TTS2 variant) and Chatterbox-Base.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "deep-space-salvage",  
  "phonetic\_alphabet": "ARPABET",  
  "phonetic\_rules": {  
    "apogee": "AE1 P AH0 JH IY0",  
    "perigee": "P EH1 R AH0 JH IY0",  
    "eva": "IY1 V IY1 EY1",  
    "rcs": "AA1 R S IY1 EH1 S",  
    "hydrazine": "HH AY1 D R AH0 Z IY2 N",  
    "bulkhead": "B AH1 L K HH EH2 D",  
    "oracle": "AO1 R AH0 K AH0 L"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(kpa|kilopascals?)\\\\b",  
      "replacement": "\$1 KIL-oh-pas-kahlz",  
      "description": "Metric pressure telemetry expansion"  
    },  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(m/s|meters per second)\\\\b",  
      "replacement": "\$1 MEE-terz per SEK-und",  
      "description": "Velocity vector expansion"  
    },  
    {  
      "pattern": "\\\\b(atmo)\\\\b",  
      "replacement": "AT-moh",  
      "description": "Salvage slang for atmosphere"  
    },  
    {  
      "pattern": "\\\\b(o2)\\\\b",  
      "replacement": "OH-TOO",  
      "description": "Life-support gas telemetry"  
    }  
  \],  
  "banned\_pronunciations": {  
    "eva": \["EE-vah"\],  
    "rcs": \["er-SEE-ess"\]  
  }  
}

### **6\. Post-Synthesis Conformance Gauntlet & Verification Gates**

Once an uncompressed 48 kHz / 24-bit PCM buffer is emitted by the local daemon on port 8000, it must clear the five-stage conformance pipeline before it is committed to disk:

RAW TTS BUFFER (48 kHz / 24-bit WAV from Port 8000\)  
       │  
       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 1: SPEECH-TO-TEXT (STT) VERBATIM ALIGNMENT GATE                 │  
│ • Transcribes synthesized waveform via local Whisper inference pass    │  
│ • Normalizes dialect tokens via reverse-lexicon mapping                │  
│ • Asserts character-for-character parity against dialogue\_ast.json     │  
│ • Negative Check: Scans phonemes against banned\_pronunciations map     │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Pass (Zero Discrepancy)  
                                   ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 2: PRE-CONFORM SPECTRAL HYGIENE                                 │  
│ • High-Pass Roll-Off: 24 dB/octave Butterworth filter below 80–100 Hz  │  
│ • Optical De-Esser: Attenuates harsh sibilance in the 6–8 kHz band     │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Pass (Clean Spectrum)  
                                   ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 3: TWO-PASS EBU R128 LOUDNORM (FFmpeg ebur128)                  │  
│ • Target: \-16.0 LUFS (±1.0 LUFS Web) / \-24.0 LKFS (Broadcast)          │  
│ • Pass 1: Measure JSON stats; Pass 2: Apply linear gain normalization │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Pass (Target Conformed)  
                                   ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 4: BRICKWALL TRUE-PEAK LIMITER                                  │  
│ • Clamps inter-sample peaks strictly to \<= \-1.0 dBTP (Peak \!= dBFS)    │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Pass (No Inter-Sample Overs)  
                                   ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 5: NOISE FLOOR GATE & LATENT STABILITY CERTIFICATION            │  
│ • Asserts unvoiced pause RMS remains strictly below \-60.0 dBFS         │  
│ • Protects sidechain ducking from ambient noise floor surges           │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │ Pass (Exit Code 0\)  
                                   ▼  
      Committed to public/audio/dialogue/\${sceneId}\_SH\${shotIndex}.wav

#### **Filter 1: Local STT Verbatim Alignment Gate**

> * **On-Device Speech-to-Text Transcription:** A local Whisper instance running on Rig 1 transcribes the raw audio buffer.  
> * **Reverse-Lexicon Normalization:** The gate applies the series' reverse-lexicon dictionary to map expanded dialect tokens back to standard orthography (e.g., converting recognized "dee-yoo" back to "do you" and "run-in'" back to "running").  
> * **Verbatim Parity Assertion:** The normalized transcript is compared character-for-character against dialogue\_text in dialogue\_ast.json. Dropped tokens, stuttering loops, or vocoder hallucinations throw an immediate STT\_ALIGNMENT\_BREACH.  
> * **Filter 1B: Negative Assertion Trap (banned\_pronunciations):** The transcribed phoneme sequence is cross-referenced against the banned\_pronunciations map in lexicon.json. If the model synthesizes "siphon" as "SEE-fon" or "slough" as "SLUFF", the stem is rejected.

#### **Error Taxonomy & Conformance Routing**

Failures intercepted across the conformance battery route through a strict error taxonomy:

| Failure Class | Example Trigger | System Escalation | Cost Impact |
| :---- | :---- | :---- | :---- |
| **Deterministic Failures** | Parity mismatch, banned\_cadences violation, epistemic third-rail leak, unmapped lemma. | **Immediate Fatal Halt (Exit 1).** Zero retries (*N*max​\=0) because identical inputs produce identical failures. | **\$0.00**; halts before GPU video diffusion or optical compositing runs. |
| **Stochastic Failures** | Vocoder click, dropped phoneme, transient noise floor breach (\>−60 dBFS). | **Bounded Retry (*N*max​\=2).** Re-synthesizes the failing stem with an altered PRNG seed. | Negligible; re-runs single local CPU audio pass. |
| **Infrastructure Failures** | Scratch disk contention, socket timeout on port 8000, partial disk write. | **Idempotent Resume.** Re-attaches from the last verified .tmp buffer via atomic rename. | Zero state loss. |

### **7\. DAG Governance, Cryptographic Anchoring & Selective Invalidation**

In the studio’s Directed Acyclic Graph (DAG) compilation engine, lexicon.json is not an unversioned helper file; it is a version-controlled dependency node that anchors into voice\_manifest.json and the overarching render\_manifest.json:

               SERIES LEXICON (voices/\<series\_slug\>/lexicon.json)  
                                         │  
                                         ▼  
                     Canonical Serialization (RFC 8785\)  
                                         │  
                                         ▼  
                                  lexicon\_sha256  
                                         │  
                     ┌───────────────────┴───────────────────┐  
                     ▼                                       ▼  
       voices/voice\_manifest.json                 render\_manifest.json  
       (Baked into H\_recipe digest)               (Root Provenance Seal)

#### **1\. Cryptographic Recipe Digests (*H*recipe​)**

> 1. **RFC 8785 Canonical JSON Serialization:** The compiler loads lexicon.json, sorts all keys alphabetically, strips non-semantic whitespace, and calculates its SHA-256 digest:  
>    *H*lexicon​\=SHA-256(Canonicalize(lexicon.json))  
> 2. **Recipe Digest Binding:** Every voice recipe within voice\_manifest.json incorporates *H*lexicon​ into its identity digest:  
>    *H*recipe​\=HMAC-SHA256(Secret,Engine∥WeightsSHA∥RefSHA∥BaseDSP∥*H*lexicon​)

#### **2\. The Lexical Selective Invalidation Walk**

When an engineer updates an entry in voices/\<series\_slug\>/lexicon.json (e.g., updating "siphon": "SAI-fun" → "SAI-fawn"), a naive compiler would mark every audio line across the series dirty, triggering expensive re-renders. The pipeline prevents this by running an AST token intersection scan:

1\. GIT COMMIT COMMITTED ──► lexicon\_sha256 mutates  
                                │  
                                ▼  
2\. H\_recipe INVALIDATION ──► All recipes in series marked is\_dirty \= 1  
                                │  
                                ▼  
3\. AST SCAN ──► Compiler inspects drafts/dialogue\_ast.json for "siphon"  
                                │  
       ┌────────────────────────┴────────────────────────┐  
       ▼                                                 ▼  
\[ CONTAINS TARGET TOKEN \]                       \[ DOES NOT CONTAIN TOKEN \]  
Shot 01: "...hand over the siphon wrench."      Shot 02: "I carried the rations\!"  
• Stem ep040\_sh01.wav marked dirty              • Stem cached; untouched (is\_dirty \= 0\)  
• Dispatched to audio-microservice (:8000)      • Zero CPU re-synthesis  
• Audio duration re-measured via ffprobe        • Frame count preserved (75 frames)  
• target\_frames re-derived for Sequence 01      • Visual Plate retained

> * **Lemma Intersection Audit:** The compiler sweeps dialogue\_ast.json. Lines that do not contain the target lemma or match the modified regex maintain a cache hit (is\_dirty \= 0), preserving existing .wav files and skipping synthesis.  
> * **Acoustic Master Clock Recalculation:** For lines that contain the mutated lemma, the stem is re-synthesized offline. Because altering pronunciation changes vowel lengths and consonant releases, ffprobe measures the new duration (*D*ms​) and derives the updated 24 fps frame budget:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉  
> * **Downstream Assembly Alignment:** The updated integer frame budget is written to exposure\_sheet.json. Remotion \<Sequence\> layout wrappers and Track 3 sidechain ducking envelopes dynamically update to the new frame count, ensuring the visual cuts and background sound beds remain locked to physical audio timing without inducing cumulative drift.

---

*User prompt: {{FOCUS:  7\. Continuous Beds, Score & Anti-Pumping Sidechain Math (Series-Assets-Audio) }} /extreme-details*

Response: The **Continuous Beds, Score & Anti-Pumping Sidechain Math** architecture within series-assets-audio defines how sustained ambient loops and musical compositions operate as the acoustic foundation of the programmatic viewport. Under the studio's governing principle that **audio is the architect of physical time while picture is an integer projection mapped to audio duration**, Track 3 continuous beds establish an uninterrupted spatial environment that dynamically yields to spoken dialogue without introducing signal pumping, sub-frame phase cancellation, or non-deterministic compressor artifacts.

### **1\. Multi-Track Acoustic Priority Topology & Allocation**

Within the Remotion optical compositor (Episode\_XXX.tsx), audio assembly is organized into three concurrent, prioritized layers mounted inside the component tree:

┌────────────────────────────────────────────────────────────────────────┐  
│ TRACK 1: SPOKEN DIALOGUE STEMS (High Priority / Fixed Master Clocks)   │  
│ • Uncompressed 48 kHz / 24-bit linear PCM WAVs synthesized via TTS     │  
│ • Quantized to 24 fps integer frames via ffprobe (target\_frames)       │  
│ • Mastered to \-16.0 LUFS (±1.0 LUFS), True-Peak \<= \-1.0 dBTP           │  
├────────────────────────────────────────────────────────────────────────┤  
│ TRACK 2: SPOT FOLEY TRANSIENTS (Medium Priority / Synchronized Events) │  
│ • Punctual physical cues resolved via Mulberry32 PRNG (MurmurHash3)    │  
│ • Snapped to action hold-frames or pre-roll reaction intervals         │  
│ • Hard-panned spatial stereo occupying upper-mid frequency bands       │  
├────────────────────────────────────────────────────────────────────────┤  
│ TRACK 3: CONTINUOUS SOUND BED & SCORE (Low Priority / Attenuated)      │  
│ • Geometric texture loops (\<250 Hz centroid) or separated POD-16 stems │  
│ • Decoupled from hard visual cuts; spans scenes with linear crossfades │  
│ • Programmatically ducked by \-14 dB via Multi-Window Minimum Reducer   │  
└────────────────────────────────────────────────────────────────────────┘

> * **Track 1 (Dialogue Stems):** Operates as the master pacing clock. Lines synthesized by local neural TTS engines (e.g., CosyVoice, Parler-TTS, Piper) are probed via ffprobe to extract continuous millisecond durations (*D*ms​) and quantized to locked integer frame counts (⌈(*D*ms​/1000)×24⌉). Track 1 dialogue commands absolute priority and never yields to lower layers.  
> * **Track 2 (Spot Foley Transients):** Punctual physical interaction effects (e.g., valve clangs, boot squelches) triggered at specific frame offsets. Variant selection is resolved deterministically at generation time using a Mulberry32 PRNG keyed with MurmurHash3(sceneId \+ ":" \+ shotId \+ ":" \+ sampleKey) and anti-clustering salts (:retry).  
> * **Track 3 (Continuous Sound Bed & Score):** Low-priority atmospheric beds and score stems managed by AmbientTrack.tsx. Track 3 is continuously modulated by programmatic gain automation envelopes linked to Track 1 dialogue windows.

### **2\. Sourcing Paradigms & Compositional Governance**

Track 3 ingests environmental textures and musical compositions through two distinct operational pipelines, depending on the narrative universe's aesthetic mandate:

                        TRACK 3 SOURCING PARADIGMS  
                                    │  
         ┌──────────────────────────┴──────────────────────────┐  
         ▼                                                     ▼  
PARADIGM A: POD-16 MULTI-STEM SCORE           PARADIGM B: GEOMETRIC SOUND BEDS  
• Thematic continuity across season           • Chosisme style (Non-melodic)  
• Separated 4-channel stems:                  • Objective spectral indexing:  
  \- Melodic, Harmonic, Percussive, Sub-bass     \- spectralCentroidHz \< 250 Hz  
• Dynamic balance against dialogue              \- intensityBand, texture  
• Respects Audio Pod's locked silences        • Driven by 6-Beat Kinetic Curve

#### **A. POD-16 Score & Composition (Separated Stems)**

When a series utilizes traditional thematic music, the Score & Composition Pod (POD-16) delivers separated multi-track stems rather than a flattened mix:

> * **Stem Separation Over Mixed Output:** Music originates as four discrete master stems: **Melodic**, **Harmonic**, **Percussive**, and **Sub-bass**. Delivering separated stems outranks the convenience of a finished mix because it grants the Assembly Pod programmatic authority to dynamically attenuate specific musical elements (e.g., cutting the melodic stem while leaving the sub-bass drone intact) during spoken dialogue.  
> * **Thematic Continuity:** Leitmotifs are established and varied across an entire season rather than discarded and reinvented per episode, ensuring recurring dramatic meaning outranks novelty.  
> * **Pacing Respect:** Where the Audio Pod has deliberately inserted a dramatic silence as a pacing boundary condition, POD-16 must respect that boundary; Score possesses zero authority to override silence by inserting unrequested cues.

#### **B. Geometric Sound Beds (*Chosisme* Style)**

In austere narrative modes where traditional cinematic scoring is prohibited to prevent smuggling unearned subjective psychology into scenes, the pipeline utilizes continuous geometric ambient beds:

> * **Objective Acoustic Metadata:** Sound loops are indexed in music/manifest.json by quantifiable physical properties rather than subjective emotional tags:

{  
  "id": "sustain\_040hz\_v3",  
  "bpm": null,  
  "key": null,  
  "durationFrames": 3600,  
  "seamlessLoop": true,  
  "intensityBand": \[1, 4\],  
  "texture": "sustained-low-frequency",  
  "spectralCentroidHz": 62,  
  "compatiblePhases": \["stasis", "inspection", "arrest"\]  
}

> * **Spectral Separation:** Continuous ambient beds are strictly filtered to maintain a spectral centroid below 250 Hz (spectralCentroidHz\<250). Restricting ambient sound to low frequencies keeps it spectrally isolated from spot Foley transients and vocal formants (1 kHz to 3.5 kHz), preventing acoustic masking and eliminating manual per-shot EQ adjustments.  
> * **Kinetic Curve Automation:** The screenplay's 6-Beat Kinetic Curve acts as a mix automation score:  
  * *Curve Level (1 to 10):* Dictates loop layer density, tape-drive saturation, and overall gain staging.  
  * *Curve Phase:* Serves as a database query key into the loop library, matching files indexed by compatiblePhases.

### **3\. The Decoupled Continuity Principle**

In conventional post-production, visual cuts, Foley transients, and background audio beds are often cut simultaneously on edit boundaries, producing a mechanical, disjointed rhythm. The viewport pipeline resolves this by enforcing **Decoupled Continuity** between the visual and acoustic planes:

VISUAL TIMELINE (24 fps Integer Cuts via \<Sequence\>)  
\[       Beat 01 / Shot 01 (75f)       \]\[       Beat 02 / Shot 02 (90f)       \]  
▲                                      ▲                                     ▲  
Hard Beat Cut (Frame 0\)                Hard Beat Cut (Frame 75\)              Hard Beat Cut (Frame 165\)

ACOUSTIC TIMELINE (Continuous Domain)  
Track 1: \[--- Line 01 (51f) \---\]                      \[--- Line 02 (72f) \---\]  
Track 2:         \[\*valve\_scrape\*\]                             \[\*boot\_squelch\*\]  
Track 3: ═════════════════════════════════╦════════════════════════════════════  
         Bed A: sustain\_040hz\_v3          ║ Linear Crossfade (Frames 69–81)  
                                          ╚════════════════════════════════════  
                                                   Bed B: culvert\_drainage\_drone

> * **Visual Hard Cuts:** Video plates cut strictly on beat boundaries inside Remotion \<Sequence\> layout primitives; optical dissolves, cross-fades, and wipes are banned to maximize headless Chromium rendering throughput.  
> * **Acoustic Breathing:** While picture cuts sharply, Track 3 ambient sound beds decouple from visual shot boundaries. Background loops persist across cuts, transitioning via linear crossfades at layer boundaries so the acoustic space breathes continuously.

### **4\. Programmatic Sidechain Ducking Math (AmbientTrack.tsx)**

To guarantee vocal intelligibility across headless rendering nodes without relying on non-deterministic, signal-reactive analog compressor plugins, Track 3 implements timeline-keyed mathematical gain envelopes:

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

#### **A. Decibel-Derived Attenuation Math**

During active dialogue windows (*f*start​≤*f*≤*f*end​), background tracks duck by a target depth of **−14 dB**. The ducked gain floor (*V*duck​) is calculated dynamically from the base volume (*V*base​) using standard decibel power conversion:

*V*duck​\=*V*base​×1020attenuation\_dB​

For a standard baseline volume of *V*base​\=0.40 attenuated by −14 dB:

*V*duck​\=0.40×1020−14​≈0.40×0.199526≈0.0798(≈0.08)

#### **B. Quadratic Envelope Trajectory**

Gain curves evaluate across four discrete phases using quadratic easing:

> 1. **Attack Phase (*A*\=6 frames,≈250 ms):** Precedes speech onset (*f*start​−6≤*f*\<*f*start​), smoothly ramping down gain via Easing.out(Easing.quad):  
>    *V*(*f*)=interpolate(*f*,\[*f*start​−6,*f*start​\],\[*V*base​,*V*duck​\],Easing.out(Easing.quad))  
> 2. **Active Speech Window (*f*start​≤*f*≤*f*end​):** Volume is held statically at the ducked floor:  
>    *V*(*f*)=*V*duck​\=0.0798  
> 3. **Release Phase (*R*\=12 frames,≈500 ms):** Follows speech conclusion (*f*end​\<*f*≤*f*end​\+12), recovering smoothly back to baseline volume via Easing.in(Easing.quad):  
>    *V*(*f*)=interpolate(*f*,\[*f*end​,*f*end​\+12\],\[*V*duck​,*V*base​\],Easing.in(Easing.quad))  
> 4. **Baseline / Interstitial Hold (*f*\<*f*start​−6 or *f*\>*f*end​\+12):**  
>    *V*(*f*)=*V*base​\=0.40

#### **C. Swain MRU Pre-Roll Silence Staging**

When the narrative AST triggers an emotional turn or cognitive shock (VISCERAL\_STING), an unvoiced pre-roll buffer of **12 to 24 frames** (500 to 1000 ms) is mounted before speech begins. During this interval (0≤*f*\<*F*pre​), Track 1 dialogue remains completely silent while Track 3 ambient beds remain un-ducked or execute their 6-frame attack ramp, allowing atmospheric sound or Foley impacts to punctuate the character's facial shock.

### **5\. Anti-Pumping Architecture: The Multi-Window Minimum Reducer**

A critical structural defect in programmatic audio mixing is the **"Envelope Pumping Bug"**.

               THE ENVELOPE FIRST-MATCH FLAW (AUDIBLE PUMPING)  
Line 1 Active Window:  \[10 ─────────── 70\]  (Release: frames 70 \-\> 82\)  
Line 2 Active Window:             \[75 ─────────── 130\]  (Attack: frames 69 \-\> 75\)

Without Min-Reducer (Naive First-Match Loop):  
• Frame 71 evaluates Line 1 release condition \-\> Partially ramps volume upward.  
• Loop executes "break" \-\> Never evaluates Line 2 attack ramp\!  
• Result: Background volume jumps up abruptly at frame 71 and crashes down at frame 75\.

               THE MULTI-WINDOW MINIMUM REDUCER (UNION COMPOSITION)  
• All active dialogue windows evaluated simultaneously for frame f.  
• minGain \= Math.min(minGain, windowGain).  
• Result: Overlapping release and attack ramps compose as a continuous union,  
          locking the gain flat at \-14 dB across the entire 5-frame breath gap.

#### **The First-Match Break Defect**

In naive implementations, a developer iterates through dialogue windows with a for loop and exits early using break once a matching time condition is met. If two consecutive lines of dialogue are separated by a short breath gap (e.g., 5 frames, where Line 1 ends at frame 70 and Line 2 starts at frame 75), evaluating frame 71 matches Line 1's release window. The algorithm calculates a partial gain increase and exits before checking Line 2's attack window. This creates an audible gain pumping artifact where background ambiance violently surges and dips between sentences.

#### **The Mathematical Union Reducer**

AmbientTrack.tsx eliminates pumping by computing gain envelopes across all active dialogue windows simultaneously and applying a mathematical minimum reducer (Math.min):

// apps/render/src/components/AmbientTrack.tsx  
import React from 'react';  
import { Audio, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';

export interface DialogueWindow {  
  from: number;  
  to: number;  
}

export interface AmbientTrackProps {  
  ambientFile: string;  
  baseVolume?: number;  
  attenuationDb?: number;  
  dialogueWindows: DialogueWindow\[\];  
  silences?: { fromFrame: number; toFrame: number; duckAmbientDb: number }\[\];  
  attackFrames?: number;  
  releaseFrames?: number;  
}

export const calculateDuckedGain \= (  
  frame: number,  
  baseVolume: number,  
  attenuationDb: number,  
  windows: DialogueWindow\[\],  
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
    // Union composition across all windows eliminates volume pumping  
    minGain \= Math.min(minGain, windowGain);  
  }

  return minGain;  
};

export const AmbientTrack: React.FC\<AmbientTrackProps\> \= ({  
  ambientFile,  
  baseVolume \= 0.40,  
  attenuationDb \= \-14.0,  
  dialogueWindows \= \[\],  
  silences \= \[\],  
  attackFrames \= 6,  
  releaseFrames \= 12,  
}) \=\> {  
  const frame \= useCurrentFrame();

  let resolvedVolume \= calculateDuckedGain(  
    frame,  
    baseVolume,  
    attenuationDb,  
    dialogueWindows,  
    attackFrames,  
    releaseFrames  
  );

  // Apply explicit narrative silences (e.g., dramatic realization holds)  
  for (const silence of silences) {  
    if (frame \>= silence.fromFrame && frame \<= silence.toFrame) {  
      resolvedVolume \*= Math.pow(10, silence.duckAmbientDb / 20);  
    }  
  }

  return (  
    \<Audio  
      src={staticFile(\`audio/ambient/\${ambientFile}\`)}  
      volume={resolvedVolume}  
    /\>  
  );  
};

By taking Math.min(minGain, windowGain) across every active envelope, overlapping attack and release curves compose as a continuous mathematical union. If the gap between two dialogue lines is shorter than the combined release-and-attack duration (*R*\+*A*\=18 frames), the background track remains securely flat at the −14 dB floor without pumping.

### **6\. Narrative Silences & \[BEAT\] Swells**

In the studio's acoustic architecture, silence is an active, machine-readable event rather than an empty gap in the timeline:

                        NARRATIVE SILENCE DISPATCH  
                                    │  
         ┌──────────────────────────┴──────────────────────────┐  
         ▼                                                     ▼  
TYPE 1: \[BEAT\] PAUSE SWELLS                   TYPE 2: DELIBERATE DRAMATIC SILENCE  
• Explicit AST \[BEAT\] node (e.g., 4.5s)       • High-tension realization hold  
• Dialogue synthesis bypassed                 • Explicit ducking: duckAmbientDb \= \-24 dB  
• Sidechain envelope releases                 • Linear gain multiplier over ducked floor  
• Ambient bed swells to unity (V\_base)        • Gating floor: drops to 0.0252 volume  
• Decays 0.5s prior to next dialogue          • Punctual Foley injected during void

> * **Continuous Swells (\[BEAT\] Nodes):** When the screenplay AST introduces an explicit narrative pause line (\[BEAT\]), text-to-speech synthesis is bypassed. The sidechain ducking envelope releases, allowing continuous ambient room tone or orchestral score to swell up to unity baseline volume (*V*base​), sustaining across the void and decaying roughly **0.5 seconds (12 frames)** before dialogue resumes. Punctual Foley cues (e.g., striking a match, valve drips) mount at exact offsets during this swell, seeded via Mulberry32 PRNG.  
> * **Deliberate Dramatic Silences (−24 dB Ducking):** In strict *chosisme* production profiles where musical score is suppressed, high-tension realization pauses actively depress the environment. The event is encoded into the timeline as an explicit silence object:

{   
  "type": "silence",   
  "fromFrame": 240,   
  "toFrame": 375,   
  "duckAmbientDb": \-24   
}

This applies an additional decibel multiplier over the ambient bed, driving the gain down to −24 dB (*V*silence​≈0.40×10−24/20≈0.0252) and creating a stark vacuum of dead air.

### **7\. Ingestion Contracts, Loudness Conformance & Assembly Blueprint**

Before episode composition files are rendered by headless Chromium workers, the complete multi-track acoustic blueprint is formalized into the SceneAudioBed data contract:

// packages/schema/src/audio/SceneAudioBed.ts  
export interface SceneAudioBed {  
  sceneId: string;  
  ambientLayers: Array\<{  
    loopId: string;  
    fromFrame: number;  
    toFrame: number;  
    gainDb: number;  
  }\>;  
  foleyEvents: Array\<{  
    cueText: string;  
    atFrame: number;  
    sampleId: string;  
    gainDb: number;  
  }\>;  
  silences: Array\<{  
    fromFrame: number;  
    toFrame: number;  
    duckAmbientDb: number;  
  }\>;  
  duckUnderVO: Array\<{  
    fromFrame: number;  
    toFrame: number;  
    duckDb: number;  
  }\>;  
}

#### **Downstream Assembly Composition (Episode\_040.tsx)**

generate-episode-repo.ts resolves all ambient paths, dialogue windows, and Foley samples at compile time, writing static props directly into the TSX tree:

// ep040/src/Episode\_040.tsx (Excerpt)  
import React from 'react';  
import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';  
import { AmbientTrack } from './components/AmbientTrack';

export const Episode\_040: React.FC \= () \=\> {  
  return (  
    \<AbsoluteFill style={{ backgroundColor: '\#050505' }}\>  
      {/\* Track 3: Continuous Ambient Bed with Anti-Pumping Sidechain Ducking \*/}  
      \<AmbientTrack  
        ambientFile="culvert\_drone\_40hz.wav"  
        baseVolume={0.40}  
        attenuationDb={-14.0}  
        attackFrames={6}  
        releaseFrames={12}  
        dialogueWindows={\[  
          { from: 8, to: 83 },    // Shot 01: Dialogue window  
          { from: 107, to: 182 }  // Shot 02: Dialogue window  
        \]}  
        silences={\[  
          // Deliberate realization pause dropping bed to \-24 dB  
          { fromFrame: 84, toFrame: 98, duckAmbientDb: \-24.0 }  
        \]}  
      /\>

      {/\* Shot 01 Assembly: Frames 0 to 99 \*/}  
      \<Sequence from={0} durationInFrames={99}\>  
        {/\* Track 1: Master Spoken Dialogue Stem \*/}  
        \<Sequence from={8} durationInFrames={75}\>  
          \<Audio src={staticFile("audio/dialogue/ep040\_sh01\_bog.wav")} volume={1.0} /\>  
        \</Sequence\>

        {/\* Track 2: Punctual Spot Foley Transient \*/}  
        \<Sequence from={4} durationInFrames={72}\>  
          \<Audio src={staticFile("audio/foley/metal\_siphon\_scrape\_02.wav")} volume={0.65} /\>  
        \</Sequence\>  
      \</Sequence\>  
    \</AbsoluteFill\>  
  );  
};

#### **Master Loudness Normalization & True-Peak Conformance**

Prior to committing final deliverables to disk, the composite audio output must pass automated two-pass mastering gates conforming to EBU R128 and ITU-R BS.1770-4 standards:

> * **Integrated Loudness Target:** Normalized strictly between **−16.0 LUFS** (±1.0 LUFS) for web streaming releases and **−24.0 LUFS** for linear television broadcast.  
> * **True-Peak Ceiling:** Clamped strictly to **≤−1.0 dBTP** (or ≤−2.0 dBTP for specific OTT delivery profiles) using inter-sample oversampled limiting to prevent distortion during downstream lossy transcoding.  
> * **Unvoiced Noise Floor Gate:** Ambient stem pause segments must maintain an unvoiced noise floor below **−60.0 dBFS**, ensuring that when Track 3 sidechain ducking recovers from −14 dB to unity gain, no audible background hiss or vocoder floor noise is injected into the broadcast master.

---

*User prompt: {{FOCUS:  9\. New Strategic & Operational Additions (Series-Assets-Audio) }} /extreme-details*

### **Response: 1\. Architectural Imperative & The Zero-Loss Operational Mandate**

The **New Strategic & Operational Additions** subsystem within **series-assets-audio** defines the structural guarantees, storage safeguards, and master distribution protocols required to operate an autonomous, headless, multi-series audio rendering fleet at industrial scale.

In traditional audio post-production pipelines, media generation relies heavily on manual intervention, non-deterministic DAW plugins, volatile environment variables, and mutable directory states. These legacy patterns introduce silent corruption vectors: network timeouts that truncate binary transfers, unversioned reference audio that drifts over time, floating-point rounding errors that cause phase cancellation across render nodes, and non-conforming audio levels that fail broadcast transmission compliance.

To eradicate these vulnerabilities, **series-assets-audio** treats the generation fleet as a deterministic, append-only software manufacturing plant. Every audio file, recipe variant, and delivery stream is bound to strict cryptographic invariants, atomic filesystem operations, and mathematical master clock constraints.

### **2\. Strategic & Operational Addition 1: Idempotent Atomic Staging & Resumable Pipeline Restarts**

Multi-series media compilation involves synthesizing thousands of continuous dialogue stems, spot Foley transients, and musical score elements across distributed nodes. Network disconnects, socket timeouts on local port 8000, or unexpected storage interruptions during multi-line synthesis runs can corrupt active staging directories.

> * **The Partial Write Hazard:** If a neural TTS generator writes directly to a production file path (e.g., public/audio/dialogue/ep040\_sh01.wav) and a timeout occurs mid-stream, the filesystem retains a truncated, zero-byte, or corrupted audio buffer. Subsequent build passes evaluating cache existence flags may mistakenly accept the corrupted file as valid, leading to catastrophic runtime rendering crashes or silent audio dropouts.  
> * **Atomic POSIX .tmp Staging:** The ingestion and generation harness (generate-episode-repo.ts and audio-microservice) enforces a strict atomic staging protocol. Every newly synthesized audio buffer is written exclusively to a temporary sandbox path (.tmp) within the staging envelope:  
>   Target Path: public/audio/dialogue/ep040\_sh01.wav  
>   Staging Path: public/audio/dialogue/ep040\_sh01.wav.tmp  
> * **Atomic Filesystem Rename:** Once the audio buffer has completed generation, passed conformance filtering, and verified its cryptographic hash, the microservice commits the file via an atomic POSIX rename() system call:  
>   fs.renameSync(tmpPath,finalPath)  
>   Because POSIX rename() is an atomic operation at the filesystem kernel level, a file is never visible to downstream compilation nodes in a half-written or corrupted state.  
> * **Resumable Pipeline Architecture:** If an upstream build fails due to a network partition or resource starvation, restarting the compiler does not require re-synthesizing completed lines. The pre-flight verification pass inspects the target directory, verifies existing .wav stems against their expected SHA-256 hashes in render\_manifest.json, and resumes execution strictly from the missing or dirty AST nodes.

### **3\. Strategic & Operational Addition 2: Sensory Evidence Archival & Class 3 Artifact Handling**

Within the studio's epistemological framework, data artifacts are segregated based on their ability to be recomputed deterministically from primary sources:

┌────────────────────────────────────────────────────────────────────────┐  
│                   THE THREE ARTIFACT CLASSIFICATIONS                   │  
├────────────────────────────────────────────────────────────────────────┤  
│ CLASS 1: DERIVABLE STATE (Database / AST / State Ledgers)              │  
│ • Recomputed deterministically by replaying event logs over history    │  
│ • Replay(ℋ) ──► 𝒮 (Zero data loss risk upon re-execution)           │  
├────────────────────────────────────────────────────────────────────────┤  
│ CLASS 2: TRANSITORY SCRATCH ARTIFACTS (Browser Caches / .tmp Files)    │  
│ • Ephemeral working files safely purged between compilation runs       │  
├────────────────────────────────────────────────────────────────────────┤  
│ CLASS 3: ARCHIVE-DEPENDENT EVIDENCE (Neural Audio Stems / Vocals)      │  
│ • Generated via non-deterministic floating-point math on GPUs/CPUs     │  
│ • Imperfect bit-for-bit reproducibility across disparate hardware      │  
│ • Treated as immutable physical evidence; once approved, never re-run  │  
└────────────────────────────────────────────────────────────────────────┘

> * **The Non-Determinism of Neural Audio:** Neural vocoders (such as CosyVoice, Chatterbox, or Piper) rely heavily on floating-point arithmetic across diverse CPU instruction sets (AVX-512, NEON) and GPU tensor cores. Re-running identical generation requests across different hardware architectures or updated driver versions can introduce subtle floating-point drift, microscopic phase variations, or altered harmonic coloration.  
> * **Prohibition of Dynamic Re-Synthesis:** Because audio serves as the non-negotiable master clock governing integer 24 fps video cut budgets, silently regenerating an audio stem during a later build pass alters its continuous duration (*D*ms​) by a few milliseconds. This tiny temporal shift alters the integer ceiling quantization (⌈(*D*ms​/1000)×24⌉), desynchronizing visual frames, breaking mouth viseme alignments, and invalidating downstream video diffusion plates.  
> * **Immutable Archival Storage:** Approved dialogue stems, Foley transients, and ambient beds are locked into content-addressed storage (CAS) and tracked via Git LFS. Once an audio asset is certified by the conformance gauntlet, it is treated as immutable historical evidence. The pipeline explicitly forbids in-place overwrites; any adjustment to a character's vocal delivery requires a new versioned entry in /voices/versions/.

### **4\. Strategic & Operational Addition 3: Master Loudness & Dynamic Range Normalization**

Raw audio buffers generated by neural TTS vocoders vary wildly in signal power, crest factor, and DC offset. Unmastered stems introduced directly into Remotion compositing passes cause unpredictable clipping, masking, and listener fatigue.

To guarantee broadcast and streaming compliance across all series, every audio stem must pass through an automated mastering filter chain before timeline mounting:

RAW TTS BUFFER (48 kHz / 24-bit PCM WAV)  
                  │  
                  ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ 1\. HIGH-PASS RUMBLE FILTER (Butterworth 24 dB/octave)                  │  
│ • Cutoff: 75 Hz (Music/Ambience) to 180 Hz (Suit Comms Telemetry)      │  
│ • Strips sub-audible infrasonic vocoder thumps and DC bias             │  
├────────────────────────────────────────────────────────────────────────┤  
│ 2\. OPTICAL DE-ESSER BAND (6,000 Hz to 7,200 Hz)                        │  
│ • Dynamic attenuation of harsh sibilance spikes prior to compression   │  
├────────────────────────────────────────────────────────────────────────┤  
│ 3\. TWO-PASS EBU R128 / ATSC A/85 LOUDNORM (FFmpeg ebur128)             │  
│ • Target Integrated Loudness: \-16.0 LUFS (±1.0 LUFS) for Web Streaming │  
│ • Alternative Target: \-24.0 LKFS for Linear Television Broadcast       │  
├────────────────────────────────────────────────────────────────────────┤  
│ 4\. BRICKWALL TRUE-PEAK LIMITER (Oversampled Inter-Sample Peak Control) │  
│ • Hard Ceiling: Clamped strictly to ≤ \-1.0 dBTP                        │  
├────────────────────────────────────────────────────────────────────────┤  
│ 5\. UNVOICED NOISE FLOOR GATE                                           │  
│ • Gate Threshold: ≤ \-60.0 dBFS                                         │  
│ • Ensures absolute silence during breath pauses and ducked rests       │  
└──────────────────┬─────────────────────────────────────────────────────┘  
                   │  
                   ▼  
       COMMITTED MASTER CONFORMED STEM (48 kHz / 24-bit PCM)

> * **Integrated Loudness Standardization:** Automated two-pass loudness normalization (FFmpeg loudnorm filter) measures the entire stem and applies transparent gain adjustments to hit the broadcast target of **−16.0 LUFS** (±1.0 LUFS) for digital distribution platforms.  
> * **True-Peak Ceiling Protection:** Unlike peak dBFS meters that measure sample values, True-Peak limiting oversamples the waveform 4× to detect inter-sample peaks generated during lossy platform transcoding (AAC/Opus). The limiter clamps inter-sample peaks strictly to **≤−1.0 dBTP**, eliminating digital inter-sample distortion.  
> * **Noise Floor Gating:** Unvoiced pause segments must maintain an RMS noise floor strictly below **−60.0 dBFS**. This prevents residual vocoder generation noise or studio room tone floor hum from surging when Track 3 sidechain ducking envelopes release back to unity gain.

### **5\. Strategic & Operational Addition 4: Cryptographic Manifest Sealing & C2PA Provenance Integration**

To maintain end-to-end accountability across the multi-repository production fleet, media compilation is bound to cryptographic provenance roots:

> * **The Universal Provenance Root (render\_manifest.json):** Placed at the root of every stamped episode workspace, this JSON lockfile records the exact Git commit hashes of all upstream repositories (series-lore, series-assets-visual, series-assets-audio), the AST hash (sha256:12c8...), model checkpoint weights SHA-256 digests, and individual audio/visual asset checksums.  
> * **C2PA Content Credentials:** During final optical mastering, the provenance manifest is serialized and cryptographically burned directly into the container header of the rendered MP4 master using standard **C2PA (Coalition for Content Provenance and Authenticity)** cryptographic signatures. This provides an immutable chain of custody proving that the media was generated from human-authored screenplay ASTs and verified cryptographic assets.  
> * **Decoupled Legal Audit Trail:** The manifest links every audio stem to its originating performer consent ID (performer\_consent\_id, e.g., SAG-AFTRA digital voice rider tokens), ensuring that commercial distribution complies fully with labor agreements and intellectual property protections.

---

*User prompt: {FOCUS:  5\. The NLP Slur Collision Defense & Architectural Partition (Series-Assets-Audio) }} /extreme-details*

Response: The **NLP Slur Collision Defense & Architectural Partition** subsystem within series-assets-audio prevents naturalistic screenplay vernacular, regional idiolects, and phonetic contractions from triggering algorithmic censorship across automated text-processing pipelines and downstream distribution networks.

Operating across **Axis A (Semantic Meaning)** and **Axis B (Physical Representation)**, this architecture establishes an isolated boundary: upstream story databases and screenplays maintain standard grammatical English prose, while acoustic dialect expansion executes strictly offline inside the local hardware daemon on Rig 1 prior to neural vocoder tensor dispatch.

### **1\. The Core Hazard: Authorial Naturalism vs. Algorithmic Moderation**

In narrative universes featuring rural noir, domestic farce, or working-class vernacular—such as the Southern Gothic dialect of *Wiregrass Basin* or the subterranean slang of *Under the Floorboards*—naturalistic dialogue requires elisions, dropped terminal consonants, and phonetic contractions. When phonetic eye-dialect is drafted directly into raw script prose or language model prompts, it introduces three failure points across the multi-modal compiler stack:

> * **The NLP Slur Collision Hazard:** Cloud-hosted Large Language Models (LLMs), edge API safety guardrails, and automated text linters parse tokens through probabilistic safety classifiers. Contracted vernacular and phonetic spellings routinely collide with toxic n-gram filters, causing false-positive hate speech or profanity detections that halt compilation at *T*0​ (\$0.00 compute cost).  
> * **Neural G2P Failure Modes & Temporal Drift:** Standard Grapheme-to-Phoneme (G2P) systems (such as CMUdict or eSpeak-NG) exhibit Out-of-Vocabulary (OOV) orthographic hallucinations and dialectal cadence collapse when encountering unvetted phonetic spellings. These heuristics guess letter-to-sound rules, resulting in erratic syllable splitting, dropped consonants, and variable duration (*D*ms​). Because continuous dialogue duration establishes the physical master clock governing 24 fps integer video cut allocations (⌈(*D*ms​/1000)×24⌉), phonetic instability directly destabilizes visual plate budgets and exposure sheets.  
> * **Automated Subtitle & Platform Ingestion Traps:** Downstream distribution platforms execute automated Speech-to-Text (STT) ingestion pipelines on published video masters. Automated speech recognizers frequently misinterpret slurred regional contractions or non-verbal vocalizations (e.g., combat exhalations, strained grunts) as toxic slurs or profanity, leading to automated demonetization or content flags.

### **2\. The Architectural Partition: Machine Rail vs. Voice Rail Split**

To eliminate content moderation collisions, the studio architecture mandates an absolute separation of concerns formalized as the **Machine Rail vs. Voice Rail Split**:

*"NLP models misread heavy phonetic dialect as slurs. Spell out grammatical words even if the voice track delivers a heavy contraction."*

               THE DUAL-LAYER SEPARATION OF CONCERNS  
                 
LAYER 1: SCREENPLAY AST & CANON DATABASE (Axis A: Meaning / D1 / SQLite)  
┌────────────────────────────────────────────────────────────────────────┐  
│ • Dialogue text strictly maintains 100% grammatically clean English:   │  
│   "Do you hear what they are saying in the drainage culvert?"          │  
│ • Completely bypasses upstream cloud LLM moderation filters and linters│  
│ • Serialized verbatim into drafts/dialogue\_ast.json                    │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼ Dispatched via POST :8000/generate  
LAYER 2: LOCAL PHONETIC FIREWALL (Axis B: Representation / Rig 1 Host)  
┌────────────────────────────────────────────────────────────────────────┐  
│ • audio-microservice executes series-local voices/\<series\>/lexicon.json│  
│ • Runs 100% offline behind local host port 8000 (Zero external APIs)   │  
│ • Regex syntactic pass: \\b(do you)\\b ──► "dee-yoo"                     │  
│ • Morphological pass:   \\b(\\w+)ing\\b ──► "\$1-in'"                      │  
│ • Proper noun pass:     "culvert"    ──► "KULL-vert"                   │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼ Dispatched to Local Vocoder Pool  
LAYER 3: NEURAL VOCAL INFERENCE (CosyVoice / Parler-TTS / Piper)  
┌────────────────────────────────────────────────────────────────────────┐  
│ • Receives unambiguous, phonetically expanded token streams            │  
│ • Synthesizes authentic regional drawl into uncompressed 48 kHz PCM    │  
│ • Downstream closed-captions retain clean orthography for safety      │  
└────────────────────────────────────────────────────────────────────────┘

> * **Safety Compliance Guarantee (Axis A):** The canonical narrative ledger (Cloudflare D1 / SQLite) and machine-readable Abstract Syntax Trees (dialogue\_ast.json) store only standard grammatical English text. Authors and automated narrative engines are barred from writing phonetic slang or eye-dialect into dialogue blocks. This insulates all upstream language models, edge workers, and continuous integration linters from tripping safety heuristics.  
> * **Acoustic Authenticity (Axis B):** Dialect expansion executes downstream on Rig 1 inside the local audio-microservice daemon listening on loopback port 8000\. Because Rig 1 operates entirely offline on pure multi-core CPU and system RAM (allocating 0 MB GPU VRAM) with zero external cloud API content filters, it executes phonetic replacements and regex expansions without triggering content moderation shutdowns.  
> * **Transmedia Delivery Decoupling:** The physical audio track delivers authentic regional contractions, while timed-text subtitle streams (.srt) maintain standard grammatical orthography compiled directly from the canonical AST text, protecting the distribution release from automated transcription penalties.

### **3\. The Offline Pre-Inference Normalization Engine (lexicon.json)**

Located at voices/\<series\_slug\>/lexicon.json, the phonetic dictionary acts as an isolated sandbox executed by audio-microservice prior to vocoder tensor allocation. The normalization engine processes the verified verbatim dialogue\_text string emitted by dialogue\_ast.json through four sequential stages:

RAW INGRESS: "Do you hear what they are saying in the drainage culvert?"  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 1: PCRE REGEX SYNTACTIC EXPANSION                                │  
│ • Evaluates regex\_replacements sequentially with word boundaries (\\b)  │  
│ • \\b(do you)\\b                ──► "dee-yoo"                            │  
│ • \\b(\\w+)ing\\b                ──► "\$1-in'" (Targeted: "say-in'")       │  
│ • \\b(drainage)\\b              ──► "DRAY-nij"                           │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 2: CASE-INSENSITIVE LEXICAL TOKENIZATION                         │  
│ • Isolates word tokens while preserving prosodic punctuation (?, .)    │  
│ • Tokens: \["dee-yoo", "hear", "what", "they", "are", "say-in'",       │  
│            "in", "the", "DRAY-nij", "culvert", "?"\]                    │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 3: PHONETIC LEXICON OVERRIDE LOOKUP                              │  
│ • Matches lemmas against series phonetic\_rules dictionary              │  
│ • "culvert"                   ──► "KULL-vert"                          │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
FINAL EXPANDED PAYLOAD: "dee-yoo hear what they are say-in' in the DRAY-nij KULL-vert?"  
                                │  
                                ▼ Dispatched to Target Vocoder

> * **Stage 1 (Word-Bounded Regex Syntactic Expansion):** Rules evaluate sequentially using PCRE regular expressions with strict word-boundary anchors (\\b) to eliminate unintended substring mutations. This guarantees that a transformation rule for the preposition \\b(in)\\b does not alter the interior characters of "siphon" or "basin".  
> * **Stage 2 (Tokenization & Prosodic Punctuation Isolation):** The string is segmented into lexical lemmas while preserving terminal punctuation marks (?, \!, ., —). Preserving punctuation is mandatory because autoregressive and diffusion vocoders rely on these tokens to condition terminal pitch inflections, glottal closures, and phrase-final breath decay.  
> * **Stage 3 (Lexical Dictionary Overrides):** Stripped lemmas are cross-referenced case-insensitively against the phonetic\_rules dictionary. In-world proper nouns, chemical compounds, and technical terms are substituted with standardized pronunciation strings.  
> * **Stage 4 (Engine-Specific Phoneme Adaptation):** The stream is adapted to the target runtime declared in voice\_manifest.json: injecting numeric token IDs into Piper-ONNX, formatting IPA SSML tags (\<phoneme ph="..."\>) for CosyVoice-300M, or outputting syllable-stress strings for Parler-TTS.

### **4\. Concrete Multi-Series Dialect Configurations**

Series configurations are strictly segregated under top-level namespaces (voices/\<series\_slug\>/), ensuring that dialect rules and vocabulary overrides never cross-contaminate sibling universes:

series-assets-audio/voices/  
├── under-the-floorboards/         \# Namespace: Goblin Slapstick  
│   ├── lexicon.json               \# Alphabet: CUSTOM\_STRESS\_EXPANSION  
│   └── voice\_manifest.json        \# Fast speech scalars, high-register pitch  
├── wiregrass-basin/               \# Namespace: Southern Gothic Noir  
│   ├── lexicon.json               \# Alphabet: CUSTOM\_STRESS\_EXPANSION  
│   └── voice\_manifest.json        \# Vocal fry, low chest drones, breath dilation  
└── deep-space-salvage/            \# Namespace: Hard Sci-Fi Telemetry  
    ├── lexicon.json               \# Alphabet: ARPABET  
    └── voice\_manifest.json        \# NATO cadence, metric expansion, comms bandpass

#### **Case Study A: Domestic Goblin Farce (voices/under-the-floorboards/lexicon.json)**

> * **World Axiom:** Fast, anxious, clipped domestic goblin farce set beneath kitchen floorboards.  
> * **Engine Target:** Piper-ONNX (VITS architecture running on CPU with ≈80 MB RAM).  
> * **Acoustic Profile:** High fundamental pitch (+3.8 semitones), compressed oral formants (0.86), fast tempo (1.18×), front-of-mouth plosive attacks.  
> * **Phonetic Alphabet:** CUSTOM\_STRESS\_EXPANSION.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "under-the-floorboards",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "siphon": "SAI-fun",  
    "snerk": "SNERK",  
    "grissel": "GRIZ-zul",  
    "marrow-bone": "MAIR-oh-BOHN",  
    "floor-timbers": "FLOR-TIM-berz",  
    "skitter": "SKIT-ter",  
    "tallow": "TAL-oh",  
    "peevish": "PEE-vish"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(d'you)\\\\b",  
      "replacement": "dyoo",  
      "description": "Contracts 'd'you' to quick goblin dental glide",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(gotta)\\\\b",  
      "replacement": "GAHT-tuh",  
      "description": "Forces clipped staccato on glottal stop",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(underneath)\\\\b",  
      "replacement": "un-ner-NEETH",  
      "description": "Flattens 'd' sound for subterranean colloquial speech",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(in|inch|inches)\\\\b",  
      "replacement": "\$1 IN-chez",  
      "description": "Expands dimensional measurements for hoarded items",  
      "case\_sensitive": false  
    }  
  \],  
  "banned\_pronunciations": {  
    "siphon": \["SEE-fon", "sih-FON"\],  
    "grissel": \["GRIZ-lee", "gray-SEL"\]  
  }  
}

> * **Dialect Mechanics:** Contracting \\b(d'you)\\b to "dyoo" prevents Piper-ONNX from splitting the phrase into two separate staccato tokens ("d" and "you"), eliminating unwanted frame dilation in the exposure sheet. Expanding dimension measurements ("3 in" → "3 IN-chez") prevents the engine from misreading unit abbreviations as the common English preposition.

#### **Case Study B: Southern Gothic Noir (voices/wiregrass-basin/lexicon.json)**

> * **World Axiom:** Southern Gothic industrial noir, chemical defoliant runoff, heavy vocal fry, and laryngeal wear.  
> * **Engine Target:** CosyVoice-300M (Flow-matching diffusion vocoder) and Chatterbox-Base.  
> * **Acoustic Profile:** Low fundamental pitch (−2.5 semitones), elevated vocal fry (Φ≥0.45), elongated diphthongs, and dropped terminal consonants.  
> * **Phonetic Alphabet:** CUSTOM\_STRESS\_EXPANSION.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "wiregrass-basin",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "culvert": "KULL-vert",  
    "gallbreaker": "GAWL-bray-ker",  
    "creosote": "KREE-uh-soht",  
    "slough": "SLOO",  
    "diesel": "DEEZ-ul",  
    "spurl": "SPERL",  
    "defoliant": "dee-FOH-lee-unt",  
    "wiregrass": "WY-er-grass"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(ain't)\\\\b",  
      "replacement": "aynt",  
      "description": "Standardizes dialect negation without nasal pinch",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(do you)\\\\b",  
      "replacement": "dee-yoo",  
      "description": "Softens interrogative onset into regional drawl",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(\\\\w+)ing\\\\b",  
      "replacement": "\$1-in'",  
      "description": "Enforces dropped alveolar nasals across all continuous verbs",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(drainage)\\\\b",  
      "replacement": "DRAY-nij",  
      "description": "Prevents over-enunciation of second syllable",  
      "case\_sensitive": false  
    }  
  \],  
  "banned\_pronunciations": {  
    "slough": \["SLUFF", "SLOH"\],  
    "creosote": \["kree-OH-soht"\]  
  }  
}

> * **Dialect Mechanics:** Replacing the velar nasal /ŋ/ with the alveolar nasal /n/ via \\b(\\w+)ing\\b \\to \$1-in' forces the vocoder to synthesize natural regional participles (e.g., *"running"* → *"run-in'"*, *"siphoning"* → *"siphon-in'"*) without mutating the underlying screenplay text. Softening "do you" to "dee-yoo" eliminates harsh consonant attacks at phrase starts, allowing dialogue to slide into a low chest drawl.

#### **Case Study C: Hard Sci-Fi Telemetry (voices/deep-space-salvage/lexicon.json)**

> * **World Axiom:** Sealed space suits, depressurized salvage corridors, and narrow-band RF telemetry.  
> * **Engine Target:** Kokoro-82M (Compact Style-TTS2 variant) and Chatterbox-Base.  
> * **Acoustic Profile:** Flat pitch modulation, military NATO cadence, bandpass filtering (300 Hz to 3,400 Hz), zero vocal fry.  
> * **Phonetic Alphabet:** ARPABET.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "deep-space-salvage",  
  "phonetic\_alphabet": "ARPABET",  
  "phonetic\_rules": {  
    "apogee": "AE1 P AH0 JH IY0",  
    "perigee": "P EH1 R AH0 JH IY0",  
    "eva": "IY1 V IY1 EY1",  
    "rcs": "AA1 R S IY1 EH1 S",  
    "hydrazine": "HH AY1 D R AH0 Z IY2 N",  
    "bulkhead": "B AH1 L K HH EH2 D",  
    "oracle": "AO1 R AH0 K AH0 L"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(kpa|kilopascals?)\\\\b",  
      "replacement": "\$1 KIL-oh-pas-kahlz",  
      "description": "Metric pressure telemetry expansion",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(m/s|meters per second)\\\\b",  
      "replacement": "\$1 MEE-terz per SEK-und",  
      "description": "Velocity vector expansion",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(atmo)\\\\b",  
      "replacement": "AT-moh",  
      "description": "Salvage slang for atmosphere",  
      "case\_sensitive": false  
    },  
    {  
      "pattern": "\\\\b(o2)\\\\b",  
      "replacement": "OH-TOO",  
      "description": "Life-support gas telemetry",  
      "case\_sensitive": false  
    }  
  \],  
  "banned\_pronunciations": {  
    "eva": \["EE-vah"\],  
    "rcs": \["er-SEE-ess"\]  
  }  
}

> * **Dialect Mechanics:** Technical acronyms are mapped to letter-by-letter pronunciations ("EVA" → "IY1 V IY1 EY1", "RCS" → "AA1 R S IY1 EH1 S"), preventing the vocoder from reading acronyms as standard words ("EE-vah") or unparsed consonant clusters. Pressure units like "14 kpa" expand to "14 KIL-oh-pas-kahlz", ensuring stable duration calculation for downstream video cut allocations.

### **5\. Transmedia Caption & Subtitle Hygiene (POD-05 / POD-17)**

The defense against slur collisions and automated moderation takedowns extends downstream into the generation of SubRip (.srt) timed-text assets and closed-captioning tracks:

AUDIO TRACK (Diegetic Physical Reality)  
│ • Synthesizes: "aynt", "dee-yoo", "KULL-vert", and visceral grunts  
│ • Pushes physical 48 kHz linear PCM to master container  
│  
▼ PARALLEL TRANSMEDIA PROJECTION (Axis A \-\> Text / Axis B \-\> Audio)  
SUBTITLE TRACK (.srt Timed Text Stream)  
│ • Strictly spells out: "Do you", "are not", "culvert"  
│ • Encodes physiological actions: \[sharp exhale\], \[strained grunt\]  
│ • Bypasses automated YouTube STT censorship and demonetization bots

> * **Orthographic Normalization in Captions:** Subtitle tracks never mirror raw phonetic strings generated for neural vocoders (e.g., "dee-yoo", "aynt"). Caption files compile directly from canonical dialogue\_text in the Screenplay AST, ensuring that viewers and automated platform moderation bots read clean, standard grammatical sentences.  
> * **Clinical Action Tags Over Phonetics:** Automated platform speech-to-text models routinely misinterpret non-verbal effort or combat sounds as slurs or profanity. The subtitle compiler enforces clinical physiological descriptions rather than phonetic onomatopoeia:  
  * Use \[sharp exhale\], never *huff*.  
  * Use \[strained grunt\], never *urgggh*.  
  * Use \[agonized groan\], never *aaargh*.  
> * **Speaker Disambiguation:** When non-verbal physical actions occur during complex blocking or off-screen struggles, subtitles explicitly bind the action to the character slug (e.g., \[Bog grunts with effort\], \[The Pilot groans\]), eliminating ambiguous phonetic audio that automated moderation systems could misattribute to hostile verbal language.

### **6\. Conformance Verification: The Local STT Alignment Gate**

Before a synthesized 48 kHz / 24-bit linear PCM buffer is committed to disk, it must clear Filter 1 of the five-stage verification battery: the **Speech-to-Text (STT) Verbatim Alignment Gate**:

RAW SYNTHESIZED PCM BUFFER (48 kHz / 24-bit WAV from Port 8000\)  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FILTER 1: LOCAL STT ALIGNMENT PASS (Whisper / Local Speech Model)      │  
│ • Runs locally on Rig 1 (Zero network calls, zero external logs)       │  
│ • Generates normalized raw transcription of synthesized stem           │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ BIDIRECTIONAL PARITY AUDIT                                             │  
│ • Evaluates transcription against dialogue\_text from dialogue\_ast.json │  
│ • Normalizes dialect variants using reverse-lexicon mapping matrices   │  
│ • Confirms zero dropped words, skipped plosives, or stutter loops      │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ NEGATIVE PRONUNCIATION SWEEP (banned\_pronunciations)                   │  
│ • Inspects phonemic tokens against series banned\_pronunciations map    │  
│ • Traps OOV neural hallucinations (e.g., "SEE-fon", "SLUFF")           │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
            ┌────────────────┴────────────────┐  
            ▼                                 ▼  
         \[FAIL\]                            \[PASS\]  
  STT\_ALIGNMENT\_BREACH               Proceed to Filter 2  
  Immediate Halt at T0 (\$0.00)       (Pre-Conform Spectral Hygiene)

> * **Local On-Device Transcription:** An automated local STT inference pass (such as Whisper running on Rig 1\) transcribes the raw synthesized PCM waveform.  
> * **Reverse-Lexicon Normalization:** The verification gate applies a reverse-lexicon dictionary to map expanded dialect tokens back to standard lemmas (e.g., converting recognized "dee-yoo" back to "do you" and "say-in'" back to "saying").  
> * **Verbatim Parity Assertion:** The normalized transcription is compared character-for-character against canonical dialogue\_text in dialogue\_ast.json. If the vocoder stumbles on a contraction, drops a word, or hallucinates an unscripted interjection, the gate halts execution immediately with an STT\_ALIGNMENT\_BREACH.  
> * **Negative Assertion Trap (banned\_pronunciations):** The transcribed phoneme sequence is evaluated against the banned\_pronunciations map declared in lexicon.json. If the engine mispronounces "slough" as "SLUFF" or "creosote" as "kree-OH-soht", compilation aborts.  
> * **Fail-Fast Economic Enforcement (*T*0​\=\$0.00):** Intercepting parity failures or banned pronunciations halts compilation with exit code 1 before allocating GPU resources on Rig 2 for ComfyUI video diffusion or launching headless Remotion compositing passes.

### **7\. Directed Acyclic Graph (DAG) Selective Invalidation**

Within the studio’s DAG compilation engine, voices/\<series\_slug\>/lexicon.json is a version-controlled cryptographic dependency node anchoring into voice\_manifest.json and the overarching render\_manifest.json:

               SERIES LEXICON (voices/\<series\_slug\>/lexicon.json)  
                                         │  
                                         ▼  
                     Canonical Serialization (RFC 8785\)  
                                         │  
                                         ▼  
                                  lexicon\_sha256  
                                         │  
                     ┌───────────────────┴───────────────────┐  
                     ▼                                       ▼  
       voices/voice\_manifest.json                 render\_manifest.json  
       (Baked into H\_recipe digest)               (Root Provenance Seal)

> * **Canonical Serialization & Hashing (*H*lexicon​):** The compiler loads lexicon.json, sorts all keys alphabetically, strips non-semantic whitespace, and computes a SHA-256 digest:  
>   *H*lexicon​\=SHA-256(Canonicalize(lexicon.json))  
> * **Recipe Digest Binding (*H*recipe​):** Every character recipe in voice\_manifest.json incorporates *H*lexicon​ into its identity digest:  
>   *H*recipe​\=HMAC-SHA256(Secret,Engine∥WeightsSHA∥RefSHA∥BaseDSP∥*H*lexicon​)  
> * **Selective Invalidation Walk:** When an engineer modifies a regex rule or pronunciation override in lexicon.json, the compiler does not invalidate all dialogue stems across the series. It performs a selective scan across dialogue\_ast.json:  
  * *Unmatched Lines:* Lines that do not contain the target lemma or match the modified regex pattern maintain a cache hit (is\_dirty \= 0), preserving existing .wav files and skipping synthesis entirely.  
  * *Matched Lines:* Lines containing the mutated lemma are marked dirty (is\_dirty \= 1), dispatched to audio-microservice on port 8000, and re-synthesized.  
> * **Master Clock Protection:** Because modifying pronunciation alters vowel durations and consonant releases, ffprobe re-measures the new continuous duration (*D*ms​) and derives the discrete 24 fps frame budget:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉  
>   The updated integer frame count updates exposure\_sheet.json, locking visual cut boundaries and multi-track sidechain ducking automation to the new acoustic measurement without introducing timing drift.

---

*User prompt: {{FOCUS:  take a look at the beginning of the conversation and summerize all of the information on goblin assets audio untill the last response for 3000 words (Series-Assets-Audio) }} /extreme-details*

### **Response: 1\. Epistemological Foundations & The Master Physical Clock Axiom**

The architectural progression of the generative production pipeline establishes a strict ontological demarcation: **semantic truth resides exclusively within an immutable relational ledger (Cloudflare D1 / SQLite), while generative machine-learning models (Large Language Models, neural speech synthesizers, and spatial-temporal video diffusion backends) operate as untrusted, headless execution workers possessing zero narrative, temporal, or spatial authority**.

When stochastic generative systems are granted state authority, context windows degrade, character injuries vanish, unrevealed secrets leak into public dialogue, and multi-episode continuity collapses. To neutralize these failure modes, the media pipeline models production as a deterministic software compilation problem.

                  THE ONTOLOGICAL SEPARATION OF PRODUCTION  
┌────────────────────────────────────────────────────────────────────────┐  
│ AXIS A: SEMANTIC TRUTH & NARRATIVE CAUSALITY (The Sovereign State)    │  
│ • Canonical Lore & Relational Ledger (Cloudflare D1 / SQLite)          │  
│ • Immutable Screenplay AST (dialogue\_ast.json via Remark/AST Parser)   │  
│ • Dwight Swain MRU Parsing & Epistemic Belief Vectors                  │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │ Evaluated at T0 (\$0.00 compute)  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ AXIS B: PHYSICAL REPRESENTATION & MEDIA PROJECTION (The Headless Fleet)│  
│ • Local Speech Daemon (audio-microservice on Rig 1 / Port 8000\)        │  
│ • Master Physical Clock Initialization (ffprobe Millisecond Duration)  │  
│ • Continuous Sound Beds, Kinetic Automation & Anti-Pumping Sidechains   │  
│ • Stamped Compositing Workspaces (series-episodes / Remotion TSX)      │  
└────────────────────────────────────────────────────────────────────────┘

In conventional digital animation, visual layouts dictate the timeline: keyframe animators cut shots, while audio engineers stretch, compress, and edit dialogue stems to fit the visual timeline. In an automated generative pipeline, this dependency structure causes unnatural lip-sync, floating pauses, broken cadence, and cumulative video-audio drift.

The architecture inverts this dependency via the **Master Physical Clock Axiom**: **Audio is the non-negotiable architect of physical time**. Generative video diffusion backends possess no innate biological cadence, respiratory rhythm, or conversational pacing. Spoken dialogue must be synthesized, measured, and locked to disk before visual cut budgets can be constructed. Continuous acoustic duration dictates physical cuts, while video operates purely as an integer projection mapped to that duration.

### **2\. Repository Topology, Storage Discipline & The Quintet Isolation Model**

To transition from a single-universe prototype (goblin-assets-audio) to an industrial multi-series infrastructure, the asset storage layer is abstracted into the **series-assets-audio** specification. Operating within **Cluster 04.assets (The Source Art Vault)** on **Axis B (Representation / Artifact Hardening)**, this repository serves as a strongly typed, read-only acoustic API.

series-assets-audio/                     \# Master Acoustic Asset Vault (Cluster 04.assets)  
├── .gitattributes                         \# Git LFS tracking: \*.wav, \*.mp3, \*.flac  
├── CHANGELOG.md                           \# Human-audited log for voice and stem mutations  
├── AUDIO\_SPEC.md                          \# 48 kHz / 24-bit PCM, LUFS targets, ducking laws  
├── voices/                                \# Neural TTS Voice Authority  
│   ├── active/                            \# Floating symlinks to certified production takes  
│   │   ├── bog.wav                        \# \-\> ../versions/bog\_v2.wav  
│   │   └── the\_pilot.wav                  \# \-\> ../versions/the\_pilot\_v3.wav  
│   ├── versions/                          \# Append-only immutable historical reference takes  
│   │   ├── bog\_v1.wav                     \# Historical baselines (never mutated in-place)  
│   │   ├── bog\_v2.wav  
│   │   └── the\_pilot\_v3.wav  
│   ├── embeddings/                        \# Serialized speaker latent caches (\*.pt)  
│   ├── lexicon.json                       \# Series-scoped dialect overrides & G2P rules  
│   └── voice\_manifest.json                \# Cryptographic hashes, engines, and DSP recipes  
├── foley/                                 \# Spot Transient SFX Library  
│   ├── registry.json                      \# Dual-output semantic lookup table  
│   ├── impacts/                           \# valve\_drop.wav, pipe\_clang\_01.wav  
│   ├── locomotion/                        \# boot\_squelch\_01.wav, boot\_squelch\_02.wav  
│   └── handling/                          \# brass\_rattle.wav, cloth\_grab\_heavy.wav  
└── music/                                 \# Continuous Beds & Score (POD-16 / Chosisme)  
    ├── manifest.json                      \# Loop metadata, spectral centroids, BPM, keys  
    ├── ambient/                           \# 40 Hz pipe hums, zinc rain, machine drones  
    └── score/                             \# Multi-track stems (melody, harmony, rhythm, sub)

#### **Operational Invariants of the Acoustic Vault**

> 1. **Source Media vs. Transient Runtime Artifacts:** The vault contains only canonical source material. Staged dialogue stems generated per line (e.g., ep040\_sh01.wav) are transient runtime artifacts placed in series-episodes/epXXX/public/assets/audio/, not tracked in the asset vault.  
> 2. **Git LFS Quarantine:** Standard Git object tracking is disabled for heavy binary formats. All \*.wav, \*.mp3, and \*.flac files are tracked strictly via Git LFS, keeping git tree pointers to \~130 bytes and isolating bandwidth consumption.  
> 3. **Storage Ceiling Budget:** Selective harvesting tools (collect-episode-assets.ts) copy only the exact Foley and ambient files required by an episode's AST into a hermetic local sandbox, guaranteeing each stamped episode adheres to a strict budget of **\< 100 MB (150 MB hard ceiling)**.  
> 4. **The Zero-Byte Poison Sentinel:** Pre-flight CI checks verify that staged binary assets do not match the empty SHA-256 hash (e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855), halting compilation if an LFS pointer failed to hydrate.  
> 5. **Cross-Series Likeness Quarantine (POD-04 / POD-01):** Legal voice likeness clearances (e.g., SAG-AFTRA AI Digital Voice Riders) are strictly series-scoped. Borrowing an actor's voice reference across series boundaries triggers a compile-time LEGAL\_CLEARANCE\_BREACH.

### **3\. The Epistemological Triad of Voice Identity & Voice Manifest**

Because neural text-to-speech models are susceptible to "The Beige Plague" (statistical regression toward an aesthetically bland median) and latent drift, vocal identity cannot be defined by an unversioned .wav buffer. It is codified within voices/voice\_manifest.json as an irreducible triad:

                 THE EPISTEMOLOGICAL TRIAD OF VOICE IDENTITY  
 ┌────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  
 │ 1\. ENGINE & CHECKPOINT │  │ 2\. CONDITIONING TOKEN   │  │ 3\. BASELINE DSP VECTOR  │  
 │ • Model: CosyVoice-300M│  │ • Strategy: ZERO\_SHOT    │  │ • Pitch: \-2.8 semitones │  
 │ • Weights: sha256:...  │  │ • Embedding: .pt cache  │  │ • Formant Warping: 1.10 │  
 │ • Quantization: FP16   │  │ • Reference: .wav hash  │  │ • Speed Scalar: 0.82    │  
 │ • Target: CPU (0MB VRAM│  │ • Legal: SAG-AFTRA Rider│  │ • Diaphragmatic Breath   │  
 └────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘

{  
  "\$schema": "https://specs.studio.internal/schemas/v2/voice\_recipe.json",  
  "character\_id": "CHAR\_BOG\_01",  
  "series\_slug": "under-the-floorboards",  
  "active\_version": "v2",  
  "checkpoint": {  
    "tts\_engine": "Piper-ONNX",  
    "model\_repo": "rhasspy/piper-voices/en\_US-lessac-medium",  
    "weights\_sha256": "3e9b1a0f8c2b4d6e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",  
    "quantization": "INT8",  
    "vram\_allocation\_mb": 0  
  },  
  "conditioning": {  
    "strategy": "SPEAKER\_ID",  
    "speaker\_id": 42,  
    "reference\_voice\_path": "voices/versions/bog\_v2.wav",  
    "reference\_sha256": "7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f",  
    "speaker\_embedding\_cache": null,  
    "performer\_consent\_id": "SAG-AFTRA-2026-00412-EXT"  
  },  
  "base\_dsp\_modifiers": {  
    "basePitchShiftSemitones": 3.8,  
    "formantWarpingFactor": 0.86,  
    "speedScalar": 1.18,  
    "baseBreathiness": 1.25,  
    "baseVocalFry": 0.05  
  },  
  "dynamics\_and\_eq": {  
    "high\_pass\_cutoff\_hz": 90.0,  
    "target\_integrated\_lufs": \-16.0,  
    "brickwall\_true\_peak\_dbtp": \-1.0,  
    "noise\_floor\_ceiling\_dbfs": \-60.0  
  },  
  "banned\_cadences": \[  
    "RAPID\_STACCATO",  
    "RISING\_INFLECTION\_INTERROGATIVE",  
    "CHEERFUL\_MODULATION"  
  \]  
}

The audio-microservice daemon executes on Rig 1, listening on local port 8000\. It allocates **0 MB of GPU VRAM**, executing strictly on multi-core CPU and system RAM via AVX-512 and ONNX runtimes. This preserves all GPU VRAM on Rig 2 for heavy visual diffusion backends (ComfyUI / Wan 2.1).

The daemon multiplexes across four conditioning strategies:

> 1. **ZERO\_SHOT\_CLONE:** Computes continuous 512- or 1024-dimensional speaker vectors from pinned .wav files via convolutional/transformer backbones (ECAPA-TDNN/CAMPPlus), caching them as .pt tensors to avoid extraction overhead.  
> 2. **SPEAKER\_ID:** Maps an integer index into an internalized, pre-trained speaker embedding weight matrix (*W*spk​∈R*K*×*D*) via an *O*(1) tensor lookup.  
> 3. **DESCRIPTION\_PROMPT:** Employs structured natural language descriptors cross-attended in autoregressive decoders (e.g., Parler-TTS), avoiding reliance on living biometric likenesses.  
> 4. **SPEAKER\_VECTOR:** Injects precomputed, mathematically synthesized latent vectors into lightweight vocoders (e.g., Kokoro-82M).

### **4\. Somatic DSP Mapping Architecture & Algebraic Composition**

Physical trauma and nervous exhaustion recorded in the canonical relational ledger are translated into quantitative basis points (0 to 10,000 bp) by the Unified Pressure Meter Engine. The audio-microservice applies runtime DSP deltas against the neutral baseline:

Pitch: *F*0,eff​\=basePitchShiftSemitones+ΔPitchscene​  
Formant: *W*eff​\=formantWarpingFactor×ΔFormantscene​  
Velocity: *P*eff​\=speedScalarbase​×(1.0−0.30×(10,000SOMATIC\_FATIGUE​))  
Breath: Πeff​\=baseBreathiness×(1.0+1.40×(10,000SOMATIC\_FATIGUE​)2)  
Fry: Φeff​\=clamp(baseVocalFry+0.50(10,000SOMATIC\_FATIGUE​)\+0.40(10,000PHYSICAL\_PAIN​),0.0,1.0)  
CANONICAL STATE LEDGER: SOMATIC\_FATIGUE \= 8,200 bp  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ CONTEXT ASSEMBLY PASS (worker-sower-conductor)                         │  
│ • Evaluates somatic thresholds: SOMATIC\_FATIGUE \> 8,000 bp             │  
│ • Sets pause\_frequency\_multiplier \= 2.8                                │  
│ • Compounded breath dilation: Pi\_eff \= baseBreathiness \* (1 \+ 1.40\*S^2)│  
│ • Intercepts motor conflicts: \!line.motor\_actions.includes("RUN")      │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ NEURAL SYNTHESIS (audio-microservice on Port 8000\)                     │  
│ • Injects broken glottal stops and labored respiratory inhalations     │  
│ • Expands continuous audio duration (D\_ms) by up to \+40%               │  
└────────────────────────────┬───────────────────────────────────────────┘  
                             │  
                             ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ ffprobe MASTER CLOCK QUANTIZATION BRIDGE                               │  
│ • Baseline Line Duration: 2,100 ms (51 frames at 24 fps)               │  
│ • Dilated Fatigue Duration: 2,940 ms                                   │  
│ • target\_frames \= ceil((2940 / 1000\) \* 24\) \= 71 integer video frames   │  
│ • Exposure sheet allocates 71 frames to visual plate & Remotion Sequence│  
└────────────────────────────────────────────────────────────────────────┘

#### **Master Timeline Dilation**

Because physical duration governs visual cuts, expanding inter-clause pause factors (Πeff​) due to exhaustion directly lengthens audio duration (*D*ms​). A line taking 2,100 ms (51 frames) at resting baseline expands to 2,940 ms (71 frames) under 8,200 bp fatigue. The exposure sheet recalculates discrete 24 fps integer frames, forcing downstream video plates to adapt to the labored delivery.

### **5\. Semantic Filtering, Phonetic Firewalls & Dialect Mechanics**

To protect synthesis backends from out-of-vocabulary hallucinations and enforce prompt safety across cloud and local boundaries, text passes through a multi-tier firewall:

RAW SCRIPT INGRESS (from dialogue\_ast.json: "The siphon wrench is under the culvert.")  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 1: REGEX SYNTACTIC EXPANSION                                     │  
│ • Applies ordered regex\_replacements with word-boundary isolation (\\b) │  
│ • Expands colloquial elisions, metric units, and dialect forms         │  
│ • Transforms dialect safely without triggering upstream safety filters │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 2: CASE-INSENSITIVE LEXICAL TOKENIZATION                         │  
│ • Splits stream into words, punctuation tokens, and whitespace         │  
│ • Preserves trailing punctuation (\!, ?, .) for prosodic intonation    │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 3: PHONETIC LEXICON OVERRIDE LOOKUP                              │  
│ • Strips punctuation for lookup against phonetic\_rules keys            │  
│ • Hit: Replaces token with phonetic string or ARPAbet phoneme sequence │  
│ • Miss: Forwards token to engine default G2P fallback                  │  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ STAGE 4: ENGINE-SPECIFIC PHONEME ADAPTATION                            │  
│ • Piper/ONNX: Maps directly to internal phoneme ID tokens              │  
│ • CosyVoice: Formats as SSML/phoneme tag or phonetic text string       │  
│ • Parler-TTS: Formats as phonetically spelled syllables with caps stress│  
└───────────────────────────────┬────────────────────────────────────────┘  
                                │  
                                ▼  
         DISPATCHED TO NEURAL SYNTHESIS ENGINE (float32 PCM 48 kHz)

#### **1\. Prosodic Exclusion Filters (banned\_cadences)**

The character baseline recipe enforces explicit prosodic exclusion vectors to halt incompatible emotional deliveries at compile time (*T*0​\=\$0.00) before invoking the vocoder:

> * **The Invariant Law:** If an upstream narrative instruction dictates a delivery style that physically contradicts an entity's active somatic state, the ingress firewall intercepts the payload immediately.  
> * **The Vocal-Motor Theorem:**  
>   *c*.has\_verbal\_directives⟹("mute"∈/*c*.conditions∧"speak"∈/*c*.banned\_kinetic\_verbs)  
>   If an entity suffering from crushed laryngeal cartilage has spoken lines assigned, the compiler raises a fatal VOCAL\_DELIVERY\_BREACH.  
> * **Compile-Time Cadence Pruning:** The active recipe contains an array of prohibited deliveries (e.g., \["RAPID\_STACCATO", "RISING\_INFLECTION\_INTERROGATIVE", "BREATHLESS\_WHISPER"\]). If an injured character is instructed to deliver dialogue with "RAPID\_STACCATO", the directive is rejected with exit code 1 at *T*0​.

#### **2\. The NLP Slur Collision Defense & Architectural Partition**

In rural, noir, or colloquial dialect scripts, authors write phonetically contracted dialogue that triggers false-positive algorithmic censorship in automated safety filters:

*"NLP models misread heavy phonetic dialect as slurs. Spell out grammatical words even if the voice track delivers a heavy contraction."*

The architecture enforces an absolute separation between the **Screenplay AST Grammar (Voice Rail)** and **Synthesized Acoustic Delivery**:

> 1. **Upstream Safety Invariant:** The canonical database (Cloudflare D1 / SQLite) and human-readable screenplay AST strictly maintain grammatically clean, standardized English prose (e.g., *"Do you hear what they are saying in the drainage culvert?"*). This insulates upstream language models, linters, and edge gateways from tripping safety filters.  
> 2. **Offline Dialect Expansion:** When the local audio-microservice daemon runs on Rig 1, it executes the series-local G2P pass entirely offline where zero cloud API moderation filters exist.  
> 3. **Deterministic Replacement:** Pre-compiled regex patterns transform clean grammatical tokens into phonetic dialect forms (e.g., \\b(do you)\\b → "dee-yoo"), while proper nouns are swapped with unambiguous phonetic representations ("culvert" → "KULL-vert").  
> 4. **Transmedia Subtitle Hygiene:** Caption generators compile timed-text subtitle streams (.srt) directly from canonical AST text rather than audio transcriptions. Non-verbal combat efforts are encoded clinically (\[sharp exhale\], \[strained grunt\]) rather than phonetically (huff, urgggh), protecting published releases from platform demonetization.

### **6\. Multi-Series Lexicon Implementations & Case Studies**

Because series are strictly segregated under top-level namespaces (voices/\<series\_slug\>/), lexicons never cross-contaminate. A pronunciation rule in *Under the Floorboards* has zero visibility in *Wiregrass Basin* or *Deep Space Salvage*.

#### **Case Study A: Domestic Goblin Setting (voices/under-the-floorboards/lexicon.json)**

> * **World Axiom:** Fast, anxious, clipped domestic goblin farce beneath kitchen floorboards.  
> * **Acoustic Strategy:** High-pitched, clipped consonant emphasis with hard front-of-mouth plosives.  
> * **Engine Target:** Piper-ONNX (VITS architecture running on CPU with ≈80 MB RAM).  
> * **Notation Standard:** CUSTOM\_STRESS\_EXPANSION.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "under-the-floorboards",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "siphon": "SAI-fun",  
    "snerk": "SNERK",  
    "grissel": "GRIZ-zul",  
    "marrow-bone": "MAIR-oh-BOHN",  
    "floor-timbers": "FLOR-TIM-berz",  
    "skitter": "SKIT-ter",  
    "tallow": "TAL-oh",  
    "peevish": "PEE-vish"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(d'you)\\\\b",  
      "replacement": "dyoo",  
      "description": "Contracts 'd'you' to quick goblin dental glide"  
    },  
    {  
      "pattern": "\\\\b(gotta)\\\\b",  
      "replacement": "GAHT-tuh",  
      "description": "Forces clipped staccato on glottal stop"  
    },  
    {  
      "pattern": "\\\\b(underneath)\\\\b",  
      "replacement": "un-ner-NEETH",  
      "description": "Flattens 'd' sound for subterranean colloquial speech"  
    },  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(in|inch|inches)\\\\b",  
      "replacement": "\$1 IN-chez",  
      "description": "Expands dimensional measurements for hoarded items"  
    }  
  \],  
  "banned\_pronunciations": {  
    "siphon": \["SEE-fon", "sih-FON"\],  
    "grissel": \["GRIZ-lee", "gray-SEL"\]  
  }  
}

#### **Case Study B: Industrial Noir Setting (voices/wiregrass-basin/lexicon.json)**

> * **World Axiom:** Southern Gothic industrial noir, chemical defoliant runoff, heavy vocal fry, and laryngeal wear.  
> * **Acoustic Strategy:** Elongated diphthongs, dropped terminal nasals, dark unreleased plosives.  
> * **Engine Target:** CosyVoice-300M (Flow-matching diffusion vocoder).  
> * **Notation Standard:** CUSTOM\_STRESS\_EXPANSION.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "wiregrass-basin",  
  "phonetic\_alphabet": "CUSTOM\_STRESS\_EXPANSION",  
  "phonetic\_rules": {  
    "culvert": "KULL-vert",  
    "gallbreaker": "GAWL-bray-ker",  
    "creosote": "KREE-uh-soht",  
    "slough": "SLOO",  
    "diesel": "DEEZ-ul",  
    "spurl": "SPERL",  
    "defoliant": "dee-FOH-lee-unt",  
    "wiregrass": "WY-er-grass"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(ain't)\\\\b",  
      "replacement": "aynt",  
      "description": "Standardizes dialect negation without nasal pinch"  
    },  
    {  
      "pattern": "\\\\b(do you)\\\\b",  
      "replacement": "dee-yoo",  
      "description": "Softens interrogative onset into regional drawl"  
    },  
    {  
      "pattern": "\\\\b(\\\\w+)ing\\\\b",  
      "replacement": "\$1-in'",  
      "description": "Enforces dropped alveolar nasals across all continuous verbs"  
    },  
    {  
      "pattern": "\\\\b(drainage)\\\\b",  
      "replacement": "DRAY-nij",  
      "description": "Prevents over-enunciation of second syllable"  
    }  
  \],  
  "banned\_pronunciations": {  
    "slough": \["SLUFF", "SLOH"\],  
    "creosote": \["kree-OH-soht"\]  
  }  
}

#### **Case Study C: Hard Sci-Fi Telemetry (voices/deep-space-salvage/lexicon.json)**

> * **World Axiom:** Sealed space suits, depressurized salvage corridors, and narrow-band RF telemetry.  
> * **Acoustic Strategy:** Military NATO cadence, flat pitch modulation, radio bandpass (300 Hz to 3,400 Hz), zero vocal fry.  
> * **Engine Target:** Kokoro-82M (Style-TTS2 variant) and Chatterbox-Base.  
> * **Notation Standard:** ARPABET.

{  
  "schema\_version": "2.0.0",  
  "series\_slug": "deep-space-salvage",  
  "phonetic\_alphabet": "ARPABET",  
  "phonetic\_rules": {  
    "apogee": "AE1 P AH0 JH IY0",  
    "perigee": "P EH1 R AH0 JH IY0",  
    "eva": "IY1 V IY1 EY1",  
    "rcs": "AA1 R S IY1 EH1 S",  
    "hydrazine": "HH AY1 D R AH0 Z IY2 N",  
    "bulkhead": "B AH1 L K HH EH2 D",  
    "oracle": "AO1 R AH0 K AH0 L"  
  },  
  "regex\_replacements": \[  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(kpa|kilopascals?)\\\\b",  
      "replacement": "\$1 KIL-oh-pas-kahlz",  
      "description": "Metric pressure telemetry expansion"  
    },  
    {  
      "pattern": "\\\\b(\\\\d+)\\\\s\*(m/s|meters per second)\\\\b",  
      "replacement": "\$1 MEE-terz per SEK-und",  
      "description": "Velocity vector expansion"  
    },  
    {  
      "pattern": "\\\\b(atmo)\\\\b",  
      "replacement": "AT-moh",  
      "description": "Salvage slang for atmosphere"  
    },  
    {  
      "pattern": "\\\\b(o2)\\\\b",  
      "replacement": "OH-TOO",  
      "description": "Life-support gas telemetry"  
    }  
  \],  
  "banned\_pronunciations": {  
    "eva": \["EE-vah"\],  
    "rcs": \["er-SEE-ess"\]  
  }  
}

### **7\. Dual-Output Lexical Mapping & Spot Foley Architecture**

Foley sound design is compiled programmatically from screenplay action cues and immutable frame timestamps rather than placed manually in a DAW.

                        THE FOLEY RESOLUTION PIPELINE  
                          
Screenplay Action Line: "Bog drops the brass siphon into the mud."  
                                    │  
                                    ▼  
       AST Parser extracts semantic entity keys: \[ITEM\_SIPHON, TERRAIN\_MUD\]  
                                    │  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ FOLEY REGISTRY LOOKUP (foley/registry.json)                            │  
├────────────────────────────────────────────────────────────────────────┤  
│ Visual Plate Prompt:  "corroded brass tube submerged in dark mire"     │  
│ Audio Asset Stems:    \["foley/impacts/metal\_siphon\_scrape\_01.wav",     │  
│                        "foley/impacts/metal\_siphon\_scrape\_02.wav"\]     │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ DETERMINISTIC PRNG SELECTION (Mulberry32)                              │  
│ • Seed: MurmurHash3("ep040:shot\_01:ITEM\_SIPHON") \= 0x9e3779b9         │  
│ • Evaluates anti-clustering salt (:retry) if variant matches beat N-1 │  
│ • Resolved Path: "assets/audio/foley/metal\_siphon\_scrape\_02.wav"       │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │  
                                    ▼  
       Source-Baked Static JSX Emission into Episode\_040.tsx

> * **Lexical Mapping (foley/registry.json):** Resolves parsed action nouns simultaneously to visual diffusion plate prompts and physical .wav sample paths, enforcing sensory parity.  
> * **Track 2 Priority & Spatial Staging:** Foley operates on Track 2\. Punctual transients (weapon draws, footsteps, drops) snap strictly to visual action hold-frames, pre-roll reaction intervals, or Triad Phase B (Action/Impact) windows. Cues are dispersed across pre-roll (Math.floor(preRoll / 2)) and dialogue windows (preRoll \+ (cueIndex \* 18)), capped at 72 frames duration. Transients are mixed to upper-mid frequencies, spectrally isolating them from ambient beds below 250 Hz.  
> * **Deterministic PRNG Seeding (Mulberry32):** Standard JavaScript Math.random() is banned because concurrent headless rendering workers cause divergent sample draws and export desynchronization. The compiler digests semantic metadata into a 32-bit integer via MurmurHash3:  
>   Seed=MurmurHash3(sceneId+":"+shotId+":"+sampleKey)  
>   The integer seeds a Mulberry32 PRNG. If the drawn variant matches the sample used in the preceding beat, an anti-clustering salt (:retry) is appended to force a deterministic re-roll.  
> * **Source-Baking Invariant:** PRNG variant resolution executes exclusively at generation time. The resolved sample path is written directly into the TSX composition as a static string literal (src={staticFile("audio/foley/valve\_drop.wav")}), ensuring rendering thread concurrency has zero impact on acoustic reproducibility.

### **8\. Continuous Beds, Score & Anti-Pumping Sidechain Math**

Track 3 hosts continuous musical score stems or geometric ambient loops, operating as the low-priority acoustic foundation.

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

#### **1\. Compositional Paradigms**

> * **POD-16 Multi-Stem Score:** Delivered as separated master stems (Melodic, Harmonic, Percussive, Sub-bass). Stems allow the assembly layer to dynamically attenuate melodic formants (1 kHz to 3.5 kHz) during spoken lines while sustaining low-end drones.  
> * **Geometric Sound Beds (*Chosisme* Style):** For austere narrative modes where traditional cinematic scoring is banned, beds consist of continuous physical phenomena (40 Hz pipe hums, machinery drones, rain on zinc). Loops maintain a spectral centroid strictly below 250 Hz (spectralCentroidHz\<250) to prevent acoustic masking.  
> * **Kinetic Curve Automation:** The screenplay's 6-Beat Kinetic Curve acts as a mix automation score. The curve level (1 to 10) dictates loop layer density (clamp(⌈Level/2.5⌉,1,4)), tape-drive harmonic saturation, and dynamic ducking release times.

#### **2\. Programmatic Sidechain Ducking Math (AmbientTrack.tsx)**

During an active Track 1 dialogue window (*f*start​≤*f*≤*f*end​), background tracks duck by a target depth of **−14 dB**:

*V*duck​\=*V*base​×1020attenuation\_dB​\=0.40×1020−14​≈0.40×0.199526≈0.0798

> * **Quadratic Attack Phase (*A*\=6 frames,≈250 ms):** Precedes dialogue onset (*f*start​−6≤*f*\<*f*start​), smoothly ramping gain down via Easing.out(Easing.quad).  
> * **Active Dialogue Window (*f*start​≤*f*≤*f*end​):** Volume is held flat at the ducked floor (*V*duck​\=0.0798).  
> * **Quadratic Release Phase (*R*\=12 frames,≈500 ms):** Follows dialogue conclusion (*f*end​\<*f*≤*f*end​\+12), recovering back to *V*base​ via Easing.in(Easing.quad).

#### **3\. The Multi-Window Minimum Reducer (Anti-Pumping Architecture)**

If sidechain envelopes were evaluated with a naive loop that terminated upon the first matching dialogue window, a gap shorter than the combined release-and-attack duration (e.g., a 6-frame breath pause between sentences) would trigger the release branch of Line 1, partially ramping volume up before violently dipping on Line 2\. This produces an audible "gain pumping" artifact.

AmbientTrack.tsx eliminates pumping by evaluating all active dialogue windows across the scene simultaneously and applying a mathematical minimum reducer:

// AmbientTrack.tsx: Multi-window minimum-composed sidechain ducking  
import React from 'react';  
import { Audio, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';

export interface DialogueWindow {  
  from: number;  
  to: number;  
}

export interface AmbientTrackProps {  
  ambientFile: string;  
  baseVolume?: number;  
  attenuationDb?: number;  
  dialogueWindows: DialogueWindow\[\];  
  silences?: { fromFrame: number; toFrame: number; duckAmbientDb: number }\[\];  
  attackFrames?: number;  
  releaseFrames?: number;  
}

export const calculateDuckedGain \= (  
  frame: number,  
  baseVolume: number,  
  attenuationDb: number,  
  windows: DialogueWindow\[\],  
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
    // Union composition across all windows eliminates volume pumping  
    minGain \= Math.min(minGain, windowGain);  
  }

  return minGain;  
};

export const AmbientTrack: React.FC\<AmbientTrackProps\> \= ({  
  ambientFile,  
  baseVolume \= 0.40,  
  attenuationDb \= \-14.0,  
  dialogueWindows \= \[\],  
  silences \= \[\],  
  attackFrames \= 6,  
  releaseFrames \= 12,  
}) \=\> {  
  const frame \= useCurrentFrame();

  let resolvedVolume \= calculateDuckedGain(  
    frame,  
    baseVolume,  
    attenuationDb,  
    dialogueWindows,  
    attackFrames,  
    releaseFrames  
  );

  // Apply explicit narrative silences (e.g., dramatic realization holds)  
  for (const silence of silences) {  
    if (frame \>= silence.fromFrame && frame \<= silence.toFrame) {  
      resolvedVolume \*= Math.pow(10, silence.duckAmbientDb / 20);  
    }  
  }

  return (  
    \<Audio  
      src={staticFile(\`audio/ambient/\${ambientFile}\`)}  
      volume={resolvedVolume}  
    /\>  
  );  
};

#### **4\. Narrative Silences & \[BEAT\] Swells**

> * **Acoustic Swells (\[BEAT\] Nodes):** When the AST introduces an explicit narrative pause line (\[BEAT\]), text-to-speech synthesis is bypassed. The sidechain envelope releases, allowing ambient room tone or score to swell up to unity baseline volume (*V*base​), sustaining across the void and decaying roughly 0.5 seconds before dialogue resumes.  
> * **Deliberate Dramatic Silences (−24 dB Ducking):** High-tension realization pauses trigger explicit ducking events that force the ambient bed down to a strict **−24 dB** floor (*V*silence​≈0.0252), creating an acoustic vacuum.

### **9\. Temporal Topologies, Absolute Placement & The Dual-Domain Clock**

To prevent sub-frame phase cancellation and cut jitter, temporal execution spans two synchronized domains:

AUDIO DOMAIN (Sample-Accurate Physical Clock: 48,000 samples/sec)  
│  
├── Sub-millisecond acoustic transients  
├── Phoneme and viseme onset markers (e.g., Sample S \= 26,742)  
└── Continuous dynamic ducking envelopes (-14 dB speech window)  
│  
▼ Exact Ratio: S \= F \* (48,000 / 24\) \= F \* 2,000 samples/frame  
VIDEO DOMAIN (Master Media Timeline: 24 integer frames/sec)  
│  
├── Discrete Visual Cut Boundaries (Remotion \<Sequence\> timeline mounts)  
├── Total Shot Frame Budgets (target\_frames \= ceil(D\_ms \* 24 / 1000))  
└── ComfyUI Latent Diffusion Allocations (4n \+ 1 lattice conformance)

> * **The Constant Projection Factor:** The ratio bridging the 48 kHz Audio Precision Clock to the 24 fps Master Media Clock simplifies to an exact integer:  
>   24 frames/sec48,000 samples/sec​\=2,000 audio samples per video frame  
>   Any video frame *F* projects to audio sample coordinate *S*\=*F*×2,000. Conversely, an acoustic marker at sample offset *S* maps to video frame *F*\=⌊*S*/2,000⌋.

#### **Absolute Timeline Placement vs. The Concatenation Trap**

Quantizing continuous audio stems to discrete 24 fps frames via ceiling arithmetic introduces up to 41.67 ms (one frame) of tail silence per cut. If dialogue stems are concatenated sequentially end-to-end, this fractional error compounds linearly across an episode. Over 100 shots, an average drift of ≈0.5 frames per shot accumulates into **50 frames (≈2.08 seconds)** of positive drift, causing visual cuts and Foley cues to lose synchronization.

THE CONCATENATION TRAP (Linear Drift Accumulation)  
Shot 1 (74.1f \-\> 75f)     Shot 2 (89.2f \-\> 90f)     Shot 3 (50.1f \-\> 51f)  
\[ Stem 1 \]\[+0.9f pad\]     \[ Stem 2 \]\[+0.8f pad\]     \[ Stem 3 \]\[+0.9f pad\]  
├─────────────────────────┼─────────────────────────┼─────────────────────►  
Result: By Shot 100, audio has drifted \+4.17 SECONDS against continuous beds\!

ABSOLUTE TIMELINE PLACEMENT (Zero-Drift Tiling)  
fromFrame\_k \= ceil( (sum\_{i\<k} D\_i) / 1000 \* 24 )  
\[ Stem 1 (75f)           \]\[ Stem 2 (90f)           \]\[ Stem 3 (51f)        \]  
├─────────────────────────┴─────────────────────────┴─────────────────────►  
Result: Total episode drift is bounded to \< 1 frame (\< 41.67 ms) indefinitely\!

The generator eliminates cumulative drift by deriving absolute timeline placements from a running cumulative millisecond sum quantized once:

Start*k*​\=⌈1000∑*i*\<*k*​*Di*​​×24⌉  
End*k*​\=⌈1000∑*i*≤*k*​*Di*​​×24⌉−1

Because End*k*​\+1≡Start*k*\+1​, consecutive lines tile the timeline with zero gaps and zero overlaps, bounding total sequence drift relative to continuous physical audio to less than one single frame (\<41.67 ms) across an entire season.

### **10\. Directed Acyclic Graph Governance, Conformance Gauntlets & Operational Disciplines**

Media compilation is modeled as an immutable Directed Acyclic Graph (DAG) sealed by a provenance root (render\_manifest.json):

CANON LEDGER ──► DIALOGUE AST ──► TTS SYNTHESIS ──► EXPOSURE SHEET ──► DIFFUSION & COMPOSITING  
 (D1/SQLite)      (IR JSON)       (48kHz WAV)        (24fps Frames)      (Rig 2 / Remotion)

#### **1\. Economic Cost Horizons**

> * ***T*****0​ (\$0.00):** Linters, verbatim parity checks, schema assertions, and banned\_cadences gates abort execution before running workers.  
> * ***T*****1​ (\$0.0001):** CPU AST extraction and dialect expansion.  
> * ***T*****2​ (\$0.001):** Local CPU neural speech synthesis on Rig 1\.  
> * ***T*****3​ (\$0.15):** Heavy GPU video diffusion plates on Rig 2\.  
> * ***T*****4​ (\$0.01):** Headless Chromium optical compositing.

#### **2\. The 4*n*\+1 GPU Compute Firewall**

Video diffusion models (e.g., Wan 2.1) require latent frame structures adhering to a 4*n*\+1 temporal lattice (e.g., 73, 77, 81 frames). When a voice recipe mutates, new .wav files are measured and re-quantized. If the updated audio frame budget satisfies target\_framesnew​≤framesplate​, the GPU diffusion cluster is bypassed entirely; Remotion trims excess plate frames in optical assembly at *T*4​ (\$0.01 compute cost), saving hundreds of dollars in unnecessary re-rendering passes.

#### **3\. Post-Synthesis Conformance Gauntlet**

Before an audio stem is committed to disk, it must clear the five-stage verification battery:

> 1. **Filter 1: STT Verbatim Alignment Gate:** A local Whisper instance transcribes the raw 48 kHz PCM buffer, normalizes tokens via reverse-lexicon mapping, and asserts character-for-character parity against dialogue\_text. Transcripts are evaluated against banned\_pronunciations (e.g., flagging "SEE-fon" or "SLUFF"). Failures raise an immediate STT\_ALIGNMENT\_BREACH at *T*0​.  
> 2. **Filter 2: Pre-Conform Spectral Hygiene:** Applies a 24 dB/octave high-pass filter below 80–100 Hz to eliminate infrasonic vocoder thumps, alongside an optical de-esser targeting harsh sibilance spikes between 6.0 and 7.2 kHz.  
> 3. **Filter 3: Two-Pass EBU R128 Loudness Normalization:** Conforms integrated loudness to **−16.0 LUFS** (±1.0 LUFS) for web streaming or **−24.0 LUFS** for broadcast.  
> 4. **Filter 4: Brickwall True-Peak Limiter:** Clamps inter-sample peaks strictly to **≤−1.0 dBTP** using oversampled limiting to prevent distortion during platform transcoding (AAC/Opus).  
> 5. **Filter 5: Noise Floor Gate:** Unvoiced pauses must maintain an RMS noise floor strictly below **−60.0 dBFS**, ensuring background ambiance does not surge when sidechain ducking envelopes release.

#### **4\. New Operational Disciplines**

> * **Idempotent Atomic Staging:** Audio synthesis writes to .tmp files and commits via atomic POSIX rename(), allowing pipeline restarts after socket timeouts or network interruptions to resume cleanly from un-synthesized lines without clobbering valid assets.  
> * **Sensory Evidence Archival:** Neural vocoder outputs rely on non-deterministic floating-point math across disparate GPU/CPU instruction sets. Approved stems are classified as **Class 3 Archive-Dependent Evidence** and locked in content-addressed storage (CAS); regenerating audio dynamically on demand is prohibited because micro-variations alter stem durations and corrupt downstream optical cut points.  
> * **C2PA Manifest Ingestion:** Provenance metadata—including the AST hash, model weights SHA-256, performer consent ID, and reference audio checksum—is burned directly into the master container header using standard C2PA cryptographic signatures, guaranteeing end-to-end chain of custody from human-authored canon to final broadcast release.

### **Comprehensive Subsystem Matrix**

| Subsystem Component | Primary File / Contract | Operational Host | Invariant Law / Boundary Condition |
| :---- | :---- | :---- | :---- |
| **Voice Authority** | voices/voice\_manifest.json | audio-microservice (:8000) | Epistemological Triad: Checkpoint \+ Conditioning \+ Base DSP; 0 MB VRAM. |
| **Phonetic Firewall** | voices/\<series\>/lexicon.json | Rig 1 Local Host (Offline) | 4-Stage G2P normalization; NLP Slur Collision Defense; clean text on Axis A. |
| **Prosodic Filter** | banned\_cadences array | Conductor Pre-Flight Gate | Vocal-Motor Feasibility Theorem; halts invalid delivery styles at *T*0​ (\$0.00). |
| **Somatic DSP Engine** | produceEpisode.ts | Rig 1 Conductor | Runtime somatic deltas dialate breath pauses (Πeff​), driving physical time. |
| **Master Physical Clock** | exposure\_sheet.json | ffprobe Child Process | target\_frames=⌈(*D*ms​/1000)×24⌉; audio dictates visual cuts. |
| **Spot Foley Transients** | foley/registry.json | Remotion Track 2 | Dual-output lexical mapping; Mulberry32 PRNG seeded via MurmurHash3. |
| **Continuous Beds & Score** | music/manifest.json | Remotion Track 3 (AmbientTrack) | Geometric loops maintain centroid \<250 Hz; spans scenes via crossfades. |
| **Sidechain Automation** | AmbientTrack.tsx | Remotion Optical Compositor | −14 dB speech ducking; Multi-Window Minimum Reducer prevents pumping. |
| **Timeline Placement** | generate-episode-repo.ts | Scaffolding Compiler | Absolute cumulative quantization prevents concatenation-induced drift. |
| **Harvesting & Storage** | collect-episode-assets.ts | Staging Pre-Pass | AST-driven pruning (\<100MB envelope); Zero-Byte Poison Sentinel traps. |
| **Provenance Graph** | render\_manifest.json | Immutable Release Root | C2PA-signed Content Credentials linking audio stems to legal consent IDs. |

### **Concrete Stamped Execution Composition (Episode\_040.tsx)**

The integration of these subsystems converges within the source-baked composition stamped by goblin-viewport-template into goblin-episodes/ep040/Episode\_040.tsx:

// @lifecycle: generated  
// @checksum: 7bd4e10a2f9c4b1e8f90123456789abcde8412ff0a3b2c1d4e5f6a7b8c9d0e1f  
// @upstream\_ast: sha256:12c8a994ef7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d  
// @build\_profile: 1080p\_24fps\_master

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
          { from: 8, to: 83 },    // Shot 01: Spoken dialogue active window  
          { from: 107, to: 182 }  // Shot 02: Spoken dialogue active window  
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
          \<GoblinPuppet  
            character="BOG"  
            emotion="humiliated"  
            anchorPoint={{ x: 512, y: 980 }}  
            mouthBoundingBox={{ x: 380, y: 240, width: 64, height: 32 }}  
            talkBounceAmplitude={8}  
            spriteSrc={staticFile("assets/sprites/bog\_humiliated.png")}  
          /\>

          {/\* Track 1: Master Dialogue Audio Stem (Physical Duration: 75 frames) \*/}  
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
          \<GoblinPuppet  
            character="SPLEEN"  
            emotion="defensive"  
            anchorPoint={{ x: 480, y: 960 }}  
            mouthBoundingBox={{ x: 410, y: 220, width: 58, height: 30 }}  
            talkBounceAmplitude={14}  
            spriteSrc={staticFile("assets/sprites/spleen\_defensive.png")}  
          /\>

          {/\* Track 1: Master Dialogue Audio Stem (Physical Duration: 75 frames) \*/}  
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
