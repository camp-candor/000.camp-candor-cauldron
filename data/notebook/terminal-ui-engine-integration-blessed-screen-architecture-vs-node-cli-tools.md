# Terminal UI Engine Integration: Blessed Screen Architecture vs. Node CLI Tools

An architectural analysis detailing the operational integration of draft generation and extraction within `worker-sower-engine`, resolving repository isolation boundaries [001-POL-04] and terminal process conflicts.

---

## 1. Repository Boundary Mapping [001-POL-04]

Where do `generate()`, `extract()`, and the interactive showrunner authoring interface live?

* **Core Parsers & Zod Schemas (`src/parsers/`):** Belong natively inside **`worker-sower-engine`**.
  * `generate()` requires direct synchronous access to Stage 3 selection weighting, Stage 4 PRNG duel math, Spite/Cunning margins, and Paranoia Clocks.
  * `extract()` outputs candidate `SceneFrontmatter` directly to the engine's internal ledger mutation stage.
* **Registry Cross-Referencing:** Per read-only isolation boundaries, `worker-sower-engine` cannot parse raw Markdown in `goblin-bible`. Instead, `extract()` cross-references compiled JSON artifacts (`goblin-bible/compiled/locations.json`, `characters.json`) to validate foreign-key tags (`[[slug]]`).
* **Why Not `goblin-dashboard`?** The edge dashboard communicates with the engine via APIs across network boundaries. Passing draft Markdown files back and forth over HTTP introduces file-system permission hurdles and unnecessary sync latency. Draft editing operates locally on disk inside `worker-sower-engine/drafts/`.

---

## 2. The Terminal OS Paradigm Shift: Blessed vs. Standard Node CLIs

Initial concepts proposed building interactive terminal CLI tools using Commander or Inquirer.js (e.g., `npm run goblin scene:draft`). 

### The Fatal Conflict:
`worker-sower-engine` is not a standard script execution environment. It is a **standalone Terminal Operating System** built on **`blessed`** and an internal Redux-style state dispatcher (`ste.hunt()`).
* If external CLI prompt libraries (Inquirer.js, Enquirer) are executed within this environment, they fight `blessed` for control of `stdin` and `stdout`.
* This contention corrupts the terminal's alternate screen buffer (`\x1b[?1049h`), drops keypress listeners, garbles window redraws, and crashes the terminal process.

---

## 3. Native Integration into `98.menu.unit` & `00.goblin.unit`

The showrunner interface must be built natively into the engine’s existing state machine and widget architecture:

```
[ worker-sower-engine ]
         │
         ├── 00.goblin.unit (Core Simulation Loop & Orchestrator)
         │
         └── 98.menu.unit (Terminal UI Viewport & Interactive Screens)
                 │
                 ├── ActChc.OPEN_CHOICE   (Interactive grievance / location selection)
                 ├── ActPut.OPEN_INPUT    (CLI text input / Resolution Condition entry)
                 └── ActCns.UPDATE_CONSOLE (Drift detection display & confirmation prompt)
```

### Action Dispatch Implementations:
1. **Interactive Draft Selection:**
   * Uses `ActChc.OPEN_CHOICE` to render curses-based menu lists displaying active grievances off cooldown, participant rosters, and location candidates directly inside the `blessed` screen buffer.
2. **Interactive Drift Confirmation:**
   * When `extract()` returns `requiresConfirmation: true`, the engine dispatches `ActCns.UPDATE_CONSOLE` to write the field drift report directly to the terminal console widget:
     ```text
     [GOBLIN ENGINE] Drift detected in drafts/the_spoon_dispute.md:
       - peak_level: [6] -> [8]
       - escalation_stage: [2] -> [3]
     Authorize state ledger drift? [Y/N]
     ```
   * Keypress listeners (`ActPut.OPEN_INPUT`) capture user confirmation natively without hijacking terminal I/O.
3. **Execution Safety:** Preserves the hard-fail Zod verification gauntlet, supports human-in-the-loop Markdown authoring, and maintains complete UI stability within the native terminal operating system.
