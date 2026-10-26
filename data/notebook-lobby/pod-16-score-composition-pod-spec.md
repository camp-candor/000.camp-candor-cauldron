# Pod Specification: POD-16 — Score & Composition Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Score & Composition Pod |
| **Alternate/Node Name** | The Melodic Node |
| **Macro-Node / Tier** | Blueprint (criticality Tier 3 — Structural) |
| **Headcount (human)** | 2 — one Composer (thematic and emotional composition, leitmotif development), one Music Producer/Mix Engineer (stem production, technical delivery format) |
| **Pod Lead / Accountable Owner** | The Composer. Holds sign-off authority on whether a musical cue serves the episode's emotional arc and is ready for delivery; the Music Producer/Mix Engineer owns stem production and technical mix quality but does not have authority to approve a cue's creative direction independently. |
| **Primary AI/Compute Tooling** | Specialized music-generation models used alongside live instrumentation and traditional composition tools, multi-channel stem production and mixing software, spotting/timing tools synced to the locked animatic |
| **One-Sentence Mission** | Compose bespoke musical themes and emotional motifs that serve the episode's narrative arc, delivered as separated master stems the Assembly Pod can integrate into the final cut. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** the Audio Pod is explicitly an operational pacemaker — dialogue intelligibility, TTS cadence, foley texture, the rigid timing grid everything else animates to. Prestige animation relies on something different: bespoke musical themes, emotional motifs, and orchestral or synthesizer arrangements that carry narrative weight across an entire season, not just within a single scene's dialogue timing. If composition were folded into Audio's remit, the Audio Pod would be split between two fundamentally different jobs — keeping the temporal grid rigid and precise (a pacemaker function) versus developing thematic material that recurs and evolves meaningfully across episodes (a compositional function) — creating exactly the kind of cognitive overload the framework generally warns against when a single Pod tries to hold two genuinely different vectors of attention at once.

**Single most important outcome this Pod is accountable for:** delivering musical stems that genuinely serve the episode's and season's emotional arc — recurring themes that mean something because they recur meaningfully, not just pleasant background music — in a format Assembly can integrate without further creative interpretation on Assembly's part.

