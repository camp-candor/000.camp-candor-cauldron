# HubCommander for Quintet Engine: Cross-Repo Pinning, Slack ChatOps & Media Pipeline Triage

An operational ChatOps and pipeline governance specification adapting Netflix’s HubCommander architecture to the multi-repository Quintet engine. It structures command-driven Slack control surfaces for cross-repo pin validation, release orchestration, and automated pre-render media triage.

---

## 1. HubCommander Pattern: From Org Provisioning to Multi-Repo Governance

In large enterprises (e.g., Netflix), HubCommander serves as an administrative force multiplier—allowing developers to manage GitHub organizations via Slack slash commands without granting elevated repository access to individual human accounts.

### The Solo Multi-Repo Adaptation:
For an independent system architect operating across a distributed multi-repository stack (e.g., `wiregrass-engine`, `wiregrass-bible`, `wiregrass-assets-visual`, `wiregrass-config`, `wiregrass-viewport`), the bottleneck shifts from team permission provisioning to **cross-repository boundary management**:
* **The Multi-Repo Risk:** Version drift between pinned dependencies across decoupled repositories quietly breaks runtime builds (e.g., a schema change in `config` that breaks AST parsing in `engine`).
* **The Solution:** A centralized Slack command surface executing privileged read, validation, and release pinning without requiring manual context switches into GitHub web consoles or individual local terminal directories.

---

## 2. Command Architecture & Operational Surfaces

```
[ Slack Interface: #ops-bridge ]
              │
              ├── !QuintetStatus / !PinCheck ──────► Validates Cross-Repo Dependency Tree
              ├── !QuintetTag <version> ──────────► Atomic 5-Repo Commit SHA Tagging
              ├── !MissingAssets <episode-id> ────► Pre-Render Tree-Shake Gap Detection
              └── !TrainLoRA / !PaletteCheck ─────► Local Media Pipeline Task Auditing
```

---

### Tier 1: Multi-Repository Granular Commands
Direct repository inspection without terminal navigation:
* `!Repos`: Lists all five Quintet repositories along with the timestamp and author of their latest commit.
* `!Clone <repo-name>`: Returns the active SSH clone target and active upstream branch.
* `!Branches <repo-name>`: Lists open feature and maintenance branches.
* `!PRs <repo-name> [open|closed]`: Surfaces pull request queues matching Netflix HubCommander's `!ListPRs`.
* `!Diff <repo-name> <sha1> <sha2>`: Emits an inline summary diff between two specified commit hashes.

---

### Tier 2: Cross-Repo Integrity & Pin Drift Detection (The Core Leverage)
Guarding against broken cross-repo pointers before runtime failures occur:
* `!PinCheck`: Cross-references the commit SHA pinned in the execution worker against the HEAD of the narrative bible repo. Flags dependency drift prior to Stage 1 compilation.
* `!QuintetStatus`: Outputs a unified table:
  ```
  Repository           | HEAD SHA | Last Push | Status
  ---------------------|----------|-----------|-------------------
  wiregrass-engine     | a4f8e21  | 2h ago    | Clean
  wiregrass-bible      | 9c10bb4  | 1d ago    | Pinned to Engine
  wiregrass-config     | 3e77a10  | 4h ago    | Clean
  wiregrass-assets     | f018bc9  | 3d ago    | Pinned
  wiregrass-viewport   | 88b12e0  | 6h ago    | Clean
  ```
* `!WhatChanged <repo> <since>`: Filters commit histories specifically for files crossing repository boundaries (e.g., Zod schema updates in `config` impacting character files in `bible`).

---

### Tier 3: Atomic Multi-Repo Release Orchestration
Section X determinism requires content-addressed hashes across all five repos simultaneously:
* `!QuintetTag <version-tag>`:
  * Atomically creates `<version-tag>` across the HEAD of all five repositories.
  * Compiles an immutable `render_manifest.json` snippet recording exact SHAs.
  * Dispatches the confirmed release manifest block back to the Slack channel.

---

## 3. Media Layer Pipeline Triage (Pre-Render Automation)

Automating the logistics around visual and acoustic assets without muddying the boundary between deterministic rules and generative translation:

### A. Pre-Render Asset Gap Detection (`!MissingAssets`)
* **Operational Problem:** Render pipelines breaking at 2:00 AM during final compilation because a specific emotion frame was never authored.
* **The Command:**
  * `!MissingAssets <episode-id>`: Parses the dialogue AST for `<episode-id>`, extracts all referenced sprite, viseme, and background IDs, diffs them against the assets repository, and returns a missing asset table.
  * Catches missing frames during early authoring rather than late in expensive render passes.

### B. Asset Quota & Budget Surveillance (`!AssetQuota`)
* Tracks active storage consumption against designated thresholds (e.g., 4GB total repository ceiling / 100MB per-episode budget).
* Flags which character's sprite bank or audio stem allocation is closest to breaching hardware limits.

### C. LoRA Training as an Event Loop
* `!TrainLoRA <character> <dataset-version>`: Dispatches training jobs with logged parameters (requesting user, dataset SHA, rank/alpha).
* `!LoRAStatus`: Surfaces active training step progress and estimated time to completion.
* **Automated Completion Dispatch:** Upon completion, the local training daemon posts a sample verification grid and side-by-side comparison directly into `#media-pulse`, tagged with dataset commit hashes.

### D. Automated Palette-Lock & Viseme Sanity Auditing
* `!PaletteCheck <sprite-path>`: Scans new candidate visual plates against the character's locked color palette, flagging out-of-gamut pixels before commits are pushed.
* **Viseme Sanity Dispatch:** Automatically generates a combined waveform and mouth-shape visual strip upon Stage 7 lip-sync completion, enabling rapid visual inspection in Slack before compositing.

---

## 4. Architectural Boundaries: What ChatOps Must NOT Do

Following strict systems governance principles (e.g., 002-POL-04):
1. **Zero Corpus Write Access:** The bot interface must not contain commands to generate narrative lore, force story outcomes, or modify character grievance states.
2. **Zero In-Engine Generation:** The bot does not generate character sprites or write concept art prompts. It manages asset triage, validation, and notification plumbing.
3. **Audit Trail Logging:** Consequential actions (e.g., `!HardFreeze`, `!QuintetTag`) log the requesting user's identity, timestamp, and target commit SHAs to preserve deterministic traceability.
