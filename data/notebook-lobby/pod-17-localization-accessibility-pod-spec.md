# Pod Specification: POD-17 — Localization & Accessibility Pod

---

## 0. Pod Identity

| Field | Value |
|---|---|
| **Pod Name** | Localization & Accessibility Pod |
| **Alternate/Node Name** | The Global Delivery Node |
| **Macro-Node / Tier** | Supply Chain (criticality Tier 4 — Compliance & Delivery) |
| **Headcount (human)** | 2 — one Localization Lead (translation quality, dub casting/direction oversight, accessibility standards), one Technical Localization Engineer (multilingual TTS pipeline, timed-text file generation, BCP-47 formatting/QA) |
| **Pod Lead / Accountable Owner** | The Localization Lead. Holds sign-off authority on whether a language pack (dub, captions, audio description) is accurate and ready for delivery; the Technical Localization Engineer owns the pipeline and file-format correctness but does not have authority to approve translation or dub quality independently. |
| **Primary AI/Compute Tooling** | Localized LLMs for translation, multilingual TTS models (specialized multilingual iterations of Parler-TTS or equivalent) for foreign-language dubbing, automated timed-text generation tooling for `.VTT`/`.SCC` subtitle files, audio-description scripting and mixing tools |
| **One-Sentence Mission** | Take the finished, locked episode and produce every foreign-language dub, caption file, and accessibility track a global platform requires — without altering the underlying creative work itself. |
| **Spec Version** | v1.0 |
| **Last Updated** | 2026-09-02 |

---

## 1. Purpose

