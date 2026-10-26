# Pod Specification: POD-19 — Metadata & Ingestion Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Metadata & Ingestion Pod |
| **Alternate/Node Name** | The Supply Chain Handshake Node |
| **Macro-Node / Tier** | Supply Chain (criticality Tier 4 — Compliance & Delivery) |
| **Headcount (human)** | 2 — one Metadata/MMC Specialist (MovieLabs Media Manifest Core schema construction, file-naming and packaging conventions), one Delivery/Transfer Engineer (Aspera transfer configuration, intake-server handshake monitoring) |
| **Pod Lead / Accountable Owner** | The Metadata/MMC Specialist. Holds sign-off authority on whether a delivery package is correctly structured and ready for transmission; the Delivery/Transfer Engineer owns the actual transfer mechanics and intake confirmation but does not have authority to approve a package's metadata structure independently. |
| **Primary AI/Compute Tooling** | MovieLabs Media Manifest Core (MMC) XML/JSON schema construction and validation tooling, automated file-naming and packaging convention checkers, Aspera transfer client and monitoring tooling |
| **One-Sentence Mission** | Wrap every certified, broadcast-ready deliverable in the exact metadata structure Warner Bros. Discovery's intake servers require, and transmit it successfully — because a creatively perfect, technically compliant episode with malformed metadata is rejected automatically, with no human ever reviewing the creative work at all. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** Mastering & QC certifies that the *content* of a deliverable meets broadcast spec, but a major studio's Media Supply Chain does not accept a raw video file with an email — it requires delivery via Aspera using the MovieLabs Media Manifest Core, with every audio track, subtitle file, and video component wrapped in precise XML/JSON configuration metadata, and even a detail as small as an uppercase file extension can trigger instant, automatic rejection at the studio's servers. This is a categorically different skill from broadcast content mastering — it's a supply-chain/systems-integration problem, matching a production's finished output to a specific external partner's exact technical intake contract, which is why it's kept distinct from Mastering & QC rather than treated as a final step of that Pod's own process (the same logic that separates Metadata from Mastering as cleanly as it separates Localization's linguistic work from Mastering's technical conformance work).

**Single most important outcome this Pod is accountable for:** every deliverable is packaged in a correctly structured MMC-compliant metadata wrapper and successfully transmitted to and accepted by Warner Bros. Discovery's Content Partner Hub intake servers — with zero tolerance for the kind of formatting error the studio's automated systems reject without human review.

