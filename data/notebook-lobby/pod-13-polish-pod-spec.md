# Pod Specification: POD-13 — Polish Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Polish Pod |
| **Alternate/Node Name** | The Continuity & Artifact Cleanup Node |
| **Macro-Node / Tier** | Generative Core (criticality Tier 3 — Structural) |
| **Headcount (human)** | 2 — one VFX/Inpainting Artist (targeted correction work), one QA Reviewer (systematic defect detection and triage across incoming shots) |
| **Pod Lead / Accountable Owner** | The VFX/Inpainting Artist. Holds sign-off authority on whether a corrected shot is clean and ready to pass to Assembly; the QA Reviewer owns defect detection and triage but does not have authority to approve a final corrected shot without the Artist's sign-off. |
| **Primary AI/Compute Tooling** | Targeted ControlNet and localized masking/inpainting workflows, frame interpolation and temporal stabilization tooling, automated defect-detection scripts (e.g., anomaly detection tuned for common generative artifacts like extra fingers or flickering) |
| **One-Sentence Mission** | Absorb the cost of generative AI's inherent visual hallucinations — extra fingers, flickering backgrounds, seam artifacts — so that Scene Pods never have to break their own creative momentum fixing localized glitches, and so Assembly only ever receives visually clean footage. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** generative video and image models reliably produce a specific, recurring class of defect — anatomical errors, flickering, seam artifacts, disappearing props — that has nothing to do with a Scene Pod's creative judgment and everything to do with the underlying technology's limitations. If Scene Pods were responsible for fixing their own artifacts, two problems compound: first, debugging a six-fingered hand pulls a Pod Lead's attention away from the scene's emotional pacing (the same "sucked into the machine" trap described generally for hybrid pods), and second, every Scene Pod would need its own inpainting expertise, duplicating a specialized skill set across every pod rather than centralizing it once. Separating Polish out lets Scene Pods stay focused on the creative vector while a dedicated unit handles the compute vector of defect correction.

**Single most important outcome this Pod is accountable for:** every shot reaching Assembly is visually clean — free of AI hallucination artifacts — without the correction process having required any Scene Pod to divert attention from its own creative work.

**Explicitly outside this Pod's purpose:**
- This Pod does not make creative or pacing decisions about a shot — that remains the originating Scene Pod's and, ultimately, Assembly's domain; Polish corrects defects within the shot as delivered, it does not re-direct what the shot is trying to accomplish.
- This Pod does not check narrative-state consistency (does this contradict something established two episodes ago) — that's Continuity/Canon's (POD-11) job, despite the similarity in this Pod's name; Polish's "continuity" is frame-to-frame visual consistency within and across a single shot, not story-level continuity.
- This Pod does not perform the final broadcast-spec color grading or loudness mastering — that's Assembly's and Mastering & QC's job respectively; Polish's corrections are targeted and local (fixing a specific defect), not a global creative or technical pass across the whole episode.
- This Pod does not train or modify Foundation's locked character LoRAs or style checkpoints — if a defect appears to stem from the underlying asset itself rather than a one-off rendering glitch, that's flagged back to Foundation (Section 6), not something Polish attempts to fix by working around the locked asset.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive a "mostly finished" render from a Scene Pod, submitted specifically for cleanup review (see Section 5.1).
2. QA Reviewer runs the automated defect-detection pass across the shot, flagging candidate issues — anatomical errors, flickering, seam artifacts, temporal inconsistency between frames.
3. QA Reviewer performs a manual visual review pass as well, since automated detection is tuned for common, previously-seen defect patterns and will miss novel ones (see Section 6) — this manual pass is not optional or skippable even when the automated pass returns clean.
4. For each confirmed defect, the VFX/Inpainting Artist applies targeted correction — localized masking, ControlNet-guided inpainting, or frame interpolation/stabilization as appropriate to the specific defect type.
5. Re-review the corrected shot against the original defect list to confirm each flagged issue is actually resolved, and check that the correction itself didn't introduce a new, different artifact (a common risk with inpainting).
6. If a defect appears to trace back to the underlying Foundation asset itself (e.g., the character LoRA consistently produces an anatomical error in a specific pose across multiple otherwise-unrelated Scene Pod shots), escalate to Foundation rather than continuing to patch around it shot-by-shot (see Section 6).
7. Submit the corrected shot for the internal back-brief (Section 3.3) before final sign-off.
8. On approval, publish the cleaned shot to the shared registry and notify Assembly that the shot is ready for ingestion.

