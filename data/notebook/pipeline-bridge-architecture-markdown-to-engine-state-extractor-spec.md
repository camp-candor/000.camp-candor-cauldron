# Pipeline Bridge Architecture: Markdown-to-Engine State Extractor Spec

An architectural specification and TypeScript implementation bridging human-authored Markdown outlines with machine-validated engine state schemas.

---

## 1. System Philosophy: The Option A Pipeline

To prevent human writers from having to author brittle YAML frontmatter while preserving Zod-enforced schema validation and relational integrity:
1. **The Engine Generates:** `worker-sower` computes state (participants, escalation stage, intensity ceilings) and generates a Markdown outline skeleton.
2. **The Human Edits:** Writers work exclusively in natural Markdown (dialogue, stage directions, discomfort curve tables, `[REQUIRED]` notes).
3. **The Parser Reconstructs:** On save, `extract()` parses structural conventions from the Markdown body, reconstructs the frontmatter, verifies Zod schemas, detects drift, and compiles `bible-state.json`.

```
[ worker-sower Engine ] ──(generate)──> [ Human Markdown Outline (.md) ]
                                                        │
                                                 (Human Editing)
                                                        │
[ Compiler / State Registry ] <──(extract & diff)───────┘
```

---

## 2. Structural Field Mapping Matrix

| Engine Schema Field | Markdown Extraction Source | Parser / Logic Rule |
|---|---|---|
| `participants` | Bold all-caps speaker cues (`**RAMSES**`) | Collect unique cues, exclude reserved tags (`[REQUIRED]`, `NOTE`), slugify to match `character.id`. |
| `escalation_stage` | Discomfort Curve table (`Level` row max) | Mapped to stage 1–4 (1–3 $\rightarrow$ 1; 4–6 $\rightarrow$ 2; 7–8 $\rightarrow$ 3; 9–10 $\rightarrow$ 4). |
| `intensity_ceiling` | Discomfort Curve table (`Level` row max) | $\ge 9 \rightarrow$ `high`; $6\text{--}8 \rightarrow$ `medium`; $\le 5 \rightarrow$ `low`. |
| `peak_level` | Discomfort Curve table (`Level` row max) | Preserves raw integer (1–10) to catch drift within identical bucketed stages. |
| `callback_threads` | `Callback` table row + inline tags | Extracts `seeded_beat` and `paid_off_beat` pairs. |
| `location` | `## Setting` first bold header | Slugified location ID; validated against `/locations`. |
| `resolution_condition` | `**Resolution Condition:** [text]` | Explicit human-authored condition line below logline. |
| `status` | Trailing `*Lights fade.*` line | Present $\rightarrow$ `complete`; Absent $\rightarrow$ `draft`. |
| `linked_grievances` | Seeded IDs + inline `[[tags]]` | Preserves engine seeds; writers opt-in via `[[slug]]` syntax. |

---

## 3. TypeScript Implementation: Schema, Extractor & Generator

### 3.1 Zod State Schema (`schema.ts`)
```typescript
import { z } from "zod";

export const CallbackThreadSchema = z.object({
  id: z.string(),
  seeded_beat: z.number().int().positive(),
  paid_off_beat: z.number().int().positive().nullable(),
});

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
});

export type SceneFrontmatter = z.infer<typeof SceneFrontmatterSchema>;
export type CallbackThread = z.infer<typeof CallbackThreadSchema>;
```

