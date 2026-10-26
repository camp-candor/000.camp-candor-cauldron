# Pod Specification: POD-07 — Foundation Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Foundation Pod |
| **Alternate/Node Name** | The Asset & Lore Node |
| **Macro-Node / Tier** | Blueprint (criticality Tier 2 — Foundational) |
| **Headcount (human)** | 2 — one Style/Art Director (visual language, palette, lens/lighting rules), one ML/Training Engineer (LoRA training, checkpoint management) |
| **Pod Lead / Accountable Owner** | The Style/Art Director. Holds sign-off authority on whether a trained LoRA or locked checkpoint is visually correct and ready for publication to the asset registry; the ML/Training Engineer executes training but does not unilaterally approve a model for downstream use. |
| **Primary AI/Compute Tooling** | LoRA training pipelines (e.g., against Wan 2.2 / ComfyUI-compatible base checkpoints), embedding/style-lock tooling, reference-board and lookbook management |
| **One-Sentence Mission** | Build and publish the immutable visual "Show Bible" in weights — character LoRAs, environment checkpoints, and style embeddings — that every downstream Scene Pod must use, so the series looks like one coherent show rather than many disconnected ones. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** if two independent Scene Pods each prompt a base model for "the main character" without a shared, locked asset to draw from, they will generate two visibly different people — same problem for environments, lighting, and palette. This isn't a quality issue that can be fixed downstream by Polish; it's a coherence issue that has to be prevented upstream, because no amount of per-shot cleanup can retroactively make two independently-generated characters into the same character. If this function were left to individual Scene Pods to solve locally, each pod would either re-derive its own version of the character (guaranteeing drift) or constantly renegotiate with every other Scene Pod (destroying the isolation that makes Scene Pods able to "go dark" in the first place).

**Single most important outcome this Pod is accountable for:** publishing a locked, versioned asset registry — LoRAs, checkpoints, style embeddings — that is the *only* legitimate source of visual truth for characters and environments across the entire series.

