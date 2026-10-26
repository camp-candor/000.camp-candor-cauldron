# Quarantine Vault & Traditional Pipeline Boundary [001-POL-03 & 003-POL-01]

An architectural policy specification defining the hard boundary between the procedural Remotion engine and the traditional offline animation pipeline used for showrunner-authored milestone episodes.

---

## 1. Architectural Kill Switches & Quota Policies

Traditional animation project structures (heavy `.psd` working canvases, NLE project files like `.prproj`/`.avp`, and Excel spreadsheets) violate the automated pipeline's core constraints:

1. **Asset Quota Violation (`001-POL-03`):**
   * Establishes a hard ceiling of 150MB per procedural episode repo.
   * Multi-layered `3840x2160` raw raster PSDs break this ceiling, halting CI/CD automated builds.
2. **Baked Determinism Violation (`003-POL-01`):**
   * The Goblin procedural engine renders strictly via deterministic JSX code in Remotion by referencing palette-locked sprite assets.
   * External NLE project files (`.prproj`, `.drp`, `.avp`) bypass compiler logic entirely and cannot be ingested by procedural render workers.
3. **Generative Triad Bypass:**
   * Automated episodes generate staging mathematically from A/B/C Tactical Triads and condition injections. Manual storyboard directories are unparseable by the viewport engine.

---

## 2. The Milestone Exception: The Scripted Quarantine Vault

Per **[POLICY-02] Scripted-Event Precedence**, when a milestone event triggers (e.g., Bog reaching 150 XP for `hoarder_ascendant`, or Paranoia Clock `mum_grissel_silence` reaching 6/6):
* The procedural simulation enters a **Hard Freeze**.
* The character state shifts to `pending_showrunner_task: "milestone_name"`.
* The traditional animation pipeline is permitted **exclusively offline** within an isolated storage vault (`goblin-scripted-specials` or cold storage), completely outside the five-core "Quintet Architecture."

---

## 3. Quarantine Vault Specifications (Studio Delivery Grade)

When authoring offline milestone episodes, the directory structure enforces studio-grade standards derived from IMF and Netflix delivery guidelines:

1. **Universal Zero-Padding:**
   * Episode root format: `sXXeYY/` (e.g., `s02e19/`).
   * Shot folders incremented by tens: `sh0010/`, `sh0020/` (allowing non-destructive insertion of `sh0015/`).
   * Export frame numbering: `.0001.png`, `.0002.png`.
2. **Self-Describing Redundant Filenames:**
   * Files carry parent hierarchy tags: `s02e19_sh0010_board_v001.psd`. If detached from the tree, identity remains unambiguous.
3. **Two-Tier Manifest System:**
   * **Root Master Manifest (`s02e19/manifest.csv`):** Comprehensive index of every internal working asset, checksum, and status tag.
   * **External Delivery Manifest (`deliverables/manifest.csv`):** Strict boundary index tracking only final approved client deliverables (`.mp4` animatic, pitch deck PDF).
4. **Source of Truth Hierarchy:**
   * Structured filenames provide disk-level clarity for human editors.
   * Automated CLI tools and compilation scripts treat `manifest.csv` and local JSON sidecars (`episode.json`, `versions.json`) as the ultimate machine authority.