# Pod Specification: POD-21 — Campaign Strategy Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Campaign Strategy Pod |
| **Alternate/Node Name** | The Timing & Channel Node |
| **Macro-Node / Tier** | Studio Firewall (criticality Tier 5 — Amplification) |
| **Headcount (human)** | 1–2 — one Campaign Strategist (timing, channel mix, budget allocation across the marketing calendar); a second Coordinator role is optional depending on how many concurrent territories/channels a given season's campaign spans |
| **Pod Lead / Accountable Owner** | The Campaign Strategist. Holds sign-off authority on the marketing calendar and channel allocation; where a second Coordinator role exists, they execute scheduling logistics but do not set strategic priority independently. |
| **Primary AI/Compute Tooling** | Campaign scheduling and calendar tooling, audience/channel analytics (informing which platforms and timing windows are likely to reach the target demographic), budget-allocation tracking synced with Finance |
| **One-Sentence Mission** | Decide when and where marketing assets reach audiences — sequencing Marketing Creative's trailers and key art and Press & Communications' EPK materials into a coherent release calendar that builds toward the premiere rather than each surfacing on its own schedule. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** Marketing Creative produces trailers and key art; Press & Communications produces EPKs and handles publicity relationships — but neither is well-positioned to decide *when* a given asset should be released, on *which* platform, or how a season's worth of marketing beats should build toward a premiere date rather than landing as a series of disconnected drops. If timing and channel decisions were left to whichever Pod happened to finish an asset first, the campaign would have no overall shape — a strong trailer could drop with no lead-up, or two major beats could collide on the same week while a dead zone precedes the premiere. This Pod exists specifically to hold the *sequencing* view across Marketing Creative's and Press & Communications' otherwise independent outputs, the same structural logic that justifies Assembly holding the sequencing view across otherwise-isolated Scene Pods, just applied to the marketing function rather than the creative one.

**Single most important outcome this Pod is accountable for:** a coherent, well-paced release calendar — deciding when each marketing asset goes out and on which channel — that builds audience awareness toward the premiere rather than treating each asset's release as an independent, uncoordinated event.

**Explicitly outside this Pod's purpose:**
- This Pod does not create any marketing asset itself — trailers, key art, and social content come from Marketing Creative; press materials and publicity relationships come from Press & Communications. This Pod only decides the schedule and channel placement for material those Pods produce.
- This Pod does not negotiate with the studio on marketing budget or strategy at the executive level — that's Network Gateway's job; this Pod operates within whatever marketing budget and macro-timing constraints Network Gateway has already established with the studio.
- This Pod does not manage individual press relationships or interviews — that's Press & Communications' job; this Pod decides *when* a press cycle should happen relative to other campaign beats, not who's contacted or what's said.
- This Pod does not make creative decisions about what a trailer or key art piece should contain — that remains Marketing Creative's creative judgment; this Pod's discretion is over sequencing and placement, not content.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive the confirmed premiere date and any studio-mandated marketing milestones from Network Gateway (see Section 5.1) — these are fixed external anchor points the campaign calendar is built around, not something this Pod sets independently.
2. Receive visibility into Marketing Creative's asset production timeline (which trailers, key art, or social content will be ready and roughly when) and Press & Communications' available press cycle windows.
3. Campaign Strategist builds the release calendar: sequencing teaser-tier content earlier, escalating to full trailers and major press beats as the premiere approaches, and identifying which channel (social, press, paid placement) each asset is best suited for.
4. Cross-check the calendar against Finance's marketing budget allocation, ensuring the sequencing plan doesn't front-load or back-load spend in a way that leaves the campaign under-resourced at a critical moment (e.g., premiere week).
5. Share the calendar with Marketing Creative and Press & Communications so both Pods can plan their own production timelines against confirmed release windows, rather than producing assets with no defined release point.
6. Monitor actual campaign performance as assets go live (where analytics are available) and adjust remaining calendar sequencing if early data suggests a channel or timing assumption isn't working — this Pod retains ongoing calendar authority through the campaign, not just a one-time upfront plan.
7. Coordinate directly with Network Gateway if a significant calendar change is needed that could affect studio-facing commitments (e.g., a press embargo date).

**Human roles inside the Pod and division of labor:**
- **Campaign Strategist** — the sequencing/strategy vector. Owns the overall calendar shape, channel allocation judgment, and budget-pacing decisions.
- **Coordinator (optional, scale-dependent)** — the logistics vector, where a season's campaign spans enough concurrent territories or channels that scheduling execution itself becomes a meaningful workload separate from strategic planning.
- **Why a coordinator role is optional rather than fixed:** unlike most Pods in this framework, this Pod's workload scales directly with campaign complexity (number of territories, channels, and assets) rather than being roughly constant regardless of season — a smaller, single-market release may not justify a dedicated second role, while a large multi-territory rollout likely would.