**Explicitly outside this Pod's purpose:**
- This Pod does not certify content quality or broadcast-spec compliance — that's Mastering & QC's job; Metadata packages already-certified content, it does not independently verify color, loudness, or artifact compliance itself.
- This Pod does not produce or master any creative or technical asset — it works entirely from Mastering & QC's finished, certified output.
- This Pod does not manage the underlying cloud infrastructure the transfer runs on — that's Infrastructure's job; Metadata configures and monitors the Aspera transfer itself, Infrastructure provides the network/compute layer it runs on.
- This Pod does not negotiate or interpret ambiguous studio requirements on its own authority — where the studio's intake requirements are genuinely unclear or in dispute, that's escalated to Network Gateway, which owns the studio-facing relationship.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive the fully certified, broadcast-spec-compliant deliverable package from Mastering & QC — original master, every language variant, captions, audio description, clean M&E track (see Section 5.1).
2. Metadata/MMC Specialist constructs the MovieLabs Media Manifest Core XML/JSON structure describing the full package — mapping every individual file (video, each language's audio, each caption file, M&E track) into the manifest's required schema.
3. Verify every file name, extension, and internal identifier against the studio's exact technical intake matrix — checking case sensitivity, prohibited characters, and naming convention compliance with the same zero-tolerance rigor Mastering & QC applies to its own technical spec.
4. Run automated MMC schema validation against the constructed manifest before attempting transmission — catching structural errors locally, before they become a rejected delivery at the studio's servers.
5. Delivery/Transfer Engineer configures and initiates the Aspera transfer of the full package to the Warner Bros. Discovery Content Partner Hub.
6. Monitor the transfer and the studio's automated intake handshake response — confirming not just that the transfer completed, but that the studio's systems actually accepted and validated the package on their end.
7. If the studio's intake servers reject the package (a metadata structure error, a naming violation, or any other automated rejection), capture the specific rejection reason returned by the studio's system and route it to whichever internal step (manifest construction, file naming, or an upstream content issue) is responsible.
8. On confirmed successful intake, publish an ingestion-confirmation record to the shared registry and notify Network Gateway that delivery is complete.

**Human roles inside the Pod and division of labor:**
- **Metadata/MMC Specialist** — the schema/structure vector. Owns building the manifest correctly and verifying naming/packaging conventions against the studio's exact requirements.
- **Delivery/Transfer Engineer** — the transmission vector. Owns configuring and executing the actual Aspera transfer and monitoring the studio's intake response.
- **Why split rather than combined:** constructing a correct, complex XML/JSON manifest against an external partner's exact schema requirements and managing a live file-transfer process are different disciplines — a specialist deep in the studio's specific metadata conventions is not necessarily the person best positioned to debug a stalled or failed Aspera transfer, and vice versa; this mirrors the same detection-versus-execution split used by Polish (QA Reviewer / VFX Artist) and Mastering & QC (QC Technician / Mastering Engineer).

**Tooling specifics:** MMC schema construction and validation tooling builds and locally checks the manifest before transmission is even attempted; Aspera handles the actual high-speed file transfer; automated naming-convention checkers verify file-level compliance against the studio's specific intake matrix.

**Known failure modes of this Pod's own process, and internal catches:**
- *A manifest that's internally well-formed XML/JSON but doesn't actually match the studio's specific required schema fields* — mitigated by step 4's local schema validation against the studio's actual published requirements, not just generic XML/JSON well-formedness.
- *A single file with an incorrect extension case or a prohibited character silently breaking an otherwise-correct package* — mitigated by step 3's explicit, dedicated naming-convention check treated as its own verification step, not assumed to be automatically caught by general schema validation.
- *Assuming a successful file transfer means successful delivery* — mitigated by step 6 explicitly distinguishing "the files arrived" from "the studio's systems validated and accepted the package," since these are different events and only the second one constitutes actual successful delivery.

**Idle/blocked behavior:** This Pod fully blocks on packaging a given deliverable until Mastering & QC has certified it as broadcast-spec compliant — packaging a not-yet-certified deliverable risks building a correctly-structured manifest around content that will itself be rejected, wasting the packaging effort. However, this Pod may begin constructing the general manifest structure and verifying studio schema requirements independent of any specific episode's readiness, since schema and convention work doesn't require the actual content to exist yet.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives is close to Mastering & QC's own in stability and character: *"Every certified deliverable must actually reach and be accepted by the studio's intake servers — a technically perfect episode that gets automatically rejected over a metadata formatting error has, for all practical purposes, not been delivered at all."* This intent is essentially fixed across the whole season, reflecting this Pod's role as a supply-chain handshake function rather than a creative or even content-technical one.

### 3.2 Values as Boundary Conditions
- **Exact studio schema compliance over generic best practice:** this Pod builds specifically to Warner Bros. Discovery's actual, current MMC requirements — not to a generic or previously-used metadata standard that happens to be "close enough" — since the studio's automated intake has no tolerance for near-misses.
- **Verify actual acceptance over assuming transfer success:** confirming the studio's systems validated and accepted the package outranks simply confirming the files arrived — a completed file transfer that the studio's own validation subsequently rejects is treated as an undelivered package, not a completed task with a downstream problem.
- **Local validation before transmission, always:** this Pod runs its own schema validation (step 4) before ever attempting delivery, rather than using the studio's live intake system as its first and only check — catching a structural error locally is faster and lower-stakes than discovering it via a live rejection.

### 3.3 Back-Brief
**Internal back-brief:** the local MMC schema validation pass (Section 2, step 4) functions as this Pod's version of a cheap-check-before-commitment pattern — verifying manifest structure locally before the more "expensive" step of an actual live transfer attempt and studio-side validation, similar in shape to Data Ops' smoke test or Mastering & QC's automated scan preceding manual review, though here the "commitment" being previewed against is an external system's live response rather than internal human judgment.

**Weaker-signal risk mitigation:** like Mastering & QC, this Pod's work is objective and deterministic (does the manifest match the required schema, does the studio's system accept it) rather than a matter of creative or subjective judgment, so the AI-artifact-only back-brief risk described for creative Pods is largely inapplicable here. The residual risk is the same stale-reference risk identified for Mastering & QC (POD-18, Section 6) — this Pod's understanding of the studio's exact schema requirements could silently drift out of date, which local validation against an outdated internal reference wouldn't catch.

