# Wiregrass Basin: Generative Animation Pipeline & Production Architecture

## Overview
A factory-floor production architecture tailored to a generative AI pipeline (ComfyUI, Wan 2.2, AnimateDiff, Parler-TTS/Chatterbox) rather than traditional animation workflows.

---

### 1. Generative Shot Pipeline Milestones
Replacing traditional (Rough -> Clean -> Comp) with generative stage gates:
- **Prompt / Seed Hunting:** Base aesthetic generation and establishing consistent seeds.
- **ControlNet / Motion Pass:** Video-to-video, OpenPose, or AnimateDiff motion modules.
- **Temporal Smoothing / Deflicker:** Eliminating boiling and latent warping.
- **Inpainting / Detail Fixes:** Masking and regenerating hands, hero props (e.g., heavy steel date-stamp), and lip-sync alignment.
- **Final Comp & Grade:** Conforming, color grading, and final output assembly.

---

### 2. Somatic Translation Architecture
Bridging dense 10-phase psychological/somatic character bibles into executable prompt tokens:
- **Field:** `Somatic Prompt Triggers` in `02 - ASSET FORGE`.
- **Billie Fae (031) Triggers:**
  - *Positive:* heavy grounded posture, static, looking through bifocals, exhausted expression, drab 1980s floral blouse, harsh fluorescent lighting
  - *Negative:* pacing, tense, dynamic action, smiling
- **Branksi (038) Triggers:**
  - *Positive:* absolute muscular slack, vaporous glide, matte gray oversized clothing, sterile breathing apparatus, wide unfocused eyes
  - *Negative:* coiled tension, tactical stance, aggressive eye contact

---

### 3. Scenography Ledger (The 62nd Character)
Treating the Wiregrass Basin environments as primary entities alongside the 61 characters:
- **Folder:** `Environmental LoRAs & Plates` in Asset Forge.
- Model sheets, prompt weights, and consistent seed repositories for:
  - *Billie Fae’s Bail-Bonds Office:* Stale coffee, water-stained drop ceilings, dust motes in tungsten rays.
  - *Adince Louvin’s "The Crucible" Substation:* Heavy iron, shafts of dying sunlight, pitted concrete, biometric swamp rot.

---

### 4. Edge Worker & Local Automation Stack
Eliminating manual card management via local daemon and edge webhook:
- Event listener triggers when local ComfyUI/batch render finishes a shot directory (`EP101_SC02_SH005`).
- Fires API call to ClickUp to advance shot status from `Motion Pass` to `Review / Inpainting`.
- Automatically attaches low-resolution proxy `.mp4` directly to the task.
- Issues notification ping for human review.

---

### 5. Audio Synthesis & Voice Recipe Book
Standardizing voice generation baselines across TTS engines (Parler-TTS, Chatterbox):
- **Location:** `04 - AUDIO & DIALOGUE LAB`.
- **Required Metadata / Custom Fields:**
  - `TTS Model Used`
  - `Voice Clone / Speaker ID`
  - `Pacing / Pitch Modifiers` (e.g., -15% speed, +5% breathiness for Branksi; gravelly drawl parameters for Billie Fae)
