# Pod Specification: POD-10 — Assembly Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Assembly Pod |
| **Alternate/Node Name** | The Master Editorial Node |
| **Macro-Node / Tier** | Supply Chain* (criticality Tier 3 — Structural) — see Section 4.4 for the contested placement discussion |
| **Headcount (human)** | 2 — one Editor/Pod Lead (pacing, sequencing, color-grade judgment), one Technical Assembly Engineer (automated Remotion/NLE scripting, timeline compilation tooling) |
| **Pod Lead / Accountable Owner** | The Editor. Holds sign-off authority on whether an assembled episode cut is ready to hand off to Localization/Mastering; the Technical Assembly Engineer owns the tooling that stitches the timeline together but does not make creative pacing or sequencing calls independently. |
| **Primary AI/Compute Tooling** | Automated Remotion scripts for timeline compilation, traditional NLE tooling for manual fine-cuts, global color-grading tools/LUTs for shot-to-shot harmonization |
| **One-Sentence Mission** | Stitch the isolated, independently-produced outputs of every Scene Pod into one coherent episode — the first point in the pipeline where the whole episode is seen and judged as a single continuous experience rather than as separate shots. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** Scene Pods operate in deliberate isolation — that's the entire point of treating them as autonomous, "going dark" nodes. But isolation has a cost: no individual Scene Pod knows how its final frame transitions into the next Scene Pod's first frame, whether its color grade matches its neighbor, or whether the overall pacing across shots serves the episode rather than just the scene. If this function were pushed back onto the Scene Pods themselves, they would have to constantly coordinate with each other — reintroducing exactly the kind of cross-pod dependency and lost autonomy the whole pod architecture exists to prevent. Assembly exists specifically to be the one place with visibility across all of a given episode's Scene Pods simultaneously, precisely because no other Pod in Generative Core is designed to have that visibility.

**Single most important outcome this Pod is accountable for:** producing a single, coherent, harmonized episode cut — from Scene Pods' disparate, independently-produced shots — that reads as one continuous creative work rather than a collection of technically-compliant but disconnected fragments.

**Explicitly outside this Pod's purpose:**
- This Pod does not generate or fix any individual shot's content — that's Scene Pods' and Polish's job; Assembly works with already-finished shots as fixed inputs, it does not create or repair frame-level content.
- This Pod does not perform broadcast-spec technical mastering (Dolby Vision, LKFS loudness compliance) — that's Mastering & QC's job; Assembly produces a finished creative cut, not a broadcast-certified deliverable.
- This Pod does not decide the underlying story structure or pacing intent — that traces back to Narrative and the Showrunner; Assembly executes cutting and sequencing decisions in service of that intent, it does not originate it (though, per Section 4.4, its own judgment calls at this stage are creative in nature, not purely mechanical).
- This Pod does not add typography, titles, or motion graphics — that's Motion Graphics & Typography's job, working in parallel with Assembly rather than as a step within it.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive the locked master audio track (from Audio, POD-05) and the finished, Polish-approved shots from all Scene Pods covering the episode, plus the original Pre-Vis animatic as a pacing reference (see Section 5.1).
2. Technical Assembly Engineer ingests all finished shots into the timeline shell, initially structured around the locked animatic's sequencing.
3. Editor reviews the assembled rough cut against the locked audio track and animatic, checking that pacing, cut timing, and shot-to-shot flow actually serve the episode as a whole — not just that each individual shot is technically present and correctly timed.
4. Apply global color grading across all shots to harmonize lighting and palette inconsistencies that inevitably arise from Scene Pods having rendered in isolation, even when all pods used the same Foundation-locked style embeddings.
5. Where a cut doesn't work — a transition that reads as jarring, a pacing issue only visible once shots are seen in sequence — the Editor identifies the specific shot(s) responsible and determines whether the fix is achievable within Assembly (a re-cut, a trim, a color adjustment) or requires a formal request back to the responsible upstream Pod (a genuine re-render).
6. Compile the finished, harmonized cut into the master episode file.
7. Submit the assembled cut for review — see Section 3.3 for the back-brief structure specific to this Pod's contested placement.
8. On approval, publish the finished episode cut to the shared registry and notify downstream Pods (Localization, Mastering & QC, Metadata).

