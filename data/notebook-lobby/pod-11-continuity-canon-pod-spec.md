# Pod Specification: POD-11 — Continuity/Canon Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Continuity/Canon Pod |
| **Alternate/Node Name** | The Story-State Ledger Node |
| **Macro-Node / Tier** | Blueprint (criticality Tier 3 — Structural) |
| **Headcount (human)** | 2 — one Canon Editor (final authority on contradiction resolution), one Ledger/Systems Engineer (maintains the queryable story-state database and automated consistency-checking tooling) |
| **Pod Lead / Accountable Owner** | The Canon Editor. Holds sign-off authority on whether a script passes or fails the continuity check; the Ledger/Systems Engineer maintains the tooling and runs automated checks but does not have authority to approve or reject a script — only to surface candidate contradictions for the Canon Editor's judgment. |
| **Primary AI/Compute Tooling** | An LLM-assisted consistency-checking pipeline that queries new script content against the structured story-state ledger and flags candidate contradictions; a structured database (the ledger itself) tracking established facts, character knowledge states, physical states, and timeline markers |
| **One-Sentence Mission** | Maintain the single authoritative record of everything already established in the story, and certify that new locked material does not silently contradict it, before that material becomes a hard dependency for every other Blueprint and Generative Core pod. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** every other production pod is deliberately scoped to hold only its own slice of the story — a Scene Pod knows its one scene, Audio knows its one episode's dialogue, even Narrative is focused on producing the *current* episode against the *current* arc. No pod is designed to hold the *entire* accumulated story state in mind simultaneously, because that would break the isolation that lets pods "go dark" and operate autonomously. But something has to hold that whole-story view, or contradictions — a secret revealed twice, a character's injury vanishing between scenes, an established timeline conflict — will accumulate invisibly, since each individual pod that touches the story only sees its own narrow slice and has no way to know it's contradicting a slice it never saw.

**Single most important outcome this Pod is accountable for:** guaranteeing that anything locked and published by Narrative is checked against the full accumulated story-state ledger *before* downstream pods (Foundation, Audio, Pre-Vis) begin building against it — catching contradictions at the cheapest possible point, rather than after they've propagated into trained assets, locked audio, or rendered footage.

**Explicitly outside this Pod's purpose:**
- This Pod does not write or revise narrative content itself — that's Narrative's job; Continuity/Canon identifies contradictions and returns them to Narrative to resolve, it does not rewrite dialogue or scenes on Narrative's behalf.
- This Pod does not check visual consistency (character appearance drift, environment coherence) — that's Foundation's and Polish's domain; Continuity/Canon tracks *story facts* (who knows what, what happened, what state something is in), not how something looks.
- This Pod does not make creative judgment calls about whether a contradiction is acceptable as an intentional narrative device (e.g., an unreliable narrator, a deliberate retcon) — that authority sits with the Showrunner; Continuity/Canon's job is to surface the contradiction clearly, not to decide whether it's permissible.
- This Pod does not set the pace or schedule of the production — its own turnaround commitment (Section 3.3) is bounded specifically so it does not become an uncontrolled bottleneck on Narrative's publishing cycle.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Maintain the story-state ledger continuously — a structured record of established facts: character knowledge (who knows what, and as of when), physical/possession state (injuries, props, costume changes), timeline markers (what day/season it is, weather, elapsed time), and locations/relationships as established on-screen.
2. On receipt of a candidate script from Narrative (pre-publication, per the hard-gate contract — see Section 3.3), the Ledger/Systems Engineer runs the automated consistency-checking pipeline: the new script's content is queried against the existing ledger for direct contradictions and suspicious near-matches (e.g., a character referencing knowledge they haven't been shown to acquire yet).
3. The automated pass returns a candidate list of flagged possible contradictions — this is explicitly a *recall-favoring* pass (it should over-flag rather than under-flag), since a human review step follows.
4. The Canon Editor reviews each flagged candidate against the actual script and ledger entries, distinguishing genuine contradictions from false positives (e.g., a callback that reads as a contradiction to the automated checker but is actually an intentional narrative parallel).
5. If genuine contradictions are found, the Canon Editor returns them to Narrative with specific ledger citations (what was established, where, and how the new script conflicts) — not just a flag, but the evidence needed for Narrative to resolve it without re-deriving the conflict themselves.
6. If no genuine contradictions are found, the Canon Editor issues a formal pass, which is the trigger Narrative's hard gate requires before publication (see Section 3.3 and the corresponding update to Narrative's own spec).
7. Once Narrative's script is actually published (post-pass), this Pod ingests its final content into the ledger as newly established canon, updating the record for all future checks.

