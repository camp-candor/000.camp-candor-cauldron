# Pod Specification: POD-18 — Mastering & QC Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Mastering & QC Pod |
| **Alternate/Node Name** | The Broadcast Engineering Node |
| **Macro-Node / Tier** | Supply Chain (criticality Tier 4 — Compliance & Delivery) |
| **Headcount (human)** | 2 — one Broadcast Mastering Engineer (color/HDR mastering, loudness compliance), one QC Technician (frame-by-frame artifact checking, spec verification across every deliverable) |
| **Pod Lead / Accountable Owner** | The Broadcast Mastering Engineer. Holds sign-off authority on whether a mastered deliverable meets broadcast spec and is ready for Metadata & Ingestion; the QC Technician owns systematic defect/spec verification but does not have authority to approve a final master without the Engineer's sign-off on the mastering itself. |
| **Primary AI/Compute Tooling** | Color grading and HDR mastering tools (Dolby Vision / HDR10 / Rec.2020 workflows), audio loudness measurement and correction tooling (ATSC A/85, EBU R128 compliance), automated frame-by-frame QC scanning, M&E (Music & Effects) stem-isolation tooling |
| **One-Sentence Mission** | Take Assembly's finished creative cut — and every language variant from Localization — and certify each one meets the exact technical broadcast specification the network's intake servers require, with zero tolerance for spec deviation regardless of creative quality. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** Assembly produces a finished *creative* cut, but a creatively excellent episode with incorrect loudness levels, non-compliant color space, or a missing clean M&E track will be technically rejected by the network's intake servers regardless of how good the storytelling is — broadcast technical compliance is a categorically different kind of correctness than creative correctness, requiring specialized engineering knowledge (Dolby Vision workflows, LKFS/LUFS measurement, Rec.2020 color space) that has nothing to do with narrative judgment. If this function were folded into Assembly, Assembly's Editor would need deep broadcast-engineering expertise on top of creative editorial judgment — the same kind of cognitive-load argument used to justify separating Score from Audio, or Polish from Scene Pods, applies here: creative judgment and deterministic technical-spec compliance are different vectors of attention that shouldn't live in the same role.

**Single most important outcome this Pod is accountable for:** every deliverable — the original-language master and every Localization language variant — passes broadcast-spec technical compliance (color, HDR, loudness, clean M&E) before being handed to Metadata & Ingestion, with zero deviation tolerance on the technical spec itself.

**Explicitly outside this Pod's purpose:**
- This Pod does not make creative editorial decisions — it works entirely from Assembly's already-locked creative cut; if a technical mastering pass reveals a genuine creative issue (not just a spec deviation), that's flagged back to Assembly, not resolved unilaterally here.
- This Pod does not produce translation or dub content — that's Localization's job; Mastering & QC applies the same broadcast-spec mastering to every language variant Localization delivers, it does not create the language content itself.
- This Pod does not handle the XML/metadata packaging or Aspera transfer to the studio's intake servers — that's Metadata & Ingestion's job; Mastering & QC certifies the *content* meets spec, Metadata packages and delivers the *files*.
- This Pod does not decide artistic color-grading choices (the biopunk-noir palette, mood-driven lighting decisions) — that's Assembly's creative color grade; this Pod's HDR/color-space mastering is a technical conformance pass on top of Assembly's already-finished creative grade, not a re-grading of it.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive the locked, finished episode cut from Assembly, and each finished language pack from Localization (see Section 5.1).
2. Broadcast Mastering Engineer applies HDR/color-space conformance mastering — verifying and correcting as needed for Dolby Vision / HDR10 / Rec.2020 compliance, working from Assembly's creative grade as the baseline, not re-grading it artistically.
3. Broadcast Mastering Engineer applies loudness correction and verification against the required standard (ATSC A/85 or EBU R128, -24 LKFS/LUFS as applicable) for the original mix and each Localization language variant.
4. Generate the clean Music & Effects (M&E) track — dialogue fully removed, music and effects intact — required for international dubbing and delivery, working from Score's separated stems and Audio's original mix.
5. QC Technician runs automated frame-by-frame artifact scanning across the full mastered deliverable, checking for anything a technical broadcast QC process would catch (dropped frames, sync drift, color-space violations) that's distinct from the creative-artifact checking Polish already performed upstream.
6. QC Technician performs a manual spot-check pass in addition to the automated scan, since automated detection — like every other automated-detection process in this framework — is tuned to known defect patterns and can miss novel issues (see Section 6).
7. Cross-check every deliverable (original master plus every language variant) against the full technical spec checklist required by the network — this Pod treats each language variant as requiring its own full compliance pass, not an assumption that passing the original-language master implies the dubs automatically comply.
8. Submit any deliverable failing spec back to its responsible upstream Pod if the issue traces to something outside this Pod's own mastering work (e.g., a source audio issue from Localization), or correct it directly if it's a mastering-stage issue within this Pod's own scope.
9. On full compliance, publish the mastered deliverable to the shared registry and notify Metadata & Ingestion.

