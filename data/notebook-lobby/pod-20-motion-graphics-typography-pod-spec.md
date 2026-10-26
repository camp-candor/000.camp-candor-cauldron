# Pod Specification: POD-20 — Motion Graphics & Typography Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Motion Graphics & Typography Pod |
| **Alternate/Node Name** | The Vector Node |
| **Macro-Node / Tier** | Generative Core (criticality Tier 4 — Compliance & Delivery) |
| **Headcount (human)** | 2 — one Motion Graphics Designer (title sequences, end crawls, in-world UI/HUD design), one Compositor (integrating vector/typographic elements onto Scene Pod plates using traditional tools) |
| **Pod Lead / Accountable Owner** | The Motion Graphics Designer. Holds sign-off authority on whether typographic and motion-graphics elements are ready for delivery to Assembly; the Compositor owns technical integration onto the underlying plates but does not have authority to approve final design choices independently. |
| **Primary AI/Compute Tooling** | Traditional, non-generative compositing tools (After Effects, Nuke, or equivalent) for vector-based typography, logo animation, and motion graphics — deliberately not using generative AI models for this Pod's core deliverables |
| **One-Sentence Mission** | Produce every piece of crisp, legible on-screen text and motion graphics the series needs — titles, credits, in-world signage, UI elements — using traditional tools, specifically because generative AI cannot reliably render stable, correctly-spelled text. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** generative AI models are notoriously unreliable at rendering legible, correctly-spelled, temporally stable text — asking a Scene Pod to generate an opening title card or in-world signage risks hallucinated, alien-looking characters or text that flickers and warps across frames. This isn't a quality problem Polish can reasonably absorb through inpainting, because text has zero tolerance for approximation the way a background texture does — a single wrong letter is immediately, obviously broken in a way a slightly-off shadow is not. This Pod exists specifically as a **deliberately non-generative** counterpart within Generative Core, using traditional compositing tools precisely because the generative approach used everywhere else in this macro-node is the wrong tool for this specific job.

**Single most important outcome this Pod is accountable for:** every typographic and motion-graphics element in the finished series — main titles, end crawls, translated on-screen signage, in-world UI/HUD elements — is crisp, correctly spelled, and temporally stable, composited cleanly onto the "clean" plates Scene Pods and Polish deliver.