**Explicitly outside this Pod's purpose:**
- This Pod does not render final scene footage — that's the Scene Pods' job. Foundation produces the *ingredients* (trained models, locked references), not the final frames.
- This Pod does not fix visual defects in already-rendered shots (extra fingers, flickering) — that's Polish's job; Foundation's responsibility ends at publishing a correct, usable asset, not at guaranteeing every downstream render using it is defect-free.
- This Pod does not make narrative/story decisions about what a character does or says — that's Narrative's job; Foundation only owns *what the character looks like and how the world is styled*, not what happens in it.
- This Pod does not freeze or version-control its own training environment/dependencies — that's Data Ops (POD-06); Foundation trains and certifies visual correctness, Data Ops certifies technical reproducibility of the tooling used to do so.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive the Showrunner's aesthetic intent and the Narrative Pod's character/location descriptions (see Section 5.1).
2. Style/Art Director establishes the visual language: color palette, camera lens characteristics, lighting rules, and overall aesthetic embeddings (e.g., locking a biopunk-noir look).
3. ML/Training Engineer trains character-specific LoRAs against the approved base checkpoint, using reference imagery and the Style/Art Director's guidance.
4. Generate a small batch of test images/frames using the newly trained LoRA across a range of poses, lighting conditions, and angles — this is the Pod's internal back-brief loop (see Section 3.3).
5. Style/Art Director reviews the test batch for consistency, likeness accuracy, and adherence to the locked style embeddings; approves or requests re-training with adjusted parameters.
6. Once approved, submit the candidate LoRA/checkpoint to Data Ops (POD-06) for technical certification (reproducibility, environment freezing) before publication.
7. On Data Ops certification, publish the finalized asset to the shared registry as an immutable, versioned entry.
8. Notify downstream Pods (via Infrastructure's event system) that a new or updated approved asset is available.
9. Maintain the reference-board/lookbook documentation alongside the technical assets, so the *reasoning* behind a visual choice (not just the trained weights) is preserved for future reference.

**Human roles inside the Pod and division of labor:**
- **Style/Art Director** — the aesthetic vector. Owns whether something *looks right* against the show's visual language; does not need deep expertise in LoRA training mechanics.
- **ML/Training Engineer** — the compute vector. Owns training parameters, base checkpoint selection, and technical execution of the training pipeline.
- **Why split rather than combined:** LoRA training is iterative and technically fiddly — CFG tuning, training-step counts, overfitting risk — and a solo operator can easily get pulled into debugging a training run and lose sight of whether the *result* actually serves the show's visual identity, which is exactly the "trap of the solo node" risk described generally for hybrid human-AI pods.

**Tooling specifics:** LoRA training pipelines run against the certified base checkpoint (supplied by Data Ops); style-embedding and reference-board tools are used to document and lock non-model visual constraints (palette, lensing rules) that aren't captured in the trained weights themselves.

**Known failure modes of this Pod's own process, and internal catches:**
- *A LoRA that looks correct in isolated test poses but drifts under lighting/angle conditions not covered by the test batch* — mitigated by testing across a deliberately wide range of poses/lighting in step 4, not just a handful of flattering reference angles.
- *Overfitting to reference imagery, producing a character that looks correct but rigid/lifeless across variation* — caught by the Style/Art Director's review explicitly checking for expressive range, not just likeness accuracy.
- *Style embeddings that work for one environment but not others* — mitigated by testing new environment checkpoints against multiple scene types before locking, not just the scene that originally motivated the checkpoint.

**Idle/blocked behavior:** If character/location descriptions from Narrative (POD-08) are missing or unlocked, this Pod fully blocks on training that specific asset — training against an unstable description risks producing a LoRA that has to be retrained the moment the description firms up, which is wasted compute. However, this Pod may proceed with *style-level* work (palette, lensing rules, general environmental mood) using only the Showrunner's aesthetic intent, since that layer is more stable and less likely to shift with narrative details.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives is typically expressed as: *"Lock a biopunk-noir aesthetic — desaturated greens and blacks, claustrophobic framing, and character designs that read as worn/lived-in rather than polished."* Note this specifies the *feeling* and *general visual grammar*, not exact hex codes, exact LoRA training parameters, or exact reference images to use. The Pod's output preserves this intent regardless of which specific base checkpoint, training approach, or reference set is used to arrive at it — success is judged by whether the published asset *reads* as the intended aesthetic, not by whether it followed a prescribed method.

### 3.2 Values as Boundary Conditions
- **Consistency over novelty:** once a character LoRA or style checkpoint is locked and published, this Pod does not casually retrain it to chase a marginally better result mid-season — visual consistency across episodes wins over any single episode looking slightly better in isolation. A retrain requires the formal update process (Section 3.5), not an informal swap.
- **Reference documentation over weights alone:** this Pod is required to publish the reasoning/lookbook alongside the trained model, not just the model file itself — because a future need (Season 2, a mid-season adjustment) will need to know *why* a choice was made, not just *what* the resulting weights are.
- **No downstream training:** Scene Pods and other downstream Pods are strictly forbidden from training their own variant LoRAs — this is a hard boundary condition imposed on *other* Pods that Foundation exists specifically to enforce, not a discretionary call.

### 3.3 Back-Brief
**Internal back-brief:** a small batch of test generations across varied poses/lighting/angles, reviewed by the Style/Art Director before a LoRA is submitted for certification. Pass/fail is a direct aesthetic judgment — likeness accuracy, expressive range, and adherence to the locked style language.

**Weaker-signal risk mitigation:** because this back-brief is artifact-only (images, not an explanation of why the model generalized a certain way), the Pod mitigates the general framework-level risk by deliberately testing across a *wide* range of conditions rather than a narrow, flattering set — a LoRA that only looks right in the specific test conditions chosen is exactly the failure mode a narrow back-brief would hide, and it's the same class of risk described for Audio's snippet-only reviews, applied to visual assets instead.

### 3.4 Global Read / Local Write
**Private working state:** in-progress training runs, unapproved test batches, and draft style embeddings are visible only within the Pod while iteration is happening — no Scene Pod should be building against an unpublished, unapproved LoRA.

**Finalized write:** once approved and certified by Data Ops, the Pod publishes the asset once, immutably, to the shared registry, with a version tag.

**Read access:** every Scene Pod, Polish, Motion Graphics, and Pre-Vis Pod may read the published registry freely.

**No downstream mutation:** confirmed — no downstream Pod may retrain, fine-tune, or otherwise alter a published Foundation asset directly. If a Scene Pod finds the LoRA doesn't handle a specific shot well, it must submit a formal request back to Foundation (Section 3.5) rather than locally patching the model.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** locked character/location descriptions from Narrative, and the Showrunner's aesthetic-intent statement.

**Formal output contract:** versioned LoRA/checkpoint files plus accompanying reference-board documentation, published to the shared asset registry only after Data Ops certification.

**Contract change process:** if Foundation needs to update a previously-published character LoRA (e.g., a mid-season wardrobe change for a character), this is treated as a new versioned asset, not an overwrite — announced via Infrastructure's event system, with the prior version remaining available (since Assembly/Continuity may need to reference how the character looked in earlier, already-locked episodes). A hard cutover (immediate, no prior-version access) is used only if the prior version is found to be legally or technically defective, not for routine creative refinement.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** receipt of locked character/location descriptions from Narrative, or a direct aesthetic-intent brief from the Showrunner for style-level work.

**Trigger this Pod's output causes downstream:** publishing a certified asset to the registry fires an automated notification (via Infrastructure) to Scene Pods, Pre-Vis, Polish, and Motion Graphics that a new or updated approved asset is available for use.

### 3.7 Black-Box Autonomy
While training and iteration are in progress, this Pod is not required to expose intermediate training checkpoints, parameter choices, or rejected test batches to any other Pod. The only checkpoint visible outside the Pod is the final published, certified asset — the training process itself is fully opaque to downstream consumers.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-08 Narrative Pod | Locked character and location descriptions | v1.0 | Full block on training that specific character/environment asset (see Section 2, idle/blocked behavior); style-level work may proceed independently |
| Showrunner (direct or via Narrative handoff) | Aesthetic intent statement (overall visual language) | n/a (not a versioned artifact) | Work can technically proceed using only Narrative's descriptions, but risks producing a technically consistent but tonally generic asset — quality risk, not a hard block |
| POD-06 Data Ops & Model Lifecycle | Certified, frozen base checkpoints and training environment | v1.0 | Full block — Foundation cannot train against an uncertified base checkpoint without risking the resulting LoRA being irreproducible later |
| POD-01 Legal, Provenance & Clearance | Clean-room provenance certification for any base model or reference imagery used in training | v1.0 | Full block — Foundation cannot legally train a production asset against uncleared source material |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-15 Scene Pods | Published character LoRAs, environment checkpoints, style embeddings | v1.0 | Strictly forbidden from training their own variant assets — must use only the published registry version, even if a scene seems to call for a slight visual deviation |
| POD-14 Pre-Vis & Animatic | Base visual reference sheets and lightweight style embeddings | v1.0 | Early storyboards/blocking must reflect approved silhouettes and environments, not freely-imagined alternatives |
| POD-13 Polish Pod | Character LoRAs and style references, used to guide inpainting/cleanup so corrections stay visually consistent with the locked asset | v1.0 | Cannot "fix" an artifact in a way that drifts from the locked character design, even if the fix would otherwise look cleaner |
| POD-20 Motion Graphics & Typography | Style embeddings (palette, general visual language) for title sequences and on-screen graphics | v1.0 | Must design typography/motion graphics that harmonize with Foundation's locked visual language, not an independently chosen style |
| POD-19 Marketing Creative | Approved LoRAs for trailer/key-art generation | v1.0 | Marketing materials must use only published assets — cannot generate promotional imagery from an unapproved or early-draft character version |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates informally with the Continuity/Canon Pod (POD-11) whenever a mid-season asset update is being considered (e.g., a character's appearance changing due to an in-story event), since Continuity/Canon needs to know *when* in the story a visual change becomes valid — but this is advisory coordination, not a blocking dependency; Foundation can technically publish an updated asset independent of Continuity/Canon's sign-off, though doing so without that coordination risks the kind of story-state contradiction Continuity/Canon exists to catch.

### 4.4 Position in the Macro-Node Structure
This Pod sits entirely within Blueprint, with no placement tension — its inputs (narrative descriptions, aesthetic intent) and its outputs (locked creative assets) are both squarely Blueprint-tier decisions. Unlike Assembly, there's no case for it bridging into Generative Core, even though its output is consumed heavily by Generative Core Pods — the same way Audio's output is consumed downstream without Audio itself sitting in Generative Core.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Locked character/location descriptions | Narrative Pod (POD-08) | Text / structured beat sheet with visual notes | v1.0 | Required (per-asset) |
| Aesthetic intent statement | Showrunner (direct or via Narrative) | Prose directive | n/a | Required (soft — quality risk if missing, not a hard block) |
| Certified base checkpoints and training environment | Data Ops & Model Lifecycle (POD-06) | Frozen container + model files | v1.0 | Required |
| Clean-room provenance certification | Legal, Provenance & Clearance (POD-01) | Signed certification document | v1.0 | Required |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Character LoRAs | Scene Pods, Pre-Vis, Polish, Marketing Creative | Model weight files, versioned | v1.0 | Y |
| Environment checkpoints | Scene Pods, Pre-Vis | Model weight files, versioned | v1.0 | Y |
| Style embeddings / visual style guide | Scene Pods, Pre-Vis, Polish, Motion Graphics | Embedding files + documented lookbook | v1.0 | Y |
| Reference-board / lookbook documentation | All Generative Core Pods (read access) | Structured document with images | v1.0 | Y |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** publishing a character LoRA that passes the internal back-brief (looks correct in the tested poses/lighting) but generalizes poorly to conditions the test batch didn't cover — meaning dozens of Scene Pods across the season could inherit a subtly unstable asset before anyone notices the pattern, since each Scene Pod only sees its own shot and has no way to know the underlying LoRA is the common cause of scattered, seemingly-unrelated visual oddities.

**AI-generated back-brief risk (framework-level):** the internal back-brief here is artifact-only — test images, not an explanation of what the model actually learned. Two LoRAs could pass the same test batch while having learned meaningfully different, unstable generalizations. **Mitigation used by this Pod:** deliberately wide-coverage test batches (Section 2, Section 3.3) specifically designed to surface instability before publication, rather than a narrow set of flattering reference poses.

**Cost of an undetected error:** very high and compounding, similar in shape to Data Ops' risk profile — because this asset is *reused* by every Scene Pod featuring that character or environment for the rest of the season, an undetected flaw doesn't cost one re-render, it costs however many scenes used the flawed asset before the pattern was noticed and traced back to its source. This is a large part of why the Style/Art Director's review is scoped to wide-condition testing rather than a quick spot-check — the downstream cost of getting this wrong is much higher than the cost of thorough testing up front.

**Escalation path:** if Scene Pods repeatedly report a published asset behaving inconsistently across different shots, escalation goes back to Foundation directly (not through the Showrunner first) since this is exactly the signal the Pod's own back-brief testing should have caught — Foundation re-evaluates and either issues a corrected version or documents the limitation as an expected constraint Scene Pods must work around.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly forbidden from publishing any asset trained against material that hasn't been cleared by Legal, Provenance & Clearance (POD-01) — a hard legal boundary, not a quality preference.
- This Pod may not publish an asset that hasn't passed Data Ops certification (POD-06) for technical reproducibility, even under production time pressure — an uncertified asset in active use creates exactly the kind of irreproducibility risk Data Ops exists to prevent.
- Significant, story-driven visual changes to an already-published character (e.g., a scarring event, a costume change tied to plot) must be flagged to and coordinated with Continuity/Canon (POD-11) before publication, even though Foundation retains final technical authority to publish.
- Default resource allocation: LoRA training runs draw from a separate compute allocation than Scene Pod rendering (tracked by Finance, POD-03), so that asset-quality testing is never implicitly deprioritized to preserve rendering budget.

---

## 8. Success Criteria

- The Showrunner (or Blueprint Lead) knows this Pod succeeded when every Scene Pod across the season renders the same character as recognizably, consistently the same character, without needing to inspect Foundation's training process directly.
- A rejected asset (by Data Ops certification, or by downstream Scene Pod reports of instability) is returned to Foundation with specific detail on what failed; the Pod retrains or adjusts locally and resubmits a new versioned asset.
- **Contract success:** the LoRA/checkpoint is published in the correct format, passes certification, and includes the required lookbook documentation.
- **Intent success:** the asset actually reads as the intended aesthetic and remains visually stable across the range of conditions Scene Pods will actually use it in.
- **Concrete divergence case for this Pod:** an asset could be contract-compliant (correctly formatted, certified, documented) while still failing intent if it technically matches the character's described appearance but doesn't carry the *feeling* the aesthetic intent called for (e.g., technically correct but reading as "clean sci-fi" instead of "worn biopunk-noir") — exactly the gap the Style/Art Director's back-brief review is meant to catch before publication, not something contract validation alone would ever surface.

---

## 9. Open Questions / Notes

- **[Resolved]** The retraining-attempt escalation threshold is addressed by the cross-Pod escalation standard (see `cross_pod_escalation_threshold_standard.md`): three retrain attempts still showing instability across the test batch now triggers escalation to the Showrunner/Blueprint Lead. Note the standard resolves *how many retrains before escalating*, not *how many test conditions counts as wide enough coverage* in the first place — that specific coverage-breadth judgment remains the Style/Art Director's call per Section 2/3.3.
- The coordination protocol with Continuity/Canon (Section 4.3) for mid-season asset updates is advisory rather than a hard gate — it's worth revisiting whether a story-significant visual change (e.g., a permanent injury) should actually require Continuity/Canon sign-off before publication, not just informal coordination, given how expensive it would be to unwind if the timing of a visual change contradicted an already-locked earlier episode.
- Unlike Data Ops, this Pod has strong source material behind it (multiple passages describing its exact function), so the internal workflow here is a reasonably faithful expansion rather than a heavy extrapolation — but the specific headcount split and step-by-step process are still a reasonable inference layered on top of the source's higher-level description, not verbatim from it.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |

- **Deprecation policy:** a published character LoRA or checkpoint is never deleted, only superseded by a new version — prior versions remain available indefinitely so Assembly and Continuity/Canon can reference how something looked in already-aired or already-locked episodes, even after an update.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.
