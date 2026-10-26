# Local Narrative Studio Architecture: Novelcrafter & Ollama Private Inference Setup

A technical engineering specification for configuring a zero-telemetry, fully local writing environment integrating the Novelcrafter desktop client with Ollama local model inference.

---

## 1. System Philosophy: Local Private Inference

Setting up a local narrative studio provides complete privacy, zero telemetry, and independence from commercial API rate limits, third-party content moderation filters, and cloud retention policies.

* **Client Requirement:** Must use the **Novelcrafter Desktop App** (Electron) rather than the web browser version to circumvent browser Cross-Origin Resource Sharing (CORS) blocks on `localhost` loopback ports.
* **Inference Engine:** **Ollama** serving quantized open-weight models via an OpenAI-compatible HTTP API.

---

## 2. Infrastructure Setup & Endpoint Configuration

```
[ Novelcrafter Desktop Client ]
              │
              │ (OpenAI-compatible HTTP API on /v1)
              ▼
[ Localhost:11434/v1 (Ollama Inference Server) ]
              │
              ├── Qwen 2.5 14B/32B (Prose Drafting Engine)
              └── Gemma 2 9B / Llama 3 (Planning & Chat Engine)
```

### Step 1: Local Server Initialization
1. Launch the Ollama service on the local machine.
2. Pull required models optimized for creative text and instruction following:
   ```bash
   ollama pull qwen2.5:14b
   ollama pull gemma2:9b
   ```
3. Verify the local daemon is actively listening on `http://localhost:11434`.

### Step 2: Novelcrafter Connection Protocol
1. Open the Novelcrafter Desktop app and navigate to **Settings** $\longrightarrow$ **Connections**.
2. Click **Add Connection** and select **Custom / OpenAI-Compatible**.
3. Configure the connection parameters:
   * **Name:** `Ollama Local`
   * **Endpoint URL:** `http://localhost:11434/v1` *(The `/v1` suffix is mandatory for Novelcrafter's API parser).*
   * **API Key:** `ollama` *(Dummy key; required to satisfy client-side input validation).*
4. Click **Fetch Models** to populate downloaded local weights into the UI model selector.

---

## 3. Task-Specific Model Delegation

To optimize GPU VRAM utilization and generation throughput, different models are mapped to discrete creative tasks:

* **Prose Generation (The "Write" Engine):**
  * Assigned Model: High-parameter creative models (e.g., `Qwen 2.5 14B` or `32B`).
  * Function: Excels at complex narrative syntax, sensory grounding, character voice differentiation, and extended descriptive rendering.
* **Planning, Brainstorming & Antagonistic Chat:**
  * Assigned Model: Faster instruction-tuned models (e.g., `Gemma 2 9B`).
  * Function: Low-latency back-and-forth beat plotting, outline restructuring, and scene critique.

---

## 4. Context Window & VRAM Optimization Protocols

Commercial cloud APIs handle 100k+ token windows effortlessly; pushing large context payloads into local GPUs causes severe VRAM thrashing and slows token generation to single-digit tokens per second. Context injection must be tightly throttled:

1. **Previous Text Context Throttling:**
   * In Project Settings $\longrightarrow$ Context Window, reduce "Previous Text" to **~1,500 words**. This preserves immediate stylistic and temporal cadence without flooding the context window.
2. **Constrained Dynamic Codex Injection:**
   * Cap active entity injection to a maximum of **3 to 4 entity cards**.
   * Only inject characters, locations, or items physically present in the upcoming scene.
3. **The "@" Trigger Drafting Workflow:**
   * In the Novelcrafter planning view, write micro-beats using explicit mention tags:
     > `*@Silas Vance searches the desk while @Clara Ramos watches the gravel road.*`
   * The tag functions as a programmatic retrieval hook, instructing Novelcrafter to bundle only the relevant cards into the system prompt payload.
4. **Execution:**
   * Highlighting the beat and executing the generation compiles the system prompt, the retrieved entity cards, the trailing scene text, and the structured micro-beat into a single local API call executed on-device.
