# Macro-Axioms Architecture: Doležel Four-Fold Modalities & Compositional Multiverse Schema

An architectural specification establishing the four-fold modal structure (Lubomír Doležel's narrative modalities), three-layer compositional hierarchy (Atoms, Molecules, Worlds), cross-constraint Zod validation, and campaign runtime overlays.

---

## 1. Philosophical Grounding: Lubomír Doležel’s Four Modal Pillars

Rather than organizing simulation rules by arbitrary features or monolithic property bags, the universe's DNA is partitioned into the four chambers of narrative modal reality:

```
┌────────────────────────────────────────────────────────────────────────┐
│ I. ALETHIC CONSTRAINTS (Possibility & Natural Law)                     │
│    - Engine Subsystem: Physics Kernel & Graph Schema                   │
│    - Governs: Mortality, Teleportation, Magic Physics, Spatial Grids  │
├────────────────────────────────────────────────────────────────────────┤
│ II. DEONTIC CONSTRAINTS (Permission & Moral/Social Law)                │
│     - Engine Subsystem: Social Graph, Quests & Reputation Engine       │
│     - Governs: Oaths, Taboos, Law Enforcement, Moral Feedback          │
├────────────────────────────────────────────────────────────────────────┤
│ III. AXIOLOGICAL CONSTRAINTS (Value, Reward & Narrative Tone)          │
│      - Engine Subsystem: Economy, Progression (XP) & AI Tone Vector    │
│      - Governs: Progression Metric, Primary Currency, World Vibe       │
├────────────────────────────────────────────────────────────────────────┤
│ IV. EPISTEMIC CONSTRAINTS (Knowledge, Perception & Client Filters)     │
│     - Engine Subsystem: Fog of War, Lore Reliability, WebSocket Filter │
│     - Governs: Client View Visibility, Secret Gating, Chat Distance    │
└────────────────────────────────────────────────────────────────────────┘
```

### Pillar I: Alethic Constraints (The Laws of Possibility)
* **Domain:** Natural necessity, impossibility, and physical existence.
* **Engine Mapping:** Dictates which subsystems the Logic Kernel instantiates and which node/edge types are permissible in the graph.
* **Key Fields:**
  * `mortality`: `PERMANENT` | `RESURRECTABLE` | `UNDEAD_PRONE`
  * `teleportation`: `boolean` (If `false`, teleportation spell nodes are physically culled from the graph schema at boot).
  * `magic_system`: `VANCIAN` | `MANA` | `DEFILING` | `NONE`
  * `spatial_geometry`: `H3_EUCLIDEAN` | `H3_NON_EUCLIDEAN`

### Pillar II: Deontic Constraints (The Laws of Permission)
* **Domain:** Prohibition, obligation, and social contracts.
* **Engine Mapping:** Governs relational edge weighting, crime blast radii, and contractual event triggers.
* **Key Fields:**
  * `moral_feedback`: `NONE` | `KARMA_METER` | `DARK_POWERS_INTERVENTION` (e.g., Ravenloft Powers Checks).
  * `oaths`: `{ is_magically_binding: boolean, violation_consequence: 'NONE' | 'LOSS_OF_POWER' | 'CURSE' }` (If `true`, breaking a promise creates a server-side debuff edge automatically).
  * `civilization_stance`: `ANARCHY` | `FEUDAL_LAW` | `TOTALITARIAN`

### Pillar III: Axiological Constraints (The Laws of Value)
* **Domain:** Good, evil, societal worth, and the baseline measurement of success.
* **Engine Mapping:** Economy mechanics, XP progression curves, and AI Director prompt injection vectors.
* **Key Fields:**
  * `progression_vector`: `COMBAT_XP` | `GOLD_AS_XP` (OSR style) | `MILESTONE` | `SOCIAL_PRESTIGE`
  * `primary_value`: `GOLD` | `WATER` (Dark Sun currency) | `SOULS` | `CREDITS`
  * `narrative_tone`: `GRIMDARK` | `NOBLEBRIGHT` | `COSMIC_HORROR` | `PULP` (Fed into cosine-similarity checks against player behavior to trigger Director notes).

### Pillar IV: Epistemic Constraints (The Laws of Knowledge)
* **Domain:** Perception, verification, ignorance, and communication.
* **Engine Mapping:** WebSocket transmission filters, Fog of War culling, and narrator visibility masks.
* **Key Fields:**
  * `fog_of_war`: `HARD` (Absolute darkness/occlusion) | `SOFT` | `SHARED_VISION`
  * `lore_reliability`: `OBJECTIVE_TRUTH` | `UNRELIABLE_NARRATOR`
  * `meta_communication`: `TABLE_TALK_ALLOWED` | `DISTANCE_LIMITED_CHAT` (Rejects messages between players not in the same `ZoneDO`).
  * `magic_visibility`: `VISIBLE_AURA` | `INVISIBLE_UNTIL_CAST`

---

## 2. The Three-Layer Compositional Hierarchy (No Monoliths)

Worlds are assembled via **Composition**, not inheritance. The `packages/config` package mirrors the physical structure of the Earth:

```
packages/config/src/
├── constants/     <-- Layer 1: The Atoms (Immutable definitions)
│   ├── physics.ts
│   ├── magic.ts
│   └── time.ts
├── presets/       <-- Layer 2: The Molecules (Reusable composite molds)
│   ├── fantasy_standard.ts
│   └── scifi_hard.ts
├── worlds/        <-- Layer 3: The Worlds (Specific instances with mutations)
│   ├── dark_sun.ts
│   └── ravenloft.ts
├── loader.ts      <-- The Inquisitor (Zod validation gate)
└── index.ts       <-- UNIVERSE_REGISTRY
```

### Layer 1: The Atoms (`src/constants/`)
Immutable, standalone definitions containing no logic:
* `physics.ts`: `GRAVITY_STANDARD = 1.0`, `GRAVITY_LOW = 0.16`.
* `magic.ts`: `MAGIC_SYSTEM_VANCIAN`, `MAGIC_SYSTEM_DEFILING`.
* `time.ts`: `CALENDAR_GREGORIAN`, `CALENDAR_HARPTOS`.

### Layer 2: The Molecules (`src/presets/`)
Standard templates combining atoms into baseline environments:
* `fantasy_standard.ts`: Combines `GRAVITY_STANDARD`, `MAGIC_SYSTEM_VANCIAN`, `civilization_stance: "FEUDAL_LAW"`.
* `scifi_hard.ts`: Combines `GRAVITY_VARIES`, `MAGIC_NONE`, `tech_level: "FTL"`.

### Layer 3: The Worlds (`src/worlds/`)
Concrete world instances importing presets and applying explicit mutations:
```typescript
// packages/config/src/worlds/dark_sun.ts
import { MAGIC_CONSTANTS } from '../constants/magic';
import { BaseFantasyPreset } from '../presets/fantasy';
import { WorldConfig } from '@repo/types';

export const DarkSunConfig: WorldConfig = {
  ...BaseFantasyPreset,
  meta: { id: 'athas_prime', name: 'Dark Sun' },
  alethic: {
    ...BaseFantasyPreset.alethic,
    magic_system: MAGIC_CONSTANTS.DEFILING,
  },
  axiological: {
    ...BaseFantasyPreset.axiological,
    primary_value: 'WATER',
    narrative_tone: 'GRIMDARK',
  },
  environment: {
    water_is_currency: true,
    metal_is_rare: true,
  }
} as const;
```

---

## 3. The Rule of the Knob: System Configuration vs. Database Content

To prevent configuration rot, enforce strict boundaries between what belongs in code configuration versus database storage:

| Location | Criterion | Examples |
|---|---|---|
| **`packages/config` (The Knob)** | Modifies the **Logic Kernel's internal execution pipeline** | `"max_level": 20`, `"resurrection_allowed": false`, `"currency_standard": "CERAMIC_PIECE"`, `"magic_system": "NONE"` |
| **Database / Graph (Content)** | Represents **Asset Data, Map Data, or Local Monster Stats** | `"starting_town_name": "Tyr"`, `"goblin_hp": 7`, `"door_texture": "wood.png"` |

*Principle:* Configure the **Roots**, not the leaves. Configure the **Engine**, not the game content.

---

## 4. Cross-Constraint Validation (The Inquisitor) & Campaign Overlays

A static JSON file allows internal logical contradictions. The architecture introduces active enforcement:

### A. Zod Cross-Constraint Refinements (`loader.ts`)
```typescript
import { z } from 'zod';

export const WorldSchema = z.object({
  alethic: AlethicSchema,
  deontic: DeonticSchema,
  axiological: AxiologicalSchema,
  epistemic: EpistemicSchema,
}).refine(data => {
  // Disallow impossible contradictory realities
  if (data.alethic.magic_system === 'NONE' && data.deontic.moral_feedback === 'DARK_POWERS_INTERVENTION') {
    return false;
  }
  return true;
}, {
  message: "Axiomatic Contradiction: Dark Powers cannot intervene in a universe with zero magic/metaphysical foundation."
});
```

### B. The Campaign Overlay (Mutable Reality Mutation)
Worlds are immutable code; individual gaming campaigns are mutable runs. The architecture resolves this via a two-layer overlay:
* **Layer 1:** `WorldConfig` (`packages/config` - Immutable Code, frozen in heap).
* **Layer 2:** `CampaignConfig` (Neo4j / Database - Mutable player/DM parameters).
* **Resolution Pipeline:**
  $$\text{RuntimeConfig} = \text{DeepMerge}(\text{WorldConfig}, \text{CampaignConfig})$$
  Allows local groups to adjust parameters without altering global world axioms.