### 3.2 Extractor & Drift Detection Engine (`extract.ts`)
```typescript
import matter from "gray-matter";
import { SceneFrontmatter, SceneFrontmatterSchema, CallbackThread } from "./schema";

const SPEAKER_CUE = /\*\*([A-Z][A-Z\s\-]+)\*\*/g;
const CURVE_TABLE_ROW = /\|\s*Level\s*\|([^\n]+)\|/i;
const CURVE_CALLBACK_ROW = /\|\s*Callback\s*\|([^\n]+)\|/i;
const SETTING_LOCATION_LINE = /\*\*([A-Z0-9 ,'-]{4,})\*\*/;
const RESOLUTION_CONDITION_LINE = /\*\*Resolution Condition:\*\*\s*(.+)/i;
const LIGHTS_FADE = /\*Lights fade\.\*/i;
const EXPLICIT_RELATIONAL_TAG = /\[\[([a-z0-9_]+)\]\]/g;

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function extractParticipants(body: string): string[] {
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  const re = new RegExp(SPEAKER_CUE);
  while ((match = re.exec(body)) !== null) {
    const name = match[1].trim();
    if (!/^(REQUIRED|SUGGESTED|IMPORTANT|NOTE|WARNING|CAUTION|TIP)$/i.test(name)) {
      found.add(slugify(name));
    }
  }
  return Array.from(found).sort();
}

function extractCurveLevels(body: string): number[] {
  const rowMatch = body.match(CURVE_TABLE_ROW);
  if (!rowMatch) return [];
  return rowMatch[1]
    .split("|")
    .map((cell) => cell.replace(/\*/g, "").trim())
    .filter((cell) => cell.length > 0)
    .map((cell) => parseInt(cell, 10))
    .filter((n) => !Number.isNaN(n));
}

function levelsToEscalationStage(levels: number[]): 1 | 2 | 3 | 4 {
  const max = Math.max(0, ...levels);
  if (max >= 9) return 4;
  if (max >= 7) return 3;
  if (max >= 4) return 2;
  return 1;
}

function levelsToCeiling(levels: number[]): "low" | "medium" | "high" {
  const max = Math.max(0, ...levels);
  if (max >= 9) return "high";
  if (max >= 6) return "medium";
  return "low";
}

function extractCallbackThreads(body: string): CallbackThread[] {
  const rowMatch = body.match(CURVE_CALLBACK_ROW);
  const threads: Map<string, CallbackThread> = new Map();
  if (rowMatch) {
    const cells = rowMatch[1].split("|").map((c) => c.trim());
    cells.forEach((cell, i) => {
      const beatNum = i + 1;
      if (/seeded/i.test(cell)) {
        threads.set("primary", { id: "primary", seeded_beat: beatNum, paid_off_beat: null });
      }
      if (/paid off|full reversal/i.test(cell)) {
        const existing = threads.get("primary");
        if (existing) {
          existing.paid_off_beat = beatNum;
        } else {
          threads.set("primary", { id: "primary", seeded_beat: beatNum, paid_off_beat: beatNum });
        }
      }
    });
  }
  return Array.from(threads.values());
}

export interface FieldDrift {
  field: string;
  previous: unknown;
  next: unknown;
}

export interface ExtractResult {
  candidate: SceneFrontmatter;
  drift: FieldDrift[];
  requiresConfirmation: boolean;
}

const DRIFT_THRESHOLDS: Record<string, number> = {
  escalation_stage: 1,
  peak_level: 1,
};

function diffFrontmatter(previous: SceneFrontmatter | null, next: SceneFrontmatter): FieldDrift[] {
  if (!previous) return [];
  const drift: FieldDrift[] = [];
  for (const key of Object.keys(next) as (keyof SceneFrontmatter)[]) {
    const prevVal = previous[key];
    const nextVal = next[key];
    if (typeof nextVal === "number" && typeof prevVal === "number") {
      const threshold = DRIFT_THRESHOLDS[key] ?? 1;
      if (Math.abs(nextVal - prevVal) >= threshold) {
        drift.push({ field: key, previous: prevVal, next: nextVal });
      }
      continue;
    }
    if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) {
      drift.push({ field: key, previous: prevVal, next: nextVal });
    }
  }
  return drift;
}

export function extract(
  rawMarkdown: string,
  sceneId: string,
  previousState: SceneFrontmatter | null,
  seededRelational: { grievances: string[]; possessions: string[] }
): ExtractResult {
  const { content: body } = matter(rawMarkdown);
  const participants = extractParticipants(body);
  const levels = extractCurveLevels(body);
  const escalation_stage = levelsToEscalationStage(levels);
  const intensity_ceiling = levelsToCeiling(levels);
  const peak_level = Math.max(0, ...levels);
  const callback_threads = extractCallbackThreads(body);

  const settingSection = body.split(/^##\s+Setting/im)[1];
  const locMatch = settingSection ? settingSection.match(SETTING_LOCATION_LINE) : null;
  const location = locMatch ? slugify(locMatch[1]) : null;

  if (!location) {
    throw new Error(`extract(): location missing in "## Setting" for scene "${sceneId}".`);
  }

  const resMatch = body.match(RESOLUTION_CONDITION_LINE);
  const resolution_condition = resMatch ? resMatch[1].trim() : null;
  const status = LIGHTS_FADE.test(body) ? "complete" : "draft";

  const explicitTags: string[] = [];
  let tagMatch: RegExpExecArray | null;
  const re = new RegExp(EXPLICIT_RELATIONAL_TAG);
  while ((tagMatch = re.exec(body)) !== null) {
    explicitTags.push(tagMatch[1]);
  }

  const candidate: SceneFrontmatter = {
    id: sceneId,
    participants,
    location,
    escalation_stage,
    intensity_ceiling,
    peak_level,
    callback_threads,
    status,
    resolution_condition,
    linked_grievances: Array.from(new Set([...seededRelational.grievances, ...explicitTags])),
    linked_possessions: seededRelational.possessions,
  };

  const parsed = SceneFrontmatterSchema.parse(candidate);
  const drift = diffFrontmatter(previousState, parsed);

  return {
    candidate: parsed,
    drift,
    requiresConfirmation: drift.length > 0,
  };
}
```

