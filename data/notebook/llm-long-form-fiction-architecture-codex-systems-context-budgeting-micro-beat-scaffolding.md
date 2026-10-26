### LLM Long-Form Fiction Architecture: Codex Systems, Context Budgeting & Micro-Beat Scaffolding
An architectural guide to authoring long-form fiction and screenplays with Large Language Models, covering persistent dynamic Codex design, context window token budgeting, micro-beat scaffolding, and subtext injection.

--------------------------------------------------------------------------------

#### 1. The Core Writing Philosophy: The "Script Lab" Model
Treating an LLM as a "push-button novel generator" results in cliché-ridden purple prose, pacing collapse, and zero subtext within three chapters. Professional authors and screenwriters treat the model as a hyper-literate writing room, lore bible, and prose drafting engine bound by strict structural scaffolding:
*   **Future Fiction Academy (FFA):**  The technical standard for multi-model fiction pipelines (e.g., using Claude 3.5 Sonnet for sensory prose and nuance; GPT-4o for structural logic; local open weights for unconstrained exploration).
*   **Novelcrafter Community:**  Pioneered the decoupled architecture: separating a persistent  **Codex**  (world bible) from scene micro-beats and generation engines to maintain continuity across 90,000+ words.
*   **Screenwriting Adaptation:**  In screenwriting pipelines (Fountain, Highland), LLMs are constrained strictly to scenario stress-testing, table-read simulations, and generating punchy dialogue options against established structural frameworks ( *Save the Cat!* ,  *Story Grid* ).
```
[Master Codex / Lore Bible]
            │
            ▼
[Dynamic Context Injection (Entity Triggering)]
            │
            ▼
[Micro-Beat Scaffolding (~400–500 words per beat)]
            │
            ▼
[Negative Constraints & Syntactic Calibration]
            │
            ▼
[Human Line Polish & Subtext Restoration]

```

--------------------------------------------------------------------------------

#### 2. The Dynamic Codex: Schema & State Mutation
An LLM’s context window is working memory, not permanent storage. Dumping entire worldbooks dilutes attention and triggers hallucination. The Codex decouples immutable truths from mutable narrative states:
##### A. Entity Schema (Static Core vs. Dynamic State)
Each Codex card is capped at  **150 to 300 words** :
```yaml
### ENTITY: Silas Vance
Type: Character
Aliases: [Silas, Vance, The Marshal]
Status: Active

[STATIC CORE]
Role: Disillusioned county investigator.
Voice & Cadence: Laconic, gravelly, dry. Short sentences. Never uses academic vocabulary or asks rhetorical questions.
Physical Baseline: Tall, heavy-set, missing left index finger, limp from buckshot wound.
Core Psychological Wound: Blames himself for the flooding of the lower valley reservoir ten years ago.

[DYNAMIC STATE - CURRENT: ACT II, CH 14]
Location: Blackwood Timber Mill.
Current Objective: Locate the ledger before Mercer's crew burns the office.
Active Relationships:
  - Mercer: Sworn enemy; Vance shot Mercer's brother in Ch 8.
  - Clara: Tense ally; suspects Vance is withholding evidence.
Physical/Mental Condition: Cracked rib from Ch 12; running on black coffee and adrenaline.
Inventory: Standard-issue .38 revolver (3 rounds left), brass zippo, water-damaged notebook.

```
##### B. State Mutation Protocols
*   **Log Deltas, Not Histories:**  Never record 500-word chapter recaps in a character card. Only log net deltas: injuries sustained, secrets exposed, weapons lost, alliances shifted.
*   **Act-Based Checkpoints:**  Update dynamic states at major structural milestones (every 3–5 chapters or major turning points), not sentence-by-sentence.
*   **The "One-In, One-Out" Rule:**  Enforce a maximum of 3–4 bullet points in dynamic fields (Inventory, Condition, Relationships). Adding a new item or wound requires trimming an obsolete detail to protect context focus.

--------------------------------------------------------------------------------

