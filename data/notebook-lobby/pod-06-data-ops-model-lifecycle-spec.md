# Pod Specification: POD-06 — Data Ops & Model Lifecycle Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Data Ops & Model Lifecycle Pod |
| **Alternate/Node Name** | The Custodian Node |
| **Macro-Node / Tier** | Studio Firewall (criticality Tier 2 — Foundational) |
| **Headcount (human)** | 2 — one ML/DevOps Engineer (model versioning, environment freezing), one Archival/Registry Administrator (seed registries, documentation, cross-Pod version records) |
| **Pod Lead / Accountable Owner** | The ML/DevOps Engineer. Holds sign-off authority on whether a model/dependency update is approved for production use, and is the accountable owner of this Pod's own version-history record (Section 10) as well as the *authoritative* keeper of version history for every other Pod in the production (see Section 4.2). |
| **Primary AI/Compute Tooling** | Docker/containerization tooling for environment freezing, model checkpoint registries, dependency-lockfile management, automated regression-testing scripts run against frozen environments |
| **One-Sentence Mission** | Guarantee that any model, checkpoint, or environment used to produce this season's assets can be exactly reconstructed and reused — this season, next season, or after any tooling update — without silently breaking visual or narrative consistency. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** Generative AI pipelines are built on a stack of constantly-shifting dependencies — ComfyUI custom nodes update, base checkpoints get retrained, Python library versions drift. If a Scene Pod or the Foundation Pod silently updates a dependency to get a new feature, it can invisibly change how every other Pod's output looks or behaves, without anyone noticing until footage from two different points in time doesn't match. No single production Pod (Foundation, Scene, Polish) is positioned to catch this, because each one only sees its own local environment — the problem is only visible from a vantage point that tracks *all* environments simultaneously. That vantage point is this Pod.

**Single most important outcome this Pod is accountable for:** at any point — mid-production or three years later for a Season 2 order — the exact model/tooling state used to produce any given asset can be reconstructed byte-for-byte, and no dependency update reaches a production Pod without being validated first.

**Explicitly outside this Pod's purpose:**
- This Pod does not train or fine-tune character LoRAs or style checkpoints — that's the Foundation Pod's job. Data Ops *freezes and versions* what Foundation produces; it does not create creative assets itself.
- This Pod does not make creative judgment calls about whether a model update is an *improvement* — it only certifies whether an update is *safe* (non-breaking) to introduce. Whether to actually adopt a new capability is a Foundation Pod / Showrunner decision.
- This Pod does not manage GPU compute scheduling or cost tracking — that is Infrastructure (POD-12) and Finance (POD-03) respectively; Data Ops manages the *software and model state* that runs on that compute, not the compute itself or its budget.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive a request — either a scheduled check or an ad hoc flag — to evaluate a proposed dependency, model, or tooling update (e.g., a new ComfyUI custom node version, an updated base checkpoint, a Python library bump).
2. Spin up an isolated test environment reflecting the proposed update, separate from the production environment.
3. Run automated regression tests: re-generate a fixed, known set of reference outputs (a "golden set" of prior scenes/assets) using the updated environment and diff them against the currently-frozen production baseline.
4. If outputs match within an acceptable tolerance (defined per-asset-type — see Section 7), the update is certified safe and the environment is frozen as a new, versioned Docker container.
5. If outputs diverge unexpectedly, the update is rejected and flagged back to whichever Pod requested it, with the specific regression identified.
6. On certification, publish the new frozen environment to the registry and notify affected Pods via the Infrastructure Pod's event system — production Pods do not adopt the update until this notification occurs.
7. Continuously (not just on request): archive every finalized Foundation Pod checkpoint, every locked seed used in a finalized Scene Pod render, and every Pod's version-history record (Section 10 of each Pod's own spec) into the central registry.
8. Periodically audit the registry itself for completeness — confirming no Pod has drifted without its version history being recorded.

**Human roles inside the Pod and division of labor:**
- **ML/DevOps Engineer** — owns the technical regression-testing process, environment freezing, and the safe/unsafe certification judgment.
- **Archival/Registry Administrator** — owns the registry itself: making sure every other Pod's version-history record actually gets filed here (per the "Owner of this record" line in every Pod's Section 10), and that the archive remains queryable and complete.
- **Why split rather than combined:** technical regression testing (does this environment reproduce identical output) and archival completeness (has every Pod actually reported its changes) are different failure modes requiring different vigilance — a purely technical engineer optimizing for passing tests may not notice that three Pods haven't filed a version-history update in weeks, and a purely administrative role can't independently judge whether a regression is real or noise.

