# ClickUp Production System: Full Build Manual & Implementation Guide

A step-by-step engineering manual for deploying the 23-pod organizational framework and Wiregrass generative pipeline into ClickUp.

---

## Step 1: Create and Configure the Space

1. Click **+ New Space** in ClickUp.
2. Name the space: `🎬 [SERIES NAME] // PRODUCTION` (e.g., `🎬 WIREGRASS // PRODUCTION`).
3. Select **Start from scratch** (bypass default templates).
4. Under **Space Settings → ClickApps / Capabilities**, ensure the following are enabled:
   - **Custom Fields**
   - **Dependencies** (Task relationships)
   - **Dashboards**
   - **Automations**

---

## Step 2: Create the Four Macro-Node Folders

Inside the Space, create four Folders with numerical prefixes to preserve pipeline sequence rather than alphabetical sorting:
1. `01 - STUDIO FIREWALL`
2. `02 - BLUEPRINT`
3. `03 - GENERATIVE CORE`
4. `04 - SUPPLY CHAIN`

---

## Step 3: Create the 23 Pod Lists

Populate each folder with its corresponding Lists:

### Inside `01 - STUDIO FIREWALL`:
- `Legal & Provenance` (POD-01)
- `Network Gateway` (POD-02)
- `Finance & Accounting` (POD-03)
- `Security & InfoSec` (POD-09)
- `Data Ops & Lifecycle` (POD-06)
- `Campaign Strategy` (POD-21)
- `Press & Communications` (POD-23)

### Inside `02 - BLUEPRINT`:
- `Narrative` (POD-08)
- `Foundation` (POD-07)
- `Talent & Casting` (POD-04)
- `Pre-Vis & Animatic` (POD-14)
- `Audio` (POD-05)
- `Score & Composition` (POD-16)
- `Continuity/Canon` (POD-11)

### Inside `03 - GENERATIVE CORE`:
- `Scene Pods` (POD-15)
- `Polish` (POD-13)
- `Marketing Creative` (POD-22)
- `Motion Graphics & Typography` (POD-20)

### Inside `04 - SUPPLY CHAIN`:
- `Assembly` (POD-10)
- `Localization & Accessibility` (POD-17)
- `Mastering & QC` (POD-18)
- `Metadata & Ingestion` (POD-19)
- `Infrastructure` (POD-12)

---

## Step 4: Build Space-Level Custom Fields

Navigate to **Space Settings → Custom Fields → Create Field**. Define the following global fields so they populate every task across all 23 Lists:

| Field Name | Type | Options / Format / Notes |
|---|---|---|
| **Pod ID** | Text | e.g., `POD-15`, `POD-07` |
| **Criticality Tier** | Dropdown | `1 - Existential`<br>`2 - Foundational`<br>`3 - Structural`<br>`4 - Compliance & Delivery`<br>`5 - Amplification` |
| **Pod Lead** | Person / Text | Lead responsible for signing off on back-briefs |
| **Spec Version** | Text | e.g., `v1.0`, `v1.1` |
| **Contract Status** | Dropdown | `Draft`, `Locked`, `Superseded` |
| **Upstream Blocker** | Relationship (Task) | Links to the specific blocking task in another List |

---

## Step 5: Configure List-Specific Custom Fields

Add dedicated technical fields to specific Lists:

### 1. `Foundation` List (POD-07):
- **Asset Type** (Dropdown): `Character LoRA`, `Environment LoRA`, `Style Embedding`
- **Somatic Prompt Triggers** (Long Text): Positive and negative token vectors distilled from 10-phase character bibles.

### 2. `Audio` List (POD-05):
- **TTS Model Used** (Text): e.g., `Parler-TTS v0.1`, `Chatterbox`
- **Voice Clone / Speaker ID** (Text): Unique performer seed/reference ID.
- **Pacing / Pitch Modifiers** (Text): e.g., `-15% speed, +5% breathiness, gravelly drawl`.

### 3. `Scene Pods` List (POD-15):
- **Shot Code** (Text): Format `EP101_SC02_SH005`
- **Shot Duration** (Number): Duration in seconds.
- **Visual Complexity** (Rating 1–5): Render budget/pass weighting.

---

## Step 6: Configure List Statuses (Workflows)

Navigate to each List's settings and configure custom status sequences:

### A. `Scene Pods` List:
`Prompt / Seed Hunting` $\longrightarrow$ `ControlNet / Motion Pass` $\longrightarrow$ `Temporal Smoothing / Deflicker` $\longrightarrow$ `Inpainting / Detail Fixes` $\longrightarrow$ `Final Comp & Grade` $\longrightarrow$ `Closed / Done`