**Tooling specifics:** campaign scheduling tools maintain the calendar itself; audience/channel analytics inform which platforms are likely to reach the target demographic at a given campaign stage; budget-tracking tooling stays synced with Finance's allocation to avoid the calendar drifting out of sync with actual available spend.

**Known failure modes of this Pod's own process, and internal catches:**
- *A calendar built without real visibility into Marketing Creative's actual production timeline*, leading to release dates the assets aren't actually ready for — mitigated by step 2's explicit requirement for direct visibility into Marketing Creative's production status, not an assumed or estimated timeline.
- *A rigid calendar that doesn't adapt to early campaign performance data* — mitigated by step 6 treating calendar authority as ongoing through the campaign, not a one-time upfront plan that's simply executed without adjustment.
- *Calendar changes made without checking studio-facing implications* — mitigated by step 7's requirement to coordinate with Network Gateway before a significant change, since a shifted embargo or press date can have real consequences for the studio relationship this Pod itself has no direct visibility into.

**Idle/blocked behavior:** This Pod fully blocks on building a confirmed calendar until Network Gateway supplies the actual premiere date and any studio-mandated milestones — sequencing a campaign around a placeholder date risks the whole calendar needing rebuilding once the real date is confirmed. However, this Pod may begin general strategic planning (channel research, audience/timing pattern analysis) independent of the confirmed date, since that groundwork isn't invalidated by the date itself shifting.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives, translated from the Network's and Showrunner's shared interest in audience reach, is roughly: *"Build awareness and anticipation that peaks at premiere, using the assets Marketing Creative and Press & Communications produce, without either overwhelming the audience with too much too early or leaving a dead period right before launch."* Note this specifies the *desired shape* of audience attention over time, not which specific channels to use or how many assets to schedule per week — this Pod is free to determine its own sequencing approach as long as that shape is achieved.

### 3.2 Values as Boundary Conditions
- **Escalating anticipation over front-loaded spectacle:** the campaign's strongest assets (a full trailer, a major press beat) are sequenced to land closer to premiere rather than spent early, even if an individual asset is ready sooner — pacing outranks releasing something the moment it's finished.
- **Real production timelines over aspirational scheduling:** the calendar is built against Marketing Creative's and Press & Communications' actual, confirmed readiness, not an idealized schedule those Pods are then pressured to hit — this Pod does not set dates that create artificial production pressure on Pods it doesn't have authority to direct in the first place (Section 1).
- **Adapt within the studio-agreed envelope, escalate beyond it:** this Pod can freely adjust channel mix and internal sequencing in response to performance data, but any change touching a studio-facing commitment (an embargo, a announced date) requires Network Gateway coordination first (Section 2, step 7) — operational flexibility within a fixed outer boundary, not unlimited discretion.

### 3.3 Back-Brief
**Internal back-brief:** before finalizing the full campaign calendar, the Campaign Strategist shares a draft sequencing plan with Marketing Creative and Press & Communications specifically to confirm their production timelines actually support the proposed dates — a cheap check against reality before the calendar is treated as fixed, rather than discovering a mismatch only once a release date is publicly committed.

**Weaker-signal risk mitigation:** this Pod's work is largely outside the AI-artifact-only back-brief risk described for creative/generative Pods elsewhere in this framework, since its core function is scheduling and sequencing judgment rather than AI-generated creative content. The more relevant risk is a planning-assumption risk — building a calendar around an assumed channel/timing pattern that turns out not to match actual audience behavior — mitigated by step 6's ongoing monitoring and adjustment authority rather than treating the initial calendar as unchangeable.

### 3.4 Global Read / Local Write
**Private working state:** in-progress calendar drafts and unconfirmed scheduling options are visible only within the Pod while planning is underway.

**Finalized write:** once confirmed (via the back-brief check with Marketing Creative and Press & Communications), this Pod publishes the release calendar once to the shared registry, with a version tag — though unlike most Pods' outputs, this "immutable" publication is expected to receive tracked *updates* through the campaign (Section 2, step 6), not a single one-time lock.

**Read access:** Marketing Creative and Press & Communications read the calendar to plan their own production and press-cycle timing against confirmed windows; Network Gateway reads it for studio-facing reporting.