### 3.3 Engine Template Generator (`generate.ts`)
```typescript
import { SceneFrontmatter } from "./schema";

export interface GenerateInput {
  frontmatter: SceneFrontmatter;
  participantDisplayNames: Record<string, string>;
  locationDisplayName: string;
  grievanceCoreArgument: string;
  predictedLevels: number[];
}

export function generate(input: GenerateInput): string {
  const { frontmatter, participantDisplayNames, locationDisplayName, grievanceCoreArgument, predictedLevels } = input;
  const beatCount = predictedLevels.length;
  const levelRow = predictedLevels.map((n) => n.toString()).join(" | ");
  const callbackRow = predictedLevels
    .map((_, i) => (i === Math.floor(beatCount / 2) ? "seeded" : i === beatCount - 1 ? "paid off" : ""))
    .join(" | ");

  const participantNames = frontmatter.participants.map((id) => participantDisplayNames[id] ?? id).join(" and ");

  const beatHeaders = Array.from({ length: beatCount }, (_, i) => {
    const n = i + 1;
    return `## Beat ${n} — [untitled]\n\n*[stage direction here]*\n\n[dialogue here]\n`;
  }).join("\n---\n\n");

  return `# [SCENE TITLE]
*Scene ${frontmatter.id} — Draft v01 (engine-generated, unedited)*

---

### Logline
[one to two sentences — what happens and why it matters]

### Theme
[one line — the emotional argument, not the plot]

**Resolution Condition:** [state plainly what must happen for this grievance to resolve]

---

## Discomfort Curve

| Beat | ${Array.from({ length: beatCount }, (_, i) => i + 1).join(" | ")} |
|---|${Array(beatCount).fill("---").join("|")}|
| Level | ${levelRow} |
| Callback | ${callbackRow} |

---

## Setting

**${locationDisplayName.toUpperCase()}**

*[expand physical description from locations/${frontmatter.location}.md]*

---

${beatHeaders}

---

## Production Notes

**Grievance context** — ${grievanceCoreArgument}

**Participants** — ${participantNames}
`;
}
```