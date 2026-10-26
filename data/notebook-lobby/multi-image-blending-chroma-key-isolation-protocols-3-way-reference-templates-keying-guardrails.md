# Multi-Image Blending & Chroma-Key Isolation Protocols: 3-Way Reference Templates & Keying Guardrails

A specialized generative diffusion and multimodal prompt engineering specification establishing mathematical weighting protocols for multi-image synthesis, chroma-key isolation (#00FF00), skin hue shift countermeasures against green-spill, and the standardized 3-input (Dominant / Accent / Style Anchor) prompt template.

---

## 1. Principles of Conceptual Image Merging vs. Layered Overlay

When combining reference plates in multimodal diffusion models, standard prompting frequently defaults to lazy 50/50 transparency overlays or double-exposure collages. True morphological synthesis requires explicit structural constraints:

1. **Explicit Asymmetric Weighting ($X\% / Y\%$):** Naming a dominant reference at higher ratios forces the model to adopt its spatial composition, skeleton, and structural silhouettes, while subordinating the secondary image to superficial details, textures, or accents.
2. **Anti-Collage Negatives:** Explicitly prohibiting "overlay", "collage", and "double exposure" forces neural representations to morph and fuse geometry rather than sandwiching layers.
3. **Lighting & Perspective Coherence:** Mandating unified lighting vectors, camera focal length, and anatomical scale prevents the hybrid from reading as two mismatched halves stitched together.

---

## 2. Chroma-Key Isolation Engineering (`#00FF00` Standards)

Generating cutouts and game sprites against a solid backdrop for subsequent pipeline ingestion (OBS, After Effects, Remotion, Premultiplied Alpha) requires neutralizing default diffusion tendencies:

* **Strict Flatness Mandate:** Diffusion models naturally introduce ambient occlusion, cast shadows, depth vignettes, and color gradients to backdrops. Prompts must explicitly mandate: `pure green, #00FF00, evenly lit, zero shadows, zero gradients, zero texture, zero vignette`.
* **The Green-Spill / Rim-Light Hazard:** Diffusion models tend to simulate environmental bounce light, painting green rim-lighting along the subject's contours. This ruins algorithmic chroma-keying in downstream video compositing. Prompts must enforce: `light the subject separately from the backdrop, with zero green spill, zero green rim-light, and clean high-contrast edges`.
* **Hue-Shift Countermeasure (The Green Subject Paradox):**
  * *The Trap:* If a character's anatomical design naturally utilizes green skin, scales, or algae-covered chitin, chroma keyers cannot differentiate between the character's surface and the screen.
  * *The Fix:* Force a mandatory hue shift away from the green spectrum—substituting deep olive-brown, desaturated gray-green leaning brown, or teal-leaning cyan—while preserving the underlying normal-map relief, muscle definition, and scarring.

---

## 3. Two-Image Blend Prompt Templates

### Template A: Weighted Concept Blend (Standard Green Screen)
```text
Blend Image 1 and Image 2 into a single cohesive subject, weighted [X]% Image 1 / [Y]% Image 2. At this ratio, prioritize [Image 1's / Image 2's] overall form, color palette, and structural elements as the dominant foundation, while integrating the other image's distinct visual traits (details, texture, style, or mood) as the secondary influence. Merge the two subjects genuinely — shapes, textures, and features should morph and combine intelligently rather than appear layered or collaged. Maintain coherent lighting, perspective, and scale across the merged subject.

Place the final merged subject against a solid chroma-key green background (pure green, #00FF00, evenly lit, no shadows or gradients on the backdrop, no texture or vignette). The subject itself should be lit naturally and separately from the background, with clean, well-defined edges suitable for keying/compositing — avoid green spill or color bleed onto the subject. Do not add any additional background elements, props, or environment; the entire frame outside the subject must be flat green.
```

### Template B: Creature Morph (Fashionless / Hue-Shifted for Keying)
```text
Blend Image 1 and Image 2 into a single cohesive subject, weighted [X]% Image 1 / [Y]% Image 2. At this ratio, prioritize [Image 1's / Image 2's] overall form, color palette, and structural elements as the dominant foundation, while integrating the other image's distinct visual traits (details, texture, style, or mood) as the secondary influence. Merge the two subjects genuinely — shapes, textures, and features should morph and combine intelligently rather than appear layered or collaged. Maintain coherent lighting, perspective, and scale across the merged subject.

No clothing or fashion elements: the final subject should be unclothed/fashionless — no shirts, jackets, armor, fabric, accessories, or stylized outfit pieces. If either source image includes clothing, discard it and extend the subject's natural skin, texture, or surface material (scales, musculature, markings, etc.) in its place instead. The design should read as a raw, unclothed creature/figure, not a costumed one.

Skin tone constraint: if the resulting merged subject would naturally have green-toned skin, scales, or surface coloring, shift that hue to a non-green tone instead — for example deep olive-brown, gray-green desaturated toward brown, or teal-leaning blue-green — while preserving the value/contrast and texture detail (scarring, pitting, muscle definition, etc.) of the original design. This is required for clean chroma-key separation.

Place the final merged subject against a solid chroma-key green background (pure green, #00FF00, evenly lit, no shadows, gradients, or texture on the backdrop). Light the subject naturally and separately from the background, with clean, well-defined edges suitable for keying/compositing, and no green rim-light or color spill onto the subject.
```

---

## 4. The 3-Way Reference Architecture (Dominant / Accent / Style Anchor)

When synthesizing game characters or animation assets where style, geometry, and environment must match an established asset pack, input roles are partitioned across three reference slots:

```
[ Image 1: Character A ] ──► DOMINANT FORM (Skeletal structure, primary silhouette, bulk)
[ Image 2: Character B ] ──► ACCENT DETAIL (Facial features, secondary textures, scars)
[ Image 3: Character C ] ──► STYLE & ENVIRONMENT ANCHOR (Art style, line weight, exact chroma green)
```

### Standardized 3-Way Template:
```text
INPUTS: Use [Image 1] as the dominant reference (Character A). Use [Image 2] as the accent reference (Character B). Use [Image 3] as the style and environmental reference (Character C, on Green Screen).

CORE CONCEPT: A powerful fused character, a hybrid of Character A and Character B, depicted entirely in the [illustration style — e.g. "gritty, dark comic book" / "lineless animated"] style of [Image 3].

SCENE & MOOD: The fused character stands in a [pose — e.g. "three-quarter hero"] pose on the exact same solid, vibrant chroma key green screen background of [Image 3], with a [expression — e.g. "direct, intense"] gaze. The atmosphere is defined by the illustrative art style.

CONCEPTUAL PARAMETER 1 — Blending bias of visual tokens: [X]% form from Character A, [Y]% details from Character B. Integrate specific details from [Image 3], including [retained details — e.g. "cloth patches, pockmarks/holes on the surface, glowing eyes"].

CONCEPTUAL PARAMETER 2 — Color mixing: Apply a [color description — e.g. "deep chalky sickly yellowish-green-grey"] fusing wash to the entire character form (skin, clothing, etc.), unifying the structure while preserving other patches and details.
```

---

## 5. Compositing & Pipeline Execution Notes

* **Post-Processing Export Directives:** When generating plates intended for automated cutouts, append: `Export/render at high resolution with sharp subject edges and minimal anti-aliasing blur against the green backdrop.`
* **Reference Anchoring over Abstract Prompts:** Prompting `on the exact same background of Image 3` anchors the latent color distribution to existing reference pixels far more reliably than generic natural-language hex codes.
* **Preserving Body Pigmentation vs. Clothing:** Clearly delineate biological markings (pigment spots, chest plates, bio-luminescence) from discarded clothing layers to prevent models from stripping anatomical features during costume-removal passes.