**Human roles inside the Pod and division of labor:**
- **VFX/Inpainting Artist** — the correction vector. Owns the actual technical execution of fixing a flagged defect; deep familiarity with masking/inpainting tools and technique.
- **QA Reviewer** — the detection vector. Owns systematically finding defects — both via automated tooling and manual review — and triaging which issues are genuine, which are false positives, and which represent a pattern worth escalating to Foundation.
- **Why split rather than combined:** defect detection and defect correction draw on different skills and different modes of attention — a reviewer needs to look at a shot skeptically, hunting for what's wrong, while an artist needs to focus deeply on fixing one specific identified issue without being distracted by continuing to scan for other problems; combining both risks either rushed detection (eager to get to the fixing) or rushed fixing (still scanning for the next issue).

**Tooling specifics:** automated defect-detection scripts provide the first-pass filter (analogous to Foundation's wide-condition test batch or Data Ops' smoke test — a cheap check before committing full manual review attention); ControlNet and localized masking tools perform the actual corrections; frame interpolation/stabilization tools address temporal (across-frame) rather than single-frame defects.

**Known failure modes of this Pod's own process, and internal catches:**
- *An inpainting correction fixes the flagged defect but introduces a new, subtler artifact* — mitigated by step 5's explicit re-review specifically checking for new issues, not just confirming the original flag is resolved.
- *Automated detection missing a novel defect type it hasn't been tuned to recognize* — mitigated by the mandatory manual review pass (step 3) that runs regardless of what the automated pass returns, and by treating each newly discovered defect type as an addition to the automated detector's coverage going forward (the same "living, expanding" mitigation pattern used by Data Ops' golden set and Foundation's test-condition coverage).
- *Repeatedly patching the same underlying asset defect shot-by-shot rather than recognizing the pattern and escalating* — mitigated by step 6's explicit instruction to trace recurring defects back to their source rather than treating every instance as a fresh, isolated fix.

**Idle/blocked behavior:** This Pod blocks on a specific shot until that shot is submitted by its originating Scene Pod — it cannot begin cleanup work on an unfinished render. However, this Pod is not blocked in aggregate by any single Scene Pod's pace, since it processes shots as they arrive from potentially many concurrent Scene Pods; if one Scene Pod is delayed, Polish simply works on whatever other finished shots are queued rather than sitting idle.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives is close to a standing, general directive rather than a scene-specific one: *"No Scene Pod should ever have to stop and debug a visual glitch themselves — that cost belongs here, not with them, and no visibly broken frame should ever reach Assembly."* This is a stable, low-variance intent across the whole season (unlike, say, Audio's scene-by-scene aesthetic intent) — Polish's job description doesn't meaningfully change from episode to episode, which is part of why this Pod is well-suited to heavy automated tooling and a highly standardized internal process.

### 3.2 Values as Boundary Conditions
- **Correction over recreation:** Polish is expected to fix a flagged defect through targeted, localized correction — it does not have authority to substantially re-render or re-generate a shot from scratch, even if that would technically produce a cleaner result; a full re-render is a Scene Pod-level decision, not something Polish substitutes for its own corrective work.
- **Escalate recurring patterns over indefinite local patching:** the same value established for Assembly (Section 3.2 of POD-10's spec) applies here in its original form — if the same underlying defect recurs across multiple, otherwise-unrelated shots, that's a signal to escalate to Foundation (Section 6), not simply more work for Polish to keep absorbing quietly.
- **Confirm, don't assume, that a fix didn't introduce a new problem:** every correction is followed by a re-review specifically checking for newly introduced artifacts (Section 2, step 5) — this Pod does not treat "the flagged issue is gone" as sufficient confirmation that a shot is now clean.

### 3.3 Back-Brief
**Internal back-brief:** before a corrected shot is submitted onward to Assembly, the QA Reviewer performs a final check specifically confirming (a) the original flagged defects are resolved and (b) no new defects were introduced by the correction itself — a structured, mandatory second look rather than the VFX Artist's own self-assessment being treated as sufficient.

**Weaker-signal risk mitigation:** this Pod's work is closer to Data Ops' and Security's deterministic-checking profile than to a creative back-brief — the risk isn't an unstable AI interpretation of intent, it's a detection/coverage gap (a defect type the automated tooling and even the human reviewer's trained eye simply doesn't catch). The mitigation is the same pattern used elsewhere: continuously expanding what the automated detector is tuned to catch, informed by every defect that slips through and is caught later (ideally by Assembly or, worst case, downstream of that).

### 3.4 Global Read / Local Write
**Private working state:** in-progress correction attempts, rejected inpainting passes, and the QA Reviewer's working defect list are visible only within the Pod while cleanup is underway — Assembly should never see a "mostly cleaned" shot mid-process.

**Finalized write:** once the internal back-brief (Section 3.3) passes, the Pod writes the cleaned shot once, immutably, to the shared registry, replacing the shot's "awaiting Polish" status with "cleared for Assembly."

**Read access:** Assembly reads the cleaned shot as its primary input; the originating Scene Pod may also read the cleaned version for its own records, though it has no further active role once the shot is submitted to Polish.

**No downstream mutation:** confirmed — Assembly may not perform its own ad hoc cleanup fix on a shot it receives from Polish; if Assembly discovers a defect Polish missed, it submits a formal request back to Polish (Section 3.5) rather than patching it independently, preserving the same single-point-of-responsibility discipline used throughout this framework.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** a "mostly finished" render from a Scene Pod, submitted specifically for cleanup review, using Foundation's locked LoRAs/checkpoints (so Polish is correcting rendering artifacts, not compensating for an uncertified or off-spec asset).

**Formal output contract:** a cleaned shot, artifact-free per this Pod's defect checklist, published to the shared registry in the same format Assembly requires as its own input.

**Contract change process:** if this Pod's defect-detection coverage is updated (a new defect type added to the automated checker, per Section 2's continuous-improvement pattern), this doesn't constitute a contract change requiring downstream notification — it's an internal quality improvement to how this Pod fulfills its existing contract, not a change to what it promises to deliver.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** receipt of a "mostly finished" render submission from a Scene Pod (file-drop detection via Infrastructure, not a scheduled check).

