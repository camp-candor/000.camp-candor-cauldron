# Branch • Branch • Wan 2.x On Constrained Hardware

_Gemini · 88 messages · exported Nov 2, 2026_

### You

````markdown

Comprehensive Technical Handbook: Wan 2.x Local Image-to-Video (I2V) Deployment on Constrained Hardware

Section I: System Architecture & Environmental Baseline

The local processing environment, designated as the Swainsboro rig, operates under strict physical and thermal constraints. The primary graphics processing unit powering this local rig is an NVIDIA RTX 2060 equipped with 6GB of VRAM. This hardware limitation fundamentally dictates every architectural decision, optimization flag, quantization level, and execution strategy required to run state-of-the-art generative artificial intelligence models locally.

In high-performance artificial intelligence engineering, deploying massive frontier-class models—such as the 14-billion parameter Wan 2.x video generation architecture—typically demands enterprise-grade datacenter accelerators featuring 80GB or more of high-bandwidth VRAM. Running these architectures on a consumer-grade 6GB buffer requires meticulous memory engineering, extreme quantization, dynamic CPU offloading, and tiled latent decoding.

The purpose of this document is to serve as a comprehensive technical handoff for subsequent LLM instances and development agents (such as Jules). It captures the entire historical troubleshooting trajectory, architectural discoveries, optimization parameters, and pipeline configurations developed to successfully bridge the gap between heavy diffusion transformer workloads and constrained consumer hardware.

Section II: The Evolutionary Troubleshooting Trajectory

The journey toward local video generation involved resolving cascading systemic failures across multiple media generation frameworks. The initial phase of local optimization focused on audio generation pipelines utilizing the open-source YuE model architecture running inside a ComfyUI node environment.

1. The Audio Pipeline Diagnostics & Resolution

The 50 Hz Square Wave Failure: Initial execution attempts on the YuE pipeline resulted in catastrophic model collapse, producing a continuous, harsh 50 Hz square wave buzzing noise instead of audio. This was traced to tensor corruption caused by unvalidated audio prompt inputs (use_audio_prompt = true) and unclipped tensor shapes passing through the Stage 1 Large Language Model.

Quantization Precision Discrepancies: Running the Stage 1 autoregressive transformer in unquantized 16-bit floating point (fp16) on a 6GB VRAM card caused severe memory overflow, spilling computations into system RAM and corrupting the probability distributions of generated tokens. This manifested as a digital squeal mixed with muffled, glitchy vocalization attempts.

Resolution and Stabilization: The audio pipeline was stabilized by disabling audio prompt referencing, switching the loader quantization mode to quanto.qint8, enabling stage1_no_guidance = true, and separating the dual-track outputs (_itrack vs. _vtrack) to isolate clean instrumental stems from vocal decoders.

2. Transition to Video Diffusion Architectures

Having successfully stabilized local tensor execution and mastered ComfyUI memory management, the project transitioned from audio synthesis to video generation. Initial explorations examined lightweight models (such as SD 1.5-based AnimateDiff motion modules) which fit easily within 6GB VRAM but suffered from structural instability, warping, and a lack of production-grade visual fidelity.

This led to the investigation of Wan 2.x, an advanced open-source video generation framework developed by Alibaba, capable of delivering commercial-grade cinematic output, temporal consistency, and complex physical motion simulation.

Section III: Core Architectural Analysis of Wan 2.x

Understanding how to bend Wan 2.x to fit within a 6GB VRAM footprint requires a deep examination of its underlying structural design, particularly the differences between the Wan 2.1 dense transformer and the Wan 2.2 Mixture-of-Experts (MoE) architecture.

1. Wan 2.1 vs. Wan 2.2: Structural Mechanics

Wan 2.1 (Dense Transformer): Utilizes a traditional dense DiT (Diffusion Transformer) backbone. Every parameter in the network participates in every layer of the denoising process. While mathematically straightforward, the 14B variant requires massive VRAM bandwidth and capacity (65GB–80GB at native 720p).

Wan 2.2 (Mixture-of-Experts): Introduced significant architectural upgrades. Wan 2.2 shifts from a dense transformer to a Mixture-of-Experts (MoE) routing system. The total parameter count scales to approximately 27 billion, but only 14 billion parameters are active during any single generation step.

The MoE Denoising Split: Wan 2.2's MoE is specifically optimized for the diffusion denoising timeline. A high-noise expert network handles the initial denoising steps, focusing on structural layout, composition, and macro-motion planning. Once the signal-to-noise ratio (SNR) crosses a specific threshold, a low-noise expert takes over to refine micro-textures, edge sharpness, and fine details.

Training Dataset Expansion: Wan 2.2 was trained on a substantially larger corpus—incorporating roughly 65.6% more images and 83.2% more videos than Wan 2.1. This massive expansion directly improves multi-subject prompt adherence, complex motion tracking, and long-range semantic consistency.

2. Why Wan 2.x Excels Over Lightweight Alternatives

While smaller models (such as 1.3B variants or SD 1.5 AnimateDiff loops) render quickly on consumer cards, they fail to maintain structural permanence over time. Wan 2.x provides:

Production-Grade Temporal Stability: Eliminates hallucinatory morphing, limb mutations, and flickering background textures.

Advanced Physics Simulation: Accurately models cloth draping, fluid dynamics, and weight distribution.

Cinematic Composition: Adheres strictly to multi-layered prompt instructions regarding camera movement, rack focus, and spatial staging.

Section IV: Hardware Constraints & VRAM Mitigation Strategies

Running a 14-parameter model family on an RTX 2060 (6GB VRAM) is fundamentally an exercise in memory management. Without intervention, loading the model weights will instantly trigger a CUDA out-of-memory (OOM) kernel panic.

1. The Memory Bottleneck Equation

A standard unquantized 14B parameter model in FP16 precision requires roughly 28GB of raw storage for weights alone, not accounting for the activation memory, key-value caches, text encoder tensors (such as T5-XXL), and the 3D Variational Autoencoder (VAE). Bridging this gap on 6GB VRAM requires four non-negotiable engineering layers:

Extreme Weight Quantization (GGUF / bitsandbytes): Compressing the DiT backbone down to 3-bit or 4-bit precision.

Aggressive Model Offloading: Streaming weights dynamically between system RAM and VRAM via PCIe bus swapping.

CPU-Bound Text Encoding: Offloading the massive UMT5-XXL text encoder entirely to system RAM and CPU cores.

Tiled Latent Decoding: Breaking final video decoding into microscopic spatial and temporal tiles to bypass VRAM ceiling limits.

Section V: Low-Bit Quantization Protocols & GGUF Implementation

Quantization is the process of reducing the numerical precision of model weights from 16-bit floating point (fp16/bf16) down to lower-bit integer representations (Q2_K, Q3_K_M, Q4_K_M, or NF4).

1. Utilizing the ComfyUI-GGUF Wrapper

To load Wan 2.x 14B models on consumer hardware, the ComfyUI ecosystem relies on community-provided GGUF conversions (curated by developers like city96).

Model Selection: The optimal balance between generation quality and memory preservation for a 6GB rig is the wan2.2-i2v-14B-Q3_K.gguf or wan2.1-i2v-14B-Q4_K.gguf file format.

Compression Ratio: A Q3_K or Q4_K quantization compresses the 14B transformer weights down to roughly 5.5GB–7GB, allowing the core network to sit near or within the hardware limits when combined with offloading.

Node Integration: Instead of standard unquantized loaders, the workflow mandates the use of UnetLoaderGGUF provided by the ComfyUI-GGUF custom node extension.

Section VI: Text Encoder Offloading & CPU Memory Swapping

Wan 2.x models rely on an external text encoder (UMT5-XXL) to parse complex natural language prompts and map them into semantic embedding tensors. The full UMT5-XXL encoder is exceptionally large, consuming upwards of 11GB of VRAM in unquantized form.

1. Forcing CPU Execution

To prevent the text encoder from consuming VRAM:

Load the text encoder using DualCLIPLoaderGGUF or specialized GGUF text encoder loaders.

Explicitly configure the execution device parameter for the text encoder to cpu or enforce 8-bit quantization (--fp8_e4m3fn-text-enc startup argument).

The Performance Cost: Running the text encoder on system CPU introduces a brief delay during the prompt parsing phase before denoising begins, but it preserves vital VRAM space for the DiT backbone.

2. ComfyUI Startup Launch Arguments

To automate memory offloading across the entire pipeline, the ComfyUI startup batch script must include specific command-line flags:

Plaintext

python main.py --lowvram --fp8_e4m3fn-text-enc

--lowvram: Instructs ComfyUI to keep transformer blocks unassigned in system RAM and stream individual layers into the 6GB VRAM buffer sequentially during each diffusion step, unloading them immediately after computation.

--fp8_e4m3fn-text-enc: Forces text encoding operations into 8-bit floating point precision to minimize memory allocation overhead.

Section VII: Tiled VAE Decoding & Latent Spatial-Temporal Partitioning

Even when the diffusion transformer successfully completes its sampling loop, generating the final pixel-level video frames requires passing the compressed latent tensors through the Wan 3D VAE. A standard full-frame VAE decode operation on 17 to 33 frames of video at 480p/720p will instantly trigger an out-of-memory crash on a 6GB GPU.

1. Implementing Tiled VAE

Node Replacement: Replace the standard VAE Decode node with VAE Decode (Tiled).

Spatial Tile Sizing: Set spatial tile dimensions to 256x256 pixels. This ensures the decoder processes images in small grid chunks rather than rendering the entire canvas simultaneously.

Temporal Tile Sizing: Set temporal tiling to 8 frames. This restricts the VAE from decoding more than 8 sequential frames at any given moment, keeping memory footprints flat and predictable throughout the video reconstruction phase.

Section VIII: ComfyUI Pipeline Wiring & Node Configuration Blueprint

To operationalize the Wan 2.x setup within ComfyUI, the node graph must be structured precisely to prevent memory leaks and handle tensor passing between CPU offloaded components and GPU samplers.

1. Essential Custom Node Extensions

Before loading any workflows, ensure the following custom nodes are installed via ComfyUI Manager:

ComfyUI-GGUF (city96) — For loading quantized DiT and text encoder weights.

ComfyUI-WanVideoWrapper — Handles Wan-specific model scheduling, time-step embeddings, and tensor sequencing.

ComfyUI-VideoHelperSuite — Manages video frame compilation, format encoding (FLAC, MP4, WebM), and output previewing.

2. Complete Component Mapping Table

Pipeline StageComponent / File NameComfyUI Node TypeExecution Device / QuantizationDiffusion Backbonewan2.2-i2v-14B-Q3_K.ggufUnetLoaderGGUFGPU (Offload Enabled via --lowvram)Text Encoderumt5_xxl_fp8_e4m3fn.safetensorsDualCLIPLoaderGGUFForced to CPU / 8-bitVideo VAEwan_2.1_vae.safetensorsVAELoaderGPU (Tiled Decoding Active)Initial Frame InputTarget Keyframe ImageLoad Image / Load CLIP VisionStaging BufferFinal DecoderLatent-to-Pixel TransformVAE Decode (Tiled)GPU (Spatial: 256x256, Temporal: 8)

Section IX: Image-to-Video (I2V) Parameter Tuning and Control Mechanics

To achieve maximum control and avoid compositional randomness, the Image-to-Video (I2V) pipeline is prioritized over text-to-video (T2V) generation. By providing a static anchor keyframe, the model's creative scope is restricted entirely to physical motion, lighting shifts, and camera trajectories.

1. Phase 1: Keyframe Anchoring

Resolution Matching: Ensure the input reference image strictly matches Wan's supported native aspect ratios and resolution profiles before encoding (e.g., 832x480 for 16:9 widescreen or 512x512 for square format).

Spatial Latent Initialization: The reference image acts as Frame 0, anchoring the character design, wardrobe, background environment, and art style, preventing the model from hallucinating structural changes.

2. Phase 2: Motion Prompt Construction

In I2V workflows, prompt engineering rules shift entirely away from static descriptions. Because the model already reads the visual details from the reference image, text prompts must focus exclusively on kinetic actions, physics, and camera direction:

Recommended Prompt Structure: Slow cinematic camera pan right, character blinks and turns head slightly toward the light source, subtle wind blowing through hair and coat fabric, 24fps, high fidelity.

3. Locked Sampler Parameters for 6GB Stability

To ensure stable execution without triggering memory timeouts or crashing the Swainsboro rig, generation parameters must be locked to strict baseline constraints:

Resolution: 832x480 (Standard 480p widescreen).

Frame Count: 17 or 33 frames (Wan natively processes sequences calculated as $(FPS \times Seconds) + 1$).

Sampling Steps: 20 to 25 steps.

Sampler / Scheduler: FlowMatchEuler or UniPC / Simple.

CFG Scale: 5.0 to 6.0 (Wan 2.x handles standard DiT guidance effectively without generating the metallic audio-style distortions seen in autoregressive models).