**Explicitly outside this Pod's purpose:**
- This Pod does not generate or alter the underlying scene content — it works entirely from Polish-cleaned plates as a fixed base layer, adding typographic/graphic elements on top, not modifying what's beneath them.
- This Pod does not use generative AI for its core typographic deliverables — this is a hard, defining boundary of this Pod's existence (Section 7), not a stylistic preference; if a task seems to require generative text rendering, that's a signal the task doesn't belong in this Pod's scope as currently defined.
- This Pod does not translate on-screen text into other languages — that's Localization's job for its own deliverables (dubbing cards); this Pod produces the original-language typographic elements and, where a scene's in-world text needs multiple language versions baked into the plate itself (as opposed to Localization's separate overlay), coordinates directly with Localization on that specific need.
- This Pod does not make narrative or story decisions about what on-screen text should say — that traces back to Narrative's script and any specific text content it specifies; this Pod executes the visual design and technical integration of text that's already been determined to be needed.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive Foundation's locked style embeddings (for visual language consistency — palette, typographic tone matching the show's aesthetic) and the specific typographic/motion-graphics requirements for a given deliverable: main titles, end crawl, or a specific scene's in-world text element (see Section 5.1).
2. Motion Graphics Designer designs the typographic treatment — font choice, animation style, timing — ensuring it harmonizes with Foundation's locked visual language rather than introducing an unrelated aesthetic.
3. For scene-specific in-world elements (signage, UI/HUD), receive the relevant Polish-cleaned plate from Polish (or, for elements integrated earlier in the pipeline, coordinate timing with the responsible Scene Pod) as the base layer to composite onto.
4. Compositor integrates the designed typographic/graphic element onto the base plate using traditional compositing tools — tracking, matching lighting/perspective, and ensuring the element reads as native to the shot rather than obviously overlaid.
5. Internal review: check the composited result for legibility, correct spelling (a straightforward but non-negotiable check, given this Pod's entire reason for existing), and temporal stability across the full duration the element appears.
6. For title sequences and end crawls specifically, submit to the Showrunner for creative sign-off, since these are highly visible, identity-defining elements of the series distinct from a routine in-world sign.
7. Publish the finished element to the shared registry, either as a standalone asset (title sequence, end crawl) or as a composited-in element within a specific scene's plate.
8. Notify Assembly (via Infrastructure's event system) that the element is ready for integration.

**Human roles inside the Pod and division of labor:**
- **Motion Graphics Designer** — the design vector. Owns typographic and motion-graphics creative choices — font, animation, visual harmony with the show's established aesthetic.
- **Compositor** — the integration vector. Owns the technical work of tracking and compositing a designed element cleanly onto an existing plate.
- **Why split rather than combined:** designing a typographic treatment and technically compositing it onto a moving, generatively-rendered plate (matching perspective, lighting, and camera movement) are different skills — a designer without compositing technique risks an element that looks pasted-on rather than integrated, and a compositor without design judgment risks technically clean integration of a typographically weak or tonally mismatched design.

**Tooling specifics:** this Pod deliberately uses traditional, non-generative compositing tools (After Effects, Nuke, or equivalent) rather than any generative model — this tooling choice is itself a direct expression of this Pod's purpose (Section 1), not an incidental detail.

**Known failure modes of this Pod's own process, and internal catches:**
- *A typographic element that's beautifully designed in isolation but doesn't track correctly onto a moving plate, causing it to swim or drift relative to the scene* — mitigated by the Compositor's dedicated technical integration pass (step 4) being treated as equally important as the initial design, not a routine afterthought.
- *A misspelling or legibility issue that generative AI would have introduced accidentally, ironically reintroduced through human error during manual design* — mitigated by treating spelling/legibility verification (step 5) as a non-negotiable, always-performed check regardless of how routine or low-risk a given text element seems.
- *Title sequences or end crawls proceeding without genuine Showrunner sign-off*, given how identity-defining these specific elements are relative to routine in-world text — mitigated by step 6 explicitly distinguishing these high-visibility deliverables as requiring a dedicated creative review, separate from this Pod's normal internal-only review for routine elements.

**Idle/blocked behavior:** For scene-specific in-world elements, this Pod blocks on receiving the relevant Polish-cleaned plate before compositing can begin. For standalone deliverables like the main title sequence or end crawl, this Pod can work largely independently of any single scene's production timeline, using only Foundation's locked style embeddings and the Showrunner's aesthetic intent — these deliverables are not tied to a specific scene's completion the way in-world text integration is.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives varies by deliverable type: for the main title sequence, something like *"establish the show's identity in the first ten seconds — biopunk-noir, unsettling, memorable"*; for routine in-world text, something narrower like *"this sign needs to be legible and consistent with the location's established visual language."* Note neither specifies exact font choice, animation technique, or compositing approach — this Pod is free to determine its own execution as long as the resulting element serves its stated purpose and integrates cleanly.

### 3.2 Values as Boundary Conditions
- **Traditional tools over generative shortcuts, always:** this Pod does not use generative AI to render text, even where a generative approach might seem faster for a simple case — this is the Pod's core defining boundary (Section 7), not a case-by-case judgment call.
- **Legibility and correctness over stylistic ambition:** an on-screen text element that's visually striking but hard to read, or that contains any spelling error, fails this Pod's purpose regardless of its aesthetic merit — text has to actually communicate, which is a harder requirement than most of this Pod's other visual choices.
- **Native integration over visible overlay:** a composited element should read as though it belongs in the shot (correct perspective, lighting, tracking), not as an obviously pasted-on graphic — this value drives the Compositor's dedicated technical role (Section 2, step 4) rather than treating integration as a trivial final step.

### 3.3 Back-Brief
**Internal back-brief:** a rough compositing test — checking that a designed element tracks correctly onto a sample of the target plate — before committing to full, polished integration across the element's full duration; a cheap-preview-before-full-commitment pattern applied to compositing technique rather than creative content.

**Pod-to-Showrunner back-brief (title sequences and end crawls only):** these specific, highly visible deliverables get a dedicated creative review with the Showrunner (Section 2, step 6) before final publication — routine in-world text elements do not require this level of review, since their creative stakes are much lower.

**Weaker-signal risk mitigation:** this Pod's work is almost entirely outside the AI-artifact-only back-brief risk described elsewhere in this framework, precisely because it deliberately avoids generative AI for its core output (Section 3.2) — there is no unstable AI interpretation to guard against here, since a human is directly designing and compositing every element. The residual risk is closer to Mastering & QC's and Metadata's objective-verification risk (did the spelling check actually catch every error, did the tracking actually hold across the full duration) than to any generative-interpretation risk.

### 3.4 Global Read / Local Write
**Private working state:** in-progress designs, rejected compositing attempts, and draft typographic treatments are visible only within the Pod while iteration is happening.

**Finalized write:** once reviewed (internally, or by the Showrunner for title sequences/end crawls), the Pod writes the finished element once, immutably, to the shared registry — either as a standalone asset or as a composited-in element within a specific scene's plate.

**Read access:** Assembly reads finished elements for integration into the episode cut.

**No downstream mutation:** confirmed — Assembly may not re-edit or re-composite a delivered typographic element directly; any issue is submitted as a formal request back to this Pod.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** Foundation's locked style embeddings, Polish-cleaned plates (for scene-specific in-world elements), and the specific typographic/motion-graphics requirement (from Narrative's script for content, or the Showrunner directly for title sequences).

**Formal output contract:** a finished, integrated typographic or motion-graphics element, delivered in the format Assembly requires — either as a standalone asset or composited into a specific scene's plate.

**Contract change process:** if this Pod's delivery format needs to change (e.g., a new layer-separation requirement from Assembly for more flexible integration), the change is coordinated directly with Assembly and announced via Infrastructure's event system.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** for in-world elements, receipt of a Polish-cleaned plate requiring text/graphics integration; for standalone deliverables (titles, end crawls), receipt of the Showrunner's aesthetic intent, independent of any specific scene's production timeline.

**Trigger this Pod's output causes downstream:** publishing a finished element fires an automated notification (via Infrastructure) to Assembly that the element is ready for integration.

### 3.7 Black-Box Autonomy
While designing and compositing, this Pod is not required to expose in-progress design drafts, rejected typographic treatments, or intermediate compositing attempts to any other Pod. The only checkpoints visible outside the Pod are the Showrunner review (for title sequences/end crawls specifically) and the final published element.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-07 Foundation Pod | Locked style embeddings, for visual/typographic language consistency | v1.0 | Soft block — this Pod can proceed with generic typographic choices, but risks producing elements that don't harmonize with the show's established visual identity |
| POD-13 Polish Pod | Polish-cleaned plates (for scene-specific in-world elements only) | v1.0 | Full block on that specific in-world element — cannot composite text onto a plate that isn't yet clean; standalone deliverables (titles, end crawls) are unaffected |
| POD-08 Narrative Pod | Specific in-world text content requirements (what a sign should say, what UI text should read) | v1.0 | Full block on that specific text element — cannot design or composite text without knowing what it needs to say |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-10 Assembly Pod | Finished typographic/motion-graphics elements — standalone (titles, end crawls) and composited-in (scene elements) | v1.0 | Integrates these elements into the final cut at the appropriate points; may not re-edit or re-design them directly |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates informally with Localization & Accessibility (POD-17) on the rare occasion an in-world text element needs multiple baked-in language versions rather than a separate overlay (Section 1) — this is occasional, task-specific coordination rather than a standing dependency, since the large majority of this Pod's work involves original-language elements that Localization handles separately via its own dubbing-card overlay process.

### 4.4 Position in the Macro-Node Structure
This Pod sits within Generative Core despite being deliberately non-generative — its placement reflects that it works with the same raw material (Scene Pod plates) and serves the same immediate purpose (producing finished, polished frames) as Scene Pods and Polish, even though its specific tooling approach is the opposite of generative. This is analogous to Polish's placement: both Pods exist within Generative Core specifically to compensate for something generative AI does badly, without themselves being generative processes.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Locked style embeddings | Foundation Pod (POD-07) | Style guide / embeddings | v1.0 | Required (soft — see 4.1) |
| Polish-cleaned plates | Polish Pod (POD-13) | Video files | v1.0 | Required (for in-world elements only) |
| In-world text content requirements | Narrative Pod (POD-08) | Text specification | v1.0 | Required (for in-world elements only) |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Main title sequence, end crawl | Assembly Pod (POD-10) | Standalone video asset | v1.0 | Y |
| In-world text/UI elements, composited | Assembly Pod (POD-10) | Composited video files (integrated into scene plates) | v1.0 | Y |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** a composited element passes the internal legibility/spelling check in a static or slow-moving frame, but reveals tracking drift, flicker, or a legibility problem only once seen at full playback speed across the entire duration it appears — a defect that a frame-by-frame or paused review might miss but that becomes obvious the moment the audience actually watches the finished sequence.

**Weaker-signal risk (framework-general, applied here):** because this Pod deliberately avoids generative AI, it's largely insulated from the framework's core AI-artifact-only back-brief risk — but it has its own narrower analog: a compositing test reviewed on a short sample or at reduced playback speed might not reveal a problem that only manifests at full speed across the full duration. **Mitigation used by this Pod:** the internal review (Section 2, step 5) explicitly checks temporal stability "across the full duration the element appears," not just a representative sample — a direct, deliberate design choice to close this specific gap.

**Cost of an undetected error:** low to moderate and highly visible rather than hidden — unlike most other Pods' failure modes, a broken or misspelled on-screen text element is immediately, obviously wrong to any viewer the moment it airs, making this one of the few failure modes in the entire framework that a human audience would catch instantly rather than one requiring specialized review to notice. This makes the failure mode embarrassing and reputationally costly despite being technically minor to fix.

**Escalation path:** if Assembly discovers a typographic or motion-graphics element doesn't work once integrated into the full cut (a timing mismatch, an unexpected clash with a transition), this is escalated back to this Pod directly for revision — a routine, low-stakes escalation for most elements, though a problem discovered in the main title sequence or end crawl specifically would be escalated to the Showrunner as well, given those deliverables' higher creative visibility (Section 2, step 6).

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly and permanently forbidden from using generative AI models to render its core typographic deliverables — this is the Pod's foundational reason for existing (Section 1), not a preference that could reasonably be revisited as generative text-rendering technology improves, without first re-examining whether this Pod's separate existence is still justified.
- This Pod may not publish a title sequence or end crawl without the Showrunner's creative sign-off (Section 2, step 6) — these specific deliverables do not fall under this Pod's normal internal-review-only process.
- This Pod does not have authority to decide what in-world text should say — that content originates from Narrative's script; this Pod executes the visual design and integration of already-determined content.
- Default resource allocation: this Pod's compute needs are minimal (traditional compositing, not generative rendering) — its primary constraint is design/compositing time, not GPU allocation, and it does not compete with Scene Pods for the same compute resources Infrastructure schedules.

---

## 8. Success Criteria

- Assembly knows this Pod succeeded when every delivered element integrates cleanly, is legible and correctly spelled, and holds up at full playback speed across its entire duration without requiring rework.
- A returned element (from Assembly, or from the Showrunner for title sequences/end crawls) includes specific feedback; this Pod revises and resubmits.
- **Contract success:** the element is delivered in the correct format, correctly integrated or ready for integration, on schedule.
- **Intent success:** the element actually reads as legible, correctly spelled, and tonally consistent with the show's identity at full playback speed — not just in a paused or sampled review.
- **Concrete divergence case for this Pod:** an element could be contract-compliant (delivered on time, in the correct format, passing a quick internal glance) while still failing intent if it wasn't actually checked at full playback speed across its complete duration and a tracking or legibility issue only shows up there — exactly the risk in Section 6, and why the internal review step is explicitly scoped to full-duration, full-speed verification rather than a quick static check.

---

## 9. Open Questions / Notes

- Per the cross-Pod escalation standard (`cross_pod_escalation_threshold_standard.md`), this Pod's default iteration threshold isn't separately defined here — if a specific element requires repeated revision for the same underlying integration issue, the standard's default three-cycle rule applies.
- The coordination with Localization for multi-language baked-in in-world text (Section 4.3) is currently informal and occasional — worth monitoring whether this becomes more frequent than assumed here (e.g., if a season features significant amounts of in-world text needing native-language versions rather than overlay treatment), in which case it may deserve a more formal relationship rather than ad hoc coordination.
- This Pod's internal workflow draws on solid, specific source material (its deliberately non-generative nature, the specific rationale about AI's unreliability with text and vector graphics, its role producing title sequences/end crawls/in-world UI) — comparable in grounding to Foundation, Audio, and Polish, though the specific headcount split and full-playback-speed review discipline in Section 6 are reasoned elaborations rather than verbatim source detail.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |

- **Deprecation policy:** a delivered typographic/motion-graphics element is never deleted, only superseded by a new version if revised — prior versions remain available since Assembly may need to trace back to exactly what it originally integrated.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.