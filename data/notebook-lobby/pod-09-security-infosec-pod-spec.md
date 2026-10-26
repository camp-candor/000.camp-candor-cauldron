# Pod Specification: POD-09 — Security & InfoSec Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Security & InfoSec Pod |
| **Alternate/Node Name** | The TPN Protection Node |
| **Macro-Node / Tier** | Studio Firewall (criticality Tier 2 — Foundational) |
| **Headcount (human)** | 2 — one Security Engineer (network segmentation, access control, encryption), one Forensic/Compliance Specialist (watermarking, TPN audit documentation, leak investigation) |
| **Pod Lead / Accountable Owner** | The Security Engineer. Holds sign-off authority on whether the production's infrastructure and access controls meet TPN standards and are safe to operate; the Forensic/Compliance Specialist owns watermarking and audit trail integrity but does not have authority to approve infrastructure changes. |
| **Primary AI/Compute Tooling** | Network segmentation and MFA/identity management tooling, invisible forensic watermarking pipelines applied to work-in-progress renders, encryption-at-rest and in-transit tooling, automated access-log auditing |
| **One-Sentence Mission** | Guarantee that the production's distributed, AI-heavy pipeline meets Trusted Partner Network security standards and that any leaked asset can be traced back to its source Pod — protecting the studio relationship from a category of risk no creative or technical Pod is positioned to manage on its own. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** major studios like Warner Bros. Discovery require all vendors to comply with the Trusted Partner Network standard, and will pull a contract immediately upon discovering a security failure — unencrypted scripts passed over informal channels, proprietary character models sitting on unsecured local drives, no way to trace a leak back to its source. No individual production Pod is positioned to own this risk: Foundation cares about asset quality, Scene Pods care about rendering, Infrastructure cares about pipelines running smoothly — none of them are structured to think adversarially about their own systems. This Pod exists specifically to hold that adversarial, "assume something will leak or someone will attack" perspective across the entire distributed pod network, which no single production-focused Pod would naturally maintain on its own.

**Single most important outcome this Pod is accountable for:** the production's infrastructure and data-handling practices remain continuously TPN-compliant, and every work-in-progress asset carries forensic watermarking sufficient to trace a leak back to its originating Pod if one occurs.