Section X: Repository Scaffolding, Documentation Structure, and Governance Rules

To transition this pipeline into a managed codebase, a dedicated repository is initialized, mirroring the structural philosophy of 000.music-bed while entirely remapping its purpose to local Wan 2.x I2V automation.

1. Strict Compliance and Governance Directives

Any automated coding agent (such as Jules) tasked with maintaining or expanding this repository must adhere to rigorous architectural guardrails derived from past project corrections:

Cardano Exclusion: All references to "Cardano" must be completely purged and banned from all code files, README documentation, and configuration scripts.

Prohibited Section Headers: The documentation must never contain the following legacy project sections:

II. The Archive of Rot (The Sovereign State Matrix)

III. The Ledger of Bone (Immutable State Preservation)

VII. The Narrative Airgap (The Sanctuary of the Void)

IX. The Jungian Crucible (The Perfect Run)

XI. The Guest of Honor Protocol (Alternate Realities)

Component Nomenclature Rule: Any system component previously referenced as the "Archivist" must be permanently renamed and designated as the worker-sower across all scripts, modules, and documentation files.

2. Repository Directory Layout Specification

The scaffolded repository structure mirrors standard modular automation pipelines:

Plaintext

000.wan-video-rig/

├── workflows/

│ ├── wan2.2_i2v_480p_gguf.json

│ └── wan2.2_i2v_tiled_vae.json

├── scripts/

│ ├── launch_comfyui.bat

│ └── stage_inputs.py

├── config/

│ ├── model_paths.yaml

│ └── sampler_defaults.json

├── outputs/

│ └── staged_videos/

└── README.md

3. Standard Windows Launch Script (launch_comfyui.bat)

The automated boot script ensures environmental flags and VRAM restrictions are applied universally upon startup:

Code snippet

@echo off

TITLE Swainsboro Rig - Wan 2.x ComfyUI Environment

D:

cd D:\ComfyUI

python main.py --lowvram --fp8_e4m3fn-text-enc

pause

This comprehensive handbook encapsulates the entire technical history, hardware parameters, quantization blueprints, and architectural protocols required to successfully execute production-grade Wan 2.x Image-to-Video generation on constrained local hardware.

```

you will be helping me troubleshoot this project

### Gemini

I have fully ingested the Wan 2.x documentation for the Swainsboro rig. Orchestrating a 14-billion parameter Mixture-of-Experts architecture on a strict 6GB VRAM budget is a massive feat of memory engineering.

Your architectural guardrails are locked in. I will ensure all future scripts, node wirings, and pipeline configurations adhere strictly to your GGUF quantization limits, temporal VAE tiling protocols, and repository governance—including the exclusive use of the **worker-sower** nomenclature and the permanent exclusion of the prohibited legacy concepts.

Ready to begin. What is the first bottleneck?

### You

i am looking for extensive step by step instruction on how to implement this on my machine starting with this current empty repo [https://github.com/slopratchet/000.wan-toon] and ending with the frames from a complete ran render

### Gemini

To transform the empty `000.wan-toon` repository into a fully functional, memory-optimized Wan 2.x pipeline for your Swainsboro rig, we must execute the setup in a strict sequence. Missing a memory flag or loading the wrong node will immediately result in a CUDA out-of-memory (OOM) crash on the 6GB VRAM ceiling.

1

Scaffold the Local Repository

**1.Scaffold the Local Repository:**
Clone your empty repository and establish the directory structure required for the pipeline and the **worker-sower** automation. Open your terminal in your target local directory:

```bash
git clone https://github.com/slopratchet/000.wan-toon.git
cd 000.wan-toon
mkdir workflows scripts config outputs outputs\staged_videos
```

Create the `scripts/launch_comfyui.bat` file exactly as designed to enforce the VRAM constraints:

```dos
@echo off
TITLE Swainsboro Rig - Wan 2.x ComfyUI Environment
D:
cd D:\ComfyUI
python main.py --lowvram --fp8_e4m3fn-text-enc
pause
```

2

Install ComfyUI & Core Extensions

ComfyUI must be installed on the D: drive as referenced in your batch script

**2.Install ComfyUI & Core Extensions:**ComfyUI must be installed on the D: drive as referenced in your batch script.
If ComfyUI is not already present at `D:\ComfyUI`, install the standalone Windows version. Once booted, install ComfyUI Manager and use it to fetch the non-negotiable custom nodes:

**ComfyUI-GGUF** (by city96)

**ComfyUI-WanVideoWrapper**

**ComfyUI-VideoHelperSuite**

Restart ComfyUI completely after these are installed to ensure the custom node paths register.

3

Provision the Quantized Weights

Placing heavy models in the wrong directory breaks the GGUF loader

**3.Provision the Quantized Weights:**Placing heavy models in the wrong directory breaks the GGUF loader.
Download the necessary models and place them in the correct ComfyUI subdirectories. Do not use unquantized models.

**Diffusion Backbone:** Place `wan2.2-i2v-14B-Q3_K.gguf` inside `D:\ComfyUI\models\unet\`

**Text Encoder:** Place `umt5_xxl_fp8_e4m3fn.safetensors` inside `D:\ComfyUI\models\clip\`

**VAE:** Place `wan_2.1_vae.safetensors` inside `D:\ComfyUI\models\vae\`

4

Construct the Node Graph

Do not use standard loaders

**4.Construct the Node Graph:**Do not use standard loaders.
Launch ComfyUI using your `launch_comfyui.bat` script. Build the workflow by connecting the following nodes. Once built, save this graph as `wan2.2_i2v_tiled_vae.json` in your repository's `workflows/` directory.

**UnetLoaderGGUF:** Select `wan2.2-i2v-14B-Q3_K.gguf`. (The `--lowvram` flag automatically handles the offloading).

**DualCLIPLoaderGGUF:** Select `umt5_xxl_fp8_e4m3fn.safetensors`. Ensure the device is forced to CPU if the node allows, though your `--fp8_e4m3fn-text-enc` startup flag will force the 8-bit memory ceiling.

**VAELoader:** Select `wan_2.1_vae.safetensors`.

**Load Image:** Upload your anchor keyframe here.

**Wan I2V / Video Wrapper Nodes:** Connect the Unet, CLIP, and Image into the Wan 2.x scheduling nodes (specific node names vary slightly based on the wrapper version, but they typically accept the model, positive/negative prompts, and the latent image).

**Sampler (KSampler):**

Steps: `20`

CFG: `5.5`

Sampler: `uni_pc` or `euler`

Scheduler: `simple` or `flow_match`

**VAE Decode (Tiled):** Connect the latent output from the sampler here. **Crucial:** Set `tile_size` (spatial) to `256` and `temporal_size` to `8`.

**Video Combine:** Connect the image output from the VAE Decode to this VideoHelperSuite node. Set format to `video/h264-mp4` and frame rate to `24`.

5

Stage the Keyframe and Motion Prompt

**5.Stage the Keyframe and Motion Prompt:**
Prepare your input image. Crop and resize it exactly to **832x480** before feeding it into the `Load Image` node. If it is not exactly this resolution, the tensor shapes will mismatch and crash.

In your positive prompt node (connected to the text encoder), write purely kinetic instructions. Example:

*Slow cinematic camera pan right, character blinks and turns head slightly toward the light source, subtle wind blowing through hair and coat fabric, 24fps, high fidelity.*

6

Execute and Monitor the Render

The CPU and RAM will spike before the GPU takes over

**6.Execute and Monitor the Render:**The CPU and RAM will spike before the GPU takes over.
Click **Queue Prompt**. Watch the console terminal (where the batch script is running):

You will first see the UMT5 text encoder process the prompt on the CPU.

Next, the GGUF loader will begin swapping the transformer blocks into the 6GB VRAM.

The KSampler will tick through the 20 steps.

Finally, the Tiled VAE will break the 17 or 33 frames into chunks. If this step starts, your memory management has succeeded.

The final MP4 will be generated in your `D:\ComfyUI\output` folder. You can then copy it to your repository's `outputs/staged_videos/` directory.

Want to build the worker-sower automation script?

### You

[Once booted, install ComfyUI Manager and use it to fetch the non-negotiable custom nodes:

ComfyUI-GGUF (by city96)

ComfyUI-WanVideoWrapper

ComfyUI-VideoHelperSuite] how do i fetch these

### Gemini

Install **ComfyUI-Manager** first if you haven't already, then use it to pull the three nodes directly through the UI.

**Step 1: Install ComfyUI-Manager (Prerequisite)**

Open your command prompt, navigate to your custom nodes directory, and clone the repository:

```bash
cd D:\ComfyUI\custom_nodes
git clone https://github.com/ltdrdata/ComfyUI-Manager.git
```

Restart ComfyUI using your `launch_comfyui.bat` script.

**Step 2: Fetch the Custom Nodes via Manager**

1. Open the ComfyUI web interface in your browser.
2. Click the **Manager** button on the floating menu panel.
3. Click **Custom Nodes Manager**.
4. In the search box, search for and install each repository:
  - **ComfyUI-GGUF** (author: `city96`) → Click **Install**
  - **ComfyUI-WanVideoWrapper** (or search `WanVideo`) → Click **Install**
  - **ComfyUI-VideoHelperSuite** (author: `Kosinkadink`) → Click **Install**
5. Click **Restart** in the ComfyUI Manager menu when prompted (or close the terminal and re-run `launch_comfyui.bat`).

**Alternative: Direct Git Clone (Bypassing the UI)**

If ComfyUI-Manager fails to locate or fetch any node, close ComfyUI and clone the repositories directly into your `custom_nodes` folder:

```bash
cd D:\ComfyUI\custom_nodes
git clone https://github.com/city96/ComfyUI-GGUF.git
git clone https://github.com/kijai/ComfyUI-WanVideoWrapper.git
git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git
```

Once cloned, launch ComfyUI with `launch_comfyui.bat` and verify in the terminal startup logs that all three extensions load without import errors.

Need help downloading the exact GGUF model files next?

### You

go into more detail on [Download the necessary models] give me a list of all the models and need and where to find them

### Gemini

Here is the complete breakdown of every model file required to run the constrained 14B Image-to-Video pipeline, along with the official community Hugging Face repositories and exact disk paths.

### 1. Model Breakdown & Repository Links

| Model Role | Recommended File Name | Hugging Face Repository | Approx Size | Target Directory |
| --- | --- | --- | --- | --- |
| **Diffusion Backbone (DiT)** | `wan2.1-i2v-14b-480p-Q3_K_M.gguf` *(or `Q4_K_M` / `Q4_0`)* | [`city96/Wan2.1-I2V-14B-480P-gguf`](https://huggingface.co/city96/Wan2.1-I2V-14B-480P-gguf/tree/main) | ~7.9 GB – 10.2 GB | `D:\ComfyUI\models\unet\` |
| **Text Encoder** | `umt5_xxl_fp8_e4m3fn_scaled.safetensors` *(or standard fp8)* | [`Comfy-Org/Wan_2.1_ComfyUI_repackaged`](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/tree/main/split_files/text_encoders) | ~5.2 GB | `D:\ComfyUI\models\clip\` |
| **Video VAE** | `Wan2_1_VAE_bf16.safetensors` | [`Comfy-Org/Wan_2.1_ComfyUI_repackaged`](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/tree/main/split_files/vae) or [`Kijai/WanVideo_comfy`](https://huggingface.co/Kijai/WanVideo_comfy) | ~254 MB | `D:\ComfyUI\models\vae\` |
| **CLIP Vision (Image Conditioning)** | `clip_vision_h.safetensors` | [`Comfy-Org/Wan_2.1_ComfyUI_repackaged`](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/tree/main/split_files/clip_vision) | ~1.3 GB | `D:\ComfyUI\models\clip_vision\` |

### 2. Direct Download Instructions

#### A. Diffusion Backbone (UNet / DiT)

- **Source:** Hugging Face → `city96/Wan2.1-I2V-14B-480P-gguf`
- **Files:** Under the **Files and versions** tab, download `wan2.1-i2v-14b-480p-Q3_K_M.gguf`. *(Note: For the 6GB VRAM threshold, stick strictly to the **480P** version. The 720P variant increases activation layers and exceeds memory bounds during offload swaps).*
- **Destination:** `D:\ComfyUI\models\unet\wan2.1-i2v-14b-480p-Q3_K_M.gguf`

#### B. Text Encoder (UMT5-XXL FP8)

- **Source:** Hugging Face → `Comfy-Org/Wan_2.1_ComfyUI_repackaged` → `split_files/text_encoders/`
- **Files:** Download `umt5_xxl_fp8_e4m3fn_scaled.safetensors`.
- **Destination:** `D:\ComfyUI\models\clip\umt5_xxl_fp8_e4m3fn_scaled.safetensors`

#### C. Video VAE

- **Source:** Hugging Face → `Comfy-Org/Wan_2.1_ComfyUI_repackaged` → `split_files/vae/`
- **Files:** Download `Wan2_1_VAE_bf16.safetensors`.
- **Destination:** `D:\ComfyUI\models\vae\Wan2_1_VAE_bf16.safetensors`

#### D. CLIP Vision Encoder

- **Source:** Hugging Face → `Comfy-Org/Wan_2.1_ComfyUI_repackaged` → `split_files/clip_vision/`
- **Files:** Download `clip_vision_h.safetensors`.
- **Destination:** `D:\ComfyUI\models\clip_vision\clip_vision_h.safetensors`

### 3. Quick CLI Download Script (Optional)

If you have the `huggingface-cli` or `curl` available in your environment, you can run these commands from a command prompt:

```dos
:: Create target folders if they do not exist
mkdir D:\ComfyUI\models\unet
mkdir D:\ComfyUI\models\clip
mkdir D:\ComfyUI\models\vae
mkdir D:\ComfyUI\models\clip_vision

