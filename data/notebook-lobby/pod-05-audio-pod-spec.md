# Pod Specification: POD-05 — Audio Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Audio Pod |
| **Alternate/Node Name** | The Pace & Performance Node |
| **Macro-Node / Tier** | Blueprint (criticality Tier 2 — Foundational) |
| **Headcount (human)** | 2 — one Audio Lead, one Tech Sound Designer |
| **Pod Lead / Accountable Owner** | The Audio Lead. Holds sign-off authority on every back-brief snippet and the final locked track; the Tech Sound Designer executes but does not have unilateral approval authority. |
| **Primary AI/Compute Tooling** | Parler-TTS and Chatterbox for character voice synthesis; Python batch scripts for audio normalization, foley layering, and automated timeline compilation |
| **One-Sentence Mission** | Establish the immutable, rigid temporal and emotional timing grid that every downstream visual pod must animate to. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** Generative video tools (AnimateDiff, Wan 2.2) are unreliable at producing precise, frame-accurate lip-sync and pacing on their own — but they are comparatively good at animating *to* a fixed external timing track once one exists. It is far cheaper and more reliable to generate visuals that match a locked audio track than to generate audio that matches unpredictable AI video pacing. If this function were folded into a Scene Pod, every Scene Pod would need to independently solve dialogue timing, voice consistency, and pacing — producing exactly the kind of visual/timing incoherence the Foundation Pod's LoRA-locking is designed to prevent, just in the audio domain instead.

**Single most important outcome this Pod is accountable for:** producing a locked master audio timeline — dialogue, foley, and pacing — that is treated as a **non-negotiable boundary condition** by every Scene Pod that animates to it.

**Explicitly outside this Pod's purpose:**
- Final music/score composition — that is the Score & Composition Pod's responsibility; Audio Pod handles dialogue, foley, and ambient texture only.
- Any visual decision-making — the Audio Pod does not comment on or influence how a Scene Pod chooses to visually represent a given timing beat, only that the beat exists and its duration is fixed.
- Final broadcast-spec loudness mastering (LKFS/LUFS compliance) — that is Mastering & QC's job; Audio Pod's output is a locked creative track, not a broadcast-certified one.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive the script, aesthetic intent, and locked voice profiles from the Showrunner/Narrative Pod (see Section 5.1).
2. Tech Sound Designer feeds script lines into Chatterbox/Parler-TTS, using prompt engineering to inject breath, pause, and cadence rather than accepting flat default delivery.
3. Generate short (≈3-second) test snippets of key line deliveries — this is the Pod's internal back-brief loop (see Section 3.3).
4. Audio Lead reviews snippets for emotional resonance against the aesthetic intent; approves or requests a re-prompt.
5. Once approved, batch-generate the full dialogue pass for the scene/episode.
6. Layer foley and ambient atmosphere beneath the locked dialogue, matching the aesthetic intent (e.g., synthetic hums and wet organic textures for a biopunk-dread scene).
7. Compile the final timeline, deliberately inserting silence or pacing gaps where dramatically necessary — these become hard downstream constraints (e.g., a 2.5-second silence that a Scene Pod must now fill with 2.5 seconds of visual reaction).
8. Submit the completed track to the Showrunner for the pod-to-Showrunner back-brief (Section 3.3 and 4.4) before any Scene Pod begins rendering.
9. On approval, push final deliverables to the shared bucket (Section 5.2) and move to the next episode/scene.

**Human roles inside the Pod and division of labor:**
- **Audio Lead** — the performance director. Owns cadence, emotional truth, and narrative weight of the dialogue; does not need to understand the TTS tooling.
- **Tech Sound Designer** — the operator. Owns the TTS models, spatial audio timeline, and batch normalization scripts.
- **Why split rather than combined:** TTS tools are temperamental — CFG-style prompt tuning, model quirks, and normalization debugging can consume hours and pull an operator's attention away from whether the *performance* is actually working. Splitting the roles ensures the Audio Lead is always guarding emotional intent while the Tech Sound Designer wrestles with the machinery, rather than one person oscillating between both and losing the thread on either.

**Tooling specifics:** Parler-TTS/Chatterbox handle voice synthesis; Python batch scripts handle normalization and timeline compilation; no visual tooling is used by this Pod at any stage.

