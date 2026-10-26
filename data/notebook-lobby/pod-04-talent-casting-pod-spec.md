# Pod Specification: POD-04 — Talent & Casting Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Talent & Casting Pod |
| **Alternate/Node Name** | The Human Licensing Node |
| **Macro-Node / Tier** | Blueprint (criticality Tier 1 — Existential) |
| **Headcount (human)** | 2 — one Casting Director (auditions, casting decisions, talent relationships), one Union/Rights Coordinator (SAG-AFTRA contract negotiation, AI-use likeness terms, residual tracking) |
| **Pod Lead / Accountable Owner** | The Union/Rights Coordinator. Holds sign-off authority on whether a performer's contract genuinely covers a given AI-synthesis use before that likeness or voice reference is released for production use; the Casting Director owns casting and performance direction but does not have authority to clear a use case beyond what's contractually confirmed. |
| **Primary AI/Compute Tooling** | Contract/rights-tracking systems (mapping which specific AI-use terms each performer's agreement covers), residual-payment tracking, audition/casting coordination tools; this Pod does not itself operate generative AI tooling |
| **One-Sentence Mission** | Cast the show's performers, negotiate their likeness and voice rights under current union AI-use agreements, and capture clean reference recordings — securing the human talent whose likeness and voice everything downstream (Audio, Foundation, Localization) will synthesize from. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** even in an AI-heavy production, voices and likenesses cannot be synthesized out of thin air without severe legal consequences — if the production is generating a character's voice via TTS, it must be built on a real performer's actual, licensed likeness, under a contract that specifically covers AI synthesis (a general acting contract does not automatically grant this). No creative or technical Pod is positioned to negotiate this: Audio needs a clean reference recording to synthesize from, but has neither the legal standing nor the relationship-management function to secure it. This Pod exists specifically to sit upstream of Audio and Foundation, casting real performers, negotiating the specific AI-use terms their participation requires, and capturing the clean reference material that becomes the actual input those downstream Pods build on.

**Single most important outcome this Pod is accountable for:** every performer whose likeness or voice is used anywhere in the production — including every AI-synthesized instance of it — has a signed, union-compliant agreement that specifically and unambiguously covers that use, with clean reference recordings captured and handed off before any downstream synthesis begins.

**Explicitly outside this Pod's purpose:**
- This Pod does not perform the actual voice synthesis or likeness generation — that's Audio's and Foundation's job; Talent & Casting secures the legal right and the clean source material, downstream Pods do the technical synthesis work.
- This Pod does not determine whether a broader class of AI training data or a base model is legally clean — that's Legal & Provenance's job; Talent & Casting's clearance is specifically scoped to *this production's own cast members*, not general dataset provenance.
- This Pod does not direct performances during production — beyond the initial reference-capture session, ongoing creative direction of how a character sounds or looks in a given scene is Audio's and Foundation's own creative work, informed by but not managed by this Pod.
- This Pod does not manage press appearances or interview scheduling for cast members — that's Press & Communications' job, though this Pod's own contracts may define what press obligations a performer has agreed to, which Press & Communications needs visibility into (see Section 9).

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive character descriptions and casting needs from Narrative and the Showrunner (see Section 5.1).
2. Casting Director runs auditions and makes casting recommendations, working with the Showrunner on final casting decisions.
3. Union/Rights Coordinator negotiates the performer's contract, explicitly confirming and documenting which specific AI-synthesis uses the agreement covers — voice synthesis for the original language, and separately, whether it extends to derivative uses like multilingual dubbing (a distinct question Localization's own spec already flags as unresolved, see Section 9) or promotional/marketing synthesis.
4. Conduct the primary recording session(s): capturing clean, high-fidelity reference voice and, where relevant, likeness/motion reference material under studio conditions, explicitly for the purpose of downstream AI synthesis.
5. Package the cleared reference material together with a clear statement of exactly what the contract permits — not just handing off audio/video files, but handing off files paired with their specific use boundaries.
6. Deliver the cleared package to Audio (for voice synthesis) and Foundation (for any likeness-informed visual reference), and to Legal & Provenance for final cross-verification that the AI-use terms are properly documented (mirroring Legal's own described relationship to this Pod, POD-01 Section 4.1).
7. Track and process residual payments owed to performers under the union agreement as their likeness/voice continues to be used across the season.
8. Where a new use case arises mid-production that the original contract doesn't clearly cover (e.g., Localization needing multilingual dub synthesis, or Marketing Creative needing promotional synthesis beyond what was originally scoped), renegotiate or seek explicit confirmation before that new use proceeds — this Pod does not assume a broad original grant covers an unanticipated new application.

**Human roles inside the Pod and division of labor:**
- **Casting Director** — the casting/performance vector. Owns auditions, casting recommendations, and the performer relationship during the actual recording session.
- **Union/Rights Coordinator** — the legal/contractual vector. Owns the actual contract negotiation and the precise scoping of what AI-uses are covered.
- **Why split rather than combined:** casting judgment (finding the right performer, directing a strong reference performance) and contract negotiation (precisely scoping AI-use rights under evolving union frameworks) are different disciplines — a Casting Director is not necessarily equipped to negotiate the specific legal boundaries of an AI-synthesis clause, and a Rights Coordinator is not necessarily positioned to judge whether a performer is creatively right for a role.

**Tooling specifics:** contract/rights-tracking systems maintain a clear, queryable record of exactly what each performer's agreement covers — critical given how many downstream Pods (Audio, Localization, Marketing Creative) may each independently need to confirm a specific use is covered.

**Known failure modes of this Pod's own process, and internal catches:**
- *A contract negotiated for "voice synthesis" broadly, without the specific downstream use cases (dubbing, promotional material) being anticipated and explicitly scoped* — mitigated by step 3's explicit requirement to document which specific uses are covered, not just that AI synthesis in general is permitted, and step 8's requirement to seek new confirmation rather than assume broad coverage.
- *Clean reference material captured but not paired with clear documentation of its use boundaries*, leaving downstream Pods to guess or assume — mitigated by step 5 treating the use-boundary documentation as inseparable from the reference file itself, not a separate document that might not travel with it.
- *Residual payment tracking falling behind as a season's likeness/voice usage accumulates* — mitigated by treating residual tracking (step 7) as an ongoing, continuous function rather than an end-of-season reconciliation task, the same discipline Finance applies to tax-incentive tracking (POD-03, Section 2).

**Idle/blocked behavior:** This Pod fully blocks on beginning contract negotiation until casting decisions are confirmed, and fully blocks Audio's and Foundation's downstream work until both the contract is signed *and* the clean reference material is captured — a signed contract without captured reference material, or captured material without a confirmed contract, are both insufficient to release the package downstream. This Pod is not typically blocked by any other Pod's pace once its own casting and negotiation process is underway, since it operates upstream of the technical production pipeline almost entirely.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives, translated from the Showrunner's and Legal's shared interest in a legally sound production, is roughly: *"Cast performers who can deliver what these characters need, and secure their participation under terms that actually, specifically cover every way we intend to use their likeness and voice — not a general grant we're hoping covers whatever we end up needing."* Note this specifies the *standard of specificity* required (explicit, anticipated coverage, not a broad assumed grant) without dictating exactly how negotiations should be structured or which specific union terms to use as a template — this Pod determines its own negotiation approach as long as that standard holds.

### 3.2 Values as Boundary Conditions
- **Explicit, scoped coverage over broad assumed grants:** a contract is not treated as covering a use case unless that use case was actually anticipated and explicitly included — this is a hard interpretive stance this Pod takes deliberately conservatively, since the cost of wrongly assuming coverage (per Section 6) is severe and largely irreversible.
- **Clean reference material and its use-boundary documentation are inseparable:** this Pod does not release captured recordings without the accompanying, explicit statement of what they may be used for — treating the two as a single package, never as a technical asset that happens to have a legal document somewhere else.
- **Renegotiate rather than assume, when a new use arises:** if a downstream Pod develops a need the original contract didn't anticipate, this Pod's default is to seek explicit new confirmation, not to interpret the existing agreement generously in the production's favor.

### 3.3 Back-Brief
**Internal back-brief:** before finalizing a recording session's technical setup, the Union/Rights Coordinator confirms with the Casting Director and, where needed, Audio's own technical requirements (POD-05, Section 5.1) that the planned capture will actually produce material Audio can use — a cheap check to avoid discovering after an expensive studio session that the reference material doesn't meet Audio's technical needs.

**Pod-to-Legal cross-verification:** every cleared package is cross-verified with Legal & Provenance before being released downstream (Section 2, step 6) — this mirrors Legal's own described dependency on this Pod (POD-01, Section 4.1) and ensures two independent parties (this Pod's negotiation and Legal's broader provenance review) both confirm coverage before any synthesis begins, rather than relying on a single point of judgment for something this consequential.

**Weaker-signal risk mitigation:** this Pod's core function is legal negotiation and relationship management, not AI-generated content, so the framework's general AI-artifact-only back-brief risk doesn't directly apply. The more relevant risk is the same interpretive-scope risk described in Section 3.2 — a contract that reads as covering a use case in isolation, but wouldn't survive genuine legal scrutiny if that specific use was ever challenged, mitigated by this Pod's own deliberately conservative interpretive stance plus Legal's independent cross-check.

### 3.4 Global Read / Local Write
**Private working state:** in-progress negotiations, audition results, and unconfirmed casting discussions are visible only within the Pod until finalized.

**Finalized write:** once a contract is signed and reference material captured, this Pod writes the cleared package (recordings plus explicit use-boundary documentation) once, immutably, to the shared registry.

**Read access:** Audio, Foundation, and (where a specific use is separately confirmed) Localization and Marketing Creative may read the cleared package and its stated boundaries.

**No downstream mutation:** confirmed — no downstream Pod may reinterpret or expand what a cleared package's stated use boundaries cover; a Pod needing a use beyond what's documented must come back to this Pod for confirmation (Section 2, step 8), not act on its own interpretation of the existing terms.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** character descriptions and casting needs from Narrative/the Showrunner, and technical capture requirements from Audio (what a usable reference recording needs to contain to support synthesis).

**Formal output contract:** a cleared package per performer — signed contract terms, clean reference recordings, and an explicit, unambiguous statement of exactly which uses are covered.

**Contract change process:** if a new use case requires expanding what a performer's agreement covers, this Pod treats the expansion as a new, separately negotiated and documented addendum, not a reinterpretation of the original terms — with the updated coverage published as a new version and all Pods relying on the prior, narrower scope explicitly notified that expanded coverage now exists (relevant, for instance, to Localization's own flagged uncertainty about multilingual dub coverage, POD-17 Section 9).