**Tooling specifics:** Docker for environment freezing; automated diffing/regression scripts for golden-set comparison; a structured registry (database or versioned file store) for seeds, checkpoints, and cross-Pod version records.

**Known failure modes of this Pod's own process, and internal catches:**
- *A dependency update looks safe on the golden-set test but breaks on an edge case the golden set didn't cover* — mitigated by periodically expanding the golden set with genuinely difficult recent scenes, not just a fixed original sample.
- *A Pod updates its own local tooling without notifying Data Ops* — this is a governance failure, not a technical one; caught only by the periodic registry-completeness audit (step 8), which is why that audit is a standing responsibility rather than a one-time setup task.

**Idle/blocked behavior:** This Pod is rarely fully blocked, since its core function (archiving, auditing) runs continuously regardless of other Pods' pace. However, a specific *certification* task blocks if the requesting Pod hasn't supplied a stable proposed update to test against — Data Ops will not certify a moving target. If a production Pod is impatiently waiting on a certification, this Pod does not compress the regression-testing process to meet a deadline; the certification either passes on its own timeline or is rejected, since a rushed certification defeats the Pod's entire purpose (see Section 7).

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives, translated from the Showrunner's macro-level concern about franchise continuity, is roughly: *"Whatever model or tooling state produces this season's look and voice must be reproducible on demand — for a mid-season fix, a Season 2 order, or a legal audit — regardless of how the underlying AI ecosystem changes around us."* Note this doesn't specify *how* to freeze environments or *which* containerization approach to use — the Pod is free to choose Docker, or any equivalent, as long as the reproducibility guarantee holds.

### 3.2 Values as Boundary Conditions
- **Reproducibility over adopting new capability:** if a new model version offers better quality but cannot be certified as backward-compatible with existing frozen assets, the Pod defaults to *not* certifying it for current-season use, even if it means production Pods don't get access to a genuinely better tool mid-season.
- **No silent updates, ever:** this is closer to an absolute rule than a trade-off — no dependency reaches a production Pod without passing through this Pod's certification, full stop. There is no "minor update, skip the check" exception.
- **Certification speed is not traded against thoroughness:** unlike some Pods where "speed over perfection" applies, this Pod explicitly does not compress its regression-testing timeline under production pressure (see Section 2, idle/blocked behavior) — the entire value of this Pod evaporates if certifications become rubber-stamped to meet a deadline.

### 3.3 Back-Brief
**Internal back-brief:** before a full regression-test run (which can be compute-expensive), the ML/DevOps Engineer first runs a lightweight smoke test — a small handful of quick, cheap generations — to catch obviously broken updates before committing to the full golden-set comparison. This is the artifact-only, cheap-preview-before-expensive-commitment pattern applied to infrastructure validation rather than creative content.

**Weaker-signal risk:** a smoke test passing doesn't guarantee the full regression suite will pass — this Pod treats the smoke test strictly as a cheap filter for *obvious* breakage, not as a substitute for the full test. Unlike a creative back-brief (where "looks right" is genuinely close to the actual success criterion), this Pod's back-brief is explicitly a lower-confidence pre-filter, not a proxy for the real certification.

### 3.4 Global Read / Local Write
**Private working state:** the isolated test environment used during certification is not visible to or usable by any other Pod while testing is in progress — no production Pod should be building on an uncertified environment.

**Finalized write:** once certified, the new frozen Docker container and its version tag are written once, immutably, to the shared model/environment registry. Similarly, once a Pod's version-history entry is filed, it is not edited — a correction is a new entry, not an overwrite.

**Read access:** every Pod may read the current certified environment version and the full historical registry at any time.

**No downstream mutation:** confirmed — no Pod may swap in an uncertified environment or edit an archived checkpoint/seed directly. Any Pod wanting a different environment state must request certification through this Pod's formal process (Section 3.5), not self-serve a change.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** a proposed dependency/model/tooling change, submitted with a description of what it changes and why, from the requesting Pod (most commonly Foundation or a Scene Pod).

**Formal output contract:** either (a) a certified, versioned, frozen environment published to the registry, or (b) a rejection with the specific regression identified, returned to the requesting Pod.

**Contract change process:** if this Pod changes its own certification criteria or tolerance thresholds (Section 7), that change is itself logged in this Pod's own Section 10 version history and announced via Infrastructure's event system — this Pod holds every other Pod to a contract-change discipline it also applies to itself.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** receipt of a proposed dependency/model change request from any production Pod, or a scheduled periodic registry-completeness audit (time-based, not manually initiated).