**Human roles inside the Pod and division of labor:**
- **Canon Editor** — the narrative-judgment vector. Owns whether a flagged item is a genuine contradiction or an intentional device; holds the sign-off authority for the pass/fail gate.
- **Ledger/Systems Engineer** — the systems vector. Owns the ledger's structure, the automated checking pipeline, and ensuring the database stays queryable and complete as the season grows.
- **Why split rather than combined:** the automated checker will produce false positives by design (it over-flags on purpose, per step 3) — a system engineer without narrative judgment can't reliably distinguish a real contradiction from an intentional callback, and a Canon Editor without systems ownership can't be expected to also maintain and improve the checking pipeline's coverage over time.

**Tooling specifics:** the ledger is a structured, queryable database (not a prose document) so it can be checked against programmatically; the LLM-assisted consistency pass is a first filter, not a final authority — final authority always rests with the Canon Editor's human review (step 4).

**Known failure modes of this Pod's own process, and internal catches:**
- *The automated pass under-flags a genuine contradiction because it's phrased differently than the original established fact* — mitigated by deliberately tuning the checker to over-flag (step 3) rather than optimizing for precision, accepting more false positives as the cost of catching more true positives.
- *Ledger entries become stale or incomplete because a Narrative script was published without this Pod formally ingesting its final content* — mitigated by step 7 being a required, triggered action tied directly to Narrative's publish event, not a manual or periodic catch-up task.
- *The Canon Editor becomes a bottleneck reviewing too many false positives* — addressed by the turnaround SLA (Section 3.3) forcing this Pod to actively manage its own review load rather than letting review backlog silently grow, since a missed SLA has a defined escalation consequence.

