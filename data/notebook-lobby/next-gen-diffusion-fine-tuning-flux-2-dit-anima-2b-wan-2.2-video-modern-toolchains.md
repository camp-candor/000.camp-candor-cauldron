# Next-Gen Diffusion Fine-Tuning: FLUX.2 DiT, Anima 2B, Wan 2.2 Video & Modern Toolchains

An engineering manual covering advanced fine-tuning architectures: FLUX.2 rectified-flow Diffusion Transformers (DiT), CircleStone Labs' Anima 2B, Wan 2.2 Mixture-of-Experts video LoRAs, and modern dataset tooling.

---

## 1. FLUX.2 DiT LoRA Architecture & VRAM Engineering

FLUX.2 breaks away completely from legacy UNet architectures (SD1.5/SDXL), requiring a fundamental recalibration of hyperparameter assumptions:

### A. The Fused Transformer & Rank Dynamics
* **Architecture:** FLUX.2 [dev] is a 32B-parameter rectified-flow Diffusion Transformer (DiT). It combines text-to-image synthesis and multi-image editing in a unified checkpoint.
* **The 24B Mistral Vision-Language Text Encoder:** Unlike the dual CLIP/T5 encoders in older models, FLUX.2 uses Mistral Small (24B VLM). The text encoder alone exceeds the parameter count of entire previous image models. Because it is a VLM, it natively processes both conditioning text and image tokens.
* **Rank Selection:** Low ranks (`4–8`) fail to carve out meaningful subspaces across such massive fused attention blocks.
  * Sane baseline: **Rank 32** (for style/character identity).
  * VRAM-constrained baseline: **Rank 8–16**.
  * Complex multi-angle character LoRAs: **Rank 32–64**, paired with **Differential Output Preservation (DOP)** in Ostris's AI-Toolkit to prevent aggressive overfitting.
* **Overfitting Sensitivity:** Because each rank dimension modifies deeper attention projections across the fused transformer, overfitting manifests significantly faster than in SD1.5 at equivalent step counts.

### B. Hardware Realities & The Klein Distillation Family
* **Full Precision VRAM Ceiling:** Running the DiT and 24B Mistral encoder resident at BF16 requires $>64\text{GB}$ VRAM for the transformer alone.
* **FP8 Quantization:** Reduces memory footprint by ~40%, bringing [dev] inference into the 18–24GB range, but local training remains hardware-intensive.
* **The Klein Family (Consumer Target):** Black Forest Labs provides distilled **Klein 4B, 9B, and 9B-KV** variants specifically engineered for consumer GPU LoRA training.
* **Verified Klein-9B Config:** Rank 64, learning rate `5e-5`, AdamW8bit, bf16, multi-resolution bucketing (512/768/1024), caption dropout `0.05`, DOP enabled, checkpoints saved every 500 steps.
* **Tooling:** **Ostris AI-Toolkit** and **Musubi Tuner** (`flux_2_train_network.py` with fp8 Mistral encoder offloading).

---

## 2. CircleStone Labs' Anima 2B Fine-Tuning Protocols

Anima is a 2-billion-parameter text-to-image model purpose-built by CircleStone Labs in collaboration with Comfy Org for high-fidelity anime and illustration.

```
[ NVIDIA Cosmos-Predict2-2B Base ]
                 │
                 ├── Qwen-3 0.6B Text Encoder (LLM Adapter)
                 └── Qwen-Image VAE
                 │
                 ▼
          [ Anima 2B ]
   ├── Anima-Base (Target for LoRA training)
   ├── Anima-Aesthetic (Fine-tuned style checkpoint)
   └── Anima-Turbo (Distilled for CFG 1, 8–12 step inference)
```

### A. Model Variants & Training Rules
* **Train Exclusively on Anima-Base:** The raw checkpoint possesses maximum latent flexibility and zero baked-in style bias. Never train LoRAs on Aesthetic or Turbo checkpoints.
* **Freeze the LLM Adapter (`llm_adapter_lr = 0`):** The author's training script (`diffusion-pipe` by tdrussell) defaults to zero learning rate on the Qwen adapter. Training the LLM adapter degrades underlying semantic knowledge.
* **Low Learning Rate Mandate:** For Rank 32 LoRAs, configure LR around **`2e-5`** (substantially lower than SD1.5 rates). Because Anima-Base lacks heavy stylistic bias, low learning rates achieve convergence without corrupting weights.
* **Trainer Alignment:** `diffusion-pipe` is authored by tdrussell—the primary developer behind Wan video LoRA training scripts.

### B. Prompt & Tagging Conventions
* **Tag Hierarchy:** `[quality/meta/year/safety tags]` $\longrightarrow$ `[subject count]` $\longrightarrow$ `[character]` $\longrightarrow$ `[series]` $\longrightarrow$ `[artist]` $\longrightarrow$ `[general descriptive tags]`.
* **Artist Modifier:** Artist styles require an explicit `@` prefix (`@artist name`); omitting the prefix severely weakens style assertion.
* **Quality Tags:** Supports natural-language descriptors (*masterpiece*, *best quality*) or PonyV7-style aesthetic brackets (`score_9` down to `score_1`).
* **Licensing Distinction:** Non-commercial license on model weights (inheriting NVIDIA Cosmos terms), but output imagery is 100% commercially clearable for client work, game assets, and paid production.

---

## 3. Wan 2.2 Mixture-of-Experts Video LoRA Engineering

Video LoRA training differs fundamentally from 2D image models due to temporal attention matrices:

* **Mixture-of-Experts (MoE) Architecture:** Wan 2.2 splits generation across specialized sub-networks. LoRA training outputs two discrete adapters:
  1. **High-Noise Adapter:** Directs macro structure, temporal composition, and initial motion vectors.
  2. **Low-Noise Adapter:** Resolves fine-grained spatial textures, surface details, and edge stability.
* **Dataset Ingestion Modalities:** Built from short 3–8 second continuous clips or static images treated as single-frame videos.
* **Task Typing:** Explicitly bifurcated upfront between Character LoRAs (appearance invariant across temporal cuts), Style LoRAs, and Motion LoRAs (camera trajectories and dynamic physical behaviors).
* **Tooling:** Supported natively inside Ostris's AI-Toolkit and `diffusion-pipe`.

---

## 4. Proprietary API Fine-Tuning: Ideogram V4

* **Official V4 Adapter Training:** Ideogram supports LoRA adapter fine-tuning on top of the closed Ideogram V4 foundation model via web UI or API (fal.ai).
* **Strict Caption Fidelity:** Captions are consumed exactly as authored in `.txt` sidecars; the platform does not summarize, expand, or auto-tag.
* **Pricing Metric:** Billed per training step (~$0.00675 per step; ~$6.75 per 1,000 steps).
* **Character Feature vs. Full LoRA:** For single-reference continuity, Ideogram ships a zero-training "Character" reference tool, reserving full LoRA training for reusable multi-scene styles.

---

## 5. Advanced Dataset Annotation Toolchains

The boundary between booru-tagging and natural-language captioning has unified in modern toolchains:

* **TagGUI:** Vision-Language Model (VLM) automated captioning engine running local models (CogVLM, LLaVA). Includes SDXL token budgeting, making it ideal for hybrid natural language + Danbooru tagging (Illustrious and Anima pipelines).
* **BooruDatasetTagManager / BDTM+:** Evolved from simple tag editors to include OpenAI-compatible endpoint auto-tagging, video frame sampling for temporal video LoRA datasets, and bidirectional tag-to-prose conversion.
