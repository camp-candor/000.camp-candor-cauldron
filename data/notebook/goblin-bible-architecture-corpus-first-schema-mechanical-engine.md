# Goblin-Bible Architecture: Corpus-First Schema & Mechanical Engine

A comprehensive technical breakdown of the `goblin-bible` repository: its architectural philosophy, compiler validation gauntlet, directory schemas, and mechanical implications for procedural drama engines.

---

## I. Architectural Philosophy: "Corpus-First Prioritization"

The `goblin-bible` is not a lore wiki, creative prompt pack, or casual worldbook. It is a strictly typed, machine-readable relational database wearing a Markdown trenchcoat. It serves as the absolute, immutable source of truth for automated narrative engines (such as `worker-sower`), non-interactive graphics display viewports (palette-locked sprite rendering), and audio synthesis microservices (DSP parameter injection).

### Core World Aesthetic
* **Setting:** A gothic domestic melodrama set in a claustrophobic, candlelit paper-puppet dollhouse.
* **Tone:** Rotting, oppressive, and humid, mirroring the physical reality of a decaying South Georgia under-floor crawlspace during peak summer.
* **Themes:** Psychological enmeshment and Carl Jung’s individuation struggle (characters attempting to establish autonomous identity against overbearing familial roles).

### The Two-Part File Structure
To prevent generative models from hallucinating anachronistic technology, breaking tone, or inventing arbitrary outcomes, every file combines:
1. **The YAML Frontmatter:** Rigid, Zod-validated key-value pairs read by deterministic mathematical engines (calculating Argument Scores, ticking Paranoia Clocks, weighting Stage 3 selection lotteries).
2. **The Prose Sections:** Highly constrained, targeted text blocks injected directly into Director Prompts to guarantee voice consistency and emotional continuity.

### The Compiler (`compile.ts`)
The repository is compiled into `bible-state.json` via a strict two-pass gauntlet:
* **Pass 1 (Shape Validation):** Uses `gray-matter` to isolate frontmatter and validates it against Zod schemas. If a type mismatch occurs, it throws a fatal error.
* **Pass 2 (Relational Integrity):** Audits all pointers and foreign keys. If an asset claims an owner not found in `/characters`, or a grievance points to a missing location, the compiler triggers a **Hard Fail** and refuses to output `bible-state.json`.

---

## II. Directory Schemas & Mechanical Implications

### 1. `/characters` (The Cast)
Contains the primary actors (e.g., `bog.md`, `spleen.md`, `wart.md`, `mum_grissel.md`).
* **Jungian Individuation & Volatility:** Relationships track directional defaults (`given` vs. `received`). When an agent resists an assigned role, volatility spikes, biasing the selection camera toward their defiance.
* **Key Fields:**
  * `base_stats` (`spite`, `cunning`, `charm`, `nerve`, `warmth`): Injected into 2d6 Argument Score resolution logic.
  * `pending_showrunner_task`: When populated with a string (e.g., `"class_shift_150"`), the engine halts the character's progression and dispatches an asynchronous ClickUp ticket.
  * `lora_trigger_tokens`: Exact strings consumed by graphics viewports to render consistent layered `.png` sprites.

### 2. `/grievances` (The Conflict Engine)
Contains active conflict state machines (minimum 40 active files required).
* **The "Four-Outcome-Scenes Test":** Every grievance must mathematically support four distinct scene resolutions: *Clean Win*, *Costly Win*, *Mutual Wound*, and *Backfire*.
* **Key Fields:**
  * `escalation_stage` (1–4): Integer multiplying gravitational pull during scene selection lotteries.
  * `current_cooldown_cycles`: Halved if a duel concludes in a `Withdrawal` (unresolved suppression explodes faster).
  * `category`: Checked against active location affinities to apply spatial domain multipliers.

### 3. `/locations` (Spatial Geography & Arenas)
Tactical arenas dictating physical and environmental constraints.
* **Key Fields:**
  * `ambient_clock_modifiers`: Adds tick probabilities to systemic Paranoia Clocks when scenes occur in exposed perimeters.
  * `vulnerable_caches`: Boolean indicating whether a Costly Win or Backfire destroys or exposes cached possessions.
  * `adjacent_to`: Enforces physical traversal rules, preventing character teleportation.

### 4. `/possessions` (Material Economy)
Load-bearing leverage artifacts, tracking ownership, theft flags, condition states, and linked grievances.

### 5. `/world` (Single-Source Taxonomies & Physics)
* `world/conditions.md`: Single source mapping emotional states directly to audio DSP parameters (speed modifiers, temperature, gain dB) and syntactic prompt constraints (e.g., `humiliated` forcing ellipses and trailing sentences in TTS).
* `world/clocks.md`: Systemic dread tracking (Paranoia Clocks) enforcing max segments, tick conditions, and crisis events (e.g., `human_spring_cleaning`, `mum_grissel_silence`).
* `world/mythology.md`: Central irony definition and hard negative constraints (banning modern plastics, phones, electricity).
* `world/season-plans/`: Governs macro spine pacing and statistical selection weights across acts.

---

## III. Governance, Retirement & Architectural Expansions

* **ClickUp Bridge Loop:** Quarantines character state upon milestone triggers, creates high-priority ClickUp sprint tasks, waits for human authoring, and re-validates data schemas prior to unfreezing the simulation.
* **Retirement Protocol (`_retired/`):** Resolved grievances and destroyed artifacts are moved to an archival folder with frontmatter annotations, preserving historical audit trails without polluting active cycle pools.
* **Canonical Ledger Hash:** SHA-256 signing of `bible-state.json` embedded into output files to guarantee cryptographic reproducibility.
* **Banned Lexicon Manifest (`world/dietary-restrictions.md`):** Negative token arrays injected into bottom prompt positions to prevent modern colloquialisms.
* **Dependency Graph Visualizer (`npm run map-bible`):** Script parsing relational graphs into Mermaid.js/D3.js to audit ensemble balance and narrative bottlenecks.
