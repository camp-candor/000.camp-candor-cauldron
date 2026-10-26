# Studio Asset Management: Standard Episodic Folder Architecture

A production directory blueprint engineered to prevent file bloat, separate working files from final deliverables, maintain non-destructive versioning, and structure assets by Act.

---

## 1. Directory Tree Schema

```
EPISODE_219_The_Garden_of_Rust/
│
├── 00_PRODUCTION_DOCS/
│   ├── Outline_v01.pdf
│   ├── ColorScript_v01.pdf
│   ├── Model_Sheets/
│   │   ├── Jack_Turnaround.psd
│   │   └── Gardener_Turnaround.psd
│   └── Notes/
│       └── Director_Notes_2026-08-08.txt
│
├── 01_STORYBOARDS/
│   ├── ACT_1/
│   │   ├── WORKING_FILES/          ← Raw raster canvases (3840x2160, 300 DPI) or vector files
│   │   │   ├── Shot001_v01.psd
│   │   │   ├── Shot002_v01.psd
│   │   │   └── ...
│   │   ├── EXPORTS/                ← Flattened PNGs/JPGs pulled into the animatic NLE timeline
│   │   │   ├── Shot001_v01.png
│   │   │   └── ...
│   │   └── ARCHIVE/                ← Superseded versions (retained, never deleted)
│   ├── ACT_2/
│   │   └── (same internal sub-structure)
│   ├── ACT_3/
│   │   └── (same internal sub-structure)
│   └── ACT_4/
│       └── (same internal sub-structure)
│
├── 02_ANIMATIC/
│   ├── PROJECT_FILES/              ← NLE project file (.prproj, .drp, .avp)
│   │   └── Ep219_Animatic.prproj
│   ├── AUDIO/
│   │   ├── Temp_VO/
│   │   ├── Temp_SFX/
│   │   └── Temp_Music/
│   ├── EXPORTS/                    ← Master animatic review cuts (1920x1080 Full HD)
│   │   ├── Ep219_Animatic_v01_1080p.mp4
│   │   ├── Ep219_Animatic_v02_1080p.mp4
│   │   └── Ep219_Animatic_LATEST_1080p.mp4
│   └── XSHEET/
│       └── Ep219_ActIII_Timing.xlsx
│
├── 03_ART_DIRECTION/
│   ├── Backgrounds/
│   │   ├── Layouts_BW/             ← Clean architectural/perspective line drawings
│   │   └── Color_Keys/             ← Final painted environmental keys
│   ├── Props/
│   └── Reference/                  ← Photographic, painting, and mood lookup assets
│
├── 04_DELIVERABLES/                ← SACRED REPOSITORY: Only final approved studio assets live here
│   ├── PitchPacket_PRINT/
│   │   └── Ep219_PitchPacket_300dpi.pdf
│   └── Animatic_FINAL/
│       └── Ep219_Animatic_LOCKED.mp4
│
└── 05_CORRESPONDENCE/
    └── Notes_and_Approvals/
```

---

## 2. Core Architectural Principles

1. **Working vs. Exports vs. Archive Quarantine:**
   * Multi-layered working canvases (`.PSD`, `.CLIP`) remain strictly inside `WORKING_FILES/`.
   * Only flattened image exports (`.PNG`, `.JPG`) are imported into animatic editing timelines, preventing project file corruption and memory bloat.
2. **Strict Incremental Versioning (`_v01`, `_v02`):**
   * Files are never overwritten in place. Superseded versions move into `ARCHIVE/`.
   * The tag `_LATEST` or `_LOCKED` is reserved strictly for formal client- or executive-facing deliverables in folder `04_DELIVERABLES/`.
3. **Partitioning by Act:**
   * Dividing storyboards by Act prevents single project files from swelling to unmanageable multi-gigabyte sizes and allows multiple storyboard artists to work concurrently without merge conflicts.
4. **Resolution Boundaries:**
   * `300 DPI` tags are strictly confined to `PitchPacket_PRINT/`.
   * All animation and storyboard directories maintain pure pixel dimensions (`3840x2160` working canvas, `1920x1080` animatic export).