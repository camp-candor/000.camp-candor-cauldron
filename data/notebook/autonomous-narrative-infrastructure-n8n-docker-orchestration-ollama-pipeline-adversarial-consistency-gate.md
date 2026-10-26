# Autonomous Narrative Infrastructure: n8n Docker Orchestration, Ollama Pipeline & Adversarial Consistency Gate

An engineering guide to orchestrating local Ollama models with n8n inside Docker to automate worldbuilding, enforce JSON-to-YAML schema validation, and run deterministic adversarial continuity gating.

---

## 1. Container Infrastructure & Host Networking

The primary technical hurdle when running n8n in Docker alongside host-based Ollama instances is network routing (`localhost` inside a Docker container addresses the container itself, not the host machine).

### Docker Compose Architecture (`n8n-pipeline/docker-compose.yml`)

```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    container_name: n8n-local
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=America/New_York
      - NODE_FUNCTION_ALLOW_BUILTIN=* # Permits fs and path modules in Code nodes
    volumes:
      - n8n_data:/home/node/.n8n
      # Mounts local host folder to emit and read Codex cards directly
      - ./codex_output:/data/codex
    extra_hosts:
      # Exposes host machine network interface across Linux, macOS, and Windows
      - "host.docker.internal:host-gateway"
volumes:
  n8n_data:
```

### Host Networking & Ollama Binding
By default, Ollama binds strictly to `127.0.0.1`, ignoring bridge network traffic from Docker containers.

1. **Windows:** Close Ollama from system tray. Set environment variable `OLLAMA_HOST=0.0.0.0:11434` and restart.
2. **Linux (systemd):** Edit `/etc/systemd/system/ollama.service.d/override.conf` (or via `sudo systemctl edit ollama.service`):
   ```ini
   [Service]
   Environment="OLLAMA_HOST=0.0.0.0:11434"
   Environment="OLLAMA_ORIGINS=*"
   ```
   Execute `sudo systemctl daemon-reload && sudo systemctl restart ollama`.
3. **n8n Credential Configuration:**
   * In n8n (`http://localhost:5678`), configure Ollama credentials.
   * **Base URL:** `http://host.docker.internal:11434` (never use `localhost`).

---

## 2. The Core Entity Drafting Pipeline

Converts a raw creative prompt into a standardized YAML Codex card with zero human copy-pasting:

```
[ Webhook / Manual Trigger ] ──► { name: "Silas Vance", concept: "Swamp coroner..." }
               │
               ▼
[ Ollama Chat Node (qwen2.5:14b) ] ──► Enforces JSON schema & negative constraints
               │
               ▼
[ Code Node: JSON -> YAML Converter ] ──► Formats Static Core vs Dynamic State
               │
               ▼
[ Write to File Node ] ──► Commits silas_vance.yaml to /data/codex/
```

### System Prompt Configuration
```text
You are an adversarial story systems architect. 
Generate a character dossier strictly following this JSON schema. Do not output any markdown formatting, preambles, or postscripts—only valid JSON.

JSON Schema:
{
  "type": "Character",
  "name": "Full Name",
  "static_core": {
    "role": "Narrative function",
    "core_wound": "Past trauma driving their avoidance",
    "primary_desire": "External objective",
    "speech_cadence": "Sentence length, dialect, vocabulary rules"
  },
  "dynamic_state": {
    "current_objective": "Immediate scene goal",
    "physical_condition": "Injuries, fatigue, physical constraints",
    "epistemic_ledger": ["Known facts", "False assumptions"],
    "inventory": ["Item 1", "Item 2"]
  }
}

Constraint: Avoid melodramatic clichés. Dialogue cadence must specify concrete speech mechanics (e.g., 'Clipped, laconic, omits pronouns, monosyllabic').
```

### The JSON-to-YAML Code Node (JavaScript)
```javascript
const rawText = $input.first().json.output || $input.first().json.response;
const cleanJson = rawText.replace(/```json|```/g, '').trim();
const data = JSON.parse(cleanJson);

const yamlContent = `Type: ${data.type}
Name: "${data.name}"

[STATIC CORE]
  Role: "${data.static_core.role}"
  Core Psychological Wound: "${data.static_core.core_wound}"
  Primary Desire: "${data.static_core.primary_desire}"
  Speech Cadence: "${data.static_core.speech_cadence}"

