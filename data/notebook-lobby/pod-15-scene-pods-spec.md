# Pod Specification: POD-15 — Scene Pods (Multiple Instances)

> **Note on this spec's scope:** POD-15 is a *class* of pods, not a single instance — many Scene Pods operate concurrently across a season, each assigned to a different scene. This spec defines the shared template every individual Scene Pod instance follows (its contract, primitives, and boundaries), not the specific creative content of any one instance. Individual instances should be referenced with a suffix (e.g., POD-15-EP03-SC14) per the numbering convention established in the master list.

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Scene Pod (template for all instances) |
| **Alternate/Node Name** | Generative Execution Node |
| **Macro-Node / Tier** | Generative Core (criticality Tier 3 — Structural at the class level; see Section 9 on why individual instances can behave at higher effective criticality) |
| **Headcount (human)** | 2–3 — one Pod Lead/Director (aesthetic vector, protects emotional intent), one Tech Artist (compute vector, manages the local generative environment); a third (a Jules-type coding agent operator) is optional depending on how much automated timeline compilation a given instance needs |
| **Pod Lead / Accountable Owner** | The Pod Lead/Director. Holds sign-off authority on whether a rendered sequence matches the scene's intended emotional truth; the Tech Artist owns the technical execution (ComfyUI pipelines, batch scripts, CFG tuning) but does not have unilateral authority to approve a final render without the Director's sign-off. |
| **Primary AI/Compute Tooling** | Localized ComfyUI workflows, Wan 2.2 or AnimateDiff for temporal motion/video generation, batch Python scripts for impulse-timing-loop generation and compilation |
| **One-Sentence Mission** | Take one scene's locked script, audio, animatic, and approved assets, and — completely autonomously, without checking in — render the final high-resolution footage that delivers the scene's specific emotional intent. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** high-resolution generative video rendering is the single most compute-expensive activity in the entire production, and it's also the point where "how do we actually make this specific shot look right" has to be answered thousands of times across a season — far too many decisions for any centralized authority to make individually. If rendering decisions had to be centrally reviewed shot-by-shot, the production would grind to a halt under exactly the coordination-tax problem this whole framework exists to avoid. Scene Pods exist to be given a tightly bounded, well-specified problem (one scene, with everything upstream already locked) and then trusted completely to solve it without supervision — this is Mission Command applied at its most literal: maximum autonomy within maximum boundary specificity.

**Single most important outcome this Pod is accountable for:** delivering a finished, high-resolution scene render that stays within its assigned timecode, uses only approved locked assets, and actually achieves the specific emotional/narrative intent it was handed — without requiring any check-in during the rendering process itself.