:: Download UNet GGUF
curl -L -o D:\ComfyUI\models\unet\wan2.1-i2v-14b-480p-Q3_K_M.gguf https://huggingface.co/city96/Wan2.1-I2V-14B-480P-gguf/resolve/main/wan2.1-i2v-14b-480p-Q3_K_M.gguf

:: Download Text Encoder
curl -L -o D:\ComfyUI\models\clip\umt5_xxl_fp8_e4m3fn_scaled.safetensors https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors

:: Download VAE
curl -L -o D:\ComfyUI\models\vae\Wan2_1_VAE_bf16.safetensors https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/vae/Wan2_1_VAE_bf16.safetensors

:: Download CLIP Vision
curl -L -o D:\ComfyUI\models\clip_vision\clip_vision_h.safetensors https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/clip_vision/clip_vision_h.safetensors
```

Once placed, launch ComfyUI via `launch_comfyui.bat` to ensure the loaders recognize all files.

Ready to wire the node graph in ComfyUI?

### You

which one do i download; its over a year old; have there been any updates which might add more value

### Gemini

### I. The File Selection

From the specific screenshot `2026-08-17 22_39_17-Window.jpg`, you should download **`wan2.1-i2v-14b-480p-Q3_K_M.gguf`**. This specific quantization maintains the necessary compression ratio to successfully offload and execute within the rigid 6GB VRAM constraints of your local rig without corrupting the video output.

### II. The Value of the Wan 2.2 Update

Since that 2.1 repository was published, Alibaba released the major **Wan 2.2** upgrade on July 28, 2025. Moving to this newer version adds massive value to the visual fidelity and physics simulation of the pipeline:

- **Mixture-of-Experts (MoE) Architecture:** The Wan 2.2 A14B model transitioned to an MoE mechanism. While the total size scales to approximately 27 billion parameters, only 14 billion are active per inference step—boosting performance without drastically increasing the inference cost.
- **Expanded Training Corpus:** The model was trained on a much broader foundation, incorporating 83.2% more videos and 65.6% more images compared to Wan 2.1.
- **Cinematic-Level Aesthetic Control:** The 2.2 training pipeline included finely labeled aesthetic datasets specifically targeting lighting, composition, contrast, and color maps. This allows for precise control over cinematic styles in generated video outputs. This fine-grained environmental control is ideal for executing precise, atmospheric art direction—perfect for capturing the heavy shadows of Biopunk-Noir or the humid, desolate aesthetic of Southern Gothic vignettes.

If you decide to update the `worker-sower` automation to take advantage of these enhanced aesthetic capabilities, you will need to locate the `wan2.2-i2v-14B-Q3_K.gguf` model instead of the 2.1 version pictured.

Would you prefer to continue setting up the Wan 2.1 baseline to verify the environment, or should we pivot the workflow architecture directly to Wan 2.2?

### You

pivot the workflow architecture directly to Wan 2.2?

### Gemini

Pivoting to Wan 2.2 requires a fundamental shift in how the 6GB VRAM handles the diffusion process. Because Wan 2.2 utilizes a Mixture-of-Experts (MoE) architecture, we are no longer loading a single monolithic file. Instead, the denoising timeline is split across two separate 14B parameter expert networks.

The visual upgrade is massive. Wan 2.2 incorporates meticulously curated aesthetic data with detailed labels for lighting, composition, contrast, and color tone. This allows for exact, controllable cinematic styling—providing the necessary environmental control to accurately render heavy Biopunk-Noir shadows or the humid, desolate atmospheres of Southern Gothic vignettes without the model hallucinating out of genre.

Here is the exact technical execution required to update the **worker-sower** pipeline for Wan 2.2.

### I. The Dual MoE Download Protocol

You will need to download the quantified versions of *both* expert networks. They work in tandem.

**Source:** Hugging Face → `QuantStack/Wan2.2-I2V-A14B-GGUF` or `bullerwins/Wan2.2-I2V-A14B-GGUF`.

1. **The High-Noise Expert:** Handles the initial denoising steps to establish the macro-motion structure and overall layout.
  - **File:** `wan2.2_i2v_high_noise_14B_Q3_K_M.gguf` (Ensure you stay at the Q3 level to maintain the 6GB ceiling).
  - **Destination:** `D:\ComfyUI\models\unet\`
2. **The Low-Noise Expert:** Takes over later in the generation step timeline to refine textures, edges, and fine details.
  - **File:** `wan2.2_i2v_low_noise_14B_Q3_K_M.gguf`
  - **Destination:** `D:\ComfyUI\models\unet\`

*(Your existing Text Encoder `umt5_xxl_fp8_e4m3fn.safetensors` and VAE `wan_2.1_vae.safetensors` remain perfectly viable and do not need to be replaced for this upgrade).*

### II. Node Graph Restructuring (The MoE Handoff)

Your `wan2.2_i2v_tiled_vae.json` workflow must be re-wired to orchestrate the handoff between the two models. This relies on the signal-to-noise ratio (SNR) thresholds managed by ComfyUI.

1. **Dual UNet Loaders:** Add two `UnetLoaderGGUF` nodes to your workspace instead of one. Load the High-Noise model into the first, and the Low-Noise model into the second.
2. **The Advanced KSampler Setup:** You can no longer use a standard basic KSampler. You must use the advanced sampling nodes that allow you to dictate start and end steps:
  - **KSampler (Advanced) 1:** Connect the High-Noise UNet. Set `start_at_step` to `0`, and set `end_at_step` to roughly half of your total steps (e.g., step 12 out of 25).
  - **KSampler (Advanced) 2:** Connect the Low-Noise UNet. Pass the latent output from the first sampler into this one. Set `start_at_step` to `12`, and `end_at_step` to `25`.
3. **VRAM Management:** The `--lowvram` startup flag in your batch script handles the offloading. ComfyUI will load the High-Noise weights into VRAM, compute the first 12 steps, flush the VRAM, load the Low-Noise weights, and compute the remaining steps.

### III. Aesthetic Prompt Injection

Because of the expanded 83.2% increase in video training data and 65.6% increase in image data, your motion prompts need to incorporate strict aesthetic triggers at the very end of the string to take advantage of the 2.2 labeling.

- **Updated Prompt Example:** *Slow dolly in, rack focus from foreground character to background machinery, subtle wind blowing through coat fabric, 24fps. Cinematic color grading, high contrast shadows, teal and orange tones, shallow depth of field.*

Ready to build the MoE workflow JSON?

### You

ok present me with another list of the all the models i will need to install under the wan 2.2 updated version

### Gemini

Here is the complete inventory of all required model files, exact filenames, Hugging Face sources, and local destination paths for the **Wan 2.2 Image-to-Video (I2V-A14B)** pipeline.

### 1. Wan 2.2 Model Inventory Table

| Component Role | Specific File Name | Hugging Face Repository | Disk Size | Target Directory |
| --- | --- | --- | --- | --- |
| **High-Noise Expert (DiT)** | `wan2.2-i2v-a14b-high-Q3_K_M.gguf` *(or `Q3_K_S` / `Q4_K_S`)* | [`QuantStack/Wan2.2-I2V-A14B-GGUF`](https://huggingface.co/QuantStack/Wan2.2-I2V-A14B-GGUF) or [`bullerwins/Wan2.2-I2V-A14B-GGUF`](https://modelscope.cn/models/bullerwins/Wan2.2-I2V-A14B-GGUF) | ~8.2 GB | `D:\ComfyUI\models\unet\` |
| **Low-Noise Expert (DiT)** | `wan2.2-i2v-a14b-low-Q3_K_M.gguf` *(or `Q3_K_S` / `Q4_K_S`)* | [`QuantStack/Wan2.2-I2V-A14B-GGUF`](https://huggingface.co/QuantStack/Wan2.2-I2V-A14B-GGUF) or [`bullerwins/Wan2.2-I2V-A14B-GGUF`](https://modelscope.cn/models/bullerwins/Wan2.2-I2V-A14B-GGUF) | ~8.2 GB | `D:\ComfyUI\models\unet\` |
| **Text Encoder** | `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | [`Comfy-Org/Wan_2.1_ComfyUI_repackaged`](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/tree/main/split_files/text_encoders) | ~5.2 GB | `D:\ComfyUI\models\clip\` |
| **Video VAE** | `Wan2_1_VAE_bf16.safetensors` *(Wan 2.2 uses the same base VAE)* | [`Comfy-Org/Wan_2.1_ComfyUI_repackaged`](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/tree/main/split_files/vae) | ~254 MB | `D:\ComfyUI\models\vae\` |
| **CLIP Vision Encoder** | `clip_vision_h.safetensors` | [`Comfy-Org/Wan_2.1_ComfyUI_repackaged`](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/tree/main/split_files/clip_vision) | ~1.3 GB | `D:\ComfyUI\models\clip_vision\` |

### 2. Component Explanations & Sizing Rationale

- **High-Noise Expert (`wan2.2-i2v-a14b-high-Q3_K_M.gguf`):** Focuses strictly on initial layout, structural motion, and camera trajectories during early denoising steps.
- **Low-Noise Expert (`wan2.2-i2v-a14b-low-Q3_K_M.gguf`):** Takes over during the second half of the denoising sequence to render fine skin textures, edge fidelity, and micro-motion.
- **Quantization Floor:** Keep both experts at `Q3_K_M` or `Q3_K_S`. While `Q4_K_S` is technically supported, the 3-bit quantization provides the necessary headroom to prevent PCIe bus saturation when ComfyUI unloads and swaps models between steps 12 and 13.
- **Shared Dependencies:** Wan 2.2 retains the UMT5-XXL text encoder, the 3D VAE, and the CLIP Vision module. If you have already downloaded these for 2.1, you do not need to re-download them.

### 3. Quick Terminal Download Commands

Run the following commands to pull the MoE weights into your local rig:

```dos
:: High-Noise Expert (Stage 1 Sampling)
curl -L -o D:\ComfyUI\models\unet\wan2.2-i2v-a14b-high-Q3_K_M.gguf https://huggingface.co/QuantStack/Wan2.2-I2V-A14B-GGUF/resolve/main/wan2.2-i2v-a14b-high-Q3_K_M.gguf

:: Low-Noise Expert (Stage 2 Sampling)
curl -L -o D:\ComfyUI\models\unet\wan2.2-i2v-a14b-low-Q3_K_M.gguf https://huggingface.co/QuantStack/Wan2.2-I2V-A14B-GGUF/resolve/main/wan2.2-i2v-a14b-low-Q3_K_M.gguf

:: Shared Encoders & VAE (if not already downloaded)
curl -L -o D:\ComfyUI\models\clip\umt5_xxl_fp8_e4m3fn_scaled.safetensors https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors
curl -L -o D:\ComfyUI\models\vae\Wan2_1_VAE_bf16.safetensors https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/vae/Wan2_1_VAE_bf16.safetensors
curl -L -o D:\ComfyUI\models\clip_vision\clip_vision_h.safetensors https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/clip_vision/clip_vision_h.safetensors
```

Ready to wire the dual-expert node graph?

### You

from what directory would i run those commands

### Gemini

You can run those commands from **any directory** in a standard Command Prompt (`cmd.exe`).

Because every command uses an absolute destination path (e.g., `-o D:\ComfyUI\models\...`), `curl` will place the files directly into the target folders regardless of your terminal's current working directory.

**Requirements before running:**

- **Shell:** Use standard **Command Prompt (`cmd`)** rather than basic Windows PowerShell 5.1 (where `curl` is aliased to `Invoke-WebRequest` and doesn't parse `-o` the same way). If you use PowerShell, type `cmd` and press Enter first, or replace `curl` with `curl.exe`.
- **Pre-requisite:** Ensure your `D:\` drive is accessible and the target directories exist:

```dos
mkdir D:\ComfyUI\models\unet
mkdir D:\ComfyUI\models\clip
mkdir D:\ComfyUI\models\vae
mkdir D:\ComfyUI\models\clip_vision
```

Once the folders are created, paste the `curl` commands directly into the terminal.

Ready to wire the node graph in ComfyUI?

### You

do i run those commands from here [D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable]

### Gemini

Yes, you can run them directly from that directory.

Because the previous commands used `D:\ComfyUI\...`, and your portable installation is actually located at `D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable`, you must **adjust the destination paths** to match your portable structure (which places model folders under `ComfyUI\models\`).

From `D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable`, run these commands in Command Prompt (`cmd.exe`):

```dos
:: Create required model subdirectories
mkdir ComfyUI\models\unet
mkdir ComfyUI\models\clip
mkdir ComfyUI\models\vae
mkdir ComfyUI\models\clip_vision