### 3.4 Global Read / Local Write
**Private working state:** in-progress manifest construction and unresolved naming-convention checks are visible only within the Pod while packaging is underway.

**Finalized write:** once transmission is confirmed successfully accepted by the studio (Section 2, step 6), this Pod writes an ingestion-confirmation record once, immutably, to the shared registry.

**Read access:** Network Gateway reads ingestion-confirmation records for studio-facing milestone reporting; Data Ops archives the confirmation as part of the production's permanent record.

**No downstream mutation:** confirmed — no other Pod alters this Pod's manifest or transmission record; if a delivery issue is discovered after the fact, it's addressed through a new formal delivery attempt, not a retroactive edit to the record of what was actually sent.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** fully certified, broadcast-spec-compliant deliverables from Mastering & QC — original master and every language variant, captions, audio description, and clean M&E track.

**Formal output contract:** a successfully transmitted, studio-confirmed-accepted delivery package, plus an ingestion-confirmation record.

**Contract change process:** if Warner Bros. Discovery updates its MMC schema or intake requirements, this is a studio-driven change communicated through Network Gateway (POD-02) — the same pattern established for Mastering & QC's own spec-update process (POD-18, Section 3.5) — and this Pod updates its manifest construction and validation tooling accordingly, with any in-flight or recently-delivered packages flagged for review against the new requirement.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** receipt of a fully certified deliverable from Mastering & QC.

**Trigger this Pod's output causes downstream:** successful, confirmed studio intake fires an automated notification (via Infrastructure) to Network Gateway that delivery is complete — this is the final event in the entire creative-to-delivery pipeline, with no further production Pod downstream of this one for that specific deliverable.

### 3.7 Black-Box Autonomy
While constructing the manifest and managing transfer, this Pod is not required to expose its specific XML/JSON structure choices, naming-convention checks, or transfer configuration to any other Pod. The only checkpoint visible outside the Pod is the final ingestion-confirmation record — Network Gateway does not need visibility into how delivery was achieved, only that it was.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-18 Mastering & QC | Fully certified, broadcast-spec-compliant deliverables | v1.0 | Full block — this Pod does not package or attempt delivery of anything not yet certified by Mastering & QC |
| POD-02 Network Gateway | Current, confirmed studio MMC schema and intake requirements | v1.0 | Soft risk — this Pod can continue operating against its last-known schema, but risks the stale-reference failure described in Section 6 if requirements have changed without this Pod being notified |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-02 Network Gateway | Ingestion-confirmation records | v1.0 | Relies on this Pod's confirmation to report accurate delivery status to the studio — an inaccurate or premature confirmation here would misrepresent the production's actual delivery status upward |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates directly with Network Gateway (POD-02) whenever the studio's intake requirements are ambiguous or appear to have changed — this is a standing, informal channel rather than a per-delivery formal dependency, since most individual deliveries don't require this coordination, but the relationship needs to be readily available precisely because Section 6's stale-reference risk depends on this Pod not discovering requirement changes only reactively, through a rejection.

### 4.4 Position in the Macro-Node Structure
This Pod sits within Supply Chain, with no placement tension — alongside Mastering & QC, it is one of the clearest examples of a purely technical, external-partner-facing Supply Chain function in the entire pod set, with no creative-judgment component of any kind.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Fully certified, broadcast-spec-compliant deliverables | Mastering & QC Pod (POD-18) | Video/audio/timed-text files, per language variant | v1.0 | Required |
| Current MMC schema and intake requirements | Network Gateway Pod (POD-02) | Studio-published technical specification | v1.0 | Required (soft — see 4.1) |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Transmitted, studio-accepted delivery package | Warner Bros. Discovery Content Partner Hub (external) | MMC-structured package via Aspera | v1.0 | N/A (external transmission, not an internal registry asset) |
| Ingestion-confirmation record | Network Gateway (POD-02), Data Ops (POD-06, archival) | Structured confirmation document | v1.0 | Y |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** a package is transmitted and the file transfer itself completes successfully, but the studio's own validation subsequently rejects it — and this distinction (transfer success versus actual acceptance) is missed because monitoring stopped at confirming the files arrived rather than confirming the studio's systems validated them, exactly the risk Section 3.2's "verify actual acceptance" value is designed to prevent, but only if step 6 of this Pod's own process is actually followed rigorously under delivery-deadline pressure.