**Explicitly outside this Pod's purpose:**
- This Pod does not train or modify character LoRAs or style checkpoints — it consumes Foundation's locked assets exactly as published; deviating from them, even to seemingly improve a shot, is a hard boundary violation (Section 7).
- This Pod does not fix its own hallucination artifacts beyond what's achievable within a normal render/re-render cycle — persistent defects are handed to Polish, not indefinitely fought within the Scene Pod itself.
- This Pod does not decide scene sequencing, transitions, or how its shot fits with neighboring scenes — that's Assembly's job; a Scene Pod optimizes its own assigned scene in isolation and has no visibility into or responsibility for what comes immediately before or after it.
- This Pod does not decide the scene's pacing or the audio's timing — that's Audio's and Pre-Vis's job; the Scene Pod treats the locked audio timecode and animatic blocking as fixed boundary conditions, not something it has discretion over.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive the input contract for this specific scene: script segment, exact timecode duration, locked audio track, locked animatic, and the approved character LoRAs/environment checkpoints/background plates from Foundation (see Section 5.1).
2. Pod Lead and Tech Artist review the scene's specific intent statement (e.g., *"This scene is a tense, surreal dialogue sequence — the visual focus must be on the creeping shadows, not the characters' faces"*) and translate it into a concrete generation plan: shot composition, camera movement, lighting approach.
3. Generate a low-res preview or single keyframe using the exact seed and prompt intended for the final render — this is the internal back-brief loop (Section 3.3), run before committing to the expensive full temporal render.
4. Pod Lead evaluates the preview against the scene's intent: does it understand the aesthetic, are there obvious hallucinations, is the composition right. Adjust prompt, seed, or control-net inputs and repeat step 3 as needed.
5. Once the preview is approved, the Tech Artist executes the full render using an **impulse timing loop** — generating the sequence in rigid, short increments (e.g., 0.5-second/12-frame chunks) rather than one continuous long generation, with each increment's output seeding the next, to prevent temporal drift, melting, or hallucination compounding over the scene's duration.
6. Compile the rendered increments into a single continuous sequence for the scene.
7. Internal quality check: does the compiled sequence stay within the assigned timecode, use only approved assets, and match the animatic's blocking closely enough to be usable by Assembly without requiring a significant re-render.
8. Submit the "mostly finished" render to Polish (POD-13) for artifact cleanup — Scene Pods do not attempt to fix hallucination defects themselves beyond what's caught in step 4's preview stage (see Section 1, explicitly outside this Pod's purpose).
9. Once Polish returns a cleaned shot, that shot is complete for this Scene Pod's purposes; the Pod moves to its next assigned scene.

**Human roles inside the Pod and division of labor:**
- **Pod Lead/Director** — the aesthetic vector. Owns whether the frames actually deliver the intended emotional truth; watches the frames and asks "is this scary enough, does the pacing feel right."
- **Tech Artist** — the compute vector. Owns the volatile machinery — Python environments, CFG scales, VRAM management, ComfyUI node troubleshooting.
- **Why split rather than combined:** this exact split and its rationale is directly established in the source material — a solo operator risks getting "sucked into the machine," spending hours debugging a broken node script and losing sight of the scene's emotional pacing entirely. Splitting ensures one person is always guarding creative intent while the other wrestles with execution.

**Tooling specifics:** ComfyUI provides the core generation pipeline; Wan 2.2 or AnimateDiff handle temporal/video generation specifically; Python batch scripts implement the impulse-timing-loop structure (step 5) and handle compilation (step 6).

**Known failure modes of this Pod's own process, and internal catches:**
- *Temporal drift/melting over a long continuous generation* — this is the specific failure the impulse timing loop (step 5) is designed to prevent; generating in rigid, seeded increments forces the model to lock its state every half-second rather than drifting over a full multi-second shot.
- *A preview that looks right in isolation but doesn't hold up across the full render* — this is a known, general risk (see Section 6) rather than something this Pod's process fully eliminates; mitigated partially by keeping preview evaluation scoped to the exact seed/prompt that will be used for the full render, not a different, more flattering test case.
- *The Tech Artist getting absorbed in a technical debugging tangent at the expense of the Pod Lead's creative oversight* — this is the "trap of the solo node" risk described directly in source material; mitigated structurally by the role split itself (step 2 above), not by an additional process step.

**Idle/blocked behavior:** This Pod fully blocks on receiving its complete input contract (script segment, locked audio, locked animatic, approved assets) — rendering against any unlocked upstream input risks wasted compute the moment that input changes. Once its full contract is received, this Pod does not idle waiting on any other Pod during execution — the entire point of "going dark" is that it operates without needing further input until it delivers output (Section 3.7). If a Scene Pod discovers mid-render that an input it received turns out to be flawed (e.g., an animatic that doesn't actually work at full fidelity, per Pre-Vis's own Section 6), it pauses and escalates rather than continuing to render against a known-bad input.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent a Scene Pod receives is the most granular, scene-specific intent in the entire framework — for example: *"This is the climax of Episode 3. Make the audience feel profound dread,"* or, more specifically, *"a tense, surreal dialogue sequence — the visual focus must be on the creeping shadows, not the characters' faces."* Note what this withholds: no camera angle, no specific lighting setup, no ComfyUI node configuration. The Pod's output preserves this intent regardless of the specific generation approach used to achieve it — success is judged by whether the rendered scene *delivers the dread*, not by whether it followed a prescribed visual method.

### 3.2 Values as Boundary Conditions
- **Approved assets only, no exceptions:** this Pod is strictly forbidden from training its own variant LoRAs or deviating from Foundation's locked checkpoints, even if a scene seems to call for a slight visual adjustment — visual coherence across the whole series outranks any single Scene Pod's local creative preference.
- **Timecode is an absolute boundary, not a target:** the scene must fit its exact assigned duration — this is a hard constraint inherited from Audio's locked timing grid, not something this Pod has discretion to extend or compress based on its own pacing judgment.
- **Complete autonomy over internal method:** within the boundaries above, this Pod has full authority over its ComfyUI node setup, batch scripts, and rendering approach — it does not need to ask for global consensus on how to configure its own local workflow, which is the entire point of the Scene Pod design.

### 3.3 Back-Brief
**Internal back-brief:** a low-res preview or single keyframe generated using the exact seed/prompt intended for the full render (Section 2, step 3) — reviewed by the Pod Lead before committing to the expensive full temporal render. This is the canonical example of the back-brief pattern in this entire framework: rendering a full 47-second sequence is computationally expensive, so the Pod forces itself to show its "plan" cheaply first.

**Weaker-signal risk mitigation:** this is the pattern most exposed to the framework's general AI-back-brief risk — the preview is artifact-only (an image or short clip), not an explanation of why the model interpreted the prompt a certain way, and two previews can look equally "correct" while resting on different, unstable underlying generalizations. This Pod's specific mitigation is the impulse timing loop itself (Section 2, step 5) — by re-seeding every 0.5 seconds rather than generating one long continuous sequence, the Pod limits how far a single unstable interpretation can drift before being re-anchored, which reduces (though does not eliminate) the consequence of the preview's signal being weaker than a human explanation would be.

### 3.4 Global Read / Local Write
**Private working state:** the entire rendering process — every preview iteration, every impulse-loop increment, every rejected generation attempt — is completely private to this Pod while in progress. This is the pod that "goes completely dark," per the source material's explicit framing: no other Pod has visibility into a Scene Pod's ComfyUI setup, batch scripts, or intermediate generations.

**Finalized write:** once compiled and internally quality-checked (Section 2, step 7), the Pod writes its "mostly finished" render once to the shared registry, submitted specifically to Polish.

**Read access:** Polish reads the raw render for cleanup; once cleaned, Assembly reads the finished, Polish-approved version.

**No downstream mutation:** confirmed — no Pod may reach into a Scene Pod's render and alter it directly; even Polish's corrections happen as a formal, separate downstream step (its own Pod), not as an edit to the Scene Pod's own output in place.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** script segment and exact timecode duration (Narrative, via Pre-Vis), locked master audio track (Audio), locked animatic (Pre-Vis), approved character LoRAs/environment checkpoints/background plates (Foundation), and the scene's specific intent statement (Showrunner, via Narrative).

**Formal output contract:** a "mostly finished" high-resolution render, within the assigned timecode, using only approved assets, submitted to Polish for cleanup.

**Contract change process:** Scene Pods do not themselves define or change contracts (unlike most other Pods) — they consume contracts defined entirely by upstream Pods (Narrative, Audio, Pre-Vis, Foundation). If any of those upstream contracts change after a Scene Pod has begun rendering, the upstream Pod's own change-control process (per that Pod's Section 3.5) is responsible for flagging the Scene Pod's in-progress work for review — Scene Pods are the most purely reactive Pod in this framework with respect to contract changes, never the initiating side.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** receipt of a complete input contract — specifically, the joint availability of a locked animatic (Pre-Vis) and, indirectly through it, locked script and audio (since the animatic itself depends on both being locked already). This is effectively a triple-dependency trigger, though it manifests as a single event once the animatic publishes, since the animatic cannot exist without the other two already being locked.

