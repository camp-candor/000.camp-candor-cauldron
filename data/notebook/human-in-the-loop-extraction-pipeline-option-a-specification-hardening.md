# Human-in-the-Loop Extraction Pipeline: Option A Specification & Hardening

An architectural specification defining the unidirectional generation-and-extraction workflow bridging procedural game engine state and human-edited Markdown outlines.

---

## 1. Pipeline Overview: Reversing the Labor

Instead of forcing human showrunners to manually write complex YAML frontmatter from scratch, the pipeline reverses the burden of labor:

```
[ worker-sower Engine ]
         │ (Calculates 2d6 Argument Score, selects grievance, location & actors)
         ▼
[ Stage 4.5: generate() ]
         │ (Emits human-friendly Markdown outline with Discomfort Curve & Tactical Triads)
         ▼
[ Quarantine / ClickUp Bridge ]
         │ (Raises task; human showrunner reviews and edits Markdown prose directly)
         ▼
[ On Save: extract() ]
         │ (Re-derives frontmatter, validates Zod schema, executes dry-run drift checks)
         ▼
[ Stage 5: Compiler / LLM ]
         │ (Generates finalized dialogue & renders audio/sprites from validated state)
```

---

## 2. Extraction Mapping & Failure Mode Mitigations

### The Option A Contract:
* **The Body is King:** Writers interact only with standard Markdown headings, tables, blockquotes, and prose notes.
* **Invisible State Synchronization:** The parser extracts data from structural conventions (e.g., maximum Discomfort Curve value determines `escalation_stage` and `intensity_ceiling`).
* **Failure Mode 1 Mitigation (Resolution Booleans):** Pure prose cannot safely encode strict machine triggers. An explicit, greppable line is mandated in the body: `**Resolution Condition:** [plain condition text]`.
* **Failure Mode 2 Mitigation (Silent Structural Drift):** If manual restructuring shifts numeric parameters across threshold boundaries, `extract()` flags the discrepancy for explicit confirmation rather than silently mutating state.
* **Failure Mode 3 Mitigation (Relational Foreign Keys):** Free prose cannot safely infer cross-file slugs. Relational entities (`linked_grievances`, `linked_possessions`) are seeded by the engine and passed through untouched unless the human explicitly adds bracketed tags (e.g., `[[spoon_credit]]`).

---

## 3. Production Hardening Additions

### Addition 1: Interactive CLI Confirmation Loop
Integrates `extract()` into local git pre-commit hooks or the `worker-sower` file-watcher daemon. If `requiresConfirmation` returns true, the CLI halts and demands explicit authorization:
```text
[GOBLIN ENGINE] Drift detected in scenes/the_spoon_dispute_cycle_12.md
The following machine-state variables differ from the engine's original seed:
  - peak_level: shifted from [7] to [9]
  - escalation_stage: shifted from [3] to [4]

This will permanently alter global ledger weights for this cycle.
Do you explicitly authorize this drift? (Y/n):
```

### Addition 2: Abstract Syntax Tree (AST) Parsing (Remark)
Replaces brittle regular expressions with an AST processor (`remark-parse`). Extracts speaker cues by traversing `strong` nodes filtered by uppercase content, and reads Discomfort Curve tables by matrix cell index `[row][column]`, eliminating vulnerability to whitespace, em-dashes, or Markdown heading depth changes.

### Addition 3: Mechanical Fallout Protocol (`ledger_residue`)
Extracts state consequences that write back to the global ledger upon scene resolution via dedicated Markdown tags:
```markdown
## Mechanical Fallout (Engine Use Only)
**On Success Residue:** [[bog_spite_increased]], [[spleen_individuation_stalled]]
**On Failure Residue:** [[spoon_lost]], [[spleen_nerve_shattered]]
```

### Addition 4: VS Code Workspace Tooling & Linter
* **Snippets:** Auto-expands `!beat` into valid Markdown headers and A/B/C Tactical Triads.
* **Syntax Highlighting:** TextMate rules highlighting `[[slug]]` foreign keys in bright orange.
* **Real-time LSP Linter:** Surfaces red squiggly underlines directly over the Discomfort Curve table if non-numeric characters are entered.

### Addition 5: Pre-Extraction State Synchronization (Stale Outline Guard)
Before validating extracted frontmatter, `extract()` cross-references active IDs in `bible-state.json`. If a location or participant was modified or deprecated in the global corpus while the task sat idle in ClickUp quarantine, the parser throws a **Stale Generation Error** preventing orphaned data injection.
