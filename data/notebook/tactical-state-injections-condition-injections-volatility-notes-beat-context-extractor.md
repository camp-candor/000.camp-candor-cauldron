# Tactical State Injections: Condition Injections, Volatility Notes & Beat-Context Extractor

A technical specification defining the beat-level temporal extraction of state changes, psychological individuation multipliers, and digital signal processing triggers for the `worker-sower` pipeline.

---

## 1. The Maximized Beat Architecture

Relying on casual prose mentions (e.g., *"Spleen shrinks, taking the humiliated tag"*) creates operational ambiguity for downstream compilers. State shifts must be machine-readable flags anchored directly to specific phases within the Tactical Triad (A/B/C).

### Structural Additions:
1. **`[VOLATILITY_NOTE]` (Engine $\longrightarrow$ Human):** Informational context surfaced when Jungian individuation friction (e.g., Spleen rejecting the `caretaker_resented` role) mathematically multiplies the Discomfort Curve baseline. It informs the showrunner why pacing is spiked without altering state on extraction.
2. **`[CONDITION_INJECTION]` (Human $\longrightarrow$ Engine):** A strict mechanical trigger specifying the exact micro-tick where an agent's state shifts: `[CONDITION_INJECTION]: [character_id: condition_id]`.

### Maximized Beat Example
```markdown
## Beat 2 — The Control Spike
**Discomfort Level:** 8
**Active Participants:** [bog, spleen]

**[VOLATILITY_NOTE]**
* Individuation Multiplier Active: Spleen is violently rejecting the 'caretaker_resented' dynamic. Discomfort baseline of 5 has been multiplied to 8.

**[REQUIRED]**
* Bog drops the logistical facade and attacks Spleen's lack of contribution.
* Spleen's nerve breaks; the casual deflection fails completely.

**Tactical Triad (A/B/C)**
* **Phase A:** Bog closes the physical distance, leveraging his swamp-green height.
* **Phase B:** Bog invokes the threat of the human spring cleaning clock, claiming Spleen's carelessness will get them caught.
* **Phase C:** Spleen's psychological defense shatters.
* **[CONDITION_INJECTION]:** [spleen: humiliated]
```

---

## 2. Schema Expansion (`schemas/scene_outline.ts`)

```typescript
import { z } from "zod";
import { CallbackThreadSchema } from "./schema";

export const ConditionInjectionSchema = z.object({
  beat_number: z.number().int().positive(),
  character_id: z.string(),
  condition_id: z.string(), // Resolves to world/conditions.md during compile
});

export type ConditionInjection = z.infer<typeof ConditionInjectionSchema>;

export const SceneFrontmatterSchema = z.object({
  id: z.string(),
  participants: z.array(z.string()).min(1),
  location: z.string(),
  escalation_stage: z.number().int().min(1).max(4),
  intensity_ceiling: z.enum(["low", "medium", "high"]),
  peak_level: z.number().int().min(1).max(10),
  callback_threads: z.array(CallbackThreadSchema),
  status: z.enum(["draft", "complete"]),
  resolution_condition: z.string().nullable(),
  linked_grievances: z.array(z.string()),
  linked_possessions: z.array(z.string()),
  tactical_conditions: z.array(ConditionInjectionSchema), // Beat-anchored state shifts
});

export type SceneFrontmatter = z.infer<typeof SceneFrontmatterSchema>;
```

---

## 3. Beat-Chunked Extraction Logic (`src/extract.ts`)

A global regex sweep loses temporal context. The parser chunks the document by `## Beat` headers so each condition is anchored to its respective beat index.

```typescript
import matter from "gray-matter";
import { SceneFrontmatter, SceneFrontmatterSchema, ConditionInjection } from "./schema";

const CONDITION_INJECTION_TAG = /\[CONDITION_INJECTION\]:\s*\[([a-z0-9_]+)\s*:\s*([a-z0-9_]+)\]/gi;

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/**
 * Extracts condition injections while maintaining their temporal beat anchor.
 */
function extractTacticalConditions(body: string): ConditionInjection[] {
  const conditions: ConditionInjection[] = [];
  const beatChunks = body.split(/^##\s+Beat\s+/im).slice(1);

  beatChunks.forEach((chunk) => {
    const beatNumberMatch = chunk.match(/^(\d+)/);
    if (!beatNumberMatch) return;

    const beat_number = parseInt(beatNumberMatch[1], 10);
    let match: RegExpExecArray | null;
    const re = new RegExp(CONDITION_INJECTION_TAG);

    while ((match = re.exec(chunk)) !== null) {
      conditions.push({
        beat_number,
        character_id: slugify(match[1]),
        condition_id: slugify(match[2]),
      });
    }
  });

  return conditions;
}

// Main extraction integration inside extract()
export function extractWithTacticalConditions(
  rawMarkdown: string,
  sceneId: string,
  previousState: SceneFrontmatter | null,
  seededRelational: { grievances: string[]; possessions: string[] }
) {
  const { content: body } = matter(rawMarkdown);
  const tactical_conditions = extractTacticalConditions(body);

  // Injected into candidate frontmatter prior to Zod validation
  const candidate = {
    // ...base fields...
    tactical_conditions,
  };

  return SceneFrontmatterSchema.parse(candidate);
}
```

---

## 4. Generator Implementation (`src/generate.ts`)

When `worker-sower` seeds the first draft, it calculates individuation friction and conditionally renders the `[VOLATILITY_NOTE]`:

```typescript
export interface GenerateInput {
  // ...base fields...
  individuationFriction?: {
    active: boolean;
    character_id: string;
    rejected_role: string;
    base_discomfort: number;
    multiplied_discomfort: number;
  };
}

export function generateBeatTemplate(input: GenerateInput, i: number, beatCount: number): string {
  let volatilityBlock = "";

  if (input.individuationFriction?.active && i === Math.floor(beatCount / 2)) {
    const f = input.individuationFriction;
    volatilityBlock = `**[VOLATILITY_NOTE]**\n* Individuation Multiplier Active: ${f.character_id} is violently rejecting the '${f.rejected_role}' dynamic. Discomfort baseline of ${f.base_discomfort} has been multiplied to ${f.multiplied_discomfort}.\n\n`;
  }

  return `## Beat ${i + 1} — [untitled]\n${volatilityBlock}**[REQUIRED]**\n* [mechanical stakes]\n\n**Tactical Triad (A/B/C)**\n* **Phase A:** [Setup]\n* **Phase B:** [Clash]\n* **Phase C:** [Fallout]\n* **[CONDITION_INJECTION]:** [character_id: condition_id]\n`;
}
```

---

## 5. Architectural Alignment

* **Downstream Audio:** When compiled, the audio microservice reads: *"Beat 2, Phase C $\longrightarrow$ Spleen acquires `humiliated`."* DSP parameters (`speed_modifier: 0.85`, `dsp_gain_db: -2.0`, trailing ellipses) apply exclusively to dialogue generated for that beat.
* **Downstream Graphics:** The viewport receives an explicit timestamped cue to swap Spleen's sprite to `posture_shrunken` on Phase C without guesswork.
