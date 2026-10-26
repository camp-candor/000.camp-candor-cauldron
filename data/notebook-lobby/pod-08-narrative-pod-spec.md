# Pod Specification: POD-08 — Narrative Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Narrative Pod |
| **Alternate/Node Name** | The Script & Storyboard Node |
| **Macro-Node / Tier** | Blueprint (criticality Tier 2 — Foundational) |
| **Headcount (human)** | 2 — one Writer/Story Editor (dialogue, structure, emotional arc), one Prompt/Technical Translator (converts prose into machine-readable, prompt-annotated beat sheets) |
| **Pod Lead / Accountable Owner** | The Writer/Story Editor. Holds sign-off authority on whether a script is narratively locked and ready for downstream use; the Prompt/Technical Translator ensures the locked script is correctly encoded for machine consumption but does not have authority to alter story content to make it easier to translate. |
| **Primary AI/Compute Tooling** | LLM-assisted drafting and beat-sheet structuring tools, script-to-JSON conversion scripts, prompt-annotation tooling that maps emotional/narrative beats to technical descriptors (e.g., "a feeling of dread" → "low-angle tracking shot, 24fps, high contrast volumetric fog") |
| **One-Sentence Mission** | Convert the Showrunner's high-level episode arc into a finalized, locked, machine-readable script that every downstream pod treats as the immovable root of their own work. |
| **Spec Version** | v1.1 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** a finished 60-page script is not directly usable by a downstream Tech Artist or an AI pipeline — someone has to break it into scene-by-scene, timecode-aware, prompt-annotated units that a Scene Pod or Audio Pod can act on without needing to re-interpret raw prose. If this function were absorbed into the Showrunner's own role, the Showrunner would become a bottleneck for every single scene breakdown across the season; if it were pushed downstream to individual Scene Pods to interpret the script themselves, every pod would translate emotional intent into technical parameters differently, reintroducing exactly the kind of visual/tonal incoherence the Foundation Pod's asset-locking is designed to prevent, just in narrative form instead.

**Single most important outcome this Pod is accountable for:** producing a locked, structured, prompt-annotated script and beat sheet that is treated as the immutable root dependency for the entire creative pipeline — nothing downstream (Foundation, Audio, Pre-Vis, Scene Pods, Score) can stably begin until this Pod's output exists in locked form.