**Trigger this Pod's output causes downstream:** publishing a cleaned shot fires an automated notification (via Infrastructure) to Assembly that the shot is ready for ingestion into the episode timeline.

### 3.7 Black-Box Autonomy
While cleanup is in progress, this Pod is not required to expose which specific inpainting technique, masking approach, or correction tool it used to any other Pod — Assembly and the originating Scene Pod only see the final result: a clean shot, or (in the escalation case) a flag that the defect traces back to Foundation's underlying asset.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-15 Scene Pods | "Mostly finished" renders submitted for cleanup | v1.0 | Full block on that specific shot — Polish cannot clean up a render that doesn't exist yet |
| POD-07 Foundation Pod | Certified character LoRAs/checkpoints, as the reference standard for what a "correct" (non-defective) rendering of a character or environment should look like | v1.0 | Without this reference, Polish risks either over-correcting (fixing something that's actually intentional stylistic variation) or under-correcting (missing a defect because the correct baseline isn't clear) — a quality risk more than a hard block |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-10 Assembly Pod | Polish-approved, cleaned shots | v1.0 | Assembly should not receive or need to work around visibly defective footage — if it does, that's treated as a Polish process failure to investigate, not something Assembly is expected to quietly absorb |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates informally with Continuity/Canon (POD-11) on the narrow occasion where a visual defect correction could plausibly intersect with a story-state fact (e.g., correcting a prop that appears in the wrong hand might matter if handedness was ever established as narratively significant) — this is rare, incidental coordination rather than a standing dependency, and in the overwhelming majority of cases Polish's corrections have no narrative-state implications at all.

### 4.4 Position in the Macro-Node Structure
This Pod sits within Generative Core, with no placement tension — like Scene Pods, its work is fundamentally about producing correct pixels, even though its specific task (correction rather than generation) is different in kind from Scene Pods' own work. Unlike Assembly, there's no case for a bridge placement here: both Polish's inputs (raw Scene Pod renders) and its outputs (cleaned shots feeding Assembly) sit entirely within the technical-production side of the pipeline.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| "Mostly finished" render | Scene Pods (POD-15) | Video file | v1.0 | Required |
| Certified character LoRAs/checkpoints (reference standard) | Foundation Pod (POD-07) | Model weight files (read access, not consumed directly) | v1.0 | Required |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Cleaned, artifact-free shot | Assembly Pod (POD-10) | Video file | v1.0 | Y |
| Asset-defect escalation report (when applicable) | Foundation Pod (POD-07) | Structured report citing the recurring defect pattern | v1.0 | Y |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** a defect that isn't a one-off rendering glitch but actually traces back to a flaw in Foundation's underlying locked asset (e.g., a character LoRA that reliably produces an anatomical error in a specific pose) gets repeatedly, individually patched shot-by-shot across many Scene Pods without anyone recognizing the pattern — because each individual Polish correction looks like a normal, successful fix in isolation, and no single instance signals that the *source*, not the *render*, is the actual problem.