**Trigger this Pod's output causes downstream:** submitting a "mostly finished" render triggers an automated notification (via Infrastructure) to Polish that a new shot is ready for cleanup review.

### 3.7 Black-Box Autonomy
**This Pod has the most extensive black-box autonomy of any Pod in the framework.** While rendering, it is not required to expose its ComfyUI node configuration, its specific prompt engineering, its batch script structure, or any intermediate generation to any other Pod — described directly in source material as the pod "going completely dark," with absolute authority over its localized workflow and no requirement to seek consensus on setup decisions. The only checkpoints visible outside the Pod are the (invisible-to-others) internal back-brief and the final submission to Polish.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-14 Pre-Vis & Animatic | Locked animatic, exact shot timecodes | v1.0 | Full block — cannot begin rendering without the visual boundary condition this establishes |
| POD-05 Audio Pod | Locked master audio track (indirectly, via the animatic which is built against it) | v1.0 | Full block — the animatic itself cannot exist without this, so this is a transitive but equally hard dependency |
| POD-07 Foundation Pod | Approved character LoRAs, environment checkpoints, background plates | v1.0 | Full block — this Pod is strictly forbidden from rendering with unapproved or placeholder assets (Section 3.2) |
| POD-08 Narrative Pod | Script segment and scene-specific intent statement (indirectly, via Pre-Vis and the Showrunner's direct briefing) | v1.0 | Full block — without a specific intent statement, this Pod has no target to render toward |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-13 Polish Pod | "Mostly finished" renders | v1.0 | Must work with the render as delivered — targeted correction only, no re-rendering (per Polish's own Section 3.2) |
| POD-10 Assembly Pod | Polish-cleaned, finished shots (indirect — Assembly consumes Polish's output, which originates from this Pod) | v1.0 | Receives shots as fixed, already-clean inputs; has no visibility into how any individual Scene Pod arrived at its render |

### 4.3 Parallel / Non-Dependent Relationships
Individual Scene Pods operating on different scenes within the same episode have **no formal relationship with each other at all** — this is a deliberate design feature, not a gap. Each Scene Pod is isolated from its sibling Scene Pods by design; the only place their outputs are reconciled is downstream, at Assembly. This absence of a peer relationship is precisely what allows dozens of Scene Pods to run concurrently without the n² coordination-tax problem this entire framework is built to avoid.

### 4.4 Position in the Macro-Node Structure
This Pod sits at the center of Generative Core, with no placement tension — it is the archetypal Generative Core function, the "heavy compute engine" the macro-node exists around. Every other Generative Core Pod (Polish, Motion Graphics) exists in direct service of correcting or supplementing this Pod's output.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Locked animatic, shot timecodes | Pre-Vis & Animatic (POD-14) | Video reference + timecode data | v1.0 | Required |
| Script segment and scene intent statement | Narrative Pod (POD-08) / Showrunner | Text + prose directive | v1.0 | Required |
| Approved character LoRAs, environment checkpoints, background plates | Foundation Pod (POD-07) | Model weight files, versioned | v1.0 | Required |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| "Mostly finished" high-resolution render | Polish Pod (POD-13) | Video file | v1.0 | Y |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** the preview back-brief (Section 3.3) passes — the low-res keyframe looks like it understood the intent — but the full temporal render, generated across many impulse-loop increments, drifts or reveals a hallucination that the single-frame or short-clip preview simply couldn't have shown, since certain failure modes (character consistency across a full scene's range of motion, temporal coherence over the full duration) only manifest at a duration and complexity the cheap preview didn't test.