**Known failure modes of this Pod's own process, and internal catches:**
- *Flattened emotional delivery from TTS defaults* — caught by the internal 3-second snippet back-brief before any batch generation is run.
- *Inconsistent voice profile drift across episodes* — mitigated by strictly reusing the locked seed/reference audio from Talent & Casting (POD-04) rather than re-prompting from scratch each time.
- *Pacing that reads correctly in isolation but doesn't serve the scene* — caught by the Audio Lead's review being scoped to full-scene playback, not just individual line snippets, before submission.

**Idle/blocked behavior:** If the script (from Narrative, POD-08) is late, this Pod fully blocks — dialogue cannot be synthesized against an unlocked or placeholder script, since even minor line changes alter cadence and timing in ways that would invalidate downstream Scene Pod work. If voice profiles (from Talent & Casting, POD-04) are delayed, the Pod may begin speculative foley/ambient-layer work using placeholder silence for dialogue, but will not synthesize any dialogue against unlicensed or unconfirmed voice references — that risk is explicitly disallowed, not just discouraged (see Section 7).

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The Audio Pod receives intent such as: *"This is a tense, surreal dialogue sequence — establish a Southern Gothic, biopunk-noir tone, with the ambient drone of failing machinery mixed with swamp cicadas rather than generic city noise."* Note what this withholds: no instruction on exact foley layering technique, no specified silence lengths, no TTS prompt wording. The Pod's output preserves this intent regardless of which specific TTS model, foley samples, or pacing choices are used to get there — the test is whether the finished track *feels* like biopunk-noir dread, not whether it followed a specified method.

### 3.2 Values as Boundary Conditions
- **Pacing over naturalism:** the Pod is explicitly permitted to insert unnaturally long silences (e.g., 2.5 seconds) if the dramatic beat calls for it, even though this is not how a real conversation would sound — dramatic weight wins over conversational realism.
- **Locked voice consistency over per-scene optimization:** the Pod must reuse Talent & Casting's approved reference audio/seeds rather than re-tuning voice characteristics scene-by-scene, even if a slightly different delivery might sound marginally better in isolation.
- **Timing lock is absolute once submitted:** once a track is approved and pushed, the Pod does not have discretion to revise it informally — any change requires a new formal request cycle (Section 3.4), even from within the Pod itself.

### 3.3 Back-Brief
**Internal back-brief (human-to-AI):** a ≈3-second TTS snippet of a key line delivery, reviewed by the Audio Lead against the emotional intent before committing to a full batch generation. Pass/fail is a direct judgment call by the Audio Lead — no numeric threshold, since the criterion is felt emotional accuracy, not technical correctness.

**Pod-to-Showrunner back-brief:** the completed audio track itself, submitted for review *before* any Scene Pod is permitted to render against it. This is treated as the highest-stakes review point in the Pod's cycle — Showrunner listens with eyes closed, evaluating pacing, vocal performance, and atmosphere as the acid test, since if the scene doesn't work as audio alone, no amount of downstream animation can fix it.

**Weaker-signal risk mitigation:** because the internal snippet back-brief is artifact-only (a sound clip, not an explanation of why the TTS model interpreted the prompt a certain way), the Pod mitigates the risk described in the framework's general Back-Brief discussion by reviewing *full-scene* playback before submission, not just isolated snippets — catching cases where individually "correct-sounding" lines don't cohere as a performance once assembled.

### 3.4 Global Read / Local Write
**Private working state:** in-progress TTS snippets, unapproved foley layers, and draft timeline compilations are visible only within the Pod while iteration is happening.

**Finalized write:** the Pod writes exactly two artifacts, once, immutably, to the central R2 bucket: the master `.WAV` file and a timecode map (JSON). Once written, these are treated as locked.

**Read access:** every downstream Pod (Scene Pods, Score & Composition, Assembly, Continuity/Canon) may read these files freely at any time.

**No downstream mutation:** confirmed — no downstream Pod may edit the `.WAV` or timecode JSON directly. If a downstream Pod (e.g., a Scene Pod discovering the silence is too long for the intended visual beat) has an issue with the locked track, it must submit a formal input request back to the Audio Pod, which then produces a new *versioned* output rather than a silent edit.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** locked script text, the aesthetic-intent statement, and Talent & Casting's approved voice profile/seed references. All three required before work begins (see 2, idle/blocked behavior).

