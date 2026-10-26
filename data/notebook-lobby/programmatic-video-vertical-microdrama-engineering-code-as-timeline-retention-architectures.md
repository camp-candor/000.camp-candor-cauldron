# Programmatic Video & Vertical Microdrama Engineering: Code-As-Timeline & Retention Architectures

A technical manual covering headless programmatic video rendering, vertical mobile microdrama production pipelines, algorithmic retention modeling, and spatial framing constraints.

---

## 1. Programmatic Video Architecture: Code-As-Timeline ($f(\text{time}) \rightarrow \text{Image}$)

Traditional video editing software (Premiere Pro, DaVinci Resolve) is replaced with software-driven continuous integration and deployment (CI/CD) pipelines:

### A. Jonny Burger & Remotion Framework
* **Paradigm:** Video treated as a deterministic, functional React component where visual layout, audio playback, and typography are functions of frame indices.
* **Serverless Parallel Compilation (Remotion Lambda):** Spawns hundreds of ephemeral AWS Lambda instances in parallel to render multi-layered video compositions with dynamic kinetic typography, audio waveform alignment, and camera shake in seconds.

### B. Headless ComfyUI & Auto-Timeline Integration
```
[ LLM Beat Sheet (JSON with millisecond targets) ]
                   │
                   ├──► [ Local Speech Engine (ChatTTS/Kokoro) ] ──► .wav + forced-alignment word maps
                   │
                   └──► [ Headless ComfyUI API (Wan 2.2 / Kling) ] ──► Video latents / plates
                                           │
                                           ▼
                 [ Remotion Engine (TypeScript / React Composition) ]
                   - Aligns video cuts to audio waveforms
                   - Programmatically burns dynamic kinetic subtitles
                   - Applies algorithmic camera jitter / zooms
                                           │
                                           ▼
                        [ Rendered Episodic MP4 Deliverable ]
```

---

## 2. Vertical Microdrama Pipeline Engineering (9:16 Serialized Mobile)

Scaling production across 60- to 100-episode serialized mobile seasons (60–90 seconds per episode) engineered for mobile platforms (ReelShort, DramaBox, ShortTV, TikTok):

### A. Novel-to-Microdrama AIGC Pipeline (Joey Jia & ReelShort / Crazy Maple Studio)
* Industrialized the adaptation of serialized web novels into vertical drama seasons.
* Automated pipelines decompose 200 web-novel chapters into an 80-episode season, mapping character visual anchors, emotional peaks, and conversion paywalls programmatically.

### B. Multi-Agent Showrunner Architecture (InVideo & MCPlato Pattern)
* **Creative Producer Agent:** Maintains the master Show Bible as the immutable single source of truth.
* **Director / Storyboard Sub-Agents:** Spun up per episode to break the locked script into deterministic vertical shot lists.
* **DOP / Execution Agents:** Routes individual frames to image/video models using locked reference sheets for cast and locations before any compute is dispatched.

---

## 3. Structural Microdrama Methodologies: Retention & Framing

### A. The "3-7-21" & "3-15-30" Mathematical Retention Frameworks
* **0–3 Seconds (Kinetic Shock):** Mandatory visual collision, loud acoustic spike, or high-stakes physical confrontation to arrest swiping.
* **3–7 Seconds:** Explicit establishment of thematic stakes and personal jeopardy.
* **7–21 Seconds:** Escalating interpersonal conflict and tactical information withholding (Swain MRU stimulus-reaction loops).
* **Final 5 Seconds (Conversion Cliffhanger):** An abrupt, unresolved revelation, gunshot, or physical barrier terminating the generation to trigger in-app token purchases or ad views.

### B. The 500-Word Script Blueprint (Per 60–90s Episode)
* *0–150 words:* High-velocity opening hook.
* *150–400 words:* Dilemma escalation and emotional crisis.
* *400–500 words:* The cliffhanger freeze terminating the episode.

### C. The 20-60-20 Compositional Geometry (Vertical 9:16 Framing)
```
┌─────────────────────────────────────────┐  ▲
│ TOP 20%: Environmental hints, lighting, │  │ 20%
│ architectural context                   │  ▼
├─────────────────────────────────────────┤  ▲
│                                         │  │
│ MIDDLE 60%: The Emotional Core          │  │ 60%
│ - Tight framing on eyes                 │  │
│ - Facial micro-expressions              │  │
│ - Hand gestures & physical blocking     │  ▼
├─────────────────────────────────────────┤  ▲
│ BOTTOM 20%: Subtitles, hidden physical  │  │ 20%
│ clues (dropped key, drawn weapon), UI   │  ▼
└─────────────────────────────────────────┘
```