### B. `Foundation` List:
`Concepting / Prompt Testing` $\longrightarrow$ `Turnaround / Orthographic Ready` $\longrightarrow$ `Rigged / LoRA Trained` $\longrightarrow$ `Production Approved` $\longrightarrow$ `Deprecated / Archived`

### C. `Narrative` List:
`Drafting` $\longrightarrow$ `Showrunner Back-Brief` $\longrightarrow$ `Continuity/Canon Review` $\longrightarrow$ `Locked & Published`  
*(Note: Directly enforces the POD-11 hard gate; a script cannot bypass Continuity/Canon review).*

### D. `Audio`, `Assembly`, `Mastering & QC`, `Metadata & Ingestion` Lists:
`Received Input` $\longrightarrow$ `In Progress` $\longrightarrow$ `Internal Back-Brief` $\longrightarrow$ `Submitted for Sign-off` $\longrightarrow$ `Published`

### E. All Other Lists:
Default standard sequence: `Open` $\longrightarrow$ `In Progress` $\longrightarrow$ `Blocked` $\longrightarrow$ `Done`

---

## Step 7: Encode Task Dependencies

For each formal input/output contract defined in Section 4 of each Pod specification:
1. Open a task (e.g., in `Scene Pods`, a specific shot task `EP101_SC02_SH005`).
2. Click **Relationships → Depends on**.
3. Link the dependency to the corresponding upstream task (e.g., Pre-Vis animatic task for Scene 2, and Foundation LoRA task for Billie Fae).
4. Do not begin downstream execution until upstream dependencies show `Locked & Published` or `Production Approved`.

---

## Step 8: Build Native & Edge Automations

### Native ClickUp Automations:
1. **Narrative Gate Release:**
   * *Trigger:* Task in `Narrative` moves to `Locked & Published`.
   * *Action:* Create linked initiation tasks in `Foundation`, `Audio`, and `Pre-Vis & Animatic` Lists.
2. **Scene Handshake to Editorial:**
   * *Trigger:* Task in `Scene Pods` moves to `Final Comp & Grade`.
   * *Action:* Post a comment tagging `Assembly` watchers and set the linked `Assembly` task to `Received Input`.

### Step 8a: External Edge Worker & Webhook Integration (POD-12)
ClickUp native triggers cannot monitor GPU file systems. Implement a local watcher daemon (Python) integrated with Cloudflare Workers / ClickUp API:
1. **API Token:** Generate a personal or workspace token in **ClickUp Settings → Apps → API Token**.
2. **Directory Watcher:** A daemon monitors local render output folders (e.g., `/renders/EP101_SC02_SH005/`).
3. **Execution Payload:** Upon render completion:
   - Call `POST https://api.clickup.com/api/v2/task/{task_id}` to transition status to `Inpainting / Detail Fixes`.
   - Call `POST https://api.clickup.com/api/v2/task/{task_id}/attachment` to upload the low-res proxy `.mp4`.
   - Issue a webhook alert triggering a review notification.

---

## Step 9: Configure Global Cross-Pod Views

Create three cross-pod views at the Space level:

1. **"All Open Questions" (List View):**
   * *Filter:* `Contract Status = Draft` OR `Tag = open-question`.
   * *Group by:* `Pod ID`.
   * *Purpose:* Surfaces all unresolved policy questions across all 23 specs in a single unified triage list.
2. **"Criticality Dashboard" (Board View):**
   * *Group by:* `Criticality Tier` (Columns: Tier 1 down to Tier 5).
   * *Purpose:* Immediately exposes whether Tier 1 (Existential) or Tier 2 (Foundational) pods have overdue or blocked tasks.
3. **"Dependency Chain" (Gantt View):**
   * *Type:* Gantt / Timeline view.
   * *Auto-calculation:* Renders the critical path automatically based on the dependencies created in Step 7.

---

## Step 10: In-List Specification Pinning

To prevent specification drift:
1. Inside each Pod's List, click **+ Doc**.
2. Title the document `[POD-ID] Specification: Core Contracts & Boundaries`.
3. Paste **Sections 1 (Purpose), 3.2 (Values as Boundary Conditions), and 6 (Risk and Mitigation)** verbatim from that Pod's Markdown spec.
4. Pin the document to the header of the List.
5. Rule of Record: The pinned Doc is immutable law; tasks represent execution instances. Never alter spec boundaries in task descriptions.
