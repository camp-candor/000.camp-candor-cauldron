# Pod Specification: POD-23 — Press & Communications Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Press & Communications Pod |
| **Alternate/Node Name** | The EPK & Publicity Node |
| **Macro-Node / Tier** | Studio Firewall (criticality Tier 5 — Amplification) |
| **Headcount (human)** | 2 — one Publicist/Press Lead (press relationships, interview coordination, messaging), one Writer (EPK content, press releases, written materials) |
| **Pod Lead / Accountable Owner** | The Publicist/Press Lead. Holds sign-off authority on press messaging and relationship management; the Writer owns drafting EPK and press materials but does not have authority to approve final messaging independently. |
| **Primary AI/Compute Tooling** | Press-release and EPK drafting tools (LLM-assisted, human-reviewed), media contact/relationship tracking, interview scheduling coordination — this Pod is not compute- or generative-media-heavy in the way most other Pods are |
| **One-Sentence Mission** | Produce the electronic press kit and written publicity materials, and manage press relationships and interview coordination — the human-facing, written communication layer of the campaign, distinct from the visual/video marketing assets Marketing Creative produces. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** press and publicity work — writing press releases, assembling an EPK, managing journalist relationships, coordinating interviews — is fundamentally a written-communication and relationship-management function, categorically different from Marketing Creative's generative video/image production or Campaign Strategy's scheduling logic. If this were folded into Marketing Creative, that Pod would need to add press-relationship management and PR writing to its generative-production skill set, the same kind of cognitive-overload argument that justifies every other role split in this framework (Score from Audio, Talent & Casting from Audio's own voice work, Legal from Data Ops). This Pod exists to hold that distinct written/relational vector on its own.

**Single most important outcome this Pod is accountable for:** producing accurate, on-message written press materials and an effective EPK, and managing press relationships and interview logistics in a way that represents the show accurately and serves Campaign Strategy's overall calendar.

**Explicitly outside this Pod's purpose:**
- This Pod does not produce trailers, key art, or any generative visual/video content — that's Marketing Creative's job; this Pod may *use* Marketing Creative's finished key art within an EPK or press kit, but does not create visual assets itself.
- This Pod does not decide the overall release timing or channel strategy — that's Campaign Strategy's job; this Pod plans its own press-cycle activity (interviews, releases) within windows Campaign Strategy has allocated, it does not set the macro calendar.
- This Pod does not negotiate the studio relationship at the executive level — that's Network Gateway's job; this Pod manages press/journalist relationships specifically, a different audience than the studio itself.
- This Pod does not have discretion to reveal plot content beyond what's cleared — the same content-clearance boundary that governs Marketing Creative (POD-22, Section 7) applies equally here, since a press release or interview answer can leak spoilers just as easily as a trailer can.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive the confirmed press-cycle windows from Campaign Strategy, the Showrunner's content-clearance boundaries, and any finished key art from Marketing Creative needed for the EPK (see Section 5.1).
2. Writer drafts the EPK content — show synopsis, character/cast descriptions, behind-the-scenes material, and any other written press materials — checked against the Showrunner's approved messaging and content-clearance boundary.
3. Publicist/Press Lead manages outreach and relationship-building with press contacts, pitching coverage opportunities and coordinating interview requests within Campaign Strategy's allocated windows.
4. Where interviews are arranged (with the Showrunner, cast, or key crew), the Publicist prepares interview participants with approved talking points and messaging guidance, ensuring consistency with what's been cleared for public discussion.
5. Internal review: check every piece of written material and every prepared talking point against the content-clearance boundary before it goes external — the same non-negotiable check Marketing Creative performs on visual assets.
6. For significant press materials (a major press release, the primary EPK) submit to the Showrunner or Network Gateway for sign-off before external release; routine ongoing press relationship management does not require this level of review for every individual interaction.
7. Publish finalized EPK and press materials to the shared registry; log ongoing press relationship activity (which outlets, what coverage resulted) for Campaign Strategy's and Network Gateway's visibility.
8. Notify Campaign Strategy (via Infrastructure's event system) when a significant press milestone (an EPK is ready, a major interview is confirmed) occurs.

**Human roles inside the Pod and division of labor:**
- **Publicist/Press Lead** — the relationship/messaging vector. Owns press contact relationships, interview coordination, and ensuring messaging consistency across external interactions.
- **Writer** — the content vector. Owns drafting EPK materials, press releases, and other written content.
- **Why split rather than combined:** relationship management (building and maintaining trust with individual journalists, reading a specific outlet's interests) and structured written content production are different skills operating on different timescales — a Publicist deep in relationship-building is not necessarily the person best positioned to also draft polished, on-message written materials under their own review, and vice versa.

**Tooling specifics:** this Pod is the least compute-intensive Pod in the entire framework — its core tooling is drafting assistance and contact/relationship tracking rather than any generative media pipeline; LLM-assisted drafting supports the Writer's process but human review and approval remain the actual authority on final messaging, the same discipline Narrative applies to its own LLM-assisted drafting.

**Known failure modes of this Pod's own process, and internal catches:**
- *Written material or an interview answer inadvertently revealing content beyond what's cleared* — mitigated by step 5's explicit, non-negotiable clearance check applied to every external-facing piece, not just major releases.
- *Messaging inconsistency across different interviews or press materials* (one interview implying something a press release doesn't support) — mitigated by the Publicist maintaining a single, current messaging reference that all prepared talking points and written materials are checked against, rather than each interaction being independently improvised.
- *Over-promising press coverage or access that the production's actual schedule and Campaign Strategy's calendar can't support* — mitigated by step 3 explicitly scoping outreach and commitments to Campaign Strategy's already-allocated windows, not independently promised access this Pod doesn't have standing to guarantee.

**Idle/blocked behavior:** This Pod may begin drafting general EPK content and building press relationships largely independent of any single confirmed date, since foundational written material and relationship-building aren't tied to a specific release window the way a scheduled interview is. It fully blocks on committing to any specific press-cycle activity (an interview date, a release timing) until Campaign Strategy has allocated a confirmed window for it.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives is close to Marketing Creative's own in character but focused on the written/relational register: *"Give press and journalists an accurate, compelling written understanding of the show, and build the kind of press relationships that result in fair, engaged coverage — without revealing more than we've cleared for release."* This specifies the *effect* on press coverage and relationships, not a specific EPK structure or outreach cadence — this Pod has latitude over execution as long as the resulting coverage and materials serve that effect.

### 3.2 Values as Boundary Conditions
- **Accurate representation over maximum hype:** the same value Marketing Creative holds (Section 3.2 of POD-22) applies here in written form — press materials that oversell or misrepresent the show create longer-term reputational cost this Pod does not have authority to trade against short-term press excitement.
- **Cleared content only, no exceptions:** identical to Marketing Creative's boundary — this Pod does not have discretion to discuss or write about content beyond what's explicitly cleared, in any format (written material, prepared talking points, live interview guidance).
- **Relationship trust over one-time coverage:** this Pod prioritizes building durable, honest relationships with press contacts over securing maximum short-term coverage through any single interaction — a journalist who feels misled by prepared talking points is a longer-term cost to the production's ability to get fair coverage in future seasons.

### 3.3 Back-Brief
**Internal back-brief:** draft EPK content and prepared talking points are reviewed internally (Publicist and Writer cross-checking each other's work) against the current messaging reference and content-clearance boundary before any external-facing use — a lightweight, continuous check rather than a single formal preview-before-commit event, given how much of this Pod's work is ongoing relationship management rather than a single large deliverable.

**Pod-to-Showrunner/Network-Gateway back-brief:** significant press materials (the primary EPK, major press releases) receive formal sign-off before external release (Section 2, step 6); routine ongoing press activity does not require this level of review per individual interaction, relying instead on the internal check (above) and the established messaging reference.

**Weaker-signal risk mitigation:** this Pod's work is almost entirely outside the AI-artifact-only back-brief risk described for generative Pods elsewhere in this framework, since it produces written content and manages human relationships rather than generative media — any LLM-assisted drafting is treated as a drafting aid, with human review as the actual authority, the same discipline Narrative applies (POD-08, Section 2).

### 3.4 Global Read / Local Write
**Private working state:** in-progress EPK drafts, unconfirmed outreach conversations, and draft talking points are visible only within the Pod while iteration is happening.

**Finalized write:** once reviewed, finished EPK materials and significant press releases are written once, immutably, to the shared registry; ongoing press-relationship activity logs are appended to continuously rather than published as a single locked artifact.

**Read access:** Campaign Strategy and Network Gateway read finished materials and activity logs for their own scheduling and studio-reporting purposes; Marketing Creative's finished key art is read by this Pod for inclusion in press materials.

**No downstream mutation:** confirmed — Campaign Strategy may not alter finished press materials directly, only schedule their release timing; any content concern is raised back to this Pod formally.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** confirmed press-cycle windows (Campaign Strategy), the Showrunner's content-clearance boundary, and finished key art (Marketing Creative, where needed for EPK inclusion).

**Formal output contract:** a finished EPK, press releases, and coordinated press coverage/interviews, delivered within Campaign Strategy's allocated windows.

**Contract change process:** if the content-clearance boundary changes (the Showrunner clears or restricts additional material), this Pod updates its messaging reference immediately and treats any previously-prepared talking points or drafts against the old boundary as requiring re-review before further use — consistent with the general principle throughout this framework that a changed upstream input invalidates in-progress downstream work pending review, not silent continuation.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** general EPK/relationship-building work may begin independent of a confirmed date; specific press-cycle activity triggers on receipt of a confirmed window from Campaign Strategy.

**Trigger this Pod's output causes downstream:** publishing a finished EPK or major press material fires an automated notification (via Infrastructure) to Campaign Strategy and Network Gateway.

### 3.7 Black-Box Autonomy
While drafting and managing relationships, this Pod is not required to expose in-progress drafts, ongoing outreach conversations, or the specific state of individual press relationships to any other Pod. The only checkpoints visible outside the Pod are the Showrunner/Network Gateway sign-off for major materials (Section 3.3) and periodic activity summaries for Campaign Strategy's scheduling visibility.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-21 Campaign Strategy | Confirmed press-cycle windows | v1.0 | Full block on committing to any specific press-cycle activity (see Section 2, idle/blocked behavior); general EPK/relationship work may proceed independently |
| Showrunner (direct) | Content-clearance boundary | v1.0 | Full block on producing any external-facing material without a defined clearance boundary — this Pod does not guess at what's safe to discuss, the same discipline Marketing Creative applies |
| POD-22 Marketing Creative | Finished key art (for EPK/press kit inclusion) | v1.0 | Soft block — an EPK can be assembled with placeholder or lower-resolution art pending Marketing Creative's finished delivery, though final quality suffers |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-21 Campaign Strategy | Press activity status and milestones, for calendar coordination | v1.0 | Relies on this Pod's accurate reporting to sequence press beats correctly relative to other campaign activity |
| POD-02 Network Gateway | Press coverage summaries and major material sign-off requests | v1.0 | Uses this Pod's activity for studio-facing reporting on publicity performance |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates continuously with Campaign Strategy in a two-way relationship analogous to Marketing Creative's own (POD-22, Section 4.3 mirrored from Campaign Strategy's side) — this Pod plans press activity against Campaign Strategy's calendar, and Campaign Strategy in turn factors this Pod's actual press-cycle capacity and relationship opportunities into its sequencing, rather than one simply dictating to the other.

### 4.4 Position in the Macro-Node Structure
This Pod sits within Studio Firewall, consistent with Campaign Strategy's placement and in direct contrast to Marketing Creative — its function (written communication, human relationship management) has no generative-production component of any kind, making it squarely a coordination/communication function rather than a content-producing one, the same distinction that governs the split between all three Marketing-derived Pods (see POD-22, Section 4.4 for the full reasoning).

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Confirmed press-cycle windows | Campaign Strategy (POD-21) | Structured schedule data | v1.0 | Required (for specific activity; soft for general prep — see 4.1) |
| Content-clearance boundary | Showrunner (direct) | Prose directive / structured boundary document | v1.0 | Required |
| Finished key art | Marketing Creative (POD-22) | High-resolution image files | v1.0 | Required (soft — see 4.1) |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Electronic Press Kit (EPK) | Campaign Strategy (POD-21), Network Gateway (POD-02), external press | Structured document + media package | v1.0 | Y |
| Press releases | Campaign Strategy, Network Gateway, external press | Written document | v1.0 | Y |
| Press activity/coverage logs | Campaign Strategy, Network Gateway | Structured activity record | v1.0 | Y (append-only) |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** an interview participant (Showrunner, cast, or crew) is prepared with talking points that pass this Pod's internal clearance check, but in a live, unscripted interview setting, drifts into revealing content beyond what's cleared — a risk unique to this Pod among the entire framework, since it's the only Pod whose "output" partly consists of live, human, real-time communication that this Pod can prepare for but not fully control the way it can review a finished written document or video asset before release.

**Weaker-signal risk (framework-general, applied here):** this Pod is almost entirely outside the AI-artifact-only back-brief risk, but has its own distinct analog — prepared talking points that look complete and safe in review can still fail in live execution, since a written back-brief cannot fully simulate the unpredictability of a real interview exchange. **Mitigation used by this Pod:** treating interview preparation (Section 2, step 4) as genuine coaching on both content boundaries and how to redirect an off-limits question, not just a list of approved facts — preparing the participant to handle an unexpected question live, not only to recite cleared material.

**Cost of an undetected error:** potentially significant and, unlike most other Pods' errors, largely irreversible once it occurs — a spoiler revealed live in an interview cannot be un-said the way a draft document can be revised before publication, making this one of the few failure modes across the entire pod set with genuinely no opportunity for internal catch-and-correct after the fact. This elevates this specific risk above what this Pod's otherwise low Tier 5 criticality might suggest.

**Escalation path:** if a live disclosure incident does occur, this Pod escalates immediately to the Showrunner and Network Gateway jointly — the same "notify immediately, don't quietly absorb" discipline established for Security & InfoSec's incident response (POD-09) — since managing the fallout of an unintended disclosure is a studio-relationship and creative-strategy question this Pod alone cannot resolve.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly forbidden from producing any external-facing written material or preparing any interview guidance without a current, confirmed content-clearance boundary from the Showrunner — the identical hard boundary Marketing Creative operates under.
- This Pod may not commit press or interview access beyond what Campaign Strategy has actually allocated — over-promising access this Pod doesn't have standing to guarantee is explicitly disallowed (Section 2, known failure modes).
- This Pod does not have authority to speak on behalf of the studio in press interactions — its remit is the production's own messaging; anything touching studio-level positioning is coordinated through Network Gateway, not independently represented by this Pod.
- Default resource allocation: this Pod's operating costs are minimal and largely non-compute (staff time for writing and relationship management) — it does not draw on GPU compute allocation at all, distinguishing it from every other Pod in this framework except possibly Legal and Finance.

---

## 8. Success Criteria

- Campaign Strategy and Network Gateway know this Pod succeeded when press coverage is accurate, on-message, and free of unintended disclosures, with EPK and press materials delivered reliably within allocated windows.
- A returned or flagged piece of material includes specific feedback — a clearance concern, a messaging inconsistency; this Pod revises and resubmits before external release.
- **Contract success:** the EPK, press releases, and coordinated coverage are delivered accurately and on schedule within Campaign Strategy's windows.
- **Intent success:** press and journalists genuinely come away with an accurate, compelling understanding of the show, and the relationship with press contacts remains durable and trusted over time.
- **Concrete divergence case for this Pod:** press materials could be contract-compliant (delivered on time, technically accurate, no spoilers) while still failing intent if the overall impression given to press oversells the show relative to what it actually delivers — the same tonal-accuracy gap Marketing Creative guards against (POD-22, Section 8), just expressed through written messaging rather than trailer pacing.

---

## 9. Open Questions / Notes

- Per the cross-Pod escalation standard (`cross_pod_escalation_threshold_standard.md`), this Pod's default iteration threshold isn't separately defined here — if the same messaging or clearance issue recurs across multiple pieces of material, the standard's default three-cycle rule applies, though this Pod's live-interview risk (Section 6) is explicitly *not* well-served by an iteration-based threshold at all, since a live disclosure incident has no "cycle" to count — it's a one-time, immediate-escalation event regardless of how many prior interviews went smoothly.
- The relationship between this Pod and Talent & Casting (POD-04) around cast availability and any contractual press obligations is not yet formalized — cast members' press participation likely has contractual dimensions (which Talent & Casting would own) that this Pod needs visibility into when scheduling interviews, a gap similar in shape to the one flagged between Localization and Talent & Casting around dub voice licensing (POD-17, Section 9).
- This Pod has reasonable but comparatively thinner source grounding than Marketing Creative — the original bundled Marketing pod description names "Electronic Press Kits (EPKs)" and general publicity function directly, but the specific internal workflow (interview coaching, messaging-consistency discipline, the live-disclosure risk framing) here is a more original elaboration, closer in that respect to Campaign Strategy than to the more source-grounded Marketing Creative.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |

- **Deprecation policy:** published press materials are never deleted, only superseded by a new version if a correction or update is required — prior versions remain available since Campaign Strategy and Network Gateway may need to trace back to exactly what was originally released to press.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.
