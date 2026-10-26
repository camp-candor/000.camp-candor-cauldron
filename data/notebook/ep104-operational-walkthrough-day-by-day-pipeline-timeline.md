# Episode 104 Production Lifecycle: Day-by-Day Pipeline Walkthrough

A continuous, end-to-end timeline tracing a single ~22-minute episode (`EP104: The Betrayal`) through all 23 Pods, lists, fields, and automated event gates.

---

## DAY 1 — Intent, Script & Continuity Gate

### Hour 0: Showrunner Sets Intent (Pre-ClickUp)
- **Action:** Showrunner issues high-level episode intent to Narrative: *"Episode 4: The protagonist discovers the betrayal. This is the emotional midpoint of the season."*
- **ClickUp State:** None.

### Hour 1: Narrative List Task Creation
- **List:** `02 - BLUEPRINT / Narrative`
- **Task Created:** `EP104 - Full Script Draft`
- **Status:** `Drafting`
- **Fields:**
  - `Pod ID`: `POD-08`
  - `Criticality Tier`: `2 - Foundational`
  - `Contract Status`: `Draft`
  - `Spec Version`: `v1.1`

### Hours 1–6: Drafting & Scene Breakdown
- **Action:** Writer drafts prose and prompt annotations directly in the task’s attached Doc.
- **Sub-tasks Created:** `EP104_SC01` through `EP104_SC08`.
- **Status:** Stays `Drafting`.

### Hour 6: Showrunner Back-Brief
- **Status Transition:** `Drafting` $\longrightarrow$ `Showrunner Back-Brief`
- **Action:** Comment ping posted tagging Showrunner: *"Ready for review — does this land the betrayal reveal as the midpoint?"*

### Hour 8: Showrunner Approval & Handshake to Continuity
- **Action:** Showrunner approves in-app via comment.
- **Status Transition:** `Showrunner Back-Brief` $\longrightarrow$ `Continuity/Canon Review`
- **Automation Fired:** Linked task auto-created in `02 - BLUEPRINT / Continuity/Canon` as `EP104 - Canon Check` (`Status: Open`).

### Hours 8–14: Continuity/Canon Pass (POD-11 Hard Gate)
- **List:** `Continuity/Canon` (`Open` $\rightarrow$ `Automated Pass` $\rightarrow$ `Human Review` $\rightarrow$ `Pass/Fail`)
- **Automated Pass:** Flags two candidate contradictions against the story-state ledger.
- **Human Review:** Canon Editor reviews candidates:
  - Flag 1: Intentional callback (false positive, dismissed).
  - Flag 2: Prop continuity error (genuine contradiction).
- **Action:** Canon Editor posts ledger citation comment on the original `EP104 - Full Script Draft` task.

### Hour 14: Narrative Revision
- **Action:** Writer applies revision to resolve prop error.
- **Status Transition:** `Continuity/Canon Review` $\longrightarrow$ `Drafting` (briefly) $\longrightarrow$ `Continuity/Canon Review`.

