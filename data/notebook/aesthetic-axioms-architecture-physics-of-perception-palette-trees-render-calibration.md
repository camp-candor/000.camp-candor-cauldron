# Aesthetic Axioms Architecture: Physics of Perception, Palette Trees & Render Calibration

An architectural specification establishing `aesthetic_axioms` as the immutable sensory lens of the simulation, structuring compositional visual styles, enforcing render-pipeline constraints, verifying pixel-level atmosphere, formalizing Doležel’s Four Modalities for sight, and cross-referencing core sensory paradigms (Pastoral-Contemplative, Verdant Flux, Visceral Ballistics, Prophetic Brutalism).

---

## 1. The Vision: The Immutable Lens & The Physics of Perception

In a multimodal hallucination engine, style is not an interchangeable cosmetic skin or mood board; it is the **Retina of Reality**:
* If an axiom declares *"Shadows are absolute,"* the Render Kernel crushes blacks to `#000000`.
* If an axiom declares *"Hope is dead,"* the saturation ceiling is locked at `0.2`.
* **Aesthetic Axioms dictate how the world is perceived**, converting visual, typographic, and acoustic design into deterministic constraints enforced directly by the GPU shader pipeline.

---

## 2. Doležel’s Four Modalities of Sight (The Four Chambers of Perception)

Aesthetic axioms mirror Lubomír Doležel’s four modal categories, directly partitioning visual and sensory constraints across dedicated subsystems in the render engine:

```
┌────────────────────────────────────────────────────────────────────────┐
│ I. ALETHIC VISUAL CONSTRAINTS (The Laws of Optical Possibility)         │
│    - Engine Subsystem: Render Pipeline & Shader Graph                  │
│    - Governs: Shadow Hardness, Transparency, Lens Physics, Framerates │
├────────────────────────────────────────────────────────────────────────┤
│ II. DEONTIC VISUAL CONSTRAINTS (The Laws of Interface & Permission)     │
│     - Engine Subsystem: UI Layer, HUD System & Screen Feedback         │
│     - Governs: Diegesis, Damage Indicators, Navigation Aids            │
├────────────────────────────────────────────────────────────────────────┤
│ III. AXIOLOGICAL VISUAL CONSTRAINTS (The Laws of Value & Tone)          │
│      - Engine Subsystem: Post-Processing, LUTs & Audio Mix Bias        │
│      - Governs: Color Grading Profiles, Grain Intensity, Audio Balance │
├────────────────────────────────────────────────────────────────────────┤
│ IV. EPISTEMIC VISUAL CONSTRAINTS (The Laws of Clarity & Obscurance)    │
│     - Engine Subsystem: Post-Process Volume, Fog of War, Shaders       │
│     - Governs: Visual Fidelity, Digital Noise/Glitches, Text Ciphers   │
└────────────────────────────────────────────────────────────────────────┘
```

### Pillar I: Alethic Visual Constraints (The Laws of Possibility)
* **Definition:** What is physically possible for the camera lens and eye to see.
* **Engine Mapping:** Render pipeline, material shaders, and camera matrices.
* **Schema Definition (`packages/types/src/axioms/alethic_visual.ts`):**
  ```typescript
  export const AlethicVisualSchema = z.object({
    shadow_hardness: z.enum(['RAYTRACED_SOFT', 'STENCIL_HARD', 'PITCH_BLACK', 'DAPPLED_SOFTNESS']),
    transparency_allowed: z.boolean(), // False in industrial/brutalist worlds (all matter is opaque)
    lens_physics: z.enum(['PERFECT_PINHOLE', 'ANAMORPHIC_DISTORTION', 'FISHEYE', 'HAND_PAINTED_IMPERFECT']),
    temporal_resolution: z.enum(['24FPS_LOCKED', '60FPS_LOCKED', 'UNCAPPED', 'ANIMIST_BREATH']),
  });
  ```
* **Impact:** If `lens_physics` is `ANAMORPHIC_DISTORTION`, the Render Kernel permanently injects barrel distortion and chromatic aberration. In `HAND_PAINTED_IMPERFECT`, it wobbles geometric outlines via procedural vertex displacement.