**Human roles inside the Pod and division of labor:**
- **Broadcast Mastering Engineer** — the mastering vector. Owns the actual technical conformance work — color/HDR mastering, loudness correction, M&E generation.
- **QC Technician** — the verification vector. Owns systematically checking that mastered output actually meets every required spec, both via automated scanning and manual review.
- **Why split rather than combined:** performing a technical mastering pass and then independently verifying that pass meets every spec requirement are different modes of attention — a mastering engineer checking their own work risks the same blind-spot problem any self-review has, which is why a dedicated QC role exists here the same way Polish's QA Reviewer role exists separately from its VFX/Inpainting Artist role.

**Tooling specifics:** color/HDR mastering tools handle Dolby Vision/HDR10/Rec.2020 conformance; loudness tooling measures and corrects against ATSC A/85 or EBU R128; M&E generation draws on Score's separated stems (making a clean M&E track meaningfully easier than if only a final mixed track were available — directly benefiting from Score's Section 3.2 value of always delivering separated stems rather than a single mix).

**Known failure modes of this Pod's own process, and internal catches:**
- *A deliverable passes automated spec-checking but fails a nuance the automated tooling wasn't checking for* (e.g., a brief loudness spike within an otherwise-compliant average) — mitigated by the mandatory manual spot-check (step 6) that runs regardless of automated results, the same pattern used by Polish's own defect-detection process.
- *Assuming a language variant automatically inherits the original master's compliance* — mitigated by step 7's explicit requirement that every variant gets its own full compliance pass, since a dub's different loudness characteristics or dialogue timing could introduce spec issues the original master didn't have.
- *A spec failure that's actually a source-material issue (e.g., a clipped audio element from Score or Localization) being incorrectly treated as a mastering-stage problem to work around* — mitigated by step 8's explicit distinction between issues within this Pod's own mastering scope versus issues that need to be escalated back to their actual source, mirroring the same "escalate rather than patch" discipline established for Assembly and Polish.

**Idle/blocked behavior:** This Pod fully blocks on mastering the original-language deliverable until Assembly's locked cut is available, and blocks on mastering any specific language variant until Localization delivers that variant — but these are independent, parallel blocks per deliverable, not a single block on the whole Pod; this Pod can master the original English deliverable while still waiting on additional language variants from Localization, rather than needing every deliverable to arrive simultaneously before starting any work.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives is close to a standing, near-invariant directive across the whole season, similar in stability to Polish's: *"Every deliverable that reaches the network's intake servers must meet broadcast technical spec exactly — there is no acceptable trade-off between creative quality and technical compliance, because a non-compliant file gets rejected regardless of how good the show is."* This intent doesn't meaningfully vary by episode or scene the way Audio's or Score's does — this Pod's job description is essentially fixed for the whole production, which is part of why it's well-suited to heavily standardized, checklist-driven process.