**Explicitly outside this Pod's purpose:**
- This Pod does not train or lock any visual assets — that's Foundation's job; Narrative describes what a character or location *is*, Foundation decides what it *looks like*.
- This Pod does not decide pacing at the audio/timing level — that's Audio's job; Narrative provides the beats and dialogue, Audio establishes the exact temporal grid.
- This Pod does not validate cross-episode consistency once scripts are written — that's Continuity/Canon's job; Narrative is responsible for internal consistency *within* what it writes, not for auditing consistency against everything previously locked.
- This Pod does not make final creative-intent calls independent of the Showrunner — Narrative translates and elaborates the Showrunner's intent, it does not originate the series' core creative direction from scratch.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive the Showrunner's high-level episode arc, tone directives, and any macro-level constraints (e.g., episode count, runtime, content-standards boundaries) — see Section 5.1.
2. Writer/Story Editor drafts the full script: dialogue, scene structure, character arcs, and emotional beats for the episode.
3. Internal review pass — Writer/Story Editor checks the draft against the Showrunner's stated intent for structural and tonal alignment before treating it as a candidate for lock.
4. Submit the draft to the Showrunner for the pod-to-Showrunner back-brief (see Section 3.3) before full downstream translation work begins — catching major structural or tonal misalignment while it's still cheap to revise.
5. On Showrunner approval, the Prompt/Technical Translator converts the locked script into a structured, prompt-annotated beat sheet — translating emotional intent into technical descriptors usable by downstream pods (e.g., "a feeling of dread" becomes explicit shot-composition and lighting language).
6. **Submit the Showrunner-approved script to the Continuity/Canon Pod (POD-11) for formal continuity review. This is a required, non-skippable gate — the script may not be published until Continuity/Canon issues a formal pass certification.** Continuity/Canon operates under a fixed one-business-day SLA (see their Section 3.3); if a contradiction report is returned instead of a pass, Narrative revises the flagged material and resubmits — the script does not advance to step 7 until a pass is issued.
7. Publish the final locked script and JSON-structured beat sheet to the shared registry.
8. Notify downstream pods (via Infrastructure's event system) that a new locked script is available.

**Human roles inside the Pod and division of labor:**
- **Writer/Story Editor** — the narrative vector. Owns dialogue quality, structure, and emotional truth; does not need to think in terms of machine-readable formatting while drafting.
- **Prompt/Technical Translator** — the encoding vector. Owns converting locked prose into the structured, prompt-annotated format downstream pods actually consume; does not have authority to alter narrative content, only its technical representation.
- **Why split rather than combined:** writing well and encoding precisely for machine consumption are different cognitive modes — a writer thinking simultaneously about emotional truth and technical shot-composition language risks producing prose that reads as stage direction rather than story, or a translator without narrative training risks flattening emotional nuance into technically correct but tonally generic descriptors.

**Tooling specifics:** LLM-assisted drafting tools support the Writer/Story Editor's process but do not replace their judgment on structure or dialogue; script-to-JSON conversion tooling and the emotional-to-technical prompt-annotation mapping are owned by the Prompt/Technical Translator.

**Known failure modes of this Pod's own process, and internal catches:**
- *A script that reads well in prose but doesn't translate cleanly into scene-by-scene technical beats* — caught during step 5, when the Prompt/Technical Translator flags structurally ambiguous passages back to the Writer/Story Editor for clarification before locking, rather than guessing at intent during translation.
- *Emotional intent lost in technical translation* (e.g., "dread" becoming a generic "dark lighting" tag that could apply to any scene) — mitigated by the Translator working from a shared, evolving glossary of the show's specific technical-to-emotional mappings (established with Foundation) rather than improvising fresh translations each time.
- *A script locking before checking against established canon, producing an avoidable contradiction* — this is now structurally prevented rather than merely mitigated: Continuity/Canon's pass (step 6) is a required gate, so a script cannot reach publication without having been checked. The residual risk is narrower — a false negative from Continuity/Canon's own review process — and is Continuity/Canon's risk to manage (see their Section 6), not something Narrative additionally guards against.

**Idle/blocked behavior:** If the Showrunner's episode arc or tone directive is missing or unconfirmed, this Pod fully blocks on drafting that episode — writing against an unstable high-level arc risks producing a script that has to be substantially reworked once the arc firms up. However, the Pod may proceed with lower-risk preparatory work (character voice notes, location research, structural outlining) using only prior-episode context, since that groundwork is less likely to be invalidated by arc changes.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives is the Showrunner's episode-level directive — for example: *"Episode 3's climax needs to land as the emotional turning point of the season; the audience should feel that the protagonist has crossed a line they can't return from."* Note this specifies the *narrative function and emotional target* of the episode, not the exact dialogue, scene order, or specific plot mechanics used to achieve it. The Pod's output preserves this intent regardless of which specific narrative choices it makes to deliver that turning point — success is judged by whether the locked script actually produces that emotional turn, not by whether it followed a prescribed structure.

### 3.2 Values as Boundary Conditions
- **Structural clarity over prose elegance when the two conflict:** if a beautifully written passage doesn't translate cleanly into an actionable technical beat for downstream pods, this Pod prioritizes making the underlying narrative intent legible over preserving a specific turn of phrase — since an ambiguous script blocks every downstream pod, not just this one.
- **Lock stability over late improvement:** once a script is locked and published, this Pod does not informally revise it to chase small improvements — any change goes through the formal update process (Section 3.5), because Foundation, Audio, and Pre-Vis may already be building against the locked version.
- **Showrunner's intent over the writer's personal preference:** where the Writer/Story Editor's instinct diverges from the Showrunner's stated intent, the Pod defers to intent and raises the disagreement explicitly at the back-brief stage (Section 3.3) rather than quietly writing toward a different version of the scene.

### 3.3 Back-Brief
**Internal back-brief:** the Writer/Story Editor's own structural/tonal review pass against the Showrunner's intent, before submitting a full draft externally — a self-check to avoid wasting the Showrunner's review cycle on an obviously misaligned draft.

**Pod-to-Showrunner back-brief:** the full draft script itself, submitted before the Prompt/Technical Translator begins the expensive work of full technical annotation. This is deliberately sequenced *before* translation (not after) so that a major structural note from the Showrunner doesn't waste translation effort on a script that's about to change substantially.

**Weaker-signal risk mitigation:** unlike a purely AI-generated back-brief, this Pod's back-brief is a full human-written draft with accompanying reasoning available on request — closer to the stronger, explanation-capable end of the back-brief spectrum described generally in the framework. The Pod does not rely on an artifact-only signal here, which is appropriate given how expensive it is for a misunderstood *root* dependency to propagate.

### 3.4 Global Read / Local Write
**Private working state:** in-progress drafts, rejected structural approaches, and untranslated notes are visible only within the Pod while drafting is happening — no downstream pod should be building against an unlocked, in-progress script.

**Finalized write:** once approved by the Showrunner, the Pod publishes the locked script and its JSON-structured beat sheet once, immutably, to the shared registry, with a version tag.

**Read access:** every downstream Pod (Foundation, Audio, Pre-Vis, Scene Pods, Score, Continuity/Canon) may read the locked script and beat sheet freely.

**No downstream mutation:** confirmed — no downstream Pod may edit the locked script directly, even to fix what looks like a small error. Any issue found downstream (e.g., a Scene Pod discovering a stage direction is technically unfilmable) must be submitted as a formal request back to Narrative, which then produces a new versioned script rather than a silent patch.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** the Showrunner's episode-level arc, tone directive, and any macro constraints (runtime, content standards).

**Formal output contract:** a locked script (readable prose/dialogue format) and a corresponding JSON-structured, prompt-annotated beat sheet, published together as a versioned pair — the two must never be published independently of each other, since downstream pods rely on both being in sync.

**Contract change process:** if this Pod needs to revise a locked script after downstream pods have already begun work against it (e.g., a late structural note from the Showrunner), the revision is published as a new version, not an overwrite, and the Infrastructure Pod's event system notifies all downstream consumers of the change. Pods that have already produced work against the prior version (e.g., a Foundation LoRA trained against an earlier character description) are flagged for review rather than assumed to remain valid — this Pod does not assume downstream compatibility, it triggers an explicit re-check.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** receipt of a confirmed episode-level arc and tone directive from the Showrunner.

**Trigger this Pod's output causes downstream:** publishing a locked script and beat sheet fires an automated notification (via Infrastructure) to Foundation, Audio, Pre-Vis, and Score that new locked material is available — this is the single event that unblocks the largest number of downstream pods simultaneously in the entire production.

### 3.7 Black-Box Autonomy
While drafting is in progress, this Pod is not required to expose in-progress drafts, discarded structural approaches, or dialogue alternatives to any other pod. The only checkpoint visible outside the Pod is the back-brief submission to the Showrunner (Section 3.3) and, eventually, the final locked publication — no one else needs visibility into how many drafts it took to get there.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| Showrunner (direct) | Episode-level arc, tone directive, macro constraints | n/a (not a versioned artifact in the Pod registry sense) | Full block — this Pod cannot responsibly draft against an unconfirmed arc (see Section 2, idle/blocked behavior) |
| POD-11 Continuity/Canon | Formal pass certification (or contradiction report) — required before publication | v1.0 | **Full block** — Narrative cannot publish a locked script without this Pod's formal pass. Continuity/Canon's one-business-day SLA bounds how long this block can last under normal conditions (see their Section 3.3) |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-07 Foundation Pod | Locked character and location descriptions | v1.0 | Cannot begin training character LoRAs or locking environment checkpoints until this Pod's script is locked — full block, not a soft dependency |
| POD-05 Audio Pod | Locked script and scene-by-scene beat sheet | v1.0 | Cannot begin dialogue synthesis until this Pod's script is locked — full block |
| POD-14 Pre-Vis & Animatic | Narrative beats, camera directions, prompt-annotated scene descriptions | v1.0 | Blocking of animatic work until the relevant scene's script is locked |
| POD-15 Scene Pods | Prompt-annotated beat sheet (via Pre-Vis and Audio's downstream translation) | v1.0 | Indirect dependency — Scene Pods primarily consume Pre-Vis and Audio's outputs, but those in turn trace back to this Pod's locked script as root |
| POD-16 Score & Composition | Locked script and beat sheet, for understanding narrative/emotional arc ahead of composing | v1.0 | Cannot confidently time thematic cues without the locked emotional structure this Pod provides |
| POD-11 Continuity/Canon | Every newly locked script, as the primary input to the story-state ledger | v1.0 | Must incorporate each new locked script into the ledger — cannot validate future scripts without this Pod's continuous output |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates informally with the Foundation Pod whenever a new character or environment is being introduced, to align on the technical-to-emotional prompt-annotation glossary (mentioned in Section 2) — but this is a shared-vocabulary coordination, not a blocking dependency in either direction; each Pod can technically proceed independently, though divergent vocabularies between the two would produce translation drift over time.

### 4.4 Position in the Macro-Node Structure
This Pod sits entirely within Blueprint, with no placement tension — it is, alongside Foundation, one of the two pods every other Blueprint pod (and much of Generative Core, indirectly) ultimately depends on. Unlike Assembly, there's no ambiguity here: both its inputs (Showrunner intent) and its outputs (locked creative material) are unambiguously Blueprint-tier.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Episode-level arc and tone directive | Showrunner (direct) | Prose directive | n/a | Required |
| Macro constraints (runtime, content standards) | Showrunner / Network Gateway (POD-02) | Structured constraints document | v1.0 | Required |
| Existing story-state ledger / formal pass certification | Continuity/Canon Pod (POD-11) | Structured, queryable canon record / certification | v1.0 | Required (hard gate) |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Locked script | Foundation, Audio, Pre-Vis, Score, Continuity/Canon | Prose / dialogue document | v1.0 | Y |
| Prompt-annotated, JSON-structured beat sheet | Foundation, Audio, Pre-Vis, Scene Pods (indirect) | JSON | v1.0 | Y |

---

## 6. Risk and Mitigation

**Single narrative-consistency failure mode specific to this Pod:** this risk is now substantially owned by Continuity/Canon rather than Narrative — since the gate (step 6) is hard and non-skippable, Narrative's own residual exposure is limited to whatever Continuity/Canon's own review process might miss (a false negative on their end), not to Narrative forgetting or deprioritizing the check under time pressure. See Continuity/Canon's Section 6 for that risk in detail.

**Cost of an undetected error:** this is the highest-leverage failure point in the entire production, because this Pod's output is the *root* dependency for nearly every other Blueprint and Generative Core pod. An error here doesn't just cost a re-render — Foundation may have trained assets against a since-corrected character description, Audio may have locked dialogue timing against dialogue that's about to change, Pre-Vis may have blocked scenes against a beat sheet that's being revised. This is structurally the most expensive place in the whole pipeline for an undetected mistake to occur, which is why this Pod's back-brief is sequenced *before* the expensive technical-translation step (Section 3.3) rather than after.

**Escalation path:** if the Writer/Story Editor and Showrunner disagree on a structural or tonal note during the back-brief review, this is resolved directly between them — this Pod does not have an intermediate escalation layer above the Showrunner, since the Showrunner is the direct source of the intent this Pod is translating.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly forbidden from locking and publishing a script without first completing the pod-to-Showrunner back-brief (Section 3.3) — given the cascading cost described in Section 6, no script reaches downstream pods without this review, regardless of schedule pressure.
- **This Pod is explicitly forbidden from publishing a script without a formal pass certification from Continuity/Canon (POD-11)** — this gate cannot be bypassed under schedule pressure, even though it introduces a dependency on Continuity/Canon's own SLA (Section 4.1). If Continuity/Canon's SLA is at risk of slipping, the correct response is to escalate to the Showrunner about resourcing Continuity/Canon further, not to skip the gate.
- This Pod may not unilaterally resolve a detected contradiction with existing canon by simply rewriting around it without informing Continuity/Canon (POD-11) — the contradiction and its resolution must be visible to Continuity/Canon so the ledger stays accurate.
- Significant deviations from the Showrunner's original episode-level arc (discovered during drafting, e.g., a scene that organically wants to go somewhere the arc didn't anticipate) must be flagged back to the Showrunner rather than silently absorbed into the "final" draft — this Pod translates and elaborates intent, it does not have authority to redirect it.
- Default resource allocation: no explicit compute ceiling applies to this Pod in the way it does to Scene Pods (this is comparatively low-compute, human-driven work), but repeated draft/back-brief cycles beyond three rounds on a single episode should be escalated as a signal of unclear or shifting intent, not simply absorbed as normal iteration.

---

## 8. Success Criteria

- The Showrunner knows this Pod succeeded when the locked script and beat sheet allow every downstream Blueprint and Generative Core pod to begin and complete their work without needing to return to Narrative for basic clarification.
- A rejected draft is returned to Narrative with specific structural or tonal feedback (not a general "doesn't work"); the Pod revises locally and resubmits for another back-brief round.
- **Contract success:** the locked script and its paired JSON beat sheet are delivered together, correctly formatted, and internally consistent with each other.
- **Intent success:** the script actually produces the emotional/narrative function the Showrunner's intent called for, and is genuinely consistent with the established story-state ledger.
- **Concrete divergence case for this Pod:** a script could be contract-compliant (correctly formatted, technically well-annotated, submitted on schedule) while still failing intent if it hits all the plot points but doesn't land the specific emotional turn the Showrunner asked for — technically complete, functionally flat. This is precisely why the back-brief is a full draft review by the Showrunner rather than an automated structural check; a checklist could confirm the plot points exist without ever confirming they land emotionally.

---

## 9. Open Questions / Notes

- The threshold for how many draft/back-brief cycles constitutes "normal iteration" versus "a signal of unclear intent" (Section 7) is currently left to informal judgment — this is the same category of open threshold-setting question flagged for Data Ops and Foundation, and probably deserves a documented standard given how much downstream scheduling depends on this Pod's timeline being predictable.
- **[Resolved in v1.1]** The Continuity/Canon cross-check is now a required, non-skippable hard gate (Section 2, step 6; Section 4.1) rather than informal coordination — see POD-11's own spec for the corresponding one-business-day SLA that makes this gate viable without becoming an open-ended bottleneck. **New dependency this introduces:** Narrative's publishing timeline is now bounded by Continuity/Canon's SLA in addition to its own drafting timeline — if that SLA is ever missed on a sustained basis, it becomes a scheduling risk for Narrative too, not just a Continuity/Canon-internal problem, and is worth monitoring once the production is running.
- This Pod's internal workflow is a reasonable expansion of source material that describes its function at a solid level of detail (prompt-annotated beat sheets, JSON structuring, translating "dread" into technical shot language) but does not go as deep into headcount or step-by-step process as the Audio Pod source material did — treat the specific process steps here as a faithful but moderately inferred elaboration, not a verbatim transcription.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |
| v1.1 | 2026-09-02 | (initial spec author) | Converted the Continuity/Canon cross-check from informal coordination to a required, non-skippable hard gate before publication (Section 2, 3.2, 4.1, 5.1, 6). Companion change to POD-11's initial spec. | Y — Narrative's input contract with Continuity/Canon (POD-11) changed from soft/advisory to hard/blocking |

- **Deprecation policy:** a locked script version is never deleted, only superseded by a new version if revised post-lock — prior versions remain available indefinitely, since downstream pods that built against an earlier version (and any archived footage referencing it) may need to trace back to exactly what they built against.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.