**Human roles inside the Pod and division of labor:**
- **Editor** — the creative-pacing vector. Owns whether the assembled sequence actually works as a viewing experience; makes the judgment calls about cut timing, transition choices, and color-grade harmonization.
- **Technical Assembly Engineer** — the compilation vector. Owns the automated Remotion scripting and NLE tooling that mechanically stitches shots together; executes the Editor's decisions rather than making independent creative calls.
- **Why split rather than combined:** timeline-compilation tooling (especially automated Remotion scripting across potentially dozens of Scene Pod outputs) is technically involved enough that a solo operator risks the same "sucked into the machine" trap described generally for hybrid pods — losing sight of whether the cut actually *works* while debugging why a script won't ingest a particular Scene Pod's output format correctly.

**Tooling specifics:** Remotion scripts handle the mechanical stitching and timeline compilation; the Editor works in a traditional NLE for fine-grained cut and pacing decisions once the rough assembly exists; color-grading tools apply global LUTs and per-shot adjustments to harmonize footage that was rendered independently.

**Known failure modes of this Pod's own process, and internal catches:**
- *A cut that satisfies the locked animatic's timing but doesn't actually feel right once real (rather than rough Pre-Vis) footage is in place* — caught by treating the animatic as a reference, not a rigid mandate; the Editor is expected to deviate from animatic timing where the final footage genuinely calls for it, flagging significant deviations back to the Showrunner rather than silently reworking the intended structure.
- *Color grading that harmonizes shots technically but flattens the intended mood variation between scenes* — mitigated by grading with reference to Foundation's locked style embeddings and the episode's emotional arc (from Narrative's beat sheet), not just numerical shot-to-shot matching.
- *A pacing problem that's actually a Scene Pod-level issue (a shot that's simply too slow) being incorrectly treated as fixable in the edit* — mitigated by the Editor explicitly distinguishing "fixable within Assembly" from "requires an upstream re-render" (step 5) rather than defaulting to patching around a problem that really needs to go back to its source.

**Idle/blocked behavior:** This Pod fully blocks on assembling a given episode until the locked audio track (Audio) and at least the initial Pre-Vis animatic are available, since both anchor the sequencing this Pod works against. However, Assembly may begin ingesting individual finished shots from Scene Pods as they complete, rather than waiting for every Scene Pod covering the episode to finish — partial, incremental assembly is possible and preferred over idling, since Scene Pods complete asynchronously and Assembly's own timeline would otherwise be needlessly compressed at the end of the episode's production cycle.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives is typically inherited rather than freshly stated — it is the same episode-level narrative and emotional intent originally set by the Showrunner and translated by Narrative (e.g., *"Episode 3's climax needs to land as the emotional turning point of the season"*), now applied to the *sequencing and pacing* of already-finished shots rather than to their content. The Pod's output preserves this intent regardless of the specific cutting choices, transition styles, or grading adjustments used to serve it — success is judged by whether the assembled episode actually delivers the intended emotional experience, not by whether it followed the animatic's exact timing.

### 3.2 Values as Boundary Conditions
- **Whole-episode coherence over any single shot's individual merit:** if an individually beautiful shot doesn't serve the episode's pacing once seen in sequence, this Pod is authorized to trim, re-time, or in rare cases request the shot be reconsidered — the episode as a whole outranks any single Scene Pod's local achievement.
- **Escalate genuine re-renders rather than patch around them:** this Pod is explicitly not authorized to indefinitely "fix in the edit" a problem that's actually a Scene Pod-level defect — a persistent pacing or quality issue traceable to a specific shot must be flagged upstream (Section 2, step 5) rather than absorbed as extra editorial effort every time, since papering over a Scene Pod defect at the Assembly stage hides a quality signal that Scene Pods and Polish need to actually see.
- **Deviate from the animatic when the real footage calls for it, but flag significant deviations:** the Pre-Vis animatic is a reference and pacing validator, not a rigid mandate this Pod must mechanically reproduce — but a significant departure from the locked animatic's intended structure is reported back to the Showrunner (Section 2, known failure modes) rather than treated as a purely local editorial call.