### Hour 22: Canon Certification & Script Publication (Within 1-Business-Day SLA)
- **Action:** Canon Editor signs off. `EP104 - Canon Check` $\longrightarrow$ `Pass`.
- **Status Transition:** `EP104 - Full Script Draft` $\longrightarrow$ `Locked & Published`.
- **Automation Fired (Step 8, Rule #1):** Automatically instantiates linked downstream initiation tasks:
  1. `Foundation`: `EP104 - Asset Requirements`
  2. `Audio`: `EP104 - Dialogue Track`
  3. `Pre-Vis & Animatic`: `EP104 - Animatic`

---

## DAY 2 — Parallel Pre-Production (Foundation & Audio)

### Hour 24: Asset & Audio Tasks Activated

#### Foundation Stream:
- **List:** `02 - BLUEPRINT / Foundation`
- **Task:** `EP104 - Asset Requirements`
- **Status:** `Concepting / Prompt Testing`
- **Scope:** Existing characters already locked; requires 1 new environment LoRA for the betrayal set.
- **Fields Configured:**
  - `Asset Type`: `Environment LoRA`
  - `Somatic Prompt Triggers`: `abandoned rail substation, shafts of dying sunlight, rust and concrete, pitted rebar, [negative: clean, modern, warm lighting]`

#### Audio Stream (Runs in Parallel, Independent of Foundation):
- **List:** `02 - BLUEPRINT / Audio`
- **Task:** `EP104 - Dialogue Track`
- **Status:** `Received Input`
- **Sub-tasks Created:** Per-scene dialogue passes with `TTS Model Used` and `Voice Clone / Speaker ID` pre-populated from performer contracts (POD-04).

### Hours 26–34: Environment LoRA Training
- **Status Transitions:** `Concepting / Prompt Testing` $\longrightarrow$ `Turnaround / Orthographic Ready` $\longrightarrow$ `Rigged / LoRA Trained`
- **Internal Back-Brief:** Test-batch generations evaluated across lighting angles. Art Director approves in-thread.

### Hours 28–36: Voice Synthesis & Pacemaking
- **Status Transitions:** `Received Input` $\longrightarrow$ `In Progress` $\longrightarrow$ `Internal Back-Brief` (3-second snippet delivery test attached) $\longrightarrow$ `Submitted for Sign-off`.

### Hour 36: Audio Sign-Off ("Eyes Closed" Review)
- **Action:** Showrunner listens with eyes closed; approves pacing, atmosphere, and cadence.
- **Status Transition:** `Submitted for Sign-off` $\longrightarrow$ `Published`.
- **Fields Finalized (Audio Recipe Book):**
  - `Pacing / Pitch Modifiers`: `-10% speed on betrayal-reveal line, +8% breathiness`
- **Automation Fired:** Unblocks audio dependency on `Pre-Vis & Animatic: EP104 - Animatic`.

### Hour 38: Foundation Asset Locked
- **Status Transition:** `Rigged / LoRA Trained` $\longrightarrow$ `Production Approved`.
- **Automation Fired:** Tags `Scene Pods` watchers with R2 model weight link.

---

## DAY 3 — Pre-Vis & Animatic Pacing Proof

### Hour 40: Animatic Work Commences
- **List:** `02 - BLUEPRINT / Pre-Vis & Animatic`
- **Task:** `EP104 - Animatic`
- **Dependencies Cleared:** Locked Script (Narrative) + Locked Audio (Audio) confirmed via ClickUp Dependencies.
- **Status:** `Received Input` $\longrightarrow$ `In Progress`.

### Hours 40–46: Rough Blocking & Cutting
- **Action:** Pre-Vis Artist blocks 8 scenes using low-step generation and rough environment plates; Timing Specialist cuts blocks to locked audio.

### Hour 46: Animatic Review & Pacing Dispute
- **Status Transition:** `In Progress` $\longrightarrow$ `Submitted for Sign-off`.
- **Review:** Showrunner reviews cut; flags Scene 5 (the betrayal reveal) as pacing too slow.

### Hour 47: Revision Cycle 1 (3-Cycle Standard Enforced)
- **Action:** Status reverts to `In Progress`. Scene 5 re-cut and resubmitted.
- **Cycle Metric:** Task field `Cycle Count` increments to `1` (if this reaches 3, `escalate-per-standard` tag auto-applies).

### Hour 50: Animatic Locked & Published
- **Status Transition:** `Submitted for Sign-off` $\longrightarrow$ `Published`.
- **Automation Fired:** Automatically instantiates:
  1. `Scene Pods`: 8 shot tasks (`EP104_SC01` through `EP104_SC08`).
  2. `Score & Composition`: `EP104 - Score Spotting`.

---

## DAYS 4–7 — Generative Core Factory Floor

### Day 4, Hour 56: Scene Pod Tasks Initialized
- **List:** `03 - GENERATIVE CORE / Scene Pods`
- **Tasks Created:** 8 scene render tasks with pre-populated fields:
  - `Shot Code` (e.g., `EP104_SC05_SH001`)
  - `Shot Duration`
  - `Visual Complexity`: Scene 5 set to `5` (emotional close-up, high density); others set to `2–3`.
- **Status (All 8):** `Prompt / Seed Hunting`.

### Day 4, Hour 58: Scene 5 Keyframe Back-Brief
- **Action:** Tech Artist renders keyframe preview on target seed/prompt. Pod Lead confirms emotional dread.
- **Status Transition:** `Prompt / Seed Hunting` $\longrightarrow$ `ControlNet / Motion Pass`.

### Day 4, Hour 60 to Day 5, Hour 10: Impulse Timing Loop Render
- **Action:** ComfyUI generates in 0.5-second (12-frame) seeded increments.
- **Status:** Stays `ControlNet / Motion Pass` (dark autonomous execution).

### Day 5, Hour 10: Render Completion & Edge Automation Fired (Step 8a)
- **Mechanism:** Local directory watcher detects finished directory `/renders/EP104_SC05_SH001/`.
- **API Execution:** Python daemon executes `POST https://api.clickup.com/api/v2/task/{task_id}`:
  1. Auto-advances status to `Temporal Smoothing / Deflicker`.
  2. Uploads compressed proxy `.mp4` directly to ClickUp task attachments.
  3. Pings dashboard watchers without human manual input.

### Day 5, Hour 12: Deflicker & Polish Handoff
- **Status Transition:** `Temporal Smoothing / Deflicker` $\longrightarrow$ `Inpainting / Detail Fixes`.
- **Automation Fired:** Auto-creates linked cleanup task in `03 - GENERATIVE CORE / Polish`: `EP104_SC05_SH001 - Cleanup`.

### Day 5, Hour 14: Polish Cleanup Pass
- **List:** `Polish` (`Received` $\rightarrow$ `Correcting` $\rightarrow$ `Re-Review` $\rightarrow$ `Cleared`)
- **Action:** QA Reviewer flags hand anomaly; VFX Artist runs localized inpainting mask. Re-review verifies clean frame.
- **Status Transition:** `Polish` task $\longrightarrow$ `Cleared`.
- **Automation Fired:** Upstream `Scene Pods` task `EP104_SC05_SH001` auto-advances to `Final Comp & Grade`.

### Days 5–6: Batch Progression of Remaining Shots
- **Scenes 1–4, 6–8:** Lower complexity tasks progress through pipeline, clearing into `Final Comp & Grade` by Day 6, Hour 40.
- **Score Parallelism:** `Score & Composition` executes `EP104 - Score Spotting` against the locked animatic concurrently.

### Day 6, Hour 44: All Shots Concluded
- **Condition:** All 8 shot tasks in `Scene Pods` reach `Final Comp & Grade`.
- **Automation Fired:** Unblocks `04 - SUPPLY CHAIN / Assembly: EP104 - Episode Assembly` from `Received Input`.

---

## DAY 7 — Editorial Assembly & Spotting Reconciliation

### Hour 48: Timeline Ingestion
- **List:** `04 - SUPPLY CHAIN / Assembly`
- **Task:** `EP104 - Episode Assembly`
- **Status Transition:** `Received Input` $\longrightarrow$ `In Progress`.
- **Action:** Editor conforms 8 finished shots, locked audio, and animatic timeline shell.

### Hour 50: Color Harmonization & Pacing Drift
- **Action:** Global LUT grade harmonizes disparate renders.
- **Discovery:** Scene 5 final footage runs 2 seconds longer than rough animatic blocking.

### Hour 51: Score Timing Reconciliation (Parallel Coordination)
- **Coordination:** Comment thread between Assembly and Score tasks flags the 2-second tail need.
- **List:** `Score & Composition` task `EP104 - Score Spotting` temporarily reopens to `In Progress`, adjusts stems, delivers updated file, returns to `Published`. (Cycle 1 of 3-cycle threshold; resolved immediately).

### Hour 54: Assembly Dual Back-Brief Pass
- **Status Transition:** `In Progress` $\longrightarrow$ `Internal Back-Brief`.
- **Review 1 (Creative):** Showrunner checks pacing and dramatic impact $\rightarrow$ Approved.
- **Review 2 (Technical):** Supply Chain Lead checks format, coverage, and timecode sync $\rightarrow$ Approved.
- **Status Transition:** `Internal Back-Brief` $\longrightarrow$ `Published`.
- **Automation Fired:** Linked tasks auto-created across `Localization & Accessibility`, `Mastering & QC`, and `Metadata & Ingestion`.

---

## DAY 8 — Supply Chain Finishing & Studio Ingestion

### Hour 60: Localization & Accessibility Execution
- **List:** `04 - SUPPLY CHAIN / Localization & Accessibility`
- **Tasks:** `EP104 - Spanish Dub`, `EP104 - Captions`, `EP104 - Audio Description`.
- **Status:** `Received Input` $\longrightarrow$ `In Progress` $\longrightarrow$ `Published` (completed by Hour 66).

### Hour 66: Broadcast Conformance (Mastering & QC)
- **List:** `04 - SUPPLY CHAIN / Mastering & QC`
- **Tasks:** `EP104 - Master (Original)` and `EP104 - Master (Spanish)`.
- **Rule Enforced:** Independent compliance verification per variant (no inherited pass).
- **Action:** Dolby Vision HDR conformance, -24 LKFS loudness normalization, clean M&E stem isolation.
- **Status Transition:** `In Progress` $\longrightarrow$ `Published`.

### Hour 70: Studio Manifest & Aspera Handshake
- **List:** `04 - SUPPLY CHAIN / Metadata & Ingestion`
- **Task:** `EP104 - Studio Delivery`
- **Action:** MovieLabs Media Manifest Core (MMC) XML constructed; local validation confirms case sensitivity; Aspera transmission initiated.
- **Handshake Confirmation:** Warner Bros. Discovery Content Partner Hub intake servers validate and accept the package.
- **Status Transition:** `In Progress` $\longrightarrow$ `Transmitted` $\longrightarrow$ `Confirmed Delivered`.

### Hour 71: Studio Milestone Cleared
- **List:** `01 - STUDIO FIREWALL / Network Gateway`
- **Action:** `EP104 - Delivery Confirmation` auto-updates from Metadata confirmation.
- **Outcome:** Executive dashboard registers delivery milestone complete.

---

## Summary Metrics
* **Total Elapsed Timeline:** 8 calendar days (71 tracked pipeline hours).
* **Scope Completed:** 1 full 22-minute episode, 8 scenes, 61 character universe coherence, 2 language masters, 100% TPN and MMC compliance.
