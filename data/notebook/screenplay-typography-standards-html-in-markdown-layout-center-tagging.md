# Screenplay Typography Standards: HTML In-Markdown Layout & Center Tagging

A technical standard for rendering classic Hollywood script layout within Markdown-based environments (VS Code Preview, GitHub, static site generators).

---

## 1. The Screenplay Visual Layout Problem

Standard Markdown left-aligns all text, creating visual ambiguity between character speaker headers, parentheticals, stage directions, and spoken dialogue. Standard Hollywood script layout requires:
* Centered character cues.
* Centered parentheticals beneath the name.
* Indented/padded dialogue blocks narrower than the overall page boundaries.

---

## 2. Implementation Specifications

Because pure Markdown does not support alignment or paragraph margins natively, inline HTML is used:

### Syntax Structure:
```html
<p align="center"><b>CHARACTER NAME</b></p>
<p align="center"><i>(parenthetical delivery note)</i></p>
<p style="margin-left: 20%; margin-right: 20%;">Indented spoken dialogue block running narrower than stage directions.</p>
```

### Typographic Elements:
1. **Character Header:** `<p align="center"><b>CHARACTER NAME</b></p>`
2. **Parenthetical:** `<p align="center"><i>(delivery note)</i></p>`
3. **Dialogue Body:** `<p style="margin-left: 20%; margin-right: 20%;">Dialogue block</p>`
4. **Action & Stage Directions:** Standard Markdown italics `*Stage direction description*` (full width, left-aligned).

---

## 3. Environment & Compatibility Matrix

| Environment | Render Behavior | Status |
|---|---|---|
| **VS Code Markdown Preview** | Fully rendered inline HTML with centered cues and 20% margin indents | Native Support |
| **GitHub / GitLab Web Views** | Sanitized HTML renders clean layout | Supported |
| **Documentation Engines (Docusaurus, VitePress, Hugo)** | Renders HTML tags correctly | Supported |
| **Plain-Text Editors / CLI (`cat`, Nano, Vim)** | Displays raw HTML tags (`<p align="center">`) | Fallback / Raw Mode |
| **Automated LLM / Ingestion Parsers** | Easy regex stripping of `<p>` wrappers | Machine Parseable |