### 3.6 Event-Driven Triggers
**Trigger to begin work:** receipt of confirmed character descriptions and casting needs from Narrative/the Showrunner.

**Trigger this Pod's output causes downstream:** publishing a cleared package fires an automated notification (via Infrastructure) to Audio and Foundation that a performer's licensed reference material is available for synthesis work to begin.

### 3.7 Black-Box Autonomy
While negotiating and casting, this Pod is not required to expose in-progress negotiation terms, audition results, or unconfirmed casting discussions to any other Pod. The only outputs visible externally are the finalized cleared package and its explicit use-boundary documentation.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-08 Narrative Pod | Character descriptions and casting needs | v1.0 | Full block on beginning casting for that character — nothing to cast against without a description |
| POD-05 Audio Pod | Technical capture requirements (what a usable reference recording needs to contain) | v1.0 | Soft risk — recording can proceed on general best practice, but risks capturing material that doesn't actually meet Audio's specific synthesis needs, requiring a costly re-capture session |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-05 Audio Pod | Approved voice profiles/seeds, licensed under confirmed SAG-AFTRA terms | v1.0 | **Full, hard block** — Audio cannot synthesize dialogue using any voice reference not formally cleared by this Pod (mirrored directly from POD-05's own Section 7) |
| POD-01 Legal, Provenance & Clearance | Underlying performer likeness/voice agreements, for cross-verifying AI-synthesis coverage | v1.0 | Full block on Legal clearing any likeness/voice-related asset without this Pod's underlying agreement to verify against (mirrored from POD-01's own Section 4.1) |
| POD-17 Localization & Accessibility | Confirmation of whether multilingual dub synthesis is covered by the original agreement | v1.0 | Cannot proceed with dub voice synthesis referencing a performer's likeness without this Pod's explicit confirmation the license extends to that use — resolving the gap flagged in Localization's own Section 9 |
| POD-23 Press & Communications | Any contractual press obligations a performer has agreed to | v1.0 | Needs visibility into what press participation is contractually expected versus voluntary when scheduling interviews — the gap flagged in Press & Communications' own Section 9 |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates closely with Legal & Provenance on every clearance (Section 2, step 6; Section 3.3) as a standing, structural relationship rather than an occasional one — the two Pods function as independent, parallel checks on the same underlying question (is this use actually covered), mirroring the same two-independent-gates relationship Legal has with Data Ops for technical/legal asset certification (POD-01, Section 4.3).