#### 3. Trigger & Retrieval Architecture
| Activation Type | Scope | Retrieval Mechanism | Ideal Use Cases |
| ------ | ------ | ------ | ------ |
| **Always-On (Global)** | 1–2 cards max | Permanently pinned in system prompt. | Master Style Sheet; Core Physics/Magic Rules; Tone Mandates. |
| **Keyword / Alias Trigger** | Scene-specific | Engine scans the upcoming micro-beat text. If "Silas" or "The Marshal" appears, the card loads into active context. | Characters, distinct weapons, signature props, recurring vehicles. |
| **Location Containers** | Hierarchical | Activating a location card automatically loads parent environmental rules (e.g., loading  *Blackwood Mill*  injects  *Lowland Swamp Weather* ). | Environments, factions, local customs. |


--------------------------------------------------------------------------------

#### 4. Context Window Token Budgeting (8k–16k Working Window)
```
┌────────────────────────────────────────────────────────┐
│ 1. System Prompt & Style Directives (400 - 600 tokens) │
├────────────────────────────────────────────────────────┤
│ 2. Active Scene Codex Cards (800 - 1,500 tokens)       │  <-- Max 3-5 relevant cards
├────────────────────────────────────────────────────────┤
│ 3. Rolling Story Recap / Previous Beat (500 tokens)    │  <-- Immediate continuity
├────────────────────────────────────────────────────────┤
│ 4. Current Scene Micro-Beats (300 - 500 tokens)        │  <-- Specific blocking instructions
├────────────────────────────────────────────────────────┤
│ 5. Working Generation Space (4,000+ tokens)            │  <-- Clean room for prose generation
└────────────────────────────────────────────────────────┘

```

--------------------------------------------------------------------------------

#### 5. Micro-Beat Scaffolding Architecture
Never prompt an LLM to write an entire chapter at once. Break chapters into discrete  **300- to 500-word micro-beats**  using a structured YAML/Markdown template:
```markdown
### SCENE CONTEXT
- Scene ID: [Act.Chapter.Scene]
- POV Character: [Entity ID] (Third-Person Limited, Past Tense)
- Location: [Location Entity ID]
- In-Scene Entities: [Entity ID 1], [Entity ID 2]
- Target Output: ~400–500 words

### PRE-STATE (Where we are right now)
- Narrative Bridge: [1-2 sentences summarizing the previous beat's end]
- POV Immediate State: [Physical pain, adrenaline, active tool in hand]

### BEAT EXECUTION: BEAT [X] OF [Y]
- Dramatic Goal: [What the POV character is actively pursuing in this 400-word span]
- Active Friction: [Immediate physical or interpersonal obstacle]
- Sensory Palette:
  * Sight: [1 specific visual detail]
  * Sound: [1 distinct acoustic layer]
  * Tactile/Smell: [1 concrete physical texture or odor]
- Action Beats:
  1. [Step 1: Physical entrance or gesture]
  2. [Step 2: Tactical dialogue or environmental interaction]
  3. [Step 3: Complication or tactical shift]
- Subtext & Dialogue Constraints:
  * [What must NOT be spoken aloud]
  * [Speech rhythm rule: e.g., clipped, halting, monosyllabic]
- Exit Condition: [The exact physical action or revelation that ends this beat]

```
##### Key Mechanical Laws of Micro-Beats:
*   **Numbered Action Steps:**  Bulleted or paragraph instructions cause models to collapse or skip steps. Numbered steps force the engine to write through physical blocking sequentially.
*   **The Exit Condition:**  The most critical boundary. Without an explicit exit condition, the model will attempt to resolve the entire multi-scene conflict within 400 words. The exit condition tells the engine exactly where to cut generation.
*   **Sensory Palette Bounding:**  Restricting sensory details to three explicit bullets prevents stock AI filler ( *"shadows danced"* ,  *"air hung heavy with tension"* ).
*   **Negative Constraints & Subtext Restoration:**  LLMs naturally externalize all interiority, making characters announce their exact emotions. The human pass deletes on-the-nose dialogue, replaces exposition with deflective physical gestures, and restores varied sentence cadence.