**Explicitly outside this Pod's purpose:**
- This Pod does not handle dialogue, foley, or the rigid pacing timeline — that's Audio's job; Score composes music that fits within and around Audio's already-locked timing, it does not set or alter that timing itself.
- This Pod does not make final mix/integration decisions about how music, dialogue, and foley balance in the finished episode — that's Assembly's job during final integration; Score delivers separated stems specifically so that balance can be adjusted downstream without needing to re-compose anything.
- This Pod does not decide narrative structure or which moments deserve musical emphasis versus silence — that traces back to Narrative and the Showrunner's intent, and specifically to Audio's own pacing choices (e.g., a deliberate dramatic silence Audio inserts is a boundary condition Score must work around, not override).
- This Pod does not perform final broadcast-spec loudness mastering — that's Mastering & QC's job; Score delivers creative stems, not broadcast-certified audio.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive the locked animatic from Pre-Vis and the locked script/beat sheet from Narrative (see Section 5.1) — the animatic is the primary spotting reference, since it shows visual pacing and emotional transitions before final Scene Pod footage exists.
2. Composer performs a spotting pass: watching the animatic against the beat sheet, identifying where music should enter, exit, swell, or stay absent, and what emotional function each cue needs to serve.
3. Develop or draw on established thematic material — character leitmotifs, location themes, or season-arc motifs — ensuring recurring themes actually recur meaningfully rather than being freshly invented for each episode without regard to continuity.
4. Compose a rough pass of each spotted cue, generated using specialized music models and/or live instrumentation as appropriate to the cue's needs.
5. Internal back-brief: the Composer reviews a rough cue against the spotted animatic timing and the intended emotional function before committing to full, detailed arrangement and production (see Section 3.3).
6. On approval, the Music Producer/Mix Engineer produces the final arrangement into separated, multi-channel master stems (lead melodies, bass, pads, percussion, etc.).
7. Once Assembly's actual cut becomes available (which may shift timing slightly from the animatic, since real footage can require adjustments the rough Pre-Vis reference didn't anticipate), reconcile any timing divergence with Assembly directly — this is parallel coordination, not a formal gate (see Section 4.3).
8. Publish the final stems to the shared registry.
9. Notify Assembly (via Infrastructure's event system) that stems are ready for integration.

**Human roles inside the Pod and division of labor:**
- **Composer** — the thematic/emotional vector. Owns spotting, thematic development, and whether a cue actually serves the narrative — thinks in terms of what the audience should feel and when.
- **Music Producer/Mix Engineer** — the production vector. Owns turning a composed cue into cleanly separated, technically correct master stems — thinks in terms of arrangement, mix balance, and delivery format.
- **Why split rather than combined:** composing toward emotional intent and producing technically clean, correctly-separated multi-channel stems are different disciplines with different failure modes — a Composer without production discipline risks delivering musically strong but technically unusable stems (poorly separated, inconsistent levels), while a Producer without compositional judgment risks technically clean stems that don't actually serve the scene.

**Tooling specifics:** specialized music-generation models support rapid drafting and exploration of thematic ideas; live instrumentation is used where a generative model's output doesn't achieve the needed emotional nuance or technical quality; stem production tooling handles the final multi-channel separation Assembly requires.

**Known failure modes of this Pod's own process, and internal catches:**
- *A cue that works well as isolated music but doesn't actually sit correctly against the locked dialogue/pacing once combined* — mitigated by spotting (step 2) being performed against the full animatic (with its dialogue timing) rather than composing in isolation from picture.
- *Thematic material that doesn't actually recur meaningfully across episodes* — mitigated by treating established themes as an evolving, tracked resource (step 3) that the Composer deliberately references and develops, not something re-invented fresh each episode without continuity awareness.
- *A rough cue passing internal review at spotted-animatic timing but not holding up once Assembly's real cut shifts that timing slightly* — mitigated by step 7's explicit reconciliation pass with Assembly, rather than assuming animatic-stage approval is sufficient for final delivery.

**Idle/blocked behavior:** This Pod fully blocks on beginning spotting work until the locked animatic is available, since spotting against an unlocked or absent visual reference risks composing cues that don't actually match the eventual pacing. However, this Pod may begin developing season-level thematic material (character leitmotifs, broad tonal palette) using only the Showrunner's aesthetic intent and Narrative's locked scripts, independent of any single episode's animatic — this groundwork is less likely to be invalidated by episode-specific timing changes.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives is typically inherited from the same episode-level narrative intent Narrative and Audio work from (e.g., *"Episode 3's climax needs to land as the emotional turning point of the season"*), translated into a musical register: what themes should be present, how they should evolve, and where music should carry emotional weight that dialogue or visuals alone don't fully deliver. The Pod's output preserves this intent regardless of the specific compositional choices, instrumentation, or arrangement used to achieve it.

### 3.2 Values as Boundary Conditions
- **Thematic continuity over episode-by-episode novelty:** an established character or location leitmotif is developed and varied across the season, not discarded and reinvented each episode for the sake of freshness — recurring meaning outranks per-episode originality.
- **Serve Audio's locked silence over filling every gap with music:** where Audio has deliberately inserted a dramatic silence as a pacing boundary condition, this Pod respects that silence rather than defaulting to scoring over it — the absence of music can itself be the correct choice, and Score does not have authority to override Audio's pacing decision by adding a cue where none was intended.
- **Stem separation over a single mixed output:** this Pod always delivers separated, multi-channel stems rather than a single pre-mixed music track, even though a mixed track might sound more immediately impressive in isolation — Assembly's downstream flexibility to balance music against dialogue and foley outranks the convenience of a single finished-sounding file.

### 3.3 Back-Brief
**Internal back-brief:** a rough compositional pass reviewed by the Composer against the spotted animatic timing and intended emotional function, before committing to full arrangement and stem production — the same cheap-preview-before-expensive-commitment pattern used elsewhere, applied to musical composition rather than visual generation.

**Pod-to-Assembly reconciliation (a distinct, secondary check):** because this Pod's primary spotting reference (the animatic) is necessarily a rough proxy for the final cut, this Pod performs a second, lighter-weight check once Assembly's real cut is available (Section 2, step 7) — not a full back-brief in the formal sense used elsewhere, but a targeted verification that timing divergences between animatic and final cut haven't broken a cue's intended effect.

**Weaker-signal risk mitigation:** this Pod's internal back-brief involves human compositional judgment reviewing a musical draft against picture, which is closer to the stronger, explanation-capable end of the back-brief spectrum than an artifact-only AI preview. The more relevant risk here is the same fidelity-gap risk identified in Pre-Vis's own spec (Section 6 of POD-14) — a cue approved against the *rough* animatic may not hold up once the *real* cut's timing shifts — which is precisely why step 7's reconciliation pass exists as a distinct, secondary safeguard rather than relying on the animatic-stage approval alone.

### 3.4 Global Read / Local Write
**Private working state:** in-progress compositional drafts, rejected thematic directions, and unmixed rough cues are visible only within the Pod while iteration is happening.

**Finalized write:** once approved, the Pod writes the final, separated master stems once, immutably, to the shared registry.

**Read access:** Assembly reads the stems as its primary input for integration; Mastering & QC may also read them downstream if final broadcast-spec adjustments require access to separated elements rather than only the fully mixed episode.

**No downstream mutation:** confirmed — Assembly may not re-compose or substantially alter a delivered stem directly; if Assembly finds a cue doesn't work once integrated with the final cut, it submits a formal request back to Score (Section 3.5) rather than adjusting the music itself, preserving the same single-point-of-responsibility discipline used throughout this framework.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** the locked animatic (Pre-Vis), the locked script/beat sheet (Narrative), and awareness of Audio's locked timing grid and any deliberately inserted silences.

**Formal output contract:** separated, multi-channel master stems (lead melodies, bass, pads, percussion) delivered in the format Assembly requires for integration.

**Contract change process:** if this Pod's stem delivery format needs to change (e.g., a new channel configuration Mastering & QC requires), the change is coordinated directly with Assembly and Mastering & QC and announced via Infrastructure's event system, with a transition window unless a broadcast-compliance deadline requires immediate adoption.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** receipt of a locked animatic from Pre-Vis (for episode-specific spotting work); receipt of locked scripts from Narrative (for season-level thematic development, which can proceed independently per Section 2's idle/blocked behavior).

**Trigger this Pod's output causes downstream:** publishing final stems fires an automated notification (via Infrastructure) to Assembly that music is ready for integration into the episode cut.

### 3.7 Black-Box Autonomy
While composing and producing, this Pod is not required to expose in-progress drafts, rejected thematic directions, or unmixed rough cues to any other Pod. The only checkpoints visible outside the Pod are the internal back-brief (invisible to others), the Assembly reconciliation pass (Section 2, step 7 — a coordination, not a formal external review), and the final stem delivery.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-14 Pre-Vis & Animatic | Locked animatic, for spotting and timing musical cues | v1.0 | Full block on episode-specific spotting work; season-level thematic development may proceed independently (see Section 2, idle/blocked behavior) |
| POD-08 Narrative Pod | Locked script and beat sheet, for understanding narrative/emotional arc | v1.0 | Soft block — without this, thematic development risks not actually tracking the season's real emotional structure, but isn't a hard block on preliminary compositional exploration |
| POD-05 Audio Pod | Locked timing grid and awareness of deliberately inserted silences (indirect, via the animatic which reflects Audio's timing) | v1.0 | Soft risk — a cue could be composed without full awareness of a specific dramatic silence, risking a values violation (Section 3.2) rather than a hard block |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-10 Assembly Pod | Separated master stems | v1.0 | Must integrate stems into the final mix at their own discretion for balance, but may not re-compose or substantially alter the musical content itself — a genuine creative issue with a cue is escalated back to Score, not fixed by Assembly directly |
| POD-18 Mastering & QC | Separated stems (indirect, if broadcast-spec mastering requires access to individual elements) | v1.0 | Works from Score's delivered separation format for any element-specific loudness or spec adjustments |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates directly and continuously with Assembly (POD-10) around final timing reconciliation (Section 2, step 7; Section 3.3) — this is a genuine two-way parallel relationship rather than a strict dependency in either direction, since both Pods are working from the same animatic baseline and only need to reconcile divergences that emerge once Assembly's real cut replaces the rough Pre-Vis reference, mirroring exactly the parallel relationship already described from Assembly's own side (Section 4.3 of POD-10's spec).

### 4.4 Position in the Macro-Node Structure
This Pod sits entirely within Blueprint, with no placement tension — its inputs (animatic, script) and its primary creative function (thematic composition serving narrative intent) are both squarely Blueprint-tier, consistent with Audio's own placement despite both Pods' outputs being heavily consumed downstream by Supply-Chain-adjacent Assembly.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Locked animatic | Pre-Vis & Animatic Pod (POD-14) | Video reference file | v1.0 | Required (for episode-specific work) |
| Locked script and beat sheet | Narrative Pod (POD-08) | Prose / JSON beat sheet | v1.0 | Required (soft — see 4.1) |
| Locked timing grid / silence markers | Audio Pod (POD-05), indirectly via animatic | Timecode JSON | v1.0 | Required (soft — see 4.1) |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Separated master stems | Assembly Pod (POD-10), Mastering & QC (indirect) | Multi-channel audio files | v1.0 | Y |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** a cue is composed and approved at the internal back-brief stage against the rough Pre-Vis animatic, but Assembly's actual final cut shifts the scene's timing enough that the cue's emotional swell or hit point no longer lands where it needs to — and this divergence isn't caught because the Section 2, step 7 reconciliation pass with Assembly is treated as informal coordination rather than a rigorous re-check, especially under schedule pressure late in an episode's production.

**Weaker-signal risk (framework-general, applied here):** the fidelity gap between the rough animatic (this Pod's primary spotting reference) and the final assembled cut is the same category of risk identified in Pre-Vis's own Section 6 — a cheap, early-stage reference used to validate something that will only be fully proven true or false at a later, more expensive stage. **Mitigation used by this Pod:** the explicit reconciliation pass with Assembly (Section 2, step 7; Section 3.3), now paired with the cross-Pod escalation standard's three-cycle threshold (see Section 9) as its enforcement mechanism — a lighter-weight fix than a dedicated SLA, judged sufficient given this risk's contained, non-cascading cost profile (see Section 6 below).

**Cost of an undetected error:** moderate — unlike a Narrative or Foundation error, a musical timing mismatch doesn't cascade into other Pods' work, since Score's stems are separated and Assembly retains discretion over final mix balance. The cost is typically a re-timed or re-produced cue, not a season-wide re-render — closer in shape to Polish's contained, per-instance cost profile than to Foundation's or Narrative's propagating cost profile.

**Escalation path:** if Assembly and Score disagree about whether a cue's timing needs adjustment following the reconciliation pass, this is resolved directly between the two Pods' Leads, given their established direct parallel-coordination relationship (Section 4.3) — escalation to the Showrunner is reserved for cases where the disagreement is actually about creative direction (does this scene need this musical treatment at all) rather than technical timing reconciliation.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly forbidden from scoring over a deliberately inserted dramatic silence established by Audio's locked timing grid — this is a hard boundary condition inherited from an upstream Pod's pacing decision, not a discretionary creative call this Pod can override (Section 3.2).
- This Pod may not deliver a single pre-mixed music track in place of separated stems, even under schedule pressure — stem separation is a hard delivery requirement, not a convenience this Pod can skip to save production time.
- This Pod does not have authority to substantially redefine an episode's intended musical treatment (e.g., deciding a scene the Showrunner intended as sparse and quiet actually needs a full orchestral cue) without escalating that creative disagreement upward — it has full compositional autonomy over *how* to serve the intent, none over redefining the intent itself.
- Default resource allocation: this Pod's compute needs (music-generation model usage) are comparatively modest relative to Scene Pods, but live-instrumentation sessions (where used) draw on Finance's budget and scheduling separately from GPU-compute allocation — this Pod should coordinate with Finance directly for any live-session budgeting rather than assuming it falls under the same compute ceiling as generative rendering work.

---

## 8. Success Criteria

- Assembly knows this Pod succeeded when delivered stems integrate cleanly into the final cut, genuinely serve the scene's emotional intent, and don't require Score to make late, rushed adjustments after the reconciliation pass.
- A cue returned to Score for revision (via the reconciliation pass or a formal Assembly request) includes specific timing or emotional-function feedback; the Pod revises locally and resubmits.
- **Contract success:** stems are delivered in the correct separated format, on schedule, matching the required animatic/script version.
- **Intent success:** the music actually serves the episode's and season's emotional arc, with thematic material that means something because it recurs meaningfully.
- **Concrete divergence case for this Pod:** a stem delivery could be contract-compliant (correctly separated, on schedule, technically well-produced) while still failing intent if the cue is well-composed in isolation but doesn't actually carry the specific narrative weight the scene needed — for instance, using a technically beautiful but thematically unconnected piece of music rather than developing an established leitmotif that would have meant something to a viewer tracking the season. This is why thematic continuity (Section 3.2) is treated as a value this Pod actively maintains, not an incidental nice-to-have.

---

## 9. Open Questions / Notes

- **[Resolved]** Both open items here are addressed by the cross-Pod escalation standard (see `cross_pod_escalation_threshold_standard.md`): the hard-gate question is resolved as **not warranted** — Score's contained, non-cascading cost profile (Section 6) doesn't justify a Continuity/Canon-style SLA-bound gate, so the lighter-weight three-cycle threshold is used instead (three reconciliation rounds addressing the same cue's timing mismatch triggers mandatory escalation to a full cue revision). This also resolves the specific divergence-threshold question — the trigger is cycle count, not a numeric measure of timing drift.
- This Pod's internal workflow draws on solid source material that explicitly distinguishes it from Audio (operational pacemaker versus thematic composition) and explicitly establishes its animatic-spotting relationship with Pre-Vis — reasonably well-grounded, comparable to Foundation, Audio, Infrastructure, and Pre-Vis rather than to the more heavily extrapolated Data Ops or Continuity/Canon specs.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |

- **Deprecation policy:** delivered stems are never deleted, only superseded by a new version if a cue is revised post-delivery — prior versions remain available since Assembly and Mastering & QC may need to trace back to exactly what they originally integrated or mastered against.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.