### 4.4 Position in the Macro-Node Structure
This Pod sits within Blueprint, reflecting that casting is fundamentally a creative/pre-production function — the performers this Pod secures become the actual raw material for Audio's and Foundation's creative work — even though its Union/Rights Coordinator role carries the same Tier 1 legal weight as Studio Firewall's own governance Pods. Unlike Assembly, there's no genuine bridge tension here: this Pod's placement reflects what it's *for* (securing performers for creative use), while its rigor reflects the stakes of *how* that's done.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Character descriptions, casting needs | Narrative Pod (POD-08) / Showrunner | Text / structured casting brief | v1.0 | Required |
| Technical capture requirements | Audio Pod (POD-05) | Structured technical specification | v1.0 | Required (soft — see 4.1) |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Cleared performer package (contract terms, reference recordings, use-boundary documentation) | Audio Pod, Foundation Pod, Legal & Provenance | Reference audio/video files + structured legal documentation | v1.0 | Y |
| Use-scope confirmations (per new downstream request) | Localization, Marketing Creative, or any Pod requesting an unanticipated use | Structured confirmation or denial | v1.0 | Y |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** a downstream Pod (most plausibly Localization, generating a multilingual dub, or Marketing Creative, generating promotional synthesis) proceeds under the assumption that a performer's original agreement broadly covers their new use case, when the agreement was actually negotiated and scoped only for the original, narrower purpose — and this isn't discovered until the performer, their union, or their representation raises the issue, at which point the production has already used an unlicensed application of someone's likeness or voice, a fact that cannot be retroactively cured the way a technical asset can simply be re-rendered.