**Idle/blocked behavior:** This Pod is rarely fully blocked in the way a Scene Pod would be, since ledger maintenance (step 1) is continuous background work independent of any single incoming script. However, a specific *check* task blocks if Narrative submits a script that is still explicitly marked as a draft rather than back-brief-approved (per Narrative's own Section 3.3) — this Pod will not spend review effort certifying material the Showrunner hasn't already structurally approved, since that material may change substantially before it's ready for a continuity check.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives, translated from the Showrunner's general concern about franchise-level coherence, is roughly: *"No audience member should ever notice that this show was made by dozens of isolated, autonomous pods — the story must read as if one mind held it all in view the entire time."* Note this doesn't specify *how* to check for contradictions, what tooling to use, or how large the ledger's schema should be — the Pod is free to design its own checking process as long as the coherence guarantee holds.

### 3.2 Values as Boundary Conditions
- **Recall over precision in automated flagging:** the Pod deliberately accepts more false positives from its automated pass in exchange for catching more true contradictions — a missed genuine contradiction is far more expensive than an extra five minutes reviewing a false flag (this directly reflects Narrative's own Section 6 finding that an undetected contradiction is one of the most expensive failure classes in the whole pipeline).
- **Evidence over assertion when returning a contradiction:** the Pod does not simply tell Narrative "this contradicts canon" — it must cite the specific prior ledger entry, so Narrative can verify and resolve the conflict without re-investigating from scratch.
- **Turnaround discipline over exhaustiveness:** this Pod operates under a fixed SLA (Section 3.3) precisely so that thoroughness never silently expands into an uncontrolled bottleneck on the single highest-throughput handoff in the Blueprint macro-node — if a check cannot be completed within the SLA, it escalates rather than simply running long.

### 3.3 Back-Brief
**Internal back-brief:** the automated consistency pass (step 2–3) functions as a cheap, fast pre-filter before the Canon Editor commits full review attention — analogous to Audio's snippet review or Foundation's wide-condition test batch, applied to narrative-state checking instead of creative content.

**Pod-to-Narrative commitment (the hard gate, newly formalized):** this Pod commits to a **fixed turnaround SLA of one full business day** from receipt of a back-brief-approved script to issuing a pass or a flagged-contradiction report. This SLA is the mechanism that makes Narrative's hard gate (see the corresponding update to Narrative's Section 2 and 4.1) viable without becoming an open-ended bottleneck. If this Pod cannot meet the SLA on a given script (e.g., an unusually large number of genuine flags requiring extended Canon Editor judgment), it must proactively notify Narrative and the Showrunner *before* the SLA expires, not silently run over — an unacknowledged missed SLA is treated as a process failure in itself, separate from whatever contradiction it was reviewing.

**Weaker-signal risk mitigation:** the automated flagging pass is artifact-only (a list of candidate matches, not an explanation of narrative significance) — mitigated by requiring human Canon Editor review of every flagged item before any pass/fail determination, so the final gate decision is never made by the AI signal alone.

### 3.4 Global Read / Local Write
**Private working state:** in-progress reviews, the automated checker's raw candidate-flag list, and the Canon Editor's reasoning notes are visible only within the Pod while a review is underway.

**Finalized write:** once a review concludes, this Pod writes one of two things, once, immutably: a formal pass certification (referencing the specific script version it applies to), or a structured contradiction report (with ledger citations) returned to Narrative. Separately, the ledger itself is updated — appended to, never rewritten — each time a script is published.

**Read access:** the story-state ledger is readable by any Pod that needs it — most directly Narrative (for its own drafting reference) and any Pod that wants to verify a fact before building against it (e.g., Foundation checking whether a costume change is already canon before locking a new character asset variant).

**No downstream mutation:** confirmed — no other Pod may edit the ledger directly. The ledger only grows via this Pod's own ingestion process (Section 2, step 7), ensuring there is exactly one path by which "canon" becomes canon.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** a back-brief-approved (Showrunner-reviewed, per Narrative's Section 3.3) candidate script from Narrative, submitted specifically for continuity review — this Pod does not accept early drafts.

**Formal output contract:** either a formal pass certification or a structured contradiction report with ledger citations, delivered within the one-business-day SLA (Section 3.3).

**Contract change process:** if the ledger's schema changes (e.g., adding a new tracked category, such as "in-world political relationships," beyond the original fact/knowledge/timeline categories), this is announced via Infrastructure's event system, with the schema versioned so that any Pod querying the ledger programmatically can detect which version it's working against.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** receipt of a Showrunner-approved candidate script from Narrative — this is now a required, blocking event in Narrative's own publishing sequence (see the corresponding update to Narrative's spec), not an optional or best-effort submission.

**Trigger this Pod's output causes downstream:** a formal pass certification is the specific event that unblocks Narrative's final publication step — Narrative's script does not reach Foundation, Audio, or Pre-Vis until this event fires. A contradiction report, by contrast, triggers a return-to-Narrative revision cycle rather than any forward progress.

### 3.7 Black-Box Autonomy
While a review is in progress, this Pod is not required to expose the automated checker's full candidate-flag list (including false positives it has already dismissed) to Narrative or any other Pod — only the final pass certification or the confirmed, genuine contradictions make it into the formal output. The Canon Editor's process of distinguishing real contradictions from false positives is internal to the Pod.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-08 Narrative Pod | Back-brief-approved candidate scripts, submitted for continuity review | v1.0 | Full block on that specific review task — this Pod cannot review material that hasn't cleared Narrative's own Showrunner back-brief (see Section 2, idle/blocked behavior) |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-08 Narrative Pod | Pass certification (required before publication) or contradiction reports (requiring revision) | v1.0 | **Cannot publish a locked script without this Pod's formal pass** — this is now a hard, non-skippable gate, not advisory coordination |
| POD-07 Foundation Pod | Read access to the story-state ledger, for verifying whether a proposed visual change (e.g., a mid-season costume update) is already established as canon | v1.0 | Should check the ledger before locking a story-significant visual change, though this remains a recommended practice rather than a hard gate on Foundation's own publishing (see Foundation's Section 7) |
| All Blueprint and Generative Core Pods (indirect) | The downstream benefit of a contradiction-checked script — no other Pod queries this Pod directly, but all inherit the coherence guarantee once Narrative's gate has cleared | v1.0 | N/A — indirect beneficiaries, not direct consumers |

