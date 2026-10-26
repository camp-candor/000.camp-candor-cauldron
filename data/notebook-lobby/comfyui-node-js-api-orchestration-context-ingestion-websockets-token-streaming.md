# ComfyUI Node.js API Orchestration: Context Ingestion, WebSockets & Token Streaming

A technical engineering specification for automating ComfyUI narrative pipelines via Node.js: exporting JSON API schemas, dynamically injecting YAML Codex context, handling real-time WebSocket execution events, and streaming generated tokens.

---

## 1. Exporting and Formatting the ComfyUI API Schema

ComfyUI executes workflows via an HTTP and WebSocket API. The visual canvas maps directly to a flat JSON dictionary of nodes:
1. **Enable Dev Mode:** In ComfyUI Settings (gear icon), enable **"Enable Dev mode Options"**.
2. **Export API Format:** Click **Save (API Format)** to export `workflow_api.json`.
3. **Map Node IDs:** Identify the target input node ID (e.g., Primitive String `"4"` for prompt injection) and the target output node ID (e.g., Show Text `"12"` for capturing prose).

---

## 2. Dynamic YAML Codex Context Injection (`batch_generate.js`)

Decoupling Codex storage from the ComfyUI graph prevents node canvas clutter and ensures context is dynamically pruned to protect memory and token limits:

```
[ /codex/*.yaml ] ──► [ Node.js Context Builder (js-yaml) ] ──► [ workflow_api.json ] ──► [ ComfyUI HTTP :8188 ]
```

### Complete Implementation:
```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const COMFY_URL = 'http://127.0.0.1:8188';
const PROMPT_INPUT_NODE_ID = "4";
const TEXT_OUTPUT_NODE_ID = "12";

// Parses and compresses YAML entities into a lean prompt header
function buildContextPayload(entityFiles) {
    let contextBlock = "### ACTIVE SCENE CONTEXT ###\n";
    entityFiles.forEach(filename => {
        try {
            const fileContents = fs.readFileSync(`./codex/${filename}`, 'utf8');
            const data = yaml.load(fileContents);
            contextBlock += `\nENTITY: ${data.Type} - ${data['[STATIC CORE]'].Role}\n`;
            contextBlock += `CORE WOUND: ${data['[STATIC CORE]']['Core Psychological Wound']}\n`;
            
            const dynamic = data['[DYNAMIC STATE]'];
            contextBlock += `CURRENT OBJECTIVE: ${dynamic['Current Objective']}\n`;
            contextBlock += `PHYSICAL STATE: ${dynamic['Physical/Mental Condition']}\n`;
            contextBlock += `INVENTORY: ${dynamic.Inventory.join(', ')}\n`;
        } catch (e) {
            console.error(`[Warning] Failed loading ./codex/${filename}: ${e.message}`);
        }
    });
    return contextBlock + "\n\n";
}

async function generateScene(workflow, sceneData) {
    const contextInjection = buildContextPayload(sceneData.entities);
    const finalPrompt = `${contextInjection}### BEAT EXECUTION ###\n${sceneData.beat}`;
    
    workflow[PROMPT_INPUT_NODE_ID].inputs.string = finalPrompt;

    const queueRes = await fetch(`${COMFY_URL}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: workflow })
    });
    
    if (!queueRes.ok) throw new Error(`Queue failed: ${queueRes.statusText}`);
    const { prompt_id } = await queueRes.json();

    while (true) {
        const historyRes = await fetch(`${COMFY_URL}/history/${prompt_id}`);
        const historyData = await historyRes.json();
        if (historyData[prompt_id]) {
            const outputs = historyData[prompt_id].outputs;
            return outputs[TEXT_OUTPUT_NODE_ID]?.text?.[0] || outputs[TEXT_OUTPUT_NODE_ID]?.string?.[0];
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
}
```

---

## 3. Real-Time WebSocket Event Architecture

Polling `/history` every three seconds is inefficient and risks hanging on long generation queues. ComfyUI broadcasts execution events over WebSockets on `ws://127.0.0.1:8188/ws?clientId=[uuid]`:

### Core Event Types:
* `executing`: Fired when a node begins processing (contains `node` ID).
* `executed`: Fired when a node finishes; contains the actual generated output data in its payload, eliminating secondary HTTP history lookups.
* `execution_success`: Fired when the full graph concludes.
* `execution_error`: Broadcasts detailed Python tracebacks immediately on failures (e.g., CUDA OOM).

```javascript
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

async function generateSceneWithWebsockets(workflow, sceneBeat) {
    const clientId = uuidv4();
    const ws = new WebSocket(`ws://127.0.0.1:8188/ws?clientId=${clientId}`);

    return new Promise((resolve, reject) => {
        ws.on('open', async () => {
            workflow[PROMPT_INPUT_NODE_ID].inputs.string = sceneBeat;
            await fetch('http://127.0.0.1:8188/prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: workflow, client_id: clientId })
            });
        });

        ws.on('message', (data) => {
            const msg = JSON.parse(data);
            if (msg.type === 'executed' && msg.data.node === TEXT_OUTPUT_NODE_ID) {
                const text = msg.data.output?.text?.[0] || msg.data.output?.string?.[0];
                ws.close();
                resolve(text);
            }
            if (msg.type === 'execution_error') {
                ws.close();
                reject(new Error(msg.data.exception_message));
            }
        });
    });
}
```

---

## 4. Token Streaming Implementation (Typewriter Feedback & SSE)

While ComfyUI's core engine executes in blocks, custom LLM loader nodes (e.g., `ComfyUI-GGUF`, `ComfyUI-IF_AI_tools`) bypass blocking by broadcasting custom progress events during the inference loop:

```javascript
ws.on('message', (data) => {
    const message = JSON.parse(data);

    // 1. Trap Custom LLM Token Stream (e.g., 'llm_stream', 'text_progress', 'crystools.text')
    if (message.type === 'llm_stream') {
        if (message.data.node === TEXT_OUTPUT_NODE_ID) {
            const token = message.data.text || message.data.token || "";
            process.stdout.write(token); // Real-time typewriter output to terminal
            fullGeneratedText += token;
        }
    }

    // 2. Fallback: Nodes hijacking standard progress bar events
    if (message.type === 'progress' && message.data.text_chunk) {
        process.stdout.write(message.data.text_chunk);
        fullGeneratedText += message.data.text_chunk;
    }

    // 3. Close on execution completion
    if (message.type === 'executed' && message.data.node === TEXT_OUTPUT_NODE_ID) {
        ws.close();
        resolve(fullGeneratedText);
    }
});
```

* **Debug Trap for Discovery:** If tokens do not stream, log non-standard socket events to discover the exact custom event name emitted by the node pack:
  ```javascript
  if (!['executing', 'progress', 'executed'].includes(message.type)) {
      console.log("[DEBUG WS EVENT]:", message.type, message.data);
  }
  ```
* **Production Utility:** Trapping raw tokens allows piping local generations directly into Server-Sent Events (SSE) for web-based showrunner UIs or Cloudflare Workers edge bridges without request timeouts.