**Weaker-signal risk (framework-general, applied here):** this Pod's core function is legal negotiation, not AI-generated content, so the framework's general AI-artifact-only back-brief risk doesn't directly apply. The more relevant risk is the interpretive-scope risk already described in Section 3.2 and Section 6's main risk — a downstream Pod's own optimistic reading of what an agreement covers, rather than a failure in this Pod's own negotiation process. **Mitigation used by this Pod:** the strict, conservative interpretive stance (Section 3.2) combined with treating every new use case as requiring fresh confirmation (Section 2, step 8) rather than trusting a downstream Pod's own interpretation of existing terms.

**Cost of an undetected error:** severe and closely related in kind to Legal & Provenance's own Tier 1 risk (POD-01, Section 6) — an unlicensed use of a real performer's likeness or voice is a direct legal and union-relations liability that can affect not just the specific asset but the production's broader standing with the talent union, potentially affecting the ability to cast or work with performers on future seasons. This is a narrower-scope but comparably serious version of Legal's own existential risk category, specifically because this Pod's clearances feed directly into Legal's own broader clearance process (Section 4.2) — a failure here can become a failure there.

**Escalation path:** if a downstream Pod's proposed use is genuinely ambiguous under the existing contract, this Pod does not resolve the ambiguity in the production's favor internally — it escalates to actual renegotiation with the performer's representation, treated with the same non-negotiable rigor Legal applies to its own clearance timeline (POD-01, Section 3.2) — this Pod does not compress or shortcut this process under production schedule pressure.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly and absolutely forbidden from confirming a use case is covered by an existing agreement without genuine, specific contractual language supporting that confirmation — the same non-negotiable, defensibility-over-speed standard Legal & Provenance applies to its own clearances (POD-01, Section 7).
- This Pod may not release a cleared package to Audio or Foundation without both a signed, appropriately-scoped contract *and* captured reference material — neither alone is sufficient (Section 2, idle/blocked behavior).
- This Pod does not have authority to unilaterally decide a new, unanticipated use case is close enough to an existing agreement's scope to proceed without renegotiation — that determination requires actual confirmation from the performer's representation, not this Pod's own generous interpretation.
- Default resource allocation: this Pod's own operating costs are minimal and non-compute, similar to Legal, Network Gateway, and Press & Communications — its constraint is legal/negotiation expertise and performer relationship management, not GPU allocation.