### 4.3 Parallel / Non-Dependent Relationships
This Pod coordinates informally with the Showrunner whenever a flagged contradiction turns out to be an intentional narrative device (e.g., a deliberate retcon or an unreliable narrator's misdirection) rather than an error — in these cases, the Canon Editor cannot unilaterally decide the contradiction is acceptable (per Section 1's scope limits) and escalates to the Showrunner for a ruling, which is then recorded in the ledger as an intentional exception rather than a resolved error.

### 4.4 Position in the Macro-Node Structure
This Pod sits within Blueprint, consistent with its role as custodian of narrative-state intent rather than a technical or governance function. There is no placement tension of the kind Assembly has — both its input (Narrative's scripts) and its output (a gate back to Narrative) are entirely Blueprint-internal transactions.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Back-brief-approved candidate script | Narrative Pod (POD-08) | Prose / dialogue document + JSON beat sheet | v1.0 | Required |
| Existing story-state ledger (self-maintained, read for reference) | Internal (this Pod's own prior output) | Structured database | v1.0 | Required |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Pass certification | Narrative Pod (gates publication) | Structured certification record | v1.0 | Y |
| Contradiction report (with ledger citations) | Narrative Pod (triggers revision) | Structured report | v1.0 | Y |
| Story-state ledger (continuously updated) | All Pods (read access) | Structured, queryable database | v1.0 | Y (append-only) |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** the automated checking pass under-flags a genuine contradiction because it's phrased or structured differently enough from the original ledger entry that the pattern-matching doesn't catch it — meaning the Canon Editor never sees it as a candidate to review at all, and the Pod issues a false pass. Unlike a false positive (caught and corrected during human review, just a minor time cost), a false negative here is invisible until the contradiction surfaces downstream, likely much later and much more expensively.

**AI-generated back-brief risk (framework-level):** the automated pass is artifact-only (a candidate list), and its accuracy depends entirely on how well the underlying pattern-matching generalizes across the many different ways a contradiction can be phrased. **Mitigation used by this Pod:** deliberately tuning for recall over precision (Section 3.2), and continuously expanding the checker's coverage every time a missed contradiction is discovered after the fact — treating each miss as a permanent improvement to the checking pipeline, the same "living, expanding" mitigation pattern used by Data Ops' golden set and Foundation's wide-condition test batches.

**Cost of an undetected error:** very high, though one step removed from Narrative's own Section 6 risk — since this Pod exists specifically to prevent Narrative's worst-case failure, an error here has the same cascading cost profile (propagating into Foundation's trained assets, Audio's locked timing, Pre-Vis's blocking) but is compounded by the fact that everyone downstream *believed* the continuity check had already caught this exact class of problem, making it feel like a violated guarantee rather than an expected residual risk.

**Escalation path:** if Narrative disputes a contradiction report (believing the Canon Editor misjudged something as a genuine conflict when it was intentional), escalation goes to the Showrunner for a ruling — the same path used for intentional-device disputes (Section 4.3). This Pod's Canon Editor does not have unilateral final authority to override the Showrunner's creative judgment, even though it does have unilateral authority to issue or withhold the pass itself pending that ruling.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly forbidden from issuing a pass certification based solely on the automated checker's output without Canon Editor human review — the automated pass is a filter, never a final authority (Section 3.3).
- This Pod may not unilaterally decide that a genuine contradiction is acceptable as an intentional narrative device — that ruling belongs to the Showrunner (Section 1, Section 4.3).
- This Pod must notify Narrative and the Showrunner proactively if it will miss its one-business-day SLA on a given script — silently running over the SLA is treated as a process failure in itself (Section 3.3).
- Default resource allocation: this Pod's review capacity is not compute-bound in the way Scene Pods are, but its *human* review bandwidth is a real constraint — if incoming script volume threatens the SLA on a sustained basis (not just a single unusual script), that is an escalation to the Showrunner about resourcing this Pod further, not a reason to quietly loosen review rigor.

---

## 8. Success Criteria

- The Showrunner knows this Pod succeeded when, season after season, no aired episode is found to contain an avoidable internal contradiction that this Pod should have caught — without needing to inspect this Pod's review process directly.
- A contradiction report returned to Narrative includes specific ledger citations sufficient for Narrative to resolve the conflict without needing to re-derive it themselves; if Narrative reports the citation was unclear or insufficient, that is treated as a defect in this Pod's own output, not a Narrative problem.
- **Contract success:** a pass or contradiction report was issued within the one-business-day SLA, referencing the correct script version.
- **Intent success:** the coherence guarantee actually held — no contradiction that should have been caught made it through to publication.
- **Concrete divergence case for this Pod:** a review could be contract-compliant (delivered on time, correctly formatted, citing real ledger entries) while still failing intent if the automated pass simply never flagged a genuine contradiction as a candidate — the SLA and format were honored, but the actual guarantee this Pod exists to provide didn't hold. This is exactly the false-negative risk in Section 6, and it's why ongoing expansion of the automated checker's coverage (not just meeting the SLA) has to be treated as part of this Pod's core job, not a secondary nice-to-have.

---

## 9. Open Questions / Notes

- The one-business-day SLA (Section 3.3) is a reasoned default, not a value derived from any source material — it should be revisited against actual review volume once the production is running, since it directly determines whether Narrative's hard gate becomes a genuine bottleneck or stays a lightweight check.
- It is not yet specified what happens if this Pod's SLA is missed repeatedly across multiple scripts (a pattern, not a one-off) — Section 7 frames a sustained SLA risk as a resourcing escalation to the Showrunner, but the specific threshold for "sustained" isn't defined.
- Foundation's relationship to the ledger (Section 4.2) is currently a recommended-but-not-required check, which is a slightly inconsistent stance relative to the hard gate just established for Narrative — worth revisiting whether Foundation should also be gated before publishing story-significant visual changes, or whether the asymmetry (hard gate for narrative content, soft check for visual content) is actually the right call given Foundation already has its own informal coordination with this Pod (see Foundation's Section 4.3).
- This Pod did not exist in the original source material — it was proposed as a gap-fill addition in earlier analysis. Its internal workflow, SLA, and headcount here are a full original design built to satisfy the stated purpose, not an elaboration of an existing detailed description, and should be treated as the least source-grounded spec in the set so far.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec — establishes this Pod as a hard, non-skippable gate on Narrative's publication process | Y — Narrative Pod's Section 2 and 4.1 require a corresponding update to reflect this gate (see companion patch) |

- **Deprecation policy:** ledger entries are never deleted or overwritten, only appended to — even a resolved contradiction or an intentional-exception ruling from the Showrunner is recorded permanently, since a future script may need to reference how a past conflict was resolved.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.