**Weaker-signal risk (framework-general, applied here):** this Pod's automated defect detection is a pattern-matching system tuned against previously-seen artifact types, meaning it will systematically miss genuinely novel defect categories the same way Data Ops' regression testing can miss untested edge cases, or Continuity/Canon's automated pass can miss a differently-phrased contradiction. **Mitigation used by this Pod:** the mandatory manual review pass (Section 2, step 3) that runs regardless of automated results, combined with continuous expansion of detector coverage from every defect caught downstream of where it should have been caught.

**Cost of an undetected error:** moderate per-instance but potentially large in aggregate — a single missed defect reaching Assembly is a contained, fixable problem (Assembly flags it back per Section 4.2). But the *pattern*-level failure described above (an asset-level defect being patched around repeatedly rather than escalated) has a cost that compounds across the whole season the same way an undetected Foundation asset flaw does in Foundation's own Section 6 — every additional shot using the flawed asset before the pattern is recognized adds to the eventual cost of fixing it at the source.

**Escalation path:** a suspected asset-level defect pattern is escalated directly to Foundation (Section 2, step 6), with the specific report citing which shots and poses triggered it — Polish does not have authority to unilaterally decide the asset itself needs retraining, only to flag the pattern; Foundation retains authority over whether and how to respond.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly forbidden from substantially re-rendering or re-generating a shot from scratch in place of targeted correction — that decision belongs to the originating Scene Pod, not Polish (Section 3.2).
- This Pod may not indefinitely patch around a recurring, asset-traceable defect without escalating to Foundation (Section 3.2, Section 6) — repeated correction of the same underlying issue across multiple shots is itself a signal requiring escalation, not just continued absorption of the workload.
- This Pod does not have authority to approve a shot as "clean enough" if a known, flagged defect remains uncorrected — every confirmed defect must be resolved or explicitly escalated (with Assembly and the Showrunner informed of the known limitation), never silently shipped forward.
- Default resource allocation: no explicit compute ceiling applies to this Pod in the way it does to Scene Pods (correction work is comparatively lighter-weight than full rendering), but a shot requiring more than the defined cross-Pod escalation threshold (see Section 9) of correction/re-review cycles should be flagged as a candidate for Scene Pod-level re-render rather than continuing indefinite local patching.

---

## 8. Success Criteria

- Assembly knows this Pod succeeded when every shot it receives from Polish is genuinely artifact-free, requiring no further visual correction before assembly.
- A shot returned to Polish by Assembly (because a defect was missed) is treated as a process failure to investigate — specifically, whether it was a detection gap (Section 6) or a review process lapse — not simply corrected and moved on from without that investigation.
- **Contract success:** the shot is delivered in the correct format, on schedule, with the originating Scene Pod's submission properly logged.
- **Intent success:** the shot is actually free of visible artifacts when watched at full attention, not just free of the specific defects the automated detector happened to flag.
- **Concrete divergence case for this Pod:** a shot could be contract-compliant (delivered on time, in the correct format, with the automated checklist showing all clear) while still failing intent if it contains a defect type the detector wasn't tuned to catch and the manual reviewer's attention happened to miss on that particular pass — exactly the risk in Section 6, and why the manual review pass is mandatory rather than treated as redundant with automated detection.

---

## 9. Open Questions / Notes

- **[Resolved]** The correction-cycle escalation threshold is addressed by the cross-Pod escalation standard (see `cross_pod_escalation_threshold_standard.md`): three correction/re-review cycles on the same flagged defect now triggers mandatory escalation to Scene Pod re-render, rather than indefinite local patching.
- The relationship between this Pod and Continuity/Canon (Section 4.3) is currently described as rare, incidental coordination — worth revisiting if, in practice, visual corrections turn out to intersect with narrative-state facts more often than assumed here (e.g., if costume/prop continuity across scenes becomes a frequent Polish concern rather than a rare edge case).
- This Pod's internal workflow draws on solid, consistent source material describing its core function (dedicated QA/inpainting unit, ControlNet and masking workflows, protecting Scene Pod momentum) across multiple documents — comparable in grounding to Foundation, Audio, and Infrastructure rather than to the more heavily extrapolated Data Ops or Continuity/Canon specs, though the specific headcount split and step-by-step review process remain a reasoned elaboration rather than verbatim source detail.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |

- **Deprecation policy:** a cleaned shot version is never deleted, only superseded if a correction needs revisiting (e.g., Assembly flags a missed defect and Polish issues a corrected re-version) — prior versions remain available so it's always possible to trace what Assembly originally received versus what was later corrected.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.