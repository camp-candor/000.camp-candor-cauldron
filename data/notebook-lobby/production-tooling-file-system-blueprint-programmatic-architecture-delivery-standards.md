# Production Tooling & File-System Blueprint: Programmatic Architecture & Delivery Standards

A systems architecture guide for structuring production file trees for automated tool parsing, manifest schemas, zero-padded asset tagging, and Netflix-grade delivery conventions.

---

## 1. Machine-Readable Manifests & Structured Data Hierarchy

When building automated pipeline tools, file structures must shift from human-navigated hierarchies to machine-queryable data layers. File-name string parsing is brittle; systems must read explicit JSON sidecars as sources of truth.

### Directory Manifest Architecture
```
s02e19/
├── manifest.csv                  ← Top-level delivery index indexing all assets + checksums
├── episode.json                  ← Global episode metadata (title, target res, runtime)
├── acts/
│   └── act1/
│       ├── act.json              ← Shot count, act target duration, status
│       └── shots/
│           └── sh0010/           ← Zero-padded shot folder (isolated container)
│               ├── shot.json     ← Frame duration, camera notes, audio cue pointers
│               ├── versions.json ← Audit trail and version history log
│               ├── working/      ← Layered source files (Krita .kra / excluded from git)
│               │   └── s02e19_sh0010_board_v001.kra
│               ├── exports/      ← Flattened timeline frames (.png)
│               │   └── s02e19_sh0010_board_v001.0001.png
│               └── archive/      ← Non-destructive superseded versions
├── _generated/                   ← Ephemeral/disposable data (thumbnails, waveform caches)
├── animatic/
│   ├── animatic.json
│   ├── s02e19_animatic_v003.mp4
│   └── xsheet/
└── deliverables/
    └── manifest.csv              ← Final external delivery package manifest
```

---

## 2. Core Tooling Primitives

1. **Shot-Level Isolation:** Every shot exists as its own directory containing dedicated metadata (`shot.json`), version logs (`versions.json`), working assets, and exports.
2. **Ephemeral Segregation (`_generated/`):** Any asset a pipeline script can reconstruct automatically (thumbnails, proxies, wave forms, render logs) lives under an underscore prefix and is completely disposable.
3. **Structured Version History (`versions.json`):**
   ```json
   {
     "current": 3,
     "history": [
       {"version": 1, "date": "2026-08-01", "author": "director", "note": "Initial board pass"},
       {"version": 2, "date": "2026-08-03", "author": "director", "note": "Re-cut timing on hold"},
       {"version": 3, "date": "2026-08-05", "author": "director", "note": "Locked for animatic"}
     ]
   }
   ```
4. **Stable Unique Identifiers:** Directory paths rely on immutable alphanumeric codes (`s02e19`, `sh0010`) rather than human-readable titles that fluctuate mid-production.

---

## 3. Netflix Delivery Standards & Naming Conventions

* **Episode Code Formatting:** Fixed digit notation: `sXXeYY` (e.g., `s02e19`). Regex-friendly and sortable.
* **Master Manifest Index (`manifest.csv`):** A single master manifest at the package root indexing every file, hash, and metadata tag to enable automated intake ingestion without tree crawling.
* **Zero-Padded String Delimitation:** Strict fixed-width padding on both versions and frames (`_v001`, `.0001.png`), ensuring standard alphabetical filesystem sorts match true timeline chronology.
* **Strict Legal Character Sets:** Restrict file names strictly to: `[a-zA-Z0-9._-]`. No whitespace, parentheses, or non-ASCII characters.
* **Color Space Encoding:** Archival frames encode working color spaces directly into metadata and file tails.

---

## 4. Software Container Formats: Open `.kra` vs. Proprietary `.psd` vs. Flat `.png`

* **Flat PNG (`.png`):** Lightweight, non-bloating, but terminal (destructive). Version history must be strictly tracked in metadata because layers cannot be dissected.
* **Photoshop PSD (`.psd`):** Proprietary, heavy RAM bloat, difficult to parse without commercial SDKs.
* **Krita Open Format (`.kra`):** An open, documented ZIP archive containing internal XML stacks and image layers.
  * *Advantage for Custom Pipelines:* Python daemons can natively unzip `.kra` files, inspect layer visibility, read notes, and extract thumbnail passes without external graphical dependencies.

---

## 5. Architectural Guardrails: Incremental Complexity

To prevent premature over-engineering:
* **The Minimal Viable Tool:** Start with `episode.json` + isolated shot folders + a CLI assembler script (`build-animatic`).
* **Reactive Expansion:** Introduce concurrency locks (`lock.json`), global schema validators (`_schema/status_enum.json`), and event logs only when real production friction demands them.
