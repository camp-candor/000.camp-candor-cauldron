# Cross-Pod Standard: Iteration & Escalation Thresholds

**Status:** Adopted. Referenced by POD-06, POD-07, POD-10, POD-13, POD-14, POD-16 (see each spec's Section 7 and Section 9 for the citation replacing their prior "left to informal judgment" language).

## Purpose

Six independently-written Pod specs each identified the same unresolved gap: a point where a Pod repeats an internal iteration or correction cycle, and nothing defines how many repeats is normal versus a signal that the problem needs to be escalated rather than absorbed locally. Left undefined per-Pod, this risks each Pod either escalating too early (adding friction and undermining the autonomy Mission Command depends on) or never escalating at all (silently absorbing a cost that should have been surfaced, the exact failure mode several specs' Section 6 risk analyses warned against).

This document sets **one default rule**, plus the specific number each flagged Pod uses when their unit of iteration differs enough from the default to need its own value.

## The Default Rule

**Three iteration cycles on the same unresolved issue is the default escalation threshold.**

- Cycle 1 and 2: normal, expected iteration. No action required.
- On the 3rd cycle addressing the *same* underlying issue (not three unrelated revisions — three attempts at the same problem), the Pod must escalate rather than attempt a 4th local fix.
- "Escalate" means: formally flag to the relevant upstream Pod, macro-node Lead, or Showrunner (per that Pod's own Section 6 escalation path), with a description of what's been tried and why it hasn't resolved the issue. It does not mean the Pod stops working — it means the Pod stops *silently absorbing* the cost of repeated local attempts without anyone above it knowing a pattern exists.

**Why three, not some other number:** two cycles is normal variance in any creative or technical process and escalating that early would undermine pod autonomy for no benefit. A single fixed low number (e.g., one) would trigger escalation constantly and defeat the point of trusting a black box. A number much higher than three risks the exact silent-absorption failure mode this standard exists to prevent — by the time a Pod has tried the same fix five or six times, real cost has already been sunk that an earlier flag could have avoided. Three is a deliberately simple, memorable default chosen for consistency across Pods, not derived from empirical data — see the Review Note below.

## Per-Pod Application

The default rule (three cycles) applies as-is unless a Pod's specific situation warranted a different unit or number, noted below.

| Pod | What one "cycle" means for this Pod | Threshold | Rationale for any deviation from default |
|---|---|---|---|
| **POD-06 Data Ops & Model Lifecycle** | One full regression-test run against a proposed dependency/model update, where the deviation from the golden-set baseline exceeds tolerance | 3 cycles | Default applies. A 3rd consecutive regression failure on the same proposed update is escalated to the requesting Pod as "this update is not safely certifiable as currently specified," rather than continuing to retest indefinitely. |
| **POD-07 Foundation Pod** | One wide-condition test batch (varied poses/lighting) that reveals instability requiring retraining | 3 cycles | Default applies. A 3rd retrain attempt that still shows instability across the test batch is escalated to the Showrunner/Blueprint Lead as a signal the underlying approach (base checkpoint, training data, or aesthetic direction) may need reconsideration, not just more training passes. |
| **POD-10 Assembly Pod** | One instance of "fixing in the edit" the same underlying shot-level defect across different episodes | 3 cycles (episodes) | Default applies, but the unit is deliberately cross-episode rather than within a single edit session, since this Pod's risk (Section 6) is specifically about a pattern accumulating *across* episodes, not iteration within one sitting. |
| **POD-13 Polish Pod** | One correction/re-review pass on the same shot for the same flagged defect | 3 cycles | Default applies. A 3rd correction attempt on the same defect is escalated as a candidate for Scene Pod re-render rather than continued inpainting, per Polish's own Section 7. |
| **POD-14 Pre-Vis & Animatic Pod** | One instance of a Scene Pod reporting that the locked animatic's blocking didn't hold at full rendering fidelity for the same scene | 3 cycles | Default applies, but note this counts *reports*, not revision attempts by Pre-Vis itself — three separate Scene Pod deviation reports tied to the same animatic is the trigger, since a single scene rarely gets re-blocked multiple times in isolation. |
| **POD-16 Score & Composition Pod** | One reconciliation-pass round with Assembly addressing the same cue's timing mismatch | 3 cycles | Default applies. Additionally: the Assembly reconciliation pass itself (previously informal — see POD-16 Section 9) is now paired with this threshold as its enforcement mechanism, rather than being separately hardened into its own SLA. See Review Note below on why this was chosen over a Continuity/Canon-style hard gate. |

## Why Score & Composition Did Not Get a Continuity/Canon-Style Hard Gate

POD-16's Section 9 raised the question of whether its Assembly reconciliation pass should become a formal, SLA-bound hard gate, the same way Narrative's Continuity/Canon check did. This standard resolves that question as: **not necessary, given this fix.** The Continuity/Canon gate was justified by Narrative's Section 6 finding that an undetected contradiction is one of the most expensive, cascading failure classes in the entire pipeline — propagating into Foundation, Audio, and Pre-Vis before being caught. Score's own Section 6 explicitly found the opposite: a musical timing mismatch is contained and does not cascade into other Pods' work, since stems are separated and Assembly retains mix discretion. A lower-cost risk does not need the heaviest available mechanism (a dedicated SLA-bound gate) — it needs a cheaper one, which this three-cycle threshold provides. If a future review of actual production data shows Score/Assembly reconciliation failures are more costly or frequent than assumed here, this decision should be revisited, not treated as permanently settled.

## Explicitly Not Covered By This Standard

- **POD-11 Continuity/Canon's SLA** (one business day) is a different kind of threshold — a time commitment, not an iteration-count threshold — and remains unchanged by this document.
- **POD-12 Infrastructure's incident-response commitment** is also a time-based SLA question, not an iteration-count question, and was not resolved by this standard — it has since been resolved separately, directly in Infrastructure's own spec (POD-12, Section 3.3), with a tiered SLA (15-minute acknowledgment for full outages, 1-hour acknowledgment for degraded incidents) rather than a single flat number, reflecting that Pod's unusually broad and simultaneous failure blast radius. See that spec for detail — it is not duplicated here since it isn't an iteration-count threshold this document's format is built to hold.
- Any future Pod spec that surfaces a new instance of this same "how many repeats before escalating" gap should default to citing this standard's three-cycle rule rather than inventing a new informal threshold, unless that Pod's cost-per-cycle genuinely warrants a documented deviation (as Assembly's cross-episode unit does above).

## Review Note

**This threshold is a reasoned default, not an empirically derived one** — no source material specifies an escalation threshold for any Pod, and no production data yet exists to validate whether three is actually the right number for any of the six Pods above. It should be treated as a starting assumption to be revisited once the production is actually running and real iteration-cycle data exists per Pod. If, in practice, a specific Pod's default is clearly miscalibrated (escalating too often and creating friction, or not often enough and allowing silent cost accumulation), that Pod's row above should be updated individually rather than changing the shared default for all six, since a per-Pod miscalibration doesn't necessarily mean the shared default itself is wrong.

---

## Version History and Change Control

| Version | Date | Changed By | Summary of Change |
|---|---|---|---|
| v1.0 | 2026-09-03 | (standard author) | Initial adoption — resolves the recurring escalation-threshold gap flagged across POD-06, POD-07, POD-10, POD-13, POD-14, and POD-16 |

**Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06), consistent with its role as the cross-Pod custodian of versioning and standards across the production.