### Pillar II: Deontic Visual Constraints (The Laws of Interface)
* **Definition:** What information the player/observer is permitted to perceive via the screen.
* **Engine Mapping:** UI layer, canvas overlays, and HUD systems.
* **Schema Definition (`packages/types/src/axioms/deontic_visual.ts`):**
  ```typescript
  export const DeonticVisualSchema = z.object({
    interface_paradigm: z.enum(['OVERLAY', 'DIEGETIC', 'AUGMENTED_REALITY', 'MINIMALIST_COZY']),
    damage_feedback: z.enum(['NUMERIC_FLOATERS', 'SCREEN_SHAKE_ONLY', 'SCREEN_FRACTURE', 'NONE']),
    navigation_aid: z.enum(['GPS_LINE', 'COMPASS_ONLY', 'PAPER_MAP', 'PILLAR_OF_FIRE', 'WIND_TRAIL']),
  });
  ```
* **Impact:** If `interface_paradigm` is `DIEGETIC`, floating 2D screen canvases are culled at runtime. In `MINIMALIST_COZY`, interface clutter yields to quiet in-world cues.

### Pillar III: Axiological Visual Constraints (The Laws of Value & Tone)
* **Definition:** The emotional, aesthetic, and moral weight of the scene.
* **Engine Mapping:** Color grading volumes, film emulation LUTs, and audio mixing biases.
* **Schema Definition (`packages/types/src/axioms/axiological_visual.ts`):**
  ```typescript
  export const AxiologicalVisualSchema = z.object({
    color_grading_lut: z.enum(['MATRIX_GREEN', 'BLADE_RUNNER_NEON', 'SAVING_PVT_RYAN_BLEACH', 'BLEACH_BYPASS', 'GHIBLI_GOUACHE', 'VERDANT_SOLAR', 'LUT_BRASS_SKY']),
    audio_mix_bias: z.enum(['DIALOGUE_FOCUS', 'AMBIENCE_FOCUS', 'MUSIC_FOCUS', 'BALLISTIC_PERCUSSION', 'TINY_SOUNDS_FOLEY']),
    grain_amount: z.number().min(0).max(1),
  });
  ```
* **Impact:** In *Pastoral-Contemplative*, `color_grading_lut` locks to `GHIBLI_GOUACHE` with cobalt shadows and zero pure black. In *Visceral Ballistics*, it locks to `BLEACH_BYPASS`. In *Prophetic Brutalism*, it enforces `LUT_BRASS_SKY`.

### Pillar IV: Epistemic Visual Constraints (The Laws of Clarity)
* **Definition:** How reality is filtered, obscured, or rendered legible to the viewer.
* **Engine Mapping:** Volumetric fog volumes, camera noise shaders, and cipher decoders.
* **Schema Definition (`packages/types/src/axioms/epistemic_visual.ts`):**
  ```typescript
  export const EpistemicVisualSchema = z.object({
    visual_fidelity: z.enum(['4K_CRISP', 'VHS_ARTIFACTS', 'PSX_JITTER', 'VECTOR_SMOOTH', 'PAINTERLY_TEXTURE']),
    obscurance_style: z.enum(['BLACK_VOID', 'GREY_FOG', 'DIGITAL_STATIC', 'FLUID_MIST', 'KOMOREBI_LEAVES', 'VOLUMETRIC_SMOG']),
    text_cipher: z.enum(['PLAINTEXT', 'ALIEN_RUNES', 'CORRUPTED_DATA', 'ANCIENT_GLYPHS']),
  });
  ```
* **Impact:** In *Analog Horror / Industrial*, `visual_fidelity` is `VHS_ARTIFACTS`. In *Verdant Flux*, it locks to `VECTOR_SMOOTH`. In *Pastoral-Contemplative*, it locks to `PAINTERLY_TEXTURE` with `KOMOREBI_LEAVES` obscurance.

---

## 3. The Unified Aesthetic Schema & Dynamic Event Overlays

### The Canonical File (`aesthetic_axioms.json`):
```json
{
  "meta": { "id": "pastoral_contemplative_core", "version": "1.0.0" },
  "alethic": {
    "shadow_hardness": "DAPPLED_SOFTNESS",
    "transparency_allowed": true,
    "lens_physics": "HAND_PAINTED_IMPERFECT",
    "temporal_resolution": "24FPS_LOCKED"
  },
  "deontic": {
    "interface_paradigm": "MINIMALIST_COZY",
    "damage_feedback": "NONE",
    "navigation_aid": "WIND_TRAIL"
  },
  "axiological": {
    "color_grading_lut": "GHIBLI_GOUACHE",
    "audio_mix_bias": "TINY_SOUNDS_FOLEY",
    "grain_amount": 0.05
  },
  "epistemic": {
    "visual_fidelity": "PAINTERLY_TEXTURE",
    "obscurance_style": "KOMOREBI_LEAVES",
    "text_cipher": "PLAINTEXT"
  }
}
```

