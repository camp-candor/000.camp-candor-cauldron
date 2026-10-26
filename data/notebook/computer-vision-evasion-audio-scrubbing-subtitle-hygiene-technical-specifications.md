# Computer-Vision Evasion, Audio Scrubbing & Subtitle Hygiene: Technical Specifications

A technical engineering specification covering computer-vision classifier evasion for action animation, acoustic audio scrubbing, SubRip (.srt) subtitle formatting rules, and metadata sanitation.

---

## 1. Computer-Vision Palette Tweaks & Visual Classifier Evasion

Automated content moderation models rely on convolutional neural networks (CNNs) and vision transformers (ViTs) trained on real-world news, trauma, and medical imagery to detect blood, gore, and violent trauma via color space, fluid texture, and edge geometry.

### Algorithmic Countermeasures:
* **Shifting the Fluid Spectrum:** Classifiers trigger intensely on high-saturation arterial red in the HSV spectrum paired with fluid dynamics. Shifting impact fluids to **black mechanical oil, neon cyan, glowing purple, or midnight black** invalidates gore classifiers while maintaining visual impact.
* **Monochrome & Inverted Impact Frames:** Review bots extract keyframes across sudden motion transitions and cuts. Replacing the physical moment of impact with a **1- to 3-frame inverted flash, pure black-and-white silhouette, or high-contrast speed lines** delivers visceral kinetic punch without rendering biological wound geometry on scanned frames.
* **Abstracting Wound Geometry:** Computer vision detects biological edges (jagged tears, white bone highlights bordered by deep red margins, organic viscera). Character damage should be rendered via clean geometric linework scratches, stylized shadow gradients, or cross-hatching rather than anatomical cuts.

---

## 2. Acoustic Scrubbing & Automated Caption Traps

Classifiers evaluate audio streams and speech-to-text transcripts independently from visual frames:
* **Foley Replacement:** Visceral, hyper-realistic Foley (breaking bones, wet tearing of flesh, squelching) triggers machine-learning sound classifiers even over stylized cartoon art. Mute realistic bone snaps in favor of punchy, bass-heavy, stylized impacts.
* **Auto-Generated Caption Risk:** Automated speech-to-text models routinely misinterpret combat grunts, guttural gasps, physical groans, or heavy regional dialects as severe profanity or racial slurs.
* **The Countermeasure:** Upload a verified manual SubRip (`.srt`) file and explicitly **delete the automated caption track** to eliminate unverified machine transcriptions from search indexing and ad-safety audits.

---

## 3. SubRip (.srt) Formatting & Syntax Standards

### Required Syntax Structure:
```plaintext
1
00:00:01,200 --> 00:00:03,500
Get behind the barricade!

2
00:00:03,850 --> 00:00:05,100
[heavy panting]

3
00:00:05,400 --> 00:00:07,900
We don't have enough ammo!
Move, now!
```

### Syntax & Structural Laws:
1. **Sequence Number:** Standalone integer incrementing sequentially (`1`, `2`, `3...`).
2. **Timestamp Format:** `HH:MM:SS,mmm --> HH:MM:SS,mmm` (Hours:Minutes:Seconds,Milliseconds). Use a comma (`,`) before milliseconds—never a period—separated by space-padded ASCII arrows `-->`.
3. **Typography & Readability:** Maximum 2 lines per subtitle card; under 37 characters per line.
4. **Separation:** Exactly one blank line separating each numbered subtitle block.
5. **Encoding:** **UTF-8 without BOM**. Encodings like UTF-16, ANSI, or Windows-1252 corrupt apostrophes and quotes into garbled text (e.g., `donâ€™t`).

---

## 4. Subtitle Style Guidelines: Audio & Combat Foley (DCMP & Streaming Standard)

Sound effects must be descriptive, objective indicators of essential narrative audio that cannot be gathered from visuals alone:

### Typography & Formatting:
* **Enclosure:** Enclose sound effects, ambient audio, and non-verbal vocalizations in square brackets `[ ]`. Never mix brackets and parentheses.
* **Case:** Lowercase text inside brackets, capitalizing only the first letter or proper nouns: `[heavy metal door slams]`.
* **No Comic Onomatopoeia:** Describe acoustic source and texture rather than spelling sounds:
  * Use `[blunt impact]`, NOT `[POW!]` or `[WHAM!]`.
  * Use `[energy blast charges]`, NOT `[ZAPPPP]`.
  * Use `[metallic clatter]`, NOT `[CLANG]`.

### Combat Foley Rules:
* Only caption off-screen or visually obscured audio (`[gunshot echoes off-screen]`, `[armor cracks]`, `[blade parries]`). Do not caption obvious on-screen center-frame punches.
* **Clinical Non-Speech Descriptions:**
  * Use `[sharp exhale]`, not `*huff*`.
  * Use `[strained grunt]`, not `*urgggh*`.
  * Use `[agonized groan]`, not `*aaargh*`.
* **NLP Safety & Policy Neutrality:** Replace emotionally graphic verbs with neutral technical descriptors:
  * Use `[wet impact]` instead of `[brutally smashed]`.
  * Use `[blade slices]` instead of `[mutilation sound]`.
  * Use `[stifled gasp]` instead of `[strangled to death]`.

---

## 5. Chapter Markers & Metadata Hygiene

* **Timestamp Neutrality:** Scanners audit chapter labels as timestamped admissions of visual content. Flagged names like `03:45 Simo Kills The Guard` or `06:12 The Beheading` trigger immediate automated frame scraping.
  * *Flagged:* `Brutal Knife Fight`, `Execution Scene`, `The Massacre`.
  * *Safe:* `Warehouse Confrontation`, `The Mill Encounter`, `Showdown`, `Escaping the Basin`.
* **Thumbnail OCR Scanning:** Machine vision executes Optical Character Recognition on thumbnails. Avoid violent text overlays (`"HE DIES?!"`, `"BLOODBATH"`).
* **Tag & Description Hygiene:** Avoid baiting tags (`"gore"`, `"bloody fight"`, `"violent cartoon"`). Focus metadata on technical craft: `"indie animation"`, `"2D action"`, `"sakuga"`, `"fight choreography"`, `"character animation"`.

---

## 6. Standard Operating Procedure: Publishing Verified Captions

1. **Prepare & Validate:** Export captions as `.srt` in UTF-8 without BOM. Ensure zero overlapping timestamps.
2. **Navigate in Studio:** Go to `YouTube Studio` $\longrightarrow$ `Content` $\longrightarrow$ Select Video $\longrightarrow$ `Subtitles`.
3. **Upload with Timing:** Click `Add` under Subtitles $\longrightarrow$ Select `Upload file` $\longrightarrow$ Choose `With timing` $\longrightarrow$ Upload `.srt`.
4. **Publish:** Verify timeline synchronization and click **Publish** (status becomes *Published by Creator*).
5. **Delete Automated Track:** Locate `English (Automatic)`, click the options menu (three dots), and select **Delete**. This permanently removes the unverified machine transcription from algorithmic ad-safety and NLP scanners.
