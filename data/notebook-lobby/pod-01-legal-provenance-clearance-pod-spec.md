# Pod Specification: POD-01 — Legal, Provenance & Clearance Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Legal, Provenance & Clearance Pod |
| **Alternate/Node Name** | The Compliance / Clean Room Node |
| **Macro-Node / Tier** | Studio Firewall (criticality Tier 1 — Existential) |
| **Headcount (human)** | 2 — one Entertainment/IP Attorney (chain of title, copyright clearance, union compliance interpretation), one Provenance Auditor (dataset/training-data verification, licensing documentation, prompt provenance tracking) |
| **Pod Lead / Accountable Owner** | The Entertainment/IP Attorney. Holds sign-off authority on whether any asset, model, or agreement is legally cleared for production use; the Provenance Auditor owns the technical/documentary verification work but does not have authority to issue final legal clearance independently. |
| **Primary AI/Compute Tooling** | Automated dataset/provenance auditing tools (checking training data and reference imagery against known copyrighted sources), licensing and contract-tracking systems, prompt-provenance logging tools |
| **One-Sentence Mission** | Certify, before anything downstream is built on it, that every model, dataset, and reference asset the production uses has a clean, defensible chain of title — because a single uncleared asset discovered after full production can get the entire series shelved regardless of creative quality. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** a platform like Warner Bros. Discovery will not accept delivery of an AI-assisted production without an airtight chain of title, copyright indemnification, and compliance with union AI-use frameworks (SAG-AFTRA, WGA). If a foundation model or character LoRA was trained on scraped, uncleared IP, the entire series — not just the affected asset — can be shelved by studio legal, at any point, including after the show is otherwise finished. No creative or technical Pod is positioned to make this judgment: Foundation cares about visual quality, Data Ops cares about reproducibility, neither is equipped or authorized to determine whether a given base checkpoint's training data creates unacceptable legal exposure. This Pod exists specifically to hold that judgment, upstream of everything else, because clearance has to happen before an asset is built into the production, not after — the same logic that makes it the very first gate in the entire pipeline rather than a downstream check.

**Single most important outcome this Pod is accountable for:** every base model, character LoRA, reference image, voice sample, and dataset used anywhere in the production has a documented, legally defensible chain of title — certified before Foundation, Audio, or any other Pod is permitted to build on it.

