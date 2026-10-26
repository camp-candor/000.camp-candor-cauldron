# Deterministic Foley Seeding & Thread-Safe Pseudorandomness in Remotion Concurrency

A technical engineering specification detailing deterministic pseudorandom selection, seed key design, multi-thread concurrency safety, anti-repetition logic, and render-time determinism in Remotion.

---

## 1. Concurrency Mechanics & The Multi-Thread Randomness Bug

In Remotion, rendering with concurrency (e.g., `concurrency: 8`) spawns multiple isolated headless browser instances or tabs, each evaluating different frame chunks of the composition tree in parallel.

### The Failure Mode:
Using native `Math.random()` inside a Remotion composition causes catastrophic non-determinism. Because each thread evaluates frames independently:
* An audio Foley cue or visual element evaluated on Thread 2 for Frame 30 resolves to a different random value than when evaluated on Thread 5 for Frame 60.
* A single sound cue can intermittently swap audio samples between frames or render different audio files across sequential exports.
* **The Structural Law:** Native `Math.random()` is strictly forbidden inside Remotion compositions. Deterministic pseudorandomness via `random()` from `remotion` is mandatory.

---

## 2. Remotion `random()` Mechanics & The Compound Seed Key

Remotion provides a deterministic `random(seed)` API:
* **Under the Hood:** Takes a string or numeric seed, hashes the string, and feeds the hash into a deterministic **Mulberry32** pseudorandom generator.
* Given identical seeds, `random(seed)` guarantees bit-for-bit identical floats in $[0, 1)$ across all browser threads and render runs.

### Seed Key Design Pitfalls:
1. **Too Coarse (e.g., `seedKey = sceneId`):** Every random call within the scene shares the exact same seed or sequential stream position. Adding an upstream cue alters all subsequent draws, creating cascading shifts across the entire scene.
2. **Too Fine / Unstable (e.g., timestamps or dynamic array indices):** Re-ordering or re-timing beats breaks reproducibility upon regeneration.
3. **The Stability Test:** *If an unrelated sentence is edited or a new scene is inserted upstream, does this specific cue's seed key change?* If no, the key is structurally sound.

### Recommended Compound Key Schema:
```typescript
import { random } from "remotion";

function pickFromPool<T>(pool: T[], seedKey: string): T {
  const idx = Math.floor(random(seedKey) * pool.length);
  return pool[idx];
}

// Per-foley cue compound seed key:
const sampleId = pickFromPool(
  pool,
  `${sceneId}:${triadId}:${dictionaryKey}` // e.g., "SC-12:T2:ITEM_ADHESIVE"
);
```

---

## 3. Separation of Concerns: Generation-Time vs. Render-Time Resolution

To ensure complete pipeline determinism and human inspectability:

```
[ Markdown / Beat Script ]
             │
             ▼
[ Generation Time (Node.js / Agent Pass) ]
   ├── Resolves seed keys: `${sceneId}:${triadId}:${dictionaryKey}`
   ├── Executes pickFromPool() / pickVaried()
   └── Bakes concrete `sampleId` directly into SceneAudioBed JSON manifest
             │
             ▼
[ Render Time (Remotion Engine) ]
   └── Reads static `sampleId` directly from manifest (Zero RNG calls at render)
```

* **The Benefit:** The generated manifest remains a human-readable, Git-diffable artifact. Remotion reads static strings, ensuring multi-threaded concurrency processes can never diverge.

---

## 4. Anti-Repetition & Cross-Scene Variety

### A. Intra-Scene Variety (Anti-Clustering Salt)
Prevents the same audio variant from resolving twice consecutively within a single scene:
```typescript
function pickVaried<T>(pool: T[], seedKey: string, lastPick: T | undefined): T {
  let pick = pickFromPool(pool, seedKey);
  if (pick === lastPick && pool.length > 1) {
    pick = pickFromPool(pool, `${seedKey}:retry`);
  }
  return pick;
}
```

### B. Cross-Scene Deterministic Shuffled Deck
To ensure long series variety without global stateful RNGs (which cause cascading diffs when inserting scenes):
1. Shuffle each material's audio pool once using a fixed `seriesSeed`.
2. Assign each scene its variant via modular arithmetic:
   $$\text{index} = \text{sceneOrdinal} \pmod{\text{pool.length}}$$
3. Every scene's sample assignment remains immutable, predictable, and immune to upstream additions.