**AI-generated back-brief risk (framework-level — this is the canonical instance):** this Pod's back-brief is the clearest example in the entire framework of the artifact-only, explanation-free back-brief risk described generally: a preview shows *what* the model would produce but never *why*, meaning two previews can look equally correct while resting on unstable, divergent underlying interpretations. **Mitigation used by this Pod:** the impulse timing loop (Section 2, step 5) is the direct structural answer to this risk — rather than trusting a single preview to predict a long, continuous generation, the Pod re-anchors the model's state every 0.5 seconds throughout the actual full render, limiting how far any one segment's unstable interpretation can drift before the next segment corrects against a fresh, deliberately-seeded checkpoint.

**Cost of an undetected error:** high in isolation (a full high-resolution render is the most compute-expensive single output in the production) but well-contained in blast radius — unlike Foundation or Narrative's errors, a bad Scene Pod render does not propagate into other Scene Pods' work, since Scene Pods have no relationship with each other (Section 4.3). The cost is a wasted render and a required re-render of that one scene, not a cascading multi-Pod failure.

**Escalation path:** if a Scene Pod discovers a persistent problem that traces back to an upstream asset or input (e.g., a Foundation LoRA that reliably fails in a specific pose, or an animatic that doesn't hold up at full fidelity), it escalates directly to the responsible upstream Pod (Foundation or Pre-Vis respectively) — the same escalation pattern Polish uses when it identifies an asset-level defect (see Polish's Section 6), since Scene Pods are equally well-positioned to notice these patterns during actual high-fidelity rendering.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly and strictly forbidden from training its own LoRAs or otherwise deviating from Foundation's approved, locked assets — this is one of the most consistently repeated hard boundaries across the entire source material.
- This Pod may not exceed its assigned timecode duration — the scene must fit the exact length established by the locked audio and animatic.
- This Pod does not have authority to alter its own scope of work (e.g., deciding a scene actually needs a different visual approach than its stated intent describes) without escalating to the Showrunner — it has complete autonomy over *method*, none over redefining its own *assignment*.
- Default resource allocation: GPU compute hours are allocated per scene by Infrastructure (POD-12), within ceilings set by Finance (POD-03) — a Scene Pod does not have unlimited compute and must work within whatever allocation it's been given, escalating if a scene's complexity genuinely requires more than the default allocation rather than silently exceeding it.