**No downstream mutation:** confirmed — Marketing Creative and Press & Communications may not unilaterally alter release dates or channel assignments; if either Pod's production timeline changes in a way that affects the calendar, that's raised to this Pod as a formal input for recalculation, not self-adjusted downstream.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** confirmed premiere date and studio-mandated marketing milestones (Network Gateway), Marketing Creative's asset production timeline, Press & Communications' available press-cycle windows, and Finance's marketing budget allocation.

**Formal output contract:** a versioned release calendar specifying what asset goes out when and on which channel, shared with Marketing Creative, Press & Communications, and Network Gateway.

**Contract change process:** because this Pod's output is expected to update through the campaign (unlike most Pods' one-time locked publications), each calendar revision is published as a new version with a clear changelog of what shifted and why, rather than treated as an anomaly requiring special justification — ongoing revision is this Pod's normal operating mode, not an exception to a otherwise-static contract.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** receipt of a confirmed premiere date from Network Gateway.

**Trigger this Pod's output causes downstream:** publishing or updating the release calendar fires an automated notification (via Infrastructure) to Marketing Creative and Press & Communications that scheduling has been set or changed.

### 3.7 Black-Box Autonomy
While building and adjusting the calendar, this Pod is not required to expose its specific channel-selection reasoning or internal budget-pacing calculations to Marketing Creative or Press & Communications — those Pods receive the calendar itself (what and when), not the strategic reasoning behind every sequencing choice.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-02 Network Gateway | Confirmed premiere date, studio-mandated marketing milestones | v1.0 | Full block on finalizing any confirmed calendar (see Section 2, idle/blocked behavior); general strategic planning may proceed independently |
| POD-22 Marketing Creative | Asset production timeline (what will be ready, roughly when) | v1.0 | Calendar-building risks being built on assumed rather than confirmed readiness — a quality risk to the calendar's accuracy, not a hard block |
| POD-23 Press & Communications | Available press-cycle windows | v1.0 | Same shape of quality risk as above — calendar accuracy suffers without this input, though planning can proceed with placeholder assumptions pending confirmation |
| POD-03 Production Finance & Accounting | Marketing budget allocation | v1.0 | Full block on finalizing spend-pacing decisions within the calendar — this Pod cannot responsibly sequence spend without a defined budget ceiling |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-22 Marketing Creative | The release calendar | v1.0 | Must plan asset production against confirmed release windows this Pod sets, rather than releasing finished assets on their own independent schedule |
| POD-23 Press & Communications | The release calendar | v1.0 | Must plan press-cycle timing (interviews, embargo lifts) against this Pod's sequencing, rather than scheduling press activity independently |
| POD-02 Network Gateway | Calendar status, for studio-facing marketing milestone reporting | v1.0 | Relies on this Pod's calendar accuracy to represent campaign progress to the studio truthfully |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates continuously with both Marketing Creative and Press & Communications in a genuinely two-way relationship once the campaign is underway (Section 2, step 6) — not a strict one-directional dependency, since this Pod adjusts its calendar based on those Pods' actual production reality, and they in turn plan against this Pod's sequencing; both sides inform each other on an ongoing basis rather than one simply issuing instructions to the other.

### 4.4 Position in the Macro-Node Structure
This Pod sits within Studio Firewall, consistent with its role as a coordination/scheduling function rather than a content-producing one — matching the placement rationale already used for Press & Communications (its sibling split from the original bundled Marketing pod), in contrast to Marketing Creative, which was placed in Generative Core because it actually produces generative content using the same tooling as Scene Pods and Polish.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Confirmed premiere date, studio-mandated milestones | Network Gateway (POD-02) | Structured milestone document | v1.0 | Required |
| Asset production timeline | Marketing Creative (POD-22) | Structured schedule/status data | v1.0 | Required (soft — see 4.1) |
| Available press-cycle windows | Press & Communications (POD-23) | Structured schedule data | v1.0 | Required (soft — see 4.1) |
| Marketing budget allocation | Production Finance & Accounting (POD-03) | Structured budget document | v1.0 | Required |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Release calendar (versioned, updated through campaign) | Marketing Creative, Press & Communications, Network Gateway | Structured scheduling document | v1.0 | Y (per version — see Section 3.5 on ongoing revision) |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** a calendar is built and published based on assumed or optimistic production timelines from Marketing Creative and Press & Communications rather than confirmed ones, and a scheduled release date arrives before the underlying asset is actually ready — forcing either a public schedule slip (visible to the audience, unlike an internal production delay) or a rushed, lower-quality asset release to hit a date that was never realistically confirmed.