### 3.2 Values as Boundary Conditions
- **Zero tolerance on technical spec, full deference on creative choices:** this Pod does not have discretion to accept a "close enough" loudness level or a "mostly compliant" color space — spec compliance is binary, not a judgment call, in sharp contrast to the creative Pods elsewhere in this framework where "does it feel right" is the actual standard.
- **Every deliverable gets its own full pass:** no variant is assumed compliant by inheritance from another — this value directly drives step 7 of this Pod's workflow and exists specifically to prevent the "it passed for English, it'll pass for the dub too" assumption that could let a genuine spec failure slip through in a lower-visibility language variant.
- **Escalate source-material issues rather than mastering around them:** if a defect traces back to Score, Localization, or Assembly rather than to this Pod's own mastering process, it's escalated to that source Pod rather than compensated for within Mastering & QC — the same escalate-rather-than-patch discipline established elsewhere in this framework (Assembly's Section 3.2, Polish's Section 3.2).

### 3.3 Back-Brief
**Internal back-brief:** this Pod's process is less back-brief-dependent than most creative Pods, since its output is verified against an objective, external technical specification rather than a subjective emotional or aesthetic target — there's comparatively little value in a "cheap preview before full commitment" pattern when the actual test (does this meet spec) is deterministic and can be run directly on the real output rather than approximated on a cheap proxy. The closest equivalent is the automated-scan-before-manual-review sequencing (Section 2, steps 5–6), which functions as a cheap first-pass filter before committing the more expensive manual QC attention — structurally similar to a back-brief but applied to a verification process rather than a creative-approval process.

**Weaker-signal risk mitigation:** because spec compliance is objective and directly testable, this Pod is largely outside the AI-artifact-only back-brief risk described for creative Pods elsewhere in this framework. The residual risk is narrower and purely technical — an automated scan missing a defect type it wasn't tuned to catch — mitigated the same way Polish and Data Ops mitigate their own analogous risks: mandatory manual review regardless of automated results, and continuous expansion of automated coverage from every defect later caught downstream of where it should have been.

### 3.4 Global Read / Local Write
**Private working state:** in-progress mastering passes, unresolved spec failures, and draft M&E generations are visible only within the Pod while work is underway.

**Finalized write:** once fully compliant (Section 2, step 7), the Pod writes each mastered deliverable once, immutably, to the shared registry, tagged by language/variant and mastering-spec version.

**Read access:** Metadata & Ingestion reads finished, compliant deliverables as its primary input.

**No downstream mutation:** confirmed — Metadata & Ingestion may not alter a mastered deliverable directly, even to fix what looks like a minor packaging-adjacent issue; any concern is submitted as a formal request back to Mastering & QC.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** the locked, finished episode cut (Assembly), finished language packs (Localization), and separated audio stems (Score, for M&E generation).

**Formal output contract:** fully broadcast-spec-compliant mastered deliverables — original and every language variant — including the clean M&E track, delivered in the format Metadata & Ingestion requires.

**Contract change process:** if the required broadcast spec itself changes (e.g., the network updates its loudness standard or HDR requirement), this is a studio-driven change communicated through Network Gateway (POD-02), not something this Pod decides independently — on receiving such a change, this Pod updates its compliance checklist and, per its own change-control process (Section 10), any deliverables already mastered under the prior spec are flagged for review against the new requirement, not assumed to remain compliant.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** independent, parallel triggers per deliverable — receipt of Assembly's locked cut (for the original master) and, separately, receipt of each language pack from Localization (for that specific variant's mastering pass).

**Trigger this Pod's output causes downstream:** publishing a fully compliant mastered deliverable fires an automated notification (via Infrastructure) to Metadata & Ingestion that a deliverable is ready for packaging.

