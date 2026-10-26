# LoRA Training Systems: Hyperparameter Engineering, Captioning Strategies & SD1.5/SDXL Architectures

A comprehensive technical reference manual on Low-Rank Adaptation (LoRA) training mechanics, dataset preparation heuristics, captioning strategies, network rank/alpha math, and failure mode triage across Stable Diffusion 1.5 and SDXL checkpoints.

---

## 1. Dataset Quality Heuristics (The 80% Rule)

Hyperparameter optimization cannot compensate for a deficient training corpus. Dataset curation dictates representation quality:

* **Image Count Sweet Spot:**
  * Single character identity or discrete concept: **15–30 images**.
  * Complex multi-outfit characters or diverse styles: **50+ images**.
  * Principle: A lean, high-fidelity, varied corpus consistently outperforms voluminous, redundant, or noisy datasets.
* **Controlled Variance with an Invariant Target:**
  * Keep the target concept invariant (e.g., bone structure, face, signature texture).
  * Actively vary non-target parameters: camera elevation, lighting angle, background clutter, facial expression, and focal length. Uniform lighting across all images bakes ambient light directly into the adapter weights.
* **Resolution & Aspect-Ratio Bucketing:**
  * SD1.5 native base resolution: **512×512** (can push to 640–768 with bucketing).
  * Cropping: Manually crop out extraneous characters or watermarks, but avoid forcing hard square crops when aspect-ratio bucketing is active.
  * Artifact Suppression: Purge compression artifacts, motion blur, and watermarks—diffusion models learn unwanted compression artifacts just as efficiently as target features.

---

## 2. Captioning Architecture & Token Binding

Captioning determines whether features become permanently baked into the concept or remain dynamically controllable via prompt text at inference.

* **Hybrid Captioning Pipeline:** Automated initial tagging via BLIP (natural language) or WD14 (danbooru-style structured tags), followed by rigorous manual review and correction.
* **Trigger Words & Semantic Binding:**
  * Select rare, low-association tokens (`ohwx`, `sks`, or bespoke alphanumeric tokens).
  * Word order binds semantics: *"photo of an ohwx man in a trenchcoat"* binds the concept to the man; *"photo of a man in an ohwx trenchcoat"* binds the concept to the garment.
