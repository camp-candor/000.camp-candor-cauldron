# Distributed Creative Ingestion & The First-Artifact Law: Slack-to-Obsidian Funnel vs. Meta-Tool Avoidance

An operational specification and development doctrine defining the mechanics of multi-modal, zero-friction creative ingestion, structuring the funnel from raw inspiration to schema-bound corpus, and establishing the foundational meta-engineering check: **The First-Artifact Law**.

---

## 1. The Collaborative Multiplier: Permissive Input with Strict Gatekeeping

The objective of collaborative infrastructure is not merely accelerating technical pipeline ops; it is enabling **distributed creative imaginations to touch the project without touching or destabilizing the codebase**.

### A. The Structural Entry Seam (`pending_showrunner_task`)
* **The Chokepoint as Security:** The Content & Coherence Gate (Stage 6) acts as a human firewall capable of rejecting any proposal. Because nothing reaches publication without surviving this gate, the top of the funnel can be open, permissive, and accessible across low-friction surfaces like Slack.
* **Permissive Ingestion $\rightarrow$ Rigid Gating:**
  1. Low-friction capture surface (Slack messages, reactions, link drops).
  2. Maintained LLM proxy formats input into structured JSON/Markdown proposals.
  3. Showrunner/architect audits against the relational ledger and character bibles.
  4. Only approved diffs commit to the canonical narrative repository.

---

## 2. Ingestion Funnel Architecture: Multi-Modal Capture to Corpus

To prevent the capture surface from degenerating into an unorganized, forgotten dumping ground, creative intake operates through three distinct tiers:

```
[ Tier 1: Low-Friction Ingestion ] ──► Slack channels (#research-wallpaper, #research-color)
                 │                      - Unformatted drops: text, images, video, 3D (.glb)
                 ▼
[ Tier 2: Normalized Envelope ]   ──► Obsidian Vault Note (via Local REST API plugin)
                 │                      - Raw file reference + LLM-generated text caption
                 ▼
[ Tier 3: Periodic Clustering ]   ──► Weekly / On-Demand LLM Synthesis (!ResearchDigest)
                 │                      - Groups drops into motifs, flags resonance with lore
                 ▼
[ Tier 4: The Proposal Gate ]     ──► Structured Pitch (!PitchGrievance) ──► Stage 6 Review
```

### Tier 1: Multi-Modal Capture (Zero Friction)
* Contributors drop raw media (text links, PNGs, MP4 clips, `.glb` 3D meshes) into dedicated topical channels without needing knowledge of Zod schemas or engine parameters.

### Tier 2: The Normalized Markdown Envelope
Every incoming drop is normalized into an immutable flat-file Markdown note written directly to an upstream Obsidian vault:
```json
{
  "id": "ingest_20260913_001",
  "timestamp": "2026-09-13T11:15:00Z",
  "contributor": "user_handle",
  "channel": "#research-wallpaper",
  "medium": "image",
  "raw_ref": "vault/media/ingest_20260913_001.png",
  "caption": "Worn damask pattern with peeling, moisture-stained backing.",
  "tags": ["wallpaper", "pantry_wall", "decay"],
  "status": "raw"
}
```
* **The Caption as Bridge:** Non-text media (video, 3D meshes) is made machine-legible at ingestion time via vision models, enabling downstream LLMs to query and cluster non-text media alongside text.
* **Obsidian vs. Git Architecture:** 
  * `goblin-bible` lives natively in Git—enforcing commit hashes, pull requests, and Zod compilation schemas (`compile.ts`).
  * Obsidian functions strictly as an optional reading, backlinking, and graph-view lens pointed directly at the git-tracked directory. 
  * Git is the single source of truth and history; Obsidian is an authoring tool. Deleting Obsidian costs nothing except the local graph visualization.

### Tier 3: Scheduled Thematic Clustering
* Automated or on-demand digest commands (`!ResearchDigest <topic>`) cluster raw drops into recurring visual and thematic motifs, checking for resonance against existing character and location bibles.

### Tier 4: Proposal Graduation
* Genuine load-bearing clusters graduate into formal narrative proposals (`!PitchGrievance`), presenting concrete mechanics (Argument Score deltas, String expenditure, outcome branch types) for showrunner approval.

---

## 3. Collaborative Interaction Mechanics in Slack

1. **Structured Pitch Routing (`!PitchGrievance <Entity A> vs <Entity B> <Core Premise>`):**
   * Calls a maintained private LLM proxy loaded with character voice rules and the Residue Mandate.
   * Returns a structured proposal draft back to Slack rather than writing directly to the canonical repo.
2. **Reaction-Based Sentiment Signals:**
   * Bot broadcasts rendered episode drafts or open narrative dilemmas; collaborators react with designated emoji sets (🔥 / 🤔 / 💀).
   * Tally aggregates into a directional steering vector for subsequent drafting passes.
3. **Structured Open Calls:**
   * Bot issues a targeted creative prompt for an unmapped gap (e.g., *"The Attic Stair needs a new contested possession. What is hidden there?"*).
   * In-thread replies are clustered by the LLM proxy into 2–3 concrete candidate archetypes for review.

---

## 4. The First-Artifact Law: Meta-Tool Avoidance Diagnostic

A critical governance principle protecting against infinite administrative and infrastructural drift:

```
┌────────────────────────────────────────────────────────────────────────┐
│ THE FIRST-ARTIFACT LAW                                                 │
│                                                                        │
│ "Building tools to help build the thing is leverage ONLY when it       │
│  solves friction actually experienced during hand-crafting.           │
│  Building tools before a single artifact exists is meta-tool           │
│  avoidance—a sophisticated defense against the vulnerability of       │
│  the blank page."                                                      │
└────────────────────────────────────────────────────────────────────────┘
```

### A. The Diagnostic Test: Leverage vs. Avoidance
* **Legitimate Leverage:** A meta-tool engineered to eliminate a concrete bottleneck encountered during production (e.g., lost character notes, broken sprite references during render compilation).
* **Sophisticated Avoidance:** Architecting five-repo pinning matrices, complex multi-modal ingestion queues, and six-tier governance models before a single finished scene, script, or episode exists. Infrastructure has a clear finish line; creative vulnerability does not.

### B. Inversion of Order: The Minimal Hand-Crafted Slice
* Before expanding the ingestion bot, LLM proxies, or Slack bridges, the engine's core mechanics must be validated on the smallest possible unit: **one isolated conflict, hand-authored through canonical rules without automated tooling**.
* If the rules, tone, and character voices do not hold together in a single hand-crafted scene, no amount of automated Slack orchestration will rescue the production.
* Writing the first scene yourself—fast, raw, and vulnerable—provides collaborators with a concrete baseline to react against, rather than asking them to reverse-engineer tone from abstract specifications.