---

## 8. Success Criteria

- Audio and Foundation know this Pod succeeded when the reference material they receive is technically usable and unambiguously, confirmedly cleared for the specific synthesis work they need to do.
- Legal & Provenance knows this Pod succeeded when every cross-verification confirms genuine, specific contractual coverage rather than requiring Legal to independently chase down ambiguous terms this Pod should have already resolved.
- **Contract success:** casting is completed, contracts are signed with explicit AI-use scope, and reference material is captured and delivered in usable form.
- **Intent success:** every actual downstream use of a performer's likeness or voice throughout the season remains genuinely, defensibly covered by what was negotiated — not just at the point of initial delivery, but as new uses arise over time.
- **Concrete divergence case for this Pod:** a cleared package could be contract-compliant (properly documented, technically usable, correctly delivered) while still failing intent if a downstream Pod later develops a use this Pod's original scoping didn't anticipate and that Pod proceeds without coming back for confirmation — exactly the risk in Section 6, and why the use-scope confirmation process (Section 2, step 8; Section 5.2) is treated as an ongoing service this Pod provides throughout the season, not a one-time deliverable at casting.

---

## 9. Open Questions / Notes

- Per the cross-Pod escalation standard (`cross_pod_escalation_threshold_standard.md`), this Pod's iteration-cycle threshold is not the relevant mechanism here, the same way it wasn't for Legal & Provenance (POD-01, Section 9) — this Pod's core risk is about scope-of-coverage ambiguity and renegotiation, not repeated attempts at the same technical fix, so the three-cycle standard doesn't meaningfully apply.
- This spec resolves two gaps explicitly flagged as open in prior specs: Localization's uncertainty about whether multilingual dub synthesis is covered by original voice licensing (POD-17, Section 9), and Press & Communications' need for visibility into contractual press obligations (POD-23, Section 9) — both are now formalized as explicit outputs/relationships in Section 4.2 and 5.2 above, rather than left as gaps for this spec to also merely acknowledge.
- This Pod's internal workflow draws on solid source material naming its core function directly (SAG-AFTRA contract negotiation, voice likeness licensing, capturing clean reference audio for downstream synthesis) — comparable in grounding to Foundation, Audio, and Legal & Provenance, though the specific headcount split and the use-scope-confirmation-as-ongoing-service framing in Section 2/8 are original elaborations built to resolve the specific gaps this Pod's absence had left open in Localization's and Press & Communications' own specs.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec — resolves open gaps previously flagged in POD-17 (Localization) and POD-23 (Press & Communications) | Y — POD-17's Section 9 gap (multilingual dub voice licensing) and POD-23's Section 9 gap (press obligation visibility) are now formalized as this Pod's outputs; those specs' own open-questions sections should be considered resolved by this spec's Section 4.2 |

- **Deprecation policy:** a cleared performer package and its use-scope documentation are never deleted or overwritten — even a superseded, narrower scope is retained alongside any later expansion, since the production's full history of what was covered when may be legally relevant if a use is ever challenged.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production — though, as with Legal & Provenance's own certificates (POD-01, Section 10), the underlying legal agreements themselves remain this Pod's own legal record, with Data Ops tracking only the versioning metadata layer.