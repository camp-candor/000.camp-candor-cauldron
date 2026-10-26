# Production Ops: The Asset Refinery & Art Department Integration Architecture

An engineering and asset pipeline specification establishing the **Asset Refinery**, structuring visual production by technical constraints, enforcing approval gates, and bridging artists to game and rendering engines via deterministic asset IDs.

---

## 1. System Philosophy: The Asset Refinery vs. The Art Studio

Creative asset production without technical boundaries creates runaway asset bloat and performance failure. The Asset Refinery enforces industrial discipline:
* **The Render Node Doctrine:** Artists function within the pipeline as creative render nodes producing modular, budget-compliant game assets rather than disconnected gallery pieces.
* **Separation from Code Tasks:** Art tasks are segregated into a dedicated space (`[DEPT] - ART & ASSETS`) to prevent subjective creative iterations from skewing engineering velocity charts.

---

## 2. Space Architecture & View Strategy

* **Space:** `[DEPT] - ART & ASSETS`
* **View Hierarchy:**
  * *Gallery View (The Shop Floor):* Primary view for artists, displaying visual asset previews and render thumbnails.
  * *Board View (The Continuous Flow):* Strict Kanban pipeline managing stages from concepting through publication. Sprints are avoided; asset production flows continuously.
  * *List View (The Technical Audit):* Administrative view tracking strict kilobyte budgets, triangle counts, and delivery dates.

---

## 3. Production Categorization by Technical Constraint

Tasks are organized by technical hardware budgets rather than narrative subjects:

```
[DEPT] - ART & ASSETS
├── [2D] - UI & Textures       <-- Resolution limits (2048x2048 power-of-two), WebP/PNG, UI states
├── [3D] - Models & Geometry   <-- Polygon/triangle budgets, bone counts, LOD thresholds
├── [VFX] - Shaders & Particles<-- GPU draw-call caps, overdraw limits, frame-rate impact
└── [MKT] - Marketing & Concept<-- High churn, unconstrained conceptual exploration
```

---

## 4. The Asset Lifecycle (Custom Approval Gates)

```
[1. BRIEFING] ──► [2. CONCEPTING] ──► [3. PRODUCTION] ──► [4. INTERNAL_REVIEW]
      │                                                           │
(Specs empty;                                            (Art lead checks
  task blocked)                                             visual style)
                                                                  │
[7. PUBLISHED] ◄── [6. INTEGRATION] ◄── [5. TECHNICAL_REVIEW] ◄───┘
 (Asset live          (Committed to Git/R2;      (Lead dev checks poly budgets,
  in engine build)     validated via webhook)     file size, and naming rules)
```

1. **BRIEFING:** Task created; specs and budgets unpopulated. Blocked from progression.
2. **CONCEPTING:** Low-fidelity sketches, silhouette exploration, and color studies.
3. **PRODUCTION:** Modeling, texturing, rigging, or audio composition.
4. **INTERNAL_REVIEW:** The Art Lead audits stylistic coherence against the visual bible.
5. **TECHNICAL_REVIEW (The Critical Gate):** The Lead Developer audits asset binaries against hard constraints:
   * Rejection if file size exceeds kilobyte limits by even 1KB.
   * Rejection if texture dimensions violate power-of-two standards (e.g., must be 512, 1024, 2048).
   * Rejection if mesh geometry exceeds designated triangle caps.
6. **INTEGRATION:** Asset committed to repository or Cloudflare R2 object storage.
7. **PUBLISHED:** Asset verified, linked via asset ID, and live in the production build.

---

## 5. The Constraint Cage (`Asset_Request_Standard`)

```markdown
### 🎨 Asset Brief: [Asset Name]

**Context & Location:**
[Where does this live? e.g., "Primary weapon icon in React HUD"]

**Technical Constraints (THE LAW):**
- **Format:** [.GLB / .WebP / .SVG / .WAV]
- **Dimensions & Scale:** [e.g., 512x512px; 1 World Unit = 1 Meter]
- **Budgets:** [Max 5,000 Triangles; Max 250 KB payload]
- **Texture Standards:** [Power-of-two only; PBR metallic/roughness channels]
- **Naming Convention:** `tex_icon_[name]_v[#]` (Strict enforcement)

**Stylistic References:**
[Link to Style Guide / Character Visual Sheet]

**Artifact Output:**
[Cloudflare R2 Bucket Path / Git LFS Route]
```

---

## 6. The Red Pen Protocol (Pixel-Exact Proofing)

* **Eliminating Subjective Feedback:** Ambiguous commentary (e.g., *"make it pop"*, *"needs more vibe"*) is barred.
* **Proofing Workflow:**
  1. Artists upload draft plates or renders directly to ClickUp attachments.
  2. The reviewer places pin-point image annotations directly on the offending pixel coordinates.
  3. Feedback specifies precise geometric or material defects: *"Pivot point offset by 15cm; clips through character palm"* or *"Contrast ratio on text overlay fails AAA threshold."*

---

## 7. The Handoff Bridge: Deterministic Asset IDs & Automation

Eliminating pipeline drops between art completion and engineering consumption:

```
[ Artist creates asset ] ──► Names file: `asset_weap_sword_04.glb`
                                      │
[ Task moves to INTEGRATION ] ────────┼──► Webhook triggers pipeline verification
                                      │
[ Pipeline checks R2 / Git ] ─────────┴──► Found? ──► Move to PUBLISHED
                                          Missing? ─► Bounce to PRODUCTION with error log
```

* **The `Asset_ID` Custom Field:** A unique, immutable string shared between engine code and art files (e.g., `const SWORD_ID = "asset_weap_sword_04"` matches `asset_weap_sword_04.glb`).
* **Automated Webhook Ingestion:** Moving a task to `INTEGRATION` triggers an automated verification script checking Cloudflare R2. If the asset exists with correct naming and budget constraints, it advances to `PUBLISHED`; otherwise, it automatically bounces back to `PRODUCTION` with diagnostic failure notes.

---

## 8. Refinery Telemetry & Dashboards

* **The Trash Can (Rejection Rate Widget):** Measures tasks returned from `TECHNICAL_REVIEW` back to `PRODUCTION`. High rates indicate a training deficit in technical constraints (poly counts, texture optimization) rather than aesthetic capability.
* **Asset Velocity Widget:** Tracks the throughput of assets advancing to `PUBLISHED` per week, evaluating production balance across environment, character, and UI disciplines.
