# Closed Captioning & Subtitle Standards: SRT Engineering, Timed Text Foley & NLP Evasion

A technical manual detailing SubRip (.srt) caption engineering, broadcast-grade timed text sound effects conventions (DCMP / Netflix standards), and caption management to bypass YouTube speech-to-text NLP false positives.

---

## 1. The Subtitle Ingestion Pipeline & NLP Defense

Automated speech-to-text parsers frequently mistake character grunts, groans, screams, and combat audio for racial slurs or extreme profanity, triggering automated demonetization. 

### The Mandatory 5-Step Ingestion Workflow:
1. **Prepare & Validate SRT:** Export captions in UTF-8 without BOM. Verify strictly chronological timestamps and non-overlapping timecodes.
2. **Open Subtitles Panel:** In YouTube Studio $\longrightarrow$ Content $\longrightarrow$ target video $\longrightarrow$ Subtitles.
3. **Upload with Timing:** Select Add Language $\longrightarrow$ Upload file $\longrightarrow$ With timing $\longrightarrow$ select `.srt` file.
4. **Publish Creator Subtitles:** Review line synchronization and hit **Publish** (status shifts to *Published by Creator*).
5. **Delete Automated Caption Track:** Locate `English (Automatic)` (or equivalent), click Options (three dots), and select **Delete**.
   * *Critical Benefit:* Deleting the machine-generated track completely removes automated transcription errors from YouTube search indexing and ad-safety scans.

---

## 2. SRT Syntax & Structure Rules

A compliant SubRip file requires four mandatory components per block:

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

### Syntax Specifications:
* **Sequence Counter:** Standalone positive integer starting at 1, incrementing sequentially (`1, 2, 3...`).
* **Timestamp Delimiters:** `HH:MM:SS,mmm --> HH:MM:SS,mmm` (Hours:Minutes:Seconds,Milliseconds). Milliseconds **must use a comma (`,`)**, never a period. Arrow separator requires space padding: ` --> `.
* **Text Formatting:** Maximum 2 lines per subtitle event; maximum 37 characters per line for mobile readability.
* **Block Separation:** Exactly one blank line between caption blocks.
* **File Encoding:** Strictly **UTF-8 without BOM**. Encodings like UTF-16, ANSI, or Windows-1252 corrupt punctuation into mojibake (e.g., `donâ€™t`).

---

## 3. Broadcast Sound Effect & Foley Conventions (DCMP & Netflix Standards)

### Enclosure & Typography
* **Square Brackets:** Enclose all Foley, ambient noise, and non-verbal vocalizations in `[ ]`.
* **Sentence-Case Capitalization:** Capitalize only the first letter or proper nouns:
  * *Correct:* `[heavy metal door slams]`
  * *Incorrect:* `[HEAVY METAL DOOR SLAMS]` or `[Heavy Metal Door Slams]`
* **No Comic Onomatopoeia:** Transcribe acoustic quality and origin rather than comic book sound words:
  * Use `[blunt impact]`, not *[POW!]* or *[WHAM!]*.
  * Use `[energy blast charges]`, not *[ZAPPPP]*.
  * Use `[metallic clatter]`, not *[CLANG]*.

### Combat Foley & Active Verbs
Pair materials with active acoustic verbs (`[blade scrapes concrete]`, `[wood splinters]`, `[flesh impacts]`).

#### The Non-Visual Rule:
Only caption Foley that conveys narrative information unavailable visually:
* Sound originates off-screen (`[gunshot echoes off-screen]`).
* Sound reveals an obscured physical outcome (`[armor cracks]`, `[blade parries]`, `[magazine clicks empty]`).
* Visuals are masked by camera shake, smoke, or silhouette cuts.
* If a punch lands clearly center-frame, captioning `[punches]` is redundant clutter.

---

## 4. Vocalizations & Speech Hygiene

* **Clinical Action Over Phonetics:** Describe physiological actions:
  * Use `[sharp exhale]`, not *huff*.
  * Use `[strained grunt]`, not *urgggh*.
  * Use `[agonized groan]`, not *aaargh*.
* **Speaker Disambiguation:** When characters grapple off-screen, identify the actor: `[Adince grunts with effort]`, `[Pulpwood snarls]`.
* **Spell Out Regional Slang:** NLP models misread heavy phonetic dialect as slurs. Spell out grammatical words even if the voice track delivers a heavy contraction.

---

## 5. Layered Audio & Dialogue Priority

* **Dialogue Precedence:** Spoken dialogue always takes visual priority over background Foley.
* **Two-Line Priority Rule:** If an impact sound occurs simultaneously with dialogue, place the Foley indicator on line 1 and dialogue on line 2:
  ```plaintext
  [metal pipe strikes]
  Back away from the ledge!
  ```

---

## 6. Algorithmic NLP Neutrality

Natural Language Processing algorithms parse subtitle text for violent triggers. Substitute graphic/emotional adjectives with clinical, technical terms:
* Use `[wet impact]` instead of *[brutally smashed]*.
* Use `[blade slices]` instead of *[mutilation sound]*.
* Use `[stifled gasp]` instead of *[strangled to death]*.
