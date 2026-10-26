# Pod Specification: POD-02 — Network Gateway Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Network Gateway Pod |
| **Alternate/Node Name** | The Studio Interface / Firewall Node |
| **Macro-Node / Tier** | Studio Firewall (criticality Tier 1 — Existential) |
| **Headcount (human)** | 2 — one Line Producer/Executive liaison (studio relationship, executive communication, milestone negotiation), one Production Operations Manager (internal ticket translation, budget/schedule dashboard maintenance) |
| **Pod Lead / Accountable Owner** | The Line Producer/Executive liaison. Holds sign-off authority on all studio-facing communication and commitments; the Production Operations Manager owns internal ticket translation and dashboard accuracy but does not have authority to make studio-facing commitments independently. |
| **Primary AI/Compute Tooling** | Milestone/dashboard tracking tooling aggregating status across all 23 Pods, communication and ticket-translation tooling for converting studio notes into internal, decoupled tasks |
| **One-Sentence Mission** | Act as the production's sole interface to the studio — absorbing corporate friction, translating executive notes into actionable internal tickets, and protecting every other Pod's creative and technical autonomy from direct studio interference. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** in traditional television, this role is the Line Producer and Executive Producer team — if the Showrunner personally spent twenty hours a week answering network executive emails, tracking cloud GPU burn rates, and negotiating delivery milestones, creative oversight of the actual series would suffer. Every other Pod in this framework is designed to operate autonomously behind a boundary that protects it from external interference — Scene Pods go dark, Foundation locks its own assets, Narrative works from intent rather than micromanagement. None of that autonomy is possible if the studio can reach directly into any Pod with a note, a request, or a demand. This Pod exists to be the single, absorbing membrane between the studio and every other Pod — translating macro corporate requests into technical resource allocations and decoupled tickets, so the studio's presence is felt as clear boundaries and milestones, never as direct interference in any Pod's autonomous execution.

**Single most important outcome this Pod is accountable for:** the studio relationship remains healthy and every contractual/delivery commitment is met, while every other Pod in the production remains fully shielded from direct studio contact or interference in its autonomous execution.