**Formal output contract:** one master `.WAV` file (mixed, locked) and one timecode map in JSON, structured as scene/timestamp/speaker/action entries (e.g., `00:12–00:15: Character A speaks; 00:15–00:17: silence/footsteps`).

**Contract change process:** if the Audio Pod needs to change the timecode JSON schema (e.g., adding a new field for emotional-intensity tagging that Score wants to consume), this is announced via the Infrastructure Pod's event system before the change takes effect, with the old schema version remaining valid for one full episode cycle to allow downstream Pods (Scene, Score, Assembly) to migrate. This is not a hard cutover by default — a hard cutover is used only if the studio's compliance requirements (via Legal or Mastering & QC) mandate an immediate change.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** receipt of a locked script drop from Narrative Pod (file-drop detection, not a scheduled meeting).

**Trigger this Pod's output causes downstream:** pushing the final `.WAV` and timecode JSON to the R2 bucket fires an automated webhook (via the Infrastructure Pod) that instantly generates assignment tickets for the relevant Scene Pods and pings their Tech Artists — no manual handoff meeting required.

### 3.7 Black-Box Autonomy
While work is in progress, the Audio Pod is not required to expose its TTS prompt wording, number of iteration passes, or specific foley sample choices to anyone outside the Pod. The Showrunner and other Pods do not interfere during this phase — the only checkpoint is the final back-brief submission (Section 3.3), not a running status check on method.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-08 Narrative Pod | Locked script and scene-by-scene beat sheet | v1.0 | Full block — dialogue cannot be synthesized against an unlocked script (see 2, idle/blocked behavior) |
| POD-04 Talent & Casting | Approved voice likeness references/seeds, licensed under SAG-AFTRA terms | v1.0 | Full block on dialogue synthesis specifically — foley/ambient work may proceed speculatively, dialogue may not (legal risk, see Section 7) |
| Showrunner (via Narrative Pod handoff) | Aesthetic/emotional intent statement for the scene | n/a (not a versioned artifact) | Work can technically proceed using only the script, but the Pod cannot confidently make tone decisions (e.g., biopunk-noir ambient layering) without it — quality risk, not a hard block |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-15 Scene Pods | Master `.WAV` and timecode JSON | v1.0 | Must animate exactly to the locked timing grid, including deliberately inserted silences — cannot alter scene duration or pacing to suit visual preference |
| POD-16 Score & Composition | Master `.WAV` and timecode JSON | v1.0 | Must compose and time musical cues around the already-locked dialogue and pacing — cannot request the Audio Pod adjust timing to better fit a musical phrase |
| POD-10 Assembly Pod | Master `.WAV` file | v1.0 | Treats the audio track as the immutable spine of the episode timeline during editorial assembly |
| POD-11 Continuity/Canon Pod | Timecode JSON (indirectly, via Narrative canon cross-referencing) | v1.0 | Uses timing/dialogue delivery as one input when checking for narrative-state contradictions across episodes |

### 4.3 Parallel / Non-Dependent Relationships
The Audio Pod does not have a formal dependency relationship with the Legal, Provenance & Clearance Pod (POD-01), but coordinates informally with it whenever new voice synthesis techniques are introduced, to confirm continued compliance with union AI voice-licensing terms. This is informational, not a blocking dependency — Legal's sign-off happens at the Talent & Casting stage (POD-04), not per-episode within Audio.

### 4.4 Position in the Macro-Node Structure
The Audio Pod sits entirely within Blueprint — unlike Assembly, there is no tension in this placement. Its Lead attends only the Blueprint sync loop. It does not bridge into Generative Core or Supply Chain, since its output is a fixed input those macro-nodes consume, not a decision it participates in downstream of delivery.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Locked script / beat sheet | Narrative Pod (POD-08) | Text / structured beat sheet | v1.0 | Required |
| Aesthetic intent statement | Showrunner (via Narrative handoff) | Prose directive | n/a | Required (soft — quality risk if missing, not a hard block) |
| Approved voice profiles/seeds | Talent & Casting (POD-04) | Reference audio files + licensing metadata | v1.0 | Required |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Master `.WAV` file | Scene Pods, Score & Composition, Assembly | Mixed, locked audio file | v1.0 | Y |
| Timecode Map | Scene Pods, Score & Composition, Continuity/Canon | JSON | v1.0 | Y |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** emotionally flattened or misaligned TTS delivery that passes the isolated snippet back-brief but reads as wrong once assembled into the full scene — i.e., the Pod approves something that technically satisfies "sounds right in this 3-second clip" without it serving the scene's actual dramatic arc.