### 3.3 Back-Brief
**This Pod's back-brief is structurally different from most others, directly because of its contested macro-node placement (Section 4.4).** Because Assembly's decisions are creative in nature even though its inputs are technical, this Pod submits **two distinct back-briefs to two different reviewers**, rather than a single review:
- **To the Blueprint Lead / Showrunner (creative review):** a rough cut is submitted for review of pacing, sequencing, and whether the assembled episode is actually delivering the intended emotional experience — the same "eyes closed" style acid test used by Audio, but applied to the full assembled picture-and-sound experience rather than audio alone.
- **To the Supply Chain Lead (technical/delivery review):** the same cut is checked for whether it meets the technical baseline Mastering & QC and Metadata will need downstream (correct format, complete shot coverage, no missing segments) — a lighter, more mechanical check than the creative review.

**Weaker-signal risk mitigation:** because the creative back-brief here involves a human (the Editor and Showrunner) reviewing an assembled human-and-AI-produced sequence together, it is closer to the stronger, explanation-capable end of the back-brief spectrum rather than an artifact-only AI preview — but the Pod remains exposed to a subtler version of the general risk: an assembled cut can satisfy both back-briefs (creatively coherent, technically complete) while still resting on Scene Pod outputs whose individual quality issues were "cut around" rather than genuinely resolved. This is why Section 3.2's escalate-rather-than-patch value exists — it's the direct mitigation for this specific risk.

### 3.4 Global Read / Local Write
**Private working state:** the in-progress rough cut, unresolved pacing decisions, and rejected color-grade attempts are visible only within the Pod while assembly is happening.

**Finalized write:** once both back-briefs (Section 3.3) pass, the Pod writes the finished episode cut once, immutably, to the shared registry, with a version tag.