**Weaker-signal risk (framework-general, applied here):** this Pod shares Mastering & QC's stale-reference risk almost exactly — its packaging and naming conventions are checked against an internal understanding of the studio's requirements that could silently drift out of date. **Mitigation used by this Pod:** the same pattern used by Mastering & QC — treating schema/requirement updates as a required, tracked input from Network Gateway (Section 3.5) rather than an assumed-static internal reference, plus local schema validation (Section 2, step 4) before every transmission attempt, which at minimum catches a structural mismatch against whatever reference this Pod is currently using, even if that reference itself is stale.

**Cost of an undetected error:** high and immediate, comparable to Mastering & QC's own risk profile (Section 6 of POD-18) — a rejected delivery at this final stage is a hard, blunt failure with no partial credit, since the studio's automated intake either accepts or rejects the full package. Unlike most other Pods' errors, there's essentially no gradual discovery process here; the studio's system either confirms acceptance or it doesn't, immediately.

**Escalation path:** a confirmed studio rejection is escalated immediately to Network Gateway (POD-02), which is positioned to clarify the actual current requirement directly with the studio — this Pod does not attempt to guess at a fix and resubmit without first confirming what specifically the studio's system rejected and why, mirroring the same escalation discipline established for Mastering & QC's own stale-reference risk (POD-18, Section 6).

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly forbidden from attempting delivery of any content that hasn't been certified by Mastering & QC — packaging and transmission only ever happen against already-certified deliverables.
- This Pod may not confirm a delivery as successful based solely on file-transfer completion — actual studio-side validation and acceptance is the only event that constitutes a successful delivery (Section 3.2).
- This Pod does not have authority to interpret or resolve genuinely ambiguous studio intake requirements on its own — that's escalated to Network Gateway, since Network Gateway owns the actual studio relationship this Pod would otherwise be guessing at.
- Default resource allocation: this Pod's compute needs are minimal (schema construction and file transfer, not generative work) — its primary constraint is the accuracy and currency of its understanding of the studio's actual requirements, which is a knowledge/coordination constraint rather than a compute one.

---

## 8. Success Criteria

- Network Gateway knows this Pod succeeded when every reported "delivered" episode is genuinely confirmed-accepted by the studio's systems, with zero surprise rejections discovered later.
- A studio rejection is captured with the specific reason returned by the studio's system and routed to the responsible internal step (Section 2, step 7); it is never simply resubmitted without understanding why it failed.
- **Contract success:** the manifest was correctly constructed, locally validated, and transmitted on schedule.
- **Intent success:** the studio's own systems actually accepted the package — not just that this Pod believes it should have.
- **Concrete divergence case for this Pod:** a delivery could be contract-compliant (manifest correctly built per this Pod's own reference, transmission completed without error) while still failing intent if the studio's actual current requirement had changed in a way this Pod's reference didn't reflect — exactly the stale-reference risk in Section 6, and why intent success here is explicitly anchored to real studio confirmation rather than to this Pod's own internal validation passing.

---

## 9. Open Questions / Notes

- Per the cross-Pod escalation standard (`cross_pod_escalation_threshold_standard.md`), this Pod's default iteration threshold isn't separately defined here — if the same deliverable is rejected by the studio repeatedly for what appears to be the same underlying reason, the standard's default three-cycle rule applies, triggering mandatory escalation to Network Gateway rather than continued resubmission attempts.
- Like Mastering & QC, this Pod would benefit from a defined proactive cadence for confirming its understanding of the studio's requirements is current, rather than relying primarily on reactive discovery via rejection — this is the same open gap flagged in Mastering & QC's own Section 9, and the two Pods likely share enough of the same underlying risk that a single shared proactive-check mechanism (rather than each Pod independently re-confirming with Network Gateway) might be worth considering.
- This Pod's internal workflow draws on solid, specific source material (MovieLabs Media Manifest Core, Aspera P2P transfer, the specific detail about filename case-sensitivity causing automatic rejection) — comparable in grounding to Foundation, Audio, and Mastering & QC, though the specific headcount split and the transfer-versus-acceptance distinction in Section 6 are reasoned elaborations built to fit this Pod's particular failure shape rather than verbatim source detail.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |

- **Deprecation policy:** an ingestion-confirmation record is never deleted or overwritten — even a failed or rejected delivery attempt is retained in the record, since a pattern of rejections for the same underlying reason is itself a meaningful signal (see the cross-Pod escalation standard) that this Pod needs to be able to detect over time.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.