### 3.7 Black-Box Autonomy
While mastering and QC-checking are in progress, this Pod is not required to expose its specific mastering tool settings, intermediate correction passes, or QC scan configuration to any other Pod. The only checkpoint visible outside the Pod is the final, fully compliant published deliverable — Metadata & Ingestion does not need visibility into how compliance was achieved, only that it was.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-10 Assembly Pod | Locked, finished episode cut | v1.0 | Full block on mastering the original-language deliverable |
| POD-17 Localization & Accessibility | Finished language packs (dubs, captions, audio description) | v1.0 | Full block on mastering that specific language variant only — does not block work on the original master or other already-delivered variants |
| POD-16 Score & Composition | Separated master audio stems | v1.0 | Soft block specifically on clean M&E track generation — mastering of picture/loudness for the main mix can proceed, but a clean M&E track is materially harder to produce without separated stems |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-19 Metadata & Ingestion | Fully compliant, mastered deliverables (original plus every language variant) | v1.0 | Cannot package or transmit a deliverable that hasn't cleared this Pod's compliance certification — this is a hard gate on Metadata's own ability to proceed |

### 4.3 Parallel / Non-Dependent Relationships
This Pod has no significant parallel coordination relationship of the kind Assembly/Score share — its relationship to its inputs (Assembly, Localization, Score) is entirely sequential and one-directional, and its single downstream consumer (Metadata & Ingestion) works from its finished, certified output without needing to reconcile any diverging reference.

### 4.4 Position in the Macro-Node Structure
This Pod sits within Supply Chain, with no placement tension whatsoever — it is, alongside Metadata & Ingestion, the clearest example of a purely technical, deterministic, spec-driven Supply Chain function in the entire pod set, with essentially no creative-judgment component that could ever motivate a bridge placement the way Assembly required.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Locked, finished episode cut | Assembly Pod (POD-10) | Master video file | v1.0 | Required |
| Finished language packs | Localization & Accessibility Pod (POD-17) | Audio/video/timed-text files, per language | v1.0 | Required (per variant) |
| Separated master audio stems | Score & Composition Pod (POD-16) | Multi-channel audio files | v1.0 | Required (soft — for M&E generation specifically) |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Broadcast-spec-compliant master (original language) | Metadata & Ingestion (POD-19) | Video file, Dolby Vision/HDR10 conformant | v1.0 | Y |
| Broadcast-spec-compliant masters (per language variant) | Metadata & Ingestion (POD-19) | Video/audio files, per language | v1.0 | Y |
| Clean M&E track | Metadata & Ingestion (POD-19) | Multi-channel audio file, dialogue removed | v1.0 | Y |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** a deliverable passes this Pod's own compliance checklist and is published as certified-compliant, but fails at the studio's own intake servers because the internal checklist's interpretation of the spec has drifted slightly from the studio's actual, current requirement (e.g., the studio updated a threshold and this Pod's checklist wasn't updated to match) — meaning the failure isn't a defect in this Pod's process execution, but a defect in the reference standard the process is checking against.

**Weaker-signal risk (framework-general, applied here):** unlike creative Pods, this Pod's core function is objective spec verification rather than subjective judgment, so the AI-artifact-only back-brief risk is largely inapplicable here (Section 3.3). The more relevant version of that general risk, adapted to this Pod's context, is a **stale-reference risk** rather than an unstable-interpretation risk — the checklist itself silently becoming outdated relative to the studio's actual current requirements. **Mitigation used by this Pod:** treating spec-standard updates as a required, tracked input from Network Gateway (Section 3.5) rather than something this Pod assumes it already knows correctly and never revisits.

**Cost of an undetected error:** high and immediate at the point of studio ingestion — a technically non-compliant deliverable is typically rejected automatically at intake (per the source material's description of the studio's automated, unforgiving delivery specifications), meaning this failure mode doesn't get caught gradually or discovered later; it's caught immediately and bluntly by a system with zero tolerance, causing a hard delivery delay. This is comparable in immediacy to a Security & InfoSec incident, though narrower in blast radius (one deliverable rejected, not a studio-relationship-threatening breach).

