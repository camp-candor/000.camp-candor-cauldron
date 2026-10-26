# Production Ops: ClickUp Design Governance, Fidelity Gates & 60-Directive Spec

A systems-engineering and administrative governance framework for managing UI/UX design departments, enforcing state machines, design token parity (`base.css`), accessibility standards (WCAG AAA), and 60 operational directives mapped across the Unified Edge Monolith.

---

## 1. Philosophical Grounding: The Blueprint Factory vs. Creative Sandbox

Design is not decorative art; it is an architectural discipline engineering user behavior, cognitive load, and throughput:
* **The Anti-Sandbox Doctrine:** General design tasks without links to NPM workspaces or frontend token registries create technical debt.
* **Separation of Concerns:** "Thinking" (UX logic, grey-box wireframes, state machines) must be strictly decoupled from "Styling" (UI, design tokens, visual components).

---

## 2. Space Hierarchy & Folder Architecture

```
[DEPT] - PRODUCT DESIGN & UX
├── [00] - Discovery & Research    <-- User interviews, problem statements, competitive analysis
├── [01] - UX & Wireframes         <-- Logic flows, state machines, grey-box diagrams (Zero colors allowed)
├── [02] - UI & High Fidelity      <-- Design system application, pixel-perfect layouts
└── [03] - Design System (The Law) <-- Atomic components (Buttons, Inputs, Modals) synced to base.css
```

---

## 3. The Fidelity Lifecycle (Approval & Progression Gates)

1. **HYPOTHESIS:** Problem defined; solution unknown.
2. **LOW_FIDELITY:** Wireframing and spatial layout.
   * *Gate (UX Review):* Flow must make structural sense in black and white before color is permitted.
3. **HIGH_FIDELITY:** Applying the Design System.
   * *Gate (Design System Check):* Mandates existing atomic components; custom one-offs require architectural justification.
4. **PROTOTYPING:** Interactive validation in Figma or ProtoPie.
5. **HANDOFF_READY:** The binding contract with Engineering.
   * *Criteria:* All states mocked (empty, loading, error, hover/active); assets exported (SVG/WebP); redlining uses tokens (`$spacing-lg`) instead of magic numbers (`24px`).
6. **IN_DEV:** Engineering implementation; design shifts to a support role.
7. **QA_VISUAL / SANCTIFICATION:** Frame-by-frame and pixel audit of coded result against accessibility and token trees.

---

## 4. Task Specification Contract (`Design_Task_Standard`)

```markdown
### 📐 Design Brief: [Component / Flow Name]

**The Objective:**
[Specific behavioral outcome, e.g., "Reduce Time-to-Checkout by 20%"]

**The Logic (State Machine Requirements):**
- **Empty State:** [Appearance with 0 data items]
- **Loading State:** [Skeleton pulse vs. progressive spinner]
- **Error State:** [Network disconnect, validation rejection, edge timeout]
- **Interaction States:** [Default, Hover, Active, Focus, Disabled]

**Technical Constraints:**
- **Device & Viewport:** [Mobile 320px / Tablet / Desktop 1920px]
- **Theme:** [Dark Mode / Light Mode]
- **Design System Dependencies:** [Link to Button_V2, Modal_V3]
- **Performance Budget:** [Max kilobyte payload permitted]

**Artifacts:**
[Figma Frame Link] | [Interactive Prototype Link]
```

---

## 5. The 60 Operational Directives Across the Unified Edge Monolith

### I. The Sphere of Identity (Clerk & Auth)
1. Define visual signifiers for Clerk Auth transitions (Idle, Authenticating, Success, Failure).
2. Architect the "Nomad Rejection" interface for invalid JWT signatures at the edge.
3. Sanctify login form hierarchy to match `base.css` typographic scale.
4. Refine session decay countdown indicators to prevent abrupt nomad ejection.
5. Standardize MFA flows to eliminate keyboard trapping during SMS/passkey steps.
6. Purify the "Guest" state for unauthenticated users exploring lore routes.
7. Map the identity handover motion curves for post-validation welcome banners.
8. Audit Clerk error code mappings to semantic user-facing text.
9. Design the "Isolate Lockdown" state when lacking `ZoneDO` permissions.
10. Standardize avatar hydration placeholders prior to CDN asset arrival.