### Cross-Constraint Validation (The Art Critic via Zod):
```typescript
import { z } from 'zod';

export const AestheticAxiomSchema = z.object({
  alethic: AlethicVisualSchema,
  deontic: DeonticVisualSchema,
  axiological: AxiologicalVisualSchema,
  epistemic: EpistemicVisualSchema,
}).refine(data => {
  if (data.axiological.color_grading_lut === 'GHIBLI_GOUACHE' && data.alethic.shadow_hardness === 'PITCH_BLACK') {
    return false; // Pure black shadows are forbidden in gouache naturalist palettes
  }
  return true;
}, {
  message: "Aesthetic Dissonance: Ghibli gouache palette forbids pitch black shadows; shadows must be cobalt or violet."
});
```

---

## 4. The Three-Layer Aesthetic Hierarchy (The Painting Metaphor)

```
packages/config/src/
├── constants/     <-- Layer 1: The Pigments (Atomic sensory definitions)
│   ├── palettes.ts
│   ├── audio.ts
│   └── typography.ts
├── presets/       <-- Layer 2: The Techniques (Reusable post-process molds)
│   ├── cinematic_standard.ts
│   ├── pastoral_contemplative.ts
│   ├── verdant_flux.ts
│   ├── visceral_ballistics.ts
│   └── prophetic_brutalism.ts
├── styles/        <-- Layer 3: The Visions (Unique style instances)
│   ├── ghibli_quiet.ts
│   └── industrial.ts
├── loader.ts      <-- The Critic (Zod visual validator)
└── index.ts       <-- AESTHETIC_REGISTRY
```

### Layer 1: The Pigments (`src/constants/`)
* `palettes.ts`: `PALETTE_GHIBLI_GOUACHE`, `PALETTE_VERDANT_SOLAR`, `PALETTE_RUST_AND_OIL`, `PALETTE_PROPHETIC_OCHRE`.
* `audio.ts`: `AUDIO_PROFILE_TINY_FOLEY`, `AUDIO_PROFILE_GRANULAR_RIVER`, `AUDIO_PROFILE_60HZ_HUM`, `AUDIO_PROFILE_SHOFAR_BLAST`.
* `typography.ts`: `FONT_GENTLE_HAND`, `FONT_VARIABLE_WIND`, `FONT_TERMINAL_MONOSPACE`, `FONT_CHISELED_SERIF`.

### Layer 2: The Techniques (`src/presets/`)
* `pastoral_contemplative.ts`: Combines `FONT_GENTLE_HAND`, `AUDIO_PROFILE_TINY_FOLEY`, gouache palettes, and *Komorebi* light refraction.
* `verdant_flux.ts`: Combines `FONT_VARIABLE_WIND`, `AUDIO_PROFILE_GRANULAR_RIVER`, frictionless motion, and ghost trail passes.
* `visceral_ballistics.ts`: Combines harsh high-contrast bleach bypass, 60Hz hums, and screen-tear glitch passes.
* `prophetic_brutalism.ts`: Combines harsh chiaroscuro, brass sky LUTs, shofar acoustic blasts, and stone-tablet typography.

---

## 5. The Four Core Sensory Paradigms Reference Matrix

| Axis | Pastoral-Contemplative | Verdant Flux | Visceral Ballistics | Prophetic Brutalism |
|---|---|---|---|---|
| **Pillar I (Alethic)** | Dappled softness, organic weight, living wood | Weightless vector planes, cold plasma, zero friction | Heavy lead gravity, flaking rust, jagged tessellation | Desiccated stone, scorched earth, blinding direct sun |
| **Pillar II (Deontic)** | Minimalist cozy, hand-hewn tools, living space | Biomimetic grown crystal, floating UI, zero cables | Diegetic malfunction, cracked visor, CRT desync | Stone tablets falling with a thud, accusing text |
| **Pillar III (Axiological)** | Ghibli gouache, tiny sounds, baking yeast | Solarpunk neon, resonant flute wind, clean energy | Bleach bypass, 60Hz hum, industrial doom noise | Brass sky LUT, shofar horn blast, ash grain |
| **Pillar IV (Epistemic)** | Painterly brushstrokes, *Komorebi* leaves, quiet | Vector smoothness, light ghost trails, clarity | VHS tracking artifacts, macroblocking, paranoia | Burnt film margins, thick dark, blinding white-outs |