**Explicitly outside this Pod's purpose:**
- This Pod does not manage the compute infrastructure itself (Cloudflare Workers, GPU scheduling, R2 buckets) — that's Infrastructure's (POD-12) job; Security audits and dictates *how* that infrastructure must be secured, it does not build or operate it.
- This Pod does not handle IP clearance or copyright provenance of training data — that's Legal, Provenance & Clearance's (POD-01) job; Security protects against unauthorized *access* to assets, Legal ensures the assets themselves have clean *ownership*.
- This Pod does not make creative or resourcing decisions — it sets hard security constraints that other Pods must operate within, but does not otherwise direct their work.
- This Pod does not itself investigate or prosecute a leak once it occurs beyond identifying its source via watermarking — actual legal/contractual response to a leak is Legal & Provenance's and Network Gateway's responsibility, informed by this Pod's forensic findings.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Establish and continuously maintain the baseline security architecture: network segmentation between Pods, MFA requirements for all access points, and encryption standards for data at rest and in transit — coordinated with Infrastructure (POD-12) for implementation, but specified and audited by this Pod.
2. Apply invisible forensic watermarking to every work-in-progress render as it's produced by Scene Pods, before it's shared even internally beyond its originating Pod — each watermark uniquely traceable to its source Pod and, where feasible, the specific render pass.
3. Continuously monitor access logs across the distributed pod network for anomalous access patterns (e.g., an account accessing far more assets than its role requires, access from an unexpected location).
4. Conduct periodic TPN compliance audits — reviewing whether actual practice across all Pods still matches the required standard, not just whether it did at initial setup.
5. If a leak is discovered (internally or externally, e.g., a frame appearing publicly that shouldn't have), extract and analyze the forensic watermark to identify the source Pod and render pass, and report findings to Network Gateway and Legal & Provenance for response.
6. Issue security findings and required remediations back to any Pod found non-compliant during an audit, with a defined timeline for remediation.

**Human roles inside the Pod and division of labor:**
- **Security Engineer** — the architecture and access-control vector. Owns network segmentation, MFA, and encryption standards; thinks in terms of preventing unauthorized access before it happens.
- **Forensic/Compliance Specialist** — the detection and audit vector. Owns watermarking implementation, TPN documentation, and leak investigation; thinks in terms of ensuring any breach that does happen can be traced and attributed.
- **Why split rather than combined:** prevention (hardening access before an incident) and forensics (tracing what happened after one) require different mindsets and different day-to-day workflows — a person focused on architecture hardening is not well-positioned to also maintain the meticulous, ongoing documentation discipline TPN audits require, and vice versa.

**Tooling specifics:** network segmentation and MFA tooling is specified by the Security Engineer and implemented in coordination with Infrastructure; forensic watermarking is applied at the point of render output (working with Scene Pods' output pipeline) so that watermarking is automatic and not an optional or forgettable extra step.

**Known failure modes of this Pod's own process, and internal catches:**
- *Watermarking degrades or is stripped during downstream processing* (e.g., Polish Pod's inpainting inadvertently removing the watermark) — mitigated by testing watermark survivability against the actual downstream processing pipeline, not just against the raw Scene Pod output in isolation.
- *A TPN audit passes at initial setup but practice silently drifts out of compliance over time* (e.g., a Pod adopts a new, uncleared file-sharing habit under deadline pressure) — mitigated by the periodic (not one-time) audit cadence in step 4.
- *Access-log monitoring produces alert fatigue from too many false positives, causing genuine anomalies to be missed* — mitigated by tuning anomaly-detection thresholds against actual normal-use patterns per Pod, since a Scene Pod's normal access pattern looks very different from Assembly's.

**Idle/blocked behavior:** This Pod's core functions (monitoring, watermarking, periodic audits) run continuously and are never blocked by other Pods' pace — it does not wait on creative or production milestones to do its work. A specific *incident response* task (step 5) is triggered reactively by a discovered leak and takes priority over routine audit work when active, but this Pod does not otherwise sit idle waiting for input from any other Pod.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives, translated from the Network's and Showrunner's shared concern about protecting the production, is roughly: *"No proprietary character design, script, or footage may leak before its intended release, and if something does leak, we must be able to identify its source immediately."* Note this specifies the *outcome guarantee* (no unauthorized disclosure, traceable if it happens) without dictating the specific security tooling, watermarking technique, or audit cadence used to achieve it — this Pod is free to choose its own methods as long as the guarantee holds.

### 3.2 Values as Boundary Conditions
- **Traceability over convenience:** watermarking and access logging are applied even when they add friction to a Pod's workflow (e.g., an extra authentication step, a processing pass that slightly increases render pipeline time) — the ability to trace a leak wins over shaving time off a Pod's local process.
- **Continuous compliance over point-in-time compliance:** a TPN audit passing once is not treated as sufficient — this Pod's periodic re-audit cadence (step 4) reflects a standing value that compliance must be maintained, not just initially achieved.
- **Escalate rather than quietly patch:** if this Pod discovers a non-compliant practice during an audit, the finding is documented and reported (step 6), not quietly fixed without record — since an unrecorded fix leaves no trail for future audits or for Network Gateway's own reporting to the studio.

### 3.3 Back-Brief
**Internal back-brief:** before rolling out a new security control across the full distributed pod network (e.g., a new MFA requirement or watermarking scheme), the Security Engineer pilots it against a small subset of Pods first, checking that it doesn't break their existing workflow before requiring universal adoption — a cheap, contained proof-of-viability before full-scale rollout, structurally similar to a preview-before-full-render back-brief but applied to infrastructure change rather than creative content.

**Pod-to-Network-Gateway back-brief:** significant security architecture changes (not routine monitoring) are reported to Network Gateway (POD-02) before rollout, since Network Gateway owns the studio-facing relationship and needs advance notice of anything that could affect delivery timelines or require studio sign-off.

**Weaker-signal risk mitigation:** this Pod's core function (detecting anomalies, verifying compliance) is less exposed to the AI-artifact-only back-brief risk described elsewhere in this framework, since its outputs are largely deterministic security/compliance checks rather than generative creative content — the more relevant risk for this Pod is a false negative in anomaly detection (Section 6), not an unstable AI interpretation of creative intent.

### 3.4 Global Read / Local Write
**Private working state:** in-progress security audits, unresolved anomaly investigations, and draft remediation plans are visible only within the Pod until findings are finalized — this avoids alarming other Pods with unconfirmed suspicions.

**Finalized write:** this Pod writes finalized audit reports, watermark verification records, and incident findings once, immutably, to a secured registry — separate from the general asset registry, given the sensitivity of security findings.

**Read access:** audit findings relevant to a specific Pod are shared with that Pod directly (for remediation); full audit history and incident reports are readable by Network Gateway and Legal & Provenance, but not broadly shared across all production Pods, since security findings themselves could be sensitive information.

**No downstream mutation:** confirmed — no Pod may alter its own audit findings or remove a watermark from its own output. If a Pod disputes a finding, it raises the dispute formally (Section 3.5) rather than editing the record.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** access logs and infrastructure configuration data from Infrastructure (POD-12); raw work-in-progress renders from Scene Pods and other Generative Core Pods, for watermarking.

**Formal output contract:** periodic TPN compliance audit reports; watermarked assets (returned to the originating Pod's pipeline); incident/leak forensic findings when applicable.

**Contract change process:** if this Pod introduces a new required security control (e.g., a new MFA method), the change is piloted first (Section 3.3), then announced via Infrastructure's event system with a defined compliance deadline — Pods are given a transition window rather than an instant hard cutover, except in the case of an active, ongoing security incident, where immediate compliance may be required without a transition window.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** continuous — this Pod's core monitoring and watermarking functions are always running, not triggered by a specific upstream event, though a leak discovery (internal or external) triggers the specific incident-response workflow (Section 2, step 5).

**Trigger this Pod's output causes downstream:** a failed audit finding triggers a remediation request to the affected Pod with a compliance deadline; a confirmed incident triggers an immediate notification to Network Gateway and Legal & Provenance.

### 3.7 Black-Box Autonomy
While an audit or investigation is in progress, this Pod is not required to expose its specific detection methods, monitoring thresholds, or investigative techniques to other Pods — revealing exactly how anomaly detection works would undermine its effectiveness. Other Pods see only the final finding and required remediation, not the method used to detect the issue.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-12 Infrastructure Pod | Access logs, infrastructure configuration, and implementation of specified network/MFA controls | v1.0 | This Pod cannot effectively audit or monitor without Infrastructure's cooperation — a significant gap here undermines this Pod's core function, though it can still audit whatever partial data is available rather than fully blocking |
| POD-15 Scene Pods (and other Generative Core Pods) | Raw work-in-progress renders, for watermark application | v1.0 | If renders aren't routed through this Pod's watermarking step, those specific assets lose traceability — a quality/coverage gap in this Pod's guarantee, not a full block on its other functions |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-02 Network Gateway | Compliance audit summaries and incident reports, for studio-facing milestone reporting | v1.0 | Cannot represent the production as TPN-compliant to the studio without this Pod's ongoing certification |
| POD-01 Legal, Provenance & Clearance | Forensic findings in the event of a leak | v1.0 | Legal response to a leak depends on this Pod's ability to identify its source — without watermarking, Legal has no technical basis for attribution |
| All production Pods (indirect) | Required security controls (MFA, network segmentation, encryption standards) they must operate within | v1.0 | Every Pod's access to shared infrastructure and asset registries is gated by this Pod's specified controls — non-compliant Pods can be flagged and required to remediate before continuing normal operation |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates informally with Data Ops & Model Lifecycle (POD-06) regarding the security of the model/environment registry itself, since Data Ops' registry is a high-value target (proprietary trained assets) that benefits from this Pod's access-control standards — but this is a shared-concern coordination, not a blocking dependency in either direction; Data Ops can technically operate its registry without this Pod's involvement, though doing so would leave a security gap this Pod would be expected to flag during a routine audit.

### 4.4 Position in the Macro-Node Structure
This Pod sits within Studio Firewall, with no placement tension — its function (protecting the studio relationship from a specific catastrophic risk category) is squarely governance/risk-containment in nature, the same category as Legal and Finance, even though its day-to-day work is highly technical. This mirrors Data Ops' placement rationale (POD-06): technical work in service of a governance-tier risk still belongs in Studio Firewall, not in a technical macro-node, because its accountability is to protecting the production's standing with the studio, not to producing creative or technical assets.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Access logs and infrastructure configuration | Infrastructure Pod (POD-12) | Structured log data | v1.0 | Required |
| Raw work-in-progress renders | Scene Pods (POD-15) and other Generative Core Pods | Video/image files | v1.0 | Required (for watermarking coverage) |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| TPN compliance audit reports | Network Gateway (POD-02) | Structured audit document | v1.0 | Y |
| Watermarked assets | Returned to originating Pod's pipeline | Video/image files (watermark embedded, invisible) | v1.0 | Y |
| Incident/leak forensic findings | Network Gateway (POD-02), Legal & Provenance (POD-01) | Structured forensic report | v1.0 | Y |
| Remediation requests (per non-compliant Pod) | The specific non-compliant Pod | Structured finding + required deadline | v1.0 | Y |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** a forensic watermark degrades or is inadvertently stripped during legitimate downstream processing (e.g., Polish Pod's inpainting, or a compression step during Assembly) — meaning that if a leak later occurs from that processed asset, this Pod's core guarantee (traceability) silently fails exactly when it's needed most, without anyone having done anything malicious.

**Weaker-signal risk (framework-general, applied here):** this Pod's compliance audits and anomaly detection are pattern-based and could, in principle, produce false negatives (a genuine violation that doesn't trip any monitored pattern) — the same shape of risk as Data Ops' regression-testing blind spots or Continuity/Canon's under-flagged contradictions, applied to security monitoring. **Mitigation used by this Pod:** watermark survivability testing against actual downstream pipelines (Section 2), not just raw output, and periodic (not one-time) re-auditing specifically to catch drift that a single point-in-time check would miss.

**Cost of an undetected error:** potentially existential at the Network Gateway/studio-relationship level — a serious, undetected security failure discovered by the studio rather than by this Pod is one of the few failure modes described anywhere in this framework capable of causing immediate contract termination, independent of creative quality. This places it in a similar cost category to Legal & Provenance's failure mode, which is part of why this Pod is Tier 2 (Foundational) rather than lower — its failure doesn't just degrade one episode, it can end the production's relationship with the studio outright.

**Escalation path:** a confirmed security incident is escalated immediately and directly to Network Gateway and Legal & Provenance simultaneously — this Pod does not wait for a scheduled reporting cycle when an active incident is discovered, reflecting the same "notify immediately, don't quietly absorb" value described in Section 3.2.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly forbidden from delaying disclosure of a confirmed security incident to Network Gateway and Legal & Provenance for any reason, including reputational concern about which Pod caused it — timely disclosure takes priority over internal political considerations.
- This Pod may not unilaterally decide a discovered non-compliance is minor enough to skip formal documentation — even a minor finding is logged (Section 3.2), since undocumented "minor" issues are exactly what allows drift to accumulate into a major one.
- This Pod does not have authority to halt production entirely on its own — it can flag a Pod as non-compliant and require remediation before that Pod continues normal registry/infrastructure access, but a full production halt is a Network Gateway or Showrunner-level decision informed by this Pod's findings, not this Pod's own unilateral call.
- Default resource allocation: watermarking and monitoring are treated as always-on infrastructure costs (coordinated with Infrastructure and Finance) rather than a discretionary budget line that could be reduced under cost pressure — given the cost-of-error profile in Section 6, this Pod's baseline functions are not candidates for cost-cutting.

---

## 8. Success Criteria

- Network Gateway knows this Pod succeeded when the studio's TPN compliance requirements are consistently met across every periodic audit, and — in the event a leak does occur — its source can be identified quickly and conclusively via watermarking.
- A remediation request returned to a non-compliant Pod includes the specific finding and a clear deadline; if that Pod reports the finding was unclear or the deadline unreasonable, that's treated as a defect in this Pod's own communication, not a downstream Pod problem.
- **Contract success:** audits were conducted on schedule, watermarking was applied to all in-scope renders, and reports were delivered in the correct format.
- **Intent success:** no unauthorized disclosure occurred, or if one did, it was traced back to its source quickly and conclusively.
- **Concrete divergence case for this Pod:** an audit could be contract-compliant (conducted on schedule, properly documented, technically thorough by its own checklist) while still failing intent if its detection patterns simply didn't cover the specific way a leak actually occurred — the process was followed correctly, but the underlying guarantee didn't hold. This is precisely the risk described in Section 6, and it's why ongoing pattern/coverage expansion, not just schedule adherence, has to be treated as core to this Pod's job.

---

## 9. Open Questions / Notes

- The specific tolerance for watermark survivability under downstream processing (Section 6) — how much compression, inpainting, or reformatting can occur before traceability is meaningfully degraded — is not yet quantified and would benefit from an explicit, tested standard rather than an assumed "should probably survive" expectation.
- This Pod's relationship with Data Ops (Section 4.3) around securing the model/environment registry is currently informal; given that registry represents some of the production's highest-value proprietary assets (trained character LoRAs), it may be worth formalizing this into an explicit joint responsibility rather than leaving it to informal coordination — a similar gap to the one identified and then resolved for Narrative/Continuity-Canon.
- This Pod's internal workflow is a reasonable expansion of source material that names its core functions clearly (TPN compliance, network segmentation, MFA, forensic watermarking) but does not describe internal process in the step-by-step detail the Audio Pod source material did — treat the specific workflow steps and headcount split here as a faithful but moderately inferred elaboration, not a verbatim transcription.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |

- **Deprecation policy:** audit reports and incident findings are never deleted, only appended to as a historical record — even a resolved, minor finding remains in the record permanently, since a pattern of repeated minor findings from the same Pod is itself a meaningful signal this Pod needs to be able to detect over time.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.
