# Showrunner Terminal OS: Interactive Draft Workflow & Snapshot Recovery Protocol

A operational guide mapping the interactive `blessed` terminal interface for scene drafting, grievance lotteries, and point-in-time state snapshot recovery.

---

## 1. Terminal Operating System: Step-by-Step Draft Flow

Bypassing standard Node.js CLI tools in favor of the engine's native `blessed` grid system, the showrunner interface is navigated via low-level hardware terminal inputs:

### Phase 1: Engine Boot & Menu Navigation
1. **Boot:** Run `npm run dev`. Console widget `cns00` renders: `[WORKER-SOWER] Boot sequence initiated... ✅ Init complete.`
2. **Navigation:** Press `\u001b[C` (Right Arrow) across the menu bar to focus `GOBLIN MENU`, then press `\r` (Enter) to dispatch `ActMnu.GOBLIN_MENU`.
3. **Draft Initiation:** Sub-menu focuses `Draft Scene`; press `\r` to dispatch `ActGob.DRAFT_SCENE`.

### Phase 2: The Grievance Lottery (Stage 3 Selection)
* The engine executes the Stage 3 PRNG lottery in the background, weighting raw grievance pull against Jungian Individuation Multipliers.
* `ActChc.OPEN_CHOICE` renders the top-weighted options:
  ```text
  SELECT ACTIVE GRIEVANCE TARGET:
  > [Weight: 84] spoon_credit (Bog vs. Spleen) - Stage 2
    [Weight: 76] mum_grissel_silence (Systemic) - Clock 5/6
    [Weight: 61] the_hoarded_tallow (Bog vs. Wart) - Stage 1
    [Weight: 42] splinter_gap_maintenance (Spleen) - Stage 1
    [RE-ROLL PRNG SEED]
  ```
* Pressing `\r` locks `spoon_credit`.

### Phase 3: Tactical Arena Selection
* Queries `goblin-bible/locations/` for valid adjacent arenas based on character coordinates:
  ```text
  SELECT TACTICAL ARENA:
  > Pantry Wall (Thematically linked: resource_hoarding)
    The Warm Pipe (Adjacent, low-danger)
    The Attic Stair (Adjacent, high-danger)
  ```
* Selecting `pantry_wall` locks the environment and initiates Stage 4 PRNG duel math.

### Phase 4: Resolution & Task Handoff
* The engine resolves 2d6 outcome math silently (e.g., Bog achieves a Costly Win), generates the Markdown outline in memory with `[VOLATILITY_NOTE]` blocks, and writes the draft:
  ```text
  [worker-sower] PRNG execution complete. Taxonomy: COSTLY_WIN (Bog).
  [worker-sower] Markdown draft written to /drafts/the_spoon_dispute_cycle_12.md
  [worker-sower] ClickUp subtask generated: #CU-8675309 - Showrunner Markdown Edit
  [worker-sower] Awaiting ActGob.COMMIT_SCENE...
  ```
* The engine enters an idle state, allowing the showrunner to hand-edit the Markdown draft in their local code editor.

---

## 2. Point-in-Time Recovery: The Ledger Snapshot Protocol

When calculating temporal, ballistic, and social resolutions at the micro-tick level, corrupted state mutations or flawed narrative trajectories must be instantly reversible without manual database cleanup.

### Implementation Architecture:
1. **Automated Pre-Draft Backup:**
   * In `00.goblin.unit/buz/goblin.buzz.ts`, the very first operation of `draftScene` duplicates the current compiled database:
     ```typescript
     fs.copyFileSync(
       'goblin-bible/compiled/bible-state.json',
       `worker-sower-engine/backups/bible-state_cycle_${currentCycle}.json`
     );
     ```
2. **Quarantine Rollback Execution:**
   * If an extracted scene produces unintended narrative deadlock or schema corruption, the recovery sequence is executed:
     1. Delete active `bible-state.json`.
     2. Restore the previous cycle backup (`bible-state_cycle_11.json` $\longrightarrow$ `bible-state.json`).
     3. Execute `npm run compile`.
3. **Outcome:** State is instantly restored to its pre-draft snapshot, allowing the showrunner to re-seed the PRNG lottery or modify constraints safely.