* **The Invariance Principle (What to Caption vs. What to Omit):**
  * **Omit from Captions:** Features you want permanently baked into the trigger token (e.g., character's facial structure, hair color).
  * **Explicitly Caption:** Features you want to remain variable/swappable at inference (e.g., glasses, background setting, lighting, clothing). Omitting glasses from captions forces the model to learn glasses as an immutable part of the character's face.
* **Caption Dropout:** Setting dropout to `0.05` (~5%) randomly drops caption tokens during training, serving as a regularizer that prevents verbatim prompt-memorization and enhances prompt generalization.

---

## 3. Dataset Layout & Step Arithmetic (Kohya Convention)

Kohya_ss reads folder naming prefixes directly as epoch repeat counts:

```
dataset_folder/
  10_tokenname/
    image_001.jpg
    image_001.txt
    image_002.jpg
    image_002.txt
```

### Total Step Calculation:
$$\text{Total Steps} = \frac{\text{Images} \times \text{Repeats} \times \text{Epochs}}{\text{Batch Size}}$$

* Standard SD1.5 convergence range: **1,500–3,000 total steps**.
* Allows weighting small, high-quality subsets heavily without duplicating raw asset files on disk.

---

## 4. Network Types, Rank & Alpha Scaling

* **Standard LoRA:** Modifies attention layers only (cross-attention and self-attention projections: $W_q, W_k, W_v, W_o$). Optimal for faces, distinct characters, and props.
* **LoCon / LoHa (LyCORIS):** Injects low-rank adapters into convolutional layers ($3\times3$ conv blocks) as well. Essential for deep artistic style transfer, brushstroke textures, and complex color palettes.
* **Network Rank ($\text{dim}$):** Dictates capacity (information bandwidth):
  * Single face or prop: `8–16`.
  * Standard character or style LoRA (SD1.5 standard default): `32`.
  * Complex multi-style / SDXL capacity: `64–128`.
* **Network Alpha ($\alpha$):** Scales effective learning strength:
  $$\Delta W = \frac{\alpha}{\text{rank}} (A \times B)$$
  * Standard Convention: Set $\alpha = \frac{\text{rank}}{2}$ (e.g., Rank 32, Alpha 16) for smooth, stable gradient application. Setting $\alpha = \text{rank}$ enforces aggressive weight updates.

---

## 5. Core Hyperparameter Matrix (SD1.5 Baseline)

| Hyperparameter | Typical SD1.5 Configuration | Technical Function / Notes |
|---|---|---|
| **Learning Rate** | `1e-4` to `2e-4` (UNet), $\le 1\text{e-}4$ (Text Encoder) | Standard baseline; lower text encoder rate prevents prompt drift. |
| **Optimizer** | `AdamW8bit` (Standard) or `Prodigy` | Prodigy provides adaptive d-coef learning-rate auto-tuning. |
| **LR Scheduler** | `cosine_with_restarts` | Smooths learning rate decay across cyclic boundaries. |
| **Batch Size** | `1` (8GB VRAM) to `4` (12GB+ VRAM) | Higher batches stabilize gradient vectors. |
| **Resolution** | `512×512` (Aspect-ratio bucketing enabled) | Preserves native composition without distortion. |
| **Clip Skip** | `2` | Mandatory for SD1.5 anime/custom bases (vs. `1` for SDXL/FLUX). |
| **Epochs / Steps** | `10–20` epochs (~1,500–2,500 steps) | Save checkpoints every epoch for comparative inference sweeps. |
| **Min-SNR Gamma** | `5` | Rebalances loss across noise timesteps; accelerates convergence. |
| **Mixed Precision**| `fp16` or `bf16` | Slashes VRAM consumption with zero perceptible precision loss. |

---

## 6. Regularization & Prior Preservation

* **Mechanics:** Mixing generic class images (e.g., *"photo of a man"*) generated from the base checkpoint alongside training data.
* **Purpose:** Prevents prior degradation and catastrophic forgetting. Keeps incidental characteristics (clothing, lighting) from bleeding into the base model's general semantic tokens.
* **Usage:** Essential for character LoRAs where pose, lighting, and wardrobe must remain fully flexible; generally omitted for pure full-image style LoRAs.

---

## 7. Ecosystem Checkpoints: Illustrious-XL & Animagine XL

SDXL-based anime checkpoints operate as distinct, non-interchangeable fine-tuning branches:

* **Animagine XL:** Dominant anime foundation model. Version compatibility is rigid: LoRAs trained on v3.0 are incompatible with v4.0 due to altered base latent weights.
* **Illustrious-XL (OnomaAI):** Built from Kohaku XL-beta5, optimized for stability and low generation variance.
  * *Hybrid Captioning:* Trained on Danbooru tags mixed with natural English prose.
  * *Training Forks:* Community LoRA-training forks specifically forbid `--noise_offset`. Enabling noise offset on Illustrious LoRAs induces severe color muddiness and off-model artifacts.
  * *Scheduler:* Cosine annealing is the community-verified standard.

---

## 8. Failure Mode Diagnostics & Triage

* **Overfitting:**
  * *Symptoms:* Rigid poses, background bleeding into every prompt, waxy plastic skin, inability to change clothes.
  * *Remedy:* Lower learning rate, reduce total epochs, decrease alpha, or inject more varied background plates.
* **Underfitting:**
  * *Symptoms:* Weak likeness, trigger word fails to assert character features.
  * *Remedy:* Increase repeat count/epochs, step up learning rate slightly, or expand rank capacity.
* **Caption Leakage:**
  * *Symptoms:* An unintended accessory (e.g., a specific hat) appears even when unprompted.
  * *Remedy:* Ensure the accessory is explicitly tagged in all training captions so it decouples from the trigger word.
* **Clip Skip Mismatch:** SD1.5 adapters trained on Clip Skip 2 produce washed-out, high-contrast, or corrupted latents when inferred on Clip Skip 1.