---

## 8. Success Criteria

- Polish and Assembly know this Pod succeeded when the delivered render requires only minor artifact correction (Polish's normal scope) rather than a substantial re-render, and fits cleanly into the assembled episode without requiring significant deviation from the locked animatic.
- A render requiring substantial rework is treated as a signal to investigate why the internal back-brief (Section 3.3) didn't catch the problem, not simply re-rendered and moved past without that investigation.
- **Contract success:** the render is delivered in the correct format, within the assigned timecode, using only approved assets.
- **Intent success:** the rendered scene actually delivers the specific emotional/narrative truth described in its intent statement — dread actually reads as dread, not just as a technically correct sequence of frames.
- **Concrete divergence case for this Pod:** a render could be contract-compliant (correct format, correct duration, approved assets used) while still failing intent if it's technically clean but emotionally flat — competently executed but not actually frightening, when frightening was the entire point. This is exactly why the Pod Lead's back-brief judgment (Section 3.3) is scoped to emotional truth, not just technical correctness — a checklist could confirm the contract was met without ever confirming the scene actually works.

---

## 9. Open Questions / Notes

- **Instance-level criticality variance:** the class-level Tier 3 assignment reflects that Scene Pods as a category are redundant — one failed instance doesn't take down the others (Section 4.3). But a single Scene Pod instance covering a pivotal scene (a season finale's climax, as used in the intent example throughout this spec) carries individually higher stakes than its class-level tier suggests — this was flagged in the original Hierarchy of Importance document and is worth re-affirming here: **treat high-narrative-weight scene assignments as an explicit escalation flag for extra back-brief scrutiny**, even though the Pod's formal process doesn't otherwise distinguish a climax scene from a routine one.
- The relationship between preview-stage fidelity and full-render fidelity (Section 6) is the same fidelity-gap risk identified in Pre-Vis's own Section 6, recurring here one stage later in the pipeline — worth considering whether a documented, consistent standard for "how much preview testing is enough before committing to a full render" should be shared across both Pods rather than each defining its own informally, extending the same threshold-standardization idea flagged as an open pattern across several other specs.
- This Pod has the richest, most detailed source material of any Pod in this set — the impulse timing loop, the internal back-brief mechanics, the Pod Lead/Tech Artist split and its specific "trap of the solo node" rationale are all drawn quite directly and faithfully from source material, more so than almost any other spec written so far.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec — establishes the shared template all individual Scene Pod instances follow | N |

- **Deprecation policy:** an individual Scene Pod instance's render is never deleted, only superseded by a new version if a re-render is required — prior versions remain available since Polish, Assembly, and Data Ops' archival function may all need to reference exactly what was originally produced.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current — for Scene Pods specifically, this includes archiving the locked seeds and generation parameters used per instance, consistent with Data Ops' own Section 4.2 relationship to this Pod.