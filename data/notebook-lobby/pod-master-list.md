# Master Pod List

Complete list of all pods identified across the framework, with zero-padded IDs for reference in specs, filenames, and dependency diagrams.

> **Numbering scheme (updated):** IDs now reflect the criticality tiers from the Pod Hierarchy of Importance document (Tier 1 = existential, Tier 5 = amplification), not the original pipeline-stage order. Within a tier, pods are ordered alphabetically — alphabetical order carries no meaning beyond determinism. **This replaces the prior pipeline-order numbering.** If any prior document, filename, or system references the old IDs, treat those as deprecated — see the mapping table at the bottom of this file.

| ID | Pod Name | Alternate/Node Name | Macro-Node | Tier |
|---|---|---|---|---|
| POD-01 | Legal, Provenance & Clearance Pod | The Compliance / Clean Room Node | Studio Firewall | 1 — Existential |
| POD-02 | Network Gateway Pod | The Studio Interface / Firewall Node | Studio Firewall | 1 — Existential |
| POD-03 | Production Finance & Accounting Pod | The Capital Node | Studio Firewall | 1 — Existential |
| POD-04 | Talent & Casting Pod | The Human Licensing Node | Blueprint | 1 — Existential |
| POD-05 | Audio Pod | The Pace & Performance Node | Blueprint | 2 — Foundational |
| POD-06 | Data Ops & Model Lifecycle Pod | The Custodian Node | Studio Firewall | 2 — Foundational |
| POD-07 | Foundation Pod | The Asset & Lore Node | Blueprint | 2 — Foundational |
| POD-08 | Narrative Pod | The Script & Storyboard Node | Blueprint | 2 — Foundational |
| POD-09 | Security & InfoSec Pod | The TPN Protection Node | Studio Firewall | 2 — Foundational |
| POD-10 | Assembly Pod | The Master Editorial Node | Supply Chain* | 3 — Structural |
| POD-11 | Continuity/Canon Pod | The Story-State Ledger Node | Blueprint** | 3 — Structural |
| POD-12 | Infrastructure Pod | The System Middleware Node | Supply Chain | 3 — Structural |
| POD-13 | Polish Pod | The Continuity & Artifact Cleanup Node | Generative Core | 3 — Structural |
| POD-14 | Pre-Vis & Animatic Pod | The Blueprint Node | Blueprint | 3 — Structural |
| POD-15 | Scene Pods (Multiple) | Generative Execution Nodes | Generative Core | 3 — Structural |
| POD-16 | Score & Composition Pod | The Melodic Node | Blueprint | 3 — Structural |
| POD-17 | Localization & Accessibility Pod | The Global Delivery Node | Supply Chain | 4 — Compliance & Delivery |
| POD-18 | Mastering & QC Pod | The Broadcast Engineering Node | Supply Chain | 4 — Compliance & Delivery |
| POD-19 | Metadata & Ingestion Pod | The Supply Chain Handshake Node | Supply Chain | 4 — Compliance & Delivery |
| POD-20 | Motion Graphics & Typography Pod | The Vector Node | Generative Core | 4 — Compliance & Delivery |
| POD-21 | Campaign Strategy Pod | The Timing & Channel Node | Studio Firewall | 5 — Amplification |
| POD-22 | Marketing Creative Pod | The Trailer & Key Art Node | Generative Core*** | 5 — Amplification |
| POD-23 | Press & Communications Pod | The EPK & Publicity Node | Studio Firewall | 5 — Amplification |

\* Assembly Pod's placement is contested — see prior discussion. Its inputs are technical (Supply Chain-adjacent) but its decisions are creative (Blueprint-adjacent); treat as a bridge node whose Lead attends both syncs.

\*\* Continuity/Canon Pod was proposed as a gap-fill addition (not in the original 20), sitting downstream of Narrative and parallel to Polish, but grouped under Blueprint here since it's the custodian of narrative/story-state intent.

\*\*\* Marketing Creative Pod was split out from the original single "Marketing & Promotional Pod." It pulls the same assets and uses similar tooling (upscalers, video/image generation) as Scene Pods and Polish, so it's grouped under Generative Core rather than Studio Firewall — it is functionally a production sibling, not a corporate/governance function. Press & Communications and Campaign Strategy retain the original Studio Firewall placement, since they are PR- and scheduling-facing rather than generative.

---

## Notes on Numbering

- **IDs are now tier-ordered by criticality** (Tier 1 → Tier 5, per the Pod Hierarchy of Importance document), then alphabetical within each tier. This is a deliberate departure from the earlier pipeline-stage numbering — see the deprecated mapping below if you need to trace an old reference.
- **POD-15 (Scene Pods)** is the one entry representing a *class* of pods rather than a single instance — in practice this ID would be suffixed per instance (e.g., POD-15A, POD-15B, POD-15-EP03-SC14) since a production runs many Scene Pods concurrently. Note that an individual Scene Pod instance covering a pivotal scene may function at a higher criticality tier than its class-level Tier 3 assignment — see the Hierarchy document's closing note on this.
- **Tier ties are broken alphabetically**, which means this ordering is not fully stable if pod names change — treat the Tier assignment (last column) as the authoritative signal, and the numeric ID as a convenience reference, not a load-bearing fact by itself.
- **Current total: 23 pods** (20 original + Continuity/Canon + the 2-way further split of Marketing beyond its original single entry).
- **This is the second numbering scheme applied to this list.** If build scripts, filenames, or the version-control system (POD-06 / Data Ops) reference the prior pipeline-order IDs, they must be migrated — do not assume old and new IDs are interchangeable.

---

## Deprecated ID Mapping (Pipeline-Order → Criticality-Order)

For migrating any existing references from the original numbering to this one.

| Old ID (pipeline order) | New ID (criticality order) | Pod Name |
|---|---|---|
| POD-01 | POD-02 | Network Gateway Pod |
| POD-02 | POD-01 | Legal, Provenance & Clearance Pod |
| POD-03 | POD-09 | Security & InfoSec Pod |
| POD-04 | POD-03 | Production Finance & Accounting Pod |
| POD-05 | POD-06 | Data Ops & Model Lifecycle Pod |
| POD-06 | POD-04 | Talent & Casting Pod |
| POD-07 | POD-07 | Foundation Pod |
| POD-08 | POD-08 | Narrative Pod |
| POD-09 | POD-14 | Pre-Vis & Animatic Pod |
| POD-10 | POD-05 | Audio Pod |
| POD-11 | POD-16 | Score & Composition Pod |
| POD-12 | POD-15 | Scene Pods (Multiple) |
| POD-13 | POD-13 | Polish Pod |
| POD-14 | POD-20 | Motion Graphics & Typography Pod |
| POD-15 | POD-10 | Assembly Pod |
| POD-16 | POD-17 | Localization & Accessibility Pod |
| POD-17 | POD-18 | Mastering & QC Pod |
| POD-18 | POD-19 | Metadata & Ingestion Pod |
| POD-19 | POD-22 | Marketing Creative Pod |
| POD-20 | POD-12 | Infrastructure Pod |
| POD-21 | POD-11 | Continuity/Canon Pod |
| POD-22 | POD-23 | Press & Communications Pod |
| POD-23 | POD-21 | Campaign Strategy Pod |