**Weaker-signal risk (framework-general, applied here):** this Pod is largely outside the AI-artifact-only back-brief risk described for generative Pods, since its work is scheduling judgment rather than AI-generated content — but it has an analogous "looks right in the plan, fails in reality" risk: a calendar that appears well-sequenced on paper can still be built on unconfirmed assumptions about channel performance or asset readiness. **Mitigation used by this Pod:** the explicit back-brief check against Marketing Creative's and Press & Communications' *actual* confirmed timelines (Section 3.3) before finalizing any date, and ongoing monitoring/adjustment authority (Section 2, step 6) rather than treating the initial plan as fixed once published.

**Cost of an undetected error:** low in direct production terms (this Pod's own error doesn't halt any content-producing Pod's work) but potentially disproportionately visible — unlike most internal production delays, a publicly announced and then missed or shifted marketing date is visible to the audience and press, making this one of the few failure modes in the Tier 5 category with a real reputational cost despite the underlying production itself being entirely unaffected.

**Escalation path:** if Marketing Creative or Press & Communications reports their production timeline genuinely cannot support a scheduled date, this Pod first attempts internal recalculation (adjusting channel mix or sequencing within its own authority); if the change would affect a studio-facing commitment, it escalates to Network Gateway per Section 3.2's boundary before making any public-facing change.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly forbidden from committing to a public-facing release date without first confirming that date against Marketing Creative's and Press & Communications' actual, not assumed, production readiness (Section 3.2, Section 6).
- This Pod may not unilaterally shift a studio-mandated milestone (an agreed premiere date, a contractual marketing deliverable) without coordinating through Network Gateway first — it has full discretion over internal sequencing within the studio-agreed envelope, none over the envelope's outer boundaries.
- This Pod does not have authority to direct Marketing Creative's or Press & Communications' creative content decisions — its authority is limited to timing and channel placement of whatever those Pods produce.
- Default resource allocation: this Pod's own operating costs are minimal (planning and coordination, not content production or compute-heavy work); its function is to allocate the *marketing* budget's timing and pacing, not to hold a separate budget line of its own beyond routine planning tool costs.

---

## 8. Success Criteria

- Network Gateway knows this Pod succeeded when the studio-facing marketing calendar is met reliably, with no surprise public-facing date slips traceable to unconfirmed internal assumptions.
- Marketing Creative and Press & Communications know this Pod succeeded when the release windows they're given are realistic and achievable against their actual production capacity, not artificially compressed.
- **Contract success:** the calendar was built against confirmed inputs (premiere date, budget, production timelines) and published/updated on schedule as circumstances required.
- **Intent success:** audience awareness and anticipation genuinely built toward the premiere in the intended escalating shape, not front-loaded, back-loaded, or uneven.
- **Concrete divergence case for this Pod:** a calendar could be contract-compliant (built against the inputs available at the time, published correctly) while still failing intent if those inputs themselves were optimistic rather than realistic — exactly the risk in Section 6, and why the back-brief check against *actual* confirmed production timelines (not just any timeline those Pods happened to report) is treated as a required step rather than a formality.

---

## 9. Open Questions / Notes

- Per the cross-Pod escalation standard (`cross_pod_escalation_threshold_standard.md`), this Pod's default iteration threshold isn't separately defined here — if the same release window is missed or needs rescheduling repeatedly for the same underlying production-readiness reason, the standard's default three-cycle rule applies, triggering escalation to Network Gateway rather than continued informal rescheduling.
- The optional second Coordinator headcount (Section 0, Section 2) is explicitly scale-dependent rather than fixed — unlike most Pods in this framework, this spec doesn't commit to a firm headcount, which is a deliberate acknowledgment that this Pod's workload varies more by season/campaign scope than almost any other Pod's does; this may be worth revisiting once actual campaign complexity data exists.
- **This is one of the least source-grounded specs in the set.** Unlike Marketing Creative and Press & Communications, which map fairly directly onto functions named in the original bundled "Marketing & Promotional Pod" description, Campaign Strategy as a wholly distinct function was proposed during this framework's own earlier discussion (the decision to split Marketing three ways) rather than drawn from source material describing this exact role — its internal workflow, headcount flexibility, and back-brief structure here are a more original design than most other specs in this set, comparable in that respect to Continuity/Canon (POD-11) rather than to the more source-grounded Pods like Foundation, Audio, or Scene Pods.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |

- **Deprecation policy:** prior calendar versions are retained, not deleted, when the calendar is updated (Section 3.5) — since this Pod's output is expected to evolve through the campaign, understanding what was originally planned versus what actually shipped is itself a useful record, not just a formality.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.