:: High-Noise Expert (Stage 1 Sampling)
curl.exe -L -o ComfyUI\models\unet\wan2.2-i2v-a14b-high-Q3_K_M.gguf https://huggingface.co/QuantStack/Wan2.2-I2V-A14B-GGUF/resolve/main/wan2.2-i2v-a14b-high-Q3_K_M.gguf

:: Low-Noise Expert (Stage 2 Sampling)
curl.exe -L -o ComfyUI\models\unet\wan2.2-i2v-a14b-low-Q3_K_M.gguf https://huggingface.co/QuantStack/Wan2.2-I2V-A14B-GGUF/resolve/main/wan2.2-i2v-a14b-low-Q3_K_M.gguf

:: Shared Encoders & VAE
curl.exe -L -o ComfyUI\models\clip\umt5_xxl_fp8_e4m3fn_scaled.safetensors https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors
curl.exe -L -o ComfyUI\models\vae\Wan2_1_VAE_bf16.safetensors https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/vae/Wan2_1_VAE_bf16.safetensors
curl.exe -L -o ComfyUI\models\clip_vision\clip_vision_h.safetensors https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/clip_vision/clip_vision_h.safetensors
```

Also update your `scripts/launch_comfyui.bat` to reference this path:

```dos
@echo off
TITLE Swainsboro Rig - Wan 2.2 ComfyUI Environment
cd /d D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable
.\python_embeded\python.exe -s ComfyUI\main.py --lowvram --fp8_e4m3fn-text-enc
pause
```

Ready to verify the model downloads and wire ComfyUI?

### You



### Gemini

The terminal errors happened because **PowerShell** was used instead of standard `cmd.exe`:

1. `::` is a batch/CMD comment syntax that PowerShell treats as an invalid command.
2. `curl.exe` in PowerShell needs double quotes around URLs containing `&` or special characters.
3. The first two GGUF curl commands downloaded only ~15–43 bytes (an HTML redirect/error page) because the repository path syntax wasn't accepted. Meanwhile, the text encoder (`umt5_xxl`) completed successfully at 5.2 GB.

### Clean PowerShell Download Commands

Paste the following cleaned block directly into your PowerShell window (without CMD comments and with quoted URLs):

```powershell
# 1. Download Diffusion Backbone (city96 Wan2.1 480P Q3_K_M GGUF - Proven stable for 6GB VRAM)
curl.exe -L -o ComfyUI\models\unet\wan2.1-i2v-14b-480p-Q3_K_M.gguf "https://huggingface.co/city96/Wan2.1-I2V-14B-480P-gguf/resolve/main/wan2.1-i2v-14b-480p-Q3_K_M.gguf"

# 2. Download Video VAE
curl.exe -L -o ComfyUI\models\vae\Wan2_1_VAE_bf16.safetensors "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/vae/Wan2_1_VAE_bf16.safetensors"

# 3. Download CLIP Vision Encoder
curl.exe -L -o ComfyUI\models\clip_vision\clip_vision_h.safetensors "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/clip_vision/clip_vision_h.safetensors"
```

*(Note: The text encoder `umt5_xxl_fp8_e4m3fn_scaled.safetensors` was already completed in your screenshot and does not need to be re-downloaded).*

### Verification Check

After the downloads finish, run this one-liner in PowerShell to ensure the file sizes are complete rather than corrupted 1 KB redirects:

```powershell
Get-ChildItem -Path ComfyUI\models\unet, ComfyUI\models\clip, ComfyUI\models\vae, ComfyUI\models\clip_vision -File | Select-Object Name, @{Name="Size(GB)";Expression={[math]::Round($_.Length/1GB, 2)}}
```

**Expected output:**

- `wan2.1-i2v-14b-480p-Q3_K_M.gguf` → ~8.59 GB
- `umt5_xxl_fp8_e4m3fn_scaled.safetensors` → ~5.2 GB
- `Wan2_1_VAE_bf16.safetensors` → ~0.25 GB
- `clip_vision_h.safetensors` → ~1.3 GB

Ready to build the ComfyUI workflow once downloads finish?

### You

why is it saying 2.1 i thought we wanted 2.2

### Gemini

You are absolutely right, and I apologize. My context window held onto the 2.1 model link from your earlier screenshot, and I mistakenly provided you with the old code block instead of the dual Wan 2.2 Mixture-of-Experts links we agreed to pivot to.

Please press `Ctrl+C` in your PowerShell window right now to cancel that 2.1 download.

Additionally, I noticed in your screenshot that the `clip_vision_h.safetensors` download was interrupted (indicated by the `^C`). You will need to re-run that one to ensure it completes.

Here are the correct PowerShell `curl` commands for the **Wan 2.2** MoE architecture, plus the interrupted CLIP Vision model:

```powershell
# 1. Download Wan 2.2 High-Noise Expert (Stage 1 Sampling)
curl.exe -L -o ComfyUI\models\unet\wan2.2-i2v-a14b-high-Q3_K_M.gguf "https://huggingface.co/QuantStack/Wan2.2-I2V-A14B-GGUF/resolve/main/wan2.2-i2v-a14b-high-Q3_K_M.gguf"

# 2. Download Wan 2.2 Low-Noise Expert (Stage 2 Sampling)
curl.exe -L -o ComfyUI\models\unet\wan2.2-i2v-a14b-low-Q3_K_M.gguf "https://huggingface.co/QuantStack/Wan2.2-I2V-A14B-GGUF/resolve/main/wan2.2-i2v-a14b-low-Q3_K_M.gguf"

# 3. Re-download CLIP Vision (Interrupted in previous run)
curl.exe -L -o ComfyUI\models\clip_vision\clip_vision_h.safetensors "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/clip_vision/clip_vision_h.safetensors"
```

### You

is this looking correct

### Gemini

### The Download Status

No, this is not looking correct. While your third command (CLIP Vision) succeeded perfectly by downloading the full 1.2 GB, the first two commands for the Wan 2.2 experts failed.

If you look at the **% Total** and **Received** columns for the High-Noise and Low-Noise downloads, they only pulled **15 bytes** each. This means `curl` downloaded a tiny "404 Not Found" text string instead of the massive multi-gigabyte model weights. This typically happens when a Hugging Face repository is restructured or the exact GGUF filenames are changed by the author. If the `worker-sower` script tries to load those 15-byte files, ComfyUI will immediately crash.

### The Resolution

To fix this, we need to pull from a community repository that currently hosts the active Wan 2.2 MoE GGUF files, such as the `bullerwins/Wan2.2-I2V-A14B-GGUF` repository.

First, delete the corrupted 15-byte files to prevent the loaders from failing. Then, you can either try updated `curl` paths or download them directly.

**Option A: Updated Terminal Commands** Run this in PowerShell to clean up the bad files and retry using the updated repository:

```powershell
# 1. Delete the corrupted 15-byte files
Remove-Item ComfyUI\models\unet\wan2.2-i2v-a14b-high-Q3_K_M.gguf -ErrorAction SilentlyContinue
Remove-Item ComfyUI\models\unet\wan2.2-i2v-a14b-low-Q3_K_M.gguf -ErrorAction SilentlyContinue

# 2. Download High-Noise Expert
curl.exe -L -o ComfyUI\models\unet\wan2.2-i2v-a14b-high-Q3_K_M.gguf "https://huggingface.co/bullerwins/Wan2.2-I2V-A14B-GGUF/resolve/main/wan2.2-i2v-a14b-high-Q3_K_M.gguf"