### II. The Sphere of the Portal (Astro & Lore)
11. Coordinate Astro View Transition opacity curves (`ease-in-out`) between `/lore` and `/play`.
12. Architect "Lore-Crumbs" navigation reflecting the Neo4j graph hierarchy.
13. Purify hero typography tracking and leading to eliminate layout shift during font hydration.
14. Standardize read-time metadata signifiers based on word count.
15. Refine scroll-linked animations to maintain a 16ms frame budget.
16. Sanctify Markdown `.prose` CSS resets to prevent style contamination.
17. Define CTA contrast ensuring a minimum 7:1 ratio against dark backdrops.
18. Architect low-resolution image placeholders (LIPs) for media-heavy pages.
19. Standardize footer links to a strict 12-column fluid grid.
20. Audit OpenGraph metadata generation from Neo4j knowledge nodes.

### III. The Sphere of the Engine (React & HUD)
21. Design Protobuf handshake indicators for WebSocket connection stabilization (initial 100ms).
22. Architect latency spike warnings for ping exceeding 150ms.
23. Purify the compass affordance using deterministic headings from H3 hex meshes.
24. Sanctify HUD scaling utilizing `ch` units for resolution-agnostic legibility.
25. Refine entity-focus outlines for targeted NPCs in the React viewport.
26. Standardize chat stream color tokens (System, Narrative, Player, Global).
27. Map inventory-to-world drag-and-drop active/target states.
28. Architect narrative popup entry and exit transitions for streaming text tokens.
29. Purify spell cooldown radials for visibility in extreme contrast lighting.
30. Define mobile safe-zone margins preventing collision with browser chrome.

### IV. The Sphere of the Mesh (H3, Physics & Durable Objects)
31. Visualize H3 Resolution 8 cell boundaries via subtle terrain overlays.
32. Architect 100ms transition masks hiding nomad migration between Durable Objects.
33. Refine collision signifiers when server-side physics detects a hit.
34. Standardize entity-spawn dissolution effects driven by the AI Director.
35. Sanctify vector-memory cues for objects with high narrative mass in vector databases.
36. Map atmospheric color grading shifts based on player karmic ledgers in Neo4j.
37. Architect simulation tick rate indicators displaying `ZoneDO` TPS.
38. Purify AI pathfinding breadcrumbs to minimize cognitive clutter.
39. Define regional mood background transitions mapped to `RegionDO` vectors.
40. Refine extinction visual artifacts (e.g., desaturation) for dying species.

### V. The Sphere of Governance (Tokens & Systems)
41. Codify danger palette tokens (Red 50–950) for health depletion and failure.
42. Sanctify the global 4px-base spacing scale across all margin/padding tokens.
43. Purify SVG iconography to a uniform 1.5px stroke and 24x24px viewport.
44. Standardize 5 levels of directional elevation shadows and z-index depth.
45. Refine button-press tactile feedback with active scale transitions (`0.98`).
46. Architect fluid typography using `clamp()` logic across 320px to 1920px viewports.
47. Sanctify high-visibility, zero-layout-shift focus rings for keyboard navigation.
48. Audit the z-index stack (`z-hud`, `z-modal`, `z-portal`) to eliminate depth bleeding.
49. Define pulsing loading skeleton tokens for unrendered UI blocks.
50. Purify tooltip delays to a standardized 200ms threshold.

### VI. The Sphere of the Soul (UX & Accessibility)
51. Audit contrast ratios across `/play` to verify WCAG 2.1 AAA compliance.
52. Architect `aria-live` screen-reader regions for streaming AI combat prose.
53. Standardize `prefers-reduced-motion` overrides across all camera and UI transitions.
54. Purify modal focus traps preventing navigation leaks into background canvases.
55. Refine reconnection flows when WebSocket streams sever.
56. Standardize tooltip smart-flip logic preventing viewport edge clipping.
57. Map dynamic input-method icons swapping between keyboard and gamepad bindings.
58. Audit mobile touch targets ensuring a minimum 44px hit-box.
59. Design "Silence Mode" UI when AI narrative engines are rate-limited or disabled.
60. Sanctify transitions to eliminate single-frame white flashes upon scene load.

---

## 6. Audit Metrics & Rework Dashboards

* **The Rework Rate:** Volume of engineering tasks returned to Design due to missing edge cases or state omissions. High rework indicates incomplete wireframes.
* **Design System Utilization:** Ratio of atomic design library components utilized vs. custom one-offs. High custom element rates signal unmanaged technical debt.
* **Proofing Protocol:** Critiques must use ClickUp image annotations mapped to heuristic standards (Fitts' Law, WCAG contrast ratios, token discrepancies) rather than subjective commentary.