**Read access:** Localization, Mastering & QC, and Metadata & Ingestion may read the finished cut freely; Score & Composition may also read it if final musical sync adjustments are needed post-assembly (though ideally most of this was resolved using the animatic — see Score's own upstream relationship to Pre-Vis).

**No downstream mutation:** confirmed — no downstream Pod (Localization, Mastering, Metadata) may re-edit the assembled cut directly. If Mastering & QC finds a technical issue during broadcast-spec mastering that traces back to an editorial choice, it must submit a formal request back to Assembly rather than silently adjusting the cut itself.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** the locked master audio track (Audio, POD-05), the locked Pre-Vis animatic (POD-14), and Polish-approved finished shots from all relevant Scene Pods (POD-15) for the episode.

**Formal output contract:** one finished, harmonized episode cut, delivered in the format Localization, Mastering & QC, and Metadata require as their own input contract.

**Contract change process:** if this Pod's output format needs to change (e.g., a new color-space requirement from Mastering & QC), the change is coordinated directly with Mastering & QC and announced via Infrastructure's event system, with a defined transition window unless a broadcast-compliance deadline requires an immediate cutover.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** incremental — begins ingesting individual finished shots as Scene Pods complete them (Section 2, idle/blocked behavior), with full rough-cut assembly triggered once the locked audio track and animatic are both available and a sufficient portion of Scene Pod shots are complete.

**Trigger this Pod's output causes downstream:** publishing the finished cut fires an automated notification (via Infrastructure) to Localization, Mastering & QC, and Metadata & Ingestion that the episode is ready for their respective downstream processes.

### 3.7 Black-Box Autonomy
While assembling and iterating on the cut, this Pod is not required to expose intermediate cut attempts, rejected transitions, or draft color-grade passes to any other Pod. The only checkpoints visible outside the Pod are the two back-briefs (Section 3.3) and the final publication — Scene Pods, in particular, do not get visibility into how their shots were ultimately sequenced or trimmed during assembly, consistent with their own isolation.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-05 Audio Pod | Locked master audio track | v1.0 | Full block on beginning assembly — Assembly cannot sequence against unlocked or missing audio |
| POD-14 Pre-Vis & Animatic | Locked animatic, used as the baseline pacing reference and initial timeline shell | v1.0 | Full block — without an animatic reference, Assembly has no structural baseline to build the rough cut against |
| POD-15 Scene Pods | Polish-approved finished shots | v1.0 | Partial block — Assembly can begin incremental work on completed shots (Section 2, idle/blocked behavior) but cannot finish the cut until all relevant shots are delivered |
| POD-13 Polish Pod | Confirmation that shots are cleanup-complete before being handed to Assembly | v1.0 | If a shot reaches Assembly without Polish sign-off, Assembly risks assembling against footage with uncorrected artifacts that will need to be revisited later — a quality risk, not a hard block |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-17 Localization & Accessibility | The finished, locked episode cut | v1.0 | Cannot begin dubbing, captioning, or accessibility work until Assembly's cut is finalized — timing and dialogue placement are fixed inputs they must work around |
| POD-18 Mastering & QC | The finished, locked episode cut | v1.0 | Cannot begin broadcast-spec mastering until the creative edit is locked — any late editorial change after this handoff requires a formal re-request back through Assembly, not a direct fix at the mastering stage |
| POD-19 Metadata & Ingestion | The finished, locked episode cut and its associated technical metadata | v1.0 | Packaging and delivery timing are keyed to Assembly's publication event |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates in parallel with Score & Composition (POD-16) around final musical timing — Score composes against the locked animatic upstream of Assembly, but Assembly's actual cut may shift timing slightly from the animatic (Section 3.2), which can require Score to make small adjustments after seeing the assembled picture. This is a two-way coordination rather than a strict dependency in either direction, since both Pods are working from the same animatic baseline and only need to reconcile divergences that emerge once real footage replaces the rough Pre-Vis reference.

### 4.4 Position in the Macro-Node Structure — The Contested Placement
**This Pod's placement is explicitly a bridge, not a clean fit into either macro-node, and the spec should not paper over that tension.**

- **The case for Supply Chain (its current primary placement):** Assembly's *inputs* are entirely technical, finished assets (locked audio, finished shots) — the same kind of "take finished creative work and prepare it for the next system downstream" pattern as Localization, Mastering & QC, and Metadata, its actual downstream neighbors.
- **The case for Generative Core:** Assembly does not create pixels, but its *decisions* — pacing, cut timing, whether a sequence emotionally lands — are genuinely creative judgment calls, much more similar in kind to what Scene Pods and the Editor's counterparts elsewhere in Blueprint do than to Mastering & QC's largely deterministic, spec-driven technical work.
- **The resolution used in this spec:** Assembly's Lead attends **both** the Supply Chain sync (since its immediate neighbors and delivery obligations sit there) **and** the Blueprint sync (since its creative decisions should trace back to the Showrunner's original intent, not just downstream technical compliance) — formalized concretely as the dual back-brief structure in Section 3.3, rather than left as an unresolved ambiguity.
- **Why this matters practically:** the alternative — treating Assembly as purely technical and only checking its output at final QC — pushes a Blueprint-tier creative mistake (bad pacing, a sequence that doesn't land) to the latest and most expensive point in the pipeline to catch it, which is exactly the failure mode the whole back-brief philosophy exists to prevent.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Locked master audio track | Audio Pod (POD-05) | `.WAV` + timecode JSON | v1.0 | Required |
| Locked animatic | Pre-Vis & Animatic Pod (POD-14) | Video reference file | v1.0 | Required |
| Polish-approved finished shots | Scene Pods (POD-15), via Polish (POD-13) | Video files | v1.0 | Required (per-shot, incremental) |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Finished, harmonized episode cut | Localization, Mastering & QC, Metadata & Ingestion | Master video file | v1.0 | Y |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** "fixing in the edit" a problem that's actually a Scene Pod-level defect — trimming around, re-timing, or color-correcting a genuinely weak shot repeatedly across episodes rather than escalating it, because escalation feels slower than a local edit fix in the moment. This quietly degrades overall quality over a season while making each individual instance look like a reasonable editorial judgment call, and it also deprives Scene Pods and Polish of the quality signal they need to actually improve.

**Weaker-signal risk (dual back-brief structure):** because this Pod's creative back-brief involves human judgment (not an AI-only artifact preview), the framework's general AI-back-brief risk is less directly applicable here — but a related risk exists: a cut can pass *both* back-briefs (creatively coherent, technically complete) while still resting on shots whose individual flaws were absorbed into the edit rather than resolved at the source, exactly as described above. **Mitigation:** the explicit "escalate rather than patch" value (Section 3.2) and the requirement that Editor judgment calls distinguish "fixable in Assembly" from "needs an upstream re-render" (Section 2, step 5) as a formal part of the workflow, not an informal preference.

**Cost of an undetected error:** moderate to high, and specifically *back-loaded* — an editorial pacing problem that isn't caught at Assembly's own back-brief stage is likely to be caught later at Mastering & QC or even by the studio itself, which is a much more expensive and reputationally costly point to discover a creative flaw than during Assembly's own review. This is the direct justification for the dual back-brief structure (Section 3.3) rather than a single, purely technical sign-off.

**Escalation path:** if the Editor and the Blueprint Lead/Showrunner disagree on whether an assembled cut is working, this is resolved directly between them, the same pattern used at the Narrative back-brief stage — Assembly does not have an intermediate escalation layer of its own above the Showrunner for creative disputes, though technical disputes (with Mastering & QC, for instance) are resolved with the Supply Chain Lead.

---

## 7. Boundary Conditions and Scope limits

- This Pod is explicitly forbidden from publishing a finished cut without passing **both** back-briefs described in Section 3.3 — the creative review and the technical/delivery review are both required, not alternatives to each other.
- This Pod may not indefinitely "fix in the edit" a shot-level defect that should be escalated to Scene Pods or Polish (Section 3.2, Section 6) — repeated local patching of the same underlying issue across multiple episodes is itself a signal that should trigger escalation, not just another editorial pass.
- Significant deviations from the locked Pre-Vis animatic's intended pacing structure must be flagged to the Showrunner, even if the Editor believes the deviation genuinely improves the episode — this Pod does not have unilateral authority to redefine the intended structure, only to execute within and around it.
- Default resource allocation: no explicit compute ceiling applies to this Pod in the way it does to Scene Pods (editorial work is comparatively low-compute relative to rendering), but repeated back-brief rejection cycles beyond two rounds on a single episode should be escalated as a signal of unclear intent or a deeper upstream problem, not simply absorbed as normal iteration.

---

## 8. Success Criteria

- The Showrunner (or Blueprint Lead) knows this Pod succeeded when the assembled episode plays as one coherent creative work — pacing, color, and flow all read as intentional — without needing to know which shots came from which isolated Scene Pod.
- The Supply Chain Lead knows this Pod succeeded when the delivered cut meets Localization, Mastering & QC, and Metadata's technical baseline requirements without requiring rework at those later stages.
- A rejected cut (from either back-brief) is returned to Assembly with specific feedback — pacing/sequencing notes from the creative reviewer, or format/completeness notes from the technical reviewer; the Pod revises locally and resubmits.
- **Contract success:** the cut is delivered in the correct format, with complete shot coverage, on schedule.
- **Intent success:** the assembled episode actually delivers the emotional experience the Showrunner's original intent called for, and does so without having quietly absorbed unresolved shot-level defects.
- **Concrete divergence case for this Pod:** a cut could be contract-compliant (correct format, every shot present, delivered on time) while still failing intent if the pacing technically follows the animatic's timing but the sequence doesn't land emotionally once real footage replaces the rough reference — exactly why the creative back-brief is a human "eyes open, watching the whole thing" review, not an automated completeness check.

---

## 9. Open Questions / Notes

- The dual back-brief structure (Section 3.3) is the most structurally unusual element of this spec relative to other Pods, and it's a direct design response to the Assembly placement question raised earlier in this framework rather than a pattern used elsewhere — worth monitoring in practice whether requiring two separate reviews meaningfully slows this Pod down relative to the single-review pattern most other Pods use, and whether that trade-off is worth the coverage it provides.
- **[Resolved]** The repeated-local-patching escalation threshold is addressed by the cross-Pod escalation standard (see `cross_pod_escalation_threshold_standard.md`): three episodes showing the same underlying shot-level defect being "fixed in the edit" now triggers mandatory escalation to the responsible upstream Pod, using a cross-episode unit rather than within-session iteration, since this Pod's risk (Section 6) is specifically about a pattern accumulating across episodes.
- This Pod's internal workflow draws on solid source material describing its core function (stitching disparate Scene Pod outputs, global color grading, ingesting the animatic as a timeline shell) but the specific dual-back-brief resolution to its contested placement is an original design addition built to resolve a tension the source material itself left unresolved — this should be treated as the most interpretively significant addition in this spec, not a neutral elaboration of existing detail.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec — formalizes the dual back-brief (Blueprint + Supply Chain) as the resolution to this Pod's contested macro-node placement | N (no other existing Pod spec's contract changes as a result — this Pod's own back-brief structure is new but doesn't alter what Localization, Mastering & QC, or Metadata receive as input) |

- **Deprecation policy:** a finished episode cut is never deleted, only superseded by a new version if a late revision is required (e.g., a post-delivery correction) — prior versions remain available since Mastering & QC or Metadata may need to trace back to exactly what they originally processed.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.