**Why this Pod exists as a distinct, bounded unit:** a platform operating globally cannot air a show without closed captions, audio descriptions for visually impaired audiences, foreign-language dubbing tracks, and localized on-screen text translation (dubbing cards for signs or credits) — none of which the core creative pipeline (Narrative through Assembly) is built to produce, since that pipeline is entirely focused on the original-language creative product. If this function were distributed back into Assembly or Narrative, those Pods would need translation, multilingual TTS, and accessibility-compliance expertise layered onto their existing creative responsibilities — diluting their focus the same way folding Score into Audio would have (per Audio's own Section 1 purpose statement), and duplicating a specialized skill set that's better centralized once.

**Single most important outcome this Pod is accountable for:** producing a complete, accurate package of foreign-language dubs, timed captions, and accessibility tracks — frame-for-frame matched to the locked master episode — without requiring any change to the underlying creative cut itself.

**Explicitly outside this Pod's purpose:**
- This Pod does not alter or re-edit the locked episode cut — it works entirely from Assembly's finished, immutable output; if a technical issue in the source cut affects localization work, that's flagged back to Assembly (Section 4.1), not fixed independently.
- This Pod does not perform broadcast-spec loudness or color mastering — that's Mastering & QC's job; Localization's dub tracks and timed text are inputs *to* that process for non-English deliverables, not a substitute for it.
- This Pod does not make creative judgment calls about the original dialogue's intent beyond what's needed for accurate translation — it is not empowered to "improve" or reinterpret a line, only to faithfully render its meaning and tone in another language.
- This Pod does not handle the technical XML/metadata wrapping required for studio ingestion — that's Metadata & Ingestion's job; Localization delivers finished language-track files, Metadata packages them for delivery.

---

## 2. Method (Internal Operation)

**Step-by-step internal workflow:**
1. Receive the finished, locked episode cut from Assembly, along with the original locked script/dialogue (from Narrative, for translation reference) and the master audio stems (from Score, where element-specific access aids dub mixing) — see Section 5.1.
2. Localization Lead oversees translation of the dialogue script into each required target language, checking for accuracy, tonal fidelity, and cultural appropriateness — not a literal word-for-word rendering, but a faithful translation of meaning and intent.
3. Technical Localization Engineer feeds translated scripts into multilingual TTS models to generate foreign-language dub tracks, with the Localization Lead reviewing short back-brief samples (Section 3.3) before full-episode dub generation, the same preview-before-commit pattern used elsewhere in this framework.
4. Generate closed captions (`.SCC`/`.VTT`) from the original locked dialogue, precisely timed to match the episode's actual cut — not the script's intended timing, but the final, real timing as delivered by Assembly.
5. Generate audio description tracks — a narrated description of key visual action for visually impaired audiences — scripted to fit within the natural pauses of the existing audio mix without talking over dialogue.
6. Generate localized "dubbing cards" — translated on-screen text for any in-world signage, documents, or credits that were originally in the source language.
7. QA each language pack: verify timing sync (dub-to-picture, captions-to-dialogue), translation accuracy via a second-pass review, and technical format compliance (BCP-47 language tagging, correct file structure).
8. Publish each finished language pack to the shared registry, tagged by language/locale and content type (dub, captions, audio description, dubbing cards).
9. Notify downstream Pods (via Infrastructure's event system) that a new language pack is ready.

**Human roles inside the Pod and division of labor:**
- **Localization Lead** — the linguistic/cultural vector. Owns translation accuracy, dub performance direction, and accessibility-content quality; makes the call on whether a dub or caption genuinely serves a non-English or accessibility-dependent audience the way the original serves an English-speaking one.
- **Technical Localization Engineer** — the pipeline vector. Owns the TTS generation process, timed-text file formatting, and BCP-47 compliance.
- **Why split rather than combined:** translation/cultural-fidelity judgment and multilingual TTS pipeline management are different skill domains — a linguist reviewing dub quality is not necessarily equipped to debug a TTS model's handling of a specific language's phonemes, and an engineer fluent in the technical pipeline is not necessarily positioned to judge whether a translation actually captures the original's tone.

**Tooling specifics:** localized LLMs handle first-pass translation, reviewed and refined by the Localization Lead rather than accepted as final without human review; multilingual TTS models generate the actual dub audio; automated timed-text tooling generates caption files synced to Assembly's actual final cut timing, not an earlier reference.

**Known failure modes of this Pod's own process, and internal catches:**
- *A technically accurate translation that misses tone or cultural context* (e.g., an idiom translated literally rather than adapted) — mitigated by the Localization Lead's dedicated review pass (step 2/7), not relying on the LLM's first-pass output alone.
- *Captions or dubs generated against a reference timing that doesn't match Assembly's actual final cut* — mitigated by strictly sourcing timing from Assembly's locked output (step 4), never from an earlier script or animatic reference.
- *Audio description narration overlapping with existing dialogue or key sound cues* — mitigated by scripting audio description specifically to fit natural pauses in the existing mix (step 5), reviewed against the actual final audio stems rather than written blind against the script alone.

**Idle/blocked behavior:** This Pod fully blocks on beginning full-scale localization work for an episode until Assembly's locked cut is available, since captions, dubs, and audio description must all be timed against the real, final cut — working from an earlier animatic or rough cut would risk producing a complete language pack that's desynced the moment the real cut differs even slightly. However, this Pod may begin translation work on the underlying dialogue script as soon as Narrative's script is locked, independent of Assembly's cut, since translation of meaning doesn't require final visual timing — only the eventual timed-text and dub generation steps require the locked cut.

---

## 3. Design Primitives — Explicit Mapping

### 3.1 Intent
The intent this Pod receives, translated from the Network's and Showrunner's shared concern about global accessibility, is roughly: *"Every audience the platform serves — regardless of language or ability — should have access to a version of this episode that preserves its actual meaning, tone, and dramatic effect, not just a technically compliant but flattened substitute."* Note this specifies the *quality bar* (preserve meaning and tone, not just technical presence of a caption or dub) without dictating which specific languages to prioritize first, which TTS models to use, or how many review passes a given translation needs — this Pod is free to determine its own approach as long as that bar is met.

### 3.2 Values as Boundary Conditions
- **Faithful adaptation over literal translation:** a dub or caption that preserves the original's tone and meaning through culturally appropriate adaptation outranks a technically literal, word-for-word rendering that reads as stilted or loses the original's intent.
- **Real final-cut timing over any earlier reference:** this Pod does not begin timed-text or dub-sync work against anything other than Assembly's actual locked output — using an animatic or rough-cut timing as a shortcut is explicitly disallowed, even under schedule pressure, since a desynced deliverable fails the entire purpose of this Pod's output.
- **Accessibility content is not a lesser-priority afterthought:** audio description and captioning are held to the same quality review standard as foreign-language dubbing, not treated as a lighter-weight or lower-priority deliverable — a platform's commitment to accessible content depends on this Pod not deprioritizing it relative to more visible foreign-market dubs.

### 3.3 Back-Brief
**Internal back-brief:** a short sample of dub delivery (a few lines, not the full episode) is generated and reviewed by the Localization Lead for tonal accuracy and delivery quality before committing to full-episode multilingual TTS generation — the same cheap-preview-before-expensive-commitment pattern used by Audio for its own TTS work, applied per target language.

**Weaker-signal risk mitigation:** because this back-brief is artifact-only (a short audio sample), the Pod mitigates the general framework-level risk the same way Audio does — by reviewing full-scene playback of the sample in context (not an isolated line out of context) before committing to the full batch, and by having the Localization Lead's review scoped specifically to whether the *tone* survived translation, not just whether the TTS output is technically clean audio.

### 3.4 Global Read / Local Write
**Private working state:** in-progress translation drafts, rejected dub takes, and draft caption timing are visible only within the Pod while iteration is happening.

**Finalized write:** once QA'd (Section 2, step 7), each finished language pack (a dub track, a caption file, an audio description track, or dubbing-card graphics) is written once, immutably, to the shared registry, tagged by language/locale.

**Read access:** Mastering & QC and Metadata & Ingestion may read finished language packs for their own downstream processing.

**No downstream mutation:** confirmed — no downstream Pod may directly edit a delivered dub, caption, or audio-description file. If Mastering & QC finds a technical formatting issue, it's submitted as a formal request back to this Pod rather than patched independently.

### 3.5 Strict Contracts (Treat Pods like APIs)
**Formal input contract:** the locked, finished episode cut (Assembly), the original locked script (Narrative, for translation reference), and master audio stems (Score, where needed for dub mixing reference).

**Formal output contract:** per-language dub tracks, timed caption files (`.VTT`/`.SCC`), audio description tracks, and localized dubbing-card graphics — each BCP-47 tagged and delivered in the format Mastering & QC and Metadata & Ingestion require.

**Contract change process:** if this Pod adds support for a new language or a new accessibility format (e.g., a new descriptive-audio standard required by an additional distribution territory), the change is announced via Infrastructure's event system, with existing language packs remaining valid — this is additive, not a replacement of existing contracts, so no transition window is typically needed for other Pods.

### 3.6 Event-Driven Triggers
**Trigger to begin work:** full localization work triggers on receipt of Assembly's locked cut (Section 2, idle/blocked behavior); preliminary translation work triggers earlier, on receipt of Narrative's locked script.

**Trigger this Pod's output causes downstream:** publishing a finished language pack fires an automated notification (via Infrastructure) to Mastering & QC and Metadata & Ingestion that new deliverables are ready for their respective processing.

### 3.7 Black-Box Autonomy
While translating and producing dub/caption content, this Pod is not required to expose in-progress translation drafts, rejected dub takes, or draft timing adjustments to any other Pod. The only checkpoints visible outside the Pod are the internal back-brief (invisible to others) and the final published language packs.

---

## 4. Relationships to Other Pods

### 4.1 Upstream Dependencies (Pods this Pod depends on)

| Upstream Pod | Supplies | Contract/Schema Version | Failure Impact if Missing/Late |
|---|---|---|---|
| POD-10 Assembly Pod | Locked, finished episode cut | v1.0 | Full block on final timed-text/dub-sync work (see Section 2, idle/blocked behavior); preliminary translation may proceed independently |
| POD-08 Narrative Pod | Locked original-language script | v1.0 | Full block on beginning translation work at all — nothing to translate without a locked script |
| POD-16 Score & Composition | Master audio stems (for dub mixing reference where element-specific access is useful) | v1.0 | Soft risk — dub mixing can proceed against the final mixed episode audio alone, but access to separated stems makes balancing a new-language dub against existing music/foley meaningfully easier |

### 4.2 Downstream Dependents (Pods that depend on this Pod)

| Downstream Pod | Consumes | Contract/Schema Version | Constraint Imposed on Them |
|---|---|---|---|
| POD-18 Mastering & QC | Finished dub tracks, for broadcast-spec loudness mastering per language | v1.0 | Must apply the same loudness/technical compliance standard to every delivered language track, not just the original |
| POD-19 Metadata & Ingestion | Finished language packs (dubs, captions, audio description, dubbing cards) | v1.0 | Must correctly package and tag each language pack per the studio's Media Supply Chain metadata requirements, keyed to this Pod's BCP-47 tagging |

### 4.3 Parallel / Non-Dependent Relationships
This Pod has no significant parallel coordination relationship of the kind Assembly/Score share — its work on any given episode is fully sequential (it cannot meaningfully begin full production until Assembly's cut locks), and its downstream consumers (Mastering & QC, Metadata) work from its finished output rather than needing to reconcile diverging references mid-process.

### 4.4 Position in the Macro-Node Structure
This Pod sits within Supply Chain, with no placement tension — unlike Assembly, its function is unambiguously "take finished creative work and prepare it for the next system downstream," matching its immediate neighbors (Mastering & QC, Metadata) exactly, with no creative-judgment component significant enough to warrant a Blueprint-facing bridge role.

---

## 5. Inputs and Outputs (Detailed)

### 5.1 Inputs Received

| Input | Source Pod | Format | Schema Version | Required or Optional |
|---|---|---|---|---|
| Locked, finished episode cut | Assembly Pod (POD-10) | Master video file | v1.0 | Required |
| Locked original-language script | Narrative Pod (POD-08) | Prose / dialogue document | v1.0 | Required |
| Master audio stems | Score & Composition Pod (POD-16) | Multi-channel audio files | v1.0 | Optional (soft — see 4.1) |

### 5.2 Outputs Produced

| Output | Destination(s) | Format | Schema Version | Immutable Once Written? (Y/N) |
|---|---|---|---|---|
| Foreign-language dub tracks | Mastering & QC, Metadata & Ingestion | Audio files, per language, BCP-47 tagged | v1.0 | Y |
| Closed caption files | Mastering & QC, Metadata & Ingestion | `.VTT` / `.SCC` | v1.0 | Y |
| Audio description tracks | Mastering & QC, Metadata & Ingestion | Audio files | v1.0 | Y |
| Localized dubbing-card graphics | Mastering & QC, Metadata & Ingestion | Image/overlay files, per language | v1.0 | Y |

---

## 6. Risk and Mitigation

**Single biggest failure mode specific to this Pod:** a translation that is technically accurate but tonally wrong — passing a literal-accuracy check while failing to preserve the original's intended emotional register (e.g., a line meant to land as darkly ironic translating as simply confusing, or a moment of levity translating as flat) — because the failure isn't a factual error an automated check would catch, it's a judgment call about tone that requires genuine bilingual, bicultural fluency to even notice went wrong.

**Weaker-signal risk (framework-general, applied here):** the internal dub back-brief (Section 3.3) is artifact-only — a short audio sample, not an explanation of translation reasoning — meaning a sample can sound acceptable in isolation while a systemic tonal misjudgment only becomes apparent across a full episode. **Mitigation used by this Pod:** reviewing the back-brief sample in the context of its surrounding scene (Section 3.3), not as an isolated clip, and treating the Localization Lead's second-pass QA review (Section 2, step 7) as a genuinely independent check on tone, not a rubber-stamp of the back-brief's earlier approval.

**Cost of an undetected error:** moderate and contained — unlike a Narrative or Foundation error, a flawed dub or caption for one language doesn't affect the original-language product or any other language's deliverables; the cost is a re-translation and re-dub for that specific language, not a cascading multi-Pod failure. However, the *reputational* cost in the affected market can be disproportionate to the technical cost of fixing it, since a tonally wrong dub is often widely and publicly mocked by that language's audience in a way a caught-and-fixed technical bug never would be.

**Escalation path:** if the Localization Lead and a native-speaking reviewer (where the Lead isn't personally fluent in a given target language) disagree on whether a translation preserves tone correctly, this Pod is expected to bring in additional native-speaker review rather than resolving the disagreement internally without that expertise — escalation here is about acquiring the right expertise, not appealing to the Showrunner, since the Showrunner is unlikely to be positioned to adjudicate a translation-tone dispute in a language they may not speak.

---

## 7. Boundary Conditions and Scope Limits

- This Pod is explicitly forbidden from beginning full-scale timed-text or dub-sync production against anything other than Assembly's actual locked cut — no shortcuts using animatic or rough-cut timing, even under schedule pressure (Section 3.2).
- This Pod may not treat accessibility content (captions, audio description) as lower priority than foreign-language dubs in scheduling or review rigor (Section 3.2) — both categories receive the same QA standard.
- This Pod does not have authority to alter the original creative work's meaning during translation, even where a literal translation is awkward — the correct response to a translation challenge is creative adaptation that preserves meaning, escalated for additional review if genuinely difficult, not a reinterpretation of what the original scene is trying to say.
- Default resource allocation: TTS and translation compute needs are modest relative to Scene Pods, but this Pod's *human* review bandwidth (native-speaker quality review across potentially many languages) is the real constraint — if the number of required languages grows faster than available qualified reviewers, that's an explicit resourcing escalation to the Showrunner or Network Gateway, not a reason to quietly reduce review rigor per language.

---

## 8. Success Criteria

- Mastering & QC and Metadata & Ingestion know this Pod succeeded when every required language pack arrives correctly timed, correctly tagged, and technically ready for their own downstream processing without requiring rework.
- A language pack returned for revision (via native-speaker review or downstream QA) includes specific feedback — a timing desync, a mistranslation, a tonal miss — and this Pod revises and resubmits.
- **Contract success:** dub tracks, captions, audio description, and dubbing cards are delivered in the correct format, correctly tagged, on schedule.
- **Intent success:** a non-English-speaking or accessibility-dependent audience genuinely receives the same dramatic experience an English-speaking, sighted/hearing audience receives from the original.
- **Concrete divergence case for this Pod:** a dub could be contract-compliant (correctly timed, technically clean audio, properly tagged) while still failing intent if the translation is literally accurate but tonally flat — exactly the risk in Section 6, and why the Localization Lead's tone-focused review is treated as a required, independent step rather than something a technical QA pass alone could substitute for.

---

## 9. Open Questions / Notes

- Per the cross-Pod escalation standard (`cross_pod_escalation_threshold_standard.md`), this Pod's default iteration-cycle threshold is not separately defined in this spec — if a specific language pack requires repeated tonal revision, the standard's default three-cycle rule applies (three rounds of the same translation-tone dispute on a single pack triggers the native-speaker escalation described in Section 6), rather than treating it as an open gap requiring a new bespoke number.
- The relationship between this Pod and Talent & Casting (POD-04) around dub voice licensing is not yet formalized — if foreign-language dubs use TTS trained on or referencing a licensed voice performer's likeness across multiple languages, that likely has the same union/licensing implications Audio's own voice synthesis does, and should probably be explicitly coordinated with Talent & Casting and Legal & Provenance rather than assumed to be automatically covered by whatever clearance exists for the original English performance.
- This Pod's internal workflow draws on solid source material describing its core function (multilingual dubs, `.VTT`/`.SCC` captions, audio description, BCP-47 compliance) but the specific headcount split and tone-focused QA process here are a reasoned elaboration rather than verbatim source detail — comparable in grounding to Assembly or Audio rather than to the more heavily extrapolated Data Ops or Continuity/Canon specs.

---

## 10. Version History and Change Control

| Spec Version | Date | Changed By | Summary of Change | Contract Impact (Y/N — did upstream/downstream contracts change?) |
|---|---|---|---|---|
| v1.0 | 2026-09-02 | (initial spec author) | Initial spec | N |

- **Deprecation policy:** a delivered language pack is never deleted, only superseded by a new version if a revision is required — prior versions remain available since Mastering & QC and Metadata may need to trace back to exactly what they originally processed.
- **Owner of this record:** Data Ops & Model Lifecycle Pod (POD-06) is responsible for keeping this version history current, consistent with its role as the cross-Pod custodian of versioning across the production.