**Explicitly outside this Pod's purpose:**
- This Pod does not train or evaluate the creative/technical quality of any asset — that's Foundation's and Data Ops' job; Legal certifies an asset is *usable*, not that it's *good*.
- This Pod does not negotiate the studio's business relationship or budget — that's Network Gateway's and Finance's job; Legal's clearance function is narrower and specifically about IP/rights, not the broader commercial relationship.
- This Pod does not handle security/data-protection controls — that's Security & InfoSec's job; Legal certifies an asset may be used at all, Security ensures it's protected once it is.
- This Pod does not itself investigate a security breach's technical cause — if a leak occurs, Legal receives Security's forensic findings and determines the legal/contractual response, it does not perform the forensic tracing itself (see POD-09's own Section 4.2).

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive a request to clear a proposed base model, dataset, reference image set, or voice sample intended for production use (see Section 5.1) — this Pod is the mandatory first gate for any new asset source, before Foundation, Audio, or Data Ops build anything on top of it.
2. Provenance Auditor investigates the source: where did this training data or reference material originate, is licensing documentation available and verifiable, does the source's own terms of use permit this kind of commercial, derivative production use.
3. For any asset involving a real performer's likeness or voice (via Talent & Casting), verify the underlying union agreement (SAG-AFTRA, WGA AI-use terms) actually covers the specific intended use — a general likeness license does not automatically cover every possible AI-synthesis application.
4. Entertainment/IP Attorney reviews the Auditor's findings and issues a legal determination: cleared, cleared with specific use restrictions, or rejected.
5. For a cleared asset, issue a signed "clean room" provenance certificate documenting the chain of title and any use restrictions, which becomes the asset's permanent legal record.
6. For a rejected or restricted asset, communicate the specific reason to the requesting Pod (typically Foundation or Talent & Casting) — a rejection is not just "no," it includes enough detail for the requesting Pod to understand whether an alternative source might be viable.
7. Conduct periodic re-audits of already-cleared assets — since a source's licensing terms or a model provider's own legal status can change after initial clearance, an asset cleared at production start isn't assumed to remain cleared indefinitely without re-verification (see Section 6).
8. Maintain the master provenance registry — every cleared asset, its certificate, and any use restrictions, as the production's permanent legal record.

**Human roles inside the Pod and division of labor:**
- **Entertainment/IP Attorney** — the legal-judgment vector. Owns the actual clearance determination and interpretation of union agreements and licensing terms.
- **Provenance Auditor** — the investigative vector. Owns tracing an asset's actual origin and verifying documentation exists and is genuine.
- **Why split rather than combined:** legal interpretation and technical/documentary provenance investigation are different disciplines — an attorney is not necessarily equipped to independently trace a dataset's actual training provenance through technical documentation, and an auditor without legal training cannot authoritatively interpret whether a given license actually covers the intended use; this mirrors the same detection-versus-judgment split used by Security & InfoSec (POD-09) and Polish (POD-13).

**Tooling specifics:** automated provenance-auditing tools support the initial investigation by flagging known problematic sources or licensing red flags, but final determination is always human judgment by the Attorney — analogous to how Narrative treats LLM-assisted drafting as an aid, not a final authority (POD-08, Section 2).

**Known failure modes of this Pod's own process, and internal catches:**
- *An asset's licensing terms appear to cover the intended use on initial review but don't actually extend to this specific commercial/derivative application* — mitigated by the Attorney's dedicated interpretation step (step 4) being treated as substantive legal judgment, not a rubber-stamp of the Auditor's documentation-gathering.
- *An asset cleared at production start remains treated as permanently cleared even after the underlying source's legal status changes* — mitigated by step 7's periodic re-audit requirement, the same "continuous compliance, not point-in-time compliance" value Security & InfoSec applies to TPN standards (POD-09, Section 3.2).
- *A rejection communicated without enough detail for the requesting Pod to find a viable alternative* — mitigated by step 6's explicit requirement that a rejection include specific reasoning, not just a refusal.

**Idle/blocked behavior:** This Pod is rarely blocked by any other Pod's pace, since its core function (investigating and clearing assets) is upstream of everything else and doesn't depend on downstream production activity. It does fully block on issuing a clearance determination until the Auditor's investigation is genuinely complete — this Pod does not issue a "provisional" or rushed clearance under production time pressure, since a rushed clearance defeats the entire purpose of this Pod existing (see Section 7).

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives, translated from the Network's and Showrunner's shared interest in a deliverable, defensible production, is roughly: *"Nothing enters this production's pipeline without a chain of title that would hold up under a real legal challenge — not a plausible-sounding justification, an actual defensible record."* Note this specifies the *standard* (defensible, not merely plausible) without dictating the specific investigative method or documentation format this Pod uses to meet it — this Pod is free to determine its own clearance process as long as that standard holds.

### 3.2 Values as Boundary Conditions
- **Defensibility over speed, absolutely:** this Pod does not compress its investigation or issue a clearance determination under production deadline pressure — this is close to an absolute rule, mirroring Data Ops' own refusal to compress certification timelines (POD-06, Section 3.2), but with even less flexibility given what's actually at stake here.
- **Continuous re-verification over one-time clearance:** an asset's legal status is not assumed static — periodic re-audit (Section 2, step 7) reflects a standing value that clearance is a maintained state, not a permanent achievement, the same principle Security & InfoSec applies to TPN compliance.
- **Specific, actionable rejections over blanket refusals:** when this Pod rejects an asset, it provides enough reasoning for the requesting Pod to pursue an alternative — refusing to explain a rejection would create unnecessary friction without making the production any safer, since the goal is steering the production toward defensible assets, not merely blocking indefensible ones.

### 3.3 Back-Brief
**Internal back-brief:** the Provenance Auditor's investigative findings are reviewed by the Attorney before a clearance determination is finalized — a structured internal check where the Attorney can identify gaps in the Auditor's documentation before committing to a legal position, rather than treating the Auditor's report as automatically sufficient.

**Pod-to-Network-Gateway commitment:** given how directly this Pod's failures can affect the studio relationship, significant clearance decisions (a new base model, a new class of reference material) are communicated to Network Gateway as part of standing risk visibility, even though Network Gateway does not have authority to override this Pod's legal determination — this is informational, ensuring Network Gateway is never surprised by a legal exposure it didn't know existed.

**Weaker-signal risk mitigation:** this Pod's work is almost entirely outside the AI-artifact-only back-brief risk described for creative/generative Pods — its core function is legal and documentary verification, a fundamentally different kind of judgment than assessing whether a generated frame "looks right." The more relevant risk is the same kind Data Ops and Mastering & QC face: a legal standard or licensing landscape shifting in ways this Pod's existing reference understanding doesn't yet reflect (see Section 6).

### 3.4 Global Read / Local Write
**Private working state:** in-progress investigations, unconfirmed documentation, and preliminary legal analysis are visible only within the Pod while a clearance review is underway — no Pod should build against a not-yet-finalized clearance.

**Finalized write:** once determined, this Pod writes a signed clean-room provenance certificate once, immutably, to the shared registry, per asset.

**Read access:** Foundation, Talent & Casting, Data Ops, and any Pod proposing to use a given asset source may read certificates to confirm an asset is cleared before building on it.

**No downstream mutation:** confirmed — no Pod may alter or reinterpret a provenance certificate's stated scope or restrictions; if a Pod believes a certified asset's use restrictions no longer fit an evolving need, that's a new formal request back to this Pod, not a unilateral reinterpretation.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** a proposed asset source (base model, dataset, reference imagery, voice sample) with whatever documentation the requesting Pod already has, submitted specifically for clearance review before any production use.

**Formal output contract:** either a signed clean-room provenance certificate (with any use restrictions clearly stated) or a specific, reasoned rejection.

**Contract change process:** if this Pod's clearance standard changes (e.g., in response to an evolving legal landscape around AI training data, or an updated union agreement), this is communicated to all Pods with previously-cleared assets that might be affected, and those assets are flagged for re-review rather than assumed to remain valid under the new standard — mirroring Data Ops' own principle that a changed certification standard requires re-checking prior certifications, not grandfathering them in.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** receipt of a new asset-clearance request from any Pod proposing to introduce a new source into the pipeline; scheduled periodic re-audit of already-cleared assets (time-based, not request-driven).

**Trigger this Pod's output causes downstream:** issuing a clearance certificate unblocks the requesting Pod (typically Foundation, for training against a newly cleared base model or reference set) to proceed — this is one of the highest-leverage unblocking events in the entire framework, since Foundation itself is a root dependency for nearly everything in Generative Core.

### 3.7 Black-Box Autonomy
While investigating a clearance request, this Pod is not required to expose its specific investigative methods, draft legal reasoning, or preliminary findings to the requesting Pod. The only outputs visible outside the Pod are the final certificate or the specific, reasoned rejection.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-04 Talent & Casting | Underlying performer likeness/voice agreements, for verifying AI-synthesis use is actually covered | v1.0 | Full block on clearing any asset involving a real performer's likeness or voice — this Pod cannot verify coverage of an agreement it hasn't received |
| Any requesting Pod (Foundation, Data Ops, etc.) | Available documentation on a proposed asset's origin | v1.0 | Investigation can proceed with less initial documentation, but a request submitted with minimal supporting material simply takes longer to investigate — not a hard block, but a real timeline cost |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-07 Foundation Pod | Clearance certificates for base models and reference material | v1.0 | **Full, hard block** — Foundation cannot train against any uncleared asset, regardless of creative urgency; this is one of the most absolute gates in the entire framework |
| POD-06 Data Ops & Model Lifecycle | Clearance status, as a co-requirement alongside Data Ops' own technical certification | v1.0 | Data Ops' own certification process explicitly will not approve a model for production use if this Pod hasn't separately cleared its training data (POD-06, Section 7) — the two gates are independent and both required |
| POD-17 Localization & Accessibility | Clearance for multilingual TTS voice licensing, where dub voices reference a licensed performer's likeness across languages | v1.0 | Cannot proceed with dub voice synthesis referencing a performer's likeness without this Pod confirming the underlying license extends to that specific multilingual use — the gap flagged in Localization's own Section 9 |
| POD-09 Security & InfoSec | Legal/forensic findings coordination in the event of a leak | v1.0 | Security's incident response and this Pod's legal response operate in tandem during an incident, but Security does not require this Pod's sign-off for its own technical remediation work |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates closely with Data Ops & Model Lifecycle (POD-06) whenever a new model or checkpoint is being evaluated, since Data Ops' technical certification and this Pod's legal clearance are two independent, parallel gates a new asset must pass — neither can substitute for the other, and neither has authority over the other's determination, mirroring the relationship already described from Data Ops' own side (POD-06, Section 4.3).

### 4.4 Position in the Macro-Node Structure
This Pod sits within Studio Firewall, with no placement tension — its function is unambiguously governance/risk-containment, holding the same category of studio-relationship-protecting authority as Security & InfoSec and Finance, despite requiring genuine legal and investigative expertise rather than being a purely administrative function.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Proposed asset source with available documentation | Any requesting Pod (typically Foundation, Data Ops) | Structured clearance request + supporting documentation | v1.0 | Required |
| Underlying performer likeness/voice agreements | Talent & Casting (POD-04) | Signed union-compliant agreements | v1.0 | Required (for any likeness/voice-related clearance) |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Signed clean-room provenance certificate | Requesting Pod, master provenance registry | Structured legal document | v1.0 | Y |
| Reasoned rejection | Requesting Pod | Structured document with specific reasoning | v1.0 | Y |
| Master provenance registry | All Pods (read access, for confirming an asset is cleared) | Structured, queryable legal record | v1.0 | Y (append-only) |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** an asset is cleared based on documentation and legal understanding that was accurate at the time, but the underlying legal landscape shifts afterward — a source's own licensing terms change, a court ruling affects the legal status of a category of training data, or a union agreement is renegotiated — and because this Pod's periodic re-audit (Section 2, step 7) is the only mechanism designed to catch this kind of drift, a gap or delay in that re-audit cadence leaves a previously-legitimate clearance silently invalid without anyone downstream knowing.

**Weaker-signal risk (framework-general, applied here):** this Pod's core function is legal/documentary judgment rather than AI-generated creative content, so the standard AI-artifact-only back-brief risk described elsewhere in this framework doesn't directly apply. The more relevant analog is the same stale-reference risk identified for Mastering & QC and Metadata & Ingestion (POD-18, POD-19) — a checked-against reference standard (here, the actual current legal landscape) silently drifting out of date relative to what this Pod's process assumes. **Mitigation used by this Pod:** the periodic re-audit requirement (Section 2, step 7; Section 3.2) exists specifically to counter this, though its actual cadence is not yet quantified in this spec (see Section 9).

**Cost of an undetected error:** the highest of any Pod in the entire framework, without exception. Per the original Hierarchy of Importance, this Pod's failure can shelve the entire series — not one episode, not one asset, the whole production — after full production is complete, regardless of creative quality. This is qualitatively different from every other Pod's "cost of undetected error," because it's not a cascading production cost but a binary existential one: the show may simply never air.

**Escalation path:** if this Pod discovers a previously-cleared asset's legal status has genuinely changed (via re-audit or external event), this is escalated immediately and directly to Network Gateway and the Showrunner jointly, with the same urgency discipline Security & InfoSec applies to a confirmed incident — because depending on how extensively the affected asset has already been used in production, this may require an immediate, difficult creative and financial decision (halting use, seeking alternative clearance, or accepting exposure) that only leadership above this Pod can make.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly and absolutely forbidden from issuing a clearance determination under production time pressure by compressing its investigation — this is one of the least negotiable boundaries in the entire framework, given the cost described in Section 6.
- This Pod may not clear an asset involving a real performer's likeness or voice without confirming the underlying union agreement specifically covers the intended AI-synthesis use — a general likeness clearance is never assumed to automatically extend to every possible application.
- This Pod does not have authority to unilaterally decide the production's response to a discovered legal exposure on an already-used asset (Section 6) — it identifies and reports the exposure; the response (halt, alternative sourcing, accepted risk) is a Network Gateway/Showrunner-level decision informed by this Pod's findings.
- Default resource allocation: this Pod's operating costs are minimal and non-compute, similar to Press & Communications — its actual constraint is legal/investigative expertise and time, not GPU allocation; if clearance requests begin backing up faster than this Pod can responsibly investigate them, that's an explicit resourcing escalation to Network Gateway, not a reason to compress review rigor (per the absolute boundary above).

---

## 8. Success Criteria

- Foundation and every other Pod building on cleared assets knows this Pod succeeded when they can build with confidence that a certified asset genuinely won't become a legal liability later.
- A rejection is specific enough that the requesting Pod can meaningfully pursue an alternative source rather than simply being told no.
- **Contract success:** clearance requests are investigated thoroughly and a determination (certificate or reasoned rejection) is issued.
- **Intent success:** no asset used in the production ever becomes a genuine legal liability that a studio challenge or external legal action could actually sustain.
- **Concrete divergence case for this Pod:** a clearance could be contract-compliant (thoroughly investigated at the time, properly documented, correctly determined against the legal landscape as it existed then) while still failing intent if that legal landscape subsequently shifted and the periodic re-audit didn't catch the change in time — exactly the risk in Section 6, and why intent success for this Pod is measured against the asset's *actual, current* legal defensibility, not just whether the original clearance process was followed correctly.

---

## 9. Open Questions / Notes

- The specific cadence for this Pod's periodic re-audit (Section 2, step 7; Section 6) is not yet quantified — given that this Pod carries the single highest cost-of-error in the entire framework, this is arguably the most consequential unresolved threshold-setting question across the whole pod set, more so than any of the cross-Pod escalation standard's six original cases, and likely deserves dedicated attention rather than a default assumption.
- Per the cross-Pod escalation standard (`cross_pod_escalation_threshold_standard.md`), this Pod's iteration-cycle threshold is deliberately **not** the relevant mechanism here — unlike the six Pods the standard was built for, this Pod's core risk (Section 6) isn't about repeated attempts at the same fix, it's about time-based drift in an external legal reference, structurally closer to Mastering & QC's and Metadata's stale-reference risk than to a correction-cycle risk, and would need its own dedicated re-audit-cadence solution rather than borrowing the three-cycle standard.
- This Pod's internal workflow draws on solid source material naming its core function directly (clean-room provenance certificates, chain of title, SAG-AFTRA/WGA AI compliance, algorithmic and visual copyright audits) — comparable in grounding to Foundation, Audio, and Security & InfoSec, though the specific headcount split, periodic re-audit mechanism, and the framing of this Pod's risk in Section 6 as qualitatively different from every other Pod's are original elaborations built to match this Pod's uniquely high stakes.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |

- **Deprecation policy:** a provenance certificate is never deleted, even if a later re-audit invalidates it — the certificate and its subsequent invalidation are both retained as the permanent legal record of what was known and decided at each point in time, since this history itself may be legally relevant if the production's clearance process is ever challenged.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production — though note the underlying provenance certificates themselves remain this Pod's own legal record, with Data Ops tracking only the versioning metadata layer, not serving as the legal record-holder itself.