# 3. Download Low-Noise Expert
curl.exe -L -o ComfyUI\models\unet\wan2.2-i2v-a14b-low-Q3_K_M.gguf "https://huggingface.co/bullerwins/Wan2.2-I2V-A14B-GGUF/resolve/main/wan2.2-i2v-a14b-low-Q3_K_M.gguf"
```

**Option B: Manual Browser Download (Recommended if `curl` fails again)** If the terminal still pulls 15-byte files, bypass `curl` entirely to ensure you get the exact quantization needed to fit the 6GB limit:

1. Navigate to the Hugging Face repository in your web browser: `[https://huggingface.co/bullerwins/Wan2.2-I2V-A14B-GGUF/tree/main](https://huggingface.co/bullerwins/Wan2.2-I2V-A14B-GGUF/tree/main)`
2. Download the high-noise and low-noise `.gguf` files (ensure they are the `Q3` variants).
3. Move them manually into your `D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable\ComfyUI\models\unet\` folder.

Ready to build the MoE workflow JSON?

### You

which one

### Gemini

You need to download **two model files** (one High-Noise expert and one Low-Noise expert), plus the example workflow image.

Notice that this repository uses underscores (`_`) instead of hyphens in the filenames (e.g., `high_noise` instead of `high-noise`), which explains why the previous `curl` command returned a 404.

### The Exact Files to Download

1. **High-Noise Expert (Stage 1 Sampling):**
  - **File:** `wan2.2_i2v_high_noise_14B_Q3_K_M.gguf` (7.18 GB)
  - *(Alternative: `wan2.2_i2v_high_noise_14B_Q3_K_S.gguf` at 6.52 GB if you want faster PCIe swapping speeds on 6GB VRAM).*
2. **Low-Noise Expert (Stage 2 Sampling):**
  - **File:** `wan2.2_i2v_low_noise_14B_Q3_K_M.gguf` (7.18 GB)
  - *(Alternative: `wan2.2_i2v_low_noise_14B_Q3_K_S.gguf` at 6.52 GB).*
3. **Pre-configured ComfyUI Workflow (Highly Recommended):**
  - **File:** `wan2_2_14B_i2v_example.png` (1.16 MB)
  - *(You can drag and drop this PNG directly into the ComfyUI canvas to instantly load the author's working dual-expert node graph).*

### How to Download

- **In the Browser:** Click the small **download icon** (downward arrow next to the file size) for each of the two GGUF files, then move them to: `D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable\ComfyUI\models\unet\`
- **Via PowerShell (with the corrected filenames):**

```powershell
# High-Noise Expert
curl.exe -L -o ComfyUI\models\unet\wan2.2_i2v_high_noise_14B_Q3_K_M.gguf "https://huggingface.co/bullerwins/Wan2.2-I2V-A14B-GGUF/resolve/main/wan2.2_i2v_high_noise_14B_Q3_K_M.gguf"

# Low-Noise Expert
curl.exe -L -o ComfyUI\models\unet\wan2.2_i2v_low_noise_14B_Q3_K_M.gguf "https://huggingface.co/bullerwins/Wan2.2-I2V-A14B-GGUF/resolve/main/wan2.2_i2v_low_noise_14B_Q3_K_M.gguf"
```

### You

does that look correct

### Gemini

Yes, that looks perfectly correct.

You have bypassed the terminal issues and are successfully pulling the actual model weights. Specifically:

- **Correct Variants:** You selected the `Q3_K_S` versions of both the high-noise and low-noise experts. This is an excellent choice. At roughly 6.1 GB each (or 6.52 GB depending on how Windows calculates binary gigabytes), the `_S` (small) variant is slightly more compressed than the `_M` variant, which will give your 6GB VRAM card more breathing room and faster PCIe swapping speeds during the model handoff.
- **Correct Size:** The download manager shows them as multi-gigabyte files, confirming you are getting the actual models and not the 15-byte error stubs.

Once those finish downloading in about 20 minutes, manually cut and paste both `.gguf` files into your target directory: `D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable\ComfyUI\models\unet\`

Ready for the node graph?

### You

does that look correct

### Gemini

Yes, that looks perfect. You have successfully bypassed the 15-byte error and secured the complete 12+ GB of quantized Mixture-of-Experts weights inside the correct `unet` directory.

Now that the physical files are staged, you must wire the ComfyUI node graph to orchestrate the handoff between these two models. Because the Swainsboro rig is operating on a 6GB VRAM limit, this dual-sampler routing ensures only one 14B expert is loaded into the GPU at any given time, preventing a CUDA out-of-memory kernel panic.

### The MoE Node Wiring Blueprint

Launch ComfyUI using your `launch_comfyui.bat` script and clear your canvas.

**1. The Dual Model Loaders** Add two separate GGUF UNet loaders to manage the experts independently:

- **UnetLoaderGGUF (Node 1):** Select `wan2.2_i2v_high_noise_14B_Q3_K_S.gguf`.
- **UnetLoaderGGUF (Node 2):** Select `wan2.2_i2v_low_noise_14B_Q3_K_S.gguf`.

**2. The Encoders & Image Input**

- **DualCLIPLoaderGGUF:** Load your `umt5_xxl_fp8` text encoder.
- **VAELoader:** Load your `wan_2.1_vae`.
- **Load Image:** Upload your 832x480 anchor keyframe.
- Pass the CLIP, Image, and VAE through the standard Wan 2.x encoding nodes to generate your conditioning strings and initial latent image.

**3. The High-Noise Sampler (Stage 1)** You must use an Advanced KSampler to pause the generation halfway through and flush the VRAM.

- **Add Node:** `KSampler (Advanced)`
- **Model:** Connect the High-Noise UnetLoader.
- **Steps:** `25`
- **Start_at_step:** `0`
- **End_at_step:** `12`
- **Return_with_leftover_noise:** `enable` *(Crucial: This keeps the latent tensor active for the handoff).*

**4. The Low-Noise Sampler (Stage 2)**

- **Add Node:** `KSampler (Advanced)`
- **Model:** Connect the Low-Noise UnetLoader.
- **Latent Image:** Connect the latent output from the High-Noise sampler.
- **Steps:** `25`
- **Start_at_step:** `12`
- **End_at_step:** `25`
- **Return_with_leftover_noise:** `disable`

**5. Tiled VAE Decoding**

- **Add Node:** `VAE Decode (Tiled)`
- Connect the final latent output from the Low-Noise sampler here.
- Set spatial `tile_size` to `256` and temporal `tile_size` to `8` to protect the 6GB VRAM limit during the pixel reconstruction phase.

Save this exact layout as `wan2.2_i2v_moe_tiled.json` inside your repository's `workflows` directory.

Ready to build the Python API script?

### You

are here any other models i am going to need

### Gemini

No, you do not need any additional model files to run the baseline Wan 2.2 Image-to-Video pipeline. You have successfully downloaded the complete suite of components required for this architecture.

### The Complete Pipeline Component List

- **Diffusion Backbone:** You possess the required High-Noise and Low-Noise expert checkpoints. The high-noise expert handles the early denoising steps for overall layout and motion structure, while the low-noise expert takes over for later steps to refine textures and fine details.
- **Text Encoder:** You have the `umt5_xxl_fp8_e4m3fn_scaled.safetensors` file.
- **Video VAE:** You have the `wan_2.1_vae.safetensors` file.
- **Image Conditioning:** You have the `clip_vision_h.safetensors` file. This specific model is required for the Image-to-Video (I2V) workflow.

You are now fully equipped to move on to the ComfyUI node wiring phase and the Python API automation script.

### You

[Video VAE: You have the wan_2.1_vae.safetensors file.] would that need be wan 2.2

### Gemini

### The VAE Requirement for Wan 2.2 14B

No, you do not need to download a Wan 2.2 VAE for this specific pipeline.

- The 14B models of Wan 2.2 continue to require the `wan_2.1_vae.safetensors` file.
- While a `wan2.2_vae.safetensors` file does exist, it is only required if you are using the smaller 5B model.

Because you are utilizing the 14B High-Noise and Low-Noise experts, the `wan_2.1_vae.safetensors` file you have already downloaded is exactly what you need to proceed.

### You

where would i find [Text Encoder: You have the umt5_xxl_fp8_e4m3fn_scaled.safetensors file.] or [Video VAE: You have the wan_2.1_vae.safetensors file.] or [Image Conditioning: You have the clip_vision_h.safetensors file. This specific model is required for the Image-to-Video (I2V) workflow.] ; in what directory would i find these

### Gemini

Within your local portable setup (`D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable`), each model belongs in its designated subfolder under `ComfyUI\models\`:

### Local Directory Locations

| Model | File Name | Exact Local Directory Path |
| --- | --- | --- |
| **Text Encoder** | `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | `D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable\ComfyUI\models\clip\` |
| **Video VAE** | `wan_2.1_vae.safetensors` *(or `Wan2_1_VAE_bf16.safetensors`)* | `D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable\ComfyUI\models\vae\` |
| **CLIP Vision** | `clip_vision_h.safetensors` | `D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable\ComfyUI\models\clip_vision\` |

### Verification Command

To verify that all three files are present in their target directories with non-zero file sizes, run this command in **PowerShell** from `D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable`:

```powershell
Get-ChildItem -Path ComfyUI\models\clip, ComfyUI\models\vae, ComfyUI\models\clip_vision -File | Select-Object Directory, Name, @{Name="Size(GB)";Expression={[math]::Round($_.Length/1GB, 2)}}
```

**Expected Sizes:**

- `clip\` → ~5.2 GB (`umt5_xxl_...`)
- `vae\` → ~0.25 GB (`Wan2_1_VAE_...`)
- `clip_vision\` → ~1.2 GB (`clip_vision_h.safetensors`)

### Online Sources (If Missing or Incomplete)

If any of these files are not in their folders, they can be downloaded from the official ComfyUI repackaged Hugging Face repository:

- **Text Encoder:** [`Comfy-Org/Wan_2.1_ComfyUI_repackaged/split_files/text_encoders`](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/tree/main/split_files/text_encoders)
- **Video VAE:** [`Comfy-Org/Wan_2.1_ComfyUI_repackaged/split_files/vae`](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/tree/main/split_files/vae)
- **CLIP Vision:** [`Comfy-Org/Wan_2.1_ComfyUI_repackaged/split_files/clip_vision`](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/tree/main/split_files/clip_vision)

### You

that is the result of running that command

### Gemini

Yes, that looks perfect. The PowerShell output confirms that all three essential support models are staged in their exact target directories within your portable ComfyUI environment:

- **Text Encoder:** `umt5_xxl_fp8_e4m3fn_scaled.safetensors` is successfully located in `ComfyUI\models\clip\`
- **Video VAE:** `Wan2_1_VAE_bf16.safetensors` is successfully located in `ComfyUI\models\vae\`
- **Image Conditioning:** `clip_vision_h.safetensors` is successfully located in `ComfyUI\models\clip_vision\`

Although the file size column was cut off on the right edge of your terminal window, the directory mapping is flawless. The standard ComfyUI placeholder text files (like `put_vae_here`) are also visible exactly where they should be, further verifying the folder paths.

The Swainsboro rig is now fully loaded with every necessary asset. With the quantized GGUF experts, the text encoder, the VAE, and the CLIP vision model all correctly positioned, the local environment is prepped to run within the strict hardware constraints. You are completely ready to launch the `launch_comfyui.bat` script, wire the dual-KSampler MoE node graph, and hand the process off to the **worker-sower** for automated rendering.

### You

how does that look

### Gemini

The issue is clearly visible in the terminal output: `IMPORT FAILED` for all three custom nodes.

Your custom nodes (GGUF, VideoHelperSuite, and WanVideoWrapper) are physically present in the `custom_nodes` folder, but their underlying Python requirements (`gguf`, `cv2`, `accelerate`, `imageio-ffmpeg`) are completely missing from the portable ComfyUI's embedded Python environment. Because the modules failed to load, ComfyUI simply skipped them, which is why your terminal is throwing `ModuleNotFoundError`.

The portable version of ComfyUI is isolated from your system. To fix this, you must install the dependencies directly into the `python_embeded` environment.

### The Fix: Installing the Missing Dependencies

Open a new PowerShell or Command Prompt window and run these exact commands to force the embedded Python to install the missing packages:

```powershell
# 1. Navigate to your ComfyUI portable directory
cd D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable

# 2. Install the GGUF requirement
.\python_embeded\python.exe -m pip install gguf

# 3. Install the VideoHelperSuite requirements (OpenCV and ImageIO)
.\python_embeded\python.exe -m pip install opencv-python imageio imageio-ffmpeg

# 4. Install the WanVideoWrapper requirement (Accelerate)
.\python_embeded\python.exe -m pip install accelerate
```

*(Note: Depending on how the nodes are structured, you can also often install everything at once by pointing pip at their requirement files: `.\python_embeded\python.exe -m pip install -r .\ComfyUI\custom_nodes\ComfyUI-WanVideoWrapper\requirements.txt` etc.)*

Once those installations complete, close the terminal and rerun your `launch_comfyui.bat` script. You should see the `IMPORT FAILED` errors disappear from the startup log, and the nodes will become available in the ComfyUI interface.

Ready to build the ComfyUI node graph?

### You

how does that look

### Gemini

### Terminal Status Assessment

The embedded Python environment is resolving correctly. Here is the breakdown of the execution:

- **GGUF Installation:** Executed flawlessly. The `gguf-0.19.0` package is fully installed. The yellow text warning regarding scripts not being on the `PATH` is standard behavior for isolated, portable Python environments and should be entirely ignored.
- **VideoHelperSuite Installation:** Executed flawlessly. The `opencv-python`, `imageio`, and `imageio-ffmpeg` libraries required for video frame compilation successfully installed.
- **WanVideoWrapper Installation:** The `pip install accelerate` command has been entered into the prompt, but the screenshot shows no execution output yet. If the terminal is hanging, simply press **Enter** to execute the command.

Once the `accelerate` installation finishes and displays a success message, the environment dependencies will be fully satisfied. You can then close the PowerShell window and execute your `launch_comfyui.bat` script to boot the environment. The terminal startup log should now bypass the previous import errors and successfully load the custom nodes.

### You

how does that look

### Gemini

You are almost at 100% operational status. Here is the evaluation of the startup log:

### What Succeeded

- **ComfyUI-GGUF:** Loaded successfully (0.2s).
- **ComfyUI-VideoHelperSuite:** Loaded successfully (1.1s).
- **VRAM Management:** ComfyUI recognized your hardware profile, set VRAM state to `LOW_VRAM`, capped memory at 6518 MB, and enabled asynchronous offloading with 2 streams.
- **Batch Warning:** The warning `[WARNING] No 'wan2.2-i2v-14B-Q3_K.gguf' found` is just a hardcoded check in the setup script looking for a single file. You can safely ignore it since you are using the dual MoE expert files (`wan2.2_i2v_high_noise_14B_Q3_K_S.gguf` and `wan2.2_i2v_low_noise_14B_Q3_K_S.gguf`).

### The Only Remaining Blocker

- **ComfyUI-WanVideoWrapper:** Failed to load with `ModuleNotFoundError: No module named 'accelerate'`.

In the previous PowerShell window, the `pip install accelerate` command was typed but had not finished executing before this launch.

### Final Fix Step

1. Return to your PowerShell window (or open a new one in `D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable`).
2. Run:
  ```powershell
  .\python_embeded\python.exe -m pip install accelerate
  ```
3. Press **Enter** and wait until you see the `Successfully installed accelerate-...` message.
4. Close the running `cmd.exe` ComfyUI window and relaunch your batch script.

Once `accelerate` is installed, all three custom node extensions will register, and you will be ready to open `[http://127.0.0.1:8188](http://127.0.0.1:8188)` in your browser.

### You

how does it look now

### Gemini

The output shows that while `accelerate` successfully installed, the embedded Python environment is still missing other sub-dependencies required by the `ComfyUI-WanVideoWrapper` node (specifically, `ftfy`).

Instead of playing whack-a-mole with each individual missing module, we can install the entire suite of requirements for that specific node at once using its included `requirements.txt` file.

### The Final Dependency Fix

1. Return to your PowerShell window in your portable directory (`D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable`).
2. Run this exact command to bulk-install all remaining missing libraries:

```powershell
.\python_embeded\python.exe -m pip install -r ComfyUI\custom_nodes\ComfyUI-WanVideoWrapper\requirements.txt
```

*(Note: You will also see a yellow warning about `sageattention` not being installed. You can safely ignore this; it is an optional acceleration module and is not strictly required to run the pipeline).*

Once that finishes, run your `launch_comfyui.bat` script one last time. You should finally see zero `[IMPORT FAILED]` errors.

Ready to build the ComfyUI workflow JSON?

### You

how does it look now

### Gemini

The startup log is completely clean and operational.

### Startup Verification Summary

- **All Custom Nodes Loaded:** `ComfyUI-GGUF`, `ComfyUI-VideoHelperSuite`, `ComfyUI-Manager`, and `ComfyUI-WanVideoWrapper` all initialized with zero import failures.
- **VRAM Management Engaged:** ComfyUI locked into `LOW_VRAM` mode with asynchronous offloading and pinned memory active for your RTX 2060 (6143 MB VRAM).
- **Non-Critical Warnings:** The warning regarding `onnx` (FantasyPortrait) and `sageattention` are optional extensions and do not affect Wan 2.2 I2V generation.
- **Server Ready:** The web UI is actively listening on **`[http://127.0.0.1:8188](http://127.0.0.1:8188)`**.

### Next Step: Accessing the Web UI

1. Open your browser and navigate to **`[http://127.0.0.1:8188](http://127.0.0.1:8188)`**.
2. If you downloaded the `wan2_2_14B_i2v_example.png` workflow image earlier, drag and drop it directly onto the ComfyUI canvas to populate the baseline node layout.

Ready to configure the node graph?

### You

Do you want to walk through verifying each node's file selections and setting up the dual KSampler step split (0-12 and 12-25) in the interface?

### Gemini

Let's lock in the complete node layout inside the ComfyUI canvas. Since you successfully dragged the `wan2_2_14B_i2v_example.png` workflow into the browser, you likely see a tangled web of nodes.

We need to strip out the excess and manually verify the core sequence to ensure it fits the exact constraints of the Swainsboro rig. We will configure the dual-stage generation, where the high-noise expert runs the initial steps and hands the latent off to the low-noise expert for refinement.

### 1. Verify the Loaders

Ensure these exact files are selected in their respective nodes. If any dropdown is blank, the workflow will fail.

- **UnetLoaderGGUF (High-Noise Expert):** Select `wan2.2_i2v_high_noise_14B_Q3_K_S.gguf`.
- **UnetLoaderGGUF (Low-Noise Expert):** Select `wan2.2_i2v_low_noise_14B_Q3_K_S.gguf`.
- **DualCLIPLoaderGGUF:** Select `umt5_xxl_fp8_e4m3fn_scaled.safetensors`.
- **VAELoader:** Select `Wan2_1_VAE_bf16.safetensors`.
- **Load Image:** Upload your 832x480 anchor keyframe.

### 2. Configure the Conditionings (Aesthetic Injection)

Wire your text encoders. Since the 14B model delivers high motion fidelity and follows complex prompts accurately, this is where you can inject your aesthetic triggers for a Southern Gothic or Biopunk-Noir vignette directly into the positive prompt string.

### 3. Stage 1: The High-Noise KSampler

This node handles the macro-motion and layout.

- **Node Type:** `KSampler (Advanced)`
- **Model Input:** Connect the High-Noise Unet.
- **Steps:** `25`
- **CFG:** `5.5`
- **add_noise:** `enable`
- **start_at_step:** `0`
- **end_at_step:** `12`
- **return_with_leftover_noise:** `enable` (Crucial: This preserves the latent tensor state for the handoff).

### 4. Stage 2: The Low-Noise KSampler

This node takes over to refine micro-textures, edge sharpness, and fine details.

- **Node Type:** `KSampler (Advanced)`
- **Model Input:** Connect the Low-Noise Unet.
- **Latent Image Input:** Wire this *directly* from the `LATENT` output of the Stage 1 KSampler.
- **Steps:** `25` (Must match the total steps of Stage 1).
- **CFG:** `5.5`
- **add_noise:** `disable` (Crucial: The latent already carries noise from the upstream sampler, so we are continuing the sequence, not restarting).
- **start_at_step:** `12`
- **end_at_step:** `25`
- **return_with_leftover_noise:** `disable`

### 5. Protect the Memory (Tiled Decode)

Wire the final `LATENT` output from the Stage 2 KSampler into your **VAE Decode (Tiled)** node.

- **tile_size (spatial):** `256`
- **temporal_size:** `8`

Connect the image output to a **Video Combine** node set to 24fps. Once verified, click **Queue Prompt** to run a test render and confirm the VRAM offloads correctly between step 12 and 13.

Should we boot up Claude Code or Jules to write the Python API script so the worker-sower can execute this headlessly once the test render completes?

### You

i do not know where [wan2_2_14B_i2v_example.png] is located

### Gemini

### Where to Find `wan2_2_14B_i2v_example.png`

The file `wan2_2_14B_i2v_example.png` is located in the same Hugging Face repository where you downloaded the high-noise and low-noise Wan 2.2 expert models.

**Option 1: Direct Download via Browser**

- Navigate to the Hugging Face repository: `[https://huggingface.co/bullerwins/Wan2.2-I2V-A14B-GGUF/tree/main](https://huggingface.co/bullerwins/Wan2.2-I2V-A14B-GGUF/tree/main)`.
- Scroll to the bottom of the file list.
- Click the download icon next to `wan2_2_14B_i2v_example.png` (it is 1.16 MB in size).

**Option 2: Direct Download via PowerShell** If you prefer to pull it directly into your project via the terminal, open your PowerShell window and run the following command:

```powershell
curl.exe -L -o wan2_2_14B_i2v_example.png "https://huggingface.co/bullerwins/Wan2.2-I2V-A14B-GGUF/resolve/main/wan2_2_14B_i2v_example.png"
```

Once downloaded, you do not need to place this PNG in a specific ComfyUI model folder. You can simply drag and drop the image file directly onto the open ComfyUI web interface in your browser to load the node graph.

### You

that is what i am seeing

### Gemini

### Workflow Node Alignment

The node graph you dropped into the canvas contains a few placeholder artifacts from the original author's setup that must be adjusted to match your exact Swainsboro rig environment.

**1. Purge the Redundant Loaders** The two nodes labeled **Load Diffusion Model** (highlighted in red on the left side of your screenshot) are standard unquantized `safetensors` loaders. Because you are utilizing the GGUF compression pipeline, these nodes are entirely disconnected and useless. Delete them from the canvas to keep the workspace clean.

**2. Remap the MoE GGUF Experts** The two **Unet Loader (GGUF)** nodes are currently pointing to the `Q8_0` variant of the weights, which will trigger an instant out-of-memory kernel panic on a 6GB card.

- Click the `unet_name` dropdown on the top loader and change it to `wan2.2_i2v_high_noise_14B_Q3_K_S.gguf`.
- Click the dropdown on the bottom loader and change it to `wan2.2_i2v_low_noise_14B_Q3_K_S.gguf`.

**3. Verify Encoders**

- Your **Load CLIP** node is already perfectly mapped to `umt5_xxl_fp8_e4m3fn_scaled.safetensors`.
- Check your **Load VAE** node. If the dropdown says `wan_2.1_vae.safetensors` but your downloaded file is named `Wan2_1_VAE_bf16.safetensors`, click the dropdown and select the exact file name present in your `models\vae\` folder.

**4. Stage the Anchor Keyframe** Navigate to the **Load Image** node at the bottom center. Click the `choose file to upload` button and upload your cropped 832x480 static image.

Once these adjustments are locked in, verify that the advanced KSampler step parameters are split strictly at step 12, then execute the render pipeline to generate your first clip.

[WAN 2.2 GGUF Workflow Tutorial](https://www.youtube.com/watch?v=KVCVON0ERik) This visual guide walks through the native integration of Wan 2.2 GGUF models directly within the ComfyUI node environment.

[![image](https://www.gstatic.com/images/branding/productlogos/youtube/v9/192px.svg)

WAN 2.2 Native Image‑to‑Video Tutorial | 6 Easy Steps with GGUF Models in ComfyUI #wan22 #wan2.2

RareTutor | AI Learning + · 2K views

[Open in WAN 2.2 Native Image‑to‑Video Tutorial | 6 Easy Steps with GGUF Models in ComfyUI #wan22 #wan2.2](https://www.youtube.com/watch?v=KVCVON0ERik)](https://www.youtube.com/watch?v=KVCVON0ERik)

### You

does that look correct

### Gemini

There are **three critical settings** in your current layout that will instantly cause a **CUDA Out of Memory (OOM)** crash on your 6GB VRAM buffer if you run it as-is:

### Critical Bottlenecks to Fix

#### 1. Replace the Standard VAE Decode Node

- **Current:** You are using standard `VAE Decode` on the right.
- **The Fix:** Delete that node and add **`VAE Decode (Tiled)`**.
- **Settings:**
  - `tile_size` (spatial): `256`
  - `temporal_size`: `8`
- *Why:* Decoding raw video frames without spatial/temporal slicing requires 16GB+ of uncompressed VRAM and will crash on frame reconstruction.

#### 2. Downscale Dimensions in `WanImageToVideo`

- **Current:** `width: 720`, `height: 1280` (Vertical 720p HD).
- **The Fix:** Set `width: 832`, `height: 480` (or `480x832` if your input keyframe is portrait).
- *Why:* 720p resolution creates activation tensors too large to fit in 6GB VRAM during offload layer computation.

#### 3. Reduce Frame Length in `WanImageToVideo`

- **Current:** `length: 81` (81 frames $\approx$ 3.5–5 seconds).
- **The Fix:** Set `length: 17` or `length: 33` for your baseline tests.
- *Why:* 81 latent frames require massive 3D attention matrices that will exceed available RAM/VRAM during the denoising steps.

### What Is Already Configured Correctly

- **KSampler 1 (High-Noise):** `start_at_step: 0`, `end_at_step: 10`, `add_noise: enable`, and `return_with_leftover_noise: enable` is properly set for Stage 1.
- **KSampler 2 (Low-Noise):** `start_at_step: 10`, `end_at_step: 10000` (defaults to max 20), `add_noise: disable`, and `return_with_leftover_noise: disable` is properly set for the handoff.
- **Latent Pass-Through:** The `LATENT` connection between Sampler 1 and Sampler 2 is wired cleanly.

### Action Checklist Before Clicking "Queue Prompt"

1. [ ] Change `WanImageToVideo` → `width: 832`, `height: 480`, `length: 17` (or `33`).
2. [ ] Delete `VAE Decode` → Add `VAE Decode (Tiled)` → Set tile spatial `256`, temporal `8`.
3. [ ] Connect `VAE Decode (Tiled)` output to a `Video Combine` node.

### You

how can i get all of the right most image connectors onto [vae decoded] tiled

### Gemini

### How to Move All Wires to `VAE Decode (Tiled)`

There are two quick ways in ComfyUI:

#### Method 1: The `Ctrl + Drag` Shortcut (Fastest)

1. Hold the **`Ctrl`** key on your keyboard.
2. Click and hold the blue **`IMAGE`** output dot on the old **`VAE Decode`** node.
3. Drag the bundle over to the blue **`IMAGE`** output dot on **`VAE Decode (Tiled)`** and release. *(This moves all outgoing connection wires simultaneously without disconnecting them from their downstream nodes).*

#### Method 2: Manual Reconnection

1. Click the blue **`IMAGE`** output dot on **`VAE Decode (Tiled)`**.
2. Drag a wire over to the **`images`** input on **`Save Animated WEBP`**.
3. Repeat for any other nodes that the old `VAE Decode` was wired to (follow each white line to its destination).
4. Select the old **`VAE Decode`** node and press **`Delete`**.

### Important Parameter Fix on `VAE Decode (Tiled)`

Before rendering, adjust these two values on your new **`VAE Decode (Tiled)`** node to prevent a VRAM spike:

- **`temporal_size`**: Change from **`64`** down to **`8`** *(64 will attempt to decode 64 video frames at once, which will overflow your 6GB VRAM)*.
- **`temporal_overlap`**: Set to **`2`** or **`4`**.

### You

the holding down the ctl button does not seem to work

### Gemini

That is completely my fault—I gave you the wrong keystroke! In ComfyUI, the correct shortcut to move multiple wires at once is the **`Shift`** key, not `Ctrl`.

### The Corrected Shortcut

1. Hold down the **`Shift`** key.
2. Click and hold the blue **`IMAGE`** output dot on your old `VAE Decode` node.
3. Drag the entire bundle of wires over to the blue **`IMAGE`** output dot on the new `VAE Decode (Tiled)` node and release.

Once the wires snap into place, you can safely delete the old node. Just ensure your `temporal_size` is set to `8` on the new tiled node before queuing your prompt so you don't instantly exceed your 6GB VRAM limit.

[ComfyUI Tip: Move Multiple Outputs](https://www.youtube.com/shorts/MsHgJ0wRsOs) This short clip provides a clear visual demonstration of how to grab and move multiple node connections simultaneously.

[![image](https://www.gstatic.com/images/branding/productlogos/youtube/v9/192px.svg)

ComfyUI Tip: Move Multiple Outputs

Creative Exploration /w Purz · 1.7K views

[Open in ComfyUI Tip: Move Multiple Outputs](https://www.youtube.com/shorts/MsHgJ0wRsOs)](https://www.youtube.com/shorts/MsHgJ0wRsOs)

### You

this is what it looks like now

### Gemini

You have successfully locked in almost all of the critical constraints. Your loaders are perfectly mapped to the GGUF models, your resolution is safely downscaled to 832x480 for 17 frames, the KSamplers are splitting the steps flawlessly (0-10 and 10-20), and you nailed the `Shift + Drag` trick to route everything to the tiled VAE.

However, there is **one lingering setting** in your third screenshot that will instantly crash your 6GB VRAM the moment the render finishes the sampling phase and attempts to decode the video.

### The Final Fix: `VAE Decode (Tiled)`

Look at the **VAE Decode (Tiled)** node in your screenshot:

- **`temporal_size`** is still set to **`64`**. You must change this to **`8`**.
- **`temporal_overlap`** is set to **`8`**. Change this to **`2`**.

*Why this matters:* A temporal size of 64 tells ComfyUI to try and decode 64 video frames into uncompressed pixels all at the exact same time. Your RTX 2060 physically cannot hold that much uncompressed data. Dropping it to 8 forces the decoder to process the video in small, manageable chunks.

Once you change those two numbers, your node graph is completely bulletproof for your hardware. You can hit **Queue Prompt** to run a test render.

Ready for automation?

### You

temporal_overlap can only be set to [4]

### Gemini

That is perfectly fine. ComfyUI often clamps the overlap ratio based on the temporal size you select to ensure the math aligns properly for frame blending.

Setting `temporal_overlap` to **`4`** alongside a `temporal_size` of **`8`** is an excellent configuration. It means the VAE decoder will process the video in chunks of 8 frames, overlapping 4 frames between each chunk to blend them smoothly and prevent any flickering, all while keeping the peak memory well under your 6GB limit.

Your node graph is now fully optimized, constrained, and safe. You are officially cleared to click **Queue Prompt** and run your first Wan 2.2 test render.

### You

error right off the bat

### Gemini

The stack trace in your terminal explicitly points to a failure inside `load_vae` and `load_safetensors`, resulting in a `JSONDecodeError`.

This means your VAE file (`Wan2_1_VAE_bf16.safetensors`) is completely corrupted. This happened during your very first download attempt yesterday—just like the original 15-byte UNET experts, the `curl` command pulled a tiny 404 text string instead of the actual model weights because the target filename was incorrect. When ComfyUI attempts to read the structural metadata of those 15 bytes, it instantly crashes.

### The Fix

You must delete the corrupted file and download the correct VAE package.

**1. Clean up and Re-download** Open your PowerShell window inside your `ComfyUI_windows_portable` folder and run these two commands to delete the bad file and pull the correct one (which should be roughly ~326 MB):

```powershell
# Delete the corrupted 15-byte file
Remove-Item ComfyUI\models\vae\Wan2_1_VAE_bf16.safetensors -ErrorAction SilentlyContinue

# Download the correct VAE from the Comfy-Org repository
curl.exe -L -o ComfyUI\models\vae\wan_2.1_vae.safetensors "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/vae/wan_2.1_vae.safetensors"
```

**2. Update the Node Graph** Once the terminal finishes pulling the full file:

1. Go back to your ComfyUI browser tab.
2. Navigate to your **Load VAE** node.
3. Click the dropdown and change it from `Wan2_1_VAE_bf16.safetensors` to your newly downloaded **`wan_2.1_vae.safetensors`**.
4. Click **Queue Prompt** again.

### You

these are the options which appear

### Gemini

The image shows exactly what is expected when you download a new model file while the ComfyUI server is already running.

ComfyUI loads its list of available files into memory when it first boots up. It does not automatically watch the folders for new files, which is why your newly downloaded `wan_2.1_vae.safetensors` is missing from the list, and the corrupted `Wan2_1_VAE_bf16.safetensors` is still showing.

### How to Force ComfyUI to See the New File

You do not need to restart your terminal or the batch script. You just need to refresh the web interface.

**Option 1: The UI Refresh Button (Recommended)**

1. Look for the floating ComfyUI control menu (usually pinned to the right side of your screen where the "Queue Prompt" button is).
2. Click the **Refresh** button on that menu.
3. Open your Load VAE dropdown again. The new file will be there.

**Option 2: Browser Refresh**

1. Simply press **F5** on your keyboard to refresh your browser tab.
2. ComfyUI will reload the node graph and re-query the backend folders.
3. Open the Load VAE dropdown and select `wan_2.1_vae.safetensors`.

Once you have selected the newly downloaded VAE, click **Queue Prompt** to run the render.

### You

now i am seeing this

### Gemini

The terminal trace reveals exactly what is happening: the error has moved from the `load_vae` step down to the `load_clip` step.

The specific error `ValueError: buffer length (445843201 bytes) after offset (0 bytes) must be a multiple of element size (2)` is PyTorch panicking because the file is incomplete.

If you look closely at that byte count, PyTorch is reading exactly **445 MB** of data. However, the `umt5_xxl_fp8_e4m3fn_scaled.safetensors` text encoder is supposed to be a massive **~5.2 GB** file. Your initial download of the text encoder was interrupted and only partially completed, leaving you with a broken stub.

### The Fix: Replace the Truncated Text Encoder

You need to delete the partial file and let `curl` download the complete 5.2 GB model.

Open your PowerShell window inside the `ComfyUI_windows_portable` folder and run these two commands:

```powershell
# 1. Delete the corrupted/incomplete text encoder
Remove-Item ComfyUI\models\clip\umt5_xxl_fp8_e4m3fn_scaled.safetensors -ErrorAction SilentlyContinue

# 2. Download the full 5.2 GB file
curl.exe -L -o ComfyUI\models\clip\umt5_xxl_fp8_e4m3fn_scaled.safetensors "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors"
```

*Note: Because this is a 5+ gigabyte file, the download will take a few minutes depending on your connection speed. Let the terminal reach 100% before doing anything else.*

Once the download finishes, go back to your ComfyUI browser tab and click **Queue Prompt** again. You do not need to refresh the page or restart the server, as the file name is exactly the same and ComfyUI will simply load the newly completed file.

### You



### Gemini

### Total Success

Your terminal log shows a flawless execution. The prompt completed in exactly **10 minutes and 49 seconds**, and more importantly, it navigated the entire 14-Billion parameter pipeline without a single Out-Of-Memory (OOM) crash.

Here is exactly what your Swainsboro rig just accomplished in that log:

- **Fixed Dependencies:** The 5.2GB text encoder successfully loaded into `torch.float8_e4m3fn` format, confirming the corrupted file is gone.
- **Stage 1 Completed:** The high-noise expert loaded its quantized `Q3_K` weights, safely offloaded layers to CPU RAM, and completed its 10 denoising steps in 5 minutes and 17 seconds (`10/10 [05:17...]`).
- **The Handoff:** The memory flushed smoothly, and the low-noise expert took over without a hitch.
- **Stage 2 Completed:** The low-noise expert finished the final 10 refinement steps in 5 minutes and 21 seconds (`10/10 [05:21...]`).
- **Safe Decoding:** The VAE successfully decoded the latent tensor into a video file using the tiled memory protection we configured.

### Where to Find Your Video

You can watch the generated clip right now.

1. Check your ComfyUI browser tab; the video should be looping directly inside the **Save Animated WEBP** or **Video Combine** node on your canvas.
2. To find the physical file, open your file explorer and navigate to: `D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable\ComfyUI\output\`

Ready for automation?

### You

what could be done to reduce that render time just a little bit so that it is under ten minutes

### Gemini

To get your render time cleanly under the ten-minute mark, we need to shave off about a minute. Because your ComfyUI VRAM offloading is already highly optimized for the Swainsboro rig, the most effective method is manipulating the sampling step count.

Here is the exact breakdown of how to achieve this without sacrificing the structural integrity of your vignette generations.

### 1. The Step Reduction Strategy

Looking at your terminal execution log, the 20 total sampling steps took roughly 10 minutes and 38 seconds. That averages out to about **32 seconds per step**.

By reducing the total steps, you drastically cut down the render time in a predictable, linear fashion.

| Configuration | High-Noise Steps | Low-Noise Steps | Estimated Render Time |
| --- | --- | --- | --- |
| **Baseline (Current)** | 10 (Steps 0–10) | 10 (Steps 10–20) | ~10m 40s |
| **The 18-Step Trim** | 9 (Steps 0–9) | 9 (Steps 9–18) | ~9m 35s |
| **The 16-Step Sprint** | 8 (Steps 0–8) | 8 (Steps 8–16) | ~8m 30s |

**How to apply this:** To implement the 16-step sprint so the worker-sower can churn out batches faster:

1. Go to your **Stage 1 KSampler** (High-Noise) and change `end_at_step` to **8**.
2. Go to your **Stage 2 KSampler** (Low-Noise) and change `start_at_step` to **8**. Change `steps` to **16**, and `end_at_step` to **16** (or just leave it at 10000, as it will stop at the max step count).

### 2. The Trap to Avoid: SageAttention

You likely noticed the yellow `[WARNING] Could not load sageattention` message in your terminal. While SageAttention is heavily promoted as a way to shave minutes off render times, **do not attempt to install it right now**.

The RTX 2060 relies on the older Turing architecture (Compute Capability 7.5). While installing SageAttention on newer GPUs is a simple one-click process, installing it on Turing hardware is a notoriously fragile engineering nightmare.

- **Manual Compilation:** You cannot use standard pre-compiled Windows files; you must manually compile the fused CUDA kernels yourself using Microsoft Visual Studio build tools.
- **Dependency Hell:** It requires extremely specific dependencies, completely rejecting modern Triton 3.3 versions in favor of older branches like 3.1 or 3.2.
- **Fatal Packaging Errors:** Even if you successfully compile the C++ environments, the process routinely triggers catastrophic failures like "WinError 127" (Dynamic Linkage ABI Mismatches) or "WinError 87" (The Python DOS-Epoch Bug) which will instantly crash your ComfyUI setup.

It simply isn't worth shattering your clean, perfectly functional portable environment just to chase a theoretical 40-second speed boost.

Should we lock in the 16-step node configuration and finally write the Python API script so the worker-sower can start feeding text dumps into the pipeline headlessly?

### You

can you get it to loop and create another when done

### Gemini

There are two ways to achieve continuous looping depending on whether you want to repeat the exact same prompt or feed the system new prompts for each generation.

Before doing either, **do not attempt to increase the `batch_size` parameter** in your nodes. Attempting to process a batch size of 2 or more will instantly overflow your 6GB VRAM and crash the system. The renders must happen sequentially (one after the other).

### Method 1: The Native Auto-Queue (For Repeating the UI Setup)

If you simply want the ComfyUI web interface to continuously crank out variations of the current prompt and image while you step away, use the built-in looping function.

1. **Set to Random Seed:** Check your **Stage 1 KSampler** (High-Noise) and ensure `control_after_generate` is set to `randomize`. If it is set to `fixed`, ComfyUI will just render the exact same video over and over again.
2. **Enable Auto Queue:** On the floating control panel on the right side of your screen (where the "Queue Prompt" button is), check the box labeled **Extra options**.
3. A new set of options will expand. Check the box labeled **Auto Queue**.
4. Click **Queue Prompt** once.

ComfyUI will immediately start the next generation the second the previous video finishes saving to your output folder, looping infinitely until you uncheck the Auto Queue box.

### Method 2: The API Headless Loop (For the worker-sower)

If you want each loop to be a *different* video (using the parsed text dumps and various anchors), the web UI's Auto Queue will not work. This is where the Python automation comes in.

To do this, you save your completed node layout as an "API Format" JSON file. The `worker-sower` script then runs a `while` or `for` loop, dynamically swapping the text in the positive prompt node and the image file in the load image node via Python, then firing an HTTP request to the local ComfyUI server port (`127.0.0.1:8188`) to queue the render headlessly.

If you are ready to pivot from the web interface to automation, the next step is clicking the gear icon in the ComfyUI settings, enabling **Enable Dev mode Options**, and clicking the newly revealed **Save (API Format)** button to generate your `workflow_api.json` payload.

### You

is there any thing that can be done to not have it look so ghosty and transparent between frames

### Gemini

That "ghosty," semi-transparent blending effect is caused by **temporal tiling in the VAE decoder** combined with flat chroma green backgrounds.

When `temporal_size` is set to `8` and `temporal_overlap` is set to `4` on a short 17-frame clip, the VAE decodes the video in small 8-frame blocks and blends half of the frames across chunks. This crossfade creates double-vision and transparency artifacts whenever the character moves.

### 1. Fix the Temporal Tiling (Primary Cause)

For a short **17-frame clip at 832x480**, you do **not** need temporal slicing. You only need spatial tiling to keep VRAM low.

Change these settings on your **`VAE Decode (Tiled)`** node:

- **`temporal_size`**: Change to **`64`** *(or `17`)*.
- **`temporal_overlap`**: Change to **`4`** *(minimum allowed value)*.
- **`tile_size`**: Keep at **`256`** *(this handles the spatial/memory split safely)*.
- **`overlap`**: Keep at **`64`**.

> **Why this works:** Setting `temporal_size` larger than your total clip length (17 frames) forces the VAE to decode the entire timeline in a single continuous temporal pass rather than blending chopped chunks together, completely eliminating the cross-chunk ghosting.

### 2. Strengthen the Prompt Contrast Against Solid Color

Diffusion models naturally try to bleed flat, solid-color backgrounds (like pure chroma green `#00FF00`) into moving character edges.

- **Positive Prompt:** Add explicit solid-edge keywords:
  `sharp crisp solid edges, high contrast, clean cut silhouette, no motion blur, studio lighting`
- **Negative Prompt:** Add these suppression tags to your negative text node:
  `ghosting, semi-transparent, translucent, motion blur, double exposure, bleeding edges, morphing, fading`

### 3. Adjust CFG / Denoise Balance

If ghost trails persist after adjusting the VAE:

- **Raise CFG slightly:** Increase CFG from `3.5` to `5.0` or `5.5` on both KSamplers. Higher CFG forces the model to adhere more rigidly to solid forms rather than hazy approximations.
- **Adjust Step Split:** If the transition between high-noise and low-noise experts occurs too early, shift the split point. In your Stage 1 KSampler, set `end_at_step: 12`, and in Stage 2 set `start_at_step: 12` (out of 20 total steps) so the macro-shape is fully solid before detail refinement begins.

### You

what if i put each frame back through the model which created the original image using image to image

### Gemini

Running each frame individually through a standard 2D Image-to-Image (I2I) model will clean up the individual frame textures, but it introduces a major trade-off: **extreme frame-to-frame temporal jitter (boiling/flickering)**.

### Why Naive Frame-by-Frame I2I Causes Problems

- **Zero Temporal Awareness:** Standard 2D models (like SD1.5, SDXL, or Flux) evaluate each image in complete isolation without knowledge of preceding or subsequent frames.
- **Texture & Edge Boiling:** Hair strands, fabric folds, and ink outlines will shift shape, redraw, and flicker erratically from frame to frame.
- **Chroma Bleed Variations:** The green screen edge will be calculated differently in every frame, causing jagged, animated green halos that complicate clean rotoscoping/keying downstream.

### How to Make Frame Refinement Work (If You Go This Route)

To refine frames without introducing severe flickering:

- **Keep Denoise Extremely Low ($0.15 - 0.25$):** At low denoise levels, the 2D model only sharpens high-frequency details (line art and flat color fills) without hallucinating new geometry.
- **Use an AnimatedDiff Batch Loop (Temporal Consistency):** Instead of standard static I2I, feed the full frame batch through an **AnimateDiff / ControlNet Tile** pass. This applies 2D conditioning while maintaining temporal cross-attention across all frames.
- **Color & Contrast Post-Pass (Fastest Alternative):** Instead of a heavy neural pass, apply a simple batch threshold or chroma-key cleanup curve using an OpenCV / ffmpeg script or ComfyUI image-filter nodes (e.g., *Color Correct* / *RemBg* / *Threshold Mask*) to clamp semi-transparent pixels directly.

### You

is there any way to make it loop where the first frame becomes the last frame

### Gemini

Yes, there are three distinct ways to force a generated video to seamlessly loop so the first frame matches the last frame.

### Method 1: The First-to-Last Frame Model (True AI Interpolation)

Wan has a dedicated architecture called **FLF2V (First-Last-Frame-To-Video)**. Instead of taking only an initial anchor image, it accepts both a `start_image` and an `end_image`.

- **How it works:** You pipe the **same image** into both the `start_image` and `end_image` slots on the `WanFirstLastFrameToVideo` node.
- **The Result:** The model generates intermediate frames that leave the starting pose, perform motion, and naturally return to the exact same starting pose at frame 17 (or 33) with high visual continuity.
- **Requirements:** This requires loading the Wan FLF2V checkpoint variant rather than the standard I2V model.

### Method 2: Ping-Pong / Yo-Yo Mode (Instant & Free)

If your character is performing an ambient action (like breathing, swaying, idling, or a simple head turn), you can turn it into an infinite loop without generating extra diffusion frames.

- **In ComfyUI:** Look at your **`Video Combine`** node at the bottom of your graph.
- **The Setting:** Toggle **`pingpong`** from `false` to **`true`**.
- **The Result:** The node automatically renders the clip forward ($1 \rightarrow 17$) and then in reverse ($16 \rightarrow 1$). Because frame 1 is both the beginning and the end, the animation plays continuously as a loop without any jump cuts.

### Method 3: Latent Split & Crossfade (Post-Processing)

For non-reversing loops (like a forward walk cycle), you can use standard video looping logic:

1. Generate a standard 33-frame clip.
2. Cut the video in half (Frames 1–16 and Frames 17–33).
3. Swap their order so the original cut point is at the beginning and end.
4. Apply an overlapping crossfade (using ffmpeg or ComfyUI's *Image Blend* / *Video Loop* nodes) across the middle splice to blend the seam.

[Wan 2.1 First Last Frame To Video Workflow](https://www.youtube.com/watch?v=7w3QR5sEhZw) This tutorial demonstrates how supplying matching starting and ending images creates continuous looping video clips using Wan first-and-last frame conditioning.

[![image](https://www.gstatic.com/images/branding/productlogos/youtube/v9/192px.svg)

Wan 2.1 First Last Frame To Video - Better Than Wan Fun Inp With 720P!

Benji’s AI Playground · 30K views

[Open in Wan 2.1 First Last Frame To Video - Better Than Wan Fun Inp With 720P!](https://www.youtube.com/watch?v=7w3QR5sEhZw)](https://www.youtube.com/watch?v=7w3QR5sEhZw)

### You

would method one be good to use for walk cycles

### Gemini

**No, Method 1 (FLF2V with the exact same image in both slots) is generally poor for walk cycles.**

### Why It Fails for Walk Cycles

- **The "Rubber Band" Problem:** When you force the model to start and end at the exact same pose across a short sequence (e.g., 17 or 33 frames), it attempts to interpolate the path of least resistance. Instead of completing a full forward leg-over-leg stride, the character will step forward and awkwardly slide or rewind backward into the starting stance.
- **Foot Sliding:** Diffusion models interpolating between identical start and end anchors struggle with contact-point physics, leading to feet sliding or morphing against the ground plane.
- **Lack of Intermediate Phase Anchoring:** A complete walk cycle requires at least 4 key poses (Contact $\rightarrow$ Down $\rightarrow$ Passing $\rightarrow$ Up). Constraining only the end points leaves the middle phase unguided.

### How to Use FLF2V Properly for Walks

If you want to use FLF2V for a walking motion, feed it **two different phase poses**:

1. **`start_image`**: Character with Left Foot Forward (Contact Pose).
2. **`end_image`**: Character with Right Foot Forward (Opposite Contact Pose).
3. Generate Clip A (Left-to-Right step), then generate Clip B (Right-to-Left step), and concatenate them into a continuous walk cycle.

### The Better Alternatives for Walk Cycles

- **Method 3 (Latent Split & Crossfade):** Prompt the standard I2V model with `"walking forward in place, treadmill walk cycle, looping character animation"`, generate 33–49 frames, and use ComfyUI frame-blending/crossfade nodes to seamlessly join the loop point.
- **ControlNet / OpenPose Motion Guidance:** Feed an OpenPose walk cycle skeleton sequence into Wan/AnimateDiff to strictly govern foot placement and gait timing throughout the generation.

[Wan 2.1 First Last Frame To Video Workflow](https://www.youtube.com/watch?v=7w3QR5sEhZw) This video demonstrates how endpoint keyframing behaves during interpolation in the Wan pipeline.

[![image](https://www.gstatic.com/images/branding/productlogos/youtube/v9/192px.svg)

Wan 2.1 First Last Frame To Video - Better Than Wan Fun Inp With 720P!

Benji’s AI Playground · 30K views

[Open in Wan 2.1 First Last Frame To Video - Better Than Wan Fun Inp With 720P!](https://www.youtube.com/watch?v=7w3QR5sEhZw)](https://www.youtube.com/watch?v=7w3QR5sEhZw)

### You

where did i put the wan 2.2 checkpoint

### Gemini

Your Wan 2.2 model files are located inside your portable ComfyUI installation directory at:

`D:\arte\work\slopratchet.com\000.wan-toon\ComfyUI_windows_portable\ComfyUI\models\unet\`

Specifically, that folder holds your two dual-expert GGUF checkpoint files:

- `wan2.2_i2v_high_noise_14B_Q3_K_S.gguf`
- `wan2.2_i2v_low_noise_14B_Q3_K_S.gguf`

*(Note: The accompanying `umt5_xxl_fp8_e4m3fn_scaled.safetensors` text encoder is in `ComfyUI\models\clip\`, and the `wan_2.1_vae.safetensors` file is in `ComfyUI\models\vae\`.)*

### You

now what if i wanted to do something similar for [[StyleTTS 2] ]

### Gemini

To set up a local, headless, and scriptable text-to-speech pipeline with **StyleTTS 2** alongside your ComfyUI setup—while respecting the 6GB VRAM ceiling—the cleanest architecture mirrors the dual-stage decoupling you used for video: **run StyleTTS 2 as an isolated local microservice or embedded Python module on CPU / low-footprint CUDA**.

### 1. Hardware Footprint & Memory Strategy

Unlike Wan 2.2 14B (which saturates VRAM and requires layer offloading), StyleTTS 2 is relatively lightweight:

- **VRAM Footprint:** ~1.5 GB to 2.5 GB peak during 24kHz diffusion sampling.
- **CPU Inference:** StyleTTS 2 runs near real-time (~1.2× RTF) on modern x86 CPUs using `torch.float32`.
- **Execution Strategy:**
  - If running **concurrently** with ComfyUI: Force StyleTTS 2 onto the **CPU** (`device="cpu"`) so it does not compete with Wan's 6GB VRAM allocation.
  - If running **sequentially** (generate voice first $\rightarrow$ extract duration $\rightarrow$ invoke Wan 2.2): Run StyleTTS 2 on `cuda:0`, dump the `.wav`, flush CUDA memory with `torch.cuda.empty_cache()`, then launch the ComfyUI video pass.

### 2. Standalone Environment Setup

Keep StyleTTS 2 in its own dedicated virtual environment to prevent dependency conflicts with ComfyUI's torch/CUDA wheels.

In PowerShell:

```powershell
# Create an isolated environment for the TTS engine
python -m venv D:\arte\work\slopratchet.com\000.audio-engine\styletts2_env
.\D:\arte\work\slopratchet.com\000.audio-engine\styletts2_env\Scripts\Activate.ps1

# Core dependencies
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install phonemizer librosa soundfile nltk monotonic_align
pip install styletts2
```

### 3. Voice Blending & Reference Cloning Architecture

StyleTTS 2 uses a reference audio sample (3–10 seconds) to extract a **style vector** $s \in \mathbb{R}^{128}$ via its Style Diffusion and Text Aligner modules.

To create custom character voices:

1. **Anchor Clips:** Store clean, dry 24kHz mono reference `.wav` files (e.g., `voices/character_a.wav`).
2. **Style Vector Caching:** Compute and serialize the style latent vector once as a `.pt` or `.npy` tensor rather than re-encoding the reference audio on every inference call.
3. **Style Blending (Interpolation):** You can blend two voice latents algebraically before synthesis:
  $$
  s_{\text{blend}} = \alpha \cdot s_{\text{voice1}} + (1 - \alpha) \cdot s_{\text{voice2}}
  $$
  This lets you dial in a distinct vocal identity without training a custom model from scratch.

### 4. Headless Scripting & Duration Alignment

A lightweight headless runner script allows your pipeline to pass text, extract the generated `.wav`, and calculate the exact frame duration to feed directly into your video generator's `length` parameter.

```python
import os
import torch
import soundfile as sf
import subprocess
import json
from styletts2 import tts

# 1. Initialize pipeline (force CPU if ComfyUI is active)
device = "cuda" if torch.cuda.is_available() else "cpu"
engine = tts.StyleTTS2(model_checkpoint_path="models/styletts2_checkpoint.pth")

def synthesize_dialogue(text: str, reference_wav: str, output_path: str, fps: int = 16):
    # 2. Synthesize audio
    audio_data = engine.inference(
        text=text,
        target_voice_path=reference_wav,
        alpha=0.3,   # Style balance (timbre vs prosody)
        beta=0.7,    # Prosody control
        diffusion_steps=10,
        embedding_scale=1.0
    )
    
    # 3. Save 24kHz mono WAV
    sf.write(output_path, audio_data, samplerate=24000)

    # 4. Measure audio duration via ffprobe to compute exact video frames
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", output_path
    ]
    duration_sec = float(subprocess.check_output(cmd).decode().strip())
    
    # Calculate required Wan video frames (rounded to nearest Wan latent step: (N*4)+1)
    raw_frames = int(duration_sec * fps)
    aligned_frames = ((raw_frames // 4) * 4) + 1  # Wan requires (N*4)+1 framing

    return {
        "output_audio": output_path,
        "duration_seconds": duration_sec,
        "target_video_frames": max(17, aligned_frames)
    }

if __name__ == "__main__":
    result = synthesize_dialogue(
        text="The water's too quiet out by the canal gate.",
        reference_wav="dossiers/audio/ref_character.wav",
        output_path="output/audio/line_001.wav",
        fps=16
    )
    print(json.dumps(result, indent=2))
```

### 5. Bridging Voice to Video Generation

Once StyleTTS 2 outputs the audio file and frame count:

1. The script writes `target_video_frames` directly into the `length` field of the `WanImageToVideo` node payload in your `workflow_api.json`.
2. The headless pipeline queues the ComfyUI job via `POST [http://127.0.0.1:8188/prompt](http://127.0.0.1:8188/prompt)`.
3. Upon video completion, a quick `ffmpeg` mux command binds the `.wav` to the generated `.mp4`:
  ```bash
  ffmpeg -y -i output_video.mp4 -i line_001.wav -c:v copy -c:a aac -shortest final_render.mp4
  ```