[DYNAMIC STATE]
  Current Objective: "${data.dynamic_state.current_objective}"
  Physical/Mental Condition: "${data.dynamic_state.physical_condition}"
  Epistemic Ledger:${data.dynamic_state.epistemic_ledger.map(fact => `\n    - "${fact}"`).join('')}
  Inventory:${data.dynamic_state.inventory.map(item => `\n    - "${item}"`).join('')}
`;

const filename = `${data.name.toLowerCase().replace(/\s+/g, '_')}.yaml`;

return {
  json: {
    filename: filename,
    content: yamlContent
  }
};
```

---

## 3. The Adversarial Continuity Gate

To prevent newly generated characters or factions from violating existing world rules, timeline anchors, or tech levels, an automated evaluation gate intercepts drafts before they are written to disk:

```
[ Draft Generated (JSON) ]
            │
            ▼
[ Code Node: Ingest & Compile Lore ] ◄── Reads all *.yaml from /data/codex
            │
            ▼
[ Ollama Node: Adversarial Auditor ] ── Evaluates contradictions (temp: 0.0)
            │
            ▼
        [ IF Node ] ── ($json.passed === true)
          ├── TRUE  ──► [ Convert to YAML ] ──► [ Commit to /data/codex/ ]
          └── FALSE ──► [ Alert Webhook / Auto-Refactor Loop ]
```

### Step 1: Ingesting & Aggregating World Lore
```javascript
const fs = require('fs');
const path = require('path');
const codexDir = '/data/codex';
let compiledLore = "";

try {
  const files = fs.readdirSync(codexDir);
  files.forEach(file => {
    if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      const filePath = path.join(codexDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      compiledLore += `\n--- SOURCE FILE: ${file} ---\n${content}\n`;
    }
  });
} catch (error) {
  compiledLore = "No existing lore files found. This is the first entity.";
}

return {
  json: {
    drafted_character: $input.first().json,
    existing_lore: compiledLore.trim()
  }
};
```

### Step 2: The Adversarial Auditor Node (HTTP / Ollama)
* **Endpoint:** `POST http://host.docker.internal:11434/api/generate`
* **Model:** `gemma2:9b` or `qwen2.5:14b` (Temperature: `0.0`, Format: `json`).
* **Audit Prompt:**
  ```text
  You are a rigid story consistency editor and logic auditor.

  Compare the PROPOSED CHARACTER against the ESTABLISHED WORLD LORE. Identify any direct factual contradictions, timeline paradoxes, magic/technology violations, or impossible faction alliances.

  ESTABLISHED WORLD LORE:
  {{ $json.existing_lore }}

  PROPOSED CHARACTER DRAFT:
  {{ JSON.stringify($json.drafted_character) }}

  Respond strictly with a JSON object matching this schema:
  {
    "passed": boolean,
    "contradictions": ["list of specific contradictions, or empty if none"],
    "suggested_revisions": ["actionable fixes to eliminate contradictions"],
    "validated_character": { ...the original drafted_character JSON object... }
  }
  ```

### Step 3: Branching & Error Mitigation
1. **JSON Validation:** Parse raw string output into typed JSON.
2. **If Node Evaluation:** Checks if `$json.passed === true`.
   * **True Branch:** Passes to YAML converter and commits cleanly to `/data/codex/{{ $json.filename }}`.
   * **False Branch:** Routes to an alerting webhook (Discord/Telegram) or an automated refactoring loop feeding `$json.contradictions` back into Ollama with instructions to rewrite the violating fields.

---

## 4. Token & Context Optimization for Growing Repositories

Dumping dozens of raw YAML cards into a single audit prompt risks context degradation and slows inference on low-VRAM GPUs.

1. **Tag-Based Scoped Ingestion:** Add domain tags to character concept inputs (e.g., `tags: ["timber_mill", "coroner"]`). The Ingestion Code Node filters and loads only `.yaml` files bearing intersecting tags.
2. **Pre-Compiled Axiom Ledgers:** Maintain a single, condensed `world_axioms.yaml` containing absolute negative laws (e.g., *"Combustion engines do not exist"*, *"The levee broke in 1912"*). Passing only this core axiom file to the auditor reduces token overhead by 80% while retaining hard boundary enforcement.