**Trigger this Pod's output causes downstream:** certification of a new environment fires an event via the Infrastructure Pod, notifying all Pods using that dependency that an update is now available and safe — Pods then choose when to adopt it, but are notified automatically rather than needing to check manually.

### 3.7 Black-Box Autonomy
While a certification is in progress, this Pod is not required to expose its intermediate test results or partial regression-diff output to the requesting Pod — only the final pass/fail and, if failed, the specific regression identified. The requesting Pod does not get visibility into the testing process itself, only the verdict.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-07 Foundation Pod | Finalized character LoRAs and style checkpoints requiring archival | v1.0 | Archival backlog grows, but this is a delayed-cost risk, not an immediate block — the real damage surfaces later if a checkpoint needs to be reconstructed and wasn't archived in time |
| POD-15 Scene Pods | Locked seeds and generation parameters used in finalized renders, for archival | v1.0 | Same shape of delayed risk as above — seeds not archived promptly become very difficult to reconstruct after the fact |
| POD-12 Infrastructure Pod | The event-triggering mechanism this Pod relies on to notify other Pods of certifications | v1.0 | If Infrastructure's event system is down, this Pod can still certify updates but cannot automatically notify dependents — falls back to manual notification, which is slower but not a hard block |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-07 Foundation Pod | Certified, frozen environments before adopting any new model/tooling version | v1.0 | Cannot adopt a new base checkpoint or tooling update without this Pod's certification, regardless of how urgently a creative need exists |
| POD-15 Scene Pods | Certified environments; archived seed/parameter registry for reproducing prior renders | v1.0 | Must render within a certified environment version — cannot informally update local tooling to fix an unrelated bug without risking decertification of their output |
| POD-13 Polish Pod | Certified environments for any AI-assisted inpainting/cleanup tooling | v1.0 | Same constraint as Scene Pods — inpainting tooling changes go through certification before production use |
| **All 23 Pods** | Version-history record-keeping (per each Pod's own Section 10, "Owner of this record") | v1.0 | Every Pod's version-history table is filed here, not self-archived in isolation — this Pod is the authoritative, cross-Pod source of truth for "what changed, when, and did it affect a contract" |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates informally with Legal, Provenance & Clearance (POD-01) whenever a new base model or checkpoint is being evaluated for certification, since a new model's training provenance is a legal question this Pod is not equipped to answer itself — but this is advisory coordination, not a blocking dependency in either direction; Data Ops can certify technical reproducibility independent of Legal's clearance timeline, though a technically-certified-but-legally-uncleared model still cannot be used in production (a Legal-side gate, not a Data Ops one).

### 4.4 Position in the Macro-Node Structure
This Pod sits within Studio Firewall despite doing deeply technical work, because its actual function — protecting the production and the studio relationship from a specific category of catastrophic risk (irreproducibility, silent drift) — is closer in kind to Legal's or Security's risk-containment role than to Foundation's creative-asset-production role. There is no tension in this placement; unlike Assembly, this Pod's decisions and its inputs are both technical/governance in nature, not split between two different concerns.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Proposed dependency/model/tooling change request | Any production Pod (most commonly Foundation, Scene Pods) | Structured change-request document | v1.0 | Required (for a certification task specifically) |
| Finalized checkpoints, seeds, generation parameters | Foundation Pod, Scene Pods | Model files / structured metadata | v1.0 | Required (for ongoing archival) |
| Version-history records | Every Pod (per their own Section 10) | Structured changelog table | v1.0 | Required |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Certified, frozen environment (Docker container + version tag) | All production Pods using the relevant dependency | Container image + metadata | v1.0 | Y |
| Certification result (pass/reject + regression detail) | Requesting Pod | Structured report | v1.0 | Y |
| Cross-Pod version-history registry | All Pods (read access), Showrunner (audit access) | Structured, queryable archive | v1.0 | Y (append-only) |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** a dependency update is certified as safe based on the golden-set regression test, but the golden set doesn't cover the specific edge case that later breaks — meaning the Pod's own core mechanism (regression testing) has a blind spot that looks exactly like success until it doesn't. This is a subtler version of the general "back-brief that looks right but rests on unstable interpretation" risk, applied to infrastructure rather than creative content: the smoke test and even the full regression suite are both artifact-only signals (did outputs match), not an explanation of *why* the new dependency behaves the way it does internally.

**Mitigation used by this Pod:** the golden set is treated as a living, expanding sample (Section 2) rather than a fixed original baseline — every time a real production issue surfaces that the golden set didn't catch, that case is added to the set, so the Pod's blind spots shrink over time rather than staying static across the whole season.

**Cost of an undetected error:** potentially catastrophic and *delayed* — unlike most Pods where an error surfaces within an episode or two, an uncaught model-drift failure might not surface until Season 2 pre-production, when the studio discovers Season 1's exact look can no longer be reproduced. This is one of the few failure modes in the entire production where the cost isn't just "expensive to unwind" but genuinely irreversible — a checkpoint that wasn't properly frozen may not be reconstructable at all. This justifies the Pod's refusal to compress certification timelines under pressure (Section 3.2) even when doing so creates friction with production Pods wanting faster turnaround.

**Escalation path:** if a certification is repeatedly rejected and a production Pod believes the rejection is overly conservative, escalation goes to the Showrunner (or the Blueprint macro-node Lead, if the requesting Pod is within Blueprint) to weigh the creative cost of the delay against this Pod's technical judgment — this Pod does not have unilateral authority to indefinitely block a production need, but also cannot be overruled by the requesting Pod itself.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly forbidden from certifying an update under production time pressure by skipping the full regression suite — a smoke-test-only "certification" is not a valid output of this Pod's process, ever (see Section 3.2).
- This Pod does not have authority to approve a model for use if Legal & Provenance (POD-01) has not separately cleared its training data — technical reproducibility and legal clearance are two different gates, and this Pod only owns the former.
- Regression tolerance thresholds (how much deviation from the golden set counts as "matching") must be defined per asset type (e.g., visual checkpoints vs. audio models likely need different tolerance definitions) and any change to those thresholds must be logged in this Pod's own Section 10, not adjusted informally.
- Default resource allocation: regression testing runs on a dedicated, isolated compute allocation separate from production rendering budgets (tracked by Finance, POD-03) specifically so that certification testing is never implicitly deprioritized when production compute is tight.

---

## 8. Success Criteria

- The Showrunner knows this Pod succeeded when, at any point requested — mid-season or years later — any prior asset's exact production environment can be reconstructed and verified to produce matching output, without needing to understand this Pod's internal certification process.
- A rejected certification is returned to the requesting Pod with the specific regression identified (not just "failed") so the requesting Pod can determine whether to modify their request or abandon the proposed update.
- **Contract success:** a certification was issued or rejected within the Pod's process, on a stable proposed change, with a properly filed registry entry.
- **Intent success:** the underlying guarantee — that production state remains reproducible — actually held when tested against a real future need (e.g., a genuine Season 2 reconstruction, not just a passed regression test).
- **Concrete divergence case for this Pod:** a certification could be contract-compliant (regression suite passed, environment frozen and registered correctly) while still failing intent if the golden set simply didn't include the case that later breaks — exactly the risk described in Section 6. This is why the golden set's ongoing expansion (Section 2) is treated as core to this Pod's job, not a nice-to-have refinement.

---

## 9. Open Questions / Notes

- **[Resolved]** Regression tolerance thresholds are addressed by the cross-Pod escalation standard (see `cross_pod_escalation_threshold_standard.md`): three consecutive certification failures on the same proposed update is now this Pod's defined threshold for escalating to the requesting Pod, rather than continued informal retesting. Note this resolves the *escalation* threshold specifically — the underlying *tolerance definition* (how much deviation from the golden set counts as a failure in the first place) per asset type is a separate, still-open question the standard does not cover, and remains the ML/DevOps Engineer's judgment call per Section 7.
- The relationship between this Pod's periodic registry-completeness audit and enforcement is unresolved — if the audit reveals a Pod hasn't filed a version-history update in weeks, what authority does this Pod have to compel compliance versus simply flagging it upward? Currently assumed to route through the Showrunner, but not explicitly specified.
- This Pod was extrapolated from earlier framework references (its role as archival/versioning custodian, and as the designated "Owner of this record" for other Pods' Section 10) rather than from a single detailed source passage — the internal workflow and headcount split here are reasoned inferences from the framework's stated purpose for this Pod, not drawn from an existing detailed description, and should be reviewed against actual production practice before being treated as final.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |

- **Deprecation policy:** a certified environment version remains available in the registry indefinitely (never deleted, only superseded) — this Pod's entire purpose depends on old versions staying retrievable, so there is no standard deprecation window for certified environments themselves, unlike other Pods' output contracts.
- **Owner of this record:** this Pod is responsible for its own version history, consistent with its general role as custodian of versioning across the production — there is no higher authority this delegates to, since this Pod *is* that authority for every other Pod.