**AI-generated back-brief risk (framework-level):** the snippet back-brief is artifact-only — a sound clip, not an explanation of why the TTS model chose a given cadence. Two snippets can sound equally "correct" while being generated from different underlying prompt interpretations, one of which may not generalize well across the rest of the scene. **Mitigation used by this Pod:** full-scene playback review (not just snippet review) before final submission, and a second checkpoint at the pod-to-Showrunner back-brief stage, which evaluates the assembled track as a whole rather than trusting the sum of individually-approved snippets.

**Cost of an undetected error:** high and compounding. If a pacing or emotional-tone error in the locked audio track is not caught before Scene Pods begin rendering, every Scene Pod that animated to that timing grid must be re-rendered once the audio is corrected — this is one of the most expensive possible failures in the entire pipeline, since it invalidates downstream visual compute, not just the audio itself. This justifies the unusually strict two-stage back-brief (internal snippet + full pod-to-Showrunner review) relative to lower-stakes Pods.

**Escalation path:** if the Audio Pod cannot resolve a disagreement about tone or pacing within its own judgment, it escalates to the Showrunner directly (not through Narrative or any intermediary), since the Showrunner is the original source of the aesthetic intent this Pod is executing against.

---

## 7. Boundary Conditions and Scope Limits

- The Audio Pod is explicitly forbidden from synthesizing dialogue using any voice reference that has not been formally cleared by Talent & Casting (POD-04) and, upstream of that, Legal & Provenance (POD-01) — this is a hard legal boundary, not a quality preference.
- The Audio Pod may not unilaterally alter a scene's dramatic pacing beyond what the aesthetic intent supports — significant pacing decisions (e.g., adding a new multi-second silence not implied by the script) must be flagged to the Showrunner rather than decided independently, since pacing changes ripple into Scene Pod render costs.
- Default resource allocation: no explicit GPU/compute ceiling applies to this Pod (TTS synthesis is comparatively cheap relative to video rendering), but iteration on any single line's snippet back-brief beyond 5 passes should be escalated to the Audio Lead as a signal that the underlying prompt or intent may be unclear, not just under-tuned.

---

## 8. Success Criteria

- The Showrunner knows this Pod succeeded when the submitted track passes the "eyes closed" review — pacing, vocal performance, and atmosphere align with intent — without needing to inspect the TTS prompts or tooling used to get there.
- A rejected output is returned to the Audio Pod with specific timestamp-level feedback (not a general "doesn't feel right"); the Pod iterates locally and resubmits a new versioned track.
- **Contract success:** the `.WAV` and timecode JSON are delivered in the correct format, on schedule, matching the required script version.
- **Intent success:** the track actually serves the emotional/aesthetic intent handed down for the scene.
- **Concrete divergence case for this Pod:** a track could be contract-compliant (correct format, correct duration, correctly timestamped) while still using a technically well-executed but tonally wrong performance — e.g., a line delivered with genuine skill but with confident-and-composed cadence for a scene that needed frightened-and-fragmented delivery. This is exactly why the pod-to-Showrunner back-brief (not just automated contract validation) remains a required, non-skippable step for this Pod.

---

## 9. Open Questions / Notes

- It is not yet formalized how many re-prompt iterations at the internal snippet stage should trigger an escalation to the Showrunner versus being resolved entirely within the Pod — currently left to the Audio Lead's judgment (see Section 7).
- The relationship between this Pod and Score & Composition around who "owns" a scene's silence — Audio inserts dramatic silence for dialogue pacing, but Score may want to fill that same silence with a musical sting — is not resolved in the current contract and may need a formal negotiation protocol between the two Pods.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |

- **Deprecation policy:** if the timecode JSON schema changes, the prior schema version remains valid and supported for one full episode cycle to allow Scene Pods, Score, and Assembly to migrate, unless a compliance-driven hard cutover is required (see Section 3.5).
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as custodian of versioning across the production, rather than the Audio Pod self-maintaining it.