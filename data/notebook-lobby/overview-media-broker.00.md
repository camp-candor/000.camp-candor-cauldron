# **Overview: Media-Broker.00**

[https://gemini.google.com/app/5fe0cb62a0c250a9](https://gemini.google.com/app/5fe0cb62a0c250a9)

*User prompt: ok it is time to start building the \[media-broker\] can you provide me with an overview of this important part of the tech stack*

## **Response: Overview of the media-broker**

The **media-broker** (classified under **POD-12: System Middleware / Infrastructure**) is the headless execution daemon running directly on **Rig 2** (The Shared GPU Foundry).

It serves as the bridge between high-level upstream intent and the physical GPU silicon. While **Rig 1** (worker-sower-engine) manages CPU-bound narrative AST compilation, dialogue clocking, and Remotion assembly, and the Cloudflare Edge (**edge-director** / ShotCoordinatorDO) manages queues, leases, and client multiplexing, the media-broker operates downstream on port 3000 to drive headless ComfyUI (127.0.0.1:8188) without manual intervention.

┌───────────────────────────┐      ┌───────────────────────────┐  
│     Rig 1 (Conductor)     │      │   Edge Multiplexer (DO)   │  
│   • worker-sower-engine   ├─────►│   • edge-director         │  
│   • AST compilation       │      │   • Hardware Mutex / FIFO │  
└───────────────────────────┘      └─────────────┬─────────────┘  
                                                 │ Persistent WSS / Outbound Tunnel  
                                                 ▼  
┌──────────────────────────────────────────────────────────────────────────────┐  
│ RIG 2: media-broker DAEMON (:3000)                                           │  
│ ┌──────────────────────┐   ┌──────────────────────┐   ┌────────────────────┐ │  
│ │ Lease & Heartbeat    │   │ Modular API Template │   │ Asset Ingress/     │ │  
│ │ Manager (Async Timer)│   │ Hydration (JSON)     │   │ R2 Egress (S3 SDK) │ │  
│ └──────────┬───────────┘   └──────────┬───────────┘   └────────▲───────────┘ │  
│            │                          │                        │             │  
│            │ IPC / REST (Port 8188\)   ▼                        │             │  
│            └────────────────► \[ Headless ComfyUI \] ────────────┘             │  
│                               • Turn 1: Text GGUF  ──► POST /free            │  
│                               • Turn 2: Audio TTS  ──► POST /free            │  
│                               • Turn 3: Wan Video  ──► POST /free            │  
└──────────────────────────────────────────────────────────────────────────────┘

## **Core Architectural Responsibilities**

### **1\. Hardware Abstraction via the Adapter Pattern**

The media-broker wraps local execution in an abstract RenderProvider interface:

export interface RenderProvider {  
  executeShot(payload: SpokeExecutionPayload): Promise\<string /\* r2\_asset\_url \*/\>;  
}

> * **LocalComfyProvider:** Routes generic incoming shot payloads (SpokeExecutionPayload) to the local consumer GPU.  
> * **Serverless Cloud Fallback:** Decouples the rest of the studio from Rig 2's specific setup. Upstream artists never know what GPU is installed; the daemon can switch dynamically to a RunPodProvider or cloud cluster without changing upstream conductor code.

### **2\. Dynamic Workflow Ingestion & Parameter Injection**

ComfyUI does not run unmanaged Python scripts or monolithic files. Instead, media-broker maintains a local library of allowlisted API templates exported from ComfyUI Dev Mode (e.g., wan\_greenscreen\_plate.json, flux\_matte\_background.json):

> * **Validation & Sandboxing:** Rejects arbitrary external graph payloads, accepting only strongly typed JSON specs (prompts, seeds, target frame counts, LoRA paths).  
> * **Memory Hydration:** Loads the workflow template from local NVMe, injects the parameters directly into the target node keys in memory, and submits the compiled graph to POST \[http://127.0.0.1:8188/prompt\](http://127.0.0.1:8188/prompt).

### **3\. Native ComfyUI Multi-Modality & Turn-Based VRAM Eviction**

The pipeline completely eliminates external inference runtimes like Ollama or vLLM, consolidating text, speech, and video generation under ComfyUI’s unified computational graph.

To run a multi-stage pipeline on a single consumer GPU (e.g., 24 GB VRAM) without CUDA Out-Of-Memory (OOM) errors, media-broker executes an Assistant Director runtime loop using **explicit turn-based memory eviction**:

\[ Ingest Payload \]  
       │  
       ▼  
\[ Step 1: Text AST (Qwen GGUF) \] ──────────► POST /free (Evict Model)  
       │  
       ▼  
\[ Step 2: Audio Stems (ComfyUI TTS) \] ─────► POST /free (Evict Model)  
       │ (Calculate Locked Frames: ceil(duration\_ms / 1000 \* 24))  
       ▼  
\[ Step 3: Video Diffusion (Wan 2.2) \] ─────► POST /free (Evict Model)  
       │ (100% VRAM Dedicated to \#00FF00 Plate)  
       ▼  
\[ Direct R2 Cloud Egress \]

> * **Stage-Level Batching:** When processing scenes, the broker groups passes by modality (all text → all audio → all video) to eliminate expensive PCIe weight thrashing.  
> * **Forced Eviction:** Between turns, it calls POST \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) with { unload\_models: true, free\_memory: true } and polls nvidia-smi to confirm VRAM has returned to baseline before loading the next checkpoint.

### **4\. Distributed Leases, Fencing Tokens, and Heartbeats**

To prevent split-brain execution when multiple artists share Rig 2:

> * **The 30-Second Lease:** When edge-director assigns a job to media-broker, it grants a lease with a monotonic fencingToken (Epoch *N*).  
> * **Thread-Isolated Heartbeats:** While ComfyUI generates latents, media-broker runs an isolated background interval sending BROKER\_HEARTBEAT every 10 seconds. This keeps the edge watchdog timer alive without stalling under heavy disk I/O.  
> * **Zombie Mitigation:** If Rig 2 loses network connection for \>30 seconds, the edge revokes the lease and increments the epoch to *N*\+1. When the partitioned broker finishes and submits its payload with the old token *N*, the edge rejects the stale write.

### **5\. Telemetry Relay & Local Sentinel Tracking**

> * **WebSocket Tapping:** Connects to ws://127.0.0.1:8188/ws to consume raw ComfyUI execution events.  
> * **Normalized Forwarding:** Converts internal node progress (step counts, k-sampler percentages) into standard BROKER\_PROGRESS packets routed back up to the edge DO, updating the showrunner's dashboard in real time.  
> * **Completion Detection:** Watches for ComfyUI's completion sentinel ({ executing: { node: null } }) to trigger egress.

### **6\. Asset Egress & Content-Addressed Storage (Cloudflare R2)**

> * **Integrity Validation:** Validates the rendered .mp4 character plate on the local scratch disk (checking frame durations via ffprobe and asserting against empty-string hashes).  
> * **Content Addressing:** Hashes the file using SHA-256 (plates/sha256\_{hash}.mp4). Because files are identified by their contents, writes are immutable and cannot overwrite existing assets.  
> * **Zero-Egress Distribution:** Streams the artifact directly to the project's Cloudflare R2 bucket using @aws-sdk/client-s3. Once finished, it emits BROKER\_COMPLETE with the signed URL to the edge DO, allowing Rig 1's Remotion viewport to download the asset with \$0.00 egress bandwidth fees.

---

*User prompt: is the \[media-broker\] always running*

Response: The **media-broker** process itself runs continuously as a background service daemon on **Rig 2** (supervised via PM2 or systemd), but **it does not keep the GPU active or models loaded in VRAM when idle**.

The system cleanly separates daemon availability from GPU compute:

### **1\. The Host Daemon: Always Running (Listening & Ready)**

> * **Process Level:** It runs continuously as a Node.js process listening on port 3000 (and maintains an outbound connection/tunnel to the Cloudflare Edge DO or private mesh).  
> * **Resource Footprint:** When no jobs are rendering, its CPU and RAM consumption is negligible (a lightweight Node.js event loop).  
> * **Connection Readiness:** Because the edge queue (edge-director / ShotCoordinatorDO) assigns leases dynamically, the broker must be online to receive execution payloads (EXECUTE\_LEASE / EXECUTE\_JOB) and respond to heartbeats.  
> * **Supervision:** It is managed by a process manager such as PM2 (pm2 start dist/broker.js \--name "media-broker") to survive reboots, unhandled exceptions, and host restarts.

### **2\. The GPU & Models: Idle and Evicted When Not Rendering**

While the media-broker Node.js process stays alive, the hardware it controls does not remain under load:

> * **Zero Ghost Weights:** Between jobs (and between individual turns of a job), media-broker calls POST \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) to dump LLM, TTS, and diffusion weights out of VRAM.  
> * **Baseline Idle:** When idle, physical GPU VRAM returns to baseline (\>21 GB free on a 24 GB card), and tensor cores draw minimal idle power.  
> * **Process Recycling:** To eliminate PyTorch memory allocator fragmentation over long runs, media-broker automatically recycles (gracefully restarts) the headless ComfyUI child process every 25 shots or at stage boundaries without killing the parent broker daemon.

### **3\. Graceful Offline Handling (SIMULATION\_ONLY)**

If Rig 2 is powered off or media-broker is stopped:

> * The rest of the studio does not crash.  
> * The upstream edge-director detects that no broker sockets are connected and switches to **SIMULATION\_ONLY** mode.  
> * Upstream narrative ASTs, canon mutations, and character injuries continue advancing in the relational database (Cloudflare D1), queueing unrendered shots into an append-only backlog until media-broker boots up again.

---

*User prompt: i thought it was supposed to connect to the \[edge director\] directly*

Response: It **does** connect directly to the edge-director.

The confusion likely stems from the direction of the connection and port 3000:

### **1\. media-broker Initiates an Outbound Connection Upward to edge-director**

media-broker does not wait for the edge to connect down to it over the public web. Instead, it **dials outward directly to edge-director's WebSocket endpoint** over Cloudflare Tunnel (cloudflared):

\# media-broker/.env  
EDGE\_DO\_WS\_URL=wss://series-edge-orchestrator.\<account\>.workers.dev/ws?role=broker

// Inside media-broker (src/broker.ts)  
function connectToEdgeDO() {  
  const ws \= new WebSocket(process.env.EDGE\_DO\_WS\_URL\!);

  ws.on("open", () \=\> {  
    console.log("\[Broker\] Connected directly to edge-director Queue DO");  
  });

  ws.on("message", (raw) \=\> {  
    // Listens for EXECUTE\_JOB payloads dispatched from the DO  
  });  
}

Because Rig 2 initiates this connection outward to the edge:

> * **Zero Open Firewall Ports:** Port 8188 (ComfyUI) and port 3000 are never exposed to the public internet.  
> * **No Direct Artist Ingress:** Traveling artists running Rig 1 never connect to Rig 2 directly; they talk to edge-director, which relays work through the WebSocket that media-broker holds open.

### **2\. Why Port 3000 Exists**

Port 3000 on Rig 2 is solely for **local network and loopback control**:

> * **Local Fast-Path / LAN Testing:** When testing on the same local subnet without touching the edge, Rig 1 can target \[http://192.168.\](http://192.168.)x.x:3000 directly\[cite: 2, 3\].  
> * **Local Healthchecks & PM2 Monitoring:** Host monitoring scripts and daemon supervision tools query \[http://127.0.0.1:3000/health\](http://127.0.0.1:3000/health) to confirm the Node.js process is alive before checking VRAM levels.

### **The Topology in Production**

\[ Artist Laptop (Rig 1\) \] ──► (Inbound WSS / HTTPS)  
                                      │  
                                      ▼  
                         ┌───────────────────────────┐  
                         │   edge-director (CF DO)   │  
                         └─────────────▲─────────────┘  
                                       │   
                 media-broker maintains persistent   
                 OUTBOUND WebSocket connection up to DO  
                                       │  
┌── Rig 2 ─────────────────────────────┴──────────────────────────────┐  
│                                                                     │  
│  \[ cloudflared \] ◄────────────── \[ media-broker \] (:3000 loopback)   │  
│                                           │                         │  
│                                    (127.0.0.1 IPC)                  │  
│                                           ▼                         │  
│                                  \[ ComfyUI \] (:8188)                │  
└─────────────────────────────────────────────────────────────────────┘

media-broker **does** maintain a direct, persistent WebSocket connection to edge-director. It just establishes that socket **from the inside out**.

---

*User prompt: why does it need to use a tunnel; why can it not just directory connect to a web socket used by the edge director*

Response: The reason the system specifies a tunnel—and why the network layout looks like it does—comes down to **which side is reaching out to which**, and **how network security works when machines are on private home or studio networks**.

### **1\. media-broker CAN Connect Directly Outward to edge-director**

media-broker **can and does** connect directly to the edge director's WebSocket URL:

const ws \= new WebSocket("wss://edge-director.yourstudio.workers.dev/ws?role=broker");

When media-broker on Rig 2 dials **outbound** to Cloudflare's public edge:

> * A tunnel daemon (cloudflared) is **not strictly required** just to open that client socket.  
> * Standard HTTPS/WSS client requests leave your router naturally via regular NAT traversal and establish an encrypted, persistent connection to the edge Worker / Durable Object.

So if Rig 2 only ever acts as an outbound client connecting up to edge-director, it can dial edge-director directly over standard wss://.

### **2\. Why a Cloudflare Tunnel Is Recommended**

Where the tunnel comes into play is when you consider **bidirectional access**, **strict zero-trust security**, and **direct ingress to Rig 2's services**:

#### **A. Eliminating Inbound Port Forwarding (The ComfyUI Threat)**

If an edge Worker or remote artist ever needs to reach *down* into Rig 2 (for instance, to hit ComfyUI's REST API at port 8188 directly, or to reach media-broker's management port 3000 from outside the house):

> * Opening ports 8188 or 3000 on a home router exposes ComfyUI to the public internet.  
> * ComfyUI has **no native authentication or authorization**. Anyone scanning your public IP could submit Python payloads, manipulate queues, or read files off Rig 2's drive.  
> * A Cloudflare Tunnel (cloudflared) creates an encrypted outbound pipe that routes inbound traffic from your private domain (e.g., \[https://rig2.yourstudio.com\](https://rig2.yourstudio.com)) directly to 127.0.0.1:8188 or 127.0.0.1:3000 **without opening any firewall ports** on your router.

#### **B. Zero Trust Service Token Authentication**

By placing Rig 2 behind a Cloudflare Tunnel, you lock access behind Cloudflare Zero Trust. Only requests carrying valid signed CF-Access-Client-Id and CF-Access-Client-Secret service tokens can communicate with Rig 2\.

#### **C. Handling Dynamic Home IPs and CGNAT**

If Rig 2 sits on a residential internet connection:

> * Most home connections do not have static public IP addresses.  
> * Many modern ISPs use Carrier-Grade NAT (CGNAT), making standard port forwarding completely impossible.  
> * The tunnel daemon maintains persistent outbound control channels back to Cloudflare's edge, meaning Rig 2's private IP can shift without breaking the connection.

### **Direct WebSocket vs. Tunnel Ingress**

Mode 1: Outbound Socket to DO (No Tunnel Needed)  
\[ media-broker on Rig 2 \] ──(Outbound standard WSS)──► \[ edge-director DO \]  
(Broker dials out, holds the socket open, and pulls jobs directly)

Mode 2: Cloudflare Tunnel (Zero Trust Ingress)  
\[ edge-director or Rig 1 \] ──(HTTPS/WSS)──► \[ Cloudflare Edge \]  
                                                    │ (Encrypted Tunnel Pipe)  
                                                    ▼  
                                            \[ cloudflared on Rig 2 \]  
                                                    │ (127.0.0.1 IPC)  
                                                    ▼  
                                            \[ media-broker / ComfyUI \]

> * If your model is **media-broker connects outward as a client to edge-director and keeps the socket open**, you **can just connect directly to wss://...** using standard Node.js ws without configuring cloudflared.  
> * You only need the tunnel if you want the Cloudflare Edge, the Astro dashboard, or remote artists to be able to make **inbound requests directly into Rig 2's ports** over the internet securely.

---

*User prompt: why not just include password protection on the websocket itself*

Response: Password-protecting the WebSocket (for instance, passing a pre-shared key or bearer token in the headers or connection query string) addresses **application-level authentication**, but it does not solve the physical network and operating system vulnerabilities that the tunnel and middleman architecture are specifically designed to eliminate.

The design uses an outbound tunnel and the edge architecture to solve several critical structural problems:

### **1\. The Direct ComfyUI Threat Surface (Arbitrary Python & Filesystem Traversal)**

If Rig 2 is reached directly over the public internet, you must open an inbound port on your router (e.g., forwarding WAN port 8188 or 3000 to Rig 2).

> * **Native ComfyUI has zero auth:** ComfyUI’s internal aiohttp server exposes raw execution routes (/prompt, /upload/image, /history) with no native authentication, password mechanism, or rate limiting.  
> * **Remote Code Execution (RCE):** ComfyUI allows workflows to reference custom nodes, dynamically execute Python logic, and write files to the host filesystem.  
> * If someone discovers your open port and IP address, an unauthenticated request straight to http://\<your-ip\>:8188/prompt bypasses your WebSocket script entirely and gives an attacker arbitrary execution access to the host machine.

A **Cloudflare Tunnel (cloudflared)** eliminates this by keeping **all inbound ports closed**. Rig 2 initiates an outbound connection over Cloudflare's private edge, ensuring Rig 2 has no open listeners visible to public port scanners.

### **2\. Residential Internet Constraints (CGNAT & Shifting IPs)**

Even with password protection on the socket:

> * Most home or non-enterprise studio connections run behind dynamic public IPs or **CGNAT (Carrier-Grade NAT)**.  
> * Under CGNAT, your router does not have a unique, reachable public IPv4 address, making standard port forwarding physically impossible from outside the home network.  
> * An outbound tunnel traverses NAT automatically because the connection originates inside your private LAN and connects upward to the cloud.

### **3\. Sockets Do Not Prevent Hardware Collisions (CUDA OOMs)**

A password validates *who* is connecting, but it does nothing to control *when* or *how* work touches the GPU silicon:

> * If Artist A and Artist B both have the password and submit video generation tasks at the same time, direct sockets would attempt concurrent allocations in PyTorch.  
> * Consumer hardware (e.g., 24 GB VRAM) cannot run concurrent diffusion passes and immediately crashes with a CUDA Out-Of-Memory fault.  
> * This is why the edge needs a single-threaded mutex (ShotCoordinatorDO). The edge gatekeeper serializes execution into a FIFO queue and only dispatches one shot at a time down to the broker.

### **4\. Laptop Drops and Network Flakiness**

If a traveling artist connects directly to a password-protected WebSocket on Rig 2 and closes their laptop lid or hits a Wi-Fi deadzone:

> * The direct TCP connection breaks.  
> * Node.js drops the socket, and ComfyUI's rendered asset is either orphaned or the progress stream is permanently lost.  
> * With the Cloudflare Durable Object in the middle, the edge holds the render lease and state machine. Rig 2 completes the render, uploads the .mp4 to Cloudflare R2, and when the artist opens their laptop 20 minutes later, the DO replays the state log and serves the asset link.

### **The Recommended Middle Ground**

If you want simplicity and don't want Cloudflare Zero Trust:

> 1. **If it's just you traveling with a single laptop:** Skip Cloudflare entirely and use **Tailscale**. It creates an encrypted, peer-to-peer WireGuard mesh where you connect straight to ws://100.x.y.z:3000 securely, with no port forwarding and no public exposure.  
> 2. **If multiple artists share the GPU over the public internet:** Use the **Cloudflare Tunnel \+ Edge DO**. It combines edge-level authentication (Service Tokens/JWTs) with hardware mutex locks, keeps your router's firewall completely shut, and protects ComfyUI from public exploit.

---

*User prompt: {{FOCUS: 1\. Hardware Abstraction via the Adapter Pattern}} /extreme-details*

Response: The media-broker implements the **Hardware Abstraction via the Adapter Pattern**, acting as a decoupled bridge between the upstream narrative intent (decided by the orchestrator on Rig 1\) and the physical hardware execution (ComfyUI on Rig 2 or external cloud endpoints).

This pattern is fundamental to the system because it ensures that **Rig 1 remains entirely agnostic to the physical hardware it is commanding.** The orchestrator simply emits a generalized intent, and the media-broker (often referred to as the spoke-daemon or rig2-broker) handles the complex, device-specific implementation.

Here is an extreme-detail breakdown of how this abstraction is designed, executed, and scaled:

### **1\. The Uniform Ingress Contract (SpokeExecutionPayload)**

The core of the abstraction pattern is that upstream artists and systems never interact directly with ComfyUI's complex JSON DAGs or care about node IDs, memory management, or GPU constraints.

Instead, the orchestration host (Rig 1\) transmits a single, standardized, strongly-typed contract to the media-broker. This payload describes *what* is needed, not *how* to render it.

// Shared Contract: SpokeExecutionPayload.ts  
export interface SpokeExecutionPayload {  
  sceneId: string;  
  shotId: string;  
  renderType: 'WAN\_VIDEO\_PLATE' | 'FLUX\_MATTE' | 'INPAINT\_REPAIR';  
  targetFrames: number;  
  positivePrompt: string;  
  loraTag: string;  
  seed: number;  
}

By enforcing this boundary, the media-broker ensures that if ComfyUI nodes are updated, or if the studio switches entirely to a different rendering engine, the upstream worker-sower-engine requires **zero code rewrites**.

### **2\. The RenderProvider Polymorphic Interface**

Inside the media-broker, execution logic is wrapped in a polymorphic RenderProvider interface. This interface takes the standard SpokeExecutionPayload and promises to return a finalized asset URL, abstracting away the entire rendering lifecycle.

// rig2-broker/src/interfaces/RenderProvider.ts  
export interface RenderProvider {  
  executeShot(payload: SpokeExecutionPayload): Promise\<string /\* r2\_asset\_url \*/\>;  
}

This interface allows the media-broker to dynamically route jobs to different hardware backends based on availability, cost, or configuration, acting as a "Smart Compute Broker".

### **3\. Step A: Local Execution (LocalComfyProvider)**

Currently, the studio operates on the **Local Hardware Foundry** model, where rendering is performed for \$0.00 on Rig 2's local consumer GPU. The media-broker implements this via the LocalComfyProvider.

When a payload arrives, the LocalComfyProvider performs the following abstraction steps:

> 1. **VRAM & Dependency Auditing:** Validates that necessary models (e.g., the specific loraTag from the payload) exist on Rig 2's local NVMe scratch disk. If missing, it uses s5cmd to pull them from Cloudflare R2 before execution.  
> 2. **Dynamic Workflow Assembly:** It maps the abstract renderType (e.g., WAN\_VIDEO\_PLATE) to a specific, headless API template exported from ComfyUI (e.g., wan\_plate\_api.json).  
> 3. **Parameter Injection:** It injects the targetFrames, positivePrompt, and seed directly into the targeted node IDs within the JSON template in memory.  
> 4. **Hardware Dispatch:** It POSTs the fully compiled graph to the local headless ComfyUI daemon at \[http://127.0.0.1:8188/prompt\](http://127.0.0.1:8188/prompt).  
> 5. **Telemetry & Egress:** It listens to local WebSockets (ws://127.0.0.1:8188/ws) for progress events, intercepts the final .mp4 output, hashes it, pushes it to Cloudflare R2 via the AWS SDK, and returns the public asset URL.

### **4\. Step B: Zero-Friction Cloud Migration (RunPodProvider)**

The true power of this Adapter Pattern is realized when the studio needs to scale. If multiple artists queue heavy batches or Rig 2 is offline, the system must burst to the cloud.

Because of the RenderProvider interface, scaling to cloud execution touches **zero lines of code on Rig 1**. You simply activate the RunPodProvider within the media-broker:

// rig2-broker/src/providers/RunPodProvider.ts  
export class RunPodProvider implements RenderProvider {  
  async executeShot(payload: SpokeExecutionPayload): Promise\<string\> {  
    const response \= await fetch(\`https://api.runpod.ai/v2/\${process.env.RUNPOD\_ENDPOINT\_ID}/runsync\`, {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json',  
        'Authorization': \`Bearer \${process.env.RUNPOD\_API\_KEY}\`  
      },  
      body: JSON.stringify({  
        input: {  
          workflow: resolveWorkflow(payload.renderType),  
          target\_frames: payload.targetFrames,  
          prompt: payload.positivePrompt,  
          seed: payload.seed  
        }  
      })  
    });

    const result \= await response.json();  
    return result.output.asset\_url; // Directly returns R2 output URL  
  }  
}

Furthermore, the media-broker can act as an intelligent dispatcher, matching the workload to the most cost-effective RunPod Serverless GPU tier:

> * A BACKGROUND\_MATTE payload might be routed to a budget L4 instance.  
> * A heavy WAN\_VIDEO\_DIFFUSION payload is automatically routed to a 24GB RTX 4090 endpoint.  
> * ENTERPRISE\_BATCH workloads can target high-bandwidth A100s.

### **Summary**

The Adapter Pattern within the media-broker creates a clean, hybrid layer. It accepts a declarative intent (SpokeExecutionPayload) and handles the complex, imperative reality of GPU execution—whether that means managing VRAM flushes on a local RTX card via LocalComfyProvider or spinning up ephemeral A100 containers via RunPodProvider.

---

*User prompt: {{FOCUS: 2\. Dynamic Workflow Ingestion & Parameter Injection}} /extreme-details*

Response: ComfyUI executes generative workflows via a Directed Acyclic Graph (DAG). When exported from the interface in "API Format," the visual metadata—such as canvas positions, node colors, and wire routing—is entirely stripped away. This leaves a clean, topological schema represented as a flat JSON dictionary.

Instead of treating ComfyUI as an interactive application, the media-broker (and the upstream worker-sower-engine) treats it as a blind execution target, programmatically building and injecting parameters into these JSON graphs before dispatching them.

Here is an extreme-detail breakdown of how this ingestion, injection, and dynamic synthesis is engineered.

### **1\. The Base Mechanism: JSON Template Hydration**

The core of the execution model is that the local ComfyUI daemon on Rig 2 does not hold pre-compiled workflows in memory, nor does it decide which pipeline to run.

> * **Template Library:** The media-broker maintains a local library of modular, headless API templates on disk, such as wan\_greenscreen\_plate.json or flux\_matte\_background.json.  
> * **Memory Injection:** When an execution payload arrives via the Cloudflare edge, Node.js parses the target JSON template into memory. It then navigates the JSON dictionary to mutate specific input keys. For example, it injects the prompt text into the CLIPTextEncode node (workflow\["6"\].inputs.text \= promptText), calculates a randomized integer for the KSampler seed (workflow\["3"\].inputs.seed), and binds the precise frame count calculated from upstream text-to-speech math.  
> * **The Graph as the Payload:** The orchestrator does not trigger a remote script; it submits the fully hydrated graph dictionary directly to ComfyUI's REST endpoint via POST /prompt. The ComfyUI daemon simply deserializes the 40KB JSON blob it received in the request body, hydrates the required weights, executes the nodes, and outputs the resulting media.

### **2\. Dynamic Graph Synthesis (The DAG as an AST)**

Relying on hand-exported JSON templates with hardcoded node IDs creates a brittle runtime. To scale, the pipeline abandons static JSON files entirely, treating the ComfyUI API configuration as an Abstract Syntax Tree (AST) constructed programmatically by a typed compiler.

> * **Monotonic Node ID Allocation:** Splicing subgraphs together frequently causes ID collisions. The graph compiler uses a strict monotonic counter to allocate collision-free *O*(1) node IDs as it builds the adjacency list.  
> * **Conditional Subgraph Splicing:** The compiler assembles the graph dynamically based on directorial intent. If a scene specifies dual-character interaction, the compiler automatically injects regional conditioning nodes and chained LoRA loaders, bounding each character adapter to its specific half of the frame. If an invariant flag denotes localized damage, it splices a masked latent inpainting subgraph into the flow.  
> * **Hardware-Targeted Transpilation:** The compiler generates distinct execution graph variants based on the target physical hardware. When compiling for the local 24 GB consumer card on Rig 2, it transpiles model loaders into memory-efficient GGUF formats and inserts explicit /free VRAM cleanup triggers between nodes. When compiling for a cloud-based RunPod A100 runner, it switches to unquantized FP16 samplers and enables concurrent batch processing.

### **3\. Compile-Time Socket Typing and Validation**

ComfyUI natively models graph edges with coarse types (e.g., LATENT, IMAGE, MODEL). Out of the box, it cannot detect a latent family mismatch, such as attempting to route a 4-channel SDXL latent into a 16-channel Wan 2.1 DiT sampler.

> * **The Introspected Node Registry:** The compiler does not rely on static, hardcoded socket tables. At container build time, the system queries the live ComfyUI instance via /object\_info to extract the exact inputs, outputs, and class definitions of all installed custom nodes. This node\_registry.json becomes a versioned build artifact.  
> * **Latent Compatibility Contracts:** The graph compiler enforces an intermediate typing contract against this registry. It verifies channel depth and spatial downsampling factors (e.g., 8× spatial ×4× temporal for video) to guarantee that encoders, samplers, and decoders are mathematically compatible before any GPU memory is allocated.  
> * **Structural Linting:** Before emitting the final workflow\_api.json, the compiler executes a structural lint to confirm every referenced node ID exists, output types match input sockets, and the topological sort remains acyclic via Tarjan's or Kahn's algorithms.

### **4\. Automated Schema Repair**

The most common failure mode in custom ComfyUI architectures is custom node drift: an upstream maintainer updates a Python repository, renaming an input parameter (e.g., model\_name to ckpt\_name), which instantly breaks all upstream templates referencing that node.

To solve this, the graph synthesis engine leverages automated schema repair. When a node update crashes a render with a socket mismatch, the system routes the Python error log and the workflow JSON to an automated coding agent (Jules) operating in a sandboxed VM. The agent reads the INPUT\_TYPES() directly from the updated Python source code, refactors the JSON builder keys to match the new interface, verifies the fix in a headless test harness, and commits the repaired workflow back to the repository.

---

*User prompt: {{FOCUS: 3\. Native ComfyUI Multi-Modality & Turn-Based VRAM Eviction}} /extreme-details*

Response: To operate a multi-modal generative studio on a single consumer GPU (e.g., a 24 GB workstation card), the media-broker implements a strict, turn-based memory eviction architecture that completely eliminates external runtimes like Ollama or vLLM. By unifying text, audio, and video synthesis exclusively under ComfyUI’s native Directed Acyclic Graph (DAG), the media-broker gains absolute control over the VRAM lifecycle.

Here is the exhaustive mechanical breakdown of how Rig 2 manages hardware contention without triggering CUDA Out-Of-Memory (OOM) exceptions.

### **1\. The Monolithic Collision vs. The Anti-Ollama Paradigm**

The core hardware constraint on Rig 2 is spatial. A 14B Qwen LLM requires roughly 9 to 10 GB of VRAM for structured JSON decoding. Synthesizing speech via TTS models (CosyVoice or XTTSv2) demands 4 to 6 GB. Finally, temporal video diffusion using Wan 2.2 claims 16 to 22 GB of scratchpad memory.

Attempting to run an Ollama daemon in the background alongside ComfyUI creates a fatal collision: ComfyUI's dynamic cache manager cannot evict memory held by an external OS process, resulting in an instant CUDA OOM crash when the video model attempts to allocate its latent space.

The solution is the **Anti-Ollama Paradigm**. All text generation, grammatical linting, and speech synthesis are executed as native ComfyUI nodes (e.g., ComfyUI-GGUF). Because ComfyUI is the sole software package with a lock on the GPU, it has total awareness of every tensor in memory and can cleanly dump them.

### **2\. The Sequential Turn-Based Flush**

The media-broker Node.js daemon acts as a local Assistant Director, slicing the job into three distinct child graphs and forcing hard memory flushes between them.

> 1. **Child Graph A (Text & AST):** ComfyUI loads the Qwen 2.5 14B GGUF weights (∼9 GB). It evaluates the scene logic, emits the dialogue\_ast.json, and halts.  
> 2. **The Hard Eviction:** The media-broker issues an HTTP POST to \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) with the payload { unload\_models: true, free\_memory: true }. This cleans out the LLM weights and frees the memory buffers.  
> 3. **Child Graph B (Acoustic Timing):** ComfyUI loads the local TTS node (∼4 GB), synthesizes the .wav stems, runs the internal math to lock the integer frame budget, and outputs the timing manifest.  
> 4. **The Second Eviction:** The media-broker again calls POST /free to drop the audio weights.  
> 5. **Child Graph C (Temporal Video Diffusion):** With the GPU completely vacated, 100% of the physical 24 GB VRAM is safely claimed by Wan 2.2 and character LoRAs to render the uncompressed greenscreen plate (\#00FF00) at full precision.

### **3\. Stage-Level Batching (Eliminating PCIe Thrashing)**

While the turn-based flush prevents crashes, executing the Text \-\> Audio \-\> Video cycle on a *per-shot* basis introduces a massive I/O bottleneck. Transferring 33+ GB of varied model weights across PCIe lanes takes 10 to 25 seconds per full cycle. Over a 20-shot episode, this naive thrashing burns 5 to 8 minutes purely on memory swapping.

To solve this, the media-broker amortizes the hydration penalty by **batching by stage** rather than by shot:

> * **Stage 1:** Load the LLM once. Process *all* scene ASTs in the queue.  
> * **Stage 2:** Flush VRAM. Load the TTS model once. Synthesize *all* audio stems for the scene.  
> * **Stage 3:** Flush VRAM. Load Wan 2.2 once. Consecutively render *all* locked-frame video plates.

### **4\. Verifiable Memory Hygiene and Polling**

Calling ComfyUI's /free endpoint is an asynchronous request. If the media-broker immediately dispatches the next heavy diffusion graph before the memory is physically reclaimed by the OS, PyTorch will crash.

To guarantee safety, the media-broker enforces a polling lock. After calling /free, it actively polls ComfyUI's /system\_stats or inspects nvidia-smi via a child process. The broker will not dispatch the next stage until it verifies that free VRAM has returned to the measured baseline ( \>21 GB available on a 24 GB card).

### **5\. Defeating PyTorch Cache Fragmentation**

Over multi-hour production runs, PyTorch’s caching allocator naturally accumulates memory fragmentation. Even if nvidia-smi reports sufficient "free" memory, the GPU may not have a contiguous block large enough to allocate the massive 3D attention matrices required by video diffusion, resulting in a delayed, unexpected OOM.

To combat this, the media-broker tracks execution history and implements **Process Recycling**. Every 25 shots, or at the boundary of major production stages, the broker gracefully restarts the entire headless ComfyUI child process, entirely destroying the PyTorch context and guaranteeing a pristine VRAM state for the next batch.

### **6\. The Ultimate Optimization: CPU Drafting**

While Rig 2 can technically run the entire pipeline sequentially, the most efficient configuration removes the LLM from Rig 2 entirely. By running the drafting LLMs (14B/32B via llama.cpp) natively on Rig 1's CPU/RAM, the massive LLM load/evict cycle is decoupled from the shared GPU. This reserves Rig 2's VRAM exclusively for heavy TTS and video diffusion, preventing the multi-artist drafting loop from locking up the rendering foundry.

---

*User prompt: {{FOCUS:4. Distributed Leases, Fencing Tokens, and Heartbeats}} /extreme-details*

Response: The management of distributed execution leases via fencing tokens, heartbeats, and time-authoritative Durable Objects represents the foundational concurrency control mechanism within the pipeline. This pattern prevents "split-brain" execution, mitigates hardware locking conflicts (CUDA OOM), and ensures storage integrity across local GPUs and cloud runners.

Here is an extreme-detail breakdown of the mechanical implementation, edge failure handling, and fencing architecture.

### **1\. The Hazard: The Split-Brain Zombie Runner**

The primary distributed systems hazard when orchestrating remote rendering is the **Split-Brain Zombie Problem**.

If Rig 2 (the local media-broker) initiates a heavy render and the network tunnel connecting it to the edge encounters a partition (e.g., dropping packets for 35 seconds):

> * The edge queue must not hang indefinitely waiting for a partitioned worker.  
> * The edge times out and reassigns the job to a new worker (Worker B).  
> * When the network recovers, the original worker (Worker A, now a "zombie") finishes its render and uploads its plate.  
> * Without strict concurrency controls, Worker A will silently overwrite the newer, canonical asset generated by Worker B.

### **2\. Time Authority and The Heartbeat-Renewed Lease**

To solve this, the pipeline explicitly rejects static timeout windows (e.g., a hard 180-second Time-To-Live). A static timeout will inevitably kill legitimate, long-running video diffusion jobs mid-render.

Instead, the system utilizes **short, heartbeat-renewed leases** governed exclusively by a Cloudflare Durable Object (ShotCoordinatorDO):

> 1. **The Time Authority:** The ShotCoordinatorDO is the sole arbiter of time. Wall-clock timestamps are ignored in favor of the DO's internal timer state.  
> 2. **The 30-Second Window:** When a job is dispatched, the DO grants an exclusive execution lease valid for a strict 30 seconds.  
> 3. **The 10-Second Pulse:** The media-broker running on Rig 2 must dispatch an HTTP POST /heartbeat every 10 seconds.  
> 4. **Dynamic Extension:** Every successful heartbeat pushes the DO's internal expiration window back by \+30 seconds. As long as the worker remains responsive, the task can run indefinitely up to an absolute global safety ceiling (e.g., 15 minutes).

#### **2.1 Thread Isolation Requirement**

Crucially, the heartbeat loop on Rig 2 must run inside an independent background thread or asynchronous timer, completely decoupled from the primary GPU processing loop. If the Node.js event loop blocks while hashing a 2 GB video file, the heartbeat will stall, and the DO will falsely declare the worker dead.

#### **2.2 Proactive Watchdog Alarms**

Relying on incoming HTTP requests to detect a dead worker is a reactive pattern. The ShotCoordinatorDO utilizes Cloudflare's ctx.storage.setAlarm() API to set a proactive hardware alarm 30 seconds into the future. If a worker drops offline and misses three heartbeats, the alarm fires autonomously at the edge, transitioning the job state and revoking the lease.

### **3\. Monotonic Epochs and Fencing Tokens**

To physically prevent a zombie worker from committing a late write, the system issues monotonic fencing tokens.

> 1. **Epoch Generation:** Every time a lease is granted or revoked, the ShotCoordinatorDO increments its internal epoch counter (e.g., *N*→*N*\+1).  
> 2. **Token Issuance:** The worker receives this epoch as its fencing token and must include it in every subsequent heartbeat and final artifact submission.  
> 3. **Atomic Rejection:** If a zombie worker (holding Epoch *N*) awakens after a partition and attempts to commit an artifact, it calls POST /tasks/complete on the DO. The DO compares the incoming token against its active lease record within a single synchronous, atomic block in ctx.storage. Because *N*\<*N*\+1, the DO rejects the write with an HTTP 409 Conflict.

### **4\. Structural Fencing via Content-Addressed Promotion**

Cloudflare R2 and AWS S3 object storage APIs do not natively evaluate custom application fencing tokens on raw PUT requests. A zombie worker can, therefore, physically write bytes to a storage bucket.

To solve this, the pipeline enforces fencing structurally at the **promotion boundary**:

> 1. **Staging Keys:** Workers upload rendered artifacts to an epoch-scoped, content-addressed staging key (e.g., staging/renders/\${task\_id}/epoch\_\${epoch}\_\${sha256}.mp4). Because the file is content-addressed, a new render will never overwrite an old file; they hash to different keys.  
> 2. **The RPC Completion Gate:** The worker then issues a completion RPC to the DO containing the staging key.  
> 3. **Atomic Promotion:** The DO validates the epoch. Only upon successful validation does the DO write the staging key into the canonical episode manifest via a single transactional write in ctx.storage.  
> 4. **Garbage Collection:** A zombie worker's staged files are never promoted to the canonical manifest. They remain unindexed and are automatically reaped by a 7-day R2 lifecycle retention policy.

This ensures that while a stale worker might push bytes to a bucket, it is structurally incapable of promoting that work into canonical truth.

---

*User prompt: {{FOCUS: 1\. The Direct ComfyUI Threat Surface (Arbitrary Python & Filesystem Traversal)}} /extreme-details*

Response: The threat surface of a native ComfyUI instance centers on its fundamental design as an unauthenticated aiohttp web server and the unrestricted power of its Python execution graph. Exposing ComfyUI directly to a local network or the public internet (via port 8188\) without strict intermediary gateways creates a severe security risk that allows attackers to execute arbitrary code, manipulate system queues, and traverse the host filesystem.

### **1\. The Core Architecture Flaw: Unauthenticated aiohttp Ingress**

ComfyUI operates as a persistent, headless Python daemon powered by an internal asynchronous web server.

> * **Zero Native Authentication:** Out of the box, ComfyUI possesses no native password mechanism, session validation, or rate limiting on its API routes.  
> * **Raw Execution Routes:** It exposes high-privilege REST endpoints (such as POST /prompt for execution and POST /upload/image for file ingestion) completely unprotected.  
> * **Unrestricted Queue Access:** Anyone who can resolve the IP address and port can instantly queue arbitrary workflows, read historical execution data via GET /history, or flood the server to trigger a Denial of Service (DoS) via VRAM exhaustion.

### **2\. Arbitrary Python Execution (Custom Nodes as RCE Vectors)**

ComfyUI's API does not execute fixed, pre-compiled routes; instead, the network payload *is* the execution graph. A client submits a flat JSON dictionary where each key maps to an underlying Python class.

> * **Remote Code Execution (RCE):** Because the graph permits execution of any installed custom node, attackers can submit JSON payloads referencing custom nodes designed for network requests or shell execution (e.g., ComfyUI-RequestNodes or custom Python bridge nodes).  
> * **Unsandboxed Host Access:** ComfyUI nodes are standard Python classes running on the backend host. Permitting arbitrary client-submitted JSON to hit the /prompt endpoint allows malicious inputs to inject arbitrary Python commands and interact with the host OS using the privileges of the ComfyUI user process.

### **3\. Exploitable Path Traversal Vulnerabilities**

Because generative pipelines rely heavily on reading models and writing images to disk, ComfyUI has historically been vulnerable to critical path traversal attacks when handling untrusted inputs. Recent CVEs illustrate the severity of this filesystem threat:

> * **CVE-2026-6591 (LoadImage Node Traversal):** A vulnerability in the folder\_paths.get\_annotated\_filepath function affecting ComfyUI (up to v0.13.0) allows attackers to manipulate the Name argument to traverse directories (e.g., submitting ../../etc/passwd). This provides unauthorized read access to sensitive host configuration files and credentials.  
> * **CVE-2026-92816 (Dataset Save Node Arbitrary Write):** A severe vulnerability (prior to v0.30.0) where dataset save nodes fail to constrain the folder\_name parameter to the intended output directory. Attackers can submit workflows that write arbitrary files outside the output folder. Overwriting \_\_init\_\_.py modules or shell startup scripts (.bashrc) converts this arbitrary write into full Local Code Execution.  
> * **CVE-2025-45074 (ComfyUI Manager Install Model):** A path traversal flaw in the ComfyUI Manager extension's /api/manager/queue/install\_model endpoint allows unauthenticated attackers to supply crafted save\_path variables (e.g., custom\_nodes//foo/bar) to copy and write remote or local files to arbitrary system paths.

### **4\. Malicious Model Ingestion and Credential Blast-Radius**

ComfyUI execution environments inherently pull dynamic community packages and ingest unpickled machine learning models.

> * **Pickle / Checkpoint RCE:** If an attacker uses a traversal or upload vulnerability to place a maliciously crafted .safetensors or pickled checkpoint onto the NVMe scratch disk, subsequent workflows can be directed to load them.  
> * **Key Exfiltration:** If administrative credentials (like GitHub App tokens, Cloudflare API keys, or JWTs) are stored in the environment variables of the ComfyUI machine, a compromised custom node or maliciously pickled file can instantly exfiltrate those keys over the network, allowing the attacker to rewrite repositories and infrastructure.

### **5\. Architectural Mitigation: Outbound Ingress and Sanitization**

To neutralize this entire threat surface, the production pipeline enforces a strict isolation boundary at the network and application layers:

> * **Closed Inbound Ports:** Rig 2 never exposes port 8188 to the internet. Instead, it runs cloudflared to establish an encrypted, outbound-only tunnel to the Cloudflare Zero Trust network.  
> * **Workflow Sanitization:** The pipeline's media-broker absolutely never accepts raw JSON graphs from the network. It maintains an allowlist of local JSON templates on disk and uses strict schema contracts (like Zod) to validate incoming intents (e.g., enforcing that a seed is a strict integer). It safely injects only these validated, typed primitives into the local template before dispatching to the /prompt endpoint, completely sandboxing execution from path traversal and injection attacks.

---

*User prompt: are there any differences between the media broker and the edge director*

Response: While both components are categorized under **POD-12: System Middleware / Infrastructure**, the **media-broker** and the **edge-director** live in different physical domains, execute on distinct runtimes, and hold opposite architectural responsibilities.

### **Core Functional Comparison**

| Dimension | edge-director | media-broker |
| :---- | :---- | :---- |
| **Physical Host** | Cloudflare Edge (Global Anycast Network) | **Rig 2** (The Local Foundry Workstation) |
| **Runtime Environment** | V8 Isolate (workerd) via Cloudflare Workers & Durable Objects (ShotCoordinatorDO) | Full POSIX Node.js runtime process (supervised by PM2 or systemd) |
| **Primary System Role** | **Control Plane / Concurrency Gatekeeper** (The Digital Line Producer) | **Data Plane / Execution Spoke** (The Physical Silicon Driver) |
| **Hardware Awareness** | Zero GPU awareness; operates entirely on serverless edge memory | Directly binds local hardware, monitors VRAM via nvidia-smi, and flushes buffers |
| **Hardware Locking Model** | **Passive Request Queue:** Holds logical FIFO queue; cannot force work onto silicon | **Permanent Active Mutex:** Holds an unconditional OS-level file lock (flock) on GPU interfaces |
| **State Authority** | Authoritative over **leases, monotonic fencing epochs (*N*), queues, and client connection replays** | Authoritative over **local execution state, VRAM headroom, and content-addressed SHA-256 asset hashing** |
| **Network Direction** | Inbound listener (receives HTTPS/WSS from Rig 1 artists and broker tunnels) | **Outbound-only client:** Dials upward via cloudflared tunnel; never exposes open WAN ports |
| **Failure Behavior** | Transitions to SIMULATION\_ONLY mode (advancing D1 canon deltas without media) | Drops remote polling and seamlessly drains the local offline spool (/var/spool/renders) |

### **Deep-Dive Structural Differences**

#### **1\. Hardware Authority & Lock Inversion (flock vs. FIFO Queue)**

> * **edge-director (Passive Request Queue):** The edge never "commands" Rig 2\. If the edge DO held the hardware lock, a network drop could leave the GPU in an ambiguous or frozen state. The DO is strictly a logical queue and lease coordinator.  
> * **media-broker (Local flock Sovereignty):** The local daemon permanently maintains an OS-level file lock (flock) on the GPU. It operates purely on **pull semantics**—it reaches out to lease a job from the edge-director *only* when its local hardware lock is free and idle.

#### **2\. Network Topology & Directionality**

> * **edge-director (The Public/Zero-Trust Ingress):** It exposes endpoints to traveling artists on Rig 1\. It handles JWT validation, schema compilation, sub-5ms Cloudflare D1 continuity checks (is\_dirty \== 0), and multiplexes sockets via Cloudflare's WebSocket Hibernation API (\$0.00 idle cost).  
> * **media-broker (The Inside-Out Foundry):** It never opens inbound ports (keeping ports 8188 and 3000 closed to the WAN). It initiates an outbound tunnel connection upward to edge-director.

#### **3\. Compute vs. Coordination Execution**

> * **edge-director (Lightweight Logic):** Executes zero media generation, zero FFmpeg commands, and zero Python code. It manages distributed leases (30-second windows), verifies 10-second worker heartbeats, increments monotonic fencing tokens (*N*→*N*\+1), and enforces DLQ retries.  
> * **media-broker (Heavy Hardware Orchestration):** Directly talks to headless ComfyUI on 127.0.0.1:8188. It injects parameters into modular API JSON templates, drives multi-modal turn-based execution (Text GGUF → TTS audio → Wan 2.2 diffusion), triggers explicit /free VRAM flushes between passes, validates rendered .mp4 frames locally, and streams finished plates to Cloudflare R2.

#### **4\. Offline & Degradation Mechanics**

> * **When Rig 2 Loses Internet:** The media-broker experiences zero code-path divergence; it stops polling the edge and immediately begins reading and rendering manifests from a local disk directory (/var/spool/renders).  
> * **When Rig 2 Loses Power:** The edge-director detects missing heartbeats, revokes the lease via a hardware alarm (ctx.storage.setAlarm()), and drops into SIMULATION\_ONLY mode—writing story and inventory mutations straight to Cloudflare D1 and staging unrendered shot ASTs in an append-only backlog queue until the broker reconnects.

### **The Studio Division of Labor**

Rig 1 (Creative Truth, Frame Budgets, Remotion)worker-sower-conductor​​⟺Cloudflare Edge (Queue, Mutex, Fencing Tokens)edge-director​​⟺Rig 2 (Local OS Lock, VRAM Flushes, ComfyUI)media-broker​​\[cite: 1, 3, 5\]

The **edge-director** ensures the studio coordinates safely across the internet without crashing consumer GPUs, while the **media-broker** ensures that once a job reaches the physical computer, the GPU executes the DAG safely without running out of VRAM.

---

*User prompt: what are the similarities between the media broker and the edge director*

Response: While the media-broker and the edge-director occupy opposite physical domains (the local GPU foundry on Rig 2 versus Cloudflare's serverless edge), they are tightly coupled partners designed to function as two halves of a single, coherent system.

Their core similarities span system classification, shared contracts, and cooperative resilience patterns:

### **1\. Shared Subsystem Classification (POD-12: System Middleware)**

> * Both services belong to the exact same architectural pod: **POD-12 (System Middleware / Infrastructure)**, positioned under **Macro-Node 04: Supply Chain / Infrastructure**.  
> * Neither component possesses creative authority. Neither authors script dialogue, invents story canon, generates aesthetic prompts, or acts as a creative critic. Both are strictly operational infrastructure designed to move data, enforce safety constraints, and manage compute lifecycles.

### **2\. Implementation Runtime and Ecosystem (Node.js & TypeScript)**

> * Both components are engineered in **TypeScript / JavaScript** on V8-based JavaScript engines.  
> * The edge-director runs on Cloudflare's V8 edge runtime (workerd via Cloudflare Workers & Durable Objects), while the media-broker runs on a POSIX Node.js runtime on Rig 2\.  
> * Because they share the same programming language ecosystem, they share isomorphic data structures, serialization logic, and npm validation libraries.

### **3\. Binding to the Exact Same Schema Contract (SpokeExecutionPayload)**

> * Both services speak the exact same strongly-typed schema contract: **SpokeExecutionPayload**.  
> * Both components use strict runtime validation (such as **Zod**) to parse and enforce this payload.  
> * Neither accepts arbitrary execution code or unstructured requests. Both treat fields like sceneId, targetFrames, positivePrompt, loraTag, and seed as immutable parameters bounded by rigid schemas (additionalProperties: false).

### **4\. Direct Cloudflare R2 Storage Integration**

> * Both systems are built to interact directly with **Cloudflare R2** object storage using AWS S3-compatible SDKs.  
> * **Content Addressing:** Both rely on deterministic, immutable SHA-256 content hashes (e.g., plates/sha256\_{hash}.mp4) rather than mutable, overwriteable filenames.  
> * **Zero-Egress Economics:** Both are designed around Cloudflare R2's **\$0.00 egress fee guarantee**, allowing the media-broker to upload raw video plates and the edge-director to generate signed pre-shared URLs for Rig 1's Remotion viewport without incurring bandwidth costs.

### **5\. Cooperative Participation in Distributed Locking (Leases & Heartbeats)**

Neither component functions in isolation regarding task execution; they implement complementary sides of the **exact same distributed lease and fencing protocol**:

> * **The 30-Second Rolling Window:** Both adhere to the exact same 30-second lease expiration threshold.  
> * **The 10-Second Telemetry Pulse:** Both communicate via an asynchronous 10-second heartbeat (BROKER\_HEARTBEAT) that keeps the lease alive without blocking primary workloads.  
> * **Monotonic Epoch Enforcement (*N*):** Both track the monotonic fencing\_token. The edge-director issues and validates the token, while the media-broker stamps it onto outgoing completion envelopes (BROKER\_COMPLETE) to protect the studio against zombie overwrites.

### **6\. Duplex Telemetry and WebSocket Protocol Alignment**

> * Both components communicate with each other over **duplex, persistent WebSockets**.  
> * Both speak the same domain-specific telemetry event vocabulary:  
  * EXECUTE\_JOB / EXECUTE\_LEASE (Job dispatch)  
  * BROKER\_HEARTBEAT (Health keep-alive)  
  * BROKER\_PROGRESS (Normalized step percentage updates)  
  * BROKER\_COMPLETE (Asset delivery notification with signed hashes)  
> * Both normalize low-level progress into standardized data structures before relaying it to client dashboards.

### **7\. Unified Goal: Protecting Hardware from CUDA OOM Crashes**

> * The fundamental engineering purpose of both components is **hardware safety and concurrency control**.  
> * Neither allows multiple heavy diffusion tasks to collide on consumer GPU silicon.  
> * The edge-director enforces this at the network level by maintaining a strict **single-threaded FIFO queue** (preventing concurrent dispatches), while the media-broker enforces this at the silicon level by maintaining an **OS-level file lock (flock)** and executing **turn-based VRAM flushes (POST /free)**.

### **8\. Native Design for Offline Autonomy and Graceful Degradation**

Both systems are architected around the studio's **"Deletion Principle"**—ensuring the production pipeline never suffers from fatal single points of failure:

> * **Zero Code-Path Divergence:** If the network partition severs the connection between them, neither crashes.  
> * The edge-director gracefully degrades into **SIMULATION\_ONLY mode**, continuing to advance narrative facts in Cloudflare D1 while spooling unrendered shot ASTs into a backlog table.  
> * The media-broker seamlessly degrades into **local disk queue spooling (/var/spool/renders)**, continuing to render plates on Rig 2 using the exact same ComfyUI execution loops and VRAM hygiene routines.

---

*User prompt: {{FOCUS: Data Plane / Execution Spoke (The Physical Silicon Driver)}} /extreme-details*

### **Response: Physical Hardware Identity & Architectural Pod Assignment**

The **Data Plane / Execution Spoke** (designated canonically as **POD-12: The Execution Spoke Worker Daemon**, with shorthand names spoke-daemon or rig2-broker) is the physical driver bound directly to **Rig 2** (The Local Foundry Workstation) under **Macro-Node 04: Supply Chain / Infrastructure**.

Operating strictly under the *"Dumb Executor"* paradigm, this component does not generate narrative logic, compile dialogue Abstract Syntax Trees (ASTs), enforce continuity, or composite timeline viewports. Its exclusive domain is the physical compute layer: governing local consumer GPU silicon (typically an RTX workstation class with 24 GB VRAM), executing strict hardware memory hygiene, serializing execution pipelines, and ensuring zero-loss asset egress.

┌────────────────────────────────────────────────────────────────────────┐  
│                        DATA PLANE ARCHITECTURE                         │  
│                    RIG 2: media-broker (Port 3000\)                     │  
├────────────────────────────────────────────────────────────────────────┤  
│                                                                        │  
│   UNIFIED TASK INGRESS (Pull Semantics)                                │  
│   \[ Outbound WSS / Cloudflare Tunnel \]  OR  \[ /var/spool/renders FIFO \]│  
│                       │                               │                │  
│                       └───────────────┬───────────────┘                │  
│                                       ▼                                │  
│   1\. HARDWARE SOVEREIGNTY LOCK                                         │  
│      • OS-Level flock on GPU interface (/var/lock/rig2\_gpu.lock)       │  
│      • Continuous Baseline VRAM Audit (nvidia-smi check \>21GB free)    │  
│                                       │                                │  
│                                       ▼                                │  
│   2\. MULTI-MODAL TURN-BASED EXECUTION ENGINE                           │  
│      ┌──────────────────────────────────────────────────────────────┐  │  
│      │ Turn 1: Text AST (Qwen 2.5 14B GGUF)                         │  │  
│      │         POST http://127.0.0.1:8188/free                      │  │  
│      ├──────────────────────────────────────────────────────────────┤  │  
│      │ Turn 2: Audio Synthesis (ComfyUI TTS)                        │  │  
│      │         POST http://127.0.0.1:8188/free                      │  │  
│      ├──────────────────────────────────────────────────────────────┤  │  
│      │ Turn 3: Video Latent Diffusion (Wan 2.2 \#00FF00 Plate)       │  │  
│      │         POST http://127.0.0.1:8188/free                      │  │  
│      └──────────────────────────────────────────────────────────────┘  │  
│                       │                               │                │  
│     Telemetry / Heartbeats                            │ Completion     │  
│     (Thread-Isolated Loop)                            ▼ Sentinel       │  
│   • Asynchronous Timer                3\. LOCAL SCRATCH VALIDATION      │  
│   • BROKER\_HEARTBEAT (every 10s)         • Assert size \> 0 & non-empty │  
│   • ws://127.0.0.1:8188/ws tapping       • ffprobe container decode    │  
│   • Telemetry relay up tunnel                         │                │  
│                                                       ▼                │  
│                                       4\. DIRECT ZERO-EGRESS SYNC       │  
│                                          • SHA-256 Content Addressing  │  
│                                          • Cloudflare R2 Upload (AWS)  │  
│                                          • Monotonic Epoch RPC Commit  │  
│                                                                        │  
└────────────────────────────────────────────────────────────────────────┘

### **1\. Inverted Hardware Sovereignty & The OS-Level Mutex (flock)**

The foundation of the Execution Spoke is **Inverted Hardware Sovereignty**. The physical silicon must never be commanded or seized directly by remote edge actors, serverless isolates, or cloud coordinators.

CORRECTED INVERTED ARCHITECTURE:  
Remote DO ──► Logical Request Queue ──► Local media-broker ──► OS flock ──► GPU Silicon

> * **Elimination of the Edge-Authority Anti-Pattern:** Early distributed topologies allowed an edge Durable Object (DO) to declare down to Rig 2, *"you own the GPU now"*. When wide-area network (WAN) jitter or packet drops severed the Cloudflare Tunnel, the edge watchdog timer tripped, revoked the lease, and reassigned the shot to an alternate worker. Meanwhile, Rig 2 continued rendering in local VRAM. Once connectivity restored, competing tasks attempted concurrent tensor allocations on the same graphics card, resulting in an immediate **CUDA Out-Of-Memory (OOM) crash**.  
> * **Permanent Local flock Ownership:** Rig 2 eliminates this concurrency hazard by structural construction. The media-broker process permanently maintains an unconditional, operating-system-level advisory lock (flock) directly on the GPU hardware interface (or a designated kernel lock file, e.g., /var/lock/rig2\_gpu.lock).  
> * **The Pull-Only Execution Contract:** The edge DO (ShotCoordinatorDO) is strictly relegated to a passive, logical First-In, First-Out (FIFO) request queue. Rig 2 operates exclusively via pull semantics: it queries and leases work from the edge *only* when its local flock is released, PyTorch memory is reclaimed, and the graphics card is confirmed idle.  
> * **Single Local Invariant:** There are never two competing queues or two split locks. Because a task can only begin when the local flock is physically acquired, no upstream timeout or edge event can force an unexpected execution onto the GPU while a render is in progress.

### **2\. Turn-Based Execution & VRAM Lifecycle Management**

To run multi-modal character synthesis without crashing a single 24 GB consumer GPU, the Execution Spoke operates on the **Anti-Ollama Paradigm**. It unifies text generation, speech synthesis, and video diffusion exclusively under ComfyUI’s Directed Acyclic Graph (DAG) runtime on port 8188, eliminating independent external inference processes (like Ollama or vLLM) whose background memory allocations cannot be evicted by ComfyUI.

The spoke executes jobs through a strict three-phase Assistant Director lifecycle:

#### **Step 1: Text AST Compilation (Child Graph A)**

> * ComfyUI loads the Qwen 2.5 14B GGUF weights, consuming ∼9–10 GB of VRAM.  
> * It processes scene context, generates the dialogue\_ast.json, outputs character somatic states, and halts.  
> * *(Hardware Optimization Note):* The architecture also supports offloading Child Graph A entirely to Rig 1's CPU/system RAM via llama.cpp. While slower in tokens-per-second, this eliminates an entire 10 GB model swap from Rig 2, keeping the shared GPU foundry reserved for acoustic and video passes.

#### **Step 2: Acoustic Synthesis & Integer Framing (Child Graph B)**

> * media-broker executes an explicit memory flush via POST \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) with { unload\_models: true, free\_memory: true }.  
> * ComfyUI loads local TTS weights (∼4–6 GB VRAM) to synthesize .wav dialogue stems.  
> * The spoke measures the raw millisecond duration of the acoustic stems and executes temporal quantization arithmetic to lock the discrete frame budget for video:  
>   target\_frames=⌈(1000duration\_ms​)×24⌉

#### **Step 3: Temporal Video Diffusion (Child Graph C)**

> * media-broker triggers a second POST /free flush, completely dumping acoustic models.  
> * The daemon validates via nvidia-smi child processes that available VRAM has returned to baseline (\>21 GB free on a 24 GB card) before submitting the next graph.  
> * 100% of the physical 24 GB VRAM is allocated to Wan 2.2 video diffusion and character LoRAs. The model renders the uncompressed greenscreen character plate (\#00FF00) locked precisely to the quantized frame count.

#### **Mitigating PyTorch Allocator Fragmentation**

Continuous generation of heavy video diffusion models causes memory fragmentation in PyTorch’s caching allocator, where virtual memory allocations fail despite the OS reporting free headroom. To guarantee clean silicon state:

> 1. **Stage-Level Batching:** Rather than naively cycling Text \-\> Audio \-\> Video per shot (which wastes minutes thrashing 33+ GB of model weights across PCIe lanes), the spoke amortizes hydration overhead by grouping tasks by stage: generating all text for a scene, then all audio stems, and finally all video plates in sequence.  
> 2. **Process Recycling:** Every 25 rendered shots (or at the boundary of major episode stages), media-broker executes a graceful shutdown and restart of the underlying headless ComfyUI child process, purging the CUDA context completely.

### **3\. Local Sentinel Tapping & Telemetry Bridge Mechanics**

ComfyUI exposes an internal aiohttp server hosting a REST command interface and a low-level WebSocket telemetry bus:

> * **Tapping the Event Bus:** Upon boot, media-broker opens a local loopback WebSocket connection to ws://127.0.0.1:8188/ws?clientId=\<daemon\_uuid\>. It opens this socket *before* dispatching POST /prompt to ensure early preprocessing events (CLIP encoding) are not dropped.  
> * **Event Normalization:** Raw, internal node events (execution\_start, executing, progress, execution\_cached) are captured and mapped into a standardized BROKER\_PROGRESS JSON packet containing normalized step counts, percentage completion, node identifiers, and real-time VRAM allocation metrics:  
>   {  
>     "type": "BROKER\_PROGRESS",  
>     "taskId": "task\_01954b72-3c81-723a-8b1e-9a4f61e2cb01",  
>     "epoch": 4,  
>     "step": 28,  
>     "totalSteps": 50,  
>     "percentage": 56,  
>     "vramUsedBytes": 19421532160,  
>     "currentNode": "KSamplerAdvanced"  
>   }

> * **Upstream Forwarding:** Normalized packets are pushed up the outbound Cloudflare Tunnel to the ShotCoordinatorDO. The edge DO wakes via the WebSocket Hibernation API in \<2 ms, broadcasts the ordered update to connected artist viewports, and immediately re-hibernates at \$0.00 idle compute cost.  
> * **Binary Stream Filtering:** ComfyUI transmits intermediate latent previews as binary WebSocket packets. The spoke inspects incoming message types, bypassing binary previews (or stripping the initial 8-byte binary header) to prevent corrupting text-based telemetry JSON parsers.

### **4\. Asynchronous Heartbeats & Monotonic Fencing Compliance**

To prevent network drops from causing the edge to mark Rig 2 dead while long diffusion passes run, the spoke participates in a distributed lease protocol:

> * **The 30-Second Rolling Lease:** The edge grants execution leases with a rolling 30-second Time-To-Live (TTL), replacing brittle static timeouts that kill complex renders mid-generation.  
> * **Thread-Isolated Heartbeat Loop:** The spoke maintains a dedicated, asynchronous background timer (isolated in a Web Worker or independent event loop tick) that emits BROKER\_HEARTBEAT every 10 seconds:  
>   {  
>     "type": "BROKER\_HEARTBEAT",  
>     "jobId": "SH01",  
>     "epoch": 4,  
>     "vram\_free\_mb": 14200  
>   }

By isolating this timer, heavy blocking operations in the primary thread—such as reading multi-gigabyte .mp4 containers, parsing large ASTs, or calculating SHA-256 digests—cannot stall heartbeats or trigger false lease revocations.

> * **Monotonic Epoch Fencing Compliance:** Every lease grant increments an integer epoch counter (*N*→*N*\+1) at the edge. The spoke must bind this fencing token to all operations. If a network partition exceeds 30 seconds, the edge watchdog alarm (ctx.storage.setAlarm()) revokes the lease and advances to *N*\+1. When the disconnected spoke finishes and attempts to commit with stale epoch *N*, the edge rejects the transaction with HTTP 409 Conflict, structurally neutralizing the **Split-Brain Zombie Runner Hazard**.

### **5\. Local Pre-Egress Validation & Content-Addressed Egress**

When ComfyUI completes a workflow, it broadcasts its completion sentinel over the local socket: { "executing": { "node": null } }. Before initiating any cloud sync, the Execution Spoke executes an uncompromising local audit:

Rig 2 (media-broker)                 Cloudflare R2 Bucket          edge-director DO  
      │                                       │                           │  
      ├─ ComfyUI emits: { node: null }        │                           │  
      ├─ Validates MP4 on scratch disk        │                           │  
      ├─ Computes SHA-256 Digest              │                           │  
      │                                       │                           │  
      ├─ Streams MP4 to Staging Key ─────────►│                           │  
      │  staging/.../epoch\_4\_a8f5b.mp4        │                           │  
      │                                       │                           │  
      ├─ RPC: POST /tasks/complete ──────────────────────────────────────►│  
      │  { taskId, epoch: 4, sha256, key }    │                           ├─ Asserts active Epoch \== 4  
      │                                       │                           ├─ Promotes staging to canonical  
      │                                       │                           ├─ Releases Hardware Mutex  
      │                                       │                           │  
      │◄───── HTTP 200 OK ────────────────────────────────────────────────┤  
      │                                       │                           │  
      │                                       │                           ├─ Broadcasts to Artists:  
      │                                       │                           │  SHOT\_READY { seq: 114, url }

> 1. **Defensive Scratch Audit:**  
   * **Size and Truncation Checks:** The spoke reads the output artifact from ComfyUI/output/ and asserts the byte length is \>0.  
   * **Empty-File Hash Assertion:** It verifies that the file hash does not match the empty-string SHA-256 constant:  
     SHA-256(∅)=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
   * **Structural Codec Validation (ffprobe):** The spoke spawns an ffprobe subprocess to confirm that MP4 container moov atoms are intact and that the decoded video frame count exactly matches target\_frames. Truncated or corrupted renders fail immediately at the spoke boundary before touching cloud storage.  
> 2. **Content-Addressed Staging Upload:**  
   * Because Cloudflare R2 and AWS S3 object storage APIs cannot natively evaluate fencing tokens on raw PUT requests, the spoke streams the file to an isolated staging key: staging/renders/\${taskId}/epoch\_\${epoch}\_\${sha256}.mp4  
   * The upload is executed directly via @aws-sdk/client-s3 or s5cmd.  
> 3. **The Atomic Promotion Gate:**  
   * Once uploaded, the spoke issues an authenticated RPC to the edge DO: POST /tasks/complete carrying { taskId, epoch, sha256, stagingKey }.  
   * If the epoch matches, the DO promotes the staged asset into the canonical production manifest and releases its queue mutex. If the epoch is stale, the promotion is rejected with HTTP 409 Conflict, leaving unindexed zombie bytes to be reaped by R2's automated 7-day lifecycle retention rules.  
   * The edge emits SHOT\_READY to Rig 1, allowing the Remotion compositor to download the asset under Cloudflare R2's **\$0.00 egress fee guarantee**.

### **6\. Zero Code-Path Divergence: Offline Autonomy via /var/spool/renders**

The studio adheres strictly to the **Deletion Principle**: production velocity must survive the complete severance of the internet, Cloudflare tunnels, or third-party cloud infrastructure.

To achieve this without maintaining separate, bug-prone fallback routines, the Execution Spoke enforces **Zero Code-Path Divergence**:

> * **The Unified Compute Pipeline:** The rendering execution harness inside media-broker is identical whether online or offline. The VRAM hygiene flushes (POST /free), modular JSON template hydration, parameter injection, 24fps quantization math, and stage-level batching logic never change.  
> * **Ingress Switching Only:** The only variable is the source of the manifest:  
  * **Online:** media-broker pulls render tasks over the outbound WebSocket/tunnel from the edge DO.  
  * **Offline:** When the tunnel drops, media-broker immediately polls a local filesystem FIFO directory: /var/spool/renders.  
> * **Local Content-Addressed Archive:** When working offline, generated plates are hashed via SHA-256 and committed directly to a local content-addressed disk store, updating the local production manifest with zero network dependencies.  
> * **Reconnection Re-sync:** When network connectivity returns, media-broker reconnects its outbound tunnel, verifies that its local flock is free, and issues a request to drain the edge D1 backlog queue (POST /api/backlog/drain-next), batch-rendering unrendered scenes and reconciling local content hashes with the remote ledger.

---

*User prompt: {{FOCUS: Directly binds local hardware, monitors VRAM via nvidia-smi, and flushes buffers}} /extreme-details*

Response: In the generative production pipeline, the physical silicon driver of **media-broker** (running on **Rig 2**) directly manages consumer GPU hardware (typically an NVIDIA RTX 3090, 4090, or 5070 with 24 GB VRAM). It coordinates the boundary between the high-level Node.js daemon and the low-level graphics card.

The system relies on three interrelated mechanisms to prevent multi-tenant memory thrashing, driver context crashes, and fatal **CUDA Out-Of-Memory (OOM)** exceptions:

> 1. **Direct Hardware Binding & Inverted Mutex Sovereignty (flock)**  
> 2. **Subprocess Telemetry Polling via nvidia-smi & Baseline Auditing**  
> 3. **Turn-Based VRAM Eviction (POST /free) & Caching Allocator Defragmentation**

### **1\. Direct Hardware Binding & Inverted Mutex Sovereignty (flock)**

#### **The Hardware Ceiling & The Concurrency Trap**

A consumer workstation GPU equipped with 24 GB VRAM presents an unforgiving spatial ceiling. The concurrent footprint required by a full multi-modal pipeline far exceeds this envelope:

> * **Text AST Decoding:** Qwen 2.5 14B GGUF requires **9 GB to 10 GB**.  
> * **Speech Synthesis:** High-fidelity neural TTS models (e.g., CosyVoice, XTTSv2, Parler-TTS) require **4 GB to 6 GB** for acoustic embeddings and vocoder checkpoints.  
> * **Temporal Video Diffusion:** Wan 2.2 running with character LoRAs claims **16 GB to 22 GB** of scratchpad memory for 3D latent tensors (16 channels×8×spatial×4×temporal downsampling).

Attempting to run two tasks concurrently demands between **29 GB and 38 GB** of physical VRAM, immediately triggering a fatal torch.cuda.OutOfMemoryError.

┌────────────────────────────────────────────────────────────────────────┐  
│ TOTAL 24 GB PHYSICAL VRAM ALLOCATION ENVELOPE                          │  
├────────────────────────────────────────────────────────────────────────┤  
│ Qwen 2.5 14B GGUF (Text AST Pass)      │ \~9 GB to 10 GB VRAM           │  
│ CosyVoice / Parler-TTS (Speech Stems)  │ \~4 GB to 6 GB VRAM            │  
│ Wan 2.2 \+ LoRAs (Video Diffusion)      │ \~16 GB to 22 GB Scratchpad    │  
├────────────────────────────────────────────────────────────────────────┤  
│ CONCURRENT OCCUPANCY ATTEMPT           │ \~29 GB to 38 GB VRAM          │  
│ 💥 RESULT WITHOUT HARD MUTEX           │ INSTANT CUDA OUT-OF-MEMORY    │  
└────────────────────────────────────────────────────────────────────────┘

#### **The Architecture of Local Lock Sovereignty**

To prevent network jitter or race conditions from dispatching jobs onto active hardware, the pipeline discards remote lock ownership. The remote Cloudflare Durable Object (ShotCoordinatorDO) possesses **zero authority to command the GPU directly**.

Instead, the local media-broker maintains permanent, unconditional sovereignty directly on Rig 2 using an OS-level advisory file lock (flock):

CORRECTED INVERTED ARCHITECTURE:  
Remote DO ──► Logical Request Queue ──► Local media-broker ──► OS flock ──► GPU Silicon

// media-broker/src/hardware/gpuLock.ts  
import fs from "node:fs";  
import fcntl from "fs-ext"; // Native POSIX flock bindings

export class GpuHardwareMutex {  
  private lockFd: number | null \= null;  
  private readonly lockFilePath \= "/var/lock/rig2\_gpu.lock";

  public acquireLock(): boolean {  
    if (this.lockFd \!== null) return true; // Already acquired locally

    try {  
      this.lockFd \= fs.openSync(this.lockFilePath, "w");  
      // LOCK\_EX: Exclusive Lock, LOCK\_NB: Non-Blocking  
      fcntl.flockSync(this.lockFd, "exnb");  
      return true;  
    } catch (err: any) {  
      if (err.code \=== "EAGAIN" || err.code \=== "EWOULDBLOCK") {  
        return false; // Hardware is actively occupied by a local process  
      }  
      throw new Error(\`\[GpuMutex\] Kernel failure acquiring GPU lock: \${err.message}\`);  
    }  
  }

  public releaseLock(): void {  
    if (this.lockFd \=== null) return;  
    fcntl.flockSync(this.lockFd, "un");  
    fs.closeSync(this.lockFd);  
    this.lockFd \= null;  
  }  
}

> * **Pull-Only Scheduling:** The daemon queries or pulls work from the remote edge DO or the local offline spool (/var/spool/renders) **only after acquireLock() successfully claims the physical hardware descriptor**.  
> * **Elimination of the "Two-Queue" Failure:** If a network partition severs the Cloudflare Tunnel for \>30 seconds, the edge watchdog alarm (ctx.storage.setAlarm()) trips and revokes the edge lease. Because the local media-broker never relinquishes its OS flock while ComfyUI is generating latents, any incoming job arriving over a recovered socket or alternate worker thread is blocked at the kernel boundary, making concurrent tensor collisions impossible.

### **2\. Subprocess Telemetry Polling via nvidia-smi & Baseline Auditing**

While ComfyUI exposes an internal REST route (GET /system\_stats) via its aiohttp webserver, relying solely on HTTP telemetry during heavy tensor allocation is dangerous: if PyTorch saturates the CPU or blocks the Python Global Interpreter Lock (GIL) during compilation, aiohttp event loops stall.

The media-broker directly verifies hardware reality by spawning isolated POSIX subprocesses targeting NVIDIA's System Management Interface (nvidia-smi).

#### **Real-Time Hardware Querying**

Using comma-separated XML/CSV formatting with explicit unit suppression (nounits), media-broker queries the NVIDIA driver at *O*(1) overhead without parsing unstructured terminal output:

// media-broker/src/hardware/vramMonitor.ts  
import { execFile } from "node:child\_process";  
import { promisify } from "node:util";

const execFileAsync \= promisify(execFile);

export interface GpuMemorySnapshot {  
  totalMb: number;  
  usedMb: number;  
  freeMb: number;  
  gpuUtilizationPercent: number;  
  computeProcesses: Array\<{ pid: number; usedMemoryMb: number }\>;  
}

export async function sampleGpuVram(gpuIndex \= 0): Promise\<GpuMemorySnapshot\> {  
  const { stdout } \= await execFileAsync("nvidia-smi", \[  
    \`--id=\${gpuIndex}\`,  
    "--query-gpu=memory.total,memory.used,memory.free,utilization.gpu",  
    "--format=csv,noheader,nounits"  
  \]);

  const \[totalStr, usedStr, freeStr, utilStr\] \= stdout.trim().split(",").map(s \=\> s.trim());

  // Inspect active CUDA process tables to ensure no rogue unmanaged daemons  
  const { stdout: procStdout } \= await execFileAsync("nvidia-smi", \[  
    \`--id=\${gpuIndex}\`,  
    "--query-compute-apps=pid,used\_gpu\_memory",  
    "--format=csv,noheader,nounits"  
  \]);

  const computeProcesses \= procStdout.trim()  
    ? procStdout.trim().split("\\n").map(line \=\> {  
        const \[pid, mem\] \= line.split(",").map(s \=\> s.trim());  
        return { pid: parseInt(pid, 10), usedMemoryMb: parseInt(mem, 10\) };  
      })  
    : \[\];

  return {  
    totalMb: parseInt(totalStr, 10),  
    usedMb: parseInt(usedStr, 10),  
    freeMb: parseInt(freeStr, 10),  
    gpuUtilizationPercent: parseInt(utilStr, 10),  
    computeProcesses  
  };  
}

#### **Relative Baseline Verification (The Dynamic Calibration Anchor)**

Hardcoding an absolute memory threshold (e.g., assert free\_vram \> 21 GB) creates fragile deployment pipelines. If a local desktop display compositor (X11, Wayland, or desktop GUI drivers) claims 1.2 GB of VRAM, available free memory will top out at ∼20.8 GB, causing a static gate check to hang indefinitely.

To resolve this, media-broker implements **Relative Baseline Verification**:

> 1. **Boot Calibration:** Upon daemon startup, before ComfyUI loads weights, media-broker samples the initial baseline:  
>    Baselinefree​\=sampleGpuVram().freeMb  
> 2. **Tolerance Envelope (Δ):** The system establishes an allowable tolerance boundary (Δ≤500 MB).  
> 3. **Execution Gate Evaluation:** A stage transition is cleared only when the verified free VRAM matches:  
>    Currentfree​≥(Baselinefree​−Δ)

┌────────────────────────────────────────────────────────────────────────┐  
│ VERIFIABLE MEMORY POLLING SEQUENCE                                     │  
├────────────────────────────────────────────────────────────────────────┤  
│ media-broker calls POST /free ──► ComfyUI queues async model unload    │  
│                                            │                           │  
│ ┌──────────────────────────────────────────┴─────────────────────────┐ │  
│ │ WHILE (Elapsed \< 15s Timeout):                                     │ │  
│ │   1\. Poll GET /system\_stats OR spawn nvidia-smi via child\_proc     │ │  
│ │   2\. Read Free\_VRAM                                                │ │  
│ │   3\. IF Free\_VRAM \>= (Measured\_Baseline\_VRAM \- 500 MB):            │ │  
│ │        BREAK \-\> Emit VRAM\_VERIFIED (Clear Stage Execution Gate)    │ │  
│ │   4\. ELSE: Sleep(250ms)                                            │ │  
│ └──────────────────────────────────────────┬─────────────────────────┘ │  
│                                            │                           │  
│ ├── PASS: Dispatch Next Modality Graph     └── TIMEOUT EXCEEDED (15s): │  
│                                                • Detect Memory Leak    │  
│                                                • Kill ComfyUI Process  │  
│                                                • Purge Allocator       │  
└────────────────────────────────────────────────────────────────────────┘

### **3\. Turn-Based Buffer Flushing (POST /free) & The Asynchronous Race Condition**

#### **The Asynchronous Race Hazard**

A critical vulnerability in orchestration harnesses is assuming that issuing an HTTP command to ComfyUI's memory release endpoint is a synchronous, blocking operation.

When POST \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) is triggered with:

{  
  "unload\_models": true,  
  "free\_memory": true  
}

ComfyUI's server returns HTTP 200 OK in milliseconds because it merely enqueues the memory release into an internal asynchronous task queue.

If the host daemon immediately submits the next graph (e.g., Wan 2.2 diffusion) across the local socket, PyTorch begins allocating 16 GB to 20 GB of video latent tensors while the prior model's weights (e.g., 9 GB of Qwen GGUF or 4 GB of TTS vocoders) are still being unmapped across PCIe lanes. The memory footprints overlap, triggering an instant CUDA crash.

// media-broker/src/hardware/vramFlusher.ts  
import { sampleGpuVram } from "./vramMonitor";

export async function executeVerifiableVramFlush(  
  baselineFreeMb: number,  
  toleranceMb \= 500,  
  timeoutMs \= 15000  
): Promise\<void\> {  
  const COMFYUI\_FREE\_URL \= "http://127.0.0.1:8188/free";

  // 1\. Issue eviction command to ComfyUI  
  const res \= await fetch(COMFYUI\_FREE\_URL, {  
    method: "POST",  
    headers: { "Content-Type": "application/json" },  
    body: JSON.stringify({ unload\_models: true, free\_memory: true })  
  });

  if (\!res.ok) {  
    throw new Error(\`\[VRAM\] /free request failed with status: \${res.status}\`);  
  }

  // 2\. Enter polling gate backed by nvidia-smi verification  
  const startTime \= Date.now();  
  const targetFreeMb \= baselineFreeMb \- toleranceMb;

  while (Date.now() \- startTime \< timeoutMs) {  
    const { freeMb } \= await sampleGpuVram();

    if (freeMb \>= targetFreeMb) {  
      console.log(\`\[VRAM\] Hygiene verified. Free: \${freeMb}MB (Target: ≥\${targetFreeMb}MB)\`);  
      return; // Gate passed safely  
    }

    // Yield execution loop to allow I/O and driver unwinding  
    await new Promise(resolve \=\> setTimeout(resolve, 250));  
  }

  // 3\. Circuit Breaker tripped: Memory failed to return to baseline  
  throw new Error(  
    \`\[VRAM\] Memory leak or locked CUDA context detected\! Failed to recover within \${timeoutMs}ms.\`  
  );  
}

### **4\. PyTorch Virtual Memory Fragmentation & Process Recycling**

Even when nvidia-smi reports sufficient total unallocated megabytes after a /free flush, long production runs can fall victim to the **Phantom Free-Memory Trap**.

PHYSICAL VRAM (Reported by nvidia-smi: 21.5 GB Free)  
┌───────┬────────────┬───────┬────────────┬───────┬────────────┬───────┐  
│ Alloc │    Free    │ Alloc │    Free    │ Alloc │    Free    │ Alloc │  
│ 128MB │   4.2 GB   │ 64MB  │   3.8 GB   │ 256MB │   5.1 GB   │ 32MB  │  
└───────┴────────────┴───────┴────────────┴───────┴────────────┴───────┘  
❌ Contiguous Block Check for Video Latent: REQUIRES 14.0 GB CONTIGUOUS\!  
💥 RESULT: Out of Memory (Fragmented Heap) despite 21.5 GB total free\!

> * **Heap Fragmentation:** PyTorch’s caching allocator (cudaMalloc / cudaFree) retains virtual address pools to prevent high-latency Linux kernel context calls during iteration. When switching across disparate multi-modal topologies—cycling from 1D audio sample arrays to variable-length text embedding matrices, to 5D video latent tensors \[*B*,*C*,*T*,*H*,*W*\]—the memory space becomes heavily fragmented with un-coalesced free blocks.  
> * **The Contiguous Block Deficit:** When Wan 2.2 attempts to initialize its multi-gigabyte spatial-temporal attention matrix, it requires an unbroken, contiguous physical address span (e.g., ≥14.0 GB). If the largest contiguous block is only 5.1 GB, PyTorch throws a fatal CUDA OOM error despite nvidia-smi showing \>21 GB of cumulative free space.

#### **Automated Process Recycling (The Hard Boundary Reset)**

To prevent heap fragmentation over multi-hour production schedules, media-broker implements automated **Process Recycling**:

> * **Monotonic Execution Counter:** The daemon tracks the number of rendered plates processed by the child process.  
> * **The 25-Shot Limit:** Upon reaching **25 consecutive completed shots**, or immediately when transitioning across major stage boundaries (e.g., from Stage 2 audio batching to Stage 3 video diffusion), media-broker initiates a clean, graceful restart of the headless ComfyUI child process.  
> * **Kernel Pointer Destruction:** Terminating the host Python process forces the Linux kernel and NVIDIA display driver (nvidia.ko) to forcibly reclaim all allocated virtual memory tables and driver contexts. This completely destroys the fragmented PyTorch memory arena and restores an unfragmented 24 GB physical address space before diffusion sampling begins.

### **5\. Architectural Isolation: The Dual-Rig Hardware Split**

To avoid running this eviction cycle continuously on every single shot, the production architecture permanently separates CPU-bound tasks from GPU tensor generation:

┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐  
│ RIG 1: ORCHESTRATION & COMPILATION     │       │ RIG 2: HEAVY GPU RENDER FOUNDRY        │  
│ (Zero GPU / Pure System RAM & CPU)     │       │ (Dedicated Silicon / High VRAM)        │  
├────────────────────────────────────────┤       ├────────────────────────────────────────┤  
│ • worker-sower-engine (Conductor)      │       │ • Headless ComfyUI Daemon (:8188)      │  
│ • Local Canon DB (SQLite / Ledger)     │       │ • 100% of VRAM dedicated to:           │  
│ • Dialogue AST Drafting (llama.cpp)    │  ──►  │     \- Native ComfyUI Audio Passes      │  
│ • Local Audio Microservice (:8000)     │ JSON  │     \- Wan 2.2 Diffusion Passes         │  
│ • Temporal Quantizer (ffprobe CLI)     │  IPC  │ • media-broker Controller (:3000)      │  
│ • Optical Compositor (Remotion CLI)    │       │     \- Permanent OS flock on GPU        │  
│   (Forced to software: \--gl=swangle)   │       │     \- Relative nvidia-smi verification │  
│ • Resource Profile: 0 MB VRAM          │       │     \- 25-Shot Process Recycling Reset  │  
└────────────────────────────────────────┘       └────────────────────────────────────────┘

> * **Rig 1 isolates the non-CUDA stack completely:** Spawning headless Chromium instances (@remotion/renderer) or audio workers on Rig 2 triggers system memory thrashing, driver conflicts, and kernel OOM kills. Rig 1 absorbs all DOM rasterization (using SwiftShader \--gl=swangle) and FFmpeg encoding in system RAM.  
> * **Drafting Offload:** Running the dialogue AST drafting pass on Rig 1's CPU/RAM via llama.cpp permanently eliminates Turn 1 (the 10 GB Qwen model) from Rig 2\.  
> * **Optimized Foundry Cycle:** Rig 2's GPU memory is reserved exclusively for acoustic synthesis and high-resolution video diffusion, eliminating one full load/eviction PCIe cycle per production batch and maximizing hardware uptime.

---

*User prompt: {{FOCUS:Permanent Active Mutex: Holds an unconditional OS-level file lock (flock) on GPU interfaces}} /extreme-details*

### **Response: Permanent Active Mutex: Unconditional OS-Level File Lock (flock) on GPU Interfaces**

The **Permanent Active Mutex** enforced via an operating system–level file lock (flock) on Rig 2 represents the physical boundary of compute sovereignty within the production architecture. Rather than delegating GPU state authority to a remote orchestrator over a Wide Area Network (WAN), the architecture inverts traditional distributed locking.

### **1\. The Distributed Failure Mode: The Two-Queue Collision Hazard**

In earlier architectural patterns, the cloud edge—specifically a Cloudflare Durable Object (ShotCoordinatorDO)—acted as the master authority, dispatching imperative commands that declared down to the local worker: *"You own the GPU now"*.

Under real-world network conditions, this topology introduces the **Two-Queue Collision Hazard**:

                           THE TWO-QUEUE COLLISION HAZARD  
                             
   \[ Remote Cloud Edge (DO) \]                              \[ Local Rig 2 (Foundry) \]  
               │                                                       │  
               ├───── Job A Leased to Rig 2 (Epoch N) ────────────────►│ (GPU starts diffusion pass)\[cite: 1, 2\]  
               │                                                       │  
               │   x──── Transient Network Partition / Delay ────x     │ (GPU still rendering Job A)\[cite: 1, 2\]  
               │                                                       │  
               ├─ Watchdog Timer Trips (30s silence)\[cite: 1, 2\]  
               ├─ DO assumes Worker dead; revokes lease\[cite: 1, 2\]  
               ├─ DO reassigns Job A to Worker B / Epoch N+1\[cite: 1, 2\]  
               │                                                       │  
               │   x──── Network Reconnects / Worker B Hits GPU ───x   │  
               │                                                       ▼  
               └──────────────────────────────────────────────► \[ FATAL COLLISION \]  
                                                                • Two claimants on 1 GPU\[cite: 1, 2\]  
                                                                • Concurrent VRAM allocation\[cite: 1, 2\]  
                                                                • CUDA OUT-OF-MEMORY (OOM)\[cite: 1, 2\]

> 1. **The Partition:** Rig 2 begins a compute-intensive diffusion pass (e.g., Wan 2.2 requiring 20 GB+ VRAM). A network blip or dropped Cloudflare Tunnel silences the heartbeat stream for 30–35 seconds.  
> 2. **The Cloud Revocation:** The edge DO's hardware watchdog alarm (ctx.storage.setAlarm()) trips, revoking the lease under Epoch *N* and reassigning the job or opening the queue to a secondary worker under Epoch *N*\+1.  
> 3. **The Local Reality:** Rig 2's physical GPU is completely unaware that its lease was revoked upstream; it continues executing its multi-frame diffusion run.  
> 4. **The Collision:** When the network heals or an incoming job command arrives, two distinct execution tasks attempt simultaneous tensor allocations on the same graphics card. Consumer GPUs lack virtualization support to carve up memory dynamically under these workloads; concurrent allocations exceed the 24 GB envelope, triggering an instant, unrecoverable CUDA: Out of Memory abort that terminates the ComfyUI process.

### **2\. The Architectural Correction: Inverted Mutex Sovereignty**

To eliminate this concurrency failure by physical construction rather than fragile network timing, the authority relationship is completely inverted:

Remote DO⟶Logical Request Queue⟶Local media-broker⟶OS flock⟶GPU Silicon\[cite: 1, 2, 8\]

> * **The Local Lock is Permanent and Unconditional:** The local execution daemon (media-broker on Rig 2\) holds an OS-level file lock (flock) on the GPU interface descriptor *always*—not merely during offline fallbacks or error states.  
> * **The Edge is a Passive Queue, Not a Commander:** The ShotCoordinatorDO holds zero authority to command, lock, or seize the physical silicon. It is strictly a passive, single-threaded First-In, First-Out (FIFO) request queue.  
> * **Pull-Only Semantics:** The edge never pushes a job down to execute directly on hardware. Instead, media-broker polls or claims a lease from the edge DO *only when its local hardware lock is released and the card is idle*.  
> * **Collapsing the Two-Queue State:** Because execution strictly requires acquiring the physical, local file descriptor lock first, there is only ever **one lock in existence**, and it lives locally on Rig 2\. A cloud-side lease timeout or queue mutation cannot force an execution onto the GPU while a render is actively running.

### **3\. POSIX flock Implementation Mechanics**

The hardware mutex is implemented at the operating system level, binding the Node.js daemon to POSIX advisory lock interfaces:

// media-broker/src/hardware/gpuLock.ts  
import fs from "node:fs";  
import fcntl from "fs-ext"; // Native POSIX flock bindings

export class GpuHardwareMutex {  
  private lockFd: number | null \= null;  
  private readonly lockFilePath \= "/var/lock/rig2\_gpu.lock";

  /\*\*  
   \* Attempts to acquire an exclusive, non-blocking lock on the GPU lockfile.  
   \* Corresponds to the OS-level system call: flock(fd, LOCK\_EX | LOCK\_NB)  
   \*/  
  public acquireLock(): boolean {  
    if (this.lockFd \!== null) {  
      return true; // Lock already held by this execution instance  
    }

    try {  
      // Ensure file descriptor is open for writing  
      this.lockFd \= fs.openSync(this.lockFilePath, "w");

      // LOCK\_EX: Exclusive lock  
      // LOCK\_NB: Non-blocking; fails immediately with EAGAIN/EWOULDBLOCK if held  
      fcntl.flockSync(this.lockFd, "exnb");  
      return true;  
    } catch (err: any) {  
      if (err.code \=== "EAGAIN" || err.code \=== "EWOULDBLOCK") {  
        // Hardware is currently occupied by an active rendering pass  
        if (this.lockFd \!== null) {  
          fs.closeSync(this.lockFd);  
          this.lockFd \= null;  
        }  
        return false;  
      }  
      throw new Error(\`\[GpuMutex\] Critical kernel failure acquiring lock: \${err.message}\`);  
    }  
  }

  /\*\*  
   \* Releases the OS file lock and closes the file descriptor.  
   \* Corresponds to: flock(fd, LOCK\_UN)  
   \*/  
  public releaseLock(): void {  
    if (this.lockFd \=== null) {  
      return;  
    }

    try {  
      fcntl.flockSync(this.lockFd, "un");  
    } finally {  
      fs.closeSync(this.lockFd);  
      this.lockFd \= null;  
    }  
  }  
}

#### **Kernel Invariants and Platform Assumptions**

> * **Advisory Semantics:** Under POSIX standards, flock(2) is an advisory lock. It operates as an ironclad barrier provided that **all processes interacting with the GPU cooperate by claiming the lock**. To preserve this invariant, media-broker is the sole authorized process permitted to communicate with ComfyUI's local socket (127.0.0.1:8188), preventing rogue shell scripts or manual runs from bypassing the lock.  
> * **Filesystem Guarantees:** The lock file (/var/lock/rig2\_gpu.lock) must reside on a local POSIX-compliant filesystem (such as ext4 or a memory-backed tmpfs). Placing lockfiles on network mounts (e.g., NFS or SMB shares) breaks atomicity due to implementation variances in network file locking. Rig 2 is assumed to be an isolated Linux workstation where file descriptor states are cleaned up by the kernel if a process terminates abruptly.

### **4\. Zero Code-Path Divergence: Offline Spooling via /var/spool/renders**

Inverting the lock solves a major architectural liability: **code-path rot in disaster recovery modes**.

In systems where "offline fallback" is treated as an auxiliary exception routine, the fallback path receives minimal real-world testing, drifting out of date until it fails during an actual outage.

Because the local media-broker holds the OS flock continuously during both connected and disconnected states, **the fallback path is the normal path**:

                        UNIFIED EXECUTION HARNESS  
                                    │  
                       Is Local flock Acquired?  
                                    │  
                                   YES  
                                    │  
                    ┌───────────────┴───────────────┐  
                    ▼                               ▼  
       \[ Online / Tunnel Active \]       \[ Offline / Disconnected \]  
       Pull job from edge DO queue      Pull manifest from local disk:  
       via outbound WebSocket           /var/spool/renders/\*.json\[cite: 1, 2, 8\]  
                    │                               │  
                    └───────────────┬───────────────┘  
                                    ▼  
                     Exact Same Execution Code Path:  
                     • Template parameter injection\[cite: 2\]  
                     • POST http://127.0.0.1:8188/prompt\[cite: 1, 2\]  
                     • Turn-based POST /free VRAM hygiene\[cite: 1, 2\]  
                     • SHA-256 local disk verification\[cite: 1, 2\]

> 1. **Uniform Dispatch:** When the local hardware lock is released, the broker checks its inputs.  
> 2. **Online Pull:** If the outbound Cloudflare Tunnel is connected, it requests the next available job payload from ShotCoordinatorDO.  
> 3. **Offline Fallback:** If the network is down or the edge is unreachable, it checks the local filesystem spool directory (/var/spool/renders) for queued job manifests.  
> 4. **Execution Identity:** Regardless of where the payload originated, the render execution loop—loading the API template, injecting seeds and prompts, calling POST /prompt, managing turn-based /free flushes, and asserting output frame counts—executes the exact same functions.

### **5\. Architectural Comparison: Cloud-Authoritative vs. Local-Sovereign Mutex**

| Dimension | Cloud-Authoritative Mutex (Anti-Pattern) | Local flock Sovereignty (Production Architecture) |
| :---- | :---- | :---- |
| **Lock Location** | Remote memory / Cloudflare Durable Object | Local OS kernel descriptor (/var/lock/rig2\_gpu.lock) |
| **Command Topology** | Edge pushes execution commands down to Rig 2 | Local broker pulls requests up from the edge queue |
| **Behavior During Network Jitter** | Watchdog trips; reassigns job; causes dual-claimant OOM crashes | Local lock remains engaged; incoming network work is blocked |
| **Hardware Crash Probability** | High (memory collisions under packet drop scenarios) | Zero (hardware admits strictly one execution context at a time) |
| **Offline Independence** | Machine freezes or requires manual operational recovery | Autonomous execution continues via /var/spool/renders |

---

*User prompt: {{FOCUS: Authoritative over local execution state, VRAM headroom, and content-addressed SHA-256 asset hashing}} /extreme-details*

Response: The demarcation of authority between the Cloudflare Edge and the local GPU Foundry is defined by a strict architectural division: **The Edge Director governs distributed coordination and lease scheduling, while the Media Broker (rig2-broker) holds absolute, un-delegated authority over physical silicon execution state, real-time VRAM headroom, and content-addressed asset integrity.**

This tri-fold authority ensures that remote network jitter, serverless isolate evictions, or rogue client commands cannot corrupt GPU hardware states, cause multi-tenant CUDA Out-Of-Memory (OOM) crashes, or write poisoned artifacts to cold storage.

### **1\. Authority Over Local Execution State (The Hardware Mutex & The Dumb Executor)**

In the Generative Production Pipeline, physical execution authority is inverted: **the local machine maintains sovereignty over its silicon, treating the remote Cloudflare Durable Object (ShotCoordinatorDO) strictly as a passive, disposable request queue.**

┌────────────────────────────────────────────────────────────────────────┐  
│                   SOVEREIGN STATE MACHINE (Rig 2\)                      │  
│                                                                        │  
│                      \[ IDLE / AWAITING\_SILICON \]                       │  
│                                  │                                     │  
│                     Kernel flock(/var/lock/gpu)                        │  
│                                  ▼                                     │  
│                        \[ HARDWARE\_ACQUIRED \]                           │  
│                                  │                                     │  
│                 Pull Lease: Edge DO OR /var/spool                      │  
│                                  ▼                                     │  
│                        \[ INGESTING\_PAYLOAD \]                           │  
│                                  │                                     │  
│                Validate Zod Schema & Check NVMe Models                 │  
│                                  ▼                                     │  
│               \[ MULTI\_MODAL\_TURN\_EXECUTION\_LOOP \]                      │  
│        (Text AST ──► POST /free ──► Audio ──► POST /free ──► Video)    │  
│                                  │                                     │  
│                     Sentinel: { node: null }                           │  
│                                  ▼                                     │  
│                     \[ SCRATCHPAD\_AUDIT\_&\_HASH \]                        │  
│                                  │                                     │  
│                 Assert Hash \!= EMPTY\_STRING\_SHA256                     │  
│                                  ▼                                     │  
│                     \[ CONTENT\_ADDRESSED\_EGRESS \]                       │  
│                                  │                                     │  
│                  Upload Staged Key ──► DO Commit RPC                   │  
│                                  ▼                                     │  
│                       \[ HARDWARE\_RELEASED \]                            │  
└────────────────────────────────────────────────────────────────────────┘

#### **Direct Kernel Descriptor Management (flock)**

> * **Local Mutex Inversion:** The media-broker binds directly to an OS-level advisory file lock (flock) on /var/lock/rig2\_gpu.lock via native POSIX bindings.  
> * **Single Authority Invariant:** The edge DO never pushes an imperative command to initialize render pipelines. The media-broker polls for work using pull semantics *only after* acquireLock() claims the local physical descriptor.  
> * **Partition Immunity:** If the outbound Cloudflare Tunnel disconnects, the edge DO watchdog timer (ctx.storage.setAlarm()) trips at 30 seconds and revokes the lease upstream. However, because the media-broker maintains its local OS flock during the entire ComfyUI sampling loop, no incoming job from any client can force a concurrent tensor allocation onto the GPU, completely eliminating the **Two-Queue Collision Hazard**.

#### **Autonomous Degradation (/var/spool/renders)**

> * The media-broker enforces **Zero Code-Path Divergence**. When the WAN is severed, the internal execution engine does not enter a divergent "emergency mode".  
> * It simply points its unified task pull loop away from the WebSocket tunnel and toward a local filesystem directory: /var/spool/renders/\*.json. Model loading, parameter injection, VRAM eviction, and validation execute identically, preserving full offline studio velocity.

### **2\. Authority Over VRAM Headroom & Multi-Modal Memory Eviction**

Because consumer workstation silicon (NVIDIA RTX 3090/4090/5070 with 24 GB VRAM) cannot concurrently host large language models (9–10 GB), neural speech checkpoints (4–6 GB), and spatial-temporal video diffusion models (16–22 GB), **the media-broker is the sole authority governing VRAM headroom and turn-based weight eviction.**

CONCURRENT MEMORY PROFILE (FATAL COLLISION):  
┌────────────────────┬────────────────────┬──────────────────────────────┐  
│  Qwen 2.5 14B GGUF │  CosyVoice / TTS   │     Wan 2.2 Latent Video     │  
│   (\~9 to 10 GB)    │    (\~4 to 6 GB)    │        (16 to 22 GB)         │  
└────────────────────┴────────────────────┴──────────────────────────────┘  
TOTAL REQUIRED: \~29 GB to 38 GB  ──► 💥 CUDA: Out of Memory Error\!

SERIALIZED TURN-BASED EXECUTION PROFILE (SOVEREIGN BROKER HYGIENE):  
Turn 1: \[ Qwen 2.5 14B (9GB) \] ──► POST /free ──► nvidia-smi assert free \>= 21GB  
Turn 2: \[ Audio Model  (5GB) \] ──► POST /free ──► nvidia-smi assert free \>= 21GB  
Turn 3: \[ Wan 2.2 DiT (21GB) \] ──► POST /free ──► Clean Baseline Restored

#### **Subprocess Hardware Polling via nvidia-smi**

ComfyUI's internal aiohttp web server can stall or delay response cycles under heavy CUDA graph initialization. Therefore, media-broker bypasses internal HTTP metrics and polls the NVIDIA display driver directly via child process executions:

nvidia-smi \--id=0 \--query-gpu=memory.total,memory.used,memory.free,utilization.gpu \--format=csv,noheader,nounits

> * **Dynamic Baseline Calibration:** At boot, media-broker samples idle VRAM (Baselinefree​) to account for host display compositors (X11/Wayland claiming ∼1 GB).  
> * **The Asynchronous Gate Check:** Calling POST \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) with { unload\_models: true, free\_memory: true } merely queues an unmapping task in PyTorch. The broker blocks further execution until nvidia-smi confirms:  
>   Currentfree​≥(Baselinefree​−500 MB)  
>   If memory is not reclaimed within a 15-second timeout, the broker trips an internal circuit breaker, identifies memory leaks, and isolates the execution spoke.

#### **Virtual Memory Defragmentation & Process Recycling**

Over continuous multi-hour production schedules, PyTorch’s caching allocator accumulates virtual memory fragmentation. Even when nvidia-smi reports 21 GB of total unallocated space, the heap may lack a single contiguous block large enough to house Wan 2.2’s multi-gigabyte 3D attention matrices (16 channels×8×spatial×4×temporal).

> * The media-broker tracks consecutive shot completions via a monotonic internal counter.  
> * Exactly every **25 completed shots**, or upon stage boundaries (e.g., exiting batch audio to enter batch video diffusion), the broker triggers **Process Recycling**—gracefully killing and restarting the headless ComfyUI child process to force the Linux kernel and NVIDIA driver (nvidia.ko) to unmap all CUDA contexts and restore an unfragmented physical address space.

### **3\. Authority Over Content-Addressed SHA-256 Asset Hashing & Staged Egress**

Because generative diffusion outputs cannot be reproduced bit-for-bit across differing hardware drivers, samplers, or CUDA versions, **rendered artifacts cannot be treated as derivable state—they are immutable historical evidence.** The media-broker serves as the authoritative cryptographic notary before any artifact touches the Cloudflare R2 archive.

#### **The Defensive Scratchpad Audit**

When ComfyUI emits its completion sentinel ({ "executing": { "node": null } }), media-broker takes ownership of the raw artifact in the local scratch directory (ComfyUI/output/) and enforces a multi-tier integrity audit:

\[ ComfyUI Completion Sentinel: { node: null } \]  
                       │  
                       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│            BROKER SCRATCHPAD AUDIT (src/storage/audit.ts)              │  
│                                                                        │  
│ 1\. Assert Byte Length: stat.size \>= 1024 bytes                         │  
│ 2\. Empty-Hash Trap: Assert Hash \!= e3b0c44298fc1c...b855               │  
│ 3\. ffprobe Binary Verification:                                        │  
│    • Container moov atom present and healthy                           │  
│    • Decoded stream frames \== payload.target\_frames (24 fps)           │  
└──────────────────────────────────────┬─────────────────────────────────┘  
                                       │ Pass  
                                       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│             CONTENT-ADDRESSED CRYPTOGRAPHIC NOTARIZATION               │  
│                                                                        │  
│  Digest \= SHA-256(RawBytes)                                            │  
│  Staging Key \= staging/renders/\${taskId}/epoch\_\${epoch}\_\${Digest}.mp4  │  
│  Streaming Upload to Cloudflare R2 via @aws-sdk/client-s3 (\$0.00 Egress│  
└──────────────────────────────────────┬─────────────────────────────────┘  
                                       │ Pass  
                                       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│                   THE ATOMIC PROMOTION RPC GATE                        │  
│                                                                        │  
│  media-broker dispatches RPC to edge-director:                         │  
│  POST /tasks/complete { taskId, epoch, sha256: Digest, key }           │  
│                                                                        │  
│  Edge Durable Object evaluates monotonic token:                        │  
│    IF (incoming.epoch \== active.epoch):                                │  
│       Promote Staging Key to Canonical Manifest                        │  
│       HTTP 200 OK \-\> Broker emits complete; releases local flock       │  
│    ELSE:                                                               │  
│       HTTP 409 Conflict \-\> Stale Zombie Rejected                       │  
│       Bytes reaped by R2 7-day lifecycle; zero canon contamination     │  
└────────────────────────────────────────────────────────────────────────┘

> 1. **The Minimum Byte Floor & Truncation Guard:** The broker reads file stats and verifies that byteLength \>= 1024 bytes. Any partial write or broken stream terminates immediately with an exit code.  
> 2. **The Zero-Byte Poison Sentinel Trap:** The broker hashes the byte stream using SHA-256 and asserts that it does not equal the empty-string constant:  
>    EMPTY\_FILE\_HASH=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>    If this value appears, the broker catches the upstream write failure locally, preventing corrupted zero-byte assets from registering in the manifest.  
> 3. **Codec & Frame Lattice Assertions (ffprobe):** The broker invokes ffprobe to verify that the MP4 container structure (moov atom) is uncorrupted and that the decoded stream duration matches the discrete integer frame budget (4*n*\+1 temporal lattice conformed to master 24 fps) derived during upstream acoustic quantization.

#### **Content Addressing and Structural Fencing**

> * **Immutable Key Formulation:** Artifacts are keyed strictly by their cryptographic content digest:  
>   r2://plates/sha256\_{SHA-256 Digest}.mp4  
>   Because the hash is tied to the physical bytes, files are content-addressed and cannot overwrite existing assets.  
> * **The Promotion Gate:** Because S3/R2 APIs cannot natively validate application-level monotonic fencing tokens on raw PUT requests, the broker uploads to an epoch-scoped staging key (staging/renders/\${taskId}/epoch\_\${epoch}\_\${sha256}.mp4).  
> * **The Atomic Commit:** The broker calls POST /tasks/complete on the edge DO, passing the calculated hash and epoch. The DO atomically checks the token; if valid, the staging key is promoted to canonical production truth. If the worker was partitioned and superseded, the DO rejects the call with HTTP 409 Conflict. The zombie bytes are ignored by the canonical manifest and cleaned up by R2's 7-day lifecycle retention rules.

### **Architectural Authority Matrix**

| Domain Vector | Edge Director (ShotCoordinatorDO) | Media Broker (media-broker / Rig 2\) |
| :---- | :---- | :---- |
| **Physical GPU Silicon** | Zero control; passive FIFO queue only | **Sole Authority:** Holds kernel flock on GPU |
| **Task Dispatch Model** | Passive holder of client lease requests | **Sole Authority:** Pulls work only when silicon is idle |
| **VRAM Hygiene** | Blind to CUDA memory heaps and driver state | **Sole Authority:** Executes POST /free and polls nvidia-smi |
| **Process Stability** | Manages V8 isolate memory only | **Sole Authority:** Recycles ComfyUI child process every 25 shots |
| **Asset Notarization** | Validates incoming hash metadata on promotion | **Sole Authority:** Computes SHA-256 and asserts ffprobe frame parity |
| **Storage Uploads** | Issues signed pre-shared URLs for reads | **Sole Authority:** Streams raw bytes to R2 staging keys |
| **Offline Continuity** | Records backlog queue deltas in Cloudflare D1 | **Sole Authority:** Drains /var/spool/renders locally without network |

---

*User prompt: what are the differences with the worker-sower-conductor*

Response: The differences between the **media-broker** and the **worker-sower-conductor** trace back to the studio’s physical hardware divide between **Rig 1** and **Rig 2**, separating **Assembly & Clock Governance** from **High-VRAM Tensor Execution**.

### **Core Structural Comparison**

| Dimension | worker-sower-conductor | media-broker |
| :---- | :---- | :---- |
| **Physical Host** | **Rig 1** (CPU & System RAM Workstation; 0 MB dedicated VRAM required) | **Rig 2** (The GPU Foundry Workstation; dedicated high-VRAM GPU) |
| **Primary System Role** | **Pipeline Conductor & Local Assembly Host** (Governs time, sound, and the edit) | **Silicon Driver & Dumb Execution Spoke** (Governs physical GPU rendering passes) |
| **Operational Domain** | **Physical Time, Master Acoustic Clock, & Optical Media** | **Headless Tensor Diffusion & K-Sampling** |
| **Child Process Authority** | Spawns POSIX CLI tools: ffprobe, @remotion/renderer, and git | Controls ComfyUI via IPC / loopback HTTP (POST /prompt, POST /free) |
| **VRAM & Hardware Mutex** | Does **not** manage GPU VRAM; keeps zero CUDA/PyTorch dependencies | Holds an unconditional OS-level file lock (flock) on /var/lock/rig2\_gpu.lock |
| **Audio Responsibilities** | Treats sound as master clock: calls TTS (:8000), quantizes audio duration into frames | Pure visual compute executor; handles zero audio synthesis or playback |
| **Optical Video Assembly** | Pulls chroma keys and composites final master .mp4 via Remotion in system RAM | Generates raw uncomposited \#00FF00 greenscreen plates; **banned** from running Remotion |
| **Canon & Historical State** | Drains uncommitted deltas from the edge and seals the Git ledger (gitSealer.ts) | Completely stateless compute spoke; holds no canon and tracks no story state |

### **Deep-Dive Architectural Differences**

#### **1\. Hardware Demarcation & Compute Bounds**

> * **worker-sower-conductor (Rig 1):** Built to be entirely I/O-bound, memory-bound, and multi-threaded CPU-bound. It requires **zero dedicated GPU compute or VRAM**. Spawning headless Chromium browser instances or FFmpeg encoders on a GPU machine causes system memory thrashing and Linux kernel OOM panics; therefore, all DOM-based keying and timeline slicing are quarantined strictly to Rig 1\.  
> * **media-broker (Rig 2):** Dedicated entirely to driving headless ComfyUI on port 8188\. It uses 100% of available GPU VRAM (e.g., 24 GB) for heavy spatial-temporal diffusion (Wan 2.2) and LoRA passes. It manages hardware hygiene, baseline VRAM auditing via nvidia-smi, and process recycling.

#### **2\. Temporal Clock Authority vs. Raster Spoke**

> * **worker-sower-conductor (The Clock Authority):** Time in this pipeline is defined acoustically, not visually. The conductor takes the upstream dialogue\_ast.json, calls the local Python TTS service on port 8000, and spawns ffprobe to measure the exact millisecond duration of the resulting .wav stems. It applies the non-negotiable temporal quantization ceiling formula:  
>   target\_frames=⌈(1000duration\_ms​)×24⌉  
>   It then conforms this duration to the diffusion model's 3D causal VAE lattice (4*n*\+1) and packages it into a SpokeExecutionPayload.  
> * **media-broker (The Dumb Executor):** It has **no awareness of pacing, rhythm, or timing**. It passively receives the pre-calculated targetFrames integer inside the payload, injects it into the workflow API template (e.g., wan\_greenscreen\_i2v.json), and instructs ComfyUI to sample that exact number of latent frames.

#### **3\. Optical Compositing vs. Raw Plate Generation**

> * **worker-sower-conductor (The Optical Printer):** Houses the Remotion harness (src/remotion/). Once raw character plates are returned from Rig 2 or fetched from Cloudflare R2, the conductor invokes @remotion/renderer CLI subprocesses using a software OpenGL backend (gl: 'swangle') to strip greenscreen backgrounds, apply Foley/audio beds, duck ambient sounds, and render the broadcast-ready master episode in RAM.  
> * **media-broker (Plate Foundry Only):** Only outputs raw, uncomposited character plates keyed against \#00FF00 green. **It is strictly forbidden from running Remotion or loading Chromium** to prevent multi-tenant driver contention and CUDA crashes.

#### **4\. Canon Sealing vs. Ephemeral Execution**

> * **worker-sower-conductor (Canon Ledger Custodian):** Holds direct authority over repository history. Through gitSealer.ts, it contacts the upstream edge Durable Object (SowerDO), drains uncommitted staging memory deltas (character relationship shifts, injury vectors, and inventory mutations), verifies the local relational database DAG, and executes cryptographically signed Git commits to stamp state *Sn*​→*Sn*\+1​ permanently into Git history.  
> * **media-broker (Stateless Asset Spoke):** Retains no memory of what happened in the story, who won a duel, or what canon is active. Its sole egress is uploading the completed .mp4 plate to Cloudflare R2 under an immutable SHA-256 hash key and reporting completion back to the edge.

### **The Production Handoff in Summary**

Rig 1 (Acoustic Clock, Frame Budgets, Remotion Master)worker-sower-conductor​​SpokeExecutionPayload​Cloudflare Edge (Queue / Lease Mutex)edge-director​​Lease Dispatch​Rig 2 (flock Mutex, VRAM Hygiene, Wan 2.2 Plate)media-broker​​\[cite: 1, 2\]

The **worker-sower-conductor** acts as the general contractor assembling all physical media components on Rig 1’s CPU, while the **media-broker** acts as the physical machine hand on Rig 2 that executes the GPU diffusion tasks and hands the raw footage back.

---

*User prompt: what is the complete flow in a non tabled outline from the worker-sower-engine to the media-broker*

Response: The complete operational flow from **worker-sower-engine** (the upstream narrative simulation core and conductor on Rig 1\) to **media-broker** (the physical execution spoke on Rig 2\) operates through a strict separation between **meaning** and **representation**.

### **Phase 1: Upstream Narrative Simulation (The Sower Core on Rig 1\)**

> * **Static Canon Law Ingestion:** The worker-sower-engine executes a read-only filesystem import of compiled world law (bible-state.json, character schemas, grievance registries) from 000.goblin-lore via @snailicid3/consumer-npm, validating all entity relationships with strict Zod schemas.  
> * **Dynamic Relational Ledger Hydration:** The simulation engine queries the dynamic runtime ledger (SQLite/PostgreSQL) to read mutable world states: actor spatial coordinates, somatic trauma/condition decays, resentment meters, and ticking Paranoia Clocks.  
> * **Spatial Proximity & Grievance Selection:** Stage 3 executes spatial sweeps across hex coordinates to find physically adjacent actors and runs PRNG-weighted lotteries factoring in tension scores and cooldown timers to select duel pairings and eligible grievances.  
> * **Mechanical Resolution:** Stage 4 mathematically resolves duel outcomes using opposed 2d6 dice mechanics evaluated against Spite and Cunning margins, applying String expenditures and calculating mutual wounds or retreats.  
> * **Atomic State Mutation:** The simulation core executes an atomic state transition (*Sn*​→*Sn*\+1​), committing the resulting trauma, debt tokens, and inventory shifts to the live relational database.  
> * **Semantic AST Compilation:** Stage 5 uses an LLM bounded by strict GBNF grammars and "Ignorance by Omission" context filtering to extract dialogue text, speaker IDs, somatic constraints, and emotional subtext, emitting the immutable contract artifact drafts/dialogue\_ast.json.

### **Phase 2: Temporal Quantization & Conductor Assembly (Rig 1 POSIX Conductor)**

> * **Conductor Contract Ingress:** The master orchestration harness inside src/pipeline/produceEpisode.ts captures dialogue\_ast.json and bridges external I/O tools without polluting the simulation core.  
> * **Acoustic Speech Synthesis:** The conductor issues HTTP POST requests to a local Python Text-to-Speech microservice listening on port 8000, synthesizing uncompressed 48 kHz .wav audio stems for each dialogue line.  
> * **Temporal Quantization via ffprobe:** The conductor spawns a native POSIX ffprobe child process to measure the exact millisecond duration of every audio stem and compute the discrete integer frame budget at 24 fps using non-negotiable ceiling arithmetic:  
>   target\_frames=⌈(1000duration\_ms​)×24⌉  
> * **Causal VAE Lattice Conformance:** The frame budget is adjusted to conform to the diffusion model's temporal stride (4*n*\+1 causal VAE lattice) to prevent downstream decode truncations.  
> * **Standardized Job Payload Compilation:** The conductor packages the quantized frame budget, scene identifier, positive prompts, LoRA tags, and seeds into a strongly typed, hardware-agnostic SpokeExecutionPayload.

### **Phase 3: Edge Gateway Ingress & Concurrency Coordination (edge-director)**

> * **HTTP Dispatch to the Edge:** The Rig 1 conductor dispatches POST /dispatch carrying a signed JWT and the SpokeExecutionPayload to the Cloudflare EdgeGateway.  
> * **Continuity State Verification:** The edge gateway performs a sub-5ms query against Cloudflare D1 to assert that the scene continuity flag is clean (is\_dirty \== 0\) before routing work forward.  
> * **Durable Object Queue Ingestion:** The payload is forwarded to ShotCoordinatorDO, which checks the client's idempotency key and enqueues the job into a serialized FIFO queue.  
> * **Single-Threaded Mutex Locking:** The Durable Object asserts that no rendering task is active, locks its internal hardware mutex, and allocates a 30-second rolling execution lease.  
> * **Monotonic Epoch Fencing Token:** The Durable Object increments its epoch counter (*N*→*N*\+1) and generates a monotonic fencing token stamped onto the lease dispatch packet.

### **Phase 4: Network Ingress & Hardware Mutex Acquisition (media-broker on Rig 2\)**

> * **Outbound Socket Lease Delivery:** The edge-director transmits the execution lease and payload downward across the persistent, outbound Cloudflare Tunnel (cloudflared) held open by media-broker.  
> * **Local Inverted Mutex Sovereignty (flock):** The media-broker process asserts local hardware control by acquiring an exclusive, non-blocking OS file lock (flock) on /var/lock/rig2\_gpu.lock, ensuring no remote race condition can force concurrent compute onto the GPU.  
> * **Payload Audit & Template Selection:** The broker inspects the payload, validates that required LoRA .safetensors files exist on the local NVMe scratch disk, and selects the matching headless ComfyUI API JSON template (e.g., wan\_greenscreen\_plate.json).  
> * **In-Memory Graph Hydration:** The broker parses the template into memory, directly injecting the targetFrames, positive prompts, seeds, and LoRA paths into the specific node inputs without executing unmanaged Python scripts.

### **Phase 5: Silicon Execution & Memory Hygiene (Headless ComfyUI on Port 8188\)**

> * **Turn-Based VRAM Flush:** Before execution, media-broker issues an HTTP POST to ComfyUI's memory release route at \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) with { unload\_models: true, free\_memory: true }.  
> * **Hardware Polling via nvidia-smi:** The broker spawns a child process querying nvidia-smi to assert that free VRAM has returned to baseline (\>21 GB available on a 24 GB card) before submitting tensor work.  
> * **REST Execution Dispatch:** The hydrated JSON graph is dispatched to ComfyUI's execution queue via POST \[http://127.0.0.1:8188/prompt\](http://127.0.0.1:8188/prompt).  
> * **Thread-Isolated Heartbeat Loop:** While ComfyUI runs diffusion passes in physical VRAM, an independent background timer on Rig 2 emits BROKER\_HEARTBEAT every 10 seconds containing the active fencing token back to edge-director, extending the edge lease watchdog.  
> * **Local WebSocket Telemetry Tapping:** The broker connects to ws://127.0.0.1:8188/ws to consume raw step execution events, normalizing them into BROKER\_PROGRESS packets that are relayed back through the edge DO to the showrunner's dashboard.  
> * **Completion Sentinel Interception:** Headless ComfyUI finishes the diffusion pass, renders the isolated character plate against green (\#00FF00), and emits the terminal completion sentinel { executing: { node: null } } over its local socket.

### **Phase 6: Asset Notarization & Storage Promotion (Egress to Cloudflare R2)**

> * **Scratchpad Integrity Audit:** The media-broker audits the newly rendered .mp4 file in ComfyUI/output/, asserting that the file size is non-zero, that it does not match the empty-string SHA-256 hash, and that container headers are valid.  
> * **Content-Addressed Staging Upload:** The broker streams the binary directly to the project's Cloudflare R2 bucket via @aws-sdk/client-s3 using an epoch-scoped staging key: staging/renders/\${taskId}/epoch\_\${epoch}\_\${sha256}.mp4  
> * **The Atomic Promotion RPC:** The broker sends a BROKER\_COMPLETE RPC to the ShotCoordinatorDO carrying the fencing token, SHA-256 digest, and staging key.  
> * **Fencing Token Assertion & Mutex Release:** The edge DO verifies that the incoming token matches its active epoch, promotes the staged asset key into the canonical manifest, releases its internal queue lock, and broadcasts SHOT\_READY containing the signed R2 URL.  
> * **Downstream Delivery to Rig 1:** The worker-sower-conductor on Rig 1 receives SHOT\_READY, downloads the verified .mp4 plate under Cloudflare R2's \$0.00 egress guarantee, releases the local Rig 2 flock, and hands the plate off to the Remotion optical compositor.

---

*User prompt: {{FOCUS : media-broker (The Dumb Executor): It has no awareness of pacing, rhythm, or timing. It passively receives the pre-calculated targetFrames integer inside the payload, injects it into the workflow API template (e.g., wan\_greenscreen\_i2v.json), and instructs ComfyUI to sample that exact number of latent frames. }} /extreme-details*

### **Response: The Dumb Executor: Temporal Blindness & Mechanical Latent Allocation**

The core operational principle of the **media-broker** (running as a local daemon on Rig 2\) is the **"Dumb Executor" Axiom**.

Unlike upstream components (such as the worker-sower-conductor or worker-sower-engine on Rig 1), the media-broker has **no concept of narrative time, dramatic pacing, acoustic rhythm, biological cadence, or lip-sync requirements**. It is completely blind to whether a shot depicts an intense duel, a somber monologue, or an ambient pause.

The media-broker acts solely as an unthinking hardware transducer: **it receives a pre-quantized integer, injects it into a target node inside an allowlisted API template, and forces ComfyUI to sample that exact number of latent frames**.

### **1\. The Pacing Decoupling Axiom (Why the Foundry Must Be Dumb)**

In generative animation, allowing the GPU rendering spoke to make temporal decisions causes systemic failure:

> * **Diffusion Models Have No Inherent Cadence:** Generative video diffusion backends (like Wan 2.1 or Wan 2.2) possess zero semantic understanding of how long a spoken line takes to deliver. If a diffusion worker calculates its own frame counts based on prompt text or heuristics, the resulting video plate invariably suffers from rubbery lip-sync, floating audio pauses, or abrupt head-tail cutoffs.  
> * **Audio Is the Architect of Time:** In this pipeline, **audio is the empirical master clock**. Upstream on Rig 1, worker-sower-conductor synthesizes the uncompressed .wav dialogue stems first and measures their exact physical waveform duration using native POSIX ffprobe:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉  
> * **The Mathematical 4*n*\+1 Lattice Conformance:** The conductor aligns this raw duration to the model’s 3D causal VAE lattice (4*n*\+1) so the latent tensor decoder does not crash:  
>   diffusion\_allocation=4×⌈4*N*−1​⌉+1  
> * **The Handoff:** By the time the SpokeExecutionPayload reaches Rig 2 across the Cloudflare edge, **all temporal math is already finished, validated, and frozen**. The media-broker is relieved of all temporal responsibility.

               TEMPORAL GOVERNANCE VS. DUMB EXECUTION  
                 
    \[ Rig 1: worker-sower-conductor \]   
      • Holds the Master Physical Clock (Acoustic Truth)\[cite: 1, 13\]  
      • Synthesizes Speech Stems (:8000)\[cite: 1, 6\]  
      • Measures duration\_ms via ffprobe\[cite: 1, 6\]  
      • Calculates 4n \+ 1 VAE Lattice Math (e.g., 77 frames)\[cite: 1, 4\]  
                     │  
                     ▼ (SpokeExecutionPayload via Edge DO)\[cite: 1, 2\]  
    ┌────────────────────────────────────────────────────────┐  
    │ RIG 2: media-broker (The Dumb Executor)                │  
    ├────────────────────────────────────────────────────────┤  
    │ • Zero awareness of pacing, speech, or scene rhythm   │\[cite: 1, 2\]  
    │ • Reads pre-calculated targetFrames: 77                │\[cite: 1, 2\]  
    │ • Injects 77 into node inputs in memory                │\[cite: 1, 2\]  
    │ • Dispatches POST http://127.0.0.1:8188/prompt         │\[cite: 1, 2\]  
    │ • Samples exact latent tensor depth                    │\[cite: 1, 2\]  
    │ • Egresses raw \#00FF00 plate to Cloudflare R2          │\[cite: 1, 2\]  
    └────────────────────────────────────────────────────────┘

### **2\. In-Memory Graph Ingestion & Parameter Injection**

The media-broker never executes arbitrary, unvalidated Python scripts or interactive user flows. It holds a local library of vetted API workflow templates on its NVMe scratch drive (e.g., wan\_greenscreen\_i2v.json, flux\_matte\_background.json) exported directly from ComfyUI Dev Mode.

When media-broker claims an execution lease from edge-director's ShotCoordinatorDO, it ingests the SpokeExecutionPayload and hydrates the template in memory:

// Example: media-broker In-Memory Parameter Injection Logic  
import fs from "node:fs";  
import path from "node:path";  
import { SpokeExecutionPayload } from "@pipeline/types";

export async function hydrateWorkflow(payload: SpokeExecutionPayload): Promise\<Record\<string, any\>\> {  
  // 1\. Load allowlisted API template from disk (never from network payload)  
  const templatePath \= path.join(\_\_dirname, "../workflows", payload.workflowTemplate);  
  const rawTemplate \= fs.readFileSync(templatePath, "utf-8");  
  const workflow \= JSON.parse(rawTemplate);

  // 2\. Identify target nodes declared in contract or template config  
  const frameNodeId \= payload.payload.targetFrameNodeId;   // e.g., "37" (WanLatentImage / EmptyWanLatentVideo)  
  const promptNodeId \= payload.payload.targetPromptNodeId; // e.g., "6"  (CLIPTextEncode)  
  const seedNodeId \= payload.payload.targetSeedNodeId;     // e.g., "3"  (KSamplerAdvanced)

  // 3\. Blind parameter injection (Passive mapping)  
  // The broker does not modify or evaluate diffusionAllocation; it passes it directly to ComfyUI  
  workflow\[frameNodeId\].inputs.length \= payload.payload.diffusionAllocation; // e.g., 77 frames  
  workflow\[promptNodeId\].inputs.text \= \`\${payload.payload.prompt}, chroma key \#00FF00, crisp silhouettes\`;  
  workflow\[seedNodeId\].inputs.seed \= payload.payload.seed;

  return workflow;  
}

> * **Node 37 (WanLatentImage):** Injects the exact integer (diffusionAllocation, e.g., 77\) into the latent batch length input.  
> * **Node 06 (CLIPTextEncode):** Injects the positive prompt text alongside the isolation tokens (\#00FF00 background, rim lighting).  
> * **Node 03 (KSampler):** Binds the deterministic PRNG seed.  
> * **Graph Emission:** The mutated JSON dictionary is POSTed directly to ComfyUI's loopback endpoint: POST \[http://127.0.0.1:8188/prompt\](http://127.0.0.1:8188/prompt).

### **3\. Latent Tensor Shape Allocation in ComfyUI**

Once ComfyUI ingests the hydrated JSON, the injected targetFrames integer directly determines the geometric tensor allocation in Rig 2’s GPU VRAM:

Latent Batch Shape=\[*B*,*C*,4*T*−1​\+1,8*H*​,8*W*​\]

For a 77-frame Wan 2.2 allocation rendered at 1280×720 with batch size *B*\=1 and *C*\=16 latent channels:

> * **Temporal Downsampling:** (77−1)/4+1=20 latent temporal slices  
> * **Spatial Downsampling (8×):** 160×90 spatial latents  
> * **GPU Memory Footprint:** The headless daemon allocates the 3D latent tensor array across 100% of the available 24 GB VRAM, dedicated entirely to K-Sampler denoising.

The media-broker does not evaluate whether the generated motion looks fast, slow, or natural. Its telemetry tap (ws://127.0.0.1:8188/ws) simply tracks sampling step counts (1→50), relays normalized BROKER\_PROGRESS packets up the tunnel, and waits for ComfyUI's completion sentinel: { "executing": { "node": null } }.

### **4\. Post-Render Conformance: Where the Illusion of Timing Is Reconciled**

Because the media-broker sampled an aligned 4*n*\+1 frame count (e.g., 77 frames) rather than the exact raw delivery count (e.g., 75 frames), **the output video plate is physically longer than the spoken dialogue**.

However, conforming the raw plate to the timeline is **not the broker's job**:

> 1. **The Dumb Upload:** The media-broker takes the finished sh01\_greenscreen.mp4 from ComfyUI/output/, verifies that the byte size is non-zero, hashes it via SHA-256, and uploads it directly to Cloudflare R2.  
> 2. **The Remotion Conformance (Back on Rig 1):** The upstream conductor (worker-sower-conductor) receives SHOT\_READY, downloads the plate into its local workspace, and feeds it into the generated React composition (Episode\_XXX.tsx):  
>    \<Sequence durationInFrames={75} from={0}\>  
>      \<CharacterPlate   
>        src="out/ep01\_sc03\_sh001.mp4"   
>        trimEndFrames={2} // Trims the 2 excess 4n+1 lattice frames  
>      /\>  
>      \<Audio src="dialogue\_sh001.wav" /\>  
>    \</Sequence\>

The Remotion master compositor trims the excess padding frames at the tail of the clip, perfectly locking the visual character movement to the dialogue waveform.

By keeping the media-broker as a strictly dumb executor, the architecture guarantees that:

> * Diffusion checkpoints can be swapped without touching narrative timing logic.  
> * Heavy GPU VRAM on Rig 2 is never wasted on non-linear timeline reasoning or CPU-bound audio parsing.  
> * Every rendered pixel matches the immutable acoustic clock locked upstream with single-frame precision.

---

*User prompt: so the \[edge-director\] is connected to the \[media-broker\]*

Response: Yes, the **edge-director** and the **media-broker** are connected via a persistent, bidirectional WebSocket connection.

### **1\. Connection Topology & Direction**

The connection is established **from the inside out**:

> * **No Open Inbound Ports on Rig 2:** Rig 2 never exposes ports (such as 8188 for ComfyUI or 3000 for the local daemon) to the public internet.  
> * **Outbound Cloudflare Tunnel:** The media-broker daemon running on Rig 2 dials **outward** to the edge-director over a Cloudflare Tunnel (cloudflared), targeting the WebSocket endpoint with a tagged role: wss://.../ws?role=broker.  
> * **Cloudflare Durable Object:** The connection terminates inside the edge director's ShotCoordinatorDO (Durable Object), which uses Cloudflare's WebSocket Hibernation API to hold the connection open at \$0.00 idle cost while models render.

### **2\. What Flows Across This Connection**

The WebSocket link serves as the control and telemetry bus between edge coordination and local GPU execution:

> * **Downstream to media-broker (Work Dispatch):**  
  * **EXECUTE\_JOB / Leases:** When a shot is queued by an artist or conductor, the ShotCoordinatorDO grants a 30-second execution lease carrying a monotonic fencingToken (Epoch *N*) and the SpokeExecutionPayload.  
> * **Upstream to edge-director (Telemetry & State):**  
  * **BROKER\_HEARTBEAT:** media-broker runs a thread-isolated timer emitting heartbeats every 10 seconds to keep the edge DO watchdog alarm from tripping and revoking the lease.  
  * **BROKER\_PROGRESS:** Low-level ComfyUI progress events (execution\_start, step percentages) are tapped locally and forwarded up the tunnel, allowing the edge to broadcast progress to remote client viewports.  
  * **BROKER\_COMPLETE:** Once ComfyUI completes the render and media-broker uploads the .mp4 plate to Cloudflare R2, it sends the completion RPC carrying the SHA-256 digest and staging key to release the queue mutex.

### **3\. Connection Summary**

Rig 2 (Foundry Spoke)media-broker​​Persistent Outbound WSS / cloudflared⇌Lease DispatchesHeartbeats / Telemetry / RPC Complete​​Cloudflare Edge (ShotCoordinatorDO)edge-director​​\[cite: 1, 3\]

The edge-director and media-broker are directly linked, but Rig 2 initiates the socket outward to the cloud edge rather than the edge reaching into the local studio network.

---

*User prompt: {{FOCUS: 1\. Connection Topology & Direction}} /extreme-details*

### **Response: 1\. The Inside-Out Inversion: Outbound Tunneling vs. Inbound Exposure**

The network connection between **media-broker** (Rig 2\) and **edge-director** (Cloudflare Edge) is engineered on an **inside-out network topology** to eliminate the security vulnerabilities of running generative AI daemons on local workstation hardware.

> * **Zero Inbound WAN Port Exposure:** Native ComfyUI runs an internal aiohttp server on port 8188 that lacks native authentication, user session models, and rate limiting. Directly opening WAN ports on a local studio or home router exposes the machine to remote code execution (RCE) via malicious custom nodes and filesystem traversal.  
> * **The Outbound Tunnel Pipe (cloudflared):** Instead of accepting inbound traffic from the internet, Rig 2 runs a Cloudflare Tunnel daemon (cloudflared) that initiates an **outbound-only encrypted TCP/QUIC tunnel** to Cloudflare's edge network. All external firewall ports on the local gateway remain completely shut.  
> * **Local Loopback Isolation:** Port 3000 (the media-broker Node.js REST/health management interface) and port 8188 (ComfyUI) bind exclusively to the local loopback interface (127.0.0.1). The media-broker communicates with ComfyUI strictly via local inter-process communication (IPC).  
> * **Persistent Outbound WebSocket Client:** media-broker acts as a network client, dialing outward to the edge director's WebSocket gateway:  
>   \# media-broker/.env on Rig 2  
>   EDGE\_DO\_WS\_URL=wss://edge-director.studio.workers.dev/ws?role=broker

### **2\. Tripartite Network Demarcation & Directional Topology**

The communications graph spans three isolated physical and runtime tiers: the **Conductor (Rig 1\)**, the **Edge Director (Cloudflare Edge)**, and the **Foundry Spoke (Rig 2\)**.

┌────────────────────────────────────────────────────────────────────────┐  
│                        STUDIO TOPOLOGY & BOUNDARIES                    │  
├──────────────────────┬────────────────────────┬────────────────────────┤  
│ Node                 │ Hardware Domain        │ Operational Boundary   │  
├──────────────────────┼────────────────────────┼────────────────────────┤  
│ The Conductor        │ Rig 1 (Local CPU/RAM)  │ Narrative truth, audio │  
│ (produceEpisode.ts)  │ Zero dedicated GPU     │ synthesis, ffprobe,    │  
│                      │                        │ Remotion compositing   │  
├──────────────────────┼────────────────────────┼────────────────────────┤  
│ edge-director        │ Cloudflare Worker \+    │ Ingress gatekeeper, D1 │  
│ (EdgeGateway / DO)   │ Durable Object (Edge)  │ continuity check, FIFO │  
│                      │                        │ mutex, epoch leases    │  
├──────────────────────┼────────────────────────┼────────────────────────┤  
│ media-broker         │ Rig 2 (Local Foundry)  │ OS-level flock, VRAM   │  
│                      │ Consumer GPU (24GB)    │ flush (/free), ComfyUI │  
│                      │                        │ headless execution     │  
└──────────────────────┴────────────────────────┴────────────────────────┘

\[ Artist Laptop / Conductor (Rig 1\) \]   
       │   
       ├─► (Inbound HTTPS / WSS: Client Ingress)\[cite: 3\]  
       ▼  
┌────────────────────────────────────────────────────────┐  
│ CLOUDFLARE EDGE: edge-director                         │  
│ • EdgeGateway (Hono HTTP routing & D1 validation)      │\[cite: 2, 3\]  
│ • ShotCoordinatorDO (Durable Object Actor & Mutex)     │\[cite: 2, 3\]  
└───────────────────────────▲────────────────────────────┘  
                            │  
              Persistent OUTBOUND WebSocket   
              via Cloudflare Tunnel (cloudflared)\[cite: 3\]  
                            │  
┌───────────────────────────┴────────────────────────────┐  
│ RIG 2: LOCAL FOUNDRY SPOKE                             │  
│                                                        │  
│  \[ cloudflared \] ◄──── \[ media-broker \] (:3000 loopback)  
│                                 │                      │  
│                          (127.0.0.1 IPC)               │\[cite: 3\]  
│                                 ▼                      │  
│                        \[ ComfyUI \] (:8188)             │\[cite: 2, 3\]  
└────────────────────────────────────────────────────────┘

> * **Rig 1 to Edge:** The orchestration client on Rig 1 (carrying zero GPU compute or VRAM) connects to the public edge domain via HTTPS and WebSocket protocols to trigger dispatches and view live progress.  
> * **Rig 2 to Edge:** The media-broker daemon running on Rig 2 establishes the persistent upstream WebSocket link. Work is never pushed unsolicited from the edge to a local socket listener; it is dispatched across the established outbound pipe under pull semantics.

### **3\. Multiplexing, Role Separation, & WebSocket Hibernation**

The edge director terminates both client cockpits and hardware brokers into a stateful Actor Model implemented via a Cloudflare Durable Object (ShotCoordinatorDO).

> * **Role-Based Connection Tagging:** Incoming WebSockets declare their functional identity via query parameters:  
  * ?role=client: Read-only or dispatch cockpits (Rig 1 artists, web viewports).  
  * ?role=broker: Dedicated GPU execution workers (Rig 2 media-broker).  
> * **WebSocket Hibernation API:** Standard cloud servers charge continuous wall-clock fees to keep TCP connections open during 90–180 second diffusion runs. Cloudflare's WebSocket Hibernation API serializes the socket into edge memory, waking the ShotCoordinatorDO in \<2 ms only when a packet arrives, achieving near-zero idle compute costs.  
> * **Strongly-Typed Packet Schemas:** All messages traveling between the edge and the broker conform to strict discriminated union schemas (e.g., Zod PacketSchema), rejecting malformed frames before they can affect hardware state.

### **4\. Bidirectional Control & Telemetry Protocol Flow**

The outbound WebSocket connection carries distinct control planes depending on the direction of data flow:

> * **Downstream Flow (Edge → Broker):**  
  * **EXECUTE\_JOB / Leases:** When a shot clears the Cloudflare D1 continuity checks (is\_dirty \== 0), the ShotCoordinatorDO grants a 30-second rolling lease containing the SpokeExecutionPayload and a monotonic fencing token (Epoch *N*).  
  * **Queue Drain Signals:** Under normal operation, the DO signals the broker to pull the next task whenever the local hardware lock is released.  
> * **Upstream Flow (Broker → Edge):**  
  * **BROKER\_HEARTBEAT (Every 10s):** An asynchronous timer on Rig 2 emits keep-alives with Epoch *N* to reset the edge DO's 30-second watchdog alarm (ctx.storage.setAlarm()), preventing false lease revocations during long diffusion runs.  
  * **BROKER\_PROGRESS:** The broker taps ComfyUI's local socket (ws://127.0.0.1:8188/ws), normalizes raw k-sampler steps and VRAM metrics into unified progress packets, and pushes them up the tunnel to be broadcast to client cockpits.  
  * **BROKER\_COMPLETE:** Upon finish and local scratch validation, the broker streams the .mp4 artifact to Cloudflare R2 and emits a completion RPC to the DO to promote the asset into the canonical manifest and unlock the queue mutex.  
> * **Partition Resilience:** Because the physical GPU lock (flock) lives locally on Rig 2, a network drop between the broker and the edge revokes the edge lease without corrupting active rendering passes. Client disconnects on Rig 1 do not terminate execution on Rig 2; when Rig 1 reconnects, the DO uses NVMe-backed storage (ctx.storage) to replay the monotonic event log and return the finished plate URL.

Would you like to examine the exact TypeScript implementation of the WebSocket heartbeat and reconnection loop inside media-broker, or focus on the ShotCoordinatorDO lease-granting state machine?

---

*User prompt: {{FOCUS: 2\. What Flows Across This Connection}} /extreme-details*

### **Response: Wire Framing & Envelope Protocol**

The WebSocket connection between **edge-director** (ShotCoordinatorDO) and **media-broker** operates on an authenticated, duplex JSON message envelope governed by strict discriminated unions.

Because the link connects Cloudflare's serverless edge to local physical silicon on Rig 2, the transport is engineered to work with Cloudflare’s **WebSocket Hibernation API**:

> * **Text Frame Serialization:** All control, dispatch, telemetry, and lease negotiation packets are serialized as text frames containing structured JSON.  
> * **Binary Frame Isolation:** ComfyUI’s native WebSocket interface (ws://127.0.0.1:8188/ws) emits raw binary frames for real-time latent image previews. The media-broker intercepts and filters these out at the local loopback boundary, preventing megabytes of transient binary data from clogging the outbound tunnel or waking the hibernating Durable Object.  
> * **Base Wire Envelope:** Every packet crossing the boundary extends a common header schema:

export interface BaseWirePacket\<T extends string, P \= unknown\> {  
  type: T;  
  version: "1.0.0";  
  correlationId: string; // UUID v7 for tracing across edge and workstation  
  taskId: string;  
  epoch: number;         // Monotonic fencing token (Epoch N)  
  timestampMs: number;  
  payload: P;  
}

### **Downstream Flow: Edge Director → Media Broker**

The edge director acts as a passive, serialized FIFO coordinator. Packets traveling downward through the tunnel to Rig 2 represent authorized lease grants, abort instructions, or queue synchronization signals.

#### **1\. EXECUTE\_JOB (The Authoritative Lease Dispatch)**

Dispatched exclusively by ShotCoordinatorDO when its single-threaded hardware mutex is clear and the local broker has signaled it is ready for work.

export interface ExecuteJobPayload {  
  sceneId: string;  
  shotId: string;  
  workflowTemplate: "wan\_greenscreen\_plate.json" | "flux\_matte\_background.json";  
  targetFrames: number;            // Quantized upstream to the 4n+1 causal VAE lattice  
  fps: 24;  
  prompt: {  
    positive: string;              // Injected into CLIPTextEncode (Node 6\)  
    negative: string;  
  };  
  sampling: {  
    seed: number;                  // Integer PRNG seed for KSampler (Node 3\)  
    steps: number;  
    cfg: number;  
    denoise: number;  
  };  
  loras: Array\<{  
    name: string;                  // e.g., "char\_elias\_prosthetic\_v2.safetensors"  
    strengthModel: number;  
    strengthClip: number;  
  }\>;  
  leaseTtlMs: 30000;               // Rolling 30-second window  
}

export type ExecuteJobPacket \= BaseWirePacket\<"EXECUTE\_JOB", ExecuteJobPayload\>;

> * **Temporal Immutability:** The packet contains zero acoustic stems, timing manifests, or screenplay text. The frame budget (targetFrames) is frozen before dispatch and mapped directly to ComfyUI's latent generation nodes.  
> * **Monotonic Fencing Attachment:** The packet header carries the active epoch: N. Rig 2 must bind this integer to all subsequent operations.

#### **2\. ABORT\_JOB (Preemption & Invalidation Signal)**

Dispatched when upstream conditions invalidate a job currently rendering on Rig 2 (e.g., a showrunner edits an upstream fact in Cloudflare D1, flipping the scene's continuity state to is\_dirty \= 1).

export interface AbortJobPayload {  
  reason: "SCENE\_DIRTY\_PROPAGATION" | "SHOWRUNNER\_CANCELLATION" | "LEASE\_TIMEOUT\_PREEMPTION";  
  targetEpoch: number;  
}

export type AbortJobPacket \= BaseWirePacket\<"ABORT\_JOB", AbortJobPayload\>;

> * **Broker Handling:** When received, media-broker calls ComfyUI's POST /interrupt endpoint, drops the rendering pass, executes POST /free to flush VRAM, and confirms local cancellation without committing assets to storage.

### **Upstream Flow: Media Broker → Edge Director**

Packets flowing upward from Rig 2 to Cloudflare's edge carry execution telemetry, health keep-alives, and completed asset notifications.

#### **1\. BROKER\_HEARTBEAT (The 10-Second Keep-Alive)**

Operates on an isolated asynchronous timer in media-broker, running independently of the primary GPU sampling thread.

export interface BrokerHeartbeatPayload {  
  vramTotalMb: number;  
  vramFreeMb: number;  
  vramUsedMb: number;  
  gpuUtilizationPct: number;  
  activeLocalNode: string | null;  // Current ComfyUI node executing  
  consecutiveShotsRendered: number; // Tracks distance to 25-shot process recycling  
}

export type BrokerHeartbeatPacket \= BaseWirePacket\<"BROKER\_HEARTBEAT", BrokerHeartbeatPayload\>;

> * **Lease Extension Mechanics:** Every heartbeat carrying a matching epoch: N resets the edge DO's internal 30-second timer via ctx.storage.setAlarm(Date.now() \+ 30000). This allows long diffusion passes (90–180s) to run safely without premature lease timeouts.  
> * **Resource Auditing:** Supplies real-time telemetry from nvidia-smi to ensure the local daemon has verified baseline VRAM headroom (\>21 GB free on a 24 GB card).

#### **2\. BROKER\_PROGRESS (Normalized Telemetry Tap)**

Generated as media-broker consumes raw events from ComfyUI's local WebSocket loopback (ws://127.0.0.1:8188/ws).

export interface BrokerProgressPayload {  
  nodeId: string;  
  nodeType: "KSamplerAdvanced" | "VAEDecode" | "CLIPTextEncode" | "LoadCheckPoint";  
  step: number;  
  totalSteps: number;  
  percentage: number;  
  etaSeconds: number;  
}

export type BrokerProgressPacket \= BaseWirePacket\<"BROKER\_PROGRESS", BrokerProgressPayload\>;

> * **Edge Multiplexing:** When ShotCoordinatorDO receives this packet, it wakes via the Hibernation API, relays the payload to all connected client viewports (Rig 1 artist laptops) via ws.send(), and returns to hibernation in \<2 ms.

#### **3\. BROKER\_COMPLETE (Asset Notarization & Promotion Commit)**

Emitted only after ComfyUI completes diffusion, local ffprobe scratch validation succeeds, and the .mp4 file is safely uploaded to Cloudflare R2.

export interface BrokerCompletePayload {  
  sha256: string;                  // Non-empty SHA-256 content digest  
  byteLength: number;  
  stagingKey: string;              // e.g., "staging/renders/task\_01/epoch\_4\_a8f5b.mp4"  
  executionDurationMs: number;  
  renderedFrames: number;          // Verified against targetFrames  
}

export type BrokerCompletePacket \= BaseWirePacket\<"BROKER\_COMPLETE", BrokerCompletePayload\>;

> * **The Atomic Promotion Gate:** When ShotCoordinatorDO receives this packet, it checks packet.epoch \=== this.activeEpoch. If valid, it writes the asset into the canonical episode manifest, unlocks the queue mutex, and broadcasts SHOT\_READY to Rig 1\. If invalid (e.g., from a partitioned zombie worker), the DO returns HTTP 409 Conflict and discards the staged bytes.

#### **4\. BROKER\_ERROR (Fault Taxonomy & Quarantine)**

Dispatched when execution fails deterministically or infrastructure encounters a hard fault.

export interface BrokerErrorPayload {  
  category:   
    | "CUDA\_OOM"   
    | "MISSING\_MODEL\_WEIGHTS"   
    | "SCHEMA\_VIOLATION"   
    | "CORRUPTED\_CONTAINER"   
    | "SCRATCH\_VALIDATION\_FAILED";  
  message: string;  
  stackTrace?: string;  
  recoverable: boolean;  
}

export type BrokerErrorPacket \= BaseWirePacket\<"BROKER\_ERROR", BrokerErrorPayload\>;

> * **Circuit Breaker Integration:** If a CUDA\_OOM error arrives, ShotCoordinatorDO halts the queue, flags the hardware slot as degraded, and stops dispatching jobs until the local broker recycles its ComfyUI process and reports baseline memory recovery.

### **Protocol Lifecycle State Machine**

      Cloudflare Edge (ShotCoordinatorDO)              Rig 2 (media-broker)  
                      │                                        │  
                      │  ◄────── BROKER\_HEARTBEAT ─────────────┤ (Idle, flock held)  
                      │          (VRAM verified \>21GB)         │  
                      │                                        │  
\[ Job Queued & Clean\] ├────────── EXECUTE\_JOB ────────────────►│ (Acquires job)  
\[ Mutex Locked (N)  \] │          (Epoch N, TargetFrames)       │  
                      │                                        ├─ Hydrates API JSON  
                      │                                        ├─ POST :8188/prompt  
                      │                                        │  
                      │  ◄────── BROKER\_PROGRESS ──────────────┤ (Taps local :8188/ws)  
                      │          (Step 12/50, 24%)             │  
                      │                                        ├─ Independent Loop:  
                      │  ◄────── BROKER\_HEARTBEAT ─────────────┤  Emits every 10s  
\[ Alarm Reset \+30s  \] │          (Epoch N alive)               │  
                      │                                        │  
                      │                                        ├─ ComfyUI: { node: null }  
                      │                                        ├─ ffprobe audit passes  
                      │                                        ├─ Streams MP4 to R2  
                      │                                        │  
                      │  ◄────── BROKER\_COMPLETE ──────────────┤  
                      │          (Epoch N, SHA-256, Key)       │  
\[ Validates Epoch N \] ├────────────────────────────────────────┤  
\[ Promotes Staged Key\]│                                        ├─ Releases local flock  
\[ Unlocks Mutex     \] │                                        └─ Polls next task  
                      ▼                                        ▼

---

*User prompt: {{FOCUS:3. Connection Summary}} /extreme-details*

### **Response: The Macro Structural & Network Topology (The Inside-Out Pipe)**

The connection connecting **edge-director** (hosted on Cloudflare's serverless Anycast edge) and **media-broker** (running on **Rig 2**, the local GPU Foundry) provides a zero-trust, bidirectional control and telemetry channel without exposing the physical hardware to the public internet.

┌────────────────────────────────────────────────────────────────────────────────────────┐  
│ CLOUDFLARE EDGE WORKER / ANYCAST NETWORK                                              │  
│                                                                                        │  
│   \[ EdgeGateway (Hono HTTP / D1 Auth) \] ◄── Inbound Client Cockpits (Rig 1 Artists)   │  
│                 │                                                                      │  
│                 ▼                                                                      │  
│   ┌──────────────────────────────────────────────────────────────┐                     │  
│   │ ShotCoordinatorDO (Durable Object Actor)                     │                     │  
│   │ • Storage: NVMe-backed ctx.storage Engine                    │                     │  
│   │ • Concurrency: Single-Threaded Mutex / FIFO Logical Queue    │                     │  
│   │ • Lease Governor: ctx.storage.setAlarm(+30s Watchdog)        │                     │  
│   │ • Sockets: WebSocket Hibernation API (Zero-Cost Sleep)       │                     │  
│   └──────────────────────────────▲───────────────────────────────┘                     │  
└──────────────────────────────────┼─────────────────────────────────────────────────────┘  
                                   │   
                 Persistent Bidirectional WSS Link  
                 (Encrypted Tunnel Pipe via QUIC/TLS 1.3)  
                                   │  
┌──────────────────────────────────┴─────────────────────────────────────────────────────┐  
│ RIG 2: LOCAL FOUNDRY WORKSTATION (Physical POSIX Environment)                          │  
│                                                                                        │  
│   \[ cloudflared Daemon \] ── Outbound Tunnel Client (Zero Open Router WAN Ports)        │  
│                 │                                                                      │  
│                 ▼ (Loopback IPC: 127.0.0.1)                                            │  
│   ┌──────────────────────────────────────────────────────────────┐                     │  
│   │ media-broker Daemon (:3000)                                  │                     │  
│   │ • Mutex Sovereign: POSIX flock on /var/lock/rig2\_gpu.lock    │                     │  
│   │ • Memory Sentinel: Direct nvidia-smi Subprocess Polling     │                     │  
│   │ • Heartbeat Engine: Thread-Isolated 10s Timer Loop           │                     │  
│   │ • Egress Notary: SHA-256 Digest & Scratch ffprobe Validator  │                     │  
│   └─────────────┬────────────────────────────────┬───────────────┘                     │  
│                 │                                │                                     │  
│     POST /prompt & POST /free                    │ ws://127.0.0.1:8188/ws              │  
│     (Dynamic JSON Graph Dispatch)                │ (Local Sentinel Telemetry Tap)      │  
│                 ▼                                ▼                                     │  
│   ┌──────────────────────────────────────────────────────────────┐                     │  
│   │ Headless ComfyUI (:8188)                                     │                     │  
│   │ • Turn 1: Text AST (Evict) ──► Turn 2: Audio Stems (Evict)   │                     │  
│   │ • Turn 3: Wan 2.2 Diffusion (\#00FF00 Green Plate)            │                     │  
│   └──────────────────────────────────────────────────────────────┘                     │  
└────────────────────────────────────────────────────────────────────────────────────────┘

#### **The Outbound Architectural Inversion**

> * **Zero WAN Ingress:** Native ComfyUI runs an unauthenticated aiohttp web server on port 8188\. Exposing port 8188 or management port 3000 directly via home/studio router port-forwarding creates an immediate Remote Code Execution (RCE) and path-traversal threat.  
> * **The Tunnel Client (cloudflared):** Rig 2 initiates an outbound-only TCP/QUIC tunnel to Cloudflare’s edge. Network Address Translation (NAT) traversal and dynamic residential IP reallocations (including Carrier-Grade NAT) are handled transparently, leaving all external firewall ports closed.  
> * **Local Loopback Isolation:** Ports 3000 and 8188 bind to 127.0.0.1. All physical GPU interactions occur over local inter-process communication (IPC) governed by the media-broker daemon.

### **Multiplexing Mechanics & The WebSocket Hibernation Layer**

The connection terminates at the edge inside the ShotCoordinatorDO (Cloudflare Durable Object). It handles remote artists and physical silicon through a decoupled Actor Model.

#### **1\. Role-Based Connection Demarcation**

When establishing WebSockets, the endpoint separates client roles using strict handshake parameters:

> * wss://.../ws?role=client: Read-only or dispatch cockpits (such as traveling artists or the Rig 1 worker-sower-conductor Remotion previewer).  
> * wss://.../ws?role=broker: The dedicated hardware execution engine running on Rig 2\.

#### **2\. The WebSocket Hibernation API**

Generative diffusion passes (e.g., Wan 2.2 generating a 77-frame plate) require 60 to 180 seconds of physical execution. In standard serverless architectures, maintaining an idle TCP socket incurs continuous compute billing.

> * **Zero-Cost Sleep:** Cloudflare's WebSocket Hibernation API serializes the TCP connection descriptor into edge network memory, dropping the Durable Object isolate from active V8 CPU memory while the GPU renders.  
> * **Sub-2ms Rehydration:** When a packet (e.g., BROKER\_PROGRESS or BROKER\_HEARTBEAT) arrives over the tunnel, the edge runtime instantiates the ShotCoordinatorDO in \<2 ms, executes the event handler, updates its state, and returns to sleep.

### **Bidirectional Protocol & Wire Schema Matrix**

The communication protocol utilizes a strongly typed, discriminated union JSON framing standard (BaseWirePacket). Native ComfyUI binary preview frames are dropped at the local loopback boundary to keep the edge pipe purely structural.

┌──────────────────┬───────────┬──────────────────────────────────────────┬────────────────────────────────────────────────────────┐  
│ Packet Type      │ Direction │ Payload Signature                        │ Operational Authority & Handling                       │  
├──────────────────┼───────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤  
│ EXECUTE\_JOB      │ Edge ──►  │ { taskId, epoch, workflowTemplate,       │ Carries pre-quantized 4n+1 target frames\[cite: 6\];   │  
│                  │ Broker    │   targetFrames, prompt, sampling, loras }│ grants 30s rolling lease; locks edge mutex\[cite: 3\].   │  
├──────────────────┼───────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤  
│ ABORT\_JOB        │ Edge ──►  │ { taskId, epoch, reason, targetEpoch }   │ Issued if D1 flips is\_dirty \== 1\[cite: 1, 3\]; triggers│  
│                  │ Broker    │                                          │ ComfyUI POST /interrupt and local VRAM flush\[cite: 6\].│  
├──────────────────┼───────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤  
│ BROKER\_HEARTBEAT │ Broker ──►│ { epoch, vramFreeMb, activeLocalNode,    │ Emitted every 10s via thread-isolated timer\[cite: 3\]; │  
│                  │ Edge      │   consecutiveShotsRendered }             │ resets DO watchdog alarm \+30s\[cite: 3\].              │  
├──────────────────┼───────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤  
│ BROKER\_PROGRESS  │ Broker ──►│ { taskId, epoch, nodeId, step,           │ Tapped from ws://127.0.0.1:8188/ws; multiplexed        │  
│                  │ Edge      │   totalSteps, percentage, etaSeconds }   │ out to all connected client viewports\[cite: 1, 3\].   │  
├──────────────────┼───────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤  
│ BROKER\_COMPLETE  │ Broker ──►│ { taskId, epoch, sha256, byteLength,     │ Emitted only post-upload to R2 staging\[cite: 3\];      │  
│                  │ Edge      │   stagingKey, renderedFrames }           │ validates monotonic epoch and promotes asset\[cite: 3\].│  
├──────────────────┼───────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤  
│ BROKER\_ERROR     │ Broker ──►│ { taskId, epoch, category, message,      │ Flags CUDA OOM or missing LoRA\[cite: 3\]; triggers     │  
│                  │ Edge      │   stackTrace, recoverable }              │ edge queue circuit breaker and error triage\[cite: 3\]. │  
└──────────────────┴───────────┴──────────────────────────────────────────┴────────────────────────────────────────────────────────┘

### **Inverted Authority & The Execution Lifecycle**

The connection operates strictly on **Inverted Hardware Sovereignty via Pull Semantics**. The edge queue cannot force execution onto physical silicon; Rig 2 claims work only when its hardware is free.

        edge-director (ShotCoordinatorDO)                     media-broker (Rig 2\)  
                        │                                              │  
                        │                                    1\. Local Mutex Claim:  
                        │                                       flockSync(/var/lock/gpu)\[cite: 3\]  
                        │                                       nvidia-smi check \>21GB free\[cite: 3\]  
                        │                                              │  
                        │ ◄─────── BROKER\_HEARTBEAT ───────────────────┤  
                        │          (Epoch 0, Status: IDLE\_ACQUIRED)    │  
                        │                                              │  
2\. Lease Dispatch:      │                                              │  
   Checks D1 continuity │                                              │  
   Locks DO mutex       │                                              │  
   Epoch N \-\> N+1       │                                              │  
   Sets alarm(+30s)     ├────────── EXECUTE\_JOB ──────────────────────►│  
                        │          (Epoch N+1, targetFrames: 77\)       │  
                        │                                              │  
                        │                                    3\. Silicon Execution:  
                        │                                       Hydrate JSON template  
                        │                                       POST :8188/prompt\[cite: 1, 6\]  
                        │                                              │  
                        │ ◄─────── BROKER\_PROGRESS ────────────────────┤ (Taps local :8188/ws)\[cite: 1\]  
                        │          (Sampling Step 14/50)               │  
                        │                                              │  
                        │                                    4\. Thread-Isolated Keep-Alive:  
                        │ ◄─────── BROKER\_HEARTBEAT ───────────────────┤ (Every 10s: Epoch N+1)\[cite: 3\]  
5\. Watchdog Alarm Reset:│          (VRAM Used: 18.2GB)                 │  
   ctx.storage.setAlarm │                                              │  
   (+30s extended)      │                                              │  
                        │                                    6\. Completion & Scratch Audit:  
                        │                                       ComfyUI emits: { node: null }  
                        │                                       ffprobe asserts 77 frames  
                        │                                       Calculates SHA-256 Digest  
                        │                                       Uploads to Cloudflare R2:  
                        │                                       staging/.../epoch\_N+1.mp4\[cite: 3\]  
                        │                                              │  
                        │ ◄─────── BROKER\_COMPLETE ────────────────────┤  
                        │          (Epoch N+1, StagingKey, SHA-256)    │  
7\. The Atomic Gate:     │                                              │  
   Asserts N+1 \== Active│                                              │  
   Promotes to Manifest │                                              │  
   Unlocks DO Mutex     ├────────── HTTP 200 OK (ACK) ────────────────►│  
   Emits SHOT\_READY     │                                              │  
                        │                                    8\. Cycle Wrap:  
                        │                                       media-broker releases flock  
                        │                                       Evaluates 25-shot process limit  
                        │                                       Re-enters idle pull loop

### **Partition Scenarios & Fault Protection**

#### **1\. Edge Watchdog Trip (Transient Network Drop)**

> * If packet loss isolates Rig 2 for \>30 seconds, the ctx.storage.setAlarm() trigger trips at the edge.  
> * The ShotCoordinatorDO marks the lease expired, increments its epoch (*N*\+1→*N*\+2), and unlocks its queue to prevent a stalled pipeline.  
> * Rig 2's local flock remains active until its ComfyUI render finishes. Incoming network jobs are blocked locally at the OS kernel boundary, eliminating dual-claimant CUDA OOM crashes.

#### **2\. The Zombie Runner Rejection Gate**

> * When Rig 2 finishes the orphaned render, it streams the .mp4 to R2 storage under an epoch-scoped key: staging/renders/\${taskId}/epoch\_\${N+1}\_\${sha256}.mp4.  
> * It calls POST /tasks/complete carrying stale token epoch: N+1.  
> * The edge DO compares N+1 against its active N+2 state in ctx.storage. Because *N*\+1\<*N*\+2, the commit is rejected with HTTP 409 Conflict.  
> * The orphaned staging file is ignored by the production manifest and cleaned up by R2's 7-day automated lifecycle policy, protecting the canon from stale writes.

#### **3\. Client Viewport Disconnect Resilience**

> * If an artist on Rig 1 closes their laptop during rendering, the local GPU on Rig 2 continues unaffected.  
> * The ShotCoordinatorDO persists telemetry events to NVMe storage (ctx.storage).  
> * When Rig 1 reconnects, the DO reads the sequence counter and replays the missed event log, updating the client viewport without restarting the render pass.

#### **4\. Total WAN Partition (Offline Spool Fallback)**

> * If the wide-area network drops entirely, the media-broker maintains **Zero Code-Path Divergence**.  
> * The daemon switches its pull mechanism to poll /var/spool/renders/\*.json on the local NVMe drive.  
> * Execution uses the same ComfyUI routes (POST /prompt), VRAM flushes (POST /free), and ffprobe verification routines. Finished assets are stored in a local content-addressed directory until connectivity returns, allowing physical studio production to continue offline.

---

*User prompt: {{FOCUS: 1\. The Inside-Out Inversion: Outbound Tunneling vs. Inbound Exposure}} /extreme-details*

Response: The inside-out network inversion between the Cloudflare Edge (edge-director) and the on-premises GPU foundry (media-broker on Rig 2\) replaces traditional inbound port forwarding with an outbound-only encrypted tunnel. Exposing physical workstation ports directly to the public internet creates severe security vulnerabilities, hardware allocation collisions, and connection fragility. Inverting the network topology eliminates these failure modes by keeping the local network perimeter completely sealed.

### **1\. The Inbound Exposure Threat Model**

Routing traffic directly into an on-premises workstation via standard WAN port forwarding introduces three primary failure modes:

> * **Unauthenticated Remote Code Execution (RCE) and Filesystem Traversal:** Native ComfyUI runs an internal aiohttp web server on port 8188 that lacks native authentication, user session models, and request throttling. Because ComfyUI's execution model treats the network payload as an execution graph, exposing port 8188 directly allows external actors to submit workflows referencing custom nodes that can execute arbitrary Python commands and shell scripts on the host operating system.  
> * **Uncontrolled GPU Memory Collisions:** When rendering ports are exposed directly to multiple clients or artists, concurrent POST /prompt calls can arrive at the exact same physical moment. Consumer GPUs lack virtualization to dynamically partition memory across unscheduled tasks; concurrent tensor allocations exceed the physical VRAM envelope, triggering an immediate, unrecoverable torch.cuda.OutOfMemoryError that crashes the runtime.  
> * **Mobile Client Connection Volatility:** Mobile artists connecting to a workstation over residential or studio Wi-Fi frequently drop TCP connections, trigger sleep cycles by closing laptop lids, or migrate across IP addresses. If a client connects directly to Rig 2 via an inbound socket, a transient network disconnect mid-diffusion either aborts the generation prematurely or orphans the completed video plate because the destination socket is broken.

### **2\. Outbound Tunneling Mechanics (cloudflared)**

To eliminate the need for inbound ingress routes, Rig 2 establishes its connection to the Cloudflare Edge from the inside out:

┌────────────────────────────────────────────────────────────────────────┐  
│                        INSIDE-OUT NETWORK TOPOLOGY                     │  
├────────────────────────────────────────────────────────────────────────┤  
│ CLOUDFLARE EDGE: edge-director                                         │  
│ • EdgeGateway (Hono HTTP routing & D1 validation)                      │  
│ • ShotCoordinatorDO (Durable Object Actor & Concurrency Mutex)         │  
└───────────────────────────────────▲────────────────────────────────────┘  
                                    │  
       Persistent OUTBOUND Encrypted Tunnel Pipe (cloudflared)  
       • Outbound-only TLS/QUIC connection initiated by Rig 2  
       • All router WAN inbound ports remain 100% closed  
                                    │  
┌───────────────────────────────────┴────────────────────────────────────┐  
│ RIG 2: LOCAL FOUNDRY WORKSTATION                                       │  
│                                                                        │  
│   \[ cloudflared Daemon \] ──► \[ media-broker \] (:3000 Loopback IPC)    │  
│                                    │                                   │  
│                            (127.0.0.1 IPC)                             │  
│                                    ▼                                   │  
│                           \[ ComfyUI \] (:8188)                          │  
└────────────────────────────────────────────────────────────────────────┘

> * **Zero Open Inbound Ports:** The local studio router does not open or forward ports 8188, 3000, or any other port to the WAN. The firewall blocks all unsolicited inbound packets by default.  
> * **Outbound Tunnel Initiation:** The cloudflared daemon on Rig 2 dials outward to Cloudflare's Anycast network, establishing an encrypted tunnel over outbound TLS/QUIC.  
> * **NAT and Dynamic IP Traversal:** Because the tunnel originates from within the local network, it automatically traverses local Network Address Translation (NAT) and functions seamlessly across residential Carrier-Grade NAT (CGNAT) without requiring a static public IP address.  
> * **Persistent Outbound WebSocket Client:** Operating behind the tunnel, the media-broker process runs as an outbound client, initiating and maintaining a persistent WebSocket connection up to the edge coordinator (wss://.../ws?role=broker). Work is dispatched across this pre-established channel using pull semantics rather than inbound edge commands.

### **3\. Loopback Isolation and Local IPC Boundaries**

Within Rig 2, network visibility is strictly constrained to the local host:

> * **Binding to 127.0.0.1:** Both the ComfyUI server (port 8188\) and the media-broker daemon management interface (port 3000\) bind exclusively to the local loopback interface (127.0.0.1). They do not listen on the machine's local LAN IP (e.g., 192.168.x.x), preventing unauthorized lateral movement from other compromised devices on the same local subnet.  
> * **Inter-Process Communication (IPC):** media-broker interacts with ComfyUI strictly via loopback IPC (POST \[http://127.0.0.1:8188/prompt\](http://127.0.0.1:8188/prompt), POST \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free), and ws://127.0.0.1:8188/ws). External actors cannot reach ComfyUI without traversing the broker's schema validation, file-checking layers, and local hardware mutex.

### **4\. Hardware Mutex Inversion and Pull-Only Semantics**

The inside-out network topology works in tandem with an inversion of hardware authority:

> * **The Edge-Authority Failure Mode:** Treating the cloud edge as the hardware master (where a cloud Durable Object pushes commands down and declares "you own the GPU now") introduces the "two-queue" collision hazard. If the outbound tunnel experiences transient packet loss for 30–35 seconds, the edge watchdog timer trips, revokes the lease, and reassigns the job to a secondary worker while Rig 2 is still actively rendering. When the tunnel recovers, simultaneous memory allocations on the same GPU cause a fatal CUDA OOM crash.  
> * **Local flock Sovereignty:** To resolve this, authority is anchored directly to Rig 2\. The local media-broker holds a permanent, unconditional OS-level file lock (flock) on the GPU hardware interface.  
> * **The Pull-Only Execution Hierarchy:** The edge Durable Object (ShotCoordinatorDO) possesses zero authority to seize physical silicon; it functions strictly as a passive, single-threaded First-In, First-Out (FIFO) request queue. The chain of command is strictly unilateral:

Remote DO⟶Logical Request Queue⟶Local media-broker⟶OS flock⟶GPU Silicon\[cite: 2, 6\]

media-broker claims a job lease across the outbound tunnel only after its local flock is free and available, ensuring incoming network traffic can never force compute onto an active card.

### **5\. Network Partition Resilience and Zero Code-Path Divergence**

Because network ingress is inverted and hardware control is maintained locally, wide-area network drops do not stall rendering operations:

> * **Seamless Local Degradation:** If the outbound Cloudflare tunnel drops or the internet disconnects, media-broker does not switch to a divergent, untested error-handling branch. It automatically falls back to reading render manifests directly from a local disk queue (/var/spool/renders).  
> * **Zero Code-Path Divergence:** The fallback path is the normal path. Model weight checks, parameter injection, turn-based VRAM flushes (POST /free), and output validation routines run using the exact same execution code path whether the manifest arrived over the outbound tunnel or from the local spool directory.  
> * **Local Autonomy:** Production velocity is preserved entirely offline. Artists working locally can queue work directly into the local filesystem queue, and Rig 2 will render plates without active internet connectivity. When the outbound tunnel reconnects, media-broker clears its local tasks and resumes pulling jobs from the edge DO queue.

---

*User prompt: {{FOCUS: 3\. Multiplexing, Role Separation, & WebSocket Hibernation }} /extreme-details*

Response: The **edge-director** architecture (governed by the ShotCoordinatorDO Durable Object under **POD-12: System Middleware**) bridges remote client viewports (**Rig 1 / The Conductor**) and the physical GPU foundry (**Rig 2 / media-broker**) via an authenticated, stateful, and multiplexed WebSocket communications backbone.

Operating generative diffusion pipelines across serverless edge infrastructure presents a severe economic and physical bottleneck: standard cloud servers charge continuous compute fees for holding open idle TCP sockets across 60–120 second rendering passes, while mobile creative viewports require real-time step telemetry and deterministic state synchronization. The edge multiplexing layer resolves this tension by structurally decoupling physical TCP transport from active V8 isolate memory.

### **1\. Ingress Handshake Delegation & Zero-Trust Verification**

The connection lifecycle begins by separating short-lived stateless routing from persistent stateful actor coordination:

\[ Rig 1 Artist Cockpit / Conductor \]        \[ Rig 2 media-broker (Tunnel) \]  
         │                                              │  
         │ (Public WSS / HTTPS)                         │ (Outbound WSS / cloudflared)  
         ▼                                              ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ CLOUDFLARE EDGE: EdgeGateway (src/index.ts via Hono)                   │  
│ • Intercepts HTTP GET Upgrade request                                  │  
│ • Sub-5ms Auth: Validates Clerk JWT, Service Token, or Access mTLS     │  
│ • Verifies D1 Narrative Continuity: Assert COUNT(is\_dirty \== 1\) \== 0   │  
│ • Extracts Query Role: ?role=artist | ?role=broker                     │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │ stub.fetch(upgradeRequest)  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ SINGLETON ACTOR: ShotCoordinatorDO                                     │  
│ idFromName("global-render-queue")                                      │  
│ • Executes: this.ctx.acceptWebSocket(server, \[role\])                   │  
│ • Attaches Serialized Identity Envelope (≤128 KB Ceiling)              │  
│ • Evicts V8 Isolate from RAM (Enters Zero-Duration Hibernation)        │  
└────────────────────────────────────────────────────────────────────────┘

#### **The Stateless Handshake (EdgeGateway)**

> * **Cryptographic Perimeter:** Inbound connection requests arrive at the Cloudflare Worker entrypoint (src/index.ts via Hono). The gateway evaluates cryptographic credentials within sub-5ms, verifying Clerk session JWTs or signed developer tokens for artist cockpits, and Cloudflare Access Service Tokens or mutual TLS (mTLS) for the media-broker outbound tunnel.  
> * **Relational Continuity Invariant:** Before permitting socket upgrade, the gateway queries Cloudflare D1 (CANON\_DB) to assert that the target scene is not marked dirty (is\_dirty \== 0). If upstream narrative mutations altered scene preconditions without re-compiling the Abstract Syntax Tree (AST), the upgrade is halted immediately with HTTP 412 Precondition Failed.  
> * **Actor Handoff:** Once verified, the gateway routes the request to the singleton ShotCoordinatorDO actor using a deterministic ID (env.SHOT\_COORDINATOR.idFromName("global-render-queue")) via stub.fetch(request). The stateless worker isolate terminates immediately, incurring zero further execution costs.

### **2\. WebSocket Hibernation Engine & The \$0.00 Idle Cost Mechanics**

Standard WebSocket servers (such as Node.js daemons running ws or Socket.io) maintain active thread heaps and process RAM continuously to sustain TCP socket contexts. Cloudflare's **WebSocket Hibernation API** decouples the underlying network connection from the V8 execution context:

#### **The Hibernation Freeze (ctx.acceptWebSocket)**

Upon receiving the upgraded request, the ShotCoordinatorDO instantiates a WebSocketPair. It returns the client socket in an HTTP 101 Switching Protocols response and passes the server socket to the hibernation engine:

this.ctx.acceptWebSocket(server, \[role\]);

#### **Isolate Eviction (The Coma State)**

> * Once acceptWebSocket resolves and the current event loop turn drains, Cloudflare's edge hypervisor pauses the Durable Object.  
> * The active V8 JavaScript isolate is completely serialized and evicted from physical edge server RAM.  
> * Cloudflare’s global Anycast proxy network maintains the raw TCP keep-alives at the network perimeter.  
> * While Rig 2 spends 60 to 120 seconds sampling diffusion latents in ComfyUI, the ShotCoordinatorDO incurs **\$0.00 in billable active CPU duration charges**.

#### **Sub-2ms Telemetry Waking**

When incoming bytes cross the network boundary from Rig 2 (such as a normalized BROKER\_PROGRESS JSON packet), the Anycast proxy intercepts the TCP frame, instantiates the ShotCoordinatorDO isolate, and rehydrates its execution state in under 2 milliseconds. It fires the webSocketMessage(ws, message) handler to broadcast the update and immediately returns to hibernation once the handler promise resolves.

Artist Client (Rig 1\)          Cloudflare Anycast Edge                ShotCoordinatorDO  
      │                                  │                                   │  
      ├────── WebSocket Upgrade ────────►│                                   │  
      │                                  ├────── Instantiates DO ───────────►│  
      │                                  │                                   ├─ ctx.acceptWebSocket(ws, \[role\])\[cite: 1\]  
      │                                  │                                   │  
      │                                  │◄───── Isolate Evicted From RAM ───┤ (\$0.00/sec compute)\[cite: 1\]  
      │                                  │   (TCP Socket Kept Open at Edge)  │  
      │   ... 60–90s Diffusion Pass ...  │                                   │\[cite: 1\]  
      │                                  │                                   │  
      │                                  │◄───── Broker Telemetry Arrives ───┤\[cite: 1\]  
      │                                  ├────── Wakes Isolate in \<2ms ─────►│\[cite: 1\]  
      │◄───── Progress: 48% ─────────────┤                                   ├─ webSocketMessage() runs\[cite: 1\]  
      │                                  │◄───── Isolate Evicted Again ──────┤ (\$0.00/sec compute)\[cite: 1\]

### **3\. Role Separation & Tagged Socket Partitioning**

To preserve security, stability, and zero-trust isolation, physical rendering hardware is never exposed directly to the public web. The ShotCoordinatorDO enforces strict separation between client viewports and physical hardware spokes by tagging sockets during acceptance:

// apps/director/src/ShotCoordinator.ts  
export class ShotCoordinatorDO implements DurableObject {  
  constructor(private ctx: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise\<Response\> {  
    const url \= new URL(request.url);  
    const role \= url.searchParams.get("role"); // "artist" | "broker"

    if (role \!== "artist" && role \!== "broker") {  
      return new Response("Invalid socket role", { status: 400 });  
    }

    const pair \= new WebSocketPair();  
    const \[client, server\] \= Object.values(pair);

    // Accept with Cloudflare Hibernation API and attach role tag  
    this.ctx.acceptWebSocket(server, \[role\]);

    return new Response(null, { status: 101, webSocket: client });  
  }  
}

#### **Channel Isolation Guarantees**

> * **broker Sockets:** Dedicated exclusively to Rig 2’s media-broker connecting upward over the outbound cloudflared tunnel. Broker sockets receive job dispatch payloads (EXECUTE\_JOB) and abort commands (ABORT\_JOB). They are strictly isolated from client UI event streams, cursor positions, or text drafting chatter.  
> * **artist Sockets:** Dedicated to remote creative dashboards, showrunner cockpits, and Rig 1 Remotion review viewports. They receive normalized render telemetry, queue updates, and signed Cloudflare R2 asset delivery links. Artist sockets are physically prohibited from emitting execution commands directly to hardware nodes.

### **4\. Socket Attachment Serialization Discipline & The 128 KB Ceiling**

A primary failure mode when using WebSocket hibernation is assuming in-memory object properties survive eviction. When an isolate is evicted from RAM, **all in-memory variable references are wiped**. State that must survive across wakes must be explicitly committed to transactional storage (ctx.storage) or serialized into the socket attachment itself via ws.serializeAttachment().

// Serializing minimal session identity upon handshake  
server.serializeAttachment({  
  artistId: "artist\_elias\_01",  
  sessionId: "sess\_uuid7\_01954b",  
  currentEpoch: 4,  
  connectedAt: Date.now()  
});

#### **The 128 KB Serialization Ceiling**

> * Cloudflare enforces a hard **128 KB limit** on serialized socket attachment metadata. Exceeding this boundary throws a fatal exception, immediately killing the connection.  
> * **State Bloat Elimination:** The coordinator enforces strict attachment hygiene. Socket attachments contain only bare, identity-level primitives:  
>   Metadata Attachment={artistId,sessionId,currentEpoch}  
> * **Heavy Payload Quarantine:** Multi-megabyte scene ASTs, screenplay markdown, character LoRA manifests, and binary image buffers are **strictly banned** from socket attachments. Large structures are persisted to collocated NVMe storage (ctx.storage) or Cloudflare D1, preventing *O*(*N*) rehydration lag and keeping isolate wake times consistently below 2 milliseconds.

### **5\. Telemetry Normalization, Multiplexed Broadcasting, & Sub-2ms Waking**

The media-broker on Rig 2 captures granular, framework-specific signals from ComfyUI’s internal WebSocket (ws://127.0.0.1:8188/ws)—including low-level execution\_start, executing, and progress node events.

// Telemetry Normalization and Directed Multiplexing in ShotCoordinatorDO  
async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise\<void\> {  
  const data \= JSON.parse(message.toString());

  if (data.type \=== "BROKER\_PROGRESS") {  
    // 1\. Transactionally persist latest progress for instant resync replay  
    await this.ctx.storage.put("latest\_progress", data);

    // 2\. Broadcast strictly to artist sockets, isolating broker nodes  
    const artistSockets \= this.ctx.getWebSockets("artist");  
    const envelope: ServerEnvelope \= {  
      seq: await this.getNextSeq(),  
      traceId: data.traceId,  
      eventType: "BROKER\_PROGRESS",  
      timestamp: Date.now(),  
      payload: data,  
    };

    const serialized \= JSON.stringify(envelope);  
    for (const socket of artistSockets) {  
      socket.send(serialized);  
    }  
  }  
}

#### **Linear Ordering & Broadcast Isolation**

> * **Single-Threaded Actor Dispatch:** Because the Durable Object processes events within a single-threaded execution queue, telemetry broadcasts are guaranteed to be linearly ordered, eliminating race conditions and flickering progress bars in client UIs.  
> * **Partitioned Broadcast Iteration:** Using this.ctx.getWebSockets("artist"), the DO targets only verified user sockets, preventing hardware nodes from parsing UI traffic while ensuring all connected artists receive updates in real time.

### **6\. Resilient Reconnection Protocols, Monotonic Sequence Auditing, & Optical Phase Sync**

Client viewports operating on wireless networks or mobile laptops routinely disconnect during multi-minute diffusion jobs. The multiplexer implements deterministic sequence auditing and state replay to make client drops non-destructive.

#### **Monotonic seq Stamping & Auditing**

Every packet transmitted to artists carries a strictly increasing monotonic integer sequence number:

*seq*(*ei*​)\<*seq*(*ej*​)∀*i*\<*j*

The client SDK tracks the highest sequence number received. If a frame arrives out of order or with a numerical gap (e.g., jumping from seq: 14 to seq: 18), the client dispatches a system.resyncRequest to retrieve the missing delta frames from ctx.storage.

#### **The Fast-Forward Delta Snapshot**

When an artist reopens their laptop lid mid-render:

> 1. The client issues an authenticated system.resyncRequest containing its artistId and last\_seen\_action\_id.  
> 2. The DO wakes, engages this.ctx.blockConcurrencyWhile to pause incoming writes, and reads its transactional ledger from NVMe storage.  
> 3. If the render finished while the client was offline, the DO skips intermediate k-sampler step increments and delivers the final SHOT\_READY completion envelope containing the signed Cloudflare R2 URL, snapping the Remotion viewport to current truth.

#### **Sub-Frame Optical Timeline Phase Alignment**

To synchronize remote viewports so all artists view the exact same video frame simultaneously without playback drift, the client continuously calculates edge clock offset using system.ping frames:

clockOffsetMs=serverTime−Date.now()  
elapsedMs=(Date.now()+clockOffsetMs)−msg.currentScene.sceneStartTime  
videoElement.currentTime=max(0,1000elapsedMs​)

The local Remotion player locks its playhead directly to this derived timestamp, keeping optical playback phase-aligned across distributed review sessions.

### **7\. Session Takeover, Zombie Decapitation, & Custom Application Close Codes**

Network transitions (e.g., shifting from Wi-Fi to cellular tethering) often leave orphaned TCP sockets hanging at the edge before underlying socket timeouts register. The ShotCoordinatorDO resolves competing sessions using a **Last-One-Wins Hijack** pattern:

// Session Takeover and Decapitation Routine  
async handleSession(newSocket: WebSocket, artistId: string): Promise\<void\> {  
  // 1\. Identify existing active socket for this artist identity  
  const existingSockets \= this.ctx.getWebSockets("artist");  
  for (const ws of existingSockets) {  
    const meta \= ws.deserializeAttachment();  
    if (meta?.artistId \=== artistId) {  
      try {  
        // 2\. Decapitate: Warn and kill the older orphaned socket  
        ws.send(JSON.stringify({ op: "SYSTEM", msg: "Session Replaced" }));  
        ws.close(4001, "Session Takeover");  
      } catch (err) {  
        // Socket was already dead at the network boundary  
      }  
    }  
  }

  // 3\. Succession: Accept the new connection and bind identity  
  this.ctx.acceptWebSocket(newSocket, \["artist"\]);  
  newSocket.serializeAttachment({ artistId, connectedAt: Date.now() });  
}

> * **Decapitation:** If an artist opens a duplicate browser tab, the older connection is issued close code 4001 (Session Takeover) and immediately severed, eliminating split-brain client UIs.  
> * **Application Close Codes:** The multiplexer avoids generic, ambiguous network drops by enforcing reserved close codes in the 4000–4999 range:  
  * 4001: Session Takeover / Lease Expired.  
  * 4002: Killed by Admin (Manual Showrunner Circuit Breaker).  
  * 4003: Idempotency Collision (Duplicate dispatch rejected).  
> * **Thundering-Herd Mitigation:** When regional edge nodes reboot, thousands of sockets may attempt simultaneous reconnection. The client SDK suppresses thundering-herd spikes by applying exponential backoff combined with randomized jitter:  
>   Δ*t*retry​\=min(*t*base​×2attempt,*t*max​)+random(100 ms,5000 ms)

---

*User prompt: {{FOCUS : 1\. The Pacing Decoupling Axiom (Why the Foundry Must Be Dumb)}} /extreme-details*

Response: The **Pacing Decoupling Axiom** dictates that the physical GPU foundry (**media-broker** on Rig 2\) must remain entirely blind to narrative pacing, dramatic cadence, biological speech timing, and lip-sync requirements. In this pipeline, **audio is the architect of time; picture is an integer projection mapped to audio duration**. The GPU foundry is designed as a "Dumb Executor," receiving only an immutable integer frame budget derived upstream, injecting it into an allowlisted workflow template, and allocating the exact latent tensor depth required for denoising.

### **1\. The Ontological Separation: Meaning, Master Time, and Adapter Representation**

The architecture enforces a strict Cartesian separation across two orthogonal axes: **Axis A (Semantic Truth & Meaning)** and **Axis B (Artifact Hardening & Representation)**. Pacing and duration belong to universal narrative time, while video diffusion operates purely as an untrusted, disposable projection layer.

┌────────────────────────────────────────────────────────────────────────┐  
│ AXIS A: NARRATIVE MEANING & STATE (worker-sower-engine / Ledger)       │  
│ • Evaluates narrative laws, character trauma, and dialogue text        │  
│ • Completely blind to pixels, frame rates, and audio waveforms         │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │ dialogue\_ast.json (Immutable Contract)  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ UNIVERSAL MASTER TIME (worker-sower-conductor on Rig 1\)                │  
│ • Acoustic Synthesis: Local TTS microservice (:8000)                   │  
│ • Empirical Observation: ffprobe measures physical waveform (D\_ms)     │  
│ • Pacing Compilation: MRU screen mapping & reaction holds              │  
│ • Master Grid Derivation: Absolute integer frames at 24.0 fps          │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │ Model Adapter Conformance Layer  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ MODEL ADAPTER CONTRACT (Isolated Conformance Boundary)                 │  
│ • Encapsulates checkpoint quirks (e.g., Wan 2.2 4n \+ 1 Causal VAE)     │  
│ • Derives Model Allocation: diffusionAllocation \= 4 \* ceil((N-1)/4) \+ 1│  
│ • Packages SpokeExecutionPayload { targetFrames, prompt, seed }        │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │ Outbound Lease Dispatch (WSS / Tunnel)  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ AXIS B: PHYSICAL SILICON FOUNDRY (media-broker on Rig 2\)               │  
│ • "THE DUMB EXECUTOR": Zero awareness of rhythm, dialogue, or pacing   │  
│ • Injects targetFrames integer directly into ComfyUI API template JSON │  
│ • Allocates \[B, C, (T-1)/4 \+ 1, H/8, W/8\] latent tensor in VRAM        │  
│ • Dumps raw \#00FF00 uncomposited plate to Cloudflare R2                │  
└────────────────────────────────────────────────────────────────────────┘

> * **worker-sower-engine (Narrative State Authority):** Resolves dramatic conflict, somatic conditions, and screenplay lines without calculating frame counts or sampling latents.  
> * **worker-sower-conductor (Master Clock Governor):** Translates narrative intent into physical time by synthesizing audio first and establishing an absolute 24.0 fps presentation grid.  
> * **media-broker (The Dumb Hardware Spoke):** Operates on pull semantics under an OS-level file lock (flock). It accepts an integer payload, runs K-Sampler iterations, and yields raw video bytes without evaluating whether the clip moves too fast or too slow.

### **2\. The Economic & Physical Asymmetry: Why Audio Governs Picture**

In traditional hand-drawn or keyframe animation, visual animators stage keyframes first, forcing sound engineers to cut, pitch-shift, or time-stretch audio stems to fit the visual cuts. Inverting this dependency in an automated generative pipeline causes rubbery lip-sync, floating pauses, broken cadence, and video-audio drift.

The pipeline resolves this through the **Economic Testing Funnel**: **fail as close as possible to the cheapest point of detection**.

Cost(Audio Synthesis)≈\$0.00≪Cost(Video Diffusion)≈\$0.05−\$0.15 / shot\[cite: 11, 35\]

> * **Audio Synthesis is Deterministic & Inexpensive:** Generating a 48 kHz uncompressed .wav stem via a local neural TTS model on Rig 1 takes \<2 seconds on CPU/system RAM and consumes zero dedicated GPU VRAM.  
> * **Video Diffusion is Non-Deterministic & Hardware-Constrained:** Allocating 16 to 22 GB of scratchpad memory for Wan 2.2 on Rig 2's consumer GPU takes 60 to 180 seconds.  
> * **The Master Clock Law:** Allowing the video model to determine its own clip duration means the most expensive, stochastic asset in the pipeline dictates the master timeline. If picture dictates time, any visual defect requiring a re-roll will alter the clip's duration, invalidating the audio mix, background foley beds, and downstream multi-track compositing.  
> * By locking speech first, **the physical duration of the dialogue stem becomes an immutable constraint**. The diffusion model is forced to conform to the sound, never the reverse.

### **3\. Observation vs. Derivation Decoupling**

To ensure universal narrative time is never corrupted by hardware delivery formats, the conductor maintains a strict boundary between empirical measurement and downstream presentation math:

Approved Dialogue AST ──► Local TTS (:8000) ──► ffprobe CLI ──► duration\_ms (Observation)  
                                                                       │  
                         ┌─────────────────────────────────────────────┴─────────────────────────────────────────────┐  
                         ▼                                                                                           ▼  
          target\_frames \= ceil((duration\_ms / 1000\) \* 24\)                                            target\_frames \= ceil((duration\_ms / 1000\) \* 30\)  
                 (Derivation: 24 fps Cinema)                                                                 (Derivation: 30 fps Broadcast)

> * **Empirical Observation (*D*ms​):** Native POSIX ffprobe inspects the synthesized .wav container on disk, extracting the exact floating-point waveform length in milliseconds.  
> * **Discrete Derivation (target\_frames):** The master delivery frame count is derived using integer ceiling quantization:  
>   target\_frames=⌈(1000*D*ms​​)×24⌉\[cite: 1, 11\]  
> * **Format Agnosticism:** Both values are stored in separate, immutable fields within exposure\_sheet.json. If the output medium changes from a 24 fps cinema release to a 30 fps or 60 fps broadcast master, the frame budgets are recalculated from *D*ms​ without re-synthesizing audio stems or re-evaluating narrative state.  
> * **Acoustic Immutability:** Once synthesized, .wav stems are hashed via SHA-256 and sealed in public/audio/dialogue/. Downstream rendering runtimes are strictly forbidden from calling TTS APIs during video generation, eliminating sub-frame duration jitter.

### **4\. Narrative Pacing vs. Diffusion Lattice Conformance (4*n*\+1)**

Pacing is a high-level dramatic property governed upstream by cause-and-effect storytelling, not by GPU samplers.

#### **Narrative Pacing Upstream (Dwight Swain MRUs)**

The conductor compiles cinematic rhythm using Motivation-Reaction Unit (MRU) screen mapping:

> * **Causal Sequencing:** Narrative beats follow an unbroken chain: Cause→Reflex→Processing→Decision→Speech.  
> * **Visceral Stings:** When the AST flags an emotional shock (VISCERAL\_STING), the conductor allocates an unvoiced 12-to-24 frame reaction hold *before* mounting the dialogue stem, accompanied by a camera push-in (1.0→1.03).  
> * **Diffusion Horizon Limits:** Diffusion models lose temporal coherence beyond 3.5 to 5.0 seconds. The conductor automatically splits dialogue exceeding 3.5 seconds into shot-reverse-shot coverage: 3.0 seconds on the speaker, cutting to a 2.0-second reaction plate of the listener with audio continuing under the cut.

#### **Model Adapter Latent Math (The 4*n*\+1 Lattice)**

While narrative time is continuous and broadcast video is locked to 24.0 fps, 3D causal VAE diffusion backends (such as Wan 2.1 and Wan 2.2) downsample temporal latents by a factor of 4×:

Latent Depth *T*latent​\=4*T*pixel​−1​\+1\[cite: 11, 15\]

To prevent latent shape mismatches during tensor deconvolution, *T*pixel​ must strictly satisfy:

*T*pixel​≡1(mod4)⟹*T*pixel​∈{17,33,49,65,77,81,…}\[cite: 11, 15\]  
// Upstream Conformance: Model Adapter isolates the hardware quirk  
export function computeDiffusionAllocation(rawFrames: number): number {  
  if (rawFrames \<= 1\) return 17; // Minimum tensor allocation floor  
  return 4 \* Math.ceil((rawFrames \- 1\) / 4\) \+ 1;  
}

This 4*n*\+1 rule belongs strictly to the **Model Adapter Contract**, never to universal narrative time or the GPU foundry.

> * If a line requires 75 frames of speech, the conductor calculates diffusionAllocation=77 frames.  
> * The media-broker receives the number 77\. It does not know that the dialogue is 75 frames; it only knows how to allocate a 77-frame tensor in VRAM.

### **5\. Pathological Failure Modes of an "Intelligent" Foundry**

If the GPU foundry on Rig 2 were granted the authority to calculate its own timing, interpret narrative pacing, or sample variable durations, four systemic failure modes occur:

#### **A. Elastic Cadence Drift & Lip Flap**

If ComfyUI adjusts frame generation based on prompt tokens or internal motion heuristics, the output plate will drift from the audio stem. A character will either stop moving while dialogue continues playing, or continue mouthing words in silence after the line ends.

#### **B. Checkpoint Hostage Vulnerability**

If the master timeline is coupled to the frame lattice of Wan 2.2, upgrading to a future architecture (e.g., a DiT with an 8× temporal compression ratio or native 16 fps sampling) breaks the entire studio stack. By keeping the foundry dumb and isolating lattice math to the model adapter, swapping a model requires updating a single adapter file without modifying screenplays, audio files, or Remotion compositions.

#### **C. VRAM Exhaustion & PCIe Thrashing**

Granting Rig 2 temporal intelligence requires loading language models, acoustic analyzers, or ffprobe decoders directly alongside video diffusion checkpoints. Consumer GPUs cannot host large language models (9–10 GB) and video diffusion models (16–22 GB) concurrently. Attempting to do so triggers immediate CUDA Out-Of-Memory crashes or forces dozens of gigabytes of weights across PCIe lanes on every shot.

#### **D. Non-Deterministic Timeline Collapse**

Generative diffusion models are stochastic. If the duration of a shot is decided by a model's internal sampling, changing a random seed or adjusting a LoRA weight changes the duration of the entire scene. This causes cascading invalidations across all downstream cuts, destroying the stable dependency structure of the episode.

### **6\. Post-Render Conformance: The Tail-Trim Illusion**

Because the media-broker renders the aligned 4*n*\+1 lattice count (e.g., 77 frames) rather than the exact raw dialogue count (e.g., 75 frames), the generated plate is intentionally longer than the spoken audio track.

The system resolves this discrepancy downstream on Rig 1 inside the **Remotion Optical Compositor**:

// Conformed playback inside Episode\_XXX.tsx on Rig 1  
\<Sequence durationInFrames={75} from={0}\>  
  \<CharacterPlate   
    src="r2://plates/sha256\_9b8a1c...mp4"   
    trimEndFrames={2} // Trims the 2 excess 4n+1 padding frames  
  /\>  
  \<Audio src="public/audio/dialogue/sh001\_bog.wav" /\>  
\</Sequence\>

> 1. **The Foundry Egresses Raw Bytes:** The media-broker uploads the 77-frame plate to Cloudflare R2, completely unaware that the character finishes speaking on frame 75\.  
> 2. **The Compositor Enforces Delivery Truth:** The Remotion compositor mounts the video, slices off the final 2 padding frames, and aligns the visual performance to the acoustic waveform with sub-frame accuracy.

Keeping the media-broker as a strictly dumb executor preserves compute stability on Rig 2, prevents VRAM allocation collisions, and guarantees that every pixel delivered to the broadcast master adheres to the non-negotiable acoustic clock established on Rig 1\.

---

*User prompt: {{FOCUS : 2\. In-Memory Graph Ingestion & Parameter Injection }}*

### **Response: 1\. The Headless DAG Topology (workflow\_api.json) & The Abstract Syntax Tree (AST)**

In production generative pipelines, ComfyUI is operated not as an interactive GUI application, but as a headless, programmatically driven tensor execution runtime. When a workflow is authored visually in the ComfyUI user interface, the file format bundles layout data: virtual canvas coordinates, pan/zoom vectors, color codes, and visual wire routings. In contrast, the headless execution runtime completely strips this presentation layer, exposing ComfyUI's "API Format" (workflow\_api.json) as a flat, typed Directed Acyclic Graph (DAG) serialized into a key-value JSON dictionary:

{  
  "3": {  
    "class\_type": "KSampler",  
    "inputs": {  
      "seed": 849204,  
      "steps": 25,  
      "cfg": 7.5,  
      "sampler\_name": "euler",  
      "scheduler": "normal",  
      "denoise": 1.0,  
      "model": \["4", 0\],  
      "positive": \["6", 0\],  
      "negative": \["7", 0\],  
      "latent\_image": \["5", 0\]  
    }  
  }  
}

> * **Graph Representation:** Every node is keyed by an arbitrary string identifier (e.g., "3", "6") mapping to its underlying Python class (class\_type).  
> * **Topological Edge Tuples:** Edges between processing blocks are declared as two-element tuples: \["\<source\_node\_id\>", \<output\_index\>\]. Primitive values (integers, floats, string literals) are declared directly as key-value pairs within the inputs record.  
> * **Stateless Memory Profile:** ComfyUI holds zero pre-compiled, static workflows in memory. It acts as a passive execution target: when an external orchestrator issues an HTTP POST request to \[http://127.0.0.1:8188/prompt\](http://127.0.0.1:8188/prompt), the internal runtime deserializes the incoming graph dictionary, performs a topological sort, evaluates cached input hashes, and begins node-by-node tensor execution.

### **2\. The Ingestion Lifecycle & In-Memory Parameter Hydration**

The media-broker on Rig 2 does not load or compile workflows from unvetted network requests. Instead, it manages a verified on-disk template library of headless API workflows, parsing them directly into volatile memory upon receiving an execution payload from the Cloudflare edge:

  \[ SpokeExecutionPayload \] (from edge-director DO via Tunnel)  
             │  
             ▼  
┌────────────────────────────────────────────────────────┐  
│ media-broker In-Memory Ingestion Pipeline (Rig 2\)      │  
├────────────────────────────────────────────────────────┤  
│ 1\. Load allowlisted API template from local NVMe       │  
│    (e.g., /workflows/wan\_greenscreen\_plate.json)       │  
│ 2\. Deserialize JSON directly into memory object heap   │  
│ 3\. Execute Deep Parameter Mutation (In-Place Binding)  │  
│    • inputs.text               ◄── Injected Prompt     │  
│    • inputs.seed               ◄── Injected Seed       │  
│    • inputs.length             ◄── 4n+1 Target Frames  │  
│    • inputs.lora\_name          ◄── Validated LoRA Path │  
│    • inputs.extra\_pnginfo.tags ◄── trace\_id Tagging    │  
│ 4\. Emit Sealed Graph to POST http://127.0.0.1:8188/prompt │  
└────────────────────────────────────────────────────────┘

#### **Allowlisted Template Repository**

The local broker maintains a repository of baseline templates on its NVMe scratch disk:

> * wan\_greenscreen\_plate.json: Configured for temporal video diffusion targeting pure chroma key (\#00FF00) backdrops.  
> * flux\_matte\_background.json: Configured for single-frame high-resolution environmental plate generation.  
> * latent\_inpaint\_repair.json: Configured with masked latent crops for localized defect remediation.

#### **In-Place Parameter Binding Mechanics**

Upon claiming a task lease, media-broker parses the appropriate JSON template into an in-memory JavaScript object and mutates its input parameters:

> 1. **Prompt Ingestion:** The text payload is injected into the designated CLIPTextEncode node (workflow\["6"\].inputs.text \= payload.positivePrompt), appending required stylistic and color isolation tokens (e.g., ", chroma key \#00FF00, sharp lighting").  
> 2. **Deterministic Seed Binding:** The pseudorandom seed is injected into the sampling node (workflow\["3"\].inputs.seed \= payload.seed), locking generation determinism for that specific shot.  
> 3. **Latent Frame Budget Injection:** The pre-quantized frame budget is injected into the latent generation node (EmptyWanLatentVideo or WanLatentImage). The broker writes the upstream-calculated frame count (*T*pixel​) directly into the node's length parameter:  
>    workflow\["37"\].inputs.length=payload.targetFrames  
> 4. **LoRA Path Resolution:** The broker verifies that the required character adapter .safetensors file exists in ComfyUI/models/loras/, updates the loader's lora\_name input, and sets the model/clip strength multipliers according to the shot manifest.  
> 5. **Traceability Injection:** The broker binds the upstream distributed tracking identifier (trace\_id) into the graph's metadata envelope (extra\_pnginfo), guaranteeing that every progress packet and final rendered .mp4 container carries end-to-end tracing.

### **3\. Dynamic Graph Synthesis vs. Brittle Static Templates**

While single-character shots can use static template hydration, scaling to complex cinematic requirements causes a combinatorial explosion of static templates (e.g., wan\_base.json, wan\_controlnet.json, wan\_dual\_lora.json, wan\_inpaint.json).

To eliminate this fragility, the pipeline synthesizes workflow\_api.json programmatically at compile time by treating the ComfyUI DAG as an Abstract Syntax Tree (AST) generated by a typed compiler:

       DIRECTORIAL SCENE INTENT (from dialogue\_ast.json)  
       \[ Camera: crash\_zoom | Motion: low | Subject: Bog \+ Spleen \]  
                                   │  
                                   ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│                      GRAPH COMPILER ENGINE                             │  
│                                                                        │  
│  1\. Ingest Scene Tags & Character Requirements                         │  
│  2\. Allocate Monotonic Node ID Registry (O(1) collision-free)          │  
│  3\. Select Active Subgraph Modules (LoRA, ControlNet, Inpaint)         │  
│  4\. Resolve Sockets: Type-Match Encoders \-\> Samplers \-\> Decoders       │  
│  5\. Run Topo-Sort & Assert Acyclicity (Tarjan's/Kahn's Algorithm)      │  
└──────────────────────────────────┬─────────────────────────────────────┘  
                                   │  
                                   ▼  
          OUTPUT: Fully Sealed, Dynamic workflow\_api.json

#### **Monotonic Node ID Allocation**

When multiple subgraphs are spliced together, hardcoded node IDs collide. The compiler implements an internal monotonic counter that allocates guaranteed unique string IDs in *O*(1) time:

class ComfyGraphBuilder {  
  private currentId \= 1;  
  public nodes: Record\<string, { class\_type: string; inputs: Record\<string, any\> }\> \= {};

  allocateNode(nodeClass: string, inputs: Record\<string, any\>): string {  
    const id \= (this.currentId++).toString();  
    this.nodes\[id\] \= { class\_type: nodeClass, inputs };  
    return id;  
  }  
}

#### **Directive-Driven Subgraph Injection**

The compiler dynamically splices specialized modules into the execution graph based on scene directives:

> * **Multi-Subject LoRA Chains & Regional Conditioning:** When a scene calls for two characters interacting (e.g., Bog and Spleen), simple single-prompt conditioning leads to identity bleeding, where character features merge into a single chimeric figure. The graph synthesizer automatically injects regional conditioning nodes and chained LoRA loaders, binding each character's weights and prompt conditioning strictly to their respective spatial half of the canvas.  
> * **ControlNet / Pose Guidance Splicing:** If an action beat requires explicit structural staging, the compiler injects a ControlNet loader and preprocessor block between the image loader and the K-Sampler.  
> * **Surgical Inpainting Repair Graphs:** If an automated Level 0 visual critic flags a defect (such as hand deformities or facial drift between frames 24–48), the system avoids a costly full-scene re-render. Instead, it generates an ephemeral inpainting graph that loads the cached plate, clips the specific frame range, applies a feathered spatio-temporal mask over the flagged bounding box, and denoises at a reduced strength (0.35−0.45) to repair the anomaly in seconds.

### **4\. Compile-Time Typing, Socket Contracts, & Static Graph Linting (*T*0​)**

Native ComfyUI models edges using coarse, untyped strings (such as LATENT, IMAGE, MODEL, CONDITIONING). It cannot natively detect structural latent mismatches, such as routing a 4-channel SDXL latent into a 16-channel Wan 2.2 DiT sampler, which causes an unhandled CUDA abort inside PyTorch during execution.

To eliminate runtime crashes, the pipeline enforces a **Compile-Time Type Checker** that arrests malformed graphs at *T*0​ before any GPU memory is allocated:

interface SocketContract {  
  node\_id: string;  
  output\_index: number;  
  data\_type: 'MODEL' | 'CLIP' | 'CONDITIONING' | 'LATENT' | 'IMAGE' | 'MASK';  
  latent\_family?: 'SDXL' | 'FLUX' | 'WAN\_2\_2';  
}

                      COMPILE-TIME SOCKET AUDIT (T0)  
                        
   \[ Node 5: EmptyLatentImage \] ──► Emits: LATENT (Family: SDXL, Channels: 4\)  
                  │  
                  ▼ Edge Attempt: \["5", 0\] \-\> \["12", "latent\_image"\]  
   \[ Node 12: WanKSampler \]      ──► Expects: LATENT (Family: WAN\_2\_2, Channels: 16\)  
                  │  
                  ▼  
   ❌ COMPILER ERROR \[E042\]: Latent Family Mismatch\!  
   Halts in user-space in \<2ms; blocks hardware queue; costs \$0.00 compute.

#### **Introspected Node Registry via /object\_info**

The graph compiler avoids brittle, manually authored node definitions. During container build or daemon initialization, the system queries the live ComfyUI instance via GET \[http://127.0.0.1:8188/object\_info\](http://127.0.0.1:8188/object\_info).

This call exports the schemas, parameter names, and input/output socket tuples for every installed custom node into a sealed node\_registry.json artifact. The compiler validates every node class and socket connection against this registry at build time, ensuring that any custom-node drift or renamed parameters are caught during CI before touching production silicon.

#### **Structural Pre-Flight Linting**

Before dispatching a graph to the local ComfyUI daemon, the compiler runs three structural lint checks:

> 1. **Adjacency Validation:** Every referenced source\_node\_id in an edge tuple must resolve to an active node in the graph dictionary.  
> 2. **Socket Index Bounds:** The output\_index in every edge tuple must be within the bounds of the source node's class output array.  
> 3. **Acyclicity Verification:** The graph compiler runs Kahn's algorithm or Tarjan's strongly connected components algorithm to mathematically prove that the execution graph is strictly acyclic, preventing infinite loops in the topological sorter.

### **5\. Hardware-Targeted Graph Transpilation**

Dynamic synthesis cleanly separates **what** needs to be rendered from **how** specific hardware must execute it. The compiler implements hardware target profiles, compiling different graph topologies from a single high-level intent:

                             ABSTRACT GRAPH SPECIFICATION  
                                          │  
                  ┌───────────────────────┴───────────────────────┐  
                  ▼                                               ▼  
         \[ Target: Rig 2 \]                             \[ Target: RunPod Cloud \]  
   (Local RTX 4090 / 24GB VRAM)                       (Serverless A100 / 80GB VRAM)  
                  │                                               │  
┌──────────────────────────────────────┐        ┌──────────────────────────────────────┐  
│ COMPILER TRANSPILATION PASS:         │        │ COMPILER TRANSPILATION PASS:         │  
│ • Swap ModelLoader \-\> GGUFModelLoader│        │ • Inject Full Precision FP16 Loaders │  
│ • Set weight quantization to Q4\_K\_M  │        │ • Unroll sequential shots to batch   │  
│ • Inject FreeVRAM nodes after VAE    │        │ • Strip CPU offload nodes            │  
│ • Cap max concurrent latents to 1    │        │ • Pipeline full sequence concurrently│  
└──────────────────────────────────────┘        └──────────────────────────────────────┘

> * **Local Foundry Profile (Rig 2 / 24 GB VRAM):** When compiling for Rig 2's local consumer GPU, the compiler transpiles model loaders into UnetLoaderGGUF blocks, sets tensor weights to Q4\_K\_M, inserts explicit /free VRAM cleanup triggers after the VAE decode step, and restricts the K-Sampler to single-shot processing to prevent CUDA Out-Of-Memory exceptions.  
> * **Cloud Burst Profile (RunPod Serverless / 80 GB A100):** When routing tasks to serverless cloud workers, the compiler removes sequential offload nodes, swaps to full-precision FP16 checkpoints, unrolls shots into parallel batch samplers, and maximizes throughput across the 80 GB memory pool.

### **6\. Automated Schema Repair via Synthetic Coding Agents**

When upstream custom node maintainers push breaking changes to GitHub repositories (e.g., renaming an input parameter from model\_name to ckpt\_name), existing workflows crash.

To eliminate manual maintenance overhead, the pipeline uses an automated self-healing loop:

> 1. **Error Interception:** If a workflow crashes at runtime due to a socket or parameter mismatch, the execution daemon captures the Python traceback and the dispatched workflow JSON.  
> 2. **Source Inspection:** An automated agent (Jules) inspects the updated custom node's Python source code, reading its INPUT\_TYPES() and RETURN\_TYPES methods directly.  
> 3. **Graph Builder Patching:** The agent updates the builder definition keys in the compiler to match the new schema, verifies the change in a headless test harness, and commits the updated compiler code to the repository, self-healing the pipeline without human intervention.

---

*User prompt: {{FOCUS: Upstream Flow: Media Broker \$\\to\$ Edge Director}} /extreme-details*

### **Response: 1\. Protocol Framing, Wire Transport, & Tunnel Topology**

The **Upstream Flow (media-broker → edge-director)** carries health keep-alives, normalized GPU step execution telemetry, error signals, and completed asset promotion RPCs from physical silicon on **Rig 2** to Cloudflare's serverless edge.

┌────────────────────────────────────────────────────────────────────────┐  
│ RIG 2: media-broker DAEMON (:3000 Loopback / Scratch Disk)             │  
│                                                                        │  
│  \[ ComfyUI Native Telemetry: ws://127.0.0.1:8188/ws \]                  │  
│  • execution\_start ──► TASK\_INITIALIZED                                │  
│  • executing (node \!== null) ──► BROKER\_STAGE\_CHANGE                   │  
│  • progress ──► BROKER\_PROGRESS (Step N/M, Normalized %)               │  
│  • executing (node \=== null) ──► TASK\_EXECUTION\_COMPLETE               │  
│  • Binary Latent Preview Frames ──► INTERCEPTED & SUPPRESSED           │  
│                                                                        │  
│  \[ Thread-Isolated Background Timer \]                                  │  
│  • BROKER\_HEARTBEAT ──► Emitted every 10s (Epoch N, VRAM Metrics)      │  
│                                                                        │  
│  \[ Post-Render Egress Engine \]                                         │  
│  • ffprobe Codec & moov Atom Audit                                     │  
│  • SHA-256 \!= e3b0c44298fc1c...b855 Assertion                          │  
│  • Stream to Cloudflare R2: staging/.../epoch\_N\_sha256.mp4             │  
│  • BROKER\_COMPLETE RPC ──► (Epoch N, SHA-256 Digest, Staging Key)     │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │ Outbound-Only Encrypted Tunnel (cloudflared)  
                                    │ Persistent WSS: /ws?role=broker  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ CLOUDFLARE EDGE: edge-director (ShotCoordinatorDO)                     │  
│                                                                        │  
│ • Anycast Edge Proxy detects incoming bytes, wakes DO isolate in \<2ms  │  
│ • Transactional Storage Verification (ctx.storage)                     │  
│ • Heartbeat Gate: Extends watchdog alarm (ctx.storage.setAlarm(+30s))  │  
│ • Progress Multiplexer: Stamps monotonic seq: N+1; broadcasts to       │  
│   tagged client sockets (this.ctx.getWebSockets("artist"))             │  
│ • Promotion Gate: Compares incoming epoch against active lease epoch   │  
│   ├── Match: Promotes staging key to canonical manifest; unlocks mutex │  
│   └── Stale: Emits HTTP 409 Conflict; drops zombie write to 7-day GC   │  
└────────────────────────────────────────────────────────────────────────┘

> * **Outbound-Only Tunnel Ingress:** The media-broker initiates an encrypted outbound connection via cloudflared to the edge gateway. Physical ports on Rig 2 (port 8188 for ComfyUI and port 3000 for the broker management loop) remain bound strictly to 127.0.0.1 and are never exposed to incoming WAN traffic.  
> * **Role-Tagged WebSocket Upgrade:** The broker dials wss://.../ws?role=broker, where Cloudflare's EdgeGateway validates Access Service Tokens in \<5 ms and routes the socket to ShotCoordinatorDO.  
> * **Binary Frame Isolation at the Loopback:** ComfyUI’s internal WebSocket bus emits binary frames containing intermediate latent image previews during sampling passes. The media-broker filters and drops these binary packets on 127.0.0.1, transmitting only structured JSON text frames up the tunnel to avoid saturating bandwidth and waking the hibernated Durable Object unnecessarily.  
> * **Unified Trace Context Propagation:** Every packet traveling upstream extends a common envelope bound to the universal trace\_id generated upstream on Rig 1, preserving correlation across the Conductor, the Edge DO, local PyTorch runtimes, and Cloudflare R2 object headers.

### **2\. The Keep-Alive Pulse: BROKER\_HEARTBEAT & Lease Extension**

Because generative diffusion runs are long-running operations (60–120 seconds per plate), the edge cannot enforce static execution timeouts without risking premature job cancellation. The system replaces static timeouts with dynamic, heartbeat-renewed leases.

export interface BrokerHeartbeatPayload {  
  vramTotalMb: number;  
  vramFreeMb: number;  
  vramUsedMb: number;  
  gpuUtilizationPct: number;  
  activeLocalNode: string | null;  
  consecutiveShotsRendered: number;  
}

export type BrokerHeartbeatPacket \= BaseWirePacket\<"BROKER\_HEARTBEAT", BrokerHeartbeatPayload\>;

> * **Thread-Isolated Emission:** The media-broker heartbeat emitter runs on a dedicated asynchronous background timer or worker thread, decoupled from the main GPU execution loop. If the primary thread blocks while performing local file reads, AST parsing, or disk operations, the heartbeat pulse continues unaffected.  
> * **The 10-Second Cadence:** The broker transmits BROKER\_HEARTBEAT every 10 seconds, stamping the payload with its active monotonic epoch.  
> * **Hardware Health Auditing:** The heartbeat payload reports live metrics queried from the local NVIDIA display driver via nvidia-smi, verifying that baseline VRAM (\>21 GB free on a 24 GB card) remains uncompromised.  
> * **Autonomous Watchdog Extension:** When ShotCoordinatorDO receives a heartbeat matching its active lease, it executes:  
>   await this.ctx.storage.setAlarm(Date.now() \+ 30000);

This pushes the edge hardware watchdog alarm forward by 30 seconds, maintaining the lease as long as the local machine remains responsive.

### **3\. Loopback Interception & Normalization: BROKER\_PROGRESS**

The media-broker captures low-level events from ComfyUI's loopback bus (ws://127.0.0.1:8188/ws) and translates them into vendor-agnostic pipeline events before dispatching them upstream:

┌───────────────────────────┬──────────────────────────────────────────┬────────────────────────────────────────────────────────┐  
│ Native ComfyUI Event      │ Loopback Payload Characteristics         │ Normalized Upstream Packet (media-broker \-\> DO)        │  
├───────────────────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤  
│ execution\_start           │ { prompt\_id: UUID }                      │ TASK\_INITIALIZED                                       │  
│ executing (node \!== null) │ { node: "37", prompt\_id: UUID }          │ BROKER\_STAGE\_CHANGE (Stage: DIFFUSION\_SAMPLING)        │  
│ progress                  │ { value: 25, max: 50, prompt\_id: UUID }  │ BROKER\_PROGRESS (Step: 25, Total: 50, Percentage: 50%) │  
│ executing (node \=== null) │ { node: null, prompt\_id: UUID }          │ TASK\_EXECUTION\_COMPLETE (Triggers Local Egress Audit)  │  
│ execution\_error           │ { exception\_type: "CUDA OOM", ... }      │ BROKER\_FAILURE (Trips Edge Circuit Breaker)            │  
└───────────────────────────┴──────────────────────────────────────────┴────────────────────────────────────────────────────────┘

export interface BrokerProgressPayload {  
  nodeId: string;  
  nodeType: "KSamplerAdvanced" | "VAEDecode" | "CLIPTextEncode" | "LoadCheckPoint";  
  step: number;  
  totalSteps: number;  
  percentage: number;  
  etaSeconds: number;  
}

export type BrokerProgressPacket \= BaseWirePacket\<"BROKER\_PROGRESS", BrokerProgressPayload\>;

> * **Progress Calculation:** Raw iteration steps are converted into a unified progress percentage:  
>   percentage=(maxvalue​)×100  
> * **Sub-2ms Edge Waking:** When BROKER\_PROGRESS packets arrive at Cloudflare's Anycast proxy, the hibernating ShotCoordinatorDO isolate is rehydrated in \<2 ms.  
> * **Transactional State Caching:** The DO updates its latest progress snapshot in transactional NVMe storage (await this.ctx.storage.put("latest\_progress", data)), ensuring that disconnected clients can instantly recover current render progress upon reconnection.  
> * **Multiplexed Artist Broadcast:** The DO stamps the envelope with an incrementing sequence identifier (seq: N \+ 1\) and broadcasts it exclusively to tagged artist sockets via this.ctx.getWebSockets("artist"), keeping rendering nodes isolated from client UI traffic.

### **4\. Terminal Egress, Integrity Auditing, & Promotion: BROKER\_COMPLETE**

When ComfyUI completes diffusion, it broadcasts the sentinel { "executing": { "node": null } } over its local socket. The media-broker intercepts this event and executes an on-disk integrity audit before uploading the artifact or contacting the edge.

\[ ComfyUI Completion Sentinel: { node: null } \]  
                       │  
                       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ LOCAL SCRATCHPAD INTEGRITY AUDIT (Rig 2\)                               │  
│                                                                        │  
│ 1\. Assert Byte Length: stat.size \> 0                                   │  
│ 2\. Empty-File Hash Trap: Assert SHA-256 \!= e3b0c44298fc1c...b855       │  
│ 3\. ffprobe Binary Verification:                                        │  
│    • Validate container moov atom integrity                            │  
│    • Assert decoded stream frames \== targetFrames (at 24 fps)          │  
└──────────────────────────────────────┬─────────────────────────────────┘  
                                       │ Verification Passes  
                                       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ DIRECT STORAGE EGRESS (Cloudflare R2 via @aws-sdk/client-s3)           │  
│                                                                        │  
│ • Key: staging/renders/\${taskId}/epoch\_\${epoch}\_\${sha256}.mp4          │  
│ • Metadata: x-amz-meta-trace-id: \${traceId}                            │  
│ • Immutable, Content-Addressed Object Storage                          │  
└──────────────────────────────────────┬─────────────────────────────────┘  
                                       │ Upload Completes Cleanly  
                                       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ PROMOTION COMMIT RPC (POST /tasks/complete)                            │  
│                                                                        │  
│ Payload: { taskId, epoch, sha256, stagingKey, renderedFrames }        │  
│                                                                        │  
│ ShotCoordinatorDO Evaluates Monotonic Fencing:                         │  
│   IF (incoming.epoch \== active.epoch):                                 │  
│      • Write asset pointer to canonical production manifest            │  
│      • Release Single-Threaded Hardware Mutex                          │  
│      • Clear Storage Watchdog Alarm                                    │  
│      • Broadcast SHOT\_READY { seq, signed\_url } to Artist Clients      │  
│      • Return HTTP 200 OK (media-broker releases local flock)          │  
│   ELSE (incoming.epoch \< active.epoch):                                │  
│      • REJECT WITH HTTP 409 CONFLICT (Zombie Runner Rejection)         │  
│      • Staged bytes ignored; purged by R2 7-day lifecycle policy       │  
└────────────────────────────────────────────────────────────────────────┘

#### **The Defensive Local Scratch Audit**

> 1. **Byte Length Assertion:** The broker inspects the output video file in ComfyUI/output/ and asserts that byteLength \> 0\.  
> 2. **Empty-File Hash Trap:** The broker computes the SHA-256 digest of the raw bytes and asserts that it does not equal the empty-string constant:  
>    SHA-256(∅)=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
>    If this hash appears, the job is flagged as a write failure, preventing zero-byte files from propagating upstream.  
> 3. **Container & Frame Lattice Audit (ffprobe):** The broker spawns a POSIX ffprobe child process to confirm that the MP4 moov atom is intact and that the stream's frame count matches the pre-quantized targetFrames derived upstream on Rig 1\.

#### **Content-Addressed Staging Upload**

The broker streams the verified .mp4 binary directly to Cloudflare R2 using @aws-sdk/client-s3. Because S3-compatible APIs cannot evaluate monotonic fencing tokens on raw PUT requests, the file is uploaded to an epoch-scoped staging path:

staging/renders/\${taskId}/epoch\_\${epoch}\_\${sha256}.mp4

#### **The Promotion Gate & Fencing Enforcement**

Once the upload finishes, the broker issues an authenticated RPC to ShotCoordinatorDO via POST /tasks/complete:

export interface BrokerCompletePayload {  
  sha256: string;  
  byteLength: number;  
  stagingKey: string;  
  executionDurationMs: number;  
  renderedFrames: number;  
}

export type BrokerCompletePacket \= BaseWirePacket\<"BROKER\_COMPLETE", BrokerCompletePayload\>;

> * **Valid Epoch Verification:** The DO checks packet.epoch \=== this.activeEpoch inside an atomic storage block. If valid, the staging key is promoted to the canonical production manifest, the hardware mutex is unlocked, and the DO broadcasts SHOT\_READY containing the pre-signed R2 URL to Rig 1 under Cloudflare R2's **\$0.00 egress fee guarantee**.  
> * **Zombie Runner Rejection:** If a transient network drop caused the edge watchdog alarm to trip (\>30s) prior to completion, the DO has already incremented its internal epoch (*N*→*N*\+1) and reassigned the task. When the partitioned broker reconnects and attempts to commit with stale epoch *N*, the DO rejects the write with **HTTP 409 Conflict**. The orphaned staging object is never promoted to canonical truth and is automatically reaped by R2's 7-day lifecycle retention policy.

### **5\. Deterministic Failure Quarantine & Circuit Breaker: BROKER\_ERROR**

When hardware execution faults occur locally on Rig 2, the media-broker captures the error, classifies it, and transmits a structured BROKER\_ERROR packet upstream:

export interface BrokerErrorPayload {  
  category:   
    | "CUDA\_OOM"   
    | "MISSING\_MODEL\_WEIGHTS"   
    | "SCHEMA\_VIOLATION"   
    | "CORRUPTED\_CONTAINER"   
    | "SCRATCH\_VALIDATION\_FAILED";  
  message: string;  
  stackTrace?: string;  
  recoverable: boolean;  
}

export type BrokerErrorPacket \= BaseWirePacket\<"BROKER\_ERROR", BrokerErrorPayload\>;

> * **CUDA OOM Handling:** If ComfyUI emits an out-of-memory error, media-broker immediately triggers POST /free to flush VRAM, polls nvidia-smi until memory returns to baseline, and emits BROKER\_ERROR with category: "CUDA\_OOM".  
> * **Dead-Letter Queue (DLQ) Routing:** Upon receiving BROKER\_ERROR, the ShotCoordinatorDO evaluates the job's attempt\_count. If attempt\_count \< maxAttempts (2), it re-queues the shot; if retries are exhausted, it isolates the task into dlq:\${jobId} in transactional storage (ctx.storage), releases the hardware mutex, and alerts connected client cockpits.

### **6\. End-to-End Operational Lifecycle Trace**

Rig 2 (media-broker)                 Cloudflare R2 Bucket          edge-director (ShotCoordinatorDO)  
      │                                       │                                   │  
      ├─ Local Hardware Mutex Held            │                                   │  
      │  (flockSync on /var/lock/gpu)         │                                   │  
      │  nvidia-smi: Free VRAM \>21 GB         │                                   │  
      │                                       │                                   │  
      ├─ T \= 10s: BROKER\_HEARTBEAT ──────────────────────────────────────────────►│  
      │  { epoch: 4, vramFreeMb: 21800 }      │                                   ├─ Resets Watchdog Alarm  
      │                                       │                                   │  ctx.storage.setAlarm(+30s)  
      │                                       │                                   │  
      ├─ Dispatches POST :8188/prompt         │                                   │  
      │                                       │                                   │  
      ├─ Taps ws://127.0.0.1:8188/ws          │                                   │  
      ├─ Normalizes "progress" (Step 25/50)   │                                   │  
      │                                       │                                   │  
      ├─ BROKER\_PROGRESS (50%) ──────────────────────────────────────────────────►│  
      │  { epoch: 4, step: 25, total: 50 }    │                                   ├─ Wakes DO isolate in \<2ms  
      │                                       │                                   ├─ Stores latest\_progress  
      │                                       │                                   ├─ Broadcasts to Artists  
      │                                       │                                   │  (seq: 112, progress: 50%)  
      │                                       │                                   │  
      ├─ ComfyUI emits: { node: null }        │                                   │  
      ├─ Scratch Audit: Size \> 0, moov OK     │                                   │  
      ├─ Computes SHA-256 Digest              │                                   │  
      │                                       │                                   │  
      ├─ Streams MP4 to Staging Key ─────────►│                                   │  
      │  staging/.../epoch\_4\_a8f5b.mp4        │                                   │  
      │                                       │                                   │  
      ├─ RPC: POST /tasks/complete ──────────────────────────────────────────────►│  
      │  { taskId, epoch: 4, sha256, key }    │                                   ├─ Asserts activeEpoch \== 4  
      │                                       │                                   ├─ Promotes staging to canonical  
      │                                       │                                   ├─ Releases Hardware Mutex  
      │                                       │                                   │  
      │◄───── HTTP 200 OK ────────────────────────────────────────────────────────┤  
      │                                       │                                   ├─ Broadcasts to Artists:  
      ├─ Releases local flock                 │                                   │  SHOT\_READY { seq: 114, url }  
      └─ Polls next task manifest             │                                   │

---

*User prompt: {{FOCUS: Downstream Flow: Edge Director \$\\to\$ Media Broker}} /extreme-details*

Response: The **Downstream Flow (edge-director → media-broker)** is the authoritative control and dispatch pipeline that translates validated narrative intents into physical silicon execution on Rig 2\. It bridges Cloudflare's serverless edge with the on-premises GPU foundry through an outbound-only encrypted tunnel, enforcing strict hardware serialization, monotonic epoch fencing, and dynamic lease allocation without exposing local network ports to the public internet.

### **1\. Ingress Trigger, Invalidation Check, & Serialization Barrier**

Before any job can travel downstream toward physical silicon, it must clear the edge gateway's syntactic and relational continuity barriers:

\[ Rig 1: The Conductor \]  
           │  
           │ POST /dispatch (Signed JWT \+ Idempotency Key)\[cite: 1, 3\]  
           ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ CLOUDFLARE EDGE: EdgeGateway (src/index.ts via Hono)                   │  
│                                                                        │  
│ 1\. Cryptographic Handshake: Validates Clerk RS256 JWT in \<5ms\[cite: 1\]│  
│ 2\. Schema Audit: Evaluates SpokeExecutionPayloadSchema (Zod)\[cite: 1\] │  
│ 3\. Relational Truth Gate: Queries Cloudflare D1 (CANON\_DB)\[cite: 1\]:  │  
│    SELECT COUNT(\*) AS dirty\_count                                      │  
│    FROM scene\_fact\_dependencies                                        │  
│    WHERE scene\_id \= ? AND is\_dirty \= 1;\[cite: 1\]                      │  
│                                                                        │  
│    ├── dirty\_count \> 0 ──► Abort with HTTP 412 (DIRTY\_SCENE\_REJECTED)  │  
│    └── dirty\_count \== 0 ──► Forward via internal RPC to DO\[cite: 1\]   │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │ stub.fetch(dispatchRequest)\[cite: 1\]  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ SINGLETON ACTOR: ShotCoordinatorDO                                     │  
│                                                                        │  
│ • Idempotency Verification: Checks UUIDv7 key against ctx.storage \[1\]  │  
│ • Enqueues job in single-threaded FIFO / Round-Robin Queue\[cite: 1\]   │  
│ • Awaits broker pull readiness and Hardware Mutex availability\[cite: 1\]│  
└────────────────────────────────────────────────────────────────────────┘

> * **Relational Continuity Gate:** The EdgeGateway queries Cloudflare D1 (CANON\_DB) to assert that the target scene is not marked dirty (is\_dirty \== 0). If upstream narrative mutations altered character trauma, conditions, or inventory without re-compiling the Abstract Syntax Tree (AST), dispatch terminates immediately with HTTP 412 Precondition Failed, spending \$0.00 of GPU compute on invalid story states.  
> * **Transactional Idempotency:** The payload arrives at the singleton ShotCoordinatorDO carrying a client-generated UUIDv7 idempotency\_key. The Durable Object inspects its transactional key-value store (ctx.storage). If an identical request is active or pending, the duplicate insertion is ignored, returning the active job status to suppress network retries.  
> * **Single-Threaded FIFO Mutex:** Consumer workstation GPUs cannot process concurrent diffusion graphs without triggering fatal CUDA Out-Of-Memory (OOM) faults. The ShotCoordinatorDO serializes jobs into a FIFO queue and enforces fair round-robin scheduling across tenant IDs, ensuring Rig 2 processes exactly one plate at a time.

### **2\. Lease Creation, Monotonic Epoch Fencing, & The Watchdog Alarm**

When Rig 2 signals that its local hardware is available and the single-threaded mutex opens, the ShotCoordinatorDO transitions from a passive queue to an active lease issuer:

┌────────────────────────────────────────────────────────────────────────┐  
│ ShotCoordinatorDO LEASE ISSUANCE STATE MACHINE                         │  
├────────────────────────────────────────────────────────────────────────┤  
│                                                                        │  
│  1\. Check Hardware Mutex: Assert activeJob \=== null\[cite: 1, 3\]        │  
│  2\. Monotonic Epoch Increment:                                         │  
│     currentEpoch \= currentEpoch \+ 1  (Epoch N \-\> N+1)\[cite: 1, 3, 6\]  │  
│  3\. Formulate Fencing Token:                                           │  
│     fencingToken \= currentEpoch\[cite: 1, 6\]                           │  
│  4\. Set Autonomous Hardware Alarm:                                     │  
│     ctx.storage.setAlarm(Date.now() \+ 30000)\[cite: 1, 3, 6\]           │  
│  5\. Commit Active Lease Snapshot to Transactional NVMe:                │  
│     await ctx.storage.put("active\_lease", {                            │  
│       taskId, epoch: currentEpoch, dispatchedAt: Date.now()            │  
│     });\[cite: 1, 3\]                                                   │  
│  6\. Wake Broker WebSocket from Hibernation\[cite: 1, 6\]                │  
│  7\. Transmit Downstream Wire Frame: EXECUTE\_JOB\[cite: 1, 3\]           │  
│                                                                        │  
└────────────────────────────────────────────────────────────────────────┘

> * **Monotonic Fencing Tokens:** To solve the distributed Split-Brain Zombie Runner Problem, the coordinator increments an integer currentEpoch every time a lease is granted (*N*→*N*\+1). This integer acts as a monotonic fencing token stamped onto the lease dispatch packet. If a partitioned worker reconnects late after a lease timeout, any completion payload bearing stale token *N* is rejected with HTTP 409 Conflict.  
> * **Heartbeat-Renewed Short Leases:** The system rejects static execution timeouts. The edge grants an exclusive execution lease valid for a strict 30-second rolling window.  
> * **Proactive Watchdog Alarms:** The DO sets a hardware alarm exactly 30 seconds into the future using this.ctx.storage.setAlarm(Date.now() \+ 30000). If Rig 2 crashes, drops power, or severs its network tunnel and misses three consecutive 10-second heartbeat pulses, this alarm fires autonomously inside the edge isolate to revoke the lease, increment the epoch, and re-queue the task.

### **3\. Downstream Wire Framing & Message Schemas**

Downstream communication travels over persistent WebSockets serialized via Cloudflare's WebSocket Hibernation API. Messages conform to strictly validated TypeScript schemas, ensuring that physical hardware spokes receive only clean, sanitized primitives.

#### **The Base Downstream Envelope**

export interface BaseDownstreamEnvelope\<T extends string, P \= unknown\> {  
  type: T;  
  version: "1.0.0";  
  correlationId: string; // UUIDv7 matching the distributed trace\_id\[cite: 1, 5\]  
  taskId: string;  
  epoch: number;         // Monotonic fencing token (Epoch N+1)\[cite: 1, 6\]  
  dispatchedAt: number;  
  payload: P;  
}

#### **1\. EXECUTE\_JOB (Authoritative Lease Dispatch)**

This packet delivers the compiled execution spec down the tunnel to Rig 2:

export interface ExecuteJobPayload {  
  sceneId: string;  
  shotId: string;  
  workflowTemplate: "wan\_greenscreen\_plate.json" | "flux\_matte\_background.json"; //\[cite: 5, 6\]  
    
  // Temporal Latent Allocation (Conformed upstream to 4n+1 Causal VAE lattice)  
  targetFrames: number;      // e.g., 77 frames for a 75-frame delivery\[cite: 2, 4\]  
  fps: 24;                   //\[cite: 1, 2\]  
    
  // Generative Conditioning  
  prompt: {  
    positive: string;        // e.g., "char\_elias, green skin, chroma key \#00FF00"\[cite: 2, 5\]  
    negative: string;        // e.g., "blurry, deformed, cropped, background elements"  
  };  
    
  // Sampling Determinism  
  sampling: {  
    seed: number;            // Fixed PRNG integer\[cite: 5, 6\]  
    steps: number;           // e.g., 30 or 50\[cite: 1, 3\]  
    cfg: number;             // e.g., 6.0\[cite: 1, 3\]  
    denoise: number;         // 1.0 for initial generation, \<0.45 for repair passes  
  };  
    
  // Adapter LoRA Requirements  
  loras: Array\<{  
    name: string;            // e.g., "char\_elias\_v2.safetensors"\[cite: 1, 5\]  
    strengthModel: number;   // e.g., 1.0  
    strengthClip: number;    // e.g., 1.0  
  }\>;  
    
  leaseTtlMs: 30000;         // 30-second rolling TTL\[cite: 1, 6\]  
}

export type ExecuteJobPacket \= BaseDownstreamEnvelope\<"EXECUTE\_JOB", ExecuteJobPayload\>;

> * **Temporal Blindness:** The downstream packet contains zero audio stems, waveform buffers, or screenplay text. The frame count is pre-calculated upstream on Rig 1 by quantizing .wav waveform durations via ffprobe into 24 fps integers:  
>   target\_frames=⌈(1000duration\_ms​)×24⌉\[cite: 1, 2, 4\]  
>   and conformed to the model's 4*n*\+1 causal VAE stride (4×⌈(*N*−1)/4⌉+1). The broker receives targetFrames as a raw scalar integer.  
> * **Zero Command Ingestion:** The packet delivers rendering parameters, not arbitrary Python scripts or unvetted custom node trees.

#### **2\. ABORT\_JOB (Downstream Interruption & Invalidation Signal)**

Dispatched when upstream conditions invalidate a job actively rendering on Rig 2:

export interface AbortJobPayload {  
  taskId: string;  
  targetEpoch: number;  
  reason:   
    | "SCENE\_DIRTY\_PROPAGATION"    // D1 detected upstream fact edit\[cite: 1, 6\]  
    | "SHOWRUNNER\_CANCELLATION"    // Manual abort via Astro Cockpit  
    | "WATCHDOG\_TIMEOUT\_PREEMPTION"; // Worker missed heartbeats\[cite: 1, 6\]  
}

export type AbortJobPacket \= BaseDownstreamEnvelope\<"ABORT\_JOB", AbortJobPayload\>;

### **4\. Tunnel Transport & Inverted Pull Delivery**

The physical transit of downstream packets relies on an inside-out network topology that keeps Rig 2 completely inaccessible to public WAN scanners:

┌────────────────────────────────────────────────────────────────────────┐  
│ CLOUDFLARE EDGE (ShotCoordinatorDO)                                    │  
│ • Encapsulates EXECUTE\_JOB JSON frame                                  │  
│ • Transmits over persistent WebSocket via Hibernation API\[cite: 1, 6\] │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │ TLS 1.3 / QUIC Outbound Tunnel  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ RIG 2: LOCAL FOUNDRY (Physical Workstation)                            │  
│                                                                        │  
│   \[ cloudflared Daemon \]                                               │  
│   • Holds persistent outbound tunnel open to Cloudflare edge\[cite: 1\] │  
│   • Bridges incoming tunnel frames to local loopback (127.0.0.1) \[1\]   │  
│                 │                                                      │  
│                 ▼ IPC (Loopback Port 3000\)                             │  
│   \[ media-broker Daemon \]                                              │  
│   • Holds unconditional OS-level flock on /var/lock/rig2\_gpu.lock \[1,3\]│  
│   • Pulls downstream lease only when local GPU is confirmed idle \[3, 6\]│  
└────────────────────────────────────────────────────────────────────────┘

> * **Zero Open Inbound Ports:** The studio router opens zero inbound firewall ports (ports 8188 and 3000 bind strictly to 127.0.0.1).  
> * **The cloudflared Conduit:** The local cloudflared daemon initiates an outbound-only connection to Cloudflare’s edge. Downstream packets flow down this pre-established pipe, traversing residential NAT and Carrier-Grade NAT (CGNAT) without static IP requirements.  
> * **Pull-Only Execution Enforcement:** The edge DO never pushes work onto active silicon uninvited. The chain of command is strictly unilateral:  
>   Remote DO⟶Logical Request Queue⟶Local media-broker⟶OS flock⟶GPU Silicon\[cite: 3, 6\]  
>   The media-broker claims downstream job packets only when its local POSIX flock on /var/lock/rig2\_gpu.lock is released and available.

### **5\. In-Memory Ingestion & Silicon Handoff on Rig 2**

Once media-broker receives the EXECUTE\_JOB packet from the tunnel, it initiates the local execution sequence:

\[ Ingest EXECUTE\_JOB Packet \]  
               │  
               ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ 1\. DEPENDENCY AUDIT & MODEL HYDRATION                                  │  
│    • Inspect local NVMe scratch disk for required LoRA weights\[cite: 5\]│  
│    • If missing, fetch from Cloudflare R2 via s5cmd\[cite: 2\]          │  
│    • Select verified API template: workflows/wan\_greenscreen\_plate.json│  
└──────────────────────────────────────┬─────────────────────────────────┘  
                                       │  
                                       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ 2\. IN-MEMORY PARAMETER INJECTION (No unmanaged Python scripts)\[cite: 5\]│  
│    • workflow\["37"\].inputs.length \= payload.targetFrames (e.g., 77\)    │  
│    • workflow\["6"\].inputs.text \= \`\${payload.prompt.positive}, \#00FF00\` │  
│    • workflow\["3"\].inputs.seed \= payload.sampling.seed\[cite: 2, 5\]    │  
│    • workflow\["12"\].inputs.lora\_name \= payload.loras\[0\].name\[cite: 5\] │  
└──────────────────────────────────────┬─────────────────────────────────┘  
                                       │  
                                       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ 3\. VRAM HYGIENE & BASELINE VERIFICATION                                │  
│    • POST http://127.0.0.1:8188/free { unload\_models, free\_memory } \[5\]│  
│    • Subprocess poll nvidia-smi: Assert Free VRAM \> 21 GB\[cite: 3\]    │  
└──────────────────────────────────────┬─────────────────────────────────┘  
                                       │  
                                       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ 4\. DISPATCH TO HEADLESS COMFYUI                                        │  
│    • POST http://127.0.0.1:8188/prompt { prompt: hydratedWorkflow }    │  
│    • Spawn thread-isolated background heartbeat loop (every 10s) \[1, 6\]│  
│    • Tap ws://127.0.0.1:8188/ws for k-sampler progress telemetry \[1, 5\]│  
└────────────────────────────────────────────────────────────────────────┘

> 1. **Local Scratch Audit:** The broker parses the LoRA array from the payload and verifies that the corresponding .safetensors files exist on the local NVMe drive. If absent, it fetches the missing weights from the studio's Cloudflare R2 bucket using s5cmd prior to graph submission.  
> 2. **Template Hydration:** The broker loads the allowlisted ComfyUI API JSON template from disk into memory. It injects targetFrames directly into the latent generator (Node 37), the positive isolation prompt into CLIPTextEncode (Node 6), the deterministic seed into KSampler (Node 3), and updates the LoRA loader paths (Node 12).  
> 3. **Turn-Based VRAM Eviction:** Before dispatch, media-broker calls POST \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) with { unload\_models: true, free\_memory: true } to flush residual LLM or audio checkpoints from prior tasks. It polls nvidia-smi via a child process to verify that available memory has returned to baseline (\>21 GB free on a 24 GB card) before submitting the graph.  
> 4. **Execution Dispatch & Heartbeat Spin-Up:** The hydrated graph is posted to POST \[http://127.0.0.1:8188/prompt\](http://127.0.0.1:8188/prompt). Simultaneously, the broker launches a thread-isolated timer emitting BROKER\_HEARTBEAT every 10 seconds back up the tunnel, holding the edge lease open while 100% of the GPU's tensor cores render the uncomposited \#00FF00 greenscreen plate.

### **6\. Downstream Invalidation & Preemption Protocol (ABORT\_JOB)**

If an author or showrunner modifies an upstream character injury, inventory item, or script beat while a render is in progress, the edge invalidation engine acts immediately:

Cloudflare D1 Ledger                    edge-director DO                Rig 2 (media-broker)  
         │                                     │                                  │  
         ├─ Fact Mutated: is\_dirty \= 1\[cite: 1\]│                                  │  
         └─ Cascade Trigger Fires ────────────►│                                  │  
                                               ├─ Identifies Active Job           │  
                                               │  under Epoch N\[cite: 1, 6\]      │  
                                               │                                  │  
                                               ├────── ABORT\_JOB (Epoch N) ──────►│  
                                               │       reason: SCENE\_DIRTY \[1, 6\] │  
                                               │                                  ├─ POST :8188/interrupt  
                                               │                                  ├─ Halts K-Sampler  
                                               │                                  ├─ POST :8188/free  
                                               │                                  ├─ Purges VRAM\[cite: 5\]  
                                               │                                  ├─ Drops local scratch  
                                               │                                  │  
                                               │◄───── BROKER\_ABORTED\_ACK ────────┤  
                                               │                                  └─ Releases local flock  
                                               ├─ Increments Epoch (N \-\> N+1) \[1\]  
                                               ├─ Unlocks Hardware Mutex\[cite: 1\]  
                                               └─ Re-queues Scene AST to Backlog

> 1. **Trigger Interception:** When a database trigger marks a downstream scene invalid (scene\_fact\_dependencies.is\_dirty \= 1), ShotCoordinatorDO locates the active execution lease.  
> 2. **Immediate Preemption Frame:** The DO transmits ABORT\_JOB carrying the active epoch: N down the WebSocket tunnel.  
> 3. **Hardware Interruption:** Upon ingestion, media-broker issues an immediate HTTP POST /interrupt to ComfyUI on 127.0.0.1:8188, halting PyTorch tensor calculations mid-step.  
> 4. **Local Hygiene & Reset:** The broker executes POST /free to evict latent video tensors from VRAM, deletes partial .mp4 artifacts from the scratch disk, releases its local flock, and emits an acknowledgment back to the edge, completely preventing wasted power and hardware time on invalidated narrative canon.

---

*User prompt: {{FOCUS : Phase 5: Silicon Execution & Memory Hygiene (Headless ComfyUI on Port 8188\) }} /extreme-details*

Response: **Phase 5: Silicon Execution & Memory Hygiene** is the low-level physical runtime stage on **Rig 2** (The GPU Tensor Foundry) where abstract execution graphs are transformed into raw character plates on dedicated graphics silicon. Operating under the governance of the local media-broker daemon on loopback port 3000, Phase 5 coordinates the headless ComfyUI process listening on 127.0.0.1:8188, enforces hardware memory hygiene across multi-modal tensor boundaries, streams real-time telemetry, and prevents fatal CUDA Out-Of-Memory (OOM) crashes on 24 GB consumer GPUs.

### **1\. The Headless Runtime Environment & Boot Configuration**

Rig 2 operates as a stateless mathematical execution engine, housing high-capacity GPU silicon (e.g., an NVIDIA RTX 3090, 4090, or 5070 with 24 GB VRAM) running CUDA 12.x and PyTorch with native tensor bindings.

python main.py \--listen 127.0.0.1 \--port 8188 \--highvram \--disable-auto-launch

┌────────────────────────────────────────────────────────────────────────┐  
│ RIG 2: PHYSICAL RUNTIME TOPOLOGY & HARDWARE QUARANTINE                 │  
├────────────────────────────────────────────────────────────────────────┤  
│ • Hardware Profile: NVIDIA RTX 4090 (24,564 MB Dedicated VRAM)         │  
│ • Local Host Service: Headless ComfyUI daemon on port 8188             │  
│ • Controller Daemon: media-broker on port 3000                         │  
│ • Process Isolation Invariant:                                         │  
│   \- ZERO Chromium / Remotion instances permitted                       │  
│   \- ZERO database drivers, SQLite connections, or narrative state      │  
│   \- ZERO audio parsing, ffprobe instances, or DOM rasterizers          │  
│ • Memory Profile: 100% of GPU VRAM dedicated to PyTorch tensor passes  │  
│ • Output Deliverable: Raw \#00FF00 uncomposited greenscreen MP4 plates  │  
└────────────────────────────────────────────────────────────────────────┘

> * **Loopback Isolation:** The ComfyUI server binds strictly to the local loopback interface (127.0.0.1) on port 8188, ensuring raw, unauthenticated Python execution routes are never exposed directly to external networks or the public WAN.  
> * **Single Persistent Process:** Rig 2 maintains exactly one persistent ComfyUI daemon process in memory. It does not launch separate instances for different tasks, nor does it hold pre-compiled workflows in memory while idle; it functions as an empty computation canvas awaiting dynamic JSON graph injection.  
> * **Strict Process Quarantine:** Headless Chromium instances (@remotion/renderer) and speech synthesis audio engines are strictly forbidden from running on Rig 2\. Running browser rasterization or audio workers alongside active diffusion models causes severe system memory thrashing, driver collisions, and operating system OOM kills that corrupt CUDA memory states. All Chromium compositing (--gl=swangle) and duration clocking are quarantined entirely to Rig 1\.

### **2\. The Anti-Ollama Paradigm & Unified Memory Control**

Running multi-modal generative pipelines—spanning text language models (9–10 GB VRAM), neural speech synthesis (4–6 GB VRAM), and high-parameter video diffusion (16–22 GB VRAM)—exceeds the 24 GB physical envelope of workstation GPUs.

THE INDEPENDENT DAEMON COLLISION (ANTI-PATTERN):  
┌────────────────────────────────────────────────────────────────────────┐  
│ 24 GB VRAM WORKSTATION SILICON                                         │  
│  • Ollama Daemon (Port 11434): Qwen 14B (\~10 GB VRAM)                  │  
│  • Headless ComfyUI (Port 8188): Wan 2.2 (\~20 GB VRAM)                 │  
│  💥 RESULT: Concurrent allocations collide \-\> Instant CUDA OOM Crash\!  │  
└────────────────────────────────────────────────────────────────────────┘

THE UNIFIED RUNTIME SOLUTION (ANTI-OLLAMA PARADIGM):  
┌────────────────────────────────────────────────────────────────────────┐  
│ 24 GB GPU WORKSTATION SILICON (Single Unified Process)                 │  
│  └── Headless ComfyUI Daemon (Port 8188 Exclusive GPU Lock)            │  
│      ├── Dynamic Cache Manager controls 100% of physical allocations   │  
│      └── media-broker forces explicit evictions via POST /free         │  
└────────────────────────────────────────────────────────────────────────┘

> * **Eliminating Multi-Daemon Collisions:** Running external runtime daemons like Ollama on port 11434 alongside ComfyUI creates fatal memory contention. Because ComfyUI's internal memory manager cannot inspect or evict tensors held by an external OS process, allocating video diffusion latents triggers an immediate torch.cuda.OutOfMemoryError.  
> * **Unified Graph Execution:** Under the Anti-Ollama paradigm, all multi-modal generative nodes execute strictly within ComfyUI's unified computational graph using extensions like ComfyUI-GGUF. This guarantees that a single runtime maintains exclusive access to the GPU, allowing ComfyUI to track, map, and purge all active tensor allocations.  
> * **The Rig 1 Offload Alternative:** To optimize production velocity further, the architecture allows the text drafting pass (Child Graph A) to be evicted from Rig 2 entirely and executed on Rig 1's multi-core CPU and system RAM via llama.cpp. This reserves Rig 2's 24 GB VRAM exclusively for neural speech synthesis and Wan 2.2 video diffusion, eliminating a massive model weight swap across PCIe lanes.

### **3\. The Sequential Turn-Based Flush Protocol**

When multi-modal tasks run on Rig 2, the media-broker partitions the pipeline into three discrete, non-overlapping child graphs separated by explicit memory teardowns:

┌────────────────────────────────────────────────────────────────────────┐  
│ RIG 2: SEQUENTIAL TURN-BASED EXECUTION CYCLE                           │  
├────────────────────────────────────────────────────────────────────────┤  
│ 1\. TURN 1: CHILD GRAPH A (Script & Dialogue AST)                       │  
│    • ComfyUI hydrates Qwen 2.5 14B GGUF (\~9–10 GB VRAM)                │  
│    • Evaluates mechanical state \-\> emits dialogue\_ast.json             │  
│                                                                        │  
│ 2\. THE FIRST HARD FLUSH (POST /free)                                   │  
│    • Unloads Qwen weights; clears PyTorch cache; VRAM drops to baseline│  
│                                                                        │  
│ 3\. TURN 2: CHILD GRAPH B (Acoustic Timing & Synthesis)                 │  
│    • ComfyUI hydrates local TTS node (\~4–6 GB VRAM)                    │  
│    • Synthesizes .wav stems; derives target\_frames \= ceil(ms/1000\*24)  │  
│                                                                        │  
│ 4\. THE SECOND HARD FLUSH (POST /free)                                  │  
│    • Unloads TTS weights; purges audio latent buffers                  │  
│                                                                        │  
│ 5\. TURN 3: CHILD GRAPH C (Temporal Video Diffusion)                    │  
│    • 100% of 24 GB VRAM allocated to Wan 2.2 \+ Character LoRAs         │  
│    • Samples \#00FF00 green-screen plate at full precision              │  
└────────────────────────────────────────────────────────────────────────┘

#### **Turn 1: Child Graph A (Text & AST Synthesis)**

> * ComfyUI loads the quantized Qwen 2.5 14B GGUF weights from ComfyUI/models/LLM/ into VRAM, occupying ∼9 GB to 10 GB.  
> * Guided by GBNF grammar masks, it compiles dialogue and action beats into the validated dialogue\_ast.json contract and halts execution.

#### **The First Hard Flush**

> * The broker calls ComfyUI's memory management route:

await fetch("http://127.0.0.1:8188/free", {   
  method: "POST",   
  headers: { "Content-Type": "application/json" },  
  body: JSON.stringify({ unload\_models: true, free\_memory: true })   
});

> * This instructs ComfyUI to unbind active model pointers and signal PyTorch to release cached memory blocks, dropping active VRAM back to baseline in approximately **300 milliseconds**.

#### **Turn 2: Child Graph B (Acoustic Synthesis & Frame Locking)**

> * ComfyUI hydrates the neural speech synthesis model into clean memory, consuming ∼4 GB to 6 GB of VRAM.  
> * It synthesizes uncompressed 48 kHz .wav dialogue stems and quantizes durations into integer frame budgets at 24 fps:  
>   target\_frames=⌈(1000duration\_ms​)×24⌉  
> * The audio stems are written to disk, and Child Graph B yields execution.

#### **The Second Hard Flush & Video Sampling (Turn 3\)**

> * A second POST /free flush purges speech model weights and audio latent buffers.  
> * Child Graph C allocates 100% of the physical 24 GB VRAM to the Wan 2.2 diffusion checkpoint and character LoRAs.  
> * The model samples the uncompressed character plate against a solid \#00FF00 chroma key background conformed to the model's (4*n*\+1) causal VAE temporal lattice.

### **4\. Asynchronous /free Semantics & Verifiable Memory Polling**

A primary failure mode in basic orchestration harnesses is assuming that an HTTP POST /free call is a synchronous operation.

┌────────────────────────────────────────────────────────────────────────┐  
│ VERIFIABLE MEMORY POLLING SEQUENCE                                     │  
├────────────────────────────────────────────────────────────────────────┤  
│ broker calls POST /free ──► ComfyUI queues async model unload          │  
│                                      │                                 │  
│ ┌────────────────────────────────────┴───────────────────────────────┐ │  
│ │ WHILE (Elapsed \< 15s Timeout):                                     │ │  
│ │   1\. Poll GET /system\_stats (or inspect nvidia-smi via child\_proc) │ │  
│ │   2\. Read Free\_VRAM                                                │ │  
│ │   3\. IF Free\_VRAM \>= (Measured\_Baseline\_VRAM \- Tolerance):         │ │  
│ │        BREAK \-\> Emit VRAM\_VERIFIED (Proceed to next stage)         │ │  
│ │   4\. ELSE: Sleep(250ms)                                            │ │  
│ └────────────────────────────────────┬───────────────────────────────┘ │  
│                                      │                                 │  
│ ├── PASS: Dispatch Next Modality     └── TIMEOUT EXCEEDED (15s):       │  
│                                          • Detect Memory Leak          │  
│                                          • Trigger Daemon Restart      │  
└────────────────────────────────────────────────────────────────────────┘

> * **The Race Condition Hazard:** In ComfyUI, /free returns an HTTP 200 OK almost immediately while delegating model unloading and tensor unmapping to an asynchronous background worker thread. If the broker immediately dispatches the next heavy diffusion graph, PyTorch attempts to allocate video latents while previous checkpoints are still clearing across PCIe lanes, causing an instant CUDA crash.  
> * **The Polling Gate:** The media-broker enforces a strict polling lock. After dispatching POST /free, it enters a poll loop querying ComfyUI's GET /system\_stats or invoking nvidia-smi directly via an isolated child process.  
> * **Relative Baseline Verification:** Hardcoding a static threshold (such as free\_vram \> 21 GB) creates fragile deployments: if an OS window manager or desktop display compositor consumes 1.5 GB of VRAM, available memory may peak at 20.8 GB, causing a static check to hang indefinitely. The broker measures the machine's initial **idle baseline VRAM** upon boot and validates that memory recovers to within an acceptable tolerance (Δ≤500 MB) of that baseline before releasing the gate.  
> * **Watchdog Circuit Breaker:** The polling loop enforces a hard timeout of 10 to 15 seconds. If VRAM fails to return to baseline within this window—indicating a hung CUDA stream or a leaked C++ tensor reference—the broker trips a circuit breaker and triggers an automated daemon restart rather than stalling production.

### **5\. Memory Defragmentation & Automated Process Recycling**

Even with clean /free flushes, long-running production sessions face degradation from PyTorch heap fragmentation.

> * **The Fragmentation Bottleneck:** PyTorch’s caching allocator retains virtual address pools to prevent high-latency Linux kernel context calls during iteration. When cycling across disparate modalities—from 1D audio sample arrays to variable-length text embedding matrices, to 5D video latent tensors—the memory arena becomes fragmented with non-contiguous free blocks.  
> * **The Contiguous Memory Deficit:** When Wan 2.2 attempts to allocate its multi-gigabyte spatial-temporal attention matrices, it requires an unbroken contiguous memory address span. If fragmentation prevents finding a contiguous block, PyTorch throws an unexpected CUDA OOM error despite nvidia-smi reporting sufficient cumulative free memory.  
> * **Stage-Level Batching:** To minimize swapping overhead, the broker avoids per-shot execution. It batches work by stage: loading the speech model once to synthesize audio for the entire sequence, performing a single verified /free flush, and loading Wan 2.2 once to execute all video diffusion passes back-to-back.  
> * **The 25-Shot Process Recycling Reset:** To eliminate cumulative allocator fragmentation, media-broker tracks consecutive shot completions and automatically triggers a graceful restart of the headless ComfyUI child process every **25 shots** or at the boundary of major production stages. Terminating the host Python process forces the operating system kernel and NVIDIA display driver to reclaim all driver contexts, restoring an unfragmented 24 GB address space.

### **6\. REST Dispatch, Telemetry Tapping, & The Heartbeat Loop**

The interaction between the local media-broker controller and the headless ComfyUI daemon occurs over loopback REST and WebSocket interfaces:

Rig 2: media-broker (:3000)                Headless ComfyUI (:8188)        edge-director DO  
             │                                        │                           │  
             ├─ Connects ws://127.0.0.1:8188/ws ─────►│                           │  
             │  (Taps socket BEFORE dispatch)         │                           │  
             │                                        │                           │  
             ├─ POST /prompt { hydrated\_graph } ─────►│                           │  
             │                                        ├─ Begins Sampling Pass     │  
             │                                        │                           │  
             │◄── execution\_start ────────────────────┤                           │  
             │◄── executing (node: "37") ─────────────┤                           │  
             │◄── progress (value: 25, max: 50\) ──────┤                           │  
             │                                        │                           │  
             ├─ Normalizes to BROKER\_PROGRESS ───────────────────────────────────►│ (Broadcasts to UI)  
             │                                        │                           │  
             │  \[ Thread-Isolated Background Loop \]   │                           │  
             ├─ Emits BROKER\_HEARTBEAT (every 10s) ──────────────────────────────►│ (Resets 30s alarm)  
             │                                        │                           │  
             │◄── executing (node: null) \[SENTINEL\] ──┤                           │  
             │                                        ├─ MP4 written to disk      │  
             │                                        │                           │  
             ├─ Intercepts Completion Sentinel        │                           │  
             ├─ Audits local MP4 scratch file         │                           │  
             └─ Streams artifact to Cloudflare R2     │                           │

#### **REST Execution Dispatch**

> * The broker compiles the incoming SpokeExecutionPayload into ComfyUI's native API DAG format (workflow\_api.json).  
> * It dispatches the graph via an HTTP POST to \[http://127.0.0.1:8188/prompt\](http://127.0.0.1:8188/prompt), transmitting the JSON dictionary in the request body. ComfyUI ingests the payload, builds the execution schedule, and begins tensor evaluation.

#### **WebSocket Telemetry Normalization**

Before dispatching POST /prompt, the broker connects to ComfyUI's loopback WebSocket interface at ws://127.0.0.1:8188/ws?clientId=\${clientId} to ensure no early lifecycle events are missed:

| ComfyUI Native Event | Payload Structure | Translated Pipeline Telemetry |
| :---- | :---- | :---- |
| execution\_start | { prompt\_id: UUID } | TASK\_INITIALIZED |
| executing (node \!== null) | { node: "37", prompt\_id: UUID } | BROKER\_STAGE\_CHANGE (Stage: DIFFUSION\_SAMPLING) |
| progress | { value: 25, max: 50, prompt\_id: UUID } | BROKER\_PROGRESS (Percentage: 50%) |
| executing (node \=== null) | { node: null, prompt\_id: UUID } | TASK\_EXECUTION\_COMPLETE (Triggers local scratch audit & R2 sync) |
| execution\_error | { exception\_type: "CUDA OOM", ... } | BROKER\_FAILURE (Trips edge circuit breaker) |

#### **The Thread-Isolated Heartbeat Loop**

> * While ComfyUI runs sampling iterations in physical VRAM, media-broker executes an independent background timer that emits BROKER\_HEARTBEAT packets every 10 seconds up the Cloudflare Tunnel to the ShotCoordinatorDO.  
> * Decoupling the heartbeat timer from primary thread I/O ensures that long diffusion runs (60–120 seconds) continually renew the edge coordinator's 30-second watchdog lease (ctx.storage.setAlarm(+30s)), preventing false preemption while hardware is actively computing.

#### **The Completion Sentinel**

> * When diffusion finishes, ComfyUI emits its terminal completion sentinel: an executing event containing { "node": null }.  
> * The media-broker intercepts this event, validates the rendered .mp4 file on the local scratch disk (asserting non-zero byte size and rejecting the empty-file hash constant e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855), and streams the artifact directly to Cloudflare R2.

---

*User prompt: {{FOCUS : 1\. The Headless Runtime Environment & Boot Configuration }} /extreme-details*

Response: The headless runtime environment and boot configuration of **Rig 2** establishes the physical and software boundaries required to operate dedicated high-VRAM GPU silicon as a deterministic, headless tensor execution foundry. Rather than operating as an interactive workstation with desktop display dependencies, Rig 2 is architected as an isolated mathematical execution spoke whose exclusive responsibility is hosting a single headless ComfyUI daemon on loopback port 8188 governed by the media-broker controller on port 3000\.

### **1\. Physical Hardware Profile & Memory Allocation Boundaries**

The physical host for the execution spoke is strictly provisioned to satisfy the memory demands of large-scale generative models without oversubscribing physical VRAM.

> * **Hardware Sizing:** Rig 2 is provisioned with high-capacity NVIDIA GPU silicon featuring 16 GB to 24 GB of dedicated physical VRAM, specifically targeting consumer and workstation GPUs such as the NVIDIA RTX 3090, RTX 4090, or RTX 5070\.  
> * **Dedicated VRAM Profile:** Exactly 100% of the graphics card's physical VRAM is allocated to PyTorch and TensorRT tensor execution passes.  
> * **Unfragmented Operating Footprint:** The environment targets an unfragmented memory footprint between 20 GB and 24 GB during primary diffusion inference passes, leaving minimal headroom for non-computational overhead.  
> * **System Demarcation vs. Rig 1:** While Rig 1 operates entirely within multi-core CPU threads and system RAM (32 GB to 64 GB) with 0 MB of dedicated VRAM, Rig 2 maintains no general CPU application responsibilities and reserves its entire silicon envelope for matrix multiplication and K-sampling.

| Architectural Vector | Rig 1 (Host Orchestrator & Optical Assembly) | Rig 2 (GPU Render Foundry & Spoke) |
| :---- | :---- | :---- |
| **Physical Hardware** | Multi-core CPU (x86\_64 / ARM), 32 GB–64 GB System RAM | NVIDIA GPU (≥16 GB to 24 GB VRAM, RTX 3090/4090/5070) |
| **Dedicated VRAM** | **0 GB VRAM (Zero dedicated GPU compute)** | **100% allocated to PyTorch / TensorRT inference** |
| **Operational Domain** | Physical time, audio clock, and optical media assembly | Headless tensor diffusion and K-sampling |
| **Narrative State** | Sole owner of SQLite ledger, Zod schemas, and bible-state.json | Zero narrative state; blind to canon, characters, and duel rules |
| **Temporal Clocking** | Spawns ffprobe to lock discrete integer frames at 24 fps | Blind to duration rules; renders the exact integer injected into JSON |
| **Subprocess Execution** | Spawns POSIX child processes (ffprobe, git, npm, remotion) | Runs headless Python/ComfyUI daemon listening on local network/socket |

### **2\. Boot Configuration & Runtime CLI Invariants**

The headless ComfyUI process on Rig 2 is initialized with explicit CLI flags that eliminate desktop dependencies and isolate the server to local inter-process communication (IPC):

python main.py \--listen 127.0.0.1 \--port 8188 \--highvram \--disable-auto-launch

> * **Loopback Network Isolation (--listen 127.0.0.1):** The daemon binds strictly to the local IPv4 loopback address (127.0.0.1), preventing ComfyUI's unauthenticated HTTP routes from binding to external network interfaces.  
> * **Port Pinning (--port 8188):** Fixes the internal communication bus to port 8188, allowing the media-broker controller (listening on port 3000\) and Rig 1 dispatchers to target a deterministic internal socket.  
> * **High-VRAM Allocation Mode (--highvram):** Directs ComfyUI's internal memory manager to prioritize keeping tensor weights inside physical GPU memory rather than aggressively offloading sub-blocks to host system RAM during sequential sampling steps.  
> * **Browser Suppression (--disable-auto-launch):** Forbids the Python process from spawning default web browser GUI instances upon boot, ensuring it initializes as an unattended, headless Linux daemon.  
> * **Stateless Memory Profile:** The boot sequence loads zero static workflows into volatile memory; the engine boots into an empty state, waiting for the media-broker to inject hydrated JSON DAG templates over HTTP POST.

### **3\. The Single Unified Process Model (Anti-Ollama Paradigm)**

The boot architecture enforces a single unified process model to eliminate the multi-daemon memory collisions that destabilize consumer GPU silicon.

> * **The Multi-Daemon Collision Hazard:** Running independent background inference daemons (such as an external Ollama or vLLM server on port 11434\) alongside ComfyUI creates unmanaged GPU contention. Because ComfyUI's dynamic cache manager cannot inspect, coordinate, or evict memory held by a separate operating system process, running video diffusion alongside an external LLM triggers immediate CUDA Out-Of-Memory (OOM) crashes.  
> * **The Unified ComfyUI Harness:** Under the Anti-Ollama paradigm, all multi-modal operations executed on Rig 2 run strictly within the unified ComfyUI process. If language model passes or vocal synthesis checkpoints run on Rig 2, they must execute as native ComfyUI nodes (e.g., via GGUF quantization nodes like Q4\_K\_M), ensuring the process retains complete authority to allocate, track, and purge every byte of physical VRAM.  
> * **Hardware Lock Sovereignty (flock):** The local media-broker daemon holds an unconditional, OS-level advisory file lock (flock) directly on the GPU hardware interface. The remote Cloudflare edge (ShotCoordinatorDO) holds zero authority to command the GPU directly; Rig 2 queries and pulls work only when its local lock is free and available.

### **4\. Process Isolation & The Physical Quarantine Boundary**

Rig 2 enforces strict execution quarantine rules to safeguard GPU stability and memory predictability:

┌────────────────────────────────────────────────────────────────────────┐  
│ RIG 2: HEADLESS PROCESS ISOLATION & QUARANTINE BOUNDARY                │  
├────────────────────────────────────────────────────────────────────────┤  
│ PERMITTED HOST WORKLOADS:                                              │  
│ • media-broker daemon (Node.js I/O bridge on port 3000\)                │  
│ • Headless ComfyUI daemon (Python/PyTorch on port 8188\)                │  
│ • Local NVMe scratch caching & s5cmd / R2 object streaming             │  
│ • Wan 2.2 diffusion inference passes & character LoRA sampling         │  
├────────────────────────────────────────────────────────────────────────┤  
│ STRICTLY BANNED WORKLOADS:                                             │  
│ ❌ ZERO Headless Chromium instances (@remotion/renderer CLI)           │  
│ ❌ ZERO Remotion optical compositing or SwiftShader processes          │  
│ ❌ ZERO Relational database drivers, SQLite ledgers, or canon state   │  
│ ❌ ZERO ffprobe audio measurement or continuous waveform clocking      │  
│ ❌ ZERO Speech synthesis / TTS daemons (in decoupled production split) │  
└────────────────────────────────────────────────────────────────────────┘

> * **Strict Prohibition of Remotion & Chromium:** Headless Chromium rendering—even when forced to software OpenGL (--gl=swangle)—is completely banned from Rig 2\. Spawning Chromium instances alongside PyTorch diffusion models triggers system memory thrashing, OpenGL driver context losses, and kernel OOM process termination. All DOM rasterization and Remotion compositing are quarantined strictly to Rig 1\.  
> * **Prohibition of Audio & Temporal Processing:** In the final workstation split architecture, Rig 2 is relieved of speech synthesis (audio-microservice) and ffprobe temporal quantization. Running audio tasks alongside Wan 2.2 creates process contention and disrupts sequential VRAM flushes; therefore, audio stems are synthesized on Rig 1 and delivered to Rig 2 strictly as pre-calculated integer frame budgets.  
> * **Total Narrative Isolation:** Rig 2 maintains zero database drivers, holds no SQLite connections, and enforces no narrative rules. It acts as a pure, stateless mathematical engine that receives numeric frame allocations and prompt strings, returning raw uncomposited \#00FF00 greenscreen plates to Cloudflare R2.

### **5\. Layer Caching, Container CI/CD, & Scratch Disk Invariants**

The software stack supporting the headless runtime is built and deployed via an automated, zero-local-footprint container pipeline.

> * **Zero-Local-Footprint Container CI/CD:** Remote GitHub Actions Linux runners build the execution container image and push immutable image digests to GitHub Packages (ghcr.io).  
> * **Layer Caching Hierarchy:** The runtime image enforces an optimized build layer hierarchy:  
>   CUDA Base⟶PyTorch Core⟶ComfyUI Daemon⟶Custom Nodes  
> * **The Zero-Storage Rule for Model Weights:** Base model checkpoints and LoRA weights are strictly excluded from Docker build layers to keep containers lightweight and portable.  
> * **Local NVMe Model Scratchpad:** Checkpoint weights (such as Wan 2.2 diffusion checkpoints) and character LoRA .safetensors reside on a dedicated high-speed local NVMe scratch disk. The media-broker audits these files on local disk prior to dispatching prompts to ComfyUI, using s5cmd or AWS S3 SDK bindings to pull missing assets from Cloudflare R2 when necessary.

### **6\. Local Network Topology & Ingress Demarcation**

Network access to the headless runtime is governed by an inside-out network topology that exposes zero external ingress points:

┌────────────────────────────────────────────────────────────────────────┐  
│ RIG 2: LOCAL NETWORK DEMARCATION                                       │  
├────────────────────────────────────────────────────────────────────────┤  
│                                                                        │  
│   \[ Cloudflare Edge / edge-director \]                                  │  
│                 │                                                      │  
│                 ▲ Persistent Outbound Tunnel                           │  
│                 │ (cloudflared / Tailscale / LAN IP)                   │  
│   ┌─────────────┴────────────────────────────────────────────────┐     │  
│   │ RIG 2 PERIMETER (Zero Inbound WAN Router Ports Open)         │     │  
│   │                                                              │     │  
│   │ • Port 3000: media-broker Controller Daemon (Loopback IPC)   │     │  
│   │              \- Manages local OS flock mutex                  │     │  
│   │              \- Executes verifiable POST /free VRAM flushes   │     │  
│   │              \- Polls local nvidia-smi telemetry              │     │  
│   │                                                              │     │  
│   │ • Port 8188: Headless ComfyUI Process (127.0.0.1 only)       │     │  
│   │              \- Listens for hydrated workflow\_api.json graphs │     │  
│   │              \- Tapped via ws://127.0.0.1:8188/ws             │     │  
│   └──────────────────────────────────────────────────────────────┘     │  
│                                                                        │  
└────────────────────────────────────────────────────────────────────────┘

> * **Zero Open Inbound WAN Ports:** The host machine does not expose port 8188 or port 3000 to the public internet, completely neutralizing remote code execution (RCE) vectors and unauthenticated graph injections.  
> * **Outbound-Only Tunneling:** Communication between the Cloudflare Edge coordinator (edge-director) and Rig 2 is bridged via an outbound-only encrypted tunnel (such as cloudflared or Tailscale) initiated from inside Rig 2\.  
> * **Loopback Inter-Process Communication:** The media-broker communicates with ComfyUI entirely over 127.0.0.1:8188. It captures real-time step telemetry by tapping ws://127.0.0.1:8188/ws, issues prompt executions via POST /prompt, and enforces memory hygiene via POST /free, ensuring the external edge coordinator interacts only with high-level lease contracts rather than low-level Python runtime internals.

---

*User prompt: {{FOCUS : 2\. The Anti-Ollama Paradigm & Unified Memory Control }} /extreme-details*

### **Response: 1\. The Multi-Daemon Hardware Hazard: Why Ollama Fails on Shared Silicon**

Operating multi-modal generative pipelines on consumer GPU silicon (such as an NVIDIA RTX 3090, 4090, or 5070 with 24 GB VRAM) introduces a hard physical ceiling where concurrent spatial allocations cause fatal crashes. The primary cause of catastrophic VRAM failure on rendering workstations is uncoordinated multi-daemon hardware access.

THE ANTI-PATTERN: MULTI-DAEMON HARDWARE COLLISION  
┌────────────────────────────────────────────────────────────────────────┐  
│ 24 GB GPU WORKSTATION SILICON                                          │  
│  ├── Ollama Daemon (Port 11434): Qwen 14B (\~10 GB Unmanaged VRAM)      │  
│  └── ComfyUI Daemon (Port 8188): Wan 2.2 (\~20 GB Diffusion Workspace)  │  
│  💥 RESULT: ComfyUI cannot evict Ollama's memory space \-\> CUDA OOM\!    │  
└────────────────────────────────────────────────────────────────────────┘

THE NATIVE SOLUTION: THE ANTI-OLLAMA PARADIGM  
┌────────────────────────────────────────────────────────────────────────┐  
│ 24 GB GPU WORKSTATION SILICON (Single Unified Process)                 │  
│  └── Headless ComfyUI Daemon (Port 8188 Exclusive GPU Lock)           │  
│      ├── Dynamic Cache Manager controls 100% of physical allocations   │  
│      └── Node.js Conductor forces explicit evictions via POST /free    │  
└────────────────────────────────────────────────────────────────────────┘

Running an external Large Language Model daemon like Ollama alongside a media diffusion engine introduces three operational conflicts:

> * **Orphaned Memory Retention:** Ollama runs as an independent operating system process that caches model weights in VRAM for five minutes by default (keep\_alive: 5m). If a video diffusion job initializes while Ollama is retaining 10 GB of VRAM for an LLM, ComfyUI immediately crashes with a CUDA allocation error.  
> * **Lack of Coordinated Eviction:** ComfyUI has zero programmatic control over Ollama’s internal memory manager. Because the two engines run in separate OS processes, ComfyUI’s internal dynamic cache manager has no visibility into, and no authority over, external allocations, preventing it from requesting memory evictions when a video diffusion pass begins.  
> * **Port and Infrastructure Sprawl:** Supporting Ollama requires maintaining separate background daemons, monitoring port 11434, configuring proxy network routes, and handling independent process crash-recovery loops alongside ComfyUI.  
> * **Memory Boundary Collisions:** When ComfyUI attempts to allocate its 16 GB to 22 GB latent workspace for video diffusion while Ollama holds unmanaged memory, PyTorch encounters an unmanageable boundary, triggering an instant torch.cuda.OutOfMemoryError.

### **2\. Single-Process Sovereignty & Native GGUF Execution**

The Anti-Ollama Paradigm eliminates external inference runtimes (such as Ollama or standalone vLLM servers) from GPU execution entirely. All generative model operations on Rig 2 are unified directly within ComfyUI’s native Directed Acyclic Graph (DAG) runtime.

> * **Single-Process Sovereignty:** ComfyUI serves as the sole software process holding an open CUDA context and hardware file descriptor on the GPU silicon.  
> * **Total Allocation Awareness:** Because every tensor belongs to ComfyUI's memory pool, the dynamic cache manager can track, unmap, and garbage-collect weights dynamically without leaving orphaned background allocations.  
> * **Direct GGUF Model Placement:** Language models are stored and executed as quantized GGUF weights (e.g., qwen2.5-14b-instruct-q5\_k\_m.gguf) placed directly in ComfyUI/models/LLM/.  
> * **Native Loader Nodes:** Model loaders (such as ComfyUI-GGUF or ComfyUI-Llama-cpp) load weights natively into ComfyUI's memory pool during text drafting and release them when downstream execution turns require different resources.  
> * **Grammar-Enforced Structural Output:** The native text nodes enforce GBNF grammars or strict JSON mode directly at the inference layer. This mathematically restricts output tokens to schema-compliant syntax, preventing unescaped quotes or malformed braces from crashing downstream Abstract Syntax Tree (AST) parsers.

### **3\. The Sequential Turn-Based Memory Lifecycle (POST /free)**

By unifying execution under ComfyUI, the media-broker coordinates memory through a serialized, turn-based lifecycle that separates text, audio, and video workloads.

┌────────────────────────────────────────────────────────────────────────┐  
│ RIG 2 SEQUENTIAL VRAM LIFECYCLE (Managed by media-broker \+ ComfyUI)    │  
├────────────────────────────────────────────────────────────────────────┤  
│ Step 1: Execute Child Graph A (Text & Dialogue AST)                    │  
│   • ComfyUI loads Qwen 2.5 14B GGUF (\~9-10 GB) into VRAM               │  
│   • Outputs dialogue\_ast.json                                          │  
│                                                                        │  
│ Step 2: media-broker calls POST /free                                  │  
│   • Cleans out LLM weights and frees memory buffers in \~300ms          │  
│                                                                        │  
│ Step 3: Execute Child Graph B (TTS Audio & Duration Math)              │  
│   • ComfyUI loads local TTS node (e.g., CosyVoice / Parler-TTS)        │  
│   • Evaluates frame counts via internal math node: ceil(ms / 1000 \* 24)│  
│   • Outputs .wav files \+ timing manifest                               │  
│                                                                        │  
│ Step 4: media-broker calls POST /free                                  │  
│   • Drops audio weights from VRAM                                      │  
│                                                                        │  
│ Step 5: Execute Child Graph C (Wan 2.2 Video Diffusion)                │  
│   • Full 24 GB of VRAM is claimed by Wan 2.2 \+ Character LoRAs         │  
│   • Generates raw greenscreen (\#00FF00) plate without CUDA OOM         │  
└────────────────────────────────────────────────────────────────────────┘

> * **Step 1 (Text AST Generation):** ComfyUI loads the Qwen 2.5 14B GGUF model into VRAM (∼9 to 10 GB), compiles the scene plan into dialogue\_ast.json, and halts execution.  
> * **Step 2 (The Text Memory Eviction):** The media-broker calls ComfyUI's native eviction endpoint via an HTTP POST request:  
>   await fetch("http://127.0.0.1:8188/free", {  
>     method: "POST",  
>     headers: { "Content-Type": "application/json" },  
>     body: JSON.stringify({ unload\_models: true, free\_memory: true })  
>   });

This call unloads model weights and flushes PyTorch memory buffers in approximately 300 milliseconds.

> * **Step 3 (Acoustic Synthesis & Quantization):** ComfyUI loads the local neural TTS node (e.g., CosyVoice or Parler-TTS) into clean VRAM (∼4 to 6 GB), synthesizes the .wav dialogue stems, and quantizes the duration to discrete frames using the ceiling formula ⌈(duration\_ms/1000)×24⌉.  
> * **Step 4 (The Acoustic Eviction):** A second POST /free invocation drops audio models and vocoder checkpoints from VRAM.  
> * **Step 5 (Heavy Video Diffusion):** The full physical capacity of the graphics card is allocated to the Wan 2.2 diffusion model and character LoRAs, claiming a 16 GB to 22 GB workspace to generate the \#00FF00 chroma-key plate without memory collisions.

### **4\. Hardware Demarcation & Complete Workstation Isolation**

To optimize GPU uptime and eliminate multi-modal swapping overhead, the pipeline supports offloading non-diffusion workloads entirely to Rig 1\.

> * **Rig 1 Workstation Quarantine:** Rig 1 operates with 0 MB of dedicated GPU VRAM, running multi-threaded CPU tasks, system RAM, and headless Chromium processes (@remotion/renderer using \--gl=swangle).  
> * **Decoupled Acoustic Processing:** Isolating speech synthesis (:8000), duration probing (ffprobe), and Remotion optical compositing to Rig 1 ensures that heavy video diffusion models on Rig 2 maintain uninterrupted access to their full 24 GB VRAM envelope.  
> * **Zero-Leak Infrastructure:** By eliminating external daemons like Ollama and enforcing explicit POST /free evictions across ComfyUI's unified graph, consumer workstation hardware executes complex multi-modal pipelines without memory leaks, background ghost retentions, or unmanaged driver contention.

---

*User prompt: {{FOCUS : 3\. The Sequential Turn-Based Flush Protocol }} /extreme-details*

Response: The **Sequential Turn-Based Flush Protocol** is the physical VRAM lifecycle management system enforced by the orchestrator (worker-sower-conductor or media-broker) on local rendering hardware to prevent multi-modal tensor collisions. When operating on a single consumer GPU workstation (such as an NVIDIA RTX 3090, 4090, or 5070 equipped with 24 GB of VRAM), concurrent model hosting is physically impossible: hosting large language models, neural acoustic synthesis checkpoints, and spatio-temporal video diffusion models simultaneously exceeds the physical hardware boundary and triggers immediate CUDA Out-Of-Memory (OOM) crashes.

The protocol partitions execution into three sequential, non-overlapping child graphs separated by explicit hardware flushes.

┌────────────────────────────────────────────────────────────────────────┐  
│ RIG 2: SEQUENTIAL TURN-BASED EXECUTION CYCLE                           │  
├────────────────────────────────────────────────────────────────────────┤  
│ 1\. TURN 1: CHILD GRAPH A (Script & Dialogue AST)                       │  
│    • ComfyUI hydrates Qwen 2.5 14B GGUF (\~9–10 GB VRAM)                │  
│    • Evaluates mechanical state \-\> emits dialogue\_ast.json             │  
│                                                                        │  
│ 2\. THE FIRST HARD FLUSH (POST /free)                                   │  
│    • Unloads Qwen weights; clears PyTorch cache; VRAM drops to baseline│  
│                                                                        │  
│ 3\. TURN 2: CHILD GRAPH B (Acoustic Timing & Synthesis)                 │  
│    • ComfyUI hydrates local TTS node (\~4–6 GB VRAM)                    │  
│    • Synthesizes .wav stems; derives target\_frames \= ceil(ms/1000\*24)  │  
│                                                                        │  
│ 4\. THE SECOND HARD FLUSH (POST /free)                                  │  
│    • Unloads TTS weights; purges audio latent buffers                  │  
│                                                                        │  
│ 5\. TURN 3: CHILD GRAPH C (Temporal Video Diffusion)                    │  
│    • 100% of 24 GB VRAM allocated to Wan 2.2 \+ Character LoRAs         │  
│    • Samples \#00FF00 green-screen plate at full precision              │  
└────────────────────────────────────────────────────────────────────────┘

### **1\. The Spatial Ceiling & Hardware Contention Math**

The physical requirement for sequential turn-based flushes stems from the cumulative footprint of the multi-modal models required to generate a character performance:

> * **Text & Dialogue AST Compilation (Qwen 2.5 14B GGUF):** Consumes approximately **9 GB to 10 GB** of VRAM.  
> * **Neural Speech Synthesis (TTS Vocoders / Acoustic Models):** Consumes approximately **4 GB to 6 GB** of VRAM.  
> * **Temporal Video Diffusion (Wan 2.2 \+ Character LoRAs):** Requires **16 GB to 22 GB** of VRAM (allocating up to 100% of the 24 GB memory pool for 3D latent tensors, attention matrices, and transformer backbones).  
> * **The Fatal Concurrent Total:** Attempting to maintain all three runtimes simultaneously demands **29 GB to 38 GB** of physical VRAM.  
> * **The Hardware Enforcement:** Because consumer GPUs lack hardware memory virtualization to partition tensors dynamically across uncoordinated processes, the orchestrator treats GPU VRAM as a single, turn-based resource that must be evacuated before a subsequent modality can initialize.

### **2\. The Three-Phase Child Graph Execution Lifecycle**

Execution proceeds through three discrete, non-overlapping phases:

#### **Turn 1: Child Graph A (Text & AST Synthesis)**

> * **Model Loading:** ComfyUI hydrates the quantized Qwen 2.5 14B GGUF weights into VRAM, occupying ∼9 GB to 10 GB.  
> * **Grammar-Enforced Generation:** Constrained by GBNF grammar logit masking, the model processes the upstream tabletop state and narrative directives.  
> * **Artifact Output:** It compiles and emits the validated dialogue\_ast.json manifest to the local scratch disk.  
> * **Immediate Halt:** Child Graph A immediately halts execution and releases execution control back to the orchestrator.

#### **The First Hard Flush Boundary**

> * **The REST Flush Call:** Before speech processing can begin, the orchestrating daemon executes an HTTP POST request to ComfyUI's memory release endpoint:  
>   // Clear text model weights and unbind CUDA memory pointers  
>   await fetch('http://127.0.0.1:8188/free', {   
>     method: 'POST',   
>     headers: { 'Content-Type': 'application/json' },  
>     body: JSON.stringify({   
>       unload\_models: true,   
>       free\_memory: true   
>     })   
>   });

> * **Pointer Unbinding:** This request instructs ComfyUI to unbind active model pointers and signal PyTorch's caching allocator to release its reserved CUDA memory blocks.  
> * **Eviction Speed:** Active VRAM drops back to the idle system baseline in approximately **300 milliseconds**.

#### **Turn 2: Child Graph B (Acoustic Timing & Frame Locking)**

> * **Model Loading:** ComfyUI hydrates the local neural TTS node (e.g., CosyVoice, XTTSv2, or Parler-TTS) into clean memory, consuming ∼4 GB to 6 GB of VRAM.  
> * **Acoustic Synthesis:** The node iterates through the dialogue lines from dialogue\_ast.json and synthesizes uncompressed 48 kHz .wav audio stems.  
> * **Integer Frame Derivation:** The node evaluates acoustic durations and derives the non-negotiable delivery frame budget at 24 fps using ceiling quantization:  
>   target\_frames=⌈(1000duration\_ms​)×24⌉  
> * **Graph Halting:** Once the audio stems and timing manifests are written to disk, Child Graph B halts.

#### **The Second Hard Flush Boundary**

> * **Second Eviction Call:** The orchestrator executes a second POST /free call with { unload\_models: true, free\_memory: true }.  
> * **Audio Buffer Purge:** TTS model weights, acoustic conditioning matrices, and audio latent buffers are purged from VRAM in ∼300 milliseconds.  
> * **Memory Reversion:** VRAM recovers to the clean baseline state, unlocking the full 24 GB envelope for video diffusion.

#### **Turn 3: Child Graph C (Temporal Video Diffusion)**

> * **Maximum Silicon Allocation:** Exactly 100% of the 24 GB VRAM is allocated to the Wan 2.2 diffusion checkpoint and character LoRAs.  
> * **Latent Allocation:** The engine ingests the locked target\_frames integer from Child Graph B and allocates the 3D latent tensor array.  
> * **Chroma-Key Rendering:** Wan 2.2 samples the uncompressed character plate against a solid \#00FF00 greenscreen backdrop at full precision without encountering memory contention.

### **3\. The Asynchronous /free Hazard & Baseline Polling Gates**

A primary failure mode in naive orchestration is assuming that an HTTP POST /free call acts as a synchronous barrier:

> * **The Asynchronous Race Condition:** ComfyUI's internal web server returns HTTP 200 OK in milliseconds while delegating tensor unmapping and CUDA stream synchronization to an asynchronous background worker.  
> * **The Overlap Crash:** If the orchestrator submits Child Graph C immediately after receiving HTTP 200 OK, PyTorch attempts to allocate 16 GB to 20 GB of video diffusion latents while the prior model's weights are still being cleared across PCIe lanes, triggering an unrecoverable CUDA OOM crash.  
> * **Hardware Verification Gate:** The orchestrator enforces an explicit polling gate after calling /free:  
  * It queries GET /system\_stats or polls nvidia-smi directly via an isolated child process (nvidia-smi \--query-gpu=memory.free \--format=csv,noheader,nounits).  
  * It evaluates **Relative Baseline Recovery**: instead of hardcoding a static threshold, it verifies that free VRAM has returned to within Δ≤500 MB of the machine's calibrated boot baseline (\>21 GB free on a 24 GB card).  
  * Only when the polling gate confirms physical memory release does the orchestrator release the lock to dispatch the next child graph.  
> * **Circuit Breaker Watchdog:** If VRAM fails to return to baseline within a 15-second timeout window—indicating a hung CUDA stream or a leaked C++ tensor reference—the orchestrator trips an internal circuit breaker and recycles the ComfyUI process rather than corrupting the render.

### **4\. Stage-Level Batching vs. Per-Shot Thrashing**

Naive implementation of the turn-based flush on a per-shot basis (Shot 1 Text \-\> Flush \-\> Shot 1 Audio \-\> Flush \-\> Shot 1 Video \-\> Flush \-\> Shot 2 Text...) introduces severe PCIe bus thrashing:

> * **The Bus Bottleneck:** Transferring 10 GB of text weights, 5 GB of TTS checkpoints, and 20 GB of diffusion weights across PCIe lanes on every individual shot wastes 45–90 seconds of pure I/O overhead per cut.  
> * **Amortized Stage-Level Batching:** The orchestrator groups tasks by stage across an entire scene or episode batch:  
  1. **Batch Phase 1:** Execute Child Graph A for all dialogue lines across the entire scene; emit all ASTs.  
  2. **Boundary Flush 1:** Execute a single POST /free to completely purge text weights.  
  3. **Batch Phase 2:** Hydrate the TTS node once; synthesize all .wav stems and calculate all frame budgets across the scene; write all audio manifests.  
  4. **Boundary Flush 2:** Execute a single POST /free to completely purge audio weights.  
  5. **Batch Phase 3:** Hydrate Wan 2.2 once; render all \#00FF00 character plates back-to-back in vacated VRAM.  
> * **Process Recycling Boundary:** To prevent cumulative PyTorch caching allocator heap fragmentation across long batches, the orchestrator restarts the underlying headless ComfyUI child process every 25 shots or at major sequence boundaries, clearing driver-level virtual memory tables.

### **5\. Architectural Isolation: Offloading to the Dual-Rig Split**

To eliminate the need for running this three-turn eviction cycle continuously on Rig 2, the production pipeline supports physical workstation isolation:

> * **Rig 1 Host Quarantine:** Narrative state resolution, text drafting via llama.cpp, speech synthesis via the local Python microservice (:8000), and ffprobe duration measurement are quarantined entirely to Rig 1\.  
> * **Zero Dedicated VRAM on Rig 1:** Rig 1 executes all drafting, audio, and Remotion compositing (--gl=swangle) inside system RAM and multi-core CPU threads, consuming 0 MB of dedicated GPU VRAM.  
> * **Pure Foundry Focus on Rig 2:** By eliminating Turn 1 (Text) and Turn 2 (Audio) from Rig 2, the local GPU foundry workstation is relieved of model swapping overhead entirely. Rig 2 dedicates 100% of its physical silicon uptime exclusively to high-resolution Wan 2.2 temporal video diffusion passes.

---

*User prompt: {{FOCUS : 4\. Asynchronous /free Semantics & Verifiable Memory Polling, 5\. Memory Defragmentation & Automated Process Recycling }} /extreme-details*

### **Response: 4\. Asynchronous /free Semantics & Verifiable Memory Polling**

Relying on an unverified HTTP POST /free command as a synchronous memory fence is a primary cause of non-deterministic CUDA Out-Of-Memory (OOM) aborts in generative execution engines. When ComfyUI receives an eviction instruction at \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) with { unload\_models: true, free\_memory: true }, the underlying web server returns an HTTP 200 OK almost instantaneously. This rapid response occurs because the web runtime merely enqueues the memory release into an asynchronous background task queue rather than blocking until the physical GPU VRAM is evacuated.

┌────────────────────────────────────────────────────────────────────────┐  
│ VERIFIABLE MEMORY POLLING SEQUENCE                                     │  
├────────────────────────────────────────────────────────────────────────┤  
│ media-broker calls POST /free ──► ComfyUI queues async model unload    │  
│                                            │                           │  
│ ┌──────────────────────────────────────────┴─────────────────────────┐ │  
│ │ WHILE (Elapsed \< 15s Timeout):                                     │ │  
│ │   1\. Poll GET /system\_stats OR spawn nvidia-smi via child\_proc     │ │  
│ │   2\. Read Free\_VRAM                                                │ │  
│ │   3\. IF Free\_VRAM \>= (Measured\_Baseline\_VRAM \- Tolerance):         │ │  
│ │        BREAK \-\> Emit VRAM\_VERIFIED (Proceed to next stage)         │ │  
│ │   4\. ELSE: Sleep(250ms)                                            │ │  
│ └──────────────────────────────────────────┬─────────────────────────┘ │  
│                                            │                           │  
│ ├── PASS: Dispatch Next Modality Graph     └── TIMEOUT EXCEEDED (15s): │  
│                                                • Detect Memory Leak    │  
│                                                • Trigger Daemon Restart│  
└────────────────────────────────────────────────────────────────────────┘

#### **The Asynchronous Race Condition**

> * If the orchestrator immediately submits the next workflow graph upon receiving HTTP 200 OK, PyTorch begins allocating 16 GB to 22 GB of video latent tensors while prior model weights (such as 9 GB to 10 GB of text GGUF models or 4 GB to 6 GB of neural speech vocoders) are still clearing across PCIe lanes.  
> * These memory footprints overlap within physical VRAM, causing allocations to exceed the 24 GB hardware ceiling and triggering an unrecoverable torch.cuda.OutOfMemoryError.  
> * ComfyUI's dynamic cache manager requires finite wall-clock duration to unbind model pointers, execute Python garbage collection passes, and signal PyTorch's CUDA caching allocator to release mapped memory pools back to the driver.

#### **The Polling Gate Engine**

To eliminate this race condition, the media-broker establishes a hardware verification gate that halts all workflow dispatching until physical memory evacuation is confirmed:

// Verification loop executed on Rig 2 before dispatching downstream graphs  
export async function pollVramHygieneGate(  
  baselineFreeMb: number,  
  toleranceMb \= 500,  
  timeoutMs \= 15000  
): Promise\<void\> {  
  const startTime \= Date.now();  
  const targetFreeMb \= baselineFreeMb \- toleranceMb;

  while (Date.now() \- startTime \< timeoutMs) {  
    // Poll driver reality directly via isolated child process or GET /system\_stats  
    const currentFreeMb \= await readDriverFreeVramMb();

    if (currentFreeMb \>= targetFreeMb) {  
      // Hardware fence satisfied: physical memory returned to baseline envelope  
      return;  
    }

    // Yield execution loop to allow asynchronous driver unwinding  
    await new Promise((resolve) \=\> setTimeout(resolve, 250));  
  }

  // Circuit breaker tripped: memory remained locked or leaked past 15-second ceiling  
  throw new Error(\`\[VRAM\_LEAK\] Hardware failed to clear to baseline within \${timeoutMs}ms.\`);  
}

> * **Dual-Surface Telemetry Interrogation:** The polling gate continuously queries ComfyUI's internal telemetry route (GET \[http://127.0.0.1:8188/system\_stats\](http://127.0.0.1:8188/system\_stats)) while simultaneously supporting out-of-band verification via direct nvidia-smi subprocess execution.  
> * **Decoupling from the Python GIL:** If heavy PyTorch deallocations block ComfyUI's internal Python Global Interpreter Lock (GIL) and stall aiohttp responses, spawning an isolated POSIX nvidia-smi process (nvidia-smi \--query-gpu=memory.free \--format=csv,noheader,nounits) inspects physical driver reality independently of the application layer.  
> * **The 250 Millisecond Polling Cadence:** The gate polls available memory every 250 milliseconds, allowing background I/O unwinding while avoiding excessive CPU usage during the wait cycle.

#### **Relative Baseline Verification vs. Static Thresholds**

> * **Static Threshold Fragility:** Hardcoding an absolute threshold (such as assert free\_vram \>= 21000 MB) creates fragile deployments across differing host environments. If host operating system compositors, display managers, or background terminal utilities claim 1.2 GB to 1.5 GB of VRAM, available memory can never exceed 20.8 GB, causing a static check to hang indefinitely.  
> * **Calibration Against Measured Baseline:** The execution spoke measures the machine's actual idle VRAM at boot time to establish an empirical baseline (Baselinefree​).  
> * **Tolerance Envelope (Δ):** The system defines an acceptable recovery tolerance, asserting that memory is clean when:  
>   Currentfree​≥(Baselinefree​−Δ)where Δ≤500 MB  
> * **Verification Over Assumption:** Production safety strictly replaces speculative guarantees of memory recovery with continuous empirical measurements backed by explicit timeout and restart fallbacks.

#### **The 15-Second Watchdog Circuit Breaker**

> * **Timeout Boundary:** The polling gate enforces a strict maximum timeout ceiling of 15 seconds.  
> * **Fault Detection:** If available memory fails to cross the calibrated baseline threshold before the 15-second window expires, the gate detects a memory leak, a deadlocked CUDA stream, or an uncollectible circular tensor reference.  
> * **Autonomous Remediation:** Exceeding the timeout trips an internal circuit breaker, rejects the queued task to prevent hardware deadlocks, and triggers an automated daemon restart to reclaim the physical GPU.

### **5\. Memory Defragmentation & Automated Process Recycling**

Even when POST /free successfully returns overall memory metrics to baseline, long-running production sessions encounter physical allocation failures caused by virtual memory fragmentation inside PyTorch’s caching allocator.

PHYSICAL VRAM HEAP (Reported Free: 21.5 GB Cumulative)  
┌───────┬────────────┬───────┬────────────┬───────┬────────────┬───────┐  
│ Alloc │    Free    │ Alloc │    Free    │ Alloc │    Free    │ Alloc │  
│ 128MB │   4.2 GB   │ 64MB  │   3.8 GB   │ 256MB │   5.1 GB   │ 32MB  │  
└───────┴────────────┴───────┴────────────┴───────┴────────────┴───────┘  
❌ Wan 2.2 Latent Allocation: REQUIRES 14.0 GB CONTIGUOUS ADDRESS SPACE\!  
💥 RESULT: torch.cuda.OutOfMemoryError (Fragmented Heap) despite 21.5 GB free\!

#### **The Mechanism of Virtual Memory Fragmentation**

> * **The Caching Allocator Design:** PyTorch avoids the latency of operating system kernel context switches by managing a custom caching allocator (cudaMalloc and cudaFree) that retains allocated memory pools in virtual address space rather than returning physical pages to the NVIDIA driver.  
> * **Multi-Modal Shape Divergence:** As the local spoke alternates across multi-modal modalities—processing variable-token text sequences, 1D acoustic arrays, and 5D spatio-temporal video latents (\[*B*,*C*,*T*,*H*,*W*\])—the caching allocator carves the heap into scattered, variable-sized blocks.  
> * **The Contiguous Block Deficit:** When heavy diffusion backends (such as Wan 2.2) initialize, allocating the 3D attention matrices and latent tensor arrays requires a single, unbroken contiguous address block (often ≥14.0 GB).  
> * **The Fragmentation Out-Of-Memory Crash:** If the largest available contiguous block is smaller than the requested tensor size, PyTorch throws a fatal torch.cuda.OutOfMemoryError even when cumulative free VRAM is reported as \>21 GB.

#### **Stage-Level Batching vs. Per-Shot Thrashing**

To minimize the rate of heap fragmentation and reduce PCIe bus overhead, the pipeline discards naive per-shot model swapping in favor of stage-level batching:

NAIVE PER-SHOT THRASHING (ANTI-PATTERN):  
Shot 1 Text ──► Flush ──► Shot 1 Audio ──► Flush ──► Shot 1 Video ──► Flush ──► Shot 2 Text...  
(Wastes 45-90s per shot swapping weights across PCIe; rapidly fragments memory heap)

AMORTIZED STAGE-LEVEL BATCHING (PRODUCTION ARCHITECTURE):  
\[ Phase 1: Batch Dialogue ASTs \] ──► Complete Scene Text Pass (Child Graph A)  
                 │  
           POST /free Flush & VRAM Verification Gate (nvidia-smi)  
                 │  
                 ▼  
\[ Phase 2: Batch Acoustic Stems \] ──► Synthesize Scene Audio & Quantize Frames (Child Graph B)  
                 │  
           POST /free Flush & VRAM Verification Gate (nvidia-smi)  
                 │  
                 ▼  
\[ Phase 3: Batch Video Diffusion\] ──► Render All \#00FF00 Plates Back-to-Back (Child Graph C)

> * **Elimination of Bus Thrashing:** Shuttling 10 GB of text GGUF models, 5 GB of TTS checkpoints, and 20 GB of video diffusion weights across PCIe lanes for every single cut consumes dozens of seconds of pure I/O overhead.  
> * **Amortized Execution:** The system groups tasks by stage: compiling all dialogue ASTs for an episode sequence in a single pass, executing one verified /free eviction, synthesizing all acoustic stems to lock frame budgets, executing a second verified /free eviction, and keeping the video diffusion checkpoint loaded to render all character plates back-to-back.  
> * **Offload Optimization:** By offloading text drafting and acoustic processing entirely to Rig 1's CPU and system RAM, Rig 2 is freed from multi-modal switching entirely, running video diffusion exclusively in dedicated VRAM.

#### **Automated Process Recycling (The Hard Boundary Reset)**

Because stage-level batching delays but cannot completely prevent virtual allocator fragmentation across multi-hour production schedules, the media-broker implements an automated **Process Recycling** regime:

export class ProcessRecyclingGovernor {  
  private shotCounter \= 0;  
  private readonly maxShotsBeforeRecycle \= 25;

  public async evaluateExecutionCycle(currentStage: string, nextStage: string): Promise\<void\> {  
    this.shotCounter++;

    const reachedShotLimit \= this.shotCounter \>= this.maxShotsBeforeRecycle;  
    const isStageBoundary \= currentStage \!== nextStage;

    if (reachedShotLimit || isStageBoundary) {  
      await this.executeGracefulProcessRecycle();  
      this.shotCounter \= 0;  
    }  
  }

  private async executeGracefulProcessRecycle(): Promise\<void\> {  
    // 1\. Terminate headless ComfyUI child process cleanly  
    await stopComfyUiDaemon();

    // 2\. Kernel forces unmapping of all CUDA context tables  
    // 3\. Respawn headless daemon and wait for loopback readiness  
    await spawnComfyUiDaemon({ listen: "127.0.0.1", port: 8188, highvram: true });  
    await waitForSocketReady("http://127.0.0.1:8188/system\_stats");  
  }  
}

> * **The 25-Shot Monotonic Limit:** The local broker tracks consecutive completed video plates using an internal counter. Exactly every **25 completed shots**, the governor initiates a graceful process recycle.  
> * **Major Stage Boundary Resets:** A process recycle is automatically executed whenever the production pipeline transitions across major sequence boundaries (such as moving from background matte generation to foreground character plate passes).  
> * **Kernel-Level Context Reclamation:** Terminating the host Python process forces the operating system kernel and the NVIDIA kernel driver (nvidia.ko) to completely unmap the active CUDA context and associated virtual address tables.  
> * **Total Address Space Restoration:** Process destruction reclaims all fragmented heap allocations and leaked C++ references, resetting the physical graphics memory back to an unfragmented 24 GB physical address space before subsequent sampling graphs execute.

---

*User prompt: {{FOCUS : 6\. Local Network Topology & Ingress Demarcation }} /extreme-details*

Response: The **Local Network Topology & Ingress Demarcation** of **Rig 2** establishes an inside-out, zero-trust network perimeter that completely isolates physical GPU silicon while enabling coordination with Cloudflare's serverless edge (edge-director) and Rig 1 (worker-sower-conductor). By discarding traditional inbound WAN port forwarding in favor of outbound encrypted tunnels and strict loopback bindings, the architecture secures unauthenticated internal runtime interfaces and prevents multi-tenant hardware collisions.

### **1\. The Inside-Out Network Topology & The Zero-Inbound Rule**

The primary architectural law governing Rig 2's network perimeter is the **Zero-Inbound Rule**: the workstation opens zero inbound ports on the studio router, local gateway, or operating system firewall.

┌────────────────────────────────────────────────────────────────────────┐  
│ CLOUDFLARE ANYCAST EDGE (edge-director: POD-12 Middleware)             │  
│ • EdgeGateway (Hono HTTP / D1 Continuity Checks)                       │  
│ • ShotCoordinatorDO (Durable Object Actor & Concurrency Mutex)         │  
└───────────────────────────────────▲────────────────────────────────────┘  
                                    │  
         Outbound Encrypted Pipe: cloudflared (TLS 1.3 / QUIC)  
         • Initiated from Rig 2 outward to edge proxy  
         • Zero inbound WAN firewall ports open  
         • Transparent CGNAT & dynamic IP traversal  
                                    │  
┌───────────────────────────────────┴────────────────────────────────────┐  
│ RIG 2: LOCAL FOUNDRY PERIMETER (Physical Linux Workstation)            │  
│                                                                        │  
│   \[ cloudflared Daemon \]                                               │  
│         │                                                              │  
│         ▼ (Loopback IPC: 127.0.0.1:3000)                               │  
│   \[ media-broker Daemon \] ◄── POSIX flock on /var/lock/rig2\_gpu.lock   │  
│         │                                                              │  
│         ├─ POST /prompt & POST /free (Loopback HTTP: 127.0.0.1:8188)   │  
│         ├─ WebSocket Telemetry Tap   (Loopback WS: 127.0.0.1:8188/ws) │  
│         ▼                                                              │  
│   \[ Headless ComfyUI Runtime \] (127.0.0.1:8188 only)                   │  
└────────────────────────────────────────────────────────────────────────┘

> * **Outbound Tunnel Initiation (cloudflared):** Rather than listening for incoming connections from the internet, Rig 2 runs a background Cloudflare Tunnel daemon (cloudflared). Upon boot, cloudflared initiates an outbound-only connection to Cloudflare’s global Anycast edge using encrypted TLS 1.3 or QUIC protocols.  
> * **Perimeter Firewall Invariant:** The studio router's Statefull Packet Inspection (SPI) firewall and Rig 2's local iptables/nftables rules reject all unsolicited inbound connection attempts on all network adapters (eth0, wlan0).  
> * **Network Address Translation (NAT) & Dynamic IP Immunity:** Because the connection originates entirely from inside the private subnet, the tunnel traverses Carrier-Grade NAT (CGNAT), local double-NAT setups, and dynamic ISP public IP reassignments without requiring static IPs, dynamic DNS (DDNS) daemons, or router UPnP exposure.  
> * **Persistent Outbound WebSocket Client:** Operating behind cloudflared, the media-broker process functions strictly as an outbound client, connecting upward to the edge coordinator endpoint:  
>   EDGE\_DO\_WS\_URL=wss://director.internal.studio.net/ws?role=broker

>   All task instructions, lease negotiations, and abort signals are pulled down this pre-established socket.

### **2\. Local Loopback Quarantine & Internal IPC Demarcation (127.0.0.1)**

Within the operating system boundary of Rig 2, all network interfaces are segmented to prevent lateral movement or unauthorized access from within the local area network (LAN).

> * **Strict 127.0.0.1 Loopback Pinning:**  
  * **Port 8188 (Headless ComfyUI):** Launched with \--listen 127.0.0.1 \--port 8188\. It binds exclusively to the IPv4 loopback adapter.  
  * **Port 3000 (media-broker Controller):** Listens exclusively on 127.0.0.1:3000 for management hooks, health verification, and internal IPC.  
> * **Banned 0.0.0.0 Wildcard Binding:** Neither service is permitted to bind to 0.0.0.0 (all interfaces) or to the host’s private LAN IP (e.g., 192.168.1.x).  
> * **Lateral LAN Quarantine:** In studio environments where untrusted mobile devices, office laptops, or IoT hardware share the local Wi-Fi or Ethernet switch, wildcard bindings expose raw services to internal port scanners. Pinning to 127.0.0.1 ensures that even a compromised device on the same physical router cannot reach ComfyUI or the broker management loop.  
> * **Inter-Process Communication (IPC) Protocol:** The media-broker acts as the sole authorized gatekeeper between the network pipe and the execution engine. All communication between the broker and ComfyUI occurs over local loopback interfaces:  
  * Execution prompts: POST \[http://127.0.0.1:8188/prompt\](http://127.0.0.1:8188/prompt)  
  * Memory hygiene: POST \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free)  
  * Telemetry tapping: ws://127.0.0.1:8188/ws?clientId=\<daemon\_uuid\>

### **3\. Edge Ingress Authentication & Role-Tagged Sockets**

The edge ingress architecture demarcates untrusted public client traffic from authorized GPU compute spokes via cryptographic verification and connection tagging inside Cloudflare's edge network.

Client / Artist Ingress (Rig 1\)          GPU Foundry Ingress (Rig 2 media-broker)  
\[ Public WSS: .../ws?role=artist \]       \[ Tunnel WSS: .../ws?role=broker \]  
               │                                        │  
               ▼                                        ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ CLOUDFLARE EDGEGATEWAY (src/index.ts via Hono)                         │  
│ • Validates Clerk JWT (Public)        • Validates Service Tokens (mTLS)│  
│ • Evaluates D1 Continuity Checks      • Intercepts CF-Access-Client-Id │  
└───────────────────────────────────┬────────────────────────────────────┘  
                                    │ Forward to DO  
                                    ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ ShotCoordinatorDO (Durable Object Actor)                               │  
│ • Sockets accepted via WebSocket Hibernation API                       │  
│ • Tagged Channels: this.ctx.acceptWebSocket(ws, \[role\])                │  
│                                                                        │  
│   ├── getWebSockets("artist") ──► Receives: BROKER\_PROGRESS, SHOT\_READY│  
│   └── getWebSockets("broker") ──► Receives: EXECUTE\_JOB, ABORT\_JOB     │  
└────────────────────────────────────────────────────────────────────────┘

> * **Service Token Perimeter:** Incoming traffic from Rig 2's tunnel must present Cloudflare Access Service Tokens via HTTP headers (CF-Access-Client-Id and CF-Access-Client-Secret) or authenticate using Mutual TLS (mTLS) certificates managed within Cloudflare Zero Trust. Sockets lacking valid machine credentials are terminated at the Anycast edge in \<5 ms.  
> * **Role-Based Connection Demarcation:**  
  * **Artist / Viewport Connections:** Connect to wss://director.studio.net/ws?role=artist authenticated via Clerk user session JWTs.  
  * **Broker Execution Connections:** Connect to wss://director.internal.studio.net/ws?role=broker authenticated via service tokens.  
> * **Multiplexed Channel Isolation:** When the edge ShotCoordinatorDO accepts connections, it registers them using Cloudflare's WebSocket Hibernation API with explicit role tags:  
>   this.ctx.acceptWebSocket(webSocket, \[role\]); // role: "artist" | "broker"

When telemetry is broadcast, this.ctx.getWebSockets("artist") isolates client viewports so that artist clickstreams never leak into the hardware execution channel, and internal broker heartbeats never flood client UIs.

### **4\. Threat Surface Neutralization (CVE Mitigations & ComfyUI Isolation)**

ComfyUI is designed as an interactive single-user local tool rather than a hardened multi-tenant server. Directly exposing its underlying aiohttp web runtime introduces severe software vulnerabilities that the local network demarcation completely neutralizes:

┌────────────────────────────────────────────────────────────────────────┐  
│                        THREAT MATRIX & DEFENSES                        │  
├─────────────────────┬──────────────────────┬───────────────────────────┤  
│ Attack Vector       │ Native Vulnerability │ Demarcation Countermeasure│  
├─────────────────────┼──────────────────────┼───────────────────────────┤  
│ Remote Code         │ Custom nodes execute │ Zero inbound WAN ports;   │  
│ Execution (RCE)     │ arbitrary Python/OS  │ ComfyUI pinned strictly   │  
│                     │ shell scripts\[cite: 2\]│ to 127.0.0.1 loopback\[cite: 1, 2\]│  
├─────────────────────┼──────────────────────┼───────────────────────────┤  
│ Directory Traversal │ Unauthenticated      │ Strict SpokeExecution-    │  
│ & Arbitrary Writes  │ /upload/image routes │ Payload Zod compiler;     │  
│                     │ write arbitrary files│ templates local on NVMe\[cite: 1, 2\]│  
├─────────────────────┼──────────────────────┼───────────────────────────┤  
│ Memory Saturation   │ Concurrent HTTP POST │ Single-threaded edge DO   │  
│ & CUDA OOM Denial   │ /prompt requests     │ mutex \+ local OS-level    │  
│                     │ collide in VRAM\[cite: 2\]│ flock on GPU interface\[cite: 1, 2\]│  
└─────────────────────┴──────────────────────┴───────────────────────────┘

> * **Elimination of Arbitrary Code Ingestion:** ComfyUI workflows accept Python scripts when custom nodes are dynamically imported. By restricting inbound ingress to the media-broker on loopback, Rig 2 refuses raw workflow JSON from untrusted networks. The broker ingests only verified parameter scalars (targetFrames, seed, prompt) and injects them into local, version-controlled template files (wan\_greenscreen\_plate.json).  
> * **Path Traversal Blocking:** The EdgeGateway validates all payloads against strict Zod schemas before queue insertion, rejecting any string containing relative directory sequences (../), absolute system paths (/etc/, C:\\), or unallowlisted model extensions.  
> * **Hardware Denial of Service (DoS) Defense:** Without an ingress mutex, two concurrent HTTP requests sent to ComfyUI attempt simultaneous VRAM allocations, crashing the PyTorch runtime with a fatal CUDA OOM error. The edge coordinator's single-threaded FIFO queue, paired with Rig 2's OS-level flock, enforces strict serial execution on the GPU.

### **5\. Cross-Machine Demarcation (Rig 1 Orchestration vs. Rig 2 Foundry)**

The architecture establishes an explicit physical and operational separation between **Rig 1** (The Conductor / Presentation Compiler) and **Rig 2** (The GPU Foundry Workstation):

┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐  
│ RIG 1: THE CONDUCTOR                   │       │ RIG 2: THE GPU FOUNDRY SPOKE           │  
│ Physical: Multi-core CPU, System RAM   │       │ Physical: High-VRAM GPU (RTX 4090\)     │  
│ Compute Profile: ZERO Dedicated VRAM   │       │ Compute Profile: 100% VRAM to Diffusion│  
├────────────────────────────────────────┤       ├────────────────────────────────────────┤  
│ • worker-sower-conductor               │       │ • media-broker daemon (:3000)          │  
│ • Local Python Audio Service (:8000)   │       │ • Headless ComfyUI daemon (:8188)      │  
│ • ffprobe Waveform Quantization CLI    │       │ • POSIX flock (/var/lock/rig2\_gpu.lock)│  
│ • Remotion Compositor (@remotion/cli)  │       │ • NVMe Scratchpad & s5cmd R2 Client    │  
│   (Forced to software: \--gl=swangle)   │       │ • Output: Raw \#00FF00 Chroma Plates    │  
├────────────────────────────────────────┤       ├────────────────────────────────────────┤  
│ STRICTLY BANNED:                       │       │ STRICTLY BANNED:                       │  
│ ❌ GPU tensor generation passes        │       │ ❌ Chromium / Remotion rendering       │  
│ ❌ Direct unauthenticated LAN sockets  │       │ ❌ SQLite narrative canon databases    │  
│    into Rig 2's port 8188              │       │ ❌ Audio waveform clocking / ffprobe   │  
└────────────────────────────────────────┘       └────────────────────────────────────────┘

> * **No Direct LAN Coupling:** Rig 1 does **not** communicate with Rig 2 over raw local TCP sockets (e.g., \[http://192.168.1.50:8188\](http://192.168.1.50:8188)). All cross-machine task dispatch is routed up through the authenticated EdgeGateway and down through the cloudflared tunnel, ensuring all operations are validated against Cloudflare D1 continuity checks (is\_dirty \== 0\) and registered in the distributed ledger.  
> * **Resource Contention Isolation:** Headless Chromium rendering (@remotion/renderer), audio synthesis (:8000), and temporal probing (ffprobe) are quarantined to Rig 1\. Running DOM rasterization alongside active diffusion models on Rig 2 causes memory thrashing, driver conflicts, and operating system OOM kills.  
> * **Asset Handoff via Content-Addressed Object Storage:** Finished .mp4 plates generated on Rig 2 are uploaded to Cloudflare R2 under immutable SHA-256 keys (plates/sha256\_{hash}.mp4). Rig 1 downloads these verified plates over Cloudflare R2's **\$0.00 egress fee guarantee**, preventing large video file transfers from saturating local network links or stalling the machines' internal loopbacks.

### **6\. Network Partition Failover & Local Spool Demarcation**

To satisfy the studio's **Deletion Principle**—guaranteeing that local production velocity survives complete cloud outages—the network demarcation includes an autonomous local fallback mechanism.

                           Is Edge Tunnel Reachable?  
                                       │  
                      ┌────────────────┴────────────────┐  
                      ▼ YES                             ▼ NO  
        \[ Pull from Cloudflare Edge \]         \[ Pull from Local NVMe Disk \]  
        • Read from ShotCoordinatorDO         • Read from /var/spool/renders/\*.json  
        • Validate monotonic epoch lease      • Local file queue directory  
                      │                                 │  
                      └────────────────┬────────────────┘  
                                       ▼  
                     \[ UNIFIED LOCAL EXECUTION PIPELINE \]  
                     • Acquire local POSIX flock on GPU  
                     • Verify baseline VRAM via nvidia-smi  
                     • Inject parameters into workflow\_api.json  
                     • Dispatch to POST http://127.0.0.1:8188/prompt  
                     • Turn-based POST http://127.0.0.1:8188/free  
                     • Validate MP4 scratch via ffprobe

> * **Zero Code-Path Divergence:** If wide-area network lines are severed or the Cloudflare Tunnel drops, the media-broker does not switch to a divergent, secondary code branch.  
> * **Filesystem Ingress Switching (/var/spool/renders):** The broker shifts its polling ingress from the upstream WebSocket to a local POSIX directory on its NVMe drive: /var/spool/renders/\*.json.  
> * **Uniform Invariant Preservation:** Whether an execution payload arrives via the edge tunnel or from /var/spool/renders, the downstream execution steps remain identical:  
  1. Acquire local POSIX flock on /var/lock/rig2\_gpu.lock.  
  2. Verify free VRAM headroom via nvidia-smi.  
  3. Hydrate the workflow template in memory and dispatch to 127.0.0.1:8188/prompt.  
  4. Perform turn-based memory eviction via 127.0.0.1:8188/free.  
  5. Audit the generated .mp4 file on local scratch before indexing.  
> * **Offline Asset Persistence:** Plates rendered during an outage are hashed via SHA-256 and committed to a local staging archive. When the outbound tunnel reconnects, media-broker drains its local completions, synchronizes hashes with the remote D1 ledger, and resumes pulling jobs from the edge queue without dropped frames or manual intervention.

---

*User prompt: now check out the beginning of the conversation and summarize all of the most important parts until the last response concerning the media broker for 3000 words*

## **Response: Epistemological Foundations: Shedding Engineering Fiction for Deterministic Compilation**

The generative production pipeline originated from a fundamental realization: large language models (LLMs), neural text-to-speech (TTS) engines, and spatial-temporal video diffusion models are non-deterministic, probabilistic token predictors that cannot function as ontological state containers. When generative models are granted narrative, spatial, or temporal authority, context windows degrade, character physical injuries vanish, character secrets leak into public dialogue, and multi-episode continuity suffers catastrophic collapse.

            THE COLLAPSE OF GENERATIVE STATE AUTHORITY  
              
   ┌────────────────────────────────────────────────────────┐  
   │ PROBABILISTIC FOUNDATION (Untrusted State Holder)      │  
   │  • LLM hallucinates facts across context windows       │  
   │  • Diffusion drifts character anatomy and wardrobe     │  
   │  • Speech engine introduces duration jitter            │  
   │  • Result: "Chapter 3 Collapse" (Broken Continuity)    │  
   └───────────────────────────┬────────────────────────────┘  
                               │ Inversion of Authority  
                               ▼  
   ┌────────────────────────────────────────────────────────┐  
   │ DETERMINISTIC CONTROL PLANE (Authoritative Reality)    │  
   │  • Immutable relational ledger stores ground truth     │  
   │  • State transitions calculated via discrete math      │  
   │  • Models demoted to subordinate execution workers     │  
   │  • Result: Bit-stable, reproducible media compilation  │  
   └────────────────────────────────────────────────────────┘

### **The Critique of Architectural Speculation**

Early iterations of this system design accumulated extensive speculative architecture: 23-pod organizational structures, formal Service Level Agreements (SLAs), transmedia ontologies, and multi-tiered cryptographic Merkle tree provenance layers. Direct adversarial audits revealed that these sprawling structures were "engineering fiction"—a sophisticated technical facade that simulated operational rigor before the system had processed a single production run.

A formal specification is not a functioning production engine. Complex Merkle DAG reconcilers, distributed consensus protocols, and speculative multi-agent negotiations added maintenance overhead without solving the empirical bottlenecks of local GPU memory management, audio-to-video synchronization, and dramaturgical quality. The system was simplified by pruning speculative abstractions and preserving only the mechanisms that directly protected against irreversible production loss.

### **The Validated Technical Core: Narrative Cache Invalidation**

Stripped of speculative overhead, the core architecture is governed by a single structural mechanism: **narrative cache invalidation**. The pipeline treats storytelling through the lens of a software build system (such as make or Bazel), enforcing narrative continuity as a directed dependency graph:

> * A relational ledger stores canonical narrative facts (e.g., character injuries, inventory locations, known secrets).  
> * Downstream scenes declare explicit, pinned dependencies on these discrete fact records.  
> * When an upstream fact mutates (e.g., an author updates a duel outcome in Episode 2), a deterministic query traverses the dependency graph and marks all downstream dependent scenes as "stale" or "dirty" (is\_dirty \= 1).  
> * Invalidation prevents invalid downstream scenes from rendering on physical hardware, saving compute resources by rejecting corrupted narratives before execution begins.

### **The Core Constitutional Axiom**

The architecture separates probabilistic inference from deterministic truth through an overarching design rule:

Probabilistic systems propose and execute; deterministic systems decide what is allowed to be true.

Generative models are treated as untrusted, headless rendering workers possessing zero authority over canonical reality. They are constrained by deterministic contracts:

CANON & DYNAMIC LEDGER ──► DETERMINISTIC SIMULATION ──► VALIDATED SCENE PLAN  
                                                               │  
                                                               ▼  
FINAL MEDIA COMPOSITION ◄── HARDWARE FOUNDRY ◄── MASTER ACOUSTIC CLOCK

> * Narrative truth is governed by immutable state records and discrete relational math.  
> * Dramatic dialogue is compiled through grammar-masked language models that are denied access to unrevealed facts.  
> * Physical execution duration is locked to microsecond acoustic waveforms rather than diffusion frame estimates.  
> * Visual rendering backends execute strictly as isolated, dumb hardware workers.

### **The Deletion Principle & Content-Addressed Archival**

The pipeline adheres to the **Deletion Principle**: narrative truth must be completely independent of model weights. If every generative model (LLMs, diffusion checkpoints, vocoders) were deleted, the entire narrative universe remains intact within the relational ledger.

Conversely, because diffusion models cannot regenerate frames bit-for-bit across different driver versions, CUDA environments, or hardware revisions, generated video plates cannot be treated as ephemeral, recalculable cache. The moment a visual plate clears Quality Control (QC), it is cryptographically notarized using its SHA-256 content digest and preserved in immutable, content-addressed storage (Cloudflare R2).

## **Narrative State Space & Creative Guardrails (The Sower Core)**

The narrative simulation core—designated canonically as **worker-sower-engine**—operates as a medium-agnostic, event-sourced state reducer. It resolves narrative conflicts, manages character trauma, and enforces lore continuity without any video rendering libraries, React components, or GPU driver bindings.

               AXIS A: SEMANTIC TRANSFORMATION (Meaning)  
┌──────────────────┐       ┌────────────────────┐       ┌──────────────────┐  
│ Canonical Lore   │ ────► │ Relational Ledger  │ ────► │ Deterministic    │  
│ & Physical Laws  │       │ Dynamic State (Sn) │       │ Simulation Core  │  
└──────────────────┘       └────────────────────┘       └─────────┬────────┘  
                                                                  │  
                                                                  ▼  
┌──────────────────┐       ┌────────────────────┐       ┌──────────────────┐  
│ Remotion Video   │ ◄──── │ Temporal Lattice   │ ◄──── │ Dialogue AST     │  
│ Composition (MP4)│       │ Exposure Sheet     │       │ Contract (JSON)  │  
└──────────────────┘       └────────────────────┘       └──────────────────┘  
              AXIS B: ARTIFACT HARDENING (Representation)

### **The Ontological Boundary: Meaning vs. Representation**

The system maintains an absolute separation between two orthogonal axes of production:

> * **Axis A: Semantic Transformation (Meaning):** The world model tracks abstract story reality. It records that character Bog suffered an injury to his left shoulder, that Spleen hoards a stolen silver spoon, and that tension between them has crossed an escalation threshold. It has zero awareness of pixel coordinates, camera focal lengths, 24 fps frame bounds, or CSS styling.  
> * **Axis B: Artifact Hardening (Representation):** Downstream compilation layers receive the validated semantic contract and project it into specific distribution formats (e.g., an animated MP4 via Remotion, a graphic novel PDF via Typst, or an EPUB 3.0 file via Pandoc).

By enforcing this boundary, the narrative engine remains decoupled from the visual renderer. The creative world can transition from 2D animation puppets to high-parameter 3D video diffusion without rewriting narrative logic or invalidating canonical history.

### **Immutable Canon vs. Mutable Relational State**

Narrative information is partitioned into two distinct operational data stores:

   CANON (Read-Only Law: bible-state.json)  
   • Anatomical constraints (e.g., Wart: severed left arm \-\> ArmsAvailable \= 1.0)  
   • Geographical adjacency grids & movement penalties  
   • Core psychological wounds and permanent lore facts  
                             \+  
   DYNAMIC LEDGER (Mutable State: SQLite / Cloudflare D1)  
   • Current spatial coordinates (Hex X, Y)  
   • Somatic condition meters, injury decays, and exhaustion  
   • Interpersonal resentment, active debts, and Paranoia Clocks  
                             ▼  
   EPISODE CONTEXT: Deterministic input for valid scene generation

> * **Immutable Canon:** Read-only world law compiled from Markdown and schema files into static artifacts (bible-state.json) via @snailicid3/consumer-npm. Canon defines anatomical rules (e.g., a character missing an arm cannot execute a two-handed vault), base entity attributes, and immutable historical origins.  
> * **Mutable Relational State:** Dynamic runtime data stored in relational tables. This includes spatial coordinates, active trauma vectors, psychological resentment values, and ticking Paranoia Clocks.

State transitions are modeled through formal event-sourcing:

*Sn*\+1​\=F(*Sn*​,Δ*n*​,*σn*​)

where state *Sn*​ transitions to *Sn*\+1​ through a deterministic reducer function F taking an explicit event payload Δ*n*​ and an audit-verified random seed *σn*​. Media deliverables (MP4s, PDFs) are never state; they are lossy, downstream projections of state transitions.

### **Typed State Vectors & Invariant Linters**

To prevent physical and logistical contradictions, the world model decomposes character status into three strongly-typed state vectors:

// Core State Vector Schemas enforced across the simulation pipeline  
export interface SomaticVector {  
  characterId: string;  
  armsAvailable: 0 | 1 | 2;  
  locomotionTier: "UNRESTRICTED" | "LIMPING" | "IMMOBILIZED";  
  concussionLevel: 0 | 1 | 2 | 3;  
  openWounds: Array\<{ location: string; severity: number; bleeding: boolean }\>;  
}

export interface LogisticalVector {  
  characterId: string;  
  heldItems: \[string | null, string | null\]; // Max 2 physical hands  
  wornGear: Array\<{ slot: "HEAD" | "TORSO" | "FEET"; itemId: string }\>;  
  ammunitionCounts: Record\<string, number\>;  
}

export interface EpistemicVector {  
  characterId: string;  
  knownFacts: Set\<string\>;      // Cryptographically matched fact IDs  
  activeBeliefs: Map\<string, { beliefId: string; confidence: number; source: string }\>;  
}

Prior to dispatching a scene to language generation, an automated invariant solver validates physical preconditions:

> * An actor whose somatic vector registers armsAvailable=1 while holding an item in that hand cannot climb a ladder.  
> * An actor whose epistemic vector lacks knowledge of an unrecorded property deed cannot reference it in dialogue.  
> * Violations trigger a compilation halt at *T*0​, rejecting impossible actions before any generative text or video calls are made.

### **The Human-Authored Grievance Corpus**

A relational database prevents factual contradictions, but it cannot manufacture dramatic tension. Leaving an LLM to invent scene conflicts on the fly results in repetitive tropes, polite dialogue, and rapid emotional defusion. The studio anchors its narrative engine to a pre-authored corpus of 40 to 60 categorized grievances:

\---  
id: spoon\_credit  
title: "The Good Silver Spoon"  
category: resource\_hoarding  
participants\_primary: \[char\_bog, char\_spleen\]  
participants\_can\_involve: \[char\_wart\]  
participants\_cannot\_involve: \[char\_mum\_grissel\]  
intensity\_floor: 1  
intensity\_ceiling: 4  
cooldown\_cycles: 3  
decay\_rate: slow  
spawns\_on\_max\_escalation:  
  type: secret  
  target\_id: sec\_bog\_famine  
outcomes:  
  clean\_win: "Bog is explicitly thanked before the family; recovers status."  
  costly\_compromise: "Spleen cleans the spoon, but demands half of next scrap ration."  
  mutual\_wound: "The spoon is dropped down the floorboard gap; lost to both."  
  catastrophic\_backfire: "Argument draws human footsteps above; attic stair locks down."  
\---

\*\*Surface complaint:\*\* Who gets credit for finding the good silver spoon.

\*\*Underneath:\*\* Bog feels perpetually uncredited for keeping the family fed—this is the shallow entry point to his core wound.

\*\*Forbidden Truth:\*\* Bog stole the spoon from a trap that nearly killed his brother; admitting this destroys his moral authority.

\*\*Callback phrases:\*\*  
\- "the spoon"  
\- "who really found it"  
\- "credit where it's due"

#### **The Dual-Rail File Architecture**

Grievance files enforce a separation between machine logic and creative prose:

> * **The Machine Rail (YAML Frontmatter):** Parsed by the simulation engine to perform deterministic set intersections against active characters, spatial locations, and cooldown intervals. The runtime checks eligibility without processing natural language.  
> * **The Voice Rail (Markdown Body):** Injected as prompt context for the dialogue compiler, guiding the LLM on subtext, emotional stakes, escalation steps, and forbidden truths.

#### **The Three-Layer Conflict Model**

Every authored grievance provides a deep dramatic structure:

> 1. **The Surface Complaint:** The petty, tactical argument (e.g., who found the spoon).  
> 2. **The Underneath:** The actual emotional friction (e.g., feeling unappreciated and uncredited).  
> 3. **The Forbidden Truth:** What the character cannot admit without losing status or vulnerability (e.g., the spoon was stolen from a trap).

### **Dramatic Compression: Subtext Compilation & Micro-Beats**

To prevent the language model from generating unnatural exposition or flat dialogue, the simulation applies structural constraints:

PROSE DRAMATURGICAL COMPRESSION DIRECTIVE:  
1\. FACTUAL LEVERAGE: Spleen holds evidence of Bog's theft of the spoon.  
2\. ATTENUATION FILTER (BANNED TOKENS):   
   Under no circumstances may your dialogue include the words:  
   \["spoon", "silver", "theft", "stole", "credit", "trap", "guilt"\].  
3\. TACTICAL DISPLACEMENT:   
   You must negotiate this leverage exclusively through the discussion of:  
   \["the rot on the ceiling joist", "the smell of incoming rain", "grease"\].

> * **Token Attenuation Filters:** Key dramatic terms are placed on a banned-token list. Banning direct references forces the model to channel interpersonal pressure through mundane physical props, generating natural subtext.  
> * **Micro-Beat Caps (200–250 Words):** Long LLM generations tend toward generic dialogue, repetitive structures, and premature narrative resolution. The engine restricts prompts to 200–250 word micro-beats tied to a physical exit condition (e.g., *"Cease generation the millisecond Silas closes the kerosene valve"*), preventing models from describing unprompted emotions or after-effects.

## **The Master Temporal Clock Authority & Assembly Host (worker-sower-conductor)**

The **worker-sower-conductor** (located at worker-sower-engine/src/pipeline/produceEpisode.ts) acts as the local pipeline conductor, temporal clock authority, and optical media assembly host. It bridges semantic dialogue ASTs into physical, broadcast-ready media.

┌────────────────────────────────────────────────────────────────────────┐  
│ RIG 1: THE CONDUCTOR WORKSTATION (produceEpisode.ts)                   │  
├────────────────────────────────────────────────────────────────────────┤  
│ • Hardware Profile: Multi-core CPU, 64 GB System RAM, ZERO GPU VRAM    │  
│ • Roles: Master Acoustic Clock, Duration Quantizer, Optical Assembler  │  
├────────────────────────────────────────────────────────────────────────┤  
│                                                                        │  
│   1\. Input Contract: Ingests validated drafts/dialogue\_ast.json        │  
│                                                                        │  
│   2\. Acoustic Synthesis: Calls local Python TTS microservice (:8000)   │  
│      • Emits uncompressed 48 kHz .wav dialogue stems to local scratch  │  
│                                                                        │  
│   3\. Temporal Quantization (The Master Clock):                         │  
│      • Spawns POSIX child process: ffprobe \-show\_entries format=duration│  
│      • Measures precise duration in milliseconds (D\_ms)                │  
│      • Derives Master Delivery Frames: ceil((D\_ms / 1000\) \* 24\)        │  
│      • Conforms to 3D Causal VAE Stride: targetFrames \= 4 \* ceil(N/4)+1│  
│                                                                        │  
│   4\. Optical Media Assembly (The Remotion Harness):                    │  
│      • Source-bakes immutable React composition (Episode\_XXX.tsx)      │  
│      • Pulls green plates (\#00FF00) from R2; chroma-keys in system RAM │  
│      • Spawns @remotion/renderer CLI using \--gl=swangle (Software GL)  │  
│      • Multiplexes audio stems, foley beds, and camera keyframes       │  
│                                                                        │  
│   5\. Canon Sealing: Drains edge memory deltas; commits to Git ledger   │  
│                                                                        │  
└────────────────────────────────────────────────────────────────────────┘

### **Rig 1 Hardware Demarcation: The Zero-VRAM Invariant**

The conductor runs on **Rig 1**, a machine dedicated to CPU and system RAM workloads with **0 MB of dedicated GPU VRAM**.

Spawning headless Chromium instances (@remotion/renderer) alongside heavy PyTorch diffusion pipelines causes GPU memory contention, OpenGL driver context loss, and operating system OOM kills. Rig 1 isolates all DOM manipulation, web rendering, audio decoding, and software video compositing entirely within multi-threaded CPU memory, reserving external GPU workstations strictly for tensor processing.

### **The Master Acoustic Clock: Why Audio Governs Picture**

In traditional animation, animators create visual keyframes first, forcing audio engineers to stretch, pitch-shift, or cut vocal tracks to fit the visual timeline. In an automated generative workflow, inverting this dependency causes audio drift, broken cadence, and unnatural lip movements.

ACOUSTIC TIME GOVERNANCE WORKFLOW:  
Validated AST Line ──► Local TTS (:8000) ──► ffprobe CLI ──► duration\_ms  
                                                                 │  
                                                                 ▼  
Exposure Sheet ◄── 4n \+ 1 Causal VAE Conformance ◄── ceil((ms / 1000\) \* 24\)

The pipeline enforces an asymmetric testing principle: **fail at the cheapest point of detection**:

Cost(Audio Synthesis)≈\$0.00≪Cost(Video Diffusion)≈\$0.05–\$0.15 / shot

> * **Audio Synthesis is Deterministic & Inexpensive:** Generating an uncompressed 48 kHz .wav dialogue stem via a local neural TTS model on Rig 1 takes \<2 seconds on CPU threads and consumes zero GPU VRAM.  
> * **Video Diffusion is Resource-Intensive:** Running a Wan 2.2 diffusion pass on a 24 GB GPU takes 60 to 180 seconds.  
> * **The Empirical Master Clock:** Dialogue stems are synthesized and written to disk before any visual video rendering tasks are dispatched. The conductor spawns a native POSIX ffprobe process to measure the exact millisecond duration of each audio stem.  
> * **Discrete Frame Quantization:** Delivery frames at 24 fps are calculated using integer ceiling math:  
>   target\_frames=⌈(1000duration\_ms​)×24⌉  
> * **Causal VAE Lattice Conformance:** Because video diffusion models utilize 3D causal VAE architectures that downsample time by a factor of 4, latent arrays require frame counts satisfying *T*pixel​≡1(mod4). The conductor conforms the frame count to this temporal lattice:  
>   diffusion\_allocation=4×⌈4target\_frames−1​⌉+1  
>   This conformed integer is packaged into the execution payload, insulating downstream rendering spokes from temporal pacing calculations.

### **Motivation-Reaction Units (MRUs) Mapped to Timeline Geometry**

The conductor maps dramatic structure directly into timeline coordinates using Dwight Swain’s Motivation-Reaction Unit (MRU) model:

TIMELINE FRAME GEOMETRY (e.g., Shot 03: 96 Total Frames):  
┌───────────────────────────────┬───────────────────────────────┐  
│ CAUSAL PRE-ROLL (Reaction)    │ ACTIVE DIALOGUE (Expression)  │  
├───────────┬───────────────────┼───────────────────────────────┤  
│ Frames    │ Dramatic          │ Physical Presentation         │  
│ 00 \- 05   │ Reflex            │ Character pupil dilation, jaw │  
│ 06 \- 17   │ Processing        │ Hesitation, eye dart to spoon │  
│ 18 \- 23   │ Decision          │ Inhale, weight shift forward  │  
├───────────┴───────────────────┼───────────────────────────────┤  
│ Frames 24 \- 96                │ Spoken Line Delivery (TTS wav)│  
└───────────────────────────────┴───────────────────────────────┘

Instead of placing dialogue at frame 0, the conductor allocates an unvoiced reaction pre-roll (12–24 frames) based on the AST's emotional intensity tags. This ensures characters visually react to a dramatic beat before speaking, preventing sudden, unnatural dialogue starts.

### **Optical Media Assembly (The Remotion Harness)**

Once raw character plates are returned from the rendering foundry, the conductor executes optical compositing via Remotion:

> * **Source-Baking (Episode\_XXX.tsx):** The conductor generates a TypeScript React composition containing explicit layout coordinates, asset paths, and camera keyframes.  
> * **Headless Software Compositing:** The conductor executes the Remotion CLI (@remotion/renderer) within a Node.js child process, explicitly setting \--gl=swangle. This routes OpenGL calls through SwiftShader, performing software rasterization completely within system RAM without initializing GPU driver contexts.  
> * **Chroma-Keying & Tail Trimming:** Remotion keys out the \#00FF00 green background, layers the character over the background plate, aligns audio tracks, and trims the excess (4*n*\+1) padding frames to lock visual actions to dialogue stems.

## **Distributed Edge Coordination (edge-director & ShotCoordinatorDO)**

The **edge-director** operates within Cloudflare's serverless edge environment (workerd), serving as the stateful gateway and concurrency coordinator between orchestration scripts and physical rendering hardware.

┌────────────────────────────────────────────────────────────────────────┐  
│ CLOUDFLARE EDGE WORKER / ANYCAST NETWORK                               │  
│                                                                        │  
│   \[ EdgeGateway (src/index.ts via Hono) \]                              │  
│   • Validates Clerk RS256 JWTs or Service Tokens in \<5ms               │  
│   • Continuity Check: Queries Cloudflare D1 (CANON\_DB) for dirty flags │  
│                                                                        │  
│   \[ ShotCoordinatorDO (Durable Object Actor) \]                         │  
│   • Single-threaded FIFO Queue / Concurrency Mutex                     │  
│   • Monotonic Epoch Fencing Token (N \-\> N+1)                           │  
│   • Autonomous Hardware Watchdog: ctx.storage.setAlarm(+30s)           │  
│   • WebSocket Hibernation API: \$0.00 idle compute during renders       │  
│                                                                        │  
└───────────────────────────────────▲────────────────────────────────────┘  
                                    │ Persistent Outbound WSS  
                                    │ (cloudflared encrypted tunnel)  
┌───────────────────────────────────┴────────────────────────────────────┐  
│ RIG 2: LOCAL FOUNDRY SPOKE                                             │  
│                                                                        │  
│   \[ media-broker daemon on port 3000 \]                                 │  
│   • Holds OS-level flock on /var/lock/rig2\_gpu.lock                    │  
│   • Polls nvidia-smi to verify baseline free VRAM (\>21 GB)             │  
│   • Controls Headless ComfyUI on 127.0.0.1:8188 via loopback IPC       │  
│                                                                        │  
└────────────────────────────────────────────────────────────────────────┘

### **EdgeGateway Ingress Validation**

All incoming HTTP and WebSocket dispatch requests terminate at the EdgeGateway:

> * **Cryptographic Perimeter:** Inbound requests present a signed Clerk JWT or a Cloudflare Access Service Token, verified within sub-5ms.  
> * **Continuity Enforcement (Cloudflare D1):** Before routing a job forward, the gateway queries the D1 database to ensure the target scene has no unresolved dependency flags (is\_dirty \== 0). If an upstream narrative edit invalidated the scene, the gateway rejects the request with HTTP 412 Precondition Failed, preventing compute expenditure on stale story beats.

### **Concurrency Coordination via ShotCoordinatorDO**

Verified requests are forwarded to the ShotCoordinatorDO Durable Object, which implements an actor-based concurrency control plane:

> * **Single-Threaded FIFO Queue:** Consumer GPUs lack hardware virtualization to partition memory dynamically across simultaneous diffusion jobs. The Durable Object serializes rendering tasks into an ordered FIFO queue, preventing multiple jobs from colliding on physical hardware.  
> * **Dynamic Rolling Leases:** To avoid premature job cancellations on long-running diffusion passes (60–180 seconds), the coordinator issues dynamic, heartbeat-renewed 30-second leases instead of rigid static timeouts.

### **Monotonic Epoch Fencing & Watchdog Mechanics**

Distributed rendering pipelines are vulnerable to the **Split-Brain Zombie Runner Hazard**: if network jitter severs the link between the edge and the local worker, the edge coordinator may assume the worker crashed, revoke its lease, and assign the job to another machine. If the original worker eventually reconnects and uploads its render, it can overwrite valid production assets with stale data.

EDGE COORDINATOR (DO)                               FOUNDRY WORKER (Rig 2\)  
        │                                                     │  
        ├────── Dispatch Lease: Epoch N ─────────────────────►│ (Starts diffusion)  
        │                                                     │  
        │   x──── Network Partition (\>30s) ────x              │ (Still rendering)  
        │                                                     │  
        ├─ Watchdog Alarm Fires: Epoch N \-\> N+1               │  
        ├─ Lease Reassigned to Worker B                       │  
        │                                                     │  
        │   x──── Network Restores ────────────x              │  
        │                                                     │  
        │◄───── Commit RPC: Epoch N (Stale) ──────────────────┤ (Uploads MP4)  
        │                                                     │  
        ├─ Assert Epoch N \== N+1 \-\> MISMATCH                  │  
        └─ REJECT COMMIT (HTTP 409 Conflict) ────────────────►│  
           (Canonical manifest protected; zombie bytes purged)

The ShotCoordinatorDO resolves this through **Monotonic Epoch Fencing**:

> 1. Every time an execution lease is granted, the coordinator increments its internal epoch counter (*N*→*N*\+1).  
> 2. This counter is stamped onto the dispatch packet as an immutable fencing token.  
> 3. The coordinator sets an autonomous hardware alarm in edge transactional storage:  
>    await this.ctx.storage.setAlarm(Date.now() \+ 30000);

4\. When the local worker completes rendering, its commit RPC must present this fencing token. 5\. If the lease expired and the epoch advanced, the commit is rejected with HTTP 409 Conflict. The orphaned output files in staging are ignored by the production manifest and cleaned up by Cloudflare R2's automated 7-day lifecycle retention policy.

### **The WebSocket Hibernation Layer**

Standard cloud servers charge continuous compute fees to keep TCP connections open while waiting for long diffusion jobs to finish.

Cloudflare's **WebSocket Hibernation API** avoids these costs:

> * When media-broker or client cockpits open a WebSocket connection, the Durable Object calls:  
>   this.ctx.acceptWebSocket(webSocket, \[role\]);

> * Once the current execution frame completes, Cloudflare’s hypervisor pauses the Durable Object and evicts its V8 isolate from active memory.  
> * The Anycast network holds the raw TCP socket open at the network perimeter.  
> * While the GPU Foundry spends minutes running tensor diffusion, the edge coordinator incurs **\$0.00 in idle CPU duration charges**.  
> * When a heartbeat, progress update, or completion packet arrives over the tunnel, the edge wakes the Durable Object in \<2 ms to handle the event before re-entering hibernation.

## **The Physical Silicon Driver & Execution Spoke (media-broker on Rig 2\)**

The **media-broker** (running as a local daemon on **Rig 2**) serves as the hardware-level bridge between the Cloudflare Edge and the physical graphics card. It manages local GPU memory, executes turn-based model evictions, enforces process stability, and streams completion artifacts.

┌────────────────────────────────────────────────────────────────────────┐  
│                        DATA PLANE ARCHITECTURE                         │  
│                    RIG 2: media-broker (Port 3000\)                     │  
├────────────────────────────────────────────────────────────────────────┤  
│                                                                        │  
│   UNIFIED TASK INGRESS (Pull Semantics)                                │  
│   \[ Outbound WSS / Cloudflare Tunnel \]  OR  \[ /var/spool/renders FIFO \]│  
│                       │                               │                │  
│                       └───────────────┬───────────────┘                │  
│                                       ▼                                │  
│   1\. HARDWARE SOVEREIGNTY LOCK                                         │  
│      • OS-Level flock on GPU interface (/var/lock/rig2\_gpu.lock)       │  
│      • Continuous Baseline VRAM Audit (nvidia-smi check \>21GB free)    │  
│                                       │                                │  
│                                       ▼                                │  
│   2\. MULTI-MODAL TURN-BASED EXECUTION ENGINE                           │  
│      ┌──────────────────────────────────────────────────────────────┐  │  
│      │ Turn 1: Text AST (Qwen 2.5 14B GGUF)                         │  │  
│      │         POST http://127.0.0.1:8188/free                      │  │  
│      ├──────────────────────────────────────────────────────────────┤  │  
│      │ Turn 2: Audio Synthesis (ComfyUI TTS)                        │  │  
│      │         POST http://127.0.0.1:8188/free                      │  │  
│      ├──────────────────────────────────────────────────────────────┤  │  
│      │ Turn 3: Video Latent Diffusion (Wan 2.2 \#00FF00 Plate)       │  │  
│      │         POST http://127.0.0.1:8188/free                      │  │  
│      └──────────────────────────────────────────────────────────────┘  │  
│                       │                               │                │  
│     Telemetry / Heartbeats                            │ Completion     │  
│     (Thread-Isolated Loop)                            ▼ Sentinel       │  
│   • Asynchronous Timer                3\. LOCAL SCRATCH VALIDATION      │  
│   • BROKER\_HEARTBEAT (every 10s)         • Assert size \> 0 & non-empty │  
│   • ws://127.0.0.1:8188/ws tapping       • ffprobe container decode    │  
│   • Telemetry relay up tunnel                         │                │  
│                                                       ▼                │  
│                                       4\. DIRECT ZERO-EGRESS SYNC       │  
│                                          • SHA-256 Content Addressing  │  
│                                          • Cloudflare R2 Upload (AWS)  │  
│                                          • Monotonic Epoch RPC Commit  │  
│                                                                        │  
└────────────────────────────────────────────────────────────────────────┘

### **Hardware Specifications & Isolation Boundaries**

> * **Target Hardware:** Consumer/workstation GPU silicon (NVIDIA RTX 3090, RTX 4090, or RTX 5070 with 24 GB of dedicated VRAM) running CUDA 12.x and PyTorch.  
> * **Exclusive VRAM Usage:** 100% of the 24 GB memory pool is dedicated to model inference and K-sampling.  
> * **Process Quarantine:** Headless Chromium rendering, audio synthesis daemons, and database drivers are banned from Rig 2, eliminating CPU/GPU driver memory contention.

### **Inverted Mutex Sovereignty & The OS-Level flock**

In naive distributed rendering patterns, a cloud coordinator pushes commands down to local workers, asserting remote control over the GPU. Under real-world network conditions, this introduces the **Two-Queue Collision Hazard**: if network latency delays a heartbeat, the cloud coordinator revokes the lease and reassigns the job, while the local card continues rendering. When connectivity returns, competing tasks attempt concurrent tensor allocations on the same card, causing an unrecoverable CUDA Out-Of-Memory (OOM) crash.

To eliminate this vulnerability, the system inverts the authority hierarchy:

Remote DO⟶Logical Request Queue⟶Local media-broker⟶OS flock⟶GPU Silicon  
// media-broker/src/hardware/gpuLock.ts  
import fs from "node:fs";  
import fcntl from "fs-ext"; // Native POSIX flock bindings

export class GpuHardwareMutex {  
  private lockFd: number | null \= null;  
  private readonly lockFilePath \= "/var/lock/rig2\_gpu.lock";

  public acquireLock(): boolean {  
    if (this.lockFd \!== null) return true; // Already acquired locally

    try {  
      this.lockFd \= fs.openSync(this.lockFilePath, "w");  
      // LOCK\_EX: Exclusive Lock, LOCK\_NB: Non-Blocking system call  
      fcntl.flockSync(this.lockFd, "exnb");  
      return true;  
    } catch (err: any) {  
      if (err.code \=== "EAGAIN" || err.code \=== "EWOULDBLOCK") {  
        return false; // Hardware is actively occupied by a local process  
      }  
      throw new Error(\`\[GpuMutex\] Kernel failure acquiring GPU lock: \${err.message}\`);  
    }  
  }

  public releaseLock(): void {  
    if (this.lockFd \=== null) return;  
    fcntl.flockSync(this.lockFd, "un");  
    fs.closeSync(this.lockFd);  
    this.lockFd \= null;  
  }  
}

> * **Local Kernel Lock Sovereignty:** The media-broker maintains an unconditional, OS-level advisory lock (flock) on /var/lock/rig2\_gpu.lock.  
> * **Pull-Only Scheduling:** The edge Durable Object is treated strictly as a passive FIFO queue. The broker claims a task from the edge *only after* acquiring the local flock and verifying that the graphics card is idle.  
> * **Single Mutex Reality:** There is only one hardware lock in the system, and it lives locally on Rig 2\. An upstream edge timeout or network drop cannot force execution onto an actively rendering GPU.

### **The Anti-Ollama Paradigm & Native ComfyUI Execution**

Running independent background LLM services (such as Ollama or vLLM on port 11434\) alongside ComfyUI creates severe memory contention on a 24 GB card:

> * Ollama retains model weights in VRAM across a default 5-minute keep-alive window.  
> * ComfyUI’s internal dynamic cache manager cannot inspect, coordinate, or evict memory held by a separate OS process.  
> * If video diffusion latents are allocated while Ollama holds 10 GB of VRAM, PyTorch encounters a memory allocation failure and crashes.

Under the **Anti-Ollama Paradigm**, all multi-modal generative models executed on Rig 2 run within ComfyUI's unified computational graph using extensions like ComfyUI-GGUF:

> * ComfyUI holds exclusive access to the GPU's memory address space.  
> * LLMs (e.g., Qwen 2.5 14B GGUF) and diffusion models exist within the same memory manager, allowing the runtime to map, track, and purge weights dynamically without leaving orphaned background allocations.

### **The Sequential Turn-Based Flush Protocol**

To execute multi-modal synthesis without exceeding the 24 GB hardware ceiling, the media-broker partitions workloads into three non-overlapping execution turns:

TURN 1: Text AST (Qwen 14B GGUF \~10 GB) ──► POST /free ──► nvidia-smi verify \>21 GB free  
TURN 2: Speech Stems (TTS \~5 GB)        ──► POST /free ──► nvidia-smi verify \>21 GB free  
TURN 3: Video Latents (Wan 2.2 \~21 GB)   ──► POST /free ──► Clean baseline restored

> 1. **Turn 1 (Text AST Generation):** ComfyUI loads the Qwen 2.5 14B GGUF model into VRAM (∼9–10 GB), processes scene context, generates dialogue\_ast.json, and halts.  
> 2. **First Hard Memory Flush:** The broker calls POST \[http://127.0.0.1:8188/free\](http://127.0.0.1:8188/free) with { unload\_models: true, free\_memory: true }, releasing model pointers and dropping memory back to baseline in ∼300ms.  
> 3. **Turn 2 (Acoustic Synthesis & Quantization):** ComfyUI loads the neural speech synthesis model (∼4–6 GB VRAM), synthesizes the .wav stems, calculates audio durations, and derives the integer frame budget.  
> 4. **Second Hard Memory Flush:** A second POST /free call clears the speech models and vocoder checkpoints from VRAM.  
> 5. **Turn 3 (Temporal Video Diffusion):** The full 24 GB of VRAM is allocated to Wan 2.2 and character LoRAs to sample the uncompressed character plate against a solid \#00FF00 green background.

### **Asynchronous /free Semantics & Subprocess Verification**

A major operational vulnerability in basic orchestration scripts is treating HTTP POST /free as a synchronous call. In ComfyUI, /free returns HTTP 200 OK almost instantly while delegating tensor unmapping and CUDA deallocation to an asynchronous background worker thread. Submitting a heavy diffusion graph immediately after receiving HTTP 200 OK results in overlapping allocations and an immediate CUDA crash.

The media-broker enforces a strict verification gate:

> * **Out-of-Band Hardware Telemetry:** Because heavy PyTorch operations can block Python's Global Interpreter Lock (GIL) and stall ComfyUI's internal HTTP endpoints, the broker samples driver state directly by spawning an isolated POSIX subprocess:  
>   nvidia-smi \--id=0 \--query-gpu=memory.free,utilization.gpu \--format=csv,noheader,nounits

> * **Relative Baseline Recovery:** Rather than enforcing a brittle, hardcoded threshold (e.g., free\_vram \> 21 GB), which fails if a host desktop compositor consumes 1.2 GB of VRAM, the broker calibrates against the machine's initial idle boot baseline (Baselinefree​). It clears execution only when:  
>   Currentfree​≥(Baselinefree​−500 MB)  
> * **Watchdog Circuit Breaker:** The broker polls memory every 250ms with a strict 15-second timeout. If memory fails to clear within 15 seconds—indicating a hung CUDA stream or a circular tensor reference leak—the broker trips a circuit breaker and initiates a process restart.

### **Virtual Memory Defragmentation & Process Recycling**

Over continuous multi-hour rendering schedules, PyTorch’s caching allocator (cudaMalloc/cudaFree) accumulates virtual memory fragmentation. When cycling between 1D audio sample arrays, variable-token text sequences, and 5D spatio-temporal video latents (\[*B*,*C*,*T*,*H*,*W*\]), the heap becomes divided into scattered free blocks.

PHYSICAL VRAM HEAP (Reported: 21.5 GB Free Space)  
┌───────┬────────────┬───────┬────────────┬───────┬────────────┬───────┐  
│ Alloc │    Free    │ Alloc │    Free    │ Alloc │    Free    │ Alloc │  
│ 128MB │   4.2 GB   │ 64MB  │   3.8 GB   │ 256MB │   5.1 GB   │ 32MB  │  
└───────┴────────────┴───────┴────────────┴───────┴────────────┴───────┘  
❌ Wan 2.2 Latent Allocation: REQUIRES 14.0 GB CONTIGUOUS ADDRESS BLOCK\!  
💥 CUDA OOM: Allocator fails to find a single contiguous block\!

When Wan 2.2 attempts to initialize its attention matrices, it requires an unbroken contiguous physical address block (e.g., ≥14.0 GB). If the largest contiguous block is only 5.1 GB, PyTorch throws an out-of-memory error despite nvidia-smi reporting over 21 GB of cumulative free space.

To maintain heap hygiene:

> * **Stage-Level Batching:** The broker avoids naive per-shot model cycling. It batches tasks by stage: generating all dialogue ASTs for a scene in one pass, clearing memory once, synthesizing all audio stems, clearing memory again, and rendering all video diffusion plates back-to-back.  
> * **The 25-Shot Process Recycling Governor:** Every **25 completed shots**, or upon crossing major stage boundaries, the media-broker gracefully terminates and relaunches the headless ComfyUI child process. Terminating the host Python process forces the operating system kernel and NVIDIA display driver (nvidia.ko) to completely unmap active CUDA context tables, restoring a clean, unfragmented 24 GB physical address space.

## **Transport, Telemetry, and Cryptographic Asset Egress**

The communication backbone connecting **edge-director** and **media-broker** operates over an authenticated, inside-out network topology that keeps local workstation ports unexposed while streaming real-time telemetry and notarized assets.

┌──────────────────┬───────────┬──────────────────────────────────────────┬────────────────────────────────────────────────────────┐  
│ Packet Type      │ Direction │ Key Payload Properties                   │ Operational Purpose                                    │  
├──────────────────┼───────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤  
│ EXECUTE\_JOB      │ Down      │ targetFrames, prompt, sampling, loras    │ Dispatches rendering parameters conformed to 4n+1 \[1,3\]│  
├──────────────────┼───────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤  
│ ABORT\_JOB        │ Down      │ taskId, epoch, reason                    │ Triggers POST /interrupt and drops active render \[1, 3\]│  
├──────────────────┼───────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤  
│ BROKER\_HEARTBEAT │ Up        │ epoch, vramFreeMb, activeLocalNode       │ Emitted every 10s; extends edge lease watchdog \[1, 3\]  │  
├──────────────────┼───────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤  
│ BROKER\_PROGRESS  │ Up        │ step, totalSteps, percentage, etaSeconds │ Tapped from loopback WS; broadcast to viewports \[1, 3\] │  
├──────────────────┼───────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤  
│ BROKER\_COMPLETE  │ Up        │ sha256, byteLength, stagingKey           │ Triggers atomic promotion gate in edge DO \[1, 3\]       │  
├──────────────────┼───────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤  
│ BROKER\_ERROR     │ Up        │ category (CUDA\_OOM, etc.), message       │ Classifies failure; trips edge circuit breaker \[1, 3\]  │  
└──────────────────┴───────────┴──────────────────────────────────────────┴────────────────────────────────────────────────────────┘

### **Inside-Out Network Topology: The Zero-Inbound Rule**

Native ComfyUI runs an unauthenticated aiohttp web server on port 8188 that lacks native user authentication or rate limiting. Directly opening router ports to expose port 8188 to the public internet presents severe Remote Code Execution (RCE) and directory traversal risks.

Rig 2 eliminates this vulnerability through an **inside-out topology**:

> * **Zero Open Inbound Ports:** The local firewall and router reject all incoming WAN connections; ports 8188 and 3000 bind strictly to 127.0.0.1.  
> * **Encrypted Outbound Tunnel (cloudflared):** Rig 2 initiates an outbound-only TCP/QUIC tunnel to Cloudflare’s edge. All routing, NAT traversal, and connection keep-alives are handled over this outbound pipe.  
> * **Persistent Outbound WebSocket Client:** The media-broker connects upward as a WebSocket client (wss://.../ws?role=broker). Task specifications, leases, and abort signals are pulled down through this established outbound socket.

### **Wire Framing & Envelope Protocol**

Telemetry and dispatch messages conform to strict TypeScript discriminated unions:

export interface BaseWirePacket\<T extends string, P \= unknown\> {  
  type: T;  
  version: "1.0.0";  
  correlationId: string; // UUIDv7 matching the distributed trace\_id  
  taskId: string;  
  epoch: number;         // Monotonic fencing token (Epoch N)  
  timestampMs: number;  
  payload: P;  
}

> * **Binary Preview Isolation:** ComfyUI’s internal WebSocket bus emits binary frames containing intermediate latent image previews during sampling passes. The broker intercepts and drops these binary packets at 127.0.0.1, transmitting only structured JSON text frames up the tunnel to avoid saturating bandwidth and waking the hibernated Durable Object unnecessarily.  
> * **Loopback Telemetry Tapping:** The broker taps ComfyUI's local socket (ws://127.0.0.1:8188/ws), translating raw internal node events (execution\_start, progress, executing) into normalized BROKER\_PROGRESS packets that are relayed up the tunnel and broadcast to remote client viewports.  
> * **Thread-Isolated Heartbeat Loop:** An asynchronous background timer on Rig 2 emits BROKER\_HEARTBEAT every 10 seconds containing the active fencing token back to edge-director, resetting the edge DO's 30-second watchdog alarm (ctx.storage.setAlarm()) during long diffusion passes.

### **Cryptographic Asset Egress & The Atomic Promotion Gate**

When ComfyUI completes diffusion, it emits its completion sentinel: { "executing": { "node": null } }. The broker intercepts this event and executes an on-disk integrity audit before uploading the artifact or contacting the edge:

\[ ComfyUI Completion Sentinel: { node: null } \]  
                       │  
                       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ LOCAL SCRATCHPAD INTEGRITY AUDIT (Rig 2\)                               │  
│                                                                        │  
│ 1\. Assert Byte Length: stat.size \> 0                                   │  
│ 2\. Empty-File Hash Trap: Assert SHA-256 \!= e3b0c44298fc1c...b855       │  
│ 3\. ffprobe Binary Verification:                                        │  
│    • Validate container moov atom integrity                            │  
│    • Assert decoded stream frames \== targetFrames (at 24 fps)          │  
└──────────────────────────────────────┬─────────────────────────────────┘  
                                       │ Verification Passes  
                                       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ DIRECT STORAGE EGRESS (Cloudflare R2 via @aws-sdk/client-s3)           │  
│                                                                        │  
│ • Key: staging/renders/\${taskId}/epoch\_\${epoch}\_\${sha256}.mp4          │  
│ • Zero Egress Fees (\$0.00 bandwidth cost across Cloudflare network)    │  
└──────────────────────────────────────┬─────────────────────────────────┘  
                                       │ Upload Completes Cleanly  
                                       ▼  
┌────────────────────────────────────────────────────────────────────────┐  
│ PROMOTION COMMIT RPC (POST /tasks/complete)                            │  
│                                                                        │  
│ Payload: { taskId, epoch, sha256, stagingKey, renderedFrames }        │  
│                                                                        │  
│ ShotCoordinatorDO Evaluates Monotonic Fencing:                         │  
│   IF (incoming.epoch \== active.epoch):                                 │  
│      • Write asset pointer to canonical production manifest            │  
│      • Release Single-Threaded Hardware Mutex                          │  
│      • Broadcast SHOT\_READY { seq, signed\_url } to Rig 1 Conductor     │  
│      • Return HTTP 200 OK (media-broker releases local flock)          │  
│   ELSE (incoming.epoch \< active.epoch):                                │  
│      • REJECT WITH HTTP 409 CONFLICT (Zombie Runner Rejection)         │  
│      • Staged bytes ignored; purged by R2 7-day lifecycle policy       │  
└────────────────────────────────────────────────────────────────────────┘

> 1. **Defensive Scratchpad Audit:**  
   * **Byte Length Verification:** The broker inspects the output video file in ComfyUI/output/ and asserts that byteLength \> 0\.  
   * **The Empty-File Hash Trap:** The broker computes the SHA-256 hash of the binary file and asserts that it does not match the empty-string constant:  
     SHA-256(∅)=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
     Catching this constant prevents zero-byte files from propagating into downstream production manifests.  
   * **Frame Lattice Audit (ffprobe):** The broker spawns a POSIX ffprobe process to confirm that the MP4 moov atom is valid and that the decoded stream's frame count matches the conformed targetFrames value.  
> 2. **Content-Addressed Staging Upload:**  
   * The broker streams the binary to Cloudflare R2 using AWS S3-compatible SDK bindings.  
   * To prevent unvalidated writes from corrupting production assets, the file is uploaded to an epoch-scoped staging key: staging/renders/\${taskId}/epoch\_\${epoch}\_\${sha256}.mp4  
> 3. **The Atomic Promotion RPC:**  
   * The broker issues an authenticated RPC to ShotCoordinatorDO via POST /tasks/complete.  
   * The Durable Object validates that the packet’s epoch matches its active lease counter.  
   * If valid, the staging key is promoted to the canonical production manifest, the hardware mutex is released, and SHOT\_READY is broadcast to Rig 1\. Rig 1 downloads the plate under Cloudflare R2's **\$0.00 egress fee guarantee** and passes it to Remotion.  
   * If the epoch is stale, the commit is rejected with HTTP 409 Conflict, leaving unindexed zombie bytes to be deleted by R2's automated lifecycle rules.

### **Offline Autonomy & Zero Code-Path Divergence**

The pipeline satisfies the **Deletion Principle** by ensuring that physical production can proceed during an internet outage or Cloudflare network disruption:

> * **Zero Code-Path Divergence:** The fallback path uses the exact same execution logic as the online path. Workflow template hydration, parameter injection, turn-based VRAM flushes (POST /free), and output verification routines run through identical code paths.  
> * **Filesystem Ingress Switching (/var/spool/renders):** If the outbound Cloudflare Tunnel disconnects, the broker redirects its polling loop from the remote WebSocket to a local POSIX directory: /var/spool/renders/\*.json.  
> * **Local Offline Archival:** In offline mode, rendered plates are audited, hashed, and committed directly to a local content-addressed directory on Rig 2's scratch disk.  
> * **Automatic Re-sync Upon Reconnection:** When the outbound tunnel reconnects, media-broker drains its local completion queue, updates the remote D1 ledger, and resumes pulling tasks from the edge coordinator without dropping frames or requiring manual database reconciliation.

## **Architectural Authority Matrix**

The distribution of authority across the end-to-end pipeline enforces a separation of concerns across physical machines and network boundaries:

| System Vector | Narrative Sower (worker-sower-engine) | Temporal Conductor (worker-sower-conductor) | Edge Coordinator (edge-director) | Silicon Driver (media-broker) |
| :---- | :---- | :---- | :---- | :---- |
| **Physical Host** | Cloudflare Edge / Rig 1 | **Rig 1** (CPU & System RAM) | **Cloudflare Edge** (workerd DO) | **Rig 2** (GPU Tensor Foundry) |
| **Hardware Resources** | Epistemological logic, 0 MB VRAM | Multi-core CPU, 0 MB dedicated VRAM | Serverless V8 Isolate, 0 MB VRAM | Dedicated 24 GB GPU VRAM (RTX 4090\) |
| **Primary Mandate** | Event-sourced narrative truth (*Sn*​→*Sn*\+1​) | Master Acoustic Clock & Remotion assembly | Centralized Mutex & Monotonic Leases | Physical silicon driver & VRAM hygiene |
| **Temporal Logic** | Zero temporal awareness (Untimed AST) | Derives 24 fps integers via ffprobe | Blind to duration (Passes scalar int) | Dumb Executor: Samples conformed frames |
| **Hardware Mutex** | None | None | Single-threaded FIFO DO Actor Mutex | OS-level advisory flock on GPU |
| **VRAM Management** | None | None | None | Turn-based POST /free & nvidia-smi gates |
| **Asset Storage** | Git commits for canon updates (gitSealer.ts) | Mounts local .wav and signed R2 URLs | Promotes R2 keys into canonical manifest | Streams raw .mp4 to R2 staging keys |
| **Failure Response** | Halts at *T*0​ via invariant checkers | Retries TTS; isolates missing assets | Alarm trips (+30s); rejects stale epochs | Tripping circuit breaker; process recycle |

---