**Escalation path:** if this Pod discovers its checklist may be out of date relative to the studio's actual current requirements (e.g., after an unexpected rejection), this is escalated immediately to Network Gateway (POD-02), since Network Gateway owns the studio-facing relationship and is positioned to confirm the actual current specification directly with the studio, rather than this Pod attempting to infer the correct spec independently.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly forbidden from certifying a deliverable as compliant based on a "close enough" judgment call — spec compliance is binary per Section 3.2, and any ambiguity about whether something meets spec is resolved by escalating to Network Gateway for studio clarification, not by this Pod's own best guess.
- This Pod may not re-grade or artistically alter Assembly's creative color choices under the guise of technical mastering — its color/HDR work is conformance mastering on top of the existing creative grade, not a creative do-over.
- This Pod does not have authority to skip full compliance passes on individual language variants on the assumption that passing the original master is sufficient (Section 3.2, step 7 of Section 2) — every variant is verified independently, without exception.
- Default resource allocation: mastering and QC compute needs are modest relative to Scene Pods; this Pod's primary constraint is engineering/QC review time across potentially many language variants per episode, which should scale with Localization's own output volume rather than being treated as a fixed capacity regardless of how many languages a given season requires.

---

## 8. Success Criteria

- Metadata & Ingestion knows this Pod succeeded when every deliverable it receives is genuinely ready for studio intake without triggering a rejection at the studio's own automated compliance check.
- A deliverable that is rejected at actual studio intake despite having passed this Pod's own certification is treated as a critical process failure requiring immediate investigation (per Section 6's stale-reference risk), not simply re-mastered and resubmitted without understanding why the internal check didn't catch it.
- **Contract success:** the deliverable is mastered, certified compliant per this Pod's checklist, and delivered in the correct format, on schedule.
- **Intent success:** the deliverable is actually accepted by the studio's real intake servers without rejection.
- **Concrete divergence case for this Pod:** a deliverable could be contract-compliant (passed this Pod's own checklist, correctly formatted, delivered on time) while still failing intent if the checklist itself was stale relative to the studio's actual current requirement — exactly the risk in Section 6, and why intent success is explicitly measured against real studio acceptance, not just against this Pod's own internal (and potentially outdated) reference standard.

---

## 9. Open Questions / Notes

- Per the cross-Pod escalation standard (`cross_pod_escalation_threshold_standard.md`), this Pod's default iteration threshold isn't separately defined here — if a specific deliverable fails compliance repeatedly for the same underlying reason, the standard's default three-cycle rule applies, escalating to Network Gateway per Section 6 rather than continued internal remastering attempts.
- The cadence at which this Pod should proactively check whether its compliance checklist is still current with the studio's actual requirements (rather than only discovering drift reactively, via a rejection) is not yet defined — given the stale-reference risk identified in Section 6, a periodic proactive check (similar in spirit to Security & InfoSec's periodic TPN re-audit, POD-09 Section 2) may be worth establishing rather than relying entirely on reactive discovery.
- This Pod's internal workflow draws on solid source material describing its core technical requirements (Dolby Vision/HDR10, ATSC A/85 / EBU R128, clean M&E tracks) in specific, concrete detail — comparable in grounding to Foundation, Audio, and Infrastructure — though the specific headcount split and the stale-checklist risk framing in Section 6 are original elaborations built to fit this Pod's particular failure shape, not verbatim source detail.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |

- **Deprecation policy:** a mastered deliverable is never deleted, only superseded by a new version if a compliance issue requires remastering — prior versions remain available since Metadata & Ingestion may need to trace back to exactly what was originally submitted for delivery. Note also that if the underlying broadcast spec itself changes (Section 3.5), prior deliverables mastered under the old spec are flagged for review rather than assumed to remain compliant indefinitely.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.
