# Technical Storyboard Standards: Resolutions, Canvas Sizing & RAM Bloat

A technical guide detailing aspect ratios, working canvas resolutions, export pipelines, pixel density standards, and software architecture (raster vs. vector) in modern animation production.

---

## 1. The Aspect Ratio Foundation

Aspect ratio dictates cinematic framing and composition before drawing begins:
* **16:9 (1.77:1):** The modern television and streaming standard (*Primal*, *Samurai Jack* Season 5).
* **2.35:1 / 2.39:1 (Cinemascope):** The standard for widescreen theatrical action (*Mad Max: Fury Road*, Pixar features).
* **4:3 (1.33:1):** Classic standard definition television; frequently manipulated by Genndy Tartakovsky via letterbox bands within the 4:3 frame to evoke widescreen samurai aesthetics.

---

## 2. Export Resolution vs. Working Canvas (The 2x Rule)

### The Export Standard: Full HD (1080p)
* **Standard Resolution:** 1920 x 1080 pixels (1080p).
* **Why Not 4K Animatics:** Animatics prioritize rapid turnaround and lightweight file sizes. 4K animatics inflate multi-gigabyte video files and slow down edit-bay iterations (exporting a 4-frame trim takes an hour in 4K vs. minutes in 1080p). 1080p remains the industry standard for animatic editorial.

### The Working Canvas: The "2x Rule" (Overscan Protection)
Drawing at export resolution (1920x1080) destroys camera flexibility. Aggressive camera pushes (e.g., Tartakovsky's 300% "Fast Truck-In" from a wide landscape to a character's eyes) stretch pixels, causing digital blur.

* **The Rule:** The working canvas must be at least double the resolution of the final export.
* **Working Canvas Spec:** **3840 x 2160 (4K UHD)** at **300 DPI**.
* **Utility:** Provides safe area and pixel overhead, allowing the editor to digitally scale, pan, or tilt up to 200% without loss of line sharpness or edge clarity.

---

## 3. Pixel Density & Physical Print Packets

* **Display Reality:** DPI/PPI does not alter monitor pixel grids.
* **Pitch & Review Packets:** When pitch boards or beat boards are printed on high-gloss paper for studio executives or composers, low DPI (72 DPI) produces jagged lines.
* **Standard:** Working project files must maintain **300 DPI** to ensure print sharpness across pitch decks and corkboard review sessions.

---

## 4. Software Architecture: Raster Bloat vs. Resolution-Independent Vectors

A 22-minute action episode requires 350 to 500+ main storyboard panels (often exceeding 1,000 drawings with A/B/C sub-poses).

### Raster Tools (Photoshop, Procreate):
* **Mechanism:** Saves discrete pixel data per layer.
* **Failure Mode:** Hundreds of 4K, 300 DPI layers cause massive RAM bloat, stylus latency, gigabyte-scale files, and software crashes.
* **Mitigation:** Subdivide episodes into separate Act files (Act I, Act II, Act III).

### Vector Tools (Toon Boom Storyboard Pro):
* **Mechanism:** Lines are calculated as mathematical vectors between points rather than stored pixels.
* **Advantage:** Resolution-independent. Drawings can be magnified 10,000% without pixelation, while keeping full episode file sizes under 200 MB.
* **Canvas Setting:** Can be set directly to 1920 x 1080, as mathematical vectors do not require 2x overscan canvases to maintain camera move sharpness.