**Explicitly outside this Pod's purpose:**
- This Pod does not make creative decisions — it translates studio notes into tickets for the relevant Pod (typically Narrative or Polish, per the source material's own framing), it does not resolve the creative substance of a note itself.
- This Pod does not perform legal clearance — that's Legal & Provenance's job; Network Gateway may relay a studio legal concern, but the actual clearance determination remains Legal's authority.
- This Pod does not track or approve the production's internal budget line-by-line — that's Finance's job; Network Gateway negotiates macro budget and milestone terms with the studio, Finance manages the internal allocation and burn-rate tracking against those terms.
- This Pod does not directly manage any individual Pod's day-to-day work — its entire design purpose is to prevent exactly that kind of direct interference (Section 1).

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive studio communications: executive notes, budget inquiries, marketing requests, delivery-schedule questions, and any other network-originated contact (see Section 5.1).
2. Line Producer/Executive liaison assesses each communication: is this a macro-level concern requiring negotiation or response at this Pod's own level, or does it need translation into a specific, decoupled internal ticket for another Pod.
3. Where a studio note touches creative substance (e.g., a network executive's feedback on a script or a scene), the Production Operations Manager translates it into an actionable ticket for the relevant Pod (typically Narrative or Polish per established practice) — stripped of any implication that the studio is directing that Pod's work, framed instead as input the Pod's own Lead can weigh against the Showrunner's intent.
4. Maintain the aggregated milestone/budget dashboard, pulling status from every Pod's own reporting (compliance audits from Security & InfoSec, burn-rate data from Finance, delivery confirmations from Metadata & Ingestion) into a single studio-facing view.
5. Negotiate and confirm macro-level terms directly with the studio: delivery dates, budget adjustments, marketing milestones — these become the fixed external anchor points other Pods (notably Campaign Strategy) build their own internal plans around.
6. Where a studio request would require compromising a Pod's established autonomy (e.g., a network executive wanting to directly review a Scene Pod's in-progress work), this Pod declines on the production's behalf and offers the appropriate alternative — typically pointing to the relevant milestone or back-brief review point instead.
7. Escalate to the Showrunner directly when a studio matter touches genuine creative direction rather than a translatable operational note.
8. Publish periodic milestone/status reports to the studio, and maintain the internal record of every studio commitment made.

**Human roles inside the Pod and division of labor:**
- **Line Producer/Executive liaison** — the relationship/negotiation vector. Owns the actual studio relationship, executive communication, and any binding commitments made on the production's behalf.
- **Production Operations Manager** — the translation/tracking vector. Owns converting studio input into internal tickets and maintaining the aggregated dashboard.
- **Why split rather than combined:** studio relationship management (reading executive priorities, negotiating sensitively) and internal operational tracking (aggregating dozens of Pods' status into one coherent view) are different disciplines operating at different altitudes — a liaison focused on the relationship risks losing track of granular internal status, and an operations-focused role isn't necessarily equipped to navigate a sensitive executive negotiation.

**Tooling specifics:** dashboard tooling aggregates status pulled from other Pods' own outputs (this Pod does not independently verify a Pod's status, it trusts and displays what each Pod reports, consistent with the black-box autonomy principle applied throughout this framework); ticket-translation tooling converts studio prose into structured internal requests.

**Known failure modes of this Pod's own process, and internal catches:**
- *A studio note translated into an internal ticket loses the executive's actual underlying concern in translation*, causing the receiving Pod to address the wrong thing — mitigated by the Production Operations Manager's translation being reviewed by the Line Producer before being sent, ensuring the ticket still reflects genuine studio intent even after being decoupled from direct studio contact.
- *A studio request that seems routine actually implies a boundary violation of some Pod's autonomy* — mitigated by step 6's explicit framing of this as a standing category this Pod actively watches for, not just an edge case handled if it happens to arise.
- *The aggregated dashboard reporting Pod status that's stale or inaccurate relative to what that Pod would actually report if asked directly* — mitigated by pulling status from each Pod's own formal outputs (audit reports, milestone confirmations) rather than informal or secondhand updates, the same discipline that governs every other cross-Pod data relationship in this framework.

**Idle/blocked behavior:** This Pod is rarely blocked by any other Pod's pace, since its core function (studio interface, dashboard maintenance) runs continuously regardless of where any individual Pod is in its own cycle. It does block on making a specific studio commitment (a delivery date, a budget change) until it has genuine visibility into whether the production can actually support that commitment — this Pod does not commit the production to a date or budget figure without checking with the relevant internal Pods first (Finance for budget, the affected creative/technical Pods for schedule feasibility).

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives is close to the Network's own macro intent as originally framed in this whole hierarchy's "nested intent" structure: *"Deliver a series meeting the studio's business and platform requirements — this budget, this timeline, these broadcast standards — while giving the creative and technical teams the room they need to actually make something good."* This Pod's own translation of that intent downward is what every other Pod experiences as "boundary conditions" rather than direct studio contact — this Pod is, in a real sense, the mechanism by which the Network's macro intent becomes every other Pod's actual operating environment.

### 3.2 Values as Boundary Conditions
- **Absorb friction over passing it through unfiltered:** a studio note, however bluntly phrased, is translated into a clear, actionable, appropriately-scoped internal ticket before it reaches any other Pod — this Pod does not simply forward studio pressure downward unmodified, since doing so would defeat its entire purpose as a firewall.
- **Protect Pod autonomy over studio convenience:** where a studio request would require breaching a Pod's established black-box boundary, this Pod declines and redirects to the appropriate formal review point (a milestone, a back-brief) rather than accommodating the request at the cost of another Pod's autonomy.
- **Accurate reporting over flattering reporting:** the studio-facing dashboard and milestone reports reflect actual production status, including genuine delays or risks, rather than an optimistic gloss — an inaccurate report that avoids uncomfortable short-term conversations creates a much larger trust cost when reality eventually surfaces.

### 3.3 Back-Brief
**Internal back-brief:** before finalizing a significant studio commitment (a new delivery date, a budget change), the Line Producer checks with the relevant internal Pods (Finance, and whichever creative/technical Pods are affected) to confirm the commitment is actually achievable — a cheap internal check before the more "expensive" step of a binding external commitment to the studio, the same pattern used by Campaign Strategy checking Marketing Creative's actual production timeline before committing to a public release date (POD-21, Section 3.3).

**Weaker-signal risk mitigation:** this Pod's core function is relationship management and negotiation rather than AI-generated creative or technical content, so the framework's general AI-artifact-only back-brief risk doesn't directly apply. The more relevant risk is translation fidelity — whether a studio note's actual intent survives being converted into an internal ticket — mitigated by the Line Producer's review of every translated ticket before it's sent (Section 2, known failure modes).

### 3.4 Global Read / Local Write
**Private working state:** in-progress studio negotiations and unconfirmed commitments are visible only within this Pod until finalized — no other Pod should treat a studio matter as settled before this Pod has actually confirmed it.

**Finalized write:** once a studio commitment is confirmed, this Pod writes it once to the shared registry as a milestone or constraint other Pods build against (e.g., Campaign Strategy's confirmed premiere date, per POD-21 Section 5.1).

**Read access:** every Pod may read confirmed studio commitments and milestones relevant to their own work; the detailed studio relationship itself (negotiation history, executive communication) is not broadly exposed, only its concrete, finalized outputs.

**No downstream mutation:** confirmed — no Pod may alter a confirmed studio commitment; if circumstances require a change (e.g., a genuine production delay), that's renegotiated by this Pod with the studio directly, not adjusted unilaterally downstream.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** aggregated status reports from every Pod that reports upward to this dashboard — compliance audits (Security & InfoSec), burn-rate data (Finance), delivery confirmations (Metadata & Ingestion), and any Pod's own escalations requiring studio-facing visibility.

**Formal output contract:** confirmed studio milestones and constraints (premiere dates, budget ceilings, marketing requirements) that other Pods treat as fixed external anchor points; translated internal tickets for Pods affected by studio notes.

**Contract change process:** if the studio changes a previously-confirmed commitment (a delivery date shifts, a budget is revised), this Pod publishes the change as a new version of the affected milestone and notifies every Pod whose own plans were built against the prior version — mirroring the same "flag affected downstream work for review, don't assume continued validity" discipline used throughout this framework.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** receipt of any studio communication; scheduled periodic milestone reporting (time-based, not purely reactive).

**Trigger this Pod's output causes downstream:** confirming a new or changed studio milestone fires an automated notification (via Infrastructure) to every Pod whose work is anchored to that milestone — most directly Campaign Strategy, but potentially any Pod depending on a delivery date or budget ceiling.

### 3.7 Black-Box Autonomy
While negotiating with the studio, this Pod is not required to expose the details of an in-progress negotiation to other Pods — only the finalized outcome (a confirmed milestone or a declined request) is visible externally. This mirrors the same autonomy every other Pod is granted over its own process, applied here to studio relationship management specifically.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-03 Production Finance & Accounting | Internal burn-rate and budget-feasibility data, for confirming studio-facing budget commitments | v1.0 | This Pod cannot responsibly confirm a budget-related studio commitment without this data — risks committing to terms the production can't actually support |
| POD-09 Security & InfoSec | TPN compliance audit summaries, for studio-facing compliance reporting | v1.0 | This Pod cannot represent the production as compliant to the studio without this Pod's ongoing certification (mirrored from POD-09's own Section 4.2) |
| POD-19 Metadata & Ingestion | Delivery/ingestion confirmation records | v1.0 | This Pod cannot accurately report delivery status to the studio without this Pod's confirmation (mirrored from POD-19's own Section 4.2) |
| Every other Pod (indirect) | Escalations requiring studio-facing visibility (e.g., Legal's asset-exposure findings, per POD-01 Section 6) | v1.0 | Without visibility into a serious internal risk, this Pod risks being caught unprepared by a studio-facing consequence of a problem it didn't know existed |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-21 Campaign Strategy | Confirmed premiere date, studio-mandated marketing milestones | v1.0 | Cannot finalize a release calendar without these confirmed anchor points (mirrored from POD-21's own Section 4.1) |
| POD-19 Metadata & Ingestion | Current, confirmed studio MMC schema and intake requirements | v1.0 | Risks the stale-reference failure described in its own Section 6 if this Pod doesn't proactively relay studio requirement changes |
| POD-18 Mastering & QC | Studio-driven broadcast spec changes | v1.0 | Same shape of dependency as Metadata — cannot stay current on studio technical requirements without this Pod relaying changes |
| **All 23 Pods (indirect)** | Protection from direct studio interference; translated, appropriately-scoped tickets rather than raw studio pressure | v1.0 | Every Pod's ability to operate with genuine autonomy depends on this Pod actually absorbing and translating studio contact rather than passing it through unfiltered |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates continuously with Legal & Provenance (POD-01) as a standing relationship rather than a per-incident dependency — Legal's Section 3.3 explicitly describes keeping this Pod informed of significant clearance decisions as part of standing risk visibility, even though Legal's determinations don't require this Pod's approval; this ensures Network Gateway is never surprised by a legal exposure it didn't know existed, mirroring the same relationship already described from Legal's own side.

### 4.4 Position in the Macro-Node Structure
This Pod sits within Studio Firewall — indeed, it is the Pod the entire macro-node is conceptually named after, serving as the literal firewall between the studio and every other Pod. There is no placement tension of any kind; if any Pod in this framework unambiguously belongs to Studio Firewall by definition, it is this one.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Studio communications (executive notes, requests, inquiries) | External (the studio, not a production Pod) | Various (email, meetings, formal notes) | n/a | N/A — external input, not a formal inter-Pod contract |
| Burn-rate and budget-feasibility data | Production Finance & Accounting (POD-03) | Structured budget/status document | v1.0 | Required |
| TPN compliance audit summaries | Security & InfoSec (POD-09) | Structured audit document | v1.0 | Required |
| Delivery/ingestion confirmation records | Metadata & Ingestion (POD-19) | Structured confirmation document | v1.0 | Required |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Confirmed studio milestones and constraints | Campaign Strategy, Metadata & Ingestion, Mastering & QC, and any Pod anchored to a studio commitment | Structured milestone document | v1.0 | Y (versioned — see Section 3.5) |
| Translated internal tickets | The relevant affected Pod (typically Narrative or Polish, per established practice) | Structured ticket | v1.0 | Y |
| Studio-facing milestone/status reports | External (the studio) | Formal report | n/a | Y (internal record retained) |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** a studio note is translated into an internal ticket that technically addresses the literal request but loses the executive's actual underlying concern — the receiving Pod resolves the ticket as written, the studio's real concern remains unaddressed, and the gap isn't discovered until the studio raises the same concern again, now with the added frustration of having already "asked" once. This is uniquely costly for this Pod because it's a translation-fidelity failure that's invisible to everyone except the studio itself until it resurfaces.

**Weaker-signal risk (framework-general, applied here):** this Pod's core function is human negotiation and translation rather than AI-generated content, so the standard AI-artifact-only back-brief risk is largely inapplicable. The closer analog is a translation-fidelity risk — a ticket that reads as complete and actionable to the receiving Pod while having quietly dropped the nuance of the original studio concern, similar in shape to Localization's tonal-translation risk (POD-17, Section 6) but applied to executive communication rather than dialogue.

**Cost of an undetected error:** high and directly relationship-threatening, placing this Pod's risk profile alongside Legal's and Security's — this Pod's entire purpose is maintaining a healthy studio relationship, and a pattern of mistranslated or dropped studio concerns erodes exactly the trust that lets the studio continue granting the production genuine creative autonomy rather than reverting to direct, invasive oversight. Unlike Legal's binary "shelved or not" risk, this Pod's failure mode is more gradual — an accumulating trust deficit rather than a single catastrophic event — but the long-run cost (the studio deciding this production can't be trusted with autonomy) threatens the entire Mission Command structure this whole framework depends on.

**Escalation path:** if a translated ticket's resolution doesn't actually satisfy a recurring studio concern, this Pod escalates internally to the Showrunner to ensure the *creative* substance of the concern is actually being addressed, not just its literal wording — since a studio's frustration in these cases is often about a real creative or quality issue that ticket translation alone can't resolve.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly forbidden from allowing direct studio contact with any other Pod's day-to-day execution — this is this Pod's foundational reason for existing (Section 1), not a preference that could reasonably be relaxed for a seemingly low-stakes request.
- This Pod may not commit the production to a delivery date or budget figure without first confirming feasibility with the relevant internal Pods (Section 3.3) — no studio commitment is made on assumption or optimism alone.
- This Pod does not have authority to resolve a studio note that touches genuine creative direction on its own — that's escalated to the Showrunner (Section 2, step 7), since this Pod's authority is operational and relational, not creative.
- Default resource allocation: this Pod's own operating costs are minimal and non-compute, similar to Legal and Press & Communications — its constraint is relationship-management and coordination capacity, not GPU allocation.

---

## 8. Success Criteria

- Every other Pod knows this Pod succeeded when studio contact reaches them only as clear, appropriately-scoped, decoupled tickets — never as raw, unfiltered pressure or direct interference in their autonomous execution.
- The studio knows this Pod succeeded when milestone reporting is consistently accurate, commitments are reliably met, and concerns raised are genuinely addressed rather than superficially closed out.
- **Contract success:** studio communications are translated and routed appropriately, milestones are confirmed only after internal feasibility checks, and status reporting is delivered on schedule.
- **Intent success:** the studio relationship remains healthy and trusting enough that the studio continues extending the production genuine creative and operational autonomy, rather than reverting to direct oversight.
- **Concrete divergence case for this Pod:** a ticket-translation could be contract-compliant (technically actionable, delivered to the right Pod, resolved as written) while still failing intent if it didn't actually capture what the studio executive was genuinely concerned about — exactly the risk in Section 6, and why this Pod's own escalation path (Section 6) treats a recurring studio concern as a signal to dig into creative substance with the Showrunner, not just re-translate the same note more carefully.

---

## 9. Open Questions / Notes

- Per the cross-Pod escalation standard (`cross_pod_escalation_threshold_standard.md`), this Pod's default iteration threshold isn't separately defined here — if the same studio concern resurfaces repeatedly despite being "resolved" via ticket translation, the standard's default three-cycle rule is a reasonable fit (three recurrences of the same underlying concern triggers the Showrunner escalation in Section 6), though this is a softer application than the standard's original technical/creative-Pod use cases, given how much judgment is involved in recognizing "the same concern" across differently-worded studio communications.
- This Pod is referenced as a dependency or escalation target by a substantial number of other specs already written (Legal, Security, Metadata, Mastering & QC, Campaign Strategy, and others) — this spec was deliberately built to be consistent with all of those existing references rather than introducing a new, conflicting description of this Pod's function; if any future Pod spec references Network Gateway in a way that conflicts with what's written here, that inconsistency should be resolved in favor of whichever description is more specific and load-bearing, not simply by editing this spec to match.
- This Pod's internal workflow draws on solid source material describing its core function directly (the Line Producer/Executive Producer analogy, absorbing studio friction, translating notes into decoupled tickets, protecting creative space) — comparable in grounding to Foundation, Audio, and Legal & Provenance, though the specific headcount split and the translation-fidelity risk framing in Section 6 are original elaborations built to fit this Pod's particular position as the single most-referenced Pod in the entire framework.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec — written to be consistent with the substantial number of prior Pod specs already referencing this Pod's function | N (no changes to other Pods' existing contracts — this spec formalizes relationships already described from the other side in POD-01, POD-03, POD-09, POD-17, POD-18, POD-19, and POD-21) |

- **Deprecation policy:** confirmed studio milestones are never deleted, only superseded by a new version if renegotiated — prior versions remain available since affected Pods (particularly Campaign Strategy) may need to trace back to exactly what was originally committed versus what changed and when.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.